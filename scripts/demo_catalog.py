"""Build bounded read-only Markdown catalog pages and literal source summaries.

Regime: flat stdlib script pipeline, imported by serve.py. Existing filesystem
guards and read limits are supplied by that service. Project scope uses only
the mapped note directory, never a guessed project name. Summaries reproduce
an actual H2 Summary section, not generated prose (knowledge/data.md).
"""

import re
import unicodedata
from collections.abc import Callable
from pathlib import Path, PurePosixPath
from urllib.parse import quote

import demo_common


def heading_spans(text: str) -> list[dict]:
    headings = []
    offset = 0
    yaml = text.lstrip("\ufeff").startswith(("---\n", "---\r\n"))
    fence = ""
    for index, raw in enumerate(text.splitlines(keepends=True)):
        line = raw.rstrip("\r\n")
        start = offset
        offset += len(raw)
        if yaml:
            if index > 0 and line in {"---", "..."}:
                yaml = False
            continue
        marker = re.match(r"^ {0,3}(`{3,}|~{3,})", line)
        if marker:
            value = marker[1]
            if not fence:
                fence = value
            elif value[0] == fence[0] and len(value) >= len(fence):
                fence = ""
            continue
        match = re.match(r"^ {0,3}(#{1,6})[ \t]+(.+?)\s*$", line)
        if match and not fence:
            headings.append(
                {
                    "level": len(match[1]),
                    "title": re.sub(r"[ \t]+#+[ \t]*$", "", match[2]),
                    "start": start,
                    "end": offset,
                }
            )
    return headings


def summary_section(text: str, revision: str) -> dict | None:
    headings = heading_spans(text)
    for index, heading in enumerate(headings):
        if heading["level"] != 2 or heading["title"].casefold() != "summary":
            continue
        start = heading["end"]
        end = next(
            (other["start"] for other in headings[index + 1 :] if other["level"] <= 2),
            len(text),
        )
        while start < end and text[start] in "\r\n":
            start += 1
        while end > start and text[end - 1] in "\r\n":
            end -= 1
        if not text[start:end].strip():
            return None
        return {
            "text": text[start:end],
            "start": len(text[:start].encode("utf-16-le")) // 2,
            "end": len(text[:end].encode("utf-16-le")) // 2,
            "line": text.count("\n", 0, start) + 1,
            "revision": revision,
        }
    return None


def normalized(text: str) -> str:
    folded = text.casefold().replace("ä", "ae").replace("ö", "oe").replace("ü", "ue")
    return "".join(
        character
        for character in unicodedata.normalize("NFD", folded)
        if not unicodedata.combining(character)
    )


def _excerpt(text: str, terms: list[str]) -> dict | None:
    offset = 0
    for raw in text.splitlines(keepends=True):
        line = raw.rstrip("\r\n")
        normalized_line = normalized(line)
        match = min(
            (position for term in terms if (position := normalized_line.find(term)) >= 0),
            default=-1,
        )
        if match >= 0:
            positions = [index for index, character in enumerate(line) for _ in normalized(character)]
            local_start = max(0, positions[match] - 70)
            start = offset + local_start
            end = offset + min(len(line), local_start + 260)
            return {
                "text": text[start:end],
                "start": len(text[:start].encode("utf-16-le")) // 2,
                "end": len(text[:end].encode("utf-16-le")) // 2,
                "line": text.count("\n", 0, start) + 1,
            }
        offset += len(raw)
    return None


def catalog(
    root: Path,
    paths: list[Path],
    *,
    query: str,
    project: dict | None,
    mode: str,
    offset: int,
    safe_path: Callable[[Path, str], Path],
    read_text: Callable[[Path], str],
    max_bytes: int,
    limit: int,
) -> dict:
    terms = normalized(query).split()
    note = PurePosixPath(project["notizPfad"]) if project else None
    folder = note.parent if note else None
    result = {
        "query": query,
        "project": project["id"] if project else "",
        "mode": mode,
        "scope": str(folder) if folder and str(folder) != "." else str(note) if note else None,
        "results": [],
        "nextOffset": None,
        "truncated": False,
        "warnings": [],
    }
    consumed = 0
    matched = 0
    for path in paths:
        relative = path.relative_to(root).as_posix()
        candidate = PurePosixPath(relative)
        if note and candidate != note and (str(folder) == "." or folder not in candidate.parents):
            continue
        try:
            text = read_text(safe_path(root, relative))
        except (OSError, ValueError) as error:
            result["warnings"].append(f"Quelle {relative} nicht gelesen ({type(error).__name__}).")
            continue
        consumed += len(text.encode("utf-8"))
        if consumed > max_bytes:
            result["warnings"].append("Die Auswahl wurde an der lokalen Lesegrenze beendet.")
            result["truncated"] = True
            break
        headings = [heading["title"] for heading in heading_spans(text)]
        searchable = "\n".join([relative, *headings, text if mode == "fulltext" else ""])
        normalized_source = normalized(searchable)
        if not all(term in normalized_source for term in terms):
            continue
        matched += 1
        if matched <= offset:
            continue
        if len(result["results"]) == limit:
            result["nextOffset"] = offset + limit
            break
        result["results"].append(
            {
                "path": relative,
                "sourceUrl": f"obsidian://open?vault={quote(root.name)}&file={quote(relative)}",
                "title": headings[0] if headings else path.stem,
                "headings": headings[:12],
                "revision": demo_common.revision_of(text),
                "excerpt": _excerpt(text, terms) if terms and mode == "fulltext" else None,
            }
        )
    result["truncated"] = result["truncated"] or bool(result["warnings"])
    return result
