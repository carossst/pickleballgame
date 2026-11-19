function UI({ storage, game, config, wording }) {
    this.storage = storage;
    this.game = game;
    this.config = config || {};
    this.wording = wording || {};
    this.state = STATES.LANDING;

    this.appEl = el('app');
    this.modalEl = el('modal');
    this.modalContentEl = el('modal-content');

    // Footer preservation (KISS):
    // If the footer lives inside #app in index.html, render() would wipe it via innerHTML.
    // We detach and re-attach the same node to keep all footer content intact.
    this._footerNode = null;

    // Paywall ticker (UI-only)
    this._paywallTickerId = null;

    this._runtime = {
      contentItems: [],
      contentById: {},
      contentTotal: 0,

      // input safety (mobile double tap)
      answerLocked: false,

      // HUD delta cleanup (UI-only): forces a render after gameplayPulseMs
      hudPulseCleanupTimerId: null,

      // timers / transition guards
      bonusAnswerFeedbackTimerId: null,
      bonusEndTimerId: null,
      endRecordMomentTimer: null,
      endAutoModalTimerId: null,
      finishFadeOutTimerId: null,
      finishFadeInStartTimerId: null,
      finishFadeCleanupTimerId: null,
      gameOverAfterFeedbackTimerId: null,
      newBestScoreToastShown: false,

      // transition flags / one-shot states
      gameOverPending: false,
      secretBonusPending: false,
      endRecordMomentUntil: 0,
      poolCompleteCelebrationPending: false,

      // micro-pics (run-only; UI-only)
      microPics: createMicroPicsState(null),

      // current run
      // current run
      currentRunNumber: 0,
      currentRunId: '',
      runStartedAt: 0,
      currentQuestionShownAt: 0,
      runAnswerLog: [],
      questionSpeechActive: false,
      questionSpeechKey: '',
      questionSpeechText: '',
      questionAutoReadDoneKey: '',
      runItemIds: [],
      runMistakeIds: [],
      runMode: '',
      lastAnswer: null,
      feedbackPending: false,
      feedbackReveal: true,
      feedbackRevealTimerId: null,
      feedbackAutoAdvanceTimerId: null,
      feedbackAutoAdvancePaused: false,
      reviewingFeedback: false,
      lastFeedbackReview: null,
      frozenItem: null,
      finishAfterFeedback: false,
      autoGameOverAfterFeedback: false,

      // end-of-run guard (prevents double finish during transitions)
      finishingRun: false,

      lastRun: {
        scoreFP: 0,
        maxChances: 0,
        chancesLeft: 0,
        newBest: false,
        bestScoreFP: 0,
        mistakeIds: []
      },

      // deterministic share anchor

      shareAnchorId: null,

      // Pool reshuffle toast guard (UI-only, once per RUN)
      poolReshuffleToastShown: false,

      // Secret chest (END/LANDING): tap window + one-shot hint
      secretChest: {
        tapCount: 0,
        lastTapAt: 0
      },

      // Pool exhausted toast de-dup (RUN / PRACTICE / BONUS)
      // Keyed by screen+mode, reset when leaving PLAYING.
      poolExhaustedToastKey: null,

      // Secret bonus fall runtime (UI-only)
      // - No fallback values: requires cfg.secretBonus.fall to be valid.
      // - Drives requestAnimationFrame loop without re-rendering every frame.
      secretBonusFall: {
        rafId: 0,
        laneEl: null,
        chipEl: null,
        failLineEl: null,
        lastTs: 0,

        // Progress expressed as ratios of lane height (01), not pixels
        y01: 0,
        speed01PerSec: 0,

        xSide: 'left', // "left" | "right" (placeholder for later; no gameplay coupling)
        itemKey: '', // to detect new item and reset
        running: false,

        // UI-only micro-juice flags
        wasInWarning: false
      }
    };

    // Navigation state (stable, not runtime)
    this._nav = {
      paywallFromState: null,
      landingVariant: null,
      ignorePopstateUntil: 0
    };

    // Cross-surface action dedup:
    // a pointerup inside the modal can close it and reveal a new screen,
    // then the browser emits a synthetic click at the same coordinates.
    // We keep one shared timestamp across modal/app surfaces so that
    // phantom click is dropped even when it lands on a different surface.
    this._lastActionDispatchTs = 0;
    this._ignoreAppActionsUntil = 0;

    this._bindEvents();
  }

  UI.prototype._bindEvents = function () {
    const self = this;

    if (!this.appEl) return;

    const pointerEvt = 'PointerEvent' in window ? 'pointerup' : 'click';
    const trackedEndActions = new Set([
      'start-run',
      'play-again',
      'start-practice',
      'open-paywall',
      'copy-share',
      'share-native',
      'share-card',
      'open-newsletter',
      'send-share-email',
      'open-leaderboard-profile',
      'claim-share-bonus',
      'start-secret-bonus',
      'start-daily-challenge'
    ]);

    function trackEndActionClick(action) {
      if (self.state !== STATES.END) return;
      if (!trackedEndActions.has(String(action || ''))) return;

      try {
        if (
          !window.WT_Analytics ||
          typeof window.WT_Analytics.trackFunnel !== 'function' ||
          typeof window.WT_Analytics.inferUiContext !== 'function'
        ) {
          return;
        }

        const lastRun = self._runtime?.lastRun || {};
        const mode = String(lastRun.mode || self._runtime?.runMode || '').trim();
        const runType = String(lastRun.runType || self._runtime?.runType || '').trim();
        const mistakeCount = Array.isArray(lastRun.mistakeIds)
          ? clampInt(lastRun.mistakeIds.length, 0, 999)
          : 0;
        const score = clampInt(lastRun.scoreFP, 0, 99999);
        const comboContext = mode === MODES.RUN ? {
          combo_reached: Number(lastRun.comboActivations || 0) > 0,
          combo_activations: Number(lastRun.comboActivations || 0),
          bonus_points: Number(lastRun.bonusPoints || 0),
          max_correct_streak: Number(lastRun.maxCorrectStreak || 0)
        } : {};

        window.WT_Analytics.trackFunnel(
          'end_action_click',
          window.WT_Analytics.inferUiContext(self, {
            action,
            mode,
            run_type: runType,
            mistakes_count: mistakeCount,
            score,
            ...comboContext
          })
        );

        const freeRunsUsed = Number(
          self.storage && typeof self.storage.getRunsUsed === 'function'
            ? self.storage.getRunsUsed()
            : NaN
        );
        if (
          !isPremiumNow(self.storage) &&
          freeRunsUsed === 1 &&
          (action === 'start-run' || action === 'play-again')
        ) {
          window.WT_Analytics.trackFunnel(
            'second_run_return',
            window.WT_Analytics.inferUiContext(self, {
              from_state: 'end',
              mode,
              run_type: runType || '',
              action,
              ...comboContext
            })
          );
        }
      } catch (_) {
        /* silent */
      }
    }

    function dispatchAction(action, event) {
      try {
        self._lastActionDispatchTs =
          event && typeof event.timeStamp === 'number'
            ? event.timeStamp
            : Date.now();
      } catch (_) {
        self._lastActionDispatchTs = Date.now();
      }

      trackEndActionClick(action);

      switch (action) {
        case 'continue':
          self.continueAfterFeedback();
          break;

        case 'review-feedback':
          self.reviewLastFeedback();
          break;

        case 'pause-feedback':
          if (self._runtime?.feedbackAutoAdvanceTimerId) {
            clearRuntimeTimer(self, 'feedbackAutoAdvanceTimerId');
          }
          if (self._runtime) self._runtime.feedbackAutoAdvancePaused = true;
          self.render();
          break;

        case 'how-to-play':
        case 'open-howto':
          self.openHowToModal();
          break;

        case 'open-level-progress':
          self.openLevelProgressModal();
          break;

        case 'open-leaderboard':
          self.openLeaderboardModal();
          break;

        case 'share-leaderboard':
          void self.shareLeaderboard();
          break;

        case 'open-leaderboard-profile':
          self.openLeaderboardModal({ initialTab: 'profile' });
          break;

        case 'switch-leaderboard-tab': {
          const source = event && event.target && event.target.closest
            ? event.target.closest('[data-wt-leaderboard-tab]')
            : null;
          self.switchLeaderboardModalTab(
            source ? source.getAttribute('data-wt-leaderboard-tab') : ''
          );
          break;
        }

        case 'save-leaderboard-profile':
          void self.saveLeaderboardProfileFromModal();
          break;

        case 'leave-leaderboard':
          void self.leaveLeaderboardFromModal();
          break;

        case 'close-modal':
          self.closeModal();
          break;

        case 'open-daily-question':
          self.openDailyQuestion();
          break;

        case 'daily-question-true':
        case 'daily-question-false':
          self.openDailyQuestion(action === 'daily-question-true');
          break;

        case 'enter-secret-bonus':
          self.closeModal();
          if (self._runtime) self._runtime.secretBonusPending = false;
          if (typeof self.startSecretBonusRun === 'function')
            self.startSecretBonusRun();
          break;

        case 'start-secret-bonus':
          self.closeModal();
          try {
            window.WT_Analytics?.trackFunnel(
              'rapid_fire_start',
              window.WT_Analytics.inferUiContext(self, {
                entry_point: self.state === STATES.END ? 'end' : 'landing'
              })
            );
          } catch (_) {
            /* Analytics must not interrupt gameplay. */
          }
          if (self._runtime) self._runtime.secretBonusPending = false;
          if (typeof self.startSecretBonusRun === 'function')
            self.startSecretBonusRun();
          break;

        case 'start-run':
        case 'start-daily-challenge': {
          const ready = !!(
            self._runtime && Number(self._runtime.contentTotal) > 0
          );
          if (!ready) {
            const msg = String(self.getContentLoadingCopy() || '').trim();
            if (msg)
              toastNow(self.config, msg, {
                variant: 'info',
                timingKey: 'contentLoading'
              });
            break;
          }

          // Product choice for MVP:
          // the Daily Challenge CTA stays a tracked entry point into the regular RUN flow.
          // We separate the CTA analytics now without creating a dedicated gameplay mode yet.
          if (
            action === 'start-daily-challenge' &&
            self.storage &&
            typeof self.storage.markDailyChallengeClicked === 'function'
          ) {
            try {
              self.storage.markDailyChallengeClicked();
            } catch (_) {
              /* silent */
            }

            try {
              window.WT_Analytics?.trackFunnel(
                'daily_challenge_start',
                window.WT_Analytics.inferUiContext(self, {
                  entry_point: self.state === STATES.END ? 'end' : 'landing'
                })
              );
            } catch (_) {
              /* Analytics must not interrupt gameplay. */
            }
          }

          const startedFromModal = !!(
            self.modalEl && !self.modalEl.classList.contains('wt-hidden')
          );

          // Extra safety for modal -> app transitions:
          // after the modal CTA starts a run, ignore app-surface actions briefly
          // so no stray event can hit the freshly rendered PLAYING screen.
          if (startedFromModal) {
            self._ignoreAppActionsUntil = Date.now() + 900;
          }

          // Funnel counter: only when starting from LANDING
          if (self.state === STATES.LANDING) {
            if (
              self.storage &&
              typeof self.storage.markLandingPlayClicked === 'function'
            ) {
              self.storage.markLandingPlayClicked();
            }
          }

          // CTA inside modal: close first to avoid overlay sticking.
          self.closeModal();
          self._runtime = self._runtime || {};
          self._runtime.pendingRunKind = action === 'start-daily-challenge' ? 'DAILY' : '';
          self.startRun(false);
          break;
        }

        case 'start-practice':
          if (!(self._runtime && Number(self._runtime.contentTotal) > 0)) {
            const msg = String(self.getContentLoadingCopy() || '').trim();
            if (msg)
              toastNow(self.config, msg, {
                variant: 'info',
                timingKey: 'contentLoading'
              });
            break;
          }
          if (self.state === STATES.LANDING) {
            if (
              self.storage &&
              typeof self.storage.markLandingPracticeClicked === 'function'
            ) {
              self.storage.markLandingPracticeClicked();
            }
          }
          self.closeModal();
          self.startRun(true);
          break;

        case 'answer-true': {
          cancelQuestionSpeech(self);
          // BONUS: stop fall tick to prevent race (tick could fail item before rAF fires)
          try {
            if (self._runtime?.secretBonusFall?.running)
              self._secretBonusFallStop();
          } catch (_) {}

          window.requestAnimationFrame(() => self.answer(true));
          break;
        }

        case 'answer-false': {
          cancelQuestionSpeech(self);
          // BONUS: stop fall tick to prevent race (tick could fail item before rAF fires)
          try {
            if (self._runtime?.secretBonusFall?.running)
              self._secretBonusFallStop();
          } catch (_) {}

          window.requestAnimationFrame(() => self.answer(false));
          break;
        }

        case 'toggle-question-audio':
          self.toggleQuestionSpeech();
          break;

        case 'toggle-auto-read-questions':
          self.toggleAutoReadQuestions();
          break;

        case 'play-again': {
          const ready = !!(
            self._runtime && Number(self._runtime.contentTotal) > 0
          );
          if (!ready) {
            const msg = String(self.getContentLoadingCopy() || '').trim();
            if (msg)
              toastNow(self.config, msg, {
                variant: 'info',
                timingKey: 'contentLoading'
              });
            break;
          }

          self.startRun(false);
          break;
        }

        case 'open-paywall':
          // If opened from a modal (e.g., How to play), close it first
          // to prevent backdrop/inert/focus-trap from blocking PAYWALL.
          self.closeModal();

          self.setState(STATES.PAYWALL);
          break;

        case 'checkout-early':
          self.checkout('EARLY', event);
          break;

        case 'checkout-standard':
          self.checkout('STANDARD', event);
          break;

        case 'redeem-code':
          // If launched from the "How to play" modal, close it first
          // to prevent modal stacking/backdrop issues.
          self.closeModal();
          self.openRedeemModal();
          break;

        case 'confirm-redeem':
          self._confirmRedeemCode();
          break;

        case 'open-newsletter':
          if (window.WT_UI_Newsletter) window.WT_UI_Newsletter.open(self);
          break;

        case 'confirm-newsletter':
          if (window.WT_UI_Newsletter) void window.WT_UI_Newsletter.submit(self);
          break;

        case 'auto-redeem-now':
          self._redeemVanityCodeNow();
          break;

        case 'auto-redeem-later':
          self.closeModal();
          break;

        case 'copy-share':
          self.copyShareText();
          break;

        case 'share-native':
          void self.shareNative();
          break;

        case 'share-card': {
          const cardBtn =
            event && event.target && event.target.closest
              ? event.target.closest('[data-action="share-card"]')
              : null;
          const cardScore = Number(cardBtn && cardBtn.getAttribute('data-score')) || 0;
          const cardText = String(self._getShareText ? self._getShareText() : '');
          if (window.WT_ScoreCard) {
            void window.WT_ScoreCard
              .share({
                score: cardScore,
                correct: self._runtime?.lastRun?.correctCount,
                total: self._runtime?.lastRun?.answerLog?.length,
                text: cardText,
                lang: String(document.documentElement.lang || '').slice(0, 2)
              })
              .catch(() => {});
          }
          break;
        }

        case 'send-share-email':
          self.sendShareViaEmail();
          break;

        case 'claim-share-bonus':
          self.claimShareBonus(event);
          break;

        case 'dismiss-share-bonus':
          self.dismissShareBonusOffer();
          break;

        case 'toggle-mistakes-only':
          self.toggleMistakesOnly();
          break;

        case 'open-support':
          self.openSupportModal();
          break;

        case 'send-stats-email':
          self.sendStatsViaEmail();
          break;

        case 'snooze-stats':
          try {
            const pendingBit = self._runtime
              ? Number(self._runtime._statsSharingLastPromptFlagBit)
              : 0;
            if (Number.isFinite(pendingBit) && pendingBit > 0) {
              const cur = getStatsSharingPromptFlags(self.storage);
              setStatsSharingPromptFlags(
                self.storage,
                cur & ~Math.floor(pendingBit)
              );
            }
          } catch (_) {
            /* silent */
          }

          snoozeStatsSharingPromptNextEnd(self.storage);
          self.closeModal();
          break;

        case 'open-waitlist':
          self.openWaitlistModal();
          break;

        case 'send-waitlist-email':
          self.sendWaitlistViaEmail();
          break;

        case 'copy-stats':
          self.copyStatsToClipboard();
          break;

        case 'copy-support-email':
          self.copySupportEmail();
          break;

        case 'open-support-email':
          self.openSupportEmailApp();
          break;

        case 'open-support-email-bug':
          self.openSupportEmailApp('bug');
          break;

        case 'open-support-email-question':
          self.openSupportEmailApp('question');
          break;

        case 'open-support-email-idea':
          self.openSupportEmailApp('idea');
          break;

        case 'install-app':
          self.promptInstall();
          break;

        case 'install-app-now':
          self.closeModal();
          self.promptInstall();
          break;

        case 'dismiss-install-prompt':
          try {
            if (
              self.storage &&
              typeof self.storage.markInstallPromptShown === 'function'
            ) {
              self.storage.markInstallPromptShown();
            }
          } catch (_) {
            /* silent */
          }
          self.closeModal();
          break;

        case 'apply-update':
          self.applyUpdateToast();
          break;

        case 'dismiss-update':
          if (typeof window.__WT_DISMISS_UPDATE__ === 'function') {
            window.__WT_DISMISS_UPDATE__();
          }
          break;

        case 'remind-house-ad':
          self.remindHouseAdLater();
          break;

        case 'open-house-ad':
          self.openHouseAd();
          break;

        case 'back':
        case 'go-home': {
          if (self.state === STATES.PLAYING) {
            const msg = String(
              self.wording?.system?.confirmLeaveRun || ''
            ).trim();
            if (msg && !confirm(msg)) return;
          }

          self.closeModal();

          if (self.state === STATES.PAYWALL) {
            const fromState = String(self._nav?.paywallFromState || '').trim();
            try {
              if (
                window.WT_Analytics &&
                typeof window.WT_Analytics.trackFunnel === 'function' &&
                typeof window.WT_Analytics.inferUiContext === 'function'
              ) {
                window.WT_Analytics.trackFunnel(
                  'paywall_dismiss',
                  window.WT_Analytics.inferUiContext(self, {
                    from_state: fromState.toLowerCase() || 'other'
                  })
                );
              }
            } catch (_) {
              /* silent */
            }

            if (fromState === STATES.END) {
              if (self._nav) {
                self._nav.landingVariant = null;
                self._nav.paywallFromState = null;
              }
              self.setState(STATES.END);
              break;
            }

            if (self._nav) {
              self._nav.landingVariant =
                fromState === STATES.LANDING ? 'POST_PAYWALL' : null;
              self._nav.paywallFromState = null;
            }
            if (
              self._runtime &&
              self._runtime.shareBonusDismissed !== true &&
              self._runtime.shareBonusModalShown !== true &&
              self.isShareBonusOfferEligible()
            ) {
              self._runtime.shareBonusModalPending = true;
            }
            self.setState(STATES.LANDING);
            self.maybeOpenShareBonusModalAfterPaywallDismiss();
            break;
          }

          self.setState(STATES.LANDING);
          break;
        }
        default:
          break;
      }
    }

    if (this.modalEl && !this._wtBoundModalActions) {
      this._wtBoundModalActions = true;

      const modalActionHandler = (e) => {
        const t = e.target;
        if (!t) return;

        // Backdrop click: close modal even if overlay has no data-action
        if (t === self.modalEl) {
          e.preventDefault();
          e.stopImmediatePropagation();
          self.closeModal();
          return;
        }

        // Only trigger actions from explicit buttons/links inside the modal
        const btn = t.closest('button[data-action], a[data-action]');
        if (!btn) return;

        const action = String(btn.getAttribute('data-action') || '').trim();
        if (!action) return;

        e.preventDefault();
        e.stopImmediatePropagation();
        dispatchAction(action, e);
      };

      if (pointerEvt !== 'click') {
        const dedupHandler = (e) => {
          const now = e.timeStamp || Date.now();
          if (now - (self._lastActionDispatchTs || 0) < 160) return;
          modalActionHandler(e);
        };

        this.modalEl.addEventListener(pointerEvt, modalActionHandler);
        this.modalEl.addEventListener('click', dedupHandler);
      } else {
        this.modalEl.addEventListener('click', modalActionHandler);
      }
    }

    // Main app event delegation (LANDING / PLAYING / END / PAYWALL)
    // Without this, buttons like data-action="start-run" never fire.
    if (!this._wtBoundAppActions) {
      this._wtBoundAppActions = true;

      const appActionHandler = (e) => {
        const t = e && e.target ? e.target : null;
        if (!t) return false;

        const ignoreUntil = Number(self._ignoreAppActionsUntil || 0);
        if (ignoreUntil > 0 && Date.now() <= ignoreUntil) {
          try {
            if (e && typeof e.preventDefault === 'function') e.preventDefault();

            if (e && typeof e.stopImmediatePropagation === 'function') {
              e.stopImmediatePropagation();
            } else if (e && typeof e.stopPropagation === 'function') {
              e.stopPropagation();
            }
          } catch (_) {
            /* silent */
          }

          return true;
        }

        // KISS: if user toggles the Share <details> near the bottom of the viewport,
        // keep the summary visible to avoid the "opens upward" feel caused by layout jump.
        const shareSummary =
          t.closest && t.closest('summary.wt-share-toggle')
            ? t.closest('summary.wt-share-toggle')
            : null;
        if (shareSummary) {
          // Let native <details>/<summary> toggle happen (no preventDefault).
          setUiTimer(
            'end.share.scrollIntoView',
            () => {
              try {
                shareSummary.scrollIntoView({
                  block: 'nearest',
                  inline: 'nearest'
                });
              } catch (_) {
                /* ignore */
              }
            },
            0,
            'end'
          );
          return false;
        }

        // If a modal is open and the click is inside it, let modal handler own it
        if (self.modalEl && !self.modalEl.classList.contains('wt-hidden')) {
          try {
            if (self.modalEl.contains(t)) return false;
          } catch (_) {
            /* ignore */
          }
        }

        const btn =
          t.closest && t.closest('[data-action]')
            ? t.closest('[data-action]')
            : null;
        if (!btn) return false;

        const action = String(btn.getAttribute('data-action') || '').trim();
        if (!action) return false;
        e.preventDefault();
        dispatchAction(action, e);
        return true;
      };

      this.appEl.addEventListener(pointerEvt, appActionHandler);

      // Mobile safety: also listen on "click" when primary is a pointer event.
      // Some mobile Safari/PWA combos behave unreliably on button release events.
      // The shared timestamp guard prevents modal->app phantom clicks too.
      if (pointerEvt !== 'click') {
        const origHandler = appActionHandler;
        const dedupHandler = (e) => {
          const now = e.timeStamp || Date.now();
          if (now - (self._lastActionDispatchTs || 0) < 400) return;
          origHandler(e);
        };
        this.appEl.removeEventListener(pointerEvt, appActionHandler);
        this.appEl.addEventListener(pointerEvt, appActionHandler);
        this.appEl.addEventListener('click', dedupHandler);
      }
    }

    if (!this._wtBoundUpdateToastActions) {
      this._wtBoundUpdateToastActions = true;

      const updateToast = document.getElementById('update-toast');
      if (updateToast) {
        updateToast.addEventListener(pointerEvt, (e) => {
          const t = e && e.target ? e.target : null;
          if (!t) return;

          const btn =
            t.closest && t.closest('[data-action]')
              ? t.closest('[data-action]')
              : null;
          if (!btn) return;

          const action = String(btn.getAttribute('data-action') || '').trim();
          if (!action) return;

          e.preventDefault();
          dispatchAction(action, e);
        });

        if (pointerEvt !== 'click') {
          updateToast.addEventListener('click', (e) => {
            const t = e && e.target ? e.target : null;
            if (!t) return;

            const btn =
              t.closest && t.closest('[data-action]')
                ? t.closest('[data-action]')
                : null;
            if (!btn) return;

            const action = String(btn.getAttribute('data-action') || '').trim();
            if (!action) return;

            e.preventDefault();
            dispatchAction(action, e);
          });
        }
      }
    }

    // Prevent duplicate bindings if UI init runs more than once
    if (this._wtBoundSecretChestEvents) return;
    this._wtBoundSecretChestEvents = true;

    // Secret chest tease styles are defined in style.css (single source of truth for UI look).

    // Global listeners: bind once (never inside pointer/click handlers)
    if (!this._wtBoundGlobalEvents) {
      this._wtBoundGlobalEvents = true;

      // Esc closes modal
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') self.closeModal();
      });

      // When run-start overlay is dismissed, BONUS must be allowed to start falling immediately.
      document.addEventListener('wt-runstart-dismissed', () => {
        try {
          // Let DOM update (overlay class removal) settle first
          setUiTimer(
            'playing.bonusFall.startAfterRunStartDismiss',
            () => {
              const modeNow = String(self._runtime?.runMode || '').trim();
              if (self.state !== STATES.PLAYING) return;
              if (!modeNow) return;
              if (modeNow !== MODES.BONUS) return;

              if (isOverlayVisible('wt-run-start-overlay')) return;
              self._secretBonusFallStartOrSync();
            },
            0,
            'playing'
          );
        } catch (_) {
          /* silent */
        }
      });

      // Browser Back => prefer returning to Home (LANDING) for in-app history entries.
      // Robustness: some mobile/PWA contexts emit popstate with a null/partial state,
      // so we also fall back to the internal hash we control (#app).
      window.addEventListener('popstate', (e) => {
        const ignoreUntil = Number(self._nav?.ignorePopstateUntil || 0);
        if (ignoreUntil > 0 && Date.now() <= ignoreUntil) {
          return;
        }

        const st = e && e.state ? e.state : null;
        const hash = String(window.location.hash || '').trim();
        const hasInternalState = !!(st && st.wt === true);
        const hasInternalHash = hash === '#app';

        // If the browser navigated outside our internal history model, let it proceed.
        if (!hasInternalState && !hasInternalHash) return;

        self.closeModal();

        if (self.state !== STATES.LANDING) {
          self.setState(STATES.LANDING);
          return;
        }

        // Keep URL/state coherent even when popstate arrived with a degraded state payload.
        if (hash === '#app') {
          try {
            const baseUrl = location.pathname + location.search;
            history.replaceState(
              { wt: true, screen: STATES.LANDING },
              '',
              baseUrl
            );
          } catch (_) {
            /* silent */
          }
        }
      });

      // Secret Bonus: resize/rotation => recalibrate fall lane (never fail the item)
      function onViewportChange() {
        const modeNow = String(self._runtime?.runMode || '').trim();
        if (self.state !== STATES.PLAYING) return;
        if (!modeNow) return;
        if (modeNow !== MODES.BONUS) return;

        // Recalibrate track height only (layout may have changed)
        const sbf = self._runtime?.secretBonusFall;
        if (sbf && sbf.running && sbf.laneEl && sbf.chipEl) {
          try {
            const laneH = sbf.laneEl.getBoundingClientRect().height || 0;
            const chipH = sbf.chipEl.getBoundingClientRect().height || 0;
            sbf.trackPxMax = Math.max(
              0,
              laneH - (Number.isFinite(chipH) ? chipH : 0)
            );
          } catch (_) {
            /* silent */
          }
        }
      }

      window.addEventListener('resize', onViewportChange);
    }

    // Secret chest tap xN (END + LANDING)
    this.appEl.addEventListener(pointerEvt, (e) => {
      const t = e && e.target ? e.target : null;
      if (!t) return;

      const chest = t.closest ? t.closest('[data-wt-secret="chest"]') : null;
      if (!chest) return;

      // Only on END or LANDING
      if (self.state !== STATES.END && self.state !== STATES.LANDING) return;

      const cfg = self.config || {};
      if (cfg?.secretBonus?.enabled !== true) return;
      const windowMs = Number(cfg?.secretBonus?.tapWindowMs);
      const tapsRequired = Number(cfg?.secretBonus?.tapsRequired);
      // No fallback: invalid config => feature off
      if (!Number.isFinite(windowMs) || windowMs <= 0) return;
      if (!Number.isFinite(tapsRequired) || tapsRequired < 0) return;

      e.preventDefault();

      const sb = self.wording?.secretBonus || {};
      const title = String(sb.modalTitle || '').trim();
      const tickets = getRapidFireTicketBalance(self.storage);
      const cost = getRapidFireTicketCost(self.storage);
      const vars = {
        tickets,
        cost,
        pluralS: tickets === 1 ? '' : 's',
        costPluralS: cost === 1 ? '' : 's'
      };
      const body = fillTemplate(sb.modalBody, vars);
      const cta = fillTemplate(sb.modalCta, vars);
      const notNow = String(self.wording?.system?.notNow || self.wording?.system?.close || '').trim();

      function enterSecretBonusFlow() {
        if (tickets < cost) {
          self.openRapidFireTicketRequiredModal();
          return;
        }
        if (!title || !body || !cta) return;

        markSolvedSecretChestHint(self.storage);
        if (!hasShownSecretChestWelcome(self.storage)) markShownSecretChestWelcome(self.storage);
        chest.classList.remove('wt-btn-icon--tease');
        self.openModal(`
          <p class="wt-text-preline">${escapeHtml(body)}</p>
          <div class="wt-actions">
            <button class="wt-btn wt-btn--primary" data-action="enter-secret-bonus">${escapeHtml(cta)}</button>
            ${notNow ? `<button class="wt-btn wt-btn--secondary" data-action="close-modal">${escapeHtml(notNow)}</button>` : ''}
          </div>
        `, title);
      }

      if (hasSolvedSecretChestHint(self.storage)) {
        enterSecretBonusFlow();
        return;
      }

      // Simple mode: 1 tap triggers immediately.
      if (Math.floor(tapsRequired) === 1) {
        enterSecretBonusFlow();
        return;
      }

      const sc = self._runtime?.secretChest;
      if (!sc) return;

      const now = Date.now();
      const last = Number(sc.lastTapAt || 0);

      // Reset window if too late
      if (!last || now - last > windowMs) {
        sc.tapCount = 0;
      }

      sc.lastTapAt = now;
      sc.tapCount = clampInt(Number(sc.tapCount || 0) + 1, 0, 99);

      if (sc.tapCount >= Math.floor(tapsRequired)) {
        sc.tapCount = 0;
        sc.lastTapAt = 0;
        enterSecretBonusFlow();
      }
    });
  };

  UI.prototype.updateFooter = function () {
    let root = this._footerNode || null;

    if (!root) {
      try {
        root =
          (this.appEl &&
            this.appEl.querySelector &&
            (this.appEl.querySelector('[data-wt-footer]') ||
              this.appEl.querySelector('.wt-footer') ||
              this.appEl.querySelector('footer'))) ||
          document.getElementById('wt-footer-root') ||
          null;
      } catch (_) {
        root = document.getElementById('wt-footer-root') || null;
      }
    }

    if (!root) return;

    // Cache only.
    // Footer content + hydration are owned by footer.js / email.js.
    this._footerNode = root;
  };

  // ============================================
  // Public API (called by main.js)
  // ============================================
  UI.prototype.setContent = function (items) {
    const list = Array.isArray(items) ? items : [];
    this._runtime.contentItems = list;
    this._runtime.contentById = Object.create(null);

    // Content is the source of truth for the visible pool size once content has loaded.
    if (this.config && this.config.game && list.length > 0) {
      this.config.game.poolSize = list.length;
    }

    for (const it of list) {
      const id = String(it && it.id != null ? it.id : '').trim();
      if (!id) continue;
      this._runtime.contentById[id] = it;
    }
    this._runtime.contentTotal = list.length;
  };

  UI.prototype.setContentLoading = function (isLoading) {
    if (!this._runtime) return;
    this._runtime.contentLoading = isLoading === true;
    this._runtime.contentLoadingMessage = this._runtime.contentLoading
      ? String(this.wording?.ui?.contentLoadingToast || '').trim()
      : '';
  };

  UI.prototype.getContentLoadingCopy = function () {
    return String(this._runtime?.contentLoadingMessage || '').trim();
  };

  UI.prototype.init = function () {
    // Browser Back support:
    // Make LANDING the base history entry so Back from any in-app screen can return here.
    try {
      const baseUrl = location.pathname + location.search;
      history.replaceState(
        { wt: true, screen: STATES.LANDING },
        '',
        baseUrl
      );
    } catch (_) {}

    warmQuestionSpeechVoices(this);
    grantStarterRapidFireTicketIfNeeded(this.storage);

    // Populate footer with config values
    this.updateFooter();

    if (this._nav) this._nav.landingVariant = null;
    this.setState(STATES.LANDING);

    // Boot case: constructor already starts on LANDING, so the "Entering LANDING"
    // hook inside setState does not run on first load.
    let ep = null;
    if (this.storage && typeof this.storage.getEarlyPriceState === 'function') {
      try {
        ep = this.storage.getEarlyPriceState() || null;
      } catch (_) {
        ep = null;
      }
    }

    const isEarly = !!(
      ep &&
      String(ep.phase || '').toUpperCase() === 'EARLY' &&
      Number(ep.remainingMs || 0) > 0
    );

    if (isEarly) {
      this._stopPaywallTicker();
      this._startPaywallTicker();
    } else {
      this._stopPaywallTicker();
    }
  };

  UI.prototype.onStorageUpdated = function () {
    const rt = this._runtime || null;
    if (!rt) {
      this.render();
      return;
    }

    if (rt.gameOverPending === true) return;
    if (rt.finishingRun === true) return;
    if (rt.feedbackPending === true) return;
    if (rt.finishAfterFeedback === true) return;

    // Skip full re-render during active gameplay (avoids overlay/animation destruction).
    // The existing guards above cover transitions; this covers the stable PLAYING state.
    if (this.state === STATES.PLAYING) return;

    this.render();
  };

  UI.prototype.onStorageSaveFailed = function () {
    const msg = String(
      this.wording?.system?.storageSaveFailedToast || ''
    ).trim();
    if (!msg) return;

    // Non-blocking warning. Timing is config-driven (default bucket).
    toastNow(this.config, msg, { variant: 'danger' });
  };

  UI.prototype.getStatsByItem = function () {
    return this.storage && typeof this.storage.getStatsByItem === 'function'
      ? this.storage.getStatsByItem()
      : {};
  };

  // Pool exhausted toast (RUN / PRACTICE / BONUS)
  // Contract: WT_WORDING.ui.poolExhausted{Mode} must be provided (no fallback).
  UI.prototype._maybeShowPoolExhaustedToast = function () {
    const exhausted = !!(
      this.storage &&
      typeof this.storage.hasSeenAllWordTraps === 'function' &&
      this.storage.hasSeenAllWordTraps() === true
    );

    if (!exhausted) return;

    const mode = String(this._runtime?.runMode || '').trim();
    if (!mode) return;
    const key = `PLAYING:${mode}`;

    if (this._runtime && this._runtime.poolExhaustedToastKey === key) return;
    if (this._runtime) this._runtime.poolExhaustedToastKey = key;

    const uiWording = this.wording?.ui;
    if (!uiWording) return;

    let msgKey = '';
    switch (mode) {
      case 'PRACTICE':
        msgKey = 'poolExhaustedPractice';
        break;
      case 'BONUS':
        msgKey = 'poolExhaustedBonus';
        break;
      case 'RUN':
      default:
        msgKey = 'poolExhaustedRun';
        break;
    }

    const msg = String(uiWording[msgKey] || '').trim();
    if (!msg) return;

    const timing = getToastTiming(this.config, '');
    if (!timing) return;

    scheduleGameplayOverlay(msg, {
      delayMs: 0,
      durationMs: timing.durationMs,
      variant: 'info',
      mode
    });
  };

  UI.prototype.toggleQuestionSpeech = function () {
    const model = getCurrentQuestionSpeechModel(this);
    if (!model) return;

    if (
      this._runtime?.questionSpeechActive === true &&
      this._runtime?.questionSpeechKey === model.speechKey
    ) {
      cancelQuestionSpeech(this);
      this.render();
      return;
    }

    if (this._runtime) {
      this._runtime.questionAutoReadDoneKey = model.speechKey;
    }
    try {
      if (
        this.storage &&
        typeof this.storage.markUsedQuestionAudio === 'function'
      ) {
        this.storage.markUsedQuestionAudio();
      }
    } catch (_) {
      /* silent */
    }
    startQuestionSpeech(this, model, { render: true });
  };

  UI.prototype.toggleAutoReadQuestions = function () {
    if (
      !this.storage ||
      typeof this.storage.getAutoReadQuestions !== 'function' ||
      typeof this.storage.setAutoReadQuestions !== 'function'
    ) {
      return;
    }

    const next = !isAutoReadQuestionsEnabled(this.storage);
    try {
      this.storage.setAutoReadQuestions(next);
      if (
        next === true &&
        typeof this.storage.markUsedQuestionAudio === 'function'
      ) {
        this.storage.markUsedQuestionAudio();
      }
    } catch (_) {
      return;
    }

    if (next !== true) {
      cancelQuestionSpeech(this);
    } else if (this._runtime) {
      this._runtime.questionAutoReadDoneKey = '';
      const modalOpen = !!(
        this.modalEl && !this.modalEl.classList.contains('wt-hidden')
      );
      if (!modalOpen) syncAutoReadCurrentQuestion(this);
    }

    if (this.modalEl && !this.modalEl.classList.contains('wt-hidden')) {
      this.openHowToModal();
    } else if (this.state === STATES.PLAYING) {
      this.render();
    }
  };

  // Pool reshuffled toast (RUN only; one-shot from game.js state.poolReshuffled)
  // UX decision: show a single discreet info toast once per RUN (no spam).
  UI.prototype._maybeShowPoolReshuffledToast = function () {
    if (this.state !== STATES.PLAYING) return;

    const mode = String(this._runtime?.runMode || '').trim();
    if (mode !== 'RUN') return;

    if (!this._runtime || this._runtime.poolReshuffleToastShown === true)
      return;

    let poolReshuffled = false;
    try {
      const gs =
        this.game && typeof this.game.getState === 'function'
          ? this.game.getState() || {}
          : {};
      poolReshuffled = gs.poolReshuffled === true;
    } catch (_) {
      poolReshuffled = false;
    }

    if (poolReshuffled !== true) return;

    const msg = String(this.wording?.ui?.poolReshuffledToast || '').trim();
    if (!msg) return;

    const timing = getToastTiming(this.config, '');
    if (!timing) return;

    this._runtime.poolReshuffleToastShown = true;
    scheduleGameplayOverlay(msg, {
      delayMs: 0,
      durationMs: timing.durationMs,
      variant: 'info',
      mode: 'RUN'
    });
  };

  // ============================================
  // State transition cleanup
  // ============================================
  // Single orchestration point for state-scoped cleanup.
  // Product contract: no intended UX change, only deterministic cleanup.
  function cleanupAppTransitionClasses() {
    const app = document.getElementById('app');
    if (!app || !app.classList) return;

    try {
      app.classList.remove('wt-fade');
      app.classList.remove('wt-fade--out');
      app.classList.remove('wt-fade--in');
      app.classList.remove('transitioning');
    } catch (_) {
      /* silent */
    }
  }

  function cleanupEndExit(ui) {
    clearUiTimersByScope('end');

    if (ui && ui._runtime) {
      clearRuntimeTimer(ui, 'endRecordMomentTimer');
      clearRuntimeTimer(ui, 'endAutoModalTimerId');
      clearRuntimeTimer(ui, 'finishFadeOutTimerId');
      clearRuntimeTimer(ui, 'finishFadeInStartTimerId');
      clearRuntimeTimer(ui, 'finishFadeCleanupTimerId');
      ui._runtime.endRecordMomentUntil = 0;
    }

    cleanupAppTransitionClasses();
  }

  function resetSecretChestRuntime(ui) {
    if (!ui || !ui._runtime || !ui._runtime.secretChest) return;
    ui._runtime.secretChest.tapCount = 0;
    ui._runtime.secretChest.lastTapAt = 0;
  }

  function recordLandingExit(ui) {
    if (!ui || !ui._runtime) return;

    const enteredAt = Number(ui._runtime.landingEnteredAt || 0);
    if (
      enteredAt > 0 &&
      ui.storage &&
      typeof ui.storage.recordLandingTime === 'function'
    ) {
      try {
        ui.storage.recordLandingTime(Date.now() - enteredAt);
      } catch (_) {
        /* silent */
      }
    }

    ui._runtime.landingEnteredAt = 0;
  }

  function cleanupPaywallTickerIfNeeded(ui, prev, next) {
    if (!ui || typeof ui._stopPaywallTicker !== 'function') return;

    // The early-price ticker is allowed to live across PAYWALL <-> LANDING only.
    if (
      prev === STATES.PAYWALL &&
      next !== STATES.PAYWALL &&
      next !== STATES.LANDING
    ) {
      clearUiTimersByScope('paywall');
      ui._stopPaywallTicker();
    }

    if (
      prev === STATES.LANDING &&
      next !== STATES.LANDING &&
      next !== STATES.PAYWALL
    ) {
      clearUiTimersByScope('paywall');
      ui._stopPaywallTicker();
    }
  }

  function cleanupOverlaysForStateTransition(prev, next) {
    if (prev === next) return;

    // No gameplay transient overlay or run-start blocker outside PLAYING.
    if (next !== STATES.PLAYING) {
      clearUiTimer('overlay.gameplay.show');
      hideOverlay('transient');
      hideOverlay('runstart');
    }

    // Chance/game-over overlay is only tolerated during PLAYING -> END handoff.
    // Any other screen must not inherit it.
    if (next !== STATES.PLAYING && next !== STATES.END) {
      hideOverlay('chance');
    }
  }

  function cleanupStateTransition(ui, prev, next) {
    if (!ui || prev === next) return;

    if (next !== STATES.LANDING) {
      clearUiTimersByScope('daily');
    }

    // PLAYING owns feedback, live gameplay, bonus fall, beforeunload, and answer locks.
    if (prev === STATES.PLAYING && next !== STATES.PLAYING) {
      clearUiTimersByScope('feedback');
      clearUiTimersByScope('playing');

      const keepChanceOverlayVisible = !!(
        ui._runtime &&
        ui._runtime.finishingRun === true &&
        next === STATES.END
      );
      cleanupPlayingExit(ui, { keepChanceOverlayVisible });

      if (ui._runtime) ui._runtime.finishingRun = false;
      try {
        window.__wtGameOverSkipToEnd = null;
      } catch (_) {
        /* silent */
      }
    }

    // END-only timers/visual classes must not leak to other screens.
    if (prev === STATES.END && next !== STATES.END) {
      cleanupEndExit(ui);
    }

    // Secret chest gesture is per-END-screen attempt, never cross-screen state.
    if (prev === STATES.END || next === STATES.END) {
      resetSecretChestRuntime(ui);
    }

    // PAYWALL ticker is state-compatible with PAYWALL and LANDING only.
    cleanupPaywallTickerIfNeeded(ui, prev, next);

    if (prev === STATES.LANDING && next !== STATES.LANDING) {
      recordLandingExit(ui);
    }

    cleanupOverlaysForStateTransition(prev, next);
  }

  UI.prototype.setState = function (next) {
    const prev = this.state;

    // A waiting service-worker update must never cover an active run. Keep this
    // guard in the UI transition as well as in the update manager so an older
    // waiting worker cannot re-show the toast during PLAYING, END, or PAYWALL.
    if (next !== STATES.LANDING) {
      const updateToast = document.getElementById('update-toast');
      if (updateToast) {
        updateToast.classList.remove('wt-toast--visible');
        updateToast.setAttribute('aria-hidden', 'true');
      }
    }

    // Automatic cleanup by state transition.
    // This is the single gate for timers, overlays, and ephemeral flags tied to the previous screen.
    cleanupStateTransition(this, prev, next);

    // Remember where PAYWALL was opened from (for "Not now" routing)
    if (next === STATES.PAYWALL && prev !== STATES.PAYWALL) {
      if (this._nav) this._nav.paywallFromState = prev; // END | LANDING | PLAYING (rare)
    }

    // Browser Back support (single step):
    // - LANDING is the base entry
    // - Any non-landing screen lives in ONE history entry (replaceState),
    //   so Back always returns to LANDING.
    try {
      const baseUrl = location.pathname + location.search;
      const nextUrl = next === STATES.LANDING ? baseUrl : `${baseUrl}#app`;
      if (this._nav) {
        this._nav.ignorePopstateUntil = Date.now() + 600;
      }

      if (next !== STATES.LANDING && prev === STATES.LANDING) {
        history.pushState({ wt: true, screen: next }, '', nextUrl);
      } else {
        history.replaceState({ wt: true, screen: next }, '', nextUrl);
      }
    } catch (_) {}

    this.state = next;

    if (next === STATES.LANDING) {
      try {
        if (typeof window.__WT_SHOW_PENDING_UPDATE__ === 'function') {
          window.__WT_SHOW_PENDING_UPDATE__();
        }
      } catch (_) {}
    }

    // Pool exhausted toast: show once per entry into PLAYING (all modes)
    if (next === STATES.PLAYING && prev !== STATES.PLAYING) {
      this._maybeShowPoolExhaustedToast();
    }

    // Entering PAYWALL: ensure clean single ticker
    if (next === STATES.PAYWALL && prev !== STATES.PAYWALL) {
      if (this.storage && typeof this.storage.markPaywallShown === 'function') {
        this.storage.markPaywallShown(prev); // Storage owns startedAt persistence
      }
      try {
        if (
          window.WT_Analytics &&
          typeof window.WT_Analytics.trackFunnel === 'function' &&
          typeof window.WT_Analytics.inferUiContext === 'function'
        ) {
          window.WT_Analytics.trackFunnel(
            'paywall_view',
            window.WT_Analytics.inferUiContext(this, {
              from_state: String(prev || '').trim().toLowerCase() || 'other'
            })
          );
        }
      } catch (_) {
        /* silent */
      }
      this._stopPaywallTicker();
      this._startPaywallTicker(); // UI-only: re-render to show ticking mm:ss (PAYWALL/LANDING)
    }

    // Entering LANDING: show the EARLY timer only if the window is active (after PAYWALL)
    if (next === STATES.LANDING && prev !== STATES.LANDING) {
      if (this._runtime) {
        this._runtime.landingEnteredAt = Date.now();
      }
      let ep = null;
      if (
        this.storage &&
        typeof this.storage.getEarlyPriceState === 'function'
      ) {
        try {
          ep = this.storage.getEarlyPriceState() || null;
        } catch (_) {
          ep = null;
        }
      }

      const isEarly = !!(
        ep &&
        String(ep.phase || '').toUpperCase() === 'EARLY' &&
        Number(ep.remainingMs || 0) > 0
      );

      if (isEarly) {
        this._stopPaywallTicker();
        this._startPaywallTicker();
      } else {
        this._stopPaywallTicker();
      }
    }

    this.render();

    // BONUS start is owned by the run-start overlay dismissal flow.

    // END entry hooks(no gameplay interruptions)
    if (next === STATES.END && prev !== STATES.END) {
      // Micro-pics highlight (END-only)
      // Keep the computed END highlight so the END screen can actually use it.
      // We only avoid late toasts; we do NOT wipe the message here.
      try {
        const mp =
          this._runtime && this._runtime.microPics
            ? this._runtime.microPics
            : null;
        if (mp) {
          // Intentionally preserved.
        }
      } catch (_) {
        /* silent */
      }

      // Anonymous stats sharing prompt (END-only, one-shot, post-completion only)
      try {
        if (typeof this._maybePromptStatsSharingMilestone === 'function') {
          this._maybePromptStatsSharingMilestone();
        }
      } catch (_) {
        /* silent */
      }

      // Daily challenge ticket toast (RUN only, once per local day)
      try {
        const lastRun = this._runtime?.lastRun || {};
        const mode = String(lastRun.mode || '')
          .trim()
          .toUpperCase();
        if (mode === 'RUN') {
          const alreadyShown = getDailyChallengeToastDayKey(this.storage);
          const toastTpl = String(
            this.wording?.end?.dailyChallengeToast || ''
          ).trim();
          const dayKey = String(lastRun.dailyTicketDayKey || '').trim();
          if (
            lastRun.dailyTicketAwarded === true &&
            dayKey &&
            alreadyShown !== dayKey &&
            toastTpl
          ) {
            const msg = fillTemplate(toastTpl, {
              tickets: String(clampInt(lastRun.dailyTicketBalance, 0, 999))
            });
            if (msg)
              toastNow(this.config, msg, {
                variant: 'success',
                timingKey: 'dailyChallengeComplete'
              });
            markDailyChallengeToastShown(this.storage, dayKey);
          }
        }
      } catch (_) {
        /* silent */
      }

      // END celebration moment: new best, all mistakes cleared, or perfect bonus run.
      try {
        const cfg = this.config || {};
        const w = this.wording || {};
        const endW = w.end || {};
        const practiceW = w.practice || {};
        const bonusW = w.secretBonus || {};

        const lastRun = this._runtime?.lastRun || {};

        // One-shot: mastered celebration persistence (no modal required)
        try {
          const mastered = !!(
            this.storage &&
            typeof this.storage.isMastered === 'function' &&
            this.storage.isMastered() === true
          );

          const already = !!(
            this.storage &&
            typeof this.storage.hasMasteredCelebrated === 'function' &&
            this.storage.hasMasteredCelebrated() === true
          );

          if (
            mastered &&
            !already &&
            this.storage &&
            typeof this.storage.markMasteredCelebrated === 'function'
          ) {
            this.storage.markMasteredCelebrated();
          }
        } catch (_) {
          /* silent */
        }

        const mode = String(lastRun.mode || '').trim();
        const isRun = mode === 'RUN';
        const isBonus = mode === 'BONUS';
        const isPractice = mode === 'PRACTICE';
        const newBest = (isRun || isBonus) && lastRun.newBest === true;
        let practiceAllCleared = false;
        if (
          isPractice &&
          this.storage &&
          typeof this.storage.getActiveMistakesCount === 'function'
        ) {
          try {
            practiceAllCleared =
              clampInt(this.storage.getActiveMistakesCount(), 0, 99999) === 0;
          } catch (_) {
            practiceAllCleared = false;
          }
        }

        let bonusPerfect = false;
        if (isBonus) {
          const shown = Array.isArray(lastRun.runItemIds)
            ? lastRun.runItemIds.length
            : 0;
          const score = clampInt(Number(lastRun.scoreFP || 0), 0, 99999);
          const accuracy = shown > 0 ? score / shown : -1;
          const tiers = Array.isArray(cfg?.secretBonus?.endTiers)
            ? cfg.secretBonus.endTiers
            : [];
          let bonusLevel = '';
          for (const t of tiers) {
            const key = String(t?.key || '').trim();
            const min = Number(t?.minAccuracy);
            if (!key || !Number.isFinite(min)) continue;
            if (accuracy >= min) {
              bonusLevel = key;
              break;
            }
          }
          bonusPerfect = bonusLevel === 'perfect';
        }

        const ms = Number(cfg?.ui?.endRecordMomentMs);

        const newBestTpl = isBonus
          ? String(
              (w && w.secretBonus && w.secretBonus.newBest) ||
                endW.newBest ||
                ''
            ).trim()
          : String(endW.newBest || '').trim();
        const practiceCelebrateTpl = String(
          practiceW.celebrationAllCleared || practiceW.endLineAllFixed || ''
        ).trim();
        const bonusCelebrateTpl = String(
          bonusW.celebrationPerfect || ''
        ).trim();
        const celebrationLabel = newBest
          ? newBestTpl
          : practiceAllCleared
            ? practiceCelebrateTpl
            : bonusPerfect
              ? bonusCelebrateTpl
              : '';

        const enabled = !!celebrationLabel && Number.isFinite(ms) && ms > 0;
        if (enabled) {
          if (!this._runtime) this._runtime = {};
          if (this._runtime.endRecordMomentTimer) {
            clearRuntimeTimer(this, 'endRecordMomentTimer');
          }

          this._runtime.endRecordMomentUntil = Date.now() + ms;

          setRuntimeTimer(
            this,
            'endRecordMomentTimer',
            () => {
              try {
                if (this._runtime) {
                  this._runtime.endRecordMomentTimer = null;
                  this._runtime.endRecordMomentUntil = 0;
                }
                this.render();
              } catch (_) {
                /* silent */
              }
            },
            ms
          );
        } else {
          if (this._runtime) this._runtime.endRecordMomentUntil = 0;
        }
      } catch (_) {
        /* silent */
      }

      // END score victory animation (UI-only; no count-up; respects reduced motion)
      try {
        if (
          window.matchMedia &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches
        )
          return;

        const scoreEl = document.querySelector('.wt-end-score');
        if (!scoreEl) return;

        // Restart animation cleanly on each END entry
        scoreEl.classList.remove('wt-end-score--celebrate');
        void scoreEl.offsetWidth; // force reflow (Safari-safe)
        scoreEl.classList.add('wt-end-score--celebrate');
      } catch (_) {
        /* silent */
      }
    }
  };

  // ============================================
  // Modal helpers
  // ============================================

  UI.prototype.openModal = function (html, title, options) {
    if (!this.modalEl || !this.modalContentEl) {
      return;
    }
    // A11Y: store last focused element to restore on close
    try {
      if (this._runtime)
        this._runtime._lastFocusBeforeModal = document.activeElement || null;
    } catch (_) {
      /* silent */
    }

    // A11Y: inert the main content so Tab cannot reach behind the modal
    try {
      const mainEl = document.querySelector('.wt-main');
      if (mainEl) mainEl.inert = true;
    } catch (_) {
      /* silent */
    }
    try {
      if (this.appEl) this.appEl.setAttribute('aria-hidden', 'true');
      const footerEl = document.getElementById('wt-footer-root');
      if (footerEl) footerEl.setAttribute('aria-hidden', 'true');
    } catch (_) {
      /* silent */
    }

    this.modalEl.classList.remove('wt-hidden');
    this.modalEl.setAttribute('aria-hidden', 'false');

    const t = escapeHtml(String(title || '').trim());
    const closeLabel = escapeHtml(
      String(this.wording?.system?.close || '').trim()
    );
    const hideCloseButton = !!(options && options.hideCloseButton === true);
    const modalClass = String(options?.modalClass || '').trim();
    const modalKey = String(options?.modalKey || '').trim();

    if (this._runtime) this._runtime._modalExtraClass = modalClass;
    if (this._runtime) this._runtime._modalKey = modalKey;
    this.modalContentEl.classList.remove(
      'wt-modal--sheet',
      'wt-modal--levelsheet'
    );
    this.modalContentEl.removeAttribute('data-wt-modal-key');
    if (modalKey)
      this.modalContentEl.setAttribute('data-wt-modal-key', modalKey);
    if (modalClass) {
      modalClass
        .split(/\s+/)
        .filter(Boolean)
        .forEach((cls) => this.modalContentEl.classList.add(cls));
    }

    this.modalContentEl.innerHTML = `
  <div class="wt-modal-header">
    <div class="wt-row wt-row--spaced">
      <h2 id="wt-modal-title" class="wt-h2">${t}</h2>
      ${hideCloseButton ? `` : `<button class="wt-btn wt-btn--ghost" data-action="close-modal" aria-label="${closeLabel}">&times;</button>`}
    </div>
  </div>
  ${html}
`;

    // UX: always start at top (content is scrollable and scroll position can persist)
    // Safari/reflow edge cases: reset now + on next frame.
    try {
      this.modalContentEl.scrollTop = 0;
      this.modalEl.scrollTop = 0;
      window.requestAnimationFrame(() => {
        try {
          this.modalContentEl.scrollTop = 0;
          this.modalEl.scrollTop = 0;
        } catch (_) {
          /* silent */
        }
      });
    } catch (_) {
      /* silent */
    }

    // A11Y: focus the first actionable element in the modal (close button)
    try {
      const first = this.modalContentEl.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (first && typeof first.focus === 'function') first.focus();
    } catch (_) {
      /* silent */
    }

    // A11Y: minimal focus trap (Tab/Shift+Tab loops inside modal)
    try {
      const self = this;
      const trap = function (e) {
        if (!e) return;
        if (!self.modalEl || self.modalEl.classList.contains('wt-hidden'))
          return;

        // A11Y: Escape closes the modal
        if (e.key === 'Escape') {
          e.preventDefault();
          if (typeof self.closeModal === 'function') self.closeModal();
          return;
        }

        if (e.key !== 'Tab') return;
        const focusables = self.modalEl.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;
        if (!focusables || focusables.length === 0) return;

        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (e.shiftKey) {
          if (active === firstEl || active === self.modalEl) {
            e.preventDefault();
            if (lastEl && typeof lastEl.focus === 'function') lastEl.focus();
          }
        } else {
          if (active === lastEl) {
            e.preventDefault();
            if (firstEl && typeof firstEl.focus === 'function') firstEl.focus();
          }
        }
      };

      if (this._runtime) this._runtime._modalTrapHandler = trap;
      this.modalEl.addEventListener('keydown', trap);
    } catch (_) {
      /* silent */
    }
  };

  UI.prototype.closeModal = function () {
    if (!this.modalEl || !this.modalContentEl) return;
    const modalKey = this._runtime?._modalKey;

    // A11Y: remove focus trap listener
    try {
      const h = this._runtime ? this._runtime._modalTrapHandler : null;
      if (h) this.modalEl.removeEventListener('keydown', h);
      if (this._runtime) this._runtime._modalTrapHandler = null;
    } catch (_) {
      /* silent */
    }

    if (this._runtime) {
      this._runtime.secretBonusPending = false;
    }

    this.modalEl.classList.add('wt-hidden');
    this.modalEl.setAttribute('aria-hidden', 'true');
    this.modalContentEl.classList.remove(
      'wt-modal--sheet',
      'wt-modal--levelsheet'
    );
    this.modalContentEl.removeAttribute('data-wt-modal-key');
    this.modalContentEl.innerHTML = '';
    if (this._runtime) this._runtime._modalExtraClass = '';
    if (this._runtime) this._runtime._modalKey = '';

    // A11Y: re-enable main content
    try {
      const mainEl = document.querySelector('.wt-main');
      if (mainEl) mainEl.inert = false;
    } catch (_) {
      /* silent */
    }
    try {
      if (this.appEl) this.appEl.removeAttribute('aria-hidden');
      const footerEl = document.getElementById('wt-footer-root');
      if (footerEl) footerEl.removeAttribute('aria-hidden');
    } catch (_) {
      /* silent */
    }

    // A11Y: restore focus to the element that opened the modal (if still present)
    try {
      const prev = this._runtime ? this._runtime._lastFocusBeforeModal : null;
      if (this._runtime) this._runtime._lastFocusBeforeModal = null;

      if (modalKey === 'daily-question') {
        this.appEl?.querySelector('[data-action="open-daily-question"]')?.focus();
      } else if (prev && typeof prev.focus === 'function' && document.contains(prev)) {
        prev.focus();
      }
    } catch (_) {
      /* silent */
    }

    if (this.state === STATES.PLAYING) {
      syncAutoReadCurrentQuestion(this);
    }
  };

  UI.prototype.openDailyQuestion = function (choice) {
    const w = this.wording?.landing || {};
    if (this.state !== STATES.LANDING || !w.dailyQuestionCta) return;

    const items = (this._runtime?.contentItems || []).filter(
      (item) => item?.question && typeof item.correctAnswer === 'boolean'
    );
    if (!items.length) {
      const loading = this.getContentLoadingCopy();
      if (loading) toastNow(this.config, loading);
      return;
    }

    const now = new Date();
    const day = getCommonDayKey(now);
    const item = items[Math.floor(now.getTime() / 86400000) % items.length];
    const shown = this._runtime.dailyQuestionShown;
    if (shown?.day !== day || shown?.id !== item.id) choice = undefined;
    this._runtime.dailyQuestionShown = { day, id: item.id };
    const key = `${this.config.storage.storageKey}:daily-question`;
    let saved = this._runtime.dailyQuestionAnswer;
    if (!saved) {
      try { saved = JSON.parse(window.localStorage.getItem(key)); } catch (_) {}
    }
    const alreadyAnswered = saved?.day === day && saved?.id === item.id &&
      typeof saved.choice === 'boolean';
    if (!alreadyAnswered && typeof choice === 'boolean') {
      saved = { day, id: item.id, choice };
      this._runtime.dailyQuestionAnswer = saved;
      try { window.localStorage.setItem(key, JSON.stringify(saved)); } catch (_) {}
      window.WT_Analytics?.trackFunnel('daily_question_complete', window.WT_Analytics.inferUiContext(this));
    } else if (typeof choice !== 'boolean') {
      window.WT_Analytics?.trackFunnel('daily_question_open', window.WT_Analytics.inferUiContext(this));
    }

    const ui = this.wording?.ui || {};
    const heading = `<p class="wt-h2">${escapeHtml(item.question)}</p>`;
    const answerLabel = item.correctAnswer ? ui.trueLabel : ui.falseLabel;
    const answered = alreadyAnswered || typeof choice === 'boolean';
    const body = answered
      ? `<div role="status">
          <strong>${escapeHtml(answerLabel)} · ${escapeHtml(saved.choice === item.correctAnswer ? w.dailyQuestionCorrect : w.dailyQuestionIncorrect)}</strong>
          <p class="wt-text-preline">${escapeHtml(item.explanationShort || '')}</p>
          <p class="wt-muted">${escapeHtml(w.dailyQuestionDone)}</p>
        </div>`
      : `<div class="wt-actions">
          <button type="button" class="wt-btn wt-btn--primary" data-action="daily-question-true">${escapeHtml(ui.trueLabel)}</button>
          <button type="button" class="wt-btn wt-btn--secondary" data-action="daily-question-false">${escapeHtml(ui.falseLabel)}</button>
        </div>`;
    const trap = this._runtime._modalTrapHandler;
    if (trap && this._runtime._modalKey === 'daily-question') {
      this.modalEl.removeEventListener('keydown', trap);
    }
    this.openModal(heading + body, w.dailyQuestionCta, { modalKey: 'daily-question' });
  };

  UI.prototype.openHowToModal = function () {
    const w = this.wording || {};
    const how = w.howto || {};
    const ui = w.ui || {};
    const cfg = this.config || {};
    const poolSize = Number(cfg?.game?.poolSize);
    const maxChances = Number(cfg?.game?.maxChances);

    const isPrem = isPremiumNow(this.storage);

    // Pull live values from the engine (single source of truth)
    const gs =
      this.game && typeof this.game.getState === 'function'
        ? this.game.getState() || {}
        : {};
    const scoreFP = Number(gs.scoreFP);
    const chancesLeft = Number(gs.chancesLeft);
    const speechSupported = supportsQuestionSpeechForLocale(getQuestionSpeechLocale());
    const autoReadEnabled = isAutoReadQuestionsEnabled(this.storage);

    // No hardcoded fallback: if runtime values are missing, keep placeholders empty.
    const vars = {
      score: Number.isFinite(scoreFP) ? scoreFP : '',
      fpLong: String(ui.fpLong || '').trim(),
      maxChances: Number.isFinite(maxChances) ? maxChances : '',
      chancesLeft: Number.isFinite(chancesLeft)
        ? chancesLeft
        : Number.isFinite(maxChances)
          ? maxChances
          : ''
    };

    const line = (s) =>
      `<p>${escapeHtml(fillTemplate(String(s || '').trim(), vars))}</p>`;

    // Business section (Premium + Activate) is ONLY for non-premium users.
    let premiumHtml = '';
    if (!isPrem) {
      const premiumOnlyHint = String(how.premiumOnlyHint || '').trim();

      const paywallBullets = Array.isArray(w.paywall?.valueBullets)
        ? w.paywall.valueBullets
        : [];
      const premiumBulletsHtml = paywallBullets
        .map((b) => String(b || '').trim())
        .filter(Boolean)
        .map((b) => `<p class="wt-muted">&bull; ${escapeHtml(b)}</p>`)
        .join('');

      const upgradeCta = String(w.paywall?.cta || '').trim();
      const redeemLabel = String(w.paywall?.alreadyHaveCode || '').trim();

      premiumHtml = `
        <div class="wt-divider"></div>
        <div class="wt-actions wt-actions--compact">
          ${redeemLabel ? `<button class="wt-btn wt-btn--ghost" data-action="redeem-code">${escapeHtml(redeemLabel)}</button>` : ``}
          ${upgradeCta ? `<button class="wt-btn wt-btn--ghost" data-action="open-paywall">${escapeHtml(upgradeCta)}</button>` : ``}
        </div>
      `;
    }
    const audioTitle = String(how.audioTitle || '').trim();
    const autoReadLabel = String(how.autoReadLabel || '').trim();
    const autoReadHelp = String(how.autoReadHelp || '').trim();
    const autoReadStatus = String(
      autoReadEnabled ? how.autoReadOn || '' : how.autoReadOff || ''
    ).trim();
    const audioSettingsHtml =
      speechSupported && autoReadLabel
        ? `
        <div class="wt-divider"></div>
        <div class="wt-stack wt-stack--xs wt-how-setting">
          ${audioTitle ? `<p class="wt-question-title">${escapeHtml(audioTitle)}</p>` : ``}
          <button
            type="button"
            class="wt-text-action wt-how-setting__toggle"
            data-action="toggle-auto-read-questions"
            aria-pressed="${autoReadEnabled ? 'true' : 'false'}"
          >
            <span>${escapeHtml(autoReadLabel)}</span>
            ${autoReadStatus ? `<span class="wt-how-setting__status">${escapeHtml(autoReadStatus)}</span>` : ``}
          </button>
          ${autoReadHelp ? `<p class="wt-muted">${escapeHtml(autoReadHelp)}</p>` : ``}
        </div>
      `
        : '';
    const html = `
     <p class="wt-how-line">${escapeHtml(String(how.howToPlayLine1 || '').trim())}</p>
<p class="wt-how-line">${escapeHtml(String(how.howToPlayLine2 || '').trim())}</p>
<p class="wt-how-line">${escapeHtml(String(how.howToPlayLine3 || '').trim())}</p>

${audioSettingsHtml}

<div class="wt-divider"></div>

      <div class="wt-stack wt-stack--sm">
        <p class="wt-question-title">
          ${escapeHtml(String(how.ruleTitle || '').trim())}
        </p>
        <p class="wt-muted">
          ${escapeHtml(fillTemplate(String(how.ruleSentence || '').trim(), vars))}
        </p>
      </div>

      ${premiumHtml}
    `;

    this.openModal(html, String(how.title || '').trim());
  };

  UI.prototype.openLevelProgressModal = function () {
    const w = this.wording || {};
    const cfg = this.config || {};
    const levelsW = w.levels && typeof w.levels === 'object' ? w.levels : {};
    const model = getAppLevelModel(this.storage, cfg, w);
    const progressionLabel = String(levelsW.progressionLabel || '').trim();
    const currentPill = String(levelsW.currentPill || '').trim();
    const unlockedPill = String(levelsW.unlockedPill || '').trim();
    const lockedPill = String(levelsW.lockedPill || '').trim();

    const progressionHtml = model.defs
      .map((item) => {
        const pill = item.current
          ? currentPill
          : item.unlocked
            ? unlockedPill
            : lockedPill;
        const stateClass = item.current
          ? ' wt-level-strip__item--current'
          : item.unlocked
            ? ' wt-level-strip__item--done'
            : '';
        return `
        <li class="wt-level-strip__item${stateClass}">
          <div class="wt-level-strip__main">
            <span class="wt-level-strip__dot" aria-hidden="true"></span>
            <div class="wt-level-strip__copy">
              <strong class="wt-level-strip__label">${escapeHtml(item.label)}</strong>
              <span class="wt-level-strip__meta">${escapeHtml(item.unlock)}</span>
            </div>
          </div>
          ${pill ? `<span class="wt-level-strip__pill">${escapeHtml(pill)}</span>` : ``}
        </li>
      `;
      })
      .join('');

    const html = `
      <div class="wt-level-sheet__section wt-level-sheet__section--progress">
        ${progressionLabel ? `<p class="wt-level-sheet__eyebrow">${escapeHtml(progressionLabel)}</p>` : ``}
        <ul class="wt-level-strip" role="list">
          ${progressionHtml}
        </ul>
      </div>
    `;

    this.openModal(html, String(levelsW.modalTitle || '').trim(), {
      modalClass: 'wt-modal--sheet wt-modal--levelsheet'
    });
  };

  UI.prototype.openLeaderboardModal = function (opts) {
    if (
      !window.WT_UI_Leaderboard ||
      typeof window.WT_UI_Leaderboard.openModal !== 'function'
    ) {
      return;
    }
    return window.WT_UI_Leaderboard.openModal(this, {
      escapeHtml,
      initialTab: opts && typeof opts === 'object' ? opts.initialTab : ''
    });
  };

  UI.prototype.saveLeaderboardProfileFromModal = async function () {
    if (
      !window.WT_UI_Leaderboard ||
      typeof window.WT_UI_Leaderboard.saveProfileFromModal !== 'function'
    ) {
      return;
    }
    return window.WT_UI_Leaderboard.saveProfileFromModal(this, {
      escapeHtml,
      toastNow,
      fillTemplate,
      getLeaderboardContentVersion
    });
  };

  UI.prototype.switchLeaderboardModalTab = function (tabKey) {
    if (
      !window.WT_UI_Leaderboard ||
      typeof window.WT_UI_Leaderboard.switchModalTab !== 'function'
    ) {
      return;
    }
    return window.WT_UI_Leaderboard.switchModalTab(
      this,
      String(tabKey || '').trim()
    );
  };

  UI.prototype.leaveLeaderboardFromModal = async function () {
    if (
      !window.WT_UI_Leaderboard ||
      typeof window.WT_UI_Leaderboard.leaveFromModal !== 'function'
    ) {
      return;
    }
    return window.WT_UI_Leaderboard.leaveFromModal(this, { toastNow });
  };

  UI.prototype.submitLeaderboardRun = async function (lastRun) {
    if (
      !window.WT_UI_Leaderboard ||
      typeof window.WT_UI_Leaderboard.submitRun !== 'function'
    ) {
      return;
    }
    return window.WT_UI_Leaderboard.submitRun(this, lastRun, {
      getLeaderboardContentVersion
    });
  };

  UI.prototype.openRedeemModal = function () {
    const w = this.wording || {};
    const how = w.howto || {};

    const placeholder = String(how.activationCodePlaceholder || '').trim();
    const phAttr = placeholder
      ? ` placeholder="${escapeHtml(placeholder)}"`
      : '';

    // Prefill from storage single source of truth (no raw data access)
    let existingCode = '';
    if (
      this.storage &&
      typeof this.storage.getStoredPremiumCode === 'function'
    ) {
      try {
        existingCode = String(this.storage.getStoredPremiumCode() || '').trim();
      } catch (_) {
        existingCode = '';
      }
    }

    const valAttr = existingCode ? ` value="${escapeHtml(existingCode)}"` : '';

    const html = `
      <label class="wt-label" for="wt-code">${escapeHtml(String(how.activationCodeLabel || '').trim())}</label>
      <input id="wt-code" class="wt-input" autocomplete="off" inputmode="text"${phAttr}${valAttr} />
      <p class="wt-muted">${escapeHtml(String(how.activateLine2 || '').trim())}</p>

      <div class="wt-actions">
        <button class="wt-btn wt-btn--primary" data-action="confirm-redeem">${escapeHtml(String(how.activateCta || '').trim())}</button>
      </div>

      <p id="wt-code-msg" class="wt-muted" aria-live="polite"></p>
    `;

    this.openModal(html, String(how.activateTitle || '').trim());

    // UX: focus input (optional, safe)
    try {
      const input = this.modalContentEl
        ? this.modalContentEl.querySelector('#wt-code')
        : null;
      if (input && typeof input.focus === 'function') input.focus();
      if (
        input &&
        typeof input.setSelectionRange === 'function' &&
        existingCode
      ) {
        input.setSelectionRange(existingCode.length, existingCode.length);
      }
    } catch (_) {
      /* silent */
    }
  };

  UI.prototype.promptAutoRedeemIfReady = function () {
    // Guardrails: StorageManager is the source of truth, and prompt only once per page-load.
    if (this._runtime && this._runtime._autoRedeemPromptShown === true) return;

    const isPrem = isPremiumNow(this.storage);
    if (isPrem) return;

    if (!this.storage || typeof this.storage.getVanityCode !== 'function')
      return;

    let code = '';
    try {
      code = String(this.storage.getVanityCode() || '').trim();
    } catch (_) {
      code = '';
    }
    if (!code) return;

    if (this._runtime) this._runtime._autoRedeemPromptShown = true;
    this.openAutoRedeemModal();
  };

  UI.prototype.openAutoRedeemModal = function () {
    const w = this.wording || {};
    const how = w.howto || {};

    const title = String(how.autoActivateTitle || '').trim();
    const l1 = String(how.autoActivateLine1 || '').trim();
    const l2 = String(how.autoActivateLine2 || '').trim();

    const cta = String(how.autoActivateCta || '').trim();
    const later = String(how.autoActivateLater || '').trim();

    const html = `
      ${l1 ? `<p>${escapeHtml(l1)}</p>` : ``}
      ${l2 ? `<p class="wt-muted">${escapeHtml(l2)}</p>` : ``}

      <div class="wt-actions">
        ${cta ? `<button class="wt-btn wt-btn--primary" data-action="auto-redeem-now">${escapeHtml(cta)}</button>` : ``}
        ${later ? `<button class="wt-btn wt-btn--secondary" data-action="auto-redeem-later">${escapeHtml(later)}</button>` : ``}
      </div>

      <p id="wt-auto-redeem-msg" class="wt-muted" aria-live="polite"></p>
    `;

    this.openModal(html, title);
  };

  UI.prototype._redeemVanityCodeNow = function () {
    const w = this.wording || {};
    const how = w.howto || {};

    const msg = this.modalContentEl
      ? this.modalContentEl.querySelector('#wt-auto-redeem-msg')
      : null;

    if (
      !this.storage ||
      typeof this.storage.tryRedeemPremiumCode !== 'function' ||
      typeof this.storage.getVanityCode !== 'function'
    ) {
      if (msg) msg.textContent = String(how.codeRejected || '').trim();
      return;
    }

    let code = '';
    try {
      code = String(this.storage.getVanityCode() || '').trim();
    } catch (_) {
      code = '';
    }
    if (!code) {
      if (msg) msg.textContent = String(how.codeRejected || '').trim();
      return;
    }

    const res = this.storage.tryRedeemPremiumCode(code);
    if (!res || res.ok !== true) {
      if (msg) msg.textContent = String(how.codeRejected || '').trim();
      return;
    }

    if (String(res.reason || '').trim().toUpperCase() === 'UNLOCKED') {
      try {
        if (
          window.WT_Analytics &&
          typeof window.WT_Analytics.trackFunnel === 'function' &&
          typeof window.WT_Analytics.inferUiContext === 'function'
        ) {
          window.WT_Analytics.trackFunnel(
            'unlock_success',
            window.WT_Analytics.inferUiContext(this, {
              unlock_method: 'auto'
            })
          );
        }
      } catch (_) {
        /* silent */
      }
    }

    // Success: clear vanity key to prevent re-prompting
    if (typeof this.storage.clearVanityCode === 'function') {
      try {
        this.storage.clearVanityCode();
      } catch (_) {
        /* silent */
      }
    }

    toastNow(this.config, String(how.codeOk || '').trim());
    this.closeModal();
    this.render();
  };

  UI.prototype._confirmRedeemCode = async function () {
    const w = this.wording || {};
    const how = w.howto || {};

    const input = this.modalContentEl
      ? this.modalContentEl.querySelector('#wt-code')
      : null;
    const msg = this.modalContentEl
      ? this.modalContentEl.querySelector('#wt-code-msg')
      : null;
    const confirmBtn = this.modalContentEl
      ? this.modalContentEl.querySelector('[data-action="confirm-redeem"]')
      : null;

    const code = String(input && input.value ? input.value : '').trim();
    if (!code) {
      if (msg) msg.textContent = String(how.enterCode || '').trim();
      return;
    }

    if (!this.storage) {
      if (msg) msg.textContent = String(how.codeRejected || '').trim();
      return;
    }

    // Server-verified path first (admin/guest codes — see storage.js's
    // tryRedeemPremiumCodeRemote). Only falls back to the local format-only
    // check below if the Worker doesn't recognize this code at all or is
    // unreachable; an explicit server rejection (e.g. a guest code past its
    // use cap) must NOT fall back, or the cap would be meaningless.
    let res = null;
    if (typeof this.storage.tryRedeemPremiumCodeRemote === 'function') {
      if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.setAttribute('aria-busy', 'true');
      }
      if (msg) msg.textContent = String(how.codeChecking || '').trim();
      try {
        res = await this.storage.tryRedeemPremiumCodeRemote(code);
      } catch (_) {
        res = null;
      }
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.removeAttribute('aria-busy');
      }
    }

    const shouldTryLocalFallback =
      !res ||
      (res.ok !== true &&
        (res.reason === 'REMOTE_UNAVAILABLE' || res.reason === 'NOT_FOUND'));

    if (shouldTryLocalFallback) {
      const cfg = this.config || {};
      const reRaw = String(cfg.premiumCodeRegex || '').trim();
      if (reRaw) {
        try {
          const re = new RegExp(reRaw);
          if (!re.test(code)) {
            if (msg) msg.textContent = String(how.codeInvalid || '').trim();
            return;
          }
        } catch (_) {
          // ignore (soft)
        }
      }

      if (typeof this.storage.tryRedeemPremiumCode !== 'function') {
        if (msg) msg.textContent = String(how.codeRejected || '').trim();
        return;
      }

      res = this.storage.tryRedeemPremiumCode(code);
    }

    if (!res || res.ok !== true) {
      if (msg) msg.textContent = String(how.codeRejected || '').trim();
      return;
    }

    if (String(res.reason || '').trim().toUpperCase() === 'UNLOCKED') {
      try {
        if (
          window.WT_Analytics &&
          typeof window.WT_Analytics.trackFunnel === 'function' &&
          typeof window.WT_Analytics.inferUiContext === 'function'
        ) {
          window.WT_Analytics.trackFunnel(
            'unlock_success',
            window.WT_Analytics.inferUiContext(this, {
              unlock_method: 'manual'
            })
          );
        }
      } catch (_) {
        /* silent */
      }
    }

    /// Success
    toastNow(this.config, String(how.codeOk || '').trim());
    this.closeModal();
    this.render();
  };

  // ============================================
  // Game flow
  // ============================================

  // V2 first-run framing:
  // - free users: shown during free runs only
  // - premium users: shown once on the first premium run
  // Persistence is owned by StorageManager.

  UI.prototype._canShowFirstRunFraming = function () {
    // Only from landing
    if (this.state !== STATES.LANDING) return false;

    if (!this.storage) return false;

    const runsUsed = Number(this.storage.getRunsUsed?.() || 0);

    // Free users: framing only during free runs
    const freeRuns = clampInt(this.config?.limits?.freeRuns, 0, 99);

    if (isPremiumNow(this.storage)) {
      if (typeof this.storage.hasSeenPremiumFirstRunFraming !== 'function')
        return false;
      return this.storage.hasSeenPremiumFirstRunFraming() !== true;
    }

    return runsUsed < freeRuns;
  };

  UI.prototype._openFirstRunFraming = function () {
    const w = this.wording || {};
    const fr = w.firstRun || {};
    const cfg = this.config || {};

    const poolSize = clampInt(cfg?.game?.poolSize, 1, 9999);
    const maxChances = clampInt(cfg?.game?.maxChances, 1, 99);
    const freeRuns = clampInt(cfg?.limits?.freeRuns, 0, 99);

    const vars = { poolSize, maxChances, freeRuns };

    let runsUsed = 0;
    if (this.storage && typeof this.storage.getRunsUsed === 'function') {
      runsUsed = Number(this.storage.getRunsUsed() || 0);
    }

    const run1Lines = Array.isArray(fr.run1Lines) ? fr.run1Lines : [];
    const run2Lines = Array.isArray(fr.run2Lines) ? fr.run2Lines : [];
    const run3Lines = Array.isArray(fr.run3Lines) ? fr.run3Lines : [];

    const activeLines =
      runsUsed === 1 ? run2Lines : runsUsed === 2 ? run3Lines : run1Lines;

    const renderLines = (arr) => {
      return arr
        .map((s) => String(s || '').trim())
        .filter(Boolean)
        .map(
          (s, i) =>
            `<p class="wt-meta${i === 0 ? ` wt-meta--strong` : ``}">${escapeHtml(fillTemplate(s, vars))}</p>`
        )
        .join('');
    };

    const html = `
      ${renderLines(activeLines)}
          <div class="wt-actions">
                     <button class="wt-btn wt-btn--primary" data-action="start-run" aria-label="${escapeHtml(String(fr.ctaLabel || '').trim())}">
           ${escapeHtml(String(fr.ctaLabel || '').trim())}
         </button>

      </div>

    `;

    let modalTitle =
      String(fr.titleRun1 || '').trim() || String(w.system?.more || '').trim();
    if (runsUsed === 1 && String(fr.titleRun2 || '').trim()) {
      modalTitle = String(fr.titleRun2 || '').trim();
    } else if (runsUsed === 2 && String(fr.titleRun3 || '').trim()) {
      modalTitle = String(fr.titleRun3 || '').trim();
    }

    try {
      markSeenFirstRunFraming(this.storage);
    } catch (_) {}

    try {
      if (
        isPremiumNow(this.storage) &&
        typeof this.storage.markSeenPremiumFirstRunFraming === 'function'
      ) {
        this.storage.markSeenPremiumFirstRunFraming();
      }
    } catch (_) {}

    this.openModal(html, modalTitle);
  };

  UI.prototype._maybeTriggerMicroPic = function (res) {
    // Spec: only in RUN (never in practice)
    // Product rule (updated): micro-pics can surface during RUN via gameplay overlay, with cooldown.
    if (!this._runtime) return;
    const runMode = String(this._runtime?.runMode || '').trim();
    if (!runMode) return;
    if (runMode !== MODES.RUN) return;

    const mp = this._runtime.microPics;
    if (!mp) return;

    const w = this.wording || {};
    const mpc =
      w.micropics && typeof w.micropics === 'object' ? w.micropics : {};
    const cfg = this.config || {};
    const phaseCtx = getRuleKnowledgePhaseContext({
      cfg,
      w,
      storage: this.storage,
      poolSize: clampInt(cfg?.game?.poolSize, 0, 99999)
    });
    const phaseMpc = Object.assign({}, mpc, phaseCtx.micropics || {});

    const mpCfg = cfg && cfg.microPics ? cfg.microPics : null;
    if (!mpCfg) return;

    let answeredCount = 0;
    try {
      const gs =
        this.game && typeof this.game.getState === 'function'
          ? this.game.getState() || {}
          : {};
      const idx = Number(gs.idx);
      if (Number.isFinite(idx)) answeredCount = idx + 1;
    } catch (_) {
      /* keep 0 */
    }

    const isCorrect = res && res.isCorrect === true;

    // Live state after engine answer
    let chancesLeft = mp.prevChancesLeft;
    try {
      const gs =
        this.game && typeof this.game.getState === 'function'
          ? this.game.getState() || {}
          : {};
      if (gs.chancesLeft != null) chancesLeft = clampInt(gs.chancesLeft, 0, 99);
    } catch (_) {
      /* keep prev */
    }

    // Detect chance loss strictly (observable state change)
    const prev = mp.prevChancesLeft == null ? chancesLeft : mp.prevChancesLeft;
    const chanceLost =
      !isCorrect &&
      Number.isFinite(prev) &&
      Number.isFinite(chancesLeft) &&
      chancesLeft < prev;

    // Update prev snapshot ASAP
    mp.prevChancesLeft = chancesLeft;

    // Maintain streak + momentum meter
    if (isCorrect) {
      mp.correctStreak = clampInt(mp.correctStreak + 1, 0, 9999);
      mp.maxCorrectStreak = Math.max(
        clampInt(mp.maxCorrectStreak, 0, 9999),
        mp.correctStreak
      );

      const momentumState = getMomentumMeterState(
        cfg,
        mp.correctStreak,
        runMode,
        mp.momentumLevel
      );
      if (momentumState) {
        const maxSegments = getMomentumSegments(cfg);
        const current = clampInt(mp.momentumLevel, 0, maxSegments);
        const target = clampInt(momentumState.target, 0, maxSegments);

        // Recovery must feel immediate:
        // after a loss, each correct answer rebuilds +1 visible segment
        // instead of waiting for the new streak to "catch up".
        mp.momentumLevel = Math.min(maxSegments, Math.max(target, current + 1));
      }
    } else {
      mp.correctStreak = 0;
      mp.flowTierShown = 0;

      mp.momentumLevel = 0;
    }

    // Danger overlays are handled centrally (no micro-pic overlay on chance loss)
    // But we do want to mark the "post-mistake" window for recovery logic.
    if (chanceLost) {
      mp.justRecoveredFromMistake = true;
      mp.lastDangerAtCount = answeredCount;
      mp.lastDangerAtMs = Date.now();
    }

    // Timing bucket (no fallback): required for in-run micro-pics
    const timing = getToastTiming(cfg, 'positive');
    if (!timing) return;

    const cooldownItems = Number(mpCfg.cooldownItems);
    if (
      !Number.isFinite(cooldownItems) ||
      cooldownItems < 0 ||
      cooldownItems > 99
    )
      return;

    function tryShowRunOverlay(msg, variant) {
      const m = String(msg || '').trim();
      if (!m) return false;

      // 1 message per answer (even if cooldownItems=0)
      if (answeredCount === clampInt(mp.lastToastAtCount, -9999, 9999))
        return false;

      // Do not show a positive overlay on the exact same answer as a danger event.
      // Once the next valid answer lands, positives may resume normally.
      const lastDangerAtCount = clampInt(mp.lastDangerAtCount, -9999, 9999);
      if (answeredCount === lastDangerAtCount) return false;

      const canShowNow =
        answeredCount - clampInt(mp.lastToastAtCount, -9999, 9999) >=
        Math.floor(cooldownItems);
      if (!canShowNow) return false;

      scheduleGameplayOverlay(m, {
        delayMs: timing.delayMs,
        durationMs: timing.durationMs,
        variant: String(variant || 'info'),
        cfg,
        mode: runMode
      });
      mp.lastToastAtCount = answeredCount;
      return true;
    }

    function setEndHighlight(msg, variant, priority) {
      const m = String(msg || '').trim();
      if (!m) return;

      const p = Number(priority);
      if (!Number.isFinite(p)) return;

      const currentP = Number(mp.endHighlightPriority);
      const hasCurrent = Number.isFinite(currentP);

      if (!hasCurrent || p > currentP) {
        mp.endHighlight = m;
        mp.endHighlightVariant = String(variant || '').trim();
        mp.endHighlightPriority = Math.floor(p);
      }
    }

    // Chance loss handler: no gameplay micro-pic on this answer.
    // We can still set END-only highlights (no interruptions).
    if (chanceLost) {
      // Near-miss (one-shot per RUN): error that brings you down to 1 chance left.
      if (
        cfg?.microPics?.nearMissEnabled === true &&
        chancesLeft === 1 &&
        mp.nearMissShown !== true
      ) {
        const msg = String(phaseMpc.nearMiss || mpc.nearMiss || '').trim();
        setEndHighlight(msg, 'info', getEndHighlightPriority(cfg, 'nearMiss'));
        mp.nearMissShown = true;
      }

      // Repeated mistakes qualitative feedback (one-shot per RUN)
      const minWrong = Number(cfg?.microPics?.repeatMistakeWrongCountMin);
      if (
        Number.isFinite(minWrong) &&
        minWrong > 0 &&
        mp.repeatMistakeShown !== true
      ) {
        const idNum = Number(res?.itemId);
        if (
          Number.isFinite(idNum) &&
          this.storage &&
          typeof this.storage.getItemStats === 'function'
        ) {
          const st = this.storage.getItemStats(idNum) || null;
          const wc = Number(st?.wrongCount || 0);
          if (Number.isFinite(wc) && wc >= Math.floor(minWrong)) {
            const msg = String(
              phaseMpc.repeatMistake || mpc.repeatMistake || ''
            ).trim();
            setEndHighlight(
              msg,
              'info',
              getEndHighlightPriority(cfg, 'repeatMistake')
            );
            mp.repeatMistakeShown = true;
          }
        }
      }

      return;
    }

    // Survival highlight: reached 1 chance remaining at least once (RUN)
    // Rule: 1 message per answer max -> if survival shows, skip tier streak on this answer.
    if (isCorrect && chancesLeft === 1 && mp.survivalShown !== true) {
      const msg = String(
        phaseMpc.runContinues || mpc.runContinues || ''
      ).trim();
      if (tryShowRunOverlay(msg, 'info')) {
        mp.survivalShown = true;
      }
      setEndHighlight(msg, 'info', getEndHighlightPriority(cfg, 'survival'));
      return;
    }

    // Flow highlight (highest tier wins)
    const s = clampInt(mp.correctStreak, 0, 9999);

    // No fallback: thresholds must exist in WT_CONFIG.microPics.streakThresholds.
    const th = cfg?.microPics?.streakThresholds;
    const tLegendary = Number(th?.legendary);
    const tElite = Number(th?.elite);
    const tStrong = Number(th?.strong);
    const tBuilding = Number(th?.building);
    const tStart = Number(th?.start);

    const ok =
      Number.isFinite(tLegendary) &&
      Number.isFinite(tElite) &&
      Number.isFinite(tStrong) &&
      Number.isFinite(tBuilding) &&
      Number.isFinite(tStart);

    if (!ok) return;

    // Show at most one tier per answer (priority: highest)
    const tierOnce =
      mp.tierShownOnce && typeof mp.tierShownOnce === 'object'
        ? mp.tierShownOnce
        : null;

    const againTpl = String(phaseMpc.streakAgainTemplate || '').trim();
    function againMsgFor(threshold) {
      if (!againTpl) return '';
      return String(
        fillTemplate(againTpl, {
          n: Math.floor(Number(threshold)),
          streak: s
        }) || ''
      ).trim();
    }

    // #3 Recovery non-chiffré (one-shot), même sans record
    if (
      mp.justRecoveredFromMistake === true &&
      s >= tBuilding &&
      mp.flowTierShown < tBuilding
    ) {
      const msg = String(phaseMpc.recovery || '').trim();
      if (tryShowRunOverlay(msg, 'info')) {
        mp.flowTierShown = tBuilding;
        mp.justRecoveredFromMistake = false;
        mp.maxCorrectStreakDisplayed = Math.max(
          clampInt(mp.maxCorrectStreakDisplayed, 0, 9999),
          s
        );
        if (tierOnce) tierOnce.building = true;
        setEndHighlight(
          msg,
          'success',
          getEndHighlightPriority(cfg, 'recovery')
        );
      }
      return;
    }

    if (s >= tLegendary && mp.flowTierShown < tLegendary) {
      const already = !!(tierOnce && tierOnce.legendary === true);
      const baseMsg = String(phaseMpc.streakLegendary || '').trim();
      const msg = (already ? againMsgFor(tLegendary) : '') || baseMsg;

      if (tryShowRunOverlay(msg, 'info')) {
        mp.flowTierShown = tLegendary;
        mp.maxCorrectStreakDisplayed = Math.max(
          clampInt(mp.maxCorrectStreakDisplayed, 0, 9999),
          s
        );
      }
      if (tierOnce) tierOnce.legendary = true;
      setEndHighlight(
        msg,
        'success',
        getEndHighlightPriority(cfg, 'streakLegendary')
      );
      mp.justRecoveredFromMistake = false;
      return;
    }
    if (s >= tElite && mp.flowTierShown < tElite) {
      const already = !!(tierOnce && tierOnce.elite === true);
      const baseMsg = String(phaseMpc.streakElite || '').trim();
      const msg = (already ? againMsgFor(tElite) : '') || baseMsg;

      if (tryShowRunOverlay(msg, 'info')) {
        mp.flowTierShown = tElite;
        mp.maxCorrectStreakDisplayed = Math.max(
          clampInt(mp.maxCorrectStreakDisplayed, 0, 9999),
          s
        );
      }
      if (tierOnce) tierOnce.elite = true;
      setEndHighlight(
        msg,
        'success',
        getEndHighlightPriority(cfg, 'streakElite')
      );
      mp.justRecoveredFromMistake = false;
      return;
    }
    if (s >= tStrong && mp.flowTierShown < tStrong) {
      const already = !!(tierOnce && tierOnce.strong === true);
      const baseMsg = String(phaseMpc.streakStrong || '').trim();
      const msg = (already ? againMsgFor(tStrong) : '') || baseMsg;

      if (tryShowRunOverlay(msg, 'success')) {
        mp.flowTierShown = tStrong;
        mp.maxCorrectStreakDisplayed = Math.max(
          clampInt(mp.maxCorrectStreakDisplayed, 0, 9999),
          s
        );
      }
      if (tierOnce) tierOnce.strong = true;
      setEndHighlight(
        msg,
        'success',
        getEndHighlightPriority(cfg, 'streakStrong')
      );
      mp.justRecoveredFromMistake = false;
      return;
    }
    if (s >= tBuilding && mp.flowTierShown < tBuilding) {
      const already = !!(tierOnce && tierOnce.building === true);
      const baseMsg = String(phaseMpc.streakBuilding || '').trim();
      const msg = (already ? againMsgFor(tBuilding) : '') || baseMsg;

      if (tryShowRunOverlay(msg, 'info')) {
        mp.flowTierShown = tBuilding;
        mp.maxCorrectStreakDisplayed = Math.max(
          clampInt(mp.maxCorrectStreakDisplayed, 0, 9999),
          s
        );
      }
      if (tierOnce) tierOnce.building = true;
      setEndHighlight(
        msg,
        'success',
        getEndHighlightPriority(cfg, 'streakBuilding')
      );
      mp.justRecoveredFromMistake = false;
      return;
    }

    if (s >= tStart && mp.flowTierShown < tStart) {
      const already = !!(tierOnce && tierOnce.start === true);
      const baseMsg = String(phaseMpc.streakStart || '').trim();
      const msg = (already ? againMsgFor(tStart) : '') || baseMsg;

      if (tryShowRunOverlay(msg, 'info')) {
        mp.flowTierShown = tStart;
        mp.maxCorrectStreakDisplayed = Math.max(
          clampInt(mp.maxCorrectStreakDisplayed, 0, 9999),
          s
        );
      }
      if (tierOnce) tierOnce.start = true;
      setEndHighlight(
        msg,
        'success',
        getEndHighlightPriority(cfg, 'streakStart')
      );
      mp.justRecoveredFromMistake = false;
      return;
    }

    // End-of-run highlight (only meaningful if the run ended)
    const done = res && res.done === true;
    if (done === true) {
      if (chancesLeft === 0 && answeredCount >= 6) {
        setEndHighlight(
          String(mpc.runEndedAllChancesUsed || '').trim(),
          'success',
          getEndHighlightPriority(cfg, 'runEndedAllChancesUsed')
        );
        return;
      }
    }

    return;
  };
