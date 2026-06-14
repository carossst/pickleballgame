'use strict';

const LeaderboardLogic = require('../logic/leaderboard-logic.js');
const {
  createWindowLike,
  createDocumentLike,
  loadBrowserScript
} = require('./helpers/browser-loader');

function loadLandingModules() {
  const windowLike = createWindowLike({
    WT_LeaderboardLogic: LeaderboardLogic
  });
  const documentLike = createDocumentLike();
  loadBrowserScript('ui-leaderboard.js', {
    window: windowLike,
    document: documentLike
  });
  const context = loadBrowserScript('ui-screen-landing.js', {
    window: windowLike,
    document: documentLike
  });
  return {
    renderLanding: context.window.WT_UI_Landing.render,
    renderLeaderboardLandingCard:
      context.window.WT_UI_Leaderboard.renderLandingCard
  };
}

function buildHelpers(renderLeaderboardLandingCard, overrides = {}) {
  return {
    escapeHtml(s) {
      return String(s);
    },
    fillTemplate(tpl, vars) {
      return String(tpl || '').replace(/\{(\w+)\}/g, (_m, key) =>
        Object.prototype.hasOwnProperty.call(vars || {}, key)
          ? String(vars[key])
          : ''
      );
    },
    clampInt(value, min, max) {
      const n = Number(value);
      if (!Number.isFinite(n)) return min;
      return Math.max(min, Math.min(max, Math.floor(n)));
    },
    isPremiumNow() {
      return false;
    },
    getRunTierInfo(_cfg, _w, bestScoreFP) {
      return {
        currentLabel: bestScoreFP > 0 ? 'Solid' : '',
        nextTarget: 3,
        nextLabel: 'Solid',
        progressPct: 25
      };
    },
    getDailyChallengeModel() {
      return {
        targetScore: 6,
        completedToday: false,
        challengePlayable: true,
        rewardPendingReplay: false,
        ticketAtCap: false,
        ticketBalance: 1,
        ticketCost: 1,
        ticketCap: 3,
        resetInMs: 3600000,
        resetTime: '2h 58m',
        progressPct: 0,
        todayBestScore: 0,
        rewardAvailableToday: true,
        ...(overrides.dailyModel || {})
      };
    },
    getAppLevelModel() {
      return {
        state: { currentLevel: 1 },
        current: {
          label: 'COURT-READY',
          sheetBody: 'You finished your first game.'
        },
        next: {
          label: 'RULE-READY',
          unlock: 'See 25 questions.'
        },
        maxLevel: 6,
        levelsW: {
          openDetailsAria: 'Open level details',
          currentLabel: 'Current level',
          modalTitle: 'Levels'
        },
        ...(overrides.levelModel || {})
      };
    },
    getLandingStatsPreviewState() {
      return null;
    },
    getRuleKnowledgePhaseContext() {
      return {
        badge: 'WELCOME BACK',
        landingSummaryTemplate: 'Summary {seen}',
        landingDetailTemplate: 'Detail {remaining}',
        isComplete: false,
        seen: 0,
        mistakes: 0,
        mastered: 0
      };
    },
    renderBrandingRow() {
      return '<div>brand</div>';
    },
    renderTextWithStrong(s) {
      return String(s);
    },
    renderIcon(name) {
      return `<i>${name}</i>`;
    },
    hasSolvedSecretChestHint() {
      return false;
    },
    mmss() {
      return '01:00';
    },
    renderLeaderboardLandingCard(ui) {
      return renderLeaderboardLandingCard(ui, {
        escapeHtml(s) {
          return String(s);
        }
      });
    }
  };
}

function createUi(runCompletes, options = {}) {
  const bestScoreFP = Number(options.bestScoreFP || 0);
  const seenCount = Number(options.seenCount || 0);
  const runsBalance = options.runsBalance == null ? 1 : Number(options.runsBalance);
  return {
    state: 'LANDING',
    _runtime: {},
    _nav: {},
    config: {
      game: { poolSize: 200, maxChances: 3 },
      landingStats: { enabled: false, minCompletedRuns: 1 },
      shareBonus: { enabled: true, bonusRuns: 1, premiumOnly: false },
      waitlist: { enabled: true, minUniqueSeenToShow: 100 },
      levels: {
        maxLevel: 6,
        level2MinSeen: 25,
        level3MinSeen: 75,
        level3MinBestScore: 20,
        level4MinSeen: 200
      },
      leaderboard: {
        enabled: true,
        showAfterRunCompletes: 1,
        cardPreviewCount: 3,
        topN: 10,
        seedScores: {
          weekly: [],
          all: []
        }
      },
      curatedFreeRuns: { enabled: true }
    },
    wording: {
      landing: {
        subtitle: 'Learn the rules. Avoid the traps.',
        personalBestBadge: 'PERSONAL BEST',
        levelProgressSeenTemplate: '{seen}/{target} questions seen',
        levelProgressSeenOrScoreTemplate:
          '{seen}/{seenTarget} questions seen · Best score {best}/{scoreTarget}',
        levelNextTemplate: 'Next: {label}',
        personalBestTitleTemplate: 'Current score tier: {tier}',
        personalBestSubTemplate:
          'Best score: {best}. Next tier at {nextTarget}+.',
        personalBestTopTierTemplate: 'Top tier reached.',
        personalBestFirstTitle: 'Set your first score',
        personalBestFirstSubTemplate:
          'Score {nextTarget}+ to unlock your first tier.',
        personalBestLockedTitle: 'Record your score',
        personalBestLockedSub:
          'Unlock full access to record your score and keep building your best.',
        dailyChallengeBadge: 'DAILY CHALLENGE',
        dailyChallengeTitleTemplate: 'Target: {targetScore}+',
        dailyChallengeProgressTemplate:
          'Today: {score}/{targetScore}.',
        dailyChallengeResetTemplate: '',
        dailyChallengeCompletedTemplate:
          'Daily challenge cleared.\nNext challenge at {resetTime}.',
        dailyChallengeRewardTemplate:
          'Earn 1 Rapid Fire ticket.',
        dailyChallengeCta: 'Start challenge',
        postPaywallCta: 'Unlock full access'
      },
      shareBonus: {
        title: 'One game on the house',
        body: 'Share Pickleball Rules Quiz with a friend and get one more free game. Just this once.',
        ctaShare: 'Share & play',
        ctaLater: 'Not now'
      },
      waitlist: {
        title: 'Get notified',
        bodyLine1: 'Waitlist line 1',
        bodyLine2: 'Waitlist line 2',
        ctaLabel: 'Join waitlist',
        disclaimer: 'No spam.'
      },
      postCompletion: {
        waitlistCta: 'Get notified',
        waitlistDisclaimer: 'No spam.'
      },
      installPrompt: {},
      leaderboard: {
        cardTitle: 'THIS WEEK',
        cardSubDefault: 'Top scores this week.',
        cardCtaJoin: 'Choose nickname',
        loading: 'Loading',
        empty: 'Be the first',
        liveBadge: 'LIVE'
      }
    },
    storage: {
      getRunNumber() {
        return runCompletes;
      },
      getRunsBalance() {
        return runsBalance;
      },
      getRunsUsed() {
        return runCompletes;
      },
      getCounters() {
        return { runCompletes, runStarts: runCompletes };
      },
      getPersonalBest() {
        return { bestScoreFP };
      },
      getSeenItemIds() {
        return Array.from({ length: Math.max(0, seenCount) }, (_v, i) => i + 1);
      },
      getActiveMistakesCount() {
        return 0;
      },
      getLeaderboardProfile() {
        return { nickname: '', optIn: false };
      },
      hasShareBonusGranted() {
        return options.shareBonusGranted === true;
      },
      shouldShowWaitlistNow() {
        return options.waitlistNow === true;
      },
      shouldShowWaitlistOnPaywall() {
        return options.waitlistOnPaywall === true;
      }
    }
  };
}

test('landing first visit hides personal best, daily, and leaderboard blocks', () => {
  const modules = loadLandingModules();
  const html = modules.renderLanding(
    createUi(0),
    buildHelpers(modules.renderLeaderboardLandingCard)
  );

  expect(html).not.toContain('PERSONAL BEST');
  expect(html).not.toContain('Set your first score');
  expect(html).not.toContain('DAILY CHALLENGE');
  expect(html).not.toContain('THIS WEEK');
});

test('landing after first completed run shows level, daily, and leaderboard blocks', () => {
  const modules = loadLandingModules();
  const html = modules.renderLanding(
    createUi(1, { seenCount: 8 }),
    buildHelpers(modules.renderLeaderboardLandingCard)
  );

  expect(html).toContain('Current level: COURT-READY');
  expect(html).toContain('DAILY CHALLENGE');
  expect(html).toContain('THIS WEEK');
  expect(html).not.toContain('PERSONAL BEST');
});

test('landing daily card is clickable when the challenge can be played', () => {
  const modules = loadLandingModules();
  const html = modules.renderLanding(
    createUi(1, { bestScoreFP: 0, seenCount: 8 }),
    buildHelpers(modules.renderLeaderboardLandingCard)
  );

  expect(html).toContain('DAILY CHALLENGE');
  expect(html).toContain('data-action="start-daily-challenge"');
  expect(html).toContain('wt-landing-stat--clickable');
});

test('landing hides phase progress card when no seen questions exist yet', () => {
  const modules = loadLandingModules();
  const html = modules.renderLanding(
    createUi(1, { seenCount: 0 }),
    buildHelpers(modules.renderLeaderboardLandingCard)
  );

  expect(html).not.toContain("You've seen 0 questions so far.");
  expect(html).toContain('Current level: COURT-READY');
  expect(html).toContain('DAILY CHALLENGE');
  expect(html).not.toContain('PERSONAL BEST');
});

test('landing does not bring back personal best when free runs are exhausted', () => {
  const modules = loadLandingModules();
  const html = modules.renderLanding(
    createUi(1, { seenCount: 8, bestScoreFP: 0, runsBalance: 0 }),
    buildHelpers(modules.renderLeaderboardLandingCard)
  );

  expect(html).not.toContain('PERSONAL BEST');
  expect(html).not.toContain('Record your score');
  expect(html).toContain('DAILY CHALLENGE');
  expect(html).toContain('data-action="start-daily-challenge"');
});

test('landing still shows daily card when challenge is not immediately playable', () => {
  const modules = loadLandingModules();
  const html = modules.renderLanding(
    createUi(1, { seenCount: 8, bestScoreFP: 0, runsBalance: 0 }),
    buildHelpers(modules.renderLeaderboardLandingCard, {
      dailyModel: { challengePlayable: false, completedToday: false }
    })
  );

  expect(html).toContain('DAILY CHALLENGE');
  expect(html).not.toContain('data-action="start-daily-challenge"');
});

test('landing exhausted state promotes share bonus before paywall', () => {
  const modules = loadLandingModules();
  const html = modules.renderLanding(
    createUi(1, { seenCount: 8, bestScoreFP: 0, runsBalance: 0 }),
    buildHelpers(modules.renderLeaderboardLandingCard, {
      dailyModel: { challengePlayable: false, completedToday: false }
    })
  );

  expect(html).toContain('One game on the house');
  expect(html).toContain('wt-share-bonus-offer');
  expect(html).toContain('data-action="claim-share-bonus"');
  expect(html).toContain('Share & play');
  expect(html).toContain('data-action="open-paywall"');
  expect(html).toContain('Unlock full access');
});

test('landing exhausted state can still surface waitlist without seen-threshold', () => {
  const modules = loadLandingModules();
  const html = modules.renderLanding(
    createUi(1, {
      seenCount: 8,
      bestScoreFP: 0,
      runsBalance: 0,
      shareBonusGranted: true,
      waitlistOnPaywall: true
    }),
    buildHelpers(modules.renderLeaderboardLandingCard, {
      dailyModel: { challengePlayable: false, completedToday: false }
    })
  );

  expect(html).toContain('Get notified');
  expect(html).toContain('Waitlist line 1');
  expect(html).toContain('Waitlist line 2');
  expect(html).toContain('data-action="open-waitlist"');
});

test('landing daily card does not show daily score progress before completion', () => {
  const modules = loadLandingModules();
  const html = modules.renderLanding(
    createUi(1, { seenCount: 8, bestScoreFP: 0 }),
    buildHelpers(modules.renderLeaderboardLandingCard, {
      dailyModel: {
        completedToday: false,
        rewardPendingReplay: false,
        progressPct: 33,
        todayBestScore: 1,
        targetScore: 3,
        challengePlayable: true
      }
    })
  );

  expect(html).toContain('DAILY CHALLENGE');
  expect(html).toContain('Target: 3+');
  expect(html).toContain('Earn 1 Rapid Fire ticket.');
  expect(html).not.toContain('Today:');
  expect(html).not.toContain('1/3');
});
