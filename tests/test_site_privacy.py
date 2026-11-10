"""The public site serves template material and the synthetic example domain only.

Checks the built explorer data, so run build_explorer.py first, as the Pages workflow does.
"""

import json
import re
from pathlib import Path

DOCS = Path(__file__).resolve().parent.parent / "docs"
SERVED = {".json", ".md", ".html", ".js", ".css"}
# Local home paths and the names of the owner's private working repositories must never reach
# the site. The template's own documented default `.local/persona/` is public text and allowed.
FORBIDDEN = re.compile(
    r"[A-Za-z]:[\\/]+Users[\\/]|/home/\w|knowledge-structures|active-work-ui|pruefansicht", re.I
)
EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+")


def served_texts():
    for path in sorted(DOCS.rglob("*")):
        if path.is_file() and path.suffix in SERVED and "demo" not in path.parts:
            yield path, path.read_text(encoding="utf-8")


def test_no_knowledge_folder_is_served():
    assert not (DOCS / "knowledge").exists()
    data = json.loads((DOCS / "explorer.json").read_text(encoding="utf-8"))
    assert not [node["id"] for node in data["nodes"] if node["id"].startswith("knowledge/")]


def test_no_private_trace_in_served_files():
    leaks = []
    for path, text in served_texts():
        match = FORBIDDEN.search(text)
        if match:
            leaks.append((path.name, match.group(0)))
    assert leaks == []


def test_no_email_address_in_example_or_explorer_data():
    found = []
    for path in [DOCS / "explorer.json", *sorted((DOCS / "example").rglob("*.md"))]:
        match = EMAIL.search(path.read_text(encoding="utf-8"))
        if match:
            found.append((path.name, match.group(0)))
    assert found == []
