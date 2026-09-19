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
