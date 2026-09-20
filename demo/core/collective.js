'use strict';

// Each lens reads the same source-bound units. No view starts or resumes an agent.
(() => {
  const modes = { team: 'Dokumentierte Beiträge', organisation: 'Gliederung der Arbeit', civilisation: 'Projektbeziehungen', colony: 'Voraussetzungen' };
  const kinds = { eintrag: 'Projekt', punkt: 'Frage', teil: 'Teilfrage', schritt: 'Schritt', termin: 'Termin', warten: 'Beitrag', bedingung: 'Bedingung', meilenstein: 'Meilenstein', folge: 'Folge' };
  const relationNames = { requires: 'benötigt', uses_tool: 'nutzt Werkzeug', uses_data: 'nutzt Daten', supplies_data: 'liefert Daten', uses_method: 'methodischer Bezug zu' };
  const $ = id => document.getElementById(id);
  const state = { projekt: '', mode: 'team', text: 'short', unit: '', edge: '', info: '' };
  let model;
  let points = new Map();
  let answers = {};
  let storageWarning = '';
  let returnTarget = '';

  function el(tag, attributes = {}, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attributes)) if (value !== null && value !== undefined) node.setAttribute(key, String(value));
    for (const child of children.flat()) if (child !== false && child !== null && child !== undefined) node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    return node;
  }
  function replaceContent(node, ...children) {
    node.replaceChildren(...children.flat().filter(child => child !== false && child !== null && child !== undefined));
  }
  const project = () => model.projects.find(item => item.id === state.projekt);
  const units = () => project()?.units.filter(item => item.kind !== 'eintrag') || [];
  const unitById = id => model.units.find(item => item.id === id);
  const projectById = id => model.projects.find(item => item.id === id);
  const titleOf = id => projectById(id)?.name || unitById(id)?.title || id;
  const titleText = item => item.displayTitle || item.title;
  const edgeKey = edge => `${edge.from}|${edge.kind}|${edge.to}`;
  const edgeLabel = edge => `${titleOf(edge.from)} → ${relationNames[edge.kind] || edge.kind} → ${titleOf(edge.to)}`;
  const dependencyEdges = () => model.edges.filter(edge => edge.kind === 'requires'
    && units().some(item => item.id === edge.from) && units().some(item => item.id === edge.to));
  const projectEdges = () => model.edges.filter(edge => (edge.from === state.projekt || edge.to === state.projekt)
    && projectById(edge.from) && projectById(edge.to));
  const scopeEdges = () => state.mode === 'civilisation' ? projectEdges() : dependencyEdges();
  const relatedEdges = item => dependencyEdges().filter(edge => edge.from === item.id || edge.to === item.id);
  const selectedEdge = () => [...projectEdges(), ...dependencyEdges()].find(edge => edgeKey(edge) === state.edge);
  const pointFor = item => points.get(item.questionId || item.pointId);

  function save() { window.ARBEITSKONTEXT.schreibe('collective', state); }
  function workLink(item) { return window.ARBEITSKONTEXT.arbeitsadresse(item.projectId || item.id, item.questionId || item.pointId || ''); }
  function sourceLink(source, projectId = state.projekt) {
    return `sources.html#${new URLSearchParams({ projekt: projectId, path: source.path || '', anchor: String(source.anchor || '').replace(/^\^/, '') })}`;
  }
  function readAnswers() {
    const stored = window.WORK_STORAGE.read(SPEICHER);
    answers = stored.data;
    storageWarning = stored.ok ? '' : 'Gespeicherte Antworten sind nicht lesbar. Antwortstände bleiben ungeklärt.';
  }
  function responseFor(item) {
    const point = points.get(item.pointId);
    if (!point) return '';
    if (storageWarning) return 'Antwortstand ungeklärt';
    const response = arbeitsstand(point, answers[point.id]);
    if (response.route === 'agent') return 'Technische Routine';
    return point.voraussetzung ? [response.responseLabel !== 'Offen' && response.responseLabel, 'Voraussetzung offen'].filter(Boolean).join(' · ') : response.responseLabel;
  }
  function showNotice() {
    $('collective-notice').textContent = [...model.warnings, ...(window.SECOND_BRAIN.relationWarnings || []), storageWarning].filter(Boolean).join(' ');
  }
  function refreshAnswers() {
    readAnswers();
    for (const node of $('collective-map').querySelectorAll('[data-response-for]')) {
      const item = unitById(node.dataset.responseFor);
      if (item) node.textContent = responseFor(item);
    }
    showNotice();
  }
  function unitButton(item) {
    const parent = unitById(item.parentId);
    return el('button', { type: 'button', class: 'collective-node', 'data-unit': item.id, 'data-kind': item.kind,
      'aria-pressed': state.unit === item.id, 'aria-controls': 'collective-detail' },
      el('span', { class: 'collective-kind' }, kinds[item.kind] || item.kind),
      el('span', { class: 'collective-node-copy' },
        el('span', { class: 'collective-node-title' }, titleText(item)),
        item.prerequisite && el('span', { class: 'collective-prerequisite' }, `Voraussetzung: ${item.prerequisite}`),
        parent && parent.kind !== 'eintrag' && el('span', { class: 'collective-meta' }, `Teil von ${titleText(parent)}`),
        (item.origin === 'derived' || state.mode !== 'team') && el('span', { class: 'collective-meta' },
          [item.origin === 'derived' ? 'Abgeleitet' : '', state.mode !== 'team' ? item.responsibilityLabel : ''].filter(Boolean).join(' · ')),
        state.text === 'context' && item.context && el('span', { class: 'collective-context' }, item.context)),
      item.date ? el('time', { datetime: item.date }, datum(item.date))
        : el('span', { class: 'collective-response', 'data-response-for': item.id }, responseFor(item)));
  }
  function unitList(items) { return el('ul', { class: 'collective-list', role: 'list' }, ...items.map(item => el('li', {}, unitButton(item)))); }
  function team(host) {
    for (const [owner, label] of Object.entries({ du: 'Dein Beitrag', agent: 'Agenten zugeordnet', dritte: 'Externe Beiträge', offen: 'Zuständigkeit offen' })) {
      const owned = units().filter(item => item.responsibility === owner);
      if (owned.length) host.append(el('section', { class: 'collective-group', 'data-owner': owner }, el('h2', {}, label), unitList(owned)));
    }
    if (!units().length) host.append(el('p', { class: 'collective-empty' }, 'Keine Arbeitseinheiten dokumentiert.'));
  }
  function organisation(host) {
    const all = units();
    const ordered = [];
    const visited = new Set();
    function visit(item) {
      if (visited.has(item.id)) return;
      visited.add(item.id); ordered.push(item);
      for (const child of all.filter(unit => unit.parentId === item.id)) visit(child);
    }
    all.filter(item => !all.some(parent => parent.id === item.parentId)).forEach(visit);
    all.forEach(visit);
    host.append(unitList(ordered));
    if (!all.length) host.append(el('p', { class: 'collective-empty' }, 'Keine Arbeitseinheiten dokumentiert.'));
  }
  function edgeButton(edge) {
    return el('button', { type: 'button', class: 'collective-connection', 'data-edge': edgeKey(edge),
      'aria-pressed': state.edge === edgeKey(edge), 'aria-controls': 'collective-detail' },
      el('span', { class: 'collective-endpoint' }, titleOf(edge.from)),
      el('span', { class: 'collective-relation' }, relationNames[edge.kind] || edge.kind, el('span', { 'aria-hidden': 'true' }, ' →')),
      el('span', { class: 'collective-endpoint' }, titleOf(edge.to)),
      (edge.qualifier || edge.origin === 'derived' || edge.state === 'proposed' || !edge.current) && el('span', { class: 'collective-connection-meta' },
        [edge.qualifier, edge.origin === 'derived' && 'Abgeleitet', edge.state === 'proposed' && 'Vorschlag',
          !edge.current && 'Quellenabgleich offen'].filter(Boolean).join(' · ')));
  }
  function network(host) {
    const edges = scopeEdges();
    const current = edges.filter(edge => edge.current);
    const historical = edges.filter(edge => !edge.current);
    const isProject = state.mode === 'civilisation';
    if (current.length) host.append(el('ul', { class: 'collective-connections', role: 'list' }, ...current.map(edge => el('li', {}, edgeButton(edge)))));
    else host.append(el('p', { class: 'collective-empty' }, isProject
      ? 'Keine aktuell belegten Projektbeziehungen.' : 'Keine Abhängigkeiten als Beziehungen dokumentiert.'));
    if (historical.length) host.append(el('section', { class: 'collective-group' }, el('h2', {}, 'Quellenabgleich offen'),
      el('ul', { class: 'collective-connections', role: 'list' }, ...historical.map(edge => el('li', {}, edgeButton(edge))))));
    if (!isProject) {
      // All units stay directly inspectable, including conditions evidenced by an incoming edge.
      host.append(el('section', { class: 'collective-group' }, el('h2', {}, 'Arbeitseinheiten'), unitList(units())));
    }
  }
  function evidenceBlock(edge) {
    const question = edge.kind === 'requires' && [unitById(edge.from), unitById(edge.to)].find(item => item && pointFor(item));
    return el('section', { class: 'collective-evidence' },
      el('p', {}, edgeLabel(edge)),
      el('p', { class: 'collective-meta' }, [edge.origin === 'derived' ? 'Aus Quellenwortlaut abgeleitet' : 'Quellengebundene Beziehung',
        edge.state === 'proposed' && 'Vorschlag'].filter(Boolean).join(' · ')),
      edge.qualifier && el('p', {}, edge.qualifier),
      !edge.current && el('p', { class: 'collective-prerequisite' }, `Quellenabgleich offen. ${(edge.problems || []).join(' ')}`),
      el('blockquote', {}, edge.source?.quote || 'Kein Originalbeleg vorhanden.'),
      edge.source?.path && el('a', { href: sourceLink(edge.source) }, edge.source.path),
      question && el('a', { class: 'collective-work-link', href: workLink(question) }, 'Zugehörige Frage öffnen'));
  }
  function detail() {
    const host = $('collective-detail');
    const edge = selectedEdge();
    const item = units().find(entry => entry.id === state.unit);
    const p = project();
    const visible = Boolean(p && (edge || item || state.info === 'project'));
    host.hidden = !visible;
    $('collective-layout').dataset.detail = String(visible);
    $('collective-project-context').setAttribute('aria-expanded', String(state.info === 'project'));
    if (!visible) { host.replaceChildren(); return; }
    const heading = edge ? 'Beziehung prüfen' : item ? `${kinds[item.kind] || item.kind} prüfen` : p.name;
    replaceContent(host, el('div', { class: 'collective-detail-heading' }, el('h2', { tabindex: '-1' }, heading),
      el('button', { type: 'button', class: 'collective-close', 'data-close-detail': '', 'aria-label': 'Details schließen', title: 'Details schließen' }, '×')));
    if (edge) { host.append(evidenceBlock(edge)); return; }
    if (item) {
      const point = pointFor(item);
      const parent = unitById(item.parentId);
      const original = item.source?.quote;
      host.append(el('p', { class: 'collective-meta' }, `${item.responsibilityLabel} · ${item.origin === 'derived' ? 'abgeleitet' : 'aus der Quelle'}`));
      if (item.date) host.append(el('time', { datetime: item.date }, datum(item.date)));
      if (item.origin === 'derived' && item.title !== original) host.append(el('p', { class: 'collective-derived' }, item.title));
      if (original) host.append(el('blockquote', {}, original));
      else if (item.origin !== 'derived') host.append(el('p', {}, item.text || item.title));
      if (item.prerequisite && !original?.includes(item.prerequisite)) host.append(el('p', { class: 'collective-prerequisite' }, `Voraussetzung: ${item.prerequisite}`));
      const context = item.context || (item.kind === 'teil' ? point?.kontext : '');
      if (context) host.append(el('p', {}, context));
      if (parent && parent.kind !== 'eintrag') host.append(el('p', { class: 'collective-meta' }, `Teil von ${titleText(parent)}`));
      const related = relatedEdges(item);
      if (item.source?.path && (original || !related.length)) host.append(el('a', { href: sourceLink(item.source) }, item.source.path));
      for (const connection of related) host.append(evidenceBlock(connection));
      if (point || !related.some(connection => [unitById(connection.from), unitById(connection.to)].some(unit => unit && pointFor(unit)))) {
        host.append(el('a', { class: 'collective-work-link', href: workLink(item) }, point ? 'Frage im Projekt öffnen' : 'Im Projekt weiterarbeiten'));
      }
      return;
    }
    for (const paragraph of String(p.summary || '').split(/\n\n/).filter(Boolean)) host.append(el('p', {}, paragraph));
    if (p.stand) host.append(el('h3', {}, 'Arbeitsstand'), el('p', {}, p.stand));
    host.append(el('a', { class: 'collective-work-link', href: workLink(p) }, 'Projekt und Fragen öffnen'),
      el('a', { href: sourceLink({ path: p.raw.notizPfad || '' }, p.id) }, 'Projektwissen lesen'));
  }
  function selection() {
    for (const node of $('collective-map').querySelectorAll('button')) {
      node.setAttribute('aria-pressed', String(Boolean(node.dataset.unit && node.dataset.unit === state.unit)
        || Boolean(node.dataset.edge && node.dataset.edge === state.edge)));
    }
    detail();
  }
  function render() {
    readAnswers();
    $('collective-map').replaceChildren();
    if (!project()) { $('collective-map').append(el('p', {}, 'Keine Projekte verfügbar.')); detail(); return; }
    $('collective-project').value = state.projekt;
    $('collective-mode').value = state.mode;
    $('collective-text').checked = state.text === 'context';
    $('collective-context-control').hidden = state.mode === 'civilisation' || !units().some(item => item.context);
    $('collective-map').setAttribute('aria-label', modes[state.mode]);
    $('collective-source').href = sourceLink({ path: model.source });
    $('collective-source').textContent = model.source || 'Quelle';
    $('collective-work').href = workLink(project());
    showNotice();
    if (state.mode === 'team') team($('collective-map'));
    else if (state.mode === 'organisation') organisation($('collective-map'));
    else network($('collective-map'));
    selection(); window.ARBEITSKONTEXT.links(state.projekt);
  }
  function restore() {
    const saved = window.ARBEITSKONTEXT.lese('collective');
    state.projekt = projectById(saved.projekt) ? saved.projekt : model.projects.find(item => item.status === 'aktiv')?.id || model.projects[0]?.id || '';
    state.mode = Object.hasOwn(modes, saved.mode) ? saved.mode : 'team';
    state.text = saved.text === 'context' ? 'context' : 'short';
    state.unit = state.mode !== 'civilisation' && units().some(item => item.id === saved.unit) ? saved.unit : '';
    state.edge = scopeEdges().some(edge => edgeKey(edge) === saved.edge) ? saved.edge : '';
    state.info = !state.unit && !state.edge && saved.info === 'project' ? 'project' : '';
    render();
  }
  function closeDetail() {
    state.unit = ''; state.edge = ''; state.info = ''; save(); selection();
    document.querySelector(returnTarget || '#collective-project-context')?.focus();
  }
  function focusDetail() {
    const host = $('collective-detail');
    host.querySelector('h2')?.focus({ preventScroll: true });
    if (host.getBoundingClientRect().top >= $('collective-map').getBoundingClientRect().bottom) host.scrollIntoView({ block: 'start' });
  }
  async function start() {
    try {
      const data = await window.SECOND_BRAIN.ready;
      points = new Map(data.posten.map(point => [point.id, point]));
      model = window.COLLECTIVE_MODEL.build(data, window.SECOND_BRAIN.relations);
      for (const item of model.projects) $('collective-project').append(el('option', { value: item.id }, item.name));
      restore(); window.SECOND_BRAIN.status();
      $('collective-project').addEventListener('change', event => { state.projekt = event.target.value; state.unit = ''; state.edge = ''; state.info = ''; returnTarget = ''; save(); render(); });
      $('collective-mode').addEventListener('change', event => {
        state.mode = event.target.value; state.unit = ''; state.edge = ''; state.info = '';
        returnTarget = '#collective-mode'; save(); render();
      });
      $('collective-text').addEventListener('change', event => { state.text = event.target.checked ? 'context' : 'short'; save(); render(); });
      $('collective-project-context').addEventListener('click', () => {
        if (state.info === 'project') { closeDetail(); return; }
        state.unit = ''; state.edge = ''; state.info = 'project'; returnTarget = '#collective-project-context'; save(); selection(); focusDetail();
      });
      $('collective-map').addEventListener('click', event => {
        const button = event.target.closest('button');
        if (!button) return;
        const key = button.dataset.unit ? 'unit' : button.dataset.edge ? 'edge' : '';
        if (!key) return;
        state.unit = ''; state.edge = ''; state.info = ''; state[key] = button.dataset[key];
        returnTarget = `button[data-${key}="${CSS.escape(state[key])}"]`;
        save(); selection(); focusDetail();
      });
      $('collective-detail').addEventListener('click', event => { if (event.target.closest('[data-close-detail]')) closeDetail(); });
      $('collective-detail').addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); closeDetail(); } });
      window.addEventListener('hashchange', restore);
      window.addEventListener('focus', refreshAnswers);
      window.addEventListener('storage', event => { if (event.key === SPEICHER || event.key === null) refreshAnswers(); });
    } catch (error) { $('collective-notice').textContent = `Die Arbeitsansicht konnte nicht geladen werden: ${error.message}`; }
  }
  start();
})();
