// The knowledge graph of the build section. Positions come precomputed from docs/graph.json
// (scripts/build_graph.py), so the browser only draws, stages the growing vault and answers
// interaction. Every node is a focusable control: arrow keys move to a neighbour in that
// direction and Enter opens the file, so the picture works without a pointer.

const NS = "http://www.w3.org/2000/svg";
const SCALE = 50;
const GROUPS = ["core", "control", "rule", "skill", "operations", "check", "moc", "concept", "literature", "project", "source"];
const SYSTEM = new Set(["core", "control", "rule", "skill", "operations", "check"]);

function el(name, attrs = {}, parent) {
  const node = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  if (parent) parent.append(node);
  return node;
}

function radiusOf(node) {
  const base = 0.95 + Math.sqrt(node.degree) * 0.42;
  return SYSTEM.has(node.group) ? base * 0.78 : base;
}

/** Maps of content are drawn as the hexagon of the DHCraft logo. */
function hexagon(r) {
  const points = [];
  for (let k = 0; k < 6; k += 1) {
    const angle = Math.PI / 6 + (k * Math.PI) / 3;
    points.push(`${(r * Math.cos(angle)).toFixed(2)},${(r * Math.sin(angle)).toFixed(2)}`);
  }
  return points.join(" ");
}

/**
 * @param {HTMLElement} host
 * @param {{nodes: object[], edges: string[][]}} graph
 * @param {{onOpen?: Function, describe?: Function, text: object, frame?: boolean}} options
 */
export function createGraph(host, graph, options) {
  const text = options.text;
  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  const neighbours = new Map(graph.nodes.map((node) => [node.id, new Set()]));
  for (const [a, b] of graph.edges) {
    neighbours.get(a).add(b);
    neighbours.get(b).add(a);
  }
  const pos = new Map(graph.nodes.map((node) => [node.id, node.xy.map((v) => v * SCALE)]));
  let hidden = new Set();

  const svg = el("svg", { viewBox: "-58 -58 116 116", role: "group", "aria-label": text.graph.label });
  const defs = el("defs", {}, svg);
  for (const group of GROUPS) {
    const halo = el("radialGradient", { id: `halo-${group}` }, defs);
    el("stop", { offset: "0%", "stop-color": `var(--g-${group})`, "stop-opacity": 0.55 }, halo);
    el("stop", { offset: "100%", "stop-color": `var(--g-${group})`, "stop-opacity": 0 }, halo);
  }
  const shine = el("radialGradient", { id: "shine", cx: "35%", cy: "30%", r: "65%" }, defs);
  el("stop", { offset: "0%", "stop-color": "white", "stop-opacity": 0.7 }, shine);
  el("stop", { offset: "45%", "stop-color": "white", "stop-opacity": 0.06 }, shine);
  el("stop", { offset: "100%", "stop-color": "black", "stop-opacity": 0.3 }, shine);

  // A faint boundary marks the vault folder, so an empty vault still reads as a place.
  if (options.frame) el("circle", { class: "vault-frame", r: SCALE * 1.04, cx: 0, cy: 0 }, svg);
  const edgeLayer = el("g", { class: "edges", "aria-hidden": "true" }, svg);
  const nodeLayer = el("g", { class: "nodes" }, svg);

  const isSystem = (id) => SYSTEM.has(byId.get(id).group);
  const edgeEls = graph.edges.map(([a, b]) => ({
    a,
    b,
    line: el("line", { class: isSystem(a) && isSystem(b) ? "edge sys" : "edge" }, edgeLayer),
  }));
  const nodeEls = new Map();
  for (const node of graph.nodes) {
    const g = el("g", {
      class: `node${SYSTEM.has(node.group) ? " system" : ""}`,
      tabindex: -1,
      role: "button",
      "data-id": node.id,
      "data-group": node.group,
      "aria-label": `${node.label}, ${text.graph.groups[node.group]}`,
    }, nodeLayer);
    const r = radiusOf(node);
    el("circle", { class: "glow", r: r * 2.8, fill: `url(#halo-${node.group})` }, g);
    if (node.group === "moc") {
      el("polygon", { class: "body", points: hexagon(r * 1.25), style: `fill: var(--g-${node.group})` }, g);
      el("polygon", { class: "shine", points: hexagon(r * 1.25), fill: "url(#shine)", "pointer-events": "none" }, g);
    } else {
      el("circle", { class: "body", r, style: `fill: var(--g-${node.group})` }, g);
      el("circle", { class: "shine", r, fill: "url(#shine)", "pointer-events": "none" }, g);
    }
    const label = el("text", { y: -r - 0.9, "text-anchor": "middle" }, g);
    // Overview pages are named by their field; the abbreviation MOC means nothing to a newcomer.
    label.textContent = node.group === "moc" ? node.label.replace(/ MOC$/, "") : node.label;
    // Overview pages and the entry points CLAUDE and HOME are always named.
    if (node.group === "moc" || node.id === "CLAUDE.md" || node.id === "HOME.md") g.dataset.label = "always";
    nodeEls.set(node.id, g);
  }
  host.replaceChildren(svg);

  function place() {
    for (const [id, g] of nodeEls) {
      const [x, y] = pos.get(id);
      g.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
      g.classList.toggle("off", hidden.has(id));
    }
    for (const { a, b, line } of edgeEls) {
      const [x1, y1] = pos.get(a);
      const [x2, y2] = pos.get(b);
      line.setAttribute("x1", x1.toFixed(2));
      line.setAttribute("y1", y1.toFixed(2));
      line.setAttribute("x2", x2.toFixed(2));
      line.setAttribute("y2", y2.toFixed(2));
      line.classList.toggle("off", hidden.has(a) || hidden.has(b));
    }
  }
  place();

  // Roving focus: one node is in the tab order, arrows move it along the graph.
  let current = byId.has("HOME.md") ? "HOME.md" : graph.nodes[0].id;
  nodeEls.get(current).setAttribute("tabindex", "0");

  const card = document.getElementById("node-card");
  function showCard(id, anchor) {
    if (!card || !options.describe) return;
    const info = options.describe(id);
    card.replaceChildren();
    const title = document.createElement("strong");
    title.textContent = info.title;
    const kind = document.createElement("span");
    kind.textContent = info.kind;
    card.append(title, kind);
    if (info.text) {
      const body = document.createElement("p");
      body.textContent = info.text;
      card.append(body);
    }
    card.hidden = false;
    const box = anchor.getBoundingClientRect();
    const left = Math.min(box.right + 12, innerWidth - card.offsetWidth - 12);
    const top = Math.min(Math.max(box.top - 8, 8), innerHeight - card.offsetHeight - 8);
    card.style.left = `${Math.max(8, left)}px`;
    card.style.top = `${top}px`;
  }

  function hover(id) {
    svg.dataset.hover = "true";
    const near = neighbours.get(id);
    for (const [other, g] of nodeEls) {
      g.classList.toggle("near", near.has(other));
      g.classList.toggle("hot", other === id);
    }
    for (const edge of edgeEls) edge.line.classList.toggle("near", edge.a === id || edge.b === id);
    showCard(id, nodeEls.get(id));
  }
  function unhover() {
    delete svg.dataset.hover;
    for (const g of nodeEls.values()) g.classList.remove("near", "hot");
    for (const edge of edgeEls) edge.line.classList.remove("near");
    if (card) card.hidden = true;
  }

  function moveFocus(id) {
    nodeEls.get(current).setAttribute("tabindex", "-1");
    current = id;
    const g = nodeEls.get(id);
    g.setAttribute("tabindex", "0");
    g.focus();
  }

  function neighbourInDirection(id, dx, dy) {
    const [x, y] = pos.get(id);
    let best = null;
    let bestScore = Infinity;
    for (const other of nodeEls.keys()) {
      if (other === id || hidden.has(other)) continue;
      const [ox, oy] = pos.get(other);
      const along = (ox - x) * dx + (oy - y) * dy;
      if (along <= 0) continue;
      const across = Math.abs((ox - x) * dy - (oy - y) * dx);
      const score = (along + across * 2) * (neighbours.get(id).has(other) ? 0.6 : 1);
      if (score < bestScore) {
        bestScore = score;
        best = other;
      }
    }
    return best;
  }

  nodeLayer.addEventListener("pointerover", (event) => {
    const g = event.target.closest(".node");
    if (g && !g.classList.contains("off")) hover(g.dataset.id);
  });
  nodeLayer.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget || !event.relatedTarget.closest?.(".node")) unhover();
  });
  nodeLayer.addEventListener("focusin", (event) => {
    const g = event.target.closest(".node");
    if (g) {
      current = g.dataset.id;
      hover(current);
    }
  });
  nodeLayer.addEventListener("focusout", unhover);
  nodeLayer.addEventListener("click", (event) => {
    const g = event.target.closest(".node");
    if (g && !g.classList.contains("off") && options.onOpen) options.onOpen(g.dataset.id, g);
  });
  nodeLayer.addEventListener("keydown", (event) => {
    const directions = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (directions[event.key]) {
      event.preventDefault();
      const next = neighbourInDirection(current, ...directions[event.key]);
      if (next) moveFocus(next);
    } else if ((event.key === "Enter" || event.key === " ") && options.onOpen) {
      event.preventDefault();
      options.onOpen(current, nodeEls.get(current));
    }
  });

  const STATE_CLASSES = ["lit", "proposal", "focus"];

  /**
   * Show one growth stage. Every call starts from a clean picture, so a stage is fully
   * described by its object and stepping backwards needs no undo.
   */
  function stage(state = {}) {
    for (const g of nodeEls.values()) g.classList.remove(...STATE_CLASSES);
    hidden = new Set(state.hidden || []);
    place();
    if (state.active) svg.dataset.playing = "true";
    else delete svg.dataset.playing;
    const add = (ids, cls) => ids && ids.forEach((id) => nodeEls.get(id)?.classList.add(cls));
    add(state.focus, "focus");
    add(state.lit, "lit");
    add(state.drafts, "proposal");
    declutter();
  }

  // Labels of neighbouring nodes overlap in dense steps. The most important states keep their
  // label, a later label that would cover an earlier one is hidden; the hover card still names it.
  const LABEL_RANK = ["proposal", "lit", "focus"];
  function declutter() {
    const shown = [];
    const ranked = [...nodeEls.values()]
      .filter((g) => !g.classList.contains("off"))
      .map((g) => ({ g, rank: LABEL_RANK.findIndex((cls) => g.classList.contains(cls)) }))
      .filter(({ g, rank }) => rank >= 0 || g.dataset.label === "always")
      .sort((a, b) => (a.rank < 0 ? 99 : a.rank) - (b.rank < 0 ? 99 : b.rank));
    for (const g of nodeEls.values()) g.classList.remove("label-hidden");
    for (const { g } of ranked) {
      const box = g.querySelector("text").getBoundingClientRect();
      if (!box.width) continue;
      const clash = shown.some((other) => box.left < other.right && box.right > other.left && box.top < other.bottom && box.bottom > other.top);
      if (clash) g.classList.add("label-hidden");
      else shown.push(box);
    }
  }

  return { stage };
}
