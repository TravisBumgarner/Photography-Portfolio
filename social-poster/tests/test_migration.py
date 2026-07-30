"""Tests for migrating a pre-Reddit database in place.

The live database predates the destination model, so init_db has to widen it
without losing anything. This builds an old-shape database by hand and asserts
the migration is additive, idempotent, and doesn't drop publishing history.
"""

import sqlite3
import sys
from pathlib import Path

_SCRIPTS = Path(__file__).parent.parent / "scripts"
sys.path.insert(0, str(_SCRIPTS))

import db  # noqa: E402

# The schema as it stood before per-destination targets: no caption on
# post_targets (it lived on posts), no remote_id, no subreddit.
_LEGACY_SCHEMA = """
CREATE TABLE accounts (
    id INTEGER PRIMARY KEY, platform TEXT NOT NULL, username TEXT NOT NULL,
    display_name TEXT, credentials TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE posts (
    id INTEGER PRIMARY KEY, image_filename TEXT NOT NULL,
    caption TEXT NOT NULL DEFAULT '', scheduled_at TEXT NOT NULL,
    created_at TEXT NOT NULL);
CREATE TABLE post_targets (
    id INTEGER PRIMARY KEY, post_id INTEGER NOT NULL, account_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled', error TEXT, posted_at TEXT);
INSERT INTO accounts VALUES
    (1, 'bluesky', 'me', NULL, '{}', '2026-01-01T00:00:00Z');
INSERT INTO posts VALUES
    (1, 'a.jpg', 'legacy caption', '2026-01-02T00:00:00Z', '2026-01-01T00:00:00Z');
INSERT INTO post_targets (id, post_id, account_id, status)
    VALUES (1, 1, 1, 'scheduled');
"""


def _legacy_db(tmp_path, monkeypatch, extra_sql=""):
    """Create an old-shape database at the patched location and migrate it."""
    monkeypatch.setattr(db, "DATA_DIR", tmp_path)
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "social-poster.db")
    monkeypatch.setattr(db, "IMAGES_DIR", tmp_path / "images")
    db.ensure_dirs()
    conn = sqlite3.connect(str(db.DB_PATH))
    conn.executescript(_LEGACY_SCHEMA + extra_sql)
    conn.commit()
    conn.close()
    db.init_db()


def _columns(conn, table):
    return {row["name"] for row in conn.execute(f"PRAGMA table_info({table})")}


def test_migration_adds_the_destination_columns(tmp_path, monkeypatch):
    _legacy_db(tmp_path, monkeypatch)
    conn = db.get_connection()
    try:
        columns = _columns(conn, "post_targets")
        assert {
            "subreddit",
            "title",
            "flair_id",
            "delay_minutes",
            "caption",
            "remote_id",
        } <= columns
        assert "subreddit" in _columns(conn, "publish_log")
        assert "subreddit" in _columns(conn, "engagement_snapshots")
        assert "categories" in _columns(conn, "subreddits")
        assert {"titles", "reddit_suggestions"} <= _columns(conn, "ingest_items")
    finally:
        conn.close()


def test_migration_backfills_the_legacy_caption(tmp_path, monkeypatch):
    # Captions used to live on the post; each target inherits its post's.
    _legacy_db(tmp_path, monkeypatch)
    conn = db.get_connection()
    try:
        row = conn.execute(
            "SELECT caption, subreddit, delay_minutes FROM post_targets WHERE id = 1"
        ).fetchone()
        assert row["caption"] == "legacy caption"
        # Existing targets are unaffected by the Reddit-only additions.
        assert row["subreddit"] == ""
        assert row["delay_minutes"] == 0
    finally:
        conn.close()


def test_migration_is_idempotent(tmp_path, monkeypatch):
    _legacy_db(tmp_path, monkeypatch)
    db.init_db()
    db.init_db()
    conn = db.get_connection()
    try:
        assert (
            conn.execute("SELECT COUNT(*) AS c FROM post_targets").fetchone()["c"] == 1
        )
    finally:
        conn.close()


def test_duplicate_destinations_are_collapsed_keeping_the_posted_row(
    tmp_path, monkeypatch
):
    # A client that repeated an account_id could create duplicates before the
    # uniqueness constraint existed; the index can't build until they're gone,
    # and the row that published is the one worth keeping.
    _legacy_db(
        tmp_path,
        monkeypatch,
        "INSERT INTO post_targets (id, post_id, account_id, status) "
        "VALUES (2, 1, 1, 'posted');",
    )
    conn = db.get_connection()
    try:
        rows = conn.execute("SELECT id, status FROM post_targets").fetchall()
        assert len(rows) == 1
        assert rows[0]["status"] == "posted"
    finally:
        conn.close()


def test_one_account_may_now_hold_several_subreddits(tmp_path, monkeypatch):
    _legacy_db(tmp_path, monkeypatch)
    conn = db.get_connection()
    try:
        conn.execute(
            "INSERT INTO post_targets (post_id, account_id, subreddit) "
            "VALUES (1, 1, 'analog')"
        )
        conn.execute(
            "INSERT INTO post_targets (post_id, account_id, subreddit) "
            "VALUES (1, 1, 'EarthPorn')"
        )
        conn.commit()
        count = conn.execute(
            "SELECT COUNT(*) AS c FROM post_targets WHERE post_id = 1"
        ).fetchone()["c"]
        assert count == 3
    finally:
        conn.close()


def test_the_same_destination_twice_is_still_rejected(tmp_path, monkeypatch):
    _legacy_db(tmp_path, monkeypatch)
    conn = db.get_connection()
    try:
        conn.execute(
            "INSERT INTO post_targets (post_id, account_id, subreddit) "
            "VALUES (1, 1, 'analog')"
        )
        conn.commit()
        try:
            conn.execute(
                "INSERT INTO post_targets (post_id, account_id, subreddit) "
                "VALUES (1, 1, 'analog')"
            )
            conn.commit()
        except sqlite3.IntegrityError:
            pass
        else:  # pragma: no cover - the constraint must bite
            raise AssertionError("duplicate destination was allowed")
    finally:
        conn.close()


def test_empty_subreddit_still_constrains_non_reddit_targets(tmp_path, monkeypatch):
    # '' rather than NULL for subreddit is deliberate: NULLs are never equal in
    # SQL, so a nullable column would silently allow duplicate Bluesky targets.
    _legacy_db(tmp_path, monkeypatch)
    conn = db.get_connection()
    try:
        try:
            conn.execute(
                "INSERT INTO post_targets (post_id, account_id) VALUES (1, 1)"
            )
            conn.commit()
        except sqlite3.IntegrityError:
            pass
        else:  # pragma: no cover
            raise AssertionError("duplicate non-Reddit target was allowed")
    finally:
        conn.close()
