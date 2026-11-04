#!/usr/bin/env python3
"""Build docs/graph.json, the knowledge graph shown on the method page.

The graph joins two sources. The system documents come from the template through
docs/data.json (built by build_site.py). The knowledge notes come from the synthetic example
domain under docs/example/, because the template itself carries only placeholders. Edges are
the wikilinks between the selected files, plus one edge from HOME to each example map of content,
which a real vault would hold in HOME itself.

Two layouts are computed here, so the browser runs no physics and every load shows the same
picture:
    themen  the person's view, knowledge clustered by domain, system documents as an outer frame
    agent   the agent's view, rings by the moment a file reaches the agent's context
The agent layout keeps each node's angle from the themen layout, so a transition between them
moves nodes outward or inward instead of across the picture.

Usage:
    python scripts/build_graph.py          write docs/graph.json
    python scripts/build_graph.py --check  exit 1 when docs/graph.json is stale
"""

from __future__ import annotations

import json
import math
import re
import sys
from pathlib import Path

VAULT = Path(__file__).resolve().parent.parent
DATA = VAULT / "docs" / "data.json"
EXAMPLE = VAULT / "docs" / "example"
TARGET = VAULT / "docs" / "graph.json"

RE_LINK = re.compile(r"\[\[([^\]|#]*)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]")
RE_HEADING = re.compile(r"^(#{1,6})\s+(.+?)\s*$", re.M)

CONTROL = {"HOME.md", "ACTIVE-WORK.md", "VAULT-OPERATIONS.md", "TAG-TAXONOMY.md"}
OPERATIONS = {"Decision Log.md", "Done Log.md", "Repo Directory.md", "Vault Operations MOC.md"}
CHECKS = {"scripts/check_vault.py", "scripts/hooks/pre-commit"}

# Ring radius per agent stage: always loaded, control documents, rules and conventions, skills
# and operations, knowledge.
RING = {0: 0.0, 1: 0.27, 2: 0.48, 3: 0.7, 4: 0.93}
GROUP_STAGE = {
    "core": 0,
    "control": 1,
    "rule": 2,
    "skill": 3,
    "operations": 3,
    "check": 3,
    "moc": 4,
    "concept": 4,
    "literature": 4,
    "project": 4,
    "source": 4,
}
ITERATIONS = 400
FRAME = 0.95
INNER_LIMIT = 0.74


def system_group(path: str) -> str | None:
    """The group of a template file that belongs in the graph, or None to leave it out."""
    if path in ("CLAUDE.md", "AGENTS.md"):
        return "core"
    if path in CONTROL:
        return "control"
    if path.startswith(".claude/rules/") or path.startswith("Vault Operations/Conventions/"):
        return "rule"
    if path.startswith(".claude/skills/") and path.endswith("/SKILL.md"):
        return "skill"
    name = path.split("/")[-1]
    if path.startswith("Vault Operations/") and (name in OPERATIONS or "/Templates/" in path):
        return "operations"
    if path in CHECKS:
        return "check"
    return None


def system_label(path: str) -> str:
    if path.endswith("/SKILL.md"):
        return path.split("/")[-2]
    return path.split("/")[-1].removesuffix(".md")


def parse_frontmatter(text: str) -> list[list[str]]:
    if not text.startswith("---\n"):
        return []
    block = text[4 : text.index("\n---", 4)]
    return [
        [key.strip(), value.strip()] for key, _, value in (line.partition(":") for line in block.split("\n"))
    ]


def example_notes() -> dict[str, dict]:
    notes = {}
    for path in sorted(EXAMPLE.rglob("*.md")):
        rel = "example/" + path.relative_to(EXAMPLE).as_posix()
        text = path.read_text(encoding="utf-8").replace("\r\n", "\n")
        fields = parse_frontmatter(text)
        typ = dict(fields).get("type", "")
        name = path.stem
        group = "moc" if name.endswith("MOC") else {"literature": "literature"}.get(typ, "concept")
        if name.startswith("Project Overview"):
            group = "project"
        if path.parent.name == "Sources":
            group = "source"
        notes[rel] = {
            "path": rel,
            "title": name,
            # Literature notes are labelled by author and year; the full title stays in the file.
            "label": name.split(" - ")[0] if typ == "literature" else name,
            "text": text,
            "frontmatter": fields,
            "kind": "markdown",
            "layer": "content",
            "group": group,
            "domain": path.parent.name,
            "outline": [
                {"level": len(m.group(1)), "text": m.group(2)}
                for m in RE_HEADING.finditer(text.split("\n---", 1)[-1])
            ],
        }
    return notes


def build_nodes_and_edges(data: dict) -> tuple[list[dict], list[list[str]], dict[str, dict], dict[str, str]]:
    nodes = []
    for path in data["order"]:
        group = system_group(path)
        if group:
            nodes.append({"id": path, "label": system_label(path), "group": group, "domain": "System"})
    notes = example_notes()
    for rel, note in notes.items():
        nodes.append({"id": rel, "label": note["label"], "group": note["group"], "domain": note["domain"]})
    ids = {node["id"] for node in nodes}

    stems = {note["title"]: rel for rel, note in notes.items()}
    edges = set()
    for node in nodes:
        if node["id"] in notes:
            for match in RE_LINK.finditer(notes[node["id"]]["text"]):
                target = stems.get(match.group(1).strip()) or data["stems"].get(match.group(1).strip())
                if target in ids and target != node["id"]:
                    edges.add(tuple(sorted((node["id"], target))))
        else:
            for target in data["files"][node["id"]]["linksTo"]:
                if target in ids and target != node["id"]:
                    edges.add(tuple(sorted((node["id"], target))))
    for rel, note in notes.items():
        if note["group"] == "moc":
            edges.add(tuple(sorted(("HOME.md", rel))))
    # Skills and checks are named in backticks, not wikilinks. The skill register in
    # VAULT-OPERATIONS and the check commands in CLAUDE are their real inbound references.
    for node in nodes:
        if node["group"] == "skill":
            edges.add(tuple(sorted(("VAULT-OPERATIONS.md", node["id"]))))
    edges.add(tuple(sorted(("CLAUDE.md", "scripts/check_vault.py"))))
    edges.add(tuple(sorted(("CLAUDE.md", "scripts/hooks/pre-commit"))))
    degree = {node["id"]: 0 for node in nodes}
    for a, b in edges:
        degree[a] += 1
        degree[b] += 1
    for node in nodes:
        node["degree"] = degree[node["id"]]
    return nodes, sorted([list(edge) for edge in edges]), notes, stems


def themen_layout(nodes: list[dict], edges: list[list[str]]) -> dict[str, tuple[float, float]]:
    """Knowledge inside, clustered by domain; the system documents as a fixed outer frame.

    The frame is ordered by group, with the agent's rules and the control documents at the top,
    so HOME sits above the maps of content it links. Only the knowledge nodes move.
    """
    order = ["core", "control", "rule", "skill", "operations", "check"]
    frame = sorted(
        (node for node in nodes if node["domain"] == "System"), key=lambda node: order.index(node["group"])
    )
    head = sum(1 for node in frame if node["group"] in ("core", "control"))
    gap = 2 * math.pi / len(frame)
    first = -math.pi / 2 - gap * (head - 1) / 2
    pos = {
        node["id"]: [FRAME * math.cos(first + k * gap), FRAME * math.sin(first + k * gap)]
        for k, node in enumerate(frame)
    }

    inner = [node for node in nodes if node["domain"] != "System"]
    domains = sorted({node["domain"] for node in inner})
    anchors = {
        domain: (
            0.34 * math.cos(2 * math.pi * k / len(domains) + math.pi / 4),
            0.34 * math.sin(2 * math.pi * k / len(domains) + math.pi / 4),
        )
        for k, domain in enumerate(domains)
    }
    golden = math.pi * (3 - math.sqrt(5))
    for k, node in enumerate(inner):
        ax, ay = anchors[node["domain"]]
        pos[node["id"]] = [ax + 0.1 * math.cos(k * golden), ay + 0.1 * math.sin(k * golden)]
    moving = [node["id"] for node in inner]
    index = {node["id"]: node for node in nodes}
    ideal = 0.14
    for step in range(ITERATIONS):
        shift = {key: [0.0, 0.0] for key in moving}
        for i, a in enumerate(moving):
            for b in moving[i + 1 :]:
                dx, dy = pos[a][0] - pos[b][0], pos[a][1] - pos[b][1]
                dist = max(math.hypot(dx, dy), 1e-4)
                force = ideal * ideal / dist
                shift[a][0] += dx / dist * force
                shift[a][1] += dy / dist * force
                shift[b][0] -= dx / dist * force
                shift[b][1] -= dy / dist * force
        for a, b in edges:
            dx, dy = pos[a][0] - pos[b][0], pos[a][1] - pos[b][1]
            dist = max(math.hypot(dx, dy), 1e-4)
            # Links into the frame pull gently, so the frame orients the knowledge without dragging it.
            weight = 0.5 if a in shift and b in shift else 0.12
            force = dist * dist / ideal * weight
            if a in shift:
                shift[a][0] -= dx / dist * force
                shift[a][1] -= dy / dist * force
            if b in shift:
                shift[b][0] += dx / dist * force
                shift[b][1] += dy / dist * force
        for key in moving:
            ax, ay = anchors[index[key]["domain"]]
            shift[key][0] += (ax - pos[key][0]) * 0.25
            shift[key][1] += (ay - pos[key][1]) * 0.25
        cool = 0.05 * (1 - step / ITERATIONS) + 0.002
        for key in moving:
            dx, dy = shift[key]
            length = max(math.hypot(dx, dy), 1e-9)
            pos[key][0] += dx / length * min(length, cool)
            pos[key][1] += dy / length * min(length, cool)
            r = math.hypot(*pos[key])
            if r > INNER_LIMIT:
                pos[key][0] *= INNER_LIMIT / r
                pos[key][1] *= INNER_LIMIT / r
    return {key: (x, y) for key, (x, y) in pos.items()}


def agent_layout(nodes: list[dict], themen: dict[str, tuple[float, float]]) -> dict[str, tuple[float, float]]:
    """Rings by agent stage; within a ring, nodes keep the angular order of the themen layout."""
    pos = {}
    by_stage: dict[int, list[dict]] = {}
    for node in nodes:
        by_stage.setdefault(GROUP_STAGE[node["group"]], []).append(node)
    for stage, members in by_stage.items():
        members.sort(key=lambda node: math.atan2(themen[node["id"]][1], themen[node["id"]][0]))
        radius = RING[stage]
        if stage == 0:
            for k, node in enumerate(members):
                pos[node["id"]] = (0.07 * (k - (len(members) - 1) / 2), 0.0)
            continue
        start = math.atan2(themen[members[0]["id"]][1], themen[members[0]["id"]][0])
        for k, node in enumerate(members):
            angle = start + 2 * math.pi * k / len(members)
            pos[node["id"]] = (radius * math.cos(angle), radius * math.sin(angle))
    return pos


def normalise(pos: dict[str, list[float]]) -> dict[str, tuple[float, float]]:
    span = max(max(abs(x), abs(y)) for x, y in pos.values()) or 1
    return {key: (x / span * 0.97, y / span * 0.97) for key, (x, y) in pos.items()}


def render() -> str:
    data = json.loads(DATA.read_text(encoding="utf-8"))
    nodes, edges, notes, stems = build_nodes_and_edges(data)
    themen = themen_layout(nodes, edges)
    agent = agent_layout(nodes, themen)
    for node in nodes:
        node["themen"] = [round(themen[node["id"]][0], 4), round(themen[node["id"]][1], 4)]
        node["agent"] = [round(agent[node["id"]][0], 4), round(agent[node["id"]][1], 4)]
        node["stage"] = GROUP_STAGE[node["group"]]
    graph = {"nodes": nodes, "edges": edges, "files": notes, "stems": stems}
    return json.dumps(graph, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n"


def main() -> int:
    text = render()
    if "--check" in sys.argv:
        current = TARGET.exists() and TARGET.read_text(encoding="utf-8") == text
        print("graph.json current" if current else "graph.json stale")
        return 0 if current else 1
    TARGET.write_text(text, encoding="utf-8", newline="\n")
    print(f"{TARGET.relative_to(VAULT).as_posix()} written")
    return 0


if __name__ == "__main__":
    sys.exit(main())
