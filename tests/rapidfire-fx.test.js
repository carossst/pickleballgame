'use strict';

const { loadBrowserScript } = require('./helpers/browser-loader');

function load() {
  return loadBrowserScript('rapidfire-fx.js', { window: {} }).window.WT_RFX;
}

test('a new wave starts every five questions, from the sixth', () => {
  const { waveFor } = load();
  expect(waveFor(0)).toBe(0);
  expect(waveFor(4)).toBe(0);
  expect(waveFor(5)).toBe(2);
  expect(waveFor(10)).toBe(3);
  expect(waveFor(7)).toBe(0);
});

test('the only power-up is a life, after 8 in a row, and only if one was lost', () => {
  const { powerFor } = load();
  expect(powerFor({ streak: 5, chancesLeft: 3, maxChances: 3 })).toBe('');
  expect(powerFor({ streak: 8, chancesLeft: 2, maxChances: 3 })).toBe('life');
  expect(powerFor({ streak: 8, chancesLeft: 3, maxChances: 3 })).toBe('');
  expect(powerFor({ streak: 9, chancesLeft: 1, maxChances: 3 })).toBe('');
});

test('the boss is the last question of a deck of at least five', () => {
  const { isBoss } = load();
  expect(isBoss(4, 5)).toBe(true);
  expect(isBoss(3, 5)).toBe(false);
  expect(isBoss(2, 3)).toBe(false);
});
