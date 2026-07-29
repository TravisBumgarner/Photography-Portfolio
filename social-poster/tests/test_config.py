"""Tests for social-poster env config loading and validation."""

import sys
from pathlib import Path

import pytest

_SCRIPTS = Path(__file__).parent.parent / "scripts"
sys.path.insert(0, str(_SCRIPTS))

import config  # noqa: E402


def _clear(monkeypatch):
    for key in (
        "PUBLIC_BASE_URL",
        "PORT",
        "DRY_RUN",
        "PUBLISHER_INTERVAL",
        "PUBLISHER_DISABLED",
    ):
        monkeypatch.delenv(key, raising=False)


def test_valid_live_config(monkeypatch):
    _clear(monkeypatch)
    monkeypatch.setenv("PUBLIC_BASE_URL", "https://poster.example.com/")
    cfg = config.load_config()
    assert cfg["public_base_url"] == "https://poster.example.com"  # trailing / stripped
    assert cfg["port"] == 5050
    assert cfg["dry_run"] is False


def test_missing_public_base_url_fails_when_live(monkeypatch):
    _clear(monkeypatch)
    with pytest.raises(RuntimeError, match="PUBLIC_BASE_URL is required"):
        config.load_config()


def test_public_base_url_optional_under_dry_run(monkeypatch):
    _clear(monkeypatch)
    monkeypatch.setenv("DRY_RUN", "1")
    cfg = config.load_config()
    assert cfg["dry_run"] is True
    assert cfg["public_base_url"] == ""


def test_public_base_url_must_be_https(monkeypatch):
    _clear(monkeypatch)
    monkeypatch.setenv("PUBLIC_BASE_URL", "http://poster.example.com")
    with pytest.raises(RuntimeError, match="must start with https"):
        config.load_config()


def test_dry_run_only_true_for_one(monkeypatch):
    _clear(monkeypatch)
    monkeypatch.setenv("DRY_RUN", "0")
    assert config.dry_run() is False
    monkeypatch.setenv("DRY_RUN", "true")
    assert config.dry_run() is False
    monkeypatch.setenv("DRY_RUN", "1")
    assert config.dry_run() is True
