"""Public publication boundaries and source fidelity use the maintained template."""

import json
from pathlib import Path

import build_demo
import demo_common
import sync_demo_core


def test_template_build_is_deterministic_and_sources_are_exact():
    first = build_demo.build()
    assert json.dumps(first, sort_keys=True) == json.dumps(build_demo.build(), sort_keys=True)
    sources = {item["path"]: item for item in first["sources"]}
    assert "HOME.md" in sources
    assert "ACTIVE-WORK.md" in sources
    assert all(not part.startswith(".") for path in sources for part in Path(path).parts)
    assert all(not path.startswith(("docs/", "demo/")) for path in sources)
    for path, record in sources.items():
        assert record["text"] == build_demo.read_text(build_demo.ROOT / path)
        assert record["revision"] == demo_common.revision_of(record["text"])
    for edge in first["knowledge"]["links"]:
        assert edge["quote"] == sources[edge["from"]]["text"].split("\n")[edge["line"] - 1]
        assert edge["to"] in sources
    for point in first["work"]["posten"]:
        assert point["typ"] == "Entscheidung"
        assert point["sourceType"] == "Decision"
        assert point["original"] in sources["ACTIVE-WORK.md"]["text"]
        assert point["frage"] in point["original"]
        assert point["kontext"] in point["original"]
    for project in first["work"]["eintraege"]:
        assert isinstance(project["kurzprofil"], list)
        assert project["kurzprofil"]
        assert all(paragraph in sources[project["notizPfad"]]["text"] for paragraph in project["kurzprofil"])


def test_ambiguous_project_name_is_not_guessed():
    records = build_demo.build()["sources"]
    project = next(item for item in records if item["path"].endswith("Project Overview Example Project.md"))
    duplicate = {**project, "path": "Other/Project Overview Example Project.md"}
    try:
        build_demo.work_data([*records, duplicate])
    except ValueError as error:
        assert "ambiguous" in str(error)
    else:
        raise AssertionError("Ambiguous project reference was accepted")


def test_untracked_and_private_sources_cannot_enter(monkeypatch):
    class Result:
        stdout = (
            b"HOME.md\0.local/private.md\0docs/data.md\0demo/input.md\0Vault Operations/Fixtures/Seed.md\0"
        )

    monkeypatch.setattr(build_demo.subprocess, "run", lambda *args, **kwargs: Result())
    assert build_demo.source_paths() == [build_demo.ROOT / "HOME.md"]


def test_public_ui_has_no_private_overlays_or_write_requests():
    core = build_demo.ROOT / "demo" / "core"
    assert {path.name for path in core.iterdir()} == set(sync_demo_core.ASSETS)
    for name in sync_demo_core.ASSETS:
        text = build_demo.read_text(core / name)
        assert "/api/answers" not in text
        assert "fetch(" not in text
        assert "experiment-data.js" not in text
        assert "experiment.html" not in text
    assert "point.sourceType === 'Decision' ? 'entscheidung'" in build_demo.read_text(core / "point-types.js")
    assert "const paths = {};" in build_demo.read_text(core / "project-marks.js")
    assert "const routine = Object.freeze({});" in build_demo.read_text(core / "progress.js")


def test_changed_private_overlay_boundary_aborts_before_copy():
    try:
        sync_demo_core.adapt("start.js", "const unreviewed = [];")
    except ValueError as error:
        assert "Review" in str(error)
    else:
        raise AssertionError("An unreviewed UI structure was accepted")


def test_stale_output_cannot_enter_a_later_publication(tmp_path):
    target = tmp_path / "docs" / "demo"
    target.mkdir(parents=True)
    (target / "obsolete.json").write_text("unreviewed old output", encoding="utf-8")
    try:
        build_demo.check_output(target, tmp_path)
    except ValueError as error:
        assert "obsolete.json" in str(error)
    else:
        raise AssertionError("Unreviewed stale output was accepted")
    assert (target / "obsolete.json").read_text(encoding="utf-8") == "unreviewed old output"


def test_output_directory_must_stay_under_docs(tmp_path):
    try:
        build_demo.check_output(tmp_path / "elsewhere", tmp_path)
    except ValueError as error:
        assert "docs/demo" in str(error)
    else:
        raise AssertionError("Output outside the declared directory was accepted")


def test_unmapped_type_requires_an_explicit_ui_contract():
    records = build_demo.build()["sources"]
    changed = [
        {
            **item,
            "text": item["text"].replace(
                "waiting-on-operator:: [Decision]", "waiting-on-operator:: [Unknown]"
            ),
        }
        if item["path"] == "ACTIVE-WORK.md"
        else item
        for item in records
    ]
    try:
        build_demo.work_data(changed)
    except ValueError as error:
        assert "response semantics" in str(error)
    else:
        raise AssertionError("An unknown decision type reached an unrelated response form")
