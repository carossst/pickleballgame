'use strict';

const {
  loadBrowserScript,
  createWindowLike
} = require('./helpers/browser-loader');

function setup(options) {
  const o = options || {};
  const posts = [];
  const windowLike = createWindowLike({
    fetch: o.failNetwork
      ? async () => {
          throw new Error('offline');
        }
      : async (url, init) => {
          posts.push({ url, init });
          return {};
        }
  });
  if (o.saved) windowLike.localStorage.setItem('wt-newsletter', o.saved);
  const NL = loadBrowserScript('newsletter.js', { window: windowLike }).window
    .WT_Newsletter;
  const config = {
    newsletter: {
      formAction: o.formAction || {
        en: 'https://app.kit.com/forms/1/subscriptions',
        fr: ''
      }
    }
  };
  return { NL, posts, config, windowLike };
}

test('the feature is off until a form action URL is configured for the language', () => {
  const { NL, config } = setup();
  expect(NL.isConfigured(config, 'en')).toBe(true);
  expect(NL.isConfigured(config, 'fr')).toBe(false);
  expect(NL.shouldOffer(config, 'fr')).toBe(false);
  expect(
    NL.isConfigured(
      { newsletter: { formAction: { en: 'http://insecure.test/x' } } },
      'en'
    )
  ).toBe(false);
  expect(NL.isConfigured({}, 'en')).toBe(false);
});

test('email validation and first name trimming', () => {
  const { NL } = setup();
  expect(
    NL.validate({ email: 'marie@example.com', firstName: '  Marie  ' })
  ).toEqual({
    ok: true,
    email: 'marie@example.com',
    firstName: 'Marie'
  });
  expect(NL.validate({ email: 'nope' }).ok).toBe(false);
  expect(NL.validate({ email: 'a@b' }).ok).toBe(false);
  expect(NL.validate({ email: '' }).ok).toBe(false);
  expect(
    NL.validate({ email: 'a@example.com', firstName: 'x'.repeat(80) }).firstName
  ).toHaveLength(40);
});

test('submit posts the Kit field names and remembers the signup', async () => {
  const { NL, posts, config, windowLike } = setup();
  const result = await NL.submit(config, 'en', {
    email: 'marie@example.com',
    firstName: 'Marie'
  });
  expect(result).toBe('sent');
  expect(posts).toHaveLength(1);
  expect(posts[0].url).toBe('https://app.kit.com/forms/1/subscriptions');
  expect(posts[0].init.method).toBe('POST');
  expect(posts[0].init.mode).toBe('no-cors');
  expect(posts[0].init.body.get('email_address')).toBe('marie@example.com');
  expect(posts[0].init.body.get('fields[first_name]')).toBe('Marie');
  expect(windowLike.localStorage.getItem('wt-newsletter')).toBe('sent');
  expect(NL.shouldOffer(config, 'en')).toBe(false);
});

test('submit does nothing when off, invalid, or filled by a bot', async () => {
  const { NL, posts, config } = setup();
  expect(await NL.submit(config, 'fr', { email: 'marie@example.com' })).toBe(
    'off'
  );
  expect(await NL.submit(config, 'en', { email: 'bad' })).toBe('invalid');
  expect(
    await NL.submit(config, 'en', {
      email: 'marie@example.com',
      website: 'spam'
    })
  ).toBe('sent');
  expect(posts).toHaveLength(0);
});

test('a network error is reported and not remembered', async () => {
  const { NL, config, windowLike } = setup({ failNetwork: true });
  expect(await NL.submit(config, 'en', { email: 'marie@example.com' })).toBe(
    'unavailable'
  );
  expect(windowLike.localStorage.getItem('wt-newsletter')).toBe(null);
});

test('field names can be changed in the config', async () => {
  const { NL, posts } = setup();
  const config = {
    newsletter: {
      formAction: { en: 'https://app.kit.com/forms/9/subscriptions' },
      fieldNames: { email: 'email', firstName: 'first_name' }
    }
  };
  await NL.submit(config, 'en', {
    email: 'marie@example.com',
    firstName: 'Marie'
  });
  expect(posts[0].init.body.get('email')).toBe('marie@example.com');
  expect(posts[0].init.body.get('first_name')).toBe('Marie');
});
