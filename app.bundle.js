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
