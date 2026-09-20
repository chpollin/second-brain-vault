'use strict';

window.BELEGARBEIT = (() => {
  const data = window.REVIEW_DATA || window.VAULT_EXPERIMENT;
  const contract = window.BELEGPRUEFUNG;
  const store = window.BELEGSPEICHER;
  const host = document.getElementById('belegarbeit');
  if (!host || !contract || !store || !Array.isArray(data?.passages)) return null;
  try { contract.checkData(data); } catch { return null; }
  const key = 'second-brain-public-demo.second-brain.belegpruefungen.v1';
  const relations = { offen: 'Offen', stuetzt: 'Stützt die Aussage', begrenzt: 'Begrenzt die Aussage', widerspricht: 'Widerspricht der Aussage', keine_belegbeziehung: 'Keine Belegbeziehung zu dieser Aussage' };
  const origins = { nutzereingabe: 'Nutzereingabe', 'agent-simulation': 'Agentensimulation · keine Nutzerabnahme' };
  const selection = new Map();
  let records = [];
  let persisted = new Set();
  let storageInvalid = false;
  let selectedRecordId = null;
  let detailSignature = '';
  const sourceMode = data.schema === 'vault-source-review-1';
  const sourceStates = new Map();
  let saving = false;
  let draftVersion = 0;
  const element = (tag, text, attrs = {}) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
    return node;
  };
  const button = (text, action) => {
    const node = element('button', text, { type: 'button', class: 'knopf' });
    node.addEventListener('click', action);
    return node;
  };
  const field = (text, control) => {
    const label = element('label', text);
    label.append(control);
    return label;
  };
  const work = element('section', undefined, { class: 'belegarbeit', id: 'belegvergleich', hidden: '', 'aria-labelledby': 'belegvergleich-titel' });
  const summary = element('h3', 'Ausgewählte Belege prüfen', { id: 'belegvergleich-titel' });
  const message = element('p', '', { role: 'status', class: 'beleg-status', id: 'beleg-status' });
  const storageMessage = element('p', '', { role: 'status', class: 'beleg-status', id: 'beleg-speicherstatus', hidden: '' });
  const form = element('form', undefined, { class: 'beleg-form' });
  const question = element('textarea', undefined, { id: 'pruef-frage', required: '', rows: '2' });
  question.value = sourceMode ? '' : data.query;
  const claim = element('textarea', undefined, { id: 'pruef-aussage', rows: '2' });
  const reason = element('textarea', undefined, { id: 'pruef-begruendung', required: '', rows: '3' });
  const previousReason = element('section', undefined, { id: 'pruef-vorherige-begruendung', hidden: '' });
  const previousText = element('p');
  previousReason.append(element('h4', 'Bisherige Begründung zum vorherigen Gegenstand'), previousText);
  let draftContext = { question: question.value, claim: claim.value };
  const origin = element('select', undefined, { id: 'pruef-herkunft', required: '' });
  origin.append(element('option', 'Herkunft wählen', { value: '' }));
  for (const [value, label] of Object.entries(origins)) origin.append(element('option', label, { value }));
  const comparison = element('div', undefined, { class: 'beleg-vergleich' });
  const save = element('button', 'Prüfung speichern', { type: 'submit', class: 'knopf' });
  const clear = button('Auswahl leeren', () => {
    if (sourceMode) {
      try { for (const id of selection.keys()) window.SOURCE_REVIEW.remove(id); }
      catch (error) { message.textContent = error.message; return; }
    }
    selection.clear(); renderSelection(); work.setAttribute('hidden', '');
    document.getElementById('belegsuche')?.focus();
  });
  const actions = element('div', undefined, { class: 'beleg-aktionen' });
  actions.append(save, clear);
  form.append(field('Forschungsfrage', question), field('Zu prüfende Aussage (für eine Belegbeziehung erforderlich)', claim), comparison,
    field('Begründetes Ergebnis und Grenzen', reason), previousReason, field('Herkunft des Urteils', origin), actions);
  work.append(summary, form, message);
  const saved = element('section', undefined, { class: 'belegarbeit', id: 'gespeicherte-pruefungen', 'aria-labelledby': 'pruefungen-titel' });
  const savedSummary = element('h3', 'Gespeicherte Prüfungen', { id: 'pruefungen-titel' });
  const search = element('input', undefined, { type: 'search', id: 'pruefung-suchen', 'aria-label': 'Gespeicherte Prüfungen durchsuchen', placeholder: 'Frage, Aussage oder Begründung suchen' });
  const list = element('ul', undefined, { class: 'beleg-liste', 'aria-label': 'Prüfungen auswählen' });
  const recordDetail = element('article', undefined, { class: 'beleg-urteil', id: 'pruefung-detail', hidden: '' });
  const recordLayout = element('div', undefined, { class: 'beleg-ergebnisse' });
  recordLayout.append(list, recordDetail);
  const exportButton = button('Prüfungen exportieren', () => {
    exportText.value = JSON.stringify({ schema: 'second-brain-review-export-1', records }, null, 2);
    exportMessage.textContent = '';
    dialog.showModal();
  });
  const savedActions = element('div', undefined, { class: 'beleg-aktionen' });
  savedActions.append(exportButton);
  saved.append(savedSummary, search, savedActions, recordLayout);
  const copyStatus = element('p', '', { role: 'status', class: 'beleg-status' });
  const copyFallback = element('textarea', undefined, { readonly: '', hidden: '', class: 'beleg-kopiertext', 'aria-label': 'Text für das Gespräch' });
  host.append(storageMessage, work, copyStatus, copyFallback);
  (document.getElementById('belegurteile') || host).append(saved);
  const dialog = element('dialog', undefined, { class: 'beleg-export', 'aria-labelledby': 'beleg-export-titel' });
  const exportText = element('textarea', undefined, { readonly: '', 'aria-label': 'Prüfungen als JSON' });
  const exportMessage = element('p', '', { role: 'status' });
  const copy = button('In die Zwischenablage', async () => {
    try { await navigator.clipboard.writeText(exportText.value); exportMessage.textContent = 'In der Zwischenablage.'; }
    catch { exportText.focus(); exportText.select(); exportMessage.textContent = 'Text markiert. Bitte kopieren.'; }
  });
  const close = button('Schließen', () => dialog.close());
  const dialogActions = element('div', undefined, { class: 'beleg-aktionen' });
  dialogActions.append(copy, close);
  dialog.append(element('h2', 'Prüfungen übergeben', { id: 'beleg-export-titel' }),
    element('p', 'Übergib den Export an die zuständige Agentensitzung. Sie prüft Quellenstand und Herkunft vor einer Übernahme. Kopieren verändert den Vault nicht.'), exportText, dialogActions, exportMessage);
  document.body.append(dialog);
  dialog.addEventListener('close', () => exportButton.focus());

  async function copyContext(text, trigger) {
    try {
      await navigator.clipboard.writeText(text);
      copyFallback.setAttribute('hidden', '');
      copyStatus.textContent = 'Kontext für das Gespräch kopiert.';
      if (trigger) trigger.textContent = 'Für Gespräch kopiert';
    } catch {
      copyFallback.value = text;
      copyFallback.removeAttribute('hidden');
      copyFallback.focus(); copyFallback.select();
      copyStatus.textContent = 'Kontext markiert. Bitte kopieren.';
      if (trigger) trigger.textContent = 'Kontext zum Kopieren markiert';
    }
  }
  function evidenceText(p) {
    return `${p.title}\n${p.path} · ${p.heading || 'ohne Abschnitt'} · Zeile ${p.line}\n${p.text}\nQuellrevision ${p.source_hash}\nTextrevision ${p.text_hash}\nAktuelle Quelle ${p.source_url}`;
  }

  function resetChangedContext() {
    if (question.value === draftContext.question && claim.value === draftContext.claim) return;
    if (reason.value.trim()) {
      previousText.textContent = `${draftContext.question}\n${draftContext.claim}\n${reason.value}`;
      previousReason.removeAttribute('hidden');
    }
    reason.value = ''; origin.value = '';
    for (const id of selection.keys()) selection.set(id, 'offen');
    draftContext = { question: question.value, claim: claim.value };
    renderSelection();
    message.textContent = 'Gegenstand geändert. Bitte Belege erneut beurteilen.';
  }
  question.addEventListener('input', resetChangedContext);
  claim.addEventListener('input', resetChangedContext);
  question.addEventListener('input', validateFields);
  claim.addEventListener('input', validateFields);
  reason.addEventListener('input', validateFields);
  for (const control of [question, claim, reason]) control.addEventListener('input', () => { draftVersion++; });
  origin.addEventListener('change', () => { draftVersion++; });

  function validateFields() {
    question.setCustomValidity(question.value.trim() ? '' : 'Bitte eine Forschungsfrage angeben.');
    reason.setCustomValidity(reason.value.trim() ? '' : 'Bitte das Urteil begründen.');
    const needsClaim = [...selection.values()].some(relation => relation !== 'offen');
    claim.required = needsClaim;
    claim.setCustomValidity(needsClaim && !claim.value.trim() ? 'Für diese Belegbeziehung ist eine konkrete Aussage erforderlich.' : '');
  }

  function focusComparison() {
    work.removeAttribute('hidden');
    (comparison.querySelector('select') || question).focus();
  }

  function excerpt(p) {
    const box = element('article', undefined, { class: 'beleg-ausschnitt' });
    box.append(element('h4', p.label || p.title), element('p', `Vault-Notiz · ${p.title} · ${p.heading} · Zeile ${p.line}`, { class: 'herkunft' }), element('blockquote', p.text));
    if (contract.safeSourceUrl(p.source_url)) {
      box.append(element('a', p.source_url.startsWith('obsidian:') ? 'Aktuelle Notiz in Obsidian öffnen' : 'Aktuelle Quelle öffnen', { href: p.source_url }));
    }
    return box;
  }
  function renderSelection() {
    draftVersion++;
    comparison.replaceChildren();
    summary.textContent = 'Ausgewählte Belege prüfen';
    if (selection.size) work.removeAttribute('hidden');
    if (!selection.size) comparison.append(element('p', 'Wähle einen oder zwei Belege aus den Originalpassagen.'));
    for (const [id, relation] of selection) {
      const passage = data.passages.find(p => p.id === id);
      const box = excerpt(passage);
      const select = element('select', undefined, { 'data-relation': id });
      for (const [value, text] of Object.entries(relations)) select.append(element('option', text, { value }));
      select.value = relation;
      select.addEventListener('change', () => { selection.set(id, select.value); draftVersion++; validateFields(); });
      box.append(field(`Belegbeziehung · ${passage.label || passage.title}`, select), button('Aus Vergleich entfernen', () => {
        if (sourceMode) {
          try { window.SOURCE_REVIEW.remove(id); }
          catch (error) { message.textContent = error.message; return; }
        }
        selection.delete(id); renderSelection();
        if (selection.size) focusComparison();
        else {
          work.setAttribute('hidden', '');
          const sourceButton = [...document.querySelectorAll('[data-belegauswahl]')].find(node => node.dataset.belegauswahl === id);
          (sourceButton || document.getElementById('belegsuche'))?.focus();
        }
      }));
      comparison.append(box);
    }
    for (const node of document.querySelectorAll('[data-belegauswahl]')) {
      const selected = selection.has(node.dataset.belegauswahl);
      node.setAttribute('aria-pressed', String(selected));
      node.textContent = selected ? 'Aus Vergleich entfernen' : 'Zum Vergleich hinzufügen';
    }
    save.disabled = saving || !selection.size || storageInvalid;
    validateFields();
  }
  function bindingText(record, state) {
    if (state.status === 'prueft') return 'Aktueller Quellenstand wird geprüft.';
    if (state.status === 'unbekannt') return 'Aktueller Quellenstand nicht überprüfbar. Das gespeicherte Urteil bleibt erhalten.';
    if (state.status === 'gleich') return 'Quellenbindung entspricht den geladenen Belegen.';
    const names = ids => ids.map(id => {
      const evidence = record.evidence.find(p => p.id === id);
      return `${evidence.label || evidence.title} (${id})`;
    }).join(', ');
    return ['Historischer Quellenstand.', state.changedIds.length ? `Geändert: ${names(state.changedIds)}.` : '',
      state.missingIds.length ? `Nicht mehr geladen: ${names(state.missingIds)}.` : ''].filter(Boolean).join(' ');
  }
  function persistenceText(record) {
    return persisted.has(record.id) ? 'Lokal gespeichert' : 'Nur in dieser Sitzung · vor dem Schließen exportieren';
  }
  function corpusLabel(record) {
    return record.datasetSchema === 'vault-source-review-1' ? 'Freie Quellenauswahl' : 'Research-Persona-Korpus';
  }
  function bindingState(record) {
    if (record.datasetSchema !== 'vault-source-review-1') return contract.assess(record, data);
    if (!sourceMode || !window.SOURCE_REVIEW) return { status: 'unbekannt', changedIds: [], missingIds: [] };
    if (!sourceStates.has(record.id)) {
      const pending = { status: 'prueft', changedIds: [], missingIds: [] };
      sourceStates.set(record.id, pending);
      window.SOURCE_REVIEW.assess(record).then(state => {
        if (sourceStates.get(record.id) !== pending) return;
        sourceStates.set(record.id, state); renderRecords();
      });
    }
    return sourceStates.get(record.id);
  }
  function renderDetail(record, focus = false) {
    if (!record) { recordDetail.replaceChildren(); recordDetail.setAttribute('hidden', ''); detailSignature = ''; return; }
    const state = bindingState(record);
    const signature = JSON.stringify([record, state, persisted.has(record.id)]);
    if (signature === detailSignature) return;
    detailSignature = signature;
    recordDetail.removeAttribute('hidden'); recordDetail.replaceChildren();
    const heading = element('h4', record.claim || record.question, { tabindex: '-1' });
    recordDetail.append(heading, element('p', origins[record.origin], { class: 'beleg-herkunft' }),
      element('p', corpusLabel(record), { class: 'herkunft' }),
      element('p', `${persistenceText(record)} · ${new Date(record.created).toLocaleString('de-AT')}`, { class: 'beleg-status' }),
      element('p', bindingText(record, state), { class: 'beleg-status' }),
      element('p', record.question), element('p', record.reason, { class: 'beleg-ergebnis' }));
    const evidence = element('div', undefined, { class: 'beleg-vergleich' });
    for (const p of record.evidence) {
      const box = excerpt(p);
      box.append(element('p', relations[p.relation], { class: 'beleg-beziehung' }));
      if (state.missingIds.includes(p.id)) box.append(element('p', 'Im geladenen Bestand nicht mehr vorhanden. Gespeicherter Wortlaut bleibt erhalten.', { class: 'beleg-status' }));
      if (state.changedIds.includes(p.id)) {
        const current = state.current?.[p.id] || data.passages.find(item => item.id === p.id);
        box.append(element('p', 'Geladener Quellenstand geändert. Dieses Urteil gilt für die oben gespeicherte Fassung.', { class: 'beleg-status' }),
          element('h5', record.datasetSchema === 'vault-source-review-1' ? 'Aktueller Text am früheren Zeichenbereich' : 'Jetzt geladener Wortlaut'), element('blockquote', current.text),
          element('p', `${current.path} · ${current.heading || 'ohne Abschnitt'} · Zeile ${current.line}`, { class: 'herkunft' }));
      }
      evidence.append(box);
    }
    const recordActions = element('div', undefined, { class: 'beleg-aktionen' });
    if (record.datasetSchema === 'vault-source-review-1') {
      if (sourceMode) recordActions.append(button('Quellenstand erneut prüfen', () => { sourceStates.delete(record.id); renderRecords(); }));
      else recordActions.append(element('a', 'Freie Quellenprüfung öffnen', { href: 'review.html' }));
    }
    recordActions.append(button('Für Gespräch kopieren', event => copyContext([
      record.question, record.claim, record.reason, origins[record.origin], persistenceText(record), bindingText(record, state),
      ...record.evidence.map(p => `${relations[p.relation]}\n${evidenceText(p)}`),
      `Prüfung ${record.id} · ${record.created}\nEine Übernahme in den Vault ist hier nicht nachgewiesen.`,
    ].filter(Boolean).join('\n\n'), event.currentTarget)), button('Als neue Prüfung öffnen', () => {
      previousText.textContent = ''; previousReason.setAttribute('hidden', '');
      question.value = record.question; claim.value = record.claim; origin.value = '';
      reason.value = state.status === 'gleich' ? record.reason : '';
      draftContext = { question: question.value, claim: claim.value };
      selection.clear();
      if (state.status === 'gleich') for (const p of record.evidence) selection.set(p.id, p.relation);
      renderSelection(); work.removeAttribute('hidden'); question.focus();
      message.textContent = state.status === 'gleich' ? 'Eine neue Speicherung erhält die bisherige Prüfung unverändert.'
        : 'Der gespeicherte Quellenstand weicht ab. Wähle passende geladene Belege für eine neue Prüfung; die bisherige bleibt erhalten.';
    }));
    recordDetail.append(recordActions, evidence);
    if (focus) heading.focus();
  }
  function renderRecords() {
    const focusedId = document.activeElement?.dataset.reviewId;
    const sessionCount = records.filter(record => !persisted.has(record.id)).length;
    savedSummary.textContent = `Gespeicherte Prüfungen${sessionCount ? ` · ${sessionCount} nur in dieser Sitzung` : ''}`;
    exportButton.disabled = records.length === 0;
    search.disabled = records.length === 0;
    if (records.length) saved.removeAttribute('hidden'); else saved.setAttribute('hidden', '');
    list.replaceChildren();
    const term = search.value.trim().toLocaleLowerCase('de');
    const visible = records.filter(r => `${r.question} ${r.claim} ${r.reason} ${r.evidence.map(p => `${p.path} ${p.text}`).join(' ')}`.toLocaleLowerCase('de').includes(term));
    if (!visible.some(record => record.id === selectedRecordId)) selectedRecordId = visible.at(-1)?.id || null;
    if (!visible.length) list.append(element('li', records.length ? 'Keine Prüfung für diese Suche.' : 'Noch keine Prüfung gespeichert.'));
    for (const record of [...visible].reverse()) {
      const item = element('li');
      const choose = button(record.claim || record.question, () => {
        selectedRecordId = record.id;
        renderRecords();
        recordDetail.querySelector('h4')?.focus();
      });
      choose.dataset.reviewId = record.id;
      choose.setAttribute('aria-pressed', String(record.id === selectedRecordId));
      item.append(choose, element('p', origins[record.origin], { class: 'beleg-herkunft' }),
        element('p', corpusLabel(record), { class: 'herkunft' }),
        element('p', persistenceText(record), { class: 'beleg-status' }),
        element('p', bindingText(record, bindingState(record)), { class: 'beleg-status' }));
      list.append(item);
      if (focusedId === record.id) choose.focus();
    }
    renderDetail(visible.find(record => record.id === selectedRecordId));
  }
  function receiveStored(stored) {
    const transient = records.filter(record => !persisted.has(record.id));
    persisted = new Set(stored.map(record => record.id));
    records = [...stored, ...transient.filter(record => !persisted.has(record.id))];
  }
  try {
    receiveStored(store.load(localStorage));
  } catch {
    storageInvalid = true;
    storageMessage.removeAttribute('hidden');
    storageMessage.textContent = 'Gespeicherte Prüfungen sind nicht lesbar oder der Browserzugriff ist gesperrt. Der vorhandene Speicher wird nicht überschrieben.';
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (storageInvalid || saving) return;
    validateFields();
    if (!form.reportValidity()) return;
    try {
      const record = contract.create({ question: question.value, claim: claim.value, reason: reason.value, origin: origin.value,
        evidence: [...selection].map(([id, relation]) => ({ id, relation })) }, data);
      if (sourceMode) {
        saving = true;
        const version = draftVersion;
        save.disabled = true;
        message.textContent = 'Aktuelle Quellen werden vor dem Speichern geprüft.';
        const state = await window.SOURCE_REVIEW.assess(record);
        if (version !== draftVersion) throw new Error('Die Eingabe wurde während der Quellenprüfung geändert. Bitte die aktuelle Fassung erneut speichern.');
        if (state.status !== 'gleich') throw new Error('Die Auswahl ist geändert, fehlt oder kann gerade nicht überprüft werden. Bitte die aktuelle Quelle erneut öffnen und markieren.');
        sourceStates.set(record.id, state);
      }
      records = [...records, record];
      try { receiveStored(store.save(localStorage, record)); message.textContent = 'Prüfung lokal gespeichert. Der Vault ist unverändert.'; }
      catch (error) { message.textContent = `${error.message} Die neue Prüfung ist nur in dieser Sitzung vorhanden und kann exportiert werden.`; }
      selectedRecordId = record.id;
      search.value = '';
      renderRecords();
    } catch (error) { message.textContent = error.message; }
    finally { saving = false; save.disabled = !selection.size || storageInvalid; }
  });
  search.addEventListener('input', renderRecords);
  window.addEventListener('storage', event => {
    if (event.key !== null && event.key !== key && !event.key.startsWith(`${key}.`)) return;
    try {
      receiveStored(store.load(localStorage));
      if (storageInvalid) message.textContent = 'Der Browserspeicher ist wieder lesbar.';
      storageInvalid = false;
      storageMessage.textContent = '';
      storageMessage.setAttribute('hidden', '');
      renderRecords();
    } catch {
      storageInvalid = true;
      storageMessage.removeAttribute('hidden');
      storageMessage.textContent = 'Der geänderte Browserspeicher ist nicht lesbar. Die sichtbaren Prüfungen können weiterhin exportiert werden. Weitere Speicherungen sind gesperrt.';
    }
    save.disabled = saving || !selection.size || storageInvalid;
  });
  renderSelection(); renderRecords();
  return {
    select(p) {
      if (selection.size < 2 && data.passages.some(passage => passage.id === p.id)) {
        selection.set(p.id, 'offen'); renderSelection();
      }
    },
    button(p) {
      const group = element('div', undefined, { class: 'beleg-aktionen' });
      const add = button(selection.has(p.id) ? 'Aus Vergleich entfernen' : 'Zum Vergleich hinzufügen', () => {
        if (selection.has(p.id)) selection.delete(p.id);
        else if (selection.size < 2) selection.set(p.id, 'offen');
        else { work.removeAttribute('hidden'); message.textContent = 'Vergleiche bis zu zwei Belege. Entferne zunächst einen Beleg aus der Auswahl.'; message.scrollIntoView({ block: 'center' }); return; }
        message.textContent = ''; renderSelection();
        if (!selection.size) work.setAttribute('hidden', '');
      });
      add.classList.add('beleg-auswahl');
      add.dataset.belegauswahl = p.id;
      add.setAttribute('aria-pressed', String(selection.has(p.id)));
      const open = element('a', 'Vergleich öffnen', { href: '#belegvergleich' });
      open.addEventListener('click', event => {
        event.preventDefault();
        if (!selection.size) { selection.set(p.id, 'offen'); renderSelection(); }
        focusComparison();
      });
      group.append(add, open, button('Für Gespräch kopieren', event => copyContext(`${data.query}\n\n${evidenceText(p)}\n\nGespeicherte Quellenauswahl. Noch kein Urteil.`, event.currentTarget)));
      return group;
    },
  };
})();
