"""Tests for the per-account queue-depth watch and its notifications."""

import json
import sys
from pathlib import Path
from unittest.mock import patch

_SCRIPTS = Path(__file__).parent.parent / "scripts"
sys.path.insert(0, str(_SCRIPTS))

import db  # noqa: E402
import notify  # noqa: E402
import publisher  # noqa: E402
import queue_watch  # noqa: E402


def _use_temp_db(tmp_path, monkeypatch):
    """Point db at a throwaway directory and initialize the schema."""
    monkeypatch.setattr(db, "DATA_DIR", tmp_path)
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "social-poster.db")
    monkeypatch.setattr(db, "IMAGES_DIR", tmp_path / "images")
    # Live behaviour by default; DRY_RUN would suppress every send.
    monkeypatch.delenv("DRY_RUN", raising=False)
    monkeypatch.delenv("QUEUE_ALERTS_DISABLED", raising=False)
    monkeypatch.delenv("CONTACT_FORM_URL", raising=False)
    monkeypatch.setenv("QUEUE_LOW_THRESHOLD", "3")
    db.init_db()


def _add_account(platform="bluesky", username="me"):
    conn = db.get_connection()
    try:
        account_id = conn.execute(
            "INSERT INTO accounts (platform, username, credentials, created_at) "
            "VALUES (?, ?, '{}', '2026-01-01T00:00:00Z')",
            (platform, username),
        ).lastrowid
        conn.commit()
        return account_id
    finally:
        conn.close()


def _queue(account_id, count, scheduled_at="2999-01-01T09:00:00Z"):
    """Add `count` scheduled posts targeting the account."""
    conn = db.get_connection()
    try:
        for _ in range(count):
            post_id = conn.execute(
                "INSERT INTO posts (image_filename, caption, scheduled_at, "
                "created_at) VALUES ('img.jpg', 'cap', ?, "
                "'2026-01-01T00:00:00Z')",
                (scheduled_at,),
            ).lastrowid
            conn.execute(
                "INSERT INTO post_targets (post_id, account_id, caption, status) "
                "VALUES (?, ?, 'cap', 'scheduled')",
                (post_id, account_id),
            )
        conn.commit()
    finally:
        conn.close()


def _drain(account_id, count):
    """Mark `count` of the account's scheduled targets as posted."""
    conn = db.get_connection()
    try:
        ids = [
            row["id"]
            for row in conn.execute(
                "SELECT id FROM post_targets WHERE account_id = ? AND "
                "status = 'scheduled' ORDER BY id LIMIT ?",
                (account_id, count),
            )
        ]
        for target_id in ids:
            conn.execute(
                "UPDATE post_targets SET status = 'posted' WHERE id = ?",
                (target_id,),
            )
        conn.commit()
    finally:
        conn.close()


def _log_publish(platform="bluesky", username="me"):
    """Record a publish attempt, marking the account as one that's in use."""
    conn = db.get_connection()
    try:
        conn.execute(
            "INSERT INTO publish_log (platform, username, status, attempted_at) "
            "VALUES (?, ?, 'posted', '2026-01-01T00:00:00Z')",
            (platform, username),
        )
        conn.commit()
    finally:
        conn.close()


def _state():
    conn = db.get_connection()
    try:
        row = conn.execute(
            "SELECT value FROM settings WHERE key = ?", (queue_watch.STATE_KEY,)
        ).fetchone()
    finally:
        conn.close()
    return json.loads(row["value"]) if row else {}


def test_notifies_once_when_queue_drops_to_threshold(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    account_id = _add_account()
    _queue(account_id, 3)  # exactly at the threshold

    with patch.object(notify, "send") as send:
        queue_watch.check_and_notify()
    assert send.call_count == 1
    subject = send.call_args.args[0]
    assert "running low" in subject and "@me" in subject
    assert "3 scheduled posts left" in send.call_args.args[1]

    # A second run at the same depth stays quiet.
    with patch.object(notify, "send") as send:
        queue_watch.check_and_notify()
    send.assert_not_called()
    assert _state() == {str(account_id): "low"}


def test_healthy_queue_is_silent(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    _queue(_add_account(), 4)  # one above the threshold

    with patch.object(notify, "send") as send:
        queue_watch.check_and_notify()

    send.assert_not_called()
    assert _state() == {}


def test_low_then_empty_sends_exactly_two_messages(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    account_id = _add_account()
    _queue(account_id, 5)

    with patch.object(notify, "send") as send:
        queue_watch.check_and_notify()  # 5 left — healthy
        _drain(account_id, 3)
        queue_watch.check_and_notify()  # 2 left — low
        queue_watch.check_and_notify()  # unchanged — quiet
        _drain(account_id, 1)
        queue_watch.check_and_notify()  # 1 left — still low, quiet
        _drain(account_id, 1)
        queue_watch.check_and_notify()  # 0 left — empty

    subjects = [call.args[0] for call in send.call_args_list]
    assert len(subjects) == 2
    assert "running low" in subjects[0]
    assert "queue is empty" in subjects[1]
    assert _state() == {str(account_id): "empty"}


def test_refilling_rearms_the_alert(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    account_id = _add_account()
    _queue(account_id, 1)

    with patch.object(notify, "send") as send:
        queue_watch.check_and_notify()
    assert send.call_count == 1

    _queue(account_id, 10)  # refilled well above the threshold
    with patch.object(notify, "send") as send:
        queue_watch.check_and_notify()
    send.assert_not_called()
    assert _state() == {}  # re-armed

    _drain(account_id, 9)  # back down to 2
    with patch.object(notify, "send") as send:
        queue_watch.check_and_notify()
    assert send.call_count == 1


def test_each_account_is_tracked_separately(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    bluesky = _add_account("bluesky", "me")
    instagram = _add_account("instagram", "me")
    _queue(bluesky, 1)
    _queue(instagram, 9)

    with patch.object(notify, "send") as send:
        queue_watch.check_and_notify()

    assert send.call_count == 1
    assert "Bluesky" in send.call_args.args[0]
    assert _state() == {str(bluesky): "low"}


def test_unused_account_with_empty_queue_is_ignored(tmp_path, monkeypatch):
    # A freshly added account that has never posted hasn't "run out" of
    # anything, so it must not nag on every publisher tick.
    _use_temp_db(tmp_path, monkeypatch)
    _add_account()

    with patch.object(notify, "send") as send:
        queue_watch.check_and_notify()

    send.assert_not_called()


def test_empty_queue_alerts_once_the_account_has_published(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    account_id = _add_account()
    _log_publish()

    with patch.object(notify, "send") as send:
        queue_watch.check_and_notify()

    assert send.call_count == 1
    assert "queue is empty" in send.call_args.args[0]
    assert _state() == {str(account_id): "empty"}


def test_failed_send_is_retried_on_the_next_run(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    _queue(_add_account(), 2)

    with patch.object(notify, "send", side_effect=RuntimeError("relay down")):
        queue_watch.check_and_notify()
    assert _state() == {}  # nothing recorded, so the alert is still pending

    with patch.object(notify, "send") as send:
        queue_watch.check_and_notify()
    assert send.call_count == 1


def test_dry_run_logs_instead_of_sending(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    account_id = _add_account()
    _queue(account_id, 1)
    monkeypatch.setenv("DRY_RUN", "1")

    with patch.object(notify, "send") as send:
        queue_watch.check_and_notify()

    send.assert_not_called()
    # Still recorded, so dev doesn't reprint the same warning every minute.
    assert _state() == {str(account_id): "low"}


def test_disabled_switch_skips_everything(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    _queue(_add_account(), 1)
    monkeypatch.setenv("QUEUE_ALERTS_DISABLED", "1")

    with patch.object(notify, "send") as send:
        queue_watch.check_and_notify()

    send.assert_not_called()
    assert _state() == {}


def test_threshold_zero_warns_only_when_empty(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    account_id = _add_account()
    monkeypatch.setenv("QUEUE_LOW_THRESHOLD", "0")
    _queue(account_id, 1)

    with patch.object(notify, "send") as send:
        queue_watch.check_and_notify()
    send.assert_not_called()

    _drain(account_id, 1)
    with patch.object(notify, "send") as send:
        queue_watch.check_and_notify()
    assert "queue is empty" in send.call_args.args[0]


def test_publisher_run_checks_the_queue(tmp_path, monkeypatch):
    # The watch runs on every publisher tick, including ones with nothing due.
    _use_temp_db(tmp_path, monkeypatch)
    _queue(_add_account(), 1, scheduled_at="2999-01-01T09:00:00Z")

    with patch.object(notify, "send") as send:
        publisher.main()

    assert send.call_count == 1
    assert "running low" in send.call_args.args[0]


def test_notification_payload_matches_the_contact_form_relay(tmp_path, monkeypatch):
    # The relay is the same endpoint the portfolio contact forms POST to, so
    # the body has to keep their field names.
    _use_temp_db(tmp_path, monkeypatch)
    account_id = _add_account("instagram", "photos")
    _queue(account_id, 2, scheduled_at="2999-03-04T17:30:00Z")
    monkeypatch.setenv("PUBLIC_BASE_URL", "https://poster.example.com")

    with patch.object(notify.requests, "post") as post:
        queue_watch.check_and_notify()

    url = post.call_args.args[0]
    payload = post.call_args.kwargs["json"]
    assert url == "https://contact-form.nfshost.com/contact"
    assert set(payload) == {"name", "email", "subject", "message", "website"}
    assert payload["name"] == "Social Poster"
    assert "Instagram queue running low — @photos" in payload["subject"]
    assert "2 scheduled posts left" in payload["message"]
    assert "2999-03-04 17:30 UTC" in payload["message"]
    assert "https://poster.example.com" in payload["message"]
    assert len(payload["message"]) <= notify.MESSAGE_LIMIT


def test_state_for_deleted_accounts_is_pruned(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    keep = _add_account("bluesky", "keep")
    drop = _add_account("instagram", "drop")
    _queue(keep, 1)
    _queue(drop, 1)

    with patch.object(notify, "send"):
        queue_watch.check_and_notify()
    assert set(_state()) == {str(keep), str(drop)}

    conn = db.get_connection()
    conn.execute("DELETE FROM accounts WHERE id = ?", (drop,))
    conn.commit()
    conn.close()

    with patch.object(notify, "send"):
        queue_watch.check_and_notify()
    assert set(_state()) == {str(keep)}
