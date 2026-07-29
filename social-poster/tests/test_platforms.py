"""Tests for social-poster platform publishing.

Covers the Instagram Graph API flow with mocked HTTP so nothing ever reaches
the real network, the public-image-URL builder, aspect-ratio validation, the
DRY_RUN safety switch, and dispatch. The point is to verify the publish path
end-to-end in code so it does not need to be exercised by hand against the
live account.
"""

import os
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from PIL import Image

# platforms.py lives in the hyphenated utility dir and imports its sibling
# ``db``; add scripts/ to the path so both import cleanly.
_SCRIPTS = Path(__file__).parent.parent / "scripts"
sys.path.insert(0, str(_SCRIPTS))

import platforms  # noqa: E402


IG_CREDS = {"ig_user_id": "12345", "access_token": "tok-abc"}


def _make_image(path: Path, size=(1080, 1080)) -> str:
    """Write a solid-color JPEG of the given size and return its path."""
    Image.new("RGB", size, (10, 20, 30)).save(path, "JPEG")
    return str(path)


def _resp(ok=True, status=200, json_data=None, text=""):
    """Build a fake ``requests`` Response."""
    r = MagicMock()
    r.ok = ok
    r.status_code = status
    r.json.return_value = json_data if json_data is not None else {}
    r.text = text
    return r


# ---------------------------------------------------------------------------
# public_image_url
# ---------------------------------------------------------------------------
def test_public_image_url_builds_from_base(monkeypatch):
    monkeypatch.setenv("PUBLIC_BASE_URL", "https://poster.example.com/")
    url = platforms.public_image_url("/data/images/abc_DSC.jpg")
    assert url == "https://poster.example.com/api/images/abc_DSC.jpg"


def test_public_image_url_requires_base(monkeypatch):
    monkeypatch.delenv("PUBLIC_BASE_URL", raising=False)
    with pytest.raises(RuntimeError, match="PUBLIC_BASE_URL"):
        platforms.public_image_url("/data/images/abc.jpg")


# ---------------------------------------------------------------------------
# validate_instagram_image
# ---------------------------------------------------------------------------
def test_validate_instagram_image_accepts_square(tmp_path):
    platforms.validate_instagram_image(_make_image(tmp_path / "ok.jpg", (1080, 1080)))


def test_validate_instagram_image_rejects_too_tall(tmp_path):
    path = _make_image(tmp_path / "tall.jpg", (600, 1200))  # aspect 0.5
    with pytest.raises(ValueError, match="aspect ratio"):
        platforms.validate_instagram_image(path)


# ---------------------------------------------------------------------------
# derive_alt_text — descriptive lines only, no gear/setup/tag lines
# ---------------------------------------------------------------------------
def test_derive_alt_text_keeps_title_and_description():
    caption = (
        "Fog over the lake June 2026\n"
        "An early morning on the water.\n"
        "The Gear - Pentax K1000, 50mm\n"
        "The Setup - 1/250s, f/8\n"
        "#moodygrams @moodygrams #fog"
    )
    assert platforms.derive_alt_text(caption) == (
        "Fog over the lake June 2026 An early morning on the water."
    )


def test_derive_alt_text_empty_for_pure_tag_captions():
    assert platforms.derive_alt_text("#fog #mist @moodygrams") == ""


def test_derive_alt_text_skips_analog_convention_line():
    caption = (
        "Fog over the lake\n"
        "📷 Pentax K1000 / 🎞️ Kodak Gold 200\n"
        "#film"
    )
    assert platforms.derive_alt_text(caption) == "Fog over the lake"


def test_derive_alt_text_truncates():
    long_caption = "word " * 500
    assert len(platforms.derive_alt_text(long_caption)) <= platforms.ALT_TEXT_LIMIT


# ---------------------------------------------------------------------------
# post_instagram — the two-step container/publish flow
# ---------------------------------------------------------------------------
def test_post_instagram_happy_path(tmp_path, monkeypatch):
    monkeypatch.setenv("PUBLIC_BASE_URL", "https://poster.example.com")
    image = _make_image(tmp_path / "p.jpg")

    container = _resp(json_data={"id": "creation-1"})
    status = _resp(json_data={"status_code": "FINISHED"})
    publish = _resp(json_data={"id": "media-9"})

    with patch("requests.post") as post, patch("requests.get") as get:
        post.side_effect = [container, publish]
        get.return_value = status
        media_id = platforms.post_instagram(IG_CREDS, image, "hello world")

    # Container creation uses the public URL + caption + alt text + token.
    create_call = post.call_args_list[0]
    assert create_call.args[0].endswith("/12345/media")
    assert create_call.kwargs["data"]["image_url"] == (
        "https://poster.example.com/api/images/p.jpg"
    )
    assert create_call.kwargs["data"]["caption"] == "hello world"
    assert create_call.kwargs["data"]["alt_text"] == "hello world"

    # Publish uses the creation id returned by the container call and its
    # media id is returned for engagement tracking.
    publish_call = post.call_args_list[1]
    assert publish_call.args[0].endswith("/12345/media_publish")
    assert publish_call.kwargs["data"]["creation_id"] == "creation-1"
    assert media_id == "media-9"


def test_post_instagram_waits_for_processing(tmp_path, monkeypatch):
    monkeypatch.setenv("PUBLIC_BASE_URL", "https://poster.example.com")
    monkeypatch.setattr(platforms, "CONTAINER_POLL_INTERVAL", 0)
    image = _make_image(tmp_path / "p.jpg")

    with patch("requests.post") as post, patch("requests.get") as get:
        post.side_effect = [
            _resp(json_data={"id": "c1"}),
            _resp(json_data={"id": "m1"}),
        ]
        get.side_effect = [
            _resp(json_data={"status_code": "IN_PROGRESS"}),
            _resp(json_data={"status_code": "FINISHED"}),
        ]
        platforms.post_instagram(IG_CREDS, image, "cap")

    assert get.call_count == 2  # polled until FINISHED


def test_post_instagram_raises_clean_error(tmp_path, monkeypatch):
    monkeypatch.setenv("PUBLIC_BASE_URL", "https://poster.example.com")
    image = _make_image(tmp_path / "p.jpg")

    bad = _resp(
        ok=False,
        status=400,
        json_data={"error": {"message": "Invalid OAuth access token."}},
    )
    with patch("requests.post", return_value=bad):
        with pytest.raises(RuntimeError, match="Invalid OAuth access token"):
            platforms.post_instagram(IG_CREDS, image, "cap")


def test_post_instagram_errors_when_container_processing_fails(tmp_path, monkeypatch):
    monkeypatch.setenv("PUBLIC_BASE_URL", "https://poster.example.com")
    monkeypatch.setattr(platforms, "CONTAINER_POLL_INTERVAL", 0)
    image = _make_image(tmp_path / "p.jpg")

    with patch("requests.post", return_value=_resp(json_data={"id": "c1"})), patch(
        "requests.get", return_value=_resp(json_data={"status_code": "ERROR"})
    ):
        with pytest.raises(RuntimeError, match="error"):
            platforms.post_instagram(IG_CREDS, image, "cap")


# ---------------------------------------------------------------------------
# DRY_RUN + dispatch
# ---------------------------------------------------------------------------
def test_dry_run_never_calls_platform(tmp_path, monkeypatch):
    monkeypatch.setenv("DRY_RUN", "1")
    image = _make_image(tmp_path / "p.jpg")
    with patch.object(platforms, "post_instagram") as ig, patch.object(
        platforms, "post_bluesky"
    ) as bsky:
        assert platforms.post("instagram", IG_CREDS, image, "cap") is None
        assert (
            platforms.post(
                "bluesky", {"handle": "h", "app_password": "p"}, image, "cap"
            )
            is None
        )
    ig.assert_not_called()
    bsky.assert_not_called()


def test_post_returns_remote_id_from_platform(tmp_path, monkeypatch):
    monkeypatch.delenv("DRY_RUN", raising=False)
    image = _make_image(tmp_path / "p.jpg")
    with patch.object(platforms, "post_instagram", return_value="media-1"):
        assert platforms.post("instagram", IG_CREDS, image, "cap") == "media-1"


def test_post_dispatches_to_instagram(tmp_path, monkeypatch):
    monkeypatch.delenv("DRY_RUN", raising=False)
    image = _make_image(tmp_path / "p.jpg")
    with patch.object(platforms, "post_instagram") as ig:
        platforms.post("instagram", IG_CREDS, image, "cap")
    ig.assert_called_once()


def test_post_rejects_unknown_platform(tmp_path):
    with pytest.raises(ValueError, match="Unknown platform"):
        platforms.post("tiktok", {}, "x.jpg", "cap")


# ---------------------------------------------------------------------------
# _fit_bluesky_blob — keep uploads under Bluesky's 2 MB blob limit
# ---------------------------------------------------------------------------
def _oversized_jpeg() -> bytes:
    """A JPEG whose bytes exceed Bluesky's blob limit (random noise = poor compression)."""
    noise = Image.frombytes(
        "RGB", (2200, 2200), os.urandom(2200 * 2200 * 3)
    )
    import io

    buf = io.BytesIO()
    noise.save(buf, format="JPEG", quality=100)
    data = buf.getvalue()
    assert len(data) > platforms.BLUESKY_MAX_BLOB_BYTES  # guard the fixture
    return data


def test_fit_bluesky_blob_passes_small_images_through():
    small = b"already small bytes"
    assert platforms._fit_bluesky_blob(small) is small


def test_fit_bluesky_blob_shrinks_oversized_images():
    result = platforms._fit_bluesky_blob(_oversized_jpeg())
    assert len(result) <= platforms.BLUESKY_MAX_BLOB_BYTES


def test_post_bluesky_uploads_shrunk_bytes(tmp_path, monkeypatch):
    path = tmp_path / "big.jpg"
    path.write_bytes(_oversized_jpeg())

    client = MagicMock()
    client.send_image.return_value = MagicMock(uri="at://did/app.bsky.feed.post/1")
    monkeypatch.setattr(platforms, "_bluesky_login", lambda creds: (client, None))

    uri = platforms.post_bluesky({"handle": "h", "app_password": "p"}, str(path), "cap")

    assert uri == "at://did/app.bsky.feed.post/1"
    sent = client.send_image.call_args.kwargs["image"]
    assert len(sent) <= platforms.BLUESKY_MAX_BLOB_BYTES
