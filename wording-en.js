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
      dailyChallengeTitleTemplate: 'Target: {targetScore}+',
      dailyChallengeProgressTemplate:
        'Today: {score}/{targetScore}.',
      dailyChallengeResetTemplate: '',
      dailyChallengeCompletedTemplate:
        'Daily challenge cleared.\nNext challenge at {resetTime}.',
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
      dailyChallengeCleared: 'Daily challenge cleared.',
      dailyChallengeClearedFreeRun:
        'Daily challenge cleared. The Rapid Fire ticket unlocks on your last free run.',
      dailyChallengeTicketWon:
        'Daily challenge cleared. +1 Rapid Fire ticket.',
      dailyChallengeTicketCapped:
        'Daily challenge cleared. Tickets are capped at {cap}. Spend one to earn more.',
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
      emailSubject: 'Pickleball Rules Quiz',
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
