// Three candidate heroes for the example episode, for the operator's comparison only.
//   ?v=a  focus graph: the notes of the example on fixed, collision-free places, the rest of
//         the vault as a faint background
//   ?v=b  note card: the decision note itself grows phase by phase, with its reasons
//   ?v=c  lanes: who does what in each phase, You, the assistant and the notes touched
// All three share a stepper that names every phase and marks done, current and next.

import { currentLang, TEXT } from "../content.js";

const NS = "http://www.w3.org/2000/svg";
const lang = currentLang();
const t = TEXT[lang];
const variant = new URLSearchParams(location.search).get("v") || "a";
document.documentElement.lang = lang;

const L = {
  en: {
    variants: { a: "A Focus graph", b: "B Note card", c: "C Lanes" },
    question: "Question", found: "Found", notRead: "found, not yet read", proposal: "Proposal by the assistant", decision: "Decision",
    grounds: "Grounds", alternative: "Alternative considered", conditions: "Conditions", yourCheck: "Your check",
    sources: "Sources checked", reasoning: "Reasoning checked", accepted: "Accepted by you", filed: "Linked from",
    finding: "Finding from the test", reuse: "Reused by", informs: "Conditions differ, so it informs a new decision.",
    you: "You", assistant: "Assistant", notes: "Notes touched", draft: "draft",
  },
  de: {
    variants: { a: "A Fokusgraph", b: "B Notizkarte", c: "C Bahnen" },
    question: "Frage", found: "Gefunden", notRead: "gefunden, noch nicht gelesen", proposal: "Vorschlag des Assistenten", decision: "Entscheidung",
    grounds: "Gründe", alternative: "Verworfene Alternative", conditions: "Bedingungen", yourCheck: "Deine Prüfung",
    sources: "Quellen geprüft", reasoning: "Begründung geprüft", accepted: "Von dir angenommen", filed: "Verlinkt von",
    finding: "Befund aus der Prüfung", reuse: "Wiederverwendet von", informs: "Die Bedingungen weichen ab, also informiert sie eine neue Entscheidung.",
    you: "Du", assistant: "Assistent", notes: "Berührte Notizen", draft: "Entwurf",
  },
}[lang];

function h(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else node.setAttribute(key, value);
  }
  node.append(...children.filter((child) => child !== null && child !== undefined && child !== ""));
  return node;
}

function svg(name, attrs = {}, parent) {
  const node = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  if (parent) parent.append(node);
  return node;
}

// The notes of the example, the phase in which each first matters, and its state per phase.
// Hand-placed for the focus graph: columns run from entry points to the decision and its later use.
const NOTES = [
  { label: "HOME", x: 90, y: 110, group: "control" },
  { label: "Project Overview Photo Archive", short: "Photo Archive project", x: 90, y: 250, group: "project" },
  { label: "Data Management MOC", short: "Data Management", x: 90, y: 390, group: "moc" },
  { label: "Archival Master", x: 360, y: 90, group: "concept" },
  { label: "File Format", x: 360, y: 180, group: "concept" },
  { label: "Access Copy", x: 360, y: 270, group: "concept" },
  { label: "Scan Protocol 2025", x: 360, y: 360, group: "source" },
  { label: "FAIR Principles", x: 360, y: 450, group: "concept" },
  { label: "Decision Image Master Format", short: "Decision: master format", x: 650, y: 230, group: "concept", decision: true },
  { label: "Online Presentation Photo Archive", short: "Online presentation", x: 650, y: 400, group: "project" },
  { label: "Metadata Standard", x: 650, y: 500, group: "concept" },
  { label: "Project Overview Oral History Collection", short: "Oral History project", x: 900, y: 120, group: "project" },
];
const EDGES = [
  ["HOME", "Data Management MOC"], ["HOME", "Project Overview Photo Archive"], ["Data Management MOC", "Archival Master"],
  ["Data Management MOC", "File Format"], ["Archival Master", "Access Copy"], ["File Format", "Scan Protocol 2025"],
  ["Data Management MOC", "FAIR Principles"], ["Archival Master", "Decision Image Master Format"], ["File Format", "Decision Image Master Format"],
  ["Scan Protocol 2025", "Decision Image Master Format"], ["Project Overview Photo Archive", "Decision Image Master Format"],
  ["Data Management MOC", "Decision Image Master Format"], ["Online Presentation Photo Archive", "Metadata Standard"],
  ["Project Overview Photo Archive", "Online Presentation Photo Archive"], ["Project Overview Oral History Collection", "Decision Image Master Format"],
];
// State of each note per phase: q question, read, found, draft, check, accepted, updated, reuse.
const STATES = [
  { HOME: "q", "Data Management MOC": "q", "Project Overview Photo Archive": "q" },
  { HOME: "read", "Project Overview Photo Archive": "read", "Data Management MOC": "read", "Archival Master": "read", "File Format": "read", "Scan Protocol 2025": "read", "FAIR Principles": "read", "Access Copy": "found" },
  { "Archival Master": "read", "File Format": "read", "Scan Protocol 2025": "read", "Access Copy": "read", "Decision Image Master Format": "draft" },
  { "Archival Master": "check", "File Format": "check", "Scan Protocol 2025": "check", "Decision Image Master Format": "draft" },
  { "Decision Image Master Format": "accepted", "Data Management MOC": "updated", "Project Overview Photo Archive": "updated" },
  { "Decision Image Master Format": "accepted", "Online Presentation Photo Archive": "read", "Metadata Standard": "updated", "Project Overview Photo Archive": "updated" },
  { "Decision Image Master Format": "reuse", "Project Overview Oral History Collection": "q", HOME: "read" },
];

async function loadGraph() {
  const response = await fetch("../graph.json");
  return response.json();
}

function renderNav() {
  document.getElementById("variant-nav").replaceChildren(...Object.entries(L.variants).map(([key, label]) => {
    const url = new URL(location.href);
    url.searchParams.set("v", key);
    const link = h("a", { href: url.search, text: label });
    if (key === variant) link.setAttribute("aria-current", "true");
    return h("li", {}, link);
  }));
}

function renderHeroText() {
  document.getElementById("hero-text").replaceChildren(
    h("h1", { text: t.hero.title }),
    h("p", { class: "lead", text: t.hero.lead }),
    h("ol", { class: "flow" }, ...t.hero.flow.map(([name, role]) => h("li", {}, h("strong", { text: name }), " ", role))),
  );
}

// A stepper that names every phase and marks done, current and next by shape, not colour alone.
function createStepper(onShow) {
  const phases = ["question", "recover", "propose", "decide", "incorporate", "test", "reuse"];
  const actors = { question: "you", recover: "agent", propose: "agent", decide: "you", incorporate: "agent", test: "both", reuse: "both" };
  const host = document.getElementById("stepper");
  const list = h("ol", { class: "lab-steps" });
  const caption = h("p", { class: "lab-caption", "aria-live": "polite" });
  const prev = h("button", { type: "button", class: "btn ghost", text: t.episode.prev });
  const play = h("button", { type: "button", class: "btn primary", text: t.episode.play });
  const next = h("button", { type: "button", class: "btn ghost", text: t.episode.next });
  const items = phases.map((id, index) => {
    const [title] = t.episode.phases[id];
    const button = h("button", { type: "button", class: "lab-step", "data-actor": actors[id] },
      h("span", { class: "dot", "aria-hidden": "true", text: String(index + 1) }),
      h("span", { class: "name", text: title }),
      h("span", { class: "who", text: t.episode.actors[actors[id]] }));
    button.addEventListener("click", () => show(index, true));
    list.append(h("li", {}, button));
    return button;
  });
  host.replaceChildren(h("p", { class: "lab-title", text: t.episode.title }), list, caption, h("p", { class: "lab-controls" }, prev, play, next));
  let index = -1;
  let timer = 0;
  function show(target, stop = false) {
    if (stop) halt();
    index = Math.max(0, Math.min(target, phases.length - 1));
    items.forEach((item, position) => {
      item.dataset.state = position < index ? "done" : position === index ? "current" : "next";
      item.setAttribute("aria-current", position === index ? "step" : "false");
    });
    const [title, body, example] = t.episode.phases[phases[index]];
    caption.replaceChildren(h("strong", { text: `${t.episode.actors[actors[phases[index]]]}: ${title}. ` }), body, h("span", { class: "phase-example", text: example }));
    prev.disabled = index === 0;
    next.disabled = index === phases.length - 1;
    if (index === phases.length - 1) caption.append(" ", h("a", { class: "btn small", href: "../#build", text: t.hero.build }));
    onShow(index);
  }
  function halt() {
    clearTimeout(timer);
    timer = 0;
    play.textContent = t.episode.play;
  }
  function tick() {
    if (index >= phases.length - 1) return halt();
    show(index + 1);
    timer = setTimeout(tick, 5000);
  }
  play.addEventListener("click", () => {
    if (timer) return halt();
    play.textContent = t.episode.pause;
    show(index >= phases.length - 1 ? 0 : index + 1);
    timer = setTimeout(tick, 5000);
  });
  prev.addEventListener("click", () => show(index - 1, true));
  next.addEventListener("click", () => show(index + 1, true));
  prev.disabled = true;
  return { show };
}

// Variant A: the example's notes as labelled pills on fixed places, the vault faint behind.
function focusGraph(graph) {
  const host = document.getElementById("visual");
  const root = svg("svg", { viewBox: "0 0 1000 600", class: "lab-graph", role: "img", "aria-label": t.graph.label });
  const back = svg("g", { class: "lab-back", "aria-hidden": "true" }, root);
  for (const node of graph.nodes) {
    svg("circle", { cx: 500 + node.xy[0] * 280, cy: 300 + node.xy[1] * 280, r: 3, style: `fill: var(--g-${node.group})` }, back);
  }
  const edgeLayer = svg("g", {}, root);
  const byLabel = new Map(NOTES.map((note) => [note.label, note]));
  const edges = EDGES.map(([a, b]) => {
    const p = byLabel.get(a);
    const q = byLabel.get(b);
    const mx = (p.x + q.x) / 2;
    return { a, b, path: svg("path", { class: "lab-edge", d: `M${p.x} ${p.y} C${mx} ${p.y} ${mx} ${q.y} ${q.x} ${q.y}` }, edgeLayer) };
  });
  const pills = NOTES.map((note) => {
    const text = note.short || note.label;
    const width = text.length * 9.6 + 40;
    const g = svg("g", { class: `lab-pill${note.decision ? " decision" : ""}`, transform: `translate(${note.x} ${note.y})` }, root);
    svg("rect", { x: -width / 2, y: -19, width, height: 38, rx: 19 }, g);
    svg("circle", { cx: -width / 2 + 16, cy: 0, r: 5, style: `fill: var(--g-${note.group})` }, g);
    const label = svg("text", { x: -width / 2 + 30, y: 6 }, g);
    label.textContent = text;
    const badge = svg("text", { class: "badge-text", x: 0, y: -27, "text-anchor": "middle" }, g);
    return { note, g, badge };
  });
  host.replaceChildren(root);
  return (index) => {
    const states = STATES[index];
    for (const { note, g, badge } of pills) {
      const state = states[note.label] || "";
      g.dataset.state = state;
      badge.textContent = "";
      if (note.decision && index === 2) badge.textContent = L.draft;
      if (note.decision && index === 3) badge.textContent = t.graph.decide;
      if (note.decision && index === 6) badge.textContent = t.graph.checkConditions;
    }
    for (const { a, b, path } of edges) path.dataset.on = String(Boolean(states[a] && states[b]));
  };
}

// Variant B: the decision note grows with the example, so its reasons stay visible.
function noteCard(graph) {
  const host = document.getElementById("visual");
  const chip = (label, kind = "") => h("span", { class: `chip ${kind}`, text: label });
  const card = h("article", { class: "note-card" });
  host.replaceChildren(card);
  const decisionText = graph.files["example/Data Management/Decision Image Master Format.md"]?.text || "";
  const section = (name) => (decisionText.split(`## ${name}`)[1] || "").split("\n## ")[0].trim()
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1").split("\n").map((line) => line.replace(/^- /, "")).filter(Boolean);
  const [, , qExample] = t.episode.phases.question;
  const fields = [
    (i) => h("div", { class: "field" }, h("h4", { text: L.question }), h("p", { text: qExample })),
    (i) => h("div", { class: "field" }, h("h4", { text: L.found }), h("p", {}, chip("Archival Master"), chip("File Format"), chip("Scan Protocol 2025"), chip("FAIR Principles"), chip(`Access Copy, ${L.notRead}`, "faint"))),
    // Once decided, the proposal keeps its decision and conditions in one block, because the
    // generic collapse of past fields would leave the reason headings empty.
    (i, past) => past
      ? h("div", { class: "field proposal compact" }, h("h4", { text: L.decision }),
        h("p", { text: [...section("Decision"), `${L.conditions}: ${section("Conditions").join(" ")}`].join(" ") }))
      : h("div", { class: "field proposal" }, h("h4", { text: `${L.decision}` }), ...section("Decision").map((line) => h("p", { text: line })),
        h("h4", { text: L.grounds }), h("ul", {}, ...section("Grounds").map((line) => h("li", { text: line }))),
        h("h4", { text: L.alternative }), ...section("Alternative considered").map((line) => h("p", { text: line })),
        h("h4", { text: L.conditions }), ...section("Conditions").map((line) => h("p", { text: line }))),
    (i) => h("div", { class: "field check" }, h("h4", { text: L.yourCheck }), h("p", { class: "ticks" }, h("span", { text: `✓ ${L.sources}` }), h("span", { text: `✓ ${L.reasoning}` }), h("strong", { text: `✓ ${L.accepted}` }))),
    (i) => h("div", { class: "field" }, h("h4", { text: L.filed }), h("p", {}, chip("Data Management"), chip("Photo Archive project"))),
    (i) => h("div", { class: "field" }, h("h4", { text: L.finding }), h("p", { text: t.episode.phases.test[2] })),
    (i) => h("div", { class: "field" }, h("h4", { text: L.reuse }), h("p", {}, chip("Oral History project")), h("p", { class: "conditions", text: L.informs })),
  ];
  return (index) => {
    card.dataset.state = index < 2 ? "empty" : index < 4 ? "draft" : "accepted";
    const head = h("header", {}, h("span", { class: "note-kind", text: index < 4 ? L.proposal : L.accepted }), h("h3", { text: "Decision Image Master Format" }));
    const shown = fields.map((render, position) => {
      if (position > index) return null;
      const field = render(index, position < index);
      field.classList.add(position === index ? "now" : "past");
      return field;
    });
    card.replaceChildren(head, ...shown.filter(Boolean));
    // Keep the field of the current phase in view inside the card.
    const now = card.querySelector(".field.now");
    if (now) card.scrollTop = Math.max(0, now.offsetTop - card.clientHeight + now.offsetHeight + 16);
  };
}

// Variant C: lanes for you, the assistant and the notes, one column per phase.
function lanes() {
  const host = document.getElementById("visual");
  const phases = ["question", "recover", "propose", "decide", "incorporate", "test", "reuse"];
  const you = ["Asks about the format", "", "", "Checks sources and reasoning, accepts", "", "Tests the online presentation", "Asks about audio"];
  const youDe = ["Fragt nach dem Format", "", "", "Prüft Quellen und Begründung, nimmt an", "", "Prüft die Online-Präsentation", "Fragt nach Audio"];
  const agent = ["", "Follows links from HOME", "Drafts the decision note", "", "Files it, updates links", "Records the finding", "Finds the decision, checks conditions"];
  const agentDe = ["", "Folgt Verweisen ab HOME", "Entwirft die Entscheidungsnotiz", "", "Legt sie ab, führt Verweise nach", "Hält den Befund fest", "Findet die Entscheidung, prüft Bedingungen"];
  const notes = [["Photo Archive project"], ["Archival Master", "File Format", "Scan Protocol"], ["Decision (draft)"], ["Decision (draft)"], ["Decision", "Data Management"], ["Metadata Standard"], ["Decision", "Oral History project"]];
  const de = lang === "de";
  const table = h("div", { class: "lanes", role: "table", "aria-label": t.episode.title });
  const header = h("div", { class: "lane-row head", role: "row" }, h("span", { role: "columnheader" }), ...phases.map((id, i) => h("span", { role: "columnheader", "data-col": String(i), text: t.episode.phases[id][0] })));
  const row = (label, cells, kind) => h("div", { class: `lane-row ${kind}`, role: "row" }, h("span", { role: "rowheader", class: "lane-label", text: label }),
    ...cells.map((cell, i) => h("span", { role: "cell", "data-col": String(i) }, ...(Array.isArray(cell) ? cell.map((c) => h("span", { class: "chip", text: c })) : [cell]))));
  table.append(header, row(L.you, de ? youDe : you, "you"), row(L.assistant, de ? agentDe : agent, "agent"), row(L.notes, notes, "notes"));
  host.replaceChildren(table);
  return (index) => {
    for (const cell of table.querySelectorAll("[data-col]")) {
      const col = Number(cell.dataset.col);
      cell.dataset.state = col < index ? "done" : col === index ? "current" : "next";
    }
  };
}

async function main() {
  renderNav();
  renderHeroText();
  const graph = await loadGraph();
  const render = variant === "b" ? noteCard(graph) : variant === "c" ? lanes() : focusGraph(graph);
  createStepper(render).show(0);
}

main();
