/* Small court diagrams shown next to the rule explanation. One drawing per
   topic, picked from the tags of the question. Pure SVG strings, no images. */
(() => {
  'use strict';

  // Tag on the question -> drawing. The first matching entry wins.
  const TOPIC_BY_TAG = [
    ['Non-Volley Zone', 'kitchen'],
    ['Serving Rules', 'serving'],
    ['Line Calls', 'lines'],
    ['Faults & Dead Ball', 'faults'],
    ['Score & Readiness', 'scoring'],
    ['Court & Equipment', 'court'],
    ['Rally Situations', 'rally'],
    ['The Net', 'rally'],
    ['2026 Changes', 'changes']
  ];

  const LABELS = {
    en: {
      kitchen: 'Court diagram: the non-volley zone (kitchen) is highlighted',
      serving: 'Court diagram: the serve goes diagonally to the opposite service court',
      lines: 'Court diagram: a ball touching a line is in',
      faults: 'Court diagram: the net and the kitchen lines are highlighted',
      scoring: 'Scoreboard example: server score, receiver score, server number',
      court: 'Court diagram: 20 feet wide, 44 feet long, kitchen 7 feet',
      rally: 'Court diagram: a rally across the net',
      changes: 'Court diagram: 2026 rule changes'
    },
    fr: {
      kitchen: 'Schéma du terrain : la zone de non-volée (cuisine) est en surbrillance',
      serving: 'Schéma du terrain : le service va en diagonale vers le carré de service opposé',
      lines: 'Schéma du terrain : une balle qui touche une ligne est bonne',
      faults: 'Schéma du terrain : le filet et les lignes de la cuisine sont en surbrillance',
      scoring: 'Exemple de tableau de score : score du serveur, du relanceur, numéro du serveur',
      court: 'Schéma du terrain : 6,10 m de large, 13,40 m de long, cuisine 2,13 m',
      rally: 'Schéma du terrain : un échange par-dessus le filet',
      changes: 'Schéma du terrain : changements de règles 2026'
    }
  };

  const COURT = '#0b4e7c';
  const LINE = '#ffffff';
  const HI = '#fde047';

  // Top view, 5 units per foot: court x 10..110, y 5..225, net at y 115,
  // kitchen lines at y 80 and 150, centre line at x 60.
  function base(extra) {
    return (
      `<rect x="0" y="0" width="120" height="230" rx="8" fill="#15803d"/>` +
      `<rect x="10" y="5" width="100" height="220" fill="${COURT}"/>` +
      (extra && extra.under ? extra.under : '') +
      `<g stroke="${LINE}" stroke-width="2" fill="none">` +
      `<rect x="10" y="5" width="100" height="220"/>` +
      `<line x1="10" y1="80" x2="110" y2="80"/><line x1="10" y1="150" x2="110" y2="150"/>` +
      `<line x1="60" y1="5" x2="60" y2="80"/><line x1="60" y1="150" x2="60" y2="225"/></g>` +
      `<line x1="4" y1="115" x2="116" y2="115" stroke="${LINE}" stroke-width="3" stroke-dasharray="4 3"/>` +
      (extra && extra.over ? extra.over : '')
    );
  }

  const ball = (x, y) =>
    `<circle cx="${x}" cy="${y}" r="7" fill="#d9f03c" stroke="#fff" stroke-width="1.5"/>`;

  const DRAW = {
    kitchen: () =>
      base({
        under: `<rect x="10" y="80" width="100" height="35" fill="${HI}" opacity="0.6"/><rect x="10" y="115" width="100" height="35" fill="${HI}" opacity="0.6"/>`
      }),
    serving: () =>
      base({
        under: `<rect x="10" y="5" width="50" height="75" fill="${HI}" opacity="0.55"/>`,
        over:
          `<path d="M88 214 L38 44" stroke="${HI}" stroke-width="3" stroke-dasharray="6 4" fill="none"/>` +
          `<path d="M38 44 l-2 12 m2 -12 l10 6" stroke="${HI}" stroke-width="3" fill="none"/>` +
          ball(88, 214)
      }),
    lines: () =>
      base({
        over:
          `<rect x="10" y="5" width="100" height="220" fill="none" stroke="${HI}" stroke-width="4"/>` +
          ball(110, 60)
      }),
    faults: () =>
      base({
        over:
          `<line x1="4" y1="115" x2="116" y2="115" stroke="${HI}" stroke-width="4"/>` +
          `<line x1="10" y1="80" x2="110" y2="80" stroke="${HI}" stroke-width="4"/>` +
          `<line x1="10" y1="150" x2="110" y2="150" stroke="${HI}" stroke-width="4"/>`
      }),
    court: () =>
      base({
        over:
          `<g fill="${HI}" font-family="Inter,Arial,sans-serif" font-weight="700" font-size="11" text-anchor="middle">` +
          `<text x="60" y="200">20 ft</text><text x="60" y="63">7 ft</text>` +
          `<text x="36" y="118" transform="rotate(-90 36 118)">44 ft</text></g>`
      }),
    rally: () =>
      base({
        over:
          `<path d="M38 205 L84 40 L44 190" stroke="${HI}" stroke-width="3" stroke-dasharray="6 4" fill="none"/>` +
          ball(44, 190)
      }),
    changes: () =>
      base({
        under: `<rect x="10" y="80" width="100" height="70" fill="${HI}" opacity="0.35"/>`,
        over: `<text x="60" y="124" fill="#fff" font-family="Inter,Arial,sans-serif" font-weight="800" font-size="26" text-anchor="middle">2026</text>`
      })
  };

  function scoreboard() {
    return (
      `<rect x="0" y="0" width="120" height="230" rx="8" fill="#15803d"/>` +
      `<rect x="8" y="70" width="104" height="80" rx="8" fill="#0f172a"/>` +
      `<text x="60" y="118" fill="#fff" font-family="Inter,Arial,sans-serif" font-weight="800" font-size="26" text-anchor="middle">7-4-2</text>` +
      `<text x="60" y="140" fill="${HI}" font-family="Inter,Arial,sans-serif" font-weight="700" font-size="9" text-anchor="middle">server · receiver · #</text>`
    );
  }

  function topicFor(tags) {
    const list = Array.isArray(tags) ? tags.map((t) => String(t || '').trim()) : [];
    for (const [tag, topic] of TOPIC_BY_TAG) {
      if (list.includes(tag)) return topic;
    }
    return '';
  }

  function svgFor(tags, lang) {
    const topic = topicFor(tags);
    if (!topic) return '';
    const labels = LABELS[lang === 'fr' ? 'fr' : 'en'];
    const body = topic === 'scoring' ? scoreboard() : DRAW[topic]();
    return (
      `<svg class="wt-court-diagram" data-topic="${topic}" viewBox="0 0 120 230" role="img" ` +
      `aria-label="${labels[topic]}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`
    );
  }

  window.WT_Court = { topicFor, svgFor, TOPIC_BY_TAG };
})();
