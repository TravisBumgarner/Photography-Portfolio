# Portfolio Preparation

Generates `ui/src/content/output.json` — the galleries + photo metadata the portfolio UI renders — from Lightroom-exported `.avif` photos.

Split out of `lightroom-photo-tagging`, keeping only what the UI still consumes per photo (`id`, `src`, `galleryIds`, `dateTaken`, `blurHash`, `width`, `height`). Camera/lens/EXIF display fields were dropped along the way.

## Setup

```sh
yarn install
cp .env.sample .env  # then edit paths
```

`PORTFOLIO_INGEST_PATH` points at the Lightroom "For Portfolio - Large" export dir. A sibling dir with `large` swapped for `thumbnail` must also exist — blurhashes are computed from the thumbnails for speed.

## Usage

1. In Lightroom, tag photos with `PhotographyPortfolioV3|<Gallery Name>` (see `src/galleries.ts` for the tag → gallery mapping) and export large + thumbnail sizes with XMP sidecar metadata.
2. Run:

```sh
yarn start
```

Photos missing tags or matching no gallery are reported per file and skipped. The result is written to `ui/src/content/output.json`.

## Adding a gallery

Add the slug, tag mapping, and gallery entry (title + preview photo filename) in `src/galleries.ts`.
