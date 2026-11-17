'use strict';

const { loadBrowserScript } = require('./helpers/browser-loader');

function loadClubLink() {
  return loadBrowserScript('club-link.js', { window: {} }).window.WT_ClubLink;
}

test('slug removes accents, spaces and symbols', () => {
  const { slug } = loadClubLink();
  expect(slug('Évry Pickle Club')).toBe('evry-pickle-club');
  expect(slug("  Pickle & Co. d'Annecy!  ")).toBe('pickle-co-d-annecy');
  expect(slug('***')).toBe('');
  expect(slug(null)).toBe('');
});

test('slug is short enough for the analytics 48 character cap with its prefix', () => {
  const { tag } = loadClubLink();
  expect(tag('coach', 'a'.repeat(100)).length).toBeLessThanOrEqual(48);
  expect(tag('club', 'a'.repeat(100)).length).toBeLessThanOrEqual(48);
});

test('tag uses the club or coach prefix and is empty without a usable name', () => {
  const { tag } = loadClubLink();
  expect(tag('club', 'Lyon Pickle')).toBe('club-lyon-pickle');
  expect(tag('coach', 'Marie Dupont')).toBe('coach-marie-dupont');
  expect(tag('club', '   ')).toBe('');
});

test('siteUrl tags the English and French entry pages', () => {
  const { siteUrl } = loadClubLink();
  expect(siteUrl({ lang: 'en', tag: 'club-lyon-pickle' })).toBe(
    'https://www.pickleballrulesquiz.com/?wt-source=club-lyon-pickle'
  );
  expect(siteUrl({ lang: 'fr', tag: 'club-lyon-pickle' })).toBe(
    'https://www.pickleballrulesquiz.com/fr.html?wt-source=club-lyon-pickle'
  );
});

test('siteUrl with a theme matches the Play button of the theme pages', () => {
  const { siteUrl } = loadClubLink();
  expect(siteUrl({ tag: 'club-x', theme: 'scoring-rules' })).toBe(
    'https://www.pickleballrulesquiz.com/?wt-source=club-x&wt-topic=scoring-rules&wt-topic-label=Scoring+%26+Readiness+Quiz&wt-entry=scoring-rules&wt-entry-label=Scoring+%26+Readiness+Quiz&wt-entry-type=theme'
  );
});

test('posterUrl carries the display name for a club or a coach', () => {
  const { posterUrl } = loadClubLink();
  expect(posterUrl({ lang: 'fr', kind: 'club', name: 'Évry Pickle' })).toBe(
    'https://www.pickleballrulesquiz.com/poster/?lang=fr&club=%C3%89vry+Pickle'
  );
  expect(posterUrl({ kind: 'coach', name: 'Marie' })).toBe(
    'https://www.pickleballrulesquiz.com/poster/?coach=Marie'
  );
});

test('theme list matches the generated quiz pages', () => {
  const fs = require('node:fs');
  const { THEMES } = loadClubLink();
  for (const theme of THEMES) {
    const html = fs.readFileSync(`quiz/${theme.slug}/index.html`, 'utf8');
    const label = encodeURIComponent(theme.label).replace(/%20/g, '+');
    expect(html).toContain(`wt-topic=${theme.slug}`);
    expect(html).toContain(
      `wt-topic-label=${label.replace(/\(/g, '%28').replace(/\)/g, '%29')}`
    );
  }
});
