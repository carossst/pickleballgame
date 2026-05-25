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
    version: "4.0",

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
      cardIdsByRun: {
        1: [33, 44, 49, 107, 140, 155, 157, 182, 196, 28],
        2: [22, 29, 60, 156, 180, 194, 62, 104, 123, 141, 172, 174]
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

      // Set this to your deployed Worker URL later, for example:
      // "https://prq-leaderboard.<subdomain>.workers.dev"
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
      toEmailCipher: {
        key: 23,
        codes: [116, 120, 121, 99, 118, 116, 99, 87, 117, 120, 121, 125, 120, 98, 101, 103, 126, 116, 124, 123, 114, 117, 118, 123, 123, 57, 113, 101]
      },
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
      emailCipher: {
        key: 23,
        codes: [116, 120, 121, 99, 118, 116, 99, 87, 117, 120, 121, 125, 120, 98, 101, 103, 126, 116, 124, 123, 114, 117, 118, 123, 123, 57, 113, 101]
      },
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
