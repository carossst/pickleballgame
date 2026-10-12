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
      return String(value || '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
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
