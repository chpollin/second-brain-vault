"""The public site serves template material and the synthetic example domain only.

Checks the built site data, so run build_site.py and build_graph.py first, as the Pages
workflow does.
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
    data = json.loads((DOCS / "data.json").read_text(encoding="utf-8"))
    assert not [path for path in data["files"] if path.startswith("knowledge/")]


def test_no_private_trace_in_served_files():
    leaks = []
    for path, text in served_texts():
        match = FORBIDDEN.search(text)
        if match:
            leaks.append((path.name, match.group(0)))
    assert leaks == []


def test_no_email_address_in_example_or_graph_data():
    found = []
    for path in [DOCS / "graph.json", *sorted((DOCS / "example").rglob("*.md"))]:
        match = EMAIL.search(path.read_text(encoding="utf-8"))
        if match:
            found.append((path.name, match.group(0)))
    assert found == []
