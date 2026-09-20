"""Copy the audited generic UI core into the public template.

Flat stdlib pipeline. Run with --ui-source pointing at the maintained UI checkout.
Only named source files enter this tree. Source snapshots, private reading aids,
project mappings and local-service writes are deliberately excluded.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ASSETS = (
    "start.html",
    "collective.html",
    "sources.html",
    "review.html",
    "fragen.html",
    "style.css",
    "shell.css",
    "overview.css",
    "work.css",
    "collective.css",
    "sources.css",
    "knowledge-map.css",
    "review.css",
    "project-relations.css",
    "source-previews.css",
    "start.js",
    "app.js",
    "collective.js",
    "collective-model.js",
    "sources.js",
    "knowledge-map.js",
    "context.js",
    "gemeinsam.js",
    "progress.js",
    "point-types.js",
    "project-marks.js",
    "project-relations.js",
    "source-previews.js",
    "review-state.js",
    "review-source.js",
    "review-store.js",
    "review.js",
    "fragen.js",
)
PRIVATE_MARKERS = (r"\bop-(?!example-)[a-z0-9-]+", r"C:[/\\]Users[/\\]", r"file:///")


def replace_region(text: str, start: str, end: str, replacement: str) -> str:
    if text.count(start) != 1 or text.count(end) != 1:
        raise ValueError(f"UI changed. Review the public adaptation at {start!r} before syncing.")
    first = text.index(start)
    last = text.index(end, first)
    return text[:first] + replacement + "\n\n" + text[last:]


def adapt(name: str, text: str) -> str:
    if name == "start.js":
        text = replace_region(
            text,
            "function projectIntroduction(",
            "function projectEssence(",
            "function projectIntroduction() { return null; }",
        )
        text = text.replace("Vollständiges Kurzprofil des Modelllabors", "Vollständiges Projektprofil")
        text = replace_region(
            text,
            "function projectStepDescription(",
            "const publicationProjects",
            """function projectStepDescription() { return null; }
function projectPointDescription(point) { return { title: projectPointTitle(point), detail: '' }; }
function projectPointTitle(point) { return point.frageKurz || titelVon(point); }""",
        )
        text = replace_region(
            text,
            "const publicationProjects",
            "function archiveRow(",
            """const publicationProjects = new Set();
function projectGroup(entry) {
  return entry.status === 'abgeschlossen' ? 'Abgeschlossen' : entry.bereich;
}""",
        )
    elif name == "app.js":
        text = replace_region(
            text,
            "function projektOberflaeche(",
            "const alterAnteil",
            "function projektOberflaeche() { return null; }",
        )
        text = replace_region(
            text,
            "function teilVorschau(",
            "function teileKnoten(",
            "function teilVorschau() { return null; }",
        )
        text = replace_region(
            text,
            "function empfohleneOption(",
            "function empfehlungBestaetigt(",
            "function empfohleneOption() { return null; }",
        )
        text = replace_region(
            text,
            "function uebergibAnEingang(",
            "async function schreibeUrteilJetzt(",
            """function uebergibAnEingang(id, answer, statusNode) {
  if (statusNode) statusNode.textContent = 'Demo-Antwort in diesem Browser gespeichert. '
    + 'Über Antworten exportieren kannst du sie sichern.';
}""",
        )
        text = re.sub(r"const EINBETTBAR = \[.*?\];", "const EINBETTBAR = [];", text)
        text = text.replace("'file:///', ", "")
    elif name == "point-types.js":
        text, count = re.subn(
            r"  const points = \{.*?\n  \};",
            """  const points = Object.fromEntries((window.PRUEFANSICHT?.posten || [])
    .map(point => [point.id, point.sourceType === 'Decision' ? 'entscheidung' : '']));""",
            text,
            flags=re.S,
        )
        if count != 1:
            raise ValueError("Review the public point type adapter.")
        text = text.replace(
            "  const vocabulary = {",
            "  const vocabulary = {\n    entscheidung: ['Entscheiden', 'entscheiden'],",
        )
        start = text.index("// Trial vocabulary:")
        end = text.index("window.POINT_TYPES", start)
        text = (
            text[:start]
            + "// Shape follows the point type explicitly recorded in the public template.\n"
            + text[end:]
        )
    elif name == "project-marks.js":
        text, count = re.subn(r"  const paths = \{.*?\n  \};", "  const paths = {};", text, flags=re.S)
        if count != 1:
            raise ValueError("Review the public identity mark adapter.")
    elif name == "progress.js":
        text, count = re.subn(
            r"  const routine = Object.freeze\(\{.*?\n  \}\);",
            "  const routine = Object.freeze({});",
            text,
            flags=re.S,
        )
        if count != 1:
            raise ValueError("Review the public response-state adapter.")
    elif name == "review.html":
        text = text.replace('<a href="experiment.html">Research-Persona-Belege</a>', "")
    elif name == "sources.js":
        original = "current.sourceUrl.startsWith('obsidian://open?')"
        if text.count(original) != 1:
            raise ValueError("Review the public source link adapter.")
        text = text.replace(
            original, "current.sourceUrl.startsWith('https://github.com/chpollin/second-brain-vault/blob/')"
        )
        text = text.replace("'In Obsidian öffnen'", "'Quelldatei auf GitHub'")
    elif name == "fragen.js":
        text = re.sub(
            r"fragen.html#frage=wirkung&projekt=[a-z-]+",
            "fragen.html#frage=wirkung&projekt=example-project",
            text,
        )
    if name.endswith(".html"):
        text = text.replace("</nav>", '<a href="../">Vorlage erkunden</a></nav>', 1)
        text = text.replace("<title>Second Brain", "<title>Second Brain Demo")
    for key in ("pruefansicht.", "second-brain.source-selection.", "second-brain.belegpruefungen."):
        text = text.replace(key, "second-brain-public-demo." + key)
    if any(re.search(marker, text, re.I) for marker in PRIVATE_MARKERS):
        raise ValueError(f"Private UI content remains in {name}; review before publishing.")
    return text


def sync(source: Path) -> dict:
    revision = subprocess.run(
        ["git", "-C", str(source), "rev-parse", "HEAD"], capture_output=True, text=True, check=True
    ).stdout.strip()
    rendered = {}
    hashes = {}
    for name in ASSETS:
        text = (source / name).read_text(encoding="utf-8")
        rendered[ROOT / "demo" / "core" / name] = adapt(name, text)
        hashes[name] = hashlib.sha256(text.encode()).hexdigest()
    for name, output in (("source_catalog.py", "demo_catalog.py"), ("knowledge_graph.py", "demo_graph.py")):
        text = (source / name).read_text(encoding="utf-8")
        hashes[name] = hashlib.sha256(text.encode()).hexdigest()
        text = text.replace("import make_data", "import demo_common").replace("make_data.", "demo_common.")
        text = text.replace("import source_catalog", "import demo_catalog").replace(
            "source_catalog.", "demo_catalog."
        )
        text = text.replace(
            "import demo_common\nimport demo_catalog", "import demo_catalog\nimport demo_common"
        )
        rendered[ROOT / "scripts" / output] = text
    provenance = {"upstream": "Second Brain UI", "revision": revision, "sourceHashes": hashes}
    # Validation finishes before any destination is replaced.
    for path, text in rendered.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8", newline="\n")
    (ROOT / "demo" / "upstream.json").write_text(json.dumps(provenance, indent=2) + "\n", encoding="utf-8")
    return provenance


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--ui-source", type=Path, required=True)
    args = parser.parse_args()
    sync(args.ui_source.resolve())
    print("OK synced the reviewed generic UI core")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
