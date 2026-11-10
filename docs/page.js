// The method page. index.html carries the English page and works without JavaScript. This
// module adds the German text, the current section in the navigation, and the
// playable example with its reading panel, which need the example notes from graph.json. Copy
// buttons come from the shared assets/dhcraft/dhcraft-copy.js, which reads the language this
// module sets first.

import { currentLang, HTML_KEYS, PAGE_DE, rememberLang, TEXT } from "./content.js";
import { initHero } from "./hero.js";
import { initPanel, openFile } from "./panel.js";

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return response.json();
}

/** Replace the English text of every marked element by its German entry. */
function translate() {
  for (const node of document.querySelectorAll("[data-t]")) {
    const key = node.dataset.t;
    if (!(key in PAGE_DE)) continue;
    // Markup comes only from PAGE_DE in content.js, never from data or the URL.
    if (HTML_KEYS.has(key)) node.innerHTML = PAGE_DE[key];
    else node.textContent = PAGE_DE[key];
  }
  for (const node of document.querySelectorAll("[data-t-label]")) {
    const key = node.dataset.tLabel;
    if (key in PAGE_DE) node.setAttribute("aria-label", PAGE_DE[key]);
  }
}

function initLanguage(lang, t) {
  const other = lang === "en" ? "de" : "en";
  const link = document.getElementById("lang-switch");
  const url = new URL(location.href);
  url.searchParams.set("lang", other);
  link.href = url.search + url.hash;
  link.hreflang = other;
  link.lang = other;
  link.hidden = false;
  link.textContent = t.switchTo;
  link.setAttribute("aria-label", t.switchLabel);
  link.addEventListener("click", () => rememberLang(other));
  // Links to the secondary pages keep the language.
  for (const anchor of document.querySelectorAll("a[href$='.html']")) anchor.href = `${anchor.getAttribute("href")}?lang=${lang}`;
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

async function main() {
  const lang = currentLang();
  const t = TEXT[lang];
  document.documentElement.lang = lang;
  if (lang === "de") translate();
  initLanguage(lang, t);
  initNavState();

  let graph;
  let episode;
  try {
    [graph, episode] = await Promise.all([loadJson("graph.json"), loadJson("episode.json")]);
  } catch {
    // The static list of phases stays in place; the page remains complete without the example.
    return;
  }
  initPanel({ files: graph.files, stems: graph.stems }, t);
  document.getElementById("hero-card").hidden = false;
  document.getElementById("example").classList.add("playable");
  initHero({ episode, graph, text: t, onOpen: openFile });

  if (location.hash && !location.hash.startsWith("#datei=")) document.querySelector(location.hash)?.scrollIntoView();
}

main();
