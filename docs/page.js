// The method page: language, header, footer, reading panel and every section. The text comes
// from content.js, the vault from data.json (template) and graph.json (graph and example notes).
// The page reads like a paper: what it is, how to build one, how it is used, data, maintenance,
// and a reference at the end.

import { currentLang, rememberLang, TEXT } from "./content.js";
import { createStepper, phaseStates, resolver } from "./episode.js";
import { createGraph } from "./graph.js";
import { initPanel, openFile } from "./panel.js";

const REPO = "https://github.com/chpollin/second-brain-vault";
const NAV = ["understand", "build", "episode", "data", "reference"];

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
    h("nav", { class: "site-nav", "aria-label": t.nav.understand },
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

function renderHero(t) {
  const hero = document.getElementById("hero-text");
  hero.replaceChildren(
    h("h1", { text: t.hero.title }),
    h("p", { class: "lead", text: t.hero.lead }),
    h("p", { class: "who", text: t.hero.who }),
    h("p", { class: "actions" },
      h("a", { class: "btn primary", href: "#episode", text: t.hero.watch }),
      h("a", { class: "btn", href: "#build", text: t.hero.build })),
  );
  document.getElementById("hero-hint").textContent = t.hero.hint;
}

function renderUnderstand(t) {
  const u = t.understand;
  document.getElementById("understand-body").replaceChildren(
    h("h2", { text: u.title }),
    h("ol", { class: "stations" }, ...u.stations.map(([title, body]) => h("li", {}, h("h3", { text: title }), h("p", { text: body })))),
    h("p", { class: "principle", text: u.principle }),
  );
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

function renderData(t) {
  document.getElementById("data-body").replaceChildren(
    h("h2", { text: t.data.title }),
    h("ul", { class: "rows" }, ...t.data.items.map(([title, body, href]) => h("li", {},
      h("strong", { text: title }), " ", body, href ? h("a", { class: "row-link", href, text: t.data.source }) : null))),
  );
}

function renderMaintain(t) {
  document.getElementById("maintain-body").replaceChildren(
    h("h2", { text: t.maintain.title }),
    h("ul", { class: "rows" }, ...t.maintain.items.map(([title, body, code]) => h("li", {},
      h("strong", { text: title }), " ", body, h("code", { class: "row-code", text: code })))),
  );
}

function fileButton(path, label) {
  return h("button", { type: "button", class: "file-link", "data-open": path, text: label });
}

function renderReference(t, data) {
  const r = t.reference;
  const badge = (kind) => h("span", { class: `badge ${kind === t.template ? "template" : "example"}`, text: kind });
  const block = (title, ...content) => h("section", { class: "ref-block" }, h("h3", { text: title }), ...content);
  const defs = (items, render) => h("dl", { class: "defs" }, ...items.flatMap((item) => render(item)));
  const details = h("details", { class: "reference" },
    h("summary", {}, h("span", { class: "summary-title", text: r.title }), h("span", { class: "summary-sub", text: r.summary })),
    h("p", { class: "intro", text: r.intro }),
    h("div", { class: "ref-grid" },
      block(r.folders.title, defs(r.folders.items, ([name, kind, body]) => [h("dt", {}, h("code", { text: name }), badge(kind)), h("dd", { text: body })])),
      block(r.governance.title, h("p", { class: "intro", text: r.governance.intro }), defs(r.governance.items, ([name, body]) => [h("dt", {}, data.files[name] ? fileButton(name, name) : h("code", { text: name })), h("dd", { text: body })])),
      block(r.control.title, defs(r.control.items, ([name, body]) => [h("dt", {}, data.files[name] ? fileButton(name, name) : h("code", { text: name })), h("dd", { text: body })])),
      block(r.types.title, defs(r.types.items, ([name, body]) => [h("dt", {}, h("code", { text: name })), h("dd", { text: body })])),
      block(r.skills.title, defs(r.skills.items, ([name, body]) => {
        const path = `.claude/skills/${name}/SKILL.md`;
        return [h("dt", {}, data.files[path] ? fileButton(path, name) : h("code", { text: name })), h("dd", { text: body })];
      })),
      block(r.zettel.title, h("table", { class: "compare" },
        h("thead", {}, h("tr", {}, ...r.zettel.head.map((cell) => h("th", { scope: "col", text: cell })))),
        h("tbody", {}, ...r.zettel.rows.map((row) => h("tr", {}, ...row.map((cell) => h("td", { text: cell }))))))),
    ));
  document.getElementById("reference-body").replaceChildren(details);
  // A link to #reference or a file inside it opens the folded reference first.
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
  renderHero(t);
  renderUnderstand(t);
  renderData(t);
  renderMaintain(t);
  const steps = renderBuild(t);
  initNavState();
  document.getElementById("episode-title").textContent = t.episode.title;
  document.getElementById("episode-intro").textContent = t.episode.intro;

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

  // The hero shows the finished vault; system labels stay quiet so knowledge leads.
  createGraph(document.getElementById("hero-graph"), graph, { ...options, labels: "knowledge" });
  legend(document.getElementById("hero-legend"), t);
  initGrowth(t, graph, proposal, options, steps);
  const episodeApi = createGraph(document.getElementById("episode-graph"), graph, options);
  createStepper(document.getElementById("episode-stepper"), episode, states, episodeApi, t).show(0);

  if (location.hash && !location.hash.startsWith("#datei=")) document.querySelector(location.hash)?.scrollIntoView();
}

main();
