'use strict';

// Shape follows the point type explicitly recorded in the public template.
window.POINT_TYPES = (() => {
  const classes = { entscheiden: 'Entscheiden', abnehmen: 'Abnehmen', liefern: 'Liefern' };
  const vocabulary = {
    entscheidung: ['Entscheiden', 'entscheiden'],
    auswaehlen: ['Auswählen', 'entscheiden'],
    festlegen: ['Festlegen', 'entscheiden'],
    erlauben: ['Erlauben', 'entscheiden'],
    abnehmen: ['Abnehmen', 'abnehmen'],
    liefern: ['Liefern', 'liefern'],
  };
  // A trailing `+` marks a point whose answer needs a third party.
  const points = Object.fromEntries((window.PRUEFANSICHT?.posten || [])
    .map(point => [point.id, point.sourceType === 'Decision' ? 'entscheidung' : '']));

  function of(id) {
    const entry = points[id] || '';
    const type = entry.replace(/\+$/, '');
    const [label = '', group = ''] = vocabulary[type] || [];
    return { type: label ? type : '', label, group, thirdParty: entry.endsWith('+') };
  }

  // Shapes share one visual weight at size 1; an untyped point stays a small circle.
  function shape(group, cx, cy, size = 1) {
    const at = (dx, dy) => `${(cx + dx * size).toFixed(2)},${(cy + dy * size).toFixed(2)}`;
    const polygon = (...pairs) => ['polygon', { points: pairs.map(([dx, dy]) => at(dx, dy)).join(' ') }];
    if (group === 'entscheiden') return polygon([0, -6], [6, 0], [0, 6], [-6, 0]);
    if (group === 'liefern') return polygon([-1.8, -5.6], [1.8, -5.6], [1.8, -1.8], [5.6, -1.8], [5.6, 1.8], [1.8, 1.8],
      [1.8, 5.6], [-1.8, 5.6], [-1.8, 1.8], [-5.6, 1.8], [-5.6, -1.8], [-1.8, -1.8]);
    return ['circle', { cx, cy, r: (group === 'abnehmen' ? 4.5 : 3) * size }];
  }

  return { classes, vocabulary, points, of, shape };
})();
