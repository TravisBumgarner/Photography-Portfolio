#!/usr/bin/env python3
"""Social Poster - SQLite schema and database helpers.

Defines the on-disk locations for the database and uploaded images,
exposes a connection helper that is safe to use across threads (one
connection per operation), and the canonical UTC timestamp helper used
by both the web server and the publisher so their formats match exactly.
"""

import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

# Compute the repo root relative to this file:
#   <repo>/social-poster/scripts/db.py -> <repo>
REPO_ROOT = Path(__file__).parent.parent.parent

# DATA_DIR may be overridden by systemd to an absolute path. The default is a
# dev-friendly location inside the repo.
DATA_DIR = Path(os.environ.get("DATA_DIR", REPO_ROOT / "social-poster" / "data"))

DB_PATH = DATA_DIR / "social-poster.db"
IMAGES_DIR = DATA_DIR / "images"

# The exact timestamp format used everywhere. Zero-padded UTC with a literal
# "Z" suffix so that lexicographic string comparison equals chronological
# comparison.
UTC_FORMAT = "%Y-%m-%dT%H:%M:%SZ"


def utc_now_iso() -> str:
    """Return the current UTC time as an ISO-8601 string (e.g. 2026-06-25T12:34:56Z).

    Used by both the server and the publisher so stored timestamps and
    comparison values always share the exact same format.
    """
    return datetime.now(timezone.utc).strftime(UTC_FORMAT)


def ensure_dirs() -> None:
    """Create the data and images directories if they do not exist."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)


def get_connection() -> sqlite3.Connection:
    """Open a new SQLite connection with sensible defaults.

    A fresh connection is opened per request/operation, which keeps SQLite
    usage simple and correct across Flask's threaded request handling.
    Foreign keys are enforced and rows are returned as ``sqlite3.Row``.
    """
    ensure_dirs()
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    # The web server and the in-process publisher thread both write, so wait
    # briefly for a lock instead of failing immediately with "database is locked".
    conn.execute("PRAGMA busy_timeout = 5000")
    return conn


def _table_columns(conn: sqlite3.Connection, table: str) -> set:
    """Return the set of column names on an existing table."""
    return {row["name"] for row in conn.execute(f"PRAGMA table_info({table})")}


def init_db() -> None:
    """Create the database tables if they do not already exist.

    Captions live on ``post_targets`` (not ``posts``) so the same image can go
    out with a different caption per platform — @-mentions differ between
    Instagram and Bluesky. Databases created before that change are migrated in
    place below.
    """
    conn = get_connection()
    try:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS accounts (
                id INTEGER PRIMARY KEY,
                platform TEXT NOT NULL,
                username TEXT NOT NULL,
                display_name TEXT,
                credentials TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY,
                image_filename TEXT NOT NULL,
                caption TEXT NOT NULL DEFAULT '',
                scheduled_at TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS post_targets (
                id INTEGER PRIMARY KEY,
                post_id INTEGER NOT NULL,
                account_id INTEGER NOT NULL,
                caption TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'scheduled',
                error TEXT,
                posted_at TEXT,
                FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
                FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
            );

            -- Staging area for bulk ingestion: uploaded photos waiting for
            -- review/approval before they become scheduled posts. Rows are
            -- deleted on approve (converted to posts) or discard.
            -- captions is a JSON object of per-platform caption text,
            -- e.g. {"instagram": "...", "bluesky": "..."}.
            CREATE TABLE IF NOT EXISTS ingest_items (
                id INTEGER PRIMARY KEY,
                image_filename TEXT NOT NULL,
                captions TEXT NOT NULL DEFAULT '{}',
                tag_status TEXT NOT NULL DEFAULT 'pending',
                tag_error TEXT,
                created_at TEXT NOT NULL
            );

            -- Simple key/value app settings (values are JSON strings).
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );

            -- Append-only record of every publish attempt (one row per target
            -- per try). Denormalized and FK-free so entries persist even after
            -- the post or account is deleted — it's an audit log.
            CREATE TABLE IF NOT EXISTS publish_log (
                id INTEGER PRIMARY KEY,
                post_id INTEGER,
                target_id INTEGER,
                platform TEXT NOT NULL,
                username TEXT NOT NULL,
                status TEXT NOT NULL,
                error TEXT,
                image_filename TEXT,
                caption TEXT,
                attempted_at TEXT NOT NULL
            );

            -- Append-only engagement snapshots per published target, fetched
            -- from the platform APIs on demand. Denormalized and FK-free like
            -- publish_log so history survives post/account deletion — the
            -- point is a year-over-year record of what actually performed.
            CREATE TABLE IF NOT EXISTS engagement_snapshots (
                id INTEGER PRIMARY KEY,
                post_id INTEGER,
                target_id INTEGER,
                platform TEXT NOT NULL,
                username TEXT NOT NULL,
                remote_id TEXT NOT NULL,
                likes INTEGER,
                comments INTEGER,
                reposts INTEGER,
                recorded_at TEXT NOT NULL
            );
            """
        )

        # Migrate pre-per-target-caption databases: add the column and backfill
        # each target from its post's (now legacy) caption.
        if "caption" not in _table_columns(conn, "post_targets"):
            conn.execute(
                "ALTER TABLE post_targets ADD COLUMN caption TEXT NOT NULL DEFAULT ''"
            )
            conn.execute(
                "UPDATE post_targets SET caption = "
                "(SELECT caption FROM posts WHERE posts.id = post_targets.post_id)"
            )

        # The platform's id for the published item (Instagram media id /
        # Bluesky at:// URI), captured at publish time so engagement can be
        # fetched later. NULL for targets published before this column existed.
        if "remote_id" not in _table_columns(conn, "post_targets"):
            conn.execute("ALTER TABLE post_targets ADD COLUMN remote_id TEXT")

        # Free-text log of feature-hub pickups (e.g. "@moodygrams 2026-07-12"),
        # filled in by hand when a hub reposts/features the photo.
        if "featured_by" not in _table_columns(conn, "posts"):
            conn.execute(
                "ALTER TABLE posts ADD COLUMN featured_by TEXT NOT NULL DEFAULT ''"
            )

        # Structured tag pools for the bulk-review pill editor: a JSON object of
        # per-platform {"prefix": <caption minus tag line>, "tags": [{text,
        # priority, mention}, ...]}. Drives the draggable tag UI; the caption
        # text the item posts still lives in `captions`.
        if "tag_pools" not in _table_columns(conn, "ingest_items"):
            conn.execute(
                "ALTER TABLE ingest_items ADD COLUMN tag_pools TEXT NOT NULL "
                "DEFAULT '{}'"
            )

        # Instagram-only cropped variant. Instagram enforces an aspect-ratio
        # range Bluesky doesn't; when a photo is outside it the user crops a
        # copy here, and Instagram publishes this file while Bluesky keeps the
        # original framing. NULL means "no crop — use image_filename for both".
        for table in ("ingest_items", "posts"):
            if "ig_image_filename" not in _table_columns(conn, table):
                conn.execute(
                    f"ALTER TABLE {table} ADD COLUMN ig_image_filename TEXT"
                )

        # The crop rectangle (JSON {x, y, width, height} in the original's
        # natural pixels) behind an item's Instagram crop, so re-opening the
        # cropper can restore the previous framing instead of resetting.
        if "ig_crop" not in _table_columns(conn, "ingest_items"):
            conn.execute("ALTER TABLE ingest_items ADD COLUMN ig_crop TEXT")

        conn.commit()
    finally:
        conn.close()
