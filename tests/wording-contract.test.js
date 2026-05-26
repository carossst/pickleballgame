'use strict';

const {
  loadBrowserScript,
  createWindowLike,
  createDocumentLike
} = require('./helpers/browser-loader.js');

function loadWording() {
  const windowLike = createWindowLike();
  const documentLike = createDocumentLike();

  const context = loadBrowserScript('wording-en.js', {
    window: windowLike,
    document: documentLike
  });

  loadBrowserScript('wording-fr.js', {
    window: context.window,
    document: context.document
  });

  return context.window.WT_WORDING_ALL;
}

test('French wording keeps softened share copy and rank-based levels', () => {
  const wording = loadWording();
  const fr = wording.fr;

  expect(fr.end.shareTitle).toBe('Partager le jeu');
  expect(fr.share.ctaLabel).toBe('Copier le message');
  expect(fr.share.previewLabel).toBe('Aperçu du message');
  expect(fr.share.template).toContain('Je viens de découvrir Quiz Pickleball.');

  expect(fr.landing.dailyChallengeTitleTemplate).toBe(
    'Visez un score de {targetScore}+'
  );

  expect(fr.levels.byLevel[1].label).toBe('BRONZE');
  expect(fr.levels.byLevel[2].label).toBe('ARGENT');
  expect(fr.levels.byLevel[3].label).toBe('OR');
  expect(fr.levels.byLevel[4].label).toBe('PLATINE');
  expect(fr.levels.byLevel[5].label).toBe('DIAMANT');
  expect(fr.levels.byLevel[6].label).toBe('LÉGENDE');

  expect(fr.landing).not.toHaveProperty('progressSectionTitle');
  expect(fr.landing).not.toHaveProperty('progressSectionBody');
  expect(fr.leaderboard).not.toHaveProperty('statusBadge');
  expect(fr.leaderboard.weeklyResetLine).toBe('Remise à zéro : {localTime}');
});

test('English wording keeps challenge tone but drops maintenance copy and dead landing keys', () => {
  const wording = loadWording();
  const en = wording.en;

  expect(en.landing.tagline).toBe('**Think You Know Pickleball? Prove It.**');
  expect(en.landing.tagline).not.toContain('MAINTENANCE IN PROGRESS');

  expect(en.landing).not.toHaveProperty('progressSectionTitle');
  expect(en.landing).not.toHaveProperty('progressSectionBody');
  expect(en.leaderboard).not.toHaveProperty('statusBadge');

  expect(en.paywall.compactBullets).toContain('**Unlimited games**');
  expect(en.paywall.bridgeBody).toContain('Unlock unlimited games');
  expect(en.end.shareTitle).toBe('Challenge a friend');
});
