'use strict';

window.BELEGSPEICHER = (() => {
  const legacyKey = 'second-brain-public-demo.second-brain.belegpruefungen.v1';
  const prefix = `${legacyKey}.`;

  function access(action) {
    try { return action(); }
    catch { throw new Error('Der Browserspeicher ist nicht verfügbar oder konnte nicht beschrieben werden.'); }
  }

  function parse(raw) {
    try { return JSON.parse(raw); }
    catch { throw new Error('Gespeicherte Belegurteile enthalten ungültiges JSON.'); }
  }

  function serialize(record) {
    try { return JSON.stringify(record); }
    catch { throw new Error('Das Belegurteil konnte nicht gespeichert werden: ungültige Daten.'); }
  }

  function comparable(value) {
    if (Array.isArray(value)) return `[${value.map(comparable).join(',')}]`;
    if (value !== null && typeof value === 'object') {
      return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${comparable(value[key])}`).join(',')}}`;
    }
    return JSON.stringify(value);
  }

  function assertStorage(storage) {
    if (!storage || typeof storage.getItem !== 'function' || typeof storage.key !== 'function'
      || !Number.isInteger(storage.length) || storage.length < 0) {
      throw new Error('Der Browserspeicher ist nicht verfügbar oder hat ein ungültiges Format.');
    }
  }

  function assertRecord(record) {
    if (!window.BELEGPRUEFUNG.validate(record)) throw new Error('Ein gespeichertes Belegurteil ist ungültig.');
  }

  /** Merge legacy and individual records without changing either storage format. */
  function load(storage) {
    access(() => assertStorage(storage));
    const records = new Map();
    const add = record => {
      assertRecord(record);
      const existing = records.get(record.id);
      if (existing && comparable(existing) !== comparable(record)) {
        throw new Error(`Für das Belegurteil „${record.id}“ liegen widersprüchliche gespeicherte Fassungen vor.`);
      }
      records.set(record.id, record);
    };
    const legacy = access(() => storage.getItem(legacyKey));
    if (legacy !== null) {
      const parsed = parse(legacy);
      if (!Array.isArray(parsed)) throw new Error('Die bisherige Liste der Belegurteile hat ein ungültiges Format.');
      parsed.forEach(add);
    }
    const keys = access(() => Array.from({ length: storage.length }, (_, index) => storage.key(index)));
    for (const key of keys) {
      if (typeof key !== 'string' || !key.startsWith(prefix)) continue;
      const raw = access(() => storage.getItem(key));
      if (raw === null) continue;
      const record = parse(raw);
      assertRecord(record);
      if (key !== `${prefix}${record.id}`) throw new Error('Die Speicherkennung eines Belegurteils stimmt nicht mit seinem Inhalt überein.');
      add(record);
    }
    return Array.from(records.values());
  }

  /** Each record has its own key so independent tabs cannot replace a shared list. */
  function save(storage, record) {
    assertRecord(record);
    const serialized = serialize(record);
    const normalized = parse(serialized);
    assertRecord(normalized);
    const records = load(storage);
    const existing = records.find(item => item.id === normalized.id);
    if (existing) {
      if (comparable(existing) !== comparable(normalized)) {
        throw new Error(`Das Belegurteil „${record.id}“ ist bereits mit anderem Inhalt gespeichert.`);
      }
      return records;
    }
    access(() => storage.setItem(`${prefix}${normalized.id}`, serialized));
    return load(storage);
  }

  return Object.freeze({ load, save });
})();
