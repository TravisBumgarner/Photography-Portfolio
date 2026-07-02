# Setup

1. `yarn` to install dependencies
1. `yarn dev` to run locally

# Deployment

Lightroom is the source of truth for all photos — nothing image-related is committed to this repo. Deploying is code + (optionally) photos:

1. (Optional) Export `large/` and `thumbnail/` photos from Lightroom to `~/Desktop/large` and `~/Desktop/thumbnail`.
1. Run `yarn run deploy:nfs`.
    - The `build/` output is synced to the server with `--delete`, so the server's code **exactly matches** `build/`. The `large/` and `thumbnail/` dirs on the server are preserved (never wiped by a code-only deploy).
    - If `~/Desktop/large` and/or `~/Desktop/thumbnail` exist, each is synced with `--delete` so the server dir **exactly matches** your Desktop dir. If they don't exist, the photo sync is skipped and the existing server photos are left untouched.
