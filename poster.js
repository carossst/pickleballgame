/* Poster page content and local QR generation. Keep all editable poster copy here. */
(() => {
  'use strict';

  const POSTER_CONFIG = {
    locale: 'en',
    url: 'https://www.pickleballrulesquiz.com/',
    copy: {
      en: {
        eyebrow: 'For clubs and courts',
        overline: 'Learn the rules. Play with confidence.',
        title: 'Pickleball Rules Quiz',
        hook: 'Think you know pickleball? Prove it.',
        bullets: [
          'Try 2 games free',
          '200 true-or-false rules questions',
          'Covers serving, scoring, faults, and line calls',
          'Full access: $6.99 one-time',
          'No subscription'
        ],
        cta: 'Scan to play',
        scanHint: 'Scan with your phone',
        footer: 'Based on the USA Pickleball rulebook'
      }
    }
  };

  function getCopy() {
    return POSTER_CONFIG.copy[POSTER_CONFIG.locale] || POSTER_CONFIG.copy.en;
  }

  function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = String(value || '');
  }

  function renderQr() {
    const target = document.getElementById('poster-qr');
    if (!target || typeof qrcode !== 'function') return;

    const qr = qrcode(4, 'M');
    qr.addData(POSTER_CONFIG.url);
    qr.make();
    target.innerHTML = qr.createSvgTag(4, 0, 'QR code to play Pickleball Rules Quiz');
    const svg = target.querySelector('svg');
    if (svg) {
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', 'QR code to play Pickleball Rules Quiz');
    }
  }

  function init() {
    const copy = getCopy();
    setText('[data-poster="eyebrow"]', copy.eyebrow);
    setText('[data-poster="overline"]', copy.overline);
    setText('[data-poster="title"]', copy.title);
    setText('[data-poster="hook"]', copy.hook);
    setText('[data-poster="cta"]', copy.cta);
    setText('[data-poster="url"]', POSTER_CONFIG.url.replace(/^https?:\/\//, ''));
    setText('[data-poster="scanHint"]', copy.scanHint);
    setText('[data-poster="footer"]', copy.footer);

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
