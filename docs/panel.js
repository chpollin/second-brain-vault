// The reading panel. It shows a template file beside the page, so a reader can check a claim of
// the page against the file it names without losing the session or section they came from.

import { renderMarkdown, slug, stripFrontmatter } from "./markdown.js";

const panel = document.getElementById("panel");
const title = document.getElementById("panel-title");
const pathLine = document.getElementById("panel-path");
const body = document.getElementById("panel-body");
const closeButton = document.getElementById("panel-close");

let text = null;
let data = null;
let returnFocus = null;
let returnHash = "";

/** @param {string} path @param {string} [heading] */
export function fileHref(path, heading = "") {
  const params = new URLSearchParams({ datei: path });
  if (heading) params.set("abschnitt", heading);
  return "#" + params.toString();
}

function readRoute() {
  const params = new URLSearchParams(location.hash.slice(1));
  return { file: params.get("datei") || "", heading: params.get("abschnitt") || "" };
}

function frontmatterList(file) {
  const list = document.createElement("dl");
  list.className = "frontmatter";
  for (const [key, value] of file.frontmatter) {
    const term = document.createElement("dt");
    term.textContent = key;
    const definition = document.createElement("dd");
    definition.textContent = value;
    list.append(term, definition);
  }
  return list;
}

function render(route) {
  const file = data.files[route.file];
  title.textContent = route.file.split("/").pop();
  pathLine.textContent = route.file;
  body.replaceChildren();
  if (!file) {
    const note = document.createElement("p");
    note.textContent = text.panel.missing;
    body.append(note);
    return;
  }
  if (file.frontmatter.length) body.append(frontmatterList(file));
  const holder = document.createElement("div");
  holder.className = "prose";
  const ctx = {
    file: route.file,
    resolve: (name) => data.stems[name] || "",
    href: (path, anchor) => fileHref(path, anchor),
  };
  if (file.kind === "markdown") {
    holder.innerHTML = renderMarkdown(stripFrontmatter(file.text), ctx);
  } else {
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    code.textContent = file.text;
    pre.append(code);
    holder.append(pre);
  }
  body.append(holder);
}

function scrollToHeading(heading) {
  if (!heading) {
    panel.scrollTop = 0;
    return;
  }
  const id = heading.startsWith("^") ? `block-${heading.slice(1)}` : slug(heading);
  const target = body.querySelector(`[id="${CSS.escape(id)}"]`) || body.querySelector(`[id="${CSS.escape(heading)}"]`);
  if (target) target.scrollIntoView();
}

function sync() {
  const route = readRoute();
  if (!route.file) {
    if (!panel.hidden) hide();
    return;
  }
  if (panel.hidden) {
    returnFocus = returnFocus || document.activeElement;
    panel.hidden = false;
  }
  render(route);
  scrollToHeading(route.heading);
  title.focus({ preventScroll: true });
}

function hide() {
  panel.hidden = true;
  if (returnFocus && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
  returnFocus = null;
}

function close() {
  // Closing returns to the section the reader came from without adding a history entry.
  history.replaceState(null, "", returnHash || location.pathname + location.search);
  hide();
}

/** Open a file from a control on the page and remember where focus should return. */
export function openFile(path, opener) {
  if (panel.hidden) {
    returnFocus = opener || document.activeElement;
    returnHash = location.hash.startsWith("#datei=") ? "" : location.hash;
  }
  location.hash = fileHref(path).slice(1);
}

export function initPanel(vaultData, pageText) {
  data = vaultData;
  text = pageText;
  closeButton.textContent = text.panel.close;
  closeButton.addEventListener("click", close);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) close();
  });
  window.addEventListener("hashchange", sync);
  document.addEventListener("click", (event) => {
    const opener = event.target.closest("[data-open]");
    if (opener) openFile(opener.dataset.open, opener);
  });
  sync();
}
