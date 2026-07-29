"""Tests for engagement snapshots (mocked HTTP — nothing reaches the network)."""

import json
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

_SCRIPTS = Path(__file__).parent.parent / "scripts"
sys.path.insert(0, str(_SCRIPTS))

import db  # noqa: E402
import engagement  # noqa: E402


def _use_temp_db(tmp_path, monkeypatch):
    """Point db at a throwaway directory and initialize the schema."""
    monkeypatch.setattr(db, "DATA_DIR", tmp_path)
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "social-poster.db")
    monkeypatch.setattr(db, "IMAGES_DIR", tmp_path / "images")
    db.init_db()


def _seed_posted_target(remote_id="media-1", platform="instagram"):
    """Insert one account + one already-posted target; return (post_id, target_id)."""
    conn = db.get_connection()
    try:
        creds = json.dumps({"ig_user_id": "1", "access_token": "t"})
        account_id = conn.execute(
            "INSERT INTO accounts (platform, username, credentials, created_at) "
            "VALUES (?, 'me', ?, '2026-01-01T00:00:00Z')",
            (platform, creds),
        ).lastrowid
        post_id = conn.execute(
            "INSERT INTO posts (image_filename, caption, scheduled_at, created_at) "
            "VALUES ('img.jpg', 'cap', '2026-01-01T00:00:00Z', "
            "'2026-01-01T00:00:00Z')"
        ).lastrowid
        target_id = conn.execute(
            "INSERT INTO post_targets "
            "(post_id, account_id, caption, status, remote_id) "
            "VALUES (?, ?, 'cap', 'posted', ?)",
            (post_id, account_id, remote_id),
        ).lastrowid
        conn.commit()
        return post_id, target_id
    finally:
        conn.close()


def _snapshots(target_id):
    conn = db.get_connection()
    try:
        return conn.execute(
            "SELECT * FROM engagement_snapshots WHERE target_id = ?", (target_id,)
        ).fetchall()
    finally:
        conn.close()


def test_snapshot_records_instagram_metrics(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    post_id, target_id = _seed_posted_target()

    resp = MagicMock(ok=True)
    resp.json.return_value = {"like_count": 12, "comments_count": 3}
    with patch("requests.get", return_value=resp) as get:
        results = engagement.snapshot_targets(post_id)

    assert get.call_args.args[0].endswith("/media-1")
    assert results == [
        {
            "target_id": target_id,
            "platform": "instagram",
            "username": "me",
            "ok": True,
            "error": None,
        }
    ]
    rows = _snapshots(target_id)
    assert len(rows) == 1
    assert rows[0]["likes"] == 12
    assert rows[0]["comments"] == 3
    assert rows[0]["reposts"] is None


def test_snapshot_skips_targets_without_remote_id(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    _seed_posted_target(remote_id=None)

    with patch("requests.get") as get:
        results = engagement.snapshot_targets()

    get.assert_not_called()
    assert results == []


def test_snapshot_isolates_per_target_failures(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    post_id, target_id = _seed_posted_target()

    with patch("requests.get", side_effect=RuntimeError("boom")):
        results = engagement.snapshot_targets(post_id)

    assert len(results) == 1
    assert results[0]["ok"] is False
    assert "boom" in results[0]["error"]
    assert _snapshots(target_id) == []
