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

test('power-ups: slow at 5 in a row, a life at 8 only if one was lost', () => {
  const { powerFor } = load();
  expect(powerFor({ streak: 4, chancesLeft: 3, maxChances: 3 })).toBe('');
  expect(powerFor({ streak: 5, chancesLeft: 3, maxChances: 3 })).toBe('slow');
  expect(powerFor({ streak: 8, chancesLeft: 2, maxChances: 3 })).toBe('life');
  expect(powerFor({ streak: 8, chancesLeft: 3, maxChances: 3 })).toBe('slow');
  expect(powerFor({ streak: 9, chancesLeft: 1, maxChances: 3 })).toBe('');
});

test('the boss is the last question of a deck of at least five', () => {
  const { isBoss } = load();
  expect(isBoss(4, 5)).toBe(true);
  expect(isBoss(3, 5)).toBe(false);
  expect(isBoss(2, 3)).toBe(false);
});

test('slow power-up lowers the fall speed only while it lasts', () => {
  const { speedFactor } = load();
  expect(speedFactor({ slowUntil: 2000 }, 1000)).toBe(0.6);
  expect(speedFactor({ slowUntil: 2000 }, 2500)).toBe(1);
  expect(speedFactor(undefined, 1000)).toBe(1);
});
