// The method page: language, header, footer, reading panel and every section. The text comes
// from content.js, the vault from data.json (template) and graph.json (graph and example notes).
// The page reads like a paper: what it is, how to build one, how it is used, data, maintenance,
// and a reference at the end.

import { currentLang, rememberLang, TEXT } from "./content.js";
import { createStepper, phaseStates, resolver } from "./episode.js";
import { createGraph } from "./graph.js";
import { initPanel, openFile } from "./panel.js";

const REPO = "https://github.com/chpollin/second-brain-vault";
const NAV = ["top", "build", "notes", "reference"];

// What the growing graph shows after each of the seven build steps: visible groups, groups
// drawn as a dashed draft, and the groups the step is about.
const SYSTEM = ["core", "control", "rule", "skill", "operations", "check"];
const GROWTH = [
  { show: [], drafts: [], focus: [] },
  { show: ["source"], drafts: [], focus: ["source"] },
  { show: ["source", "project", "moc"], drafts: ["project", "moc"], focus: [] },
  { show: ["source", "project", "moc"], drafts: ["project", "moc"], focus: [] },
  { show: ["source", "project", ...SYSTEM], drafts: [], focus: ["core"] },
  { show: ["source", "project", ...SYSTEM, "concept", "literature"], drafts: [], focus: ["concept", "literature"] },
  { show: ["source", "project", ...SYSTEM, "concept", "literature", "moc"], drafts: [], focus: ["moc"] },
];

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

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return response.json();
}

function renderHeader(t, lang) {
  const other = lang === "en" ? "de" : "en";
  const toggle = h("button", { type: "button", class: "lang", "aria-label": t.switchLabel, lang: other, text: t.switchTo });
  toggle.addEventListener("click", () => {
    rememberLang(other);
    const url = new URL(location.href);
    url.searchParams.set("lang", other);
    location.assign(url);
  });
  document.getElementById("site-head").replaceChildren(
    h("a", { class: "brand", href: "#top" },
      h("img", { src: "assets/dhcraft-mark-white.svg", alt: "", width: "28", height: "28" }),
      h("span", { text: "Second Brain Vault" })),
    h("nav", { class: "site-nav", "aria-label": t.nav.top },
      h("ul", {}, ...NAV.map((id) => h("li", {}, h("a", { href: `#${id}`, text: t.nav[id] }))))),
    h("div", { class: "head-actions" }, toggle, h("a", { class: "pill", href: REPO, text: t.template })),
  );
  document.querySelector(".skip").textContent = t.skip;
}

function initNavState() {
  const links = new Map([...document.querySelectorAll(".site-nav a")].map((link) => [link.hash.slice(1), link]));
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      for (const [id, link] of links) {
        if (id === entry.target.id) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      }
    }
  }, { rootMargin: "-40% 0px -55% 0px" });
  for (const id of links.keys()) {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  }
}

function renderFooter(t) {
  document.getElementById("site-foot").replaceChildren(
    h("div", { class: "foot-grid" },
      h("div", {},
        h("p", {}, `${t.footer.by} `, h("a", { href: "https://dhcraft.org", text: "Digital Humanities Craft" }), `. ${t.footer.license}`),
        h("p", { class: "quiet", text: t.footer.example }),
        h("p", { class: "quiet", text: t.footer.evidence })),
      h("ul", { class: "foot-links" },
        h("li", {}, h("a", { href: REPO, text: t.footer.repo })),
        h("li", {}, h("a", { href: `${REPO}/blob/main/knowledge/paper.md`, text: t.footer.paper })),
        h("li", {}, h("a", { href: `${REPO}/blob/main/LICENSE.md`, text: t.footer.licence }))),
      h("ul", { class: "foot-links" },
        h("li", {}, h("a", { href: "https://github.com/DigitalHumanitiesCraft/Promptotyping", text: "Promptotyping" })),
        h("li", {}, h("a", { href: "https://github.com/DigitalHumanitiesCraft/grounded-vault", text: "Grounded Vault" })),
        h("li", {}, h("a", { href: "https://github.com/DigitalHumanitiesCraft/research-mission-control", text: "Research Mission Control" })))),
  );
}

function renderHero(t, onPlay) {
  const play = h("button", { type: "button", class: "btn primary", text: t.hero.watch });
  play.addEventListener("click", onPlay);
  document.getElementById("hero-text").replaceChildren(
    h("h1", { text: t.hero.title }),
    h("p", { class: "lead", text: t.hero.lead }),
    h("ol", { class: "flow" }, ...t.hero.flow.map(([name, role]) => h("li", {}, h("strong", { text: name }), " ", role))),
    h("p", { class: "who", text: t.hero.who }),
    h("p", { class: "actions" }, play, h("a", { class: "btn", href: "#build", text: t.hero.build })),
  );
  document.getElementById("hero-hint").textContent = t.hero.hint;
}

function copyButton(t, value) {
  // Without the Clipboard API the prompt stays selectable text and no button appears.
  if (!navigator.clipboard?.writeText) return null;
  const copy = h("button", { type: "button", class: "btn ghost small", text: t.build.copy });
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(value);
      copy.textContent = t.build.copied;
    } catch {
      copy.textContent = t.build.copyFailed;
    }
    setTimeout(() => {
      copy.textContent = t.build.copy;
    }, 2500);
  });
  return copy;
}

function renderBuild(t) {
  const b = t.build;
  const tools = h("p", { class: "tools" }, h("span", { class: "tools-label", text: b.toolsLabel }),
    ...b.tools.map(([name, note, href]) => h("span", { class: "tool" }, h("a", { href, text: name }), ` ${note}`)));
  const steps = b.steps.map((step, index) => h("li", { "data-step": String(index) },
    h("h3", { text: step.title }),
    h("p", { text: step.body }),
    step.links ? h("p", { class: "step-links" }, ...step.links.map(([label, href]) => h("a", { href, text: label }))) : null,
    step.prompt ? h("div", { class: "prompt-box" },
      h("pre", { class: "prompt" }, h("code", { text: step.prompt })),
      copyButton(t, step.prompt)) : null));
  document.getElementById("build-steps").replaceChildren(
    h("h2", { text: b.title }),
    tools,
    h("ol", { class: "steps" }, ...steps),
  );
  return steps;
}

function renderNotes(t) {
  const n = t.notes;
  document.getElementById("notes-body").replaceChildren(
    h("h2", { text: n.title }),
    h("div", { class: "columns" },
      h("section", {}, h("h3", { text: n.dataTitle }),
        h("ul", { class: "plain" }, ...n.data.map(([sentence, href]) => h("li", {}, sentence, href ? " " : "", href ? h("a", { href, text: n.source }) : null)))),
      h("section", {}, h("h3", { text: n.careTitle }),
        h("ul", { class: "plain" }, ...n.care.map((sentence) => h("li", { text: sentence }))))),
  );
}

function fileButton(path, label) {
  return h("button", { type: "button", class: "file-link", "data-open": path, text: label });
}

function renderReference(t, data) {
  const r = t.reference;
  const tree = h("ul", { class: "tree", "aria-label": r.treeLabel }, ...r.tree.map(([name, gloss, file, example]) => h("li", {},
    file && data.files[file] ? fileButton(file, name) : h("code", { text: name }),
    h("span", { text: example ? `${gloss}, ${r.example}` : gloss }))));
  const convention = "Vault Operations/Conventions/Convention Frontmatter Field Profiles.md";
  const details = h("details", { class: "reference" },
    h("summary", {}, h("span", { class: "summary-title", text: r.title }), h("span", { class: "summary-sub", text: r.summary })),
    h("div", { class: "ref-body" },
      tree,
      h("div", { class: "ref-notes" },
        h("p", { text: r.governance }),
        h("p", {}, h("strong", { text: `${r.proceduresLabel}. ` }), ...r.procedures.flatMap(([name, gloss], index) => {
          const path = `.claude/skills/${name}/SKILL.md`;
          return [index ? ", " : "", data.files[path] ? fileButton(path, name) : h("code", { text: name }), ` ${gloss}`];
        }), "."),
        ...r.extras.map(([text, file, label]) => h("p", {}, `${text} `, data.files[file] ? fileButton(file, label) : h("code", { text: label }))),
        h("p", {}, `${r.types} `, data.files[convention] ? fileButton(convention, r.typesLink) : r.typesLink, "."))));
  document.getElementById("reference-body").replaceChildren(details);
  // A link to #reference opens the folded reference first.
  if (location.hash === "#reference") details.open = true;
  document.querySelector(".site-nav a[href='#reference']")?.addEventListener("click", () => {
    details.open = true;
  });
}

/** Text for the hover card: the read instruction or first paragraph of a file. */
function describer(data, graph, t) {
  const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
  return (id) => {
    const node = nodes.get(id);
    const file = data.files[id];
    let body = "";
    if (file) {
      const described = file.frontmatter.find(([key]) => key === "description");
      body = described ? described[1] : firstParagraph(file.text);
      if (body.length > 170) body = `${body.slice(0, 170).replace(/\s+\S*$/, "")} …`;
    }
    return { title: node ? node.label : id, kind: t.graph.groups[node?.group] || "", text: body };
  };
}

function firstParagraph(text) {
  const plain = (value) => value.replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1").replace(/\s+/g, " ").trim();
  const callout = text.match(/>\s*\[!info\]\s*Read trigger\s*\n((?:>.*\n?)+)/);
  if (callout) return plain(callout[1].replace(/^>\s?/gm, ""));
  const paragraphs = text.replace(/^---[\s\S]*?\n---\n/, "").split(/\n\s*\n/);
  const first = paragraphs.find((paragraph) => paragraph.trim() && !/^\s*(#|-|\||>)/.test(paragraph)) || "";
  return plain(first);
}

function legend(host, t) {
  // Readers new to the vault see one entry for the whole system frame instead of six categories.
  const groups = ["source", "concept", "moc", "literature", "project", "system"];
  host.replaceChildren(...groups.map((group) => h("span", {}, h("i", { class: group === "moc" ? "hex" : "", style: `background: var(--g-${group === "system" ? "rule" : group})` }), t.graph.legend[group])));
}

function initGrowth(t, graph, proposal, options, steps) {
  const api = createGraph(document.getElementById("grow-graph"), graph, { ...options, frame: true });
  const caption = document.getElementById("grow-caption");
  const ofGroups = (groups) => graph.nodes.filter((node) => groups.includes(node.group) && node.id !== proposal).map((node) => node.id);
  let current = -1;
  function grow(index) {
    if (index === current) return;
    current = index;
    const stage = GROWTH[index];
    const keep = new Set(ofGroups(stage.show));
    const hidden = graph.nodes.map((node) => node.id).filter((id) => !keep.has(id));
    const focus = ofGroups(stage.focus).filter((id) => keep.has(id));
    // In the build, only the core file of the agent rules lights up, not every system file.
    const lit = stage.focus.includes("core") ? ["CLAUDE.md"] : [];
    api.stage({ active: true, hidden, focus: focus.filter((id) => !lit.length || id === "CLAUDE.md"), drafts: ofGroups(stage.drafts), lit });
    steps.forEach((step, position) => step.classList.toggle("current", position === index));
    caption.textContent = `${index + 1}. ${t.build.steps[index].added}`;
  }
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) if (entry.isIntersecting) grow(Number(entry.target.dataset.step));
  }, { rootMargin: "-45% 0px -45% 0px" });
  steps.forEach((step) => {
    observer.observe(step);
    step.addEventListener("focusin", () => grow(Number(step.dataset.step)));
  });
  grow(0);
}

async function main() {
  const lang = currentLang();
  const t = TEXT[lang];
  document.documentElement.lang = lang;
  renderHeader(t, lang);
  renderFooter(t);
  let stepper = null;
  renderHero(t, () => {
    stepper?.start(true);
    document.getElementById("hero-graph").scrollIntoView({ block: "nearest" });
  });
  renderNotes(t);
  const steps = renderBuild(t);
  initNavState();

  let data;
  let graph;
  let episode;
  try {
    [data, graph, episode] = await Promise.all([loadJson("data.json"), loadJson("graph.json"), loadJson("episode.json")]);
  } catch (error) {
    document.getElementById("main").prepend(h("p", { class: "load-error", role: "alert", text: `${error.message}. Run python scripts/build_site.py and python scripts/build_graph.py, then serve docs/ over HTTP.` }));
    return;
  }
  // Example notes join the template files for reading; template names win on a collision.
  Object.assign(data.files, graph.files);
  data.stems = { ...graph.stems, ...data.stems };
  initPanel(data, t);
  renderReference(t, data);

  const resolve = resolver(graph, data);
  const states = phaseStates(episode, resolve);
  const proposal = resolve(episode.phases.find((phase) => phase.proposal).proposal);
  const options = { text: t, describe: describer(data, graph, t), onOpen: openFile };

  // The hero graph shows the finished vault and plays the episode; system labels stay quiet.
  const heroApi = createGraph(document.getElementById("hero-graph"), graph, { ...options, labels: "knowledge" });
  legend(document.getElementById("hero-legend"), t);
  stepper = createStepper(document.getElementById("episode-stepper"), episode, states, heroApi, t);
  initGrowth(t, graph, proposal, options, steps);

  if (location.hash && !location.hash.startsWith("#datei=")) document.querySelector(location.hash)?.scrollIntoView();
}

main();
