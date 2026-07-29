#!/usr/bin/env python3
"""Social Poster - per-subreddit rules, categories and stagger.

Reddit is the only platform here where one account posts to many destinations,
and each destination has its own moderator-enforced requirements. This module
owns that knowledge:

* **Rules** — per-sub title template, flair, title length, whether the
  description may go in a first comment, and a minimum interval between our
  posts. Stored in the ``subreddits`` table, seeded once from
  ``config/subreddits.json`` and edited in-app thereafter.
* **Categories** — quick-select groups ("Mexico", "Film", "Nightscapes") whose
  ``keyword_prefixes`` are Lightroom hierarchy prefixes, so a photo's own
  keywords decide which subs get suggested for it.
* **Stagger** — submitting the same photo to several subs in the same minute is
  the textbook spam signature and several photo subs auto-remove for it, so
  multi-sub posts get spread out by default rather than as a nicety.
"""

import json
import re
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Sequence

try:
    from . import db
except ImportError:  # Allows running directly as `python subreddits.py`.
    import db

# The seed file. Imported only when the table is empty (or explicitly, for subs
# that don't exist yet) so in-app edits are never clobbered.
SEED_PATH = Path(__file__).parent.parent / "config" / "subreddits.json"

# Reddit's own cap; a sub's own limit may be lower and lives on the row.
TITLE_LIMIT = 300

# Default spacing between subs on the same photo when a sub doesn't set its own.
DEFAULT_STAGGER_MINUTES = 30

# Columns the API lets a client set, with the coercion each needs. Anything not
# listed here (id, created_at) is server-owned.
_INT_FIELDS = (
    "requires_flair",
    "max_title_length",
    "allow_tags",
    "comment_body",
    "min_interval_days",
    "stagger_minutes",
)
_TEXT_FIELDS = ("title_template", "flair_id", "flair_text", "notes")


def normalize_name(name: str) -> str:
    """Normalize a subreddit reference to its bare name.

    Accepts what a person actually types or pastes — ``r/analog``, ``/r/analog``,
    a full ``reddit.com/r/analog/`` URL, stray whitespace — and returns
    ``analog``. Case is preserved (Reddit displays it) but lookups are
    case-insensitive via the column's NOCASE collation.
    """
    text = (name or "").strip()
    # The scheme is optional: a name pasted from the address bar often arrives
    # as "old.reddit.com/r/Mexico" with no "https://".
    text = re.sub(
        r"^(https?://)?(www\.|old\.|new\.)?reddit\.com", "", text, flags=re.I
    )
    text = text.strip("/")
    text = re.sub(r"^/?r/", "", text, flags=re.I)
    return text.strip("/").strip()


# ---------------------------------------------------------------------------
# Serialization
# ---------------------------------------------------------------------------
def _json_list(raw) -> List[str]:
    """Parse a JSON array column into a list of strings, tolerating junk."""
    try:
        parsed = json.loads(raw or "[]")
    except (json.JSONDecodeError, TypeError):
        return []
    if not isinstance(parsed, list):
        return []
    return [str(x) for x in parsed]


def serialize(row) -> Dict:
    """Serialize a ``subreddits`` row into its API shape."""
    return {
        "id": row["id"],
        "name": row["name"],
        "categories": _json_list(row["categories"]),
        "title_template": row["title_template"],
        "flair_id": row["flair_id"],
        "flair_text": row["flair_text"],
        "requires_flair": bool(row["requires_flair"]),
        "max_title_length": row["max_title_length"],
        "allow_tags": bool(row["allow_tags"]),
        "comment_body": bool(row["comment_body"]),
        "min_interval_days": row["min_interval_days"],
        "stagger_minutes": row["stagger_minutes"],
        "notes": row["notes"],
    }


def serialize_category(row) -> Dict:
    """Serialize a ``subreddit_categories`` row into its API shape."""
    return {
        "id": row["id"],
        "name": row["name"],
        "keyword_prefixes": _json_list(row["keyword_prefixes"]),
    }


# ---------------------------------------------------------------------------
# Reads
# ---------------------------------------------------------------------------
def list_all(conn) -> List[Dict]:
    """Every configured subreddit, alphabetically."""
    rows = conn.execute(
        "SELECT * FROM subreddits ORDER BY name COLLATE NOCASE"
    ).fetchall()
    return [serialize(r) for r in rows]


def list_categories(conn) -> List[Dict]:
    """Every category, alphabetically, each with the subs that belong to it."""
    rows = conn.execute(
        "SELECT * FROM subreddit_categories ORDER BY name COLLATE NOCASE"
    ).fetchall()
    subs = list_all(conn)
    categories = []
    for row in rows:
        category = serialize_category(row)
        category["subreddits"] = [
            s["name"]
            for s in subs
            if any(c.lower() == category["name"].lower() for c in s["categories"])
        ]
        categories.append(category)
    return categories


def get(conn, name: str) -> Optional[Dict]:
    """One subreddit's rules by name (case-insensitive), or None."""
    row = conn.execute(
        "SELECT * FROM subreddits WHERE name = ?", (normalize_name(name),)
    ).fetchone()
    return serialize(row) if row else None


def get_many(conn, names: Sequence[str]) -> Dict[str, Dict]:
    """Rules for several subs, keyed by lowercased name (absent ones omitted)."""
    result = {}
    for name in names:
        rules = get(conn, name)
        if rules is not None:
            result[normalize_name(name).lower()] = rules
    return result


def rules_or_default(conn, name: str) -> Dict:
    """Rules for a sub, or permissive defaults when it isn't configured.

    Posting to an unconfigured sub is allowed — the user may add one ad hoc —
    it just gets no template, no flair and no cadence limit.
    """
    rules = get(conn, name)
    if rules is not None:
        return rules
    return {
        "id": None,
        "name": normalize_name(name),
        "categories": [],
        "title_template": "",
        "flair_id": None,
        "flair_text": None,
        "requires_flair": False,
        "max_title_length": TITLE_LIMIT,
        "allow_tags": False,
        "comment_body": True,
        "min_interval_days": 0,
        "stagger_minutes": DEFAULT_STAGGER_MINUTES,
        "notes": "",
    }


# ---------------------------------------------------------------------------
# Writes
# ---------------------------------------------------------------------------
def upsert(conn, payload: Dict) -> Dict:
    """Create or update one subreddit's rules from an API payload.

    Only the fields present in ``payload`` are written, so a partial PUT can
    change the flair without resetting the template. Returns the stored row.

    Raises ValueError on a missing/blank name or a non-list ``categories``.
    """
    name = normalize_name(str(payload.get("name") or ""))
    if not name:
        raise ValueError("subreddit name is required")

    existing = get(conn, name)
    if existing is None:
        conn.execute(
            "INSERT INTO subreddits (name, created_at) VALUES (?, ?)",
            (name, db.utc_now_iso()),
        )

    fields: List[str] = []
    values: List = []
    for key in _TEXT_FIELDS:
        if key in payload:
            value = payload[key]
            fields.append(f"{key} = ?")
            # flair_id/flair_text are nullable; the templates/notes are not.
            if key in ("flair_id", "flair_text"):
                values.append(str(value) if value else None)
            else:
                values.append(str(value or ""))
    for key in _INT_FIELDS:
        if key not in payload:
            continue
        fields.append(f"{key} = ?")
        if key in ("requires_flair", "allow_tags", "comment_body"):
            values.append(int(bool(payload[key])))  # SQLite has no boolean
        else:
            values.append(max(0, int(payload[key] or 0)))
    if "categories" in payload:
        categories = payload["categories"]
        if not isinstance(categories, list):
            raise ValueError("categories must be an array")
        fields.append("categories = ?")
        values.append(json.dumps([str(c) for c in categories]))

    if fields:
        values.append(name)
        conn.execute(
            "UPDATE subreddits SET " + ", ".join(fields) + " WHERE name = ?",
            values,
        )
    conn.commit()
    return get(conn, name)


def delete(conn, name: str) -> None:
    """Remove a subreddit's rules. Scheduled targets for it are untouched."""
    conn.execute("DELETE FROM subreddits WHERE name = ?", (normalize_name(name),))
    conn.commit()


def upsert_category(conn, payload: Dict) -> Dict:
    """Create or update a category (name + Lightroom keyword prefixes)."""
    name = str(payload.get("name") or "").strip()
    if not name:
        raise ValueError("category name is required")
    prefixes = payload.get("keyword_prefixes", [])
    if not isinstance(prefixes, list):
        raise ValueError("keyword_prefixes must be an array")
    row = conn.execute(
        "SELECT id FROM subreddit_categories WHERE name = ?", (name,)
    ).fetchone()
    if row is None:
        conn.execute(
            "INSERT INTO subreddit_categories (name, keyword_prefixes, created_at) "
            "VALUES (?, ?, ?)",
            (name, json.dumps([str(p) for p in prefixes]), db.utc_now_iso()),
        )
    else:
        conn.execute(
            "UPDATE subreddit_categories SET keyword_prefixes = ? WHERE id = ?",
            (json.dumps([str(p) for p in prefixes]), row["id"]),
        )
    conn.commit()
    stored = conn.execute(
        "SELECT * FROM subreddit_categories WHERE name = ?", (name,)
    ).fetchone()
    return serialize_category(stored)


def delete_category(conn, name: str) -> None:
    """Remove a category. Subs keep the (now unmatched) name in their list."""
    conn.execute("DELETE FROM subreddit_categories WHERE name = ?", (name,))
    conn.commit()


# ---------------------------------------------------------------------------
# Seeding from config/subreddits.json
# ---------------------------------------------------------------------------
def load_seed() -> Dict:
    """Read the seed file, or return empty collections if it's missing."""
    try:
        with open(SEED_PATH, encoding="utf-8") as f:
            data = json.load(f)
    except (OSError, json.JSONDecodeError):
        return {"categories": [], "subreddits": []}
    return {
        "categories": data.get("categories") or [],
        "subreddits": data.get("subreddits") or [],
    }


def import_seed(conn, only_missing: bool = True) -> Dict[str, int]:
    """Import the seed file into the tables.

    With ``only_missing`` (the default) existing rows are left exactly as they
    are, so importing is always safe: it can add subs the seed learned about
    without reverting rules the user corrected in-app.

    Returns ``{"subreddits": n_added, "categories": n_added}``.
    """
    seed = load_seed()
    added_categories = 0
    for category in seed["categories"]:
        name = str(category.get("name") or "").strip()
        if not name:
            continue
        exists = conn.execute(
            "SELECT 1 FROM subreddit_categories WHERE name = ?", (name,)
        ).fetchone()
        if exists and only_missing:
            continue
        upsert_category(conn, category)
        if not exists:
            added_categories += 1

    added_subs = 0
    for sub in seed["subreddits"]:
        name = normalize_name(str(sub.get("name") or ""))
        if not name:
            continue
        exists = get(conn, name) is not None
        if exists and only_missing:
            continue
        upsert(conn, sub)
        if not exists:
            added_subs += 1

    return {"subreddits": added_subs, "categories": added_categories}


def seed_if_empty(conn) -> None:
    """Import the seed on a database that has no subreddit rules yet."""
    count = conn.execute("SELECT COUNT(*) AS c FROM subreddits").fetchone()["c"]
    cats = conn.execute(
        "SELECT COUNT(*) AS c FROM subreddit_categories"
    ).fetchone()["c"]
    if count == 0 and cats == 0:
        import_seed(conn)


# ---------------------------------------------------------------------------
# Category matching — which subs suit this photo
# ---------------------------------------------------------------------------
def _prefix_matches(prefix: str, paths: Sequence[Sequence[str]]) -> bool:
    """True when any keyword path starts with the ``A|B`` hierarchy prefix."""
    parts = [p for p in prefix.split("|") if p]
    if not parts:
        return False
    lowered = [tuple(x.lower() for x in path) for path in paths]
    target = tuple(p.lower() for p in parts)
    return any(path[: len(target)] == target for path in lowered)


def match_categories(conn, keyword_paths: Sequence[Sequence[str]]) -> List[str]:
    """Category names a photo's Lightroom keywords match.

    A category with no prefixes (e.g. "General") always matches — it's the
    catch-all for subs that take anything.
    """
    matched = []
    for category in list_categories(conn):
        prefixes = category["keyword_prefixes"]
        if not prefixes or any(_prefix_matches(p, keyword_paths) for p in prefixes):
            matched.append(category["name"])
    return matched


def suggest(conn, keyword_paths: Sequence[Sequence[str]]) -> Dict:
    """Suggest subreddits for a photo from its keywords.

    Returns ``{"categories": [names], "subreddits": [names]}`` — the categories
    the photo matched and the deduplicated subs in them, in the order the
    categories matched. A suggestion, not a selection: the UI pre-checks these
    and the user edits before anything is scheduled.
    """
    matched = match_categories(conn, keyword_paths)
    lowered = {name.lower() for name in matched}
    names: List[str] = []
    for sub in list_all(conn):
        if any(c.lower() in lowered for c in sub["categories"]):
            names.append(sub["name"])
    return {"categories": matched, "subreddits": names}


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------
def validate_target(rules: Dict, title: str, flair_id: Optional[str]) -> Optional[str]:
    """Check one Reddit target against its sub's rules.

    Returns an error message, or None when the target is publishable. Run at
    schedule time (so the user finds out while editing) and again at publish
    time (rules may have changed since).
    """
    name = rules.get("name") or "this subreddit"
    if not (title or "").strip():
        return f"r/{name}: a title is required."
    limit = min(int(rules.get("max_title_length") or TITLE_LIMIT), TITLE_LIMIT)
    if len(title) > limit:
        return (
            f"r/{name}: title is {len(title)} characters, limit is {limit}."
        )
    if rules.get("requires_flair") and not (flair_id or rules.get("flair_id")):
        return f"r/{name}: this subreddit requires a flair."
    return None


def cadence_conflict(
    conn, subreddit: str, min_interval_days: int, when: Optional[str] = None
) -> Optional[str]:
    """Check a sub's minimum posting interval against our own history.

    Many photo subs cap how often one user may post, and breaking that gets the
    post removed and the account flagged. Measured against ``publish_log``
    rather than ``post_targets`` because the log outlives deleted posts, which
    is exactly the history that matters here.

    Returns an error message, or None when posting at ``when`` (default: now)
    is within the rules.
    """
    if not min_interval_days:
        return None
    name = normalize_name(subreddit)
    row = conn.execute(
        """
        SELECT MAX(attempted_at) AS last_at FROM publish_log
        WHERE platform = 'reddit' AND subreddit = ? AND status = 'posted'
        """,
        (name,),
    ).fetchone()
    last_at = row["last_at"] if row else None
    if not last_at:
        return None
    try:
        last = datetime.strptime(last_at, db.UTC_FORMAT)
        moment = (
            datetime.strptime(when, db.UTC_FORMAT)
            if when
            else datetime.strptime(db.utc_now_iso(), db.UTC_FORMAT)
        )
    except (ValueError, TypeError):
        return None
    earliest = last + timedelta(days=min_interval_days)
    if moment < earliest:
        return (
            f"r/{name}: last posted {last_at}; this sub's minimum interval is "
            f"{min_interval_days} day(s), so the earliest next post is "
            f"{earliest.strftime(db.UTC_FORMAT)}."
        )
    return None


# ---------------------------------------------------------------------------
# Stagger
# ---------------------------------------------------------------------------
def assign_delays(conn, names: Sequence[str], seed: int = 0) -> Dict[str, int]:
    """Spread several subs on one photo across time, in minutes from the anchor.

    Submitting the same image to many subs in the same minute is the classic
    spam signature — several photo subs auto-remove for it and mods do check —
    so this is closer to a correctness requirement than a nicety.

    The first sub goes out at the post's scheduled time (delay 0) and each
    subsequent one waits its own ``stagger_minutes`` after the previous, plus a
    small deterministic jitter so the gaps aren't suspiciously uniform. The
    jitter is derived from ``seed`` (the post id) and the sub's name rather than
    randomness, so re-rendering the same post produces the same offsets and
    saving twice doesn't reshuffle them.
    """
    delays: Dict[str, int] = {}
    running = 0
    for index, raw in enumerate(names):
        name = normalize_name(raw)
        if index == 0:
            delays[name] = 0
            continue
        rules = rules_or_default(conn, name)
        gap = int(rules.get("stagger_minutes") or DEFAULT_STAGGER_MINUTES)
        # 0..9 minutes of stable jitter; sum of code points is plenty of spread
        # for a handful of subs and needs no RNG state.
        jitter = (seed + sum(ord(c) for c in name.lower())) % 10
        running += max(1, gap) + jitter
        delays[name] = running
    return delays
