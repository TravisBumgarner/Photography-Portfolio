"""Tests for the publisher, focused on the send-now single-post path."""

import json
import sys
from pathlib import Path
from unittest.mock import patch

_SCRIPTS = Path(__file__).parent.parent / "scripts"
sys.path.insert(0, str(_SCRIPTS))

import db  # noqa: E402
import platforms  # noqa: E402
import publisher  # noqa: E402


def _use_temp_db(tmp_path, monkeypatch):
    """Point db at a throwaway directory and initialize the schema."""
    monkeypatch.setattr(db, "DATA_DIR", tmp_path)
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "social-poster.db")
    monkeypatch.setattr(db, "IMAGES_DIR", tmp_path / "images")
    db.init_db()


def _seed_post(scheduled_at="2999-01-01T00:00:00Z"):
    """Insert one Instagram account + one scheduled post/target; return post id."""
    conn = db.get_connection()
    try:
        creds = json.dumps({"ig_user_id": "1", "access_token": "t"})
        account_id = conn.execute(
            "INSERT INTO accounts (platform, username, credentials, created_at) "
            "VALUES ('instagram', 'me', ?, '2026-01-01T00:00:00Z')",
            (creds,),
        ).lastrowid
        post_id = conn.execute(
            "INSERT INTO posts (image_filename, caption, scheduled_at, created_at) "
            "VALUES ('img.jpg', 'cap', ?, '2026-01-01T00:00:00Z')",
            (scheduled_at,),
        ).lastrowid
        conn.execute(
            "INSERT INTO post_targets (post_id, account_id, caption, status) "
            "VALUES (?, ?, 'cap', 'scheduled')",
            (post_id, account_id),
        )
        conn.commit()
        return post_id
    finally:
        conn.close()


def _target_row(post_id):
    conn = db.get_connection()
    try:
        return conn.execute(
            "SELECT status, error, remote_id FROM post_targets WHERE post_id = ?",
            (post_id,),
        ).fetchone()
    finally:
        conn.close()


def test_publish_post_sends_future_scheduled_target(tmp_path, monkeypatch):
    # scheduled_at is far in the future — send-now must ignore it and post anyway.
    _use_temp_db(tmp_path, monkeypatch)
    post_id = _seed_post(scheduled_at="2999-01-01T00:00:00Z")

    with patch.object(platforms, "post", return_value="media-42") as post:
        publisher.publish_post(post_id)

    post.assert_called_once()
    assert post.call_args.args[0] == "instagram"
    row = _target_row(post_id)
    assert row["status"] == "posted"
    # The platform's id is captured so engagement can be fetched later.
    assert row["remote_id"] == "media-42"


def test_publish_post_records_failure(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    post_id = _seed_post()

    with patch.object(platforms, "post", side_effect=RuntimeError("Instagram: boom")):
        publisher.publish_post(post_id)

    row = _target_row(post_id)
    assert row["status"] == "failed"
    assert "boom" in row["error"]

    # The failure is also written to the audit log.
    conn = db.get_connection()
    try:
        log = conn.execute(
            "SELECT status, error FROM publish_log WHERE post_id = ?", (post_id,)
        ).fetchone()
    finally:
        conn.close()
    assert log["status"] == "failed"


def test_instagram_posts_cropped_variant_when_present(tmp_path, monkeypatch):
    # An Instagram target with a crop must publish the cropped file, not the
    # original (Bluesky, if present, would still use the original).
    _use_temp_db(tmp_path, monkeypatch)
    post_id = _seed_post()
    conn = db.get_connection()
    conn.execute(
        "UPDATE posts SET ig_image_filename = 'img_ig.jpg' WHERE id = ?", (post_id,)
    )
    conn.commit()
    conn.close()

    with patch.object(platforms, "post", return_value="media-1") as post:
        publisher.publish_post(post_id)

    # post(platform, creds, image_path, caption) — image_path is the crop.
    assert post.call_args.args[2].endswith("img_ig.jpg")


def test_publish_post_skips_already_posted(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    post_id = _seed_post()
    conn = db.get_connection()
    conn.execute(
        "UPDATE post_targets SET status = 'posted' WHERE post_id = ?", (post_id,)
    )
    conn.commit()
    conn.close()

    with patch.object(platforms, "post") as post:
        publisher.publish_post(post_id)

    post.assert_not_called()  # nothing still 'scheduled'


# ---------------------------------------------------------------------------
# Staggered destinations
#
# A target's due time is its post's scheduled_at plus its own delay_minutes.
# The offset exists so one photo doesn't hit several subreddits in the same
# minute, which reads as spam and gets it auto-removed.
# ---------------------------------------------------------------------------
def _seed_reddit_post(subreddits_and_delays, scheduled_at="2026-07-29T11:55:00Z"):
    """One Reddit account, one post, one target per (subreddit, delay)."""
    conn = db.get_connection()
    try:
        creds = json.dumps(
            {
                "client_id": "c",
                "client_secret": "s",
                "username": "me",
                "password": "p",
            }
        )
        account_id = conn.execute(
            "INSERT INTO accounts (platform, username, credentials, created_at) "
            "VALUES ('reddit', 'me', ?, '2026-01-01T00:00:00Z')",
            (creds,),
        ).lastrowid
        post_id = conn.execute(
            "INSERT INTO posts (image_filename, caption, scheduled_at, created_at) "
            "VALUES ('img.jpg', '', ?, '2026-01-01T00:00:00Z')",
            (scheduled_at,),
        ).lastrowid
        for subreddit, delay in subreddits_and_delays:
            conn.execute(
                "INSERT INTO post_targets (post_id, account_id, caption, "
                " subreddit, title, delay_minutes, status) "
                "VALUES (?, ?, 'desc', ?, ?, ?, 'scheduled')",
                (post_id, account_id, subreddit, f"Title for {subreddit}", delay),
            )
        conn.commit()
        return post_id
    finally:
        conn.close()


def _statuses(post_id):
    conn = db.get_connection()
    try:
        return {
            row["subreddit"]: row["status"]
            for row in conn.execute(
                "SELECT subreddit, status FROM post_targets WHERE post_id = ?",
                (post_id,),
            )
        }
    finally:
        conn.close()


def test_target_due_at_applies_the_offset():
    assert (
        publisher.target_due_at("2026-07-29T12:00:00Z", 0) == "2026-07-29T12:00:00Z"
    )
    assert (
        publisher.target_due_at("2026-07-29T12:00:00Z", 38) == "2026-07-29T12:38:00Z"
    )
    # Must roll over the day/month boundary, not clamp.
    assert (
        publisher.target_due_at("2026-07-31T23:45:00Z", 30) == "2026-08-01T00:15:00Z"
    )


def test_target_due_at_falls_back_on_an_unparseable_anchor():
    # A bad value may make a target publish at its post's own time, never never.
    assert publisher.target_due_at("not-a-timestamp", 30) == "not-a-timestamp"


def test_tick_publishes_only_the_destinations_that_are_due(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    post_id = _seed_reddit_post(
        [("EarthPorn", 0), ("analog", 38), ("itookapicture", 71)]
    )

    monkeypatch.setattr(db, "utc_now_iso", lambda: "2026-07-29T12:00:00Z")
    with patch.object(platforms, "post", return_value="r1") as post:
        publisher.main()
    assert post.call_count == 1
    assert _statuses(post_id) == {
        "EarthPorn": "posted",
        "analog": "scheduled",
        "itookapicture": "scheduled",
    }

    # A later tick picks up the next one as it comes due.
    monkeypatch.setattr(db, "utc_now_iso", lambda: "2026-07-29T12:40:00Z")
    with patch.object(platforms, "post", return_value="r2"):
        publisher.main()
    assert _statuses(post_id)["analog"] == "posted"
    assert _statuses(post_id)["itookapicture"] == "scheduled"

    monkeypatch.setattr(db, "utc_now_iso", lambda: "2026-07-29T13:10:00Z")
    with patch.object(platforms, "post", return_value="r3"):
        publisher.main()
    assert set(_statuses(post_id).values()) == {"posted"}


def test_send_now_sends_unstaggered_and_defers_the_rest(tmp_path, monkeypatch):
    # Send-now keeps its "ignores scheduled_at" contract — note the far-future
    # anchor — but must not fire every subreddit at once.
    _use_temp_db(tmp_path, monkeypatch)
    post_id = _seed_reddit_post(
        [("EarthPorn", 0), ("analog", 40)], scheduled_at="2999-01-01T00:00:00Z"
    )

    with patch.object(platforms, "post", return_value="r1") as post:
        pending = publisher.publish_post(post_id)

    assert post.call_count == 1
    assert pending == 1  # reported so the UI can say what's still to come
    assert _statuses(post_id) == {"EarthPorn": "posted", "analog": "scheduled"}


def test_single_target_send_now_overrides_its_offset(tmp_path, monkeypatch):
    # Pointing at one row and saying go is an explicit override, unlike a
    # post-level send-now.
    _use_temp_db(tmp_path, monkeypatch)
    post_id = _seed_reddit_post([("analog", 90)])
    conn = db.get_connection()
    target_id = conn.execute(
        "SELECT id FROM post_targets WHERE post_id = ?", (post_id,)
    ).fetchone()["id"]
    conn.close()

    with patch.object(platforms, "post", return_value="r1") as post:
        publisher.publish_target(target_id)

    post.assert_called_once()
    assert _statuses(post_id)["analog"] == "posted"


def test_reddit_publish_passes_subreddit_title_and_flair(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    post_id = _seed_reddit_post([("analog", 0)])

    with patch.object(platforms, "post", return_value="r1") as post:
        publisher.publish_post(post_id)

    options = post.call_args.kwargs["options"]
    assert options["subreddit"] == "analog"
    assert options["title"] == "Title for analog"
    assert "comment_body" in options


def test_reddit_target_without_a_title_fails_instead_of_posting(tmp_path, monkeypatch):
    # Rules are re-checked at publish time: the alternative to failing loudly is
    # a removed post and a flagged account.
    _use_temp_db(tmp_path, monkeypatch)
    post_id = _seed_reddit_post([("analog", 0)])
    conn = db.get_connection()
    conn.execute("UPDATE post_targets SET title = '' WHERE post_id = ?", (post_id,))
    conn.commit()
    conn.close()

    with patch.object(platforms, "post") as post:
        publisher.publish_post(post_id)

    post.assert_not_called()
    conn = db.get_connection()
    try:
        row = conn.execute(
            "SELECT status, error FROM post_targets WHERE post_id = ?", (post_id,)
        ).fetchone()
    finally:
        conn.close()
    assert row["status"] == "failed"
    assert "title" in row["error"]


def test_cadence_violation_blocks_the_publish(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    import subreddits as subreddits_module

    conn = db.get_connection()
    try:
        subreddits_module.upsert(
            conn, {"name": "analog", "min_interval_days": 7}
        )
        conn.execute(
            "INSERT INTO publish_log (platform, username, subreddit, status, "
            " attempted_at) VALUES ('reddit', 'me', 'analog', 'posted', ?)",
            (db.utc_now_iso(),),
        )
        conn.commit()
    finally:
        conn.close()

    post_id = _seed_reddit_post([("analog", 0)])
    with patch.object(platforms, "post") as post:
        publisher.publish_post(post_id)

    post.assert_not_called()
    conn = db.get_connection()
    try:
        error = conn.execute(
            "SELECT error FROM post_targets WHERE post_id = ?", (post_id,)
        ).fetchone()["error"]
    finally:
        conn.close()
    assert "minimum interval" in error


def test_audit_log_records_the_subreddit_and_title(tmp_path, monkeypatch):
    # platform+username is ambiguous on Reddit; the destination is what
    # distinguishes rows, and the title is what had to satisfy the sub's rules.
    _use_temp_db(tmp_path, monkeypatch)
    post_id = _seed_reddit_post([("analog", 0)])

    with patch.object(platforms, "post", return_value="r1"):
        publisher.publish_post(post_id)

    conn = db.get_connection()
    try:
        row = conn.execute(
            "SELECT subreddit, caption FROM publish_log WHERE post_id = ?",
            (post_id,),
        ).fetchone()
    finally:
        conn.close()
    assert row["subreddit"] == "analog"
    assert row["caption"] == "Title for analog"
