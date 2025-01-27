#!/bin/bash

DEPLOY_SERVER_USER="tbumgarner_photo20"
DEPLOY_SERVER_HOST="nfs_photo20"
BUILD_DIR="build/"
REMOTE_DIR="/home/public"


ssh $DEPLOY_SERVER_USER@$DEPLOY_SERVER_HOST "
    echo "Cleaning up JS, CSS, and other files..."
    rm -rf *.js *.css *.html fonts/ *.txt *.map *.png
"
echo "syncing build directory"
rsync -avz "$BUILD_DIR" "$DEPLOY_SERVER_HOST:$REMOTE_DIR"
echo "Files uploaded successfully to $DEPLOY_SERVER_HOST:$REMOTE_DIR"

LARGE_PHOTO_DIR="~/Desktop/large"
THUMBNAIL_DIR="~/Desktop/thumbnail"

if [ -d "$LARGE_PHOTO_DIR" ]; then
    echo "Uploading large photos..."
    rsync -avz --delete "$LARGE_PHOTO_DIR/" "$DEPLOY_SERVER_HOST:$REMOTE_DIR/large/"
fi

if [ -d "$THUMBNAIL_DIR" ]; then
    echo "Uploading thumbnails..."
    rsync -avz --delete "$THUMBNAIL_DIR/" "$DEPLOY_SERVER_HOST:$REMOTE_DIR/thumbnail/"
fi

ssh $DEPLOY_SERVER_USER@$DEPLOY_SERVER_HOST "
    echo "removing maps"
    rm -rf *map
"
