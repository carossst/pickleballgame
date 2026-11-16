/* Answer sounds and vibration. Sound is off by default (many players are in a
   club or a locker room) and is switched on with the visible button. Vibration
   is short, Android only, and skipped when the user asks for reduced motion.
   Sounds are synthesised with the Web Audio API: no audio files to load. */
(() => {
  'use strict';

  const KEY = 'wt-sfx';
  let ctx = null;
  let enabled = false;

  function readPref() {
    try {
      return window.localStorage.getItem(KEY) === 'on';
    } catch (_) {
      return false;
    }
  }

  function writePref(on) {
    try {
      window.localStorage.setItem(KEY, on ? 'on' : 'off');
    } catch (_) {
      /* private mode: the choice just lasts for this visit */
    }
  }

  function audio() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
    } catch (_) {
      ctx = null;
    }
    return ctx;
  }

  // One short note: frequency glide, quick decay.
  function note(c, type, from, to, start, length, volume) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    const t0 = c.currentTime + start;
    osc.type = type;
    osc.frequency.setValueAtTime(from, t0);
    osc.frequency.exponentialRampToValueAtTime(to, t0 + length);
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + length);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + length + 0.02);
  }

  function sound(kind) {
    const c = audio();
    if (!c) return;
    if (c.state === 'suspended' && typeof c.resume === 'function') c.resume();
    if (kind === 'correct') {
      // paddle on ball: a short, bright "pop"
      note(c, 'triangle', 620, 980, 0, 0.09, 0.22);
      note(c, 'sine', 1240, 1500, 0.04, 0.07, 0.08);
    } else {
      // dull thud
      note(c, 'sine', 170, 70, 0, 0.18, 0.3);
    }
  }

  function vibrate(kind) {
    try {
      if (typeof window.navigator.vibrate !== 'function') return;
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      window.navigator.vibrate(kind === 'correct' ? 15 : [35, 40, 35]);
    } catch (_) {
      /* not supported */
    }
  }

  // kind: "correct" or "wrong"
  function play(kind) {
    const k = kind === 'correct' ? 'correct' : 'wrong';
    vibrate(k);
    if (enabled) sound(k);
  }

  function isEnabled() {
    return enabled;
  }

  function setEnabled(on) {
    enabled = Boolean(on);
    writePref(enabled);
    if (enabled) audio(); // created inside the click that switched sound on
    syncButton();
  }

  let button = null;

  function syncButton() {
    if (!button) return;
    button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    button.setAttribute('data-state', enabled ? 'on' : 'off');
    const label = enabled ? 'Sound on' : 'Sound off';
    const fr = /^fr/i.test(document.documentElement.lang || '');
    const text = fr ? (enabled ? 'Son activé' : 'Son coupé') : label;
    button.setAttribute('aria-label', text);
    button.setAttribute('title', text);
  }

  function mountButton() {
    if (!document.body || document.getElementById('wt-sfx-toggle')) return;
    button = document.createElement('button');
    button.type = 'button';
    button.id = 'wt-sfx-toggle';
    button.className = 'wt-sfx-toggle';
    button.innerHTML =
      '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">' +
      '<path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/>' +
      '<g class="wt-sfx-waves" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
      '<path d="M16 9.5a4 4 0 0 1 0 5"/><path d="M18.5 7a7.5 7.5 0 0 1 0 10"/></g>' +
      '<path class="wt-sfx-mute" d="M16 9l5 6M21 9l-5 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
      '</svg>';
    button.addEventListener('click', () => {
      setEnabled(!enabled);
      if (enabled) sound('correct'); // confirms that sound is on
    });
    document.body.appendChild(button);
    syncButton();
  }

  enabled = readPref();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountButton, { once: true });
  } else {
    mountButton();
  }

  window.WT_SFX = { play, isEnabled, setEnabled };
})();
