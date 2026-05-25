(function (root, factory) {
  'use strict';

  const api = factory();
  if (typeof module === 'object' && module && module.exports) {
    module.exports = api;
  }
  root.WT_RapidFireLogic = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function clampNonNegativeInt(n) {
    const x = Number(n);
    if (!Number.isFinite(x)) return 0;
    return Math.max(0, Math.floor(x));
  }

  function computeStarterTicketGrant(currentBalance, starterTickets, cap) {
    const current = clampNonNegativeInt(currentBalance);
    const starter = clampNonNegativeInt(starterTickets);
    const ticketCap = clampNonNegativeInt(cap);
    const nextBalance =
      ticketCap > 0
        ? Math.min(ticketCap, current + starter)
        : current + starter;

    return {
      nextBalance,
      granted: nextBalance > current,
      cap: ticketCap
    };
  }

  function computeDailyTicketGrant(currentBalance, cap, alreadyEarned) {
    const current = clampNonNegativeInt(currentBalance);
    const ticketCap = clampNonNegativeInt(cap);

    if (alreadyEarned === true) {
      return {
        nextBalance: current,
        granted: false,
        atCap: ticketCap > 0 && current >= ticketCap,
        cap: ticketCap
      };
    }

    const nextBalance =
      ticketCap > 0 ? Math.min(ticketCap, current + 1) : current + 1;

    return {
      nextBalance,
      granted: nextBalance > current,
      atCap: ticketCap > 0 && current >= ticketCap,
      cap: ticketCap
    };
  }

  function computeDailyChallengeTarget(
    existingDayKey,
    existingScore,
    nextDayKey,
    fallbackScore
  ) {
    const currentDayKey = String(existingDayKey || '').trim();
    const dayKey = String(nextDayKey || '').trim();
    const frozenScore = clampNonNegativeInt(existingScore);
    const nextScore = Math.max(1, clampNonNegativeInt(fallbackScore));

    if (!dayKey) return nextScore;
    if (currentDayKey === dayKey && frozenScore > 0) return frozenScore;
    return nextScore;
  }

  return {
    clampNonNegativeInt,
    computeStarterTicketGrant,
    computeDailyTicketGrant,
    computeDailyChallengeTarget
  };
});
