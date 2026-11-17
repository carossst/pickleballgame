// ui.js - Quiz UI
// UI-only: rendering, accessibility, interactions (V2 RUN)

void (function () {
  'use strict';

  const ENUMS = window.WT_ENUMS;
  if (!ENUMS || !ENUMS.UI_STATES || !ENUMS.GAME_MODES) {
    throw new Error('WT_ENUMS missing or invalid (UI_STATES / GAME_MODES)');
  }

  const STATES = ENUMS.UI_STATES;
  const MODES = ENUMS.GAME_MODES;

  if (!window.WT_CONFIG || !window.WT_WORDING) {
    throw new Error('WT_CONFIG or WT_WORDING missing');
  }

  // ============================================
  // Helpers
  // ============================================
  function isPremiumNow(storage) {
    if (!storage || typeof storage.isPremium !== 'function') return false;
    try {
      return storage.isPremium() === true;
    } catch (_) {
      return false;
    }
  }

  function el(id) {
    const node = document.getElementById(id);
    if (!node) {
      throw new Error('UI element missing: #' + id);
    }
    return node;
  }

  function renderIcon(name, options) {
    const icons = window.WT_ICONS;
    if (!icons || typeof icons.renderIcon !== 'function') {
      throw new Error(
        'WT_ICONS.renderIcon missing. icons.js must load before ui.js.'
      );
    }
    return icons.renderIcon(name, options || {});
  }
  // Contract:
  // - Device-only UI flags are persisted through StorageManager helpers.
  // - UI must not read/write localStorage directly for these flags.
  // - All other persistence (runs, stats, economy, post-completion, etc.) is owned by StorageManager.

  // Decode HTML entities (for obfuscated emails like "bonjour&#64;...")
  function decodeHtmlEntities(str) {
    const s = String(str || '').trim();
    if (!s) return '';
    try {
      const el = document.createElement('textarea');
      el.innerHTML = s;
      return String(el.value || '').trim();
    } catch (_) {
      throw new Error('decodeHtmlEntities failed');
    }
  }

  function hasSolvedSecretChestHint(storage) {
    if (!storage || typeof storage.hasSolvedSecretChestHint !== 'function')
      return false;
    try {
      return storage.hasSolvedSecretChestHint() === true;
    } catch (_) {
      return false;
    }
  }

  function markSolvedSecretChestHint(storage) {
    if (!storage || typeof storage.markSolvedSecretChestHint !== 'function')
      return;
    try {
      storage.markSolvedSecretChestHint();
    } catch (_) {}
  }

  function hasShownSecretChestWelcome(storage) {
    if (!storage || typeof storage.hasShownSecretChestWelcome !== 'function')
      return false;
    try {
      return storage.hasShownSecretChestWelcome() === true;
    } catch (_) {
      return false;
    }
  }

  function markShownSecretChestWelcome(storage) {
    if (!storage || typeof storage.markShownSecretChestWelcome !== 'function')
      return;
    try {
      storage.markShownSecretChestWelcome();
    } catch (_) {}
  }

  function hasSeenFirstRunFraming(storage) {
    if (!storage || typeof storage.hasSeenFirstRunFraming !== 'function')
      return false;
    try {
      return storage.hasSeenFirstRunFraming() === true;
    } catch (_) {
      return false;
    }
  }

  function markSeenFirstRunFraming(storage) {
    if (!storage || typeof storage.markSeenFirstRunFraming !== 'function')
      return;
    try {
      storage.markSeenFirstRunFraming();
    } catch (_) {}
  }

  function getDailyChallengeToastDayKey(storage) {
    if (!storage || typeof storage.getDailyChallengeToastDayKey !== 'function')
      return '';
    try {
      return String(storage.getDailyChallengeToastDayKey() || '').trim();
    } catch (_) {
      return '';
    }
  }

  function markDailyChallengeToastShown(storage, dayKey) {
    if (!storage || typeof storage.markDailyChallengeToastShown !== 'function')
      return;
    try {
      storage.markDailyChallengeToastShown(dayKey);
    } catch (_) {}
  }

  function getRapidFireTicketBalance(storage) {
    if (!storage || typeof storage.getRapidFireTicketBalance !== 'function')
      return 0;
    try {
      return clampInt(storage.getRapidFireTicketBalance(), 0, 999);
    } catch (_) {
      return 0;
    }
  }

  function getRapidFireTicketCost(storage) {
    if (!storage || typeof storage.getRapidFireTicketCost !== 'function')
      return 1;
    try {
      return Math.max(1, clampInt(storage.getRapidFireTicketCost(), 1, 999));
    } catch (_) {
      return 1;
    }
  }

  function getDailyTicketEarnedDayKey(storage) {
    if (!storage || typeof storage.getDailyTicketEarnedDayKey !== 'function')
      return '';
    try {
      return String(storage.getDailyTicketEarnedDayKey() || '').trim();
    } catch (_) {
      return '';
    }
  }

  function generateRunUuid() {
    try {
      if (
        typeof crypto !== 'undefined' &&
        crypto &&
        typeof crypto.randomUUID === 'function'
      ) {
        return String(crypto.randomUUID());
      }
    } catch (_) {
      /* fall through */
    }
    const rand = Math.random().toString(36).slice(2, 10);
    return `run-${Date.now().toString(36)}-${rand}`;
  }

  function getLeaderboardContentVersion(cfg) {
    const contentVersion = String(
      cfg?.leaderboard?.contentVersion || ''
    ).trim();
    if (contentVersion) return contentVersion;
    const version = String(cfg?.version || '').trim();
    return version || 'unknown';
  }

  function grantStarterRapidFireTicketIfNeeded(storage) {
    if (
      !storage ||
      typeof storage.grantStarterRapidFireTicketIfNeeded !== 'function'
    ) {
      return { ok: false, granted: false, balance: 0, cap: 0 };
    }
    try {
      return (
        storage.grantStarterRapidFireTicketIfNeeded() || {
          ok: false,
          granted: false,
          balance: 0,
          cap: 0
        }
      );
    } catch (_) {
      return { ok: false, granted: false, balance: 0, cap: 0 };
    }
  }

  function grantDailyRapidFireTicket(storage, dayKey) {
    if (!storage || typeof storage.grantDailyRapidFireTicket !== 'function') {
      return { ok: false, granted: false, balance: 0, cap: 0, atCap: false };
    }
    try {
      return (
        storage.grantDailyRapidFireTicket(dayKey) || {
          ok: false,
          granted: false,
          balance: 0,
          cap: 0,
          atCap: false
        }
      );
    } catch (_) {
      return { ok: false, granted: false, balance: 0, cap: 0, atCap: false };
    }
  }

  function consumeRapidFireTicketOrBlock(storage) {
    if (
      !storage ||
      typeof storage.consumeRapidFireTicketOrBlock !== 'function'
    ) {
      return { ok: false, reason: 'NO_DATA', balance: 0, cost: 1 };
    }
    try {
      return (
        storage.consumeRapidFireTicketOrBlock() || {
          ok: false,
          reason: 'NO_DATA',
          balance: 0,
          cost: 1
        }
      );
    } catch (_) {
      return { ok: false, reason: 'NO_DATA', balance: 0, cost: 1 };
    }
  }

  function refundRapidFireTicket(storage, amount) {
    if (!storage || typeof storage.refundRapidFireTicket !== 'function') {
      return { ok: false, balance: 0, cap: 0 };
    }
    try {
      return (
        storage.refundRapidFireTicket(amount) || {
          ok: false,
          balance: 0,
          cap: 0
        }
      );
    } catch (_) {
      return { ok: false, balance: 0, cap: 0 };
    }
  }

  // Stats sharing prompt stage:
  // UI must NOT write localStorage directly (StorageManager owns persistence).
  function getStatsSharingPromptStage(storage) {
    if (!storage || typeof storage.getStatsSharingPromptStage !== 'function') {
      throw new Error('StorageManager.getStatsSharingPromptStage missing');
    }
    try {
      return storage.getStatsSharingPromptStage();
    } catch (_) {
      return -1;
    }
  }

  function setStatsSharingPromptStage(storage, stageIndex) {
    if (!storage || typeof storage.setStatsSharingPromptStage !== 'function')
      return;
    try {
      storage.setStatsSharingPromptStage(stageIndex);
    } catch (_) {}
  }

  function getStatsSharingPromptFlags(storage) {
    if (!storage || typeof storage.getStatsSharingPromptFlags !== 'function') {
      throw new Error('StorageManager.getStatsSharingPromptFlags missing');
    }
    try {
      return storage.getStatsSharingPromptFlags();
    } catch (_) {
      return 0;
    }
  }

  function setStatsSharingPromptFlags(storage, flags) {
    if (!storage || typeof storage.setStatsSharingPromptFlags !== 'function')
      return;
    try {
      storage.setStatsSharingPromptFlags(flags);
    } catch (_) {}
  }

  function pickOne(arr, fallback) {
    const list = Array.isArray(arr)
      ? arr.map((x) => String(x || '').trim()).filter(Boolean)
      : [];
    if (!list.length) return String(fallback || '').trim();
    const index = Math.floor(Math.random() * list.length);
    return list[index] || String(fallback || '').trim();
  }

  function supportsQuestionSpeech() {
    try {
      return (
        typeof window !== 'undefined' &&
        typeof window.speechSynthesis !== 'undefined' &&
        typeof window.SpeechSynthesisUtterance === 'function'
      );
    } catch (_) {
      return false;
    }
  }

  function getQuestionSpeechLocale() {
    let loc = '';
    try {
      if (window.WT_I18N && typeof window.WT_I18N.getLocale === 'function') {
        loc = String(window.WT_I18N.getLocale() || '')
          .trim()
          .toLowerCase();
      }
    } catch (_) {
      loc = '';
    }
    if (!loc) {
      try {
        loc = String(document.documentElement.getAttribute('lang') || '')
          .trim()
          .toLowerCase();
      } catch (_) {
        loc = '';
      }
    }
    if (loc === 'fr') return 'fr-FR';
    return 'en-US';
  }

  function getQuestionSpeechVoice(locale) {
    if (!supportsQuestionSpeech()) return null;
    try {
      const voices = Array.isArray(window.speechSynthesis.getVoices())
        ? window.speechSynthesis.getVoices()
        : [];
      if (!voices.length) return null;
      const target = String(locale || '')
        .trim()
        .toLowerCase();
      const primary = target.split(/[-_]/)[0];
      for (const voice of voices) {
        const lang = String(voice?.lang || '')
          .trim()
          .toLowerCase();
        if (lang === target) return voice;
      }
      for (const voice of voices) {
        const lang = String(voice?.lang || '')
          .trim()
          .toLowerCase();
        if (lang.split(/[-_]/)[0] === primary) return voice;
      }
    } catch (_) {
      /* silent */
    }
    return null;
  }

  function supportsQuestionSpeechForLocale(locale) {
    if (!supportsQuestionSpeech()) return false;
    return true;
  }

  function warmQuestionSpeechVoices(ui) {
    if (!supportsQuestionSpeech()) return;
    if (ui && ui._speechVoicesWarmed === true) return;
    try {
      window.speechSynthesis.getVoices();
      if (ui) ui._speechVoicesWarmed = true;
    } catch (_) {
      /* silent */
    }

    try {
      const synth = window.speechSynthesis;
      if (
        !synth ||
        typeof synth.addEventListener !== 'function' ||
        !ui ||
        ui._speechVoicesListenerBound === true
      ) {
        return;
      }
      const onVoicesChanged = () => {
        try {
          synth.getVoices();
        } catch (_) {
          /* silent */
        }
        ui._speechVoicesWarmed = true;
      };
      synth.addEventListener('voiceschanged', onVoicesChanged, { once: true });
      ui._speechVoicesListenerBound = true;
    } catch (_) {
      /* silent */
    }
  }

  function cancelQuestionSpeech(ui) {
    if (!ui || !ui._runtime) return;
    ui._runtime.questionSpeechActive = false;
    ui._runtime.questionSpeechKey = '';
    ui._runtime.questionSpeechText = '';
    try {
      if (supportsQuestionSpeech()) window.speechSynthesis.cancel();
    } catch (_) {
      /* silent */
    }
  }

  function getCurrentQuestionSpeechModel(ui) {
    if (!ui || ui.state !== STATES.PLAYING) return null;

    let item = null;
    try {
      item =
        ui.game && typeof ui.game.getCurrent === 'function'
          ? ui.game.getCurrent()
          : null;
    } catch (_) {
      item = null;
    }

    const questionText = String(item?.question || '').trim();
    const itemId = Number(item?.id || 0);
    if (!questionText) return null;

    const locale = getQuestionSpeechLocale();
    return {
      itemId,
      questionText,
      locale,
      speechKey: `${locale}:${itemId}:${questionText}`
    };
  }

  function isAutoReadQuestionsEnabled(storage) {
    if (!storage || typeof storage.getAutoReadQuestions !== 'function')
      return false;
    try {
      return storage.getAutoReadQuestions() === true;
    } catch (_) {
      return false;
    }
  }

  function shouldShowQuestionAudioControl() {
    return true;
  }

  function startQuestionSpeech(ui, model, opts) {
    const options = opts || {};
    if (!ui || !ui._runtime || !model || !supportsQuestionSpeech())
      return false;

    cancelQuestionSpeech(ui);

    try {
      const utterance = new window.SpeechSynthesisUtterance(model.questionText);
      utterance.lang = model.locale;
      const voice = getQuestionSpeechVoice(model.locale);
      if (voice) utterance.voice = voice;
      utterance.rate = 1;

      ui._runtime.questionSpeechActive = true;
      ui._runtime.questionSpeechKey = model.speechKey;
      ui._runtime.questionSpeechText = model.questionText;

      utterance.onend = () => {
        if (!ui._runtime || ui._runtime.questionSpeechKey !== model.speechKey)
          return;
        ui._runtime.questionSpeechActive = false;
        ui._runtime.questionSpeechKey = '';
        ui._runtime.questionSpeechText = '';
        if (ui.state === STATES.PLAYING) ui.render();
      };

      utterance.onerror = () => {
        if (!ui._runtime || ui._runtime.questionSpeechKey !== model.speechKey)
          return;
        ui._runtime.questionSpeechActive = false;
        ui._runtime.questionSpeechKey = '';
        ui._runtime.questionSpeechText = '';
        if (ui.state === STATES.PLAYING) ui.render();
      };

      window.speechSynthesis.cancel();
      if (typeof window.speechSynthesis.resume === 'function') {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.speak(utterance);

      if (options.render !== false) ui.render();
      return true;
    } catch (_) {
      cancelQuestionSpeech(ui);
      return false;
    }
  }

  function syncAutoReadCurrentQuestion(ui) {
    if (!ui || !ui._runtime) return;
    if (ui.state !== STATES.PLAYING) return;
    if (!supportsQuestionSpeech()) return;
    if (!isAutoReadQuestionsEnabled(ui.storage)) return;
    if (ui._runtime.feedbackPending) return;

    const model = getCurrentQuestionSpeechModel(ui);
    if (!model) return;
    if (ui._runtime.questionAutoReadDoneKey === model.speechKey) return;

    ui._runtime.questionAutoReadDoneKey = model.speechKey;
    startQuestionSpeech(ui, model, { render: true });
  }

  function markStatsSharingPromptFlag(storage, flagBit) {
    if (!storage || typeof storage.markStatsSharingPromptFlag !== 'function')
      return;
    try {
      storage.markStatsSharingPromptFlag(flagBit);
    } catch (_) {}
  }

  function getStatsSharingSnoozeUntilRunCompletes(storage) {
    if (
      !storage ||
      typeof storage.getStatsSharingSnoozeUntilRunCompletes !== 'function'
    ) {
      throw new Error(
        'StorageManager.getStatsSharingSnoozeUntilRunCompletes missing'
      );
    }
    try {
      return storage.getStatsSharingSnoozeUntilRunCompletes();
    } catch (_) {
      return 0;
    }
  }

  function snoozeStatsSharingPromptNextEnd(storage) {
    if (
      !storage ||
      typeof storage.snoozeStatsSharingPromptNextEnd !== 'function'
    )
      return;
    try {
      storage.snoozeStatsSharingPromptNextEnd();
    } catch (_) {}
  }

  const escapeHtml = window.WT_UTILS.escapeHtml;

  function clampInt(n, min, max) {
    const x = Number(n);
    if (!Number.isFinite(x)) return min;
    const v = Math.floor(x);
    return Math.min(max, Math.max(min, v));
  }

  function clampNonNegativeInt(n) {
    const x = Number(n);
    if (!Number.isFinite(x)) return 0;
    return Math.max(0, Math.floor(x));
  }

  function formatCents(cents, currency) {
    const n = Number(cents);
    if (!Number.isFinite(n)) return '';
    const dollars = (n / 100).toFixed(2);
    if (currency === 'USD') return `$${dollars}`;
    return `${dollars} ${currency}`;
  }

  function mmss(ms) {
    const t = Math.max(0, Math.floor(Number(ms || 0) / 1000));
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function isOnline() {
    return navigator.onLine !== false;
  }
  function fillTemplate(str, vars) {
    let out = String(str || '');
    const v = vars && typeof vars === 'object' ? vars : {};
    for (const k in v) {
      out = out.replaceAll(`{${k}}`, String(v[k]));
    }
    return out;
  }

  function getMomentumSegments(cfg) {
    const segments = Number(cfg?.ui?.momentumMeter?.segments);
    if (!Number.isFinite(segments)) return 0;
    if (!Number.isInteger(segments)) return 0;
    if (segments < 3 || segments > 10) return 0;
    return segments;
  }

  function getMomentumMeterState(cfg, streak, modeNow, currentLevel) {
    const mm =
      cfg?.ui?.momentumMeter && typeof cfg.ui.momentumMeter === 'object'
        ? cfg.ui.momentumMeter
        : null;

    if (!mm || mm.enabled !== true) return null;
    if (String(mm.mode || '').trim() !== String(modeNow || '').trim())
      return null;

    const segments = getMomentumSegments(cfg);
    if (!segments) return null;

    const th =
      mm.thresholds && typeof mm.thresholds === 'object' ? mm.thresholds : null;
    if (!th) return null;

    const thresholds = [];
    for (let i = 1; i <= segments; i += 1) {
      const raw = Number(th[`s${i}`]);
      if (!Number.isFinite(raw)) return null;
      thresholds.push(raw);
    }

    const safeStreak = clampInt(streak, 0, 9999);
    const safeLevel = clampInt(currentLevel, 0, segments);

    let target = 0;
    for (let i = 0; i < thresholds.length; i += 1) {
      if (safeStreak >= thresholds[i]) {
        target = i + 1;
      }
    }

    return {
      target,
      filled: Math.max(target, safeLevel),
      segments,
      streak: safeStreak,
      overflow: Math.max(0, safeStreak - segments)
    };
  }

  function getMomentumDropLevel(cfg, currentLevel) {
    const maxSegments = getMomentumSegments(cfg) || 6;
    const safeLevel = clampInt(currentLevel, 0, maxSegments);
    const rawTiers = cfg?.ui?.momentumMeter?.dropTiers;
    const tiers = Array.isArray(rawTiers) ? rawTiers : null;

    if (tiers && tiers.length) {
      for (const raw of tiers) {
        const minLevel = clampInt(raw?.minLevel, 0, maxSegments);
        const dropTo = clampInt(raw?.dropTo, 0, maxSegments);
        if (safeLevel >= minLevel) {
          return dropTo;
        }
      }
    }

    // Legacy fallback keeps the existing feel if config is absent or invalid:
    // 1-3 -> 0
    // 4-5 -> 2
    // 6+  -> 3
    if (safeLevel >= 6) return 3;
    if (safeLevel >= 4) return 2;
    return 0;
  }

  function createMicroPicsState(startChances) {
    const hasStartChances =
      startChances != null && Number.isFinite(Number(startChances));
    return {
      correctStreak: 0,
      maxCorrectStreak: 0,
      momentumLevel: 0,

      // #3/#4 runtime flags (UI-only)
      justRecoveredFromMistake: false,
      maxCorrectStreakDisplayed: 0,

      flowTierShown: 0,
      survivalShown: false,
      twoChancesShown: false,
      lastToastAtCount: -999,
      lastDangerAtCount: -999,
      lastDangerAtMs: 0,
      prevChancesLeft: hasStartChances ? clampInt(startChances, 0, 99) : null,

      // Near-miss + repeated mistakes (one-shot per RUN)
      nearMissShown: false,
      repeatMistakeShown: false,

      // Per-run memory: if a tier was reached before in this run, show "...Again" copy.
      tierShownOnce: {
        start: false,
        building: false,
        strong: false,
        elite: false,
        legendary: false
      },

      // END-only highlight (no gameplay interruptions)
      endHighlight: '',
      endHighlightVariant: '',
      endHighlightPriority: -1
    };
  }

  function getEndHighlightPriority(cfg, key) {
    const priorities =
      cfg?.microPics?.endHighlightPriorities &&
      typeof cfg.microPics.endHighlightPriorities === 'object'
        ? cfg.microPics.endHighlightPriorities
        : null;
    const safeKey = String(key || '').trim();
    const configured = Number(priorities?.[safeKey]);
    if (Number.isFinite(configured)) return Math.floor(configured);

    switch (safeKey) {
      case 'survival':
        return 40;
      case 'repeatMistake':
        return 50;
      case 'nearMiss':
        return 55;
      case 'runEndedAllChancesUsed':
        return 60;
      case 'streakStart':
        return 65;
      case 'recovery':
        return 70;
      case 'streakBuilding':
        return 70;
      case 'streakStrong':
        return 80;
      case 'streakElite':
        return 90;
      case 'streakLegendary':
        return 100;
      default:
        return 0;
    }
  }

  function getRunVerdictKeyFromScore(cfg, scoreFP) {
    const n = Number(scoreFP);
    if (!Number.isFinite(n)) return 'none';

    const th =
      cfg && cfg.routing && typeof cfg.routing.runScoreThresholds === 'object'
        ? cfg.routing.runScoreThresholds
        : null;

    if (!th) return 'none';

    const start = Number(th.start);
    const building = Number(th.building);
    const strong = Number(th.strong);
    const elite = Number(th.elite);
    const legendary = Number(th.legendary);

    if (Number.isFinite(legendary) && n >= legendary) return 'legendary';
    if (Number.isFinite(elite) && n >= elite) return 'elite';
    if (Number.isFinite(strong) && n >= strong) return 'strong';
    if (Number.isFinite(building) && n >= building) return 'building';
    if (Number.isFinite(start) && n >= start) return 'start';

    return 'none';
  }

  function getRunTierInfo(cfg, wording, scoreFP) {
    const safeScore = clampInt(scoreFP, 0, 99999);
    const th =
      cfg && cfg.routing && typeof cfg.routing.runScoreThresholds === 'object'
        ? cfg.routing.runScoreThresholds
        : null;
    const labels =
      wording && wording.end && typeof wording.end.labelByVerdict === 'object'
        ? wording.end.labelByVerdict
        : null;

    const ordered = [
      { key: 'start', target: Number(th?.start) },
      { key: 'building', target: Number(th?.building) },
      { key: 'strong', target: Number(th?.strong) },
      { key: 'elite', target: Number(th?.elite) },
      { key: 'legendary', target: Number(th?.legendary) }
    ].filter((item) => Number.isFinite(item.target) && item.target >= 1);

    const currentKey = getRunVerdictKeyFromScore(cfg, safeScore);
    const currentLabel = String(labels?.[currentKey] || '').trim();

    let currentFloor = 0;
    let nextKey = '';
    let nextLabel = '';
    let nextTarget = null;

    for (let i = 0; i < ordered.length; i += 1) {
      const item = ordered[i];
      if (safeScore >= item.target) {
        currentFloor = item.target;
        continue;
      }
      nextKey = item.key;
      nextTarget = item.target;
      nextLabel = String(labels?.[item.key] || '').trim();
      break;
    }

    let pct = 100;
    if (nextTarget != null) {
      const span = Math.max(1, nextTarget - currentFloor);
      pct = Math.round(((safeScore - currentFloor) / span) * 100);
      pct = clampInt(pct, 0, 100);
    }

    return {
      currentKey,
      currentLabel,
      currentFloor,
      nextKey,
      nextLabel,
      nextTarget,
      progressPct: pct
    };
  }

  function formatDailyResetCountdown(ms) {
    const safeMs = Math.max(0, Number(ms || 0));
    const totalMinutes = Math.max(1, Math.ceil(safeMs / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let locale = 'en';
    try {
      if (window.WT_I18N && typeof window.WT_I18N.getLocale === 'function') {
        locale = String(window.WT_I18N.getLocale() || 'en')
          .trim()
          .toLowerCase();
      }
    } catch (_) {
      locale = 'en';
    }

    if (locale === 'fr') {
      if (hours > 0)
        return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;
      return `${minutes} min`;
    }

    if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    return `${minutes}m`;
  }

  function getCommonDayKey(date = new Date()) {
    return [
      date.getUTCFullYear(),
      String(date.getUTCMonth() + 1).padStart(2, '0'),
      String(date.getUTCDate()).padStart(2, '0')
    ].join('-');
  }

  function getCommonChallengeIds(items, dayKey, count = 10) {
    const list = Array.isArray(items) ? items : [];
    const keyed = list
      .map((item) => {
        const id = Number(item?.id);
        if (!Number.isInteger(id) || id < 0) return null;
        let hash = 2166136261;
        const seed = `${dayKey}:${id}`;
        for (let i = 0; i < seed.length; i += 1) {
          hash ^= seed.charCodeAt(i);
          hash = Math.imul(hash, 16777619);
        }
        return { id, hash: hash >>> 0 };
      })
      .filter(Boolean)
      .sort((a, b) => a.hash - b.hash || a.id - b.id);
    return keyed.slice(0, clampInt(count, 1, 50)).map((entry) => entry.id);
  }

  function getQueryList(name) {
    try {
      const value = new URLSearchParams(window.location.search).get(name) || '';
      return value.split('.').map((item) => Number(item)).filter((id) => Number.isInteger(id) && id >= 0).slice(0, 50);
    } catch (_) {
      return [];
    }
  }

  function getDailyChallengeModel(cfg, wording, bestScoreFP, storage) {
    const safeBest = clampInt(bestScoreFP, 0, 99999);
    const tier = getRunTierInfo(cfg, wording, safeBest);

    const nowDate = new Date();
    const localDayKey = getCommonDayKey(nowDate);

    const dayStartMs = Date.UTC(nowDate.getUTCFullYear(), nowDate.getUTCMonth(), nowDate.getUTCDate());
    const dayEndMs = dayStartMs + 24 * 60 * 60 * 1000;
    const fallbackScore = 3;
    const candidateTargetScore =
      tier.nextTarget != null
        ? clampInt(tier.nextTarget, 1, 99999)
        : Math.max(fallbackScore, safeBest + 1);
    let targetScore = candidateTargetScore;
    try {
      if (storage && typeof storage.ensureDailyChallengeTarget === 'function') {
        targetScore = clampInt(
          storage.ensureDailyChallengeTarget(localDayKey, candidateTargetScore),
          1,
          99999
        );
      }
    } catch (_) {
      targetScore = candidateTargetScore;
    }

    let todayBestScore = 0;
    let todayRunCount = 0;
    try {
      if (storage && typeof storage.getLastRuns === 'function') {
        const lastRuns = storage.getLastRuns(20);
        const list = Array.isArray(lastRuns) ? lastRuns : [];
        for (const raw of list) {
          const run = raw && typeof raw === 'object' ? raw : {};
          const endedAt = Number(run.endedAt || 0);
          if (
            !Number.isFinite(endedAt) ||
            endedAt < dayStartMs ||
            endedAt >= dayEndMs
          )
            continue;

          const meta = run.meta && typeof run.meta === 'object' ? run.meta : {};
          const mode = String(meta.mode || '')
            .trim()
            .toUpperCase();
          if (mode !== 'RUN') continue;

          todayRunCount += 1;
          todayBestScore = Math.max(
            todayBestScore,
            clampInt(run.scoreFP, 0, 99999)
          );
        }
      }
    } catch (_) {
      todayBestScore = 0;
      todayRunCount = 0;
    }

    const scoreProgressPct = clampInt(
      Math.round(
        (Math.min(todayBestScore, targetScore) / Math.max(1, targetScore)) * 100
      ),
      0,
      100
    );
    const completedToday = todayBestScore >= targetScore;
    const progressPct = completedToday ? 100 : scoreProgressPct;
    const resetInMs = Math.max(0, dayEndMs - Date.now());
    const premium = isPremiumNow(storage);
    const runsBalance =
      storage && typeof storage.getRunsBalance === 'function'
        ? clampInt(storage.getRunsBalance(), 0, 999)
        : 0;
    const challengePlayable = premium || runsBalance > 0;
    const rewardAvailableToday =
      getDailyTicketEarnedDayKey(storage) !== localDayKey;
    const rewardPendingReplay =
      !premium && runsBalance > 0 && completedToday && rewardAvailableToday;
    const ticketCost = getRapidFireTicketCost(storage);
    const ticketBalance = getRapidFireTicketBalance(storage);
    const ticketCap =
      storage && typeof storage.getRapidFireTicketCap === 'function'
        ? clampInt(storage.getRapidFireTicketCap(), 0, 999)
        : 0;
    const ticketAtCap = ticketCap > 0 && ticketBalance >= ticketCap;

    return {
      dayKey: localDayKey,
      targetScore,
      progressPct,
      scoreProgressPct,
      todayBestScore,
      todayRunCount,
      completedToday,
      challengePlayable,
      rewardPendingReplay,
      rewardAvailableToday,
      ticketCost,
      ticketBalance,
      ticketCap,
      ticketAtCap,
      resetAt: dayEndMs,
      resetInMs,
      resetCountdown: formatDailyResetCountdown(resetInMs)
    };
  }

  function getNextDailyCountdownTickDelayMs() {
    const msIntoMinute = Date.now() % 60000;
    const wait = msIntoMinute === 0 ? 60000 : 60000 - msIntoMinute + 50;
    return clampInt(wait, 1000, 61000);
  }

  function syncScopedRenderTicker(ui, opts) {
    const o = opts && typeof opts === 'object' ? opts : {};
    const key = String(o.key || '').trim();
    const scope = String(o.scope || '').trim();
    const shouldRun = typeof o.shouldRun === 'function' ? o.shouldRun : null;
    const shouldContinueAfterRender =
      typeof o.shouldContinueAfterRender === 'function'
        ? o.shouldContinueAfterRender
        : shouldRun;
    const getDelayMs = typeof o.getDelayMs === 'function' ? o.getDelayMs : null;
    const onStop = typeof o.onStop === 'function' ? o.onStop : null;

    function stop() {
      if (key) clearUiTimer(key);
      if (onStop) {
        try {
          onStop(ui);
        } catch (_) {
          /* silent */
        }
      }
      return 0;
    }

    if (
      !ui ||
      typeof ui.render !== 'function' ||
      !key ||
      !shouldRun ||
      !getDelayMs
    ) {
      return stop();
    }

    if (shouldRun(ui) !== true) {
      return stop();
    }

    const delay = Number(getDelayMs(ui));
    if (!Number.isFinite(delay) || delay < 50) {
      return stop();
    }

    return setUiTimer(
      key,
      () => {
        if (shouldRun(ui) !== true) {
          stop();
          return;
        }

        try {
          ui.render();
        } catch (_) {
          /* silent */
        }

        if (shouldContinueAfterRender(ui) !== true) {
          stop();
          return;
        }

        syncScopedRenderTicker(ui, o);
      },
      Math.floor(delay),
      scope
    );
  }

  function shouldRefreshDailyCountdown(ui) {
    if (!ui || ui.state !== STATES.LANDING) return false;
    const counters =
      ui.storage && typeof ui.storage.getCounters === 'function'
        ? ui.storage.getCounters() || {}
        : null;
    const runCompletes = Number(counters?.runCompletes || 0);
    if (!Number.isFinite(runCompletes) || runCompletes < 1) return false;
    try {
      return !!(
        ui.appEl && ui.appEl.querySelector('[data-wt-daily-challenge-card]')
      );
    } catch (_) {
      return false;
    }
  }

  function syncDailyCountdownTicker(ui) {
    syncScopedRenderTicker(ui, {
      key: 'daily.countdown.refresh',
      scope: 'daily',
      shouldRun: shouldRefreshDailyCountdown,
      shouldContinueAfterRender: shouldRefreshDailyCountdown,
      getDelayMs: getNextDailyCountdownTickDelayMs
    });
  }

  function isEarlyPriceWindowActive(storage) {
    let ep = null;
    if (storage && typeof storage.getEarlyPriceState === 'function') {
      try {
        ep = storage.getEarlyPriceState() || null;
      } catch (_) {
        ep = null;
      }
    }

    return !!(
      ep &&
      String(ep.phase || '').toUpperCase() === 'EARLY' &&
      Number(ep.remainingMs || 0) > 0
    );
  }

  function shouldRefreshPaywallTimer(ui) {
    return !!(
      ui &&
      (ui.state === STATES.PAYWALL || ui.state === STATES.LANDING)
    );
  }

  function extractTermsFromItem(item) {
    const it = item && typeof item === 'object' ? item : {};
    return {
      question: String(it.question || '').trim(),
      correctAnswer:
        it.correctAnswer === true || it.correctAnswer === false
          ? it.correctAnswer
          : null,
      explanationShort: String(
        it.explanationShort || it.explanation || ''
      ).trim()
    };
  }

  function extractTagsFromItem(item) {
    const it = item && typeof item === 'object' ? item : {};

    if (Array.isArray(it.tags)) {
      return it.tags.map((x) => String(x || '').trim()).filter(Boolean);
    }

    const singleTag = String(it.tag || '').trim();
    return singleTag ? [singleTag] : [];
  }

  function formatExplanationForDisplay(raw, cfg, questionText) {
    const s = String(raw || '').trim();
    if (!s) return '';

    function softenExplanationLine(line) {
      const src = String(line || '').trim();
      if (!src) return '';

      // Keep citations and rule references exact.
      if (/(Rulebook|Rule\s+\d|page\s+\d|Section\s+\d)/i.test(src)) return src;

      return src
        .replace(/^This is /, "That's ")
        .replace(/^This was /, 'That was ')
        .replace(/^This includes /, 'That includes ')
        .replace(/^This applies /, 'That applies ')
        .replace(/^There is no /, "There's no ")
        .replace(/\bdo not\b/g, "don't")
        .replace(/\bdoes not\b/g, "doesn't")
        .replace(/\bis not\b/g, "isn't")
        .replace(/\bare not\b/g, "aren't");
    }

    const softened = s
      .split('\n')
      .map((line) => softenExplanationLine(line))
      .join('\n');

    const ed =
      cfg?.ui?.explanationDisplay &&
      typeof cfg.ui.explanationDisplay === 'object'
        ? cfg.ui.explanationDisplay
        : null;

    if (!ed || ed.enabled !== true) return escapeHtml(softened);

    const maxLines = clampInt(Number(ed.maxLines), 1, 4);
    const src = String(ed.splitRegex || '').trim();
    if (!src) return escapeHtml(softened);

    let r = null;
    try {
      r = new RegExp(src);
    } catch (_) {
      r = null;
    }
    if (!r) return escapeHtml(softened);

    const lines = [];
    let rest = softened;

    while (lines.length < maxLines - 1) {
      r.lastIndex = 0;
      const m = r.exec(rest);
      if (!m || typeof m.index !== 'number') break;

      const cutAt = m.index + String(m[0] || '').length;
      const a = rest.slice(0, cutAt).trim();
      const b = rest.slice(cutAt).trim();

      if (!a || !b) break;

      lines.push(a);
      rest = b;
    }

    lines.push(rest);

    const renderedLines = lines.map((line, index) => {
      const trimmed = String(line || '').trim();
      let html = escapeHtml(trimmed);
      const isLast = index === lines.length - 1;
      const isCitation =
        /(Rulebook|Equipment Standards Manual|Rule\s+\d|page\s+\d|Section\s+\d)/i.test(
          trimmed
        );
      if (isLast && isCitation)
        html = `<em class="wt-explanation__cite">${html}</em>`;
      return html;
    });

    let out = renderedLines.join('<br>');

    const question = String(questionText || '').trim();

    if (question) {
      const questionEsc = escapeHtml(question);
      out = out.replaceAll(questionEsc, `<strong>${questionEsc}</strong>`);
    }

    return out;
  }

  function renderBrandingRow(config, showText, forceNoLink) {
    const logoUrl = String(config?.identity?.uiLogoUrl || '').trim();
    const appName = String(config?.identity?.appName || '').trim();

    if (!logoUrl) return '';

    const modifier = showText ? '' : ' wt-branding--logo-only';
    const nameHtml = showText
      ? `<span class="wt-branding-name">${escapeHtml(appName)}</span>`
      : '';

    const inner = `
      <img src="${escapeHtml(logoUrl)}" alt="" class="wt-branding-logo" />
      ${nameHtml}
    `;

    // Option A (product): branding always routes to LANDING (internal), never to an external URL.
    // Uses existing delegated action: data-action="go-home".
    if (forceNoLink !== true) {
      const landingHref = `${location.pathname}${location.search}`;
      return `
        <a class="wt-branding${modifier}" href="${escapeHtml(landingHref)}" data-action="go-home" aria-label="${escapeHtml(appName)}">
          ${inner}
        </a>
      `;
    }

    return `
      <div class="wt-branding${modifier}">
        ${inner}
      </div>
    `;
  }

  function renderTextWithStrong(value) {
    const text = String(value || '');
    if (!text) return '';

    return text
      .split(/(\*\*[^*]+\*\*)/g)
      .filter(Boolean)
      .map((part) => {
        if (/^\*\*[^*]+\*\*$/.test(part)) {
          return `<strong>${escapeHtml(part.slice(2, -2))}</strong>`;
        }
        return escapeHtml(part);
      })
      .join('');
  }

  // Mobile-first: tap-to-continue only on touch-like devices (coarse pointer)
  function shouldTapToContinue() {
    try {
      return (
        window.matchMedia && window.matchMedia('(pointer: coarse)').matches
      );
    } catch (_) {
      return false;
    }
  }

  // ============================================
  // UI Timer Scheduler
  // ============================================
  // Centralizes named UI timers without changing visible timings.
  // Each key owns at most one active timeout. Setting the same key replaces it cleanly.
  const uiTimerRegistry = new Map();
  const runtimeTimerOwners = new Map();

  function getRuntimeTimerScope(prop, explicitScope) {
    const explicit = String(explicitScope || '').trim();
    if (explicit) return explicit;

    const p = String(prop || '').trim();

    if (
      p === 'endRecordMomentTimer' ||
      p === 'endAutoModalTimerId' ||
      p === 'finishFadeOutTimerId' ||
      p === 'finishFadeInStartTimerId' ||
      p === 'finishFadeCleanupTimerId'
    ) {
      return 'end';
    }

    if (
      p === 'feedbackRevealTimerId' ||
      p === 'feedbackAutoAdvanceTimerId' ||
      p === 'bonusAnswerFeedbackTimerId'
    ) {
      return 'feedback';
    }

    if (
      p === 'bonusEndTimerId' ||
      p === 'hudPulseCleanupTimerId' ||
      p === 'gameOverAfterFeedbackTimerId'
    ) {
      return 'playing';
    }

    return 'playing';
  }

  function setUiTimer(key, fn, ms, scope) {
    const name = String(key || '').trim();
    if (!name || typeof fn !== 'function') return 0;

    const delay = Number(ms);
    if (!Number.isFinite(delay) || delay < 0) return 0;

    clearUiTimer(name);

    const id = window.setTimeout(() => {
      uiTimerRegistry.delete(name);
      fn();
    }, Math.floor(delay));

    uiTimerRegistry.set(name, {
      id,
      scope: String(scope || '').trim()
    });

    return id;
  }

  function clearUiTimer(key) {
    const name = String(key || '').trim();
    if (!name) return;

    const entry = uiTimerRegistry.get(name);
    if (!entry) return;

    try {
      window.clearTimeout(entry.id);
    } catch (_) {}
    uiTimerRegistry.delete(name);

    const owner = runtimeTimerOwners.get(name);
    if (owner && owner.ui && owner.ui._runtime && owner.prop) {
      owner.ui._runtime[owner.prop] = null;
    }
    runtimeTimerOwners.delete(name);
  }

  function clearUiTimersByScope(scope) {
    const target = String(scope || '').trim();
    if (!target) return;

    Array.from(uiTimerRegistry.entries()).forEach(([key, entry]) => {
      if (entry && entry.scope === target) clearUiTimer(key);
    });
  }

  function runtimeTimerKey(prop) {
    return `runtime.${String(prop || '').trim()}`;
  }

  function setRuntimeTimer(ui, prop, fn, ms, scope) {
    if (!ui || !ui._runtime) return 0;
    const key = runtimeTimerKey(prop);
    clearRuntimeTimer(ui, prop);

    runtimeTimerOwners.set(key, { ui, prop });
    const id = setUiTimer(
      key,
      () => {
        runtimeTimerOwners.delete(key);
        if (ui._runtime) ui._runtime[prop] = null;
        fn();
      },
      ms,
      getRuntimeTimerScope(prop, scope)
    );

    if (!id) runtimeTimerOwners.delete(key);
    ui._runtime[prop] = id || null;
    return id;
  }

  function clearRuntimeTimer(ui, prop) {
    if (!prop) return;
    clearUiTimer(runtimeTimerKey(prop));
    if (ui && ui._runtime) ui._runtime[prop] = null;
  }

  // ============================================
  // Toast
  // ============================================

  const UI_TIMING_LIMITS = Object.freeze({
    delayMsMax: 4000,
    durationMsMin: 200,
    durationMsMax: 5000,
    pulseMsMax: 4000
  });

  // ============================================
  // Overlay Controller
  // ============================================
  // Orchestration-only layer: keep visible overlays and copy unchanged,
  // but centralize priorities and same-family replacement.
  function normalizeOverlayId(typeOrId) {
    const id = String(typeOrId || '').trim();
    if (!id) return '';

    if (id === 'toast') return 'toast';
    if (id === 'transient' || id === 'gameplay' || id === 'wt-gameplay-overlay')
      return 'gameplay';
    if (id === 'blocking') return 'blocking';
    if (
      id === 'chance' ||
      id === 'chance-lost' ||
      id === 'wt-chance-lost-overlay'
    )
      return 'chance';
    if (
      id === 'runstart' ||
      id === 'run-start' ||
      id === 'wt-run-start-overlay'
    )
      return 'runstart';

    return id;
  }

  function isModalBlockingVisible() {
    const modal = document.getElementById('modal');
    return !!(
      modal &&
      modal.classList &&
      !modal.classList.contains('wt-hidden')
    );
  }

  function isBlockingOverlayVisible() {
    return (
      isOverlayVisible('wt-chance-lost-overlay') ||
      isOverlayVisible('wt-run-start-overlay')
    );
  }

  function isTransientOverlayVisible() {
    return isOverlayVisible('wt-gameplay-overlay');
  }

  function hideToast() {
    clearUiTimer('toast.show');
    clearUiTimer('toast.hide');

    const node = document.getElementById('toast');
    if (node && node.classList) {
      node.classList.remove('wt-toast--visible');
    }
  }

  function hideOverlay(typeOrId) {
    const id = normalizeOverlayId(typeOrId);
    if (!id) return;

    if (id === 'toast') {
      hideToast();
      return;
    }

    if (id === 'transient' || id === 'gameplay') {
      hideGameplayOverlay();
      return;
    }

    if (id === 'blocking') {
      hideChanceLostOverlay();
      hideRunStartOverlay();
      return;
    }

    if (id === 'chance') {
      hideChanceLostOverlay();
      return;
    }

    if (id === 'runstart') {
      hideRunStartOverlay();
      return;
    }
  }

  function canShowToast() {
    return !(
      isModalBlockingVisible() ||
      isBlockingOverlayVisible() ||
      isTransientOverlayVisible()
    );
  }

  function showTransientOverlay(typeOrId, renderFn) {
    const id = normalizeOverlayId(typeOrId);
    if (!id) return false;

    // Priority: modal / blocking overlay > transient overlay > toast.
    if (isModalBlockingVisible() || isBlockingOverlayVisible()) return false;

    hideOverlay('toast');

    // Same-family replacement: a new transient overlay replaces the old one cleanly.
    if (id === 'gameplay') {
      hideGameplayOverlay();
    }

    if (typeof renderFn === 'function') renderFn();
    return true;
  }

  function showBlockingOverlay(typeOrId, renderFn) {
    const id = normalizeOverlayId(typeOrId);
    if (!id) return false;

    // Modal is the top blocking layer. Never put a gameplay overlay above it.
    if (isModalBlockingVisible()) return false;

    // Chance / game-over overlay keeps priority over run-start.
    if (id === 'runstart' && isOverlayVisible('wt-chance-lost-overlay'))
      return false;

    hideOverlay('toast');
    hideOverlay('transient');

    // Same-family replacement + explicit blocking priority.
    if (id === 'chance') hideRunStartOverlay();
    if (id === 'runstart') hideRunStartOverlay();

    if (typeof renderFn === 'function') renderFn();
    return true;
  }

  function applyToastVariantClass(node, variant) {
    if (!node) return;
    node.classList.remove(
      'wt-toast--info',
      'wt-toast--success',
      'wt-toast--danger'
    );

    const v = String(variant || '').trim();
    if (v === 'info') node.classList.add('wt-toast--info');
    else if (v === 'success') node.classList.add('wt-toast--success');
    else if (v === 'danger') node.classList.add('wt-toast--danger');
  }

  function showToast(message, opts) {
    if (!canShowToast()) return;

    const node = el('toast');
    if (!node) return;

    const text = String(message || '').trim();
    if (!text) return;

    const o = opts && typeof opts === 'object' ? opts : null;
    const durationMs = o ? Number(o.durationMs) : NaN;

    // No silent fallback: if duration isn't valid, we don't show a toast.
    if (
      !Number.isFinite(durationMs) ||
      durationMs < UI_TIMING_LIMITS.durationMsMin ||
      durationMs > UI_TIMING_LIMITS.durationMsMax
    )
      return;

    // Same-family replacement: a new toast replaces the previous toast cleanly.
    hideOverlay('toast');

    node.textContent = text;
    applyToastVariantClass(node, o ? o.variant : '');

    // Contract: CSS owns visibility via .wt-toast--visible
    node.classList.add('wt-toast--visible');

    setUiTimer(
      'toast.hide',
      () => {
        node.classList.remove('wt-toast--visible');
      },
      Math.floor(durationMs),
      'overlay'
    );
  }

  function cancelScheduledToast(opts) {
    const o = opts && typeof opts === 'object' ? opts : null;
    const keepChanceOverlayVisible = !!(
      o && o.keepChanceOverlayVisible === true
    );

    hideOverlay('toast');

    clearUiTimer('overlay.gameplay.show');

    // Prevent transient overlays from surviving a state change.
    hideOverlay('transient');
    hideOverlay('runstart');

    if (!keepChanceOverlayVisible) {
      hideOverlay('chance');
    }
  }

  function cleanupPlayingExit(ui, opts) {
    const o = opts && typeof opts === 'object' ? opts : null;
    const keepChanceOverlayVisible = !!(
      o && o.keepChanceOverlayVisible === true
    );
    const preserveEndSignals = !!(
      ui &&
      ui._runtime &&
      ui._runtime.finishingRun === true
    );

    cancelQuestionSpeech(ui);
    cancelScheduledToast({ keepChanceOverlayVisible });

    if (keepChanceOverlayVisible) {
      clearUiTimer('overlay.chance.hide');
    } else {
      hideChanceLostOverlay();
    }

    if (ui && ui._beforeUnloadHandler) {
      window.removeEventListener('beforeunload', ui._beforeUnloadHandler);
      ui._beforeUnloadHandler = null;
    }

    try {
      if (ui && typeof ui._secretBonusFallCleanup === 'function') {
        ui._secretBonusFallCleanup();
      }
    } catch (_) {
      /* silent */
    }

    if (ui && ui._runtime) {
      if (ui._runtime.feedbackRevealTimerId) {
        clearRuntimeTimer(ui, 'feedbackRevealTimerId');
      }

      if (ui._runtime.feedbackAutoAdvanceTimerId) {
        clearRuntimeTimer(ui, 'feedbackAutoAdvanceTimerId');
      }

      if (ui._runtime.bonusAnswerFeedbackTimerId) {
        clearRuntimeTimer(ui, 'bonusAnswerFeedbackTimerId');
      }

      if (ui._runtime.bonusEndTimerId) {
        clearRuntimeTimer(ui, 'bonusEndTimerId');
      }

      if (ui._runtime.hudPulseCleanupTimerId) {
        clearRuntimeTimer(ui, 'hudPulseCleanupTimerId');
      }

      if (ui._runtime.endRecordMomentTimer) {
        clearRuntimeTimer(ui, 'endRecordMomentTimer');
      }

      if (ui._runtime.finishFadeOutTimerId) {
        clearRuntimeTimer(ui, 'finishFadeOutTimerId');
      }

      if (ui._runtime.finishFadeInStartTimerId) {
        clearRuntimeTimer(ui, 'finishFadeInStartTimerId');
      }

      if (ui._runtime.finishFadeCleanupTimerId) {
        clearRuntimeTimer(ui, 'finishFadeCleanupTimerId');
      }

      if (ui._runtime.gameOverAfterFeedbackTimerId) {
        clearRuntimeTimer(ui, 'gameOverAfterFeedbackTimerId');
      }

      ui._runtime.answerLocked = false;
      ui._runtime.feedbackPending = false;
      ui._runtime.finishAfterFeedback = false;
      ui._runtime.autoGameOverAfterFeedback = false;
      ui._runtime.frozenItem = null;
      ui._runtime.poolExhaustedToastKey = null;
      ui._runtime.gameOverPending = false;
      ui._runtime.secretBonusPending = false;
      if (!preserveEndSignals) {
        ui._runtime.poolCompleteCelebrationPending = false;
        ui._runtime.endRecordMomentUntil = 0;
      }
    }

    try {
      const app = document.getElementById('app');
      if (app) {
        if (app.getAttribute('data-wt-runstart-lock') === '1') {
          app.style.pointerEvents =
            app.getAttribute('data-wt-runstart-prev-pe') || '';
          try {
            app.inert = app.getAttribute('data-wt-runstart-prev-inert') === '1';
          } catch (_) {}
          app.removeAttribute('data-wt-runstart-lock');
          app.removeAttribute('data-wt-runstart-prev-pe');
          app.removeAttribute('data-wt-runstart-prev-inert');
        }
        if (app.inert === true) {
          try {
            app.inert = false;
          } catch (_) {}
        }
        if (app.style.pointerEvents === 'none') app.style.pointerEvents = '';
      }
    } catch (_) {
      /* silent */
    }
  }

  function getToastTiming(cfg, timingKey) {
    const c = cfg && typeof cfg === 'object' ? cfg : {};
    // Single source of truth for toast timing: WT_CONFIG.ui.toast (schema plat)
    const toastRoot =
      c.ui &&
      typeof c.ui === 'object' &&
      c.ui.toast &&
      typeof c.ui.toast === 'object'
        ? c.ui.toast
        : null;

    if (!toastRoot || typeof toastRoot !== 'object') return null;

    const key = String(timingKey || '').trim();

    // Default bucket is mandatory
    const def =
      toastRoot.default && typeof toastRoot.default === 'object'
        ? toastRoot.default
        : null;
    if (!def) return null;

    const t = key
      ? toastRoot[key] && typeof toastRoot[key] === 'object'
        ? toastRoot[key]
        : null
      : def;

    // No silent fallback: if a timingKey is requested but missing, do nothing.
    if (key && !t) return null;

    const delayMs = Number(t.delayMs);
    const durationMs = Number(t.durationMs);

    if (
      !Number.isFinite(delayMs) ||
      delayMs < 0 ||
      delayMs > UI_TIMING_LIMITS.delayMsMax
    )
      return null;
    if (
      !Number.isFinite(durationMs) ||
      durationMs < UI_TIMING_LIMITS.durationMsMin ||
      durationMs > UI_TIMING_LIMITS.durationMsMax
    )
      return null;

    return { delayMs: Math.floor(delayMs), durationMs: Math.floor(durationMs) };
  }

  function toastNow(cfg, message, opts) {
    const o = opts && typeof opts === 'object' ? opts : null;
    const timingKey = o ? o.timingKey : '';
    const variant = o ? o.variant : '';

    const timing = getToastTiming(cfg, timingKey);
    if (!timing) return;
    showToast(message, { durationMs: timing.durationMs, variant });
  }

  // Chance-loss toast (RUN / PRACTICE / BONUS)

  // Start-of-run overlay (education)
  // Copy contract: WT_WORDING.ui.startRunChancesOverlay must be provided.
  // Template recommended: "{maxChances} chances"
  function getRunStartOverlayText(uiWording, maxChances) {
    const tpl = String(uiWording?.startRunChancesOverlay || '').trim();
    if (!tpl) return '';

    const mc = Number(maxChances);
    if (!Number.isFinite(mc)) return '';

    // Backward compatible: if tpl has no placeholders, use as-is
    if (!tpl.includes('{maxChances}')) return tpl;

    return fillTemplate(tpl, { maxChances: clampInt(mc, 1, 99) });
  }

  function getChanceStateOverlayText(uiWording, chancesLeft) {
    const left = clampInt(chancesLeft, 0, 99);

    if (left === 0) return String(uiWording?.gameOverOverlay || '').trim();
    if (left === 1) return String(uiWording?.lastChanceOverlay || '').trim();

    return '';
  }

  // Chance-lost: ignore taps while visible (recommended)
  let chanceLostOverlayBlocker = null;

  // Start overlay: block interactions + dismiss without click-through
  // Root cause: pointerdown can hide the overlay, then the subsequent click lands on the underlying element.
  let runStartOverlayConsumeNextClick = false;
  let runStartOverlayPointerBlocker = null;
  let runStartOverlayClickBlocker = null;
  let runStartOverlayKeyBlocker = null;

  // Gameplay overlay (centered, for micro-interactions during PLAYING)
  // Separate element + timer so it never overwrites chance-lost / run-start overlays.
  let gameplayOverlayTapHandler = null;

  function scheduleGameplayOverlay(message, opts) {
    const text = String(message || '').trim();
    if (!text) return;

    const o = opts && typeof opts === 'object' ? opts : null;
    const delayMs = o ? Number(o.delayMs) : NaN;
    const durationMs = o ? Number(o.durationMs) : NaN;
    const variant = o ? String(o.variant || '').trim() : '';
    const cfg = o && o.cfg && typeof o.cfg === 'object' ? o.cfg : null;
    const mode = o ? String(o.mode || '').trim() : '';

    if (
      !Number.isFinite(delayMs) ||
      delayMs < 0 ||
      delayMs > UI_TIMING_LIMITS.delayMsMax
    )
      return;
    if (
      !Number.isFinite(durationMs) ||
      durationMs < UI_TIMING_LIMITS.durationMsMin ||
      durationMs > UI_TIMING_LIMITS.durationMsMax
    )
      return;

    clearUiTimer('overlay.gameplay.show');

    if (Math.floor(delayMs) <= 0) {
      showGameplayOverlay(text, {
        durationMs: Math.floor(durationMs),
        variant,
        cfg,
        mode
      });
      return;
    }

    setUiTimer(
      'overlay.gameplay.show',
      () => {
        showGameplayOverlay(text, {
          durationMs: Math.floor(durationMs),
          variant,
          cfg,
          mode
        });
      },
      Math.floor(delayMs),
      'overlay'
    );
  }

  function isOverlayVisible(id) {
    const el = document.getElementById(String(id || ''));
    return !!(
      el &&
      el.classList &&
      el.classList.contains('wt-chance-overlay--visible')
    );
  }

  function hideChanceLostOverlay() {
    clearUiTimer('overlay.chance.hide');

    if (chanceLostOverlayBlocker) {
      document.removeEventListener(
        'pointerdown',
        chanceLostOverlayBlocker,
        true
      );
      chanceLostOverlayBlocker = null;
    }

    const overlay = document.getElementById('wt-chance-lost-overlay');
    if (overlay) {
      overlay.classList.remove('wt-chance-overlay--visible');
      overlay.removeAttribute('data-wt-overlay-mode');
      overlay.setAttribute('aria-hidden', 'true');
    }
  }

  function hideRunStartOverlay() {
    clearUiTimer('overlay.runstart.hide');

    // Remove run-start blockers (anti click-through)
    if (runStartOverlayPointerBlocker) {
      document.removeEventListener(
        'pointerdown',
        runStartOverlayPointerBlocker,
        true
      );
      runStartOverlayPointerBlocker = null;
    }
    if (runStartOverlayClickBlocker) {
      document.removeEventListener('click', runStartOverlayClickBlocker, true);
      runStartOverlayClickBlocker = null;
    }
    if (runStartOverlayKeyBlocker) {
      document.removeEventListener('keydown', runStartOverlayKeyBlocker, true);
      runStartOverlayKeyBlocker = null;
    }
    runStartOverlayConsumeNextClick = false;

    const overlay = document.getElementById('wt-run-start-overlay');
    if (overlay) {
      overlay.classList.remove('wt-chance-overlay--visible');
      overlay.setAttribute('aria-hidden', 'true');
      overlay.removeAttribute('data-runstart-dismiss');
      overlay.removeAttribute('data-runstart-mode');
    }

    // Unlock underlying UI if we locked it for run-start overlay
    const app = document.getElementById('app');
    if (app && app.getAttribute('data-wt-runstart-lock') === '1') {
      const prevPe = app.getAttribute('data-wt-runstart-prev-pe');
      const prevInert = app.getAttribute('data-wt-runstart-prev-inert') === '1';

      app.style.pointerEvents = prevPe == null ? '' : prevPe;
      try {
        app.inert = prevInert === true;
      } catch (_) {
        /* silent */
      }

      app.removeAttribute('data-wt-runstart-lock');
      app.removeAttribute('data-wt-runstart-prev-pe');
      app.removeAttribute('data-wt-runstart-prev-inert');
    }
  }

  function showGameplayOverlay(message, opts) {
    const o = opts && typeof opts === 'object' ? opts : null;
    const durationMs = o ? Number(o.durationMs) : NaN;
    const variant = o ? String(o.variant || '').trim() : '';
    const cfg = o && o.cfg && typeof o.cfg === 'object' ? o.cfg : null;
    const mode = o ? String(o.mode || '').trim() : '';

    // Validation bounds: same contract as WT_CONFIG.ui.toast.*.durationMs
    if (
      !Number.isFinite(durationMs) ||
      durationMs < UI_TIMING_LIMITS.durationMsMin ||
      durationMs > UI_TIMING_LIMITS.durationMsMax
    )
      return;
    const msg = String(message || '').trim();
    if (!msg) return;

    // Controller priority: modal / blocking overlay > transient overlay > toast.
    if (!showTransientOverlay('gameplay')) return;

    clearUiTimer('overlay.gameplay.hide');

    if (gameplayOverlayTapHandler) {
      document.removeEventListener(
        'pointerdown',
        gameplayOverlayTapHandler,
        true
      );
      gameplayOverlayTapHandler = null;
    }

    let overlay = document.getElementById('wt-gameplay-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'wt-gameplay-overlay';
      overlay.className = 'wt-chance-overlay';
      overlay.setAttribute('role', 'alert');
      overlay.setAttribute(
        'aria-live',
        variant === 'danger' ? 'assertive' : 'polite'
      );
      document.body.appendChild(overlay);
    }

    overlay.classList.remove(
      'wt-chance-overlay--info',
      'wt-chance-overlay--danger',
      'wt-chance-overlay--success',
      'wt-chance-overlay--dismissible',
      'wt-chance-overlay--blocking'
    );
    if (mode) overlay.setAttribute('data-wt-overlay-mode', mode);
    else overlay.removeAttribute('data-wt-overlay-mode');
    if (variant === 'info') overlay.classList.add('wt-chance-overlay--info');
    else if (variant === 'danger')
      overlay.classList.add('wt-chance-overlay--danger');
    else if (variant === 'success')
      overlay.classList.add('wt-chance-overlay--success');
    overlay.setAttribute(
      'aria-live',
      variant === 'danger' ? 'assertive' : 'polite'
    );

    // Gameplay overlays: block taps by default (avoid "looks modal but click-through")
    overlay.classList.add('wt-chance-overlay--blocking');

    overlay.innerHTML = `
      <div class="wt-chance-overlay__content">
        <span class="wt-chance-overlay__text">
          ${msg
            .split('\n')
            .filter(Boolean)
            .map((l) => `<span>${escapeHtml(l)}</span>`)
            .join('<br>')}
        </span>
      </div>
    `;

    // Tap-to-dismiss (faster): only if enabled in config
    const dismissEnabled = cfg?.ui?.toastDismissOnTap === true;
    if (dismissEnabled) {
      overlay.classList.add('wt-chance-overlay--dismissible');
      gameplayOverlayTapHandler = (e) => {
        const el = document.getElementById('wt-gameplay-overlay');
        if (!el) return;
        if (!el.classList.contains('wt-chance-overlay--visible')) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        hideGameplayOverlay();
      };
      document.addEventListener('pointerdown', gameplayOverlayTapHandler, true);
    }

    overlay.classList.add('wt-chance-overlay--visible');
    overlay.setAttribute('aria-hidden', 'false');

    setUiTimer(
      'overlay.gameplay.hide',
      () => {
        hideGameplayOverlay();
      },
      Math.floor(durationMs),
      'overlay'
    );
  }

  function hideGameplayOverlay() {
    clearUiTimer('overlay.gameplay.hide');

    if (gameplayOverlayTapHandler) {
      document.removeEventListener(
        'pointerdown',
        gameplayOverlayTapHandler,
        true
      );
      gameplayOverlayTapHandler = null;
    }

    const overlay = document.getElementById('wt-gameplay-overlay');
    if (overlay) {
      overlay.classList.remove(
        'wt-chance-overlay--visible',
        'wt-chance-overlay--dismissible',
        'wt-chance-overlay--blocking'
      );
      overlay.removeAttribute('data-wt-overlay-mode');
      overlay.setAttribute('aria-hidden', 'true');
    }
  }

  function showChanceLostOverlay(cfg, wording, chancesLeft, mode) {
    // Config gate (no fallback): WT_CONFIG.ui.chanceLostOverlayMs must be valid.
    const baseDurationMs = Number(cfg?.ui?.chanceLostOverlayMs);
    if (
      !Number.isFinite(baseDurationMs) ||
      baseDurationMs < UI_TIMING_LIMITS.durationMsMin ||
      baseDurationMs > UI_TIMING_LIMITS.durationMsMax
    )
      return;
    const left = clampInt(chancesLeft, 0, 99);

    // Product rule: no "-1 chance" overlay. Only show state overlays (Last chance / Game over).
    if (left > 1) return;

    const msg = getChanceStateOverlayText(wording?.ui, left);
    if (!msg) return;

    // Controller priority: chance/game-over is a blocking overlay.
    if (!showBlockingOverlay('chance')) return;

    // Duration: allow a little extra on game over using gameplayPulseMs (no fallback).
    let durationMs = baseDurationMs;
    if (left === 0) {
      const extraMs = Number(cfg?.ui?.gameplayPulseMs);
      if (
        Number.isFinite(extraMs) &&
        extraMs >= 0 &&
        extraMs <= UI_TIMING_LIMITS.pulseMsMax
      ) {
        durationMs = baseDurationMs + Math.floor(extraMs);
      }
    }
    if (durationMs > UI_TIMING_LIMITS.durationMsMax)
      durationMs = UI_TIMING_LIMITS.durationMsMax;
    clearUiTimer('overlay.chance.hide');

    if (chanceLostOverlayBlocker) {
      document.removeEventListener(
        'pointerdown',
        chanceLostOverlayBlocker,
        true
      );
      chanceLostOverlayBlocker = null;
    }

    let overlay = document.getElementById('wt-chance-lost-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'wt-chance-lost-overlay';
      overlay.className = 'wt-chance-overlay';
      overlay.setAttribute('role', 'alert');
      overlay.setAttribute('aria-live', 'assertive');
      document.body.appendChild(overlay);
    }
    overlay.setAttribute('aria-live', 'assertive');
    const overlayMode = String(mode || '').trim();
    if (overlayMode) overlay.setAttribute('data-wt-overlay-mode', overlayMode);
    else overlay.removeAttribute('data-wt-overlay-mode');

    overlay.classList.remove('wt-chance-overlay--info');
    overlay.classList.add('wt-chance-overlay--danger');

    overlay.innerHTML = `
      <div class="wt-chance-overlay__content">
        <span class="wt-chance-overlay__text">
          <span>${escapeHtml(msg)}</span>
        </span>
      </div>
    `;
    overlay.classList.add('wt-chance-overlay--visible');
    overlay.setAttribute('aria-hidden', 'false');

    // Block click-through always; dismiss on tap if enabled
    const dismissEnabled = cfg?.ui?.toastDismissOnTap === true;
    if (dismissEnabled) {
      overlay.classList.add('wt-chance-overlay--dismissible');
    } else {
      overlay.classList.remove('wt-chance-overlay--dismissible');
    }

    chanceLostOverlayBlocker = (e) => {
      const o = document.getElementById('wt-chance-lost-overlay');
      if (!o) return;
      if (!o.classList.contains('wt-chance-overlay--visible')) return;

      e.preventDefault();
      e.stopImmediatePropagation();

      // Game over: tap should always skip to END (even if toastDismissOnTap is false),
      // otherwise the overlay can trap the user on a blank background.
      if (left === 0 && typeof window.__wtGameOverSkipToEnd === 'function') {
        hideChanceLostOverlay();
        try {
          window.__wtGameOverSkipToEnd();
        } catch (_) {
          /* silent */
        }
        return;
      }

      // Last chance: only dismiss if explicitly enabled
      if (dismissEnabled) hideChanceLostOverlay();
    };

    document.addEventListener('pointerdown', chanceLostOverlayBlocker, true);
    setUiTimer(
      'overlay.chance.hide',
      () => {
        hideChanceLostOverlay();
      },
      Math.floor(durationMs),
      'overlay'
    );
  }

  function getRunStartTypeText(uiWording, runType) {
    const rt = String(runType || '').trim();
    if (!rt) return '';

    if (rt === 'UNLIMITED')
      return String(uiWording?.startRunTypeUnlimited || '').trim();
    if (rt === 'LAST_FREE')
      return String(uiWording?.startRunTypeLastFree || '').trim();
    if (rt === 'FREE') return String(uiWording?.startRunTypeFree || '').trim();
    if (rt === 'PRACTICE')
      return String(uiWording?.startRunTypePractice || '').trim();
    return '';
  }

  function showRunStartOverlay(
    cfg,
    wording,
    game,
    runType,
    extra,
    onDismissStart
  ) {
    // Product rule: no start-of-run overlay for UNLIMITED runs
    if (String(runType || '').trim() === 'UNLIMITED') return;

    // Config gate (no fallback): feature enabled only if config is valid (even though we don't auto-hide).
    const runStartMs = Number(cfg?.ui?.runStartOverlayMs);
    if (
      !Number.isFinite(runStartMs) ||
      runStartMs < UI_TIMING_LIMITS.durationMsMin ||
      runStartMs > UI_TIMING_LIMITS.durationMsMax
    )
      return;

    const gs =
      game && typeof game.getState === 'function' ? game.getState() || {} : {};
    const maxChances = Number(gs.maxChances);

    // PRACTICE has no chances (maxChances === null) → use dedicated wording
    const isPractice = String(runType || '').trim() === 'PRACTICE';
    const msg = isPractice
      ? String(wording?.practice?.startRunChancesOverlayPractice || '').trim()
      : gs.maxChances == null
        ? String(wording?.ui?.startRunNoEliminationOverlay || '').trim()
        : Number.isFinite(maxChances)
          ? getRunStartOverlayText(wording?.ui, clampInt(maxChances, 1, 99))
          : '';
    if (!msg) return;

    // Controller priority: run-start is a blocking overlay, below chance/game-over.
    if (!showBlockingOverlay('runstart')) return;

    // Defensive cleanup (legacy safety): run-start must never auto-hide.
    clearUiTimer('overlay.runstart.hide');

    if (runStartOverlayPointerBlocker) {
      document.removeEventListener(
        'pointerdown',
        runStartOverlayPointerBlocker,
        true
      );
      runStartOverlayPointerBlocker = null;
    }
    if (runStartOverlayClickBlocker) {
      document.removeEventListener('click', runStartOverlayClickBlocker, true);
      runStartOverlayClickBlocker = null;
    }
    if (runStartOverlayKeyBlocker) {
      document.removeEventListener('keydown', runStartOverlayKeyBlocker, true);
      runStartOverlayKeyBlocker = null;
    }
    runStartOverlayConsumeNextClick = false;

    let overlay = document.getElementById('wt-run-start-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'wt-run-start-overlay';
      overlay.className = 'wt-chance-overlay';
      overlay.setAttribute('role', 'alert');
      overlay.setAttribute('aria-live', 'polite');
      document.body.appendChild(overlay);
    }

    overlay.classList.remove('wt-chance-overlay--danger');
    overlay.classList.add('wt-chance-overlay--info');

    const rt = String(runType || '').trim();
    overlay.setAttribute('data-runstart-mode', rt);

    function dispatchRunStartDismissed() {
      const mode = String(
        overlay.getAttribute('data-runstart-mode') || ''
      ).trim();
      try {
        document.dispatchEvent(
          new CustomEvent('wt-runstart-dismissed', { detail: { mode } })
        );
      } catch (_) {
        /* silent */
      }
    }

    const isBonus = rt === 'BONUS';
    const typeLine = isBonus ? '' : getRunStartTypeText(wording?.ui, rt);

    const bonusLine1 = String(
      wording?.secretBonus?.startOverlayLine1 || ''
    ).trim();
    const bonusLine2 = String(
      wording?.secretBonus?.startOverlayLine2 || ''
    ).trim();
    const bonusLine3 = String(
      wording?.secretBonus?.startOverlayLine3 || ''
    ).trim();
    const bonusLimitLine = String(extra?.bonusLimitLine || '').trim();
    const bonusTapHint = String(
      wording?.secretBonus?.startOverlayTapAnywhere || ''
    ).trim();
    const messageLines = msg
      .split('\n')
      .map((line) => String(line || '').trim())
      .filter(Boolean);
    const bonusLines = [
      bonusLine1,
      bonusLine2,
      bonusLine3,
      bonusLimitLine,
      ...messageLines
    ].filter(Boolean);

    const goalLine1 = String(extra?.goalLine1 || '').trim();
    const goalLine2 = String(extra?.goalLine2 || '').trim();
    const defaultTapHint =
      !isBonus && !isPractice
        ? String(wording?.ui?.startOverlayTapAnywhere || '').trim()
        : '';
    const practiceTapHint = isPractice
      ? String(wording?.practice?.startOverlayTapAnywhere || '').trim()
      : '';

    overlay.innerHTML = `
      <div class="wt-chance-overlay__content">
        <span class="wt-chance-overlay__text">
          ${
            isBonus
              ? `
              ${bonusLines.map((l, index) => `<span${index === 0 ? ` class="wt-chance-overlay__title"` : ``}>${escapeHtml(l)}</span>`).join('<br>')}
              ${bonusTapHint ? `<br><span class="wt-chance-overlay__hint">${escapeHtml(bonusTapHint)}</span>` : ``}
            `
              : `
                ${typeLine ? `<span class="wt-chance-overlay__title">${escapeHtml(typeLine)}</span><br>` : ``}
                ${goalLine1 ? `<span class="wt-muted">${escapeHtml(goalLine1)}</span><br>` : ``}
                ${goalLine2 ? `<span class="wt-muted">${escapeHtml(goalLine2)}</span><br>` : ``}
             ${messageLines.map((line, index) => `<span${isPractice && index === 0 ? ` class="wt-chance-overlay__lead"` : ``}>${escapeHtml(line)}</span>`).join('<br>')}
                ${practiceTapHint || defaultTapHint ? `<br><span class="wt-chance-overlay__hint">${escapeHtml(practiceTapHint || defaultTapHint)}</span>` : ``}
              `
          }
        </span>
      </div>
    `;

    overlay.classList.add('wt-chance-overlay--visible');
    overlay.setAttribute('aria-hidden', 'false');

    // Hard lock underlying UI while run-start overlay is visible (prevents click/keyboard activation under it)
    const app = document.getElementById('app');
    if (app && app.getAttribute('data-wt-runstart-lock') !== '1') {
      app.setAttribute('data-wt-runstart-lock', '1');
      app.setAttribute(
        'data-wt-runstart-prev-pe',
        String(app.style.pointerEvents || '')
      );
      try {
        app.setAttribute(
          'data-wt-runstart-prev-inert',
          app.inert === true ? '1' : '0'
        );
      } catch (_) {
        app.setAttribute('data-wt-runstart-prev-inert', '0');
      }

      app.style.pointerEvents = 'none';
      try {
        app.inert = true;
      } catch (_) {
        /* silent */
      }
    }

    // Run-start dismiss contract
    overlay.setAttribute('data-runstart-dismiss', '1');

    // 1) pointerdown: block immediately and arm "consumeNextClick"
    runStartOverlayPointerBlocker = (e) => {
      const o = document.getElementById('wt-run-start-overlay');
      if (!o) return;
      if (!o.classList.contains('wt-chance-overlay--visible')) return;
      if (o.getAttribute('data-runstart-dismiss') !== '1') return;

      runStartOverlayConsumeNextClick = true;
      e.preventDefault();
      e.stopImmediatePropagation();
    };

    // 2) click: always consume (even if overlay would be hidden before click fires)
    runStartOverlayClickBlocker = (e) => {
      const o = document.getElementById('wt-run-start-overlay');

      // If pointerdown armed the flag, we must consume this click no matter what.
      if (runStartOverlayConsumeNextClick === true) {
        runStartOverlayConsumeNextClick = false;
        e.preventDefault();
        e.stopImmediatePropagation();
        hideRunStartOverlay();
        if (typeof onDismissStart === 'function') onDismissStart();
        dispatchRunStartDismissed();
        return;
      }

      if (!o) return;
      if (!o.classList.contains('wt-chance-overlay--visible')) return;
      if (o.getAttribute('data-runstart-dismiss') !== '1') return;

      e.preventDefault();
      e.stopImmediatePropagation();
      hideRunStartOverlay();
      if (typeof onDismissStart === 'function') onDismissStart();
      dispatchRunStartDismissed();
    };

    // 3) keyboard: Enter/Space dismiss, without activating underlying controls
    runStartOverlayKeyBlocker = (e) => {
      const o = document.getElementById('wt-run-start-overlay');
      if (!o) return;
      if (!o.classList.contains('wt-chance-overlay--visible')) return;
      if (o.getAttribute('data-runstart-dismiss') !== '1') return;

      const k = String(e.key || '').toLowerCase();
      if (k !== 'enter' && k !== ' ' && k !== 'spacebar') return;

      runStartOverlayConsumeNextClick = false;
      e.preventDefault();
      e.stopImmediatePropagation();
      hideRunStartOverlay();
      if (typeof onDismissStart === 'function') onDismissStart();
      dispatchRunStartDismissed();
    };

    document.addEventListener(
      'pointerdown',
      runStartOverlayPointerBlocker,
      true
    );
    document.addEventListener('keydown', runStartOverlayKeyBlocker, true);

    // Defer click listener by one frame: the CTA's pointerup creates the overlay synchronously,
    // but the browser then synthesizes a click event from the same interaction.
    // Without deferral, that click immediately dismisses the overlay.
    requestAnimationFrame(() => {
      document.addEventListener('click', runStartOverlayClickBlocker, true);
    });
  }

  // ============================================
  // UI
  // ============================================
