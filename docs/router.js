// Every view of this page is addressable, so the whole state travels in the hash: the open file
// and the heading inside it, the traced task and the step reached, and the search query.

export function readState() {
  const params = new URLSearchParams(location.hash.slice(1));
  const step = Number.parseInt(params.get("step") ?? "", 10);
  return {
    file: params.get("file") || "",
    heading: params.get("heading") || "",
    task: params.get("task") || "",
    step: Number.isInteger(step) && step > 0 ? step : 0,
    q: params.get("q") || "",
  };
}

export function link(changes) {
  const next = { ...readState(), ...changes };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.file) params.set("file", next.file);
  if (next.heading) params.set("heading", next.heading);
  if (next.task) params.set("task", next.task);
  if (next.task && next.step) params.set("step", String(next.step));
  return "#" + params.toString();
}

export function go(changes) {
  location.hash = link(changes).slice(1);
}

export function view(current) {
  if (current.q) return "search";
  return current.file ? "read" : "map";
}
