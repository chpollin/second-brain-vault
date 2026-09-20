'use strict';

window.WORK_DETAIL = (() => {

// Classic scripts instead of ES modules, because the view runs from file://
// without a server and browsers block module imports there. Upgrade path:
// serve the folder over http and split this file into modules.

/**
 * @typedef {{label: string, url: string, art: string, abschnitte?: string[], quelle?: string, notiz?: string}} Ziel
 * @typedef {{spanne: string, text?: string, id?: string, bedingung?: string}} Feld
 * @typedef {{form: string, titel: string, herkunft: string, optionen?: Feld[], teile?: Feld[], beteiligte?: Feld[], kriterien?: Feld[], vorschlag?: Feld, lieferung?: Feld, haengtDaran?: Feld, pruefziel?: Feld, voraussetzung?: Feld, hinweis?: Feld}} Struktur
 * @typedef {{id: string, projekt: string, typ: string, frage: string, kontext: string, links: Ziel[], anker: ?string, seit: ?string, struktur?: Struktur}} Posten
 * @typedef {{id: string, name: string, bereich: string, kategorie: string, status: string, updated: string, stand: string, ziele: string, wartetAuf: string, repoUrl: ?string, vaultUrl: ?string, pruefziele: Ziel[], posten: string[]}} Projekt an entry of ACTIVE-WORK that holds at least one point
 * @typedef {{urteil: string, notiz: string, am: string, option?: ?number, teile?: Record<string, {urteil?: string, notiz?: string}>, struktur?: {urteil?: string, notiz?: string}}} Urteil
 */

// gemeinsam.js supplies $, el, datum, tageSeit, kurz, titelVon, ladeUrteile, SPEICHER, ZEICHEN, FORMNAMEN.

// Only these schemes become anchors. The generator filters too; this second
// check holds when data.js comes from somewhere else.
const SCHEMATA = ['https://', 'http://', 'obsidian://'];
// Hosts whose pages load inside the review stage. Shortcut: a fixed list of
// the operator's own hosts, both checked on 2026-09-18 to send neither
// X-Frame-Options nor a frame-ancestors policy. Upgrade path: the generator
// reads the response headers of each target and records the result.
const EINBETTBAR = [];

const ZIEL_ART = { web: 'Web', datei: 'lokale Datei', vault: 'Vault' };
// A release is judged, every other type is answered in words.
const WAHL = {
  Freigabe: { stufen: ['accept', 'change', 'unclear'], antwort: 'accept', notiz: 'Notiz' },
  Entscheidung: { stufen: ['beantwortet', 'unclear'], antwort: 'entschieden', notiz: 'Entscheidung' },
  Definition: { stufen: ['beantwortet', 'unclear'], antwort: 'festgelegt', notiz: 'Festlegung' },
  'Einschätzung': { stufen: ['beantwortet', 'unclear'], antwort: 'eingeschätzt', notiz: 'Einschätzung' },
};
// The card form names the kind of work a point asks for. A form with its own
// steps overrides those of the point type; a bundle keeps the type's steps,
// because its sub-items are answered the way the point would be.
const FORM = {
  optionen: { stufen: ['beantwortet', 'unclear'], antwort: 'entschieden', notiz: 'Begründung oder andere Antwort' },
  bestaetigung: { stufen: ['accept', 'change', 'unclear'], notiz: 'Notiz' },
  sicht: { stufen: ['accept', 'change', 'unclear'], notiz: 'Notiz' },
  lesen: { stufen: ['accept', 'change', 'unclear'], notiz: 'Notiz' },
  sammel: {},
  dritte: { stufen: ['beantwortet', 'unclear'], antwort: 'geklärt', notiz: 'Ergebnis' },
  festlegung: { stufen: ['beantwortet', 'unclear'], antwort: 'festgelegt', notiz: 'Festlegung' },
  prosa: {},
};
for (const [form, angaben] of Object.entries(FORM)) angaben.name = FORMNAMEN[form];
const FELDER = [['vorschlag', 'Vorschlag'], ['lieferung', 'Zu liefern'], ['kriterien', 'Dazu gehört'], ['beteiligte', 'Beteiligt'],
  ['voraussetzung', 'Setzt voraus'], ['haengtDaran', 'Folge der Zustimmung'], ['pruefziel', 'Wo es steht'], ['hinweis', 'Hinweis']];
const HERKUNFT = { llm: 'LLM', workflow: 'Workflow', mensch: 'Mensch' };

const daten = window.PRUEFANSICHT;
const zustand = { form: null, projekt: null, auswahl: null,
  route: 'human', status: 'all', view: 'matrix', relations: false };
const buehne = { url: null, label: '', posten: null };
/** @type {Record<string, Urteil>} */
let urteile = {};
const KORREKTUREN = 'second-brain-public-demo.pruefansicht.korrekturen.v1';
let korrekturen = {};
const ANTWORT = { accept: 'Freigeben', change: 'Ändern', unclear: 'Rückfrage' };
const aktuellesUrteil = (p) => gueltigesUrteil(p, urteile[p.id]) ? urteile[p.id] : {};
const aktuelleKorrektur = (p) => korrekturen[p.id]?.revision === p.revision ? korrekturen[p.id].felder : {};
const anzeigeTitel = (p) => aktuelleKorrektur(p)?.titel?.neu || titelVon(p);
/** @type {Map<string, Projekt>} */
const projekte = new Map();
let meldungUhr = 0;
let speicherfolge = Promise.resolve();
const wartezeit = { min: 0, max: 0 };
let mounted = null;
let mountVersion = 0;
let sharedDialogsBound = false;
let standalone = false;
let initialisation = null;
let storageProblem = '';
const boundDetails = new WeakSet();

function reiheSpeichern(action) {
  speicherfolge = speicherfolge.then(action).catch(() => {
    speicherFehler('Die Eingabe konnte nicht gespeichert werden. Sichere den Formulartext vor dem Schließen.');
  });
  return speicherfolge;
}

function speicherFehler(text) {
  storageProblem = text;
  const target = $('storage-error') || mounted?.container.querySelector('[data-storage-error]');
  if (!target) return;
  target.hidden = !text;
  target.textContent = text;
}

async function sichereEingabe(key, id, value, expected) {
  const result = await window.WORK_STORAGE.write(key, id, value, expected);
  if (!result.ok) { speicherFehler(result.error); return false; }
  if (key === SPEICHER) urteile = result.data; else korrekturen = result.data;
  speicherFehler('');
  return true;
}

// A modal dialog covers the page, so the message moves into the open dialog.
function melde(text) {
  const global = $('meldung');
  const ort = global || mounted?.container.querySelector('[data-detail-message]');
  if (!ort) return;
  if (global) ([...document.querySelectorAll('dialog[open]')].pop() || document.body).append(ort);
  ort.textContent = text;
  clearTimeout(meldungUhr);
  meldungUhr = setTimeout(() => { ort.textContent = ''; }, 4000);
}

const formVon = (posten) => posten.struktur?.form || 'prosa';
const textVon = (feld) => feld.text || feld.spanne;
// Same composition as wording() in make_data.py, so every spanne is found in it.
const wortlautVon = (posten) => (posten.kontext ? `${posten.frage} Kontext: ${posten.kontext}` : posten.frage);

function wahlFuer(posten) {
  const form = FORM[formVon(posten)];
  return { ...(WAHL[posten.typ] || WAHL.Freigabe), ...(form.stufen ? form : {}) };
}

function antwortLabels(posten) {
  return formVon(posten) === 'bestaetigung'
    ? { accept: 'Vorschlag übernehmen', change: 'Anderer Vorschlag', unclear: 'Noch unklar' }
    : { accept: 'Ergebnis akzeptieren', change: 'Überarbeitung nötig', unclear: 'Noch unklar' };
}

function notizLabel(posten, antwort = {}) {
  if (antwort.urteil === 'change') return 'Was möchtest du stattdessen?';
  if (antwort.urteil === 'unclear') return 'Was soll ich erklären?';
  if (['accept', 'beantwortet'].includes(antwort.urteil)) return 'Kommentar (optional)';
  return ['Entscheidung', 'Definition', 'Einschätzung'].includes(posten.typ) && formVon(posten) !== 'bestaetigung'
    ? wahlFuer(posten).notiz : 'Kommentar (optional)';
}

function urteilText(posten) {
  const u = aktuellesUrteil(posten);
  if (!u || !u.urteil) return null;
  return u.urteil === 'beantwortet' ? wahlFuer(posten).antwort : ANTWORT[u.urteil] || u.urteil;
}

const istOffen = (posten) => arbeitsstand(posten, urteile[posten.id]).response !== 'answered';

/** A point with sub-items is judged through them: the weakest sub-verdict stands for the whole. */
function gesamtAusTeilen(posten, teile) {
  const werte = posten.struktur.teile.map((t) => teile[t.id]?.urteil);
  if (werte.some((w) => !w)) return '';
  return ['unclear', 'change'].find((w) => werte.includes(w)) || werte[0];
}

function fortschritt(posten) {
  const teile = posten.struktur?.teile;
  if (!teile) return null;
  const gegeben = aktuellesUrteil(posten).teile || {};
  return { fertig: teile.filter((t) => gegeben[t.id]?.urteil).length, gesamt: teile.length };
}

function hatEingabe(u) {
  return Boolean(u && (u.urteil || u.notiz || u.struktur?.urteil || Object.values(u.teile || {}).some((t) => t.urteil || t.notiz)));
}

const hatGespeicherteEingabe = (u) => hatEingabe(u) || Boolean(u?.historie?.some(hatGespeicherteEingabe));

function erlaubt(url) {
  return SCHEMATA.some((s) => url.startsWith(s));
}

function einbettbar(url) {
  try {
    const ort = new URL(url);
    return ort.protocol === 'https:' && EINBETTBAR.includes(ort.hostname);
  } catch {
    return false;
  }
}

// Same identity as target_key() in make_data.py: one file is one target, whatever section a link names.
const zielSchluessel = (url) => url.split('#')[0].replace(/\/$/, '').toLowerCase();

/** A question's targets come from that point. Project navigation stays in its overview. */
function zieleFuer(posten) {
  const gesehen = new Set();
  const neu = (z) => {
    if (!z || !erlaubt(z.url) || gesehen.has(zielSchluessel(z.url))) return false;
    gesehen.add(zielSchluessel(z.url));
    return true;
  };
  return { vorn: (posten.links || []).filter(neu) };
}

// These source-reviewed project surfaces are not bindings to individual parts.
// A changed question or missing source target requires renewed mapping.
function projektOberflaeche() { return null; }

const alterAnteil = (posten) => anteilVon(posten, wartezeit);

function projektReihenfolge() {
  const zahl = new Map();
  for (const p of daten.posten) zahl.set(p.projekt, (zahl.get(p.projekt) || 0) + 1);
  return [...projekte.values()].filter(p => zahl.has(p.id)).sort((a, b) => zahl.get(b.id) - zahl.get(a.id) || a.name.localeCompare(b.name, 'de'));
}

/** The matrix columns: every form of the vocabulary, and a last one for points that fell back to prose. */
function achsen() {
  return Object.keys(ARBEITSARTEN).filter((art) => daten.posten.some((point) => arbeitsartVon(point) === art));
}

function passtStatus(posten, status) {
  const state = arbeitsstand(posten, urteile[posten.id]);
  if (status === 'open' || status === 'answered' || status === 'revisit') return state.response === status;
  if (status === 'adoption') return state.response === 'answered' && !state.adopted;
  if (status === 'implementation') return state.adopted && !state.implemented;
  if (status === 'validation') return state.implemented && !state.verified;
  return true;
}

function sichtbar() {
  const gefiltert = daten.posten.filter((p) => (!zustand.form || arbeitsartVon(p) === zustand.form)
    && (!zustand.projekt || p.projekt === zustand.projekt)
    && (zustand.route === 'all' || arbeitsstand(p, urteile[p.id]).route === zustand.route)
    && passtStatus(p, zustand.status));
  const rang = new Map(projektReihenfolge().map((p, i) => [p.id, i]));
  return gefiltert.sort((a, b) => rang.get(a.projekt) - rang.get(b.projekt));
}

const marke = (posten) => markeVon(posten, urteile, wartezeit);

function zustandsText(posten) {
  const state = arbeitsstand(posten, urteile[posten.id]);
  if (state.response === 'revisit') return 'Erneut prüfen, Quellenstand geändert';
  if (state.verified) return 'Prüfung belegt';
  if (state.implemented) return 'Umsetzung belegt, Prüfung offen';
  if (state.adopted) return 'Übernahme belegt, Umsetzung offen';
  if (state.response === 'answered') return 'Antwort lokal gespeichert, Übernahme offen';
  if (gueltigesUrteil(posten, urteile[posten.id]) && (urteile[posten.id]?.urteil || urteile[posten.id]?.notiz)) return state.responseLabel;
  const f = fortschritt(posten);
  if (f?.fertig) return `${f.fertig} von ${f.gesamt} Teilen beurteilt`;
  return 'Noch keine Antwort gespeichert';
}

function zeichneMatrix() {
  const zeigt = new Set(sichtbar().map((p) => p.id));
  const kopf = el('tr', {}, el('th', { scope: 'col' }, el('span', { class: 'unsichtbar' }, 'Projekt')));
  for (const form of achsen()) {
    kopf.append(el('th', { scope: 'col' },
      el('button', { type: 'button', class: 'achse achse-form', 'data-form': form, 'aria-pressed': String(zustand.form === form) }, el('span', {}, ARBEITSARTEN[form]))));
  }
  const rumpf = el('tbody');
  for (const projekt of projektReihenfolge()) {
    const zeile = el('tr', { 'data-project': projekt.id }, el('th', { scope: 'row' },
      // The name may be cut off by the column, so the title carries it in full.
      el('button', { type: 'button', class: 'achse achse-projekt', 'data-projekt': projekt.id, 'aria-pressed': String(zustand.projekt === projekt.id), title: projekt.name }, projekt.name)));
    for (const form of achsen()) {
      const zelle = el('div', { class: 'zelle' });
      for (const posten of daten.posten.filter((p) => p.projekt === projekt.id && arbeitsartVon(p) === form)) {
        const text = `${ARBEITSARTEN[form]}, ${projekt.name}. ${kurz(anzeigeTitel(posten))} ${zustandsText(posten)}`;
        zelle.append(el('button', {
          type: 'button',
          class: zeigt.has(posten.id) ? 'punkt' : 'punkt gedimmt',
          'data-id': posten.id,
          'aria-label': text,
          // A mark has no visible label, so the title is its only name for the pointer.
          title: text,
          'aria-current': zustand.auswahl === posten.id ? 'true' : null,
        }, marke(posten)));
      }
      zeile.append(el('td', {}, zelle));
    }
    rumpf.append(zeile);
  }
  $('matrix').replaceChildren(el('table', { class: 'matrix' },
    el('caption', { class: 'unsichtbar' }, 'Offene Punkte nach Projekt und Art der Arbeit'), el('thead', {}, kopf), rumpf));
}

function zeichneFilter() {
  const marken = [];
  if (zustand.form) marken.push(el('button', { type: 'button', class: 'filter-marke', 'data-loesche': 'form', 'aria-label': `Filter ${ARBEITSARTEN[zustand.form]} entfernen` }, ARBEITSARTEN[zustand.form]));
  if (zustand.projekt) {
    const name = projekte.get(zustand.projekt).name;
    marken.push(el('button', { type: 'button', class: 'filter-marke', 'data-loesche': 'projekt', 'aria-label': `Filter ${name} entfernen` }, name));
  }
  $('filter').replaceChildren(...marken);
}

function zeile(posten, mitProjekt) {
  const tage = tageSeit(posten.seit);
  const u = urteilText(posten);
  const f = fortschritt(posten);
  const meta = el('span', { class: 'zeile-meta' }, posten.struktur && el('span', { class: 'zeile-form' }, ARBEITSARTEN[arbeitsartVon(posten)]),
    posten.struktur?.teile && el('span', {}, 'Mehrteilig'));
  if (mitProjekt) meta.append(el('span', {}, projekte.get(posten.projekt).name));
  if (u || arbeitsstand(posten, urteile[posten.id]).response === 'revisit') {
    meta.append(el('span', { class: 'urteil-marke' }, zustandsText(posten)));
  } else if (f?.fertig) {
    meta.append(el('span', {}, `${f.fertig} von ${f.gesamt} Teilen`));
  } else if (tage !== null) {
    const balken = el('span', { class: 'balken', 'aria-hidden': 'true' });
    balken.style.setProperty('--anteil', `${Math.round(alterAnteil(posten) * 100)}%`);
    meta.append(balken, el('span', {}, `seit spätestens ${datum(posten.seit)}`));
  }
  return el('li', {}, el('button', {
    type: 'button',
    class: 'zeile',
    'data-id': posten.id,
    'aria-label': `${anzeigeTitel(posten)}. ${zustandsText(posten)}`,
    'aria-current': zustand.auswahl === posten.id ? 'true' : null,
  }, el('span', { class: 'punkt-ruhe' }, marke(posten)), el('span', { class: 'zeile-frage' },
    kurz(anzeigeTitel(posten), 140)), meta));
}

function zeichneListe() {
  const posten = sichtbar();
  const offen = posten.filter(istOffen).length;
  $('treffer').textContent = `${posten.length} ${posten.length === 1 ? 'Punkt' : 'Punkte'}, davon ${offen} offen`;
  const scoped = daten.posten.filter((p) => (!zustand.projekt || p.projekt === zustand.projekt)
    && (!zustand.form || arbeitsartVon(p) === zustand.form)
    && (zustand.route === 'all' || arbeitsstand(p, urteile[p.id]).route === zustand.route));
  zeichneFilterAuswahl(scoped);
  $('work-matrix').hidden = zustand.view !== 'matrix';
  $('work-list').hidden = zustand.view === 'matrix';
  $('work-layout').dataset.view = zustand.view;
  // A verdict redraws the rows; the list keeps its place, so the chosen row stays in view.
  const oben = $('liste').scrollTop;
  fuelleListe(posten);
  $('liste').scrollTop = oben;
}

function zeichneFilterAuswahl(scoped) {
  for (const [id, key] of [['work-route', 'route'], ['work-status', 'status'], ['work-view', 'view']]) {
    for (const input of $(id).querySelectorAll('input[type="radio"]')) {
      input.checked = input.value === zustand[key];
      if (key === 'status') {
        const label = input.nextElementSibling;
        const title = label.dataset.label || label.textContent;
        const count = scoped.filter((point) => passtStatus(point, input.value)).length;
        label.dataset.label = title;
        label.textContent = `${title} (${count})`;
        input.parentElement.hidden = count === 0 && !input.checked && input.value !== 'all';
      }
    }
  }
}

function fuelleListe(posten) {
  if (!posten.length) {
    const projekt = projekte.get(zustand.projekt);
    if (projekt && !projekt.posten.length) {
      $('liste').replaceChildren(
        el('p', { class: 'leer' }, `Für ${projekt.name} ist kein Operatorpunkt erfasst.`),
        el('a', { href: `fragen.html#frage=anliegen&projekt=${encodeURIComponent(projekt.id)}` }, 'Anliegen ansehen'));
    } else $('liste').replaceChildren(el('p', { class: 'leer' }, 'Kein Punkt im Filter.'));
    return;
  }
  const gruppen = [];
  for (const projekt of projektReihenfolge()) {
    const eigene = posten.filter((p) => p.projekt === projekt.id);
    if (!eigene.length) continue;
    gruppen.push(el('section', { class: 'gruppe' },
      el('div', { class: 'gruppe-kopf' }, el('h3', {}, projekt.name),
        projekt.status === 'ruhend' && el('span', { class: 'gruppe-art' }, 'ruhend')),
      el('ul', { class: 'zeilen', role: 'list' }, ...eigene.map((p) => zeile(p, false)))));
  }
  $('liste').replaceChildren(...gruppen);
}

function zielKnoten(ziel) {
  const eintrag = el('li', { class: 'ziel-gruppe' },
    el('a', { class: 'ziel', href: ziel.url, target: '_blank', rel: 'noopener noreferrer', title: ziel.notiz || null },
      ziel.label, ...(ziel.abschnitte || []).map((a) => el('small', {}, `#${a}`)), el('small', {}, ZIEL_ART[ziel.art] || '')));
  if (einbettbar(ziel.url) && $('pruefbuehne')) {
    eintrag.append(el('button', { type: 'button', class: 'knopf knopf-haupt', 'data-buehne-url': ziel.url, 'data-buehne-label': ziel.label }, 'Hier prüfen'));
  }
  return eintrag;
}

function zieleKnoten(posten) {
  const { vorn } = zieleFuer(posten);
  const surface = projektOberflaeche(posten);
  if (!vorn.length && !surface) return null;
  return el('section', { class: 'detail-block', 'aria-label': 'Prüfziele' },
    el('ul', { class: 'ziele-liste', role: 'list' }, ...vorn.map(zielKnoten),
      surface && zielKnoten({ ...surface, label: 'Projektoberfläche öffnen' })));
}

/** A button that shows where in the wording a derived statement comes from. */
function stelleKnopf(feld, wozu) {
  return el('button', { type: 'button', class: 'stelle', 'data-spanne': feld.spanne, 'aria-label': `Textstelle zeigen, ${wozu}` }, '¶');
}

function felderKnoten(struktur, posten) {
  const liste = el('dl', { class: 'felder' });
  const normal = text => text.replace(/\s+/g, ' ').replace(/[.?!\s]+$/, '').trim();
  const sichtbar = [kartenTitel(posten), posten.frageKurz || posten.frage].map(normal);
  for (const [schluessel, name] of FELDER) {
    // A field that only repeats the title says nothing the card does not already say.
    const werte = [struktur[schluessel] || []].flat();
    const eintraege = werte.map((w, i) => {
      const pfad = `${schluessel}.${i}`;
      const korrektur = aktuelleKorrektur(posten)?.[pfad];
      const text = korrektur?.neu || textVon(w);
      if (sichtbar.some(known => known.includes(normal(text)))) return null;
      sichtbar.push(normal(text));
      return el('dd', {}, el('span', { 'data-feldtext': pfad }, text),
        normal(text) !== normal(w.spanne) && stelleKnopf(w, name),
        el('small', { 'data-korrekturmarke': pfad, hidden: !korrektur }, ' · korrigiert'));
    }).filter(Boolean);
    if (eintraege.length) liste.append(el('dt', {}, name), ...eintraege);
  }
  return liste.children.length ? liste : null;
}

function wortlautTeile(posten, spanne) {
  const text = wortlautVon(posten);
  const stelle = spanne ? text.indexOf(spanne) : -1;
  if (stelle < 0) return [text];
  return [text.slice(0, stelle), el('mark', { tabindex: '-1' }, spanne), text.slice(stelle + spanne.length)];
}

function stufenKnoten(name, stufen, antwort, gewaehlt, labels = ANTWORT) {
  const wahl = el('div', { class: 'urteil-wahl' });
  for (const stufe of stufen) {
    wahl.append(el('label', {},
      el('input', { type: 'radio', name, value: stufe, checked: gewaehlt === stufe }),
      el('span', { 'data-urteil': stufe }, el('span', { 'aria-hidden': 'true' }, ZEICHEN[stufe]), stufe === 'beantwortet' ? antwort : labels[stufe] || stufe)));
  }
  return wahl;
}

/** Options become the answer itself: one radio per option, one for another answer, one for unclear. */
function optionenKnoten(posten, u) {
  const { optionen, vorschlag } = posten.struktur;
  const wahl = el('div', { class: 'urteil-wahl urteil-optionen' });
  optionen.forEach((option, i) => {
    const empfohlen = vorschlag?.spanne.includes(option.spanne) || empfohleneOption(posten) === i;
    wahl.append(el('div', { class: `option${empfohlen ? ' option-recommended' : ''}` },
      el('label', {},
        el('input', { type: 'radio', name: 'urteil', value: `option:${i}`, checked: u.urteil === 'beantwortet' && u.option === i }),
        el('span', { 'data-urteil': 'beantwortet' },
          el('span', { class: 'option-text' }, textVon(option), empfohlen && el('small', {}, 'empfohlen'), option.bedingung && el('small', {}, option.bedingung)))),
      stelleKnopf(option, textVon(option))));
  });
  for (const [wert, name] of [['beantwortet', 'Anderer Vorschlag'], ['unclear', 'Noch unklar']]) {
    wahl.append(el('label', {},
      el('input', { type: 'radio', name: 'urteil', value: wert, checked: u.urteil === wert && (wert === 'unclear' || u.option == null) }),
      el('span', { 'data-urteil': wert }, el('span', { 'aria-hidden': 'true' }, ZEICHEN[wert]), name)));
  }
  return wahl;
}

function empfohleneOption() { return null; }

function empfehlungBestaetigt(posten, answer) {
  const recommendation = arbeitsstand(posten, answer).recommendation;
  if (!recommendation || !gueltigesUrteil(posten, answer) || !['accept', 'beantwortet'].includes(answer.urteil)) return false;
  const option = empfohleneOption(posten);
  return option !== null ? answer.option === option : answer.empfehlungTitel === recommendation.title
    || answer.notiz?.trim() === recommendation.title;
}

function empfehlungKnoten(posten, answer) {
  const recommendation = arbeitsstand(posten, answer).recommendation;
  if (!recommendation) return null;
  return el('section', { class: 'work-recommendation', 'aria-label': 'Empfehlung' },
    el('h3', {}, 'Unsere Empfehlung'), el('p', {}, recommendation.title), el('p', {}, recommendation.reason),
    el('label', { class: 'recommendation-confirm' },
      el('input', { type: 'checkbox', name: 'empfehlung', checked: empfehlungBestaetigt(posten, answer) }),
      'Empfehlung übernehmen'));
}

function uebernehmeEmpfehlung(form, checked) {
  const posten = daten.posten.find((point) => point.id === form.dataset.posten);
  const recommendation = arbeitsstand(posten, urteile[posten.id]).recommendation;
  if (!recommendation) return;
  const saving = checked ? schreibeUrteil(form, (current) => ({ urteil: 'beantwortet', option: empfohleneOption(posten),
    notiz: recommendation.title, empfehlungTitel: recommendation.title,
    historie: [...(current.historie || []), ...(hatEingabe(current) && !empfehlungBestaetigt(posten, current)
      ? [{ ...current, historie: undefined }] : [])] }))
    : schreibeUrteil(form, (current) => ({ urteil: '', option: null, notiz: '', empfehlungTitel: null,
      historie: [...(current.historie || []), { ...current, historie: undefined }] }));
  return saving.then(() => {
    const saved = aktuellesUrteil(posten);
    const input = form.querySelector('textarea[name="notiz"]');
    if (input && ((checked && saved.empfehlungTitel === recommendation.title) || (!checked && !saved.urteil))) {
      input.value = checked && saved.notiz === recommendation.title ? '' : saved.notiz || '';
    }
  });
}

function teilVorschau() { return null; }

function teileKnoten(posten, u, wahl) {
  return el('div', { class: 'teile' }, ...posten.struktur.teile.map((teil) => {
    const gegeben = u.teile?.[teil.id] || {};
    const preview = teilVorschau(posten, teil);
    const label = notizLabel(posten, gegeben);
    const notiz = el('input', { type: 'text', name: `teilnotiz:${teil.id}`, 'aria-label': `${label} zu ${textVon(teil)}`, placeholder: label });
    notiz.value = gegeben.notiz || '';
    return el('fieldset', { class: 'teil' },
      el('legend', {}, preview?.title || textVon(teil), !preview && teil.text && teil.text !== teil.spanne && stelleKnopf(teil, textVon(teil))),
      preview && el('p', {}, preview.question),
      preview && el('a', { href: preview.url, target: '_blank', rel: 'noopener noreferrer' }, 'Prüfbogen zu diesem Fall'),
      stufenKnoten(`teil:${teil.id}`, wahl.stufen, wahl.antwort, gegeben.urteil, antwortLabels(posten)), notiz);
  }));
}

function historischerText(u) {
  return [u.urteil && `Antwort: ${ANTWORT[u.urteil] || u.urteil}`, u.optionText && `Gewählt: ${u.optionText}`,
    u.option != null && !u.optionText && `Frühere Optionsnummer: ${u.option + 1}`, u.notiz,
    u.struktur?.urteil && `Strukturbewertung: ${u.struktur.urteil}${u.struktur.notiz ? `, ${u.struktur.notiz}` : ''}`,
    ...Object.entries(u.teile || {}).map(([id, t]) => `${id}: ${t.urteil || ''} ${t.notiz || ''}`)].filter(Boolean).join('\n');
}

function verlaufKnoten(posten, historie) {
  const state = arbeitsstand(posten, urteile[posten.id]);
  if (!historie.length && !state.changedReceipts.length) return null;
  return el('section', { class: 'answer-history', 'aria-label': 'Antwortverlauf' },
    el('h3', {}, state.response === 'revisit' ? 'Erneut prüfen' : 'Frühere Antworten'),
    state.response === 'revisit' && el('p', {}, 'Die Quelle oder die Kartenstruktur hat sich seit der Antwort geändert. Die frühere Antwort bleibt erhalten.'),
    ...historie.map((answer) => el('article', { class: 'history-entry' },
      el('h4', {}, answer.am ? `Antwort vom ${answer.am}` : 'Frühere Antwort'),
      el('p', { class: 'history-answer' }, historischerText(answer)),
      answer.quellenwortlaut && answer.quellenwortlaut !== wortlautVon(posten)
        ? el('div', { class: 'source-change' }, el('h4', {}, 'Damals'), el('p', {}, answer.quellenwortlaut),
          el('h4', {}, 'Jetzt'), el('p', {}, wortlautVon(posten)))
        : el('p', {}, answer.revision === posten.revision ? 'Frühere Antwort zur gleichen Fassung.'
          : answer.quellenwortlaut ? answer.revision ? 'Der Wortlaut ist gleich. Die Struktur oder Quellenfassung wurde geändert.'
            : 'Der Wortlaut ist gleich. Die frühere Punktrevision wurde nicht gespeichert.'
            : 'Der frühere Wortlaut wurde mit dieser Antwort noch nicht gespeichert.'))),
    state.changedReceipts.length > 0 && el('p', {}, 'Ein vorhandener Nachweis ist für den aktuellen Stand nicht bestätigt. Die Gründe stehen unter Übernahme und Ergebnis.'));
}

function nachweiseKnoten(posten) {
  const state = arbeitsstand(posten, urteile[posten.id]);
  const receipts = [...state.receipts, ...state.changedReceipts];
  if (!receipts.length) return null;
  const labels = { adopted: 'Übernahme', implemented: 'Umsetzung', verified: 'Prüfung' };
  return el('section', { class: 'work-receipts', 'aria-label': 'Nachweise' }, el('h3', {}, 'Übernahme und Ergebnis'),
    ...receipts.map((receipt) => el('article', {},
      el('h4', {}, `${labels[receipt.stage] || 'Nachweis'}${receipt.valid && receipt.pointCurrent && receipt.evidenceCurrent ? ''
        : receipt.pointCurrent === false ? ' zum früheren Stand' : ' nicht bestätigt'}`),
      el('p', {}, receipt.summary || 'Keine Zusammenfassung'),
      receipt.stage === 'verified' && el('p', {}, receipt.validationKind === 'human' ? 'Durch einen Menschen geprüft' : 'Technisch geprüft'),
      el('small', {}, [receipt.createdAt, receipt.actor?.kind === 'user' ? 'Nutzer' : 'Agent'].filter(Boolean).join(' · ')),
      el('ul', {}, ...(receipt.evidence || []).map((evidence) => el('li', {}, `${evidence.root} / ${evidence.path}`))),
      ...(receipt.problems || []).map((problem) => el('p', {}, problem)))));
}

function urteilFormular(posten) {
  const wahl = wahlFuer(posten);
  const s = posten.struktur;
  const u = aktuellesUrteil(posten);
  const recommendation = arbeitsstand(posten, u).recommendation;
  const recommendationConfirmed = empfehlungBestaetigt(posten, u);
  const gespeichert = urteile[posten.id];
  const historie = [...(gespeichert?.historie || []), ...(gespeichert && !gueltigesUrteil(posten, gespeichert) ? [gespeichert] : [])];
  const eingabe = s?.teile ? teileKnoten(posten, u, wahl)
    : s?.optionen ? optionenKnoten(posten, u)
      : stufenKnoten('urteil', wahl.stufen, recommendation ? 'Andere Antwort' : wahl.antwort,
        recommendationConfirmed ? '' : u.urteil, antwortLabels(posten));
  const notiz = el('textarea', { name: 'notiz', rows: '2' });
  notiz.value = recommendationConfirmed && u.notiz === recommendation.title ? '' : u.notiz || '';
  return el('form', { class: 'urteil', 'data-posten': posten.id },
    verlaufKnoten(posten, historie),
    empfehlungKnoten(posten, u),
    el('fieldset', {}, el('legend', { class: 'unsichtbar' }, 'Urteil'), eingabe),
    el('label', { class: 'urteil-notiz' }, el('span', { 'data-notiz-label': '' }, notizLabel(posten, u)), notiz),
    el('small', { role: 'status', 'data-speicherstatus': '' }, zustandsText(posten)),
    u.struktur && el('p', { class: 'history-answer' }, `Frühere Darstellungsrückmeldung: ${u.struktur.urteil || ''} ${u.struktur.notiz || ''}`),
    korrekturen[posten.id] && korrekturen[posten.id].revision !== posten.revision && el('section', { class: 'answer-history' },
      el('h4', {}, 'Darstellungskorrekturen zur früheren Fassung'), el('pre', {}, JSON.stringify(korrekturen[posten.id].felder, null, 2))),
    el('div', { class: 'answer-actions' },
      el('button', { type: 'button', class: 'knopf', 'data-aktion': 'kopieren' }, 'Für Gespräch kopieren'),
      el('button', { type: 'button', class: 'knopf', 'data-aktion': 'zuruecksetzen', hidden: !hatEingabe(gespeichert) }, 'Antwort zurücksetzen, Verlauf behalten')));
}

function quellAdresse(posten) {
  const name = typeof daten.source === 'string' ? daten.source.split(/[\\/]/).at(-1) : '';
  if (!name || !/^[^<>:"/\\|?*\x00-\x1F#]+\.md$/i.test(name) || name.startsWith('.')) return null;
  return `sources.html#path=${encodeURIComponent(name)}${posten.anker ? `&anchor=${encodeURIComponent(posten.anker)}` : ''}`;
}

function kartenTitel(posten) {
  return aktuelleKorrektur(posten)?.titel?.neu
    || posten.frageKurz
    || (posten.struktur?.form === 'bestaetigung' ? posten.frage : anzeigeTitel(posten));
}

/** Title, derived fields, and wording of a point, shared by the detail card and the review stage. */
function kartenKern(posten, titel) {
  const s = posten.struktur;
  const source = quellAdresse(posten);
  const materialMissing = ['sicht', 'lesen'].includes(formVon(posten))
    && !zieleFuer(posten).vorn.length && !projektOberflaeche(posten);
  const question = posten.frageKurz || posten.frage;
  const repeatedQuestion = kartenTitel(posten).replace(/[.?!\s]+$/, '') === question.replace(/[.?!\s]+$/, '');
  const fields = s && felderKnoten(s, posten);
  return [
    standalone && el('a', { class: 'detail-project-context', href: `start.html#projekt=${encodeURIComponent(posten.projekt)}` }, projekte.get(posten.projekt)?.name || posten.projekt),
    titel,
    aktuelleKorrektur(posten)?.titel && el('small', {}, 'Titel korrigiert'),
    !repeatedQuestion && el('p', { class: 'decision-question' }, question),
    source && el('a', { href: source }, 'Originalquelle lesen'),
    materialMissing && el('small', {}, 'Prüfmaterial noch nicht verlinkt'),
    !s && posten.kontext && el('p', { class: 'detail-kontext' }, posten.kontext),
    !s && posten.voraussetzung && el('dl', { class: 'felder' }, el('dt', {}, 'Setzt voraus'),
      el('dd', {}, posten.voraussetzung)),
    fields,
  ];
}

function zeigeStelle(knopf) {
  const karte = knopf.closest('[data-karte]');
  const posten = daten.posten.find((p) => p.id === karte.dataset.karte);
  const existing = knopf.parentElement.querySelector('[data-snippet]');
  if (existing) { existing.remove(); knopf.setAttribute('aria-expanded', 'false'); return; }
  const exact = wortlautVon(posten).includes(knopf.dataset.spanne);
  const excerpt = el('blockquote', { class: 'source-excerpt', 'data-snippet': '', tabindex: '-1' },
    exact ? knopf.dataset.spanne : 'Diese Textstelle ist im aktuellen Wortlaut nicht mehr vorhanden.');
  knopf.parentElement.append(excerpt);
  knopf.setAttribute('aria-expanded', 'true');
  excerpt.focus();
}

function zeichneDetail() {
  const feld = $('detail');
  const posten = daten.posten.find((p) => p.id === zustand.auswahl);
  if (!posten) {
    delete feld.dataset.karte;
    feld.replaceChildren(el('h2', { id: 'h-detail' }, 'Kein Punkt gewählt'));
    return;
  }
  renderDetail(feld, posten);
}

function renderDetail(feld, posten) {
  feld.dataset.karte = posten.id;
  feld.replaceChildren(...[
    ...kartenKern(posten, el('h2', { id: 'h-detail', class: 'detail-frage', tabindex: '-1' }, kartenTitel(posten))),
    zieleKnoten(posten),
    el('section', { class: 'detail-block', 'aria-label': 'Urteil' }, urteilFormular(posten)),
    nachweiseKnoten(posten),
    el('p', { role: 'alert', 'data-storage-error': '', hidden: !storageProblem }, storageProblem),
    el('p', { role: 'status', 'data-detail-message': '' }),
  ].filter(Boolean));
  bindeDetail(feld);
  window.SOURCE_PREVIEWS?.mount(feld);
}

// Review stage: one live page, and beside it every point of its project.
function zeichneBuehneListe() {
  const posten = daten.posten.find((p) => p.id === buehne.posten);
  const eigene = daten.posten.filter((p) => p.projekt === posten.projekt);
  $('pb-liste').replaceChildren(...eigene.map((p) => el('li', {}, el('button', {
    type: 'button',
    class: 'pb-posten',
    'data-buehne-posten': p.id,
    'aria-current': p.id === buehne.posten ? 'true' : null,
  }, marke(p), el('span', { class: 'pb-posten-text' }, kurz(anzeigeTitel(p), 90))))));
}

function zeichneBuehneSeite() {
  const posten = daten.posten.find((p) => p.id === buehne.posten);
  zeichneBuehneListe();
  $('pb-posten').dataset.karte = posten.id;
  $('pb-posten').replaceChildren(...[
    ...kartenKern(posten, el('h3', { class: 'pb-frage', id: 'pb-frage', tabindex: '-1' }, kartenTitel(posten))),
    urteilFormular(posten),
  ].filter(Boolean));
  bindeDetail($('pb-posten'));
  window.SOURCE_PREVIEWS?.mount($('pb-posten'));
}

function oeffneBuehne(url, label) {
  if (!einbettbar(url)) return;
  const pointId = standalone ? zustand.auswahl : mounted?.pointId;
  const posten = daten.posten.find((p) => p.id === pointId);
  if (!posten) return;
  Object.assign(buehne, { url, label, posten: posten.id });
  $('pb-titel').textContent = `${projekte.get(posten.projekt).name}, ${label}`;
  $('pb-extern').href = url;
  $('pb-extern').textContent = url.replace(/^https:\/\//, '');
  $('pb-rahmen').title = label;
  $('pb-rahmen').src = url;
  zeichneBuehneSeite();
  $('pruefbuehne').showModal();
}

function bindeGeteilteDialoge() {
  if (sharedDialogsBound || typeof document.addEventListener !== 'function') return;
  sharedDialogsBound = true;
  document.addEventListener('click', (event) => {
    const target = event.target.closest?.('button');
    if (target?.id === 'export-oeffnen' && $('export-dialog')) {
      openExport();
    } else if (target?.id === 'export-kopieren') kopiere($('export-text').value);
  });
  document.addEventListener('change', (event) => {
    if (event.target.name === 'pb-breite' && $('pb-flaeche')) $('pb-flaeche').dataset.breite = event.target.value;
  });
  $('pruefbuehne')?.addEventListener('close', () => {
    $('pb-rahmen').src = 'about:blank';
    mounted?.container.querySelector('[data-buehne-url]')?.focus();
  });
}

async function openExport() {
  await ready();
  const text = exportText(daten.posten, true);
  if ($('export-dialog')) {
    $('export-text').value = text;
    $('export-dialog').showModal();
  }
  return text;
}

function zeichneKopf() {
  $('stand').textContent = daten.stand ? `Quellenstand ${datum(daten.stand)}` : 'Quellenstand undatiert';
  $('stand').title = 'Geladener Snapshot aus ACTIVE-WORK; Änderungen erscheinen nach erneuter Erzeugung.';
  $('export-oeffnen').disabled = !Object.values(urteile).some(hatGespeicherteEingabe) && !Object.keys(korrekturen).length
    && !fruehereNachweise().length;
  window.SECOND_BRAIN?.status?.();
}

// Re-rendering replaces the focused node, so focus returns to its successor.
function zeichneMarken() {
  if (!standalone) return;
  const aktiv = document.activeElement;
  const halter = aktiv?.closest?.('#matrix, #liste, #filter');
  const schluessel = aktiv?.dataset?.id ? `[data-id="${CSS.escape(aktiv.dataset.id)}"]`
    : aktiv?.dataset?.form ? `[data-form="${CSS.escape(aktiv.dataset.form)}"]`
      : aktiv?.dataset?.projekt ? `[data-projekt="${CSS.escape(aktiv.dataset.projekt)}"]` : null;
  zeichneMatrix();
  zeichneFilter();
  zeichneListe();
  zeichneKopf();
  const relationToggle = $('project-relations-toggle');
  if (relationToggle) {
    relationToggle.checked = zustand.relations;
    relationToggle.closest('label').hidden = zustand.view !== 'matrix';
  }
  window.PROJECT_RELATIONS?.update({
    project: zustand.projekt || daten.posten.find((point) => point.id === zustand.auswahl)?.projekt || '',
    records: window.SECOND_BRAIN?.relations || [], warnings: window.SECOND_BRAIN?.relationWarnings || [],
    matrix: $('matrix'), host: $('project-relations'), enabled: zustand.relations && zustand.view === 'matrix',
  });
  if (halter && schluessel) (halter.querySelector(schluessel) || $('liste').querySelector('.zeile'))?.focus();
}

function waehle(id, fokusDetail) {
  zustand.auswahl = id;
  if (id && !sichtbar().some((p) => p.id === id)) {
    Object.assign(zustand, { form: null, projekt: daten.posten.find((p) => p.id === id)?.projekt || null,
      route: 'all', status: 'all' });
  }
  zeichneMarken();
  zeichneDetail();
  $('liste').querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest' });
  if (fokusDetail) $('h-detail')?.focus();
  sichereKontext();
}

function haltAuswahl() {
  const reihe = sichtbar();
  if (!reihe.some((p) => p.id === zustand.auswahl)) zustand.auswahl = reihe[0]?.id ?? null;
  zeichneMarken();
  zeichneDetail();
  sichereKontext();
}

function sichereKontext() {
  ARBEITSKONTEXT.schreibe('punkte', { id: zustand.auswahl, projekt: zustand.projekt || '', form: zustand.form,
    route: zustand.route, status: zustand.status, view: zustand.view, relations: zustand.relations });
  ARBEITSKONTEXT.links(zustand.projekt || daten.posten.find((p) => p.id === zustand.auswahl)?.projekt || '');
}

const einzeilig = (text) => text.trim().replace(/\s*\n\s*/g, ' ');

function fruehereNachweise() {
  const ids = new Set(daten.posten.map((point) => point.id));
  return (window.SECOND_BRAIN?.progress || []).filter((receipt) => !ids.has(receipt.pointId));
}

function blockFuer(posten) {
  const u = urteile[posten.id] || {};
  const wahl = wahlFuer(posten);
  const s = posten.struktur;
  const zeilen = [`- ${posten.typ}: ${kurz(posten.frage, 200)}${posten.anker ? ` (^${posten.anker})` : ''}`, `  Urteil: ${urteilText(posten) || 'offen'}`];
  zeilen.push(`  Punktrevision: ${posten.revision}`);
  if (gueltigesUrteil(posten, u) && u.option != null) zeilen.push(`  Gewählt: ${u.optionText || textVon(s.optionen[u.option])}`);
  if (hatEingabe(u) && !gueltigesUrteil(posten, u)) zeilen.push(`  Frühere Antwort (nicht für den aktuellen Stand): ${einzeilig(historischerText(u))}`);
  for (const h of u.historie || []) zeilen.push(`  Frühere Antwort: ${einzeilig(historischerText(h))}`);
  for (const teil of s?.teile || []) {
    const t = aktuellesUrteil(posten).teile?.[teil.id];
    if (t?.urteil || t?.notiz) zeilen.push(`  - ${textVon(teil)}: ${[t.urteil === 'beantwortet' ? wahl.antwort : t.urteil, t.notiz && einzeilig(t.notiz)].filter(Boolean).join(', ')}`);
  }
  if (gueltigesUrteil(posten, u) && u.notiz?.trim()) zeilen.push(`  ${wahl.notiz}: ${einzeilig(u.notiz)}`);
  if (gueltigesUrteil(posten, u) && u.struktur?.urteil) zeilen.push(`  Struktur der Karte: ${[u.struktur.urteil === 'passt' ? 'passt' : 'stimmt nicht', u.struktur.notiz && einzeilig(u.struktur.notiz)].filter(Boolean).join(', ')}`);
  for (const [feld, k] of Object.entries(korrekturen[posten.id]?.felder || {})) {
    zeilen.push(`  Darstellungskorrektur${korrekturen[posten.id].revision !== posten.revision ? ' (früherer Stand)' : ''}, ${feld}: ${einzeilig(k.original)} → ${einzeilig(k.neu)}`);
  }
  return zeilen.join('\n');
}

// The block has to stand on its own in a session that never saw this view,
// so every point carries its project, its wording, and its anchor.
function exportText(auswahl, mitNichtZugeordneten = false) {
  const kopf = `Antworten aus der ACTIVE-WORK-UI (ACTIVE-WORK, Quellenstand ${daten.stand || 'undatiert'})\nSnapshot: ${daten.snapshotRevision}`;
  const teile = [];
  for (const projekt of projektReihenfolge()) {
    const eigene = auswahl.filter((p) => p.projekt === projekt.id && (hatGespeicherteEingabe(urteile[p.id]) || korrekturen[p.id]));
    if (eigene.length) teile.push([projekt.name, ...eigene.map(blockFuer)].join('\n'));
  }
  if (mitNichtZugeordneten) {
    const aktuell = new Set(daten.posten.map((p) => p.id));
    const ids = [...new Set([...Object.keys(urteile), ...Object.keys(korrekturen)])]
      .filter((id) => !aktuell.has(id) && (hatGespeicherteEingabe(urteile[id]) || korrekturen[id]));
    if (ids.length) teile.push([
      'Nicht mehr zuordenbare historische Eingaben',
      'Diese Speicherkennungen fehlen im geladenen Datenstand. Ihre frühere Quelle ist hier nicht auflösbar. Die gespeicherten Angaben sind keine aktuellen Entscheidungen.',
      ...ids.map((id) => `Speicherkennung: ${id}\n${JSON.stringify({ antwort: urteile[id], korrektur: korrekturen[id] }, null, 2)}`),
    ].join('\n\n'));
    const receipts = fruehereNachweise();
    if (receipts.length) teile.push(['Frühere Nachweise',
      'Diese Punkte fehlen im aktuellen Datenstand. Die Nachweise bestätigen keine aktuelle Frage.',
      ...receipts.map((receipt) => [
        `Punktkennung: ${receipt.pointId}`, `Frühere Punktrevision: ${receipt.pointRevision}`,
        `Nachweis: ${receipt.stage}`, receipt.summary,
        ...(receipt.evidence || []).map((evidence) => `Beleg: ${evidence.root} / ${evidence.path}`),
        ...(receipt.problems || []).map((problem) => `Prüfhinweis: ${problem}`),
      ].filter(Boolean).join('\n')),
    ].join('\n\n'));
  }
  return [kopf, ...teile].join('\n\n');
}

// Copying leaves no visible trace, so it is the one action that reports success.
async function kopiere(text) {
  try {
    await navigator.clipboard.writeText(text);
    melde('In der Zwischenablage.');
  } catch {
    if (!$('export-dialog')) {
      const target = mounted?.container;
      if (!target) return;
      const field = el('textarea', { readonly: true, rows: '6', 'aria-label': 'Text für das Gespräch' });
      field.value = text; target.append(field); field.focus(); field.select();
      melde('Text zum Kopieren markiert.');
      return;
    }
    $('export-text').value = text;
    $('export-dialog').showModal();
    $('export-text').select();
    melde('Zwischenablage gesperrt, Text ist markiert.');
  }
}

/** Merges one change into the stored verdict of the form's point and redraws what mirrors it. */
function schreibeUrteil(form, aenderung) {
  if (typeof aenderung !== 'function' && !('empfehlungTitel' in aenderung)
    && ['urteil', 'option', 'notiz'].some((key) => key in aenderung)) aenderung = { ...aenderung, empfehlungTitel: null };
  const onSaved = mounted?.onSaved;
  return reiheSpeichern(() => schreibeUrteilJetzt(form, aenderung, onSaved));
}

// The browser store stays primary. The local service keeps a copy a session can read, because it cannot see this
// browser. Notes save on every keystroke, so the hand-over waits for a pause and sends the latest record per point.
const eingangWartend = new Map();
function uebergibAnEingang(id, answer, statusNode) {
  if (statusNode) statusNode.textContent = 'Demo-Antwort in diesem Browser gespeichert. '
    + 'Über Antworten exportieren kannst du sie sichern.';
}

async function schreibeUrteilJetzt(form, aenderung, onSaved) {
  const id = form.dataset.posten;
  const posten = daten.posten.find((p) => p.id === id);
  const vorhanden = urteile[id];
  const alt = gueltigesUrteil(posten, vorhanden) ? vorhanden : { urteil: '', notiz: '',
    historie: vorhanden ? [...(vorhanden.historie || []), { ...vorhanden, historie: undefined }] : [] };
  if (typeof aenderung === 'function') aenderung = aenderung(alt);
  const neu = { ...alt, ...aenderung, revision: posten.revision, quellenwortlaut: wortlautVon(posten),
    am: new Date().toISOString().slice(0, 10) };
  if ('option' in aenderung) {
    const option = posten.struktur?.optionen?.[aenderung.option];
    neu.optionText = option ? textVon(option) : null;
    neu.optionIdentitaet = option ? JSON.stringify({ text: textVon(option), spanne: option.spanne }) : null;
  }
  if (aenderung.teile) neu.urteil = gesamtAusTeilen(posten, neu.teile);
  const gesichert = await sichereEingabe(SPEICHER, id, neu, vorhanden);
  form.querySelector('[data-speicherstatus]').textContent = gesichert ? 'Antwort lokal gespeichert. Übernahme noch nicht bestätigt.' : 'Nicht gespeichert. Eingabe im Formular sichern.';
  if (!gesichert) return;
  uebergibAnEingang(id, neu, form.querySelector('[data-speicherstatus]'));
  // Only the marks redraw; the form stays, so the caret keeps its place.
  zeichneMarken();
  if ($('pruefbuehne')?.open) zeichneBuehneListe();
  const confirmation = form.querySelector('[name="empfehlung"]');
  if (confirmation) confirmation.checked = empfehlungBestaetigt(posten, neu);
  for (const choice of form.querySelectorAll('[name="urteil"]')) {
    choice.checked = !(!posten.struktur?.optionen && empfehlungBestaetigt(posten, neu))
      && choice.value === (neu.option != null ? `option:${neu.option}` : neu.urteil);
  }
  for (const node of document.querySelectorAll(`[data-work-state="${CSS.escape(id)}"]`)) node.textContent = zustandsText(posten);
  const label = form.querySelector('[data-notiz-label]');
  if (label) label.textContent = notizLabel(posten, neu);
  for (const part of posten.struktur?.teile || []) {
    const input = form.querySelector(`[name="teilnotiz:${part.id}"]`);
    if (input) { input.placeholder = notizLabel(posten, neu.teile?.[part.id]); input.setAttribute('aria-label', `${input.placeholder} zu ${textVon(part)}`); }
  }
  for (const knopf of form.querySelectorAll('[data-aktion="zuruecksetzen"]')) knopf.hidden = !hatEingabe(neu);
  onSaved?.({ answers: urteile, pointId: id });
}

function schreibeTeil(form, teilId, aenderung) {
  return schreibeUrteil(form, (current) => ({ teile: { ...current.teile,
    [teilId]: { ...current.teile?.[teilId], ...aenderung } } }));
}

function bindeDetail(root) {
  if (boundDetails.has(root)) return;
  boundDetails.add(root);
  root.addEventListener('submit', (e) => { if (e.target.matches('form.urteil')) e.preventDefault(); });
  root.addEventListener('click', (e) => {
    const ziel = e.target.closest('button');
    if (!ziel) return;
    const daten_ = ziel.dataset;
    if (daten_.spanne) zeigeStelle(ziel);
    else if (daten_.buehneUrl) oeffneBuehne(daten_.buehneUrl, daten_.buehneLabel);
    else if (daten_.aktion === 'kopieren') kopiere(exportText(daten.posten.filter((p) => p.id === ziel.form.dataset.posten)));
    else if (daten_.aktion === 'zuruecksetzen') {
      const id = ziel.form.dataset.posten;
      const originalForm = ziel.form;
      const onSaved = mounted?.onSaved;
      reiheSpeichern(async () => {
        const vorher = urteile[id];
        const neu = { revision: daten.posten.find((p) => p.id === id).revision, urteil: '', notiz: '',
          historie: [...(vorher?.historie || []), ...(vorher ? [{ ...vorher, historie: undefined }] : [])] };
        if (!await sichereEingabe(SPEICHER, id, neu, vorher)) return;
        zeichneMarken();
        const samePoint = standalone ? ($('pruefbuehne')?.open ? buehne.posten === id : zustand.auswahl === id)
          : mounted?.pointId === id && mounted.container.contains(originalForm);
        if (originalForm.isConnected && samePoint) {
          if ($('pruefbuehne')?.open) { zeichneBuehneSeite(); $('pb-frage').focus(); }
          else if (standalone) { zeichneDetail(); $('h-detail')?.focus(); } else refresh();
        }
        onSaved?.({ answers: urteile, pointId: id });
      });
    }
  });

  root.addEventListener('change', (e) => {
    const { name, value, checked, form } = e.target;
    if (name === 'empfehlung') uebernehmeEmpfehlung(form, checked);
    else if (name === 'urteil' && value.startsWith('option:')) schreibeUrteil(form, { urteil: 'beantwortet', option: Number(value.slice(7)) });
    else if (name === 'urteil') schreibeUrteil(form, { urteil: value, option: null });
    else if (name?.startsWith('teil:')) schreibeTeil(form, name.slice(5), { urteil: value });
  });

  root.addEventListener('input', (e) => {
    const { name, value, form } = e.target;
    if (name === 'notiz') schreibeUrteil(form, { notiz: value });
    else if (name?.startsWith('teilnotiz:')) schreibeTeil(form, name.slice(10), { notiz: value });
  });

}

function binde() {
  document.addEventListener('click', (e) => {
    const ziel = e.target.closest('button');
    if (!ziel) return;
    const data = ziel.dataset;
    if (data.id) waehle(data.id, true);
    else if (data.form) { zustand.form = zustand.form === data.form ? null : data.form; haltAuswahl(); }
    else if (data.projekt) { zustand.projekt = zustand.projekt === data.projekt ? null : data.projekt; haltAuswahl(); }
    else if (data.loesche) { zustand[data.loesche] = null; haltAuswahl(); $('liste').querySelector('.zeile')?.focus(); }
    else if (data.buehnePosten) { buehne.posten = data.buehnePosten; zeichneBuehneSeite(); $('pb-frage').focus(); }
    else if (ziel.id === 'export-oeffnen') { $('export-text').value = exportText(daten.posten, true); $('export-dialog').showModal(); }
    else if (ziel.id === 'export-kopieren') kopiere($('export-text').value);
  });
  document.addEventListener('change', (e) => {
    const { name, value, checked } = e.target;
    if (name === 'work-route' && checked) { zustand.route = value; haltAuswahl(); }
    else if (name === 'work-status' && checked) { zustand.status = value; haltAuswahl(); }
    else if (name === 'work-view' && checked) { zustand.view = value; zeichneMarken(); sichereKontext(); }
    else if (name === 'project-relations') { zustand.relations = checked; zeichneMarken(); sichereKontext(); }
    else if (name === 'pb-breite') $('pb-flaeche').dataset.breite = value;
  });
  $('liste').addEventListener('keydown', (e) => {
    const zeilen = [...$('liste').querySelectorAll('.zeile')];
    const stelle = zeilen.indexOf(document.activeElement);
    const neu = { ArrowDown: stelle + 1, ArrowUp: stelle - 1, Home: 0, End: zeilen.length - 1 }[e.key];
    if (stelle < 0 || neu === undefined || !zeilen[neu]) return;
    e.preventDefault();
    const id = zeilen[neu].dataset.id;
    zeilen[neu].focus();
    waehle(id, false);
  });

  // Closing the stage stops the page and carries the last point back.
  $('pruefbuehne').addEventListener('close', () => {
    $('pb-rahmen').src = 'about:blank';
    zustand.auswahl = buehne.posten;
    zeichneMarken();
    zeichneDetail();
    sichereKontext();
    $('detail').querySelector('[data-buehne-url]')?.focus();
  });

  // Brushing: a point lights up in matrix and list together.
  for (const [ein, aus] of [['pointerover', 'pointerout'], ['focusin', 'focusout']]) {
    document.addEventListener(ein, (e) => hebe(e.target.closest?.('[data-id]')?.dataset.id, true));
    document.addEventListener(aus, (e) => hebe(e.target.closest?.('[data-id]')?.dataset.id, false));
  }
}

function hebe(id, an) {
  if (!id) return;
  for (const knoten of document.querySelectorAll(`[data-id="${CSS.escape(id)}"]`)) knoten.classList.toggle('hervor', an);
}

async function initialise() {
  await window.SECOND_BRAIN?.ready;
  if (!daten || !Array.isArray(daten.posten)) {
    speicherFehler('Die Fragen konnten nicht geladen werden.');
    return;
  }
  for (const eintrag of daten.eintraege) projekte.set(eintrag.id, eintrag);
  Object.assign(wartezeit, skalaVon(daten.posten));
  const answers = window.WORK_STORAGE.read(SPEICHER);
  const corrections = window.WORK_STORAGE.read(KORREKTUREN);
  urteile = answers.data;
  korrekturen = corrections.data;
  if (!answers.ok || !corrections.ok) speicherFehler(answers.error || corrections.error);
  window.addEventListener('work-progress-changed', () => {
    zeichneMarken();
    if (!document.activeElement?.closest('form.urteil')) { if (standalone) zeichneDetail(); else refresh(); }
  });
  window.addEventListener('storage', (event) => {
    if (event.key !== SPEICHER && event.key !== KORREKTUREN && event.key !== null) return;
    const answersNow = window.WORK_STORAGE.read(SPEICHER);
    const correctionsNow = window.WORK_STORAGE.read(KORREKTUREN);
    if (!answersNow.ok || !correctionsNow.ok) { speicherFehler(answersNow.error || correctionsNow.error); return; }
    if (document.activeElement?.closest('form.urteil')) {
      speicherFehler('Gespeicherte Eingaben haben sich in einem anderen Tab geändert. Deine Eingabe bleibt im Formular. Sichere sie vor dem erneuten Laden.');
      return;
    }
    urteile = answersNow.data;
    korrekturen = correctionsNow.data;
    zeichneMarken(); if (standalone) zeichneDetail(); else refresh();
  });
}

function ready() { return initialisation ||= initialise(); }

async function mount(container, pointId, { onSaved } = {}) {
  const version = ++mountVersion;
  await ready();
  if (version !== mountVersion) return;
  mounted = { container, pointId, onSaved };
  bindeGeteilteDialoge();
  container.classList.add('work-detail');
  refresh();
}

function unmount() {
  mountVersion++;
  mounted = null;
}

function refresh() {
  if (!mounted) return;
  const point = daten.posten.find(p => p.id === mounted.pointId);
  if (!point) { mounted.container.replaceChildren(el('p', {}, 'Diese Frage ist nicht mehr verfügbar.')); return; }
  renderDetail(mounted.container, point);
}

async function start() {
  standalone = true;
  await ready();
  binde(); folgeAdresse();
  window.addEventListener('hashchange', folgeAdresse);
  window.addEventListener('popstate', folgeAdresse);
}

// The address configures the view, so the start page and an agent session can
// open one point, one project, or one kind of work: index.html#id=<anchor>,
// #projekt=<id>, #form=<form>.
function folgeAdresse() {
  const wunsch = ARBEITSKONTEXT.lese('punkte');
  zustand.projekt = projekte.has(wunsch.projekt) ? wunsch.projekt : null;
  zustand.form = achsen().includes(wunsch.form) ? wunsch.form : FORM_ARBEITSART[wunsch.form] || null;
  zustand.route = ['human', 'agent', 'all'].includes(wunsch.route) ? wunsch.route : 'human';
  zustand.status = ['all', 'open', 'answered', 'revisit', 'adoption', 'implementation', 'validation'].includes(wunsch.status) ? wunsch.status : 'all';
  zustand.view = wunsch.view === 'list' ? 'list' : 'matrix';
  zustand.relations = wunsch.relations === true || wunsch.relations === 'true';
  if (!wunsch.status && (wunsch.nurOffene === true || wunsch.nurOffene === 'true')) zustand.status = 'open';
  zustand.auswahl = daten.posten.some((p) => p.id === wunsch.id) ? wunsch.id : null;
  const explicitPoint = new URLSearchParams(location.hash.slice(1)).has('id');
  if (zustand.auswahl && explicitPoint) waehle(zustand.auswahl, false); else haltAuswahl();
}

bindeGeteilteDialoge();
if (document.body?.classList?.contains('work-page') && $('work-layout')) start();
return Object.freeze({ mount, unmount, refresh, openExport, get ready() { return ready(); } });
})();
