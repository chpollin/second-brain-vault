'use strict';

// The public adapter exposes only a built template snapshot. No endpoint writes or runs an agent.
window.SECOND_BRAIN = (() => {
  const snapshot = window.PRUEFANSICHT || {};
  window.PRUEFANSICHT = snapshot;
  const loaded = fetch('demo-data.json', { cache: 'no-cache' }).then(async response => {
    if (!response.ok) throw new Error(`Demo-Daten nicht erreichbar (HTTP ${response.status}).`);
    const payload = await response.json();
    if (payload.schema !== 'second-brain-public-demo-1' || !Array.isArray(payload.sources)
      || !Array.isArray(payload.work?.eintraege)) throw new Error('Ungültige öffentliche Demo-Daten.');
    Object.assign(snapshot, payload.work);
    return payload;
  });
  const normalize = value => String(value).toLowerCase().replaceAll('ß', 'ss')
    .replaceAll('ä', 'ae').replaceAll('ö', 'oe').replaceAll('ü', 'ue').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  async function json(path) {
    const payload = await loaded;
    const url = new URL(path, 'https://demo.invalid');
    if (url.origin !== 'https://demo.invalid') throw new Error('Die Demo liest ausschließlich ihre Vorlage.');
    if (url.pathname === '/api/work') return snapshot;
    if (url.pathname === '/api/knowledge') return payload.knowledge;
    if (['/api/relations', '/api/progress'].includes(url.pathname)) return { records: [], warnings: [] };
    if (url.pathname === '/api/source') {
      const record = payload.sources.find(item => item.path === url.searchParams.get('path'));
      if (!record) throw new Error('HTTP 404 · Quelle nicht im veröffentlichten Template.');
      return record;
    }
    if (['/api/catalog', '/api/search'].includes(url.pathname)) {
      const query = url.searchParams.get('q') || '';
      const terms = normalize(query).split(/\s+/).filter(Boolean);
      const mode = url.searchParams.get('mode') === 'headings' ? 'headings' : 'fulltext';
      const project = snapshot.eintraege.find(item => item.id === url.searchParams.get('project'));
      const folder = project?.notizPfad.split('/').slice(0, -1).join('/') || '';
      const offset = Math.max(0, Number.parseInt(url.searchParams.get('offset') || '0', 10) || 0);
      const matches = payload.sources.filter(item => (!project || item.path === project.notizPfad || (folder && item.path.startsWith(`${folder}/`)))
        && terms.every(term => normalize([item.path, ...item.headings, mode === 'fulltext' ? item.text : ''].join('\n')).includes(term)));
      return { query, project: project?.id || '', mode, scope: project ? folder || project.notizPfad : null,
        results: matches.slice(offset, offset + 30).map(item => ({ path: item.path, title: item.title,
          headings: item.headings.slice(0, 12), sourceUrl: item.sourceUrl, revision: item.revision, excerpt: null })),
        nextOffset: offset + 30 < matches.length ? offset + 30 : null, truncated: false, warnings: [] };
    }
    throw new Error('Diese Aktion steht in der öffentlichen Demo nicht zur Verfügung.');
  }

  function status() {
    const header = document.querySelector('header');
    let target = document.getElementById('stand');
    if (!target && header) {
      target = document.createElement('p'); target.id = 'stand'; target.className = 'kopf-stand'; header.append(target);
    }
    if (target) {
      target.textContent = 'Demo · öffentliche Vorlage';
      target.title = 'Synthetische Vorlageninhalte. Antworten bleiben in diesem Browser und können exportiert werden.';
    }
  }
  function failure(error) {
    const header = document.querySelector('header');
    if (!header) return;
    const notice = document.createElement('p'); notice.id = 'runtime-status'; notice.className = 'stoerung';
    notice.setAttribute('role', 'alert');
    const message = document.createElement('span');
    message.textContent = 'Die Demo-Daten konnten nicht geladen werden. ' + error.message + ' ';
    const retry = document.createElement('button'); retry.type = 'button'; retry.className = 'knopf';
    retry.textContent = 'Erneut laden'; retry.addEventListener('click', () => location.reload());
    notice.append(message, retry); header.after(notice);
  }
  const ready = loaded.then(() => { status(); return snapshot; }).catch(error => {
    status(); failure(error); return snapshot;
  });
  return { ready, json, status, valid: data => Boolean(data?.sourceRevision && Array.isArray(data.eintraege)),
    progress: [], progressWarnings: [], relations: [], relationWarnings: [], isLive: () => false };
})();
