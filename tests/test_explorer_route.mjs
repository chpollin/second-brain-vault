import test from 'node:test';
import assert from 'node:assert/strict';
import { readExplorerRoute, explorerHref, normalizeSearch } from '../docs/explorer-route.js';

const image = 'example/Data Management/Decision Image Master Format.md';
const audio = 'example/Projects/Project Overview Oral History Collection.md';

test('a direct audio URL opens audio rather than the default image decision', () => {
  const selected = readExplorerRoute('#note=' + encodeURIComponent(audio), image);
  assert.equal(selected.note, audio);
});

test('following a note preserves the search and care context but clears an old heading', () => {
  const current = { note: image, query: 'TIFF', domain: 'Data Management', lens: 'cross', heading: 'Conditions' };
  const next = readExplorerRoute(explorerHref(current, audio), image);
  assert.deepEqual(next, { note: audio, query: 'TIFF', domain: 'Data Management', lens: 'cross', heading: '' });
});

test('a starting task explicitly resets filters without losing its selected note', () => {
  const current = { note: image, query: 'no matches', domain: 'Literature', lens: 'isolated' };
  const next = readExplorerRoute(explorerHref(current, audio, '', { q: '', folder: '', show: '' }), image);
  assert.deepEqual(next, { note: audio, query: '', domain: '', lens: 'all', heading: '' });
});

test('the search folds German umlauts and diacritics consistently with the pipeline', () => {
  assert.equal(normalizeSearch('ÄÖÜ Straße Café'), 'aeoeue strasse cafe');
});
