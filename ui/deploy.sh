#!/bin/bash

LOCAL_DIR="build/"
REMOTE_HOST="nfs_photo20" # This value comes from ~/.ssh/config
REMOTE_DIR="/home/public"

rsync -avz --delete "$LOCAL_DIR" "$REMOTE_HOST:$REMOTE_DIR"
echo "Files uploaded successfully to $REMOTE_HOST:$REMOTE_DIR"

LARGE_PHOTO_DIR="${HOME}/Desktop/large"
THUMBNAIL_DIR="${HOME}/Desktop/thumbnail"

if [ -d "$LARGE_PHOTO_DIR" ]; then
    echo "Uploading large photos..."
    rsync -avz --delete "$LARGE_PHOTO_DIR/" "$REMOTE_HOST:$REMOTE_DIR/large/"
fi

if [ -d "$THUMBNAIL_DIR" ]; then
    echo "Uploading thumbnails..."
    rsync -avz --delete "$THUMBNAIL_DIR/" "$REMOTE_HOST:$REMOTE_DIR/thumbnail/"
fi