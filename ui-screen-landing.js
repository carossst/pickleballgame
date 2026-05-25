// ui-screen-landing.js
// Extracted from ui.js to keep LANDING rendering isolated from the core UI shell.

(() => {
  "use strict";

  function renderLandingStatsCard(opts, escapeHtml) {
    const badgeHtml = String(opts?.badgeHtml || "");
    const label = String(opts?.label || "").trim();
    const title = String(opts?.title || "").trim();
    const sub = String(opts?.sub || "").trim();
    const pct = Math.max(0, Math.min(100, Number(opts?.pct || 0)));
    const progressClass = String(opts?.progressClass || "").trim();
    const cardClass = String(opts?.cardClass || "").trim();
    const showProgress = (opts?.showProgress === true) || (opts?.showProgress !== false && pct > 0);
    const ctaAction = String(opts?.ctaAction || "").trim();
    const ctaLabel = String(opts?.ctaLabel || "").trim();
    const cardAction = String(opts?.cardAction || "").trim();
    const cardActionAria = String(opts?.cardActionAria || "").trim();
    const cardAttrs = String(opts?.cardAttrs || "").trim();
    const interactiveClass = cardAction ? " wt-landing-stat--clickable" : "";
    const interactiveAttrs = cardAction
      ? ` data-action="${escapeHtml(cardAction)}" role="button" tabindex="0"${cardActionAria ? ` aria-label="${escapeHtml(cardActionAria)}"` : ""}`
      : "";

    if (!label && !title && !sub) return "";

    return `
      <section class="wt-box wt-box--tinted wt-landing-stat${interactiveClass}${cardClass ? ` ${cardClass}` : ``}" aria-label="${escapeHtml(label || title || sub)}"${interactiveAttrs}${cardAttrs ? ` ${cardAttrs}` : ``}>
        <div class="wt-landing-stat__header">
          ${badgeHtml || ``}
          ${label ? `<span class="wt-landing-stat__label">${escapeHtml(label)}</span>` : ``}
        </div>
        ${title ? `<p class="wt-landing-stat__title">${escapeHtml(title)}</p>` : ``}
        ${sub ? `<p class="wt-landing-stat__sub">${escapeHtml(sub)}</p>` : ``}
        ${showProgress ? `
          <div class="wt-progress${progressClass}" role="img" aria-label="${escapeHtml(`${pct}%`)}">
            <span class="wt-progress__fill" style="width:${pct}%"></span>
          </div>
        ` : ``}
        ${(ctaAction && ctaLabel) ? `
          <div class="wt-landing-stat__actions">
            <button type="button" class="wt-btn wt-btn--secondary" data-action="${escapeHtml(ctaAction)}">
              ${escapeHtml(ctaLabel)}
            </button>
          </div>
        ` : ``}
      </section>
    `;
  }


  function getLandingSeenCount(storage, clampInt, poolSize) {
    let seen = 0;
    try {
      if (storage && typeof storage.getSeenItemIds === "function") {
        const ids = storage.getSeenItemIds() || [];
        seen = Array.isArray(ids) ? ids.length : 0;
      } else if (storage && typeof storage.getUniqueSeenCount === "function") {
        seen = Number(storage.getUniqueSeenCount() || 0);
      }
    } catch (_) {
      seen = 0;
    }
    return clampInt(seen, 0, poolSize);
  }

  function buildLandingLevelProgressCard(ui, ctx) {
    const {
      escapeHtml,
      fillTemplate,
      clampInt,
      cfg,
      landing,
      levelModel,
      runCompletes,
      poolSize
    } = ctx || {};

    if (!ui || !levelModel || !levelModel.current) return "";
    if (!Number.isFinite(runCompletes) || runCompletes < 1) return "";

    const current = levelModel.current;
    const next = levelModel.next;
    const currentLabel = String(levelModel.levelsW?.currentLabel || "").trim();
    const detailsAria = String(levelModel.levelsW?.openDetailsAria || "").trim();
    const seen = getLandingSeenCount(ui.storage, clampInt, poolSize);
    const level = clampInt(levelModel.state?.currentLevel, 0, levelModel.maxLevel || 0);

    let best = 0;
    try {
      if (ui.storage && typeof ui.storage.getPersonalBest === "function") {
        best = clampInt(ui.storage.getPersonalBest()?.bestScoreFP, 0, 99999);
      }
    } catch (_) {
      best = 0;
    }

    const levelsCfg = cfg?.levels && typeof cfg.levels === "object" ? cfg.levels : {};
    const seenTemplate = String(landing.levelProgressSeenTemplate || "").trim();
    const seenOrScoreTemplate = String(landing.levelProgressSeenOrScoreTemplate || "").trim();
    const nextTemplate = String(landing.levelNextTemplate || "").trim();

    let target = 0;
    let progressSeen = seen;
    let pct = 0;
    let sub = "";

    if (level <= 1) {
      target = clampInt(levelsCfg.level2MinSeen, 1, poolSize);
      progressSeen = Math.min(seen, target);
      pct = Math.round((progressSeen / Math.max(1, target)) * 100);
      sub = fillTemplate(seenTemplate, {
        seen: String(progressSeen),
        target: String(target)
      });
    } else if (level === 2) {
      const seenTarget = clampInt(levelsCfg.level3MinSeen, 1, poolSize);
      const scoreTarget = clampInt(levelsCfg.level3MinBestScore, 1, 99999);
      const seenPct = Math.round((Math.min(seen, seenTarget) / Math.max(1, seenTarget)) * 100);
      const scorePct = Math.round((Math.min(best, scoreTarget) / Math.max(1, scoreTarget)) * 100);
      pct = Math.max(seenPct, scorePct);
      sub = fillTemplate(seenOrScoreTemplate, {
        seen: String(Math.min(seen, seenTarget)),
        seenTarget: String(seenTarget),
        best: String(Math.min(best, scoreTarget)),
        scoreTarget: String(scoreTarget)
      });
    } else if (level === 3) {
      target = clampInt(levelsCfg.level4MinSeen, 1, poolSize);
      progressSeen = Math.min(seen, target);
      pct = Math.round((progressSeen / Math.max(1, target)) * 100);
      sub = fillTemplate(seenTemplate, {
        seen: String(progressSeen),
        target: String(target)
      });
    } else {
      sub = next && next.unlock ? next.unlock : (current.sheetBody || current.unlock || "");
      pct = 0;
    }

    pct = clampInt(pct, 0, 100);

    const title = String(
      currentLabel ? `${currentLabel}: ${current.label}` : current.label
    ).trim();
    const nextLine = next && next.label && nextTemplate
      ? fillTemplate(nextTemplate, { label: next.label })
      : "";
    const fullSub = [nextLine, sub].filter(Boolean).join(" · ");

    return renderLandingStatsCard({
      label: "",
      title,
      sub: fullSub,
      pct,
      cardClass: " wt-landing-stat--level",
      cardAction: "open-level-progress",
      cardActionAria: detailsAria
    }, escapeHtml);
  }

  function render(ui, helpers) {
    const {
      escapeHtml,
      fillTemplate,
      clampInt,
      isPremiumNow,
      getRunTierInfo,
      getDailyChallengeModel,
      getAppLevelModel,
      getLandingStatsPreviewState,
      getRuleKnowledgePhaseContext,
      renderBrandingRow,
      renderTextWithStrong,
      renderIcon,
      hasSolvedSecretChestHint,
      mmss,
      renderLeaderboardLandingCard
    } = helpers || {};

    if (
      typeof escapeHtml !== "function" ||
      typeof fillTemplate !== "function" ||
      typeof clampInt !== "function" ||
      typeof isPremiumNow !== "function" ||
      typeof getRunTierInfo !== "function" ||
      typeof getDailyChallengeModel !== "function" ||
      typeof getAppLevelModel !== "function" ||
      typeof getLandingStatsPreviewState !== "function" ||
      typeof getRuleKnowledgePhaseContext !== "function" ||
      typeof renderBrandingRow !== "function" ||
      typeof renderTextWithStrong !== "function" ||
      typeof renderIcon !== "function" ||
      typeof hasSolvedSecretChestHint !== "function" ||
      typeof mmss !== "function" ||
      typeof renderLeaderboardLandingCard !== "function"
    ) {
      throw new Error("WT_UI_Landing helpers missing");
    }

    const w = ui.wording || {};
    const landing = w.landing || {};
    const cfg = ui.config || {};
    const poolSize = clampInt(cfg?.game?.poolSize, 1, 9999);
    const maxChances = clampInt(cfg?.game?.maxChances, 1, 99);
    const subtitleRaw = fillTemplate(String(landing.subtitle || "").trim(), { poolSize, maxChances });

    const subtitleNormalized = subtitleRaw.includes("\n")
      ? subtitleRaw
      : subtitleRaw
        .replace(/\?\s+/g, "?\n")
        .replace(/\. +/g, ".\n");

    const subtitleHtml = subtitleNormalized
      .split(/\r?\n/)
      .map((s) => String(s || "").trim())
      .filter(Boolean)
      .map((s) => escapeHtml(s))
      .join("<br>");

    const premium = isPremiumNow(ui.storage);
    const isPostPaywallVariant = !premium && (ui._nav && ui._nav.landingVariant === "POST_PAYWALL");
    if (isPostPaywallVariant && ui._nav) ui._nav.landingVariant = null;

    const tagline = String(landing.tagline || "").trim();
    const microTrust = String(landing.microTrust || "").trim();
    const progressSectionTitle = String(landing.progressSectionTitle || "").trim();
    const progressSectionBody = String(landing.progressSectionBody || "").trim();
    const installCtaLabel = String(ui.wording?.installPrompt?.ctaPrimary || "").trim();
    const postTitle = String(landing.postPaywallTitle || "").trim();
    const postBody = String(landing.postPaywallBody || "").trim();
    const postCta = String(landing.postPaywallCta || "").trim();

    let rn = null;
    let rc = null;

    if (ui.storage && typeof ui.storage.getRunNumber === "function") {
      try {
        const v = Number(ui.storage.getRunNumber());
        rn = Number.isFinite(v) ? v : null;
      } catch (_) { rn = null; }
    }

    if (ui.storage && typeof ui.storage.getCounters === "function") {
      try {
        const c = ui.storage.getCounters() || {};
        const v = Number(c.runCompletes);
        rc = Number.isFinite(v) ? v : null;
      } catch (_) { rc = null; }
    }
    const a = (rn == null) ? null : Math.max(0, Math.floor(rn));
    const b = (rc == null) ? null : Math.max(0, Math.floor(rc));

    let rs = null;
    if (ui.storage && typeof ui.storage.getRunsUsed === "function") {
      try {
        const v = Number(ui.storage.getRunsUsed());
        rs = Number.isFinite(v) ? v : null;
      } catch (_) { rs = null; }
    }

    if (rs == null && ui.storage && typeof ui.storage.getCounters === "function") {
      try {
        const c = ui.storage.getCounters() || {};
        const v = Number(c.runStarts);
        rs = Number.isFinite(v) ? v : null;
      } catch (_) { rs = null; }
    }

    const c = (rs == null) ? null : Math.max(0, Math.floor(rs));
    const runCompletes =
      (a == null && b == null) ? 0 :
        (a == null) ? b :
          (b == null) ? a :
            Math.max(a, b);
    const runPlays = Math.max(runCompletes, (c == null ? 0 : c));

    let showLandingInstallPrompt = false;
    try {
      showLandingInstallPrompt =
        !premium &&
        !isPostPaywallVariant &&
        Number.isFinite(runCompletes) &&
        runCompletes >= 1 &&
        microTrust &&
        typeof ui._canShowInstallPrompt === "function" &&
        ui._canShowInstallPrompt() === true;
    } catch (_) { showLandingInstallPrompt = false; }

    let postBlock = "";
    let postCompletionHtml = "";
    try {
      const exhausted =
        !!(ui.storage && typeof ui.storage.hasSeenAllWordTraps === "function" && ui.storage.hasSeenAllWordTraps() === true);

      const pcCfg = cfg?.postCompletion || {};
      const pcW = w?.postCompletion || {};
      const wlCfg = cfg?.waitlist || {};
      const wlW = w?.waitlist || {};
      const haW = w?.houseAd || {};

      const waitlistEligible =
        !!(wlCfg.enabled === true && ui.storage && typeof ui.storage.shouldShowWaitlistNow === "function" && ui.storage.shouldShowWaitlistNow({ inRun: false }) === true);
      const houseAdEligible =
        !!(pcCfg?.houseAdEnabled === true && ui.storage && typeof ui.storage.shouldShowHouseAdNow === "function" && ui.storage.shouldShowHouseAdNow({ inRun: false }) === true);

      if (waitlistEligible || houseAdEligible) {
        const pcPoolSize = clampInt(cfg?.game?.poolSize, 1, 9999);

        const title = exhausted && pcCfg?.enabled === true
          ? fillTemplate(String(pcW.title || "").trim(), { poolSize: pcPoolSize })
          : String(wlW.title || "").trim();

        const body1 = exhausted && pcCfg?.enabled === true
          ? fillTemplate(String(pcW.body || "").trim(), { poolSize: pcPoolSize })
          : String(wlW.bodyLine1 || "").trim();

        const body2 = exhausted
          ? String(pcW.waitlistBody1 || wlW.bodyLine1 || "").trim()
          : String(wlW.bodyLine2 || "").trim();

        const body3 = exhausted
          ? String(pcW.waitlistBody2 || wlW.bodyLine2 || "").trim()
          : "";

        const waitlistCta = exhausted
          ? String(pcW.waitlistCta || wlW.ctaLabel || "").trim()
          : String(wlW.ctaLabel || "").trim();

        const waitlistDisclaimer = exhausted
          ? String(pcW.waitlistDisclaimer || wlW.disclaimer || "").trim()
          : String(wlW.disclaimer || "").trim();

        const houseAdCta = String(pcW.houseAdCta || haW.ctaPrimary || "").trim();

        postCompletionHtml = `
          <div class="wt-divider"></div>
          ${title ? `<strong class="wt-meta">${escapeHtml(title)}</strong>` : ``}
          <div class="wt-stack wt-stack--xs wt-postcompletion-copy">
            ${body1 ? `<p class="wt-muted">${escapeHtml(body1)}</p>` : ``}
            ${waitlistEligible && body2 ? `<p class="wt-muted">${escapeHtml(body2)}</p>` : ``}
            ${waitlistEligible && body3 ? `<p class="wt-muted">${escapeHtml(body3)}</p>` : ``}
          </div>

          <div class="wt-actions wt-postcompletion-actions">
            ${waitlistEligible && waitlistCta ? `
              <button class="wt-btn ${houseAdEligible ? `wt-btn--secondary` : `wt-btn--primary`}" data-action="open-waitlist">${escapeHtml(waitlistCta)}</button>
            ` : ``}

            ${houseAdEligible && houseAdCta ? `
              <button class="wt-btn ${waitlistEligible ? `wt-btn--ghost` : `wt-btn--primary`}" data-action="open-house-ad">${escapeHtml(houseAdCta)}</button>
            ` : ``}
          </div>

          ${waitlistEligible && waitlistDisclaimer ? `<p class="wt-muted wt-postcompletion-disclaimer">${escapeHtml(waitlistDisclaimer)}</p>` : ``}
        `;
      }
    } catch (_) { postCompletionHtml = ""; }

    const levelModel = getAppLevelModel(ui.storage, cfg, w);
    let levelProgressQuickHtml = buildLandingLevelProgressCard(ui, {
      escapeHtml,
      fillTemplate,
      clampInt,
      cfg,
      landing,
      levelModel,
      runCompletes,
      poolSize
    });

    let welcomeBackHtml = "";
    let personalBestCardHtml = "";
    let dailyChallengeCardHtml = "";
    const windowMs = Number(cfg?.secretBonus?.tapWindowMs);
    const landingAfterRunsRaw = Number(cfg?.secretBonus?.gates?.landingAfterRuns);
    const landingAfterRuns = (Number.isFinite(landingAfterRunsRaw) && landingAfterRunsRaw >= 0)
      ? Math.floor(landingAfterRunsRaw)
      : null;

    try {
      const statsCfg = cfg?.landingStats || {};
      const enabled = (statsCfg?.enabled === true);
      const poolSizeSafe = clampInt(cfg?.game?.poolSize, 1, 9999);
      const phasePreview = getLandingStatsPreviewState(cfg, poolSizeSafe);
      const minRunsRaw = Number(statsCfg?.minCompletedRuns);
      const minRunsToShow = (Number.isFinite(minRunsRaw) && minRunsRaw >= 1 && minRunsRaw <= 999) ? Math.floor(minRunsRaw) : null;
      const shouldShowStats = !!(
        enabled &&
        (
          phasePreview ||
          (minRunsToShow != null && Number.isFinite(runCompletes) && runCompletes >= minRunsToShow)
        )
      );

      if (shouldShowStats) {
        let seen = 0;
        try {
          if (ui.storage && typeof ui.storage.getSeenItemIds === "function") {
            const ids = ui.storage.getSeenItemIds() || [];
            seen = Array.isArray(ids) ? ids.length : 0;
          }
        } catch (_) { seen = 0; }

        seen = clampInt(seen, 0, poolSizeSafe);

        let mistakes = 0;
        try {
          if (ui.storage && typeof ui.storage.getActiveMistakesCount === "function") {
            mistakes = Number(ui.storage.getActiveMistakesCount() || 0);
          }
        } catch (_) { mistakes = 0; }

        mistakes = clampInt(mistakes, 0, poolSizeSafe);

        let practiceAvailable = true;
        try {
          if (!premium) {
            if (ui.storage && typeof ui.storage.getPracticeRunsRemaining === "function") {
              const remaining = Number(ui.storage.getPracticeRunsRemaining());
              practiceAvailable = Number.isFinite(remaining) && remaining > 0;
            } else {
              practiceAvailable = false;
            }
          }
        } catch (_) {
          practiceAvailable = premium ? true : false;
        }

        if (!practiceAvailable) mistakes = 0;

        if (phasePreview) {
          seen = clampInt(phasePreview.seen, 0, poolSizeSafe);
          mistakes = clampInt(phasePreview.mistakes, 0, poolSizeSafe);
        }

        if (!phasePreview && seen <= 0) {
          seen = 0;
          mistakes = 0;
        } else {

          const phase = getRuleKnowledgePhaseContext({
            cfg,
            w,
            storage: ui.storage,
            poolSize: poolSizeSafe,
            seen,
            mistakes
          });

          const remaining = clampInt(poolSizeSafe - phase.seen, 0, poolSizeSafe);
          const vars = {
            seen: phase.seen,
            poolSize: poolSizeSafe,
            remaining,
            mistakes: phase.mistakes,
            mastered: phase.mastered
          };

          const progressValue = phase.isComplete ? phase.mastered : phase.seen;
          const pct = poolSizeSafe > 0
            ? Math.max(0, Math.min(100, Math.round((progressValue / poolSizeSafe) * 100)))
            : 0;
          const progressClass = phase.isComplete ? " wt-progress--mastery" : "";
          const label = phase.badge;
          const title = fillTemplate(phase.landingSummaryTemplate, vars);
          const subTemplate = phase.landingDetailTemplate || phase.landingDetail;
          const sub = fillTemplate(subTemplate, vars);

          welcomeBackHtml = renderLandingStatsCard({ badgeHtml: landingLevelBadgeHtml, label, title, sub, pct, progressClass }, escapeHtml);
        }
      }
    } catch (_) { /* silent */ }

    let dailyChallengeIncomplete = false;
    let dailyChallengeCardAction = "";
    let dailyChallengeCardAria = "";
    let bestScoreFP = 0;
    try {
      bestScoreFP = (ui.storage && typeof ui.storage.getPersonalBest === "function")
        ? clampInt(ui.storage.getPersonalBest()?.bestScoreFP, 0, 99999)
        : 0;
      const tierInfo = getRunTierInfo(cfg, w, bestScoreFP);

      const bestBadge = String(landing.personalBestBadge || "").trim();
      const bestTitleTpl = String(landing.personalBestTitleTemplate || "").trim();
      const bestSubTpl = String(landing.personalBestSubTemplate || "").trim();
      const bestTopTpl = String(landing.personalBestTopTierTemplate || "").trim();
      const bestFirstTitle = String(landing.personalBestFirstTitle || "").trim();
      const bestFirstSubTpl = String(landing.personalBestFirstSubTemplate || "").trim();
      const bestLockedTitle = String(landing.personalBestLockedTitle || "").trim();
      const bestLockedSub = String(landing.personalBestLockedSub || "").trim();
      const bestCardActionAria = String(landing.ctaPlayAfterFirstRun || landing.ctaPlay || "").trim();

      const shouldShowPersonalBest = Number.isFinite(runCompletes) && runCompletes >= 1;

      if (shouldShowPersonalBest) {
        let bestCardAction = "";
        let bestCardAria = "";
        let runsExhausted = false;

        if (bestScoreFP <= 0) {
          let runsBalance = NaN;
          if (!premium && ui.storage && typeof ui.storage.getRunsBalance === "function") {
            try { runsBalance = Number(ui.storage.getRunsBalance()); } catch (_) { runsBalance = NaN; }
          }
          runsExhausted = !premium && Number.isFinite(runsBalance) && runsBalance <= 0;
          bestCardAction = runsExhausted ? "open-paywall" : "start-run";
          bestCardAria = runsExhausted
            ? String(landing.postPaywallCta || bestCardActionAria || "").trim()
            : bestCardActionAria;
        }

        const bestTitle = (bestScoreFP > 0 && bestTitleTpl)
          ? fillTemplate(bestTitleTpl, { tier: tierInfo.currentLabel || "", best: String(bestScoreFP) })
          : (runsExhausted && bestLockedTitle ? bestLockedTitle : bestFirstTitle);

        const bestSub = (bestScoreFP > 0)
          ? (
            tierInfo.nextTarget != null
              ? fillTemplate(bestSubTpl, {
                best: String(bestScoreFP),
                nextTarget: String(tierInfo.nextTarget),
                nextTier: tierInfo.nextLabel || ""
              })
              : fillTemplate(bestTopTpl, { best: String(bestScoreFP) })
          )
          : (runsExhausted && bestLockedSub
            ? bestLockedSub
            : fillTemplate(bestFirstSubTpl, { nextTarget: String(tierInfo.nextTarget || 3) }));

        personalBestCardHtml = renderLandingStatsCard({
          label: bestBadge,
          title: bestTitle,
          sub: bestSub,
          pct: (bestScoreFP > 0) ? tierInfo.progressPct : 0,
          progressClass: "",
          cardAction: bestCardAction,
          cardActionAria: bestCardAria
        }, escapeHtml);
      }
    } catch (_) { /* silent */ }

    try {
      // Product choice:
      // the Daily Challenge appears only after at least one completed RUN.
      // Before that, the landing should stay focused on the core loop and first-play clarity.
      if (Number.isFinite(runCompletes) && runCompletes >= 1) {
        const fallbackBestScoreFP = (ui.storage && typeof ui.storage.getPersonalBest === "function")
          ? clampInt(ui.storage.getPersonalBest()?.bestScoreFP, 0, 99999)
          : 0;
        const dailyBestScoreFP = clampInt(bestScoreFP || fallbackBestScoreFP, 0, 99999);
        const dailyModel = getDailyChallengeModel(cfg, w, dailyBestScoreFP, ui.storage);
        const dailyBadge = String(landing.dailyChallengeBadge || "").trim();
        const dailyTitleTpl = String(landing.dailyChallengeTitleTemplate || "").trim();
        const dailyProgressTpl = String(landing.dailyChallengeProgressTemplate || "").trim();
        const dailyResetTpl = String(landing.dailyChallengeResetTemplate || "").trim();
        const dailyCompletedTpl = String(landing.dailyChallengeCompletedTemplate || "").trim();
        const dailyRewardTpl = String(landing.dailyChallengeRewardTemplate || "").trim();
        const dailyRewardCappedTpl = String(landing.dailyChallengeRewardCappedTemplate || "").trim();
        const dailyRewardPendingTpl = String(landing.dailyChallengeRewardPendingTemplate || "").trim();
        const dailyCta = String(landing.dailyChallengeCta || "").trim();
        const dailyGoalLine = dailyTitleTpl
          ? fillTemplate(dailyTitleTpl, {
            targetScore: String(dailyModel.targetScore)
          })
          : "";

        let dailySub = "";
        const rewardLine = (!dailyModel.completedToday && dailyModel.challengePlayable)
          ? (
            (dailyModel.ticketAtCap && dailyRewardCappedTpl)
              ? fillTemplate(dailyRewardCappedTpl, { cap: String(dailyModel.ticketCap || 0) })
              : (dailyRewardTpl
                ? fillTemplate(dailyRewardTpl, { tickets: String(dailyModel.ticketBalance || 0), cost: String(dailyModel.ticketCost || 1) })
                : "")
          )
          : "";
        if (dailyModel.rewardPendingReplay && dailyRewardPendingTpl) {
          dailySub = fillTemplate(dailyRewardPendingTpl, {
            targetScore: String(dailyModel.targetScore),
            best: String(dailyBestScoreFP || 0),
            time: String(dailyModel.resetCountdown || ""),
            resetTime: String(dailyModel.resetTime || dailyModel.resetCountdown || "")
          });
        } else if (dailyModel.completedToday && dailyCompletedTpl) {
          dailySub = fillTemplate(dailyCompletedTpl, {
            best: String(dailyBestScoreFP || 0),
            time: String(dailyModel.resetCountdown || ""),
            resetTime: String(dailyModel.resetTime || dailyModel.resetCountdown || "")
          });
        } else if (!dailyModel.completedToday && dailyModel.progressPct > 0 && dailyProgressTpl) {
          dailySub = fillTemplate(dailyProgressTpl, {
            score: String(dailyModel.todayBestScore || 0),
            targetScore: String(dailyModel.targetScore),
            best: String(dailyBestScoreFP || 0),
            time: String(dailyModel.resetCountdown || ""),
            resetTime: String(dailyModel.resetTime || dailyModel.resetCountdown || "")
          });
        } else if (!dailyModel.completedToday && dailyResetTpl) {
          dailySub = fillTemplate(dailyResetTpl, {
            targetScore: String(dailyModel.targetScore),
            best: String(dailyBestScoreFP || 0),
            time: String(dailyModel.resetCountdown || ""),
            resetTime: String(dailyModel.resetTime || dailyModel.resetCountdown || "")
          });
        }

        if (!dailyModel.completedToday && dailyGoalLine) {
          dailySub = dailySub ? `${dailyGoalLine} ${dailySub}` : dailyGoalLine;
        }

        if (rewardLine) {
          dailySub = dailySub ? `${dailySub} ${rewardLine}` : rewardLine;
        }

        dailyChallengeIncomplete = !dailyModel.completedToday || !!dailyModel.rewardPendingReplay;
        dailyChallengeCardAction =
          (!dailyModel.completedToday || !!dailyModel.rewardPendingReplay) && dailyModel.challengePlayable
            ? "start-daily-challenge"
            : "";
        dailyChallengeCardAria = dailyChallengeCardAction ? dailyCta : "";
        if (dailyBadge || dailySub) {
          dailyChallengeCardHtml = renderLandingStatsCard({
            label: dailyBadge,
            title: "",
            sub: dailySub,
            pct: dailyModel.progressPct,
            showProgress: dailyModel.completedToday || dailyModel.progressPct > 0,
            cardClass: (dailyModel.completedToday && !dailyModel.rewardPendingReplay)
              ? " wt-landing-stat--daily wt-landing-stat--daily-complete"
              : " wt-landing-stat--daily",
            progressClass: (dailyModel.completedToday && !dailyModel.rewardPendingReplay) ? " wt-progress--mastery" : "",
            cardAttrs: `data-wt-daily-challenge-card="1"`,
            cardAction: dailyChallengeCardAction,
            cardActionAria: dailyChallengeCardAria,
            ctaAction: ((dailyModel.completedToday && !dailyModel.rewardPendingReplay) || !dailyModel.challengePlayable) ? "" : "start-daily-challenge",
            ctaLabel: ((dailyModel.completedToday && !dailyModel.rewardPendingReplay) || !dailyModel.challengePlayable) ? "" : dailyCta
          }, escapeHtml);
        }
      }
    } catch (_) { /* silent */ }

    const playLabelFirst = String(landing.ctaPlay || "").trim();
    const playLabelAfterFirstRun = String(landing.ctaPlayAfterFirstRun || "").trim();
    const playLabel =
      (Number.isFinite(runPlays) && runPlays >= 1)
        ? playLabelAfterFirstRun
        : playLabelFirst;

    const meetsRunGate = (landingAfterRuns == null)
      ? false
      : (Number.isFinite(runPlays) && runPlays >= landingAfterRuns);
    const canShowChest =
      Number.isFinite(windowMs) && windowMs > 0 &&
      meetsRunGate;

    let sbFreeRunsUsedLanding = 0;
    if (ui.storage && typeof ui.storage.getSecretBonusFreeRunsUsed === "function") {
      try { sbFreeRunsUsedLanding = Number(ui.storage.getSecretBonusFreeRunsUsed()); } catch (_) { sbFreeRunsUsedLanding = 0; }
    }

    const chestHintTextLanding = (canShowChest && sbFreeRunsUsedLanding === 0)
      ? String(ui.wording?.secretBonus?.chestHint || "").trim()
      : "";

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
    const showTicketBadge = !!(canShowChest && (ticketBalance > 0 || runCompletes >= 1));
    const ticketBadgeText = `${ticketBalance}/${Math.max(1, ticketCap || 3)}`;
    const chestTitle = showTicketBadge && ticketBadgeAriaTpl
      ? fillTemplate(ticketBadgeAriaTpl, {
        tickets: String(ticketBalance),
        cap: String(Math.max(1, ticketCap || 3))
      })
      : chestAria;

    let landingUrgencyHtml = "";
    try {
      const pay = w.paywall || {};
      let ep = null;
      if (ui.storage && typeof ui.storage.getEarlyPriceState === "function") {
        try { ep = ui.storage.getEarlyPriceState() || null; } catch (_) { ep = null; }
      }

      const isEarly = !!(ep && String(ep.phase || "").toUpperCase() === "EARLY" && Number(ep.remainingMs || 0) > 0);
      const remainingMs = isEarly ? Number(ep?.remainingMs || 0) : 0;
      const timer = (isEarly && Number.isFinite(remainingMs)) ? mmss(remainingMs) : "";

      const urgencyCfg = (cfg?.ui?.paywallUrgency && typeof cfg.ui.paywallUrgency === "object") ? cfg.ui.paywallUrgency : null;
      const urgencyEnabled = (urgencyCfg && urgencyCfg.enabled === true);
      const pulseBelowMs = urgencyCfg ? Number(urgencyCfg.pulseBelowMs) : NaN;
      const urgencyPulse =
        urgencyEnabled &&
        isEarly &&
        Number.isFinite(pulseBelowMs) &&
        pulseBelowMs > 0 &&
        Number.isFinite(remainingMs) &&
        remainingMs > 0 &&
        remainingMs <= pulseBelowMs;

      const label = String(pay.timerLabel || "").trim();

      if (!premium && isEarly && urgencyEnabled && label) {
        const cls = `wt-box wt-box--tinted`;
        landingUrgencyHtml = `
        <div class="${cls}" role="status" aria-live="polite">
        <div class="wt-meta">${escapeHtml(label)}</div>
          <div class="wt-h2 wt-paywall-timer${urgencyPulse ? ' wt-pulse' : ''}">${escapeHtml(timer)}</div>
        </div>
      `;
      }
    } catch (_) { landingUrgencyHtml = ""; }

    postBlock = (() => {
      if (!isPostPaywallVariant) return ``;

      let sbUsedPost = 0;
      if (ui.storage && typeof ui.storage.getSecretBonusFreeRunsUsed === "function") {
        try { sbUsedPost = Number(ui.storage.getSecretBonusFreeRunsUsed()); } catch (_) { sbUsedPost = 0; }
      }

      const postSbTitle = String(landing.postPaywallSbTitle || "").trim();
      const postSbBody = String(landing.postPaywallSbBody || "").trim();

      if (canShowChest && sbUsedPost === 0 && (postSbTitle || postSbBody)) {
        return `
          <div class="wt-divider"></div>
          ${postSbTitle ? `<strong class="wt-meta">${escapeHtml(postSbTitle)}</strong>` : ``}
          ${postSbBody ? `<p class="wt-muted wt-postpaywall-body">${escapeHtml(postSbBody)}</p>` : ``}
        `;
      }

      if (postTitle || postBody || postCta) {
        return `
          <div class="wt-divider"></div>
          ${postTitle ? `<strong class="wt-meta">${escapeHtml(postTitle)}</strong>` : ``}
          ${postBody ? `<p class="wt-muted wt-postpaywall-body">${escapeHtml(postBody)}</p>` : ``}
          ${postCta ? `
            <div class="wt-actions wt-actions--postpaywall">
              <button class="wt-btn wt-btn--secondary" data-action="open-paywall">
                ${escapeHtml(postCta)}
              </button>
            </div>
          ` : ``}
        `;
      }

      return ``;
    })();

    const landingHeaderRowHtml = `
  <div class="wt-landing-hero">
     <div class="wt-landing-header">
      <div class="wt-landing-header__brand">
        ${renderBrandingRow(cfg, true)}
      </div>
     <div class="wt-landing-top-right">
        <div class="wt-locale-toggle-slot" data-wt-locale-toggle-slot></div>
        ${chestHintTextLanding ? `<div class="wt-chest-hint-inline">${escapeHtml(chestHintTextLanding)}</div>` : ``}
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

    const leaderboardLandingHtml = renderLeaderboardLandingCard(ui);
    // Landing KISS: the level card owns progression. Do not also render
    // phase/coverage summaries such as "Keep going" or "questions left".
    welcomeBackHtml = "";
    // Landing KISS: the Daily Challenge owns the score target.
    // Do not render a separate best-score card on the landing.
    const primaryInsightHtml = dailyChallengeCardHtml;
    const secondaryInsightHtml = "";
    const hasDashboard = Boolean(
      welcomeBackHtml ||
      primaryInsightHtml ||
      secondaryInsightHtml ||
      levelProgressQuickHtml
    );

    return `
  <div class="wt-card wt-card--landing">


${landingHeaderRowHtml}
  ${landingUrgencyHtml}
  ${tagline ? `<p class="wt-meta wt-tagline">${renderTextWithStrong(tagline)}</p>` : ``}
  <p class="wt-sub wt-landing-subtitle">${subtitleHtml}</p>

<div class="wt-actions">

      ${(() => {
        let bal = null;
        if (!premium && ui.storage && typeof ui.storage.getRunsBalance === "function") {
          try { bal = Number(ui.storage.getRunsBalance()); } catch (_) { bal = null; }
        }
        const runsExhausted = (!premium && Number.isFinite(bal) && bal <= 0);

        if (runsExhausted) {
          const label = String(landing.postPaywallCta || "").trim();
          if (!label) return ``;
          return `
            <button class="wt-btn wt-btn--primary" data-action="open-paywall">
              ${escapeHtml(label)}
            </button>
          `;
        }

        return `
          <button class="wt-btn wt-btn--primary" data-action="start-run"
            aria-label="${escapeHtml(playLabel)}"
            ${((ui._runtime && Number(ui._runtime.contentTotal) > 0) ? "" : "disabled")}>
             ${escapeHtml(playLabel)}
          </button>
        `;
      })()}

${(() => {
        if (!Number.isFinite(runCompletes) || runCompletes < 1) return ``;

        const minWrong = clampInt(Number(cfg?.mistakesOnly?.minWrongItemsToShowToggle), 1, 9999);

        let mistakesCount = 0;
        if (ui.storage && typeof ui.storage.getActiveMistakesCount === "function") {
          try { mistakesCount = Number(ui.storage.getActiveMistakesCount()); } catch (_) { mistakesCount = 0; }
        }

        if (!Number.isFinite(mistakesCount) || mistakesCount < minWrong) return ``;

        const tpl = String(landing.practiceCtaTemplate || "").trim();
        const label = tpl
          ? fillTemplate(tpl, { count: String(mistakesCount), pluralS: mistakesCount > 1 ? "s" : "" })
          : "";

        if (!label) return ``;

        if (!premium && ui.storage && typeof ui.storage.getPracticeRunsRemaining === "function") {
          let remaining = 0;
          try { remaining = Number(ui.storage.getPracticeRunsRemaining()); } catch (_) { remaining = 0; }
          if (!Number.isFinite(remaining) || remaining <= 0) return ``;
        }

        return `
    <button class="wt-btn wt-btn--secondary" data-action="start-practice">
      ${escapeHtml(label)}
    </button>
  `;
      })()}

    </div>

    ${((!premium && !isPostPaywallVariant && landing.microFun) ? `<p class="wt-sub wt-muted wt-landing-followup">${escapeHtml(String(landing.microFun || "").trim())}</p>` : ``)}

    ${postBlock}

    ${postCompletionHtml}

    ${showLandingInstallPrompt ? `
      <p class="wt-sub wt-muted wt-landing-trust">${escapeHtml(microTrust)}</p>
      ${installCtaLabel ? `
        <div class="wt-actions wt-actions--stack">
          <button class="wt-btn wt-btn--secondary" data-action="install-app">
            ${escapeHtml(installCtaLabel)}
          </button>
        </div>
      ` : ``}
    ` : ``}

    ${hasDashboard ? `
      <section class="wt-landing-dashboard">
        ${levelProgressQuickHtml ? `<div class="wt-landing-dashboard__level">${levelProgressQuickHtml}</div>` : ``}
        <div class="wt-landing-dashboard__grid">
          ${primaryInsightHtml ? `<div class="wt-landing-dashboard__spotlight">${primaryInsightHtml}</div>` : ``}
          ${secondaryInsightHtml ? `<div class="wt-landing-dashboard__secondary">${secondaryInsightHtml}</div>` : ``}
        </div>
      </section>
    ` : ``}

    ${leaderboardLandingHtml ? `
      <section class="wt-landing-leaderboard-section">
        ${leaderboardLandingHtml}
      </section>
    ` : ``}

</div>
`;
  }

  window.WT_UI_Landing = { render };
})();
