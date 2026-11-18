/* Links from the French game to the rules guide of bonjourpickleball.fr (the site explains,
   the game plays). Shown on the French version only. The URLs come from config.js; each link
   carries utm parameters so the .fr analytics can see where the visit came from. */
(() => {
  'use strict';

  function isFrench() {
    return (
      String((document.documentElement && document.documentElement.lang) || '')
        .slice(0, 2)
        .toLowerCase() === 'fr'
    );
  }

  // kind: "guide" (hub of the rules) or "questions"; place: "end", "explanation" or "footer".
  function href(kind, place) {
    const cfg = (window.WT_CONFIG && window.WT_CONFIG.rulesLinks) || {};
    const base = String(
      kind === 'questions' ? cfg.questions : cfg.guide || ''
    ).trim();
    if (!base) return '';
    const url = new URL(base);
    url.searchParams.set('utm_source', 'pickleballrulesquiz');
    url.searchParams.set('utm_medium', 'quiz');
    url.searchParams.set('utm_campaign', String(place || 'game'));
    return url.toString();
  }

  // Ready-made anchor, or "" outside the French version or when no URL is configured.
  function anchor(kind, place, label, className, escapeHtml) {
    const text = String(label || '').trim();
    const target = href(kind, place);
    if (!isFrench() || !text || !target) return '';
    const esc = typeof escapeHtml === 'function' ? escapeHtml : (s) => s;
    return `<a class="${esc(className || 'wt-text-action')}" href="${esc(target)}" target="_blank" rel="noopener">${esc(text)}</a>`;
  }

  window.WT_RulesLink = { isFrench, href, anchor };
})();
