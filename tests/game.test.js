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

test('RUN doubles points after four correct answers and resets after a mistake', () => {
  const engine = new (createGameApi().GameEngine)();
  engine.start({
    items: Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      correctAnswer: true
    })),
    statsByItem: {},
    getStatsByItem: () => ({}),
    config: makeRunConfig(),
    mode: 'RUN'
  });
  for (let i = 0; i < 4; i++) engine.answer(true);
  expect(engine.getState()).toMatchObject({
    scoreFP: 4,
    scoreMultiplier: 2,
    comboActivations: 1
  });
  engine.answer(true);
  expect(engine.getState()).toMatchObject({
    scoreFP: 6,
    correctCount: 5,
    comboActivations: 1,
    bonusPoints: 1
  });
  engine.answer(false);
  expect(engine.getState().scoreMultiplier).toBe(1);
  engine.answer(true);
  expect(engine.getState()).toMatchObject({
    scoreFP: 7,
    correctCount: 6,
    bonusPoints: 1
  });
  for (let i = 0; i < 3; i++) engine.answer(true);
  expect(engine.getState().comboActivations).toBe(2);
  engine.start({
    items: [{ id: 1, correctAnswer: true }],
    statsByItem: {},
    getStatsByItem: () => ({}),
    config: makeRunConfig(),
    mode: 'RUN'
  });
  expect(engine.getState()).toMatchObject({
    scoreFP: 0,
    scoreMultiplier: 1,
    comboActivations: 0,
    bonusPoints: 0
  });
});

test.each(['PRACTICE', 'BONUS'])(
  '%s keeps one point per correct answer beyond six',
  (mode) => {
    const engine = new (createGameApi().GameEngine)();
    const items = Array.from({ length: 9 }, (_, i) => ({
      id: i + 1,
      correctAnswer: true
    }));
    const statsByItem = Object.fromEntries(
      items.map((item) => [
        item.id,
        { seenCount: 1, lastWrongAt: 2, lastCorrectAt: 0 }
      ])
    );
    engine.start({
      items,
      statsByItem,
      getStatsByItem: () => statsByItem,
      config: makeRunConfig(),
      mode
    });
    for (let i = 0; i < 7; i++) engine.answer(true);
    expect(engine.getState()).toMatchObject({
      scoreFP: 7,
      bonusPoints: 0,
      scoreMultiplier: 1
    });
  }
);

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

test('curated free runs preserve configured question order', () => {
  const WT_Game = createGameApi();
  const items = [
    { id: 1, correctAnswer: true },
    { id: 2, correctAnswer: false },
    { id: 3, correctAnswer: true },
    { id: 4, correctAnswer: false },
    { id: 5, correctAnswer: true },
    { id: 6, correctAnswer: false }
  ];
  const config = makeRunConfig({
    curatedFreeRuns: {
      enabled: true,
      runCount: 2,
      cardIdsByRun: {
        1: [3, 1, 2],
        2: [6, 5, 4]
      }
    }
  });

  const run1 = WT_Game.buildDeck({
    items,
    statsByItem: {},
    mistakesOnly: false,
    config,
    runStartNumber: 1
  });
  const run2 = WT_Game.buildDeck({
    items,
    statsByItem: {},
    mistakesOnly: false,
    config,
    runStartNumber: 2
  });

  expect(run1.ids.slice(0, 3)).toEqual([3, 1, 2]);
  expect(run2.ids.slice(0, 3)).toEqual([6, 5, 4]);
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

test('fixed RUN decks preserve challenge order and end without reshuffling', () => {
  const WT_Game = createGameApi();
  const engine = new WT_Game.GameEngine();
  const items = [
    { id: 1, correctAnswer: true, explanationShort: 'one' },
    { id: 2, correctAnswer: true, explanationShort: 'two' }
  ];

  engine.start({
    items,
    statsByItem: {},
    getStatsByItem: () => ({}),
    config: makeRunConfig(),
    mode: 'RUN',
    fixedIds: [2, 1]
  });

  expect(engine.getCurrent().id).toBe(2);
  engine.answer(true);
  expect(engine.getCurrent().id).toBe(1);
  const result = engine.answer(true);
  expect(result.done).toBe(true);
  expect(engine.getTotal()).toBe(2);
});
