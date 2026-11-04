// One research episode on the example vault, as described in docs/episode.json: ask, recover,
// propose, decide, incorporate, reuse. This module turns each phase into a graph state; the
// variants decide whether a stepper, the scroll position or the build steps drive it.

/** Resolve note titles of episode.json to graph ids through the stems of both sources. */
export function resolver(graph, data) {
  const byTitle = new Map(graph.nodes.map((node) => [node.label, node.id]));
  return (name) => byTitle.get(name) || graph.stems[name] || data.stems[name] || name;
}

/** The graph state of each phase. Each state stands alone, so any phase can be shown directly. */
export function phaseStates(episode, resolve) {
  const ids = (list) => (list || []).map(resolve);
  const proposalId = resolve(episode.phases.find((phase) => phase.proposal).proposal);
  return episode.phases.map((phase) => {
    switch (phase.id) {
      case "question":
        return { active: true, hidden: [proposalId], focus: ids(phase.focus), question: ids(phase.focus).at(-1) };
      case "recover":
        return { active: true, hidden: [proposalId], found: ids(phase.found), trail: ids(phase.trail) };
      case "propose":
        return { active: true, proposal: proposalId, lit: ids(phase.supports) };
      case "decide":
        return { active: true, proposal: proposalId, checking: ids(phase.check), gate: proposalId };
      case "incorporate":
        return { active: true, accepted: proposalId, updated: ids(phase.update), pulse: proposalId };
      case "test":
        return { active: true, accepted: proposalId, trail: ids(phase.trail), updated: ids(phase.update) };
      case "reuse":
        return { active: true, accepted: proposalId, trail: ids(phase.trail), transfer: proposalId, question: ids(phase.trail)[1] };
      default:
        return { active: false };
    }
  });
}

/**
 * A stepper with play, previous and next, and one caption per phase that names who acts.
 * @param {HTMLElement} host
 */
export function createStepper(host, episode, states, graphApi, text) {
  const t = text.episode;
  host.replaceChildren();
  host.classList.add("stepper-box");
  const list = document.createElement("ol");
  list.className = "phase-list";
  const heading = document.createElement("p");
  heading.className = "phase-title";
  heading.textContent = t.title;
  const caption = document.createElement("p");
  caption.className = "phase-caption";
  caption.setAttribute("aria-live", "polite");
  const controls = document.createElement("div");
  controls.className = "phase-controls";
  const prev = button(t.prev, "ghost");
  const play = button(t.play, "primary");
  const next = button(t.next, "ghost");
  const count = document.createElement("span");
  count.className = "phase-count";
  controls.append(prev, play, next, count);

  // Compact steps: a numbered pill per phase, the full title in its accessible name; the
  // caption below carries actor, title, explanation and the example.
  const items = episode.phases.map((phase, index) => {
    const item = document.createElement("li");
    const [title] = t.phases[phase.id];
    const pick = button(String(index + 1), "phase");
    pick.setAttribute("aria-label", `${index + 1}. ${title}, ${t.actors[phase.actor]}`);
    pick.dataset.actor = phase.actor;
    pick.addEventListener("click", () => show(index, true));
    item.append(pick);
    list.append(item);
    return pick;
  });
  host.append(heading, list, caption, controls);

  let index = -1;
  let timer = 0;
  function show(target, stopPlaying = false) {
    if (stopPlaying) stop();
    index = Math.max(0, Math.min(target, states.length - 1));
    items.forEach((item, position) => item.setAttribute("aria-current", position === index ? "step" : "false"));
    const phase = episode.phases[index];
    const [title, body, example] = t.phases[phase.id];
    caption.replaceChildren();
    const strong = document.createElement("strong");
    strong.textContent = `${t.actors[phase.actor]}: ${title}. `;
    const instance = document.createElement("span");
    instance.className = "phase-example";
    instance.textContent = example;
    caption.append(strong, body, instance);
    count.textContent = t.stepOf(index + 1, states.length);
    prev.disabled = index === 0;
    next.disabled = index === states.length - 1;
    graphApi.stage(states[index]);
  }
  function stop() {
    clearTimeout(timer);
    timer = 0;
    play.textContent = t.play;
  }
  function tick() {
    if (index >= states.length - 1) return stop();
    show(index + 1);
    timer = setTimeout(tick, 5200);
  }
  function start(fromBeginning = false) {
    play.textContent = t.pause;
    if (fromBeginning || index >= states.length - 1) show(0);
    else show(index + 1);
    timer = setTimeout(tick, 5200);
  }
  play.addEventListener("click", () => (timer ? stop() : start()));
  prev.addEventListener("click", () => show(index - 1, true));
  next.addEventListener("click", () => show(index + 1, true));
  // Until a phase is chosen the graph shows the whole vault and only the controls are active.
  prev.disabled = true;
  return { show, stop, start };
}

function button(label, kind) {
  const element = document.createElement("button");
  element.type = "button";
  element.className = `btn ${kind}`;
  element.textContent = label;
  return element;
}
