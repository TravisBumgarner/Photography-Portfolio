"""Tests for Reddit publishing and engagement, with PRAW faked out.

Reddit differs from the other platforms in ways that are easy to get wrong and
expensive to get wrong live: a submission takes a title rather than a caption,
an image post can't carry body text (so the description is a first comment),
and PRAW's websocket confirmation can fail *after* the upload succeeded. That
last one is the dangerous case — believing the error would retry and
double-post — so it's covered explicitly here rather than discovered in
production.
"""

import sys
import types
from pathlib import Path
from unittest.mock import patch

import pytest

_SCRIPTS = Path(__file__).parent.parent / "scripts"
sys.path.insert(0, str(_SCRIPTS))

import engagement  # noqa: E402
import platforms  # noqa: E402


REDDIT_CREDS = {
    "client_id": "cid",
    "client_secret": "secret",
    "username": "me",
    "password": "pw",
}


class FakeSubmission:
    def __init__(self, sid="sub123", title="", subreddit="analog"):
        self.id = sid
        self.title = title
        self.subreddit = subreddit
        self.replies = []
        self.score = 42
        self.num_comments = 7
        self.num_crossposts = 2

    def reply(self, body):
        self.replies.append(body)


class FakeSubreddit:
    def __init__(self, name, recorder, fail=False, reply_fails=False):
        self.display_name = name
        self._recorder = recorder
        self._fail = fail
        self._reply_fails = reply_fails

    def submit_image(self, title, image_path, flair_id=None, timeout=None):
        self._recorder["submit"] = {
            "title": title,
            "image_path": image_path,
            "flair_id": flair_id,
            "subreddit": self.display_name,
        }
        if self._fail:
            raise RuntimeError("websocket error: connection closed")
        submission = FakeSubmission(title=title, subreddit=self.display_name)
        if self._reply_fails:
            def boom(_body):
                raise RuntimeError("comment rate limited")

            submission.reply = boom
        self._recorder["submission"] = submission
        return submission


class FakeReddit:
    """Minimal stand-in for praw.Reddit covering what the code touches."""

    def __init__(self, recorder, fail=False, recoverable=False, reply_fails=False):
        self._recorder = recorder
        self._fail = fail
        self._recoverable = recoverable
        self._reply_fails = reply_fails
        self.user = types.SimpleNamespace(me=self._me)

    def subreddit(self, name):
        return FakeSubreddit(name, self._recorder, self._fail, self._reply_fails)

    def submission(self, id):  # noqa: A002 - matches PRAW's keyword
        self._recorder["fetched_id"] = id
        return FakeSubmission(sid=id)

    def _me(self):
        found = []
        if self._recoverable:
            found = [
                FakeSubmission(
                    sid="recovered1",
                    title=self._recorder["submit"]["title"],
                    subreddit=self._recorder["submit"]["subreddit"],
                )
            ]
        return types.SimpleNamespace(
            name="me",
            icon_img="https://example.com/avatar.png",
            submissions=types.SimpleNamespace(new=lambda limit: iter(found)),
        )


@pytest.fixture
def recorder():
    return {}


def _patch_client(monkeypatch, recorder, **kwargs):
    monkeypatch.setattr(
        platforms, "_reddit_client", lambda creds: FakeReddit(recorder, **kwargs)
    )


def _image(tmp_path, name="photo.jpg"):
    from PIL import Image

    path = tmp_path / name
    Image.new("RGB", (1600, 1200), (10, 20, 30)).save(path)
    return str(path)


# ---------------------------------------------------------------------------
# validate_reddit_title
# ---------------------------------------------------------------------------
def test_title_must_not_be_empty():
    with pytest.raises(ValueError, match="need a title"):
        platforms.validate_reddit_title("   ")


def test_title_must_fit_reddits_limit():
    platforms.validate_reddit_title("x" * 300)  # exactly at the cap is fine
    with pytest.raises(ValueError, match="301 characters"):
        platforms.validate_reddit_title("x" * 301)


def test_a_subs_limit_can_be_stricter_but_not_looser():
    with pytest.raises(ValueError, match="allows 50"):
        platforms.validate_reddit_title("x" * 51, limit=50)
    # A limit above Reddit's own cap is clamped back to it.
    with pytest.raises(ValueError, match="allows 300"):
        platforms.validate_reddit_title("x" * 301, limit=9999)


# ---------------------------------------------------------------------------
# post_reddit
# ---------------------------------------------------------------------------
def test_submits_with_title_and_flair(tmp_path, monkeypatch, recorder):
    _patch_client(monkeypatch, recorder)
    remote_id = platforms.post_reddit(
        REDDIT_CREDS,
        _image(tmp_path),
        title="Sunrise (Pentax K1000, Portra 400)",
        subreddit="analog",
        flair_id="flair-9",
        body="The description",
    )
    assert remote_id == "sub123"
    assert recorder["submit"]["title"] == "Sunrise (Pentax K1000, Portra 400)"
    assert recorder["submit"]["flair_id"] == "flair-9"
    assert recorder["submit"]["subreddit"] == "analog"


def test_description_becomes_a_first_comment(tmp_path, monkeypatch, recorder):
    # An image submission is a link post and cannot hold body text.
    _patch_client(monkeypatch, recorder)
    platforms.post_reddit(
        REDDIT_CREDS,
        _image(tmp_path),
        title="T",
        subreddit="analog",
        body="Shot on a foggy morning.",
    )
    assert recorder["submission"].replies == ["Shot on a foggy morning."]


def test_no_comment_when_there_is_no_description(tmp_path, monkeypatch, recorder):
    _patch_client(monkeypatch, recorder)
    platforms.post_reddit(
        REDDIT_CREDS, _image(tmp_path), title="T", subreddit="analog", body="   "
    )
    assert recorder["submission"].replies == []


def test_a_failed_comment_does_not_fail_the_post(tmp_path, monkeypatch, recorder):
    # The photo is already live by then; raising would retry and double-post it.
    _patch_client(monkeypatch, recorder, reply_fails=True)
    remote_id = platforms.post_reddit(
        REDDIT_CREDS, _image(tmp_path), title="T", subreddit="analog", body="desc"
    )
    assert remote_id == "sub123"


def test_recovers_when_praw_cannot_confirm_a_successful_upload(
    tmp_path, monkeypatch, recorder
):
    # PRAW confirms over a websocket that fails on flaky networks *after* the
    # upload went through. Treating that as a failure would double-post.
    _patch_client(monkeypatch, recorder, fail=True, recoverable=True)
    remote_id = platforms.post_reddit(
        REDDIT_CREDS, _image(tmp_path), title="Recover me", subreddit="analog"
    )
    assert remote_id == "recovered1"


def test_a_genuine_failure_still_raises(tmp_path, monkeypatch, recorder):
    _patch_client(monkeypatch, recorder, fail=True, recoverable=False)
    with pytest.raises(RuntimeError, match="Reddit"):
        platforms.post_reddit(
            REDDIT_CREDS, _image(tmp_path), title="T", subreddit="analog"
        )


def test_unsupported_format_is_converted_before_upload(tmp_path, monkeypatch, recorder):
    # Reddit's uploader takes jpg/png/gif only; our uploads allow .webp.
    from PIL import Image

    webp = tmp_path / "photo.webp"
    Image.new("RGB", (800, 600), (1, 2, 3)).save(webp, "WEBP")
    _patch_client(monkeypatch, recorder)
    platforms.post_reddit(
        REDDIT_CREDS, str(webp), title="T", subreddit="analog"
    )
    assert recorder["submit"]["image_path"].endswith(".jpg")


def test_acceptable_format_is_uploaded_untouched(tmp_path, monkeypatch, recorder):
    _patch_client(monkeypatch, recorder)
    path = _image(tmp_path)
    platforms.post_reddit(REDDIT_CREDS, path, title="T", subreddit="analog")
    assert recorder["submit"]["image_path"] == path


# ---------------------------------------------------------------------------
# post() dispatch
# ---------------------------------------------------------------------------
def test_dispatch_requires_a_subreddit_and_title(tmp_path, monkeypatch, recorder):
    _patch_client(monkeypatch, recorder)
    path = _image(tmp_path)
    with pytest.raises(ValueError, match="need a subreddit"):
        platforms.post(
            "reddit", REDDIT_CREDS, path, "body", options={"title": "T"}
        )
    with pytest.raises(ValueError, match="need a title"):
        platforms.post(
            "reddit", REDDIT_CREDS, path, "body", options={"subreddit": "analog"}
        )


def test_dispatch_honours_comment_body_false(tmp_path, monkeypatch, recorder):
    # Subs that don't allow the first comment must not get one.
    _patch_client(monkeypatch, recorder)
    platforms.post(
        "reddit",
        REDDIT_CREDS,
        _image(tmp_path),
        "the description",
        options={"subreddit": "EarthPorn", "title": "T", "comment_body": False},
    )
    assert recorder["submission"].replies == []


def test_dry_run_never_builds_a_client(tmp_path, monkeypatch):
    monkeypatch.setenv("DRY_RUN", "1")

    def explode(_creds):
        raise AssertionError("DRY_RUN must not touch Reddit")

    monkeypatch.setattr(platforms, "_reddit_client", explode)
    assert (
        platforms.post(
            "reddit",
            REDDIT_CREDS,
            _image(tmp_path),
            "body",
            options={"subreddit": "analog", "title": "T"},
        )
        is None
    )


def test_dry_run_still_validates_the_target(tmp_path, monkeypatch):
    # A DRY_RUN that accepted an unpublishable target would hide the problem
    # until the first live run.
    monkeypatch.setenv("DRY_RUN", "1")
    with pytest.raises(ValueError):
        platforms.post(
            "reddit",
            REDDIT_CREDS,
            _image(tmp_path),
            "body",
            options={"subreddit": "analog", "title": ""},
        )


# ---------------------------------------------------------------------------
# Profile verification
# ---------------------------------------------------------------------------
def test_profile_reports_the_username_without_inventing_counts(monkeypatch, recorder):
    # Reddit has no follower count and karma isn't a post count, so both stay
    # None rather than carrying a number that means something else.
    _patch_client(monkeypatch, recorder)
    profile = platforms.login_and_fetch_profile("reddit", REDDIT_CREDS)
    assert profile["username"] == "me"
    assert profile["avatar_url"] == "https://example.com/avatar.png"
    assert profile["follower_count"] is None
    assert profile["post_count"] is None


def test_profile_rejects_credentials_that_authenticate_nobody(monkeypatch, recorder):
    fake = FakeReddit(recorder)
    fake.user = types.SimpleNamespace(me=lambda: None)
    monkeypatch.setattr(platforms, "_reddit_client", lambda creds: fake)
    with pytest.raises(RuntimeError, match="did not authenticate"):
        platforms.login_and_fetch_profile("reddit", REDDIT_CREDS)


# ---------------------------------------------------------------------------
# Engagement
# ---------------------------------------------------------------------------
def test_engagement_maps_score_and_comments(monkeypatch, recorder):
    monkeypatch.setattr(
        platforms, "_reddit_client", lambda creds: FakeReddit(recorder)
    )
    metrics = engagement.fetch_reddit_engagement(REDDIT_CREDS, "abc123")
    assert recorder["fetched_id"] == "abc123"
    # score is upvotes-minus-downvotes: the closest equivalent to likes.
    assert metrics["likes"] == 42
    assert metrics["comments"] == 7
    assert metrics["reposts"] == 2


def test_engagement_surfaces_a_removed_submission(monkeypatch, recorder):
    class Gone:
        @property
        def score(self):
            raise RuntimeError("404 not found")

    fake = FakeReddit(recorder)
    monkeypatch.setattr(platforms, "_reddit_client", lambda creds: fake)
    with patch.object(fake, "submission", return_value=Gone()):
        with pytest.raises(RuntimeError, match="Reddit"):
            engagement.fetch_reddit_engagement(REDDIT_CREDS, "gone")
