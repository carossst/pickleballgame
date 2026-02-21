// game.js v2.0 - Word Traps
// RUN engine + selection 
// Zéro accès DOM, zéro localStorage

(() => {
  "use strict";

  // ============================================
  // Internal sentinels (non-UI)
  // - Centralized to avoid scattered implicit fallbacks.
  // - These are NOT product defaults; they are engine invariants.
  // ============================================
  const INVALID_MAX_CHANCES = 0;
  const NO_FEEDBACK = "";
  const EMPTY_STATS = Object.freeze({ seenCount: 0, wrongCount: 0, correctCount: 0, lastWrongAt: 0 });


  // ============================================
  // Helpers
  // ============================================



  function shuffleCopy(arr) {
    const a = Array.isArray(arr) ? arr.slice() : [];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function safeBool(x) {
    return (x === true || x === false) ? x : null;
  }

  function safeIdNum(x) {
    const n = Number(x);
    return Number.isFinite(n) ? n : null;
  }

  function normalizePool(items) {
    const pool = [];
    const byId = Object.create(null);
    const seen = new Set();

    const list = Array.isArray(items) ? items : [];
    for (const it of list) {
      const idNum = safeIdNum(it && it.id);
      if (idNum == null) continue;
      if (seen.has(idNum)) continue;
      seen.add(idNum);
      pool.push(it);
      byId[String(idNum)] = it;
    }

    return { pool, byId };
  }

  function getStats(statsByItem, idNum) {
    const s = statsByItem ? statsByItem[String(idNum)] : null;
    return s || EMPTY_STATS;
  }




  function getPoolSize(config) {
    const poolSizeCfg = Number(config && config.game && config.game.poolSize);
    const poolSize = (Number.isFinite(poolSizeCfg) && poolSizeCfg > 0) ? Math.floor(poolSizeCfg) : null;
    return poolSize;
  }

  function applyPoolSize(poolAll, poolSize) {
    if (!Array.isArray(poolAll) || poolAll.length === 0) return [];
    if (poolSize == null || poolAll.length <= poolSize) return poolAll;

    // Deterministic slice: keep lowest ids
    return poolAll
      .slice()
      .sort((a, b) => (safeIdNum(a && a.id) || 0) - (safeIdNum(b && b.id) || 0))
      .slice(0, poolSize);
  }

  // ============================================
  // V2 Selection
  // ============================================
  // RUN mode:
  // - If antiRepetitionUntilExhaustion is true:
  //   - Before exhaustion: draw only from unseen items (seenCount === 0)
  //   - After exhaustion: draw from full pool
  // - If antiRepetitionUntilExhaustion is false:
  //   - Always draw from full pool
  //
  // Practice (mistakesOnly):
  // - select ONLY items with wrongCount > 0 AND correctCount === 0
  //   (items answered correctly at least once are considered "fixed" and excluded)
  // - order = most recent wrong first (lastWrongAt desc, id asc)
  // - size = EXACTLY mistakes count (no padding, no caps)
  function buildDeck({ items, statsByItem, mistakesOnly, config }) {
    const normalized = normalizePool(items);
    const poolAll = normalized.pool;
    const byId = normalized.byId;

    if (!poolAll.length) return { ids: [], byId };

    const poolSize = getPoolSize(config);
    const pool = applyPoolSize(poolAll, poolSize);

    if (mistakesOnly) {
      const mistakesPoolRaw = pool.filter((it) => {
        const idNum = safeIdNum(it && it.id);
        if (idNum == null) return false;
        const s = getStats(statsByItem, idNum);
        return (Number(s.wrongCount) || 0) > 0 && (Number(s.correctCount) || 0) === 0;
      });

      const mistakesPool = mistakesPoolRaw.slice().sort((a, b) => {
        const ida = safeIdNum(a && a.id) || 0;
        const idb = safeIdNum(b && b.id) || 0;
        const sa = getStats(statsByItem, ida);
        const sb = getStats(statsByItem, idb);
        const ta = Number(sa.lastWrongAt) || 0;
        const tb = Number(sb.lastWrongAt) || 0;
        if (tb !== ta) return tb - ta;
        return ida - idb;
      });

      const ids = [];
      for (const it of mistakesPool) {
        const idNum = safeIdNum(it && it.id);
        if (idNum == null) continue;
        ids.push(idNum);
      }

      return { ids, byId };
    }




    const antiRepetitionUntilExhaustion =
      (config && config.game && config.game.antiRepetitionUntilExhaustion) === true;

    if (antiRepetitionUntilExhaustion) {
      const unseen = [];
      for (const it of pool) {
        const idNum = safeIdNum(it && it.id);
        if (idNum == null) continue;
        const s = getStats(statsByItem, idNum);
        const seenCount = Number(s.seenCount) || 0;
        if (seenCount <= 0) unseen.push(idNum);
      }

      return {
        ids: unseen.length
          ? shuffleCopy(unseen)
          : shuffleCopy(pool.map((it) => safeIdNum(it && it.id)).filter((n) => n != null)),
        byId
      };
    }

    return {
      ids: shuffleCopy(pool.map((it) => safeIdNum(it && it.id)).filter((n) => n != null)),
      byId
    };
  }

  // BONUS mode:
  // - deck = ONLY items already seen by the player (seenCount > 0)
  // - respects poolSize
  // - ends when deck ends (no reshuffle, no loop)
  // - uses RUN chances if secretBonus.useRunChances is true
  function buildSeenDeck({ items, statsByItem, config }) {
    const normalized = normalizePool(items);
    const poolAll = normalized.pool;
    const byId = normalized.byId;

    if (!poolAll.length) return { ids: [], byId };

    const poolSize = getPoolSize(config);
    const pool = applyPoolSize(poolAll, poolSize);

    const seenIds = [];
    for (const it of pool) {
      const idNum = safeIdNum(it && it.id);
      if (idNum == null) continue;
      const s = getStats(statsByItem, idNum);
      const seenCount = Number(s.seenCount) || 0;
      if (seenCount > 0) seenIds.push(idNum);
    }

    return { ids: shuffleCopy(seenIds), byId };
  }

  function buildFullPoolDeck(items, config) {
    const normalized = normalizePool(items);
    const poolAll = normalized.pool;
    const byId = normalized.byId;

    if (!poolAll.length) return { ids: [], byId };

    const poolSize = getPoolSize(config);
    const pool = applyPoolSize(poolAll, poolSize);

    return {
      ids: shuffleCopy(pool.map((it) => safeIdNum(it && it.id)).filter((n) => n != null)),
      byId
    };
  }


  // ============================================
  // GameEngine (V2)
  // ============================================
  class GameEngine {
    constructor() {
      this.run = null;
    }

    // payload:
    // {
    //   items: Array,
    //   statsByItem: Object,
    //   getStatsByItem: Function,
    //   config: Object,
    //   mode: "RUN" | "PRACTICE" | "BONUS"
    // }
    start(payload) {
      const p = (payload && typeof payload === "object") ? payload : {};
      const items = Array.isArray(p.items) && p.items.length > 0 ? p.items : [];
      const statsByItem = (p.statsByItem && typeof p.statsByItem === "object" && Object.keys(p.statsByItem).length > 0) ? p.statsByItem : {};
      const getStatsByItem = (typeof p.getStatsByItem === "function") ? p.getStatsByItem : () => ({});
      if (!p.config || typeof p.config !== "object") {
        throw new Error('WT_Game.GameEngine.start(): payload.config is required (WT_CONFIG). Wiring error: pass { config } from main/UI when starting a run.');
      }
      const config = p.config;


      // No dynamic stats hook: game.js builds a deck once per start (KISS).

      // Contract v2 (mode-only): mode is the single source of truth.
      // No legacy fallback: p.mistakesOnly is ignored by design.
      const modeRaw = String(p.mode || "").trim().toUpperCase();

      const VALID_MODES = ["RUN", "PRACTICE", "BONUS"];

      // Normalize + validate mode (fail closed)
      // - invalid non-empty mode => log (dev) + fallback RUN (never silent)
      // - empty mode => default RUN
      let requestedMode = "RUN";

      if (modeRaw) {
        if (VALID_MODES.includes(modeRaw)) {
          requestedMode = modeRaw;
        } else {
          if (window.Logger && Logger.error) {
            Logger.error(`Invalid game mode "${modeRaw}". Falling back to RUN.`);
          }
          requestedMode = "RUN";
        }
      } else {
        requestedMode = "RUN";
      }

      // Coherence: PRACTICE => mistakesOnly (engine-level authority)
      // KISS: allow PRACTICE only if enabled in config (premium gating remains elsewhere)
      const practiceEnabled = !!(config.mistakesOnly && config.mistakesOnly.enabled);

      let mistakesOnly = false;

      if (requestedMode === "PRACTICE") {
        if (!practiceEnabled) {
          if (window.Logger && Logger.error) {
            Logger.error(`PRACTICE requested but config.mistakesOnly.enabled is false. Falling back to RUN.`);
          }
          requestedMode = "RUN";
        } else {
          mistakesOnly = true;
        }
      }



      const bonusMode = (requestedMode === "BONUS");
      const effectiveMode = bonusMode ? "BONUS" : (mistakesOnly ? "PRACTICE" : "RUN");

      // Config-first: WT_CONFIG.game.maxChances
      // V2 strict: NO fallback. If wiring is broken, fail-closed (RUN cannot start).
      const maxChancesCfg = Number(config && config.game && config.game.maxChances);
      const maxChancesValid = (Number.isFinite(maxChancesCfg) && Math.floor(maxChancesCfg) > 0);
      const maxChances = maxChancesValid ? Math.floor(maxChancesCfg) : INVALID_MAX_CHANCES;


      // If maxChances is invalid, do not start a runnable run (RUN / PRACTICE / BONUS).
      if (!maxChancesValid) {
        this.run = {
          mode: effectiveMode,
          items,
          statsByItem,
          config,
          byId: {},
          ids: [],
          idx: 0,
          maxChances: INVALID_MAX_CHANCES,
          chancesLeft: INVALID_MAX_CHANCES,
          scoreFP: 0,
          last: {
            itemId: null,
            choice: null,
            correctAnswer: null,
            isCorrect: null,
            feedbackLine: NO_FEEDBACK
          },
          done: true
        };
        return this.getState();
      }

      const deck = bonusMode
        ? buildSeenDeck({ items, statsByItem, config })
        : buildDeck({ items, statsByItem, mistakesOnly, config });

      this.run = {
        mode: effectiveMode,
        items,
        statsByItem,
        getStatsByItem,
        config,


        byId: deck.byId || {},
        ids: Array.isArray(deck.ids) ? deck.ids.slice() : [],
        idx: 0,
        // Chances: RUN + BONUS use maxChances; PRACTICE has no chances (revision mode)
        maxChances: (effectiveMode === "PRACTICE") ? null : maxChances,
        chancesLeft: (effectiveMode === "PRACTICE") ? null : maxChances,

        // Single score across all modes (KISS)
        scoreFP: 0,

        last: {
          itemId: null,
          choice: null,
          correctAnswer: null,
          isCorrect: null,
          feedbackLine: NO_FEEDBACK
        },

        // One-shot flag consumed by getState() for UI toast
        justReshuffled: false,

        done: false
      };





      if (!this.run.ids.length) {
        this.run.done = true;
      }

      return this.getState();
    }

    // UI compatibility helpers (ui.js expects these)
    getIndex() {
      if (!this.run) return 0;
      return Number(this.run.idx || 0);
    }

    getTotal() {
      if (!this.run) return 0;
      const ids = Array.isArray(this.run.ids) ? this.run.ids : [];
      return ids.length;
    }

    getCurrent() {
      if (!this.run || this.run.done) return null;
      const idNum = this.run.ids[this.run.idx];
      return this.run.byId[String(idNum)] || null;
    }

    getLast() {
      if (!this.run) return null;
      return this.run.last || null;
    }

    getState() {
      if (!this.run) {
        return {
          mode: "NONE",
          done: true,
          scoreFP: 0,
          chancesLeft: null,
          maxChances: null,
          idx: 0,
          itemsServed: null
        };
      }

      const ids = Array.isArray(this.run.ids) ? this.run.ids : [];
      const idx = Number(this.run.idx || 0);
      const isBonus = (this.run.mode === "BONUS");

      // Contract: items-served signal is derived (no mutable counter).
      // - counts the currently displayed item as "served"
      // - null for non-BONUS modes (to avoid implying mechanics elsewhere)
      const itemsServed = isBonus
        ? (ids.length > 0 ? Math.min(ids.length, Math.max(0, idx) + 1) : 0)
        : null;

      const poolReshuffled = (this.run.mode === "RUN" && this.run.justReshuffled === true);

      // one-shot: consume the flag as soon as UI reads state
      if (poolReshuffled) {
        this.run.justReshuffled = false;
      }

      return {
        mode: this.run.mode,
        done: !!this.run.done,
        scoreFP: Number(this.run.scoreFP || 0),
        chancesLeft: (this.run.chancesLeft == null) ? null : Number(this.run.chancesLeft || 0),
        maxChances: (this.run.maxChances == null) ? null : Number(this.run.maxChances),
        idx,
        itemsServed,

        // UI-only signal
        poolReshuffled
      };

    }

    // - immediate resolution (no Next)
    // - RUN / PRACTICE / BONUS: +1 FP if correct; -1 chance if wrong
    // - BONUS: NO per-item feedback (feedbackLine always empty)
    // - auto-advance to next item (or end)
    answer(choiceBool) {
      if (!this.run || this.run.done) {
        return { done: true, isCorrect: false, feedbackLine: NO_FEEDBACK, state: this.getState(), itemId: null };
      }

      const item = this.getCurrent();
      if (!item) {
        this.run.done = true;
        return { done: true, isCorrect: false, feedbackLine: NO_FEEDBACK, state: this.getState(), itemId: null };
      }


      const idNum = safeIdNum(item.id);
      const correct = safeBool(item.correctAnswer);

      // Fail-closed: content bug should not corrupt the run.
      // Treat as a wrong answer: consume 1 chance, and end if it hits 0.
      if (idNum == null || correct == null) {
        const left = Number(this.run.chancesLeft || 0);
        this.run.chancesLeft = Math.max(0, left - 1);

        this.run.last = {
          itemId: idNum,
          choice: (choiceBool === true),
          correctAnswer: correct,
          isCorrect: false,
          feedbackLine: String(item.explanationShort || "")
        };

        if (Number(this.run.chancesLeft || 0) <= 0) {
          this.run.done = true;
          return {
            done: true,
            itemId: idNum,
            isCorrect: false,
            correctAnswer: correct,
            feedbackLine: this.run.last.feedbackLine,
            state: this.getState()
          };
        }

        this._advanceAfterAnswer();
        return {
          done: !!this.run.done,
          itemId: idNum,
          isCorrect: false,
          correctAnswer: correct,
          feedbackLine: this.run.last.feedbackLine,
          state: this.getState()
        };
      }


      const hasChoice = (choiceBool === true || choiceBool === false);
      const choice = hasChoice ? (choiceBool === true) : null;

      // Timeout (null/undefined/other) is ALWAYS wrong (consumes 1 chance)
      const isCorrect = hasChoice ? (choice === correct) : false;

      // scoring commun à tous les modes (BONUS / RUN / PRACTICE)
      if (isCorrect) {
        this.run.scoreFP = Number(this.run.scoreFP || 0) + 1;
      } else if (this.run.chancesLeft != null) {
        // PRACTICE has chancesLeft === null → no chance consumed
        const left = Number(this.run.chancesLeft || 0);
        this.run.chancesLeft = Math.max(0, left - 1);
      }

      // feedback spécifique au mode
      const feedbackLine = (this.run.mode === "BONUS")
        ? NO_FEEDBACK
        : String(item.explanationShort || "");

      this.run.last = {
        itemId: idNum,
        choice,
        correctAnswer: correct,
        isCorrect,
        feedbackLine
      };
      // End by chances (RUN/BONUS only; PRACTICE has chancesLeft === null)
      if (this.run.chancesLeft != null && Number(this.run.chancesLeft || 0) <= 0) {
        this.run.done = true;
        return {
          done: true,
          itemId: idNum,
          isCorrect,
          correctAnswer: correct,
          feedbackLine: this.run.last.feedbackLine,
          state: this.getState()
        };
      }

      this._advanceAfterAnswer();



      return {
        done: !!this.run.done,
        itemId: this.run.last ? this.run.last.itemId : null,
        isCorrect: this.run.last ? (this.run.last.isCorrect === true) : false,
        correctAnswer: this.run.last ? this.run.last.correctAnswer : null,
        feedbackLine: this.run.last ? String(this.run.last.feedbackLine || NO_FEEDBACK) : NO_FEEDBACK,
        state: this.getState()
      };



    }
    _advanceAfterAnswer() {
      if (!this.run || this.run.done) return;

      // Advance within current deck
      if (this.run.idx < this.run.ids.length - 1) {
        this.run.idx += 1;
        return;
      }

      // PRACTICE ends when list ends
      if (this.run.mode === "PRACTICE") {
        this.run.done = true;
        return;
      }

      // BONUS ends when deck ends (no reshuffle, no loop).
      if (this.run.mode === "BONUS") {
        this.run.done = true;
        return;
      }

      // RUN: rebuild a fresh deck at the end (reshuffle)
      if (this.run.mode === "RUN") {
        let freshStats = {};
        try {
          freshStats = (this.run.getStatsByItem && typeof this.run.getStatsByItem === "function")
            ? (this.run.getStatsByItem() || {})
            : {};
        } catch (_) {
          freshStats = {};
        }

        this.run.statsByItem = (freshStats && typeof freshStats === "object") ? freshStats : {};

        const deck = buildDeck({
          items: this.run.items,
          statsByItem: this.run.statsByItem,
          mistakesOnly: false,
          config: this.run.config
        });

        this.run.byId = deck.byId || this.run.byId || {};
        this.run.ids = Array.isArray(deck.ids) ? deck.ids.slice() : [];
        this.run.idx = 0;

        // one-shot UI signal
        this.run.justReshuffled = true;

        if (!this.run.ids.length) {
          this.run.done = true;
        }

        return;
      }

      // Fallback safety
      this.run.done = true;
    }


    getResult() {
      const s = this.getState();
      return {
        mode: s.mode,
        scoreFP: s.scoreFP,
        chancesLeft: s.chancesLeft,
        maxChances: s.maxChances
      };
    }

  }



  // Export global
  window.WT_Game = {
    buildDeck,
    buildSeenDeck,
    buildFullPoolDeck,
    GameEngine
  };
})();

