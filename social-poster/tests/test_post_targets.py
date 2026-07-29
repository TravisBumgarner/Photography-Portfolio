"""Tests for the post API's destination model.

A target used to be identified by account_id alone, with captions carried in a
per-platform map. Reddit breaks both: one account posts to several subreddits
from the same photo, each needing its own title. These tests pin the resulting
contract — one entry per destination, reconciled on (account_id, subreddit) —
and the backwards compatibility that lets older clients keep working.
"""

import io
import json
import sys
from pathlib import Path

import pytest
from PIL import Image

_SCRIPTS = Path(__file__).parent.parent / "scripts"
sys.path.insert(0, str(_SCRIPTS))

import db  # noqa: E402
import platforms  # noqa: E402
import server  # noqa: E402
import subreddits  # noqa: E402


@pytest.fixture
def client(tmp_path, monkeypatch):
    """A test client on a throwaway DB with the subreddit seed loaded."""
    monkeypatch.setattr(db, "DATA_DIR", tmp_path)
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "social-poster.db")
    monkeypatch.setattr(db, "IMAGES_DIR", tmp_path / "images")
    db.init_db()
    conn = db.get_connection()
    try:
        subreddits.seed_if_empty(conn)
    finally:
        conn.close()
    # Account creation verifies credentials live; stub that out.
    monkeypatch.setattr(
        platforms,
        "login_and_fetch_profile",
        lambda platform, creds: {"username": "me", "display_name": None},
    )
    return server.app.test_client()


def _image(width=1600, height=1200):
    buffer = io.BytesIO()
    Image.new("RGB", (width, height), "gray").save(buffer, "JPEG")
    buffer.seek(0)
    return (buffer, "photo.jpg")


def _account(client, platform):
    creds = {
        "bluesky": {"handle": "me", "app_password": "x"},
        "instagram": {"ig_user_id": "1", "access_token": "t"},
        "reddit": {
            "client_id": "c",
            "client_secret": "s",
            "username": "me",
            "password": "p",
        },
    }[platform]
    response = client.post("/api/accounts", json={"platform": platform, **creds})
    assert response.status_code == 201, response.get_json()
    return response.get_json()["id"]


def _create(client, targets, scheduled_at="2026-08-01T10:00:00Z"):
    return client.post(
        "/api/posts",
        data={
            "image": _image(),
            "scheduled_at": scheduled_at,
            "targets": json.dumps(targets),
        },
        content_type="multipart/form-data",
    )


def _by_subreddit(post):
    return {t["subreddit"]: t for t in post["targets"] if t["subreddit"]}


# ---------------------------------------------------------------------------
# Accounts
# ---------------------------------------------------------------------------
def test_reddit_account_requires_all_four_credentials(client):
    response = client.post(
        "/api/accounts", json={"platform": "reddit", "client_id": "c"}
    )
    assert response.status_code == 400
    assert "client_secret" in response.get_json()["error"]


def test_unknown_platform_lists_the_real_options(client):
    response = client.post("/api/accounts", json={"platform": "tumblr"})
    assert response.status_code == 400
    assert "reddit" in response.get_json()["error"]


# ---------------------------------------------------------------------------
# Creating destinations
# ---------------------------------------------------------------------------
def test_one_account_can_hold_several_subreddits(client):
    reddit = _account(client, "reddit")
    response = _create(
        client,
        [
            {"account_id": reddit, "subreddit": "EarthPorn", "title": "A", "caption": "d"},
            {"account_id": reddit, "subreddit": "analog", "title": "B", "caption": "d"},
            {"account_id": reddit, "subreddit": "SkyPorn", "title": "C", "caption": "d"},
        ],
    )
    assert response.status_code == 201, response.get_json()
    subs = _by_subreddit(response.get_json())
    assert set(subs) == {"EarthPorn", "analog", "SkyPorn"}


def test_subreddit_names_are_normalized(client):
    reddit = _account(client, "reddit")
    response = _create(
        client, [{"account_id": reddit, "subreddit": "r/EarthPorn", "title": "A"}]
    )
    assert "EarthPorn" in _by_subreddit(response.get_json())


def test_subreddits_are_staggered_and_due_times_reflect_it(client):
    reddit = _account(client, "reddit")
    response = _create(
        client,
        [
            {"account_id": reddit, "subreddit": "EarthPorn", "title": "A"},
            {"account_id": reddit, "subreddit": "analog", "title": "B"},
            {"account_id": reddit, "subreddit": "itookapicture", "title": "C"},
        ],
    )
    subs = _by_subreddit(response.get_json())
    delays = {name: t["delay_minutes"] for name, t in subs.items()}
    # Exactly one goes at the anchor; none of them share a moment.
    assert sorted(delays.values())[0] == 0
    assert len(set(delays.values())) == 3
    # due_at is the offset already applied, so the UI needn't redo the maths.
    assert subs["EarthPorn"]["due_at"] == "2026-08-01T10:00:00Z"
    for target in subs.values():
        assert target["due_at"] >= "2026-08-01T10:00:00Z"


def test_other_platforms_are_never_staggered(client):
    bluesky = _account(client, "bluesky")
    instagram = _account(client, "instagram")
    response = _create(
        client,
        [
            {"account_id": bluesky, "caption": "b"},
            {"account_id": instagram, "caption": "i"},
        ],
    )
    for target in response.get_json()["targets"]:
        assert target["delay_minutes"] == 0


def test_client_supplied_offset_is_respected(client):
    reddit = _account(client, "reddit")
    response = _create(
        client,
        [
            {"account_id": reddit, "subreddit": "EarthPorn", "title": "A", "delay_minutes": 0},
            {"account_id": reddit, "subreddit": "analog", "title": "B", "delay_minutes": 15},
        ],
    )
    subs = _by_subreddit(response.get_json())
    assert subs["analog"]["delay_minutes"] == 15


def test_a_new_sub_is_placed_after_the_offsets_already_in_use(client):
    # Otherwise it lands on 0 next to the existing first sub and they post
    # together — the exact thing the stagger prevents.
    reddit = _account(client, "reddit")
    response = _create(
        client,
        [
            {"account_id": reddit, "subreddit": "EarthPorn", "title": "A", "delay_minutes": 0},
            {"account_id": reddit, "subreddit": "SkyPorn", "title": "B", "delay_minutes": 40},
            # No offset given: the server must place this one.
            {"account_id": reddit, "subreddit": "streetphotography", "title": "C"},
        ],
    )
    subs = _by_subreddit(response.get_json())
    assert subs["streetphotography"]["delay_minutes"] > 40
    delays = [t["delay_minutes"] for t in subs.values()]
    assert len(set(delays)) == len(delays)


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------
def test_duplicate_destination_is_rejected(client):
    reddit = _account(client, "reddit")
    response = _create(
        client,
        [
            {"account_id": reddit, "subreddit": "analog", "title": "A"},
            {"account_id": reddit, "subreddit": "r/analog", "title": "B"},
        ],
    )
    assert response.status_code == 400
    assert "duplicate" in response.get_json()["error"]


def test_reddit_target_needs_a_subreddit_and_a_title(client):
    reddit = _account(client, "reddit")
    missing_sub = _create(client, [{"account_id": reddit, "title": "T"}])
    assert missing_sub.status_code == 400
    assert "subreddit" in missing_sub.get_json()["error"]

    missing_title = _create(client, [{"account_id": reddit, "subreddit": "analog"}])
    assert missing_title.status_code == 400
    assert "title is required" in missing_title.get_json()["error"]


def test_over_long_title_is_rejected_at_schedule_time(client):
    reddit = _account(client, "reddit")
    response = _create(
        client,
        [{"account_id": reddit, "subreddit": "analog", "title": "x" * 301}],
    )
    assert response.status_code == 400
    assert "limit is 300" in response.get_json()["error"]


def test_a_required_flair_is_enforced_at_schedule_time(client):
    # Found while editing rather than at publish time, when the post would be
    # removed by the sub instead.
    reddit = _account(client, "reddit")
    client.put("/api/subreddits/analog", json={"requires_flair": True})
    response = _create(
        client, [{"account_id": reddit, "subreddit": "analog", "title": "T"}]
    )
    assert response.status_code == 400
    assert "requires a flair" in response.get_json()["error"]


def test_non_reddit_target_cannot_carry_a_subreddit(client):
    bluesky = _account(client, "bluesky")
    response = _create(
        client, [{"account_id": bluesky, "subreddit": "analog", "caption": "x"}]
    )
    assert response.status_code == 400
    assert "cannot have a subreddit" in response.get_json()["error"]


def test_unknown_account_is_rejected(client):
    response = _create(client, [{"account_id": 999, "caption": "x"}])
    assert response.status_code == 400
    assert "unknown account" in response.get_json()["error"]


# ---------------------------------------------------------------------------
# Backwards compatibility with the older account_ids + captions shape
# ---------------------------------------------------------------------------
def test_legacy_account_ids_and_captions_still_work(client):
    bluesky = _account(client, "bluesky")
    response = client.post(
        "/api/posts",
        data={
            "image": _image(),
            "scheduled_at": "2026-08-01T10:00:00Z",
            "account_ids": json.dumps([bluesky]),
            "captions": json.dumps({"bluesky": "hello"}),
        },
        content_type="multipart/form-data",
    )
    assert response.status_code == 201, response.get_json()
    targets = response.get_json()["targets"]
    assert len(targets) == 1
    assert targets[0]["caption"] == "hello"
    assert targets[0]["subreddit"] is None


def test_legacy_shape_refuses_reddit_and_says_what_to_send(client):
    # It has nowhere to put a subreddit, so silently creating a broken target
    # would be worse than refusing.
    reddit = _account(client, "reddit")
    response = client.post(
        "/api/posts",
        data={
            "image": _image(),
            "scheduled_at": "2026-08-01T10:00:00Z",
            "account_ids": json.dumps([reddit]),
            "captions": json.dumps({"reddit": "x"}),
        },
        content_type="multipart/form-data",
    )
    assert response.status_code == 400
    assert "targets" in response.get_json()["error"]


# ---------------------------------------------------------------------------
# Editing — reconcile on (account_id, subreddit)
# ---------------------------------------------------------------------------
def _edit(client, post_id, targets, scheduled_at="2026-08-02T09:00:00Z"):
    return client.put(
        f"/api/posts/{post_id}",
        data={"scheduled_at": scheduled_at, "targets": json.dumps(targets)},
        content_type="multipart/form-data",
    )


def test_edit_adds_and_drops_destinations(client):
    reddit = _account(client, "reddit")
    created = _create(
        client,
        [
            {"account_id": reddit, "subreddit": "EarthPorn", "title": "A"},
            {"account_id": reddit, "subreddit": "analog", "title": "B"},
        ],
    ).get_json()

    response = _edit(
        client,
        created["id"],
        [
            {"account_id": reddit, "subreddit": "EarthPorn", "title": "A"},
            {"account_id": reddit, "subreddit": "nationalparks", "title": "C"},
        ],
    )
    assert response.status_code == 200, response.get_json()
    assert set(_by_subreddit(response.get_json())) == {"EarthPorn", "nationalparks"}


def test_edit_preserves_a_posted_destination(client):
    # Identity is (account, subreddit), so a published target is updated in
    # place rather than deleted and recreated — its status and remote id survive.
    reddit = _account(client, "reddit")
    created = _create(
        client,
        [
            {"account_id": reddit, "subreddit": "EarthPorn", "title": "A"},
            {"account_id": reddit, "subreddit": "analog", "title": "B"},
        ],
    ).get_json()

    conn = db.get_connection()
    conn.execute(
        "UPDATE post_targets SET status = 'posted', remote_id = 'xyz' "
        "WHERE post_id = ? AND subreddit = 'analog'",
        (created["id"],),
    )
    conn.commit()
    conn.close()

    response = _edit(
        client,
        created["id"],
        [
            {"account_id": reddit, "subreddit": "EarthPorn", "title": "A"},
            {"account_id": reddit, "subreddit": "analog", "title": "B edited"},
        ],
    )
    analog = _by_subreddit(response.get_json())["analog"]
    assert analog["status"] == "posted"
    assert analog["remote_id"] == "xyz"
    assert analog["title"] == "B edited"


def test_rescheduling_slides_the_whole_stagger(client):
    # The offset is relative, so moving the post moves every destination with
    # it — no per-target time needs re-deriving.
    reddit = _account(client, "reddit")
    created = _create(
        client,
        [
            {"account_id": reddit, "subreddit": "EarthPorn", "title": "A", "delay_minutes": 0},
            {"account_id": reddit, "subreddit": "analog", "title": "B", "delay_minutes": 45},
        ],
    ).get_json()

    response = _edit(
        client,
        created["id"],
        [
            {"account_id": reddit, "subreddit": "EarthPorn", "title": "A", "delay_minutes": 0},
            {"account_id": reddit, "subreddit": "analog", "title": "B", "delay_minutes": 45},
        ],
        scheduled_at="2026-09-05T08:00:00Z",
    )
    subs = _by_subreddit(response.get_json())
    assert subs["EarthPorn"]["due_at"] == "2026-09-05T08:00:00Z"
    assert subs["analog"]["due_at"] == "2026-09-05T08:45:00Z"


# ---------------------------------------------------------------------------
# Subreddit rules API
# ---------------------------------------------------------------------------
def test_rules_can_be_edited_and_survive_an_import(client):
    client.put(
        "/api/subreddits/analog",
        json={"title_template": "MINE {title}", "min_interval_days": 5},
    )
    assert client.post("/api/subreddits/import").status_code == 200
    rules = [
        s for s in client.get("/api/subreddits").get_json() if s["name"] == "analog"
    ][0]
    assert rules["title_template"] == "MINE {title}"
    assert rules["min_interval_days"] == 5


def test_a_sub_can_be_added_and_removed(client):
    assert client.put("/api/subreddits/brandnew", json={}).status_code == 200
    names = [s["name"] for s in client.get("/api/subreddits").get_json()]
    assert "brandnew" in names
    assert client.delete("/api/subreddits/brandnew").status_code == 204
    names = [s["name"] for s in client.get("/api/subreddits").get_json()]
    assert "brandnew" not in names


def test_categories_list_their_subs(client):
    categories = client.get("/api/subreddit-categories").get_json()
    by_name = {c["name"]: c for c in categories}
    assert "Mexico" in by_name
    assert "Mexico" in by_name["Mexico"]["subreddits"]
    assert "Place|Mexico" in by_name["Mexico"]["keyword_prefixes"]


# ---------------------------------------------------------------------------
# Bulk ingestion — the Reddit selection is per photo
# ---------------------------------------------------------------------------
def _stage(client):
    response = client.post(
        "/api/ingest",
        data={"images": _image()},
        content_type="multipart/form-data",
    )
    assert response.status_code == 201, response.get_json()
    return response.get_json()[0]


def test_staged_photo_starts_with_no_reddit_selection(client):
    item = _stage(client)
    assert item["titles"] == {}


def test_selecting_subs_during_review_survives_and_normalizes(client):
    item = _stage(client)
    response = client.patch(
        f"/api/ingest/{item['id']}",
        json={
            "captions": {"reddit": "the description"},
            "titles": {"r/EarthPorn": "A", "analog": "B"},
        },
    )
    assert response.status_code == 200, response.get_json()
    assert set(response.get_json()["titles"]) == {"EarthPorn", "analog"}


def test_approve_expands_each_photos_subs_into_destinations(client):
    bluesky = _account(client, "bluesky")
    reddit = _account(client, "reddit")
    item = _stage(client)
    client.patch(
        f"/api/ingest/{item['id']}",
        json={
            "captions": {"bluesky": "bsky text", "reddit": "the description"},
            "titles": {"EarthPorn": "A", "analog": "B"},
        },
    )

    response = client.post(
        "/api/ingest/approve",
        json={
            "account_ids": [bluesky, reddit],
            "items": [
                {
                    "id": item["id"],
                    "scheduled_at": "2026-08-10T09:00:00Z",
                    "captions": {
                        "bluesky": "bsky text",
                        "reddit": "the description",
                    },
                }
            ],
        },
    )
    assert response.status_code == 201, response.get_json()
    post = response.get_json()[0]
    subs = _by_subreddit(post)
    assert set(subs) == {"EarthPorn", "analog"}
    # The Reddit body is the reddit caption, not the Bluesky one.
    assert all(t["caption"] == "the description" for t in subs.values())
    # And the subs are spread out.
    assert len({t["delay_minutes"] for t in subs.values()}) == 2
    bluesky_target = [t for t in post["targets"] if t["platform"] == "bluesky"][0]
    assert bluesky_target["caption"] == "bsky text"
    assert bluesky_target["delay_minutes"] == 0


def test_photo_with_no_subs_selected_skips_reddit_without_failing(client):
    # A batch legitimately mixes photos that suit Reddit and photos that don't.
    bluesky = _account(client, "bluesky")
    reddit = _account(client, "reddit")
    item = _stage(client)
    client.patch(
        f"/api/ingest/{item['id']}",
        json={"captions": {"bluesky": "only bsky"}, "titles": {}},
    )

    response = client.post(
        "/api/ingest/approve",
        json={
            "account_ids": [bluesky, reddit],
            "items": [
                {
                    "id": item["id"],
                    "scheduled_at": "2026-08-11T09:00:00Z",
                    "captions": {"bluesky": "only bsky"},
                }
            ],
        },
    )
    assert response.status_code == 201, response.get_json()
    platforms_used = [t["platform"] for t in response.get_json()[0]["targets"]]
    assert platforms_used == ["bluesky"]


def test_a_bad_title_rejects_the_batch_and_names_the_photo(client):
    # Approval is all-or-nothing, so the error has to say which photo.
    reddit = _account(client, "reddit")
    item = _stage(client)
    client.patch(
        f"/api/ingest/{item['id']}",
        json={"captions": {}, "titles": {"analog": ""}},
    )

    response = client.post(
        "/api/ingest/approve",
        json={
            "account_ids": [reddit],
            "items": [
                {
                    "id": item["id"],
                    "scheduled_at": "2026-08-12T09:00:00Z",
                    "captions": {},
                }
            ],
        },
    )
    assert response.status_code == 400
    body = response.get_json()
    assert body["item_id"] == item["id"]
    assert "title is required" in body["error"]
