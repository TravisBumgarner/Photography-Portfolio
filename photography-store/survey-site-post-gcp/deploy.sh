#!/bin/bash
set -e

APP_NAME="sam-photo-survey"
BUILDPACK="https://github.com/mars/create-react-app-buildpack.git"
STACK="heroku-24"

echo ">>> Checking if Heroku app '$APP_NAME' exists..."
if heroku apps:info --app "$APP_NAME" > /dev/null 2>&1; then
  echo ">>> App already exists."
else
  echo ">>> Creating app '$APP_NAME'..."
  heroku create "$APP_NAME" --buildpack "$BUILDPACK" --stack "$STACK"
fi

echo ">>> Ensuring git remote 'heroku' points to $APP_NAME..."
heroku git:remote -a "$APP_NAME"

BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo ">>> Pushing branch '$BRANCH' to Heroku..."
git push heroku "$BRANCH:main"

echo ">>> Opening app..."
heroku open --app "$APP_NAME"
