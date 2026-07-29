#!/usr/bin/env python3
"""Social Poster - publisher entrypoint.

Run once per minute by a systemd timer. Finds every scheduled post target that
is due and attempts to publish it to its target platform. Each target is
processed independently so one failure never blocks the others.

A target's due time is its post's ``scheduled_at`` plus its own
``delay_minutes``. The offset exists for Reddit: submitting one photo to
several subreddits in the same minute is the classic spam signature, and
several photo subs auto-remove for it. Storing an offset rather than an
absolute per-target time means rescheduling a post slides its whole stagger.

The arithmetic is deliberately done in Python, not SQL: ``db.UTC_FORMAT``
timestamps compare lexicographically (which is what the scheduled_at query
relies on), while SQLite's own ``datetime()`` emits a different format that
would silently break that ordering.
"""

import json
from datetime import datetime, timedelta

try:
    from . import db
    from . import platforms
    from . import queue_watch
    from . import subreddits as subreddits_module
except ImportError:  # Allows running directly as `python publisher.py`.
    import db
    import platforms
    import queue_watch
    import subreddits as subreddits_module

# The set of target columns every publish path needs. Shared so the scheduled
# (time-based) and send-now (single-post) queries select the exact same shape.
_TARGET_SELECT = """
    SELECT pt.id AS target_id,
           pt.post_id AS post_id,
           p.image_filename AS image_filename,
           p.ig_image_filename AS ig_image_filename,
           p.scheduled_at AS scheduled_at,
           pt.caption AS caption,
           pt.subreddit AS subreddit,
           pt.title AS title,
           pt.flair_id AS flair_id,
           pt.delay_minutes AS delay_minutes,
           a.platform AS platform,
           a.username AS username,
           a.credentials AS credentials
    FROM post_targets pt
    JOIN posts p ON p.id = pt.post_id
    JOIN accounts a ON a.id = pt.account_id
"""


def target_due_at(scheduled_at: str, delay_minutes) -> str:
    """The moment a target should publish: its post's anchor plus its offset.

    Returns a ``db.UTC_FORMAT`` string. An unparseable anchor or offset yields
    the anchor unchanged, so a bad value can only ever make a target publish at
    its post's own time — never silently never.
    """
    if not delay_minutes:
        return scheduled_at
    try:
        anchor = datetime.strptime(scheduled_at, db.UTC_FORMAT)
    except (ValueError, TypeError):
        return scheduled_at
    return (anchor + timedelta(minutes=int(delay_minutes))).strftime(db.UTC_FORMAT)


def _is_due(row, now: str) -> bool:
    """Whether a staggered target has come due at ``now``."""
    return target_due_at(row["scheduled_at"], row["delay_minutes"]) <= now


def main() -> None:
    """Publish all due, still-scheduled post targets, then check queue depth."""
    db.init_db()
    conn = db.get_connection()
    now = db.utc_now_iso()

    try:
        # Timestamps share the exact same zero-padded UTC format, so a
        # lexicographic comparison is also a chronological one. The anchor
        # bounds the candidate set — a staggered target's anchor is always in
        # the past by the time it is due — and the offset is applied below.
        candidates = conn.execute(
            _TARGET_SELECT
            + "WHERE pt.status = 'scheduled' AND p.scheduled_at <= ? "
            "ORDER BY p.scheduled_at, pt.id",
            (now,),
        ).fetchall()
    finally:
        conn.close()

    rows = [row for row in candidates if _is_due(row, now)]
    waiting = len(candidates) - len(rows)

    if rows:
        _publish_rows(rows)
    else:
        print("publisher: no due targets")
    if waiting:
        # Not an error: these are staggered targets whose turn hasn't come.
        # A later tick picks each one up as it becomes due.
        print(f"publisher: {waiting} staggered target(s) not due yet")

    # Runs on every tick, not just after a publish — deleting queued posts
    # drains an account's queue too. It swallows its own errors, so a failed
    # notification never looks like a publishing failure.
    queue_watch.check_and_notify()


def publish_post(post_id: int) -> int:
    """Publish a single post's unstaggered targets immediately.

    Used by the "Send now" action so the post goes out on click instead of
    waiting for the next scheduler tick. Ignores ``scheduled_at`` — if a target
    is still 'scheduled' and carries no offset, it is sent now.

    Staggered targets (delay_minutes > 0) are deliberately left alone rather
    than fired alongside: pushing one photo to several subreddits in the same
    minute is the exact pattern the stagger exists to prevent, so "send now"
    must not quietly undo it. The caller re-anchors ``scheduled_at`` to now, so
    each staggered target comes due at now + its offset and a later tick sends
    it. Use ``publish_target`` to force one specific destination out early.

    Returns the number of targets left waiting on an offset, so the caller can
    tell the user what is still to come.
    """
    db.init_db()
    conn = db.get_connection()
    try:
        candidates = conn.execute(
            _TARGET_SELECT
            + "WHERE pt.status = 'scheduled' AND pt.post_id = ? "
            "ORDER BY pt.id",
            (post_id,),
        ).fetchall()
    finally:
        conn.close()

    rows = [row for row in candidates if not row["delay_minutes"]]
    _publish_rows(rows)
    return len(candidates) - len(rows)


def publish_target(target_id: int) -> None:
    """Publish a single post_target immediately, if it is still scheduled.

    Backs the per-destination "Send now"/"Retry" action so one record can be
    sent on its own. Ignores both ``scheduled_at`` and ``delay_minutes``: the
    user is pointing at one row and saying go, which is an explicit override of
    the stagger rather than an accidental one.
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


def _reddit_options(row) -> dict:
    """Build the Reddit-specific publish options for a target, checking rules.

    The sub's rules are re-read here rather than trusted from schedule time:
    days can pass between the two, and the user may have corrected the rules
    (or hit the cadence limit) in the meantime.

    Raises ValueError with a user-facing message when the target must not be
    published — a violated title/flair rule or too soon after our last post
    there. Failing loudly is right: the alternative is a removed post and a
    flagged account.
    """
    subreddit = row["subreddit"]
    if not subreddit:
        raise ValueError("Reddit target has no subreddit.")

    conn = db.get_connection()
    try:
        rules = subreddits_module.rules_or_default(conn, subreddit)
        problem = subreddits_module.validate_target(
            rules, row["title"], row["flair_id"]
        )
        if problem is None:
            problem = subreddits_module.cadence_conflict(
                conn, subreddit, rules["min_interval_days"]
            )
    finally:
        conn.close()
    if problem is not None:
        raise ValueError(problem)

    return {
        "subreddit": subreddit,
        "title": row["title"],
        # A flair chosen on the target wins over the sub's default.
        "flair_id": row["flair_id"] or rules["flair_id"],
        "comment_body": rules["comment_body"],
    }


def _publish_rows(rows) -> None:
    """Attempt each target row independently; one failure never blocks the rest."""
    for row in rows:
        target_id = row["target_id"]
        platform = row["platform"]
        # Instagram enforces an aspect range the others don't, so it posts the
        # cropped variant when the user made one; every other platform (and an
        # uncropped Instagram post) uses the original.
        filename = row["image_filename"]
        if platform == "instagram" and row["ig_image_filename"]:
            filename = row["ig_image_filename"]
        image_path = str(db.IMAGES_DIR / filename)
        where = platform
        if platform == "reddit" and row["subreddit"]:
            where = "reddit r/{0}".format(row["subreddit"])

        try:
            creds = json.loads(row["credentials"])
            options = _reddit_options(row) if platform == "reddit" else None
            remote_id = platforms.post(
                platform, creds, image_path, row["caption"], options=options
            )
        except Exception as e:  # noqa: BLE001 - isolate failures per target.
            error = str(e)[:500]
            _update_target(target_id, "failed", error=error)
            _log_attempt(row, "failed", error=error)
            print("publisher: target {0} ({1}) FAILED: {2}".format(
                target_id, where, error))
        else:
            _update_target(target_id, "posted", posted_at=db.utc_now_iso(),
                           remote_id=remote_id)
            _log_attempt(row, "posted")
            print("publisher: target {0} ({1}) posted".format(
                target_id, where))


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
            "(post_id, target_id, platform, username, subreddit, status, error, "
            " image_filename, caption, attempted_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                row["post_id"],
                row["target_id"],
                row["platform"],
                row["username"],
                row["subreddit"],
                status,
                error,
                row["image_filename"],
                # Reddit's title is the part that has to satisfy the sub's
                # rules, so it's what the log needs to show; the caption is
                # only a first comment there.
                row["title"] if row["platform"] == "reddit" else row["caption"],
                db.utc_now_iso(),
            ),
        )
        conn.commit()
    finally:
        conn.close()


if __name__ == "__main__":
    main()
