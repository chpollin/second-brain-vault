"""The generated site must describe the real template: every trace step points at a file that
exists unless it is marked as absent, every wikilink resolves, the loading layer of the known
files is right, and a stale docs/data.json is detected."""

import importlib.util
import json
import shutil
import sys
from pathlib import Path

VAULT = Path(__file__).resolve().parent.parent
SCRIPTS = VAULT / "scripts"
sys.path.insert(0, str(SCRIPTS))
spec = importlib.util.spec_from_file_location("build_site", SCRIPTS / "build_site.py")
build_site = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build_site)

DATA = json.loads(build_site.render())


def test_every_trace_step_points_at_an_exportable_file():
    for task in DATA["tasks"]:
        assert task["steps"], task["id"]
        for step in task["steps"]:
            assert (step["path"] in DATA["files"]) == step["present"], f"{task['id']}: {step['path']}"
            if step["present"]:
                assert (VAULT / step["path"]).is_file(), f"{task['id']}: {step['path']}"
                assert step["why"].strip(), f"{task['id']}: {step['path']} has no reason"


def test_existing_persona_stays_outside_the_explorer(monkeypatch, tmp_path) -> None:
    """A private profile may exist while its contents stay outside the published corpus."""
    copied = tmp_path / "vault"
    shutil.copytree(VAULT, copied, ignore=shutil.ignore_patterns(*build_site.SKIP_DIRS))
    profile = copied / ".local" / "persona" / "Research Persona.md"
    profile.parent.mkdir(parents=True)
    marker = " ".join(("Private", "regression", "marker"))
    profile.write_text(marker, encoding="utf-8")
    monkeypatch.setattr(build_site, "VAULT", copied)
    monkeypatch.setattr(build_site, "OPERATIONS", copied / "VAULT-OPERATIONS.md")
    rendered = build_site.render()
    data = json.loads(rendered)
    assert marker not in rendered
    assert ".local/persona/Research Persona.md" not in data["files"]
    task = next(task for task in data["tasks"] if task["skill"] == "persona-init")
    step = next(step for step in task["steps"] if step["path"] == ".local/persona/Research Persona.md")
    assert profile.is_file() and not step["present"]


def test_every_trace_anchor_stands_in_its_file():
    for task in DATA["tasks"]:
        for step in task["steps"]:
            if step["anchor"]:
                assert step["anchor"] in DATA["files"][step["path"]]["anchors"], step


def test_every_wikilink_resolves_to_a_file_in_the_data():
    for rel, entry in DATA["files"].items():
        for link in entry["links"]:
            assert link["path"], f"{rel}: dead link [[{link['target']}]]"
            assert link["path"] in DATA["files"], f"{rel}: [[{link['target']}]]"


def test_the_layer_of_the_known_files():
    layers = {rel: entry["layer"] for rel, entry in DATA["files"].items()}
    assert layers["CLAUDE.md"] == "always"
    assert layers["AGENTS.md"] == "always"
    assert layers[".claude/rules/documents.md"] == "by-path"
    assert layers[".claude/skills/vault-knowledge/SKILL.md"] == "on-demand"
    assert layers[".claude/skills/vault-knowledge/references/refactor.md"] == "on-demand"
    assert layers["Vault Operations/Conventions/Convention Skills.md"] == "on-demand"
    assert layers["VAULT-OPERATIONS.md"] == "content"
    assert layers["Vault Operations/Templates/Template Concept Note.md"] == "content"
    assert layers["scripts/check_vault.py"] == "checks"
    assert layers["tests/test_check_vault.py"] == "checks"
    assert layers["Vault Operations/Fixtures/Fixture Glossary.md"] == "fixtures"
    assert layers["README.md"] == "about"
    assert {id for id, _, _ in DATA["layers"]} == set(layers.values())


def test_the_trace_of_a_task_with_a_mode():
    """The task table names mode check for one document, so the trace runs from the constitution
    through the rule file, the skill and its mode file to the check that closes the work."""
    task = next(t for t in DATA["tasks"] if t["id"] == "check-one-note-or-folder")
    roles = [(step["role"], step["path"]) for step in task["steps"]]
    assert roles[0] == ("constitution", "CLAUDE.md")
    assert ("rule", ".claude/rules/documents.md") in roles
    assert ("skill", ".claude/skills/vault-knowledge/SKILL.md") in roles
    assert ("mode", ".claude/skills/vault-knowledge/references/check.md") in roles
    assert ("reads", "TAG-TAXONOMY.md") in roles
    assert roles[-1] == ("check", "scripts/check_vault.py")
    # ACTIVE-WORK.md is not among this task's reads, so its path-bound rule must stay out.
    assert ("rule", ".claude/rules/active-work.md") not in roles


def test_the_active_work_rule_loads_only_where_its_path_matches():
    task = next(t for t in DATA["tasks"] if t["id"] == "report-the-operational-state")
    roles = [(step["role"], step["path"]) for step in task["steps"]]
    assert ("rule", ".claude/rules/active-work.md") in roles
    assert ("reads", "ACTIVE-WORK.md") in roles


def test_glob_matching_covers_the_root():
    assert build_site.glob_to_regex("**/*.md").match("CLAUDE.md")
    assert build_site.glob_to_regex("**/*.md").match("Vault Operations/Done Log.md")
    assert not build_site.glob_to_regex("ACTIVE-WORK.md").match("Vault Operations/Done Log.md")


def test_check_detects_a_stale_file(monkeypatch, tmp_path):
    target = tmp_path / "data.json"
    monkeypatch.setattr(build_site, "TARGET", target)
    assert not build_site.is_current()
    target.write_text(build_site.render(), encoding="utf-8", newline="\n")
    assert build_site.is_current()
    target.write_text('{"files": {}}\n', encoding="utf-8", newline="\n")
    assert not build_site.is_current()


def test_the_written_file_is_current():
    assert build_site.is_current(), "run python scripts/build_site.py"


def test_the_search_field_is_length_preserving_and_folded():
    """A hit offset found in the folded field has to point at the same place in the original."""
    for entry in DATA["files"].values():
        assert len(entry["search"]) == len(entry["text"]), entry["path"]
    assert build_site.fold("Überblick, Größe, Café") == "uberblick, grosse, cafe".replace("ss", "s")
    assert build_site.fold("CLAUDE.md") == "claude.md"


def test_the_outline_carries_the_real_headings():
    outline = DATA["files"]["VAULT-OPERATIONS.md"]["outline"]
    assert outline[0] == {"level": 1, "text": "VAULT-OPERATIONS", "id": "vault-operations"}
    assert {"level": 2, "text": "Skill register", "id": "skill-register"} in outline
    # The anchor of a wikilink is the heading text, so its slug has to be the id of that heading.
    for entry in DATA["files"].values():
        for heading in entry["outline"]:
            assert heading["id"] == build_site.slugify(heading["text"])


def test_links_to_mirrors_linked_from():
    for rel, entry in DATA["files"].items():
        for target in entry["linksTo"]:
            assert rel in DATA["files"][target]["inbound"], f"{rel} -> {target}"
        for source in entry["inbound"]:
            assert rel in DATA["files"][source]["linksTo"], f"{source} -> {rel}"


def test_a_rule_step_carries_the_pattern_that_matched():
    task = next(t for t in DATA["tasks"] if t["id"] == "report-the-operational-state")
    rules = {step["path"]: step for step in task["steps"] if step["role"] == "rule"}
    assert rules[".claude/rules/active-work.md"]["pattern"] == "ACTIVE-WORK.md"
    assert rules[".claude/rules/documents.md"]["pattern"] == "**/*.md"
    for step in rules.values():
        assert build_site.glob_to_regex(step["pattern"]).match(step["matched"])
    for task in DATA["tasks"]:
        for step in task["steps"]:
            assert ("pattern" in step) and ("matched" in step)
            if step["role"] != "rule":
                assert step["pattern"] == "" and step["matched"] == ""
