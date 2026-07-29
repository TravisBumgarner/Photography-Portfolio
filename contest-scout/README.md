# Contest Scout

Monthly photo-contest sweep. A container drives Claude Code headless with this
repo's `/find-contests` skill
([.claude/skills/find-contests](../.claude/skills/find-contests/SKILL.md)),
which researches contest deadlines/eligibility/rights on official pages and
updates the live deadlines file at `/data/contest-deadlines.md` — deliberately
**not version controlled**; it's seeded once from
[config/contest-deadlines.md](config/contest-deadlines.md) and lives in the
data volume from then on. The summary is sent as a JSON POST through the same
**contact-form relay** the portfolio sites use (`contact-form.nfshost.com`),
subject "📸 Time for monthly contests" — the nudge to go review them. Failures
notify too (subject says FAILED), so silence always means "the timer didn't
fire," never "it broke quietly."

Nothing here listens. The container is outbound-only: Anthropic's API, the
research targets, and the relay.

## Deployment

This repo builds and publishes the image; it does not run it. The Pi's compose
stack and the systemd timer that starts it live in the **rasppi-utils** repo,
which pins an image tag:

```
ghcr.io/travisbumgarner/contest-scout:<tag>
```

Cut a release with `npm run release` (tags `contest-scout-v<version>` from
`package.json`), then bump the pinned tag in rasppi-utils. Pushes to `main`
also refresh the `edge` tag, which is for trying things, not for the Pi.

The schedule stays on **host systemd** rather than a container scheduler
because `Persistent=true` makes a Pi that was powered off on the 1st run the
missed sweep on its next boot. Neither ofelia nor a k8s CronJob does that
catch-up, and a skipped window on a monthly job is a month of missed deadlines.

### What the stack has to provide

| | |
|---|---|
| Volume | mounted at `/data` — the deadlines file, the reports, the run marker |
| Volume | mounted at `/home/node` — Claude Code's state, so directory trust and first-run setup survive between monthly runs |
| `CLAUDE_CODE_OAUTH_TOKEN` | or `ANTHROPIC_API_KEY`. Set exactly one |
| `REPORTS_URL` | optional; the URL the notification links to |
| `CONTACT_FORM_URL` | optional; only if the relay ever moves |

Config is environment-only — nothing is baked into the image and there is no
`.env` in this repo, which is public.

## Why the skill is baked into the image, not mounted

In its previous home the compose file mounted `../.claude` into the container,
so a skill edit reached the Pi with a commit and a `git pull` instead of a
rebuild. That reasoning does not survive the move: compose now lives in a
*different repo* to the skill, so a mount would mean cloning this repo onto the
Pi purely to supply prompt text, and the running job would be a mix of a pinned
image and whatever that checkout happened to be at.

Baked, the image tag answers "what did the sweep actually do" on its own. The
cost is real — a source-list edit now needs a rebuild and a tag bump — but the
sources are dated in the skill and rot on a yearly clock, so that's a handful
of releases a year against a permanently ambiguous deployment.

The same reasoning removed `sweep.py`'s `git pull`: with the skill in the
image, a self-update at runtime would be a second, unversioned way for the job
to change behaviour.

## The deadlines file

`config/contest-deadlines.md` is the **seed**, not the live list. It lived in
`social-poster/config/` historically, from before contest-scout existed;
contest-scout is the only thing that reads or writes it, so it lives here now.
The live copy is whatever is in the data volume — `ensure_deadlines_file()`
copies the seed in once and never overwrites it again.

## Operating (on the Pi)

```sh
sudo systemctl start contest-scout.service   # run a sweep right now
journalctl -u contest-scout -n 100           # what the timer did
systemctl list-timers contest-scout.timer    # next scheduled run
```

Schedule: 1st of each month, ~09:00. Claude runs with a read/edit/web-research
tool allowlist only, as a non-root user (`node`), with nothing inbound.

### Resuming an interrupted sweep

A run can take the better part of an hour, and Claude edits the deadlines file
as it goes — so a crash leaves real work behind in the data volume. `sweep.py`
writes `.run-in-progress.json` when a run starts and removes it on success;
finding one at startup tells the next run to carry on from that partial work
rather than redoing the month. Nothing to operate, but it's why a failed run's
edits are worth leaving alone.

### Reports

Each run also writes a self-contained HTML report to
`/data/reports/YYYY-MM.html`. These were served by `status-dashboard`, which
Portainer replaces — until they have a new home the link in each notification
points at nothing. Set `REPORTS_URL` once they do.

## Development

```sh
./bootstrap.sh     # once: .venv + dev deps
npm test           # the sweep runner, all subprocess/HTTP mocked
npm run build      # builds the image (context is the repo root — see below)
npm run dev        # a REAL sweep against contest-scout/data/
```

`npm run dev` is not cheap: it drives your logged-in `claude` CLI for up to 45
minutes and sends a real notification. `sweep.py` falls back to
`contest-scout/data/` when `DATA_DIR` is unset, so it never touches the Pi's
live file.

The image's build context is the **repo root**, not this directory, because it
copies the skill from `.claude/`. `npm run build` handles that; by hand it's
`docker build -f contest-scout/Dockerfile .` from the root. Context exclusions
are in [Dockerfile.dockerignore](Dockerfile.dockerignore) rather than a
repo-root `.dockerignore`, so they stay scoped to this build.
