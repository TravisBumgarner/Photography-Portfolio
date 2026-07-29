# syntax=docker/dockerfile:1
#
# social-poster: Flask API + publisher + the React UI it serves.
#
# Two stages so the frontend is built here rather than committed. The previous
# home for this app deployed onto a Raspberry Pi with no Node toolchain, which
# forced `web/dist/` into git and a pre-commit hook to keep it fresh. A build
# stage removes both.

# ---- stage 1: build the React frontend -------------------------------------
FROM node:22-alpine AS web

WORKDIR /build

# Manifests first: dependency install only re-runs when they change.
COPY web/package.json web/package-lock.json ./
RUN npm ci

COPY web/ ./
# `npm run build` is `tsc --noEmit && vite build`, so a type error fails the
# image build rather than shipping quietly.
RUN npm run build


# ---- stage 2: python runtime -----------------------------------------------
FROM python:3.12-slim

# Unbuffered so `docker logs` shows publisher output as it happens rather than
# whenever a block fills.
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# The app resolves its own paths as <repo>/social-poster/..., so it lives one
# level down from /app to keep those unchanged from a source checkout.
WORKDIR /app/social-poster

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY scripts/ ./scripts/
# tags.json only — the rest of config/ is research notes and the .env example,
# and the real .env is never baked in (config comes from the environment).
COPY config/tags.json ./config/tags.json
COPY --from=web /build/dist ./web/dist

# SQLite database and uploaded images. Mount a volume here or everything is
# lost with the container. Still overridable: the app reads DATA_DIR at import.
ENV DATA_DIR=/data
VOLUME ["/data"]

ENV PORT=5050
EXPOSE 5050

# `/` serves the SPA shell and touches neither the database nor the network,
# so it stays cheap to poll.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:5050/', timeout=4)" || exit 1

# Flask's built-in server on purpose, not gunicorn: the publisher runs as a
# background thread inside this process, and multiple workers would each start
# their own and race to publish the same post twice. Traffic is one person on a
# LAN behind Traefik.
CMD ["python", "scripts/server.py"]
