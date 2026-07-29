#!/usr/bin/env python3
"""Social Poster - publisher entrypoint.

Run once per minute by a systemd timer. Finds every scheduled post target
whose post is due (scheduled_at <= now, UTC) and attempts to publish it to
its target platform. Each target is processed independently so one failure
never blocks the others.
"""

import json

try:
    from . import db
    from . import platforms
    from . import queue_watch
except ImportError:  # Allows running directly as `python publisher.py`.
    import db
    import platforms
    import queue_watch

# The set of target columns every publish path needs. Shared so the scheduled
# (time-based) and send-now (single-post) queries select the exact same shape.
_TARGET_SELECT = """
    SELECT pt.id AS target_id,
           pt.post_id AS post_id,
           p.image_filename AS image_filename,
           p.ig_image_filename AS ig_image_filename,
           pt.caption AS caption,
           a.platform AS platform,
           a.username AS username,
           a.credentials AS credentials
    FROM post_targets pt
    JOIN posts p ON p.id = pt.post_id
    JOIN accounts a ON a.id = pt.account_id
"""


def main() -> None:
    """Publish all due, still-scheduled post targets, then check queue depth."""
    db.init_db()
    conn = db.get_connection()
    now = db.utc_now_iso()

    try:
        # Timestamps share the exact same zero-padded UTC format, so a
        # lexicographic comparison is also a chronological one.
        rows = conn.execute(
            _TARGET_SELECT
            + "WHERE pt.status = 'scheduled' AND p.scheduled_at <= ? "
            "ORDER BY p.scheduled_at, pt.id",
            (now,),
        ).fetchall()
    finally:
        conn.close()

    if rows:
        _publish_rows(rows)
    else:
        print("publisher: no due targets")

    # Runs on every tick, not just after a publish — deleting queued posts
    # drains an account's queue too. It swallows its own errors, so a failed
    # notification never looks like a publishing failure.
    queue_watch.check_and_notify()


def publish_post(post_id: int) -> None:
    """Publish a single post's still-scheduled targets immediately.

    Used by the "Send now" action so the post goes out on click instead of
    waiting for the next scheduler tick. Ignores scheduled_at — if a target is
    still 'scheduled', it is sent now.
    """
    db.init_db()
    conn = db.get_connection()
    try:
        rows = conn.execute(
            _TARGET_SELECT
            + "WHERE pt.status = 'scheduled' AND pt.post_id = ? "
            "ORDER BY pt.id",
            (post_id,),
        ).fetchall()
    finally:
        conn.close()

    _publish_rows(rows)


def publish_target(target_id: int) -> None:
    """Publish a single post_target immediately, if it is still scheduled.

    Backs the per-account "Send now"/"Retry" action so one account's record can
    be sent on its own. Ignores scheduled_at.
    """
    db.init_db()
    conn = db.get_connection()
    try:
        rows = conn.execute(
            _TARGET_SELECT
            + "WHERE pt.status = 'scheduled' AND pt.id = ?",
            (target_id,),
        ).fetchall()
    finally:
        conn.close()

    _publish_rows(rows)


def _publish_rows(rows) -> None:
    """Attempt each target row independently; one failure never blocks the rest."""
    for row in rows:
        target_id = row["target_id"]
        platform = row["platform"]
        # Instagram enforces an aspect range Bluesky doesn't, so it posts the
        # cropped variant when the user made one; every other platform (and an
        # uncropped Instagram post) uses the original.
        filename = row["image_filename"]
        if platform == "instagram" and row["ig_image_filename"]:
            filename = row["ig_image_filename"]
        image_path = str(db.IMAGES_DIR / filename)

        try:
            creds = json.loads(row["credentials"])
            remote_id = platforms.post(platform, creds, image_path, row["caption"])
        except Exception as e:  # noqa: BLE001 - isolate failures per target.
            error = str(e)[:500]
            _update_target(target_id, "failed", error=error)
            _log_attempt(row, "failed", error=error)
            print("publisher: target {0} ({1}) FAILED: {2}".format(
                target_id, platform, error))
        else:
            _update_target(target_id, "posted", posted_at=db.utc_now_iso(),
                           remote_id=remote_id)
            _log_attempt(row, "posted")
            print("publisher: target {0} ({1}) posted".format(
                target_id, platform))


def _update_target(target_id, status, error=None, posted_at=None, remote_id=None):
    """Update a single post_targets row's status/error/posted_at/remote_id."""
    conn = db.get_connection()
    try:
        conn.execute(
            "UPDATE post_targets SET status = ?, error = ?, posted_at = ?, "
            "remote_id = ? WHERE id = ?",
            (status, error, posted_at, remote_id, target_id),
        )
        conn.commit()
    finally:
        conn.close()


def _log_attempt(row, status, error=None):
    """Append one publish attempt to the audit log (never blocks publishing)."""
    conn = db.get_connection()
    try:
        conn.execute(
            "INSERT INTO publish_log "
            "(post_id, target_id, platform, username, status, error, "
            " image_filename, caption, attempted_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                row["post_id"],
                row["target_id"],
                row["platform"],
                row["username"],
                status,
                error,
                row["image_filename"],
                row["caption"],
                db.utc_now_iso(),
            ),
        )
        conn.commit()
    finally:
        conn.close()


if __name__ == "__main__":
    main()
