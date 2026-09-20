'use strict';

// Source text is rendered as text nodes. Markdown HTML is never executable.
window.VAULT_SOURCES = (() => {
  function validRecord(record) {
    return Boolean(record && typeof record.path === 'string' && /\.md$/i.test(record.path)
      && typeof record.title === 'string' && typeof record.text === 'string' && typeof record.revision === 'string');
  }
  function blocks(text) {
    const lines = text.split('\n');
    let offset = 0;
    const offsets = lines.map(line => { const start = offset; offset += line.length + 1; return start; });
    const output = [];
    let index = lines[0]?.replace(/\r$/, '') === '---' ? lines.findIndex((line, i) => i > 0 && line.replace(/\r$/, '') === '---') + 1 : 0;
    let fenced = false;
    for (; index < lines.length; index++) {
      const line = lines[index].replace(/\r$/, '');
      if (/^```/.test(line)) { fenced = !fenced; continue; }
      if (!line.trim()) continue;
      if (!fenced && /^\^[\w-]+$/.test(line.trim()) && output.length) {
        output[output.length - 1].anchor = line.trim().slice(1);
        continue;
      }
      const heading = !fenced && line.match(/^(#{1,6})\s+(.+)/);
      const content = heading ? heading[2] : fenced ? line : line.replace(/^\s*[-*]\s/, '');
      output.push({ ...(heading ? { kind: 'heading', level: Math.min(4, heading[1].length + 1) }
        : { kind: fenced ? 'code' : /^\s*[-*]\s/.test(line) ? 'item' : 'text' }), text: content, start: offsets[index] + line.indexOf(content) });
    }
    return output;
  }
  function catalogRequest(state, offset = 0) {
    return `/api/catalog?${new URLSearchParams({ q: state.suche || '', project: state.projekt || '',
      mode: state.mode === 'headings' ? 'headings' : 'fulltext', offset: String(offset) })}`;
  }
  function selectedRange(record, range, body) {
    const blockFor = node => (node.nodeType === 3 ? node.parentElement : node).closest('[data-source-start]');
    const startBlock = blockFor(range.startContainer), endBlock = blockFor(range.endContainer);
    if (!startBlock || startBlock !== endBlock || !body.contains(startBlock)) throw new Error('Für eine Auswahl über mehrere Absätze bitte den Markdown-Quelltext öffnen.');
    const prefix = range.cloneRange(); prefix.selectNodeContents(startBlock); prefix.setEnd(range.startContainer, range.startOffset);
    const start = Number(startBlock.dataset.sourceStart) + prefix.toString().length;
    const text = range.toString();
    const end = start + text.length;
    if (!text.trim() || record.text.slice(start, end) !== text) throw new Error('Bitte eine genaue Passage im Originaltext markieren.');
    return { start, end };
  }
  async function start() {
    let searchSerial = 0;
    let documentSerial = 0;
    let current = null;
    let selection = null;
    let adding = false;
    let results = [];
    let nextOffset = null;
    let state = {};
    let mapController = null;
    let mapRequest = null;
    let mapSerial = 0;
    let mapUnavailable = false;
    let sourceReturn = null;
    let restoreSerial = 0;
    const error = $('source-error');
    const status = $('source-status');
    function fail(message) { error.textContent = message; error.hidden = false; }
    function save(push = false) {
      const hash = new URLSearchParams(state).toString();
      if (push && location.hash !== `#${hash}`) history.pushState(null, '', `#${hash}`);
      window.ARBEITSKONTEXT.schreibe('quellen', state);
    }
    function renderSource() {
      if (!current) return;
      const raw = state.ansicht === 'original';
      const changed = Boolean(state.kartenrevision && state.kartenrevision !== current.revision);
      const sourceUrl = typeof current.sourceUrl === 'string' && current.sourceUrl.startsWith('https://github.com/chpollin/second-brain-vault/blob/') ? current.sourceUrl : null;
      const actions = el('div', { class: 'source-actions' },
        sourceUrl && el('a', { href: sourceUrl }, 'Quelldatei auf GitHub'),
        el('a', { href: `#${new URLSearchParams({ ...state, ansicht: raw ? 'lesen' : 'original' })}`, 'data-source-view': raw ? 'lesen' : 'original' }, raw ? 'Lesefassung' : 'Markdown-Quelltext'),
        el('a', { href: `#${new URLSearchParams({ ...state, path: '', anchor: '' })}`, 'data-source-close': '' }, state.darstellung === 'map' ? 'Zur Wissenskarte' : 'Zur Dokumentübersicht'));
      const review = el('button', { type: 'button', class: 'knopf', id: 'source-review-add', disabled: true }, 'Passage prüfen');
      const selectionStatus = el('small', { id: 'source-selection-status', role: 'status' });
      if (window.crypto?.subtle && window.getSelection) actions.append(review, selectionStatus);
      review.addEventListener('click', async () => {
        if (!selection || adding) return;
        const captured = { record: current, ...selection };
        adding = true;
        review.disabled = true;
        try {
          await window.SOURCE_REVIEW.add(captured.record, captured.start, captured.end);
          location.href = 'review.html';
        } catch (problem) { fail(problem.message); review.disabled = false; }
        finally { adding = false; }
      });
      selection = null;
      const body = el(raw ? 'pre' : 'div', { class: raw ? 'source-raw' : 'source-body', id: 'source-body', 'data-source-start': raw ? '0' : null });
      if (raw) {
        const line = Number(state.zeile);
        if (!changed && Number.isInteger(line) && line > 0 && line <= current.text.split('\n').length) {
          const lines = current.text.split('\n');
          const start = lines.slice(0, line - 1).join('\n').length + (line > 1 ? 1 : 0);
          body.append(document.createTextNode(current.text.slice(0, start)), el('mark', { class: 'source-target' }, lines[line - 1]),
            document.createTextNode(current.text.slice(start + lines[line - 1].length)));
        } else body.textContent = current.text;
      }
      else {
        let list = null;
        for (const block of blocks(current.text)) {
          if (block.kind === 'heading' && block.level === 2 && block.text === current.title) continue;
          const anchor = block.anchor || block.text.match(/\^([\w-]+)\s*$/)?.[1] || (block.kind === 'heading' ? block.text : '');
          const content = block.text.replace(/\s*\^[\w-]+\s*$/, '');
          if (block.kind === 'item') {
            if (!list) { list = el('ul'); body.append(list); }
            list.append(el('li', { 'data-anchor': anchor || null, 'data-source-start': block.start }, content));
          } else {
            list = null;
            body.append(el(block.kind === 'heading' ? `h${block.level}` : block.kind === 'code' ? 'pre' : 'p', { 'data-anchor': anchor || null, 'data-source-start': block.start }, content));
          }
        }
      }
      $('source-content').replaceChildren(el('h2', { id: 'source-title', 'data-anchor': current.title }, current.title),
        el('p', { class: 'source-meta', title: `Quellenrevision ${current.revision}` }, current.path), actions,
        ...(changed ? [el('p', { class: 'stoerung', role: 'status' }, 'Die Quelle hat sich seit dem Laden der Wissenskarte geändert. Die frühere Verweisstelle muss erneut geprüft werden.')] : []), body);
      for (const link of $('source-results').querySelectorAll('[data-source-path]')) {
        if (link.dataset.sourcePath === current.path) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
      }
      if (state.anchor && !changed && !raw) {
        const fragment = [...$('source-content').querySelectorAll('[data-anchor]')].find((node) => node.dataset.anchor.toLocaleLowerCase('de') === state.anchor.replace(/^\^/, '').toLocaleLowerCase('de'));
        if (fragment) { fragment.classList.add('source-target'); fragment.scrollIntoView({ block: 'center' }); }
        else $('source-content').append(el('p', { class: 'stoerung' }, 'Der verlinkte Abschnitt ist im aktuellen Dokument nicht auflösbar.'));
      }
    }
    async function read(path, focus = false) {
      const serial = ++documentSerial;
      selection = null; current = null;
      window.getSelection?.()?.removeAllRanges();
      const reviewButton = $('source-review-add');
      if (reviewButton) reviewButton.disabled = true;
      error.hidden = true;
      $('source-content').hidden = false;
      document.querySelector('.sources').dataset.reading = 'true';
      $('source-content').setAttribute('aria-busy', 'true');
      try {
        const record = await window.SECOND_BRAIN.json(`/api/source?path=${encodeURIComponent(path)}`);
        if (serial !== documentSerial) return;
        if (!validRecord(record) || record.path !== path) throw new Error('Ungültige Quelle');
        current = record; renderSource();
        document.querySelector('.sources').dataset.reading = 'true';
        if (focus) $('source-content').focus();
      } catch {
        if (serial !== documentSerial) return;
        current = null;
        $('source-content').replaceChildren(el('h2', { id: 'source-title' }, 'Dokument nicht verfügbar'),
          el('a', { href: '#', 'data-source-close': '' }, 'Zur Übersicht'));
        fail('Die Quelle konnte nicht gelesen werden. Prüfe den Dateipfad oder suche das Dokument erneut.');
      } finally { if (serial === documentSerial) $('source-content').removeAttribute('aria-busy'); }
    }
    function clearSource() {
      documentSerial++; current = null; selection = null;
      window.getSelection?.()?.removeAllRanges();
      $('source-content').hidden = true;
      document.querySelector('.sources').dataset.reading = 'false';
      $('source-content').removeAttribute('aria-busy');
      $('source-content').replaceChildren(el('h2', { id: 'source-title' }, 'Dokument auswählen'));
    }
    function renderResults() {
      $('source-results').replaceChildren(el('ul', { class: 'source-results', role: 'list' }, ...results.map((item) => el('li', {},
        el('a', { class: 'source-hit', href: `#${new URLSearchParams({ ...state, path: item.path, anchor: '' })}`,
          'data-source-path': item.path, 'aria-current': current?.path === item.path ? 'page' : null },
        el('span', {}, item.title), el('small', {}, item.path),
        item.excerpt?.text && el('span', { class: 'source-excerpt' }, item.excerpt.text))))));
      if (!results.length) $('source-results').append(el('p', {}, 'Keine Dokumente für diese Auswahl.'));
      $('source-more').hidden = nextOffset === null;
    }
    async function search(offset = 0) {
      const serial = ++searchSerial;
      if (offset === 0) {
        results = []; nextOffset = null;
        $('source-results').replaceChildren(); $('source-more').hidden = true;
      }
      status.textContent = 'Dokumente werden geladen'; error.hidden = true;
      $('source-results').setAttribute('aria-busy', 'true');
      $('source-more').disabled = true;
      try {
        const data = await window.SECOND_BRAIN.json(catalogRequest(state, offset));
        if (serial !== searchSerial) return;
        if (!Array.isArray(data.results) || !data.results.every(item => typeof item.path === 'string' && typeof item.title === 'string')
          || !(data.nextOffset === null || Number.isInteger(data.nextOffset) && data.nextOffset > offset)) throw new Error('Ungültige Dokumentliste');
        results = offset ? [...results, ...data.results] : data.results;
        nextOffset = data.nextOffset;
        renderResults();
        const scoped = Boolean(state.suche || state.projekt);
        status.textContent = [scoped ? `${results.length} ${nextOffset === null ? 'Treffer' : 'Treffer angezeigt'}` : '',
          data.scope ? `Ordner ${data.scope}` : '', data.truncated ? 'Auswahl begrenzt, Filter enger fassen' : ''].filter(Boolean).join(' · ');
        if (data.warnings?.length) fail(data.warnings.join(' '));
      } catch {
        if (serial !== searchSerial) return;
        $('source-results').replaceChildren(); status.textContent = '';
        nextOffset = null; $('source-more').hidden = true;
        fail('Die Dokumentübersicht konnte nicht geladen werden. Prüfe den lokalen Dienst oder setze die Filter zurück.');
      } finally {
        if (serial === searchSerial) { $('source-results').removeAttribute('aria-busy'); $('source-more').disabled = false; }
      }
    }
    function mapState() {
      let open = [], more = {};
      try {
        const parsed = JSON.parse(state.offen);
        if (Array.isArray(parsed)) open = parsed.filter(value => typeof value === 'string');
      } catch { /* Invalid navigation state does not change source data. */ }
      try {
        const parsed = JSON.parse(state.mehr);
        if (parsed && !Array.isArray(parsed) && typeof parsed === 'object') {
          more = Object.fromEntries(Object.entries(parsed).filter(([, value]) => Number.isSafeInteger(value) && value > 0));
        }
      } catch { /* Invalid expansion state falls back to the initial list. */ }
      return { ...state, open, more };
    }
    function controls() {
      const map = state.darstellung === 'map';
      $('source-view').value = state.darstellung;
      $('source-type-control').hidden = !map;
      $('source-project-control').hidden = map;
      $('source-mode-control').hidden = map;
      $('source-query').placeholder = map ? 'Titel, Thema oder Begriff' : '';
      $('source-type').value = state.wissensform;
      $('source-reset').hidden = !(state.suche || state.wissensform || (!map && state.projekt));
      document.querySelector('.sources').dataset.view = state.darstellung;
    }
    async function showOverview(focusMap = false) {
      controls();
      const map = state.darstellung === 'map';
      $('knowledge-map').hidden = !map;
      document.querySelector('.source-overview').hidden = map;
      const serial = ++mapSerial;
      if (!map) { search(); return; }
      searchSerial++; status.textContent = '';
      if (mapController) { mapController.render(mapState()); if (focusMap) mapController.focus(); return; }
      $('knowledge-map').setAttribute('aria-busy', 'true');
      $('knowledge-map').textContent = 'Wissenskarte wird geladen';
      try {
        mapRequest ||= window.SECOND_BRAIN.json('/api/knowledge').then(window.KNOWLEDGE_MAP.build);
        const model = await mapRequest;
        if (serial !== mapSerial) return;
        mapController = window.KNOWLEDGE_MAP.create($('knowledge-map'), model, {
          expand: open => { state.offen = JSON.stringify(open); save(); },
          more: more => { state.mehr = JSON.stringify(more); save(); },
          home: () => {
            state.knoten = ''; state.suche = ''; state.wissensform = ''; state.rueckfokus = '';
            state.einstieg = 'themen'; state.kartenrevision = ''; state.zeile = '';
            $('source-query').value = ''; clearSource(); state.path = ''; state.anchor = '';
            save(true); showOverview(); $('source-query').focus();
          },
          select: id => {
            state.rueckfokus = id; save();
            state.einstieg = 'notiz'; state.kartenrevision = ''; state.zeile = '';
            state.knoten = id; state.suche = ''; state.wissensform = ''; state.path = ''; state.anchor = '';
            $('source-query').value = ''; clearSource(); save(true); showOverview(true);
          }
        });
        $('source-type').replaceChildren(el('option', { value: '' }, 'Alle Dokumentarten'),
          ...mapController.types.map(type => el('option', { value: type.value }, type.label)));
        controls(); mapController.render(mapState()); if (focusMap) mapController.focus();
      } catch {
        if (serial !== mapSerial) return;
        mapUnavailable = true; state.darstellung = 'list';
        $('source-view').querySelector('option[value="map"]').remove();
        $('source-view').closest('label').hidden = true;
        save(); await showOverview();
        fail('Die Wissenskarte ist nicht verfügbar. Die Dokumentliste bleibt nutzbar.');
      } finally { if (serial === mapSerial) $('knowledge-map').removeAttribute('aria-busy'); }
    }
    function restore() {
      const serial = ++restoreSerial;
      // History URLs are complete states; absent keys must not revive a later document.
      const saved = location.hash.length > 1 ? Object.fromEntries(new URLSearchParams(location.hash.slice(1))) : window.ARBEITSKONTEXT.lese('quellen');
      state = { projekt: saved.projekt || '', suche: saved.suche || '', path: saved.path || '', anchor: saved.anchor || '',
        bezug: saved.projekt || saved.bezug || '',
        mode: saved.mode === 'headings' ? 'headings' : 'fulltext', ansicht: saved.ansicht === 'original' ? 'original' : 'lesen',
        darstellung: mapUnavailable || saved.darstellung === 'list' ? 'list' : 'map',
        knoten: saved.knoten || '', offen: saved.offen || '[]', mehr: saved.mehr || '{}', wissensform: saved.wissensform || '',
        rueckfokus: saved.rueckfokus || '', kartenrevision: saved.kartenrevision || '', zeile: saved.zeile || '',
        einstieg: saved.einstieg === 'themen' ? 'themen' : 'notiz' };
      $('source-query').value = state.suche;
      const project = (window.PRUEFANSICHT?.eintraege || []).find(entry => entry.id === state.bezug && entry.notizPfad);
      const scopes = [{ id: '', name: 'Alle Dokumente' }];
      if (state.bezug) scopes.push({ id: state.bezug, name: project?.name || 'Projekt nicht verfügbar' });
      $('source-project').replaceChildren(...scopes.map(scope => el('option', { value: scope.id }, scope.name)));
      $('source-project').value = state.projekt; $('source-mode').value = state.mode;
      if (!('knoten' in saved) && project && state.darstellung === 'map' && state.einstieg !== 'themen') state.knoten = project.notizPfad;
      showOverview().then(() => {
        if (serial === restoreSerial && !state.path && state.rueckfokus) $('knowledge-map').querySelector(`[data-knowledge-focus="${CSS.escape(state.rueckfokus)}"]`)?.focus({ preventScroll: true });
      });
      if (state.path) read(state.path);
      else clearSource();
      window.ARBEITSKONTEXT.links(state.projekt);
    }
    function applyFilters() {
      state.suche = $('source-query').value.trim(); state.projekt = $('source-project').value;
      state.mode = $('source-mode').value; state.wissensform = $('source-type').value;
      state.path = ''; state.anchor = ''; state.kartenrevision = ''; state.zeile = '';
      clearSource(); save(true); showOverview();
    }
    $('source-search').addEventListener('submit', (event) => { event.preventDefault(); applyFilters(); });
    $('source-project').addEventListener('change', applyFilters);
    $('source-mode').addEventListener('change', applyFilters);
    $('source-type').addEventListener('change', applyFilters);
    $('source-view').addEventListener('change', () => {
      state.darstellung = $('source-view').value; state.wissensform = ''; state.path = ''; state.anchor = '';
      state.kartenrevision = ''; state.zeile = ''; clearSource(); save(true); showOverview();
    });
    $('source-reset').addEventListener('click', () => {
      $('source-query').value = '';
      $('source-project').value = ''; $('source-type').value = '';
      $('source-mode').value = 'fulltext'; applyFilters();
    });
    $('source-more').addEventListener('click', () => { if (nextOffset !== null) search(nextOffset); });
    document.addEventListener('click', (event) => {
      const target = event.target.closest('[data-source-path], [data-source-view], [data-source-close]');
      if (!target || event.ctrlKey || event.metaKey || event.shiftKey || event.button > 0) return;
      event.preventDefault();
      if ('sourceClose' in target.dataset) {
        state.path = ''; state.anchor = ''; state.kartenrevision = ''; state.zeile = '';
        clearSource(); save(true);
        if (state.darstellung === 'map') {
          if (sourceReturn?.isConnected) sourceReturn.focus({ preventScroll: true });
          else if (state.knoten) mapController?.focus();
          else $('source-query').focus();
        } else { renderResults(); $('source-query').focus(); }
      } else if (target.dataset.sourcePath) {
        sourceReturn = target;
        state.path = target.dataset.sourcePath; state.anchor = target.dataset.sourceAnchor || '';
        state.kartenrevision = target.dataset.sourceRevision || ''; state.zeile = target.dataset.sourceLine || '';
        state.ansicht = state.zeile ? 'original' : 'lesen';
        save(true); read(state.path, true);
      }
      else {
        state.ansicht = target.dataset.sourceView; save(true); renderSource();
        $('source-content').querySelector('[data-source-view]')?.focus({ preventScroll: true });
      }
    });
    $('source-content').addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); $('source-content').querySelector('[data-source-close]')?.click(); }
    });
    document.addEventListener('selectionchange', () => {
      const button = $('source-review-add');
      const body = $('source-body');
      if (!button || !body || !current) return;
      const selected = window.getSelection();
      const hint = $('source-selection-status');
      if (!selected?.rangeCount || selected.isCollapsed) { selection = null; button.disabled = true; hint.textContent = ''; return; }
      try {
        selection = selectedRange(current, selected.getRangeAt(0), body);
        button.disabled = adding; hint.textContent = '';
      } catch (problem) {
        selection = null; button.disabled = true;
        hint.textContent = body.contains(selected.anchorNode) || body.contains(selected.focusNode) ? problem.message : '';
      }
    });
    window.addEventListener('popstate', restore);
    window.addEventListener('hashchange', restore);
    await window.SECOND_BRAIN.ready;
    restore(); window.SECOND_BRAIN.status();
  }
  return { blocks, validRecord, catalogRequest, selectedRange, start };
})();
window.VAULT_SOURCES.start();
