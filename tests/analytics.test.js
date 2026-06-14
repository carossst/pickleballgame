'use strict';

const {
  createWindowLike,
  createDocumentLike,
  loadBrowserScript
} = require('./helpers/browser-loader');

function loadAnalytics(overrides = {}) {
  const windowLike = createWindowLike({
    location: {
      search: '?wt-source=seo',
      href: 'https://pickleballrulesquiz.com/?wt-source=seo'
    },
    ...(overrides.window || {})
  });

  const documentLike = createDocumentLike({
    documentElement: {
      setAttribute() {},
      getAttribute(name) {
        if (name === 'lang') return 'en';
        if (name === 'data-wt-locale-hint') return 'en';
        return '';
      }
    },
    ...(overrides.document || {})
  });

  const context = loadBrowserScript('analytics.js', {
    window: windowLike,
    document: documentLike
  });

  return {
    context,
    analytics: context.window.WT_Analytics
  };
}

test('analytics builds a stable event path from funnel props', () => {
  const { analytics } = loadAnalytics();

  expect(
    analytics.buildEventPath('checkout_click', {
      mode: 'RUN',
      entry_source: 'seo',
      premium: false,
      lang: 'en',
      price_key: 'EARLY'
    })
  ).toBe('/event/checkout-click/run/price-early/src-seo/free/en');
});

test('analytics infers UI context from locale, source, and storage', () => {
  const { analytics } = loadAnalytics({
    window: {
      WT_I18N: {
        getLocale() {
          return 'fr';
        }
      }
    }
  });

  const props = analytics.inferUiContext(
    {
      storage: {
        isPremium() {
          return true;
        },
        getRunsUsed() {
          return 3;
        }
      }
    },
    { mode: 'RUN' }
  );

  expect(props).toEqual({
    lang: 'fr',
    entry_source: 'seo',
    premium: true,
    free_runs_used: 3,
    mode: 'RUN'
  });
});

test('analytics sends GoatCounter funnel events as custom events', () => {
  const calls = [];
  const { analytics } = loadAnalytics({
    window: {
      goatcounter: {
        count(payload) {
          calls.push(payload);
        }
      }
    }
  });

  const sent = analytics.trackFunnel('success_view', {
    lang: 'en',
    entry_source: 'direct'
  });

  expect(sent).toBe(true);
  expect(calls).toHaveLength(1);
  expect(calls[0]).toMatchObject({
    path: '/event/success-view/src-direct/en',
    event: true
  });
  expect(calls[0].title).toContain('success_view');
});
