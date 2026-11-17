/* Rapid Fire effects: a paddle that returns the ball, wave banners, power-up
   capsules and a boss question. Visual effects and a bonus life only: the score
   rules and the fall speed are untouched. State lives in the UI runtime, and sync() redraws the effects
   from that state after every render so a re-render cannot drop them. */
(() => {
  'use strict';

  const WAVE_EVERY = 5; // questions per wave
  const LIFE_STREAK = 8;
  const PADDLE_MS = 450;
  const BANNER_MS = 1400;
  const CAPSULE_MS = 1200;
  const MIN_BOSS_DECK = 5;

  const TEXT = {
    en: { wave: 'WAVE', boss: 'BOSS', life: '+1 LIFE' },
    fr: { wave: 'VAGUE', boss: 'BOSS', life: '+1 VIE' }
  };

  // served = questions already served before the one that is about to fall.
  function waveFor(served) {
    const n = Math.floor(Number(served) || 0);
    return n > 0 && n % WAVE_EVERY === 0 ? n / WAVE_EVERY + 1 : 0;
  }

  // Power-up earned by a correct answer that makes this streak ("" = none).
  // Only a life: the fall speed is the owner's tuning and is never changed here.
  function powerFor(info) {
    const i = info || {};
    const streak = Math.floor(Number(i.streak) || 0);
    const lost = Number(i.chancesLeft) < Number(i.maxChances);
    return streak === LIFE_STREAK && lost ? 'life' : '';
  }

  function isBoss(index, total) {
    return Number(total) >= MIN_BOSS_DECK && Number(index) === Number(total) - 1;
  }

  function el(parent, className, text) {
    const node = document.createElement('div');
    node.className = className;
    if (text != null) node.textContent = text;
    parent.appendChild(node);
    return node;
  }

  // Replays an effect from where it should be now (negative delay), so the
  // animation continues instead of restarting after a re-render.
  function resume(node, startedAt, now) {
    node.style.animationDelay = `-${Math.max(0, now - startedAt)}ms`;
  }

  // laneEl: the falling lane; rf: effect state; options: { lang, chipEl, boss, now }
  function sync(laneEl, rf, options) {
    if (!laneEl || !rf) return;
    const o = options || {};
    const now = Number.isFinite(o.now) ? o.now : Date.now();
    const text = TEXT[o.lang === 'fr' ? 'fr' : 'en'];

    laneEl.querySelectorAll('.wt-rf-fx').forEach((node) => node.remove());

    const paddle = el(laneEl, 'wt-rf-fx wt-rf-paddle');
    if (rf.paddle && now - rf.paddle.t < PADDLE_MS) {
      paddle.classList.add(rf.paddle.side === 'right' ? 'is-hit-right' : 'is-hit-left');
      resume(paddle, rf.paddle.t, now);
    }

    if (rf.wave && now - rf.wave.t < BANNER_MS) {
      resume(el(laneEl, 'wt-rf-fx wt-rf-banner', `${text.wave} ${rf.wave.n}`), rf.wave.t, now);
    }
    if (rf.boss && now - rf.boss.t < BANNER_MS) {
      resume(el(laneEl, 'wt-rf-fx wt-rf-banner wt-rf-banner--boss', text.boss), rf.boss.t, now);
    }
    if (rf.power && now - rf.power.t < CAPSULE_MS) {
      const capsule = el(laneEl, `wt-rf-fx wt-rf-capsule wt-rf-capsule--${rf.power.kind}`, text[rf.power.kind]);
      resume(capsule, rf.power.t, now);
    }

    if (o.chipEl && o.chipEl.classList) {
      o.chipEl.classList.toggle('wt-bonus-chip--boss', Boolean(o.boss));
    }
  }

  window.WT_RFX = { waveFor, powerFor, isBoss, sync };
})();
