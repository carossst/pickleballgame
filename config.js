// config.js v2.0 - Pickleball Rules Quiz
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
    version: "3.5",

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
    // - No default badge before phase 1 is completed
    // - Levels are permanent once unlocked
    // - Unlocks are phase-gated:
    //   L1: full first pass complete
    //   L2: all active mistakes cleared
    //   L3: L2 + Rapid Fire pool >= level3MinSeen + Rapid Fire run >= level3MinAccuracy
    //   L4: L3 + Rapid Fire pool >= level4MinSeen + Rapid Fire run >= level4MinAccuracy
    // - Preview is UI-only and fail-closed:
    //   ?levelPreview=none|level1|level2|level3|level4|unlock1|unlock2|unlock3|unlock4
    levels: {
      enabled: true,
      level3MinSeen: 16,
      level3MinAccuracy: 0.70,
      level4MinSeen: 50,
      level4MinAccuracy: 0.85,
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
        }
      },

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
      minCompletedRuns: 4,
      showBeforeFirstRun: false
    },

    // Secret bonus mode
    secretBonus: {
      minDeckSize: 1,
      enabled: true,

      // Teaser premium: free users can start only N bonus runs (lifetime, device-local)
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
  window.WT_WORDING = {
    brand: {
      creatorLine: "An indie game by Carole",
      creatorLineHtml: "An indie game by <a href=\"https://www.linkedin.com/in/carolestromboni/\" target=\"_blank\" rel=\"noopener\">Carole</a><br><a href=\"https://www.bonjourpickleball.fr/pickleball-france-trip/\" target=\"_blank\" rel=\"noopener\">Bonjour Pickleball</a>"
    },

    system: {
      close: "Close",
      home: "Home",
      versionPrefix: "",

      loadingTitle: "Loading Pickleball Rules Quiz...",
      loadingIcon: "",
      loadingHint: "Preparing your pickleball rules quiz",
      loadingSlowHint: "Still loading... Check your connection if this takes too long.",
      loadingSlowHints: [
        "Arguing politely about the kitchen...",
        "Reviewing highly suspicious line calls...",
        "Preparing an unnecessary Erne..."
      ],
      updateAvailable: "New version available.",
      updateNow: "Refresh app",

      offlinePayment: "Payment requires an internet connection.",
      copied: "Copied",
      copyFailed: "Copy failed",
      downloaded: "Downloaded",
      more: "How to play",
      open: "Open",
      notNow: "Not now",
      continue: "Next",
      tapToContinue: "",

      youChosePrefix: "You chose:",

      playAria: "Play a new game",
      shareAria: "Share the game",
      resultGridAria: "Result grid",
      scoreAria: "Score",
      endActionsAria: "End screen actions",
      shareCardAria: "Share the game",
      premiumUnlockedToast: "Full access unlocked",
      storageSaveFailedToast: "Saving is disabled in this browser mode. Your progress may be lost if you refresh.",
      confirmLeaveRun: "Leave the current game? Your progress will be lost."
    },

    footer: {
      contact: "Contact",
      privacy: "Privacy",
      terms: "Terms",
      press: "Press"
    },

    success: {
      title: "Payment successful",
      subtitle: "Your device unlock code is ready. Use it in the game to enable full access here in a few seconds.",
      deviceBadge: "ONE DEVICE",

      codeLabel: "Your device unlock code",
      clearDataWarning: "This unlock is saved on this device. Keep the code if you may clear browser data or switch device later.",

      howToActivateTitle: "How to activate",
      howToActivateStep1: "Return to the game.",
      howToActivateStep2Prefix: "Tap",
      howToPlayLabel: "How to play",
      activateWithCodeLabel: "Use a device unlock code",
      howToActivateStep3Prefix: "Paste your code and tap",
      activateLabel: "Activate",

      whatYouGetTitle: "What full access includes",
      benefitFullAccessPrefix: "Full access to all",
      benefitFullAccessStrongSuffix: " questions",
      benefitFullAccessSuffix: " in this game.",
      benefitUnlimited: "Unlimited play on this device after activation.",

      ctaBackToGame: "Open the game",
      ctaDownload: "Download code (.txt)",
      shortcutHint: "In the game: How to play -> Use a device unlock code.",

      thankYouLine: "Thank you for supporting Pickleball Rules Quiz. Your code is ready when you are.",
      supportLabel: "Need help?",

      copyCta: "Copy code",
      copyAgainCta: "Copy code again",
      tipNoRecover: "Tip: keep this code somewhere safe as a backup for this device unlock.",
      txtTitle: "Your Pickleball Rules Quiz device unlock code",
      txtSaveLine: "Tip: keep this code somewhere safe if you want a backup.",
      txtNoRecoverLine: "You only need it again if you clear browser data or move to another device.",

      cheatSheetTitle: "",
      cheatSheetBody: "",

    },
    landing: {
      title: "Pickleball Rules Quiz",
      tagline: "**Think you know pickleball? Prove it.**",
      subtitle: "A fast true-or-false pickleball rules game.\n{poolSize} questions about serving, faults, scoring, line calls, and rule changes.",
      microFun: "Quick games · No signup · Free to try",
      microTrust: "Play a few quick games and see what really holds up.",

      runsLabel: "",
      runsFreeMode: "",

      ctaPlay: "Start playing",
      ctaPlayAfterFirstRun: "Play again",
      ctaHow: "How to play",
      // Required for LANDING stat to render
      statsSeenLabel: "Questions seen",

      // Before completion (goal gradient) 
      statsSeenSummaryTemplate: "Seen: {seen}/{poolSize} questions",
      statsPhaseBadgeDiscovery: "Phase 1/3: First pass",
      statsPhaseBadgeCorrection: "Phase 2/3: Fixing mistakes",
      statsPhaseBadgeConsolidation: "Phase 3/3: Locked in",

      // After completion (fail-closed: required for the post-200 line)
      statsSeenCompleteLabel: "Quiz progress",
      statsMistakesLabel: "Mistakes",
      statsMistakesSummaryTemplate: "{mistakes}",
      statsMasterySummaryTemplate: "{mastered}/{poolSize} questions answered correctly",

      postPaywallTitle: "Free games completed.",
      postPaywallBody: "Unlock all 200 pickleball rules questions, unlimited play, explanations after every answer, Mistakes Mode, and Rapid Fire Mode on this device.",
      practiceCtaTemplate: "Fix your {count} mistake{pluralS}",
      postPaywallCta: "Unlock full access",

      postPaywallSbTitle: "Before you decide...",
      postPaywallSbBody: "Rapid Fire Mode is also available from the lightning icon."
    },
    firstRun: {
      titleRun1: "How to play",
      titleRun2: "Quick reminder",
      titleRun3: "Last tip before you play",

      run1Lines: [
        "You'll see pickleball rules one by one.\nDecide whether each one is true or false.",
        "Correct answer: +1 point.",
        "Wrong answer: +1 mistake.",
        "After {maxChances} mistakes, the game ends.",
        "Think You Know Pickleball? Prove It."
      ],

      run2Lines: [
        "Correct answer: +1 point.",
        "Wrong answer: +1 mistake.",
        "After {maxChances} mistakes, the game ends.",
        "Read carefully.",
        "Think You Know Pickleball? Prove It."
      ],

      run3Lines: [
        "Game ends after {maxChances} mistakes.",
        "Read carefully.",
        "Go with what you know.",
        "Think You Know Pickleball? Prove It."
      ],

      ctaLabel: "Play"
    },

    milestones: {
      quarter: {
        title: "First quarter complete.",
        bodyLines: [
          "You've seen the first quarter of the question set.",
          "This is still phase 1: discovery.",
          "Keep going. You're building your first pass through the rules."
        ],
        cta: "Next"
      },

      halfway: {
        title: "Halfway there.",
        bodyLines: [
          "You've seen half of the question set.",
          "You're still in the discovery phase.",
          "Finish the full set first. Then you'll fix what still catches you."
        ],
        cta: "Next"
      },

      threeQuarters: {
        title: "Three quarters complete.",
        bodyLines: [
          "You've seen three quarters of the question set.",
          "You're close to finishing phase 1.",
          "One more push, then you'll know exactly what still needs work."
        ],
        cta: "Next"
      }
    },

    phaseJourney: {
      discovery: {
        badge: "Phase 1/3: First pass",
        landingSummaryTemplate: "{seen}/{poolSize} questions played.",
        landingDetailTemplate: "{remaining} still to go in your first pass.",
        endLens: "You're still on your first pass. Right now the goal is to cover more of the set.",
        micropics: {
          streakStart: "3 in a row. Good read.",
          streakBuilding: "6 in a row. Good read.",
          streakStrong: "10 in a row. Clear rules.",
          streakElite: "15 in a row. You know these.",
          streakLegendary: "20 in a row. Strong run.",
          streakAgainTemplate: "{streak} again.",
          recovery: "There you go."
        }
      },
      correction: {
        badge: "Phase 2/3: Fixing mistakes",
        landingSummaryTemplate: "Mistakes left: {mistakes}",
        landingDetail: "You've seen the full set. Now clear up the rules that still catch you.",
        endLens: "You've seen the full set. Now clear up the rules that still catch you.",
        micropics: {
          streakStart: "3 in a row. Better.",
          streakBuilding: "6 in a row. Clearing up.",
          streakStrong: "10 in a row. Better now.",
          streakElite: "15 in a row. Mistakes fading.",
          streakLegendary: "20 in a row. Strong correction.",
          streakAgainTemplate: "{streak} again.",
          recovery: "Back on it."
        }
      },
      consolidation: {
        badge: "Phase 3/3: Locked in",
        landingSummaryTemplate: "{mastered}/{poolSize} questions answered correctly.",
        landingDetail: "You've cleared the mistakes. Now keep the rules clear.",
        endLens: "You've cleared the mistakes. Now keep the rules clear.",
        micropics: {
          streakStart: "3 in a row. Still clear.",
          streakBuilding: "6 in a row. Still clear.",
          streakStrong: "10 in a row. Holding up.",
          streakElite: "15 in a row. Very clear.",
          streakLegendary: "20 in a row. Rules clear.",
          streakAgainTemplate: "{streak} again.",
          recovery: "Back on it."
        }
      }
    },

    levels: {
      modalTitle: "Levels",
      placeholder: "",
      openDetailsAria: "Open level details",
      unlockKicker: "New level",
      reachedTemplate: "You reached {label}.",
      currentLabel: "Current",
      unlockedByLabel: "",
      nextLabel: "Next",
      reachItLabel: "",
      progressionLabel: "Path",
      noLevelTitle: "Locked",
      noLevelBody: "Finish your first full pass.",
      maxLevelBody: "You reached the top level.",
      currentPill: "Current",
      unlockedPill: "Unlocked",
      lockedPill: "Locked",
      byLevel: {
        1: {
          label: "COURT-READY",
          unlock: "Finish your first full pass."
        },
        2: {
          label: "CLUB-LEVEL",
          unlock: "Clear all active mistakes."
        },
        3: {
          label: "TOURNAMENT-LEVEL",
          unlock: "Build a Rapid Fire pool of 16+ and post a 70%+ run."
        },
        4: {
          label: "PRO-LEVEL",
          unlock: "Build a Rapid Fire pool of 50+ and post an 85%+ run."
        }
      }
    },

    ui: {
      chancesLabel: "Lives",
      mistakesLabel: "Mistakes",
      scoreLabel: "Score",
      scoreAriaTemplate: "Score: {score} {fpShort}",
      fpShort: "",
      fpLong: "",
      trueLabel: "True",
      falseLabel: "False",
      gameOverTitle: "Game over",

      // Content loading (LANDING guard)
      contentLoadingToast: "Loading questions...",
      contentLoadingToasts: [
        "Arguing politely about the kitchen...",
        "Reviewing highly suspicious line calls...",
        "Preparing an unnecessary Erne..."
      ],

      // Pool loop announcement (RUN)
      poolReshuffledToast: "All questions reshuffled. New order.",

      // Pool progress (END micro-line, RUN only)
      seenProgressTemplate: "You saw {seen}/{poolSize} questions.",

      // Start-of-run overlay (economy)
      // Visible uniquement pour FREE et LAST_FREE
      startRunTypeFree: "Your first free game",
      startRunTypeLastFree: "Last free game. Make it count",
      startRunTypeUnlimited: "",
      startRunTypePractice: "Mistakes Mode",

      // Start-of-run overlay (education)
      // Court et scannable, avant le premier tap
      startRunChancesOverlay: "Correct: +1 point.\nWrong: +1 mistake.\nGame ends after {maxChances} mistakes.",
      startOverlayTapAnywhere: "Tap anywhere to start",

      // Chance state overlays (no \"-1\" text)
      lastChanceOverlay: "One mistake left.",
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
      chestAria: "Rapid Fire Mode",
      chestHint: "",
      noSeenWordsToast: "Rapid Fire is empty for now. Play a few games first and build your pool.",
      badge: "RAPID FIRE",

      // END screen (BONUS)
      endTitle: "",
      scoreLine: "Score: {score}",
      endStatsLine: "You got {cleared} out of {shown} right.",
      endStatsLineOne: "You got {cleared} out of {shown} right.",
      endDeckSizeLine: "Rapid Fire pool: {count} questions.",
      endDeckSizeLineOne: "Rapid Fire pool: 1 question.",
      endPoolProgressTemplate: "{cleared} out of {shown} correct this round.",
      endDeckExhaustedToast: "All available questions played.",
      mistakesTitle: "Questions to revisit",
      mistakesToggle: "{count} mistakes",
      mistakesNone: "No mistakes.",

      // BONUS new best label (END)
      newBest: "NEW BEST SCORE.",
      celebrationPerfect: "PERFECT RUN",
      labelByTier: {
        perfect: "FAST AND CLEAN",
        high: "QUICK HANDS",
        medium: "FINDING PACE",
        low: "PACE CHECK"
      },

      // END BONUS — cognitive mirror by accuracy tier
      // Contract: arrays MUST contain exactly 2 sentences each. No fallback in UI.
      endByTier: {
        perfect: [
          "You proved it under pressure.",
          "You answered those questions instantly."
        ],
        high: [
          "You held up under pressure.",
          "Your rule knowledge held up well."
        ],
        medium: [
          "You settled in.",
          "This mode rewards solid rule recall."
        ],
        low: [
          "The pace got ahead of you.",
          "You need both recall and control here."
        ]
      },

      // END BONUS — personalized recommendation (accuracy × deck size)
      // Keys: "{accuracyTier}_{deckTier}" — must cover all combinations
      endRecoByTier: {
        perfect_small: "Expand your deck to unlock more Rapid Fire questions.",
        perfect_medium: "Replay to keep that edge.",
        perfect_large: "Your Rapid Fire pool is deep: keep going.",

        high_small: "Expand your deck to unlock more Rapid Fire questions.",
        high_medium: "Try again to lock in the ones you missed.",
        high_large: "Stay in Rapid Fire: that was a strong game.",

        medium_small: "Expand your deck first. More seen questions will make Rapid Fire stronger.",
        medium_medium: "Try another Rapid Fire game to build your recall.",
        medium_large: "Keep going. Recall gets stronger with repetition.",

        low_small: "Expand your deck first. More seen questions will make Rapid Fire stronger.",
        low_medium: "Try another Rapid Fire game to rebuild confidence.",
        low_large: "Try again: recall comes with practice."
      },

      // BONUS END — emotionally congruent CTA label by accuracy tier
      ctaByTier: {
        perfect: "Keep proving it",
        high: "Stay in Rapid Fire",
        medium: "Try Rapid Fire again",
        low: "Try Rapid Fire again"
      },

      ctaExpandDeck: "Expand your deck",

      // Start overlay (same component as FREE runs)
      startOverlayLine1: "Rapid Fire Mode.",
      startOverlayLine2: "Only questions you've already seen.",
      startOverlayLine3: "Play more games to grow your pool.",

      // Teaser premium (filled by ui.js): {remaining}, {limit}
      startOverlayFreeRunsLimitLine: "",

      // Block modal when free limit reached
      freeLimitReachedTitle: "That was intense. Time to towel off.",
      freeLimitReachedBody: "You've used your {limit} free Rapid Fire games.\n\nFull access unlocks unlimited Rapid Fire Mode.\nSame pace.\nNo limits.",
      freeLimitReachedCta: "Keep playing",
      freeLimitReachedClose: "Not now",
      startOverlayTapAnywhere: "Tap anywhere to start",

      // Minimal entry (autoporteur)
      title: "Pickleball Rules Quiz",
      subtitle: "Rapid Fire",
      questionPrompt: "True or false?",
      dangerLineLabel: "TIMEOUT LINE",
      dangerLineAria: "Timeout line. If the card reaches this line, the item is lost.",
      seenOnlyLine: "{count} pickleball rules in your Rapid Fire pool.",

      // End toasts (BONUS ends by returning to END screen)
      // Keep existing (even if you later stop using the modal)
      modalTitle: "Rapid Fire Mode",
      modalBody: "Rapid Fire Mode is faster and more demanding.\nIt uses only questions you've already seen in the game.\nTest your rule recall under pressure.",
      modalCta: "Play Rapid Fire Mode"
    },


    practice: {
      title: "Mistakes Mode",
      on: "On",
      off: "Off",

      premiumOnly: "Full access only",
      descLocked: "Replay the questions that still need work.",
      valueLine: "Focus on the questions that still need work.",
      descUnlocked: "Only the questions you previously got wrong.",

      freeLimitReachedTitle: "That helped.",
      freeLimitReachedBody: "You've used your {limit} free mistakes games.\n\nFull access unlocks unlimited Mistakes Mode.\nKeep fixing what you missed.\nNo limits.",
      freeLimitReachedCta: "Keep playing",
      freeLimitReachedClose: "Not now",

      // END screen (PRACTICE)
      endTitle: "",
      endLine: "Keep going.",
      allFixedLine: "You closed it out.",
      celebrationAllCleared: "STRONG FINISH",
      labelByTier: {
        last: "LAST ONE",
        light: "GOOD RECOVERY",
        firm: "WORKING BACK",
        direct: "STAY WITH IT"
      },
      endLineAllFixed: "You closed it out.",
      endStatsLineAllFixed: "You fixed {fixed}.",
      // Tier-aware override (keyed on practiceRepeatTierKey). Fallback: endLine.
      endLineByTier: {
        last: "Nice recovery.",
        light: "Good recovery.",
        firm: "That's progress.",
        direct: "You're making progress."
      },
      endStatsLine: "You fixed {fixed}. You still have {remaining} left.",

      // Repeat guidance by tier (selected via WT_CONFIG.routing.practiceRepeatTiers)
      // Fail-closed: missing tier key => no note
      endRepeatNoteByTier: {
        last: "One question left. Clear it now.",
        light: "",
        firm: "A few questions still need another pass.",
        direct: "Stay in Mistakes Mode. These are the questions that need the work."
      },

      scoreLine: "{total} questions reviewed",

      // PLAYING: calm progress line (replaces assertion in PRACTICE)
      playingProgressLine: "{current}/{total}",

      // Start overlay (PRACTICE): explain the mode (2 lines shown via typeLine + msg)
      startRunChancesOverlayPractice: "Only questions you missed.\nUp to 10 per game.\nFix it and it drops out. Miss it and it comes back.",
      startOverlayTapAnywhere: "Tap anywhere to start",
      // Fallback CTA when no repeat tier is selected
      ctaPracticeAgain: "Practice again",

      // Optional CTA override (END PRACTICE) based on remaining tier
      // Fail-closed: missing tier key => keep ctaPracticeAgain
      ctaRepeatByTier: {
        last: "Clear the last question",
        light: "Fix your mistakes one more time",
        firm: "Play Mistakes Mode again",
        direct: "Stay in Mistakes Mode"
      },


      playing: {
        questionLabel: "Question",
        assertion: "Is this statement true or false?",
        answersAria: "Answer choices",
        questionHeadingTemplate: "",
        feedbackTitleOk: "",
        feedbackTitleBad: "",

        // New best score (PLAYING)
        newBestScore: "New best score.",

        // Feedback truth line (used inline after Correct/Incorrect):
        // "Correct - {question}"
        // "Incorrect - {question}"
        feedbackRelationSameTemplate: "{question}",
        feedbackRelationDifferentTemplate: "{question}"
      }
    },

    micropics: {
      runContinues: "You got it. Keep going.",


      // Near-miss (END-only highlight)
      nearMiss: "Close call. That one was waiting for you.",


      // Repeated mistakes (END-only highlight)
      repeatMistake: "This one keeps pulling you in. Slow down and read it again.",


      // First time reaching the tier in this game
      streakStart: "3 in a row. Good start.",
      streakBuilding: "6 in a row. You know these.",
      streakStrong: "10 in a row. You know these.",
      streakElite: "15 in a row. Strong run.",
      streakLegendary: "20 in a row. Rules locked in.",


      // Reaching a tier again in the same game (after a mistake)
      // {streak} = current streak at display time, {n} = threshold value (3/6/10/15/20)
      streakAgainTemplate: "{streak} in a row again.",

      // First non-chiffré micro-pic after a mistake (one-shot)
      recovery: "There you go.",

      runEndedAllChancesUsed: ""
    },

    end: {
      title: "",


      // Pool complete (one-shot celebration when 200/200 reached)
      poolCompleteTitle: "All questions complete.",
      poolCompleteLine1: "You made it through the full set. Now replay, fix mistakes, and know the rules better.",
      poolCompleteLine2: "Come back later and see what you still remember.",
      directToConsolidationLine: "You finished the full set with no active mistakes, so you move straight to phase 3.",
      poolCompleteScoreLine: "This game: {score} {fpShort}",
      poolCompleteCtaPrimary: "Replay in a new order",
      poolCompleteCtaPractice: "Fix your mistakes",

      freeLimitReachedTitle: "Nice game.",
      freeLimitReachedBody: "You've used your {limit} free games.\n\nFull access unlocks all 200 pickleball rules questions, unlimited play, explanations after every answer, Mistakes Mode, and Rapid Fire Mode on this device.",
      freeLimitReachedCta: "Keep playing",
      freeLimitReachedClose: "Not now",

      // No redundancy: do not mention chances on END (player already knows).
      endLine: "",
      endStatsLine: "You got {score} out of {total} right. You've now seen {seen}/{poolSize} rules.",


      // (verdict grid removed — identityByVerdict is now the primary END signal)

      // RUN END — identity + lens + CTA by verdict tier
      // Keys must match UI mapping: none/start/building/strong/elite/legendary
      identityByVerdict: {
        none: "A few questions are still slipping past you.",
        start: "You're getting your bearings.",
        building: "You're starting to get the feel for these rules.",
        strong: "You know more of these rules now.",
        elite: "You know these rules well.",
        legendary: "You really know these rules."
      },

      ctaByVerdict: {
        none: "Play again",
        start: "Play again: aim for 6+",
        building: "Play again: aim for 10+",
        strong: "Play again: push your score higher",
        elite: "Play again: master the remaining questions",
        legendary: "Play again"
      },

      strongestTagLine: "Category you handled best: {tag}.",
      weakestTagLine: "Category that gave you the most trouble: {tag}.",

      endTagHighlights: {
        "2026_changes": "The 2026 rule changes were the toughest part of this game."
      },

      scoreLine: "Score: {score} {fpLong}",

      // Best score surfacing (rendered by ui.js using {best})
      personalBestLine: "Best score: {best} {fpLong}",
      nearBestLine: "{delta} {fpLong} away from your best score.",
      // Free runs hint (RUN-only; shown only when remaining > 0)
      freeRunLeft: "{remaining} free game{pluralS} left.",

      // RUN END - mistakes recap (free + premium)
      mistakesTitle: "Questions to revisit",
      mistakesNone: "No mistakes.",
      mistakesToggle: "{count} mistakes",

      newBest: "NEW PERSONAL BEST",
      labelByVerdict: {
        none: "EARLY RALLY",
        start: "FIRST PASS",
        building: "GETTING A READ",
        strong: "SOLID GAME",
        elite: "RULES READY",
        legendary: "LOCKED IN"
      },
      houseAdSummaryLabel: "Keep going with another game",
      playAgain: "Play again",

      practiceCta: "Fix what you missed",
      practiceCtaTemplate: "Fix your {count} mistake{pluralS}",

      // RUN routing: when score reaches the "strong" tier, END can promote BONUS as primary CTA.
      bonusCtaPrimary: "Try Rapid Fire Mode",

      // Post-completion routing (pool exhausted + mistakes)
      // Vars: {backlog}
      practiceCtaCountPremium: "Fix what you missed",
      shareTitle: "Challenge a friend"
    },

    paywall: {
      // Default headline
      headline: "Unlock the full pickleball rules quiz.",

      // LAST FREE RUN - stronger but factual
      headlineLastFree: "You've got the feel for it. Now finish the set.",

      // Projection personnalisée (PAYWALL only)
      // Vars: {seen} {poolSize} {remaining}
      progressLine1: "You've seen {seen} questions. {remaining} more are waiting in the full set.",
      progressLine2: "",

      payOnceLine: "Pay once. No subscription.",

      // Section headers (anti “mur de mots”)
      valueTitle: "What you get",
      trustTitle: "Simple unlock",
      compactTitle: "What unlocks",
      compactBullets: [
        "**All 200 pickleball rules questions**",
        "**Explanations after every answer**",
        "**Mistakes Mode** and **Rapid Fire**",
        "**Works offline** after first load"
      ],

      valueBullets: [
        "**All 200 pickleball rules questions**",
        "**A mix of easy, intermediate, and hard questions**",
        "**Explanations after every answer**",
        "**Mistakes Mode** to fix what you missed",
        "**Rapid Fire Mode** and unlimited replays"
      ],

      // Shared bridge copy (LANDING post-paywall + END runs exhausted)
      bridgeTitle: "Know the pickleball rules better.",
      bridgeBody: "Unlock all 200 questions, fix what you missed, and keep playing with every mode open.",

      trustLine: "**One-time unlock**",
      trustBullets: [
        "**Pay once**, no subscription",
        "**No account** or signup needed",
        "**Full access** stays on this device",
        "**Works offline** after first load",
        "**Secure payment** through Stripe"
      ],


      // PW1: Social proof (optional - do not invent numbers/claims)
      // If all are empty, nothing is rendered.
      socialProofTitle: "What players say",
      socialProofQuotes: [
        { quote: "★★★★★\nI felt confident going in, and this still caught a few things I was getting wrong. The explanations are clear and genuinely helpful.", author: "Maya, tournament player" },
        { quote: "★★★★★\nTwo quick games were enough to show me I needed the full set.", author: "Jon, doubles regular" }
      ],

      // EARLY-only conversion bump (no fallback; shown only if template is provided)
      // Vars: {saveAmount} {earlyPrice} {standardPrice}
      savingsLineTemplate: "Save {saveAmount} with the early price.",
      // Micro reassurance under CTA (optional, no fallback)
      checkoutNote: "Payment handled securely by Stripe. Usually about 30 seconds.",
      checkoutRedirecting: "Redirecting to secure checkout...",

      // Primary CTA changes with price phase (EARLY vs STANDARD)
      ctaEarly: "Unlock full access for $4.99",
      ctaStandard: "Unlock full access for $6.99",

      // Backward compat (still used in a few places)
      cta: "Get full access",

      alreadyHaveCode: "Already have a device unlock code? Use it here.",
      deviceNote: "One-time unlock for this device. No account needed.",

      // PW2: EARLY visual badge (copy visible)
      earlyBadgeLabel: "Early bird",

      earlyLabel: "Early price",
      standardLabel: "Standard price",

      // Loss-oriented urgency label (stronger conversion driver)
      timerLabel: "Price increases in:",

      postEarlyLine1: "The early price has ended.",
      postEarlyLine2: "{standardPrice}. One-time unlock for this device."
    },


    howto: {
      title: "How to play",
      howToPlayLine1: "You see a statement about pickleball rules.",
      howToPlayLine2: "Decide whether it is true or false.",
      howToPlayLine3: "Choose True or False.",

      modesTitle: "Game modes",
      modesBullets: [
        "The game: discover the full set and learn the rules.",
        "Rapid Fire Mode: faster and more demanding. Uses only questions you've already seen.",
        "Mistakes Mode: replay what you missed (up to 10 questions)."
      ],

      ruleTitle: "Rule",
      ruleSentence: "Each correct answer adds 1 point. A wrong answer adds 1 mistake. After {maxChances} mistakes, the game ends.",
      premiumTitle: "Full access",
      alreadyPremium: "Full access is already enabled on this device.",
      activateTitle: "Use a device unlock code",
      activateLine1: "Already have a device unlock code? Use it here.",
      activateLine2: "No account needed. This unlock stays on this device.",
      activationCodeLabel: "Device unlock code",
      activationCodePlaceholder: "PRQ-0000-0000",
      enterCode: "Enter a code.",
      codeRejected: "Code rejected.",
      activateCta: "Activate",
      codeInvalid: "Invalid code format.",
      codeUsed: "This device already used a code.",
      codeOk: "Full access enabled on this device.",


      autoActivateTitle: "Unlock code ready",
      autoActivateLine1: "Your device unlock code is already saved here.",
      autoActivateLine2: "Enable full access on this device now?",
      autoActivateCta: "Unlock now",
      autoActivateLater: "Not now"
    },

    postCompletion: {
      title: "You've seen everything.",
      body: "Now keep improving. Practice your mistakes, explore Rapid Fire Mode, or replay full games.",

      // Mastered (pool exhausted + 0 active mistakes)
      masteredTitle: "Bravo ! You answered the full question set correctly.",
      masteredLine1: "Zero mistakes left. Every question answered correctly.",
      masteredLine2: "Now put your rule knowledge under pressure. Then come back in a few weeks and see if it still holds.",
      masteredCtaBonus: "Challenge yourself in Rapid Fire Mode",
      masteredCtaReplay: "Replay in a new order",

      waitlistTitle: "Stay in the loop",
      waitlistBody1: "Get notified when we add new questions or features.",
      waitlistBody2: "No spam. No account. Leave anytime.",
      waitlistCta: "Get notified",
      waitlistDisclaimer: "Email only. Unsubscribe anytime.",
      houseAdCta: "Explore Bonjour Pickleball"
    },

    houseAd: {
      eyebrow: "After {poolSize} questions",
      title: "You know the rules. Next stop: France.",
      bodyLine1: "Carole, the creator of Pickleball Rules Quiz, splits her time between the U.S. and France.",
      bodyLine2: "Join the Bonjour Pickleball list for future pickleball trips, camps, and small-group experiences in France.",
      ctaPrimary: "See France trips",
      ctaRemindLater: "Remind later",

      // Landing presence (same meaning, same tone)
      landingTitle: "You know the rules. Next stop: France.",
      landingBodyLine1: "Carole, the creator of Pickleball Rules Quiz, splits her time between the U.S. and France.",
      landingBodyLine2: "Join the Bonjour Pickleball list for future pickleball trips, camps, and small-group experiences in France.",
      landingCtaPrimary: "See France trips",
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

I'd like to join the Pickleball Rules Quiz waitlist.

Optional idea:
{idea}

Thanks!`
    },




    share: {
      ctaLabel: "Copy challenge",
      emailLabel: "Email challenge",
      emailSubject: "Pickleball Rules Quiz",
      previewLabel: "Challenge preview",
      toastCopied: "Copied.",
      template: `Think you know pickleball?
Try this one:
{funFact}

I got {score} right in Pickleball Rules Quiz.
Can you beat me?
{url}`,

      teaserTrap: "Looks obvious... until it isn't.",
      teaserTrue: "Sometimes the obvious answer is right.",
      funFactTemplatesTrap: [
        `"{question}" True or false? 🤔`
      ],
      funFactTemplatesTrue: [
        `"{question}" True or false? 🤔`
      ],


    },



    installPrompt: {
      title: "Keep the game handy",
      body: "Add Pickleball Rules Quiz to your home screen.\nCome back in one tap.",
      bodyIOS: "This will not install automatically on iPhone.\nTap Share, then Add to Home Screen.",
      ctaPrimary: "Add to home screen",
      ctaPrimaryIOS: "Got it",
      ctaSecondary: "Later"
    },


    statsSharing: {
      sectionTitle: "Anonymous stats (optional)",
      buttonLabel: "Share anonymous stats",

      // Lightweight prompt (shown at milestones)
      promptTitle: "Help improve Pickleball Rules Quiz",
      promptBodyTemplate: "You have reached {thresholdPct}% of the pool (unique questions). Share anonymous stats to help improve the game. You can review everything before sending.",
      promptBodyLastFree: "That was your last free game. Share anonymous stats to help improve the game. You can review everything before sending.",
      promptBodyPowerUser: "You're clearly a power player. Share anonymous stats to help improve the game. You can review everything before sending.",
      promptCtaPrimary: "Preview & share",
      promptCtaSecondary: "Not now",

      // Full modal (manual access + prompt primary)
      modalTitle: "Help improve the game",
      modalDescription: "Share your anonymous gameplay stats with the creator.\nNo personal data is collected.\nYou can see exactly what will be sent below.",
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
      modalBodyLine2: "Pick a reason below or copy the address.",
      emailSubjectSuffix: "Feedback",
      ctaCopy: "Copy email",
      ctaOpen: "Open email app",
      ctaBug: "Bug report",
      ctaQuestion: "Question",
      ctaIdea: "Idea",
      bugSubjectSuffix: "Bug report",
      questionSubjectSuffix: "Question",
      ideaSubjectSuffix: "Idea",

      // Email compose (prefill)
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
      title: "Out of bounds.",
      line1: "This page landed outside the court.",
      line2: "The good news: Pickleball Rules Quiz is still ready to play.",
      cta: "Back to the court"
    },

  };



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
