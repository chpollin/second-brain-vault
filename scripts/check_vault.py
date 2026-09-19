#!/usr/bin/env python3
"""Check the vault against its own rules.

Hard findings block a commit, measured findings are a work list (rule tiers in CLAUDE.md).
The rule values are read from their place of maintenance and never repeated here:
the required core from the convention on frontmatter field profiles, the tags from
TAG-TAXONOMY. A missing or unreadable rule source aborts with exit code 2, because a run
that checks nothing must not end as passed.

Usage:
    python scripts/check_vault.py              all checks, fixtures skipped
    python scripts/check_vault.py --hard       hard checks only (commit hook)
    python scripts/check_vault.py --integrity  links, anchors and reachability only
    python scripts/check_vault.py --fixtures   check only the fixture folder
    python scripts/check_vault.py --json       machine-readable result

Exit codes: 0 no hard finding, 1 hard finding, 2 configuration error.
Design decisions: standard library only, single file, the frontmatter parser covers the
flat subset the vault uses (scalars and inline lists) and is no YAML implementation.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

VAULT = Path(__file__).resolve().parent.parent
PROFILES = VAULT / "Vault Operations" / "Conventions" / "Convention Frontmatter Field Profiles.md"
TAXONOMY = VAULT / "TAG-TAXONOMY.md"
FIXTURES = "Vault Operations/Fixtures/"
# Not vault documents: repository knowledge, agent configuration, tooling, the generated site,
# local runs.
SKIP_DIRS = {".claude", ".git", ".local", ".obsidian", "docs", "knowledge", "scripts", "tests",
             "tools", "evals"}
SKIP_FILES = {"README.md", "LICENSE.md"}
CONCEPT_SECTIONS = ["Summary", "Sources", "Related"]

RE_LINK = re.compile(r"\[\[([^\]|#]*)(?:#([^\]|]*))?(?:\|[^\]]*)?\]\]")
RE_CODE = re.compile(r"```.*?```|`[^`\n]*`", re.S)
RE_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


class ConfigError(Exception):
    pass


def parse_flat_yaml(text: str) -> dict:
    data = {}
    for line in text.splitlines():
        if not line.strip() or line.lstrip().startswith("#") or ":" not in line:
            continue
        key, value = line.split(":", 1)
        value = value.strip()
        if value.startswith("[") and value.endswith("]"):
            data[key.strip()] = [v.strip().strip("'\"") for v in value[1:-1].split(",") if v.strip()]
        else:
            data[key.strip()] = value.strip("'\"")
    return data


def split_frontmatter(text: str) -> tuple[dict | None, str]:
    if not text.startswith("---\n"):
        return None, text
    end = text.find("\n---", 4)
    if end == -1:
        return None, text
    return parse_flat_yaml(text[4:end]), text[end + 4:]


def load_rules() -> dict:
    if not PROFILES.is_file():
        raise ConfigError(f"rule source missing: {PROFILES.name}")
    match = re.search(r"## Required core.*?```yaml\n(.*?)```", PROFILES.read_text(encoding="utf-8"), re.S)
    if not match:
        raise ConfigError("no yaml block under '## Required core' in the field profile convention")
    rules = parse_flat_yaml(match.group(1))
    for key in ("required", "type", "status", "tags_min", "tags_max"):
        if key not in rules:
            raise ConfigError(f"required core lacks '{key}'")
    if not TAXONOMY.is_file():
        raise ConfigError("rule source missing: TAG-TAXONOMY.md")
    # A tag counts as registered when it stands in backticks above the rules section.
    registry = TAXONOMY.read_text(encoding="utf-8").split("## Rules")[0]
    spans = re.findall(r"`([^`\n]+)`", registry)
    rules["tags"] = {t.strip() for span in spans for t in span.split(",") if t.strip()}
    if not rules["tags"]:
        raise ConfigError("TAG-TAXONOMY.md registers no tag")
    return rules


def collect(fixtures: bool) -> dict[str, Path]:
    docs = {}
    for path in sorted(VAULT.rglob("*.md")):
        rel = path.relative_to(VAULT).as_posix()
        folders = path.relative_to(VAULT).parts[:-1]
        if set(folders) & SKIP_DIRS or any(f.startswith(".") for f in folders) or rel in SKIP_FILES:
            continue
        if rel.startswith(FIXTURES) != fixtures:
            continue
        docs[rel] = path
    return docs


def anchors(body: str) -> set[str]:
    found = {h.strip() for h in re.findall(r"^#{1,6}\s+(.+?)\s*$", body, re.M)}
    return found | {"^" + b for b in re.findall(r"^\^([\w-]+)\s*$", body, re.M)}


def registers() -> list[tuple[str, str]]:
    """A skill or convention that exists on disk must stand in the document that enumerates it,
    otherwise an agent never learns that it exists."""
    found = []
    register = (VAULT / "VAULT-OPERATIONS.md").read_text(encoding="utf-8")
    for skill in sorted((VAULT / ".claude" / "skills").glob("*/SKILL.md")):
        name = skill.parent.name
        if f"| {name} |" not in register:
            found.append(("VAULT-OPERATIONS.md", f"skill '{name}' missing in the skill register"))
    index = (VAULT / "CLAUDE.md").read_text(encoding="utf-8")
    for convention in sorted((VAULT / "Vault Operations" / "Conventions").glob("*.md")):
        if f"[[{convention.stem}]]" not in index:
            found.append(("CLAUDE.md", f"'{convention.stem}' missing in the convention index"))
    return found


def check(fixtures: bool = False, hard_only: bool = False, integrity_only: bool = False) -> dict:
    rules = load_rules()
    docs = collect(fixtures)
    # Links may point outside the checked scope, so targets resolve against the whole vault.
    everything = {**collect(False), **collect(True)}
    by_stem = {Path(rel).stem: rel for rel in everything}
    texts = {rel: path.read_text(encoding="utf-8") for rel, path in everything.items()}
    hard, measured = [], []

    links: dict[str, set[str]] = {}
    for rel in docs:
        meta, body = split_frontmatter(texts[rel])
        plain = RE_CODE.sub("", body)
        links[rel] = set()
        for target, anchor in RE_LINK.findall(plain):
            target = target.strip() or Path(rel).stem
            if target not in by_stem:
                measured.append((rel, f"dead link [[{target}]]"))
                continue
            links[rel].add(by_stem[target])
            if anchor and anchor.strip() not in anchors(split_frontmatter(texts[by_stem[target]])[1]):
                measured.append((rel, f"dead anchor [[{target}#{anchor.strip()}]]"))
        if integrity_only:
            continue

        if meta is None:
            hard.append((rel, "no frontmatter"))
            continue
        for field in rules["required"]:
            optional = field == "status" and meta.get("type") in rules.get("status_optional_for", [])
            if field not in meta and not optional:
                hard.append((rel, f"required field '{field}' missing"))
        if "type" in meta and meta["type"] not in rules["type"]:
            hard.append((rel, f"type '{meta['type']}' not in the closed vocabulary"))
        if "status" in meta and meta["status"] not in rules["status"]:
            hard.append((rel, f"status '{meta['status']}' not in the closed vocabulary"))
        if "created" in meta and not RE_DATE.match(str(meta["created"])):
            hard.append((rel, "created is not an ISO date"))
        tags = meta.get("tags", [])
        for tag in tags if isinstance(tags, list) else [tags]:
            if tag not in rules["tags"]:
                hard.append((rel, f"tag '{tag}' not registered in TAG-TAXONOMY"))
        if hard_only:
            continue

        if isinstance(tags, list) and not int(rules["tags_min"]) <= len(tags) <= int(rules["tags_max"]):
            measured.append((rel, f"{len(tags)} tags, expected {rules['tags_min']} to {rules['tags_max']}"))
        first = re.search(r"^#\s+(.+?)\s*$", body, re.M)
        if not first or not first.group(1).startswith(Path(rel).stem):
            measured.append((rel, "first heading does not begin with the filename"))
        if meta.get("type") == "concept":
            heads = anchors(body)
            for section in CONCEPT_SECTIONS:
                if section not in heads:
                    measured.append((rel, f"concept note lacks '## {section}'"))
            sources = re.search(r"^## Sources\s*$(.*?)(?=^## |\Z)", body, re.M | re.S)
            if sources and len(re.findall(r"^- ", sources.group(1), re.M)) < 3:
                measured.append((rel, "fewer than three sources"))

    if not hard_only and not fixtures:
        if "HOME.md" not in docs:
            raise ConfigError("HOME.md missing, reachability cannot be checked")
        seen, queue = {"HOME.md"}, ["HOME.md"]
        while queue:
            for nxt in links.get(queue.pop(), ()):
                if nxt in docs and nxt not in seen:
                    seen.add(nxt)
                    queue.append(nxt)
        measured += [(rel, "not reachable from HOME") for rel in docs if rel not in seen]
        measured += registers()

    if not fixtures and not integrity_only:
        sys.path.insert(0, str(Path(__file__).resolve().parent))
        import build_site
        import render_agents_md
        if not render_agents_md.is_current():
            hard.append(("AGENTS.md", "stale, run python scripts/render_agents_md.py"))
        if not build_site.is_current():
            hard.append(("docs/data.json", "stale, run python scripts/build_site.py"))

    return {"checked": len(docs), "hard": hard, "measured": measured}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--hard", action="store_true")
    parser.add_argument("--integrity", action="store_true")
    parser.add_argument("--fixtures", action="store_true")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()
    try:
        result = check(args.fixtures, args.hard, args.integrity)
    except ConfigError as err:
        print(f"configuration error: {err}", file=sys.stderr)
        return 2
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(f"{result['checked']} documents checked")
        for tier in ("hard", "measured"):
            print(f"{tier}: {len(result[tier])}")
            for rel, message in result[tier]:
                print(f"  {rel}: {message}")
    return 1 if result["hard"] else 0


if __name__ == "__main__":
    sys.exit(main())
