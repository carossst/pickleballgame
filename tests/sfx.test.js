'use strict';

const {
  loadBrowserScript,
  createWindowLike
} = require('./helpers/browser-loader');

function setup(options) {
  const o = options || {};
  const calls = { vibrate: [], contexts: 0, notes: 0 };
  class FakeAudioContext {
    constructor() {
      calls.contexts += 1;
      this.currentTime = 0;
      this.state = 'running';
      this.destination = {};
    }
    createOscillator() {
      calls.notes += 1;
      return {
        type: '',
        frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
        connect() {},
        start() {},
        stop() {}
      };
    }
    createGain() {
      return {
        gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
        connect() {}
      };
    }
  }
  const windowLike = createWindowLike({
    navigator: {
      language: 'en-US',
      vibrate: o.noVibrate
        ? undefined
        : (pattern) => calls.vibrate.push(pattern)
    },
    matchMedia: () => ({ matches: Boolean(o.reducedMotion) }),
    AudioContext: o.noAudio ? undefined : FakeAudioContext
  });
  if (o.saved) windowLike.localStorage.setItem('wt-sfx', o.saved);
  const sfx = loadBrowserScript('sfx.js', { window: windowLike }).window.WT_SFX;
  return { sfx, calls, windowLike };
}

test('sound is off by default and no audio is created until it is switched on', () => {
  const { sfx, calls } = setup();
  expect(sfx.isEnabled()).toBe(false);
  sfx.play('correct');
  expect(calls.contexts).toBe(0);
  expect(calls.notes).toBe(0);
});

test('switching sound on is remembered and answers then make a sound', () => {
  const { sfx, calls, windowLike } = setup();
  sfx.setEnabled(true);
  expect(windowLike.localStorage.getItem('wt-sfx')).toBe('on');
  sfx.play('correct');
  expect(calls.notes).toBeGreaterThan(0);
  const again = setup({ saved: 'on' });
  expect(again.sfx.isEnabled()).toBe(true);
});

test('vibration is short for a right answer, longer for a wrong one, and optional', () => {
  const { sfx, calls } = setup();
  sfx.play('correct');
  sfx.play('wrong');
  expect(calls.vibrate).toEqual([15, [35, 40, 35]]);
  expect(() => setup({ noVibrate: true }).sfx.play('wrong')).not.toThrow();
});

test('no vibration when the user asks for reduced motion', () => {
  const { sfx, calls } = setup({ reducedMotion: true });
  sfx.play('wrong');
  expect(calls.vibrate).toEqual([]);
});

test('works without the Web Audio API', () => {
  const { sfx } = setup({ noAudio: true, saved: 'on' });
  expect(() => sfx.play('correct')).not.toThrow();
});
