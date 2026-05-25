import {
  ANSWER_KEY_ENTRIES,
  LEADERBOARD_CONTENT_VERSION
} from "./content-key.js";
import {
  buildAnswerKey,
  computeServerScore,
  validateSubmittedAnswers
} from "./score-utils.js";

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
    "access-control-allow-headers": "content-type"
  };
}

function json(data, init) {
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...corsHeaders()
    },
    ...init
  });
}

function badRequest(message) {
  return json({ ok: false, error: message }, { status: 400 });
}

function methodNotAllowed() {
  return json({ ok: false, error: "Method not allowed" }, { status: 405 });
}

function noContent() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}

function now() {
  return Date.now();
}

function clampNonNegativeInt(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function normalizeWindow(raw) {
  const value = String(raw || "").trim().toLowerCase();
  if (value === "weekly") return "weekly";
  if (value === "all") return "all";
  return "";
}

const ANSWER_KEY = buildAnswerKey(ANSWER_KEY_ENTRIES);

export function getUtcWeekKey(ts) {
  const date = new Date(ts);
  if (!Number.isFinite(date.getTime())) return "";

  const isoDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  const isoDay = isoDate.getUTCDay() || 7;

  isoDate.setUTCDate(isoDate.getUTCDate() + 4 - isoDay);

  const isoYear = isoDate.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const week = Math.ceil((((isoDate - yearStart) / 86400000) + 1) / 7);

  return `${isoYear}-W${String(week).padStart(2, "0")}`;
}

export async function handleGetLeaderboard(request, env) {
  const url = new URL(request.url);
  const windowType = normalizeWindow(url.searchParams.get("window"));
  if (!windowType) return badRequest("Missing or invalid window");

  const weekKey = windowType === "weekly" ? getUtcWeekKey(now()) : "all";
  const limit = 10;

  const rows = await env.DB.prepare(
    `
      SELECT lb.best_score_fp AS score_fp, p.nickname
      FROM leaderboard_best lb
      JOIN players p ON p.player_id = lb.player_id
      WHERE lb.window_type = ?1 AND lb.week_key = ?2
      ORDER BY lb.best_score_fp DESC, lb.updated_at ASC
      LIMIT ?3
    `
  )
    .bind(windowType, weekKey, limit)
    .all();

  const top = Array.isArray(rows?.results)
    ? rows.results.map((row, idx) => ({
      rank: idx + 1,
      nickname: String(row.nickname || ""),
      score_fp: clampNonNegativeInt(row.score_fp)
    }))
    : [];

  return json({
    ok: true,
    window: windowType,
    week_key: weekKey,
    top
  });
}

export async function handlePostPlayer(request, env) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return badRequest("Invalid JSON");

  const deviceUuid = String(body.device_uuid || "").trim();
  const nickname = String(body.nickname || "").trim();
  const optIn = body.opt_in === true ? 1 : 0;

  if (!deviceUuid) return badRequest("Missing device_uuid");
  if (optIn === 1 && !nickname) return badRequest("Missing nickname");

  const ts = now();

  await env.DB.prepare(
    `
      INSERT INTO players (device_uuid, nickname, opt_in, created_at, updated_at)
      VALUES (?1, ?2, ?3, ?4, ?4)
      ON CONFLICT(device_uuid) DO UPDATE SET
        nickname = CASE
          WHEN excluded.opt_in = 1 THEN excluded.nickname
          ELSE ""
        END,
        opt_in = excluded.opt_in,
        updated_at = excluded.updated_at
    `
  )
    .bind(deviceUuid, nickname, optIn, ts)
    .run();

  const row = await env.DB.prepare(
    `
      SELECT player_id, nickname, opt_in
      FROM players
      WHERE device_uuid = ?1
      LIMIT 1
    `
  )
    .bind(deviceUuid)
    .first();

  return json({
    ok: true,
    player_id: clampNonNegativeInt(row?.player_id),
    nickname: String(row?.nickname || ""),
    opt_in: row?.opt_in === 1
  });
}

export async function handleDeletePlayer(request, env) {
  const url = new URL(request.url);
  const deviceUuid = String(url.searchParams.get("device_uuid") || "").trim();
  if (!deviceUuid) return badRequest("Missing device_uuid");

  const player = await env.DB.prepare(
    `SELECT player_id FROM players WHERE device_uuid = ?1 LIMIT 1`
  )
    .bind(deviceUuid)
    .first();

  const playerId = clampNonNegativeInt(player?.player_id);
  if (playerId <= 0) {
    return json({ ok: true, deleted: false });
  }

  await env.DB.prepare(`DELETE FROM leaderboard_best WHERE player_id = ?1`).bind(playerId).run();
  await env.DB.prepare(`DELETE FROM score_submissions WHERE player_id = ?1`).bind(playerId).run();
  await env.DB.prepare(`DELETE FROM players WHERE player_id = ?1`).bind(playerId).run();

  return json({ ok: true, deleted: true });
}

export async function handlePostScore(request, env) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return badRequest("Invalid JSON");

  const deviceUuid = String(body.device_uuid || "").trim();
  const runId = String(body.run_id || "").trim();
  const runMode = String(body.run_mode || "").trim().toUpperCase();
  const runNumber = clampNonNegativeInt(body.run_number);
  const contentVersion = String(body.content_version || "").trim();
  const durationMs = clampNonNegativeInt(body.duration_ms);
  const rawAnswers = Array.isArray(body.answers) ? body.answers : null;

  if (!deviceUuid) return badRequest("Missing device_uuid");
  if (!runId) return badRequest("Missing run_id");
  if (runMode !== "RUN") return badRequest("Only RUN is accepted");
  if (runNumber <= 0) return badRequest("Missing or invalid run_number");
  if (!contentVersion) return badRequest("Missing content_version");
  if (!rawAnswers) return badRequest("Missing answers");
  if (contentVersion !== LEADERBOARD_CONTENT_VERSION) {
    return json(
      {
        ok: false,
        accepted: false,
        reject_reason: "CONTENT_VERSION_MISMATCH"
      },
      { status: 409 }
    );
  }

  if (durationMs <= 0 || durationMs > 24 * 60 * 60 * 1000) {
    return json(
      {
        ok: false,
        accepted: false,
        reject_reason: "INVALID_DURATION_MS"
      },
      { status: 422 }
    );
  }

  const player = await env.DB.prepare(
    `SELECT player_id, opt_in FROM players WHERE device_uuid = ?1 LIMIT 1`
  )
    .bind(deviceUuid)
    .first();

  if (!player || clampNonNegativeInt(player.player_id) <= 0) {
    return badRequest("Unknown player");
  }

  if (player.opt_in !== 1) {
    return badRequest("Player is not opted in");
  }

  const playerId = clampNonNegativeInt(player.player_id);
  const weekKey = getUtcWeekKey(now());

  const existingSubmission = await env.DB.prepare(
    `
      SELECT submission_id, score_fp, accepted, reject_reason
      FROM score_submissions
      WHERE run_id = ?1
      LIMIT ?2
    `
  )
    .bind(runId, 1)
    .first();

  if (existingSubmission) {
    const accepted = clampNonNegativeInt(existingSubmission.accepted) === 1;
    if (!accepted) {
      return json(
        {
          ok: false,
          accepted: false,
          reject_reason: String(existingSubmission.reject_reason || "REJECTED")
        },
        { status: 409 }
      );
    }

    const weeklyRank = await getPlayerRank(env.DB, playerId, "weekly", weekKey);
    const allTimeRank = await getPlayerRank(env.DB, playerId, "all", "all");
    return json({
      ok: true,
      accepted: true,
      score_fp_server: clampNonNegativeInt(existingSubmission.score_fp),
      weekly_rank: weeklyRank,
      all_time_rank: allTimeRank,
      duplicate: true
    });
  }

  const validated = validateSubmittedAnswers(rawAnswers, ANSWER_KEY);
  if (validated.ok !== true) {
    return json(
      {
        ok: false,
        accepted: false,
        reject_reason: String(validated.rejectReason || "INVALID_ANSWERS")
      },
      { status: 422 }
    );
  }

  const answers = validated.answers;
  const scoreFpServer = clampNonNegativeInt(computeServerScore(answers, ANSWER_KEY));
  const ts = now();

  const insertResult = await env.DB.prepare(
    `
      INSERT INTO score_submissions (
        player_id,
        run_id,
        run_number,
        content_version,
        run_mode,
        duration_ms,
        week_key,
        score_fp,
        answers_json,
        accepted,
        reject_reason,
        created_at
      )
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, 1, "", ?10)
    `
  )
    .bind(
      playerId,
      runId,
      runNumber,
      contentVersion,
      runMode,
      durationMs,
      weekKey,
      scoreFpServer,
      JSON.stringify(answers),
      ts
    )
    .run();

  const submissionId = clampNonNegativeInt(insertResult?.meta?.last_row_id);
  if (submissionId <= 0) {
    return json(
      {
        ok: false,
        accepted: false,
        reject_reason: "SUBMISSION_INSERT_FAILED"
      },
      { status: 500 }
    );
  }

  await upsertBestScore(env.DB, {
    playerId,
    submissionId,
    scoreFp: scoreFpServer,
    updatedAt: ts,
    windowType: "weekly",
    weekKey
  });

  await upsertBestScore(env.DB, {
    playerId,
    submissionId,
    scoreFp: scoreFpServer,
    updatedAt: ts,
    windowType: "all",
    weekKey: "all"
  });

  const weeklyRank = await getPlayerRank(env.DB, playerId, "weekly", weekKey);
  const allTimeRank = await getPlayerRank(env.DB, playerId, "all", "all");

  return json({
    ok: true,
    accepted: true,
    score_fp_server: scoreFpServer,
    weekly_rank: weeklyRank,
    all_time_rank: allTimeRank
  });
}

export async function upsertBestScore(db, params) {
  const playerId = clampNonNegativeInt(params?.playerId);
  const submissionId = clampNonNegativeInt(params?.submissionId);
  const scoreFp = clampNonNegativeInt(params?.scoreFp);
  const updatedAt = clampNonNegativeInt(params?.updatedAt);
  const windowType = normalizeWindow(params?.windowType === "all" ? "all" : params?.windowType);
  const weekKey = String(params?.weekKey || "").trim();

  if (playerId <= 0 || submissionId <= 0 || !windowType || !weekKey) return;

  const existing = await db.prepare(
    `
      SELECT best_score_fp
      FROM leaderboard_best
      WHERE player_id = ?1 AND window_type = ?2 AND week_key = ?3
      LIMIT 1
    `
  )
    .bind(playerId, windowType, weekKey)
    .first();

  const existingBest = clampNonNegativeInt(existing?.best_score_fp);
  if (!existing) {
    await db.prepare(
      `
        INSERT INTO leaderboard_best (
          player_id,
          window_type,
          week_key,
          best_score_fp,
          best_submission_id,
          updated_at
        )
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
      `
    )
      .bind(playerId, windowType, weekKey, scoreFp, submissionId, updatedAt)
      .run();
    return;
  }

  if (scoreFp <= existingBest) return;

  await db.prepare(
    `
      UPDATE leaderboard_best
      SET best_score_fp = ?4,
          best_submission_id = ?5,
          updated_at = ?6
      WHERE player_id = ?1 AND window_type = ?2 AND week_key = ?3
    `
  )
    .bind(playerId, windowType, weekKey, scoreFp, submissionId, updatedAt)
    .run();
}

export async function getPlayerRank(db, playerId, windowType, weekKey) {
  const safePlayerId = clampNonNegativeInt(playerId);
  const safeWindow = normalizeWindow(windowType);
  const safeWeekKey = String(weekKey || "").trim();
  if (safePlayerId <= 0 || !safeWindow || !safeWeekKey) return null;

  const playerRow = await db.prepare(
    `
      SELECT best_score_fp, updated_at
      FROM leaderboard_best
      WHERE player_id = ?1 AND window_type = ?2 AND week_key = ?3
      LIMIT 1
    `
  )
    .bind(safePlayerId, safeWindow, safeWeekKey)
    .first();

  if (!playerRow) return null;

  const betterRows = await db.prepare(
    `
      SELECT COUNT(*) AS count_rows
      FROM leaderboard_best
      WHERE window_type = ?1
        AND week_key = ?2
        AND (
          best_score_fp > ?3
          OR (
            best_score_fp = ?3
            AND (
              updated_at < ?4
              OR (updated_at = ?4 AND player_id < ?5)
            )
          )
        )
    `
  )
    .bind(
      safeWindow,
      safeWeekKey,
      clampNonNegativeInt(playerRow.best_score_fp),
      clampNonNegativeInt(playerRow.updated_at),
      safePlayerId
    )
    .first();

  return clampNonNegativeInt(betterRows?.count_rows) + 1;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return noContent();
    }

    if (request.method === "GET" && url.pathname === "/leaderboard") {
      return handleGetLeaderboard(request, env);
    }

    if (request.method === "POST" && url.pathname === "/player") {
      return handlePostPlayer(request, env);
    }

    if (request.method === "POST" && url.pathname === "/score") {
      return handlePostScore(request, env);
    }

    if (request.method === "DELETE" && url.pathname === "/player") {
      return handleDeletePlayer(request, env);
    }

    if (request.method !== "GET" && request.method !== "POST" && request.method !== "DELETE") {
      return methodNotAllowed();
    }

    return json({
      ok: true,
      service: "prq-leaderboard-worker",
      routes: ["GET /leaderboard", "POST /player", "DELETE /player", "POST /score"]
    });
  }
};
