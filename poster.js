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
        eyebrow: 'For clubs, courts and players',
        offeredBy: 'Brought to you by',
        overline: 'Think you know the rules?',
        title: 'Pickleball Rules Challenge',
        hook: 'Test real game situations. Learn the rule. Play with confidence.',
        bullets: [
          '2 free games · no signup',
          '200 true-or-false rules questions',
          'Serving, scoring, faults, kitchen and line calls',
          'Full access: $6.99 one time · no subscription'
        ],
        cta: 'Scan to play free',
        ctaNote: '2 free games · no signup',
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
        eyebrow: 'Pour les clubs, terrains et joueurs',
        offeredBy: 'Offert par',
        overline: 'Vous pensez connaître les règles ?',
        title: 'Défi des règles du pickle',
        hook: 'Testez de vraies situations de jeu. Apprenez la règle. Jouez en confiance.',
        bullets: [
          '2 parties gratuites · sans inscription',
          '200 questions vrai ou faux sur les règles',
          'Service, score, fautes, zone de non-volée et lignes',
          'Accès complet : 6,99 $ US · sans abonnement'
        ],
        cta: 'Scannez pour jouer gratuitement',
        ctaNote: '2 parties gratuites · sans inscription',
        scanHint: 'Scannez avec votre téléphone',
        footer: 'Basé sur le règlement USA Pickleball',
        back: 'Retour au quiz',
        print: "Imprimer l'affiche",
        actionsLabel: "Actions de l'affiche",
        offerLabel: 'Ce que le quiz comprend',
        qrLabel: 'QR code pour jouer au défi des règles du pickle',
        description: 'Affiche imprimable du défi des règles du pickle pour les clubs et les terrains.'
      }
    }
  };

  function getCopy() {
    return POSTER_CONFIG.copy[POSTER_CONFIG.locale] || POSTER_CONFIG.copy.en;
  }

  function getUrl() {
    return POSTER_CONFIG.urls[POSTER_CONFIG.locale] || POSTER_CONFIG.urls.en;
  }

  function getDisplayUrl() {
    return POSTER_CONFIG.locale === 'fr'
      ? 'pickleballrulesquiz.com/fr.html'
      : 'pickleballrulesquiz.com';
  }

  // ?club=Name or ?coach=Name: show the name and put a tracking tag in the QR code.
  function getSponsor() {
    const params = new URLSearchParams(window.location.search);
    const kind = params.get('coach') ? 'coach' : 'club';
    const name = String(params.get(kind) || '').trim().slice(0, 60);
    const link = window.WT_ClubLink;
    const tag = name && link ? link.tag(kind, name) : '';
    return { name: tag ? name : '', tag };
  }

  // Address encoded in the QR code (tagged when the poster belongs to a club).
  function getQrUrl() {
    const sponsor = getSponsor();
    if (!sponsor.tag) return getUrl();
    return window.WT_ClubLink.siteUrl({ lang: POSTER_CONFIG.locale, tag: sponsor.tag });
  }

  function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = String(value || '');
  }

  function renderQr() {
    const target = document.getElementById('poster-qr');
    if (!target || typeof qrcode !== 'function') return;

    const copy = getCopy();
    const qrUrl = getQrUrl();
    // Version 4 holds the plain address only; a tagged address needs the automatic size.
    const qr = qrcode(qrUrl === getUrl() ? 4 : 0, 'M');
    qr.addData(qrUrl);
    qr.make();
    target.innerHTML = qr.createSvgTag(4, 0, copy.qrLabel);
    target.setAttribute('data-url', qrUrl);
    const svg = target.querySelector('svg');
    if (svg) {
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', copy.qrLabel);
    }
  }

  function init() {
    const copy = getCopy();
    document.documentElement.lang = POSTER_CONFIG.locale;
    document.title = POSTER_CONFIG.locale === 'fr'
      ? 'Affiche du quiz des règles du pickleball'
      : 'Pickleball Rules Quiz Poster';
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', copy.description);
    const sponsor = getSponsor();
    setText(
      '[data-poster="eyebrow"]',
      sponsor.name ? `${copy.offeredBy} ${sponsor.name}` : copy.eyebrow
    );
    setText('[data-poster="overline"]', copy.overline);
    setText('[data-poster="title"]', copy.title);
    setText('[data-poster="hook"]', copy.hook);
    setText('[data-poster="cta"]', copy.cta);
    setText('[data-poster="ctaNote"]', copy.ctaNote);
    setText('[data-poster="url"]', getDisplayUrl());
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
