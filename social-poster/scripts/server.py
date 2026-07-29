#!/usr/bin/env python3
"""Social Poster - Flask web app (REST API + built frontend).

Long-running web app that accepts scheduled social media posts (image +
caption + target accounts + scheduled time). A separate publisher process
(see ``publisher.py``) sends the due posts. The only time this module talks
to Instagram/Bluesky is the "test connection" endpoint, which logs in (but
never posts) to verify credentials before they are saved.
"""

import json
import os
import tempfile
import threading
import time
import traceback
import uuid
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from flask import (
    Flask,
    jsonify,
    request,
    send_from_directory,
)
from werkzeug.utils import secure_filename

try:
    from . import config, db, engagement, platforms, publisher, tagging
except ImportError:  # Allows running directly as `python server.py`.
    import config
    import db
    import engagement
    import platforms
    import publisher
    import tagging

app = Flask(__name__)

# Location of the built frontend (Vite output). May not exist in dev.
REPO_ROOT = Path(__file__).parent.parent.parent
DIST_DIR = REPO_ROOT / "social-poster" / "web" / "dist"

# Load the dev .env early (no-op in prod, where systemd injects the env) so any
# env reads at import time see it. load_config() validates it in main().
config.load_env()

# Credential fields required for each platform.
REQUIRED_CREDS = {
    "instagram": ("ig_user_id", "access_token"),
    "bluesky": ("handle", "app_password"),
}

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"}


# ---------------------------------------------------------------------------
# CORS (permissive, no extra dependency)
# ---------------------------------------------------------------------------
@app.after_request
def add_cors_headers(response):
    """Attach permissive CORS headers so the Vite dev server can call the API."""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response


@app.route("/api/<path:_subpath>", methods=["OPTIONS"])
def cors_preflight(_subpath):
    """Answer CORS preflight requests for any /api route."""
    return ("", 204)


# ---------------------------------------------------------------------------
# Serialization helpers
# ---------------------------------------------------------------------------
def _latest_engagement(conn, target_id: int) -> Optional[Dict]:
    """Return the most recent engagement snapshot for a target, if any."""
    row = conn.execute(
        """
        SELECT likes, comments, reposts, recorded_at
        FROM engagement_snapshots
        WHERE target_id = ?
        ORDER BY recorded_at DESC, id DESC
        LIMIT 1
        """,
        (target_id,),
    ).fetchone()
    if row is None:
        return None
    return {
        "likes": row["likes"],
        "comments": row["comments"],
        "reposts": row["reposts"],
        "recorded_at": row["recorded_at"],
    }


def serialize_targets(conn, post_id: int) -> List[Dict]:
    """Return the targets for a post, joined with account platform/username."""
    rows = conn.execute(
        """
        SELECT pt.id, pt.account_id, pt.caption, pt.status, pt.error,
               pt.posted_at, pt.remote_id, a.platform, a.username
        FROM post_targets pt
        JOIN accounts a ON a.id = pt.account_id
        WHERE pt.post_id = ?
        ORDER BY pt.id
        """,
        (post_id,),
    ).fetchall()
    return [
        {
            "id": row["id"],
            "account_id": row["account_id"],
            "platform": row["platform"],
            "username": row["username"],
            "caption": row["caption"],
            "status": row["status"],
            "error": row["error"],
            "posted_at": row["posted_at"],
            "remote_id": row["remote_id"],
            "engagement": _latest_engagement(conn, row["id"]),
        }
        for row in rows
    ]


def serialize_post(conn, post_row) -> Dict:
    """Serialize a posts row (plus its targets) into the API shape.

    Captions are per-platform (stored per target). ``captions`` maps each
    platform present to its caption; ``caption`` is a representative value (the
    first non-empty caption) kept for compact list/tooltip display.
    """
    targets = serialize_targets(conn, post_row["id"])
    captions: Dict[str, str] = {}
    for target in targets:
        captions.setdefault(target["platform"], target["caption"])
    representative = next(
        (target["caption"] for target in targets if target["caption"]), ""
    )
    return {
        "id": post_row["id"],
        "caption": representative,
        "captions": captions,
        "scheduled_at": post_row["scheduled_at"],
        "image_url": "/api/images/" + post_row["image_filename"],
        "created_at": post_row["created_at"],
        "featured_by": post_row["featured_by"],
        "targets": targets,
    }


def fetch_post(conn, post_id: int) -> Optional[Dict]:
    """Fetch and serialize a single post by id, or return None if missing."""
    row = conn.execute("SELECT * FROM posts WHERE id = ?", (post_id,)).fetchone()
    if row is None:
        return None
    return serialize_post(conn, row)


# ---------------------------------------------------------------------------
# Accounts API
# ---------------------------------------------------------------------------
@app.route("/api/accounts", methods=["GET"])
def list_accounts():
    """Return all accounts as {id, platform, username, display_name}.

    Never returns credentials.
    """
    conn = db.get_connection()
    try:
        rows = conn.execute(
            "SELECT id, platform, username, display_name FROM accounts ORDER BY id"
        ).fetchall()
        accounts = [
            {
                "id": r["id"],
                "platform": r["platform"],
                "username": r["username"],
                "display_name": r["display_name"],
            }
            for r in rows
        ]
        return jsonify(accounts), 200
    finally:
        conn.close()


def parse_account_body(body: Dict) -> Tuple[Optional[str], Dict, Optional[Tuple]]:
    """Validate an account request body.

    Returns ``(platform, creds, error)`` where ``error`` is ``None`` on success
    or a ``(json_response, status_code)`` tuple to return on invalid input.
    """
    platform = body.get("platform")
    if platform not in REQUIRED_CREDS:
        return None, {}, (
            jsonify({"error": "platform must be 'instagram' or 'bluesky'"}),
            400,
        )

    creds = {}
    for field in REQUIRED_CREDS[platform]:
        value = body.get(field)
        if not value:
            return None, {}, (
                jsonify({"error": f"{field} is required for {platform}"}),
                400,
            )
        creds[field] = value

    return platform, creds, None


@app.route("/api/accounts", methods=["POST"])
def create_account():
    """Log in and save an account. Body: {platform, ...creds}.

    The login both verifies the credentials and (for Instagram) primes the
    persisted session. On success the account is saved and the response echoes
    the live profile as a receipt. If the login fails, nothing is saved and a
    400 with the platform error is returned.
    """
    body = request.get_json(silent=True) or {}
    platform, creds, error = parse_account_body(body)
    if error is not None:
        return error

    try:
        profile = platforms.login_and_fetch_profile(platform, creds)
    except Exception as exc:  # bad creds / challenge / network — don't save
        return jsonify({"error": str(exc)[:500]}), 400

    # Prefer the live profile's username; fall back to the first required cred
    # field (e.g. Instagram's numeric user ID) if the profile lacks one.
    username = profile.get("username") or creds[REQUIRED_CREDS[platform][0]]
    display_name = profile.get("display_name")

    conn = db.get_connection()
    try:
        cur = conn.execute(
            "INSERT INTO accounts (platform, username, display_name, credentials, created_at) "
            "VALUES (?, ?, ?, ?, ?)",
            (platform, username, display_name, json.dumps(creds), db.utc_now_iso()),
        )
        conn.commit()
        account_id = cur.lastrowid
        return (
            jsonify(
                {
                    "id": account_id,
                    "platform": platform,
                    "username": username,
                    "display_name": display_name,
                    "avatar_url": profile.get("avatar_url"),
                    "follower_count": profile.get("follower_count"),
                    "post_count": profile.get("post_count"),
                }
            ),
            201,
        )
    finally:
        conn.close()


@app.route("/api/accounts/<int:account_id>", methods=["DELETE"])
def delete_account(account_id: int):
    """Delete an account (cascades to its post_targets)."""
    conn = db.get_connection()
    try:
        conn.execute("DELETE FROM accounts WHERE id = ?", (account_id,))
        conn.commit()
        return ("", 204)
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Posts API
# ---------------------------------------------------------------------------
@app.route("/api/posts", methods=["GET"])
def list_posts():
    """Return all posts in the full serialized shape, newest scheduled first."""
    conn = db.get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM posts ORDER BY scheduled_at"
        ).fetchall()
        return jsonify([serialize_post(conn, r) for r in rows]), 200
    finally:
        conn.close()


def _get_setting(conn, key: str, default):
    """Read a JSON-encoded setting, returning ``default`` if missing/corrupt."""
    row = conn.execute(
        "SELECT value FROM settings WHERE key = ?", (key,)
    ).fetchone()
    if row is None:
        return default
    try:
        return json.loads(row["value"])
    except (json.JSONDecodeError, TypeError):
        return default


def _serialize_bulk_schedule(raw) -> Dict:
    """Return the bulk schedule in its current shape: ``{"slots": [{"day":
    0-6, "time": "HH:MM"}, ...]}`` (days use JS Date.getDay() numbering).

    Migrates the earlier ``{"days": [...], "times": [...]}`` shape by
    expanding the cross-product.
    """
    if isinstance(raw, dict) and isinstance(raw.get("slots"), list):
        return raw
    if (
        isinstance(raw, dict)
        and isinstance(raw.get("days"), list)
        and isinstance(raw.get("times"), list)
    ):
        return {
            "slots": [
                {"day": d, "time": t} for d in raw["days"] for t in raw["times"]
            ]
        }
    return {"slots": []}


def _serialize_settings(conn) -> Dict:
    """Return all app settings in their API shape."""
    return {
        "common_times": _get_setting(conn, "common_times", []),
        "bulk_schedule": _serialize_bulk_schedule(
            _get_setting(conn, "bulk_schedule", None)
        ),
    }


def _valid_hhmm(value) -> bool:
    """True if value is a 'HH:MM' 24-hour time string."""
    if not isinstance(value, str) or len(value) != 5 or value[2] != ":":
        return False
    hh, mm = value[:2], value[3:]
    return (
        hh.isdigit()
        and mm.isdigit()
        and 0 <= int(hh) <= 23
        and 0 <= int(mm) <= 59
    )


@app.route("/api/settings", methods=["GET"])
def get_settings():
    """Return app settings (currently the user's common scheduling times)."""
    conn = db.get_connection()
    try:
        return jsonify(_serialize_settings(conn)), 200
    finally:
        conn.close()


def _valid_bulk_schedule(value) -> bool:
    """True if value is ``{"slots": [{"day": 0-6, "time": "HH:MM"}, ...]}``.

    Each slot pairs a day with a time independently (per-day posting times).
    Days use JavaScript's ``Date.getDay()`` numbering: 0 = Sunday … 6 = Saturday.
    """
    if not isinstance(value, dict) or not isinstance(value.get("slots"), list):
        return False
    return all(
        isinstance(slot, dict)
        and isinstance(slot.get("day"), int)
        and 0 <= slot["day"] <= 6
        and _valid_hhmm(slot.get("time"))
        for slot in value["slots"]
    )


@app.route("/api/settings", methods=["PUT"])
def update_settings():
    """Update settings. Body may include ``common_times`` (list of 'HH:MM')
    and/or ``bulk_schedule`` (``{"days": [...], "times": [...]}``)."""
    body = request.get_json(silent=True) or {}

    conn = db.get_connection()
    try:
        if "bulk_schedule" in body:
            schedule = body["bulk_schedule"]
            if not _valid_bulk_schedule(schedule):
                return (
                    jsonify(
                        {
                            "error": "bulk_schedule must be "
                            '{"slots": [{"day": 0-6, "time": "HH:MM"}]}'
                        }
                    ),
                    400,
                )
            # De-duplicate and keep (day, time) sorted for stable display.
            unique = sorted(
                {(s["day"], s["time"]) for s in schedule["slots"]}
            )
            normalized_schedule = {
                "slots": [{"day": d, "time": t} for d, t in unique]
            }
            conn.execute(
                "INSERT INTO settings (key, value) VALUES ('bulk_schedule', ?) "
                "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
                (json.dumps(normalized_schedule),),
            )
            conn.commit()

        if "common_times" in body:
            times = body["common_times"]
            if not isinstance(times, list) or not all(
                _valid_hhmm(t) for t in times
            ):
                return (
                    jsonify(
                        {"error": "common_times must be a list of 'HH:MM' strings"}
                    ),
                    400,
                )
            # De-duplicate and keep sorted for a stable dropdown order.
            normalized = sorted(set(times))
            conn.execute(
                "INSERT INTO settings (key, value) VALUES ('common_times', ?) "
                "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
                (json.dumps(normalized),),
            )
            conn.commit()

        return jsonify(_serialize_settings(conn)), 200
    finally:
        conn.close()


@app.route("/api/logs", methods=["GET"])
def list_logs():
    """Return recent publish attempts, newest first (append-only audit log)."""
    conn = db.get_connection()
    try:
        rows = conn.execute(
            """
            SELECT id, post_id, target_id, platform, username, status, error,
                   image_filename, caption, attempted_at
            FROM publish_log
            ORDER BY attempted_at DESC, id DESC
            LIMIT 200
            """
        ).fetchall()
        logs = [
            {
                "id": r["id"],
                "post_id": r["post_id"],
                "platform": r["platform"],
                "username": r["username"],
                "status": r["status"],
                "error": r["error"],
                "image_url": (
                    "/api/images/" + r["image_filename"]
                    if r["image_filename"]
                    else None
                ),
                "caption": r["caption"],
                "attempted_at": r["attempted_at"],
            }
            for r in rows
        ]
        return jsonify(logs), 200
    finally:
        conn.close()


def _parse_account_ids(raw: Optional[str]) -> Tuple[Optional[List[int]], Optional[str]]:
    """Parse the account_ids JSON-array form field.

    Returns (account_ids, error_message). On success error_message is None.
    """
    if not raw:
        return None, "account_ids is required"
    try:
        parsed = json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return None, "account_ids must be a JSON array string"
    if not isinstance(parsed, list) or not parsed:
        return None, "account_ids must be a non-empty array"
    try:
        ids = [int(x) for x in parsed]
    except (ValueError, TypeError):
        return None, "account_ids must contain integers"
    return ids, None


def _parse_captions(raw: Optional[str]) -> Tuple[Optional[Dict[str, str]], Optional[str]]:
    """Parse the per-platform ``captions`` JSON-object form field.

    Looks like ``{"instagram": "...", "bluesky": "..."}``. Captions are
    optional, so a missing/empty field yields an empty map (not an error).
    Returns (captions, error_message); error_message is None on success.
    """
    if not raw:
        return {}, None
    try:
        parsed = json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return None, "captions must be a JSON object string"
    if not isinstance(parsed, dict):
        return None, "captions must be a JSON object"
    return {str(k): str(v) for k, v in parsed.items()}, None


def _account_platforms(conn, account_ids: List[int]) -> Tuple[Optional[Dict[int, str]], Optional[str]]:
    """Map each account id to its platform, validating that all exist.

    Returns (id->platform, error_message); error_message is None on success.
    """
    placeholders = ",".join("?" for _ in account_ids)
    rows = conn.execute(
        f"SELECT id, platform FROM accounts WHERE id IN ({placeholders})",
        account_ids,
    ).fetchall()
    found = {row["id"]: row["platform"] for row in rows}
    missing = [i for i in account_ids if i not in found]
    if missing:
        return None, f"unknown account id(s): {missing}"
    return found, None


def _convert_avif_to_jpeg(image, dest_path: str) -> None:
    """Re-encode an uploaded AVIF as JPEG, carrying EXIF and the XMP packet
    through so the tagging script still sees the Lightroom metadata."""
    from PIL import Image

    with Image.open(image.stream) as img:
        kwargs = {}
        exif = img.getexif()
        if exif:
            kwargs["exif"] = exif.tobytes()
        xmp = img.info.get("xmp")
        if xmp:
            kwargs["xmp"] = xmp
        img.convert("RGB").save(dest_path, format="JPEG", quality=92, **kwargs)


def _save_uploaded_image(image) -> Tuple[Optional[str], Optional[Tuple]]:
    """Validate and persist an uploaded image, returning its stored filename.

    AVIF uploads are converted to JPEG: Instagram's Graph API only fetches
    JPEGs and Bluesky doesn't render AVIF, but Lightroom exports arrive as
    AVIF — the conversion keeps their EXIF/XMP so tagging still works.

    Returns ``(filename, error)`` where ``error`` is ``None`` on success or a
    ``(json_response, status_code)`` tuple to return on invalid input.
    """
    ext = Path(image.filename).suffix.lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        return None, (jsonify({"error": "unsupported image type"}), 400)
    db.ensure_dirs()
    # Unique, sanitized filename that keeps the original extension.
    safe_stem = secure_filename(Path(image.filename).stem) or "image"
    if ext == ".avif":
        filename = f"{uuid.uuid4().hex}_{safe_stem}.jpg"
        try:
            _convert_avif_to_jpeg(image, str(db.IMAGES_DIR / filename))
        except Exception as exc:  # noqa: BLE001 - corrupt/unreadable upload
            return None, (
                jsonify({"error": f"could not convert AVIF: {exc}"}),
                400,
            )
        return filename, None
    filename = f"{uuid.uuid4().hex}_{safe_stem}{ext}"
    image.save(str(db.IMAGES_DIR / filename))
    return filename, None


def _delete_image_file(filename: Optional[str]) -> None:
    """Remove an uploaded image file, ignoring it if already gone or unset."""
    if not filename:
        return
    try:
        (db.IMAGES_DIR / filename).unlink()
    except FileNotFoundError:
        pass


def _crop_instagram_variant(source_filename: str, rect: Dict) -> Tuple[str, Dict]:
    """Crop ``source_filename`` to ``rect`` and save a JPEG Instagram variant.

    ``rect`` is ``{x, y, width, height}`` in the image's *display* pixels (the
    same orientation the browser shows, i.e. after EXIF rotation). EXIF
    orientation is baked in first so PIL's pixel grid matches what the user saw.

    Instagram's aspect bounds are exact (0.80 / 1.91), and the 4:5 and 1.91:1
    presets land right on them — so integer-pixel rounding can drift a hair
    outside and Instagram silently rejects the upload. We snap the final pixel
    box strictly inside the range before saving. Raises ``ValueError`` if the
    rect is empty or grossly out of range. Returns ``(filename, final_rect)``,
    where ``final_rect`` is the snapped integer rect (stored so re-opening the
    cropper restores it exactly).
    """
    from PIL import Image, ImageOps

    lo = platforms.INSTAGRAM_MIN_ASPECT
    hi = platforms.INSTAGRAM_MAX_ASPECT

    with Image.open(str(db.IMAGES_DIR / source_filename)) as im:
        im = ImageOps.exif_transpose(im)
        img_w, img_h = im.size
        left = max(0, min(round(rect["x"]), img_w))
        top = max(0, min(round(rect["y"]), img_h))
        right = max(0, min(round(rect["x"] + rect["width"]), img_w))
        bottom = max(0, min(round(rect["y"] + rect["height"]), img_h))
        w = right - left
        h = bottom - top
        if w < 1 or h < 1:
            raise ValueError("Crop area is empty.")
        aspect = w / h
        # A little slack for boundary rounding; reject only genuinely-wrong rects.
        if aspect < lo - 0.05 or aspect > hi + 0.05:
            raise ValueError(
                f"Cropped aspect ratio ({aspect:.2f}) is outside Instagram's "
                "0.80–1.91 range."
            )
        # Snap boundary drift back strictly inside by trimming the long side.
        if aspect < lo:
            h = int(w / lo)
            bottom = top + h
        elif aspect > hi:
            w = int(h * hi)
            right = left + w
        cropped = im.crop((left, top, right, bottom)).convert("RGB")

    stem = Path(source_filename).stem
    filename = f"{uuid.uuid4().hex}_{stem}_ig.jpg"
    cropped.save(str(db.IMAGES_DIR / filename), format="JPEG", quality=92)
    final_rect = {"x": left, "y": top, "width": right - left, "height": bottom - top}
    return filename, final_rect


def _check_instagram_image(filename: str, platforms_in_use) -> Optional[Tuple]:
    """Validate Instagram's aspect-ratio rule when any target is Instagram.

    Returns ``None`` if fine, or a ``(json_response, 400)`` tuple to return when
    the image is out of range. No-op when no Instagram account is targeted.
    """
    if "instagram" not in platforms_in_use:
        return None
    try:
        platforms.validate_instagram_image(str(db.IMAGES_DIR / filename))
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    return None


@app.route("/api/posts", methods=["POST"])
def create_post():
    """Create a scheduled post from multipart/form-data.

    Fields: image (file, required), captions (JSON object of per-platform
    captions, optional), scheduled_at (ISO-8601 str, required),
    account_ids (JSON array string). Each target gets the caption for its
    account's platform.
    """
    image = request.files.get("image")
    scheduled_at = request.form.get("scheduled_at")
    account_ids, ids_err = _parse_account_ids(request.form.get("account_ids"))
    captions, cap_err = _parse_captions(request.form.get("captions"))

    if image is None or not image.filename:
        return jsonify({"error": "image file is required"}), 400
    if not scheduled_at:
        return jsonify({"error": "scheduled_at is required"}), 400
    if ids_err is not None:
        return jsonify({"error": ids_err}), 400
    if cap_err is not None:
        return jsonify({"error": cap_err}), 400

    conn = db.get_connection()
    try:
        platforms_by_id, plat_err = _account_platforms(conn, account_ids)
        if plat_err is not None:
            return jsonify({"error": plat_err}), 400

        filename, img_err = _save_uploaded_image(image)
        if img_err is not None:
            return img_err

        img_check = _check_instagram_image(filename, platforms_by_id.values())
        if img_check is not None:
            _delete_image_file(filename)
            return img_check

        now = db.utc_now_iso()
        cur = conn.execute(
            "INSERT INTO posts (image_filename, caption, scheduled_at, created_at) "
            "VALUES (?, '', ?, ?)",
            (filename, scheduled_at, now),
        )
        post_id = cur.lastrowid
        for account_id in account_ids:
            platform = platforms_by_id[account_id]
            conn.execute(
                "INSERT INTO post_targets (post_id, account_id, caption, status) "
                "VALUES (?, ?, ?, 'scheduled')",
                (post_id, account_id, captions.get(platform, "")),
            )
        conn.commit()
        return jsonify(fetch_post(conn, post_id)), 201
    finally:
        conn.close()


@app.route("/api/posts/<int:post_id>", methods=["PATCH"])
def update_post(post_id: int):
    """Update a post's scheduled_at, caption, and/or featured_by."""
    body = request.get_json(silent=True) or {}

    conn = db.get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM posts WHERE id = ?", (post_id,)
        ).fetchone()
        if row is None:
            return jsonify({"error": "post not found"}), 404

        fields = []
        values: List = []
        if "scheduled_at" in body and body["scheduled_at"]:
            fields.append("scheduled_at = ?")
            values.append(body["scheduled_at"])
        if "caption" in body:
            fields.append("caption = ?")
            values.append(body["caption"])
        if "featured_by" in body:
            fields.append("featured_by = ?")
            values.append(str(body["featured_by"]))

        if fields:
            values.append(post_id)
            conn.execute(
                "UPDATE posts SET " + ", ".join(fields) + " WHERE id = ?",
                values,
            )
            conn.commit()

        return jsonify(fetch_post(conn, post_id)), 200
    finally:
        conn.close()


@app.route("/api/posts/<int:post_id>", methods=["PUT"])
def edit_post(post_id: int):
    """Full edit of a post via multipart/form-data.

    Fields: image (file, optional — replaces the current image when present),
    captions (JSON object, per-platform), scheduled_at (required),
    account_ids (JSON array, required, >=1). Targets are reconciled to match
    account_ids: kept targets get their caption refreshed (status preserved),
    deselected accounts are dropped, newly selected accounts are added as
    'scheduled'.
    """
    image = request.files.get("image")
    scheduled_at = request.form.get("scheduled_at")
    account_ids, ids_err = _parse_account_ids(request.form.get("account_ids"))
    captions, cap_err = _parse_captions(request.form.get("captions"))

    if not scheduled_at:
        return jsonify({"error": "scheduled_at is required"}), 400
    if ids_err is not None:
        return jsonify({"error": ids_err}), 400
    if cap_err is not None:
        return jsonify({"error": cap_err}), 400

    conn = db.get_connection()
    try:
        post = conn.execute(
            "SELECT * FROM posts WHERE id = ?", (post_id,)
        ).fetchone()
        if post is None:
            return jsonify({"error": "post not found"}), 404

        platforms_by_id, plat_err = _account_platforms(conn, account_ids)
        if plat_err is not None:
            return jsonify({"error": plat_err}), 400

        # If a new image was uploaded, persist it first but don't swap it into
        # the post (or change anything else) until validation passes.
        new_filename = None
        if image is not None and image.filename:
            new_filename, img_err = _save_uploaded_image(image)
            if img_err is not None:
                return img_err

        effective_image = new_filename or post["image_filename"]
        img_check = _check_instagram_image(
            effective_image, platforms_by_id.values()
        )
        if img_check is not None:
            if new_filename:
                _delete_image_file(new_filename)
            return img_check

        if new_filename:
            old_filename = post["image_filename"]
            conn.execute(
                "UPDATE posts SET image_filename = ? WHERE id = ?",
                (new_filename, post_id),
            )
            if old_filename != new_filename:
                _delete_image_file(old_filename)

        conn.execute(
            "UPDATE posts SET scheduled_at = ? WHERE id = ?",
            (scheduled_at, post_id),
        )

        # Optional feature-hub log (only when the form sends the field, so
        # older clients can't blank it).
        featured_by = request.form.get("featured_by")
        if featured_by is not None:
            conn.execute(
                "UPDATE posts SET featured_by = ? WHERE id = ?",
                (featured_by, post_id),
            )

        # Reconcile targets against the desired account set, preserving the
        # status of targets that are being kept.
        existing = {
            row["account_id"]: row["id"]
            for row in conn.execute(
                "SELECT id, account_id FROM post_targets WHERE post_id = ?",
                (post_id,),
            ).fetchall()
        }
        desired = set(account_ids)
        for account_id in account_ids:
            caption = captions.get(platforms_by_id[account_id], "")
            if account_id in existing:
                conn.execute(
                    "UPDATE post_targets SET caption = ? WHERE id = ?",
                    (caption, existing[account_id]),
                )
            else:
                conn.execute(
                    "INSERT INTO post_targets (post_id, account_id, caption, status) "
                    "VALUES (?, ?, ?, 'scheduled')",
                    (post_id, account_id, caption),
                )
        for account_id, target_id in existing.items():
            if account_id not in desired:
                conn.execute(
                    "DELETE FROM post_targets WHERE id = ?", (target_id,)
                )

        conn.commit()
        return jsonify(fetch_post(conn, post_id)), 200
    finally:
        conn.close()


@app.route("/api/posts/<int:post_id>/send-now", methods=["POST"])
def send_post_now(post_id: int):
    """Publish a post immediately, in this request.

    Re-queues any previously failed targets so they retry, then publishes the
    post's scheduled targets synchronously (rather than waiting for the next
    scheduler tick). Returns the post with its updated per-target results.
    """
    conn = db.get_connection()
    try:
        post = conn.execute(
            "SELECT id FROM posts WHERE id = ?", (post_id,)
        ).fetchone()
        if post is None:
            return jsonify({"error": "post not found"}), 404
        conn.execute(
            "UPDATE posts SET scheduled_at = ? WHERE id = ?",
            (db.utc_now_iso(), post_id),
        )
        conn.execute(
            "UPDATE post_targets "
            "SET status = 'scheduled', error = NULL, posted_at = NULL "
            "WHERE post_id = ? AND status = 'failed'",
            (post_id,),
        )
        conn.commit()
    finally:
        conn.close()

    # Publish now (opens its own connections); then return the fresh state.
    publisher.publish_post(post_id)

    conn = db.get_connection()
    try:
        return jsonify(fetch_post(conn, post_id)), 200
    finally:
        conn.close()


@app.route("/api/post-targets/<int:target_id>/send-now", methods=["POST"])
def send_target_now(target_id: int):
    """Publish a single account's record (photo×account) immediately.

    Re-queues it first if it had failed, then publishes just that target.
    Refuses if it's already posted. Returns the parent post with fresh state.
    """
    conn = db.get_connection()
    try:
        row = conn.execute(
            "SELECT post_id, status FROM post_targets WHERE id = ?", (target_id,)
        ).fetchone()
        if row is None:
            return jsonify({"error": "target not found"}), 404
        if row["status"] == "posted":
            return jsonify({"error": "already posted"}), 409
        post_id = row["post_id"]
        conn.execute(
            "UPDATE post_targets "
            "SET status = 'scheduled', error = NULL, posted_at = NULL "
            "WHERE id = ? AND status = 'failed'",
            (target_id,),
        )
        conn.commit()
    finally:
        conn.close()

    publisher.publish_target(target_id)

    conn = db.get_connection()
    try:
        return jsonify(fetch_post(conn, post_id)), 200
    finally:
        conn.close()


@app.route("/api/post-targets/<int:target_id>", methods=["DELETE"])
def delete_target(target_id: int):
    """Delete a single account's record for a photo.

    Refuses to delete a record that already posted (it's live). When this was
    the photo's last record, the photo and its image are removed too.
    """
    conn = db.get_connection()
    try:
        row = conn.execute(
            "SELECT post_id, status FROM post_targets WHERE id = ?", (target_id,)
        ).fetchone()
        if row is None:
            return ("", 204)  # already gone — idempotent
        if row["status"] == "posted":
            return jsonify({"error": "cannot delete a posted record"}), 409
        post_id = row["post_id"]
        conn.execute("DELETE FROM post_targets WHERE id = ?", (target_id,))
        remaining = conn.execute(
            "SELECT COUNT(*) AS c FROM post_targets WHERE post_id = ?", (post_id,)
        ).fetchone()["c"]
        image_filename = None
        ig_image_filename = None
        if remaining == 0:
            prow = conn.execute(
                "SELECT image_filename, ig_image_filename FROM posts WHERE id = ?",
                (post_id,),
            ).fetchone()
            if prow:
                image_filename = prow["image_filename"]
                ig_image_filename = prow["ig_image_filename"]
            conn.execute("DELETE FROM posts WHERE id = ?", (post_id,))
        conn.commit()
    finally:
        conn.close()

    _delete_image_file(image_filename)
    _delete_image_file(ig_image_filename)
    return ("", 204)


@app.route("/api/posts/<int:post_id>/mark-sent", methods=["POST"])
def mark_post_sent(post_id: int):
    """Manually mark a post's targets as sent.

    For when a platform actually published the post but our publisher recorded
    an error — notably Instagram's "configure succeeded without media payload",
    where the post frequently goes live anyway. Sets every not-yet-sent target
    to 'posted' and clears its error so the post stops showing as errored.
    """
    conn = db.get_connection()
    try:
        post = conn.execute(
            "SELECT id FROM posts WHERE id = ?", (post_id,)
        ).fetchone()
        if post is None:
            return jsonify({"error": "post not found"}), 404
        conn.execute(
            "UPDATE post_targets "
            "SET status = 'posted', error = NULL, posted_at = ? "
            "WHERE post_id = ? AND status != 'posted'",
            (db.utc_now_iso(), post_id),
        )
        conn.commit()
        return jsonify(fetch_post(conn, post_id)), 200
    finally:
        conn.close()


@app.route("/api/posts/<int:post_id>/engagement/snapshot", methods=["POST"])
def snapshot_post_engagement(post_id: int):
    """Fetch fresh engagement counts for one post's published targets.

    Synchronous (like send-now): hits the platform APIs, appends snapshot
    rows, and returns the post with each target's latest numbers. Targets
    published before remote ids were captured are skipped silently.
    """
    conn = db.get_connection()
    try:
        post = conn.execute(
            "SELECT id FROM posts WHERE id = ?", (post_id,)
        ).fetchone()
        if post is None:
            return jsonify({"error": "post not found"}), 404
    finally:
        conn.close()

    results = engagement.snapshot_targets(post_id)

    conn = db.get_connection()
    try:
        return jsonify({"results": results, "post": fetch_post(conn, post_id)}), 200
    finally:
        conn.close()


@app.route("/api/engagement/snapshot", methods=["POST"])
def snapshot_all_engagement():
    """Fetch fresh engagement counts for every published target."""
    results = engagement.snapshot_targets()
    return jsonify({"results": results}), 200


@app.route("/api/posts/<int:post_id>", methods=["DELETE"])
def delete_post(post_id: int):
    """Delete a post, its image file(s), and (via cascade) its targets."""
    conn = db.get_connection()
    try:
        row = conn.execute(
            "SELECT image_filename, ig_image_filename FROM posts WHERE id = ?",
            (post_id,),
        ).fetchone()
        if row is not None:
            _delete_image_file(row["image_filename"])
            _delete_image_file(row["ig_image_filename"])
            conn.execute("DELETE FROM posts WHERE id = ?", (post_id,))
            conn.commit()
        return ("", 204)
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Bulk ingestion API
#
# Staging pipeline: photos are bulk-uploaded into ``ingest_items``, a
# background thread fills in each item's description via the tagging script,
# the user reviews/edits the descriptions in the UI, and approving converts
# the items into real scheduled posts (one per photo).
# ---------------------------------------------------------------------------
def _ig_aspect_ok(filename: str) -> bool:
    """Whether an image's aspect ratio already satisfies Instagram's range.

    Reads only the header (no full decode), so it's cheap to call per item.
    A missing/unreadable file is treated as "ok" — the real validation on
    approve/publish will surface any genuine problem.
    """
    from PIL import Image

    try:
        with Image.open(str(db.IMAGES_DIR / filename)) as im:
            width, height = im.size
    except Exception:  # noqa: BLE001 - missing/corrupt file, don't flag a crop
        return True
    if not height:
        return True
    aspect = width / height
    return platforms.INSTAGRAM_MIN_ASPECT <= aspect <= platforms.INSTAGRAM_MAX_ASPECT


def serialize_ingest_item(row) -> Dict:
    """Serialize an ingest_items row into its API shape."""
    try:
        captions = json.loads(row["captions"])
    except (json.JSONDecodeError, TypeError):
        captions = {}
    try:
        tag_pools = json.loads(row["tag_pools"])
    except (json.JSONDecodeError, TypeError, IndexError):
        tag_pools = {}
    ig_filename = row["ig_image_filename"]
    try:
        ig_crop = json.loads(row["ig_crop"]) if row["ig_crop"] else None
    except (json.JSONDecodeError, TypeError):
        ig_crop = None
    return {
        "id": row["id"],
        "image_url": "/api/images/" + row["image_filename"],
        # The Instagram-cropped variant, if the user made one; Instagram posts
        # this while Bluesky keeps the original framing.
        "ig_image_url": ("/api/images/" + ig_filename) if ig_filename else None,
        # The crop rectangle behind that variant (original natural pixels), so
        # re-opening the cropper restores the previous framing.
        "ig_crop": ig_crop,
        # True when the original is outside Instagram's aspect range and hasn't
        # been cropped yet — the UI shows a "crop required" warning for it.
        "needs_ig_crop": ig_filename is None
        and not _ig_aspect_ok(row["image_filename"]),
        "captions": captions,
        "tag_pools": tag_pools,
        "tag_status": row["tag_status"],
        "tag_error": row["tag_error"],
        "created_at": row["created_at"],
    }


def _run_tagging(item_ids: List[int]) -> None:
    """Extract per-platform captions for each staged item (daemon thread).

    Items are processed one at a time with a fresh connection each, so a slow
    tagging script never holds a long write lock. An item edited by the user
    before tagging finishes (tag_status no longer 'pending') is left alone —
    the user's text wins. A failure marks just that item as failed.
    """
    for item_id in item_ids:
        conn = db.get_connection()
        try:
            row = conn.execute(
                "SELECT image_filename, tag_status FROM ingest_items WHERE id = ?",
                (item_id,),
            ).fetchone()
            if row is None or row["tag_status"] != "pending":
                continue  # discarded or already edited by the user
            try:
                path = str(db.IMAGES_DIR / row["image_filename"])
                captions = tagging.extract_captions(path)
                # Pools drive the pill editor; if they can't be built the caption
                # still stands (same preconditions, so this only trips defensively).
                try:
                    tag_pools = tagging.extract_tag_pools(path)
                except Exception:  # noqa: BLE001
                    tag_pools = {}
                conn.execute(
                    "UPDATE ingest_items SET captions = ?, tag_pools = ?, "
                    "tag_status = 'tagged' WHERE id = ? AND tag_status = 'pending'",
                    (json.dumps(captions), json.dumps(tag_pools), item_id),
                )
            except Exception as exc:  # noqa: BLE001 - one bad image must not kill the batch.
                conn.execute(
                    "UPDATE ingest_items SET tag_status = 'failed', tag_error = ? "
                    "WHERE id = ? AND tag_status = 'pending'",
                    (str(exc), item_id),
                )
            conn.commit()
        finally:
            conn.close()


@app.route("/api/ingest", methods=["GET"])
def list_ingest_items():
    """Return all staged ingest items, oldest first (their slot order)."""
    conn = db.get_connection()
    try:
        rows = conn.execute("SELECT * FROM ingest_items ORDER BY id").fetchall()
        return jsonify([serialize_ingest_item(r) for r in rows]), 200
    finally:
        conn.close()


@app.route("/api/ingest", methods=["POST"])
def create_ingest_items():
    """Stage photos for bulk ingestion from multipart/form-data.

    Field: images (one or more files). All files are validated up front so a
    bad file rejects the whole batch before anything is saved. Returns the
    created items immediately with tag_status 'pending'; a background thread
    fills in descriptions via the tagging script.
    """
    images = [f for f in request.files.getlist("images") if f and f.filename]
    if not images:
        return jsonify({"error": "at least one image file is required"}), 400
    bad = [
        f.filename
        for f in images
        if Path(f.filename).suffix.lower() not in ALLOWED_IMAGE_EXTENSIONS
    ]
    if bad:
        return jsonify({"error": f"unsupported image type(s): {bad}"}), 400

    conn = db.get_connection()
    try:
        now = db.utc_now_iso()
        created_ids: List[int] = []
        for image in images:
            filename, img_err = _save_uploaded_image(image)
            if img_err is not None:
                return img_err
            cur = conn.execute(
                "INSERT INTO ingest_items (image_filename, created_at) "
                "VALUES (?, ?)",
                (filename, now),
            )
            created_ids.append(cur.lastrowid)
        conn.commit()

        threading.Thread(
            target=_run_tagging,
            args=(created_ids,),
            name="ingest-tagging",
            daemon=True,
        ).start()

        placeholders = ",".join("?" for _ in created_ids)
        rows = conn.execute(
            f"SELECT * FROM ingest_items WHERE id IN ({placeholders}) ORDER BY id",
            created_ids,
        ).fetchall()
        return jsonify([serialize_ingest_item(r) for r in rows]), 201
    finally:
        conn.close()


@app.route("/api/ingest/<int:item_id>", methods=["PATCH"])
def update_ingest_item(item_id: int):
    """Update a staged item's captions (the user editing during review).

    Body: ``{"captions": {"instagram": "...", "bluesky": "..."}}`` and
    optionally ``{"tag_pools": {...}}`` to persist the draggable pill
    order/selection. Also promotes a still-'pending' item to 'tagged' so the
    tagging thread won't overwrite the user's edits if it finishes later.
    """
    body = request.get_json(silent=True) or {}
    captions = body.get("captions")
    if not isinstance(captions, dict):
        return jsonify({"error": "captions must be a JSON object"}), 400
    tag_pools = body.get("tag_pools")
    if tag_pools is not None and not isinstance(tag_pools, dict):
        return jsonify({"error": "tag_pools must be a JSON object"}), 400

    conn = db.get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM ingest_items WHERE id = ?", (item_id,)
        ).fetchone()
        if row is None:
            return jsonify({"error": "ingest item not found"}), 404
        if tag_pools is None:
            conn.execute(
                "UPDATE ingest_items SET captions = ?, tag_status = 'tagged', "
                "tag_error = NULL WHERE id = ?",
                (json.dumps({str(k): str(v) for k, v in captions.items()}), item_id),
            )
        else:
            conn.execute(
                "UPDATE ingest_items SET captions = ?, tag_pools = ?, "
                "tag_status = 'tagged', tag_error = NULL WHERE id = ?",
                (
                    json.dumps({str(k): str(v) for k, v in captions.items()}),
                    json.dumps(tag_pools),
                    item_id,
                ),
            )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM ingest_items WHERE id = ?", (item_id,)
        ).fetchone()
        return jsonify(serialize_ingest_item(row)), 200
    finally:
        conn.close()


@app.route("/api/ingest/<int:item_id>/crop", methods=["POST"])
def crop_ingest_item(item_id: int):
    """Make (or replace) an item's Instagram-cropped image variant.

    Body: ``{"x", "y", "width", "height"}`` — the crop rectangle in the
    image's display pixels. The original is left untouched (Bluesky keeps it);
    only Instagram publishes the crop. Rejects a rect whose aspect ratio falls
    outside Instagram's range. Returns the updated item.
    """
    body = request.get_json(silent=True) or {}
    try:
        rect = {k: float(body[k]) for k in ("x", "y", "width", "height")}
    except (KeyError, TypeError, ValueError):
        return jsonify({"error": "x, y, width and height are required"}), 400

    conn = db.get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM ingest_items WHERE id = ?", (item_id,)
        ).fetchone()
        if row is None:
            return jsonify({"error": "ingest item not found"}), 404
        try:
            new_filename, final_rect = _crop_instagram_variant(
                row["image_filename"], rect
            )
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400
        _delete_image_file(row["ig_image_filename"])  # replace any prior crop
        conn.execute(
            "UPDATE ingest_items SET ig_image_filename = ?, ig_crop = ? "
            "WHERE id = ?",
            (new_filename, json.dumps(final_rect), item_id),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM ingest_items WHERE id = ?", (item_id,)
        ).fetchone()
        return jsonify(serialize_ingest_item(row)), 200
    finally:
        conn.close()


@app.route("/api/ingest/<int:item_id>", methods=["DELETE"])
def delete_ingest_item(item_id: int):
    """Discard a staged item and its uploaded image file(s)."""
    conn = db.get_connection()
    try:
        row = conn.execute(
            "SELECT image_filename, ig_image_filename FROM ingest_items "
            "WHERE id = ?",
            (item_id,),
        ).fetchone()
        if row is not None:
            _delete_image_file(row["image_filename"])
            _delete_image_file(row["ig_image_filename"])
            conn.execute("DELETE FROM ingest_items WHERE id = ?", (item_id,))
            conn.commit()
        return ("", 204)
    finally:
        conn.close()


@app.route("/api/ingest/approve", methods=["POST"])
def approve_ingest_items():
    """Convert approved staged items into scheduled posts.

    JSON body: ``account_ids`` (targets for every item) and ``items``, a list
    of ``{"id": ..., "scheduled_at": ISO-8601, "captions": {platform: str}}``.
    Each target gets the caption for its account's platform, same as regular
    post creation. All items are validated first — unknown ids, missing
    times, or Instagram-incompatible images reject the whole batch — then
    every item becomes a post and its staging row is removed (image files are
    kept; posts reuse them).
    """
    body = request.get_json(silent=True) or {}
    account_ids = body.get("account_ids")
    items = body.get("items")

    if not isinstance(account_ids, list) or not account_ids:
        return jsonify({"error": "account_ids must be a non-empty array"}), 400
    try:
        account_ids = [int(x) for x in account_ids]
    except (ValueError, TypeError):
        return jsonify({"error": "account_ids must contain integers"}), 400
    if not isinstance(items, list) or not items:
        return jsonify({"error": "items must be a non-empty array"}), 400
    for item in items:
        if not isinstance(item, dict) or not item.get("id"):
            return jsonify({"error": "each item needs an id"}), 400
        if not item.get("scheduled_at"):
            return jsonify({"error": "each item needs a scheduled_at"}), 400

    conn = db.get_connection()
    try:
        platforms_by_id, plat_err = _account_platforms(conn, account_ids)
        if plat_err is not None:
            return jsonify({"error": plat_err}), 400

        item_ids = [int(item["id"]) for item in items]
        placeholders = ",".join("?" for _ in item_ids)
        rows = conn.execute(
            f"SELECT * FROM ingest_items WHERE id IN ({placeholders})",
            item_ids,
        ).fetchall()
        rows_by_id = {row["id"]: row for row in rows}
        missing = [i for i in item_ids if i not in rows_by_id]
        if missing:
            return jsonify({"error": f"unknown ingest item id(s): {missing}"}), 400

        # Validate every image before creating anything, so approval is
        # all-or-nothing and a bad image names its file in the error.
        for item_id in item_ids:
            row = rows_by_id[item_id]
            # Instagram publishes the cropped variant when one exists, so
            # validate that; Bluesky is unaffected either way.
            img_check = _check_instagram_image(
                row["ig_image_filename"] or row["image_filename"],
                platforms_by_id.values(),
            )
            if img_check is not None:
                response, status = img_check
                payload = response.get_json()
                payload["item_id"] = item_id
                return jsonify(payload), status

        now = db.utc_now_iso()
        created: List[Dict] = []
        for item in items:
            row = rows_by_id[int(item["id"])]
            captions = item.get("captions") or {}
            if not isinstance(captions, dict):
                captions = {}
            cur = conn.execute(
                "INSERT INTO posts (image_filename, ig_image_filename, caption, "
                "scheduled_at, created_at) VALUES (?, ?, '', ?, ?)",
                (
                    row["image_filename"],
                    row["ig_image_filename"],
                    str(item["scheduled_at"]),
                    now,
                ),
            )
            post_id = cur.lastrowid
            for account_id in account_ids:
                platform = platforms_by_id[account_id]
                conn.execute(
                    "INSERT INTO post_targets (post_id, account_id, caption, status) "
                    "VALUES (?, ?, ?, 'scheduled')",
                    (post_id, account_id, str(captions.get(platform, ""))),
                )
            conn.execute(
                "DELETE FROM ingest_items WHERE id = ?", (row["id"],)
            )
            created.append(fetch_post(conn, post_id))
        conn.commit()
        return jsonify(created), 201
    finally:
        conn.close()


@app.route("/api/tagging/preview", methods=["POST"])
def tagging_preview():
    """Generate per-platform captions for an image without staging it.

    Used by the single-post modal to pre-fill captions when a photo is
    chosen. Returns ``{"captions": {...}, "error": null}`` on success, or
    ``{"captions": {}, "error": msg}`` when the photo lacks usable metadata —
    that's a normal outcome (captions get written by hand), not a request
    failure, so it's still a 200.
    """
    image = request.files.get("image")
    if image is None or not image.filename:
        return jsonify({"error": "image file is required"}), 400
    ext = Path(image.filename).suffix.lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        return jsonify({"error": "unsupported image type"}), 400

    with tempfile.NamedTemporaryFile(suffix=ext) as tmp:
        image.save(tmp.name)
        try:
            captions = tagging.extract_captions(tmp.name)
        except Exception as exc:  # noqa: BLE001 - missing metadata is expected.
            return jsonify({"captions": {}, "error": str(exc)}), 200
    return jsonify({"captions": captions, "error": None}), 200


@app.route("/api/tagging/check", methods=["POST"])
def tagging_check():
    """Report which Lightroom keywords on a batch of photos aren't registered.

    Field: images (one or more files). Every ``cameracoffeewander|...`` keyword
    across the batch is merged into one hierarchy tree, annotated with whether
    each node exists in ``config/tags.json`` and pruned to just the branches
    that lead to a missing node — so the caller can render exactly the tags
    that still need making, in context. Nothing is staged or saved; photos are
    inspected in temp files and discarded.

    Returns ``{"tree": [...], "missing": [...], "files": [{"filename",
    "error"}]}``. ``tree`` nodes are ``{"name", "exists", "children"}``;
    ``missing`` is the deduplicated ``A|B|C`` worklist. Photos missing usable
    metadata carry an ``error``; that's a normal per-photo outcome, so the
    request still succeeds (200).
    """
    images = [f for f in request.files.getlist("images") if f and f.filename]
    if not images:
        return jsonify({"error": "at least one image file is required"}), 400
    bad = [
        f.filename
        for f in images
        if Path(f.filename).suffix.lower() not in ALLOWED_IMAGE_EXTENSIONS
    ]
    if bad:
        return jsonify({"error": f"unsupported image type(s): {bad}"}), 400

    files: List[Dict] = []
    all_paths: List[List[str]] = []
    for image in images:
        ext = Path(image.filename).suffix.lower()
        with tempfile.NamedTemporaryFile(suffix=ext) as tmp:
            image.save(tmp.name)
            try:
                all_paths.extend(tagging.keyword_paths(tmp.name))
                error = None
            except Exception as exc:  # noqa: BLE001 - missing metadata is expected.
                error = str(exc)
        files.append({"filename": image.filename, "error": error})

    return (
        jsonify(
            {
                "tree": tagging.tag_status_tree(all_paths),
                "missing": tagging.missing_paths(all_paths),
                "files": files,
            }
        ),
        200,
    )


@app.route("/api/images/<path:filename>", methods=["GET"])
def serve_image(filename: str):
    """Serve an uploaded image, guarding against path traversal."""
    if "/" in filename or ".." in filename:
        return jsonify({"error": "invalid filename"}), 400
    db.ensure_dirs()
    return send_from_directory(str(db.IMAGES_DIR), filename)


# ---------------------------------------------------------------------------
# Frontend (built SPA) serving
# ---------------------------------------------------------------------------
@app.route("/")
@app.route("/<path:req_path>")
def serve_frontend(req_path: str = ""):
    """Serve the built SPA, or a dev note if no build exists.

    Any non-/api path falls through to here. Static assets under
    ``dist/assets`` are served directly; every other path returns
    ``index.html`` so client-side routing works.
    """
    # /api routes are handled by their own handlers; this guards stray paths.
    if req_path.startswith("api/"):
        return jsonify({"error": "not found"}), 404

    if not DIST_DIR.exists():
        return jsonify(
            {"status": "backend running, frontend served by vite in dev"}
        )

    # Serve real static files (e.g. assets/...) when they exist.
    if req_path:
        candidate = DIST_DIR / req_path
        if candidate.is_file():
            return send_from_directory(str(DIST_DIR), req_path)

    index = DIST_DIR / "index.html"
    if index.is_file():
        return send_from_directory(str(DIST_DIR), "index.html")
    return jsonify(
        {"status": "backend running, frontend served by vite in dev"}
    )


# ---------------------------------------------------------------------------
# In-process publisher (background scheduler)
# ---------------------------------------------------------------------------
def _publisher_loop(interval: int) -> None:
    """Run the publisher every ``interval`` seconds until the process exits.

    Runs in a daemon thread inside the web server, so there's no separate
    timer/cron to manage and it shares this process's DATA_DIR. Any error in a
    single run is logged and swallowed so the loop keeps going.
    """
    while True:
        try:
            publisher.main()
        except Exception:  # noqa: BLE001 - one bad run must not kill the loop.
            traceback.print_exc()
        time.sleep(interval)


def start_publisher(cfg: Dict) -> None:
    """Start the background publisher thread unless explicitly disabled.

    Set ``PUBLISHER_DISABLED=1`` to turn it off (e.g. if you'd rather drive the
    publisher from an external cron/systemd timer). ``PUBLISHER_INTERVAL``
    overrides the default 60-second cadence.
    """
    if cfg["publisher_disabled"]:
        print("publisher: in-process scheduler disabled (PUBLISHER_DISABLED=1)")
        return
    interval = cfg["publisher_interval"]
    thread = threading.Thread(
        target=_publisher_loop,
        args=(interval,),
        name="publisher",
        daemon=True,
    )
    thread.start()
    print(f"publisher: in-process scheduler started (every {interval}s)")


def main():
    """Validate config, initialize the database, start the publisher, and serve."""
    cfg = config.load_config()  # fails fast on a bad/missing env
    if cfg["dry_run"]:
        print("social-poster: DRY_RUN=1 — posts will be simulated, not sent")
    db.init_db()
    start_publisher(cfg)
    # Bind to all interfaces so it's reachable on the local network.
    app.run(host="0.0.0.0", port=cfg["port"])


if __name__ == "__main__":
    main()
