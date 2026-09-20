'use strict';

window.SECOND_BRAIN_SHELL = (() => {
  const destinations = [
    { page: 'work', file: 'start.html', label: 'Arbeit' },
    { page: 'collective', file: 'collective.html', label: 'Agentenarbeit' },
    { page: 'knowledge', file: 'sources.html', label: 'Wissen' },
  ];

  function configuration(attributes, pathname) {
    // Deployment attributes may select relative directories, never another origin or executable URLs.
    const directory = (value) => typeof value === 'string' && /^(?:(?:\.{1,2}|[a-z\d_-]+)\/)*$/i.test(value);
    const base = directory(attributes.shellBase) ? attributes.shellBase : './';
    const publicTemplate = attributes.shellPublic === 'true';
    const template = publicTemplate && directory(attributes.shellTemplate) ? attributes.shellTemplate : null;
    const file = pathname.split('/').pop();
    const inferred = file === 'collective.html' ? 'collective'
      : ['sources.html', 'review.html'].includes(file) ? 'knowledge' : 'work';
    const page = ['work', 'collective', 'knowledge', 'template'].includes(attributes.shellPage)
      ? attributes.shellPage : inferred;
    return { base, publicTemplate, template, page };
  }

  function link(parent, label, href) {
    const anchor = document.createElement('a');
    anchor.textContent = label;
    anchor.setAttribute('href', href);
    parent.append(anchor);
    return anchor;
  }

  function mount() {
    if (!document.body) return;
    const config = configuration(document.body.dataset, location.pathname);
    let header = document.querySelector('header.shell-kopf');
    if (header?.dataset.shellMounted === 'true') return;
    if (!header) {
      header = document.createElement('header');
      document.body.prepend(header);
    }
    header.classList.add('kopf', 'shell-kopf');
    header.dataset.shellMounted = 'true';

    let title = header.querySelector('h1');
    if (!title) {
      title = document.createElement('h1');
      header.prepend(title);
    }
    let home = title.querySelector('a.shell-home');
    if (!home) {
      title.replaceChildren();
      home = link(title, 'Second Brain', '');
    }
    home.classList.add('shell-home');
    home.textContent = 'Second Brain';
    home.setAttribute('aria-label', 'Second Brain Startseite');
    home.setAttribute('href', `${config.base}start.html#projekt=&suche=&filter=laufend`);

    let navigation = header.querySelector('nav.shell-primaer');
    if (!navigation) {
      navigation = document.createElement('nav');
      navigation.classList.add('shell-primaer');
      title.after(navigation);
    }
    navigation.setAttribute('aria-label', 'Hauptnavigation');
    for (const destination of destinations) {
      const existing = [...navigation.querySelectorAll('a[href]')].find((anchor) => {
        const url = new URL(anchor.getAttribute('href'), location.href);
        return url.pathname.endsWith(`/${destination.file}`);
      });
      const anchor = existing || link(navigation, destination.label, config.base + destination.file);
      const previous = new URL(anchor.getAttribute('href'), location.href);
      anchor.textContent = destination.label;
      anchor.setAttribute('href', config.base + destination.file + previous.search + previous.hash);
      if (config.page === destination.page) anchor.setAttribute('aria-current', 'page');
      else anchor.removeAttribute('aria-current');
    }

    if (config.template !== null) {
      let secondary = header.querySelector('nav.shell-secondary');
      if (!secondary) {
        secondary = document.createElement('nav');
        secondary.classList.add('shell-secondary');
        secondary.setAttribute('aria-label', 'Vorlage');
        navigation.after(secondary);
      }
      const existing = [...navigation.querySelectorAll('a[href]')].find((anchor) =>
        /^(Vorlage|Vorlage erkunden)$/.test(anchor.textContent.trim()));
      const template = existing || secondary.querySelector('a') || link(secondary, 'Vorlage', config.template);
      secondary.append(template);
      template.textContent = 'Vorlage';
      template.setAttribute('href', config.template);
      if (config.page === 'template') template.setAttribute('aria-current', 'page');
      else template.removeAttribute('aria-current');
    }

    if (config.publicTemplate && !header.querySelector('#stand')) {
      const status = document.createElement('p');
      status.id = 'stand';
      status.classList.add('kopf-stand');
      status.textContent = 'Demo · öffentliche Vorlage';
      header.append(status);
    }

    let footer = document.querySelector('footer.shell-footer');
    if (!footer) {
      footer = document.createElement('footer');
      footer.classList.add('shell-footer');
      const footerNavigation = document.createElement('nav');
      footerNavigation.setAttribute('aria-label', 'Repository und Lizenzen');
      footer.append(footerNavigation);
      if (config.publicTemplate) link(footerNavigation, 'Repository', 'https://github.com/chpollin/second-brain-vault');
      link(footerNavigation, 'Code · MIT', 'https://opensource.org/license/mit');
      link(footerNavigation, 'Text · CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/');
      document.body.append(footer);
    }
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount, { once: true });
  return Object.freeze({ mount });
})();
