'use strict';

window.KNOWLEDGE_MAP = (() => {
  const types = { knowledge: 'Wissensdokument', concept: 'Begriff', literature: 'Literatur', research: 'Forschungsnotiz',
    'academic-writing': 'Manuskript', workshop: 'Workshop', course: 'Lehre', 'vault-organisation': 'Vault-Organisation',
    specification: 'Spezifikation', 'design-document': 'Design', 'use-case': 'Anwendungsfall', business: 'Geschäftswissen',
    contact: 'Kontakt', 'forschungsleitstelle-session': 'Forschungssitzung' };
  const maturity = { idea: 'Idee', draft: 'Entwurf', stub: 'Ansatz', complete: 'Ausgearbeitet', reviewed: 'Geprüft', released: 'Veröffentlicht' };
  const normalize = value => String(value).toLocaleLowerCase('de').replaceAll('ä', 'ae').replaceAll('ö', 'oe').replaceAll('ü', 'ue').replaceAll('ß', 'ss')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const safePath = path => typeof path === 'string' && /\.md$/i.test(path) && !/[\\:\x00]/.test(path)
    && path.split('/').every(part => part && !part.startsWith('.') && !/[. ]$/.test(part));
  const typeName = node => types[node.type] || node.type || 'Dokumentart nicht angegeben';
  const maturityName = node => maturity[node.status] || node.status || 'Nicht angegeben';

  function build(data) {
    if (data?.schema !== 'second-brain-knowledge-1' || !Array.isArray(data.nodes) || !Array.isArray(data.links)
      || !Array.isArray(data.unresolved) || !Array.isArray(data.warnings)) throw new Error('Ungültige Wissenskarte');
    const nodes = new Map();
    for (const node of data.nodes) {
      if (!safePath(node.path) || node.id !== node.path || nodes.has(node.id) || typeof node.title !== 'string'
        || typeof node.type !== 'string' || typeof node.status !== 'string' || typeof node.revision !== 'string'
        || typeof node.isHub !== 'boolean' || !Array.isArray(node.tags) || !Array.isArray(node.aliases)
        || ![...node.tags, ...node.aliases].every(item => typeof item === 'string')) throw new Error('Ungültiges Wissensdokument');
      nodes.set(node.id, { ...node, search: normalize([node.title, node.path, typeName(node), ...node.tags, ...node.aliases].join(' ')) });
    }
    const outgoing = new Map([...nodes.keys()].map(id => [id, []]));
    const incoming = new Map([...nodes.keys()].map(id => [id, []]));
    for (const edge of data.links) {
      if (!nodes.has(edge.from) || !nodes.has(edge.to) || typeof edge.quote !== 'string' || !edge.quote
        || typeof edge.anchor !== 'string' || !Number.isInteger(edge.line) || edge.line < 1) throw new Error('Ungültiger Dokumentverweis');
      outgoing.get(edge.from).push(edge); incoming.get(edge.to).push(edge);
    }
    for (const edge of data.unresolved) {
      if (!nodes.has(edge.from) || typeof edge.target !== 'string' || typeof edge.reason !== 'string'
        || !Number.isInteger(edge.line) || edge.line < 1) throw new Error('Ungültiger ungeklärter Verweis');
    }
    return { nodes, incoming, outgoing, root: nodes.has(data.root) ? data.root : '', unresolved: data.unresolved,
      warnings: data.warnings.filter(value => typeof value === 'string'), truncated: data.truncated === true };
  }
  function matches(node, query, type = '') {
    return (!type || (type === 'untyped' ? !node.type : node.type === type))
      && normalize(query).split(/\s+/).filter(Boolean).every(term => node.search.includes(term));
  }
  function neighbors(model, id, direction) {
    const edges = (direction === 'in' ? model.incoming : model.outgoing).get(id) || [];
    return [...new Set(edges.map(edge => direction === 'in' ? edge.from : edge.to))]
      .filter(target => target !== id).map(target => model.nodes.get(target));
  }
  function groups(model) {
    // HOME supplies navigation membership. No link is promoted to a broader/narrower assertion.
    const entries = neighbors(model, model.root, 'out');
    return (entries.length ? entries : [...model.nodes.values()]).filter(node => node.isHub && node.id !== model.root);
  }

  function network(model, id, options = {}) {
    const allowed = Array.isArray(options.allowedIds) ? new Set(options.allowedIds) : null;
    const accepts = target => model.nodes.has(target) && (!allowed || allowed.has(target));
    if (!accepts(id)) return { nodes: [], links: [], branches: [] };
    const expanded = new Set([id, ...(options.open || [])]);
    const seen = new Set([id]);
    const previous = new Map((options.positions || []).filter(position => position.item?.id !== id
      && accepts(position.item?.id) && Number.isInteger(position.column) && position.column > 0 && position.column < 3
      && Number.isInteger(position.row) && position.row >= 0).map(position => [position.item.id, position]));
    const rows = [1, 0, 0];
    for (const position of previous.values()) rows[position.column] = Math.max(rows[position.column], position.row + 1);
    const nodes = [{ item: model.nodes.get(id), column: 0, row: 0 }];
    const branches = [];
    // Columns record the exploration path, never a broader/narrower knowledge claim.
    for (const placed of nodes) {
      const children = [...new Set([...neighbors(model, placed.item.id, 'out'), ...neighbors(model, placed.item.id, 'in')].map(item => item.id))]
        .filter(accepts).sort((a, b) => a.localeCompare(b, 'de'));
      const requested = options.more?.[placed.item.id];
      const limit = Number.isSafeInteger(requested) && requested > 6 ? requested : 6;
      const opened = expanded.has(placed.item.id);
      branches.push({ id: placed.item.id, opened, total: children.length, limit });
      if (!opened) continue;
      for (const child of children.slice(0, limit)) {
        if (seen.has(child)) continue;
        seen.add(child);
        const column = previous.get(child)?.column || Math.min(placed.column + 1, 2);
        const row = previous.has(child) ? previous.get(child).row : rows[column]++;
        nodes.push({ item: model.nodes.get(child), column, row });
      }
    }
    const pairs = new Map();
    for (const { item } of nodes) {
      for (const edge of model.outgoing.get(item.id)) {
        if (!seen.has(edge.to)) continue;
        const key = JSON.stringify([edge.from, edge.to].sort());
        if (!pairs.has(key)) pairs.set(key, { key, from: edge.from, to: edge.to, edges: [] });
        const pair = pairs.get(key);
        if (!pair.edges.some(existing => existing.from === edge.from && existing.to === edge.to && existing.line === edge.line
          && existing.anchor === edge.anchor && existing.quote === edge.quote)) pair.edges.push(edge);
      }
    }
    return { nodes, links: [...pairs.values()], branches };
  }

  function create(host, model, actions) {
    let state = {};
    let selectedLink = '';
    let resizeObserver = null;
    let graphFrame = 0;
    let placements = [];
    let layoutScope = '';
    const titleCounts = new Map();
    for (const item of model.nodes.values()) titleCounts.set(item.title, (titleCounts.get(item.title) || 0) + 1);
    const svgNamespace = 'http://www.w3.org/2000/svg';
    const svgAvailable = typeof document.createElementNS === 'function'
      && typeof document.createElementNS(svgNamespace, 'svg').createSVGPoint === 'function';

    function node(tag, attributes = {}, ...children) {
      const element = document.createElement(tag);
      for (const [key, value] of Object.entries(attributes)) if (value !== undefined && value !== null) element.setAttribute(key, String(value));
      for (const child of children.flat()) if (child !== false && child !== null && child !== undefined) element.append(child instanceof Node ? child : document.createTextNode(String(child)));
      return element;
    }
    function svg(tag, attributes = {}, ...children) {
      const element = document.createElementNS(svgNamespace, tag);
      for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
      element.append(...children);
      return element;
    }
    function sourceLink(item, text = 'Originaltext öffnen', location = {}) {
      const parameters = Object.fromEntries(Object.entries(state).filter(([, value]) => typeof value === 'string'));
      return node('a', { href: '#' + new URLSearchParams({ ...parameters, path: item.id, anchor: location.anchor || '',
        ansicht: location.line ? 'original' : 'lesen', kartenrevision: item.revision, zeile: location.line ? String(location.line) : '' }),
        'data-source-path': item.id, 'data-source-revision': item.revision,
        'data-source-line': location.line, 'data-source-anchor': location.anchor, class: 'knowledge-read' }, text);
    }
    function documentButton(item, selected = false) {
      return node('button', { type: 'button', class: 'knowledge-node', 'data-knowledge-focus': item.id,
        'aria-label': item.title + ' · ' + item.path,
        'aria-current': selected ? 'true' : null, id: selected ? 'knowledge-focus-title' : null },
        node('span', { class: 'knowledge-node-name' }, item.title), node('span', { class: 'knowledge-type' }, typeName(item)),
        titleCounts.get(item.title) > 1 && node('span', { class: 'knowledge-meta' }, item.path));
    }
    function metadata(item) {
      return node('details', { class: 'knowledge-properties' }, node('summary', {}, 'Dokumentangaben'),
        node('dl', {}, node('dt', {}, 'Dokumentart'), node('dd', {}, typeName(item)),
          node('dt', {}, 'Dokumentreife'), node('dd', {}, maturityName(item)),
          node('dt', {}, 'Pfad'), node('dd', {}, item.path),
          item.tags.length > 0 && [node('dt', {}, 'Themen'), node('dd', {}, item.tags.join(', '))],
          item.aliases.length > 0 && [node('dt', {}, 'Weitere Namen'), node('dd', {}, item.aliases.join(', '))]));
    }
    function linkName(link) {
      const from = model.nodes.get(link.from), to = model.nodes.get(link.to);
      const reverse = link.edges.some(edge => edge.from === link.to && edge.to === link.from) && link.from !== link.to;
      return from.title + (reverse ? ' ↔ ' : ' → ') + to.title;
    }
    function evidence(link, focus = false) {
      const panel = host.querySelector('.knowledge-evidence');
      if (!panel) return;
      const title = node('h3', { tabindex: '-1' }, linkName(link));
      const close = node('button', { type: 'button', class: 'knowledge-close' }, 'Verweis schließen');
      close.addEventListener('click', () => {
        selectedLink = ''; panel.replaceChildren(); panel.hidden = true;
        const origin = [...host.querySelectorAll('[data-knowledge-link]')].find(element => element.dataset.knowledgeLink === link.key
          && element.getBoundingClientRect().width);
        origin?.focus({ preventScroll: true });
        for (const element of host.querySelectorAll('[data-knowledge-link]')) element.removeAttribute('aria-current');
      });
      panel.hidden = false;
      panel.replaceChildren(node('div', { class: 'knowledge-heading' }, title, close),
        ...link.edges.map(edge => {
          const from = model.nodes.get(edge.from), to = model.nodes.get(edge.to);
          return node('section', { class: 'knowledge-quotation' },
            node('p', { class: 'knowledge-evidence-route' }, from.title + ' → ' + to.title),
            node('blockquote', {}, edge.quote),
            node('p', { class: 'knowledge-meta' }, from.path + ' · Zeile ' + edge.line),
            sourceLink(from, 'Verweis im Original prüfen', { line: edge.line }),
            edge.anchor && sourceLink(to, 'Verlinkten Abschnitt öffnen', { anchor: edge.anchor }));
        }));
      for (const element of host.querySelectorAll('[data-knowledge-link]')) {
        if (element.dataset.knowledgeLink === link.key) element.setAttribute('aria-current', 'true');
        else element.removeAttribute('aria-current');
      }
      panel.onkeydown = event => { if (event.key === 'Escape') { event.preventDefault(); close.click(); } };
      if (focus) title.focus();
    }
    function graphEdges(graph, projection) {
      const layer = graph.querySelector('svg');
      if (!layer || !graph.getBoundingClientRect().width) return;
      const bounds = graph.getBoundingClientRect();
      const positions = new Map([...graph.querySelectorAll('[data-knowledge-position]')].map(element => {
        const box = element.getBoundingClientRect();
        return [element.dataset.knowledgePosition, { x: box.left - bounds.left, y: box.top - bounds.top, w: box.width, h: box.height }];
      }));
      layer.setAttribute('viewBox', '0 0 ' + bounds.width + ' ' + bounds.height);
      const arrow = svg('marker', { id: 'knowledge-arrow', markerWidth: '8', markerHeight: '8', refX: '7', refY: '4',
        orient: 'auto-start-reverse', markerUnits: 'userSpaceOnUse' }, svg('path', { d: 'M 0 0 L 8 4 L 0 8 z' }));
      layer.replaceChildren(svg('defs', {}, arrow));
      for (const link of projection.links) {
        const from = positions.get(link.from), to = positions.get(link.to);
        if (!from || !to) continue;
        let d;
        if (link.from === link.to) {
          const x = from.x + from.w / 2, y = from.y;
          d = 'M ' + (x - 18) + ' ' + y + ' C ' + (x - 34) + ' ' + (y - 26) + ' ' + (x + 34) + ' ' + (y - 26) + ' ' + (x + 18) + ' ' + y;
        } else if (Math.abs(from.x - to.x) < 1) {
          const side = from.x + from.w + 16;
          d = 'M ' + (from.x + from.w) + ' ' + (from.y + from.h / 2) + ' C ' + side + ' ' + (from.y + from.h / 2)
            + ' ' + side + ' ' + (to.y + to.h / 2) + ' ' + (to.x + to.w) + ' ' + (to.y + to.h / 2);
        } else {
          const forward = from.x < to.x;
          const startX = forward ? from.x + from.w : from.x, endX = forward ? to.x : to.x + to.w;
          const middle = (startX + endX) / 2;
          d = 'M ' + startX + ' ' + (from.y + from.h / 2) + ' C ' + middle + ' ' + (from.y + from.h / 2)
            + ' ' + middle + ' ' + (to.y + to.h / 2) + ' ' + endX + ' ' + (to.y + to.h / 2);
        }
        const reverse = link.from !== link.to && link.edges.some(edge => edge.from === link.to && edge.to === link.from);
        const path = svg('path', { d, class: 'knowledge-edge', 'marker-end': 'url(#knowledge-arrow)',
          ...(reverse ? { 'marker-start': 'url(#knowledge-arrow)' } : {}) });
        const control = svg('a', { href: '#knowledge-edge-evidence', 'data-knowledge-link': link.key,
          'aria-label': 'Verweis prüfen: ' + linkName(link), class: 'knowledge-edge-control',
          ...(selectedLink === link.key ? { 'aria-current': 'true' } : {}) },
          svg('title', {}, document.createTextNode(linkName(link))), svg('path', { d, class: 'knowledge-edge-hit' }), path);
        control.addEventListener('click', event => { event.preventDefault(); selectedLink = link.key; evidence(link, true); });
        layer.append(control);
      }
      graph.dataset.drawn = 'true';
    }
    function neighborhood(item, allowedIds) {
      const projection = network(model, item.id, { open: state.open, more: state.more, allowedIds, positions: placements });
      placements = projection.nodes;
      const graph = node('div', { class: 'knowledge-network', 'data-graph': svgAvailable ? 'true' : 'false' });
      const columns = [0, 1, 2].map(() => node('div', { class: 'knowledge-network-column' }));
      graph.append(...columns);
      const branches = new Map(projection.branches.map(branch => [branch.id, branch]));
      for (const placed of [...projection.nodes].sort((a, b) => a.column - b.column || a.row - b.row)) {
        const branch = branches.get(placed.item.id);
        const selected = placed.item.id === item.id;
        const label = documentButton(placed.item, selected);
        const controls = node('div', { class: 'knowledge-node-actions' });
        if (!selected && branch.total) {
          const expand = node('button', { type: 'button', class: 'knowledge-expand',
            'aria-expanded': branch.opened, 'aria-label': placed.item.title + (branch.opened ? ' einklappen' : ' aufklappen'),
            'data-knowledge-expand': placed.item.id }, branch.opened ? '−' : '+');
          controls.append(expand);
        }
        if (branch.opened && branch.total > branch.limit) {
          controls.append(node('button', { type: 'button', class: 'knowledge-more', 'data-knowledge-more': placed.item.id,
            'aria-label': 'Weitere Verbindungen von ' + placed.item.title }, 'Weitere'));
        }
        const cell = node('div', { class: 'knowledge-position', 'data-knowledge-position': placed.item.id,
          'data-knowledge-column': placed.column, 'data-knowledge-row': placed.row },
          node('div', { class: 'knowledge-node-wrap' }, label, controls));
        columns[placed.column].append(cell);
      }
      if (svgAvailable) graph.append(svg('svg', { class: 'knowledge-edges', 'aria-label': 'Gerichtete Dokumentverweise' }));
      const fallback = node('ul', { class: 'knowledge-link-list', role: 'list', 'aria-label': 'Dokumentverweise' },
        ...projection.links.map(link => {
          const control = node('button', { type: 'button', class: 'knowledge-link', 'data-knowledge-link': link.key }, linkName(link));
          control.addEventListener('click', () => { selectedLink = link.key; evidence(link, true); });
          return node('li', {}, control);
        }));
      const sourceActions = node('div', { class: 'knowledge-source-actions' }, sourceLink(item), metadata(item));
      const panel = node('section', { class: 'knowledge-evidence', id: 'knowledge-edge-evidence', hidden: '', 'aria-label': 'Verweisbeleg' });
      const content = node('div', { class: 'knowledge-workspace', 'data-graph': svgAvailable ? 'true' : 'false' },
        graph, fallback, !projection.links.length && node('p', { class: 'knowledge-empty' },
          Array.isArray(allowedIds) ? 'Keine Verweise zwischen den Dokumenten dieser Auswahl.' : 'Keine aufgelösten Dokumentverweise.'),
        sourceActions, panel);
      const unresolved = model.unresolved.filter(edge => edge.from === item.id);
      if (unresolved.length) content.append(node('details', { class: 'knowledge-unresolved' }, node('summary', {}, 'Ungeklärte Verweise'),
        ...unresolved.map(edge => node('p', { class: 'knowledge-warning' }, edge.target + ' · ' + edge.reason + ' · Zeile ' + edge.line))));
      if (svgAvailable) {
        const draw = () => {
          if (graphFrame) cancelAnimationFrame(graphFrame);
          graphFrame = requestAnimationFrame(() => { graphFrame = 0; if (graph.isConnected) graphEdges(graph, projection); });
        };
        if (typeof ResizeObserver === 'function') {
          resizeObserver = new ResizeObserver(draw);
          resizeObserver.observe(graph);
          for (const element of graph.querySelectorAll('.knowledge-position')) resizeObserver.observe(element);
        }
        draw();
      }
      return content;
    }
    function entries(allowedIds) {
      const items = Array.isArray(allowedIds) ? allowedIds.map(id => model.nodes.get(id)).filter(Boolean)
        : [...(model.nodes.has(model.root) ? [model.nodes.get(model.root)] : []), ...groups(model)];
      const unique = [...new Map(items.map(item => [item.id, item])).values()];
      const key = 'entries';
      const limit = Math.max(24, state.more?.[key] || 0);
      return node('div', { class: 'knowledge-entry-list' },
        node('ul', { class: 'knowledge-nodes', role: 'list' }, ...unique.slice(0, limit).map(item => node('li', {}, documentButton(item)))),
        !unique.length && node('p', { class: 'knowledge-empty' }, 'Keine Dokumente für diese Auswahl.'),
        unique.length > limit && node('button', { type: 'button', class: 'knowledge-more', 'data-knowledge-more': key }, 'Weitere Dokumente'));
    }
    function render(next) {
      resizeObserver?.disconnect(); resizeObserver = null;
      if (graphFrame) { cancelAnimationFrame(graphFrame); graphFrame = 0; }
      state = { ...next, open: Array.isArray(next.open) ? next.open : [], more: next.more || {} };
      const allowedIds = Array.isArray(state.allowedIds) ? state.allowedIds
        : state.suche || state.wissensform ? [...model.nodes.values()].filter(item => matches(item, state.suche, state.wissensform)).map(item => item.id) : undefined;
      const selected = model.nodes.get(state.knoten);
      const inScope = selected && (!allowedIds || allowedIds.includes(selected.id));
      const nextScope = JSON.stringify([state.knoten, allowedIds]);
      if (layoutScope !== nextScope) { placements = []; layoutScope = nextScope; }
      host.dataset.graph = svgAvailable ? 'true' : 'false';
      const heading = node('div', { class: 'knowledge-heading' }, node('h2', {}, selected ? 'Verbindungen' : 'Einstiege'));
      if (selected) heading.append(node('button', { type: 'button', 'data-knowledge-home': '' }, 'Zum Einstieg'));
      const messages = [...model.warnings, ...(model.truncated ? ['Die Verbindungen zeigen einen begrenzten Quellenbestand.'] : [])];
      if (state.knoten && !inScope) messages.push(selected ? 'Die ausgewählte Notiz liegt außerhalb der aktuellen Filter.'
        : 'Die ausgewählte Notiz ist nicht verfügbar.');
      host.replaceChildren(heading, ...messages.map(message => node('p', { class: 'knowledge-warning' }, message)),
        inScope ? neighborhood(selected, allowedIds) : entries(allowedIds));
      if (selectedLink && inScope) {
        const projection = network(model, selected.id, { open: state.open, more: state.more, allowedIds });
        const link = projection.links.find(value => value.key === selectedLink);
        if (link) evidence(link); else selectedLink = '';
      }
    }
    host.addEventListener('click', event => {
      const target = event.target.closest('[data-knowledge-focus], [data-knowledge-home], [data-knowledge-expand], [data-knowledge-more]');
      if (!target) return;
      if (target.hasAttribute('data-knowledge-home')) { selectedLink = ''; actions.home(); }
      else if (target.hasAttribute('data-knowledge-focus')) { selectedLink = ''; actions.select(target.dataset.knowledgeFocus); }
      else {
        const id = target.dataset.knowledgeExpand || target.dataset.knowledgeMore;
        if (target.hasAttribute('data-knowledge-expand')) {
          const opened = new Set(state.open);
          if (opened.has(id)) opened.delete(id); else opened.add(id);
          state.open = [...opened]; actions.expand(state.open);
        } else {
          const initial = id === 'entries' ? 24 : 6;
          state.more = { ...state.more, [id]: Math.max(initial, state.more[id] || 0) + initial }; actions.more(state.more);
        }
        const attribute = target.hasAttribute('data-knowledge-expand') ? 'data-knowledge-expand' : 'data-knowledge-more';
        render(state);
        const controls = [...host.querySelectorAll('[' + attribute + ']')];
        const origin = controls.find(element => element.getAttribute(attribute) === id)
          || [...host.querySelectorAll('[data-knowledge-focus]')].find(element => element.dataset.knowledgeFocus === id);
        origin?.focus({ preventScroll: true });
      }
    });
    return { render, focus: () => host.querySelector('#knowledge-focus-title')?.focus({ preventScroll: true }),
      types: [...new Set([...model.nodes.values()].map(item => item.type))].sort().map(value => ({ value: value || 'untyped', label: types[value] || value || 'Ohne Dokumentart' })) };
  }
  return { build, matches, neighbors, groups, typeName, maturityName, network, create };
})();
