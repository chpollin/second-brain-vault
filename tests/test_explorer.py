"""Evidence and publication-boundary checks for the synthetic explorer."""

from pathlib import Path

import pytest
from build_explorer import build, normalize_search

EXAMPLE = Path(__file__).resolve().parent.parent / "docs" / "example"


def test_real_example_relation_retains_original_passage() -> None:
    data = build()
    source = "example/Data Management/Decision Image Master Format.md"
    target = "example/Data Management/Archival Master.md"
    link = next(link for link in data["links"] if (link["source"], link["target"]) == (source, target))
    occurrence = link["occurrences"][0]
    lines = (
        (EXAMPLE / "Data Management/Decision Image Master Format.md").read_text(encoding="utf-8").splitlines()
    )
    assert occurrence["excerpt"] == lines[occurrence["line"] - 1].strip()
    assert occurrence["raw"] == "[[Archival Master]]"
    assert "full information of the scan" in occurrence["excerpt"]
    assert {node["id"] for node in data["nodes"]} == {
        "example/" + path.relative_to(EXAMPLE).as_posix() for path in EXAMPLE.rglob("*.md")
    }
    assert data["provenance"]["synthetic"] is True
    assert [(item["target"], item["reason"]) for item in data["unresolved"]] == [
        ("ACTIVE-WORK", "outside-example")
    ]


def test_deterministic_payload_and_components_partition_notes() -> None:
    first = build()
    assert first == build()
    assert sorted(node for component in first["components"] for node in component) == sorted(
        node["id"] for node in first["nodes"]
    )


def test_parser_handles_links_without_turning_code_into_evidence(tmp_path: Path) -> None:
    """Inline corpus exercises syntax absent from the real example, not a mock dataset."""
    (tmp_path / "A.md").write_text(
        "---\ntype: concept\n---\n# A\n[[B#Grounds|evidence]] and [[B]]\n"
        "`[[Missing inline]]`\n```md\n[[Missing fenced]]\n```\n"
        "~~~md\n[[Missing tilde]]\n~~~\n<!-- [[Missing comment]] -->\n"
        "[[Missing real]]\n[[#A]]\n",
        encoding="utf-8",
    )
    (tmp_path / "B.md").write_text("# B\n", encoding="utf-8")
    data = build(tmp_path)
    edge = next(link for link in data["links"] if link["target"] == "example/B.md")
    assert [item["raw"] for item in edge["occurrences"]] == ["[[B#Grounds|evidence]]", "[[B]]"]
    assert [item["line"] for item in edge["occurrences"]] == [5, 5]
    assert [item["target"] for item in data["unresolved"]] == ["Missing real"]
    assert any(link["source"] == link["target"] for link in data["links"])


def test_ambiguous_basename_is_unresolved(tmp_path: Path) -> None:
    """Duplicate note names are a boundary case absent from the real example."""
    for folder in ("One", "Two"):
        (tmp_path / folder).mkdir()
        (tmp_path / folder / "B.md").write_text("# B", encoding="utf-8")
    (tmp_path / "A.md").write_text("# A\n[[B]] and [[One/B]]", encoding="utf-8")
    data = build(tmp_path)
    assert data["unresolved"][0]["reason"] == "ambiguous"
    assert data["links"][0]["target"] == "example/One/B.md"


def test_bad_input_refuses_partial_output(tmp_path: Path) -> None:
    (tmp_path / "Bad.md").write_text("---\nunclosed", encoding="utf-8")
    (tmp_path / "Good.md").write_text("# Good", encoding="utf-8")
    with pytest.raises(ValueError, match="Bad.md"):
        build(tmp_path)


def test_search_normalization() -> None:
    assert normalize_search("ÜBER Straße und Café") == "ueber strasse und cafe"
