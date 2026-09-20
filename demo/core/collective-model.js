'use strict';

// Classic scripts preserve the application's shared-window contract (knowledge/project.md).
(function (root) {
  const list = (value) => Array.isArray(value) ? value : [];
  const text = (value) => typeof value === 'string' ? value : '';
  const record = (value) => value && typeof value === 'object' && !Array.isArray(value);
  const responsibilityLabels = { du: 'Dein Beitrag', agent: 'Agentischer Beitrag', dritte: 'Externer Beitrag', offen: 'Zuständigkeit offen' };
  const relationshipKinds = new Set(['uses_tool', 'uses_data', 'supplies_data', 'uses_method']);

  /** Normalize documented work without deriving live activity, readiness or acceptance. */
  function build(input, relations = []) {
    const data = record(input) ? input : {};
    const warnings = [];
    const projects = [];
    const projectMap = new Map();
    const sourcePath = text(data.source);
    for (const entry of list(data.eintraege)) {
      if (!record(entry) || !text(entry.id) || projectMap.has(entry.id)) continue;
      const project = { id: entry.id, name: text(entry.name) || entry.id,
        group: text(entry.bereich), subgroup: text(entry.unterbereich), status: text(entry.status),
        summary: list(entry.kurzprofil).filter((value) => typeof value === 'string').join('\n\n'),
        stand: text(entry.stand), source: { path: sourcePath, anchor: '', quote: text(entry.stand) },
        questions: [], steps: [], waiting: [], units: [], raw: entry };
      projects.push(project);
      projectMap.set(entry.id, project);
    }
    const points = new Map(list(data.posten).filter((point) => record(point) && text(point.id)).map((point) => [point.id, point]));
    const rawUnits = new Map();
    for (const unit of list(data.einheiten)) {
      if (!record(unit) || !text(unit.id) || rawUnits.has(unit.id)) continue;
      rawUnits.set(unit.id, unit);
    }
    // Partial snapshots keep their actual text; fallback identities never imply canonical unit identity.
    for (const project of projects) {
      if (!rawUnits.has(project.id)) rawUnits.set(project.id, { id: project.id, art: 'eintrag', titel: project.name, herkunft: 'workflow' });
      for (const point of points.values()) {
        if (point.projekt === project.id && !rawUnits.has(point.id)) rawUnits.set(point.id,
          { id: point.id, art: 'punkt', titel: point.frage, teilVon: project.id, amZug: 'du', herkunft: 'workflow' });
      }
      if (![...rawUnits.values()].some((unit) => unit.teilVon === project.id && unit.art === 'schritt')) {
        list(project.raw.schritte).forEach((step, index) => {
          if (text(step)) rawUnits.set(`${project.id}:step:${index}`, { id: `${project.id}:step:${index}`, art: 'schritt',
            titel: step, teilVon: project.id, amZug: 'offen', herkunft: 'workflow', fallbackIdentity: true });
        });
      }
      if (text(project.raw.wartetAuf) && ![...rawUnits.values()].some((unit) => unit.teilVon === project.id && unit.art === 'warten')) {
        rawUnits.set(`${project.id}-warten`, { id: `${project.id}-warten`, art: 'warten', titel: project.raw.wartetAuf,
          teilVon: project.id, amZug: 'dritte', herkunft: 'workflow' });
      }
    }
    function projectFor(unit) {
      const seen = new Set();
      let current = unit;
      while (current) {
        if (seen.has(current.id)) return '';
        seen.add(current.id);
        if (projectMap.has(current.id)) return current.id;
        current = rawUnits.get(current.teilVon);
      }
      return '';
    }
    function questionFor(unit, projectId) {
      const seen = new Set();
      let current = unit;
      while (current && !seen.has(current.id)) {
        seen.add(current.id);
        const question = points.get(current.id);
        if (question?.projekt === projectId) return question;
        current = rawUnits.get(current.teilVon);
      }
      return null;
    }
    const units = [];
    const unitMap = new Map();
    for (const raw of rawUnits.values()) {
      const projectId = projectFor(raw);
      if (!projectId) { warnings.push(`Arbeitszuordnung für ${raw.id} nicht auflösbar.`); continue; }
      const question = questionFor(raw, projectId);
      const point = question?.id === raw.id ? question : null;
      const structured = point?.struktur;
      const title = text(raw.titel) || text(point?.frage);
      const part = raw.art === 'teil' && raw.teilVon === question?.id
        ? list(question?.struktur?.teile).find((item) => record(item) && text(item.id) && raw.id === `${question.id}/${item.id}`) : null;
      const derived = ['teil', 'meilenstein', 'folge', 'bedingung'].includes(raw.art)
        || Boolean(structured && title !== text(point?.frage)) || ['llm', 'mensch'].includes(raw.herkunft);
      // Derived unit titles are interpretations; only a separately supplied original is quotable.
      const originalText = text(point?.original) || text(point?.frage) || text(part?.spanne) || (derived ? '' : title);
      const responsibility = Object.hasOwn(responsibilityLabels, raw.amZug) ? raw.amZug : 'offen';
      const unit = { id: raw.id, projectId, parentId: text(raw.teilVon), kind: text(raw.art), title,
        displayTitle: text(point?.frageKurz) || title, questionId: question?.id || '',
        text: text(point?.frage) || title, responsibility, responsibilityLabel: responsibilityLabels[responsibility],
        originalText, hasOriginalText: Boolean(originalText),
        origin: derived ? 'derived' : 'source', provenance: text(structured?.herkunft) || text(raw.herkunft),
        source: { path: sourcePath, anchor: text(question?.anker), quote: originalText },
        pointId: point ? point.id : '', prerequisite: text(point?.voraussetzung), context: text(point?.kontext),
        contributionType: text(point?.typ), date: text(raw.datum), fallbackIdentity: raw.fallbackIdentity === true, raw };
      units.push(unit);
      unitMap.set(unit.id, unit);
      const project = projectMap.get(projectId);
      project.units.push(unit);
      if (unit.kind === 'punkt') project.questions.push(unit);
      if (['schritt', 'termin'].includes(unit.kind)) project.steps.push(unit);
      if (unit.kind === 'warten') project.waiting.push(unit);
    }
    const parties = list(data.parteien).filter((party) => record(party) && text(party.id) && projectMap.has(party.eintrag))
      .map((party) => ({ id: party.id, projectId: party.eintrag, role: text(party.rolle), institution: text(party.institution), raw: party }));
    const partyIds = new Set(parties.map((party) => party.id));
    const edges = units.filter((unit) => unit.parentId && unitMap.has(unit.parentId)).map((unit) => ({
      from: unit.parentId, to: unit.id, kind: 'contains', origin: unit.origin, provenance: unit.provenance,
      source: unit.source, state: 'documented', current: true }));
    for (const assertion of list(data.aussagen)) {
      if (!record(assertion) || !unitMap.has(assertion.von)) continue;
      const kind = assertion.relation === 'haengt_ab_von' ? 'requires' : assertion.relation === 'beteiligt' ? 'participates' : '';
      if (!kind || (kind === 'requires' ? !unitMap.has(assertion.nach) : !partyIds.has(assertion.nach))) continue;
      edges.push({ from: assertion.von, to: assertion.nach, kind, origin: 'derived', provenance: text(assertion.herkunft),
        source: { path: text(assertion.fundstelle?.pfad), anchor: text(assertion.fundstelle?.anker), quote: text(assertion.spanne) },
        state: 'documented', current: Boolean(text(assertion.spanne) && text(assertion.fundstelle?.pfad)) });
    }
    for (const relation of list(relations)) {
      if (!record(relation) || !projectMap.has(relation.from) || !projectMap.has(relation.to) || !relationshipKinds.has(relation.kind)) continue;
      const source = { path: text(relation.source?.path), anchor: '', revision: text(relation.source?.revision), quote: text(relation.source?.quote) };
      edges.push({ id: text(relation.id), from: relation.from, to: relation.to, kind: relation.kind, origin: 'source',
        provenance: 'project-relations', source, state: text(relation.state), qualifier: text(relation.qualifier),
        problems: list(relation.problems).filter((problem) => typeof problem === 'string'),
        current: relation.valid === true && ['documented', 'proposed'].includes(relation.state) && Boolean(source.path && source.revision && source.quote) });
    }
    const groups = [...new Set(projects.map((project) => project.group))].map((name) => ({ name, projects: projects.filter((project) => project.group === name) }));
    return { projects, units, edges, parties, groups, source: sourcePath, stand: text(data.stand), warnings };
  }

  const api = { build };
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.COLLECTIVE_MODEL = api;
})(typeof window === 'object' ? window : null);
