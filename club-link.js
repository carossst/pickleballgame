/* Club and coach tracking links, shared by the poster and the Clubs page.
   A club link is the normal site address plus ?wt-source=club-<name>, which
   analytics.js copies into every GoatCounter event as "src-club-<name>". */
(() => {
  'use strict';

  const BASE = 'https://www.pickleballrulesquiz.com/';
  const MAX_SLUG = 40; // "coach-" + 40 stays under the 48 character cap of analytics.js

  // Same labels and parameters as the "Play" button of each /quiz/<theme>/ page.
  const THEMES = [
    { slug: 'kitchen-rules', label: 'Kitchen (Non-Volley Zone) Rules Quiz' },
    { slug: 'serving-rules', label: 'Serving Rules Quiz' },
    { slug: 'scoring-rules', label: 'Scoring & Readiness Quiz' },
    { slug: 'line-call-rules', label: 'Line Call Rules Quiz' },
    { slug: 'faults', label: 'Faults & Dead Ball Quiz' },
    { slug: '2026-rule-changes', label: '2026 Rule Changes Quiz' },
    { slug: 'court-and-equipment', label: 'Court & Equipment Quiz' },
    { slug: 'rally-rules', label: 'Rally Situations Quiz' }
  ];

  // "Évry Pickle Club" -> "evry-pickle-club". Accents are removed first, because
  // analytics.js would turn "é" into a hyphen.
  function slug(name) {
    return String(name == null ? '' : name)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, MAX_SLUG)
      .replace(/-+$/g, '');
  }

  // kind: "club" (default) or "coach". Returns "" when the name has no usable character.
  function tag(kind, name) {
    const s = slug(name);
    if (!s) return '';
    return (kind === 'coach' ? 'coach-' : 'club-') + s;
  }

  // Site address for a language, tagged, optionally opening a theme directly.
  function siteUrl(options) {
    const o = options || {};
    const url = new URL(o.lang === 'fr' ? 'fr.html' : '', BASE);
    if (o.tag) url.searchParams.set('wt-source', o.tag);
    const theme = THEMES.find((t) => t.slug === o.theme);
    if (theme) {
      url.searchParams.set('wt-topic', theme.slug);
      url.searchParams.set('wt-topic-label', theme.label);
      url.searchParams.set('wt-entry', theme.slug);
      url.searchParams.set('wt-entry-label', theme.label);
      url.searchParams.set('wt-entry-type', 'theme');
    }
    return url.toString();
  }

  // Poster address that shows the club name and carries the tag in its QR code.
  function posterUrl(options) {
    const o = options || {};
    const url = new URL('poster/', BASE);
    if (o.lang === 'fr') url.searchParams.set('lang', 'fr');
    const name = String(o.name == null ? '' : o.name).trim().slice(0, 60);
    if (name) url.searchParams.set(o.kind === 'coach' ? 'coach' : 'club', name);
    return url.toString();
  }

  window.WT_ClubLink = { THEMES, slug, tag, siteUrl, posterUrl };
})();
