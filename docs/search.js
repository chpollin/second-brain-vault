// Substring search over the folded fields the generator wrote. The fold is length preserving, so
// an offset found in the folded text points at the same place in the original and the snippet can
// be cut from the file as it stands.

import { link } from "./router.js";

const MIN_QUERY = 2;
const SPOTS_PER_FILE = 3;
const BEFORE = 55;
const AFTER = 85;

const results = document.getElementById("results");
const heading = document.getElementById("results-head");
const groups = document.getElementById("results-groups");

export function fold(text) {
  return text.toLowerCase().replace(/ß/g, "s").normalize("NFD").replace(/\p{M}/gu, "");
}

function snippet(text, at, length) {
  const start = Math.max(0, at - BEFORE);
  const end = Math.min(text.length, at + length + AFTER);
  let head = text.slice(start, at).replace(/\s+/g, " ").trimStart();
  // Cutting at a fixed distance lands inside a word, so the snippet starts at the next one.
  if (start > 0) head = "…" + head.slice(head.indexOf(" ") + 1);
  const tail = text.slice(at + length, end).replace(/\s+/g, " ") + (end < text.length ? "…" : "");
  return { lead: head, hit: text.slice(at, at + length), tail };
}

export function find(data, query) {
  const needle = fold(query.trim());
  if (needle.length < MIN_QUERY) return [];
  const hits = [];
  for (const path of data.order) {
    const file = data.files[path];
    const inName = fold(path).includes(needle);
    const headings = file.outline.filter((entry) => fold(entry.text).includes(needle));
    const spots = [];
    let at = file.search.indexOf(needle);
    while (at !== -1 && spots.length < SPOTS_PER_FILE) {
      spots.push(snippet(file.text, at, needle.length));
      at = file.search.indexOf(needle, at + needle.length);
    }
    if (!inName && !headings.length && !spots.length) continue;
    hits.push({ path, layer: file.layer, inName, headings: headings.slice(0, 3), spots });
  }
  return hits;
}

function renderHit(hit) {
  const item = document.createElement("li");
  item.dataset.layer = hit.layer;

  const head = document.createElement("p");
  head.className = "hit-head";
  const anchor = document.createElement("a");
  anchor.href = link({ file: hit.path, heading: "", q: "" });
  anchor.textContent = hit.path;
  head.append(anchor);
  if (hit.inName) {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = "in the name";
    head.append(tag);
  }
  item.append(head);

  for (const entry of hit.headings) {
    const line = document.createElement("p");
    line.className = "hit-heading";
    const to = document.createElement("a");
    to.href = link({ file: hit.path, heading: entry.text, q: "" });
    to.textContent = entry.text;
    line.append(document.createTextNode("heading "), to);
    item.append(line);
  }

  for (const spot of hit.spots) {
    const line = document.createElement("p");
    line.className = "hit-snippet";
    const mark = document.createElement("mark");
    mark.textContent = spot.hit;
    line.append(document.createTextNode(spot.lead), mark, document.createTextNode(spot.tail));
    item.append(line);
  }
  return item;
}

export function renderResults(data, current) {
  const hits = find(data, current.q);
  groups.replaceChildren();
  // The count answers the query the visitor just typed, so it is a result and not a standing size.
  heading.textContent = hits.length
    ? `${hits.length} ${hits.length === 1 ? "file" : "files"} match “${current.q}”`
    : `Nothing matches “${current.q}”`;

  for (const [id, label] of data.layers) {
    const inLayer = hits.filter((hit) => hit.layer === id);
    if (!inLayer.length) continue;
    const group = document.createElement("section");
    group.className = "result-group";
    group.dataset.layer = id;
    const name = document.createElement("h3");
    name.textContent = label;
    const list = document.createElement("ol");
    for (const hit of inLayer) list.append(renderHit(hit));
    group.append(name, list);
    groups.append(group);
  }
  return hits.length;
}

export function focusResults() {
  results.focus({ preventScroll: true });
}
