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

function buildHelpers(renderLeaderboardLandingCard) {
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
        rewardAvailableToday: true
      };
    },
    getAppLevelModel() {
      return {
        state: { currentLevel: 0 },
        current: null,
        levelsW: {
          openDetailsAria: 'Open level details',
          modalTitle: 'Levels'
        }
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
        dailyChallengeTitleTemplate: 'Goal: {targetScore}+ score',
        dailyChallengeProgressTemplate: 'Best today: {bestToday}',
        dailyChallengeResetTemplate: 'Resets in {resetIn}',
        dailyChallengeRewardTemplate: 'Win 1 Rapid Fire ticket',
        dailyChallengeCta: "Try today's challenge"
      },
      installPrompt: {},
      leaderboard: {
        cardTitle: 'THIS WEEK',
        cardSubDefault: 'Public RUN leaderboard.',
        cardCtaJoin: 'Open leaderboard',
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

test('landing after first completed run shows personal best, daily, and leaderboard blocks', () => {
  const modules = loadLandingModules();
  const html = modules.renderLanding(
    createUi(1, { seenCount: 8 }),
    buildHelpers(modules.renderLeaderboardLandingCard)
  );

  expect(html).toContain('PERSONAL BEST');
  expect(html).toContain('Set your first score');
  expect(html).toContain('DAILY CHALLENGE');
  expect(html).toContain('THIS WEEK');
  expect(html).toContain('Levels');
});

test('landing personal best first-state card starts a run directly', () => {
  const modules = loadLandingModules();
  const html = modules.renderLanding(
    createUi(1, { bestScoreFP: 0, seenCount: 8 }),
    buildHelpers(modules.renderLeaderboardLandingCard)
  );

  expect(html).toContain('PERSONAL BEST');
  expect(html).toContain('Score 3+ to unlock your first tier.');
  expect(html).toContain('data-action="start-run"');
  expect(html).toContain('wt-landing-stat--clickable');
});

test('landing hides phase progress card when no seen questions exist yet', () => {
  const modules = loadLandingModules();
  const html = modules.renderLanding(
    createUi(1, { seenCount: 0 }),
    buildHelpers(modules.renderLeaderboardLandingCard)
  );

  expect(html).not.toContain("You've seen 0 questions so far.");
  expect(html).toContain('Levels');
  expect(html).toContain('PERSONAL BEST');
});

test('landing first-score card routes to paywall when free runs are exhausted', () => {
  const modules = loadLandingModules();
  const html = modules.renderLanding(
    createUi(1, { seenCount: 8, bestScoreFP: 0, runsBalance: 0 }),
    buildHelpers(modules.renderLeaderboardLandingCard)
  );

  expect(html).toContain('Record your score');
  expect(html).toContain(
    'Unlock full access to record your score and keep building your best.'
  );
  expect(html).toContain('data-action="open-paywall"');
});
