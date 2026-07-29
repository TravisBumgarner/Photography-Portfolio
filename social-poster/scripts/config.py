#!/usr/bin/env python3
"""Social Poster - environment configuration loading and validation.

Loads ``social-poster/config/.env`` in dev (prod injects the same vars via
systemd) and validates the app-level settings up front, so a misconfigured
deploy fails fast at startup with a clear message instead of at publish time.

Per-account Instagram/Bluesky credentials are NOT read here — those are entered
in the Accounts UI and stored in the database. This module only covers
process-wide settings.
"""

import os
from pathlib import Path
from typing import Dict

# <repo>/social-poster/scripts/config.py -> <repo>
REPO_ROOT = Path(__file__).parent.parent.parent
ENV_PATH = REPO_ROOT / "social-poster" / "config" / ".env"


def load_env() -> None:
    """Load the dev ``.env`` file if python-dotenv is available.

    Does not override variables already in the environment, so prod's systemd
    ``EnvironmentFile`` values always win. A no-op if python-dotenv is missing
    or the file does not exist.
    """
    try:
        from dotenv import load_dotenv
    except ImportError:  # optional; prod uses systemd env
        return
    load_dotenv(ENV_PATH)


def dry_run() -> bool:
    """Whether DRY_RUN is on (``1``). Anything else (unset/``0``) means live."""
    return os.environ.get("DRY_RUN", "").strip() == "1"


def load_config() -> Dict:
    """Load, validate, and return the process-wide configuration.

    Reads only the current environment; call ``load_env()`` first (startup does)
    to populate it from the dev ``.env``.

    Raises:
        RuntimeError: listing every problem found, so a bad deploy is obvious
            at startup. ``PUBLIC_BASE_URL`` is required for live runs because
            Instagram fetches images from it; it is optional under DRY_RUN.
    """
    problems = []

    is_dry = dry_run()

    public_base_url = os.environ.get("PUBLIC_BASE_URL", "").strip().rstrip("/")
    if not is_dry and not public_base_url:
        problems.append(
            "PUBLIC_BASE_URL is required (the public https URL of this app that "
            "Instagram fetches images from). Set DRY_RUN=1 to run without it."
        )
    elif public_base_url and not public_base_url.startswith("https://"):
        problems.append("PUBLIC_BASE_URL must start with https://")

    port_raw = os.environ.get("PORT", "").strip() or "5050"
    try:
        port = int(port_raw)
    except ValueError:
        port = 5050
        problems.append(f"PORT must be an integer (got {port_raw!r})")

    if problems:
        raise RuntimeError(
            "Invalid social-poster configuration:\n  - " + "\n  - ".join(problems)
        )

    return {
        "public_base_url": public_base_url,
        "port": port,
        "dry_run": is_dry,
        "publisher_interval": int(os.environ.get("PUBLISHER_INTERVAL", "60")),
        "publisher_disabled": os.environ.get("PUBLISHER_DISABLED") == "1",
    }
