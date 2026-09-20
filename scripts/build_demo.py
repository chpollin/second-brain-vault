"""Build the static work and knowledge demo exclusively from this public template.

Flat stdlib pipeline. Run python scripts/build_demo.py before serving docs/.
Tracked, visible Markdown files are the entire input boundary. No local vault,
repository history, profile, inbox or generated research snapshot is read.
"""

from __future__ import annotations

import html
import json
import re
import shutil
import subprocess
from pathlib import Path
from urllib.parse import quote

import demo_catalog
import demo_common
import demo_graph
from sync_demo_core import ASSETS

ROOT = Path(__file__).resolve().parent.parent
TARGET = ROOT / "docs" / "demo"
OUTPUT_FILES = frozenset((*ASSETS, "runtime.js", "index.html", "demo-data.json", "data.js", "sicht.js"))
POINT_TYPES = {"Decision": "Entscheidung"}


def check_output(target: Path, root: Path) -> None:
    if target.is_symlink() or target.resolve() != root.resolve() / "docs" / "demo":
        raise ValueError("Demo output must be the real docs/demo directory")
    if not target.exists():
        return
    for path in target.iterdir():
        if path.name not in OUTPUT_FILES or path.is_symlink() or not path.is_file():
            raise ValueError(f"Unreviewed file in demo output: {path.name}. Remove it before building.")


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8").replace("\r\n", "\n").replace("\r", "\n")


def safe_path(root: Path, relative: str) -> Path:
    parts = Path(relative).parts
    if not parts or any(part.startswith(".") for part in parts) or "\\" in relative or ":" in relative:
        raise ValueError("Invalid public source path")
    path = root / relative
    if path.is_symlink() or not path.resolve().is_relative_to(root.resolve()) or not path.is_file():
        raise ValueError("Public source leaves the template")
    if any(parent.is_symlink() for parent in path.parents if parent != root):
        raise ValueError("Linked public source directory")
    return path


def source_paths(root: Path = ROOT) -> list[Path]:
    output = subprocess.run(
        ["git", "-C", str(root), "ls-files", "-z", "--", "."], capture_output=True, check=True
    ).stdout.decode("utf-8")
    paths = []
    for relative in output.split("\0"):
        parts = Path(relative).parts
        if not relative.endswith(".md") or any(part.startswith(".") for part in parts):
            continue
        if parts[0] in {"docs", "demo"} or "Fixtures" in parts:
            continue
        paths.append(safe_path(root, relative))
    return sorted(paths)


def source_record(root: Path, path: Path) -> dict:
    text = read_text(path)
    relative = path.relative_to(root).as_posix()
    headings = [heading["title"] for heading in demo_catalog.heading_spans(text)]
    revision = demo_common.revision_of(text)
    return {
        "path": relative,
        "title": headings[0] if headings else path.stem,
        "headings": headings,
        "text": text,
        "revision": revision,
        "summary": demo_catalog.summary_section(text, revision),
        "sourceUrl": f"https://github.com/chpollin/second-brain-vault/blob/main/{quote(relative)}",
    }


def _unit(uid: str, kind: str, title: str, parent: str | None, responsibility: str | None) -> dict:
    return {
        "id": uid,
        "art": kind,
        "titel": title,
        "teilVon": parent,
        "amZug": responsibility,
        "herkunft": "workflow",
        "abhaengigkeitenStatus": "ungeklaert",
        "befunde": [],
    }


def work_data(records: list[dict]) -> dict:
    by_path = {item["path"]: item for item in records}
    source = by_path["ACTIVE-WORK.md"]
    text = source["text"]
    date = re.search(r"^updated: (\d{4}-\d{2}-\d{2})$", text, re.M)
    projects, points, units = [], [], []
    for match in re.finditer(
        r"^#### \[\[([^\]|]+)(?:\|([^\]]+))?\]\]\s*\n(.*?)(?=^#{1,4} |\Z)", text, re.M | re.S
    ):
        note, label, body = match.groups()
        fields = dict(re.findall(r"^([a-z_-]+):: (.*)$", body, re.M))
        pid = fields["project_id"]
        candidates = [item for item in records if item["path"] == note.removesuffix(".md") + ".md"]
        if not candidates and "/" not in note:
            candidates = [item for item in records if Path(item["path"]).stem == note.removesuffix(".md")]
        if len(candidates) != 1:
            raise ValueError(f"Unresolved or ambiguous public project note {note}")
        mapped = candidates[0]
        steps = re.findall(r"^→ (.+)$", body, re.M)
        project_points = []
        for question in re.finditer(r"^waiting-on-operator:: \[([^\]]+)\] (.+)\n\^([\w-]+)", body, re.M):
            kind, wording, anchor = question.groups()
            if kind not in POINT_TYPES:
                raise ValueError(
                    f"Unsupported template point type {kind}; define its response semantics first"
                )
            main, separator, context = wording.partition(" Context: ")
            original = question[0].split("\n")[0]
            point = {
                "id": anchor,
                "projekt": pid,
                "typ": POINT_TYPES[kind],
                "sourceType": kind,
                "frage": main,
                "frageKurz": "",
                "kontext": context if separator else "",
                "voraussetzung": "",
                "links": [],
                "anker": anchor,
                "quelleUrl": source["sourceUrl"],
                "seit": None,
                "original": original,
                "identitaetStabil": True,
                "revision": demo_common.revision_of({"original": original, "struktur": None}),
            }
            points.append(point)
            project_points.append(anchor)
            units.append(_unit(anchor, "punkt", main, pid, "du"))
        summary = mapped["summary"]
        project = {
            "id": pid,
            "name": label or note,
            "bereich": "Projects",
            "unterbereich": "",
            "kategorie": fields.get("category", ""),
            "status": {
                "active": "aktiv",
                "waiting": "wartend",
                "dormant": "ruhend",
                "completed": "abgeschlossen",
            }.get(fields.get("status"), fields.get("status", "")),
            "updated": fields.get("updated", ""),
            "stand": fields.get("state", ""),
            "ziele": fields.get("goals", ""),
            "wartetAuf": fields.get("waiting-on", ""),
            "wartetAufTitel": "",
            "wartetAufPunkte": [],
            "milestone": "",
            "invoice": "",
            "schritte": steps,
            "termine": [],
            "posten": project_points,
            "vaultUrl": mapped["sourceUrl"],
            "notizPfad": mapped["path"],
            "repoUrl": None,
            "repoUrls": [],
            "kurzprofil": [part.strip() for part in re.split(r"\n\s*\n", summary["text"]) if part.strip()]
            if summary
            else [],
            "pruefziele": [],
        }
        projects.append(project)
        units.append(_unit(pid, "eintrag", project["name"], None, None))
        units.extend(
            _unit(f"{pid}-s-{demo_common.revision_of(step)[:8]}", "schritt", step, pid, "offen")
            for step in steps
        )
    if not projects:
        raise ValueError("No template projects parsed; review the ACTIVE-WORK adapter")
    return {
        "stand": date[1] if date else None,
        "source": "ACTIVE-WORK.md",
        "sourceRevision": source["revision"],
        "snapshotRevision": demo_common.revision_of(projects),
        "archiveRevision": None,
        "eintraege": projects,
        "posten": points,
        "einheiten": units,
        "aussagen": [],
        "parteien": [],
        "verlauf": [],
        "typen": sorted({point["typ"] for point in points}),
        "formen": [],
        "warnings": [],
    }


def build(root: Path = ROOT) -> dict:
    paths = source_paths(root)
    records = [source_record(root, path) for path in paths]
    graph = demo_graph.build(
        root, paths, safe_path=safe_path, read_text=read_text, max_bytes=64 * 1024 * 1024
    )
    if graph["warnings"] or graph["truncated"]:
        raise ValueError("Incomplete public graph: " + " ".join(graph["warnings"]))
    return {
        "schema": "second-brain-public-demo-1",
        "work": work_data(records),
        "sources": records,
        "knowledge": graph,
        "provenance": {
            "template": "https://github.com/chpollin/second-brain-vault",
            "sourcesRevision": demo_common.revision_of(
                {record["path"]: record["revision"] for record in records}
            ),
            "ui": json.loads(read_text(root / "demo" / "upstream.json")),
        },
    }


def main() -> int:
    check_output(TARGET, ROOT)
    data = build()
    TARGET.mkdir(parents=True, exist_ok=True)
    core = ROOT / "demo" / "core"
    if {path.name for path in core.iterdir()} != set(ASSETS):
        raise ValueError("Generic UI core differs from the reviewed allowlist")
    for name in ASSETS:
        path = safe_path(ROOT, "demo/core/" + name)
        shutil.copyfile(path, TARGET / name)
    shutil.copyfile(ROOT / "demo" / "runtime.js", TARGET / "runtime.js")
    entry = "start.html#projekt=" + quote(data["work"]["eintraege"][0]["id"]) + "&fokus=projekt"
    (TARGET / "index.html").write_text(
        read_text(ROOT / "demo" / "index.html").replace("{{START_URL}}", html.escape(entry, quote=True)),
        encoding="utf-8",
        newline="\n",
    )
    (TARGET / "demo-data.json").write_text(
        json.dumps(data, ensure_ascii=False, sort_keys=True) + "\n", encoding="utf-8", newline="\n"
    )
    (TARGET / "data.js").write_text(
        "window.PRUEFANSICHT = " + json.dumps(data["work"], ensure_ascii=False) + ";\n",
        encoding="utf-8",
        newline="\n",
    )
    (TARGET / "sicht.js").write_text("window.SICHT = null;\n", encoding="utf-8")
    print("OK built public work and knowledge demo")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
