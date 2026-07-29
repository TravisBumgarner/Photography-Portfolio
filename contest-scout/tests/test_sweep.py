"""Tests for the contest-scout sweep runner (all subprocess/HTTP mocked)."""

import subprocess
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent / "scripts"))

import sweep  # noqa: E402


def _proc(returncode=0, stdout="", stderr=""):
    return subprocess.CompletedProcess([], returncode, stdout, stderr)


def _use_tmp_data_dir(tmp_path, monkeypatch, seed="seeded contest list\n"):
    """Point the module at a throwaway DATA_DIR and repo-seed file."""
    seed_path = tmp_path / "repo-copy.md"
    seed_path.write_text(seed)
    data_dir = tmp_path / "data"
    monkeypatch.setattr(sweep, "SEED_PATH", seed_path)
    monkeypatch.setattr(sweep, "DATA_DIR", data_dir)
    monkeypatch.setattr(sweep, "DEADLINES_PATH", data_dir / "contest-deadlines.md")
    monkeypatch.setattr(sweep, "REPORTS_DIR", data_dir / "reports")
    monkeypatch.setattr(sweep, "RUN_MARKER_PATH", data_dir / ".run-in-progress.json")


def test_ensure_deadlines_file_seeds_from_repo_copy(tmp_path, monkeypatch):
    _use_tmp_data_dir(tmp_path, monkeypatch)
    sweep.ensure_deadlines_file()
    assert sweep.DEADLINES_PATH.read_text() == "seeded contest list\n"


def test_ensure_deadlines_file_never_overwrites(tmp_path, monkeypatch):
    _use_tmp_data_dir(tmp_path, monkeypatch)
    sweep.ensure_deadlines_file()
    sweep.DEADLINES_PATH.write_text("live edits from a previous sweep")
    sweep.ensure_deadlines_file()
    assert sweep.DEADLINES_PATH.read_text() == "live edits from a previous sweep"


def test_prompt_names_the_data_dir_file_and_html_report(tmp_path, monkeypatch):
    _use_tmp_data_dir(tmp_path, monkeypatch)
    prompt = sweep._prompt()
    assert str(sweep.DEADLINES_PATH) in prompt
    assert str(sweep._report_path()) in prompt


def test_ensure_creates_reports_dir(tmp_path, monkeypatch):
    _use_tmp_data_dir(tmp_path, monkeypatch)
    sweep.ensure_deadlines_file()
    assert sweep.REPORTS_DIR.is_dir()


def test_notify_posts_contact_form_json_and_truncates():
    resp = MagicMock()
    with patch("requests.post", return_value=resp) as post:
        sweep.notify("📸 Time for monthly contests — July 2026", "x" * 5000)
    assert post.call_args.args[0] == sweep.CONTACT_FORM_URL
    sent = post.call_args.kwargs["json"]
    assert sent["subject"] == "📸 Time for monthly contests — July 2026"
    assert len(sent["message"]) == sweep.MESSAGE_LIMIT
    assert sent["name"] == "Contest Scout"
    assert sent["website"] == "rasppi-utils"
    resp.raise_for_status.assert_called_once()


def test_main_reports_updated_file(tmp_path, monkeypatch):
    _use_tmp_data_dir(tmp_path, monkeypatch)

    def fake_sweep(_resuming=None):
        sweep.DEADLINES_PATH.write_text("new contests found")
        return "Sony WPA is open."

    with patch.object(sweep, "run_sweep", side_effect=fake_sweep), \
         patch("subprocess.run", return_value=_proc()), \
         patch("requests.post") as post:
        sweep.main()
    sent = post.call_args.kwargs["json"]
    assert "Sony WPA is open." in sent["message"]
    assert "List updated." in sent["message"]
    assert "Browse: " in sent["message"]


def test_main_reports_no_changes(tmp_path, monkeypatch):
    _use_tmp_data_dir(tmp_path, monkeypatch)
    with patch.object(sweep, "run_sweep", return_value="Nothing new."), \
         patch("subprocess.run", return_value=_proc()), \
         patch("requests.post") as post:
        sweep.main()
    assert "No changes" in post.call_args.kwargs["json"]["message"]


def test_failure_still_notifies(tmp_path, monkeypatch):
    _use_tmp_data_dir(tmp_path, monkeypatch)
    with patch.object(sweep, "run_sweep", side_effect=RuntimeError("boom")), \
         patch("subprocess.run", return_value=_proc()), \
         patch("requests.post") as post:
        with pytest.raises(RuntimeError):
            sweep.main()
    sent = post.call_args.kwargs["json"]
    assert "FAILED" in sent["subject"]
    assert "boom" in sent["message"]


def test_successful_run_leaves_no_resume_marker(tmp_path, monkeypatch):
    _use_tmp_data_dir(tmp_path, monkeypatch)
    with patch.object(sweep, "run_sweep", return_value="Nothing new."), \
         patch("subprocess.run", return_value=_proc()), \
         patch("requests.post"):
        sweep.main()
    assert not sweep.RUN_MARKER_PATH.exists()


def test_crashed_run_leaves_marker_and_next_prompt_resumes(tmp_path, monkeypatch):
    _use_tmp_data_dir(tmp_path, monkeypatch)
    with patch.object(sweep, "run_sweep", side_effect=RuntimeError("died")), \
         patch("subprocess.run", return_value=_proc()), \
         patch("requests.post"):
        with pytest.raises(RuntimeError):
            sweep.main()

    # The marker survives the crash, and the next run turns it into a prompt
    # that continues the partial work rather than redoing the month.
    assert sweep.RUN_MARKER_PATH.exists()
    resuming = sweep.begin_run()
    assert "started_at" in resuming
    assert "interrupted" in sweep._prompt(resuming)
    assert "interrupted" not in sweep._prompt(None)


def test_begin_run_tolerates_a_truncated_marker(tmp_path, monkeypatch):
    _use_tmp_data_dir(tmp_path, monkeypatch)
    sweep.ensure_deadlines_file()
    sweep.RUN_MARKER_PATH.write_text('{"started_at": ')
    assert sweep.begin_run() == {}


def test_main_never_updates_its_own_checkout(tmp_path, monkeypatch):
    """The skill is baked into the image; the pinned tag is the only knob.

    A `git pull` here would be a second, unversioned way for a sweep to change
    what it does, so main() must shell out to nothing but Claude itself.
    """
    _use_tmp_data_dir(tmp_path, monkeypatch)
    with patch.object(sweep, "run_sweep", return_value="Nothing new."), \
         patch("subprocess.run", return_value=_proc()) as run, \
         patch("requests.post"):
        sweep.main()
    run.assert_not_called()


def test_the_skill_and_seed_are_where_the_image_expects_them():
    """Both paths are load-bearing and neither fails until a real sweep runs.

    Claude discovers /find-contests as a project skill under REPO_ROOT, and the
    Dockerfile copies these two paths in by name. Move either one and the image
    still builds, then the monthly job fails an hour in.
    """
    assert (sweep.REPO_ROOT / ".claude" / "skills" / "find-contests"
            / "SKILL.md").is_file()
    assert sweep.SEED_PATH.is_file()


def test_run_sweep_raises_on_claude_error():
    with patch("subprocess.run", return_value=_proc(returncode=2, stderr="bad token")):
        with pytest.raises(RuntimeError, match="bad token"):
            sweep.run_sweep()
