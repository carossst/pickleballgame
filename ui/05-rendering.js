UI.prototype.render = function () {
    if (!this.appEl) return;

    // Safety net: clear stuck overlay locks on LANDING/END (fail-closed)
    if (this.state !== STATES.PLAYING) {
      try {
        if (this.appEl.getAttribute('data-wt-runstart-lock') === '1') {
          this.appEl.style.pointerEvents = '';
          try {
            this.appEl.inert = false;
          } catch (_) {}
          this.appEl.removeAttribute('data-wt-runstart-lock');
          this.appEl.removeAttribute('data-wt-runstart-prev-pe');
          this.appEl.removeAttribute('data-wt-runstart-prev-inert');
        }
        if (this.appEl.inert === true) {
          try {
            this.appEl.inert = false;
          } catch (_) {}
        }
        if (this.appEl.style.pointerEvents === 'none') {
          this.appEl.style.pointerEvents = '';
        }
      } catch (_) {}
    }

    const premium = isPremiumNow(this.storage);

    const prevRenderedState = this._runtime
      ? this._runtime.lastRenderedState
      : null;

    // Funnel counter: count LANDING views once per entry into the screen (not per re-render)
    try {
      const prev = prevRenderedState;
      const next = this.state;

      // Record the rendered state BEFORE the counter write.
      // markLandingViewed() -> _save() -> _emit() re-enters render() synchronously;
      // recording first makes the nested render see prev === LANDING and skip the
      // counter (otherwise: infinite recursion until "Maximum call stack size
      // exceeded", landingViewed inflated ~40x per load, and trackFunnel
      // "landing_view" fired once per recursion level).
      if (this._runtime) this._runtime.lastRenderedState = next;

      if (next === STATES.LANDING && prev !== STATES.LANDING) {
        if (
          this.storage &&
          typeof this.storage.markLandingViewed === 'function'
        ) {
          this.storage.markLandingViewed();
        }

        if (
          window.WT_Analytics &&
          typeof window.WT_Analytics.trackFunnel === 'function' &&
          typeof window.WT_Analytics.inferUiContext === 'function'
        ) {
          window.WT_Analytics.trackFunnel(
            'landing_view',
            window.WT_Analytics.inferUiContext(this)
          );
        }
      }
    } catch (_) {
      /* silent */
    }

    // Preserve footer if it exists inside #app (otherwise leave it alone).
    // We keep the same DOM node (not HTML string) to avoid losing any nested content.
    if (!this._footerNode) {
      try {
        const candidate =
          this.appEl.querySelector('[data-wt-footer]') ||
          this.appEl.querySelector('.wt-footer') ||
          this.appEl.querySelector('footer');
        if (candidate) this._footerNode = candidate;
      } catch (_) {
        /* silent */
      }
    }

    if (this._footerNode && this._footerNode.parentNode === this.appEl) {
      try {
        this.appEl.removeChild(this._footerNode);
      } catch (_) {
        /* silent */
      }
    }
    switch (this.state) {
      case STATES.LANDING:
        this.appEl.innerHTML = this._renderLanding();
        break;

      case STATES.PLAYING:
        // Fail-closed: during END transitions, async events may trigger render()
        // while the engine is already cleaned up. Never re-render PLAYING without a game.
        if (!this.game) return;

        if (this.modalEl && !this.modalEl.classList.contains('wt-hidden')) {
          this.closeModal();
        }
        this.appEl.innerHTML = this._renderPlaying();

        // BONUS: re-bind fall DOM refs after every render (innerHTML detaches previous nodes).
        // _secretBonusFallStartOrSync is idempotent: if already running with same itemKey, it just rebinds refs.
        try {
          if (String(this._runtime?.runMode || '').trim() === MODES.BONUS) {
            this._secretBonusFallStartOrSync();
          }
        } catch (_) {
          /* silent */
        }
        break;

      case STATES.END:
        this.appEl.innerHTML = this._renderEnd();
        break;

      case STATES.PAYWALL:
        this.appEl.innerHTML = this._renderPaywall();
        break;

      default:
        this.appEl.innerHTML = this._renderLanding();
        break;
    }

    // Screen-scoped body class (CSS can react without DOM branching)
    try {
      const playing = this.state === STATES.PLAYING;
      const ended = this.state === STATES.END;
      document.body.classList.toggle('wt-state--playing', playing);
      document.body.classList.toggle('wt-state--end', ended);
    } catch (_) {
      /* silent */
    }

    try {
      this._handleEndEntryModals(prevRenderedState, premium);
    } catch (_) {
      /* silent */
    }

    try {
      syncDailyCountdownTicker(this);
    } catch (_) {
      /* silent */
    }
  };

  UI.prototype._handleEndEntryModals = function (prevRenderedState, premium) {
    const enteredEnd =
      this.state === STATES.END && prevRenderedState !== STATES.END;

    // Clean up game-over overlay as soon as we are no longer on PLAYING.
    // Goal: keep PLAYING frozen under the overlay, but never let the overlay leak onto END/LANDING/PAYWALL.
    if (this.state !== STATES.PLAYING) {
      try {
        hideChanceLostOverlay();
      } catch (_) {
        /* silent */
      }
    }

    if (!enteredEnd) return;

    const lastRun = this._runtime?.lastRun || {};
    const mode = String(lastRun.mode || '').trim();
    const enteredKnownEndMode = [
      MODES.RUN,
      MODES.PRACTICE,
      MODES.BONUS
    ].includes(mode);

    if (!enteredKnownEndMode) return;

    const delayMsRaw = Number(this.config?.ui?.endAutoModalDelayMs);
    const delayMs =
      Number.isFinite(delayMsRaw) && delayMsRaw >= 0 && delayMsRaw <= 4000
        ? Math.floor(delayMsRaw)
        : null;

    if (delayMs == null) return;

    if (this._runtime?.endAutoModalTimerId) {
      clearRuntimeTimer(this, 'endAutoModalTimerId');
      this._runtime.endAutoModalTimerId = null;
    }

    setRuntimeTimer(
      this,
      'endAutoModalTimerId',
      () => {
        try {
          if (this._runtime) this._runtime.endAutoModalTimerId = null;
          if (this.state !== STATES.END) return;

          const run = this._runtime?.lastRun || {};
          const runMode = String(run.mode || '').trim();
          if (![MODES.RUN, MODES.PRACTICE, MODES.BONUS].includes(runMode))
            return;

          const isRun = runMode === MODES.RUN;
          const poolCompleteCelebration =
            isRun && !!run.poolCompleteCelebration;

          const modalOpen0 = !!(
            this.modalEl && !this.modalEl.classList.contains('wt-hidden')
          );

          // Pool complete modal
          if (poolCompleteCelebration && !modalOpen0) {
            this.openPoolCompleteModal();
            return;
          }

          // Discovery milestones: END-only, RUN-only, not when pool is exhausted.
          // Show at most one modal per END entry, prioritizing the highest reached threshold.
          try {
            const modalOpen1 = !!(
              this.modalEl && !this.modalEl.classList.contains('wt-hidden')
            );

            if (isRun && !poolCompleteCelebration && !modalOpen1) {
              const poolSize = clampInt(this.config?.game?.poolSize, 0, 9999);

              const thresholds = Array.isArray(
                this.config?.postCompletion?.milestoneThresholds
              )
                ? this.config.postCompletion.milestoneThresholds
                : null;

              const uniqueSeen =
                this.storage &&
                typeof this.storage.getUniqueSeenCount === 'function'
                  ? clampInt(this.storage.getUniqueSeenCount(), 0, 999999)
                  : 0;

              const exhausted = !!(
                this.storage &&
                typeof this.storage.isPoolExhausted === 'function' &&
                this.storage.isPoolExhausted() === true
              );
              if (!exhausted && poolSize > 0 && Array.isArray(thresholds)) {
                const milestoneChecks = [
                  {
                    key: 'threeQuarters',
                    index: 2,
                    hasFn: 'hasThreeQuartersMilestoneShown'
                  },
                  {
                    key: 'halfway',
                    index: 1,
                    hasFn: 'hasHalfwayMilestoneShown'
                  },
                  {
                    key: 'quarter',
                    index: 0,
                    hasFn: 'hasQuarterMilestoneShown'
                  }
                ];

                for (const item of milestoneChecks) {
                  const rawPct = Number(thresholds[item.index]);
                  const pct =
                    Number.isFinite(rawPct) && rawPct > 0 && rawPct < 1
                      ? rawPct
                      : null;
                  const threshold =
                    pct != null ? Math.floor(poolSize * pct) : 0;
                  const already = !!(
                    item.hasFn &&
                    this.storage &&
                    typeof this.storage[item.hasFn] === 'function' &&
                    this.storage[item.hasFn]() === true
                  );

                  if (threshold > 0 && uniqueSeen >= threshold && !already) {
                    this.openMilestoneModal(item.key);
                    return;
                  }
                }
              }
            }
          } catch (_) {
            /* silent */
          }

          // Free limit reached must be intentional:
          // gate on CTA click via startRun()/startRun(true), never auto-open on END.

          // Waitlist is now a stable LANDING block, not an END auto-modal.
        } catch (_) {
          /* silent */
        }
      },
      delayMs
    );
  };

  function renderLandingStatsCard(opts) {
    const badgeHtml = String(opts?.badgeHtml || '');
    const label = String(opts?.label || '').trim();
    const title = String(opts?.title || '').trim();
    const sub = String(opts?.sub || '').trim();
    const pct = clampInt(Number(opts?.pct), 0, 100);
    const progressClass = String(opts?.progressClass || '');

    if (!badgeHtml && !label && !title && !sub) return '';

    return `
      <div class="wt-landing-stats">
        ${badgeHtml}
        <div class="wt-landing-stat">
          ${label ? `<div class="wt-landing-stat__kicker">${escapeHtml(label)}</div>` : ``}
          ${title ? `<div class="wt-landing-stat__title">${escapeHtml(title)}</div>` : ``}
          ${sub ? `<div class="wt-meta wt-landing-stat__sub">${escapeHtml(sub)}</div>` : ``}
          <div class="wt-progress${progressClass}" aria-hidden="true">
            <div class="wt-progress__fill" data-pct="${pct}" style="width:${pct}%"></div>
          </div>
        </div>
      </div>
    `;
  }

  function renderEndCopyLine(text, cls) {
    const value = String(text || '').trim();
    if (!value) return '';
    return `<p class="${cls}">${escapeHtml(value)}</p>`;
  }

  UI.prototype._renderLanding = function () {
    if (
      !window.WT_UI_Landing ||
      typeof window.WT_UI_Landing.render !== 'function'
    ) {
      throw new Error('WT_UI_Landing.render missing');
    }
    return window.WT_UI_Landing.render(this, {
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
      renderLeaderboardLandingCard: function (ui) {
        if (
          !window.WT_UI_Leaderboard ||
          typeof window.WT_UI_Leaderboard.renderLandingCard !== 'function'
        )
          return '';
        return window.WT_UI_Leaderboard.renderLandingCard(ui, { escapeHtml });
      }
    });
  };

  function buildEndModeCopy(ctx) {
    const {
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
      storage,
      runtime
    } = ctx;

    let endLineTpl = '';
    let bonusLevel = '';
    let bonusIdentityTpl = '';
    let bonusLensTpl = '';
    let practiceRepeatTierKey = '';
    let practiceStatsLineTpl = '';
    let practiceRepeatNoteTpl = '';
    let runVerdictKey = '';
    let runIdentityTpl = '';
    let runPoolCompleteLine2Tpl = '';
    let bonusDeckTier = '';
    let bonusRecoLine = '';

    if (isBonus) {
      const total = clampInt(totalPresented, 0, 99999);

      if (total > 0) {
        const accuracy = scoreFP / total;
        const tiers = Array.isArray(cfg?.secretBonus?.endTiers)
          ? cfg.secretBonus.endTiers
          : [];
        for (const t of tiers) {
          const key = String(t?.key || '').trim();
          const min = Number(t?.minAccuracy);
          if (!key || !Number.isFinite(min)) continue;
          if (accuracy >= min) {
            bonusLevel = key;
            break;
          }
        }
      }

      const deckTiers = Array.isArray(cfg?.secretBonus?.endDeckTiers)
        ? cfg.secretBonus.endDeckTiers
        : [];
      const seenCount = seen != null && Number.isFinite(seen) ? seen : 0;
      for (const dt of deckTiers) {
        const key = String(dt?.key || '').trim();
        const min = Number(dt?.minSeen);
        if (!key || !Number.isFinite(min)) continue;
        if (seenCount >= min) {
          bonusDeckTier = key;
          break;
        }
      }

      const byTier =
        bonusW && typeof bonusW === 'object' ? bonusW.endByTier : null;
      const lines =
        bonusLevel && Array.isArray(byTier?.[bonusLevel])
          ? byTier[bonusLevel]
          : null;
      endLineTpl =
        lines && lines.length === 2
          ? `${String(lines[0] || '').trim()} ${String(lines[1] || '').trim()}`.trim()
          : '';
      if (total > 0 && scoreFP === 0) {
        const zeroLine = String(bonusW?.endLineZero || '').trim();
        if (zeroLine) endLineTpl = zeroLine;
      }

      if (bonusLevel && bonusDeckTier) {
        const recoKey = `${bonusLevel}_${bonusDeckTier}`;
        bonusRecoLine = String(bonusW?.endRecoByTier?.[recoKey] || '').trim();
      }
    } else if (isPractice) {
      let practiceEndLineTpl = String(practiceW.endLine || '').trim();
      const practiceEndStatsTpl = String(practiceW.endStatsLine || '').trim();
      const practiceEndStatsAllFixedTpl = String(
        practiceW.endStatsLineAllFixed || ''
      ).trim();
      const rawMistakeCount = Array.isArray(lastRun.mistakeIds)
        ? lastRun.mistakeIds.length
        : 0;
      const total = clampInt(totalPresented, 0, 99999);
      const mistakeCount = clampInt(rawMistakeCount, 0, total);

      let remainingBacklog = null;
      try {
        if (storage && typeof storage.getActiveMistakesCount === 'function') {
          remainingBacklog = clampInt(
            storage.getActiveMistakesCount(),
            0,
            99999
          );
        }
      } catch (_) {
        remainingBacklog = null;
      }

      let backlogAtStart = clampInt(runtime?.practiceBacklogAtStart, 0, 99999);
      if (!backlogAtStart && remainingBacklog != null) {
        backlogAtStart = remainingBacklog + mistakeCount;
      }
      const fixedCount =
        remainingBacklog == null
          ? 0
          : clampInt(backlogAtStart - remainingBacklog, 0, backlogAtStart);

      vars.fixed = fixedCount;
      if (remainingBacklog != null) vars.remaining = remainingBacklog;

      if (remainingBacklog === 0) {
        const allFixedLine = String(practiceW.endLineAllFixed || '').trim();
        if (allFixedLine) practiceEndLineTpl = allFixedLine;
      }

      let repeatNote = '';
      try {
        const tiers = Array.isArray(cfg?.routing?.practiceRepeatTiers)
          ? cfg.routing.practiceRepeatTiers
          : null;

        if (
          tiers &&
          remainingBacklog != null &&
          remainingBacklog >= 1 &&
          fixedCount >= 1
        ) {
          for (const t of tiers) {
            const key = String(t?.key || '').trim();
            const rawMin = Number(t?.minRemaining);
            const min =
              Number.isFinite(rawMin) && rawMin >= 1
                ? Math.floor(rawMin)
                : null;
            if (!key || min == null) continue;
            if (remainingBacklog < min) continue;
            if (key === 'last' && remainingBacklog !== 1) continue;
            if (key === 'light' && fixedCount < remainingBacklog) continue;
            practiceRepeatTierKey = key;
            break;
          }
        }

        const tpl = practiceRepeatTierKey
          ? String(
              practiceW?.endRepeatNoteByTier?.[practiceRepeatTierKey] || ''
            ).trim()
          : '';
        if (tpl) repeatNote = tpl;
      } catch (_) {
        repeatNote = '';
        practiceRepeatTierKey = '';
      }

      if (practiceRepeatTierKey) {
        const tierLine = String(
          practiceW?.endLineByTier?.[practiceRepeatTierKey] || ''
        ).trim();
        if (tierLine) practiceEndLineTpl = tierLine;
      }
      if (total > 0 && scoreFP === 0 && remainingBacklog !== 0) {
        const zeroLine = String(practiceW?.endLineZero || '').trim();
        if (zeroLine) practiceEndLineTpl = zeroLine;
      }

      endLineTpl = practiceEndLineTpl;
      practiceStatsLineTpl =
        remainingBacklog === 0 && practiceEndStatsAllFixedTpl
          ? practiceEndStatsAllFixedTpl
          : practiceEndStatsTpl && remainingBacklog != null
            ? practiceEndStatsTpl
            : '';
      practiceRepeatNoteTpl = repeatNote;
    } else {
      if (isRun && !!lastRun.poolCompleteCelebration) {
        endLineTpl = String(end.poolCompleteLine1 || '').trim();
        runPoolCompleteLine2Tpl = String(end.poolCompleteLine2 || '').trim();
      } else {
        endLineTpl = String(end.endLine || '').trim();
      }

      runVerdictKey = getRunVerdictKeyFromScore(cfg, scoreFP);
      runIdentityTpl = String(
        end?.identityByVerdict?.[runVerdictKey] || ''
      ).trim();
      if (totalPresented > 0 && scoreFP === 0) {
        const zeroLine = String(end?.identityZero || '').trim();
        if (zeroLine) runIdentityTpl = zeroLine;
      }
    }

    return {
      endLineTpl,
      bonusLevel,
      bonusIdentityTpl,
      bonusLensTpl,
      practiceRepeatTierKey,
      practiceStatsLineTpl,
      practiceRepeatNoteTpl,
      runVerdictKey,
      runIdentityTpl,
      runPoolCompleteLine2Tpl,
      bonusDeckTier,
      bonusRecoLine
    };
  }

  function buildEndCopyHtml(ctx) {
    const {
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
    } = ctx;

    const lines = [];

    if (isPractice) {
      const statsLine = practiceStatsLineTpl
        ? fillTemplate(practiceStatsLineTpl, vars)
        : '';
      const repeatLine = practiceRepeatNoteTpl
        ? fillTemplate(practiceRepeatNoteTpl, vars)
        : '';
      if (statsLine)
        lines.push(renderEndCopyLine(statsLine, 'wt-end-copy__stats'));
      if (endLine)
        lines.push(renderEndCopyLine(endLine, 'wt-end-copy__verdict'));
      if (repeatLine)
        lines.push(renderEndCopyLine(repeatLine, 'wt-end-copy__note'));
      return lines.join('');
    }

    if (isBonus) {
      if (bonusStatsLine)
        lines.push(renderEndCopyLine(bonusStatsLine, 'wt-end-copy__stats'));
      if (endLine)
        lines.push(renderEndCopyLine(endLine, 'wt-end-copy__verdict'));
      if (bonusDecisionLine)
        lines.push(renderEndCopyLine(bonusDecisionLine, 'wt-end-copy__note'));
      return lines.join('');
    }

    if (isRun) {
      const directToConsolidation = !!(
        poolCompleteCelebration && clampInt(vars.backlog, 0, 99999) === 0
      );
      const directToConsolidationLine = directToConsolidation
        ? String(end.directToConsolidationLine || '').trim()
        : '';

      if (runStatsLine)
        lines.push(renderEndCopyLine(runStatsLine, 'wt-end-copy__stats'));
      if (endLine)
        lines.push(renderEndCopyLine(endLine, 'wt-end-copy__verdict'));
      if (directToConsolidationLine)
        lines.push(
          renderEndCopyLine(directToConsolidationLine, 'wt-end-copy__note')
        );
      if (runIdentityTpl)
        lines.push(
          renderEndCopyLine(
            fillTemplate(runIdentityTpl, vars),
            'wt-end-copy__note'
          )
        );
      if (!premium && freeRunMessage)
        lines.push(renderEndCopyLine(freeRunMessage, 'wt-end-copy__free'));
      if (runPoolCompleteLine2Tpl && !directToConsolidation) {
        lines.push(
          renderEndCopyLine(
            fillTemplate(runPoolCompleteLine2Tpl, vars),
            'wt-end-copy__note'
          )
        );
      }
      return lines.join('');
    }

    if (endLine) lines.push(renderEndCopyLine(endLine, 'wt-end-copy__verdict'));
    return lines.join('');
  }

  function buildEndMistakesRecap(ctx) {
    const {
      isRun,
      isPractice,
      isBonus,
      lastRun,
      maxChances,
      bonusW,
      practiceW,
      end,
      runtime,
      ui,
      cfg,
      vars
    } = ctx;
    if (!isRun && !isPractice && !isBonus) return '';

    const rawIds = Array.isArray(lastRun.mistakeIds) ? lastRun.mistakeIds : [];
    const ids = isRun ? rawIds.slice(0, maxChances) : rawIds.slice();
    const recapW = isBonus
      ? bonusW || {}
      : isPractice
        ? practiceW || {}
        : end || {};

    const toggleTpl = String(
      recapW.mistakesToggle || end.mistakesToggle || ''
    ).trim();
    const title = String(
      recapW.mistakesTitle || end.mistakesTitle || ''
    ).trim();

    if (!ids.length) {
      return '';
    }

    const labelRaw = toggleTpl
      ? fillTemplate(toggleTpl, { count: String(ids.length) })
      : title;
    const label = String(labelRaw || '')
      .replace(/\(\s*\)/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!label) return '';

    const byId =
      runtime && runtime.contentById && typeof runtime.contentById === 'object'
        ? runtime.contentById
        : {};

    const items = [];
    for (const rawId of ids) {
      const id = Number(rawId);
      if (!Number.isFinite(id)) continue;
      const it = byId[String(id)] || null;
      const t = extractTermsFromItem(it);
      const questionText = String(t.question || '').trim();
      if (!questionText) continue;

      const answerLabel =
        t.correctAnswer === true
          ? String(ui.trueLabel || '').trim()
          : t.correctAnswer === false
            ? String(ui.falseLabel || '').trim()
            : '';

      const expl = String(t.explanationShort || '').trim();
      const pairHtml = answerLabel
        ? `<span class="wt-mistake-pair">${escapeHtml(questionText)} <strong>(${escapeHtml(answerLabel)})</strong></span>`
        : `<span class="wt-mistake-pair">${escapeHtml(questionText)}</span>`;
      const explHtml = expl
        ? `<span class="wt-mistake-expl">${formatExplanationForDisplay(expl, cfg, questionText)}</span>`
        : '';
      items.push(`<div class="wt-mistake-item">${pairHtml}${explHtml}</div>`);
    }

    // The end screen is the natural review moment: keep the missed questions
    // and their explanations visible instead of making users discover them.
    const openAttr = ' open';
    return `
  <details class="wt-accordion"${openAttr}>
    <summary class="wt-accordion-toggle">${renderIcon('chevron-right')}<span>${escapeHtml(label)}</span></summary>
    <div class="wt-accordion-content">${items.join('')}</div>
  </details>
`;
  }

  function buildEndMicroLines(ctx) {
    const {
      isRun,
      premium,
      end,
      runtime,
      pbLine,
      poolCompleteCelebration,
      runIdentityTpl,
      vars,
      pbPremiumHint,
      freeRunMessage,
      lastRun,
      wording,
      streakLine,
      tierLine,
      tierNextLine,
      dailyChallengeLine,
      beatBestLine
    } = ctx;

    const microLines = [];

    if (isRun) {
      // Product choice:
      // for RUN, the top 3 micro-lines are intentionally a tight motivation stack
      // (beat your best, best streak, daily challenge). If none of these are available,
      // we deliberately fall back to category insights, then older PB/tier/support lines
      // instead of leaving the END summary empty.
      if (beatBestLine)
        microLines.push(
          `<p class="wt-meta wt-truncate">${escapeHtml(beatBestLine)}</p>`
        );
      if (streakLine)
        microLines.push(
          `<p class="wt-meta wt-truncate">${escapeHtml(streakLine)}</p>`
        );
      if (dailyChallengeLine)
        microLines.push(
          `<p class="wt-meta wt-truncate">${escapeHtml(dailyChallengeLine)}</p>`
        );

      if (microLines.length) {
        return `
    <div class="wt-end-table">
      ${microLines
        .slice(0, 3)
        .map((line) => `<div class="wt-end-table__row">${line}</div>`)
        .join('')}
    </div>
  `;
      }

      const strongestTagTpl = String(end?.strongestTagLine || '').trim();
      const weakestTagTpl = String(end?.weakestTagLine || '').trim();
      const copyByTag =
        end && typeof end.endTagHighlights === 'object'
          ? end.endTagHighlights
          : null;
      const runMistakeIds = Array.isArray(lastRun?.mistakeIds)
        ? lastRun.mistakeIds
        : [];
      const runItemIds = Array.isArray(lastRun?.runItemIds)
        ? lastRun.runItemIds
        : [];
      const correctAnswers = clampInt(
        runItemIds.length - runMistakeIds.length,
        0,
        99999
      );
      const allowCategoryInsights = correctAnswers >= 5;
      const byId =
        runtime &&
        runtime.contentById &&
        typeof runtime.contentById === 'object'
          ? runtime.contentById
          : {};
      const ignored = new Set([
        'Easy',
        'Medium',
        'Intermediate',
        'Hard',
        'Singles',
        'Doubles',
        'Tournament',
        'Both',
        'Singles only',
        'Doubles only'
      ]);
      const formatEndTag = (tag) => {
        const raw = String(tag || '').trim();
        if (!raw) return '';
        const tagLabels =
          wording &&
          wording.common &&
          typeof wording.common.tagLabels === 'object'
            ? wording.common.tagLabels
            : null;
        if (
          tagLabels &&
          typeof tagLabels[raw] === 'string' &&
          tagLabels[raw].trim()
        ) {
          return tagLabels[raw].trim();
        }
        return raw.replace(/_/g, ' ');
      };

      let strongestShown = false;
      let weakestShown = false;

      if (
        allowCategoryInsights &&
        runItemIds.length > 0 &&
        (strongestTagTpl || weakestTagTpl)
      ) {
        const servedCounts = Object.create(null);
        const mistakeCounts = Object.create(null);

        for (const rawId of runItemIds) {
          const item = byId[String(rawId)] || byId[rawId] || null;
          const tags = extractTagsFromItem(item).filter((t) => !ignored.has(t));
          for (const tag of tags) {
            servedCounts[tag] = clampInt(
              Number(servedCounts[tag] || 0) + 1,
              0,
              9999
            );
          }
        }

        for (const rawId of runMistakeIds) {
          const item = byId[String(rawId)] || byId[rawId] || null;
          const tags = extractTagsFromItem(item).filter((t) => !ignored.has(t));
          for (const tag of tags) {
            mistakeCounts[tag] = clampInt(
              Number(mistakeCounts[tag] || 0) + 1,
              0,
              9999
            );
          }
        }

        let strongestTag = '';
        let strongestCount = 0;
        let strongestTie = false;
        let weakestTag = '';
        let weakestCount = 0;
        let weakestTie = false;

        for (const tag in servedCounts) {
          const served = clampInt(Number(servedCounts[tag] || 0), 0, 9999);
          const missed = clampInt(Number(mistakeCounts[tag] || 0), 0, 9999);
          const correct = clampInt(served - missed, 0, 9999);

          if (correct > strongestCount) {
            strongestTag = tag;
            strongestCount = correct;
            strongestTie = false;
          } else if (correct > 0 && correct === strongestCount) {
            strongestTie = true;
          }

          if (missed > weakestCount) {
            weakestTag = tag;
            weakestCount = missed;
            weakestTie = false;
          } else if (missed > 0 && missed === weakestCount) {
            weakestTie = true;
          }
        }

        if (
          !strongestTie &&
          strongestCount > 0 &&
          strongestTag &&
          strongestTagTpl
        ) {
          microLines.push(
            `<p class="wt-meta wt-truncate">${escapeHtml(fillTemplate(strongestTagTpl, { tag: formatEndTag(strongestTag) }))}</p>`
          );
          strongestShown = true;
        }

        if (!weakestTie && weakestCount > 0 && weakestTag && weakestTagTpl) {
          microLines.push(
            `<p class="wt-meta wt-truncate">${escapeHtml(fillTemplate(weakestTagTpl, { tag: formatEndTag(weakestTag) }))}</p>`
          );
          weakestShown = true;
        }
      }

      if (
        allowCategoryInsights &&
        !strongestShown &&
        !weakestShown &&
        copyByTag &&
        runMistakeIds.length > 0
      ) {
        const counts = Object.create(null);

        for (const rawId of runMistakeIds) {
          const item = byId[String(rawId)] || byId[rawId] || null;
          const tags = extractTagsFromItem(item).filter((t) => !ignored.has(t));
          for (const tag of tags) {
            counts[tag] = clampInt(Number(counts[tag] || 0) + 1, 0, 9999);
          }
        }

        let bestTag = '';
        let bestCount = 0;
        let tie = false;
        for (const tag in counts) {
          const n = clampInt(Number(counts[tag] || 0), 0, 9999);
          if (n > bestCount) {
            bestTag = tag;
            bestCount = n;
            tie = false;
          } else if (n > 0 && n === bestCount) {
            tie = true;
          }
        }

        if (!tie && bestCount >= 1) {
          const line = String(copyByTag[bestTag] || '').trim();
          if (line)
            microLines.push(
              `<p class="wt-meta wt-truncate">${escapeHtml(line)}</p>`
            );
        }
      }
    }

    if (pbLine)
      microLines.push(
        `<p class="wt-meta wt-truncate">${escapeHtml(pbLine)}</p>`
      );
    if (pbPremiumHint)
      microLines.push(
        `<p class="wt-meta wt-truncate">${escapeHtml(pbPremiumHint)}</p>`
      );
    if (streakLine)
      microLines.push(
        `<p class="wt-meta wt-truncate">${escapeHtml(streakLine)}</p>`
      );
    if (tierLine)
      microLines.push(
        `<p class="wt-meta wt-truncate">${escapeHtml(tierLine)}</p>`
      );
    if (tierNextLine)
      microLines.push(
        `<p class="wt-meta wt-truncate">${escapeHtml(tierNextLine)}</p>`
      );
    if (dailyChallengeLine)
      microLines.push(
        `<p class="wt-meta wt-truncate">${escapeHtml(dailyChallengeLine)}</p>`
      );
    if (beatBestLine)
      microLines.push(
        `<p class="wt-meta wt-truncate">${escapeHtml(beatBestLine)}</p>`
      );

    return microLines.length
      ? `
    <div class="wt-end-table">
      ${microLines
        .slice(0, 3)
        .map((line) => `<div class="wt-end-table__row">${line}</div>`)
        .join('')}
    </div>
  `
      : '';
  }

  function buildEndShareBlock(ctx) {
    const { shareEnabled, w, shareTitle, getShareText } = ctx;
    if (!shareEnabled) return '';

    const share = w.share || {};
    const title = String(shareTitle || '').trim();
    const ctaLabel = String(share.ctaLabel || '').trim();
    const nativeLabel = String(share.nativeLabel || '').trim();
    const emailLabel = String(share.emailLabel || '').trim();
    const emailSubject = String(share.emailSubject || '').trim();
    const instagramLabel = String(share.instagramLabel || '').trim();
    const shareAria = String(w.system?.shareAria || '').trim();
    const text = String(getShareText ? getShareText() : '').trim();
    const locale = String(document.documentElement?.lang || 'en').toLowerCase() === 'fr' ? 'fr' : 'en';
    const instagramHref = locale === 'fr' ? './share.html?lang=fr' : './share.html';

    const canCopy = !!(ctaLabel && text);
    const canNative = !!(
      nativeLabel &&
      text &&
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function'
    );
    const canEmail = !!(emailLabel && emailSubject && text);

    if (!title && !text) return '';
    if (!canCopy && !canNative && !canEmail && !instagramLabel && !text) return '';

    return `
      <details class="wt-accordion">
        <summary class="wt-accordion-toggle" aria-label="${escapeHtml(shareAria)}">
          ${renderIcon('chevron-right')}<span>${escapeHtml(title)}</span>
        </summary>

        <div class="wt-accordion-content">
          ${text ? `<p class="wt-muted wt-text-wrap-anywhere">${escapeHtml(text)}</p>` : ``}

          ${
            canCopy || canNative || canEmail
              ? `
            <div class="wt-actions">
              ${
                canNative
                  ? `
                <button type="button" class="wt-btn wt-btn--primary" data-action="share-native">
                  ${escapeHtml(nativeLabel)}
                </button>
              `
                  : ``
              }

              ${
                canCopy
                  ? `
                <button type="button" class="wt-btn wt-btn--secondary" data-action="copy-share">
                  ${escapeHtml(ctaLabel)}
                </button>
              `
                  : ``
              }

              ${
                canEmail
                  ? `
                <button type="button" class="wt-btn wt-btn--secondary" data-action="send-share-email">
                  ${escapeHtml(emailLabel)}
                </button>
              `
                  : ``
              }

              ${
                instagramLabel
                  ? `
                <a class="wt-btn wt-btn--secondary" href="${instagramHref}">
                  ${escapeHtml(instagramLabel)}
                </a>
              `
                  : ``
              }
            </div>
          `
              : ``
          }
        </div>
      </details>
    `;
  }

  function getRuleKnowledgePhaseContext(input) {
    const cfg = input && input.cfg ? input.cfg : {};
    const w = input && input.w ? input.w : {};
    const storage = input && input.storage ? input.storage : null;
    const landing = w.landing || {};

    const poolSize = clampInt(input?.poolSize, 0, 99999);

    let seen = clampInt(input?.seen, 0, 99999);
    if (!seen && storage && typeof storage.getUniqueSeenCount === 'function') {
      try {
        seen = clampInt(storage.getUniqueSeenCount(), 0, 99999);
      } catch (_) {
        seen = 0;
      }
    }

    let mistakes = clampInt(input?.mistakes, 0, 99999);
    if (
      input?.mistakes == null &&
      storage &&
      typeof storage.getActiveMistakesCount === 'function'
    ) {
      try {
        mistakes = clampInt(storage.getActiveMistakesCount(), 0, 99999);
      } catch (_) {
        mistakes = 0;
      }
    }

    const isComplete = poolSize > 0 && seen >= poolSize;
    const mastered = clampInt(poolSize - mistakes, 0, poolSize);
    const key = !isComplete
      ? 'discovery'
      : mistakes > 0
        ? 'correction'
        : 'consolidation';

    const phaseW =
      w.phaseJourney && typeof w.phaseJourney === 'object'
        ? w.phaseJourney[key] || {}
        : {};
    const fallbackBadge =
      key === 'discovery'
        ? String(landing.statsPhaseBadgeDiscovery || '').trim()
        : key === 'correction'
          ? String(landing.statsPhaseBadgeCorrection || '').trim()
          : String(landing.statsPhaseBadgeConsolidation || '').trim();

    return {
      key,
      seen,
      mistakes,
      mastered,
      isComplete,
      badge: String(phaseW.badge || fallbackBadge || '').trim(),
      landingSummaryTemplate: String(
        phaseW.landingSummaryTemplate || ''
      ).trim(),
      landingDetail: String(phaseW.landingDetail || '').trim(),
      landingDetailTemplate: String(phaseW.landingDetailTemplate || '').trim(),
      endLens: String(phaseW.endLens || '').trim(),
      micropics:
        phaseW.micropics && typeof phaseW.micropics === 'object'
          ? phaseW.micropics
          : {}
    };
  }

  function getLandingStatsPreviewState(cfg, poolSize) {
    const statsCfg =
      cfg?.landingStats && typeof cfg.landingStats === 'object'
        ? cfg.landingStats
        : null;
    const previewCfg =
      statsCfg?.preview && typeof statsCfg.preview === 'object'
        ? statsCfg.preview
        : null;

    if (!previewCfg || previewCfg.enabled !== true) return null;

    const paramName = String(previewCfg.queryParam || '').trim();
    if (!paramName || typeof window === 'undefined' || !window.location)
      return null;

    let raw = '';
    try {
      raw = String(
        new URLSearchParams(window.location.search).get(paramName) || ''
      )
        .trim()
        .toLowerCase();
    } catch (_) {
      raw = '';
    }
    if (!raw) return null;

    const states =
      previewCfg.states && typeof previewCfg.states === 'object'
        ? previewCfg.states
        : null;
    const state = states ? states[raw] : null;
    if (!state || typeof state !== 'object') return null;

    const safePoolSize = clampInt(poolSize, 1, 99999);

    function resolvePreviewInt(value) {
      const rawValue = String(value || '').trim();
      if (rawValue === 'poolSize') return safePoolSize;
      return clampInt(value, 0, safePoolSize);
    }

    return {
      seen: resolvePreviewInt(state.seen),
      mistakes: resolvePreviewInt(state.mistakes)
    };
  }

  function getConfiguredMaxLevel(cfg) {
    const raw = Number(cfg?.levels?.maxLevel);
    if (!Number.isFinite(raw)) return 4;
    const n = Math.floor(raw);
    if (n < 1 || n > 20) return 4;
    return n;
  }

  function getLevelPreviewState(cfg) {
    const previewCfg =
      cfg?.levels?.preview && typeof cfg.levels.preview === 'object'
        ? cfg.levels.preview
        : null;
    if (!previewCfg || previewCfg.enabled !== true)
      return { currentLevel: null, unlockedLevel: 0, justUnlocked: false };

    const paramName = String(previewCfg.queryParam || '').trim();
    if (!paramName || typeof window === 'undefined' || !window.location) {
      return { currentLevel: null, unlockedLevel: 0, justUnlocked: false };
    }

    let raw = '';
    try {
      raw = String(
        new URLSearchParams(window.location.search).get(paramName) || ''
      )
        .trim()
        .toLowerCase();
    } catch (_) {
      raw = '';
    }
    if (!raw)
      return { currentLevel: null, unlockedLevel: 0, justUnlocked: false };

    const maxLevel = getConfiguredMaxLevel(cfg);

    if (raw === 'none')
      return { currentLevel: 0, unlockedLevel: 0, justUnlocked: false };

    const unlockMatch = raw.match(/^unlock(\d+)$/);
    if (unlockMatch) {
      const lvl = clampInt(unlockMatch[1], 0, maxLevel);
      return { currentLevel: lvl, unlockedLevel: lvl, justUnlocked: true };
    }

    const levelMatch = raw.match(/^level(\d+)$/);
    if (levelMatch) {
      const lvl = clampInt(levelMatch[1], 0, maxLevel);
      return { currentLevel: lvl, unlockedLevel: 0, justUnlocked: false };
    }

    return { currentLevel: null, unlockedLevel: 0, justUnlocked: false };
  }

  function getAppLevelModel(storage, cfg, w) {
    const levelsW =
      w && w.levels && typeof w.levels === 'object' ? w.levels : {};
    const maxLevel = getConfiguredMaxLevel(cfg);
    const emptyUnlocked = {};
    for (let level = 1; level <= maxLevel; level += 1) emptyUnlocked[level] = 0;

    const baseState =
      storage && typeof storage.getLevelState === 'function'
        ? storage.getLevelState()
        : { currentLevel: 0, unlockedAtByLevel: emptyUnlocked };
    const preview = getLevelPreviewState(cfg);
    const effectiveLevel =
      preview.currentLevel == null
        ? clampInt(baseState.currentLevel, 0, maxLevel)
        : clampInt(preview.currentLevel, 0, maxLevel);

    const defs = Array.from({ length: maxLevel }, (_, index) => index + 1).map((level) => {
      const raw =
        levelsW.byLevel && typeof levelsW.byLevel === 'object'
          ? levelsW.byLevel[level] || {}
          : {};
      return {
        level,
        label: String(raw.label || '').trim(),
        unlock: String(raw.unlock || '').trim(),
        sheetBody: String(raw.sheetBody || '').trim(),
        unlocked: effectiveLevel >= level,
        current: effectiveLevel === level
      };
    });

    return {
      state: {
        currentLevel: effectiveLevel,
        unlockedAtByLevel: baseState.unlockedAtByLevel || {}
      },
      defs,
      current: defs.find((item) => item.level === effectiveLevel) || null,
      next: defs.find((item) => item.level === effectiveLevel + 1) || null,
      levelsW,
      preview,
      maxLevel
    };
  }

  function buildEndActionsHtml(ctx) {
    const {
      storage,
      w,
      cfg,
      vars,
      premium,
      end,
      postW,
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
      dailyChallengeCta,
      focusedEndPrimaryAction,
      focusedEndPrimaryLabel,
      forceSinglePrimary,
      suppressPracticeSecondary
    } = ctx;

    const exhausted = !!(
      storage &&
      typeof storage.isPoolExhausted === 'function' &&
      storage.isPoolExhausted() === true
    );
    const mastered = !!(
      storage &&
      typeof storage.isMastered === 'function' &&
      storage.isMastered() === true
    );
    const hasActiveMistakes = clampInt(vars.backlog, 0, 99999) > 0;

    const masteredTitle = String(postW.masteredTitle || '').trim();
    const masteredL1 = String(postW.masteredLine1 || '').trim();
    const masteredL2 = String(postW.masteredLine2 || '').trim();
    const masteredHtml =
      mastered && (masteredTitle || masteredL1 || masteredL2)
        ? `
        <div class="wt-end-mastered-copy wt-stack wt-stack--xs">
          ${masteredTitle ? `<p class="wt-meta"><strong>${escapeHtml(masteredTitle)}</strong></p>` : ``}
          ${masteredL1 ? `<p class="wt-muted">${escapeHtml(masteredL1)}</p>` : ``}
          ${masteredL2 ? `<p class="wt-muted">${escapeHtml(masteredL2)}</p>` : ``}
        </div>
      `
        : ``;

    let primaryAction = '';
    let primaryLabel = '';
    let secondaryAction = '';
    let secondaryLabel = '';

    const focusedAction = String(focusedEndPrimaryAction || '').trim();
    const focusedLabel = String(focusedEndPrimaryLabel || '').trim();

    if (!mastered && focusedAction && focusedLabel) {
      primaryAction = focusedAction;
      primaryLabel = focusedLabel;
      if (focusedAction === 'start-run' && canPractice && !runsExhausted) {
        secondaryAction = 'start-practice';
        secondaryLabel = String(practiceCta || '').trim();
      }
    } else if (mastered) {
      primaryAction = 'start-secret-bonus';
      primaryLabel = String(postW.masteredCtaBonus || '').trim();
      secondaryAction = 'start-run';
      secondaryLabel = String(postW.masteredCtaReplay || '').trim();
    } else if (exhausted && hasActiveMistakes) {
      primaryAction = 'start-practice';
      const tpl = premium
        ? String(end.practiceCtaCountPremium || '').trim()
        : String(end.practiceCta || '').trim();
      primaryLabel = tpl
        ? fillTemplate(tpl, { backlog: String(vars.backlog) })
        : '';
      secondaryAction = 'start-run';
      secondaryLabel = String(end.playAgain || '').trim();
    } else if (isRun) {
      if (runShouldPromotePractice) {
        primaryAction = 'start-practice';
        primaryLabel = String(practiceCta || '').trim();
        secondaryAction = runsExhausted ? 'open-paywall' : 'start-run';
        secondaryLabel = runsExhausted
          ? String(upgradeCta || '').trim()
          : String(runPlayAgain || '').trim();
      } else if (runShouldPromoteBonus) {
        primaryAction = 'start-secret-bonus';
        primaryLabel = runBonusPrimaryLabel;
        secondaryAction = runsExhausted ? 'open-paywall' : 'start-run';
        secondaryLabel = runsExhausted
          ? String(upgradeCta || '').trim()
          : String(runPlayAgain || '').trim();
      } else {
        primaryAction = runsExhausted ? 'open-paywall' : 'start-run';
        primaryLabel = runsExhausted
          ? String(upgradeCta || '').trim()
          : String(runPlayAgain || '').trim();
        if (canPractice && suppressPracticeSecondary !== true) {
          secondaryAction = 'start-practice';
          secondaryLabel = String(practiceCta || '').trim();
        }
      }
    } else if (isPractice) {
      const remaining = Number(vars.remaining);
      const isZero = Number.isFinite(remaining) && remaining <= 0;
      if (isZero) {
        primaryAction = 'start-run';
        primaryLabel = String(end.playAgain || '').trim();
      } else {
        primaryAction = 'start-practice';
        primaryLabel = String(practiceAgain || '').trim();
        secondaryAction = 'start-run';
        secondaryLabel = String(end.playAgain || '').trim();
      }
    } else if (isBonus) {
      const expandDeckLabel = String(bonusW?.ctaExpandDeck || '').trim();
      const shouldExpandDeck = bonusDeckTier === 'small' && !!expandDeckLabel;
      if (shouldExpandDeck) {
        primaryAction = 'start-run';
        primaryLabel = expandDeckLabel;
        secondaryAction = 'start-secret-bonus';
        secondaryLabel = String(bonusAgain || '').trim();
      } else {
        primaryAction = 'start-secret-bonus';
        primaryLabel = String(bonusAgain || '').trim();
        secondaryAction = 'start-run';
        secondaryLabel = String(end.playAgain || '').trim();
      }
    }

    if (
      forceSinglePrimary !== true &&
      isRun &&
      !runsExhausted &&
      dailyChallengeNeedsReplayReward === true &&
      dailyChallengeCta &&
      primaryAction === 'start-run'
    ) {
      primaryAction = 'start-daily-challenge';
      primaryLabel = String(dailyChallengeCta || '').trim();
    }

    if (
      forceSinglePrimary !== true &&
      isRun &&
      !runsExhausted &&
      dailyChallengeIncomplete === true &&
      dailyChallengeCta &&
      primaryAction !== 'start-run' &&
      !secondaryAction &&
      !secondaryLabel
    ) {
      secondaryAction = 'start-daily-challenge';
      secondaryLabel = String(dailyChallengeCta || '').trim();
    }

    if (!primaryLabel || !primaryAction) return masteredHtml || ``;

    if (forceSinglePrimary === true && !secondaryAction) {
      secondaryAction = '';
      secondaryLabel = '';
    }

    const secondaryBtn =
      secondaryLabel && secondaryAction
        ? `
        <button class="wt-btn wt-btn--secondary" data-action="${escapeHtml(secondaryAction)}">
          ${escapeHtml(secondaryLabel)}
        </button>
      `
        : ``;

    return `
  ${masteredHtml}
  <button class="wt-btn wt-btn--primary" data-action="${escapeHtml(primaryAction)}">
    ${escapeHtml(primaryLabel)}
  </button>
  ${secondaryBtn}
`;
  }

  UI.prototype._renderEnd = function () {
    if (!window.WT_UI_End || typeof window.WT_UI_End.render !== 'function') {
      throw new Error('WT_UI_End.render missing');
    }
    return window.WT_UI_End.render(this, {
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
    });
  };

  UI.prototype._renderPlaying = function () {
    const wAll = this.wording || {};
    const w = Object.assign({}, wAll.practice?.playing || {}, wAll.playing || {});
    const ui = wAll.ui || {};
    const cfg = this.config || {};
    const premium = isPremiumNow(this.storage);
    // Get live state from game engine
    const gameState = this.game.getState ? this.game.getState() : {};

    // Contract: PRACTICE has null chances → respect null (no fallback to config)
    const maxChancesRaw = gameState.maxChances;
    const maxChances =
      maxChancesRaw != null
        ? Number(maxChancesRaw)
        : Number(cfg.game?.maxChances);
    const chancesLeftRaw = gameState.chancesLeft;
    const chancesLeft = chancesLeftRaw != null ? Number(chancesLeftRaw) : NaN;
    const hasChances =
      chancesLeftRaw != null &&
      Number.isFinite(maxChances) &&
      maxChances > 0 &&
      Number.isFinite(chancesLeft);
    const scoreFP = Number(gameState.scoreFP);

    const scoreLabel = String(ui.scoreLabel || '').trim();

    const fpShort = String(ui.fpShort || '').trim();
    const scoreAriaTpl = String(ui.scoreAriaTemplate || '').trim();

    // HUD policy: do NOT show FP in PLAYING (unit is explicit in END only).
    // We still replace {fpShort} in aria templates to avoid leaking "{fpShort}".
    const scoreAria = scoreAriaTpl
      ? fillTemplate(scoreAriaTpl, { scoreLabel, score: scoreFP, fpShort: '' })
          .replace(/\s+/g, ' ')
          .trim()
      : '';

    // Personal best (HUD anchor): show for everyone if explicitly enabled + a best exists
    const bestLabel = String(ui?.bestScoreLabel || '').trim();
    const bestAriaTpl = String(ui?.bestScoreAriaTemplate || '').trim();

    const pbCfg =
      cfg?.personalBest && typeof cfg.personalBest === 'object'
        ? cfg.personalBest
        : null;
    const pbEnabled = !!(pbCfg && pbCfg.enabled === true);

    const modeNow = String(this._runtime?.runMode || 'RUN').trim();

    let bestScoreFP = null;
    if (pbEnabled && this.storage) {
      try {
        if (
          modeNow === 'BONUS' &&
          typeof this.storage.getBonusBest === 'function'
        ) {
          const bb = this.storage.getBonusBest() || null;
          const b = Number(bb?.bestScoreFP);
          if (Number.isFinite(b) && b > 0) bestScoreFP = Math.floor(b);
        } else if (typeof this.storage.getPersonalBest === 'function') {
          const pb = this.storage.getPersonalBest() || null;
          const b = Number(pb?.bestScoreFP);
          if (Number.isFinite(b) && b > 0) bestScoreFP = Math.floor(b);
        }
      } catch (_) {
        bestScoreFP = null;
      }
    }

    const bestAria =
      bestScoreFP != null && bestAriaTpl
        ? fillTemplate(bestAriaTpl, { best: bestScoreFP })
            .replace(/\s+/g, ' ')
            .trim()
        : '';

    const scoreAriaFull = [scoreAria, bestAria]
      .filter(Boolean)
      .join(' ')
      .trim();

    // Header (score left, best/lives right)
    const pulseAt = Number(this._runtime?.chanceLostPulseAt || 0);
    // Expected: WT_CONFIG.ui.gameplayPulseMs (number, milliseconds)
    const pulseMs = Number(cfg?.ui?.gameplayPulseMs);

    // Fail-closed: invalid/missing config => no pulse
    const pulseOn =
      pulseAt > 0 &&
      Number.isFinite(pulseMs) &&
      pulseMs > 0 &&
      Date.now() - pulseAt <= pulseMs;

    // Score flash: mirrors danger-pulse logic (correct answer â†’ green flash)
    const scoreFlashAt = Number(this._runtime?.scoreFlashAt || 0);
    const scoreFlashMs = Number(cfg?.ui?.gameplayPulseMs);
    const scoreFlashOn =
      scoreFlashAt > 0 &&
      Number.isFinite(scoreFlashMs) &&
      scoreFlashMs > 0 &&
      Date.now() - scoreFlashAt <= scoreFlashMs;

    // HUD deltas (arcade): +1 on score flash, +1 mistake on mistake pulse
    // Copy visible => WT_WORDING.ui (pas WT_CONFIG)
    const scoreDeltaText = modeNow === 'RUN' && Number(gameState.correctCount || 0) > 4 && Number(this._runtime?.microPics?.correctStreak || 0) > 4
      ? '+2'
      : String(ui?.scoreGainedDeltaText || '').trim();
    const scoreDeltaHtml =
      scoreFlashOn && scoreDeltaText
        ? `<span class="wt-pill__delta wt-pill__delta--score" aria-hidden="true">${escapeHtml(scoreDeltaText)}</span>`
        : '';

    const mistakeDeltaText = String(ui?.mistakeGainedDeltaText || '').trim();
    const mistakeDeltaHtml =
      pulseOn && mistakeDeltaText
        ? `<span class="wt-pill__delta wt-pill__delta--mistake wt-pill__delta--minus" aria-hidden="true">${escapeHtml(mistakeDeltaText)}</span>`
        : '';

    const bonusBadge = String(this.wording?.secretBonus?.badge || '').trim();
    const practiceBadge = String(this.wording?.practice?.title || '').trim();

    // At-best (RUN + premium): one-shot pulse when you REACH the best during PLAYING.
    // UI-only: driven by this._runtime.atBestPulseAt (timestamp). Fail-closed => false.
    const atBestPulseAt = Number(this._runtime?.atBestPulseAt || 0);
    const atBestOn =
      atBestPulseAt > 0 &&
      Number.isFinite(pulseMs) &&
      pulseMs > 0 &&
      Date.now() - atBestPulseAt <= pulseMs;

    // New best (RUN + premium): celebration pulse when you EXCEED personal best during PLAYING (best -> best+1).
    const newBestPulseAt = Number(this._runtime?.newBestPulseAt || 0);
    const newBestOn =
      newBestPulseAt > 0 &&
      Number.isFinite(pulseMs) &&
      pulseMs > 0 &&
      Date.now() - newBestPulseAt <= pulseMs;

    // Near-best tension (RUN + premium only): subtle pulse when within 2 FP of personal best.
    // Priority: do NOT stack with score flash / at-best / new-best.
    const nearBestOn =
      !scoreFlashOn &&
      !atBestOn &&
      !newBestOn &&
      (modeNow === 'RUN' || modeNow === 'BONUS') &&
      pbEnabled === true &&
      premium === true &&
      bestScoreFP != null &&
      bestScoreFP > scoreFP &&
      bestScoreFP - scoreFP <= 2;

    const deckSizeRaw = Number(gameState?.deckSize);

    const secretBonusDeckCount =
      Number.isFinite(deckSizeRaw) && deckSizeRaw > 0
        ? Math.floor(deckSizeRaw)
        : null;

    const seenOnlyLine =
      secretBonusDeckCount != null
        ? fillTemplate(
            String(this.wording?.secretBonus?.seenOnlyLine || '').trim(),
            { count: secretBonusDeckCount }
          )
        : '';
    const servedSoFar = Array.isArray(this._runtime?.runItemIds)
      ? this._runtime.runItemIds.length
      : 0;

    const qHeadingTpl = String(w.questionHeadingTemplate || '').trim();
    const qNum =
      this._runtime?.feedbackPending === true ? servedSoFar : servedSoFar + 1;
    const headingHtml =
      qHeadingTpl && Number.isFinite(qNum) && qNum > 0
        ? `<p class="wt-muted wt-question-heading">${escapeHtml(fillTemplate(qHeadingTpl, { n: qNum }))}</p>`
        : '';

    const showSeenOnlyRule =
      modeNow === 'BONUS' &&
      this._runtime?.feedbackPending !== true &&
      !!seenOnlyLine;

    // --- Mistakes model ---
    const mistakesLabel = String(ui.mistakesLabel || '').trim();

    const mcInt =
      Number.isFinite(maxChances) && maxChances > 0
        ? Math.floor(maxChances)
        : 0;

    const leftInt = Number.isFinite(chancesLeft)
      ? Math.max(0, Math.floor(chancesLeft))
      : 0;

    const mistakesCount =
      mcInt > 0 ? Math.max(0, Math.min(mcInt, mcInt - leftInt)) : 0;

    const livesVisual =
      mcInt > 0
        ? Array(mcInt)
            .fill(null)
            .map((_, i) => {
              const isOn = i < mistakesCount;
              const isLast =
                isOn && mistakesCount > 0 && i === mistakesCount - 1;
              return `<span class="wt-hud-lives__dot${isOn ? '' : ' wt-hud-lives__dot--off'}${isLast ? ' wt-hud-lives__dot--last' : ''}" aria-hidden="true"></span>`;
            })
            .join('')
        : '';

    const correctStreak = clampInt(
      this._runtime?.microPics?.correctStreak,
      0,
      9999
    );
    const momentumMax = getMomentumSegments(cfg) || 6;
    const momentumLevel = clampInt(
      this._runtime?.microPics?.momentumLevel,
      0,
      momentumMax
    );
    const momentumState = getMomentumMeterState(
      cfg,
      correctStreak,
      modeNow,
      momentumLevel
    );

    const momentumHtml = momentumState
      ? `
        <div class="wt-momentum-wrap">
          <div class="wt-momentum" title="${escapeHtml(String(wAll.system?.comboRule || ''))}" aria-label="${escapeHtml(fillTemplate(String(wAll?.system?.momentumAria || 'Momentum {filled}/{segments}'), { filled: momentumState.filled, segments: momentumState.segments }))}">
            ${Array(momentumState.segments)
              .fill(null)
              .map(
                (_, i) => `
              <span class="wt-momentum__seg${i < momentumState.filled ? ' wt-momentum__seg--on' : ''}${momentumState.filled === momentumState.segments && i === momentumState.segments - 1 ? ' wt-momentum__seg--max' : ''}" aria-hidden="true"></span>
            `
              )
              .join('')}
          </div>
          ${
            momentumState.streak >= momentumState.segments
              ? `
            <span class="wt-momentum__combo" aria-label="${escapeHtml(String(wAll.system?.doublePoints || ''))}">×2</span>
          `
              : `<span class="wt-momentum__goal" aria-hidden="true">×2</span>`
          }
        </div>
      `
      : '';

    const headerHtml = `
	   <div class="wt-hud">
          <div class="wt-hud__left">
            ${
              hasChances
                ? `
              <div class="wt-pill wt-hud-metric wt-hud-metric--mistakes wt-pill--chances${pulseOn ? ' wt-pill--danger-pulse' : ''}" aria-label="${escapeHtml(mistakesLabel)}: ${mistakesCount}/${mcInt}">
                ${mistakesLabel ? `<small>${escapeHtml(mistakesLabel)}</small>` : ``}
                ${mistakesCount}/${mcInt}${mistakeDeltaHtml}
                ${livesVisual}
              </div>
            `
                : ``
            }
            ${
              modeNow === 'PRACTICE' && practiceBadge
                ? `
              <div class="wt-pill wt-hud-metric wt-hud-metric--mode" aria-label="${escapeHtml(practiceBadge)}">
                <span>${escapeHtml(practiceBadge)}</span>
              </div>
            `
                : ``
            }
          </div>
          <div class="wt-hud__right">
          ${
            modeNow !== 'PRACTICE'
              ? `
            <div class="wt-pill wt-hud-metric wt-hud-metric--score wt-pill--score${scoreFlashOn ? ' wt-pill--score-flash' : ''}${atBestOn ? ' wt-pill--at-best' : ''}${newBestOn ? ' wt-pill--new-best' : ''}${nearBestOn ? ' wt-pill--near-best' : ''}"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              aria-label="${escapeHtml(scoreAriaFull)}">
              ${scoreLabel ? `<small>${escapeHtml(scoreLabel)}</small>` : ``}
              ${scoreFP}${scoreDeltaHtml}
              ${bestScoreFP != null && bestLabel ? `<span class="wt-pill__sub">${escapeHtml(bestLabel)} ${bestScoreFP}</span>` : ``}
            </div>
          `
              : ``
          }
          </div>
	    </div>

      ${momentumHtml}

	  	    ${
            showSeenOnlyRule
              ? `
	      <p class="wt-muted wt-playing-seenonly">
	        ${escapeHtml(seenOnlyLine)}
	      </p>
	    `
              : ``
          }
	  `;

    // Current item (question)
    const item = this._runtime.feedbackPending
      ? this._runtime.frozenItem
      : this.game.getCurrent
        ? this.game.getCurrent()
        : null;

    // Secret bonus fall: only if config is explicitly provided and valid.
    const sb = cfg?.secretBonus || {};
    const fall = sb && typeof sb === 'object' ? sb.fall : null;

    const fallEnabled =
      modeNow === 'BONUS' &&
      fall &&
      typeof fall === 'object' &&
      fall.enabled === true &&
      Number.isFinite(Number(fall.initialSpeed)) &&
      Number(fall.initialSpeed) > 0 &&
      Number.isFinite(Number(fall.maxSpeed)) &&
      Number(fall.maxSpeed) > 0 &&
      Number.isFinite(Number(fall.speedIncrement)) &&
      Number(fall.speedIncrement) >= 0 &&
      Number.isFinite(Number(fall.dangerThreshold)) &&
      Number(fall.dangerThreshold) > 0 &&
      Number(fall.dangerThreshold) < 1;

    const shellAttrs = [
      `data-wt-mode="${escapeHtml(modeNow.toLowerCase())}"`,
      `data-wt-state="playing"`
    ];
    if (fallEnabled) shellAttrs.push(`data-wt-bonus-layout="fall"`);

    const logoUrl = String(cfg?.identity?.uiLogoUrl || '').trim();
    const bonusTitle = String(this.wording?.secretBonus?.title || '').trim();
    const bonusSubtitle = String(
      this.wording?.secretBonus?.subtitle || ''
    ).trim();

    // PLAYING: branding always visible (Option A)
    // KISS: reuse the existing go-home action so BONUS can exit the same way as other modes.
    let brandingHtml = renderBrandingRow(cfg, true, false);

    if (modeNow === 'BONUS') {
      brandingHtml = `
        <div class="wt-bonus-branding">
          <div class="wt-bonus-branding__top">
            ${renderBrandingRow(cfg, true, false)}
          </div>
        </div>
              ${
                bonusSubtitle
                  ? `
          <p class="wt-muted wt-bonus-subtitle">
            ${escapeHtml(bonusSubtitle)}
          </p>
        `
                  : ``
              }
      `;
    }

    function renderShell(innerHtml) {
      return `
  <div class="wt-container" ${shellAttrs.join(' ')}>
    <div class="wt-playing-hero">
      ${brandingHtml}
      ${headingHtml}
      ${headerHtml}
    </div>
    ${innerHtml}
  </div>
`;
    }

    if (!item) {
      return renderShell(`
      <div class="wt-card">
        <p class="wt-muted">${escapeHtml(String(wAll.system?.loading || '').trim())}</p>
      </div>
    `);
    }

    const questionText = String(item.question || '').trim();
    const speechLocale = getQuestionSpeechLocale();
    const speechSupported = supportsQuestionSpeechForLocale(speechLocale);
    const speechKey = `${speechLocale}:${Number(item?.id || 0)}:${questionText}`;
    const isQuestionSpeaking =
      speechSupported &&
      this._runtime?.questionSpeechActive === true &&
      this._runtime?.questionSpeechKey === speechKey;
    const autoReadEnabled = isAutoReadQuestionsEnabled(this.storage);
    const speakLabel = String(wAll.system?.speakQuestion || '').trim();
    const replayLabel = String(
      wAll.system?.replayQuestion || speakLabel
    ).trim();
    const stopLabel = String(wAll.system?.stopQuestion || '').trim();
    const speakAria = String(
      wAll.system?.speakQuestionAria || speakLabel
    ).trim();
    const replayAria = String(
      wAll.system?.replayQuestionAria || replayLabel || speakAria
    ).trim();
    const stopAria = String(wAll.system?.stopQuestionAria || stopLabel).trim();
    const questionAudioHtml =
      speechSupported &&
      shouldShowQuestionAudioControl(isQuestionSpeaking) &&
      !this._runtime.feedbackPending &&
      (speakLabel || stopLabel)
        ? `
  <div class="wt-question-tools">
    <button
      type="button"
      class="wt-text-action wt-question-audio${isQuestionSpeaking ? ' wt-pulse' : ''}"
      data-action="toggle-question-audio"
      aria-pressed="${isQuestionSpeaking ? 'true' : 'false'}"
      aria-label="${escapeHtml(isQuestionSpeaking ? stopAria : autoReadEnabled ? replayAria : speakAria)}"
    >
      ${renderIcon('volume-2')}
	      <span class="sr-only">${escapeHtml(isQuestionSpeaking ? stopLabel || replayLabel || speakLabel : autoReadEnabled ? replayLabel || speakLabel : speakLabel)}</span>
    </button>
  </div>
`
        : '';

    const bonusPrompt = String(
      this.wording?.secretBonus?.questionPrompt || ''
    ).trim();

    // PRACTICE: calm progress line instead of assertion
    // RUN: always show assertion
    // BONUS: no assertion
    let questionPrompt = '';
    if (modeNow === 'PRACTICE') {
      const deckTotal =
        this.game && typeof this.game.getTotal === 'function'
          ? this.game.getTotal()
          : 0;
      const progressTpl = String(
        wAll.practice?.playingProgressLine || ''
      ).trim();
      questionPrompt =
        progressTpl && deckTotal > 0
          ? fillTemplate(progressTpl, { current: qNum, total: deckTotal })
          : '';
    } else if (modeNow !== 'BONUS') {
      questionPrompt = String(w.assertion || '').trim();
    }

    const questionPromptId = questionPrompt ? 'wt-question-prompt' : '';
    const questionTextId = 'wt-question-text';
    const choiceGroupDescribedBy = questionPromptId
      ? ` aria-describedby="${questionPromptId}"`
      : '';

    const questionHtml = `


${
  questionPrompt
    ? `
  <p id="${questionPromptId}" class="wt-question-prompt">
    ${escapeHtml(questionPrompt)}
  </p>
`
    : ``
}
${questionAudioHtml}
<div class="wt-terms-box">
  <div class="wt-term-row">
    <span id="${questionTextId}" class="wt-term-word">${escapeHtml(questionText)}</span>
  </div>
</div>
`;

    syncAutoReadCurrentQuestion(this);

    // If feedback is pending but temporarily hidden (chance lost focus), show frozen item only (no choices).
    if (
      this._runtime.feedbackPending &&
      this._runtime.feedbackReveal !== true
    ) {
      return renderShell(`
      <div class="wt-card" role="status" aria-live="polite">
        ${questionHtml}
      </div>
    `);
    }

    // If feedback is pending, show feedback block
    if (this._runtime.feedbackPending && this._runtime.lastAnswer) {
      const ans = this._runtime.lastAnswer;
      const isCorrect = ans.isCorrect === true;
      const feedbackClass = isCorrect ? 'wt-feedback--ok' : 'wt-feedback--bad';

      const verdictText = isCorrect
        ? String(w.feedbackTitleOk || '').trim()
        : String(w.feedbackTitleBad || '').trim();

      // Show the correct answer label in the title (no fallback)
      const correctLabel =
        ans.correctAnswer === true
          ? String(ui.trueLabel || '').trim()
          : String(ui.falseLabel || '').trim();

      const titleLine =
        verdictText && correctLabel
          ? `${verdictText} - ${correctLabel}`
          : verdictText || correctLabel || '';

      const learnLine = isCorrect
        ? String(w.feedbackMicroOk || '').trim()
        : String(w.feedbackMicroBad || '').trim();

      // Optional clarity line: "You chose: <label>" (no fallback)
      const pickedLabel =
        ans.pickedAnswer === true
          ? String(ui.trueLabel || '').trim()
          : String(ui.falseLabel || '').trim();

      const youChosePrefix = String(wAll.system?.youChosePrefix || '').trim();
      const youChoseLine =
        youChosePrefix && pickedLabel ? `${youChosePrefix} ${pickedLabel}` : '';

      const continueCta = String(wAll.system?.continue || '').trim();
      const tapToContinue = String(wAll.system?.tapToContinue || '').trim();
      const autoGameOverAfterFeedback =
        this._runtime?.autoGameOverAfterFeedback === true;
      const feedbackActionAttr = autoGameOverAfterFeedback
        ? ` data-action="continue"`
        : '';

      // Stable explanation for the frozen item during feedback (KISS)
      const stableExplanation = String(ans.feedbackLine || '').trim();

      const explanationLabel = String(w.explanationLabel || '').trim();
      let courtDiagramHtml = '';
      try {
        courtDiagramHtml = window.WT_Court
          ? window.WT_Court.svgFor(
              extractTagsFromItem(item),
              String(document.documentElement.lang || '').slice(0, 2)
            )
          : '';
      } catch (_) {
        courtDiagramHtml = '';
      }

      const explanationHtml = stableExplanation
        ? `<p class="wt-explanation">${courtDiagramHtml}${explanationLabel ? `<span class="wt-explanation__label">${escapeHtml(explanationLabel)}</span>` : ``}${formatExplanationForDisplay(stableExplanation, cfg, questionText)}</p>`
        : '';

      return renderShell(`
  <div class="wt-card" role="status" aria-live="polite"${feedbackActionAttr}>
    ${questionHtml}

    <div class="wt-feedback ${feedbackClass}">
	      <strong class="wt-feedback-title">
	                    ${escapeHtml(titleLine)}
	      </strong>
	      ${
          learnLine
            ? `
	        <div class="wt-feedback__learn-line">
	          ${escapeHtml(learnLine)}
	        </div>
	      `
            : ``
        }
	      ${
        youChoseLine
          ? `
        <div class="wt-muted wt-feedback__subline">
          ${escapeHtml(youChoseLine)}
        </div>
      `
          : ``
      }
    </div>

            ${explanationHtml}


            ${
              !autoGameOverAfterFeedback
                ? `
      <div class="wt-actions wt-modal-actions wt-modal-actions--lg">
        <button class="wt-btn wt-btn--primary" data-action="continue">
          ${escapeHtml(continueCta)}
        </button>
      </div>
    `
                : ``
            }


    ${
      !autoGameOverAfterFeedback && shouldTapToContinue() && tapToContinue
        ? `
      <p class="wt-muted wt-tap-hint">
        ${escapeHtml(tapToContinue)}
      </p>
    `
        : ``
    }
  </div>
`);
    }

    const trueLabel = String(ui.trueLabel || '').trim();
    const falseLabel = String(ui.falseLabel || '').trim();
    const reviewLastFeedbackLabel = String(
      wAll.system?.reviewLastFeedback || ''
    ).trim();
    const reviewLastFeedbackHtml =
      modeNow !== 'BONUS' &&
      this._runtime?.feedbackPending !== true &&
      this._runtime?.lastFeedbackReview &&
      reviewLastFeedbackLabel
        ? `
        <button type="button" class="wt-btn wt-btn--secondary wt-review-feedback" data-action="review-feedback">
          ${escapeHtml(reviewLastFeedbackLabel)}
        </button>
      `
        : '';

    // Default: show question with True/False buttons
    // Secret bonus fall adds semantic wrappers only (CSS decides fixed/no-scroll layout).
    const danger01 = fallEnabled ? Number(fall.dangerThreshold) : 0;

    const dangerLabel = fallEnabled
      ? String(this.wording?.secretBonus?.dangerLineLabel || '').trim()
      : '';
    const dangerAria = fallEnabled
      ? String(this.wording?.secretBonus?.dangerLineAria || '').trim()
      : '';

    return renderShell(`
    <div class="wt-card">
      ${
        fallEnabled
          ? `
        <div class="wt-bonus-lane" data-wt-bonus-lane>
          <div class="wt-bonus-fail-line" data-wt-bonus-fail style="top:${Math.round(danger01 * 100)}%"></div>
          ${
            dangerLabel
              ? `
            <div class="wt-bonus-fail-label" data-wt-bonus-fail-label style="top:${Math.round(danger01 * 100)}%" aria-label="${escapeHtml(dangerAria || dangerLabel)}">
              ${escapeHtml(dangerLabel)}
            </div>
          `
              : ``
          }
          <div class="wt-bonus-chip" data-wt-bonus-chip>
            ${questionHtml}
          </div>
        </div>
      `
          : `
        ${questionHtml}
      `
      }

      ${
        fallEnabled
          ? `
        <div class="wt-choices" role="group" aria-labelledby="${questionTextId}"${choiceGroupDescribedBy}>
          <button class="wt-choice wt-choice--same" data-action="answer-true" aria-label="${escapeHtml(trueLabel)}">
            <span class="wt-choice-icon" aria-hidden="true">\u2714</span>
            ${escapeHtml(trueLabel)}
          </button>
          <button class="wt-choice wt-choice--diff" data-action="answer-false" aria-label="${escapeHtml(falseLabel)}">
            <span class="wt-choice-icon" aria-hidden="true">\u2716</span>
            ${escapeHtml(falseLabel)}
          </button>
        </div>
      `
          : `
        <div class="wt-answer-zone">
          <div class="wt-choices" role="group" aria-labelledby="${questionTextId}"${choiceGroupDescribedBy}>
            <button class="wt-choice wt-choice--same" data-action="answer-true" aria-label="${escapeHtml(trueLabel)}">
              <span class="wt-choice-icon" aria-hidden="true">\u2714</span>
              ${escapeHtml(trueLabel)}
            </button>
            <button class="wt-choice wt-choice--diff" data-action="answer-false" aria-label="${escapeHtml(falseLabel)}">
              <span class="wt-choice-icon" aria-hidden="true">\u2716</span>
              ${escapeHtml(falseLabel)}
            </button>
          </div>
        </div>
      `
      }

      ${reviewLastFeedbackHtml}



    </div>
  `);
  };

  UI.prototype._renderPaywall = function () {
    const mod = window.WT_UI_Paywall;
    if (!mod || typeof mod.render !== 'function') {
      throw new Error('WT_UI_Paywall.render missing');
    }
    return mod.render(this, {
      escapeHtml,
      fillTemplate,
      formatCents,
      mmss,
      renderTextWithStrong,
      renderBrandingRow,
      clampInt,
      isPremiumNow
    });
  };

  // ============================================
  // Export
  // ============================================

  window.WT_UI = UI;
})();
