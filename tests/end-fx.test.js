'use strict';

const { loadBrowserScript } = require('./helpers/browser-loader');

function load() {
  return loadBrowserScript('end-fx.js', { window: {} }).window.WT_EndFx;
}

describe('end-fx tier', () => {
  it('is perfect when every answer of a full game is right', () => {
    expect(load().tier(5, 5, 6)).toBe('perfect');
  });

  it('is good with a score of 3 or more, or 60% right', () => {
    expect(load().tier(4, 5, 4)).toBe('good');
    expect(load().tier(3, 5, 2)).toBe('good');
  });

  it('keeps encouraging below that', () => {
    expect(load().tier(1, 5, 1)).toBe('keep');
    expect(load().tier(0, 0, 0)).toBe('keep');
  });
});

describe('play-fx streak milestones', () => {
  const fx = () =>
    loadBrowserScript('play-fx.js', {
      window: { matchMedia: () => ({ matches: false }) },
      document: {
        readyState: 'complete',
        body: null,
        getElementById: () => null,
        addEventListener() {},
        querySelector: () => null
      }
    }).window.WT_PlayFx;

  it('celebrates 3, 5, 8, 12 and 20 in a row only', () => {
    const { streakMilestone } = fx();
    [3, 5, 8, 12, 20].forEach((n) => expect(streakMilestone(n)).toBe(true));
    [0, 1, 2, 4, 6, 9].forEach((n) => expect(streakMilestone(n)).toBe(false));
  });
});

describe('end-fx tiers for Rapid Fire and practice', () => {
  it('Rapid Fire: record needs a new best of 3+, solid from 5', () => {
    const { bonusTier } = load();
    expect(bonusTier(4, true)).toBe('record');
    expect(bonusTier(2, true)).toBe('');
    expect(bonusTier(6, false)).toBe('good');
    expect(bonusTier(3, false)).toBe('');
  });

  it('practice: only a clean sweep is celebrated', () => {
    const { practiceTier } = load();
    expect(practiceTier([true, true, true])).toBe('perfect');
    expect(practiceTier([true, false])).toBe('');
    expect(practiceTier([])).toBe('');
  });
});
