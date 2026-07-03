# UI

The public photography portfolio web app.

# Setup

1. `yarn` to install dependencies
1. `yarn dev` to run locally (Vite, on `localhost:3000`)

The app is built with **Vite**. Photos live outside the repo (see below), so the
dev server has two modes for resolving `/large/*` and `/thumbnail/*`:

- `yarn dev` — serves photos straight from `~/Desktop/large` and `~/Desktop/thumbnail`.
- `yarn dev:prod-photos` — proxies photo requests to the live site, so you can run
  the dev server without a local export.

# The Big Picture

**Lightroom is the source of truth for all photos.** Nothing image-related — not the
photos, not the generated `output.json` manifest — comes from anywhere else. A deploy is
three artifacts, all derived from Lightroom:

| Artifact | What it is | Where it comes from | Where it goes |
| --- | --- | --- | --- |
| `~/Desktop/large/` | Full-res `.avif`s | Lightroom export preset `For Portfolio - Large` | server `…/large/` |
| `~/Desktop/thumbnail/` | Thumbnail `.avif`s | Lightroom export preset `For Portfolio - Thumbnail` | server `…/thumbnail/` |
| `ui/src/content/output.json` | Gallery + photo metadata (titles, EXIF, blurhashes, gallery mapping) | the `lightroom-photo-tagging` project | bundled into `build/` |

The app maps each photo `src` in `output.json` to `/large/<src>` and `/thumbnail/<src>` at
runtime (see `getPhotoUrl` in `src/utils.ts`), so the filenames in `output.json` must match
the files exported to `~/Desktop/large` and `~/Desktop/thumbnail`.

# Generating Everything for a Deploy

### 1. Prep photos in Lightroom

- Tag each photo into a gallery using the `PhotographyPortfolioV3 | <Gallery>` hierarchy.
  - New gallery? Edit `lightroom-photo-tagging/src/galleries.ts`: add a `ValidSlugs` entry,
    a `TAG_TO_GALLERY_LOOKUP` mapping (`'PhotographyPortfolioV3|<Gallery>': ValidSlugs.X`),
    and an entry in `PUBLIC_GALLERIES_BY_TAG_WITHOUT_PREVIEW_ID` — see the cover photo below.
- Give each photo a title (descriptions optional).

### Set each gallery's cover photo

The gallery preview/cover shown on the home page is **not** driven by a Lightroom tag — it's a
hardcoded filename in `lightroom-photo-tagging/src/galleries.ts`. Each gallery's entry has a
`previewSrc: '<filename>.avif'` (the exported filename, matching a photo in that gallery); the
`previewId` is derived from it automatically. To change a cover, set `previewSrc` to the desired
photo's exported filename and re-run the metadata step below.

### 2. Export the images from Lightroom

Run both export presets (in `../lightroom_presets/`) to your Desktop:

- `For Portfolio - Large`  → `~/Desktop/large/`
- `For Portfolio - Thumbnail` → `~/Desktop/thumbnail/`

### 3. Generate the metadata manifest

The manifest is built by the sibling `lightroom-photo-tagging` project, which reads the
exported `.avif`s and writes straight into `ui/src/content/output.json`.

```sh
cd ../lightroom-photo-tagging
yarn                       # first time only; needs canvas native deps — see that project's readme
# .env must set PORTFOLIO_INGEST_PATH=/Users/<you>/Desktop/large  (same dir as the Large export)
yarn start-portfolio-metadata
```

This reads every `.avif` in `PORTFOLIO_INGEST_PATH`, pulls EXIF + Lightroom tags, computes
blurhashes, and overwrites `ui/src/content/output.json`.

> `output.json` is a **generated-but-committed** artifact (like a lockfile). It's `import`ed
> at build time, and it can only be regenerated on the machine that has the Lightroom exports,
> so it lives in git rather than being built in CI.

### 4. Build and deploy the UI

```sh
yarn run deploy:nfs        # from ui/  — runs `yarn bundle` then `deploy.sh`
```

`deploy.sh` (see [Deployment](#deployment) for the guarantees):
- syncs `build/` to the server (code only), and
- syncs `~/Desktop/large` and `~/Desktop/thumbnail` to the server's photo dirs, if present.

# Deployment

`yarn run deploy:nfs` bundles the app and runs `deploy.sh`, which rsyncs to the NFS host:

- **Code** — `build/` is synced with `--delete`, so the server's code **exactly matches**
  `build/`. The `large/` and `thumbnail/` dirs on the server are **excluded**, so a code-only
  deploy never wipes the photos already on the server.
- **Photos** — if `~/Desktop/large` and/or `~/Desktop/thumbnail` exist, each is synced with
  `--delete` so the server dir **exactly matches** your Desktop dir. If a Desktop dir is
  missing, that sync is skipped and the server's existing photos are left untouched.

So: re-deploying code alone is always safe, and re-exporting from Lightroom + deploying
updates the photos to match.
