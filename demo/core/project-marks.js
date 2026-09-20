'use strict';

window.PROJECT_MARKS = (() => {
  const paths = {};

  /** Return a decorative identity mark for a reviewed project ID, or null. */
  function create(projectId) {
    if (!Object.hasOwn(paths, projectId)) return null;
    const image = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    for (const [name, value] of Object.entries({ viewBox: '0 0 24 24', class: 'project-mark',
      'aria-hidden': 'true', focusable: 'false', fill: 'none', stroke: 'currentColor',
      'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })) image.setAttribute(name, value);
    for (const d of paths[projectId]) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      image.append(path);
    }
    return image;
  }

  return { create, ids: Object.keys(paths) };
})();
