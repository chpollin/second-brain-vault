'use strict';

window.ARBEITSKONTEXT = (() => {
  const key = 'second-brain-public-demo.pruefansicht.kontext.v1';
  function gespeichert() {
    try { return JSON.parse(sessionStorage.getItem(key)) || {}; } catch { return {}; }
  }
  function lese(seite, adresseNutzen = true) {
    const stand = gespeichert();
    const adresse = new URLSearchParams(adresseNutzen ? location.hash.slice(1) : '');
    const werte = { ...stand[seite], projekt: stand.projekt || '', ...Object.fromEntries(adresse) };
    if (adresse.has('projekt') && adresse.get('projekt') !== (stand[seite]?.projekt || '') && !adresse.has('id')) { delete werte.id; delete werte.form; }
    return werte;
  }
  function schreibe(seite, werte) {
    const stand = gespeichert();
    stand[seite] = { ...werte };
    if ('projekt' in werte) stand.projekt = werte.projekt || '';
    try { sessionStorage.setItem(key, JSON.stringify(stand)); } catch { /* URL remains usable without storage. */ }
    const adresse = new URLSearchParams();
    for (const [name, wert] of Object.entries(werte)) if (wert !== null && wert !== undefined && wert !== '') adresse.set(name, String(wert));
    history.replaceState(null, '', `${location.pathname}${location.search}#${adresse}`);
    links(stand.projekt);
  }
  function links(projekt) {
    for (const a of document.querySelectorAll('nav a[href], a[data-work-view-link]')) {
      const url = new URL(a.getAttribute('href'), location.href);
      if (!/(?:index|start|fragen|sources|experiment|collective)\.html$/.test(url.pathname)) continue;
      const adresse = new URLSearchParams(url.hash.slice(1));
      adresse.set('projekt', projekt || '');
      url.hash = adresse.toString();
      if (projekt && /start\.html$/.test(url.pathname) && !/start\.html$/.test(location.pathname)) {
        url.hash = new URL(arbeitsadresse(projekt), location.href).hash;
      }
      a.href = url.href;
    }
  }
  function arbeitsadresse(projekt, frage = '') {
    // An explicit destination must survive a different view's remembered search and filters.
    return `start.html#${new URLSearchParams({ projekt, fokus: frage ? 'fragen' : 'projekt', frage,
      filter: 'alle', suche: '', route: 'all', status: 'all' })}`;
  }
  function alteArbeitsadresse(daten, hash = location.hash) {
    const adresse = new URLSearchParams(String(hash || '').replace(/^#/, ''));
    const projekte = new Set((daten?.eintraege || []).map((eintrag) => eintrag.id));
    const projekt = projekte.has(adresse.get('projekt')) ? adresse.get('projekt') : '';
    const frage = (daten?.posten || []).find((punkt) => punkt.id === adresse.get('id'));
    const ziel = new URLSearchParams();
    if (frage && projekte.has(frage.projekt) && (!projekt || projekt === frage.projekt)) {
      ziel.set('projekt', frage.projekt);
      ziel.set('fokus', 'fragen');
      ziel.set('frage', frage.id);
    } else if (projekt) {
      ziel.set('projekt', projekt);
      ziel.set('fokus', 'projekt');
    }
    const route = adresse.get('route');
    const status = adresse.get('status');
    if (['human', 'agent', 'all'].includes(route)) ziel.set('route', route);
    if (['open', 'revisit', 'answered', 'adoption', 'implementation', 'validation', 'all'].includes(status)) {
      ziel.set('status', status);
    }
    const suffix = ziel.toString();
    return `start.html${suffix ? `#${suffix}` : ''}`;
  }
  return { lese, schreibe, links, arbeitsadresse, alteArbeitsadresse };
})();
