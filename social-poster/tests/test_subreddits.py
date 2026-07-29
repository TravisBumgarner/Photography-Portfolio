"""Tests for the per-subreddit rules, category quick-selects and stagger.

These encode the rules moderators actually enforce — title format and length,
flair, how often we may post — plus the spacing between subs on one photo. The
point is that a target which would be removed by a mod fails here, while the
user is still editing, rather than at publish time.
"""

import sys
from pathlib import Path

_SCRIPTS = Path(__file__).parent.parent / "scripts"
sys.path.insert(0, str(_SCRIPTS))

import db  # noqa: E402
import subreddits  # noqa: E402


def _use_temp_db(tmp_path, monkeypatch):
    """Point db at a throwaway directory and initialize the schema."""
    monkeypatch.setattr(db, "DATA_DIR", tmp_path)
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "social-poster.db")
    monkeypatch.setattr(db, "IMAGES_DIR", tmp_path / "images")
    db.init_db()
    conn = db.get_connection()
    try:
        subreddits.seed_if_empty(conn)
    finally:
        conn.close()


def _paths(*keywords):
    """Lightroom hierarchy keywords as the path lists the matcher takes."""
    return [k.split("|") for k in keywords]


# ---------------------------------------------------------------------------
# normalize_name
# ---------------------------------------------------------------------------
def test_normalize_name_accepts_what_people_actually_paste():
    for raw, expected in [
        ("analog", "analog"),
        ("r/analog", "analog"),
        ("/r/analog", "analog"),
        ("  analog  ", "analog"),
        ("analog/", "analog"),
        ("https://www.reddit.com/r/EarthPorn/", "EarthPorn"),
        # No scheme: what the address bar gives you.
        ("old.reddit.com/r/Mexico", "Mexico"),
    ]:
        assert subreddits.normalize_name(raw) == expected


def test_normalize_name_preserves_display_casing():
    # Reddit shows the sub's own casing; lookups are case-insensitive instead.
    assert subreddits.normalize_name("r/EarthPorn") == "EarthPorn"


# ---------------------------------------------------------------------------
# Seeding
# ---------------------------------------------------------------------------
def test_seed_populates_rules_and_categories(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    conn = db.get_connection()
    try:
        assert len(subreddits.list_all(conn)) > 0
        assert len(subreddits.list_categories(conn)) > 0
    finally:
        conn.close()


def test_seeding_is_idempotent(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    conn = db.get_connection()
    try:
        before = len(subreddits.list_all(conn))
        subreddits.seed_if_empty(conn)
        subreddits.import_seed(conn)
        assert len(subreddits.list_all(conn)) == before
    finally:
        conn.close()


def test_import_never_clobbers_an_in_app_edit(tmp_path, monkeypatch):
    # The seed's rules are unverified starting points; once corrected in the app
    # they must survive re-importing, or the correction silently reverts.
    _use_temp_db(tmp_path, monkeypatch)
    conn = db.get_connection()
    try:
        subreddits.upsert(
            conn,
            {"name": "analog", "title_template": "MINE {title}", "min_interval_days": 3},
        )
        subreddits.import_seed(conn)
        rules = subreddits.get(conn, "analog")
        assert rules["title_template"] == "MINE {title}"
        assert rules["min_interval_days"] == 3
    finally:
        conn.close()


def test_lookup_is_case_insensitive_and_strips_prefix(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    conn = db.get_connection()
    try:
        assert subreddits.get(conn, "R/ANALOG")["name"] == "analog"
        assert subreddits.get(conn, "no-such-sub") is None
    finally:
        conn.close()


def test_unconfigured_sub_gets_permissive_defaults(tmp_path, monkeypatch):
    # Posting to a sub added ad hoc is allowed; it just has no template or limit.
    _use_temp_db(tmp_path, monkeypatch)
    conn = db.get_connection()
    try:
        rules = subreddits.rules_or_default(conn, "somewhere-new")
        assert rules["max_title_length"] == subreddits.TITLE_LIMIT
        assert rules["requires_flair"] is False
        assert rules["min_interval_days"] == 0
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Category matching — a photo's keywords decide which subs are suggested
# ---------------------------------------------------------------------------
def test_suggests_subs_matching_the_photos_keywords(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    conn = db.get_connection()
    try:
        out = subreddits.suggest(
            conn, _paths("Place|Mexico|MexicoCity", "PhotoType|Stars")
        )
        assert "Mexico" in out["categories"]
        assert "Nightscapes" in out["categories"]
        assert "Mexico" in out["subreddits"]
        assert "astrophotography" in out["subreddits"]
        # A digital night shot has no business in a film sub.
        assert "analog" not in out["subreddits"]
    finally:
        conn.close()


def test_film_keyword_suggests_the_film_subs(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    conn = db.get_connection()
    try:
        out = subreddits.suggest(
            conn, _paths("FilmType|Portra400", "Place|USA|Utah|State")
        )
        assert {"Film", "USA"} <= set(out["categories"])
        assert "analog" in out["subreddits"]
    finally:
        conn.close()


def test_catch_all_category_always_matches(tmp_path, monkeypatch):
    # "General" has no keyword prefixes: subs that take anything.
    _use_temp_db(tmp_path, monkeypatch)
    conn = db.get_connection()
    try:
        out = subreddits.suggest(conn, _paths("PhotoType|Selfie"))
        assert "General" in out["categories"]
    finally:
        conn.close()


def test_prefix_matches_a_parent_not_a_sibling(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    conn = db.get_connection()
    try:
        # Place|Mexico matches a deeper Mexico path...
        assert subreddits._prefix_matches(
            "Place|Mexico", _paths("Place|Mexico|Baja|Region")
        )
        # ...but not another country under the same parent.
        assert not subreddits._prefix_matches(
            "Place|Mexico", _paths("Place|Canada|Alberta|Province")
        )
        # An empty prefix must not match everything by accident.
        assert not subreddits._prefix_matches("", _paths("Place|Mexico"))
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# validate_target
# ---------------------------------------------------------------------------
def _rules(**overrides):
    base = {
        "name": "analog",
        "max_title_length": 300,
        "requires_flair": False,
        "flair_id": None,
    }
    base.update(overrides)
    return base


def test_validate_accepts_a_good_title():
    assert subreddits.validate_target(_rules(), "A perfectly fine title", None) is None


def test_validate_requires_a_title():
    assert "title is required" in subreddits.validate_target(_rules(), "   ", None)


def test_validate_enforces_reddits_limit_and_the_subs_own():
    assert "limit is 300" in subreddits.validate_target(_rules(), "x" * 301, None)
    assert "limit is 50" in subreddits.validate_target(
        _rules(max_title_length=50), "x" * 51, None
    )
    # A sub can't raise the limit above Reddit's own cap.
    assert "limit is 300" in subreddits.validate_target(
        _rules(max_title_length=9999), "x" * 301, None
    )


def test_validate_enforces_a_required_flair():
    strict = _rules(requires_flair=True)
    assert "requires a flair" in subreddits.validate_target(strict, "Title", None)
    # Either the target's own flair or the sub's default satisfies it.
    assert subreddits.validate_target(strict, "Title", "flair-1") is None
    assert (
        subreddits.validate_target(
            _rules(requires_flair=True, flair_id="default-flair"), "Title", None
        )
        is None
    )


# ---------------------------------------------------------------------------
# cadence — measured against publish_log, which outlives deleted posts
# ---------------------------------------------------------------------------
def _log_post(conn, subreddit, when, status="posted"):
    conn.execute(
        "INSERT INTO publish_log (platform, username, subreddit, status, "
        " attempted_at) VALUES ('reddit', 'me', ?, ?, ?)",
        (subreddit, status, when),
    )
    conn.commit()


def test_cadence_allows_when_no_limit_or_no_history(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    conn = db.get_connection()
    try:
        assert subreddits.cadence_conflict(conn, "analog", 0) is None
        assert subreddits.cadence_conflict(conn, "analog", 7) is None
    finally:
        conn.close()


def test_cadence_blocks_inside_the_interval(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    conn = db.get_connection()
    try:
        _log_post(conn, "analog", "2026-07-28T12:00:00Z")
        message = subreddits.cadence_conflict(
            conn, "r/analog", 7, when="2026-07-29T12:00:00Z"
        )
        assert message is not None
        assert "minimum interval" in message
        # The message names the earliest acceptable next post.
        assert "2026-08-04T12:00:00Z" in message
    finally:
        conn.close()


def test_cadence_allows_once_the_interval_has_passed(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    conn = db.get_connection()
    try:
        _log_post(conn, "analog", "2026-07-28T12:00:00Z")
        assert (
            subreddits.cadence_conflict(
                conn, "analog", 7, when="2026-08-05T12:00:00Z"
            )
            is None
        )
    finally:
        conn.close()


def test_cadence_ignores_failed_attempts(tmp_path, monkeypatch):
    # A failed attempt never reached the sub, so it can't count against us.
    _use_temp_db(tmp_path, monkeypatch)
    conn = db.get_connection()
    try:
        _log_post(conn, "analog", "2026-07-28T12:00:00Z", status="failed")
        assert (
            subreddits.cadence_conflict(
                conn, "analog", 7, when="2026-07-29T12:00:00Z"
            )
            is None
        )
    finally:
        conn.close()


def test_cadence_is_per_subreddit(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    conn = db.get_connection()
    try:
        _log_post(conn, "analog", "2026-07-28T12:00:00Z")
        assert (
            subreddits.cadence_conflict(
                conn, "EarthPorn", 7, when="2026-07-29T12:00:00Z"
            )
            is None
        )
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# assign_delays — the stagger
# ---------------------------------------------------------------------------
def test_first_sub_posts_at_the_anchor_and_the_rest_are_spread(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    conn = db.get_connection()
    try:
        delays = subreddits.assign_delays(
            conn, ["EarthPorn", "analog", "itookapicture"], seed=42
        )
        assert delays["EarthPorn"] == 0
        values = sorted(delays.values())
        # Distinct and strictly increasing: no two subs may fire together.
        assert values == sorted(set(values))
        assert all(b > a for a, b in zip(values, values[1:]))
    finally:
        conn.close()


def test_delays_are_deterministic(tmp_path, monkeypatch):
    # Saving a post twice must not reshuffle its offsets.
    _use_temp_db(tmp_path, monkeypatch)
    conn = db.get_connection()
    try:
        names = ["EarthPorn", "analog", "SkyPorn"]
        first = subreddits.assign_delays(conn, names, seed=7)
        assert subreddits.assign_delays(conn, names, seed=7) == first
    finally:
        conn.close()


def test_single_sub_has_no_offset(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    conn = db.get_connection()
    try:
        assert subreddits.assign_delays(conn, ["analog"]) == {"analog": 0}
    finally:
        conn.close()


def test_start_after_places_new_subs_beyond_the_existing_ones(tmp_path, monkeypatch):
    # Adding a sub to a photo that already has some must not land on 0 next to
    # the existing first sub — that's the simultaneous post being avoided.
    _use_temp_db(tmp_path, monkeypatch)
    conn = db.get_connection()
    try:
        delays = subreddits.assign_delays(
            conn, ["streetphotography"], seed=1, start_after=40
        )
        assert delays["streetphotography"] > 40
    finally:
        conn.close()


def test_a_subs_own_stagger_setting_is_used(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    conn = db.get_connection()
    try:
        subreddits.upsert(conn, {"name": "slowsub", "stagger_minutes": 600})
        delays = subreddits.assign_delays(conn, ["analog", "slowsub"], seed=0)
        assert delays["slowsub"] >= 600
    finally:
        conn.close()
