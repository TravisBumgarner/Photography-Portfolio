#!/bin/bash
set -e

APP_NAME="sam-photo-survey2"
SUBDIR="photography-store/survey-site-post-gcp"

# Go to repo root
cd "$(git rev-parse --show-toplevel)"

echo ">>> Checking if Heroku app '$APP_NAME' exists..."
if heroku apps:info --app "$APP_NAME" > /dev/null 2>&1; then
  echo ">>> App already exists."
else
  echo ">>> Creating app '$APP_NAME'..."
  heroku create "$APP_NAME" --stack heroku-22
  heroku buildpacks:set heroku/nodejs --app "$APP_NAME"
  heroku buildpacks:add heroku-community/static --app "$APP_NAME"
fi

echo ">>> Setting heroku remote to $APP_NAME..."
git remote remove heroku 2>/dev/null || true
heroku git:remote -a "$APP_NAME"

echo ">>> Deploying subdir '$SUBDIR' to Heroku..."
git push heroku "$(git subtree split --prefix=$SUBDIR HEAD)":refs/heads/main --force

echo ">>> Opening app..."
heroku open --app "$APP_NAME"
