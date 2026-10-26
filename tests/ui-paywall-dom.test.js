'use strict';

const {
  createWindowLike,
  createDocumentLike,
  loadBrowserScript
} = require('./helpers/browser-loader');

function loadPaywallModule() {
  const context = loadBrowserScript('ui-screen-paywall.js', {
    window: createWindowLike(),
    document: createDocumentLike()
  });
  return context.window.WT_UI_Paywall;
}

function buildHelpers() {
  return {
    escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },
    fillTemplate(tpl, vars) {
      return String(tpl || '').replace(/\{(\w+)\}/g, (_m, key) =>
        Object.prototype.hasOwnProperty.call(vars || {}, key)
          ? String(vars[key])
          : ''
      );
    },
    formatCents(cents) {
      return `$${(Number(cents || 0) / 100).toFixed(2)}`;
    },
    mmss() {
      return '00:00';
    },
    renderTextWithStrong(value) {
      return String(value || '').replace(
        /\*\*(.*?)\*\*/g,
        '<strong>$1</strong>'
      );
    },
    renderBrandingRow() {
      return '<div>brand</div>';
    },
    clampInt(value, min, max) {
      const n = Number(value);
      if (!Number.isFinite(n)) return min;
      return Math.max(min, Math.min(max, Math.floor(n)));
    },
    isPremiumNow() {
      return false;
    }
  };
}

test('paywall personalizes progress copy when the last run had mistakes', () => {
  const paywall = loadPaywallModule();
  const html = paywall.render(
    {
      config: {
        currency: 'USD',
        earlyPriceCents: 499,
        standardPriceCents: 699,
        game: { poolSize: 200 }
      },
      wording: {
        system: { notNow: 'Not now' },
        landing: {},
        howto: {},
        paywall: {
          headline: 'Unlock',
          progressLine1: 'Seen {seen}. {remaining} left.',
          progressLine2: 'Default progress line.',
          mistakeLineTemplate:
            'You missed {mistakes} rule trap{pluralS}. Mistakes Mode turns them into focused practice.',
          standardLabel: 'Standard',
          ctaStandard: 'Unlock'
        }
      },
      storage: {
        getSeenItemIds() {
          return [1, 2, 3];
        },
        getRunsUsed() {
          return 2;
        },
        getCounters() {
          return { runCompletes: 2 };
        }
      },
      _runtime: {
        lastRun: {
          scoreFP: 4,
          mistakeIds: [10, 11]
        }
      }
    },
    buildHelpers()
  );

  expect(html).toContain('You missed 2 rule traps.');
  expect(html).not.toContain('Default progress line.');
});

test('paywall uses singular question copy when one question was seen', () => {
  const paywall = loadPaywallModule();
  const html = paywall.render(
    {
      config: {
        currency: 'USD',
        earlyPriceCents: 499,
        standardPriceCents: 699,
        game: { poolSize: 200 }
      },
      wording: {
        system: { notNow: 'Not now' },
        landing: {},
        howto: {},
        paywall: {
          headline: 'Unlock',
          progressLine1:
            "You've seen {seen} {questionWord}. {remaining} more are waiting.",
          standardLabel: 'Standard',
          ctaStandard: 'Unlock'
        }
      },
      storage: {
        getSeenItemIds() {
          return [1];
        },
        getRunsUsed() {
          return 1;
        },
        getCounters() {
          return { runCompletes: 1 };
        }
      },
      _runtime: { lastRun: { scoreFP: 1, mistakeIds: [] } }
    },
    buildHelpers()
  );

  expect(html).toContain('You&#39;ve seen 1 question. 199 more are waiting.');
  expect(html).not.toContain('1 questions');
});

test('paywall renders conversion reassurance, locked preview, and not-ready action', () => {
  const paywall = loadPaywallModule();
  const html = paywall.render(
    {
      config: {
        currency: 'USD',
        earlyPriceCents: 499,
        standardPriceCents: 699,
        game: { poolSize: 200 }
      },
      wording: {
        system: { notNow: 'Not now' },
        landing: {},
        howto: {},
        waitlist: { ctaLabel: 'Get notified' },
        paywall: {
          headline: 'Unlock',
          mistakeHeadlineTemplate: 'Fix the {mistakes} traps.',
          progressLine1: 'Seen {seen}. {remaining} left.',
          mistakeLineTemplate: 'You missed {mistakes} traps.',
          compactTitle: 'What unlocks',
          compactBullets: ['**Practice mistakes**'],
          lockedPreviewTitle: 'Locked after preview',
          lockedPreviewItems: ['Kitchen faults', 'Line calls'],
          reassuranceTitle: 'Quick checkout',
          reassuranceItems: ['**Instant access**', '**No account required**'],
          notReadyLine: 'Not ready today?',
          notReadyCta: 'Get updates instead',
          standardLabel: 'Standard',
          ctaStandard: 'Unlock'
        }
      },
      storage: {
        getSeenItemIds() {
          return [1, 2, 3];
        },
        getRunsUsed() {
          return 2;
        },
        getCounters() {
          return { runCompletes: 2 };
        },
        shouldShowWaitlistOnPaywall() {
          return true;
        }
      },
      _runtime: {
        lastRun: {
          scoreFP: 4,
          mistakeIds: [10, 11]
        }
      }
    },
    buildHelpers()
  );

  expect(html).toContain('Fix the 2 traps.');
  expect(html).toContain('Quick checkout');
  expect(html).toContain('<strong>Instant access</strong>');
  expect(html).toContain('Locked after preview');
  expect(html).toContain('Kitchen faults');
  expect(html).toContain('Not ready today?');
  expect(html).toContain('data-action="open-waitlist"');
  expect(html).toContain('Get updates instead');
});
