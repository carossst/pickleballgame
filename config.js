// config.js v2.0 - Word Traps
// Configuration + UI copy (single file, no split)

(() => {
  "use strict";

  // 9.1 Environment detection
  const hostname = window.location.hostname;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
  const isGitHubPages = hostname.includes("github.io");

  // Single source of truth for storage-related keys (avoid drift)
  const WT_STORAGE_KEY = "tyf_wordtraps_v2";
  const WT_VANITY_CODE_STORAGE_KEY = "wt:vanityCode";


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
    version: "2",

    // Storage schema version (localStorage).
    // Change ONLY if you accept a migration/wipe.
    storageSchemaVersion: "2.0.0",

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
      appName: "Word Traps",
      appUrl: "https://wordtraps.app",
      parentUrl: "https://www.testyourfrench.com",

      // UI signature icon (in-card). Single source of truth for in-app branding.
      uiLogoUrl: "./icons/icon512x512-rond.png"
    },

    // Storage (single source of truth)
    storage: {
      storageKey: WT_STORAGE_KEY,
      vanityCodeStorageKey: WT_VANITY_CODE_STORAGE_KEY
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

    // Practice mode (Mistakes only) - premium
    // PRODUCT DECISION (kept):
    // - Returns ALL wrong items (variable length) in mistakesOnly mode
    mistakesOnly: {
      enabled: true,
      minWrongItemsToShowToggle: 1,
      premiumOnly: true
    },

    // Personal best (premium history)
    personalBest: {
      enabled: true,
      premiumOnly: true
    },

    // Premium code flow (TYF-like)
    premiumCodePrefix: "WT",
    premiumCodeRegex: "^WT-[A-Z0-9]{4}-[A-Z0-9]{4}$",
    acceptCodeOncePerDevice: true,

    // Pricing (Stripe)
    currency: "USD",
    earlyPriceCents: 499,
    standardPriceCents: 699,
    earlyPriceWindowMs: 20 * 60 * 1000, // 20 minutes
    stripeEarlyPaymentUrl: "https://buy.stripe.com/14AaEX17VeVwaei7Ig2Nq04",
    stripeStandardPaymentUrl: "https://buy.stripe.com/7sY3cv8AnfZAgCG3s02Nq05",
    successRedirectUrl: "./success.html",

    // Marketing (opt-in only; Stripe receipt email is NOT marketing consent)
    marketing: {
      // External signup form URL (Mailchimp / ConvertKit / Buttondown / etc.)
      // Fail-closed in success.html if not set / still placeholder.
      updatesUrl: "",



      // Order bump (Cheat Sheet PDF) - serverless "trust-by-design" via ConvertKit embed.
      // Fail-closed in success.html unless explicitly enabled AND fully configured.
      cheatSheetOrderBump: {
        enabled: true,
        convertKitUid: "ed7df33449",
        convertKitScriptSrc: "https://onlinenewsletter.kit.com/ed7df33449/index.js"
      }
    },



    houseAd: {
      enabled: true,
      premiumOnly: false,
      url: "https://app.testyourfrench.com/",
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
      cooldownItems: 3, // nb d'items minimum entre deux micro-pics

      // Seuils de streak (mécanique). La copy correspondante reste dans WT_WORDING.micropics.*
      streakThresholds: {
        start: 3,
        building: 6,
        strong: 10,
        elite: 15,
        legendary: 20
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
          durationMs: 1400
        },

        // Timing bucket for micro-pics / micro-satisfaction
        positive: {
          delayMs: 0,
          durationMs: 1200
        },

        // Timing bucket for "+1" after a correct answer (no fallback in UI)
        scoreGained: {
          delayMs: 0,
          durationMs: 900
        }
      },

      // Gameplay overlay dismiss policy (UI-only, fail-closed)
      // true => allow tap to dismiss gameplay overlays (info/success only)
      toastDismissOnTap: true,



      // Overlays (PLAYING)
      // - chanceLostOverlayMs: -1 chance + "Game over" window
      // - runStartOverlayMs: start-of-run + BONUS rules
      chanceLostOverlayMs: 2000,
      runStartOverlayMs: 2400,


      // Pulses (HUD) + extension window for last-chance overlay
      gameplayPulseMs: 950,

      // END (RUN): "Record moment" window (UI-only).
      // If > 0, END temporarily shows WT_WORDING.end.newBest instead of the scoreLine when newBest=true.
      endRecordMomentMs: 900,


      // PLAYING micro-howto policy (UI-only, fail-closed)
      // enabled: allows displaying WT_WORDING.playing.microHowTo
      // oncePerDevice: show only until firstRunFramingSeen is set on this device
      // hideAssertionWhenShown: avoids double-line stacking on small screens
      playingMicroHowTo: {
        enabled: true,
        oncePerDevice: true,
        hideAssertionWhenShown: true
      },



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
        maxLines: 2,
        splitRegex: "\\.\\s+" // first sentence boundary
      }
    },


    // LANDING stats micro-graphs (UI-only; no copy here)
    landingStats: {
      enabled: true,

      // FP spark bars: show last N run scores (RUN mode only)
      sparkRunsCount: 5
    },



    // Secret bonus mode
    secretBonus: {
      minDeckSize: 5,
      enabled: true,

      // Teaser premium: free users can start only N bonus runs (lifetime, device-local)
      freeRunsLimit: 2,

      // Entry points (canonical gates)
      // END: show chest after N completed runs (0 = always show on END)
      // LANDING: show chest after N completed runs (0 = always show on LANDING)
      gates: {
        endAfterRuns: 0,
        landingAfterRuns: 2
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
      }






    },


    // Waitlist
    waitlist: {
      enabled: true,

      // Unlock threshold (unique seen items)
      minUniqueSeenToShow: 120,

      // UI routing:
      // - END: can appear when pool is exhausted (first reveal)
      // - LANDING: appears after it has been revealed once (persisted flag)
      placement: "end-and-landing-after-seen-once",

      afterPoolExhaustedOnly: false,
      showModalOneShot: false,

      // Obfuscated email (anti-scraping)
      toEmailObfuscated: "bonjour&#64;testyourfrench&#46;com",
      // IMPORTANT: keep this as a pure prefix (UI/email helpers may append details)
      subjectPrefix: "[Word Traps][Waitlist]"

    },

    // Post-completion (pool exhausted): LANDING block + cross-sell
    postCompletion: {
      enabled: true,
      waitlistEnabled: true,
      houseAdEnabled: true
    },



    // Anonymous stats sharing (opt-in, no backend)
    statsSharing: {
      enabled: true,
      emailSubject: "[Word Traps][Stats] Anonymous stats",
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
      promptOnFreeRunsExhausted: true
    },



    // Support
    support: {
      emailObfuscated: "bonjour&#64;testyourfrench&#46;com",
      subjectPrefix: "[Word Traps][Contact]"
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
  // WORD TRAPS — LEXICAL IDENTITY (Momentum)
  // ------------------------------------------
  //
  // Core Intention:
  // Word Traps is about rhythm, momentum, and sustained focus.
  // The tone encourages flow and continuity.
  // It rewards staying engaged and moving forward.
  //
  // Emotional posture:
  // - Steady
  // - Focused
  // - Controlled
  // - In rhythm
  // - Forward-moving
  //
  // Dominant lexical field:
  // - keep going
  // - keep it moving

  // Explicit exclusions:
  // - No aggressive vocabulary (ruthless, destroy, crush, dominate, savage)
  // - No ego inflation (unstoppable, unbeatable, genius)
  // - No cold technical tone (optimize, calibrate, precision-driven language)
  // - No "streak" vocabulary
  //
  // Identity direction:
  // Word Traps speaks like a calm performance coach.
  // Clear. Grounded. Forward.
  // Always about maintaining rhythm and momentum.
  //
  // Validation rule for new copy:
  // If it reinforces flow and continuity → valid.
  // If it sounds aggressive, ego-heavy, technical, or gamified with "streak" mechanics → reject.

  window.WT_WORDING = {
    brand: {
      creatorLine: "Created by Carole, a French native from Paris. 🇫🇷",
      creatorLineHtml: "Created by <a href=\"https://www.linkedin.com/in/carolestromboni/\" target=\"_blank\" rel=\"noopener\">Carole</a>, a French native from Paris. 🇫🇷"
    },

    system: {
      close: "Close",
      home: "Home",
      versionPrefix: "v",

      loadingTitle: "Loading Word Traps...",
      loadingHint: "Preparing your French word challenge",
      loadingSlowHint: "Still loading… Check your connection if this takes too long.",

      updateAvailable: "Update available.",
      dismiss: "Dismiss",
      closeIcon: "✕",

      offlinePayment: "Payment requires an internet connection.",
      copied: "Copied",
      copyFailed: "Copy failed",
      downloaded: "Downloaded",
      more: "How to play",
      open: "Open",
      notNow: "Not now",
      continue: "Next",
      tapToContinue: "Tap to continue",
      playAria: "Start a new run",
      shareAria: "Share the game",
      resultGridAria: "Result grid",
      scoreAria: "Score",
      endActionsAria: "End screen actions",
      shareCardAria: "Share the game",
      premiumUnlockedToast: "Premium unlocked",
      storageSaveFailedToast: "Saving is disabled in this browser mode. Your progress may be lost if you refresh.",
      confirmLeaveRun: "Leave the current run? Your progress will be lost."
    },


    footer: {
      contact: "Contact",
      privacy: "Privacy",
      terms: "Terms"
    },


    success: {
      title: "Payment successful",
      subtitle: "Your activation code is ready. Save it, then activate it in the game.",

      codeLabel: "Your activation code",
      clearDataWarning: "If you clear site data or switch device/browser, you will need this code again.",

      howToActivateTitle: "How to activate",
      howToActivateStep1: "Return to the game.",
      howToActivateStep2Prefix: "Tap",
      howToPlayLabel: "How to play",
      activateWithCodeLabel: "Activate with a code",
      howToActivateStep3Prefix: "Paste your code and tap",
      activateLabel: "Activate",

      whatYouGetTitle: "What you get",
      benefitFullAccessPrefix: "Full access to all",
      benefitFullAccessStrongSuffix: " word traps",
      benefitFullAccessSuffix: " in this game.",
      benefitUnlimited: "Unlimited play after code activation.",

      ctaBackToGame: "Back to game",
      ctaDownload: "Download code (.txt)",
      shortcutHint: "Shortcut: How to play - Activate with a code.",

      thankYouLine: "Thank you for supporting an independent game 🇫🇷",
      supportLabel: "Need help?",

      copyCta: "Copy code",
      copyAgainCta: "Copy code again",
      tipNoRecover: "Tip: keep this code somewhere safe. It can't be recovered from a server.",
      txtTitle: "Your Word Traps activation code",
      txtSaveLine: "Tip: keep this code somewhere safe.",
      txtNoRecoverLine: "It can't be recovered from a server.",

      cheatSheetTitle: "Cheat Sheet (PDF)",
      cheatSheetBody: "If you added the Cheat Sheet to your order, enter your email below to receive the download link.",

    },


    landing: {
      title: "Word Traps",
      tagline: "",
      subtitle: "Faux amis or true friends?\n{poolSize} French words.\n{maxChances} mistakes allowed.\nLooks obvious. It isn't.",
      microFun: "No signup - Play in under 2 minutes - Free to start",
      microTrust: "An indie game by Carole · Test Your French",


      runsLabel: "Runs",
      runsFreeMode: "free to try",

      ctaPlay: "Test your French",
      ctaPlayAfterFirstRun: "Start a new run",
      ctaHow: "How to play",

      // Required for LANDING stat to render
      statsSeenLabel: "Words seen",

      // Before completion (goal gradient) 
      statsSeenSummaryTemplate: "Seen: {seen}/{poolSize} word traps · {remaining} to go",


      postPaywallTitle: "Free runs completed.",
      postPaywallBody: "Unlock unlimited runs anytime and keep your progress on this device.",
      postPaywallCta: "See Premium options",

      postPaywallSbTitle: "Before you decide...",
      postPaywallSbBody: "You still have a secret bonus to try. Tap 🎁."
    },



    firstRun: {
      framingLines: [
        "{maxChances} mistakes allowed. Take your time.",
        "Looks obvious. It isn’t.",
        "{freeRuns} free runs to see how well you really know these words."
      ],

      trustLines: [
        "No ads. No tricks.",
        "Just thoughtful French."
      ],

      ctaLabel: "Begin"
    },



    ui: {
      chancesLabel: "Chances",
      mistakesLabel: "Mistakes",
      scoreLabel: "Score",
      scoreAriaTemplate: "Score: {score} {fpShort}",
      fpShort: "FP",
      fpLong: "French Points",
      trueLabel: "Same meaning",
      falseLabel: "Different meaning",
      gameOverTitle: "Game over",

      // Content loading (LANDING guard)
      contentLoadingToast: "Loading word traps...",

      // Pool loop announcement (RUN)
      poolReshuffledToast: "All word traps reshuffled. New order.",

      // Pool progress (END micro-line, RUN only)
      seenProgressTemplate: "You saw {seen}/{poolSize} word traps.",

      // Start-of-run overlay (economy)
      // Visible uniquement pour FREE et LAST_FREE
      startRunTypeFree: "FREE RUN",
      startRunTypeLastFree: "Final free run. Take your time.",
      startRunTypeUnlimited: "",
      startRunTypePractice: "Your past mistakes, one more time.",


      // Start-of-run overlay (education)
      // Ligne unique, lien mental avec le HUD
      startRunChancesOverlay: "{maxChances} mistakes per run.",

      // Chance state overlays (no \"-1\" text)
      lastChanceOverlay: "Last chance.",
      gameOverOverlay: "Game over.",

      // HUD deltas (PLAYING)
      chanceLostDeltaText: "-1",
      mistakeGainedDeltaText: "+1",
      scoreGainedDeltaText: "+1",

      // HUD anchor (PLAYING) — Personal Best (Premium only)
      bestScoreLabel: "Best",
      bestScoreAriaTemplate: "Best: {best}",


    },







    secretBonus: {
      chestAria: "Secret bonus chest",
      chestHint: "A secret mode is waiting.",
      noSeenWordsToast: "No secret bonus yet. Play a normal run first.",
      badge: "SECRET BONUS",

      // END screen (BONUS)
      endTitle: "",
      endLine: "Nice one. Want another secret run?",

      // END BONUS - cognitive mirror (HIGH / MEDIUM / LOW)
      // Contract: arrays MUST contain exactly 2 sentences each. No fallback in UI.
      endByLevel: {
        low: [
          "The timing was tight.",
          "This mode reacts faster than memory."
        ],
        medium: [
          "You adjusted on the fly.",
          "Instinct matters more than recall here."
        ],
        high: [
          "You stayed in control.",
          "This mode rewards fast intuition."
        ]
      },

      // BONUS END - identity (no "streak" wording)
      identityByLevel: {
        low: "",
        medium: "",
        high: ""
      },

      // BONUS END - gentle lens (descriptive, no imperatives)
      lensByLevel: {
        low: "",
        medium: "",
        high: ""
      },

      // BONUS END - emotionally congruent CTA label
      ctaByLevel: {
        low: "Give it another shot",
        medium: "Go again",
        high: "Ride the momentum"
      },




      // Start overlay (same component as FREE runs)
      startOverlayLine1: "Faster pace. No downtime.",
      startOverlayLine2: "Only words you've already seen in normal runs.",
      startOverlayLine3: "Play normal runs to add more words to the bonus deck.",

      // Teaser premium (filled by ui.js): {remaining}, {limit}
      startOverlayFreeRunsLimitLine: "Free bonus runs left: {remaining}/{limit}",

      // Block modal when free limit reached
      freeLimitReachedTitle: "That was intense.",
      freeLimitReachedBody: "You've used your {limit} free bonus runs.\n\nPremium unlocks unlimited bonus mode. Same speed. No limits.",
      freeLimitReachedCta: "Keep playing",
      freeLimitReachedClose: "Not now",
      startOverlayTapAnywhere: "Tap anywhere to start",

      // Minimal entry (autoporteur)
      title: "Word Traps",
      subtitle: "Secret Bonus",
      questionPrompt: "Same meaning in French and English?",
      dangerLineLabel: "TIMEOUT LINE",
      dangerLineAria: "Timeout line. If the card reaches this line, the item is lost.",
      seenOnlyLine: "Only words you've already seen in normal runs. Play more runs to expand the bonus deck.",


      // End toasts (BONUS ends by returning to END screen)
      endGameOverToast: "Game over",
      endDeckExhaustedToast: "Secret bonus complete",
      ctaPlayAgain: "Play bonus again",



      // Keep existing (even if you later stop using the modal)
      modalTitle: "You unlocked a secret bonus",
      modalBody: "Well spotted. This secret bonus is faster, more focused, and more intense - using only words you've already seen. Optional and free.",
      modalCta: "Start secret bonus"
    },





    practice: {
      title: "Practice mode (Mistakes only)",
      on: "On",
      off: "Off",

      premiumOnly: "Premium only",
      descLocked: "Replay only the word traps that still trip you up.",
      valueLine: "Focus on the words that still trip you up.",
      descUnlocked: "Only items you previously got wrong.",

      // END screen (PRACTICE)
      endTitle: "Practice complete",
      endLine: "Good work. You tightened the weak spots.",
      scoreLine: "Reviewed: {total} words",

      // PLAYING: calm progress line (replaces assertion in PRACTICE)
      playingProgressLine: "{current}/{total}",

      // Start overlay (PRACTICE): explain the mode (2 lines shown via typeLine + msg)
      startRunChancesOverlayPractice: "No limit. Just review.",

      // Backward compat (still used as fallback wording-only)
      ctaPracticeAgain: "Practice again",

      // PRACTICE END - identity + lens + CTA by level (low/medium/high)
      identityByLevel: {
        low: "You're rebuilding the basics.",
        medium: "You're tightening the weak spots.",
        high: "You're making these traps feel automatic."
      },


      lensByLevel: {
        low: "The patterns will feel clearer next time.",
        medium: "Consistency is forming.",
        high: "This is turning into muscle memory."
      },

      ctaByLevel: {
        low: "Try another practice run",
        medium: "Practice again",
        high: "Keep the rhythm"
      }


    },



    playing: {
      questionLabel: "Word",
      assertion: "Does this mean the same thing in French and English?",
      microHowTo: "Do the French and English words have the same meaning?",
      answersAria: "Answer choices",
      questionHeadingTemplate: "",
      feedbackTitleOk: "Correct",
      feedbackTitleBad: "Incorrect",

      // Feedback truth line (used inline after Correct/Incorrect):
      // "Correct - {termFr} (FR) = {termEn} (EN)"
      // "Incorrect - {termFr} (FR) ≠ {termEn} (EN)"
      feedbackRelationSameTemplate: "{termFr} (FR) = {termEn} (EN)",
      feedbackRelationDifferentTemplate: "{termFr} (FR) \u2260 {termEn} (EN)"
    },



    micropics: {
      runContinues: "Good work. Keep going.",


      // Near-miss (END-only highlight)
      nearMiss: "Close one. Keep going.",


      // Repeated mistakes (END-only highlight)
      repeatMistake: "This trap keeps getting you. Take a second and reread the word.",


      // First time reaching the tier in this RUN
      streakStart: "3 good words in a row. Good start.",
      streakBuilding: "6 good words in a row. Keep going.",
      streakStrong: "10 good words in a row. Strong focus.",
      streakElite: "15 good words in a row. Very steady.",
      streakLegendary: "20 good words in a row. Excellent focus.",


      // Reaching a tier again in the same RUN (after a mistake)
      // {streak} = current streak at display time, {n} = threshold value (3/6/10/15/20)
      streakAgainTemplate: "{streak} good words in a row again. Back on track.",

      // First non-chiffré micro-pic after a mistake (one-shot)
      recovery: "Good job!",

      runEndedAllChancesUsed: ""
    },

    end: {
      title: "Well done.",


      // Pool complete (one-shot celebration when 200/200 reached)
      poolCompleteTitle: "Bravo. You made it through all 200.",
      poolCompleteLine1: "That was not easy.",
      poolCompleteLine2: "You earned it.",
      poolCompleteScoreLine: "Score: {score} {fpShort}",
      poolCompleteCtaPrimary: "Play again in a new random order",
      poolCompleteCtaPractice: "Practice your mistakes",

      // No redundancy: do not mention chances on END (player already knows).
      endLine: "Run complete. Want to go again?",


      // (verdict grid removed — identityByVerdict is now the primary END signal)

      // RUN END — identity + lens + CTA by verdict tier
      // Keys must match UI mapping: none/start/building/strong/elite/legendary
      identityByVerdict: {
        none: "You're still warming up. Keep it moving.",
        start: "You're finding your rhythm. Keep it going.",
        building: "You're building momentum. Stay with it.",
        strong: "You're rolling now. Keep it steady.",
        elite: "You're in the flow. Keep it steady.",
        legendary: "Full control. Keep it going."
      },



      lensByVerdict: {
        none: "",
        start: "",
        building: "",
        strong: "",
        elite: "",
        legendary: ""
      },




      ctaByVerdict: {
        none: "Reset and go again",
        start: "Go again - push for 6 in a row",
        building: "Go again - push for 10 in a row",
        strong: "Go again - aim for 15 in a row",
        elite: "Go again - chase 20 in a row",
        legendary: "Run it back"
      },

      // Explicit best sequence surfacing (RUN only)
      // Definition: longest sequence of consecutive correct answers within the run
      bestStreakLine: "Best sequence: {bestStreak} correct answers in a row.",

      // RUN progress surfacing (RUN only)
      // Vars: {seen} {poolSize} {remaining}
      progressLine: "Seen: {seen}/{poolSize}. {remaining} left.",

      // False friends identified (RUN only)
      // Definition: distinct items with tag === "false_friend" and correctCount > 0
      // Vars: {count}
      falseFriendsIdentifiedLine: "{count} false friends identified.",


      // END secondary content toggles
      statsToggle: "Stats & runs history",


      // Fallback for non-RUN modes (PRACTICE, BONUS)
      effortLine: "Well played.",

      scoreLine: "Score: {score} {fpLong}",

      // Best score surfacing (rendered by ui.js using {best})
      personalBestLine: "Best score: {best} {fpLong}",

      // Free runs hint (RUN-only; shown only when remaining > 0)
      freeRunLeft: "{remaining} free run{pluralS} left.",

      // RUN END - mistakes recap (free + premium)
      mistakesTitle: "Mistakes",
      mistakesNone: "No mistakes.",
      mistakesToggle: "Show mistakes ({count})",

      newBest: "NEW PERSONAL BEST - You beat your previous score.",
      playAgain: "Start a new run",


      practiceCta: "Practice mode (Mistakes only)",
      practiceCtaPremium: "Practice mode (Mistakes only) (Premium)",
      shareTitle: "Share"
    },




    paywall: {
      // Default headline
      headline: "Play without limits.",

      // LAST FREE RUN - stronger but factual
      headlineLastFree: "This was your last free run.",

      // Projection personnalisée (PAYWALL only)
      // Vars: {seen} {poolSize} {remaining}
      progressLine1: "You've already seen {seen}/{poolSize} word traps.",
      progressLine2: "{remaining} words left to complete the full set.",

      // Section headers (anti “mur de mots”)
      valueTitle: "Unlock everything",
      trustTitle: "No surprises",

      valueBullets: [
        "Access the full set of word traps",
        "Play unlimited runs - same rules, no limits",
        "Unlock a new mode: practice your mistakes",
        "Enjoy unlimited bonus mode - even better once all word traps are unlocked"
      ],

      // Shared bridge copy (LANDING post-paywall + END runs exhausted)
      bridgeTitle: "That was the end of the free path.",
      bridgeBody: "Unlock unlimited runs and Practice mode on this device.",

      trustLine: "One-time purchase. Same rules. No limits.",
      trustBullets: [
        "Lifetime access, no recurring fees",
        "No ads, ever",
        "No signup needed, ever",
        "Secure payment through Stripe"
      ],


      // PW1: Social proof (optional - do not invent numbers/claims)
      // If all are empty, nothing is rendered.
      socialProofTitle: "",
      socialProofQuote: "",
      socialProofAuthor: "",

      // EARLY-only conversion bump (no fallback; shown only if template is provided)
      // Vars: {saveAmount} {earlyPrice} {standardPrice}
      savingsLineTemplate: "Save {saveAmount} today (early price).",

      // Micro reassurance under CTA (optional, no fallback)
      checkoutNote: "Secure checkout via Stripe - takes about 30 seconds.",

      // Primary CTA changes with price phase (EARLY vs STANDARD)
      ctaEarly: "Get unlimited runs at $4.99",
      ctaStandard: "Get unlimited runs - $6.99",

      // Backward compat (still used in a few places)
      cta: "Get unlimited runs",

      alreadyHaveCode: "Already have a code? Redeem it here.",
      deviceNote: "Premium stays unlocked on this device. No account needed.",

      // PW2: EARLY visual badge (copy visible)
      earlyBadgeLabel: "Early bird",

      earlyLabel: "Early price",
      standardLabel: "Standard price",

      // Loss-oriented urgency label (stronger conversion driver)
      timerLabel: "Price increases in:",

      postEarlyLine1: "The early price has ended.",
      postEarlyLine2: "{standardPrice} - One-time purchase. Yours forever."
    },

    howto: {
      title: "How to play",
      howToPlayLine1: "You see a French word or expression.",
      howToPlayLine2: "Is it a faux ami or a true friend?",
      howToPlayLine3: "Choose Same meaning or Different meaning.",
      ruleTitle: "Rule",
      ruleSentence: "Each correct answer adds +1 French Point. A wrong answer adds one mistake.",
      premiumTitle: "Premium",
      alreadyPremium: "Premium is already enabled on this device.",
      activateTitle: "Activate with a code",
      activateLine1: "Already have a premium code? Activate it here.",
      activateLine2: "No account needed. Your code stays on this device.",
      activationCodeLabel: "Activation code",
      activationCodePlaceholder: "WT-XXXX-XXXX",
      enterCode: "Enter a code.",
      codeRejected: "Code rejected.",
      activateCta: "Activate",
      codeInvalid: "Invalid code format.",
      codeUsed: "This device already used a code.",
      codeOk: "Premium enabled on this device.",
      premiumOnlyHint: "",

      autoActivateTitle: "Premium code ready",
      autoActivateLine1: "Your premium code is already saved on this device.",
      autoActivateLine2: "Activate Premium now?",
      autoActivateCta: "Activate now",
      autoActivateLater: "Not now"
    },



    postCompletion: {
      title: "You've seen all {poolSize} word traps in this version.",
      body: "Practice mode (Mistakes only) is the fastest way to focus on what still trips you up."
    },

    houseAd: {
      eyebrow: "After {poolSize} word traps",
      title: "You've seen all {poolSize} word traps.",
      bodyLine1: "Word Traps is a mini-game by Test Your French.",
      bodyLine2: "We have other games.",
      ctaPrimary: "Try a new game by Test Your French",
      ctaRemindLater: "Remind later",

      // Landing presence (same meaning, same tone)
      landingTitle: "You've seen all {poolSize} word traps.",
      landingBodyLine1: "Word Traps is a mini-game by Test Your French.",
      landingBodyLine2: "We have other games.",
      landingCtaPrimary: "Try Test Your French",
      landingCtaRemindLater: "Remind later"
    },




    waitlist: {
      ctaLabel: "Get notified about future products or features.",
      disclaimer: "No spam. No account. You can leave anytime.",
      title: "Get notified about future products or features.",
      bodyLine1: "No spam. No account. Leave anytime.",
      bodyLine2: "Optional: reply with one idea if you want.",
      inputPlaceholder: "Optional: share an idea.",
      cta: "Send email",

      // Email compose (for inbox filtering + prefill)
      emailSubjectSuffix: "Waitlist",
      emailBodyTemplate: `Hi!

I'd like to join the Word Traps waitlist.

Optional idea:
{idea}

Thanks!`
    },




    share: {
      ctaLabel: "Copy text",
      emailLabel: "Send email",
      emailSubject: "Word Traps",
      previewLabel: "Preview message",
      toastCopied: "Copied.",
      template: `Hey!
I just played a cool French challenge 🇫🇷
{funFact}
Find out 😄
{url}`,

      teaserTrap: "Looks obvious... until it isn't.",
      teaserTrue: "Sometimes the obvious answer is right.",
      funFactTemplatesTrap: [
        `Can you guess? Does "{termFr}" (FR) really mean "{termEn}"? 🤔`
      ],
      funFactTemplatesTrue: [
        `Can you guess? "{termFr}" (FR) and "{termEn}" (EN) — same meaning or trap? 🤔`
      ],


    },



    installPrompt: {
      title: "Install Word Traps",
      body: "Play instantly. Available offline after your first load. No browser tabs. On iPhone: Share > Add to Home Screen.",
      ctaPrimary: "Add to home screen",
      ctaSecondary: "Later"
    },


    statsSharing: {
      sectionTitle: "Anonymous stats (optional)",
      buttonLabel: "Share anonymous stats",

      // Lightweight prompt (shown at milestones)
      promptTitle: "Help improve Word Traps",
      promptBodyTemplate: "You have reached {thresholdPct}% of the pool (unique words). Share anonymous stats to help improve the game. You can review everything before sending.",
      promptBodyLastFree: "That was your last free run. Share anonymous stats to help improve the game. You can review everything before sending.",
      promptBodyPowerUser: "You're clearly a power player. Share anonymous stats to help improve the game. You can review everything before sending.",
      promptCtaPrimary: "Preview & share",
      promptCtaSecondary: "Not now",

      // Full modal (manual access + prompt primary)
      modalTitle: "Help improve the game",
      modalDescription: "Share your anonymous gameplay stats with the creator. No personal data is collected - you can see exactly what will be sent below.",
      previewLabel: "Data to be shared:",
      ctaSend: "Send via email",
      ctaCancel: "Cancel",
      ctaLater: "Show me later",
      ctaCopy: "Copy to clipboard",
      noStatsToast: "No stats to share yet.",
      successToast: "Email app opened. Send to share your stats.",
      copyToast: "Stats copied to clipboard."
    },



    support: {
      label: "Contact",
      modalTitle: "Write us",
      modalBodyLine1: "Email is the fastest way to reach us.",
      modalBodyLine2: "Copy the address below or open your email app.",
      emailSubjectSuffix: "Feedback",
      ctaCopy: "Copy email",
      ctaOpen: "Open email app",

      // Email compose (prefill)
      emailBodyTemplate: `Hi!

I'm writing about Word Traps.

Message:




Thanks!`
    },


    notFound: {
      title: "Lost in translation?",
      line1: "This page doesn't exist - or it no longer does.",
      line2: "The good news: the game is right where you left it.",
      cta: "Start a new run"
    },

  };

  // 9.5 Brand injection (DOM)
  function applyBrandText() {
    try {
      // Creator line (single source of truth):
      // - prefer WT_WORDING.brand.creatorLineHtml (allows link)
      // - else WT_WORDING.brand.creatorLine (plain text)
      const brandHtml = String(
        (window.WT_WORDING && window.WT_WORDING.brand && window.WT_WORDING.brand.creatorLineHtml) ||
        ""
      ).trim();

      const brandText = String(
        (window.WT_WORDING && window.WT_WORDING.brand && window.WT_WORDING.brand.creatorLine) ||
        ""
      ).trim();

      if (brandHtml || brandText) {
        const brandNodes = document.querySelectorAll('[data-wt-brand="creatorLine"]');
        brandNodes.forEach((node) => {
          if (!node) return;
          if (brandHtml) node.innerHTML = brandHtml;
          else node.textContent = brandText;
        });
      }

      // Version
      const version = String(window.WT_CONFIG?.version || "").trim();
      const versionPrefix = String(window.WT_WORDING?.system?.versionPrefix || "").trim();

      if (version) {
        const versionNodes = document.querySelectorAll("[data-wt-version]");
        versionNodes.forEach((node) => {
          if (node) node.textContent = `${versionPrefix}${version}`;
        });
      }

      // Parent link (Test Your French)
      const tyf = document.getElementById("wt-tyf-link");
      const tyfSep = document.querySelector(".wt-footer-sep--tyf");
      const parentUrl = String(window.WT_CONFIG?.identity?.parentUrl || "").trim();

      if (tyf && parentUrl) {
        tyf.setAttribute("href", parentUrl);

        // KISS label: derive from URL host (no hard-coded copy)
        let label = parentUrl;
        try { label = new URL(parentUrl).hostname.replace(/^www\./i, ""); } catch (_) { /* keep url */ }
        tyf.textContent = label;

        if (tyfSep) tyfSep.style.display = "";
      } else {
        if (tyf) {
          tyf.textContent = "";
          tyf.removeAttribute("href");
        }
        if (tyfSep) tyfSep.style.display = "none";
      }

      // Footer link labels (Privacy / Terms)
      const fw = window.WT_WORDING?.footer || {};
      const privacy = document.getElementById("wt-privacy-link");
      const terms = document.getElementById("wt-terms-link");

      if (privacy) privacy.textContent = String(fw.privacy || "").trim();
      if (terms) terms.textContent = String(fw.terms || "").trim();

      // Hide orphan separators (prevents "·" stacking when labels are empty/hidden)
      const seps = document.querySelectorAll(".wt-footer-row--links .wt-footer-sep");
      seps.forEach((sep) => {
        if (!sep) return;
        const prev = sep.previousElementSibling;
        const next = sep.nextElementSibling;
        const prevText = prev ? String(prev.textContent || "").trim() : "";
        const nextText = next ? String(next.textContent || "").trim() : "";
        sep.style.display = (prevText && nextText) ? "" : "none";
      });

    } catch (_) {
      // silent
    }
  }




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
      const endCountUp = Number(uiCfg.endScoreCountUpMs);

      if (!Number.isFinite(cl) || cl < 200 || cl > 3000) warn("ui.chanceLostOverlayMs must be a number in [200..3000]");
      if (!Number.isFinite(rs) || rs < 200 || rs > 3000) warn("ui.runStartOverlayMs must be a number in [200..3000]");
      if (!Number.isFinite(pulse) || pulse < 0 || pulse > 2000) warn("ui.gameplayPulseMs must be a number in [0..2000]");

      if (!Number.isFinite(endCountUp) || endCountUp < 200 || endCountUp > 3000) warn("ui.endScoreCountUpMs must be a number in [200..3000]");



      // Secret bonus mode (mechanics)
      if (cfg.secretBonus && cfg.secretBonus.enabled === true) {
        const tw = Number(cfg.secretBonus.tapWindowMs);
        const taps = Number(cfg.secretBonus.tapsRequired);

        if (!Number.isFinite(tw) || tw <= 0) warn("secretBonus.enabled true but tapWindowMs is missing/invalid");
        if (!Number.isFinite(taps) || taps < 1) warn("secretBonus.enabled true but tapsRequired is missing/invalid");
        if (!cfg.game || !Number.isFinite(Number(cfg.game.maxChances)) || Number(cfg.game.maxChances) <= 0) {
          warn("secretBonus.enabled true but game.maxChances must be valid (used for chances)");
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
          if (!Number.isFinite(dangerThreshold) || dangerThreshold <= 0 || dangerThreshold > 1) {
            warn("secretBonus.fall.dangerThreshold missing/invalid (must be in (0..1])");
          }
          if (Number.isFinite(initialSpeed) && Number.isFinite(maxSpeed) && maxSpeed < initialSpeed) {
            warn("secretBonus.fall.maxSpeed must be >= initialSpeed");
          }
        }

      }



      // Waitlist email (obfuscated)
      if (cfg.waitlist && cfg.waitlist.enabled && !cfg.waitlist.toEmailObfuscated) {
        warn("waitlist.enabled true but toEmailObfuscated missing");
      }

      // Support email (obfuscated)
      if (cfg.support && !cfg.support.emailObfuscated) {
        warn("support.emailObfuscated missing");
      }
    }
  }

  // Run on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      validateConfigSoft();
      applyBrandText();
    });
  } else {
    validateConfigSoft();
    applyBrandText();
  }


})();
