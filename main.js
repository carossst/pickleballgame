// main.js v2.0 - App bootstrap

(() => {
  'use strict';

  function buildUpdateReloadUrl() {
    const url = new URL(window.location.href);
    url.searchParams.set('wt-refresh', String(Date.now()));
    return url.toString();
  }

  function reloadForUpdate() {
    try {
      Logger.log('[UPDATE] reloadForUpdate', { href: window.location.href });
    } catch (_) {}
    window.location.assign(buildUpdateReloadUrl());
  }

  function escapeHtmlSafe(str) {
    const s = String(str == null ? '' : str);
    const fn =
      window.WT_UTILS && typeof window.WT_UTILS.escapeHtml === 'function'
        ? window.WT_UTILS.escapeHtml
        : null;

    if (!fn) {
      throw new Error(
        'WT_UTILS.escapeHtml missing. config.js must load before main.js.'
      );
    }

    return String(fn(s));
  }

  function pickOne(arr, fallback) {
    const list = Array.isArray(arr)
      ? arr.map((x) => String(x || '').trim()).filter(Boolean)
      : [];
    if (!list.length) return String(fallback || '').trim();
    const index = Math.floor(Math.random() * list.length);
    return list[index] || String(fallback || '').trim();
  }

  function fillTemplateLocal(template, vars) {
    let out = String(template == null ? '' : template);
    const map = vars && typeof vars === 'object' ? vars : {};
    for (const [key, value] of Object.entries(map)) {
      out = out.replaceAll(`{${key}}`, String(value == null ? '' : value));
    }
    return out;
  }

  function getActiveWording() {
    try {
      const direct = window.WT_WORDING;
      if (direct && typeof direct === 'object') return direct;

      const all = window.WT_WORDING_ALL;
      const loc =
        window.WT_I18N && typeof window.WT_I18N.getLocale === 'function'
          ? window.WT_I18N.getLocale()
          : String(window.WT_CONFIG?.i18n?.defaultLocale || 'en');
      if (all && typeof all === 'object') {
        return (
          all[loc] || all[window.WT_CONFIG?.i18n?.defaultLocale] || all.en || {}
        );
      }
    } catch (_) {}
    return {};
  }

  function getSystemCopy(key, fallback, vars) {
    try {
      const wording = getActiveWording();
      const raw =
        wording && wording.system && typeof wording.system[key] === 'string'
          ? wording.system[key]
          : fallback;
      return fillTemplateLocal(raw, vars);
    } catch (_) {
      return fillTemplateLocal(fallback, vars);
    }
  }

  // ============================================
  // Logger (like TYF)
  // ============================================
  const Logger = {
    debug: (...args) =>
      window.WT_CONFIG?.debug?.enabled &&
      window.WT_CONFIG.debug.logLevel === 'debug' &&
      console.log('[WT Debug]', ...args),

    log: (...args) =>
      window.WT_CONFIG?.debug?.enabled &&
      ['debug', 'log'].includes(window.WT_CONFIG.debug.logLevel) &&
      console.log('[WT]', ...args),

    warn: (...args) =>
      window.WT_CONFIG?.debug?.enabled && console.warn('[WT Warning]', ...args),

    error: (...args) => console.error('[WT Error]', ...args)
  };

  window.Logger = Logger;

  // ============================================
  // Error display
  // ============================================
  function showFatal(message) {
    const root = document.getElementById('app');
    if (!root) return;

    const safeMsg = escapeHtmlSafe(message);
    const appName = escapeHtmlSafe(
      String(window.WT_CONFIG?.identity?.appName || 'Game').trim()
    );

    root.innerHTML = `
      <div class="wt-card wt-card--error">
        <h1 class="wt-h1">${appName}</h1>
        <p class="wt-muted">${safeMsg}</p>
        <button id="wtFatalReloadBtn" class="wt-btn wt-btn--secondary" type="button">${escapeHtmlSafe(getSystemCopy('fatalReload', 'Reload'))}</button>
      </div>
    `;

    const btn = document.getElementById('wtFatalReloadBtn');
    if (btn) btn.addEventListener('click', reloadForUpdate);
  }

  window.showFatal = showFatal;

  // ============================================
  // Global error handlers
  // ============================================
  window.addEventListener('error', (event) => {
    Logger.error('Global error:', event.error || event);

    if (window.__WT_APP_BOOTED__ === true) return;

    const isDev = window.WT_CONFIG?.debug?.enabled;
    const errorMsg = event.message || event.error?.message || 'Unknown error';
    showFatal(
      isDev
        ? getSystemCopy(
            'fatalJavascriptPrefix',
            'JavaScript Error: {message}',
            { message: errorMsg }
          )
        : getSystemCopy(
            'fatalLoadFailed',
            'Unable to load the game. Please refresh the page.'
          )
    );
  });

  window.addEventListener('unhandledrejection', (event) => {
    Logger.error('Unhandled promise rejection:', event.reason);

    if (window.__WT_APP_BOOTED__ === true) return;

    const isDev = window.WT_CONFIG?.debug?.enabled;
    const errorMsg = event.reason?.message || 'Promise rejection';
    showFatal(
      isDev
        ? getSystemCopy('fatalPromisePrefix', 'Promise Error: {message}', {
            message: errorMsg
          })
        : getSystemCopy(
            'fatalUnexpected',
            'An unexpected issue occurred. Please refresh the page.'
          )
    );
  });
  // ============================================
  // Content loader
  // ============================================
  async function loadJson(url) {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Failed to load ${url}: ${res.status}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(
        `Invalid JSON response for ${url} (content-type: ${contentType})`
      );
    }

    return await res.json();
  }

  // ============================================
  // Service Worker registration
  // ============================================
  function initServiceWorker() {
    const cfg = window.WT_CONFIG;
    if (!cfg || typeof cfg !== 'object') return;
    if (cfg?.serviceWorker?.enabled !== true) return;
    if (cfg.environment === 'development') return;

    if (!('serviceWorker' in navigator)) {
      Logger.warn('Service Worker not supported');
      return;
    }

    function getUpdateToastStorageKey() {
      try {
        const storageKey = String(cfg?.storage?.storageKey || '').trim();
        if (!storageKey) return '';
        return `wt-sw-update-toast-seen:${storageKey}`;
      } catch (_) {
        return '';
      }
    }

    function getWaitingWorkerKey(worker) {
      const w = worker || window.__WT_SW_WAITING__ || null;
      return String(w?.scriptURL || w?.state || 'waiting').trim();
    }

    function hasSeenUpdateToast(waitingKey) {
      const key = String(waitingKey || '').trim();
      if (!key) return false;

      if (window.__WT_SW_LAST_TOAST_KEY__ === key) return true;

      const storageKey = getUpdateToastStorageKey();
      if (!storageKey) return false;

      try {
        return window.localStorage.getItem(storageKey) === key;
      } catch (_) {
        return false;
      }
    }

    function markUpdateToastSeen(waitingKey) {
      const key = String(waitingKey || '').trim();
      if (!key) return;

      window.__WT_SW_LAST_TOAST_KEY__ = key;

      const storageKey = getUpdateToastStorageKey();
      if (!storageKey) return;

      try {
        window.localStorage.setItem(storageKey, key);
      } catch (_) {}
    }

    function hideUpdateToast() {
      const node = document.getElementById('update-toast');
      if (node && node.classList) node.classList.remove('wt-toast--visible');
    }

    function showUpdateToast(message) {
      const msg = String(message || '').trim();
      if (!msg) return;

      // KISS: reuse the existing #update-toast shell from index.html
      const node = document.getElementById('update-toast');
      if (!node) return;

      const waitingKey = getWaitingWorkerKey(window.__WT_SW_WAITING__ || null);
      if (!waitingKey) return;

      if (hasSeenUpdateToast(waitingKey)) {
        window.__WT_SW_UPDATE_READY__ = true;
        hideUpdateToast();
        return;
      }

      // Mark update ready so UI can decide when to apply it (user-controlled).
      // Persist the seen key immediately. If iOS/PWA keeps the same waiting worker
      // across reloads, the user is not asked again and again.
      window.__WT_SW_UPDATE_READY__ = true;
      markUpdateToastSeen(waitingKey);

      const text = node.querySelector('[data-wt-update-text]');
      if (text) text.textContent = msg;

      node.classList.add('wt-toast--visible');
    }

    function setWaitingWorker(worker) {
      if (!worker) return;
      window.__WT_SW_WAITING__ = worker;
      window.__WT_SW_UPDATE_READY__ = true;
    }

    async function tryPromoteInstallingWorker(worker) {
      if (!worker) return false;
      if (worker.state === 'installed') {
        setWaitingWorker(worker);
        return true;
      }

      return await new Promise((resolve) => {
        let done = false;

        function finish(ok) {
          if (done) return;
          done = true;
          resolve(ok === true);
        }

        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed') {
            setWaitingWorker(worker);
            finish(true);
            return;
          }

          if (worker.state === 'redundant') {
            finish(false);
          }
        });

        window.setTimeout(() => finish(false), 4000);
      });
    }

    window.__WT_APPLY_SW_UPDATE__ = async function () {
      if (window.__WT_SW_UPDATE_IN_FLIGHT__ === true) return;

      hideUpdateToast();

      let fallbackTimer = null;
      function armFallbackReload() {
        if (fallbackTimer) return;
        fallbackTimer = window.setTimeout(() => {
          fallbackTimer = null;
          reloadForUpdate();
        }, 2500);
      }

      const registration = window.__WT_SW_REGISTRATION__ || null;
      let waiting = window.__WT_SW_WAITING__ || registration?.waiting || null;

      if (!waiting && registration) {
        try {
          await registration.update();
        } catch (_) {}
        waiting = registration.waiting || null;
      }

      if (!waiting && registration?.installing) {
        const ready = await tryPromoteInstallingWorker(registration.installing);
        if (ready) {
          waiting = window.__WT_SW_WAITING__ || registration.waiting || null;
        }
      }

      if (!waiting || typeof waiting.postMessage !== 'function') {
        reloadForUpdate();
        return;
      }

      try {
        window.__WT_SW_RELOAD_ON_CONTROLLERCHANGE__ = true;
      } catch (_) {}
      try {
        window.__WT_SW_UPDATE_IN_FLIGHT__ = true;
      } catch (_) {}

      try {
        armFallbackReload();
        waiting.postMessage({ type: 'SKIP_WAITING' });
      } catch (_) {
        try {
          window.__WT_SW_RELOAD_ON_CONTROLLERCHANGE__ = false;
        } catch (_) {}
        try {
          window.__WT_SW_UPDATE_IN_FLIGHT__ = false;
        } catch (_) {}
        reloadForUpdate();
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      try {
        Logger.log('[UPDATE] controllerchange');
      } catch (_) {}
      if (window.__WT_SW_RELOAD_ON_CONTROLLERCHANGE__ !== true) return;
      try {
        window.__WT_SW_RELOAD_ON_CONTROLLERCHANGE__ = false;
      } catch (_) {}
      try {
        window.__WT_SW_UPDATE_IN_FLIGHT__ = false;
      } catch (_) {}
      reloadForUpdate();
    });

    window.addEventListener('load', () => {
      const version = String(cfg.version || '').trim();
      if (!version) {
        Logger.warn(
          'WT_CONFIG.version missing/empty: skipping Service Worker registration (fail-closed)'
        );
        return;
      }

      const storageKey = String(cfg?.storage?.storageKey || '').trim();
      if (!storageKey) {
        Logger.warn(
          'WT_CONFIG.storage.storageKey missing/empty: skipping Service Worker registration (fail-closed)'
        );
        return;
      }

      const v = encodeURIComponent(version);
      const appScope = encodeURIComponent(storageKey);
      const swUrl = `./sw.js?v=${v}&app=${appScope}`;

      navigator.serviceWorker
        .register(swUrl, { scope: './' })
        .then((registration) => {
          window.__WT_SW_REGISTRATION__ = registration;
          Logger.log('✅ Service Worker registered:', registration.scope);

          // Update already waiting from a previous page session: surface it immediately.
          if (
            cfg.serviceWorker.showUpdateNotifications &&
            registration.waiting &&
            navigator.serviceWorker.controller
          ) {
            setWaitingWorker(registration.waiting);
            const msg = String(
              window.WT_WORDING?.system?.updateAvailable || ''
            ).trim();
            if (msg) showUpdateToast(msg);
          }

          // Auto-update check
          if (cfg.serviceWorker.autoUpdate) {
            if (window.__WT_SW_AUTO_UPDATE_INTERVAL__) {
              window.clearInterval(window.__WT_SW_AUTO_UPDATE_INTERVAL__);
            }

            window.__WT_SW_AUTO_UPDATE_INTERVAL__ = window.setInterval(
              () => {
                registration.update().catch(() => {});
              },
              10 * 60 * 1000
            ); // Every 10 min
          }

          // Update notification (config: showUpdateNotifications)
          // IMPORTANT: never auto-reload (can kill an active run). User-controlled reload only.
          if (cfg.serviceWorker.showUpdateNotifications) {
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (!newWorker) return;

              newWorker.addEventListener('statechange', () => {
                // Only notify when updating an already-controlled page
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  setWaitingWorker(newWorker);
                  const msg = String(
                    window.WT_WORDING?.system?.updateAvailable || ''
                  ).trim();
                  if (msg) showUpdateToast(msg);
                }
              });
            });
          }
        })
        .catch((err) => {
          Logger.warn(
            'Service Worker registration failed:',
            err?.message || err
          );
        });
    });
  }

  // ============================================
  // Validation
  // ============================================
  function validatePrerequisites() {
    if (!window.WT_CONFIG) {
      Logger.error('WT_CONFIG not found');
      showFatal(
        getSystemCopy(
          'fatalConfigMissing',
          'Configuration error: application settings not loaded.'
        )
      );
      return false;
    }

    let storageOk = false;
    try {
      const ls = window.localStorage;
      if (ls) {
        const probeKey = '__wt_storage_probe__';
        ls.setItem(probeKey, '1');
        ls.removeItem(probeKey);
        storageOk = true;
      }
    } catch (_) {
      storageOk = false;
    }

    if (!storageOk) {
      Logger.error('localStorage not supported or unavailable');
      showFatal(
        getSystemCopy(
          'fatalStorageUnsupported',
          'Your browser does not support local storage. Please use a modern browser.'
        )
      );
      return false;
    }

    const appContainer = document.getElementById('app');
    if (!appContainer) {
      Logger.error('App container not found');
      showFatal(
        getSystemCopy(
          'fatalAppContainerMissing',
          'Critical error: app container not found.'
        )
      );
      return false;
    }

    return true;
  }

  function validateModules() {
    // IMPORTANT:
    // StorageManager is a reserved native name in browsers (Storage API).
    // Our app storage class must NOT use that global name.
    const required = ['WT_StorageManager', 'WT_Game', 'WT_UI', 'WT_ICONS'];
    const missing = required.filter((name) => !window[name]);

    if (missing.length > 0) {
      Logger.error(`Missing modules: ${missing.join(', ')}`);
      showFatal(
        getSystemCopy(
          'fatalComponentsMissing',
          'Unable to load game components: {components}. Please refresh the page.',
          { components: missing.join(', ') }
        )
      );
      return false;
    }

    if (typeof window.WT_ICONS.renderIcon !== 'function') {
      Logger.error('WT_ICONS.renderIcon missing');
      showFatal(
        getSystemCopy(
          'fatalIconsMissing',
          'Unable to load game components: WT_ICONS.renderIcon. Please refresh the page.'
        )
      );
      return false;
    }

    return true;
  }

  // ============================================
  // Loading screen
  // ============================================
  function showLoadingScreen() {
    const root = document.getElementById('app');
    if (!root) return;

    const wording = window.WT_WORDING;
    const sys =
      wording &&
      typeof wording === 'object' &&
      wording.system &&
      typeof wording.system === 'object'
        ? wording.system
        : null;

    if (!sys) return;

    const title = String(sys.loadingTitle || '').trim();
    const hint = String(sys.loadingHint || '').trim();
    const logoUrl = String(window.WT_CONFIG?.identity?.uiLogoUrl || '').trim();
    const loadingVisual = logoUrl
      ? `<img src="${escapeHtmlSafe(logoUrl)}" alt="" class="wt-loading-icon" />`
      : `<div class="wt-loading-icon">●</div>`;

    root.innerHTML = `
    <div class="wt-loading">
      ${loadingVisual}
      <div class="wt-loading-spinner"></div>
      <h2 class="wt-h2">${escapeHtmlSafe(title)}</h2>
      <p class="wt-muted">${escapeHtmlSafe(hint)}</p>
    </div>
  `;
  }

  // ============================================
  // ============================================
  // Main application start
  // ============================================
  async function startApplication() {
    showLoadingScreen();

    try {
      const config = window.WT_CONFIG;
      if (!config || typeof config !== 'object') {
        Logger.error('WT_CONFIG missing or invalid');
        showFatal(
          getSystemCopy(
            'fatalConfigMissing',
            'Configuration error: application settings not loaded.'
          )
        );
        return;
      }

      const wording = window.WT_WORDING;
      if (!wording || typeof wording !== 'object') {
        Logger.error('WT_WORDING missing or invalid');
        showFatal(
          getSystemCopy(
            'fatalWordingMissing',
            'Configuration error: UI wording not loaded.'
          )
        );
        return;
      }

      // Init storage
      const storage = new window.WT_StorageManager(config);
      storage.init();
      window.storageManager = storage; // Global for debug

      // Init game engine
      const game = new window.WT_Game.GameEngine();

      // Init UI immediately (LANDING is not content-dependent)
      const ui = new window.WT_UI({ storage, game, config, wording });
      if (ui && typeof ui.setContentLoading === 'function')
        ui.setContentLoading(true);

      // Listen for storage updates (KISS)
      // Contract (intentional): StorageManager emits a single global event "storage-updated".
      // UI refresh strategy is FULL re-render on any mutation (no granular diffs).
      // Reason: preserve inter-module coherence and avoid partial UI desync bugs.
      if (window.__WT_ON_STORAGE_UPDATED__) {
        window.removeEventListener(
          'storage-updated',
          window.__WT_ON_STORAGE_UPDATED__
        );
      }
      window.__WT_ON_STORAGE_UPDATED__ = () => ui.onStorageUpdated();
      window.addEventListener(
        'storage-updated',
        window.__WT_ON_STORAGE_UPDATED__
      );

      if (window.__WT_ON_STORAGE_SAVE_FAILED__) {
        window.removeEventListener(
          'storage-save-failed',
          window.__WT_ON_STORAGE_SAVE_FAILED__
        );
      }
      window.__WT_ON_STORAGE_SAVE_FAILED__ = () => {
        if (ui && typeof ui.onStorageSaveFailed === 'function')
          ui.onStorageSaveFailed();
      };
      window.addEventListener(
        'storage-save-failed',
        window.__WT_ON_STORAGE_SAVE_FAILED__
      );

      ui.init();

      try {
        const onLocaleChange = () => {
          try {
            const newLoc =
              window.WT_I18N && window.WT_I18N.getLocale
                ? window.WT_I18N.getLocale()
                : 'en';
            const reopenLeaderboardModal = !!(
              ui &&
              ui._runtime &&
              ui._runtime._modalKey === 'leaderboard' &&
              typeof ui.openLeaderboardModal === 'function'
            );

            if (ui) {
              if (
                reopenLeaderboardModal &&
                typeof ui.closeModal === 'function'
              ) {
                ui.closeModal();
              }

              ui.wording = window.WT_WORDING;

              if (
                window.WT_ContentAdapter &&
                ui._runtime &&
                Array.isArray(ui._runtime.contentItems)
              ) {
                window.WT_ContentAdapter.applyLocaleToItems(
                  ui._runtime.contentItems,
                  newLoc
                );
              }

              if (typeof ui.render === 'function') {
                ui.render();
              }

              try {
                const announcer = document.getElementById('locale-feedback');
                const wording = window.WT_WORDING || {};
                const localeW = wording.i18nToggle || {};
                const systemW = wording.system || {};
                const localeName = String(
                  localeW.languageNames?.[newLoc] || newLoc
                ).trim();
                const tpl = String(
                  systemW.localeChangedTemplate || 'Language changed to {locale}'
                ).trim();
                if (announcer && localeName) {
                  announcer.textContent = '';
                  window.requestAnimationFrame(() => {
                    try {
                      announcer.textContent = fillTemplateLocal(tpl, {
                        locale: localeName
                      });
                    } catch (_) {
                      /* silent */
                    }
                  });
                }
              } catch (_) {
                /* silent */
              }

              if (reopenLeaderboardModal) {
                ui.openLeaderboardModal();
              }
            }
          } catch (e) {
            try {
              Logger.warn('[main] locale-change handler failed', e);
            } catch (_) {
              /* silent */
            }
          }
        };

        if (window.__WT_ON_LOCALE_CHANGE__) {
          window.removeEventListener(
            'wt:locale-change',
            window.__WT_ON_LOCALE_CHANGE__
          );
        }
        window.__WT_ON_LOCALE_CHANGE__ = onLocaleChange;
        window.addEventListener('wt:locale-change', onLocaleChange);
      } catch (_) {
        /* silent */
      }

      // Boot optimization: if a premium code was saved by success.html, prompt instant activation.
      // Single source of truth: ui.js (promptAutoRedeemIfReady + howto.autoActivate* wording).
      if (ui && typeof ui.promptAutoRedeemIfReady === 'function') {
        try {
          ui.promptAutoRedeemIfReady();
        } catch (_) {
          /* silent */
        }
      }

      // Load content in parallel during boot
      loadJson(config.contentUrl)
        .then((content) => {
          const items = Array.isArray(content.items) ? content.items : [];

          if (!items.length) {
            if (ui && typeof ui.setContentLoading === 'function')
              ui.setContentLoading(false);
            showFatal(
              getSystemCopy(
                'fatalContentUnavailable',
                'Content not available. Please check your connection and reload.'
              )
            );
            return;
          }

          try {
            if (window.WT_ContentAdapter && window.WT_I18N) {
              window.WT_ContentAdapter.applyLocaleToItems(
                items,
                window.WT_I18N.getLocale()
              );
            }
          } catch (_) {
            /* silent */
          }
          ui.setContent(items);
          if (ui && typeof ui.setContentLoading === 'function')
            ui.setContentLoading(false);
          ui.render();

          window.__WT_APP_BOOTED__ = true;
          Logger.log(`Content loaded: ${items.length} items`);
        })
        .catch((error) => {
          Logger.error('Content load error:', error);
          showFatal(
            `${getSystemCopy('fatalDataLoadFailed', 'Unable to load game data. Please check your connection and refresh.')}${window.WT_CONFIG?.debug?.enabled ? ` Error: ${error.message}` : ''}`
          );
        });

      // Secret bonus (END chest) - orchestration lives in main.js (KISS)
      // ui.js dispatches: "wt-secret-bonus-requested"
      if (window.__WT_ON_OPEN_SUPPORT__) {
        document.removeEventListener(
          'wt-open-support',
          window.__WT_ON_OPEN_SUPPORT__
        );
      }
      window.__WT_ON_OPEN_SUPPORT__ = () => {
        try {
          ui.openSupportModal();
        } catch (_) {
          /* silent */
        }
      };
      document.addEventListener(
        'wt-open-support',
        window.__WT_ON_OPEN_SUPPORT__
      );

      if (window.__WT_ON_SECRET_BONUS_REQUESTED__) {
        window.removeEventListener(
          'wt-secret-bonus-requested',
          window.__WT_ON_SECRET_BONUS_REQUESTED__
        );
      }
      window.__WT_ON_SECRET_BONUS_REQUESTED__ = () => {
        try {
          // The UI owns gameplay screens; main.js just triggers the entry point.
          if (ui && typeof ui.startSecretBonusRun === 'function') {
            ui.startSecretBonusRun();
          }
        } catch (_) {
          // Never break gameplay for a hidden bonus hook
        }
      };
      window.addEventListener(
        'wt-secret-bonus-requested',
        window.__WT_ON_SECRET_BONUS_REQUESTED__
      );

      // Init email links
      if (
        window.WT_Email &&
        typeof window.WT_Email.initEmailLinks === 'function'
      ) {
        window.WT_Email.initEmailLinks();
      }

      // Init PWA
      if (typeof window.WT_PWA !== 'undefined' && window.WT_PWA.initPWA) {
        window.WT_PWA.initPWA(storage, ui);
      }

      Logger.log(
        `✅ ${config.identity.appName} v${config.version} started successfully`
      );
    } catch (error) {
      Logger.error('Startup error:', error);
      showFatal(
        `${getSystemCopy('fatalDataLoadFailed', 'Unable to load game data. Please check your connection and refresh.')}${window.WT_CONFIG?.debug?.enabled ? ` Error: ${error.message}` : ''}`
      );
    }
  }

  // ============================================
  // DOMContentLoaded
  // ============================================
  document.addEventListener('DOMContentLoaded', () => {
    const cfg = window.WT_CONFIG;
    const version = String(cfg?.version || '').trim();
    const env = String(cfg?.environment || '').trim();

    if (!version) Logger.warn('WT_CONFIG.version missing/empty');
    if (!env) Logger.warn('WT_CONFIG.environment missing/empty');

    const appName = String(cfg?.identity?.appName || 'Game').trim();

    if (version && env)
      Logger.log(`Initializing ${appName} v${version} (${env})`);
    else if (version) Logger.log(`Initializing ${appName} v${version}`);
    else Logger.log(`Initializing ${appName}`);

    if (!validatePrerequisites()) return;
    if (!validateModules()) return;

    startApplication();
  });

  // Init service worker immediately (before DOMContentLoaded)
  initServiceWorker();

  // ============================================
  // Debug tools
  // ============================================
  if (window.WT_CONFIG?.debug?.enabled) {
    window.WT_DEBUG = {
      Logger,
      config: window.WT_CONFIG,
      wording: window.WT_WORDING,
      get storage() {
        return window.storageManager;
      },
      resetStorage() {
        if (
          window.storageManager &&
          typeof window.storageManager.resetAll === 'function'
        ) {
          window.storageManager.resetAll();
        }

        location.reload();
      }
    };
  }
})();
