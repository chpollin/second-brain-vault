'use strict';

const daten = window.PRUEFANSICHT;
const startzustand = { projekt: '', suche: '', filter: 'laufend', fokus: 'projekt', frage: '', route: 'all', status: 'all', text: 'kurz' };
const normalize = (text) => String(text || '').toLocaleLowerCase('de').replace(/ß/g, 'ss').normalize('NFD').replace(/\p{M}/gu, '');
let searchIndex = new Map();
let startUrteile = {};

function prospectInfo(entry) {
  if (entry.bereich !== 'Anbahnungen') return null;
  // LibRA's source makes commissioning conditional on grant approval. Other entries stay unclassified.
  const funding = entry.id === 'libra-erc' && entry.notizPfad === 'Anbahnungen/LibRA ERC-Anbahnung.md';
  const waiting = entry.wartetAuf === 'Rückmeldung des Antragsteams zum Kostenvoranschlag vom 18.09.2026';
  return {
    kind: funding ? 'Förderantrag' : 'Anbahnung',
    status: funding && waiting && entry.status === 'angebot-gelegt' ? 'Rückmeldung zum Kostenvoranschlag ausstehend'
      : ({ 'angebot-gelegt': 'Angebot gelegt', aktiv: 'In Vorbereitung', wartend: 'Wartend', ruhend: 'Ruhend' }[entry.status] || entry.status),
  };
}

function prospectRow(entry) {
  const prospect = prospectInfo(entry);
  return el('li', { class: 'prospect-row', 'data-selected': startzustand.projekt === entry.id ? 'true' : null },
    el('a', { href: projectAddress(entry.id), 'data-project': entry.id, 'data-focus': 'projekt',
      'aria-current': startzustand.projekt === entry.id ? 'true' : null }, window.PROJECT_MARKS?.create(entry.id),
      el('span', {}, entry.name)), el('span', { class: 'prospect-kind' }, prospect.kind),
    el('span', { class: 'prospect-status' }, prospect.status));
}

function projectProgress(entry) {
  const points = daten.posten.filter((point) => point.projekt === entry.id);
  const states = points.map((point) => arbeitsstand(point, startUrteile[point.id]));
  return { points, states, open: states.filter((state) => state.route === 'human' && state.response === 'open').length,
    answerable: states.filter((state, index) => state.route === 'human' && state.response === 'open'
      && !unmetPrerequisite(points[index], state)).length,
    revisit: states.filter((state) => state.route === 'human' && state.response === 'revisit').length,
    answered: states.filter((state) => state.response === 'answered').length,
    adoption: states.filter((state) => state.response === 'answered' && !state.adopted).length,
    implementation: states.filter((state) => state.adopted && !state.implemented).length,
    validation: states.filter((state) => state.implemented && !state.verified).length };
}

function selectProjects(entries, state) {
  const words = normalize(state.suche).split(/\s+/).filter(Boolean);
  return entries.filter((entry) => (state.filter === 'alle' || (state.filter === 'ruhend' ? entry.status === 'ruhend'
    : state.filter === 'abgeschlossen' ? entry.status === 'abgeschlossen'
      : state.filter === 'fragen' ? projectProgress(entry).open + projectProgress(entry).revisit > 0
        && !['ruhend', 'abgeschlossen'].includes(entry.status) : !['ruhend', 'abgeschlossen'].includes(entry.status)))
    && words.every((word) => (searchIndex.get(entry.id) || normalize(entry.name)).includes(word))
    && (!state.status || state.status === 'all' || projectProgress(entry).points.some((point, index) => pointMatchesFilter(point,
      projectProgress(entry).states[index], state))));
}

function pointMatchesFilter(point, state, filter = startzustand) {
  if (filter.route && filter.route !== 'all' && state.route !== filter.route) return false;
  if (!filter.status || filter.status === 'all') return true;
  if (filter.status === 'open') return state.response === 'open';
  if (filter.status === 'revisit' || filter.status === 'answered') return state.response === filter.status;
  if (filter.status === 'adoption') return state.response === 'answered' && !state.adopted;
  if (filter.status === 'implementation') return state.adopted && !state.implemented;
  if (filter.status === 'validation') return state.implemented && !state.verified;
  return true;
}

function arc(from, to, center = 64) {
  const radius = center - 12;
  const point = (degrees) => {
    const angle = (degrees - 90) * Math.PI / 180;
    return `${(center + radius * Math.cos(angle)).toFixed(2)} ${(center + radius * Math.sin(angle)).toFixed(2)}`;
  };
  return `M ${point(from)} A ${radius} ${radius} 0 0 1 ${point(to)}`;
}

// The `invoice::` field is free text. Its words decide the state, and anything that names no state is an invoice
// planned for later, such as a partial invoice due at the end of a project. Amounts never appear in ACTIVE-WORK.
function invoiceState(text) {
  const value = String(text || '').trim();
  if (!value) return null;
  const lower = value.toLocaleLowerCase('de');
  // What still needs the operator wins, so one open part outweighs a paid one.
  const state = /offen/.test(lower) ? 'offen' : /gestellt/.test(lower) ? 'gestellt' : /bezahlt/.test(lower) ? 'bezahlt' : 'geplant';
  const partial = /teil/.test(lower);
  const plain = { offen: 'Rechnung offen', gestellt: 'Rechnung gestellt', bezahlt: 'Rechnung bezahlt' }[state];
  return { state, partial, label: plain && lower === state ? plain : `Rechnung: ${value}` };
}

// A receipt, stacked for partial invoices. A tick replaces the lines once it is paid; colour follows whose move it is.
function invoiceMark(text) {
  const invoice = invoiceState(text);
  if (!invoice) return false;
  return svg('svg', { viewBox: '0 0 24 24', class: 'invoice-mark', 'data-invoice': invoice.state, role: 'img',
    'aria-label': invoice.label, focusable: 'false' }, svg('title', {}, invoice.label),
  invoice.partial && svg('path', { d: 'M9 3h12v15', class: 'invoice-stack' }),
  svg('path', { d: 'M5 5h12v16l-3-2-3 2-3-2-3 2z' }),
  svg('path', { d: invoice.state === 'bezahlt' ? 'M8 12l2.5 2.5L14.5 10' : 'M8 10h6M8 14h6' }));
}

function projectAddress(project, focus = 'projekt', question = '', overrides = {}) {
  return `#${new URLSearchParams({ ...startzustand, projekt: project, fokus: focus, frage: question, ...overrides })}`;
}

function projectGlyph(entry) {
  const progress = projectProgress(entry);
  const hasSteps = entry.status !== 'ruhend' && (entry.schritte.length > 0 || projectDates(entry).length > 0);
  const visiblePoints = progress.points.map((point, index) => ({ point, state: progress.states[index] }))
    .filter(({ point, state }) => pointMatchesFilter(point, state));
  const columns = visiblePoints.length > 9 ? 4 : 3;
  const rows = Math.ceil(visiblePoints.length / columns);
  const center = Math.max(64, rows * 12 + 34, columns * 12 + 22);
  const image = svg('svg', { viewBox: `0 0 ${center * 2} ${center * 2}`, width: center * 2, height: center * 2,
    class: 'glyphe-bild', role: 'group', 'aria-label': `${entry.name}, Fragen und Arbeitsstand`, focusable: 'false' });
  for (const [kind, focus, label, present, from, to] of [
    ['dich', 'fragen', 'Fragen und Entscheidungen', progress.open + progress.revisit > 0, -50, 50],
    ['andere', 'warten', 'Wartet auf andere', Boolean(entry.wartetAuf), 70, 170],
    ['bereit', 'schritte', 'Nächste Schritte', hasSteps, 190, 290],
  ]) {
    const path = svg('path', { d: arc(from, to, center), class: `bogen-linie${present ? ` bogen-${kind}` : ''}`, 'aria-hidden': 'true' });
    if (!present) { image.append(path); continue; }
    image.append(svg('a', { href: projectAddress(entry.id, focus), tabindex: '0', class: 'glyphe-bogen-link',
      'data-project': entry.id, 'data-focus': focus, 'aria-label': `${entry.name}, ${label}`,
      'aria-current': startzustand.projekt === entry.id && startzustand.fokus === focus && !startzustand.frage ? 'true' : null },
    svg('title', {}, label), svg('path', { d: arc(from, to, center), class: 'glyphe-bogen-hit', 'aria-hidden': 'true' }), path));
  }
  visiblePoints.forEach(({ point, state }, index) => {
    const row = Math.floor(index / columns);
    const inRow = Math.min(columns, visiblePoints.length - row * columns);
    const cx = center + (index % columns - (inRow - 1) / 2) * 24;
    const cy = center + (row - (rows - 1) / 2) * 24;
    const kind = window.POINT_TYPES?.of(point.id) || { type: '', label: '', group: '', thirdParty: false };
    const label = [kind.group && `${window.POINT_TYPES.classes[kind.group]}${kind.thirdParty ? ' mit Dritten' : ''}`,
      `${projectPointDescription(point).title}. ${state.responseLabel}`,
      point.voraussetzung && `Voraussetzung: ${point.voraussetzung}`].filter(Boolean).join(' · ');
    image.append(svg('a', { href: projectAddress(entry.id, 'fragen', point.id), tabindex: '0', class: 'glyphe-punkt-link',
      'data-project': entry.id, 'data-focus': 'fragen', 'data-question': point.id, 'aria-label': label,
      'aria-current': startzustand.frage === point.id ? 'true' : null }, svg('title', {}, label),
    svg('circle', { cx, cy, r: 12, class: 'glyphe-punkt-hit', 'aria-hidden': 'true' }),
    kind.thirdParty && svg('circle', { cx, cy, r: 9, class: 'glyphe-punkt-dritte', 'aria-hidden': 'true' }),
    pointShape(point, kind, state, cx, cy)));
  });
  const label = [entry.name, entry.status, `${progress.open} Antworten fehlen, ${progress.revisit} erneut zu prüfen, ${progress.answered} beantwortet`,
    hasSteps && 'Schritte dokumentiert', entry.wartetAuf && 'Wartet auf andere'].filter(Boolean).join('. ');
  return el('div', { class: 'glyphe', 'data-tile': entry.id, 'data-status': entry.status, 'data-selected': startzustand.projekt === entry.id ? 'true' : null },
  image, el('a', { class: 'glyphe-name', href: projectAddress(entry.id), 'data-project': entry.id, 'data-focus': 'projekt',
    'aria-label': label, 'aria-current': startzustand.projekt === entry.id && startzustand.fokus === 'projekt' ? 'true' : null },
    window.PROJECT_MARKS?.create(entry.id),
    // Active is the normal case and stays unmarked; the word keeps a deviating state readable without colour.
    el('span', {}, entry.name)), (entry.status !== 'aktiv' || entry.invoice) && el('span', { class: 'glyphe-status' },
      invoiceMark(entry.invoice), entry.status !== 'aktiv' && entry.status));
}

function renderProject() {
  const entry = selectProjects(daten.eintraege, startzustand).find((item) => item.id === startzustand.projekt);
  const target = $('project-detail');
  window.WORK_DETAIL?.unmount();
  if (!entry) {
    target.replaceChildren(el('h2', { id: 'project-title' }, 'Projekt auswählen'));
    return;
  }
  const points = daten.posten.filter((point) => point.projekt === entry.id);
  const steps = entry.schritte;
  const dates = projectDates(entry);
  const prospect = prospectInfo(entry);
  const progress = projectProgress(entry);
  const focus = startzustand.fokus;
  const selectedPoint = focus === 'fragen' && points.find((point) => point.id === startzustand.frage);
  target.replaceChildren(el('div', { class: 'project-heading' }, el('h2', { id: 'project-title', tabindex: '-1' }, entry.name),
    (prospect || entry.invoice || entry.status !== 'aktiv') && el('span', { class: 'project-state' }, invoiceMark(entry.invoice),
      invoiceState(entry.invoice)?.label, entry.invoice && (prospect || entry.status !== 'aktiv') && ' · ',
      prospect ? prospect.kind : entry.status !== 'aktiv' && entry.status)));
  if (focus !== 'projekt') target.append(el('a', { class: 'project-back', href: projectAddress(entry.id),
    'data-project': entry.id, 'data-focus': 'projekt' }, 'Gesamtes Projekt'));
  if (selectedPoint) {
    const workspace = el('div', { class: 'project-question-workspace', id: 'project-question-workspace' });
    target.append(workspace);
    if (unmetPrerequisite(selectedPoint, arbeitsstand(selectedPoint, startUrteile[selectedPoint.id]))) {
      workspace.append(el('div', { class: 'project-blocked-question' },
        pointBullet(selectedPoint, arbeitsstand(selectedPoint, startUrteile[selectedPoint.id])),
        el('p', { class: 'project-question-state project-question-blocked' }, 'Noch nicht entscheidbar')));
      const editor = el('div', { class: 'project-question-editor' });
      workspace.append(editor);
      window.WORK_DETAIL?.mount(editor, selectedPoint.id, { onSaved: refreshProjectAnswers });
    } else if (window.WORK_DETAIL) {
      window.WORK_DETAIL.mount(workspace, selectedPoint.id, { onSaved: refreshProjectAnswers });
    } else {
      workspace.append(el('h3', { id: 'project-question-title', tabindex: '-1' }, projectPointTitle(selectedPoint)),
        el('p', {}, selectedPoint.frage), selectedPoint.kontext && el('p', {}, selectedPoint.kontext),
        el('a', { href: `index.html#id=${encodeURIComponent(selectedPoint.id)}&projekt=${encodeURIComponent(entry.id)}&route=all&status=all` }, 'Frage bearbeiten'));
    }
    return;
  }
  const contextual = startzustand.text === 'kontext';
  const paragraphs = Array.isArray(entry.kurzprofil)
    ? entry.kurzprofil.filter((paragraph) => typeof paragraph === 'string' && paragraph.trim()).map((paragraph) => paragraph.trim()) : [];
  const hasContext = (focus === 'projekt' && (paragraphs.length > 1 || entry.ziele?.trim() || (entry.stand?.trim() && entry.stand.trim() !== projectEssence(entry))))
    || (['projekt', 'fragen'].includes(focus) && points.some((point) => point.kontext?.trim()));
  if (hasContext) {
    const density = el('fieldset', { class: 'project-text-density' }, el('legend', {}, 'Textumfang'),
      ...[['kurz', 'Kurz'], ['kontext', 'Kontext']].map(([value, label]) => el('label', {},
        el('input', { type: 'radio', name: 'project-text', value, checked: startzustand.text === value }), label)));
    density.addEventListener('change', (event) => selectProjectText(event.target.value));
    target.append(density);
  }
  if (prospect && ['projekt', 'warten'].includes(focus)) target.append(el('p', { class: 'prospect-detail-status' },
    entry.wartetAuf || prospect.status));
  if (focus === 'projekt') {
    const introduction = contextual ? null : projectIntroduction(entry);
    const visibleParagraphs = contextual ? paragraphs : paragraphs.slice(0, 1);
    if (introduction) target.append(el('div', { class: 'project-summary' },
      el('p', { class: 'project-item-title' }, introduction.text),
      el('ul', { class: 'project-steps' }, ...introduction.examples.map(example => el('li', {}, example))),
      el('p', { class: 'project-item-detail' }, introduction.limit),
      el('details', { class: 'project-original' }, el('summary', { 'aria-label': 'Vollständiges Projektprofil' }, 'Wortlaut'),
        ...paragraphs.map(paragraph => el('p', {}, paragraph)))));
    else if (visibleParagraphs.length) target.append(el('div', { class: 'project-summary' },
      ...visibleParagraphs.map((paragraph) => el('p', { class: 'project-item-title' }, paragraph))));
  }
  if (points.length && ['projekt', 'fragen'].includes(focus)) {
    const pending = [
      ['revisit', progress.revisit, 'erneut prüfen'], ['adoption', progress.adoption, 'Übernahme fehlt'],
      ['implementation', progress.implementation, 'Umsetzung fehlt'], ['validation', progress.validation, 'Prüfung fehlt'],
    ].filter(([, count]) => count > 0);
    if (pending.length) target.append(el('nav', { class: 'project-progress', 'aria-label': 'Ausstehende Bearbeitung' },
      ...pending.map(([status, count, label]) => el('a', { 'data-project': entry.id, 'data-focus': 'fragen', 'data-progress-status': status,
        'aria-current': startzustand.status === status ? 'true' : null,
        href: projectAddress(entry.id, 'fragen', '', { route: 'all', status: startzustand.status === status ? 'all' : status }) },
      `${count} ${label}`))));
    for (const [route, label] of [['human', 'Fragen und Entscheidungen'], ['agent', 'Vorschläge']]) {
      const group = points.filter((point, index) => progress.states[index].route === route
        && pointMatchesFilter(point, progress.states[index]));
      if (!group.length) continue;
      target.append(el('section', { class: 'project-section project-section-questions' },
        el('div', { class: 'project-section-head' }, el('h3', {}, label),
          el('button', { type: 'button', class: 'project-copy', 'data-copy-project': entry.id, 'data-copy-route': route,
            title: `${label} als Markdown kopieren`, 'aria-label': `${label} als Markdown kopieren` },
          svg('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' },
            svg('rect', { x: 8, y: 8, width: 12, height: 13, rx: 2 }), svg('path', { d: 'M15 8V3H3v13h5' }))),
          el('span', { class: 'project-copy-status', role: 'status' })),
        el('ul', { class: 'project-questions', role: 'list' }, ...group.map((point) => {
          const state = arbeitsstand(point, startUrteile[point.id]);
          const description = projectPointDescription(point);
          return el('li', {}, el('a', { href: projectAddress(entry.id, 'fragen', point.id),
            'data-project': entry.id, 'data-focus': 'fragen', 'data-question': point.id },
          pointBullet(point, state),
          el('span', { class: 'project-question-copy' }, el('span', { class: 'project-question-title' }, contextual ? (point.frageKurz || point.frage) : description.title),
            !contextual && description.detail && el('span', { class: 'project-item-detail' }, description.detail),
            unmetPrerequisite(point, state) && el('span', { class: 'project-item-detail' }, 'Noch nicht entscheidbar'),
            point.voraussetzung && el('span', { class: 'project-item-detail' }, `Voraussetzung: ${point.voraussetzung}`),
            contextual && point.kontext && el('span', { class: 'project-item-detail project-question-context' }, point.kontext)),
          !['Offen', 'Antwort fehlt'].includes(state.responseLabel)
            && el('span', { class: 'project-question-state', 'data-response': state.response }, state.responseLabel)),
          !contextual && description.reviewed && originalDisclosure(point.frage, point.kontext, `Vollständige Frage zu ${description.title}`));
        }))));
    }
  }
  if (steps.length && ['projekt', 'schritte'].includes(focus)) target.append(el('section', { class: 'project-section project-section-steps' },
    el('h3', {}, entry.status === 'ruhend' ? 'Schritte bei Wiederaufnahme' : 'Nächste Schritte'),
    steps.length ? el('ul', { class: 'project-steps' }, ...steps.map((step) => {
      // The convention prescribes this prefix for dormant entries; the section heading already says it.
      const description = contextual ? null : projectStepDescription(entry.id, step);
      return description
        ? el('li', { class: 'project-item-title' }, el('span', {}, description.title),
          el('span', { class: 'project-item-detail' }, description.detail),
          originalDisclosure(step, '', `Vollständiger Schritt zu ${description.title}`))
        : el('li', { class: 'project-item-title' }, step.replace(/^Merkposten bei Wiederaufnahme:\s*/, ''));
    })) : false));
  if (dates.length && ['projekt', 'schritte'].includes(focus)) target.append(renderDates(dates));
  if (!prospect && entry.wartetAuf && ['projekt', 'warten'].includes(focus)) {
    const items = entry.wartetAufPunkte?.length ? entry.wartetAufPunkte : [entry.wartetAuf];
    target.append(el('section', { class: 'project-section project-section-wait' }, el('h3', {}, 'Externe Beiträge'),
      entry.wartetAufPunkte?.length && entry.wartetAufTitel
        ? el('p', { class: 'project-item-title' }, entry.wartetAufTitel) : false,
      el('ul', { class: 'project-waiting' }, ...items.map((item) => el('li', {}, item)))));
  }
  const essence = projectEssence(entry);
  const showState = entry.stand?.trim() && entry.stand.trim() !== essence;
  if (focus === 'projekt' && (showState || entry.ziele?.trim())) {
    target.append(el('details', { class: 'project-state-details', ...(contextual ? { open: true } : {}) },
      el('summary', {}, entry.ziele?.trim() ? 'Arbeitsstand und Projektziel' : 'Arbeitsstand'),
      showState && el('p', {}, entry.stand),
      entry.ziele?.trim() && el('div', { class: 'project-goal' }, el('h4', {}, 'Projektziel'), el('p', {}, entry.ziele))));
  }
  if (focus === 'warten' && !entry.wartetAuf) target.append(el('p', {}, 'Kein ausstehender Beitrag dokumentiert.'));
  if (focus === 'schritte' && !steps.length && !dates.length) target.append(el('p', {}, 'Keine Schritte dokumentiert.'));
  if (focus === 'projekt' && window.PROJECT_RELATIONS) {
    const host = el('section', { 'aria-label': `Beziehungen von ${entry.name}` });
    const details = el('details', { class: 'project-relation-details' },
      el('summary', {}, 'Projektbeziehungen'), host);
    details.addEventListener('toggle', () => window.PROJECT_RELATIONS.update({
      project: entry.id,
      records: window.SECOND_BRAIN?.relations || [],
      warnings: window.SECOND_BRAIN?.relationWarnings || [],
      matrix: null,
      host,
      enabled: details.open,
    }));
    target.append(details);
  }
}

function selectProjectText(value) {
  // A detached control must never replace an editor that now contains unsaved input.
  if (startzustand.frage || !['kurz', 'kontext'].includes(value) || value === startzustand.text) return;
  startzustand.text = value;
  window.ARBEITSKONTEXT.schreibe('start', startzustand);
  renderProject();
  $('project-detail').querySelector?.(`input[name="project-text"][value="${value}"]`)?.focus();
}

function projectIntroduction() { return null; }

function projectEssence(entry) {
  return Array.isArray(entry.kurzprofil)
    ? entry.kurzprofil.find((paragraph) => typeof paragraph === 'string' && paragraph.trim())?.trim() || ''
    : '';
}

function projectDates(entry) {
  const dates = Array.isArray(entry.termine) ? entry.termine : [];
  if (!entry.milestone || dates.some((date) => entry.milestone.startsWith(date.datum))) return dates;
  return [...dates, { datum: '', text: entry.milestone }];
}

function renderDates(dates) {
  return el('ul', { class: 'project-dates', 'aria-label': 'Termine', role: 'list' }, ...dates.map((date) =>
    el('li', {}, date.datum ? el('time', { datetime: date.datum },
      new Date(`${date.datum}T12:00:00`).toLocaleDateString('de-AT', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })) : false,
    el('span', {}, date.text))));
}

// Shape carries the class of contribution, fill and stroke the answer state.
// The source wording goes into the conversation unchanged, with the anchor that identifies the point in ACTIVE-WORK.
function questionsMarkdown(entry, route) {
  const progress = projectProgress(entry);
  const lines = progress.points.filter((point, index) => progress.states[index].route === route).map((point, index) =>
    `${index + 1}. [${point.typ}] ${point.frage}${point.kontext ? ` Kontext: ${point.kontext}` : ''}${point.anker ? ` (^${point.anker})` : ''}`);
  return [`## ${entry.name}, offene Fragen aus ACTIVE-WORK`, '', entry.stand && `Stand: ${entry.stand}`, entry.stand && '', ...lines]
    .filter((line) => line !== false && line !== undefined).join('\n');
}

// Copying leaves no visible trace, so the button reports it; a blocked clipboard shows the text to copy by hand.
async function copyQuestions(button) {
  const entry = daten.eintraege.find((item) => item.id === button.dataset.copyProject);
  if (!entry) return;
  const text = questionsMarkdown(entry, button.dataset.copyRoute);
  try {
    await navigator.clipboard.writeText(text);
    const status = button.parentElement.querySelector('[role="status"]');
    status.textContent = 'Kopiert';
    setTimeout(() => { status.textContent = ''; }, 2500);
  } catch {
    const field = el('textarea', { class: 'project-copy-text', readonly: true, rows: '6', 'aria-label': 'Fragen als Markdown' });
    field.value = text;
    button.replaceWith(field);
    field.select();
  }
}

function pointShape(point, kind, state, cx, cy) {
  const size = state.response === 'revisit' ? 1.2 : 1;
  const [tag, geometry] = window.POINT_TYPES?.shape(kind.group, cx, cy, size) || ['circle', { cx, cy, r: 4.5 * size }];
  return svg(tag, { ...geometry, 'aria-hidden': 'true',
    class: `glyphe-punkt${state.response === 'open' ? ' glyphe-offen' : ''}${unmetPrerequisite(point, state) ? ' glyphe-spaeter' : ''}`,
    'data-urteil': state.response === 'revisit' ? 'change' : startUrteile[point.id]?.urteil,
    'stroke-dasharray': state.response === 'revisit' ? '2 2' : null });
}

function unmetPrerequisite(point) {
  // The source removes this field once the prerequisite is satisfied. A local answer cannot satisfy it.
  return Boolean(point.voraussetzung);
}

// The list repeats the glyph's symbol as its bullet, so a question looks the same in both places.
function pointBullet(point, state) {
  const kind = window.POINT_TYPES?.of(point.id) || { group: '', thirdParty: false };
  const name = [window.POINT_TYPES?.classes[kind.group], kind.thirdParty && 'mit Dritten'].filter(Boolean).join(' ');
  return svg('svg', { viewBox: '0 0 20 20', class: 'project-question-bullet', role: name ? 'img' : null,
    'aria-label': name || null, 'aria-hidden': name ? null : 'true', focusable: 'false' }, name && svg('title', {}, name),
  kind.thirdParty && svg('circle', { cx: 10, cy: 10, r: 9, class: 'glyphe-punkt-dritte', 'aria-hidden': 'true' }),
  pointShape(point, kind, state, 10, 10));
}

function originalDisclosure(question, context, label) {
  return el('details', { class: 'project-original' }, el('summary', { 'aria-label': label }, 'Wortlaut'),
    el('p', {}, question), context && el('p', {}, context));
}

function projectStepDescription() { return null; }
function projectPointDescription(point) { return { title: projectPointTitle(point), detail: '' }; }
function projectPointTitle(point) { return point.frageKurz || titelVon(point); }

const publicationProjects = new Set();
function projectGroup(entry) {
  return entry.status === 'abgeschlossen' ? 'Abgeschlossen' : entry.bereich;
}

function archiveRow(entry) {
  return el('li', {}, el('a', { href: projectAddress(entry.id), 'data-project': entry.id, 'data-focus': 'projekt' },
    window.PROJECT_MARKS?.create(entry.id), el('span', {}, entry.name)));
}

function renderGlyphs() {
  const entries = selectProjects(daten.eintraege, startzustand);
  const groups = new Map();
  for (const entry of entries) {
    const group = projectGroup(entry);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(entry);
  }
  // Waiting projects need no action now, so they follow the ones that do; sort is stable within each status.
  for (const items of groups.values()) items.sort((a, b) => (a.status === 'wartend') - (b.status === 'wartend'));
  const order = ['Auftragsprojekte', 'Wissenschaftliche Eigenforschung', 'Wissenschaftliche Infrastruktur',
    'Lehre und Vermittlung', 'Privat und kreativ', 'Für Freunde', 'Abgeschlossen', 'Anbahnungen'];
  const orderedGroups = [...groups].sort(([a], [b]) => order.indexOf(a) - order.indexOf(b));
  $('project-list').replaceChildren(...orderedGroups.map(([name, items]) => el('section', { class: 'glyphen-gruppe' },
    el('h2', {}, name), name === 'Anbahnungen'
      ? el('ul', { class: 'prospect-list', role: 'list' }, ...items.map(prospectRow))
      : name === 'Abgeschlossen'
        ? el('ul', { class: 'archive-list', role: 'list' }, ...items.map(archiveRow))
      : name === 'Wissenschaftliche Eigenforschung'
        ? researchGroups(items)
      : el('div', { class: 'glyphen-feld' }, ...items.map(projectGlyph)))));
  $('project-empty').hidden = entries.length > 0;
  // A key for an answer state appears only while a visible project shows that state.
  const responses = new Set(entries.flatMap((entry) => projectProgress(entry).states.map((state) => state.response)));
  $('legend-answered').hidden = !responses.has('answered');
  $('legend-revisit').hidden = !responses.has('revisit');
  $('legend-later').hidden = !entries.some((entry) => {
    const progress = projectProgress(entry);
    return progress.points.some((point, index) => unmetPrerequisite(point, progress.states[index]));
  });
  $('project-result').textContent = startzustand.suche || startzustand.filter !== 'laufend' ? `${entries.length} ${entries.length === 1 ? 'Projekt' : 'Projekte'} gefunden` : '';
  $('project-search').value = startzustand.suche;
  for (const input of $('project-filter').querySelectorAll('input')) input.checked = input.value === startzustand.filter;
  renderActiveQuestionFilter();
  window.ARBEITSKONTEXT.links(startzustand.projekt);
}

function renderActiveQuestionFilter() {
  let control = document.querySelector?.('#overview-active-filter');
  const active = startzustand.route !== 'all' || startzustand.status !== 'all';
  if (!active) { control?.remove(); return; }
  if (!control) {
    control = el('p', { id: 'overview-active-filter', class: 'overview-active-filter' });
    document.querySelector?.('.overview-tools')?.append(control);
  }
  const route = { human: 'Meine Fragen', agent: 'Vorschläge' }[startzustand.route];
  const status = { open: 'Offen', revisit: 'Erneut prüfen', answered: 'Beantwortet', adoption: 'Übernahme fehlt',
    implementation: 'Umsetzung fehlt', validation: 'Prüfung fehlt' }[startzustand.status];
  control.replaceChildren(el('span', {}, ['Fragen', route, status].filter(Boolean).join(' · ')),
    el('a', { href: projectAddress(startzustand.projekt, startzustand.fokus, startzustand.frage,
      { route: 'all', status: 'all' }) }, 'Filter aufheben'));
}

function researchGroups(items) {
  const publications = items.filter((entry) => publicationProjects.has(entry.id));
  const research = items.filter((entry) => !publicationProjects.has(entry.id));
  return el('div', { class: 'research-groups' },
    research.length ? el('div', { class: 'glyphen-feld' }, ...research.map(projectGlyph)) : false,
    publications.length ? el('section', { class: 'research-publications' }, el('h3', {}, 'Schreiben und Publizieren'),
      el('div', { class: 'glyphen-feld' }, ...publications.map(projectGlyph))) : false);
}

function renderOverview() {
  renderGlyphs();
  renderProject();
}

function refreshProjectAnswers() {
  const saved = window.WORK_STORAGE.read(SPEICHER);
  if (!saved.ok) { $('stoerung').hidden = false; $('stoerung').textContent = saved.error; return; }
  startUrteile = saved.data;
  renderGlyphs();
}

function selectProjectTarget(project, focus = 'projekt', question = '') {
  if (!daten.eintraege.some((entry) => entry.id === project)) return;
  startzustand.projekt = project;
  startzustand.fokus = ['projekt', 'fragen', 'schritte', 'warten'].includes(focus) ? focus : 'projekt';
  startzustand.frage = startzustand.fokus === 'fragen'
    && daten.posten.some((point) => point.id === question && point.projekt === project) ? question : '';
  window.ARBEITSKONTEXT.schreibe('start', startzustand);
  renderOverview();
  $('project-title').focus({ preventScroll: true });
  // In the single-column layout the panel sits below the grid, so a selection brings it to the top of the screen.
  const detail = $('project-detail');
  if (window.getComputedStyle?.(detail).position === 'static') detail.scrollIntoView?.({ block: 'start' });
}

function restoreOverview() {
  const saved = window.ARBEITSKONTEXT.lese('start');
  startzustand.projekt = daten.eintraege.some((entry) => entry.id === saved.projekt) ? saved.projekt : '';
  startzustand.suche = typeof saved.suche === 'string' ? saved.suche : '';
  startzustand.filter = ['laufend', 'fragen', 'ruhend', 'abgeschlossen', 'alle'].includes(saved.filter) ? saved.filter : 'laufend';
  startzustand.text = ['kurz', 'kontext'].includes(saved.text) ? saved.text : 'kurz';
  startzustand.route = ['human', 'agent', 'all'].includes(saved.route) ? saved.route : 'all';
  startzustand.status = ['open', 'revisit', 'answered', 'adoption', 'implementation', 'validation', 'all'].includes(saved.status)
    ? saved.status : 'all';
  const address = new URLSearchParams(location.hash.slice(1));
  const projectOnly = address.has('projekt') && !address.has('fokus') && !address.has('frage');
  startzustand.fokus = !projectOnly && ['projekt', 'fragen', 'schritte', 'warten'].includes(saved.fokus) ? saved.fokus : 'projekt';
  if (address.get('frage') && !address.has('fokus')) startzustand.fokus = 'fragen';
  startzustand.frage = startzustand.fokus === 'fragen'
    && daten.posten.some((point) => point.id === saved.frage && point.projekt === startzustand.projekt) ? saved.frage : '';
  if (!saved.filter && ['ruhend', 'abgeschlossen'].includes(
    daten.eintraege.find((entry) => entry.id === startzustand.projekt)?.status)) startzustand.filter = 'alle';
  renderOverview();
}

async function start() {
  await window.SECOND_BRAIN?.ready;
  if (!Array.isArray(daten?.eintraege)) {
    $('stoerung').hidden = false;
    $('stoerung').textContent = 'Die Projektübersicht konnte nicht geladen werden. Bitte die Seite erneut laden.';
    return;
  }
  searchIndex = new Map(daten.eintraege.map((entry) => [entry.id,
    normalize([entry.name, entry.bereich, ...(Array.isArray(entry.kurzprofil) ? entry.kurzprofil : []), entry.stand, entry.ziele].join(' '))]));
  const savedAnswers = window.WORK_STORAGE.read(SPEICHER);
  startUrteile = savedAnswers.data;
  if (!savedAnswers.ok) { $('stoerung').hidden = false; $('stoerung').textContent = savedAnswers.error; }
  const navigate = (event) => {
    const link = event.target.closest('a[data-project]');
    const copy = !link && event.target.closest('button[data-copy-project]');
    if (copy) { copyQuestions(copy); return; }
    // The empty tile area opens the whole project for the pointer; the name link stays the keyboard path.
    const tile = !link && event.target.closest('.glyphe[data-tile]');
    if (tile) selectProjectTarget(tile.dataset.tile, 'projekt');
    if (!link) return;
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button > 0) return;
    event.preventDefault();
    if (link.dataset.progressStatus) {
      startzustand.status = startzustand.status === link.dataset.progressStatus ? 'all' : link.dataset.progressStatus;
      startzustand.route = 'all';
    }
    selectProjectTarget(link.dataset.project, link.dataset.focus, link.dataset.question);
  };
  $('project-list').addEventListener('click', navigate);
  $('project-detail').addEventListener('click', navigate);
  $('project-search').addEventListener('input', (event) => {
    startzustand.suche = event.target.value;
    window.ARBEITSKONTEXT.schreibe('start', startzustand); renderOverview();
  });
  $('project-filter').addEventListener('change', (event) => {
    startzustand.filter = event.target.value;
    window.ARBEITSKONTEXT.schreibe('start', startzustand); renderOverview();
  });
  window.addEventListener('hashchange', restoreOverview);
  window.addEventListener('popstate', restoreOverview);
  window.addEventListener('storage', (event) => {
    if (event.key !== SPEICHER && event.key !== null) return;
    const saved = window.WORK_STORAGE.read(SPEICHER);
    if (!saved.ok) { $('stoerung').hidden = false; $('stoerung').textContent = saved.error; return; }
    startUrteile = saved.data; renderGlyphs();
    // The shared editor owns source/storage refresh and protects unsaved input.
    if (!startzustand.frage || !window.WORK_DETAIL) renderProject();
  });
  window.addEventListener('work-progress-changed', () => {
    renderGlyphs();
    if (!startzustand.frage || !window.WORK_DETAIL) renderProject();
  });
  restoreOverview(); window.SECOND_BRAIN?.status();
}

start();
