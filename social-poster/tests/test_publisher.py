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
