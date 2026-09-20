'use strict';

window.PROJECT_RELATIONS = (() => {
  const active = new WeakMap();
  const labels = { uses_tool: 'nutzt als Werkzeug', uses_data: 'nutzt Daten aus',
    supplies_data: 'liefert Daten an', uses_method: 'Methodischer Bezug zu' };
  const kinds = { uses_tool: 'Werkzeug', uses_data: 'Datennutzung', supplies_data: 'Datenlieferung', uses_method: 'Methodischer Bezug' };
  let serial = 0;

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function svg(tag, attributes) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
    return node;
  }

  function current(record) {
    return record.valid === true && Object.hasOwn(labels, record.kind)
      && ['documented', 'proposed'].includes(record.state)
      && typeof record.source?.path === 'string' && Boolean(record.source.path)
      && typeof record.source?.revision === 'string' && Boolean(record.source.revision)
      && typeof record.source?.quote === 'string' && Boolean(record.source.quote);
  }

  /** Render source-bound project relations; a repeated call replaces its observers and overlay. */
  function update({ project, records = [], warnings = [], matrix, host, enabled }) {
    if (!host) return;
    active.get(host)?.();
    host.replaceChildren();
    host.hidden = !enabled;
    if (!enabled) return;
    host.classList.add('project-relations');
    host.append(element('h3', 'Projektbeziehungen'));
    for (const warning of Array.isArray(warnings) ? warnings : []) {
      if (typeof warning === 'string') host.append(element('p', warning, 'project-relation-warning'));
    }
    if (!project) {
      host.append(element('p', 'Projekt für Beziehungen auswählen.'));
      return;
    }
    const names = new Map((window.PRUEFANSICHT?.eintraege || []).map((entry) => [entry.id, entry.name]));
    const name = (id) => names.get(id) || id;
    const selected = (Array.isArray(records) ? records : []).filter((record) => record
      && typeof record.from === 'string' && typeof record.to === 'string'
      && (record.from === project || record.to === project));
    if (!selected.length) {
      host.append(element('p', Array.isArray(warnings) && warnings.length
        ? `Beziehungsdaten für ${name(project)} derzeit nicht vollständig verfügbar.`
        : `Keine erfassten Beziehungen für ${name(project)}.`));
      return;
    }
    const list = element('ul');
    list.setAttribute('role', 'list');
    for (const record of selected) {
      const item = element('li');
      item.append(element('p', `${name(record.from)} → ${name(record.to)}`, 'project-relation-label'));
      const type = element('p', Object.hasOwn(kinds, record.kind) ? kinds[record.kind] : 'Beziehung', 'project-relation-type');
      if (Object.hasOwn(kinds, record.kind)) type.setAttribute('data-kind', record.kind);
      item.append(type);
      item.append(element('p', record.state === 'proposed' ? 'Vorgeschlagen' : record.state === 'documented' ? 'Dokumentiert' : 'Beziehungsart nicht geprüft', 'project-relation-state'));
      if (typeof record.qualifier === 'string' && record.qualifier) item.append(element('p', record.qualifier));
      if (!current(record)) {
        item.append(element('p', 'Quelle geändert oder Beziehung nicht aktuell prüfbar.', 'project-relation-warning'));
        for (const problem of Array.isArray(record.problems) ? record.problems : []) {
          if (typeof problem === 'string') item.append(element('p', problem, 'project-relation-warning'));
        }
      }
      if (typeof record.source?.quote === 'string') {
        const quote = record.source.quote;
        const statements = [...quote.matchAll(/^stand::[ \t]*(.+)$/gm)];
        const excerpt = record.source.path === 'ACTIVE-WORK.md' && /^#### /m.test(quote) && statements.length === 1
          ? statements[0][1].replace(/\r$/, '') : quote;
        item.append(element('blockquote', excerpt));
        if (excerpt !== quote) {
          const original = element('details', '', 'project-relation-original');
          original.append(element('summary', 'Vollständiger Beleg'), element('blockquote', quote));
          item.append(original);
        }
      }
      if (typeof record.source?.path === 'string' && record.source.path) {
        const link = element('a', record.source.path);
        link.setAttribute('href', `sources.html#${new URLSearchParams({ path: record.source.path, projekt: project })}`);
        item.append(link);
      }
      list.append(item);
    }
    host.append(list);
    if (!matrix) return;

    const legend = element('ul', '', 'project-relation-legend');
    legend.setAttribute('aria-label', 'Beziehungsarten der sichtbaren Pfeile');
    legend.setAttribute('role', 'list');
    matrix.before(legend);
    const overlay = svg('svg', { class: 'project-relations-overlay', role: 'group', 'aria-label': 'Gerichtete Projektbeziehungen', focusable: 'false' });
    const markerId = `project-relation-arrow-${++serial}`;
    let stopped = false;
    function draw() {
      if (stopped) return;
      overlay.replaceChildren();
      legend.replaceChildren(); legend.hidden = true;
      overlay.setAttribute('height', '0');
      matrix.classList.remove('project-relations-matrix');
      if (matrix.clientWidth < 640 || !matrix.getBoundingClientRect().height) return;
      const rows = new Map([...matrix.querySelectorAll('tr[data-project]')].map((row) => [row.dataset.project, row]));
      const edges = selected.filter((record) => current(record) && record.from !== record.to
        && rows.has(record.from) && rows.has(record.to));
      if (!edges.length) return;
      // A separate gutter connects project rows without crossing question controls.
      matrix.classList.add('project-relations-matrix');
      const bounds = matrix.getBoundingClientRect();
      const height = matrix.scrollHeight;
      overlay.setAttribute('viewBox', `0 0 40 ${height}`);
      overlay.setAttribute('height', String(height));
      const defs = svg('defs', {});
      for (const kind of [...new Set(edges.map(record => record.kind))]) {
        const marker = svg('marker', { id: `${markerId}-${kind}`, viewBox: '0 0 6 6', refX: 5, refY: 3,
          markerWidth: 6, markerHeight: 6, orient: 'auto', markerUnits: 'userSpaceOnUse' });
        marker.append(svg('path', { d: 'M0 0L6 3L0 6z', class: 'project-relation-arrow', 'data-kind': kind }));
        defs.append(marker);
        const item = element('li', kinds[kind]); item.setAttribute('data-kind', kind); legend.append(item);
      }
      if (edges.some(record => record.state === 'proposed')) legend.append(element('li', 'Gestrichelt = vorgeschlagen', 'project-relation-legend-proposed'));
      legend.hidden = false;
      overlay.append(defs);
      const center = (id) => {
        const row = rows.get(id).getBoundingClientRect();
        return row.top - bounds.top + matrix.scrollTop + row.height / 2;
      };
      edges.forEach((record, index) => {
        const from = center(record.from), to = center(record.to), bend = 3 + index % 5 * 5;
        const description = [`${name(record.from)}${record.kind === 'uses_method' ? '.' : ''} ${labels[record.kind]} ${name(record.to)}`,
          record.state === 'proposed' ? 'Vorgeschlagen' : 'Dokumentiert', record.qualifier].filter(Boolean).join(' · ');
        const path = svg('path', { d: `M32 ${from} C${bend} ${from} ${bend} ${to} 32 ${to}`,
          class: `project-relation-edge${record.state === 'proposed' ? ' project-relation-proposed' : ''}`,
          'marker-end': `url(#${markerId}-${record.kind})`, 'data-relation': record.id, 'data-kind': record.kind,
          role: 'img', tabindex: '0', focusable: 'true', 'aria-label': description });
        const title = svg('title', {}); title.textContent = description; path.append(title);
        overlay.append(path);
      });
    }
    matrix.append(overlay);
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(draw) : null;
    observer?.observe(matrix);
    const table = matrix.querySelector('table');
    if (table) observer?.observe(table);
    window.addEventListener('resize', draw);
    const cleanup = () => {
      if (stopped) return;
      stopped = true;
      observer?.disconnect();
      window.removeEventListener('resize', draw);
      overlay.remove();
      legend.remove();
      matrix.classList.remove('project-relations-matrix');
      active.delete(host);
    };
    active.set(host, cleanup);
    draw();
    return cleanup;
  }

  return { update };
})();
