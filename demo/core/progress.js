'use strict';

// The existing no-build pages consume one shared window contract. Evidence
// flags require server validation and never follow from a browser answer.
window.WORK_STATE = (() => {
  const routine = Object.freeze({});

  /** Describe answer state and independently evidenced work for one point. */
  function describe(point, answer, receipts = []) {
    const stable = Boolean(point && point.identitaetStabil === true
      && typeof point.id === 'string' && point.id
      && typeof point.revision === 'string' && point.revision);
    const input = Boolean(answer && (answer.urteil || answer.notiz
      || Number.isInteger(answer.option) || Object.keys(answer.teile || {}).length
      || answer.historie?.length));
    const current = stable && answer?.revision === point.revision;
    let response = 'open';
    let responseLabel = 'Offen';
    if (input && !current) {
      response = 'revisit';
      responseLabel = 'Erneut ansehen';
    } else if (current) {
      if (['accept', 'beantwortet'].includes(answer.urteil)) {
        response = 'answered';
        responseLabel = 'Beantwortet';
      } else if (answer.urteil === 'change') responseLabel = 'Änderung angefragt';
      else if (answer.urteil === 'unclear') responseLabel = 'Rückfrage offen';
      else if (answer.notiz) responseLabel = 'Notiz vorhanden';
    }
    const related = (Array.isArray(receipts) ? receipts : [])
      .filter((receipt) => receipt && point?.id && receipt.pointId === point.id);
    const valid = related.filter((receipt) => stable
      && receipt.pointRevision === point.revision && receipt.valid === true
      && receipt.pointCurrent === true && receipt.evidenceCurrent === true
      && ['adopted', 'implemented', 'verified'].includes(receipt.stage)
      && (receipt.stage !== 'verified' || receipt.validationKind === 'technical'
        || (receipt.validationKind === 'human' && receipt.actor?.kind === 'user')));
    const routing = stable && Object.hasOwn(routine, point.id) ? routine[point.id] : null;
    const agent = Boolean(routing && routing.revision === point.revision);
    return {
      response, responseLabel,
      adopted: valid.some((receipt) => receipt.stage === 'adopted'),
      implemented: valid.some((receipt) => receipt.stage === 'implemented'),
      verified: valid.some((receipt) => receipt.stage === 'verified'),
      receipts: valid,
      changedReceipts: related.filter((receipt) => !valid.includes(receipt)),
      route: agent ? 'agent' : 'human',
      ...(agent ? { recommendation: { title: routing.title, reason: routing.reason } } : {}),
      routeReason: agent ? routing.reason : 'Für diesen Punkt liegt keine bestätigte Delegation als technische Routine vor.',
    };
  }

  return Object.freeze({ describe });
})();
