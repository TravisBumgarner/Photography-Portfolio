# social-poster

Schedule image posts to Instagram, Bluesky and Reddit from a calendar/queue web
app. Upload photos, tag them, pick destinations, drop them on a calendar; a
publisher thread sends whatever is due.

Runs as a container on a Raspberry Pi behind Traefik. Previously lived in
`rasppi-utils` as a systemd service.

## Layout

```
scripts/       Flask API, publisher, platform clients, tagging, subreddit rules
web/           React 18 + Vite + TypeScript UI (served by Flask in prod)
tests/         pytest
config/        tags.json (the tag taxonomy), subreddits.json + research notes
analysis/      one-off gallery tag clustering, not part of the app
```

## Destinations

A post has one row per **destination**, not per account. Instagram and Bluesky
are one destination each; Reddit is one per subreddit, because a single account
posts the same photo to several subs and each needs its own title. That is why
targets are keyed by `(account_id, subreddit)` and why per-platform caption maps
are lossy for Reddit — anything per-destination reads `post.targets`.

### Reddit specifics

- A submission takes a **title**, not a caption. Each sub stores a title
  template of `{token}`s (`{title}`, `{location}`, `{camera}`, `{film_stock}`,
  `{dimensions}`, …) filled in from the photo's Lightroom metadata. A bracket
  group whose tokens are all empty is dropped whole, so one template reads
  correctly for film, digital, and metadata-poor photos.
- An image submission is a link post and **can't carry body text**, so the
  description is posted as a first comment when the sub allows it.
- Destinations are **staggered**: `post_targets.delay_minutes` is an offset from
  the post's `scheduled_at`, so rescheduling slides the whole set. Submitting one
  photo to several subs in the same minute is the classic spam signature and
  several photo subs auto-remove for it — this is closer to a correctness
  requirement than a nicety.
- Per-sub rules (title template, flair, title length, minimum posting interval,
  stagger) live in the `subreddits` table, seeded once from
  [`config/subreddits.json`](config/subreddits.json) and edited in the
  **Subreddits** panel thereafter. Category quick-selects ("Mexico", "Film",
  "Nightscapes") map Lightroom keyword prefixes to groups of subs, so a photo's
  own keywords suggest where it should go.

> **The seeded rules are unverified.** They are marked `UNVERIFIED` in
> `config/subreddits.json` and in the UI. Subreddit rules change and mods enforce
> unwritten ones — read each sub's sidebar before its first post and correct the
> row in the app.

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

Accounts are entered in the Accounts panel and stored in the database — not in
`.env`:

| Platform | Credentials |
|---|---|
| Instagram | user ID + long-lived Graph API token |
| Bluesky | handle + app password |
| Reddit | client id/secret from a **script** app at `reddit.com/prefs/apps`, plus the owning account's username and password |

Reddit's script-app flow signs in with the account's own password. A 2FA account
needs `password:123456`, and that code expires — so a posting account without 2FA
is the practical option.

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
