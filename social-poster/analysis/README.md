# Gallery tag analysis

What subjects do I actually shoot? Analysis of the AI-generated tags in
photo-gallery's `ingest.sqlite` (27,231 photos, 31,538 distinct tags), used to
find gaps in social-poster's `PhotoType` taxonomy.

## Files

- `analyze_gallery_tags.py` — the whole pipeline (pure stdlib + numpy):
  1. Reads `photos.tags` (comma-separated free text, ~20 tags/photo).
  2. Ranks subject tags, filtering generic process tags ("photography",
     "natural light", …).
  3. Builds a co-occurrence graph over the top 250 tags (normalized PMI ≥ 0.33,
     ≥ 15 shared photos) and clusters it with weighted label propagation.
  4. Writes `tag_analysis.json` and re-renders `tag_clusters.html` from the
     template.
- `tag_clusters_template.html` — visualization template (`/*__DATA__*/` is
  replaced with the JSON).
- `tag_clusters.html` — the rendered interactive page: force-directed cluster
  map with hover details, top-40 subject bars, and the PhotoType gap table.
- `tag_analysis.json` — frequencies, clusters, and graph edges.

Regenerate everything:

```sh
../.venv/bin/python analyze_gallery_tags.py            # defaults
../.venv/bin/python analyze_gallery_tags.py --min-npmi 0.4   # tighter clusters
```

## Key findings (July 2026)

Top themes by library share vs. PhotoType coverage at the time of analysis:

| Theme | Share | Was covered? |
|---|---|---|
| Mountains & wilderness | ~37% | only generic `Landscape` |
| Forest & woodland | ~22% | no |
| Water, lakes & reflections | ~20% | only `Beach` |
| Festivals & parades | ~19% | via SocialEvent entries |
| People & candid | ~18% | `Portrait` (mostly personal snapshots anyway) |
| Fog, mist & overcast | ~16% | no |
| Winter & snow | ~12% | no |
| Dogs & pets | ~12% | only generic `Animals` |
| Night & low light | ~11% | only astro (`Stars`) |
| Hiking & adventure | ~9% | no |
| Street art & graffiti | ~8% | partially via `Street` |
| Desert, Food, Road trips | ~7% each | no |

Recommended tags + feature hubs for each candidate PhotoType:
[`../config/tag-research-themes-2026-07.md`](../config/tag-research-themes-2026-07.md).
