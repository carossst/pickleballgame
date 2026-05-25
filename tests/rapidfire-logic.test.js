'use strict';

const {
  computeStarterTicketGrant,
  computeDailyTicketGrant,
  computeDailyChallengeTarget
} = require('../logic/rapidfire-logic.js');

test('computeStarterTicketGrant applies the starter ticket within cap', () => {
  const grant = computeStarterTicketGrant(0, 1, 3);
  expect(grant).toEqual({
    nextBalance: 1,
    granted: true,
    cap: 3
  });
});

test('computeDailyTicketGrant reports capped daily clears without adding balance', () => {
  const grant = computeDailyTicketGrant(3, 3, false);
  expect(grant).toEqual({
    nextBalance: 3,
    granted: false,
    atCap: true,
    cap: 3
  });
});

test('computeDailyChallengeTarget freezes the score for the same local day key', () => {
  expect(computeDailyChallengeTarget('', 0, '2026-05-23', 8)).toBe(8);
  expect(computeDailyChallengeTarget('2026-05-23', 8, '2026-05-23', 13)).toBe(
    8
  );
  expect(computeDailyChallengeTarget('2026-05-23', 8, '2026-05-24', 11)).toBe(
    11
  );
});
