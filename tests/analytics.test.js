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
      href: 'https://www.pickleballrulesquiz.com/?wt-source=seo'
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
    analytics.buildEventPath('checkout_start', {
      mode: 'RUN',
      entry_source: 'seo',
      premium: false,
      lang: 'en',
      price_key: 'EARLY'
    })
  ).toBe('event/checkout-start/run/price-early/src-seo/free/en');
});

test('analytics includes paywall source in funnel event paths', () => {
  const { analytics } = loadAnalytics();

  expect(
    analytics.buildEventPath('paywall_dismiss', {
      from_state: 'END',
      entry_source: 'seo',
      premium: false,
      lang: 'fr'
    })
  ).toBe('event/paywall-dismiss/from-end/src-seo/free/fr');
});

test('analytics builds checkout cancel paths with last checkout context', () => {
  const { analytics } = loadAnalytics();

  expect(
    analytics.buildEventPath('checkout_cancel', {
      from_state: 'end',
      price_key: 'STANDARD',
      entry_source: 'seo',
      premium: false,
      lang: 'en'
    })
  ).toBe('event/checkout-cancel/from-end/price-standard/src-seo/free/en');
});

test('analytics includes end action in funnel event paths', () => {
  const { analytics } = loadAnalytics();

  expect(
    analytics.buildEventPath('end_action_click', {
      mode: 'RUN',
      action: 'start-practice',
      entry_source: 'seo',
      premium: false,
      lang: 'en'
    })
  ).toBe('event/end-action-click/run/action-start-practice/src-seo/free/en');
});

test('combo cohorts are filterable paths and numeric metrics stay in titles', () => {
  const { analytics } = loadAnalytics();
  for (const reached of [true, false]) {
    const props = {
      mode: 'RUN',
      combo_reached: reached,
      combo_activations: reached ? 1 : 0,
      bonus_points: reached ? 2 : 0
    };
    expect(analytics.buildEventPath('run_complete', props)).toBe(
      `event/run-complete/run/combo-${reached ? 'reached' : 'not-reached'}`
    );
    expect(analytics.buildEventTitle('run_complete', props)).toContain(
      `combo_activations=${props.combo_activations}`
    );
  }
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
    referral: 'none',
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
    path: 'event/success-view/src-direct/en',
    event: true
  });
  expect(calls[0].title).toContain('success_view');
});
