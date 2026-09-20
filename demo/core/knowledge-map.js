'use strict';

window.KNOWLEDGE_MAP = (() => {
  const types = { knowledge: 'Wissensdokument', concept: 'Begriff', literature: 'Literatur', research: 'Forschungsnotiz',
    'academic-writing': 'Manuskript', workshop: 'Workshop', course: 'Lehre', 'vault-organisation': 'Vault-Organisation',
    specification: 'Spezifikation', 'design-document': 'Design', 'use-case': 'Anwendungsfall', business: 'Geschäftswissen',
    contact: 'Kontakt', 'forschungsleitstelle-session': 'Forschungssitzung' };
  const maturity = { idea: 'Idee', draft: 'Entwurf', stub: 'Ansatz', complete: 'Ausgearbeitet', reviewed: 'Geprüft', released: 'Veröffentlicht' };
  const normalize = value => String(value).toLocaleLowerCase('de').replaceAll('ä', 'ae').replaceAll('ö', 'oe').replaceAll('ü', 'ue')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const safePath = path => typeof path === 'string' && /\.md$/i.test(path) && !/[\\:\x00]/.test(path)
    && path.split('/').every(part => part && !part.startsWith('.') && !/[. ]$/.test(part));
  const typeName = node => types[node.type] || node.type || 'Dokumentart nicht angegeben';

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

  function create(host, model, actions) {
    let state = {};
    function node(tag, attributes = {}, ...children) {
      const element = document.createElement(tag);
      for (const [key, value] of Object.entries(attributes)) if (value !== undefined && value !== null) element.setAttribute(key, String(value));
      for (const child of children.flat()) if (child !== false && child !== null && child !== undefined) element.append(child instanceof Node ? child : document.createTextNode(String(child)));
      return element;
    }
    function button(item, extra = {}) {
      return node('button', { type: 'button', class: 'knowledge-node', 'data-knowledge-focus': item.id, ...extra },
        node('span', { class: 'knowledge-node-name' }, item.title), node('span', { class: 'knowledge-type' }, typeName(item)));
    }
    function list(items, key = '', initial = 18) {
      let limit = Math.max(initial, Number(state.more?.[key]) || 0);
      const result = node('ul', { class: 'knowledge-nodes', role: 'list' }, ...items.slice(0, limit).map(item => node('li', {}, button(item))));
      if (items.length > limit) {
        const more = node('button', { type: 'button', class: 'knowledge-more' }, 'Weitere Verweise zeigen');
        more.addEventListener('click', () => {
          const next = items.slice(limit, limit + 18);
          result.append(...next.map(item => node('li', {}, button(item)))); limit += next.length;
          state.more = { ...state.more, [key]: limit }; actions.more(state.more);
          if (limit >= items.length) { more.remove(); result.lastElementChild?.querySelector('button')?.focus(); }
        });
        return node('div', {}, result, more);
      }
      return result;
    }
    function readButton(item, text = 'Originaltext öffnen') {
      return node('a', { href: `#${new URLSearchParams({ ...state, path: item.id, anchor: '', ansicht: 'lesen', kartenrevision: item.revision, zeile: '' })}`,
        'data-source-path': item.id, 'data-source-revision': item.revision, class: 'knowledge-read' }, text);
    }
    function overview() {
      const region = node('section', { class: 'knowledge-regions', 'aria-label': 'Themenkarten aus dem Vault' });
      for (const hub of groups(model)) {
        const opened = state.open.includes(hub.id);
        const content = node('div', { class: 'knowledge-region-content' });
        const detail = node('details', { class: 'knowledge-region', 'data-knowledge-hub': hub.id },
          node('summary', {}, hub.title), content);
        detail.open = opened;
        function fill() {
          if (!detail.open || content.childElementCount) return;
          const children = neighbors(model, hub.id, 'out');
          content.append(readButton(hub, 'Themenkarte lesen'), children.length ? list(children, hub.id)
            : node('p', { class: 'knowledge-empty' }, 'Keine aufgelösten Dokumentverweise.'));
        }
        fill();
        detail.addEventListener('toggle', () => {
          if (!detail.isConnected || detail.open === state.open.includes(hub.id)) return;
          const next = new Set(state.open);
          if (detail.open) next.add(hub.id); else next.delete(hub.id);
          state.open = [...next]; fill(); actions.expand(state.open);
        });
        region.append(detail);
      }
      if (!region.childElementCount) region.append(node('p', { class: 'knowledge-empty' }, 'Keine Themenkarten vorhanden.'));
      const direct = neighbors(model, model.root, 'out').filter(item => !item.isHub);
      return [region, direct.length && node('section', { class: 'knowledge-direct' }, node('h2', {}, 'Weitere Einstiege aus HOME'), list(direct, 'home-direct'))];
    }
    function evidence(item) {
      const edges = [...model.outgoing.get(item.id), ...model.incoming.get(item.id)];
      const unique = [...new Map(edges.map(edge => [JSON.stringify(edge), edge])).values()];
      const section = node('details', { class: 'knowledge-evidence' }, node('summary', {}, 'Verweisstellen prüfen'));
      function entry(edge) {
        const from = model.nodes.get(edge.from), to = model.nodes.get(edge.to);
        const row = node('section', {}, node('h3', {}, `${from.title} → ${to.title}`),
          node('blockquote', {}, edge.quote),
          node('p', { class: 'knowledge-meta' }, `${from.path} · Zeile ${edge.line}`),
          node('a', { href: `#${new URLSearchParams({ ...state, path: from.path, anchor: '', ansicht: 'original', zeile: String(edge.line), kartenrevision: from.revision })}`,
            'data-source-path': from.path, 'data-source-line': edge.line, 'data-source-revision': from.revision, class: 'knowledge-read' }, 'Verweis im Original prüfen'),
          edge.anchor && node('a', { href: `#${new URLSearchParams({ ...state, path: to.path, anchor: edge.anchor, ansicht: 'lesen', zeile: '', kartenrevision: to.revision })}`,
            'data-source-path': to.path, 'data-source-anchor': edge.anchor, 'data-source-revision': to.revision, class: 'knowledge-read' }, 'Verlinkten Abschnitt öffnen'));
        return row;
      }
      let limit = 6;
      section.append(...unique.slice(0, limit).map(entry));
      if (unique.length > limit) {
        const more = node('button', { type: 'button', class: 'knowledge-more' }, 'Weitere Verweisstellen zeigen');
        more.addEventListener('click', () => {
          const next = unique.slice(limit, limit + 6);
          more.before(...next.map(entry)); limit += next.length;
          if (limit >= unique.length) { const last = more.previousElementSibling; more.remove(); last?.querySelector('a')?.focus(); }
        });
        section.append(more);
      }
      for (const unresolved of model.unresolved.filter(edge => edge.from === item.id)) {
        section.append(node('p', { class: 'knowledge-warning' }, `${unresolved.target} · ${unresolved.reason} · Zeile ${unresolved.line}`));
      }
      return section.childElementCount > 1 && section;
    }
    function focus(item) {
      const incoming = neighbors(model, item.id, 'in'), outgoing = neighbors(model, item.id, 'out');
      const center = node('section', { class: 'knowledge-center' }, node('h2', { tabindex: '-1', id: 'knowledge-focus-title' }, item.title),
        node('dl', { class: 'knowledge-properties' }, node('dt', {}, 'Dokumentart'), node('dd', {}, typeName(item)),
          node('dt', {}, 'Dokumentreife'), node('dd', {}, maturity[item.status] || item.status || 'Nicht angegeben')),
        item.tags.length > 0 && node('ul', { class: 'knowledge-tags', role: 'list' }, ...item.tags.map(tag => node('li', {}, tag))),
        item.aliases.length > 0 && node('p', { class: 'knowledge-meta' }, `Auch benannt als ${item.aliases.join(', ')}`),
        node('p', { class: 'knowledge-path' }, item.path), readButton(item));
      return [node('div', { class: 'knowledge-neighborhood' },
        node('section', { class: 'knowledge-neighbors knowledge-incoming' }, node('h3', {}, 'Verweise auf diese Notiz'),
          incoming.length ? list(incoming, `${item.id}/in`, 6) : node('p', { class: 'knowledge-empty' }, 'Keine eingehenden Verweise erfasst.')),
        center,
        node('section', { class: 'knowledge-neighbors knowledge-outgoing' }, node('h3', {}, 'Diese Notiz verweist auf'),
          outgoing.length ? list(outgoing, `${item.id}/out`, 6) : node('p', { class: 'knowledge-empty' }, 'Keine ausgehenden Verweise erfasst.'))), evidence(item)];
    }
    function render(next) {
      state = { ...next, open: next.open || [] };
      const selected = model.nodes.get(state.knoten);
      const searching = Boolean(state.suche || state.wissensform);
      const title = searching ? 'Gefundene Dokumente' : selected ? 'Verbindungen' : 'Themenkarten';
      const heading = node('div', { class: 'knowledge-heading' }, node('h2', {}, title));
      if (selected || searching) heading.append(node('button', { type: 'button', 'data-knowledge-home': '' }, 'Themenkarten'));
      const messages = [...model.warnings, ...(model.truncated ? ['Die Wissenskarte zeigt einen begrenzten Quellenbestand.'] : [])];
      const content = searching ? (() => {
        const hits = [...model.nodes.values()].filter(item => matches(item, state.suche, state.wissensform));
        return [node('p', { class: 'knowledge-meta', role: 'status' }, `${hits.length} Treffer`), list(hits, `search/${state.suche}/${state.wissensform}`, 36)];
      })() : selected ? focus(selected) : overview();
      host.replaceChildren(heading, ...messages.map(message => node('p', { class: 'knowledge-warning' }, message)), ...content.filter(Boolean));
      if (state.knoten && !selected) host.append(node('p', { class: 'knowledge-warning' }, 'Die ausgewählte Notiz ist in dieser Wissenskarte nicht verfügbar.'));
    }
    host.addEventListener('click', event => {
      const target = event.target.closest('[data-knowledge-focus], [data-knowledge-home]');
      if (!target) return;
      if (target.hasAttribute('data-knowledge-home')) actions.home();
      else actions.select(target.dataset.knowledgeFocus);
    });
    return { render, focus: () => host.querySelector('#knowledge-focus-title')?.focus({ preventScroll: true }),
      types: [...new Set([...model.nodes.values()].map(item => item.type))].sort().map(value => ({ value: value || 'untyped', label: types[value] || value || 'Ohne Dokumentart' })) };
  }
  return { build, matches, neighbors, groups, typeName, create };
})();
