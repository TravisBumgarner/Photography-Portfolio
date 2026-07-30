#!/usr/bin/env python3
"""Social Poster - publishing to Instagram, Bluesky and Reddit.

Instagram uses the **official** Instagram Graph API (Content Publishing), not
the reverse-engineered private API — the latter gets accounts flagged/banned.
Each Instagram account is authenticated with a long-lived access token plus its
Instagram user ID (both generated in the Meta app dashboard under
"Instagram → API setup with Instagram login").

Reddit differs from the other two in a way that shapes the whole data model:
one account posts to many subreddits, each with its own moderator-enforced
title format, flair requirement and posting cadence. A Reddit submission also
takes a *title*, not a caption, and an image submission is a link post that
cannot carry body text — so the description goes in a first comment. The
per-subreddit rules live in the ``subreddits`` table (see ``subreddits.py``);
this module just executes what it is handed.

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

# Reddit's hard cap on submission titles. Individual subreddits often impose a
# shorter one, which lives in the per-subreddit rules.
REDDIT_TITLE_LIMIT = 300

# Reddit's image uploader accepts these extensions only. Anything else (notably
# the .webp our uploads allow) is re-encoded to JPEG first.
REDDIT_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif"}

# Reddit requires a descriptive, uniquely-identifying User-Agent and throttles
# or blocks generic ones. ``{username}`` is filled in per account.
REDDIT_USER_AGENT = "python:social-poster:1.0 (by /u/{username})"


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


# ---------------------------------------------------------------------------
# Reddit
# ---------------------------------------------------------------------------
def _reddit_client(creds: Dict):
    """Build an authenticated PRAW client from stored credentials.

    Uses the "script" app flow (client id/secret plus the owning account's
    username/password), which is what Reddit intends for a tool posting to its
    own author's account. If the account has 2FA enabled the password field
    must be ``password:otp`` — a one-time code expires, so 2FA accounts
    effectively need app-specific handling; that limitation is surfaced as a
    login error rather than hidden.

    ``ratelimit_seconds`` lets PRAW wait out Reddit's short per-account posting
    throttle instead of raising, which matters when several subreddits are
    published in the same tick.
    """
    import praw

    return praw.Reddit(
        client_id=creds["client_id"],
        client_secret=creds["client_secret"],
        username=creds["username"],
        password=creds["password"],
        user_agent=REDDIT_USER_AGENT.format(username=creds["username"]),
        ratelimit_seconds=600,
        check_for_updates=False,
    )


def _reddit_error_message(exc: Exception) -> str:
    """Turn a PRAW exception into a short message prefixed with 'Reddit'."""
    text = str(exc).strip() or exc.__class__.__name__
    return f"Reddit: {text}"


def _fit_reddit_image(image_path: str) -> str:
    """Return a path to an image Reddit's uploader will accept.

    Reddit takes jpg/png/gif only. Uploads in another format (we allow .webp)
    are re-encoded to a JPEG in a temp file and that path is returned instead;
    an already-acceptable file is returned untouched. The temp file is left for
    the OS to reap — it is a few hundred KB, once per publish.
    """
    if Path(image_path).suffix.lower() in REDDIT_IMAGE_EXTENSIONS:
        return image_path

    import tempfile

    from PIL import Image

    with Image.open(image_path) as im:
        converted = im.convert("RGB")
        handle = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
        handle.close()
        converted.save(handle.name, format="JPEG", quality=92, optimize=True)
    return handle.name


def validate_reddit_title(title: str, limit: int = REDDIT_TITLE_LIMIT) -> None:
    """Raise ``ValueError`` if a Reddit title is empty or too long.

    Checked before submitting because Reddit rejects the whole submission on a
    bad title, and a subreddit's own limit is often shorter than Reddit's 300.
    """
    if not title.strip():
        raise ValueError("Reddit posts need a title.")
    effective = min(limit, REDDIT_TITLE_LIMIT)
    if len(title) > effective:
        raise ValueError(
            f"Title is {len(title)} characters; this subreddit allows "
            f"{effective}. Shorten it and try again."
        )


def post_reddit(
    creds: Dict,
    image_path: str,
    title: str,
    subreddit: str,
    flair_id: Optional[str] = None,
    body: str = "",
) -> Optional[str]:
    """Submit a single image post to one subreddit.

    Args:
        creds: ``{"client_id", "client_secret", "username", "password"}``.
        image_path: Path to the image file on disk.
        title: The submission title (already rendered from the sub's template).
        subreddit: Bare subreddit name, no ``r/`` prefix.
        flair_id: Flair template id to apply, when the sub uses/requires one.
        body: Description text. An image submission is a link post and cannot
            hold body text, so this is posted as a first comment when present.

    Returns the submission's id (used later to fetch engagement).

    A failure to add the first comment is deliberately swallowed: the photo is
    already live at that point, and raising would mark the target failed and
    invite a retry that double-posts the image.
    """
    validate_reddit_title(title)

    reddit = _reddit_client(creds)
    upload_path = _fit_reddit_image(image_path)
    try:
        submission = reddit.subreddit(subreddit).submit_image(
            title=title,
            image_path=upload_path,
            flair_id=flair_id or None,
            timeout=30,
        )
    except Exception as exc:
        # PRAW confirms an image submission over a websocket, which fails on
        # flaky networks *after* the upload has already gone through. Reporting
        # that as a failure would mark the target for retry and double-post the
        # photo, so look for the submission before believing the error.
        submission = _recover_reddit_submission(reddit, subreddit, title)
        if submission is None:
            raise RuntimeError(_reddit_error_message(exc)) from exc
        print(
            f"publisher: reddit r/{subreddit} submit reported an error but the "
            f"post exists ({submission.id}); treating it as published"
        )

    if body.strip():
        try:
            submission.reply(body)
        except Exception as exc:  # noqa: BLE001 - the post itself already went live
            print(
                f"publisher: reddit r/{subreddit} posted but the first comment "
                f"failed: {exc}"
            )

    return getattr(submission, "id", None)


def _recover_reddit_submission(reddit, subreddit: str, title: str):
    """Find a just-created submission by subreddit + exact title, or None.

    Only used to tell "the submit really failed" apart from "the submit worked
    but PRAW could not confirm it". Scans just the account's newest handful of
    submissions, so a false match would need an identical title in the same
    subreddit moments earlier.
    """
    try:
        recent = reddit.user.me().submissions.new(limit=10)
        for submission in recent:
            same_sub = str(submission.subreddit).lower() == subreddit.lower()
            if same_sub and submission.title == title:
                return submission
    except Exception:  # noqa: BLE001 - recovery is best-effort by definition
        return None
    return None


def _fetch_reddit_profile(creds: Dict) -> Dict:
    """Verify Reddit credentials by fetching the authenticated user.

    Reddit has no follower count for a normal account, and karma is not a post
    count, so both normalized counters stay ``None`` rather than carrying a
    number that means something else.
    """
    reddit = _reddit_client(creds)
    try:
        me = reddit.user.me()
    except Exception as exc:
        raise RuntimeError(_reddit_error_message(exc)) from exc
    if me is None:
        raise RuntimeError("Reddit: credentials did not authenticate a user.")
    icon = getattr(me, "icon_img", None) or None
    return {
        "username": str(me.name),
        "display_name": None,
        "avatar_url": icon,
        "follower_count": None,
        "post_count": None,
    }


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
    if platform == "reddit":
        return _fetch_reddit_profile(creds)
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


KNOWN_PLATFORMS = ("instagram", "bluesky", "reddit")


def post(
    platform: str,
    creds: Dict,
    image_path: str,
    caption: str,
    options: Optional[Dict] = None,
) -> Optional[str]:
    """Dispatch a post to the correct platform implementation.

    Args:
        platform: One of ``KNOWN_PLATFORMS``.
        creds: Platform-specific credentials dict.
        image_path: Path to the image file on disk.
        caption: Caption/text for the post. On Reddit this is the description,
            which becomes a first comment rather than the submission body.
        options: Per-target extras the platform needs beyond a caption. Reddit
            reads ``subreddit`` (required), ``title`` (required), ``flair_id``
            and ``comment_body``; the other platforms ignore it.

    Returns the platform's id for the published item (Instagram media id /
    Bluesky at:// URI / Reddit submission id), or ``None`` in DRY_RUN.

    Raises:
        ValueError: If ``platform`` is not a known platform, or a Reddit target
            is missing its subreddit/title.
    """
    if platform not in KNOWN_PLATFORMS:
        raise ValueError(f"Unknown platform: {platform}")

    options = options or {}

    if platform == "reddit":
        subreddit = str(options.get("subreddit") or "").strip()
        title = str(options.get("title") or "").strip()
        if not subreddit:
            raise ValueError("Reddit targets need a subreddit.")
        validate_reddit_title(title)

    if _dry_run_enabled():
        where = platform
        if platform == "reddit":
            where = f"reddit r/{options.get('subreddit')}"
            print(
                f"publisher: [DRY_RUN] would post to {where}: "
                f"{Path(image_path).name} — title "
                f"{str(options.get('title'))[:80]!r}"
            )
            return None
        print(
            f"publisher: [DRY_RUN] would post to {where}: "
            f"{Path(image_path).name} — {caption[:60]!r}"
        )
        return None

    if platform == "instagram":
        return post_instagram(creds, image_path, caption)
    if platform == "reddit":
        return post_reddit(
            creds,
            image_path,
            title=str(options.get("title") or "").strip(),
            subreddit=str(options.get("subreddit") or "").strip(),
            flair_id=options.get("flair_id"),
            # An image submission can't hold body text, so the description is
            # only posted at all when the sub's rules allow the first comment.
            body=caption if options.get("comment_body", True) else "",
        )
    return post_bluesky(creds, image_path, caption)
