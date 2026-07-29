#!/usr/bin/env python3
"""Social Poster - publishing to Instagram and Bluesky.

Instagram uses the **official** Instagram Graph API (Content Publishing), not
the reverse-engineered private API — the latter gets accounts flagged/banned.
Each Instagram account is authenticated with a long-lived access token plus its
Instagram user ID (both generated in the Meta app dashboard under
"Instagram → API setup with Instagram login").

The Graph API does not accept image bytes: it fetches the photo from a public
HTTPS URL. The app already serves uploaded images at ``/images/<filename>``, so
we expose that endpoint publicly through a Cloudflare Tunnel and hand Instagram
``<PUBLIC_BASE_URL>/images/<filename>``. Publishing is the documented two-step
flow: create a media container, then publish it.

The third-party client libraries are imported lazily inside each function so
this module (and the Flask server that imports it) stays importable even when
they are not installed.
"""

import os
import time
from pathlib import Path
from typing import Dict, Optional

# Graph API host + version for the Instagram-login content publishing flow.
INSTAGRAM_GRAPH_BASE = "https://graph.instagram.com/v21.0"

# Instagram feed photos must have an aspect ratio (width / height) within this
# range — roughly 4:5 portrait to 1.91:1 landscape. Outside it, Instagram
# accepts the upload call but silently creates no media. We reject up front
# with a clear message instead.
INSTAGRAM_MIN_ASPECT = 0.8
INSTAGRAM_MAX_ASPECT = 1.91

# How long to wait for a media container to finish processing before publishing.
CONTAINER_POLL_ATTEMPTS = 30
CONTAINER_POLL_INTERVAL = 2  # seconds

# Bluesky rejects uploaded image blobs larger than 2,000,000 bytes. We shrink
# anything above this before upload (see ``_fit_bluesky_blob``).
BLUESKY_MAX_BLOB_BYTES = 2_000_000


def validate_instagram_image(image_path: str) -> None:
    """Raise ``ValueError`` if the image's aspect ratio is outside Instagram's range.

    The message names the required range and the image's actual size/ratio so
    the user can crop/resize and retry.
    """
    from PIL import Image

    with Image.open(image_path) as im:
        width, height = im.size
    if not height:
        raise ValueError("Image has zero height.")
    aspect = width / height
    if aspect < INSTAGRAM_MIN_ASPECT or aspect > INSTAGRAM_MAX_ASPECT:
        raise ValueError(
            "Instagram requires an aspect ratio between 4:5 (0.80) and "
            f"1.91:1. This image is {width}x{height} ({aspect:.2f}). "
            "Crop or resize it and try again."
        )


# ---------------------------------------------------------------------------
# Public image URL — Instagram fetches the photo from the app's own
# ``/images/<filename>`` endpoint, exposed publicly via a Cloudflare Tunnel.
# ---------------------------------------------------------------------------
def public_image_url(image_path: str) -> str:
    """Return the public HTTPS URL Instagram should fetch the image from.

    Built from ``PUBLIC_BASE_URL`` (the Cloudflare Tunnel domain pointing at
    this app) plus the served ``/images/<filename>`` path. Raises
    ``RuntimeError`` if the base URL is not configured so the failure is clear
    in the publish log.
    """
    base = os.environ.get("PUBLIC_BASE_URL", "").rstrip("/")
    if not base:
        raise RuntimeError(
            "Instagram publishing needs PUBLIC_BASE_URL set to the public "
            "(Cloudflare Tunnel) URL of this app."
        )
    return f"{base}/api/images/{Path(image_path).name}"


# ---------------------------------------------------------------------------
# Instagram Graph API
# ---------------------------------------------------------------------------
def _graph_error(resp, label: str) -> str:
    """Extract a Graph API error message from a response, prefixed with ``label``."""
    try:
        err = resp.json().get("error", {})
        message = err.get("error_user_msg") or err.get("message")
        if message:
            return f"{label}: {message}"
    except ValueError:
        pass
    return f"{label}: HTTP {resp.status_code} {resp.text[:300]}"


def _instagram_graph_error(resp) -> str:
    """Instagram-labelled Graph API error."""
    return _graph_error(resp, "Instagram")


def _wait_for_container(creation_id: str, access_token: str) -> None:
    """Poll a media container until it finishes processing.

    Instagram processes the fetched image asynchronously; publishing before it
    reports ``FINISHED`` fails. Raises ``RuntimeError`` on an error status or if
    it never finishes within the poll budget.
    """
    import requests

    for _ in range(CONTAINER_POLL_ATTEMPTS):
        resp = requests.get(
            f"{INSTAGRAM_GRAPH_BASE}/{creation_id}",
            params={"fields": "status_code", "access_token": access_token},
            timeout=30,
        )
        if not resp.ok:
            raise RuntimeError(_instagram_graph_error(resp))
        status = resp.json().get("status_code")
        if status == "FINISHED":
            return
        if status in ("ERROR", "EXPIRED"):
            raise RuntimeError(f"Instagram: media container {status.lower()}.")
        time.sleep(CONTAINER_POLL_INTERVAL)
    raise RuntimeError("Instagram: media container did not finish in time.")


def post_instagram(creds: Dict, image_path: str, caption: str) -> Optional[str]:
    """Publish a single photo to Instagram via the Graph API.

    Args:
        creds: ``{"ig_user_id": ..., "access_token": ...}``.
        image_path: Path to the image file on disk.
        caption: Caption text for the post.

    Returns the published media's id (used later to fetch engagement).

    Steps: validate aspect ratio → resolve the public image URL → create a
    media container → wait for it to finish → publish.
    """
    import requests

    validate_instagram_image(image_path)
    ig_user_id = creds["ig_user_id"]
    access_token = creds["access_token"]

    image_url = public_image_url(image_path)

    # alt_text (Graph API, added Mar 2025): accessibility + keyword surface.
    # Servers that predate it simply ignore the extra parameter.
    container = requests.post(
        f"{INSTAGRAM_GRAPH_BASE}/{ig_user_id}/media",
        data={
            "image_url": image_url,
            "caption": caption,
            "alt_text": derive_alt_text(caption),
            "access_token": access_token,
        },
        timeout=60,
    )
    if not container.ok:
        raise RuntimeError(_instagram_graph_error(container))
    creation_id = container.json()["id"]

    _wait_for_container(creation_id, access_token)

    publish = requests.post(
        f"{INSTAGRAM_GRAPH_BASE}/{ig_user_id}/media_publish",
        data={"creation_id": creation_id, "access_token": access_token},
        timeout=60,
    )
    if not publish.ok:
        raise RuntimeError(_instagram_graph_error(publish))
    return publish.json().get("id")


def _bluesky_error_message(exc: Exception) -> Optional[str]:
    """Extract a short, human-readable message from an atproto login error.

    atproto raises an error whose ``str()`` is the raw HTTP ``Response`` repr,
    e.g. ``Response(success=False, status_code=401, content=XrpcError(
    error='AuthenticationRequired', message='Invalid identifier or password'),
    ...)``. Dig out the server-provided ``message`` so the user sees that
    instead of the whole repr. Returns ``None`` if this isn't a response-shaped
    error (e.g. a network failure), so the caller can let it propagate as-is.
    """
    content = getattr(getattr(exc, "response", None), "content", None)
    message = getattr(content, "message", None)
    if message:
        return f"Bluesky: {message}"
    return None


def _bluesky_login(creds: Dict):
    """Log in to Bluesky, translating auth errors into clean messages.

    Returns the logged-in ``(client, profile)``. Raises ``RuntimeError`` with a
    readable message on a credential/authentication failure; other errors
    (e.g. network) propagate unchanged.
    """
    from atproto import Client

    client = Client()
    try:
        profile = client.login(creds["handle"], creds["app_password"])
    except Exception as exc:
        message = _bluesky_error_message(exc)
        if message is None:
            raise
        raise RuntimeError(message) from exc
    return client, profile


# Instagram caps custom alt text at 1000 characters; Bluesky at 2000
# graphemes. Use the lower bound for both.
ALT_TEXT_LIMIT = 1000


def derive_alt_text(caption: str) -> str:
    """Derive image alt text from a caption's descriptive lines.

    Several curated Bluesky feeds only pick up posts whose image has non-empty
    alt text, and screen readers need a description of the image, not the
    metadata. So: keep the title/description lines, drop the gear/setup lines
    and any line that is only tags/mentions. Empty when nothing descriptive
    remains (a hand-written caption of pure tags).
    """
    kept = []
    for line in caption.splitlines():
        line = line.strip()
        if not line or line.startswith(("The Gear -", "The Setup -", "📷", "🎞️")):
            continue
        if all(word.startswith(("#", "@")) for word in line.split()):
            continue
        kept.append(line)
    return " ".join(kept)[:ALT_TEXT_LIMIT]


def _fit_bluesky_blob(image_bytes: bytes) -> bytes:
    """Return image bytes guaranteed to be under Bluesky's blob size limit.

    Bluesky rejects any uploaded blob larger than ``BLUESKY_MAX_BLOB_BYTES``
    with an ``InvalidRequest`` ("blob too big") error. Photos straight off a
    camera routinely exceed it, so if the bytes are over the cap we re-encode
    as JPEG at progressively lower quality, then progressively smaller
    dimensions, until they fit. Under the cap we return the original bytes
    untouched so already-fine images keep their exact encoding.
    """
    if len(image_bytes) <= BLUESKY_MAX_BLOB_BYTES:
        return image_bytes

    import io

    from PIL import Image

    with Image.open(io.BytesIO(image_bytes)) as im:
        # JPEG can't hold alpha; flatten to RGB so re-encoding never fails.
        im = im.convert("RGB")

        for scale in (1.0, 0.85, 0.7, 0.55, 0.4, 0.3):
            if scale == 1.0:
                candidate = im
            else:
                w, h = im.size
                candidate = im.resize(
                    (max(1, int(w * scale)), max(1, int(h * scale))),
                    Image.LANCZOS,
                )
            for quality in (90, 80, 70, 60, 50):
                buf = io.BytesIO()
                candidate.save(buf, format="JPEG", quality=quality, optimize=True)
                data = buf.getvalue()
                if len(data) <= BLUESKY_MAX_BLOB_BYTES:
                    return data

    # Fall through: return the smallest attempt we produced (best effort).
    return data


def post_bluesky(creds: Dict, image_path: str, caption: str) -> Optional[str]:
    """Publish a single image post to Bluesky.

    Args:
        creds: ``{"handle": ..., "app_password": ...}``.
        image_path: Path to the image file on disk.
        caption: Text for the post.

    Returns the created post's at:// URI (used later to fetch engagement).

    Exceptions from atproto are allowed to propagate to the caller.
    """
    client, _ = _bluesky_login(creds)
    with open(image_path, "rb") as f:
        image_bytes = _fit_bluesky_blob(f.read())
    record = client.send_image(
        text=caption, image=image_bytes, image_alt=derive_alt_text(caption)
    )
    return getattr(record, "uri", None)


def _fetch_instagram_profile(creds: Dict) -> Dict:
    """Fetch an Instagram account's profile via the Graph API.

    Doubles as credential verification: a bad/expired token returns an error
    here, which the caller surfaces before the account is saved.
    """
    import requests

    ig_user_id = creds["ig_user_id"]
    access_token = creds["access_token"]
    resp = requests.get(
        f"{INSTAGRAM_GRAPH_BASE}/{ig_user_id}",
        params={
            "fields": "user_id,username,name,profile_picture_url,"
            "followers_count,media_count",
            "access_token": access_token,
        },
        timeout=30,
    )
    if not resp.ok:
        raise RuntimeError(_instagram_graph_error(resp))
    user = resp.json()
    return {
        "username": user.get("username"),
        "display_name": user.get("name") or None,
        "avatar_url": user.get("profile_picture_url") or None,
        "follower_count": user.get("followers_count"),
        "post_count": user.get("media_count"),
    }


def login_and_fetch_profile(platform: str, creds: Dict) -> Dict:
    """Verify credentials and return the account's public profile.

    The returned dict is normalized across platforms::

        {"username", "display_name", "avatar_url", "follower_count", "post_count"}

    Args:
        platform: ``"instagram"`` or ``"bluesky"``.
        creds: Platform-specific credentials dict.

    Raises:
        ValueError: If ``platform`` is not a known platform.
        Exception: Any login/verification error propagates.
    """
    if platform == "instagram":
        return _fetch_instagram_profile(creds)
    if platform == "bluesky":
        _client, profile = _bluesky_login(creds)
        return {
            "username": profile.handle,
            "display_name": profile.display_name or None,
            "avatar_url": profile.avatar or None,
            "follower_count": profile.followers_count,
            "post_count": profile.posts_count,
        }
    raise ValueError(f"Unknown platform: {platform}")


def _dry_run_enabled() -> bool:
    """Whether DRY_RUN is on (``1``) — if so, publishing is simulated, never sent.

    Lets dev runs exercise the full scheduling/publishing path without ever
    touching the real social accounts. Anything other than ``1`` (incl. unset
    or ``0``) means live.
    """
    return os.environ.get("DRY_RUN", "").strip() == "1"


def post(platform: str, creds: Dict, image_path: str, caption: str) -> Optional[str]:
    """Dispatch a post to the correct platform implementation.

    Args:
        platform: ``"instagram"`` or ``"bluesky"``.
        creds: Platform-specific credentials dict.
        image_path: Path to the image file on disk.
        caption: Caption/text for the post.

    Returns the platform's id for the published item (Instagram media id /
    Bluesky at:// URI), or ``None`` in DRY_RUN.

    Raises:
        ValueError: If ``platform`` is not a known platform.
    """
    if platform not in ("instagram", "bluesky"):
        raise ValueError(f"Unknown platform: {platform}")

    if _dry_run_enabled():
        print(
            f"publisher: [DRY_RUN] would post to {platform}: "
            f"{Path(image_path).name} — {caption[:60]!r}"
        )
        return None

    if platform == "instagram":
        return post_instagram(creds, image_path, caption)
    return post_bluesky(creds, image_path, caption)
