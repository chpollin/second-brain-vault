'use strict';

window.SOURCE_PREVIEWS = (() => {
  function pathFrom(href) {
    try {
      const url = new URL(href);
      if (url.protocol !== 'obsidian:' || url.hostname !== 'open') return null;
      const file = url.searchParams.get('file')?.split('#')[0];
      if (!file || file.startsWith('/') || file.includes('\\') || file.split('/').some(part => !part || part.startsWith('.'))) return null;
      return /\.md$/i.test(file) ? file : `${file}.md`;
    } catch { return null; }
  }

  async function resolve(path) {
    if (!path.includes('/')) {
      const query = path.replace(/\.md$/i, '');
      if (query.length < 2 || query.length > 160) return null;
      const result = await window.SECOND_BRAIN.json(`/api/search?q=${encodeURIComponent(query)}`);
      if (!Array.isArray(result.results) || result.truncated || result.warnings?.length) return null;
      const matches = result.results.filter(item => typeof item.path === 'string' && item.path.split('/').at(-1) === path);
      if (matches.length !== 1) return null;
      path = matches[0].path;
    }
    const record = await window.SECOND_BRAIN.json(`/api/source?path=${encodeURIComponent(path)}`);
    return record.path === path && pathFrom(record.sourceUrl) === path ? record : null;
  }

  function summaryText(record) {
    const summary = record?.summary;
    if (!summary || typeof record.text !== 'string' || summary.revision !== record.revision || typeof summary.text !== 'string'
      || !Number.isInteger(summary.start) || !Number.isInteger(summary.end)
      || summary.start < 0 || summary.end < summary.start
      || record.text?.slice(summary.start, summary.end) !== summary.text) return '';
    // A complete first paragraph keeps the preview bounded without fabricating an abstract.
    return summary.text.trim().split(/\r?\n\s*\r?\n/)[0] || '';
  }

  async function mount(root) {
    if (!root || !window.SECOND_BRAIN?.json) return;
    const links = [...root.querySelectorAll('a.ziel[href]')];
    await Promise.all(links.map(async link => {
      const path = pathFrom(link.href);
      if (!path || link.dataset.previewRequested) return;
      link.dataset.previewRequested = 'true';
      const parent = link.closest('.ziel-gruppe');
      if (!parent) return;
      const original = link.href;
      try {
        const record = await resolve(path);
        if (!link.isConnected || !record) return;
        if (new URL(original).searchParams.get('vault') !== new URL(record.sourceUrl).searchParams.get('vault')) return;
        link.href = `sources.html#${new URLSearchParams({ path: record.path })}`;
        link.removeAttribute('target');
        const text = summaryText(record);
        if (!text) return;
        const preview = document.createElement('div');
        preview.className = 'source-preview';
        const heading = document.createElement('p');
        heading.className = 'source-preview-origin';
        heading.textContent = 'Aus der Zusammenfassung';
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        preview.append(heading, paragraph);
        parent.append(preview);
      } catch {
        // Preserve the original destination if its current document cannot be verified.
      }
    }));
  }
  return { pathFrom, summaryText, mount };
})();
