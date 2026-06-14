'use strict';

const {
  createWindowLike,
  createDocumentLike,
  loadBrowserScript
} = require('./helpers/browser-loader');

function loadEndModule() {
  const context = loadBrowserScript('ui-screen-end.js', {
    window: createWindowLike(),
    document: createDocumentLike()
  });
  return context.window.WT_UI_End;
}

function buildHelpers(overrides) {
  return Object.assign(
    {
      buildEndModeCopy() {
        return {
          endLineTpl: '',
          bonusLevel: '',
          practiceRepeatTierKey: '',
          practiceStatsLineTpl: '',
          practiceRepeatNoteTpl: '',
          runVerdictKey: 'solid',
          runIdentityTpl: '',
          runPoolCompleteLine2Tpl: '',
          bonusDeckTier: '',
          bonusRecoLine: ''
        };
      },
      buildEndCopyHtml() {
        return '<p>copy</p>';
      },
      buildEndMistakesRecap() {
        return '<div>mistakes</div>';
      },
      buildEndMicroLines(args) {
        return `<div data-daily-line="${String(args.dailyChallengeLine || '')}"></div>`;
      },
      buildEndShareBlock() {
        return '<div>share</div>';
      },
      buildEndActionsHtml(args) {
        return `<div data-flags="incomplete:${args.dailyChallengeIncomplete}|replay:${args.dailyChallengeNeedsReplayReward}|cta:${args.dailyChallengeCta}"></div>`;
      },
      getRunTierInfo() {
        return { currentLabel: 'Solid', nextTarget: 12, nextLabel: 'Strong' };
      },
      getDailyChallengeModel() {
        return {
          targetScore: 12,
          rewardPendingReplay: false,
          completedToday: false
        };
      },
      getAppLevelModel() {
        return {
          preview: { unlockedLevel: 0, justUnlocked: false },
          defs: [],
          levelsW: {}
        };
      },
      renderBrandingRow() {
        return '<div>brand</div>';
      },
      renderIcon(name) {
        return `<i>${name}</i>`;
      },
      hasSolvedSecretChestHint() {
        return false;
      },
      isPremiumNow() {
        return false;
      },
      clampInt(value, min, max) {
        const n = Number(value);
        if (!Number.isFinite(n)) return min;
        return Math.max(min, Math.min(max, Math.floor(n)));
      },
      fillTemplate(tpl, vars) {
        return String(tpl || '').replace(/\{(\w+)\}/g, (_m, key) =>
          Object.prototype.hasOwnProperty.call(vars || {}, key)
            ? String(vars[key])
            : ''
        );
      },
      escapeHtml(s) {
        return String(s);
      },
      MODES: {
        RUN: 'RUN',
        PRACTICE: 'PRACTICE',
        BONUS: 'BONUS'
      }
    },
    overrides || {}
  );
}

test('END render flags daily replay reward for free RUN 1 success case', () => {
  const endModule = loadEndModule();
  const html = endModule.render(
    {
      config: {
        game: { maxChances: 3, poolSize: 200 },
        routing: {},
        secretBonus: { tapWindowMs: 900, gates: { endAfterRuns: 0 } },
        share: { enabled: false },
        shareBonus: { enabled: true, bonusRuns: 1, premiumOnly: false }
      },
      wording: {
        ui: { scoreLabel: 'Score' },
        end: {
          title: 'Run complete',
          scoreLine: '{score}',
          dailyChallengeCleared: 'Cleared {targetScore}',
          dailyChallengeClearedFreeRun: 'Cleared preview {targetScore}',
          dailyChallengeTicketWon: 'Won ticket {targetScore}',
          dailyChallengeTicketCapped: 'Cap {cap}',
          dailyChallengeMiss: 'Miss {targetScore}',
          dailyChallengeMissLastFree: 'Last free miss {targetScore}',
          dailyChallengeCtaRetry: 'Retry daily'
        },
        paywall: {},
        landing: { dailyChallengeCta: 'Daily CTA' },
        system: {}
      },
      storage: {
        getSeenItemIds() {
          return [1, 2];
        },
        getRunsBalance() {
          return 1;
        },
        getRapidFireTicketCap() {
          return 3;
        },
        getRunNumber() {
          return 1;
        }
      },
      _runtime: {
        runMode: 'RUN',
        runItemIds: [1, 2, 3],
        lastRun: {
          mode: 'RUN',
          runType: 'FREE',
          scoreFP: 8,
          maxChances: 3,
          chancesLeft: 2,
          newBest: false,
          bestScoreFP: 8,
          dailyChallengeCompleted: true,
          dailyTargetScore: 12,
          dailyTicketAwarded: false,
          dailyTicketAtCap: false,
          dailyTicketBalance: 1,
          poolCompleteCelebration: false
        }
      }
    },
    buildHelpers({
      getDailyChallengeModel() {
        return {
          targetScore: 12,
          rewardPendingReplay: true,
          completedToday: false
        };
      }
    })
  );

  expect(html).toContain(
    'data-flags="incomplete:true|replay:true|cta:Retry daily"'
  );
  expect(html).toContain('data-daily-line="Cleared preview 12"');
});

test('END render uses last-free daily miss paywall bridge copy when appropriate', () => {
  const endModule = loadEndModule();
  const html = endModule.render(
    {
      config: {
        game: { maxChances: 3, poolSize: 200 },
        routing: {},
        secretBonus: { tapWindowMs: 900, gates: { endAfterRuns: 0 } },
        share: { enabled: false },
        shareBonus: { enabled: true, bonusRuns: 1, premiumOnly: false }
      },
      wording: {
        ui: { scoreLabel: 'Score' },
        end: {
          title: 'Run complete',
          scoreLine: '{score}',
          dailyChallengeCleared: 'Cleared {targetScore}',
          dailyChallengeTicketWon: 'Won ticket {targetScore}',
          dailyChallengeMiss: 'Miss {targetScore}',
          dailyChallengeMissLastFree: 'Last free miss {targetScore}'
        },
        paywall: {
          bridgeTitle: 'Unlock more',
          bridgeBody: 'Default bridge',
          bridgeBodyLastFreeMiss: 'Specific last free miss bridge'
        },
        shareBonus: {
          title: 'One game on the house',
          body: 'Share with a friend.',
          ctaShare: 'Share & play',
          ctaLater: 'Not now'
        },
        system: {}
      },
      storage: {
        getSeenItemIds() {
          return [1, 2];
        },
        getRunsBalance() {
          return 0;
        },
        getRapidFireTicketCap() {
          return 3;
        },
        getRunNumber() {
          return 2;
        },
        hasShareBonusGranted() {
          return false;
        }
      },
      _runtime: {
        runMode: 'RUN',
        runItemIds: [1, 2, 3],
        lastRun: {
          mode: 'RUN',
          runType: 'LAST_FREE',
          scoreFP: 4,
          maxChances: 3,
          chancesLeft: 0,
          newBest: false,
          bestScoreFP: 8,
          dailyChallengeCompleted: false,
          dailyTargetScore: 12,
          dailyTicketAwarded: false,
          dailyTicketAtCap: false,
          dailyTicketBalance: 1,
          poolCompleteCelebration: false
        }
      }
    },
    buildHelpers({
      getDailyChallengeModel() {
        return {
          targetScore: 12,
          rewardPendingReplay: false,
          completedToday: false
        };
      }
    })
  );

  expect(html).toContain('Specific last free miss bridge');
  expect(html).toContain('data-daily-line="Last free miss 12"');
  expect(html).toContain('One game on the house');
  expect(html).toContain('data-action="claim-share-bonus"');
  expect(html).toContain('data-action="dismiss-share-bonus"');
});

test('END render uses a semantic h1 for the main title', () => {
  const endModule = loadEndModule();
  const html = endModule.render(
    {
      config: {
        game: { maxChances: 3, poolSize: 200 },
        routing: {},
        secretBonus: { tapWindowMs: 900, gates: { endAfterRuns: 0 } },
        share: { enabled: false }
      },
      wording: {
        ui: { scoreLabel: 'Score' },
        end: {
          title: 'Run complete',
          scoreLine: '{score}'
        },
        paywall: {},
        system: {}
      },
      storage: {
        getSeenItemIds() {
          return [1];
        },
        getRunsBalance() {
          return 1;
        },
        getRapidFireTicketCap() {
          return 3;
        },
        getRunNumber() {
          return 1;
        }
      },
      _runtime: {
        runMode: 'RUN',
        runItemIds: [1],
        lastRun: {
          mode: 'RUN',
          runType: 'FREE',
          scoreFP: 2,
          maxChances: 3,
          chancesLeft: 1,
          newBest: false,
          bestScoreFP: 2,
          poolCompleteCelebration: false
        }
      }
    },
    buildHelpers()
  );

  expect(html).toContain('<h1 class="wt-h1">Run complete</h1>');
  expect(html).not.toContain('<p class="wt-h1">Run complete</p>');
});

test('END render proposes leaderboard join when a RUN score exists and no profile is set', () => {
  const endModule = loadEndModule();
  const html = endModule.render(
    {
      config: {
        game: { maxChances: 3, poolSize: 200 },
        routing: {},
        secretBonus: { tapWindowMs: 900, gates: { endAfterRuns: 0 } },
        share: { enabled: false },
        shareBonus: { enabled: false, bonusRuns: 1, premiumOnly: false }
      },
      wording: {
        ui: { scoreLabel: 'Score' },
        end: {
          title: 'Run complete',
          scoreLine: '{score}'
        },
        leaderboard: {
          endJoinTitle: 'Put this score on the leaderboard',
          endJoinBody:
            'Choose a nickname to submit this run to the public leaderboard.',
          joinCta: 'Join leaderboard'
        },
        paywall: {},
        system: {}
      },
      storage: {
        getSeenItemIds() {
          return [1, 2];
        },
        getRunsBalance() {
          return 1;
        },
        getRunNumber() {
          return 1;
        },
        getLeaderboardProfile() {
          return { nickname: '', optIn: false };
        }
      },
      _runtime: {
        runMode: 'RUN',
        runItemIds: [1, 2, 3],
        lastRun: {
          mode: 'RUN',
          runType: 'FREE',
          scoreFP: 19,
          maxChances: 3,
          chancesLeft: 1,
          newBest: false,
          bestScoreFP: 19,
          poolCompleteCelebration: false
        }
      }
    },
    buildHelpers()
  );

  expect(html).toContain('Put this score on the leaderboard');
  expect(html).toContain('data-action="open-leaderboard-profile"');
  expect(html).toContain('Join leaderboard');
});
