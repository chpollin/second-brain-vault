'use strict';

window.BELEGPRUEFUNG = (() => {
  const schema = 'second-brain-review-1';
  const relations = new Set(['stuetzt', 'begrenzt', 'widerspricht', 'keine_belegbeziehung', 'offen']);
  const origins = new Set(['nutzereingabe', 'agent-simulation']);
  const datasets = new Set(['vault-reading-probe-1', 'vault-source-review-1']);
  let sequence = 0;
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const text = value => typeof value === 'string' && value.trim().length > 0;

  function safeSourceUrl(value) {
    return typeof value === 'string' && !/[\u0000-\u0020\u007f]/.test(value)
      && /^(?:https?:\/\/[^/?#]+(?:[/?#]|$)|obsidian:\/\/open(?:[/?#]|$))/i.test(value);
  }

  function validPassage(passage) {
    return object(passage)
      && ['id', 'path', 'title', 'text', 'text_hash', 'source_hash', 'source_url'].every(key => text(passage[key]))
      && safeSourceUrl(passage.source_url)
      && typeof passage.heading === 'string'
      && Number.isInteger(passage.line) && passage.line > 0
      && Number.isInteger(passage.start) && passage.start >= 0
      && Number.isInteger(passage.end) && passage.end > passage.start;
  }

  function validSourcePassage(passage) {
    return validPassage(passage) && passage.offset_unit === 'utf16'
      && passage.end - passage.start === passage.text.length
      && /^[a-f0-9]{64}$/.test(passage.text_hash) && /^[a-f0-9]{64}$/.test(passage.source_hash)
      && !/^(?:[\\/]|[a-z]:)/i.test(passage.path) && !passage.path.split(/[\\/]/).includes('..')
      && /\.md$/i.test(passage.path)
      && !['jev', 'baseline', 'reference'].some(key => key in passage);
  }

  function checkInput(input) {
    if (!object(input)) throw new Error('Das Urteil muss als Datensatz vorliegen.');
    if (!text(input.question)) throw new Error('Bitte eine Forschungsfrage angeben.');
    if (!text(input.reason)) throw new Error('Bitte das Urteil begründen.');
    if (!origins.has(input.origin)) throw new Error('Die Herkunft muss Nutzereingabe oder Agentensimulation sein.');
    if (input.claim !== undefined && typeof input.claim !== 'string') throw new Error('Die Aussage muss ein Text sein.');
    if (!Array.isArray(input.evidence) || input.evidence.length < 1 || input.evidence.length > 2) {
      throw new Error('Bitte einen oder zwei verschiedene Belege auswählen.');
    }
    const ids = new Set();
    for (const evidence of input.evidence) {
      if (!object(evidence) || !text(evidence.id) || !relations.has(evidence.relation)) {
        throw new Error('Jeder Beleg benötigt eine Kennung und eine gültige Belegbeziehung.');
      }
      if (ids.has(evidence.id)) throw new Error('Derselbe Beleg darf nur einmal ausgewählt werden.');
      ids.add(evidence.id);
      if (evidence.relation !== 'offen' && !text(input.claim)) {
        throw new Error('Für diese Belegbeziehung ist eine konkrete Aussage erforderlich.');
      }
    }
  }

  function checkData(data) {
    if (!object(data) || !datasets.has(data.schema)
      || !text(data.query) || !text(data.request_hash) || !Array.isArray(data.passages)) {
      throw new Error('Der geladene Quellenstand ist unvollständig oder hat ein unbekanntes Format.');
    }
    const ids = new Set();
    for (const passage of data.passages) {
      if (!(data.schema === 'vault-source-review-1' ? validSourcePassage(passage) : validPassage(passage)) || ids.has(passage.id)) {
        throw new Error('Der Quellenstand enthält ungültige oder doppelte Belege.');
      }
      ids.add(passage.id);
    }
  }

  function freeze(value) {
    if (value && typeof value === 'object') {
      Object.values(value).forEach(freeze);
      Object.freeze(value);
    }
    return value;
  }

  /** Validate stored structure only; this does not establish a scholarly judgment. */
  function validate(record) {
    try {
      checkInput(record);
      return record.schema === schema && text(record.id)
        && typeof record.created === 'string'
        && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(record.created)
        && Number.isFinite(Date.parse(record.created))
        && typeof record.claim === 'string'
        && (record.datasetSchema === undefined || datasets.has(record.datasetSchema))
        && text(record.query) && text(record.requestHash)
        && record.evidence.every(record.datasetSchema === 'vault-source-review-1' ? validSourcePassage : validPassage);
    } catch {
      return false;
    }
  }

  /** Create an immutable source snapshot from one or two selected passages. */
  function create(input, data, meta = {}) {
    checkInput(input);
    checkData(data);
    if (!object(meta)) throw new Error('Die Metadaten müssen als Datensatz vorliegen.');
    const evidence = input.evidence.map(selection => {
      const passage = data.passages.find(item => item.id === selection.id);
      if (!passage) throw new Error(`Der Beleg „${selection.id}“ fehlt im geladenen Quellenstand.`);
      return { ...passage, relation: selection.relation };
    });
    const record = {
      schema,
      id: meta.id === undefined ? `urteil-${Date.now().toString(36)}-${++sequence}-${Math.random().toString(36).slice(2)}` : meta.id,
      created: meta.created === undefined ? new Date().toISOString() : meta.created,
      question: input.question.trim(),
      claim: (input.claim || '').trim(),
      reason: input.reason.trim(),
      origin: input.origin,
      evidence,
      query: data.query,
      requestHash: data.request_hash,
      datasetSchema: data.schema,
    };
    if (!validate(record)) throw new Error('Das Urteil enthält ungültige Metadaten oder Quellenangaben.');
    try {
      return freeze(JSON.parse(JSON.stringify(record)));
    } catch {
      throw new Error('Die Quellenangaben konnten nicht als unabhängige Kopie gespeichert werden.');
    }
  }

  /** Compare source bindings; unchanged sources do not imply human validation. */
  function assess(record, data) {
    if (!validate(record)) throw new Error('Das gespeicherte Urteil ist ungültig.');
    checkData(data);
    const changedIds = [];
    const missingIds = [];
    for (const evidence of record.evidence) {
      const passage = data.passages.find(item => item.id === evidence.id);
      if (!passage) missingIds.push(evidence.id);
      else if (['path', 'text_hash', 'source_hash', 'text', 'heading', 'line', 'start', 'end', 'source_url'].some(key => passage[key] !== evidence[key])) {
        changedIds.push(evidence.id);
      }
    }
    return { status: missingIds.length ? 'fehlend' : changedIds.length ? 'geaendert' : 'gleich', changedIds, missingIds };
  }

  return Object.freeze({ create, assess, validate, checkData, safeSourceUrl, validSourcePassage });
})();
