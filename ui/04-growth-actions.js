UI.prototype._startPaywallTicker = function () {
    if (
      !window.WT_UI_Checkout ||
      typeof window.WT_UI_Checkout.startPaywallTicker !== 'function'
    ) {
      throw new Error('WT_UI_Checkout.startPaywallTicker missing');
    }
    return window.WT_UI_Checkout.startPaywallTicker(this, {
      syncScopedRenderTicker,
      shouldRefreshPaywallTimer,
      isEarlyPriceWindowActive,
      clearUiTimer
    });
  };

  UI.prototype._stopPaywallTicker = function () {
    if (
      !window.WT_UI_Checkout ||
      typeof window.WT_UI_Checkout.stopPaywallTicker !== 'function'
    ) {
      throw new Error('WT_UI_Checkout.stopPaywallTicker missing');
    }
    return window.WT_UI_Checkout.stopPaywallTicker(this, { clearUiTimer });
  };

  UI.prototype.checkout = function (priceKey, event) {
    if (
      !window.WT_UI_Checkout ||
      typeof window.WT_UI_Checkout.checkout !== 'function'
    ) {
      throw new Error('WT_UI_Checkout.checkout missing');
    }
    return window.WT_UI_Checkout.checkout(this, priceKey, event, {
      isOnline,
      toastNow
    });
  };

  // (deleted) legacy share-clicked event removed per spec

  // Single source of truth for share text (used by preview + copy)
  UI.prototype._getShareText = function () {
    if (
      !window.WT_UI_Share ||
      typeof window.WT_UI_Share.getShareText !== 'function'
    ) {
      throw new Error('WT_UI_Share.getShareText missing');
    }
    return window.WT_UI_Share.getShareText(this, { clampInt });
  };

  UI.prototype.copyShareText = async function () {
    if (!window.WT_UI_Share || typeof window.WT_UI_Share.copy !== 'function') {
      throw new Error('WT_UI_Share.copy missing');
    }
    return window.WT_UI_Share.copy(this, { clampInt, toastNow });
  };

  UI.prototype.sendShareViaEmail = function () {
    if (
      !window.WT_UI_Share ||
      typeof window.WT_UI_Share.sendEmail !== 'function'
    ) {
      throw new Error('WT_UI_Share.sendEmail missing');
    }
    return window.WT_UI_Share.sendEmail(this, { clampInt });
  };

  UI.prototype.shareNative = function () {
    if (!window.WT_UI_Share || typeof window.WT_UI_Share.shareNative !== 'function') {
      return Promise.resolve({ ok: false, reason: 'UNAVAILABLE' });
    }
    return window.WT_UI_Share.shareNative(this, { clampInt, toastNow });
  };

  UI.prototype.shareLeaderboard = async function () {
    if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return;
    const wording = this.wording?.leaderboard || {};
    const base = String(this.config?.identity?.appUrl || '').trim();
    if (!base) return;

    try {
      const url = new URL(base);
      url.searchParams.set('wt-source', 'leaderboard');
      const text = String(wording.shareText || '').replace('{url}', url.toString());
      await navigator.share({
        title: String(this.config?.identity?.appName || '').trim(),
        text
      });
      if (window.WT_Analytics?.trackFunnel) {
        window.WT_Analytics.trackFunnel(
          'leaderboard_share',
          window.WT_Analytics.inferUiContext(this, { share_channel: 'native' })
        );
      }
    } catch (_) {
      /* cancelled or unavailable */
    }
  };

  UI.prototype.dismissShareBonusOffer = function () {
    this._runtime = this._runtime || {};
    if (this._runtime.shareBonusDismissed === true) return;
    this._runtime.shareBonusDismissed = true;
    this.closeModal();
    this.render();
  };

  UI.prototype.isShareBonusOfferEligible = function () {
    const cfg = this.config || {};
    const shareBonusCfg = cfg.shareBonus || {};
    if (shareBonusCfg.enabled !== true) return false;
    if (shareBonusCfg.premiumOnly === true && !isPremiumNow(this.storage)) {
      return false;
    }
    if (isPremiumNow(this.storage)) return false;

    try {
      if (
        this.storage &&
        typeof this.storage.hasShareBonusGranted === 'function' &&
        this.storage.hasShareBonusGranted() === true
      ) {
        return false;
      }
    } catch (_) {
      return false;
    }

    try {
      if (this.storage && typeof this.storage.getRunsBalance === 'function') {
        const balance = Number(this.storage.getRunsBalance());
        return Number.isFinite(balance) && balance <= 0;
      }
    } catch (_) {
      return false;
    }

    return false;
  };

  UI.prototype.maybeOpenShareBonusModalAfterPaywallDismiss = function () {
    this._runtime = this._runtime || {};
    if (this._runtime.shareBonusDismissed === true) return false;
    const pending = this._runtime.shareBonusModalPending === true;
    if (this._runtime.shareBonusModalShown === true && !pending) return false;
    if (!this.isShareBonusOfferEligible()) return false;
    if (typeof this.openModal !== 'function') return false;

    const shareBonusW = this.wording?.shareBonus || {};
    const title = String(shareBonusW.title || '').trim();
    const body = String(shareBonusW.body || '').trim();
    const shareLabel = String(shareBonusW.ctaShare || '').trim();
    const laterLabel =
      String(shareBonusW.ctaLater || '').trim() ||
      String(this.wording?.system?.notNow || '').trim();
    const unlockLabel = String(this.wording?.landing?.postPaywallCta || '').trim();

    if (!title || (!body && !shareLabel)) return false;

    const html = `
      <div class="wt-stack wt-stack--sm">
        ${body ? `<p class="wt-muted">${escapeHtml(body)}</p>` : ``}
        <div class="wt-actions wt-modal-actions wt-modal-actions--lg">
          ${shareLabel ? `<button class="wt-btn wt-btn--primary" data-action="claim-share-bonus">${escapeHtml(shareLabel)}</button>` : ``}
          ${unlockLabel ? `<button class="wt-btn wt-btn--ghost" data-action="open-paywall">${escapeHtml(unlockLabel)}</button>` : ``}
          ${laterLabel ? `<button class="wt-btn wt-btn--secondary" data-action="dismiss-share-bonus">${escapeHtml(laterLabel)}</button>` : ``}
        </div>
      </div>
    `;

    this._runtime.shareBonusModalShown = true;
    this._runtime.shareBonusModalPending = false;
    this.openModal(html, title, { modalKey: 'share-bonus' });
    return true;
  };

  UI.prototype.claimShareBonus = async function (event) {
    if (!this.storage || typeof this.storage.grantShareBonus !== 'function') {
      return;
    }

    this._runtime = this._runtime || {};
    if (this._runtime.shareBonusClaimInFlight === true) return;

    const shareBonusW = this.wording?.shareBonus || {};
    const alreadyMsg = String(shareBonusW.toastAlready || '').trim();
    const failMsg = String(shareBonusW.toastShareFailed || '').trim();
    const unlockedMsg = String(shareBonusW.toastUnlocked || '').trim();

    if (
      typeof this.storage.hasShareBonusGranted === 'function' &&
      this.storage.hasShareBonusGranted() === true
    ) {
      if (alreadyMsg) toastNow(this.config, alreadyMsg);
      return;
    }

    const trigger = event?.target?.closest
      ? event.target.closest('[data-action="claim-share-bonus"]')
      : null;
    const previousDisabled = !!trigger?.disabled;
    const previousBusy = trigger?.getAttribute?.('aria-busy');

    this._runtime.shareBonusClaimInFlight = true;
    if (trigger) {
      trigger.disabled = true;
      trigger.setAttribute('aria-busy', 'true');
    }

    try {
      const text = String(this._getShareText() || '').trim();
      if (!text) {
        if (failMsg) toastNow(this.config, failMsg, { variant: 'danger' });
        return;
      }

      let shared = false;
      if (typeof navigator.share === 'function') {
        try {
          await navigator.share({ text });
          shared = true;
        } catch (_) {
          shared = false;
        }
      } else if (typeof navigator.clipboard?.writeText === 'function') {
        try {
          await navigator.clipboard.writeText(text);
          shared = true;
        } catch (_) {
          shared = false;
        }
      }

      if (!shared) {
        if (failMsg) toastNow(this.config, failMsg, { variant: 'danger' });
        return;
      }

      const result = this.storage.grantShareBonus();
      if (result?.reason === 'ALREADY') {
        if (alreadyMsg) toastNow(this.config, alreadyMsg);
        return;
      }
      if (!result?.ok) {
        if (failMsg) toastNow(this.config, failMsg, { variant: 'danger' });
        return;
      }

      if (typeof this.storage.markShareClicked === 'function') {
        this.storage.markShareClicked();
      }

      this._runtime.shareBonusDismissed = false;
      if (unlockedMsg) {
        toastNow(this.config, unlockedMsg, { variant: 'success' });
      }
      const modalKey = String(this._runtime?._modalKey || '').trim();
      if (modalKey === 'share-bonus') {
        this.closeModal();
        this.startRun(false);
        return;
      }
      this.render();
    } finally {
      this._runtime.shareBonusClaimInFlight = false;
      if (trigger) {
        trigger.disabled = previousDisabled;
        trigger.setAttribute('aria-busy', previousBusy || 'false');
      }
    }
  };

  // ============================================
  // Mistakes only toggle (Landing)
  // ============================================
  UI.prototype.toggleMistakesOnly = function () {
    if (!this.storage) return;

    const cfg = this.config || {};
    const moCfg = cfg.mistakesOnly || {};
    if (!moCfg.enabled) return;

    const premiumOnly = moCfg.premiumOnly === true;
    const premium = isPremiumNow(this.storage);

    if (premiumOnly && !premium) {
      this.setState(STATES.PAYWALL);
      return;
    }

    const on =
      typeof this.storage.getMistakesOnly === 'function'
        ? this.storage.getMistakesOnly()
        : false;
    if (typeof this.storage.setMistakesOnly === 'function') {
      this.storage.setMistakesOnly(!on);
    }
  };

  // ============================================
  // Support modal
  // ============================================
  UI.prototype.openSupportModal = function () {
    if (
      !window.WT_UI_Support ||
      typeof window.WT_UI_Support.openSupport !== 'function'
    ) {
      throw new Error('WT_UI_Support.openSupport missing');
    }
    return window.WT_UI_Support.openSupport(this, { escapeHtml, toastNow });
  };

  UI.prototype.copySupportEmail = async function () {
    if (
      !window.WT_UI_Support ||
      typeof window.WT_UI_Support.copySupportEmail !== 'function'
    ) {
      throw new Error('WT_UI_Support.copySupportEmail missing');
    }
    return window.WT_UI_Support.copySupportEmail(this, { toastNow });
  };

  UI.prototype.openSupportEmailApp = function (kind) {
    if (
      !window.WT_UI_Support ||
      typeof window.WT_UI_Support.openSupportEmail !== 'function'
    ) {
      throw new Error('WT_UI_Support.openSupportEmail missing');
    }
    return window.WT_UI_Support.openSupportEmail(this, kind);
  };

  // ============================================
  // Pool complete (one-shot modal on END entry)
  // ============================================
  UI.prototype.openPoolCompleteModal = function () {
    if (
      !window.WT_UI_Growth ||
      typeof window.WT_UI_Growth.openPoolComplete !== 'function'
    ) {
      throw new Error('WT_UI_Growth.openPoolComplete missing');
    }
    return window.WT_UI_Growth.openPoolComplete(this, {
      escapeHtml,
      fillTemplate,
      clampInt
    });
  };

  // ============================================
  // Milestone modal (one-shot on END entry)
  // ============================================
  UI.prototype.openMilestoneModal = function (milestoneKey) {
    if (
      !window.WT_UI_Growth ||
      typeof window.WT_UI_Growth.openMilestone !== 'function'
    ) {
      throw new Error('WT_UI_Growth.openMilestone missing');
    }
    return window.WT_UI_Growth.openMilestone(this, milestoneKey, {
      escapeHtml
    });
  };

  // ============================================
  // Waitlist (mailto, no backend)
  // ============================================
  UI.prototype.openWaitlistModal = function () {
    if (
      !window.WT_UI_Support ||
      typeof window.WT_UI_Support.openWaitlist !== 'function'
    ) {
      throw new Error('WT_UI_Support.openWaitlist missing');
    }
    return window.WT_UI_Support.openWaitlist(this, { escapeHtml });
  };

  UI.prototype.sendWaitlistViaEmail = function () {
    if (
      !window.WT_UI_Support ||
      typeof window.WT_UI_Support.sendWaitlist !== 'function'
    ) {
      throw new Error('WT_UI_Support.sendWaitlist missing');
    }
    return window.WT_UI_Support.sendWaitlist(this, { toastNow });
  };

  // ============================================
  // Anonymous Stats Payload (opt-in sharing)
  // ============================================

  UI.prototype._getStatsPayloadWithTerms = function () {
    if (
      !window.WT_UI_StatsSharing ||
      typeof window.WT_UI_StatsSharing.getPayload !== 'function'
    ) {
      throw new Error('WT_UI_StatsSharing.getPayload missing');
    }
    return window.WT_UI_StatsSharing.getPayload(this);
  };

  UI.prototype.openStatsSharingModal = function () {
    if (
      !window.WT_UI_StatsSharing ||
      typeof window.WT_UI_StatsSharing.openModal !== 'function'
    ) {
      throw new Error('WT_UI_StatsSharing.openModal missing');
    }
    return window.WT_UI_StatsSharing.openModal(this, { escapeHtml, toastNow });
  };

  UI.prototype.sendStatsViaEmail = function () {
    if (
      !window.WT_UI_StatsSharing ||
      typeof window.WT_UI_StatsSharing.sendEmail !== 'function'
    ) {
      throw new Error('WT_UI_StatsSharing.sendEmail missing');
    }
    return window.WT_UI_StatsSharing.sendEmail(this, { toastNow });
  };

  UI.prototype.copyStatsToClipboard = async function () {
    if (
      !window.WT_UI_StatsSharing ||
      typeof window.WT_UI_StatsSharing.copy !== 'function'
    ) {
      throw new Error('WT_UI_StatsSharing.copy missing');
    }
    return window.WT_UI_StatsSharing.copy(this, { toastNow });
  };

  UI.prototype._maybePromptStatsSharingMilestone = function () {
    if (
      !window.WT_UI_StatsSharing ||
      typeof window.WT_UI_StatsSharing.maybePrompt !== 'function'
    ) {
      throw new Error('WT_UI_StatsSharing.maybePrompt missing');
    }
    return window.WT_UI_StatsSharing.maybePrompt(this, {
      clampInt,
      escapeHtml,
      toastNow,
      isPremiumNow,
      getStatsSharingPromptFlags,
      getStatsSharingSnoozeUntilRunCompletes,
      markStatsSharingPromptFlag
    });
  };

  UI.prototype.openInstallPromptModal = function () {
    if (
      !window.WT_UI_Install ||
      typeof window.WT_UI_Install.openModal !== 'function'
    ) {
      throw new Error('WT_UI_Install.openModal missing');
    }
    return window.WT_UI_Install.openModal(this, { escapeHtml });
  };

  UI.prototype._canShowInstallPrompt = function () {
    if (
      !window.WT_UI_Install ||
      typeof window.WT_UI_Install.canShow !== 'function'
    ) {
      throw new Error('WT_UI_Install.canShow missing');
    }
    return window.WT_UI_Install.canShow(this);
  };

  // ============================================
  // Install prompt (minimal)
  // ============================================
  UI.prototype.promptInstall = function () {
    if (
      !window.WT_UI_Install ||
      typeof window.WT_UI_Install.prompt !== 'function'
    ) {
      throw new Error('WT_UI_Install.prompt missing');
    }
    return window.WT_UI_Install.prompt(this, { escapeHtml });
  };

  UI.prototype.applyUpdateToast = function () {
    if (
      !window.WT_UI_Checkout ||
      typeof window.WT_UI_Checkout.applyUpdateToast !== 'function'
    ) {
      throw new Error('WT_UI_Checkout.applyUpdateToast missing');
    }
    return window.WT_UI_Checkout.applyUpdateToast(this, { el });
  };

  // ============================================
  // ============================================
  // House ad (optional)
  // ============================================
  UI.prototype.remindHouseAdLater = function () {
    if (
      !window.WT_UI_Growth ||
      typeof window.WT_UI_Growth.remindHouseAdLater !== 'function'
    ) {
      throw new Error('WT_UI_Growth.remindHouseAdLater missing');
    }
    return window.WT_UI_Growth.remindHouseAdLater(this);
  };

  UI.prototype.openHouseAd = function () {
    if (
      !window.WT_UI_Growth ||
      typeof window.WT_UI_Growth.openHouseAd !== 'function'
    ) {
      throw new Error('WT_UI_Growth.openHouseAd missing');
    }
    return window.WT_UI_Growth.openHouseAd(this);
  };

  // ============================================
  // Secret Bonus fall (UI-only)
  // ============================================

  UI.prototype._secretBonusFallStop = function () {
    const sbf = this._runtime?.secretBonusFall;
    if (!sbf) return;

    if (sbf.rafId) {
      try {
        window.cancelAnimationFrame(sbf.rafId);
      } catch (_) {}
    }

    sbf.rafId = 0;
    sbf.running = false;
    sbf.lastTs = 0;
  };

  // Secret Bonus: refs cleanup ONLY when exiting BONUS (not per item)
  UI.prototype._secretBonusFallCleanup = function () {
    const sbf = this._runtime?.secretBonusFall;
    if (!sbf) return;

    this._secretBonusFallStop();

    sbf.laneEl = null;
    sbf.chipEl = null;
    sbf.failLineEl = null;
    sbf.failLabelEl = null;

    sbf.itemKey = '';
    sbf.y01 = 0;
    sbf.speed01PerSec = 0;
    sbf.trackPxMax = 0;
    sbf.wasInWarning = false;
  };

  UI.prototype._secretBonusFailCurrentItem = function () {
    // Fail-closed: only during BONUS + PLAYING
    if (this.state !== STATES.PLAYING) return;
    if (!this._runtime) return;

    // Local source of truth (this method must not rely on render-time locals)
    const modeNow = String(this._runtime?.runMode || '').trim();
    if (!modeNow) return;
    if (modeNow !== MODES.BONUS) return;

    // If feedback is pending, don't inject anything.
    if (this._runtime.feedbackPending === true) return;

    // HARD LOCK like normal answer
    if (this._runtime.answerLocked === true) return;
    this._runtime.answerLocked = true;

    // Snapshot chances BEFORE answering (for pulse/toast)
    let prevChancesLeft = null;
    try {
      const gsPrev =
        this.game && typeof this.game.getState === 'function'
          ? this.game.getState() || {}
          : {};
      if (gsPrev.chancesLeft != null)
        prevChancesLeft = Number(gsPrev.chancesLeft);
    } catch (_) {
      /* silent */
    }

    // Timeout / no answer:
    // The engine contract expects a strict boolean. Force a guaranteed-wrong boolean by inverting correctAnswer.
    let forcedWrong = false;
    try {
      const cur =
        this.game && typeof this.game.getCurrent === 'function'
          ? this.game.getCurrent()
          : null;
      const correct =
        cur && (cur.correctAnswer === true || cur.correctAnswer === false)
          ? cur.correctAnswer
          : null;
      if (correct === true) forcedWrong = false;
      else if (correct === false) forcedWrong = true;
    } catch (_) {
      forcedWrong = false;
    }

    const res =
      this.game && typeof this.game.answer === 'function'
        ? this.game.answer(forcedWrong)
        : null;

    // Stop fall loop immediately to avoid double-fail
    this._secretBonusFallStop();

    // If engine didn't answer, unlock (fail-safe)
    if (!res) {
      this._runtime.answerLocked = false;
      return;
    }

    // Chance pulse + unified toast (same contract as UI.prototype.answer)
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

      this._runtime.scoreFlashAt = 0;
    } catch (_) {
      chanceLost = false;
      nowChancesLeft = null;
      this._runtime.chanceLostPulseAt = 0;
      this._runtime.lastChancePulseAt = 0;
    }

    this._scheduleHudPulseCleanup();

    if (chanceLost && Number.isFinite(nowChancesLeft)) {
      try {
        const root = this.appEl || document.getElementById('app');
        const pill = root ? root.querySelector('.wt-pill--chances') : null;

        if (pill) {
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

    if (chanceLost && Number.isFinite(nowChancesLeft)) {
      showChanceLostOverlay(
        this.config,
        this.wording,
        nowChancesLeft,
        String(this._runtime?.runMode || '').trim()
      );
    }

    // Block renders before recordAnswer if game over (same contract as answer()).
    if (
      res.done === true &&
      Number.isFinite(nowChancesLeft) &&
      Number(nowChancesLeft) === 0
    ) {
      this._runtime.gameOverPending = true;
    }

    if (this.storage && typeof this.storage.recordAnswer === 'function') {
      this.storage.recordAnswer(res.itemId, res.isCorrect);
    }

    if (Number.isFinite(Number(res.itemId))) {
      const id = Number(res.itemId);
      this._runtime.runItemIds.push(id);

      if (res.isCorrect !== true) {
        if (!Array.isArray(this._runtime.runMistakeIds))
          this._runtime.runMistakeIds = [];
        if (this._runtime.runMistakeIds.indexOf(id) === -1)
          this._runtime.runMistakeIds.push(id);
      }
    }

    // BONUS feedback policy already handled in UI.prototype.answer, but here we enforce the same "none/minimal".
    const sbFeedback = String(this.config?.secretBonus?.feedback || '').trim();

    if (sbFeedback === 'none') {
      this._runtime.feedbackPending = false;
      this._runtime.lastAnswer = null;
      this._runtime.frozenItem = null;
      this._runtime.finishAfterFeedback = false;
      this._runtime.answerLocked = false;

      if (res.done === true) {
        const endedByGameOver =
          Number.isFinite(nowChancesLeft) && Number(nowChancesLeft) === 0;
        if (endedByGameOver) {
          // Fall already stopped (line above). Use factored delay for freeze + overlay hold.
          this._enterGameOverDelay();
          return;
        }
        this._finishRun();
        return;
      }

      this.render();

      try {
        this._secretBonusFallStartOrSync();
      } catch (_) {
        /* silent */
      }

      return;
    }
    if (res.done === true) {
      let nowChancesLeft = null;
      try {
        const gsNow =
          this.game && typeof this.game.getState === 'function'
            ? this.game.getState() || {}
            : {};
        nowChancesLeft =
          gsNow.chancesLeft != null ? Number(gsNow.chancesLeft) : null;
      } catch (_) {
        nowChancesLeft = null;
      }

      const endedByGameOver =
        Number.isFinite(nowChancesLeft) && Number(nowChancesLeft) === 0;

      if (endedByGameOver) {
        // Fall already stopped. Use factored delay for freeze + overlay hold.
        this._enterGameOverDelay();
        return;
      }

      // Deck exhausted: show gameplay overlay then transition to END
      const msg = String(
        this.wording?.secretBonus?.endDeckExhaustedToast || ''
      ).trim();
      const timing = getToastTiming(this.config, '');
      const durationMs = timing ? Number(timing.durationMs) : NaN;

      if (
        msg &&
        Number.isFinite(durationMs) &&
        durationMs >= 600 &&
        durationMs <= 4000
      ) {
        showGameplayOverlay(msg, {
          durationMs: Math.floor(durationMs),
          variant: 'success',
          cfg: this.config,
          mode: MODES.BONUS
        });

        if (this._runtime.bonusEndTimerId) {
          clearRuntimeTimer(this, 'bonusEndTimerId');
          this._runtime.bonusEndTimerId = null;
        }

        setRuntimeTimer(
          this,
          'bonusEndTimerId',
          () => {
            this._runtime.bonusEndTimerId = null;
            if (this.state !== STATES.PLAYING) return;
            this._finishRun();
          },
          Math.floor(durationMs)
        );

        return;
      }

      this._finishRun();
      return;
    }

    this.render();

    try {
      this._secretBonusFallStartOrSync();
    } catch (_) {
      /* silent */
    }
  };

  // Rapid Fire: paddle return and power-ups after an answer (state only; sync() draws it).
  UI.prototype._rfOnAnswer = function (choiceBool, res) {
    try {
      if (!window.WT_RFX || !this._runtime) return;
      const rf = (this._runtime.rf = this._runtime.rf || {});
      const now = Date.now();
      rf.paddle = { side: choiceBool === true ? 'left' : 'right', t: now };
      if (res && res.isCorrect === true && this.game) {
        const st = this.game.getState();
        const power = window.WT_RFX.powerFor({
          streak: st.correctStreak,
          chancesLeft: st.chancesLeft,
          maxChances: st.maxChances
        });
        if (power === 'life' && typeof this.game.grantChance === 'function') {
          if (!this.game.grantChance()) return;
        }
        if (power) rf.power = { kind: power, t: now };
      }
      // Draw at once: the next render can come later than the 450 ms paddle move.
      const lane = this.appEl ? this.appEl.querySelector('[data-wt-bonus-lane]') : null;
      const chip = this.appEl ? this.appEl.querySelector('[data-wt-bonus-chip]') : null;
      window.WT_RFX.sync(lane, rf, {
        lang: String(document.documentElement.lang || '').slice(0, 2),
        chipEl: chip,
        boss: rf.bossNow === true
      });
    } catch (_) {
      /* effects are optional */
    }
  };

  UI.prototype._secretBonusFallStartOrSync = function () {
    if (!this._runtime) return;

    const cfg = this.config || {};
    const sb = cfg?.secretBonus || {};
    const fall = sb && typeof sb === 'object' ? sb.fall : null;

    // No fallback: require full fall config (speed in % of lane height per second).
    // Config uses % (e.g. 25 = 25%/s), code converts to ratio (0.25).
    if (
      !fall ||
      typeof fall !== 'object' ||
      fall.enabled !== true ||
      !Number.isFinite(Number(fall.initialSpeed)) ||
      Number(fall.initialSpeed) <= 0 ||
      !Number.isFinite(Number(fall.maxSpeed)) ||
      Number(fall.maxSpeed) <= 0 ||
      !Number.isFinite(Number(fall.speedIncrement)) ||
      Number(fall.speedIncrement) < 0 ||
      !Number.isFinite(Number(fall.dangerThreshold)) ||
      Number(fall.dangerThreshold) <= 0 ||
      Number(fall.dangerThreshold) >= 1
    ) {
      this._secretBonusFallStop();
      return;
    }

    const sbf = this._runtime ? this._runtime.secretBonusFall : null;
    if (!sbf) return;

    // Bind DOM references (fresh after render)
    const lane = this.appEl
      ? this.appEl.querySelector('[data-wt-bonus-lane]')
      : null;
    const chip = this.appEl
      ? this.appEl.querySelector('[data-wt-bonus-chip]')
      : null;
    const failLineEl = this.appEl
      ? this.appEl.querySelector('[data-wt-bonus-fail]')
      : null;
    const failLabel = this.appEl
      ? this.appEl.querySelector('[data-wt-bonus-fail-label]')
      : null;

    if (!lane || !chip || !failLineEl) {
      this._secretBonusFallStop();
      return;
    }

    sbf.laneEl = lane;
    sbf.chipEl = chip;
    sbf.failLineEl = failLineEl;
    sbf.failLabelEl = failLabel || null;

    // Cache the available track height once (avoid layout reads every frame)
    try {
      const laneH = lane.getBoundingClientRect().height || 0;
      const chipH = chip.getBoundingClientRect().height || 0;
      sbf.trackPxMax = Math.max(
        0,
        laneH - (Number.isFinite(chipH) ? chipH : 0)
      );
    } catch (_) {
      sbf.trackPxMax = 0;
    }

    // Detect new item -> reset fall position/speed
    const cur =
      this.game && typeof this.game.getCurrent === 'function'
        ? this.game.getCurrent()
        : null;
    const itemId = cur && cur.id != null ? String(cur.id) : '';
    const itemKey = itemId ? `id:${itemId}` : '';

    if (itemKey && itemKey !== sbf.itemKey) {
      sbf.itemKey = itemKey;
      sbf.y01 = 0;
      sbf.lastTs = 0;

      // Reset warning edge detection for the new item
      sbf.wasInWarning = false;

      // Clear transient classes from previous item
      try {
        if (sbf.chipEl && sbf.chipEl.classList) {
          sbf.chipEl.classList.remove(
            'wt-bonus-chip--warning',
            'wt-bonus-chip--warning-once',
            'wt-bonus-chip--spawn'
          );
          sbf.chipEl.style.animationDuration = '';
        }
        if (sbf.failLineEl && sbf.failLineEl.classList) {
          sbf.failLineEl.classList.remove('wt-bonus-fail-line--pulse');
        }
        if (sbf.failLabelEl && sbf.failLabelEl.classList) {
          sbf.failLabelEl.classList.remove('wt-bonus-fail-label--pulse');
        }
      } catch (_) {}

      // Speed contract (single type): progression based on items served (not time).
      // Config values are % of lane height per second (e.g. 25 => 25%/s),
      // ramp applied once per new item: speed = min(max, initial + increment * itemsServedSoFar).
      const initialPct = Number(fall.initialSpeed);
      const incPct = Number(fall.speedIncrement);
      const maxPct = Number(fall.maxSpeed);

      const servedSoFar = Array.isArray(this._runtime?.runItemIds)
        ? this._runtime.runItemIds.length
        : 0;

      if (!Number.isFinite(initialPct) || initialPct <= 0) {
        this._secretBonusFallStop();
        return;
      }
      if (!Number.isFinite(incPct) || incPct < 0) {
        this._secretBonusFallStop();
        return;
      }
      if (!Number.isFinite(maxPct) || maxPct <= 0) {
        this._secretBonusFallStop();
        return;
      }

      const speedPct = Math.min(
        maxPct,
        Math.max(0, initialPct + incPct * servedSoFar)
      );
      sbf.speed01PerSec = speedPct / 100;

      // Rapid Fire effects: a new run starts clean, then waves and the boss are announced.
      try {
        if (servedSoFar === 0) this._runtime.rf = {};
        const rfNow = Date.now();
        const wave = window.WT_RFX ? window.WT_RFX.waveFor(servedSoFar) : 0;
        if (wave > 0) this._runtime.rf.wave = { n: wave, t: rfNow };
        const total =
          this.game && typeof this.game.getTotal === 'function'
            ? this.game.getTotal()
            : 0;
        const boss = window.WT_RFX ? window.WT_RFX.isBoss(servedSoFar, total) : false;
        this._runtime.rf.bossNow = boss;
        if (boss) this._runtime.rf.boss = { t: rfNow };
      } catch (_) {
        /* effects are optional */
      }

      // Reset transform immediately
      try {
        sbf.chipEl.style.transform = 'translate3d(0px, 0px, 0px)';
      } catch (_) {}

      // Micro-juice: spawn pop (1 shot)
      try {
        if (sbf.chipEl && sbf.chipEl.classList) {
          sbf.chipEl.classList.add('wt-bonus-chip--spawn');

          const onDone = () => {
            try {
              sbf.chipEl.classList.remove('wt-bonus-chip--spawn');
            } catch (_) {}
          };

          sbf.chipEl.addEventListener('animationend', onDone, { once: true });
          sbf.chipEl.addEventListener('animationcancel', onDone, {
            once: true
          });
        }
      } catch (_) {}
    }

    try {
      if (window.WT_RFX && this._runtime.rf) {
        window.WT_RFX.sync(lane, this._runtime.rf, {
          lang: String(document.documentElement.lang || '').slice(0, 2),
          chipEl: chip,
          boss: this._runtime.rf.bossNow === true
        });
      }
    } catch (_) {
      /* effects are optional */
    }

    if (sbf.running === true) return;

    // Don't start falling while run-start overlay is visible (chip would move unseen).
    // The wt-runstart-dismissed event will re-trigger _secretBonusFallStartOrSync.
    if (isOverlayVisible('wt-run-start-overlay')) return;

    sbf.running = true;
    sbf.rafId = window.requestAnimationFrame((ts) =>
      this._secretBonusFallTick(ts)
    );
  };

  UI.prototype._secretBonusFallTick = function (ts) {
    const sbf = this._runtime?.secretBonusFall;
    if (!sbf || sbf.running !== true) return;

    // Validate still on BONUS playing with required DOM nodes
    const modeNow = String(this._runtime?.runMode || 'RUN').trim();
    if (
      this.state !== STATES.PLAYING ||
      modeNow !== 'BONUS' ||
      !sbf.laneEl ||
      !sbf.chipEl
    ) {
      this._secretBonusFallStop();
      return;
    }

    const cfg = this.config || {};
    const fall = cfg?.secretBonus?.fall || null;
    if (!fall || typeof fall !== 'object') {
      this._secretBonusFallStop();
      return;
    }

    // maxSpeed is a % value (e.g. 80 => 0.80). dangerThreshold is a ratio (0..1).
    const maxSpeed01 = Number(fall.maxSpeed) / 100;
    const danger01 = Number(fall.dangerThreshold);

    if (!Number.isFinite(maxSpeed01) || maxSpeed01 <= 0) {
      this._secretBonusFallStop();
      return;
    }

    // dangerThreshold must be a strict ratio in (0..1) for consistent gameplay + visuals
    if (!Number.isFinite(danger01) || danger01 <= 0 || danger01 >= 1) {
      this._secretBonusFallStop();
      return;
    }

    // Track is cached in _secretBonusFallStartOrSync (avoid layout reads every frame)
    let trackPxMax = Number(sbf.trackPxMax || 0);

    if (!Number.isFinite(trackPxMax) || trackPxMax <= 0) {
      try {
        const laneRect = sbf.laneEl.getBoundingClientRect();
        const chipRect = sbf.chipEl.getBoundingClientRect();
        trackPxMax = Math.max(
          0,
          Number(laneRect.height || 0) - Number(chipRect.height || 0)
        );
        sbf.trackPxMax = trackPxMax;
      } catch (_) {
        trackPxMax = 0;
        sbf.trackPxMax = 0;
      }

      if (!Number.isFinite(trackPxMax) || trackPxMax <= 0) {
        this._secretBonusFallStop();
        return;
      }
    }

    const last = Number(sbf.lastTs || 0);
    sbf.lastTs = Number.isFinite(ts) ? ts : 0;

    // First frame: just schedule next
    if (!last || !Number.isFinite(last)) {
      sbf.rafId = window.requestAnimationFrame((t2) =>
        this._secretBonusFallTick(t2)
      );
      return;
    }

    const dtMs = Math.max(0, Math.min(80, sbf.lastTs - last));
    const dtSec = dtMs / 1000;

    // Speed is set once per item in _secretBonusFallStartOrSync (items-served progression).
    // Clamp to max to fail-safe if config changed mid-run.
    const speed01 = Math.min(
      maxSpeed01,
      Math.max(0, Number(sbf.speed01PerSec || 0))
    );
    if (!Number.isFinite(speed01) || speed01 <= 0) {
      this._secretBonusFallStop();
      return;
    }

    // Clamp y01 to [0..1] so the chip never overshoots the track
    sbf.y01 = Math.min(1, Math.max(0, Number(sbf.y01 || 0) + speed01 * dtSec));

    const yPx = sbf.y01 * trackPxMax;

    // Apply transform (no re-render)
    try {
      sbf.chipEl.style.transform = `translate3d(0px, ${Math.round(yPx)}px, 0px)`;
    } catch (_) {}

    // Warning zone: keep the existing policy, but let micro-juice handle the "one-shot"
    if (Number.isFinite(danger01) && danger01 > 0 && sbf.chipEl) {
      const warningThreshold = danger01 * 0.65;
      const inWarning = sbf.y01 >= warningThreshold;

      // Persistent warning pulse
      sbf.chipEl.classList.toggle('wt-bonus-chip--warning', inWarning);

      // Micro-juice: one-shot hit when entering the zone
      if (inWarning && sbf.wasInWarning !== true) {
        try {
          sbf.chipEl.classList.remove('wt-bonus-chip--warning-once');
          sbf.chipEl.classList.add('wt-bonus-chip--warning-once');

          const onDone = () => {
            try {
              sbf.chipEl.classList.remove('wt-bonus-chip--warning-once');
            } catch (_) {}
          };
          sbf.chipEl.addEventListener('animationend', onDone, { once: true });
          sbf.chipEl.addEventListener('animationcancel', onDone, {
            once: true
          });
        } catch (_) {}

        // Pulse the fail line + label once for clarity
        try {
          if (sbf.failLineEl && sbf.failLineEl.classList) {
            sbf.failLineEl.classList.remove('wt-bonus-fail-line--pulse');
            sbf.failLineEl.classList.add('wt-bonus-fail-line--pulse');

            const onDoneLine = () => {
              try {
                sbf.failLineEl.classList.remove('wt-bonus-fail-line--pulse');
              } catch (_) {}
            };
            sbf.failLineEl.addEventListener('animationend', onDoneLine, {
              once: true
            });
            sbf.failLineEl.addEventListener('animationcancel', onDoneLine, {
              once: true
            });
          }

          if (sbf.failLabelEl && sbf.failLabelEl.classList) {
            sbf.failLabelEl.classList.remove('wt-bonus-fail-label--pulse');
            sbf.failLabelEl.classList.add('wt-bonus-fail-label--pulse');

            const onDoneLabel = () => {
              try {
                sbf.failLabelEl.classList.remove('wt-bonus-fail-label--pulse');
              } catch (_) {}
            };
            sbf.failLabelEl.addEventListener('animationend', onDoneLabel, {
              once: true
            });
            sbf.failLabelEl.addEventListener('animationcancel', onDoneLabel, {
              once: true
            });
          }
        } catch (_) {}
      }

      sbf.wasInWarning = inWarning;
    }

    // Fail line check (based on *track*, not raw lane height)
    const failY = trackPxMax * danger01;
    if (yPx >= failY) {
      this._secretBonusFailCurrentItem();
      return;
    }

    sbf.rafId = window.requestAnimationFrame((t2) =>
      this._secretBonusFallTick(t2)
    );
  };

  // ============================================
  // Render
  // ============================================
