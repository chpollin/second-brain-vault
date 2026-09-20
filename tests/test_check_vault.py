"""The vault check must pass on the template, find the seeded defects in the fixtures,
and abort visibly when a rule source is missing."""

import importlib.util
import sys
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent.parent / "scripts"
sys.path.insert(0, str(SCRIPTS))
spec = importlib.util.spec_from_file_location("check_vault", SCRIPTS / "check_vault.py")
check_vault = importlib.util.module_from_spec(spec)
spec.loader.exec_module(check_vault)


def test_template_is_clean():
    result = check_vault.check()
    assert result["hard"] == []
    assert result["measured"] == []


def test_fixtures_show_the_seeded_defects():
    result = check_vault.check(fixtures=True)
    hard = {(Path(rel).stem, msg) for rel, msg in result["hard"]}
    measured = {(Path(rel).stem, msg) for rel, msg in result["measured"]}
    assert ("Fixture Handoff Note", "tag 'meeting-leftover' not registered in TAG-TAXONOMY") in hard
    assert ("Fixture Overview", "dead anchor [[Fixture Concept Alpha#Causes in Detail]]") in measured
    # The clean reference note must stay clean, otherwise the fixtures prove nothing.
    assert not [m for m in result["hard"] + result["measured"] if Path(m[0]).stem == "Fixture Concept Alpha"]


def test_missing_rule_source_aborts(monkeypatch, tmp_path):
    monkeypatch.setattr(check_vault, "PROFILES", tmp_path / "absent.md")
    try:
        check_vault.check()
    except check_vault.ConfigError:
        return
    raise AssertionError("a missing rule source must not end as a passed check")


def test_hard_only_keeps_hard_findings_and_omits_measured_findings() -> None:
    full = check_vault.check(fixtures=True)
    hard_only = check_vault.check(fixtures=True, hard_only=True)
    assert full["measured"]
    assert hard_only["hard"] == full["hard"]
    assert hard_only["measured"] == []


def test_unregistered_skill_and_convention_are_reported(monkeypatch, tmp_path):
    (tmp_path / ".claude" / "skills" / "new-skill").mkdir(parents=True)
    (tmp_path / ".claude" / "skills" / "new-skill" / "SKILL.md").write_text("x", encoding="utf-8")
    (tmp_path / "Vault Operations" / "Conventions").mkdir(parents=True)
    (tmp_path / "Vault Operations" / "Conventions" / "Convention New.md").write_text("x", encoding="utf-8")
    (tmp_path / "VAULT-OPERATIONS.md").write_text("| other-skill | on call |", encoding="utf-8")
    (tmp_path / "CLAUDE.md").write_text("- [[Convention Other]]", encoding="utf-8")
    monkeypatch.setattr(check_vault, "VAULT", tmp_path)
    messages = [msg for _, msg in check_vault.registers()]
    assert messages == [
        "skill 'new-skill' missing in the skill register",
        "'Convention New' missing in the convention index",
    ]
