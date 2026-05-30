'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const {
  createWindowLike,
  createDocumentLike
} = require('./helpers/browser-loader');

function loadUiModule(overrides) {
  function createFakeElement(hidden) {
    return {
      innerHTML: '',
      disabled: false,
      classList: {
        add() {},
        remove() {},
        contains() {
          return !!hidden;
        }
      },
      addEventListener() {},
      removeEventListener() {},
      setAttribute() {},
      getAttribute() {
        return null;
      },
      querySelector() {
        return null;
      },
      querySelectorAll() {
        return [];
      },
      contains() {
        return false;
      }
    };
  }

  const elements = {
    app: createFakeElement(false),
    modal: createFakeElement(true),
    'modal-content': createFakeElement(false)
  };

  const windowLike = createWindowLike(
    Object.assign(
      {
        WT_ENUMS: {
          UI_STATES: {
            LANDING: 'LANDING',
            PLAYING: 'PLAYING',
            END: 'END',
            PAYWALL: 'PAYWALL'
          },
          GAME_MODES: {
            RUN: 'RUN',
            PRACTICE: 'PRACTICE',
            BONUS: 'BONUS'
          }
        },
        WT_CONFIG: {},
        WT_WORDING: {},
        WT_I18N: {
          getLocale() {
            return 'en';
          }
        },
        WT_ICONS: {
          renderIcon(name) {
            return `<i>${String(name)}</i>`;
          }
        },
        WT_UTILS: {
          escapeHtml(value) {
            return String(value == null ? '' : value);
          }
        },
        speechSynthesis: {
          cancel() {},
          speak() {},
          getVoices() {
            return [{ lang: 'en-US' }];
          },
          addEventListener() {}
        },
        SpeechSynthesisUtterance: function SpeechSynthesisUtterance(text) {
          this.text = text;
        }
      },
      overrides?.window || {}
    )
  );

  const documentLike = createDocumentLike(
    Object.assign(
      {
        getElementById(id) {
          return elements[String(id)] || null;
        },
        createElement(tag) {
          if (String(tag) === 'textarea') {
            return {
              _html: '',
              set innerHTML(value) {
                this._html = String(value || '');
              },
              get value() {
                return this._html;
              }
            };
          }
          return {};
        },
        documentElement: {
          setAttribute() {},
          getAttribute(name) {
            if (String(name) === 'lang') return 'en';
            return '';
          }
        }
      },
      overrides?.document || {}
    )
  );

  class CustomEventShim {
    constructor(type, options) {
      this.type = String(type || '');
      this.detail =
        options && Object.prototype.hasOwnProperty.call(options, 'detail')
          ? options.detail
          : undefined;
    }
  }

  const context = {
    window: windowLike,
    document: documentLike,
    navigator: windowLike.navigator,
    location: { pathname: '/index.html', search: '' },
    console,
    structuredClone,
    crypto: webcrypto,
    CustomEvent: CustomEventShim,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    requestAnimationFrame(fn) {
      return setTimeout(fn, 0);
    },
    cancelAnimationFrame(id) {
      clearTimeout(id);
    },
    Date,
    Math,
    JSON,
    Number,
    String,
    Boolean,
    RegExp,
    Array,
    Object,
    Map,
    Set,
    WeakMap,
    WeakSet,
    Symbol,
    Promise,
    URL,
    URLSearchParams
  };

  context.globalThis = context;
  context.window.window = context.window;
  context.window.document = context.document;
  context.window.navigator = context.navigator;
  context.window.location = context.location;
  context.window.requestAnimationFrame = context.requestAnimationFrame;
  context.window.cancelAnimationFrame = context.cancelAnimationFrame;
  context.window.CustomEvent = CustomEventShim;

  const code = fs.readFileSync(
    path.resolve(__dirname, '..', 'ui.js'),
    'utf8'
  );
  vm.createContext(context);
  vm.runInContext(code, context, {
    filename: path.resolve(__dirname, '..', 'ui.js')
  });

  return {
    UI: context.window.WT_UI,
    context
  };
}

function createPlayingUi(options) {
  const { UI } = loadUiModule();
  const ui = new UI({
    storage: {
      getAutoReadQuestions() {
        return options.autoRead === true;
      },
      hasUsedQuestionAudio() {
        return options.usedAudio === true;
      },
      getCounters() {
        return { runCompletes: options.runCompletes || 0 };
      },
      isPremium() {
        return false;
      }
    },
    game: {
      getState() {
        return {
          maxChances: 3,
          chancesLeft: 3,
          scoreFP: 0,
          deckSize: 10
        };
      },
      getCurrent() {
        return {
          id: 1,
          question: 'Is this legal?',
          assertion: 'Choose true or false.',
          correctAnswer: true
        };
      },
      getTotal() {
        return 10;
      }
    },
    config: {
      game: { maxChances: 3 },
      ui: { gameplayPulseMs: 500 },
      personalBest: { enabled: false },
      identity: { uiLogoUrl: '', appName: 'Pickleball Rules Quiz' },
      secretBonus: {}
    },
    wording: {
      playing: {},
      practice: {},
      secretBonus: {},
      ui: {
        scoreLabel: 'Score',
        scoreAriaTemplate: '{scoreLabel} {score}',
        mistakesLabel: 'Mistakes',
        trueLabel: 'True',
        falseLabel: 'False'
      },
      system: {
        loading: 'Loading',
        speakQuestion: 'Read the question aloud',
        replayQuestion: 'Read again',
        stopQuestion: 'Stop',
        speakQuestionAria: 'Read the question aloud',
        replayQuestionAria: 'Read the question again',
        stopQuestionAria: 'Stop reading aloud'
      }
    }
  });

  ui.state = 'PLAYING';
  ui._runtime.runMode = 'RUN';
  ui._runtime.runItemIds = [];
  return ui;
}

test('question-audio control is shown only before first completion unless user engaged', () => {
  const firstRunUi = createPlayingUi({
    runCompletes: 0,
    usedAudio: false,
    autoRead: false
  });
  const laterUi = createPlayingUi({
    runCompletes: 1,
    usedAudio: false,
    autoRead: false
  });
  const engagedUi = createPlayingUi({
    runCompletes: 1,
    usedAudio: true,
    autoRead: false
  });
  const autoReadUi = createPlayingUi({
    runCompletes: 1,
    usedAudio: false,
    autoRead: true
  });

  expect(firstRunUi._renderPlaying()).toContain(
    'data-action="toggle-question-audio"'
  );
  expect(laterUi._renderPlaying()).not.toContain(
    'data-action="toggle-question-audio"'
  );
  expect(engagedUi._renderPlaying()).toContain(
    'data-action="toggle-question-audio"'
  );
  expect(autoReadUi._renderPlaying()).toContain(
    'data-action="toggle-question-audio"'
  );
});

test('claimShareBonus grants via native share and rerenders once', async () => {
  const { UI, context } = loadUiModule();
  let shareGranted = false;
  let shareClicks = 0;
  const ui = new UI({
    storage: {
      hasShareBonusGranted() {
        return shareGranted;
      },
      grantShareBonus() {
        shareGranted = true;
        return { ok: true, reason: 'GRANTED', balance: 1 };
      },
      markShareClicked() {
        shareClicks += 1;
      }
    },
    game: {},
    config: {},
    wording: {
      shareBonus: {
        toastAlready: 'Already',
        toastShareFailed: 'Failed',
        toastUnlocked: 'Unlocked'
      }
    }
  });

  let renders = 0;
  ui.render = function () {
    renders += 1;
  };
  ui._getShareText = function () {
    return 'Share this';
  };

  context.navigator.share = async function () {};

  const trigger = {
    disabled: false,
    _attrs: new Map(),
    setAttribute(name, value) {
      this._attrs.set(String(name), String(value));
    },
    getAttribute(name) {
      return this._attrs.has(String(name)) ? this._attrs.get(String(name)) : null;
    }
  };

  await ui.claimShareBonus({
    target: {
      closest() {
        return trigger;
      }
    }
  });

  expect(shareGranted).toBe(true);
  expect(shareClicks).toBe(1);
  expect(renders).toBe(1);
});

test('claimShareBonus falls back to clipboard only when native share is unavailable', async () => {
  const { UI, context } = loadUiModule();
  let shareGranted = false;
  let copied = 0;
  const ui = new UI({
    storage: {
      hasShareBonusGranted() {
        return false;
      },
      grantShareBonus() {
        shareGranted = true;
        return { ok: true, reason: 'GRANTED', balance: 1 };
      },
      markShareClicked() {}
    },
    game: {},
    config: {},
    wording: {
      shareBonus: {
        toastAlready: 'Already',
        toastShareFailed: 'Failed',
        toastUnlocked: 'Unlocked'
      }
    }
  });

  ui.render = function () {};
  ui._getShareText = function () {
    return 'Share this';
  };

  delete context.navigator.share;
  context.navigator.clipboard = {
    async writeText(value) {
      copied += value ? 1 : 0;
    }
  };

  await ui.claimShareBonus({
    target: {
      closest() {
        return null;
      }
    }
  });

  expect(shareGranted).toBe(true);
  expect(copied).toBe(1);
});
