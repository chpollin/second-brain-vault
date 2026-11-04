// The hero example: one research episode on the example vault, from docs/episode.json.
// A focus graph shows where the notes of the episode lie and how they link, a note card shows
// what the decision note says, and a stepper names each phase and who acts in it. Narrow
// screens list the involved notes instead of scaling the graph down to unreadable labels.

const NS = "http://www.w3.org/2000/svg";
const PILL_HEIGHT = 42;
// The decision note carries its state as a second line inside the pill, where no link can cross it.
const DECISION_HEIGHT = 68;
const PHASE_MS = 5600;

/** A link drawn as a curve with horizontal tangents, so it leaves and enters a pill sideways. */
export function linkPath(p, q) {
  if (p.x === q.x) return `M${p.x} ${p.y} L${q.x} ${q.y}`;
  const mx = (p.x + q.x) / 2;
  return `M${p.x} ${p.y} C${mx} ${p.y} ${mx} ${q.y} ${q.x} ${q.y}`;
}

/** Points along a link, for checking that it passes no pill it does not connect. */
export function linkPoints(p, q, steps = 40) {
  const mx = (p.x + q.x) / 2;
  const points = [];
  for (let i = 0; i <= steps; i += 1) {
    const s = i / steps;
    const r = 1 - s;
    if (p.x === q.x) points.push({ x: p.x, y: p.y + (q.y - p.y) * s });
    else points.push({ x: r ** 3 * p.x + 3 * r * r * s * mx + 3 * r * s * s * mx + s ** 3 * q.x, y: (r ** 3 + 3 * r * r * s) * p.y + (3 * r * s * s + s ** 3) * q.y });
  }
  return points;
}

export const labelOf = (note) => note.short || note.title;

function h(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else node.setAttribute(key, value);
  }
  node.append(...children.filter((child) => child !== null && child !== undefined && child !== false && child !== ""));
  return node;
}

function svg(name, attrs = {}, parent) {
  const node = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  if (parent) parent.append(node);
  return node;
}

/** Sections of a Markdown note by their level-two heading. */
function sections(text) {
  const result = {};
  for (const part of text.split(/\n## /).slice(1)) {
    const [heading, ...body] = part.split("\n");
    result[heading.trim()] = body.join("\n").trim();
  }
  return result;
}

/**
 * @param {{episode: object, graph: object, text: object, onOpen: Function}} options
 */
export function initHero({ episode, graph, text, onOpen }) {
  const t = text.episode;
  const c = t.card;
  const pathOf = (title) => graph.stems[title];
  const notes = new Map(episode.notes.map((note) => [note.title, note]));
  const decision = sections(graph.files[pathOf(episode.decision)]?.text || "");

  // A note title as a button that opens the note in the reading panel.
  function noteButton(title, label = labelOf(notes.get(title) || { title }), extra = "") {
    const button = h("button", { type: "button", class: `chip ${extra}`.trim(), text: label });
    button.addEventListener("click", () => onOpen(pathOf(title), button));
    return button;
  }
  // Note text with its wikilinks turned into note buttons. Punctuation right after a link stays
  // on the button's line.
  function linked(line) {
    const parts = line.replace(/^- /, "").split(/\[\[([^\]]+)\]\]/);
    const out = [];
    for (let i = 0; i < parts.length; i += 1) {
      if (i % 2 === 0) {
        out.push(parts[i]);
        continue;
      }
      const [target, alias = target] = parts[i].split("|");
      const [, mark = "", rest = ""] = (parts[i + 1] || "").match(/^([.,;:]?)([\s\S]*)$/) || [];
      out.push(h("span", { class: "nowrap" }, noteButton(target, alias), mark));
      parts[i + 1] = rest;
    }
    return out;
  }
  // German readers get a translation of the English example note from content.js.
  const lines = (name) => (t.note?.[name] || decision[name] || "").split("\n").filter(Boolean);

  // Graph.
  const graphHost = document.getElementById("hero-graph");
  const root = svg("svg", { viewBox: "0 0 1000 515", class: "focus-graph", role: "group", "aria-label": text.graph.label });
  const linkLayer = svg("g", { "aria-hidden": "true" }, root);
  const links = episode.links.map(([a, b]) => ({ a, b, path: svg("path", { class: "link", d: linkPath(notes.get(a), notes.get(b)) }, linkLayer) }));
  const pills = episode.notes.map((note) => {
    const isDecision = note.title === episode.decision;
    const height = isDecision ? DECISION_HEIGHT : PILL_HEIGHT;
    const g = svg("g", { class: `pill${isDecision ? " decision" : ""}`, role: "button", tabindex: 0, transform: `translate(${note.x} ${note.y})` }, root);
    const rect = svg("rect", { y: -height / 2, height, rx: PILL_HEIGHT / 2 }, g);
    const label = svg("text", { y: isDecision ? -4 : 7, "text-anchor": "middle" }, g);
    label.textContent = labelOf(note);
    const badge = svg("text", { class: "badge", y: 22, "text-anchor": "middle" }, g);
    const open = () => onOpen(pathOf(note.title), g);
    g.addEventListener("click", open);
    g.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
    return { note, g, rect, label, badge };
  });
  const legend = h("p", { class: "focus-legend", text: t.legend });
  const list = h("ul", { class: "focus-list", "aria-label": t.involved });
  graphHost.replaceChildren(root, list, legend);
  // Pills are sized from the rendered label and badge, so no text crosses its border.
  function sizePills() {
    for (const { rect, label, badge } of pills) {
      const width = Math.ceil(Math.max(label.getComputedTextLength(), badge.getComputedTextLength())) + 40;
      if (!width || width < 40) continue;
      rect.setAttribute("x", -width / 2);
      rect.setAttribute("width", width);
    }
  }
  sizePills();
  document.fonts?.ready.then(sizePills);

  // Card.
  const card = document.getElementById("hero-card");
  card.setAttribute("tabindex", "0");
  card.setAttribute("aria-label", c.label);
  const field = (heading, ...body) => h("section", { class: "field" }, h("h4", { text: heading }), ...body);
  const decisionLine = () => h("p", {}, ...lines("Decision").flatMap(linked));
  const head = (title, marker, kind) => h("header", {}, h("h3", { text: title }), marker ? h("span", { class: `marker ${kind}`, text: marker }) : null);
  const translated = () => (c.translated ? h("p", { class: "quiet", text: c.translated }) : null);
  const [, , question] = t.phases.question;
  const cards = {
    question: () => [head(question, c.noNote, "open"), h("p", { class: "quiet" }, c.askedIn, " ", noteButton("Project Overview Photo Archive")), h("p", { text: c.lookFirst })],
    recover: () => [head(question, c.noNote, "open"), field(c.found,
      h("p", {}, ...["Archival Master", "File Format", "Scan Protocol 2025", "FAIR Principles"].map((title) => noteButton(title))),
      h("p", { class: "quiet" }, noteButton("Access Copy", undefined, "faint"), ` ${c.notRead}`))],
    propose: () => [head(episode.decision, t.badges.proposal, "proposal"), decisionLine(),
      field(c.grounds, h("ul", {}, ...lines("Grounds").map((line) => h("li", {}, ...linked(line))))),
      field(c.alternative, ...lines("Alternative considered").map((line) => h("p", { text: line }))), translated()],
    decide: () => [head(episode.decision, t.badges.decide, "proposal"), decisionLine(),
      field(c.grounds, h("ul", { class: "checked" }, ...lines("Grounds").map((line) => h("li", {}, h("span", { class: "tick", "aria-hidden": "true", text: "✓" }), h("span", { class: "visually-hidden", text: `${c.checked}: ` }), " ", ...linked(line))))),
      h("p", { class: "verdict", text: c.verdict })],
    incorporate: () => [head(episode.decision, t.badges.accepted, "accepted"), decisionLine(),
      field(c.linkedFrom, h("p", {}, noteButton("Data Management MOC"), noteButton("Project Overview Photo Archive"))),
      field(c.conditions, ...lines("Conditions").map((line) => h("p", { text: line })))],
    test: () => [head(episode.decision, t.badges.accepted, "accepted"), decisionLine(),
      field(c.finding, h("p", { text: t.phases.test[2] }), h("p", { class: "quiet" }, c.recordedIn, " ", noteButton("Metadata Standard"), noteButton("Project Overview Photo Archive")))],
    reuse: () => [head(episode.decision, t.badges.conditions, "warn"), decisionLine(),
      field(c.compare,
        h("dl", { class: "compare" },
          h("dt", { text: c.conditions }), h("dd", { text: lines("Conditions")[0] || "" }),
          h("dt", {}, noteButton("Project Overview Oral History Collection")), h("dd", { text: c.asks })),
        h("p", { class: "verdict", text: c.informs }))],
  };

  // Stepper.
  const stepperHost = document.getElementById("hero-stepper");
  const steps = h("ol", { class: "steps-track" });
  const status = h("p", { class: "step-status", "aria-hidden": "true" });
  const caption = h("p", { class: "step-caption", "aria-live": "polite" });
  const prev = h("button", { type: "button", class: "btn ghost", text: t.prev });
  const play = h("button", { type: "button", class: "btn primary", text: t.play });
  const next = h("button", { type: "button", class: "btn ghost", text: t.next });
  const buttons = episode.phases.map((phase, index) => {
    const [title] = t.phases[phase.id];
    const button = h("button", { type: "button", class: "step" },
      h("span", { class: "dot", "aria-hidden": "true" }, h("span", { text: String(index + 1) })),
      h("span", { class: "name", text: title }),
      h("span", { class: "who", text: t.actors[phase.actor] }));
    button.addEventListener("click", () => show(index, true));
    steps.append(h("li", {}, button));
    return button;
  });
  stepperHost.replaceChildren(
    h("div", { class: "step-head" }, h("h2", { class: "step-title", text: t.title }), h("p", { class: "step-controls" }, prev, play, next)),
    status, steps, caption);

  let index = -1;
  let timer = 0;
  function show(target, stop = false) {
    if (stop) halt();
    index = Math.max(0, Math.min(target, episode.phases.length - 1));
    const phase = episode.phases[index];
    const total = episode.phases.length;
    buttons.forEach((button, position) => {
      const state = position < index ? "done" : position === index ? "current" : "next";
      const other = episode.phases[position];
      button.dataset.state = state;
      button.setAttribute("aria-current", state === "current" ? "step" : "false");
      button.setAttribute("aria-label", t.stepLabel(position + 1, total, t.phases[other.id][0], t.actors[other.actor], t.stepStates[state]));
    });
    const [title, body] = t.phases[phase.id];
    status.textContent = `${t.stepOf(index + 1, total)}: ${title}, ${t.actors[phase.actor]}`;
    caption.replaceChildren(h("strong", { text: `${t.actors[phase.actor]}: ${title}. ` }), body);
    if (index === total - 1) caption.append(" ", h("a", { href: "#build", text: text.hero.build }));
    play.setAttribute("aria-pressed", String(Boolean(timer)));
    prev.disabled = index === 0;
    next.disabled = index === total - 1;

    for (const pill of pills) {
      const state = phase.states[pill.note.title] || "";
      pill.g.dataset.state = state;
      pill.badge.textContent = pill.note.title === episode.decision && phase.badge ? t.badges[phase.badge] : "";
      pill.g.setAttribute("aria-label", state ? `${pill.note.title}, ${t.noteStates[state]}` : pill.note.title);
      // Before the proposal exists, the decision note is not yet part of the vault.
      const absent = pill.note.title === episode.decision && index < 2;
      pill.g.classList.toggle("absent", absent);
      pill.g.setAttribute("tabindex", absent ? "-1" : "0");
      pill.g.setAttribute("aria-hidden", String(absent));
    }
    sizePills();
    for (const link of links) {
      link.path.dataset.on = String(Boolean(phase.states[link.a] && phase.states[link.b]));
      link.path.classList.toggle("absent", index < 2 && (link.a === episode.decision || link.b === episode.decision));
    }
    list.replaceChildren(...episode.notes.filter((note) => phase.states[note.title]).map((note) => {
      const state = phase.states[note.title];
      return h("li", { "data-state": state }, noteButton(note.title), h("span", { text: note.title === episode.decision && phase.badge ? t.badges[phase.badge] : t.noteStates[state] }));
    }));
    card.dataset.state = phase.states[episode.decision] || "none";
    card.replaceChildren(...cards[phase.id]());
    card.scrollTop = 0;
  }
  function halt() {
    clearTimeout(timer);
    timer = 0;
    play.textContent = t.play;
    play.setAttribute("aria-pressed", "false");
  }
  function tick() {
    if (index >= episode.phases.length - 1) return halt();
    show(index + 1);
    timer = setTimeout(tick, PHASE_MS);
  }
  play.addEventListener("click", () => {
    if (timer) return halt();
    play.textContent = t.pause;
    play.setAttribute("aria-pressed", "true");
    show(index >= episode.phases.length - 1 ? 0 : index + 1);
    timer = setTimeout(tick, PHASE_MS);
  });
  prev.addEventListener("click", () => show(index - 1, true));
  next.addEventListener("click", () => show(index + 1, true));
  show(0);
}
