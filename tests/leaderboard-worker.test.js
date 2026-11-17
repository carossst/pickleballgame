'use strict';

let workerModule;

beforeAll(async () => {
  workerModule = await import('../leaderboard-worker/src/index.js');
});

beforeEach(() => {
  if (workerModule?.resetRateLimitMemoryForTests) {
    workerModule.resetRateLimitMemoryForTests();
  }
});

function createFakeDb(resolver) {
  return {
    prepare(sql) {
      return {
        bind(...args) {
          return {
            first: () => Promise.resolve(resolver(sql, args, 'first')),
            all: () => Promise.resolve(resolver(sql, args, 'all')),
            run: () => Promise.resolve(resolver(sql, args, 'run'))
          };
        }
      };
    }
  };
}

async function readJson(response) {
  return response.json();
}

test('POST /score rejects mismatched content version with 409', async () => {
  const request = new Request('https://example.test/score', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      device_uuid: 'dev-1',
      run_id: 'run-1',
      run_number: 1,
      content_version: 'wrong-version',
      run_mode: 'RUN',
      duration_ms: 5000,
      answers: [{ id: 1, answer: false, ms: 10 }]
    })
  });

  const response = await workerModule.handlePostScore(request, {
    DB: createFakeDb(() => {
      throw new Error('DB should not be called on content version mismatch');
    })
  });

  expect(response.status).toBe(409);
  await expect(readJson(response)).resolves.toEqual({
    ok: false,
    accepted: false,
    reject_reason: 'CONTENT_VERSION_MISMATCH'
  });
});

test('POST /player rejects invalid nickname server-side', async () => {
  const request = new Request('https://example.test/player', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      device_uuid: 'dev-bad-nick',
      nickname: '🎾💯',
      opt_in: true
    })
  });

  const response = await workerModule.handlePostPlayer(request, {
    DB: createFakeDb(() => {
      throw new Error('DB should not be called for invalid nickname');
    })
  });

  expect(response.status).toBe(400);
  await expect(readJson(response)).resolves.toEqual({
    ok: false,
    error: 'Invalid nickname'
  });
});

test('POST /player rejects too-long nickname server-side', async () => {
  const request = new Request('https://example.test/player', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      device_uuid: 'dev-long-nick',
      nickname: 'A'.repeat(25),
      opt_in: true
    })
  });

  const response = await workerModule.handlePostPlayer(request, {
    DB: createFakeDb(() => {
      throw new Error('DB should not be called for too-long nickname');
    })
  });

  expect(response.status).toBe(400);
  await expect(readJson(response)).resolves.toEqual({
    ok: false,
    error: 'Nickname too long'
  });
});

test('POST /score rejects unknown answer ids fail-closed', async () => {
  const request = new Request('https://example.test/score', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      device_uuid: 'dev-2',
      run_id: 'run-2',
      run_number: 2,
      content_version: '2026-10-28-combo4',
      run_mode: 'RUN',
      duration_ms: 5000,
      answers: [{ id: 999999, answer: false, ms: 10 }]
    })
  });

  const env = {
    DB: createFakeDb((sql, _args, op) => {
      if (
        sql.includes('SELECT player_id, opt_in FROM players') &&
        op === 'first'
      ) {
        return { player_id: 7, opt_in: 1 };
      }
      if (
        sql.includes('FROM score_submissions') &&
        sql.includes('WHERE run_id') &&
        op === 'first'
      ) {
        return null;
      }
      throw new Error(`Unexpected query: ${op} ${sql}`);
    })
  };

  const response = await workerModule.handlePostScore(request, env);
  expect(response.status).toBe(422);
  await expect(readJson(response)).resolves.toEqual({
    ok: false,
    accepted: false,
    reject_reason: 'UNKNOWN_ITEM_ID'
  });
});

test('POST /score rejects duplicate answer ids fail-closed', async () => {
  const request = new Request('https://example.test/score', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      device_uuid: 'dev-dup-answers',
      run_id: 'run-dup-answers',
      run_number: 2,
      content_version: '2026-10-28-combo4',
      run_mode: 'RUN',
      duration_ms: 5000,
      answers: [
        { id: 1, answer: false, ms: 1000 },
        { id: 1, answer: false, ms: 1000 }
      ]
    })
  });

  const env = {
    DB: createFakeDb((sql, _args, op) => {
      if (
        sql.includes('SELECT player_id, opt_in FROM players') &&
        op === 'first'
      ) {
        return { player_id: 7, opt_in: 1 };
      }
      if (
        sql.includes('FROM score_submissions') &&
        sql.includes('WHERE run_id') &&
        op === 'first'
      ) {
        return null;
      }
      throw new Error(`Unexpected query: ${op} ${sql}`);
    })
  };

  const response = await workerModule.handlePostScore(request, env);
  expect(response.status).toBe(422);
  await expect(readJson(response)).resolves.toEqual({
    ok: false,
    accepted: false,
    reject_reason: 'DUPLICATE_ITEM_ID'
  });
});

function createSqliteDb(sqlite) {
  return {
    prepare(sql) {
      return {
        bind(...args) {
          const params = Object.fromEntries(
            args.map((arg, i) => [`?${i + 1}`, arg])
          );
          const stmt = sqlite.prepare(sql);
          return {
            first: () => stmt.get(params),
            execute: () =>
              /^\s*SELECT\b/i.test(sql)
                ? { results: stmt.all(params) }
                : { meta: stmt.run(params) }
          };
        }
      };
    },
    batch(statements) {
      sqlite.exec('BEGIN');
      try {
        const results = statements.map((statement) => statement.execute());
        sqlite.exec('COMMIT');
        return results;
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    }
  };
}

async function withScoreDatabase(run) {
  const { DatabaseSync } = await import('node:sqlite');
  const sqlite = new DatabaseSync(':memory:');
  try {
    sqlite.exec(
      require('node:fs').readFileSync(
        require('node:path').resolve(
          __dirname,
          '../leaderboard-worker/schema.sql'
        ),
        'utf8'
      )
    );
    sqlite.exec(`
      INSERT INTO players (player_id, device_uuid, nickname, created_at, updated_at)
      VALUES (11, 'dev-3', 'Player', 1, 1), (12, 'dev-4', 'Other', 1, 1)
    `);
    const env = { DB: createSqliteDb(sqlite) };
    const submit = (runId, answers, device = 'dev-3') =>
      workerModule.handlePostScore(
        new Request('https://example.test/score', {
          method: 'POST',
          body: JSON.stringify({
            device_uuid: device,
            run_id: runId,
            run_number: 3,
            content_version: '2026-10-28-combo4',
            run_mode: 'RUN',
            duration_ms: 6400,
            answers
          })
        }),
        env
      );
    await run(sqlite, submit);
  } finally {
    sqlite.close();
  }
}

const correctAnswer = { id: 1, answer: false, ms: 1000 };
const wrongAnswer = { id: 1, answer: true, ms: 1000 };

test('score batch rolls back a partial write and can be retried', async () => {
  await withScoreDatabase(async (sqlite, submit) => {
    sqlite.exec(`
      CREATE TRIGGER fail_all BEFORE INSERT ON leaderboard_best
      WHEN NEW.window_type = 'all'
      BEGIN SELECT RAISE(ABORT, 'simulated D1 write failure'); END;
    `);
    await expect(submit('run-retry', [correctAnswer])).rejects.toThrow(
      'simulated D1 write failure'
    );
    expect(
      sqlite.prepare('SELECT COUNT(*) AS n FROM score_submissions').get().n
    ).toBe(0);
    expect(
      sqlite.prepare('SELECT COUNT(*) AS n FROM leaderboard_best').get().n
    ).toBe(0);
    sqlite.exec('DROP TRIGGER fail_all');
    const response = await submit('run-retry', [correctAnswer]);
    await expect(response.json()).resolves.toMatchObject({
      accepted: true,
      score_fp_server: 1,
      weekly_rank: 1,
      all_time_rank: 1
    });
  });
});

test('score retries repair historical ranks and lower scores preserve the best', async () => {
  await withScoreDatabase(async (sqlite, submit) => {
    sqlite.exec(`
      INSERT INTO score_submissions (
        player_id, run_id, run_number, content_version, run_mode, duration_ms,
        week_key, score_fp, answers_json, created_at
      ) VALUES (11, 'run-historical', 3, '2026-10-28-combo4', 'RUN', 6400,
        '2026-W21', 17, '[]', 1234);
    `);
    const retry = await submit('run-historical', [wrongAnswer]);
    await expect(retry.json()).resolves.toMatchObject({
      accepted: true,
      duplicate: true,
      score_fp_server: 17,
      weekly_rank: 1,
      all_time_rank: 1
    });
    const conflict = await submit('run-historical', [correctAnswer], 'dev-4');
    expect(conflict.status).toBe(409);
    const results = await Promise.all([
      submit('run-lower', [wrongAnswer]),
      submit('run-higher', [correctAnswer]),
      submit('run-higher', [correctAnswer])
    ]);
    const responses = await Promise.all(
      results.map((response) => response.json())
    );
    expect(responses.every((response) => response.accepted)).toBe(true);
    expect(responses.filter((response) => response.duplicate)).toHaveLength(1);
    const rows = sqlite
      .prepare(
        'SELECT window_type, week_key, best_score_fp, updated_at FROM leaderboard_best'
      )
      .all();
    expect(rows).toHaveLength(3);
    expect(rows).toEqual(
      expect.arrayContaining([
        {
          window_type: 'weekly',
          week_key: '2026-W21',
          best_score_fp: 17,
          updated_at: 1234
        },
        {
          window_type: 'all',
          week_key: 'all',
          best_score_fp: 17,
          updated_at: 1234
        }
      ])
    );
    expect(
      rows.find(
        (row) => row.window_type === 'weekly' && row.week_key !== '2026-W21'
      ).best_score_fp
    ).toBe(1);
  });
});

test('getPlayerRank uses score, updated_at, and player_id tie-break inputs', async () => {
  let countBindArgs = null;
  const db = createFakeDb((sql, args, op) => {
    if (sql.includes('SELECT best_score_fp, updated_at') && op === 'first') {
      return { best_score_fp: 18, updated_at: 1234 };
    }
    if (sql.includes('COUNT(*) AS count_rows') && op === 'first') {
      countBindArgs = args;
      return { count_rows: 2 };
    }
    throw new Error(`Unexpected query: ${op} ${sql}`);
  });

  const rank = await workerModule.getPlayerRank(db, 9, 'weekly', '2026-W21');
  expect(rank).toBe(3);
  expect(countBindArgs).toEqual(['weekly', '2026-W21', 18, 1234, 9]);
});

test('DELETE /player removes rows when device exists', async () => {
  const deleted = [];
  const env = {
    DB: createFakeDb((sql, args, op) => {
      if (sql.includes('SELECT player_id FROM players') && op === 'first') {
        return { player_id: 42 };
      }
      if (sql.includes('DELETE FROM leaderboard_best') && op === 'run') {
        deleted.push(['leaderboard_best', args[0]]);
        return { success: true };
      }
      if (sql.includes('DELETE FROM score_submissions') && op === 'run') {
        deleted.push(['score_submissions', args[0]]);
        return { success: true };
      }
      if (sql.includes('DELETE FROM players') && op === 'run') {
        deleted.push(['players', args[0]]);
        return { success: true };
      }
      throw new Error(`Unexpected query: ${op} ${sql}`);
    })
  };

  const request = new Request(
    'https://example.test/player?device_uuid=dev-42',
    {
      method: 'DELETE'
    }
  );
  const response = await workerModule.handleDeletePlayer(request, env);

  expect(response.status).toBe(200);
  await expect(readJson(response)).resolves.toEqual({
    ok: true,
    deleted: true
  });
  expect(deleted).toEqual([
    ['leaderboard_best', 42],
    ['score_submissions', 42],
    ['players', 42]
  ]);
});

test('Worker rejects write requests from disallowed origins', async () => {
  const request = new Request('https://example.test/player', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://evil.example'
    },
    body: JSON.stringify({
      device_uuid: 'dev-evil',
      nickname: 'ValidNick',
      opt_in: true
    })
  });

  const response = await workerModule.default.fetch(request, {
    DB: createFakeDb(() => {
      throw new Error('DB should not be called for disallowed origin');
    }),
    ALLOWED_ORIGINS: 'https://pickleballrulesquiz.com'
  });

  expect(response.status).toBe(403);
  await expect(readJson(response)).resolves.toEqual({
    ok: false,
    error: 'Origin not allowed'
  });
});

test('Worker echoes allowed origin in CORS headers', async () => {
  const request = new Request(
    'https://example.test/leaderboard?window=weekly',
    {
      method: 'GET',
      headers: {
        origin: 'https://pickleballrulesquiz.com'
      }
    }
  );

  const response = await workerModule.default.fetch(request, {
    DB: createFakeDb((sql, _args, op) => {
      if (
        sql.includes('SELECT lb.player_id, lb.best_score_fp AS score_fp') &&
        op === 'all'
      ) {
        return { results: [] };
      }
      throw new Error(`Unexpected query: ${op} ${sql}`);
    }),
    ALLOWED_ORIGINS: 'https://pickleballrulesquiz.com'
  });

  expect(response.status).toBe(200);
  expect(response.headers.get('access-control-allow-origin')).toBe(
    'https://pickleballrulesquiz.com'
  );
});

test('Worker rate limits repeated player writes per device', async () => {
  const env = {
    DB: createFakeDb((sql, args, op) => {
      if (sql.includes('INSERT INTO players') && op === 'run') {
        return { success: true };
      }
      if (
        sql.includes('SELECT player_id, nickname, opt_in') &&
        op === 'first'
      ) {
        return {
          player_id: 1,
          nickname: String(args[0] || 'ValidNick'),
          opt_in: true
        };
      }
      throw new Error(`Unexpected query: ${op} ${sql}`);
    }),
    ALLOWED_ORIGINS: 'https://pickleballrulesquiz.com'
  };

  let lastResponse = null;
  for (let i = 0; i < 6; i += 1) {
    const request = new Request('https://example.test/player', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'https://pickleballrulesquiz.com',
        'cf-connecting-ip': '203.0.113.10'
      },
      body: JSON.stringify({
        device_uuid: 'dev-rate-limit',
        nickname: 'ValidNick',
        opt_in: true
      })
    });
    lastResponse = await workerModule.default.fetch(request, env);
  }

  expect(lastResponse.status).toBe(429);
  await expect(readJson(lastResponse)).resolves.toEqual({
    ok: false,
    error: 'Too many requests'
  });
});

test('POST /score rejects implausibly fast runs', async () => {
  const request = new Request('https://example.test/score', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      device_uuid: 'dev-fast-run',
      run_id: 'run-fast-run',
      run_number: 3,
      content_version: '2026-10-28-combo4',
      run_mode: 'RUN',
      duration_ms: 200,
      answers: [{ id: 1, answer: false, ms: 10 }]
    })
  });

  const env = {
    DB: createFakeDb((sql, _args, op) => {
      if (
        sql.includes('SELECT player_id, opt_in FROM players') &&
        op === 'first'
      ) {
        return { player_id: 9, opt_in: 1 };
      }
      if (
        sql.includes('FROM score_submissions') &&
        sql.includes('WHERE run_id') &&
        op === 'first'
      ) {
        return null;
      }
      throw new Error(`Unexpected query: ${op} ${sql}`);
    })
  };

  const response = await workerModule.handlePostScore(request, env);
  expect(response.status).toBe(422);
  await expect(readJson(response)).resolves.toEqual({
    ok: false,
    accepted: false,
    reject_reason: 'IMPROBABLE_DURATION_MS'
  });
});

test('getUtcWeekKey uses ISO weeks starting on Monday UTC', () => {
  expect(workerModule.getUtcWeekKey(Date.UTC(2026, 4, 24, 23, 59, 59))).toBe(
    '2026-W21'
  );
  expect(workerModule.getUtcWeekKey(Date.UTC(2026, 4, 25, 0, 0, 0))).toBe(
    '2026-W22'
  );
});

test('getUtcWeekKey handles ISO week-year boundaries', () => {
  expect(workerModule.getUtcWeekKey(Date.UTC(2026, 0, 1, 12, 0, 0))).toBe(
    '2026-W01'
  );
  expect(workerModule.getUtcWeekKey(Date.UTC(2027, 0, 1, 12, 0, 0))).toBe(
    '2026-W53'
  );
  expect(workerModule.getUtcWeekKey(Date.UTC(2027, 0, 4, 0, 0, 0))).toBe(
    '2027-W01'
  );
});

function redeemRequest(body) {
  return new Request('https://example.test/redeem-code', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://pickleballrulesquiz.com'
    },
    body: JSON.stringify(body)
  });
}

test('POST /redeem-code accepts ADMIN_CODE from any device with no use cap', async () => {
  const inserted = [];
  const env = {
    ADMIN_CODE: 'super-secret-admin',
    GUEST_CODE: 'guest-2026',
    DB: createFakeDb((sql, args, op) => {
      if (
        sql.includes('INSERT OR IGNORE INTO code_redemptions') &&
        op === 'run'
      ) {
        inserted.push(args);
        return { success: true, meta: { changes: 1 } };
      }
      throw new Error(`Unexpected query: ${op} ${sql}`);
    })
  };

  const first = await workerModule.handlePostRedeemCode(
    redeemRequest({ code: 'super-secret-admin', device_uuid: 'device-a' }),
    env
  );
  const second = await workerModule.handlePostRedeemCode(
    redeemRequest({ code: 'super-secret-admin', device_uuid: 'device-b' }),
    env
  );

  expect(first.status).toBe(200);
  expect(second.status).toBe(200);
  await expect(readJson(first)).resolves.toEqual({ ok: true, tier: 'admin' });
  await expect(readJson(second)).resolves.toEqual({ ok: true, tier: 'admin' });
  expect(inserted).toEqual([
    ['admin', 'super-secret-admin', 'device-a', expect.any(Number)],
    ['admin', 'super-secret-admin', 'device-b', expect.any(Number)]
  ]);
});

test('POST /redeem-code accepts GUEST_CODE and reports remaining uses', async () => {
  const env = {
    ADMIN_CODE: 'super-secret-admin',
    GUEST_CODE: 'guest-2026',
    DB: createFakeDb((sql, args, op) => {
      if (
        sql.includes('INSERT OR IGNORE INTO code_redemptions') &&
        op === 'run'
      ) {
        return { success: true, meta: { changes: 1 } };
      }
      if (
        sql.includes('SELECT COUNT(DISTINCT device_uuid) AS use_count') &&
        op === 'first'
      ) {
        // Includes the row the INSERT above just wrote.
        return { use_count: 4 };
      }
      throw new Error(`Unexpected query: ${op} ${sql}`);
    })
  };

  const response = await workerModule.handlePostRedeemCode(
    redeemRequest({ code: 'guest-2026', device_uuid: 'device-c' }),
    env
  );

  expect(response.status).toBe(200);
  await expect(readJson(response)).resolves.toEqual({
    ok: true,
    tier: 'guest',
    uses_remaining: 6
  });
});

test("POST /redeem-code atomically guards the guest-code cap on DISTINCT devices so it can't be raced past 10 uses", async () => {
  let insertArgs = null;
  const env = {
    GUEST_CODE: 'guest-2026',
    DB: createFakeDb((sql, args, op) => {
      if (
        sql.includes('INSERT OR IGNORE INTO code_redemptions') &&
        op === 'run'
      ) {
        insertArgs = args;
        // The cap check must live inside this single statement (a
        // SELECT-then-INSERT across two round trips would let concurrent
        // requests both read "under the cap" before either inserts), and it
        // must count DISTINCT devices, not raw redemption rows.
        expect(sql).toMatch(/WHERE\s*\(SELECT COUNT\(DISTINCT device_uuid\)/);
        return { success: true, meta: { changes: 1 } };
      }
      if (
        sql.includes('SELECT COUNT(DISTINCT device_uuid) AS use_count') &&
        op === 'first'
      ) {
        return { use_count: 1 };
      }
      throw new Error(`Unexpected query: ${op} ${sql}`);
    })
  };

  await workerModule.handlePostRedeemCode(
    redeemRequest({ code: 'guest-2026', device_uuid: 'device-x' }),
    env
  );

  expect(insertArgs).toEqual([
    'guest',
    'guest-2026',
    'device-x',
    expect.any(Number),
    10
  ]);
});

test('POST /redeem-code rejects GUEST_CODE once the 10-device cap is reached', async () => {
  const env = {
    ADMIN_CODE: 'super-secret-admin',
    GUEST_CODE: 'guest-2026',
    DB: createFakeDb((sql, args, op) => {
      if (
        sql.includes('INSERT OR IGNORE INTO code_redemptions') &&
        op === 'run'
      ) {
        // The WHERE guard inside the statement matched zero rows: the cap
        // was already reached, so nothing was inserted.
        return { success: true, meta: { changes: 0 } };
      }
      if (sql.includes('SELECT 1 AS found') && op === 'first') {
        // This device has never redeemed the code, so the zero-changes
        // outcome above really does mean "exhausted", not "already mine".
        return null;
      }
      throw new Error(`Unexpected query once the cap is reached: ${op} ${sql}`);
    })
  };

  const response = await workerModule.handlePostRedeemCode(
    redeemRequest({ code: 'guest-2026', device_uuid: 'device-d' }),
    env
  );

  expect(response.status).toBe(403);
  await expect(readJson(response)).resolves.toEqual({
    ok: false,
    reason: 'GUEST_CODE_EXHAUSTED'
  });
});

test('POST /redeem-code lets the same device re-redeem GUEST_CODE idempotently even once the cap is full', async () => {
  const env = {
    GUEST_CODE: 'guest-2026',
    DB: createFakeDb((sql, args, op) => {
      if (
        sql.includes('INSERT OR IGNORE INTO code_redemptions') &&
        op === 'run'
      ) {
        // Same-device retry: unique-index conflict, silently ignored.
        return { success: true, meta: { changes: 0 } };
      }
      if (sql.includes('SELECT 1 AS found') && op === 'first') {
        // This device already has a row for this code.
        return { found: 1 };
      }
      if (
        sql.includes('SELECT COUNT(DISTINCT device_uuid) AS use_count') &&
        op === 'first'
      ) {
        return { use_count: 10 };
      }
      throw new Error(`Unexpected query: ${op} ${sql}`);
    })
  };

  const response = await workerModule.handlePostRedeemCode(
    redeemRequest({ code: 'guest-2026', device_uuid: 'device-already-in' }),
    env
  );

  expect(response.status).toBe(200);
  await expect(readJson(response)).resolves.toEqual({
    ok: true,
    tier: 'guest',
    uses_remaining: 0
  });
});

test('POST /redeem-code returns NOT_FOUND for a code that matches neither secret', async () => {
  const env = {
    ADMIN_CODE: 'super-secret-admin',
    GUEST_CODE: 'guest-2026',
    DB: createFakeDb(() => {
      throw new Error('DB should not be queried for an unrecognized code');
    })
  };

  const response = await workerModule.handlePostRedeemCode(
    redeemRequest({ code: 'PRQ-1234-5678', device_uuid: 'device-e' }),
    env
  );

  expect(response.status).toBe(404);
  await expect(readJson(response)).resolves.toEqual({
    ok: false,
    reason: 'NOT_FOUND'
  });
});

test('POST /redeem-code returns NOT_FOUND for any code when the secrets are unset', async () => {
  const env = {
    DB: createFakeDb(() => {
      throw new Error('DB should not be queried when no secret is configured');
    })
  };

  const response = await workerModule.handlePostRedeemCode(
    redeemRequest({ code: 'anything', device_uuid: 'device-f' }),
    env
  );

  expect(response.status).toBe(404);
  await expect(readJson(response)).resolves.toEqual({
    ok: false,
    reason: 'NOT_FOUND'
  });
});

test('POST /redeem-code rejects a missing device_uuid', async () => {
  const env = {
    ADMIN_CODE: 'super-secret-admin',
    DB: createFakeDb(() => {
      throw new Error('DB should not be queried for an invalid request');
    })
  };

  const response = await workerModule.handlePostRedeemCode(
    redeemRequest({ code: 'super-secret-admin' }),
    env
  );

  expect(response.status).toBe(400);
});

test('Worker rate limits repeated redeem-code attempts per device', async () => {
  const env = {
    ADMIN_CODE: 'super-secret-admin',
    DB: createFakeDb((sql, args, op) => {
      if (
        sql.includes('INSERT OR IGNORE INTO code_redemptions') &&
        op === 'run'
      ) {
        return { success: true, meta: { changes: 1 } };
      }
      throw new Error(`Unexpected query: ${op} ${sql}`);
    }),
    ALLOWED_ORIGINS: 'https://pickleballrulesquiz.com'
  };

  let lastResponse = null;
  for (let i = 0; i < 6; i += 1) {
    const request = new Request('https://example.test/redeem-code', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'https://pickleballrulesquiz.com',
        'cf-connecting-ip': '203.0.113.20'
      },
      body: JSON.stringify({
        code: 'super-secret-admin',
        device_uuid: 'dev-redeem-rate-limit'
      })
    });
    lastResponse = await workerModule.default.fetch(request, env);
  }

  expect(lastResponse.status).toBe(429);
  await expect(readJson(lastResponse)).resolves.toEqual({
    ok: false,
    error: 'Too many requests'
  });
});
