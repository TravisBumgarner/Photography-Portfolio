#!/bin/bash

# Define variables
LOCAL_DIR="build/"
REMOTE_HOST="nfs_photo20"  # Replace [site] with your actual site name
REMOTE_DIR="/home/public"  # Replace with the actual path on the server

# Use rsync to upload files
rsync -avz --delete "$LOCAL_DIR" "$REMOTE_HOST:$REMOTE_DIR"

echo "Files uploaded successfully to $REMOTE_HOST:$REMOTE_DIR"

# Expand the home directory in paths
LARGE_PHOTO_DIR="${HOME}/Desktop/large"
THUMBNAIL_DIR="${HOME}/Desktop/thumbnail"

# Check if photo directories exist and upload them
if [ -d "$LARGE_PHOTO_DIR" ]; then
    echo "Uploading large photos..."
    rsync -avz --delete "$LARGE_PHOTO_DIR/" "$REMOTE_HOST:$REMOTE_DIR/large/"
fi

if [ -d "$THUMBNAIL_DIR" ]; then
    echo "Uploading thumbnails..."
    rsync -avz --delete "$THUMBNAIL_DIR/" "$REMOTE_HOST:$REMOTE_DIR/thumbnail/"
fi

