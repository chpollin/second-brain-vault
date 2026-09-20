#!/usr/bin/env python3
"""Build docs/data.json for the static explorer of this template.

Nothing about the vault is written into the interface by hand. The tree, the texts, the link
graph, the loading layer per file and the task traces are derived from the real files: the task
table of VAULT-OPERATIONS.md, the `paths:` headers of the rule files, and the `## Reads` and
`## Verification` sections of the skills.

Usage:
    python scripts/build_site.py          write docs/data.json
    python scripts/build_site.py --check  exit 1 when docs/data.json is stale

Exit codes: 0 written or current, 1 stale under --check.
Design decisions: standard library only, single file, and deterministic output (sorted keys,
stable order, LF, no timestamps) so that the currency check does not flap across platforms.
"""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path

VAULT = Path(__file__).resolve().parent.parent
TARGET = VAULT / "docs" / "data.json"
OPERATIONS = VAULT / "VAULT-OPERATIONS.md"
RULES_DIR = VAULT / ".claude" / "rules"
SKILLS_DIR = VAULT / ".claude" / "skills"

SKIP_DIRS = {".git", ".obsidian", ".local", ".venv", ".pytest_cache", ".ruff_cache", "__pycache__", "docs"}
KIND_BY_SUFFIX = {".md": "markdown", ".py": "python", ".toml": "toml"}
KIND_BY_NAME = {"pre-commit": "shell", ".gitignore": "text"}
ABOUT_FILES = {"README.md", "LICENSE.md", "pyproject.toml", ".gitignore"}

# The legend of the tree. How a file reaches an agent is the vocabulary of this interface and not
# a statement about vault content, so the labels stand here and the membership is derived below.
LAYERS = [
    ["always", "Session instructions", "read CLAUDE.md or AGENTS.md at session start"],
    ["by-path", "Rules by scope", "Claude Code loads matching rules; other agents read them explicitly"],
    ["on-demand", "Read on demand", "loads when a task names it"],
    ["content", "Vault content", "the notes themselves"],
    ["checks", "Checks", "run, not read"],
    ["fixtures", "Test field", "seeded defects, checked on request"],
    ["about", "About the template", "read by the person who clones it"],
]

RE_LINK = re.compile(r"\[\[([^\]|#]*)(?:#([^\]|]*))?(?:\|([^\]]*))?\]\]")
RE_CODE = re.compile(r"```.*?```|`[^`\n]*`", re.S)
RE_HEADING = re.compile(r"^#{1,6}\s+(.+?)\s*$", re.M)
RE_BLOCK_ID = re.compile(r"^\^([\w-]+)\s*$", re.M)
RE_SKILL = re.compile(r"skill `([\w-]+)`")
RE_MODE = re.compile(r"mode (\w+)((?: for [^,]*)?)")
RE_CHECK_CMD = re.compile(r"python (scripts/[\w_]+\.py[\w \-]*)")
# A path in a Reads bullet stands in backticks and carries a file suffix, which separates it from
# a folder such as `knowledge/` or an inline field name in the same sentence.
RE_READ_PATH = re.compile(r"`([^`\n]+\.(?:md|py|toml|json))(#[^`\n]*)?`")


def read_text(path: Path) -> str:
    """Git converts line endings in the working copy, so every comparison runs on LF text."""
    return path.read_text(encoding="utf-8").replace("\r\n", "\n").replace("\r", "\n")


def kind_of(path: Path) -> str | None:
    return KIND_BY_NAME.get(path.name) or KIND_BY_SUFFIX.get(path.suffix)


def layer_of(rel: str) -> str:
    if rel in ("CLAUDE.md", "AGENTS.md"):
        return "always"
    if rel.startswith(".claude/rules/"):
        return "by-path"
    if rel.startswith((".claude/skills/", "Vault Operations/Conventions/")):
        return "on-demand"
    if rel.startswith("Vault Operations/Fixtures/"):
        return "fixtures"
    if rel.startswith(("scripts/", "tests/")):
        return "checks"
    if rel in ABOUT_FILES or rel.startswith("knowledge/"):
        return "about"
    return "content"


def parse_frontmatter(block: str) -> list[list[str]]:
    """Flat subset of YAML: scalars, inline lists, folded scalars and block lists, no more."""
    fields: list[list[str]] = []
    lines = block.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i]
        i += 1
        if not line.strip() or line.startswith(" ") or ":" not in line:
            continue
        key, value = line.split(":", 1)
        value = value.strip()
        items = []
        while i < len(lines) and (lines[i].startswith("  ") or not lines[i].strip()):
            follow = lines[i].strip()
            i += 1
            if follow.startswith("- "):
                items.append(follow[2:].strip().strip("\"'"))
            elif follow:
                items.append(follow)
        if value in (">", "|", ">-", "|-"):
            value = " ".join(items)
        elif items:
            value = ", ".join(items)
        fields.append([key.strip(), value])
    return fields


def split_frontmatter(text: str) -> tuple[list[list[str]], str]:
    if not text.startswith("---\n"):
        return [], text
    end = text.find("\n---", 4)
    if end == -1:
        return [], text
    return parse_frontmatter(text[4:end]), text[end + 4 :]


def field(fields: list[list[str]], name: str) -> str:
    return next((value for key, value in fields if key == name), "")


def section(body: str, heading: str) -> str:
    match = re.search(rf"^##\s+{re.escape(heading)}\s*$(.*?)(?=^## |\Z)", body, re.M | re.S)
    return match.group(1) if match else ""


def first_paragraph(body: str) -> str:
    for block in body.split("\n\n"):
        block = block.strip()
        if block and not block.startswith(("#", "|", "-", ">", "`")):
            return " ".join(block.split())
    return ""


def first_sentence(text: str) -> str:
    text = " ".join(text.split())
    match = re.match(r".*?[.!?](?=\s|$)", text)
    return match.group(0) if match else text


def sentence_with(text: str, needle: str) -> str:
    for sentence in re.split(r"(?<=[.!?])\s+", " ".join(text.split())):
        if needle in sentence:
            return sentence
    return ""


def glob_to_regex(pattern: str) -> re.Pattern[str]:
    """`**/` stands for any number of leading segments including none, so `**/*.md` also matches a
    file in the root. fnmatch cannot express that, because its `*` crosses separators."""
    out, i = [], 0
    while i < len(pattern):
        if pattern.startswith("**/", i):
            out.append(r"(?:[^/]+/)*")
            i += 3
        elif pattern[i] == "*":
            out.append(r"[^/]*")
            i += 1
        elif pattern[i] == "?":
            out.append(r"[^/]")
            i += 1
        else:
            out.append(re.escape(pattern[i]))
            i += 1
    return re.compile("".join(out) + r"\Z")


def anchors_of(body: str) -> list[str]:
    found = [h.strip() for h in RE_HEADING.findall(body)]
    return sorted(set(found) | {"^" + b for b in RE_BLOCK_ID.findall(body)})


def slugify(text: str) -> str:
    """The heading id of the interface. The same rule stands in docs/markdown.js, because a
    wikilink anchor is the heading text and has to reach the element the renderer wrote."""
    return re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", text.lower()))


def outline_of(body: str) -> list[dict]:
    return [
        {"level": len(hashes), "text": text.strip(), "id": slugify(text.strip())}
        for hashes, text in re.findall(r"^(#{1,6})\s+(.+?)\s*$", body, re.M)
    ]


def fold(text: str) -> str:
    """Case and diacritic folding for the search field, one character in and one character out, so
    that a hit offset in the folded text also holds in the original and the snippet stays exact."""
    out = []
    for char in text:
        lowered = char.lower()
        if len(lowered) != 1:
            out.append(char)
            continue
        if lowered == "ß":
            out.append("s")
            continue
        stripped = "".join(c for c in unicodedata.normalize("NFD", lowered) if not unicodedata.combining(c))
        out.append(stripped if len(stripped) == 1 else lowered)
    return "".join(out)


def collect_files() -> dict[str, Path]:
    files = {}
    for path in sorted(VAULT.rglob("*")):
        if not path.is_file() or set(path.relative_to(VAULT).parts[:-1]) & SKIP_DIRS:
            continue
        if kind_of(path):
            files[path.relative_to(VAULT).as_posix()] = path
    return files


def build_files(paths: dict[str, Path]) -> tuple[dict[str, dict], dict[str, str]]:
    stems: dict[str, str] = {}
    for rel in paths:
        if rel.endswith(".md"):
            stem = Path(rel).stem
            # A stem such as SKILL occurs several times; the shallowest path wins, deterministically.
            if stem not in stems or rel.count("/") < stems[stem].count("/"):
                stems[stem] = rel

    files: dict[str, dict] = {}
    for rel, path in paths.items():
        text = read_text(path)
        fields, body = split_frontmatter(text) if rel.endswith(".md") else ([], text)
        heading = RE_HEADING.search(body) if rel.endswith(".md") else None
        entry = {
            "path": rel,
            "layer": layer_of(rel),
            "kind": kind_of(path),
            "title": heading.group(1).strip() if heading else Path(rel).name,
            "frontmatter": fields,
            "text": text,
            "anchors": anchors_of(body) if rel.endswith(".md") else [],
            "outline": outline_of(body) if rel.endswith(".md") else [],
            "search": fold(text),
            "links": [],
            "linksTo": [],
            "inbound": [],
        }
        if rel.endswith(".md"):
            seen = set()
            for target, anchor, alias in RE_LINK.findall(RE_CODE.sub("", body)):
                target = target.strip() or Path(rel).stem
                key = (target, anchor.strip())
                if key in seen:
                    continue
                seen.add(key)
                entry["links"].append(
                    {
                        "target": target,
                        "anchor": anchor.strip(),
                        "alias": alias.strip(),
                        "path": stems.get(target, ""),
                    }
                )
        files[rel] = entry

    for rel, entry in files.items():
        for link in entry["links"]:
            if link["path"] and link["path"] != rel:
                if rel not in files[link["path"]]["inbound"]:
                    files[link["path"]]["inbound"].append(rel)
                if link["path"] not in entry["linksTo"]:
                    entry["linksTo"].append(link["path"])
    for entry in files.values():
        entry["inbound"].sort()
        entry["linksTo"].sort()
    return files, stems


def rule_steps(files: dict[str, dict], reads: list[dict]) -> list[dict]:
    """Match rule scope to skill Reads, regardless of automatic or explicit rule loading."""
    steps = []
    for rel in sorted(r for r in files if r.startswith(".claude/rules/")):
        fields, body = split_frontmatter(files[rel]["text"])
        patterns = [p.strip() for p in field(fields, "paths").split(",") if p.strip()]
        for pattern in patterns:
            matches = sorted(r["path"] for r in reads if glob_to_regex(pattern).match(r["path"]))
            if matches:
                # Name a document of the task rather than a rule file, which would read circular.
                example = next((m for m in matches if not m.startswith(".claude/rules/")), matches[0])
                steps.append(
                    {
                        "path": rel,
                        "anchor": "",
                        "role": "rule",
                        "why": first_sentence(first_paragraph(body)),
                        # The interface shows the match itself, so pattern and example stay separate
                        # fields instead of being buried in a sentence.
                        "pattern": pattern,
                        "matched": example,
                        "present": True,
                    }
                )
                break
    return steps


def read_steps(skill_body: str) -> list[dict]:
    steps, seen = [], set()
    for line in section(skill_body, "Reads").split("\n"):
        stripped = line.strip()
        if not re.match(r"^(?:[-*]|\d+\.)\s", stripped):
            continue
        why = " ".join(re.sub(r"^(?:[-*]|\d+\.)\s+", "", stripped).replace("`", "").split())
        for path, anchor in RE_READ_PATH.findall(stripped):
            if path in seen:
                continue
            seen.add(path)
            steps.append(
                {"path": path, "anchor": anchor.lstrip("#"), "role": "reads", "why": why, "present": True}
            )
    return steps


def check_step(skill_rel: str, skill_body: str) -> dict:
    verification = section(skill_body, "Verification")
    commands = RE_CHECK_CMD.findall(verification)
    if commands:
        script = commands[0].split()[0]
        why = "Closes the work: " + ", ".join(f"python {c}" for c in dict.fromkeys(commands)) + "."
        return {"path": script, "anchor": "", "role": "check", "why": why, "present": True}
    # A skill whose verification is judgement rather than a command closes on its own criteria.
    return {
        "path": skill_rel,
        "anchor": "Verification",
        "role": "check",
        "why": "Closes the work without a command. "
        + first_sentence(first_paragraph(verification)).replace("`", ""),
        "present": True,
    }


def build_tasks(files: dict[str, dict]) -> list[dict]:
    rows, seen_separator = [], False
    for line in section(read_text(OPERATIONS), "Task types").split("\n"):
        if not line.startswith("|"):
            continue
        if set(line) <= set("|- "):
            seen_separator = True
            continue
        if seen_separator:
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if len(cells) >= 2:
                rows.append((cells[0], cells[1]))

    claude = read_text(VAULT / "CLAUDE.md")
    constitution = {
        "path": "CLAUDE.md",
        "anchor": "How rules load",
        "role": "constitution",
        "why": sentence_with(claude, "always loaded"),
        "present": True,
    }
    tasks = []
    for task, procedure in rows:
        skill_match = RE_SKILL.search(procedure)
        if not skill_match:
            continue
        name = skill_match.group(1)
        skill_rel = f".claude/skills/{name}/SKILL.md"
        skill_body = split_frontmatter(files[skill_rel]["text"])[1] if skill_rel in files else ""
        steps = [dict(constitution)]
        reads = read_steps(skill_body)
        steps += rule_steps(files, reads)
        steps.append(
            {
                "path": skill_rel,
                "anchor": "",
                "role": "skill",
                "why": first_paragraph(skill_body),
                "present": skill_rel in files,
            }
        )
        for mode, qualifier in RE_MODE.findall(procedure):
            mode_rel = f".claude/skills/{name}/references/{mode}.md"
            mode_body = files[mode_rel]["text"] if mode_rel in files else ""
            steps.append(
                {
                    "path": mode_rel,
                    "anchor": "",
                    "role": "mode",
                    "why": f"Mode {mode}{qualifier}. {first_paragraph(mode_body)}".strip(),
                    "present": mode_rel in files,
                }
            )
        taken = {step["path"] for step in steps}
        for step in reads:
            if step["path"] not in taken:
                step["present"] = step["path"] in files
                steps.append(step)
                taken.add(step["path"])
        steps.append(check_step(skill_rel, skill_body))
        for step in steps:
            step.setdefault("pattern", "")
            step.setdefault("matched", "")
        tasks.append(
            {
                "id": re.sub(r"[^a-z0-9]+", "-", task.lower()).strip("-"),
                "task": task,
                "procedure": procedure,
                "skill": name,
                "steps": steps,
            }
        )
    return tasks


def render() -> str:
    files, stems = build_files(collect_files())
    data = {
        "layers": LAYERS,
        "order": sorted(files),
        "files": files,
        "stems": stems,
        "tasks": build_tasks(files),
    }
    return json.dumps(data, ensure_ascii=False, indent=1, sort_keys=True) + "\n"


def is_current() -> bool:
    return TARGET.is_file() and read_text(TARGET) == render()


def main() -> int:
    if "--check" in sys.argv:
        return 0 if is_current() else 1
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.write_text(render(), encoding="utf-8", newline="\n")
    print(f"{TARGET.relative_to(VAULT).as_posix()} written")
    return 0


if __name__ == "__main__":
    sys.exit(main())
