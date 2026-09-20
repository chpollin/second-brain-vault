import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const payload = JSON.parse(fs.readFileSync(new URL('../docs/demo/demo-data.json', import.meta.url), 'utf8'));
const code = fs.readFileSync(new URL('../demo/runtime.js', import.meta.url), 'utf8');

async function runtime() {
  const requests = [];
  const window = {};
  const context = { window, URL, document: { querySelector: () => null, getElementById: () => null },
    fetch: async path => { requests.push(path); return { ok: true, json: async () => structuredClone(payload) }; } };
  vm.runInNewContext(code, context);
  await window.SECOND_BRAIN.ready;
  return { api: window.SECOND_BRAIN, requests };
}

test('static routes preserve exact source and graph data without endpoint requests', async () => {
  const { api, requests } = await runtime();
  const source = payload.sources.find(item => item.path === 'HOME.md');
  assert.deepEqual(await api.json('/api/source?path=HOME.md'), source);
  assert.deepEqual(await api.json('/api/knowledge'), payload.knowledge);
  assert.equal(api.isLive(), false);
  assert.equal((await api.json('/api/progress')).records.length, 0);
  await assert.rejects(api.json('/api/answers'), /nicht zur Verfügung/);
  await assert.rejects(api.json('/api/source?path=.local/private.md'), /404/);
  assert.deepEqual(requests, ['demo-data.json']);
});

test('document catalog filters real public text and project folder', async () => {
  const { api } = await runtime();
  const project = payload.work.eintraege[0];
  const result = await api.json(`/api/catalog?project=${project.id}`);
  assert.ok(result.results.some(item => item.path === project.notizPfad));
  assert.ok(result.results.every(item => item.path.startsWith(project.notizPfad.split('/').slice(0, -1).join('/'))));
  const record = payload.sources.find(item => item.path.endsWith('Example Concept.md'));
  const found = await api.json(`/api/catalog?q=${encodeURIComponent(record.title)}&mode=headings`);
  assert.ok(found.results.some(item => item.path === record.path));
});

test('failed snapshot settles ready while source queries still reject', async () => {
  const window = {};
  vm.runInNewContext(code, { window, URL, document: { querySelector: () => null, getElementById: () => null },
    fetch: async () => { throw new Error('Unavailable snapshot'); } });
  assert.equal(await window.SECOND_BRAIN.ready, window.PRUEFANSICHT);
  await assert.rejects(window.SECOND_BRAIN.json('/api/knowledge'), /Unavailable snapshot/);
});
