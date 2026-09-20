import { buildMap, renderMap } from "./map.js";
import { focusTitle, renderReader, scrollToHeading } from "./reader.js";
import { go, link, readState, view } from "./router.js";
import { renderResults } from "./search.js";

const data = await fetch("data.json").then((response) => response.json());

const stage = document.getElementById("stage");
const map = document.getElementById("map");
const reader = document.getElementById("reader");
const results = document.getElementById("results");
const picker = document.getElementById("task");
const stepper = document.getElementById("stepper");
const stepOf = document.getElementById("step-of");
const prev = document.getElementById("prev");
const next = document.getElementById("next");
const query = document.getElementById("q");

// A button that carries the focus and then turns disabled would drop the focus to the document,
// so the step that ends a run hands its focus to the control that still works.
let handBack = null;

function normalize() {
  const current = readState();
  const task = data.tasks.find((entry) => entry.id === current.task) || null;
  current.step = task ? Math.min(Math.max(current.step || 1, 1), task.steps.length) : 0;
  return { current, task };
}

function buildTasks() {
  for (const task of data.tasks) {
    const option = document.createElement("option");
    option.value = task.id;
    option.textContent = task.task;
    picker.append(option);
  }
  picker.addEventListener("change", () => go({ task: picker.value, step: 1 }));
  prev.addEventListener("click", () => {
    handBack = prev;
    go({ step: readState().step - 1 || 1 });
  });
  next.addEventListener("click", () => {
    handBack = next;
    go({ step: (readState().step || 1) + 1 });
  });
}

function renderStepper(current, task) {
  stepper.hidden = !task;
  if (!task) return;
  const step = task.steps[current.step - 1];
  stepOf.textContent = `Step ${current.step} of ${task.steps.length}, ${step.role}`;
  prev.disabled = current.step <= 1;
  next.disabled = current.step >= task.steps.length;
  if (handBack && handBack.disabled) {
    (handBack === next ? prev : next).focus();
  }
  handBack = null;
}

function buildSearch() {
  query.addEventListener("input", () => {
    // Typing is navigation, so the query replaces the current history entry instead of stacking
    // one per keystroke, and the render runs here because replaceState fires no hashchange.
    history.replaceState(null, "", link({ q: query.value.trim() }));
    render(false);
  });
  query.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !query.value) return;
    query.value = "";
    history.replaceState(null, "", link({ q: "" }));
    render(false);
  });
}

function render(moveFocus) {
  const { current, task } = normalize();
  const mode = view(current);
  stage.dataset.view = mode;
  reader.hidden = mode !== "read";
  results.hidden = mode !== "search";
  if (query.value !== current.q) query.value = current.q;
  picker.value = current.task;

  renderStepper(current, task);
  renderMap(current, task);
  if (mode === "read") renderReader(data, current);
  if (mode === "search") renderResults(data, current);

  if (mode !== "read") return;
  // Focus before scrolling and without scrolling, because focusing the title would otherwise undo
  // the jump to the heading a wikilink asked for.
  if (moveFocus) focusTitle();
  if (!scrollToHeading(current.heading)) scrollTo(0, 0);
}

buildMap(map, data);
buildTasks();
buildSearch();
addEventListener("hashchange", () => render(true));
render(false);
