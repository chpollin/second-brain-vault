// Addressable explorer state. Filters constrain the note list without replacing the open note.
export function normalizeSearch(text) {
  return text.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** @param {string} hash @param {string} fallback @returns {{note:string,query:string,domain:string,lens:string,heading:string}} */
export function readExplorerRoute(hash, fallback) {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  return {
    note: params.get('note') || fallback,
    query: params.get('q') || '',
    domain: params.get('folder') || '',
    lens: params.get('show') || 'all',
    heading: params.get('heading') || '',
  };
}

/** Preserve search context when following a written connection into another note. */
export function explorerHref(current, note, heading = '', changes = {}) {
  const params = new URLSearchParams();
  const values = {
    note, q: current.query, folder: current.domain,
    show: current.lens === 'all' ? '' : current.lens,
    heading, ...changes,
  };
  for (const [key, value] of Object.entries(values)) if (value) params.set(key, value);
  return '#' + params.toString();
}
