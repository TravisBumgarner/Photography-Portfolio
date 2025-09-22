#!/bin/bash
set -e

LOCAL_DIR="dist/"
SERVER_USER="tbumgarner_sam-photo-survey"
SERVER_HOST="nfs_sam_survey"
REMOTE_DIR="/home/public"

echo ">>> Creating remote directory $REMOTE_DIR if it doesn't exist"
ssh $SERVER_USER@$SERVER_HOST "mkdir -p $REMOTE_DIR"

echo ">>> Cleaning up remote directory $REMOTE_DIR"
ssh $SERVER_USER@$SERVER_HOST "rm -rf $REMOTE_DIR/*"

echo ">>> Uploading files to $SERVER_HOST:$REMOTE_DIR"
rsync -avz --delete "$LOCAL_DIR" "$SERVER_USER@$SERVER_HOST:$REMOTE_DIR/"

echo ">>> Deployment completed successfully"
