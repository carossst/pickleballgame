'use strict';

const { loadBrowserScript } = require('./helpers/browser-loader');

const baseConfig = {
  storageSchemaVersion: 'test-v1',
  identity: { appName: 'Pickleball Rules Quiz' },
  storage: {
    storageKey: 'prq-test-storage',
    vanityCodeStorageKey: 'prq-test-vanity'
  },
  limits: {
    freeRuns: 2
  },
  secretBonus: {
    starterTickets: 1,
    ticketCap: 3,
    ticketCost: 1
  },
  game: {
    poolSize: 200
  },
  levels: {
    maxLevel: 6
  }
};

function createStorageManager() {
  const context = loadBrowserScript('logic/rapidfire-logic.js');
  context.window.WT_RapidFireLogic = context.WT_RapidFireLogic;
  loadBrowserScript('storage.js', { window: context.window });
  const StorageManager = context.window.WT_StorageManager;
  const storage = new StorageManager(baseConfig);
  storage.init();
  return { context, storage };
}

test('starter Rapid Fire ticket is granted once', () => {
  const { storage } = createStorageManager();

  const first = storage.grantStarterRapidFireTicketIfNeeded();
  const second = storage.grantStarterRapidFireTicketIfNeeded();

  expect(first.ok).toBe(true);
  expect(first.granted).toBe(true);
  expect(first.balance).toBe(1);
  expect(second.ok).toBe(true);
  expect(second.granted).toBe(false);
  expect(second.balance).toBe(1);
});

test('daily Rapid Fire ticket is idempotent for a day and respects cap', () => {
  const { storage } = createStorageManager();

  storage.grantStarterRapidFireTicketIfNeeded();
  storage.refundRapidFireTicket(2);
  expect(storage.getRapidFireTicketBalance()).toBe(3);

  const sameDay = storage.grantDailyRapidFireTicket('2026-05-23');
  expect(sameDay.ok).toBe(true);
  expect(sameDay.granted).toBe(false);
  expect(sameDay.atCap).toBe(true);
  expect(sameDay.balance).toBe(3);

  const repeated = storage.grantDailyRapidFireTicket('2026-05-23');
  expect(repeated.ok).toBe(true);
  expect(repeated.granted).toBe(false);
  expect(repeated.balance).toBe(3);

  storage.consumeRapidFireTicketOrBlock();
  const nextDay = storage.grantDailyRapidFireTicket('2026-05-24');
  expect(nextDay.ok).toBe(true);
  expect(nextDay.granted).toBe(true);
  expect(nextDay.balance).toBe(3);
});

test('daily challenge target is frozen per day key', () => {
  const { storage } = createStorageManager();

  const first = storage.ensureDailyChallengeTarget('2026-05-23', 8);
  const second = storage.ensureDailyChallengeTarget('2026-05-23', 13);

  expect(first).toBe(8);
  expect(second).toBe(8);
  expect(storage.getDailyChallengeTarget('2026-05-23')).toBe(8);

  const nextDay = storage.ensureDailyChallengeTarget('2026-05-24', 11);
  expect(nextDay).toBe(11);
  expect(storage.getDailyChallengeTarget('2026-05-23')).toBe(0);
  expect(storage.getDailyChallengeTarget('2026-05-24')).toBe(11);
});

test('leaderboard opt-out clears nickname and disables opt-in', () => {
  const { storage } = createStorageManager();

  const joined = storage.saveLeaderboardProfile('CaroSmash', true);
  const left = storage.saveLeaderboardProfile('', false);

  expect(joined.ok).toBe(true);
  expect(joined.optIn).toBe(true);
  expect(joined.deviceUuid).toMatch(/\S/);
  expect(left.ok).toBe(true);
  expect(left.nickname).toBe('');
  expect(left.optIn).toBe(false);
  expect(left.deviceUuid).toBe(joined.deviceUuid);
});

test('free RUN economy consumes exactly 2 runs then blocks', () => {
  const { storage } = createStorageManager();

  const first = storage.consumeRunOrBlock();
  const second = storage.consumeRunOrBlock();
  const third = storage.consumeRunOrBlock();

  expect(first).toMatchObject({ ok: true, reason: 'CONSUMED', balance: 1 });
  expect(second).toMatchObject({ ok: true, reason: 'CONSUMED', balance: 0 });
  expect(third).toMatchObject({ ok: false, reason: 'NO_RUNS', balance: 0 });
  expect(storage.getRunsUsed()).toBe(2);
});

test('premium RUN economy no longer consumes run balance', () => {
  const { storage } = createStorageManager();

  const unlocked = storage.unlockPremium();
  const first = storage.consumeRunOrBlock();
  const second = storage.consumeRunOrBlock();

  expect(unlocked).toMatchObject({ ok: true, already: false });
  expect(first).toMatchObject({ ok: true, reason: 'PREMIUM', balance: 2 });
  expect(second).toMatchObject({ ok: true, reason: 'PREMIUM', balance: 2 });
  expect(storage.getRunsBalance()).toBe(2);
  expect(storage.getRunsUsed()).toBe(2);
});
