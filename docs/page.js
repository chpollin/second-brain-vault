// The method page is complete in English in index.html and reads without JavaScript. This
// module only switches to German (?lang=de or a remembered choice) and shows the language
// link. Copy buttons come from the shared assets/dhcraft/dhcraft-copy.js, which reads the
// language this module sets first.

import { HTML_KEYS, PAGE_DE } from "./content.js";

const STORE = "second-brain-vault-lang";

function currentLang() {
  const asked = new URLSearchParams(location.search).get("lang");
  if (asked === "de" || asked === "en") return asked;
  try {
    return localStorage.getItem(STORE) === "de" ? "de" : "en";
  } catch {
    return "en";
  }
}

function remember(lang) {
  try {
    localStorage.setItem(STORE, lang);
  } catch {
    // Storage can be blocked; the choice then holds for this visit only.
  }
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
link.textContent = other === "de" ? "Deutsch" : "English";
link.setAttribute("aria-label", other === "de" ? "Seite auf Deutsch anzeigen" : "Show this page in English");
link.hidden = false;
link.addEventListener("click", () => remember(other));
// The explorer keeps the language.
for (const anchor of document.querySelectorAll("a[href$='.html']")) anchor.href = `${anchor.getAttribute("href")}?lang=${lang}`;
