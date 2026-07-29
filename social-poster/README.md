# social-poster

Schedule image posts to Instagram and Bluesky from a calendar/queue web app.
Upload photos, tag them, pick accounts, drop them on a calendar; a publisher
thread sends whatever is due.

Runs as a container on a Raspberry Pi behind Traefik. Previously lived in
`rasppi-utils` as a systemd service.

## Layout

```
scripts/       Flask API, publisher, platform clients, tagging
web/           React 18 + Vite + TypeScript UI (served by Flask in prod)
tests/         pytest
config/        tags.json (the tag taxonomy) + research notes
analysis/      one-off gallery tag clustering, not part of the app
```

## Development

```bash
./bootstrap.sh   # venv + node deps + cloudflared + config/.env
npm run dev      # quick tunnel + Flask :5050 + Vite :5173 → http://localhost:5173
npm test
```

`npm run dev` starts an ephemeral Cloudflare quick tunnel first and injects its
URL as `PUBLIC_BASE_URL`, because Instagram's Graph API fetches each photo from
a public URL and the API validates that setting at startup. Set `DRY_RUN=1` in
`config/.env` to exercise everything without sending real posts.

Accounts (Instagram user ID + long-lived Graph API token, Bluesky handle + app
password) are entered in the Accounts panel and stored in the database — not in
`.env`.

## Container

```bash
npm run build   # docker build -t social-poster:local .
npm start       # runs it on :5050 with DRY_RUN=1 and a named volume
```

Multi-stage: a Node stage builds `web/`, and the Python runtime stage copies
only `dist/`. That is why `web/dist/` is not committed.

### Configuration

Everything is environment variables; nothing is baked into the image.

| Variable | Default | Notes |
|---|---|---|
| `DATA_DIR` | `/data` in the image | **Mount a volume here.** SQLite database and uploaded images. |
| `PORT` | `5050` | |
| `PUBLIC_BASE_URL` | — | Required unless `DRY_RUN=1`. The public https URL Instagram fetches images from; provided by a Cloudflare Tunnel in the compose stack. |
| `DRY_RUN` | `0` | `1` simulates posting and logs notifications instead of sending. |
| `PUBLISHER_INTERVAL` | `60` | Seconds between publisher ticks. |
| `PUBLISHER_DISABLED` | — | `1` turns the in-process publisher off. |
| `QUEUE_LOW_THRESHOLD` | `3` | Push a "queue running low" notification at or below this many remaining posts, and "queue is empty" at zero. |
| `QUEUE_ALERTS_DISABLED` | — | `1` turns those notifications off. |
| `CONTACT_FORM_URL` | public relay | Only set if the notification relay moves. |

### Releasing

Push a `social-poster-v*` tag and
[`.github/workflows/social-poster-image.yml`](../.github/workflows/social-poster-image.yml)
publishes `linux/arm64` to `ghcr.io/<owner>/social-poster`. Bump `version` in
`package.json`, then:

```bash
npm run release
```

Then pin the new tag in the Pi's compose stack and deploy there.
