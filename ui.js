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
    const target = String(locale || '')
      .trim()
      .toLowerCase();
    if (target.startsWith('fr')) {
      return false;
    }
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

  function startQuestionSpeech(ui, model, opts) {
    const options = opts || {};
    if (!ui || !ui._runtime || !model || !supportsQuestionSpeech())
      return false;

    cancelQuestionSpeech(ui);

    try {
      const utterance = new window.SpeechSynthesisUtterance(model.questionText);
      utterance.lang = model.locale;
      utterance.voice = getQuestionSpeechVoice(model.locale);
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

  function getDailyChallengeModel(cfg, wording, bestScoreFP, storage) {
    const safeBest = clampInt(bestScoreFP, 0, 99999);
    const tier = getRunTierInfo(cfg, wording, safeBest);

    const nowDate = new Date();
    const localDayKey = [
      nowDate.getFullYear(),
      String(nowDate.getMonth() + 1).padStart(2, '0'),
      String(nowDate.getDate()).padStart(2, '0')
    ].join('-');

    const dayStartMs = new Date(
      nowDate.getFullYear(),
      nowDate.getMonth(),
      nowDate.getDate()
    ).getTime();
    const dayEndMs = new Date(
      nowDate.getFullYear(),
      nowDate.getMonth(),
      nowDate.getDate() + 1
    ).getTime();
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
      return `
        <a class="wt-branding${modifier}" href="#home" data-action="go-home" aria-label="${escapeHtml(appName)}">
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

    if (p === 'feedbackRevealTimerId' || p === 'bonusAnswerFeedbackTimerId') {
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
    ];

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
  function UI({ storage, game, config, wording }) {
    this.storage = storage;
    this.game = game;
    this.config = config || {};
    this.wording = wording || {};
    this.state = STATES.LANDING;

    this.appEl = el('app');
    this.modalEl = el('modal');
    this.modalContentEl = el('modal-content');

    // Footer preservation (KISS):
    // If the footer lives inside #app in index.html, render() would wipe it via innerHTML.
    // We detach and re-attach the same node to keep all footer content intact.
    this._footerNode = null;

    // Paywall ticker (UI-only)
    this._paywallTickerId = null;

    this._runtime = {
      contentItems: [],
      contentById: {},
      contentTotal: 0,

      // input safety (mobile double tap)
      answerLocked: false,

      // HUD delta cleanup (UI-only): forces a render after gameplayPulseMs
      hudPulseCleanupTimerId: null,

      // timers / transition guards
      bonusAnswerFeedbackTimerId: null,
      bonusEndTimerId: null,
      endRecordMomentTimer: null,
      endAutoModalTimerId: null,
      finishFadeOutTimerId: null,
      finishFadeInStartTimerId: null,
      finishFadeCleanupTimerId: null,
      gameOverAfterFeedbackTimerId: null,
      newBestScoreToastShown: false,

      // transition flags / one-shot states
      gameOverPending: false,
      secretBonusPending: false,
      endRecordMomentUntil: 0,
      poolCompleteCelebrationPending: false,

      // micro-pics (run-only; UI-only)
      microPics: createMicroPicsState(null),

      // current run
      // current run
      currentRunNumber: 0,
      currentRunId: '',
      runStartedAt: 0,
      currentQuestionShownAt: 0,
      runAnswerLog: [],
      questionSpeechActive: false,
      questionSpeechKey: '',
      questionSpeechText: '',
      questionAutoReadDoneKey: '',
      runItemIds: [],
      runMistakeIds: [],
      runMode: '',
      lastAnswer: null,
      feedbackPending: false,
      feedbackReveal: true,
      feedbackRevealTimerId: null,
      frozenItem: null,
      finishAfterFeedback: false,
      autoGameOverAfterFeedback: false,

      // end-of-run guard (prevents double finish during transitions)
      finishingRun: false,

      lastRun: {
        scoreFP: 0,
        maxChances: 0,
        chancesLeft: 0,
        newBest: false,
        bestScoreFP: 0,
        mistakeIds: []
      },

      // deterministic share anchor

      shareAnchorId: null,

      // Pool reshuffle toast guard (UI-only, once per RUN)
      poolReshuffleToastShown: false,

      // Secret chest (END/LANDING): tap window + one-shot hint
      secretChest: {
        tapCount: 0,
        lastTapAt: 0
      },

      // Pool exhausted toast de-dup (RUN / PRACTICE / BONUS)
      // Keyed by screen+mode, reset when leaving PLAYING.
      poolExhaustedToastKey: null,

      // Secret bonus fall runtime (UI-only)
      // - No fallback values: requires cfg.secretBonus.fall to be valid.
      // - Drives requestAnimationFrame loop without re-rendering every frame.
      secretBonusFall: {
        rafId: 0,
        laneEl: null,
        chipEl: null,
        failLineEl: null,
        lastTs: 0,

        // Progress expressed as ratios of lane height (01), not pixels
        y01: 0,
        speed01PerSec: 0,

        xSide: 'left', // "left" | "right" (placeholder for later; no gameplay coupling)
        itemKey: '', // to detect new item and reset
        running: false,

        // UI-only micro-juice flags
        wasInWarning: false
      }
    };

    // Navigation state (stable, not runtime)
    this._nav = {
      paywallFromState: null,
      landingVariant: null,
      ignorePopstateUntil: 0
    };

    // Cross-surface action dedup:
    // a pointerup inside the modal can close it and reveal a new screen,
    // then the browser emits a synthetic click at the same coordinates.
    // We keep one shared timestamp across modal/app surfaces so that
    // phantom click is dropped even when it lands on a different surface.
    this._lastActionDispatchTs = 0;
    this._ignoreAppActionsUntil = 0;

    this._bindEvents();
  }

  UI.prototype._bindEvents = function () {
    const self = this;

    if (!this.appEl) return;

    const pointerEvt = 'PointerEvent' in window ? 'pointerup' : 'click';

    function dispatchAction(action, event) {
      try {
        self._lastActionDispatchTs =
          event && typeof event.timeStamp === 'number'
            ? event.timeStamp
            : Date.now();
      } catch (_) {
        self._lastActionDispatchTs = Date.now();
      }

      switch (action) {
        case 'continue':
          self.continueAfterFeedback();
          break;

        case 'how-to-play':
        case 'open-howto':
          self.openHowToModal();
          break;

        case 'open-level-progress':
          self.openLevelProgressModal();
          break;

        case 'open-leaderboard':
          self.openLeaderboardModal();
          break;

        case 'open-leaderboard-profile':
          self.openLeaderboardModal({ initialTab: 'profile' });
          break;

        case 'switch-leaderboard-tab': {
          const source = event && event.target && event.target.closest
            ? event.target.closest('[data-wt-leaderboard-tab]')
            : null;
          self.switchLeaderboardModalTab(
            source ? source.getAttribute('data-wt-leaderboard-tab') : ''
          );
          break;
        }

        case 'save-leaderboard-profile':
          void self.saveLeaderboardProfileFromModal();
          break;

        case 'leave-leaderboard':
          void self.leaveLeaderboardFromModal();
          break;

        case 'close-modal':
          self.closeModal();
          break;

        case 'enter-secret-bonus':
          self.closeModal();
          if (self._runtime) self._runtime.secretBonusPending = false;
          if (typeof self.startSecretBonusRun === 'function')
            self.startSecretBonusRun();
          break;

        case 'start-secret-bonus':
          self.closeModal();
          if (self._runtime) self._runtime.secretBonusPending = false;
          if (typeof self.startSecretBonusRun === 'function')
            self.startSecretBonusRun();
          break;

        case 'start-run':
        case 'start-daily-challenge': {
          const ready = !!(
            self._runtime && Number(self._runtime.contentTotal) > 0
          );
          if (!ready) {
            const msg = String(self.getContentLoadingCopy() || '').trim();
            if (msg)
              toastNow(self.config, msg, {
                variant: 'info',
                timingKey: 'contentLoading'
              });
            break;
          }

          // Product choice for MVP:
          // the Daily Challenge CTA stays a tracked entry point into the regular RUN flow.
          // We separate the CTA analytics now without creating a dedicated gameplay mode yet.
          if (
            action === 'start-daily-challenge' &&
            self.storage &&
            typeof self.storage.markDailyChallengeClicked === 'function'
          ) {
            try {
              self.storage.markDailyChallengeClicked();
            } catch (_) {
              /* silent */
            }
          }

          const startedFromModal = !!(
            self.modalEl && !self.modalEl.classList.contains('wt-hidden')
          );

          // Extra safety for modal -> app transitions:
          // after the modal CTA starts a run, ignore app-surface actions briefly
          // so no stray event can hit the freshly rendered PLAYING screen.
          if (startedFromModal) {
            self._ignoreAppActionsUntil = Date.now() + 900;
          }

          // First-run framing must open only from the LANDING screen itself.
          // If the click already comes from the first-run modal CTA, we must start the run.
          // The first-run modal is intentionally shown on mobile too: it explains the game before the first answer.
          if (
            !startedFromModal &&
            self.state === STATES.LANDING &&
            self._canShowFirstRunFraming()
          ) {
            self._openFirstRunFraming();
            break;
          }

          // Funnel counter: only when starting from LANDING
          if (self.state === STATES.LANDING) {
            if (
              self.storage &&
              typeof self.storage.markLandingPlayClicked === 'function'
            ) {
              self.storage.markLandingPlayClicked();
            }
          }

          // CTA inside modal: close first to avoid overlay sticking.
          self.closeModal();
          self.startRun(false);
          break;
        }

        case 'start-practice':
          if (!(self._runtime && Number(self._runtime.contentTotal) > 0)) {
            const msg = String(self.getContentLoadingCopy() || '').trim();
            if (msg)
              toastNow(self.config, msg, {
                variant: 'info',
                timingKey: 'contentLoading'
              });
            break;
          }
          if (self.state === STATES.LANDING) {
            if (
              self.storage &&
              typeof self.storage.markLandingPracticeClicked === 'function'
            ) {
              self.storage.markLandingPracticeClicked();
            }
          }
          self.closeModal();
          self.startRun(true);
          break;

        case 'answer-true': {
          cancelQuestionSpeech(self);
          // BONUS: stop fall tick to prevent race (tick could fail item before rAF fires)
          try {
            if (self._runtime?.secretBonusFall?.running)
              self._secretBonusFallStop();
          } catch (_) {}

          window.requestAnimationFrame(() => self.answer(true));
          break;
        }

        case 'answer-false': {
          cancelQuestionSpeech(self);
          // BONUS: stop fall tick to prevent race (tick could fail item before rAF fires)
          try {
            if (self._runtime?.secretBonusFall?.running)
              self._secretBonusFallStop();
          } catch (_) {}

          window.requestAnimationFrame(() => self.answer(false));
          break;
        }

        case 'toggle-question-audio':
          self.toggleQuestionSpeech();
          break;

        case 'toggle-auto-read-questions':
          self.toggleAutoReadQuestions();
          break;

        case 'play-again': {
          const ready = !!(
            self._runtime && Number(self._runtime.contentTotal) > 0
          );
          if (!ready) {
            const msg = String(self.getContentLoadingCopy() || '').trim();
            if (msg)
              toastNow(self.config, msg, {
                variant: 'info',
                timingKey: 'contentLoading'
              });
            break;
          }

          self.startRun(false);
          break;
        }

        case 'open-paywall':
          // If opened from a modal (e.g., How to play), close it first
          // to prevent backdrop/inert/focus-trap from blocking PAYWALL.
          self.closeModal();

          self.setState(STATES.PAYWALL);
          break;

        case 'checkout-early':
          self.checkout('EARLY', event);
          break;

        case 'checkout-standard':
          self.checkout('STANDARD', event);
          break;

        case 'redeem-code':
          // If launched from the "How to play" modal, close it first
          // to prevent modal stacking/backdrop issues.
          self.closeModal();
          self.openRedeemModal();
          break;

        case 'confirm-redeem':
          self._confirmRedeemCode();
          break;

        case 'auto-redeem-now':
          self._redeemVanityCodeNow();
          break;

        case 'auto-redeem-later':
          self.closeModal();
          break;

        case 'copy-share':
          self.copyShareText();
          break;

        case 'send-share-email':
          self.sendShareViaEmail();
          break;

        case 'toggle-mistakes-only':
          self.toggleMistakesOnly();
          break;

        case 'open-support':
          self.openSupportModal();
          break;

        case 'send-stats-email':
          self.sendStatsViaEmail();
          break;

        case 'snooze-stats':
          try {
            const pendingBit = self._runtime
              ? Number(self._runtime._statsSharingLastPromptFlagBit)
              : 0;
            if (Number.isFinite(pendingBit) && pendingBit > 0) {
              const cur = getStatsSharingPromptFlags(self.storage);
              setStatsSharingPromptFlags(
                self.storage,
                cur & ~Math.floor(pendingBit)
              );
            }
          } catch (_) {
            /* silent */
          }

          snoozeStatsSharingPromptNextEnd(self.storage);
          self.closeModal();
          break;

        case 'open-waitlist':
          self.openWaitlistModal();
          break;

        case 'send-waitlist-email':
          self.sendWaitlistViaEmail();
          break;

        case 'copy-stats':
          self.copyStatsToClipboard();
          break;

        case 'copy-support-email':
          self.copySupportEmail();
          break;

        case 'open-support-email':
          self.openSupportEmailApp();
          break;

        case 'open-support-email-bug':
          self.openSupportEmailApp('bug');
          break;

        case 'open-support-email-question':
          self.openSupportEmailApp('question');
          break;

        case 'open-support-email-idea':
          self.openSupportEmailApp('idea');
          break;

        case 'install-app':
          self.promptInstall();
          break;

        case 'install-app-now':
          self.closeModal();
          self.promptInstall();
          break;

        case 'dismiss-install-prompt':
          try {
            if (
              self.storage &&
              typeof self.storage.markInstallPromptShown === 'function'
            ) {
              self.storage.markInstallPromptShown();
            }
          } catch (_) {
            /* silent */
          }
          self.closeModal();
          break;

        case 'apply-update':
          self.applyUpdateToast();
          break;

        case 'remind-house-ad':
          self.remindHouseAdLater();
          break;

        case 'open-house-ad':
          self.openHouseAd();
          break;

        case 'back':
        case 'go-home': {
          if (self.state === STATES.PLAYING) {
            const msg = String(
              self.wording?.system?.confirmLeaveRun || ''
            ).trim();
            if (msg && !confirm(msg)) return;
          }

          self.closeModal();

          if (self.state === STATES.PAYWALL) {
            const fromState = String(self._nav?.paywallFromState || '').trim();

            if (fromState === STATES.END) {
              if (self._nav) {
                self._nav.landingVariant = null;
                self._nav.paywallFromState = null;
              }
              self.setState(STATES.END);
              break;
            }

            if (self._nav) {
              self._nav.landingVariant =
                fromState === STATES.LANDING ? 'POST_PAYWALL' : null;
              self._nav.paywallFromState = null;
            }
            self.setState(STATES.LANDING);
            break;
          }

          self.setState(STATES.LANDING);
          break;
        }
        default:
          break;
      }
    }

    if (this.modalEl && !this._wtBoundModalActions) {
      this._wtBoundModalActions = true;

      const modalActionHandler = (e) => {
        const t = e.target;
        if (!t) return;

        // Backdrop click: close modal even if overlay has no data-action
        if (t === self.modalEl) {
          e.preventDefault();
          e.stopImmediatePropagation();
          self.closeModal();
          return;
        }

        // Only trigger actions from explicit buttons/links inside the modal
        const btn = t.closest('button[data-action], a[data-action]');
        if (!btn) return;

        const action = String(btn.getAttribute('data-action') || '').trim();
        if (!action) return;

        e.preventDefault();
        e.stopImmediatePropagation();
        dispatchAction(action, e);
      };

      if (pointerEvt !== 'click') {
        const dedupHandler = (e) => {
          const now = e.timeStamp || Date.now();
          if (now - (self._lastActionDispatchTs || 0) < 160) return;
          modalActionHandler(e);
        };

        this.modalEl.addEventListener(pointerEvt, modalActionHandler);
        this.modalEl.addEventListener('click', dedupHandler);
      } else {
        this.modalEl.addEventListener('click', modalActionHandler);
      }
    }

    // Main app event delegation (LANDING / PLAYING / END / PAYWALL)
    // Without this, buttons like data-action="start-run" never fire.
    if (!this._wtBoundAppActions) {
      this._wtBoundAppActions = true;

      const appActionHandler = (e) => {
        const t = e && e.target ? e.target : null;
        if (!t) return false;

        const ignoreUntil = Number(self._ignoreAppActionsUntil || 0);
        if (ignoreUntil > 0 && Date.now() <= ignoreUntil) {
          try {
            if (e && typeof e.preventDefault === 'function') e.preventDefault();

            if (e && typeof e.stopImmediatePropagation === 'function') {
              e.stopImmediatePropagation();
            } else if (e && typeof e.stopPropagation === 'function') {
              e.stopPropagation();
            }
          } catch (_) {
            /* silent */
          }

          return true;
        }

        // KISS: if user toggles the Share <details> near the bottom of the viewport,
        // keep the summary visible to avoid the "opens upward" feel caused by layout jump.
        const shareSummary =
          t.closest && t.closest('summary.wt-share-toggle')
            ? t.closest('summary.wt-share-toggle')
            : null;
        if (shareSummary) {
          // Let native <details>/<summary> toggle happen (no preventDefault).
          setUiTimer(
            'end.share.scrollIntoView',
            () => {
              try {
                shareSummary.scrollIntoView({
                  block: 'nearest',
                  inline: 'nearest'
                });
              } catch (_) {
                /* ignore */
              }
            },
            0,
            'end'
          );
          return false;
        }

        // If a modal is open and the click is inside it, let modal handler own it
        if (self.modalEl && !self.modalEl.classList.contains('wt-hidden')) {
          try {
            if (self.modalEl.contains(t)) return false;
          } catch (_) {
            /* ignore */
          }
        }

        const btn =
          t.closest && t.closest('[data-action]')
            ? t.closest('[data-action]')
            : null;
        if (!btn) return false;

        const action = String(btn.getAttribute('data-action') || '').trim();
        if (!action) return false;
        e.preventDefault();
        dispatchAction(action, e);
        return true;
      };

      this.appEl.addEventListener(pointerEvt, appActionHandler);

      // Mobile safety: also listen on "click" when primary is a pointer event.
      // Some mobile Safari/PWA combos behave unreliably on button release events.
      // The shared timestamp guard prevents modal->app phantom clicks too.
      if (pointerEvt !== 'click') {
        const origHandler = appActionHandler;
        const dedupHandler = (e) => {
          const now = e.timeStamp || Date.now();
          if (now - (self._lastActionDispatchTs || 0) < 400) return;
          origHandler(e);
        };
        this.appEl.removeEventListener(pointerEvt, appActionHandler);
        this.appEl.addEventListener(pointerEvt, appActionHandler);
        this.appEl.addEventListener('click', dedupHandler);
      }
    }

    if (!this._wtBoundUpdateToastActions) {
      this._wtBoundUpdateToastActions = true;

      const updateToast = document.getElementById('update-toast');
      if (updateToast) {
        updateToast.addEventListener(pointerEvt, (e) => {
          const t = e && e.target ? e.target : null;
          if (!t) return;

          const btn =
            t.closest && t.closest('[data-action]')
              ? t.closest('[data-action]')
              : null;
          if (!btn) return;

          const action = String(btn.getAttribute('data-action') || '').trim();
          if (!action) return;

          e.preventDefault();
          dispatchAction(action, e);
        });

        if (pointerEvt !== 'click') {
          updateToast.addEventListener('click', (e) => {
            const t = e && e.target ? e.target : null;
            if (!t) return;

            const btn =
              t.closest && t.closest('[data-action]')
                ? t.closest('[data-action]')
                : null;
            if (!btn) return;

            const action = String(btn.getAttribute('data-action') || '').trim();
            if (!action) return;

            e.preventDefault();
            dispatchAction(action, e);
          });
        }
      }
    }

    // Prevent duplicate bindings if UI init runs more than once
    if (this._wtBoundSecretChestEvents) return;
    this._wtBoundSecretChestEvents = true;

    // Secret chest tease styles are defined in style.css (single source of truth for UI look).

    // Global listeners: bind once (never inside pointer/click handlers)
    if (!this._wtBoundGlobalEvents) {
      this._wtBoundGlobalEvents = true;

      // Esc closes modal
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') self.closeModal();
      });

      // When run-start overlay is dismissed, BONUS must be allowed to start falling immediately.
      document.addEventListener('wt-runstart-dismissed', () => {
        try {
          // Let DOM update (overlay class removal) settle first
          setUiTimer(
            'playing.bonusFall.startAfterRunStartDismiss',
            () => {
              const modeNow = String(self._runtime?.runMode || '').trim();
              if (self.state !== STATES.PLAYING) return;
              if (!modeNow) return;
              if (modeNow !== MODES.BONUS) return;

              if (isOverlayVisible('wt-run-start-overlay')) return;
              self._secretBonusFallStartOrSync();
            },
            0,
            'playing'
          );
        } catch (_) {
          /* silent */
        }
      });

      // Browser Back => prefer returning to Home (LANDING) for in-app history entries.
      // Robustness: some mobile/PWA contexts emit popstate with a null/partial state,
      // so we also fall back to the internal hashes we control (#home / #app).
      window.addEventListener('popstate', (e) => {
        const ignoreUntil = Number(self._nav?.ignorePopstateUntil || 0);
        if (ignoreUntil > 0 && Date.now() <= ignoreUntil) {
          return;
        }

        const st = e && e.state ? e.state : null;
        const hash = String(window.location.hash || '').trim();
        const hasInternalState = !!(st && st.wt === true);
        const hasInternalHash = hash === '#home' || hash === '#app';

        // If the browser navigated outside our internal history model, let it proceed.
        if (!hasInternalState && !hasInternalHash) return;

        self.closeModal();

        if (self.state !== STATES.LANDING) {
          self.setState(STATES.LANDING);
          return;
        }

        // Keep URL/state coherent even when popstate arrived with a degraded state payload.
        if (hash !== '#home') {
          try {
            const baseUrl = location.pathname + location.search;
            history.replaceState(
              { wt: true, screen: STATES.LANDING },
              '',
              baseUrl + '#home'
            );
          } catch (_) {
            /* silent */
          }
        }
      });

      // Secret Bonus: resize/rotation => recalibrate fall lane (never fail the item)
      function onViewportChange() {
        const modeNow = String(self._runtime?.runMode || '').trim();
        if (self.state !== STATES.PLAYING) return;
        if (!modeNow) return;
        if (modeNow !== MODES.BONUS) return;

        // Recalibrate track height only (layout may have changed)
        const sbf = self._runtime?.secretBonusFall;
        if (sbf && sbf.running && sbf.laneEl && sbf.chipEl) {
          try {
            const laneH = sbf.laneEl.getBoundingClientRect().height || 0;
            const chipH = sbf.chipEl.getBoundingClientRect().height || 0;
            sbf.trackPxMax = Math.max(
              0,
              laneH - (Number.isFinite(chipH) ? chipH : 0)
            );
          } catch (_) {
            /* silent */
          }
        }
      }

      window.addEventListener('resize', onViewportChange);
    }

    // Secret chest tap xN (END + LANDING)
    this.appEl.addEventListener(pointerEvt, (e) => {
      const t = e && e.target ? e.target : null;
      if (!t) return;

      const chest = t.closest ? t.closest('[data-wt-secret="chest"]') : null;
      if (!chest) return;

      // Only on END or LANDING
      if (self.state !== STATES.END && self.state !== STATES.LANDING) return;

      const cfg = self.config || {};
      const windowMs = Number(cfg?.secretBonus?.tapWindowMs);
      const tapsRequired = Number(cfg?.secretBonus?.tapsRequired);
      // No fallback: invalid config => feature off
      if (!Number.isFinite(windowMs) || windowMs <= 0) return;
      if (!Number.isFinite(tapsRequired) || tapsRequired < 0) return;

      e.preventDefault();

      // Once unlocked (persisted), 1 tap starts BONUS directly (no modal).
      if (hasSolvedSecretChestHint(self.storage)) {
        try {
          chest.classList.remove('wt-btn-icon--tease');
        } catch (_) {
          /* ignore */
        }
        if (typeof self.startSecretBonusRun === 'function')
          self.startSecretBonusRun();
        return;
      }

      const sb = self.wording?.secretBonus || {};
      const title = String(sb.modalTitle || '').trim();
      const bodyTpl = String(sb.modalBody || '').trim();
      const cta = String(sb.modalCta || '').trim();
      const notNow =
        String(self.wording?.system?.notNow || '').trim() ||
        String(self.wording?.system?.close || '').trim();
      const body = fillTemplate(bodyTpl, {
        tickets: String(getRapidFireTicketBalance(self.storage)),
        cost: String(getRapidFireTicketCost(self.storage)),
        pluralS: getRapidFireTicketBalance(self.storage) > 1 ? 's' : '',
        costPluralS: getRapidFireTicketCost(self.storage) > 1 ? 's' : ''
      });

      function enterSecretBonusFlow() {
        // If the welcome modal was already shown earlier, avoid a second modal here.
        if (hasShownSecretChestWelcome(self.storage)) {
          markSolvedSecretChestHint(self.storage);
          try {
            chest.classList.remove('wt-btn-icon--tease');
          } catch (_) {
            /* ignore */
          }
          if (typeof self.startSecretBonusRun === 'function')
            self.startSecretBonusRun();
          return;
        }

        // Mark solved NOW so the confirmation modal is shown only once per device.
        markSolvedSecretChestHint(self.storage);
        try {
          chest.classList.remove('wt-btn-icon--tease');
        } catch (_) {
          /* ignore */
        }

        // No fallback copy: only show the confirmation modal if wording exists.
        if (title && body && cta && typeof self.openModal === 'function') {
          // Mark shown before opening (one-shot per device) and to prevent render loops from re-opening.
          markShownSecretChestWelcome(self.storage);

          if (self._runtime) self._runtime.secretBonusPending = true;
          const html = `
              <p class="wt-text-preline">${escapeHtml(body)}</p>
              <div class="wt-actions">
                <button class="wt-btn wt-btn--primary" data-action="enter-secret-bonus">${escapeHtml(cta)}</button>
                ${notNow ? `<button class="wt-btn wt-btn--secondary" data-action="close-modal">${escapeHtml(notNow)}</button>` : ``}
              </div>
            `;

          self.openModal(html, title);
          return;
        }

        if (typeof self.startSecretBonusRun === 'function')
          self.startSecretBonusRun();
      }

      // Simple mode: 1 tap triggers immediately.
      if (Math.floor(tapsRequired) === 1) {
        enterSecretBonusFlow();
        return;
      }

      const sc = self._runtime?.secretChest;
      if (!sc) return;

      const now = Date.now();
      const last = Number(sc.lastTapAt || 0);

      // Reset window if too late
      if (!last || now - last > windowMs) {
        sc.tapCount = 0;
      }

      sc.lastTapAt = now;
      sc.tapCount = clampInt(Number(sc.tapCount || 0) + 1, 0, 99);

      if (sc.tapCount >= Math.floor(tapsRequired)) {
        sc.tapCount = 0;
        sc.lastTapAt = 0;
        enterSecretBonusFlow();
      }
    });
  };

  UI.prototype.updateFooter = function () {
    let root = this._footerNode || null;

    if (!root) {
      try {
        root =
          (this.appEl &&
            this.appEl.querySelector &&
            (this.appEl.querySelector('[data-wt-footer]') ||
              this.appEl.querySelector('.wt-footer') ||
              this.appEl.querySelector('footer'))) ||
          document.getElementById('wt-footer-root') ||
          null;
      } catch (_) {
        root = document.getElementById('wt-footer-root') || null;
      }
    }

    if (!root) return;

    // Cache only.
    // Footer content + hydration are owned by footer.js / email.js.
    this._footerNode = root;
  };

  // ============================================
  // Public API (called by main.js)
  // ============================================
  UI.prototype.setContent = function (items) {
    const list = Array.isArray(items) ? items : [];
    this._runtime.contentItems = list;
    this._runtime.contentById = Object.create(null);

    // Content is the source of truth for the visible pool size once content has loaded.
    if (this.config && this.config.game && list.length > 0) {
      this.config.game.poolSize = list.length;
    }

    for (const it of list) {
      const id = String(it && it.id != null ? it.id : '').trim();
      if (!id) continue;
      this._runtime.contentById[id] = it;
    }
    this._runtime.contentTotal = list.length;
  };

  UI.prototype.setContentLoading = function (isLoading) {
    if (!this._runtime) return;
    this._runtime.contentLoading = isLoading === true;
    this._runtime.contentLoadingMessage = this._runtime.contentLoading
      ? String(this.wording?.ui?.contentLoadingToast || '').trim()
      : '';
  };

  UI.prototype.getContentLoadingCopy = function () {
    return String(this._runtime?.contentLoadingMessage || '').trim();
  };

  UI.prototype.init = function () {
    // Browser Back support:
    // Make LANDING the base history entry so Back from any in-app screen can return here.
    try {
      const baseUrl = location.pathname + location.search;
      history.replaceState(
        { wt: true, screen: STATES.LANDING },
        '',
        baseUrl + '#home'
      );
    } catch (_) {}

    warmQuestionSpeechVoices(this);
    grantStarterRapidFireTicketIfNeeded(this.storage);

    // Populate footer with config values
    this.updateFooter();

    if (this._nav) this._nav.landingVariant = null;
    this.setState(STATES.LANDING);

    // Boot case: constructor already starts on LANDING, so the "Entering LANDING"
    // hook inside setState does not run on first load.
    let ep = null;
    if (this.storage && typeof this.storage.getEarlyPriceState === 'function') {
      try {
        ep = this.storage.getEarlyPriceState() || null;
      } catch (_) {
        ep = null;
      }
    }

    const isEarly = !!(
      ep &&
      String(ep.phase || '').toUpperCase() === 'EARLY' &&
      Number(ep.remainingMs || 0) > 0
    );

    if (isEarly) {
      this._stopPaywallTicker();
      this._startPaywallTicker();
    } else {
      this._stopPaywallTicker();
    }
  };

  UI.prototype.onStorageUpdated = function () {
    const rt = this._runtime || null;
    if (!rt) {
      this.render();
      return;
    }

    if (rt.gameOverPending === true) return;
    if (rt.finishingRun === true) return;
    if (rt.feedbackPending === true) return;
    if (rt.finishAfterFeedback === true) return;

    // Skip full re-render during active gameplay (avoids overlay/animation destruction).
    // The existing guards above cover transitions; this covers the stable PLAYING state.
    if (this.state === STATES.PLAYING) return;

    this.render();
  };

  UI.prototype.onStorageSaveFailed = function () {
    const msg = String(
      this.wording?.system?.storageSaveFailedToast || ''
    ).trim();
    if (!msg) return;

    // Non-blocking warning. Timing is config-driven (default bucket).
    toastNow(this.config, msg, { variant: 'danger' });
  };

  UI.prototype.getStatsByItem = function () {
    return this.storage && typeof this.storage.getStatsByItem === 'function'
      ? this.storage.getStatsByItem()
      : {};
  };

  // Pool exhausted toast (RUN / PRACTICE / BONUS)
  // Contract: WT_WORDING.ui.poolExhausted{Mode} must be provided (no fallback).
  UI.prototype._maybeShowPoolExhaustedToast = function () {
    const exhausted = !!(
      this.storage &&
      typeof this.storage.hasSeenAllWordTraps === 'function' &&
      this.storage.hasSeenAllWordTraps() === true
    );

    if (!exhausted) return;

    const mode = String(this._runtime?.runMode || '').trim();
    if (!mode) return;
    const key = `PLAYING:${mode}`;

    if (this._runtime && this._runtime.poolExhaustedToastKey === key) return;
    if (this._runtime) this._runtime.poolExhaustedToastKey = key;

    const uiWording = this.wording?.ui;
    if (!uiWording) return;

    let msgKey = '';
    switch (mode) {
      case 'PRACTICE':
        msgKey = 'poolExhaustedPractice';
        break;
      case 'BONUS':
        msgKey = 'poolExhaustedBonus';
        break;
      case 'RUN':
      default:
        msgKey = 'poolExhaustedRun';
        break;
    }

    const msg = String(uiWording[msgKey] || '').trim();
    if (!msg) return;

    const timing = getToastTiming(this.config, '');
    if (!timing) return;

    scheduleGameplayOverlay(msg, {
      delayMs: 0,
      durationMs: timing.durationMs,
      variant: 'info',
      mode
    });
  };

  UI.prototype.toggleQuestionSpeech = function () {
    const model = getCurrentQuestionSpeechModel(this);
    if (!model) return;

    if (
      this._runtime?.questionSpeechActive === true &&
      this._runtime?.questionSpeechKey === model.speechKey
    ) {
      cancelQuestionSpeech(this);
      this.render();
      return;
    }

    if (this._runtime) {
      this._runtime.questionAutoReadDoneKey = model.speechKey;
    }
    startQuestionSpeech(this, model, { render: true });
  };

  UI.prototype.toggleAutoReadQuestions = function () {
    if (
      !this.storage ||
      typeof this.storage.getAutoReadQuestions !== 'function' ||
      typeof this.storage.setAutoReadQuestions !== 'function'
    ) {
      return;
    }

    const next = !isAutoReadQuestionsEnabled(this.storage);
    try {
      this.storage.setAutoReadQuestions(next);
    } catch (_) {
      return;
    }

    if (next !== true) {
      cancelQuestionSpeech(this);
    } else if (this._runtime) {
      this._runtime.questionAutoReadDoneKey = '';
      const modalOpen = !!(
        this.modalEl && !this.modalEl.classList.contains('wt-hidden')
      );
      if (!modalOpen) syncAutoReadCurrentQuestion(this);
    }

    if (this.modalEl && !this.modalEl.classList.contains('wt-hidden')) {
      this.openHowToModal();
    } else if (this.state === STATES.PLAYING) {
      this.render();
    }
  };

  // Pool reshuffled toast (RUN only; one-shot from game.js state.poolReshuffled)
  // UX decision: show a single discreet info toast once per RUN (no spam).
  UI.prototype._maybeShowPoolReshuffledToast = function () {
    if (this.state !== STATES.PLAYING) return;

    const mode = String(this._runtime?.runMode || '').trim();
    if (mode !== 'RUN') return;

    if (!this._runtime || this._runtime.poolReshuffleToastShown === true)
      return;

    let poolReshuffled = false;
    try {
      const gs =
        this.game && typeof this.game.getState === 'function'
          ? this.game.getState() || {}
          : {};
      poolReshuffled = gs.poolReshuffled === true;
    } catch (_) {
      poolReshuffled = false;
    }

    if (poolReshuffled !== true) return;

    const msg = String(this.wording?.ui?.poolReshuffledToast || '').trim();
    if (!msg) return;

    const timing = getToastTiming(this.config, '');
    if (!timing) return;

    this._runtime.poolReshuffleToastShown = true;
    scheduleGameplayOverlay(msg, {
      delayMs: 0,
      durationMs: timing.durationMs,
      variant: 'info',
      mode: 'RUN'
    });
  };

  // ============================================
  // State transition cleanup
  // ============================================
  // Single orchestration point for state-scoped cleanup.
  // Product contract: no intended UX change, only deterministic cleanup.
  function cleanupAppTransitionClasses() {
    const app = document.getElementById('app');
    if (!app || !app.classList) return;

    try {
      app.classList.remove('wt-fade');
      app.classList.remove('wt-fade--out');
      app.classList.remove('wt-fade--in');
      app.classList.remove('transitioning');
    } catch (_) {
      /* silent */
    }
  }

  function cleanupEndExit(ui) {
    clearUiTimersByScope('end');

    if (ui && ui._runtime) {
      clearRuntimeTimer(ui, 'endRecordMomentTimer');
      clearRuntimeTimer(ui, 'endAutoModalTimerId');
      clearRuntimeTimer(ui, 'finishFadeOutTimerId');
      clearRuntimeTimer(ui, 'finishFadeInStartTimerId');
      clearRuntimeTimer(ui, 'finishFadeCleanupTimerId');
      ui._runtime.endRecordMomentUntil = 0;
    }

    cleanupAppTransitionClasses();
  }

  function resetSecretChestRuntime(ui) {
    if (!ui || !ui._runtime || !ui._runtime.secretChest) return;
    ui._runtime.secretChest.tapCount = 0;
    ui._runtime.secretChest.lastTapAt = 0;
  }

  function recordLandingExit(ui) {
    if (!ui || !ui._runtime) return;

    const enteredAt = Number(ui._runtime.landingEnteredAt || 0);
    if (
      enteredAt > 0 &&
      ui.storage &&
      typeof ui.storage.recordLandingTime === 'function'
    ) {
      try {
        ui.storage.recordLandingTime(Date.now() - enteredAt);
      } catch (_) {
        /* silent */
      }
    }

    ui._runtime.landingEnteredAt = 0;
  }

  function cleanupPaywallTickerIfNeeded(ui, prev, next) {
    if (!ui || typeof ui._stopPaywallTicker !== 'function') return;

    // The early-price ticker is allowed to live across PAYWALL <-> LANDING only.
    if (
      prev === STATES.PAYWALL &&
      next !== STATES.PAYWALL &&
      next !== STATES.LANDING
    ) {
      clearUiTimersByScope('paywall');
      ui._stopPaywallTicker();
    }

    if (
      prev === STATES.LANDING &&
      next !== STATES.LANDING &&
      next !== STATES.PAYWALL
    ) {
      clearUiTimersByScope('paywall');
      ui._stopPaywallTicker();
    }
  }

  function cleanupOverlaysForStateTransition(prev, next) {
    if (prev === next) return;

    // No gameplay transient overlay or run-start blocker outside PLAYING.
    if (next !== STATES.PLAYING) {
      clearUiTimer('overlay.gameplay.show');
      hideOverlay('transient');
      hideOverlay('runstart');
    }

    // Chance/game-over overlay is only tolerated during PLAYING -> END handoff.
    // Any other screen must not inherit it.
    if (next !== STATES.PLAYING && next !== STATES.END) {
      hideOverlay('chance');
    }
  }

  function cleanupStateTransition(ui, prev, next) {
    if (!ui || prev === next) return;

    if (next !== STATES.LANDING) {
      clearUiTimersByScope('daily');
    }

    // PLAYING owns feedback, live gameplay, bonus fall, beforeunload, and answer locks.
    if (prev === STATES.PLAYING && next !== STATES.PLAYING) {
      clearUiTimersByScope('feedback');
      clearUiTimersByScope('playing');

      const keepChanceOverlayVisible = !!(
        ui._runtime &&
        ui._runtime.finishingRun === true &&
        next === STATES.END
      );
      cleanupPlayingExit(ui, { keepChanceOverlayVisible });

      if (ui._runtime) ui._runtime.finishingRun = false;
      try {
        window.__wtGameOverSkipToEnd = null;
      } catch (_) {
        /* silent */
      }
    }

    // END-only timers/visual classes must not leak to other screens.
    if (prev === STATES.END && next !== STATES.END) {
      cleanupEndExit(ui);
    }

    // Secret chest gesture is per-END-screen attempt, never cross-screen state.
    if (prev === STATES.END || next === STATES.END) {
      resetSecretChestRuntime(ui);
    }

    // PAYWALL ticker is state-compatible with PAYWALL and LANDING only.
    cleanupPaywallTickerIfNeeded(ui, prev, next);

    if (prev === STATES.LANDING && next !== STATES.LANDING) {
      recordLandingExit(ui);
    }

    cleanupOverlaysForStateTransition(prev, next);
  }

  UI.prototype.setState = function (next) {
    const prev = this.state;

    // Automatic cleanup by state transition.
    // This is the single gate for timers, overlays, and ephemeral flags tied to the previous screen.
    cleanupStateTransition(this, prev, next);

    // Remember where PAYWALL was opened from (for "Not now" routing)
    if (next === STATES.PAYWALL && prev !== STATES.PAYWALL) {
      if (this._nav) this._nav.paywallFromState = prev; // END | LANDING | PLAYING (rare)
    }

    // Browser Back support (single step):
    // - LANDING is the base entry
    // - Any non-landing screen lives in ONE history entry (replaceState),
    //   so Back always returns to LANDING.
    try {
      const baseUrl = location.pathname + location.search;
      const hash = next === STATES.LANDING ? '#home' : '#app';
      if (this._nav) {
        this._nav.ignorePopstateUntil = Date.now() + 600;
      }

      if (next !== STATES.LANDING && prev === STATES.LANDING) {
        history.pushState({ wt: true, screen: next }, '', baseUrl + hash);
      } else {
        history.replaceState({ wt: true, screen: next }, '', baseUrl + hash);
      }
    } catch (_) {}

    this.state = next;

    // Pool exhausted toast: show once per entry into PLAYING (all modes)
    if (next === STATES.PLAYING && prev !== STATES.PLAYING) {
      this._maybeShowPoolExhaustedToast();
    }

    // Entering PAYWALL: ensure clean single ticker
    if (next === STATES.PAYWALL && prev !== STATES.PAYWALL) {
      if (this.storage && typeof this.storage.markPaywallShown === 'function') {
        this.storage.markPaywallShown(prev); // Storage owns startedAt persistence
      }
      this._stopPaywallTicker();
      this._startPaywallTicker(); // UI-only: re-render to show ticking mm:ss (PAYWALL/LANDING)
    }

    // Entering LANDING: show the EARLY timer only if the window is active (after PAYWALL)
    if (next === STATES.LANDING && prev !== STATES.LANDING) {
      if (this._runtime) {
        this._runtime.landingEnteredAt = Date.now();
      }
      let ep = null;
      if (
        this.storage &&
        typeof this.storage.getEarlyPriceState === 'function'
      ) {
        try {
          ep = this.storage.getEarlyPriceState() || null;
        } catch (_) {
          ep = null;
        }
      }

      const isEarly = !!(
        ep &&
        String(ep.phase || '').toUpperCase() === 'EARLY' &&
        Number(ep.remainingMs || 0) > 0
      );

      if (isEarly) {
        this._stopPaywallTicker();
        this._startPaywallTicker();
      } else {
        this._stopPaywallTicker();
      }
    }

    this.render();

    // BONUS start is owned by the run-start overlay dismissal flow.

    // END entry hooks(no gameplay interruptions)
    if (next === STATES.END && prev !== STATES.END) {
      // Micro-pics highlight (END-only)
      // Keep the computed END highlight so the END screen can actually use it.
      // We only avoid late toasts; we do NOT wipe the message here.
      try {
        const mp =
          this._runtime && this._runtime.microPics
            ? this._runtime.microPics
            : null;
        if (mp) {
          // Intentionally preserved.
        }
      } catch (_) {
        /* silent */
      }

      // Anonymous stats sharing prompt (END-only, one-shot, post-completion only)
      try {
        if (typeof this._maybePromptStatsSharingMilestone === 'function') {
          this._maybePromptStatsSharingMilestone();
        }
      } catch (_) {
        /* silent */
      }

      // Daily challenge ticket toast (RUN only, once per local day)
      try {
        const lastRun = this._runtime?.lastRun || {};
        const mode = String(lastRun.mode || '')
          .trim()
          .toUpperCase();
        if (mode === 'RUN') {
          const alreadyShown = getDailyChallengeToastDayKey(this.storage);
          const toastTpl = String(
            this.wording?.end?.dailyChallengeToast || ''
          ).trim();
          const dayKey = String(lastRun.dailyTicketDayKey || '').trim();
          if (
            lastRun.dailyTicketAwarded === true &&
            dayKey &&
            alreadyShown !== dayKey &&
            toastTpl
          ) {
            const msg = fillTemplate(toastTpl, {
              tickets: String(clampInt(lastRun.dailyTicketBalance, 0, 999))
            });
            if (msg)
              toastNow(this.config, msg, {
                variant: 'success',
                timingKey: 'dailyChallengeComplete'
              });
            markDailyChallengeToastShown(this.storage, dayKey);
          }
        }
      } catch (_) {
        /* silent */
      }

      // END celebration moment: new best, all mistakes cleared, or perfect bonus run.
      try {
        const cfg = this.config || {};
        const w = this.wording || {};
        const endW = w.end || {};
        const practiceW = w.practice || {};
        const bonusW = w.secretBonus || {};

        const lastRun = this._runtime?.lastRun || {};

        // One-shot: mastered celebration persistence (no modal required)
        try {
          const mastered = !!(
            this.storage &&
            typeof this.storage.isMastered === 'function' &&
            this.storage.isMastered() === true
          );

          const already = !!(
            this.storage &&
            typeof this.storage.hasMasteredCelebrated === 'function' &&
            this.storage.hasMasteredCelebrated() === true
          );

          if (
            mastered &&
            !already &&
            this.storage &&
            typeof this.storage.markMasteredCelebrated === 'function'
          ) {
            this.storage.markMasteredCelebrated();
          }
        } catch (_) {
          /* silent */
        }

        const mode = String(lastRun.mode || '').trim();
        const isRun = mode === 'RUN';
        const isBonus = mode === 'BONUS';
        const isPractice = mode === 'PRACTICE';
        const newBest = (isRun || isBonus) && lastRun.newBest === true;
        let practiceAllCleared = false;
        if (
          isPractice &&
          this.storage &&
          typeof this.storage.getActiveMistakesCount === 'function'
        ) {
          try {
            practiceAllCleared =
              clampInt(this.storage.getActiveMistakesCount(), 0, 99999) === 0;
          } catch (_) {
            practiceAllCleared = false;
          }
        }

        let bonusPerfect = false;
        if (isBonus) {
          const shown = Array.isArray(lastRun.runItemIds)
            ? lastRun.runItemIds.length
            : 0;
          const score = clampInt(Number(lastRun.scoreFP || 0), 0, 99999);
          const accuracy = shown > 0 ? score / shown : -1;
          const tiers = Array.isArray(cfg?.secretBonus?.endTiers)
            ? cfg.secretBonus.endTiers
            : [];
          let bonusLevel = '';
          for (const t of tiers) {
            const key = String(t?.key || '').trim();
            const min = Number(t?.minAccuracy);
            if (!key || !Number.isFinite(min)) continue;
            if (accuracy >= min) {
              bonusLevel = key;
              break;
            }
          }
          bonusPerfect = bonusLevel === 'perfect';
        }

        const ms = Number(cfg?.ui?.endRecordMomentMs);

        const newBestTpl = isBonus
          ? String(
              (w && w.secretBonus && w.secretBonus.newBest) ||
                endW.newBest ||
                ''
            ).trim()
          : String(endW.newBest || '').trim();
        const practiceCelebrateTpl = String(
          practiceW.celebrationAllCleared || practiceW.endLineAllFixed || ''
        ).trim();
        const bonusCelebrateTpl = String(
          bonusW.celebrationPerfect || ''
        ).trim();
        const celebrationLabel = newBest
          ? newBestTpl
          : practiceAllCleared
            ? practiceCelebrateTpl
            : bonusPerfect
              ? bonusCelebrateTpl
              : '';

        const enabled = !!celebrationLabel && Number.isFinite(ms) && ms > 0;
        if (enabled) {
          if (!this._runtime) this._runtime = {};
          if (this._runtime.endRecordMomentTimer) {
            clearRuntimeTimer(this, 'endRecordMomentTimer');
          }

          this._runtime.endRecordMomentUntil = Date.now() + ms;

          setRuntimeTimer(
            this,
            'endRecordMomentTimer',
            () => {
              try {
                if (this._runtime) {
                  this._runtime.endRecordMomentTimer = null;
                  this._runtime.endRecordMomentUntil = 0;
                }
                this.render();
              } catch (_) {
                /* silent */
              }
            },
            ms
          );
        } else {
          if (this._runtime) this._runtime.endRecordMomentUntil = 0;
        }
      } catch (_) {
        /* silent */
      }

      // END score victory animation (UI-only; no count-up; respects reduced motion)
      try {
        if (
          window.matchMedia &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches
        )
          return;

        const scoreEl = document.querySelector('.wt-end-score');
        if (!scoreEl) return;

        // Restart animation cleanly on each END entry
        scoreEl.classList.remove('wt-end-score--celebrate');
        void scoreEl.offsetWidth; // force reflow (Safari-safe)
        scoreEl.classList.add('wt-end-score--celebrate');
      } catch (_) {
        /* silent */
      }
    }
  };

  // ============================================
  // Modal helpers
  // ============================================

  UI.prototype.openModal = function (html, title, options) {
    if (!this.modalEl || !this.modalContentEl) {
      return;
    }
    // A11Y: store last focused element to restore on close
    try {
      if (this._runtime)
        this._runtime._lastFocusBeforeModal = document.activeElement || null;
    } catch (_) {
      /* silent */
    }

    // A11Y: inert the main content so Tab cannot reach behind the modal
    try {
      const mainEl = document.querySelector('.wt-main');
      if (mainEl) mainEl.inert = true;
    } catch (_) {
      /* silent */
    }

    this.modalEl.classList.remove('wt-hidden');
    this.modalEl.setAttribute('aria-hidden', 'false');

    const t = escapeHtml(String(title || '').trim());
    const closeLabel = escapeHtml(
      String(this.wording?.system?.close || '').trim()
    );
    const hideCloseButton = !!(options && options.hideCloseButton === true);
    const modalClass = String(options?.modalClass || '').trim();
    const modalKey = String(options?.modalKey || '').trim();

    if (this._runtime) this._runtime._modalExtraClass = modalClass;
    if (this._runtime) this._runtime._modalKey = modalKey;
    this.modalContentEl.classList.remove(
      'wt-modal--sheet',
      'wt-modal--levelsheet'
    );
    this.modalContentEl.removeAttribute('data-wt-modal-key');
    if (modalKey)
      this.modalContentEl.setAttribute('data-wt-modal-key', modalKey);
    if (modalClass) {
      modalClass
        .split(/\s+/)
        .filter(Boolean)
        .forEach((cls) => this.modalContentEl.classList.add(cls));
    }

    this.modalContentEl.innerHTML = `
  <div class="wt-modal-header">
    <div class="wt-row wt-row--spaced">
      <h2 id="wt-modal-title" class="wt-h2">${t}</h2>
      ${hideCloseButton ? `` : `<button class="wt-btn wt-btn--ghost" data-action="close-modal" aria-label="${closeLabel}">&times;</button>`}
    </div>
  </div>
  ${html}
`;

    // UX: always start at top (content is scrollable and scroll position can persist)
    // Safari/reflow edge cases: reset now + on next frame.
    try {
      this.modalContentEl.scrollTop = 0;
      this.modalEl.scrollTop = 0;
      window.requestAnimationFrame(() => {
        try {
          this.modalContentEl.scrollTop = 0;
          this.modalEl.scrollTop = 0;
        } catch (_) {
          /* silent */
        }
      });
    } catch (_) {
      /* silent */
    }

    // A11Y: focus the first actionable element in the modal (close button)
    try {
      const first = this.modalContentEl.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (first && typeof first.focus === 'function') first.focus();
    } catch (_) {
      /* silent */
    }

    // A11Y: minimal focus trap (Tab/Shift+Tab loops inside modal)
    try {
      const self = this;
      const trap = function (e) {
        if (!e) return;
        if (!self.modalEl || self.modalEl.classList.contains('wt-hidden'))
          return;

        // A11Y: Escape closes the modal
        if (e.key === 'Escape') {
          e.preventDefault();
          if (typeof self.closeModal === 'function') self.closeModal();
          return;
        }

        if (e.key !== 'Tab') return;
        const focusables = self.modalEl.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;
        if (!focusables || focusables.length === 0) return;

        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (e.shiftKey) {
          if (active === firstEl || active === self.modalEl) {
            e.preventDefault();
            if (lastEl && typeof lastEl.focus === 'function') lastEl.focus();
          }
        } else {
          if (active === lastEl) {
            e.preventDefault();
            if (firstEl && typeof firstEl.focus === 'function') firstEl.focus();
          }
        }
      };

      if (this._runtime) this._runtime._modalTrapHandler = trap;
      this.modalEl.addEventListener('keydown', trap);
    } catch (_) {
      /* silent */
    }
  };

  UI.prototype.closeModal = function () {
    if (!this.modalEl || !this.modalContentEl) return;

    // A11Y: remove focus trap listener
    try {
      const h = this._runtime ? this._runtime._modalTrapHandler : null;
      if (h) this.modalEl.removeEventListener('keydown', h);
      if (this._runtime) this._runtime._modalTrapHandler = null;
    } catch (_) {
      /* silent */
    }

    if (this._runtime) {
      this._runtime.secretBonusPending = false;
    }

    this.modalEl.classList.add('wt-hidden');
    this.modalEl.setAttribute('aria-hidden', 'true');
    this.modalContentEl.classList.remove(
      'wt-modal--sheet',
      'wt-modal--levelsheet'
    );
    this.modalContentEl.removeAttribute('data-wt-modal-key');
    this.modalContentEl.innerHTML = '';
    if (this._runtime) this._runtime._modalExtraClass = '';
    if (this._runtime) this._runtime._modalKey = '';

    // A11Y: re-enable main content
    try {
      const mainEl = document.querySelector('.wt-main');
      if (mainEl) mainEl.inert = false;
    } catch (_) {
      /* silent */
    }

    // A11Y: restore focus to the element that opened the modal (if still present)
    try {
      const prev = this._runtime ? this._runtime._lastFocusBeforeModal : null;
      if (this._runtime) this._runtime._lastFocusBeforeModal = null;

      if (prev && typeof prev.focus === 'function' && document.contains(prev)) {
        prev.focus();
      }
    } catch (_) {
      /* silent */
    }

    if (this.state === STATES.PLAYING) {
      syncAutoReadCurrentQuestion(this);
    }
  };

  UI.prototype.openHowToModal = function () {
    const w = this.wording || {};
    const how = w.howto || {};
    const ui = w.ui || {};
    const cfg = this.config || {};
    const poolSize = Number(cfg?.game?.poolSize);
    const maxChances = Number(cfg?.game?.maxChances);

    const isPrem = isPremiumNow(this.storage);

    // Pull live values from the engine (single source of truth)
    const gs =
      this.game && typeof this.game.getState === 'function'
        ? this.game.getState() || {}
        : {};
    const scoreFP = Number(gs.scoreFP);
    const chancesLeft = Number(gs.chancesLeft);
    const speechSupported = supportsQuestionSpeechForLocale(getQuestionSpeechLocale());
    const autoReadEnabled = isAutoReadQuestionsEnabled(this.storage);

    // No hardcoded fallback: if runtime values are missing, keep placeholders empty.
    const vars = {
      score: Number.isFinite(scoreFP) ? scoreFP : '',
      fpLong: String(ui.fpLong || '').trim(),
      maxChances: Number.isFinite(maxChances) ? maxChances : '',
      chancesLeft: Number.isFinite(chancesLeft)
        ? chancesLeft
        : Number.isFinite(maxChances)
          ? maxChances
          : ''
    };

    const line = (s) =>
      `<p>${escapeHtml(fillTemplate(String(s || '').trim(), vars))}</p>`;

    // Business section (Premium + Activate) is ONLY for non-premium users.
    let premiumHtml = '';
    if (!isPrem) {
      const premiumOnlyHint = String(how.premiumOnlyHint || '').trim();

      const paywallBullets = Array.isArray(w.paywall?.valueBullets)
        ? w.paywall.valueBullets
        : [];
      const premiumBulletsHtml = paywallBullets
        .map((b) => String(b || '').trim())
        .filter(Boolean)
        .map((b) => `<p class="wt-muted">&bull; ${escapeHtml(b)}</p>`)
        .join('');

      const upgradeCta = String(w.paywall?.cta || '').trim();
      const redeemLabel = String(w.paywall?.alreadyHaveCode || '').trim();

      premiumHtml = `
        <div class="wt-divider"></div>
        <div class="wt-actions wt-actions--compact">
          ${redeemLabel ? `<button class="wt-btn wt-btn--ghost" data-action="redeem-code">${escapeHtml(redeemLabel)}</button>` : ``}
          ${upgradeCta ? `<button class="wt-btn wt-btn--ghost" data-action="open-paywall">${escapeHtml(upgradeCta)}</button>` : ``}
        </div>
      `;
    }
    const audioTitle = String(how.audioTitle || '').trim();
    const autoReadLabel = String(how.autoReadLabel || '').trim();
    const autoReadHelp = String(how.autoReadHelp || '').trim();
    const autoReadStatus = String(
      autoReadEnabled ? how.autoReadOn || '' : how.autoReadOff || ''
    ).trim();
    const audioSettingsHtml =
      speechSupported && autoReadLabel
        ? `
        <div class="wt-divider"></div>
        <div class="wt-stack wt-stack--xs wt-how-setting">
          ${audioTitle ? `<p class="wt-question-title">${escapeHtml(audioTitle)}</p>` : ``}
          <button
            type="button"
            class="wt-text-action wt-how-setting__toggle"
            data-action="toggle-auto-read-questions"
            aria-pressed="${autoReadEnabled ? 'true' : 'false'}"
          >
            <span>${escapeHtml(autoReadLabel)}</span>
            ${autoReadStatus ? `<span class="wt-how-setting__status">${escapeHtml(autoReadStatus)}</span>` : ``}
          </button>
          ${autoReadHelp ? `<p class="wt-muted">${escapeHtml(autoReadHelp)}</p>` : ``}
        </div>
      `
        : '';
    const html = `
     <p class="wt-how-line">${escapeHtml(String(how.howToPlayLine1 || '').trim())}</p>
<p class="wt-how-line">${escapeHtml(String(how.howToPlayLine2 || '').trim())}</p>
<p class="wt-how-line">${escapeHtml(String(how.howToPlayLine3 || '').trim())}</p>

${audioSettingsHtml}

<div class="wt-divider"></div>

      <div class="wt-stack wt-stack--sm">
        <p class="wt-question-title">
          ${escapeHtml(String(how.ruleTitle || '').trim())}
        </p>
        <p class="wt-muted">
          ${escapeHtml(fillTemplate(String(how.ruleSentence || '').trim(), vars))}
        </p>
      </div>

      ${premiumHtml}
    `;

    this.openModal(html, String(how.title || '').trim());
  };

  UI.prototype.openLevelProgressModal = function () {
    const w = this.wording || {};
    const cfg = this.config || {};
    const levelsW = w.levels && typeof w.levels === 'object' ? w.levels : {};
    const model = getAppLevelModel(this.storage, cfg, w);
    const progressionLabel = String(levelsW.progressionLabel || '').trim();
    const currentPill = String(levelsW.currentPill || '').trim();
    const unlockedPill = String(levelsW.unlockedPill || '').trim();
    const lockedPill = String(levelsW.lockedPill || '').trim();

    const progressionHtml = model.defs
      .map((item) => {
        const pill = item.current
          ? currentPill
          : item.unlocked
            ? unlockedPill
            : lockedPill;
        const stateClass = item.current
          ? ' wt-level-strip__item--current'
          : item.unlocked
            ? ' wt-level-strip__item--done'
            : '';
        return `
        <li class="wt-level-strip__item${stateClass}">
          <div class="wt-level-strip__main">
            <span class="wt-level-strip__dot" aria-hidden="true"></span>
            <div class="wt-level-strip__copy">
              <strong class="wt-level-strip__label">${escapeHtml(item.label)}</strong>
              <span class="wt-level-strip__meta">${escapeHtml(item.unlock)}</span>
            </div>
          </div>
          ${pill ? `<span class="wt-level-strip__pill">${escapeHtml(pill)}</span>` : ``}
        </li>
      `;
      })
      .join('');

    const html = `
      <div class="wt-level-sheet__section wt-level-sheet__section--progress">
        ${progressionLabel ? `<p class="wt-level-sheet__eyebrow">${escapeHtml(progressionLabel)}</p>` : ``}
        <ul class="wt-level-strip" role="list">
          ${progressionHtml}
        </ul>
      </div>
    `;

    this.openModal(html, String(levelsW.modalTitle || '').trim(), {
      modalClass: 'wt-modal--sheet wt-modal--levelsheet'
    });
  };

  UI.prototype.openLeaderboardModal = function (opts) {
    if (
      !window.WT_UI_Leaderboard ||
      typeof window.WT_UI_Leaderboard.openModal !== 'function'
    ) {
      return;
    }
    return window.WT_UI_Leaderboard.openModal(this, {
      escapeHtml,
      initialTab: opts && typeof opts === 'object' ? opts.initialTab : ''
    });
  };

  UI.prototype.saveLeaderboardProfileFromModal = async function () {
    if (
      !window.WT_UI_Leaderboard ||
      typeof window.WT_UI_Leaderboard.saveProfileFromModal !== 'function'
    ) {
      return;
    }
    return window.WT_UI_Leaderboard.saveProfileFromModal(this, {
      escapeHtml,
      toastNow
    });
  };

  UI.prototype.switchLeaderboardModalTab = function (tabKey) {
    if (
      !window.WT_UI_Leaderboard ||
      typeof window.WT_UI_Leaderboard.switchModalTab !== 'function'
    ) {
      return;
    }
    return window.WT_UI_Leaderboard.switchModalTab(
      this,
      String(tabKey || '').trim()
    );
  };

  UI.prototype.leaveLeaderboardFromModal = async function () {
    if (
      !window.WT_UI_Leaderboard ||
      typeof window.WT_UI_Leaderboard.leaveFromModal !== 'function'
    ) {
      return;
    }
    return window.WT_UI_Leaderboard.leaveFromModal(this, { toastNow });
  };

  UI.prototype.submitLeaderboardRun = async function (lastRun) {
    if (
      !window.WT_UI_Leaderboard ||
      typeof window.WT_UI_Leaderboard.submitRun !== 'function'
    ) {
      return;
    }
    return window.WT_UI_Leaderboard.submitRun(this, lastRun, {
      getLeaderboardContentVersion
    });
  };

  UI.prototype.openRedeemModal = function () {
    const w = this.wording || {};
    const how = w.howto || {};

    const placeholder = String(how.activationCodePlaceholder || '').trim();
    const phAttr = placeholder
      ? ` placeholder="${escapeHtml(placeholder)}"`
      : '';

    // Prefill from storage single source of truth (no raw data access)
    let existingCode = '';
    if (
      this.storage &&
      typeof this.storage.getStoredPremiumCode === 'function'
    ) {
      try {
        existingCode = String(this.storage.getStoredPremiumCode() || '').trim();
      } catch (_) {
        existingCode = '';
      }
    }

    const valAttr = existingCode ? ` value="${escapeHtml(existingCode)}"` : '';

    const html = `
      <label class="wt-label" for="wt-code">${escapeHtml(String(how.activationCodeLabel || '').trim())}</label>
      <input id="wt-code" class="wt-input" autocomplete="off" inputmode="text"${phAttr}${valAttr} />
      <p class="wt-muted">${escapeHtml(String(how.activateLine2 || '').trim())}</p>

      <div class="wt-actions">
        <button class="wt-btn wt-btn--primary" data-action="confirm-redeem">${escapeHtml(String(how.activateCta || '').trim())}</button>
      </div>

      <p id="wt-code-msg" class="wt-muted" aria-live="polite"></p>
    `;

    this.openModal(html, String(how.activateTitle || '').trim());

    // UX: focus input (optional, safe)
    try {
      const input = this.modalContentEl
        ? this.modalContentEl.querySelector('#wt-code')
        : null;
      if (input && typeof input.focus === 'function') input.focus();
      if (
        input &&
        typeof input.setSelectionRange === 'function' &&
        existingCode
      ) {
        input.setSelectionRange(existingCode.length, existingCode.length);
      }
    } catch (_) {
      /* silent */
    }
  };

  UI.prototype.promptAutoRedeemIfReady = function () {
    // Guardrails: StorageManager is the source of truth, and prompt only once per page-load.
    if (this._runtime && this._runtime._autoRedeemPromptShown === true) return;

    const isPrem = isPremiumNow(this.storage);
    if (isPrem) return;

    if (!this.storage || typeof this.storage.getVanityCode !== 'function')
      return;

    let code = '';
    try {
      code = String(this.storage.getVanityCode() || '').trim();
    } catch (_) {
      code = '';
    }
    if (!code) return;

    if (this._runtime) this._runtime._autoRedeemPromptShown = true;
    this.openAutoRedeemModal();
  };

  UI.prototype.openAutoRedeemModal = function () {
    const w = this.wording || {};
    const how = w.howto || {};

    const title = String(how.autoActivateTitle || '').trim();
    const l1 = String(how.autoActivateLine1 || '').trim();
    const l2 = String(how.autoActivateLine2 || '').trim();

    const cta = String(how.autoActivateCta || '').trim();
    const later = String(how.autoActivateLater || '').trim();

    const html = `
      ${l1 ? `<p>${escapeHtml(l1)}</p>` : ``}
      ${l2 ? `<p class="wt-muted">${escapeHtml(l2)}</p>` : ``}

      <div class="wt-actions">
        ${cta ? `<button class="wt-btn wt-btn--primary" data-action="auto-redeem-now">${escapeHtml(cta)}</button>` : ``}
        ${later ? `<button class="wt-btn wt-btn--secondary" data-action="auto-redeem-later">${escapeHtml(later)}</button>` : ``}
      </div>

      <p id="wt-auto-redeem-msg" class="wt-muted" aria-live="polite"></p>
    `;

    this.openModal(html, title);
  };

  UI.prototype._redeemVanityCodeNow = function () {
    const w = this.wording || {};
    const how = w.howto || {};

    const msg = this.modalContentEl
      ? this.modalContentEl.querySelector('#wt-auto-redeem-msg')
      : null;

    if (
      !this.storage ||
      typeof this.storage.tryRedeemPremiumCode !== 'function' ||
      typeof this.storage.getVanityCode !== 'function'
    ) {
      if (msg) msg.textContent = String(how.codeRejected || '').trim();
      return;
    }

    let code = '';
    try {
      code = String(this.storage.getVanityCode() || '').trim();
    } catch (_) {
      code = '';
    }
    if (!code) {
      if (msg) msg.textContent = String(how.codeRejected || '').trim();
      return;
    }

    const res = this.storage.tryRedeemPremiumCode(code);
    if (!res || res.ok !== true) {
      if (msg) msg.textContent = String(how.codeRejected || '').trim();
      return;
    }

    // Success: clear vanity key to prevent re-prompting
    if (typeof this.storage.clearVanityCode === 'function') {
      try {
        this.storage.clearVanityCode();
      } catch (_) {
        /* silent */
      }
    }

    toastNow(this.config, String(how.codeOk || '').trim());
    this.closeModal();
    this.render();
  };

  UI.prototype._confirmRedeemCode = function () {
    const w = this.wording || {};
    const how = w.howto || {};

    const input = this.modalContentEl
      ? this.modalContentEl.querySelector('#wt-code')
      : null;
    const msg = this.modalContentEl
      ? this.modalContentEl.querySelector('#wt-code-msg')
      : null;

    const code = String(input && input.value ? input.value : '').trim();
    if (!code) {
      if (msg) msg.textContent = String(how.enterCode || '').trim();
      return;
    }

    const cfg = this.config || {};
    const reRaw = String(cfg.premiumCodeRegex || '').trim();
    if (reRaw) {
      try {
        const re = new RegExp(reRaw);
        if (!re.test(code)) {
          if (msg) msg.textContent = String(how.codeInvalid || '').trim();
          return;
        }
      } catch (_) {
        // ignore (soft)
      }
    }

    if (
      !this.storage ||
      typeof this.storage.tryRedeemPremiumCode !== 'function'
    ) {
      if (msg) msg.textContent = String(how.codeRejected || '').trim();
      return;
    }

    const res = this.storage.tryRedeemPremiumCode(code);

    if (!res || res.ok !== true) {
      if (msg) msg.textContent = String(how.codeRejected || '').trim();
      return;
    }

    /// Success
    toastNow(this.config, String(how.codeOk || '').trim());
    this.closeModal();
    this.render();
  };

  // ============================================
  // Game flow
  // ============================================

  // V2 first-run framing:
  // - free users: shown during free runs only
  // - premium users: shown once on the first premium run
  // Persistence is owned by StorageManager.

  UI.prototype._canShowFirstRunFraming = function () {
    // Only from landing
    if (this.state !== STATES.LANDING) return false;

    if (!this.storage) return false;

    const runsUsed = Number(this.storage.getRunsUsed?.() || 0);

    // Free users: framing only during free runs
    const freeRuns = clampInt(this.config?.limits?.freeRuns, 0, 99);

    if (isPremiumNow(this.storage)) {
      if (typeof this.storage.hasSeenPremiumFirstRunFraming !== 'function')
        return false;
      return this.storage.hasSeenPremiumFirstRunFraming() !== true;
    }

    return runsUsed < freeRuns;
  };

  UI.prototype._openFirstRunFraming = function () {
    const w = this.wording || {};
    const fr = w.firstRun || {};
    const cfg = this.config || {};

    const poolSize = clampInt(cfg?.game?.poolSize, 1, 9999);
    const maxChances = clampInt(cfg?.game?.maxChances, 1, 99);
    const freeRuns = clampInt(cfg?.limits?.freeRuns, 0, 99);

    const vars = { poolSize, maxChances, freeRuns };

    let runsUsed = 0;
    if (this.storage && typeof this.storage.getRunsUsed === 'function') {
      runsUsed = Number(this.storage.getRunsUsed() || 0);
    }

    const run1Lines = Array.isArray(fr.run1Lines) ? fr.run1Lines : [];
    const run2Lines = Array.isArray(fr.run2Lines) ? fr.run2Lines : [];
    const run3Lines = Array.isArray(fr.run3Lines) ? fr.run3Lines : [];

    const activeLines =
      runsUsed === 1 ? run2Lines : runsUsed === 2 ? run3Lines : run1Lines;

    const renderLines = (arr) => {
      return arr
        .map((s) => String(s || '').trim())
        .filter(Boolean)
        .map(
          (s, i) =>
            `<p class="wt-meta${i === 0 ? ` wt-meta--strong` : ``}">${escapeHtml(fillTemplate(s, vars))}</p>`
        )
        .join('');
    };

    const html = `
      ${renderLines(activeLines)}
          <div class="wt-actions">
                     <button class="wt-btn wt-btn--primary" data-action="start-run" aria-label="${escapeHtml(String(fr.ctaLabel || '').trim())}">
           ${escapeHtml(String(fr.ctaLabel || '').trim())}
         </button>

      </div>

    `;

    let modalTitle =
      String(fr.titleRun1 || '').trim() || String(w.system?.more || '').trim();
    if (runsUsed === 1 && String(fr.titleRun2 || '').trim()) {
      modalTitle = String(fr.titleRun2 || '').trim();
    } else if (runsUsed === 2 && String(fr.titleRun3 || '').trim()) {
      modalTitle = String(fr.titleRun3 || '').trim();
    }

    try {
      markSeenFirstRunFraming(this.storage);
    } catch (_) {}

    try {
      if (
        isPremiumNow(this.storage) &&
        typeof this.storage.markSeenPremiumFirstRunFraming === 'function'
      ) {
        this.storage.markSeenPremiumFirstRunFraming();
      }
    } catch (_) {}

    this.openModal(html, modalTitle);
  };

  UI.prototype._maybeTriggerMicroPic = function (res) {
    // Spec: only in RUN (never in practice)
    // Product rule (updated): micro-pics can surface during RUN via gameplay overlay, with cooldown.
    if (!this._runtime) return;
    const runMode = String(this._runtime?.runMode || '').trim();
    if (!runMode) return;
    if (runMode !== MODES.RUN) return;

    const mp = this._runtime.microPics;
    if (!mp) return;

    const w = this.wording || {};
    const mpc =
      w.micropics && typeof w.micropics === 'object' ? w.micropics : {};
    const cfg = this.config || {};
    const phaseCtx = getRuleKnowledgePhaseContext({
      cfg,
      w,
      storage: this.storage,
      poolSize: clampInt(cfg?.game?.poolSize, 0, 99999)
    });
    const phaseMpc = Object.assign({}, mpc, phaseCtx.micropics || {});

    const mpCfg = cfg && cfg.microPics ? cfg.microPics : null;
    if (!mpCfg) return;

    let answeredCount = 0;
    try {
      const gs =
        this.game && typeof this.game.getState === 'function'
          ? this.game.getState() || {}
          : {};
      const idx = Number(gs.idx);
      if (Number.isFinite(idx)) answeredCount = idx + 1;
    } catch (_) {
      /* keep 0 */
    }

    const isCorrect = res && res.isCorrect === true;

    // Live state after engine answer
    let chancesLeft = mp.prevChancesLeft;
    try {
      const gs =
        this.game && typeof this.game.getState === 'function'
          ? this.game.getState() || {}
          : {};
      if (gs.chancesLeft != null) chancesLeft = clampInt(gs.chancesLeft, 0, 99);
    } catch (_) {
      /* keep prev */
    }

    // Detect chance loss strictly (observable state change)
    const prev = mp.prevChancesLeft == null ? chancesLeft : mp.prevChancesLeft;
    const chanceLost =
      !isCorrect &&
      Number.isFinite(prev) &&
      Number.isFinite(chancesLeft) &&
      chancesLeft < prev;

    // Update prev snapshot ASAP
    mp.prevChancesLeft = chancesLeft;

    // Maintain streak + momentum meter
    if (isCorrect) {
      mp.correctStreak = clampInt(mp.correctStreak + 1, 0, 9999);
      mp.maxCorrectStreak = Math.max(
        clampInt(mp.maxCorrectStreak, 0, 9999),
        mp.correctStreak
      );

      const momentumState = getMomentumMeterState(
        cfg,
        mp.correctStreak,
        runMode,
        mp.momentumLevel
      );
      if (momentumState) {
        const maxSegments = getMomentumSegments(cfg);
        const current = clampInt(mp.momentumLevel, 0, maxSegments);
        const target = clampInt(momentumState.target, 0, maxSegments);

        // Recovery must feel immediate:
        // after a loss, each correct answer rebuilds +1 visible segment
        // instead of waiting for the new streak to "catch up".
        mp.momentumLevel = Math.min(maxSegments, Math.max(target, current + 1));
      }
    } else {
      const maxSegments = getMomentumSegments(cfg) || 6;
      const currentLevel = clampInt(mp.momentumLevel, 0, maxSegments);

      mp.correctStreak = 0;
      mp.flowTierShown = 0;

      mp.momentumLevel = getMomentumDropLevel(cfg, currentLevel);
    }

    // Danger overlays are handled centrally (no micro-pic overlay on chance loss)
    // But we do want to mark the "post-mistake" window for recovery logic.
    if (chanceLost) {
      mp.justRecoveredFromMistake = true;
      mp.lastDangerAtCount = answeredCount;
      mp.lastDangerAtMs = Date.now();
    }

    // Timing bucket (no fallback): required for in-run micro-pics
    const timing = getToastTiming(cfg, 'positive');
    if (!timing) return;

    const cooldownItems = Number(mpCfg.cooldownItems);
    if (
      !Number.isFinite(cooldownItems) ||
      cooldownItems < 0 ||
      cooldownItems > 99
    )
      return;

    function tryShowRunOverlay(msg, variant) {
      const m = String(msg || '').trim();
      if (!m) return false;

      // 1 message per answer (even if cooldownItems=0)
      if (answeredCount === clampInt(mp.lastToastAtCount, -9999, 9999))
        return false;

      // Do not show a positive overlay on the exact same answer as a danger event.
      // Once the next valid answer lands, positives may resume normally.
      const lastDangerAtCount = clampInt(mp.lastDangerAtCount, -9999, 9999);
      if (answeredCount === lastDangerAtCount) return false;

      const canShowNow =
        answeredCount - clampInt(mp.lastToastAtCount, -9999, 9999) >=
        Math.floor(cooldownItems);
      if (!canShowNow) return false;

      scheduleGameplayOverlay(m, {
        delayMs: timing.delayMs,
        durationMs: timing.durationMs,
        variant: String(variant || 'info'),
        cfg,
        mode: runMode
      });
      mp.lastToastAtCount = answeredCount;
      return true;
    }

    function setEndHighlight(msg, variant, priority) {
      const m = String(msg || '').trim();
      if (!m) return;

      const p = Number(priority);
      if (!Number.isFinite(p)) return;

      const currentP = Number(mp.endHighlightPriority);
      const hasCurrent = Number.isFinite(currentP);

      if (!hasCurrent || p > currentP) {
        mp.endHighlight = m;
        mp.endHighlightVariant = String(variant || '').trim();
        mp.endHighlightPriority = Math.floor(p);
      }
    }

    // Chance loss handler: no gameplay micro-pic on this answer.
    // We can still set END-only highlights (no interruptions).
    if (chanceLost) {
      // Near-miss (one-shot per RUN): error that brings you down to 1 chance left.
      if (
        cfg?.microPics?.nearMissEnabled === true &&
        chancesLeft === 1 &&
        mp.nearMissShown !== true
      ) {
        const msg = String(phaseMpc.nearMiss || mpc.nearMiss || '').trim();
        setEndHighlight(msg, 'info', getEndHighlightPriority(cfg, 'nearMiss'));
        mp.nearMissShown = true;
      }

      // Repeated mistakes qualitative feedback (one-shot per RUN)
      const minWrong = Number(cfg?.microPics?.repeatMistakeWrongCountMin);
      if (
        Number.isFinite(minWrong) &&
        minWrong > 0 &&
        mp.repeatMistakeShown !== true
      ) {
        const idNum = Number(res?.itemId);
        if (
          Number.isFinite(idNum) &&
          this.storage &&
          typeof this.storage.getItemStats === 'function'
        ) {
          const st = this.storage.getItemStats(idNum) || null;
          const wc = Number(st?.wrongCount || 0);
          if (Number.isFinite(wc) && wc >= Math.floor(minWrong)) {
            const msg = String(
              phaseMpc.repeatMistake || mpc.repeatMistake || ''
            ).trim();
            setEndHighlight(
              msg,
              'info',
              getEndHighlightPriority(cfg, 'repeatMistake')
            );
            mp.repeatMistakeShown = true;
          }
        }
      }

      return;
    }

    // Survival highlight: reached 1 chance remaining at least once (RUN)
    // Rule: 1 message per answer max -> if survival shows, skip tier streak on this answer.
    if (isCorrect && chancesLeft === 1 && mp.survivalShown !== true) {
      const msg = String(
        phaseMpc.runContinues || mpc.runContinues || ''
      ).trim();
      if (tryShowRunOverlay(msg, 'info')) {
        mp.survivalShown = true;
      }
      setEndHighlight(msg, 'info', getEndHighlightPriority(cfg, 'survival'));
      return;
    }

    // Flow highlight (highest tier wins)
    const s = clampInt(mp.correctStreak, 0, 9999);

    // No fallback: thresholds must exist in WT_CONFIG.microPics.streakThresholds.
    const th = cfg?.microPics?.streakThresholds;
    const tLegendary = Number(th?.legendary);
    const tElite = Number(th?.elite);
    const tStrong = Number(th?.strong);
    const tBuilding = Number(th?.building);
    const tStart = Number(th?.start);

    const ok =
      Number.isFinite(tLegendary) &&
      Number.isFinite(tElite) &&
      Number.isFinite(tStrong) &&
      Number.isFinite(tBuilding) &&
      Number.isFinite(tStart);

    if (!ok) return;

    // Show at most one tier per answer (priority: highest)
    const tierOnce =
      mp.tierShownOnce && typeof mp.tierShownOnce === 'object'
        ? mp.tierShownOnce
        : null;

    const againTpl = String(phaseMpc.streakAgainTemplate || '').trim();
    function againMsgFor(threshold) {
      if (!againTpl) return '';
      return String(
        fillTemplate(againTpl, {
          n: Math.floor(Number(threshold)),
          streak: s
        }) || ''
      ).trim();
    }

    // #3 Recovery non-chiffré (one-shot), même sans record
    if (
      mp.justRecoveredFromMistake === true &&
      s >= tBuilding &&
      mp.flowTierShown < tBuilding
    ) {
      const msg = String(phaseMpc.recovery || '').trim();
      if (tryShowRunOverlay(msg, 'info')) {
        mp.flowTierShown = tBuilding;
        mp.justRecoveredFromMistake = false;
        mp.maxCorrectStreakDisplayed = Math.max(
          clampInt(mp.maxCorrectStreakDisplayed, 0, 9999),
          s
        );
        if (tierOnce) tierOnce.building = true;
        setEndHighlight(
          msg,
          'success',
          getEndHighlightPriority(cfg, 'recovery')
        );
      }
      return;
    }

    if (s >= tLegendary && mp.flowTierShown < tLegendary) {
      const already = !!(tierOnce && tierOnce.legendary === true);
      const baseMsg = String(phaseMpc.streakLegendary || '').trim();
      const msg = (already ? againMsgFor(tLegendary) : '') || baseMsg;

      if (tryShowRunOverlay(msg, 'info')) {
        mp.flowTierShown = tLegendary;
        mp.maxCorrectStreakDisplayed = Math.max(
          clampInt(mp.maxCorrectStreakDisplayed, 0, 9999),
          s
        );
      }
      if (tierOnce) tierOnce.legendary = true;
      setEndHighlight(
        msg,
        'success',
        getEndHighlightPriority(cfg, 'streakLegendary')
      );
      mp.justRecoveredFromMistake = false;
      return;
    }
    if (s >= tElite && mp.flowTierShown < tElite) {
      const already = !!(tierOnce && tierOnce.elite === true);
      const baseMsg = String(phaseMpc.streakElite || '').trim();
      const msg = (already ? againMsgFor(tElite) : '') || baseMsg;

      if (tryShowRunOverlay(msg, 'info')) {
        mp.flowTierShown = tElite;
        mp.maxCorrectStreakDisplayed = Math.max(
          clampInt(mp.maxCorrectStreakDisplayed, 0, 9999),
          s
        );
      }
      if (tierOnce) tierOnce.elite = true;
      setEndHighlight(
        msg,
        'success',
        getEndHighlightPriority(cfg, 'streakElite')
      );
      mp.justRecoveredFromMistake = false;
      return;
    }
    if (s >= tStrong && mp.flowTierShown < tStrong) {
      const already = !!(tierOnce && tierOnce.strong === true);
      const baseMsg = String(phaseMpc.streakStrong || '').trim();
      const msg = (already ? againMsgFor(tStrong) : '') || baseMsg;

      if (tryShowRunOverlay(msg, 'success')) {
        mp.flowTierShown = tStrong;
        mp.maxCorrectStreakDisplayed = Math.max(
          clampInt(mp.maxCorrectStreakDisplayed, 0, 9999),
          s
        );
      }
      if (tierOnce) tierOnce.strong = true;
      setEndHighlight(
        msg,
        'success',
        getEndHighlightPriority(cfg, 'streakStrong')
      );
      mp.justRecoveredFromMistake = false;
      return;
    }
    if (s >= tBuilding && mp.flowTierShown < tBuilding) {
      const already = !!(tierOnce && tierOnce.building === true);
      const baseMsg = String(phaseMpc.streakBuilding || '').trim();
      const msg = (already ? againMsgFor(tBuilding) : '') || baseMsg;

      if (tryShowRunOverlay(msg, 'info')) {
        mp.flowTierShown = tBuilding;
        mp.maxCorrectStreakDisplayed = Math.max(
          clampInt(mp.maxCorrectStreakDisplayed, 0, 9999),
          s
        );
      }
      if (tierOnce) tierOnce.building = true;
      setEndHighlight(
        msg,
        'success',
        getEndHighlightPriority(cfg, 'streakBuilding')
      );
      mp.justRecoveredFromMistake = false;
      return;
    }

    if (s >= tStart && mp.flowTierShown < tStart) {
      const already = !!(tierOnce && tierOnce.start === true);
      const baseMsg = String(phaseMpc.streakStart || '').trim();
      const msg = (already ? againMsgFor(tStart) : '') || baseMsg;

      if (tryShowRunOverlay(msg, 'info')) {
        mp.flowTierShown = tStart;
        mp.maxCorrectStreakDisplayed = Math.max(
          clampInt(mp.maxCorrectStreakDisplayed, 0, 9999),
          s
        );
      }
      if (tierOnce) tierOnce.start = true;
      setEndHighlight(
        msg,
        'success',
        getEndHighlightPriority(cfg, 'streakStart')
      );
      mp.justRecoveredFromMistake = false;
      return;
    }

    // End-of-run highlight (only meaningful if the run ended)
    const done = res && res.done === true;
    if (done === true) {
      if (chancesLeft === 0 && answeredCount >= 6) {
        setEndHighlight(
          String(mpc.runEndedAllChancesUsed || '').trim(),
          'success',
          getEndHighlightPriority(cfg, 'runEndedAllChancesUsed')
        );
        return;
      }
    }

    return;
  };

  UI.prototype.startRun = function (mistakesOnly) {
    const cfg = this.config || {};
    const moCfg = cfg.mistakesOnly || {};
    const premium = isPremiumNow(this.storage);
    const startedFromLanding = this.state === STATES.LANDING;

    // Hook for live stats refresh during run (deck rebuild)
    // Exposed on the UI instance to avoid scope-related ReferenceError.
    this.getStatsByItem = () => {
      return this.storage && typeof this.storage.getStatsByItem === 'function'
        ? this.storage.getStatsByItem()
        : {};
    };

    // Snapshot at run start (anti-repetition seed)
    const statsByItem = this.getStatsByItem();

    // Snapshot PRACTICE backlog at run start (for END stats)
    let practiceBacklogAtStart = null;
    try {
      if (
        mistakesOnly === true &&
        this.storage &&
        typeof this.storage.getActiveMistakesCount === 'function'
      ) {
        practiceBacklogAtStart = clampInt(
          this.storage.getActiveMistakesCount(),
          0,
          99999
        );
      }
    } catch (_) {
      practiceBacklogAtStart = null;
    }

    if (mistakesOnly === true && practiceBacklogAtStart === 0) {
      return;
    }

    if (mistakesOnly === true && moCfg.premiumOnly === true && !premium) {
      this.setState(STATES.PAYWALL);
      return;
    }

    // PRACTICE gate (free users can start a limited number of practice runs)
    if (mistakesOnly === true && !premium) {
      if (
        !this.storage ||
        typeof this.storage.consumePracticeOrBlock !== 'function'
      ) {
        this.setState(STATES.PAYWALL);
        return;
      }

      const gate = this.storage.consumePracticeOrBlock();
      if (!gate || gate.ok !== true) {
        const limit = clampInt(this.config?.mistakesOnly?.freeRunsLimit, 0, 99);
        if (this.openFreeLimitReachedModal(this.wording?.practice, { limit }))
          return;
        this.setState(STATES.PAYWALL);
        return;
      }
    }

    let runStartNumber = null;
    let currentRunNumber = 0;

    // RUN economy gate (free runs) is enforced at run start.
    if (mistakesOnly !== true && !premium) {
      if (
        !this.storage ||
        typeof this.storage.consumeRunOrBlock !== 'function'
      ) {
        this.setState(STATES.PAYWALL);
        return;
      }

      const gate = this.storage.consumeRunOrBlock();
      if (!gate || gate.ok !== true) {
        const limit = clampInt(this.config?.limits?.freeRuns, 0, 99);
        if (this.openFreeLimitReachedModal(this.wording?.end, { limit }))
          return;
        this.setState(STATES.PAYWALL);
        return;
      }

      if (this.storage && typeof this.storage.getRunsUsed === 'function') {
        const used = Number(this.storage.getRunsUsed());
        runStartNumber =
          Number.isFinite(used) && Math.floor(used) === used && used >= 1
            ? used
            : null;
      }
    }

    if (mistakesOnly !== true && this.storage) {
      try {
        if (typeof this.storage.reserveRunNumber === 'function') {
          currentRunNumber = clampInt(
            this.storage.reserveRunNumber(),
            0,
            999999999
          );
        } else if (typeof this.storage.getRunNumber === 'function') {
          const prevRunNumber = Number(this.storage.getRunNumber() || 0);
          currentRunNumber = Math.max(0, Math.floor(prevRunNumber)) + 1;
        }
      } catch (_) {
        currentRunNumber = 0;
      }
    }

    this._runtime.practiceBacklogAtStart = practiceBacklogAtStart;
    this._runtime.currentRunNumber = currentRunNumber;
    this._runtime.currentRunId = generateRunUuid();
    this._runtime.runStartedAt = Date.now();
    this._runtime.currentQuestionShownAt = this._runtime.runStartedAt;
    this._runtime.runAnswerLog = [];
    if (startedFromLanding) {
      if (
        this.storage &&
        typeof this.storage.markLandingNextRunStarted === 'function'
      ) {
        this.storage.markLandingNextRunStarted();
      }
      this._runtime.landingRunCompletionPending = true;
    } else {
      this._runtime.landingRunCompletionPending = false;
    }

    // Provide a stable function reference to the engine (no free variable)
    const getStatsByItem = this.getStatsByItem;

    // Start engine after gate succeeded
    // Eligible pool for normal RUN / PRACTICE = full content set.
    const srcItems = Array.isArray(this._runtime?.contentItems)
      ? this._runtime.contentItems
      : [];
    const eligible = srcItems.slice();

    const state = this.game.start({
      items: eligible,
      statsByItem,
      getStatsByItem,
      config: cfg,

      // game.js contract: "RUN" | "PRACTICE" | "BONUS"
      mode: mistakesOnly === true ? MODES.PRACTICE : MODES.RUN,

      // Free RUN only: lets game.js prepend curated opening cards for the first free runs.
      // Null for premium and PRACTICE, so the engine keeps the normal deck.
      runStartNumber
    });

    this._runtime.runItemIds = [];
    this._runtime.runMistakeIds = [];
    this._runtime.currentRunNumber = currentRunNumber;
    this._runtime.runMode = mistakesOnly === true ? MODES.PRACTICE : MODES.RUN;
    this._runtime.lastAnswer = null;
    this._runtime.feedbackPending = false;
    this._runtime.feedbackReveal = true;
    this._runtime.gameOverPending = false;
    this._runtime.autoGameOverAfterFeedback = false;
    this._runtime.secretBonusPending = false;
    this._runtime.poolCompleteCelebrationPending = false;

    if (this._runtime.feedbackRevealTimerId) {
      clearRuntimeTimer(this, 'feedbackRevealTimerId');
    }
    if (this._runtime.gameOverAfterFeedbackTimerId) {
      clearRuntimeTimer(this, 'gameOverAfterFeedbackTimerId');
    }

    if (this._runtime.bonusAnswerFeedbackTimerId) {
      clearRuntimeTimer(this, 'bonusAnswerFeedbackTimerId');
    }

    if (this._runtime.bonusEndTimerId) {
      clearRuntimeTimer(this, 'bonusEndTimerId');
    }
    this._runtime.questionAutoReadDoneKey = '';

    if (this._runtime.endRecordMomentTimer) {
      clearRuntimeTimer(this, 'endRecordMomentTimer');
    }
    this._runtime.endRecordMomentUntil = 0;

    this._runtime.frozenItem = null;
    this._runtime.shareAnchorId = null;

    // Pool reshuffle toast guard (once per RUN)
    this._runtime.poolReshuffleToastShown = false;

    // One-shot per run: "New best score" toast (PLAYING)
    this._runtime.newBestScoreToastShown = false;

    // micro-pics reset (run-only)
    let startChances = clampInt(cfg?.game?.maxChances, 1, 99);
    try {
      const gs =
        this.game && typeof this.game.getState === 'function'
          ? this.game.getState() || {}
          : {};
      if (gs.chancesLeft != null)
        startChances = clampInt(gs.chancesLeft, 0, 99);
    } catch (_) {
      /* keep cfg */
    }
    this._runtime.microPics = createMicroPicsState(startChances);

    // input safety
    this._runtime.answerLocked = false;

    // Option A: finish only after Continue
    this._runtime.finishAfterFeedback = false;

    const first = this.game.getCurrent();
    const firstId = Number(first?.id);
    this._runtime.shareAnchorId = Number.isFinite(firstId) ? firstId : null;

    if (state && state.done) {
      this._finishRun();
      return;
    }

    // Determine overlay run type (no fallback):
    // - Premium RUN => UNLIMITED
    // - PRACTICE => PRACTICE
    // - Free users => FREE or LAST_FREE based on runs balance after consuming
    let runType = '';
    try {
      const isPrem = isPremiumNow(this.storage);

      if (mistakesOnly === true) {
        runType = 'PRACTICE';
      } else if (isPrem) {
        runType = 'UNLIMITED';
      } else if (
        this.storage &&
        typeof this.storage.getRunsBalance === 'function'
      ) {
        const after = Number(this.storage.getRunsBalance());
        if (Number.isFinite(after)) {
          runType = after === 0 ? 'LAST_FREE' : 'FREE';
        }
      }
    } catch (_) {
      runType = '';
    }

    // Persist runType for PAYWALL rendering (e.g., headlineLastFree).
    this._runtime.runType = runType;

    // PRACTICE: setState(PLAYING) first so the game screen renders underneath,
    // then overlay appears on top of it (not on top of END/LANDING).
    if (mistakesOnly === true) {
      if (!this._beforeUnloadHandler) {
        this._beforeUnloadHandler = (e) => {
          if (this.state !== STATES.PLAYING) return;
          e.preventDefault();
        };
        window.addEventListener('beforeunload', this._beforeUnloadHandler);
      }

      showRunStartOverlay(
        cfg,
        this.wording,
        this.game,
        'PRACTICE',
        null,
        () => {
          // overlay dismissed — game already visible, nothing else needed
        }
      );

      this.setState(STATES.PLAYING);
      return;
    }
    // Freeze the Daily target before the run starts so the challenge stays stable for the whole day.
    let runDailyModel = null;
    try {
      if (!mistakesOnly) {
        const currentBest =
          this.storage && typeof this.storage.getPersonalBest === 'function'
            ? clampInt(this.storage.getPersonalBest()?.bestScoreFP, 0, 99999)
            : 0;
        runDailyModel = getDailyChallengeModel(
          cfg,
          this.wording,
          currentBest,
          this.storage
        );
      }
    } catch (_) {
      runDailyModel = null;
    }

    // RUN normal: overlay only for LAST_FREE.
    if (!this._beforeUnloadHandler) {
      this._beforeUnloadHandler = (e) => {
        if (this.state !== STATES.PLAYING) return;
        e.preventDefault();
      };
      window.addEventListener('beforeunload', this._beforeUnloadHandler);
    }

    this.setState(STATES.PLAYING);

    if (runType === 'LAST_FREE') {
      let dailyExtra = null;
      try {
        const canEarnDailyTicket = !!(
          runDailyModel &&
          runDailyModel.completedToday !== true &&
          runDailyModel.rewardAvailableToday === true &&
          runDailyModel.ticketAtCap !== true
        );
        if (canEarnDailyTicket) {
          const label = String(
            this.wording?.ui?.dailyChallengeStartOverlayLabel || ''
          ).trim();
          const lineTpl = String(
            this.wording?.ui?.dailyChallengeStartOverlayLineTemplate || ''
          ).trim();
          dailyExtra = {
            goalLine1: label,
            goalLine2: lineTpl
              ? fillTemplate(lineTpl, {
                  targetScore: String(runDailyModel.targetScore)
                })
              : ''
          };
        }
      } catch (_) {
        dailyExtra = null;
      }

      showRunStartOverlay(
        cfg,
        this.wording,
        this.game,
        'LAST_FREE',
        dailyExtra,
        () => {
          // overlay dismissed — game already visible, nothing else needed
        }
      );
    }
  };

  UI.prototype.openFreeLimitReachedModal = function (wordingBlock, vars) {
    const block = wordingBlock || {};
    const title = fillTemplate(
      String(block.freeLimitReachedTitle || '').trim(),
      vars || {}
    );
    const body = fillTemplate(
      String(block.freeLimitReachedBody || '').trim(),
      vars || {}
    );
    const cta = String(block.freeLimitReachedCta || '').trim();
    const close = String(block.freeLimitReachedClose || '').trim();

    if (!title || !body || typeof this.openModal !== 'function') return false;

    const html = `
      <p class="wt-text-preline">${escapeHtml(body)}</p>
      <div class="wt-actions">
        ${cta ? `<button class="wt-btn wt-btn--primary" data-action="open-paywall">${escapeHtml(cta)}</button>` : ``}
        ${close ? `<button class="wt-btn wt-btn--secondary" data-action="close-modal">${escapeHtml(close)}</button>` : ``}
      </div>
    `;

    this.openModal(html, title, { hideCloseButton: true });
    return true;
  };

  UI.prototype.openRapidFireTicketRequiredModal = function () {
    const w = this.wording || {};
    const sb = w.secretBonus || {};
    const premium = isPremiumNow(this.storage);
    const tickets = getRapidFireTicketBalance(this.storage);
    const cost = getRapidFireTicketCost(this.storage);
    const runsBalance =
      this.storage && typeof this.storage.getRunsBalance === 'function'
        ? clampInt(this.storage.getRunsBalance(), 0, 999)
        : 0;
    const nowDate = new Date();
    const localDayKey = [
      nowDate.getFullYear(),
      String(nowDate.getMonth() + 1).padStart(2, '0'),
      String(nowDate.getDate()).padStart(2, '0')
    ].join('-');
    const earnedToday =
      getDailyTicketEarnedDayKey(this.storage) === localDayKey;

    const title = String(sb.ticketRequiredTitle || '').trim();
    const close = String(
      sb.ticketRequiredClose || w.system?.notNow || w.system?.close || ''
    ).trim();
    const ctaDaily = String(sb.ticketRequiredCtaDaily || '').trim();
    const ctaRun = String(sb.ticketRequiredCtaRun || '').trim();
    const ctaPaywall = String(sb.ticketRequiredCtaPaywall || '').trim();

    let bodyTpl = '';
    let primaryAction = '';
    let primaryLabel = '';

    if (premium && earnedToday) {
      bodyTpl = String(sb.ticketRequiredBodySpentToday || '').trim();
      primaryAction = 'start-run';
      primaryLabel = ctaRun;
    } else if (!premium && runsBalance > 0) {
      bodyTpl = String(sb.ticketRequiredBodyDaily || '').trim();
      primaryAction = 'start-daily-challenge';
      primaryLabel = ctaDaily;
    } else if (premium) {
      bodyTpl = String(sb.ticketRequiredBodyPremium || '').trim();
      primaryAction = 'start-run';
      primaryLabel = ctaRun;
    } else {
      bodyTpl = String(sb.ticketRequiredBodyLocked || '').trim();
      primaryAction = 'open-paywall';
      primaryLabel = ctaPaywall;
    }

    if (!title || !bodyTpl || typeof this.openModal !== 'function')
      return false;

    const body = fillTemplate(bodyTpl, {
      tickets: String(tickets),
      cost: String(cost),
      remaining: String(runsBalance),
      pluralS: tickets > 1 ? 's' : '',
      costPluralS: cost > 1 ? 's' : ''
    });

    const html = `
      <p class="wt-text-preline">${escapeHtml(body)}</p>
      <div class="wt-actions">
        ${primaryAction && primaryLabel ? `<button class="wt-btn wt-btn--primary" data-action="${escapeHtml(primaryAction)}">${escapeHtml(primaryLabel)}</button>` : ``}
        ${close ? `<button class="wt-btn wt-btn--secondary" data-action="close-modal">${escapeHtml(close)}</button>` : ``}
      </div>
    `;

    this.openModal(html, title, { hideCloseButton: true });
    return true;
  };

  // Secret bonus: seen-only bonus run (seenCount > 0).
  // Does NOT consume run economy.
  // IMPORTANT: deck is consumed once (no reshuffle, no loop). BONUS ends when the deck is exhausted.

  UI.prototype.startSecretBonusRun = function () {
    const cfg = this.config || {};
    const premium = isPremiumNow(this.storage);
    const ticketGate = consumeRapidFireTicketOrBlock(this.storage);
    if (!ticketGate.ok) {
      this.openRapidFireTicketRequiredModal();
      return;
    }

    // Stats snapshot (source of truth for "seen")
    const statsByItem =
      this.storage && typeof this.storage.getStatsByItem === 'function'
        ? this.storage.getStatsByItem()
        : {};

    const srcItems = Array.isArray(this._runtime?.contentItems)
      ? this._runtime.contentItems
      : [];

    // Hook for live stats refresh during run (deck rebuild)
    const getStatsByItem = () => {
      return this.storage && typeof this.storage.getStatsByItem === 'function'
        ? this.storage.getStatsByItem()
        : {};
    };

    const state = this.game.start({
      items: srcItems,
      statsByItem,
      getStatsByItem,
      config: cfg,

      // MUST match game.js contract
      mode: MODES.BONUS
    });

    // No eligible seen-only deck: do nothing unless copy exists (no hardcoded fallback).
    if (state && state.done) {
      const msg = String(
        this.wording?.secretBonus?.noSeenWordsToast || ''
      ).trim();
      if (msg) toastNow(this.config, msg);
      refundRapidFireTicket(this.storage, clampInt(ticketGate.cost, 0, 99));
      return;
    }
    this._runtime.runItemIds = [];
    this._runtime.runMistakeIds = [];
    this._runtime.currentRunNumber = 0;
    this._runtime.currentRunId = generateRunUuid();
    this._runtime.runStartedAt = Date.now();
    this._runtime.currentQuestionShownAt = this._runtime.runStartedAt;
    this._runtime.runAnswerLog = [];
    this._runtime.runMode = MODES.BONUS;
    this._runtime.lastAnswer = null;
    this._runtime.feedbackPending = false;
    this._runtime.feedbackReveal = true;
    this._runtime.gameOverPending = false;
    this._runtime.secretBonusPending = false;
    this._runtime.poolCompleteCelebrationPending = false;

    if (this._runtime.feedbackRevealTimerId) {
      clearRuntimeTimer(this, 'feedbackRevealTimerId');
    }
    if (this._runtime.bonusAnswerFeedbackTimerId) {
      clearRuntimeTimer(this, 'bonusAnswerFeedbackTimerId');
    }
    if (this._runtime.bonusEndTimerId) {
      clearRuntimeTimer(this, 'bonusEndTimerId');
    }
    if (this._runtime.endRecordMomentTimer) {
      clearRuntimeTimer(this, 'endRecordMomentTimer');
    }
    this._runtime.endRecordMomentUntil = 0;

    this._runtime.frozenItem = null;
    this._runtime.shareAnchorId = null;

    // One-shot per run: "New best score" toast (PLAYING)
    this._runtime.newBestScoreToastShown = false;
    // micro-pics reset (run-only)
    let startChances = clampInt(cfg?.game?.maxChances, 1, 99);
    try {
      const gs =
        this.game && typeof this.game.getState === 'function'
          ? this.game.getState() || {}
          : {};
      if (gs.chancesLeft != null)
        startChances = clampInt(gs.chancesLeft, 0, 99);
    } catch (_) {
      /* keep cfg */
    }
    this._runtime.microPics = createMicroPicsState(startChances);

    // input safety
    this._runtime.answerLocked = false;

    // Option A: finish only after Continue
    this._runtime.finishAfterFeedback = false;

    const first = this.game.getCurrent();
    const firstId = Number(first?.id);
    this._runtime.shareAnchorId = Number.isFinite(firstId) ? firstId : null;

    if (state && state.done) {
      this._finishRun();
      return;
    }

    // BONUS: setState first so the game screen renders underneath the overlay.
    // The fall animation is guarded by isOverlayVisible in _secretBonusFallStartOrSync.
    // BONUS: overlay FIRST, then setState. Order matters:
    // render() → _secretBonusFallStartOrSync() checks isOverlayVisible("wt-run-start-overlay").
    // If setState came first, the overlay wouldn't exist yet and the fall would start immediately.
    const bonusExtra = {};
    const tpl = String(
      this.wording?.secretBonus?.startOverlayFreeRunsLimitLine || ''
    ).trim();
    if (tpl) {
      const tickets = getRapidFireTicketBalance(this.storage);
      const cost = getRapidFireTicketCost(this.storage);
      bonusExtra.bonusLimitLine = fillTemplate(tpl, {
        tickets: String(tickets),
        cost: String(cost),
        pluralS: tickets > 1 ? 's' : '',
        costPluralS: cost > 1 ? 's' : ''
      });
    }

    showRunStartOverlay(
      cfg,
      this.wording,
      this.game,
      'BONUS',
      bonusExtra,
      () => {
        // no-op: setState already called below
      }
    );

    this.setState(STATES.PLAYING);
  };

  UI.prototype._scheduleHudPulseCleanup = function () {
    if (!this._runtime) return;

    const ms = Number(this.config?.ui?.gameplayPulseMs);
    if (!Number.isFinite(ms) || ms <= 0) return;

    if (this._runtime.hudPulseCleanupTimerId) {
      clearRuntimeTimer(this, 'hudPulseCleanupTimerId');
    }

    // Clean up HUD pulse classes + deltas without full re-render (avoids layout shift).
    setRuntimeTimer(
      this,
      'hudPulseCleanupTimerId',
      () => {
        if (!this._runtime) return;
        this._runtime.hudPulseCleanupTimerId = null;
        if (this.state !== STATES.PLAYING) return;
        if (this._runtime.gameOverPending === true) return;

        const root = this.appEl || document.getElementById('app');
        if (!root) {
          this.render();
          return;
        }

        let cleaned = false;
        let scoreFlashCleaned = false;

        const chancePill = root.querySelector('.wt-pill--danger-pulse');
        if (chancePill) {
          chancePill.classList.remove('wt-pill--danger-pulse');
          const delta = chancePill.querySelector('.wt-pill__delta');
          if (delta) delta.remove();
          cleaned = true;
        }

        const scorePill = root.querySelector('.wt-pill--score-flash');
        if (scorePill) {
          scorePill.classList.remove('wt-pill--score-flash');
          const delta = scorePill.querySelector('.wt-pill__delta');
          if (delta) delta.remove();
          cleaned = true;
          scoreFlashCleaned = true;
        }

        // Reset timestamps so next render() won't re-add them
        if (this._runtime.chanceLostPulseAt)
          this._runtime.chanceLostPulseAt = 0;
        if (this._runtime.scoreFlashAt) this._runtime.scoreFlashAt = 0;

        // Important: near-best is suppressed while scoreFlashOn is true.
        // When score flash ends, force a render so near-best can appear immediately.
        if (scoreFlashCleaned) {
          this.render();
          return;
        }

        if (!cleaned) this.render();
      },
      Math.floor(ms) + 30
    );
  };

  UI.prototype.answer = function (choiceBool) {
    if (this.state !== STATES.PLAYING) return;
    if (!this._runtime) return;

    // If feedback is already pending, ignore (do NOT lock)
    if (this._runtime.feedbackPending === true) return;

    // HARD LOCK (mobile double tap / double click)
    if (this._runtime.answerLocked === true) return;
    this._runtime.answerLocked = true;

    // Snapshot chances BEFORE answering (for UI animation when a chance disappears)
    let prevChancesLeft = null;
    let prevScoreFP = null;

    try {
      const gsPrev =
        this.game && typeof this.game.getState === 'function'
          ? this.game.getState() || {}
          : {};

      if (gsPrev.chancesLeft != null)
        prevChancesLeft = Number(gsPrev.chancesLeft);

      // Snapshot score BEFORE answering (needed for "new best" crossing detection)
      if (gsPrev.scoreFP != null) prevScoreFP = Number(gsPrev.scoreFP);
    } catch (_) {
      /* silent */
    }

    const frozen =
      this.game && typeof this.game.getCurrent === 'function'
        ? this.game.getCurrent()
        : null;
    this._runtime.frozenItem = frozen;

    const picked = choiceBool === true;
    const res =
      this.game && typeof this.game.answer === 'function'
        ? this.game.answer(picked)
        : null;
    // Flag a short-lived pulse when a chance is lost (CSS owns the actual animation)
    let chanceLost = false;
    let nowChancesLeft = null;

    try {
      const gsNow =
        this.game && typeof this.game.getState === 'function'
          ? this.game.getState() || {}
          : {};
      nowChancesLeft =
        gsNow.chancesLeft != null ? Number(gsNow.chancesLeft) : null;

      chanceLost =
        prevChancesLeft != null &&
        nowChancesLeft != null &&
        Number.isFinite(prevChancesLeft) &&
        Number.isFinite(nowChancesLeft) &&
        nowChancesLeft < prevChancesLeft;

      this._runtime.chanceLostPulseAt = chanceLost ? Date.now() : 0;

      const lastChanceEntered =
        prevChancesLeft != null &&
        nowChancesLeft != null &&
        Number.isFinite(prevChancesLeft) &&
        Number.isFinite(nowChancesLeft) &&
        prevChancesLeft > 1 &&
        nowChancesLeft === 1;
      this._runtime.lastChancePulseAt = lastChanceEntered ? Date.now() : 0;
      // PRACTICE: no score flash (consolidation mode, no performance feedback)
      const isPracticeMode =
        String(this._runtime?.runMode || '').trim() === 'PRACTICE';
      this._runtime.scoreFlashAt =
        !isPracticeMode && res && res.isCorrect === true ? Date.now() : 0;

      // New best (RUN/BONUS + premium): one-shot pulse + toast when you EXCEED the best during PLAYING.
      // Fail-closed: missing config/storage/wording => no celebration.
      try {
        const modeNow = String(this._runtime?.runMode || 'RUN').trim();
        const isRun = modeNow === 'RUN';
        const isBonus = modeNow === 'BONUS';

        const cfg = this.config || {};
        const premium = isPremiumNow(this.storage);
        const pbCfg =
          cfg?.personalBest && typeof cfg.personalBest === 'object'
            ? cfg.personalBest
            : null;
        const pbEnabled = !!(pbCfg && pbCfg.enabled === true);

        const toastMs = Number(cfg?.ui?.newBestScoreToastMs);
        const toastLine = String(
          this.wording?.playing?.newBestScore || ''
        ).trim();

        let bestScoreFP = null;

        if (premium === true && pbEnabled === true && this.storage) {
          if (isRun && typeof this.storage.getPersonalBest === 'function') {
            const pb = this.storage.getPersonalBest() || null;
            const b = Number(pb?.bestScoreFP);
            if (Number.isFinite(b) && b > 0) bestScoreFP = Math.floor(b);
          } else if (
            isBonus &&
            typeof this.storage.getBonusBest === 'function'
          ) {
            const bb = this.storage.getBonusBest() || null;
            const b = Number(bb?.bestScoreFP);
            if (Number.isFinite(b) && b > 0) bestScoreFP = Math.floor(b);
          }
        }

        const gsNow2 =
          this.game && typeof this.game.getState === 'function'
            ? this.game.getState() || {}
            : {};
        const nowScoreFP =
          gsNow2.scoreFP != null ? Number(gsNow2.scoreFP) : NaN;

        const exceeded =
          premium === true &&
          pbEnabled === true &&
          bestScoreFP != null &&
          Number.isFinite(prevScoreFP) &&
          Number.isFinite(nowScoreFP) &&
          prevScoreFP <= bestScoreFP &&
          nowScoreFP > bestScoreFP;

        if (exceeded) {
          // Pulse (already styled via .wt-pill--new-best)
          this._runtime.newBestPulseAt = Date.now();

          // Toast one-shot per run
          const canToast =
            this._runtime.newBestScoreToastShown !== true &&
            toastLine &&
            Number.isFinite(toastMs) &&
            toastMs > 0;

          if (canToast) {
            this._runtime.newBestScoreToastShown = true;

            // New best score: centered gameplay overlay (stronger than toast)
            scheduleGameplayOverlay(toastLine, {
              delayMs: 0,
              durationMs: Math.floor(toastMs),
              variant: 'success',
              mode: modeNow
            });
          }
        }
      } catch (_) {
        /* fail closed */
      }
    } catch (_) {
      chanceLost = false;
      nowChancesLeft = null;
      this._runtime.chanceLostPulseAt = 0;
      this._runtime.lastChancePulseAt = 0;
      this._runtime.scoreFlashAt = 0;
    }

    // Ensure the time-based HUD deltas clear even if nothing else re-renders.
    this._scheduleHudPulseCleanup();

    // If engine didn't answer, unlock (fail-safe)
    if (!res) {
      this._runtime.answerLocked = false;
      return;
    }

    /// One-shot: first-time pool completion (200/200) celebration.
    // Source of truth: storage coverage + persisted "celebrated" flag (not transient engine signal).
    try {
      const runModeNow = String(this._runtime?.runMode || '').trim();
      if (!runModeNow) return;
      const isRunNow = runModeNow === MODES.RUN;
      if (isRunNow) {
        const exhausted = !!(
          this.storage &&
          typeof this.storage.hasSeenAllWordTraps === 'function' &&
          this.storage.hasSeenAllWordTraps() === true
        );

        const alreadyCelebrated = !!(
          this.storage &&
          typeof this.storage.hasPoolCompleteCelebrated === 'function' &&
          this.storage.hasPoolCompleteCelebrated() === true
        );

        if (exhausted && !alreadyCelebrated) {
          if (
            this.storage &&
            typeof this.storage.markPoolCompleteCelebrated === 'function'
          ) {
            this.storage.markPoolCompleteCelebrated();
          }

          if (this._runtime)
            this._runtime.poolCompleteCelebrationPending = true;
          this._finishRun();
          return;
        }
      }
    } catch (_) {}

    // Game over rule (RUN / PRACTICE only):
    // - Freeze immediately
    // - Transition to END is deferred for the *effective* chance-loss overlay duration
    const runModeNow = String(this._runtime?.runMode || '').trim();
    if (!runModeNow) return;
    const isGameOverNow =
      runModeNow !== MODES.BONUS &&
      chanceLost &&
      Number.isFinite(nowChancesLeft) &&
      Number(nowChancesLeft) === 0;

    // Chance state overlays only (Last chance / Game over). No "-1 chance" overlay.
    // RUN/PRACTICE game-over overlays are intentionally deferred until after the fatal feedback is shown.
    if (
      chanceLost &&
      Number.isFinite(nowChancesLeft) &&
      Number(nowChancesLeft) <= 1 &&
      (runModeNow === MODES.BONUS || !isGameOverNow)
    ) {
      showChanceLostOverlay(
        this.config,
        this.wording,
        nowChancesLeft,
        runModeNow
      );
    }

    // Bonus: still sync the HUD on the final mistake (avoid stale "2/3" display on the last error).
    const shouldSyncFinalMistakeHud =
      isGameOverNow ||
      (runModeNow === 'BONUS' &&
        chanceLost &&
        Number.isFinite(nowChancesLeft) &&
        Number(nowChancesLeft) === 0);

    if (shouldSyncFinalMistakeHud) {
      // Sync HUD lives immediately (avoid stale display on the final mistake)
      try {
        const root = this.appEl || document.getElementById('app');
        const pill = root ? root.querySelector('.wt-pill--chances') : null;

        if (pill && Number.isFinite(nowChancesLeft)) {
          const uiW = this.wording && this.wording.ui ? this.wording.ui : {};
          const label = String(uiW.mistakesLabel || '').trim();

          const gs =
            this.game && typeof this.game.getState === 'function'
              ? this.game.getState() || {}
              : {};
          const mcRaw = Number(gs.maxChances || this.config?.game?.maxChances);
          const mc =
            Number.isFinite(mcRaw) && mcRaw > 0 ? Math.floor(mcRaw) : 0;

          const left = Math.max(0, Math.floor(Number(nowChancesLeft)));
          const mistakes = mc > 0 ? Math.max(0, Math.min(mc, mc - left)) : 0;

          const visual =
            mc > 0
              ? Array(mc)
                  .fill(null)
                  .map((_, i) => {
                    const isOn = i < mistakes;
                    const isLast = isOn && mistakes > 0 && i === mistakes - 1;
                    return `<span class="wt-hud-lives__dot${isOn ? '' : ' wt-hud-lives__dot--off'}${isLast ? ' wt-hud-lives__dot--last' : ''}" aria-hidden="true"></span>`;
                  })
                  .join('')
              : '';

          pill.classList.remove('wt-pill--danger-pulse');
          pill.setAttribute(
            'aria-label',
            label ? `${label}: ${mistakes}/${mc}` : `${mistakes}/${mc}`
          );
          pill.innerHTML = `
            ${label ? `<small>${escapeHtml(label)}</small>` : ``}
            ${mistakes}/${mc}
            ${visual}
          `;
        }
      } catch (_) {
        /* silent */
      }
    }

    if (isGameOverNow) {
      // Block renders BEFORE recordAnswer: _save() → _emit() → onStorageUpdated is synchronous.
      // Without this, the dispatched event triggers render() while engine is done → blank screen.
      this._runtime.gameOverPending = true;
    }

    // BONUS game-over guard: block renders BEFORE recordAnswer.
    if (
      res.done === true &&
      String(this._runtime?.runMode || '').trim() === 'BONUS' &&
      Number.isFinite(nowChancesLeft) &&
      Number(nowChancesLeft) === 0
    ) {
      this._runtime.gameOverPending = true;
    }

    // Normal path: record answer immediately
    if (this.storage && typeof this.storage.recordAnswer === 'function') {
      this.storage.recordAnswer(res.itemId, res.isCorrect);
    }
    if (Number.isFinite(Number(res.itemId))) {
      const id = Number(res.itemId);
      const shownAt = Number(
        this._runtime?.currentQuestionShownAt ||
          this._runtime?.runStartedAt ||
          Date.now()
      );
      const answerMs = clampInt(Date.now() - shownAt, 0, 10 * 60 * 1000);
      this._runtime.runItemIds.push(id);
      if (Array.isArray(this._runtime.runAnswerLog)) {
        this._runtime.runAnswerLog.push({
          id,
          answer: picked === true,
          ms: answerMs
        });
      }

      // Track per-run mistakes for END recap (dedup)
      if (res.isCorrect !== true) {
        if (!Array.isArray(this._runtime.runMistakeIds))
          this._runtime.runMistakeIds = [];
        if (this._runtime.runMistakeIds.indexOf(id) === -1)
          this._runtime.runMistakeIds.push(id);
      }
    }

    // micro-pics evaluation happens AFTER the answer is validated (this function is the validation point)
    try {
      this._maybeTriggerMicroPic(res);
    } catch (_) {
      // silent: micro-pics must never break gameplay
    }

    this._runtime.lastAnswer = {
      isCorrect: res.isCorrect === true,
      pickedAnswer: picked,
      correctAnswer:
        res.correctAnswer === true || res.correctAnswer === false
          ? res.correctAnswer
          : null,
      feedbackLine: String(res.feedbackLine || '').trim()
    };

    // A11Y: announce answer feedback via dedicated live region (avoid full-screen aria-live churn)
    try {
      const liveEl = document.getElementById('answer-feedback');
      if (liveEl) {
        const pw =
          this.wording && this.wording.playing ? this.wording.playing : {};

        const verdictText =
          res.isCorrect === true
            ? String(pw.feedbackTitleOk || '').trim()
            : String(pw.feedbackTitleBad || '').trim();

        const questionText = String(frozen?.question || '').trim();
        const explanation = String(res.feedbackLine || '').trim();

        const parts = [verdictText, questionText, explanation].filter(Boolean);
        const msg = parts.join('. ').replace(/\s+/g, ' ').trim();

        if (msg) {
          liveEl.textContent = '';
          setUiTimer(
            'feedback.live.announce',
            () => {
              liveEl.textContent = msg;
            },
            0,
            'feedback'
          );
        }
      }
    } catch (_) {
      /* silent */
    }

    const runMode = String(this._runtime?.runMode || '').trim();
    if (!runMode) return;
    const sbFeedback = String(this.config?.secretBonus?.feedback || '').trim();

    if (runMode === MODES.BONUS) {
      // Terms-box visual feedback (BONUS): stash verdict, apply after render.
      const bonusFlashClass =
        res.isCorrect === true
          ? 'wt-terms-box--successflash'
          : 'wt-terms-box--mistakeflash';

      // BONUS: no pause between items — immediate fall restart after every answer.

      // End handling: game over or deck exhausted
      if (res.done === true) {
        const endedByGameOver =
          Number.isFinite(nowChancesLeft) && Number(nowChancesLeft) === 0;

        if (endedByGameOver) {
          // Show flash on the fatal answer before transitioning to game over
          const goFlashMsRaw = Number(
            this.config?.secretBonus?.feedbackFlashMs
          );
          const goFlashMs =
            Number.isFinite(goFlashMsRaw) &&
            goFlashMsRaw > 0 &&
            goFlashMsRaw <= 1000
              ? Math.floor(goFlashMsRaw)
              : 0;

          if (goFlashMs > 0) {
            try {
              const root = this.appEl || document.getElementById('app');
              const tb = root ? root.querySelector('.wt-terms-box') : null;
              if (tb) {
                tb.classList.remove(
                  'wt-terms-box--mistakeflash',
                  'wt-terms-box--successflash'
                );
                void tb.offsetWidth;
                tb.classList.add(bonusFlashClass);
              }
            } catch (_) {
              /* silent */
            }

            setRuntimeTimer(
              this,
              'bonusAnswerFeedbackTimerId',
              () => {
                if (!this._runtime) return;
                this._runtime.answerLocked = false;
                this._enterGameOverDelay();
              },
              goFlashMs,
              'feedback'
            );

            return;
          }

          this._runtime.answerLocked = false;
          this._enterGameOverDelay();
          return;
        }

        // Deck exhausted: flash on last answer, then show toast, then END
        const deFlashMsRaw = Number(this.config?.secretBonus?.feedbackFlashMs);
        const deFlashMs =
          Number.isFinite(deFlashMsRaw) &&
          deFlashMsRaw > 0 &&
          deFlashMsRaw <= 1000
            ? Math.floor(deFlashMsRaw)
            : 0;

        // Flash on last item
        if (deFlashMs > 0) {
          try {
            const root = this.appEl || document.getElementById('app');
            const tb = root ? root.querySelector('.wt-terms-box') : null;
            if (tb) {
              tb.classList.remove(
                'wt-terms-box--mistakeflash',
                'wt-terms-box--successflash'
              );
              void tb.offsetWidth;
              tb.classList.add(bonusFlashClass);
            }
          } catch (_) {
            /* silent */
          }
        }

        const bonusTiming = getToastTiming(this.config);
        const bonusDurationMs = bonusTiming ? bonusTiming.durationMs : null;
        const msg = String(
          this.wording?.secretBonus?.endDeckExhaustedToast || ''
        ).trim();

        const hasToast = !!(msg && bonusDurationMs != null);
        const toastMs = hasToast ? Math.max(0, Math.floor(bonusDurationMs)) : 0;

        // Total delay: flash + toast (sequential)
        const totalDelayMs = deFlashMs + toastMs;

        this._runtime.feedbackPending = false;
        this._runtime.lastAnswer = null;
        this._runtime.frozenItem = null;
        this._runtime.finishAfterFeedback = false;

        if (totalDelayMs > 0) {
          if (this._runtime.bonusEndTimerId) {
            clearRuntimeTimer(this, 'bonusEndTimerId');
            this._runtime.bonusEndTimerId = null;
          }

          // After flash delay, show toast then transition
          setRuntimeTimer(
            this,
            'bonusEndTimerId',
            () => {
              if (!this._runtime) return;
              this._runtime.bonusEndTimerId = null;

              if (hasToast) {
                cancelScheduledToast();
                if (this._beforeUnloadHandler) {
                  window.removeEventListener(
                    'beforeunload',
                    this._beforeUnloadHandler
                  );
                  this._beforeUnloadHandler = null;
                }
                showGameplayOverlay(msg, {
                  durationMs: Math.floor(toastMs),
                  variant: 'success',
                  cfg: this.config,
                  mode: MODES.BONUS
                });

                setRuntimeTimer(
                  this,
                  'bonusEndTimerId',
                  () => {
                    if (this._runtime) this._runtime.bonusEndTimerId = null;
                    this._runtime.answerLocked = false;
                    this._finishRun();
                  },
                  toastMs
                );

                return;
              }

              this._runtime.answerLocked = false;
              this._finishRun();
            },
            deFlashMs
          );

          return;
        }

        this._runtime.answerLocked = false;
        this._finishRun();
        return;
      }

      // Not done: flash on CURRENT terms-box, then swap words in place after delay.
      const feedbackFlashMsRaw = Number(
        this.config?.secretBonus?.feedbackFlashMs
      );
      const feedbackFlashMs =
        Number.isFinite(feedbackFlashMsRaw) &&
        feedbackFlashMsRaw > 0 &&
        feedbackFlashMsRaw <= 1000
          ? Math.floor(feedbackFlashMsRaw)
          : 0;

      // Apply flash on current item (DOM not yet rebuilt)
      try {
        const root = this.appEl || document.getElementById('app');
        const tb = root ? root.querySelector('.wt-terms-box') : null;
        if (tb) {
          tb.classList.remove(
            'wt-terms-box--mistakeflash',
            'wt-terms-box--successflash'
          );
          void tb.offsetWidth;
          tb.classList.add(bonusFlashClass);
        }
      } catch (_) {
        /* silent */
      }

      if (feedbackFlashMs > 0) {
        setRuntimeTimer(
          this,
          'bonusAnswerFeedbackTimerId',
          () => {
            if (!this._runtime) return;
            if (this.state !== STATES.PLAYING) return;
            if (String(this._runtime?.runMode || '').trim() !== 'BONUS') return;

            this._runtime.answerLocked = false;

            // Swap words in place (no full innerHTML rebuild)
            try {
              const nextItem =
                this.game && typeof this.game.getCurrent === 'function'
                  ? this.game.getCurrent()
                  : null;
              if (nextItem) {
                const root = this.appEl || document.getElementById('app');
                const words = root
                  ? root.querySelectorAll('.wt-term-word')
                  : [];
                if (words.length >= 1) {
                  words[0].textContent = String(nextItem.question || '').trim();
                }

                const sbf = this._runtime?.secretBonusFall;
                if (sbf) {
                  sbf.itemKey = '';
                  sbf.y01 = 0;
                  sbf.lastTs = 0;
                  sbf.wasInWarning = false;
                }

                // Remove flash class
                const tb = root ? root.querySelector('.wt-terms-box') : null;
                if (tb) {
                  tb.classList.remove(
                    'wt-terms-box--mistakeflash',
                    'wt-terms-box--successflash'
                  );
                  tb.style.transform = 'translate3d(0px, 0px, 0px)';
                }
                this._runtime.currentQuestionShownAt = Date.now();
              }
            } catch (_) {
              /* silent */
            }

            try {
              this._secretBonusFallStartOrSync();
            } catch (_) {
              /* silent */
            }

            try {
              this._secretBonusFallStartOrSync();
            } catch (_) {
              /* silent */
            }
          },
          feedbackFlashMs,
          'feedback'
        );

        return;
      }

      // Fallback: no flash configured, immediate render
      this._runtime.answerLocked = false;
      this._runtime.currentQuestionShownAt = Date.now();
      this.render();

      try {
        this._secretBonusFallStartOrSync();
      } catch (_) {
        /* silent */
      }

      return;
    }

    // Default flow (Option A): show feedback and wait for Continue.
    // UX: if a chance was lost, give Chances a short solo moment before showing the feedback block.
    if (this._runtime.feedbackRevealTimerId) {
      clearRuntimeTimer(this, 'feedbackRevealTimerId');
    }

    if (runMode === MODES.PRACTICE && res.done === true) {
      this._runtime.feedbackPending = true;
      this._runtime.finishAfterFeedback = true;
    }

    this._runtime.feedbackPending = true;
    // If last item, do NOT end immediately. End after Continue.
    this._runtime.finishAfterFeedback = res.done === true;
    this._runtime.autoGameOverAfterFeedback = isGameOverNow;

    // Single source of truth for timing: WT_CONFIG.ui.toast (schema plat)
    const timing = getToastTiming(this.config);
    const focusMs = timing ? Number(timing.delayMs) : NaN;
    const postFeedbackTiming = getToastTiming(this.config, 'scoreGained');
    const postFeedbackMsRaw = postFeedbackTiming
      ? Number(postFeedbackTiming.durationMs)
      : NaN;
    const postFeedbackMs =
      Number.isFinite(postFeedbackMsRaw) &&
      postFeedbackMsRaw >= 600 &&
      postFeedbackMsRaw <= 2000
        ? Math.floor(postFeedbackMsRaw)
        : 900;
    const allowManualFatalContinue = isGameOverNow && runMode === MODES.RUN;
    const fatalAutoDelayMs = allowManualFatalContinue
      ? Math.max(postFeedbackMs, 1600)
      : postFeedbackMs;

    const scheduleFatalGameOver = () => {
      if (!isGameOverNow) return;
      if (!this._runtime) return;

      if (this._runtime.gameOverAfterFeedbackTimerId) {
        clearRuntimeTimer(this, 'gameOverAfterFeedbackTimerId');
        this._runtime.gameOverAfterFeedbackTimerId = null;
      }

      setRuntimeTimer(
        this,
        'gameOverAfterFeedbackTimerId',
        () => {
          if (!this._runtime) return;
          this._runtime.gameOverAfterFeedbackTimerId = null;
          if (this.state !== STATES.PLAYING) return;
          if (this._runtime.feedbackPending !== true) return;

          showChanceLostOverlay(
            this.config,
            this.wording,
            nowChancesLeft,
            runModeNow
          );
          this._runtime.autoGameOverAfterFeedback = false;
          this._enterGameOverDelay();
        },
        fatalAutoDelayMs
      );
    };

    // UX: only apply the "solo moment" if timing is explicitly valid in WT_CONFIG.ui.toast
    if (chanceLost && Number.isFinite(focusMs) && focusMs > 0) {
      this._runtime.feedbackReveal = false;
      this.render();

      setRuntimeTimer(
        this,
        'feedbackRevealTimerId',
        () => {
          if (!this._runtime) return;
          if (this.state !== STATES.PLAYING) return;
          if (this._runtime.feedbackPending !== true) return;

          this._runtime.feedbackRevealTimerId = null;
          this._runtime.feedbackReveal = true;
          this.render();
          scheduleFatalGameOver();
        },
        Math.floor(focusMs)
      );

      return;
    }

    this._runtime.feedbackReveal = true;
    this.render();
    scheduleFatalGameOver();

    try {
      const normalFlashClass =
        res.isCorrect === true
          ? 'wt-terms-box--successflash'
          : 'wt-terms-box--mistakeflash';

      window.requestAnimationFrame(() => {
        const root = this.appEl || document.getElementById('app');
        const tb = root ? root.querySelector('.wt-terms-box') : null;
        if (!tb) return;

        tb.classList.remove(
          'wt-terms-box--mistakeflash',
          'wt-terms-box--successflash'
        );
        void tb.offsetWidth;
        tb.classList.add(normalFlashClass);
      });
    } catch (_) {
      /* silent */
    }
  };

  UI.prototype.continueAfterFeedback = function () {
    if (this.state !== STATES.PLAYING) return;
    if (!this._runtime || !this._runtime.feedbackPending) return;

    if (this._runtime.autoGameOverAfterFeedback === true) {
      if (this._runtime.gameOverAfterFeedbackTimerId) {
        clearRuntimeTimer(this, 'gameOverAfterFeedbackTimerId');
        this._runtime.gameOverAfterFeedbackTimerId = null;
      }

      showChanceLostOverlay(
        this.config,
        this.wording,
        0,
        String(this._runtime?.runMode || '').trim()
      );
      this._runtime.autoGameOverAfterFeedback = false;
      this._enterGameOverDelay();
      return;
    }

    const shouldFinish = this._runtime.finishAfterFeedback === true;

    // leaving feedback: cancel any pending (not-yet-shown) toast to avoid cross-state surprises
    cancelScheduledToast();

    if (this._runtime.feedbackRevealTimerId) {
      clearRuntimeTimer(this, 'feedbackRevealTimerId');
    }

    this._runtime.feedbackPending = false;
    this._runtime.feedbackReveal = true;
    this._runtime.lastAnswer = null;
    this._runtime.frozenItem = null;
    this._runtime.finishAfterFeedback = false;
    this._runtime.autoGameOverAfterFeedback = false;

    // unlock answers for next item
    this._runtime.answerLocked = false;

    // Clear stale pulse timestamps + cancel cleanup timer (prevents animation restart on next render)
    this._runtime.chanceLostPulseAt = 0;
    this._runtime.scoreFlashAt = 0;
    if (this._runtime.hudPulseCleanupTimerId) {
      clearRuntimeTimer(this, 'hudPulseCleanupTimerId');
    }

    if (shouldFinish) {
      this._finishRun();
      return;
    }

    this._runtime.currentQuestionShownAt = Date.now();
    this.render();
  };

  // ============================================
  // Game-over delay (factored — all modes)
  // ============================================
  // Single entry point for the "freeze PLAYING → wait for overlay → END" transition.
  // Contract:
  //   1. Block all renders (gameOverPending)
  //   2. Lock input (answerLocked) — prevents fall-timeout or tap during delay
  //   3. Stop fall animation (BONUS only, idempotent elsewhere)
  //   4. Cancel overlay auto-hide timer (overlay stays until render() leaves PLAYING)
  //   5. Clear feedback state (frozenItem, lastAnswer, feedbackPending)
  //   6. Cancel any pending feedback-reveal timer
  //   7. Schedule _finishRun after overlay duration (or immediate if config invalid)
  //
  // Callers must still:
  //   - Show the overlay BEFORE calling this (showChanceLostOverlay)
  //   - Record the answer to storage BEFORE calling this
  //   - Sync HUD if needed BEFORE calling this
  UI.prototype._enterGameOverDelay = function () {
    if (!this._runtime) {
      this._finishRun();
      return;
    }

    // 1. Block renders
    this._runtime.gameOverPending = true;

    // 2. Lock input
    this._runtime.answerLocked = true;

    // 3. Stop fall animation (idempotent if not running / not BONUS)
    this._secretBonusFallStop();

    // 4. Cancel overlay auto-hide timer
    clearUiTimer('overlay.chance.hide');

    // 5. Clear feedback state
    this._runtime.feedbackPending = false;
    this._runtime.feedbackReveal = true;
    this._runtime.lastAnswer = null;
    this._runtime.frozenItem = null;
    this._runtime.finishAfterFeedback = false;

    // 6. Cancel pending feedback-reveal timer
    if (this._runtime.feedbackRevealTimerId) {
      clearRuntimeTimer(this, 'feedbackRevealTimerId');
    }
    if (this._runtime.gameOverAfterFeedbackTimerId) {
      clearRuntimeTimer(this, 'gameOverAfterFeedbackTimerId');
    }

    // 7. Schedule _finishRun after overlay duration
    // Duration source of truth: WT_CONFIG.ui.chanceLostOverlayMs + gameplayPulseMs (game over extension)
    const baseDurationMs = Number(this.config?.ui?.chanceLostOverlayMs);

    // One-shot hook used by the chance-lost overlay to skip immediately to END on tap.
    try {
      window.__wtGameOverSkipToEnd = null;
    } catch (_) {}

    if (
      Number.isFinite(baseDurationMs) &&
      baseDurationMs >= 200 &&
      baseDurationMs <= 3000
    ) {
      let durationMs = baseDurationMs;

      const extraMs = Number(this.config?.ui?.gameplayPulseMs);
      if (Number.isFinite(extraMs) && extraMs >= 0 && extraMs <= 2000) {
        durationMs = baseDurationMs + Math.floor(extraMs);
      }
      if (durationMs > 3000) durationMs = 3000;

      // Cancel any existing end timer (idempotent)
      if (this._runtime.bonusEndTimerId) {
        clearRuntimeTimer(this, 'bonusEndTimerId');
        this._runtime.bonusEndTimerId = null;
      }

      try {
        window.__wtGameOverSkipToEnd = () => {
          if (this.state !== STATES.PLAYING) return;

          if (this._runtime && this._runtime.bonusEndTimerId) {
            clearRuntimeTimer(this, 'bonusEndTimerId');
            this._runtime.bonusEndTimerId = null;
          }

          try {
            window.__wtGameOverSkipToEnd = null;
          } catch (_) {}

          if (this._runtime) this._runtime.gameOverPending = false;
          this._finishRun();
        };
      } catch (_) {}

      setRuntimeTimer(
        this,
        'bonusEndTimerId',
        () => {
          if (this._runtime) this._runtime.bonusEndTimerId = null;
          try {
            window.__wtGameOverSkipToEnd = null;
          } catch (_) {}

          if (this.state !== STATES.PLAYING) return;
          if (this._runtime) this._runtime.gameOverPending = false;
          this._finishRun();
        },
        Math.floor(durationMs)
      );
    } else {
      // Fail-safe: invalid config → end immediately
      try {
        window.__wtGameOverSkipToEnd = null;
      } catch (_) {}
      this._runtime.gameOverPending = false;
      this._finishRun();
    }
  };

  UI.prototype._finishRun = function () {
    // Idempotent: if we're already in END, do nothing (prevents "double END screen" from late timers)
    if (this.state === STATES.END) return;
    if (this._runtime?.finishingRun === true) return;

    // Block storage-triggered renders during _finishRun (recordRunComplete + markPostCompletion
    // both call _save() → _emit() → onStorageUpdated() → render() while still in PLAYING).
    if (this._runtime) this._runtime.finishingRun = true;

    try {
      window.__wtGameOverSkipToEnd = null;
    } catch (_) {
      /* silent */
    }

    cleanupPlayingExit(this, { keepChanceOverlayVisible: true });

    // Snapshot result BEFORE clearing runtime
    const gameState = this.game.getState ? this.game.getState() : {};
    const scoreFP = Number(gameState.scoreFP || 0);
    const maxChances = Number(gameState.maxChances || 0);
    const chancesLeft =
      gameState.chancesLeft != null ? Number(gameState.chancesLeft) : null;

    const mode = String(this._runtime?.runMode || '').trim();
    const finalMaxStreak = clampInt(
      Math.max(
        Number(this._runtime?.microPics?.maxCorrectStreakDisplayed || 0),
        Number(this._runtime?.microPics?.maxCorrectStreak || 0)
      ),
      0,
      9999
    );

    // Single source of truth: storage.js (V2)
    // - PB + history are handled by StorageManager.recordRunComplete()

    let newBest = false;
    let bestScoreFP = 0;
    let dailyChallengeCompleted = false;
    let dailyTicketAwarded = false;
    let dailyTicketAtCap = false;
    let dailyTicketBalance = getRapidFireTicketBalance(this.storage);
    let dailyTicketDayKey = '';
    let dailyTargetScore = 0;
    let levelProgress = {
      previousLevel: 0,
      currentLevel: 0,
      unlockedLevel: 0,
      justUnlocked: false
    };

    if (
      mode === 'RUN' &&
      this.storage &&
      typeof this.storage.recordRunComplete === 'function'
    ) {
      const nextRunNumber = clampInt(
        this._runtime?.currentRunNumber,
        0,
        999999999
      );
      const priorBestScoreFP =
        this.storage && typeof this.storage.getPersonalBest === 'function'
          ? clampInt(this.storage.getPersonalBest()?.bestScoreFP, 0, 99999)
          : 0;
      const priorDailyModel = getDailyChallengeModel(
        this.config || {},
        this.wording || {},
        priorBestScoreFP,
        this.storage
      );

      let newSeenCount = 0;
      try {
        if (typeof this.storage.getItemStats === 'function') {
          const uniqueRunIds = Array.isArray(this._runtime?.runItemIds)
            ? Array.from(
                new Set(
                  this._runtime.runItemIds
                    .map((id) => Number(id))
                    .filter((id) => Number.isFinite(id) && id > 0)
                )
              )
            : [];

          for (const id of uniqueRunIds) {
            const stats = this.storage.getItemStats(id);
            if (stats && Number(stats.seenCount) === 1) {
              newSeenCount += 1;
            }
          }
        }
      } catch (_) {
        newSeenCount = 0;
      }

      const res = this.storage.recordRunComplete(nextRunNumber, scoreFP, {
        mode: 'RUN',
        maxChances: Number(maxChances || 0),
        chancesLeft: chancesLeft == null ? null : Number(chancesLeft),
        newSeenCount: clampInt(newSeenCount, 0, 99999),
        maxCorrectStreak: finalMaxStreak,
        endedFrom: 'ui'
      });

      newBest = !!(res && res.newBest);
      bestScoreFP = Number((res && res.bestScoreFP) || 0);

      try {
        const isPrem = isPremiumNow(this.storage);
        const isLastFreeRun =
          String(this._runtime?.runType || '').trim() === 'LAST_FREE';
        dailyTargetScore = clampInt(priorDailyModel?.targetScore, 0, 99999);
        dailyChallengeCompleted = scoreFP >= Math.max(1, dailyTargetScore);
        dailyTicketDayKey = String(priorDailyModel?.dayKey || '').trim();

        if (
          dailyChallengeCompleted &&
          dailyTicketDayKey &&
          getDailyTicketEarnedDayKey(this.storage) !== dailyTicketDayKey &&
          (isPrem || isLastFreeRun)
        ) {
          const rewardRes = grantDailyRapidFireTicket(
            this.storage,
            dailyTicketDayKey
          );
          dailyTicketAwarded = !!rewardRes?.granted;
          dailyTicketAtCap = !!rewardRes?.atCap;
          dailyTicketBalance = clampInt(rewardRes?.balance, 0, 999);
        } else {
          dailyTicketBalance = getRapidFireTicketBalance(this.storage);
        }
      } catch (_) {
        dailyChallengeCompleted = false;
        dailyTicketAwarded = false;
        dailyTicketAtCap = false;
        dailyTicketBalance = getRapidFireTicketBalance(this.storage);
        dailyTicketDayKey = '';
      }
    } else if (
      mode === 'BONUS' &&
      this.storage &&
      typeof this.storage.recordBonusComplete === 'function'
    ) {
      const res = this.storage.recordBonusComplete(scoreFP, {
        mode: 'BONUS',
        maxChances: Number(maxChances || 0),
        chancesLeft: chancesLeft == null ? null : Number(chancesLeft),
        endedFrom: 'ui'
      });

      newBest = !!(res && res.newBest);
      bestScoreFP = Number((res && res.bestScoreFP) || 0);
    }

    if (
      this.storage &&
      typeof this.storage.updateLevelProgression === 'function'
    ) {
      try {
        levelProgress =
          this.storage.updateLevelProgression({
            mode,
            scoreFP,
            totalPresented: Array.isArray(this._runtime?.runItemIds)
              ? this._runtime.runItemIds.length
              : 0
          }) || levelProgress;
      } catch (_) {
        /* silent */
      }
    }

    if (this._runtime?.landingRunCompletionPending) {
      if (
        mode !== 'BONUS' &&
        this.storage &&
        typeof this.storage.markLandingNextRunCompleted === 'function'
      ) {
        try {
          this.storage.markLandingNextRunCompleted();
        } catch (_) {
          /* silent */
        }
      }
      this._runtime.landingRunCompletionPending = false;
    }

    // Store for END screen
    this._runtime.lastRun = {
      mode,
      runType: String(this._runtime?.runType || '').trim(),
      runId: String(this._runtime?.currentRunId || '').trim(),
      runNumber: clampInt(this._runtime?.currentRunNumber, 0, 999999999),
      durationMs: clampInt(
        Date.now() - Number(this._runtime?.runStartedAt || Date.now()),
        0,
        24 * 60 * 60 * 1000
      ),
      scoreFP,
      maxChances,
      chancesLeft,
      newBest,
      bestScoreFP,
      maxCorrectStreak: finalMaxStreak,
      mistakeIds: Array.isArray(this._runtime.runMistakeIds)
        ? this._runtime.runMistakeIds.slice()
        : [],
      runItemIds: Array.isArray(this._runtime.runItemIds)
        ? this._runtime.runItemIds.slice()
        : [],
      dailyChallengeCompleted,
      dailyTargetScore,
      dailyTicketAwarded,
      dailyTicketAtCap,
      dailyTicketBalance,
      dailyTicketDayKey,
      answerLog: Array.isArray(this._runtime.runAnswerLog)
        ? this._runtime.runAnswerLog.slice()
        : [],
      poolCompleteCelebration: !!this._runtime?.poolCompleteCelebrationPending,
      levelProgress
    };

    try {
      void this.submitLeaderboardRun(this._runtime.lastRun).then((res) => {
        if (
          window.WT_UI_Leaderboard &&
          typeof window.WT_UI_Leaderboard.handleSubmitResult === 'function'
        ) {
          window.WT_UI_Leaderboard.handleSubmitResult(this, res, {
            clampInt,
            fillTemplate,
            toastNow
          });
        }
      });
    } catch (_) {
      /* silent */
    }

    // Consume one-shot runtime flag
    if (this._runtime) this._runtime.poolCompleteCelebrationPending = false;

    // Clear feedback state
    this._runtime.feedbackPending = false;
    this._runtime.lastAnswer = null;
    this._runtime.frozenItem = null;
    this._runtime.finishAfterFeedback = false;
    this._runtime.autoGameOverAfterFeedback = false;
    this._runtime.answerLocked = false;

    // BONUS returns to END (no separate BONUS_END state)
    // Persist post-completion milestone state when the full pool is exhausted.
    try {
      const exhausted = !!(
        this.storage &&
        typeof this.storage.hasSeenAllWordTraps === 'function' &&
        this.storage.hasSeenAllWordTraps() === true
      );

      if (
        exhausted &&
        this.storage &&
        typeof this.storage.markPostCompletionSeenOnce === 'function'
      ) {
        this.storage.markPostCompletionSeenOnce();
      }
    } catch (_) {
      /* silent */
    }

    const fromPlaying = this.state === STATES.PLAYING;

    // Default behavior (BONUS -> END, etc.)
    if (!fromPlaying) {
      if (this._runtime) this._runtime.finishingRun = false;
      this.setState(STATES.END);
      return;
    }

    // Respect reduced motion
    let reduceMotion = false;
    try {
      reduceMotion = !!(
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    } catch (_) {
      reduceMotion = false;
    }

    const app = el('app');
    if (!app || reduceMotion) {
      if (this._runtime) this._runtime.finishingRun = false;
      this.setState(STATES.END);
      return;
    }

    const FADE_MS = 200;

    try {
      app.classList.add('transitioning'); // block interactions during fade
      app.classList.add('wt-fade');
      app.classList.remove('wt-fade--in');
      app.classList.add('wt-fade--out');
    } catch (_) {
      if (this._runtime) this._runtime.finishingRun = false;
      this.setState(STATES.END);
      return;
    }
    setRuntimeTimer(
      this,
      'finishFadeOutTimerId',
      () => {
        if (this._runtime) this._runtime.finishFadeOutTimerId = null;
        if (this._runtime) this._runtime.finishingRun = false;
        this.setState(STATES.END);

        setRuntimeTimer(
          this,
          'finishFadeInStartTimerId',
          () => {
            if (this._runtime) this._runtime.finishFadeInStartTimerId = null;
            const a = el('app');
            if (!a) return;

            try {
              a.classList.add('wt-fade');
              a.classList.remove('wt-fade--out');
              a.classList.add('wt-fade--in');
            } catch (_) {}

            setRuntimeTimer(
              this,
              'finishFadeCleanupTimerId',
              () => {
                if (this._runtime)
                  this._runtime.finishFadeCleanupTimerId = null;
                const b = el('app');
                if (!b) return;
                try {
                  b.classList.remove('wt-fade');
                  b.classList.remove('wt-fade--out');
                  b.classList.remove('wt-fade--in');
                  b.classList.remove('transitioning'); // restore interactions
                } catch (_) {}
              },
              FADE_MS + 40
            );
          },
          0
        );
      },
      FADE_MS
    );
  };

  // ============================================
  // Paywall
  // ============================================

  UI.prototype._startPaywallTicker = function () {
    if (
      !window.WT_UI_Checkout ||
      typeof window.WT_UI_Checkout.startPaywallTicker !== 'function'
    ) {
      throw new Error('WT_UI_Checkout.startPaywallTicker missing');
    }
    return window.WT_UI_Checkout.startPaywallTicker(this, {
      syncScopedRenderTicker,
      shouldRefreshPaywallTimer,
      isEarlyPriceWindowActive,
      clearUiTimer
    });
  };

  UI.prototype._stopPaywallTicker = function () {
    if (
      !window.WT_UI_Checkout ||
      typeof window.WT_UI_Checkout.stopPaywallTicker !== 'function'
    ) {
      throw new Error('WT_UI_Checkout.stopPaywallTicker missing');
    }
    return window.WT_UI_Checkout.stopPaywallTicker(this, { clearUiTimer });
  };

  UI.prototype.checkout = function (priceKey, event) {
    if (
      !window.WT_UI_Checkout ||
      typeof window.WT_UI_Checkout.checkout !== 'function'
    ) {
      throw new Error('WT_UI_Checkout.checkout missing');
    }
    return window.WT_UI_Checkout.checkout(this, priceKey, event, {
      isOnline,
      toastNow
    });
  };

  // (deleted) legacy share-clicked event removed per spec

  // Single source of truth for share text (used by preview + copy)
  UI.prototype._getShareText = function () {
    if (
      !window.WT_UI_Share ||
      typeof window.WT_UI_Share.getShareText !== 'function'
    ) {
      throw new Error('WT_UI_Share.getShareText missing');
    }
    return window.WT_UI_Share.getShareText(this, { clampInt });
  };

  UI.prototype.copyShareText = async function () {
    if (!window.WT_UI_Share || typeof window.WT_UI_Share.copy !== 'function') {
      throw new Error('WT_UI_Share.copy missing');
    }
    return window.WT_UI_Share.copy(this, { clampInt, toastNow });
  };

  UI.prototype.sendShareViaEmail = function () {
    if (
      !window.WT_UI_Share ||
      typeof window.WT_UI_Share.sendEmail !== 'function'
    ) {
      throw new Error('WT_UI_Share.sendEmail missing');
    }
    return window.WT_UI_Share.sendEmail(this, { clampInt });
  };

  // ============================================
  // Mistakes only toggle (Landing)
  // ============================================
  UI.prototype.toggleMistakesOnly = function () {
    if (!this.storage) return;

    const cfg = this.config || {};
    const moCfg = cfg.mistakesOnly || {};
    if (!moCfg.enabled) return;

    const premiumOnly = moCfg.premiumOnly === true;
    const premium = isPremiumNow(this.storage);

    if (premiumOnly && !premium) {
      this.setState(STATES.PAYWALL);
      return;
    }

    const on =
      typeof this.storage.getMistakesOnly === 'function'
        ? this.storage.getMistakesOnly()
        : false;
    if (typeof this.storage.setMistakesOnly === 'function') {
      this.storage.setMistakesOnly(!on);
    }
  };

  // ============================================
  // Support modal
  // ============================================
  UI.prototype.openSupportModal = function () {
    if (
      !window.WT_UI_Support ||
      typeof window.WT_UI_Support.openSupport !== 'function'
    ) {
      throw new Error('WT_UI_Support.openSupport missing');
    }
    return window.WT_UI_Support.openSupport(this, { escapeHtml, toastNow });
  };

  UI.prototype.copySupportEmail = async function () {
    if (
      !window.WT_UI_Support ||
      typeof window.WT_UI_Support.copySupportEmail !== 'function'
    ) {
      throw new Error('WT_UI_Support.copySupportEmail missing');
    }
    return window.WT_UI_Support.copySupportEmail(this, { toastNow });
  };

  UI.prototype.openSupportEmailApp = function (kind) {
    if (
      !window.WT_UI_Support ||
      typeof window.WT_UI_Support.openSupportEmail !== 'function'
    ) {
      throw new Error('WT_UI_Support.openSupportEmail missing');
    }
    return window.WT_UI_Support.openSupportEmail(this, kind);
  };

  // ============================================
  // Pool complete (one-shot modal on END entry)
  // ============================================
  UI.prototype.openPoolCompleteModal = function () {
    if (
      !window.WT_UI_Growth ||
      typeof window.WT_UI_Growth.openPoolComplete !== 'function'
    ) {
      throw new Error('WT_UI_Growth.openPoolComplete missing');
    }
    return window.WT_UI_Growth.openPoolComplete(this, {
      escapeHtml,
      fillTemplate,
      clampInt
    });
  };

  // ============================================
  // Milestone modal (one-shot on END entry)
  // ============================================
  UI.prototype.openMilestoneModal = function (milestoneKey) {
    if (
      !window.WT_UI_Growth ||
      typeof window.WT_UI_Growth.openMilestone !== 'function'
    ) {
      throw new Error('WT_UI_Growth.openMilestone missing');
    }
    return window.WT_UI_Growth.openMilestone(this, milestoneKey, {
      escapeHtml
    });
  };

  // ============================================
  // Waitlist (mailto, no backend)
  // ============================================
  UI.prototype.openWaitlistModal = function () {
    if (
      !window.WT_UI_Support ||
      typeof window.WT_UI_Support.openWaitlist !== 'function'
    ) {
      throw new Error('WT_UI_Support.openWaitlist missing');
    }
    return window.WT_UI_Support.openWaitlist(this, { escapeHtml });
  };

  UI.prototype.sendWaitlistViaEmail = function () {
    if (
      !window.WT_UI_Support ||
      typeof window.WT_UI_Support.sendWaitlist !== 'function'
    ) {
      throw new Error('WT_UI_Support.sendWaitlist missing');
    }
    return window.WT_UI_Support.sendWaitlist(this, { toastNow });
  };

  // ============================================
  // Anonymous Stats Payload (opt-in sharing)
  // ============================================

  UI.prototype._getStatsPayloadWithTerms = function () {
    if (
      !window.WT_UI_StatsSharing ||
      typeof window.WT_UI_StatsSharing.getPayload !== 'function'
    ) {
      throw new Error('WT_UI_StatsSharing.getPayload missing');
    }
    return window.WT_UI_StatsSharing.getPayload(this);
  };

  UI.prototype.openStatsSharingModal = function () {
    if (
      !window.WT_UI_StatsSharing ||
      typeof window.WT_UI_StatsSharing.openModal !== 'function'
    ) {
      throw new Error('WT_UI_StatsSharing.openModal missing');
    }
    return window.WT_UI_StatsSharing.openModal(this, { escapeHtml, toastNow });
  };

  UI.prototype.sendStatsViaEmail = function () {
    if (
      !window.WT_UI_StatsSharing ||
      typeof window.WT_UI_StatsSharing.sendEmail !== 'function'
    ) {
      throw new Error('WT_UI_StatsSharing.sendEmail missing');
    }
    return window.WT_UI_StatsSharing.sendEmail(this, { toastNow });
  };

  UI.prototype.copyStatsToClipboard = async function () {
    if (
      !window.WT_UI_StatsSharing ||
      typeof window.WT_UI_StatsSharing.copy !== 'function'
    ) {
      throw new Error('WT_UI_StatsSharing.copy missing');
    }
    return window.WT_UI_StatsSharing.copy(this, { toastNow });
  };

  UI.prototype._maybePromptStatsSharingMilestone = function () {
    if (
      !window.WT_UI_StatsSharing ||
      typeof window.WT_UI_StatsSharing.maybePrompt !== 'function'
    ) {
      throw new Error('WT_UI_StatsSharing.maybePrompt missing');
    }
    return window.WT_UI_StatsSharing.maybePrompt(this, {
      clampInt,
      escapeHtml,
      toastNow,
      isPremiumNow,
      getStatsSharingPromptFlags,
      getStatsSharingSnoozeUntilRunCompletes,
      markStatsSharingPromptFlag
    });
  };

  UI.prototype.openInstallPromptModal = function () {
    if (
      !window.WT_UI_Install ||
      typeof window.WT_UI_Install.openModal !== 'function'
    ) {
      throw new Error('WT_UI_Install.openModal missing');
    }
    return window.WT_UI_Install.openModal(this, { escapeHtml });
  };

  UI.prototype._canShowInstallPrompt = function () {
    if (
      !window.WT_UI_Install ||
      typeof window.WT_UI_Install.canShow !== 'function'
    ) {
      throw new Error('WT_UI_Install.canShow missing');
    }
    return window.WT_UI_Install.canShow(this);
  };

  // ============================================
  // Install prompt (minimal)
  // ============================================
  UI.prototype.promptInstall = function () {
    if (
      !window.WT_UI_Install ||
      typeof window.WT_UI_Install.prompt !== 'function'
    ) {
      throw new Error('WT_UI_Install.prompt missing');
    }
    return window.WT_UI_Install.prompt(this, { escapeHtml });
  };

  UI.prototype.applyUpdateToast = function () {
    if (
      !window.WT_UI_Checkout ||
      typeof window.WT_UI_Checkout.applyUpdateToast !== 'function'
    ) {
      throw new Error('WT_UI_Checkout.applyUpdateToast missing');
    }
    return window.WT_UI_Checkout.applyUpdateToast(this, { el });
  };

  // ============================================
  // ============================================
  // House ad (optional)
  // ============================================
  UI.prototype.remindHouseAdLater = function () {
    if (
      !window.WT_UI_Growth ||
      typeof window.WT_UI_Growth.remindHouseAdLater !== 'function'
    ) {
      throw new Error('WT_UI_Growth.remindHouseAdLater missing');
    }
    return window.WT_UI_Growth.remindHouseAdLater(this);
  };

  UI.prototype.openHouseAd = function () {
    if (
      !window.WT_UI_Growth ||
      typeof window.WT_UI_Growth.openHouseAd !== 'function'
    ) {
      throw new Error('WT_UI_Growth.openHouseAd missing');
    }
    return window.WT_UI_Growth.openHouseAd(this);
  };

  // ============================================
  // Secret Bonus fall (UI-only)
  // ============================================

  UI.prototype._secretBonusFallStop = function () {
    const sbf = this._runtime?.secretBonusFall;
    if (!sbf) return;

    if (sbf.rafId) {
      try {
        window.cancelAnimationFrame(sbf.rafId);
      } catch (_) {}
    }

    sbf.rafId = 0;
    sbf.running = false;
    sbf.lastTs = 0;
  };

  // Secret Bonus: refs cleanup ONLY when exiting BONUS (not per item)
  UI.prototype._secretBonusFallCleanup = function () {
    const sbf = this._runtime?.secretBonusFall;
    if (!sbf) return;

    this._secretBonusFallStop();

    sbf.laneEl = null;
    sbf.chipEl = null;
    sbf.failLineEl = null;
    sbf.failLabelEl = null;

    sbf.itemKey = '';
    sbf.y01 = 0;
    sbf.speed01PerSec = 0;
    sbf.trackPxMax = 0;
    sbf.wasInWarning = false;
  };

  UI.prototype._secretBonusFailCurrentItem = function () {
    // Fail-closed: only during BONUS + PLAYING
    if (this.state !== STATES.PLAYING) return;
    if (!this._runtime) return;

    // Local source of truth (this method must not rely on render-time locals)
    const modeNow = String(this._runtime?.runMode || '').trim();
    if (!modeNow) return;
    if (modeNow !== MODES.BONUS) return;

    // If feedback is pending, don't inject anything.
    if (this._runtime.feedbackPending === true) return;

    // HARD LOCK like normal answer
    if (this._runtime.answerLocked === true) return;
    this._runtime.answerLocked = true;

    // Snapshot chances BEFORE answering (for pulse/toast)
    let prevChancesLeft = null;
    try {
      const gsPrev =
        this.game && typeof this.game.getState === 'function'
          ? this.game.getState() || {}
          : {};
      if (gsPrev.chancesLeft != null)
        prevChancesLeft = Number(gsPrev.chancesLeft);
    } catch (_) {
      /* silent */
    }

    // Timeout / no answer:
    // The engine contract expects a strict boolean. Force a guaranteed-wrong boolean by inverting correctAnswer.
    let forcedWrong = false;
    try {
      const cur =
        this.game && typeof this.game.getCurrent === 'function'
          ? this.game.getCurrent()
          : null;
      const correct =
        cur && (cur.correctAnswer === true || cur.correctAnswer === false)
          ? cur.correctAnswer
          : null;
      if (correct === true) forcedWrong = false;
      else if (correct === false) forcedWrong = true;
    } catch (_) {
      forcedWrong = false;
    }

    const res =
      this.game && typeof this.game.answer === 'function'
        ? this.game.answer(forcedWrong)
        : null;

    // Stop fall loop immediately to avoid double-fail
    this._secretBonusFallStop();

    // If engine didn't answer, unlock (fail-safe)
    if (!res) {
      this._runtime.answerLocked = false;
      return;
    }

    // Chance pulse + unified toast (same contract as UI.prototype.answer)
    let chanceLost = false;
    let nowChancesLeft = null;

    try {
      const gsNow =
        this.game && typeof this.game.getState === 'function'
          ? this.game.getState() || {}
          : {};
      nowChancesLeft =
        gsNow.chancesLeft != null ? Number(gsNow.chancesLeft) : null;

      chanceLost =
        prevChancesLeft != null &&
        nowChancesLeft != null &&
        Number.isFinite(prevChancesLeft) &&
        Number.isFinite(nowChancesLeft) &&
        nowChancesLeft < prevChancesLeft;

      this._runtime.chanceLostPulseAt = chanceLost ? Date.now() : 0;

      const lastChanceEntered =
        prevChancesLeft != null &&
        nowChancesLeft != null &&
        Number.isFinite(prevChancesLeft) &&
        Number.isFinite(nowChancesLeft) &&
        prevChancesLeft > 1 &&
        nowChancesLeft === 1;
      this._runtime.lastChancePulseAt = lastChanceEntered ? Date.now() : 0;

      this._runtime.scoreFlashAt = 0;
    } catch (_) {
      chanceLost = false;
      nowChancesLeft = null;
      this._runtime.chanceLostPulseAt = 0;
      this._runtime.lastChancePulseAt = 0;
    }

    this._scheduleHudPulseCleanup();

    if (chanceLost && Number.isFinite(nowChancesLeft)) {
      try {
        const root = this.appEl || document.getElementById('app');
        const pill = root ? root.querySelector('.wt-pill--chances') : null;

        if (pill) {
          const uiW = this.wording && this.wording.ui ? this.wording.ui : {};
          const label = String(uiW.mistakesLabel || '').trim();

          const gs =
            this.game && typeof this.game.getState === 'function'
              ? this.game.getState() || {}
              : {};
          const mcRaw = Number(gs.maxChances || this.config?.game?.maxChances);
          const mc =
            Number.isFinite(mcRaw) && mcRaw > 0 ? Math.floor(mcRaw) : 0;

          const left = Math.max(0, Math.floor(Number(nowChancesLeft)));
          const mistakes = mc > 0 ? Math.max(0, Math.min(mc, mc - left)) : 0;

          const visual =
            mc > 0
              ? Array(mc)
                  .fill(null)
                  .map((_, i) => {
                    const isOn = i < mistakes;
                    const isLast = isOn && mistakes > 0 && i === mistakes - 1;
                    return `<span class="wt-hud-lives__dot${isOn ? '' : ' wt-hud-lives__dot--off'}${isLast ? ' wt-hud-lives__dot--last' : ''}" aria-hidden="true"></span>`;
                  })
                  .join('')
              : '';

          pill.classList.remove('wt-pill--danger-pulse');
          pill.setAttribute(
            'aria-label',
            label ? `${label}: ${mistakes}/${mc}` : `${mistakes}/${mc}`
          );
          pill.innerHTML = `
            ${label ? `<small>${escapeHtml(label)}</small>` : ``}
            ${mistakes}/${mc}
            ${visual}
          `;
        }
      } catch (_) {
        /* silent */
      }
    }

    if (chanceLost && Number.isFinite(nowChancesLeft)) {
      showChanceLostOverlay(
        this.config,
        this.wording,
        nowChancesLeft,
        String(this._runtime?.runMode || '').trim()
      );
    }

    // Block renders before recordAnswer if game over (same contract as answer()).
    if (
      res.done === true &&
      Number.isFinite(nowChancesLeft) &&
      Number(nowChancesLeft) === 0
    ) {
      this._runtime.gameOverPending = true;
    }

    if (this.storage && typeof this.storage.recordAnswer === 'function') {
      this.storage.recordAnswer(res.itemId, res.isCorrect);
    }

    if (Number.isFinite(Number(res.itemId))) {
      const id = Number(res.itemId);
      this._runtime.runItemIds.push(id);

      if (res.isCorrect !== true) {
        if (!Array.isArray(this._runtime.runMistakeIds))
          this._runtime.runMistakeIds = [];
        if (this._runtime.runMistakeIds.indexOf(id) === -1)
          this._runtime.runMistakeIds.push(id);
      }
    }

    // BONUS feedback policy already handled in UI.prototype.answer, but here we enforce the same "none/minimal".
    const sbFeedback = String(this.config?.secretBonus?.feedback || '').trim();

    if (sbFeedback === 'none') {
      this._runtime.feedbackPending = false;
      this._runtime.lastAnswer = null;
      this._runtime.frozenItem = null;
      this._runtime.finishAfterFeedback = false;
      this._runtime.answerLocked = false;

      if (res.done === true) {
        const endedByGameOver =
          Number.isFinite(nowChancesLeft) && Number(nowChancesLeft) === 0;
        if (endedByGameOver) {
          // Fall already stopped (line above). Use factored delay for freeze + overlay hold.
          this._enterGameOverDelay();
          return;
        }
        this._finishRun();
        return;
      }

      this.render();

      try {
        this._secretBonusFallStartOrSync();
      } catch (_) {
        /* silent */
      }

      return;
    }
    if (res.done === true) {
      let nowChancesLeft = null;
      try {
        const gsNow =
          this.game && typeof this.game.getState === 'function'
            ? this.game.getState() || {}
            : {};
        nowChancesLeft =
          gsNow.chancesLeft != null ? Number(gsNow.chancesLeft) : null;
      } catch (_) {
        nowChancesLeft = null;
      }

      const endedByGameOver =
        Number.isFinite(nowChancesLeft) && Number(nowChancesLeft) === 0;

      if (endedByGameOver) {
        // Fall already stopped. Use factored delay for freeze + overlay hold.
        this._enterGameOverDelay();
        return;
      }

      // Deck exhausted: show gameplay overlay then transition to END
      const msg = String(
        this.wording?.secretBonus?.endDeckExhaustedToast || ''
      ).trim();
      const timing = getToastTiming(this.config, '');
      const durationMs = timing ? Number(timing.durationMs) : NaN;

      if (
        msg &&
        Number.isFinite(durationMs) &&
        durationMs >= 600 &&
        durationMs <= 4000
      ) {
        showGameplayOverlay(msg, {
          durationMs: Math.floor(durationMs),
          variant: 'success',
          cfg: this.config,
          mode: MODES.BONUS
        });

        if (this._runtime.bonusEndTimerId) {
          clearRuntimeTimer(this, 'bonusEndTimerId');
          this._runtime.bonusEndTimerId = null;
        }

        setRuntimeTimer(
          this,
          'bonusEndTimerId',
          () => {
            this._runtime.bonusEndTimerId = null;
            if (this.state !== STATES.PLAYING) return;
            this._finishRun();
          },
          Math.floor(durationMs)
        );

        return;
      }

      this._finishRun();
      return;
    }

    this.render();

    try {
      this._secretBonusFallStartOrSync();
    } catch (_) {
      /* silent */
    }
  };

  UI.prototype._secretBonusFallStartOrSync = function () {
    if (!this._runtime) return;

    const cfg = this.config || {};
    const sb = cfg?.secretBonus || {};
    const fall = sb && typeof sb === 'object' ? sb.fall : null;

    // No fallback: require full fall config (speed in % of lane height per second).
    // Config uses % (e.g. 25 = 25%/s), code converts to ratio (0.25).
    if (
      !fall ||
      typeof fall !== 'object' ||
      fall.enabled !== true ||
      !Number.isFinite(Number(fall.initialSpeed)) ||
      Number(fall.initialSpeed) <= 0 ||
      !Number.isFinite(Number(fall.maxSpeed)) ||
      Number(fall.maxSpeed) <= 0 ||
      !Number.isFinite(Number(fall.speedIncrement)) ||
      Number(fall.speedIncrement) < 0 ||
      !Number.isFinite(Number(fall.dangerThreshold)) ||
      Number(fall.dangerThreshold) <= 0 ||
      Number(fall.dangerThreshold) >= 1
    ) {
      this._secretBonusFallStop();
      return;
    }

    const sbf = this._runtime ? this._runtime.secretBonusFall : null;
    if (!sbf) return;

    // Bind DOM references (fresh after render)
    const lane = this.appEl
      ? this.appEl.querySelector('[data-wt-bonus-lane]')
      : null;
    const chip = this.appEl
      ? this.appEl.querySelector('[data-wt-bonus-chip]')
      : null;
    const failLineEl = this.appEl
      ? this.appEl.querySelector('[data-wt-bonus-fail]')
      : null;
    const failLabel = this.appEl
      ? this.appEl.querySelector('[data-wt-bonus-fail-label]')
      : null;

    if (!lane || !chip || !failLineEl) {
      this._secretBonusFallStop();
      return;
    }

    sbf.laneEl = lane;
    sbf.chipEl = chip;
    sbf.failLineEl = failLineEl;
    sbf.failLabelEl = failLabel || null;

    // Cache the available track height once (avoid layout reads every frame)
    try {
      const laneH = lane.getBoundingClientRect().height || 0;
      const chipH = chip.getBoundingClientRect().height || 0;
      sbf.trackPxMax = Math.max(
        0,
        laneH - (Number.isFinite(chipH) ? chipH : 0)
      );
    } catch (_) {
      sbf.trackPxMax = 0;
    }

    // Detect new item -> reset fall position/speed
    const cur =
      this.game && typeof this.game.getCurrent === 'function'
        ? this.game.getCurrent()
        : null;
    const itemId = cur && cur.id != null ? String(cur.id) : '';
    const itemKey = itemId ? `id:${itemId}` : '';

    if (itemKey && itemKey !== sbf.itemKey) {
      sbf.itemKey = itemKey;
      sbf.y01 = 0;
      sbf.lastTs = 0;

      // Reset warning edge detection for the new item
      sbf.wasInWarning = false;

      // Clear transient classes from previous item
      try {
        if (sbf.chipEl && sbf.chipEl.classList) {
          sbf.chipEl.classList.remove(
            'wt-bonus-chip--warning',
            'wt-bonus-chip--warning-once',
            'wt-bonus-chip--spawn'
          );
          sbf.chipEl.style.animationDuration = '';
        }
        if (sbf.failLineEl && sbf.failLineEl.classList) {
          sbf.failLineEl.classList.remove('wt-bonus-fail-line--pulse');
        }
        if (sbf.failLabelEl && sbf.failLabelEl.classList) {
          sbf.failLabelEl.classList.remove('wt-bonus-fail-label--pulse');
        }
      } catch (_) {}

      // Speed contract (single type): progression based on items served (not time).
      // Config values are % of lane height per second (e.g. 25 => 25%/s),
      // ramp applied once per new item: speed = min(max, initial + increment * itemsServedSoFar).
      const initialPct = Number(fall.initialSpeed);
      const incPct = Number(fall.speedIncrement);
      const maxPct = Number(fall.maxSpeed);

      const servedSoFar = Array.isArray(this._runtime?.runItemIds)
        ? this._runtime.runItemIds.length
        : 0;

      if (!Number.isFinite(initialPct) || initialPct <= 0) {
        this._secretBonusFallStop();
        return;
      }
      if (!Number.isFinite(incPct) || incPct < 0) {
        this._secretBonusFallStop();
        return;
      }
      if (!Number.isFinite(maxPct) || maxPct <= 0) {
        this._secretBonusFallStop();
        return;
      }

      const speedPct = Math.min(
        maxPct,
        Math.max(0, initialPct + incPct * servedSoFar)
      );
      sbf.speed01PerSec = speedPct / 100;

      // Reset transform immediately
      try {
        sbf.chipEl.style.transform = 'translate3d(0px, 0px, 0px)';
      } catch (_) {}

      // Micro-juice: spawn pop (1 shot)
      try {
        if (sbf.chipEl && sbf.chipEl.classList) {
          sbf.chipEl.classList.add('wt-bonus-chip--spawn');

          const onDone = () => {
            try {
              sbf.chipEl.classList.remove('wt-bonus-chip--spawn');
            } catch (_) {}
          };

          sbf.chipEl.addEventListener('animationend', onDone, { once: true });
          sbf.chipEl.addEventListener('animationcancel', onDone, {
            once: true
          });
        }
      } catch (_) {}
    }

    if (sbf.running === true) return;

    // Don't start falling while run-start overlay is visible (chip would move unseen).
    // The wt-runstart-dismissed event will re-trigger _secretBonusFallStartOrSync.
    if (isOverlayVisible('wt-run-start-overlay')) return;

    sbf.running = true;
    sbf.rafId = window.requestAnimationFrame((ts) =>
      this._secretBonusFallTick(ts)
    );
  };

  UI.prototype._secretBonusFallTick = function (ts) {
    const sbf = this._runtime?.secretBonusFall;
    if (!sbf || sbf.running !== true) return;

    // Validate still on BONUS playing with required DOM nodes
    const modeNow = String(this._runtime?.runMode || 'RUN').trim();
    if (
      this.state !== STATES.PLAYING ||
      modeNow !== 'BONUS' ||
      !sbf.laneEl ||
      !sbf.chipEl
    ) {
      this._secretBonusFallStop();
      return;
    }

    const cfg = this.config || {};
    const fall = cfg?.secretBonus?.fall || null;
    if (!fall || typeof fall !== 'object') {
      this._secretBonusFallStop();
      return;
    }

    // maxSpeed is a % value (e.g. 80 => 0.80). dangerThreshold is a ratio (0..1).
    const maxSpeed01 = Number(fall.maxSpeed) / 100;
    const danger01 = Number(fall.dangerThreshold);

    if (!Number.isFinite(maxSpeed01) || maxSpeed01 <= 0) {
      this._secretBonusFallStop();
      return;
    }

    // dangerThreshold must be a strict ratio in (0..1) for consistent gameplay + visuals
    if (!Number.isFinite(danger01) || danger01 <= 0 || danger01 >= 1) {
      this._secretBonusFallStop();
      return;
    }

    // Track is cached in _secretBonusFallStartOrSync (avoid layout reads every frame)
    let trackPxMax = Number(sbf.trackPxMax || 0);

    if (!Number.isFinite(trackPxMax) || trackPxMax <= 0) {
      try {
        const laneRect = sbf.laneEl.getBoundingClientRect();
        const chipRect = sbf.chipEl.getBoundingClientRect();
        trackPxMax = Math.max(
          0,
          Number(laneRect.height || 0) - Number(chipRect.height || 0)
        );
        sbf.trackPxMax = trackPxMax;
      } catch (_) {
        trackPxMax = 0;
        sbf.trackPxMax = 0;
      }

      if (!Number.isFinite(trackPxMax) || trackPxMax <= 0) {
        this._secretBonusFallStop();
        return;
      }
    }

    const last = Number(sbf.lastTs || 0);
    sbf.lastTs = Number.isFinite(ts) ? ts : 0;

    // First frame: just schedule next
    if (!last || !Number.isFinite(last)) {
      sbf.rafId = window.requestAnimationFrame((t2) =>
        this._secretBonusFallTick(t2)
      );
      return;
    }

    const dtMs = Math.max(0, Math.min(80, sbf.lastTs - last));
    const dtSec = dtMs / 1000;

    // Speed is set once per item in _secretBonusFallStartOrSync (items-served progression).
    // Clamp to max to fail-safe if config changed mid-run.
    const speed01 = Math.min(
      maxSpeed01,
      Math.max(0, Number(sbf.speed01PerSec || 0))
    );
    if (!Number.isFinite(speed01) || speed01 <= 0) {
      this._secretBonusFallStop();
      return;
    }

    // Clamp y01 to [0..1] so the chip never overshoots the track
    sbf.y01 = Math.min(1, Math.max(0, Number(sbf.y01 || 0) + speed01 * dtSec));

    const yPx = sbf.y01 * trackPxMax;

    // Apply transform (no re-render)
    try {
      sbf.chipEl.style.transform = `translate3d(0px, ${Math.round(yPx)}px, 0px)`;
    } catch (_) {}

    // Warning zone: keep the existing policy, but let micro-juice handle the "one-shot"
    if (Number.isFinite(danger01) && danger01 > 0 && sbf.chipEl) {
      const warningThreshold = danger01 * 0.65;
      const inWarning = sbf.y01 >= warningThreshold;

      // Persistent warning pulse
      sbf.chipEl.classList.toggle('wt-bonus-chip--warning', inWarning);

      // Micro-juice: one-shot hit when entering the zone
      if (inWarning && sbf.wasInWarning !== true) {
        try {
          sbf.chipEl.classList.remove('wt-bonus-chip--warning-once');
          sbf.chipEl.classList.add('wt-bonus-chip--warning-once');

          const onDone = () => {
            try {
              sbf.chipEl.classList.remove('wt-bonus-chip--warning-once');
            } catch (_) {}
          };
          sbf.chipEl.addEventListener('animationend', onDone, { once: true });
          sbf.chipEl.addEventListener('animationcancel', onDone, {
            once: true
          });
        } catch (_) {}

        // Pulse the fail line + label once for clarity
        try {
          if (sbf.failLineEl && sbf.failLineEl.classList) {
            sbf.failLineEl.classList.remove('wt-bonus-fail-line--pulse');
            sbf.failLineEl.classList.add('wt-bonus-fail-line--pulse');

            const onDoneLine = () => {
              try {
                sbf.failLineEl.classList.remove('wt-bonus-fail-line--pulse');
              } catch (_) {}
            };
            sbf.failLineEl.addEventListener('animationend', onDoneLine, {
              once: true
            });
            sbf.failLineEl.addEventListener('animationcancel', onDoneLine, {
              once: true
            });
          }

          if (sbf.failLabelEl && sbf.failLabelEl.classList) {
            sbf.failLabelEl.classList.remove('wt-bonus-fail-label--pulse');
            sbf.failLabelEl.classList.add('wt-bonus-fail-label--pulse');

            const onDoneLabel = () => {
              try {
                sbf.failLabelEl.classList.remove('wt-bonus-fail-label--pulse');
              } catch (_) {}
            };
            sbf.failLabelEl.addEventListener('animationend', onDoneLabel, {
              once: true
            });
            sbf.failLabelEl.addEventListener('animationcancel', onDoneLabel, {
              once: true
            });
          }
        } catch (_) {}
      }

      sbf.wasInWarning = inWarning;
    }

    // Fail line check (based on *track*, not raw lane height)
    const failY = trackPxMax * danger01;
    if (yPx >= failY) {
      this._secretBonusFailCurrentItem();
      return;
    }

    sbf.rafId = window.requestAnimationFrame((t2) =>
      this._secretBonusFallTick(t2)
    );
  };

  // ============================================
  // Render
  // ============================================
  UI.prototype.render = function () {
    if (!this.appEl) return;

    // Safety net: clear stuck overlay locks on LANDING/END (fail-closed)
    if (this.state !== STATES.PLAYING) {
      try {
        if (this.appEl.getAttribute('data-wt-runstart-lock') === '1') {
          this.appEl.style.pointerEvents = '';
          try {
            this.appEl.inert = false;
          } catch (_) {}
          this.appEl.removeAttribute('data-wt-runstart-lock');
          this.appEl.removeAttribute('data-wt-runstart-prev-pe');
          this.appEl.removeAttribute('data-wt-runstart-prev-inert');
        }
        if (this.appEl.inert === true) {
          try {
            this.appEl.inert = false;
          } catch (_) {}
        }
        if (this.appEl.style.pointerEvents === 'none') {
          this.appEl.style.pointerEvents = '';
        }
      } catch (_) {}
    }

    const premium = isPremiumNow(this.storage);

    const prevRenderedState = this._runtime
      ? this._runtime.lastRenderedState
      : null;

    // Funnel counter: count LANDING views once per entry into the screen (not per re-render)
    try {
      const prev = prevRenderedState;
      const next = this.state;

      if (next === STATES.LANDING && prev !== STATES.LANDING) {
        if (
          this.storage &&
          typeof this.storage.markLandingViewed === 'function'
        ) {
          this.storage.markLandingViewed();
        }
      }

      if (this._runtime) this._runtime.lastRenderedState = next;
    } catch (_) {
      /* silent */
    }

    // Preserve footer if it exists inside #app (otherwise leave it alone).
    // We keep the same DOM node (not HTML string) to avoid losing any nested content.
    if (!this._footerNode) {
      try {
        const candidate =
          this.appEl.querySelector('[data-wt-footer]') ||
          this.appEl.querySelector('.wt-footer') ||
          this.appEl.querySelector('footer');
        if (candidate) this._footerNode = candidate;
      } catch (_) {
        /* silent */
      }
    }

    if (this._footerNode && this._footerNode.parentNode === this.appEl) {
      try {
        this.appEl.removeChild(this._footerNode);
      } catch (_) {
        /* silent */
      }
    }
    switch (this.state) {
      case STATES.LANDING:
        this.appEl.innerHTML = this._renderLanding();
        break;

      case STATES.PLAYING:
        // Fail-closed: during END transitions, async events may trigger render()
        // while the engine is already cleaned up. Never re-render PLAYING without a game.
        if (!this.game) return;

        if (this.modalEl && !this.modalEl.classList.contains('wt-hidden')) {
          this.closeModal();
        }
        this.appEl.innerHTML = this._renderPlaying();

        // BONUS: re-bind fall DOM refs after every render (innerHTML detaches previous nodes).
        // _secretBonusFallStartOrSync is idempotent: if already running with same itemKey, it just rebinds refs.
        try {
          if (String(this._runtime?.runMode || '').trim() === MODES.BONUS) {
            this._secretBonusFallStartOrSync();
          }
        } catch (_) {
          /* silent */
        }
        break;

      case STATES.END:
        this.appEl.innerHTML = this._renderEnd();
        break;

      case STATES.PAYWALL:
        this.appEl.innerHTML = this._renderPaywall();
        break;

      default:
        this.appEl.innerHTML = this._renderLanding();
        break;
    }

    // Screen-scoped body class (CSS can react without DOM branching)
    try {
      const playing = this.state === STATES.PLAYING;
      const ended = this.state === STATES.END;
      document.body.classList.toggle('wt-state--playing', playing);
      document.body.classList.toggle('wt-state--end', ended);
    } catch (_) {
      /* silent */
    }

    try {
      this._handleEndEntryModals(prevRenderedState, premium);
    } catch (_) {
      /* silent */
    }

    try {
      syncDailyCountdownTicker(this);
    } catch (_) {
      /* silent */
    }
  };

  UI.prototype._handleEndEntryModals = function (prevRenderedState, premium) {
    const enteredEnd =
      this.state === STATES.END && prevRenderedState !== STATES.END;

    // Clean up game-over overlay as soon as we are no longer on PLAYING.
    // Goal: keep PLAYING frozen under the overlay, but never let the overlay leak onto END/LANDING/PAYWALL.
    if (this.state !== STATES.PLAYING) {
      try {
        hideChanceLostOverlay();
      } catch (_) {
        /* silent */
      }
    }

    if (!enteredEnd) return;

    const lastRun = this._runtime?.lastRun || {};
    const mode = String(lastRun.mode || '').trim();
    const enteredKnownEndMode = [
      MODES.RUN,
      MODES.PRACTICE,
      MODES.BONUS
    ].includes(mode);

    if (!enteredKnownEndMode) return;

    const delayMsRaw = Number(this.config?.ui?.endAutoModalDelayMs);
    const delayMs =
      Number.isFinite(delayMsRaw) && delayMsRaw >= 0 && delayMsRaw <= 4000
        ? Math.floor(delayMsRaw)
        : null;

    if (delayMs == null) return;

    if (this._runtime?.endAutoModalTimerId) {
      clearRuntimeTimer(this, 'endAutoModalTimerId');
      this._runtime.endAutoModalTimerId = null;
    }

    setRuntimeTimer(
      this,
      'endAutoModalTimerId',
      () => {
        try {
          if (this._runtime) this._runtime.endAutoModalTimerId = null;
          if (this.state !== STATES.END) return;

          const run = this._runtime?.lastRun || {};
          const runMode = String(run.mode || '').trim();
          if (![MODES.RUN, MODES.PRACTICE, MODES.BONUS].includes(runMode))
            return;

          const isRun = runMode === MODES.RUN;
          const poolCompleteCelebration =
            isRun && !!run.poolCompleteCelebration;

          const modalOpen0 = !!(
            this.modalEl && !this.modalEl.classList.contains('wt-hidden')
          );

          // Pool complete modal
          if (poolCompleteCelebration && !modalOpen0) {
            this.openPoolCompleteModal();
            return;
          }

          // Discovery milestones: END-only, RUN-only, not when pool is exhausted.
          // Show at most one modal per END entry, prioritizing the highest reached threshold.
          try {
            const modalOpen1 = !!(
              this.modalEl && !this.modalEl.classList.contains('wt-hidden')
            );

            if (isRun && !poolCompleteCelebration && !modalOpen1) {
              const poolSize = clampInt(this.config?.game?.poolSize, 0, 9999);

              const thresholds = Array.isArray(
                this.config?.postCompletion?.milestoneThresholds
              )
                ? this.config.postCompletion.milestoneThresholds
                : null;

              const uniqueSeen =
                this.storage &&
                typeof this.storage.getUniqueSeenCount === 'function'
                  ? clampInt(this.storage.getUniqueSeenCount(), 0, 999999)
                  : 0;

              const exhausted = !!(
                this.storage &&
                typeof this.storage.isPoolExhausted === 'function' &&
                this.storage.isPoolExhausted() === true
              );
              if (!exhausted && poolSize > 0 && Array.isArray(thresholds)) {
                const milestoneChecks = [
                  {
                    key: 'threeQuarters',
                    index: 2,
                    hasFn: 'hasThreeQuartersMilestoneShown'
                  },
                  {
                    key: 'halfway',
                    index: 1,
                    hasFn: 'hasHalfwayMilestoneShown'
                  },
                  {
                    key: 'quarter',
                    index: 0,
                    hasFn: 'hasQuarterMilestoneShown'
                  }
                ];

                for (const item of milestoneChecks) {
                  const rawPct = Number(thresholds[item.index]);
                  const pct =
                    Number.isFinite(rawPct) && rawPct > 0 && rawPct < 1
                      ? rawPct
                      : null;
                  const threshold =
                    pct != null ? Math.floor(poolSize * pct) : 0;
                  const already = !!(
                    item.hasFn &&
                    this.storage &&
                    typeof this.storage[item.hasFn] === 'function' &&
                    this.storage[item.hasFn]() === true
                  );

                  if (threshold > 0 && uniqueSeen >= threshold && !already) {
                    this.openMilestoneModal(item.key);
                    return;
                  }
                }
              }
            }
          } catch (_) {
            /* silent */
          }

          // Free limit reached must be intentional:
          // gate on CTA click via startRun()/startRun(true), never auto-open on END.

          // Waitlist is now a stable LANDING block, not an END auto-modal.
        } catch (_) {
          /* silent */
        }
      },
      delayMs
    );
  };

  function renderLandingStatsCard(opts) {
    const badgeHtml = String(opts?.badgeHtml || '');
    const label = String(opts?.label || '').trim();
    const title = String(opts?.title || '').trim();
    const sub = String(opts?.sub || '').trim();
    const pct = clampInt(Number(opts?.pct), 0, 100);
    const progressClass = String(opts?.progressClass || '');

    if (!badgeHtml && !label && !title && !sub) return '';

    return `
      <div class="wt-landing-stats">
        ${badgeHtml}
        <div class="wt-landing-stat">
          ${label ? `<div class="wt-landing-stat__kicker">${escapeHtml(label)}</div>` : ``}
          ${title ? `<div class="wt-landing-stat__title">${escapeHtml(title)}</div>` : ``}
          ${sub ? `<div class="wt-meta wt-landing-stat__sub">${escapeHtml(sub)}</div>` : ``}
          <div class="wt-progress${progressClass}" aria-hidden="true">
            <div class="wt-progress__fill" data-pct="${pct}" style="width:${pct}%"></div>
          </div>
        </div>
      </div>
    `;
  }

  function renderEndCopyLine(text, cls) {
    const value = String(text || '').trim();
    if (!value) return '';
    return `<p class="${cls}">${escapeHtml(value)}</p>`;
  }

  UI.prototype._renderLanding = function () {
    if (
      !window.WT_UI_Landing ||
      typeof window.WT_UI_Landing.render !== 'function'
    ) {
      throw new Error('WT_UI_Landing.render missing');
    }
    return window.WT_UI_Landing.render(this, {
      escapeHtml,
      fillTemplate,
      clampInt,
      isPremiumNow,
      getRunTierInfo,
      getDailyChallengeModel,
      getAppLevelModel,
      getLandingStatsPreviewState,
      getRuleKnowledgePhaseContext,
      renderBrandingRow,
      renderTextWithStrong,
      renderIcon,
      hasSolvedSecretChestHint,
      mmss,
      renderLeaderboardLandingCard: function (ui) {
        if (
          !window.WT_UI_Leaderboard ||
          typeof window.WT_UI_Leaderboard.renderLandingCard !== 'function'
        )
          return '';
        return window.WT_UI_Leaderboard.renderLandingCard(ui, { escapeHtml });
      }
    });
  };

  function buildEndModeCopy(ctx) {
    const {
      isRun,
      isPractice,
      isBonus,
      cfg,
      bonusW,
      practiceW,
      end,
      scoreFP,
      totalPresented,
      seen,
      lastRun,
      vars,
      storage,
      runtime
    } = ctx;

    let endLineTpl = '';
    let bonusLevel = '';
    let bonusIdentityTpl = '';
    let bonusLensTpl = '';
    let practiceRepeatTierKey = '';
    let practiceStatsLineTpl = '';
    let practiceRepeatNoteTpl = '';
    let runVerdictKey = '';
    let runIdentityTpl = '';
    let runPoolCompleteLine2Tpl = '';
    let bonusDeckTier = '';
    let bonusRecoLine = '';

    if (isBonus) {
      const total = clampInt(totalPresented, 0, 99999);

      if (total > 0) {
        const accuracy = scoreFP / total;
        const tiers = Array.isArray(cfg?.secretBonus?.endTiers)
          ? cfg.secretBonus.endTiers
          : [];
        for (const t of tiers) {
          const key = String(t?.key || '').trim();
          const min = Number(t?.minAccuracy);
          if (!key || !Number.isFinite(min)) continue;
          if (accuracy >= min) {
            bonusLevel = key;
            break;
          }
        }
      }

      const deckTiers = Array.isArray(cfg?.secretBonus?.endDeckTiers)
        ? cfg.secretBonus.endDeckTiers
        : [];
      const seenCount = seen != null && Number.isFinite(seen) ? seen : 0;
      for (const dt of deckTiers) {
        const key = String(dt?.key || '').trim();
        const min = Number(dt?.minSeen);
        if (!key || !Number.isFinite(min)) continue;
        if (seenCount >= min) {
          bonusDeckTier = key;
          break;
        }
      }

      const byTier =
        bonusW && typeof bonusW === 'object' ? bonusW.endByTier : null;
      const lines =
        bonusLevel && Array.isArray(byTier?.[bonusLevel])
          ? byTier[bonusLevel]
          : null;
      endLineTpl =
        lines && lines.length === 2
          ? `${String(lines[0] || '').trim()} ${String(lines[1] || '').trim()}`.trim()
          : '';
      if (total > 0 && scoreFP === 0) {
        const zeroLine = String(bonusW?.endLineZero || '').trim();
        if (zeroLine) endLineTpl = zeroLine;
      }

      if (bonusLevel && bonusDeckTier) {
        const recoKey = `${bonusLevel}_${bonusDeckTier}`;
        bonusRecoLine = String(bonusW?.endRecoByTier?.[recoKey] || '').trim();
      }
    } else if (isPractice) {
      let practiceEndLineTpl = String(practiceW.endLine || '').trim();
      const practiceEndStatsTpl = String(practiceW.endStatsLine || '').trim();
      const practiceEndStatsAllFixedTpl = String(
        practiceW.endStatsLineAllFixed || ''
      ).trim();
      const rawMistakeCount = Array.isArray(lastRun.mistakeIds)
        ? lastRun.mistakeIds.length
        : 0;
      const total = clampInt(totalPresented, 0, 99999);
      const mistakeCount = clampInt(rawMistakeCount, 0, total);

      let remainingBacklog = null;
      try {
        if (storage && typeof storage.getActiveMistakesCount === 'function') {
          remainingBacklog = clampInt(
            storage.getActiveMistakesCount(),
            0,
            99999
          );
        }
      } catch (_) {
        remainingBacklog = null;
      }

      let backlogAtStart = clampInt(runtime?.practiceBacklogAtStart, 0, 99999);
      if (!backlogAtStart && remainingBacklog != null) {
        backlogAtStart = remainingBacklog + mistakeCount;
      }
      const fixedCount =
        remainingBacklog == null
          ? 0
          : clampInt(backlogAtStart - remainingBacklog, 0, backlogAtStart);

      vars.fixed = fixedCount;
      if (remainingBacklog != null) vars.remaining = remainingBacklog;

      if (remainingBacklog === 0) {
        const allFixedLine = String(practiceW.endLineAllFixed || '').trim();
        if (allFixedLine) practiceEndLineTpl = allFixedLine;
      }

      let repeatNote = '';
      try {
        const tiers = Array.isArray(cfg?.routing?.practiceRepeatTiers)
          ? cfg.routing.practiceRepeatTiers
          : null;

        if (
          tiers &&
          remainingBacklog != null &&
          remainingBacklog >= 1 &&
          fixedCount >= 1
        ) {
          for (const t of tiers) {
            const key = String(t?.key || '').trim();
            const rawMin = Number(t?.minRemaining);
            const min =
              Number.isFinite(rawMin) && rawMin >= 1
                ? Math.floor(rawMin)
                : null;
            if (!key || min == null) continue;
            if (remainingBacklog < min) continue;
            if (key === 'last' && remainingBacklog !== 1) continue;
            if (key === 'light' && fixedCount < remainingBacklog) continue;
            practiceRepeatTierKey = key;
            break;
          }
        }

        const tpl = practiceRepeatTierKey
          ? String(
              practiceW?.endRepeatNoteByTier?.[practiceRepeatTierKey] || ''
            ).trim()
          : '';
        if (tpl) repeatNote = tpl;
      } catch (_) {
        repeatNote = '';
        practiceRepeatTierKey = '';
      }

      if (practiceRepeatTierKey) {
        const tierLine = String(
          practiceW?.endLineByTier?.[practiceRepeatTierKey] || ''
        ).trim();
        if (tierLine) practiceEndLineTpl = tierLine;
      }
      if (total > 0 && scoreFP === 0 && remainingBacklog !== 0) {
        const zeroLine = String(practiceW?.endLineZero || '').trim();
        if (zeroLine) practiceEndLineTpl = zeroLine;
      }

      endLineTpl = practiceEndLineTpl;
      practiceStatsLineTpl =
        remainingBacklog === 0 && practiceEndStatsAllFixedTpl
          ? practiceEndStatsAllFixedTpl
          : practiceEndStatsTpl && remainingBacklog != null
            ? practiceEndStatsTpl
            : '';
      practiceRepeatNoteTpl = repeatNote;
    } else {
      if (isRun && !!lastRun.poolCompleteCelebration) {
        endLineTpl = String(end.poolCompleteLine1 || '').trim();
        runPoolCompleteLine2Tpl = String(end.poolCompleteLine2 || '').trim();
      } else {
        endLineTpl = String(end.endLine || '').trim();
      }

      runVerdictKey = getRunVerdictKeyFromScore(cfg, scoreFP);
      runIdentityTpl = String(
        end?.identityByVerdict?.[runVerdictKey] || ''
      ).trim();
      if (totalPresented > 0 && scoreFP === 0) {
        const zeroLine = String(end?.identityZero || '').trim();
        if (zeroLine) runIdentityTpl = zeroLine;
      }
    }

    return {
      endLineTpl,
      bonusLevel,
      bonusIdentityTpl,
      bonusLensTpl,
      practiceRepeatTierKey,
      practiceStatsLineTpl,
      practiceRepeatNoteTpl,
      runVerdictKey,
      runIdentityTpl,
      runPoolCompleteLine2Tpl,
      bonusDeckTier,
      bonusRecoLine
    };
  }

  function buildEndCopyHtml(ctx) {
    const {
      isRun,
      isPractice,
      isBonus,
      practiceStatsLineTpl,
      bonusStatsLine,
      runStatsLine,
      endLine,
      practiceRepeatNoteTpl,
      bonusDecisionLine,
      runIdentityTpl,
      freeRunMessage,
      premium,
      poolCompleteCelebration,
      runPoolCompleteLine2Tpl,
      end,
      vars
    } = ctx;

    const lines = [];

    if (isPractice) {
      const statsLine = practiceStatsLineTpl
        ? fillTemplate(practiceStatsLineTpl, vars)
        : '';
      const repeatLine = practiceRepeatNoteTpl
        ? fillTemplate(practiceRepeatNoteTpl, vars)
        : '';
      if (statsLine)
        lines.push(renderEndCopyLine(statsLine, 'wt-end-copy__stats'));
      if (endLine)
        lines.push(renderEndCopyLine(endLine, 'wt-end-copy__verdict'));
      if (repeatLine)
        lines.push(renderEndCopyLine(repeatLine, 'wt-end-copy__note'));
      return lines.join('');
    }

    if (isBonus) {
      if (bonusStatsLine)
        lines.push(renderEndCopyLine(bonusStatsLine, 'wt-end-copy__stats'));
      if (endLine)
        lines.push(renderEndCopyLine(endLine, 'wt-end-copy__verdict'));
      if (bonusDecisionLine)
        lines.push(renderEndCopyLine(bonusDecisionLine, 'wt-end-copy__note'));
      return lines.join('');
    }

    if (isRun) {
      const directToConsolidation = !!(
        poolCompleteCelebration && clampInt(vars.backlog, 0, 99999) === 0
      );
      const directToConsolidationLine = directToConsolidation
        ? String(end.directToConsolidationLine || '').trim()
        : '';

      if (runStatsLine)
        lines.push(renderEndCopyLine(runStatsLine, 'wt-end-copy__stats'));
      if (endLine)
        lines.push(renderEndCopyLine(endLine, 'wt-end-copy__verdict'));
      if (directToConsolidationLine)
        lines.push(
          renderEndCopyLine(directToConsolidationLine, 'wt-end-copy__note')
        );
      if (runIdentityTpl)
        lines.push(
          renderEndCopyLine(
            fillTemplate(runIdentityTpl, vars),
            'wt-end-copy__note'
          )
        );
      if (!premium && freeRunMessage)
        lines.push(renderEndCopyLine(freeRunMessage, 'wt-end-copy__free'));
      if (runPoolCompleteLine2Tpl && !directToConsolidation) {
        lines.push(
          renderEndCopyLine(
            fillTemplate(runPoolCompleteLine2Tpl, vars),
            'wt-end-copy__note'
          )
        );
      }
      return lines.join('');
    }

    if (endLine) lines.push(renderEndCopyLine(endLine, 'wt-end-copy__verdict'));
    return lines.join('');
  }

  function buildEndMistakesRecap(ctx) {
    const {
      isRun,
      isPractice,
      isBonus,
      lastRun,
      maxChances,
      bonusW,
      practiceW,
      end,
      runtime,
      ui,
      cfg,
      vars
    } = ctx;
    if (!isRun && !isPractice && !isBonus) return '';

    const rawIds = Array.isArray(lastRun.mistakeIds) ? lastRun.mistakeIds : [];
    const ids = isRun ? rawIds.slice(0, maxChances) : rawIds.slice();
    const recapW = isBonus
      ? bonusW || {}
      : isPractice
        ? practiceW || {}
        : end || {};

    const toggleTpl = String(
      recapW.mistakesToggle || end.mistakesToggle || ''
    ).trim();
    const title = String(
      recapW.mistakesTitle || end.mistakesTitle || ''
    ).trim();

    if (!ids.length) {
      return '';
    }

    const labelRaw = toggleTpl
      ? fillTemplate(toggleTpl, { count: String(ids.length) })
      : title;
    const label = String(labelRaw || '')
      .replace(/\(\s*\)/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!label) return '';

    const byId =
      runtime && runtime.contentById && typeof runtime.contentById === 'object'
        ? runtime.contentById
        : {};

    const items = [];
    for (const rawId of ids) {
      const id = Number(rawId);
      if (!Number.isFinite(id)) continue;
      const it = byId[String(id)] || null;
      const t = extractTermsFromItem(it);
      const questionText = String(t.question || '').trim();
      if (!questionText) continue;

      const answerLabel =
        t.correctAnswer === true
          ? String(ui.trueLabel || '').trim()
          : t.correctAnswer === false
            ? String(ui.falseLabel || '').trim()
            : '';

      const expl = String(t.explanationShort || '').trim();
      const pairHtml = answerLabel
        ? `<span class="wt-mistake-pair">${escapeHtml(questionText)} <strong>(${escapeHtml(answerLabel)})</strong></span>`
        : `<span class="wt-mistake-pair">${escapeHtml(questionText)}</span>`;
      const explHtml = expl
        ? `<span class="wt-mistake-expl">${formatExplanationForDisplay(expl, cfg, questionText)}</span>`
        : '';
      items.push(`<div class="wt-mistake-item">${pairHtml}${explHtml}</div>`);
    }

    const openAttr = vars && Number(vars.backlog) > 0 ? ' open' : '';
    return `
  <details class="wt-accordion"${openAttr}>
    <summary class="wt-accordion-toggle">${renderIcon('chevron-right')}<span>${escapeHtml(label)}</span></summary>
    <div class="wt-accordion-content">${items.join('')}</div>
  </details>
`;
  }

  function buildEndMicroLines(ctx) {
    const {
      isRun,
      premium,
      end,
      runtime,
      pbLine,
      poolCompleteCelebration,
      runIdentityTpl,
      vars,
      pbPremiumHint,
      freeRunMessage,
      lastRun,
      wording,
      streakLine,
      tierLine,
      tierNextLine,
      dailyChallengeLine,
      beatBestLine
    } = ctx;

    const microLines = [];

    if (isRun) {
      // Product choice:
      // for RUN, the top 3 micro-lines are intentionally a tight motivation stack
      // (beat your best, best streak, daily challenge). If none of these are available,
      // we deliberately fall back to category insights, then older PB/tier/support lines
      // instead of leaving the END summary empty.
      if (beatBestLine)
        microLines.push(
          `<p class="wt-meta wt-truncate">${escapeHtml(beatBestLine)}</p>`
        );
      if (streakLine)
        microLines.push(
          `<p class="wt-meta wt-truncate">${escapeHtml(streakLine)}</p>`
        );
      if (dailyChallengeLine)
        microLines.push(
          `<p class="wt-meta wt-truncate">${escapeHtml(dailyChallengeLine)}</p>`
        );

      if (microLines.length) {
        return `
    <div class="wt-end-table">
      ${microLines
        .slice(0, 3)
        .map((line) => `<div class="wt-end-table__row">${line}</div>`)
        .join('')}
    </div>
  `;
      }

      const strongestTagTpl = String(end?.strongestTagLine || '').trim();
      const weakestTagTpl = String(end?.weakestTagLine || '').trim();
      const copyByTag =
        end && typeof end.endTagHighlights === 'object'
          ? end.endTagHighlights
          : null;
      const runMistakeIds = Array.isArray(lastRun?.mistakeIds)
        ? lastRun.mistakeIds
        : [];
      const runItemIds = Array.isArray(lastRun?.runItemIds)
        ? lastRun.runItemIds
        : [];
      const correctAnswers = clampInt(
        runItemIds.length - runMistakeIds.length,
        0,
        99999
      );
      const allowCategoryInsights = correctAnswers >= 5;
      const byId =
        runtime &&
        runtime.contentById &&
        typeof runtime.contentById === 'object'
          ? runtime.contentById
          : {};
      const ignored = new Set([
        'Easy',
        'Medium',
        'Intermediate',
        'Hard',
        'Singles',
        'Doubles',
        'Tournament',
        'Both',
        'Singles only',
        'Doubles only'
      ]);
      const formatEndTag = (tag) => {
        const raw = String(tag || '').trim();
        if (!raw) return '';
        const tagLabels =
          wording &&
          wording.common &&
          typeof wording.common.tagLabels === 'object'
            ? wording.common.tagLabels
            : null;
        if (
          tagLabels &&
          typeof tagLabels[raw] === 'string' &&
          tagLabels[raw].trim()
        ) {
          return tagLabels[raw].trim();
        }
        return raw.replace(/_/g, ' ');
      };

      let strongestShown = false;
      let weakestShown = false;

      if (
        allowCategoryInsights &&
        runItemIds.length > 0 &&
        (strongestTagTpl || weakestTagTpl)
      ) {
        const servedCounts = Object.create(null);
        const mistakeCounts = Object.create(null);

        for (const rawId of runItemIds) {
          const item = byId[String(rawId)] || byId[rawId] || null;
          const tags = extractTagsFromItem(item).filter((t) => !ignored.has(t));
          for (const tag of tags) {
            servedCounts[tag] = clampInt(
              Number(servedCounts[tag] || 0) + 1,
              0,
              9999
            );
          }
        }

        for (const rawId of runMistakeIds) {
          const item = byId[String(rawId)] || byId[rawId] || null;
          const tags = extractTagsFromItem(item).filter((t) => !ignored.has(t));
          for (const tag of tags) {
            mistakeCounts[tag] = clampInt(
              Number(mistakeCounts[tag] || 0) + 1,
              0,
              9999
            );
          }
        }

        let strongestTag = '';
        let strongestCount = 0;
        let strongestTie = false;
        let weakestTag = '';
        let weakestCount = 0;
        let weakestTie = false;

        for (const tag in servedCounts) {
          const served = clampInt(Number(servedCounts[tag] || 0), 0, 9999);
          const missed = clampInt(Number(mistakeCounts[tag] || 0), 0, 9999);
          const correct = clampInt(served - missed, 0, 9999);

          if (correct > strongestCount) {
            strongestTag = tag;
            strongestCount = correct;
            strongestTie = false;
          } else if (correct > 0 && correct === strongestCount) {
            strongestTie = true;
          }

          if (missed > weakestCount) {
            weakestTag = tag;
            weakestCount = missed;
            weakestTie = false;
          } else if (missed > 0 && missed === weakestCount) {
            weakestTie = true;
          }
        }

        if (
          !strongestTie &&
          strongestCount > 0 &&
          strongestTag &&
          strongestTagTpl
        ) {
          microLines.push(
            `<p class="wt-meta wt-truncate">${escapeHtml(fillTemplate(strongestTagTpl, { tag: formatEndTag(strongestTag) }))}</p>`
          );
          strongestShown = true;
        }

        if (!weakestTie && weakestCount > 0 && weakestTag && weakestTagTpl) {
          microLines.push(
            `<p class="wt-meta wt-truncate">${escapeHtml(fillTemplate(weakestTagTpl, { tag: formatEndTag(weakestTag) }))}</p>`
          );
          weakestShown = true;
        }
      }

      if (
        allowCategoryInsights &&
        !strongestShown &&
        !weakestShown &&
        copyByTag &&
        runMistakeIds.length > 0
      ) {
        const counts = Object.create(null);

        for (const rawId of runMistakeIds) {
          const item = byId[String(rawId)] || byId[rawId] || null;
          const tags = extractTagsFromItem(item).filter((t) => !ignored.has(t));
          for (const tag of tags) {
            counts[tag] = clampInt(Number(counts[tag] || 0) + 1, 0, 9999);
          }
        }

        let bestTag = '';
        let bestCount = 0;
        let tie = false;
        for (const tag in counts) {
          const n = clampInt(Number(counts[tag] || 0), 0, 9999);
          if (n > bestCount) {
            bestTag = tag;
            bestCount = n;
            tie = false;
          } else if (n > 0 && n === bestCount) {
            tie = true;
          }
        }

        if (!tie && bestCount >= 1) {
          const line = String(copyByTag[bestTag] || '').trim();
          if (line)
            microLines.push(
              `<p class="wt-meta wt-truncate">${escapeHtml(line)}</p>`
            );
        }
      }
    }

    if (pbLine)
      microLines.push(
        `<p class="wt-meta wt-truncate">${escapeHtml(pbLine)}</p>`
      );
    if (pbPremiumHint)
      microLines.push(
        `<p class="wt-meta wt-truncate">${escapeHtml(pbPremiumHint)}</p>`
      );
    if (streakLine)
      microLines.push(
        `<p class="wt-meta wt-truncate">${escapeHtml(streakLine)}</p>`
      );
    if (tierLine)
      microLines.push(
        `<p class="wt-meta wt-truncate">${escapeHtml(tierLine)}</p>`
      );
    if (tierNextLine)
      microLines.push(
        `<p class="wt-meta wt-truncate">${escapeHtml(tierNextLine)}</p>`
      );
    if (dailyChallengeLine)
      microLines.push(
        `<p class="wt-meta wt-truncate">${escapeHtml(dailyChallengeLine)}</p>`
      );
    if (beatBestLine)
      microLines.push(
        `<p class="wt-meta wt-truncate">${escapeHtml(beatBestLine)}</p>`
      );

    return microLines.length
      ? `
    <div class="wt-end-table">
      ${microLines
        .slice(0, 3)
        .map((line) => `<div class="wt-end-table__row">${line}</div>`)
        .join('')}
    </div>
  `
      : '';
  }

  function buildEndShareBlock(ctx) {
    const { shareEnabled, w, shareTitle, getShareText } = ctx;
    if (!shareEnabled) return '';

    const share = w.share || {};
    const title = String(shareTitle || '').trim();
    const ctaLabel = String(share.ctaLabel || '').trim();
    const emailLabel = String(share.emailLabel || '').trim();
    const emailSubject = String(share.emailSubject || '').trim();
    const shareAria = String(w.system?.shareAria || '').trim();
    const text = String(getShareText ? getShareText() : '').trim();

    const canCopy = !!(ctaLabel && text);
    const canEmail = !!(emailLabel && emailSubject && text);

    if (!title && !text) return '';
    if (!canCopy && !canEmail && !text) return '';

    return `
      <details class="wt-accordion">
        <summary class="wt-accordion-toggle" aria-label="${escapeHtml(shareAria)}">
          ${renderIcon('chevron-right')}<span>${escapeHtml(title)}</span>
        </summary>

        <div class="wt-accordion-content">
          ${text ? `<p class="wt-muted wt-text-wrap-anywhere">${escapeHtml(text)}</p>` : ``}

          ${
            canCopy || canEmail
              ? `
            <div class="wt-actions">
              ${
                canCopy
                  ? `
                <button type="button" class="wt-btn wt-btn--secondary" data-action="copy-share">
                  ${escapeHtml(ctaLabel)}
                </button>
              `
                  : ``
              }

              ${
                canEmail
                  ? `
                <button type="button" class="wt-btn wt-btn--secondary" data-action="send-share-email">
                  ${escapeHtml(emailLabel)}
                </button>
              `
                  : ``
              }
            </div>
          `
              : ``
          }
        </div>
      </details>
    `;
  }

  function getRuleKnowledgePhaseContext(input) {
    const cfg = input && input.cfg ? input.cfg : {};
    const w = input && input.w ? input.w : {};
    const storage = input && input.storage ? input.storage : null;
    const landing = w.landing || {};

    const poolSize = clampInt(input?.poolSize, 0, 99999);

    let seen = clampInt(input?.seen, 0, 99999);
    if (!seen && storage && typeof storage.getUniqueSeenCount === 'function') {
      try {
        seen = clampInt(storage.getUniqueSeenCount(), 0, 99999);
      } catch (_) {
        seen = 0;
      }
    }

    let mistakes = clampInt(input?.mistakes, 0, 99999);
    if (
      input?.mistakes == null &&
      storage &&
      typeof storage.getActiveMistakesCount === 'function'
    ) {
      try {
        mistakes = clampInt(storage.getActiveMistakesCount(), 0, 99999);
      } catch (_) {
        mistakes = 0;
      }
    }

    const isComplete = poolSize > 0 && seen >= poolSize;
    const mastered = clampInt(poolSize - mistakes, 0, poolSize);
    const key = !isComplete
      ? 'discovery'
      : mistakes > 0
        ? 'correction'
        : 'consolidation';

    const phaseW =
      w.phaseJourney && typeof w.phaseJourney === 'object'
        ? w.phaseJourney[key] || {}
        : {};
    const fallbackBadge =
      key === 'discovery'
        ? String(landing.statsPhaseBadgeDiscovery || '').trim()
        : key === 'correction'
          ? String(landing.statsPhaseBadgeCorrection || '').trim()
          : String(landing.statsPhaseBadgeConsolidation || '').trim();

    return {
      key,
      seen,
      mistakes,
      mastered,
      isComplete,
      badge: String(phaseW.badge || fallbackBadge || '').trim(),
      landingSummaryTemplate: String(
        phaseW.landingSummaryTemplate || ''
      ).trim(),
      landingDetail: String(phaseW.landingDetail || '').trim(),
      landingDetailTemplate: String(phaseW.landingDetailTemplate || '').trim(),
      endLens: String(phaseW.endLens || '').trim(),
      micropics:
        phaseW.micropics && typeof phaseW.micropics === 'object'
          ? phaseW.micropics
          : {}
    };
  }

  function getLandingStatsPreviewState(cfg, poolSize) {
    const statsCfg =
      cfg?.landingStats && typeof cfg.landingStats === 'object'
        ? cfg.landingStats
        : null;
    const previewCfg =
      statsCfg?.preview && typeof statsCfg.preview === 'object'
        ? statsCfg.preview
        : null;

    if (!previewCfg || previewCfg.enabled !== true) return null;

    const paramName = String(previewCfg.queryParam || '').trim();
    if (!paramName || typeof window === 'undefined' || !window.location)
      return null;

    let raw = '';
    try {
      raw = String(
        new URLSearchParams(window.location.search).get(paramName) || ''
      )
        .trim()
        .toLowerCase();
    } catch (_) {
      raw = '';
    }
    if (!raw) return null;

    const states =
      previewCfg.states && typeof previewCfg.states === 'object'
        ? previewCfg.states
        : null;
    const state = states ? states[raw] : null;
    if (!state || typeof state !== 'object') return null;

    const safePoolSize = clampInt(poolSize, 1, 99999);

    function resolvePreviewInt(value) {
      const rawValue = String(value || '').trim();
      if (rawValue === 'poolSize') return safePoolSize;
      return clampInt(value, 0, safePoolSize);
    }

    return {
      seen: resolvePreviewInt(state.seen),
      mistakes: resolvePreviewInt(state.mistakes)
    };
  }

  function getConfiguredMaxLevel(cfg) {
    const raw = Number(cfg?.levels?.maxLevel);
    if (!Number.isFinite(raw)) return 4;
    const n = Math.floor(raw);
    if (n < 1 || n > 20) return 4;
    return n;
  }

  function getLevelPreviewState(cfg) {
    const previewCfg =
      cfg?.levels?.preview && typeof cfg.levels.preview === 'object'
        ? cfg.levels.preview
        : null;
    if (!previewCfg || previewCfg.enabled !== true)
      return { currentLevel: null, unlockedLevel: 0, justUnlocked: false };

    const paramName = String(previewCfg.queryParam || '').trim();
    if (!paramName || typeof window === 'undefined' || !window.location) {
      return { currentLevel: null, unlockedLevel: 0, justUnlocked: false };
    }

    let raw = '';
    try {
      raw = String(
        new URLSearchParams(window.location.search).get(paramName) || ''
      )
        .trim()
        .toLowerCase();
    } catch (_) {
      raw = '';
    }
    if (!raw)
      return { currentLevel: null, unlockedLevel: 0, justUnlocked: false };

    const maxLevel = getConfiguredMaxLevel(cfg);

    if (raw === 'none')
      return { currentLevel: 0, unlockedLevel: 0, justUnlocked: false };

    const unlockMatch = raw.match(/^unlock(\d+)$/);
    if (unlockMatch) {
      const lvl = clampInt(unlockMatch[1], 0, maxLevel);
      return { currentLevel: lvl, unlockedLevel: lvl, justUnlocked: true };
    }

    const levelMatch = raw.match(/^level(\d+)$/);
    if (levelMatch) {
      const lvl = clampInt(levelMatch[1], 0, maxLevel);
      return { currentLevel: lvl, unlockedLevel: 0, justUnlocked: false };
    }

    return { currentLevel: null, unlockedLevel: 0, justUnlocked: false };
  }

  function getAppLevelModel(storage, cfg, w) {
    const levelsW =
      w && w.levels && typeof w.levels === 'object' ? w.levels : {};
    const maxLevel = getConfiguredMaxLevel(cfg);
    const emptyUnlocked = {};
    for (let level = 1; level <= maxLevel; level += 1) emptyUnlocked[level] = 0;

    const baseState =
      storage && typeof storage.getLevelState === 'function'
        ? storage.getLevelState()
        : { currentLevel: 0, unlockedAtByLevel: emptyUnlocked };
    const preview = getLevelPreviewState(cfg);
    const effectiveLevel =
      preview.currentLevel == null
        ? clampInt(baseState.currentLevel, 0, maxLevel)
        : clampInt(preview.currentLevel, 0, maxLevel);

    const defs = Array.from({ length: maxLevel }, (_, index) => index + 1).map((level) => {
      const raw =
        levelsW.byLevel && typeof levelsW.byLevel === 'object'
          ? levelsW.byLevel[level] || {}
          : {};
      return {
        level,
        label: String(raw.label || '').trim(),
        unlock: String(raw.unlock || '').trim(),
        sheetBody: String(raw.sheetBody || '').trim(),
        unlocked: effectiveLevel >= level,
        current: effectiveLevel === level
      };
    });

    return {
      state: {
        currentLevel: effectiveLevel,
        unlockedAtByLevel: baseState.unlockedAtByLevel || {}
      },
      defs,
      current: defs.find((item) => item.level === effectiveLevel) || null,
      next: defs.find((item) => item.level === effectiveLevel + 1) || null,
      levelsW,
      preview,
      maxLevel
    };
  }

  function buildEndActionsHtml(ctx) {
    const {
      storage,
      w,
      cfg,
      vars,
      premium,
      end,
      postW,
      isRun,
      isPractice,
      isBonus,
      runShouldPromotePractice,
      practiceCta,
      runsExhausted,
      upgradeCta,
      runPlayAgain,
      runShouldPromoteBonus,
      runBonusPrimaryLabel,
      canPractice,
      practiceAgain,
      bonusW,
      bonusDeckTier,
      bonusAgain,
      poolCompleteCelebration,
      seen,
      poolSize,
      dailyChallengeIncomplete,
      dailyChallengeNeedsReplayReward,
      dailyChallengeCta
    } = ctx;

    const exhausted = !!(
      storage &&
      typeof storage.isPoolExhausted === 'function' &&
      storage.isPoolExhausted() === true
    );
    const mastered = !!(
      storage &&
      typeof storage.isMastered === 'function' &&
      storage.isMastered() === true
    );
    const hasActiveMistakes = clampInt(vars.backlog, 0, 99999) > 0;

    const masteredTitle = String(postW.masteredTitle || '').trim();
    const masteredL1 = String(postW.masteredLine1 || '').trim();
    const masteredL2 = String(postW.masteredLine2 || '').trim();
    const masteredHtml =
      mastered && (masteredTitle || masteredL1 || masteredL2)
        ? `
        <div class="wt-end-mastered-copy wt-stack wt-stack--xs">
          ${masteredTitle ? `<p class="wt-meta"><strong>${escapeHtml(masteredTitle)}</strong></p>` : ``}
          ${masteredL1 ? `<p class="wt-muted">${escapeHtml(masteredL1)}</p>` : ``}
          ${masteredL2 ? `<p class="wt-muted">${escapeHtml(masteredL2)}</p>` : ``}
        </div>
      `
        : ``;

    let primaryAction = '';
    let primaryLabel = '';
    let secondaryAction = '';
    let secondaryLabel = '';

    if (mastered) {
      primaryAction = 'start-secret-bonus';
      primaryLabel = String(postW.masteredCtaBonus || '').trim();
      secondaryAction = 'start-run';
      secondaryLabel = String(postW.masteredCtaReplay || '').trim();
    } else if (exhausted && hasActiveMistakes) {
      primaryAction = 'start-practice';
      const tpl = premium
        ? String(end.practiceCtaCountPremium || '').trim()
        : String(end.practiceCta || '').trim();
      primaryLabel = tpl
        ? fillTemplate(tpl, { backlog: String(vars.backlog) })
        : '';
      secondaryAction = 'start-run';
      secondaryLabel = String(end.playAgain || '').trim();
    } else if (isRun) {
      if (runShouldPromotePractice) {
        primaryAction = 'start-practice';
        primaryLabel = String(practiceCta || '').trim();
        secondaryAction = runsExhausted ? 'open-paywall' : 'start-run';
        secondaryLabel = runsExhausted
          ? String(upgradeCta || '').trim()
          : String(runPlayAgain || '').trim();
      } else if (runShouldPromoteBonus) {
        primaryAction = 'start-secret-bonus';
        primaryLabel = runBonusPrimaryLabel;
        secondaryAction = runsExhausted ? 'open-paywall' : 'start-run';
        secondaryLabel = runsExhausted
          ? String(upgradeCta || '').trim()
          : String(runPlayAgain || '').trim();
      } else {
        primaryAction = runsExhausted ? 'open-paywall' : 'start-run';
        primaryLabel = runsExhausted
          ? String(upgradeCta || '').trim()
          : String(runPlayAgain || '').trim();
        if (canPractice) {
          secondaryAction = 'start-practice';
          secondaryLabel = String(practiceCta || '').trim();
        }
      }
    } else if (isPractice) {
      const remaining = Number(vars.remaining);
      const isZero = Number.isFinite(remaining) && remaining <= 0;
      if (isZero) {
        primaryAction = 'start-run';
        primaryLabel = String(end.playAgain || '').trim();
      } else {
        primaryAction = 'start-practice';
        primaryLabel = String(practiceAgain || '').trim();
        secondaryAction = 'start-run';
        secondaryLabel = String(end.playAgain || '').trim();
      }
    } else if (isBonus) {
      const expandDeckLabel = String(bonusW?.ctaExpandDeck || '').trim();
      const shouldExpandDeck = bonusDeckTier === 'small' && !!expandDeckLabel;
      if (shouldExpandDeck) {
        primaryAction = 'start-run';
        primaryLabel = expandDeckLabel;
        secondaryAction = 'start-secret-bonus';
        secondaryLabel = String(bonusAgain || '').trim();
      } else {
        primaryAction = 'start-secret-bonus';
        primaryLabel = String(bonusAgain || '').trim();
        secondaryAction = 'start-run';
        secondaryLabel = String(end.playAgain || '').trim();
      }
    }

    if (
      isRun &&
      !runsExhausted &&
      dailyChallengeNeedsReplayReward === true &&
      dailyChallengeCta &&
      primaryAction === 'start-run'
    ) {
      primaryAction = 'start-daily-challenge';
      primaryLabel = String(dailyChallengeCta || '').trim();
    }

    if (
      isRun &&
      !runsExhausted &&
      dailyChallengeIncomplete === true &&
      dailyChallengeCta &&
      primaryAction !== 'start-run' &&
      !secondaryAction &&
      !secondaryLabel
    ) {
      secondaryAction = 'start-daily-challenge';
      secondaryLabel = String(dailyChallengeCta || '').trim();
    }

    if (!primaryLabel || !primaryAction) return masteredHtml || ``;

    const secondaryBtn =
      secondaryLabel && secondaryAction
        ? `
        <button class="wt-btn wt-btn--secondary" data-action="${escapeHtml(secondaryAction)}">
          ${escapeHtml(secondaryLabel)}
        </button>
      `
        : ``;

    return `
  ${masteredHtml}
  <button class="wt-btn wt-btn--primary" data-action="${escapeHtml(primaryAction)}">
    ${escapeHtml(primaryLabel)}
  </button>
  ${secondaryBtn}
`;
  }

  UI.prototype._renderEnd = function () {
    if (!window.WT_UI_End || typeof window.WT_UI_End.render !== 'function') {
      throw new Error('WT_UI_End.render missing');
    }
    return window.WT_UI_End.render(this, {
      buildEndModeCopy,
      buildEndCopyHtml,
      buildEndMistakesRecap,
      buildEndMicroLines,
      buildEndShareBlock,
      buildEndActionsHtml,
      getRunTierInfo,
      getDailyChallengeModel,
      getAppLevelModel,
      renderBrandingRow,
      renderIcon,
      hasSolvedSecretChestHint,
      isPremiumNow,
      clampInt,
      fillTemplate,
      escapeHtml,
      MODES
    });
  };

  UI.prototype._renderPlaying = function () {
    const wAll = this.wording || {};
    const w = wAll.playing || {};
    const ui = wAll.ui || {};
    const cfg = this.config || {};
    const premium = isPremiumNow(this.storage);
    // Get live state from game engine
    const gameState = this.game.getState ? this.game.getState() : {};

    // Contract: PRACTICE has null chances → respect null (no fallback to config)
    const maxChancesRaw = gameState.maxChances;
    const maxChances =
      maxChancesRaw != null
        ? Number(maxChancesRaw)
        : Number(cfg.game?.maxChances);
    const chancesLeftRaw = gameState.chancesLeft;
    const chancesLeft = chancesLeftRaw != null ? Number(chancesLeftRaw) : NaN;
    const hasChances =
      chancesLeftRaw != null &&
      Number.isFinite(maxChances) &&
      maxChances > 0 &&
      Number.isFinite(chancesLeft);
    const scoreFP = Number(gameState.scoreFP);

    const scoreLabel = String(ui.scoreLabel || '').trim();

    const fpShort = String(ui.fpShort || '').trim();
    const scoreAriaTpl = String(ui.scoreAriaTemplate || '').trim();

    // HUD policy: do NOT show FP in PLAYING (unit is explicit in END only).
    // We still replace {fpShort} in aria templates to avoid leaking "{fpShort}".
    const scoreAria = scoreAriaTpl
      ? fillTemplate(scoreAriaTpl, { scoreLabel, score: scoreFP, fpShort: '' })
          .replace(/\s+/g, ' ')
          .trim()
      : '';

    // Personal best (HUD anchor): show for everyone if explicitly enabled + a best exists
    const bestLabel = String(ui?.bestScoreLabel || '').trim();
    const bestAriaTpl = String(ui?.bestScoreAriaTemplate || '').trim();

    const pbCfg =
      cfg?.personalBest && typeof cfg.personalBest === 'object'
        ? cfg.personalBest
        : null;
    const pbEnabled = !!(pbCfg && pbCfg.enabled === true);

    const modeNow = String(this._runtime?.runMode || 'RUN').trim();

    let bestScoreFP = null;
    if (pbEnabled && this.storage) {
      try {
        if (
          modeNow === 'BONUS' &&
          typeof this.storage.getBonusBest === 'function'
        ) {
          const bb = this.storage.getBonusBest() || null;
          const b = Number(bb?.bestScoreFP);
          if (Number.isFinite(b) && b > 0) bestScoreFP = Math.floor(b);
        } else if (typeof this.storage.getPersonalBest === 'function') {
          const pb = this.storage.getPersonalBest() || null;
          const b = Number(pb?.bestScoreFP);
          if (Number.isFinite(b) && b > 0) bestScoreFP = Math.floor(b);
        }
      } catch (_) {
        bestScoreFP = null;
      }
    }

    const bestAria =
      bestScoreFP != null && bestAriaTpl
        ? fillTemplate(bestAriaTpl, { best: bestScoreFP })
            .replace(/\s+/g, ' ')
            .trim()
        : '';

    const scoreAriaFull = [scoreAria, bestAria]
      .filter(Boolean)
      .join(' ')
      .trim();

    // Header (score left, best/lives right)
    const pulseAt = Number(this._runtime?.chanceLostPulseAt || 0);
    // Expected: WT_CONFIG.ui.gameplayPulseMs (number, milliseconds)
    const pulseMs = Number(cfg?.ui?.gameplayPulseMs);

    // Fail-closed: invalid/missing config => no pulse
    const pulseOn =
      pulseAt > 0 &&
      Number.isFinite(pulseMs) &&
      pulseMs > 0 &&
      Date.now() - pulseAt <= pulseMs;

    // Score flash: mirrors danger-pulse logic (correct answer â†’ green flash)
    const scoreFlashAt = Number(this._runtime?.scoreFlashAt || 0);
    const scoreFlashMs = Number(cfg?.ui?.gameplayPulseMs);
    const scoreFlashOn =
      scoreFlashAt > 0 &&
      Number.isFinite(scoreFlashMs) &&
      scoreFlashMs > 0 &&
      Date.now() - scoreFlashAt <= scoreFlashMs;

    // HUD deltas (arcade): +1 on score flash, +1 mistake on mistake pulse
    // Copy visible => WT_WORDING.ui (pas WT_CONFIG)
    const scoreDeltaText = String(ui?.scoreGainedDeltaText || '').trim();
    const scoreDeltaHtml =
      scoreFlashOn && scoreDeltaText
        ? `<span class="wt-pill__delta wt-pill__delta--score" aria-hidden="true">${escapeHtml(scoreDeltaText)}</span>`
        : '';

    const mistakeDeltaText = String(ui?.mistakeGainedDeltaText || '').trim();
    const mistakeDeltaHtml = pulseOn && mistakeDeltaText ? `` : '';

    const bonusBadge = String(this.wording?.secretBonus?.badge || '').trim();
    const practiceBadge = String(this.wording?.practice?.title || '').trim();

    // At-best (RUN + premium): one-shot pulse when you REACH the best during PLAYING.
    // UI-only: driven by this._runtime.atBestPulseAt (timestamp). Fail-closed => false.
    const atBestPulseAt = Number(this._runtime?.atBestPulseAt || 0);
    const atBestOn =
      atBestPulseAt > 0 &&
      Number.isFinite(pulseMs) &&
      pulseMs > 0 &&
      Date.now() - atBestPulseAt <= pulseMs;

    // New best (RUN + premium): celebration pulse when you EXCEED personal best during PLAYING (best -> best+1).
    const newBestPulseAt = Number(this._runtime?.newBestPulseAt || 0);
    const newBestOn =
      newBestPulseAt > 0 &&
      Number.isFinite(pulseMs) &&
      pulseMs > 0 &&
      Date.now() - newBestPulseAt <= pulseMs;

    // Near-best tension (RUN + premium only): subtle pulse when within 2 FP of personal best.
    // Priority: do NOT stack with score flash / at-best / new-best.
    const nearBestOn =
      !scoreFlashOn &&
      !atBestOn &&
      !newBestOn &&
      (modeNow === 'RUN' || modeNow === 'BONUS') &&
      pbEnabled === true &&
      premium === true &&
      bestScoreFP != null &&
      bestScoreFP > scoreFP &&
      bestScoreFP - scoreFP <= 2;

    const deckSizeRaw = Number(gameState?.deckSize);

    const secretBonusDeckCount =
      Number.isFinite(deckSizeRaw) && deckSizeRaw > 0
        ? Math.floor(deckSizeRaw)
        : null;

    const seenOnlyLine =
      secretBonusDeckCount != null
        ? fillTemplate(
            String(this.wording?.secretBonus?.seenOnlyLine || '').trim(),
            { count: secretBonusDeckCount }
          )
        : '';
    const servedSoFar = Array.isArray(this._runtime?.runItemIds)
      ? this._runtime.runItemIds.length
      : 0;

    const qHeadingTpl = String(w.questionHeadingTemplate || '').trim();
    const qNum =
      this._runtime?.feedbackPending === true ? servedSoFar : servedSoFar + 1;
    const headingHtml =
      qHeadingTpl && Number.isFinite(qNum) && qNum > 0
        ? `<p class="wt-muted wt-question-heading">${escapeHtml(fillTemplate(qHeadingTpl, { n: qNum }))}</p>`
        : '';

    const showSeenOnlyRule =
      modeNow === 'BONUS' &&
      this._runtime?.feedbackPending !== true &&
      !!seenOnlyLine;

    // --- Mistakes model ---
    const mistakesLabel = String(ui.mistakesLabel || '').trim();

    const mcInt =
      Number.isFinite(maxChances) && maxChances > 0
        ? Math.floor(maxChances)
        : 0;

    const leftInt = Number.isFinite(chancesLeft)
      ? Math.max(0, Math.floor(chancesLeft))
      : 0;

    const mistakesCount =
      mcInt > 0 ? Math.max(0, Math.min(mcInt, mcInt - leftInt)) : 0;

    const livesVisual =
      mcInt > 0
        ? Array(mcInt)
            .fill(null)
            .map((_, i) => {
              const isOn = i < mistakesCount;
              const isLast =
                isOn && mistakesCount > 0 && i === mistakesCount - 1;
              return `<span class="wt-hud-lives__dot${isOn ? '' : ' wt-hud-lives__dot--off'}${isLast ? ' wt-hud-lives__dot--last' : ''}" aria-hidden="true"></span>`;
            })
            .join('')
        : '';

    const correctStreak = clampInt(
      this._runtime?.microPics?.correctStreak,
      0,
      9999
    );
    const momentumMax = getMomentumSegments(cfg) || 6;
    const momentumLevel = clampInt(
      this._runtime?.microPics?.momentumLevel,
      0,
      momentumMax
    );
    const momentumState = getMomentumMeterState(
      cfg,
      correctStreak,
      modeNow,
      momentumLevel
    );

    const momentumHtml = momentumState
      ? `
        <div class="wt-momentum-wrap">
          <div class="wt-momentum" aria-label="${escapeHtml(fillTemplate(String(wAll?.system?.momentumAria || 'Momentum {filled}/{segments}'), { filled: momentumState.filled, segments: momentumState.segments }))}">
            ${Array(momentumState.segments)
              .fill(null)
              .map(
                (_, i) => `
              <span class="wt-momentum__seg${i < momentumState.filled ? ' wt-momentum__seg--on' : ''}${momentumState.filled === momentumState.segments && i === momentumState.segments - 1 ? ' wt-momentum__seg--max' : ''}" aria-hidden="true"></span>
            `
              )
              .join('')}
          </div>
          ${
            momentumState.streak > momentumState.segments
              ? `
            <span class="wt-momentum__combo" aria-hidden="true">${momentumState.streak}</span>
          `
              : ``
          }
        </div>
      `
      : '';

    const headerHtml = `
	   <div class="wt-hud">
          <div class="wt-hud__left">
            ${
              hasChances
                ? `
              <div class="wt-pill wt-hud-metric wt-hud-metric--mistakes wt-pill--chances${pulseOn ? ' wt-pill--danger-pulse' : ''}" aria-label="${escapeHtml(mistakesLabel)}: ${mistakesCount}/${mcInt}">
                ${mistakesLabel ? `<small>${escapeHtml(mistakesLabel)}</small>` : ``}
                ${mistakesCount}/${mcInt}${mistakeDeltaHtml}
                ${livesVisual}
              </div>
            `
                : ``
            }
            ${
              modeNow === 'PRACTICE' && practiceBadge
                ? `
              <div class="wt-pill wt-hud-metric wt-hud-metric--mode" aria-label="${escapeHtml(practiceBadge)}">
                <span>${escapeHtml(practiceBadge)}</span>
              </div>
            `
                : ``
            }
          </div>
          <div class="wt-hud__right">
          ${
            modeNow !== 'PRACTICE'
              ? `
            <div class="wt-pill wt-hud-metric wt-hud-metric--score wt-pill--score${scoreFlashOn ? ' wt-pill--score-flash' : ''}${atBestOn ? ' wt-pill--at-best' : ''}${newBestOn ? ' wt-pill--new-best' : ''}${nearBestOn ? ' wt-pill--near-best' : ''}"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              aria-label="${escapeHtml(scoreAriaFull)}">
              ${scoreLabel ? `<small>${escapeHtml(scoreLabel)}</small>` : ``}
              ${scoreFP}${scoreDeltaHtml}
              ${bestScoreFP != null && bestLabel ? `<span class="wt-pill__sub">${escapeHtml(bestLabel)} ${bestScoreFP}</span>` : ``}
            </div>
          `
              : ``
          }
          </div>
	    </div>

      ${momentumHtml}

	  	    ${
            showSeenOnlyRule
              ? `
	      <p class="wt-muted wt-playing-seenonly">
	        ${escapeHtml(seenOnlyLine)}
	      </p>
	    `
              : ``
          }
	  `;

    // Current item (question)
    const item = this._runtime.feedbackPending
      ? this._runtime.frozenItem
      : this.game.getCurrent
        ? this.game.getCurrent()
        : null;

    // Secret bonus fall: only if config is explicitly provided and valid.
    const sb = cfg?.secretBonus || {};
    const fall = sb && typeof sb === 'object' ? sb.fall : null;

    const fallEnabled =
      modeNow === 'BONUS' &&
      fall &&
      typeof fall === 'object' &&
      fall.enabled === true &&
      Number.isFinite(Number(fall.initialSpeed)) &&
      Number(fall.initialSpeed) > 0 &&
      Number.isFinite(Number(fall.maxSpeed)) &&
      Number(fall.maxSpeed) > 0 &&
      Number.isFinite(Number(fall.speedIncrement)) &&
      Number(fall.speedIncrement) >= 0 &&
      Number.isFinite(Number(fall.dangerThreshold)) &&
      Number(fall.dangerThreshold) > 0 &&
      Number(fall.dangerThreshold) < 1;

    const shellAttrs = [
      `data-wt-mode="${escapeHtml(modeNow.toLowerCase())}"`,
      `data-wt-state="playing"`
    ];
    if (fallEnabled) shellAttrs.push(`data-wt-bonus-layout="fall"`);

    const logoUrl = String(cfg?.identity?.uiLogoUrl || '').trim();
    const bonusTitle = String(this.wording?.secretBonus?.title || '').trim();
    const bonusSubtitle = String(
      this.wording?.secretBonus?.subtitle || ''
    ).trim();

    // PLAYING: branding always visible (Option A)
    // KISS: reuse the existing go-home action so BONUS can exit the same way as other modes.
    let brandingHtml = renderBrandingRow(cfg, true, false);

    if (modeNow === 'BONUS') {
      brandingHtml = `
        <div class="wt-bonus-branding">
          <div class="wt-bonus-branding__top">
            ${renderBrandingRow(cfg, true, false)}
          </div>
        </div>
              ${
                bonusSubtitle
                  ? `
          <p class="wt-muted wt-bonus-subtitle">
            ${escapeHtml(bonusSubtitle)}
          </p>
        `
                  : ``
              }
      `;
    }

    function renderShell(innerHtml) {
      return `
  <div class="wt-container" ${shellAttrs.join(' ')}>
    <div class="wt-playing-hero">
      ${brandingHtml}
      ${headingHtml}
      ${headerHtml}
    </div>
    ${innerHtml}
  </div>
`;
    }

    if (!item) {
      return renderShell(`
      <div class="wt-card">
        <p class="wt-muted">${escapeHtml(String(wAll.system?.loading || '').trim())}</p>
      </div>
    `);
    }

    const questionText = String(item.question || '').trim();
    const speechLocale = getQuestionSpeechLocale();
    const speechSupported = supportsQuestionSpeechForLocale(speechLocale);
    const speechKey = `${speechLocale}:${Number(item?.id || 0)}:${questionText}`;
    const isQuestionSpeaking =
      speechSupported &&
      this._runtime?.questionSpeechActive === true &&
      this._runtime?.questionSpeechKey === speechKey;
    const autoReadEnabled = isAutoReadQuestionsEnabled(this.storage);
    const speakLabel = String(wAll.system?.speakQuestion || '').trim();
    const replayLabel = String(
      wAll.system?.replayQuestion || speakLabel
    ).trim();
    const stopLabel = String(wAll.system?.stopQuestion || '').trim();
    const speakAria = String(
      wAll.system?.speakQuestionAria || speakLabel
    ).trim();
    const replayAria = String(
      wAll.system?.replayQuestionAria || replayLabel || speakAria
    ).trim();
    const stopAria = String(wAll.system?.stopQuestionAria || stopLabel).trim();
    const questionAudioHtml =
      speechSupported &&
      !this._runtime.feedbackPending &&
      (speakLabel || stopLabel)
        ? `
  <div class="wt-question-tools">
    <button
      type="button"
      class="wt-text-action wt-question-audio${isQuestionSpeaking ? ' wt-pulse' : ''}"
      data-action="toggle-question-audio"
      aria-pressed="${isQuestionSpeaking ? 'true' : 'false'}"
      aria-label="${escapeHtml(isQuestionSpeaking ? stopAria : autoReadEnabled ? replayAria : speakAria)}"
    >
      ${renderIcon('volume-2')}
      <span>${escapeHtml(isQuestionSpeaking ? stopLabel || replayLabel || speakLabel : autoReadEnabled ? replayLabel || speakLabel : speakLabel)}</span>
    </button>
  </div>
`
        : '';

    const bonusPrompt = String(
      this.wording?.secretBonus?.questionPrompt || ''
    ).trim();

    // PRACTICE: calm progress line instead of assertion
    // RUN: always show assertion
    // BONUS: no assertion
    let questionPrompt = '';
    if (modeNow === 'PRACTICE') {
      const deckTotal =
        this.game && typeof this.game.getTotal === 'function'
          ? this.game.getTotal()
          : 0;
      const progressTpl = String(
        wAll.practice?.playingProgressLine || ''
      ).trim();
      questionPrompt =
        progressTpl && deckTotal > 0
          ? fillTemplate(progressTpl, { current: qNum, total: deckTotal })
          : '';
    } else if (modeNow !== 'BONUS') {
      questionPrompt = String(w.assertion || '').trim();
    }

    const questionHtml = `


${
  questionPrompt
    ? `
  <p class="wt-question-prompt">
    ${escapeHtml(questionPrompt)}
  </p>
`
    : ``
}
${questionAudioHtml}
<div class="wt-terms-box">
  <div class="wt-term-row">
    <span class="wt-term-word">${escapeHtml(questionText)}</span>
  </div>
</div>
`;

    syncAutoReadCurrentQuestion(this);

    // If feedback is pending but temporarily hidden (chance lost focus), show frozen item only (no choices).
    if (
      this._runtime.feedbackPending &&
      this._runtime.feedbackReveal !== true
    ) {
      return renderShell(`
      <div class="wt-card" role="status" aria-live="polite">
        ${questionHtml}
      </div>
    `);
    }

    // If feedback is pending, show feedback block
    if (this._runtime.feedbackPending && this._runtime.lastAnswer) {
      const ans = this._runtime.lastAnswer;
      const isCorrect = ans.isCorrect === true;
      const feedbackClass = isCorrect ? 'wt-feedback--ok' : 'wt-feedback--bad';

      const verdictText = isCorrect
        ? String(w.feedbackTitleOk || '').trim()
        : String(w.feedbackTitleBad || '').trim();

      // Show the correct answer label in the title (no fallback)
      const correctLabel =
        ans.correctAnswer === true
          ? String(ui.trueLabel || '').trim()
          : String(ui.falseLabel || '').trim();

      const titleLine =
        verdictText && correctLabel
          ? `${verdictText} - ${correctLabel}`
          : verdictText || correctLabel || '';

      // Optional clarity line: "You chose: <label>" (no fallback)
      const pickedLabel =
        ans.pickedAnswer === true
          ? String(ui.trueLabel || '').trim()
          : String(ui.falseLabel || '').trim();

      const youChosePrefix = String(wAll.system?.youChosePrefix || '').trim();
      const youChoseLine =
        youChosePrefix && pickedLabel ? `${youChosePrefix} ${pickedLabel}` : '';

      const continueCta = String(wAll.system?.continue || '').trim();
      const tapToContinue = String(wAll.system?.tapToContinue || '').trim();
      const autoGameOverAfterFeedback =
        this._runtime?.autoGameOverAfterFeedback === true;
      const feedbackActionAttr = autoGameOverAfterFeedback
        ? ` data-action="continue"`
        : '';

      // Stable explanation for the frozen item during feedback (KISS)
      const stableExplanation = String(ans.feedbackLine || '').trim();

      const explanationHtml = stableExplanation
        ? `<p class="wt-explanation">${formatExplanationForDisplay(stableExplanation, cfg, questionText)}</p>`
        : '';

      return renderShell(`
  <div class="wt-card" role="status" aria-live="polite"${feedbackActionAttr}>
    ${questionHtml}

    <div class="wt-feedback ${feedbackClass}">
      <strong class="wt-feedback-title">
                    ${escapeHtml(titleLine)}
      </strong>
      ${
        youChoseLine
          ? `
        <div class="wt-muted wt-feedback__subline">
          ${escapeHtml(youChoseLine)}
        </div>
      `
          : ``
      }
    </div>

            ${explanationHtml}


            ${
              !autoGameOverAfterFeedback
                ? `
      <div class="wt-actions wt-modal-actions wt-modal-actions--lg">
        <button class="wt-btn wt-btn--primary" data-action="continue">
          ${escapeHtml(continueCta)}
        </button>
      </div>
    `
                : ``
            }


    ${
      !autoGameOverAfterFeedback && shouldTapToContinue() && tapToContinue
        ? `
      <p class="wt-muted wt-tap-hint">
        ${escapeHtml(tapToContinue)}
      </p>
    `
        : ``
    }
  </div>
`);
    }

    const trueLabel = String(ui.trueLabel || '').trim();
    const falseLabel = String(ui.falseLabel || '').trim();

    // Default: show question with True/False buttons
    // Secret bonus fall adds semantic wrappers only (CSS decides fixed/no-scroll layout).
    const danger01 = fallEnabled ? Number(fall.dangerThreshold) : 0;

    const dangerLabel = fallEnabled
      ? String(this.wording?.secretBonus?.dangerLineLabel || '').trim()
      : '';
    const dangerAria = fallEnabled
      ? String(this.wording?.secretBonus?.dangerLineAria || '').trim()
      : '';

    return renderShell(`
    <div class="wt-card">
      ${
        fallEnabled
          ? `
        <div class="wt-bonus-lane" data-wt-bonus-lane>
          <div class="wt-bonus-fail-line" data-wt-bonus-fail style="top:${Math.round(danger01 * 100)}%"></div>
          ${
            dangerLabel
              ? `
            <div class="wt-bonus-fail-label" data-wt-bonus-fail-label style="top:${Math.round(danger01 * 100)}%" aria-label="${escapeHtml(dangerAria || dangerLabel)}">
              ${escapeHtml(dangerLabel)}
            </div>
          `
              : ``
          }
          <div class="wt-bonus-chip" data-wt-bonus-chip>
            ${questionHtml}
          </div>
        </div>
      `
          : `
        ${questionHtml}
      `
      }

      ${
        fallEnabled
          ? `
        <div class="wt-choices">
          <button class="wt-choice wt-choice--same" data-action="answer-true" aria-label="${escapeHtml(trueLabel)}">
            <span class="wt-choice-icon">\u2714</span>
            ${escapeHtml(trueLabel)}
          </button>
          <button class="wt-choice wt-choice--diff" data-action="answer-false" aria-label="${escapeHtml(falseLabel)}">
            <span class="wt-choice-icon">\u2716</span>
            ${escapeHtml(falseLabel)}
          </button>
        </div>
      `
          : `
        <div class="wt-answer-zone">
          <div class="wt-choices">
            <button class="wt-choice wt-choice--same" data-action="answer-true" aria-label="${escapeHtml(trueLabel)}">
              <span class="wt-choice-icon">\u2714</span>
              ${escapeHtml(trueLabel)}
            </button>
            <button class="wt-choice wt-choice--diff" data-action="answer-false" aria-label="${escapeHtml(falseLabel)}">
              <span class="wt-choice-icon">\u2716</span>
              ${escapeHtml(falseLabel)}
            </button>
          </div>
        </div>
      `
      }



    </div>
  `);
  };

  UI.prototype._renderPaywall = function () {
    const mod = window.WT_UI_Paywall;
    if (!mod || typeof mod.render !== 'function') {
      throw new Error('WT_UI_Paywall.render missing');
    }
    return mod.render(this, {
      escapeHtml,
      fillTemplate,
      formatCents,
      mmss,
      renderTextWithStrong,
      renderBrandingRow,
      clampInt,
      isPremiumNow
    });
  };

  // ============================================
  // Export
  // ============================================

  window.WT_UI = UI;
})();
