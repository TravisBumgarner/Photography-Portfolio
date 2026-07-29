#!/usr/bin/env python3
"""Social Poster - caption generation from photo metadata.

Python port of the old Photography-Portfolio/social-tagging Node tool. Photos
exported from Lightroom (with metadata included) carry an embedded XMP packet
holding the title, description, and hierarchical keywords, plus EXIF gear
info. This module turns that into ready-to-review captions:

1. Parse the embedded XMP for ``dc:title``, ``dc:description`` and
   ``lr:hierarchicalSubject`` keywords (e.g.
   ``cameracoffeewander|Place|USA|California``).
2. Map each ``cameracoffeewander|...`` keyword through the tag tree in
   ``config/tags.json`` to per-platform hashtag/account lists. The JSON file
   is the single editable source of tags — edit it directly to add/change
   tags; it is re-read on every extraction, so no restart is needed.
3. Read EXIF for the gear/setup lines (camera, lens, shutter, aperture,
   focal length), with the same per-camera label overrides as the old tool.
   Film posts use the analog convention instead: one ``📷 <camera> /
   🎞️ <film stock>`` line (Bluesky keyword feeds match on it).
4. Render the caption template per platform. Instagram is capped at 5 hashtags
   and 3 @mentions (2026 guidance deprioritizes posts with more), priority
   hubs first, then a random draw from the general tags tops up the hashtag
   budget so the mix varies across posts. Bluesky gets its own tag set,
   trimmed from the end so the caption fits the 300-character post limit.

Bulk ingestion calls ``extract_captions`` once per uploaded image in a
background thread. A raised ValueError marks that ingest item's tagging as
failed with the message, which the review UI surfaces (captions can then be
written by hand).
"""

import json
import random
import re
from pathlib import Path
from typing import Dict, List, Optional
from xml.etree import ElementTree

from PIL import Image

# The editable tag tree: nested categories whose leaves hold
# {"priority": [...], "general": [...], "bluesky": [...]} tag lists.
TAGS_PATH = Path(__file__).parent.parent / "config" / "tags.json"

# Only Lightroom keywords under this root are social tags; others (e.g.
# gallery organization) are ignored.
TAG_ROOT = "cameracoffeewander"

# Instagram deprioritizes posts with more than ~5 hashtags. Hashtags and
# @mentions are capped independently (mentions don't count toward the hashtag
# penalty, but a wall of @mentions still reads as spam), priority hubs first.
INSTAGRAM_HASHTAG_LIMIT = 5
INSTAGRAM_MENTION_LIMIT = 3

# Bluesky rejects posts over 300 characters (graphemes; len() is close enough
# for our ASCII tags). Tags are dropped from the end until the caption fits.
BLUESKY_CHAR_LIMIT = 300

_XMP_RE = re.compile(rb"<x:xmpmeta[^>]*>.*?</x:xmpmeta>", re.DOTALL)

_NS = {
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "dc": "http://purl.org/dc/elements/1.1/",
    "lr": "http://ns.adobe.com/lightroom/1.0/",
}

# EXIF tag ids (IFD0 + Exif IFD).
_MAKE, _MODEL = 271, 272
_EXIF_IFD = 0x8769
_EXPOSURE_TIME, _F_NUMBER = 0x829A, 0x829D
_DATE_TIME_ORIGINAL = 0x9003
_FOCAL_LENGTH = 0x920A
_LENS_MODEL = 0xA434

# Friendly camera labels by EXIF "Make - Model". A value of None for lens
# means "keep the EXIF lens"; '' blanks it (phones/scans where the lens line
# is noise). Mirrors metadataOverride.ts from the old tool.
_CAMERA_OVERRIDES: Dict[str, Dict[str, Optional[str]]] = {
    "Apple - iPhone 13 mini": {"camera": "iPhone 13", "lens": ""},
    "Google - Pixel 3": {"lens": ""},
    "motorola - moto x4": {"lens": ""},
    "NIKON CORPORATION - NIKON D3400": {"camera": "Nikon D3400"},
    "NIKON CORPORATION - NIKON D5300": {"camera": "Nikon D5300"},
    "NIKON CORPORATION - NIKON D7500": {"camera": "Nikon D7500"},
    "NIKON CORPORATION - NIKON Z 5": {"camera": "Nikon Z5"},
    "SONY - DSC-RX100": {"camera": "Sony RX100"},
    "SONY - SLT-A55V": {"camera": "Sony A55"},
    "SONY - DSLR-A290": {"camera": "Sony A290"},
    "DJI - FC3582": {"camera": "DJI Mini 3 Pro"},
    # Film scanners: the scanner isn't the real camera and EXIF has no usable
    # model, so drop the gear info unless a film-camera keyword overrides it.
    "NORITSU KOKI - QSS-32_33": {"camera": "", "lens": ""},
    "NORITSU KOKI - EZ Controller": {"camera": "", "lens": ""},
    # Exports with stripped camera EXIF.
    "None - None": {"camera": "", "lens": ""},
}

# Film cameras are identified by keyword, not EXIF (the scan carries the
# scanner's EXIF). Keyword wins over the EXIF-derived label.
_FILM_CAMERA_TAGS: Dict[str, Dict[str, Optional[str]]] = {
    f"{TAG_ROOT}|Camera|PentaxK1000": {"camera": "Pentax K1000"},
    f"{TAG_ROOT}|Camera|YashicaC": {"camera": "Yashica C"},
    f"{TAG_ROOT}|Camera|OlympusPS": {"camera": "Olympus Stylus P&S"},
    f"{TAG_ROOT}|Camera|NikonSLR": {"camera": "Nikon SLR"},
    f"{TAG_ROOT}|Camera|UnknownFilmCamera": {
        "camera": "Unknown Film Camera",
        "lens": "",
    },
}

# Display names for film-stock keywords, for the analog caption line
# (`📷 <camera> / 🎞️ <film stock>` — Bluesky keyword feeds match on it).
_FILM_STOCK_NAMES: Dict[str, str] = {
    f"{TAG_ROOT}|FilmType|Across100": "Fuji Acros 100",
    f"{TAG_ROOT}|FilmType|Ektar100": "Kodak Ektar 100",
    f"{TAG_ROOT}|FilmType|FujiPro160": "Fuji Pro 160",
    f"{TAG_ROOT}|FilmType|FujifilmXtra400": "Fujifilm Superia X-TRA 400",
    f"{TAG_ROOT}|FilmType|Gold200": "Kodak Gold 200",
    f"{TAG_ROOT}|FilmType|IlfordDelta3200": "Ilford Delta 3200",
    f"{TAG_ROOT}|FilmType|IlfordHP5": "Ilford HP5 Plus",
    f"{TAG_ROOT}|FilmType|Kentmere400": "Kentmere 400",
    f"{TAG_ROOT}|FilmType|Kodak400TX": "Kodak Tri-X 400",
    f"{TAG_ROOT}|FilmType|KodakColorPlus200": "Kodak ColorPlus 200",
    f"{TAG_ROOT}|FilmType|KodakTMax400": "Kodak T-Max 400",
    f"{TAG_ROOT}|FilmType|KodakUltramax400": "Kodak UltraMax 400",
    f"{TAG_ROOT}|FilmType|Lomography100": "Lomography Color Negative 100",
    f"{TAG_ROOT}|FilmType|LomographyMetro": "LomoChrome Metropolis",
    f"{TAG_ROOT}|FilmType|LomographyPurple": "LomoChrome Purple",
    f"{TAG_ROOT}|FilmType|LomographyTurquoise": "LomoChrome Turquoise",
    f"{TAG_ROOT}|FilmType|Portra160": "Kodak Portra 160",
    f"{TAG_ROOT}|FilmType|Portra400": "Kodak Portra 400",
    f"{TAG_ROOT}|FilmType|Portra800": "Kodak Portra 800",
}


# ---------------------------------------------------------------------------
# XMP (title / description / hierarchical keywords)
# ---------------------------------------------------------------------------
def _read_xmp(image_path: str) -> Optional[ElementTree.Element]:
    """Find and parse the embedded XMP packet, or None if the file has none."""
    data = Path(image_path).read_bytes()
    match = _XMP_RE.search(data)
    if match is None:
        return None
    try:
        return ElementTree.fromstring(match.group(0).decode("utf-8", "replace"))
    except ElementTree.ParseError:
        return None


def _xmp_text(root: ElementTree.Element, path: str) -> str:
    """First rdf:li text under an XMP property (Alt/Bag), or ''."""
    node = root.find(f".//{path}//rdf:li", _NS)
    return (node.text or "").strip() if node is not None else ""


def _xmp_list(root: ElementTree.Element, path: str) -> List[str]:
    """All rdf:li texts under an XMP property (Bag/Seq)."""
    return [
        (node.text or "").strip()
        for node in root.findall(f".//{path}//rdf:li", _NS)
        if node.text
    ]


# ---------------------------------------------------------------------------
# EXIF (gear/setup lines)
# ---------------------------------------------------------------------------
def _format_shutter_speed(exposure_time: float) -> str:
    if exposure_time <= 0:
        return ""
    if exposure_time < 1:
        return f"1/{round(1 / exposure_time)}s"
    return f"{exposure_time:g}s"


def _format_date_taken(exif_datetime: str) -> str:
    """EXIF 'YYYY:MM:DD HH:MM:SS' -> 'January 2026' ('' if unparseable)."""
    from datetime import datetime

    try:
        return datetime.strptime(exif_datetime[:10], "%Y:%m:%d").strftime("%B %Y")
    except ValueError:
        return ""


def _read_exif(image_path: str) -> Dict[str, str]:
    """Extract the template's gear/setup fields from EXIF, applying the
    per-camera label overrides. Unreadable/absent EXIF yields empty fields
    (the template drops empty lines)."""
    try:
        with Image.open(image_path) as img:
            exif = img.getexif()
            ifd = exif.get_ifd(_EXIF_IFD)
    except Exception:  # noqa: BLE001 - formats without EXIF support
        return {
            "camera": "",
            "lens": "",
            "shutter_speed": "",
            "aperture": "",
            "focal_length": "",
            "date_taken": "",
        }

    def clean(value) -> str:
        return str(value).strip().strip("\x00").strip() if value is not None else ""

    camera = f"{clean(exif.get(_MAKE)) or None} - {clean(exif.get(_MODEL)) or None}"
    lens = clean(ifd.get(_LENS_MODEL))
    if lens == "----":  # Sony A55 with an unrecognized lens
        lens = ""

    exposure = ifd.get(_EXPOSURE_TIME)
    f_number = ifd.get(_F_NUMBER)
    focal = ifd.get(_FOCAL_LENGTH)

    fields = {
        "camera": camera,
        "lens": lens,
        "shutter_speed": _format_shutter_speed(float(exposure)) if exposure else "",
        "aperture": f"ƒ/{float(f_number):.1f}" if f_number else "",
        "focal_length": f"{float(focal):g}mm" if focal else "",
        "date_taken": _format_date_taken(clean(ifd.get(_DATE_TIME_ORIGINAL))),
    }

    override = _CAMERA_OVERRIDES.get(camera, {})
    for key, value in override.items():
        if value is not None:
            fields[key] = value
    return fields


def _apply_film_camera_tags(fields: Dict[str, str], keywords: List[str]) -> None:
    """Film-camera keywords name the real camera (scans carry scanner EXIF).

    Also fills ``film_camera``/``film_stock`` so the caption template can
    switch to the analog convention (a photo can carry a film-stock keyword
    without a film-camera one, e.g. an unscanned hybrid workflow).
    """
    for tag, override in _FILM_CAMERA_TAGS.items():
        if tag in keywords:
            for key, value in override.items():
                if value is not None:
                    fields[key] = value
            fields["film_camera"] = fields["camera"]
    fields["film_stock"] = next(
        (name for tag, name in _FILM_STOCK_NAMES.items() if tag in keywords), ""
    )


# ---------------------------------------------------------------------------
# Tag tree lookup
# ---------------------------------------------------------------------------
def _load_tag_tree() -> Dict:
    with open(TAGS_PATH, encoding="utf-8") as f:
        return json.load(f)


def _lookup(tree: Dict, parts: List[str]) -> Optional[List[Dict]]:
    """Walk the tag tree by hierarchy parts; return every tag bucket on the
    path, most-specific (leaf) first, or None if the path is unknown.

    A bucket on an intermediate node (e.g. ``Place > USA``) applies to every
    hierarchy beneath it — so a shared hub is written once at the parent
    instead of duplicated into each child. The leaf itself must be a bucket.
    """
    node = tree
    buckets: List[Dict] = []
    for part in parts:
        if not isinstance(node, dict) or part not in node:
            return None
        node = node[part]
        if isinstance(node, dict) and "general" in node:
            buckets.append(node)
    if not buckets or buckets[-1] is not node:
        return None
    return list(reversed(buckets))


def _collect_tag_lists(keywords: List[str]) -> Dict[str, List[str]]:
    """Gather the raw per-platform tag lists for a photo's keywords, deduped.

    Returns ``{"priority": [...], "general": [...], "bluesky": [...]}`` in tag-
    tree order. Raises ValueError naming any keyword the tree doesn't know, so
    the tree and the Lightroom hierarchy stay in sync (same contract as the old
    tool).
    """
    tree = _load_tag_tree()
    errors: List[str] = []
    priority: List[str] = []
    general: List[str] = []
    bluesky: List[str] = []

    for keyword in keywords:
        if TAG_ROOT not in keyword:
            continue
        hierarchy = keyword.replace(f"{TAG_ROOT}|", "")
        buckets = _lookup(tree, hierarchy.split("|"))
        if buckets is None:
            errors.append(f"Unknown hierarchy tag: {hierarchy}")
            continue
        if not any(b["general"] or b["priority"] for b in buckets):
            errors.append(f"No tags or accounts found for hierarchy tag: {hierarchy}")
            continue
        for bucket in buckets:
            priority.extend(bucket["priority"])
            general.extend(bucket["general"])
            bluesky.extend(bucket.get("bluesky", []))

    if errors:
        raise ValueError("; ".join(errors))

    malformed = [
        t
        for t in priority + general + bluesky
        if t[:2] in ("##", "@@", "#@", "@#")
    ]
    if malformed:
        raise ValueError(f"Malformed tag(s) in tag tree: {malformed}")

    return {
        "priority": list(dict.fromkeys(priority)),
        "general": list(dict.fromkeys(general)),
        "bluesky": list(dict.fromkeys(bluesky)),
    }


def _generate_social_tags(keywords: List[str]) -> Dict[str, List[str]]:
    """Map ``cameracoffeewander|...`` keywords to the per-platform tag lists
    that actually post: Instagram capped/selected, Bluesky as-is."""
    lists = _collect_tag_lists(keywords)
    priority = lists["priority"]
    general = lists["general"]
    bluesky = lists["bluesky"]

    # Hashtags and @mentions are each hard-capped (5 and 3), priority hubs
    # first; the leftover hashtag budget is topped up from a random draw of the
    # general tags so the mix varies post to post.
    instagram: List[str] = []
    hashtags = 0
    mentions = 0

    def _add(tag: str) -> None:
        nonlocal hashtags, mentions
        if tag in instagram:
            return
        if tag.startswith("#"):
            if hashtags >= INSTAGRAM_HASHTAG_LIMIT:
                return
            hashtags += 1
        elif tag.startswith("@"):
            if mentions >= INSTAGRAM_MENTION_LIMIT:
                return
            mentions += 1
        instagram.append(tag)

    for tag in priority:
        _add(tag)
    pool = [t for t in general if t not in instagram]
    random.shuffle(pool)
    for tag in pool:
        _add(tag)

    return {"instagram": instagram, "bluesky": bluesky}


# ---------------------------------------------------------------------------
# Caption template
# ---------------------------------------------------------------------------
def _render_caption(fields: Dict[str, str], title: str, description: str,
                    tags: List[str]) -> str:
    if fields.get("film_camera") or fields.get("film_stock"):
        # Analog convention: one `📷 <camera> / 🎞️ <film stock>` line replaces
        # the gear/setup lines (Bluesky keyword feeds match on it, and a
        # scan's shutter/aperture EXIF is scanner noise anyway).
        gear_lines = [
            " / ".join(
                part
                for part in (
                    f"📷 {fields['camera']}" if fields["camera"] else "",
                    f"🎞️ {fields['film_stock']}" if fields.get("film_stock") else "",
                )
                if part
            )
        ]
    else:
        gear = ", ".join(x for x in (fields["camera"], fields["lens"]) if x)
        setup_parts = [
            fields["shutter_speed"],
            fields["aperture"],
            f"{fields['focal_length']} focal length" if fields["focal_length"] else "",
        ]
        gear_lines = [
            f"The Gear - {gear}" if gear else "",
            f"The Setup - {', '.join(p for p in setup_parts if p)}"
            if any(setup_parts)
            else "",
        ]
    lines = [
        f"{title.strip()} {fields['date_taken']}".strip(),
        description.strip(),
        *gear_lines,
        " ".join(tags),
    ]
    return "\n".join(line for line in lines if line)


def _render_bluesky_caption(fields: Dict[str, str], title: str,
                            description: str, tags: List[str]) -> str:
    """Render for Bluesky, dropping trailing tags until the 300-char limit fits.

    Tag lists in the tree are ordered most-important-first (feed triggers), so
    the end is the right place to trim. If the caption is over the limit even
    with no tags, it's hard-cut — Bluesky rejects longer posts outright.
    """
    for n in range(len(tags), -1, -1):
        caption = _render_caption(fields, title, description, tags[:n])
        if len(caption) <= BLUESKY_CHAR_LIMIT:
            return caption
    return caption[:BLUESKY_CHAR_LIMIT]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def extract_captions(image_path: str) -> Dict[str, str]:
    """Build per-platform captions for a photo, e.g. ``{"instagram": ...,
    "bluesky": ...}``.

    Raises ValueError with a human-readable message when the photo lacks the
    Lightroom keywords the tag tree needs (the review UI shows it and the
    captions can be written by hand).
    """
    xmp = _read_xmp(image_path)
    if xmp is None:
        raise ValueError(
            "No XMP metadata found — export from Lightroom with metadata included"
        )

    keywords = _xmp_list(xmp, "lr:hierarchicalSubject")
    if not keywords:
        raise ValueError("No Lightroom hierarchical keywords (lr:hierarchicalSubject)")

    title = _xmp_text(xmp, "dc:title")
    description = _xmp_text(xmp, "dc:description")

    tags = _generate_social_tags(keywords)

    fields = _read_exif(image_path)
    _apply_film_camera_tags(fields, keywords)

    return {
        "instagram": _render_caption(fields, title, description,
                                     tags["instagram"]),
        "bluesky": _render_bluesky_caption(fields, title, description,
                                           tags["bluesky"]),
    }


def extract_tag_pools(image_path: str) -> Dict[str, Dict]:
    """Build the structured tag pools for the bulk-review pill editor.

    Returns per platform ``{"prefix": <caption minus the tag line>, "tags":
    [{"text", "priority", "mention"}, ...]}``. The frontend renders the pool as
    draggable pills and rebuilds the caption as ``prefix`` + the chosen tag
    line, so the ordering/selection is the user's while the fixed part (title,
    description, gear line) stays server-rendered.

    Instagram's pool is priority hubs first (starred) then a shuffled draw of
    the general tags — the shuffle gives each photo a varied but, once stored,
    stable starting order. Bluesky has a single list (most-important-first, no
    priority split). Raises the same ValueErrors as ``extract_captions``.
    """
    xmp = _read_xmp(image_path)
    if xmp is None:
        raise ValueError(
            "No XMP metadata found — export from Lightroom with metadata included"
        )

    keywords = _xmp_list(xmp, "lr:hierarchicalSubject")
    if not keywords:
        raise ValueError("No Lightroom hierarchical keywords (lr:hierarchicalSubject)")

    title = _xmp_text(xmp, "dc:title")
    description = _xmp_text(xmp, "dc:description")
    fields = _read_exif(image_path)
    _apply_film_camera_tags(fields, keywords)

    lists = _collect_tag_lists(keywords)
    prefix = _render_caption(fields, title, description, [])

    def _pill(text: str, priority: bool) -> Dict:
        return {
            "text": text,
            "priority": priority,
            "mention": text.startswith("@"),
            "selected": False,
        }

    general_only = [t for t in lists["general"] if t not in lists["priority"]]
    random.shuffle(general_only)
    instagram_pool = [_pill(t, True) for t in lists["priority"]]
    instagram_pool += [_pill(t, False) for t in general_only]
    bluesky_pool = [_pill(t, False) for t in lists["bluesky"]]

    _select_instagram_defaults(instagram_pool)
    _select_bluesky_defaults(bluesky_pool, prefix)

    return {
        "instagram": {"prefix": prefix, "tags": instagram_pool},
        "bluesky": {"prefix": prefix, "tags": bluesky_pool},
    }


def _select_instagram_defaults(pool: List[Dict]) -> None:
    """Mark the default posting set: the first HASHTAG_LIMIT hashtags and the
    first MENTION_LIMIT @mentions (priority-first), matching the caption."""
    hashtags = mentions = 0
    for tag in pool:
        if tag["text"].startswith("#"):
            if hashtags < INSTAGRAM_HASHTAG_LIMIT:
                tag["selected"] = True
                hashtags += 1
        elif tag["text"].startswith("@"):
            if mentions < INSTAGRAM_MENTION_LIMIT:
                tag["selected"] = True
                mentions += 1
        else:
            tag["selected"] = True


def _select_bluesky_defaults(pool: List[Dict], prefix: str) -> None:
    """Select the longest leading run of tags whose caption fits 300 chars."""
    for kept in range(len(pool), -1, -1):
        line = " ".join(t["text"] for t in pool[:kept])
        caption = f"{prefix}\n{line}" if line else prefix
        if len(caption) <= BLUESKY_CHAR_LIMIT:
            for i, tag in enumerate(pool):
                tag["selected"] = i < kept
            return


def keyword_paths(image_path: str) -> List[List[str]]:
    """Return each ``cameracoffeewander|...`` keyword on a photo as a list of
    hierarchy parts (root prefix stripped), e.g.
    ``["Place", "USA", "Alaska", "State"]``. Non-root keywords are skipped.

    Raises ValueError when the photo has no XMP or no hierarchical keywords —
    the same preconditions ``extract_captions`` needs — so the caller can tell
    "nothing to check" apart from "no metadata to check".
    """
    xmp = _read_xmp(image_path)
    if xmp is None:
        raise ValueError(
            "No XMP metadata found — export from Lightroom with metadata included"
        )

    keywords = _xmp_list(xmp, "lr:hierarchicalSubject")
    if not keywords:
        raise ValueError("No Lightroom hierarchical keywords (lr:hierarchicalSubject)")

    return [
        keyword.replace(f"{TAG_ROOT}|", "").split("|")
        for keyword in keywords
        if TAG_ROOT in keyword
    ]


def _path_registered(tree: Dict, parts: List[str]) -> bool:
    """True when every part of the hierarchy exists as a key in the tag tree."""
    node: object = tree
    for part in parts:
        if not isinstance(node, dict) or part not in node:
            return False
        node = node[part]
    return True


def missing_paths(paths: List[List[str]]) -> List[str]:
    """The ``A|B|C`` hierarchy strings that aren't fully registered in the tag
    tree, deduplicated in first-seen order — the tags that need to be made."""
    tree = _load_tag_tree()
    missing: List[str] = []
    for parts in paths:
        if not _path_registered(tree, parts):
            key = "|".join(parts)
            if key not in missing:
                missing.append(key)
    return missing


def tag_status_tree(paths: List[List[str]]) -> List[Dict]:
    """Merge hierarchy ``paths`` into a nested tree annotated with whether each
    node exists in the tag tree, pruned to only the branches that lead to a
    missing node.

    Each node is ``{"name", "exists", "children"}``. Fully-registered branches
    are dropped (nothing to do there); a kept branch shows its existing
    ancestors (breadcrumb context) down to the missing node(s) beneath them.
    Children are sorted by name so the output is stable.
    """
    tree = _load_tag_tree()

    # Merge every path into one prefix tree.
    merged: Dict = {}
    for parts in paths:
        node = merged
        for part in parts:
            node = node.setdefault(part, {})

    def build(subtree: Dict, json_node: object) -> List[Dict]:
        nodes: List[Dict] = []
        for name in sorted(subtree):
            exists = isinstance(json_node, dict) and name in json_node
            child_json = json_node[name] if exists else None  # type: ignore[index]
            children = build(subtree[name], child_json)
            # Keep a node only if it (or something under it) needs making.
            if not exists or children:
                nodes.append(
                    {"name": name, "exists": exists, "children": children}
                )
        return nodes

    return build(merged, tree)
