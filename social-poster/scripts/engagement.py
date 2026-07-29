#!/usr/bin/env python3
"""Social Poster - per-post engagement snapshots.

Fetches like/comment/repost counts for published targets and appends them to
the ``engagement_snapshots`` table. The point is a feedback loop for the
yearly tag audit: which tag sets / hubs correlate with engagement is currently
guesswork because nothing records outcomes.

Snapshots are taken on demand (the "Refresh stats" button in the UI, or
running this module directly). Only targets that are 'posted' AND have a
``remote_id`` (captured at publish time) can be fetched — posts published
before remote_id existed are skipped.
"""

import json
from typing import Dict, List, Optional

try:
    from . import db, platforms
except ImportError:  # Allows running directly as `python engagement.py`.
    import db
    import platforms


def fetch_instagram_engagement(creds: Dict, media_id: str) -> Dict:
    """Fetch like/comment counts for one Instagram media via the Graph API."""
    import requests

    resp = requests.get(
        f"{platforms.INSTAGRAM_GRAPH_BASE}/{media_id}",
        params={
            "fields": "like_count,comments_count",
            "access_token": creds["access_token"],
        },
        timeout=30,
    )
    if not resp.ok:
        raise RuntimeError(platforms._instagram_graph_error(resp))
    data = resp.json()
    return {
        "likes": data.get("like_count"),
        "comments": data.get("comments_count"),
        "reposts": None,  # Instagram doesn't expose share counts here.
    }


def fetch_bluesky_engagement(creds: Dict, uri: str) -> Dict:
    """Fetch like/reply/repost counts for one Bluesky post by at:// URI."""
    client, _ = platforms._bluesky_login(creds)
    posts = client.get_posts([uri]).posts
    if not posts:
        raise RuntimeError("Bluesky: post not found (deleted?)")
    post = posts[0]
    return {
        "likes": post.like_count,
        "comments": post.reply_count,
        "reposts": (post.repost_count or 0) + (post.quote_count or 0),
    }


def snapshot_targets(post_id: Optional[int] = None) -> List[Dict]:
    """Snapshot engagement for published targets; return per-target results.

    Args:
        post_id: Limit to one post's targets; ``None`` snapshots everything
            posted. Each target is fetched independently so one API failure
            never blocks the rest.

    Returns a list of ``{"target_id", "platform", "username", "ok",
    "error"}`` dicts describing what happened per target.
    """
    conn = db.get_connection()
    try:
        query = """
            SELECT pt.id AS target_id, pt.post_id AS post_id,
                   pt.remote_id AS remote_id,
                   a.platform AS platform, a.username AS username,
                   a.credentials AS credentials
            FROM post_targets pt
            JOIN accounts a ON a.id = pt.account_id
            WHERE pt.status = 'posted' AND pt.remote_id IS NOT NULL
        """
        params = ()
        if post_id is not None:
            query += " AND pt.post_id = ?"
            params = (post_id,)
        rows = conn.execute(query + " ORDER BY pt.id", params).fetchall()
    finally:
        conn.close()

    results: List[Dict] = []
    for row in rows:
        result = {
            "target_id": row["target_id"],
            "platform": row["platform"],
            "username": row["username"],
            "ok": True,
            "error": None,
        }
        try:
            creds = json.loads(row["credentials"])
            if row["platform"] == "instagram":
                metrics = fetch_instagram_engagement(creds, row["remote_id"])
            else:
                metrics = fetch_bluesky_engagement(creds, row["remote_id"])
            _record_snapshot(row, metrics)
        except Exception as exc:  # noqa: BLE001 - isolate failures per target.
            result["ok"] = False
            result["error"] = str(exc)[:500]
        results.append(result)
    return results


def _record_snapshot(row, metrics: Dict) -> None:
    """Append one engagement snapshot row."""
    conn = db.get_connection()
    try:
        conn.execute(
            "INSERT INTO engagement_snapshots "
            "(post_id, target_id, platform, username, remote_id, "
            " likes, comments, reposts, recorded_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                row["post_id"],
                row["target_id"],
                row["platform"],
                row["username"],
                row["remote_id"],
                metrics.get("likes"),
                metrics.get("comments"),
                metrics.get("reposts"),
                db.utc_now_iso(),
            ),
        )
        conn.commit()
    finally:
        conn.close()


def main() -> None:
    """Snapshot every published target and print a one-line summary."""
    db.init_db()
    results = snapshot_targets()
    ok = sum(1 for r in results if r["ok"])
    failed = [r for r in results if not r["ok"]]
    print(f"engagement: {ok}/{len(results)} targets snapshotted")
    for r in failed:
        print(f"engagement: target {r['target_id']} ({r['platform']}) "
              f"FAILED: {r['error']}")


if __name__ == "__main__":
    main()
