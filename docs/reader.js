// The reading pane. It shows a file as it stands and pulls what an agent meets first to the
// front: the frontmatter description of a skill, the field table and the heading outline.

import { renderMarkdown, slug, stripFrontmatter } from "./markdown.js";
import { link } from "./router.js";

const KIND_LABEL = { python: "Python", shell: "Shell", toml: "TOML", text: "Text" };
const OUTLINE_MIN = 3;

const reader = document.getElementById("reader");
const title = document.getElementById("doc-title");
const lead = document.getElementById("doc-lead");
const fields = document.getElementById("doc-fields");
const outline = document.getElementById("doc-outline");
const body = document.getElementById("doc-body");
const inbound = document.getElementById("doc-inbound");
const outbound = document.getElementById("doc-linksto");

function relation(data, container, heading, paths) {
  container.replaceChildren();
  container.hidden = !paths.length;
  if (container.hidden) return;
  const label = document.createElement("h3");
  label.textContent = heading;
  container.append(label);
  const list = document.createElement("ul");
  for (const path of paths) {
    const item = document.createElement("li");
    // The layer rail repeats the colour of the map, so a relation says where the neighbour sits.
    item.dataset.layer = data.files[path] ? data.files[path].layer : "";
    const anchor = document.createElement("a");
    anchor.href = link({ file: path, heading: "", q: "" });
    anchor.textContent = path;
    item.append(anchor);
    list.append(item);
  }
  container.append(list);
}

function renderFields(file) {
  // A skill is read by its description first, so it stands above the field table rather than
  // inside it, where a folded block of prose would be unreadable.
  const described = file.frontmatter.find(([key]) => key === "description");
  lead.textContent = described ? described[1] : "";
  lead.hidden = !described;

  const rest = file.frontmatter.filter(([key]) => key !== "description");
  fields.replaceChildren();
  fields.hidden = !rest.length;
  for (const [key, value] of rest) {
    const term = document.createElement("dt");
    term.textContent = key;
    const definition = document.createElement("dd");
    definition.textContent = value;
    fields.append(term, definition);
  }
}

function renderOutline(file, current) {
  const entries = file.outline.filter((heading) => heading.level === 2 || heading.level === 3);
  outline.replaceChildren();
  outline.hidden = entries.length < OUTLINE_MIN;
  if (outline.hidden) return;
  const label = document.createElement("h3");
  label.textContent = "Sections";
  const list = document.createElement("ul");
  for (const heading of entries) {
    const item = document.createElement("li");
    item.dataset.level = String(heading.level);
    const anchor = document.createElement("a");
    anchor.href = link({ file: current.file, heading: heading.text, q: "" });
    anchor.textContent = heading.text;
    item.append(anchor);
    list.append(item);
  }
  outline.append(label, list);
}

export function renderReader(data, current) {
  const file = data.files[current.file];
  if (!file) {
    title.textContent = current.file;
    reader.dataset.layer = "";
    lead.hidden = true;
    fields.hidden = true;
    outline.hidden = true;
    body.textContent = "This path is not part of the template.";
    relation(data, inbound, "Linked from", []);
    relation(data, outbound, "Links to", []);
    return;
  }
  // The path names the file, the layer says how it reaches an agent, which is what the map is
  // about, so the reading pane repeats that one fact rather than only the colour.
  title.textContent = file.path;
  reader.dataset.layer = file.layer;
  const layer = data.layers.find(([id]) => id === file.layer);
  if (layer) {
    const tag = document.createElement("span");
    tag.className = "layer-tag";
    tag.textContent = layer[1];
    title.append(" ", tag);
  }
  renderFields(file);
  renderOutline(file, current);

  const ctx = {
    file: current.file,
    resolve: (name) => data.stems[name] || "",
    href: (path, anchor) => link({ file: path, heading: anchor, q: "" }),
  };
  if (file.kind === "markdown") {
    body.innerHTML = renderMarkdown(stripFrontmatter(file.text), ctx);
  } else {
    body.innerHTML = `<pre data-lang="${KIND_LABEL[file.kind] || file.kind}"><code></code></pre>`;
    body.querySelector("code").textContent = file.text;
  }
  relation(data, inbound, "Linked from", file.inbound);
  relation(data, outbound, "Links to", file.linksTo);
}

export function scrollToHeading(heading) {
  if (!heading) return false;
  const id = heading.startsWith("^") ? `block-${heading.slice(1)}` : slug(heading);
  const target = document.getElementById(heading) || document.getElementById(id);
  if (!target) return false;
  target.scrollIntoView();
  return true;
}

export function focusTitle() {
  title.focus({ preventScroll: true });
}
