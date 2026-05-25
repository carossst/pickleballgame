'use strict';

const { loadBrowserScript } = require('./helpers/browser-loader');

function loadConfig(hostname) {
  const context = loadBrowserScript('config.js', {
    window: {
      location: { hostname: hostname || 'localhost' }
    }
  });
  return context.window.WT_CONFIG;
}

test('config exposes localized app URLs for EN and FR entry pages', () => {
  const cfg = loadConfig('localhost');

  expect(cfg.identity.appUrlsByLocale).toEqual({
    en: 'https://pickleballrulesquiz.com/',
    fr: 'https://pickleballrulesquiz.com/fr.html'
  });
});

test('leaderboard nickname bounds stay aligned with current UX contract', () => {
  const cfg = loadConfig('localhost');

  expect(cfg.leaderboard.nicknameMinLen).toBe(3);
  expect(cfg.leaderboard.nicknameMaxLen).toBe(24);
  expect(cfg.leaderboard.nicknameRegexSource).toBe(
    '^[\\p{L}\\p{N}][\\p{L}\\p{N} _-]{2,23}$'
  );
});

test('curated free runs stay limited to the two opening runs', () => {
  const cfg = loadConfig('localhost');

  expect(cfg.curatedFreeRuns.enabled).toBe(true);
  expect(cfg.curatedFreeRuns.runCount).toBe(2);
  expect(cfg.curatedFreeRuns.cardIdsByRun['1']).toHaveLength(10);
  expect(cfg.curatedFreeRuns.cardIdsByRun['2']).toHaveLength(12);
});

test('leaderboard keeps local visual seed rows for UI testing', () => {
  const cfg = loadConfig('localhost');

  expect(cfg.leaderboard.seedScores.weekly).toHaveLength(10);
  expect(cfg.leaderboard.seedScores.all).toHaveLength(10);
});
