"""Build a bounded, read-only map of Markdown notes and literal Wikilinks.

Regime: flat stdlib script pipeline, imported by serve.py. The service supplies
its existing filesystem guards and read limits. Vault-relative paths identify
notes, while unambiguous aliases only resolve references. No link establishes
a semantic relation or a broader/narrower hierarchy (knowledge/data.md).
"""

import json
import posixpath
import re
from collections import defaultdict
from collections.abc import Callable, Iterator
from pathlib import Path, PurePosixPath

import demo_catalog
import demo_common


def _blank(text: str) -> str:
    return "".join("\n" if character == "\n" else " " for character in text)


def _frontmatter(text: str) -> tuple[str, str]:
    match = re.match(r"\A\ufeff?---[ \t]*\n", text)
    if not match:
        return "", text
    end = re.search(r"^(?:---|\.\.\.)[ \t]*$", text[match.end() :], re.MULTILINE)
    if not end:
        return text[match.end() :], _blank(text)
    stop = match.end() + end.end()
    return text[match.end() : match.end() + end.start()], _blank(text[:stop]) + text[stop:]


def _scalar(value: str) -> str:
    value = value.strip()
    if value.startswith('"'):
        parsed = json.loads(value)
        if not isinstance(parsed, str):
            raise ValueError("Kein Textwert.")
        return parsed
    if value.startswith("'"):
        if len(value) < 2 or not value.endswith("'"):
            raise ValueError("Nicht geschlossener Textwert.")
        return value[1:-1].replace("''", "'")
    if value.startswith(("[", "{", "&", "*", "!", "|", ">")):
        raise ValueError("Nicht unterstützte Metadatenstruktur.")
    return re.split(r"\s+#", value, maxsplit=1)[0].strip()


def _without_comment(value: str) -> str:
    quote = ""
    escaped = False
    for index, character in enumerate(value):
        if quote:
            if character == quote and not escaped:
                quote = ""
            escaped = character == "\\" and not escaped and quote == '"'
        elif character in "\"'":
            quote = character
        elif character == "#" and (not index or value[index - 1].isspace()):
            return value[:index].rstrip()
    return value


def _values(value: str) -> list[str]:
    value = value.strip()
    if not value.startswith("["):
        return [_scalar(value)] if value else []
    if not value.endswith("]"):
        raise ValueError("Nicht geschlossene Metadatenliste.")
    values = []
    start = 1
    quote = ""
    escaped = False
    for index, character in enumerate(value[1:-1], 1):
        if quote:
            if character == quote and not escaped:
                quote = ""
            escaped = character == "\\" and not escaped and quote == '"'
        elif character in "\"'":
            quote = character
        elif character == ",":
            values.append(_scalar(value[start:index]))
            start = index + 1
    if quote:
        raise ValueError("Nicht geschlossener Metadatentext.")
    if value[start:-1].strip():
        values.append(_scalar(value[start:-1]))
    return [item for item in values if item]


def _metadata(frontmatter: str, path: str, warnings: list[str]) -> dict:
    result = {"type": "", "status": "", "tags": [], "aliases": []}
    fields = defaultdict(list)
    field = ""
    for line in frontmatter.split("\n"):
        top = re.match(r"^([A-Za-z][\w-]*):(?:[ \t]+(.*)|[ \t]*)$", line)
        if top:
            field = top[1] if top[1] in result else ""
            if field:
                fields[field].append([_without_comment(top[2] or "")])
            continue
        item = re.match(r"^\s*-\s+(.+)$", line)
        if field and item:
            fields[field][-1].append(_without_comment(item[1]))
        elif line.strip() and not line.lstrip().startswith("#"):
            if field:
                fields[field][-1].append("{unsupported}")
            field = ""
    for field, records in fields.items():
        try:
            if len(records) != 1:
                raise ValueError("Doppeltes Metadatenfeld.")
            record = records[0]
            if field in {"tags", "aliases"}:
                if len(record) > 1 and record[0].strip():
                    raise ValueError("Mehrdeutige Metadatenliste.")
                values = [_scalar(value) for value in record[1:]] if len(record) > 1 else _values(record[0])
                result[field] = list(dict.fromkeys(value for value in values if value))
            else:
                if len(record) != 1:
                    raise ValueError("Kein einzelner Metadatentext.")
                result[field] = _scalar(record[0])
        except ValueError:
            warnings.append(f"Metadatenfeld {field} in {path} nicht ausgewertet.")
    return result


def _visible_body(text: str) -> str:
    """Mask code and comments without changing source line or character positions."""
    _, body = _frontmatter(text)
    body = re.sub(r"<!--[\s\S]*?(?:-->|\Z)", lambda match: _blank(match[0]), body)
    lines = []
    fence = ""
    for raw in body.split("\n"):
        marker = re.match(r"^ {0,3}(?:> ?)*(`{3,}|~{3,})(.*)$", raw)
        if marker and (not fence or marker[1][0] == fence[0]):
            if not fence:
                fence = marker[1]
            elif len(marker[1]) >= len(fence) and not marker[2].strip():
                fence = ""
            lines.append(_blank(raw))
        else:
            lines.append(_blank(raw) if fence else raw)
    body = "\n".join(lines)
    # Exact-length delimiters preserve nested or unmatched backticks as literal text.
    characters = list(body)
    runs = list(re.finditer(r"`+", body))
    next_run = {}
    lengths = {}
    for index in range(len(runs) - 1, -1, -1):
        next_run[index] = lengths.get(len(runs[index][0]))
        lengths[len(runs[index][0])] = index
    index = 0
    while index < len(runs):
        opening = runs[index]
        before = opening.start() - 1
        while before >= 0 and body[before] == "\\":
            before -= 1
        if (opening.start() - before - 1) % 2:
            index += 1
            continue
        closing = next_run[index]
        if closing is None:
            index += 1
            continue
        start, stop = opening.start(), runs[closing].end()
        characters[start:stop] = _blank(body[start:stop])
        index = closing + 1
    return "".join(characters)


def _references(text: str, visible: str) -> Iterator[dict]:
    # The source reader counts LF lines. Vertical tabs in slide text are content,
    # and masking code must not shift the source line used for its quotation.
    original = text.split("\n")
    for number, line in enumerate(visible.split("\n"), 1):
        for match in re.finditer(r"\[\[([^\[\]\n]+)\]\]", line):
            prefix = line[: match.start()]
            if (len(prefix) - len(prefix.rstrip("\\"))) % 2:
                continue
            target = match[1].split("|", 1)[0].strip()
            yield {"target": target, "line": number, "quote": original[number - 1]}


def _resolve(
    source: str,
    reference: str,
    paths: set[str],
    names: dict[str, set[str]],
    aliases: dict[str, set[str]],
) -> tuple[str, str, str]:
    target, _, anchor = reference.partition("#")
    target = target.strip()
    if not target:
        return (source, anchor, "") if anchor else ("", "", "Leeres Verweisziel.")
    if any(character in target for character in "\\:\x00") or target.startswith("/"):
        return "", anchor, "Ungültiger relativer Verweispfad."
    if target.startswith(("./", "../")):
        candidate = posixpath.normpath(posixpath.join(posixpath.dirname(source), target))
        if candidate.startswith("../") or candidate in {".", ".."}:
            return "", anchor, "Verweispfad verlässt den Vault."
        candidates = {candidate if candidate.lower().endswith(".md") else candidate + ".md"} & paths
    elif "/" in target:
        if any(part.startswith(".") or not part for part in target.split("/")):
            return "", anchor, "Ungültiger relativer Verweispfad."
        candidate = target if target.lower().endswith(".md") else target + ".md"
        candidates = {
            candidate,
            posixpath.join(posixpath.dirname(source), candidate),
        } & paths
    else:
        name = target[:-3] if target.lower().endswith(".md") else target
        candidates = names.get(name, set()) | aliases.get(target, set())
    if len(candidates) == 1:
        return next(iter(candidates)), anchor, ""
    if candidates:
        return "", anchor, "Mehrdeutiger Verweis."
    if PurePosixPath(target).suffix and not target.lower().endswith(".md"):
        return "", anchor, "asset"
    return "", anchor, "Zieldokument nicht gefunden."


def build(
    root: Path,
    paths: list[Path],
    *,
    safe_path: Callable[[Path, str], Path],
    read_text: Callable[[Path], str],
    max_bytes: int,
) -> dict:
    result = {
        "schema": "second-brain-knowledge-1",
        "root": "",
        "nodes": [],
        "links": [],
        "unresolved": [],
        "warnings": [],
        "truncated": False,
    }
    permitted = set()
    names = defaultdict(set)
    aliases = defaultdict(set)
    pending = []
    consumed = 0
    evidence_bytes = 0
    reference_limit = False
    sources = []
    for path in sorted(paths):
        try:
            relative = path.relative_to(root).as_posix()
            if path.suffix.lower() != ".md":
                raise ValueError("Keine Markdown-Quelle.")
            safe = safe_path(root, relative)
            permitted.add(relative)
            names[path.stem].add(relative)
            sources.append((relative, safe))
        except (OSError, ValueError) as error:
            result["warnings"].append(f"Quelle {path.name} nicht gelesen ({type(error).__name__}).")
            continue
    for relative, path in sources:
        try:
            text = read_text(path)
        except (OSError, ValueError) as error:
            result["warnings"].append(f"Quelle {relative} nicht gelesen ({type(error).__name__}).")
            continue
        consumed += len(text.encode("utf-8"))
        if consumed > max_bytes:
            result["warnings"].append("Die Wissenskarte wurde an der lokalen Lesegrenze beendet.")
            result["truncated"] = True
            break
        frontmatter, _ = _frontmatter(text)
        if frontmatter and not re.search(r"^(?:---|\.\.\.)[ \t]*$", text.split("\n", 1)[1], re.MULTILINE):
            result["warnings"].append(f"Frontmatter in {relative} nicht geschlossen.")
        metadata = _metadata(frontmatter, relative, result["warnings"])
        visible = _visible_body(text)
        headings = demo_catalog.heading_spans(visible)
        node = {
            "id": relative,
            "path": relative,
            "title": headings[0]["title"] if headings else path.stem,
            **metadata,
            "isHub": relative == "HOME.md"
            or bool({"hub", "moc"} & {tag.casefold() for tag in metadata["tags"]})
            or bool(re.search(r"(^|[\s-])MOC($|[\s-])", path.stem, re.IGNORECASE))
            or path.stem.startswith("Project Overview "),
            "revision": demo_common.revision_of(text),
        }
        result["nodes"].append(node)
        for alias in node["aliases"]:
            aliases[alias].add(relative)
        if reference_limit:
            continue
        for reference in _references(text, visible):
            evidence_bytes += len((relative + reference["target"] + reference["quote"]).encode("utf-8"))
            if evidence_bytes > max_bytes:
                result["warnings"].append("Die Verweisauswahl wurde an der lokalen Lesegrenze beendet.")
                result["truncated"] = reference_limit = True
                break
            pending.append({"from": relative, **reference})
    loaded = {node["id"] for node in result["nodes"]}
    result["root"] = "HOME.md" if "HOME.md" in loaded else ""
    for reference in pending:
        target, anchor, reason = _resolve(reference["from"], reference["target"], permitted, names, aliases)
        if reason == "asset":
            continue
        if target and target not in loaded:
            reason = "Zieldokument nicht gelesen."
        if reason:
            result["unresolved"].append(
                {key: reference[key] for key in ("from", "target", "line")} | {"reason": reason}
            )
        else:
            result["links"].append(
                {
                    "from": reference["from"],
                    "to": target,
                    "anchor": anchor,
                    "line": reference["line"],
                    "quote": reference["quote"],
                }
            )
    result["truncated"] = result["truncated"] or bool(result["warnings"])
    return result
