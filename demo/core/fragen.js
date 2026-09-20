'use strict';

// The questions page. Each tab is one question, answered from the units of
// work and the statements between them (knowledge/data.md). The address
// configures it, fragen.html#frage=wirkung&projekt=example-project, and an agent session
// can answer a free question by writing sicht.js (knowledge/specification.md).
// gemeinsam.js supplies $, el, svg, datum, kurz, titelVon, markeVon, skalaVon, ladeUrteile, FORMNAMEN.

/**
 * @typedef {{id: string, art: string, titel: string, teilVon: ?string, amZug: ?string, herkunft: string, antwortart?: ?string, datum?: string}} Einheit
 * @typedef {{von: string, relation: string, nach: string, herkunft: string, spanne: string, fundstelle: string}} Aussage
 * @typedef {{frage: string, antwort?: string, sicht: string, projekt?: ?string, einheiten?: ?string[]}} Wunsch
 */

const FRAGEN = ['anliegen', 'wirkung', 'beteiligte', 'antwort'];
const GRENZE = 110;
const AM_ZUG = { du: 'du', agent: 'Agent', dritte: 'andere', offen: 'du oder ein Agent' };
const SPALTEN = [
  { id: 'dich', titel: 'Du bist am Zug', passt: (u) => u.amZug === 'du' },
  { id: 'bereit', titel: 'Offen für dich oder einen Agenten', passt: (u) => u.amZug === 'offen' || u.amZug === 'agent' },
  { id: 'andere', titel: 'Andere sind am Zug', passt: (u) => u.amZug === 'dritte' },
];

const daten = window.PRUEFANSICHT;
/** @type {?Wunsch} */
let wunsch = null;
let wunschUngueltig = false;
const zustand = { frage: 'anliegen', projekt: '' };
/** @type {Map<string, Einheit>} */
const einheiten = new Map();
const postenNachId = new Map();
let urteile = {};
let skala = { min: 0, max: 0 };

const abhaengig = () => daten.aussagen.filter((a) => a.relation === 'haengt_ab_von' && einheiten.has(a.von) && einheiten.has(a.nach));
// Answering a point does not verify that its material prerequisite was fulfilled.
const brauchtNoch = (id) => abhaengig().filter((a) => a.von === id).map((a) => einheiten.get(a.nach));
const kinder = (id) => daten.einheiten.filter((u) => u.teilVon === id);
const auswahlVon = (id, nur) => !nur || nur.has(id)
  ? kinder(id)
  : daten.einheiten.filter((u) => nur.has(u.id) && eintragVon(u) === id && u.id !== id);

/** The entry a unit belongs to, through any depth of "part of". */
function eintragVon(u) {
  let oben = u;
  const besucht = new Set();
  while (oben?.teilVon) {
    if (besucht.has(oben.id)) return null;
    besucht.add(oben.id);
    oben = einheiten.get(oben.teilVon);
  }
  return oben?.id || null;
}

/** Validate data instructions before they can change the current view. */
function pruefeViewSpec(spec, bestand) {
  const fehler = (grund) => ({ ok: false, fehler: grund });
  if (!spec || typeof spec !== 'object' || Array.isArray(spec)) return fehler('Die Ansicht muss ein Objekt sein.');
  const erlaubt = ['frage', 'antwort', 'sicht', 'projekt', 'einheiten', 'lauf'];
  if (Object.keys(spec).some((k) => !erlaubt.includes(k))) return fehler('Unbekanntes Feld in der Ansicht.');
  if (typeof spec.frage !== 'string' || !spec.frage.trim()) return fehler('Die Frage fehlt.');
  if (spec.antwort !== undefined && typeof spec.antwort !== 'string') return fehler('Die Antwort muss Text sein.');
  if (!['anliegen', 'wirkung', 'beteiligte'].includes(spec.sicht)) return fehler('Unbekannte Sicht.');
  const projekte = new Set(bestand.eintraege.map((e) => e.id));
  if (spec.projekt != null && !projekte.has(spec.projekt)) return fehler('Unbekanntes Projekt.');
  const bekannte = new Map(bestand.einheiten.map((e) => [e.id, e]));
  if (spec.einheiten != null) {
    if (!Array.isArray(spec.einheiten) || spec.einheiten.some((id) => typeof id !== 'string' || !bekannte.has(id))) return fehler('Unbekannte Einheit.');
    if (new Set(spec.einheiten).size !== spec.einheiten.length) return fehler('Doppelte Einheit.');
    for (const id of spec.einheiten) {
      let u = bekannte.get(id);
      const gesehen = new Set();
      while (u?.teilVon) {
        if (gesehen.has(u.id)) return fehler('Zyklische Einheitenzuordnung.');
        gesehen.add(u.id);
        u = bekannte.get(u.teilVon);
      }
      if (!u || !projekte.has(u.id) || (spec.projekt != null && u.id !== spec.projekt)) return fehler('Einheit gehört nicht zum gewählten Projekt.');
    }
  }
  if (spec.lauf != null) {
    const lauf = spec.lauf;
    if (typeof lauf !== 'object' || Array.isArray(lauf) || Object.keys(lauf).some((k) => !['name', 'quellen'].includes(k))) return fehler('Ungültiger Lauf.');
    if (typeof lauf.name !== 'string' || !lauf.name.trim() || !Array.isArray(lauf.quellen) || lauf.quellen.length === 0) return fehler('Laufname oder Quellen fehlen.');
    if (lauf.quellen.some((q) => typeof q !== 'string' || !q.trim() || /^(?:[a-z]+:|[\\/])/i.test(q) || q.split(/[\\/]/).includes('..'))) return fehler('Laufquellen müssen relative Vault-Pfade sein.');
  }
  return { ok: true, wert: JSON.parse(JSON.stringify(spec)) };
}

function ungeprueftZeichen() {
  const beschreibung = 'Keine Abhängigkeit erfasst; Voraussetzungen ungeprüft';
  return el('span', { class: 'voraussetzung-offen', role: 'img', title: beschreibung, 'aria-label': beschreibung }, '?');
}

function einheitKnoten(u) {
  const posten = postenNachId.get(u.id);
  const wartet = brauchtNoch(u.id);
  const teile = kinder(u.id).length;
  const neben = [
    posten && FORMNAMEN[u.antwortart || 'prosa'],
    teile > 0 && `${teile} Teile`,
    u.datum && datum(u.datum),
    wartet.length > 0 && `wartet auf erfasste Voraussetzung: ${wartet.map((w) => kurz(w.titel, 60)).join(', ')}`,
  ].filter(Boolean).join(', ');
  // A step keeps the wording of ACTIVE-WORK, which can run long; its first clause stands in front, the rest one step away.
  const titel = posten
    ? el('a', { class: 'einheit-titel', href: `index.html#id=${encodeURIComponent(u.id)}` }, el('span', { class: 'punkt-ruhe' }, markeVon(posten, urteile, skala)), u.titel)
    : u.titel.length > GRENZE
      ? el('details', {}, el('summary', { class: 'einheit-titel' }, kurz(u.titel.split(/[,;(]/)[0], GRENZE)), el('p', {}, u.titel))
      : el('span', { class: 'einheit-titel' }, u.titel);
  return el('li', { class: wartet.length ? 'einheit wartet' : 'einheit', 'data-einheit': u.id }, titel,
    !wartet.length && ungeprueftZeichen(), neben && el('span', { class: 'einheit-neben' }, neben));
}

function zieleVon(eintrag) {
  const ziele = [...eintrag.pruefziele, eintrag.repoUrl && { label: 'Repository', url: eintrag.repoUrl }, eintrag.vaultUrl && { label: 'Projektdokument', url: eintrag.vaultUrl }].filter(Boolean);
  if (!ziele.length) return null;
  return el('ul', { class: 'ziele-liste', role: 'list' }, ...ziele.map((z) => el('li', {},
    el('a', { class: 'ziel', href: z.url, target: '_blank', rel: 'noopener noreferrer', title: z.notiz || null }, z.label))));
}

/**
 * The way back into a dialogue: the places this entry rests on, as the command
 * that prepares a Second Brain run from them. The exporter takes vault-relative
 * paths as sources; the operator puts his question in before running it.
 */
function laufBefehl(eintrag) {
  const quellen = [eintrag.notizPfad, daten.source].filter(Boolean);
  const name = `${eintrag.id}-${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')}`;
  const frage = zustand.frage === 'antwort' && wunsch ? wunsch.frage : 'DEINE FRAGE';
  return `python tools/second_brain.py context --name ${name} --question "${frage.replace(/"/g, "'")}" ${quellen.map((q) => `--source "${q}"`).join(' ')}`;
}

// Copying leaves no visible trace, so the button itself reports it; a blocked clipboard shows the text to copy by hand.
async function kopiere(text, knopf) {
  try {
    await navigator.clipboard.writeText(text);
    const vorher = knopf.textContent;
    knopf.textContent = 'In der Zwischenablage';
    setTimeout(() => { knopf.textContent = vorher; }, 2500);
  } catch {
    const feld = el('textarea', { class: 'befehl', readonly: true, rows: '3', 'aria-label': 'Befehl für Second Brain' });
    feld.value = text;
    knopf.replaceWith(feld);
    feld.select();
  }
}

function anliegenVon(eintrag, nur) {
  const eigene = auswahlVon(eintrag.id, nur);
  const [kurzprofil, ...mehr] = eintrag.kurzprofil || [];
  return el('section', { class: 'anliegen', 'data-eintrag': eintrag.id },
    el('h2', {}, eintrag.name, el('small', {}, [eintrag.bereich, eintrag.status].filter(Boolean).join(', '))),
    kurzprofil && el('p', { class: 'kurzprofil' }, kurzprofil),
    el('div', { class: 'lage' }, ...SPALTEN.map((spalte) => {
      const liste = eigene.filter(spalte.passt).sort((a, b) => brauchtNoch(a.id).length - brauchtNoch(b.id).length);
      return liste.length > 0 && el('section', { class: `lage-spalte lage-${spalte.id}` },
        el('h3', {}, spalte.titel), el('ul', { class: 'einheiten', role: 'list' }, ...liste.map(einheitKnoten)));
    })),
    zieleVon(eintrag),
    eintrag.notizPfad && el('a', { href: `sources.html#path=${encodeURIComponent(eintrag.notizPfad)}&projekt=${encodeURIComponent(eintrag.id)}` }, 'Projektnotiz lesen'));
}

function zeichneAnliegen(nur) {
  const eintraege = daten.eintraege.filter((e) => (!zustand.projekt || e.id === zustand.projekt) && (!nur || auswahlVon(e.id, nur).length));
  const ungeprueft = eintraege.some((e) => auswahlVon(e.id, nur).some((u) => !brauchtNoch(u.id).length));
  $('sicht').replaceChildren(...[
    ungeprueft && el('p', { class: 'voraussetzung-hinweis' }, '? Voraussetzungen ungeprüft'),
    ...eintraege.map((e) => anliegenVon(e, nur)),
  ].filter(Boolean));
}

/** Longest chain of open dependencies behind a unit; it sets the column the unit stands in. */
function tiefeVon(id, kanten, gesehen = new Set()) {
  if (gesehen.has(id)) return 0;
  gesehen.add(id);
  const davor = kanten.filter((a) => a.von === id).map((a) => 1 + tiefeVon(a.nach, kanten, new Set(gesehen)));
  return Math.max(0, ...davor);
}

function knotenVon(u, kanten) {
  const posten = postenNachId.get(u.id);
  const davor = kanten.filter((a) => a.von === u.id).map((a) => einheiten.get(a.nach).titel);
  const lage = brauchtNoch(u.id).length ? 'knoten-wartet' : u.amZug === 'dritte' ? 'knoten-andere' : 'knoten-ungeprueft';
  const inhalt = [
    posten && el('span', { class: 'punkt-ruhe' }, markeVon(posten, urteile, skala)),
    el('span', { class: 'knoten-titel' }, u.titel, !brauchtNoch(u.id).length && ungeprueftZeichen()),
    el('small', {}, posten ? FORMNAMEN[u.antwortart || 'prosa'] : AM_ZUG[u.amZug] || ''),
    brauchtNoch(u.id).length > 0 && el('small', { class: 'knoten-status' }, `wartet auf erfasste Voraussetzung: ${davor.join(', ')}`),
    davor.length > 0 && el('span', { class: 'unsichtbar' }, `, hängt ab von ${davor.join(', ')}`),
  ];
  return posten
    ? el('a', { class: `knoten ${lage}`, 'data-knoten': u.id, href: `index.html#id=${encodeURIComponent(u.id)}` }, ...inhalt)
    : el('div', { class: `knoten ${lage}`, 'data-knoten': u.id }, ...inhalt);
}

function netzVon(eintrag, kanten, nur) {
  const ids = [...new Set(kanten.flatMap((a) => [a.nach, a.von]))];
  const tiefe = new Map(ids.map((id) => [id, tiefeVon(id, kanten)]));
  // A unit nothing comes before moves next to the first unit that needs it, so no line runs through a column.
  for (const id of ids.filter((i) => tiefe.get(i) === 0)) {
    tiefe.set(id, Math.min(...kanten.filter((a) => a.nach === id).map((a) => tiefe.get(a.von))) - 1);
  }
  const spalten = [];
  for (const id of ids) (spalten[tiefe.get(id)] ||= []).push(einheiten.get(id));
  const frei = auswahlVon(eintrag.id, nur).filter((u) => !ids.includes(u.id));
  return el('section', { class: 'wirkung', 'data-eintrag': eintrag.id },
    el('h2', {}, eintrag.name),
    kanten.length > 0 && el('div', { class: 'netz' },
      svg('svg', { class: 'netz-kanten', 'aria-hidden': 'true' }),
      ...spalten.map((spalte) => el('div', { class: 'netz-spalte' }, ...spalte.map((u) => knotenVon(u, kanten))))),
    frei.length > 0 && el('section', { class: 'wirkung-frei' }, el('h3', {}, 'Keine Abhängigkeit erfasst'),
      el('ul', { class: 'einheiten', role: 'list' }, ...frei.map(einheitKnoten))));
}

// Boxes are laid out by the grid; the lines follow their measured places, so they are drawn after layout and again on every resize.
function zieheKanten() {
  for (const netz of document.querySelectorAll('.netz')) {
    const flaeche = netz.querySelector('.netz-kanten');
    const rand = netz.getBoundingClientRect();
    flaeche.setAttribute('viewBox', `0 0 ${rand.width} ${rand.height}`);
    const eintrag = netz.closest('[data-eintrag]').dataset.eintrag;
    const linien = abhaengig().filter((a) => eintragVon(einheiten.get(a.von)) === eintrag).map((a) => {
      const von = netz.querySelector(`[data-knoten="${CSS.escape(a.nach)}"]`)?.getBoundingClientRect();
      const nach = netz.querySelector(`[data-knoten="${CSS.escape(a.von)}"]`)?.getBoundingClientRect();
      if (!von || !nach) return null;
      const [x1, y1, x2, y2] = [von.right - rand.left, von.top + von.height / 2 - rand.top, nach.left - rand.left - 5, nach.top + nach.height / 2 - rand.top];
      const mitte = (x1 + x2) / 2;
      return svg('path', { class: a.herkunft === 'llm' ? 'kante kante-llm' : 'kante', d: `M${x1},${y1} C${mitte},${y1} ${mitte},${y2} ${x2},${y2}`, 'marker-end': 'url(#pfeil)' },
        svg('title', {}, a.spanne));
    });
    flaeche.replaceChildren(
      svg('defs', {}, svg('marker', { id: 'pfeil', viewBox: '0 0 8 8', refX: '7', refY: '4', markerWidth: '7', markerHeight: '7', orient: 'auto' },
        svg('path', { d: 'M0,0 L8,4 L0,8 z', class: 'kante-spitze' }))),
      ...linien.filter(Boolean));
  }
}

function zeichneWirkung(nur) {
  const teile = daten.eintraege.map((e) => {
    const kanten = abhaengig().filter((a) => eintragVon(einheiten.get(a.von)) === e.id && (!nur || nur.has(a.von) || nur.has(a.nach)));
    if (zustand.projekt && e.id !== zustand.projekt) return null;
    if (nur && !kanten.length && !auswahlVon(e.id, nur).length) return null;
    return netzVon(e, kanten, nur);
  }).filter(Boolean);
  $('sicht').replaceChildren(...teile);
  zieheKanten();
}

function zeichneBeteiligte(nur) {
  const zeilen = [];
  for (const e of daten.eintraege) {
    if (zustand.projekt && e.id !== zustand.projekt) continue;
    const parteien = daten.parteien.filter((p) => p.eintrag === e.id).map((p) => ({
      name: [p.rolle, p.institution].filter(Boolean).join(', '),
      woran: daten.aussagen.filter((a) => a.relation === 'beteiligt' && a.nach === p.id).map((a) => einheiten.get(a.von)).filter(Boolean),
    }));
    const zugeordnet = new Set(parteien.flatMap((p) => p.woran.map((u) => u.id)));
    const wartend = kinder(e.id).filter((u) => u.amZug === 'dritte' && !zugeordnet.has(u.id)).map((u) => ({ name: 'Nicht zugeordnet', woran: [u] }));
    for (const partei of [...parteien, ...wartend]) {
      if (nur && !partei.woran.some((u) => nur.has(u.id))) continue;
      zeilen.push(el('tr', {}, el('th', { scope: 'row' }, e.name), el('td', {}, partei.name),
        el('td', {}, el('ul', { class: 'einheiten', role: 'list' }, ...partei.woran.map(einheitKnoten)))));
    }
  }
  $('sicht').replaceChildren(zeilen.length
    ? el('table', { class: 'beteiligte' }, el('thead', {}, el('tr', {}, ...['Projekt', 'Wer', 'Woran'].map((t) => el('th', { scope: 'col' }, t)))), el('tbody', {}, ...zeilen))
    : el('p', { class: 'leer' }, 'Keine Beteiligten erfasst.'));
}

const SICHTEN = { anliegen: zeichneAnliegen, wirkung: zeichneWirkung, beteiligte: zeichneBeteiligte };

/**
 * Keep old concern links useful without maintaining a second project overview.
 * Only documented specialist views remain on this page. Unknown hash fields
 * never cross into the project overview.
 */
function kompatibilitaetsZiel(hash, bestand) {
  const adresse = new URLSearchParams(hash.replace(/^#/, ''));
  if (['wirkung', 'beteiligte', 'antwort'].includes(adresse.get('frage'))) return null;
  const projekte = new Set(bestand.eintraege.map((entry) => entry.id));
  const punkte = new Map(bestand.posten.map((point) => [point.id, point]));
  let projekt = projekte.has(adresse.get('projekt')) ? adresse.get('projekt') : '';
  const punkt = punkte.get(adresse.get('id'));
  if (punkt && (!projekt || punkt.projekt === projekt)) projekt ||= punkt.projekt;
  const ziel = new URLSearchParams();
  if (projekt) ziel.set('projekt', projekt);
  if (punkt && punkt.projekt === projekt) {
    ziel.set('fokus', 'fragen');
    ziel.set('frage', punkt.id);
  }
  return `start.html${ziel.size ? `#${ziel}` : ''}`;
}

function zeichne() {
  const alsAntwort = zustand.frage === 'antwort' && wunsch;
  const sicht = alsAntwort ? wunsch.sicht : zustand.frage;
  // An answer that rests on a Second Brain run names the run and the sources its manifest records.
  const lauf = alsAntwort && wunsch.lauf;
  $('antwort').replaceChildren(...(alsAntwort ? [
    el('h2', {}, wunsch.frage),
    wunsch.antwort && el('p', { class: 'kurzprofil' }, wunsch.antwort),
    lauf && el('details', { class: 'klappe' }, el('summary', {}, `Second-Brain-Lauf ${lauf.name}`),
      el('ul', {}, ...(lauf.quellen || []).map((q) => el('li', {}, q)))),
  ].filter(Boolean) : []));
  $('legende-wirkung').hidden = sicht !== 'wirkung';
  SICHTEN[sicht](alsAntwort && wunsch.einheiten ? new Set(wunsch.einheiten) : null);
}

function zeigeFrage(name, fokus, speichern = true) {
  if (!FRAGEN.includes(name) || (name === 'antwort' && !wunsch)) return;
  const neueAntwort = name === 'antwort' && zustand.frage !== 'antwort';
  zustand.frage = name;
  for (const f of FRAGEN) {
    const an = f === name;
    const tab = $(`tab-${f}`);
    tab.setAttribute('aria-selected', String(an));
    tab.tabIndex = an ? 0 : -1;
    if (an && fokus) tab.focus();
  }
  $('feld-frage').setAttribute('aria-labelledby', `tab-${name}`);
  if (neueAntwort) { zustand.projekt = wunsch.projekt || ''; $('projekt').value = zustand.projekt; }
  if (speichern) window.ARBEITSKONTEXT.schreibe('fragen', zustand);
  window.ARBEITSKONTEXT.links(zustand.projekt);
  zeichne();
}

function stelleFrageWiederHer() {
  let gespeichert = window.ARBEITSKONTEXT.lese('fragen');
  if (wunschUngueltig && gespeichert.frage === 'antwort') gespeichert = window.ARBEITSKONTEXT.lese('fragen', false);
  zustand.projekt = daten.eintraege.some((e) => e.id === gespeichert.projekt) ? gespeichert.projekt : '';
  $('projekt').value = zustand.projekt;
  const frage = FRAGEN.includes(gespeichert.frage) && (gespeichert.frage !== 'antwort' || wunsch) ? gespeichert.frage : 'anliegen';
  zeigeFrage(frage, false, false);
  const adresse = new URLSearchParams(location.hash.slice(1));
  const projektGueltig = adresse.get('projekt') === '' || daten.eintraege.some((e) => e.id === adresse.get('projekt'));
  const frageGueltig = !adresse.has('frage') || (FRAGEN.includes(adresse.get('frage')) && (adresse.get('frage') !== 'antwort' || wunsch));
  if (!wunschUngueltig && adresse.has('projekt') && projektGueltig && frageGueltig) window.ARBEITSKONTEXT.schreibe('fragen', zustand);
}

async function start() {
  await window.SECOND_BRAIN?.ready;
  if (!daten || !Array.isArray(daten.einheiten)) {
    $('stoerung').hidden = false;
    $('stoerung').textContent = 'Die Projektzusammenhänge konnten nicht geladen werden. Bitte erneut laden.';
    return;
  }
  const ziel = kompatibilitaetsZiel(location.hash, daten);
  if (ziel) {
    location.replace(ziel);
    return;
  }
  for (const u of daten.einheiten) einheiten.set(u.id, u);
  for (const p of daten.posten) postenNachId.set(p.id, p);
  if (window.SICHT !== undefined && window.SICHT !== null) {
    const pruefung = pruefeViewSpec(window.SICHT, daten);
    if (pruefung.ok) wunsch = pruefung.wert;
    else {
      wunschUngueltig = true;
      $('stoerung').hidden = false;
      $('stoerung').textContent = `Ungültige Ansichtsanweisung: ${pruefung.fehler} Die Anweisung wurde nicht angewandt.`;
    }
  }
  urteile = ladeUrteile();
  skala = skalaVon(daten.posten);
  $('stand').textContent = daten.stand ? `Quellenstand ${datum(daten.stand)}` : 'Quellenstand undatiert';
  $('stand').title = 'Geladener Snapshot aus ACTIVE-WORK; Änderungen erscheinen nach erneuter Erzeugung.';
  $('projekt').append(...daten.eintraege.map((e) => el('option', { value: e.id }, e.name)));
  const verfuegbar = FRAGEN.filter((f) => f !== 'antwort' || wunsch);
  $('tab-antwort').hidden = !wunsch;

  document.querySelector('.reiter').addEventListener('click', (e) => {
    const tab = e.target.closest('[role="tab"]');
    if (tab) zeigeFrage(tab.id.slice(4), false);
  });
  document.querySelector('.reiter').addEventListener('keydown', (e) => {
    const stelle = verfuegbar.indexOf(document.activeElement.id.slice(4));
    const neu = { ArrowRight: (stelle + 1) % verfuegbar.length, ArrowLeft: (stelle + verfuegbar.length - 1) % verfuegbar.length, Home: 0, End: verfuegbar.length - 1 }[e.key];
    if (stelle < 0 || neu === undefined) return;
    e.preventDefault();
    zeigeFrage(verfuegbar[neu], true);
  });
  $('sicht').addEventListener('click', (e) => {
    const knopf = e.target.closest('[data-lauf]');
    if (knopf) kopiere(laufBefehl(daten.eintraege.find((x) => x.id === knopf.dataset.lauf)), knopf);
  });
  $('projekt').addEventListener('change', (e) => { zustand.projekt = e.target.value; zeigeFrage(zustand.frage, false); });
  new ResizeObserver(zieheKanten).observe($('sicht'));

  window.addEventListener('popstate', stelleFrageWiederHer);
  window.addEventListener('hashchange', stelleFrageWiederHer);
  stelleFrageWiederHer();
  window.SECOND_BRAIN?.status();
  window.addEventListener('storage', () => { urteile = ladeUrteile(); zeigeFrage(zustand.frage, false, false); });
}

start();
