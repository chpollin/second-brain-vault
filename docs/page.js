// The method page is complete in English in index.html and reads without JavaScript. This
// module switches to German (?lang=de or a remembered choice), shows the language link and
// wires the theme toggle. The page opens light; the inline prelude in index.html applies a
// stored dark choice before first paint. Copy buttons come from the shared
// assets/dhcraft/dhcraft-copy.js, which reads the language this module sets first.

import { HTML_KEYS, PAGE_DE } from "./content.js";

const LANG_KEY = "second-brain-vault-lang";
const THEME_KEY = "second-brain-vault-theme";

function stored(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function store(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked; the choice then holds for this page load only.
  }
}

function currentLang() {
  const asked = new URLSearchParams(location.search).get("lang");
  if (asked === "de" || asked === "en") return asked;
  return stored(LANG_KEY) === "de" ? "de" : "en";
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
    if (node.dataset.tLabel in PAGE_DE) node.setAttribute("aria-label", PAGE_DE[node.dataset.tLabel]);
  }
  for (const node of document.querySelectorAll("[data-t-alt]")) {
    if (node.dataset.tAlt in PAGE_DE) node.setAttribute("alt", PAGE_DE[node.dataset.tAlt]);
  }
}

const lang = currentLang();
document.documentElement.lang = lang;
if (lang === "de") translate();

const other = lang === "en" ? "de" : "en";
const link = document.getElementById("lang-switch");
const url = new URL(location.href);
url.searchParams.set("lang", other);
link.href = url.search + url.hash;
link.hreflang = other;
link.lang = other;
link.textContent = other.toUpperCase();
link.setAttribute("aria-label", other === "de" ? "Seite auf Deutsch anzeigen" : "Show this page in English");
link.hidden = false;
link.addEventListener("click", () => store(LANG_KEY, other));
// The explorer keeps the language.
for (const anchor of document.querySelectorAll("a[href$='.html']")) anchor.href = `${anchor.getAttribute("href")}?lang=${lang}`;

const toggle = document.getElementById("theme-toggle");
const root = document.documentElement;
function labelToggle() {
  const dark = root.getAttribute("data-theme") === "dark";
  const words = lang === "de" ? ["Zum hellen Farbschema wechseln", "Zum dunklen Farbschema wechseln"] : ["Switch to the light theme", "Switch to the dark theme"];
  const text = dark ? words[0] : words[1];
  toggle.querySelector(".visually-hidden").textContent = text;
  toggle.title = text;
}
toggle.hidden = false;
labelToggle();
toggle.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  store(THEME_KEY, next);
  labelToggle();
});
