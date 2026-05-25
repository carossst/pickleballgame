// ui-screen-end.js
// Extracted from ui.js to keep END rendering isolated from the core UI shell.

(() => {
  "use strict";

  function render(ui, helpers) {
    const {
      buildEndModeCopy,
      buildEndCopyHtml,
      buildEndMistakesRecap,
      buildEndMicroLines,
      buildEndShareBlock,
      buildEndActionsHtml,
      getRunTierInfo,
      getDailyChallengeModel,
      getAppLevelModel,
      renderBrandingRow,
      renderIcon,
      hasSolvedSecretChestHint,
      isPremiumNow,
      clampInt,
      fillTemplate,
      escapeHtml,
      MODES
    } = helpers || {};

    if (
      typeof buildEndModeCopy !== "function" ||
      typeof buildEndCopyHtml !== "function" ||
      typeof buildEndMistakesRecap !== "function" ||
      typeof buildEndMicroLines !== "function" ||
      typeof buildEndShareBlock !== "function" ||
      typeof buildEndActionsHtml !== "function" ||
      typeof getRunTierInfo !== "function" ||
      typeof getDailyChallengeModel !== "function" ||
      typeof getAppLevelModel !== "function" ||
      typeof renderBrandingRow !== "function" ||
      typeof renderIcon !== "function" ||
      typeof hasSolvedSecretChestHint !== "function" ||
      typeof isPremiumNow !== "function" ||
      typeof clampInt !== "function" ||
      typeof fillTemplate !== "function" ||
      typeof escapeHtml !== "function" ||
      !MODES
    ) {
      throw new Error("WT_UI_End helpers missing");
    }

    const w = ui.wording || {};
    const uiW = w.ui || {};
    const end = w.end || {};
    const practiceW = w.practice || {};
    const bonusW = w.secretBonus || {};
    const cfg = ui.config || {};
    const premium = isPremiumNow(ui.storage);

    const lastRun = ui._runtime?.lastRun || {};
    const mode = String(lastRun.mode || ui._runtime?.runMode || "").trim();
    const hasKnownMode = !!mode;
    const isRun = (mode === MODES.RUN);
    const isPractice = (mode === MODES.PRACTICE);
    const isBonus = (mode === MODES.BONUS);
    const newBest = (isRun || isBonus) && !!lastRun.newBest;

    const scoreFP = clampInt(lastRun.scoreFP, 0, 99999);
    const maxChances = clampInt(lastRun.maxChances || cfg?.game?.maxChances, 0, 99);
    const totalPresented = Array.isArray(ui._runtime?.runItemIds) ? ui._runtime.runItemIds.length : 0;
    const poolSize = clampInt(cfg?.game?.poolSize, 0, 99999);

    let seen = null;
    if (ui.storage && typeof ui.storage.getSeenItemIds === "function") {
      try {
        const ids = ui.storage.getSeenItemIds();
        if (Array.isArray(ids)) seen = clampInt(ids.length, 0, 99999);
      } catch (_) { /* silent */ }
    }

    const vars = {
      score: scoreFP,
      total: clampInt(totalPresented, 0, 99999),
      best: clampInt(lastRun.bestScoreFP, 0, 99999),
      fpLong: "",
      fpShort: "",
      maxChances,
      poolSize,
      seen: (seen == null) ? "" : seen
    };

    const scoreLineTpl =
      isBonus ? String(bonusW.scoreLine || "").trim()
        : isPractice ? (String(end.scoreLine || "").trim() || String(practiceW.scoreLine || "").trim())
          : (isRun && !!lastRun.poolCompleteCelebration) ? String(end.poolCompleteScoreLine || "").trim()
            : String(end.scoreLine || "").trim();

    const newBestTpl = isBonus
      ? String(bonusW.newBest || "").trim()
      : String(end.newBest || "").trim();

    const bonusStatsLine = (() => {
      if (!isBonus) return "";

      const shown = clampInt(totalPresented, 0, 99999);
      if (shown <= 0) return "";

      const cleared = clampInt(scoreFP, 0, shown);
      const count = clampInt(seen, 0, 99999);
      const oneTpl = String(bonusW.endStatsLineOne || "").trim();
      const manyTpl = String(bonusW.endStatsLine || "").trim();
      const tpl = (count === 1 && oneTpl) ? oneTpl : manyTpl;
      if (!tpl) return "";

      return fillTemplate(tpl, {
        cleared: String(cleared),
        shown: String(shown),
        count: String(count)
      });
    })();

    const modeCopy = buildEndModeCopy({
      isRun,
      isPractice,
      isBonus,
      cfg,
      bonusW,
      practiceW,
      end,
      scoreFP,
      totalPresented,
      seen,
      lastRun,
      vars,
      storage: ui.storage,
      runtime: ui._runtime
    });

    const {
      endLineTpl,
      bonusLevel,
      practiceRepeatTierKey,
      practiceStatsLineTpl,
      practiceRepeatNoteTpl,
      runVerdictKey,
      runIdentityTpl,
      runPoolCompleteLine2Tpl,
      bonusDeckTier,
      bonusRecoLine
    } = modeCopy;

    let backlog = 0;
    try {
      if (ui.storage && typeof ui.storage.getActiveMistakesCount === "function") {
        backlog = Number(ui.storage.getActiveMistakesCount() || 0);
      }
    } catch (_) { backlog = 0; }

    vars.backlog = clampInt(backlog, 0, 99999);

    let canPractice = isRun && !!(cfg.mistakesOnly && cfg.mistakesOnly.enabled);
    if (canPractice) {
      const minWrong = clampInt(Number(cfg?.mistakesOnly?.minWrongItemsToShowToggle), 1, 9999);
      const hasEnoughMistakes = clampInt(vars.backlog, 0, 99999) >= minWrong;

      let practiceRunsAvailable = true;
      if (!premium && ui.storage && typeof ui.storage.getPracticeRunsRemaining === "function") {
        try {
          practiceRunsAvailable = Number(ui.storage.getPracticeRunsRemaining()) > 0;
        } catch (_) {
          practiceRunsAvailable = false;
        }
      }

      canPractice = hasEnoughMistakes && practiceRunsAvailable;
    }

    const runPracticePrimaryMinRaw = Number(cfg?.routing?.practicePrimaryMinWrong);
    const runPracticePrimaryMin =
      (Number.isFinite(runPracticePrimaryMinRaw) && runPracticePrimaryMinRaw >= 1)
        ? Math.floor(runPracticePrimaryMinRaw)
        : null;
    const runShouldPromotePractice =
      isRun &&
      runPracticePrimaryMin != null &&
      canPractice &&
      vars.backlog >= runPracticePrimaryMin;
    const runBonusEnabled = (cfg?.secretBonus?.enabled === true);
    const runEliteOrMore = (runVerdictKey === "elite" || runVerdictKey === "legendary");
    const runBonusPrimaryLabel = String(end.bonusCtaPrimary || "").trim();
    const runBonusBacklogOk = (runPracticePrimaryMin != null) ? (vars.backlog < runPracticePrimaryMin) : true;
    const runShouldPromoteBonus =
      isRun &&
      !runShouldPromotePractice &&
      !!runBonusEnabled &&
      runEliteOrMore &&
      runBonusBacklogOk &&
      !!runBonusPrimaryLabel;

    if (isRun && !Number.isFinite(Number(vars.remaining))) {
      vars.remaining = clampInt(poolSize - totalPresented, 0, poolSize);
    }
    const scoreLine = scoreLineTpl ? fillTemplate(scoreLineTpl, vars) : "";
    const scoreHeading = String(uiW.scoreLabel || "").trim();
    const newBestLine = newBestTpl ? fillTemplate(newBestTpl, vars) : "";
    const endLine = endLineTpl ? fillTemplate(endLineTpl, vars) : "";
    const practiceCelebrateLine = String(practiceW.celebrationAllCleared || practiceW.endLineAllFixed || "").trim();
    const bonusCelebrateLine = String(bonusW.celebrationPerfect || "").trim();
    const runStatsLine = (() => {
      if (!isRun || !!lastRun.poolCompleteCelebration) return "";

      const tpl = String(end.endStatsLine || "").trim();
      if (!tpl) return "";

      return fillTemplate(tpl, vars);
    })();

    const bonusDecisionLine = isBonus ? bonusRecoLine : "";

    const recordUntil = Number(ui._runtime?.endRecordMomentUntil || 0);
    const practiceAllCleared = isPractice && clampInt(vars.remaining, 0, 99999) === 0;
    const bonusPerfect = isBonus && bonusLevel === "perfect";
    const celebrationLabel =
      newBest ? newBestLine
        : practiceAllCleared ? practiceCelebrateLine
          : bonusPerfect ? bonusCelebrateLine
            : "";
    const recordActive = (!!celebrationLabel) ? (Date.now() < recordUntil) : false;
    const levelModel = getAppLevelModel(ui.storage, cfg, w);
    const levelProgress = (lastRun && typeof lastRun.levelProgress === "object") ? lastRun.levelProgress : null;
    const levelPreview = levelModel.preview || { unlockedLevel: 0, justUnlocked: false };
    const unlockedLevel = levelPreview.justUnlocked
      ? clampInt(levelPreview.unlockedLevel, 0, 4)
      : clampInt(levelProgress?.unlockedLevel, 0, 4);
    const unlockDef = levelModel.defs.find((item) => item.level === unlockedLevel) || null;
    const levelDetailsAria = String(levelModel.levelsW?.openDetailsAria || "").trim();
    const levelUnlockHtml = ((levelPreview.justUnlocked || levelProgress?.justUnlocked) && unlockDef)
      ? `
        <div class="wt-level-unlock">
          <p class="wt-level-unlock__kicker">${escapeHtml(String(levelModel.levelsW?.unlockKicker || "").trim())}</p>
          <div class="wt-level-unlock__card">
            <button type="button" class="wt-level-chip" data-action="open-level-progress" aria-label="${escapeHtml(levelDetailsAria)}">
              <span class="wt-level-chip__dot" aria-hidden="true"></span>
              <span>${escapeHtml(unlockDef.label)}</span>
            </button>
            <p class="wt-level-unlock__line">${escapeHtml(fillTemplate(String(levelModel.levelsW?.reachedTemplate || "").trim(), { label: unlockDef.label }))}</p>
          </div>
        </div>
      `
      : "";

    const displayScoreLine = scoreLine;
    const displayScoreHeading = (scoreHeading && scoreFP >= 0) ? scoreHeading : "";
    const displayScoreValue = (scoreHeading && scoreFP >= 0) ? String(scoreFP) : "";

    const pbLineTpl = String(end.personalBestLine || "").trim();
    const nearBestTpl = String(end.nearBestLine || "").trim();
    const pbPremiumHintTpl = String(end.personalBestPremiumHint || "").trim();
    const beatBestLineTpl = String(end.beatBestLine || "").trim();
    const beatBestFirstLineTpl = String(end.beatBestFirstLine || "").trim();
    const tierLineTpl = String(end.scoreTierLine || "").trim();
    const tierNextLineTpl = String(end.scoreTierNextLine || "").trim();
    const dailyWonTpl = String(end.dailyChallengeCleared || "").trim();
    const dailyWonFreeTpl = String(end.dailyChallengeClearedFreeRun || "").trim();
    const dailyTicketWonTpl = String(end.dailyChallengeTicketWon || "").trim();
    const dailyTicketCappedTpl = String(end.dailyChallengeTicketCapped || "").trim();
    const dailyMissTpl = String(end.dailyChallengeMiss || "").trim();
    const dailyMissLastFreeTpl = String(end.dailyChallengeMissLastFree || "").trim();

    let pbLine = "";
    if (isRun && premium) {
      const best = clampInt(lastRun.bestScoreFP, 0, 99999);
      const delta = clampInt(best - scoreFP, 0, 99999);

      if (!newBest && nearBestTpl && delta > 0) {
        pbLine = fillTemplate(nearBestTpl, { delta: String(delta), fpLong: String(vars.fpLong || "").trim() });
      } else if (!newBest && pbLineTpl) {
        pbLine = fillTemplate(pbLineTpl, vars);
      }
    }

    const pbPremiumHint = (isRun && !premium && pbPremiumHintTpl) ? String(pbPremiumHintTpl).trim() : "";
    const streakLine = "";

    const tierInfo = isRun ? getRunTierInfo(cfg, w, clampInt(lastRun.bestScoreFP, 0, 99999)) : null;
    const tierLine = (isRun && tierInfo?.currentLabel && tierLineTpl)
      ? fillTemplate(tierLineTpl, { tier: tierInfo.currentLabel })
      : "";
    const tierNextLine = (isRun && tierInfo?.nextTarget != null && tierInfo?.nextLabel && tierNextLineTpl)
      ? fillTemplate(tierNextLineTpl, {
        nextTier: tierInfo.nextLabel,
        nextTarget: String(tierInfo.nextTarget)
      })
      : "";

    const dailyModel = isRun ? getDailyChallengeModel(cfg, w, clampInt(lastRun.bestScoreFP, 0, 99999), ui.storage) : null;
    const isLastFreeRun = String(lastRun.runType || ui._runtime?.runType || "").trim() === "LAST_FREE";
    const dailyTargetScore = clampInt(lastRun.dailyTargetScore, 0, 99999) || clampInt(dailyModel?.targetScore, 0, 99999);
    const clearedDailyChallenge = !!(isRun && lastRun.dailyChallengeCompleted === true);
    const dailyTicketAtCap = !!(isRun && lastRun.dailyTicketAtCap === true);
    const dailyChallengeNeedsReplayReward = !!(isRun && dailyModel?.rewardPendingReplay === true);
    const clearedFreePreviewDaily = !!(
      isRun &&
      String(lastRun.runType || "").trim() === "FREE" &&
      !premium &&
      clearedDailyChallenge &&
      lastRun.dailyTicketAwarded !== true
    );
    const dailyChallengeIncomplete = !!(isRun && dailyModel && !dailyModel.completedToday);
    const missedLastFreeDaily = !!(
      isRun &&
      isLastFreeRun &&
      !clearedDailyChallenge &&
      lastRun.dailyTicketAwarded !== true
    );
    const dailyChallengeLine = (isRun && dailyModel)
      ? fillTemplate(
        (lastRun.dailyTicketAwarded === true && dailyTicketWonTpl)
          ? dailyTicketWonTpl
          : (dailyTicketAtCap && dailyTicketCappedTpl)
            ? dailyTicketCappedTpl
          : (clearedFreePreviewDaily && dailyWonFreeTpl)
            ? dailyWonFreeTpl
            : (clearedDailyChallenge ? dailyWonTpl : (missedLastFreeDaily && dailyMissLastFreeTpl) ? dailyMissLastFreeTpl : dailyMissTpl),
        {
          targetScore: String(dailyTargetScore),
          tickets: String(clampInt(lastRun.dailyTicketBalance, 0, 999)),
          cap: String(clampInt(ui.storage?.getRapidFireTicketCap?.(), 0, 999))
        }
      )
      : "";

    let beatBestLine = "";
    if (isRun && !newBest) {
      const best = clampInt(lastRun.bestScoreFP, 0, 99999);
      if (best > 0 && (!premium || !pbLine) && beatBestLineTpl) {
        beatBestLine = fillTemplate(beatBestLineTpl, { target: String(best + 1), fpLong: String(vars.fpLong || "").trim() });
      } else if (best <= 0 && beatBestFirstLineTpl) {
        beatBestLine = beatBestFirstLineTpl;
      }
    }

    let freeRunMessage = "";

    const msgTpl = isRun ? String(w.end?.freeRunLeft || "").trim() : "";

    const remainingRaw = (ui.storage && typeof ui.storage.getRunsBalance === "function")
      ? ui.storage.getRunsBalance()
      : null;

    const remaining = Number(remainingRaw);

    if (isRun && msgTpl && Number.isFinite(remaining) && remaining > 0) {
      freeRunMessage = fillTemplate(msgTpl, {
        remaining: String(clampInt(remaining, 0, 999)),
        pluralS: remaining > 1 ? "s" : ""
      });
    }

    const mistakesRecapHtml = buildEndMistakesRecap({
      isRun,
      isPractice,
      isBonus,
      lastRun,
      maxChances,
      bonusW,
      practiceW,
      end,
      runtime: ui._runtime,
      ui: uiW,
      cfg,
      vars
    });

    const shareEnabled = !!(cfg.share && cfg.share.enabled);
    const runsExhausted = (isRun && !premium && Number.isFinite(remaining) && remaining <= 0);

    const homeLabel = String(w.system?.home || "").trim();
    const homeBtnHtml = homeLabel
      ? `
      <button
        type="button"
        class="wt-btn-icon"
        data-action="go-home"
        aria-label="${escapeHtml(homeLabel)}"
        title="${escapeHtml(homeLabel)}"
      >${renderIcon("home")}</button>
    `
      : ``;

    const poolCompleteCelebration = isRun && !!lastRun.poolCompleteCelebration;

    const endTitle =
      isBonus ? String(bonusW.endTitle || "").trim()
        : isPractice ? String(practiceW.endTitle || "").trim()
          : poolCompleteCelebration ? String(end.poolCompleteTitle || "").trim()
            : String(end.title || "").trim();

    const runPlayAgain =
      poolCompleteCelebration
        ? String(w.end?.poolCompleteCtaPrimary || "").trim()
        : (isRun && runVerdictKey)
          ? String(w.end?.ctaByVerdict?.[runVerdictKey] || "").trim()
          : String(w.end?.playAgain || "").trim();

    let practiceAgain = String(practiceW.ctaPracticeAgain || "").trim();
    if (isPractice && practiceRepeatTierKey) {
      const tierCta = String(practiceW?.ctaRepeatByTier?.[practiceRepeatTierKey] || "").trim();
      if (tierCta) practiceAgain = tierCta;
    }

    const bonusAgain =
      (isBonus && bonusLevel)
        ? String(bonusW?.ctaByTier?.[bonusLevel] || "").trim()
        : "";

    const practiceCtaRaw = poolCompleteCelebration
      ? String(end.poolCompleteCtaPractice || "").trim()
      : premium
        ? String(end.practiceCtaPremium || "").trim()
        : String(end.practiceCta || "").trim();

    const practiceCtaTpl = String(end.practiceCtaTemplate || "").trim();
    const practiceCta = (practiceCtaTpl && vars.backlog > 0)
      ? fillTemplate(practiceCtaTpl, { count: String(vars.backlog), pluralS: vars.backlog > 1 ? "s" : "" })
      : practiceCtaRaw;

    const paywallBridgeTitle = String(w.paywall?.bridgeTitle || "").trim();
    const paywallBridgeBodyDefault = String(w.paywall?.bridgeBody || "").trim();
    const paywallBridgeBodyLastFreeMiss = String(w.paywall?.bridgeBodyLastFreeMiss || "").trim();
    const paywallBridgeBody = (missedLastFreeDaily && paywallBridgeBodyLastFreeMiss)
      ? paywallBridgeBodyLastFreeMiss
      : paywallBridgeBodyDefault;
    const upgradeCta = String(w.paywall?.cta || "").trim();
    const shareTitle = String(end.shareTitle || "").trim();
    const dailyChallengeCta = String(end.dailyChallengeCtaRetry || w.landing?.dailyChallengeCta || "").trim();

    const windowMs = Number(cfg?.secretBonus?.tapWindowMs);
    const endAfterRunsRaw = Number(cfg?.secretBonus?.gates?.endAfterRuns);
    const endAfterRuns = (Number.isFinite(endAfterRunsRaw) && endAfterRunsRaw >= 0) ? Math.floor(endAfterRunsRaw) : null;

    let runNumber = 0;
    if (ui.storage && typeof ui.storage.getRunNumber === "function") {
      try { runNumber = Number(ui.storage.getRunNumber() || 0); } catch (_) { runNumber = 0; }
    }

    const meetsRunGate = (endAfterRuns == null) ? true : (Number.isFinite(runNumber) && runNumber >= endAfterRuns);

    const canShowChest =
      Number.isFinite(windowMs) && windowMs > 0 &&
      meetsRunGate;

    const chestAria = String(ui.wording?.secretBonus?.chestAria || "").trim();
    const ticketBadgeAriaTpl = String(ui.wording?.secretBonus?.ticketBadgeAriaTemplate || "").trim();
    const chestTeaseClass = (!hasSolvedSecretChestHint(ui.storage)) ? " wt-btn-icon--tease" : "";
    let ticketBalance = 0;
    let ticketCap = 0;
    try {
      if (ui.storage && typeof ui.storage.getRapidFireTicketBalance === "function") {
        ticketBalance = clampInt(ui.storage.getRapidFireTicketBalance(), 0, 999);
      }
      if (ui.storage && typeof ui.storage.getRapidFireTicketCap === "function") {
        ticketCap = clampInt(ui.storage.getRapidFireTicketCap(), 0, 999);
      }
    } catch (_) {
      ticketBalance = 0;
      ticketCap = 0;
    }
    const showTicketBadge = !!(canShowChest && ticketBalance > 0);
    const ticketBadgeText = `${ticketBalance}/${Math.max(1, ticketCap || 3)}`;
    const chestTitle = showTicketBadge && ticketBadgeAriaTpl
      ? fillTemplate(ticketBadgeAriaTpl, {
        tickets: String(ticketBalance),
        cap: String(Math.max(1, ticketCap || 3))
      })
      : chestAria;

    const endActionsClass = `wt-actions wt-actions--stack${isPractice ? " wt-actions--grid" : ""}`;
    const endHeaderRowHtml = `
  <div class="wt-end-hero">
    <div class="wt-row wt-row--spaced wt-end-header">
      <div class="wt-end-header__brand">
        ${renderBrandingRow(cfg, true)}
      </div>

      <div class="wt-row wt-row--tight wt-end-header__actions">
        <div class="wt-locale-toggle-slot" data-wt-locale-toggle-slot></div>
        ${homeBtnHtml}

        ${canShowChest ? `
          <button
            type="button"
            data-wt-secret="chest"
            class="wt-btn-icon${showTicketBadge ? " wt-btn-icon--has-counter" : ""}${chestTeaseClass}"
            aria-label="${escapeHtml(chestAria)}"
            title="${escapeHtml(chestTitle)}"
          >${renderIcon("zap")}${showTicketBadge ? `<span class="wt-btn-icon__counter" aria-hidden="true">${escapeHtml(ticketBadgeText)}</span>` : ``}</button>
        ` : ``}
      </div>
    </div>
  </div>
`;

    const missingModeNoticeHtml = !hasKnownMode
      ? `<p class="wt-muted">${escapeHtml(String(end.modeMissingFallback || "").trim())}</p>`
      : ``;

    const microLinesHtml = buildEndMicroLines({
      isRun,
      premium,
      end,
      runtime: ui._runtime,
      lastRun,
      pbLine,
      streakLine,
      tierLine,
      tierNextLine,
      dailyChallengeLine,
      beatBestLine,
      poolCompleteCelebration,
      runIdentityTpl,
      vars,
      pbPremiumHint,
      freeRunMessage,
      wording: w
    });

    const paywallBridgeHtml =
      (runsExhausted && (paywallBridgeTitle || paywallBridgeBody))
        ? `
          <div class="wt-divider"></div>
          <div>
            ${paywallBridgeTitle ? `<strong class="wt-meta">${escapeHtml(paywallBridgeTitle)}</strong>` : ``}
            ${paywallBridgeBody ? `<p class="wt-muted">${escapeHtml(paywallBridgeBody)}</p>` : ``}
          </div>
        `
        : "";

    const shareHtml = buildEndShareBlock({
      shareEnabled,
      w,
      shareTitle,
      getShareText: ui._getShareText ? ui._getShareText.bind(ui) : null
    });

    const endCopyHtml = buildEndCopyHtml({
      isRun,
      isPractice,
      isBonus,
      practiceStatsLineTpl,
      bonusStatsLine,
      runStatsLine,
      endLine,
      practiceRepeatNoteTpl,
      bonusDecisionLine,
      runIdentityTpl,
      freeRunMessage,
      premium,
      poolCompleteCelebration,
      runPoolCompleteLine2Tpl,
      end,
      vars
    });

    return `
<div class="wt-card wt-card--end">
  ${endHeaderRowHtml}

  ${endTitle ? `<p class="wt-h1">${escapeHtml(endTitle)}</p>` : ``}
  ${missingModeNoticeHtml}

  ${displayScoreLine ? `
    <div class="wt-end-score${newBest ? " wt-end-score--newbest" : ""}" role="group" aria-label="${escapeHtml(displayScoreLine)}">
      <div class="wt-end-score__headline">
        ${displayScoreHeading ? `<span class="wt-end-score__eyebrow">${escapeHtml(displayScoreHeading)}</span>` : ``}
        <span class="wt-end-score__value">
          ${escapeHtml(displayScoreValue || displayScoreLine)}
        </span>
      </div>

      ${celebrationLabel ? `<span class="wt-end-score__label">${escapeHtml(celebrationLabel)}</span>` : ``}

      ${recordActive ? `
        <span class="wt-end-score__burst" aria-hidden="true"></span>
        <svg class="wt-end-score__spark" viewBox="0 0 36 14" width="36" height="14" aria-hidden="true" focusable="false">
          <path d="M6 1 L7.6 5.2 L12 6.2 L7.6 7.2 L6 11.4 L4.4 7.2 L0 6.2 L4.4 5.2 Z" fill="currentColor" opacity="0.85"></path>
          <path d="M18 2.2 L19.2 5.4 L22.6 6.4 L19.2 7.4 L18 10.6 L16.8 7.4 L13.4 6.4 L16.8 5.4 Z" fill="currentColor" opacity="0.6"></path>
          <path d="M30 1 L31.4 4.6 L35 5.8 L31.4 7 L30 10.6 L28.6 7 L25 5.8 L28.6 4.6 Z" fill="currentColor" opacity="0.75"></path>
        </svg>
      ` : ``}
    </div>
  ` : ``}

  ${levelUnlockHtml}

  <div class="wt-end-summary">
    ${microLinesHtml}
    <div class="wt-end-copy">${endCopyHtml}</div>
  </div>

  <div class="${endActionsClass}">
    ${buildEndActionsHtml({
      storage: ui.storage,
      w,
      cfg,
      vars,
      premium,
      end,
      postW: w.postCompletion || {},
      isRun,
      isPractice,
      isBonus,
      runShouldPromotePractice,
      practiceCta,
      runsExhausted,
      upgradeCta,
      runPlayAgain,
      runShouldPromoteBonus,
      runBonusPrimaryLabel,
      canPractice,
      practiceAgain,
      bonusW,
      bonusDeckTier,
      bonusAgain,
      poolCompleteCelebration,
      seen,
      poolSize,
      dailyChallengeIncomplete,
      dailyChallengeNeedsReplayReward,
      dailyChallengeCta
    })}
  </div>

  ${runsExhausted ? paywallBridgeHtml : ``}

  ${shareHtml}

  ${mistakesRecapHtml}

  ${!runsExhausted ? paywallBridgeHtml : ``}

</div>
`;
  }

  window.WT_UI_End = { render };
})();
