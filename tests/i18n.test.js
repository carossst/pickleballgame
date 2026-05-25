'use strict';

const {
  createWindowLike,
  createDocumentLike,
  loadBrowserScript
} = require('./helpers/browser-loader');

function loadI18n(options) {
  const windowLike = createWindowLike({
    WT_CONFIG: {
      i18n: {
        supportedLocales: ['en', 'fr'],
        defaultLocale: 'en',
        localeStorageKey: 'pickleball-rules-quiz:locale'
      }
    },
    WT_WORDING_ALL: {
      en: { code: 'en' },
      fr: { code: 'fr' }
    },
    navigator: {
      language: (options && options.navigatorLanguage) || 'en-US',
      languages: [(options && options.navigatorLanguage) || 'en-US']
    },
    location: {
      search: (options && options.search) || ''
    }
  });
  const documentLike = createDocumentLike({
    documentElement: {
      _attrs: {
        'data-wt-locale-hint': (options && options.hint) || ''
      },
      setAttribute(name, value) {
        this._attrs[String(name)] = String(value);
      },
      getAttribute(name) {
        return this._attrs[String(name)] || '';
      }
    }
  });

  loadBrowserScript('i18n.js', {
    window: windowLike,
    document: documentLike
  });

  return {
    windowLike,
    documentLike,
    i18n: windowLike.WT_I18N
  };
}

test('entry EN page hint wins over French browser locale on root page', () => {
  const ctx = loadI18n({
    hint: 'en',
    navigatorLanguage: 'fr-FR'
  });

  expect(ctx.i18n.getLocale()).toBe('en');
  expect(ctx.windowLike.WT_WORDING.code).toBe('en');
  expect(ctx.documentLike.documentElement.getAttribute('lang')).toBe('en');
});

test('French entry page hint resolves locale to fr', () => {
  const ctx = loadI18n({
    hint: 'fr',
    navigatorLanguage: 'en-US'
  });

  expect(ctx.i18n.getLocale()).toBe('fr');
  expect(ctx.windowLike.WT_WORDING.code).toBe('fr');
});

test('lang query param overrides page hint and storage', () => {
  const ctx = loadI18n({
    hint: 'en',
    navigatorLanguage: 'en-US',
    search: '?lang=fr'
  });

  expect(ctx.i18n.getLocale()).toBe('fr');
  expect(
    ctx.windowLike.localStorage.getItem('pickleball-rules-quiz:locale')
  ).toBe('fr');
});
