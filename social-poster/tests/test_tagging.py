"""Tests for caption generation from photo metadata (XMP + EXIF + tag tree)."""

import json
import sys
from pathlib import Path

import pytest
from PIL import Image

_SCRIPTS = Path(__file__).parent.parent / "scripts"
sys.path.insert(0, str(_SCRIPTS))

import tagging  # noqa: E402


def _xmp_packet(keywords, title="Golden Gate", description="Fog at sunrise."):
    lis = "".join(f"<rdf:li>{k}</rdf:li>" for k in keywords)
    return f"""<x:xmpmeta xmlns:x="adobe:ns:meta/">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description xmlns:dc="http://purl.org/dc/elements/1.1/"
                   xmlns:lr="http://ns.adobe.com/lightroom/1.0/">
   <dc:title><rdf:Alt><rdf:li xml:lang="x-default">{title}</rdf:li></rdf:Alt></dc:title>
   <dc:description><rdf:Alt><rdf:li xml:lang="x-default">{description}</rdf:li></rdf:Alt></dc:description>
   <lr:hierarchicalSubject><rdf:Bag>{lis}</rdf:Bag></lr:hierarchicalSubject>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>""".encode("utf-8")


def _write_photo(path, keywords, with_exif=True, **xmp_kwargs):
    """Create a small JPEG, optionally with camera EXIF, and append an XMP
    packet (the extractor scans file bytes for the packet, so appending is
    equivalent to Lightroom embedding it)."""
    img = Image.new("RGB", (8, 8), "gray")
    if with_exif:
        exif = Image.Exif()
        exif[271] = "NIKON CORPORATION"  # Make
        exif[272] = "NIKON Z 5"  # Model
        ifd = exif.get_ifd(0x8769)
        ifd[0x829A] = 0.005  # ExposureTime -> 1/200s
        ifd[0x829D] = 2.8  # FNumber
        ifd[0x9003] = "2026:05:01 10:00:00"  # DateTimeOriginal
        ifd[0x920A] = 35.0  # FocalLength
        ifd[0xA434] = "NIKKOR Z 35mm f/1.8 S"  # LensModel
        img.save(path, exif=exif)
    else:
        img.save(path)
    with open(path, "ab") as f:
        f.write(_xmp_packet(keywords, **xmp_kwargs))


def test_extract_captions_end_to_end(tmp_path):
    photo = tmp_path / "photo.jpg"
    _write_photo(photo, ["cameracoffeewander|Camera|NikonZ5", "gallery|ignored"])

    captions = tagging.extract_captions(str(photo))

    instagram = captions["instagram"]
    assert instagram.splitlines()[0] == "Golden Gate May 2026"
    assert "Fog at sunrise." in instagram
    assert "The Gear - Nikon Z5, NIKKOR Z 35mm f/1.8 S" in instagram
    assert "The Setup - 1/200s, ƒ/2.8, 35mm focal length" in instagram
    # NikonZ5 is a hub bucket (general removed), so IG posts its priority hubs.
    assert "#NikonNoFilter" in instagram and "@nikonusa" in instagram

    bluesky = captions["bluesky"]
    assert "#nikon" in bluesky  # bluesky uses its own tag set


def test_unknown_hierarchy_tag_raises(tmp_path):
    photo = tmp_path / "photo.jpg"
    _write_photo(photo, ["cameracoffeewander|Camera|NotACamera"])

    with pytest.raises(ValueError, match="Unknown hierarchy tag: Camera|NotACamera"):
        tagging.extract_captions(str(photo))


def test_photo_without_xmp_raises(tmp_path):
    photo = tmp_path / "photo.jpg"
    Image.new("RGB", (8, 8), "gray").save(photo)

    with pytest.raises(ValueError, match="No XMP metadata"):
        tagging.extract_captions(str(photo))


def test_photo_without_keywords_raises(tmp_path):
    photo = tmp_path / "photo.jpg"
    _write_photo(photo, [])

    with pytest.raises(ValueError, match="hierarchical keywords"):
        tagging.extract_captions(str(photo))


def test_keyword_paths_strips_root_and_skips_non_root(tmp_path):
    photo = tmp_path / "photo.jpg"
    _write_photo(
        photo,
        [
            "cameracoffeewander|Camera|NikonZ5",
            "cameracoffeewander|Place|USA|Atlantis|State",
            "gallery|ignored",  # non-root keyword, always skipped
        ],
    )

    assert tagging.keyword_paths(str(photo)) == [
        ["Camera", "NikonZ5"],
        ["Place", "USA", "Atlantis", "State"],
    ]


def test_keyword_paths_requires_metadata(tmp_path):
    photo = tmp_path / "photo.jpg"
    Image.new("RGB", (8, 8), "gray").save(photo)

    with pytest.raises(ValueError, match="No XMP metadata"):
        tagging.keyword_paths(str(photo))


def _tag_tree(tmp_path, monkeypatch, tree):
    tags_path = tmp_path / "tags.json"
    tags_path.write_text(json.dumps(tree))
    monkeypatch.setattr(tagging, "TAGS_PATH", tags_path)


def test_missing_paths_lists_unregistered_only(tmp_path, monkeypatch):
    _tag_tree(tmp_path, monkeypatch, {"Place": {"USA": {"California": {}}}})

    paths = [
        ["Place", "USA", "California"],  # registered
        ["Place", "USA", "Atlantis", "State"],  # not in the tree
        ["Place", "USA", "Atlantis", "State"],  # duplicate — deduped
    ]
    assert tagging.missing_paths(paths) == ["Place|USA|Atlantis|State"]


def test_tag_status_tree_prunes_existing_and_marks_nodes(tmp_path, monkeypatch):
    _tag_tree(tmp_path, monkeypatch, {"Place": {"USA": {"California": {}}}})

    paths = [
        ["Camera", "NikonZ5"],  # fully registered? no — Camera missing entirely
        ["Place", "USA", "California"],  # fully registered → pruned away
        ["Place", "USA", "Atlantis", "State"],  # Atlantis/State missing
    ]
    # Only branches leading to a missing node survive. Camera is missing, and
    # Place is kept as a breadcrumb down to the missing Atlantis > State.
    assert tagging.tag_status_tree(paths) == [
        {
            "name": "Camera",
            "exists": False,
            "children": [
                {"name": "NikonZ5", "exists": False, "children": []}
            ],
        },
        {
            "name": "Place",
            "exists": True,
            "children": [
                {
                    "name": "USA",
                    "exists": True,
                    "children": [
                        {
                            "name": "Atlantis",
                            "exists": False,
                            "children": [
                                {
                                    "name": "State",
                                    "exists": False,
                                    "children": [],
                                }
                            ],
                        }
                    ],
                }
            ],
        },
    ]


def test_tag_status_tree_empty_when_all_registered(tmp_path, monkeypatch):
    _tag_tree(tmp_path, monkeypatch, {"Place": {"USA": {"California": {}}}})

    assert tagging.tag_status_tree([["Place", "USA", "California"]]) == []


def test_film_camera_keyword_overrides_scanner_exif(tmp_path, monkeypatch):
    # A film scan: no useful EXIF, camera named by keyword instead.
    tree = {
        "Camera": {
            "PentaxK1000": {
                "general": ["#pentax"],
                "priority": ["#analogsunrise"],
                "bluesky": ["#pentaxK1000"],
            }
        }
    }
    tags_path = tmp_path / "tags.json"
    tags_path.write_text(json.dumps(tree))
    monkeypatch.setattr(tagging, "TAGS_PATH", tags_path)

    photo = tmp_path / "scan.jpg"
    _write_photo(photo, ["cameracoffeewander|Camera|PentaxK1000"], with_exif=False)

    captions = tagging.extract_captions(str(photo))
    # Film posts use the analog caption convention, not the gear/setup lines.
    assert "📷 Pentax K1000" in captions["instagram"]
    assert "The Gear" not in captions["instagram"]
    # Priority tags come before general ones.
    tag_line = captions["instagram"].splitlines()[-1]
    assert tag_line == "#analogsunrise #pentax"
    assert captions["bluesky"].splitlines()[-1] == "#pentaxK1000"


def test_film_stock_keyword_renders_analog_caption_line(tmp_path, monkeypatch):
    tree = {
        "Camera": {
            "PentaxK1000": {
                "general": ["#pentax"],
                "priority": [],
                "bluesky": ["#pentaxK1000"],
            }
        },
        "FilmType": {
            "Gold200": {
                "general": ["#kodakgold"],
                "priority": [],
                "bluesky": ["#film"],
            }
        },
    }
    tags_path = tmp_path / "tags.json"
    tags_path.write_text(json.dumps(tree))
    monkeypatch.setattr(tagging, "TAGS_PATH", tags_path)

    photo = tmp_path / "scan.jpg"
    _write_photo(
        photo,
        ["cameracoffeewander|Camera|PentaxK1000",
         "cameracoffeewander|FilmType|Gold200"],
        with_exif=False,
    )

    captions = tagging.extract_captions(str(photo))
    for platform in ("instagram", "bluesky"):
        assert "📷 Pentax K1000 / 🎞️ Kodak Gold 200" in captions[platform]
        assert "The Gear" not in captions[platform]
        assert "The Setup" not in captions[platform]


def test_every_film_type_has_a_display_name():
    """Each FilmType entry in the real tag tree renders a 🎞️ name."""
    tree = json.loads(tagging.TAGS_PATH.read_text())
    named = {tag.rsplit("|", 1)[1] for tag in tagging._FILM_STOCK_NAMES}
    assert set(tree["FilmType"].keys()) <= named


def test_parent_bucket_tags_inherited_by_children(tmp_path, monkeypatch):
    # A bucket on Place > USA applies to every state beneath it, so shared
    # hubs are written once at the parent. Leaf tags come first (they're more
    # specific, and Bluesky trims from the end).
    tree = {
        "Place": {
            "USA": {
                "general": [],
                "priority": ["@onlyinyourstate"],
                "bluesky": [],
                "Utah": {
                    "State": {
                        "general": ["#utah"],
                        "priority": ["#VisitUtah"],
                        "bluesky": ["#utah"],
                    }
                },
            }
        }
    }
    tags_path = tmp_path / "tags.json"
    tags_path.write_text(json.dumps(tree))
    monkeypatch.setattr(tagging, "TAGS_PATH", tags_path)

    photo = tmp_path / "photo.jpg"
    _write_photo(photo, ["cameracoffeewander|Place|USA|Utah|State"])

    tag_line = tagging.extract_captions(str(photo))["instagram"].splitlines()[-1]
    assert tag_line.split(" ") == ["#VisitUtah", "@onlyinyourstate", "#utah"]


def test_instagram_hashtags_capped_at_5_priority_first(tmp_path, monkeypatch):
    tree = {
        "Special": {
            "Many": {
                "general": [f"#tag{i}" for i in range(40)],
                "priority": ["#first"],
                "bluesky": [],
            }
        }
    }
    tags_path = tmp_path / "tags.json"
    tags_path.write_text(json.dumps(tree))
    monkeypatch.setattr(tagging, "TAGS_PATH", tags_path)

    photo = tmp_path / "photo.jpg"
    _write_photo(photo, ["cameracoffeewander|Special|Many"])

    tag_line = tagging.extract_captions(str(photo))["instagram"].splitlines()[-1]
    tags = tag_line.split(" ")
    assert len(tags) == tagging.INSTAGRAM_HASHTAG_LIMIT
    assert tags[0] == "#first"
    assert all(t.startswith("#tag") for t in tags[1:])


def test_instagram_general_tags_are_shuffled(tmp_path, monkeypatch):
    tree = {
        "Special": {
            "Many": {
                "general": [f"#tag{i}" for i in range(40)],
                "priority": [],
                "bluesky": [],
            }
        }
    }
    tags_path = tmp_path / "tags.json"
    tags_path.write_text(json.dumps(tree))
    monkeypatch.setattr(tagging, "TAGS_PATH", tags_path)

    photo = tmp_path / "photo.jpg"
    _write_photo(photo, ["cameracoffeewander|Special|Many"])

    draws = {
        tagging.extract_captions(str(photo))["instagram"].splitlines()[-1]
        for _ in range(10)
    }
    assert len(draws) > 1  # 10 draws of 5-from-40 all identical ≈ impossible


def test_instagram_hashtags_hard_capped_priority_first_mentions_uncounted(
        tmp_path, monkeypatch):
    # 6 priority hashtags exceed the 5 budget: only the first 5 survive, no
    # general hashtags added. Mentions (priority and general) ride along
    # without consuming the budget.
    tree = {
        "Special": {
            "Hubs": {
                "general": ["#extra1", "#extra2", "@generalmention"],
                "priority": [f"#hub{i}" for i in range(6)] + ["@bighub"],
                "bluesky": [],
            }
        }
    }
    tags_path = tmp_path / "tags.json"
    tags_path.write_text(json.dumps(tree))
    monkeypatch.setattr(tagging, "TAGS_PATH", tags_path)

    photo = tmp_path / "photo.jpg"
    _write_photo(photo, ["cameracoffeewander|Special|Hubs"])

    tag_line = tagging.extract_captions(str(photo))["instagram"].splitlines()[-1]
    tags = tag_line.split(" ")
    hashtags = [t for t in tags if t.startswith("#")]
    # Hard-capped at 5, priority order preserved; #hub5 and both #extra dropped.
    assert hashtags == [f"#hub{i}" for i in range(5)]
    assert "@bighub" in tags  # priority mention kept (under the 3-mention cap)


def test_instagram_mentions_capped_priority_first(tmp_path, monkeypatch):
    # 5 priority @mentions exceed the 3-mention cap: only the first 3 survive.
    tree = {
        "Special": {
            "Mentions": {
                "general": ["@genA", "@genB"],
                "priority": [f"@hub{i}" for i in range(5)],
                "bluesky": [],
            }
        }
    }
    tags_path = tmp_path / "tags.json"
    tags_path.write_text(json.dumps(tree))
    monkeypatch.setattr(tagging, "TAGS_PATH", tags_path)

    photo = tmp_path / "photo.jpg"
    _write_photo(photo, ["cameracoffeewander|Special|Mentions"])

    tag_line = tagging.extract_captions(str(photo))["instagram"].splitlines()[-1]
    mentions = [t for t in tag_line.split(" ") if t.startswith("@")]
    assert mentions == [f"@hub{i}" for i in range(3)]  # first 3, general dropped


def test_extract_tag_pools_structure_and_star_flags(tmp_path, monkeypatch):
    tree = {
        "Special": {
            "Hubs": {
                "general": ["#g1", "#g2", "@genmention"],
                "priority": ["#MadeWithKodak", "@kodakprofessional"],
                "bluesky": ["#kodak", "#filmphotography"],
            }
        }
    }
    tags_path = tmp_path / "tags.json"
    tags_path.write_text(json.dumps(tree))
    monkeypatch.setattr(tagging, "TAGS_PATH", tags_path)

    photo = tmp_path / "photo.jpg"
    _write_photo(photo, ["cameracoffeewander|Special|Hubs"], with_exif=False)

    pools = tagging.extract_tag_pools(str(photo))

    # Prefix is the caption minus the tag line (no hashtags in it).
    assert "#" not in pools["instagram"]["prefix"]
    assert "@" not in pools["instagram"]["prefix"]

    ig = pools["instagram"]["tags"]
    priority = [t for t in ig if t["priority"]]
    general = [t for t in ig if not t["priority"]]
    # Priority hubs come first and are starred; general follows.
    assert ig[: len(priority)] == priority
    assert {t["text"] for t in priority} == {"#MadeWithKodak", "@kodakprofessional"}
    assert {t["text"] for t in general} == {"#g1", "#g2", "@genmention"}
    # Mention flag is set for @-tags regardless of tier.
    assert next(t for t in ig if t["text"] == "@kodakprofessional")["mention"]
    assert next(t for t in ig if t["text"] == "@genmention")["mention"]
    assert not next(t for t in ig if t["text"] == "#g1")["mention"]

    # Bluesky pool is the single list, order preserved, no priority split.
    assert [t["text"] for t in pools["bluesky"]["tags"]] == [
        "#kodak",
        "#filmphotography",
    ]
    assert all(not t["priority"] for t in pools["bluesky"]["tags"])


def test_extract_tag_pools_selects_default_posting_set(tmp_path, monkeypatch):
    # 7 hashtags + 4 mentions: default selection caps at 5 hashtags + 3 mentions.
    tree = {
        "Special": {
            "Big": {
                "general": [f"#g{i}" for i in range(4)] + ["@gm0"],
                "priority": [f"#p{i}" for i in range(3)] + ["@pm0", "@pm1", "@pm2"],
                "bluesky": [],
            }
        }
    }
    tags_path = tmp_path / "tags.json"
    tags_path.write_text(json.dumps(tree))
    monkeypatch.setattr(tagging, "TAGS_PATH", tags_path)

    photo = tmp_path / "photo.jpg"
    _write_photo(photo, ["cameracoffeewander|Special|Big"], with_exif=False)

    ig = tagging.extract_tag_pools(str(photo))["instagram"]["tags"]
    selected = [t["text"] for t in ig if t["selected"]]
    assert sum(t.startswith("#") for t in selected) == 5  # first 5 hashtags
    assert sum(t.startswith("@") for t in selected) == 3  # first 3 mentions
    # Priority hubs are selected first (they lead the pool).
    assert "#p0" in selected and "@pm0" in selected


def test_bluesky_caption_fits_300_chars(tmp_path, monkeypatch):
    tree = {
        "Special": {
            "Wordy": {
                "general": ["#a"],
                "priority": [],
                "bluesky": ["#keepme"] + [f"#verylongblueskytag{i}" for i in range(20)],
            }
        }
    }
    tags_path = tmp_path / "tags.json"
    tags_path.write_text(json.dumps(tree))
    monkeypatch.setattr(tagging, "TAGS_PATH", tags_path)

    photo = tmp_path / "photo.jpg"
    _write_photo(photo, ["cameracoffeewander|Special|Wordy"],
                 description="An evening on the water. " * 6)

    caption = tagging.extract_captions(str(photo))["bluesky"]
    assert len(caption) <= tagging.BLUESKY_CHAR_LIMIT
    # Trimmed from the end: the first (most important) tag survives.
    assert "#keepme" in caption


def test_real_tags_json_is_valid():
    """The shipped tag tree parses and every bucket has the expected lists.

    A node may be a bucket AND have children (e.g. Place > USA carries hubs
    inherited by every state), so validation recurses past buckets too.
    """

    def walk(node):
        if "general" in node:
            assert isinstance(node["general"], list)
            assert isinstance(node["priority"], list)
            assert isinstance(node["bluesky"], list)
        for key, child in node.items():
            if key not in ("general", "priority", "bluesky"):
                assert isinstance(child, dict)
                walk(child)

    tree = json.loads(tagging.TAGS_PATH.read_text())
    assert set(tree.keys()) >= {"Camera", "Place", "PhotoType"}
    walk(tree)
