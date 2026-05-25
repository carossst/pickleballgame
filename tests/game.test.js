'use strict';

const { loadBrowserScript } = require('./helpers/browser-loader');

function createGameApi() {
  const context = loadBrowserScript('game.js', {
    window: {
      WT_ENUMS: {
        GAME_MODES: {
          RUN: 'RUN',
          PRACTICE: 'PRACTICE',
          BONUS: 'BONUS'
        }
      }
    }
  });
  return context.window.WT_Game;
}

function makeRunConfig(overrides) {
  return Object.assign(
    {
      game: {
        maxChances: 3,
        poolSize: 100,
        antiRepetitionUntilExhaustion: false
      },
      mistakesOnly: {
        enabled: true
      },
      secretBonus: {
        minDeckSize: 1
      }
    },
    overrides || {}
  );
}

test('buildSeenDeck keeps only seen items', () => {
  const WT_Game = createGameApi();
  const deck = WT_Game.buildSeenDeck({
    items: [
      { id: 1, correctAnswer: true },
      { id: 2, correctAnswer: false },
      { id: 3, correctAnswer: true }
    ],
    statsByItem: {
      1: { seenCount: 2 },
      2: { seenCount: 0 },
      3: { seenCount: 1 }
    },
    config: makeRunConfig()
  });

  expect(deck.ids.slice().sort((a, b) => a - b)).toEqual([1, 3]);
});

test('buildSeenDeck fail-closes when seen deck is under minDeckSize', () => {
  const WT_Game = createGameApi();
  const deck = WT_Game.buildSeenDeck({
    items: [
      { id: 1, correctAnswer: true },
      { id: 2, correctAnswer: false }
    ],
    statsByItem: {
      1: { seenCount: 1 },
      2: { seenCount: 0 }
    },
    config: makeRunConfig({
      secretBonus: { minDeckSize: 2 }
    })
  });

  expect(deck.ids).toEqual([]);
});

test('RUN reshuffle flag is one-shot when UI reads state', () => {
  const WT_Game = createGameApi();
  const engine = new WT_Game.GameEngine();
  const items = [{ id: 1, correctAnswer: true, explanationShort: 'ok' }];

  engine.start({
    items,
    statsByItem: {},
    getStatsByItem: () => ({}),
    config: makeRunConfig(),
    mode: 'RUN',
    runStartNumber: 1
  });

  const result = engine.answer(true);
  expect(result.state.poolReshuffled).toBe(true);
  expect(engine.getState().poolReshuffled).toBe(false);
});

test('BONUS ends at deck end and does not reshuffle', () => {
  const WT_Game = createGameApi();
  const engine = new WT_Game.GameEngine();
  const items = [{ id: 7, correctAnswer: true, explanationShort: 'ok' }];

  engine.start({
    items,
    statsByItem: { 7: { seenCount: 1 } },
    getStatsByItem: () => ({ 7: { seenCount: 1 } }),
    config: makeRunConfig(),
    mode: 'BONUS'
  });

  const result = engine.answer(true);
  expect(result.done).toBe(true);
  expect(result.state.done).toBe(true);
  expect(result.state.poolReshuffled).toBe(false);
  expect(result.state.mode).toBe('BONUS');
});
