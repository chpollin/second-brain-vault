// The loading map. The layers are stacked in the order in which they reach an agent, each layer
// holding its files as chips, so the structure of the vault is visible before anything is clicked.
// A traced task writes its step numbers onto the chips, which turns the map into the path.

import { link } from "./router.js";

const ROLE_END = "check";

let root = null;
const note = document.createElement("div");
note.className = "step-note";

// A bare SKILL.md or test-cases.md would name several different files, so a chip keeps as much
// of its path as it needs to be unique inside its own layer, and no more.
function chipLabel(path, paths) {
  const parts = path.split("/");
  for (let take = 1; take < parts.length; take += 1) {
    const suffix = parts.slice(-take).join("/");
    if (!paths.some((other) => other !== path && other.endsWith("/" + suffix))) return suffix;
  }
  return path;
}

export function buildMap(container, data) {
  root = container;
  for (const [id, label, gloss] of data.layers) {
    const paths = data.order.filter((path) => data.files[path].layer === id);
    if (!paths.length) continue;

    const band = document.createElement("section");
    band.className = "band";
    band.dataset.layer = id;
    band.setAttribute("aria-labelledby", `band-${id}`);

    const head = document.createElement("div");
    head.className = "band-head";
    head.innerHTML =
      `<h2 class="band-name"><input type="checkbox" id="filter-${id}" data-filter="${id}" checked>` +
      `<label id="band-${id}" for="filter-${id}">${label}</label></h2>` +
      `<p class="band-gloss">${gloss}</p>`;

    const chips = document.createElement("ul");
    chips.className = "chips";
    for (const path of paths) {
      const item = document.createElement("li");
      const chip = document.createElement("a");
      chip.className = "chip";
      chip.dataset.file = path;
      chip.href = link({ file: path, heading: "", q: "" });
      const label = chipLabel(path, paths);
      const cut = label.lastIndexOf("/") + 1;
      if (cut) {
        const folder = document.createElement("span");
        folder.className = "chip-dir";
        folder.textContent = label.slice(0, cut);
        chip.append(folder, label.slice(cut));
      } else {
        chip.textContent = label;
      }
      item.append(chip);
      chips.append(item);
    }
    band.append(head, chips);
    root.append(band);
  }

  // The filter hides the files of a layer, never its own control, which would leave no way back.
  root.addEventListener("change", (event) => {
    const id = event.target.dataset.filter;
    if (!id) return;
    root.querySelector(`.band[data-layer="${id}"] .chips`).hidden = !event.target.checked;
  });
}

function stepOrdinals(task) {
  const ordinals = new Map();
  if (task) {
    task.steps.forEach((step, index) => {
      if (!ordinals.has(step.path)) ordinals.set(step.path, index + 1);
    });
  }
  return ordinals;
}

function buildNote(step, index, task) {
  note.replaceChildren();
  note.dataset.role = step.role;

  const head = document.createElement("p");
  head.className = "note-head";
  const ordinal = document.createElement("span");
  ordinal.className = "note-ordinal";
  ordinal.textContent = String(index + 1);
  const role = document.createElement("span");
  role.className = "role";
  role.textContent = step.role === ROLE_END ? "check, end of the path" : step.role;
  head.append(ordinal, role);
  if (!step.present) {
    const absent = document.createElement("span");
    absent.className = "tag";
    absent.textContent = "not in this template";
    head.append(absent);
  }
  note.append(head);

  if (step.pattern) {
    const match = document.createElement("p");
    match.className = "note-match";
    const pattern = document.createElement("code");
    pattern.textContent = step.pattern;
    const matched = document.createElement("code");
    matched.textContent = step.matched;
    match.append(pattern, document.createTextNode(" matches "), matched);
    note.append(match);
  }

  const why = document.createElement("p");
  why.className = "note-why";
  why.textContent = step.why;
  note.append(why);

  const open = document.createElement("p");
  open.className = "note-open";
  if (step.present) {
    const anchor = document.createElement("a");
    anchor.href = link({ file: step.path, heading: step.anchor, q: "", task: task.id, step: index + 1 });
    anchor.textContent = step.anchor ? `Open ${step.path} at ${step.anchor}` : `Open ${step.path}`;
    open.append(anchor);
  } else {
    open.textContent = `${step.path} is not included in this explorer`;
  }
  note.append(open);
}

export function renderMap(current, task) {
  const ordinals = stepOrdinals(task);
  const active = task && current.step ? task.steps[current.step - 1] : null;

  for (const chip of root.querySelectorAll(".chip")) {
    const path = chip.dataset.file;
    const ordinal = ordinals.get(path);
    // Opening a chip that is itself a step moves the trace there, so note and pane agree.
    chip.href = link({ file: path, heading: "", q: "", step: ordinal || current.step });
    chip.classList.toggle("traced", Boolean(ordinal));
    if (ordinal) {
      chip.dataset.step = String(ordinal);
    } else {
      delete chip.dataset.step;
    }
    chip.classList.toggle("stepped", Boolean(active) && active.path === path);
    const open = path === current.file;
    chip.classList.toggle("open", open);
    if (open) {
      chip.setAttribute("aria-current", "page");
    } else {
      chip.removeAttribute("aria-current");
    }
  }

  if (!active) {
    note.remove();
    return;
  }
  buildNote(active, current.step - 1, task);
  const chip = active.present ? root.querySelector(`.chip[data-file="${CSS.escape(active.path)}"]`) : null;
  if (chip) {
    chip.closest(".band").append(note);
    reveal(chip);
  } else {
    root.append(note);
  }
}

// Where the map is its own scroller, only its scroll offset moves, because scrollIntoView would
// drag the page along and push the masthead and the stepper out of sight. Where the map runs with
// the page, as it does on a narrow screen, the page has to move or a step would change nothing
// the visitor can see.
function reveal(chip) {
  const item = chip.getBoundingClientRect();
  if (root.scrollHeight > root.clientHeight + 1) {
    const box = root.getBoundingClientRect();
    if (item.top < box.top || item.bottom > box.bottom) {
      root.scrollTop += item.top - box.top - root.clientHeight / 3;
    }
    return;
  }
  if (item.top < 0 || item.bottom > innerHeight) chip.scrollIntoView({ block: "center" });
}
