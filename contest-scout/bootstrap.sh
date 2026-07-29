#!/usr/bin/env bash
#
# DEV setup for contest-scout. Run once after cloning, on your dev machine.
#
# Local development only. Production is a container: the image is built and
# published by .github/workflows/contest-scout-image.yml and pulled by the Pi's
# compose stack — NOT this script. The dev/prod differences:
#
#   dev (this script)              prod (container)
#   -----------------              ----------------
#   claude:  your logged-in CLI    claude:  pinned in the image, credential
#                                           from the stack's env file
#   data:    contest-scout/data/   data:    a volume mounted at /data (DATA_DIR)
#   skill:   read from this        skill:   the same file, baked into the image
#            checkout live                  at build time
#
# Usage: ./contest-scout/bootstrap.sh   (or from this dir: ./bootstrap.sh)

set -euo pipefail
cd "$(dirname "$0")"          # contest-scout/

echo "==> Python venv + deps"
if [ ! -d .venv ]; then
  python3 -m venv .venv
fi
.venv/bin/pip install --upgrade pip
.venv/bin/pip install -r requirements-dev.txt

echo
echo "Done. Run the tests with:"
echo "  cd contest-scout && npm test"
echo
echo "'npm run dev' runs a REAL sweep against contest-scout/data/ — it drives"
echo "your logged-in claude CLI for up to 45 minutes and sends a notification."
