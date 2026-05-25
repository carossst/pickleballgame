'use strict';

let scoreUtils;
let contentKey;

beforeAll(async () => {
  scoreUtils = await import('../leaderboard-worker/src/score-utils.js');
  contentKey = await import('../leaderboard-worker/src/content-key.js');
});

test('worker answer key builds with known ids', () => {
  const key = scoreUtils.buildAnswerKey(contentKey.ANSWER_KEY_ENTRIES);
  expect(key.get(1)).toBe(false);
  expect(key.get(3)).toBe(true);
  expect(key.get(200)).toBe(true);
});

test('worker answer validation rejects unknown ids fail-closed', () => {
  const key = scoreUtils.buildAnswerKey(contentKey.ANSWER_KEY_ENTRIES);
  const res = scoreUtils.validateSubmittedAnswers(
    [{ id: 999999, answer: true, ms: 1200 }],
    key
  );
  expect(res).toEqual({
    ok: false,
    rejectReason: 'UNKNOWN_ITEM_ID'
  });
});

test('worker answer validation normalizes valid rows', () => {
  const key = scoreUtils.buildAnswerKey(contentKey.ANSWER_KEY_ENTRIES);
  const res = scoreUtils.validateSubmittedAnswers(
    [
      { id: 1, answer: false, ms: 1200.9 },
      { id: 3, answer: true, ms: 0 }
    ],
    key
  );
  expect(res).toEqual({
    ok: true,
    answers: [
      { id: 1, answer: false, ms: 1200 },
      { id: 3, answer: true, ms: 0 }
    ]
  });
});

test('worker score is recomputed from answer truth, not client score', () => {
  const key = scoreUtils.buildAnswerKey(contentKey.ANSWER_KEY_ENTRIES);
  const score = scoreUtils.computeServerScore(
    [
      { id: 1, answer: false, ms: 10 },
      { id: 2, answer: true, ms: 10 },
      { id: 3, answer: true, ms: 10 },
      { id: 4, answer: false, ms: 10 }
    ],
    key
  );
  expect(score).toBe(3);
});
