#!/usr/bin/env python3
"""Build the synthetic knowledge explorer payload in the flat script pipeline.

Only docs/example Markdown enters docs/explorer.json. Literal directed wikilinks
carry their original line and excerpt; topology never asserts semantic relations.
The browser reads this deterministic artifact without accessing a personal vault.
See knowledge/design.md for the explorer's interaction and interpretation limits.
Run python scripts/build_explorer.py, or add --check to detect a stale artifact.
The existing stdlib pipeline and frontmatter parser are retained deliberately.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path

from build_site import RE_LINK, read_text, split_frontmatter

ROOT = Path(__file__).resolve().parent.parent
EXAMPLE = ROOT / "docs" / "example"
TARGET = ROOT / "docs" / "explorer.json"


def normalize_search(text: str) -> str:
    text = text.lower().translate(str.maketrans({"ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss"}))
    return "".join(char for char in unicodedata.normalize("NFD", text) if not unicodedata.combining(char))


def _mask_nonlinks(text: str) -> str:
    """Keep offsets intact while ignoring frontmatter, comments and code examples."""
    masked = text
    if text.startswith("---\n"):
        end = text.find("\n---", 4)
        if end < 0:
            raise ValueError("Unclosed frontmatter")
        masked = re.sub(r"[^\n]", " ", text[: end + 4]) + text[end + 4 :]
    patterns = (r"<!--.*?-->", r"(?m)^\s*(`{3,}|~{3,})[^\n]*\n.*?^\s*\1\s*$", r"(`+)[^`\n]*?\1")
    for pattern in patterns:
        masked = re.sub(pattern, lambda match: re.sub(r"[^\n]", " ", match[0]), masked, flags=re.S)
    return masked


def _resolve(target: str, source: str, ids: set[str], stems: dict[str, list[str]]) -> tuple[str, str]:
    target = target.strip().removesuffix(".md")
    if not target:
        return source, ""
    candidates = [target + ".md", "example/" + target + ".md"]
    for candidate in candidates:
        if candidate in ids:
            return candidate, ""
    matches = stems.get(target, [])
    if len(matches) == 1:
        return matches[0], ""
    if matches:
        return "", "ambiguous"
    if target in {"HOME", "ACTIVE-WORK", "VAULT-OPERATIONS", "TAG-TAXONOMY", "CLAUDE", "AGENTS"}:
        return "", "outside-example"
    return "", "missing"


def _components(ids: set[str], links: list[dict]) -> list[list[str]]:
    adjacent = {node: set() for node in ids}
    for link in links:
        adjacent[link["source"]].add(link["target"])
        adjacent[link["target"]].add(link["source"])
    remaining = set(ids)
    components = []
    while remaining:
        pending = [min(remaining)]
        found = set()
        while pending:
            node = pending.pop()
            if node not in found:
                found.add(node)
                pending.extend(sorted(adjacent[node] - found))
        components.append(sorted(found))
        remaining -= found
    return sorted(components, key=lambda component: (-len(component), component[0]))


def build(example: Path = EXAMPLE) -> dict:
    """Collect every input error before refusing to publish a partial dataset."""
    paths = sorted(example.rglob("*.md"))
    if not paths:
        raise FileNotFoundError(f"No example Markdown in {example}; restore docs/example first")
    nodes = []
    texts = {}
    errors = []
    digest = hashlib.sha256()
    for path in paths:
        rel = "example/" + path.relative_to(example).as_posix()
        try:
            text = read_text(path)
            fields, body = split_frontmatter(text)
            _mask_nonlinks(text)
            metadata = dict(fields)
            nodes.append(
                {
                    "id": rel,
                    "path": rel,
                    "title": path.stem,
                    "domain": path.relative_to(example).parts[0],
                    "type": metadata.get("type", ""),
                    "status": metadata.get("status", ""),
                    "body": body.strip(),
                    "search": normalize_search(path.stem + " " + rel + " " + body),
                }
            )
            texts[rel] = text
            digest.update(rel.encode("utf-8") + b"\0" + text.encode("utf-8") + b"\0")
        except (OSError, UnicodeError, ValueError) as error:
            errors.append({"path": rel, "error": str(error)})
    if errors:
        raise ValueError("Example input errors: " + json.dumps(errors, ensure_ascii=False))
    ids = set(texts)
    stems = defaultdict(list)
    for node in nodes:
        stems[node["title"]].append(node["id"])
    linked = defaultdict(list)
    unresolved = defaultdict(list)
    for source, text in texts.items():
        original_lines = text.splitlines()
        for match in RE_LINK.finditer(_mask_nonlinks(text)):
            target, reason = _resolve(match[1], source, ids, stems)
            line = text.count("\n", 0, match.start()) + 1
            occurrence = {
                "line": line,
                "excerpt": original_lines[line - 1].strip(),
                "raw": text[match.start() : match.end()],
            }
            if target:
                linked[(source, target)].append(occurrence)
            else:
                unresolved[(source, match[1].strip(), reason)].append(occurrence)
    links = [
        {"source": source, "target": target, "occurrences": occurrences}
        for (source, target), occurrences in sorted(linked.items())
    ]
    missing = [
        {"source": source, "target": target, "reason": reason, "occurrences": occurrences}
        for (source, target, reason), occurrences in sorted(unresolved.items())
    ]
    return {
        "schemaVersion": 1,
        "provenance": {
            "synthetic": True,
            "source": "docs/example/",
            "method": (
                "Literal directed wikilinks; connected components ignore direction. "
                "No inferred semantic relations."
            ),
            "sourceChecksum": digest.hexdigest(),
        },
        "nodes": nodes,
        "links": links,
        "unresolved": missing,
        "components": _components(ids, links),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Fail if the generated payload is stale")
    args = parser.parse_args()
    try:
        content = json.dumps(build(), ensure_ascii=False, indent=2) + "\n"
        if args.check:
            if not TARGET.exists() or read_text(TARGET) != content:
                print("FEHLER: docs/explorer.json is stale; run scripts/build_explorer.py", file=sys.stderr)
                return 1
        else:
            temporary = TARGET.with_suffix(".json.tmp")
            temporary.write_text(content, encoding="utf-8", newline="\n")
            temporary.replace(TARGET)
            print("OK: built docs/explorer.json from synthetic example notes")
    except (OSError, ValueError) as error:
        print(f"FEHLER: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
    raise SystemExit(main())
