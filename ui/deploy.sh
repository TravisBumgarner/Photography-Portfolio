#!/bin/bash
#
# Deploys the built UI to the NearlyFreeSpeech (NFS) host.
#
# What gets synced:
#   - build/            -> $REMOTE_DIR   (code: JS/CSS/HTML/fonts/favicon/.htaccess)
#   - ~/Desktop/large/  -> $REMOTE_DIR/large/       (optional, full-res photos)
#   - ~/Desktop/thumbnail/ -> $REMOTE_DIR/thumbnail/ (optional, gallery thumbnails)
#
# The code sync uses --delete so the server exactly matches build/, but it
# EXCLUDES large/ and thumbnail/ so a code-only deploy never wipes the photos
# that live on the server. Photos are only touched when you provide the
# corresponding ~/Desktop dir, and each of those syncs is --delete too, so the
# server dir exactly matches your Desktop dir.

set -euo pipefail

DEPLOY_SERVER_USER="tbumgarner_photo20"
DEPLOY_SERVER_HOST="nfs_photo20"           # ssh config alias (see ~/.ssh/config)
DEPLOY_TARGET="$DEPLOY_SERVER_USER@$DEPLOY_SERVER_HOST"
BUILD_DIR="build/"
REMOTE_DIR="/home/public"

# ~ must be unquoted to expand; use $HOME so the paths work inside [ -d ... ].
LARGE_PHOTO_DIR="$HOME/Desktop/large"
THUMBNAIL_DIR="$HOME/Desktop/thumbnail"

echo ">>> Syncing build/ -> $REMOTE_DIR (preserving large/ and thumbnail/)"
rsync -avz --delete \
    --exclude='large/' \
    --exclude='thumbnail/' \
    --exclude='*.map' \
    "$BUILD_DIR" "$DEPLOY_TARGET:$REMOTE_DIR/"

if [ -d "$LARGE_PHOTO_DIR" ]; then
    echo ">>> Uploading large photos from $LARGE_PHOTO_DIR"
    rsync -avz --delete "$LARGE_PHOTO_DIR/" "$DEPLOY_TARGET:$REMOTE_DIR/large/"
else
    echo ">>> Skipping large photos ($LARGE_PHOTO_DIR not found)"
fi

if [ -d "$THUMBNAIL_DIR" ]; then
    echo ">>> Uploading thumbnails from $THUMBNAIL_DIR"
    rsync -avz --delete "$THUMBNAIL_DIR/" "$DEPLOY_TARGET:$REMOTE_DIR/thumbnail/"
else
    echo ">>> Skipping thumbnails ($THUMBNAIL_DIR not found)"
fi

echo ">>> Deploy complete: $DEPLOY_TARGET:$REMOTE_DIR"
