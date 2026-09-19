#!/usr/bin/env python3
"""Generate AGENTS.md from CLAUDE.md, so both agent families read the same rules.

AGENTS.md is never edited by hand. The only differences to CLAUDE.md are the first heading
and the paragraph that explains the relation of the two files.

Usage:
    python scripts/render_agents_md.py          write AGENTS.md
    python scripts/render_agents_md.py --check  exit 1 when AGENTS.md is stale
"""
from __future__ import annotations

import sys
from pathlib import Path

VAULT = Path(__file__).resolve().parent.parent
SOURCE = VAULT / "CLAUDE.md"
TARGET = VAULT / "AGENTS.md"
RELATION_MARK = "[[AGENTS]] is generated from this file"
RELATION_TEXT = (
    "This file is generated from [[CLAUDE]] and carries the same rules for agents that do not "
    "read a CLAUDE.md. Never edit it by hand. Change [[CLAUDE]] and run "
    "`python scripts/render_agents_md.py`."
)


def render() -> str:
    text = SOURCE.read_text(encoding="utf-8")
    if text.count("\n# CLAUDE\n") != 1:
        raise SystemExit("CLAUDE.md must carry exactly one first heading '# CLAUDE'")
    paragraphs = text.split("\n\n")
    hits = [i for i, p in enumerate(paragraphs) if p.startswith(RELATION_MARK)]
    if len(hits) != 1:
        raise SystemExit("CLAUDE.md must carry exactly one paragraph that starts with: " + RELATION_MARK)
    paragraphs[hits[0]] = RELATION_TEXT
    return "\n\n".join(paragraphs).replace("\n# CLAUDE\n", "\n# AGENTS\n").replace(
        "query-topics: [claude,", "query-topics: [agents,")


def is_current() -> bool:
    return TARGET.is_file() and TARGET.read_text(encoding="utf-8") == render()


if __name__ == "__main__":
    if "--check" in sys.argv:
        sys.exit(0 if is_current() else 1)
    TARGET.write_text(render(), encoding="utf-8", newline="\n")
    print("AGENTS.md written")
