#!/usr/bin/env python3
"""Social Poster - push notifications via the contact-form relay.

Messages go out through the same public relay the portfolio contact forms
POST to (see Engineering-Portfolio-and-Blog
``frontend/src/sharedComponents/ContactForm.tsx``), which fans them out to
Pushover. No credentials are needed — the endpoint is public — so the only
configuration is the optional ``CONTACT_FORM_URL`` override.

``contest-scout`` has its own copy of this helper on purpose: each utility in
this repo installs and deploys on its own, so they deliberately do not share a
code path for something this small.
"""

import os

import requests

# Same relay the portfolio contact forms POST to.
DEFAULT_URL = "https://contact-form.nfshost.com/contact"

# The contact forms cap messages at 800 chars client-side; match it.
MESSAGE_LIMIT = 800

TIMEOUT_SECONDS = 30


def _url() -> str:
    """The relay URL, read per call.

    Deliberately not a module-level constant: this module is imported before
    ``config.load_env()`` runs, so a ``CONTACT_FORM_URL`` set in the dev
    ``.env`` would be missed by an import-time read.
    """
    return os.environ.get("CONTACT_FORM_URL", "").strip() or DEFAULT_URL


def send(subject: str, message: str, name: str = "Social Poster") -> None:
    """Send one notification through the relay.

    Raises:
        requests.RequestException: on a network failure or non-2xx response.
            Callers decide whether that is fatal; the queue watch treats it as
            "not delivered" and simply retries on the next publisher tick.
    """
    resp = requests.post(
        _url(),
        json={
            "name": name,
            "email": "",
            "subject": subject,
            "message": message[:MESSAGE_LIMIT],
            "website": "rasppi-utils",
        },
        timeout=TIMEOUT_SECONDS,
    )
    resp.raise_for_status()
