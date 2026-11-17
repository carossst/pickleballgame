UI.prototype.startRun = function (mistakesOnly) {
    const cfg = this.config || {};
    const moCfg = cfg.mistakesOnly || {};
    const premium = isPremiumNow(this.storage);
    const startedFromLanding = this.state === STATES.LANDING;

    // Hook for live stats refresh during run (deck rebuild)
    // Exposed on the UI instance to avoid scope-related ReferenceError.
    this.getStatsByItem = () => {
      return this.storage && typeof this.storage.getStatsByItem === 'function'
        ? this.storage.getStatsByItem()
        : {};
    };

    // Snapshot at run start (anti-repetition seed)
    const statsByItem = this.getStatsByItem();

    // Snapshot PRACTICE backlog at run start (for END stats)
    let practiceBacklogAtStart = null;
    try {
      if (
        mistakesOnly === true &&
        this.storage &&
        typeof this.storage.getActiveMistakesCount === 'function'
      ) {
        practiceBacklogAtStart = clampInt(
          this.storage.getActiveMistakesCount(),
          0,
          99999
        );
      }
    } catch (_) {
      practiceBacklogAtStart = null;
    }

    if (mistakesOnly === true && practiceBacklogAtStart === 0) {
      return;
    }

    if (mistakesOnly === true && moCfg.premiumOnly === true && !premium) {
      this.setState(STATES.PAYWALL);
      return;
    }

    // PRACTICE gate (free users can start a limited number of practice runs)
    if (mistakesOnly === true && !premium) {
      if (
        !this.storage ||
        typeof this.storage.consumePracticeOrBlock !== 'function'
      ) {
        this.setState(STATES.PAYWALL);
        return;
      }

      const gate = this.storage.consumePracticeOrBlock();
      if (!gate || gate.ok !== true) {
        const limit = clampInt(this.config?.mistakesOnly?.freeRunsLimit, 0, 99);
        if (this.openFreeLimitReachedModal(this.wording?.practice, { limit }))
          return;
        this.setState(STATES.PAYWALL);
        return;
      }
    }

    let runStartNumber = null;
    let currentRunNumber = 0;

    // RUN economy gate (free runs) is enforced at run start.
    if (mistakesOnly !== true && !premium) {
      if (
        !this.storage ||
        typeof this.storage.consumeRunOrBlock !== 'function'
      ) {
        this.setState(STATES.PAYWALL);
        return;
      }

      const gate = this.storage.consumeRunOrBlock();
      if (!gate || gate.ok !== true) {
        const limit = clampInt(this.config?.limits?.freeRuns, 0, 99);
        if (this.openFreeLimitReachedModal(this.wording?.end, { limit }))
          return;
        this.setState(STATES.PAYWALL);
        return;
      }

      if (this.storage && typeof this.storage.getRunsUsed === 'function') {
        const used = Number(this.storage.getRunsUsed());
        runStartNumber =
          Number.isFinite(used) && Math.floor(used) === used && used >= 1
            ? used
            : null;
      }
    }

    if (mistakesOnly !== true && this.storage) {
      try {
        if (typeof this.storage.reserveRunNumber === 'function') {
          currentRunNumber = clampInt(
            this.storage.reserveRunNumber(),
            0,
            999999999
          );
        } else if (typeof this.storage.getRunNumber === 'function') {
          const prevRunNumber = Number(this.storage.getRunNumber() || 0);
          currentRunNumber = Math.max(0, Math.floor(prevRunNumber)) + 1;
        }
      } catch (_) {
        currentRunNumber = 0;
      }
    }

    this._runtime.practiceBacklogAtStart = practiceBacklogAtStart;
    this._runtime.currentRunNumber = currentRunNumber;
    this._runtime.currentRunId = generateRunUuid();
    this._runtime.runStartedAt = Date.now();
    this._runtime.currentQuestionShownAt = this._runtime.runStartedAt;
    this._runtime.runAnswerLog = [];
    if (startedFromLanding) {
      if (
        this.storage &&
        typeof this.storage.markLandingNextRunStarted === 'function'
      ) {
        this.storage.markLandingNextRunStarted();
      }
      this._runtime.landingRunCompletionPending = true;
    } else {
      this._runtime.landingRunCompletionPending = false;
    }

    // Provide a stable function reference to the engine (no free variable)
    const getStatsByItem = this.getStatsByItem;

    // Start engine after gate succeeded
    // Eligible pool for normal RUN / PRACTICE = full content set.
    const srcItems = Array.isArray(this._runtime?.contentItems)
      ? this._runtime.contentItems
      : [];
    const eligible = srcItems.slice();

    const requestedRunKind = String(this._runtime?.pendingRunKind || '').trim().toUpperCase();
    const challengeIds = getQueryList('challenge');
    const fixedIds = requestedRunKind === 'DAILY'
      ? getCommonChallengeIds(eligible, getCommonDayKey(), 10)
      : challengeIds.length >= 2
        ? challengeIds
        : [];

    const state = this.game.start({
      items: eligible,
      statsByItem,
      getStatsByItem,
      config: cfg,

      // game.js contract: "RUN" | "PRACTICE" | "BONUS"
      mode: mistakesOnly === true ? MODES.PRACTICE : MODES.RUN,
      fixedIds,

      // Free RUN only: lets game.js prepend curated opening cards for the first free runs.
      // Null for premium and PRACTICE, so the engine keeps the normal deck.
      runStartNumber
    });

    this._runtime.runItemIds = [];
    this._runtime.runMistakeIds = [];
    this._runtime.freeRunNumber = runStartNumber;
    this._runtime.currentRunNumber = currentRunNumber;
    this._runtime.runMode = mistakesOnly === true ? MODES.PRACTICE : MODES.RUN;
    this._runtime.challengeKind = mistakesOnly !== true && fixedIds.length
      ? (requestedRunKind === 'DAILY' ? 'DAILY' : 'FRIEND')
      : '';
    this._runtime.pendingRunKind = '';
    this._runtime.lastAnswer = null;
    this._runtime.reviewingFeedback = false;
    this._runtime.lastFeedbackReview = null;
    this._runtime.feedbackPending = false;
    this._runtime.feedbackReveal = true;
    this._runtime.gameOverPending = false;
    this._runtime.autoGameOverAfterFeedback = false;
    this._runtime.secretBonusPending = false;
    this._runtime.poolCompleteCelebrationPending = false;

    if (this._runtime.feedbackRevealTimerId) {
      clearRuntimeTimer(this, 'feedbackRevealTimerId');
    }
    if (this._runtime.gameOverAfterFeedbackTimerId) {
      clearRuntimeTimer(this, 'gameOverAfterFeedbackTimerId');
    }

    if (this._runtime.bonusAnswerFeedbackTimerId) {
      clearRuntimeTimer(this, 'bonusAnswerFeedbackTimerId');
    }

    if (this._runtime.bonusEndTimerId) {
      clearRuntimeTimer(this, 'bonusEndTimerId');
    }
    this._runtime.questionAutoReadDoneKey = '';

    if (this._runtime.endRecordMomentTimer) {
      clearRuntimeTimer(this, 'endRecordMomentTimer');
    }
    this._runtime.endRecordMomentUntil = 0;

    this._runtime.frozenItem = null;
    this._runtime.shareAnchorId = null;

    // Pool reshuffle toast guard (once per RUN)
    this._runtime.poolReshuffleToastShown = false;

    // One-shot per run: "New best score" toast (PLAYING)
    this._runtime.newBestScoreToastShown = false;

    // micro-pics reset (run-only)
    let startChances = clampInt(cfg?.game?.maxChances, 1, 99);
    try {
      const gs =
        this.game && typeof this.game.getState === 'function'
          ? this.game.getState() || {}
          : {};
      if (gs.chancesLeft != null)
        startChances = clampInt(gs.chancesLeft, 0, 99);
    } catch (_) {
      /* keep cfg */
    }
    this._runtime.microPics = createMicroPicsState(startChances);

    // input safety
    this._runtime.answerLocked = false;

    // Option A: finish only after Continue
    this._runtime.finishAfterFeedback = false;

    const first = this.game.getCurrent();
    const firstId = Number(first?.id);
    this._runtime.shareAnchorId = Number.isFinite(firstId) ? firstId : null;

    if (state && state.done) {
      this._finishRun();
      return;
    }

    // Determine overlay run type (no fallback):
    // - Premium RUN => UNLIMITED
    // - PRACTICE => PRACTICE
    // - Free users => FREE or LAST_FREE based on runs balance after consuming
    let runType = '';
    try {
      const isPrem = isPremiumNow(this.storage);

      if (mistakesOnly === true) {
        runType = 'PRACTICE';
      } else if (isPrem) {
        runType = 'UNLIMITED';
      } else if (
        this.storage &&
        typeof this.storage.getRunsBalance === 'function'
      ) {
        const after = Number(this.storage.getRunsBalance());
        if (Number.isFinite(after)) {
          runType = after === 0 ? 'LAST_FREE' : 'FREE';
        }
      }
    } catch (_) {
      runType = '';
    }

    // Persist runType for PAYWALL rendering (e.g., headlineLastFree).
    this._runtime.runType = runType;

    try {
      if (
        window.WT_Analytics &&
        typeof window.WT_Analytics.trackFunnel === 'function' &&
        typeof window.WT_Analytics.inferUiContext === 'function'
      ) {
        window.WT_Analytics.trackFunnel(
          'run_start',
          window.WT_Analytics.inferUiContext(this, {
            mode: this._runtime.runMode,
            run_type: runType || '',
            free_run_number: runStartNumber,
            challenge_kind: this._runtime.challengeKind
          })
        );
      }
    } catch (_) {
      /* silent */
    }

    // PRACTICE: setState(PLAYING) first so the game screen renders underneath,
    // then overlay appears on top of it (not on top of END/LANDING).
    if (mistakesOnly === true) {
      if (!this._beforeUnloadHandler) {
        this._beforeUnloadHandler = (e) => {
          if (this.state !== STATES.PLAYING) return;
          e.preventDefault();
        };
        window.addEventListener('beforeunload', this._beforeUnloadHandler);
      }

      showRunStartOverlay(
        cfg,
        this.wording,
        this.game,
        'PRACTICE',
        null,
        () => {
          // overlay dismissed — game already visible, nothing else needed
        }
      );

      this.setState(STATES.PLAYING);
      return;
    }
    // Freeze the Daily target before the run starts so the challenge stays stable for the whole day.
    let runDailyModel = null;
    try {
      if (!mistakesOnly) {
        const currentBest =
          this.storage && typeof this.storage.getPersonalBest === 'function'
            ? clampInt(this.storage.getPersonalBest()?.bestScoreFP, 0, 99999)
            : 0;
        runDailyModel = getDailyChallengeModel(
          cfg,
          this.wording,
          currentBest,
          this.storage
        );
      }
    } catch (_) {
      runDailyModel = null;
    }

    // RUN normal: overlay only for LAST_FREE.
    if (!this._beforeUnloadHandler) {
      this._beforeUnloadHandler = (e) => {
        if (this.state !== STATES.PLAYING) return;
        e.preventDefault();
      };
      window.addEventListener('beforeunload', this._beforeUnloadHandler);
    }

    this.setState(STATES.PLAYING);

    if (runType === 'LAST_FREE') {
      let dailyExtra = null;
      try {
        const canEarnDailyTicket = !!(
          runDailyModel &&
          runDailyModel.completedToday !== true &&
          runDailyModel.rewardAvailableToday === true &&
          runDailyModel.ticketAtCap !== true
        );
        if (canEarnDailyTicket) {
          const label = String(
            this.wording?.ui?.dailyChallengeStartOverlayLabel || ''
          ).trim();
          const lineTpl = String(
            this.wording?.ui?.dailyChallengeStartOverlayLineTemplate || ''
          ).trim();
          dailyExtra = {
            goalLine1: label,
            goalLine2: lineTpl
              ? fillTemplate(lineTpl, {
                  targetScore: String(runDailyModel.targetScore)
                })
              : ''
          };
        }
      } catch (_) {
        dailyExtra = null;
      }

      showRunStartOverlay(
        cfg,
        this.wording,
        this.game,
        'LAST_FREE',
        dailyExtra,
        () => {
          // overlay dismissed — game already visible, nothing else needed
        }
      );
    }
  };

  UI.prototype.openFreeLimitReachedModal = function (wordingBlock, vars) {
    const block = wordingBlock || {};
    const title = fillTemplate(
      String(block.freeLimitReachedTitle || '').trim(),
      vars || {}
    );
    const body = fillTemplate(
      String(block.freeLimitReachedBody || '').trim(),
      vars || {}
    );
    const cta = String(block.freeLimitReachedCta || '').trim();
    const close = String(block.freeLimitReachedClose || '').trim();

    if (!title || !body || typeof this.openModal !== 'function') return false;

    const html = `
      <p class="wt-text-preline">${escapeHtml(body)}</p>
      <div class="wt-actions">
        ${cta ? `<button class="wt-btn wt-btn--primary" data-action="open-paywall">${escapeHtml(cta)}</button>` : ``}
        ${close ? `<button class="wt-btn wt-btn--secondary" data-action="close-modal">${escapeHtml(close)}</button>` : ``}
      </div>
    `;

    this.openModal(html, title, { hideCloseButton: true });
    return true;
  };

  UI.prototype.openRapidFireTicketRequiredModal = function () {
    const w = this.wording || {};
    const sb = w.secretBonus || {};
    const premium = isPremiumNow(this.storage);
    const tickets = getRapidFireTicketBalance(this.storage);
    const cost = getRapidFireTicketCost(this.storage);
    const runsBalance =
      this.storage && typeof this.storage.getRunsBalance === 'function'
        ? clampInt(this.storage.getRunsBalance(), 0, 999)
        : 0;
    const nowDate = new Date();
    const localDayKey = [
      nowDate.getFullYear(),
      String(nowDate.getMonth() + 1).padStart(2, '0'),
      String(nowDate.getDate()).padStart(2, '0')
    ].join('-');
    const earnedToday =
      getDailyTicketEarnedDayKey(this.storage) === localDayKey;

    const title = String(sb.ticketRequiredTitle || '').trim();
    const close = String(
      sb.ticketRequiredClose || w.system?.notNow || w.system?.close || ''
    ).trim();
    const ctaDaily = String(sb.ticketRequiredCtaDaily || '').trim();
    const ctaRun = String(sb.ticketRequiredCtaRun || '').trim();
    const ctaPaywall = String(sb.ticketRequiredCtaPaywall || '').trim();

    let bodyTpl = '';
    let primaryAction = '';
    let primaryLabel = '';

    if (premium && earnedToday) {
      bodyTpl = String(sb.ticketRequiredBodySpentToday || '').trim();
      primaryAction = 'start-run';
      primaryLabel = ctaRun;
    } else if (!premium && runsBalance > 0) {
      bodyTpl = String(sb.ticketRequiredBodyDaily || '').trim();
      primaryAction = 'start-daily-challenge';
      primaryLabel = ctaDaily;
    } else if (premium) {
      bodyTpl = String(sb.ticketRequiredBodyPremium || '').trim();
      primaryAction = 'start-run';
      primaryLabel = ctaRun;
    } else {
      bodyTpl = String(sb.ticketRequiredBodyLocked || '').trim();
      primaryAction = 'open-paywall';
      primaryLabel = ctaPaywall;
    }

    if (!title || !bodyTpl || typeof this.openModal !== 'function')
      return false;

    const body = fillTemplate(bodyTpl, {
      tickets: String(tickets),
      cost: String(cost),
      remaining: String(runsBalance),
      pluralS: tickets > 1 ? 's' : '',
      costPluralS: cost > 1 ? 's' : ''
    });

    const html = `
      <p class="wt-text-preline">${escapeHtml(body)}</p>
      <div class="wt-actions">
        ${primaryAction && primaryLabel ? `<button class="wt-btn wt-btn--primary" data-action="${escapeHtml(primaryAction)}">${escapeHtml(primaryLabel)}</button>` : ``}
        ${close ? `<button class="wt-btn wt-btn--secondary" data-action="close-modal">${escapeHtml(close)}</button>` : ``}
      </div>
    `;

    this.openModal(html, title, { hideCloseButton: true });
    return true;
  };

  // Secret bonus: seen-only bonus run (seenCount > 0).
  // Does NOT consume run economy.
  // IMPORTANT: deck is consumed once (no reshuffle, no loop). BONUS ends when the deck is exhausted.

  UI.prototype.startSecretBonusRun = function () {
    const cfg = this.config || {};
    if (cfg?.secretBonus?.enabled !== true) return;
    const premium = isPremiumNow(this.storage);
    const ticketGate = consumeRapidFireTicketOrBlock(this.storage);
    if (!ticketGate.ok) {
      this.openRapidFireTicketRequiredModal();
      return;
    }

    // Stats snapshot (source of truth for "seen")
    const statsByItem =
      this.storage && typeof this.storage.getStatsByItem === 'function'
        ? this.storage.getStatsByItem()
        : {};

    const srcItems = Array.isArray(this._runtime?.contentItems)
      ? this._runtime.contentItems
      : [];

    // Hook for live stats refresh during run (deck rebuild)
    const getStatsByItem = () => {
      return this.storage && typeof this.storage.getStatsByItem === 'function'
        ? this.storage.getStatsByItem()
        : {};
    };

    const state = this.game.start({
      items: srcItems,
      statsByItem,
      getStatsByItem,
      config: cfg,

      // MUST match game.js contract
      mode: MODES.BONUS
    });

    // No eligible seen-only deck: do nothing unless copy exists (no hardcoded fallback).
    if (state && state.done) {
      const msg = String(
        this.wording?.secretBonus?.noSeenWordsToast || ''
      ).trim();
      if (msg) toastNow(this.config, msg);
      refundRapidFireTicket(this.storage, clampInt(ticketGate.cost, 0, 99));
      return;
    }
    this._runtime.runItemIds = [];
    this._runtime.runMistakeIds = [];
    this._runtime.currentRunNumber = 0;
    this._runtime.currentRunId = generateRunUuid();
    this._runtime.runStartedAt = Date.now();
    this._runtime.currentQuestionShownAt = this._runtime.runStartedAt;
    this._runtime.runAnswerLog = [];
    this._runtime.runMode = MODES.BONUS;
    this._runtime.lastAnswer = null;
    this._runtime.reviewingFeedback = false;
    this._runtime.lastFeedbackReview = null;
    this._runtime.feedbackPending = false;
    this._runtime.feedbackReveal = true;
    this._runtime.gameOverPending = false;
    this._runtime.secretBonusPending = false;
    this._runtime.poolCompleteCelebrationPending = false;

    if (this._runtime.feedbackRevealTimerId) {
      clearRuntimeTimer(this, 'feedbackRevealTimerId');
    }
    if (this._runtime.bonusAnswerFeedbackTimerId) {
      clearRuntimeTimer(this, 'bonusAnswerFeedbackTimerId');
    }
    if (this._runtime.bonusEndTimerId) {
      clearRuntimeTimer(this, 'bonusEndTimerId');
    }
    if (this._runtime.endRecordMomentTimer) {
      clearRuntimeTimer(this, 'endRecordMomentTimer');
    }
    this._runtime.endRecordMomentUntil = 0;

    this._runtime.frozenItem = null;
    this._runtime.shareAnchorId = null;

    // One-shot per run: "New best score" toast (PLAYING)
    this._runtime.newBestScoreToastShown = false;
    // micro-pics reset (run-only)
    let startChances = clampInt(cfg?.game?.maxChances, 1, 99);
    try {
      const gs =
        this.game && typeof this.game.getState === 'function'
          ? this.game.getState() || {}
          : {};
      if (gs.chancesLeft != null)
        startChances = clampInt(gs.chancesLeft, 0, 99);
    } catch (_) {
      /* keep cfg */
    }
    this._runtime.microPics = createMicroPicsState(startChances);

    // input safety
    this._runtime.answerLocked = false;

    // Option A: finish only after Continue
    this._runtime.finishAfterFeedback = false;

    const first = this.game.getCurrent();
    const firstId = Number(first?.id);
    this._runtime.shareAnchorId = Number.isFinite(firstId) ? firstId : null;

    if (state && state.done) {
      this._finishRun();
      return;
    }

    // BONUS: setState first so the game screen renders underneath the overlay.
    // The fall animation is guarded by isOverlayVisible in _secretBonusFallStartOrSync.
    // BONUS: overlay FIRST, then setState. Order matters:
    // render() → _secretBonusFallStartOrSync() checks isOverlayVisible("wt-run-start-overlay").
    // If setState came first, the overlay wouldn't exist yet and the fall would start immediately.
    const bonusExtra = {};
    const tpl = String(
      this.wording?.secretBonus?.startOverlayFreeRunsLimitLine || ''
    ).trim();
    if (tpl) {
      const tickets = getRapidFireTicketBalance(this.storage);
      const cost = getRapidFireTicketCost(this.storage);
      bonusExtra.bonusLimitLine = fillTemplate(tpl, {
        tickets: String(tickets),
        cost: String(cost),
        pluralS: tickets > 1 ? 's' : '',
        costPluralS: cost > 1 ? 's' : ''
      });
    }

    showRunStartOverlay(
      cfg,
      this.wording,
      this.game,
      'BONUS',
      bonusExtra,
      () => {
        // no-op: setState already called below
      }
    );

    this.setState(STATES.PLAYING);
  };

  UI.prototype._scheduleHudPulseCleanup = function () {
    if (!this._runtime) return;

    const ms = Number(this.config?.ui?.gameplayPulseMs);
    if (!Number.isFinite(ms) || ms <= 0) return;

    if (this._runtime.hudPulseCleanupTimerId) {
      clearRuntimeTimer(this, 'hudPulseCleanupTimerId');
    }

    // Clean up HUD pulse classes + deltas without full re-render (avoids layout shift).
    setRuntimeTimer(
      this,
      'hudPulseCleanupTimerId',
      () => {
        if (!this._runtime) return;
        this._runtime.hudPulseCleanupTimerId = null;
        if (this.state !== STATES.PLAYING) return;
        if (this._runtime.gameOverPending === true) return;

        const root = this.appEl || document.getElementById('app');
        if (!root) {
          this.render();
          return;
        }

        let cleaned = false;
        let scoreFlashCleaned = false;

        const chancePill = root.querySelector('.wt-pill--danger-pulse');
        if (chancePill) {
          chancePill.classList.remove('wt-pill--danger-pulse');
          const delta = chancePill.querySelector('.wt-pill__delta');
          if (delta) delta.remove();
          cleaned = true;
        }

        const scorePill = root.querySelector('.wt-pill--score-flash');
        if (scorePill) {
          scorePill.classList.remove('wt-pill--score-flash');
          const delta = scorePill.querySelector('.wt-pill__delta');
          if (delta) delta.remove();
          cleaned = true;
          scoreFlashCleaned = true;
        }

        // Reset timestamps so next render() won't re-add them
        if (this._runtime.chanceLostPulseAt)
          this._runtime.chanceLostPulseAt = 0;
        if (this._runtime.scoreFlashAt) this._runtime.scoreFlashAt = 0;

        // Important: near-best is suppressed while scoreFlashOn is true.
        // When score flash ends, force a render so near-best can appear immediately.
        if (scoreFlashCleaned) {
          this.render();
          return;
        }

        if (!cleaned) this.render();
      },
      Math.floor(ms) + 30
    );
  };

  UI.prototype.answer = function (choiceBool) {
    if (this.state !== STATES.PLAYING) return;
    if (!this._runtime) return;

    // If feedback is already pending, ignore (do NOT lock)
    if (this._runtime.feedbackPending === true) return;

    // HARD LOCK (mobile double tap / double click)
    if (this._runtime.answerLocked === true) return;
    this._runtime.answerLocked = true;

    // Snapshot chances BEFORE answering (for UI animation when a chance disappears)
    let prevChancesLeft = null;
    let prevScoreFP = null;

    try {
      const gsPrev =
        this.game && typeof this.game.getState === 'function'
          ? this.game.getState() || {}
          : {};

      if (gsPrev.chancesLeft != null)
        prevChancesLeft = Number(gsPrev.chancesLeft);

      // Snapshot score BEFORE answering (needed for "new best" crossing detection)
      if (gsPrev.scoreFP != null) prevScoreFP = Number(gsPrev.scoreFP);
    } catch (_) {
      /* silent */
    }

    const frozen =
      this.game && typeof this.game.getCurrent === 'function'
        ? this.game.getCurrent()
        : null;
    this._runtime.frozenItem = frozen;

    const picked = choiceBool === true;
    const res =
      this.game && typeof this.game.answer === 'function'
        ? this.game.answer(picked)
        : null;
    try {
      if (res?.isCorrect === true && res.state?.mode === MODES.RUN &&
          res.state.correctStreak === 4 && window.WT_Analytics) {
        window.WT_Analytics.trackFunnel('combo_unlocked',
          window.WT_Analytics.inferUiContext(this, {
            mode: MODES.RUN,
            run_type: this._runtime.runType || '',
            combo_activations: res.state.comboActivations,
            bonus_points: res.state.bonusPoints,
            score: res.state.scoreFP,
            threshold: 4
          }));
      }
    } catch (_) { /* Analytics must not interrupt gameplay. */ }
    // Flag a short-lived pulse when a chance is lost (CSS owns the actual animation)
    let chanceLost = false;
    let nowChancesLeft = null;

    try {
      const gsNow =
        this.game && typeof this.game.getState === 'function'
          ? this.game.getState() || {}
          : {};
      nowChancesLeft =
        gsNow.chancesLeft != null ? Number(gsNow.chancesLeft) : null;

      chanceLost =
        prevChancesLeft != null &&
        nowChancesLeft != null &&
        Number.isFinite(prevChancesLeft) &&
        Number.isFinite(nowChancesLeft) &&
        nowChancesLeft < prevChancesLeft;

      this._runtime.chanceLostPulseAt = chanceLost ? Date.now() : 0;

      const lastChanceEntered =
        prevChancesLeft != null &&
        nowChancesLeft != null &&
        Number.isFinite(prevChancesLeft) &&
        Number.isFinite(nowChancesLeft) &&
        prevChancesLeft > 1 &&
        nowChancesLeft === 1;
      this._runtime.lastChancePulseAt = lastChanceEntered ? Date.now() : 0;
      // PRACTICE: no score flash (consolidation mode, no performance feedback)
      const isPracticeMode =
        String(this._runtime?.runMode || '').trim() === 'PRACTICE';
      this._runtime.scoreFlashAt =
        !isPracticeMode && res && res.isCorrect === true ? Date.now() : 0;

      // New best (RUN/BONUS + premium): one-shot pulse + toast when you EXCEED the best during PLAYING.
      // Fail-closed: missing config/storage/wording => no celebration.
      try {
        const modeNow = String(this._runtime?.runMode || 'RUN').trim();
        const isRun = modeNow === 'RUN';
        const isBonus = modeNow === 'BONUS';

        const cfg = this.config || {};
        const premium = isPremiumNow(this.storage);
        const pbCfg =
          cfg?.personalBest && typeof cfg.personalBest === 'object'
            ? cfg.personalBest
            : null;
        const pbEnabled = !!(pbCfg && pbCfg.enabled === true);

        const toastMs = Number(cfg?.ui?.newBestScoreToastMs);
        const toastLine = String(
          this.wording?.playing?.newBestScore || ''
        ).trim();

        let bestScoreFP = null;

        if (premium === true && pbEnabled === true && this.storage) {
          if (isRun && typeof this.storage.getPersonalBest === 'function') {
            const pb = this.storage.getPersonalBest() || null;
            const b = Number(pb?.bestScoreFP);
            if (Number.isFinite(b) && b > 0) bestScoreFP = Math.floor(b);
          } else if (
            isBonus &&
            typeof this.storage.getBonusBest === 'function'
          ) {
            const bb = this.storage.getBonusBest() || null;
            const b = Number(bb?.bestScoreFP);
            if (Number.isFinite(b) && b > 0) bestScoreFP = Math.floor(b);
          }
        }

        const gsNow2 =
          this.game && typeof this.game.getState === 'function'
            ? this.game.getState() || {}
            : {};
        const nowScoreFP =
          gsNow2.scoreFP != null ? Number(gsNow2.scoreFP) : NaN;

        const exceeded =
          premium === true &&
          pbEnabled === true &&
          bestScoreFP != null &&
          Number.isFinite(prevScoreFP) &&
          Number.isFinite(nowScoreFP) &&
          prevScoreFP <= bestScoreFP &&
          nowScoreFP > bestScoreFP;

        if (exceeded) {
          // Pulse (already styled via .wt-pill--new-best)
          this._runtime.newBestPulseAt = Date.now();

          // Toast one-shot per run
          const canToast =
            this._runtime.newBestScoreToastShown !== true &&
            toastLine &&
            Number.isFinite(toastMs) &&
            toastMs > 0;

          if (canToast) {
            this._runtime.newBestScoreToastShown = true;

            // New best score: centered gameplay overlay (stronger than toast)
            scheduleGameplayOverlay(toastLine, {
              delayMs: 0,
              durationMs: Math.floor(toastMs),
              variant: 'success',
              mode: modeNow
            });
          }
        }
      } catch (_) {
        /* fail closed */
      }
    } catch (_) {
      chanceLost = false;
      nowChancesLeft = null;
      this._runtime.chanceLostPulseAt = 0;
      this._runtime.lastChancePulseAt = 0;
      this._runtime.scoreFlashAt = 0;
    }

    // Ensure the time-based HUD deltas clear even if nothing else re-renders.
    this._scheduleHudPulseCleanup();

    // If engine didn't answer, unlock (fail-safe)
    if (!res) {
      this._runtime.answerLocked = false;
      return;
    }

    /// One-shot: first-time pool completion (200/200) celebration.
    // Source of truth: storage coverage + persisted "celebrated" flag (not transient engine signal).
    try {
      const runModeNow = String(this._runtime?.runMode || '').trim();
      if (!runModeNow) return;
      const isRunNow = runModeNow === MODES.RUN;
      if (isRunNow) {
        const exhausted = !!(
          this.storage &&
          typeof this.storage.hasSeenAllWordTraps === 'function' &&
          this.storage.hasSeenAllWordTraps() === true
        );

        const alreadyCelebrated = !!(
          this.storage &&
          typeof this.storage.hasPoolCompleteCelebrated === 'function' &&
          this.storage.hasPoolCompleteCelebrated() === true
        );

        if (exhausted && !alreadyCelebrated) {
          if (
            this.storage &&
            typeof this.storage.markPoolCompleteCelebrated === 'function'
          ) {
            this.storage.markPoolCompleteCelebrated();
          }

          if (this._runtime)
            this._runtime.poolCompleteCelebrationPending = true;
          this._finishRun();
          return;
        }
      }
    } catch (_) {}

    // Game over rule (RUN / PRACTICE only):
    // - Freeze immediately
    // - Transition to END is deferred for the *effective* chance-loss overlay duration
    const runModeNow = String(this._runtime?.runMode || '').trim();
    if (!runModeNow) return;
    const isGameOverNow =
      runModeNow !== MODES.BONUS &&
      chanceLost &&
      Number.isFinite(nowChancesLeft) &&
      Number(nowChancesLeft) === 0;

    // Chance state overlays only (Last chance / Game over). No "-1 chance" overlay.
    // RUN/PRACTICE game-over overlays are intentionally deferred until after the fatal feedback is shown.
    if (
      chanceLost &&
      Number.isFinite(nowChancesLeft) &&
      Number(nowChancesLeft) <= 1 &&
      (runModeNow === MODES.BONUS || !isGameOverNow)
    ) {
      showChanceLostOverlay(
        this.config,
        this.wording,
        nowChancesLeft,
        runModeNow
      );
    }

    // Bonus: still sync the HUD on the final mistake (avoid stale "2/3" display on the last error).
    const shouldSyncFinalMistakeHud =
      isGameOverNow ||
      (runModeNow === 'BONUS' &&
        chanceLost &&
        Number.isFinite(nowChancesLeft) &&
        Number(nowChancesLeft) === 0);

    if (shouldSyncFinalMistakeHud) {
      // Sync HUD lives immediately (avoid stale display on the final mistake)
      try {
        const root = this.appEl || document.getElementById('app');
        const pill = root ? root.querySelector('.wt-pill--chances') : null;

        if (pill && Number.isFinite(nowChancesLeft)) {
          const uiW = this.wording && this.wording.ui ? this.wording.ui : {};
          const label = String(uiW.mistakesLabel || '').trim();

          const gs =
            this.game && typeof this.game.getState === 'function'
              ? this.game.getState() || {}
              : {};
          const mcRaw = Number(gs.maxChances || this.config?.game?.maxChances);
          const mc =
            Number.isFinite(mcRaw) && mcRaw > 0 ? Math.floor(mcRaw) : 0;

          const left = Math.max(0, Math.floor(Number(nowChancesLeft)));
          const mistakes = mc > 0 ? Math.max(0, Math.min(mc, mc - left)) : 0;

          const visual =
            mc > 0
              ? Array(mc)
                  .fill(null)
                  .map((_, i) => {
                    const isOn = i < mistakes;
                    const isLast = isOn && mistakes > 0 && i === mistakes - 1;
                    return `<span class="wt-hud-lives__dot${isOn ? '' : ' wt-hud-lives__dot--off'}${isLast ? ' wt-hud-lives__dot--last' : ''}" aria-hidden="true"></span>`;
                  })
                  .join('')
              : '';

          pill.classList.remove('wt-pill--danger-pulse');
          pill.setAttribute(
            'aria-label',
            label ? `${label}: ${mistakes}/${mc}` : `${mistakes}/${mc}`
          );
          pill.innerHTML = `
            ${label ? `<small>${escapeHtml(label)}</small>` : ``}
            ${mistakes}/${mc}
            ${visual}
          `;
        }
      } catch (_) {
        /* silent */
      }
    }

    if (isGameOverNow) {
      // Block renders BEFORE recordAnswer: _save() → _emit() → onStorageUpdated is synchronous.
      // Without this, the dispatched event triggers render() while engine is done → blank screen.
      this._runtime.gameOverPending = true;
    }

    // BONUS game-over guard: block renders BEFORE recordAnswer.
    if (
      res.done === true &&
      String(this._runtime?.runMode || '').trim() === 'BONUS' &&
      Number.isFinite(nowChancesLeft) &&
      Number(nowChancesLeft) === 0
    ) {
      this._runtime.gameOverPending = true;
    }

    // Normal path: record answer immediately
    if (this.storage && typeof this.storage.recordAnswer === 'function') {
      this.storage.recordAnswer(res.itemId, res.isCorrect);
    }
    if (Number.isFinite(Number(res.itemId))) {
      const id = Number(res.itemId);
      const shownAt = Number(
        this._runtime?.currentQuestionShownAt ||
          this._runtime?.runStartedAt ||
          Date.now()
      );
      const answerMs = clampInt(Date.now() - shownAt, 0, 10 * 60 * 1000);
      this._runtime.runItemIds.push(id);
      if (Array.isArray(this._runtime.runAnswerLog)) {
        this._runtime.runAnswerLog.push({
          id,
          answer: picked === true,
          ms: answerMs
        });
      }

      // Track per-run mistakes for END recap (dedup)
      if (res.isCorrect !== true) {
        if (!Array.isArray(this._runtime.runMistakeIds))
          this._runtime.runMistakeIds = [];
        if (this._runtime.runMistakeIds.indexOf(id) === -1)
          this._runtime.runMistakeIds.push(id);
      }
    }

    // micro-pics evaluation happens AFTER the answer is validated (this function is the validation point)
    try {
      this._maybeTriggerMicroPic(res);
    } catch (_) {
      // silent: micro-pics must never break gameplay
    }

    this._runtime.lastAnswer = {
      isCorrect: res.isCorrect === true,
      pickedAnswer: picked,
      correctAnswer:
        res.correctAnswer === true || res.correctAnswer === false
          ? res.correctAnswer
          : null,
      feedbackLine: String(res.feedbackLine || '').trim()
    };

    try {
      if (window.WT_SFX) window.WT_SFX.play(res.isCorrect === true ? 'correct' : 'wrong');
    } catch (_) {
      /* sound is optional */
    }

    // A11Y: announce answer feedback via dedicated live region (avoid full-screen aria-live churn)
    try {
      const liveEl = document.getElementById('answer-feedback');
      if (liveEl) {
        const pw = Object.assign(
          {},
          (this.wording && this.wording.practice && this.wording.practice.playing) || {},
          (this.wording && this.wording.playing) || {}
        );

        const verdictText =
          res.isCorrect === true
            ? String(pw.feedbackTitleOk || '').trim()
            : String(pw.feedbackTitleBad || '').trim();

        const questionText = String(frozen?.question || '').trim();
        const explanation = String(res.feedbackLine || '').trim();

        const parts = [verdictText, questionText, explanation].filter(Boolean);
        const msg = parts.join('. ').replace(/\s+/g, ' ').trim();

        if (msg) {
          liveEl.textContent = '';
          setUiTimer(
            'feedback.live.announce',
            () => {
              liveEl.textContent = msg;
            },
            0,
            'feedback'
          );
        }
      }
    } catch (_) {
      /* silent */
    }

    const runMode = String(this._runtime?.runMode || '').trim();
    if (!runMode) return;
    const sbFeedback = String(this.config?.secretBonus?.feedback || '').trim();

    if (runMode === MODES.BONUS) {
      this._rfOnAnswer(choiceBool, res);

      // Terms-box visual feedback (BONUS): stash verdict, apply after render.
      const bonusFlashClass =
        res.isCorrect === true
          ? 'wt-terms-box--successflash'
          : 'wt-terms-box--mistakeflash';

      // BONUS: no pause between items — immediate fall restart after every answer.

      // End handling: game over or deck exhausted
      if (res.done === true) {
        const endedByGameOver =
          Number.isFinite(nowChancesLeft) && Number(nowChancesLeft) === 0;

        if (endedByGameOver) {
          // Show flash on the fatal answer before transitioning to game over
          const goFlashMsRaw = Number(
            this.config?.secretBonus?.feedbackFlashMs
          );
          const goFlashMs =
            Number.isFinite(goFlashMsRaw) &&
            goFlashMsRaw > 0 &&
            goFlashMsRaw <= 1000
              ? Math.floor(goFlashMsRaw)
              : 0;

          if (goFlashMs > 0) {
            try {
              const root = this.appEl || document.getElementById('app');
              const tb = root ? root.querySelector('.wt-terms-box') : null;
              if (tb) {
                tb.classList.remove(
                  'wt-terms-box--mistakeflash',
                  'wt-terms-box--successflash'
                );
                void tb.offsetWidth;
                tb.classList.add(bonusFlashClass);
              }
            } catch (_) {
              /* silent */
            }

            setRuntimeTimer(
              this,
              'bonusAnswerFeedbackTimerId',
              () => {
                if (!this._runtime) return;
                this._runtime.answerLocked = false;
                this._enterGameOverDelay();
              },
              goFlashMs,
              'feedback'
            );

            return;
          }

          this._runtime.answerLocked = false;
          this._enterGameOverDelay();
          return;
        }

        // Deck exhausted: flash on last answer, then show toast, then END
        const deFlashMsRaw = Number(this.config?.secretBonus?.feedbackFlashMs);
        const deFlashMs =
          Number.isFinite(deFlashMsRaw) &&
          deFlashMsRaw > 0 &&
          deFlashMsRaw <= 1000
            ? Math.floor(deFlashMsRaw)
            : 0;

        // Flash on last item
        if (deFlashMs > 0) {
          try {
            const root = this.appEl || document.getElementById('app');
            const tb = root ? root.querySelector('.wt-terms-box') : null;
            if (tb) {
              tb.classList.remove(
                'wt-terms-box--mistakeflash',
                'wt-terms-box--successflash'
              );
              void tb.offsetWidth;
              tb.classList.add(bonusFlashClass);
            }
          } catch (_) {
            /* silent */
          }
        }

        const bonusTiming = getToastTiming(this.config);
        const bonusDurationMs = bonusTiming ? bonusTiming.durationMs : null;
        const msg = String(
          this.wording?.secretBonus?.endDeckExhaustedToast || ''
        ).trim();

        const hasToast = !!(msg && bonusDurationMs != null);
        const toastMs = hasToast ? Math.max(0, Math.floor(bonusDurationMs)) : 0;

        // Total delay: flash + toast (sequential)
        const totalDelayMs = deFlashMs + toastMs;

        this._runtime.feedbackPending = false;
        this._runtime.lastAnswer = null;
        this._runtime.frozenItem = null;
        this._runtime.finishAfterFeedback = false;

        if (totalDelayMs > 0) {
          if (this._runtime.bonusEndTimerId) {
            clearRuntimeTimer(this, 'bonusEndTimerId');
            this._runtime.bonusEndTimerId = null;
          }

          // After flash delay, show toast then transition
          setRuntimeTimer(
            this,
            'bonusEndTimerId',
            () => {
              if (!this._runtime) return;
              this._runtime.bonusEndTimerId = null;

              if (hasToast) {
                cancelScheduledToast();
                if (this._beforeUnloadHandler) {
                  window.removeEventListener(
                    'beforeunload',
                    this._beforeUnloadHandler
                  );
                  this._beforeUnloadHandler = null;
                }
                showGameplayOverlay(msg, {
                  durationMs: Math.floor(toastMs),
                  variant: 'success',
                  cfg: this.config,
                  mode: MODES.BONUS
                });

                setRuntimeTimer(
                  this,
                  'bonusEndTimerId',
                  () => {
                    if (this._runtime) this._runtime.bonusEndTimerId = null;
                    this._runtime.answerLocked = false;
                    this._finishRun();
                  },
                  toastMs
                );

                return;
              }

              this._runtime.answerLocked = false;
              this._finishRun();
            },
            deFlashMs
          );

          return;
        }

        this._runtime.answerLocked = false;
        this._finishRun();
        return;
      }

      // Not done: flash on CURRENT terms-box, then swap words in place after delay.
      const feedbackFlashMsRaw = Number(
        this.config?.secretBonus?.feedbackFlashMs
      );
      const feedbackFlashMs =
        Number.isFinite(feedbackFlashMsRaw) &&
        feedbackFlashMsRaw > 0 &&
        feedbackFlashMsRaw <= 1000
          ? Math.floor(feedbackFlashMsRaw)
          : 0;

      // Apply flash on current item (DOM not yet rebuilt)
      try {
        const root = this.appEl || document.getElementById('app');
        const tb = root ? root.querySelector('.wt-terms-box') : null;
        if (tb) {
          tb.classList.remove(
            'wt-terms-box--mistakeflash',
            'wt-terms-box--successflash'
          );
          void tb.offsetWidth;
          tb.classList.add(bonusFlashClass);
        }
      } catch (_) {
        /* silent */
      }

      if (feedbackFlashMs > 0) {
        setRuntimeTimer(
          this,
          'bonusAnswerFeedbackTimerId',
          () => {
            if (!this._runtime) return;
            if (this.state !== STATES.PLAYING) return;
            if (String(this._runtime?.runMode || '').trim() !== 'BONUS') return;

            this._runtime.answerLocked = false;

            // Swap words in place (no full innerHTML rebuild)
            try {
              const nextItem =
                this.game && typeof this.game.getCurrent === 'function'
                  ? this.game.getCurrent()
                  : null;
              if (nextItem) {
                const root = this.appEl || document.getElementById('app');
                const words = root
                  ? root.querySelectorAll('.wt-term-word')
                  : [];
                if (words.length >= 1) {
                  words[0].textContent = String(nextItem.question || '').trim();
                }

                const sbf = this._runtime?.secretBonusFall;
                if (sbf) {
                  sbf.itemKey = '';
                  sbf.y01 = 0;
                  sbf.lastTs = 0;
                  sbf.wasInWarning = false;
                }

                // Remove flash class
                const tb = root ? root.querySelector('.wt-terms-box') : null;
                if (tb) {
                  tb.classList.remove(
                    'wt-terms-box--mistakeflash',
                    'wt-terms-box--successflash'
                  );
                  tb.style.transform = 'translate3d(0px, 0px, 0px)';
                }
                this._runtime.currentQuestionShownAt = Date.now();
              }
            } catch (_) {
              /* silent */
            }

            try {
              this._secretBonusFallStartOrSync();
            } catch (_) {
              /* silent */
            }

            try {
              this._secretBonusFallStartOrSync();
            } catch (_) {
              /* silent */
            }
          },
          feedbackFlashMs,
          'feedback'
        );

        return;
      }

      // Fallback: no flash configured, immediate render
      this._runtime.answerLocked = false;
      this._runtime.currentQuestionShownAt = Date.now();
      this.render();

      try {
        this._secretBonusFallStartOrSync();
      } catch (_) {
        /* silent */
      }

      return;
    }

    // Default flow (Option A): show feedback and wait for Continue.
    // UX: if a chance was lost, give Chances a short solo moment before showing the feedback block.
    if (this._runtime.feedbackRevealTimerId) {
      clearRuntimeTimer(this, 'feedbackRevealTimerId');
    }

    if (runMode === MODES.PRACTICE && res.done === true) {
      this._runtime.feedbackPending = true;
      this._runtime.finishAfterFeedback = true;
    }

    this._runtime.feedbackPending = true;
    // If last item, do NOT end immediately. End after Continue.
    this._runtime.finishAfterFeedback = res.done === true;
    this._runtime.autoGameOverAfterFeedback = isGameOverNow;

    // Single source of truth for timing: WT_CONFIG.ui.toast (schema plat)
    const timing = getToastTiming(this.config);
    const focusMs = timing ? Number(timing.delayMs) : NaN;
    const postFeedbackTiming = getToastTiming(this.config, 'scoreGained');
    const postFeedbackMsRaw = postFeedbackTiming
      ? Number(postFeedbackTiming.durationMs)
      : NaN;
    const postFeedbackMs =
      Number.isFinite(postFeedbackMsRaw) &&
      postFeedbackMsRaw >= 600 &&
      postFeedbackMsRaw <= 2000
        ? Math.floor(postFeedbackMsRaw)
        : 900;
    const allowManualFatalContinue = isGameOverNow && runMode === MODES.RUN;
    const fatalAutoDelayMs = allowManualFatalContinue
      ? Math.max(postFeedbackMs, 1600)
      : postFeedbackMs;

    const scheduleFatalGameOver = () => {
      if (!isGameOverNow) return;
      if (!this._runtime) return;

      if (this._runtime.gameOverAfterFeedbackTimerId) {
        clearRuntimeTimer(this, 'gameOverAfterFeedbackTimerId');
        this._runtime.gameOverAfterFeedbackTimerId = null;
      }

      setRuntimeTimer(
        this,
        'gameOverAfterFeedbackTimerId',
        () => {
          if (!this._runtime) return;
          this._runtime.gameOverAfterFeedbackTimerId = null;
          if (this.state !== STATES.PLAYING) return;
          if (this._runtime.feedbackPending !== true) return;

          showChanceLostOverlay(
            this.config,
            this.wording,
            nowChancesLeft,
            runModeNow
          );
          this._runtime.autoGameOverAfterFeedback = false;
          this._enterGameOverDelay();
        },
        fatalAutoDelayMs
      );
    };

    const introCountRaw = Number(
      this.config?.ui?.feedbackAutoAdvanceIntroCount
    );
    const introCount =
      Number.isFinite(introCountRaw) && introCountRaw >= 1 && introCountRaw <= 99
        ? Math.floor(introCountRaw)
        : 3;
    const answeredCount = Array.isArray(this._runtime?.runItemIds)
      ? this._runtime.runItemIds.length
      : 0;
    const configuredAutoAdvanceMs =
      answeredCount <= introCount
        ? this.config?.ui?.feedbackAutoAdvanceMs
        : this.config?.ui?.feedbackAutoAdvanceAfterIntroMs;
    const autoAdvanceMsRaw = Number(configuredAutoAdvanceMs);
    const autoAdvanceMs =
      Number.isFinite(autoAdvanceMsRaw) &&
      autoAdvanceMsRaw >= 1800 &&
      autoAdvanceMsRaw <= 6000
        ? Math.floor(autoAdvanceMsRaw)
        : 3200;
    const scheduleFeedbackAutoAdvance = () => {
      if (isGameOverNow) return;
      if (!this._runtime || this._runtime.feedbackPending !== true) return;
      if (this._runtime.feedbackAutoAdvanceTimerId) {
        clearRuntimeTimer(this, 'feedbackAutoAdvanceTimerId');
      }
      setRuntimeTimer(
        this,
        'feedbackAutoAdvanceTimerId',
        () => {
          if (!this._runtime || this._runtime.feedbackPending !== true) return;
          this.continueAfterFeedback();
        },
        autoAdvanceMs,
        'feedback'
      );
    };

    // UX: only apply the "solo moment" if timing is explicitly valid in WT_CONFIG.ui.toast
    if (chanceLost && Number.isFinite(focusMs) && focusMs > 0) {
      this._runtime.feedbackReveal = false;
      this.render();

      setRuntimeTimer(
        this,
        'feedbackRevealTimerId',
        () => {
          if (!this._runtime) return;
          if (this.state !== STATES.PLAYING) return;
          if (this._runtime.feedbackPending !== true) return;

          this._runtime.feedbackRevealTimerId = null;
          this._runtime.feedbackReveal = true;
          this.render();
          scheduleFatalGameOver();
          scheduleFeedbackAutoAdvance();
        },
        Math.floor(focusMs)
      );

      return;
    }

    this._runtime.feedbackReveal = true;
    this.render();
    scheduleFatalGameOver();
    scheduleFeedbackAutoAdvance();

    try {
      const normalFlashClass =
        res.isCorrect === true
          ? 'wt-terms-box--successflash'
          : 'wt-terms-box--mistakeflash';

      window.requestAnimationFrame(() => {
        const root = this.appEl || document.getElementById('app');
        const tb = root ? root.querySelector('.wt-terms-box') : null;
        if (!tb) return;

        tb.classList.remove(
          'wt-terms-box--mistakeflash',
          'wt-terms-box--successflash'
        );
        void tb.offsetWidth;
        tb.classList.add(normalFlashClass);
      });
    } catch (_) {
      /* silent */
    }
  };

  UI.prototype.continueAfterFeedback = function () {
    if (this.state !== STATES.PLAYING) return;
    if (!this._runtime || !this._runtime.feedbackPending) return;

    if (this._runtime.autoGameOverAfterFeedback === true) {
      if (this._runtime.gameOverAfterFeedbackTimerId) {
        clearRuntimeTimer(this, 'gameOverAfterFeedbackTimerId');
        this._runtime.gameOverAfterFeedbackTimerId = null;
      }

      showChanceLostOverlay(
        this.config,
        this.wording,
        0,
        String(this._runtime?.runMode || '').trim()
      );
      this._runtime.autoGameOverAfterFeedback = false;
      this._enterGameOverDelay();
      return;
    }

    if (this._runtime.reviewingFeedback === true) {
      if (this._runtime.feedbackAutoAdvanceTimerId) {
        clearRuntimeTimer(this, 'feedbackAutoAdvanceTimerId');
      }
      this._runtime.feedbackPending = false;
      this._runtime.feedbackReveal = true;
      this._runtime.feedbackAutoAdvancePaused = false;
      this._runtime.reviewingFeedback = false;
      this._runtime.lastAnswer = null;
      this._runtime.frozenItem = null;
      this._runtime.answerLocked = false;
      this.render();
      return;
    }

    const shouldFinish = this._runtime.finishAfterFeedback === true;

    if (!shouldFinish && this._runtime.frozenItem && this._runtime.lastAnswer) {
      this._runtime.lastFeedbackReview = {
        item: this._runtime.frozenItem,
        answer: { ...this._runtime.lastAnswer }
      };
    }

    // leaving feedback: cancel any pending (not-yet-shown) toast to avoid cross-state surprises
    cancelScheduledToast();

    if (this._runtime.feedbackRevealTimerId) {
      clearRuntimeTimer(this, 'feedbackRevealTimerId');
    }

    if (this._runtime.feedbackAutoAdvanceTimerId) {
      clearRuntimeTimer(this, 'feedbackAutoAdvanceTimerId');
    }

    this._runtime.feedbackPending = false;
    this._runtime.feedbackReveal = true;
    this._runtime.feedbackAutoAdvancePaused = false;
    this._runtime.reviewingFeedback = false;
    this._runtime.lastAnswer = null;
    this._runtime.frozenItem = null;
    this._runtime.finishAfterFeedback = false;
    this._runtime.autoGameOverAfterFeedback = false;

    // unlock answers for next item
    this._runtime.answerLocked = false;

    // Clear stale pulse timestamps + cancel cleanup timer (prevents animation restart on next render)
    this._runtime.chanceLostPulseAt = 0;
    this._runtime.scoreFlashAt = 0;
    if (this._runtime.hudPulseCleanupTimerId) {
      clearRuntimeTimer(this, 'hudPulseCleanupTimerId');
    }

    if (shouldFinish) {
      this._finishRun();
      return;
    }

    this._runtime.currentQuestionShownAt = Date.now();
    this.render();
  };

  UI.prototype.reviewLastFeedback = function () {
    if (this.state !== STATES.PLAYING) return;
    const review = this._runtime?.lastFeedbackReview;
    if (!review || !review.item || !review.answer) return;

    if (this._runtime.feedbackAutoAdvanceTimerId) {
      clearRuntimeTimer(this, 'feedbackAutoAdvanceTimerId');
    }
    this._runtime.reviewingFeedback = true;
    this._runtime.feedbackPending = true;
    this._runtime.feedbackReveal = true;
    this._runtime.feedbackAutoAdvancePaused = true;
    this._runtime.frozenItem = review.item;
    this._runtime.lastAnswer = { ...review.answer };
    this._runtime.answerLocked = true;
    this.render();
  };

  // ============================================
  // Game-over delay (factored — all modes)
  // ============================================
  // Single entry point for the "freeze PLAYING → wait for overlay → END" transition.
  // Contract:
  //   1. Block all renders (gameOverPending)
  //   2. Lock input (answerLocked) — prevents fall-timeout or tap during delay
  //   3. Stop fall animation (BONUS only, idempotent elsewhere)
  //   4. Cancel overlay auto-hide timer (overlay stays until render() leaves PLAYING)
  //   5. Clear feedback state (frozenItem, lastAnswer, feedbackPending)
  //   6. Cancel any pending feedback-reveal timer
  //   7. Schedule _finishRun after overlay duration (or immediate if config invalid)
  //
  // Callers must still:
  //   - Show the overlay BEFORE calling this (showChanceLostOverlay)
  //   - Record the answer to storage BEFORE calling this
  //   - Sync HUD if needed BEFORE calling this
  UI.prototype._enterGameOverDelay = function () {
    if (!this._runtime) {
      this._finishRun();
      return;
    }

    // 1. Block renders
    this._runtime.gameOverPending = true;

    // 2. Lock input
    this._runtime.answerLocked = true;

    // 3. Stop fall animation (idempotent if not running / not BONUS)
    this._secretBonusFallStop();

    // 4. Cancel overlay auto-hide timer
    clearUiTimer('overlay.chance.hide');

    // 5. Clear feedback state
    this._runtime.feedbackPending = false;
    this._runtime.feedbackReveal = true;
    this._runtime.lastAnswer = null;
    this._runtime.frozenItem = null;
    this._runtime.finishAfterFeedback = false;

    // 6. Cancel pending feedback-reveal timer
    if (this._runtime.feedbackRevealTimerId) {
      clearRuntimeTimer(this, 'feedbackRevealTimerId');
    }
    if (this._runtime.gameOverAfterFeedbackTimerId) {
      clearRuntimeTimer(this, 'gameOverAfterFeedbackTimerId');
    }

    // 7. Schedule _finishRun after overlay duration
    // Duration source of truth: WT_CONFIG.ui.chanceLostOverlayMs + gameplayPulseMs (game over extension)
    const baseDurationMs = Number(this.config?.ui?.chanceLostOverlayMs);

    // One-shot hook used by the chance-lost overlay to skip immediately to END on tap.
    try {
      window.__wtGameOverSkipToEnd = null;
    } catch (_) {}

    if (
      Number.isFinite(baseDurationMs) &&
      baseDurationMs >= 200 &&
      baseDurationMs <= 3000
    ) {
      let durationMs = baseDurationMs;

      const extraMs = Number(this.config?.ui?.gameplayPulseMs);
      if (Number.isFinite(extraMs) && extraMs >= 0 && extraMs <= 2000) {
        durationMs = baseDurationMs + Math.floor(extraMs);
      }
      if (durationMs > 3000) durationMs = 3000;

      // Cancel any existing end timer (idempotent)
      if (this._runtime.bonusEndTimerId) {
        clearRuntimeTimer(this, 'bonusEndTimerId');
        this._runtime.bonusEndTimerId = null;
      }

      try {
        window.__wtGameOverSkipToEnd = () => {
          if (this.state !== STATES.PLAYING) return;

          if (this._runtime && this._runtime.bonusEndTimerId) {
            clearRuntimeTimer(this, 'bonusEndTimerId');
            this._runtime.bonusEndTimerId = null;
          }

          try {
            window.__wtGameOverSkipToEnd = null;
          } catch (_) {}

          if (this._runtime) this._runtime.gameOverPending = false;
          this._finishRun();
        };
      } catch (_) {}

      setRuntimeTimer(
        this,
        'bonusEndTimerId',
        () => {
          if (this._runtime) this._runtime.bonusEndTimerId = null;
          try {
            window.__wtGameOverSkipToEnd = null;
          } catch (_) {}

          if (this.state !== STATES.PLAYING) return;
          if (this._runtime) this._runtime.gameOverPending = false;
          this._finishRun();
        },
        Math.floor(durationMs)
      );
    } else {
      // Fail-safe: invalid config → end immediately
      try {
        window.__wtGameOverSkipToEnd = null;
      } catch (_) {}
      this._runtime.gameOverPending = false;
      this._finishRun();
    }
  };

  UI.prototype._finishRun = function () {
    // Idempotent: if we're already in END, do nothing (prevents "double END screen" from late timers)
    if (this.state === STATES.END) return;
    if (this._runtime?.finishingRun === true) return;

    // Block storage-triggered renders during _finishRun (recordRunComplete + markPostCompletion
    // both call _save() → _emit() → onStorageUpdated() → render() while still in PLAYING).
    if (this._runtime) this._runtime.finishingRun = true;

    try {
      window.__wtGameOverSkipToEnd = null;
    } catch (_) {
      /* silent */
    }

    cleanupPlayingExit(this, { keepChanceOverlayVisible: true });

    // Snapshot result BEFORE clearing runtime
    const gameState = this.game.getState ? this.game.getState() : {};
    const scoreFP = Number(gameState.scoreFP || 0);
    const maxChances = Number(gameState.maxChances || 0);
    const chancesLeft =
      gameState.chancesLeft != null ? Number(gameState.chancesLeft) : null;

    const mode = String(this._runtime?.runMode || '').trim();
    const finalMaxStreak = clampInt(
      Math.max(
        Number(this._runtime?.microPics?.maxCorrectStreakDisplayed || 0),
        Number(this._runtime?.microPics?.maxCorrectStreak || 0)
      ),
      0,
      9999
    );

    // Single source of truth: storage.js (V2)
    // - PB + history are handled by StorageManager.recordRunComplete()

    let newBest = false;
    let bestScoreFP = 0;
    let dailyChallengeCompleted = false;
    let dailyTicketAwarded = false;
    let dailyTicketAtCap = false;
    let dailyTicketBalance = getRapidFireTicketBalance(this.storage);
    let dailyTicketDayKey = '';
    let dailyTargetScore = 0;
    let levelProgress = {
      previousLevel: 0,
      currentLevel: 0,
      unlockedLevel: 0,
      justUnlocked: false
    };

    if (
      mode === 'RUN' &&
      this.storage &&
      typeof this.storage.recordRunComplete === 'function'
    ) {
      const nextRunNumber = clampInt(
        this._runtime?.currentRunNumber,
        0,
        999999999
      );
      const priorBestScoreFP =
        this.storage && typeof this.storage.getPersonalBest === 'function'
          ? clampInt(this.storage.getPersonalBest()?.bestScoreFP, 0, 99999)
          : 0;
      const priorDailyModel = getDailyChallengeModel(
        this.config || {},
        this.wording || {},
        priorBestScoreFP,
        this.storage
      );

      let newSeenCount = 0;
      try {
        if (typeof this.storage.getItemStats === 'function') {
          const uniqueRunIds = Array.isArray(this._runtime?.runItemIds)
            ? Array.from(
                new Set(
                  this._runtime.runItemIds
                    .map((id) => Number(id))
                    .filter((id) => Number.isFinite(id) && id > 0)
                )
              )
            : [];

          for (const id of uniqueRunIds) {
            const stats = this.storage.getItemStats(id);
            if (stats && Number(stats.seenCount) === 1) {
              newSeenCount += 1;
            }
          }
        }
      } catch (_) {
        newSeenCount = 0;
      }

      const res = this.storage.recordRunComplete(nextRunNumber, scoreFP, {
        mode: 'RUN',
        maxChances: Number(maxChances || 0),
        chancesLeft: chancesLeft == null ? null : Number(chancesLeft),
        newSeenCount: clampInt(newSeenCount, 0, 99999),
        maxCorrectStreak: finalMaxStreak,
        endedFrom: 'ui'
      });

      newBest = !!(res && res.newBest);
      bestScoreFP = Number((res && res.bestScoreFP) || 0);

      try {
        const isPrem = isPremiumNow(this.storage);
        const isLastFreeRun =
          String(this._runtime?.runType || '').trim() === 'LAST_FREE';
        dailyTargetScore = clampInt(priorDailyModel?.targetScore, 0, 99999);
        dailyChallengeCompleted = scoreFP >= Math.max(1, dailyTargetScore);
        dailyTicketDayKey = String(priorDailyModel?.dayKey || '').trim();

        if (
          dailyChallengeCompleted &&
          dailyTicketDayKey &&
          getDailyTicketEarnedDayKey(this.storage) !== dailyTicketDayKey &&
          (isPrem || isLastFreeRun)
        ) {
          const rewardRes = grantDailyRapidFireTicket(
            this.storage,
            dailyTicketDayKey
          );
          dailyTicketAwarded = !!rewardRes?.granted;
          dailyTicketAtCap = !!rewardRes?.atCap;
          dailyTicketBalance = clampInt(rewardRes?.balance, 0, 999);
        } else {
          dailyTicketBalance = getRapidFireTicketBalance(this.storage);
        }
      } catch (_) {
        dailyChallengeCompleted = false;
        dailyTicketAwarded = false;
        dailyTicketAtCap = false;
        dailyTicketBalance = getRapidFireTicketBalance(this.storage);
        dailyTicketDayKey = '';
      }
    } else if (
      mode === 'BONUS' &&
      this.storage &&
      typeof this.storage.recordBonusComplete === 'function'
    ) {
      const res = this.storage.recordBonusComplete(scoreFP, {
        mode: 'BONUS',
        maxChances: Number(maxChances || 0),
        chancesLeft: chancesLeft == null ? null : Number(chancesLeft),
        endedFrom: 'ui'
      });

      newBest = !!(res && res.newBest);
      bestScoreFP = Number((res && res.bestScoreFP) || 0);
    }

    if (
      this.storage &&
      typeof this.storage.updateLevelProgression === 'function'
    ) {
      try {
        levelProgress =
          this.storage.updateLevelProgression({
            mode,
            scoreFP,
            totalPresented: Array.isArray(this._runtime?.runItemIds)
              ? this._runtime.runItemIds.length
              : 0
          }) || levelProgress;
      } catch (_) {
        /* silent */
      }
    }

    if (this._runtime?.landingRunCompletionPending) {
      if (
        mode !== 'BONUS' &&
        this.storage &&
        typeof this.storage.markLandingNextRunCompleted === 'function'
      ) {
        try {
          this.storage.markLandingNextRunCompleted();
        } catch (_) {
          /* silent */
        }
      }
      this._runtime.landingRunCompletionPending = false;
    }

    // Store for END screen
    this._runtime.lastRun = {
      mode,
      runType: String(this._runtime?.runType || '').trim(),
      freeRunNumber: mode === MODES.RUN ? this._runtime.freeRunNumber : null,
      runId: String(this._runtime?.currentRunId || '').trim(),
      runNumber: clampInt(this._runtime?.currentRunNumber, 0, 999999999),
      durationMs: clampInt(
        Date.now() - Number(this._runtime?.runStartedAt || Date.now()),
        0,
        24 * 60 * 60 * 1000
      ),
      scoreFP,
      maxChances,
      chancesLeft,
      newBest,
      correctCount: Number(gameState.correctCount || 0),
      bonusPoints: Number(gameState.bonusPoints || 0),
      comboActivations: Number(gameState.comboActivations || 0),
      bestScoreFP,
      maxCorrectStreak: finalMaxStreak,
      mistakeIds: Array.isArray(this._runtime.runMistakeIds)
        ? this._runtime.runMistakeIds.slice()
        : [],
      runItemIds: Array.isArray(this._runtime.runItemIds)
        ? this._runtime.runItemIds.slice()
        : [],
      dailyChallengeCompleted,
      dailyTargetScore,
      dailyTicketAwarded,
      dailyTicketAtCap,
      dailyTicketBalance,
      dailyTicketDayKey,
      answerLog: Array.isArray(this._runtime.runAnswerLog)
        ? this._runtime.runAnswerLog.slice()
        : [],
      poolCompleteCelebration: !!this._runtime?.poolCompleteCelebrationPending,
      levelProgress
    };

    try {
      if (
        mode !== MODES.BONUS &&
        window.WT_Analytics &&
        typeof window.WT_Analytics.trackFunnel === 'function' &&
        typeof window.WT_Analytics.inferUiContext === 'function'
      ) {
        window.WT_Analytics.trackFunnel(
          'run_complete',
          window.WT_Analytics.inferUiContext(this, {
            mode,
            run_type: this._runtime.lastRun.runType || '',
            free_run_number: this._runtime.lastRun.freeRunNumber,
            challenge_kind: mode === MODES.RUN ? this._runtime.challengeKind : '',
            ...(mode === MODES.RUN ? {
              combo_reached: Number(gameState.comboActivations || 0) > 0,
              combo_activations: Number(gameState.comboActivations || 0),
              bonus_points: Number(gameState.bonusPoints || 0),
              max_correct_streak: finalMaxStreak
            } : {})
          })
        );
      }
    } catch (_) {
      /* silent */
    }

    try {
      void this.submitLeaderboardRun(this._runtime.lastRun).then((res) => {
        if (
          window.WT_UI_Leaderboard &&
          typeof window.WT_UI_Leaderboard.handleSubmitResult === 'function'
        ) {
          window.WT_UI_Leaderboard.handleSubmitResult(this, res, {
            clampInt,
            fillTemplate,
            toastNow
          });
        }
      });
    } catch (_) {
      /* silent */
    }

    // Consume one-shot runtime flag
    if (this._runtime) this._runtime.poolCompleteCelebrationPending = false;

    // Clear feedback state
    this._runtime.feedbackPending = false;
    this._runtime.lastAnswer = null;
    this._runtime.frozenItem = null;
    this._runtime.finishAfterFeedback = false;
    this._runtime.autoGameOverAfterFeedback = false;
    this._runtime.answerLocked = false;

    // BONUS returns to END (no separate BONUS_END state)
    // Persist post-completion milestone state when the full pool is exhausted.
    try {
      const exhausted = !!(
        this.storage &&
        typeof this.storage.hasSeenAllWordTraps === 'function' &&
        this.storage.hasSeenAllWordTraps() === true
      );

      if (
        exhausted &&
        this.storage &&
        typeof this.storage.markPostCompletionSeenOnce === 'function'
      ) {
        this.storage.markPostCompletionSeenOnce();
      }
    } catch (_) {
      /* silent */
    }

    const fromPlaying = this.state === STATES.PLAYING;

    // Default behavior (BONUS -> END, etc.)
    if (!fromPlaying) {
      if (this._runtime) this._runtime.finishingRun = false;
      this.setState(STATES.END);
      return;
    }

    // Respect reduced motion
    let reduceMotion = false;
    try {
      reduceMotion = !!(
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    } catch (_) {
      reduceMotion = false;
    }

    const app = el('app');
    if (!app || reduceMotion) {
      if (this._runtime) this._runtime.finishingRun = false;
      this.setState(STATES.END);
      return;
    }

    const FADE_MS = 200;

    try {
      app.classList.add('transitioning'); // block interactions during fade
      app.classList.add('wt-fade');
      app.classList.remove('wt-fade--in');
      app.classList.add('wt-fade--out');
    } catch (_) {
      if (this._runtime) this._runtime.finishingRun = false;
      this.setState(STATES.END);
      return;
    }
    setRuntimeTimer(
      this,
      'finishFadeOutTimerId',
      () => {
        if (this._runtime) this._runtime.finishFadeOutTimerId = null;
        if (this._runtime) this._runtime.finishingRun = false;
        this.setState(STATES.END);

        setRuntimeTimer(
          this,
          'finishFadeInStartTimerId',
          () => {
            if (this._runtime) this._runtime.finishFadeInStartTimerId = null;
            const a = el('app');
            if (!a) return;

            try {
              a.classList.add('wt-fade');
              a.classList.remove('wt-fade--out');
              a.classList.add('wt-fade--in');
            } catch (_) {}

            setRuntimeTimer(
              this,
              'finishFadeCleanupTimerId',
              () => {
                if (this._runtime)
                  this._runtime.finishFadeCleanupTimerId = null;
                const b = el('app');
                if (!b) return;
                try {
                  b.classList.remove('wt-fade');
                  b.classList.remove('wt-fade--out');
                  b.classList.remove('wt-fade--in');
                  b.classList.remove('transitioning'); // restore interactions
                } catch (_) {}
              },
              FADE_MS + 40
            );
          },
          0
        );
      },
      FADE_MS
    );
  };

  // ============================================
  // Paywall
  // ============================================
