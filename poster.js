/* Poster page content and local QR generation. Keep all editable poster copy here. */
(() => {
  'use strict';

  const POSTER_CONFIG = {
    locale: new URLSearchParams(window.location.search).get('lang') === 'fr' ? 'fr' : 'en',
    urls: {
      en: 'https://www.pickleballrulesquiz.com/',
      fr: 'https://www.pickleballrulesquiz.com/fr.html'
    },
    copy: {
      en: {
        eyebrow: 'For clubs and courts',
        overline: 'Can you get 5 tricky pickleball calls right?',
        title: 'Pickleball Rules Quiz',
        hook: 'Test real game situations, learn the rule, and see where you stand.',
        bullets: [
          'Try 2 games free, no signup',
          '200 rules questions based on the 2026 USA Pickleball rulebook',
          'Serving, scoring, faults, kitchen rules and line calls',
          'Full access: $6.99 one time',
          'No subscription'
        ],
        cta: 'Scan to play',
        scanHint: 'Scan with your phone',
        footer: 'Based on the USA Pickleball rulebook',
        back: 'Back to quiz',
        print: 'Print poster',
        actionsLabel: 'Poster actions',
        offerLabel: 'What the quiz includes',
        qrLabel: 'QR code to play Pickleball Rules Quiz',
        description: 'Printable Pickleball Rules Quiz poster for clubs and courts.'
      },
      fr: {
        eyebrow: 'Pour les clubs et les terrains',
        overline: 'Saurez-vous trancher 5 situations pièges au pickleball ?',
        title: 'Défi des règles du pickleball',
        hook: 'Testez des situations de jeu réelles, découvrez la règle et voyez où vous en êtes.',
        bullets: [
          '2 parties gratuites, sans inscription',
          '200 questions sur les règles, basées sur le règlement USA Pickleball 2026',
          'Service, score, fautes, zone de non-volée et lignes',
          'Accès complet : 6,99 $ US en paiement unique',
          'Sans abonnement'
        ],
        cta: 'Scannez pour jouer',
        scanHint: 'Scannez avec votre téléphone',
        footer: 'Basé sur le règlement USA Pickleball',
        back: 'Retour au quiz',
        print: "Imprimer l'affiche",
        actionsLabel: "Actions de l'affiche",
        offerLabel: 'Ce que le quiz comprend',
        qrLabel: 'QR code pour jouer au défi des règles du pickleball',
        description: 'Affiche imprimable du défi des règles du pickleball pour les clubs et les terrains.'
      }
    }
  };

  function getCopy() {
    return POSTER_CONFIG.copy[POSTER_CONFIG.locale] || POSTER_CONFIG.copy.en;
  }

  function getUrl() {
    return POSTER_CONFIG.urls[POSTER_CONFIG.locale] || POSTER_CONFIG.urls.en;
  }

  function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = String(value || '');
  }

  function renderQr() {
    const target = document.getElementById('poster-qr');
    if (!target || typeof qrcode !== 'function') return;

    const qr = qrcode(4, 'M');
    const copy = getCopy();
    qr.addData(getUrl());
    qr.make();
    target.innerHTML = qr.createSvgTag(4, 0, copy.qrLabel);
    const svg = target.querySelector('svg');
    if (svg) {
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', copy.qrLabel);
    }
  }

  function init() {
    const copy = getCopy();
    const url = getUrl();
    document.documentElement.lang = POSTER_CONFIG.locale;
    document.title = POSTER_CONFIG.locale === 'fr'
      ? 'Affiche du quiz des règles du pickleball'
      : 'Pickleball Rules Quiz Poster';
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', copy.description);
    setText('[data-poster="eyebrow"]', copy.eyebrow);
    setText('[data-poster="overline"]', copy.overline);
    setText('[data-poster="title"]', copy.title);
    setText('[data-poster="hook"]', copy.hook);
    setText('[data-poster="cta"]', copy.cta);
    setText('[data-poster="url"]', url.replace(/^https?:\/\//, ''));
    setText('[data-poster="scanHint"]', copy.scanHint);
    setText('[data-poster="footer"]', copy.footer);
    setText('[data-poster="back"]', copy.back);
    setText('[data-poster="print"]', copy.print);

    const backLink = document.querySelector('[data-poster="back"]');
    if (backLink) backLink.setAttribute('href', POSTER_CONFIG.locale === 'fr' ? '../fr.html' : '../');
    const tools = document.querySelector('.poster-tools');
    if (tools) tools.setAttribute('aria-label', copy.actionsLabel);
    const offer = document.querySelector('.poster-offer');
    if (offer) offer.setAttribute('aria-label', copy.offerLabel);
    const qr = document.getElementById('poster-qr');
    if (qr) qr.setAttribute('aria-label', copy.qrLabel);

    const bulletList = document.querySelector('[data-poster-list="bullets"]');
    if (bulletList) {
      bulletList.replaceChildren(
        ...copy.bullets.map((bullet) => {
          const item = document.createElement('li');
          item.textContent = bullet;
          return item;
        })
      );
    }

    renderQr();
    const printButton = document.querySelector('[data-action="print-poster"]');
    if (printButton) printButton.addEventListener('click', () => window.print());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
