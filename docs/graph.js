// The knowledge graph of the method page. Positions come precomputed from docs/graph.json
// (scripts/build_graph.py), so the browser only draws, animates between the stored layouts and
// answers interaction. Every node is a focusable control: arrow keys move to a neighbour in that
// direction and Enter opens the file, so the picture works without a pointer.

const NS = "http://www.w3.org/2000/svg";
const SCALE = 50;
const GROUPS = ["core", "control", "rule", "skill", "operations", "check", "moc", "concept", "literature", "project", "source"];
const SYSTEM = new Set(["core", "control", "rule", "skill", "operations", "check"]);
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, reducedMotion() ? 0 : ms));

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
 * @param {{layout?: string, onOpen?: Function, describe?: Function, text: object}} options
 */
export function createGraph(host, graph, options) {
  const text = options.text;
  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  const neighbours = new Map(graph.nodes.map((node) => [node.id, new Set()]));
  for (const [a, b] of graph.edges) {
    neighbours.get(a).add(b);
    neighbours.get(b).add(a);
  }
  let layout = options.layout || "themen";
  const pos = new Map(graph.nodes.map((node) => [node.id, node[layout].map((v) => v * SCALE)]));
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
  const trailLayer = el("g", { class: "trails", "aria-hidden": "true" }, svg);
  const nodeLayer = el("g", { class: "nodes" }, svg);
  const markLayer = el("g", { class: "marks", "aria-hidden": "true" }, svg);

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
    // The hero labels knowledge only; elsewhere the entry points CLAUDE and HOME are named too.
    const entry = node.id === "CLAUDE.md" || node.id === "HOME.md";
    if (node.group === "moc" || (entry && options.labels !== "knowledge")) g.dataset.label = "always";
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

  let animation = 0;
  function setLayout(name) {
    if (name === layout) return;
    layout = name;
    const from = new Map([...pos].map(([id, xy]) => [id, [...xy]]));
    const to = new Map(graph.nodes.map((node) => [node.id, node[name].map((v) => v * SCALE)]));
    cancelAnimationFrame(animation);
    if (reducedMotion()) {
      for (const [id, xy] of to) pos.set(id, xy);
      place();
      return;
    }
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / 1100);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
      for (const [id, [x1, y1]] of from) {
        const [x2, y2] = to.get(id);
        pos.set(id, [x1 + (x2 - x1) * ease, y1 + (y2 - y1) * ease]);
      }
      place();
      if (t < 1) animation = requestAnimationFrame(step);
    };
    animation = requestAnimationFrame(step);
  }

  /** Nodes outside `visible` fade out; used while a vault is being built step by step. */
  function setVisible(visible) {
    hidden = new Set(graph.nodes.map((node) => node.id).filter((id) => !visible.has(id)));
    place();
  }

  const STATE_CLASSES = ["lit", "found", "proposal", "accepted", "updated", "checking", "focus"];
  let token = 0;

  function mark(id, label, kind) {
    const [x, y] = pos.get(id);
    const r = radiusOf(byId.get(id));
    const g = el("g", { class: `marker ${kind}`, transform: `translate(${x.toFixed(2)} ${(y + r + 4.4).toFixed(2)})` }, markLayer);
    const width = label.length * 1.5 + 3.2;
    el("rect", { x: -width / 2, y: -2.5, width, height: 3.8, rx: 1.9 }, g);
    const t = el("text", { "text-anchor": "middle", y: 0.45 }, g);
    t.textContent = label;
  }

  function question(nearId) {
    const [x, y] = pos.get(nearId);
    const length = Math.hypot(x, y) || 1;
    const qx = (x / length) * 56;
    const qy = (y / length) * 56;
    el("line", { class: "question-line", x1: qx, y1: qy, x2: x, y2: y }, markLayer);
    const g = el("g", { class: "marker question", transform: `translate(${qx.toFixed(2)} ${qy.toFixed(2)})` }, markLayer);
    el("circle", { r: 2.8 }, g);
    const t = el("text", { "text-anchor": "middle", y: 1.2 }, g);
    t.textContent = "?";
  }

  async function drawTrail(sequence, myToken) {
    let previous = null;
    for (const id of sequence) {
      if (myToken !== token) return;
      if (!pos.has(id)) continue;
      const [x, y] = pos.get(id);
      if (previous) {
        const [px, py] = pos.get(previous);
        // Between two frame nodes the path bends outward along the rim instead of cutting
        // through the knowledge in the middle.
        const rim = Math.hypot(px, py) > SCALE * 0.8 && Math.hypot(x, y) > SCALE * 0.8;
        const bend = rim ? 1.3 : 1;
        el("path", { class: "trail", d: `M${px} ${py} Q${((px + x) / 2) * bend} ${((py + y) / 2) * bend} ${x} ${y}` }, trailLayer);
      }
      nodeEls.get(id).classList.add("lit");
      previous = id;
      await wait(520);
    }
  }

  /**
   * Show one episode state. Every call starts from a clean picture, so a state is fully
   * described by its object and stepping backwards needs no undo.
   */
  async function stage(state = {}) {
    token += 1;
    const myToken = token;
    trailLayer.replaceChildren();
    markLayer.replaceChildren();
    for (const g of nodeEls.values()) g.classList.remove(...STATE_CLASSES);
    for (const edge of edgeEls) edge.line.classList.remove("proposal-edge");
    hidden = new Set(state.hidden || []);
    place();
    if (state.active) svg.dataset.playing = "true";
    else delete svg.dataset.playing;

    const add = (ids, cls) => ids && ids.forEach((id) => nodeEls.get(id)?.classList.add(cls));
    add(state.focus, "focus");
    add(state.found, "found");
    add(state.lit, "lit");
    add(state.checking, "checking");
    add(state.updated, "updated");
    add(state.drafts, "proposal");
    if (state.proposal) {
      nodeEls.get(state.proposal).classList.add("proposal");
      for (const edge of edgeEls) {
        if (edge.a === state.proposal || edge.b === state.proposal) edge.line.classList.add("proposal-edge");
      }
    }
    if (state.accepted) nodeEls.get(state.accepted).classList.add("accepted");
    if (state.question) question(state.question);
    if (state.gate) mark(state.gate, text.graph.decide, "gate");
    if (state.transfer) mark(state.transfer, text.graph.checkConditions, "transfer");
    if (state.pulse) {
      for (const id of neighbours.get(state.pulse)) {
        if (hidden.has(id) || isSystem(id)) continue;
        const [x, y] = pos.get(id);
        const r = radiusOf(byId.get(id));
        const ring = el("circle", { class: "pulse", cx: x, cy: y, r }, trailLayer);
        if (!reducedMotion()) ring.animate([{ opacity: 1, r }, { opacity: 0, r: r * 4 }], { duration: 1400, iterations: 2 });
      }
    }
    if (state.trail) await drawTrail(state.trail, myToken);
  }

  return { setLayout, setVisible, stage, has: (id) => nodeEls.has(id), ids: () => graph.nodes.map((node) => node.id) };
}
