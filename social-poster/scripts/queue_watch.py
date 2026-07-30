#!/usr/bin/env python3
"""Social Poster - queue depth watch.

Warns before an account goes dark. After every publisher run this counts the
posts still queued (``status = 'scheduled'``) for each account and pushes a
notification through the contact-form relay when that count falls to or below
``QUEUE_LOW_THRESHOLD``, and again when it reaches zero.

Each account notifies at most once per level per drain. The level it last
alerted at ("low" or "empty") is stored in the ``settings`` table under
``queue_alerts``, and is cleared the moment the queue is refilled back above
the threshold. So a queue draining 5 -> 0 sends two messages — "running low",
then "empty" — not five, and refilling it re-arms both.

Accounts that have never published anything AND have nothing queued are
skipped: a freshly added account you haven't scheduled for yet hasn't "run
out" of anything, and shouldn't nag.
"""

import json
import os
import traceback

try:
    from . import config
    from . import db
    from . import notify
except ImportError:  # Allows running directly as `python queue_watch.py`.
    import config
    import db
    import notify

# The settings key holding {account_id (str): "low" | "empty"} — which alert
# each account has already sent for its current drain.
STATE_KEY = "queue_alerts"

DEFAULT_LOW_THRESHOLD = 3

# One row per account with its queue depth and the last scheduled post on it.
# LEFT JOIN so accounts with an empty queue still come back (remaining = 0).
_DEPTH_SQL = """
    SELECT a.id AS account_id,
           a.platform AS platform,
           a.username AS username,
           -- Distinct posts, not targets: a Reddit account sends one photo to
           -- several subreddits, and the queue depth this alert is about is
           -- "how many photos are left to post", not how many submissions.
           COUNT(DISTINCT pt.post_id) AS remaining,
           MAX(p.scheduled_at) AS last_scheduled,
           -- "Has this account ever been used?" — either it still has targets
           -- of some status, or the audit log remembers a publish attempt.
           -- Both, because targets cascade away when a post is deleted while
           -- the log rows outlive it.
           (SELECT COUNT(*) FROM post_targets t WHERE t.account_id = a.id)
               AS target_count,
           (SELECT COUNT(*) FROM publish_log l
             WHERE l.platform = a.platform AND l.username = a.username)
               AS published_count
    FROM accounts a
    LEFT JOIN post_targets pt
           ON pt.account_id = a.id AND pt.status = 'scheduled'
    LEFT JOIN posts p ON p.id = pt.post_id
    GROUP BY a.id
    ORDER BY a.platform, a.username
"""


def low_threshold() -> int:
    """Queue depth at or below which an account is "running low".

    ``QUEUE_LOW_THRESHOLD`` overrides the default; a non-integer value falls
    back rather than taking the publisher down over a typo.
    """
    raw = os.environ.get("QUEUE_LOW_THRESHOLD", "").strip()
    try:
        return max(0, int(raw))
    except ValueError:
        return DEFAULT_LOW_THRESHOLD


def alerts_disabled() -> bool:
    """Whether queue notifications are switched off (``QUEUE_ALERTS_DISABLED=1``)."""
    return os.environ.get("QUEUE_ALERTS_DISABLED", "").strip() == "1"


def _level(remaining: int, threshold: int):
    """The alert level for a queue depth, or None when it's healthy."""
    if remaining == 0:
        return "empty"
    if remaining <= threshold:
        return "low"
    return None


def _load_state(conn) -> dict:
    """Read the per-account alert state, tolerating a missing/corrupt value."""
    row = conn.execute(
        "SELECT value FROM settings WHERE key = ?", (STATE_KEY,)
    ).fetchone()
    if row is None:
        return {}
    try:
        state = json.loads(row["value"])
    except (json.JSONDecodeError, TypeError):
        return {}
    return state if isinstance(state, dict) else {}


def _save_state(conn, state: dict) -> None:
    conn.execute(
        "INSERT INTO settings (key, value) VALUES (?, ?) "
        "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        (STATE_KEY, json.dumps(state)),
    )
    conn.commit()


def _format_when(scheduled_at) -> str:
    """Render a stored UTC timestamp for a notification body."""
    if not scheduled_at:
        return ""
    return scheduled_at.replace("T", " ")[:16] + " UTC"


def _subject(row, level: str) -> str:
    handle = "@{0}".format(row["username"])
    platform = row["platform"].capitalize()
    if level == "empty":
        return "📭 {0} queue is empty — {1}".format(platform, handle)
    return "⚠️ {0} queue running low — {1}".format(platform, handle)


def _body(row, level: str, threshold: int) -> str:
    handle = "@{0}".format(row["username"])
    platform = row["platform"]
    remaining = row["remaining"]

    if level == "empty":
        lines = [
            "{0} ({1}) has nothing left in the queue — no scheduled posts "
            "remain.".format(handle, platform)
        ]
    else:
        lines = [
            "{0} ({1}) has {2} scheduled post{3} left (warning at {4}).".format(
                handle, platform, remaining, "" if remaining == 1 else "s",
                threshold,
            )
        ]
        when = _format_when(row["last_scheduled"])
        if when:
            lines.append("The last one goes out {0}.".format(when))

    base_url = os.environ.get("PUBLIC_BASE_URL", "").strip().rstrip("/")
    if base_url:
        lines.append("")
        lines.append("Queue more: {0}".format(base_url))
    return "\n".join(lines)


def _check() -> None:
    """Evaluate every account's queue depth and notify on level changes."""
    threshold = low_threshold()
    dry = config.dry_run()

    conn = db.get_connection()
    try:
        rows = conn.execute(_DEPTH_SQL).fetchall()
        previous = _load_state(conn)
    finally:
        conn.close()

    # Rebuilt from the accounts seen this run, so state for deleted accounts is
    # dropped instead of accumulating forever.
    current = {}

    for row in rows:
        key = str(row["account_id"])
        remaining = row["remaining"]

        # Never scheduled, never published — nothing has run out yet.
        if remaining == 0 and not (row["target_count"] or row["published_count"]):
            continue

        level = _level(remaining, threshold)
        if level is None:
            continue  # Healthy: leave `current` unset, which re-arms alerts.

        if previous.get(key) == level:
            current[key] = level  # Already told them about this level.
            continue

        subject = _subject(row, level)
        try:
            if dry:
                print("queue-watch: DRY_RUN, would notify: {0}".format(subject))
            else:
                notify.send(subject, _body(row, level, threshold))
        except Exception as e:  # noqa: BLE001 - a failed send must not stop the rest.
            # Carry the old level forward so the next tick retries this account.
            if previous.get(key):
                current[key] = previous[key]
            print("queue-watch: notify failed for {0}: {1}".format(
                row["username"], e))
        else:
            current[key] = level
            print("queue-watch: {0}".format(subject))

    if current != previous:
        conn = db.get_connection()
        try:
            _save_state(conn, current)
        finally:
            conn.close()


def check_and_notify() -> None:
    """Run the queue check, swallowing every error.

    The publisher calls this after publishing; a notification problem must
    never surface as a publishing failure.
    """
    if alerts_disabled():
        return
    try:
        _check()
    except Exception:  # noqa: BLE001 - watching the queue is best-effort.
        traceback.print_exc()


if __name__ == "__main__":
    config.load_env()
    db.init_db()
    check_and_notify()
