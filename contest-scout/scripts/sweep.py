#!/usr/bin/env python3
"""Contest Scout - monthly photo-contest sweep, run on the Pi.

Runs Claude Code headless with this repo's /find-contests skill, which
verifies contest deadlines/eligibility/rights on official pages and updates
the live deadlines file. That file lives in DATA_DIR (not the git repo —
deliberately unversioned), seeded once from the repo's copy at
contest-scout/config/contest-deadlines.md. The summary is then sent through
the same contact-form relay the portfolio sites use — the nudge that it's
time to review the month's contests.

Every outcome notifies — including failures — so a silent month always
means "the timer didn't fire," never "it broke quietly."

Ships as a container image (see the Dockerfile). A host systemd timer in the
orchestrating repo runs it monthly; credentials arrive as environment
variables from that repo's env file.
"""

# The container ships Python 3.11 and this repo's dev venv may be older; this
# keeps `X | None` annotations parseable in both.
from __future__ import annotations

import hashlib
import json
import os
import subprocess
from datetime import date, datetime
from pathlib import Path

import requests

# contest-scout/scripts/sweep.py -> <repo>. Claude runs with this as its
# working directory so it picks up .claude/skills/find-contests; the image
# reproduces the same two-level layout under /app.
REPO_ROOT = Path(__file__).resolve().parents[2]

# The image sets DATA_DIR=/data and the compose stack mounts a volume there;
# the default is a dev-friendly location inside the utility.
DATA_DIR = Path(
    os.environ.get("DATA_DIR", Path(__file__).resolve().parents[1] / "data")
)
DEADLINES_PATH = DATA_DIR / "contest-deadlines.md"

# Monthly self-contained HTML reports. Each notification links here; the
# default points at the old status-dashboard, so set REPORTS_URL once the
# reports volume is served from somewhere that still exists.
REPORTS_DIR = DATA_DIR / "reports"
REPORTS_URL = os.environ.get("REPORTS_URL", "http://rasppi-utils.local/contests")

# A run can take the better part of an hour and Claude edits the deadlines
# file as it goes, so a crash leaves real work behind in DATA_DIR. This marker
# is written when a run starts and removed when it finishes; finding one on
# startup means the last attempt died, and the next prompt says so instead of
# redoing the month from scratch.
RUN_MARKER_PATH = DATA_DIR / ".run-in-progress.json"

# The repo copy only seeds the data dir on first run; after that the data-dir
# file is the source of truth and is never committed.
SEED_PATH = REPO_ROOT / "contest-scout" / "config" / "contest-deadlines.md"

# Same relay the portfolio contact forms POST to (see
# Engineering-Portfolio-and-Blog frontend/src/sharedComponents/ContactForm.tsx).
CONTACT_FORM_URL = os.environ.get(
    "CONTACT_FORM_URL", "https://contact-form.nfshost.com/contact"
)
# The contact forms cap messages at 800 chars client-side; match it.
MESSAGE_LIMIT = 800

# Headless permission allowlist: web research + editing the deadlines file.
ALLOWED_TOOLS = "WebSearch,WebFetch,Read,Glob,Grep,Edit,Write"

CLAUDE_TIMEOUT_SECONDS = 45 * 60


def _report_path() -> Path:
    return REPORTS_DIR / f"{date.today():%Y-%m}.html"


def _prompt(resuming: dict | None = None) -> str:
    """The headless instruction; the final reply becomes the notification."""
    resume = ""
    if resuming:
        # The skill already reads the deadlines file as its starting state, so
        # it resumes naturally once it knows the file is mid-edit rather than
        # last month's finished list.
        resume = (
            "NOTE: a sweep started "
            f"{resuming.get('started_at', 'earlier')} was interrupted before "
            "it finished, so the deadlines file below already holds partial "
            "work from it. Treat entries updated since the file's stated last "
            "sweep date as done, re-verify anything that looks half-written, "
            "and carry on — do not start the month over. "
        )
    return resume + (
        f"Run /find-contests, but the deadlines file to read and update is "
        f"{DEADLINES_PATH} — NOT the repo copy. Then write a self-contained "
        f"HTML report of the full current list to {_report_path()} — a "
        "clean, phone-readable page: sections for open now / watchlist / "
        "rejected, and per contest a link, subject areas, deadline, fee, "
        "prize, and the TOS verdict (with the quoted clause for rejects). "
        "No external assets. Finally, reply with ONLY a short "
        "push-notification summary (max 600 characters, plain text, no "
        "markdown): what's newly open, what closes within 6 weeks, and "
        "anything newly rejected. If nothing changed, say so in one "
        "sentence."
    )


def ensure_deadlines_file() -> None:
    """Create the data dirs and seed the deadlines file from the repo copy once."""
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    if not DEADLINES_PATH.exists():
        DEADLINES_PATH.write_text(SEED_PATH.read_text(encoding="utf-8"),
                                  encoding="utf-8")


def _file_hash() -> str:
    return hashlib.sha256(DEADLINES_PATH.read_bytes()).hexdigest()


def begin_run() -> dict | None:
    """Claim the run; return the previous run's marker if it never finished."""
    previous = None
    if RUN_MARKER_PATH.exists():
        try:
            previous = json.loads(RUN_MARKER_PATH.read_text(encoding="utf-8"))
        except ValueError:
            # A truncated marker still proves a run died; the details are only
            # used to phrase the prompt, so an empty dict is good enough.
            previous = {}
    RUN_MARKER_PATH.write_text(
        json.dumps({"started_at": datetime.now().isoformat(timespec="seconds")}),
        encoding="utf-8",
    )
    return previous


def end_run() -> None:
    """Clear the marker. Left in place on failure, which is the whole point."""
    RUN_MARKER_PATH.unlink(missing_ok=True)


def run_sweep(resuming: dict | None = None) -> str:
    """Run the headless Claude sweep; return its final reply text."""
    claude_bin = os.environ.get("CLAUDE_BIN", "claude")
    result = subprocess.run(
        [
            claude_bin, "-p", _prompt(resuming),
            "--allowedTools", ALLOWED_TOOLS,
            # The deadlines file lives outside the repo checkout.
            "--add-dir", str(DATA_DIR),
        ],
        cwd=str(REPO_ROOT),
        capture_output=True, text=True,
        timeout=CLAUDE_TIMEOUT_SECONDS,
    )
    if result.returncode != 0:
        raise RuntimeError(
            f"claude exited {result.returncode}: "
            f"{(result.stderr or result.stdout)[:400]}"
        )
    return result.stdout.strip()


def notify(subject: str, message: str) -> None:
    """Send the summary through the contact-form relay (JSON POST)."""
    resp = requests.post(
        CONTACT_FORM_URL,
        json={
            "name": "Contest Scout",
            "email": "",
            "subject": subject,
            "message": message[:MESSAGE_LIMIT],
            # The relay treats this as the sending site's name. Left as
            # "rasppi-utils" through the repo move on purpose: it is the label
            # every existing sweep notification carries, and renaming it would
            # split one mailbox thread in two for no benefit.
            "website": "rasppi-utils",
        },
        timeout=30,
    )
    resp.raise_for_status()


def main() -> None:
    month = f"{date.today():%B %Y}"
    try:
        # No `git pull` here any more. The skill is baked into the image, so
        # the only way to change what a sweep does is to rebuild and bump the
        # pinned tag — a self-update at runtime would be a second, unversioned
        # way for the job to change behaviour, which is what the image tag
        # exists to prevent.
        ensure_deadlines_file()
        resuming = begin_run()
        before = _file_hash()
        summary = run_sweep(resuming)
        changed = _file_hash() != before
        end_run()
    except Exception as exc:  # noqa: BLE001 - failure must still notify.
        notify(
            f"Contest sweep FAILED — {month}",
            f"{type(exc).__name__}: {str(exc)[:500]}\n"
            "Partial work is kept; the next run resumes it.\n"
            "Check: docker compose logs, or journalctl -u contest-scout",
        )
        raise

    status = "List updated." if changed else "No changes this month."
    notify(
        f"📸 Time for monthly contests — {month}",
        f"{summary}\n\n{status}\nBrowse: {REPORTS_URL}",
    )
    print(f"contest-scout: done. {status} Report: {_report_path()}")


if __name__ == "__main__":
    main()
