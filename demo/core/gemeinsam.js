'use strict';

// Helpers shared by the start page and the points page. Loaded as a classic
// script before the page script; see app.js for why these are not modules.

const SPEICHER = 'second-brain-public-demo.pruefansicht.urteile.v1';
const MS_JE_TAG = 86400000;
const ZEICHEN = { accept: '✓', beantwortet: '✓', change: '↺', unclear: '?' };
// The card forms, named after the kind of work they ask of the operator.
const FORMNAMEN = {
  optionen: 'Auswählen', bestaetigung: 'Bestätigen', sicht: 'Ansehen', lesen: 'Lesen',
  sammel: 'Mehrteilig', dritte: 'Klären oder liefern', festlegung: 'Festlegen', prosa: 'Originaltext',
};
const ARBEITSARTEN = {
  entscheiden: 'Entscheiden', vorschlag: 'Vorschlag beurteilen', ergebnis: 'Ergebnis prüfen',
  text: 'Text prüfen', information: 'Information ergänzen', original: 'Weitere Fragen',
};
const FORM_ARBEITSART = { optionen: 'entscheiden', festlegung: 'entscheiden', bestaetigung: 'vorschlag',
  sicht: 'ergebnis', lesen: 'text', dritte: 'information', prosa: 'original' };

function arbeitsartVon(posten) {
  const form = posten.struktur?.form;
  if (!form) return 'original';
  if (form === 'sammel') return posten.typ === 'Entscheidung' || posten.typ === 'Definition' ? 'entscheiden'
    : posten.typ === 'Freigabe' ? 'ergebnis' : 'information';
  return FORM_ARBEITSART[form] || 'original';
}

function arbeitsstand(posten, antwort) {
  if (window.WORK_STATE) return window.WORK_STATE.describe(posten, antwort, window.SECOND_BRAIN?.progress || []);
  const current = gueltigesUrteil(posten, antwort);
  const response = antwort && !current ? 'revisit' : current && antwort.urteil ? 'answered' : 'open';
  return { response, responseLabel: { open: 'Antwort fehlt', revisit: 'Erneut prüfen', answered: 'Antwort lokal gespeichert' }[response],
    adopted: false, implemented: false, verified: false, receipts: [], changedReceipts: [], route: 'human', routeReason: '' };
}

// The Web Lock covers the whole map transaction across tabs. Without it, editing stays in the form.
window.WORK_STORAGE = (() => {
  const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  function validRecord(value) {
    return object(value) && ['urteil', 'notiz', 'revision', 'am', 'optionText', 'optionIdentitaet', 'quellenwortlaut', 'empfehlungTitel']
      .every((key) => !(key in value) || value[key] === null || typeof value[key] === 'string')
      && (!('option' in value) || value.option === null || (Number.isInteger(value.option) && value.option >= 0))
      && (!('struktur' in value) || (object(value.struktur)
        && ['urteil', 'notiz'].every((key) => !(key in value.struktur) || typeof value.struktur[key] === 'string')))
      && (!('historie' in value) || value.historie === undefined
      || (Array.isArray(value.historie) && value.historie.every(validRecord)))
      && (!('teile' in value) || (object(value.teile) && Object.values(value.teile).every(validRecord)))
      && (!('felder' in value) || (object(value.felder) && Object.values(value.felder)
        .every((field) => object(field) && typeof field.original === 'string' && typeof field.neu === 'string')));
  }
  function read(key) {
    try {
      const raw = localStorage.getItem(key);
      const data = raw === null ? {} : JSON.parse(raw);
      if (!object(data) || !Object.values(data).every(validRecord)) throw new Error('Ungültiger Speicherinhalt');
      return { ok: true, data };
    } catch {
      return { ok: false, data: {}, error: 'Gespeicherte Eingaben sind nicht lesbar. Sie bleiben unverändert. Neue Eingaben wurden nicht gespeichert.' };
    }
  }
  function transaction(key, id, value, expected) {
    const loaded = read(key);
    if (!loaded.ok) return loaded;
    if (JSON.stringify(loaded.data[id]) !== JSON.stringify(expected)) return { ...loaded, ok: false,
      error: 'Diese Antwort wurde in einem anderen Tab geändert. Deine Eingabe bleibt im Formular. Sichere sie vor dem erneuten Laden.' };
    if (value === undefined) delete loaded.data[id];
    else Object.defineProperty(loaded.data, id, { value, enumerable: true, configurable: true, writable: true });
    try { localStorage.setItem(key, JSON.stringify(loaded.data)); return loaded; }
    catch { return { ok: false, data: loaded.data,
      error: 'Der Browser konnte die Eingabe nicht speichern. Sie bleibt im Formular. Sichere sie vor dem Schließen.' }; }
  }
  async function write(key, id, value, expected) {
    if (!globalThis.navigator?.locks?.request) return { ok: false, sessionOnly: true,
      error: 'Dieser Browser kann parallele Eingaben nicht sicher speichern. Deine Eingabe bleibt nur im Formular. Sichere sie vor dem Schließen.' };
    try {
      return await navigator.locks.request(`second-brain:${key}`, { mode: 'exclusive' },
        () => transaction(key, id, value, expected));
    } catch {
      return { ok: false, sessionOnly: true,
        error: 'Die sichere Speicherung ist nicht verfügbar. Deine Eingabe bleibt nur im Formular. Sichere sie vor dem Schließen.' };
    }
  }
  return { read, write };
})();

const $ = (id) => document.getElementById(id);

/**
 * Builds an element. Text always enters as a text node, never as markup,
 * because every string here originates in a vault file.
 * @param {string} tag
 * @param {Record<string, string|boolean|null|undefined>} [attribute]
 * @param {...(Node|string|null|false|undefined)} kinder
 */
function el(tag, attribute = {}, ...kinder) {
  return fuelle(document.createElement(tag), attribute, kinder);
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Same contract as el(), for SVG elements. */
function svg(tag, attribute = {}, ...kinder) {
  return fuelle(document.createElementNS(SVG_NS, tag), attribute, kinder);
}

function fuelle(knoten, attribute, kinder) {
  for (const [name, wert] of Object.entries(attribute)) {
    if (wert === null || wert === undefined || wert === false) continue;
    if (name === 'class') knoten.setAttribute('class', String(wert));
    else knoten.setAttribute(name, wert === true ? '' : String(wert));
  }
  for (const kind of kinder) {
    if (kind === null || kind === undefined || kind === false) continue;
    knoten.append(kind);
  }
  return knoten;
}

function ladeUrteile() {
  return window.WORK_STORAGE.read(SPEICHER).data;
}

/** Legacy answers remain readable but cannot decide a revised question. */
function gueltigesUrteil(posten, urteil) {
  return Boolean(posten && posten.identitaetStabil !== false && urteil
    && typeof posten.revision === 'string' && posten.revision.length > 0
    && urteil.revision === posten.revision);
}

const heute = new Date();
const zeit = (iso) => new Date(`${iso}T00:00:00`);
const tageSeit = (iso) => (iso ? Math.max(0, Math.floor((heute - zeit(iso)) / MS_JE_TAG)) : null);
const datum = (iso) => (iso ? zeit(iso).toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '');

/** Shortest and longest wait among the points, in days. */
function skalaVon(posten) {
  const tage = posten.map((p) => tageSeit(p.seit)).filter((t) => t !== null);
  return tage.length ? { min: Math.min(...tage), max: Math.max(...tage) } : { min: 0, max: 0 };
}

// Waiting time as a share of the longest wait in the data. The scale is
// relative on purpose, the view orders the points and sets no threshold.
function anteilVon(posten, skala) {
  const tage = tageSeit(posten.seit);
  if (tage === null) return null;
  return skala.max === skala.min ? 1 : (tage - skala.min) / (skala.max - skala.min);
}

/** The derived title of a point where a structure record exists, else its wording. */
const titelVon = (posten) => posten.struktur?.titel || posten.frage;

/**
 * The mark of a point: a verdict sign once judged, else a fill that grows
 * with the wait. A point with sub-items is square, so a bundle reads as one.
 */
function markeVon(posten, urteile, skala) {
  const gespeichert = urteile[posten.id];
  const u = gueltigesUrteil(posten, gespeichert) ? gespeichert.urteil : null;
  const parts = posten.struktur?.teile?.length || 0;
  const klasse = parts ? 'marke marke-buendel' : 'marke';
  if (arbeitsstand(posten, gespeichert).response === 'revisit') return el('span', {
    class: `${klasse} marke-erneut`, 'data-urteil': 'change', 'data-parts': parts || null, 'aria-hidden': 'true',
  }, '↺');
  if (u) return el('span', { class: klasse, 'data-urteil': u, 'data-parts': parts || null, 'aria-hidden': 'true' }, ZEICHEN[u]);
  const knoten = el('span', { class: klasse, 'data-parts': parts || null, 'aria-hidden': 'true' });
  const anteil = anteilVon(posten, skala);
  if (anteil !== null) knoten.style.setProperty('--mix', `${Math.round(35 + anteil * 65)}%`);
  return knoten;
}

function kurz(text, grenze = 140) {
  const satz = text.split(/(?<=[.?!])\s/)[0];
  return satz.length <= grenze ? satz : `${satz.slice(0, grenze - 1).trimEnd()}…`;
}
