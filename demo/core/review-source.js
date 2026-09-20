'use strict';

window.SOURCE_REVIEW = (() => {
  const schema = 'vault-source-review-1';
  const key = 'second-brain-public-demo.second-brain.source-selection.v1';
  const contract = window.BELEGPRUEFUNG;
  let selectionChanged = () => {};
  const hash = async text => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))].map(byte => byte.toString(16).padStart(2, '0')).join('');
  function locationOf(text, start) {
    let heading = '', fence = null, yaml = text.startsWith('---\n') || text.startsWith('---\r\n'), offset = 0;
    for (const [index, raw] of text.split('\n').entries()) {
      if (offset > start) break;
      const line = raw.replace(/\r$/, '');
      offset += raw.length + 1;
      if (yaml) { if (index > 0 && /^(---|\.\.\.)$/.test(line)) yaml = false; continue; }
      const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/);
      if (marker) {
        if (!fence) fence = marker[1];
        else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null;
        continue;
      }
      if (!fence) { const match = line.match(/^#{1,6}[ \t]+(.+)/); if (match) heading = match[1]; }
    }
    return { heading, line: text.slice(0, start).split('\n').length };
  }
  function load(storage = sessionStorage) {
    const raw = storage.getItem(key);
    if (raw === null) return [];
    const passages = JSON.parse(raw);
    if (!Array.isArray(passages) || passages.length > 2 || !passages.every(contract.validSourcePassage)
      || new Set(passages.map(p => p.id)).size !== passages.length) throw new Error('Die gespeicherte Passagenauswahl ist ungültig. Sie bleibt unverändert.');
    return passages;
  }
  async function passage(record, start, end) {
    if (!record || typeof record.text !== 'string' || !Number.isInteger(start) || !Number.isInteger(end)
      || start < 0 || end <= start || end > record.text.length) throw new Error('Die Auswahl ist nicht an den Originaltext gebunden.');
    const text = record.text.slice(start, end);
    const result = { id: `source-${await hash(JSON.stringify([record.path, record.revision, start, end]))}`,
      path: record.path, title: record.title, label: record.title, ...locationOf(record.text, start), text,
      text_hash: await hash(text), source_hash: record.revision, source_url: record.sourceUrl,
      start, end, offset_unit: 'utf16' };
    if (!contract.validSourcePassage(result)) throw new Error('Die Quelle hat keine gültige Pfad-, Revisions- oder Textbindung.');
    return result;
  }
  async function add(record, start, end, storage = sessionStorage) {
    const next = await passage(record, start, end);
    const selected = load(storage);
    if (selected.some(p => p.id === next.id)) return selected;
    if (selected.length === 2) throw new Error('Zwei Passagen sind ausgewählt. Entferne zuerst eine Passage in der Prüfung.');
    const output = [...selected, next];
    storage.setItem(key, JSON.stringify(output));
    return output;
  }
  function remove(id, storage = sessionStorage) {
    const selected = load(storage).filter(p => p.id !== id);
    storage.setItem(key, JSON.stringify(selected));
    selectionChanged(selected);
    return selected;
  }
  async function assess(record, read = path => window.SECOND_BRAIN.json(`/api/source?path=${encodeURIComponent(path)}`)) {
    const changedIds = [], missingIds = [], unavailableIds = [], current = {};
    const documents = new Map();
    for (const evidence of record.evidence) {
      if (!documents.has(evidence.path)) documents.set(evidence.path, Promise.resolve().then(() => read(evidence.path)));
      try {
        const source = await documents.get(evidence.path);
        if (!source || source.path !== evidence.path || typeof source.text !== 'string' || typeof source.title !== 'string'
          || !/^[a-f0-9]{64}$/.test(source.revision)) throw new Error('Ungültige Quelle');
        const location = locationOf(source.text, evidence.start);
        if (source.revision !== evidence.source_hash || source.text.slice(evidence.start, evidence.end) !== evidence.text
          || await hash(evidence.text) !== evidence.text_hash || source.sourceUrl !== evidence.source_url
          || source.title !== evidence.title || location.heading !== evidence.heading || location.line !== evidence.line) {
          changedIds.push(evidence.id);
          current[evidence.id] = { ...evidence, ...location, title: source.title,
            text: source.text.slice(evidence.start, evidence.end), source_hash: source.revision };
        }
      } catch (error) {
        if (/HTTP 404\b/.test(error.message)) missingIds.push(evidence.id); else unavailableIds.push(evidence.id);
      }
    }
    return { status: unavailableIds.length ? 'unbekannt' : missingIds.length ? 'fehlend' : changedIds.length ? 'geaendert' : 'gleich', changedIds, missingIds, unavailableIds, current };
  }
  async function start() {
    const status = document.getElementById('source-review-status');
    const chosen = document.getElementById('source-review-passages');
    let selected = [], stored = [], selectionError = '';
    try { selected = load(); } catch (error) { selectionError = error.message; }
    // A broken draft must not hide independently stored immutable judgments.
    try { stored = window.BELEGSPEICHER.load(localStorage); } catch { /* The review workspace exposes its protected-storage error. */ }
    const passages = new Map(selected.map(p => [p.id, p]));
    for (const record of stored.filter(r => r.datasetSchema === schema)) for (const p of record.evidence) if (!passages.has(p.id)) passages.set(p.id, p);
    window.REVIEW_DATA = { schema, query: 'Freie Quellenauswahl', request_hash: await hash(JSON.stringify([...passages.keys()])), passages: [...passages.values()] };
    contract.checkData(window.REVIEW_DATA);
    selectionChanged = passages => {
      chosen.replaceChildren(...passages.map(p => el('p', {},
        el('a', { href: `sources.html#path=${encodeURIComponent(p.path)}&ansicht=original` }, `${p.path} · Zeile ${p.line}`))));
      status.textContent = selectionError || (passages.length ? `${passages.length} ${passages.length === 1 ? 'Passage ausgewählt' : 'Passagen ausgewählt'}` : 'Im Quellenleser eine Passage markieren und „Passage prüfen“ wählen.');
    };
    selectionChanged(selected);
    const script = document.createElement('script'); script.src = 'review.js';
    await new Promise((resolve, reject) => { script.onload = resolve; script.onerror = () => reject(new Error('Die Prüfoberfläche konnte nicht geladen werden.')); document.body.append(script); });
    for (const p of selected) window.BELEGARBEIT.select(p);
  }
  return { schema, load, passage, add, remove, assess, start };
})();

if (document.getElementById('source-review-passages')) window.SOURCE_REVIEW.start().catch(error => {
  document.getElementById('source-review-status').textContent = error.message;
});
