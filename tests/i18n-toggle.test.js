'use strict';

const {
  createWindowLike,
  loadBrowserScript
} = require('./helpers/browser-loader');

function createFakeClassList() {
  const set = new Set();
  return {
    add(name) {
      set.add(String(name));
    },
    remove(name) {
      set.delete(String(name));
    },
    contains(name) {
      return set.has(String(name));
    }
  };
}

function createFakeElement(tagName) {
  const attrs = new Map();
  const listeners = new Map();
  const el = {
    tagName: String(tagName || '').toUpperCase(),
    className: '',
    classList: createFakeClassList(),
    parentNode: null,
    innerHTML: '',
    setAttribute(name, value) {
      attrs.set(String(name), String(value));
    },
    getAttribute(name) {
      return attrs.has(String(name)) ? attrs.get(String(name)) : null;
    },
    appendChild(child) {
      if (child && typeof child === 'object') {
        child.parentNode = el;
      }
      return child;
    },
    addEventListener(type, handler) {
      const key = String(type || '');
      if (!listeners.has(key)) listeners.set(key, []);
      listeners.get(key).push(handler);
    },
    dispatch(type, event) {
      const handlers = listeners.get(String(type || '')) || [];
      for (const handler of handlers) {
        handler.call(el, event);
      }
    }
  };
  return el;
}

function createDocumentHarness() {
  const body = createFakeElement('body');
  const head = createFakeElement('head');
  const createdHosts = [];
  const headChildren = [];

  head.appendChild = function appendChild(child) {
    if (child && typeof child === 'object') {
      child.parentNode = head;
      headChildren.push(child);
    }
    return child;
  };

  const documentLike = {
    readyState: 'complete',
    body,
    head,
    documentElement: {
      getAttribute() {
        return '';
      },
      setAttribute() {}
    },
    addEventListener() {},
    removeEventListener() {},
    getElementById() {
      return null;
    },
    querySelector() {
      return null;
    },
    createElement(tagName) {
      const el = createFakeElement(tagName);
      if (String(tagName || '').toLowerCase() === 'div') {
        createdHosts.push(el);
      }
      return el;
    }
  };

  return { documentLike, body, head, headChildren, createdHosts };
}

function loadToggle(overrides) {
  const state = {
    locale: (overrides && overrides.locale) || 'en',
    setLocaleCalls: []
  };
  const windowLike = createWindowLike({
    WT_I18N: {
      getLocale() {
        return state.locale;
      },
      getSupportedLocales() {
        return ['en', 'fr'];
      },
      setLocale(loc) {
        state.setLocaleCalls.push(String(loc));
        state.locale = String(loc);
        return true;
      }
    },
    WT_WORDING: {
      i18nToggle: {
        switchToTemplate: 'Switch to {locale}',
        languageNames: {
          en: 'English',
          fr: 'French'
        }
      }
    },
    WT_CONFIG: {
      i18n: {
        localeStorageKey: 'pickleball-rules-quiz:locale'
      }
    },
    location: {
      pathname: (overrides && overrides.pathname) || '/',
      search: '',
      assign: vi.fn()
    }
  });
  const { documentLike, body, head, headChildren, createdHosts } =
    createDocumentHarness();

  loadBrowserScript('i18n-toggle.js', {
    window: windowLike,
    document: documentLike
  });

  return {
    windowLike,
    body,
    head,
    headChildren,
    host: createdHosts[0],
    state
  };
}

test('landing locale toggle renders a real FR link and prefetches sibling page', () => {
  const ctx = loadToggle({ pathname: '/' });

  expect(ctx.host.innerHTML).toContain('href="./fr.html"');
  expect(ctx.host.innerHTML).not.toContain('data-wt-locale-swap-to=');
  expect(ctx.headChildren).toHaveLength(1);
  expect(ctx.headChildren[0].getAttribute('href')).toBe('./fr.html');
});

test('landing locale toggle uses native link navigation on entry pages', () => {
  const ctx = loadToggle({ pathname: '/' });
  expect(ctx.host.innerHTML).toContain('href="./fr.html"');
  expect(ctx.state.setLocaleCalls).toEqual([]);
});

test('French entry toggle navigates back to EN root immediately', () => {
  const ctx = loadToggle({ pathname: '/fr.html', locale: 'fr' });
  expect(ctx.host.innerHTML).toContain('href="./index.html"');
  expect(ctx.state.setLocaleCalls).toEqual([]);
});

test('non-entry locale toggle falls back to in-place setLocale()', () => {
  const ctx = loadToggle({ pathname: '/success.html' });
  const event = {
    preventDefault: vi.fn(),
    target: {
      closest() {
        return {
          getAttribute(name) {
            if (name === 'data-wt-locale-swap-to') return 'fr';
            return null;
          }
        };
      }
    }
  };

  expect(ctx.host.innerHTML).toContain('<button');

  ctx.host.dispatch('click', event);

  expect(event.preventDefault).toHaveBeenCalledTimes(1);
  expect(ctx.state.setLocaleCalls).toEqual(['fr']);
});
