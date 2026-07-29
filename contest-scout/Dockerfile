# syntax=docker/dockerfile:1
#
# contest-scout: a monthly headless Claude Code session that sweeps for photo
# contests. Built for linux/arm64 (the Pi 5).
#
# Two runtimes in one image because the job genuinely is both: `claude` is a
# Node CLI, and sweep.py drives it and posts the notification. Node is the base
# rather than python because the Claude Code CLI is the fussier of the two to
# install; Debian's python3 + python3-requests are one apt line away and need
# no venv or wheel builds on arm.
#
# The build context is the REPO ROOT, not this directory, because the image
# bakes in the /find-contests skill from .claude/ next to the code that runs
# it. Build with `docker build -f contest-scout/Dockerfile .` from the repo
# root, or just `npm run build` in here. Context exclusions live in
# contest-scout/Dockerfile.dockerignore.
FROM node:22.23.1-bookworm-slim

# git + ripgrep are Claude Code's, not ours: it shells out to `rg` for the Grep
# tool and to git for repo context. Without ripgrep the tool degrades quietly
# rather than failing, which is the worst way for this to break.
RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates \
        git \
        python3 \
        python3-requests \
        ripgrep \
    && rm -rf /var/lib/apt/lists/*

# Pinned like every other image in this stack, and the autoupdater is off so
# the pin stays true. A CLI that silently upgrades itself between monthly runs
# means a failure can't be traced back to anything in git.
ARG CLAUDE_CODE_VERSION=2.1.220
RUN npm install -g "@anthropic-ai/claude-code@${CLAUDE_CODE_VERSION}" \
    && npm cache clean --force
ENV DISABLE_AUTOUPDATER=1

# sweep.py resolves the repo root two levels up from itself and runs Claude
# there, so the layout under /app mirrors this repo's — which is also what puts
# the skill at /app/.claude, where Claude Code looks for project skills.
WORKDIR /app
COPY contest-scout/scripts/ /app/contest-scout/scripts/
COPY contest-scout/config/contest-deadlines.md /app/contest-scout/config/contest-deadlines.md
COPY .claude/skills/find-contests/ /app/.claude/skills/find-contests/

# /data is a volume mount point, and Docker copies the ownership of the image's
# directory when it first creates a named volume. Creating it as `node` here is
# what stops the volume coming up root-owned and unwritable. /home/node is the
# same story for Claude Code's own state.
RUN mkdir -p /data \
    && chown -R node:node /data /home/node

# Not root. Nothing here needs it, and this container holds a Claude credential
# that can spend money.
USER node

# The live deadlines file, the monthly HTML reports and the interrupted-run
# marker all live here. Mount a volume or a sweep's work dies with the
# container. Still overridable: sweep.py reads DATA_DIR at import.
ENV DATA_DIR=/data
VOLUME ["/data"]

ENTRYPOINT ["python3", "/app/contest-scout/scripts/sweep.py"]
