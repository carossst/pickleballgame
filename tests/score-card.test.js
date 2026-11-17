'use strict';

const { loadBrowserScript } = require('./helpers/browser-loader');

function load() {
  return loadBrowserScript('score-card.js', { window: {} }).window.WT_ScoreCard;
}

function recorder() {
  const texts = [];
  const ctx = new Proxy(
    {},
    {
      get(target, name) {
        if (name === 'fillText') return (text) => texts.push(String(text));
        return () => {};
      },
      set() {
        return true;
      }
    }
  );
  return { ctx, texts };
}

test('card shows the score, the call to action and the address', () => {
  const { draw } = load();
  const { ctx, texts } = recorder();
  draw(ctx, { score: 7, lang: 'en' });
  expect(texts).toContain('7');
  expect(texts).toContain('Can you beat me?');
  expect(texts).toContain('pickleballrulesquiz.com');
});

test('French card uses the French name and address', () => {
  const { draw } = load();
  const { ctx, texts } = recorder();
  draw(ctx, { score: 6, correct: 5, total: 5, lang: 'fr' });
  expect(texts).toContain('Défi des règles du pickleball');
  expect(texts).toContain('pickleballrulesquiz.com/fr.html');
  expect(texts).toContain('6');
  expect(texts).toContain('5/5 bonnes réponses');
});

test('score is clamped to a whole number and the file name carries it', () => {
  const { draw, fileName } = load();
  const { ctx, texts } = recorder();
  draw(ctx, { score: -3.7 });
  expect(texts).toContain('0');
  expect(fileName(12.9)).toBe('pickleball-score-12.png');
});
