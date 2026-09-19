/* GENERATED FILE — do not hand-edit.
   Source order is defined in scripts/generate-app-bundle.mjs. */

/* ===== config.js ===== */
// config.js - Pickleball Rules Quiz
// Configuration + UI copy (single file, no split)

(() => {
  "use strict";

  // 9.1 Environment detection
  const hostname = window.location.hostname;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
  const isGitHubPages = hostname.includes("github.io");

  // Single source of truth for storage-related keys (avoid drift)
  const WT_STORAGE_KEY = "pickleball_rules_quiz_v1";
  const WT_VANITY_CODE_STORAGE_KEY = "pickleball-rules-quiz:vanityCode";
  const WT_CONTACT_EMAIL_CIPHER = Object.freeze({
    key: 23,
    codes: Object.freeze([
      116, 120, 121, 99, 118, 116, 99, 87, 117, 120, 121, 125, 120, 98,
      101, 103, 126, 116, 124, 123, 114, 117, 118, 123, 123, 57, 113, 101
    ])
  });


  // Global UI helpers (shared across IIFE modules)
  window.WT_UTILS = window.WT_UTILS || {};
  window.WT_UTILS.escapeHtml = function (str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  // Single source of truth for critical enums (no scattered magic strings).
  window.WT_ENUMS = Object.freeze({
    UI_STATES: Object.freeze({
      LANDING: "LANDING",
      PLAYING: "PLAYING",
      END: "END",
      PAYWALL: "PAYWALL"
    }),
    GAME_MODES: Object.freeze({
      RUN: "RUN",
      PRACTICE: "PRACTICE",
      BONUS: "BONUS"
    })
  });

  // 9.2 WT_CONFIG (single source of truth for mechanics)
  window.WT_CONFIG = {

    // Product version (UI display, logs)
    version: "4.3.4",

    // Storage schema version (localStorage).
    // Change ONLY if you accept a migration/wipe.
    storageSchemaVersion: "3.0.0",

    // Le cache du Service Worker dérive exclusivement de WT_CONFIG.version via ?v=
    // (source unique de vérité pour le cache)

    environment: isLocalhost
      ? "development"
      : (isGitHubPages ? "github-pages" : "production"),

    // Identity
    // URL REGISTRY — also hardcoded in static files:
    // index.html (canonical, og:url, twitter:url)
    // sitemap.xml, robots.txt
    // success.html (contact email domain)
    identity: {
      appName: "Pickleball Rules Quiz",
      appUrl: "https://pickleballrulesquiz.com",
      appUrlsByLocale: {
        en: "https://pickleballrulesquiz.com/",
        fr: "https://pickleballrulesquiz.com/fr.html"
      },
      // Intentionally empty: Pickleball Rules Quiz has no parent site link in the footer.
      parentUrl: "",

      // UI signature icon (in-card). Single source of truth for in-app branding.
      uiLogoUrl: "./icons/brand-logo-512.png"
    },

    // Storage (single source of truth)
    storage: {
      storageKey: WT_STORAGE_KEY,
      vanityCodeStorageKey: WT_VANITY_CODE_STORAGE_KEY
    },

    i18n: {
      supportedLocales: ["en", "fr"],
      defaultLocale: "en",
      localeStorageKey: "pickleball-rules-quiz:locale",
      warnMissingKeys: false
    },

    // Content
    contentUrl: "./content.json",

    // ============================================
    // V2 GAME - continuous RUN (no fixed sessions)
    // ============================================
    game: {
      maxChances: 3,
      poolSize: 200,
      antiRepetitionUntilExhaustion: true
    },

    // ============================================
    // LIMITS - monetization by replayability
    // ============================================
    limits: {
      freeRuns: 2
    },

    // Curated free RUN openings
    // Product goal: make the free trial reveal real rule traps early,
    // without changing storage, UI, backend, or the full question pool.
    curatedFreeRuns: {
      enabled: true,
      runCount: 2,
      // Curated opening for the free runs. Design goal: run 1 = a welcoming
      // hook (mostly easy/medium, real misconceptions), run 2 = a notch harder
      // with the highest-value "aha" questions and 2-3 hard ones near the end.
      // Ordered so true/false never repeats more than twice in a row.
      cardIdsByRun: {
        1: [23, 26, 105, 113, 50, 143, 144, 77, 62, 48],
        2: [44, 124, 66, 98, 109, 150, 3, 22, 131, 21, 16, 96]
      }
    },

    // Practice mode (Mistakes only)
    // PRODUCT DECISION (kept):
    // - Returns ALL wrong items (variable length) in mistakesOnly mode
    mistakesOnly: {
      enabled: true,
      minWrongItemsToShowToggle: 1,
      premiumOnly: false,
      freeRunsLimit: 2,
      maxItems: 10
    },

    routing: {
      // If backlog >= this threshold, END (after RUN) promotes PRACTICE as primary CTA.
      // Backlog model: number of items with wrongCount > 0.
      practicePrimaryMinWrong: 7,

      // PRACTICE repeat guidance tiers (based on remaining backlog after PRACTICE).
      // UI picks the FIRST matching tier in the array (top-down).
      // Fail-closed: missing/invalid tiers => no repeat note and no CTA override.
      practiceRepeatTiers: [
        { key: "direct", minRemaining: 7 },
        { key: "firm", minRemaining: 4 },
        { key: "light", minRemaining: 2 },
        { key: "last", minRemaining: 1 }
      ],

      // END RUN verdict thresholds (config-driven).
      // Maps run scoreFP (best score signal for the run) -> verdictKey used by WT_WORDING.end.ctaByVerdict.
      runScoreThresholds: {
        start: 3,
        building: 6,
        strong: 10,
        elite: 15,
        legendary: 20
      },

    },

    // Persistent level system
    // - No default badge before the first level is unlocked
    // - Levels are permanent once unlocked
    // - L1: one completed RUN
    // - L2: unique questions seen >= level2MinSeen
    // - L3: unique questions seen >= level3MinSeen OR RUN best score >= level3MinBestScore
    // - L4: unique questions seen >= level4MinSeen
    // - L5: mastered pool + Rapid Fire pool >= level5RapidFireMinSeen + Rapid Fire accuracy >= level5RapidFireMinAccuracy
    // - L6: mastered pool + Rapid Fire pool >= level6RapidFireMinSeen + Rapid Fire accuracy >= level6RapidFireMinAccuracy
    // - Level preview is UI-only and fail-closed:
    //   ?levelPreview=none|level1..level6|unlock1..unlock6
    levels: {
      enabled: true,
      maxLevel: 6,
      level1MinRunCompletes: 1,
      level2MinSeen: 25,
      level3MinSeen: 75,
      level3MinBestScore: 20,
      level4MinSeen: 200,
      level5RapidFireMinSeen: 16,
      level5RapidFireMinAccuracy: 0.70,
      level6RapidFireMinSeen: 50,
      level6RapidFireMinAccuracy: 0.85,
      preview: {
        enabled: true,
        queryParam: "levelPreview"
      }
    },

    // Personal best (premium history)
    personalBest: {
      enabled: true,
      premiumOnly: true
    },

    // Full access code flow
    premiumCodePrefix: "PRQ",
    premiumCodeRegex: "^PRQ-[0-9]{4}-[0-9]{4}$",
    acceptCodeOncePerDevice: true,

    // Pricing (Stripe)
    currency: "USD",
    earlyPriceCents: 499,
    standardPriceCents: 699,
    earlyPriceWindowMs: 15 * 60 * 1000, // 15 minutes
    stripeEarlyPaymentUrl: "https://buy.stripe.com/dRmcN53jhc63evD3EOejK00",
    stripeStandardPaymentUrl: "https://buy.stripe.com/bJe3cv2fd7PNbjr7V4ejK01",
    successRedirectUrl: "./success.html",

    // Marketing (opt-in only; Stripe receipt email is NOT marketing consent)
    marketing: {
      // External signup form URL (Mailchimp / ConvertKit / Buttondown / etc.)
      // Intentionally empty: no external update list is active yet.
      // Fail-closed in success.html if not set / still placeholder.
      updatesUrl: "",



      // Order bump (Cheat Sheet PDF) - serverless "trust-by-design" via ConvertKit embed.
      // Fail-closed in success.html unless explicitly enabled AND fully configured.
      cheatSheetOrderBump: {
        enabled: false,
        convertKitUid: "ed7df33449",
        convertKitScriptSrc: "https://onlinenewsletter.kit.com/ed7df33449/index.js"
      }
    },



    houseAd: {
      enabled: true,
      premiumOnly: false,
      url: "https://www.bonjourpickleball.fr/pickleball-france-trip/",
      showAfterEnd: true,

      // Unlock threshold (unique seen items)
      minUniqueSeenToShow: 100,

      // "Remind later" hide window (mechanics). Storage reads houseAd.hideMs.
      hideMs: 24 * 60 * 60 * 1000, // 24h
    },




    // Micro-pics (mécanique, non visible)
    // microPics garde uniquement les règles propres aux micro-pics.
    // IMPORTANT: streakThresholds est couplé au wording (ex: "3 in a row", "6 in a row", etc.).
    microPics: {
      cooldownItems: 1, // nb d'items minimum entre deux micro-pics

      // Seuils de streak (mécanique). La copy correspondante reste dans WT_WORDING.micropics.*
      streakThresholds: {
        start: 3,
        building: 6,
        strong: 10,
        elite: 15,
        legendary: 20
      },

      // END-only highlight arbitration.
      // Higher wins when multiple candidate highlights exist in the same run.
      endHighlightPriorities: {
        survival: 40,
        repeatMistake: 50,
        nearMiss: 55,
        runEndedAllChancesUsed: 60,
        streakStart: 65,
        recovery: 70,
        streakBuilding: 70,
        streakStrong: 80,
        streakElite: 90,
        streakLegendary: 100
      },

      // Near-miss (mécanique, non visible) - déclenchement 1 fois par RUN via endHighlight.
      nearMissEnabled: true,

      // Erreurs répétées (mécanique, non visible) - wrongCount >= seuil => endHighlight (1 fois par RUN).
      repeatMistakeWrongCountMin: 2
    },



    // UI namespace → toast component → default variant → params
    // Hiérarchie intentionnelle (lisibilité + évite collisions de clés)

    ui: {
      // Toast / micro-feedback timing buckets
      toast: {
        // Default bucket for gameplay overlays/toasts
        default: {
          delayMs: 0,
          durationMs: 2200
        },

        // Timing bucket for micro-pics / micro-satisfaction
        positive: {
          delayMs: 0,
          durationMs: 1600
        },

        // Timing bucket for "+1" after a correct answer (no fallback in UI)
        scoreGained: {
          delayMs: 0,
          durationMs: 900
        },

        contentLoading: {
          delayMs: 0,
          durationMs: 3400
        }
      },

      // Gameplay overlay dismiss policy (UI-only, fail-closed)
      // true => allow tap to dismiss gameplay overlays (info/success only)
      toastDismissOnTap: true,



      // Overlays (PLAYING)
      // - chanceLostOverlayMs: -1 chance + "Game over" window
      // - runStartOverlayMs: start-of-run + BONUS rules
      chanceLostOverlayMs: 1800,
      runStartOverlayMs: 3000,


      // Pulses (HUD) + extension window for last-chance overlay
      gameplayPulseMs: 1000,

      // Momentum meter (HUD, UI-only)
      momentumMeter: {
        enabled: true,
        mode: "RUN",
        segments: 6,
        thresholds: {
          s1: 1,
          s2: 2,
          s3: 3,
          s4: 4,
          s5: 5,
          s6: 6
        },
        dropTiers: [
          { minLevel: 6, dropTo: 3 },
          { minLevel: 4, dropTo: 2 },
          { minLevel: 0, dropTo: 0 }
        ]
      },

      // Choice buttons: short selected-answer feedback before moving on.
      // Applies to RUN, PRACTICE, and BONUS. UI-only, no storage writes.
      choiceSelectFeedbackMs: 260,

      // END (RUN): "Record moment" window (UI-only).
      // If > 0, END temporarily shows WT_WORDING.end.newBest instead of the scoreLine when newBest=true.
      endRecordMomentMs: 1600,

      // END: delay before opening automatic modals.
      // Goal: let the score and CTA breathe first.
      endAutoModalDelayMs: 1800,

      // PLAYING: toast duration when you beat your best score (RUN/BONUS).
      // No fallback in UI: if missing/invalid => no toast.
      newBestScoreToastMs: 1200,


      // Paywall ticker (UI-only, no silent fallback)
      // Drives the mm:ss countdown + the EARLY->STANDARD visual swap.
      paywallTickerMs: 1000,

      // Paywall urgency (UI-only, no silent fallback)
      // enabled: show the urgency banner during EARLY phase
      // pulseBelowMs: add a stronger pulse when remaining time is low
      paywallUrgency: {
        enabled: true,
        pulseBelowMs: 5 * 60 * 1000 // 5 minutes
      },

      // Explanations display (UI-only, no silent fallback)
      // Goal: make explanationShort easier to scan on mobile (2 lines when possible).
      // splitRegex: first match becomes the line break boundary (used by ui.js)
      explanationDisplay: {
        enabled: true,
        maxLines: 3,
        splitRegex: "\\.\\s+|\\n+" // sentence boundary OR explicit line break
      }
    },

    landingStats: {
      enabled: true,
      minCompletedRuns: 1,
      showBeforeFirstRun: false,
      // UI-only preview for QA. Never writes to storage.
      // ?phasePreview=firstpass|fixing|pressure
      preview: {
        enabled: true,
        queryParam: "phasePreview",
        states: {
          firstpass: { seen: 4, mistakes: 3 },
          fixing: { seen: "poolSize", mistakes: 12 },
          pressure: { seen: "poolSize", mistakes: 0 }
        }
      }
    },

    leaderboard: {
      enabled: true,
      showAfterRunCompletes: 1,
      topN: 10,
      cardPreviewCount: 3,
      cacheTtlMs: 60 * 1000,
      requestTimeoutMs: 4000,
      submitScores: true,
      contentVersion: "2026-05-23",
      nicknameMinLen: 3,
      nicknameMaxLen: 24,
      nicknameRegexSource: "^[\\p{L}\\p{N}][\\p{L}\\p{N} _-]{2,23}$",
      nicknameRegexFlags: "u",

      // Deployed live Worker URL.
      apiBaseUrl: "https://prq-leaderboard.carolestromboni.workers.dev",

      // Local-only UI test rows.
      // Remove these before go-live if you want the honest empty state again.
      // Includes varied nickname lengths to judge wrapping/truncation visually.
      seedScores: {
        weekly: [
          { nickname: "Ace", scoreFP: 21 },
          { nickname: "Lob", scoreFP: 19 },
          { nickname: "NetFox", scoreFP: 18 },
          { nickname: "Two Word Alias", scoreFP: 17 },
          { nickname: "DinkDoctor", scoreFP: 16 },
          { nickname: "KitchenBoss24", scoreFP: 15 },
          { nickname: "BaselineBanditPro", scoreFP: 14 },
          { nickname: "UnreturnableServe77", scoreFP: 13 },
          { nickname: "ThirdShotArchitect", scoreFP: 12 },
          { nickname: "RidiculouslyLongDisplayName12345", scoreFP: 11 }
        ],
        all: [
          { nickname: "Ace", scoreFP: 28 },
          { nickname: "Lob", scoreFP: 26 },
          { nickname: "NetFox", scoreFP: 24 },
          { nickname: "Two Word Alias", scoreFP: 23 },
          { nickname: "DinkDoctor", scoreFP: 22 },
          { nickname: "KitchenBoss24", scoreFP: 21 },
          { nickname: "BaselineBanditPro", scoreFP: 20 },
          { nickname: "UnreturnableServe77", scoreFP: 19 },
          { nickname: "ThirdShotArchitect", scoreFP: 18 },
          { nickname: "RidiculouslyLongDisplayName12345", scoreFP: 17 }
        ]
      }
    },

    // Secret bonus mode
    secretBonus: {
      minDeckSize: 1,
      enabled: true,
      ticketCost: 1,
      ticketCap: 3,
      starterTickets: 1,

      // Legacy free-run teaser counter (kept for analytics / backward compatibility).
      // Rapid Fire access is now ticket-based for all players.
      freeRunsLimit: 2,

      // Entry points (canonical gates)
      // END: show chest after N completed runs (0 = always show on END)
      // LANDING: show chest after N completed runs (0 = always show on LANDING)
      gates: {
        endAfterRuns: 0,
        landingAfterRuns: 1
      },

      // Gesture: single tap (simple, no “secret handshake”)
      tapWindowMs: 900,
      tapsRequired: 1,



      // Gameplay feel
      // Chances derive from WT_CONFIG.game.maxChances for RUN and BONUS.
      // PRACTICE has no chances (revision mode — player reviews all mistakes).
      // Feedback contract (ui.js):
      // - "none" => no feedback screen (auto-advance)
      feedback: "none",

      // Fall animation (BONUS only)
      // ui.js reads secretBonus.fall - single source of truth
      // No fallback: all values mandatory when fall.enabled === true.
      fall: {
        enabled: true,

        // Metadata (calibration contract)
        units: "pctLanePerSec",
        tuningVersion: 2,

        // Speed in % of lane height per second
        initialSpeed: 10,       // très lent au départ
        maxSpeed: 20,           // plafond confortable
        speedIncrement: 0.4,    // rampe étirée (cap ~25 items)

        // Danger zone threshold (0..1 ratio of lane height)
        dangerThreshold: 0.86
      },

      // Visual flash on terms-box after each answer (BONUS only)
      // Fall is frozen during this window, then render + restart.
      feedbackFlashMs: 400,

      // END screen personalization tiers (accuracy = scoreFP / totalPresented)
      // Evaluated top-down: first match wins. Key must match WT_WORDING keys.
      endTiers: [
        { key: "perfect", minAccuracy: 1.0 },
        { key: "high", minAccuracy: 0.85 },
        { key: "medium", minAccuracy: 0.55 },
        { key: "low", minAccuracy: 0 }
      ],

      // Deck-size buckets (seen count). Evaluated top-down: first match wins.
      endDeckTiers: [
        { key: "large", minSeen: 50 },
        { key: "medium", minSeen: 16 },
        { key: "small", minSeen: 0 }
      ],

    },


    // Waitlist
    waitlist: {
      enabled: true,

      // Unlock threshold (unique seen items)
      minUniqueSeenToShow: 100,


      // Email stored as XOR-obfuscated char codes.
      // Goal: avoid exposing a trivially decodable address in static source / DOM.
      toEmailCipher: WT_CONTACT_EMAIL_CIPHER,
      // IMPORTANT: keep this as a pure prefix (UI/email helpers may append details)
      subjectPrefix: "[Pickleball Rules Quiz][Waitlist]"

    },

    // Post-completion (pool exhausted): LANDING block + cross-sell
    postCompletion: {
      enabled: true,
      waitlistEnabled: true,
      houseAdEnabled: true,

      // Milestones (% of unique pool coverage)
      // UI must not hardcode 25% / 50% / 75% / 100%.
      milestoneThresholds: [0.25, 0.5, 0.75, 1.0]
    },



    // Anonymous stats sharing (opt-in, no backend)
    statsSharing: {
      enabled: true,
      emailSubject: "[Pickleball Rules Quiz][Stats] Anonymous stats",
      maxTopMistakes: 5,
      schemaVersion: "2.0",

      // Product rules:
      // - Do not interrupt gameplay; prompt only on END.
      // - Milestones are based on UNIQUE pool coverage (mots uniques vus), not total exposures.
      // - Multiple chances, but each trigger is shown at most once (storage flags).
      afterPoolExhaustedOnly: false,
      showModalOneShot: false,

      // Milestones (% of unique pool coverage)
      promptThresholdsPct: [30, 50],

      // Extra milestone for intensive players (4th chance)
      powerUserUniqueSeen: 150,
      powerUserRunCompletes: 5,

      // Also prompt when free runs are exhausted (end of the 2 free runs)
      promptOnFreeRunsExhausted: false
    },



    // Support
    support: {
      emailCipher: WT_CONTACT_EMAIL_CIPHER,
      subjectPrefix: "[Pickleball Rules Quiz][Contact]"
    },


    // PWA install prompt
    installPrompt: {
      enabled: true,
      triggerAfterFirstCompletedRun: true
    },

    // Share
    share: {
      enabled: true,

    },

    shareBonus: {
      enabled: true,
      bonusRuns: 1,
      premiumOnly: false
    },

    // Debug
    debug: {
      enabled: isLocalhost,
      logLevel: isLocalhost ? "debug" : "warn"
    },

    // Service Worker / PWA
    serviceWorker: {
      enabled: !isLocalhost,
      autoUpdate: true,
      showUpdateNotifications: true
    }
  };

  // 9.3 UI copy (visible -> WT_WORDING only; no legacy aliases)
  // ------------------------------------------
  // PICKLEBALL RULES QUIZ — EDITORIAL IDENTITY
  // ------------------------------------------
  //
  // Core Intention:
  // Pickleball Rules Quiz should sound clear, grounded, and useful.
  // The core promise is better rule knowledge, not speed for its own sake.
  // Momentum language is acceptable only when it supports learning, not when it replaces it.
  //
  // Emotional posture:
  // - Clear
  // - Grounded
  // - Focused
  // - Encouraging
  // - Useful
  //
  // Dominant lexical field for the main game:
  // - rules
  // - mistakes
  // - learn
  // - know
  // - know
  // - clear
  //
  // Rapid Fire can use a bit more pace / pressure language,
  // but it should still stay tied to rule recall, not generic performance talk.

  // Explicit exclusions:
  // - No aggressive vocabulary (ruthless, destroy, crush, dominate, savage)
  // - No ego inflation (unstoppable, unbeatable, genius)
  // - No cold technical tone (optimize, calibrate, precision-driven language)
  // - Avoid "streak" as the core motivation (allowed only when explicitly contrasting with real improvement).
  //
  // Identity direction:
  // Pickleball Rules Quiz should sound like a smart practice tool for learning the rules.
  // Short. Direct. Natural.
  // Never abstract for the sake of sounding polished.
  //
  // Validation rule for new copy:
  // If it reinforces rule knowledge -> valid.
  // If it sounds aggressive, ego-heavy, too abstract, or too performance-driven for the context -> reject.
  // Legacy inline wording removed.
  // Active wording now loads from wording-<locale>.js via wording-bootstrap.js + i18n.js.

  // 9.6 Soft validation (debug only)
  function validateConfigSoft() {
    const cfg = window.WT_CONFIG;
    if (!cfg || typeof cfg !== "object") return;

    const warn = (...args) => {
      if (cfg.debug && cfg.debug.enabled) console.warn("[WT_CONFIG]", ...args);
    };

    // Regex validity
    try {
      new RegExp(cfg.premiumCodeRegex);
    } catch (e) {
      warn("premiumCodeRegex is invalid", e);
    }

    // UI explanation display regex (optional, but must be valid when enabled)
    try {
      const ed = (cfg.ui && typeof cfg.ui === "object") ? cfg.ui.explanationDisplay : null;
      const enabled = !!(ed && ed.enabled === true);
      const src = enabled ? String(ed.splitRegex || "").trim() : "";
      if (enabled && src) new RegExp(src);
    } catch (e) {
      warn("ui.explanationDisplay.splitRegex is invalid", e);
    }


    // Identity URL (share single source of truth)
    const appUrl = String((cfg.identity && cfg.identity.appUrl) || "").trim();
    if (!appUrl) {
      warn("identity.appUrl is missing (used for share URL)");
    } else if (!/^https?:\/\//i.test(appUrl)) {
      warn("identity.appUrl must start with http:// or https://", appUrl);
    }

    // Stripe URLs
    if (!cfg.stripeEarlyPaymentUrl || String(cfg.stripeEarlyPaymentUrl).includes("REPLACE")) {
      warn("Stripe early URL needs to be configured");
    }
    if (!cfg.stripeStandardPaymentUrl || String(cfg.stripeStandardPaymentUrl).includes("REPLACE")) {
      warn("Stripe standard URL needs to be configured");
    }

    // V2 invariants
    if (!cfg.game || !Number.isFinite(Number(cfg.game.maxChances)) || Number(cfg.game.maxChances) <= 0) {
      warn("game.maxChances must be > 0");
    }

    const poolSizeNum = (cfg.game && Number.isFinite(Number(cfg.game.poolSize))) ? Number(cfg.game.poolSize) : null;
    if (poolSizeNum == null || Math.floor(poolSizeNum) !== poolSizeNum || poolSizeNum < 1 || poolSizeNum > 9999) {
      warn("game.poolSize must be an integer in [1..9999]");
    }

    const freeRunsNum = (cfg.limits && Number.isFinite(Number(cfg.limits.freeRuns))) ? Number(cfg.limits.freeRuns) : null;
    if (freeRunsNum == null || Math.floor(freeRunsNum) !== freeRunsNum || freeRunsNum < 0 || freeRunsNum > 99) {
      warn("limits.freeRuns must be an integer in [0..99]");
    }

    // Curated free RUN openings
    const cfr = (cfg.curatedFreeRuns && typeof cfg.curatedFreeRuns === "object") ? cfg.curatedFreeRuns : null;
    if (cfr && cfr.enabled === true) {
      const runCountNum = Number(cfr.runCount);
      if (!Number.isFinite(runCountNum) || Math.floor(runCountNum) !== runCountNum || runCountNum < 1 || runCountNum > 99) {
        warn("curatedFreeRuns.runCount must be an integer in [1..99]");
      }

      const byRun = (cfr.cardIdsByRun && typeof cfr.cardIdsByRun === "object") ? cfr.cardIdsByRun : null;
      if (!byRun) {
        warn("curatedFreeRuns.cardIdsByRun is required when curatedFreeRuns.enabled is true");
      } else {
        Object.keys(byRun).forEach((key) => {
          const ids = byRun[key];
          const runNum = Number(key);
          if (!Number.isFinite(runNum) || Math.floor(runNum) !== runNum || runNum < 1) {
            warn("curatedFreeRuns.cardIdsByRun keys must be positive integer run numbers", key);
          }
          if (!Array.isArray(ids) || !ids.length) {
            warn("curatedFreeRuns.cardIdsByRun entries must be non-empty arrays", key);
            return;
          }
          ids.forEach((id) => {
            const n = Number(id);
            if (!Number.isFinite(n) || Math.floor(n) !== n || n < 0) {
              warn("curatedFreeRuns card IDs must be non-negative integers", key, id);
            }
          });
        });
      }
    }



    // Micro-pics (mechanics)
    if (!cfg.microPics || typeof cfg.microPics !== "object") {
      warn("microPics is missing (required for in-run micro-pics rules)");
    } else {
      const c = Number(cfg.microPics.cooldownItems);
      if (!Number.isFinite(c) || c < 0 || c > 99) warn("microPics.cooldownItems must be a number in [0..99]");
    }


    // UI namespace → toast component → default variant → params
    // Hiérarchie intentionnelle (lisibilité + évite collisions de clés)

    const uiCfg = (cfg.ui && typeof cfg.ui === "object") ? cfg.ui : null;
    const toastTiming = (uiCfg && typeof uiCfg.toast === "object") ? uiCfg.toast : null;

    if (!toastTiming || typeof toastTiming !== "object") {
      warn("ui.toast is missing (required for UI toast timing)");
    } else {
      // Default bucket is required
      const def = toastTiming.default;
      if (!def || typeof def !== "object") {
        warn("ui.toast.default is missing (required)");
      } else {
        const td = Number(def.delayMs);
        const tdu = Number(def.durationMs);

        if (!Number.isFinite(td) || td < 0 || td > 2000) warn("ui.toast.default.delayMs must be a number in [0..2000]");
        if (!Number.isFinite(tdu) || tdu < 600 || tdu > 4000) warn("ui.toast.default.durationMs must be a number in [600..4000]");
      }

      // Optional buckets: validate only if provided.
      const buckets = ["positive", "scoreGained"];
      buckets.forEach((k) => {
        const b = toastTiming[k];
        if (!b || typeof b !== "object") return;
        const bd = Number(b.delayMs);
        const bdu = Number(b.durationMs);
        if (!Number.isFinite(bd) || bd < 0 || bd > 2000) warn(`ui.toast.${k}.delayMs must be a number in [0..2000]`);
        if (!Number.isFinite(bdu) || bdu < 600 || bdu > 4000) warn(`ui.toast.${k}.durationMs must be a number in [600..4000]`);
      });

    }
    if (!uiCfg) {
      warn("ui is missing (required for UI timing)");
    } else {
      const cl = Number(uiCfg.chanceLostOverlayMs);
      const rs = Number(uiCfg.runStartOverlayMs);
      const pulse = Number(uiCfg.gameplayPulseMs);

      if (!Number.isFinite(cl) || cl < 200 || cl > 3000) warn("ui.chanceLostOverlayMs must be a number in [200..3000]");
      if (!Number.isFinite(rs) || rs < 200 || rs > 3000) warn("ui.runStartOverlayMs must be a number in [200..3000]");
      if (!Number.isFinite(pulse) || pulse < 0 || pulse > 2000) warn("ui.gameplayPulseMs must be a number in [0..2000]");


      // Secret bonus mode (mechanics)
      if (cfg.secretBonus && cfg.secretBonus.enabled === true) {
        const tw = Number(cfg.secretBonus.tapWindowMs);
        const taps = Number(cfg.secretBonus.tapsRequired);

        if (!Number.isFinite(tw) || tw <= 0) warn("secretBonus.enabled true but tapWindowMs is missing/invalid");
        if (!Number.isFinite(taps) || taps < 0) warn("secretBonus.enabled true but tapsRequired is missing/invalid");
        if (!cfg.game || !Number.isFinite(Number(cfg.game.maxChances)) || Number(cfg.game.maxChances) <= 0) {
        }

        // Gates (canonical)
        const gates = cfg.secretBonus.gates;
        if (!gates || typeof gates !== "object") {
          warn("secretBonus.enabled true but secretBonus.gates is missing");
        } else {
          const endAfterRuns = Number(gates.endAfterRuns);
          const landingAfterRuns = Number(gates.landingAfterRuns);

          // KISS: allow 0 (= always show), otherwise require >= 0 integer
          if (!Number.isFinite(endAfterRuns) || endAfterRuns < 0) warn("secretBonus.gates.endAfterRuns missing/invalid (must be >= 0)");
          if (!Number.isFinite(landingAfterRuns) || landingAfterRuns < 0) warn("secretBonus.gates.landingAfterRuns missing/invalid (must be >= 0)");
        }


        const fl = cfg.secretBonus.fall;
        if (!fl || typeof fl !== "object") {
          warn("secretBonus.enabled true but secretBonus.fall is missing");
        } else if (fl.enabled === true) {
          const initialSpeed = Number(fl.initialSpeed);
          const maxSpeed = Number(fl.maxSpeed);
          const speedIncrement = Number(fl.speedIncrement);
          const dangerThreshold = Number(fl.dangerThreshold);

          if (String(fl.units || "").trim() !== "pctLanePerSec") warn("secretBonus.fall.units must be 'pctLanePerSec'");
          const tv = Number(fl.tuningVersion);
          if (!Number.isFinite(tv) || tv < 1) warn("secretBonus.fall.tuningVersion missing/invalid (must be >= 1)");

          if (!Number.isFinite(initialSpeed) || initialSpeed <= 0) warn("secretBonus.fall.initialSpeed missing/invalid");
          if (!Number.isFinite(maxSpeed) || maxSpeed <= 0) warn("secretBonus.fall.maxSpeed missing/invalid");
          if (!Number.isFinite(speedIncrement) || speedIncrement < 0) warn("secretBonus.fall.speedIncrement missing/invalid");
          if (!Number.isFinite(dangerThreshold) || dangerThreshold <= 0 || dangerThreshold >= 1) {
            warn("secretBonus.fall.dangerThreshold missing/invalid (must be in (0..1))");
          }
          if (Number.isFinite(initialSpeed) && Number.isFinite(maxSpeed) && maxSpeed < initialSpeed) {
            warn("secretBonus.fall.maxSpeed must be >= initialSpeed");
          }
        }

      }



      // Waitlist email (obfuscated)
      if (cfg.waitlist && cfg.waitlist.enabled && !cfg.waitlist.toEmailCipher) {
        warn("waitlist.enabled true but toEmailCipher missing");
      }

      // Support email (obfuscated)
      if (cfg.support && !cfg.support.emailCipher) {
        warn("support.emailCipher missing");
      }
    }
  }

  // Run on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      validateConfigSoft();
    });
  } else {
    validateConfigSoft();
  }


})();

/* ===== wording-en.js ===== */
// wording-en.js — English wording bank
// Loaded BEFORE i18n.js. Registers itself into window.WT_WORDING_ALL.en.
// To add a new locale: copy this file to wording-<loc>.js, translate strings,
// register under WT_WORDING_ALL[<loc>], and add <loc> to WT_CONFIG.i18n.supportedLocales.
(() => {
  'use strict';
  window.WT_WORDING_ALL = window.WT_WORDING_ALL || {};
  window.WT_WORDING_ALL.en = {
    brand: {
      creatorLine: 'An indie game by Carole',
      creatorLineHtml:
        'An indie game by <a href="./press.html">Carole</a><br><a href="https://www.bonjourpickleball.fr/pickleball-france-trip/" target="_blank" rel="noopener">Bonjour Pickleball</a>'
    },

    // Cross-cutting strings used by all pages (skip link, page-level meta, etc.)
    common: {
      skipToMain: 'Skip to main content',
      home: 'Home',
      homeAria: 'Pickleball Rules Quiz home',
      homeHref: './',
      gameContentAria: 'Pickleball Rules Quiz game content',
      contactUs: 'Contact us',
      copyrightLine: '© 2026 Bonjour Pickleball',
      tagLabels: {
        '2026 Changes': '2026 rule changes',
        'The Net': 'net play',
        'Score & Readiness': 'scoring and readiness',
        'Serving Rules': 'serving rules',
        'Line Calls': 'line calls',
        'Faults & Dead Ball': 'faults and dead balls',
        'Non-Volley Zone': 'the kitchen',
        'Player Conduct & Apparel': 'player conduct',
        'Rally Situations': 'rally situations',
        'Court & Equipment': 'court and equipment'
      }
    },

    // Page-level meta (title + description) for static pages.
    // Hydrated via <title data-wt-wording="..."> and <meta data-wt-meta-description="...">.
    meta: {
      indexTitle: 'Pickleball Rules Quiz',
      indexDescription:
        'Think you know pickleball? Prove it. A fast true-or-false pickleball rules game about serving, faults, scoring, line calls, and rule changes.',
      successTitle: 'Full Access Ready - Pickleball Rules Quiz',
      successDescription:
        'Payment successful. Your Pickleball Rules Quiz device unlock code is ready.',
      pressTitle: 'Press - Pickleball Rules Quiz',
      pressDescription: 'Press information for Pickleball Rules Quiz.',
      privacyTitle: 'Privacy Policy - Pickleball Rules Quiz',
      privacyDescription: 'Privacy Policy for Pickleball Rules Quiz.',
      termsTitle: 'Terms of Service - Pickleball Rules Quiz',
      termsDescription: 'Terms of Service for Pickleball Rules Quiz.',
      notFoundTitle: 'Page not found - Pickleball Rules Quiz',
      notFoundDescription: 'Page not found. Return to Pickleball Rules Quiz.'
    },

    // Locale toggle UI labels (aria only — pill text "EN"/"FR" is hardcoded in i18n-toggle.js)
    i18nToggle: {
      switchToTemplate: 'Switch to {locale}',
      selectorLabel: 'Language selector',
      languageNames: {
        en: 'English',
        fr: 'French'
      }
    },

    system: {
      close: 'Close',
      home: 'Home',
      versionPrefix: '',
      localeChangedTemplate: 'Language changed to {locale}',

      loadingTitle: 'Loading Pickleball Rules Quiz...',
      loadingIcon: '',
      loadingHint: 'Preparing your pickleball rules quiz',
      loadingSlowHint:
        'Still loading... Check your connection if this takes too long.',
      loadingSlowHints: [
        'Arguing politely about the kitchen...',
        'Reviewing highly suspicious line calls...',
        'Preparing an unnecessary Erne...'
      ],
      updateAvailable: 'New version available.',
      updateNow: 'Refresh app',

      offlinePayment: 'Payment requires an internet connection.',
      copied: 'Copied',
      copyFailed: 'Copy failed',
      downloaded: 'Downloaded',
      more: 'How to play',
      open: 'Open',
      speakQuestion: 'Read question aloud',
      replayQuestion: 'Replay question',
      stopQuestion: 'Stop reading',
      speakQuestionAria: 'Read the current question aloud',
      replayQuestionAria: 'Replay the current question aloud',
      stopQuestionAria: 'Stop reading the current question aloud',
      notNow: 'Not now',
      continue: 'Next',
      tapToContinue: '',

      youChosePrefix: 'You chose:',

      playAria: 'Play a new game',
      shareAria: 'Share the game',
      resultGridAria: 'Result grid',
      scoreAria: 'Score',
      endActionsAria: 'End screen actions',
      shareCardAria: 'Share the game',
      premiumUnlockedToast: 'Full access unlocked',
      storageSaveFailedToast:
        'Saving is disabled in this browser mode. Your progress may be lost if you refresh.',
      confirmLeaveRun: 'Leave the current game? Your progress will be lost.',
      fatalReload: 'Reload',
      fatalLoadFailed: 'Unable to load the game. Please refresh the page.',
      fatalUnexpected: 'An unexpected issue occurred. Please refresh the page.',
      fatalJavascriptPrefix: 'JavaScript Error: {message}',
      fatalPromisePrefix: 'Promise Error: {message}',
      fatalConfigMissing:
        'Configuration error: application settings not loaded.',
      fatalWordingMissing: 'Configuration error: UI wording not loaded.',
      fatalStorageUnsupported:
        'Your browser does not support local storage. Please use a modern browser.',
      fatalAppContainerMissing: 'Critical error: app container not found.',
      fatalComponentsMissing:
        'Unable to load game components: {components}. Please refresh the page.',
      fatalIconsMissing:
        'Unable to load game components: WT_ICONS.renderIcon. Please refresh the page.',
      fatalContentUnavailable:
        'Content not available. Please check your connection and reload.',
      fatalDataLoadFailed:
        'Unable to load game data. Please check your connection and refresh.',
      momentumAria: 'Momentum {filled}/{segments}'
    },

    footer: {
      rulebookNote: 'USA Pickleball rulebook',
      contact: 'Contact',
      privacy: 'Privacy',
      terms: 'Terms',
      press: 'Press',

      // Locale-aware links (consumed via data-wt-href in markup if needed).
      links: {
        bonjourPickleball: {
          label: 'Bonjour Pickleball',
          href: 'https://www.bonjourpickleball.fr/pickleball-france-trip/'
        }
      }
    },

    success: {
      title: 'Payment successful',
      subtitle:
        'Your device unlock code is ready. Use it in the game to enable full access here in a few seconds.',
      deviceBadge: 'ONE DEVICE',

      codeLabel: 'Your device unlock code',
      clearDataWarning:
        'This unlock is saved on this device. Keep the code if you may clear browser data or switch device later.',

      howToActivateTitle: 'How to activate',
      howToActivateStep1: 'Return to the game.',
      howToActivateStep2Prefix: 'Tap',
      howToPlayLabel: 'How to play',
      activateWithCodeLabel: 'Use a device unlock code',
      howToActivateStep3Prefix: 'Paste your code and tap',
      activateLabel: 'Activate',

      whatYouGetTitle: 'What full access includes',
      benefitFullAccessPrefix: 'Full access to all',
      benefitFullAccessStrongSuffix: ' questions',
      benefitFullAccessSuffix: ' in this game.',
      benefitUnlimited: 'Unlimited play on this device after activation.',

      ctaBackToGame: 'Open the game',
      ctaDownload: 'Download code (.txt)',
      shortcutHint: 'In the game: How to play -> Use a device unlock code.',

      thankYouLine:
        'Thank you for supporting Pickleball Rules Quiz. Your code is ready when you are.',
      supportLabel: 'Need help?',

      copyCta: 'Copy code',
      copyAgainCta: 'Copy code again',
      tipNoRecover:
        'Tip: keep this code somewhere safe as a backup for this device unlock.',
      txtTitle: 'Your Pickleball Rules Quiz device unlock code',
      txtSaveLine: 'Tip: keep this code somewhere safe if you want a backup.',
      txtNoRecoverLine:
        'You only need it again if you clear browser data or move to another device.',

      cheatSheetTitle: '',
      cheatSheetBody: ''
    },

    landing: {
      title: 'Pickleball Rules Quiz',
      tagline: '**Think You Know Pickleball? Prove It.**',
      subtitle:
        'A fast true-or-false pickleball rules game.\nQuestions about serving, faults, scoring, line calls, and rule changes.',
      microFun: 'Quick games · No signup · Free to try',
      microTrust: 'Install it after your first game.',
      seoBridgeTitleQuestionTemplate: 'From the guide: {label}',
      seoBridgeTitleThemeTemplate: 'From the topic: {label}',
      seoBridgeBodyQuestion:
        'You came for one rule. The full quiz keeps the same official-rule standard across serving, faults, scoring, line calls, and more.',
      seoBridgeBodyTheme:
        'You came for this rule topic. The full quiz keeps the same official-rule standard across the whole game.',
      seoBridgeTrust: 'Quick games · No signup · Free to try',
      seoBridgeCta: 'Start the full rules quiz',

      runsLabel: '',
      runsFreeMode: '',

      ctaPlay: 'Play now',
      ctaPlayAfterFirstRun: 'Play again',
      ctaHow: 'How to play',
      statsSeenLabel: 'Questions seen',

      statsSeenSummaryTemplate: 'Seen: {seen} questions',
      statsPhaseBadgeDiscovery: 'Phase 1/3: First pass',
      statsPhaseBadgeCorrection: 'Phase 2/3: Fix mistakes',
      statsPhaseBadgeConsolidation: 'Phase 3/3: Pressure test',

      statsSeenCompleteLabel: 'Quiz progress',
      statsMistakesLabel: 'Mistakes',
      statsMistakesSummaryTemplate: '{mistakes}',
      statsMasterySummaryTemplate: '{mastered} questions answered correctly',
      personalBestBadge: 'BEST SCORE',
      personalBestTitleTemplate: 'Best score',
      personalBestSubTemplate:
        'Best score: {best}. Next tier at {nextTarget}+.',
      personalBestTopTierTemplate: 'Best score: {best}. Top tier reached.',
      personalBestFirstTitle: 'Set your first score',
      personalBestFirstSubTemplate:
        'Score {nextTarget}+ to unlock your first tier.',
      personalBestLockedTitle: 'Record your score',
      personalBestLockedSub:
        'Unlock full access to record your score and keep building your best.',
      dailyChallengeBadge: "DAILY CHALLENGE",
      dailyChallengeTitleTemplate: 'Reach a score of {targetScore}+',
      dailyChallengeProgressTemplate:
        'Today: {score}/{targetScore}.',
      dailyChallengeResetTemplate: '',
      dailyChallengeCompletedTemplate:
        'Daily challenge complete.\nNext challenge at {resetTime}.',
      dailyChallengeRewardTemplate:
        'Earn 1 Rapid Fire ticket.',
      dailyChallengeRewardCappedTemplate:
        'Tickets are capped at {cap}. Spend one to earn another.',
      dailyChallengeRewardPendingTemplate:
        'Cleared once already.\nClear it again today on your last free run to earn 1 Rapid Fire ticket.',
      dailyChallengeCta: 'Start challenge',

      postPaywallTitle: 'Your free preview is complete.',
      postPaywallBody:
        'Unlock unlimited games, record your score, all 200 questions, explanations after every answer, and unlimited Mistakes Mode.',
      practiceCtaTemplate: 'Fix your {count} mistake{pluralS}',
      postPaywallCta: 'Unlock full access',

      postPaywallSbTitle: "Today's challenge is on",
      postPaywallSbBody:
        "Unlock full access to come back for today's challenge and keep earning Rapid Fire tickets."
    },

    shareBonus: {
      title: 'One game on the house',
      body: 'Share Pickleball Rules Quiz with a friend and get one more free game. Just this once.',
      ctaShare: 'Share & play',
      ctaLater: 'Not now',
      toastUnlocked: 'One free game unlocked.',
      toastAlready: 'Already claimed.',
      toastShareFailed: "Couldn't share. Try again."
    },

    leaderboard: {
      cardTitle: 'THIS WEEK',
      cardSubDefault: 'Top scores this week.',
      cardSubJoined: 'Top scores this week.',
      cardCtaJoin: 'Choose nickname',
      cardCtaView: 'View leaderboard',
      cardCtaEdit: 'Edit nickname',
      lastUpdatedTemplate: '',
      nextRefreshTemplate: '',
      weeklyResetLine: 'Weekly reset: {localTime}.',
      loading: 'Loading leaderboard...',
      empty: 'No public scores yet.',
      modalTitle: 'Leaderboard',
      modalBodyDefault: 'Weekly reset every Monday.',
      modalBodyJoined: 'Weekly reset every Monday.',
      rankingTab: 'Leaderboard',
      profileTab: 'My nickname',
      weeklyTitle: 'This week',
      allTitle: 'All-time',
      nicknameLabel: 'Nickname',
      nicknamePlaceholder: 'Choose a nickname',
      joinCta: 'Join leaderboard',
      endJoinTitle: 'Put this score on the leaderboard',
      endJoinBody:
        'Choose a nickname to submit this run to the public leaderboard.',
      updateCta: 'Update nickname',
      editProfileCta: 'Edit my nickname',
      leaveCta: 'Leave leaderboard',
      nicknameRequiredToast: 'Add a nickname first.',
      nicknameTooShortToast: 'Nickname must be at least 3 characters.',
      nicknameInvalidCharsToast:
        'Use letters, numbers, spaces, hyphens, or underscores only.',
      saveOkToast: 'Nickname saved.',
      leftToast: 'You left the leaderboard on this device.',
      remoteSaveErrorToast:
        'Nickname saved on this device. Online sync can be added later.',
      rankToastWeekly: 'This week: #{rank}.',
      scoreRejectedToast:
        'This score was not added to the public leaderboard this time.'
    },

    firstRun: {
      titleRun1: 'How to play',
      titleRun2: 'Quick reminder',
      titleRun3: 'Last tip before you play',

      run1Lines: [
        "You'll see pickleball rules one by one.\nDecide whether each one is true or false.",
        'Correct answer: +1 point.',
        'Wrong answer: +1 mistake.',
        'After {maxChances} mistakes, the game ends.',
        'Think You Know Pickleball? Prove It.'
      ],

      run2Lines: [
        'One free run left.',
        "Today's challenge is active on this run.",
        'Clear it to earn 1 Rapid Fire ticket.',
        'After {maxChances} mistakes, the game ends.',
        'Read carefully.'
      ],

      run3Lines: [
        'Game ends after {maxChances} mistakes.',
        'Read carefully.',
        'Go with what you know.',
        'Think You Know Pickleball? Prove It.'
      ],

      ctaLabel: 'Play'
    },

    milestones: {
      quarter: {
        title: 'First quarter complete.',
        bodyLines: [
          "You've seen the first quarter of the question set.",
          'You are building your first pass through the rules.',
          "Keep going. You're building your first pass through the rules."
        ],
        cta: 'Next'
      },
      halfway: {
        title: 'Halfway there.',
        bodyLines: [
          "You've seen half of the question set.",
          "You're building rule coverage step by step.",
          "Finish the full set first. Then you'll fix what still catches you."
        ],
        cta: 'Next'
      },
      threeQuarters: {
        title: 'Three quarters complete.',
        bodyLines: [
          "You've seen three quarters of the question set.",
          "You're close to finishing phase 1.",
          "One more push, then you'll know exactly what still needs work."
        ],
        cta: 'Next'
      }
    },

    phaseJourney: {
      discovery: {
        badge: 'Phase 1/3: First pass',
        landingSummaryTemplate: "You've seen {seen} questions so far.",
        landingDetailTemplate: '{remaining} left in your first pass.',
        endLens:
          "You're still on your first pass. Right now the goal is to cover more of the set.",
        micropics: {
          streakStart: '3 in a row. Good read.',
          streakBuilding: '6 in a row. Good read.',
          streakStrong: '10 in a row. Clear rules.',
          streakElite: '15 in a row. You know these.',
          streakLegendary: '20 in a row. Strong run.',
          streakAgainTemplate: '{streak} again.',
          recovery: 'There you go.'
        }
      },
      correction: {
        badge: 'Phase 2/3: Fix mistakes',
        landingSummaryTemplate: 'Mistakes left: {mistakes}',
        landingDetail:
          "You've seen the full set. Now clear the rules that still catch you.",
        endLens:
          "You've seen the full set. Now clear the rules that still catch you.",
        micropics: {
          streakStart: '3 in a row. Better.',
          streakBuilding: '6 in a row. Clearing up.',
          streakStrong: '10 in a row. Better now.',
          streakElite: '15 in a row. Mistakes fading.',
          streakLegendary: '20 in a row. Strong correction.',
          streakAgainTemplate: '{streak} again.',
          recovery: 'Back on it.'
        }
      },
      consolidation: {
        badge: 'Phase 3/3: Pressure test',
        landingSummaryTemplate: 'No active mistakes',
        landingDetail: 'Your mistakes are clear. Build your Rapid Fire score.',
        endLens: 'Your mistakes are clear. Build your Rapid Fire score.',
        micropics: {
          streakStart: '3 in a row. Still clear.',
          streakBuilding: '6 in a row. Still clear.',
          streakStrong: '10 in a row. Holding up.',
          streakElite: '15 in a row. Very clear.',
          streakLegendary: '20 in a row. Rules clear.',
          streakAgainTemplate: '{streak} again.',
          recovery: 'Back on it.'
        }
      }
    },

    levels: {
      modalTitle: 'Levels',
      placeholder: '',
      openDetailsAria: 'Open level details',
      unlockKicker: 'New level',
      reachedTemplate: '',
      currentLabel: 'Current level',
      unlockedByLabel: '',
      nextLabel: '',
      reachItLabel: '',
      progressionLabel: 'Level path',
      noLevelTitle: 'Locked',
      noLevelBody: 'Finish one game to unlock your first level.',
      maxLevelBody: 'You reached the top level.',
      currentPill: 'You are here',
      unlockedPill: 'Unlocked',
      lockedPill: 'Locked',
      byLevel: {
        1: {
          label: 'COURT-READY',
          unlock: 'Finish one game.',
          sheetBody: 'You finished your first game.'
        },
        2: {
          label: 'RULE-READY',
          unlock: 'See 25 questions.',
          sheetBody: 'You have started building real rule coverage.'
        },
        3: {
          label: 'RALLY-READY',
          unlock: 'See 75 questions or score 20+.',
          sheetBody: 'You are no longer just testing the game. You are building rules reflexes.'
        },
        4: {
          label: 'CLUB-LEVEL',
          unlock: 'See all 200 questions once.',
          sheetBody: 'You have seen the full question set once.'
        },
        5: {
          label: 'TOURNAMENT-LEVEL',
          unlock: 'Clear active mistakes and score 70%+ in Rapid Fire with a 16+ question pool.',
          sheetBody: 'You proved your rules under Rapid Fire pressure.'
        },
        6: {
          label: 'PRO-LEVEL',
          unlock: 'Score 85%+ in Rapid Fire with a 50+ question pool.',
          sheetBody: 'You reached the top level. Keep the rules sharp.'
        }
      }
    },

    ui: {
      chancesLabel: 'Mistakes',
      mistakesLabel: 'Mistakes',
      scoreLabel: 'Score',
      scoreAriaTemplate: 'Score: {score} {fpShort}',
      fpShort: '',
      fpLong: '',
      trueLabel: 'True',
      falseLabel: 'False',
      gameOverTitle: 'Game over',

      contentLoadingToast: 'Loading questions...',
      poolReshuffledToast: 'All questions reshuffled. New order.',
      seenProgressTemplate: 'You saw {seen}/{poolSize} questions.',

      startRunTypeFree: 'Your first free game',
      startRunTypeLastFree: 'Last free game. Make it count',
      startRunTypeUnlimited: '',
      startRunTypePractice: 'Mistakes Mode',

      startRunChancesOverlay:
        'Correct: +1 point.\nWrong: +1 mistake.\nGame ends after {maxChances} mistakes.',
      startOverlayTapAnywhere: 'Tap anywhere to start',
      dailyChallengeStartOverlayLabel: "Today's challenge is live",
      dailyChallengeStartOverlayLineTemplate:
        '{targetScore}+ = +1 Rapid Fire ticket',

      lastChanceOverlay: 'One mistake left.',
      gameOverOverlay: 'Game over.',

      chanceLostDeltaText: '-1',
      mistakeGainedDeltaText: '+1',
      scoreGainedDeltaText: '+1',

      bestScoreLabel: 'Best',
      bestScoreAriaTemplate: 'Best: {best}'
    },

    secretBonus: {
      chestAria: 'Rapid Fire Mode',
      ticketBadgeAriaTemplate: 'Rapid Fire tickets: {tickets}/{cap}',
      chestHint: '',
      starterTicketToast: '1 Rapid Fire ticket added. You can use it now.',
      noSeenWordsToast:
        'Rapid Fire is empty for now. Play a few games first and build your pool.',
      badge: 'RAPID FIRE',

      endTitle: '',
      scoreLine: 'Score: {score}',
      endStatsLine: '',
      endStatsLineOne: '',
      endDeckSizeLine: 'Rapid Fire pool: {count} questions.',
      endDeckSizeLineOne: 'Rapid Fire pool: 1 question.',
      endPoolProgressTemplate: '{cleared} out of {shown} correct this round.',
      endDeckExhaustedToast: 'All available questions played.',
      mistakesTitle: 'Questions to revisit',
      mistakesToggle: '{count} mistakes',
      mistakesNone: 'No mistakes.',

      newBest: 'NEW BEST SCORE.',
      celebrationPerfect: 'PERFECT RUN',
      labelByTier: {
        perfect: 'FAST AND CLEAN',
        high: 'QUICK HANDS',
        medium: 'FINDING PACE',
        low: 'PACE CHECK'
      },

      endByTier: {
        perfect: [
          'You proved it under pressure.',
          'You answered those questions instantly.'
        ],
        high: [
          'You held up under pressure.',
          'Your rule knowledge held up well.'
        ],
        medium: ['You settled in.', 'This mode rewards solid rule recall.'],
        low: [
          'The pace got ahead of you.',
          'You need both recall and control here.'
        ]
      },
      endLineZero: 'The pace got ahead of you this time.',

      endRecoByTier: {
        perfect_small: 'Expand your deck to unlock more Rapid Fire questions.',
        perfect_medium: 'Replay to keep that edge.',
        perfect_large: 'Your Rapid Fire pool is deep: keep going.',
        high_small: 'Expand your deck to unlock more Rapid Fire questions.',
        high_medium: 'Try again to lock in the ones you missed.',
        high_large: 'Stay in Rapid Fire: that was a strong game.',
        medium_small:
          'Expand your deck first. More seen questions will make Rapid Fire stronger.',
        medium_medium: 'Try another Rapid Fire game to build your recall.',
        medium_large: 'Keep going. Recall gets stronger with repetition.',
        low_small:
          'Expand your deck first. More seen questions will make Rapid Fire stronger.',
        low_medium: 'Try another Rapid Fire game to rebuild confidence.',
        low_large: 'Try again: recall comes with practice.'
      },

      ctaByTier: {
        perfect: 'Keep proving it',
        high: 'Stay in Rapid Fire',
        medium: 'Try Rapid Fire again',
        low: 'Try Rapid Fire again'
      },
      ctaExpandDeck: 'Expand your deck',

      startOverlayLine1: 'Rapid Fire Mode.',
      startOverlayLine2: "Only questions you've already seen.",
      startOverlayLine3: 'Play more games to grow your pool.',

      startOverlayFreeRunsLimitLine:
        '{tickets} ticket{pluralS} left. Cost: {cost} ticket{costPluralS}.',

      freeLimitReachedTitle: 'No Rapid Fire ticket available.',
      freeLimitReachedBody:
        "Rapid Fire costs {cost} ticket{costPluralS}.\nPlay today's challenge to earn one, or unlock full access to keep your main game open.",
      freeLimitReachedCta: 'Keep playing',
      freeLimitReachedClose: 'Not now',
      startOverlayTapAnywhere: 'Tap anywhere to start',

      title: 'Pickleball Rules Quiz',
      subtitle: 'Rapid Fire',
      questionPrompt: 'True or false?',
      dangerLineLabel: 'TIMEOUT LINE',
      dangerLineAria:
        'Timeout line. If the card reaches this line, the item is lost.',
      seenOnlyLine: '{count} pickleball rules in your Rapid Fire pool.',

      modalTitle: 'Rapid Fire Mode',
      modalBody:
        "Rapid Fire Mode is faster and more demanding.\nIt uses only questions you've already seen in the game.\nCost: {cost} ticket{costPluralS}.\nAvailable now: {tickets}.",
      modalCta: 'Play Rapid Fire (1 ticket)',
      ticketRequiredTitle: 'No Rapid Fire ticket available.',
      ticketRequiredBodyDaily:
        "Rapid Fire costs {cost} ticket{costPluralS}.\nYou have {tickets} right now.\nPlay today's challenge to earn one.",
      ticketRequiredBodySpentToday:
        "Rapid Fire costs {cost} ticket{costPluralS}.\nYou have {tickets} right now.\nYou've already claimed today's ticket. Come back tomorrow for a new challenge and another ticket.",
      ticketRequiredBodyPremium:
        "Rapid Fire costs {cost} ticket{costPluralS}.\nYou have {tickets} right now.\nPlay a run and clear today's challenge to earn one.",
      ticketRequiredBodyLocked:
        'Rapid Fire costs {cost} ticket{costPluralS}.\nYou have {tickets} right now.\nYour free runs are finished. Unlock full access to keep playing and earn more tickets.',
      ticketRequiredCtaDaily: "Play today's challenge",
      ticketRequiredCtaRun: 'Play a run',
      ticketRequiredCtaPaywall: 'Unlock full access',
      ticketRequiredClose: 'Not now'
    },

    practice: {
      title: 'Mistakes Mode',
      on: 'On',
      off: 'Off',

      premiumOnly: 'Full access only',
      descLocked: 'Replay the questions that still need work.',
      valueLine: 'Focus on the questions that still need work.',
      descUnlocked: 'Only the questions you previously got wrong.',

      freeLimitReachedTitle: 'That helped.',
      freeLimitReachedBody:
        "You've used your {limit} free mistakes games.\n\nFull access unlocks unlimited Mistakes Mode.\nKeep fixing what you missed.\nNo limits.",
      freeLimitReachedCta: 'Keep playing',
      freeLimitReachedClose: 'Not now',

      endTitle: '',
      endLine: 'Keep going.',
      allFixedLine: 'You closed it out.',
      celebrationAllCleared: 'STRONG FINISH',
      labelByTier: {
        last: 'LAST ONE',
        light: 'GOOD RECOVERY',
        firm: 'WORKING BACK',
        direct: 'STAY WITH IT'
      },
      endLineAllFixed: 'You closed it out.',
      endLineZero: 'Those questions still need another pass.',
      endStatsLineAllFixed: 'You fixed {fixed}.',
      endLineByTier: {
        last: 'Nice recovery.',
        light: 'Good recovery.',
        firm: "That's progress.",
        direct: "You're making progress."
      },
      endStatsLine: 'You fixed {fixed}. You still have {remaining} left.',

      endRepeatNoteByTier: {
        last: 'One question left. Clear it now.',
        light: '',
        firm: 'A few questions still need another pass.',
        direct:
          'Stay in Mistakes Mode. These are the questions that need the work.'
      },

      scoreLine: 'Score: {score}',
      playingProgressLine: '{current}/{total}',

      startRunChancesOverlayPractice:
        'Only questions you missed.\nUp to 10 per game.\nFix it and it drops out. Miss it and it comes back.',
      startOverlayTapAnywhere: 'Tap anywhere to start',
      ctaPracticeAgain: 'Practice again',

      ctaRepeatByTier: {
        last: 'Clear the last question',
        light: 'Fix your mistakes one more time',
        firm: 'Play Mistakes Mode again',
        direct: 'Stay in Mistakes Mode'
      },

      playing: {
        questionLabel: 'Question',
        assertion: 'Is this statement true or false?',
        answersAria: 'Answer choices',
        questionHeadingTemplate: '',
        feedbackTitleOk: '',
        feedbackTitleBad: '',
        newBestScore: 'New best score.',
        feedbackRelationSameTemplate: '{question}',
        feedbackRelationDifferentTemplate: '{question}'
      }
    },

    micropics: {
      runContinues: 'You got it. Keep going.',
      nearMiss: 'Close call. That one was waiting for you.',
      repeatMistake:
        'This one keeps pulling you in. Slow down and read it again.',
      streakStart: '3 in a row. Good start.',
      streakBuilding: '6 in a row. You know these.',
      streakStrong: '10 in a row. You know these.',
      streakElite: '15 in a row. Strong run.',
      streakLegendary: '20 in a row. Rules locked in.',
      streakAgainTemplate: '{streak} in a row again.',
      recovery: 'There you go.',
      runEndedAllChancesUsed: ''
    },

    end: {
      title: '',

      poolCompleteTitle: 'All questions complete.',
      poolCompleteLine1:
        'You made it through the full set. Now replay, fix mistakes, and know the rules better.',
      poolCompleteLine2: 'Come back later and see what you still remember.',
      directToConsolidationLine:
        'You finished the full set with no active mistakes, so you move straight to phase 3.',
      poolCompleteScoreLine: 'This game: {score} {fpShort}',
      poolCompleteCtaPrimary: 'Replay in a new order',
      poolCompleteCtaPractice: 'Fix your mistakes',

      freeLimitReachedTitle: 'Nice game.',
      freeLimitReachedBody:
        "You've used your {limit} free games.\n\nFull access unlocks unlimited games, the full pickleball rules question set, explanations after every answer, unlimited Mistakes Mode, and the daily challenge every day.",
      freeLimitReachedCta: 'Keep playing',
      freeLimitReachedClose: 'Not now',

      endLine: '',
      endStatsLine: '',

      identityByVerdict: {
        none: 'A few questions are still slipping past you.',
        start: "You're getting your bearings.",
        building: "You're starting to get the feel for these rules.",
        strong: 'You know more of these rules now.',
        elite: 'You know these rules well.',
        legendary: 'You really know these rules.'
      },
      identityZero: 'Those rules still need another pass.',

      ctaByVerdict: {
        none: 'Play again',
        start: 'Play again: aim for 6+',
        building: 'Play again: aim for 10+',
        strong: 'Play again: push your score higher',
        elite: 'Play again: master the remaining questions',
        legendary: 'Play again'
      },

      strongestTagLine: 'Category you handled best: {tag}.',
      weakestTagLine: 'Category that gave you the most trouble: {tag}.',

      endTagHighlights: {
        '2026 Changes':
          'The 2026 rule changes were the toughest part of this game.'
      },

      scoreLine: 'Score: {score} {fpLong}',
      personalBestLine: 'Best score: {best} {fpLong}',
      nearBestLine: '{delta} {fpLong} away from your best score.',
      streakLine: '',
      scoreTierLine: '',
      scoreTierNextLine: '',
      dailyChallengeCleared: 'Daily challenge complete.',
      dailyChallengeClearedFreeRun:
        'Daily challenge complete. The Rapid Fire ticket unlocks on your last free run.',
      dailyChallengeTicketWon:
        'Daily challenge complete. +1 Rapid Fire ticket.',
      dailyChallengeTicketCapped:
        'Daily challenge complete. Tickets are capped at {cap}. Spend one to earn more.',
      dailyChallengeMiss: 'Daily challenge missed.',
      dailyChallengeMissLastFree:
        'Not this time. Daily challenge missed.',
      dailyChallengeCtaRetry: 'Try the challenge again',
      dailyChallengeToast: "Today's challenge complete. +1 Rapid Fire ticket.",
      modeMissingFallback: 'Your run summary is still available.',
      beatBestLine: 'Beat your best next run: {target}+.',
      beatBestFirstLine: '',
      freeRunLeft: '{remaining} free game{pluralS} left.',

      mistakesTitle: 'Questions to revisit',
      mistakesNone: 'No mistakes.',
      mistakesToggle: '{count} mistakes',

      newBest: 'NEW PERSONAL BEST',
      labelByVerdict: {
        none: 'EARLY RALLY',
        start: 'FIRST PASS',
        building: 'GETTING A READ',
        strong: 'SOLID GAME',
        elite: 'RULES READY',
        legendary: 'LOCKED IN'
      },
      houseAdSummaryLabel: 'Keep going with another game',
      playAgain: 'Play again',

      practiceCta: 'Fix what you missed',
      practiceCtaTemplate: 'Fix your {count} mistake{pluralS}',

      bonusCtaPrimary: 'Play Rapid Fire (1 ticket)',

      practiceCtaCountPremium: 'Fix what you missed',
      shareTitle: 'Challenge a friend'
    },

    paywall: {
      headline: 'Walk onto the court knowing every call.',
      headlineLastFree: 'That was the free preview. Unlock the full game.',

      progressLine1:
        "You've seen {seen} questions. {remaining} more are waiting in the full set.",
      progressLine2: '',

      payOnceLine: 'Pay once. No subscription.',

      valueTitle: 'What you get',
      trustTitle: 'Simple unlock',
      compactTitle: 'What unlocks',
      compactBullets: [
        '**All 200 questions in the game**',
        '**Unlimited games**',
        '**Record and keep improving your score**',
        '**See the best scores on the public leaderboard**',
        '**Explanations after every answer**',
        '**Mistakes Mode** and offline play'
      ],

      valueBullets: [
        '**All 200 questions in the game**',
        '**Unlimited games** across the full game',
        '**Record your score and keep improving your best**',
        '**See the best scores on the public leaderboard**',
        '**A mix of easy, intermediate, and hard questions**',
        '**Explanations after every answer**',
        '**Unlimited Mistakes Mode** to fix what you missed'
      ],

      bridgeTitle: 'Know the pickleball rules better.',
      bridgeBody:
        "Unlock unlimited games, all 200 questions, see the best scores on the leaderboard, use Mistakes Mode, and come back for today's challenge.",
      bridgeBodyLastFreeMiss:
        "You've felt the pace. Unlock unlimited games, all 200 questions, see the best scores on the leaderboard, use Mistakes Mode, and come back for today's challenge.",

      trustLine: '**One-time unlock**',
      trustBullets: [
        '**Pay once**, no subscription',
        '**No account** or email needed',
        '**Keep your code** as a backup if you switch device or clear browser data',
        '**Works offline** after first load',
        '**Secure payment** through Stripe'
      ],

      socialProofTitle: 'What players say',
      socialProofQuotes: [
        {
          quote:
            "★★★★★\nI was sure I'd ace it. Caught three rules I've been getting wrong at the club. The explanations actually help.",
          author: 'Maya, tournament player'
        },
        {
          quote:
            "★★★★★\nTwo games in and I realized I'd been calling some things wrong for months.",
          author: 'Jon, doubles regular'
        }
      ],

      savingsLineTemplate: 'Save {saveAmount} with the early price.',
      checkoutNote:
        'Payment handled securely by Stripe. Usually about 30 seconds.',
      checkoutRedirecting: 'Redirecting to secure checkout...',

      ctaEarly: 'Unlock full access for $4.99',
      ctaStandard: 'Unlock full access for $6.99',
      cta: 'Get full access',

      alreadyHaveCode: 'Already have a device unlock code? Use it here.',
      deviceNote:
        'Instant unlock. No account needed. Keep your code as a backup.',

      earlyBadgeLabel: 'Early bird',
      earlyLabel: 'Early price',
      standardLabel: 'Standard price',
      timerLabel: 'Price increases in:',

      postEarlyLine1: 'The early price has ended.',
      postEarlyLine2: '{standardPrice}. Pay once. Keep your code as a backup.'
    },

    howto: {
      title: 'How to play',
      howToPlayLine1: 'You see a statement about pickleball rules.',
      howToPlayLine2: 'Decide whether it is true or false.',
      howToPlayLine3: 'Choose True or False.',
      audioTitle: 'Question audio',
      autoReadLabel: 'Auto-read questions',
      autoReadHelp:
        'Read each new question aloud automatically. You can still replay or stop it during the game.',
      autoReadOn: 'On',
      autoReadOff: 'Off',

      modesTitle: 'Game modes',
      modesBullets: [
        'The game: discover the full set and learn the rules.',
        "Rapid Fire Mode: faster and more demanding. Uses only questions you've already seen.",
        'Mistakes Mode: replay what you missed (up to 10 questions).'
      ],

      ruleTitle: 'Rule',
      ruleSentence:
        'Each correct answer adds 1 point. A wrong answer adds 1 mistake. After {maxChances} mistakes, the game ends.',
      premiumTitle: 'Full access',
      alreadyPremium: 'Full access is already enabled on this device.',
      activateTitle: 'Use a device unlock code',
      activateLine1: 'Already have a device unlock code? Use it here.',
      activateLine2: 'No account needed. Keep your code as a backup.',
      activationCodeLabel: 'Device unlock code',
      activationCodePlaceholder: 'PRQ-0000-0000',
      enterCode: 'Enter a code.',
      codeRejected: 'Code rejected.',
      codeChecking: 'Checking code...',
      activateCta: 'Activate',
      codeInvalid: 'Invalid code format.',
      codeUsed: 'This device already used a code.',
      codeOk: 'Full access enabled on this device.',

      autoActivateTitle: 'Unlock code ready',
      autoActivateLine1: 'Your device unlock code is already saved here.',
      autoActivateLine2: 'Enable full access on this device now?',
      autoActivateCta: 'Unlock now',
      autoActivateLater: 'Not now'
    },

    postCompletion: {
      title: "You've seen everything.",
      body: 'Now keep improving. Practice your mistakes, explore Rapid Fire Mode, or replay full games.',

      masteredTitle: 'Bravo ! You answered the full question set correctly.',
      masteredLine1: 'Zero mistakes left. Every question answered correctly.',
      masteredLine2:
        'Now put your rule knowledge under pressure. Then come back in a few weeks and see if it still holds.',
      masteredCtaBonus: 'Challenge yourself in Rapid Fire Mode',
      masteredCtaReplay: 'Replay in a new order',

      waitlistTitle: 'Stay in the loop',
      waitlistBody1: 'Get notified when we add new questions or features.',
      waitlistBody2: 'No spam. No account. Leave anytime.',
      waitlistCta: 'Get notified',
      waitlistDisclaimer: 'Email only. Unsubscribe anytime.',
      houseAdCta: 'Explore Bonjour Pickleball'
    },

    houseAd: {
      eyebrow: 'After {poolSize} questions',
      title: 'You know the rules. Next stop: France.',
      bodyLine1:
        'Carole, the creator of Pickleball Rules Quiz, splits her time between the U.S. and France.',
      bodyLine2:
        'Join the Bonjour Pickleball list for future pickleball trips, camps, and small-group experiences in France.',
      ctaPrimary: 'See France trips',
      ctaRemindLater: 'Remind later',

      landingTitle: 'You know the rules. Next stop: France.',
      landingBodyLine1:
        'Carole, the creator of Pickleball Rules Quiz, splits her time between the U.S. and France.',
      landingBodyLine2:
        'Join the Bonjour Pickleball list for future pickleball trips, camps, and small-group experiences in France.',
      landingCtaPrimary: 'See France trips',
      landingCtaRemindLater: 'Remind later'
    },

    waitlist: {
      ctaLabel: 'Get notified about future products or features.',
      disclaimer: 'No spam. No account. You can leave anytime.',
      title: 'Get notified about future products or features.',
      bodyLine1: 'No spam. No account. Leave anytime.',
      bodyLine2: 'Optional: reply with one idea if you want.',
      inputPlaceholder: 'Optional: share an idea.',
      cta: 'Send email',

      emailSubjectSuffix: 'Waitlist',
      emailBodyTemplate: `Hi!

I'd like to join the Pickleball Rules Quiz waitlist.

Optional idea:
{idea}

Thanks!`
    },

    share: {
      ctaLabel: 'Copy challenge',
      emailLabel: 'Email challenge',
      emailSubject: 'Try Pickleball Rules Quiz',
      previewLabel: 'Challenge preview',
      toastCopied: 'Copied.',
      template: `Think you know pickleball?
Try this one:
{funFact}

{scoreChallenge}
{url}`,
      scoreChallengeWithBest:
        "My best score so far is {bestScore}. What's yours?",
      scoreChallengeWithoutBest: "What's your best score so far?",

      teaserTrap: "Looks obvious... until it isn't.",
      teaserTrue: 'Sometimes the obvious answer is right.',
      funFactTemplatesTrap: [`"{question}" True or false? 🤔`],
      funFactTemplatesTrue: [`"{question}" True or false? 🤔`]
    },

    installPrompt: {
      title: 'Install Pickleball Rules Quiz',
      body: 'Add it to your home screen and open it like an app.\nNo App Store. No account. One tap to play.',
      bodyIOS: 'On iPhone, tap Share, then Add to Home Screen.',
      ctaPrimary: 'Install the app',
      ctaPrimaryIOS: 'Show iPhone steps',
      ctaSecondary: 'Later'
    },

    statsSharing: {
      sectionTitle: 'Anonymous feedback (optional)',
      buttonLabel: 'Share anonymous gameplay stats',

      promptTitle: 'Help improve the questions',
      promptBodyTemplate:
        'You have now seen {thresholdPct}% of the question pool. Share anonymous gameplay stats to help improve difficulty, wording, and question order. You can review everything before sending.',
      promptBodyLastFree:
        'That was your last free game. Share anonymous gameplay stats to help improve difficulty, wording, and question order. You can review everything before sending.',
      promptBodyPowerUser:
        'You have played enough for your stats to be useful. Share anonymous gameplay stats to help improve difficulty, wording, and question order. You can review everything before sending.',
      promptCtaPrimary: 'Review & share',
      promptCtaSecondary: 'Not now',

      modalTitle: 'Review anonymous stats',
      modalDescription:
        'This email includes your gameplay summary, your most-missed questions, and anonymous usage totals.\nNo personal identity data is included.\nYou can review exactly what will be sent below.',
      previewLabel: 'What will be sent:',
      ctaSend: 'Open email draft',
      ctaCancel: 'Cancel',
      ctaLater: 'Show me later',
      ctaCopy: 'Copy stats',
      noStatsToast: 'No stats to share yet.',
      successToast:
        'Email draft opened. Send it if you want to share your stats.',
      copyToast: 'Stats copied to clipboard.',
      mailtoFallbackToast:
        'Stats copied to clipboard. Paste them into the email draft.'
    },

    support: {
      label: 'Contact',
      modalTitle: 'Write us',
      modalBodyLine1: 'Email is the fastest way to reach us.',
      modalBodyLine2: 'Pick a reason below or copy the address.',
      emailSubjectSuffix: 'Feedback',
      ctaCopy: 'Copy email',
      ctaOpen: 'Open email app',
      emailUnavailableToast: 'Email is not available right now.',
      ctaBug: 'Bug report',
      ctaQuestion: 'Question',
      ctaIdea: 'Idea',
      bugSubjectSuffix: 'Bug report',
      questionSubjectSuffix: 'Question',
      ideaSubjectSuffix: 'Idea',

      emailBodyTemplate: `Hi!

I'm writing about Pickleball Rules Quiz.

Message:




Thanks!`,
      bugBodyTemplate: `Hi!

I'm writing about Pickleball Rules Quiz.

Bug report:

What happened:

What I expected:

Device / browser:


Thanks!`,
      questionBodyTemplate: `Hi!

I'm writing about Pickleball Rules Quiz.

Question:



Thanks!`,
      ideaBodyTemplate: `Hi!

I'm writing about Pickleball Rules Quiz.

Idea:



Thanks!`
    },

    notFound: {
      title: 'Out of bounds.',
      line1: 'This page landed outside the court.',
      line2: 'The good news: Pickleball Rules Quiz is still ready to play.',
      cta: 'Back to the court'
    }
  };
})();

/* ===== wording-fr.js ===== */
// wording-fr.js — French wording bank
// Loaded BEFORE i18n.js. Registers itself into window.WT_WORDING_ALL.fr.
// Translation rules (see GLOSSARY_FR.md):
//   - Vouvoiement (vous), apostrophe droite ', concision mobile-first
//   - Template variables {var} preserved
//   - Glossary terms: service / retour de service / échange / faute / balle morte /
//     zone de non-volée / simple / double / Mode Erreurs / Mode Rapide / etc.
(() => {
  'use strict';
  window.WT_WORDING_ALL = window.WT_WORDING_ALL || {};
  window.WT_WORDING_ALL.fr = {
    brand: {
      creatorLine: 'Un jeu indépendant créé par Carole',
      creatorLineHtml:
        'Un jeu indépendant créé par <a href="./press.html">Carole</a><br><a href="https://bonjourpickleball.fr/" target="_blank" rel="noopener">Bonjour Pickleball</a>'
    },

    common: {
      skipToMain: 'Aller au contenu principal',
      home: 'Accueil',
      homeAria: 'Accueil de Quiz Pickleball',
      homeHref: './fr.html',
      gameContentAria: 'Contenu du jeu Quiz Pickleball',
      contactUs: 'Nous contacter',
      copyrightLine: '© 2026 Bonjour Pickleball',
      tagLabels: {
        '2026 Changes': 'les changements de règles de 2026',
        'The Net': 'le jeu au filet',
        'Score & Readiness': 'le score et la préparation',
        'Serving Rules': 'les règles du service',
        'Line Calls': 'les annonces de ligne',
        'Faults & Dead Ball': 'les fautes et balles mortes',
        'Non-Volley Zone': 'la zone de non-volée',
        'Player Conduct & Apparel': 'la conduite des joueurs',
        'Rally Situations': "les situations d'échange",
        'Court & Equipment': "le terrain et l'équipement"
      }
    },

    meta: {
      indexTitle: 'Quiz Pickleball',
      indexDescription:
        'Mieux connaître les règles, c’est mieux jouer. Un jeu rapide de vrai ou faux sur les règles : service, fautes, score, annonces de ligne, changements de règles.',
      successTitle: 'Accès complet activé - Quiz Pickleball',
      successDescription:
        'Paiement réussi. Votre code de déverrouillage Quiz Pickleball est prêt.',
      pressTitle: 'Presse - Quiz Pickleball',
      pressDescription: 'Dossier de presse de Quiz Pickleball.',
      privacyTitle: 'Politique de confidentialité - Quiz Pickleball',
      privacyDescription: 'Politique de confidentialité de Quiz Pickleball.',
      termsTitle: "Conditions d'utilisation - Quiz Pickleball",
      termsDescription: "Conditions d'utilisation de Quiz Pickleball.",
      notFoundTitle: 'Page introuvable - Quiz Pickleball',
      notFoundDescription: 'Page introuvable. Retournez à Quiz Pickleball.'
    },

    i18nToggle: {
      switchToTemplate: 'Passer en {locale}',
      selectorLabel: 'Choix de langue',
      languageNames: {
        en: 'anglais',
        fr: 'français'
      }
    },

    system: {
      close: 'Fermer',
      home: 'Accueil',
      versionPrefix: '',
      localeChangedTemplate: 'Langue changée en {locale}',

      loadingTitle: 'Chargement de Quiz Pickleball...',
      loadingIcon: '',
      loadingHint: 'Préparation de votre quiz sur les règles du pickleball',
      loadingSlowHint:
        'Toujours en cours... Vérifiez votre connexion si ça dure.',
      loadingSlowHints: [
        'Vérification de la zone de non-volée...',
        "Vérification d'annonces de ligne très serrées...",
        "Préparation d'un Erne pas indispensable..."
      ],
      updateAvailable: 'Nouvelle version disponible.',
      updateNow: "Recharger l'application",

      offlinePayment: 'Le paiement nécessite une connexion Internet.',
      copied: 'Copié',
      copyFailed: 'Échec de la copie',
      downloaded: 'Téléchargé',
      more: 'Comment jouer',
      open: 'Ouvrir',
      speakQuestion: 'Lire la question',
      replayQuestion: 'Relire la question',
      stopQuestion: 'Arrêter la lecture',
      speakQuestionAria: 'Lire la question actuelle à voix haute',
      replayQuestionAria: 'Relire la question actuelle à voix haute',
      stopQuestionAria: 'Arrêter la lecture de la question actuelle',
      notNow: 'Plus tard',
      continue: 'Suivant',
      tapToContinue: '',

      youChosePrefix: 'Vous avez choisi :',

      playAria: 'Lancer une nouvelle partie',
      shareAria: 'Partager le jeu',
      resultGridAria: 'Grille de résultats',
      scoreAria: 'Score',
      endActionsAria: 'Actions de fin de partie',
      shareCardAria: 'Partager le jeu',
      premiumUnlockedToast: 'Accès complet débloqué',
      storageSaveFailedToast:
        "L'enregistrement est désactivé dans ce mode de navigation. Votre progression peut être perdue si vous actualisez la page.",
      confirmLeaveRun:
        'Quitter la partie en cours ? Votre progression sera perdue.',
      fatalReload: 'Recharger',
      fatalLoadFailed: 'Impossible de charger le jeu. Actualisez la page.',
      fatalUnexpected: 'Un problème inattendu est survenu. Actualisez la page.',
      fatalJavascriptPrefix: 'Erreur JavaScript : {message}',
      fatalPromisePrefix: 'Erreur de promesse : {message}',
      fatalConfigMissing:
        "Erreur de configuration : les paramètres de l'application n'ont pas été chargés.",
      fatalWordingMissing:
        "Erreur de configuration : les textes de l'interface n'ont pas été chargés.",
      fatalStorageUnsupported:
        'Votre navigateur ne prend pas en charge le stockage local. Utilisez un navigateur récent.',
      fatalAppContainerMissing:
        "Erreur critique : conteneur d'application introuvable.",
      fatalComponentsMissing:
        'Impossible de charger les composants du jeu : {components}. Actualisez la page.',
      fatalIconsMissing:
        'Impossible de charger les composants du jeu : WT_ICONS.renderIcon. Actualisez la page.',
      fatalContentUnavailable:
        'Contenu indisponible. Vérifiez votre connexion et rechargez la page.',
      fatalDataLoadFailed:
        'Impossible de charger les données du jeu. Vérifiez votre connexion puis actualisez la page.',
      momentumAria: 'Progression {filled}/{segments}'
    },

    footer: {
      rulebookNote: 'Règlement officiel USA Pickleball',
      contact: 'Contact',
      privacy: 'Confidentialité',
      terms: 'Conditions',
      press: 'Presse',

      links: {
        bonjourPickleball: {
          label: 'Bonjour Pickleball',
          href: 'https://bonjourpickleball.fr/'
        }
      }
    },

    success: {
      title: 'Paiement réussi',
      subtitle:
        "Votre code de déverrouillage est prêt. Utilisez-le dans le jeu pour activer l'accès complet sur cet appareil.",
      deviceBadge: 'UN APPAREIL',

      codeLabel: 'Votre code de déverrouillage',
      clearDataWarning:
        "Ce déverrouillage est enregistré sur cet appareil. Gardez le code au cas où vous effaceriez vos données ou changeriez d'appareil.",

      howToActivateTitle: 'Comment activer',
      howToActivateStep1: 'Retournez dans le jeu.',
      howToActivateStep2Prefix: 'Appuyez sur',
      howToPlayLabel: 'Comment jouer',
      activateWithCodeLabel: 'Utiliser un code de déverrouillage',
      howToActivateStep3Prefix: 'Collez votre code et appuyez sur',
      activateLabel: 'Activer',

      whatYouGetTitle: "Ce que l'accès complet inclut",
      benefitFullAccessPrefix: 'Accès complet à toutes les',
      benefitFullAccessStrongSuffix: ' questions',
      benefitFullAccessSuffix: ' de ce jeu.',
      benefitUnlimited: 'Parties illimitées sur cet appareil après activation.',

      ctaBackToGame: 'Ouvrir le jeu',
      ctaDownload: 'Télécharger le code (.txt)',
      shortcutHint:
        'Dans le jeu : Comment jouer -> Utiliser un code de déverrouillage.',

      thankYouLine: 'Merci de soutenir Quiz Pickleball. Votre code est prêt.',
      supportLabel: "Besoin d'aide ?",

      copyCta: 'Copier le code',
      copyAgainCta: 'Copier le code à nouveau',
      tipNoRecover:
        'Astuce : gardez ce code en lieu sûr comme sauvegarde de votre déverrouillage.',
      txtTitle: 'Votre code de déverrouillage Quiz Pickleball',
      txtSaveLine:
        'Astuce : gardez ce code en lieu sûr si vous voulez une sauvegarde.',
      txtNoRecoverLine:
        "Vous n'en aurez besoin à nouveau que si vous effacez vos données ou changez d'appareil.",

      cheatSheetTitle: '',
      cheatSheetBody: ''
    },

    landing: {
      title: 'Quiz Pickleball',
      tagline: '**Mieux connaître les règles, c’est mieux jouer.**',
      subtitle:
        'Un jeu rapide de vrai ou faux sur les règles du pickleball.\nDes questions sur le service, les fautes, le score, les annonces de ligne et les changements de règles.',
      microFun: 'Parties courtes · Sans inscription · Progression garantie',
      microTrust: 'Installez-la après votre première partie.',
      seoBridgeTitleQuestionTemplate: 'Depuis le guide : {label}',
      seoBridgeTitleThemeTemplate: 'Depuis le thème : {label}',
      seoBridgeBodyQuestion:
        'Vous êtes venu pour une règle précise. Le quiz complet garde le même niveau d’exactitude officielle sur le service, les fautes, le score, les annonces de ligne et plus encore.',
      seoBridgeBodyTheme:
        'Vous êtes venu pour ce thème de règles. Le quiz complet garde le même niveau d’exactitude officielle sur tout le jeu.',
      seoBridgeTrust: 'Parties courtes · Sans inscription · Essai gratuit',
      seoBridgeCta: 'Lancer le quiz complet',

      runsLabel: '',
      runsFreeMode: '',

      ctaPlay: 'Jouer maintenant',
      ctaPlayAfterFirstRun: 'Rejouer',
      ctaHow: 'Comment jouer',
      statsSeenLabel: 'Questions vues',

      statsSeenSummaryTemplate: 'Questions vues : {seen}',
      statsPhaseBadgeDiscovery: 'Phase 1/3 : Premier passage',
      statsPhaseBadgeCorrection: 'Phase 2/3 : Corriger les erreurs',
      statsPhaseBadgeConsolidation: 'Phase 3/3 : Test sous pression',

      statsSeenCompleteLabel: 'Progression du quiz',
      statsMistakesLabel: 'Erreurs',
      statsMistakesSummaryTemplate: '{mistakes}',
      statsMasterySummaryTemplate: 'Bonnes réponses : {mastered}',
      personalBestBadge: 'MEILLEUR SCORE',
      personalBestTitleTemplate: 'Meilleur score',
      personalBestSubTemplate:
        'Meilleur score : {best}. Prochain palier à {nextTarget}+.',
      personalBestTopTierTemplate:
        'Meilleur score : {best}. Vous avez atteint le plus haut palier.',
      personalBestFirstTitle: 'Enregistrez votre score',
      personalBestFirstSubTemplate:
        'Marquez {nextTarget}+ pour débloquer votre premier palier.',
      personalBestLockedTitle: 'Enregistrez votre score',
      personalBestLockedSub:
        "Débloquez l'accès complet pour enregistrer votre score et faire progresser votre meilleur résultat.",
      dailyChallengeBadge: 'DÉFI DU JOUR',
      dailyChallengeTitleTemplate: 'Visez un score de {targetScore}+',
      dailyChallengeProgressTemplate:
        'Score du jour : {score}/{targetScore}',
      dailyChallengeResetTemplate: '',
      dailyChallengeCompletedTemplate:
        "Défi du jour réussi.\nProchain défi à {resetTime}.",
      dailyChallengeRewardTemplate:
        'Gagnez 1 jeton Mode Rapide.',
      dailyChallengeRewardCappedTemplate:
        'Les jetons sont plafonnés à {cap}. Dépensez-en un pour en regagner.',
      dailyChallengeRewardPendingTemplate:
        "Vous l'avez déjà réussi une fois. Réussissez-le à nouveau aujourd'hui sur votre dernière partie gratuite pour gagner 1 jeton Mode Rapide.",
      dailyChallengeCta: 'Commencer',

      postPaywallTitle: 'Votre aperçu gratuit est terminé.',
      postPaywallBody:
        "Débloquez des parties illimitées, enregistrez votre score, accédez aux 200 questions du jeu, aux explications après chaque réponse et au Mode Erreurs illimité.",
      practiceCtaTemplate: 'Corrigez vos {count} erreur{pluralS}',
      postPaywallCta: "Débloquer l'accès complet",

      postPaywallSbTitle: 'Le défi du jour est actif',
      postPaywallSbBody:
        "Débloquez l'accès complet pour revenir chaque jour sur le défi du jour et gagner des jetons Mode Rapide."
    },

    shareBonus: {
      title: 'Une partie offerte',
      body: 'Partagez Quiz Pickleball avec un ami et gagnez une partie supplémentaire. Une seule fois.',
      ctaShare: 'Partager et jouer',
      ctaLater: 'Plus tard',
      toastUnlocked: 'Une partie débloquée.',
      toastAlready: 'Déjà reçue.',
      toastShareFailed: "Le partage n'a pas abouti. Réessayez."
    },

    leaderboard: {
      cardTitle: 'CETTE SEMAINE',
      cardSubDefault: 'Meilleurs scores de la semaine.',
      cardSubJoined: 'Meilleurs scores de la semaine.',
      cardCtaJoin: 'Choisir un pseudo',
      cardCtaView: 'Voir le classement',
      cardCtaEdit: 'Modifier mon pseudo',
      lastUpdatedTemplate: '',
      nextRefreshTemplate: '',
      weeklyResetLine: 'Remise à zéro : {localTime}',
      loading: 'Chargement du classement...',
      empty: 'Aucun score public pour le moment.',
      modalTitle: 'Classement',
      modalBodyDefault:
        'Le classement de la semaine est réinitialisé chaque lundi.',
      modalBodyJoined:
        'Le classement de la semaine est réinitialisé chaque lundi.',
      rankingTab: 'Classement',
      profileTab: 'Mon pseudo',
      weeklyTitle: 'Cette semaine',
      allTitle: 'Classement général',
      nicknameLabel: 'Pseudo',
      nicknamePlaceholder: 'Choisissez un pseudo',
      joinCta: 'Rejoindre le classement',
      endJoinTitle: 'Ajouter ce score au classement',
      endJoinBody:
        'Choisissez un pseudo pour envoyer cette partie dans le classement public.',
      updateCta: 'Mettre à jour le pseudo',
      editProfileCta: 'Modifier mon pseudo',
      leaveCta: 'Quitter le classement',
      nicknameRequiredToast: "Ajoutez d'abord un pseudo.",
      nicknameTooShortToast: 'Le pseudo doit contenir au moins 3 caractères.',
      nicknameInvalidCharsToast:
        'Utilisez seulement des lettres, chiffres, espaces, tirets ou traits de soulignement.',
      saveOkToast: 'Pseudo enregistré.',
      leftToast: 'Vous avez quitté le classement sur cet appareil.',
      remoteSaveErrorToast:
        'Pseudo enregistré sur cet appareil. La synchronisation en ligne pourra être ajoutée plus tard.',
      rankToastWeekly: 'Cette semaine : #{rank}.',
      scoreRejectedToast:
        "Cette partie n'a pas été ajoutée au classement public cette fois."
    },

    firstRun: {
      titleRun1: 'Comment jouer',
      titleRun2: 'Petit rappel',
      titleRun3: 'Dernier conseil avant de jouer',

      run1Lines: [
        'Vous voyez les règles du pickleball une par une.\nDécidez si chacune est vraie ou fausse.',
        'Bonne réponse : +1 point.',
        'Mauvaise réponse : +1 erreur.',
        'Après {maxChances} erreurs, la partie est terminée.',
        "L'objectif ici, c'est d'apprendre les règles une par une."
      ],

      run2Lines: [
        'Il vous reste 1 dernière partie gratuite.',
        'Le défi du jour est actif sur cette partie.',
        'Réussissez-le pour gagner 1 jeton Mode Rapide.',
        'Après {maxChances} erreurs, la partie est terminée.',
        'Lisez attentivement.'
      ],

      run3Lines: [
        'La partie se termine après {maxChances} erreurs.',
        'Lisez attentivement.',
        'Répondez avec ce que vous savez.',
        'Mieux connaître les règles, c’est mieux jouer.'
      ],

      ctaLabel: 'Jouer'
    },

    milestones: {
      quarter: {
        title: 'Premier quart terminé.',
        bodyLines: [
          'Vous avez vu le premier quart des questions.',
          'Vous construisez votre premier passage dans les règles.',
          'Continuez. Vous parcourez les règles une première fois.'
        ],
        cta: 'Suivant'
      },
      halfway: {
        title: 'Moitié atteinte.',
        bodyLines: [
          'Vous avez vu la moitié des questions.',
          'Vous construisez votre couverture des règles pas à pas.',
          "Finissez d'abord le tour complet. Vous corrigerez ensuite ce qui vous piège encore."
        ],
        cta: 'Suivant'
      },
      threeQuarters: {
        title: 'Trois quarts terminés.',
        bodyLines: [
          'Vous avez vu trois quarts des questions.',
          'Vous approchez de la fin de la phase 1.',
          'Encore un effort, puis vous saurez exactement quoi retravailler.'
        ],
        cta: 'Suivant'
      }
    },

    phaseJourney: {
      discovery: {
        badge: 'Phase 1/3 : Premier passage',
        landingSummaryTemplate: 'Vous avez déjà vu {seen} questions.',
        landingDetailTemplate:
          'Il vous en reste {remaining} pour terminer ce premier passage.',
        endLens:
          "Vous faites votre premier passage. L'objectif est maintenant de voir plus de questions.",
        micropics: {
          streakStart: "3 d'affilée. Bonne lecture.",
          streakBuilding: "6 d'affilée. Bonne lecture.",
          streakStrong: "10 d'affilée. Des bases plus claires.",
          streakElite: "15 d'affilée. Vous les connaissez.",
          streakLegendary: "20 d'affilée. Belle série.",
          streakAgainTemplate: '{streak} encore.',
          recovery: "Voilà, c'est ça."
        }
      },
      correction: {
        badge: 'Phase 2/3 : Corriger les erreurs',
        landingSummaryTemplate: 'Erreurs restantes : {mistakes}',
        landingDetail:
          'Vous avez vu toutes les questions. Corrigez maintenant les règles qui vous piègent encore.',
        endLens:
          'Vous avez vu toutes les questions. Corrigez maintenant les règles qui vous piègent encore.',
        micropics: {
          streakStart: "3 d'affilée. C'est mieux.",
          streakBuilding: "6 d'affilée. Ça s'éclaircit.",
          streakStrong: "10 d'affilée. Mieux maintenant.",
          streakElite: "15 d'affilée. Erreurs en baisse.",
          streakLegendary: "20 d'affilée. Belle correction.",
          streakAgainTemplate: '{streak} encore.',
          recovery: 'Vous repartez.'
        }
      },
      consolidation: {
        badge: 'Phase 3/3 : Test sous pression',
        landingSummaryTemplate: 'Aucune erreur active',
        landingDetail:
          'Vos erreurs sont corrigées. Testez votre score en Mode Rapide.',
        endLens:
          'Vos erreurs sont corrigées. Testez votre score en Mode Rapide.',
        micropics: {
          streakStart: "3 d'affilée. Toujours clair.",
          streakBuilding: "6 d'affilée. Toujours clair.",
          streakStrong: "10 d'affilée. Ça tient.",
          streakElite: "15 d'affilée. Très clair.",
          streakLegendary: "20 d'affilée. Des bases solides.",
          streakAgainTemplate: '{streak} encore.',
          recovery: 'Vous repartez.'
        }
      }
    },

    levels: {
      modalTitle: 'Niveaux',
      placeholder: '',
      openDetailsAria: 'Ouvrir les détails des niveaux',
      unlockKicker: 'Nouveau niveau',
      reachedTemplate: '',
      currentLabel: 'Niveau actuel',
      unlockedByLabel: '',
      nextLabel: '',
      reachItLabel: '',
      progressionLabel: 'Parcours',
      noLevelTitle: 'Verrouillé',
      noLevelBody: 'Terminez une partie pour débloquer votre premier niveau.',
      maxLevelBody: 'Vous avez atteint le plus haut niveau.',
      currentPill: 'Vous êtes ici',
      unlockedPill: 'Débloqué',
      lockedPill: 'Verrouillé',
      byLevel: {
        1: {
          label: 'BRONZE',
          unlock: 'Terminer une partie.',
          sheetBody: 'Vous avez décroché votre premier rang.'
        },
        2: {
          label: 'ARGENT',
          unlock: 'Voir 25 questions.',
          sheetBody: 'Votre lecture des règles devient plus solide.'
        },
        3: {
          label: 'OR',
          unlock: 'Voir 75 questions ou marquer 20+.',
          sheetBody: 'Vous passez du repère au vrai niveau de jeu.'
        },
        4: {
          label: 'PLATINE',
          unlock: 'Voir les 200 questions une fois.',
          sheetBody: 'Vous avez vu tout le jeu de questions une fois.'
        },
        5: {
          label: 'DIAMANT',
          unlock: 'Corriger les erreurs actives et réussir 70%+ en Mode Rapide avec une sélection de 16+ questions.',
          sheetBody: 'Vous avez prouvé vos règles sous pression.'
        },
        6: {
          label: 'LÉGENDE',
          unlock: 'Réussir 85%+ en Mode Rapide avec une sélection de 50+ questions.',
          sheetBody: 'Vous avez atteint le plus haut rang. Gardez vos règles à jour.'
        }
      }
    },

    ui: {
      chancesLabel: 'Erreurs',
      mistakesLabel: 'Erreurs',
      scoreLabel: 'Score',
      scoreAriaTemplate: 'Score : {score} {fpShort}',
      fpShort: '',
      fpLong: '',
      trueLabel: 'Vrai',
      falseLabel: 'Faux',
      gameOverTitle: 'Partie terminée',

      contentLoadingToast: 'Chargement des questions...',
      poolReshuffledToast: 'Questions mélangées à nouveau. Nouvel ordre.',
      seenProgressTemplate: 'Vous avez vu {seen}/{poolSize} questions.',

      startRunTypeFree: 'Votre première partie gratuite',
      startRunTypeLastFree: 'Dernière partie gratuite. Donnez le meilleur',
      startRunTypeUnlimited: '',
      startRunTypePractice: 'Mode Erreurs',

      startRunChancesOverlay:
        'Bonne réponse : +1 point.\nMauvaise réponse : +1 erreur.\nLa partie se termine après {maxChances} erreurs.',
      startOverlayTapAnywhere: "Appuyez n'importe où pour commencer",
      dailyChallengeStartOverlayLabel: 'Le défi du jour est actif',
      dailyChallengeStartOverlayLineTemplate:
        '{targetScore}+ = +1 jeton Mode Rapide',

      lastChanceOverlay: "Plus qu'une erreur autorisée.",
      gameOverOverlay: 'Partie terminée.',

      chanceLostDeltaText: '-1',
      mistakeGainedDeltaText: '+1',
      scoreGainedDeltaText: '+1',

      bestScoreLabel: 'Record',
      bestScoreAriaTemplate: 'Record : {best}'
    },

    secretBonus: {
      chestAria: 'Mode Rapide',
      ticketBadgeAriaTemplate: 'Jetons Mode Rapide : {tickets}/{cap}',
      chestHint: '',
      starterTicketToast:
        "1 jeton Mode Rapide ajouté. Vous pouvez l'utiliser maintenant.",
      noSeenWordsToast:
        "Le Mode Rapide est vide pour l'instant. Jouez quelques parties pour agrandir votre sélection.",
      badge: 'MODE RAPIDE',

      endTitle: '',
      scoreLine: 'Score : {score}',
      endStatsLine: '',
      endStatsLineOne: '',
      endDeckSizeLine: 'Sélection Mode Rapide : {count} questions.',
      endDeckSizeLineOne: 'Sélection Mode Rapide : 1 question.',
      endPoolProgressTemplate: '{cleared}/{shown} correctes sur ce tour.',
      endDeckExhaustedToast: 'Toutes les questions disponibles ont été jouées.',
      mistakesTitle: 'Questions à revoir',
      mistakesToggle: '{count} erreurs',
      mistakesNone: 'Aucune erreur.',

      newBest: 'NOUVEAU MEILLEUR SCORE.',
      celebrationPerfect: 'PARTIE PARFAITE',
      labelByTier: {
        perfect: 'RAPIDE ET PROPRE',
        high: 'MAINS RAPIDES',
        medium: 'TROUVEZ VOTRE RYTHME',
        low: 'VÉRIFIEZ VOTRE RYTHME'
      },

      endByTier: {
        perfect: [
          "Vous l'avez prouvé sous la pression.",
          'Vous avez répondu à ces questions instantanément.'
        ],
        high: [
          'Vous avez tenu sous la pression.',
          'Votre connaissance des règles a bien tenu.'
        ],
        medium: [
          'Vous avez trouvé votre rythme.',
          'Ce mode récompense un rappel solide des règles.'
        ],
        low: [
          'Le rythme vous a devancé.',
          'Ici il faut à la fois la mémoire et le contrôle.'
        ]
      },
      endLineZero: 'Le rythme vous a devancé cette fois.',

      endRecoByTier: {
        perfect_small:
          'Élargissez votre sélection pour débloquer plus de questions en Mode Rapide.',
        perfect_medium: 'Rejouez pour garder cet avantage.',
        perfect_large: 'Votre sélection Mode Rapide est solide : continuez.',
        high_small:
          'Élargissez votre sélection pour débloquer plus de questions en Mode Rapide.',
        high_medium: 'Réessayez pour ancrer celles que vous avez ratées.',
        high_large: "Restez en Mode Rapide : c'était une belle partie.",
        medium_small:
          "Élargissez d'abord votre sélection. Plus de questions vues = Mode Rapide plus solide.",
        medium_medium:
          'Refaites une partie en Mode Rapide pour renforcer votre rappel.',
        medium_large: "Continuez. La mémoire s'ancre avec la répétition.",
        low_small:
          "Élargissez d'abord votre sélection. Plus de questions vues = Mode Rapide plus solide.",
        low_medium:
          'Refaites une partie en Mode Rapide pour reprendre confiance.',
        low_large: 'Réessayez : la mémoire vient avec la pratique.'
      },

      ctaByTier: {
        perfect: 'Continuez à le prouver',
        high: 'Restez en Mode Rapide',
        medium: 'Réessayez le Mode Rapide',
        low: 'Réessayez le Mode Rapide'
      },
      ctaExpandDeck: 'Élargir la sélection',

      startOverlayLine1: 'Mode Rapide.',
      startOverlayLine2: 'Uniquement les questions déjà vues.',
      startOverlayLine3: 'Jouez plus de parties pour agrandir votre sélection.',

      startOverlayFreeRunsLimitLine:
        '{tickets} jeton{pluralS} restant{pluralS}. Coût : {cost} jeton{costPluralS}.',

      freeLimitReachedTitle: 'Aucun jeton Mode Rapide disponible.',
      freeLimitReachedBody:
        "Le Mode Rapide coûte {cost} jeton{costPluralS}.\nJouez le défi du jour pour en gagner un, ou débloquez l'accès complet pour continuer à jouer.",
      freeLimitReachedCta: 'Continuer à jouer',
      freeLimitReachedClose: 'Plus tard',
      startOverlayTapAnywhere: "Appuyez n'importe où pour commencer",

      title: 'Quiz Pickleball',
      subtitle: 'Mode Rapide',
      questionPrompt: 'Vrai ou faux ?',
      dangerLineLabel: 'LIGNE LIMITE',
      dangerLineAria:
        "Ligne limite. Si la carte atteint cette ligne, l'élément est perdu.",
      seenOnlyLine: '{count} questions dans votre sélection Mode Rapide.',

      modalTitle: 'Mode Rapide',
      modalBody:
        "Le Mode Rapide est plus rapide et plus exigeant.\nIl n'utilise que les questions que vous avez déjà vues.\nCoût : {cost} jeton{costPluralS}.\nDisponible maintenant : {tickets}.",
      modalCta: 'Jouer en Mode Rapide (1 jeton)',
      ticketRequiredTitle: 'Aucun jeton Mode Rapide disponible.',
      ticketRequiredBodyDaily:
        "Le Mode Rapide coûte {cost} jeton{costPluralS}.\nVous en avez {tickets} pour l'instant.\nJouez le défi du jour pour en gagner un.",
      ticketRequiredBodySpentToday:
        "Le Mode Rapide coûte {cost} jeton{costPluralS}.\nVous en avez {tickets} pour l'instant.\nLe gain du jour a déjà été réclamé. Revenez demain pour un nouveau défi et un nouveau jeton.",
      ticketRequiredBodyPremium:
        "Le Mode Rapide coûte {cost} jeton{costPluralS}.\nVous en avez {tickets} pour l'instant.\nJouez une partie et réussissez le défi du jour pour en gagner un.",
      ticketRequiredBodyLocked:
        "Le Mode Rapide coûte {cost} jeton{costPluralS}.\nVous en avez {tickets} pour l'instant.\nVos parties gratuites sont terminées. Débloquez l'accès complet pour continuer à jouer et gagner plus de jetons.",
      ticketRequiredCtaDaily: 'Jouer le défi du jour',
      ticketRequiredCtaRun: 'Jouer une partie',
      ticketRequiredCtaPaywall: "Débloquer l'accès complet",
      ticketRequiredClose: 'Plus tard'
    },

    practice: {
      title: 'Mode Erreurs',
      on: 'Activé',
      off: 'Désactivé',

      premiumOnly: 'Accès complet uniquement',
      descLocked: 'Rejouez les questions à retravailler.',
      valueLine: 'Concentrez-vous sur vos questions à retravailler.',
      descUnlocked: 'Uniquement les questions ratées précédemment.',

      freeLimitReachedTitle: 'Ça progresse.',
      freeLimitReachedBody:
        "Vous avez utilisé vos {limit} parties gratuites en Mode Erreurs.\n\nL'accès complet débloque le Mode Erreurs en illimité.\nContinuez à corriger ce qui vous manque.\nSans limite.",
      freeLimitReachedCta: 'Continuer à jouer',
      freeLimitReachedClose: 'Plus tard',

      endTitle: '',
      endLine: 'Continuez.',
      allFixedLine: 'Vous avez tout bouclé.',
      celebrationAllCleared: 'BELLE FINITION',
      labelByTier: {
        last: 'LA DERNIÈRE',
        light: 'BONNE RÉCUPÉRATION',
        firm: 'ÇA REVIENT',
        direct: 'TENEZ BON'
      },
      endLineAllFixed: 'Vous avez tout bouclé.',
      endLineZero: 'Ces questions demandent un autre passage.',
      endStatsLineAllFixed: 'Vous avez corrigé {fixed}.',
      endLineByTier: {
        last: 'Belle récupération.',
        light: 'Bonne récupération.',
        firm: "C'est du progrès.",
        direct: 'Vous progressez.'
      },
      endStatsLine: 'Vous avez corrigé {fixed}. Il vous en reste {remaining}.',

      endRepeatNoteByTier: {
        last: "Plus qu'une question. Bouclez-la maintenant.",
        light: '',
        firm: 'Quelques questions demandent un autre passage.',
        direct:
          'Restez en Mode Erreurs. Ce sont les questions qui demandent du travail.'
      },

      scoreLine: 'Score : {score}',
      playingProgressLine: '{current}/{total}',

      startRunChancesOverlayPractice:
        "Uniquement vos questions ratées.\nJusqu'à 10 par partie.\nCorrigez-la et elle sort. Ratez-la et elle revient.",
      startOverlayTapAnywhere: "Appuyez n'importe où pour commencer",
      ctaPracticeAgain: 'Refaire le Mode Erreurs',

      ctaRepeatByTier: {
        last: 'Corrigez la dernière question',
        light: 'Corrigez vos erreurs encore une fois',
        firm: 'Rejouer le Mode Erreurs',
        direct: 'Restez en Mode Erreurs'
      },

      playing: {
        questionLabel: 'Question',
        assertion: 'Cette affirmation est-elle vraie ou fausse ?',
        answersAria: 'Choix de réponse',
        questionHeadingTemplate: '',
        feedbackTitleOk: '',
        feedbackTitleBad: '',
        newBestScore: 'Nouveau meilleur score.',
        feedbackRelationSameTemplate: '{question}',
        feedbackRelationDifferentTemplate: '{question}'
      }
    },

    micropics: {
      runContinues: 'Bien joué. Continuez.',
      nearMiss: 'Tout près. Celle-là vous attendait.',
      repeatMistake: 'Celle-ci vous piège encore. Ralentissez et relisez.',
      streakStart: "3 d'affilée. Bon départ.",
      streakBuilding: "6 d'affilée. Vous les connaissez.",
      streakStrong: "10 d'affilée. Vous les connaissez.",
      streakElite: "15 d'affilée. Belle série.",
      streakLegendary: "20 d'affilée. Des bases solides.",
      streakAgainTemplate: "{streak} d'affilée encore.",
      recovery: "Voilà, c'est ça.",
      runEndedAllChancesUsed: ''
    },

    end: {
      title: '',

      poolCompleteTitle: 'Toutes les questions vues.',
      poolCompleteLine1:
        'Vous avez parcouru tout le quiz. Maintenant, rejouez, corrigez les erreurs et consolidez les règles.',
      poolCompleteLine2:
        'Revenez plus tard pour voir ce qui reste vraiment acquis.',
      directToConsolidationLine:
        "Vous avez terminé tout l'ensemble sans erreur active : vous passez directement en phase 3.",
      poolCompleteScoreLine: 'Cette partie : {score} {fpShort}',
      poolCompleteCtaPrimary: 'Rejouer dans un nouvel ordre',
      poolCompleteCtaPractice: 'Corriger vos erreurs',

      freeLimitReachedTitle: 'Belle partie.',
      freeLimitReachedBody:
        "Vous avez utilisé vos {limit} parties gratuites.\n\nL'accès complet débloque des parties illimitées, les 200 questions du jeu sur les règles du pickleball, les explications après chaque réponse, le Mode Erreurs illimité et le retour quotidien du défi du jour.",
      freeLimitReachedCta: 'Continuer à jouer',
      freeLimitReachedClose: 'Plus tard',

      endLine: '',
      endStatsLine: '',

      identityByVerdict: {
        none: 'Quelques questions vous échappent encore.',
        start: 'Vous prenez vos repères.',
        building: 'Vous commencez à comprendre ces règles.',
        strong: 'Vous connaissez plus de règles maintenant.',
        elite: 'Vous connaissez bien ces règles.',
        legendary: 'Vous connaissez vraiment ces règles.'
      },
      identityZero: 'Ces règles demandent un autre passage.',

      ctaByVerdict: {
        none: 'Rejouer',
        start: 'Rejouer : visez 6+',
        building: 'Rejouer : visez 10+',
        strong: 'Rejouer : visez plus haut',
        elite: 'Rejouer : consolidez les questions restantes',
        legendary: 'Rejouer'
      },

      strongestTagLine: 'Votre meilleure catégorie : {tag}.',
      weakestTagLine: 'Catégorie à retravailler : {tag}.',

      endTagHighlights: {
        '2026 Changes':
          'Les changements de règles de 2026 ont été votre catégorie la plus difficile sur cette partie.'
      },

      scoreLine: 'Score : {score} {fpLong}',
      personalBestLine: 'Meilleur score : {best} {fpLong}',
      nearBestLine: '{delta} {fpLong} du meilleur score.',
      streakLine: '',
      scoreTierLine: '',
      scoreTierNextLine: '',
      dailyChallengeCleared: 'Défi du jour réussi.',
      dailyChallengeClearedFreeRun:
        'Défi du jour réussi. Le jeton Mode Rapide se gagne sur votre dernière partie gratuite.',
      dailyChallengeTicketWon: 'Défi du jour réussi. +1 jeton Mode Rapide.',
      dailyChallengeTicketCapped:
        'Défi du jour réussi. Les jetons sont plafonnés à {cap}. Dépensez-en un pour en regagner.',
      dailyChallengeMiss: 'Défi du jour manqué.',
      dailyChallengeMissLastFree:
        'Pas cette fois. Défi du jour manqué.',
      dailyChallengeCtaRetry: 'Retenter le défi du jour',
      dailyChallengeToast: 'Défi du jour réussi. +1 jeton Mode Rapide.',
      modeMissingFallback: 'Le récapitulatif de votre partie reste disponible.',
      beatBestLine:
        'Prochain objectif : dépasser votre meilleur score avec {target}+.',
      beatBestFirstLine: '',
      freeRunLeft:
        'Il vous reste {remaining} partie{pluralS} gratuite{pluralS}.',

      mistakesTitle: 'Questions à revoir',
      mistakesNone: 'Aucune erreur.',
      mistakesToggle: '{count} erreurs',

      newBest: 'NOUVEAU MEILLEUR SCORE',
      labelByVerdict: {
        none: 'PREMIERS ÉCHANGES',
        start: 'PREMIER PASSAGE',
        building: 'EN PROGRÈS',
        strong: 'BONNE PARTIE',
        elite: 'BASES ACQUISES',
        legendary: 'TRÈS SOLIDE'
      },
      houseAdSummaryLabel: 'Enchaînez avec une autre partie',
      playAgain: 'Rejouer',

      practiceCta: 'Corriger ce que vous avez raté',
      practiceCtaTemplate: 'Corrigez vos {count} erreur{pluralS}',

      bonusCtaPrimary: 'Jouer en Mode Rapide (1 jeton)',

      practiceCtaCountPremium: 'Corriger ce que vous avez raté',
      shareTitle: 'Partager le jeu'
    },

    paywall: {
      headline: 'Entrez sur le terrain en sachant quoi annoncer.',
      headlineLastFree: "C'était l'aperçu gratuit. Débloquez le jeu complet.",

      progressLine1:
        'Vous avez vu {seen} questions. Il en reste {remaining} dans le quiz complet.',
      progressLine2: '',

      payOnceLine: "Payez une fois. Pas d'abonnement.",

      valueTitle: 'Ce que vous obtenez',
      trustTitle: 'Déverrouillage simple',
      compactTitle: 'Ce qui se débloque',
      compactBullets: [
        '**Les 200 questions du jeu sur les règles du pickleball**',
        '**Parties illimitées**',
        '**Enregistrez votre score et faites progresser votre meilleur résultat**',
        '**Voyez les meilleurs scores du classement**',
        '**Explications après chaque réponse**',
        '**Mode Erreurs** et jeu hors ligne'
      ],

      valueBullets: [
        '**Les 200 questions du jeu sur les règles du pickleball**',
        '**Parties illimitées** sur tout le jeu',
        '**Enregistrez votre score et faites progresser votre meilleur résultat**',
        '**Voyez les meilleurs scores du classement**',
        '**Un mélange de questions faciles, intermédiaires et difficiles**',
        '**Explications après chaque réponse**',
        '**Mode Erreurs illimité** pour corriger ce qui vous a manqué'
      ],

      bridgeTitle: 'Connaissez mieux les règles du pickleball.',
      bridgeBody:
        "Débloquez des parties illimitées, les 200 questions du jeu, voyez les meilleurs scores du classement, utilisez le Mode Erreurs et revenez chaque jour pour le défi du jour.",
      bridgeBodyLastFreeMiss:
        'Vous avez vu le rythme du jeu. Débloquez des parties illimitées, les 200 questions du jeu, voyez les meilleurs scores du classement, utilisez le Mode Erreurs et revenez pour le défi du jour.',

      trustLine: '**Déverrouillage unique**',
      trustBullets: [
        "**Paiement unique**, pas d'abonnement",
        "**Pas de compte** ni d'e-mail requis",
        "**Gardez votre code** comme sauvegarde si vous changez d'appareil ou effacez vos données",
        '**Fonctionne hors ligne** après le premier chargement',
        '**Paiement sécurisé** via Stripe'
      ],

      socialProofTitle: 'Leurs retours après quelques parties',
      socialProofQuotes: [
        {
          quote:
            "★★★★★\nJe pensais tout connaître. J'ai découvert trois règles que je comprenais mal au club. Les explications aident vraiment.",
          author: 'Christine, joueuse en club'
        },
        {
          quote:
            "★★★★★\nEn deux parties, j'ai réalisé que je faisais des erreurs depuis des mois.",
          author: 'Jean, retraité'
        }
      ],

      savingsLineTemplate: 'Économisez {saveAmount} avec le prix de lancement.',
      checkoutNote:
        'Paiement traité en toute sécurité par Stripe. En général, cela prend environ 30 secondes.',
      checkoutRedirecting: 'Redirection vers le paiement sécurisé...',

      ctaEarly: "Débloquer l'accès complet pour 4,99 $",
      ctaStandard: "Débloquer l'accès complet pour 6,99 $",
      cta: "Obtenir l'accès complet",

      alreadyHaveCode:
        'Vous avez déjà un code de déverrouillage ? Utilisez-le ici.',
      deviceNote:
        'Déverrouillage instantané. Pas de compte requis. Gardez votre code comme sauvegarde.',

      earlyBadgeLabel: 'Prix de lancement',
      earlyLabel: 'Prix de lancement',
      standardLabel: 'Prix standard',
      timerLabel: 'Le prix augmente dans :',

      postEarlyLine1: 'Le prix de lancement est terminé.',
      postEarlyLine2:
        '{standardPrice}. Payez une fois. Gardez votre code comme sauvegarde.'
    },

    howto: {
      title: 'Comment jouer',
      howToPlayLine1:
        'Vous voyez une affirmation sur les règles du pickleball.',
      howToPlayLine2: 'Décidez si elle est vraie ou fausse.',
      howToPlayLine3: 'Choisissez Vrai ou Faux.',
      audioTitle: 'Audio des questions',
      autoReadLabel: 'Lire automatiquement les questions',
      autoReadHelp:
        'Lit automatiquement chaque nouvelle question à voix haute. Vous pouvez toujours la relire ou arrêter la lecture pendant la partie.',
      autoReadOn: 'Activé',
      autoReadOff: 'Désactivé',

      modesTitle: 'Modes de jeu',
      modesBullets: [
        'Partie classique : découvrez toutes les questions et apprenez les règles.',
        "Mode Rapide : plus rapide et plus exigeant. N'utilise que les questions déjà vues.",
        "Mode Erreurs : rejouez ce que vous avez raté (jusqu'à 10 questions)."
      ],

      ruleTitle: 'Règle de base',
      ruleSentence:
        'Chaque bonne réponse ajoute 1 point. Une mauvaise réponse ajoute 1 erreur. Après {maxChances} erreurs, la partie est terminée.',
      premiumTitle: 'Accès complet',
      alreadyPremium: "L'accès complet est déjà activé sur cet appareil.",
      activateTitle: 'Utiliser un code de déverrouillage',
      activateLine1:
        'Vous avez déjà un code de déverrouillage ? Utilisez-le ici.',
      activateLine2:
        'Pas besoin de compte. Gardez votre code comme sauvegarde.',
      activationCodeLabel: 'Code de déverrouillage',
      activationCodePlaceholder: 'PRQ-0000-0000',
      enterCode: 'Entrez un code.',
      codeRejected: 'Code refusé.',
      codeChecking: 'Vérification du code...',
      activateCta: 'Activer',
      codeInvalid: 'Format de code invalide.',
      codeUsed: 'Cet appareil a déjà utilisé un code.',
      codeOk: 'Accès complet activé sur cet appareil.',

      autoActivateTitle: 'Code de déverrouillage prêt',
      autoActivateLine1:
        'Votre code de déverrouillage est déjà enregistré ici.',
      autoActivateLine2:
        "Activer l'accès complet sur cet appareil maintenant ?",
      autoActivateCta: 'Débloquer maintenant',
      autoActivateLater: 'Plus tard'
    },

    postCompletion: {
      title: 'Vous avez tout vu.',
      body: 'Continuez à progresser. Travaillez vos erreurs, explorez le Mode Rapide ou rejouez des parties complètes.',

      masteredTitle:
        'Bravo ! Vous avez répondu correctement à toutes les questions.',
      masteredLine1:
        'Zéro erreur restante. Chaque question répondue correctement.',
      masteredLine2:
        'Maintenant, mettez votre connaissance des règles sous pression. Puis revenez dans quelques semaines voir si ça tient encore.',
      masteredCtaBonus: 'Vous tester en Mode Rapide',
      masteredCtaReplay: 'Rejouer dans un nouvel ordre',

      waitlistTitle: 'Recevoir les nouveautés',
      waitlistBody1:
        'Recevez un message quand de nouvelles questions ou fonctionnalités sont ajoutées.',
      waitlistBody2:
        'Pas de spam. Pas de compte. Désinscription à tout moment.',
      waitlistCta: 'Être prévenu',
      waitlistDisclaimer:
        'Adresse e-mail uniquement. Désinscription à tout moment.',
      houseAdCta: 'Explorer Bonjour Pickleball'
    },

    houseAd: {
      eyebrow: 'Après {poolSize} questions',
      title: 'Vous connaissez les règles. Prochaine étape : la France.',
      bodyLine1:
        'Carole, la créatrice de Quiz Pickleball, partage son temps entre les États-Unis et la France.',
      bodyLine2:
        'Rejoignez la liste Bonjour Pickleball pour de futurs voyages, stages et expériences en petit groupe en France.',
      ctaPrimary: 'Voir les voyages en France',
      ctaRemindLater: 'Me le rappeler plus tard',

      landingTitle: 'Vous connaissez les règles. Prochaine étape : la France.',
      landingBodyLine1:
        'Carole, la créatrice de Quiz Pickleball, partage son temps entre les États-Unis et la France.',
      landingBodyLine2:
        'Rejoignez la liste Bonjour Pickleball pour de futurs voyages, stages et expériences en petit groupe en France.',
      landingCtaPrimary: 'Voir les voyages en France',
      landingCtaRemindLater: 'Me le rappeler plus tard'
    },

    waitlist: {
      ctaLabel: 'Recevoir les futurs produits ou fonctionnalités.',
      disclaimer: 'Pas de spam. Pas de compte. Désinscription à tout moment.',
      title: 'Recevoir les futurs produits ou fonctionnalités.',
      bodyLine1: 'Pas de spam. Pas de compte. Désinscription à tout moment.',
      bodyLine2: 'Facultatif : ajoutez une idée.',
      inputPlaceholder: 'Facultatif : partagez une idée.',
      cta: "Préparer l'e-mail",

      emailSubjectSuffix: "Liste d'attente",
      emailBodyTemplate: `Bonjour !

J'aimerais rejoindre la liste d'attente de Quiz Pickleball.

Idée optionnelle :
{idea}

Merci !`
    },

    share: {
      ctaLabel: 'Copier le message',
      emailLabel: "Préparer l'e-mail",
      emailSubject: 'Essaie Quiz Pickleball',
      previewLabel: 'Aperçu du message',
      toastCopied: 'Copié.',
      template: `Je viens de découvrir Quiz Pickleball.
Essayez celle-ci :
{funFact}

{scoreChallenge}
{url}`,
      scoreChallengeWithBest: 'Mon meilleur score pour l’instant : {bestScore}. Tu veux essayer ?',
      scoreChallengeWithoutBest: 'Tu veux essayer ?',

      teaserTrap: "Ça paraît évident... jusqu'à ce que non.",
      teaserTrue: 'Parfois la réponse évidente est la bonne.',
      funFactTemplatesTrap: [`"{question}" Vrai ou faux ? 🤔`],
      funFactTemplatesTrue: [`"{question}" Vrai ou faux ? 🤔`]
    },

    installPrompt: {
      title: 'Installer Quiz Pickleball',
      body: "Ajoutez-la à votre écran d'accueil et ouvrez-la comme une application.\nPas d'App Store. Pas de compte. Un geste pour jouer.",
      bodyIOS:
        "Sur iPhone, appuyez sur Partager, puis Ajouter à l'écran d'accueil.",
      ctaPrimary: "Installer l'application",
      ctaPrimaryIOS: 'Voir les étapes iPhone',
      ctaSecondary: 'Plus tard'
    },

    statsSharing: {
      sectionTitle: 'Retour anonyme (optionnel)',
      buttonLabel: 'Partager des statistiques de jeu anonymes',

      promptTitle: 'Aidez à améliorer les questions',
      promptBodyTemplate:
        "Vous avez maintenant vu {thresholdPct}% de l'ensemble des questions. Partagez des statistiques de jeu anonymes pour aider à améliorer la difficulté, les formulations et l'ordre des questions. Vous pouvez tout relire avant d'envoyer.",
      promptBodyLastFree:
        "C'était votre dernière partie gratuite. Partagez des statistiques de jeu anonymes pour aider à améliorer la difficulté, les formulations et l'ordre des questions. Vous pouvez tout relire avant d'envoyer.",
      promptBodyPowerUser:
        "Vous avez assez joué pour que vos statistiques soient utiles. Partagez des statistiques de jeu anonymes pour aider à améliorer la difficulté, les formulations et l'ordre des questions. Vous pouvez tout relire avant d'envoyer.",
      promptCtaPrimary: "Voir avant d'envoyer",
      promptCtaSecondary: 'Plus tard',

      modalTitle: 'Vérifier les statistiques anonymes',
      modalDescription:
        "Cet e-mail contient votre résumé de jeu, les questions que vous ratez le plus, et des totaux d'usage anonymes.\nAucune donnée personnelle n'est incluse.\nVous pouvez vérifier exactement ce qui sera envoyé ci-dessous.",
      previewLabel: 'Ce qui sera envoyé :',
      ctaSend: "Préparer l'e-mail",
      ctaCancel: 'Annuler',
      ctaLater: 'Plus tard',
      ctaCopy: 'Copier les statistiques',
      noStatsToast: 'Pas encore de statistiques à partager.',
      successToast:
        "Brouillon d'e-mail ouvert. Envoyez-le si vous voulez partager vos statistiques.",
      copyToast: 'Statistiques copiées dans le presse-papier.',
      mailtoFallbackToast:
        "Statistiques copiées dans le presse-papier. Collez-les dans le brouillon d'e-mail."
    },

    support: {
      label: 'Contact',
      modalTitle: 'Écrivez-nous',
      modalBodyLine1: "L'e-mail est le moyen le plus rapide de nous joindre.",
      modalBodyLine2: "Choisissez une raison ci-dessous ou copiez l'adresse.",
      emailSubjectSuffix: 'Retour',
      ctaCopy: "Copier l'e-mail",
      ctaOpen: "Ouvrir l'application e-mail",
      emailUnavailableToast: "L'e-mail n'est pas disponible pour le moment.",
      ctaBug: 'Signaler un problème',
      ctaQuestion: 'Question',
      ctaIdea: 'Idée',
      bugSubjectSuffix: 'Signalement de problème',
      questionSubjectSuffix: 'Question',
      ideaSubjectSuffix: 'Idée',

      emailBodyTemplate: `Bonjour !

Je vous écris au sujet de Quiz Pickleball.

Message :




Merci !`,
      bugBodyTemplate: `Bonjour !

Je vous écris au sujet de Quiz Pickleball.

Signalement de problème :

Ce qui s'est passé :

Ce à quoi je m'attendais :

Appareil / navigateur :


Merci !`,
      questionBodyTemplate: `Bonjour !

Je vous écris au sujet de Quiz Pickleball.

Question :



Merci !`,
      ideaBodyTemplate: `Bonjour !

Je vous écris au sujet de Quiz Pickleball.

Idée :



Merci !`
    },

    notFound: {
      title: 'Hors limites.',
      line1: 'Cette page a atterri en dehors du terrain.',
      line2: 'Bonne nouvelle : Quiz Pickleball est toujours prêt à jouer.',
      cta: 'Retour au jeu'
    }
  };
})();

/* ===== wording-bootstrap.js ===== */
// wording-bootstrap.js — sets window.WT_WORDING (legacy alias) BEFORE i18n.js runs.
// This file MUST be loaded AFTER wording-en.js + wording-fr.js (and any other locales),
// but BEFORE i18n.js (which will overwrite WT_WORDING with the resolved active locale).
//
// Why this exists: code that runs at parse-time (e.g. ui.js line 16 sanity check) reads
// window.WT_WORDING. We need it set to *something* even before i18n.js resolves the locale.
(() => {
  "use strict";
  try {
    const cfg = window.WT_CONFIG;
    const defaultLoc = (cfg && cfg.i18n && cfg.i18n.defaultLocale) || "en";
    const all = window.WT_WORDING_ALL || {};
    const bootstrapTree = all[defaultLoc] || all.en || window.WT_WORDING || {};
    window.WT_WORDING = bootstrapTree;
  } catch (_) { /* silent */ }
})();

/* ===== i18n.js ===== */
// i18n.js - Locale management
// SINGLE SOURCE OF TRUTH for active locale. Loads BEFORE wording.js.
// Resolves active locale from:
// ?lang= URL param > page locale hint > localStorage > navigator.language > defaultLocale.
// Exposes WT_I18N global: { getLocale, setLocale, getSupportedLocales, isSupported, onChange }.
// Dispatches "wt:locale-change" CustomEvent on window when locale changes.
//
// Contract:
// - config.js MUST load before this file (provides WT_CONFIG.i18n + WT_WORDING_ALL)
// - wording.js MUST load AFTER this file (reads window.WT_WORDING which is set here)
//
// Behavior:
// - Sets window.WT_WORDING = WT_WORDING_ALL[activeLocale]
// - Sets <html lang="..."> to active locale
// - Persists chosen locale to localStorage under WT_CONFIG.i18n.localeStorageKey
// - On setLocale(): updates window.WT_WORDING, html.lang, storage, fires event

(() => {
  "use strict";

  const cfg = window.WT_CONFIG;
  const all = window.WT_WORDING_ALL;

  // Fail-closed: if i18n config or wording bank missing, fall back to legacy WT_WORDING (EN-only).
  // This keeps the app functional even if the bilingual layer is partially deployed.
  if (!cfg || !cfg.i18n || !all) {
    if (!window.WT_WORDING) {
      // Truly nothing wired: fatal.
      try { console.error("[WT_I18N] WT_CONFIG.i18n or WT_WORDING_ALL missing AND WT_WORDING absent."); } catch (_) { /* silent */ }
    }
    // Stub WT_I18N so the toggle component degrades gracefully
    window.WT_I18N = {
      getLocale: () => "en",
      setLocale: () => false,
      getSupportedLocales: () => ["en"],
      isSupported: (l) => l === "en",
      onChange: () => () => {}
    };
    return;
  }

  const i18nCfg = cfg.i18n;
  const SUPPORTED = Array.isArray(i18nCfg.supportedLocales) && i18nCfg.supportedLocales.length
    ? i18nCfg.supportedLocales.slice()
    : ["en"];
  const DEFAULT = String(i18nCfg.defaultLocale || "en").toLowerCase();
  const STORAGE_KEY = String(i18nCfg.localeStorageKey || "pickleball-rules-quiz:locale");

  function isSupported(loc) {
    return typeof loc === "string" && SUPPORTED.indexOf(loc) !== -1;
  }

  function normalize(loc) {
    if (!loc || typeof loc !== "string") return null;
    const lower = loc.trim().toLowerCase();
    // Accept "fr-FR", "fr_FR", "fr" — collapse to primary subtag.
    const primary = lower.split(/[-_]/)[0];
    return isSupported(primary) ? primary : null;
  }

  function readUrlParam() {
    try {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get("lang");
      return normalize(raw);
    } catch (_) {
      return null;
    }
  }

  function readStorage() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return normalize(raw);
    } catch (_) {
      return null;
    }
  }

  function readDocumentHint() {
    try {
      const raw = document.documentElement.getAttribute("data-wt-locale-hint");
      return normalize(raw);
    } catch (_) {
      return null;
    }
  }

  function writeStorage(loc) {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(loc));
    } catch (_) {
      // Private mode / quota exceeded — silently fail. The session-level locale remains active.
    }
  }

  function getDeviceLocaleCandidates() {
    const raw = [];
    try {
      if (Array.isArray(navigator.languages) && navigator.languages.length) {
        raw.push(...navigator.languages);
      }
      raw.push(navigator.language || "");
      raw.push(navigator.userLanguage || "");
    } catch (_) { /* silent */ }
    return raw
      .map((loc) => normalize(loc))
      .filter(Boolean)
      .filter((loc, index, arr) => arr.indexOf(loc) === index);
  }

  function readDeviceLocale() {
    const langs = getDeviceLocaleCandidates();
    return langs.length ? langs[0] : null;
  }

  function resolveInitialLocale() {
    // Priority order per PRD:
    // 1. URL ?lang= (overrides at first load — used for shared links)
    // 2. page locale hint (locale-specific static entry, e.g. fr.html)
    // 3. localStorage (persisted user choice)
    // 4. navigator.language (auto-detect at first visit)
    // 5. defaultLocale (fallback)
    return readUrlParam() || readDocumentHint() || readStorage() || readDeviceLocale() || DEFAULT;
  }

  function applyLocaleToDocument(loc) {
    try {
      document.documentElement.setAttribute("lang", String(loc));
    } catch (_) { /* silent */ }

    // Toggle locale-content sections in static pages (privacy, terms, press, etc.)
    try {
      const nodes = document.querySelectorAll("[data-wt-locale-content]");
      nodes.forEach((el) => {
        const targetLoc = String(el.getAttribute("data-wt-locale-content") || "").trim().toLowerCase();
        const shouldShow = (targetLoc === loc);
        el.classList.toggle("wt-hidden", !shouldShow);
        el.setAttribute("aria-hidden", shouldShow ? "false" : "true");
      });
    } catch (_) { /* silent */ }

    // Swap PWA manifest if a locale-specific manifest exists.
    // Convention: ./manifest.<locale>.json next to ./manifest.json
    // The default locale uses the base manifest.json with no suffix.
    try {
      const linkManifest = document.querySelector('link[rel="manifest"]');
      if (linkManifest) {
        const baseHref = linkManifest.getAttribute("data-wt-base-href")
          || linkManifest.getAttribute("href")
          || "./manifest.json";
        // Save base href once for future swaps
        if (!linkManifest.getAttribute("data-wt-base-href")) {
          linkManifest.setAttribute("data-wt-base-href", baseHref);
        }
        const targetHref = (loc === DEFAULT)
          ? baseHref
          : baseHref.replace(/manifest\.json$/i, `manifest.${loc}.json`);
        if (linkManifest.getAttribute("href") !== targetHref) {
          linkManifest.setAttribute("href", targetHref);
        }
      }
    } catch (_) { /* silent */ }
  }

  function applyLocaleToWording(loc) {
    // The whole point: WT_WORDING always points to the current locale's tree.
    // This means all existing data-wt-wording lookups and this.wording.* accesses
    // automatically resolve against the active language. No call-site changes needed.
    const tree = all[loc] || all[DEFAULT] || null;
    if (tree && typeof tree === "object") {
      window.WT_WORDING = tree;
    }
  }

  const listeners = new Set();

  function emitChange(prev, next) {
    // Internal listeners
    listeners.forEach((fn) => {
      try { fn(next, prev); } catch (_) { /* silent */ }
    });

    // Public event for any module that wants to react (ui.js re-render, etc.)
    try {
      window.dispatchEvent(new CustomEvent("wt:locale-change", {
        detail: { locale: next, previous: prev }
      }));
    } catch (_) { /* silent */ }
  }

  // --- Initial resolution ---
  let activeLocale = resolveInitialLocale();
  if (!isSupported(activeLocale)) activeLocale = DEFAULT;

  applyLocaleToWording(activeLocale);
  applyLocaleToDocument(activeLocale);
  writeStorage(activeLocale);

  // --- Public API ---
  window.WT_I18N = {
    getLocale() {
      return activeLocale;
    },

    getSupportedLocales() {
      return SUPPORTED.slice();
    },

    isSupported,

    setLocale(loc) {
      const normalized = normalize(loc);
      if (!normalized) return false;
      if (normalized === activeLocale) return true;

      const prev = activeLocale;
      activeLocale = normalized;

      writeStorage(activeLocale);
      applyLocaleToWording(activeLocale);
      applyLocaleToDocument(activeLocale);
      emitChange(prev, activeLocale);
      return true;
    },

    onChange(fn) {
      if (typeof fn !== "function") return () => {};
      listeners.add(fn);
      return () => listeners.delete(fn);
    }
  };
})();

/* ===== wording.js ===== */
// wording.js - shared DOM wording hydration for static pages and partial roots
// Locale-reactive: re-hydrates on "wt:locale-change" event.
// Loads AFTER i18n.js (which sets window.WT_WORDING to the active locale tree).
(() => {
  "use strict";

  function getByPath(root, path) {
    const key = String(path || "").trim();
    if (!key) return null;

    const parts = key.split(".");
    let cur = root;

    for (const part of parts) {
      if (!cur || typeof cur !== "object") return null;
      cur = cur[part];
    }

    return (typeof cur === "string") ? cur : null;
  }

  function hydrateText(root = document) {
    const wording = window.WT_WORDING;
    if (!root || !wording || typeof wording !== "object") return;

    try {
      const nodes = root.querySelectorAll("[data-wt-wording]");
      nodes.forEach((el) => {
        const text = getByPath(wording, el.getAttribute("data-wt-wording"));
        if (typeof text === "string") el.textContent = text;
      });
    } catch (_) { /* silent */ }
  }

  function hydrateAria(root = document) {
    const wording = window.WT_WORDING;
    if (!root || !wording || typeof wording !== "object") return;

    try {
      const nodes = root.querySelectorAll("[data-wt-aria-label]");
      nodes.forEach((el) => {
        const text = getByPath(wording, el.getAttribute("data-wt-aria-label"));
        if (typeof text === "string") el.setAttribute("aria-label", text);
      });
    } catch (_) { /* silent */ }
  }

  function hydrateBrand(root = document) {
    const wording = window.WT_WORDING;
    if (!root || !wording || typeof wording !== "object") return;

    try {
      const nodes = root.querySelectorAll('[data-wt-brand="creatorLine"]');
      if (!nodes.length) return;

      // Controlled editorial HTML only.
      // Contract: creatorLineHtml is defined in config.js, never sourced from user input.
      const html = String(wording.brand?.creatorLineHtml || "").trim();
      const text = String(wording.brand?.creatorLine || "").trim();
      nodes.forEach((el) => {
        if (html) el.innerHTML = html;
        else if (text) el.textContent = text;
      });
    } catch (_) { /* silent */ }
  }

  function hydrateHref(root = document) {
    // Locale-aware hrefs. Pattern: <a data-wt-href="footer.links.bonjourPickleball.href">
    // Companion to data-wt-wording for cases where the link destination differs by locale.
    const wording = window.WT_WORDING;
    if (!root || !wording || typeof wording !== "object") return;

    try {
      const nodes = root.querySelectorAll("[data-wt-href]");
      nodes.forEach((el) => {
        const href = getByPath(wording, el.getAttribute("data-wt-href"));
        if (typeof href === "string" && href) el.setAttribute("href", href);
      });
    } catch (_) { /* silent */ }
  }

  function hydrateMeta(root = document) {
    // Locale-aware <title> and <meta name="description">.
    // Pattern in <head>:
    //   <title data-wt-wording="meta.indexTitle">...</title>
    //   <meta name="description" data-wt-meta-description="meta.indexDescription">
    if (!root) return;
    const wording = window.WT_WORDING;
    if (!wording || typeof wording !== "object") return;

    try {
      const metas = root.querySelectorAll("meta[data-wt-meta-description]");
      metas.forEach((m) => {
        const text = getByPath(wording, m.getAttribute("data-wt-meta-description"));
        if (typeof text === "string") m.setAttribute("content", text);
      });
    } catch (_) { /* silent */ }
  }

  function hydrate(root = document) {
    hydrateText(root);
    hydrateAria(root);
    hydrateBrand(root);
    hydrateHref(root);
    hydrateMeta(root);
  }

  window.WT_Wording = {
    getByPath,
    hydrate,
    hydrateText,
    hydrateAria,
    hydrateBrand,
    hydrateHref,
    hydrateMeta
  };

  function onReady() {
    hydrate(document);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }

  // Locale reactivity: when the user changes language, re-hydrate everything.
  // For static pages (no ui.js), this is enough to fully retranslate the visible DOM.
  // For the game shell (index.html), main.js additionally triggers a UI re-render.
  try {
    window.addEventListener("wt:locale-change", () => {
      hydrate(document);
    });
  } catch (_) { /* silent */ }
})();

/* ===== icons.js ===== */
// icons.js - inline SVG icon helpers

(() => {
  "use strict";

  const ICONS = {
    "help-circle": `
      <circle cx="10" cy="10" r="7"></circle>
      <path d="M7.9 7.4a2.4 2.4 0 0 1 4.2 1.6c0 1.6-1.7 2.2-2.1 2.9"></path>
      <circle cx="10" cy="14.2" r="0.8" fill="currentColor" stroke="none"></circle>
    `,
    home: `
      <path d="M3.4 8.6L10 3.4l6.6 5.2"></path>
      <path d="M5.4 7.9V16h9.2V7.9"></path>
    `,
    zap: `
      <path d="M10.7 2.8L5.9 10h3.5l-0.7 7.2 5.4-7.8h-3.5l0.1-6.6z"></path>
    `,
    "volume-2": `
      <path d="M4.5 12.5H2.8V7.5h1.7L8.8 4.4v11.2z"></path>
      <path d="M12.2 7.2a4 4 0 0 1 0 5.6"></path>
      <path d="M14.8 4.8a7.4 7.4 0 0 1 0 10.4"></path>
    `,
    "chevron-right": `
      <path d="M7 5l6 5-6 5"></path>
    `,
    check: `
      <path d="M4.8 10.4l3.2 3.2 7.2-7.2"></path>
    `,
    x: `
      <path d="M5 5l10 10"></path>
      <path d="M15 5L5 15"></path>
    `
  };

  function renderIcon(name, options = {}) {
    const path = ICONS[String(name || "").trim()];
    if (!path) return "";

    const escapeHtml = window.WT_UTILS && typeof window.WT_UTILS.escapeHtml === "function"
      ? window.WT_UTILS.escapeHtml
      : (s) => String(s);
    const cls = String(options.className || "").trim();
    const label = String(options.label || "").trim();
    const hidden = label ? "" : ` aria-hidden="true"`;
    const labelAttr = label ? ` role="img" aria-label="${escapeHtml(label)}"` : "";

    return `
      <svg class="wt-icon${cls ? ` ${cls}` : ""}" viewBox="0 0 20 20" width="20" height="20"${hidden}${labelAttr} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false">
        ${path}
      </svg>
    `;
  }

  window.WT_ICONS = {
    renderIcon
  };
})();

/* ===== logic/rapidfire-logic.js ===== */
(function (root, factory) {
  'use strict';

  const api = factory();
  if (typeof module === 'object' && module && module.exports) {
    module.exports = api;
  }
  root.WT_RapidFireLogic = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function clampNonNegativeInt(n) {
    const x = Number(n);
    if (!Number.isFinite(x)) return 0;
    return Math.max(0, Math.floor(x));
  }

  function computeStarterTicketGrant(currentBalance, starterTickets, cap) {
    const current = clampNonNegativeInt(currentBalance);
    const starter = clampNonNegativeInt(starterTickets);
    const ticketCap = clampNonNegativeInt(cap);
    const nextBalance =
      ticketCap > 0
        ? Math.min(ticketCap, current + starter)
        : current + starter;

    return {
      nextBalance,
      granted: nextBalance > current,
      cap: ticketCap
    };
  }

  function computeDailyTicketGrant(currentBalance, cap, alreadyEarned) {
    const current = clampNonNegativeInt(currentBalance);
    const ticketCap = clampNonNegativeInt(cap);

    if (alreadyEarned === true) {
      return {
        nextBalance: current,
        granted: false,
        atCap: ticketCap > 0 && current >= ticketCap,
        cap: ticketCap
      };
    }

    const nextBalance =
      ticketCap > 0 ? Math.min(ticketCap, current + 1) : current + 1;

    return {
      nextBalance,
      granted: nextBalance > current,
      atCap: ticketCap > 0 && current >= ticketCap,
      cap: ticketCap
    };
  }

  function computeDailyChallengeTarget(
    existingDayKey,
    existingScore,
    nextDayKey,
    fallbackScore
  ) {
    const currentDayKey = String(existingDayKey || '').trim();
    const dayKey = String(nextDayKey || '').trim();
    const frozenScore = clampNonNegativeInt(existingScore);
    const nextScore = Math.max(1, clampNonNegativeInt(fallbackScore));

    if (!dayKey) return nextScore;
    if (currentDayKey === dayKey && frozenScore > 0) return frozenScore;
    return nextScore;
  }

  return {
    clampNonNegativeInt,
    computeStarterTicketGrant,
    computeDailyTicketGrant,
    computeDailyChallengeTarget
  };
});

/* ===== logic/leaderboard-logic.js ===== */
(function (root, factory) {
  'use strict';

  const api = factory();
  if (typeof module === 'object' && module && module.exports) {
    module.exports = api;
  }
  root.WT_LeaderboardLogic = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function clampInt(value, min, max) {
    const n = Number(value);
    if (!Number.isFinite(n)) return min;
    return Math.max(min, Math.min(max, Math.floor(n)));
  }

  function compileNicknameRegex(source, flags) {
    const safeSource = String(source || '').trim();
    if (!safeSource) return null;
    const safeFlags = String(flags || '').trim();
    try {
      return new RegExp(safeSource, safeFlags);
    } catch (_) {
      return false;
    }
  }

  function normalizeRows(rows, limit) {
    if (!Array.isArray(rows)) return [];
    return rows
      .map((row) => ({
        nickname: String(row?.nickname || '').trim(),
        scoreFP: clampInt(row?.scoreFP ?? row?.score_fp, 0, 9999)
      }))
      .filter((row) => row.nickname && row.scoreFP >= 0)
      .slice(0, Math.max(1, clampInt(limit, 1, 100)));
  }

  function mergeLocalPlayer(rows, localPlayer, limit) {
    const maxRows = Math.max(1, clampInt(limit, 1, 100));
    const base = Array.isArray(rows) ? rows.slice() : [];
    if (!localPlayer) return base.slice(0, maxRows);

    const localNickname = String(localPlayer?.nickname || '').trim();
    const filtered = base.filter(
      (row) => String(row?.nickname || '').trim() !== localNickname
    );
    filtered.push(localPlayer);
    filtered.sort((a, b) => {
      const scoreDiff =
        clampInt(b?.scoreFP, 0, 9999) - clampInt(a?.scoreFP, 0, 9999);
      if (scoreDiff !== 0) return scoreDiff;
      return String(a?.nickname || '').localeCompare(String(b?.nickname || ''));
    });
    return filtered.slice(0, maxRows);
  }

  return {
    clampInt,
    compileNicknameRegex,
    normalizeRows,
    mergeLocalPlayer
  };
});

/* ===== storage.js ===== */
/* storage.js - local persistence (V2 RUN) */

(() => {
  'use strict';

  const RapidFireLogic = window.WT_RapidFireLogic;
  if (!RapidFireLogic || typeof RapidFireLogic !== 'object') {
    throw new Error('WT_RapidFireLogic is required before storage.js');
  }

  const EVT = 'storage-updated';
  const EVT_SAVE_FAILED = 'storage-save-failed';

  // ============================================
  // Helpers
  // ============================================
  function now() {
    return Date.now();
  }

  function safeJsonParse(str) {
    if (!str || typeof str !== 'string') return null;
    try {
      return JSON.parse(str);
    } catch (_) {
      return null;
    }
  }

  function clampNonNegativeInt(n) {
    const x = Number(n);
    if (!Number.isFinite(x)) return 0;
    return Math.max(0, Math.floor(x));
  }

  function findRunEntryByNumber(list, runNumber) {
    const rn = clampNonNegativeInt(runNumber);
    if (!Array.isArray(list) || rn <= 0) return null;
    for (const item of list) {
      if (clampNonNegativeInt(item?.runNumber) === rn) return item;
    }
    return null;
  }

  function safeBool(x) {
    return x === true || x === false ? x : null;
  }
  function safeIdNum(x) {
    const n = Number(x);
    if (!Number.isFinite(n)) return null;
    if (!Number.isInteger(n)) return null;
    if (n < 0) return null;
    return n;
  }

  function deepCopy(obj) {
    // Prefer structuredClone to preserve `undefined` (JSON stringify drops it).
    // Fallback keeps legacy behavior on older browsers.
    try {
      if (typeof structuredClone === 'function') return structuredClone(obj);
    } catch (_) {
      /* fall through */
    }

    return JSON.parse(JSON.stringify(obj));
  }

  function generateLocalUuid() {
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
    return `local-${now().toString(36)}-${rand}`;
  }

  function getConfiguredMaxLevel(config) {
    const raw = Number(config?.levels?.maxLevel);
    if (!Number.isFinite(raw)) return 0;
    const n = Math.floor(raw);
    if (n < 1 || n > 20) return 0;
    return n;
  }

  function makeUnlockedAtByLevel(maxLevel) {
    const out = {};
    const n = clampNonNegativeInt(maxLevel);
    for (let level = 1; level <= n; level += 1) {
      out[level] = 0;
    }
    return out;
  }

  function ensureUnlockedAtByLevelShape(raw, maxLevel) {
    const src = raw && typeof raw === 'object' ? raw : {};
    const out = makeUnlockedAtByLevel(maxLevel);
    for (let level = 1; level <= maxLevel; level += 1) {
      out[level] = clampNonNegativeInt(src[level]);
    }
    return out;
  }


  // ============================================
  // StorageManager Constructor (V2 clean, no legacy)
  // ============================================

  function StorageManager(config) {
    if (!config || typeof config !== 'object') {
      throw new Error(
        'StorageManager: missing or invalid config (no fallback to window.WT_CONFIG)'
      );
    }

    const rawStorageKey = config?.storage?.storageKey;
    if (typeof rawStorageKey !== 'string') {
      throw new Error('StorageManager: missing config.storage.storageKey');
    }
    const resolvedStorageKey = rawStorageKey.trim();
    if (!resolvedStorageKey) {
      throw new Error('StorageManager: empty config.storage.storageKey');
    }

    this.config = config;
    this.storageKey = resolvedStorageKey;

    this.initialized = false;
    this.data = null;
    this._lastSavedData = null;

    // One-shot per session: persistence failure signal to UI
    this._saveFailedOnce = false;

    // Cache compiled regex (premium codes)
    this._premiumCodeRe = undefined;

    const rawSchemaVersion = config.storageSchemaVersion;
    if (
      typeof rawSchemaVersion !== 'string' &&
      typeof rawSchemaVersion !== 'number'
    ) {
      throw new Error('StorageManager: missing config.storageSchemaVersion');
    }
    const schemaVersion = String(rawSchemaVersion).trim();
    if (!schemaVersion) {
      throw new Error('StorageManager: empty config.storageSchemaVersion');
    }
    // INVARIANT (intentional):
    // freeRuns is read from WT_CONFIG.limits.freeRuns at initialization time.
    // If WT_CONFIG changes AFTER init, StorageManager does NOT live-sync it.
    // Rationale: avoid retroactive entitlement changes and mid-run UX inconsistencies.
    const freeRuns = clampNonNegativeInt(config?.limits?.freeRuns);

    const gameId = String(config.identity?.appName || '').trim();
    if (!gameId)
      throw new Error('StorageManager: missing config.identity.appName');

    const maxLevel = getConfiguredMaxLevel(config);
    if (!maxLevel) {
      throw new Error('StorageManager: missing or invalid config.levels.maxLevel');
    }
    const defaultUnlockedAtByLevel = makeUnlockedAtByLevel(maxLevel);

    this.defaultData = {
      version: schemaVersion,
      gameId: gameId,
      createdAt: 0,
      updatedAt: 0,

      // Premium
      isPremium: false,

      // Full access codes (device-local)
      codes: {
        redeemedOnce: false,
        code: ''
      },

      // Economy gate (config-driven: see WT_CONFIG.limits.freeRuns)
      runs: {
        balance: freeRuns,
        freeRuns: freeRuns,
        limitReachedCount: 0
      },

      rapidFire: {
        ticketBalance: 0,
        starterTicketGranted: false,
        dailyTicketEarnedDayKey: '',
        dailyChallengeTargetDayKey: '',
        dailyChallengeTargetScore: 0
      },

      leaderboard: {
        deviceUuid: '',
        nickname: '',
        optIn: false,
        updatedAt: 0
      },

      // Settings
      settings: {
        mistakesOnly: false,
        mistakesOnlyCompletedOnce: false,
        autoReadQuestions: false,

        // House Ad hide (timestamp ms). 0 = not hidden.
        houseAdHiddenUntil: 0
      },

      // UI device-only flags
      uiDeviceFlags: {
        firstRunFramingSeen: false,
        premiumFirstRunFramingSeen: false,
        secretChestHintSolved: false,
        secretChestWelcomeShown: false,
        dailyChallengeToastDayKey: '',
        questionAudioUsed: false,
        shareBonusGranted: false,
        shareBonusGrantedAt: 0
      },

      // House Ad (post-completion) — persisted state
      houseAd: {
        introSeen: false,
        state: 'never_seen' // never_seen | remind_later
      },

      // Waitlist (post-completion + paywall) — persisted state
      waitlist: {
        status: 'not_seen', // not_seen | seen | opted_in
        draftIdea: ''
      },

      // Counters
      counters: {
        runNumber: 0,
        runStarts: 0,
        runCompletes: 0,

        // BONUS completes (device-local)
        bonusCompletes: 0,

        // Secret bonus (teaser premium): free bonus runs used (lifetime, device-local)
        secretBonusFreeRunsUsed: 0,

        // Practice (Mistakes only): free practice runs used (lifetime, device-local)
        practiceFreeRunsUsed: 0,

        // Funnel (local-only, aggregated)
        landingViewed: 0,
        landingPlayClicked: 0,
        landingPracticeClicked: 0,
        dailyChallengeClicked: 0,
        landingNextRunStarted: 0,
        landingNextRunCompleted: 0,
        landingTimeTotalMs: 0,

        shareClicked: 0,
        installPromptShown: 0,
        paywallShown: 0,
        paywallShownFromLanding: 0,
        paywallShownFromEnd: 0,
        paywallShownFromPlaying: 0,
        paywallShownFromOther: 0,
        checkoutStarted: 0,
        codeRedeemed: 0,
        houseAdShown: 0,
        houseAdClicked: 0,
        premiumUnlockedCount: 0
      },

      // Personal best (V2 = best FP in a run) — RUN only
      personalBest: {
        bestScoreFP: 0,
        achievedAt: 0
      },

      // Bonus best (V1 = best FP in a bonus run) — BONUS only
      bonusBest: {
        bestScoreFP: 0,
        achievedAt: 0
      },

      // Run history (lightweight, local-only)
      history: {
        lastRuns: [],
        runPaceTotals: {
          runCount: 0,
          totalNewSeen: 0
        }
      },

      progression: {
        currentLevel: 0,
        unlockedAtByLevel: defaultUnlockedAtByLevel
      },

      // Per-item stats (anti-repetition + practice)
      statsByItem: {},

      // Early price window (timer UX)
      // Source of truth: startedAt (persisted). Window length comes from config (not persisted).
      earlyPrice: {
        startedAt: 0,
        used: false
      },

      // Endgame flags
      postCompletion: {
        postCompletionShown: false,
        postCompletionAt: 0,

        // Milestone: first quarter through the pool (one-shot).
        quarterMilestoneShown: false,
        quarterMilestoneShownAt: 0,

        // Milestone: halfway through the pool (one-shot).
        halfwayMilestoneShown: false,
        halfwayMilestoneShownAt: 0,

        // Milestone: three quarters through the pool (one-shot).
        threeQuartersMilestoneShown: false,
        threeQuartersMilestoneShownAt: 0,

        // One-shot: celebrate "seen all questions" once, then never again (even if user reaches 400+).
        poolCompleteCelebrated: false,
        poolCompleteCelebratedAt: 0,

        // One-shot: celebrate "mastered" once (pool exhausted + 0 active mistakes)
        masteredCelebrated: false,
        masteredCelebratedAt: 0
      },

      endgame: {
        endgameShown: false,
        endgameShownAt: 0
      },

      analytics: {
        firstSeenAt: 0,
        lastSeenAt: 0,
        fpEmptyCount: 0,
        replayBeforePaywall: 0,

        // Anonymous stats sharing prompt (END-only)
        // Legacy stage (kept for backwards compatibility)
        // -1 = never prompted
        statsSharingPromptStage: -1,

        // New: per-trigger bitmask (each trigger shown at most once)
        // bit0: 30%, bit1: 50%, bit2: last free run, bit3: power user
        statsSharingPromptFlags: 0,

        // New: "Show me later" snooze (do not reprompt until at least this many runCompletes)
        statsSharingSnoozeUntilRunCompletes: 0,

        // Checkout / premium analytics
        paywallLastSource: '',
        checkoutStartedAt: 0,
        checkoutPriceKey: '',
        premiumUnlockedAt: 0
      }
    };
  }

  StorageManager.prototype._adoptLoadedData = function (loaded, options) {
    const cfg = this.config || {};
    const opts = options && typeof options === 'object' ? options : {};
    const schemaVersion = String(
      cfg.storageSchemaVersion != null ? cfg.storageSchemaVersion : ''
    ).trim();

    if (!schemaVersion) return false;
    if (!loaded || typeof loaded !== 'object') return false;
    if (String(loaded.version || '') !== schemaVersion) return false;

    // Use the same hardening pipeline for init and cross-tab storage updates.
    // This keeps the trust boundary in one place instead of accepting a raw
    // payload in _addStorageListener that bypasses the init-time normalization.
    this.data = loaded;

    // Harden required blocks (V2 shapes)
    if (!this.data.runs) this.data.runs = deepCopy(this.defaultData.runs);
    if (!this.data.settings)
      this.data.settings = deepCopy(this.defaultData.settings);
    if (!this.data.rapidFire)
      this.data.rapidFire = deepCopy(this.defaultData.rapidFire);
    if (!this.data.leaderboard)
      this.data.leaderboard = deepCopy(this.defaultData.leaderboard);
    if (!this.data.uiDeviceFlags)
      this.data.uiDeviceFlags = deepCopy(this.defaultData.uiDeviceFlags);
    if (!this.data.houseAd)
      this.data.houseAd = deepCopy(this.defaultData.houseAd);
    if (!this.data.waitlist)
      this.data.waitlist = deepCopy(this.defaultData.waitlist);
    if (!this.data.counters)
      this.data.counters = deepCopy(this.defaultData.counters);
    if (!this.data.history)
      this.data.history = deepCopy(this.defaultData.history);
    if (!this.data.progression)
      this.data.progression = deepCopy(this.defaultData.progression);
    if (!this.data.statsByItem) this.data.statsByItem = {};
    if (!this.data.personalBest)
      this.data.personalBest = deepCopy(this.defaultData.personalBest);
    if (!this.data.bonusBest)
      this.data.bonusBest = deepCopy(this.defaultData.bonusBest);
    if (!this.data.earlyPrice)
      this.data.earlyPrice = deepCopy(this.defaultData.earlyPrice);
    if (!this.data.postCompletion)
      this.data.postCompletion = deepCopy(this.defaultData.postCompletion);
    if (!this.data.endgame)
      this.data.endgame = deepCopy(this.defaultData.endgame);
    if (!this.data.analytics)
      this.data.analytics = deepCopy(this.defaultData.analytics);

    if (!Number.isFinite(Number(this.data.analytics.statsSharingPromptStage))) {
      this.data.analytics.statsSharingPromptStage = -1;
    } else {
      this.data.analytics.statsSharingPromptStage = Math.floor(
        Number(this.data.analytics.statsSharingPromptStage)
      );
    }

    if (!Number.isFinite(Number(this.data.analytics.statsSharingPromptFlags))) {
      this.data.analytics.statsSharingPromptFlags = 0;
    } else {
      this.data.analytics.statsSharingPromptFlags = Math.floor(
        Number(this.data.analytics.statsSharingPromptFlags)
      );
    }

    if (
      !Number.isFinite(
        Number(this.data.analytics.statsSharingSnoozeUntilRunCompletes)
      )
    ) {
      this.data.analytics.statsSharingSnoozeUntilRunCompletes = 0;
    } else {
      this.data.analytics.statsSharingSnoozeUntilRunCompletes = Math.floor(
        Number(this.data.analytics.statsSharingSnoozeUntilRunCompletes)
      );
    }

    if (!Number.isFinite(Number(this.data.analytics.checkoutStartedAt))) {
      this.data.analytics.checkoutStartedAt = 0;
    } else {
      this.data.analytics.checkoutStartedAt = Math.floor(
        Number(this.data.analytics.checkoutStartedAt)
      );
    }

    if (typeof this.data.analytics.paywallLastSource !== 'string') {
      this.data.analytics.paywallLastSource = '';
    }

    if (typeof this.data.analytics.checkoutPriceKey !== 'string') {
      this.data.analytics.checkoutPriceKey = '';
    }

    if (!Number.isFinite(Number(this.data.analytics.premiumUnlockedAt))) {
      this.data.analytics.premiumUnlockedAt = 0;
    } else {
      this.data.analytics.premiumUnlockedAt = Math.floor(
        Number(this.data.analytics.premiumUnlockedAt)
      );
    }

    if (!this.data.codes) this.data.codes = deepCopy(this.defaultData.codes);

    // Harden runs (sync with config)
    const r = this.data.runs;
    const freeRunsCfg = clampNonNegativeInt(cfg?.limits?.freeRuns);
    const isPrem = this.data && this.data.isPremium === true;

    // Always sync the configured free runs (single source of truth) AT INIT TIME.
    // NOTE: This is NOT a reactive binding. If WT_CONFIG changes after init,
    // storage keeps the previously loaded value until the next init (reload).
    r.freeRuns = freeRunsCfg;

    // Balance must be a non-negative int
    r.balance = clampNonNegativeInt(r.balance);

    // Keep economy bounded for non-premium without retroactively re-granting free runs.
    // If config changes between releases, init may clamp balance downward to the new max,
    // but it must never increase a user's remaining balance on reload.
    if (!isPrem) {
      const flags = this.data.uiDeviceFlags || {};
      const bonusGranted = flags.shareBonusGranted === true;
      const bonusRuns = bonusGranted
        ? clampNonNegativeInt(cfg?.shareBonus?.bonusRuns || 1)
        : 0;
      const effectiveFreeRuns = freeRunsCfg + bonusRuns;
      const used = clampNonNegativeInt(this.data?.counters?.runStarts);
      const maxAllowedBalance = Math.max(0, effectiveFreeRuns - used);
      r.balance = Math.min(r.balance, maxAllowedBalance);
    }

    if (!Number.isFinite(r.limitReachedCount)) r.limitReachedCount = 0;

    // Harden settings
    const st = this.data.settings;
    if (typeof st.mistakesOnly !== 'boolean') st.mistakesOnly = false;
    if (typeof st.mistakesOnlyCompletedOnce !== 'boolean')
      st.mistakesOnlyCompletedOnce = false;
    if (typeof st.autoReadQuestions !== 'boolean') st.autoReadQuestions = false;
    if (!Number.isFinite(st.houseAdHiddenUntil)) st.houseAdHiddenUntil = 0;

    const flags = this.data.uiDeviceFlags || {};
    if (typeof flags.firstRunFramingSeen !== 'boolean')
      flags.firstRunFramingSeen = false;
    if (typeof flags.premiumFirstRunFramingSeen !== 'boolean')
      flags.premiumFirstRunFramingSeen = false;
    if (typeof flags.secretChestHintSolved !== 'boolean')
      flags.secretChestHintSolved = false;
    if (typeof flags.secretChestWelcomeShown !== 'boolean')
      flags.secretChestWelcomeShown = false;
    if (typeof flags.questionAudioUsed !== 'boolean')
      flags.questionAudioUsed = false;
    flags.dailyChallengeToastDayKey = String(
      flags.dailyChallengeToastDayKey || ''
    ).trim();
    if (typeof flags.shareBonusGranted !== 'boolean')
      flags.shareBonusGranted = false;
    if (!Number.isFinite(Number(flags.shareBonusGrantedAt))) {
      flags.shareBonusGrantedAt = 0;
    } else {
      flags.shareBonusGrantedAt = Math.floor(Number(flags.shareBonusGrantedAt));
    }

    // Harden Rapid Fire ticket economy
    const rf = this.data.rapidFire || {};
    const ticketCap = Math.max(
      0,
      clampNonNegativeInt(cfg?.secretBonus?.ticketCap)
    );
    rf.ticketBalance = clampNonNegativeInt(rf.ticketBalance);
    if (ticketCap > 0) rf.ticketBalance = Math.min(rf.ticketBalance, ticketCap);
    if (typeof rf.starterTicketGranted !== 'boolean')
      rf.starterTicketGranted = false;
    if (typeof rf.dailyTicketEarnedDayKey !== 'string')
      rf.dailyTicketEarnedDayKey = '';
    if (typeof rf.dailyChallengeTargetDayKey !== 'string')
      rf.dailyChallengeTargetDayKey = '';
    rf.dailyChallengeTargetScore = clampNonNegativeInt(
      rf.dailyChallengeTargetScore
    );
    this.data.rapidFire = rf;

    const lb = this.data.leaderboard || {};
    if (typeof lb.deviceUuid !== 'string') lb.deviceUuid = '';
    if (typeof lb.nickname !== 'string') lb.nickname = '';
    if (typeof lb.optIn !== 'boolean') lb.optIn = false;
    if (!Number.isFinite(lb.updatedAt)) lb.updatedAt = 0;
    this.data.leaderboard = lb;

    // Harden House Ad state
    const ha = this.data.houseAd || {};
    if (typeof ha.introSeen !== 'boolean') ha.introSeen = false;
    if (typeof ha.state !== 'string') ha.state = 'never_seen';
    if (ha.state !== 'never_seen' && ha.state !== 'remind_later') {
      ha.state = 'never_seen';
    }
    this.data.houseAd = ha;

    // Harden Waitlist state
    const wl = this.data.waitlist || {};
    if (typeof wl.status !== 'string') wl.status = 'not_seen';
    if (wl.status === 'joined') wl.status = 'opted_in';
    if (
      wl.status !== 'not_seen' &&
      wl.status !== 'seen' &&
      wl.status !== 'opted_in'
    ) {
      wl.status = 'not_seen';
    }
    if (typeof wl.draftIdea !== 'string') wl.draftIdea = '';
    this.data.waitlist = wl;

    // Harden counters
    const c = this.data.counters;
    for (const k in this.defaultData.counters) {
      if (!Number.isFinite(c[k])) c[k] = 0;
    }
    c.premiumUnlockedCount = clampNonNegativeInt(c.premiumUnlockedCount);

    // Harden personal best (RUN)
    if (!Number.isFinite(this.data.personalBest.bestScoreFP))
      this.data.personalBest.bestScoreFP = 0;
    if (!Number.isFinite(this.data.personalBest.achievedAt))
      this.data.personalBest.achievedAt = 0;

    // Harden bonus best (BONUS)
    if (!Number.isFinite(this.data.bonusBest.bestScoreFP))
      this.data.bonusBest.bestScoreFP = 0;
    if (!Number.isFinite(this.data.bonusBest.achievedAt))
      this.data.bonusBest.achievedAt = 0;

    // Harden early price (V2+)
    const ep = this.data.earlyPrice || {};
    if (!Number.isFinite(ep.startedAt)) ep.startedAt = 0;
    if (typeof ep.used !== 'boolean') ep.used = false;
    this.data.earlyPrice = ep;

    // Harden endgame
    if (typeof this.data.endgame.endgameShown !== 'boolean')
      this.data.endgame.endgameShown = false;
    if (!Number.isFinite(this.data.endgame.endgameShownAt))
      this.data.endgame.endgameShownAt = 0;

    // Harden codes
    const cd = this.data.codes;
    if (typeof cd.redeemedOnce !== 'boolean') cd.redeemedOnce = false;
    if (typeof cd.code !== 'string') cd.code = '';

    if (opts.syncVanityCode === true) {
      this._syncVanityCodeToCodes();
    }

    // Analytics timestamps
    if (
      !Number.isFinite(this.data.analytics.firstSeenAt) ||
      this.data.analytics.firstSeenAt <= 0
    ) {
      this.data.analytics.firstSeenAt = now();
    }
    if (opts.touchLastSeen === true) {
      this.data.analytics.lastSeenAt = now();
    }

    this._lastSavedData = deepCopy(this.data);
    return true;
  };

  StorageManager.prototype.init = function () {
    if (this.initialized) return;

    const cfg = this.config || {};
    const schemaVersion = String(
      cfg.storageSchemaVersion != null ? cfg.storageSchemaVersion : ''
    ).trim();

    if (!schemaVersion)
      throw new Error('StorageManager: missing config.storageSchemaVersion');

    const loaded = this._load();

    // No legacy support: mismatch => reset
    if (
      !this._adoptLoadedData(loaded, {
        touchLastSeen: true,
        syncVanityCode: true
      })
    ) {
      this._wipeAndReset();

      // If success page already generated a code, keep it across wipes (data alignment only).
      if (this._syncVanityCodeToCodes()) {
        this._save();
      }

      // Multi-tab sync (read-only listener)
      this._addStorageListener();

      this.initialized = true;
      return;
    }

    // Multi-tab sync (read-only listener)
    this._addStorageListener();

    this._save();
    this.initialized = true;
  };

  StorageManager.prototype._load = function () {
    // Read-only load. No side effects, no _save(), no events.
    try {
      if (typeof window.localStorage === 'undefined') return null;

      const raw = window.localStorage.getItem(this.storageKey);
      const parsed = safeJsonParse(raw);

      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (_) {
      return null;
    }
  };

  StorageManager.prototype._emit = function () {
    try {
      window.dispatchEvent(new CustomEvent(EVT));
    } catch (_) {
      // silent
    }
  };

  StorageManager.prototype._save = function () {
    if (!this.data) return;
    this.data.updatedAt = now();

    try {
      if (typeof window.localStorage === 'undefined') return;

      try {
        window.localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      } catch (err) {
        // Fail closed: no auto-delete, no recursion, no surprises.
        // One-shot UI signal: persistence is currently broken (quota/private mode/etc).
        try {
          console.warn('[WT Storage] Save failed (quota?):', err?.name || err);
        } catch (_) {}

        // Keep runtime state aligned with the last known persisted snapshot.
        if (this._lastSavedData && typeof this._lastSavedData === 'object') {
          try {
            this.data = deepCopy(this._lastSavedData);
          } catch (_) {
            /* silent */
          }
        }

        if (this._saveFailedOnce !== true) {
          this._saveFailedOnce = true;
          try {
            window.dispatchEvent(new CustomEvent(EVT_SAVE_FAILED));
          } catch (_) {
            /* silent */
          }
        }

        return;
      }

      this._lastSavedData = deepCopy(this.data);
      this._saveFailedOnce = false;

      this._emit();
    } catch (_) {
      // silent
    }
  };

  StorageManager.prototype._addStorageListener = function () {
    if (this._storageListenerAdded) return;

    window.addEventListener('storage', (event) => {
      if (!event || event.key !== this.storageKey) return;

      if (event.newValue == null) {
        const resetData = deepCopy(this.defaultData);
        resetData.createdAt = now();
        resetData.updatedAt = now();
        this._adoptLoadedData(resetData, {
          touchLastSeen: true,
          syncVanityCode: false
        });
        this._emit();
        return;
      }

      const updatedData = safeJsonParse(event.newValue);
      if (
        !this._adoptLoadedData(updatedData, {
          touchLastSeen: false,
          syncVanityCode: false
        })
      )
        return;

      // Mise à jour locale uniquement (ne jamais _save() ici)
      // Notifie l'UI de CET onglet
      this._emit();
    });

    this._storageListenerAdded = true;
  };

  StorageManager.prototype._clearOldData = function () {
    // Disabled: storage must not delete user data silently.
    // Keep method for backward compatibility; no-op by design.
    return;
  };

  StorageManager.prototype._wipeAndReset = function () {
    this.data = deepCopy(this.defaultData);
    this.data.createdAt = now();
    this.data.updatedAt = now();

    // initialize analytics timestamps
    this.data.analytics.firstSeenAt = now();
    this.data.analytics.lastSeenAt = now();

    this._save();
  };

  StorageManager.prototype._ensureItemStats = function (idNum) {
    const k = String(idNum);
    if (!this.data.statsByItem) this.data.statsByItem = {};
    if (!this.data.statsByItem[k]) {
      this.data.statsByItem[k] = {
        seenCount: 0,
        correctCount: 0,
        wrongCount: 0,
        lastSeenAt: 0,
        lastWrongAt: 0,
        lastCorrectAt: 0
      };
    }
    const s = this.data.statsByItem[k];
    if (!Number.isFinite(s.seenCount)) s.seenCount = 0;
    if (!Number.isFinite(s.correctCount)) s.correctCount = 0;
    if (!Number.isFinite(s.wrongCount)) s.wrongCount = 0;
    if (!Number.isFinite(s.lastSeenAt)) s.lastSeenAt = 0;
    if (!Number.isFinite(s.lastWrongAt)) s.lastWrongAt = 0;
    if (!Number.isFinite(s.lastCorrectAt)) s.lastCorrectAt = 0;
    return s;
  };

  StorageManager.prototype._compileCodeRegex = function () {
    if (this._premiumCodeRe !== undefined) return;

    const cfg = this.config || {};
    const raw = String(cfg?.premiumCodeRegex || '').trim();

    if (!raw) {
      this._premiumCodeRe = null;
      return;
    }

    try {
      this._premiumCodeRe = new RegExp(raw);
    } catch (_) {
      this._premiumCodeRe = null;
    }
  };

  // Minimal sync: if success page wrote a valid code into vanity localStorage key,
  // persist it into storage's single source of truth (data.codes.code).
  // No business logic: does NOT unlock premium, does NOT set redeemedOnce, does NOT touch counters.
  StorageManager.prototype._syncVanityCodeToCodes = function () {
    if (!this.data) return false;

    const cfg = this.config || {};
    const vanityKey = String(cfg?.storage?.vanityCodeStorageKey || '').trim();
    if (!vanityKey) return false;

    // Ensure codes shape exists
    if (!this.data.codes || typeof this.data.codes !== 'object') {
      this.data.codes = deepCopy(this.defaultData.codes);
    }
    const cd = this.data.codes;
    if (typeof cd.redeemedOnce !== 'boolean') cd.redeemedOnce = false;
    if (typeof cd.code !== 'string') cd.code = '';

    // Validate vanity code with config regex
    this._compileCodeRegex();
    const re = this._premiumCodeRe;
    if (!re) return false;

    // Defensive: RegExp.test() is stateful with /g or /y
    try {
      re.lastIndex = 0;
    } catch (_) {}

    let vanity = '';
    try {
      vanity = String(window.localStorage.getItem(vanityKey) || '').trim();
    } catch (_) {
      vanity = '';
    }

    try {
      re.lastIndex = 0;
    } catch (_) {}
    if (!vanity || !re.test(vanity)) return false;

    // Only write if missing or invalid in storage
    const current = String(cd.code || '').trim();
    try {
      re.lastIndex = 0;
    } catch (_) {}
    if (current && re.test(current)) return false;

    cd.code = vanity;
    this.data.codes = cd;

    try {
      window.localStorage.removeItem(vanityKey);
    } catch (_) {}

    return true;
  };

  StorageManager.prototype.getVanityCode = function () {
    this._compileCodeRegex();
    const re = this._premiumCodeRe;
    if (!re) return '';

    const stored = String(this.data?.codes?.code || '').trim();
    try {
      re.lastIndex = 0;
    } catch (_) {}
    if (stored && re.test(stored)) return stored;

    const cfg = this.config || {};
    const vanityKey = String(cfg?.storage?.vanityCodeStorageKey || '').trim();
    if (!vanityKey) return '';

    let code = '';
    try {
      code = String(window.localStorage.getItem(vanityKey) || '').trim();
    } catch (_) {
      code = '';
    }

    try {
      re.lastIndex = 0;
    } catch (_) {}
    if (!code || !re.test(code)) return '';

    return code;
  };

  StorageManager.prototype._readUiDeviceFlag = function (suffix) {
    const s = String(suffix || '').trim();
    if (!s) return false;

    if (
      !this.data ||
      !this.data.uiDeviceFlags ||
      typeof this.data.uiDeviceFlags !== 'object'
    ) {
      return false;
    }

    return this.data.uiDeviceFlags[s] === true;
  };

  StorageManager.prototype._writeUiDeviceFlag = function (suffix) {
    const s = String(suffix || '').trim();
    if (!s || !this.data) return;

    if (
      !this.data.uiDeviceFlags ||
      typeof this.data.uiDeviceFlags !== 'object'
    ) {
      this.data.uiDeviceFlags = deepCopy(this.defaultData.uiDeviceFlags);
    }

    if (this.data.uiDeviceFlags[s] === true) return;

    this.data.uiDeviceFlags[s] = true;
    this._save();
  };

  StorageManager.prototype.hasSeenFirstRunFraming = function () {
    return this._readUiDeviceFlag('firstRunFramingSeen');
  };

  StorageManager.prototype.markSeenFirstRunFraming = function () {
    this._writeUiDeviceFlag('firstRunFramingSeen');
  };

  StorageManager.prototype.hasSeenPremiumFirstRunFraming = function () {
    return this._readUiDeviceFlag('premiumFirstRunFramingSeen');
  };

  StorageManager.prototype.markSeenPremiumFirstRunFraming = function () {
    this._writeUiDeviceFlag('premiumFirstRunFramingSeen');
  };

  StorageManager.prototype.hasSolvedSecretChestHint = function () {
    return this._readUiDeviceFlag('secretChestHintSolved');
  };

  StorageManager.prototype.markSolvedSecretChestHint = function () {
    this._writeUiDeviceFlag('secretChestHintSolved');
  };

  StorageManager.prototype.hasShownSecretChestWelcome = function () {
    return this._readUiDeviceFlag('secretChestWelcomeShown');
  };

  StorageManager.prototype.markShownSecretChestWelcome = function () {
    this._writeUiDeviceFlag('secretChestWelcomeShown');
  };

  StorageManager.prototype.getDailyChallengeToastDayKey = function () {
    if (!this.data) return '';
    const flags = this.data.uiDeviceFlags || {};
    return String(flags.dailyChallengeToastDayKey || '').trim();
  };

  StorageManager.prototype.markDailyChallengeToastShown = function (dayKey) {
    const key = String(dayKey || '').trim();
    if (!key || !this.data) return;

    if (
      !this.data.uiDeviceFlags ||
      typeof this.data.uiDeviceFlags !== 'object'
    ) {
      this.data.uiDeviceFlags = deepCopy(this.defaultData.uiDeviceFlags);
    }

    if (
      String(this.data.uiDeviceFlags.dailyChallengeToastDayKey || '').trim() ===
      key
    )
      return;
    this.data.uiDeviceFlags.dailyChallengeToastDayKey = key;
    this._save();
  };

  StorageManager.prototype.hasUsedQuestionAudio = function () {
    return this._readUiDeviceFlag('questionAudioUsed');
  };

  StorageManager.prototype.markUsedQuestionAudio = function () {
    this._writeUiDeviceFlag('questionAudioUsed');
  };

  StorageManager.prototype.resetUiDeviceFlags = function () {
    if (!this.data) return;

    this.data.uiDeviceFlags = deepCopy(this.defaultData.uiDeviceFlags);
    this._save();
  };

  StorageManager.prototype.hasShareBonusGranted = function () {
    return this._readUiDeviceFlag('shareBonusGranted');
  };

  StorageManager.prototype.getShareBonusGrantedAt = function () {
    const flags = this.data?.uiDeviceFlags || {};
    return clampNonNegativeInt(flags.shareBonusGrantedAt);
  };

  StorageManager.prototype.grantShareBonus = function () {
    if (!this.data) return { ok: false, reason: 'NO_DATA', balance: 0 };

    if (
      !this.data.uiDeviceFlags ||
      typeof this.data.uiDeviceFlags !== 'object'
    ) {
      this.data.uiDeviceFlags = deepCopy(this.defaultData.uiDeviceFlags);
    }

    if (this.data.uiDeviceFlags.shareBonusGranted === true) {
      return {
        ok: false,
        reason: 'ALREADY',
        balance: this.getRunsBalance(),
        grantedAt: this.getShareBonusGrantedAt()
      };
    }

    const bonusRuns = Math.max(
      1,
      clampNonNegativeInt(this.config?.shareBonus?.bonusRuns || 1)
    );

    this.data.uiDeviceFlags.shareBonusGranted = true;
    this.data.uiDeviceFlags.shareBonusGrantedAt = now();

    if (!this.data.runs || typeof this.data.runs !== 'object') {
      this.data.runs = deepCopy(this.defaultData.runs);
    }

    this.data.runs.balance =
      clampNonNegativeInt(this.data.runs.balance) + bonusRuns;
    this._save();

    return {
      ok: true,
      reason: 'GRANTED',
      balance: this.getRunsBalance(),
      bonusRuns,
      grantedAt: this.getShareBonusGrantedAt()
    };
  };

  // ============================================
  // Getters
  // ============================================
  StorageManager.prototype.isPremium = function () {
    return !!(this.data && this.data.isPremium);
  };

  StorageManager.prototype.getStatsSharingPromptStage = function () {
    const a = this.data?.analytics || {};
    const n = Number(a.statsSharingPromptStage);
    return Number.isFinite(n) ? Math.floor(n) : -1;
  };

  StorageManager.prototype.setStatsSharingPromptStage = function (stageIndex) {
    if (!this.data) return;

    const n = Number(stageIndex);
    if (!Number.isFinite(n)) return;

    if (!this.data.analytics || typeof this.data.analytics !== 'object') {
      this.data.analytics = deepCopy(this.defaultData.analytics);
    }

    this.data.analytics.statsSharingPromptStage = Math.floor(n);
    this._save();
  };

  StorageManager.prototype.getStatsSharingPromptFlags = function () {
    const a = this.data?.analytics || {};
    const n = Number(a.statsSharingPromptFlags);
    return Number.isFinite(n) ? Math.floor(n) : 0;
  };

  StorageManager.prototype.setStatsSharingPromptFlags = function (flags) {
    if (!this.data) return;

    const n = Number(flags);
    if (!Number.isFinite(n)) return;

    if (!this.data.analytics || typeof this.data.analytics !== 'object') {
      this.data.analytics = deepCopy(this.defaultData.analytics);
    }

    this.data.analytics.statsSharingPromptFlags = Math.floor(n);
    this._save();
  };

  StorageManager.prototype.markStatsSharingPromptFlag = function (flagBit) {
    if (!this.data) return;

    const b = Number(flagBit);
    if (!Number.isFinite(b) || b <= 0) return;

    const cur = this.getStatsSharingPromptFlags();
    const next = cur | Math.floor(b);
    if (next === cur) return;

    this.setStatsSharingPromptFlags(next);
  };

  StorageManager.prototype.getStatsSharingSnoozeUntilRunCompletes =
    function () {
      const a = this.data?.analytics || {};
      const n = Number(a.statsSharingSnoozeUntilRunCompletes);
      return Number.isFinite(n) ? Math.floor(n) : 0;
    };

  StorageManager.prototype.setStatsSharingSnoozeUntilRunCompletes = function (
    n
  ) {
    if (!this.data) return;

    const v = Number(n);
    if (!Number.isFinite(v) || v < 0) return;

    if (!this.data.analytics || typeof this.data.analytics !== 'object') {
      this.data.analytics = deepCopy(this.defaultData.analytics);
    }

    this.data.analytics.statsSharingSnoozeUntilRunCompletes = Math.floor(v);
    this._save();
  };

  StorageManager.prototype.snoozeStatsSharingPromptNextEnd = function () {
    if (!this.data) return;

    const runs = clampNonNegativeInt(this.data?.counters?.runCompletes);
    this.setStatsSharingSnoozeUntilRunCompletes(runs + 1);
  };

  StorageManager.prototype.getRunsBalance = function () {
    return clampNonNegativeInt(this.data?.runs?.balance);
  };

  // Runs used in the economy sense: how many runs were actually started (consumeRunOrBlock increments runStarts).
  StorageManager.prototype.getRunsUsed = function () {
    return clampNonNegativeInt(this.data?.counters?.runStarts);
  };

  StorageManager.prototype.getRunNumber = function () {
    return clampNonNegativeInt(this.data?.counters?.runNumber);
  };

  StorageManager.prototype.reserveRunNumber = function () {
    if (!this.data) return 0;

    if (!this.data.counters || typeof this.data.counters !== 'object') {
      this.data.counters = deepCopy(this.defaultData.counters);
    }

    const next = clampNonNegativeInt(this.data.counters.runNumber) + 1;
    this.data.counters.runNumber = next;
    this._save();
    return next;
  };

  StorageManager.prototype.getSecretBonusFreeRunsUsed = function () {
    return clampNonNegativeInt(this.data?.counters?.secretBonusFreeRunsUsed);
  };

  StorageManager.prototype.incrementSecretBonusFreeRunsUsed = function () {
    if (!this.data) return;

    if (!this.data.counters || typeof this.data.counters !== 'object') {
      this.data.counters = deepCopy(this.defaultData.counters);
    }

    const cur = clampNonNegativeInt(this.data.counters.secretBonusFreeRunsUsed);
    this.data.counters.secretBonusFreeRunsUsed = cur + 1;
    this._save();
  };

  StorageManager.prototype.getRapidFireTicketBalance = function () {
    return clampNonNegativeInt(this.data?.rapidFire?.ticketBalance);
  };

  StorageManager.prototype.getLeaderboardProfile = function () {
    const lb = this.data?.leaderboard || {};
    return {
      deviceUuid: String(lb.deviceUuid || '').trim(),
      nickname: String(lb.nickname || '').trim(),
      optIn: lb.optIn === true,
      updatedAt: clampNonNegativeInt(lb.updatedAt)
    };
  };

  StorageManager.prototype.ensureLeaderboardDeviceUuid = function () {
    if (!this.data) return '';

    if (!this.data.leaderboard || typeof this.data.leaderboard !== 'object') {
      this.data.leaderboard = deepCopy(this.defaultData.leaderboard);
    }

    const existing = String(this.data.leaderboard.deviceUuid || '').trim();
    if (existing) return existing;

    const next = generateLocalUuid();
    this.data.leaderboard.deviceUuid = next;
    this.data.leaderboard.updatedAt = now();
    this._save();
    return next;
  };

  StorageManager.prototype.saveLeaderboardProfile = function (nickname, optIn) {
    if (!this.data)
      return { ok: false, nickname: '', optIn: false, deviceUuid: '' };

    if (!this.data.leaderboard || typeof this.data.leaderboard !== 'object') {
      this.data.leaderboard = deepCopy(this.defaultData.leaderboard);
    }

    const nextNickname = String(nickname || '').trim();
    this.data.leaderboard.deviceUuid = this.ensureLeaderboardDeviceUuid();
    this.data.leaderboard.nickname = nextNickname;
    this.data.leaderboard.optIn = optIn === true;
    this.data.leaderboard.updatedAt = now();
    this._save();

    return {
      ok: true,
      nickname: nextNickname,
      optIn: this.data.leaderboard.optIn === true,
      deviceUuid: String(this.data.leaderboard.deviceUuid || '').trim()
    };
  };

  StorageManager.prototype.getRapidFireTicketCap = function () {
    return clampNonNegativeInt(this.config?.secretBonus?.ticketCap);
  };

  StorageManager.prototype.getRapidFireTicketCost = function () {
    const cost = clampNonNegativeInt(this.config?.secretBonus?.ticketCost);
    return cost > 0 ? cost : 1;
  };

  StorageManager.prototype.getDailyTicketEarnedDayKey = function () {
    return String(this.data?.rapidFire?.dailyTicketEarnedDayKey || '').trim();
  };

  StorageManager.prototype.getDailyChallengeTarget = function (dayKey) {
    const key = String(dayKey || '').trim();
    if (!key) return 0;
    const rf = this.data?.rapidFire || {};
    if (String(rf.dailyChallengeTargetDayKey || '').trim() !== key) return 0;
    return clampNonNegativeInt(rf.dailyChallengeTargetScore);
  };

  StorageManager.prototype.ensureDailyChallengeTarget = function (
    dayKey,
    fallbackScore
  ) {
    const key = String(dayKey || '').trim();
    const nextScore = RapidFireLogic.computeDailyChallengeTarget(
      '',
      0,
      key,
      fallbackScore
    );
    if (!this.data) return nextScore;
    if (!key) return nextScore;

    if (!this.data.rapidFire || typeof this.data.rapidFire !== 'object') {
      this.data.rapidFire = deepCopy(this.defaultData.rapidFire);
    }

    const existingKey = String(
      this.data.rapidFire.dailyChallengeTargetDayKey || ''
    ).trim();
    const existingScore = clampNonNegativeInt(
      this.data.rapidFire.dailyChallengeTargetScore
    );
    const frozenScore = RapidFireLogic.computeDailyChallengeTarget(
      existingKey,
      existingScore,
      key,
      fallbackScore
    );
    if (existingKey === key && existingScore > 0) return frozenScore;

    this.data.rapidFire.dailyChallengeTargetDayKey = key;
    this.data.rapidFire.dailyChallengeTargetScore = frozenScore;
    this._save();
    return frozenScore;
  };

  StorageManager.prototype.grantStarterRapidFireTicketIfNeeded = function () {
    if (!this.data) return { ok: false, granted: false, balance: 0 };

    if (!this.data.rapidFire || typeof this.data.rapidFire !== 'object') {
      this.data.rapidFire = deepCopy(this.defaultData.rapidFire);
    }

    if (this.data.rapidFire.starterTicketGranted === true) {
      return {
        ok: true,
        granted: false,
        balance: this.getRapidFireTicketBalance(),
        cap: this.getRapidFireTicketCap()
      };
    }

    const cap = this.getRapidFireTicketCap();
    const starterTickets = clampNonNegativeInt(
      this.config?.secretBonus?.starterTickets
    );
    const current = clampNonNegativeInt(this.data.rapidFire.ticketBalance);
    const grant = RapidFireLogic.computeStarterTicketGrant(
      current,
      starterTickets,
      cap
    );

    this.data.rapidFire.ticketBalance = grant.nextBalance;
    this.data.rapidFire.starterTicketGranted = true;
    this._save();

    return {
      ok: true,
      granted: grant.granted,
      balance: grant.nextBalance,
      cap
    };
  };

  StorageManager.prototype.grantDailyRapidFireTicket = function (dayKey) {
    if (!this.data)
      return { ok: false, granted: false, balance: 0, cap: 0, atCap: false };

    const key = String(dayKey || '').trim();
    if (!key)
      return {
        ok: false,
        granted: false,
        balance: this.getRapidFireTicketBalance(),
        cap: this.getRapidFireTicketCap(),
        atCap: false
      };

    if (!this.data.rapidFire || typeof this.data.rapidFire !== 'object') {
      this.data.rapidFire = deepCopy(this.defaultData.rapidFire);
    }

    const cap = this.getRapidFireTicketCap();
    const current = clampNonNegativeInt(this.data.rapidFire.ticketBalance);
    const alreadyEarned =
      String(this.data.rapidFire.dailyTicketEarnedDayKey || '').trim() === key;
    const grant = RapidFireLogic.computeDailyTicketGrant(
      current,
      cap,
      alreadyEarned
    );

    this.data.rapidFire.ticketBalance = grant.nextBalance;
    this.data.rapidFire.dailyTicketEarnedDayKey = key;
    this._save();

    return {
      ok: true,
      granted: grant.granted,
      balance: grant.nextBalance,
      cap,
      atCap: grant.atCap
    };
  };

  StorageManager.prototype.consumeRapidFireTicketOrBlock = function () {
    if (!this.data)
      return { ok: false, reason: 'NO_DATA', balance: 0, cost: 0 };

    if (!this.data.rapidFire || typeof this.data.rapidFire !== 'object') {
      this.data.rapidFire = deepCopy(this.defaultData.rapidFire);
    }

    const cost = this.getRapidFireTicketCost();
    const balance = clampNonNegativeInt(this.data.rapidFire.ticketBalance);

    if (balance >= cost) {
      this.data.rapidFire.ticketBalance = Math.max(0, balance - cost);
      this._save();
      return {
        ok: true,
        reason: 'CONSUMED',
        balance: clampNonNegativeInt(this.data.rapidFire.ticketBalance),
        cost
      };
    }

    return {
      ok: false,
      reason: 'NO_TICKETS',
      balance,
      cost
    };
  };

  StorageManager.prototype.refundRapidFireTicket = function (amount) {
    if (!this.data) return { ok: false, balance: 0, cap: 0 };

    if (!this.data.rapidFire || typeof this.data.rapidFire !== 'object') {
      this.data.rapidFire = deepCopy(this.defaultData.rapidFire);
    }

    const add = clampNonNegativeInt(amount);
    if (add <= 0) {
      return {
        ok: true,
        balance: this.getRapidFireTicketBalance(),
        cap: this.getRapidFireTicketCap()
      };
    }

    const cap = this.getRapidFireTicketCap();
    const current = clampNonNegativeInt(this.data.rapidFire.ticketBalance);
    const next = cap > 0 ? Math.min(cap, current + add) : current + add;
    this.data.rapidFire.ticketBalance = next;
    this._save();

    return { ok: true, balance: next, cap };
  };

  StorageManager.prototype.getCounters = function () {
    return deepCopy(this.data?.counters || {});
  };

  StorageManager.prototype.getStoredPremiumCode = function () {
    return String(this.data?.codes?.code || '').trim();
  };

  StorageManager.prototype.getData = function () {
    return deepCopy(this.data || {});
  };

  // Return a defensive copy (prevents accidental mutation outside storage.js)
  StorageManager.prototype.getItemStats = function (id) {
    const s = this.data?.statsByItem?.[String(id)] || null;
    if (!s || typeof s !== 'object') return null;
    return {
      seenCount: clampNonNegativeInt(s.seenCount),
      correctCount: clampNonNegativeInt(s.correctCount),
      wrongCount: clampNonNegativeInt(s.wrongCount),
      lastSeenAt: clampNonNegativeInt(s.lastSeenAt),
      lastWrongAt: clampNonNegativeInt(s.lastWrongAt),
      lastCorrectAt: clampNonNegativeInt(s.lastCorrectAt)
    };
  };

  // Return a defensive copy of the full stats map (for game.js deck rebuild hook)
  StorageManager.prototype.getStatsByItem = function () {
    const src = this.data?.statsByItem;
    const out = {};
    if (!src || typeof src !== 'object') return out;

    for (const k in src) {
      const s = src[k];
      if (!s || typeof s !== 'object') continue;
      out[String(k)] = {
        seenCount: clampNonNegativeInt(s.seenCount),
        correctCount: clampNonNegativeInt(s.correctCount),
        wrongCount: clampNonNegativeInt(s.wrongCount),
        lastSeenAt: clampNonNegativeInt(s.lastSeenAt),
        lastWrongAt: clampNonNegativeInt(s.lastWrongAt),
        lastCorrectAt: clampNonNegativeInt(s.lastCorrectAt)
      };
    }
    return out;
  };

  // Secret bonus: pool strictly limited to "already seen" items.
  // Source of truth: statsByItem[id].seenCount > 0
  // (Selection logic belongs to game.js; storage provides the fact.)
  StorageManager.prototype.getSeenItemIds = function () {
    const stats = this.data?.statsByItem;
    const out = [];
    if (!stats || typeof stats !== 'object') return out;

    for (const k in stats) {
      const s = stats[k];
      if (!s || typeof s !== 'object') continue;

      if (clampNonNegativeInt(s.seenCount) > 0) {
        const idNum = safeIdNum(k);
        if (idNum != null) out.push(idNum);
      }
    }

    return out;
  };

  StorageManager.prototype.getWrongCountTotal = function () {
    const stats = this.data?.statsByItem || {};
    let total = 0;
    for (const k in stats) {
      total += clampNonNegativeInt(stats[k]?.wrongCount);
    }
    return total;
  };

  // Unique pool coverage: number of distinct items where seenCount > 0.
  StorageManager.prototype.getUniqueSeenCount = function () {
    const stats = this.data?.statsByItem || {};
    let seen = 0;
    for (const k in stats) {
      if (clampNonNegativeInt(stats[k]?.seenCount) > 0) seen += 1;
    }
    return seen;
  };

  StorageManager.prototype.hasSeenAllItems = function (totalCount) {
    const stats = this.data?.statsByItem || {};
    const n = clampNonNegativeInt(totalCount);
    if (n <= 0) return false;

    let seen = 0;
    for (const k in stats) {
      if (clampNonNegativeInt(stats[k]?.seenCount) > 0) seen += 1;
    }
    return seen >= n;
  };

  // Convenience getter: "pool exhausted" using config as source of truth.
  // UI/game should not invent a number; it comes from WT_CONFIG.game.poolSize.
  StorageManager.prototype.hasSeenAllWordTraps = function () {
    return this.isPoolExhausted();
  };

  // Pool exhausted (single source of truth): seenDistinct >= config.game.poolSize
  StorageManager.prototype.isPoolExhausted = function () {
    if (!this.data) return false;
    const total = clampNonNegativeInt(this.config?.game?.poolSize);
    if (total <= 0) return false;
    return this.hasSeenAllItems(total);
  };

  // Active mistakes: items where the last interaction is wrong (lw > lc).
  StorageManager.prototype.getActiveMistakesCount = function () {
    const stats = this.data?.statsByItem || {};
    let count = 0;

    for (const k in stats) {
      const s = stats[k];
      if (!s || typeof s !== 'object') continue;

      const lw = Number(s.lastWrongAt || 0);
      const lc = Number(s.lastCorrectAt || 0);

      if (lw > lc) count += 1;
    }

    return count;
  };

  StorageManager.prototype.isMastered = function () {
    return this.isPoolExhausted() && this.getActiveMistakesCount() === 0;
  };

  // Persisted "revealed at least once" flag for post-completion UX (END -> LANDING)
  StorageManager.prototype.hasPostCompletionSeenOnce = function () {
    return !!this.data?.postCompletion?.postCompletionShown;
  };

  StorageManager.prototype.markPostCompletionSeenOnce = function () {
    if (!this.data) return;
    if (
      !this.data.postCompletion ||
      typeof this.data.postCompletion !== 'object'
    ) {
      this.data.postCompletion = deepCopy(this.defaultData.postCompletion);
    }

    if (this.data.postCompletion.postCompletionShown === true) return;

    this.data.postCompletion.postCompletionShown = true;
    this.data.postCompletion.postCompletionAt = now();
    this._save();
  };

  // One-shot: halfway milestone (pool midpoint)
  StorageManager.prototype.hasQuarterMilestoneShown = function () {
    return !!this.data?.postCompletion?.quarterMilestoneShown;
  };

  StorageManager.prototype.markQuarterMilestoneShown = function () {
    if (!this.data) return;

    if (
      !this.data.postCompletion ||
      typeof this.data.postCompletion !== 'object'
    ) {
      this.data.postCompletion = deepCopy(this.defaultData.postCompletion);
    }

    if (this.data.postCompletion.quarterMilestoneShown === true) return;

    this.data.postCompletion.quarterMilestoneShown = true;
    this.data.postCompletion.quarterMilestoneShownAt = now();
    this._save();
  };

  StorageManager.prototype.hasHalfwayMilestoneShown = function () {
    return !!this.data?.postCompletion?.halfwayMilestoneShown;
  };

  StorageManager.prototype.markHalfwayMilestoneShown = function () {
    if (!this.data) return;

    if (
      !this.data.postCompletion ||
      typeof this.data.postCompletion !== 'object'
    ) {
      this.data.postCompletion = deepCopy(this.defaultData.postCompletion);
    }

    if (this.data.postCompletion.halfwayMilestoneShown === true) return;

    this.data.postCompletion.halfwayMilestoneShown = true;
    this.data.postCompletion.halfwayMilestoneShownAt = now();
    this._save();
  };

  StorageManager.prototype.hasThreeQuartersMilestoneShown = function () {
    return !!this.data?.postCompletion?.threeQuartersMilestoneShown;
  };

  StorageManager.prototype.markThreeQuartersMilestoneShown = function () {
    if (!this.data) return;

    if (
      !this.data.postCompletion ||
      typeof this.data.postCompletion !== 'object'
    ) {
      this.data.postCompletion = deepCopy(this.defaultData.postCompletion);
    }

    if (this.data.postCompletion.threeQuartersMilestoneShown === true) return;

    this.data.postCompletion.threeQuartersMilestoneShown = true;
    this.data.postCompletion.threeQuartersMilestoneShownAt = now();
    this._save();
  };

  // One-shot: did we already celebrate "seen all questions"?
  StorageManager.prototype.hasPoolCompleteCelebrated = function () {
    return !!this.data?.postCompletion?.poolCompleteCelebrated;
  };

  StorageManager.prototype.markPoolCompleteCelebrated = function () {
    if (!this.data) return;

    if (
      !this.data.postCompletion ||
      typeof this.data.postCompletion !== 'object'
    ) {
      this.data.postCompletion = deepCopy(this.defaultData.postCompletion);
    }

    if (this.data.postCompletion.poolCompleteCelebrated === true) return;

    this.data.postCompletion.poolCompleteCelebrated = true;
    this.data.postCompletion.poolCompleteCelebratedAt = now();
    this._save();
  };

  StorageManager.prototype.hasMasteredCelebrated = function () {
    return !!this.data?.postCompletion?.masteredCelebrated;
  };

  StorageManager.prototype.markMasteredCelebrated = function () {
    if (!this.data) return;

    if (
      !this.data.postCompletion ||
      typeof this.data.postCompletion !== 'object'
    ) {
      this.data.postCompletion = deepCopy(this.defaultData.postCompletion);
    }

    if (this.data.postCompletion.masteredCelebrated === true) return;

    this.data.postCompletion.masteredCelebrated = true;
    this.data.postCompletion.masteredCelebratedAt = now();
    this._save();
  };

  StorageManager.prototype.getPersonalBest = function () {
    const pb = this.data?.personalBest || {};
    return {
      bestScoreFP: clampNonNegativeInt(pb.bestScoreFP),
      achievedAt: clampNonNegativeInt(pb.achievedAt)
    };
  };

  // LANDING stats (UI-only consumer): last runs (most recent first)
  // Source of truth: storage.data.history.lastRuns (max 20)
  StorageManager.prototype.getLastRuns = function (maxCount) {
    const n = clampNonNegativeInt(maxCount);
    if (n <= 0) return [];

    const list =
      this.data?.history && Array.isArray(this.data.history.lastRuns)
        ? this.data.history.lastRuns
        : [];

    return list.slice(0, n).map((e) => {
      const it = e && typeof e === 'object' ? e : {};
      return {
        runNumber: clampNonNegativeInt(it.runNumber),
        endedAt: clampNonNegativeInt(it.endedAt),
        scoreFP: clampNonNegativeInt(it.scoreFP),
        meta: it.meta && typeof it.meta === 'object' ? it.meta : {}
      };
    });
  };

  StorageManager.prototype.getRunPaceTotals = function () {
    const rp =
      this.data?.history &&
      this.data.history.runPaceTotals &&
      typeof this.data.history.runPaceTotals === 'object'
        ? this.data.history.runPaceTotals
        : {};

    return {
      runCount: clampNonNegativeInt(rp.runCount),
      totalNewSeen: clampNonNegativeInt(rp.totalNewSeen)
    };
  };

  StorageManager.prototype.getEarlyPriceState = function () {
    const ep = this.data?.earlyPrice || {};
    const startedAt = clampNonNegativeInt(ep.startedAt);

    // Window length is config-driven (single source of truth for mechanics)
    const windowMs = clampNonNegativeInt(this.config?.earlyPriceWindowMs);

    if (!startedAt || windowMs <= 0) {
      return { phase: 'STANDARD', remainingMs: 0, startedAt };
    }

    const elapsed = now() - startedAt;
    const remainingMs = Math.max(0, windowMs - elapsed);
    const phase = remainingMs > 0 ? 'EARLY' : 'STANDARD';
    return { phase, remainingMs, startedAt };
  };

  // ============================================
  // Economy (Runs)
  // ============================================
  // V2 rule:
  // - freeRuns (config.limits.freeRuns)
  // - after freeRuns: paywall
  // - no daily reset
  StorageManager.prototype.consumeRunOrBlock = function () {
    if (!this.data) return { ok: false, reason: 'NO_DATA', balance: 0 };

    if (this.isPremium()) {
      // Runs used metric should reflect actual starts, even for premium.
      this.data.counters.runStarts =
        clampNonNegativeInt(this.data.counters.runStarts) + 1;
      this._save();
      return { ok: true, reason: 'PREMIUM', balance: this.getRunsBalance() };
    }

    const r = this.data.runs || {};
    const bal = clampNonNegativeInt(r.balance);

    // Normal consumption (free runs)
    if (bal > 0) {
      r.balance = Math.max(0, bal - 1);
      this.data.counters.runStarts =
        clampNonNegativeInt(this.data.counters.runStarts) + 1;
      this._save();
      return { ok: true, reason: 'CONSUMED', balance: this.getRunsBalance() };
    }

    r.limitReachedCount = clampNonNegativeInt(r.limitReachedCount) + 1;
    this._save();
    return { ok: false, reason: 'NO_RUNS', balance: 0 };
  };

  // PRACTICE (Mistakes only) economy gate (separate from RUN economy)
  StorageManager.prototype.consumePracticeOrBlock = function () {
    if (!this.data) return { ok: false, reason: 'NO_DATA', used: 0, limit: 0 };

    const limit = clampNonNegativeInt(this.config?.mistakesOnly?.freeRunsLimit);
    const used = clampNonNegativeInt(this.data.counters.practiceFreeRunsUsed);

    if (this.isPremium()) {
      this._save();
      return { ok: true, reason: 'PREMIUM', used, limit };
    }

    if (limit > 0 && used < limit) {
      this.data.counters.practiceFreeRunsUsed = used + 1;
      this._save();
      return { ok: true, reason: 'CONSUMED', used: used + 1, limit };
    }

    this._save();
    return { ok: false, reason: 'NO_RUNS', used, limit };
  };

  StorageManager.prototype.getPracticeRunsRemaining = function () {
    if (!this.data) return 0;
    if (this.isPremium()) return Infinity;

    const limit = clampNonNegativeInt(this.config?.mistakesOnly?.freeRunsLimit);
    const used = clampNonNegativeInt(this.data?.counters?.practiceFreeRunsUsed);
    return Math.max(0, limit - used);
  };

  StorageManager.prototype.getPracticeFreeRunsUsed = function () {
    return clampNonNegativeInt(this.data?.counters?.practiceFreeRunsUsed);
  };

  // ============================================
  // Settings
  // ============================================

  StorageManager.prototype.setMistakesOnly = function (on) {
    if (!this.data) return;
    this.data.settings.mistakesOnly = on === true;
    this._save();
  };

  StorageManager.prototype.getMistakesOnly = function () {
    return !!this.data?.settings?.mistakesOnly;
  };

  StorageManager.prototype.markMistakesOnlyCompletedOnce = function () {
    if (!this.data) return;
    this.data.settings.mistakesOnlyCompletedOnce = true;
    this._save();
  };

  StorageManager.prototype.hasUsedMistakesOnly = function () {
    return !!this.data?.settings?.mistakesOnlyCompletedOnce;
  };

  StorageManager.prototype.setAutoReadQuestions = function (on) {
    if (!this.data) return;
    this.data.settings.autoReadQuestions = on === true;
    this._save();
  };

  StorageManager.prototype.getAutoReadQuestions = function () {
    return !!this.data?.settings?.autoReadQuestions;
  };

  // ============================================
  // House Ad / Waitlist persisted states (V2)
  // ============================================

  StorageManager.prototype.hasSeenHouseAdIntro = function () {
    return !!this.data?.houseAd?.introSeen;
  };

  StorageManager.prototype.markSeenHouseAdIntro = function () {
    if (!this.data) return;
    if (!this.data.houseAd || typeof this.data.houseAd !== 'object') {
      this.data.houseAd = deepCopy(this.defaultData.houseAd);
    }
    this.data.houseAd.introSeen = true;
    this._save();
  };

  StorageManager.prototype.getHouseAdState = function () {
    const s = String(this.data?.houseAd?.state || '').trim();

    // Migration KISS: legacy "dismissed" => treated as "remind_later"
    if (s === 'dismissed') {
      try {
        if (!this.data.houseAd || typeof this.data.houseAd !== 'object') {
          this.data.houseAd = deepCopy(this.defaultData.houseAd);
        }
        this.data.houseAd.state = 'remind_later';
        this._save();
      } catch (_) {
        /* silent */
      }
      return 'remind_later';
    }

    return s === 'never_seen' || s === 'remind_later' ? s : 'never_seen';
  };

  StorageManager.prototype.setHouseAdState = function (state) {
    if (!this.data) return;
    const s = String(state || '').trim();
    if (s !== 'never_seen' && s !== 'remind_later') return;

    if (!this.data.houseAd || typeof this.data.houseAd !== 'object') {
      this.data.houseAd = deepCopy(this.defaultData.houseAd);
    }
    this.data.houseAd.state = s;
    this._save();
  };

  StorageManager.prototype.getWaitlistStatus = function () {
    const s = String(this.data?.waitlist?.status || '').trim();
    if (s === 'joined') return 'opted_in';
    return s === 'not_seen' || s === 'seen' || s === 'opted_in' ? s : 'not_seen';
  };

  StorageManager.prototype.setWaitlistStatus = function (status) {
    if (!this.data) return;
    let s = String(status || '').trim();
    if (s === 'joined') s = 'opted_in';
    if (s !== 'not_seen' && s !== 'seen' && s !== 'opted_in') return;

    if (!this.data.waitlist || typeof this.data.waitlist !== 'object') {
      this.data.waitlist = deepCopy(this.defaultData.waitlist);
    }
    this.data.waitlist.status = s;
    this._save();
  };

  StorageManager.prototype.getWaitlistDraftIdea = function () {
    const s = String(this.data?.waitlist?.draftIdea || '').trim();
    return s;
  };

  StorageManager.prototype.setWaitlistDraftIdea = function (idea) {
    if (!this.data) return;

    if (!this.data.waitlist || typeof this.data.waitlist !== 'object') {
      this.data.waitlist = deepCopy(this.defaultData.waitlist);
    }

    this.data.waitlist.draftIdea = String(idea || '').trim();
    this._save();
  };

  StorageManager.prototype.getHouseAdHiddenUntil = function () {
    return clampNonNegativeInt(this.data?.settings?.houseAdHiddenUntil);
  };

  // True if House Ad is currently hidden by timestamp.
  StorageManager.prototype.isHouseAdHiddenNow = function () {
    const until = this.getHouseAdHiddenUntil();
    return until > 0 && now() < until;
  };

  // Set an absolute hide-until timestamp (ms).
  StorageManager.prototype.setHouseAdHiddenUntil = function (untilMs) {
    if (!this.data) return;
    if (!this.data.settings || typeof this.data.settings !== 'object') {
      this.data.settings = deepCopy(this.defaultData.settings);
    }

    const until = clampNonNegativeInt(untilMs);
    this.data.settings.houseAdHiddenUntil = until;
    this._save();
  };

  StorageManager.prototype.hideHouseAdUsingConfig = function () {
    if (!this.data) return { ok: false, until: 0 };

    const hideMs = clampNonNegativeInt(this.config?.houseAd?.hideMs);
    if (hideMs <= 0) return { ok: false, until: 0 };

    const until = now() + hideMs;

    // Ensure shapes exist (defensive)
    if (!this.data.houseAd || typeof this.data.houseAd !== 'object') {
      this.data.houseAd = deepCopy(this.defaultData.houseAd);
    }
    if (!this.data.settings || typeof this.data.settings !== 'object') {
      this.data.settings = deepCopy(this.defaultData.settings);
    }

    // Single write: state + hide-until, then one _save() / one EVT.
    this.data.houseAd.state = 'remind_later';
    this.data.settings.houseAdHiddenUntil = clampNonNegativeInt(until);

    this._save();
    return { ok: true, until: until };
  };

  StorageManager.prototype.clearHouseAdHidden = function () {
    this.setHouseAdHiddenUntil(0);
  };

  // Config-driven unlock: has the user seen enough unique items to unlock House Ad?
  // Source of truth: WT_CONFIG.houseAd.minUniqueSeenToShow.
  StorageManager.prototype.hasReachedHouseAdThreshold = function () {
    if (!this.data) return false;

    const cfg = this.config || {};
    const n = clampNonNegativeInt(cfg?.houseAd?.minUniqueSeenToShow);
    if (n <= 0) return false;

    const stats = this.data?.statsByItem || {};
    let seenDistinct = 0;

    for (const k in stats) {
      if (clampNonNegativeInt(stats[k]?.seenCount) > 0) seenDistinct += 1;
      if (seenDistinct >= n) return true;
    }

    return false;
  };

  // Config-driven unlock: has the user seen enough unique items to unlock Waitlist?
  // Source of truth: WT_CONFIG.waitlist.minUniqueSeenToShow.
  StorageManager.prototype.hasReachedWaitlistThreshold = function () {
    if (!this.data) return false;

    const cfg = this.config || {};
    const n = clampNonNegativeInt(cfg?.waitlist?.minUniqueSeenToShow);
    if (n <= 0) return false;

    const stats = this.data?.statsByItem || {};
    let seenDistinct = 0;

    for (const k in stats) {
      if (clampNonNegativeInt(stats[k]?.seenCount) > 0) seenDistinct += 1;
      if (seenDistinct >= n) return true;
    }

    return false;
  };

  // Single decision point: should the House Ad be shown *now*.
  // UI passes only what storage can't know: whether we are currently in-run.
  StorageManager.prototype.shouldShowHouseAdNow = function (ctx) {
    if (!this.data) return false;

    const cfg = this.config || {};
    const haCfg = cfg.houseAd || {};

    if (haCfg.enabled !== true) return false;
    if (!String(haCfg.url || '').trim()) return false;

    // Unlock based on unique seen threshold, but only after the full pool is exhausted.
    if (this.hasReachedHouseAdThreshold() !== true) return false;
    if (
      typeof this.hasSeenAllWordTraps !== 'function' ||
      this.hasSeenAllWordTraps() !== true
    )
      return false;

    // Never show during a run.
    if (ctx && ctx.inRun === true) return false;

    // Respect "remind later" hiding window (timestamp).
    if (this.isHouseAdHiddenNow()) return false;

    return true;
  };

  // Single decision point: should the Waitlist be shown *now*.
  // UI passes only what storage can't know: whether we are currently in-run.
  StorageManager.prototype.shouldShowWaitlistNow = function (ctx) {
    if (!this.data) return false;

    const cfg = this.config || {};
    const wlCfg = cfg.waitlist || {};

    if (wlCfg.enabled !== true) return false;

    // Unlock based on unique seen threshold (not pool exhausted).
    if (this.hasReachedWaitlistThreshold() !== true) return false;

    // Never show during a run.
    if (ctx && ctx.inRun === true) return false;

    // Optional: if already opted in, never show again (fail-closed).
    const st = String(this.data?.waitlist?.status || '').trim();
    if (st === 'joined' || st === 'opted_in') return false;

    return true;
  };

  StorageManager.prototype.shouldShowWaitlistOnPaywall = function () {
    if (!this.data) return false;

    const cfg = this.config || {};
    const wlCfg = cfg.waitlist || {};

    if (wlCfg.enabled !== true) return false;

    // Paywall channel: separate from the landing/post-completion threshold.
    // The trigger here is free runs exhausted, not unique cards seen.
    const st = String(this.data?.waitlist?.status || '').trim();
    if (st === 'joined' || st === 'opted_in') return false;

    return true;
  };

  // ============================================
  // Per-answer stats writing (V2)
  // ============================================
  StorageManager.prototype.recordAnswer = function (itemId, isCorrectBool) {
    if (!this.data) return;

    const idNum = safeIdNum(itemId);
    const isCorrect = safeBool(isCorrectBool);

    if (idNum == null || isCorrect == null) return;

    const s = this._ensureItemStats(idNum);
    s.seenCount = clampNonNegativeInt(s.seenCount) + 1;
    s.lastSeenAt = now();

    if (isCorrect) {
      s.correctCount = clampNonNegativeInt(s.correctCount) + 1;
      s.lastCorrectAt = now();
    } else {
      s.wrongCount = clampNonNegativeInt(s.wrongCount) + 1;
      s.lastWrongAt = now();
    }

    this._save();
  };

  StorageManager.prototype.getBonusBest = function () {
    const bb = this.data?.bonusBest || {};
    return {
      bestScoreFP: clampNonNegativeInt(bb.bestScoreFP),
      achievedAt: clampNonNegativeInt(bb.achievedAt)
    };
  };

  StorageManager.prototype._ensureProgressionShape = function () {
    if (!this.data) return { currentLevel: 0, unlockedAtByLevel: {} };

    const maxLevel = getConfiguredMaxLevel(this.config);
    if (!maxLevel) {
      throw new Error('StorageManager: missing or invalid config.levels.maxLevel');
    }

    if (!this.data.progression || typeof this.data.progression !== 'object') {
      this.data.progression = deepCopy(this.defaultData.progression);
    }

    this.data.progression.currentLevel = Math.min(
      maxLevel,
      clampNonNegativeInt(this.data.progression.currentLevel)
    );
    this.data.progression.unlockedAtByLevel = ensureUnlockedAtByLevelShape(
      this.data.progression.unlockedAtByLevel,
      maxLevel
    );

    return this.data.progression;
  };

  StorageManager.prototype._getLevelEligibility = function (meta) {
    const levelsCfg =
      this.config?.levels && typeof this.config.levels === 'object'
        ? this.config.levels
        : {};

    if (levelsCfg.enabled !== true) return 0;

    const maxLevel = getConfiguredMaxLevel(this.config);
    if (!maxLevel) return 0;

    const mode = String(meta?.mode || '')
      .trim()
      .toUpperCase();
    const totalPresented = clampNonNegativeInt(meta?.totalPresented);
    const scoreFP = clampNonNegativeInt(meta?.scoreFP);
    const accuracy = totalPresented > 0 ? scoreFP / totalPresented : 0;

    const runCompletes = clampNonNegativeInt(this.data?.counters?.runCompletes);
    const seenPool = this.getUniqueSeenCount();
    const mastered = this.isMastered();
    const personalBest = clampNonNegativeInt(
      this.data?.personalBest?.bestScoreFP
    );
    const bestRunScore = Math.max(personalBest, mode === 'RUN' ? scoreFP : 0);

    const level1MinRunCompletes = Math.max(
      1,
      clampNonNegativeInt(levelsCfg.level1MinRunCompletes)
    );
    const level2MinSeen = clampNonNegativeInt(levelsCfg.level2MinSeen);
    const level3MinSeen = clampNonNegativeInt(levelsCfg.level3MinSeen);
    const level3MinBestScore = clampNonNegativeInt(
      levelsCfg.level3MinBestScore
    );
    const level4MinSeen = clampNonNegativeInt(levelsCfg.level4MinSeen);
    const level5MinSeen = clampNonNegativeInt(
      levelsCfg.level5RapidFireMinSeen
    );
    const level6MinSeen = clampNonNegativeInt(
      levelsCfg.level6RapidFireMinSeen
    );
    const level5MinAccuracy = Number(levelsCfg.level5RapidFireMinAccuracy);
    const level6MinAccuracy = Number(levelsCfg.level6RapidFireMinAccuracy);

    let eligible = 0;

    if (maxLevel >= 1 && runCompletes >= level1MinRunCompletes) eligible = 1;
    if (maxLevel >= 2 && level2MinSeen > 0 && seenPool >= level2MinSeen) {
      eligible = 2;
    }
    if (
      maxLevel >= 3 &&
      ((level3MinSeen > 0 && seenPool >= level3MinSeen) ||
        (level3MinBestScore > 0 && bestRunScore >= level3MinBestScore))
    ) {
      eligible = 3;
    }
    if (maxLevel >= 4 && level4MinSeen > 0 && seenPool >= level4MinSeen) {
      eligible = 4;
    }
    if (
      maxLevel >= 5 &&
      mode === 'BONUS' &&
      mastered &&
      level5MinSeen > 0 &&
      seenPool >= level5MinSeen &&
      Number.isFinite(level5MinAccuracy) &&
      accuracy >= level5MinAccuracy
    ) {
      eligible = 5;
    }
    if (
      maxLevel >= 6 &&
      mode === 'BONUS' &&
      mastered &&
      level6MinSeen > 0 &&
      seenPool >= level6MinSeen &&
      Number.isFinite(level6MinAccuracy) &&
      accuracy >= level6MinAccuracy
    ) {
      eligible = 6;
    }

    return Math.min(maxLevel, eligible);
  };

  StorageManager.prototype.getLevelState = function () {
    const maxLevel = getConfiguredMaxLevel(this.config);
    const emptyState = {
      currentLevel: 0,
      unlockedAtByLevel: makeUnlockedAtByLevel(maxLevel || 1)
    };

    if (!this.data) return emptyState;

    const p = this._ensureProgressionShape();
    const currentLevel = Math.min(maxLevel, clampNonNegativeInt(p.currentLevel));

    // Self-heal older local progress for non-Rapid-Fire levels. Rapid Fire
    // levels still require an explicit Rapid Fire completion through
    // updateLevelProgression(meta), because they depend on run accuracy.
    const eligibleNow = Math.min(4, this._getLevelEligibility({ mode: 'RUN' }));
    if (eligibleNow > currentLevel) {
      const ts = now();
      p.currentLevel = eligibleNow;
      for (let level = 1; level <= eligibleNow; level += 1) {
        p.unlockedAtByLevel[level] =
          clampNonNegativeInt(p.unlockedAtByLevel[level]) || ts;
      }
      this._save();
    }

    return {
      currentLevel: Math.min(maxLevel, clampNonNegativeInt(p.currentLevel)),
      unlockedAtByLevel: ensureUnlockedAtByLevelShape(
        p.unlockedAtByLevel,
        maxLevel
      )
    };
  };

  StorageManager.prototype.updateLevelProgression = function (meta) {
    const maxLevel = getConfiguredMaxLevel(this.config);
    if (!this.data || !maxLevel) {
      return {
        previousLevel: 0,
        currentLevel: 0,
        unlockedLevel: 0,
        justUnlocked: false
      };
    }

    const p = this._ensureProgressionShape();
    const prevLevel = Math.min(maxLevel, clampNonNegativeInt(p.currentLevel));
    const eligibleLevel = this._getLevelEligibility(meta);
    const nextLevel = Math.max(prevLevel, eligibleLevel);

    const justUnlocked = nextLevel > prevLevel;
    if (justUnlocked) {
      const ts = now();
      p.currentLevel = nextLevel;
      for (let level = prevLevel + 1; level <= nextLevel; level += 1) {
        p.unlockedAtByLevel[level] =
          clampNonNegativeInt(p.unlockedAtByLevel[level]) || ts;
      }
      this._save();
    }

    return {
      previousLevel: prevLevel,
      currentLevel: justUnlocked ? nextLevel : prevLevel,
      unlockedLevel: justUnlocked ? nextLevel : 0,
      justUnlocked
    };
  };

  // ============================================
  // Run completion (V2)
  // ============================================
  StorageManager.prototype.recordRunComplete = function (
    runNumber,
    scoreFP,
    meta
  ) {
    if (!this.data) return { ok: false, newBest: false };

    const score = clampNonNegativeInt(scoreFP);
    const rn = clampNonNegativeInt(runNumber);
    const list =
      this.data.history && Array.isArray(this.data.history.lastRuns)
        ? this.data.history.lastRuns
        : [];

    // Idempotence guard: a runNumber must never be recorded twice.
    // Double-calls would otherwise inflate runCompletes, daily history, and best-score side effects.
    if (rn > 0 && findRunEntryByNumber(list, rn)) {
      return {
        ok: true,
        newBest: false,
        bestScoreFP: clampNonNegativeInt(this.data.personalBest?.bestScoreFP)
      };
    }

    // Capture completes BEFORE increment (source of truth)
    const prevCompletes = clampNonNegativeInt(
      this.data?.counters?.runCompletes
    );

    // Counters
    this.data.counters.runNumber = Math.max(this.data.counters.runNumber, rn);
    this.data.counters.runCompletes = prevCompletes + 1;

    // Personal best
    const pb = this.data.personalBest || { bestScoreFP: 0, achievedAt: 0 };
    const prevBest = clampNonNegativeInt(pb.bestScoreFP);

    const mode = String((meta && meta.mode) || '')
      .trim()
      .toUpperCase();
    const isRun = mode === 'RUN';

    let newBest = false;

    if (isRun && score > prevBest) {
      pb.bestScoreFP = score;
      pb.achievedAt = now();
      this.data.personalBest = pb;

      // Do NOT celebrate the very first completion on device
      // Celebrate only if user had already completed at least 1 run before
      newBest = prevCompletes >= 1;
    }

    // Run history
    const entry = {
      runNumber: rn,
      endedAt: now(),
      scoreFP: score,
      meta: meta && typeof meta === 'object' ? meta : {}
    };

    list.unshift(entry);
    while (list.length > 20) list.pop();

    this.data.history = this.data.history || {};
    this.data.history.lastRuns = list;

    const runMode = String(entry?.meta?.mode || '')
      .trim()
      .toUpperCase();
    const newSeenCount = clampNonNegativeInt(entry?.meta?.newSeenCount);

    const prevPaceTotals =
      this.data.history.runPaceTotals &&
      typeof this.data.history.runPaceTotals === 'object'
        ? this.data.history.runPaceTotals
        : { runCount: 0, totalNewSeen: 0 };

    this.data.history.runPaceTotals = {
      runCount:
        clampNonNegativeInt(prevPaceTotals.runCount) +
        (runMode === 'RUN' ? 1 : 0),
      totalNewSeen:
        clampNonNegativeInt(prevPaceTotals.totalNewSeen) +
        (runMode === 'RUN' ? newSeenCount : 0)
    };

    this._save();

    return {
      ok: true,
      newBest,
      bestScoreFP: clampNonNegativeInt(this.data.personalBest.bestScoreFP)
    };
  };

  // ============================================
  // Bonus completion (V1)
  // ============================================
  StorageManager.prototype.recordBonusComplete = function (scoreFP, meta) {
    if (!this.data) return { ok: false, newBest: false };

    const score = clampNonNegativeInt(scoreFP);

    // Capture completes BEFORE increment (source of truth)
    const prevCompletes = clampNonNegativeInt(
      this.data?.counters?.bonusCompletes
    );

    // Counters
    this.data.counters.bonusCompletes = prevCompletes + 1;

    // Bonus best
    const bb = this.data.bonusBest || { bestScoreFP: 0, achievedAt: 0 };
    const prevBest = clampNonNegativeInt(bb.bestScoreFP);

    const mode = String((meta && meta.mode) || '')
      .trim()
      .toUpperCase();
    const isBonus = mode === 'BONUS';

    let newBest = false;

    if (isBonus && score > prevBest) {
      bb.bestScoreFP = score;
      bb.achievedAt = now();
      this.data.bonusBest = bb;

      // Do NOT celebrate the very first completion on device
      newBest = prevCompletes >= 1;
    }

    this._save();

    return {
      ok: true,
      newBest,
      bestScoreFP: clampNonNegativeInt(this.data.bonusBest.bestScoreFP)
    };
  };

  // ============================================
  // Paywall / Checkout counters
  // ============================================
  StorageManager.prototype.markLandingViewed = function () {
    if (!this.data) return;
    this.data.counters.landingViewed =
      clampNonNegativeInt(this.data.counters.landingViewed) + 1;
    this._save();
  };

  StorageManager.prototype.markLandingPlayClicked = function () {
    if (!this.data) return;
    this.data.counters.landingPlayClicked =
      clampNonNegativeInt(this.data.counters.landingPlayClicked) + 1;
    this._save();
  };

  StorageManager.prototype.markLandingPracticeClicked = function () {
    if (!this.data) return;
    this.data.counters.landingPracticeClicked =
      clampNonNegativeInt(this.data.counters.landingPracticeClicked) + 1;
    this._save();
  };

  StorageManager.prototype.markDailyChallengeClicked = function () {
    if (!this.data) return;
    this.data.counters.dailyChallengeClicked =
      clampNonNegativeInt(this.data.counters.dailyChallengeClicked) + 1;
    this._save();
  };

  StorageManager.prototype.markLandingNextRunStarted = function () {
    if (!this.data) return;
    this.data.counters.landingNextRunStarted =
      clampNonNegativeInt(this.data.counters.landingNextRunStarted) + 1;
    this._save();
  };

  StorageManager.prototype.markLandingNextRunCompleted = function () {
    if (!this.data) return;
    this.data.counters.landingNextRunCompleted =
      clampNonNegativeInt(this.data.counters.landingNextRunCompleted) + 1;
    this._save();
  };

  StorageManager.prototype.recordLandingTime = function (ms) {
    if (!this.data) return;
    const delta = clampNonNegativeInt(ms);
    if (delta <= 0) return;
    this.data.counters.landingTimeTotalMs =
      clampNonNegativeInt(this.data.counters.landingTimeTotalMs) + delta;
    this._save();
  };

  StorageManager.prototype.markPaywallShown = function (source) {
    if (!this.data) return;
    this.data.counters.paywallShown =
      clampNonNegativeInt(this.data.counters.paywallShown) + 1;

    const src = String(source || '')
      .trim()
      .toUpperCase();
    if (src === 'LANDING') {
      this.data.counters.paywallShownFromLanding =
        clampNonNegativeInt(this.data.counters.paywallShownFromLanding) + 1;
      this.data.analytics.paywallLastSource = 'landing';
    } else if (src === 'END') {
      this.data.counters.paywallShownFromEnd =
        clampNonNegativeInt(this.data.counters.paywallShownFromEnd) + 1;
      this.data.analytics.paywallLastSource = 'end';
    } else if (src === 'PLAYING') {
      this.data.counters.paywallShownFromPlaying =
        clampNonNegativeInt(this.data.counters.paywallShownFromPlaying) + 1;
      this.data.analytics.paywallLastSource = 'playing';
    } else {
      this.data.counters.paywallShownFromOther =
        clampNonNegativeInt(this.data.counters.paywallShownFromOther) + 1;
      this.data.analytics.paywallLastSource = 'other';
    }

    // Early price window starts once, at the first PAYWALL view (persisted).
    const ep = this.data.earlyPrice || {};

    if (!clampNonNegativeInt(ep.startedAt)) {
      ep.startedAt = now();
    }

    this.data.earlyPrice = ep;
    this._save();
  };

  StorageManager.prototype.markCheckoutStarted = function (priceKey) {
    if (!this.data) return;

    const k = String(priceKey || '').trim();
    if (!k) return;

    if (!this.data.counters || typeof this.data.counters !== 'object') {
      this.data.counters = deepCopy(this.defaultData.counters);
    }
    if (!this.data.analytics || typeof this.data.analytics !== 'object') {
      this.data.analytics = deepCopy(this.defaultData.analytics);
    }

    this.data.counters.checkoutStarted =
      clampNonNegativeInt(this.data.counters.checkoutStarted) + 1;
    this.data.analytics.checkoutStartedAt = now();
    this.data.analytics.checkoutPriceKey = k;

    this._save();
  };

  StorageManager.prototype.markShareClicked = function () {
    if (!this.data) return;
    this.data.counters.shareClicked =
      clampNonNegativeInt(this.data.counters.shareClicked) + 1;
    this._save();
  };

  StorageManager.prototype.markInstallPromptShown = function () {
    if (!this.data) return;
    this.data.counters.installPromptShown =
      clampNonNegativeInt(this.data.counters.installPromptShown) + 1;
    this._save();
  };

  StorageManager.prototype.markHouseAdShown = function () {
    if (!this.data) return;
    this.data.counters.houseAdShown =
      clampNonNegativeInt(this.data.counters.houseAdShown) + 1;
    this._save();
  };

  StorageManager.prototype.markHouseAdClicked = function () {
    if (!this.data) return;
    this.data.counters.houseAdClicked =
      clampNonNegativeInt(this.data.counters.houseAdClicked) + 1;
    this._save();
  };

  // ============================================
  // Premium activation (codes)
  // ============================================
  StorageManager.prototype.unlockPremium = function () {
    if (!this.data) return { ok: false, already: false };
    if (this.data.isPremium) return { ok: true, already: true };

    if (!this.data.counters || typeof this.data.counters !== 'object') {
      this.data.counters = deepCopy(this.defaultData.counters);
    }
    if (!this.data.analytics || typeof this.data.analytics !== 'object') {
      this.data.analytics = deepCopy(this.defaultData.analytics);
    }

    this.data.isPremium = true;

    this.data.analytics.premiumUnlockedAt = now();
    this.data.counters.premiumUnlockedCount =
      clampNonNegativeInt(this.data.counters.premiumUnlockedCount) + 1;

    this._save();
    return { ok: true, already: false };
  };

  StorageManager.prototype.clearVanityCode = function () {
    const cfg = this.config || {};
    const vanityKey = String(cfg?.storage?.vanityCodeStorageKey || '').trim();
    if (!vanityKey) return;

    try {
      window.localStorage.removeItem(vanityKey);
    } catch (_) {}
  };

  StorageManager.prototype.resetAll = function () {
    const cfg = this.config || {};
    const vanityKey = String(cfg?.storage?.vanityCodeStorageKey || '').trim();

    try {
      window.localStorage.removeItem(this.storageKey);
    } catch (_) {
      /* silent */
    }

    if (vanityKey) {
      try {
        window.localStorage.removeItem(vanityKey);
      } catch (_) {
        /* silent */
      }
    }

    this._wipeAndReset();
  };

  StorageManager.prototype.tryRedeemPremiumCode = function (codeInput) {
    if (!this.data) return { ok: false, reason: 'NO_DATA' };

    // If already premium, treat as no-op
    if (this.isPremium()) return { ok: true, reason: 'ALREADY' };

    const cfg = this.config || {};

    const code = String(codeInput || '').trim();
    if (!code) return { ok: false, reason: 'EMPTY' };

    this._compileCodeRegex();
    const re = this._premiumCodeRe;
    if (!re) return { ok: false, reason: 'DISABLED' };

    // Defensive: RegExp.test() is stateful with /g or /y
    try {
      re.lastIndex = 0;
    } catch (_) {}
    if (!re.test(code)) return { ok: false, reason: 'INVALID' };

    // Ensure codes block exists (defensive)
    if (!this.data.codes || typeof this.data.codes !== 'object') {
      this.data.codes = { redeemedOnce: false, code: '' };
    }
    if (typeof this.data.codes.redeemedOnce !== 'boolean')
      this.data.codes.redeemedOnce = false;
    if (typeof this.data.codes.code !== 'string') this.data.codes.code = '';

    // Enforce "one code per device" if enabled
    const acceptOnce = cfg.acceptCodeOncePerDevice === true;
    if (acceptOnce && this.data.codes.redeemedOnce === true) {
      return { ok: false, reason: 'USED' };
    }

    // Persist code locally in storage data (single source of truth)
    if (acceptOnce) {
      this.data.codes.redeemedOnce = true;
    }
    this.data.codes.code = code;

    // Optional vanity/last code in separate localStorage key (UI convenience)
    const vanityKey = String(cfg?.storage?.vanityCodeStorageKey || '').trim();
    if (vanityKey) {
      try {
        window.localStorage.setItem(vanityKey, code);
      } catch (_) {
        // ignore
      }
    }

    // Counters
    if (this.data.counters) {
      this.data.counters.codeRedeemed =
        clampNonNegativeInt(this.data.counters.codeRedeemed) + 1;
    }

    // Unlock premium
    // unlockPremium() already persists + emits exactly once.
    const res = this.unlockPremium();
    if (res && res.ok) {
      return { ok: true, reason: 'UNLOCKED' };
    }

    // If unlock failed, revert "redeemedOnce" only if we just set it
    if (acceptOnce) {
      this.data.codes.redeemedOnce = false;
    }
    this.data.codes.code = '';
    this._save();

    return { ok: false, reason: 'FAILED' };
  };

  // Server-verified redemption path for admin/guest codes (see
  // leaderboard-worker's POST /redeem-code — same Worker as the leaderboard,
  // just a different route). Unlike tryRedeemPremiumCode() above, this never
  // trusts a client-side regex: the Worker holds the real ADMIN_CODE/
  // GUEST_CODE secrets and is the only thing that can say "yes". Falls back
  // to REMOTE_UNAVAILABLE (caller should then try tryRedeemPremiumCode()) if
  // the Worker is unreachable, offline, or doesn't recognize the code as a
  // special one — this does NOT touch the "one code per device" gate used
  // by the format-only customer codes, since admin/guest codes have their
  // own server-side limits (unlimited devices for admin, a capped use count
  // per guest code value).
  StorageManager.prototype.tryRedeemPremiumCodeRemote = async function (codeInput) {
    if (!this.data) return { ok: false, reason: 'NO_DATA' };
    if (this.isPremium()) return { ok: true, reason: 'ALREADY' };

    const code = String(codeInput || '').trim();
    if (!code) return { ok: false, reason: 'EMPTY' };

    const cfg = this.config || {};
    const baseUrl = String(cfg?.leaderboard?.apiBaseUrl || '')
      .trim()
      .replace(/\/+$/, '');
    if (!baseUrl) return { ok: false, reason: 'REMOTE_UNAVAILABLE' };

    let deviceUuid = '';
    try {
      deviceUuid = String(this.ensureLeaderboardDeviceUuid() || '').trim();
    } catch (_) {
      deviceUuid = '';
    }
    if (!deviceUuid) return { ok: false, reason: 'REMOTE_UNAVAILABLE' };

    const timeoutMs = Math.max(
      500,
      Math.min(15000, Number(cfg?.leaderboard?.requestTimeoutMs) || 4000)
    );
    const controller =
      typeof AbortController !== 'undefined' ? new AbortController() : null;
    let timerId = 0;
    let res = null;
    let json = null;

    try {
      if (controller && timeoutMs > 0) {
        timerId = window.setTimeout(() => controller.abort(), timeoutMs);
      }
      res = await fetch(`${baseUrl}/redeem-code`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          accept: 'application/json'
        },
        body: JSON.stringify({ code, device_uuid: deviceUuid }),
        signal: controller ? controller.signal : undefined
      });
      json = await res.json().catch(() => null);
    } catch (_) {
      return { ok: false, reason: 'REMOTE_UNAVAILABLE' };
    } finally {
      if (timerId) window.clearTimeout(timerId);
    }

    if (!res || !json) return { ok: false, reason: 'REMOTE_UNAVAILABLE' };
    if (!res.ok || json.ok !== true) {
      return { ok: false, reason: String(json.reason || `HTTP_${res.status}`) };
    }

    const tier = String(json.tier || '').trim();

    const unlockRes = this.unlockPremium();
    if (!unlockRes || !unlockRes.ok) return { ok: false, reason: 'FAILED' };

    if (!this.data.codes || typeof this.data.codes !== 'object') {
      this.data.codes = { redeemedOnce: false, code: '' };
    }
    this.data.codes.redeemedOnce = true;
    this.data.codes.code = code;
    this.data.codes.tier = tier;
    if (this.data.counters) {
      this.data.counters.codeRedeemed =
        clampNonNegativeInt(this.data.counters.codeRedeemed) + 1;
    }
    this._save();

    return { ok: true, reason: 'UNLOCKED', tier };
  };

  // ============================================
  // Anonymous Stats Payload (opt-in sharing)
  // ============================================
  StorageManager.prototype.getAnonymousStatsPayload = function () {
    if (!this.data) return null;
    const cfg = this.config || {};
    const schemaVersion = String(
      cfg?.statsSharing?.schemaVersion != null
        ? cfg.statsSharing.schemaVersion
        : ''
    ).trim();

    // Gather top mistakes
    const stats = this.data.statsByItem || {};
    const mistakes = [];
    for (const k in stats) {
      const s = stats[k];
      if (s && clampNonNegativeInt(s.wrongCount) > 0) {
        mistakes.push({
          id: Number(k),
          wrongCount: clampNonNegativeInt(s.wrongCount)
        });
      }
    }
    mistakes.sort((a, b) => b.wrongCount - a.wrongCount);
    const topMistakes = mistakes;

    // Total mistakes
    let totalMistakes = 0;
    for (const m of mistakes) {
      totalMistakes += m.wrongCount;
    }

    // Pool metrics
    // - poolProgress: unique coverage (0..1)
    // - poolExposure: total exposures per poolSize (can exceed 1)
    let uniqueSeenCount = 0;
    let totalSeenEvents = 0;
    for (const k in stats) {
      const sc = clampNonNegativeInt(stats[k]?.seenCount);
      if (sc > 0) uniqueSeenCount++;
      totalSeenEvents += sc;
    }

    const poolSize = clampNonNegativeInt(cfg?.game?.poolSize);
    const poolProgress =
      poolSize > 0 ? Math.round((uniqueSeenCount / poolSize) * 100) / 100 : 0;
    const poolExposure =
      poolSize > 0 ? Math.round((totalSeenEvents / poolSize) * 100) / 100 : 0;

    // Device type (simple, no fingerprinting)
    let device = 'desktop';
    try {
      if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
        device = 'mobile';
      }
    } catch (_) {}

    // Runs
    const runs = clampNonNegativeInt(this.data.counters?.runCompletes);

    // Premium
    const isPremium = !!this.data.isPremium;

    // Personal best
    const personalBest = clampNonNegativeInt(
      this.data.personalBest?.bestScoreFP
    );

    return {
      v: schemaVersion,
      ts: new Date().toISOString(),
      runs: runs,
      isPremium: isPremium,
      personalBest: personalBest,

      // Pool metrics
      poolSize: poolSize,
      uniqueSeen: uniqueSeenCount,
      totalSeenEvents: totalSeenEvents,
      poolProgress: poolProgress,
      poolExposure: poolExposure,

      topMistakes: topMistakes,
      totalMistakes: totalMistakes,
      device: device,

      milestones: {
        quarterShown: !!this.data.postCompletion?.quarterMilestoneShownAt,
        halfwayShown: !!this.data.postCompletion?.halfwayMilestoneShownAt,
        threeQuartersShown:
          !!this.data.postCompletion?.threeQuartersMilestoneShownAt
      },

      // Funnel (aggregated, local-only)
      funnel: {
        landingViewed: clampNonNegativeInt(this.data.counters?.landingViewed),
        landingPlayClicked: clampNonNegativeInt(
          this.data.counters?.landingPlayClicked
        ),
        landingPracticeClicked: clampNonNegativeInt(
          this.data.counters?.landingPracticeClicked
        ),
        dailyChallengeClicked: clampNonNegativeInt(
          this.data.counters?.dailyChallengeClicked
        ),
        landingNextRunStarted: clampNonNegativeInt(
          this.data.counters?.landingNextRunStarted
        ),
        landingNextRunCompleted: clampNonNegativeInt(
          this.data.counters?.landingNextRunCompleted
        ),
        landingTimeTotalMs: clampNonNegativeInt(
          this.data.counters?.landingTimeTotalMs
        ),
        paywallShown: clampNonNegativeInt(this.data.counters?.paywallShown),
        paywallShownFromLanding: clampNonNegativeInt(
          this.data.counters?.paywallShownFromLanding
        ),
        paywallShownFromEnd: clampNonNegativeInt(
          this.data.counters?.paywallShownFromEnd
        ),
        paywallShownFromPlaying: clampNonNegativeInt(
          this.data.counters?.paywallShownFromPlaying
        ),
        paywallShownFromOther: clampNonNegativeInt(
          this.data.counters?.paywallShownFromOther
        ),
        checkoutStarted: clampNonNegativeInt(
          this.data.counters?.checkoutStarted
        ),
        runStarts: clampNonNegativeInt(this.data.counters?.runStarts),
        runCompletes: clampNonNegativeInt(this.data.counters?.runCompletes),
        bonusCompletes: clampNonNegativeInt(this.data.counters?.bonusCompletes),
        shareClicked: clampNonNegativeInt(this.data.counters?.shareClicked),
        installPromptShown: clampNonNegativeInt(
          this.data.counters?.installPromptShown
        ),
        codeRedeemed: clampNonNegativeInt(this.data.counters?.codeRedeemed)
      }
    };
  };

  // ============================================
  // Export
  // ============================================
  window.WT_StorageManager = StorageManager;
})();

/* ===== game.js ===== */
// game.js - Quiz engine
// RUN engine + selection 
// Zéro accès DOM, zéro localStorage

(() => {
  "use strict";

  // ============================================
  // Internal sentinels (non-UI)
  // - Centralized to avoid scattered implicit fallbacks.
  // - These are NOT product defaults; they are engine invariants.
  // ============================================
  const MODES = window.WT_ENUMS && window.WT_ENUMS.GAME_MODES;
  if (!MODES || !MODES.RUN || !MODES.PRACTICE || !MODES.BONUS) {
    throw new Error("WT_ENUMS.GAME_MODES missing or incomplete. config.js must load before game.js.");
  }

  const INVALID_MAX_CHANCES = 0;
  const NO_FEEDBACK = "";
  const EMPTY_STATS = Object.freeze({ seenCount: 0, wrongCount: 0, correctCount: 0, lastSeenAt: 0, lastWrongAt: 0, lastCorrectAt: 0 });

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
    return Number.isInteger(n) && n >= 0 ? n : null;
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

    // Content is the source of truth. A stale config value must never silently exclude cards.
    try {
      console.warn("[WT Game] config.game.poolSize is lower than content length; using full content pool.", {
        poolSize,
        contentLength: poolAll.length
      });
    } catch (_) { /* silent */ }

    return poolAll;
  }

  function getCuratedFreeRunOpeningIds(config, byId, statsByItem, runStartNumber) {
    const cfr = (config?.curatedFreeRuns && typeof config.curatedFreeRuns === "object")
      ? config.curatedFreeRuns
      : null;

    if (!cfr || cfr.enabled !== true) return [];

    const runNum = Number(runStartNumber);
    if (!Number.isFinite(runNum) || Math.floor(runNum) !== runNum || runNum < 1) return [];

    const runCount = Number(cfr.runCount);
    if (!Number.isFinite(runCount) || Math.floor(runCount) !== runCount || runCount < 1) return [];
    if (runNum > runCount) return [];

    const byRun = (cfr.cardIdsByRun && typeof cfr.cardIdsByRun === "object")
      ? cfr.cardIdsByRun
      : null;
    if (!byRun) return [];

    const rawIds = Array.isArray(byRun[String(runNum)]) ? byRun[String(runNum)] : [];
    if (!rawIds.length) return [];

    const ids = [];
    const seenIds = new Set();

    for (const rawId of rawIds) {
      const idNum = safeIdNum(rawId);
      if (idNum == null) continue;
      if (seenIds.has(idNum)) continue;
      if (!byId || !byId[String(idNum)]) continue;

      const s = getStats(statsByItem, idNum);
      const seenCount = Number(s.seenCount) || 0;
      if (seenCount > 0) continue;

      seenIds.add(idNum);
      ids.push(idNum);
    }

    return ids;
  }

  function prependOpeningIds(baseIds, openingIds) {
    const base = Array.isArray(baseIds) ? baseIds : [];
    const opening = Array.isArray(openingIds) ? openingIds : [];
    if (!opening.length) return base;

    const openingSet = new Set(opening);
    return opening.concat(base.filter((id) => !openingSet.has(id)));
  }

  // Reorder a deck so no more than `maxRun` consecutive questions share the same
  // correctAnswer (true/false), when the remaining answers allow it. Greedy and
  // stable: the shuffled order is kept except at a cap boundary, where the
  // nearest item with a different answer is pulled forward. The first
  // `lockFirst` positions (curated opening) are never moved, only used to seed
  // the run state so the opening -> shuffle seam is de-clustered too.
  function declusterByAnswer(ids, byId, maxRun, lockFirst) {
    const list = Array.isArray(ids) ? ids.slice() : [];
    const cap = (Number.isFinite(maxRun) && maxRun >= 1) ? Math.floor(maxRun) : 0;
    if (cap <= 0 || list.length <= cap + 1) return list;

    const ansOf = (id) => {
      const it = byId ? byId[String(id)] : null;
      if (it && it.correctAnswer === true) return true;
      if (it && it.correctAnswer === false) return false;
      return null;
    };

    const lock = Math.max(0, Math.min(list.length, Math.floor(Number(lockFirst) || 0)));
    const result = list.slice(0, lock);

    let runVal = null;
    let runLen = 0;
    for (const id of result) {
      const a = ansOf(id);
      if (a === runVal) runLen += 1;
      else { runVal = a; runLen = 1; }
    }

    const pending = list.slice(lock);
    while (pending.length) {
      let pick = 0;
      if (runLen >= cap) {
        const alt = pending.findIndex((id) => ansOf(id) !== runVal);
        if (alt !== -1) pick = alt;
      }
      const chosen = pending.splice(pick, 1)[0];
      result.push(chosen);
      const a = ansOf(chosen);
      if (a === runVal) runLen += 1;
      else { runVal = a; runLen = 1; }
    }
    return result;
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
  // - select ONLY active mistakes where lastWrongAt > lastCorrectAt
  //   (items are excluded once their latest interaction is a correct answer)
  // - order = most recent wrong first (lastWrongAt desc, id asc)
  // - size = exact active-mistake count, optionally capped by config.mistakesOnly.maxItems
  function buildDeck({ items, statsByItem, mistakesOnly, config, runStartNumber }) {
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

        const lw = Number(s.lastWrongAt) || 0;
        const lc = Number(s.lastCorrectAt) || 0;

        // Active mistake: last interaction is wrong
        return lw > lc;
      });

      let mistakesPool = mistakesPoolRaw.slice().sort((a, b) => {
        const ida = safeIdNum(a && a.id) || 0;
        const idb = safeIdNum(b && b.id) || 0;
        const sa = getStats(statsByItem, ida);
        const sb = getStats(statsByItem, idb);
        const ta = Number(sa.lastWrongAt) || 0;
        const tb = Number(sb.lastWrongAt) || 0;
        if (tb !== ta) return tb - ta;
        return ida - idb;
      });

      // Optional cap (config-driven, fail-closed: only applies if valid)
      const rawMax = Number(config?.mistakesOnly?.maxItems);
      const maxItems = (Number.isFinite(rawMax) && rawMax >= 1) ? Math.floor(rawMax) : null;
      if (maxItems != null && mistakesPool.length > maxItems) {
        mistakesPool = mistakesPool.slice(0, maxItems);
      }

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

      const baseIds = unseen.length
        ? shuffleCopy(unseen)
        : shuffleCopy(pool.map((it) => safeIdNum(it && it.id)).filter((n) => n != null));

      const openingIds = getCuratedFreeRunOpeningIds(config, byId, statsByItem, runStartNumber);

      return {
        ids: declusterByAnswer(
          prependOpeningIds(baseIds, openingIds),
          byId,
          3,
          Array.isArray(openingIds) ? openingIds.length : 0
        ),
        byId
      };
    }

    const baseIds = shuffleCopy(pool.map((it) => safeIdNum(it && it.id)).filter((n) => n != null));
    const openingIds = getCuratedFreeRunOpeningIds(config, byId, statsByItem, runStartNumber);

    return {
      ids: declusterByAnswer(
        prependOpeningIds(baseIds, openingIds),
        byId,
        3,
        Array.isArray(openingIds) ? openingIds.length : 0
      ),
      byId
    };
  }

  // BONUS mode:
  // - deck = ONLY items already seen by the player (seenCount > 0)
  // - respects poolSize defensively (without excluding content if config lags behind)
  // - respects secretBonus.minDeckSize
  // - ends when deck ends (no reshuffle, no loop)
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

    const rawMinDeck = Number(config?.secretBonus?.minDeckSize);
    const minDeckSize = (Number.isFinite(rawMinDeck) && rawMinDeck >= 1) ? Math.floor(rawMinDeck) : null;

    if (minDeckSize != null && seenIds.length < minDeckSize) {
      return { ids: [], byId };
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
      if (!payload || typeof payload !== "object") {
        throw new Error("WT_Game.GameEngine.start(): payload object is required.");
      }

      const p = payload;

      if (!Array.isArray(p.items) || p.items.length <= 0) {
        throw new Error("WT_Game.GameEngine.start(): payload.items must be a non-empty array.");
      }
      const items = p.items;

      if (!p.statsByItem || typeof p.statsByItem !== "object") {
        throw new Error("WT_Game.GameEngine.start(): payload.statsByItem is required.");
      }
      const statsByItem = p.statsByItem;

      if (typeof p.getStatsByItem !== "function") {
        throw new Error("WT_Game.GameEngine.start(): payload.getStatsByItem is required.");
      }
      const getStatsByItem = p.getStatsByItem;

      if (!p.config || typeof p.config !== "object") {
        throw new Error('WT_Game.GameEngine.start(): payload.config is required (WT_CONFIG). Wiring error: pass { config } from main/UI when starting a run.');
      }
      const config = p.config;


      // No dynamic stats hook: game.js builds a deck once per start (KISS).

      // Contract v2 (mode-only): mode is the single source of truth.
      // No legacy fallback: p.mistakesOnly is ignored by design.
      const modeRaw = String(p.mode || "").trim().toUpperCase();

      const VALID_MODES = [MODES.RUN, MODES.PRACTICE, MODES.BONUS];

      if (!modeRaw) {
        throw new Error('WT_Game.GameEngine.start(): payload.mode is required ("RUN" | "PRACTICE" | "BONUS").');
      }

      if (!VALID_MODES.includes(modeRaw)) {
        throw new Error(`WT_Game.GameEngine.start(): invalid payload.mode "${modeRaw}".`);
      }

      const requestedMode = modeRaw;

      // Coherence: PRACTICE => mistakesOnly (engine-level authority)
      // KISS: allow PRACTICE only if enabled in config (premium gating remains elsewhere)
      const practiceEnabled = !!(config.mistakesOnly && config.mistakesOnly.enabled);
      const mistakesOnly = (requestedMode === MODES.PRACTICE);

      if (mistakesOnly && !practiceEnabled) {
        throw new Error('WT_Game.GameEngine.start(): PRACTICE requested but config.mistakesOnly.enabled is false.');
      }

      const bonusMode = (requestedMode === MODES.BONUS);
      const effectiveMode = bonusMode ? MODES.BONUS : (mistakesOnly ? MODES.PRACTICE : MODES.RUN);
      // Config-first: WT_CONFIG.game.maxChances
      // V2 strict: NO fallback. If wiring is broken, fail-closed (RUN cannot start).
      const maxChancesCfg = Number(config && config.game && config.game.maxChances);
      const maxChancesValid = (Number.isFinite(maxChancesCfg) && Math.floor(maxChancesCfg) > 0);
      const maxChances = maxChancesValid ? Math.floor(maxChancesCfg) : INVALID_MAX_CHANCES;


      // maxChances is required for runnable modes.
      if (!maxChancesValid) {
        throw new Error("WT_Game.GameEngine.start(): config.game.maxChances must be a positive integer.");
      }

      const runStartNumberRaw = Number(p.runStartNumber);
      const runStartNumber = (Number.isFinite(runStartNumberRaw) && Math.floor(runStartNumberRaw) === runStartNumberRaw && runStartNumberRaw >= 1)
        ? runStartNumberRaw
        : null;

      const deck = bonusMode
        ? buildSeenDeck({ items, statsByItem, config })
        : buildDeck({ items, statsByItem, mistakesOnly, config, runStartNumber });

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
        maxChances: (effectiveMode === MODES.PRACTICE) ? null : maxChances,
        chancesLeft: (effectiveMode === MODES.PRACTICE) ? null : maxChances,

        // Single score across all modes (KISS)
        scoreFP: 0,

        // Mistakes made during this run (END screen)
        runMistakeIds: [],

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
      const isBonus = (this.run.mode === MODES.BONUS);

      // Contract: items-served signal is derived (no mutable counter).
      // - counts the currently displayed item as "served"
      // - null for non-BONUS modes (to avoid implying mechanics elsewhere)
      const itemsServed = isBonus
        ? (ids.length > 0 ? Math.min(ids.length, Math.max(0, idx) + 1) : 0)
        : null;

      const poolReshuffled = (this.run.mode === MODES.RUN && this.run.justReshuffled === true);

      // one-shot: consume the flag as soon as UI reads state
      if (poolReshuffled) {
        this.run.justReshuffled = false;
      }

      return {
        mode: this.run.mode,
        done: !!this.run.done,
        scoreFP: Number.isFinite(this.run.scoreFP) ? Number(this.run.scoreFP) : 0,
        chancesLeft: (this.run.chancesLeft == null) ? null : Number(this.run.chancesLeft || 0),
        maxChances: (this.run.maxChances == null) ? null : Number(this.run.maxChances),
        idx,
        itemsServed,

        runMistakesCount: Array.isArray(this.run.runMistakeIds)
          ? this.run.runMistakeIds.length
          : 0,

        deckSize: Array.isArray(this.run.ids)
          ? this.run.ids.length
          : 0,

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
        if (this.run.chancesLeft != null) {
          const left = Number(this.run.chancesLeft || 0);
          this.run.chancesLeft = Math.max(0, left - 1);
        }

        // Track mistake for this run (END screen)
        try {
          if (
            idNum != null &&
            Array.isArray(this.run.runMistakeIds) &&
            !this.run.runMistakeIds.includes(idNum)
          ) {
            this.run.runMistakeIds.push(idNum);
          }
        } catch (_) { /* silent */ }

        this.run.last = {
          itemId: idNum,
          choice: (choiceBool === true),
          correctAnswer: correct,
          isCorrect: false,
          feedbackLine: (typeof item.explanationShort === "string")
            ? item.explanationShort
            : NO_FEEDBACK
        };

        if (this.run.chancesLeft != null && Number(this.run.chancesLeft || 0) <= 0) {
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
      } else {
        // Track mistake for this run (END screen)
        try {
          if (idNum != null && Array.isArray(this.run.runMistakeIds) && !this.run.runMistakeIds.includes(idNum)) this.run.runMistakeIds.push(idNum);
        } catch (_) { /* silent */ }

        if (this.run.chancesLeft != null) {
          // PRACTICE has chancesLeft === null → no chance consumed
          const left = Number(this.run.chancesLeft || 0);
          this.run.chancesLeft = Math.max(0, left - 1);
        }
      }

      // feedback spécifique au mode
      const feedbackLine = (this.run.mode === MODES.BONUS) ? NO_FEEDBACK
        : (typeof item.explanationShort === "string"
          ? item.explanationShort
          : NO_FEEDBACK);

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
      if (this.run.mode === MODES.PRACTICE) {
        this.run.done = true;
        return;
      }

      // BONUS ends when deck ends (no reshuffle, no loop).
      if (this.run.mode === MODES.BONUS) {
        this.run.done = true;
        return;
      }

      // RUN: rebuild a fresh deck at the end (reshuffle)
      if (this.run.mode === MODES.RUN) {
        if (typeof this.run.getStatsByItem !== "function") {
          throw new Error("WT_Game.GameEngine._advanceAfterAnswer(): getStatsByItem is missing.");
        }

        const freshStats = this.run.getStatsByItem();

        if (!freshStats || typeof freshStats !== "object") {
          throw new Error("WT_Game.GameEngine._advanceAfterAnswer(): getStatsByItem() must return an object.");
        }

        this.run.statsByItem = freshStats;

        const deck = buildDeck({
          items: this.run.items,
          statsByItem: this.run.statsByItem,
          mistakesOnly: false,
          config: this.run.config,
          runStartNumber: null
        });
        this.run.byId = deck.byId || this.run.byId || {};
        let nextIds = Array.isArray(deck.ids) ? deck.ids.slice() : [];
        const lastId = safeIdNum(this.run.last?.itemId);
        if (lastId != null && nextIds.length > 1) {
          nextIds = nextIds.filter((id) => id !== lastId);
          nextIds.push(lastId);
        }
        this.run.ids = nextIds;
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

/* ===== ui-screen-paywall.js ===== */
// ui-screen-paywall.js
// Extracted from ui.js to keep PAYWALL rendering isolated from the core UI shell.

(() => {
  "use strict";

  function renderPaywallSection(title, bodyHtml, extraClass, escapeHtml) {
    if (!title && !bodyHtml) return "";
    return `
      <section class="${String(extraClass || "").trim()}">
        ${title ? `<div class="wt-meta wt-meta--strong wt-paywall-section-title">${escapeHtml(title)}</div>` : ``}
        ${bodyHtml || ``}
      </section>
    `;
  }

  function renderPaywallQuoteCard(title, quotes, escapeHtml) {
    const safeTitle = String(title || "").trim();
    const safeQuotes = Array.isArray(quotes) ? quotes : [];
    if (!safeTitle && !safeQuotes.length) return "";

    const quotesHtml = safeQuotes
      .map((q) => {
        const qt = String(q?.quote || "").trim();
        const au = String(q?.author || "").trim();
        if (!qt) return "";
        const parts = qt.split(/\n+/).map((part) => String(part || "").trim()).filter(Boolean);
        const maybeStars = parts.length > 1 && /^[★☆\s]+$/.test(parts[0]) ? parts.shift() : "";
        const body = parts.join(" ").trim();
        if (!body && !maybeStars) return "";
        return `
          <div class="wt-quote wt-paywall-quote">
            ${maybeStars ? `<div class="wt-quote__stars wt-paywall-stars" aria-hidden="true">${escapeHtml(maybeStars)}</div>` : ``}
            ${body ? `<div class="wt-copy-quote">&ldquo;${escapeHtml(body)}&rdquo;</div>` : ``}
            ${au ? `<div class="wt-muted wt-quote__author wt-paywall-quote-author">${escapeHtml(au)}</div>` : ``}
          </div>
        `;
      })
      .filter(Boolean)
      .join("");

    return `
      <div class="wt-box">
        ${safeTitle ? `<div class="wt-meta">${escapeHtml(safeTitle)}</div>` : ``}
        ${quotesHtml}
      </div>
    `;
  }

  function render(ui, helpers) {
    const {
      escapeHtml,
      fillTemplate,
      formatCents,
      mmss,
      renderTextWithStrong,
      renderBrandingRow,
      clampInt,
      isPremiumNow
    } = helpers || {};

    if (
      typeof escapeHtml !== "function" ||
      typeof fillTemplate !== "function" ||
      typeof formatCents !== "function" ||
      typeof mmss !== "function" ||
      typeof renderTextWithStrong !== "function" ||
      typeof renderBrandingRow !== "function" ||
      typeof clampInt !== "function" ||
      typeof isPremiumNow !== "function"
    ) {
      throw new Error("WT_UI_Paywall helpers missing");
    }

    const w = ui.wording || {};
    const pay = w.paywall || {};
    const cfg = ui.config || {};
    const premium = isPremiumNow(ui.storage);

    if (premium) {
      const playLabel = String(w.landing?.ctaPlay || "").trim();
      const premiumHeadline = String(pay.headline || "").trim();

      return `
      ${renderBrandingRow(cfg, true)}
          <div class="wt-card wt-card--hero">
      <h1 class="wt-h1">${escapeHtml(premiumHeadline)}</h1>
        <p class="wt-muted">${escapeHtml(String(w.howto?.alreadyPremium || "").trim())}</p>
        <div class="wt-actions">
          <button class="wt-btn wt-btn--primary" data-action="start-run" aria-label="${escapeHtml(playLabel)}">
            ${escapeHtml(playLabel)}
          </button>
          <button class="wt-btn wt-btn--secondary" data-action="go-home">${escapeHtml(String(w.system?.home || "").trim())}</button>
        </div>
      </div>
    `;
    }

    let ep = null;
    if (ui.storage && typeof ui.storage.getEarlyPriceState === "function") {
      try { ep = ui.storage.getEarlyPriceState() || null; } catch (_) { ep = null; }
    }

    const currency = String(cfg.currency || "").trim();
    const early = formatCents(cfg.earlyPriceCents, currency);
    const standard = formatCents(cfg.standardPriceCents, currency);

    const isEarly = !!(ep && String(ep.phase || "").toUpperCase() === "EARLY" && Number(ep.remainingMs || 0) > 0);
    const remainingMs = isEarly ? Number(ep?.remainingMs || 0) : 0;
    const timer = (isEarly && Number.isFinite(remainingMs)) ? mmss(remainingMs) : "";

    const urgencyCfg = (cfg?.ui?.paywallUrgency && typeof cfg.ui.paywallUrgency === "object") ? cfg.ui.paywallUrgency : null;
    const urgencyEnabled = (urgencyCfg && urgencyCfg.enabled === true);
    const pulseBelowMs = urgencyCfg ? Number(urgencyCfg.pulseBelowMs) : NaN;

    const urgencyPulse =
      urgencyEnabled &&
      isEarly &&
      Number.isFinite(pulseBelowMs) &&
      pulseBelowMs > 0 &&
      Number.isFinite(remainingMs) &&
      remainingMs > 0 &&
      remainingMs <= pulseBelowMs;

    let runsBalance = NaN;
    try {
      if (ui.storage && typeof ui.storage.getRunsBalance === "function") {
        runsBalance = Number(ui.storage.getRunsBalance());
      }
    } catch (_) { runsBalance = NaN; }

    const isLastFree =
      (Number.isFinite(runsBalance) && runsBalance <= 0) ||
      (ui._runtime && ui._runtime.runType === "LAST_FREE");

    const headline =
      isLastFree && pay.headlineLastFree
        ? String(pay.headlineLastFree).trim()
        : String(pay.headline || "").trim();

    const valueTitle = String(pay.valueTitle || "").trim();
    const trustTitle = String(pay.trustTitle || "").trim();
    const compactTitle = String(pay.compactTitle || valueTitle || "").trim();
    const payOnceLine = String(pay.payOnceLine || "").trim();

    const valueBullets = Array.isArray(pay.valueBullets) ? pay.valueBullets : [];
    const trustLine = String(pay.trustLine || "").trim();
    const trustBullets = Array.isArray(pay.trustBullets) ? pay.trustBullets : [];
    const compactBullets = Array.isArray(pay.compactBullets) ? pay.compactBullets : [];
    const notNowLabel = String(w.system?.notNow || "").trim();
    let waitlistOnPaywall = false;
    try {
      if (
        ui.storage &&
        typeof ui.storage.shouldShowWaitlistOnPaywall === "function"
      ) {
        waitlistOnPaywall = ui.storage.shouldShowWaitlistOnPaywall() === true;
      }
    } catch (_) { waitlistOnPaywall = false; }
    const waitlistCta = String(
      w.postCompletion?.waitlistCta || w.waitlist?.ctaLabel || ""
    ).trim();
    const redeemLabel = String(pay.alreadyHaveCode || "").trim();

    let seen = NaN;
    try {
      if (ui.storage && typeof ui.storage.getSeenItemIds === "function") {
        const ids = ui.storage.getSeenItemIds();
        if (Array.isArray(ids)) seen = Number(ids.length);
      }
    } catch (_) { /* ignore */ }

    const poolSize = Number(cfg?.game?.poolSize);
    const remaining =
      (Number.isFinite(seen) && Number.isFinite(poolSize))
        ? Math.max(0, poolSize - seen)
        : NaN;

    const progressLine1Tpl = String(pay.progressLine1 || "").trim();
    const progressLine2Tpl = String(pay.progressLine2 || "").trim();
    const lastRunScore = clampInt(Number(ui._runtime?.lastRun?.scoreFP), 0, 99999);
    let payRunCount = 0;

    try {
      let starts = 0;
      let completes = 0;

      if (ui.storage && typeof ui.storage.getRunsUsed === "function") {
        starts = clampInt(Number(ui.storage.getRunsUsed()), 0, 999);
      }
      if (ui.storage && typeof ui.storage.getCounters === "function") {
        const c = ui.storage.getCounters() || {};
        completes = clampInt(Number(c.runCompletes), 0, 999);
      }

      payRunCount = Math.max(starts, completes);
    } catch (_) { payRunCount = 0; }

    const progressLine1 =
      (progressLine1Tpl && Number.isFinite(payRunCount))
        ? fillTemplate(progressLine1Tpl, { seen, poolSize, remaining, score: lastRunScore, runs: payRunCount })
        : "";

    const progressLine2Raw =
      (progressLine2Tpl && Number.isFinite(remaining))
        ? fillTemplate(progressLine2Tpl, { remaining })
        : "";

    const progressLine2 = (() => {
      const t = String(progressLine2Raw || "").trim();
      if (!t) return "";
      // Defensive de-dup:
      // some wording variants or copy assembly paths can accidentally produce the same
      // line twice separated by newlines. Collapse only the exact duplicated case here
      // instead of letting the PAYWALL hero render a visually broken repeated sentence.
      const parts = t.split(/\n+/).map((s) => s.trim()).filter(Boolean);
      if (parts.length >= 2 && parts.every((p) => p === parts[0])) return parts[0];
      return t;
    })();

    const ctaEarly = String(pay.ctaEarly || "").trim();
    const ctaStandard = String(pay.ctaStandard || "").trim();
    const primaryCta = isEarly ? ctaEarly : ctaStandard;

    const savingsTpl = String(pay.savingsLineTemplate || "").trim();
    const earlyCents = Number(cfg.earlyPriceCents);
    const standardCents = Number(cfg.standardPriceCents);
    const saveCents =
      (Number.isFinite(earlyCents) && Number.isFinite(standardCents))
        ? Math.round(standardCents - earlyCents)
        : NaN;

    const saveAmount =
      (Number.isFinite(saveCents) && saveCents > 0)
        ? formatCents(saveCents, currency)
        : "";

    const savingsLine =
      (isEarly && savingsTpl && saveAmount)
        ? fillTemplate(savingsTpl, { saveAmount, earlyPrice: early, standardPrice: standard })
        : "";

    const checkoutNote = String(pay.checkoutNote || "").trim();
    const deviceNote = String(pay.deviceNote || "").trim();

    const renderBullets = (arr, muted) => {
      if (!arr.length) return "";
      const cls = `wt-list${muted ? " wt-muted" : ""}`;
      const items = arr
        .map((x) => String(x || "").trim())
        .filter(Boolean)
        .map((x) => `<li>${renderTextWithStrong(x)}</li>`)
        .join("");
      return `<ul class="${cls}">${items}</ul>`;
    };

    const socialProofTitle = String(pay.socialProofTitle || "").trim();
    const socialProofQuotes = Array.isArray(pay.socialProofQuotes) ? pay.socialProofQuotes : [];

    const renderUrgencyBanner = () => {
      if (!isEarly || !urgencyEnabled) return "";

      const label = String(pay.timerLabel || "").trim();
      if (!label) return "";

      const cls = `wt-box wt-box--tinted wt-inline-stat`;
      return `
        <div class="${cls} wt-paywall-urgency" role="status" aria-live="polite">
          <div class="wt-paywall-urgency__label wt-inline-stat__label">${escapeHtml(label)}</div>
          <div class="wt-paywall-urgency__timer wt-inline-stat__value${urgencyPulse ? " wt-pulse" : ""}">${escapeHtml(timer)}</div>
        </div>
      `;
    };

    const earlyBadge = String(pay.earlyBadgeLabel || "").trim();

    const renderPriceBlock = () => {
      const wrapClass = `wt-box${isEarly ? " wt-box--strike" : ""}`;

      const post1Tpl = String(pay.postEarlyLine1 || "").trim();
      const post2Tpl = String(pay.postEarlyLine2 || "").trim();

      const post1 = post1Tpl ? fillTemplate(post1Tpl, { standardPrice: standard }) : "";
      const post2 = post2Tpl ? fillTemplate(post2Tpl, { standardPrice: standard }) : "";

      if (isEarly) {
        return `
      <div class="${wrapClass}">
        <div class="wt-row wt-row--spaced wt-row--top">
          <div>
            <p class="wt-meta wt-paywall-price-value">
              ${escapeHtml(earlyBadge || String(pay.earlyLabel || "").trim())}
            </p>
          </div>
          <div class="wt-paywall-price-side">
            <p class="wt-h2 wt-paywall-price-value">${escapeHtml(early)}</p>
            <p class="wt-muted wt-paywall-price-note">${escapeHtml(standard)}</p>
          </div>
        </div>
      </div>
    `;
      }

      return `
      <div class="${wrapClass}">
        <div class="wt-row wt-row--spaced wt-row--top">
          <div>
            <p class="wt-meta wt-paywall-price-value">${escapeHtml(String(pay.standardLabel || "").trim())}</p>
            ${post1 ? `<p class="wt-muted wt-paywall-price-note">${escapeHtml(post1)}</p>` : ``}
            ${post2 ? `<p class="wt-muted wt-paywall-price-note">${escapeHtml(post2)}</p>` : ``}
          </div>
          <div class="wt-paywall-price-side">
            <p class="wt-h2 wt-paywall-price-value">${escapeHtml(standard)}</p>
          </div>
        </div>
      </div>
    `;
    };

    const hasCompactSection = (compactTitle || compactBullets.length);
    const hasValueSection = (valueTitle || valueBullets.length);
    const hasTrustSection = (trustTitle || trustLine || trustBullets.length);
    const compactSectionHtml = hasCompactSection
      ? renderPaywallSection(
        compactTitle,
        compactBullets.length ? `<div class="wt-paywall-list-wrap wt-list-copy">${renderBullets(compactBullets, false)}</div>` : ``,
        "wt-paywall-section",
        escapeHtml
      )
      : "";
    const valueSectionHtml = (!hasCompactSection && hasValueSection)
      ? renderPaywallSection(
        valueTitle,
        valueBullets.length ? `<div class="wt-paywall-list-wrap wt-list-copy">${renderBullets(valueBullets, false)}</div>` : ``,
        "wt-paywall-section",
        escapeHtml
      )
      : "";
    const trustSectionHtml = (!hasCompactSection && hasTrustSection)
      ? renderPaywallSection(
        trustLine ? "" : trustTitle,
        `
          ${trustLine ? `<div class="wt-meta wt-meta--strong wt-paywall-trust-line wt-note">${renderTextWithStrong(trustLine)}</div>` : ``}
          ${trustBullets.length ? `<div class="wt-paywall-list-wrap wt-list-copy">${renderBullets(trustBullets, true)}</div>` : ``}
        `,
        "wt-paywall-section",
        escapeHtml
      )
      : "";
    const socialProofHtml = renderPaywallQuoteCard(socialProofTitle, socialProofQuotes, escapeHtml);

    return `
    <div class="wt-card wt-card--hero wt-card--paywall">
      <div class="wt-paywall-hero${isLastFree ? " wt-paywall-hero--lastfree" : ""}">
        ${renderBrandingRow(cfg, true)}
        <h1 class="wt-h1">${escapeHtml(headline)}</h1>
        ${progressLine1 ? `<p class="wt-muted wt-copy-lead">${escapeHtml(progressLine1)}</p>` : ``}
        ${progressLine2 ? `<p class="wt-muted wt-copy-follow">${escapeHtml(progressLine2)}</p>` : ``}
      </div>

      ${payOnceLine ? `<div class="wt-meta wt-meta--strong wt-copy-emphasis">${escapeHtml(payOnceLine)}</div>` : ``}

      ${renderUrgencyBanner()}

      ${renderPriceBlock()}

      ${savingsLine ? `<p class="wt-muted wt-paywall-savings">${escapeHtml(savingsLine)}</p>` : ``}

      <div class="wt-actions wt-actions--single">
        ${primaryCta ? `<button
          class="wt-btn wt-btn--primary"
          data-action="${isEarly ? "checkout-early" : "checkout-standard"}"
        >${escapeHtml(primaryCta)}</button>` : ``}
      </div>

      ${notNowLabel ? `<p class="wt-paywall-linkline"><button class="wt-text-action" data-action="go-home">${escapeHtml(notNowLabel)}</button></p>` : ``}
      ${(waitlistOnPaywall && waitlistCta) ? `<p class="wt-paywall-linkline"><button class="wt-text-action" data-action="open-waitlist">${escapeHtml(waitlistCta)}</button></p>` : ``}

      ${redeemLabel ? `<p class="wt-muted wt-paywall-redeem"><button class="wt-btn wt-btn--ghost" data-action="redeem-code">${escapeHtml(redeemLabel)}</button></p>` : ``}

      ${checkoutNote ? `<p class="wt-muted wt-note wt-note--checkout">${escapeHtml(checkoutNote)}</p>` : ``}
      ${deviceNote ? `<p class="wt-muted wt-note wt-note--device">${escapeHtml(deviceNote)}</p>` : ``}

      ${compactSectionHtml}

      ${valueSectionHtml}

      ${(!hasCompactSection && hasValueSection && hasTrustSection) ? `<div class="wt-divider"></div>` : ``}

      ${trustSectionHtml}

      ${socialProofHtml}
    </div>
    `;
  }

  window.WT_UI_Paywall = {
    render
  };
})();

/* ===== ui-screen-end.js ===== */
// ui-screen-end.js
// Extracted from ui.js to keep END rendering isolated from the core UI shell.

(() => {
  "use strict";

  function render(ui, helpers) {
    const {
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
    } = helpers || {};

    if (
      typeof buildEndModeCopy !== "function" ||
      typeof buildEndCopyHtml !== "function" ||
      typeof buildEndMistakesRecap !== "function" ||
      typeof buildEndMicroLines !== "function" ||
      typeof buildEndShareBlock !== "function" ||
      typeof buildEndActionsHtml !== "function" ||
      typeof getRunTierInfo !== "function" ||
      typeof getDailyChallengeModel !== "function" ||
      typeof getAppLevelModel !== "function" ||
      typeof renderBrandingRow !== "function" ||
      typeof renderIcon !== "function" ||
      typeof hasSolvedSecretChestHint !== "function" ||
      typeof isPremiumNow !== "function" ||
      typeof clampInt !== "function" ||
      typeof fillTemplate !== "function" ||
      typeof escapeHtml !== "function" ||
      !MODES
    ) {
      throw new Error("WT_UI_End helpers missing");
    }

    const w = ui.wording || {};
    const uiW = w.ui || {};
    const end = w.end || {};
    const practiceW = w.practice || {};
    const bonusW = w.secretBonus || {};
    const cfg = ui.config || {};
    const premium = isPremiumNow(ui.storage);

    const lastRun = ui._runtime?.lastRun || {};
    const mode = String(lastRun.mode || ui._runtime?.runMode || "").trim();
    const hasKnownMode = !!mode;
    const isRun = (mode === MODES.RUN);
    const isPractice = (mode === MODES.PRACTICE);
    const isBonus = (mode === MODES.BONUS);
    const newBest = (isRun || isBonus) && !!lastRun.newBest;

    const scoreFP = clampInt(lastRun.scoreFP, 0, 99999);
    const maxChances = clampInt(lastRun.maxChances || cfg?.game?.maxChances, 0, 99);
    const totalPresented = Array.isArray(ui._runtime?.runItemIds) ? ui._runtime.runItemIds.length : 0;
    const poolSize = clampInt(cfg?.game?.poolSize, 0, 99999);

    let seen = null;
    if (ui.storage && typeof ui.storage.getSeenItemIds === "function") {
      try {
        const ids = ui.storage.getSeenItemIds();
        if (Array.isArray(ids)) seen = clampInt(ids.length, 0, 99999);
      } catch (_) { /* silent */ }
    }

    const vars = {
      score: scoreFP,
      total: clampInt(totalPresented, 0, 99999),
      best: clampInt(lastRun.bestScoreFP, 0, 99999),
      fpLong: "",
      fpShort: "",
      maxChances,
      poolSize,
      seen: (seen == null) ? "" : seen
    };

    const scoreLineTpl =
      isBonus ? String(bonusW.scoreLine || "").trim()
        : isPractice ? (String(end.scoreLine || "").trim() || String(practiceW.scoreLine || "").trim())
          : (isRun && !!lastRun.poolCompleteCelebration) ? String(end.poolCompleteScoreLine || "").trim()
            : String(end.scoreLine || "").trim();

    const newBestTpl = isBonus
      ? String(bonusW.newBest || "").trim()
      : String(end.newBest || "").trim();

    const bonusStatsLine = (() => {
      if (!isBonus) return "";

      const shown = clampInt(totalPresented, 0, 99999);
      if (shown <= 0) return "";

      const cleared = clampInt(scoreFP, 0, shown);
      const count = clampInt(seen, 0, 99999);
      const oneTpl = String(bonusW.endStatsLineOne || "").trim();
      const manyTpl = String(bonusW.endStatsLine || "").trim();
      const tpl = (count === 1 && oneTpl) ? oneTpl : manyTpl;
      if (!tpl) return "";

      return fillTemplate(tpl, {
        cleared: String(cleared),
        shown: String(shown),
        count: String(count)
      });
    })();

    const modeCopy = buildEndModeCopy({
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
      storage: ui.storage,
      runtime: ui._runtime
    });

    const {
      endLineTpl,
      bonusLevel,
      practiceRepeatTierKey,
      practiceStatsLineTpl,
      practiceRepeatNoteTpl,
      runVerdictKey,
      runIdentityTpl,
      runPoolCompleteLine2Tpl,
      bonusDeckTier,
      bonusRecoLine
    } = modeCopy;

    let backlog = 0;
    try {
      if (ui.storage && typeof ui.storage.getActiveMistakesCount === "function") {
        backlog = Number(ui.storage.getActiveMistakesCount() || 0);
      }
    } catch (_) { backlog = 0; }

    vars.backlog = clampInt(backlog, 0, 99999);

    let canPractice = isRun && !!(cfg.mistakesOnly && cfg.mistakesOnly.enabled);
    if (canPractice) {
      const minWrong = clampInt(Number(cfg?.mistakesOnly?.minWrongItemsToShowToggle), 1, 9999);
      const hasEnoughMistakes = clampInt(vars.backlog, 0, 99999) >= minWrong;

      let practiceRunsAvailable = true;
      if (!premium && ui.storage && typeof ui.storage.getPracticeRunsRemaining === "function") {
        try {
          practiceRunsAvailable = Number(ui.storage.getPracticeRunsRemaining()) > 0;
        } catch (_) {
          practiceRunsAvailable = false;
        }
      }

      canPractice = hasEnoughMistakes && practiceRunsAvailable;
    }

    const runPracticePrimaryMinRaw = Number(cfg?.routing?.practicePrimaryMinWrong);
    const runPracticePrimaryMin =
      (Number.isFinite(runPracticePrimaryMinRaw) && runPracticePrimaryMinRaw >= 1)
        ? Math.floor(runPracticePrimaryMinRaw)
        : null;
    const runShouldPromotePractice =
      isRun &&
      runPracticePrimaryMin != null &&
      canPractice &&
      vars.backlog >= runPracticePrimaryMin;
    const runBonusEnabled = (cfg?.secretBonus?.enabled === true);
    const runEliteOrMore = (runVerdictKey === "elite" || runVerdictKey === "legendary");
    const runBonusPrimaryLabel = String(end.bonusCtaPrimary || "").trim();
    const runBonusBacklogOk = (runPracticePrimaryMin != null) ? (vars.backlog < runPracticePrimaryMin) : true;
    const runShouldPromoteBonus =
      isRun &&
      !runShouldPromotePractice &&
      !!runBonusEnabled &&
      runEliteOrMore &&
      runBonusBacklogOk &&
      !!runBonusPrimaryLabel;

    if (isRun && !Number.isFinite(Number(vars.remaining))) {
      vars.remaining = clampInt(poolSize - totalPresented, 0, poolSize);
    }
    const scoreLine = scoreLineTpl ? fillTemplate(scoreLineTpl, vars) : "";
    const scoreHeading = String(uiW.scoreLabel || "").trim();
    const newBestLine = newBestTpl ? fillTemplate(newBestTpl, vars) : "";
    const endLine = endLineTpl ? fillTemplate(endLineTpl, vars) : "";
    const practiceCelebrateLine = String(practiceW.celebrationAllCleared || practiceW.endLineAllFixed || "").trim();
    const bonusCelebrateLine = String(bonusW.celebrationPerfect || "").trim();
    const runStatsLine = (() => {
      if (!isRun || !!lastRun.poolCompleteCelebration) return "";

      const tpl = String(end.endStatsLine || "").trim();
      if (!tpl) return "";

      return fillTemplate(tpl, vars);
    })();

    const bonusDecisionLine = isBonus ? bonusRecoLine : "";

    const recordUntil = Number(ui._runtime?.endRecordMomentUntil || 0);
    const practiceAllCleared = isPractice && clampInt(vars.remaining, 0, 99999) === 0;
    const bonusPerfect = isBonus && bonusLevel === "perfect";
    const celebrationLabel =
      newBest ? newBestLine
        : practiceAllCleared ? practiceCelebrateLine
          : bonusPerfect ? bonusCelebrateLine
            : "";
    const recordActive = (!!celebrationLabel) ? (Date.now() < recordUntil) : false;
    const levelModel = getAppLevelModel(ui.storage, cfg, w);
    const levelProgress = (lastRun && typeof lastRun.levelProgress === "object") ? lastRun.levelProgress : null;
    const levelPreview = levelModel.preview || { unlockedLevel: 0, justUnlocked: false };
    const maxLevel = clampInt(levelModel.maxLevel || 0, 0, 20);
    const unlockedLevel = levelPreview.justUnlocked
      ? clampInt(levelPreview.unlockedLevel, 0, maxLevel)
      : clampInt(levelProgress?.unlockedLevel, 0, maxLevel);
    const unlockDef = levelModel.defs.find((item) => item.level === unlockedLevel) || null;
    const levelDetailsAria = String(levelModel.levelsW?.openDetailsAria || "").trim();
    const levelUnlockHtml = ((levelPreview.justUnlocked || levelProgress?.justUnlocked) && unlockDef)
      ? (() => {
        const reachedLine = fillTemplate(
          String(levelModel.levelsW?.reachedTemplate || "").trim(),
          { label: unlockDef.label }
        ).trim();
        return `
        <div class="wt-level-unlock">
          <p class="wt-level-unlock__kicker">${escapeHtml(String(levelModel.levelsW?.unlockKicker || "").trim())}</p>
          <div class="wt-level-unlock__card">
            <button type="button" class="wt-level-chip" data-action="open-level-progress" aria-label="${escapeHtml(levelDetailsAria)}">
              <span class="wt-level-chip__dot" aria-hidden="true"></span>
              <span>${escapeHtml(unlockDef.label)}</span>
            </button>
            ${reachedLine ? `<p class="wt-level-unlock__line">${escapeHtml(reachedLine)}</p>` : ``}
          </div>
        </div>
      `;
      })()
      : "";

    const displayScoreLine = scoreLine;
    const displayScoreHeading = (scoreHeading && scoreFP >= 0) ? scoreHeading : "";
    const displayScoreValue = (scoreHeading && scoreFP >= 0) ? String(scoreFP) : "";

    const pbLineTpl = String(end.personalBestLine || "").trim();
    const nearBestTpl = String(end.nearBestLine || "").trim();
    const pbPremiumHintTpl = String(end.personalBestPremiumHint || "").trim();
    const beatBestLineTpl = String(end.beatBestLine || "").trim();
    const beatBestFirstLineTpl = String(end.beatBestFirstLine || "").trim();
    const tierLineTpl = String(end.scoreTierLine || "").trim();
    const tierNextLineTpl = String(end.scoreTierNextLine || "").trim();
    const dailyWonTpl = String(end.dailyChallengeCleared || "").trim();
    const dailyWonFreeTpl = String(end.dailyChallengeClearedFreeRun || "").trim();
    const dailyTicketWonTpl = String(end.dailyChallengeTicketWon || "").trim();
    const dailyTicketCappedTpl = String(end.dailyChallengeTicketCapped || "").trim();
    const dailyMissTpl = String(end.dailyChallengeMiss || "").trim();
    const dailyMissLastFreeTpl = String(end.dailyChallengeMissLastFree || "").trim();

    let pbLine = "";
    if (isRun && premium) {
      const best = clampInt(lastRun.bestScoreFP, 0, 99999);
      const delta = clampInt(best - scoreFP, 0, 99999);

      if (!newBest && nearBestTpl && delta > 0) {
        pbLine = fillTemplate(nearBestTpl, { delta: String(delta), fpLong: String(vars.fpLong || "").trim() });
      } else if (!newBest && pbLineTpl) {
        pbLine = fillTemplate(pbLineTpl, vars);
      }
    }

    const pbPremiumHint = (isRun && !premium && pbPremiumHintTpl) ? String(pbPremiumHintTpl).trim() : "";
    const streakLine = "";

    const tierInfo = isRun ? getRunTierInfo(cfg, w, clampInt(lastRun.bestScoreFP, 0, 99999)) : null;
    const tierLine = (isRun && tierInfo?.currentLabel && tierLineTpl)
      ? fillTemplate(tierLineTpl, { tier: tierInfo.currentLabel })
      : "";
    const tierNextLine = (isRun && tierInfo?.nextTarget != null && tierInfo?.nextLabel && tierNextLineTpl)
      ? fillTemplate(tierNextLineTpl, {
        nextTier: tierInfo.nextLabel,
        nextTarget: String(tierInfo.nextTarget)
      })
      : "";

    const dailyModel = isRun ? getDailyChallengeModel(cfg, w, clampInt(lastRun.bestScoreFP, 0, 99999), ui.storage) : null;
    const isLastFreeRun = String(lastRun.runType || ui._runtime?.runType || "").trim() === "LAST_FREE";
    const dailyTargetScore = clampInt(lastRun.dailyTargetScore, 0, 99999) || clampInt(dailyModel?.targetScore, 0, 99999);
    const clearedDailyChallenge = !!(isRun && lastRun.dailyChallengeCompleted === true);
    const dailyTicketAtCap = !!(isRun && lastRun.dailyTicketAtCap === true);
    const dailyChallengeNeedsReplayReward = !!(isRun && dailyModel?.rewardPendingReplay === true);
    const clearedFreePreviewDaily = !!(
      isRun &&
      String(lastRun.runType || "").trim() === "FREE" &&
      !premium &&
      clearedDailyChallenge &&
      lastRun.dailyTicketAwarded !== true
    );
    const dailyChallengeIncomplete = !!(isRun && dailyModel && !dailyModel.completedToday);
    const missedLastFreeDaily = !!(
      isRun &&
      isLastFreeRun &&
      !clearedDailyChallenge &&
      lastRun.dailyTicketAwarded !== true
    );
    const dailyChallengeLine = (isRun && dailyModel)
      ? fillTemplate(
        (lastRun.dailyTicketAwarded === true && dailyTicketWonTpl)
          ? dailyTicketWonTpl
          : (dailyTicketAtCap && dailyTicketCappedTpl)
            ? dailyTicketCappedTpl
          : (clearedFreePreviewDaily && dailyWonFreeTpl)
            ? dailyWonFreeTpl
            : (clearedDailyChallenge ? dailyWonTpl : (missedLastFreeDaily && dailyMissLastFreeTpl) ? dailyMissLastFreeTpl : dailyMissTpl),
        {
          targetScore: String(dailyTargetScore),
          tickets: String(clampInt(lastRun.dailyTicketBalance, 0, 999)),
          cap: String(clampInt(ui.storage?.getRapidFireTicketCap?.(), 0, 999))
        }
      )
      : "";

    let beatBestLine = "";
    if (isRun && !newBest) {
      const best = clampInt(lastRun.bestScoreFP, 0, 99999);
      if (best > 0 && (!premium || !pbLine) && beatBestLineTpl) {
        beatBestLine = fillTemplate(beatBestLineTpl, { target: String(best + 1), fpLong: String(vars.fpLong || "").trim() });
      } else if (best <= 0 && beatBestFirstLineTpl) {
        beatBestLine = beatBestFirstLineTpl;
      }
    }

    let freeRunMessage = "";

    const msgTpl = isRun ? String(w.end?.freeRunLeft || "").trim() : "";

    const remainingRaw = (ui.storage && typeof ui.storage.getRunsBalance === "function")
      ? ui.storage.getRunsBalance()
      : null;

    const remaining = Number(remainingRaw);

    if (isRun && msgTpl && Number.isFinite(remaining) && remaining > 0) {
      freeRunMessage = fillTemplate(msgTpl, {
        remaining: String(clampInt(remaining, 0, 999)),
        pluralS: remaining > 1 ? "s" : ""
      });
    }

    const mistakesRecapHtml = buildEndMistakesRecap({
      isRun,
      isPractice,
      isBonus,
      lastRun,
      maxChances,
      bonusW,
      practiceW,
      end,
      runtime: ui._runtime,
      ui: uiW,
      cfg,
      vars
    });

    const shareEnabled = !!(cfg.share && cfg.share.enabled);
    const runsExhausted = (isRun && !premium && Number.isFinite(remaining) && remaining <= 0);
    const shareBonusCfg = cfg?.shareBonus || {};
    const shareBonusEnabled = shareBonusCfg.enabled === true;
    const shareBonusPremiumOnly = shareBonusCfg.premiumOnly === true;
    let shareBonusGranted = false;
    if (ui.storage && typeof ui.storage.hasShareBonusGranted === "function") {
      try { shareBonusGranted = ui.storage.hasShareBonusGranted() === true; } catch (_) { shareBonusGranted = false; }
    }
    const shareBonusDismissed = !!ui._runtime?.shareBonusDismissed;
    const shareBonusW = w.shareBonus || {};
    const shareBonusEligible = !!(
      isRun &&
      !premium &&
      isLastFreeRun &&
      runsExhausted &&
      shareBonusEnabled &&
      !shareBonusPremiumOnly &&
      !shareBonusGranted &&
      !shareBonusDismissed
    );
    const shareBonusTitle = String(shareBonusW.title || "").trim();
    const shareBonusBody = String(shareBonusW.body || "").trim();
    const shareBonusCtaShare = String(shareBonusW.ctaShare || "").trim();
    const shareBonusCtaLater = String(shareBonusW.ctaLater || "").trim();
    const shareBonusOfferHtml = shareBonusEligible
      ? `
          <div class="wt-box wt-box--tinted wt-share-bonus-offer">
            ${shareBonusTitle ? `<div class="wt-meta wt-meta--strong">${escapeHtml(shareBonusTitle)}</div>` : ``}
            ${shareBonusBody ? `<p class="wt-muted wt-copy-follow">${escapeHtml(shareBonusBody)}</p>` : ``}
            <div class="wt-actions wt-actions--compact">
              ${shareBonusCtaShare ? `
                <button type="button" class="wt-btn wt-btn--primary" data-action="claim-share-bonus">
                  ${escapeHtml(shareBonusCtaShare)}
                </button>
              ` : ``}
              ${shareBonusCtaLater ? `
                <button type="button" class="wt-btn wt-btn--ghost" data-action="dismiss-share-bonus">
                  ${escapeHtml(shareBonusCtaLater)}
                </button>
              ` : ``}
            </div>
          </div>
        `
      : "";

    const homeLabel = String(w.system?.home || "").trim();
    const homeBtnHtml = homeLabel
      ? `
      <button
        type="button"
        class="wt-btn-icon"
        data-action="go-home"
        aria-label="${escapeHtml(homeLabel)}"
        title="${escapeHtml(homeLabel)}"
      >${renderIcon("home")}</button>
    `
      : ``;

    const poolCompleteCelebration = isRun && !!lastRun.poolCompleteCelebration;

    const endTitle =
      isBonus ? String(bonusW.endTitle || "").trim()
        : isPractice ? String(practiceW.endTitle || "").trim()
          : poolCompleteCelebration ? String(end.poolCompleteTitle || "").trim()
            : String(end.title || "").trim();

    const runPlayAgain =
      poolCompleteCelebration
        ? String(w.end?.poolCompleteCtaPrimary || "").trim()
        : (isRun && runVerdictKey)
          ? String(w.end?.ctaByVerdict?.[runVerdictKey] || "").trim()
          : String(w.end?.playAgain || "").trim();

    let practiceAgain = String(practiceW.ctaPracticeAgain || "").trim();
    if (isPractice && practiceRepeatTierKey) {
      const tierCta = String(practiceW?.ctaRepeatByTier?.[practiceRepeatTierKey] || "").trim();
      if (tierCta) practiceAgain = tierCta;
    }

    const bonusAgain =
      (isBonus && bonusLevel)
        ? String(bonusW?.ctaByTier?.[bonusLevel] || "").trim()
        : "";

    const practiceCtaRaw = poolCompleteCelebration
      ? String(end.poolCompleteCtaPractice || "").trim()
      : premium
        ? String(end.practiceCtaPremium || "").trim()
        : String(end.practiceCta || "").trim();

    const practiceCtaTpl = String(end.practiceCtaTemplate || "").trim();
    const practiceCta = (practiceCtaTpl && vars.backlog > 0)
      ? fillTemplate(practiceCtaTpl, { count: String(vars.backlog), pluralS: vars.backlog > 1 ? "s" : "" })
      : practiceCtaRaw;

    const paywallBridgeTitle = String(w.paywall?.bridgeTitle || "").trim();
    const paywallBridgeBodyDefault = String(w.paywall?.bridgeBody || "").trim();
    const paywallBridgeBodyLastFreeMiss = String(w.paywall?.bridgeBodyLastFreeMiss || "").trim();
    const paywallBridgeBody = (missedLastFreeDaily && paywallBridgeBodyLastFreeMiss)
      ? paywallBridgeBodyLastFreeMiss
      : paywallBridgeBodyDefault;
    const upgradeCta = String(w.paywall?.cta || "").trim();
    const shareTitle = String(end.shareTitle || "").trim();
    const dailyChallengeCta = String(end.dailyChallengeCtaRetry || w.landing?.dailyChallengeCta || "").trim();

    const windowMs = Number(cfg?.secretBonus?.tapWindowMs);
    const endAfterRunsRaw = Number(cfg?.secretBonus?.gates?.endAfterRuns);
    const endAfterRuns = (Number.isFinite(endAfterRunsRaw) && endAfterRunsRaw >= 0) ? Math.floor(endAfterRunsRaw) : null;

    let runNumber = 0;
    if (ui.storage && typeof ui.storage.getRunNumber === "function") {
      try { runNumber = Number(ui.storage.getRunNumber() || 0); } catch (_) { runNumber = 0; }
    }

    const meetsRunGate = (endAfterRuns == null) ? true : (Number.isFinite(runNumber) && runNumber >= endAfterRuns);

    const canShowChest =
      Number.isFinite(windowMs) && windowMs > 0 &&
      meetsRunGate;

    const chestAria = String(ui.wording?.secretBonus?.chestAria || "").trim();
    const ticketBadgeAriaTpl = String(ui.wording?.secretBonus?.ticketBadgeAriaTemplate || "").trim();
    const chestTeaseClass = (!hasSolvedSecretChestHint(ui.storage)) ? " wt-btn-icon--tease" : "";
    let ticketBalance = 0;
    let ticketCap = 0;
    try {
      if (ui.storage && typeof ui.storage.getRapidFireTicketBalance === "function") {
        ticketBalance = clampInt(ui.storage.getRapidFireTicketBalance(), 0, 999);
      }
      if (ui.storage && typeof ui.storage.getRapidFireTicketCap === "function") {
        ticketCap = clampInt(ui.storage.getRapidFireTicketCap(), 0, 999);
      }
    } catch (_) {
      ticketBalance = 0;
      ticketCap = 0;
    }
    const showTicketBadge = !!(canShowChest && ticketBalance > 0);
    const ticketBadgeText = `${ticketBalance}/${Math.max(1, ticketCap || 3)}`;
    const chestTitle = showTicketBadge && ticketBadgeAriaTpl
      ? fillTemplate(ticketBadgeAriaTpl, {
        tickets: String(ticketBalance),
        cap: String(Math.max(1, ticketCap || 3))
      })
      : chestAria;

    const endActionsClass = `wt-actions wt-actions--stack${isPractice ? " wt-actions--grid" : ""}`;
    const endHeaderRowHtml = `
  <div class="wt-end-hero">
    <div class="wt-row wt-row--spaced wt-end-header">
      <div class="wt-end-header__brand">
        ${renderBrandingRow(cfg, true)}
      </div>

      <div class="wt-row wt-row--tight wt-end-header__actions">
        <div class="wt-locale-toggle-slot" data-wt-locale-toggle-slot></div>
        ${homeBtnHtml}

        ${canShowChest ? `
          <button
            type="button"
            data-wt-secret="chest"
            class="wt-btn-icon${showTicketBadge ? " wt-btn-icon--has-counter" : ""}${chestTeaseClass}"
            aria-label="${escapeHtml(chestAria)}"
            title="${escapeHtml(chestTitle)}"
          >${renderIcon("zap")}${showTicketBadge ? `<span class="wt-btn-icon__counter" aria-hidden="true">${escapeHtml(ticketBadgeText)}</span>` : ``}</button>
        ` : ``}
      </div>
    </div>
  </div>
`;

    const missingModeNoticeHtml = !hasKnownMode
      ? `<p class="wt-muted">${escapeHtml(String(end.modeMissingFallback || "").trim())}</p>`
      : ``;

    const microLinesHtml = buildEndMicroLines({
      isRun,
      premium,
      end,
      runtime: ui._runtime,
      lastRun,
      pbLine,
      streakLine,
      tierLine,
      tierNextLine,
      dailyChallengeLine,
      beatBestLine,
      poolCompleteCelebration,
      runIdentityTpl,
      vars,
      pbPremiumHint,
      freeRunMessage,
      wording: w
    });

    const paywallBridgeHtml =
      (runsExhausted && (paywallBridgeTitle || paywallBridgeBody))
        ? `
          <div class="wt-divider"></div>
          <div>
            ${paywallBridgeTitle ? `<strong class="wt-meta">${escapeHtml(paywallBridgeTitle)}</strong>` : ``}
            ${paywallBridgeBody ? `<p class="wt-muted">${escapeHtml(paywallBridgeBody)}</p>` : ``}
          </div>
        `
        : "";

    const shareHtml = buildEndShareBlock({
      shareEnabled,
      w,
      shareTitle,
      getShareText: ui._getShareText ? ui._getShareText.bind(ui) : null
    });

    const leaderboardW = w.leaderboard || {};
    let hasLeaderboardProfile = false;
    try {
      const profile =
        ui.storage && typeof ui.storage.getLeaderboardProfile === "function"
          ? ui.storage.getLeaderboardProfile()
          : null;
      hasLeaderboardProfile =
        profile?.optIn === true && !!String(profile?.nickname || "").trim();
    } catch (_) {
      hasLeaderboardProfile = false;
    }

    const leaderboardJoinTitle = String(leaderboardW.endJoinTitle || "").trim();
    const leaderboardJoinBody = String(leaderboardW.endJoinBody || "").trim();
    const leaderboardJoinCta = String(leaderboardW.joinCta || "").trim();
    const leaderboardJoinHtml =
      isRun &&
      scoreFP > 0 &&
      !hasLeaderboardProfile &&
      (leaderboardJoinTitle || leaderboardJoinBody || leaderboardJoinCta)
        ? `
          <div class="wt-box wt-box--tinted">
            ${leaderboardJoinTitle ? `<strong class="wt-meta">${escapeHtml(leaderboardJoinTitle)}</strong>` : ``}
            ${leaderboardJoinBody ? `<p class="wt-muted">${escapeHtml(leaderboardJoinBody)}</p>` : ``}
            ${leaderboardJoinCta ? `
              <div class="wt-actions wt-actions--compact">
                <button type="button" class="wt-btn wt-btn--secondary" data-action="open-leaderboard-profile">
                  ${escapeHtml(leaderboardJoinCta)}
                </button>
              </div>
            ` : ``}
          </div>
        `
        : "";

    const endCopyHtml = buildEndCopyHtml({
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
    });

    return `
<div class="wt-card wt-card--end">
  ${endHeaderRowHtml}

  ${endTitle ? `<h1 class="wt-h1">${escapeHtml(endTitle)}</h1>` : ``}
  ${missingModeNoticeHtml}

  ${displayScoreLine ? `
    <div class="wt-end-score${newBest ? " wt-end-score--newbest" : ""}" role="group" aria-label="${escapeHtml(displayScoreLine)}">
      <div class="wt-end-score__headline">
        ${displayScoreHeading ? `<span class="wt-end-score__eyebrow">${escapeHtml(displayScoreHeading)}</span>` : ``}
        <span class="wt-end-score__value">
          ${escapeHtml(displayScoreValue || displayScoreLine)}
        </span>
      </div>

      ${celebrationLabel ? `<span class="wt-end-score__label">${escapeHtml(celebrationLabel)}</span>` : ``}

      ${recordActive ? `
        <span class="wt-end-score__burst" aria-hidden="true"></span>
        <svg class="wt-end-score__spark" viewBox="0 0 36 14" width="36" height="14" aria-hidden="true" focusable="false">
          <path d="M6 1 L7.6 5.2 L12 6.2 L7.6 7.2 L6 11.4 L4.4 7.2 L0 6.2 L4.4 5.2 Z" fill="currentColor" opacity="0.85"></path>
          <path d="M18 2.2 L19.2 5.4 L22.6 6.4 L19.2 7.4 L18 10.6 L16.8 7.4 L13.4 6.4 L16.8 5.4 Z" fill="currentColor" opacity="0.6"></path>
          <path d="M30 1 L31.4 4.6 L35 5.8 L31.4 7 L30 10.6 L28.6 7 L25 5.8 L28.6 4.6 Z" fill="currentColor" opacity="0.75"></path>
        </svg>
      ` : ``}
    </div>
  ` : ``}

  ${levelUnlockHtml}

  <div class="wt-end-summary">
    ${microLinesHtml}
    <div class="wt-end-copy">${endCopyHtml}</div>
  </div>

  <div class="${endActionsClass}">
    ${buildEndActionsHtml({
      storage: ui.storage,
      w,
      cfg,
      vars,
      premium,
      end,
      postW: w.postCompletion || {},
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
    })}
  </div>

  ${runsExhausted ? shareBonusOfferHtml : ``}
  ${runsExhausted ? paywallBridgeHtml : ``}

  ${shareHtml}

  ${mistakesRecapHtml}

  ${leaderboardJoinHtml}

  ${!runsExhausted ? paywallBridgeHtml : ``}

</div>
`;
  }

  window.WT_UI_End = { render };
})();

/* ===== ui-screen-landing.js ===== */
// ui-screen-landing.js
// Extracted from ui.js to keep LANDING rendering isolated from the core UI shell.

(() => {
  "use strict";

  function getSeoEntryContext() {
    if (typeof window === "undefined" || !window.location) return null;

    try {
      const params = new URLSearchParams(window.location.search);
      const source = String(params.get("wt-source") || "").trim().toLowerCase();
      if (source !== "seo") return null;

      const topic = String(params.get("wt-topic") || "").trim();
      const topicLabel = String(params.get("wt-topic-label") || "").trim();
      const entry = String(params.get("wt-entry") || "").trim();
      const entryLabel = String(params.get("wt-entry-label") || "").trim();
      const entryType = String(params.get("wt-entry-type") || "").trim().toLowerCase();

      if (!topic && !topicLabel && !entry && !entryLabel) return null;

      return {
        topic,
        topicLabel,
        entry,
        entryLabel,
        entryType: entryType === "theme" ? "theme" : "question"
      };
    } catch (_) {
      return null;
    }
  }

  function renderLandingStatsCard(opts, escapeHtml) {
    const badgeHtml = String(opts?.badgeHtml || "");
    const label = String(opts?.label || "").trim();
    const title = String(opts?.title || "").trim();
    const sub = String(opts?.sub || "").trim();
    const pct = Math.max(0, Math.min(100, Number(opts?.pct || 0)));
    const progressClass = String(opts?.progressClass || "").trim();
    const cardClass = String(opts?.cardClass || "").trim();
    const showProgress = (opts?.showProgress === true) || (opts?.showProgress !== false && pct > 0);
    const ctaAction = String(opts?.ctaAction || "").trim();
    const ctaLabel = String(opts?.ctaLabel || "").trim();
    const cardAction = String(opts?.cardAction || "").trim();
    const cardActionAria = String(opts?.cardActionAria || "").trim();
    const cardAttrs = String(opts?.cardAttrs || "").trim();
    const interactiveClass = cardAction ? " wt-landing-stat--clickable" : "";
    const interactiveAttrs = cardAction
      ? ` data-action="${escapeHtml(cardAction)}" role="button" tabindex="0"${cardActionAria ? ` aria-label="${escapeHtml(cardActionAria)}"` : ""}`
      : "";

    if (!label && !title && !sub) return "";

    const subHtml = sub
      ? escapeHtml(sub).replace(/\n/g, "<br>")
      : "";

    return `
      <section class="wt-box wt-box--tinted wt-landing-stat${interactiveClass}${cardClass ? ` ${cardClass}` : ``}" aria-label="${escapeHtml(label || title || sub)}"${interactiveAttrs}${cardAttrs ? ` ${cardAttrs}` : ``}>
        <div class="wt-landing-stat__header">
          ${badgeHtml || ``}
          ${label ? `<span class="wt-landing-stat__label">${escapeHtml(label)}</span>` : ``}
        </div>
        ${title ? `<p class="wt-landing-stat__title">${escapeHtml(title)}</p>` : ``}
        ${subHtml ? `<p class="wt-landing-stat__sub">${subHtml}</p>` : ``}
        ${showProgress ? `
          <div class="wt-progress${progressClass}" role="img" aria-label="${escapeHtml(`${pct}%`)}">
            <span class="wt-progress__fill" style="width:${pct}%"></span>
          </div>
        ` : ``}
        ${(ctaAction && ctaLabel) ? `
          <div class="wt-landing-stat__actions">
            <button type="button" class="wt-btn wt-btn--secondary" data-action="${escapeHtml(ctaAction)}">
              ${escapeHtml(ctaLabel)}
            </button>
          </div>
        ` : ``}
      </section>
    `;
  }

  function render(ui, helpers) {
    const {
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
      renderLeaderboardLandingCard
    } = helpers || {};

    if (
      typeof escapeHtml !== "function" ||
      typeof fillTemplate !== "function" ||
      typeof clampInt !== "function" ||
      typeof isPremiumNow !== "function" ||
      typeof getRunTierInfo !== "function" ||
      typeof getDailyChallengeModel !== "function" ||
      typeof getAppLevelModel !== "function" ||
      typeof getLandingStatsPreviewState !== "function" ||
      typeof getRuleKnowledgePhaseContext !== "function" ||
      typeof renderBrandingRow !== "function" ||
      typeof renderTextWithStrong !== "function" ||
      typeof renderIcon !== "function" ||
      typeof hasSolvedSecretChestHint !== "function" ||
      typeof mmss !== "function" ||
      typeof renderLeaderboardLandingCard !== "function"
    ) {
      throw new Error("WT_UI_Landing helpers missing");
    }

    const w = ui.wording || {};
    const landing = w.landing || {};
    const cfg = ui.config || {};
    const poolSize = clampInt(cfg?.game?.poolSize, 1, 9999);
    const maxChances = clampInt(cfg?.game?.maxChances, 1, 99);
    const subtitleRaw = fillTemplate(String(landing.subtitle || "").trim(), { poolSize, maxChances });

    const subtitleNormalized = subtitleRaw.includes("\n")
      ? subtitleRaw
      : subtitleRaw
        .replace(/\?\s+/g, "?\n")
        .replace(/\. +/g, ".\n");

    const subtitleHtml = subtitleNormalized
      .split(/\r?\n/)
      .map((s) => String(s || "").trim())
      .filter(Boolean)
      .map((s) => escapeHtml(s))
      .join("<br>");

    const premium = isPremiumNow(ui.storage);
    const isPostPaywallVariant = !premium && (ui._nav && ui._nav.landingVariant === "POST_PAYWALL");
    if (isPostPaywallVariant && ui._nav) ui._nav.landingVariant = null;
    const shareBonusCfg = cfg?.shareBonus || {};
    const shareBonusEnabled = shareBonusCfg.enabled === true;
    const shareBonusPremiumOnly = shareBonusCfg.premiumOnly === true;
    const shareBonusW = w.shareBonus || {};
    let shareBonusGranted = false;
    if (ui.storage && typeof ui.storage.hasShareBonusGranted === "function") {
      try { shareBonusGranted = ui.storage.hasShareBonusGranted() === true; } catch (_) { shareBonusGranted = false; }
    }

    const tagline = String(landing.tagline || "").trim();
    const microTrust = String(landing.microTrust || "").trim();
    const seoBridgeTitleQuestionTpl = String(landing.seoBridgeTitleQuestionTemplate || "").trim();
    const seoBridgeTitleThemeTpl = String(landing.seoBridgeTitleThemeTemplate || "").trim();
    const seoBridgeBodyQuestion = String(landing.seoBridgeBodyQuestion || "").trim();
    const seoBridgeBodyTheme = String(landing.seoBridgeBodyTheme || "").trim();
    const seoBridgeTrust = String(landing.seoBridgeTrust || "").trim();
    const installCtaLabel = String(ui.wording?.installPrompt?.ctaPrimary || "").trim();
    const postTitle = String(landing.postPaywallTitle || "").trim();
    const postBody = String(landing.postPaywallBody || "").trim();
    const postCta = String(landing.postPaywallCta || "").trim();

    let rn = null;
    let rc = null;

    if (ui.storage && typeof ui.storage.getRunNumber === "function") {
      try {
        const v = Number(ui.storage.getRunNumber());
        rn = Number.isFinite(v) ? v : null;
      } catch (_) { rn = null; }
    }

    if (ui.storage && typeof ui.storage.getCounters === "function") {
      try {
        const c = ui.storage.getCounters() || {};
        const v = Number(c.runCompletes);
        rc = Number.isFinite(v) ? v : null;
      } catch (_) { rc = null; }
    }
    const a = (rn == null) ? null : Math.max(0, Math.floor(rn));
    const b = (rc == null) ? null : Math.max(0, Math.floor(rc));

    let rs = null;
    if (ui.storage && typeof ui.storage.getRunsUsed === "function") {
      try {
        const v = Number(ui.storage.getRunsUsed());
        rs = Number.isFinite(v) ? v : null;
      } catch (_) { rs = null; }
    }

    if (rs == null && ui.storage && typeof ui.storage.getCounters === "function") {
      try {
        const c = ui.storage.getCounters() || {};
        const v = Number(c.runStarts);
        rs = Number.isFinite(v) ? v : null;
      } catch (_) { rs = null; }
    }

    const c = (rs == null) ? null : Math.max(0, Math.floor(rs));
    const runCompletes =
      (a == null && b == null) ? 0 :
        (a == null) ? b :
          (b == null) ? a :
            Math.max(a, b);
    const runPlays = Math.max(runCompletes, (c == null ? 0 : c));

    let showLandingInstallPrompt = false;
    try {
      showLandingInstallPrompt =
        !premium &&
        !isPostPaywallVariant &&
        Number.isFinite(runCompletes) &&
        runCompletes >= 1 &&
        microTrust &&
        typeof ui._canShowInstallPrompt === "function" &&
        ui._canShowInstallPrompt() === true;
    } catch (_) { showLandingInstallPrompt = false; }

    let runsBalance = null;
    if (!premium && ui.storage && typeof ui.storage.getRunsBalance === "function") {
      try { runsBalance = Number(ui.storage.getRunsBalance()); } catch (_) { runsBalance = null; }
    }
    const runsExhausted = (!premium && Number.isFinite(runsBalance) && runsBalance <= 0);

    let postBlock = "";
    let postCompletionHtml = "";
    try {
      const exhausted =
        !!(ui.storage && typeof ui.storage.hasSeenAllWordTraps === "function" && ui.storage.hasSeenAllWordTraps() === true);

      const pcCfg = cfg?.postCompletion || {};
      const pcW = w?.postCompletion || {};
      const wlCfg = cfg?.waitlist || {};
      const wlW = w?.waitlist || {};
      const haW = w?.houseAd || {};

      const waitlistThresholdEligible =
        !!(wlCfg.enabled === true && ui.storage && typeof ui.storage.shouldShowWaitlistNow === "function" && ui.storage.shouldShowWaitlistNow({ inRun: false }) === true);
      const waitlistExhaustedEligible =
        !!(runsExhausted && wlCfg.enabled === true && ui.storage && typeof ui.storage.shouldShowWaitlistOnPaywall === "function" && ui.storage.shouldShowWaitlistOnPaywall() === true);
      const waitlistEligible = waitlistThresholdEligible || waitlistExhaustedEligible;
      const houseAdEligible =
        !!(pcCfg?.houseAdEnabled === true && ui.storage && typeof ui.storage.shouldShowHouseAdNow === "function" && ui.storage.shouldShowHouseAdNow({ inRun: false }) === true);

      if (waitlistEligible || houseAdEligible) {
        const pcPoolSize = clampInt(cfg?.game?.poolSize, 1, 9999);

        const title = exhausted && pcCfg?.enabled === true
          ? fillTemplate(String(pcW.title || "").trim(), { poolSize: pcPoolSize })
          : String(wlW.title || "").trim();

        const body1 = exhausted && pcCfg?.enabled === true
          ? fillTemplate(String(pcW.body || "").trim(), { poolSize: pcPoolSize })
          : String(wlW.bodyLine1 || "").trim();

        const body2 = exhausted
          ? String(pcW.waitlistBody1 || wlW.bodyLine1 || "").trim()
          : String(wlW.bodyLine2 || "").trim();

        const body3 = exhausted
          ? String(pcW.waitlistBody2 || wlW.bodyLine2 || "").trim()
          : "";

        const waitlistCta = exhausted
          ? String(pcW.waitlistCta || wlW.ctaLabel || "").trim()
          : String(wlW.ctaLabel || "").trim();

        const waitlistDisclaimer = exhausted
          ? String(pcW.waitlistDisclaimer || wlW.disclaimer || "").trim()
          : String(wlW.disclaimer || "").trim();

        const houseAdCta = String(pcW.houseAdCta || haW.ctaPrimary || "").trim();

        postCompletionHtml = `
          <div class="wt-divider"></div>
          ${title ? `<strong class="wt-meta">${escapeHtml(title)}</strong>` : ``}
          <div class="wt-stack wt-stack--xs wt-postcompletion-copy">
            ${body1 ? `<p class="wt-muted">${escapeHtml(body1)}</p>` : ``}
            ${waitlistEligible && body2 ? `<p class="wt-muted">${escapeHtml(body2)}</p>` : ``}
            ${waitlistEligible && body3 ? `<p class="wt-muted">${escapeHtml(body3)}</p>` : ``}
          </div>

          <div class="wt-actions wt-postcompletion-actions">
            ${waitlistEligible && waitlistCta ? `
              <button class="wt-btn ${houseAdEligible ? `wt-btn--secondary` : `wt-btn--primary`}" data-action="open-waitlist">${escapeHtml(waitlistCta)}</button>
            ` : ``}

            ${houseAdEligible && houseAdCta ? `
              <button class="wt-btn ${waitlistEligible ? `wt-btn--ghost` : `wt-btn--primary`}" data-action="open-house-ad">${escapeHtml(houseAdCta)}</button>
            ` : ``}
          </div>

          ${waitlistEligible && waitlistDisclaimer ? `<p class="wt-muted wt-postcompletion-disclaimer">${escapeHtml(waitlistDisclaimer)}</p>` : ``}
        `;
      }
    } catch (_) { postCompletionHtml = ""; }

    const levelModel = getAppLevelModel(ui.storage, cfg, w);
    const levelDetailsAria = String(levelModel.levelsW?.openDetailsAria || "").trim();
    const levelCurrentLabel = String(levelModel.levelsW?.currentLabel || "").trim();
    const levelCurrentValue = String(
      (levelModel.state.currentLevel > 0 && levelModel.current && levelModel.current.label)
        ? levelModel.current.label
        : (levelModel.levelsW?.noLevelTitle || "")
    ).trim();
    const levelBadgeLabel = String(
      (levelCurrentLabel && levelCurrentValue)
        ? `${levelCurrentLabel}: ${levelCurrentValue}`
        : levelCurrentValue
    ).trim();
    const landingLevelBadgeHtml = levelBadgeLabel
      ? `
          <div class="wt-landing-stat__badge">
            <button type="button" class="wt-badge" data-action="open-level-progress" aria-label="${escapeHtml(levelDetailsAria)}">
              ${escapeHtml(levelBadgeLabel)}
            </button>
          </div>
        `
      : "";
    const levelProgressQuickHtml = (landingLevelBadgeHtml && Number.isFinite(runCompletes) && runCompletes >= 1)
      ? `<div class="wt-landing-level-quick">${landingLevelBadgeHtml}</div>`
      : "";

    let welcomeBackHtml = "";
    let personalBestCardHtml = "";
    let dailyChallengeCardHtml = "";
    const windowMs = Number(cfg?.secretBonus?.tapWindowMs);
    const landingAfterRunsRaw = Number(cfg?.secretBonus?.gates?.landingAfterRuns);
    const landingAfterRuns = (Number.isFinite(landingAfterRunsRaw) && landingAfterRunsRaw >= 0)
      ? Math.floor(landingAfterRunsRaw)
      : null;

    // Landing cleanup:
    // the old phase / "first pass" summary was informative but too dashboard-like
    // and competed with the level card + Daily. Keep the level badge only.

    let dailyChallengeIncomplete = false;
    let bestScoreFP = 0;
    try {
      bestScoreFP = (ui.storage && typeof ui.storage.getPersonalBest === "function")
        ? clampInt(ui.storage.getPersonalBest()?.bestScoreFP, 0, 99999)
        : 0;
      const tierInfo = getRunTierInfo(cfg, w, bestScoreFP);

      const bestBadge = String(landing.personalBestBadge || "").trim();
      const bestTitleTpl = String(landing.personalBestTitleTemplate || "").trim();
      const bestSubTpl = String(landing.personalBestSubTemplate || "").trim();
      const bestTopTpl = String(landing.personalBestTopTierTemplate || "").trim();
      const bestFirstTitle = String(landing.personalBestFirstTitle || "").trim();
      const bestFirstSubTpl = String(landing.personalBestFirstSubTemplate || "").trim();
      const bestCardActionAria = String(landing.ctaPlayAfterFirstRun || landing.ctaPlay || "").trim();

      const bestTitle = (bestScoreFP > 0 && bestTitleTpl)
        ? fillTemplate(bestTitleTpl, { tier: tierInfo.currentLabel || "", best: String(bestScoreFP) })
        : bestFirstTitle;

      const bestSub = (bestScoreFP > 0)
        ? (
          tierInfo.nextTarget != null
            ? fillTemplate(bestSubTpl, {
              best: String(bestScoreFP),
              nextTarget: String(tierInfo.nextTarget),
              nextTier: tierInfo.nextLabel || ""
            })
            : fillTemplate(bestTopTpl, { best: String(bestScoreFP) })
        )
        : fillTemplate(bestFirstSubTpl, { nextTarget: String(tierInfo.nextTarget || 3) });

      const shouldShowPersonalBest = Number.isFinite(runCompletes) && runCompletes >= 1;

      if (shouldShowPersonalBest && (bestBadge || bestTitle || bestSub)) {
        let bestCardAction = "";
        let bestCardAria = "";

        if (bestScoreFP <= 0) {
          let runsBalance = NaN;
          if (!premium && ui.storage && typeof ui.storage.getRunsBalance === "function") {
            try { runsBalance = Number(ui.storage.getRunsBalance()); } catch (_) { runsBalance = NaN; }
          }
          const runsExhausted = !premium && Number.isFinite(runsBalance) && runsBalance <= 0;
          bestCardAction = runsExhausted ? "open-paywall" : "start-run";
          bestCardAria = runsExhausted
            ? String(landing.postPaywallCta || bestCardActionAria || "").trim()
            : bestCardActionAria;
        }

        personalBestCardHtml = renderLandingStatsCard({
          label: bestBadge,
          title: bestTitle,
          sub: bestSub,
          pct: (bestScoreFP > 0) ? tierInfo.progressPct : 0,
          progressClass: "",
          cardAction: bestCardAction,
          cardActionAria: bestCardAria
        }, escapeHtml);
      }
    } catch (_) { /* silent */ }

    try {
      // Product choice:
      // the Daily Challenge appears only after at least one completed RUN.
      // Before that, the landing should stay focused on the core loop and first-play clarity.
      if (Number.isFinite(runCompletes) && runCompletes >= 1) {
        const fallbackBestScoreFP = (ui.storage && typeof ui.storage.getPersonalBest === "function")
          ? clampInt(ui.storage.getPersonalBest()?.bestScoreFP, 0, 99999)
          : 0;
        const dailyBestScoreFP = clampInt(bestScoreFP || fallbackBestScoreFP, 0, 99999);
        const dailyModel = getDailyChallengeModel(cfg, w, dailyBestScoreFP, ui.storage);
        const dailyBadge = String(landing.dailyChallengeBadge || "").trim();
        const dailyTitleTpl = String(landing.dailyChallengeTitleTemplate || "").trim();
        const dailyCompletedTpl = String(landing.dailyChallengeCompletedTemplate || "").trim();
        const dailyRewardTpl = String(landing.dailyChallengeRewardTemplate || "").trim();
        const dailyRewardCappedTpl = String(landing.dailyChallengeRewardCappedTemplate || "").trim();
        const dailyRewardPendingTpl = String(landing.dailyChallengeRewardPendingTemplate || "").trim();
        const dailyCta = String(landing.dailyChallengeCta || "").trim();
        const dailyGoalLine = dailyTitleTpl
          ? fillTemplate(dailyTitleTpl, {
            targetScore: String(dailyModel.targetScore)
          })
          : "";

        let dailySub = "";
        const dailyLines = [];
        const rewardLine = (!dailyModel.completedToday && !dailyModel.rewardPendingReplay)
          ? (
            (dailyModel.ticketAtCap && dailyRewardCappedTpl)
              ? fillTemplate(dailyRewardCappedTpl, { cap: String(dailyModel.ticketCap || 0) })
              : (dailyRewardTpl
                ? fillTemplate(dailyRewardTpl, { tickets: String(dailyModel.ticketBalance || 0), cost: String(dailyModel.ticketCost || 1) })
                : "")
          )
          : "";

        if (dailyGoalLine) dailyLines.push(dailyGoalLine);

        if (dailyModel.rewardPendingReplay && dailyRewardPendingTpl) {
          dailyLines.push(fillTemplate(dailyRewardPendingTpl, {
            targetScore: String(dailyModel.targetScore),
            best: String(dailyBestScoreFP || 0),
            time: String(dailyModel.resetCountdown || ""),
            resetTime: String(dailyModel.resetTime || dailyModel.resetCountdown || "")
          }));
        } else if (dailyModel.completedToday && dailyCompletedTpl) {
          dailyLines.push(fillTemplate(dailyCompletedTpl, {
            best: String(dailyBestScoreFP || 0),
            time: String(dailyModel.resetCountdown || ""),
            resetTime: String(dailyModel.resetTime || dailyModel.resetCountdown || "")
          }));
        }

        if (rewardLine) dailyLines.push(rewardLine);
        dailySub = dailyLines.map((line) => String(line || "").trim()).filter(Boolean).join("\n");

        dailyChallengeIncomplete = !dailyModel.completedToday || !!dailyModel.rewardPendingReplay;
        if (dailyBadge || dailySub) {
          dailyChallengeCardHtml = renderLandingStatsCard({
            label: dailyBadge,
            title: "",
            sub: dailySub,
            pct: dailyModel.progressPct,
            showProgress: dailyModel.completedToday && !dailyModel.rewardPendingReplay,
            cardClass: (dailyModel.completedToday && !dailyModel.rewardPendingReplay)
              ? " wt-landing-stat--daily wt-landing-stat--daily-complete"
              : " wt-landing-stat--daily",
            progressClass: (dailyModel.completedToday && !dailyModel.rewardPendingReplay) ? " wt-progress--mastery" : "",
            cardAttrs: `data-wt-daily-challenge-card="1"`,
            cardAction: ((dailyModel.completedToday && !dailyModel.rewardPendingReplay) || !dailyModel.challengePlayable) ? "" : "start-daily-challenge",
            cardActionAria: ((dailyModel.completedToday && !dailyModel.rewardPendingReplay) || !dailyModel.challengePlayable) ? "" : dailyCta,
            ctaAction: ((dailyModel.completedToday && !dailyModel.rewardPendingReplay) || !dailyModel.challengePlayable) ? "" : "start-daily-challenge",
            ctaLabel: ((dailyModel.completedToday && !dailyModel.rewardPendingReplay) || !dailyModel.challengePlayable) ? "" : dailyCta
          }, escapeHtml);
        }
      }
    } catch (_) { /* silent */ }

    const playLabelFirst = String(landing.ctaPlay || "").trim();
    const playLabelAfterFirstRun = String(landing.ctaPlayAfterFirstRun || "").trim();
    const seoContext = getSeoEntryContext();
    const playLabelBase =
      (Number.isFinite(runPlays) && runPlays >= 1)
        ? playLabelAfterFirstRun
        : playLabelFirst;
    const playLabel = seoContext
      ? String(landing.seoBridgeCta || "").trim() || playLabelBase
      : playLabelBase;

    let seoBridgeHtml = "";
    if (seoContext) {
      const label = seoContext.entryLabel || seoContext.topicLabel || "";
      const titleTpl =
        seoContext.entryType === "theme"
          ? seoBridgeTitleThemeTpl
          : seoBridgeTitleQuestionTpl;
      const title = titleTpl ? fillTemplate(titleTpl, { label }) : "";
      const body =
        seoContext.entryType === "theme"
          ? seoBridgeBodyTheme
          : seoBridgeBodyQuestion;

      if (title || body || seoBridgeTrust) {
        seoBridgeHtml = `
          <div class="wt-box wt-box--tinted wt-landing-seo-bridge">
            ${title ? `<div class="wt-meta wt-meta--strong">${escapeHtml(title)}</div>` : ``}
            ${body ? `<p class="wt-muted">${escapeHtml(body)}</p>` : ``}
            ${seoBridgeTrust ? `<p class="wt-sub wt-muted">${escapeHtml(seoBridgeTrust)}</p>` : ``}
          </div>
        `;
      }
    }

    const meetsRunGate = (landingAfterRuns == null)
      ? false
      : (Number.isFinite(runPlays) && runPlays >= landingAfterRuns);
    const canShowChest =
      Number.isFinite(windowMs) && windowMs > 0 &&
      meetsRunGate;

    let sbFreeRunsUsedLanding = 0;
    if (ui.storage && typeof ui.storage.getSecretBonusFreeRunsUsed === "function") {
      try { sbFreeRunsUsedLanding = Number(ui.storage.getSecretBonusFreeRunsUsed()); } catch (_) { sbFreeRunsUsedLanding = 0; }
    }

    const chestHintTextLanding = (canShowChest && sbFreeRunsUsedLanding === 0)
      ? String(ui.wording?.secretBonus?.chestHint || "").trim()
      : "";

    const chestAria = String(ui.wording?.secretBonus?.chestAria || "").trim();
    const ticketBadgeAriaTpl = String(ui.wording?.secretBonus?.ticketBadgeAriaTemplate || "").trim();
    const chestTeaseClass = (!hasSolvedSecretChestHint(ui.storage)) ? " wt-btn-icon--tease" : "";
    let ticketBalance = 0;
    let ticketCap = 0;
    try {
      if (ui.storage && typeof ui.storage.getRapidFireTicketBalance === "function") {
        ticketBalance = clampInt(ui.storage.getRapidFireTicketBalance(), 0, 999);
      }
      if (ui.storage && typeof ui.storage.getRapidFireTicketCap === "function") {
        ticketCap = clampInt(ui.storage.getRapidFireTicketCap(), 0, 999);
      }
    } catch (_) {
      ticketBalance = 0;
      ticketCap = 0;
    }
    const showTicketBadge = !!(canShowChest && (ticketBalance > 0 || runCompletes >= 1));
    const ticketBadgeText = `${ticketBalance}/${Math.max(1, ticketCap || 3)}`;
    const chestTitle = showTicketBadge && ticketBadgeAriaTpl
      ? fillTemplate(ticketBadgeAriaTpl, {
        tickets: String(ticketBalance),
        cap: String(Math.max(1, ticketCap || 3))
      })
      : chestAria;

    let landingUrgencyHtml = "";
    try {
      const pay = w.paywall || {};
      let ep = null;
      if (ui.storage && typeof ui.storage.getEarlyPriceState === "function") {
        try { ep = ui.storage.getEarlyPriceState() || null; } catch (_) { ep = null; }
      }

      const isEarly = !!(ep && String(ep.phase || "").toUpperCase() === "EARLY" && Number(ep.remainingMs || 0) > 0);
      const remainingMs = isEarly ? Number(ep?.remainingMs || 0) : 0;
      const timer = (isEarly && Number.isFinite(remainingMs)) ? mmss(remainingMs) : "";

      const urgencyCfg = (cfg?.ui?.paywallUrgency && typeof cfg.ui.paywallUrgency === "object") ? cfg.ui.paywallUrgency : null;
      const urgencyEnabled = (urgencyCfg && urgencyCfg.enabled === true);
      const pulseBelowMs = urgencyCfg ? Number(urgencyCfg.pulseBelowMs) : NaN;
      const urgencyPulse =
        urgencyEnabled &&
        isEarly &&
        Number.isFinite(pulseBelowMs) &&
        pulseBelowMs > 0 &&
        Number.isFinite(remainingMs) &&
        remainingMs > 0 &&
        remainingMs <= pulseBelowMs;

      const label = String(pay.timerLabel || "").trim();

      if (!premium && isEarly && urgencyEnabled && label) {
        const cls = `wt-box wt-box--tinted`;
        landingUrgencyHtml = `
        <div class="${cls}" role="status" aria-live="polite">
        <div class="wt-meta">${escapeHtml(label)}</div>
          <div class="wt-h2 wt-paywall-timer${urgencyPulse ? ' wt-pulse' : ''}">${escapeHtml(timer)}</div>
        </div>
      `;
      }
    } catch (_) { landingUrgencyHtml = ""; }

    postBlock = (() => {
      if (!isPostPaywallVariant) return ``;

      let sbUsedPost = 0;
      if (ui.storage && typeof ui.storage.getSecretBonusFreeRunsUsed === "function") {
        try { sbUsedPost = Number(ui.storage.getSecretBonusFreeRunsUsed()); } catch (_) { sbUsedPost = 0; }
      }

      const postSbTitle = String(landing.postPaywallSbTitle || "").trim();
      const postSbBody = String(landing.postPaywallSbBody || "").trim();

      if (canShowChest && sbUsedPost === 0 && (postSbTitle || postSbBody)) {
        return `
          <div class="wt-divider"></div>
          ${postSbTitle ? `<strong class="wt-meta">${escapeHtml(postSbTitle)}</strong>` : ``}
          ${postSbBody ? `<p class="wt-muted wt-postpaywall-body">${escapeHtml(postSbBody)}</p>` : ``}
        `;
      }

      if (postTitle || postBody || postCta) {
        return `
          <div class="wt-divider"></div>
          ${postTitle ? `<strong class="wt-meta">${escapeHtml(postTitle)}</strong>` : ``}
          ${postBody ? `<p class="wt-muted wt-postpaywall-body">${escapeHtml(postBody)}</p>` : ``}
          ${postCta ? `
            <div class="wt-actions wt-actions--postpaywall">
              <button class="wt-btn wt-btn--secondary" data-action="open-paywall">
                ${escapeHtml(postCta)}
              </button>
            </div>
          ` : ``}
        `;
      }

      return ``;
    })();

    const landingHeaderRowHtml = `
  <div class="wt-landing-hero">
     <div class="wt-landing-header">
      <div class="wt-landing-header__brand">
        ${renderBrandingRow(cfg, true)}
      </div>
     <div class="wt-landing-top-right">
        <div class="wt-locale-toggle-slot" data-wt-locale-toggle-slot></div>
        ${chestHintTextLanding ? `<div class="wt-chest-hint-inline">${escapeHtml(chestHintTextLanding)}</div>` : ``}
        ${canShowChest ? `
          <button
            type="button"
            data-wt-secret="chest"
            class="wt-btn-icon${showTicketBadge ? " wt-btn-icon--has-counter" : ""}${chestTeaseClass}"
            aria-label="${escapeHtml(chestAria)}"
            title="${escapeHtml(chestTitle)}"
          >${renderIcon("zap")}${showTicketBadge ? `<span class="wt-btn-icon__counter" aria-hidden="true">${escapeHtml(ticketBadgeText)}</span>` : ``}</button>
        ` : ``}
      </div>
    </div>
  </div>
`;

    const leaderboardLandingHtml = renderLeaderboardLandingCard(ui);
    // Landing KISS: Daily Challenge owns the score target once available.
    // Personal best remains a fallback only, so users do not see two competing score goals.
    const primaryInsightHtml = dailyChallengeCardHtml || personalBestCardHtml;
    const secondaryInsightHtml = "";
    const dashboardGridClass = secondaryInsightHtml
      ? ""
      : " wt-landing-dashboard__grid--single";
    const hasDashboard = Boolean(
      welcomeBackHtml ||
      primaryInsightHtml ||
      secondaryInsightHtml ||
      levelProgressQuickHtml
    );
    const hasLeaderboardSection = Boolean(leaderboardLandingHtml);

    return `
  <div class="wt-card wt-card--landing">


${landingHeaderRowHtml}
  ${landingUrgencyHtml}
  ${tagline ? `<p class="wt-meta wt-tagline">${renderTextWithStrong(tagline)}</p>` : ``}
  <p class="wt-sub wt-landing-subtitle">${subtitleHtml}</p>
  ${seoBridgeHtml}

<div class="wt-actions">

      ${(() => {
        const shareBonusEligible = !!(
          runsExhausted &&
          shareBonusEnabled &&
          !shareBonusPremiumOnly &&
          !shareBonusGranted
        );

        if (runsExhausted) {
          const shareLabel = String(shareBonusW.ctaShare || "").trim();
          const upgradeLabel = String(landing.postPaywallCta || "").trim();
          if (shareBonusEligible) return ``;
          if (!upgradeLabel) return ``;
          return `
            <button class="wt-btn wt-btn--primary" data-action="open-paywall">
              ${escapeHtml(upgradeLabel)}
            </button>
          `;
        }

        return `
          <button class="wt-btn wt-btn--primary" data-action="start-run"
            aria-label="${escapeHtml(playLabel)}"
            ${((ui._runtime && Number(ui._runtime.contentTotal) > 0) ? "" : "disabled")}>
             ${escapeHtml(playLabel)}
          </button>
        `;
      })()}

${(() => {
        if (!Number.isFinite(runCompletes) || runCompletes < 1) return ``;

        const minWrong = clampInt(Number(cfg?.mistakesOnly?.minWrongItemsToShowToggle), 1, 9999);

        let mistakesCount = 0;
        if (ui.storage && typeof ui.storage.getActiveMistakesCount === "function") {
          try { mistakesCount = Number(ui.storage.getActiveMistakesCount()); } catch (_) { mistakesCount = 0; }
        }

        if (!Number.isFinite(mistakesCount) || mistakesCount < minWrong) return ``;

        const tpl = String(landing.practiceCtaTemplate || "").trim();
        const label = tpl
          ? fillTemplate(tpl, { count: String(mistakesCount), pluralS: mistakesCount > 1 ? "s" : "" })
          : "";

        if (!label) return ``;

        if (!premium && ui.storage && typeof ui.storage.getPracticeRunsRemaining === "function") {
          let remaining = 0;
          try { remaining = Number(ui.storage.getPracticeRunsRemaining()); } catch (_) { remaining = 0; }
          if (!Number.isFinite(remaining) || remaining <= 0) return ``;
        }

        return `
    <button class="wt-btn wt-btn--secondary" data-action="start-practice">
      ${escapeHtml(label)}
    </button>
  `;
      })()}

    </div>

    ${((!premium && !isPostPaywallVariant && landing.microFun) ? `<p class="wt-sub wt-muted wt-landing-followup">${escapeHtml(String(landing.microFun || "").trim())}</p>` : ``)}

    ${(() => {
      const shareBonusEligible = !!(
        runsExhausted &&
        shareBonusEnabled &&
        !shareBonusPremiumOnly &&
        !shareBonusGranted
      );
      const title = String(shareBonusW.title || "").trim();
      const body = String(shareBonusW.body || "").trim();
      const shareLabel = String(shareBonusW.ctaShare || "").trim();
      const upgradeLabel = String(landing.postPaywallCta || "").trim();
      if (!shareBonusEligible || (!title && !body && !shareLabel && !upgradeLabel)) return ``;
      return `
        <div class="wt-box wt-box--tinted wt-share-bonus-offer">
          ${title ? `<div class="wt-meta wt-meta--strong">${escapeHtml(title)}</div>` : ``}
          ${body ? `<p class="wt-muted wt-copy-follow">${escapeHtml(body)}</p>` : ``}
          ${(shareLabel || upgradeLabel) ? `
            <div class="wt-actions wt-actions--compact">
              ${shareLabel ? `
                <button class="wt-btn wt-btn--primary" data-action="claim-share-bonus">
                  ${escapeHtml(shareLabel)}
                </button>
              ` : ``}
              ${upgradeLabel ? `
                <button class="wt-btn wt-btn--ghost" data-action="open-paywall">
                  ${escapeHtml(upgradeLabel)}
                </button>
              ` : ``}
            </div>
          ` : ``}
        </div>
      `;
    })()}

    ${postBlock}

    ${postCompletionHtml}

    ${showLandingInstallPrompt ? `
      <p class="wt-sub wt-muted wt-landing-trust">${escapeHtml(microTrust)}</p>
      ${installCtaLabel ? `
        <div class="wt-actions wt-actions--stack">
          <button class="wt-btn wt-btn--secondary" data-action="install-app">
            ${escapeHtml(installCtaLabel)}
          </button>
        </div>
      ` : ``}
    ` : ``}

    ${hasDashboard ? `
      <section class="wt-landing-dashboard">
        ${welcomeBackHtml ? `
          <div class="wt-landing-dashboard__summary">
            ${welcomeBackHtml}
          </div>
        ` : ``}
        ${(!welcomeBackHtml && levelProgressQuickHtml) ? levelProgressQuickHtml : ``}
        <div class="wt-landing-dashboard__grid${dashboardGridClass}">
          ${primaryInsightHtml ? `<div class="wt-landing-dashboard__spotlight">${primaryInsightHtml}</div>` : ``}
          ${secondaryInsightHtml ? `<div class="wt-landing-dashboard__secondary">${secondaryInsightHtml}</div>` : ``}
        </div>
      </section>
    ` : ``}

    ${hasLeaderboardSection ? `
      <section class="wt-landing-leaderboard-section">
        ${leaderboardLandingHtml}
      </section>
    ` : ``}

</div>
`;
  }

  window.WT_UI_Landing = { render };
})();

/* ===== ui-share.js ===== */
// ui-share.js
// Extracted from ui.js to keep sharing flows isolated from the core UI shell.

(() => {
  "use strict";

  function getShareText(ui, helpers) {
    const { clampInt } = helpers || {};
    if (typeof clampInt !== "function") {
      throw new Error("WT_UI_Share helpers missing");
    }

    const cfg = ui.config || {};
    const shareCfg = cfg.share || {};
    if (!shareCfg.enabled) return "";

    const w = ui.wording || {};
    const share = w.share || {};

    function pickTemplate(templates, seed) {
      const list = Array.isArray(templates) ? templates.map((x) => String(x || "").trim()).filter(Boolean) : [];
      if (!list.length) return "";
      const safeSeed = Math.abs(Number(seed || 0));
      const idx = Number.isFinite(safeSeed) ? (safeSeed % list.length) : 0;
      return list[idx] || "";
    }

    const identity = cfg.identity || {};
    const appName = String(identity.appName || "").trim();
    let url = String(identity.appUrl || "").trim();
    try {
      const locale = window.WT_I18N && typeof window.WT_I18N.getLocale === "function"
        ? String(window.WT_I18N.getLocale() || "").trim()
        : "";
      const localizedUrls = (identity && typeof identity.appUrlsByLocale === "object")
        ? identity.appUrlsByLocale
        : null;
      const localizedUrl = localizedUrls && locale
        ? String(localizedUrls[locale] || "").trim()
        : "";
      if (localizedUrl) {
        url = localizedUrl;
      }
      if (url && locale) {
        const shareUrl = new URL(url);
        if (!localizedUrl) {
          shareUrl.searchParams.set("lang", locale);
        }
        url = shareUrl.toString();
      }
    } catch (_) { /* silent */ }

    const poolSize = clampInt(cfg?.game?.poolSize, 1, 9999);
    const maxChances = clampInt(cfg?.game?.maxChances, 1, 99);
    const lastRun = (ui._runtime && ui._runtime.lastRun) ? ui._runtime.lastRun : {};

    const scoreFP = clampInt(lastRun.scoreFP, 0, 99999);
    const bestScoreFP = clampInt(lastRun.bestScoreFP, 0, 99999);
    const scoreChallengeTpl = (bestScoreFP > 10)
      ? String(share.scoreChallengeWithBest || "").trim()
      : String(share.scoreChallengeWithoutBest || "").trim();
    const scoreChallenge = scoreChallengeTpl
      .replaceAll("{score}", String(scoreFP))
      .replaceAll("{bestScore}", String(bestScoreFP));

    let funFact = "";
    try {
      const items = Array.isArray(ui._runtime?.contentItems) ? ui._runtime.contentItems : [];
      const allIds = Array.isArray(lastRun.runItemIds) ? lastRun.runItemIds : [];

      if (items.length > 0 && allIds.length > 0) {
        const mistakeIds = Array.isArray(lastRun.mistakeIds) ? lastRun.mistakeIds : [];
        const findItem = (id) => items.find((x) => Number(x?.id) === Number(id)) || null;

        let pick = null;
        if (mistakeIds.length > 0) {
          pick = findItem(mistakeIds[mistakeIds.length - 1]);
        }

        if (!pick) {
          for (let i = allIds.length - 1; i >= 0; i--) {
            const it = findItem(allIds[i]);
            if (it && it.correctAnswer === false) { pick = it; break; }
          }
        }

        if (!pick) {
          pick = findItem(allIds[allIds.length - 1]);
        }

        if (pick) {
          const questionText = String(pick.question || "").trim();
          const isTrap = (pick.correctAnswer === false);

          if (questionText) {
            const tpls = isTrap
              ? (Array.isArray(share.funFactTemplatesTrap) ? share.funFactTemplatesTrap : [])
              : (Array.isArray(share.funFactTemplatesTrue) ? share.funFactTemplatesTrue : []);
            const tpl = pickTemplate(tpls, Number(pick?.id || 0) + scoreFP);

            if (tpl) {
              funFact = tpl.replaceAll("{question}", questionText);
            }
          }
        }
      }
    } catch (_) {
      funFact = "";
    }

    const template = String(share.template || "").trim();
    if (!template) return "";

    const text = template
      .replaceAll("{appName}", appName)
      .replaceAll("{url}", url)
      .replaceAll("{poolSize}", String(poolSize))
      .replaceAll("{maxChances}", String(maxChances))
      .replaceAll("{score}", String(scoreFP))
      .replaceAll("{bestScore}", String(bestScoreFP))
      .replaceAll("{scoreChallenge}", scoreChallenge)
      .replaceAll("{funFact}", funFact);

    ui._runtime = ui._runtime || {};
    ui._runtime.lastShareText = text;

    return text;
  }

  async function copy(ui, helpers) {
    const { clampInt, toastNow } = helpers || {};
    if (typeof clampInt !== "function" || typeof toastNow !== "function") {
      throw new Error("WT_UI_Share helpers missing");
    }

    const text = String(getShareText(ui, helpers) || "").trim();
    if (!text) return;

    const w = ui.wording || {};
    const share = w.share || {};

    try {
      await navigator.clipboard.writeText(text);
      if (ui.storage && typeof ui.storage.markShareClicked === "function") {
        ui.storage.markShareClicked();
      }
      const okMsg = String(share.toastCopied || "").trim();
      if (okMsg) toastNow(ui.config, okMsg);
    } catch (_) {
      toastNow(ui.config, String(w.system?.copyFailed || "").trim());
    }
  }

  function sendEmail(ui, helpers) {
    const { clampInt } = helpers || {};
    if (typeof clampInt !== "function") {
      throw new Error("WT_UI_Share helpers missing");
    }

    const w = ui.wording || {};
    const share = w.share || {};
    const subjectRaw = String(share.emailSubject || "").trim();
    if (!subjectRaw) return;

    const text = String(getShareText(ui, helpers) || "").trim();
    if (!text) return;

    const subject = encodeURIComponent(subjectRaw);
    const body = encodeURIComponent(text);

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  window.WT_UI_Share = {
    getShareText,
    copy,
    sendEmail
  };
})();

/* ===== ui-install.js ===== */
// ui-install.js
// Extracted from ui.js to keep install prompt flows isolated from the core UI shell.

(() => {
  "use strict";

  function openModal(ui, helpers) {
    const { escapeHtml } = helpers || {};
    if (typeof escapeHtml !== "function") {
      throw new Error("WT_UI_Install helpers missing");
    }

    const ip = ui.wording?.installPrompt || {};
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent || "");
    const title = String(ip.title || "").trim();
    const body = String((isIOS ? ip.bodyIOS : ip.body) || "").trim();
    const ctaPrimary = String((isIOS ? ip.ctaPrimaryIOS : ip.ctaPrimary) || "").trim();
    const ctaSecondary = String(ip.ctaSecondary || ui.wording?.system?.close || "").trim();
    const primaryAction = isIOS ? "dismiss-install-prompt" : "install-app-now";

    if (!title || !body || !ctaPrimary) return false;

    const html = `
      <p class="wt-text-preline">${escapeHtml(body)}</p>
      <div class="wt-actions wt-modal-actions">
        <button class="wt-btn wt-btn--primary" data-action="${primaryAction}">${escapeHtml(ctaPrimary)}</button>
        <button class="wt-btn wt-btn--ghost" data-action="close-modal">${escapeHtml(ctaSecondary)}</button>
      </div>
    `;

    ui.openModal(html, title);

    return true;
  }

  function canShow(ui) {
    const cfg = ui.config || {};
    const storage = ui.storage;
    const pwa = window.WT_PWA || null;

    if (!storage || !pwa || typeof pwa.canPrompt !== "function") return false;

    const counters = (typeof storage.getCounters === "function") ? (storage.getCounters() || {}) : {};
    const shown = Number(counters.installPromptShown || 0);
    if (Number.isFinite(shown) && shown > 0) return false;

    const modalOpen = !!(ui.modalEl && !ui.modalEl.classList.contains("wt-hidden"));
    if (modalOpen) return false;

    if (pwa.canPrompt(cfg, storage) !== true) return false;

    return true;
  }

  function prompt(ui, helpers) {
    if (!helpers || typeof helpers.escapeHtml !== "function") {
      throw new Error("WT_UI_Install helpers missing");
    }

    const pwa = window.WT_PWA || null;
    if (!pwa || typeof pwa.promptInstall !== "function") return;

    try {
      if (ui.storage && typeof ui.storage.markInstallPromptShown === "function") {
        ui.storage.markInstallPromptShown();
      }
    } catch (_) { /* silent */ }

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent || "");
    if (isIOS) {
      openModal(ui, helpers);
      return;
    }

    pwa.promptInstall(ui.storage)
      .then(() => {
        try { ui.render(); } catch (_) { /* silent */ }
      })
      .catch(() => { /* silent */ });
  }

  window.WT_UI_Install = {
    openModal,
    canShow,
    prompt
  };
})();

/* ===== ui-support.js ===== */
// ui-support.js
// Extracted from ui.js to keep support and waitlist flows isolated from the core UI shell.

(() => {
  "use strict";

  function openSupport(ui, helpers) {
    const { escapeHtml, toastNow } = helpers || {};
    if (typeof escapeHtml !== "function" || typeof toastNow !== "function") {
      throw new Error("WT_UI_Support helpers missing");
    }

    const w = ui.wording || {};
    const support = w.support || {};
    const email = String(window.WT_Email?.getSupportEmailDecoded?.() || "").trim();
    if (!email) {
      const msg = String(ui.wording?.system?.copyFailed || "").trim();
      if (msg) toastNow(ui.config, msg);
      return;
    }

    const html = `
    <p>${escapeHtml(String(support.modalBodyLine1 || "").trim())}</p>
    <p class="wt-muted">${escapeHtml(String(support.modalBodyLine2 || "").trim())}</p>

    <div class="wt-divider"></div>

    <div class="wt-actions wt-actions--compact">
      <button class="wt-btn wt-btn--secondary" data-action="open-support-email-bug">${escapeHtml(String(support.ctaBug || "").trim())}</button>
      <button class="wt-btn wt-btn--secondary" data-action="open-support-email-question">${escapeHtml(String(support.ctaQuestion || "").trim())}</button>
      <button class="wt-btn wt-btn--secondary" data-action="open-support-email-idea">${escapeHtml(String(support.ctaIdea || "").trim())}</button>
    </div>

    <div class="wt-divider"></div>

    <div class="wt-actions">
      <button class="wt-btn wt-btn--secondary" data-action="copy-support-email">${escapeHtml(String(support.ctaCopy || "").trim())}</button>
      <button class="wt-btn wt-btn--primary" data-action="open-support-email">${escapeHtml(String(support.ctaOpen || "").trim())}</button>
    </div>
  `;

    ui.openModal(html, String(support.modalTitle || "").trim());
  }

  async function copySupportEmail(ui, helpers) {
    const { toastNow } = helpers || {};
    if (typeof toastNow !== "function") {
      throw new Error("WT_UI_Support helpers missing");
    }

    const email = String(window.WT_Email?.getSupportEmailDecoded?.() || "").trim();
    if (!email) return;

    try {
      await navigator.clipboard.writeText(email);
      toastNow(ui.config, String(ui.wording?.system?.copied || "").trim());
    } catch (_) {
      toastNow(ui.config, String(ui.wording?.system?.copyFailed || "").trim());
    }
  }

  function openSupportEmail(ui, kind) {
    const email = String(window.WT_Email?.getSupportEmailDecoded?.() || "").trim();
    if (!email) return;

    const cfg = ui.config || {};
    const prefix = String(cfg?.support?.subjectPrefix || "").trim();

    const w = ui.wording || {};
    const support = w.support || {};
    const mode = String(kind || "").trim().toLowerCase();
    let suffix = String(support.emailSubjectSuffix || "").trim();
    let bodyTemplate = String(support.emailBodyTemplate || "").trim();

    if (mode === "bug") {
      suffix = String(support.bugSubjectSuffix || suffix).trim();
      bodyTemplate = String(support.bugBodyTemplate || bodyTemplate).trim();
    } else if (mode === "question") {
      suffix = String(support.questionSubjectSuffix || suffix).trim();
      bodyTemplate = String(support.questionBodyTemplate || bodyTemplate).trim();
    } else if (mode === "idea") {
      suffix = String(support.ideaSubjectSuffix || suffix).trim();
      bodyTemplate = String(support.ideaBodyTemplate || bodyTemplate).trim();
    }

    if (window.WT_Email && typeof window.WT_Email.openSupportEmail === "function") {
      window.WT_Email.openSupportEmail({
        subjectPrefix: prefix,
        subjectSuffix: suffix,
        bodyTemplate
      });
    }

    ui.closeModal();
  }

  function openWaitlist(ui, helpers) {
    const { escapeHtml } = helpers || {};
    if (typeof escapeHtml !== "function") {
      throw new Error("WT_UI_Support helpers missing");
    }

    const cfg = ui.config || {};
    const wlCfg = cfg.waitlist || {};
    if (wlCfg.enabled !== true) return;

    const w = ui.wording || {};
    const wl = w.waitlist || {};

    const title = String(wl.title || "").trim();
    const body1 = String(wl.bodyLine1 || "").trim();
    const body2 = String(wl.bodyLine2 || "").trim();
    const label = String(wl.inputLabel || wl.inputPlaceholder || "").trim();
    const placeholder = String(wl.inputPlaceholder || "").trim();
    const cta = String(wl.cta || "").trim();

    const toEmail = String(window.WT_Email?.getWaitlistEmailDecoded?.() || "").trim();
    if (!toEmail) return;

    try {
      if (ui.storage && typeof ui.storage.getWaitlistStatus === "function" && typeof ui.storage.setWaitlistStatus === "function") {
        const st = String(ui.storage.getWaitlistStatus() || "").trim();
        if (st === "not_seen") ui.storage.setWaitlistStatus("seen");
      }
    } catch (_) { /* silent */ }

    const phAttr = placeholder ? ` placeholder="${escapeHtml(placeholder)}"` : "";

    const html = `
      ${body1 ? `<p>${escapeHtml(body1)}</p>` : ``}
      ${body2 ? `<p class="wt-muted">${escapeHtml(body2)}</p>` : ``}

      <div class="wt-divider"></div>

      <label class="wt-label" for="wt-waitlist-idea">${escapeHtml(label)}</label>
      <textarea id="wt-waitlist-idea" class="wt-input" rows="3"${phAttr}></textarea>

      <div class="wt-actions wt-modal-actions">
        <button class="wt-btn wt-btn--primary" data-action="send-waitlist-email">${escapeHtml(cta)}</button>
        <button class="wt-btn wt-btn--ghost" data-action="close-modal">${escapeHtml(String(ui.wording?.system?.close || "").trim())}</button>
      </div>
    `;

    ui.openModal(html, title);

    try {
      const input = ui.modalContentEl ? ui.modalContentEl.querySelector("#wt-waitlist-idea") : null;

      if (input && ui.storage && typeof ui.storage.getWaitlistDraftIdea === "function") {
        const draft = String(ui.storage.getWaitlistDraftIdea() || "").trim();
        if (draft) input.value = draft;
      }

      if (input && ui.storage && typeof ui.storage.setWaitlistDraftIdea === "function") {
        input.addEventListener("input", () => {
          try { ui.storage.setWaitlistDraftIdea(String(input.value || "")); } catch (_) { /* silent */ }
        });
      }
    } catch (_) { /* silent */ }
  }

  function sendWaitlist(ui, helpers) {
    const { toastNow } = helpers || {};
    if (typeof toastNow !== "function") {
      throw new Error("WT_UI_Support helpers missing");
    }

    const cfg = ui.config || {};
    const wlCfg = cfg.waitlist || {};
    if (wlCfg.enabled !== true) return;

    const w = ui.wording || {};
    const wl = w.waitlist || {};
    const toEmail = String(window.WT_Email?.getWaitlistEmailDecoded?.() || "").trim();
    if (!toEmail) {
      const msg = String(wl.emailUnavailableToast || "").trim();
      if (msg) toastNow(ui.config, msg);
      return;
    }

    const prefix = String(wlCfg.subjectPrefix || "").trim();
    if (!prefix) return;
    const suffix = String(wl.emailSubjectSuffix || "").trim();

    const subjectText = suffix ? `${prefix} ${suffix}`.trim() : prefix;
    const subject = encodeURIComponent(subjectText);

    const input = ui.modalContentEl ? ui.modalContentEl.querySelector("#wt-waitlist-idea") : null;
    const idea = String(input && input.value ? input.value : "").trim();

    const tpl = String(wl.emailBodyTemplate || "").trim();
    const bodyText = tpl ? tpl.replaceAll("{idea}", idea) : idea;
    const body = encodeURIComponent(bodyText ? bodyText : "");

    try {
      if (ui.storage && typeof ui.storage.setWaitlistStatus === "function") {
        ui.storage.setWaitlistStatus("opted_in");
      }
      if (ui.storage && typeof ui.storage.setWaitlistDraftIdea === "function") {
        ui.storage.setWaitlistDraftIdea("");
      }
    } catch (_) { /* silent */ }

    window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
    ui.closeModal();
  }

  window.WT_UI_Support = {
    openSupport,
    copySupportEmail,
    openSupportEmail,
    openWaitlist,
    sendWaitlist
  };
})();

/* ===== ui-stats-sharing.js ===== */
// ui-stats-sharing.js
// Extracted from ui.js to keep stats-sharing flows isolated from the core UI shell.

(() => {
  "use strict";

  const MAILTO_BODY_LIMIT = 1800;
  const PROMPT_FLAGS = Object.freeze({
    THRESHOLD_30: 1,
    THRESHOLD_50: 2,
    LAST_FREE: 4,
    POWER_USER: 8
  });

  function getPayload(ui) {
    const storage = ui.storage;
    if (!storage || typeof storage.getAnonymousStatsPayload !== "function") return null;

    let base = null;
    try { base = storage.getAnonymousStatsPayload(); } catch (_) { base = null; }
    if (!base || typeof base !== "object") return null;

    let payload = null;
    try { payload = JSON.parse(JSON.stringify(base)); } catch (_) { payload = null; }
    if (!payload || typeof payload !== "object") return null;

    const byId = (ui._runtime && ui._runtime.contentById) ? ui._runtime.contentById : Object.create(null);

    if (Array.isArray(payload.topMistakes)) {
      payload.topMistakes = payload.topMistakes.map((m) => {
        const idNum = Number(m && m.id);
        const idKey = String(Number.isFinite(idNum) ? idNum : (m && m.id != null ? m.id : "")).trim();
        const it = idKey ? byId[idKey] : null;
        const questionText = String(it && it.question || "").trim();

        return {
          id: Number.isFinite(idNum) ? idNum : m && m.id,
          wrongCount: m && m.wrongCount,
          question: questionText
        };
      });
    }

    return payload;
  }

  function openModal(ui, helpers) {
    const { escapeHtml, toastNow } = helpers || {};
    if (typeof escapeHtml !== "function" || typeof toastNow !== "function") {
      throw new Error("WT_UI_StatsSharing helpers missing");
    }

    const w = ui.wording || {};
    const ss = w.statsSharing || {};
    const cfg = ui.config || {};

    if (!cfg.statsSharing?.enabled) return;

    const payload = getPayload(ui);
    if (!payload) {
      const msg = String(ss.noStatsToast || "").trim();
      if (msg) toastNow(ui.config, msg);
      return;
    }

    const jsonStr = JSON.stringify(payload, null, 2);
    const html = `
      <p class="wt-text-preline">${escapeHtml(String(ss.modalDescription || "").trim())}</p>

      <div class="wt-divider"></div>

      <strong class="wt-meta">${escapeHtml(String(ss.previewLabel || "").trim())}</strong>
      <pre class="wt-code wt-code--modal">${escapeHtml(jsonStr)}</pre>

      <div class="wt-actions wt-actions--feedback wt-modal-actions wt-modal-actions--lg">
        <button class="wt-btn wt-btn--primary" data-action="send-stats-email">${escapeHtml(String(ss.ctaSend || "").trim())}</button>
        <button class="wt-btn wt-btn--secondary" data-action="copy-stats">${escapeHtml(String(ss.ctaCopy || "").trim())}</button>
        <button class="wt-btn wt-btn--ghost" data-action="snooze-stats">${escapeHtml(String(ss.ctaLater || "").trim())}</button>
        <button class="wt-btn wt-btn--ghost" data-action="close-modal">${escapeHtml(String(ss.ctaCancel || "").trim())}</button>
      </div>
    `;

    ui.openModal(html, String(ss.modalTitle || "").trim());
  }

  async function sendEmail(ui, helpers) {
    const { toastNow } = helpers || {};
    if (typeof toastNow !== "function") {
      throw new Error("WT_UI_StatsSharing helpers missing");
    }

    const cfg = ui.config || {};
    const w = ui.wording || {};
    const ss = w.statsSharing || {};
    const email = String(window.WT_Email?.getSupportEmailDecoded?.() || "").trim();
    if (!email) return;

    const subject = encodeURIComponent(String(cfg?.statsSharing?.emailSubject || "").trim());
    const payload = getPayload(ui);
    if (!payload) return;

    const jsonStr = JSON.stringify(payload, null, 2);
    const body = encodeURIComponent(jsonStr);

    if (body.length > MAILTO_BODY_LIMIT) {
      try {
        await navigator.clipboard.writeText(jsonStr);
        const msg = String(ss.mailtoFallbackToast || ss.copyToast || "").trim();
        if (msg) toastNow(ui.config, msg, { variant: "info" });
      } catch (_) {
        const failMsg = String(w.system?.copyFailed || "").trim();
        if (failMsg) toastNow(ui.config, failMsg);
      }
      window.location.href = `mailto:${email}?subject=${subject}`;
      ui.closeModal();
      return;
    }

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    ui.closeModal();
  }

  async function copy(ui, helpers) {
    const { toastNow } = helpers || {};
    if (typeof toastNow !== "function") {
      throw new Error("WT_UI_StatsSharing helpers missing");
    }

    const w = ui.wording || {};
    const ss = w.statsSharing || {};
    const payload = getPayload(ui);
    if (!payload) return;

    const jsonStr = JSON.stringify(payload, null, 2);
    try {
      await navigator.clipboard.writeText(jsonStr);
      toastNow(ui.config, String(ss.copyToast || "").trim());
    } catch (_) {
      toastNow(ui.config, String(w.system?.copyFailed || "").trim());
    }
  }

  function maybePrompt(ui, helpers) {
    const {
      clampInt,
      isPremiumNow,
      getStatsSharingPromptFlags,
      getStatsSharingSnoozeUntilRunCompletes,
      markStatsSharingPromptFlag
    } = helpers || {};

    if (
      typeof clampInt !== "function" ||
      typeof isPremiumNow !== "function" ||
      typeof getStatsSharingPromptFlags !== "function" ||
      typeof getStatsSharingSnoozeUntilRunCompletes !== "function" ||
      typeof markStatsSharingPromptFlag !== "function"
    ) {
      throw new Error("WT_UI_StatsSharing helpers missing");
    }

    const cfg = ui.config || {};
    const ssCfg = cfg.statsSharing || {};
    if (ssCfg.enabled !== true) return;

    const storage = ui.storage;
    if (!storage) return;

    let stats = null;
    try {
      stats = (typeof storage.getAnonymousStatsPayload === "function") ? storage.getAnonymousStatsPayload() : null;
    } catch (_) {
      stats = null;
    }
    if (!stats) return;

    const runCompletes = clampInt(Number(stats.runs), 0, 999999);

    try {
      const snoozeUntil = getStatsSharingSnoozeUntilRunCompletes(storage);
      if (Number.isFinite(snoozeUntil) && snoozeUntil > runCompletes) return;
    } catch (_) { /* silent */ }

    if (ssCfg.afterPoolExhaustedOnly === true) {
      if (typeof storage.hasSeenAllWordTraps !== "function" || storage.hasSeenAllWordTraps() !== true) return;
    }

    const thresholds = Array.isArray(ssCfg.promptThresholdsPct) ? ssCfg.promptThresholdsPct.slice() : [];
    const pct30 = Number(thresholds[0]);
    const pct50 = Number(thresholds[1]);

    const poolProgress = Number(stats.poolProgress);
    if (!Number.isFinite(poolProgress)) return;

    const uniquePct = Math.floor(poolProgress * 100);
    const uniqueSeen = Number(stats.uniqueSeen);
    const isPremium = isPremiumNow(storage);
    const runsBalance = (typeof storage.getRunsBalance === "function") ? clampInt(storage.getRunsBalance(), 0, 999999) : 0;

    const powerUnique = Number(ssCfg.powerUserUniqueSeen);
    const powerRuns = Number(ssCfg.powerUserRunCompletes);
    const powerEligible =
      (Number.isFinite(uniqueSeen) && Number.isFinite(powerUnique) && uniqueSeen >= powerUnique) ||
      (Number.isFinite(powerRuns) && runCompletes >= powerRuns);

    const lastFreeEligible =
      (ssCfg.promptOnFreeRunsExhausted === true) &&
      (isPremium !== true) &&
      (runsBalance === 0);

    const flags = clampInt(getStatsSharingPromptFlags(storage), 0, 2147483647);
    let chosenBit = 0;

    if (lastFreeEligible && (flags & PROMPT_FLAGS.LAST_FREE) === 0) {
      chosenBit = PROMPT_FLAGS.LAST_FREE;
    } else if (Number.isFinite(pct50) && uniquePct >= pct50 && (flags & PROMPT_FLAGS.THRESHOLD_50) === 0) {
      chosenBit = PROMPT_FLAGS.THRESHOLD_50;
    } else if (Number.isFinite(pct30) && uniquePct >= pct30 && (flags & PROMPT_FLAGS.THRESHOLD_30) === 0) {
      chosenBit = PROMPT_FLAGS.THRESHOLD_30;
    } else if (powerEligible && (flags & PROMPT_FLAGS.POWER_USER) === 0) {
      chosenBit = PROMPT_FLAGS.POWER_USER;
    }

    if (!chosenBit) return;

    markStatsSharingPromptFlag(storage, chosenBit);
    try {
      if (ui._runtime) ui._runtime._statsSharingLastPromptFlagBit = chosenBit;
    } catch (_) { /* silent */ }

    openModal(ui, { escapeHtml: helpers.escapeHtml, toastNow: helpers.toastNow });
  }

  window.WT_UI_StatsSharing = {
    PROMPT_FLAGS,
    getPayload,
    openModal,
    sendEmail,
    copy,
    maybePrompt
  };
})();

/* ===== ui-checkout.js ===== */
// ui-checkout.js
// Extracted from ui.js to keep checkout and paywall timer flows isolated from the core UI shell.

(() => {
  "use strict";

  function startPaywallTicker(ui, helpers) {
    const {
      syncScopedRenderTicker,
      shouldRefreshPaywallTimer,
      isEarlyPriceWindowActive
    } = helpers || {};

    if (
      typeof syncScopedRenderTicker !== "function" ||
      typeof shouldRefreshPaywallTimer !== "function" ||
      typeof isEarlyPriceWindowActive !== "function"
    ) {
      throw new Error("WT_UI_Checkout helpers missing");
    }

    const ms = Number(ui.config?.ui?.paywallTickerMs);
    if (!Number.isFinite(ms) || ms < 200 || ms > 2000) return;

    stopPaywallTicker(ui, helpers);

    ui._paywallTickerId = syncScopedRenderTicker(ui, {
      key: "paywall.ticker",
      scope: "paywall",
      shouldRun: shouldRefreshPaywallTimer,
      shouldContinueAfterRender: (candidateUi) =>
        shouldRefreshPaywallTimer(candidateUi) && isEarlyPriceWindowActive(candidateUi.storage),
      getDelayMs: () => Math.floor(ms),
      onStop: (candidateUi) => {
        if (candidateUi) candidateUi._paywallTickerId = null;
      }
    });
  }

  function stopPaywallTicker(ui, helpers) {
    const { clearUiTimer } = helpers || {};
    if (typeof clearUiTimer !== "function") {
      throw new Error("WT_UI_Checkout helpers missing");
    }

    clearUiTimer("paywall.ticker");
    ui._paywallTickerId = null;
  }

  function checkout(ui, priceKey, event, helpers) {
    const { isOnline, toastNow } = helpers || {};
    if (typeof isOnline !== "function" || typeof toastNow !== "function") {
      throw new Error("WT_UI_Checkout helpers missing");
    }

    if (!isOnline()) {
      const msg = String(ui.wording?.system?.offlinePayment || "").trim();
      if (msg) toastNow(ui.config, msg);
      return;
    }

    if (ui.storage && typeof ui.storage.markCheckoutStarted === "function") {
      ui.storage.markCheckoutStarted(priceKey);
    }

    const cfg = ui.config || {};
    const key = String(priceKey || "").toUpperCase();
    const url = (key === "EARLY")
      ? String(cfg.stripeEarlyPaymentUrl || "").trim()
      : String(cfg.stripeStandardPaymentUrl || "").trim();

    const sourceBtn = (event && event.target && event.target.closest)
      ? event.target.closest("button[data-action], a[data-action]")
      : null;

    const redirectLabel = String(ui.wording?.paywall?.checkoutRedirecting || "").trim();
    const previousLabel = sourceBtn ? String(sourceBtn.textContent || "").trim() : "";

    const resetCheckoutButton = () => {
      if (!sourceBtn) return;
      sourceBtn.disabled = false;
      sourceBtn.removeAttribute("aria-busy");
      if (previousLabel) sourceBtn.textContent = previousLabel;
    };

    if (!url) {
      resetCheckoutButton();
      return;
    }

    try {
      const urlObj = new URL(url);
      const allowedHosts = ["buy.stripe.com", "checkout.stripe.com"];
      if (!allowedHosts.includes(urlObj.hostname)) {
        console.error("[WT Security] Invalid Stripe URL hostname:", urlObj.hostname);
        resetCheckoutButton();
        return;
      }
    } catch (_) {
      console.error("[WT Security] Invalid Stripe URL:", url);
      resetCheckoutButton();
      return;
    }

    if (sourceBtn) {
      sourceBtn.disabled = true;
      sourceBtn.setAttribute("aria-busy", "true");
      if (redirectLabel) sourceBtn.textContent = redirectLabel;
    }

    try {
      if (
        window.WT_Analytics &&
        typeof window.WT_Analytics.trackFunnel === "function" &&
        typeof window.WT_Analytics.inferUiContext === "function"
      ) {
        window.WT_Analytics.trackFunnel(
          "checkout_click",
          window.WT_Analytics.inferUiContext(ui, { price_key: key })
        );
      }
    } catch (_) { /* silent */ }

    window.location.href = url;
  }

  function applyUpdateToast(ui, helpers) {
    const { el } = helpers || {};
    if (typeof el !== "function") {
      throw new Error("WT_UI_Checkout helpers missing");
    }

    const node = el("update-toast");
    try {
      if (window.Logger && typeof window.Logger.log === "function") {
        window.Logger.log("[UPDATE] applyUpdateToast", {
          hasNode: !!node,
          ready: window.__WT_SW_UPDATE_READY__ === true,
          inFlight: window.__WT_SW_UPDATE_IN_FLIGHT__ === true
        });
      }
    } catch (_) { /* silent */ }

    if (!node) return;

    if (window.__WT_SW_UPDATE_READY__ === true) {
      if (typeof window.__WT_APPLY_SW_UPDATE__ === "function") {
        window.__WT_APPLY_SW_UPDATE__();
      } else {
        location.reload();
      }
      return;
    }

    node.classList.remove("wt-toast--visible");
  }

  window.WT_UI_Checkout = {
    startPaywallTicker,
    stopPaywallTicker,
    checkout,
    applyUpdateToast
  };
})();

/* ===== ui-growth.js ===== */
// ui-growth.js
// Extracted from ui.js to keep growth and secondary progression prompts isolated from the core UI shell.

(() => {
  "use strict";

  function openPoolComplete(ui, helpers) {
    const { escapeHtml, fillTemplate, clampInt } = helpers || {};
    if (
      typeof escapeHtml !== "function" ||
      typeof fillTemplate !== "function" ||
      typeof clampInt !== "function"
    ) {
      throw new Error("WT_UI_Growth helpers missing");
    }

    const w = ui.wording || {};
    const end = w.end || {};
    const sys = w.system || {};
    const lastRun = (ui._runtime && ui._runtime.lastRun) ? ui._runtime.lastRun : {};

    const title = String(end.poolCompleteTitle || "").trim();
    const line1 = String(end.poolCompleteLine1 || "").trim();
    const line2 = String(end.poolCompleteLine2 || "").trim();
    const scoreLineTpl = String(end.poolCompleteScoreLine || "").trim();
    const cta = String(sys.continue || "").trim();

    if (!title || !cta) return;

    const scoreLine = scoreLineTpl
      ? fillTemplate(scoreLineTpl, {
          score: String(clampInt(Number(lastRun.scoreFP), 0, 99999)),
          fpShort: ""
        })
      : "";

    const html = `
      ${scoreLine ? `<p class="wt-hero-kpi--modal">${escapeHtml(scoreLine)}</p>` : ``}
      ${line1 ? `<p>${escapeHtml(line1)}</p>` : ``}
      ${line2 ? `<p class="wt-muted">${escapeHtml(line2)}</p>` : ``}

      <div class="wt-divider"></div>

      <div class="wt-actions wt-modal-actions">
        <button class="wt-btn wt-btn--primary" data-action="close-modal">${escapeHtml(cta)}</button>
      </div>
    `;

    ui.openModal(html, title);
  }

  function openMilestone(ui, milestoneKey, helpers) {
    const { escapeHtml } = helpers || {};
    if (typeof escapeHtml !== "function") {
      throw new Error("WT_UI_Growth helpers missing");
    }

    const w = ui.wording || {};
    const ms = w.milestones || {};
    const block = (milestoneKey && typeof ms === "object") ? (ms[milestoneKey] || {}) : {};

    const title = String(block.title || "").trim();
    const lines = Array.isArray(block.bodyLines) ? block.bodyLines : [];
    const cta = String(block.cta || "").trim();

    if (!title || !cta) return;

    try {
      const markByKey = {
        quarter: "markQuarterMilestoneShown",
        halfway: "markHalfwayMilestoneShown",
        threeQuarters: "markThreeQuartersMilestoneShown"
      };
      const fnName = markByKey[String(milestoneKey || "").trim()] || "";
      if (fnName && ui.storage && typeof ui.storage[fnName] === "function") {
        ui.storage[fnName]();
      }
    } catch (_) { /* silent */ }

    const bodyHtml = lines
      .map((s) => String(s || "").trim())
      .filter(Boolean)
      .map((line) => `<p>${escapeHtml(line)}</p>`)
      .join("");

    const html = `
      ${bodyHtml}

      <div class="wt-divider"></div>

      <div class="wt-actions wt-modal-actions">
        <button class="wt-btn wt-btn--primary" data-action="close-modal">${escapeHtml(cta)}</button>
      </div>
    `;

    ui.openModal(html, title);
  }

  function remindHouseAdLater(ui) {
    if (!ui.storage || typeof ui.storage.hideHouseAdUsingConfig !== "function") return;

    ui.storage.hideHouseAdUsingConfig();
    ui.render();
  }

  function openHouseAd(ui) {
    const cfg = ui.config || {};
    const ha = cfg.houseAd || {};
    const url = String(ha.url || "").trim();
    if (!url) return;

    if (ui.storage && typeof ui.storage.markHouseAdClicked === "function") {
      ui.storage.markHouseAdClicked();
    }

    window.open(url, "_blank", "noopener");
  }

  window.WT_UI_Growth = {
    openPoolComplete,
    openMilestone,
    remindHouseAdLater,
    openHouseAd
  };
})();

/* ===== ui-leaderboard.js ===== */
// ui-leaderboard.js
// Landing-only leaderboard shell.

(() => {
  'use strict';

  const LeaderboardLogic = window.WT_LeaderboardLogic;
  if (!LeaderboardLogic || typeof LeaderboardLogic !== 'object') {
    throw new Error('WT_LeaderboardLogic is required before ui-leaderboard.js');
  }

  const clampInt = LeaderboardLogic.clampInt;

  function getRuntimeBucket(ui) {
    if (!ui || !ui._runtime) return null;
    if (!ui._runtime.leaderboard) {
      ui._runtime.leaderboard = {
        loading: false,
        lastFetchedAt: 0,
        error: '',
        source: '',
        weekly: [],
        all: [],
        inflight: null
      };
    }
    return ui._runtime.leaderboard;
  }

  function getCfg(ui) {
    const cfg = ui?.config?.leaderboard;
    return cfg && typeof cfg === 'object' ? cfg : {};
  }

  function shouldSubmitScores(ui) {
    const cfg = getCfg(ui);
    return cfg.enabled === true && cfg.submitScores === true;
  }

  function getWording(ui) {
    const w = ui?.wording?.leaderboard;
    return w && typeof w === 'object' ? w : {};
  }

  function compileNicknameRegex(cfg) {
    return LeaderboardLogic.compileNicknameRegex(
      cfg?.nicknameRegexSource,
      cfg?.nicknameRegexFlags
    );
  }

  function getSeedRows(ui, windowType) {
    const cfg = getCfg(ui);
    const raw = cfg?.seedScores?.[windowType];
    return LeaderboardLogic.normalizeRows(raw, clampInt(cfg?.topN, 1, 100));
  }

  function getLocalPlayerRow(ui) {
    const profile =
      ui?.storage && typeof ui.storage.getLeaderboardProfile === 'function'
        ? ui.storage.getLeaderboardProfile()
        : null;
    if (!profile || profile.optIn !== true) return null;

    const pb =
      ui?.storage && typeof ui.storage.getPersonalBest === 'function'
        ? ui.storage.getPersonalBest()
        : null;
    const scoreFP = clampInt(pb?.bestScoreFP, 0, 9999);
    const nickname = String(profile.nickname || '').trim();
    if (!nickname || scoreFP <= 0) return null;

    return {
      nickname,
      scoreFP,
      isLocalPlayer: true
    };
  }


  function getLocalBestScore(ui) {
    const pb =
      ui?.storage && typeof ui.storage.getPersonalBest === 'function'
        ? ui.storage.getPersonalBest()
        : null;
    return clampInt(pb?.bestScoreFP, 0, 9999);
  }

  function buildWindowRows(ui, windowType, remoteRows) {
    const cfg = getCfg(ui);
    const limit = clampInt(cfg?.topN, 1, 100);
    const seedRows = getSeedRows(ui, windowType);
    const localPlayer = getLocalPlayerRow(ui);
    const sourceRows =
      Array.isArray(remoteRows) && remoteRows.length ? remoteRows : seedRows;
    const merged = LeaderboardLogic.mergeLocalPlayer(
      sourceRows,
      localPlayer,
      limit
    );
    return merged.map((row, idx) => ({
      rank: idx + 1,
      nickname: String(row.nickname || '').trim(),
      scoreFP: clampInt(row.scoreFP, 0, 9999),
      isLocalPlayer: row.isLocalPlayer === true
    }));
  }

  function buildFallback(ui, reason) {
    const bucket = getRuntimeBucket(ui);
    if (!bucket) return;

    bucket.source = 'empty';
    bucket.error = String(reason || '').trim();
    bucket.weekly = buildWindowRows(ui, 'weekly', null);
    bucket.all = buildWindowRows(ui, 'all', null);
    bucket.lastFetchedAt = Date.now();
  }

  async function fetchJsonWithTimeout(url, timeoutMs) {
    const controller =
      typeof AbortController !== 'undefined' ? new AbortController() : null;
    let timerId = 0;
    try {
      if (controller && timeoutMs > 0) {
        timerId = window.setTimeout(() => controller.abort(), timeoutMs);
      }
      const res = await fetch(url, {
        method: 'GET',
        headers: { accept: 'application/json' },
        signal: controller ? controller.signal : undefined
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      if (timerId) window.clearTimeout(timerId);
    }
  }

  async function refresh(ui, opts) {
    const bucket = getRuntimeBucket(ui);
    const cfg = getCfg(ui);
    if (!bucket || bucket.loading === true) return bucket?.inflight || null;

    const baseUrl = String(cfg?.apiBaseUrl || '')
      .trim()
      .replace(/\/+$/, '');
    if (!baseUrl) {
      buildFallback(ui, '');
      if (ui?.state === 'LANDING' || ui?.state === 0) {
        try {
          ui.render();
        } catch (_) {
          /* silent */
        }
      }
      return null;
    }

    bucket.loading = true;
    bucket.error = '';

    const timeoutMs = clampInt(cfg?.requestTimeoutMs, 500, 15000);
    const p = Promise.all([
      fetchJsonWithTimeout(`${baseUrl}/leaderboard?window=weekly`, timeoutMs),
      fetchJsonWithTimeout(`${baseUrl}/leaderboard?window=all`, timeoutMs)
    ])
      .then(([weeklyJson, allJson]) => {
        bucket.source = 'remote';
        bucket.error = '';
        bucket.weekly = buildWindowRows(
          ui,
          'weekly',
          LeaderboardLogic.normalizeRows(
            weeklyJson?.top,
            clampInt(cfg?.topN, 1, 100)
          )
        );
        bucket.all = buildWindowRows(
          ui,
          'all',
          LeaderboardLogic.normalizeRows(
            allJson?.top,
            clampInt(cfg?.topN, 1, 100)
          )
        );
        bucket.lastFetchedAt = Date.now();
        rerenderOpenLeaderboardModal(ui);
      })
      .catch((err) => {
        buildFallback(ui, err?.message || 'fetch_failed');
      })
      .finally(() => {
        bucket.loading = false;
        bucket.inflight = null;
        try {
          if (ui?.state === 0 || ui?.state === 'LANDING') ui.render();
        } catch (_) {
          /* silent */
        }
      });

    bucket.inflight = p;
    return p;
  }

  function ensureFresh(ui) {
    const bucket = getRuntimeBucket(ui);
    const cfg = getCfg(ui);
    if (!bucket) return;

    const ttlMs = clampInt(cfg?.cacheTtlMs, 1000, 10 * 60 * 1000);
    const ageMs =
      Date.now() - clampInt(bucket.lastFetchedAt, 0, Number.MAX_SAFE_INTEGER);
    const stale = !bucket.lastFetchedAt || ageMs >= ttlMs;

    if (!bucket.loading && stale) {
      void refresh(ui);
    }
  }


  function getDisplayLocale() {
    try {
      const loc = window.WT_I18N && typeof window.WT_I18N.getLocale === 'function'
        ? String(window.WT_I18N.getLocale() || '').trim().toLowerCase()
        : '';
      if (loc === 'fr') return 'fr-FR';
    } catch (_) {
      /* silent */
    }
    return 'en-US';
  }

  function formatLocalTime(ts) {
    const safeTs = clampInt(ts, 0, Number.MAX_SAFE_INTEGER);
    if (safeTs <= 0) return '';
    try {
      return new Intl.DateTimeFormat(getDisplayLocale(), {
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(safeTs));
    } catch (_) {
      return '';
    }
  }


  function getNextWeeklyResetUtcMs(nowMs) {
    const now = new Date(clampInt(nowMs, 0, Number.MAX_SAFE_INTEGER));
    const day = now.getUTCDay();
    const daysUntilMonday = (8 - day) % 7;
    const reset = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + daysUntilMonday,
      0,
      0,
      0,
      0
    ));
    if (reset.getTime() <= now.getTime()) {
      reset.setUTCDate(reset.getUTCDate() + 7);
    }
    return reset.getTime();
  }

  function formatLocalWeekdayTime(ts) {
    const safeTs = clampInt(ts, 0, Number.MAX_SAFE_INTEGER);
    if (safeTs <= 0) return '';
    try {
      return new Intl.DateTimeFormat(getDisplayLocale(), {
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(safeTs));
    } catch (_) {
      return '';
    }
  }

  function fillTemplate(template, vars) {
    let out = String(template || '');
    const map = vars && typeof vars === 'object' ? vars : {};
    for (const [key, value] of Object.entries(map)) {
      out = out.replaceAll(`{${key}}`, String(value == null ? '' : value));
    }
    return out;
  }

  function getLandingModel(ui) {
    const cfg = getCfg(ui);
    if (cfg.enabled !== true) return null;

    const showAfter = clampInt(cfg?.showAfterRunCompletes, 0, 999);
    const counters =
      ui?.storage && typeof ui.storage.getCounters === 'function'
        ? ui.storage.getCounters()
        : {};
    const runCompletes = clampInt(counters?.runCompletes, 0, 9999);
    if (runCompletes < showAfter) return null;

    const bucket = getRuntimeBucket(ui);
    ensureFresh(ui);

    const previewCount = clampInt(cfg?.cardPreviewCount, 1, 10);
    const profile =
      ui?.storage && typeof ui.storage.getLeaderboardProfile === 'function'
        ? ui.storage.getLeaderboardProfile()
        : { nickname: '', optIn: false };

    const ttlMs = clampInt(cfg?.cacheTtlMs, 1000, 10 * 60 * 1000);
    const lastFetchedAt = clampInt(bucket?.lastFetchedAt, 0, Number.MAX_SAFE_INTEGER);
    const nextRefreshAt = lastFetchedAt > 0 ? lastFetchedAt + ttlMs : 0;

    return {
      loading:
        bucket?.loading === true &&
        (!Array.isArray(bucket?.weekly) || bucket.weekly.length === 0),
      error: String(bucket?.error || '').trim(),
      source: String(bucket?.source || '').trim(),
      rows: Array.isArray(bucket?.weekly)
        ? bucket.weekly.slice(0, previewCount)
        : [],
      hasRows: Array.isArray(bucket?.weekly) && bucket.weekly.length > 0,
      hasProfile:
        profile?.optIn === true && !!String(profile?.nickname || '').trim(),
      nickname: String(profile?.nickname || '').trim(),
      bestScoreFP: getLocalBestScore(ui),
      lastFetchedAt,
      nextRefreshAt
    };
  }

  function renderLandingCard(ui, helpers) {
    const model = getLandingModel(ui);
    if (!model) return '';

    const escapeHtml = helpers?.escapeHtml;
    if (typeof escapeHtml !== 'function') return '';

    const w = getWording(ui);
    const title = String(w.cardTitle || '').trim();
    const sub = String(
      model.hasProfile ? w.cardSubJoined || '' : w.cardSubDefault || ''
    ).trim();
    const viewLabel = String(w.cardCtaView || '').trim();
    const joinLabel = String(w.cardCtaJoin || '').trim();
    const editLabel = String(w.cardCtaEdit || w.profileTab || '').trim();
    const loadingLabel = String(w.loading || '').trim();
    const emptyLabel = String(w.empty || '').trim();
    const bestScoreLineTemplate = String(w.cardBestScoreLine || '').trim();
    const weeklyResetTemplate = String(
      w.cardWeeklyResetLine || w.weeklyResetLine || ''
    ).trim();
    const weeklyResetTime = formatLocalWeekdayTime(
      getNextWeeklyResetUtcMs(Date.now())
    );
    const weeklyResetLine =
      weeklyResetTemplate && weeklyResetTime
        ? fillTemplate(weeklyResetTemplate, { localTime: weeklyResetTime })
        : weeklyResetTemplate;
    const bestScoreLine =
      bestScoreLineTemplate && model.bestScoreFP > 0
        ? fillTemplate(bestScoreLineTemplate, { score: String(model.bestScoreFP) })
        : '';

    const rowsHtml = model.loading
      ? `<p class="wt-muted">${escapeHtml(loadingLabel)}</p>`
      : model.hasRows
        ? `
          <ol class="wt-leaderboard-list" role="list">
            ${model.rows
              .map(
                (row) => `
              <li class="wt-leaderboard-list__item${row.isLocalPlayer ? ` wt-leaderboard-list__item--player` : ``}">
                <span class="wt-leaderboard-list__rank">#${row.rank}</span>
                <span class="wt-leaderboard-list__name">${escapeHtml(row.nickname)}</span>
                <span class="wt-leaderboard-list__score">${escapeHtml(String(row.scoreFP))}</span>
              </li>
            `
              )
              .join('')}
          </ol>
        `
        : `<p class="wt-muted">${escapeHtml(emptyLabel)}</p>`;

    return `
      <section class="wt-box wt-box--tinted wt-leaderboard-card" aria-label="${escapeHtml(title || 'Leaderboard')}">
        <div class="wt-leaderboard-card__header">
          ${title ? `<span class="wt-landing-stat__label">${escapeHtml(title)}</span>` : ``}
          
        </div>
        ${sub ? `<p class="wt-leaderboard-card__sub">${escapeHtml(sub)}</p>` : ``}
        ${weeklyResetLine ? `<p class="wt-leaderboard-card__freshness"><span>${escapeHtml(weeklyResetLine)}</span></p>` : ``}
        ${bestScoreLine ? `<p class="wt-muted">${escapeHtml(bestScoreLine)}</p>` : ``}
        ${rowsHtml}
        <div class="wt-landing-stat__actions">
          ${viewLabel ? `<button type="button" class="wt-btn wt-btn--secondary" data-action="open-leaderboard">${escapeHtml(viewLabel)}</button>` : ``}
          ${model.hasProfile && editLabel ? `<button type="button" class="wt-btn wt-btn--secondary" data-action="open-leaderboard-profile">${escapeHtml(editLabel)}</button>` : ``}
          ${!model.hasProfile && joinLabel ? `<button type="button" class="wt-btn wt-btn--secondary" data-action="open-leaderboard-profile">${escapeHtml(joinLabel)}</button>` : ``}
        </div>
      </section>
    `;
  }

  function renderRowsHtml(rows, escapeHtml, detachedRow) {
    if (!Array.isArray(rows) || rows.length === 0) return '';
    return `
      <ol class="wt-leaderboard-modal__list" role="list">
        ${rows
          .map(
            (row) => `
          <li class="wt-leaderboard-modal__item${row.isLocalPlayer ? ` wt-leaderboard-modal__item--player` : ``}">
            <span class="wt-leaderboard-modal__rank">#${row.rank}</span>
            <span class="wt-leaderboard-modal__name" title="${escapeHtml(row.nickname)}">${escapeHtml(row.nickname)}</span>
            <span class="wt-leaderboard-modal__score">${escapeHtml(String(row.scoreFP))}</span>
          </li>
        `
          )
          .join('')}
        ${
          detachedRow
            ? `
          <li class="wt-leaderboard-modal__item wt-leaderboard-modal__item--gap" aria-hidden="true">
            <span class="wt-leaderboard-modal__name">...</span>
          </li>
          <li class="wt-leaderboard-modal__item wt-leaderboard-modal__item--player">
            <span class="wt-leaderboard-modal__rank">#${detachedRow.rank}</span>
            <span class="wt-leaderboard-modal__name" title="${escapeHtml(detachedRow.nickname)}">${escapeHtml(detachedRow.nickname)}</span>
            <span class="wt-leaderboard-modal__score">${escapeHtml(String(detachedRow.scoreFP))}</span>
          </li>
        `
            : ``
        }
      </ol>
    `;
  }

  function getDetachedLocalRankRow(ui, windowType, rows) {
    const bucket = getRuntimeBucket(ui);
    if (!bucket) return null;

    const localPlayer = getLocalPlayerRow(ui);
    if (!localPlayer) return null;

    const rank = windowType === 'all'
      ? clampInt(bucket.lastKnownAllTimeRank, 0, 999999)
      : clampInt(bucket.lastKnownWeeklyRank, 0, 999999);

    if (rank <= 0) return null;

    const baseRows = Array.isArray(rows) ? rows : [];
    if (rank <= baseRows.length) return null;
    if (
      baseRows.some(
        (row) => String(row?.nickname || '').trim() === localPlayer.nickname
      )
    ) {
      return null;
    }

    return {
      rank,
      nickname: localPlayer.nickname,
      scoreFP: localPlayer.scoreFP
    };
  }

  function getOpenModalTab(ui) {
    try {
      const rankingPanel = ui?.modalContentEl?.querySelector
        ? ui.modalContentEl.querySelector('[data-wt-leaderboard-panel="ranking"]')
        : null;
      if (rankingPanel && typeof rankingPanel.hasAttribute === 'function') {
        return rankingPanel.hasAttribute('hidden') ? 'profile' : 'ranking';
      }
    } catch (_) {
      /* silent */
    }
    return 'ranking';
  }

  function rerenderOpenLeaderboardModal(ui) {
    if (
      ui?._runtime?._modalKey === 'leaderboard' &&
      typeof ui?.openLeaderboardModal === 'function'
    ) {
      ui.openLeaderboardModal({ initialTab: getOpenModalTab(ui) });
    }
  }

  function renderTabButton(tabKey, activeTab, label, escapeHtml) {
    const active = String(activeTab || 'ranking') === tabKey;
    const tabId = `wt-leaderboard-tab-${tabKey}`;
    const panelId = `wt-leaderboard-panel-${tabKey}`;
    return `
      <button
        type="button"
        class="wt-btn ${active ? `wt-btn--primary` : `wt-btn--secondary`}"
        id="${tabId}"
        role="tab"
        data-action="switch-leaderboard-tab"
        data-wt-leaderboard-tab="${tabKey}"
        aria-controls="${panelId}"
        aria-selected="${active ? `true` : `false`}"
        tabindex="${active ? `0` : `-1`}">
        ${escapeHtml(label)}
      </button>
    `;
  }

  function setModalTab(ui, tabKey) {
    const root = ui?.modalContentEl;
    if (!root) return;
    const nextTab = tabKey === 'profile' ? 'profile' : 'ranking';
    root.querySelectorAll('[data-wt-leaderboard-tab]').forEach((btn) => {
      const isActive =
        String(btn.getAttribute('data-wt-leaderboard-tab') || '') === nextTab;
      btn.classList.toggle('wt-btn--primary', isActive);
      btn.classList.toggle('wt-btn--secondary', !isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      btn.setAttribute('tabindex', isActive ? '0' : '-1');
    });
    root.querySelectorAll('[data-wt-leaderboard-panel]').forEach((panel) => {
      const isActive =
        String(panel.getAttribute('data-wt-leaderboard-panel') || '') ===
        nextTab;
      panel.toggleAttribute('hidden', !isActive);
    });
  }

  function openModal(ui, helpers) {
    const escapeHtml = helpers?.escapeHtml;
    if (typeof escapeHtml !== 'function' || typeof ui?.openModal !== 'function')
      return;

    const bucket = getRuntimeBucket(ui);
    ensureFresh(ui);

    const w = getWording(ui);
    const profile =
      ui?.storage && typeof ui.storage.getLeaderboardProfile === 'function'
        ? ui.storage.getLeaderboardProfile()
        : { nickname: '', optIn: false };

    const nickname = String(profile.nickname || '').trim();
    const joined = profile.optIn === true && !!nickname;
    const title = String(w.modalTitle || '').trim();
    const body = String(
      joined ? w.modalBodyJoined || '' : w.modalBodyDefault || ''
    ).trim();
    const weeklyTitle = String(w.weeklyTitle || '').trim();
    const allTitle = String(w.allTitle || '').trim();
    const nicknameLabel = String(w.nicknameLabel || '').trim();
    const nicknamePlaceholder = String(w.nicknamePlaceholder || '').trim();
    const saveLabel = String(
      joined ? w.updateCta || '' : w.joinCta || ''
    ).trim();
    const leaveLabel = String(w.leaveCta || '').trim();
    const rankingTabLabel = String(
      w.rankingTab || weeklyTitle || title || 'Leaderboard'
    ).trim();
    const profileTabLabel = String(
      w.profileTab || nicknameLabel || 'Profile'
    ).trim();
    const requestedInitialTab = String(helpers?.initialTab || '').trim();
    const initialTab = requestedInitialTab === 'profile'
      ? 'profile'
      : requestedInitialTab === 'ranking'
        ? 'ranking'
        : joined
          ? 'ranking'
          : 'profile';

    const weeklyRows = Array.isArray(bucket?.weekly) ? bucket.weekly : [];
    const allRows = Array.isArray(bucket?.all) ? bucket.all : [];
    const weeklyDetachedRow = getDetachedLocalRankRow(ui, 'weekly', weeklyRows);
    const allDetachedRow = getDetachedLocalRankRow(ui, 'all', allRows);
    const editProfileCta = String(
      w.editProfileCta || w.cardCtaEdit || w.profileTab || ''
    ).trim();

    const html = `
      <div class="wt-actions wt-actions--compact wt-leaderboard-modal__tabs" role="tablist" aria-label="${escapeHtml(title || 'Leaderboard')}">
        ${renderTabButton('ranking', initialTab, rankingTabLabel, escapeHtml)}
        ${renderTabButton('profile', initialTab, profileTabLabel, escapeHtml)}
      </div>
      <section
        id="wt-leaderboard-panel-ranking"
        role="tabpanel"
        aria-labelledby="wt-leaderboard-tab-ranking"
        data-wt-leaderboard-panel="ranking"${initialTab === 'ranking' ? '' : ' hidden'}>
        ${body ? `<p class="wt-muted">${escapeHtml(body)}</p>` : ``}
        ${
          joined && editProfileCta
            ? `
          <div class="wt-actions wt-actions--compact">
            <button
              type="button"
              class="wt-btn wt-btn--secondary"
              data-action="switch-leaderboard-tab"
              data-wt-leaderboard-tab="profile">
              ${escapeHtml(editProfileCta)}
            </button>
          </div>
        `
            : ``
        }
        ${weeklyTitle ? `<p class="wt-question-title">${escapeHtml(weeklyTitle)}</p>` : ``}
        ${renderRowsHtml(weeklyRows, escapeHtml, weeklyDetachedRow)}
        <div class="wt-divider"></div>
        ${allTitle ? `<p class="wt-question-title">${escapeHtml(allTitle)}</p>` : ``}
        ${renderRowsHtml(allRows, escapeHtml, allDetachedRow)}
      </section>
      <section
        id="wt-leaderboard-panel-profile"
        role="tabpanel"
        aria-labelledby="wt-leaderboard-tab-profile"
        data-wt-leaderboard-panel="profile"${initialTab === 'profile' ? '' : ' hidden'}>
        <label class="wt-label" for="wt-leaderboard-nickname">${escapeHtml(nicknameLabel)}</label>
        <input
          id="wt-leaderboard-nickname"
          class="wt-input"
          maxlength="24"
          autocomplete="nickname"
          value="${escapeHtml(nickname)}"
          placeholder="${escapeHtml(nicknamePlaceholder)}"
        />
        <div class="wt-actions wt-actions--compact">
          <button type="button" class="wt-btn wt-btn--primary" data-action="save-leaderboard-profile" aria-busy="false">
            ${escapeHtml(saveLabel)}
          </button>
          ${
            joined && leaveLabel
              ? `
            <button type="button" class="wt-btn wt-btn--secondary" data-action="leave-leaderboard">
              ${escapeHtml(leaveLabel)}
            </button>
          `
              : ``
          }
        </div>
      </section>
    `;

    ui.openModal(html, title, { modalKey: 'leaderboard' });
  }

  function switchModalTab(ui, tabKey) {
    setModalTab(ui, tabKey);
  }

  async function saveProfileFromModal(ui, helpers) {
    const toastNow = helpers?.toastNow;
    const fillTemplate = helpers?.fillTemplate;
    const getLeaderboardContentVersion =
      helpers?.getLeaderboardContentVersion;
    const w = getWording(ui);
    const cfg = getCfg(ui);
    const saveBtn = ui?.modalContentEl
      ? ui.modalContentEl.querySelector('[data-action="save-leaderboard-profile"]')
      : null;
    const existingProfile =
      ui?.storage && typeof ui.storage.getLeaderboardProfile === 'function'
        ? ui.storage.getLeaderboardProfile()
        : null;
    const wasJoined =
      existingProfile?.optIn === true &&
      !!String(existingProfile?.nickname || '').trim();
    const input = ui?.modalContentEl
      ? ui.modalContentEl.querySelector('#wt-leaderboard-nickname')
      : null;
    const nickname = String(input?.value || '').trim();
    const minLen = clampInt(cfg?.nicknameMinLen, 1, 32);
    const maxLen = clampInt(cfg?.nicknameMaxLen, minLen, 64);
    const nicknameRegex = compileNicknameRegex(cfg);

    if (!nickname) {
      if (typeof toastNow === 'function') {
        toastNow(ui.config, String(w.nicknameRequiredToast || '').trim(), {
          variant: 'danger'
        });
      }
      return;
    }

    if (nickname.length < minLen) {
      if (typeof toastNow === 'function') {
        toastNow(ui.config, String(w.nicknameTooShortToast || '').trim(), {
          variant: 'danger'
        });
      }
      return;
    }

    if (nicknameRegex === false) {
      if (typeof toastNow === 'function') {
        toastNow(ui.config, String(w.nicknameInvalidCharsToast || '').trim(), {
          variant: 'danger'
        });
      }
      return;
    }

    if (
      nickname.length > maxLen ||
      (nicknameRegex && !nicknameRegex.test(nickname))
    ) {
      if (typeof toastNow === 'function') {
        toastNow(ui.config, String(w.nicknameInvalidCharsToast || '').trim(), {
          variant: 'danger'
        });
      }
      return;
    }

    if (
      ui?.storage &&
      typeof ui.storage.saveLeaderboardProfile === 'function'
    ) {
      ui.storage.saveLeaderboardProfile(nickname, true);
    }

    const baseUrl = String(cfg?.apiBaseUrl || '')
      .trim()
      .replace(/\/+$/, '');
    try {
      if (saveBtn) {
        saveBtn.setAttribute('aria-busy', 'true');
        saveBtn.disabled = true;
      }
    } catch (_) {
      /* silent */
    }
    if (baseUrl) {
      try {
        const profile = ui.storage.getLeaderboardProfile();
        await fetch(`${baseUrl}/player`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            accept: 'application/json'
          },
          body: JSON.stringify({
            device_uuid: String(profile.deviceUuid || '').trim(),
            nickname: String(profile.nickname || '').trim(),
            opt_in: true
          })
        });
      } catch (_) {
        if (typeof toastNow === 'function') {
          toastNow(ui.config, String(w.remoteSaveErrorToast || '').trim(), {
            variant: 'info'
          });
        }
      }
    }
    try {
      if (saveBtn) {
        saveBtn.setAttribute('aria-busy', 'false');
        saveBtn.disabled = false;
      }
    } catch (_) {
      /* silent */
    }

    const bucket = getRuntimeBucket(ui);
    if (bucket) {
      bucket.lastFetchedAt = 0;
    }
    if (!wasJoined && ui?._runtime?.lastRun) {
      try {
        const submitRes = await submitRun(ui, ui._runtime.lastRun, {
          getLeaderboardContentVersion
        });
        handleSubmitResult(ui, submitRes, {
          clampInt,
          fillTemplate:
            typeof fillTemplate === 'function'
              ? fillTemplate
              : (tpl, vars) =>
                  String(tpl || '').replace(/\{(\w+)\}/g, (_m, key) =>
                    Object.prototype.hasOwnProperty.call(vars || {}, key)
                      ? String(vars[key])
                      : ''
                  ),
          toastNow
        });
      } catch (_) {
        /* silent */
      }
    }
    ensureFresh(ui);
    openModal(ui, helpers);
    setModalTab(ui, 'ranking');
    if (typeof toastNow === 'function') {
      toastNow(ui.config, String(w.saveOkToast || '').trim(), {
        variant: 'success'
      });
    }
    try {
      ui.render();
    } catch (_) {
      /* silent */
    }
  }

  async function leaveFromModal(ui, helpers) {
    const toastNow = helpers?.toastNow;
    const w = getWording(ui);
    const cfg = getCfg(ui);

    let deviceUuid = '';
    if (ui?.storage && typeof ui.storage.getLeaderboardProfile === 'function') {
      const profile = ui.storage.getLeaderboardProfile();
      deviceUuid = String(profile.deviceUuid || '').trim();
    }

    if (
      ui?.storage &&
      typeof ui.storage.saveLeaderboardProfile === 'function'
    ) {
      ui.storage.saveLeaderboardProfile('', false);
    }

    const baseUrl = String(cfg?.apiBaseUrl || '')
      .trim()
      .replace(/\/+$/, '');
    if (baseUrl && deviceUuid) {
      try {
        const url = new URL(`${baseUrl}/player`);
        url.searchParams.set('device_uuid', deviceUuid);
        await fetch(url.toString(), {
          method: 'DELETE',
          headers: { accept: 'application/json' }
        });
      } catch (_) {
        /* silent */
      }
    }

    const bucket = getRuntimeBucket(ui);
    if (bucket) bucket.lastFetchedAt = 0;
    ensureFresh(ui);
    if (typeof ui.closeModal === 'function') ui.closeModal();
    if (typeof toastNow === 'function') {
      toastNow(ui.config, String(w.leftToast || '').trim(), {
        variant: 'info'
      });
    }
    try {
      ui.render();
    } catch (_) {
      /* silent */
    }
  }

  async function submitRun(ui, lastRun, helpers) {
    if (!shouldSubmitScores(ui))
      return { ok: false, skipped: true, reason: 'disabled' };

    const cfg = getCfg(ui);
    const baseUrl = String(cfg?.apiBaseUrl || '')
      .trim()
      .replace(/\/+$/, '');
    if (!baseUrl)
      return { ok: false, skipped: true, reason: 'no_api_base_url' };

    const profile =
      ui?.storage && typeof ui.storage.getLeaderboardProfile === 'function'
        ? ui.storage.getLeaderboardProfile()
        : null;

    if (!profile || profile.optIn !== true)
      return { ok: false, skipped: true, reason: 'not_opted_in' };

    const mode = String(lastRun?.mode || '')
      .trim()
      .toUpperCase();
    if (mode !== 'RUN') return { ok: false, skipped: true, reason: 'not_run' };

    const answers = Array.isArray(lastRun?.answerLog) ? lastRun.answerLog : [];
    if (!answers.length)
      return { ok: false, skipped: true, reason: 'no_answers' };

    const getLeaderboardContentVersion = helpers?.getLeaderboardContentVersion;
    const contentVersion =
      typeof getLeaderboardContentVersion === 'function'
        ? String(getLeaderboardContentVersion(ui.config) || '').trim()
        : 'unknown';

    const payload = {
      device_uuid: String(profile.deviceUuid || '').trim(),
      run_id: String(lastRun?.runId || '').trim(),
      run_number: clampInt(lastRun?.runNumber, 0, 999999999),
      content_version: contentVersion,
      run_mode: 'RUN',
      duration_ms: clampInt(lastRun?.durationMs, 0, 24 * 60 * 60 * 1000),
      answers: answers.map((row) => ({
        id: clampInt(row?.id, 0, 999999),
        answer: row?.answer === true,
        ms: clampInt(row?.ms, 0, 10 * 60 * 1000)
      }))
    };

    if (!payload.device_uuid || !payload.run_id || !payload.answers.length) {
      return { ok: false, skipped: true, reason: 'invalid_payload' };
    }

    try {
      const res = await fetch(`${baseUrl}/score`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          accept: 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok)
        return { ok: false, skipped: false, reason: `http_${res.status}` };

      const json = await res.json().catch(() => null);
      const bucket = getRuntimeBucket(ui);
      if (bucket) bucket.lastFetchedAt = 0;
      return { ok: true, data: json };
    } catch (err) {
      return {
        ok: false,
        skipped: false,
        reason: String(err?.message || 'submit_failed')
      };
    }
  }

  function handleSubmitResult(ui, res, helpers) {
    if (!res || res.skipped === true) return;

    const clampInt = helpers?.clampInt;
    const fillTemplate = helpers?.fillTemplate;
    const toastNow = helpers?.toastNow;
    if (
      typeof clampInt !== 'function' ||
      typeof fillTemplate !== 'function' ||
      typeof toastNow !== 'function'
    ) {
      return;
    }

    const w = getWording(ui);
    if (res.ok === true) {
      const bucket = getRuntimeBucket(ui);
      const weeklyRank = clampInt(res?.data?.weekly_rank, 0, 999999);
      const allTimeRank = clampInt(res?.data?.all_time_rank, 0, 999999);
      if (bucket) {
        bucket.lastKnownWeeklyRank = weeklyRank;
        bucket.lastKnownAllTimeRank = allTimeRank;
      }
      if (weeklyRank > 0) {
        const toastTpl = String(w.rankToastWeekly || '').trim();
        if (toastTpl) {
          toastNow(
            ui.config,
            fillTemplate(toastTpl, { rank: String(weeklyRank) }),
            {
              variant: 'info'
            }
          );
        }
      }
      rerenderOpenLeaderboardModal(ui);
      return;
    }

    const rejectedToast = String(w.scoreRejectedToast || '').trim();
    if (rejectedToast) {
      toastNow(ui.config, rejectedToast, { variant: 'info' });
    }
  }

  window.WT_UI_Leaderboard = {
    renderLandingCard,
    openModal,
    switchModalTab,
    saveProfileFromModal,
    leaveFromModal,
    submitRun,
    handleSubmitResult
  };

  window.WT_UI_Leaderboard_Testing = {
    clampInt: LeaderboardLogic.clampInt,
    compileNicknameRegex,
    mergeLocalPlayer: LeaderboardLogic.mergeLocalPlayer,
    normalizeRows: LeaderboardLogic.normalizeRows
  };
})();

/* ===== ui.js ===== */
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

  function hasUsedQuestionAudio(storage) {
    if (!storage || typeof storage.hasUsedQuestionAudio !== 'function')
      return false;
    try {
      return storage.hasUsedQuestionAudio() === true;
    } catch (_) {
      return false;
    }
  }

  function getRunCompletesCount(storage) {
    if (!storage || typeof storage.getCounters !== 'function') return 0;
    try {
      const counters = storage.getCounters() || {};
      return clampNonNegativeInt(counters.runCompletes);
    } catch (_) {
      return 0;
    }
  }

  function shouldShowQuestionAudioControl(storage) {
    if (isAutoReadQuestionsEnabled(storage)) return true;
    if (hasUsedQuestionAudio(storage)) return true;
    return getRunCompletesCount(storage) < 1;
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

        case 'claim-share-bonus':
          self.claimShareBonus(event);
          break;

        case 'dismiss-share-bonus':
          self.dismissShareBonusOffer();
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
      // so we also fall back to the internal hash we control (#app).
      window.addEventListener('popstate', (e) => {
        const ignoreUntil = Number(self._nav?.ignorePopstateUntil || 0);
        if (ignoreUntil > 0 && Date.now() <= ignoreUntil) {
          return;
        }

        const st = e && e.state ? e.state : null;
        const hash = String(window.location.hash || '').trim();
        const hasInternalState = !!(st && st.wt === true);
        const hasInternalHash = hash === '#app';

        // If the browser navigated outside our internal history model, let it proceed.
        if (!hasInternalState && !hasInternalHash) return;

        self.closeModal();

        if (self.state !== STATES.LANDING) {
          self.setState(STATES.LANDING);
          return;
        }

        // Keep URL/state coherent even when popstate arrived with a degraded state payload.
        if (hash === '#app') {
          try {
            const baseUrl = location.pathname + location.search;
            history.replaceState(
              { wt: true, screen: STATES.LANDING },
              '',
              baseUrl
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
        baseUrl
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
    try {
      if (
        this.storage &&
        typeof this.storage.markUsedQuestionAudio === 'function'
      ) {
        this.storage.markUsedQuestionAudio();
      }
    } catch (_) {
      /* silent */
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
      if (
        next === true &&
        typeof this.storage.markUsedQuestionAudio === 'function'
      ) {
        this.storage.markUsedQuestionAudio();
      }
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
      const nextUrl = next === STATES.LANDING ? baseUrl : `${baseUrl}#app`;
      if (this._nav) {
        this._nav.ignorePopstateUntil = Date.now() + 600;
      }

      if (next !== STATES.LANDING && prev === STATES.LANDING) {
        history.pushState({ wt: true, screen: next }, '', nextUrl);
      } else {
        history.replaceState({ wt: true, screen: next }, '', nextUrl);
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
      try {
        if (
          window.WT_Analytics &&
          typeof window.WT_Analytics.trackFunnel === 'function' &&
          typeof window.WT_Analytics.inferUiContext === 'function'
        ) {
          window.WT_Analytics.trackFunnel(
            'paywall_view',
            window.WT_Analytics.inferUiContext(this, {
              from_state: String(prev || '').trim().toLowerCase() || 'other'
            })
          );
        }
      } catch (_) {
        /* silent */
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
    try {
      if (this.appEl) this.appEl.setAttribute('aria-hidden', 'true');
      const footerEl = document.getElementById('wt-footer-root');
      if (footerEl) footerEl.setAttribute('aria-hidden', 'true');
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
    try {
      if (this.appEl) this.appEl.removeAttribute('aria-hidden');
      const footerEl = document.getElementById('wt-footer-root');
      if (footerEl) footerEl.removeAttribute('aria-hidden');
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
      toastNow,
      fillTemplate,
      getLeaderboardContentVersion
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

  UI.prototype._confirmRedeemCode = async function () {
    const w = this.wording || {};
    const how = w.howto || {};

    const input = this.modalContentEl
      ? this.modalContentEl.querySelector('#wt-code')
      : null;
    const msg = this.modalContentEl
      ? this.modalContentEl.querySelector('#wt-code-msg')
      : null;
    const confirmBtn = this.modalContentEl
      ? this.modalContentEl.querySelector('[data-action="confirm-redeem"]')
      : null;

    const code = String(input && input.value ? input.value : '').trim();
    if (!code) {
      if (msg) msg.textContent = String(how.enterCode || '').trim();
      return;
    }

    if (!this.storage) {
      if (msg) msg.textContent = String(how.codeRejected || '').trim();
      return;
    }

    // Server-verified path first (admin/guest codes — see storage.js's
    // tryRedeemPremiumCodeRemote). Only falls back to the local format-only
    // check below if the Worker doesn't recognize this code at all or is
    // unreachable; an explicit server rejection (e.g. a guest code past its
    // use cap) must NOT fall back, or the cap would be meaningless.
    let res = null;
    if (typeof this.storage.tryRedeemPremiumCodeRemote === 'function') {
      if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.setAttribute('aria-busy', 'true');
      }
      if (msg) msg.textContent = String(how.codeChecking || '').trim();
      try {
        res = await this.storage.tryRedeemPremiumCodeRemote(code);
      } catch (_) {
        res = null;
      }
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.removeAttribute('aria-busy');
      }
    }

    const shouldTryLocalFallback =
      !res ||
      (res.ok !== true &&
        (res.reason === 'REMOTE_UNAVAILABLE' || res.reason === 'NOT_FOUND'));

    if (shouldTryLocalFallback) {
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

      if (typeof this.storage.tryRedeemPremiumCode !== 'function') {
        if (msg) msg.textContent = String(how.codeRejected || '').trim();
        return;
      }

      res = this.storage.tryRedeemPremiumCode(code);
    }

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

    try {
      if (
        window.WT_Analytics &&
        typeof window.WT_Analytics.trackFunnel === 'function' &&
        typeof window.WT_Analytics.inferUiContext === 'function'
      ) {
        window.WT_Analytics.trackFunnel(
          'run_start',
          window.WT_Analytics.inferUiContext(this, {
            mode: this._runtime.runMode,
            run_type: runType || ''
          })
        );
      }
    } catch (_) {
      /* silent */
    }

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
      if (
        mode !== MODES.BONUS &&
        window.WT_Analytics &&
        typeof window.WT_Analytics.trackFunnel === 'function' &&
        typeof window.WT_Analytics.inferUiContext === 'function'
      ) {
        window.WT_Analytics.trackFunnel(
          'run_complete',
          window.WT_Analytics.inferUiContext(this, {
            mode,
            run_type: this._runtime.lastRun.runType || ''
          })
        );
      }
    } catch (_) {
      /* silent */
    }

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

  UI.prototype.dismissShareBonusOffer = function () {
    this._runtime = this._runtime || {};
    if (this._runtime.shareBonusDismissed === true) return;
    this._runtime.shareBonusDismissed = true;
    this.render();
  };

  UI.prototype.claimShareBonus = async function (event) {
    if (!this.storage || typeof this.storage.grantShareBonus !== 'function') {
      return;
    }

    this._runtime = this._runtime || {};
    if (this._runtime.shareBonusClaimInFlight === true) return;

    const shareBonusW = this.wording?.shareBonus || {};
    const alreadyMsg = String(shareBonusW.toastAlready || '').trim();
    const failMsg = String(shareBonusW.toastShareFailed || '').trim();
    const unlockedMsg = String(shareBonusW.toastUnlocked || '').trim();

    if (
      typeof this.storage.hasShareBonusGranted === 'function' &&
      this.storage.hasShareBonusGranted() === true
    ) {
      if (alreadyMsg) toastNow(this.config, alreadyMsg);
      return;
    }

    const trigger = event?.target?.closest
      ? event.target.closest('[data-action="claim-share-bonus"]')
      : null;
    const previousDisabled = !!trigger?.disabled;
    const previousBusy = trigger?.getAttribute?.('aria-busy');

    this._runtime.shareBonusClaimInFlight = true;
    if (trigger) {
      trigger.disabled = true;
      trigger.setAttribute('aria-busy', 'true');
    }

    try {
      const text = String(this._getShareText() || '').trim();
      if (!text) {
        if (failMsg) toastNow(this.config, failMsg, { variant: 'danger' });
        return;
      }

      let shared = false;
      if (typeof navigator.share === 'function') {
        try {
          await navigator.share({ text });
          shared = true;
        } catch (_) {
          shared = false;
        }
      } else if (typeof navigator.clipboard?.writeText === 'function') {
        try {
          await navigator.clipboard.writeText(text);
          shared = true;
        } catch (_) {
          shared = false;
        }
      }

      if (!shared) {
        if (failMsg) toastNow(this.config, failMsg, { variant: 'danger' });
        return;
      }

      const result = this.storage.grantShareBonus();
      if (result?.reason === 'ALREADY') {
        if (alreadyMsg) toastNow(this.config, alreadyMsg);
        return;
      }
      if (!result?.ok) {
        if (failMsg) toastNow(this.config, failMsg, { variant: 'danger' });
        return;
      }

      if (typeof this.storage.markShareClicked === 'function') {
        this.storage.markShareClicked();
      }

      this._runtime.shareBonusDismissed = false;
      if (unlockedMsg) {
        toastNow(this.config, unlockedMsg, { variant: 'success' });
      }
      this.render();
    } finally {
      this._runtime.shareBonusClaimInFlight = false;
      if (trigger) {
        trigger.disabled = previousDisabled;
        trigger.setAttribute('aria-busy', previousBusy || 'false');
      }
    }
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

      // Record the rendered state BEFORE the counter write.
      // markLandingViewed() -> _save() -> _emit() re-enters render() synchronously;
      // recording first makes the nested render see prev === LANDING and skip the
      // counter (otherwise: infinite recursion until "Maximum call stack size
      // exceeded", landingViewed inflated ~40x per load, and trackFunnel
      // "landing_view" fired once per recursion level).
      if (this._runtime) this._runtime.lastRenderedState = next;

      if (next === STATES.LANDING && prev !== STATES.LANDING) {
        if (
          this.storage &&
          typeof this.storage.markLandingViewed === 'function'
        ) {
          this.storage.markLandingViewed();
        }

        if (
          window.WT_Analytics &&
          typeof window.WT_Analytics.trackFunnel === 'function' &&
          typeof window.WT_Analytics.inferUiContext === 'function'
        ) {
          window.WT_Analytics.trackFunnel(
            'landing_view',
            window.WT_Analytics.inferUiContext(this)
          );
        }
      }
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
    const mistakeDeltaHtml =
      pulseOn && mistakeDeltaText
        ? `<span class="wt-pill__delta wt-pill__delta--mistake wt-pill__delta--minus" aria-hidden="true">${escapeHtml(mistakeDeltaText)}</span>`
        : '';

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
      shouldShowQuestionAudioControl(this.storage) &&
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

    const questionPromptId = questionPrompt ? 'wt-question-prompt' : '';
    const questionTextId = 'wt-question-text';
    const choiceGroupDescribedBy = questionPromptId
      ? ` aria-describedby="${questionPromptId}"`
      : '';

    const questionHtml = `


${
  questionPrompt
    ? `
  <p id="${questionPromptId}" class="wt-question-prompt">
    ${escapeHtml(questionPrompt)}
  </p>
`
    : ``
}
${questionAudioHtml}
<div class="wt-terms-box">
  <div class="wt-term-row">
    <span id="${questionTextId}" class="wt-term-word">${escapeHtml(questionText)}</span>
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
        <div class="wt-choices" role="group" aria-labelledby="${questionTextId}"${choiceGroupDescribedBy}>
          <button class="wt-choice wt-choice--same" data-action="answer-true" aria-label="${escapeHtml(trueLabel)}">
            <span class="wt-choice-icon" aria-hidden="true">\u2714</span>
            ${escapeHtml(trueLabel)}
          </button>
          <button class="wt-choice wt-choice--diff" data-action="answer-false" aria-label="${escapeHtml(falseLabel)}">
            <span class="wt-choice-icon" aria-hidden="true">\u2716</span>
            ${escapeHtml(falseLabel)}
          </button>
        </div>
      `
          : `
        <div class="wt-answer-zone">
          <div class="wt-choices" role="group" aria-labelledby="${questionTextId}"${choiceGroupDescribedBy}>
            <button class="wt-choice wt-choice--same" data-action="answer-true" aria-label="${escapeHtml(trueLabel)}">
              <span class="wt-choice-icon" aria-hidden="true">\u2714</span>
              ${escapeHtml(trueLabel)}
            </button>
            <button class="wt-choice wt-choice--diff" data-action="answer-false" aria-label="${escapeHtml(falseLabel)}">
              <span class="wt-choice-icon" aria-hidden="true">\u2716</span>
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

/* ===== pwa.js ===== */
// pwa.js - PWA helpers
// Install prompt logic (A2HS) - KISS
// UI owns when to show; copy is in WT_WORDING.installPrompt.*

(() => {
  "use strict";

  let deferredPrompt = null;

  // Capture the beforeinstallprompt event (Chrome/Edge/Android)
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  // If app gets installed, clear prompt handle (KISS)
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
  });

  // Check if running as standalone (already installed)
  function isStandalone() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }

  function isIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent || "");
  }

  // V2 counter name is runCompletes
  function getCompletedCount(storage) {
    if (!storage || typeof storage.getCounters !== "function") return 0;
    const c = storage.getCounters() || {};

    const runCompletes = Number(c.runCompletes || 0);
    return (Number.isFinite(runCompletes) && runCompletes > 0) ? runCompletes : 0;
  }

  // Check if we can show the install prompt (platform-aware)
  function canPrompt(config, storage) {
    if (!config?.installPrompt?.enabled) return false;
    if (isStandalone()) return false;

    const completed = getCompletedCount(storage);

    // V2 key: triggerAfterFirstCompletedRun
    const gateAfterFirst =
      (config.installPrompt && config.installPrompt.triggerAfterFirstCompletedRun === true);

    if (gateAfterFirst) {
      if (completed < 1) return false;
    }

    // iOS: no beforeinstallprompt; UI can still show instructions modal
    if (isIOS()) return true;

    // Non-iOS: need deferredPrompt
    return !!deferredPrompt;
  }

  // Initialize PWA features
  // In V2, UI calls WT_PWA.promptInstall(storage) directly.
  // Keep signature (storage, ui) for compatibility, but do not require UI hooks.
  function initPWA(storage, ui) {
    const config = window.WT_CONFIG;

    // pwa.js is strictly limited to install-prompt wiring (KISS).
    if (!config?.installPrompt?.enabled) return;

    void storage;
    void ui;
  }

  // Show the native install prompt when available (Chrome/Edge/Android)
  // iOS returns IOS_NO_NATIVE_PROMPT so UI can show instructions.
  async function promptInstall(storage) {
    const config = window.WT_CONFIG;

    if (!canPrompt(config, storage)) {
      return { ok: false, reason: "NOT_AVAILABLE" };
    }

    // iOS: no native prompt
    if (isIOS()) {
      if (storage && typeof storage.markInstallPromptShown === "function") {
        storage.markInstallPromptShown();
      }
      return { ok: false, reason: "IOS_NO_NATIVE_PROMPT" };
    }

    if (!deferredPrompt) return { ok: false, reason: "NOT_AVAILABLE" };

    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      deferredPrompt = null;

      // Anti-spam: treat prompt as "shown" whether accepted or dismissed
      if (storage && typeof storage.markInstallPromptShown === "function") {
        storage.markInstallPromptShown();
      }

      if (choice && choice.outcome === "accepted") {
        return { ok: true };
      }
      return { ok: false, reason: "DISMISSED" };
    } catch (_) {
      return { ok: false, reason: "ERROR" };
    }
  }

  // Export
  window.WT_PWA = {
    initPWA,
    canPrompt,
    isStandalone,
    promptInstall
  };
})();

/* ===== email.js ===== */
// email.js - mail helpers
// Obfuscation mailto helper — fail-closed, config-driven.
//
// Responsibilities:
//   1. Decode obfuscated emails from WT_CONFIG (technical, never displayed raw)
//   2. Wire footer contact link: label from WT_WORDING, click → WT_SUPPORT_OPEN hook
//   3. Build mailto URLs for waitlist (used by ui.js)
//   4. Wire legacy data-user/data-domain links (success.html)
//
// Fail-closed contract:
//   - No label in WT_WORDING → no link (silent skip)
//   - No WT_SUPPORT_OPEN hook → no click handler (footer.js cleans up)
//   - No obfuscated email in WT_CONFIG → empty string (callers handle it)
//   - No fallbacks, no guessing, no email ever shown as text

(() => {
  "use strict";

  // ── Internal helpers ────────────────────────────────────────────

  /** Decode HTML-entity-obfuscated string (e.g. "a&#64;b&#46;c" → "a@b.c") */
  function decodeHtmlEntities(str) {
    const t = document.createElement("textarea");
    t.innerHTML = str;
    return t.value;
  }

  /** Sanitize a string for safe use in mailto query params (strip injection vectors) */
  function sanitize(str) {
    return String(str || "").replace(/[\r\n]/g, " ").trim();
  }

  function decodeXorCodes(cipher) {
    const c = (cipher && typeof cipher === "object") ? cipher : null;
    const key = Number(c?.key);
    const codes = Array.isArray(c?.codes) ? c.codes : null;
    if (!Number.isFinite(key) || !codes || !codes.length) return "";

    try {
      const out = codes.map((n) => {
        const code = Number(n);
        if (!Number.isFinite(code)) throw new Error("bad code");
        return String.fromCharCode(code ^ key);
      }).join("").replace(/[\r\n]/g, "").trim();

      return out.includes("@") ? out : "";
    } catch (_) {
      return "";
    }
  }

  function decodeEmailValue(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const email = decodeHtmlEntities(raw).replace(/[\r\n]/g, "").trim();
    return email.includes("@") ? email : "";
  }

  function getSupportEmailDecoded() {
    try {
      const support = window.WT_CONFIG?.support;
      const email = decodeXorCodes(support?.emailCipher) || decodeEmailValue(support?.emailObfuscated);
      return email || "";
    } catch (_) {
      return "";
    }
  }

  function getWaitlistEmailDecoded() {
    try {
      const waitlist = window.WT_CONFIG?.waitlist;
      const email = decodeXorCodes(waitlist?.toEmailCipher) || decodeEmailValue(waitlist?.toEmailObfuscated);
      return email || "";
    } catch (_) {
      return "";
    }
  }

  // ── Exported: buildMailto ──────────────────────────────────────
  // Builds a mailto URL for waitlist signup.
  // Sources: WT_CONFIG.waitlist (mechanics) + WT_WORDING.waitlist (copy).
  // Fail-closed: returns "" if config is missing/disabled.

  function buildMailto(config, message) {
    const wl = config?.waitlist;
    if (!wl?.enabled) return "";

    // Decode recipient from config (technical, never displayed)
    const to = getWaitlistEmailDecoded();
    if (!to || !to.includes("@")) return "";

    // Subject: prefix from config (technical) + suffix from wording (copy)
    const prefix = sanitize(wl.subjectPrefix);
    if (!prefix) return "";
    const suffix = sanitize(window.WT_WORDING?.waitlist?.emailSubjectSuffix);
    const subject = suffix ? `${prefix} ${suffix}` : prefix;

    // Body: template from wording with {idea} placeholder
    const idea = String(message || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
    const tpl = String(window.WT_WORDING?.waitlist?.emailBodyTemplate || "").trim();
    const body = tpl ? tpl.replaceAll("{idea}", idea) : idea;

    // Assemble mailto (recipient unencoded — some clients mishandle encoded recipients)
    const q = [];
    if (subject) q.push(`subject=${encodeURIComponent(subject)}`);
    if (body) q.push(`body=${encodeURIComponent(body)}`);
    return `mailto:${to}${q.length ? `?${q.join("&")}` : ""}`;
  }

  function openSupportEmail(options) {
    const email = getSupportEmailDecoded();
    if (!email) return;

    const opts = (options && typeof options === "object") ? options : {};
    const subjectPrefix = sanitize(opts.subjectPrefix);
    const subjectSuffix = sanitize(opts.subjectSuffix);
    const bodyTemplate = String(opts.bodyTemplate || "").trim();

    const subjectText = [subjectPrefix, subjectSuffix].filter(Boolean).join(" ").trim();

    const q = [];
    if (subjectText) q.push(`subject=${encodeURIComponent(subjectText)}`);
    if (bodyTemplate) q.push(`body=${encodeURIComponent(bodyTemplate)}`);

    window.location.href = `mailto:${email}${q.length ? `?${q.join("&")}` : ""}`;
  }

  // ── Exported: initEmailLinks ───────────────────────────────────
  // Wires all email-related links in the DOM. Called by footer.js and main.js.

  function initEmailLinks() {
    try {
      const wording = window.WT_WORDING;
      if (!wording || typeof wording !== "object") return;

      // ─── 1) Footer contact link (#wt-contact-link) ───
      // Display: label from WT_WORDING.support.label (never raw email).
      // Click on app pages: dispatch "wt-open-support".
      // Fail-closed: no label → skip entirely (footer.js removes empty links).

      const supportLink = document.getElementById("wt-contact-link");
      if (supportLink) {
        const label = String(wording.support?.label || "").trim();
        const isAppPage = !!document.getElementById("app");

        // Fail-closed: no label configured → leave link empty, footer.js cleans up.
        if (!label) {
          // Don't wire anything — footer.js will remove the empty link + separator.
        } else {
          // Visible text: always the wording label, never the email.
          supportLink.textContent = label;

          // Accessibility: explicit intent label
          supportLink.setAttribute("aria-label", label);

          // Reset previous wiring before re-applying it
          supportLink.onclick = null;

          // Do not expose a mailto href in the static DOM.
          supportLink.setAttribute("href", "#");
          supportLink.removeAttribute("target");
          supportLink.removeAttribute("rel");

          supportLink.onclick = (e) => {
            e.preventDefault();

            if (isAppPage) {
              try {
                document.dispatchEvent(new CustomEvent("wt-open-support"));
              } catch (_) {
                // silent
              }
              return;
            }

            openSupportEmail();
          };
        }
      }


      // ─── 2) Legacy data-user/data-domain links (success.html) ───
      // Simple mailto wiring for links with data attributes.
      // Skip modal-only links and the footer contact link (handled above).

      const links = document.querySelectorAll("a[data-user][data-domain]");
      links.forEach((link) => {
        if (!link) return;
        if (link.id === "wt-contact-link") return;
        if (link.getAttribute("data-email-mode") === "modal") return;

        const user = link.getAttribute("data-user");
        const domain = link.getAttribute("data-domain");
        if (!user || !domain) return;

        link.href = `mailto:${user}@${domain}`;
      });


      // ─── 3) Static page support links ───
      // Privacy / press pages use data-wt-support-link so they do not need inline scripts.

      const supportLinks = document.querySelectorAll("a[data-wt-support-link]");
      supportLinks.forEach((link) => {
        if (!link) return;

        const label = String(link.textContent || wording.support?.label || wording.footer?.contact || "").trim();
        if (label) {
          link.textContent = label;
          link.setAttribute("aria-label", label);
        }

        link.setAttribute("href", "#");
        link.removeAttribute("target");
        link.removeAttribute("rel");

        link.onclick = (e) => {
          e.preventDefault();
          openSupportEmail();
        };
      });
    } catch (_) {
      // Silent fail — fail-closed.
    }
  }

  // ── Public API ─────────────────────────────────────────────────

  window.WT_Email = {
    buildMailto,
    decodeObfuscated: decodeHtmlEntities,
    getSupportEmailDecoded,
    getWaitlistEmailDecoded,
    initEmailLinks,
    openSupportEmail
  };

})();

/* ===== footer.js ===== */
// footer.js — shared footer injection (uses email.js)
// Responsibility: inject footer markup into #wt-footer-root when needed.
// Branding, version, labels and locale-aware links are hydrated here. Contact is handled by email.js.
// Locale: locale-aware hrefs come from WT_WORDING.footer.links.* via data-wt-href (hydrated by wording.js).
//         Re-runs hydration on "wt:locale-change".
(() => {
    "use strict";

    function hasNonEmptyContent(el) {
        if (!el) return false;
        const txt = String(el.textContent || "").replace(/\s+/g, " ").trim();
        return txt.length > 0 || el.children.length > 0;
    }

    function injectIntoFooterRoot(root) {
        if (!root) return;

        // Upgrade-safe guard:
        // - If footer already exists BUT is missing the Press link, we re-inject.
        // - If Press exists, we keep current DOM (do not overwrite).
        if (hasNonEmptyContent(root)) {
            const hasPress = !!(root.querySelector && root.querySelector("#wt-press-link"));
            if (hasPress) return;
        }

        root.innerHTML = `
      <div class="wt-container">
        <div class="wt-footer-inner">
          <!-- Ligne 1 : Branding -->
          <div class="wt-footer-row wt-footer-row--brand">
            <span class="wt-footer-creator" data-wt-brand="creatorLine"></span>
          </div>

          <div class="wt-footer-row">
            <em class="wt-muted" data-wt-wording="footer.rulebookNote"></em>
          </div>

          <!-- Ligne 2 : Liens utilitaires -->
          <div class="wt-footer-row wt-footer-row--links">
            <a id="wt-contact-link" class="wt-footer-link" href="#" data-wt-wording="footer.contact"></a>
            <span class="wt-footer-sep" aria-hidden="true">·</span>
            <a id="wt-tyf-link" class="wt-footer-link" href="#"
              data-wt-wording="footer.links.bonjourPickleball.label"
              data-wt-href="footer.links.bonjourPickleball.href"
              target="_blank" rel="noopener"></a>
            <!-- wt-footer-sep--tyf is a marker class for JS targeting only. Styling comes from wt-footer-sep. -->
            <span class="wt-footer-sep wt-footer-sep--tyf" aria-hidden="true">·</span>
            <a id="wt-privacy-link" class="wt-footer-link" href="./privacy.html" target="_blank" rel="noopener"
              data-wt-wording="footer.privacy"></a>
            <span class="wt-footer-sep" aria-hidden="true">·</span>
            <a id="wt-terms-link" class="wt-footer-link" href="./terms.html" target="_blank" rel="noopener"
              data-wt-wording="footer.terms"></a>
            <span class="wt-footer-sep" aria-hidden="true">·</span>
            <a id="wt-press-link" class="wt-footer-link" href="./press.html" target="_blank" rel="noopener"
              data-wt-wording="footer.press"></a>
          </div>
        </div>
      </div>
    `;
    }

    function hydrateFooter(root) {
        if (!root) return;

        const wording = window.WT_Wording;
        if (!wording || typeof wording.hydrate !== "function") return;

        wording.hydrate(root);

        // Locale-aware Bonjour Pickleball link
        try {
            const appUrlEl = root.querySelector("#wt-tyf-link");
            const appUrlSep = root.querySelector(".wt-footer-sep--tyf");

            if (appUrlEl) {
                const url = String(appUrlEl.getAttribute("href") || "").trim();
                const label = String(appUrlEl.textContent || "").trim();
                const shouldShow = !!url && url !== "#" && !!label;

                if (shouldShow) {
                    appUrlEl.setAttribute("target", "_blank");
                    appUrlEl.setAttribute("rel", "noopener");

                    appUrlEl.style.display = "";
                    if (appUrlSep) appUrlSep.style.display = "";
                } else {
                    appUrlEl.style.display = "none";
                    if (appUrlSep) appUrlSep.style.display = "none";
                }
            }
        } catch (_) { /* silent */ }

    }

    function tryInject() {
        const root = document.getElementById("wt-footer-root");
        if (!root) return;

        injectIntoFooterRoot(root);
        hydrateFooter(root);

        // Let email.js wire the contact link, but enforce FAIL-CLOSED here:
        // - If Contact text looks like an email (contains "@"), remove it (anti-leak).
        if (window.WT_Email && typeof window.WT_Email.initEmailLinks === "function") {
            window.WT_Email.initEmailLinks();
        }

        const contact = document.getElementById("wt-contact-link");
        if (contact) {
            const txt = String(contact.textContent || "").trim();
            const looksLikeEmail = txt.includes("@");

            // Fail-closed rules:
            // - Never show raw email as visible text.
            // - Keep Contact on all pages if wording exists; email.js wires behavior.
            const shouldRemove =
                looksLikeEmail ||
                (!txt);

            if (shouldRemove) {
                const sep = contact.nextElementSibling; contact.remove();
                if (sep && sep.classList && sep.classList.contains("wt-footer-sep")) {
                    sep.remove();
                }
            }
        }
    }

    tryInject();

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", tryInject);
    }

    // Locale reactivity: re-hydrate footer labels on locale change.
    // Footer DOM stays in place; only text content (and any data-wt-href) is refreshed.
    try {
        window.addEventListener("wt:locale-change", () => {
            const root = document.getElementById("wt-footer-root");
            if (root) hydrateFooter(root);
        });
    } catch (_) { /* silent */ }
})();

/* ===== i18n-toggle.js ===== */
// i18n-toggle.js — Locale switcher, fixed top-right
//
// Behavior:
//   - The button always displays the OTHER language (not the current one).
//   - When locale = "en", button shows "FR" → click switches to French.
//   - When locale = "fr", button shows "EN" → click switches to English.
//   - On localized entry pages (`/` and `/fr.html`), switching performs a
//     real navigation to the sibling locale page for cleaner SEO/share URLs.
//   - On other static bilingual pages (ex: success/privacy/terms), switching
//     stays in-place via WT_I18N.setLocale().
//
// Placement:
//   - Fixed top-right of viewport, respects mobile safe-area.
//   - No HTML change needed (the button injects itself into <body>).
//   - Hidden during PLAYING via CSS rule on body.wt-state--playing.
//
// Contract:
//   - i18n.js MUST load before this file
//   - Safe to load on static pages (no game state)
//   - If WT_I18N missing or only 1 locale, the file is a no-op
//   - If 3+ locales supported, falls back to a select dropdown (future-proof)

(() => {
  "use strict";

  const I18N = window.WT_I18N;
  if (!I18N || typeof I18N.getLocale !== "function") return;

  const locales = I18N.getSupportedLocales();
  if (!Array.isArray(locales) || locales.length < 2) return;

  // Display labels for the locale buttons. Hardcoded because they render in their
  // own script (a French speaker sees "EN" for English) and must show BEFORE
  // wording.js fully hydrates.
  const LABELS = {
    en: "EN",
    fr: "FR",
    // Future locales: es: "ES", de: "DE", ...
  };
  let host = null;
  let observer = null;
  let observedRoot = null;
  let remountRaf = 0;
  let prefetchLink = null;

  function getGlobeIconHtml() {
    return `<span class="wt-locale-swap__icon" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="14" height="14" focusable="false" aria-hidden="true">
        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.25"/>
        <path d="M2.5 8h11" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>
        <path d="M8 2.2c1.8 1.6 2.7 3.5 2.7 5.8S9.8 12.2 8 13.8C6.2 12.2 5.3 10.3 5.3 8S6.2 3.8 8 2.2Z" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/>
      </svg>
    </span>`;
  }

  function getLocaleName(loc) {
    const wording = window.WT_WORDING;
    const name = wording && wording.i18nToggle && wording.i18nToggle.languageNames
      ? wording.i18nToggle.languageNames[loc]
      : "";
    return String(name || LABELS[loc] || loc).trim();
  }

  function getSwitchAria(loc) {
    const wording = window.WT_WORDING;
    const template = String(wording?.i18nToggle?.switchToTemplate || "").trim();
    const localeName = getLocaleName(loc);
    if (template && localeName) {
      return template.replaceAll("{locale}", localeName);
    }
    return `Switch to ${LABELS[loc] || loc}`;
  }

  function getSelectorAria() {
    const wording = window.WT_WORDING;
    const explicit = String(wording?.i18nToggle?.selectorLabel || "").trim();
    return explicit || "Language selector";
  }

  function getOtherLocale(active) {
    // Single-click swap pattern: button shows the locale OTHER than active.
    // Only applies when exactly 2 supported locales.
    return locales.find((l) => l !== active) || locales[0];
  }

  function normalizePathname(pathname) {
    const raw = String(pathname || "").trim();
    if (!raw) return "/";
    return raw.replace(/\/+/g, "/");
  }

  function isLocalizedEntryPath(pathname) {
    const path = normalizePathname(pathname);
    return (
      path === "/" ||
      path.endsWith("/") ||
      path.endsWith("/index.html") ||
      path.endsWith("/fr.html")
    );
  }

  function getEntryHrefForLocale(loc) {
    const normalized = String(loc || "").trim().toLowerCase();
    if (normalized === "fr") return "./fr.html";
    return "./index.html";
  }

  function getNavigationHref(loc) {
    if (!isLocalizedEntryPath(window.location.pathname)) return "";
    return getEntryHrefForLocale(loc);
  }

  function persistLocaleChoice(loc) {
    const storageKey = String(window?.WT_CONFIG?.i18n?.localeStorageKey || "").trim();
    if (!storageKey) return;
    try {
      window.localStorage.setItem(storageKey, String(loc || "").trim().toLowerCase());
    } catch (_) { /* silent */ }
  }

  function ensureSiblingPrefetch() {
    const active = I18N.getLocale();
    const other = getOtherLocale(active);
    const href = getNavigationHref(other);
    if (!href) return;

    if (!prefetchLink) {
      prefetchLink = document.createElement("link");
      prefetchLink.setAttribute("rel", "prefetch");
      prefetchLink.setAttribute("as", "document");
      prefetchLink.setAttribute("data-wt-locale-prefetch", "1");
      document.head.appendChild(prefetchLink);
    }

    if (prefetchLink.getAttribute("href") !== href) {
      prefetchLink.setAttribute("href", href);
    }
  }

  function buildButtonHtml(active) {
    const other = getOtherLocale(active);
    const label = LABELS[other] || String(other).toUpperCase();
    const aria = getSwitchAria(other);
    const href = getNavigationHref(other);
    if (href) {
      return `<a
      class="wt-locale-swap"
      href="${href}"
      data-wt-locale-swap-to="${other}"
      aria-label="${aria}">${getGlobeIconHtml()}<span class="wt-locale-swap__label">${label}</span></a>`;
    }
    return `<button type="button"
      class="wt-locale-swap"
      data-wt-locale-swap-to="${other}"
      aria-label="${aria}">${getGlobeIconHtml()}<span class="wt-locale-swap__label">${label}</span></button>`;
  }

  function buildDropdownHtml(active) {
    // Used only if 3+ locales — single-click swap doesn't scale.
    const options = locales.map((loc) => {
      const sel = loc === active ? "selected" : "";
      const label = LABELS[loc] || String(loc).toUpperCase();
      return `<option value="${loc}" ${sel}>${label}</option>`;
    }).join("");
    return `<select class="wt-locale-dropdown" aria-label="${getSelectorAria()}"
      data-wt-locale-select>${options}</select>`;
  }

  function rerender(host) {
    if (!host) return;
    const active = I18N.getLocale();
    host.innerHTML = (locales.length === 2)
      ? buildButtonHtml(active)
      : buildDropdownHtml(active);
  }

  function ensureHost() {
    if (!host) {
      host = document.createElement("div");
      host.className = "wt-locale-toggle-host";
    }

    const slot = document.querySelector("[data-wt-locale-toggle-slot]");
    if (slot) {
      host.classList.remove("wt-locale-toggle-host--floating");
      if (host.parentNode !== slot) slot.appendChild(host);
      return host;
    }

    host.classList.add("wt-locale-toggle-host--floating");
    if (host.parentNode !== document.body) document.body.appendChild(host);
    return host;
  }

  function handleClick(e) {
    const target = e.target.closest && e.target.closest("[data-wt-locale-swap-to]");
    if (!target) return;

    const loc = target.getAttribute("data-wt-locale-swap-to");
    if (!loc) return;

    e.preventDefault();

    try {
      if (typeof e.stopPropagation === "function") e.stopPropagation();
    } catch (_) { /* silent */ }

    const href = getNavigationHref(loc);
    if (href) {
      persistLocaleChoice(loc);
      window.location.assign(href);
      return;
    }

    I18N.setLocale(loc);
  }

  function handleChange(e) {
    const target = e.target.closest && e.target.closest("[data-wt-locale-select]");
    if (!target) return;
    const loc = target.value;
    if (!loc) return;
    const href = getNavigationHref(loc);
    if (href) {
      persistLocaleChoice(loc);
      window.location.assign(href);
      return;
    }
    I18N.setLocale(loc);
  }

  function mount() {
    const mountHost = ensureHost();
    if (!mountHost) return;
    rerender(mountHost);
    ensureSiblingPrefetch();

    if (!mountHost.getAttribute("data-wt-toggle-bound")) {
      mountHost.setAttribute("data-wt-toggle-bound", "1");
      mountHost.addEventListener("click", handleClick);
      mountHost.addEventListener("change", handleChange);
      mountHost.addEventListener("pointerenter", () => ensureSiblingPrefetch(), { passive: true });
      mountHost.addEventListener("touchstart", () => ensureSiblingPrefetch(), { passive: true });
    }

    // Re-render on locale change so the label updates to the new "other" locale
    try {
      window.addEventListener("wt:locale-change", () => {
        const currentHost = ensureHost();
        rerender(currentHost);
        ensureSiblingPrefetch();
      });
    } catch (_) { /* silent */ }

    function bindObserver() {
      const root = document.getElementById("app");
      if (!("MutationObserver" in window)) return;

      if (observer && observedRoot === root) return;

      if (observer) {
        try { observer.disconnect(); } catch (_) { /* silent */ }
        observer = null;
        observedRoot = null;
      }

      if (!root) return;

      observer = new MutationObserver((mutations) => {
        const shouldRemount = mutations.some((mutation) => {
          if (!mutation) return false;
          if (host && mutation.target && host.contains(mutation.target)) return false;
          return mutation.type === "childList";
        });

        if (!shouldRemount || remountRaf) return;

        remountRaf = window.requestAnimationFrame(() => {
          remountRaf = 0;
          const currentHost = ensureHost();
          if (!currentHost) return;

          const currentButton = currentHost.querySelector("[data-wt-locale-swap-to], [data-wt-locale-select]");
          if (!currentButton) rerender(currentHost);
        });
      });
      observer.observe(root, { childList: true, subtree: true });
      observedRoot = root;
    }

    bindObserver();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();

/* ===== content-adapter.js ===== */
// content-adapter.js — Locale-aware content normalization
// Bridges i18n schema (item.i18n.{locale}.{question,explanationShort}) with the
// flat schema expected by game.js/ui.js (item.question, item.explanationShort).
//
// Backward-compatible:
//   - If item has no `i18n` block → leaves it alone (legacy schema works as-is)
//   - If item has `i18n[locale]` → mutates top-level question/explanationShort
//
// Design choice: mutate in place rather than clone. Reasons:
//   - Items are stored by reference in ui._runtime.contentItems
//   - Mutating in place propagates to all downstream consumers without churn
//   - Memory-efficient (no per-locale array duplication)
//
// Usage:
//   const items = content.items;
//   WT_ContentAdapter.applyLocaleToItems(items, "fr");
//   ui.setContent(items);
//
// On locale change:
//   WT_ContentAdapter.applyLocaleToItems(rawItems, newLocale);
//   ui.render();  // ui will pick up the mutated values
//
// Important runtime note:
//   Locale switching is safe between screens, but a share/export flow that reads
//   content text after a locale toggle will use the newly mutated top-level fields.
//   This is intentional for the current product: sharing reflects the active locale,
//   not necessarily the locale used when the just-finished run started.

(() => {
  "use strict";

  function pickLocaleText(item, locale, key) {
    // Priority:
    //   1. item.i18n[locale][key]            ← preferred (post-Phase 3)
    //   2. item.i18n[defaultLocale][key]     ← fallback to default
    //   3. item.i18n.en[key]                 ← fallback to English
    //   4. item[key]                          ← legacy flat schema
    const i18n = item && item.i18n;
    if (i18n && typeof i18n === "object") {
      const localeBlock = i18n[locale];
      if (localeBlock && typeof localeBlock[key] === "string") {
        return localeBlock[key];
      }
      // Try the configured default locale
      const cfg = window.WT_CONFIG;
      const defaultLoc = cfg && cfg.i18n && cfg.i18n.defaultLocale;
      if (defaultLoc && defaultLoc !== locale) {
        const defaultBlock = i18n[defaultLoc];
        if (defaultBlock && typeof defaultBlock[key] === "string") {
          return defaultBlock[key];
        }
      }
      // Try English as ultimate fallback
      if (i18n.en && typeof i18n.en[key] === "string") {
        return i18n.en[key];
      }
    }
    // Legacy flat schema
    if (typeof item[key] === "string") return item[key];
    return "";
  }

  function applyLocaleToItem(item, locale) {
    if (!item || typeof item !== "object") return item;
    item.question = pickLocaleText(item, locale, "question");
    item.explanationShort = pickLocaleText(item, locale, "explanationShort");
    return item;
  }

  function applyLocaleToItems(items, locale) {
    if (!Array.isArray(items)) return items;
    const loc = String(locale || "en");
    for (const item of items) applyLocaleToItem(item, loc);
    return items;
  }

  function hasI18nSchema(items) {
    if (!Array.isArray(items) || !items.length) return false;
    // Sample a few items to determine schema (handles partial migrations)
    let withI18n = 0;
    const sampleSize = Math.min(10, items.length);
    for (let i = 0; i < sampleSize; i++) {
      if (items[i] && items[i].i18n && typeof items[i].i18n === "object") withI18n++;
    }
    return (withI18n * 2) >= sampleSize;
  }

  window.WT_ContentAdapter = {
    applyLocaleToItem,
    applyLocaleToItems,
    pickLocaleText,
    hasI18nSchema
  };
})();

/* ===== main.js ===== */
// main.js v2.0 - App bootstrap

(() => {
  'use strict';

  function buildUpdateReloadUrl() {
    const url = new URL(window.location.href);
    url.searchParams.set('wt-refresh', String(Date.now()));
    return url.toString();
  }

  function reloadForUpdate() {
    try {
      Logger.log('[UPDATE] reloadForUpdate', { href: window.location.href });
    } catch (_) {}
    window.location.assign(buildUpdateReloadUrl());
  }

  function escapeHtmlSafe(str) {
    const s = String(str == null ? '' : str);
    const fn =
      window.WT_UTILS && typeof window.WT_UTILS.escapeHtml === 'function'
        ? window.WT_UTILS.escapeHtml
        : null;

    if (!fn) {
      throw new Error(
        'WT_UTILS.escapeHtml missing. config.js must load before main.js.'
      );
    }

    return String(fn(s));
  }

  function pickOne(arr, fallback) {
    const list = Array.isArray(arr)
      ? arr.map((x) => String(x || '').trim()).filter(Boolean)
      : [];
    if (!list.length) return String(fallback || '').trim();
    const index = Math.floor(Math.random() * list.length);
    return list[index] || String(fallback || '').trim();
  }

  function fillTemplateLocal(template, vars) {
    let out = String(template == null ? '' : template);
    const map = vars && typeof vars === 'object' ? vars : {};
    for (const [key, value] of Object.entries(map)) {
      out = out.replaceAll(`{${key}}`, String(value == null ? '' : value));
    }
    return out;
  }

  function getActiveWording() {
    try {
      const direct = window.WT_WORDING;
      if (direct && typeof direct === 'object') return direct;

      const all = window.WT_WORDING_ALL;
      const loc =
        window.WT_I18N && typeof window.WT_I18N.getLocale === 'function'
          ? window.WT_I18N.getLocale()
          : String(window.WT_CONFIG?.i18n?.defaultLocale || 'en');
      if (all && typeof all === 'object') {
        return (
          all[loc] || all[window.WT_CONFIG?.i18n?.defaultLocale] || all.en || {}
        );
      }
    } catch (_) {}
    return {};
  }

  function getSystemCopy(key, fallback, vars) {
    try {
      const wording = getActiveWording();
      const raw =
        wording && wording.system && typeof wording.system[key] === 'string'
          ? wording.system[key]
          : fallback;
      return fillTemplateLocal(raw, vars);
    } catch (_) {
      return fillTemplateLocal(fallback, vars);
    }
  }

  // ============================================
  // Logger (like TYF)
  // ============================================
  const Logger = {
    debug: (...args) =>
      window.WT_CONFIG?.debug?.enabled &&
      window.WT_CONFIG.debug.logLevel === 'debug' &&
      console.log('[WT Debug]', ...args),

    log: (...args) =>
      window.WT_CONFIG?.debug?.enabled &&
      ['debug', 'log'].includes(window.WT_CONFIG.debug.logLevel) &&
      console.log('[WT]', ...args),

    warn: (...args) =>
      window.WT_CONFIG?.debug?.enabled && console.warn('[WT Warning]', ...args),

    error: (...args) => console.error('[WT Error]', ...args)
  };

  window.Logger = Logger;

  // ============================================
  // Error display
  // ============================================
  function showFatal(message) {
    const root = document.getElementById('app');
    if (!root) return;

    const safeMsg = escapeHtmlSafe(message);
    const appName = escapeHtmlSafe(
      String(window.WT_CONFIG?.identity?.appName || 'Game').trim()
    );

    root.innerHTML = `
      <div class="wt-card wt-card--error">
        <h1 class="wt-h1">${appName}</h1>
        <p class="wt-muted">${safeMsg}</p>
        <button id="wtFatalReloadBtn" class="wt-btn wt-btn--secondary" type="button">${escapeHtmlSafe(getSystemCopy('fatalReload', 'Reload'))}</button>
      </div>
    `;

    const btn = document.getElementById('wtFatalReloadBtn');
    if (btn) btn.addEventListener('click', reloadForUpdate);
  }

  window.showFatal = showFatal;

  // ============================================
  // Global error handlers
  // ============================================
  window.addEventListener('error', (event) => {
    Logger.error('Global error:', event.error || event);

    if (window.__WT_APP_BOOTED__ === true) return;

    const isDev = window.WT_CONFIG?.debug?.enabled;
    const errorMsg = event.message || event.error?.message || 'Unknown error';
    showFatal(
      isDev
        ? getSystemCopy(
            'fatalJavascriptPrefix',
            'JavaScript Error: {message}',
            { message: errorMsg }
          )
        : getSystemCopy(
            'fatalLoadFailed',
            'Unable to load the game. Please refresh the page.'
          )
    );
  });

  window.addEventListener('unhandledrejection', (event) => {
    Logger.error('Unhandled promise rejection:', event.reason);

    if (window.__WT_APP_BOOTED__ === true) return;

    const isDev = window.WT_CONFIG?.debug?.enabled;
    const errorMsg = event.reason?.message || 'Promise rejection';
    showFatal(
      isDev
        ? getSystemCopy('fatalPromisePrefix', 'Promise Error: {message}', {
            message: errorMsg
          })
        : getSystemCopy(
            'fatalUnexpected',
            'An unexpected issue occurred. Please refresh the page.'
          )
    );
  });
  // ============================================
  // Content loader
  // ============================================
  async function loadJson(url) {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Failed to load ${url}: ${res.status}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(
        `Invalid JSON response for ${url} (content-type: ${contentType})`
      );
    }

    return await res.json();
  }

  // ============================================
  // Service Worker registration
  // ============================================
  function initServiceWorker() {
    const cfg = window.WT_CONFIG;
    if (!cfg || typeof cfg !== 'object') return;
    if (cfg?.serviceWorker?.enabled !== true) return;
    if (cfg.environment === 'development') return;

    if (!('serviceWorker' in navigator)) {
      Logger.warn('Service Worker not supported');
      return;
    }

    function getUpdateToastStorageKey() {
      try {
        const storageKey = String(cfg?.storage?.storageKey || '').trim();
        if (!storageKey) return '';
        return `wt-sw-update-toast-seen:${storageKey}`;
      } catch (_) {
        return '';
      }
    }

    function getWaitingWorkerKey(worker) {
      const w = worker || window.__WT_SW_WAITING__ || null;
      return String(w?.scriptURL || w?.state || 'waiting').trim();
    }

    function hasSeenUpdateToast(waitingKey) {
      const key = String(waitingKey || '').trim();
      if (!key) return false;

      if (window.__WT_SW_LAST_TOAST_KEY__ === key) return true;

      const storageKey = getUpdateToastStorageKey();
      if (!storageKey) return false;

      try {
        return window.localStorage.getItem(storageKey) === key;
      } catch (_) {
        return false;
      }
    }

    function markUpdateToastSeen(waitingKey) {
      const key = String(waitingKey || '').trim();
      if (!key) return;

      window.__WT_SW_LAST_TOAST_KEY__ = key;

      const storageKey = getUpdateToastStorageKey();
      if (!storageKey) return;

      try {
        window.localStorage.setItem(storageKey, key);
      } catch (_) {}
    }

    function hideUpdateToast() {
      const node = document.getElementById('update-toast');
      if (node && node.classList) node.classList.remove('wt-toast--visible');
    }

    function showUpdateToast(message) {
      const msg = String(message || '').trim();
      if (!msg) return;

      // KISS: reuse the existing #update-toast shell from index.html
      const node = document.getElementById('update-toast');
      if (!node) return;

      const waitingKey = getWaitingWorkerKey(window.__WT_SW_WAITING__ || null);
      if (!waitingKey) return;

      if (hasSeenUpdateToast(waitingKey)) {
        window.__WT_SW_UPDATE_READY__ = true;
        hideUpdateToast();
        return;
      }

      // Mark update ready so UI can decide when to apply it (user-controlled).
      // Persist the seen key immediately. If iOS/PWA keeps the same waiting worker
      // across reloads, the user is not asked again and again.
      window.__WT_SW_UPDATE_READY__ = true;
      markUpdateToastSeen(waitingKey);

      const text = node.querySelector('[data-wt-update-text]');
      if (text) text.textContent = msg;

      node.classList.add('wt-toast--visible');
    }

    function setWaitingWorker(worker) {
      if (!worker) return;
      window.__WT_SW_WAITING__ = worker;
      window.__WT_SW_UPDATE_READY__ = true;
    }

    async function tryPromoteInstallingWorker(worker) {
      if (!worker) return false;
      if (worker.state === 'installed') {
        setWaitingWorker(worker);
        return true;
      }

      return await new Promise((resolve) => {
        let done = false;

        function finish(ok) {
          if (done) return;
          done = true;
          resolve(ok === true);
        }

        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed') {
            setWaitingWorker(worker);
            finish(true);
            return;
          }

          if (worker.state === 'redundant') {
            finish(false);
          }
        });

        window.setTimeout(() => finish(false), 4000);
      });
    }

    window.__WT_APPLY_SW_UPDATE__ = async function () {
      if (window.__WT_SW_UPDATE_IN_FLIGHT__ === true) return;

      hideUpdateToast();

      let fallbackTimer = null;
      function armFallbackReload() {
        if (fallbackTimer) return;
        fallbackTimer = window.setTimeout(() => {
          fallbackTimer = null;
          reloadForUpdate();
        }, 2500);
      }

      const registration = window.__WT_SW_REGISTRATION__ || null;
      let waiting = window.__WT_SW_WAITING__ || registration?.waiting || null;

      if (!waiting && registration) {
        try {
          await registration.update();
        } catch (_) {}
        waiting = registration.waiting || null;
      }

      if (!waiting && registration?.installing) {
        const ready = await tryPromoteInstallingWorker(registration.installing);
        if (ready) {
          waiting = window.__WT_SW_WAITING__ || registration.waiting || null;
        }
      }

      if (!waiting || typeof waiting.postMessage !== 'function') {
        reloadForUpdate();
        return;
      }

      try {
        window.__WT_SW_RELOAD_ON_CONTROLLERCHANGE__ = true;
      } catch (_) {}
      try {
        window.__WT_SW_UPDATE_IN_FLIGHT__ = true;
      } catch (_) {}

      try {
        armFallbackReload();
        waiting.postMessage({ type: 'SKIP_WAITING' });
      } catch (_) {
        try {
          window.__WT_SW_RELOAD_ON_CONTROLLERCHANGE__ = false;
        } catch (_) {}
        try {
          window.__WT_SW_UPDATE_IN_FLIGHT__ = false;
        } catch (_) {}
        reloadForUpdate();
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      try {
        Logger.log('[UPDATE] controllerchange');
      } catch (_) {}
      if (window.__WT_SW_RELOAD_ON_CONTROLLERCHANGE__ !== true) return;
      try {
        window.__WT_SW_RELOAD_ON_CONTROLLERCHANGE__ = false;
      } catch (_) {}
      try {
        window.__WT_SW_UPDATE_IN_FLIGHT__ = false;
      } catch (_) {}
      reloadForUpdate();
    });

    window.addEventListener('load', () => {
      const version = String(cfg.version || '').trim();
      if (!version) {
        Logger.warn(
          'WT_CONFIG.version missing/empty: skipping Service Worker registration (fail-closed)'
        );
        return;
      }

      const storageKey = String(cfg?.storage?.storageKey || '').trim();
      if (!storageKey) {
        Logger.warn(
          'WT_CONFIG.storage.storageKey missing/empty: skipping Service Worker registration (fail-closed)'
        );
        return;
      }

      const v = encodeURIComponent(version);
      const appScope = encodeURIComponent(storageKey);
      const swUrl = `./sw.js?v=${v}&app=${appScope}`;

      navigator.serviceWorker
        .register(swUrl, { scope: './' })
        .then((registration) => {
          window.__WT_SW_REGISTRATION__ = registration;
          Logger.log('✅ Service Worker registered:', registration.scope);

          // Update already waiting from a previous page session: surface it immediately.
          if (
            cfg.serviceWorker.showUpdateNotifications &&
            registration.waiting &&
            navigator.serviceWorker.controller
          ) {
            setWaitingWorker(registration.waiting);
            const msg = String(
              window.WT_WORDING?.system?.updateAvailable || ''
            ).trim();
            if (msg) showUpdateToast(msg);
          }

          // Auto-update check
          if (cfg.serviceWorker.autoUpdate) {
            if (window.__WT_SW_AUTO_UPDATE_INTERVAL__) {
              window.clearInterval(window.__WT_SW_AUTO_UPDATE_INTERVAL__);
            }

            window.__WT_SW_AUTO_UPDATE_INTERVAL__ = window.setInterval(
              () => {
                registration.update().catch(() => {});
              },
              10 * 60 * 1000
            ); // Every 10 min
          }

          // Update notification (config: showUpdateNotifications)
          // IMPORTANT: never auto-reload (can kill an active run). User-controlled reload only.
          if (cfg.serviceWorker.showUpdateNotifications) {
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (!newWorker) return;

              newWorker.addEventListener('statechange', () => {
                // Only notify when updating an already-controlled page
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  setWaitingWorker(newWorker);
                  const msg = String(
                    window.WT_WORDING?.system?.updateAvailable || ''
                  ).trim();
                  if (msg) showUpdateToast(msg);
                }
              });
            });
          }
        })
        .catch((err) => {
          Logger.warn(
            'Service Worker registration failed:',
            err?.message || err
          );
        });
    });
  }

  // ============================================
  // Validation
  // ============================================
  function validatePrerequisites() {
    if (!window.WT_CONFIG) {
      Logger.error('WT_CONFIG not found');
      showFatal(
        getSystemCopy(
          'fatalConfigMissing',
          'Configuration error: application settings not loaded.'
        )
      );
      return false;
    }

    let storageOk = false;
    try {
      const ls = window.localStorage;
      if (ls) {
        const probeKey = '__wt_storage_probe__';
        ls.setItem(probeKey, '1');
        ls.removeItem(probeKey);
        storageOk = true;
      }
    } catch (_) {
      storageOk = false;
    }

    if (!storageOk) {
      Logger.error('localStorage not supported or unavailable');
      showFatal(
        getSystemCopy(
          'fatalStorageUnsupported',
          'Your browser does not support local storage. Please use a modern browser.'
        )
      );
      return false;
    }

    const appContainer = document.getElementById('app');
    if (!appContainer) {
      Logger.error('App container not found');
      showFatal(
        getSystemCopy(
          'fatalAppContainerMissing',
          'Critical error: app container not found.'
        )
      );
      return false;
    }

    return true;
  }

  function validateModules() {
    // IMPORTANT:
    // StorageManager is a reserved native name in browsers (Storage API).
    // Our app storage class must NOT use that global name.
    const required = ['WT_StorageManager', 'WT_Game', 'WT_UI', 'WT_ICONS'];
    const missing = required.filter((name) => !window[name]);

    if (missing.length > 0) {
      Logger.error(`Missing modules: ${missing.join(', ')}`);
      showFatal(
        getSystemCopy(
          'fatalComponentsMissing',
          'Unable to load game components: {components}. Please refresh the page.',
          { components: missing.join(', ') }
        )
      );
      return false;
    }

    if (typeof window.WT_ICONS.renderIcon !== 'function') {
      Logger.error('WT_ICONS.renderIcon missing');
      showFatal(
        getSystemCopy(
          'fatalIconsMissing',
          'Unable to load game components: WT_ICONS.renderIcon. Please refresh the page.'
        )
      );
      return false;
    }

    return true;
  }

  // ============================================
  // Loading screen
  // ============================================
  function showLoadingScreen() {
    const root = document.getElementById('app');
    if (!root) return;

    const wording = window.WT_WORDING;
    const sys =
      wording &&
      typeof wording === 'object' &&
      wording.system &&
      typeof wording.system === 'object'
        ? wording.system
        : null;

    if (!sys) return;

    const title = String(sys.loadingTitle || '').trim();
    const hint = String(sys.loadingHint || '').trim();
    const logoUrl = String(window.WT_CONFIG?.identity?.uiLogoUrl || '').trim();
    const loadingVisual = logoUrl
      ? `<img src="${escapeHtmlSafe(logoUrl)}" alt="" class="wt-loading-icon" />`
      : `<div class="wt-loading-icon">●</div>`;

    root.innerHTML = `
    <div class="wt-loading">
      ${loadingVisual}
      <div class="wt-loading-spinner"></div>
      <h2 class="wt-h2">${escapeHtmlSafe(title)}</h2>
      <p class="wt-muted">${escapeHtmlSafe(hint)}</p>
    </div>
  `;
  }

  // ============================================
  // ============================================
  // Main application start
  // ============================================
  async function startApplication() {
    showLoadingScreen();

    try {
      const config = window.WT_CONFIG;
      if (!config || typeof config !== 'object') {
        Logger.error('WT_CONFIG missing or invalid');
        showFatal(
          getSystemCopy(
            'fatalConfigMissing',
            'Configuration error: application settings not loaded.'
          )
        );
        return;
      }

      const wording = window.WT_WORDING;
      if (!wording || typeof wording !== 'object') {
        Logger.error('WT_WORDING missing or invalid');
        showFatal(
          getSystemCopy(
            'fatalWordingMissing',
            'Configuration error: UI wording not loaded.'
          )
        );
        return;
      }

      // Init storage
      const storage = new window.WT_StorageManager(config);
      storage.init();
      window.storageManager = storage; // Global for debug

      // Init game engine
      const game = new window.WT_Game.GameEngine();

      // Init UI immediately (LANDING is not content-dependent)
      const ui = new window.WT_UI({ storage, game, config, wording });
      if (ui && typeof ui.setContentLoading === 'function')
        ui.setContentLoading(true);

      // Listen for storage updates (KISS)
      // Contract (intentional): StorageManager emits a single global event "storage-updated".
      // UI refresh strategy is FULL re-render on any mutation (no granular diffs).
      // Reason: preserve inter-module coherence and avoid partial UI desync bugs.
      if (window.__WT_ON_STORAGE_UPDATED__) {
        window.removeEventListener(
          'storage-updated',
          window.__WT_ON_STORAGE_UPDATED__
        );
      }
      window.__WT_ON_STORAGE_UPDATED__ = () => ui.onStorageUpdated();
      window.addEventListener(
        'storage-updated',
        window.__WT_ON_STORAGE_UPDATED__
      );

      if (window.__WT_ON_STORAGE_SAVE_FAILED__) {
        window.removeEventListener(
          'storage-save-failed',
          window.__WT_ON_STORAGE_SAVE_FAILED__
        );
      }
      window.__WT_ON_STORAGE_SAVE_FAILED__ = () => {
        if (ui && typeof ui.onStorageSaveFailed === 'function')
          ui.onStorageSaveFailed();
      };
      window.addEventListener(
        'storage-save-failed',
        window.__WT_ON_STORAGE_SAVE_FAILED__
      );

      ui.init();

      try {
        const onLocaleChange = () => {
          try {
            const newLoc =
              window.WT_I18N && window.WT_I18N.getLocale
                ? window.WT_I18N.getLocale()
                : 'en';
            const reopenLeaderboardModal = !!(
              ui &&
              ui._runtime &&
              ui._runtime._modalKey === 'leaderboard' &&
              typeof ui.openLeaderboardModal === 'function'
            );

            if (ui) {
              if (
                reopenLeaderboardModal &&
                typeof ui.closeModal === 'function'
              ) {
                ui.closeModal();
              }

              ui.wording = window.WT_WORDING;

              if (
                window.WT_ContentAdapter &&
                ui._runtime &&
                Array.isArray(ui._runtime.contentItems)
              ) {
                window.WT_ContentAdapter.applyLocaleToItems(
                  ui._runtime.contentItems,
                  newLoc
                );
              }

              if (typeof ui.render === 'function') {
                ui.render();
              }

              try {
                const announcer = document.getElementById('locale-feedback');
                const wording = window.WT_WORDING || {};
                const localeW = wording.i18nToggle || {};
                const systemW = wording.system || {};
                const localeName = String(
                  localeW.languageNames?.[newLoc] || newLoc
                ).trim();
                const tpl = String(
                  systemW.localeChangedTemplate || 'Language changed to {locale}'
                ).trim();
                if (announcer && localeName) {
                  announcer.textContent = '';
                  window.requestAnimationFrame(() => {
                    try {
                      announcer.textContent = fillTemplateLocal(tpl, {
                        locale: localeName
                      });
                    } catch (_) {
                      /* silent */
                    }
                  });
                }
              } catch (_) {
                /* silent */
              }

              if (reopenLeaderboardModal) {
                ui.openLeaderboardModal();
              }
            }
          } catch (e) {
            try {
              Logger.warn('[main] locale-change handler failed', e);
            } catch (_) {
              /* silent */
            }
          }
        };

        if (window.__WT_ON_LOCALE_CHANGE__) {
          window.removeEventListener(
            'wt:locale-change',
            window.__WT_ON_LOCALE_CHANGE__
          );
        }
        window.__WT_ON_LOCALE_CHANGE__ = onLocaleChange;
        window.addEventListener('wt:locale-change', onLocaleChange);
      } catch (_) {
        /* silent */
      }

      // Boot optimization: if a premium code was saved by success.html, prompt instant activation.
      // Single source of truth: ui.js (promptAutoRedeemIfReady + howto.autoActivate* wording).
      if (ui && typeof ui.promptAutoRedeemIfReady === 'function') {
        try {
          ui.promptAutoRedeemIfReady();
        } catch (_) {
          /* silent */
        }
      }

      // Load content in parallel during boot
      loadJson(config.contentUrl)
        .then((content) => {
          const items = Array.isArray(content.items) ? content.items : [];

          if (!items.length) {
            if (ui && typeof ui.setContentLoading === 'function')
              ui.setContentLoading(false);
            showFatal(
              getSystemCopy(
                'fatalContentUnavailable',
                'Content not available. Please check your connection and reload.'
              )
            );
            return;
          }

          try {
            if (window.WT_ContentAdapter && window.WT_I18N) {
              window.WT_ContentAdapter.applyLocaleToItems(
                items,
                window.WT_I18N.getLocale()
              );
            }
          } catch (_) {
            /* silent */
          }
          ui.setContent(items);
          if (ui && typeof ui.setContentLoading === 'function')
            ui.setContentLoading(false);
          ui.render();

          window.__WT_APP_BOOTED__ = true;
          Logger.log(`Content loaded: ${items.length} items`);
        })
        .catch((error) => {
          Logger.error('Content load error:', error);
          showFatal(
            `${getSystemCopy('fatalDataLoadFailed', 'Unable to load game data. Please check your connection and refresh.')}${window.WT_CONFIG?.debug?.enabled ? ` Error: ${error.message}` : ''}`
          );
        });

      // Secret bonus (END chest) - orchestration lives in main.js (KISS)
      // ui.js dispatches: "wt-secret-bonus-requested"
      if (window.__WT_ON_OPEN_SUPPORT__) {
        document.removeEventListener(
          'wt-open-support',
          window.__WT_ON_OPEN_SUPPORT__
        );
      }
      window.__WT_ON_OPEN_SUPPORT__ = () => {
        try {
          ui.openSupportModal();
        } catch (_) {
          /* silent */
        }
      };
      document.addEventListener(
        'wt-open-support',
        window.__WT_ON_OPEN_SUPPORT__
      );

      if (window.__WT_ON_SECRET_BONUS_REQUESTED__) {
        window.removeEventListener(
          'wt-secret-bonus-requested',
          window.__WT_ON_SECRET_BONUS_REQUESTED__
        );
      }
      window.__WT_ON_SECRET_BONUS_REQUESTED__ = () => {
        try {
          // The UI owns gameplay screens; main.js just triggers the entry point.
          if (ui && typeof ui.startSecretBonusRun === 'function') {
            ui.startSecretBonusRun();
          }
        } catch (_) {
          // Never break gameplay for a hidden bonus hook
        }
      };
      window.addEventListener(
        'wt-secret-bonus-requested',
        window.__WT_ON_SECRET_BONUS_REQUESTED__
      );

      // Init email links
      if (
        window.WT_Email &&
        typeof window.WT_Email.initEmailLinks === 'function'
      ) {
        window.WT_Email.initEmailLinks();
      }

      // Init PWA
      if (typeof window.WT_PWA !== 'undefined' && window.WT_PWA.initPWA) {
        window.WT_PWA.initPWA(storage, ui);
      }

      Logger.log(
        `✅ ${config.identity.appName} v${config.version} started successfully`
      );
    } catch (error) {
      Logger.error('Startup error:', error);
      showFatal(
        `${getSystemCopy('fatalDataLoadFailed', 'Unable to load game data. Please check your connection and refresh.')}${window.WT_CONFIG?.debug?.enabled ? ` Error: ${error.message}` : ''}`
      );
    }
  }

  // ============================================
  // DOMContentLoaded
  // ============================================
  document.addEventListener('DOMContentLoaded', () => {
    const cfg = window.WT_CONFIG;
    const version = String(cfg?.version || '').trim();
    const env = String(cfg?.environment || '').trim();

    if (!version) Logger.warn('WT_CONFIG.version missing/empty');
    if (!env) Logger.warn('WT_CONFIG.environment missing/empty');

    const appName = String(cfg?.identity?.appName || 'Game').trim();

    if (version && env)
      Logger.log(`Initializing ${appName} v${version} (${env})`);
    else if (version) Logger.log(`Initializing ${appName} v${version}`);
    else Logger.log(`Initializing ${appName}`);

    if (!validatePrerequisites()) return;
    if (!validateModules()) return;

    startApplication();
  });

  // Init service worker immediately (before DOMContentLoaded)
  initServiceWorker();

  // ============================================
  // Debug tools
  // ============================================
  if (window.WT_CONFIG?.debug?.enabled) {
    window.WT_DEBUG = {
      Logger,
      config: window.WT_CONFIG,
      wording: window.WT_WORDING,
      get storage() {
        return window.storageManager;
      },
      resetStorage() {
        if (
          window.storageManager &&
          typeof window.storageManager.resetAll === 'function'
        ) {
          window.storageManager.resetAll();
        }

        location.reload();
      }
    };
  }
})();
