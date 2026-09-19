import { renderMarkdown, slug, stripFrontmatter } from "./markdown.js";

const data = await fetch("data.json").then((response) => response.json());

const tree = document.getElementById("tree");
const docTitle = document.getElementById("doc-title");
const docFields = document.getElementById("doc-fields");
const docBody = document.getElementById("doc-body");
const docInbound = document.getElementById("doc-inbound");
const trace = document.getElementById("trace");
const traceTitle = document.getElementById("trace-title");
const traceSteps = document.getElementById("trace-steps");
const taskPicker = document.getElementById("task");

const ctx = { resolve: (name) => data.stems[name] || "" };
const KIND_LABEL = { python: "Python", shell: "Shell", toml: "TOML", text: "Text" };

// The constitution opens the page: it is the top of the tree and the first step of every trace.
const HOME_FILE = data.files["CLAUDE.md"] ? "CLAUDE.md" : data.order[0];

function state() {
  const params = new URLSearchParams(location.hash.slice(1));
  return {
    file: params.get("file") || HOME_FILE,
    heading: params.get("heading") || "",
    task: params.get("task") || "",
  };
}

function link(file, heading, task) {
  const params = new URLSearchParams({ file });
  if (heading) params.set("heading", heading);
  if (task) params.set("task", task);
  return "#" + params.toString();
}

function currentTask() {
  return data.tasks.find((task) => task.id === state().task) || null;
}

function buildTree() {
  for (const [id, label, note] of data.layers) {
    const paths = data.order.filter((path) => data.files[path].layer === id);
    if (!paths.length) continue;

    const section = document.createElement("section");
    section.className = "layer";
    section.dataset.layer = id;
    section.setAttribute("aria-labelledby", `label-${id}`);
    section.innerHTML =
      `<div class="layer-head">` +
      `<input type="checkbox" id="filter-${id}" checked data-filter="${id}">` +
      `<label id="label-${id}" for="filter-${id}"><span class="swatch"></span>${label}</label>` +
      `<span class="layer-note">${note}</span>` +
      `</div>`;

    const list = document.createElement("ul");
    list.className = "files";
    const folders = new Map();
    for (const path of paths) {
      const dir = path.slice(0, path.lastIndexOf("/") + 1);
      if (!folders.has(dir)) folders.set(dir, []);
      folders.get(dir).push(path);
    }
    for (const [dir, members] of folders) {
      // A folder row earns its place only where it heads several files.
      if (dir && members.length > 1) {
        const head = document.createElement("li");
        head.className = "folder";
        head.textContent = dir;
        list.append(head);
      }
      for (const path of members) {
        const item = document.createElement("li");
        item.className = dir && members.length > 1 ? "file nested" : "file";
        const anchor = document.createElement("a");
        anchor.href = link(path, "", state().task);
        anchor.dataset.file = path;
        if (dir && members.length === 1) {
          const prefix = document.createElement("span");
          prefix.className = "dir";
          prefix.textContent = dir;
          anchor.append(prefix, path.slice(dir.length));
        } else {
          anchor.textContent = path.slice(dir.length);
        }
        item.append(anchor);
        list.append(item);
      }
    }
    section.append(list);
    tree.append(section);
  }

  // The filter hides the files, never the legend row itself, which would take its own control away.
  tree.addEventListener("change", (event) => {
    const id = event.target.dataset.filter;
    if (!id) return;
    tree.querySelector(`.layer[data-layer="${id}"] .files`).hidden = !event.target.checked;
  });
}

function buildTasks() {
  for (const task of data.tasks) {
    const option = document.createElement("option");
    option.value = task.id;
    option.textContent = task.task;
    taskPicker.append(option);
  }
  taskPicker.addEventListener("change", () => {
    const active = data.tasks.find((task) => task.id === taskPicker.value);
    location.hash = link(active ? active.steps[0].path : state().file, "", taskPicker.value).slice(1);
  });
}

function renderFields(file) {
  docFields.replaceChildren();
  docFields.hidden = !file.frontmatter.length;
  for (const [key, value] of file.frontmatter) {
    const term = document.createElement("dt");
    term.textContent = key;
    const definition = document.createElement("dd");
    definition.textContent = value;
    docFields.append(term, definition);
  }
}

function renderInbound(file) {
  docInbound.replaceChildren();
  const heading = document.createElement("h3");
  heading.textContent = "Linked from";
  docInbound.append(heading);
  if (!file.inbound.length) {
    const empty = document.createElement("p");
    empty.textContent = "No document links here.";
    docInbound.append(empty);
    return;
  }
  const list = document.createElement("ul");
  for (const path of file.inbound) {
    const item = document.createElement("li");
    const anchor = document.createElement("a");
    anchor.href = link(path, "", state().task);
    anchor.textContent = path;
    item.append(anchor);
    list.append(item);
  }
  docInbound.append(list);
}

function renderDoc(current) {
  const file = data.files[current.file];
  if (!file) {
    docTitle.textContent = current.file;
    docFields.hidden = true;
    docBody.innerHTML = "<p>This path is not part of the template.</p>";
    docInbound.replaceChildren();
    return;
  }
  docTitle.textContent = file.path;
  renderFields(file);
  if (file.kind === "markdown") {
    docBody.innerHTML = renderMarkdown(stripFrontmatter(file.text), ctx);
  } else {
    const label = KIND_LABEL[file.kind] || file.kind;
    docBody.innerHTML = `<pre data-lang="${label}"><code></code></pre>`;
    docBody.querySelector("code").textContent = file.text;
  }
  renderInbound(file);
}

function renderTrace(current) {
  const task = currentTask();
  trace.hidden = !task;
  traceSteps.replaceChildren();
  if (!task) return;
  traceTitle.textContent = task.task;

  for (const step of task.steps) {
    const item = document.createElement("li");
    const head = document.createElement("p");
    head.className = "step-head";
    if (step.present) {
      const anchor = document.createElement("a");
      anchor.href = link(step.path, step.anchor, task.id);
      anchor.textContent = step.anchor ? `${step.path} · ${step.anchor}` : step.path;
      head.append(anchor);
    } else {
      const name = document.createElement("span");
      name.className = "absent";
      name.textContent = step.path;
      const note = document.createElement("span");
      note.className = "tag";
      note.textContent = "not in this template";
      head.append(name, note);
    }
    const role = document.createElement("span");
    role.className = "role";
    role.textContent = step.role;
    head.append(role);
    const why = document.createElement("p");
    why.className = "why";
    why.textContent = step.why;
    item.append(head, why);
    if (step.path === current.file) {
      item.classList.add("here");
      item.setAttribute("aria-current", "step");
    }
    traceSteps.append(item);
  }
}

function markTree(current) {
  const task = currentTask();
  const steps = new Map();
  if (task) task.steps.forEach((step, index) => steps.set(step.path, index + 1));
  for (const anchor of tree.querySelectorAll("a[data-file]")) {
    const path = anchor.dataset.file;
    const here = path === current.file;
    anchor.classList.toggle("selected", here);
    if (here) {
      anchor.setAttribute("aria-current", "page");
    } else {
      anchor.removeAttribute("aria-current");
    }
    anchor.href = link(path, "", current.task);
    const step = steps.get(path);
    anchor.classList.toggle("in-trace", Boolean(step));
    if (step) {
      anchor.dataset.step = step;
    } else {
      delete anchor.dataset.step;
    }
  }
}

function render(moveFocus) {
  const current = state();
  taskPicker.value = current.task;
  renderDoc(current);
  renderTrace(current);
  markTree(current);
  // Focus first and without scrolling, because focusing the title would otherwise undo the jump
  // to the heading a wikilink asked for.
  if (moveFocus) docTitle.focus({ preventScroll: true });
  const target = current.heading
    ? document.getElementById(current.heading.startsWith("^")
      ? `block-${current.heading.slice(1)}`
      : slug(current.heading))
    : null;
  if (target) {
    target.scrollIntoView();
  } else {
    scrollTo(0, 0);
  }
  revealInTree();
}

// scrollIntoView would also move the page, which would push the header and the task picker out of
// view, so only the tree's own scroll offset is touched.
function revealInTree() {
  const row = tree.querySelector('a[aria-current="page"]');
  if (!row) return;
  const box = tree.getBoundingClientRect();
  const item = row.getBoundingClientRect();
  if (item.top < box.top || item.bottom > box.bottom) {
    tree.scrollTop += item.top - box.top - tree.clientHeight / 3;
  }
}

// The trace stands beside the document in three columns and above it in one, so in one column it
// also comes first in the reading and tab order. The query matches the one in style.css.
const wide = matchMedia("(min-width: 62rem)");

function placeTrace() {
  const columns = document.querySelector(".columns");
  if (wide.matches) {
    columns.append(trace);
  } else {
    columns.prepend(trace);
  }
}

buildTree();
buildTasks();
placeTrace();
wide.addEventListener("change", placeTrace);
addEventListener("hashchange", () => render(true));
render(false);
