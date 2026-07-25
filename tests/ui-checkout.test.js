'use strict';

const {
  createWindowLike,
  loadBrowserScript
} = require('./helpers/browser-loader');

function loadCheckout() {
  const windowLike = createWindowLike({ location: { href: '' } });
  const context = loadBrowserScript('ui-checkout.js', { window: windowLike });
  return { context, checkout: context.window.WT_UI_Checkout.checkout };
}

function makeUi(configOverrides) {
  return {
    config: {
      stripeStandardPaymentUrl: 'https://buy.stripe.com/test_standard',
      stripeEarlyPaymentUrl: 'https://buy.stripe.com/test_early',
      ...configOverrides
    },
    wording: { system: {}, paywall: {} },
    storage: null
  };
}

function makeHelpers(overrides) {
  return { isOnline: () => true, toastNow: () => {}, ...overrides };
}

test('checkout redirects to an allowed Stripe hostname', () => {
  const { context, checkout } = loadCheckout();

  checkout(makeUi(), 'STANDARD', null, makeHelpers());

  expect(context.window.location.href).toBe(
    'https://buy.stripe.com/test_standard'
  );
});

test('checkout picks the early-price URL for the EARLY price key', () => {
  const { context, checkout } = loadCheckout();

  checkout(makeUi(), 'EARLY', null, makeHelpers());

  expect(context.window.location.href).toBe(
    'https://buy.stripe.com/test_early'
  );
});

test('checkout refuses to redirect to a non-Stripe hostname', () => {
  const { context, checkout } = loadCheckout();

  checkout(
    makeUi({ stripeStandardPaymentUrl: 'https://evil.example.com/steal' }),
    'STANDARD',
    null,
    makeHelpers()
  );

  expect(context.window.location.href).toBe('');
});

test('checkout refuses a malformed payment URL', () => {
  const { context, checkout } = loadCheckout();

  checkout(
    makeUi({ stripeStandardPaymentUrl: 'not-a-url' }),
    'STANDARD',
    null,
    makeHelpers()
  );

  expect(context.window.location.href).toBe('');
});

test('checkout does nothing while offline', () => {
  const { context, checkout } = loadCheckout();
  const ui = makeUi();
  ui.wording.system.offlinePayment = 'You are offline.';
  let toasted = null;

  checkout(
    ui,
    'STANDARD',
    null,
    makeHelpers({
      isOnline: () => false,
      toastNow: (_cfg, msg) => {
        toasted = msg;
      }
    })
  );

  expect(context.window.location.href).toBe('');
  expect(toasted).toBe('You are offline.');
});
