#!/usr/bin/env python3
"""Analyze AI-generated tags in photo-gallery's ingest.sqlite.

Reads the ``photos.tags`` column (comma-separated free text, ~20 tags/photo),
then:

1. Ranks tags by photo count (a tag counts once per photo).
2. Builds a tag co-occurrence graph over the top ``--top`` tags, weighted by
   normalized PMI, and clusters it with weighted label propagation.
3. Writes ``tag_analysis.json`` (frequencies, clusters, graph edges) next to
   this script, for the HTML visualization.

Pure stdlib + numpy — no extra deps needed in the repo venv.

Usage:
    python analyze_gallery_tags.py [--db PATH] [--top 250] [--print 60]
"""
from __future__ import annotations

import argparse
import json
import math
import sqlite3
from collections import Counter, defaultdict
from pathlib import Path

import numpy as np

DEFAULT_DB = Path.home() / "Programming/photo-gallery/data/ingest.sqlite"
OUT_PATH = Path(__file__).parent / "tag_analysis.json"

# Generic photography-process terms that describe every photo rather than a
# subject — noise for "what photo types do I shoot" purposes.
STOPTAGS = {
    "photography", "photo", "photograph", "image", "picture", "camera",
    "natural light", "daylight", "sunlight", "bright", "light", "lighting",
    "outdoor", "outdoors", "indoor", "indoors", "day", "daytime", "no people",
    "color", "colorful", "colourful", "vibrant", "vivid", "aesthetic",
    "beautiful", "scenic", "view", "background", "closeup", "close-up",
    "detail", "details", "texture", "textured", "pattern", "abstract",
    "composition", "perspective", "angle", "wide angle", "overhead",
    "overhead view", "high angle", "low angle", "studio shot", "shot",
    "modern", "vintage", "rustic", "old", "new", "large", "small", "big",
}


def load_photo_tags(db: Path) -> list[list[str]]:
    """Return one normalized, deduped tag list per photo."""
    conn = sqlite3.connect(db)
    rows = conn.execute(
        "SELECT tags FROM photos WHERE tags IS NOT NULL AND tags != ''"
    ).fetchall()
    conn.close()
    photos = []
    for (raw,) in rows:
        tags = {t.strip().lower() for t in raw.split(",")}
        tags = {t for t in tags if t and len(t) > 1}
        if tags:
            photos.append(sorted(tags))
    return photos


def cluster_label_propagation(
    names: list[str], weights: np.ndarray, seed: int = 42, iters: int = 60
) -> list[int]:
    """Weighted label propagation on a dense adjacency matrix."""
    n = len(names)
    rng = np.random.default_rng(seed)
    labels = np.arange(n)
    for _ in range(iters):
        changed = False
        for i in rng.permutation(n):
            nbrs = np.nonzero(weights[i])[0]
            if nbrs.size == 0:
                continue
            score: dict[int, float] = defaultdict(float)
            for j in nbrs:
                score[labels[j]] += weights[i, j]
            best = max(score.items(), key=lambda kv: kv[1])[0]
            if best != labels[i]:
                labels[i] = best
                changed = True
        if not changed:
            break
    # Renumber clusters by descending size.
    order = [lab for lab, _ in Counter(labels.tolist()).most_common()]
    remap = {lab: k for k, lab in enumerate(order)}
    return [remap[lab] for lab in labels.tolist()]


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--db", type=Path, default=DEFAULT_DB)
    ap.add_argument("--top", type=int, default=250,
                    help="how many top tags to cluster")
    ap.add_argument("--print", dest="n_print", type=int, default=60,
                    help="how many top tags to print")
    ap.add_argument("--min-co", type=int, default=15,
                    help="min photos a pair must share to keep the edge")
    ap.add_argument("--min-npmi", type=float, default=0.33,
                    help="min normalized PMI to keep the edge")
    args = ap.parse_args()

    photos = load_photo_tags(args.db)
    n_photos = len(photos)
    freq = Counter(t for tags in photos for t in tags)
    print(f"{n_photos} photos, {len(freq)} distinct tags, "
          f"{sum(freq.values())} tag assignments\n")

    subject_freq = Counter({t: c for t, c in freq.items() if t not in STOPTAGS})

    if args.n_print > 0:
        print(f"Top {args.n_print} subject tags (process/style noise removed):")
        width = max(len(t) for t, _ in subject_freq.most_common(args.n_print))
        for tag, count in subject_freq.most_common(args.n_print):
            pct = 100 * count / n_photos
            bar = "#" * round(pct / 2)
            print(f"  {tag:<{width}}  {count:>6}  {pct:5.1f}%  {bar}")

    # --- Co-occurrence over top-K subject tags -----------------------------
    top = [t for t, _ in subject_freq.most_common(args.top)]
    idx = {t: i for i, t in enumerate(top)}
    k = len(top)
    co = np.zeros((k, k))
    for tags in photos:
        present = [idx[t] for t in tags if t in idx]
        for a_pos, a in enumerate(present):
            for b in present[a_pos + 1:]:
                co[a, b] += 1
                co[b, a] += 1

    # Normalized PMI edge weights; drop weak/rare edges so clusters are clean.
    counts = np.array([freq[t] for t in top], dtype=float)
    p_tag = counts / n_photos
    p_joint = co / n_photos
    with np.errstate(divide="ignore", invalid="ignore"):
        pmi = np.log(p_joint / np.outer(p_tag, p_tag))
        npmi = np.where(p_joint > 0, pmi / -np.log(p_joint), 0.0)
    npmi[co < args.min_co] = 0.0        # need enough photos to trust the edge
    npmi[npmi < args.min_npmi] = 0.0    # keep clearly-associated pairs only
    np.fill_diagonal(npmi, 0.0)

    clusters = cluster_label_propagation(top, npmi)

    by_cluster: dict[int, list[str]] = defaultdict(list)
    for tag, c in zip(top, clusters):
        by_cluster[c].append(tag)

    print("\nClusters (by total photo coverage of member tags):")
    cluster_rows = []
    for c, members in sorted(
        by_cluster.items(),
        key=lambda kv: -sum(subject_freq[t] for t in kv[1]),
    ):
        members = sorted(members, key=lambda t: -subject_freq[t])
        coverage = len({
            i for i, tags in enumerate(photos)
            if any(t in members[:8] for t in tags)
        })
        cluster_rows.append({
            "id": c,
            "tags": members,
            "coverage_photos": coverage,
            "coverage_pct": round(100 * coverage / n_photos, 1),
        })
        head = ", ".join(members[:10])
        more = f" (+{len(members) - 10} more)" if len(members) > 10 else ""
        print(f"  [{coverage:>5} photos {100*coverage/n_photos:5.1f}%] "
              f"{head}{more}")

    # --- Dump JSON for the visualization -----------------------------------
    edges = [
        {"a": top[i], "b": top[j], "w": round(float(npmi[i, j]), 3)}
        for i in range(k) for j in range(i + 1, k) if npmi[i, j] > 0
    ]
    OUT_PATH.write_text(json.dumps({
        "n_photos": n_photos,
        "n_distinct_tags": len(freq),
        "top_tags": [
            {"tag": t, "count": subject_freq[t],
             "pct": round(100 * subject_freq[t] / n_photos, 2),
             "cluster": clusters[idx[t]]}
            for t in top
        ],
        "clusters": cluster_rows,
        "edges": edges,
    }, indent=1))
    print(f"\nWrote {OUT_PATH} ({len(edges)} graph edges)")

    # Re-render the interactive visualization if the template is present.
    tpl_path = OUT_PATH.parent / "tag_clusters_template.html"
    if tpl_path.exists():
        html = tpl_path.read_text().replace(
            "/*__DATA__*/", OUT_PATH.read_text(), 1)
        viz_path = OUT_PATH.parent / "tag_clusters.html"
        viz_path.write_text(html)
        print(f"Wrote {viz_path}")


if __name__ == "__main__":
    main()
