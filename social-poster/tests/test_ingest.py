"""Tests for the bulk-ingestion staging pipeline (upload → tag → approve)."""

import json
import sys
from io import BytesIO
from pathlib import Path
from unittest.mock import patch

_SCRIPTS = Path(__file__).parent.parent / "scripts"
sys.path.insert(0, str(_SCRIPTS))

import db  # noqa: E402
import server  # noqa: E402
import tagging  # noqa: E402


def _use_temp_db(tmp_path, monkeypatch):
    """Point db at a throwaway directory and initialize the schema."""
    monkeypatch.setattr(db, "DATA_DIR", tmp_path)
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "social-poster.db")
    monkeypatch.setattr(db, "IMAGES_DIR", tmp_path / "images")
    db.init_db()


class _InlineThread:
    """Stand-in for threading.Thread that runs the target synchronously on
    start(), so tests see tagging results without polling."""

    def __init__(self, target=None, args=(), **_kwargs):
        self._target = target
        self._args = args

    def start(self):
        self._target(*self._args)


class _NeverRunsThread(_InlineThread):
    """Thread stand-in whose target never runs (simulates a slow script)."""

    def start(self):
        pass


def _client():
    return server.app.test_client()


def _upload(client, filenames):
    return client.post(
        "/api/ingest",
        data={"images": [(BytesIO(b"fake image bytes"), name) for name in filenames]},
        content_type="multipart/form-data",
    )


def _jpeg_bytes(width, height):
    """A solid-color JPEG of the given size, for real crop/aspect tests."""
    from io import BytesIO as _BytesIO

    from PIL import Image

    buf = _BytesIO()
    Image.new("RGB", (width, height), (120, 140, 160)).save(buf, format="JPEG")
    return buf.getvalue()


def _upload_real(client, name, width, height):
    return client.post(
        "/api/ingest",
        data={"images": [(BytesIO(_jpeg_bytes(width, height)), name)]},
        content_type="multipart/form-data",
    )


def _seed_bluesky_account():
    """Insert a Bluesky account (no image validation) and return its id."""
    conn = db.get_connection()
    try:
        creds = json.dumps({"handle": "me.bsky.social", "app_password": "pw"})
        account_id = conn.execute(
            "INSERT INTO accounts (platform, username, credentials, created_at) "
            "VALUES ('bluesky', 'me.bsky.social', ?, '2026-01-01T00:00:00Z')",
            (creds,),
        ).lastrowid
        conn.commit()
        return account_id
    finally:
        conn.close()


def test_upload_stages_items_and_fills_descriptions(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    client = _client()

    with patch.object(server.threading, "Thread", _InlineThread), patch.object(
        tagging, "extract_captions", return_value={"instagram": "a sunny trail #ig", "bluesky": "a sunny trail"}
    ):
        res = _upload(client, ["a.jpg", "b.png"])

    assert res.status_code == 201
    items = res.get_json()
    assert len(items) == 2

    listed = client.get("/api/ingest").get_json()
    assert [i["tag_status"] for i in listed] == ["tagged", "tagged"]
    assert [i["captions"]["bluesky"] for i in listed] == ["a sunny trail"] * 2
    # The uploaded files landed in the images dir.
    assert len(list((tmp_path / "images").iterdir())) == 2


def test_tall_image_flags_ig_crop_and_crop_creates_variant(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    client = _client()

    # A 400x800 (0.5) photo is too tall for Instagram — flagged for cropping.
    with patch.object(server.threading, "Thread", _NeverRunsThread):
        res = _upload_real(client, "tall.jpg", 400, 800)
    item = res.get_json()[0]
    assert item["needs_ig_crop"] is True
    assert item["ig_image_url"] is None

    # Crop to a valid 4:5 (0.8) region — the middle 400x500 band.
    res = client.post(
        f"/api/ingest/{item['id']}/crop",
        json={"x": 0, "y": 150, "width": 400, "height": 500},
    )
    assert res.status_code == 200
    cropped = res.get_json()
    assert cropped["needs_ig_crop"] is False
    assert cropped["ig_image_url"] is not None
    # The crop rect round-trips so re-opening the cropper can restore it.
    assert cropped["ig_crop"] == {"x": 0, "y": 150, "width": 400, "height": 500}

    # The variant is a real file with the requested dimensions.
    from PIL import Image

    ig_name = cropped["ig_image_url"].rsplit("/", 1)[-1]
    with Image.open(tmp_path / "images" / ig_name) as im:
        assert im.size == (400, 500)


def test_crop_snaps_boundary_rounding_into_range(tmp_path, monkeypatch):
    # A 4:5 crop can round a hair under 0.80 (e.g. 1004x1256 = 0.7994) and be
    # rejected by Instagram's exact check — the server must snap it back inside.
    _use_temp_db(tmp_path, monkeypatch)
    client = _client()

    with patch.object(server.threading, "Thread", _NeverRunsThread):
        res = _upload_real(client, "p.jpg", 1004, 1256)
    item = res.get_json()[0]
    assert item["needs_ig_crop"] is True  # 0.7994 < 0.80

    res = client.post(
        f"/api/ingest/{item['id']}/crop",
        json={"x": 0, "y": 0, "width": 1004, "height": 1256},
    )
    assert res.status_code == 200
    ig_name = res.get_json()["ig_image_url"].rsplit("/", 1)[-1]

    # The saved variant now passes Instagram's strict validation (no raise).
    server.platforms.validate_instagram_image(str(tmp_path / "images" / ig_name))

    from PIL import Image

    with Image.open(tmp_path / "images" / ig_name) as im:
        w, h = im.size
    assert w / h >= 0.8


def test_crop_rejects_out_of_range_aspect(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    client = _client()

    with patch.object(server.threading, "Thread", _NeverRunsThread):
        res = _upload_real(client, "tall.jpg", 400, 800)
    item = res.get_json()[0]

    # A 400x800 (0.5) crop is still outside Instagram's range — rejected.
    res = client.post(
        f"/api/ingest/{item['id']}/crop",
        json={"x": 0, "y": 0, "width": 400, "height": 800},
    )
    assert res.status_code == 400
    assert "Instagram" in res.get_json()["error"]


def test_approve_carries_ig_crop_to_post(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    client = _client()
    account_id = _seed_bluesky_account()

    with patch.object(server.threading, "Thread", _NeverRunsThread):
        res = _upload_real(client, "tall.jpg", 400, 800)
    item = res.get_json()[0]
    client.post(
        f"/api/ingest/{item['id']}/crop",
        json={"x": 0, "y": 150, "width": 400, "height": 500},
    )

    res = client.post(
        "/api/ingest/approve",
        json={
            "account_ids": [account_id],
            "items": [
                {
                    "id": item["id"],
                    "scheduled_at": "2999-01-01T00:00:00Z",
                    "captions": {"bluesky": "hi"},
                }
            ],
        },
    )
    assert res.status_code == 201

    conn = db.get_connection()
    try:
        row = conn.execute(
            "SELECT ig_image_filename FROM posts ORDER BY id DESC LIMIT 1"
        ).fetchone()
    finally:
        conn.close()
    assert row["ig_image_filename"] is not None


def test_upload_rejects_unsupported_type_before_saving(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    client = _client()

    with patch.object(server.threading, "Thread", _InlineThread):
        res = _upload(client, ["a.jpg", "notes.txt"])

    assert res.status_code == 400
    assert "notes.txt" in res.get_json()["error"]
    assert client.get("/api/ingest").get_json() == []


def test_tagging_failure_marks_item_failed(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    client = _client()

    with patch.object(server.threading, "Thread", _InlineThread), patch.object(
        tagging, "extract_captions", side_effect=ValueError("no EXIF")
    ):
        _upload(client, ["a.jpg"])

    item = client.get("/api/ingest").get_json()[0]
    assert item["tag_status"] == "failed"
    assert item["tag_error"] == "no EXIF"


def test_user_edit_wins_over_late_tagging(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    client = _client()

    # Upload without running the tagging thread (simulates a slow script).
    with patch.object(server.threading, "Thread", _NeverRunsThread):
        res = _upload(client, ["a.jpg"])
    item_id = res.get_json()[0]["id"]

    res = client.patch(
        f"/api/ingest/{item_id}",
        json={"captions": {"instagram": "my own words", "bluesky": "my own words"}},
    )
    assert res.status_code == 200
    assert res.get_json()["tag_status"] == "tagged"

    # The tagging thread finishing later must not clobber the user's text.
    with patch.object(
        tagging, "extract_captions", return_value={"instagram": "robot words"}
    ):
        server._run_tagging([item_id])

    item = client.get("/api/ingest").get_json()[0]
    assert item["captions"]["instagram"] == "my own words"


def test_delete_removes_item_and_image(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    client = _client()

    with patch.object(server.threading, "Thread", _InlineThread):
        res = _upload(client, ["a.jpg"])
    item_id = res.get_json()[0]["id"]

    assert client.delete(f"/api/ingest/{item_id}").status_code == 204
    assert client.get("/api/ingest").get_json() == []
    assert list((tmp_path / "images").iterdir()) == []


def test_approve_converts_items_to_posts(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    client = _client()
    account_id = _seed_bluesky_account()

    with patch.object(server.threading, "Thread", _InlineThread), patch.object(
        tagging, "extract_captions", return_value={}
    ):
        res = _upload(client, ["a.jpg", "b.jpg"])
    ids = [i["id"] for i in res.get_json()]

    res = client.post(
        "/api/ingest/approve",
        json={
            "account_ids": [account_id],
            "items": [
                {
                    "id": ids[0],
                    "scheduled_at": "2999-01-05T09:00:00Z",
                    "captions": {"bluesky": "one"},
                },
                {
                    "id": ids[1],
                    "scheduled_at": "2999-01-09T09:00:00Z",
                    "captions": {"bluesky": "two"},
                },
            ],
        },
    )
    assert res.status_code == 201
    created = res.get_json()
    assert [p["scheduled_at"] for p in created] == [
        "2999-01-05T09:00:00Z",
        "2999-01-09T09:00:00Z",
    ]
    assert [p["caption"] for p in created] == ["one", "two"]
    assert all(t["status"] == "scheduled" for p in created for t in p["targets"])

    # Staging is now empty, but the images survive (the posts own them).
    assert client.get("/api/ingest").get_json() == []
    assert len(list((tmp_path / "images").iterdir())) == 2
    assert len(client.get("/api/posts").get_json()) == 2


def test_approve_rejects_unknown_item_atomically(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    client = _client()
    account_id = _seed_bluesky_account()

    with patch.object(server.threading, "Thread", _InlineThread), patch.object(
        tagging, "extract_captions", return_value={}
    ):
        res = _upload(client, ["a.jpg"])
    item_id = res.get_json()[0]["id"]

    res = client.post(
        "/api/ingest/approve",
        json={
            "account_ids": [account_id],
            "items": [
                {"id": item_id, "scheduled_at": "2999-01-05T09:00:00Z"},
                {"id": 9999, "scheduled_at": "2999-01-09T09:00:00Z"},
            ],
        },
    )
    assert res.status_code == 400
    # Nothing was created and the valid item is still staged.
    assert client.get("/api/posts").get_json() == []
    assert len(client.get("/api/ingest").get_json()) == 1


def test_avif_upload_is_converted_to_jpeg(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    client = _client()

    from PIL import Image

    buf = BytesIO()
    Image.new("RGB", (16, 16), "teal").save(buf, format="AVIF")
    buf.seek(0)

    with patch.object(server.threading, "Thread", _InlineThread), patch.object(
        tagging, "extract_captions", return_value={}
    ):
        res = client.post(
            "/api/ingest",
            data={"images": [(buf, "photo.avif")]},
            content_type="multipart/form-data",
        )

    assert res.status_code == 201
    assert res.get_json()[0]["image_url"].endswith(".jpg")
    stored = list((tmp_path / "images").iterdir())
    assert len(stored) == 1
    with Image.open(stored[0]) as img:
        assert img.format == "JPEG"


def test_tagging_preview_endpoint(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    client = _client()

    with patch.object(
        tagging, "extract_captions", return_value={"instagram": "generated"}
    ):
        res = client.post(
            "/api/tagging/preview",
            data={"image": (BytesIO(b"img"), "a.jpg")},
            content_type="multipart/form-data",
        )
    assert res.status_code == 200
    assert res.get_json() == {"captions": {"instagram": "generated"}, "error": None}

    with patch.object(
        tagging, "extract_captions", side_effect=ValueError("No XMP metadata")
    ):
        res = client.post(
            "/api/tagging/preview",
            data={"image": (BytesIO(b"img"), "a.jpg")},
            content_type="multipart/form-data",
        )
    body = res.get_json()
    assert res.status_code == 200
    assert body["captions"] == {}
    assert "No XMP metadata" in body["error"]


def test_bulk_schedule_setting_roundtrip(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    client = _client()

    assert client.get("/api/settings").get_json()["bulk_schedule"] == {"slots": []}

    res = client.put(
        "/api/settings",
        json={
            "bulk_schedule": {
                "slots": [
                    {"day": 5, "time": "13:00"},
                    {"day": 1, "time": "01:00"},
                    {"day": 1, "time": "01:00"},  # dupe collapses
                ]
            }
        },
    )
    assert res.status_code == 200
    assert res.get_json()["bulk_schedule"] == {
        "slots": [{"day": 1, "time": "01:00"}, {"day": 5, "time": "13:00"}]
    }

    res = client.put(
        "/api/settings",
        json={"bulk_schedule": {"slots": [{"day": 7, "time": "01:00"}]}},
    )
    assert res.status_code == 400


def test_bulk_schedule_migrates_old_days_times_shape(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    conn = db.get_connection()
    conn.execute(
        "INSERT INTO settings (key, value) VALUES ('bulk_schedule', ?)",
        (json.dumps({"days": [1, 5], "times": ["01:00"]}),),
    )
    conn.commit()
    conn.close()

    schedule = _client().get("/api/settings").get_json()["bulk_schedule"]
    assert schedule == {
        "slots": [{"day": 1, "time": "01:00"}, {"day": 5, "time": "01:00"}]
    }


# --- Tag checker (POST /api/tagging/check) ----------------------------------


def _check(client, filenames):
    return client.post(
        "/api/tagging/check",
        data={"images": [(BytesIO(b"fake image bytes"), name) for name in filenames]},
        content_type="multipart/form-data",
    )


def test_tag_check_merges_batch_into_status_tree(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    client = _client()

    # Point the tag tree at a temp file so existence is deterministic.
    tags_path = tmp_path / "tags.json"
    tags_path.write_text(json.dumps({"Place": {"USA": {"California": {}}}}))
    monkeypatch.setattr(tagging, "TAGS_PATH", tags_path)

    # Two photos' keyword paths are merged across the batch.
    with patch.object(
        tagging,
        "keyword_paths",
        side_effect=[
            [["Place", "USA", "California"]],  # fully registered → pruned
            [["Place", "USA", "Atlantis", "State"]],  # missing branch
        ],
    ):
        res = _check(client, ["a.jpg", "b.jpg"])

    assert res.status_code == 200
    body = res.get_json()
    assert body["missing"] == ["Place|USA|Atlantis|State"]
    # Tree keeps the Place > USA breadcrumb (green) down to the missing nodes.
    assert body["tree"][0]["name"] == "Place"
    assert body["tree"][0]["exists"] is True
    usa = body["tree"][0]["children"][0]
    assert usa["name"] == "USA" and usa["exists"] is True
    atlantis = usa["children"][0]
    assert atlantis == {
        "name": "Atlantis",
        "exists": False,
        "children": [{"name": "State", "exists": False, "children": []}],
    }
    assert [f["filename"] for f in body["files"]] == ["a.jpg", "b.jpg"]
    # Nothing was staged — the checker is read-only.
    assert client.get("/api/ingest").get_json() == []


def test_tag_check_reports_per_photo_metadata_errors(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    client = _client()

    with patch.object(
        tagging,
        "keyword_paths",
        side_effect=[ValueError("No XMP metadata found"), []],
    ):
        res = _check(client, ["no-xmp.jpg", "clean.jpg"])

    assert res.status_code == 200
    body = res.get_json()
    assert body["files"][0]["error"] == "No XMP metadata found"
    assert body["files"][1]["error"] is None
    # A photo that errors contributes nothing to the worklist.
    assert body["missing"] == []
    assert body["tree"] == []


def test_tag_check_rejects_unsupported_type(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    res = _check(_client(), ["a.jpg", "notes.txt"])
    assert res.status_code == 400
    assert "notes.txt" in res.get_json()["error"]
