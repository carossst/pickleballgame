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
