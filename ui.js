// ui.js v2.0 - Word Traps
// UI-only: rendering, accessibility, interactions (V2 RUN)

void function () {
  "use strict";


  const ENUMS = window.WT_ENUMS;
  if (!ENUMS || !ENUMS.UI_STATES || !ENUMS.GAME_MODES) {
    throw new Error("WT_ENUMS missing or invalid (UI_STATES / GAME_MODES)");
  }

  const STATES = ENUMS.UI_STATES;
  const MODES = ENUMS.GAME_MODES;

  // Module-scoped guard: prevents ReferenceError if any code path references `premium` without a local declaration.
  // Refreshed at the start of each render() from StorageManager (single source of truth).
  let premium = false;


  // ============================================
  // Helpers
  // ============================================
  function el(id) { return document.getElementById(id); }

  function firstRunFramingKey(cfg) {
    const c = (cfg && typeof cfg === "object") ? cfg : {};
    const b = String(c?.storage?.storageKey || "").trim();
    if (!b) return null;
    return `${b}:firstRunFramingSeen`;
  }

  function secretChestHintKey(cfg) {
    const c = (cfg && typeof cfg === "object") ? cfg : {};
    const b = String(c?.storage?.storageKey || "").trim();
    if (!b) return null;
    // Persisted once the user has successfully unlocked the chest at least once.
    return `${b}:secretChestHintSolved`;
  }

  function secretChestWelcomeKey(cfg) {
    const c = (cfg && typeof cfg === "object") ? cfg : {};
    const b = String(c?.storage?.storageKey || "").trim();
    if (!b) return null;
    // Persisted once the user has seen the â€œwelcomeâ€ modal for the secret chest (once per device).
    return `${b}:secretChestWelcomeShown`;
  }


  // Contract:
  // - UI uses localStorage ONLY for device-only flags:
  //   - firstRunFramingSeen (first-run framing modal shown once)
  //   - secretChestHintSolved (secret chest gesture solved once)
  //   - secretChestWelcomeShown (secret chest welcome modal shown once)
  // - All other persistence (runs, stats, economy, post-completion, etc.) is owned by StorageManager.

  // Decode HTML entities (for obfuscated emails like "bonjour&#64;...")
  function decodeHtmlEntities(str) {
    const s = String(str || "").trim();
    if (!s) return "";
    try {
      const el = document.createElement("textarea");
      el.innerHTML = s;
      return String(el.value || "").trim();
    } catch (_) {
      return "";
    }
  }


  function hasSolvedSecretChestHint(cfg) {
    const k = secretChestHintKey(cfg);
    if (!k) return false;
    try { return localStorage.getItem(k) === "1"; } catch (_) { return false; }
  }

  function markSolvedSecretChestHint(cfg) {
    const k = secretChestHintKey(cfg);
    if (!k) return;
    try { localStorage.setItem(k, "1"); } catch (_) { }
  }

  function hasShownSecretChestWelcome(cfg) {
    const k = secretChestWelcomeKey(cfg);
    if (!k) return false;
    try { return localStorage.getItem(k) === "1"; } catch (_) { return false; }
  }

  function markShownSecretChestWelcome(cfg) {
    const k = secretChestWelcomeKey(cfg);
    if (!k) return;
    try { localStorage.setItem(k, "1"); } catch (_) { }
  }



  function hasSeenFirstRunFraming(cfg) {
    const k = firstRunFramingKey(cfg);
    if (!k) return false;
    try { return localStorage.getItem(k) === "1"; } catch (_) { return false; }
  }

  function markSeenFirstRunFraming(cfg) {
    const k = firstRunFramingKey(cfg);
    if (!k) return;
    try { localStorage.setItem(k, "1"); } catch (_) { }
  }

  // Stats sharing prompt stage:
  // UI must NOT write localStorage directly (StorageManager owns persistence).
  function getStatsSharingPromptStage(storage) {
    if (!storage || typeof storage.getStatsSharingPromptStage !== "function") return -1;
    try { return storage.getStatsSharingPromptStage(); } catch (_) { return -1; }
  }

  function setStatsSharingPromptStage(storage, stageIndex) {
    if (!storage || typeof storage.setStatsSharingPromptStage !== "function") return;
    try { storage.setStatsSharingPromptStage(stageIndex); } catch (_) { }
  }

  function getStatsSharingPromptFlags(storage) {
    if (!storage || typeof storage.getStatsSharingPromptFlags !== "function") return 0;
    try { return storage.getStatsSharingPromptFlags(); } catch (_) { return 0; }
  }

  function setStatsSharingPromptFlags(storage, flags) {
    if (!storage || typeof storage.setStatsSharingPromptFlags !== "function") return;
    try { storage.setStatsSharingPromptFlags(flags); } catch (_) { }
  }

  function markStatsSharingPromptFlag(storage, flagBit) {
    if (!storage || typeof storage.markStatsSharingPromptFlag !== "function") return;
    try { storage.markStatsSharingPromptFlag(flagBit); } catch (_) { }
  }

  function getStatsSharingSnoozeUntilRunCompletes(storage) {
    if (!storage || typeof storage.getStatsSharingSnoozeUntilRunCompletes !== "function") return 0;
    try { return storage.getStatsSharingSnoozeUntilRunCompletes(); } catch (_) { return 0; }
  }

  function snoozeStatsSharingPromptNextEnd(storage) {
    if (!storage || typeof storage.snoozeStatsSharingPromptNextEnd !== "function") return;
    try { storage.snoozeStatsSharingPromptNextEnd(); } catch (_) { }
  }



  const escapeHtml = window.WT_UTILS.escapeHtml;

  function clampInt(n, min, max) {
    const x = Number(n);
    if (!Number.isFinite(x)) return min;
    const v = Math.floor(x);
    return Math.min(max, Math.max(min, v));
  }

  function formatCents(cents, currency) {
    const n = Number(cents);
    if (!Number.isFinite(n)) return "";
    const dollars = (n / 100).toFixed(2);
    if (currency === "USD") return `$${dollars}`;
    return `${dollars} ${currency}`;
  }

  function mmss(ms) {
    const t = Math.max(0, Math.floor(Number(ms || 0) / 1000));
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function isOnline() {
    return navigator.onLine !== false;
  }

  function fillTemplate(str, vars) {
    let out = String(str || "");
    const v = (vars && typeof vars === "object") ? vars : {};
    for (const k in v) {
      out = out.replaceAll(`{${k}}`, String(v[k]));
    }
    return out;
  }

  function extractTermsFromItem(item) {
    const it = item && typeof item === "object" ? item : {};
    return {
      termFr: String(it.termFr || "").trim(),
      termEn: String(it.termEn || "").trim(),
      correctAnswer: (it.correctAnswer === true || it.correctAnswer === false) ? it.correctAnswer : null,
      explanationShort: String(it.explanationShort || it.explanation || "").trim()
    };
  }

  function formatExplanationForDisplay(raw, cfg, termFr, termEn) {
    const s = String(raw || "").trim();
    if (!s) return "";

    const ed = (cfg?.ui?.explanationDisplay && typeof cfg.ui.explanationDisplay === "object")
      ? cfg.ui.explanationDisplay
      : null;

    if (!ed || ed.enabled !== true) return escapeHtml(s);

    const maxLines = clampInt(Number(ed.maxLines), 1, 4);
    const src = String(ed.splitRegex || "").trim();
    if (!src) return escapeHtml(s);

    let r = null;
    try { r = new RegExp(src); } catch (_) { r = null; }
    if (!r) return escapeHtml(s);

    const lines = [];
    let rest = s;

    while (lines.length < (maxLines - 1)) {
      r.lastIndex = 0;
      const m = r.exec(rest);
      if (!m || typeof m.index !== "number") break;

      const cutAt = m.index + String(m[0] || "").length;
      const a = rest.slice(0, cutAt).trim();
      const b = rest.slice(cutAt).trim();

      if (!a || !b) break;

      lines.push(a);
      rest = b;
    }

    lines.push(rest);

    let out = lines.map(x => escapeHtml(String(x || "").trim())).join("<br>");

    const fr = String(termFr || "").trim();
    const en = String(termEn || "").trim();

    if (fr) {
      const frEsc = escapeHtml(fr);
      out = out.replaceAll(`${frEsc} (FR)`, `<strong>${frEsc} (FR)</strong>`);
    }
    if (en) {
      const enEsc = escapeHtml(en);
      out = out.replaceAll(`${enEsc} (EN)`, `<strong>${enEsc} (EN)</strong>`);
    }

    return out;
  }


  function renderBrandingRow(config, showText, forceNoLink) {
    const logoUrl = String(config?.identity?.uiLogoUrl || "").trim();
    const appName = String(config?.identity?.appName || "").trim();

    if (!logoUrl) return "";

    const modifier = showText ? "" : " wt-branding--logo-only";
    const nameHtml = showText
      ? `<span class="wt-branding-name">${escapeHtml(appName)}</span>`
      : "";

    const inner = `
      <img src="${escapeHtml(logoUrl)}" alt="" class="wt-branding-logo" />
      ${nameHtml}
    `;

    // Option A (product): branding always routes to LANDING (internal), never to an external URL.
    // Uses existing delegated action: data-action="go-home".
    if (forceNoLink !== true) {
      return `
        <a class="wt-branding${modifier}" href="#home" data-action="go-home" aria-label="${escapeHtml(appName)}">
          ${inner}
        </a>
      `;
    }

    return `
      <div class="wt-branding${modifier}">
        ${inner}
      </div>
    `;
  }




  // Mobile-first: tap-to-continue only on touch-like devices (coarse pointer)
  function shouldTapToContinue() {
    try {
      return window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    } catch (_) {
      return false;
    }
  }

  // ============================================
  // Toast
  // ============================================

  let toastShowTimer = null;
  let toastHideTimer = null;

  // Gameplay overlay scheduling (centered, like chance-lost / run-start)
  // Dedicated timer to avoid collisions with normal toasts.
  let gameplayOverlayShowTimer = null;

  function applyToastVariantClass(node, variant) {
    if (!node) return;
    node.classList.remove("wt-toast--info", "wt-toast--success", "wt-toast--danger");

    const v = String(variant || "").trim();
    if (v === "info") node.classList.add("wt-toast--info");
    else if (v === "success") node.classList.add("wt-toast--success");
    else if (v === "danger") node.classList.add("wt-toast--danger");
  }

  function showToast(message, opts) {
    const node = el("toast");
    if (!node) return;

    const text = String(message || "").trim();
    if (!text) return;

    // Nettoie un Ã©ventuel "show" en attente pour Ã©viter des toasts fantÃ´mes
    if (toastShowTimer) clearTimeout(toastShowTimer);
    toastShowTimer = null;

    const o = (opts && typeof opts === "object") ? opts : null;
    const durationMs = o ? Number(o.durationMs) : NaN;

    // No silent fallback: if duration isn't valid, we don't show a toast.
    if (!Number.isFinite(durationMs) || durationMs < 600 || durationMs > 4000) return;

    node.textContent = text;
    applyToastVariantClass(node, o ? o.variant : "");

    // Contract: CSS owns visibility via .wt-toast--visible
    node.classList.add("wt-toast--visible");

    if (toastHideTimer) clearTimeout(toastHideTimer);
    toastHideTimer = setTimeout(() => {
      node.classList.remove("wt-toast--visible");
    }, Math.floor(durationMs));
  }

  function scheduleToast(message, opts) {
    const o = (opts && typeof opts === "object") ? opts : null;
    const delayMs = o ? Number(o.delayMs) : NaN;
    const durationMs = o ? Number(o.durationMs) : NaN;
    const variant = o ? o.variant : "";

    // No silent fallback: if timing isn't valid, we don't schedule a toast.
    if (!Number.isFinite(delayMs) || delayMs < 0 || delayMs > 2000) return;
    if (!Number.isFinite(durationMs) || durationMs < 600 || durationMs > 4000) return;

    if (toastShowTimer) clearTimeout(toastShowTimer);
    toastShowTimer = setTimeout(() => {
      toastShowTimer = null; // timer consommÃ©
      showToast(message, { durationMs: Math.floor(durationMs), variant });
    }, Math.floor(delayMs));
  }

  // Same timing contract as toasts, but rendered as centered overlay for gameplay interactions.
  function scheduleGameplayOverlay(message, opts) {
    const o = (opts && typeof opts === "object") ? opts : null;
    const delayMs = o ? Number(o.delayMs) : NaN;
    const durationMs = o ? Number(o.durationMs) : NaN;
    const variant = o ? o.variant : "";

    // No silent fallback: if timing isn't valid, we don't schedule.
    if (!Number.isFinite(delayMs) || delayMs < 0 || delayMs > 2000) return;
    if (!Number.isFinite(durationMs) || durationMs < 600 || durationMs > 4000) return;

    if (gameplayOverlayShowTimer) clearTimeout(gameplayOverlayShowTimer);
    gameplayOverlayShowTimer = setTimeout(() => {
      gameplayOverlayShowTimer = null; // timer consommÃ©
      showGameplayOverlay(message, { durationMs: Math.floor(durationMs), variant });
    }, Math.floor(delayMs));
  }

  function cancelScheduledToast() {
    if (toastShowTimer) clearTimeout(toastShowTimer);
    toastShowTimer = null;

    if (gameplayOverlayShowTimer) clearTimeout(gameplayOverlayShowTimer);
    gameplayOverlayShowTimer = null;

    // Prevent any overlay from surviving a state change.
    hideGameplayOverlay();
    hideRunStartOverlay();
    hideChanceLostOverlay();
  }

  function getToastTiming(cfg, timingKey) {
    const c = (cfg && typeof cfg === "object") ? cfg : {};
    // Single source of truth for toast timing: WT_CONFIG.ui.toast (schema plat)
    const toastRoot = (c.ui && typeof c.ui === "object" && c.ui.toast && typeof c.ui.toast === "object")
      ? c.ui.toast
      : null;

    if (!toastRoot || typeof toastRoot !== "object") return null;

    const key = String(timingKey || "").trim();

    // Default bucket is mandatory
    const def = (toastRoot.default && typeof toastRoot.default === "object") ? toastRoot.default : null;
    if (!def) return null;

    const t = key
      ? ((toastRoot[key] && typeof toastRoot[key] === "object") ? toastRoot[key] : null)
      : def;

    // No silent fallback: if a timingKey is requested but missing, do nothing.
    if (key && !t) return null;

    const delayMs = Number(t.delayMs);
    const durationMs = Number(t.durationMs);

    if (!Number.isFinite(delayMs) || delayMs < 0 || delayMs > 2000) return null;
    if (!Number.isFinite(durationMs) || durationMs < 600 || durationMs > 4000) return null;

    return { delayMs: Math.floor(delayMs), durationMs: Math.floor(durationMs) };
  }

  function toastNow(cfg, message, opts) {
    const o = (opts && typeof opts === "object") ? opts : null;
    const timingKey = o ? o.timingKey : "";
    const variant = o ? o.variant : "";

    const timing = getToastTiming(cfg, timingKey);
    if (!timing) return;
    showToast(message, { durationMs: timing.durationMs, variant });
  }

  // Chance-loss toast (RUN / PRACTICE / BONUS)


  // Start-of-run overlay (education)
  // Copy contract: WT_WORDING.ui.startRunChancesOverlay must be provided.
  // Template recommended: "{maxChances} chances"
  function getRunStartOverlayText(uiWording, maxChances) {
    const tpl = String(uiWording?.startRunChancesOverlay || "").trim();
    if (!tpl) return "";

    const mc = Number(maxChances);
    if (!Number.isFinite(mc)) return "";

    // Backward compatible: if tpl has no placeholders, use as-is
    if (!tpl.includes("{maxChances}")) return tpl;

    return fillTemplate(tpl, { maxChances: clampInt(mc, 1, 99) });
  }

  // â”€â”€ Text helpers: chance-lost overlays (no "-1" text) â”€â”€â”€â”€â”€â”€
  // Contract:
  // - WT_WORDING.ui.lastChanceOverlay: string
  // - WT_WORDING.ui.gameOverOverlay: string
  function getChanceStateOverlayText(uiWording, chancesLeft) {
    const left = clampInt(chancesLeft, 0, 99);

    if (left === 0) return String(uiWording?.gameOverOverlay || "").trim();

    // Product rule: no "Last chance" overlay (too punishing). HUD deltas are enough.
    if (left === 1) return "";

    return "";
  }



  // Overlay timers (separate to avoid cross-cancel between start-of-run and -1 chance)
  let chanceLostOverlayTimer = null;
  let runStartOverlayTimer = null;

  // Chance-lost: ignore taps while visible (recommended)
  let chanceLostOverlayBlocker = null;

  // Start overlay: block interactions + dismiss without click-through
  // Root cause: pointerdown can hide the overlay, then the subsequent click lands on the underlying element.
  let runStartOverlayConsumeNextClick = false;
  let runStartOverlayPointerBlocker = null;
  let runStartOverlayClickBlocker = null;
  let runStartOverlayKeyBlocker = null;

  // Gameplay overlay (centered, for micro-interactions during PLAYING)
  // Separate element + timer so it never overwrites chance-lost / run-start overlays.
  let gameplayOverlayTimer = null;
  let gameplayOverlayTapHandler = null;


  function isOverlayVisible(id) {
    const el = document.getElementById(String(id || ""));
    return !!(el && el.classList && el.classList.contains("wt-chance-overlay--visible"));
  }

  function hideChanceLostOverlay() {
    if (chanceLostOverlayTimer) {
      clearTimeout(chanceLostOverlayTimer);
      chanceLostOverlayTimer = null;
    }

    if (chanceLostOverlayBlocker) {
      document.removeEventListener("pointerdown", chanceLostOverlayBlocker, true);
      chanceLostOverlayBlocker = null;
    }

    const overlay = document.getElementById("wt-chance-lost-overlay");
    if (overlay) {
      overlay.classList.remove("wt-chance-overlay--visible");
      overlay.setAttribute("aria-hidden", "true");
    }
  }

  function hideRunStartOverlay() {
    if (runStartOverlayTimer) {
      clearTimeout(runStartOverlayTimer);
      runStartOverlayTimer = null;
    }

    // Remove run-start blockers (anti click-through)
    if (runStartOverlayPointerBlocker) {
      document.removeEventListener("pointerdown", runStartOverlayPointerBlocker, true);
      runStartOverlayPointerBlocker = null;
    }
    if (runStartOverlayClickBlocker) {
      document.removeEventListener("click", runStartOverlayClickBlocker, true);
      runStartOverlayClickBlocker = null;
    }
    if (runStartOverlayKeyBlocker) {
      document.removeEventListener("keydown", runStartOverlayKeyBlocker, true);
      runStartOverlayKeyBlocker = null;
    }
    runStartOverlayConsumeNextClick = false;

    const overlay = document.getElementById("wt-run-start-overlay");
    if (overlay) {
      overlay.classList.remove("wt-chance-overlay--visible");
      overlay.setAttribute("aria-hidden", "true");
      overlay.removeAttribute("data-runstart-dismiss");
      overlay.removeAttribute("data-runstart-mode");
    }

    // Unlock underlying UI if we locked it for run-start overlay
    const app = document.getElementById("app");
    if (app && app.getAttribute("data-wt-runstart-lock") === "1") {
      const prevPe = app.getAttribute("data-wt-runstart-prev-pe");
      const prevInert = app.getAttribute("data-wt-runstart-prev-inert") === "1";

      app.style.pointerEvents = (prevPe == null) ? "" : prevPe;
      try { app.inert = prevInert === true; } catch (_) { /* silent */ }

      app.removeAttribute("data-wt-runstart-lock");
      app.removeAttribute("data-wt-runstart-prev-pe");
      app.removeAttribute("data-wt-runstart-prev-inert");
    }
  }




  function showGameplayOverlay(message, opts) {
    const o = (opts && typeof opts === "object") ? opts : null;
    const durationMs = o ? Number(o.durationMs) : NaN;
    const variant = o ? String(o.variant || "").trim() : "";

    // Validation bounds: same contract as WT_CONFIG.ui.toast.*.durationMs
    if (!Number.isFinite(durationMs) || durationMs < 600 || durationMs > 4000) return;

    const msg = String(message || "").trim();
    if (!msg) return;

    // Priority: do not override chance-lost overlay
    if (isOverlayVisible("wt-chance-lost-overlay")) return;

    // Deconflict: do not stack a centered overlay on top of a visible toast (ex: "+1 score")
    const toast = el("toast");
    if (toast && toast.classList.contains("wt-toast--visible")) return;

    hideRunStartOverlay();


    if (gameplayOverlayTimer) {
      clearTimeout(gameplayOverlayTimer);
      gameplayOverlayTimer = null;
    }

    if (gameplayOverlayTapHandler) {
      document.removeEventListener("pointerdown", gameplayOverlayTapHandler, true);
      gameplayOverlayTapHandler = null;
    }

    let overlay = document.getElementById("wt-gameplay-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "wt-gameplay-overlay";
      overlay.className = "wt-chance-overlay";
      overlay.setAttribute("role", "alert");
      overlay.setAttribute("aria-live", "polite");
      document.body.appendChild(overlay);
    }

    overlay.classList.remove(
      "wt-chance-overlay--info",
      "wt-chance-overlay--danger",
      "wt-chance-overlay--success",
      "wt-chance-overlay--dismissible",
      "wt-chance-overlay--blocking"
    );
    if (variant === "info") overlay.classList.add("wt-chance-overlay--info");
    else if (variant === "danger") overlay.classList.add("wt-chance-overlay--danger");
    else if (variant === "success") overlay.classList.add("wt-chance-overlay--success");

    // Gameplay overlays: block taps by default (avoid â€œlooks modal but click-throughâ€)
    overlay.classList.add("wt-chance-overlay--blocking");

    overlay.innerHTML = `
      <div class="wt-chance-overlay__content">
        <span class="wt-chance-overlay__text">
          <span>${escapeHtml(msg)}</span>
        </span>
      </div>
    `;

    // Tap-to-dismiss (faster): only if enabled in config (now allowed for all variants, including danger)
    const dismissEnabled = (window.WT_CONFIG && window.WT_CONFIG.ui && window.WT_CONFIG.ui.toastDismissOnTap === true);
    const dismissAllowed = dismissEnabled;
    if (dismissAllowed) {
      overlay.classList.add("wt-chance-overlay--dismissible");
      gameplayOverlayTapHandler = (e) => {
        const el = document.getElementById("wt-gameplay-overlay");
        if (!el) return;
        if (!el.classList.contains("wt-chance-overlay--visible")) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        hideGameplayOverlay();
      };
      document.addEventListener("pointerdown", gameplayOverlayTapHandler, true);
    }


    overlay.classList.add("wt-chance-overlay--visible");
    overlay.setAttribute("aria-hidden", "false");

    gameplayOverlayTimer = setTimeout(() => {
      hideGameplayOverlay();
    }, Math.floor(durationMs));
  }



  function hideGameplayOverlay() {
    if (gameplayOverlayTimer) {
      clearTimeout(gameplayOverlayTimer);
      gameplayOverlayTimer = null;
    }

    if (gameplayOverlayTapHandler) {
      document.removeEventListener("pointerdown", gameplayOverlayTapHandler, true);
      gameplayOverlayTapHandler = null;
    }

    const overlay = document.getElementById("wt-gameplay-overlay");
    if (overlay) {
      overlay.classList.remove(
        "wt-chance-overlay--visible",
        "wt-chance-overlay--dismissible",
        "wt-chance-overlay--blocking"
      );
      overlay.setAttribute("aria-hidden", "true");
    }
  }


  // Backward-compatible alias:
  // Some call sites still call showChanceLostToast(...).
  // KISS: route to the overlay system (single visual treatment).
  function showChanceLostToast(cfg, wording, chancesLeft) {
    showChanceLostOverlay(cfg, wording, chancesLeft);
  }

  function showChanceLostOverlay(cfg, wording, chancesLeft) {
    // Config gate (no fallback): WT_CONFIG.ui.chanceLostOverlayMs must be valid.
    const baseDurationMs = Number(cfg?.ui?.chanceLostOverlayMs);
    if (!Number.isFinite(baseDurationMs) || baseDurationMs < 200 || baseDurationMs > 3000) return;

    const left = clampInt(chancesLeft, 0, 99);

    // Product rule: no "-1 chance" overlay. Only show state overlays (Last chance / Game over).
    if (left > 1) return;

    const msg = getChanceStateOverlayText(wording?.ui, left);
    if (!msg) return;

    // Overlay priority (PLAYING)
    hideRunStartOverlay();
    hideGameplayOverlay();

    // Duration: allow a little extra on game over using gameplayPulseMs (no fallback).
    let durationMs = baseDurationMs;
    if (left === 0) {
      const extraMs = Number(cfg?.ui?.gameplayPulseMs);
      if (Number.isFinite(extraMs) && extraMs >= 0 && extraMs <= 2000) {
        durationMs = baseDurationMs + Math.floor(extraMs);
      }
    }
    if (durationMs > 3000) durationMs = 3000;

    if (chanceLostOverlayTimer) {
      clearTimeout(chanceLostOverlayTimer);
      chanceLostOverlayTimer = null;
    }

    if (chanceLostOverlayBlocker) {
      document.removeEventListener("pointerdown", chanceLostOverlayBlocker, true);
      chanceLostOverlayBlocker = null;
    }

    let overlay = document.getElementById("wt-chance-lost-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "wt-chance-lost-overlay";
      overlay.className = "wt-chance-overlay";
      overlay.setAttribute("role", "alert");
      overlay.setAttribute("aria-live", "polite");
      document.body.appendChild(overlay);
    }

    overlay.classList.remove("wt-chance-overlay--info");
    overlay.classList.add("wt-chance-overlay--danger");

    overlay.innerHTML = `
      <div class="wt-chance-overlay__content">
        <span class="wt-chance-overlay__text">
          <span>${escapeHtml(msg)}</span>
        </span>
      </div>
    `;
    overlay.classList.add("wt-chance-overlay--visible");
    overlay.setAttribute("aria-hidden", "false");

    // Block click-through always; dismiss on tap if enabled
    const dismissEnabled = (window.WT_CONFIG && window.WT_CONFIG.ui && window.WT_CONFIG.ui.toastDismissOnTap === true);
    if (dismissEnabled) {
      overlay.classList.add("wt-chance-overlay--dismissible");
    } else {
      overlay.classList.remove("wt-chance-overlay--dismissible");
    }

    chanceLostOverlayBlocker = (e) => {
      const o = document.getElementById("wt-chance-lost-overlay");
      if (!o) return;
      if (!o.classList.contains("wt-chance-overlay--visible")) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (dismissEnabled) hideChanceLostOverlay();
    };
    document.addEventListener("pointerdown", chanceLostOverlayBlocker, true);

    chanceLostOverlayTimer = setTimeout(() => {
      hideChanceLostOverlay();
    }, Math.floor(durationMs));
  }



  function getRunStartTypeText(uiWording, runType) {
    const rt = String(runType || "").trim();
    if (!rt) return "";

    if (rt === "UNLIMITED") return String(uiWording?.startRunTypeUnlimited || "").trim();
    if (rt === "LAST_FREE") return String(uiWording?.startRunTypeLastFree || "").trim();
    if (rt === "FREE") return String(uiWording?.startRunTypeFree || "").trim();
    if (rt === "PRACTICE") return String(uiWording?.startRunTypePractice || "").trim();
    return "";
  }


  function showRunStartOverlay(cfg, wording, game, runType, extra) {
    // Product rule: no start-of-run overlay for UNLIMITED runs
    if (String(runType || "").trim() === "UNLIMITED") return;

    // Do not override chance-lost overlay
    if (isOverlayVisible("wt-chance-lost-overlay")) return;

    // Config gate (no fallback): feature enabled only if config is valid (even though we don't auto-hide).
    const runStartMs = Number(cfg?.ui?.runStartOverlayMs);
    if (!Number.isFinite(runStartMs) || runStartMs < 200 || runStartMs > 3000) return;

    hideGameplayOverlay();

    const gs = (game && typeof game.getState === "function") ? (game.getState() || {}) : {};
    const maxChances = Number(gs.maxChances);

    // PRACTICE has no chances (maxChances === null) → use dedicated wording
    const isPractice = (String(runType || "").trim() === "PRACTICE");
    const msg = isPractice
      ? String(wording?.practice?.startRunChancesOverlayPractice || "").trim()
      : (Number.isFinite(maxChances) ? getRunStartOverlayText(wording?.ui, clampInt(maxChances, 1, 99)) : "");
    if (!msg) return;

    // Defensive cleanup (legacy safety): run-start must never auto-hide.
    if (runStartOverlayTimer) {
      clearTimeout(runStartOverlayTimer);
      runStartOverlayTimer = null;
    }

    if (runStartOverlayPointerBlocker) {
      document.removeEventListener("pointerdown", runStartOverlayPointerBlocker, true);
      runStartOverlayPointerBlocker = null;
    }
    if (runStartOverlayClickBlocker) {
      document.removeEventListener("click", runStartOverlayClickBlocker, true);
      runStartOverlayClickBlocker = null;
    }
    if (runStartOverlayKeyBlocker) {
      document.removeEventListener("keydown", runStartOverlayKeyBlocker, true);
      runStartOverlayKeyBlocker = null;
    }
    runStartOverlayConsumeNextClick = false;

    let overlay = document.getElementById("wt-run-start-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "wt-run-start-overlay";
      overlay.className = "wt-chance-overlay";
      overlay.setAttribute("role", "alert");
      overlay.setAttribute("aria-live", "polite");
      document.body.appendChild(overlay);
    }

    overlay.classList.remove("wt-chance-overlay--danger");
    overlay.classList.add("wt-chance-overlay--info");

    const rt = String(runType || "").trim();
    overlay.setAttribute("data-runstart-mode", rt);

    function dispatchRunStartDismissed() {
      const mode = String(overlay.getAttribute("data-runstart-mode") || "").trim();
      try {
        document.dispatchEvent(new CustomEvent("wt-runstart-dismissed", { detail: { mode } }));
      } catch (_) { /* silent */ }
    }

    const isBonus = (rt === "BONUS");
    const typeLine = isBonus ? "" : getRunStartTypeText(wording?.ui, rt);

    const bonusLine1 = String(wording?.secretBonus?.startOverlayLine1 || "").trim();
    const bonusLine2 = String(wording?.secretBonus?.startOverlayLine2 || "").trim();
    const bonusLine3 = String(wording?.secretBonus?.startOverlayLine3 || "").trim();
    const bonusLimitLine = String(extra?.bonusLimitLine || "").trim();
    const bonusLines = [bonusLine1, bonusLine2, bonusLine3, bonusLimitLine, msg].filter(Boolean);
    overlay.innerHTML = `
      <div class="wt-chance-overlay__content">
        <span class="wt-chance-overlay__text">
          ${isBonus
        ? bonusLines.map(l => `<span>${escapeHtml(l)}</span>`).join("<br>")
        : `
                ${typeLine ? `<span>${escapeHtml(typeLine)}</span><br>` : ``}
                <span>${escapeHtml(msg)}</span>
              `
      }
        </span>
      </div>
    `;

    overlay.classList.add("wt-chance-overlay--visible");
    overlay.setAttribute("aria-hidden", "false");

    // Hard lock underlying UI while run-start overlay is visible (prevents click/keyboard activation under it)
    const app = document.getElementById("app");
    if (app && app.getAttribute("data-wt-runstart-lock") !== "1") {
      app.setAttribute("data-wt-runstart-lock", "1");
      app.setAttribute("data-wt-runstart-prev-pe", String(app.style.pointerEvents || ""));
      try { app.setAttribute("data-wt-runstart-prev-inert", (app.inert === true) ? "1" : "0"); } catch (_) { app.setAttribute("data-wt-runstart-prev-inert", "0"); }

      app.style.pointerEvents = "none";
      try { app.inert = true; } catch (_) { /* silent */ }
    }

    // Run-start dismiss contract
    overlay.setAttribute("data-runstart-dismiss", "1");

    // 1) pointerdown: block immediately and arm "consumeNextClick"
    runStartOverlayPointerBlocker = (e) => {
      const o = document.getElementById("wt-run-start-overlay");
      if (!o) return;
      if (!o.classList.contains("wt-chance-overlay--visible")) return;
      if (o.getAttribute("data-runstart-dismiss") !== "1") return;

      runStartOverlayConsumeNextClick = true;
      e.preventDefault();
      e.stopImmediatePropagation();
    };

    // 2) click: always consume (even if overlay would be hidden before click fires)
    runStartOverlayClickBlocker = (e) => {
      const o = document.getElementById("wt-run-start-overlay");

      // If pointerdown armed the flag, we must consume this click no matter what.
      if (runStartOverlayConsumeNextClick === true) {
        runStartOverlayConsumeNextClick = false;
        e.preventDefault();
        e.stopImmediatePropagation();
        dispatchRunStartDismissed();
        hideRunStartOverlay();
        return;
      }

      if (!o) return;
      if (!o.classList.contains("wt-chance-overlay--visible")) return;
      if (o.getAttribute("data-runstart-dismiss") !== "1") return;

      e.preventDefault();
      e.stopImmediatePropagation();
      dispatchRunStartDismissed();
      hideRunStartOverlay();
    };

    // 3) keyboard: Enter/Space dismiss, without activating underlying controls
    runStartOverlayKeyBlocker = (e) => {
      const o = document.getElementById("wt-run-start-overlay");
      if (!o) return;
      if (!o.classList.contains("wt-chance-overlay--visible")) return;
      if (o.getAttribute("data-runstart-dismiss") !== "1") return;

      const k = String(e.key || "").toLowerCase();
      if (k !== "enter" && k !== " " && k !== "spacebar") return;

      runStartOverlayConsumeNextClick = false;
      e.preventDefault();
      e.stopImmediatePropagation();
      dispatchRunStartDismissed();
      hideRunStartOverlay();
    };

    document.addEventListener("pointerdown", runStartOverlayPointerBlocker, true);
    document.addEventListener("click", runStartOverlayClickBlocker, true);
    document.addEventListener("keydown", runStartOverlayKeyBlocker, true);
  }



  // ============================================
  // UI
  // ============================================
  function UI({ storage, game, config, wording }) {
    this.storage = storage;
    this.game = game;
    this.config = config || {};
    this.wording = wording || {};
    this.state = STATES.LANDING;

    this.appEl = el("app");
    this.modalEl = el("modal");
    this.modalContentEl = el("modal-content");

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

      // BONUS chip pulse timer (UI-only)
      bonusChipPulseTimerId: null,


      // micro-pics (run-only; UI-only)
      microPics: {
        correctStreak: 0,
        maxCorrectStreak: 0,

        // #3/#4 runtime flags (UI-only)
        justRecoveredFromMistake: false,
        maxCorrectStreakDisplayed: 0,

        flowTierShown: 0,
        survivalShown: false,
        twoChancesShown: false,
        lastToastAtCount: -999,
        lastDangerAtCount: -999,
        lastDangerAtMs: 0,
        prevChancesLeft: null,

        // Per-run memory: if a tier was reached before in this run, show "...Again" copy.
        tierShownOnce: {
          start: false,
          building: false,
          strong: false,
          elite: false,
          legendary: false
        }
      },






      // support modal (runtime cache)
      supportEmail: "",
      supportSubjectPrefix: "",


      // current run
      runItemIds: [],
      runMistakeIds: [],
      runMode: "RUN", // RUN | PRACTICE
      lastAnswer: null,
      feedbackPending: false,
      feedbackReveal: true,
      feedbackRevealTimerId: null,
      frozenItem: null,
      finishAfterFeedback: false,

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

      // Secret chest (END screen): tap x3 window + one-shot poetic hint
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

        xSide: "left",     // "left" | "right" (placeholder for later; no gameplay coupling)
        itemKey: "",       // to detect new item and reset
        running: false,

        // UI-only micro-juice flags
        wasInWarning: false
      }


    };


    // Navigation state (stable, not runtime)
    this._nav = {
      paywallFromState: null,
      landingVariant: null
    };



    this._bindEvents();
  }



  UI.prototype._bindEvents = function () {
    const self = this;

    if (!this.appEl) return;


    function dispatchAction(action, event) {
      switch (action) {
        case "continue":
          self.continueAfterFeedback();
          break;

        case "how-to-play":
        case "open-howto":
          self.openHowToModal();
          break;

        case "close-modal":
          self.closeModal();
          break;

        case "enter-secret-bonus":
          self.closeModal();
          if (self._runtime) self._runtime.secretBonusPending = false;
          if (typeof self.startSecretBonusRun === "function") self.startSecretBonusRun();
          break;

        case "start-secret-bonus":
          self.closeModal();
          if (self._runtime) self._runtime.secretBonusPending = false;
          if (typeof self.startSecretBonusRun === "function") self.startSecretBonusRun();
          break;

        case "start-run": {
          const ready = !!(self._runtime && Number(self._runtime.contentTotal) > 0);
          if (!ready) {
            const msg = String(self.wording?.ui?.contentLoadingToast || "").trim();
            if (msg) toastNow(self.config, msg, { variant: "info" });
            break;
          }

          // First-run framing: intercept ONLY from LANDING (never from modal replay).
          if (self.state === STATES.LANDING && self._canShowFirstRunFraming()) {
            self._openFirstRunFraming();
            break;
          }

          // Funnel counter: only when starting from LANDING
          if (self.state === STATES.LANDING) {
            if (self.storage && typeof self.storage.markLandingPlayClicked === "function") {
              self.storage.markLandingPlayClicked();
            }
          }

          // CTA inside modal: close first to avoid overlay sticking.
          self.closeModal();
          self.startRun(false);
          break;
        }



        case "start-practice":
          self.closeModal();
          self.startRun(true);
          break;


        case "answer-true": {
          // Option C: micro-feedback on the tapped answer (fail-closed: requires config)
          try {
            const pulseMs = Number(self?.config?.ui?.gameplayPulseMs);
            const btn = event && event.target && event.target.closest ? event.target.closest(".wt-choice") : null;


            const cur = (self.game && typeof self.game.getCurrent === "function") ? self.game.getCurrent() : null;
            const correct = (cur && (cur.correctAnswer === true || cur.correctAnswer === false)) ? (cur.correctAnswer === true) : null;

            if (btn && Number.isFinite(pulseMs) && pulseMs > 0 && pulseMs <= 2000 && correct != null) {
              btn.classList.remove("wt-choice--flash");
              btn.style.animationDuration = `${Math.floor(pulseMs)}ms`;
              btn.classList.add("wt-choice--flash");

              window.setTimeout(() => {
                btn.classList.remove("wt-choice--flash");
                btn.style.animationDuration = "";
              }, Math.floor(pulseMs));
            }
          } catch (_) { }

          // BONUS: stop fall tick to prevent race (tick could fail item before rAF fires)
          try { if (self._runtime?.secretBonusFall?.running) self._secretBonusFallStop(); } catch (_) { }

          // Let the browser paint the flash before we swap to the feedback screen.
          window.requestAnimationFrame(() => self.answer(true));
          break;
        }

        case "answer-false": {
          // Option C: micro-feedback on the tapped answer (fail-closed: requires config)
          try {
            const pulseMs = Number(self?.config?.ui?.gameplayPulseMs);
            const btn = event && event.target && event.target.closest ? event.target.closest(".wt-choice") : null;

            const cur = (self.game && typeof self.game.getCurrent === "function") ? self.game.getCurrent() : null;
            const correct = (cur && (cur.correctAnswer === true || cur.correctAnswer === false)) ? (cur.correctAnswer === false) : null;

            if (btn && Number.isFinite(pulseMs) && pulseMs > 0 && pulseMs <= 2000 && correct != null) {
              btn.classList.remove("wt-choice--flash");
              btn.style.animationDuration = `${Math.floor(pulseMs)}ms`;
              btn.classList.add("wt-choice--flash");

              window.setTimeout(() => {
                btn.classList.remove("wt-choice--flash");
                btn.style.animationDuration = "";
              }, Math.floor(pulseMs));
            }
          } catch (_) { }

          // BONUS: stop fall tick to prevent race (tick could fail item before rAF fires)
          try { if (self._runtime?.secretBonusFall?.running) self._secretBonusFallStop(); } catch (_) { }

          // Let the browser paint the flash before we swap to the feedback screen.
          window.requestAnimationFrame(() => self.answer(false));
          break;
        }



        case "play-again":
          self.startRun(false);
          break;

        case "open-paywall":
          // Hard capture origin for "Not now" routing
          if (self._nav) self._nav.paywallFromState = self.state;

          // If opened from a modal (e.g., How to play), close it first
          // to prevent backdrop/inert/focus-trap from blocking PAYWALL.
          self.closeModal();

          self.setState(STATES.PAYWALL);
          break;


        case "checkout-early":
          self.checkout("EARLY");
          break;

        case "checkout-standard":
          self.checkout("STANDARD");
          break;

        case "redeem-code":
          // If launched from the "How to play" modal, close it first
          // to prevent modal stacking/backdrop issues.
          self.closeModal();
          self.openRedeemModal();
          break;

        case "confirm-redeem":
          self._confirmRedeemCode();
          break;

        case "auto-redeem-now":
          self._redeemVanityCodeNow();
          break;

        case "auto-redeem-later":
          self.closeModal();
          break;

        case "copy-share":
          self.copyShareText();
          break;

        case "send-share-email":
          self.sendShareViaEmail();
          break;

        case "toggle-mistakes-only":
          self.toggleMistakesOnly();
          break;

        case "open-support":
          self.openSupportModal();
          break;

        case "send-stats-email":
          self.sendStatsViaEmail();
          break;

        case "snooze-stats":
          try {
            const pendingBit = self._runtime ? Number(self._runtime._statsSharingLastPromptFlagBit) : 0;
            if (Number.isFinite(pendingBit) && pendingBit > 0) {
              const cur = getStatsSharingPromptFlags(self.storage);
              setStatsSharingPromptFlags(self.storage, (cur & ~Math.floor(pendingBit)));
            }
          } catch (_) { /* silent */ }

          snoozeStatsSharingPromptNextEnd(self.storage);
          self.closeModal();
          break;


        case "open-waitlist":
          self.openWaitlistModal();
          break;

        case "send-waitlist-email":
          self.sendWaitlistViaEmail();
          break;


        case "copy-stats":
          self.copyStatsToClipboard();
          break;

        case "copy-support-email":
          self.copySupportEmail();
          break;

        case "open-support-email":
          self.openSupportEmailApp();
          break;

        case "install-app":
          self.promptInstall();
          break;

        case "dismiss-update":
          self.dismissUpdateToast();
          break;

        case "dismiss-house-ad": // legacy alias
        case "remind-house-ad":
          self.remindHouseAdLater();
          break;

        case "open-house-ad":
          self.openHouseAd();
          break;



        case "back":
        case "go-home": {
          if (self.state === STATES.PLAYING) {
            const msg = String(self.wording?.system?.confirmLeaveRun || "").trim();
            if (msg && !confirm(msg)) return;
          }

          self.closeModal();

          // Clean up accidental-close guard if leaving mid-run
          if (self._beforeUnloadHandler) {
            window.removeEventListener("beforeunload", self._beforeUnloadHandler);
            self._beforeUnloadHandler = null;
          }

          if (self.state === STATES.PAYWALL) {
            if (self._nav) self._nav.landingVariant = "POST_PAYWALL";
            self.setState(STATES.LANDING);
            break;
          }

          self.setState(STATES.LANDING);
          break;

        }




        default:
          break;
      }
    }

    if (this.modalEl) {
      this.modalEl.addEventListener("click", (e) => {
        const t = e.target;
        if (!t) return;

        // Backdrop click: close modal even if overlay has no data-action
        if (t === self.modalEl) {
          e.preventDefault();
          self.closeModal();
          return;
        }

        const btn = t.closest("[data-action]");
        if (!btn) return;

        const action = String(btn.getAttribute("data-action") || "").trim();
        if (!action) return;

        e.preventDefault();
        dispatchAction(action, e);

      });
    }


    const pointerEvt = ("PointerEvent" in window) ? "pointerup" : "click";

    // Main app event delegation (LANDING / PLAYING / END / PAYWALL)
    // Without this, buttons like data-action="start-run" never fire.
    if (!this._wtBoundAppActions) {
      this._wtBoundAppActions = true;

      const appActionHandler = (e) => {
        const t = e && e.target ? e.target : null;
        if (!t) return;

        // KISS: if user toggles the Share <details> near the bottom of the viewport,
        // keep the summary visible to avoid the â€œopens upwardâ€ feel caused by layout jump.
        const shareSummary = (t.closest && t.closest("summary.wt-share-toggle")) ? t.closest("summary.wt-share-toggle") : null;
        if (shareSummary) {
          // Let native <details>/<summary> toggle happen (no preventDefault).
          setTimeout(() => {
            try {
              shareSummary.scrollIntoView({ block: "nearest", inline: "nearest" });
            } catch (_) { /* ignore */ }
          }, 0);
          return;
        }

        // If a modal is open and the click is inside it, let modal handler own it
        if (self.modalEl && !self.modalEl.classList.contains("wt-hidden")) {
          try {
            if (self.modalEl.contains(t)) return;
          } catch (_) { /* ignore */ }
        }

        const btn = (t.closest && t.closest("[data-action]")) ? t.closest("[data-action]") : null;
        if (!btn) return;

        const action = String(btn.getAttribute("data-action") || "").trim();
        if (!action) return;
        e.preventDefault();
        dispatchAction(action);
      };

      this.appEl.addEventListener(pointerEvt, appActionHandler);

      // Mobile safety: also listen on "click" when primary is "pointerup".
      // Some iOS Safari + PWA combos silently swallow pointerup on buttons.
      // The dedup guard (same timestamp check) prevents double-fire.
      if (pointerEvt !== "click") {
        let lastHandledTs = 0;
        const origHandler = appActionHandler;
        const dedupHandler = (e) => {
          const now = e.timeStamp || Date.now();
          if (now - lastHandledTs < 400) return; // already handled by pointerup
          origHandler(e);
        };
        // Patch original to track timestamp
        this.appEl.removeEventListener(pointerEvt, appActionHandler);
        this.appEl.addEventListener(pointerEvt, (e) => {
          lastHandledTs = e.timeStamp || Date.now();
          appActionHandler(e);
        });
        this.appEl.addEventListener("click", dedupHandler);
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
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") self.closeModal();
      });


      // When run-start overlay is dismissed, BONUS must be allowed to start falling immediately.
      document.addEventListener("wt-runstart-dismissed", () => {
        try {
          // Let DOM update (overlay class removal) settle first
          window.setTimeout(() => {
            const modeNow = String(self._runtime?.runMode || "RUN").trim();
            if (self.state !== STATES.PLAYING) return;
            if (modeNow !== "BONUS") return;

            if (isOverlayVisible("wt-run-start-overlay")) return;
            self._secretBonusFallStartOrSync();
          }, 0);
        } catch (_) { /* silent */ }
      });

      // Browser Back => always go to Home (LANDING) for in-app history entries
      window.addEventListener("popstate", (e) => {
        const st = e && e.state ? e.state : null;
        if (!st || st.wt !== true) return;

        self.closeModal();
        if (self.state !== STATES.LANDING) self.setState(STATES.LANDING);
      });

      // Secret Bonus: resize/rotation => recalibrate fall lane (never fail the item)
      function onViewportChange() {
        const modeNow = String(self._runtime?.runMode || "RUN").trim();
        if (self.state !== STATES.PLAYING) return;
        if (modeNow !== "BONUS") return;

        // Recalibrate track height only (layout may have changed)
        const sbf = self._runtime?.secretBonusFall;
        if (sbf && sbf.running && sbf.laneEl && sbf.chipEl) {
          try {
            const laneH = sbf.laneEl.getBoundingClientRect().height || 0;
            const chipH = sbf.chipEl.getBoundingClientRect().height || 0;
            sbf.trackPxMax = Math.max(0, laneH - (Number.isFinite(chipH) ? chipH : 0));
          } catch (_) { /* silent */ }
        }
      }

      window.addEventListener("resize", onViewportChange);
      window.addEventListener("orientationchange", onViewportChange);
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
      const windowMs = Number(cfg?.secretBonus?.tapWindowMs);
      const tapsRequired = Number(cfg?.secretBonus?.tapsRequired);
      // No fallback: invalid config => feature off
      if (!Number.isFinite(windowMs) || windowMs <= 0) return;
      if (!Number.isFinite(tapsRequired) || tapsRequired < 1) return;

      e.preventDefault();

      // Once unlocked (persisted), 1 tap starts BONUS directly (no modal).
      if (hasSolvedSecretChestHint(cfg)) {
        try { chest.classList.remove("wt-btn-icon--tease"); } catch (_) { /* ignore */ }
        if (typeof self.startSecretBonusRun === "function") self.startSecretBonusRun();
        return;
      }

      const sb = self.wording?.secretBonus || {};
      const title = String(sb.modalTitle || "").trim();
      const body = String(sb.modalBody || "").trim();
      const cta = String(sb.modalCta || "").trim();
      const notNow = String(self.wording?.system?.notNow || "").trim() || String(self.wording?.system?.close || "").trim();

      function enterSecretBonusFlow() {
        // If the welcome modal was already shown earlier, avoid a second modal here.
        if (hasShownSecretChestWelcome(cfg)) {
          markSolvedSecretChestHint(cfg);
          try { chest.classList.remove("wt-btn-icon--tease"); } catch (_) { /* ignore */ }
          if (typeof self.startSecretBonusRun === "function") self.startSecretBonusRun();
          return;
        }

        // Mark solved NOW so the confirmation modal is shown only once per device.
        markSolvedSecretChestHint(cfg);
        try { chest.classList.remove("wt-btn-icon--tease"); } catch (_) { /* ignore */ }

        // No fallback copy: only show the confirmation modal if wording exists.
        if (title && body && cta && typeof self.openModal === "function") {
          // Mark shown before opening (one-shot per device) and to prevent render loops from re-opening.
          markShownSecretChestWelcome(cfg);

          if (self._runtime) self._runtime.secretBonusPending = true;

          const html = `
              <p>${escapeHtml(body)}</p>
              <div class="wt-actions">
                <button class="wt-btn wt-btn--primary" data-action="enter-secret-bonus">${escapeHtml(cta)}</button>
                ${notNow ? `<button class="wt-btn wt-btn--secondary" data-action="close-modal">${escapeHtml(notNow)}</button>` : ``}
              </div>
            `;

          self.openModal(html, title);
          return;
        }

        if (typeof self.startSecretBonusRun === "function") self.startSecretBonusRun();
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
      if (!last || (now - last) > windowMs) {
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
    const cfg = this.config || {};
    const w = this.wording || {};

    let root = this._footerNode || null;

    if (!root) {
      try {
        root =
          (this.appEl && this.appEl.querySelector && (
            this.appEl.querySelector("[data-wt-footer]") ||
            this.appEl.querySelector(".wt-footer") ||
            this.appEl.querySelector("footer")
          )) || null;
      } catch (_) {
        root = null;
      }
    }

    // Footer is outside #app in index.html -> strict, targeted fallback (no broad DOM scanning)
    if (!root) {
      try {
        root = document.querySelector(".wt-app .wt-footer") || null;
      } catch (_) {
        root = null;
      }
    }

    if (!root) return;

    // Cache for next calls
    this._footerNode = root;

    // Creator line
    const creatorEl = root.querySelector('[data-wt-brand="creatorLine"]');
    if (creatorEl) {
      const html = String(w.brand?.creatorLineHtml || "").trim();
      const line = String(w.brand?.creatorLine || "").trim();
      if (html) creatorEl.innerHTML = html;
      else creatorEl.textContent = line || "";
    }


    // Parent app/site link
    const appUrlEl = root.querySelector("#wt-tyf-link");
    const appUrlSep = root.querySelector(".wt-footer-sep--tyf");

    if (appUrlEl) {
      const url = String(cfg.identity?.parentUrl || "").trim();

      if (url) {
        appUrlEl.setAttribute("href", url);
        appUrlEl.setAttribute("target", "_blank");
        appUrlEl.setAttribute("rel", "noopener");

        try {
          appUrlEl.textContent = new URL(url).hostname.replace(/^www\./, "");
        } catch (_) {
          appUrlEl.textContent = url;
        }

        appUrlEl.style.display = "";
        if (appUrlSep) appUrlSep.style.display = "";
      } else {
        appUrlEl.style.display = "none";
        if (appUrlSep) appUrlSep.style.display = "none";
      }
    }

    // Version (prefix from wording, no hardcoded "v")
    const versionNodes = root.querySelectorAll("[data-wt-version]");
    if (versionNodes && versionNodes.length) {
      const v = String(cfg.version || "").trim();
      const prefix = String(w.system?.versionPrefix || "").trim();
      const txt = v ? `${prefix}${v}` : "";
      versionNodes.forEach(n => { n.textContent = txt; });
    }
  };


  // ============================================
  // Public API (called by main.js)
  // ============================================
  UI.prototype.setContent = function (items) {
    const list = Array.isArray(items) ? items : [];
    this._runtime.contentItems = list;
    this._runtime.contentById = Object.create(null);
    for (const it of list) {
      const id = String(it && it.id != null ? it.id : "").trim();
      if (!id) continue;
      this._runtime.contentById[id] = it;
    }
    this._runtime.contentTotal = list.length;
  };

  UI.prototype.setContentLoading = function (isLoading) {
    if (!this._runtime) return;
    this._runtime.contentLoading = (isLoading === true);
  };

  UI.prototype.init = function () {
    // Browser Back support:
    // Make LANDING the base history entry so Back from any in-app screen can return here.
    try {
      const baseUrl = location.pathname + location.search;
      history.replaceState({ wt: true, screen: STATES.LANDING }, "", baseUrl + "#home");
    } catch (_) { }

    // Populate footer with config values
    this.updateFooter();

    if (this._nav) this._nav.landingVariant = null;
    this.setState(STATES.LANDING);
  };


  UI.prototype.onStorageUpdated = function () {

    if (this._runtime && this._runtime.gameOverPending === true) return;
    if (this._runtime && this._runtime.finishingRun === true) return;

    this.render();
  };

  UI.prototype.onStorageSaveFailed = function () {
    const msg = String(this.wording?.system?.storageSaveFailedToast || "").trim();
    if (!msg) return;

    // Non-blocking warning. Timing is config-driven (default bucket).
    toastNow(this.config, msg, { variant: "danger" });
  };


  UI.prototype.getStatsByItem = function () {
    return (this.storage && typeof this.storage.getStatsByItem === "function")
      ? this.storage.getStatsByItem()
      : {};
  };

  // Pool exhausted toast (RUN / PRACTICE / BONUS)
  // Contract: WT_WORDING.ui.poolExhausted{Mode} must be provided (no fallback).
  UI.prototype._maybeShowPoolExhaustedToast = function () {
    const exhausted =
      !!(this.storage &&
        typeof this.storage.hasSeenAllWordTraps === "function" &&
        this.storage.hasSeenAllWordTraps() === true);

    if (!exhausted) return;

    const mode = String(this._runtime?.runMode || "RUN").trim();
    const key = `PLAYING:${mode}`;

    if (this._runtime && this._runtime.poolExhaustedToastKey === key) return;
    if (this._runtime) this._runtime.poolExhaustedToastKey = key;

    const uiWording = this.wording?.ui;
    if (!uiWording) return;

    let msgKey = "";
    switch (mode) {
      case "PRACTICE":
        msgKey = "poolExhaustedPractice";
        break;
      case "BONUS":
        msgKey = "poolExhaustedBonus";
        break;
      case "RUN":
      default:
        msgKey = "poolExhaustedRun";
        break;
    }

    const msg = String(uiWording[msgKey] || "").trim();
    if (!msg) return;

    const timing = getToastTiming(this.config, "");
    if (!timing) return;

    scheduleGameplayOverlay(msg, { delayMs: 0, durationMs: timing.durationMs, variant: "info" });
  };


  // Pool reshuffled toast (RUN only; one-shot from game.js state.poolReshuffled)
  // UX decision: never interrupt PLAYING with a technical reshuffle message.
  // Pool completion is celebrated via END (one-shot). After that, reshuffles are silent.
  UI.prototype._maybeShowPoolReshuffledToast = function () {
    return;
  };



  UI.prototype.setState = function (next) {
    const prev = this.state;

    // Reset pool exhausted toast de-dup when leaving PLAYING
    if (prev === STATES.PLAYING && next !== STATES.PLAYING && this._runtime) {
      this._runtime.poolExhaustedToastKey = null;

      // HUD deltas are time-based; if we leave PLAYING, cancel the cleanup timer.
      if (this._runtime.hudPulseCleanupTimerId) {
        try { window.clearTimeout(this._runtime.hudPulseCleanupTimerId); } catch (_) { }
        this._runtime.hudPulseCleanupTimerId = null;
      }
    }



    // Secret chest gesture must be per-END-screen attempt (never carry across screens)
    if (this._runtime && this._runtime.secretChest) {
      if (prev === STATES.END && next !== STATES.END) {
        this._runtime.secretChest.tapCount = 0;
        this._runtime.secretChest.lastTapAt = 0;
      }
      if (next === STATES.END && prev !== STATES.END) {
        this._runtime.secretChest.tapCount = 0;
        this._runtime.secretChest.lastTapAt = 0;
      }
    }

    // Price ticker (EARLY window) can be visible on PAYWALL and on LANDING (after PAYWALL).
    // Keep a single interval, and stop it when leaving both screens.
    if (prev === STATES.PAYWALL && next !== STATES.PAYWALL && next !== STATES.LANDING) {
      this._stopPaywallTicker();
    }
    if (prev === STATES.LANDING && next !== STATES.LANDING && next !== STATES.PAYWALL) {
      this._stopPaywallTicker();
    }


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
      const hash = (next === STATES.LANDING) ? "#home" : "#app";

      if (next !== STATES.LANDING && prev === STATES.LANDING) {
        history.pushState({ wt: true, screen: next }, "", baseUrl + hash);
      } else {
        history.replaceState({ wt: true, screen: next }, "", baseUrl + hash);
      }
    } catch (_) { }

    this.state = next;

    // Pool exhausted toast: show once per entry into PLAYING (all modes)
    if (next === STATES.PLAYING && prev !== STATES.PLAYING) {
      this._maybeShowPoolExhaustedToast();
    }

    // Entering PAYWALL: ensure clean single ticker
    if (next === STATES.PAYWALL && prev !== STATES.PAYWALL) {
      if (this.storage && typeof this.storage.markPaywallShown === "function") {
        this.storage.markPaywallShown(); // Storage owns startedAt persistence
      }
      this._stopPaywallTicker();
      this._startPaywallTicker(); // UI-only: re-render to show ticking mm:ss (PAYWALL/LANDING)
    }

    // Entering LANDING: show the EARLY timer only if the window is active (after PAYWALL)
    if (next === STATES.LANDING && prev !== STATES.LANDING) {
      let ep = null;
      if (this.storage && typeof this.storage.getEarlyPriceState === "function") {
        try { ep = this.storage.getEarlyPriceState() || null; } catch (_) { ep = null; }
      }

      const isEarly =
        !!(ep && String(ep.phase || "").toUpperCase() === "EARLY" && Number(ep.remainingMs || 0) > 0);

      if (isEarly) {
        this._stopPaywallTicker();
        this._startPaywallTicker();
      } else {
        this._stopPaywallTicker();
      }
    }


    this.render();

    // END entry hooks(no gameplay interruptions)
    if (next === STATES.END && prev !== STATES.END) {

      // Micro-pics highlight (END-only)
      // Option A: do NOT toast endHighlight on END entry (avoid weird late micro-pic on END screen)
      try {
        const mp = this._runtime && this._runtime.microPics ? this._runtime.microPics : null;
        if (mp) {
          mp.endHighlight = "";
          mp.endHighlightVariant = "";
          mp.endHighlightPriority = -1;
        }
      } catch (_) { /* silent */ }

      // Anonymous stats sharing prompt (END-only, one-shot, post-completion only)
      try {
        if (typeof this._maybePromptStatsSharingMilestone === "function") {
          this._maybePromptStatsSharingMilestone();
        }
      } catch (_) { /* silent */ }

      // END "Record moment" (RUN+Premium+newBest only): temporarily replace scoreLine with newBest copy.
      try {
        const cfg = this.config || {};
        const w = this.wording || {};
        const endW = w.end || {};

        const premium = (this.storage && typeof this.storage.isPremium === "function")
          ? (this.storage.isPremium() === true)
          : false;

        const lastRun = this._runtime?.lastRun || {};
        const mode = String(lastRun.mode || this._runtime?.runMode || "RUN").trim();
        const isRun = (mode === "RUN");
        const newBest = isRun && (lastRun.newBest === true);

        const ms = Number(cfg?.ui?.endRecordMomentMs);
        const newBestTpl = String(endW.newBest || "").trim();

        const enabled = premium && newBest && newBestTpl && Number.isFinite(ms) && ms > 0;

        if (enabled) {
          if (!this._runtime) this._runtime = {};
          if (this._runtime.endRecordMomentTimer) {
            try { clearTimeout(this._runtime.endRecordMomentTimer); } catch (_) { /* silent */ }
            this._runtime.endRecordMomentTimer = null;
          }

          this._runtime.endRecordMomentUntil = Date.now() + ms;

          this._runtime.endRecordMomentTimer = setTimeout(() => {
            try {
              if (this._runtime) this._runtime.endRecordMomentUntil = 0;
              this.render();
            } catch (_) { /* silent */ }
          }, ms);
        } else {
          if (this._runtime) this._runtime.endRecordMomentUntil = 0;
        }
      } catch (_) { /* silent */ }

      // END score victory animation (UI-only; no count-up; respects reduced motion)
      try {
        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const scoreEl = document.querySelector(".wt-end-score");
        if (!scoreEl) return;

        // Restart animation cleanly on each END entry
        scoreEl.classList.remove("wt-end-score--celebrate");
        void scoreEl.offsetWidth; // force reflow (Safari-safe)
        scoreEl.classList.add("wt-end-score--celebrate");
      } catch (_) { /* silent */ }

    }




  };


  // ============================================
  // Modal helpers
  // ============================================

  UI.prototype.openModal = function (html, title) {
    if (!this.modalEl || !this.modalContentEl) {
      if (window.WT_CONFIG?.debug?.enabled) console.error("[WT Debug] openModal ABORT: modalEl=", !!this.modalEl, "modalContentEl=", !!this.modalContentEl);
      return;
    }
    if (window.WT_CONFIG?.debug?.enabled) console.log("[WT Debug] openModal called, title=", title);
    // A11Y: store last focused element to restore on close
    try {
      if (this._runtime) this._runtime._lastFocusBeforeModal = document.activeElement || null;
    } catch (_) { /* silent */ }

    // A11Y: inert the main content so Tab cannot reach behind the modal
    try {
      const mainEl = document.querySelector(".wt-main");
      if (mainEl) mainEl.inert = true;
    } catch (_) { /* silent */ }

    this.modalEl.classList.remove("wt-hidden");
    this.modalEl.setAttribute("aria-hidden", "false");

    const t = escapeHtml(String(title || "").trim());
    const closeLabel = escapeHtml(String(this.wording?.system?.close || "").trim());

    this.modalContentEl.innerHTML = `
  <div class="wt-modal-header">
    <div class="wt-row wt-row--spaced">
      <h2 class="wt-h2">${t}</h2>
      <button class="wt-btn wt-btn--ghost" data-action="close-modal" aria-label="${closeLabel}">&times;</button>
    </div>
  </div>
  ${html}
`;


    // A11Y: focus the first actionable element in the modal (close button)
    try {
      const first = this.modalContentEl.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (first && typeof first.focus === "function") first.focus();
    } catch (_) { /* silent */ }

    // A11Y: minimal focus trap (Tab/Shift+Tab loops inside modal)
    try {
      const self = this;
      const trap = function (e) {
        if (!e || e.key !== "Tab") return;
        if (!self.modalEl || self.modalEl.classList.contains("wt-hidden")) return;

        const focusables = self.modalEl.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusables || focusables.length === 0) return;

        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (e.shiftKey) {
          if (active === firstEl || active === self.modalEl) {
            e.preventDefault();
            if (lastEl && typeof lastEl.focus === "function") lastEl.focus();
          }
        } else {
          if (active === lastEl) {
            e.preventDefault();
            if (firstEl && typeof firstEl.focus === "function") firstEl.focus();
          }
        }
      };

      if (this._runtime) this._runtime._modalTrapHandler = trap;
      this.modalEl.addEventListener("keydown", trap);
    } catch (_) { /* silent */ }
  };



  UI.prototype.closeModal = function () {
    if (!this.modalEl || !this.modalContentEl) return;

    // A11Y: remove focus trap listener
    try {
      const h = this._runtime ? this._runtime._modalTrapHandler : null;
      if (h) this.modalEl.removeEventListener("keydown", h);
      if (this._runtime) this._runtime._modalTrapHandler = null;
    } catch (_) { /* silent */ }

    this.modalEl.classList.add("wt-hidden");
    this.modalEl.setAttribute("aria-hidden", "true");
    this.modalContentEl.innerHTML = "";

    // A11Y: re-enable main content
    try {
      const mainEl = document.querySelector(".wt-main");
      if (mainEl) mainEl.inert = false;
    } catch (_) { /* silent */ }

    // A11Y: restore focus to the element that opened the modal (if still present)
    try {
      const prev = this._runtime ? this._runtime._lastFocusBeforeModal : null;
      if (this._runtime) this._runtime._lastFocusBeforeModal = null;

      if (prev && typeof prev.focus === "function" && document.contains(prev)) {
        prev.focus();
      }
    } catch (_) { /* silent */ }
  };



  UI.prototype.openHowToModal = function () {
    const w = this.wording || {};
    const how = w.howto || {};
    const ui = w.ui || {};
    const cfg = this.config || {};
    const poolSize = Number(cfg?.game?.poolSize);
    const maxChances = Number(cfg?.game?.maxChances);

    const isPrem = (this.storage && typeof this.storage.isPremium === "function")
      ? (this.storage.isPremium() === true)
      : false;

    // Pull live values from the engine (single source of truth)
    const gs = (this.game && typeof this.game.getState === "function") ? (this.game.getState() || {}) : {};
    const scoreFP = Number(gs.scoreFP);
    const chancesLeft = Number(gs.chancesLeft);

    // No hardcoded fallback: if runtime values are missing, keep placeholders empty.
    const vars = {
      score: Number.isFinite(scoreFP) ? scoreFP : "",
      fpLong: String(ui.fpLong || "").trim(),
      maxChances: Number.isFinite(maxChances) ? maxChances : "",
      chancesLeft: Number.isFinite(chancesLeft) ? chancesLeft : (Number.isFinite(maxChances) ? maxChances : "")
    };

    const line = (s) => `<p>${escapeHtml(fillTemplate(String(s || "").trim(), vars))}</p>`;

    // Business section (Premium + Activate) is ONLY for non-premium users.
    let premiumHtml = "";
    if (!isPrem) {
      const premiumOnlyHint = String(how.premiumOnlyHint || "").trim();

      const paywallBullets = Array.isArray(w.paywall?.valueBullets) ? w.paywall.valueBullets : [];
      const premiumBulletsHtml = paywallBullets
        .map((b) => String(b || "").trim())
        .filter(Boolean)
        .map((b) => `<p class="wt-muted">&bull; ${escapeHtml(b)}</p>`)
        .join("");

      const upgradeCta = String(w.paywall?.cta || "").trim();
      const redeemLabel = String(w.paywall?.alreadyHaveCode || "").trim();

      premiumHtml = `
        <div class="wt-divider"></div>
        <div class="wt-actions" style="gap:8px">
          ${redeemLabel ? `<button class="wt-btn wt-btn--ghost" data-action="redeem-code">${escapeHtml(redeemLabel)}</button>` : ``}
          ${upgradeCta ? `<button class="wt-btn wt-btn--ghost" data-action="open-paywall">${escapeHtml(upgradeCta)}</button>` : ``}
        </div>
      `;
    }
    const html = `
      ${line(how.howToPlayLine1)}
      ${line(how.howToPlayLine2)}
      ${line(how.howToPlayLine3)}

      <div class="wt-divider"></div>

      <p class="wt-question-title" style="margin:0 0 8px 0;">
        ${escapeHtml(String(how.ruleTitle || "").trim())}
      </p>
      <p class="wt-muted" style="margin:0;">
        ${escapeHtml(fillTemplate(String(how.ruleSentence || "").trim(), vars))}
      </p>

      ${premiumHtml}
    `;


    this.openModal(html, String(how.title || "").trim());
  };




  UI.prototype.openRedeemModal = function () {
    const w = this.wording || {};
    const how = w.howto || {};

    const placeholder = String(how.activationCodePlaceholder || "").trim();
    const phAttr = placeholder ? ` placeholder="${escapeHtml(placeholder)}"` : "";

    // Prefill from storage (no fallback; only if storage exposes data)
    let existingCode = "";
    if (this.storage && typeof this.storage.getData === "function") {
      try {
        const d = this.storage.getData() || {};
        existingCode = String(d?.codes?.code || "").trim();
      } catch (_) {
        existingCode = "";
      }
    }

    const valAttr = existingCode ? ` value="${escapeHtml(existingCode)}"` : "";

    const html = `
      <label class="wt-label" for="wt-code">${escapeHtml(String(how.activationCodeLabel || "").trim())}</label>
      <input id="wt-code" class="wt-input" autocomplete="off" inputmode="text"${phAttr}${valAttr} />
      <p class="wt-muted">${escapeHtml(String(how.activateLine2 || "").trim())}</p>

      <div class="wt-actions">
        <button class="wt-btn wt-btn--primary" data-action="confirm-redeem">${escapeHtml(String(how.activateCta || "").trim())}</button>
      </div>

      <p id="wt-code-msg" class="wt-muted" aria-live="polite"></p>
    `;

    this.openModal(html, String(how.activateTitle || "").trim());

    // UX: focus input (optional, safe)
    try {
      const input = this.modalContentEl ? this.modalContentEl.querySelector("#wt-code") : null;
      if (input && typeof input.focus === "function") input.focus();
      if (input && typeof input.setSelectionRange === "function" && existingCode) {
        input.setSelectionRange(existingCode.length, existingCode.length);
      }
    } catch (_) { /* silent */ }
  };


  UI.prototype.promptAutoRedeemIfReady = function () {
    // Guardrails: config must define the key (no fallback), and prompt only once per page-load.
    if (this._runtime && this._runtime._autoRedeemPromptShown === true) return;

    const cfg = this.config || {};
    const key = String(cfg?.storage?.vanityCodeStorageKey || "").trim();
    if (!key) return;

    const isPrem = (this.storage && typeof this.storage.isPremium === "function")
      ? (this.storage.isPremium() === true)
      : false;
    if (isPrem) return;

    let code = "";
    try { code = String(window.localStorage.getItem(key) || "").trim(); } catch (_) { code = ""; }
    if (!code) return;

    if (this._runtime) this._runtime._autoRedeemPromptShown = true;
    this.openAutoRedeemModal();
  };


  UI.prototype.openAutoRedeemModal = function () {
    const w = this.wording || {};
    const how = w.howto || {};

    const title = String(how.autoActivateTitle || "").trim();
    const l1 = String(how.autoActivateLine1 || "").trim();
    const l2 = String(how.autoActivateLine2 || "").trim();

    const cta = String(how.autoActivateCta || "").trim();
    const later = String(how.autoActivateLater || "").trim();

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

    const msg = this.modalContentEl ? this.modalContentEl.querySelector("#wt-auto-redeem-msg") : null;

    const cfg = this.config || {};
    const key = String(cfg?.storage?.vanityCodeStorageKey || "").trim();
    if (!key) {
      if (msg) msg.textContent = String(how.codeRejected || "").trim();
      return;
    }

    let code = "";
    try { code = String(window.localStorage.getItem(key) || "").trim(); } catch (_) { code = ""; }
    if (!code) {
      if (msg) msg.textContent = String(how.codeRejected || "").trim();
      return;
    }

    if (!this.storage || typeof this.storage.tryRedeemPremiumCode !== "function") {
      if (msg) msg.textContent = String(how.codeRejected || "").trim();
      return;
    }

    const res = this.storage.tryRedeemPremiumCode(code);
    if (!res || res.ok !== true) {
      if (msg) msg.textContent = String(how.codeRejected || "").trim();
      return;
    }

    // Success: clear vanity key to prevent re-prompting
    try { window.localStorage.removeItem(key); } catch (_) { /* silent */ }

    toastNow(this.config, String(how.codeOk || "").trim());
    this.closeModal();
    this.render();
  };


  UI.prototype._confirmRedeemCode = function () {
    const w = this.wording || {};
    const how = w.howto || {};

    const input = this.modalContentEl ? this.modalContentEl.querySelector("#wt-code") : null;
    const msg = this.modalContentEl ? this.modalContentEl.querySelector("#wt-code-msg") : null;

    const code = String(input && input.value ? input.value : "").trim();
    if (!code) {
      if (msg) msg.textContent = String(how.enterCode || "").trim();
      return;
    }

    const cfg = this.config || {};
    const reRaw = String(cfg.premiumCodeRegex || "").trim();
    if (reRaw) {
      try {
        const re = new RegExp(reRaw);
        if (!re.test(code)) {
          if (msg) msg.textContent = String(how.codeInvalid || "").trim();
          return;
        }
      } catch (_) {
        // ignore (soft)
      }
    }

    if (!this.storage || typeof this.storage.tryRedeemPremiumCode !== "function") {
      if (msg) msg.textContent = String(how.codeRejected || "").trim();
      return;
    }

    const res = this.storage.tryRedeemPremiumCode(code);

    if (!res || res.ok !== true) {
      if (msg) msg.textContent = String(how.codeRejected || "").trim();
      return;
    }

    /// Success
    toastNow(this.config, String(how.codeOk || "").trim());
    this.closeModal();
    this.render();
  };


  // ============================================
  // Game flow
  // ============================================

  // V2 first-run framing: persisted once per device via localStorage.


  UI.prototype._canShowFirstRunFraming = function () {
    // Only once, and only from the landing (never after END/PAYWALL/free exhaustion).
    if (this.state !== STATES.LANDING) return false;

    // If we can't persist the flag (no storageKey in config), disable this feature (no fallback).
    const k = firstRunFramingKey(this.config);
    if (!k) return false;

    return !hasSeenFirstRunFraming(this.config);
  };


  UI.prototype._openFirstRunFraming = function () {
    // Lock immediately so it canâ€™t reappear later via other flows.
    markSeenFirstRunFraming(this.config);

    const w = this.wording || {};
    const fr = w.firstRun || {};
    const cfg = this.config || {};

    const poolSize = clampInt(cfg?.game?.poolSize, 1, 9999);
    const maxChances = clampInt(cfg?.game?.maxChances, 1, 99);
    const freeRuns = clampInt(cfg?.limits?.freeRuns, 0, 99);

    const vars = { poolSize, maxChances, freeRuns };

    const framingLines = Array.isArray(fr.framingLines) ? fr.framingLines : [];
    const trustLines = Array.isArray(fr.trustLines) ? fr.trustLines : [];

    const renderLines = (arr) => {
      return arr
        .map(s => String(s || "").trim())
        .filter(Boolean)
        .map(s => `<p class="wt-meta">${escapeHtml(fillTemplate(s, vars))}</p>`)
        .join("");
    };

    const html = `
      ${renderLines(framingLines)}
      ${trustLines.length ? `<div class="wt-divider"></div>` : ``}
      ${renderLines(trustLines)}
          <div class="wt-actions">
                     <button class="wt-btn wt-btn--primary" data-action="start-run" aria-label="${escapeHtml(String(fr.ctaLabel || "").trim())}">
           ${escapeHtml(String(fr.ctaLabel || "").trim())}
         </button>

      </div>

    `;

    const modalTitle = String(w.system?.more || "").trim();
    if (!modalTitle && this.config?.debug?.enabled) {
      console.warn("[WT_UI] Missing required copy: WT_WORDING.system.more");
    }
    this.openModal(html, modalTitle);

  };


  UI.prototype._maybeTriggerMicroPic = function (res) {
    // Spec: only in RUN (never in practice)
    // Product rule (updated): micro-pics can surface during RUN via gameplay overlay, with cooldown.
    if (!this._runtime) return;
    if (String(this._runtime.runMode || "RUN") !== "RUN") return;

    const mp = this._runtime.microPics;
    if (!mp) return;

    const w = this.wording || {};
    const mpc = (w.micropics && typeof w.micropics === "object") ? w.micropics : {};
    const cfg = this.config || {};

    const mpCfg = (cfg && cfg.microPics) ? cfg.microPics : null;
    if (!mpCfg) return;

    const answeredCount = Array.isArray(this._runtime.runItemIds) ? this._runtime.runItemIds.length : 0;
    const isCorrect = (res && res.isCorrect === true);

    // Live state after engine answer
    let chancesLeft = mp.prevChancesLeft;
    try {
      const gs = (this.game && typeof this.game.getState === "function") ? (this.game.getState() || {}) : {};
      if (gs.chancesLeft != null) chancesLeft = clampInt(gs.chancesLeft, 0, 99);
    } catch (_) { /* keep prev */ }

    // Detect chance loss strictly (observable state change)
    const prev = (mp.prevChancesLeft == null) ? chancesLeft : mp.prevChancesLeft;
    const chanceLost = (!isCorrect && Number.isFinite(prev) && Number.isFinite(chancesLeft) && chancesLeft < prev);

    // Update prev snapshot ASAP
    mp.prevChancesLeft = chancesLeft;

    // Maintain streak (flow stops immediately on first error)
    if (isCorrect) {
      mp.correctStreak = clampInt(mp.correctStreak + 1, 0, 9999);
      mp.maxCorrectStreak = Math.max(clampInt(mp.maxCorrectStreak, 0, 9999), mp.correctStreak);
    } else {
      mp.correctStreak = 0;
      mp.flowTierShown = 0;
    }

    // Danger overlays are handled centrally (no micro-pic overlay on chance loss)
    // But we do want to mark the "post-mistake" window for recovery logic.
    if (chanceLost) {
      mp.justRecoveredFromMistake = true;
      mp.lastDangerAtCount = answeredCount;
      mp.lastDangerAtMs = Date.now();
    }

    // Timing bucket (no fallback): required for in-run micro-pics
    const timing = getToastTiming(cfg, "positive");
    if (!timing) return;

    const cooldownItems = Number(mpCfg.cooldownItems);
    if (!Number.isFinite(cooldownItems) || cooldownItems < 0 || cooldownItems > 99) return;

    function tryShowRunOverlay(msg, variant) {
      const m = String(msg || "").trim();
      if (!m) return false;

      // 1 message per answer (even if cooldownItems=0)
      if (answeredCount === clampInt(mp.lastToastAtCount, -9999, 9999)) return false;

      // Anti-collision: block positives while danger overlay may still be visible
      const dangerMs = Number(cfg?.ui?.chanceLostOverlayMs);
      const lastDangerAtMs = Number(mp.lastDangerAtMs);
      if (Number.isFinite(dangerMs) && dangerMs > 0 && Number.isFinite(lastDangerAtMs) && lastDangerAtMs > 0) {
        if ((Date.now() - lastDangerAtMs) < dangerMs) return false;
      }

      const canShowNow = (answeredCount - clampInt(mp.lastToastAtCount, -9999, 9999)) >= Math.floor(cooldownItems);
      if (!canShowNow) return false;

      scheduleGameplayOverlay(m, { delayMs: timing.delayMs, durationMs: timing.durationMs, variant: String(variant || "info") });
      mp.lastToastAtCount = answeredCount;
      return true;
    }

    function setEndHighlight(msg, variant, priority) {
      const m = String(msg || "").trim();
      if (!m) return;

      const p = Number(priority);
      if (!Number.isFinite(p)) return;

      const currentP = Number(mp.endHighlightPriority);
      const hasCurrent = Number.isFinite(currentP);

      if (!hasCurrent || p > currentP) {
        mp.endHighlight = m;
        mp.endHighlightVariant = String(variant || "").trim();
        mp.endHighlightPriority = Math.floor(p);
      }
    }


    // Chance loss handler: no gameplay micro-pic on this answer.
    // We can still set END-only highlights (no interruptions).
    if (chanceLost) {
      // Near-miss (one-shot per RUN): error that brings you down to 1 chance left.
      if (cfg?.microPics?.nearMissEnabled === true && chancesLeft === 1 && mp.nearMissShown !== true) {
        const msg = String(mpc.nearMiss || "").trim();
        setEndHighlight(msg, "info", 55);
        mp.nearMissShown = true;
      }

      // Repeated mistakes qualitative feedback (one-shot per RUN)
      const minWrong = Number(cfg?.microPics?.repeatMistakeWrongCountMin);
      if (Number.isFinite(minWrong) && minWrong > 0 && mp.repeatMistakeShown !== true) {
        const idNum = Number(res?.itemId);
        if (Number.isFinite(idNum) && this.storage && typeof this.storage.getItemStats === "function") {
          const st = this.storage.getItemStats(idNum) || null;
          const wc = Number(st?.wrongCount || 0);
          if (Number.isFinite(wc) && wc >= Math.floor(minWrong)) {
            const msg = String(mpc.repeatMistake || "").trim();
            setEndHighlight(msg, "info", 50);
            mp.repeatMistakeShown = true;
          }
        }
      }

      return;
    }


    // Survival highlight: reached 1 chance remaining at least once (RUN)
    // Rule: 1 message per answer max -> if survival shows, skip tier streak on this answer.
    if (isCorrect && chancesLeft === 1 && mp.survivalShown !== true) {
      const msg = String(mpc.runContinues || "").trim();
      if (tryShowRunOverlay(msg, "info")) {
        mp.survivalShown = true;
        setEndHighlight(msg, "info", 40);
        return;
      }
      setEndHighlight(msg, "info", 40);
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
    const tierOnce = (mp.tierShownOnce && typeof mp.tierShownOnce === "object") ? mp.tierShownOnce : null;

    const againTpl = String(mpc.streakAgainTemplate || "").trim();
    function againMsgFor(threshold) {
      if (!againTpl) return "";
      return String(fillTemplate(againTpl, { n: Math.floor(Number(threshold)), streak: s }) || "").trim();
    }

    // #3 Recovery non-chiffrÃ© (one-shot), mÃªme sans record
    if (mp.justRecoveredFromMistake === true && s >= tBuilding && mp.flowTierShown < tBuilding) {
      const msg = String(mpc.recovery || "").trim();
      if (tryShowRunOverlay(msg, "info")) {
        mp.flowTierShown = tBuilding;
        mp.justRecoveredFromMistake = false;
        mp.maxCorrectStreakDisplayed = Math.max(clampInt(mp.maxCorrectStreakDisplayed, 0, 9999), s);
        if (tierOnce) tierOnce.building = true;
        setEndHighlight(msg, "success", 70);
      }
      return;
    }

    // #4 RaretÃ© intelligente: streak micropics uniquement si nouveau record â€œrÃ©compensÃ©â€
    const shownMax = clampInt(mp.maxCorrectStreakDisplayed, 0, 9999);
    if (s <= shownMax) return;

    if (s >= tLegendary && mp.flowTierShown < tLegendary) {
      const already = !!(tierOnce && tierOnce.legendary === true);
      const baseMsg = String(mpc.streakLegendary || "").trim();
      const msg = (already ? againMsgFor(tLegendary) : "") || baseMsg;

      if (tryShowRunOverlay(msg, "info")) {
        mp.flowTierShown = tLegendary;
        mp.maxCorrectStreakDisplayed = Math.max(clampInt(mp.maxCorrectStreakDisplayed, 0, 9999), s);
      }
      if (tierOnce) tierOnce.legendary = true;
      setEndHighlight(msg, "success", 100);
      mp.justRecoveredFromMistake = false;
      return;
    }
    if (s >= tElite && mp.flowTierShown < tElite) {
      const already = !!(tierOnce && tierOnce.elite === true);
      const baseMsg = String(mpc.streakElite || "").trim();
      const msg = (already ? againMsgFor(tElite) : "") || baseMsg;

      if (tryShowRunOverlay(msg, "info")) {
        mp.flowTierShown = tElite;
        mp.maxCorrectStreakDisplayed = Math.max(clampInt(mp.maxCorrectStreakDisplayed, 0, 9999), s);
      }
      if (tierOnce) tierOnce.elite = true;
      setEndHighlight(msg, "success", 90);
      mp.justRecoveredFromMistake = false;
      return;
    }
    if (s >= tStrong && mp.flowTierShown < tStrong) {
      const already = !!(tierOnce && tierOnce.strong === true);
      const baseMsg = String(mpc.streakStrong || "").trim();
      const msg = (already ? againMsgFor(tStrong) : "") || baseMsg;

      if (tryShowRunOverlay(msg, "info")) {
        mp.flowTierShown = tStrong;
        mp.maxCorrectStreakDisplayed = Math.max(clampInt(mp.maxCorrectStreakDisplayed, 0, 9999), s);
      }
      if (tierOnce) tierOnce.strong = true;
      setEndHighlight(msg, "success", 80);
      mp.justRecoveredFromMistake = false;
      return;
    }
    if (s >= tBuilding && mp.flowTierShown < tBuilding) {
      const already = !!(tierOnce && tierOnce.building === true);
      const baseMsg = String(mpc.streakBuilding || "").trim();
      const msg = (already ? againMsgFor(tBuilding) : "") || baseMsg;

      if (tryShowRunOverlay(msg, "info")) {
        mp.flowTierShown = tBuilding;
        mp.maxCorrectStreakDisplayed = Math.max(clampInt(mp.maxCorrectStreakDisplayed, 0, 9999), s);
      }
      if (tierOnce) tierOnce.building = true;
      setEndHighlight(msg, "success", 70);
      mp.justRecoveredFromMistake = false;
      return;
    }

    // #2 Cooldown adaptatif aprÃ¨s erreur: ignorer le palier "start" une fois
    if (mp.justRecoveredFromMistake !== true && s >= tStart && mp.flowTierShown < tStart) {
      const already = !!(tierOnce && tierOnce.start === true);
      const baseMsg = String(mpc.streakStart || "").trim();
      const msg = (already ? againMsgFor(tStart) : "") || baseMsg;

      if (tryShowRunOverlay(msg, "info")) {
        mp.flowTierShown = tStart;
        mp.maxCorrectStreakDisplayed = Math.max(clampInt(mp.maxCorrectStreakDisplayed, 0, 9999), s);
      }
      if (tierOnce) tierOnce.start = true;
      setEndHighlight(msg, "success", 65);
      mp.justRecoveredFromMistake = false;
      return;
    }

    if (s >= tStart && mp.flowTierShown < tStart) {
      const already = !!(tierOnce && tierOnce.start === true);
      const baseMsg = String(mpc.streakStart || "").trim();
      const msg = (already ? againMsgFor(tStart) : "") || baseMsg;

      if (tryShowRunOverlay(msg, "info")) mp.flowTierShown = tStart;
      if (tierOnce) tierOnce.start = true;
      setEndHighlight(msg, "success", 65);
      return;
    }


    // End-of-run highlight (only meaningful if the run ended)
    const done = (res && res.done === true);
    if (done === true) {
      if (chancesLeft === 0 && answeredCount >= 6) {
        setEndHighlight(String(mpc.runEndedAllChancesUsed || "").trim(), "success", 60);
        return;
      }
    }


    return;

  };




  UI.prototype.startRun = function (mistakesOnly) {
    const cfg = this.config || {};
    const premium = (this.storage && typeof this.storage.isPremium === "function") ? this.storage.isPremium() : false;

    // Practice is premium-only
    if (mistakesOnly === true && !premium) {
      this.setState(STATES.PAYWALL);
      return;
    }

    // RUN economy gate (free runs) is enforced at run start.
    if (mistakesOnly !== true && !premium) {
      if (!this.storage || typeof this.storage.consumeRunOrBlock !== "function") {
        this.setState(STATES.PAYWALL);
        return;
      }

      const gate = this.storage.consumeRunOrBlock();
      if (!gate || gate.ok !== true) {
        if (this._nav) this._nav.paywallFromState = this.state;
        this.setState(STATES.PAYWALL);
        return;
      }
    }

    // Hook for live stats refresh during run (deck rebuild)
    // Exposed on the UI instance to avoid scope-related ReferenceError.
    this.getStatsByItem = () => {
      return (this.storage && typeof this.storage.getStatsByItem === "function")
        ? this.storage.getStatsByItem()
        : {};
    };

    // Snapshot at run start (anti-repetition seed)
    const statsByItem = this.getStatsByItem();

    // Provide a stable function reference to the engine (no free variable)
    const getStatsByItem = this.getStatsByItem;

    // Start engine after gate succeeded
    // Eligible pool for normal RUN / PRACTICE = full content set.
    const srcItems = Array.isArray(this._runtime?.contentItems) ? this._runtime.contentItems : [];
    const eligible = srcItems.slice();

    const state = this.game.start({
      items: eligible,
      statsByItem,
      getStatsByItem,
      config: cfg,

      // game.js contract: "RUN" | "PRACTICE" | "BONUS"
      mode: (mistakesOnly === true) ? "PRACTICE" : "RUN"
    });



    this._runtime.runItemIds = [];
    this._runtime.runMistakeIds = [];
    this._runtime.runMode = (mistakesOnly === true) ? "PRACTICE" : "RUN";
    this._runtime.lastAnswer = null;
    this._runtime.feedbackPending = false;
    this._runtime.feedbackReveal = true;
    if (this._runtime.feedbackRevealTimerId) {
      try { window.clearTimeout(this._runtime.feedbackRevealTimerId); } catch (_) { }
      this._runtime.feedbackRevealTimerId = null;
    }
    this._runtime.frozenItem = null;
    this._runtime.shareAnchorId = null;


    // micro-pics reset (run-only)
    if (this._runtime.microPics) {
      this._runtime.microPics.correctStreak = 0;
      this._runtime.microPics.flowTierShown = 0;
      this._runtime.microPics.twoChancesShown = false;
      this._runtime.microPics.survivalShown = false;
      this._runtime.microPics.lastToastAtCount = -999;
      this._runtime.microPics.lastDangerAtCount = -999;

      // #2/#3/#4 runtime flags (UI-only)
      this._runtime.microPics.justRecoveredFromMistake = false;
      this._runtime.microPics.maxCorrectStreakDisplayed = 0;

      // Near-miss + repeated mistakes (one-shot per RUN)
      this._runtime.microPics.nearMissShown = false;
      this._runtime.microPics.repeatMistakeShown = false;

      // Per-run memory: reset only at run start (not on chance loss)
      this._runtime.microPics.tierShownOnce = {
        start: false,
        building: false,
        strong: false,
        elite: false,
        legendary: false
      };


      // END-only highlight (no gameplay interruptions)
      this._runtime.microPics.endHighlight = "";
      this._runtime.microPics.endHighlightVariant = "";
      this._runtime.microPics.endHighlightPriority = -1;

      // snapshot chances at run start
      let startChances = clampInt(cfg?.game?.maxChances, 1, 99);
      try {

        const gs = (this.game && typeof this.game.getState === "function") ? (this.game.getState() || {}) : {};
        if (gs.chancesLeft != null) startChances = clampInt(gs.chancesLeft, 0, 99);
      } catch (_) { /* keep cfg */ }

      this._runtime.microPics.prevChancesLeft = startChances;
    }


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
    let runType = "";
    try {
      const isPrem = (this.storage && typeof this.storage.isPremium === "function") ? (this.storage.isPremium() === true) : false;

      if (mistakesOnly === true) {
        runType = "PRACTICE";
      } else if (isPrem) {
        runType = "UNLIMITED";
      } else if (this.storage && typeof this.storage.getRunsBalance === "function") {
        const after = Number(this.storage.getRunsBalance());
        if (Number.isFinite(after)) {
          runType = (after === 0) ? "LAST_FREE" : "FREE";
        }
      }
    } catch (_) { runType = ""; }

    // Persist runType for PAYWALL rendering (e.g., headlineLastFree).
    this._runtime.runType = runType;

    showRunStartOverlay(cfg, this.wording, this.game, runType);

    // Warn on accidental tab close during gameplay (run already consumed)
    if (!this._beforeUnloadHandler) {
      this._beforeUnloadHandler = (e) => {
        if (this.state !== STATES.PLAYING) return;
        e.preventDefault();
      };
      window.addEventListener("beforeunload", this._beforeUnloadHandler);
    }

    this.setState(STATES.PLAYING);

  };


  // Secret bonus: seen-only bonus run (seenCount > 0).
  // Does NOT consume run economy.
  // IMPORTANT: deck is consumed once (no reshuffle, no loop). BONUS ends when the deck is exhausted.
  UI.prototype.startSecretBonusRun = function () {
    const cfg = this.config || {};
    const premium = (this.storage && typeof this.storage.isPremium === "function") ? this.storage.isPremium() : false;

    // Bonus free runs gate (teaser premium)
    if (!premium) {
      const limit = clampInt(cfg?.secretBonus?.freeRunsLimit, 0, 99);
      const used = (this.storage && typeof this.storage.getSecretBonusFreeRunsUsed === "function")
        ? Number(this.storage.getSecretBonusFreeRunsUsed())
        : 0;

      if (Number.isFinite(limit) && limit > 0 && used >= limit) {
        // Show limit reached modal
        const sb = this.wording?.secretBonus || {};
        const title = fillTemplate(String(sb.freeLimitReachedTitle || "").trim(), { limit });
        const body = fillTemplate(String(sb.freeLimitReachedBody || "").trim(), { limit });
        const cta = String(sb.freeLimitReachedCta || "").trim();
        const close = String(sb.freeLimitReachedClose || "").trim();

        if (title && body && typeof this.openModal === "function") {
          const html = `
            <p style="white-space:pre-line">${escapeHtml(body)}</p>
            <div class="wt-actions">
              ${cta ? `<button class="wt-btn wt-btn--primary" data-action="open-paywall">${escapeHtml(cta)}</button>` : ``}
              ${close ? `<button class="wt-btn wt-btn--secondary" data-action="close-modal">${escapeHtml(close)}</button>` : ``}
            </div>
          `;
          this.openModal(html, title);
        }
        return;
      }

      // Increment counter for free users
      if (this.storage && typeof this.storage.incrementSecretBonusFreeRunsUsed === "function") {
        this.storage.incrementSecretBonusFreeRunsUsed();
      }
    }
    // Stats snapshot (source of truth for "seen")
    const statsByItem = (this.storage && typeof this.storage.getStatsByItem === "function")
      ? this.storage.getStatsByItem()
      : {};

    // Build eligible pool: items with seenCount > 0
    const srcItems = Array.isArray(this._runtime?.contentItems) ? this._runtime.contentItems : [];
    const eligible = [];

    for (const it of srcItems) {
      const id = (it && it.id != null) ? Number(it.id) : null;
      if (!Number.isFinite(id)) continue;

      const s = statsByItem[String(id)] || null;
      const seen = Number(s?.seenCount || 0);

      if (seen > 0) eligible.push(it);
    }

    // No eligible words: do nothing unless copy exists (no hardcoded fallback).
    const minDeck = clampInt(cfg?.secretBonus?.minDeckSize, 1, 999);
    if (!Number.isFinite(minDeck) || eligible.length < minDeck) {

      const msg = String(this.wording?.secretBonus?.noSeenWordsToast || "").trim();
      if (msg) toastNow(this.config, msg);
      return;
    }

    // Hook for live stats refresh during run (deck rebuild)
    const getStatsByItem = () => {
      return (this.storage && typeof this.storage.getStatsByItem === "function")
        ? this.storage.getStatsByItem()
        : {};
    };

    const state = this.game.start({
      items: eligible,
      statsByItem,
      getStatsByItem,
      config: cfg,

      // MUST match game.js contract
      mode: "BONUS"
    });


    this._runtime.runItemIds = [];
    this._runtime.runMode = "BONUS";
    this._runtime.lastAnswer = null;
    this._runtime.feedbackPending = false;
    this._runtime.feedbackReveal = true;
    if (this._runtime.feedbackRevealTimerId) {
      try { window.clearTimeout(this._runtime.feedbackRevealTimerId); } catch (_) { }
      this._runtime.feedbackRevealTimerId = null;
    }
    this._runtime.frozenItem = null;
    this._runtime.shareAnchorId = null;

    // micro-pics reset (run-only)
    if (this._runtime.microPics) {
      this._runtime.microPics.correctStreak = 0;
      this._runtime.microPics.flowTierShown = 0;
      this._runtime.microPics.survivalShown = false;
      this._runtime.microPics.lastToastAtCount = -999;
      this._runtime.microPics.lastDangerAtCount = -999;

      // Per-run memory: reset only at run start (not on chance loss)
      this._runtime.microPics.tierShownOnce = {
        start: false,
        building: false,
        strong: false,
        elite: false,
        legendary: false
      };

      let startChances = clampInt(cfg?.game?.maxChances, 1, 99);
      try {
        const gs = (this.game && typeof this.game.getState === "function") ? (this.game.getState() || {}) : {};
        if (gs.chancesLeft != null) startChances = clampInt(gs.chancesLeft, 0, 99);
      } catch (_) { /* keep cfg */ }
      this._runtime.microPics.prevChancesLeft = startChances;
    }

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

    // BONUS: overlay BEFORE setState so render()'s isOverlayVisible guard sees it
    const bonusExtra = {};
    if (!premium) {
      const limit = clampInt(cfg?.secretBonus?.freeRunsLimit, 0, 99);
      const used = (this.storage && typeof this.storage.getSecretBonusFreeRunsUsed === "function")
        ? Number(this.storage.getSecretBonusFreeRunsUsed())
        : 0;
      const remaining = Math.max(0, limit - used);
      const tpl = String(this.wording?.secretBonus?.startOverlayFreeRunsLimitLine || "").trim();
      if (tpl && limit > 0) {
        bonusExtra.bonusLimitLine = fillTemplate(tpl, { remaining, limit });
      }
    }
    showRunStartOverlay(cfg, this.wording, this.game, "BONUS", bonusExtra);
    this.setState(STATES.PLAYING);

  };


  UI.prototype._scheduleHudPulseCleanup = function () {
    if (!this._runtime) return;

    const ms = Number(this.config?.ui?.gameplayPulseMs);
    if (!Number.isFinite(ms) || ms <= 0) return;

    if (this._runtime.hudPulseCleanupTimerId) {
      try { window.clearTimeout(this._runtime.hudPulseCleanupTimerId); } catch (_) { }
      this._runtime.hudPulseCleanupTimerId = null;
    }

    // Clean up HUD pulse classes + deltas without full re-render (avoids layout shift).
    this._runtime.hudPulseCleanupTimerId = window.setTimeout(() => {
      if (!this._runtime) return;
      this._runtime.hudPulseCleanupTimerId = null;
      if (this.state !== STATES.PLAYING) return;
      if (this._runtime.gameOverPending === true) return;

      const root = this.appEl || document.getElementById("app");
      if (!root) { this.render(); return; }

      let cleaned = false;

      const chancePill = root.querySelector(".wt-pill--danger-pulse");
      if (chancePill) {
        chancePill.classList.remove("wt-pill--danger-pulse");
        const delta = chancePill.querySelector(".wt-pill__delta");
        if (delta) delta.remove();
        cleaned = true;
      }

      const scorePill = root.querySelector(".wt-pill--score-flash");
      if (scorePill) {
        scorePill.classList.remove("wt-pill--score-flash");
        const delta = scorePill.querySelector(".wt-pill__delta");
        if (delta) delta.remove();
        cleaned = true;
      }

      // Reset timestamps so next render() won't re-add them
      if (this._runtime.chanceLostPulseAt) this._runtime.chanceLostPulseAt = 0;
      if (this._runtime.scoreFlashAt) this._runtime.scoreFlashAt = 0;

      if (!cleaned) this.render();
    }, Math.floor(ms) + 30);
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
    try {
      const gsPrev = (this.game && typeof this.game.getState === "function") ? (this.game.getState() || {}) : {};
      if (gsPrev.chancesLeft != null) prevChancesLeft = Number(gsPrev.chancesLeft);
    } catch (_) { /* silent */ }

    const frozen = (this.game && typeof this.game.getCurrent === "function") ? this.game.getCurrent() : null;
    this._runtime.frozenItem = frozen;

    const picked = (choiceBool === true);
    const res = (this.game && typeof this.game.answer === "function") ? this.game.answer(picked) : null;

    // Flag a short-lived pulse when a chance is lost (CSS owns the actual animation)
    let chanceLost = false;
    let nowChancesLeft = null;

    try {
      const gsNow = (this.game && typeof this.game.getState === "function") ? (this.game.getState() || {}) : {};
      nowChancesLeft = (gsNow.chancesLeft != null) ? Number(gsNow.chancesLeft) : null;

      chanceLost = (
        prevChancesLeft != null &&
        nowChancesLeft != null &&
        Number.isFinite(prevChancesLeft) &&
        Number.isFinite(nowChancesLeft) &&
        nowChancesLeft < prevChancesLeft
      );

      this._runtime.chanceLostPulseAt = chanceLost ? Date.now() : 0;

      const lastChanceEntered = (
        prevChancesLeft != null &&
        nowChancesLeft != null &&
        Number.isFinite(prevChancesLeft) &&
        Number.isFinite(nowChancesLeft) &&
        (prevChancesLeft > 1) &&
        (nowChancesLeft === 1)
      );
      this._runtime.lastChancePulseAt = lastChanceEntered ? Date.now() : 0;
      // PRACTICE: no score flash (consolidation mode, no performance feedback)
      const isPracticeMode = (String(this._runtime?.runMode || "").trim() === "PRACTICE");
      this._runtime.scoreFlashAt = (!isPracticeMode && res && res.isCorrect === true) ? Date.now() : 0;
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


    // Chance state overlays only (Last chance / Game over). No "-1 chance" overlay.
    if (chanceLost && Number.isFinite(nowChancesLeft) && Number(nowChancesLeft) <= 1) {
      showChanceLostToast(this.config, this.wording, nowChancesLeft);
    }


    /// One-shot: first-time pool completion (200/200) celebration.
    // Source of truth: storage coverage + persisted "celebrated" flag (not transient engine signal).
    try {
      const isRunNow = (String(this._runtime?.runMode || "RUN").trim() === "RUN");
      if (isRunNow) {
        const exhausted =
          !!(this.storage && typeof this.storage.hasSeenAllWordTraps === "function" && this.storage.hasSeenAllWordTraps() === true);

        const alreadyCelebrated =
          !!(this.storage && typeof this.storage.hasPoolCompleteCelebrated === "function" && this.storage.hasPoolCompleteCelebrated() === true);

        if (exhausted && !alreadyCelebrated) {
          if (this.storage && typeof this.storage.markPoolCompleteCelebrated === "function") {
            this.storage.markPoolCompleteCelebrated();
          }

          if (this._runtime) this._runtime.poolCompleteCelebrationPending = true;
          this._finishRun();
          return;
        }
      }
    } catch (_) { }
    // Game over rule (RUN / PRACTICE only):
    // - Freeze immediately
    // - Transition to END is deferred for the *effective* chance-loss overlay duration
    const runModeNow = String(this._runtime?.runMode || "RUN").trim();
    const isGameOverNow =
      (runModeNow !== "BONUS") &&
      chanceLost &&
      Number.isFinite(nowChancesLeft) &&
      Number(nowChancesLeft) === 0;


    if (isGameOverNow) {
      // Sync HUD mistakes immediately (avoid stale "2/3" display on the final mistake)
      try {
        const root = this.appEl || document.getElementById("app");
        const pill = root ? root.querySelector(".wt-pill--chances") : null;

        if (pill && Number.isFinite(nowChancesLeft)) {
          const uiW = (this.wording && this.wording.ui) ? this.wording.ui : {};
          const label = String(uiW.mistakesLabel || "").trim();

          const gs = (this.game && typeof this.game.getState === "function") ? (this.game.getState() || {}) : {};
          const mcRaw = Number(gs.maxChances || this.config?.game?.maxChances);
          const mc = (Number.isFinite(mcRaw) && mcRaw > 0) ? Math.floor(mcRaw) : 0;

          const left = Math.max(0, Math.floor(Number(nowChancesLeft)));
          const mistakes = (mc > 0) ? Math.max(0, Math.min(mc, mc - left)) : 0;

          const visual = (mc > 0)
            ? Array(mc)
              .fill(null)
              .map((_, i) => (i < mistakes ? "\u25C9" : "\u25CE"))
              .join("")
            : "";

          const text = (label ? `${label}: ${mistakes}/${mc} ${visual}` : `${mistakes}/${mc} ${visual}`)
            .replace(/\s+/g, " ")
            .trim();

          pill.classList.remove("wt-pill--danger-pulse", "wt-pill--last-chance-pulse");
          pill.setAttribute("aria-label", label ? `${label}: ${mistakes}/${mc}` : `${mistakes}/${mc}`);
          pill.textContent = text;
        }
      } catch (_) { /* silent */ }

      // Block renders BEFORE recordAnswer: _save() → _emit() → onStorageUpdated is synchronous.
      // Without this, the dispatched event triggers render() while engine is done → blank screen.
      this._runtime.gameOverPending = true;
      // Normal path: record answer immediately
      // Guard: if this answer ends the game (any mode), block renders before recordAnswer
      // triggers the synchronous _save() → _emit() → onStorageUpdated() → render() chain.
      const isGameOverAnyMode = (
        chanceLost &&
        Number.isFinite(nowChancesLeft) &&
        Number(nowChancesLeft) === 0
      );
      if (isGameOverAnyMode) {
        this._runtime.gameOverPending = true;
      }

      if (this.storage && typeof this.storage.recordAnswer === "function") {
        this.storage.recordAnswer(res.itemId, res.isCorrect);
      }
      if (Number.isFinite(Number(res.itemId))) {
        const id = Number(res.itemId);
        this._runtime.runItemIds.push(id);
        if (res.isCorrect !== true) {
          if (!Array.isArray(this._runtime.runMistakeIds)) this._runtime.runMistakeIds = [];
          if (this._runtime.runMistakeIds.indexOf(id) === -1) this._runtime.runMistakeIds.push(id);
        }
      }

      // Factored: freeze -> delay -> _finishRun (all modes, same contract)
      // Note: _enterGameOverDelay sets gameOverPending = true again (idempotent, no harm)
      this._enterGameOverDelay();
      return;
    }

    // Normal path: record answer immediately
    if (this.storage && typeof this.storage.recordAnswer === "function") {
      this.storage.recordAnswer(res.itemId, res.isCorrect);
    }

    if (Number.isFinite(Number(res.itemId))) {
      const id = Number(res.itemId);
      this._runtime.runItemIds.push(id);

      // Track per-run mistakes for END recap (dedup)
      if (res.isCorrect !== true) {
        if (!Array.isArray(this._runtime.runMistakeIds)) this._runtime.runMistakeIds = [];
        if (this._runtime.runMistakeIds.indexOf(id) === -1) this._runtime.runMistakeIds.push(id);
      }
    }



    // micro-pics evaluation happens AFTER the answer is validated (this function is the validation point)
    try {
      this._maybeTriggerMicroPic(res);
    } catch (_) {
      // silent: micro-pics must never break gameplay
    }

    this._runtime.lastAnswer = {
      isCorrect: (res.isCorrect === true),
      pickedAnswer: picked,
      correctAnswer: (res.correctAnswer === true || res.correctAnswer === false) ? res.correctAnswer : null,
      feedbackLine: String(res.feedbackLine || "").trim()
    };

    // A11Y: announce answer feedback via dedicated live region (avoid full-screen aria-live churn)
    try {
      const liveEl = document.getElementById("answer-feedback");
      if (liveEl) {
        const pw = (this.wording && this.wording.playing) ? this.wording.playing : {};

        const verdictText = (res.isCorrect === true)
          ? String(pw.feedbackTitleOk || "").trim()
          : String(pw.feedbackTitleBad || "").trim();

        const termFr = String(frozen?.termFr || "").trim();
        const termEn = String(frozen?.termEn || "").trim();

        const relTpl = (res.correctAnswer === true)
          ? String(pw.feedbackRelationSameTemplate || "").trim()
          : String(pw.feedbackRelationDifferentTemplate || "").trim();

        const relation = (relTpl && termFr && termEn) ? fillTemplate(relTpl, { termFr, termEn }) : "";
        const explanation = String(res.feedbackLine || "").trim();

        const parts = [verdictText, relation, explanation].filter(Boolean);
        const msg = parts.join(". ").replace(/\s+/g, " ").trim();

        if (msg) {
          liveEl.textContent = "";
          window.setTimeout(() => { liveEl.textContent = msg; }, 0);
        }
      }
    } catch (_) { /* silent */ }

    const runMode = String(this._runtime?.runMode || "RUN").trim();
    const sbFeedback = String(this.config?.secretBonus?.feedback || "").trim();

    if (runMode === "BONUS") {
      // BONUS per-answer minimal feedback (no text): pulse chip green/red
      try {
        // Single source of truth: WT_CONFIG.ui.gameplayPulseMs (schema plat)
        const pulseMs = Number(this.config?.ui?.gameplayPulseMs);
        const fall = this._runtime?.secretBonusFall;
        const chipEl = fall && fall.chipEl;

        if (chipEl && chipEl.classList && Number.isFinite(pulseMs) && pulseMs > 0 && pulseMs <= 2000) {
          if (this._runtime.bonusChipPulseTimerId) {
            try { window.clearTimeout(this._runtime.bonusChipPulseTimerId); } catch (_) { }
            this._runtime.bonusChipPulseTimerId = null;
          }

          chipEl.classList.remove("wt-bonus-chip--pulse-ok", "wt-bonus-chip--pulse-bad");
          chipEl.style.animationDuration = `${Math.floor(pulseMs)}ms`;
          chipEl.classList.add((res.isCorrect === true) ? "wt-bonus-chip--pulse-ok" : "wt-bonus-chip--pulse-bad");

          this._runtime.bonusChipPulseTimerId = window.setTimeout(() => {
            chipEl.classList.remove("wt-bonus-chip--pulse-ok", "wt-bonus-chip--pulse-bad");
            chipEl.style.animationDuration = "";
            this._runtime.bonusChipPulseTimerId = null;
          }, Math.floor(pulseMs));
        }
      } catch (_) { }

      // Policy: none => no per-item overlays; BUT always allow "Game over" overlay before END (all modes).
      if (sbFeedback === "none") {
        this._runtime.feedbackPending = false;
        this._runtime.lastAnswer = null;
        this._runtime.frozenItem = null;
        this._runtime.finishAfterFeedback = false;

        this._runtime.answerLocked = false;

        if (res.done === true) {
          const endedByGameOver = (Number.isFinite(nowChancesLeft) && Number(nowChancesLeft) === 0);
          if (endedByGameOver) {
            this._enterGameOverDelay();
            return;
          }

          this._finishRun();
          return;
        }

        this.render();
        return;
      }

      // Policy: minimal => toasts only (chance loss + end), no per-item feedback screen
      // Single source of truth for toast timing: WT_CONFIG.ui.toast (schema plat; no hardcoded fallback)
      const timing = getToastTiming(this.config);

      const durationMs = timing ? timing.durationMs : null;

      // Chance-loss toast is handled centrally in UI.prototype.answer (all modes).

      // BONUS end toast:
      // - Deck exhausted: end because no more eligible words (chances may remain)
      // - Game over: end because chances reached 0
      if (res.done === true) {
        const endedByGameOver = (Number.isFinite(nowChancesLeft) && Number(nowChancesLeft) === 0);

        if (endedByGameOver) {
          this._enterGameOverDelay();
          return;
        }

        // Deck exhausted: show end toast, then transition to END after toast
        const msg = String(this.wording?.secretBonus?.endDeckExhaustedToast || "").trim();

        const hasToast = !!(msg && durationMs != null);
        const toastMs = hasToast ? Math.max(0, Math.floor(durationMs)) : 0;

        if (hasToast) {
          cancelScheduledToast();

          if (this._beforeUnloadHandler) {
            window.removeEventListener("beforeunload", this._beforeUnloadHandler);
            this._beforeUnloadHandler = null;
          }
          showToast(msg, { durationMs: toastMs });
        }

        this._runtime.feedbackPending = false;
        this._runtime.lastAnswer = null;
        this._runtime.frozenItem = null;
        this._runtime.finishAfterFeedback = false;
        this._runtime.answerLocked = false;

        // Delay END until toast finishes (avoid _finishRun() cancelling it immediately)
        if (hasToast && toastMs > 0) {
          if (this._runtime.bonusEndTimerId) {
            try { window.clearTimeout(this._runtime.bonusEndTimerId); } catch (_) { }
            this._runtime.bonusEndTimerId = null;
          }

          this._runtime.bonusEndTimerId = window.setTimeout(() => {
            if (this._runtime) this._runtime.bonusEndTimerId = null;
            this._finishRun();
          }, toastMs);

          return;
        }

        this._finishRun();
        return;
      }
      // No feedback screen: immediately continue to next item
      this._runtime.feedbackPending = false;
      this._runtime.lastAnswer = null;
      this._runtime.frozenItem = null;
      this._runtime.finishAfterFeedback = false;

      this._runtime.answerLocked = false;
      this.render();
      return;
    }

    // Default flow (Option A): show feedback and wait for Continue.
    // UX: if a chance was lost, give Chances a short solo moment before showing the feedback block.
    if (this._runtime.feedbackRevealTimerId) {
      try { window.clearTimeout(this._runtime.feedbackRevealTimerId); } catch (_) { }
      this._runtime.feedbackRevealTimerId = null;
    }

    this._runtime.feedbackPending = true;

    // If last item, do NOT end immediately. End after Continue.
    this._runtime.finishAfterFeedback = (res.done === true);

    // Single source of truth for timing: WT_CONFIG.ui.toast (schema plat)
    const timing = getToastTiming(this.config);
    const focusMs = timing ? Number(timing.delayMs) : NaN;

    // UX: only apply the "solo moment" if timing is explicitly valid in WT_CONFIG.ui.toast
    if (chanceLost && Number.isFinite(focusMs) && focusMs > 0) {
      this._runtime.feedbackReveal = false;
      this.render();

      this._runtime.feedbackRevealTimerId = window.setTimeout(() => {
        if (!this._runtime) return;
        if (this.state !== STATES.PLAYING) return;
        if (this._runtime.feedbackPending !== true) return;

        this._runtime.feedbackRevealTimerId = null;
        this._runtime.feedbackReveal = true;
        this.render();
      }, Math.floor(focusMs));

      return;
    }

    this._runtime.feedbackReveal = true;
    this.render();
  };



  UI.prototype.continueAfterFeedback = function () {
    if (this.state !== STATES.PLAYING) return;
    if (!this._runtime || !this._runtime.feedbackPending) return;

    const shouldFinish = (this._runtime.finishAfterFeedback === true);

    // leaving feedback: cancel any pending (not-yet-shown) toast to avoid cross-state surprises
    cancelScheduledToast();

    if (this._runtime.feedbackRevealTimerId) {
      try { window.clearTimeout(this._runtime.feedbackRevealTimerId); } catch (_) { }
      this._runtime.feedbackRevealTimerId = null;
    }

    this._runtime.feedbackPending = false;
    this._runtime.feedbackReveal = true;
    this._runtime.lastAnswer = null;
    this._runtime.frozenItem = null;
    this._runtime.finishAfterFeedback = false;

    // unlock answers for next item
    this._runtime.answerLocked = false;

    // Clear stale pulse timestamps + cancel cleanup timer (prevents animation restart on next render)
    this._runtime.chanceLostPulseAt = 0;
    this._runtime.scoreFlashAt = 0;
    if (this._runtime.hudPulseCleanupTimerId) {
      try { window.clearTimeout(this._runtime.hudPulseCleanupTimerId); } catch (_) { }
      this._runtime.hudPulseCleanupTimerId = null;
    }

    if (shouldFinish) {
      this._finishRun();
      return;
    }

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
  //   - Show the overlay BEFORE calling this (showChanceLostToast)
  //   - Record the answer to storage BEFORE calling this
  //   - Sync HUD if needed BEFORE calling this
  UI.prototype._enterGameOverDelay = function () {
    if (!this._runtime) { this._finishRun(); return; }

    // 1. Block renders
    this._runtime.gameOverPending = true;

    // 2. Lock input
    this._runtime.answerLocked = true;

    // 3. Stop fall animation (idempotent if not running / not BONUS)
    this._secretBonusFallStop();

    // 4. Cancel overlay auto-hide timer
    if (chanceLostOverlayTimer) {
      clearTimeout(chanceLostOverlayTimer);
      chanceLostOverlayTimer = null;
    }

    // 5. Clear feedback state
    this._runtime.feedbackPending = false;
    this._runtime.feedbackReveal = true;
    this._runtime.lastAnswer = null;
    this._runtime.frozenItem = null;
    this._runtime.finishAfterFeedback = false;

    // 6. Cancel pending feedback-reveal timer
    if (this._runtime.feedbackRevealTimerId) {
      try { window.clearTimeout(this._runtime.feedbackRevealTimerId); } catch (_) { }
      this._runtime.feedbackRevealTimerId = null;
    }

    // 7. Schedule _finishRun after overlay duration
    // Duration source of truth: WT_CONFIG.ui.chanceLostOverlayMs + gameplayPulseMs (game over extension)
    const baseDurationMs = Number(this.config?.ui?.chanceLostOverlayMs);

    if (Number.isFinite(baseDurationMs) && baseDurationMs >= 200 && baseDurationMs <= 3000) {
      let durationMs = baseDurationMs;

      const extraMs = Number(this.config?.ui?.gameplayPulseMs);
      if (Number.isFinite(extraMs) && extraMs >= 0 && extraMs <= 2000) {
        durationMs = baseDurationMs + Math.floor(extraMs);
      }
      if (durationMs > 3000) durationMs = 3000;

      // Cancel any existing end timer (idempotent)
      if (this._runtime.bonusEndTimerId) {
        try { window.clearTimeout(this._runtime.bonusEndTimerId); } catch (_) { }
        this._runtime.bonusEndTimerId = null;
      }

      window.setTimeout(() => {
        if (this.state !== STATES.PLAYING) return;
        if (this._runtime) this._runtime.gameOverPending = false;
        this._finishRun();
      }, Math.floor(durationMs));
    } else {
      // Fail-safe: invalid config → end immediately
      this._runtime.gameOverPending = false;
      this._finishRun();
    }
  };

  UI.prototype._finishRun = function () {
    // Idempotent: if we're already in END, do nothing (prevents "double END screen" from late timers)
    if (this.state === STATES.END) return;

    // Block storage-triggered renders during _finishRun (recordRunComplete + markPostCompletion
    // both call _save() → _emit() → onStorageUpdated() → render() while still in PLAYING).
    if (this._runtime) this._runtime.finishingRun = true;
    // Always cancel any scheduled end-of-run timers BEFORE switching screens
    // (prevents a late timer from calling _finishRun() again)
    try {
      if (this._runtime && this._runtime.bonusEndTimerId) {
        window.clearTimeout(this._runtime.bonusEndTimerId);
        this._runtime.bonusEndTimerId = null;
      }
    } catch (_) { /* silent */ }

    // Cancel pending overlays — but KEEP chance-lost overlay visible during PLAYING→END fade.
    // Design: the overlay stays on screen so the user never sees naked PLAYING underneath.
    // render() hides it on END entry (line ~4976: state !== PLAYING → hideChanceLostOverlay).
    if (toastShowTimer) { clearTimeout(toastShowTimer); toastShowTimer = null; }
    if (gameplayOverlayShowTimer) { clearTimeout(gameplayOverlayShowTimer); gameplayOverlayShowTimer = null; }
    hideGameplayOverlay();
    hideRunStartOverlay();
    // Chance-lost overlay: kill auto-hide timer only (overlay stays visible through fade).
    if (chanceLostOverlayTimer) { clearTimeout(chanceLostOverlayTimer); chanceLostOverlayTimer = null; }

    // Remove accidental-close guard (runs set beforeunload at run start)
    if (this._beforeUnloadHandler) {
      window.removeEventListener("beforeunload", this._beforeUnloadHandler);
      this._beforeUnloadHandler = null;
    }

    // Stop secret bonus fall loop if running
    this._secretBonusFallStop();

    // Snapshot result BEFORE clearing runtime
    const gameState = this.game.getState ? this.game.getState() : {};
    const scoreFP = Number(gameState.scoreFP || 0);
    const maxChances = Number(gameState.maxChances || this.config?.game?.maxChances || 0);
    const chancesLeft = (gameState.chancesLeft != null) ? Number(gameState.chancesLeft) : null;

    const mode = String(this._runtime?.runMode || "RUN").trim();

    // Single source of truth: storage.js (V2)
    // - PB + history are handled by StorageManager.recordRunComplete()

    let newBest = false;
    let bestScoreFP = 0;

    if (mode === "RUN" && this.storage && typeof this.storage.recordRunComplete === "function") {
      const prevRunNumber = (typeof this.storage.getRunNumber === "function")
        ? Number(this.storage.getRunNumber() || 0)
        : 0;

      const nextRunNumber = Math.max(0, Math.floor(prevRunNumber)) + 1;

      const res = this.storage.recordRunComplete(nextRunNumber, scoreFP, {
        mode: "RUN",
        maxChances: Number(maxChances || 0),
        chancesLeft: (chancesLeft == null) ? null : Number(chancesLeft),
        endedFrom: "ui"
      });

      newBest = !!(res && res.newBest);
      bestScoreFP = Number(res && res.bestScoreFP || 0);
    }

    // Store for END screen
    this._runtime.lastRun = {
      mode,
      scoreFP,
      maxChances,
      chancesLeft,
      newBest,
      bestScoreFP,
      bestStreak: clampInt(this._runtime.microPics?.maxCorrectStreak, 0, 9999),
      mistakeIds: Array.isArray(this._runtime.runMistakeIds) ? this._runtime.runMistakeIds.slice() : [],
      runItemIds: Array.isArray(this._runtime.runItemIds) ? this._runtime.runItemIds.slice() : [],
      poolCompleteCelebration: !!this._runtime?.poolCompleteCelebrationPending
    };

    // Consume one-shot runtime flag
    if (this._runtime) this._runtime.poolCompleteCelebrationPending = false;


    // Clear feedback state
    this._runtime.feedbackPending = false;
    this._runtime.lastAnswer = null;
    this._runtime.frozenItem = null;
    this._runtime.finishAfterFeedback = false;
    this._runtime.answerLocked = false;

    // BONUS returns to END (no separate BONUS_END state)
    // Post-completion reveal: once the user has seen all word traps,
    // persist the "seen once" flag so it can appear on LANDING too.
    try {
      const exhausted =
        !!(this.storage && typeof this.storage.hasSeenAllWordTraps === "function" && this.storage.hasSeenAllWordTraps() === true);

      if (exhausted && this.storage && typeof this.storage.markPostCompletionSeenOnce === "function") {
        this.storage.markPostCompletionSeenOnce();
      }
    } catch (_) { /* silent */ }

    const fromPlaying = (this.state === STATES.PLAYING);

    // Default behavior (BONUS -> END, etc.)
    if (!fromPlaying) {
      if (this._runtime) this._runtime.finishingRun = false;
      this.setState(STATES.END);
      return;
    }

    // Respect reduced motion
    let reduceMotion = false;
    try {
      reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch (_) {
      reduceMotion = false;
    }

    const app = el("app");
    if (!app || reduceMotion) {
      if (this._runtime) this._runtime.finishingRun = false;
      this.setState(STATES.END);
      return;
    }

    const FADE_MS = 200;

    try {
      app.classList.add("transitioning"); // block interactions during fade
      app.classList.add("wt-fade");
      app.classList.remove("wt-fade--in");
      app.classList.add("wt-fade--out");
    } catch (_) {
      if (this._runtime) this._runtime.finishingRun = false;
      this.setState(STATES.END);
      return;
    }

    window.setTimeout(() => {
      if (this._runtime) this._runtime.finishingRun = false;
      this.setState(STATES.END);

      window.setTimeout(() => {
        const a = el("app");
        if (!a) return;

        try {
          a.classList.add("wt-fade");
          a.classList.remove("wt-fade--out");
          a.classList.add("wt-fade--in");
        } catch (_) { }

        window.setTimeout(() => {
          const b = el("app");
          if (!b) return;
          try {
            b.classList.remove("wt-fade");
            b.classList.remove("wt-fade--out");
            b.classList.remove("wt-fade--in");
            b.classList.remove("transitioning"); // restore interactions
          } catch (_) { }

        }, FADE_MS + 40);
      }, 0);
    }, FADE_MS);
  };


  // ============================================
  // Paywall
  // ============================================

  UI.prototype._startPaywallTicker = function () {
    // No fallback: ticker runs only if explicitly configured (prevents hidden defaults).
    const ms = Number(this.config?.ui?.paywallTickerMs);
    if (!Number.isFinite(ms) || ms < 200 || ms > 2000) return;

    // Ensure single ticker
    this._stopPaywallTicker();

    this._paywallTickerId = window.setInterval(() => {
      // Only tick while on PAYWALL or LANDING (LANDING shows the timer only after PAYWALL)
      if (this.state !== STATES.PAYWALL && this.state !== STATES.LANDING) return;

      // Stop ticking once EARLY is over (render one last time to show STANDARD state)
      let ep = null;
      if (this.storage && typeof this.storage.getEarlyPriceState === "function") {
        try { ep = this.storage.getEarlyPriceState() || null; } catch (_) { ep = null; }
      }

      const isEarly =
        !!(ep && String(ep.phase || "").toUpperCase() === "EARLY" && Number(ep.remainingMs || 0) > 0);

      this.render();

      if (!isEarly) {
        this._stopPaywallTicker();
      }
    }, Math.floor(ms));
  };



  UI.prototype._stopPaywallTicker = function () {
    if (!this._paywallTickerId) return;
    window.clearInterval(this._paywallTickerId);
    this._paywallTickerId = null;
  };

  UI.prototype.checkout = function (priceKey) {
    if (!isOnline()) {
      const msg = String(this.wording?.system?.offlinePayment || "").trim();
      if (msg) toastNow(this.config, msg);
      return;
    }

    if (this.storage && typeof this.storage.markCheckoutStarted === "function") {
      this.storage.markCheckoutStarted();
    }

    const cfg = this.config || {};
    const key = String(priceKey || "").toUpperCase();

    const url = (key === "EARLY")
      ? String(cfg.stripeEarlyPaymentUrl || "").trim()
      : String(cfg.stripeStandardPaymentUrl || "").trim();

    if (!url) return;

    // Security: validate Stripe domain before redirect
    try {
      const urlObj = new URL(url);
      const allowedHosts = ["buy.stripe.com", "checkout.stripe.com"];
      if (!allowedHosts.includes(urlObj.hostname)) {
        console.error("[WT Security] Invalid Stripe URL hostname:", urlObj.hostname);
        return;
      }
    } catch (_) {
      console.error("[WT Security] Invalid Stripe URL:", url);
      return;
    }

    window.location.href = url;

  };

  // (deleted) legacy share-clicked event removed per spec

  // Single source of truth for share text (used by preview + copy)
  UI.prototype._getShareText = function () {
    const cfg = this.config || {};
    const shareCfg = cfg.share || {};
    if (!shareCfg.enabled) return "";

    const w = this.wording || {};
    const share = w.share || {};

    const identity = cfg.identity || {};
    const appName = String(identity.appName || "").trim();
    const url = String(identity.appUrl || "").trim();

    const poolSize = clampInt(cfg?.game?.poolSize, 1, 9999);
    const maxChances = clampInt(cfg?.game?.maxChances, 1, 99);

    const lastRun = (this._runtime && this._runtime.lastRun) ? this._runtime.lastRun : {};

    // Share is RUN-only to avoid mixing score semantics (BONUS/PRACTICE).
    if (String(lastRun.mode || "RUN").trim() !== "RUN") return "";

    const scoreFP = clampInt(lastRun.scoreFP, 0, 99999);

    // Curiosity-gap share: "Can you guess?" framing (nudge psychology).
    // Priority: pick a false friend (trap) for maximum surprise.
    // Fallback: pick a true friend if no traps were in the run.
    // Source of truth: lastRun.mistakeIds + lastRun.runItemIds (stored in _finishRun()).
    let funFact = "";
    try {
      const items = Array.isArray(this._runtime?.contentItems) ? this._runtime.contentItems : [];
      const allIds = Array.isArray(lastRun.runItemIds) ? lastRun.runItemIds : [];

      if (items.length > 0 && allIds.length > 0) {
        // Pick the best item for a "Can you guess?" teaser:
        // 1) Last mistake (trap the player fell for → most surprising)
        // 2) Any trap from the run (even if answered correctly)
        // 3) Any item from the run (true friend fallback)
        const mistakeIds = Array.isArray(lastRun.mistakeIds) ? lastRun.mistakeIds : [];
        const findItem = (id) => items.find(x => Number(x?.id) === Number(id)) || null;

        let pick = null;

        // Strategy 1: last mistake
        if (mistakeIds.length > 0) {
          pick = findItem(mistakeIds[mistakeIds.length - 1]);
        }

        // Strategy 2: any trap from the run
        if (!pick) {
          for (let i = allIds.length - 1; i >= 0; i--) {
            const it = findItem(allIds[i]);
            if (it && it.correctAnswer === false) { pick = it; break; }
          }
        }

        // Strategy 3: any item (true friend)
        if (!pick) {
          pick = findItem(allIds[allIds.length - 1]);
        }

        if (pick) {
          const termFr = String(pick.termFr || "").trim();
          const termEn = String(pick.termEn || "").trim();
          const isTrap = (pick.correctAnswer === false);

          if (termFr && termEn) {
            const tpls = isTrap
              ? (Array.isArray(share.funFactTemplatesTrap) ? share.funFactTemplatesTrap : [])
              : (Array.isArray(share.funFactTemplatesTrue) ? share.funFactTemplatesTrue : []);
            const tpl = (tpls.length > 0) ? String(tpls[0] || "").trim() : "";

            if (tpl) {
              funFact = tpl
                .replaceAll("{termFr}", termFr)
                .replaceAll("{termEn}", termEn);
            }
          }
        }
      }
    } catch (_) {
      funFact = "";
    }


    const template = String(share.template || "").trim();
    if (!template) return "";

    const text = template
      .replaceAll("{appName}", appName)
      .replaceAll("{url}", url)
      .replaceAll("{poolSize}", String(poolSize))
      .replaceAll("{maxChances}", String(maxChances))
      .replaceAll("{score}", String(scoreFP))
      .replaceAll("{funFact}", funFact);

    this._runtime = this._runtime || {};
    this._runtime.lastShareText = text;

    return text;
  };

  UI.prototype.copyShareText = async function () {
    const text = String(this._getShareText() || "").trim();
    if (!text) return;

    const w = this.wording || {};
    const share = w.share || {};

    try {
      await navigator.clipboard.writeText(text);
      if (this.storage && typeof this.storage.markShareClicked === "function") {
        this.storage.markShareClicked();
      }
      const okMsg = String(share.toastCopied || "").trim();
      if (okMsg) toastNow(this.config, okMsg);      // no legacy event
    } catch (_) {
      toastNow(this.config, String(w.system?.copyFailed || "").trim());
    }
  };

  UI.prototype.sendShareViaEmail = function () {
    const w = this.wording || {};
    const share = w.share || {};

    const subjectRaw = String(share.emailSubject || "").trim();
    if (!subjectRaw) return;

    const text = String(this._getShareText() || "").trim();
    if (!text) return;

    const subject = encodeURIComponent(subjectRaw);
    const body = encodeURIComponent(text);

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };


  // ============================================
  // Mistakes only toggle (Landing)
  // ============================================
  UI.prototype.toggleMistakesOnly = function () {
    if (!this.storage) return;

    const cfg = this.config || {};
    const moCfg = cfg.mistakesOnly || {};
    if (!moCfg.enabled) return;

    const premiumOnly = (moCfg.premiumOnly === true);
    const premium = (typeof this.storage.isPremium === "function") ? this.storage.isPremium() : false;

    if (premiumOnly && !premium) {
      this.setState(STATES.PAYWALL);
      return;
    }

    const on = (typeof this.storage.getMistakesOnly === "function") ? this.storage.getMistakesOnly() : false;
    if (typeof this.storage.setMistakesOnly === "function") {
      this.storage.setMistakesOnly(!on);
    }
  };

  // ============================================
  // Support modal
  // ============================================
  UI.prototype.openSupportModal = function () {
    const w = this.wording || {};
    const support = w.support || {};

    const cfg = this.config || {};
    const prefix = String(cfg?.support?.subjectPrefix || "").trim();

    // Source of truth: email.js decodes the obfuscated email safely.
    const email = String(window.WT_Email?.getSupportEmailDecoded?.() || "").trim();
    if (!email) {
      const msg = String(this.wording?.system?.copyFailed || "").trim();
      if (msg) toastNow(this.config, msg);
      return;
    }

    const html = `
    <p>${escapeHtml(String(support.modalBodyLine1 || "").trim())}</p>
    <p class="wt-muted">${escapeHtml(String(support.modalBodyLine2 || "").trim())}</p>

    <div class="wt-divider"></div>

    <div class="wt-code">
      <code id="wt-support-email">${escapeHtml(email)}</code>
    </div>

      <div class="wt-actions">
      <button class="wt-btn wt-btn--secondary" data-action="copy-support-email">${escapeHtml(String(support.ctaCopy || "").trim())}</button>
      <button class="wt-btn wt-btn--primary" data-action="open-support-email">${escapeHtml(String(support.ctaOpen || "").trim())}</button>
    </div>

  `;

    this.openModal(html, String(support.modalTitle || "").trim());


    // Cache runtime values for global data-action router
    if (this._runtime) {
      this._runtime.supportEmail = email;
      this._runtime.supportSubjectPrefix = prefix;
    }
  };


  UI.prototype.copySupportEmail = async function () {
    const email = String(this._runtime?.supportEmail || "").trim();
    if (!email) return;

    try {
      await navigator.clipboard.writeText(email);
      toastNow(this.config, String(this.wording?.system?.copied || "").trim());
    } catch (_) {
      toastNow(this.config, String(this.wording?.system?.copyFailed || "").trim());
    }
  };


  UI.prototype.openSupportEmailApp = function () {
    const email = String(this._runtime?.supportEmail || "").trim();
    if (!email) return;

    const prefix = String(this._runtime?.supportSubjectPrefix || "").trim();

    const w = this.wording || {};
    const support = w.support || {};
    const suffix = String(support.emailSubjectSuffix || "").trim(); // e.g. "Feedback"
    if (!suffix && this.config?.debug?.enabled) {
      console.warn("[WT_UI] Missing required copy: WT_WORDING.support.emailSubjectSuffix");
    }

    const subjectText = suffix ? `${prefix} ${suffix}`.trim() : prefix;
    const subject = encodeURIComponent(subjectText);

    const tpl = String(support.emailBodyTemplate || "").trim();
    const body = tpl ? `&body=${encodeURIComponent(tpl)}` : "";

    window.location.href = `mailto:${encodeURIComponent(email)}?subject=${subject}${body}`;

    this.closeModal();
  };



  // ============================================
  // Pool complete (one-shot modal on END entry)
  // ============================================
  UI.prototype.openPoolCompleteModal = function () {
    const w = this.wording || {};
    const end = w.end || {};
    const sys = w.system || {};

    const title = String(end.poolCompleteTitle || "").trim();
    const line1 = String(end.poolCompleteLine1 || "").trim();
    const line2 = String(end.poolCompleteLine2 || "").trim();
    const cta = String(sys.continue || "").trim();

    // Fail-closed: if required copy is missing, do nothing.
    if (!title || !cta) return;

    const html = `
      ${line1 ? `<p>${escapeHtml(line1)}</p>` : ``}
      ${line2 ? `<p class="wt-muted">${escapeHtml(line2)}</p>` : ``}

      <div class="wt-divider"></div>

      <div class="wt-actions" style="margin-top:14px">
        <button class="wt-btn wt-btn--primary" data-action="close-modal">${escapeHtml(cta)}</button>
      </div>
    `;

    this.openModal(html, title);
  };



  // ============================================
  // Waitlist (mailto, no backend)
  // ============================================
  UI.prototype.openWaitlistModal = function () {
    const cfg = this.config || {};
    const wlCfg = cfg.waitlist || {};
    if (wlCfg.enabled !== true) return;

    const w = this.wording || {};
    const wl = w.waitlist || {};

    const title = String(wl.title || "").trim();
    const body1 = String(wl.bodyLine1 || "").trim();
    const body2 = String(wl.bodyLine2 || "").trim();
    const label = String(wl.inputLabel || wl.inputPlaceholder || "").trim();
    const placeholder = String(wl.inputPlaceholder || "").trim();
    const cta = String(wl.cta || "").trim();

    // No fallback: requires configured obfuscated email
    const toEmail = decodeHtmlEntities(String(wlCfg.toEmailObfuscated || "").trim());
    if (!toEmail) return;

    // Persist "seen" (used by one-shot modal + future UX gating)
    try {
      if (this.storage && typeof this.storage.getWaitlistStatus === "function" && typeof this.storage.setWaitlistStatus === "function") {
        const st = String(this.storage.getWaitlistStatus() || "").trim();
        if (st === "not_seen") this.storage.setWaitlistStatus("seen");
      }
    } catch (_) { /* silent */ }

    const phAttr = placeholder ? ` placeholder="${escapeHtml(placeholder)}"` : "";

    const html = `
      ${body1 ? `<p>${escapeHtml(body1)}</p>` : ``}
      ${body2 ? `<p class="wt-muted">${escapeHtml(body2)}</p>` : ``}

      <div class="wt-divider"></div>

      <label class="wt-label" for="wt-waitlist-idea">${escapeHtml(label)}</label>
      <textarea id="wt-waitlist-idea" class="wt-input" rows="3"${phAttr}></textarea>

      <div class="wt-actions" style="margin-top:14px">
        <button class="wt-btn wt-btn--primary" data-action="send-waitlist-email">${escapeHtml(cta)}</button>
        <button class="wt-btn wt-btn--ghost" data-action="close-modal">${escapeHtml(String(this.wording?.system?.close || "").trim())}</button>
      </div>
    `;

    this.openModal(html, title);

    // Restore + persist draft while typing (device-local)
    try {
      const input = this.modalContentEl ? this.modalContentEl.querySelector("#wt-waitlist-idea") : null;

      if (input && this.storage && typeof this.storage.getWaitlistDraftIdea === "function") {
        const draft = String(this.storage.getWaitlistDraftIdea() || "").trim();
        if (draft) input.value = draft;
      }

      if (input && this.storage && typeof this.storage.setWaitlistDraftIdea === "function") {
        input.addEventListener("input", () => {
          try { this.storage.setWaitlistDraftIdea(String(input.value || "")); } catch (_) { /* silent */ }
        });
      }
    } catch (_) { /* silent */ }
  };

  UI.prototype.sendWaitlistViaEmail = function () {
    const cfg = this.config || {};
    const wlCfg = cfg.waitlist || {};
    if (wlCfg.enabled !== true) return;

    const toEmail = decodeHtmlEntities(String(wlCfg.toEmailObfuscated || "").trim());
    if (!toEmail) return;

    // Prefix comes from config; suffix comes from wording (no hardcoded "Waitlist")
    const prefix = String(wlCfg.subjectPrefix || "").trim();
    if (!prefix) return;

    const w = this.wording || {};
    const wl = w.waitlist || {};
    const suffix = String(wl.emailSubjectSuffix || "").trim();
    if (!suffix && this.config?.debug?.enabled) {
      console.warn("[WT_UI] Missing required copy: WT_WORDING.waitlist.emailSubjectSuffix");
    }

    const subjectText = suffix ? `${prefix} ${suffix}`.trim() : prefix;
    const subject = encodeURIComponent(subjectText);

    const input = this.modalContentEl ? this.modalContentEl.querySelector("#wt-waitlist-idea") : null;
    const idea = String(input && input.value ? input.value : "").trim();

    const tpl = String(wl.emailBodyTemplate || "").trim();
    const bodyText = tpl ? tpl.replaceAll("{idea}", idea) : idea;
    const body = encodeURIComponent(bodyText ? bodyText : "");

    // Persist "joined" on explicit user intent (clicked Send)
    try {
      if (this.storage && typeof this.storage.setWaitlistStatus === "function") {
        this.storage.setWaitlistStatus("joined");
      }
      if (this.storage && typeof this.storage.setWaitlistDraftIdea === "function") {
        this.storage.setWaitlistDraftIdea("");
      }
    } catch (_) { /* silent */ }

    window.location.href = `mailto:${encodeURIComponent(toEmail)}?subject=${subject}&body=${body}`;

    // Close modal (no claim about email being sent)
    this.closeModal();
  };


  // ============================================
  // Anonymous Stats Payload (opt-in sharing)
  // ============================================


  UI.prototype._getStatsPayloadWithTerms = function () {
    const storage = this.storage;
    if (!storage || typeof storage.getAnonymousStatsPayload !== "function") return null;

    let base = null;
    try { base = storage.getAnonymousStatsPayload(); } catch (_) { base = null; }
    if (!base || typeof base !== "object") return null;

    // Defensive copy (avoid mutating StorageManager payload)
    let payload = null;
    try { payload = JSON.parse(JSON.stringify(base)); } catch (_) { payload = null; }
    if (!payload || typeof payload !== "object") return null;

    const byId = (this._runtime && this._runtime.contentById) ? this._runtime.contentById : Object.create(null);

    if (Array.isArray(payload.topMistakes)) {
      payload.topMistakes = payload.topMistakes.map((m) => {
        const idNum = Number(m && m.id);
        const idKey = String(Number.isFinite(idNum) ? idNum : (m && m.id != null ? m.id : "")).trim();

        const it = idKey ? byId[idKey] : null;
        const termFr = String(it && it.termFr != null ? it.termFr : "").trim();
        const termEn = String(it && it.termEn != null ? it.termEn : "").trim();

        return {
          id: Number.isFinite(idNum) ? idNum : m && m.id,
          wrongCount: m && m.wrongCount,
          termFr: termFr,
          termEn: termEn
        };
      });
    }

    return payload;
  };


  UI.prototype.openStatsSharingModal = function () {
    const w = this.wording || {};
    const ss = w.statsSharing || {};
    const cfg = this.config || {};

    if (!cfg.statsSharing?.enabled) return;

    const payload = this._getStatsPayloadWithTerms();
    if (!payload) {
      const msg = String(ss.noStatsToast || "").trim();
      if (!msg && this.config?.debug?.enabled) {
        console.warn("[WT_UI] Missing required copy: WT_WORDING.statsSharing.noStatsToast");
      }
      if (msg) toastNow(this.config, msg);
      return;
    }


    const jsonStr = JSON.stringify(payload, null, 2);

    const html = `
      <p>${escapeHtml(String(ss.modalDescription || "").trim())}</p>

      <div class="wt-divider"></div>

      <strong class="wt-meta">${escapeHtml(String(ss.previewLabel || "").trim())}</strong>
      <pre class="wt-code" style="text-align:left; font-size:12px; overflow-x:auto; white-space:pre-wrap; word-break:break-all; max-height:200px;">${escapeHtml(jsonStr)}</pre>

      <div class="wt-actions" style="margin-top:16px">
        <button class="wt-btn wt-btn--primary" data-action="send-stats-email">${escapeHtml(String(ss.ctaSend || "").trim())}</button>
        <button class="wt-btn wt-btn--secondary" data-action="copy-stats">${escapeHtml(String(ss.ctaCopy || "").trim())}</button>
        <button class="wt-btn wt-btn--ghost" data-action="snooze-stats">${escapeHtml(String(ss.ctaLater || "").trim())}</button>
        <button class="wt-btn wt-btn--ghost" data-action="close-modal">${escapeHtml(String(ss.ctaCancel || "").trim())}</button>
      </div>
    `;

    this.openModal(html, String(ss.modalTitle || "").trim());
  };






  UI.prototype.sendStatsViaEmail = function () {
    const cfg = this.config || {};
    const w = this.wording || {};
    const ss = w.statsSharing || {};

    const email = String(window.WT_Email?.getSupportEmailDecoded?.() || "").trim();
    if (!email) return;

    const subject = encodeURIComponent(String(cfg?.statsSharing?.emailSubject || "").trim());

    const payload = this._getStatsPayloadWithTerms();
    if (!payload) return;

    const body = encodeURIComponent(JSON.stringify(payload, null, 2));

    window.location.href = `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`;


    // No semantic overclaim: mailto opens a draft; it does not guarantee sending.
    this.closeModal();

  };


  UI.prototype.copyStatsToClipboard = async function () {
    const w = this.wording || {};
    const ss = w.statsSharing || {};

    const payload = this._getStatsPayloadWithTerms();
    if (!payload) return;

    const jsonStr = JSON.stringify(payload, null, 2);

    try {
      await navigator.clipboard.writeText(jsonStr);
      toastNow(this.config, String(ss.copyToast || "").trim());
    } catch (_) {
      toastNow(this.config, String(w.system?.copyFailed || "").trim());
    }
  };


  UI.prototype._maybePromptStatsSharingMilestone = function () {
    const cfg = this.config || {};
    const ssCfg = cfg.statsSharing || {};
    if (ssCfg.enabled !== true) return;

    const storage = this.storage;
    if (!storage) return;

    // Snooze gate ("Show me later"): do not prompt until at least next END (after 1 more completed run)
    let stats = null;
    try {
      stats = (typeof storage.getAnonymousStatsPayload === "function") ? storage.getAnonymousStatsPayload() : null;
    } catch (_) {
      stats = null;
    }
    if (!stats) return;

    const runCompletes = clampInt(Number(stats.runs), 0, 999999);

    try {
      const snoozeUntil = getStatsSharingSnoozeUntilRunCompletes(storage);
      if (Number.isFinite(snoozeUntil) && snoozeUntil > runCompletes) return;
    } catch (_) { /* silent */ }

    // Optional gate: only after pool exhaustion
    if (ssCfg.afterPoolExhaustedOnly === true) {
      if (typeof storage.hasSeenAllWordTraps !== "function" || storage.hasSeenAllWordTraps() !== true) return;
    }

    // Triggers (bitmask)
    const BIT_30 = 1;
    const BIT_50 = 2;
    const BIT_LAST_FREE = 4;
    const BIT_POWER = 8;

    const thresholds = Array.isArray(ssCfg.promptThresholdsPct) ? ssCfg.promptThresholdsPct.slice() : [];
    const pct30 = Number(thresholds[0]);
    const pct50 = Number(thresholds[1]);

    const poolProgress = Number(stats.poolProgress); // 0..1 unique coverage
    if (!Number.isFinite(poolProgress)) return;

    const uniquePct = Math.floor(poolProgress * 100);

    const uniqueSeen = Number(stats.uniqueSeen);
    const isPremium = (typeof storage.isPremium === "function") ? (storage.isPremium() === true) : !!(stats.isPremium);

    const runsBalance = (typeof storage.getRunsBalance === "function") ? clampInt(storage.getRunsBalance(), 0, 999999) : 0;

    const powerUnique = Number(ssCfg.powerUserUniqueSeen);
    const powerRuns = Number(ssCfg.powerUserRunCompletes);
    const powerEligible =
      (Number.isFinite(uniqueSeen) && Number.isFinite(powerUnique) && uniqueSeen >= powerUnique) ||
      (Number.isFinite(powerRuns) && runCompletes >= powerRuns);

    const lastFreeEligible =
      (ssCfg.promptOnFreeRunsExhausted === true) &&
      (isPremium !== true) &&
      (runsBalance === 0);

    const flags = clampInt(getStatsSharingPromptFlags(storage), 0, 2147483647);

    // Priority: last free run > 50% > 30% > power user
    let chosenBit = 0;

    if (lastFreeEligible && (flags & BIT_LAST_FREE) === 0) {
      chosenBit = BIT_LAST_FREE;
    } else if (Number.isFinite(pct50) && uniquePct >= pct50 && (flags & BIT_50) === 0) {
      chosenBit = BIT_50;
    } else if (Number.isFinite(pct30) && uniquePct >= pct30 && (flags & BIT_30) === 0) {
      chosenBit = BIT_30;
    } else if (powerEligible && (flags & BIT_POWER) === 0) {
      chosenBit = BIT_POWER;
    }

    if (!chosenBit) return;

    // Mark as "presented" (but "Show me later" will undo this bit)
    markStatsSharingPromptFlag(storage, chosenBit);
    try {
      if (this._runtime) this._runtime._statsSharingLastPromptFlagBit = chosenBit;
    } catch (_) { /* silent */ }

    this.openStatsSharingModal();
  };


  // ============================================
  // Install prompt (minimal)
  // ============================================
  UI.prototype.promptInstall = function () {
    // pwa.js owns the native prompt + storage counter (single source of truth)

    if (window.WT_PWA && typeof window.WT_PWA.promptInstall === "function") {
      window.WT_PWA.promptInstall(this.storage);
    }
  };



  UI.prototype.dismissUpdateToast = function () {
    const node = el("update-toast");
    if (!node) return;

    // If an update is ready, user intent = apply it now.
    if (window.__WT_SW_UPDATE_READY__ === true) {
      try { window.__WT_SW_UPDATE_READY__ = false; } catch (_) { }
      location.reload();
      return;
    }

    // Otherwise just hide it.
    node.classList.remove("wt-toast--visible");
  };




  // ============================================
  // ============================================
  // House ad (optional)
  // ============================================
  UI.prototype.remindHouseAdLater = function () {
    // KISS: single mechanism = hide window (WT_CONFIG.houseAd.hideMs)
    if (!this.storage || typeof this.storage.hideHouseAdUsingConfig !== "function") return;

    this.storage.hideHouseAdUsingConfig();
    this.render();
  };


  UI.prototype.openHouseAd = function () {
    const cfg = this.config || {};
    const ha = cfg.houseAd || {};
    const url = String(ha.url || "").trim();
    if (!url) return;

    if (this.storage && typeof this.storage.markHouseAdClicked === "function") {
      this.storage.markHouseAdClicked();
    }

    window.open(url, "_blank", "noopener");
  };


  // ============================================
  // Secret Bonus fall (UI-only)
  // ============================================

  UI.prototype._secretBonusFallStop = function () {
    const sbf = this._runtime?.secretBonusFall;
    if (!sbf) return;

    if (sbf.rafId) {
      try { window.cancelAnimationFrame(sbf.rafId); } catch (_) { }
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

    sbf.itemKey = "";
    sbf.y01 = 0;
    sbf.speed01PerSec = 0;
  };


  UI.prototype._secretBonusFailCurrentItem = function () {
    // Fail-closed: only during BONUS + PLAYING
    if (this.state !== STATES.PLAYING) return;
    if (!this._runtime) return;

    // Local source of truth (this method must not rely on render-time locals)
    const modeNow = String(this._runtime?.runMode || "RUN").trim();
    if (modeNow !== "BONUS") return;

    // If feedback is pending, don't inject anything.
    if (this._runtime.feedbackPending === true) return;

    // HARD LOCK like normal answer
    if (this._runtime.answerLocked === true) return;
    this._runtime.answerLocked = true;

    // Snapshot chances BEFORE answering (for pulse/toast)
    let prevChancesLeft = null;
    try {
      const gsPrev = (this.game && typeof this.game.getState === "function") ? (this.game.getState() || {}) : {};
      if (gsPrev.chancesLeft != null) prevChancesLeft = Number(gsPrev.chancesLeft);
    } catch (_) { /* silent */ }

    // Timeout / no answer:
    // The engine contract expects a strict boolean. Force a guaranteed-wrong boolean by inverting correctAnswer.
    let forcedWrong = false;
    try {
      const cur = (this.game && typeof this.game.getCurrent === "function") ? this.game.getCurrent() : null;
      const correct = (cur && (cur.correctAnswer === true || cur.correctAnswer === false)) ? cur.correctAnswer : null;
      if (correct === true) forcedWrong = false;
      else if (correct === false) forcedWrong = true;
    } catch (_) { forcedWrong = false; }

    const res = (this.game && typeof this.game.answer === "function") ? this.game.answer(forcedWrong) : null;

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
      const gsNow = (this.game && typeof this.game.getState === "function") ? (this.game.getState() || {}) : {};
      nowChancesLeft = (gsNow.chancesLeft != null) ? Number(gsNow.chancesLeft) : null;

      chanceLost = (
        prevChancesLeft != null &&
        nowChancesLeft != null &&
        Number.isFinite(prevChancesLeft) &&
        Number.isFinite(nowChancesLeft) &&
        nowChancesLeft < prevChancesLeft
      );

      this._runtime.chanceLostPulseAt = chanceLost ? Date.now() : 0;

      const lastChanceEntered = (
        prevChancesLeft != null &&
        nowChancesLeft != null &&
        Number.isFinite(prevChancesLeft) &&
        Number.isFinite(nowChancesLeft) &&
        (prevChancesLeft > 1) &&
        (nowChancesLeft === 1)
      );
      this._runtime.lastChancePulseAt = lastChanceEntered ? Date.now() : 0;

      this._runtime.scoreFlashAt = 0;
    } catch (_) {
      chanceLost = false;
      nowChancesLeft = null;
      this._runtime.chanceLostPulseAt = 0;
      this._runtime.lastChancePulseAt = 0;
    }


    if (chanceLost && Number.isFinite(nowChancesLeft)) {
      showChanceLostToast(this.config, this.wording, nowChancesLeft);
    }

    if (this.storage && typeof this.storage.recordAnswer === "function") {
      this.storage.recordAnswer(res.itemId, res.isCorrect);
    }

    if (Number.isFinite(Number(res.itemId))) {
      this._runtime.runItemIds.push(Number(res.itemId));
    }

    // BONUS feedback policy already handled in UI.prototype.answer, but here we enforce the same "none/minimal".
    const sbFeedback = String(this.config?.secretBonus?.feedback || "").trim();

    if (sbFeedback === "none") {
      this._runtime.feedbackPending = false;
      this._runtime.lastAnswer = null;
      this._runtime.frozenItem = null;
      this._runtime.finishAfterFeedback = false;
      this._runtime.answerLocked = false;

      if (res.done === true) {
        const endedByGameOver = (Number.isFinite(nowChancesLeft) && Number(nowChancesLeft) === 0);
        if (endedByGameOver) {
          // Fall already stopped (line above). Use factored delay for freeze + overlay hold.
          this._enterGameOverDelay();
          return;
        }
        this._finishRun();
        return;
      }

      this.render();
      return;
    }
    if (res.done === true) {
      let nowChancesLeft = null;
      try {
        const gsNow = (this.game && typeof this.game.getState === "function") ? (this.game.getState() || {}) : {};
        nowChancesLeft = (gsNow.chancesLeft != null) ? Number(gsNow.chancesLeft) : null;
      } catch (_) { nowChancesLeft = null; }

      const endedByGameOver = (Number.isFinite(nowChancesLeft) && Number(nowChancesLeft) === 0);

      if (endedByGameOver) {
        // Fall already stopped. Use factored delay for freeze + overlay hold.
        this._enterGameOverDelay();
        return;
      }

      // Deck exhausted: show gameplay overlay then transition to END
      const msg = String(this.wording?.secretBonus?.endDeckExhaustedToast || "").trim();
      const durationMs = Number(this.config?.ui?.runStartOverlayMs);

      if (msg && Number.isFinite(durationMs) && durationMs >= 200 && durationMs <= 3000) {
        showGameplayOverlay(msg, {
          durationMs: Math.floor(durationMs),
          variant: "success"
        });

        if (this._runtime.bonusEndTimerId) {
          try { window.clearTimeout(this._runtime.bonusEndTimerId); } catch (_) { }
          this._runtime.bonusEndTimerId = null;
        }

        this._runtime.bonusEndTimerId = window.setTimeout(() => {
          this._runtime.bonusEndTimerId = null;
          if (this.state !== STATES.PLAYING) return;
          this._finishRun();
        }, Math.floor(durationMs));

        return;
      }

      this._finishRun();
      return;
    }

    this.render();

  };



  UI.prototype._secretBonusFallStartOrSync = function () {
    if (!this._runtime) return;

    const cfg = this.config || {};
    const sb = cfg?.secretBonus || {};
    const fall = (sb && typeof sb === "object") ? sb.fall : null;

    // No fallback: require full fall config (speed in % of lane height per second).
    // Config uses % (e.g. 25 = 25%/s), code converts to ratio (0.25).
    if (
      !fall ||
      typeof fall !== "object" ||
      (fall.enabled !== true) ||
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

    const sbf = this._runtime.secretBonusFall;
    if (!sbf) return;

    // Bind DOM references (fresh after render)
    // Bind DOM references (fresh after render)
    const lane = this.appEl ? this.appEl.querySelector("[data-wt-bonus-lane]") : null;
    const chip = this.appEl ? this.appEl.querySelector("[data-wt-bonus-chip]") : null;
    const failLineEl = this.appEl ? this.appEl.querySelector("[data-wt-bonus-fail]") : null;
    const failLabel = this.appEl ? this.appEl.querySelector("[data-wt-bonus-fail-label]") : null;

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
      sbf.trackPxMax = Math.max(0, laneH - (Number.isFinite(chipH) ? chipH : 0));
    } catch (_) {
      sbf.trackPxMax = 0;
    }

    // Detect new item -> reset fall position/speed
    const cur = (this.game && typeof this.game.getCurrent === "function") ? this.game.getCurrent() : null;
    const itemId = (cur && cur.id != null) ? String(cur.id) : "";
    const itemKey = itemId ? `id:${itemId}` : "";

    if (itemKey && itemKey !== sbf.itemKey) {
      sbf.itemKey = itemKey;
      sbf.y01 = 0;
      sbf.lastTs = 0;

      // Reset warning edge detection for the new item
      sbf.wasInWarning = false;

      // Clear transient classes from previous item
      try {
        if (sbf.chipEl && sbf.chipEl.classList) {
          sbf.chipEl.classList.remove("wt-bonus-chip--warning-once", "wt-bonus-chip--spawn");
        }
        if (sbf.failLineEl && sbf.failLineEl.classList) {
          sbf.failLineEl.classList.remove("wt-bonus-fail-line--pulse");
        }
        if (sbf.failLabelEl && sbf.failLabelEl.classList) {
          sbf.failLabelEl.classList.remove("wt-bonus-fail-label--pulse");
        }
      } catch (_) { }

      // Speed contract (single type): progression based on items served (not time).
      // Config values are % of lane height per second (e.g. 25 => 25%/s),
      // ramp applied once per new item: speed = min(max, initial + increment * itemsServedSoFar).
      const initialPct = Number(fall.initialSpeed);
      const incPct = Number(fall.speedIncrement);
      const maxPct = Number(fall.maxSpeed);

      const servedSoFar = Array.isArray(this._runtime?.runItemIds) ? this._runtime.runItemIds.length : 0;

      if (!Number.isFinite(initialPct) || initialPct <= 0) { this._secretBonusFallStop(); return; }
      if (!Number.isFinite(incPct) || incPct < 0) { this._secretBonusFallStop(); return; }
      if (!Number.isFinite(maxPct) || maxPct <= 0) { this._secretBonusFallStop(); return; }

      const speedPct = Math.min(maxPct, Math.max(0, initialPct + (incPct * servedSoFar)));
      sbf.speed01PerSec = speedPct / 100;

      // Reset transform immediately
      try { sbf.chipEl.style.transform = "translate3d(0px, 0px, 0px)"; } catch (_) { }

      // Micro-juice: spawn pop (1 shot)
      try {
        if (sbf.chipEl && sbf.chipEl.classList) {
          sbf.chipEl.classList.add("wt-bonus-chip--spawn");

          const onDone = () => {
            try { sbf.chipEl.classList.remove("wt-bonus-chip--spawn"); } catch (_) { }
          };

          sbf.chipEl.addEventListener("animationend", onDone, { once: true });
          sbf.chipEl.addEventListener("animationcancel", onDone, { once: true });
        }
      } catch (_) { }


    }

    if (sbf.running === true) return;

    sbf.running = true;
    sbf.rafId = window.requestAnimationFrame((ts) => this._secretBonusFallTick(ts));
  };


  UI.prototype._secretBonusFallTick = function (ts) {
    const sbf = this._runtime?.secretBonusFall;
    if (!sbf || sbf.running !== true) return;

    // Validate still on BONUS playing with required DOM nodes
    const modeNow = String(this._runtime?.runMode || "RUN").trim();
    if (this.state !== STATES.PLAYING || modeNow !== "BONUS" || !sbf.laneEl || !sbf.chipEl) {
      this._secretBonusFallStop();
      return;
    }

    const cfg = this.config || {};
    const fall = cfg?.secretBonus?.fall || null;
    if (!fall || typeof fall !== "object") {
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
    const trackPxMax = Number(sbf.trackPxMax || 0);

    if (!Number.isFinite(trackPxMax) || trackPxMax <= 0) {
      sbf.rafId = window.requestAnimationFrame((t2) => this._secretBonusFallTick(t2));
      return;
    }

    const last = Number(sbf.lastTs || 0);
    sbf.lastTs = Number.isFinite(ts) ? ts : 0;

    // First frame: just schedule next
    if (!last || !Number.isFinite(last)) {
      sbf.rafId = window.requestAnimationFrame((t2) => this._secretBonusFallTick(t2));
      return;
    }

    const dtMs = Math.max(0, Math.min(80, sbf.lastTs - last));
    const dtSec = dtMs / 1000;

    // Speed is set once per item in _secretBonusFallStartOrSync (items-served progression).
    // Clamp to max to fail-safe if config changed mid-run.
    const speed01 = Math.min(maxSpeed01, Math.max(0, Number(sbf.speed01PerSec || 0)));
    if (!Number.isFinite(speed01) || speed01 <= 0) {
      this._secretBonusFallStop();
      return;
    }

    // Clamp y01 to [0..1] so the chip never overshoots the track
    sbf.y01 = Math.min(1, Math.max(0, Number(sbf.y01 || 0) + (speed01 * dtSec)));

    const yPx = sbf.y01 * trackPxMax;

    // Apply transform (no re-render)
    try { sbf.chipEl.style.transform = `translate3d(0px, ${Math.round(yPx)}px, 0px)`; } catch (_) { }

    // Warning zone: keep the existing policy, but let micro-juice handle the â€œone-shotâ€
    if (Number.isFinite(danger01) && danger01 > 0 && sbf.chipEl) {
      const warningThreshold = danger01 * 0.65;
      const inWarning = sbf.y01 >= warningThreshold;

      // Persistent warning pulse
      sbf.chipEl.classList.toggle("wt-bonus-chip--warning", inWarning);

      // Micro-juice: one-shot hit when entering the zone
      if (inWarning && sbf.wasInWarning !== true) {
        try {
          sbf.chipEl.classList.remove("wt-bonus-chip--warning-once");
          sbf.chipEl.classList.add("wt-bonus-chip--warning-once");

          const onDone = () => {
            try { sbf.chipEl.classList.remove("wt-bonus-chip--warning-once"); } catch (_) { }
          };
          sbf.chipEl.addEventListener("animationend", onDone, { once: true });
          sbf.chipEl.addEventListener("animationcancel", onDone, { once: true });

        } catch (_) { }

        // Pulse the fail line + label once for clarity
        try {
          if (sbf.failLineEl && sbf.failLineEl.classList) {
            sbf.failLineEl.classList.remove("wt-bonus-fail-line--pulse");
            sbf.failLineEl.classList.add("wt-bonus-fail-line--pulse");

            const onDoneLine = () => {
              try { sbf.failLineEl.classList.remove("wt-bonus-fail-line--pulse"); } catch (_) { }
            };
            sbf.failLineEl.addEventListener("animationend", onDoneLine, { once: true });
            sbf.failLineEl.addEventListener("animationcancel", onDoneLine, { once: true });

          }

          if (sbf.failLabelEl && sbf.failLabelEl.classList) {
            sbf.failLabelEl.classList.remove("wt-bonus-fail-label--pulse");
            sbf.failLabelEl.classList.add("wt-bonus-fail-label--pulse");

            const onDoneLabel = () => {
              try { sbf.failLabelEl.classList.remove("wt-bonus-fail-label--pulse"); } catch (_) { }
            };
            sbf.failLabelEl.addEventListener("animationend", onDoneLabel, { once: true });
            sbf.failLabelEl.addEventListener("animationcancel", onDoneLabel, { once: true });
          }
        } catch (_) { }
      }

      sbf.wasInWarning = inWarning;
    }

    // Fail line check (based on *track*, not raw lane height)
    const failY = trackPxMax * danger01;
    if (yPx >= failY) {
      this._secretBonusFailCurrentItem();
      return;
    }

    sbf.rafId = window.requestAnimationFrame((t2) => this._secretBonusFallTick(t2));
  };



  // ============================================
  // Render
  // ============================================
  UI.prototype.render = function () {

    if (!this.appEl) return;

    // Safety net: clear stuck overlay locks on LANDING/END (fail-closed)
    if (this.state !== STATES.PLAYING) {
      try {
        if (this.appEl.getAttribute("data-wt-runstart-lock") === "1") {
          this.appEl.style.pointerEvents = "";
          try { this.appEl.inert = false; } catch (_) { }
          this.appEl.removeAttribute("data-wt-runstart-lock");
          this.appEl.removeAttribute("data-wt-runstart-prev-pe");
          this.appEl.removeAttribute("data-wt-runstart-prev-inert");
        }
        if (this.appEl.inert === true) { try { this.appEl.inert = false; } catch (_) { } }
        if (this.appEl.style.pointerEvents === "none") { this.appEl.style.pointerEvents = ""; }
      } catch (_) { }
    }

    // Refresh module-scoped premium guard from StorageManager (single source of truth).
    premium = (this.storage && typeof this.storage.isPremium === "function") ? (this.storage.isPremium() === true) : false;


    const prevRenderedState = this._runtime ? this._runtime.lastRenderedState : null;

    // Funnel counter: count LANDING views once per entry into the screen (not per re-render)
    try {
      const prev = prevRenderedState;
      const next = this.state;

      if (next === STATES.LANDING && prev !== STATES.LANDING) {
        if (this.storage && typeof this.storage.markLandingViewed === "function") {
          this.storage.markLandingViewed();
        }
      }

      if (this._runtime) this._runtime.lastRenderedState = next;
    } catch (_) { /* silent */ }

    // Preserve footer if it exists inside #app (otherwise leave it alone).
    // We keep the same DOM node (not HTML string) to avoid losing any nested content.
    if (!this._footerNode) {
      try {
        const candidate =
          this.appEl.querySelector("[data-wt-footer]") ||
          this.appEl.querySelector(".wt-footer") ||
          this.appEl.querySelector("footer");
        if (candidate) this._footerNode = candidate;
      } catch (_) { /* silent */ }
    }

    if (this._footerNode && this._footerNode.parentNode === this.appEl) {
      try { this.appEl.removeChild(this._footerNode); } catch (_) { /* silent */ }
    }
    switch (this.state) {
      case STATES.LANDING:
        this.appEl.innerHTML = this._renderLanding();
        break;

      case STATES.PLAYING:
        // Fail-closed: during END transitions, async events may trigger render()
        // while the engine is already cleaned up. Never re-render PLAYING without a game.
        if (!this.game) return;

        if (this.modalEl && !this.modalEl.classList.contains("wt-hidden")) {
          this.closeModal();
        }
        this.appEl.innerHTML = this._renderPlaying();
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
      const playing = (this.state === STATES.PLAYING);
      document.body.classList.toggle("wt-state--playing", playing);
    } catch (_) { /* silent */ }


    // END entry modals (priority order):
    // 1) Pool complete congratulations (one-shot per 200/200 run)
    // 2) Waitlist (optional one-shot auto-modal)
    try {
      const enteredEnd = (this.state === STATES.END && prevRenderedState !== STATES.END);

      // Clean up game-over overlay as soon as we are no longer on PLAYING.
      // Goal: keep PLAYING frozen under the overlay, but never let the overlay leak onto END/LANDING/PAYWALL.
      if (this.state !== STATES.PLAYING) {
        try { hideChanceLostOverlay(); } catch (_) { /* silent */ }
      }

      if (enteredEnd) {
        const lastRun = this._runtime?.lastRun || {};
        const mode = String(lastRun.mode || "").trim();
        const isRun = (mode === "RUN");
        const poolCompleteCelebration = isRun && !!lastRun.poolCompleteCelebration;

        const modalOpen0 = !!(this.modalEl && !this.modalEl.classList.contains("wt-hidden"));

        // Pool complete modal: opens immediately on END entry (visually “before” END content)
        if (poolCompleteCelebration && !modalOpen0) {
          this.openPoolCompleteModal();
        }

        // Waitlist: optional one-shot auto-modal on END (no dark patterns: only once per device)
        const cfg = this.config || {};
        const wlCfg = cfg.waitlist || {};
        const placement = String(wlCfg.placement || "").trim();

        const eligiblePlacement = (placement === "end-and-landing-after-seen-once");
        const oneShot = (wlCfg.showModalOneShot === true);
        const afterExhaustedOnly = (wlCfg.afterPoolExhaustedOnly === true);

        const exhausted =
          !afterExhaustedOnly ||
          !!(this.storage && typeof this.storage.hasSeenAllWordTraps === "function" && this.storage.hasSeenAllWordTraps() === true);

        const status =
          (this.storage && typeof this.storage.getWaitlistStatus === "function")
            ? String(this.storage.getWaitlistStatus() || "").trim()
            : "";

        const modalOpen = !!(this.modalEl && !this.modalEl.classList.contains("wt-hidden"));

        if (eligiblePlacement && oneShot && exhausted && !modalOpen && status === "not_seen") {
          this.openWaitlistModal();
        }
      }
    } catch (_) { /* silent */ }


    // Re-attach preserved footer (only if it belongs to #app)
    if (this._footerNode) {
      try { this.appEl.appendChild(this._footerNode); } catch (_) { /* silent */ }
    }

    // Hydrate footer after each render to stabilize dynamic fields
    try { this.updateFooter(); } catch (_) { /* silent */ }

    // A11Y: move focus to the new screen container after a state transition.
    // (Avoid stealing focus during normal re-renders inside the same screen.)
    try {
      const entered =
        (prevRenderedState == null) ||
        (this.state !== prevRenderedState);

      const modalOpen = !!(this.modalEl && !this.modalEl.classList.contains("wt-hidden"));

      if (entered && !modalOpen && this.appEl && typeof this.appEl.focus === "function") {
        try {
          this.appEl.focus({ preventScroll: true });
        } catch (_) {
          try { this.appEl.focus(); } catch (_) { /* silent */ }
        }
      }
    } catch (_) { /* silent */ }

    // Secret chest: no auto-welcome modal.
    // The modal is shown only on the user's first chest click (one-shot per device).


    // Secret Bonus fall loop: start/stop purely based on current screen + mode.
    // Hard rule: never run the fall loop while the run-start overlay is visible.
    try {
      const modeNow = String(this._runtime?.runMode || "RUN").trim();
      const inBonus = (this.state === STATES.PLAYING && modeNow === "BONUS");

      if (inBonus) {
        const blockedByRunStart = isOverlayVisible("wt-run-start-overlay");
        if (blockedByRunStart) {
          this._secretBonusFallCleanup();
        } else {
          this._secretBonusFallStartOrSync();
        }
      } else {
        this._secretBonusFallCleanup();
      }
    } catch (_) { /* silent */ }
  };




  UI.prototype._renderLanding = function () {
    const w = this.wording || {};
    const landing = w.landing || {};
    const cfg = this.config || {};
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
      .map(s => String(s || "").trim())
      .filter(Boolean)
      .map(s => escapeHtml(s))
      .join("<br>");

    const microTrust = String(landing.microTrust || "").trim();
    const tagline = String(landing.tagline || "").trim();

    const premium = (this.storage && typeof this.storage.isPremium === "function") ? this.storage.isPremium() : false;

    // Post-paywall reassurance block (LANDING only, one-shot variant)
    // Clear the variant immediately (KISS): snapshot the intent, then reset so it cannot leak across future renders.
    const isPostPaywallVariant = !premium && (this._nav && this._nav.landingVariant === "POST_PAYWALL");
    if (isPostPaywallVariant && this._nav) this._nav.landingVariant = null;

    const postTitle = String(landing.postPaywallTitle || "").trim();
    const postBody = String(landing.postPaywallBody || "").trim();
    const postCta = String(landing.postPaywallCta || "").trim();

    // postBlock: computed after canShowChest (see below)
    let postBlock = "";

    // Post-completion (House Ad / Waitlist) can appear on LANDING only AFTER it was seen once on END.
    // Source of truth: StorageManager persistence (no UI fallback).
    let postCompletionHtml = "";
    try {
      const exhausted =
        !!(this.storage && typeof this.storage.hasSeenAllWordTraps === "function" && this.storage.hasSeenAllWordTraps() === true);

      const pcCfg = cfg?.postCompletion || {};
      const pcW = w?.postCompletion || {};

      const enabled = (pcCfg?.enabled === true);
      const canWaitlist = (pcCfg?.waitlistEnabled === true);
      const canOpenFull = (pcCfg?.houseAdEnabled === true);

      if (exhausted && enabled) {
        const pcPoolSize = clampInt(cfg?.game?.poolSize, 1, 9999);
        const pcTitle = fillTemplate(String(pcW.title || "").trim(), { poolSize: pcPoolSize });
        const pcBody = fillTemplate(String(pcW.body || "").trim(), { poolSize: pcPoolSize });
        const wlTitle = String(pcW.waitlistTitle || "").trim();
        const wlB1 = String(pcW.waitlistBody1 || "").trim();
        const wlB2 = String(pcW.waitlistBody2 || "").trim();
        const wlCta = String(pcW.waitlistCta || "").trim();
        const wlDisc = String(pcW.waitlistDisclaimer || "").trim();
        const ctaFull = String(pcW.houseAdCta || "").trim();

        postCompletionHtml = `
          <div class="wt-divider"></div>
          ${pcTitle ? `<strong class="wt-meta">${escapeHtml(pcTitle)}</strong>` : ``}
          ${pcBody ? `<p class="wt-muted" style="margin-top:6px">${escapeHtml(pcBody)}</p>` : ``}

          ${(!canOpenFull && canWaitlist) ? `
            ${wlTitle ? `<strong class="wt-meta">${escapeHtml(wlTitle)}</strong>` : ``}
            ${wlB1 ? `<p class="wt-muted" style="margin-top:6px">${escapeHtml(wlB1)}</p>` : ``}
            ${wlB2 ? `<p class="wt-muted" style="margin-top:4px">${escapeHtml(wlB2)}</p>` : ``}
          ` : ``}

          <div class="wt-actions" style="margin-top:12px">
            ${canWaitlist && wlCta ? `
              <button class="wt-btn wt-btn--secondary" data-action="open-waitlist">${escapeHtml(wlCta)}</button>
            ` : ``}

            ${canOpenFull && ctaFull ? `
              <button class="wt-btn wt-btn--primary" data-action="open-house-ad">${escapeHtml(ctaFull)}</button>
            ` : ``}
          </div>

          ${wlDisc ? `<p class="wt-muted" style="margin-top:10px">${escapeHtml(wlDisc)}</p>` : ``}
        `;
      }
    } catch (_) { postCompletionHtml = ""; }

    // Welcome back removed intentionally (UX simplification)
    let welcomeBackHtml = "";





    // Build landing header row HTML outside the main template string
    const windowMs = Number(cfg?.secretBonus?.tapWindowMs);
    const tapsRequired = Number(cfg?.secretBonus?.tapsRequired);

    const landingAfterRunsRaw = Number(cfg?.secretBonus?.gates?.landingAfterRuns);
    const landingAfterRuns = (Number.isFinite(landingAfterRunsRaw) && landingAfterRunsRaw >= 0)
      ? Math.floor(landingAfterRunsRaw)
      : null;


    let rn = null;
    let rc = null;

    if (this.storage && typeof this.storage.getRunNumber === "function") {
      try {
        const v = Number(this.storage.getRunNumber());
        rn = Number.isFinite(v) ? v : null;
      } catch (_) { rn = null; }
    }

    if (this.storage && typeof this.storage.getCounters === "function") {
      try {
        const c = this.storage.getCounters() || {};
        const v = Number(c.runCompletes);
        rc = Number.isFinite(v) ? v : null;
      } catch (_) { rc = null; }
    }
    const a = (rn == null) ? null : Math.max(0, Math.floor(rn));
    const b = (rc == null) ? null : Math.max(0, Math.floor(rc));

    let rs = null;

    if (this.storage && typeof this.storage.getRunsUsed === "function") {
      try {
        const v = Number(this.storage.getRunsUsed());
        rs = Number.isFinite(v) ? v : null;
      } catch (_) { rs = null; }
    }

    if (rs == null && this.storage && typeof this.storage.getCounters === "function") {
      try {
        const c = this.storage.getCounters() || {};
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

    // LANDING gating should reflect â€œhas played at least onceâ€ (RUN or PRACTICE),
    // not only â€œcompleted a RUNâ€.
    const runPlays = Math.max(runCompletes, (c == null ? 0 : c));


    // Returning-user LANDING stats (no greeting; purely contextual)
    // No fallback: requires WT_CONFIG.landingStats + WT_WORDING.landing.* strings.
    try {
      const statsCfg = cfg?.landingStats || {};
      const enabled = (statsCfg?.enabled === true);

      const sparkNRaw = Number(statsCfg?.sparkRunsCount);
      const sparkN = (Number.isFinite(sparkNRaw) && sparkNRaw >= 1 && sparkNRaw <= 20) ? Math.floor(sparkNRaw) : null;

      if (enabled && sparkN != null && Number.isFinite(runCompletes) && runCompletes >= 1) {
        const seenLabel = String(landing.statsSeenLabel || "").trim();
        const seenTpl = String(landing.statsSeenSummaryTemplate || "").trim();

        const poolSizeSafe = clampInt(cfg?.game?.poolSize, 1, 9999);

        // Unique seen count (items with seenCount > 0)
        let seen = 0;
        try {
          if (this.storage && typeof this.storage.getSeenItemIds === "function") {
            const ids = this.storage.getSeenItemIds() || [];
            seen = Array.isArray(ids) ? ids.length : 0;
          } else {
            const stats = (this.storage && typeof this.storage.getStatsByItem === "function")
              ? (this.storage.getStatsByItem() || {})
              : ((this.storage && typeof this.storage.getData === "function") ? ((this.storage.getData() || {}).statsByItem || {}) : {});
            if (stats && typeof stats === "object") {
              for (const k in stats) {
                const s = stats[k] || {};
                if (Number(s.seenCount || 0) > 0) seen += 1;
              }
            }
          }
        } catch (_) { seen = 0; }

        seen = clampInt(seen, 0, poolSizeSafe);
        // Mistakes to fix (global, can go down):
        // remaining = lastWrongAt > lastCorrectAt
        // Mistakes to fix (global, can go down):
        // remaining = lastWrongAt > lastCorrectAt
        let mistakes = 0;
        try {
          const stats = (this.storage && typeof this.storage.getStatsByItem === "function")
            ? (this.storage.getStatsByItem() || {})
            : ((this.storage && typeof this.storage.getData === "function") ? ((this.storage.getData() || {}).statsByItem || {}) : {});

          if (stats && typeof stats === "object") {
            for (const k in stats) {
              const s = stats[k] || {};
              const lastWrongAt = Number(s.lastWrongAt || 0);
              const lastCorrectAt = Number(s.lastCorrectAt || 0);

              const lw = (Number.isFinite(lastWrongAt) && lastWrongAt > 0) ? lastWrongAt : 0;
              const lc = (Number.isFinite(lastCorrectAt) && lastCorrectAt > 0) ? lastCorrectAt : 0;

              if (lw > lc) mistakes += 1;
            }
          }
        } catch (_) { mistakes = 0; }

        mistakes = clampInt(mistakes, 0, poolSizeSafe);
        const isComplete = (seen >= poolSizeSafe);
        const remaining = clampInt(poolSizeSafe - seen, 0, poolSizeSafe);

        // Progress:
        // - before completion: seen progress
        // - after completion: mastery progress (mastered = poolSize - mistakes)
        const mastered = clampInt(poolSizeSafe - mistakes, 0, poolSizeSafe);
        const pct = poolSizeSafe > 0
          ? Math.max(0, Math.min(100, Math.round(((isComplete ? mastered : seen) / poolSizeSafe) * 100)))
          : 0;

        const completeLabelTpl = String(landing.statsSeenCompleteLabel || "").trim();
        const mistakesLabel = String(landing.statsMistakesLabel || "").trim();
        const mistakesTpl = String(landing.statsMistakesSummaryTemplate || "").trim();

        // LANDING: remove "Mastery" entirely (FREE + PREMIUM).
        // Keep a simple progress line (Seen), and after completion show "Mistakes to fix" when available.
        const pctSeen = poolSizeSafe > 0
          ? Math.max(0, Math.min(100, Math.round((seen / poolSizeSafe) * 100)))
          : 0;

        let title = "";
        let sub = "";

        if (!isComplete) {
          title = "";
          sub = fillTemplate(seenTpl, { seen, poolSize: poolSizeSafe, remaining });
        } else {
          // Fail-closed: after completion, do not fall back to other labels/lines.
          title = (completeLabelTpl ? fillTemplate(completeLabelTpl, { poolSize: poolSizeSafe }) : "");

          sub = (mistakesLabel && mistakesTpl)
            ? `${mistakesLabel}: ${fillTemplate(mistakesTpl, { mistakes })}`
            : "";
        }

        // UI decision: do not show the "Words seen" label. Show only the numeric line, left-aligned.
        const displayLine = String(sub || "").trim();

        if (displayLine) {
          welcomeBackHtml = `
            <div class="wt-landing-stats" aria-label="">
              <div class="wt-landing-stat">
                ${title ? `<div class="wt-landing-stat__title">${escapeHtml(title)}</div>` : ``}
                <div class="${title ? `wt-meta wt-landing-stat__sub` : `wt-landing-stat__title`}">${escapeHtml(displayLine)}</div>
                <div class="wt-progress" aria-hidden="true">
                  <div class="wt-progress__fill" style="width:${pctSeen}%"></div>
                </div>
              </div>
            </div>
          `;
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
      Number.isFinite(tapsRequired) && tapsRequired >= 1 &&
      meetsRunGate;


    let sbFreeRunsUsedLanding = 0;
    if (this.storage && typeof this.storage.getSecretBonusFreeRunsUsed === "function") {
      try { sbFreeRunsUsedLanding = Number(this.storage.getSecretBonusFreeRunsUsed()); } catch (_) { sbFreeRunsUsedLanding = 0; }
    }

    const chestHintTextLanding = (canShowChest && sbFreeRunsUsedLanding === 0)
      ? String(this.wording?.secretBonus?.chestHint || "").trim()
      : "";

    // Early price timer (LANDING): show only after the PAYWALL has started the EARLY window.
    // No fallback: relies on StorageManager.getEarlyPriceState() + config ui.paywallUrgency + paywall.timerLabel.
    let landingUrgencyHtml = "";
    try {
      const pay = w.paywall || {};

      let ep = null;
      if (this.storage && typeof this.storage.getEarlyPriceState === "function") {
        try { ep = this.storage.getEarlyPriceState() || null; } catch (_) { ep = null; }
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

      if (isEarly && urgencyEnabled && label) {
        const cls = `wt-box wt-box--tinted`;
        landingUrgencyHtml = `
        <div class="${cls}" role="status" aria-live="polite">
          <div class="wt-meta">${escapeHtml(label)}</div>
          <div class="wt-h2${urgencyPulse ? ' wt-pulse' : ''}" style="margin:4px 0 0;color:rgb(var(--primary-dark))">${escapeHtml(timer)}</div>
        </div>
      `;
      }
    } catch (_) { landingUrgencyHtml = ""; }



    // Post-paywall reassurance block (deferred: needs canShowChest)
    postBlock = (() => {
      if (!isPostPaywallVariant) return ``;

      let sbUsedPost = 0;
      if (this.storage && typeof this.storage.getSecretBonusFreeRunsUsed === "function") {
        try { sbUsedPost = Number(this.storage.getSecretBonusFreeRunsUsed()); } catch (_) { sbUsedPost = 0; }
      }

      const postSbTitle = String(landing.postPaywallSbTitle || "").trim();
      const postSbBody = String(landing.postPaywallSbBody || "").trim();

      if (canShowChest && sbUsedPost === 0 && (postSbTitle || postSbBody)) {
        return `
          <div class="wt-divider"></div>
          ${postSbTitle ? `<strong class="wt-meta">${escapeHtml(postSbTitle)}</strong>` : ``}
          ${postSbBody ? `<p class="wt-muted" style="margin-top:6px">${escapeHtml(postSbBody)}</p>` : ``}
        `;
      }

      if (postTitle || postBody || postCta) {
        return `
          <div class="wt-divider"></div>
          ${postTitle ? `<strong class="wt-meta">${escapeHtml(postTitle)}</strong>` : ``}
          ${postBody ? `<p class="wt-muted" style="margin-top:6px">${escapeHtml(postBody)}</p>` : ``}
          ${postCta ? `
            <div class="wt-actions" style="margin-top:12px">
              <button class="wt-btn wt-btn--secondary" data-action="open-paywall">
                ${escapeHtml(postCta)}
              </button>
            </div>
          ` : ``}
        `;
      }

      return ``;
    })();

    const howToPlayAria = String(w.system?.more || "").trim(); const howToPlayTitle = String(w.system?.more || "").trim();
    const chestAria = String(this.wording?.secretBonus?.chestAria || "").trim();

    const chestTeaseClass = (!hasSolvedSecretChestHint(cfg)) ? " wt-btn-icon--tease" : "";

    const chestBtnHtml = canShowChest
      ? `
    <button
      type="button"
      data-wt-secret="chest"
      class="wt-btn-icon${chestTeaseClass}"
      aria-label="${escapeHtml(chestAria)}"
      title=""
    >&#x1F381;</button>
  `
      : ``;

    const landingHeaderRowHtml = `
  <div class="wt-row wt-row--spaced" style="align-items:center; gap:12px">
    <div style="min-width:0">
      ${renderBrandingRow(cfg, true)}
      ${tagline ? `<p class="wt-meta" style="margin:2px 0 0">${escapeHtml(tagline)}</p>` : ``}
    </div>

    <div style="display:flex; gap:10px; align-items:center; flex-shrink:0">
      ${chestHintTextLanding ? `<div class="wt-chest-hint-inline">${escapeHtml(chestHintTextLanding)}</div>` : ``}
      <button
        class="wt-btn-icon"
        data-action="open-howto"
        aria-label="${escapeHtml(howToPlayAria)}"
        title="${escapeHtml(howToPlayTitle)}"
      >?</button>
      ${chestBtnHtml}
    </div>
  </div>
`;

    return `
  <div class="wt-card wt-card--landing">


${landingHeaderRowHtml}

   ${landingUrgencyHtml}


    <p class="wt-sub" style="margin-top:6px">${subtitleHtml}</p>

  ${(() => {
        // L1: limit stacked muted lines (avoid grey wall)
        const hasHeavyBlock = Boolean(
          (postBlock && String(postBlock).trim()) ||
          (postCompletionHtml && String(postCompletionHtml).trim())
        );

        let mutedBudget = hasHeavyBlock ? 0 : 2;


        const runsInfoHtml = (() => {
          if (premium) return ``;
          if (mutedBudget <= 0) return ``;

          let bal = null;
          if (this.storage && typeof this.storage.getRunsBalance === "function") {
            try { bal = Number(this.storage.getRunsBalance()); } catch (_) { bal = null; }
          }
          if (!Number.isFinite(bal) || bal <= 0) return ``;

          const label = String(landing.runsLabel || "").trim();
          const mode = String(landing.runsFreeMode || "").trim();
          if (!label) return ``;

          const modeSuffix = mode ? ` (${escapeHtml(mode)})` : ``;

          mutedBudget -= 1;
          return `<p class="wt-muted" style="margin-top:6px">${escapeHtml(label)}: ${escapeHtml(String(bal))}${modeSuffix}</p>`;
        })();

        return `${runsInfoHtml}`;
      })()}

<div class="wt-actions" style="margin-top:16px; display:grid; gap:10px">

      ${(() => {
        let bal = null;
        if (!premium && this.storage && typeof this.storage.getRunsBalance === "function") {
          try { bal = Number(this.storage.getRunsBalance()); } catch (_) { bal = null; }
        }
        const runsExhausted = (!premium && Number.isFinite(bal) && bal <= 0);

        if (runsExhausted) {
          const label = String(landing.postPaywallCta || "").trim();
          if (!label && this.config?.debug?.enabled) {
            console.warn("[WT_UI] Missing required copy: WT_WORDING.landing.postPaywallCta");
          }
          if (!label) return ``;
          return `
            <button class="wt-btn wt-btn--primary" data-action="open-paywall" style="width:100%">
              ${escapeHtml(label)}
            </button>
          `;
        }


        return `
          <button class="wt-btn wt-btn--primary" data-action="start-run"
            aria-label="${escapeHtml(playLabel)}"
            style="width:100%"
            ${((this._runtime && Number(this._runtime.contentTotal) > 0) ? "" : "disabled")}>
             ${escapeHtml(playLabel)}
          </button>
        `;
      })()}


         ${(() => {
        const label = premium
          ? String(w.end?.practiceCta || "").trim()
          : String(w.end?.practiceCtaPremium || "").trim();

        if (!label && this.config?.debug?.enabled) {
          console.warn("[WT_UI] Missing required copy: WT_WORDING.end.practiceCta / WT_WORDING.end.practiceCtaPremium");
        }
        if (!label) return ``;


        // Only show after at least one completed RUN.
        if (!Number.isFinite(runCompletes) || runCompletes < 1) return ``;

        // Only show when the user has mistakes to practice.
        const minWrong = clampInt(Number(cfg?.mistakesOnly?.minWrongItemsToShowToggle), 1, 9999);

        let statsByItem = {};
        if (this.storage && typeof this.storage.getStatsByItem === "function") {
          try { statsByItem = this.storage.getStatsByItem() || {}; } catch (_) { statsByItem = {}; }
        }

        let mistakesCount = 0;
        for (const k in statsByItem) {
          const wc = clampInt(Number(statsByItem[k]?.wrongCount), 0, 999999);
          if (wc > 0) mistakesCount += 1;
        }

        if (!Number.isFinite(mistakesCount) || mistakesCount < minWrong) return ``;

        const action = premium ? "start-practice" : "open-paywall";
        return `
          <button class="wt-btn wt-btn--secondary" data-action="${action}" style="width:100%">
            ${escapeHtml(label)}
          </button>
        `;
      })()}


     ${"" /* F4: secondary paywall CTA removed (primary handles exhausted state) */}

      ${((this._runtime && this._runtime.contentLoading === true)
        ? (() => {
          const msg = String(this.wording?.ui?.contentLoadingToast || "").trim();
          return msg ? `<p class="wt-muted" style="margin:0">${escapeHtml(msg)}</p>` : ``;
        })()
        : ``)}
    </div>

    ${welcomeBackHtml}

    ${((!premium && landing.microFun) ? `<p class="wt-sub wt-muted" style="margin-top:10px">${escapeHtml(String(landing.microFun || "").trim())}</p>` : ``)}

    ${postBlock}

    ${postCompletionHtml}

<p class="wt-sub wt-muted" style="margin-top:12px">${escapeHtml(microTrust)}</p>


</div>
`;



  };


  UI.prototype._renderEnd = function () {
    const w = this.wording || {};
    const ui = w.ui || {};
    const end = w.end || {};
    const practiceW = w.practice || {};
    const bonusW = w.secretBonus || {};
    const cfg = this.config || {};
    const premium = (this.storage && typeof this.storage.isPremium === "function") ? (this.storage.isPremium() === true) : false;

    const lastRun = this._runtime?.lastRun || {};
    const mode = String(lastRun.mode || this._runtime?.runMode || "RUN").trim();
    const isRun = (mode === "RUN");
    const isPractice = (mode === "PRACTICE");
    const isBonus = (mode === "BONUS");

    const scoreFP = clampInt(lastRun.scoreFP, 0, 99999);
    const maxChances = clampInt(lastRun.maxChances || cfg?.game?.maxChances, 0, 99);
    const chancesLeft = (lastRun.chancesLeft == null) ? null : clampInt(lastRun.chancesLeft, 0, 99);
    const newBest = isRun && !!lastRun.newBest;

    const totalPresented = Array.isArray(this._runtime?.runItemIds) ? this._runtime.runItemIds.length : 0;

    const bestStreakNum = clampInt(lastRun.bestStreak, 0, 9999);

    let poolSize = clampInt(cfg?.game?.poolSize, 0, 99999);

    let seen = null;
    if (this.storage && typeof this.storage.getSeenItemIds === "function") {
      try {
        const ids = this.storage.getSeenItemIds();
        if (Array.isArray(ids)) seen = clampInt(ids.length, 0, 99999);
      } catch (_) { /* silent */ }
    }

    const vars = {
      score: scoreFP,
      total: clampInt(totalPresented, 0, 99999),
      best: clampInt(lastRun.bestScoreFP, 0, 99999),
      bestStreak: bestStreakNum,

      // UI choice: do not show FP unit on END (keep templates, remove unit)
      fpLong: "",
      fpShort: "",

      maxChances,
      poolSize,
      seen: (seen == null) ? "" : seen
    };




    const scoreLineTpl =
      isBonus ? String(bonusW.scoreLine || end.scoreLine || "").trim()
        : isPractice ? String(practiceW.scoreLine || end.scoreLine || "").trim()
          : (isRun && !!lastRun.poolCompleteCelebration) ? String(end.poolCompleteScoreLine || "").trim()
            : String(end.scoreLine || "").trim();

    const newBestTpl = String(end.newBest || "").trim();

    let endLineTpl = "";

    let bonusLevel = "";
    let bonusIdentityTpl = "";
    let bonusLensTpl = "";

    let practiceLevel = "";
    let practiceIdentityTpl = "";
    let practiceLensTpl = "";

    let runVerdictKey = "";
    let runIdentityTpl = "";
    let runLensTpl = "";

    // BONUS END â€” endByLevel (2 sentences) + endLine + identity + lens. No hardcoded fallback.
    if (isBonus) {
      const total = clampInt(totalPresented, 0, 99999);

      // Bucket from displayed score (scoreFP) and total presented.
      // LOW: score=0 | HIGH: score=total (and total>0) | MEDIUM otherwise.
      if (total > 0) {
        if (scoreFP <= 0) bonusLevel = "low";
        else if (scoreFP >= total) bonusLevel = "high";
        else bonusLevel = "medium";
      }

      const byLevel = bonusW && typeof bonusW === "object" ? bonusW.endByLevel : null;
      const bonusEndLine = String(bonusW.endLine || "").trim();

      const lines = (bonusLevel && Array.isArray(byLevel?.[bonusLevel])) ? byLevel[bonusLevel] : null;
      const byLevelLine =
        (lines && lines.length === 2)
          ? `${String(lines[0] || "").trim()} ${String(lines[1] || "").trim()}`.trim()
          : "";

      endLineTpl = [byLevelLine, bonusEndLine].filter(Boolean).join(" ").trim();

      bonusIdentityTpl = String(bonusW?.identityByLevel?.[bonusLevel] || "").trim();
      bonusLensTpl = String(bonusW?.lensByLevel?.[bonusLevel] || "").trim();

    } else if (isPractice) {
      endLineTpl = String(practiceW.endLine || "").trim();

      // PRACTICE level: based on mistake ratio (not score — no score in practice)
      const total = clampInt(totalPresented, 0, 99999);
      const mistakeCount = Array.isArray(lastRun.mistakeIds) ? lastRun.mistakeIds.length : 0;
      if (total > 0) {
        const correctRatio = (total - mistakeCount) / total;
        if (correctRatio >= 0.8) practiceLevel = "high";
        else if (correctRatio >= 0.4) practiceLevel = "medium";
        else practiceLevel = "low";
      }

      practiceIdentityTpl = String(practiceW?.identityByLevel?.[practiceLevel] || "").trim();
      practiceLensTpl = String(practiceW?.lensByLevel?.[practiceLevel] || "").trim();

    } else {
      if (isRun && !!lastRun.poolCompleteCelebration) {
        endLineTpl = [String(end.poolCompleteLine1 || "").trim(), String(end.poolCompleteLine2 || "").trim()]
          .filter(Boolean)
          .join(" ")
          .trim();
      } else {
        endLineTpl = String(end.endLine || "").trim();
      }

      if (bestStreakNum >= 20) runVerdictKey = "legendary";
      else if (bestStreakNum >= 15) runVerdictKey = "elite";
      else if (bestStreakNum >= 10) runVerdictKey = "strong";
      else if (bestStreakNum >= 6) runVerdictKey = "building";
      else if (bestStreakNum >= 3) runVerdictKey = "start";
      else runVerdictKey = "none";

      runIdentityTpl = String(end?.identityByVerdict?.[runVerdictKey] || "").trim();
      runLensTpl = String(end?.lensByVerdict?.[runVerdictKey] || "").trim();
    }

    const scoreLine = scoreLineTpl ? fillTemplate(scoreLineTpl, vars) : "";
    const newBestLine = newBestTpl ? fillTemplate(newBestTpl, vars) : "";
    const endLine = endLineTpl ? fillTemplate(endLineTpl, vars) : "";

    // END "Record moment" display: during a short window, show the newBest line instead of the score line.
    const recordUntil = Number(this._runtime?.endRecordMomentUntil || 0);
    const recordActive = (premium && newBest && newBestLine) ? (Date.now() < recordUntil) : false;
    const displayScoreLine = recordActive ? newBestLine : scoreLine;

    const bestStreakTpl = String(end.bestStreakLine || "").trim();
    const bestStreakLine = (isRun && bestStreakTpl) ? fillTemplate(bestStreakTpl, vars) : "";

    const pbLineTpl = String(end.personalBestLine || "").trim();
    const pbPremiumHintTpl = String(end.personalBestPremiumHint || "").trim();

    // Personal best is RUN-only.
    // - Premium: show actual best score line.
    // - Free: show a clear teaser line.
    const pbLine = (isRun && premium && pbLineTpl) ? fillTemplate(pbLineTpl, vars) : "";
    const pbPremiumHint = (isRun && !premium && pbPremiumHintTpl) ? String(pbPremiumHintTpl).trim() : "";

    // Progress UI (RUN only): seen distinct items on this device vs pool size.
    // Copy must come from WT_WORDING (no hardcoded fallback).
    let progressHtml = "";

    if (isRun && this.storage && typeof this.storage.getSeenItemIds === "function") {
      const tpl = String(end.progressLine || "").trim();

      const poolSizeRaw = Number(cfg?.game?.poolSize);
      const poolSize = (Number.isFinite(poolSizeRaw) && poolSizeRaw >= 1) ? Math.floor(poolSizeRaw) : null;

      if (tpl && poolSize != null) {
        let seenDistinct = 0;
        try {
          const ids = this.storage.getSeenItemIds();
          if (Array.isArray(ids)) seenDistinct = ids.length;
        } catch (_) { }

        if (!Number.isFinite(seenDistinct)) seenDistinct = 0;
        seenDistinct = clampInt(seenDistinct, 0, poolSize);

        const remaining = clampInt(poolSize - seenDistinct, 0, poolSize);

        const msg = fillTemplate(tpl, { seen: seenDistinct, poolSize, remaining });
        if (msg) progressHtml = `<p class="wt-muted">${escapeHtml(msg)}</p>`;
      }
    }


    // Free runs hint: meaningful only on RUN end
    let freeRunMessage = "";

    const msgTpl = isRun ? String(w.end?.freeRunLeft || "").trim() : "";

    const remainingRaw = (this.storage && typeof this.storage.getRunsBalance === "function")
      ? this.storage.getRunsBalance()
      : null;

    const remaining = Number(remainingRaw);

    if (isRun && !premium && msgTpl && Number.isFinite(remaining)) {
      const n = clampInt(remaining, 0, 999);
      const msg = fillTemplate(msgTpl, { remaining: n, pluralS: (n === 1 ? "" : "s") });
      freeRunMessage = `<p class="wt-meta wt-truncate">${escapeHtml(msg)}</p>`;
    }

    // END recap: mistakes made during RUN / PRACTICE / BONUS (free + premium)
    let mistakesRecapHtml = "";
    if (isRun || isPractice || isBonus) {
      const ids = Array.isArray(lastRun.mistakeIds) ? lastRun.mistakeIds : [];

      const recapW = isBonus ? (bonusW || {}) : (isPractice ? (practiceW || {}) : (end || {}));

      // Wording priority:
      // - mode-specific mistakes* if present
      // - fallback to end.mistakes* (wording fallback only; no hardcoded copy)
      const noneMsg = String(recapW.mistakesNone || end.mistakesNone || "").trim();
      const toggleTpl = String(recapW.mistakesToggle || end.mistakesToggle || "").trim();
      const title = String(recapW.mistakesTitle || end.mistakesTitle || "").trim();
      if (!ids.length) {
        if (noneMsg) {
          mistakesRecapHtml = `<p class="wt-muted">${escapeHtml(noneMsg)}</p>`;
        }
      } else {
        const labelRaw =
          toggleTpl
            ? fillTemplate(toggleTpl, { count: "" })
            : title;

        const label = String(labelRaw || "")
          .replace(/\(\s*\)/g, "")
          .replace(/\s+/g, " ")
          .trim();

        if (!label) {
          mistakesRecapHtml = "";
        } else {
          const items = [];
          const byId = (this._runtime && this._runtime.contentById && typeof this._runtime.contentById === "object")
            ? this._runtime.contentById
            : {};

          for (const rawId of ids) {
            const id = Number(rawId);
            if (!Number.isFinite(id)) continue;

            const it = byId[String(id)] || null;
            const t = extractTermsFromItem(it);

            const fr = String(t.termFr || "").trim();
            const en = String(t.termEn || "").trim();
            if (!fr && !en) continue;

            const rel =
              (t.correctAnswer === true) ? "=" :
                (t.correctAnswer === false) ? "\u2260" :
                  "";

            if (!rel) continue;

            const expl = String(t.explanationShort || "").trim();
            const pairHtml = `<span class="wt-mistake-pair">${escapeHtml(fr)} (FR) ${rel} ${escapeHtml(en)} (EN)</span>`;
            const explHtml = expl ? `<span class="wt-mistake-expl">\u2192 ${formatExplanationForDisplay(expl, cfg)}</span>` : "";

            items.push(`<div class="wt-mistake-item">${pairHtml}${explHtml}</div>`);
          }


          const body = items.join("");
          mistakesRecapHtml = `
            <details class="wt-accordion" style="margin-top:10px">
              <summary class="wt-accordion-toggle">${escapeHtml(label)}</summary>
              <div class="wt-accordion-content">${body}</div>
            </details>
          `;
        }
      }
    }

    const shareEnabled = isRun && !!(cfg.share && cfg.share.enabled);
    const canPractice = isRun && !!(cfg.mistakesOnly && cfg.mistakesOnly.enabled);

    const runsExhausted = (isRun && !premium && Number.isFinite(remaining) && remaining <= 0);

    const howToPlayAria = String(w.system?.more || "").trim();
    const howToPlayTitle = String(w.system?.more || "").trim();

    const homeLabel = String(w.system?.home || "").trim();
    const homeBtnHtml = homeLabel
      ? `
       <button
        type="button"
        class="wt-btn-icon"
        data-action="go-home"
        aria-label="${escapeHtml(homeLabel)}"
        title="${escapeHtml(homeLabel)}"
      >\u2302</button>
    `
      : ``;

    const poolCompleteCelebration = isRun && !!lastRun.poolCompleteCelebration;

    const endTitle =
      isBonus ? String(bonusW.endTitle || "").trim()
        : isPractice ? String(practiceW.endTitle || "").trim()
          : poolCompleteCelebration ? String(end.poolCompleteTitle || "").trim()
            : String(end.title || "").trim();

    if (!endTitle && this.config?.debug?.enabled) {
      console.warn("[WT_UI] Missing required copy: WT_WORDING.end.title / WT_WORDING.practice.endTitle / WT_WORDING.secretBonus.endTitle");
    }

    // Primary CTA by mode (single END, N intentions)
    const runPlayAgain =
      poolCompleteCelebration
        ? String(w.end?.poolCompleteCtaPrimary || "").trim()
        : (isRun && runVerdictKey)
          ? String(w.end?.ctaByVerdict?.[runVerdictKey] || "").trim()
          : String(w.end?.playAgain || "").trim();

    if ((isRun && runVerdictKey) && !poolCompleteCelebration && !runPlayAgain && this.config?.debug?.enabled) {
      console.warn("[WT_UI] Missing required copy: WT_WORDING.end.ctaByVerdict[verdictKey]");
    }

    const practiceAgain =
      (isPractice && practiceLevel)
        ? String(practiceW?.ctaByLevel?.[practiceLevel] || "").trim()
        : String(practiceW.ctaPracticeAgain || "").trim();

    if ((isPractice && practiceLevel) && !practiceAgain && this.config?.debug?.enabled) {
      console.warn("[WT_UI] Missing required copy: WT_WORDING.practice.ctaByLevel[level]");
    }

    const bonusAgain =
      (isBonus && bonusLevel)
        ? String(bonusW?.ctaByLevel?.[bonusLevel] || "").trim()
        : String(bonusW.ctaPlayAgain || "").trim();

    if ((isBonus && bonusLevel) && !bonusAgain && this.config?.debug?.enabled) {
      console.warn("[WT_UI] Missing required copy: WT_WORDING.secretBonus.ctaByLevel[level]");
    }

    const playAriaRun = String(w.system?.playAria || "").trim();

    const practiceCta = poolCompleteCelebration
      ? String(end.poolCompleteCtaPractice || "").trim()
      : premium
        ? String(end.practiceCta || "").trim()
        : String(end.practiceCtaPremium || "").trim();

    if (!practiceCta && this.config?.debug?.enabled) {
      console.warn("[WT_UI] Missing required copy: WT_WORDING.end.practiceCta / WT_WORDING.end.practiceCtaPremium");
    }


    // End â†’ Paywall bridge (copy must come from WT_WORDING; no hardcoded fallback)
    const paywallBridgeTitle = String(w.paywall?.bridgeTitle || "").trim();
    const paywallBridgeBody = String(w.paywall?.bridgeBody || "").trim();

    // Single source of truth for upgrade CTA (all contexts)
    const upgradeCta = String(w.paywall?.cta || "").trim();

    const shareTitle = String(end.shareTitle || "").trim();

    // Secret chest visibility gate:
    const windowMs = Number(cfg?.secretBonus?.tapWindowMs);
    const tapsRequired = Number(cfg?.secretBonus?.tapsRequired);

    const endAfterRunsRaw = Number(cfg?.secretBonus?.gates?.endAfterRuns);
    const endAfterRuns = (Number.isFinite(endAfterRunsRaw) && endAfterRunsRaw >= 0) ? Math.floor(endAfterRunsRaw) : null;

    let runNumber = 0;
    if (this.storage && typeof this.storage.getRunNumber === "function") {
      try { runNumber = Number(this.storage.getRunNumber() || 0); } catch (_) { runNumber = 0; }
    }

    const meetsRunGate = (endAfterRuns == null) ? true : (Number.isFinite(runNumber) && runNumber >= endAfterRuns);

    const canShowChest =
      Number.isFinite(windowMs) && windowMs > 0 &&
      Number.isFinite(tapsRequired) && tapsRequired >= 1 &&
      meetsRunGate;

    let sbFreeRunsUsed = 0;
    if (this.storage && typeof this.storage.getSecretBonusFreeRunsUsed === "function") {
      try { sbFreeRunsUsed = Number(this.storage.getSecretBonusFreeRunsUsed()); } catch (_) { sbFreeRunsUsed = 0; }
    }

    const chestHintText = (canShowChest && sbFreeRunsUsed === 0)
      ? String(this.wording?.secretBonus?.chestHint || "").trim()
      : "";

    const chestAria = String(this.wording?.secretBonus?.chestAria || "").trim();
    const chestTeaseClass = (!hasSolvedSecretChestHint(cfg)) ? " wt-btn-icon--tease" : "";

    const endActionsClass = `wt-actions wt-actions--stack${isPractice ? " wt-actions--grid" : ""}`;

    const endHeaderRowHtml = `
  <div class="wt-row wt-row--spaced">
    <div style="min-width:0">
      ${renderBrandingRow(cfg, true)}
    </div>

    <div class="wt-row wt-row--tight" style="flex-shrink:0">
      ${homeBtnHtml}

      ${this.state === STATES.LANDING ? `
        <button
          type="button"
          class="wt-btn-icon"
          data-action="open-howto"
          aria-label="${escapeHtml(howToPlayAria)}"
          title="${escapeHtml(howToPlayTitle)}"
        >?</button>
      ` : ``}

      ${canShowChest ? `
        <button
          type="button"
          data-wt-secret="chest"
          class="wt-btn-icon${chestTeaseClass}"
          aria-label="${escapeHtml(chestAria)}"
          title=""
        >🎁</button>
      ` : ``}
    </div>
  </div>
`;

    // Micro-lines (RUN-only): keep END sharp, keep status visible (not buried in Stats)
    const microLines = [];

    // Words seen line: reuse existing UI template (short)
    if (isRun) {
      const seenTpl = String(ui.seenProgressTemplate || "").trim();
      const poolSizeRaw = Number(cfg?.game?.poolSize);
      const poolSizeSafe = (Number.isFinite(poolSizeRaw) && poolSizeRaw >= 1) ? Math.floor(poolSizeRaw) : null;

      if (seenTpl && poolSizeSafe != null) {
        let seenDistinct = 0;
        try {
          const ids = (this.storage && typeof this.storage.getSeenItemIds === "function") ? this.storage.getSeenItemIds() : null;
          if (Array.isArray(ids)) seenDistinct = ids.length;
        } catch (_) { }

        if (!Number.isFinite(seenDistinct)) seenDistinct = 0;
        seenDistinct = clampInt(seenDistinct, 0, poolSizeSafe);

        const msg = fillTemplate(seenTpl, { seen: seenDistinct, poolSize: poolSizeSafe });
        if (msg) microLines.push(`<p class="wt-meta wt-truncate">${escapeHtml(msg)}</p>`);
      }
    }

    // False friends identified (RUN-only): tag === "false_friend" AND correctCount > 0
    if (isRun) {
      const ffTpl = String(end.falseFriendsIdentifiedLine || "").trim();
      if (ffTpl && this.storage && typeof this.storage.getStatsByItem === "function") {
        let statsByItem = {};
        try { statsByItem = this.storage.getStatsByItem() || {}; } catch (_) { statsByItem = {}; }

        const byId = (this._runtime && this._runtime.contentById && typeof this._runtime.contentById === "object")
          ? this._runtime.contentById
          : {};

        let count = 0;
        for (const k in statsByItem) {
          const id = Number(k);
          if (!Number.isFinite(id)) continue;

          const it = byId[String(id)] || null;
          const tag = String(it?.tag || "").trim();
          if (tag !== "false_friend") continue;

          const cc = clampInt(Number(statsByItem[k]?.correctCount), 0, 999999);
          if (cc > 0) count += 1;
        }

        const msg = fillTemplate(ffTpl, { count: String(clampInt(count, 0, 99999)) });
        if (msg) microLines.push(`<p class="wt-meta wt-truncate">${escapeHtml(msg)}</p>`);
      }
    }

    // Best streak (RUN-only): keep it in the same "scoreboard" block
    if (isRun && bestStreakNum >= 2 && bestStreakLine) {
      microLines.push(`<p class="wt-meta wt-truncate">${escapeHtml(bestStreakLine)}</p>`);
    }

    // Runs left (FREE + RUN only) â€” keep existing copy
    if (isRun && !premium && freeRunMessage) {
      microLines.push(String(freeRunMessage || ""));
    }

    const microLinesHtml = microLines.length ? `<div class="wt-stack wt-stack--tight">${microLines.join("")}</div>` : "";



    // Stats & runs history (END) intentionally removed (too low value, adds density).
    const statsAccordionHtml = "";


    // Paywall bridge block (FREE exhausted): make it visible, not buried
    const paywallBridgeHtml =
      (runsExhausted && (paywallBridgeTitle || paywallBridgeBody))
        ? `
          <div class="wt-divider"></div>
          <div >
            ${paywallBridgeTitle ? `<strong class="wt-meta">${escapeHtml(paywallBridgeTitle)}</strong>` : ``}
            ${paywallBridgeBody ? `<p class="wt-muted">${escapeHtml(paywallBridgeBody)}</p>` : ``}
          </div>
        `
        : "";

    // HouseAd / Waitlist â€” move into accordion to avoid END scroll fatigue
    const moreAccordionHtml = (() => {
      const unlocked =
        !!(this.storage && typeof this.storage.hasReachedHouseAdThreshold === "function" && this.storage.hasReachedHouseAdThreshold() === true);

      if (!unlocked) return ``;

      const ha = w.houseAd || {};
      const wl = w.waitlist || {};
      const haCfg = cfg.houseAd || {};
      const wlCfg = cfg.waitlist || {};

      const canOpenFull =
        (haCfg.enabled === true) &&
        !!String(haCfg.url || "").trim() &&
        !!(this.storage && typeof this.storage.shouldShowHouseAdNow === "function" && this.storage.shouldShowHouseAdNow({ inRun: false }) === true);

      const canWaitlist = (wlCfg.enabled === true);

      if (!canOpenFull && !canWaitlist) return ``;

      const b1 = String(ha.bodyLine1 || "").trim();
      const b2 = String(ha.bodyLine2 || "").trim();
      const ctaFull = String(ha.ctaPrimary || "").trim();

      const wlTitle = String(wl.endTitle || wl.title || "").trim();
      const wlB1 = String(wl.endBodyLine1 || wl.bodyLine1 || "").trim();
      const wlB2 = String(wl.endBodyLine2 || wl.bodyLine2 || "").trim();

      const wlCta = String(wl.ctaLabel || "").trim();
      const wlDisc = String(wl.disclaimer || "").trim();

      const label = canOpenFull ? ctaFull : (wlTitle || "");

      if (!label) return ``;


      return `
        <details class="wt-accordion" style="margin-top:10px">
          <summary class="wt-accordion-toggle">${escapeHtml(label)}</summary>
          <div class="wt-accordion-content">
            ${canOpenFull ? `
              ${b1 ? `<p class="wt-muted">${escapeHtml(b1)}</p>` : ``}
              ${b2 ? `<p class="wt-muted">${escapeHtml(b2)}</p>` : ``}
            ` : ``}

            ${(!canOpenFull && canWaitlist) ? `
              ${wlB1 ? `<p class="wt-muted">${escapeHtml(wlB1)}</p>` : ``}
              ${wlB2 ? `<p class="wt-muted">${escapeHtml(wlB2)}</p>` : ``}
            ` : ``}

            <div class="wt-actions">
              ${canWaitlist && wlCta ? `
                <button class="wt-btn wt-btn--secondary" data-action="open-waitlist">${escapeHtml(wlCta)}</button>
              ` : ``}

              ${canOpenFull && ctaFull ? `
                <button class="wt-btn wt-btn--primary" data-action="open-house-ad">${escapeHtml(ctaFull)}</button>
              ` : ``}
            </div>

            ${wlDisc ? `<p class="wt-muted">${escapeHtml(wlDisc)}</p>` : ``}
          </div>
        </details>
      `;
    })();

    const shareHtml = shareEnabled ? `
      ${(() => {
        const share = w.share || {};
        const title = String(shareTitle || "").trim();
        const ctaLabel = String(share.ctaLabel || "").trim();
        const emailLabel = String(share.emailLabel || "").trim();
        const emailSubject = String(share.emailSubject || "").trim();
        const shareAria = String(w.system?.shareAria || "").trim();
        const text = String(this._getShareText ? this._getShareText() : "").trim();

        const canCopy = !!(ctaLabel && text);
        const canEmail = !!(emailLabel && emailSubject && text);

        if (!title && !text) return ``;
        if (!canCopy && !canEmail && !text) return ``;

        return `
          <details class="wt-accordion" style="margin-top:10px">
            <summary class="wt-accordion-toggle" aria-label="${escapeHtml(shareAria)}">
              ${escapeHtml(title)}
            </summary>

            <div class="wt-accordion-content">
                ${text ? `<p class="wt-muted" style="white-space: pre-wrap; overflow-wrap: anywhere; word-break: break-word;">${escapeHtml(text)}</p>` : ``}


              ${(canCopy || canEmail) ? `
                <div class="wt-actions">
                  ${canCopy ? `
                    <button type="button" class="wt-btn wt-btn--secondary" data-action="copy-share">
                      ${escapeHtml(ctaLabel)}
                    </button>
                  ` : ``}

                  ${canEmail ? `
                    <button type="button" class="wt-btn wt-btn--secondary" data-action="send-share-email">
                      ${escapeHtml(emailLabel)}
                    </button>
                  ` : ``}
                </div>
              ` : ``}
            </div>
          </details>
        `;
      })()}
    ` : ``;


    return `
<div class="wt-card">
  ${endHeaderRowHtml}

  <div class="wt-stack">
    ${chestHintText ? `<p class="wt-muted wt-text-end" style="margin-top:4px">${escapeHtml(chestHintText)}</p>` : ``}
     ${displayScoreLine ? `
        <p class="wt-h2 wt-end-score">
  <span class="wt-end-score__value">
    ${escapeHtml(displayScoreLine)}
  </span>

  ${recordActive ? `
    <span class="wt-end-score__burst" aria-hidden="true"></span>
    <svg class="wt-end-score__spark" viewBox="0 0 36 14" width="36" height="14" aria-hidden="true" focusable="false">
      <path d="M6 1 L7.6 5.2 L12 6.2 L7.6 7.2 L6 11.4 L4.4 7.2 L0 6.2 L4.4 5.2 Z" fill="currentColor" opacity="0.85"></path>
      <path d="M18 2.2 L19.2 5.4 L22.6 6.4 L19.2 7.4 L18 10.6 L16.8 7.4 L13.4 6.4 L16.8 5.4 Z" fill="currentColor" opacity="0.6"></path>
      <path d="M30 1 L31.4 4.6 L35 5.8 L31.4 7 L30 10.6 L28.6 7 L25 5.8 L28.6 4.6 Z" fill="currentColor" opacity="0.75"></path>
    </svg>
  ` : ``}
</p>

   ` : ``}


        ${microLinesHtml}


    ${(() => {
        if (isBonus || isPractice) {
          return endLine ? `<p class="wt-meta">${escapeHtml(endLine)}</p>` : ``;
        }

        if (chancesLeft == null) return ``;
        if (clampInt(chancesLeft, 0, 99) === 0) return ``;
        return endLine ? `<p class="wt-meta">${escapeHtml(endLine)}</p>` : ``;
      })()}


    ${(isBonus && bonusIdentityTpl) ? `<p class="wt-muted">${escapeHtml(bonusIdentityTpl)}</p>` : ``}
    ${(isBonus && bonusLensTpl) ? `<p class="wt-muted">${escapeHtml(bonusLensTpl)}</p>` : ``}

    ${(isPractice && practiceIdentityTpl) ? `<p class="wt-muted">${escapeHtml(practiceIdentityTpl)}</p>` : ``}
    ${(isPractice && practiceLensTpl) ? `<p class="wt-muted">${escapeHtml(practiceLensTpl)}</p>` : ``}

    ${(isRun && runIdentityTpl) ? `<p class="wt-muted">${escapeHtml(runIdentityTpl)}</p>` : ``}
    ${(isRun && runLensTpl) ? `<p class="wt-muted">${escapeHtml(runLensTpl)}</p>` : ``}

    <div class="${endActionsClass}">
      ${(() => {
        const haCfg = cfg.houseAd || {};
        const wlCfg = cfg.waitlist || {};

        const canHouseAd =
          !!(this.storage &&
            typeof this.storage.shouldShowHouseAdNow === "function" &&
            this.storage.shouldShowHouseAdNow({ inRun: false }) === true);

        const canWaitlist =
          !!(this.storage &&
            typeof this.storage.shouldShowWaitlistNow === "function" &&
            this.storage.shouldShowWaitlistNow({ inRun: false }) === true);

        // Case 4 â€” Premium + unlocked â†’ post-completion routing (RUN only)
        // KISS: never remove the main "play again" move.
        // HouseAd / Waitlist live in the accordion (moreAccordionHtml) to avoid END feeling like a menu.
        if (isRun && premium && (canHouseAd || canWaitlist)) {
          if (!runPlayAgain) return ``;

          return `
            <button class="wt-btn wt-btn--primary" data-action="start-run" aria-label="${escapeHtml(playAriaRun)}">
              ${escapeHtml(runPlayAgain)}
            </button>
          `;
        }


        // RUN exhausted â†’ paywall primary (+ never leave user with no move)
        if (runsExhausted) {
          return `
            <button class="wt-btn wt-btn--primary" data-action="open-paywall">
              ${escapeHtml(upgradeCta)}
            </button>
            ${homeLabel ? `
              <button class="wt-btn wt-btn--secondary" data-action="go-home">
                ${escapeHtml(homeLabel)}
              </button>
            ` : ``}
           
          `;
        }

        // Pool complete (premium): primary = Practice (if available), but ALWAYS allow replay
        if (isRun && premium && poolCompleteCelebration) {
          if (canPractice && practiceCta) {
            return `
              <button class="wt-btn wt-btn--primary" data-action="start-practice">
                ${escapeHtml(practiceCta)}
              </button>
              ${runPlayAgain ? `
                <button class="wt-btn wt-btn--ghost" data-action="start-run" aria-label="${escapeHtml(playAriaRun)}">
                  ${escapeHtml(runPlayAgain)}
                </button>
              ` : ``}
            `;
          }
          // If Practice isn't available, fall back to normal RUN replay below.
        }

        if (isPractice) {
          if (!practiceAgain) return ``;
          return `
            <button class="wt-btn wt-btn--primary" data-action="start-practice" aria-label="${escapeHtml(practiceAgain)}">
              ${escapeHtml(practiceAgain)}
            </button>
            ${homeLabel ? `
              <button class="wt-btn wt-btn--secondary" data-action="go-home">
                ${escapeHtml(homeLabel)}
              </button>
            ` : ``}
          `;
        }

        if (isBonus) {
          if (!bonusAgain) return ``;
          return `
            <button class="wt-btn wt-btn--primary" data-action="start-secret-bonus" aria-label="${escapeHtml(bonusAgain)}">
              ${escapeHtml(bonusAgain)}
            </button>
            ${homeLabel ? `
              <button class="wt-btn wt-btn--ghost" data-action="go-home">
                ${escapeHtml(homeLabel)}
              </button>
            ` : ``}
          `;
        }

        if (!runPlayAgain) return ``;
        return `
          <button class="wt-btn wt-btn--primary" data-action="start-run" aria-label="${escapeHtml(playAriaRun)}">
            ${escapeHtml(runPlayAgain)}
          </button>
        `;

      })()}

      ${(() => {
        const exhausted =
          !!(this.storage &&
            typeof this.storage.hasSeenAllWordTraps === "function" &&
            this.storage.hasSeenAllWordTraps() === true);

        // Secondary CTAs only when the primary is RUN replay
        if (!isRun) return ``;
        if (!premium) return ``;
        if (exhausted) return ``;
        if (runsExhausted) return ``;

        // Only show Practice if the user actually has enough mistakes.
        const minWrong = clampInt(Number(cfg?.mistakesOnly?.minWrongItemsToShowToggle), 1, 9999);

        let statsByItem = {};
        if (this.storage && typeof this.storage.getStatsByItem === "function") {
          try { statsByItem = this.storage.getStatsByItem() || {}; } catch (_) { statsByItem = {}; }
        }

        let mistakesCount = 0;
        for (const k in statsByItem) {
          const wc = clampInt(Number(statsByItem[k]?.wrongCount), 0, 999999);
          if (wc > 0) mistakesCount += 1;
        }

        if (!Number.isFinite(mistakesCount) || mistakesCount < minWrong) return ``;

        return canPractice ? `
  <button class="wt-btn wt-btn--secondary" data-action="start-practice">
    ${escapeHtml(practiceCta)}
  </button>
` : ``;


      })()}



      ${(premium || runsExhausted || canPractice) ? `` : `
        <button class="wt-btn wt-btn--ghost" data-action="open-paywall">
          ${escapeHtml(upgradeCta)}
        </button>
      `}
    </div>

    ${paywallBridgeHtml}

    ${mistakesRecapHtml}

    ${shareHtml}

    ${moreAccordionHtml}
  </div>
</div>
`;
  };


  UI.prototype._renderPlaying = function () {
    const wAll = this.wording || {};
    const w = wAll.playing || {};
    const ui = wAll.ui || {};
    const cfg = this.config || {};

    // Get live state from game engine
    const gameState = this.game.getState ? this.game.getState() : {};

    // Contract: PRACTICE has null chances → respect null (no fallback to config)
    const maxChancesRaw = gameState.maxChances;
    const maxChances = (maxChancesRaw != null) ? Number(maxChancesRaw) : Number(cfg.game?.maxChances);
    const chancesLeftRaw = gameState.chancesLeft;
    const chancesLeft = (chancesLeftRaw != null) ? Number(chancesLeftRaw) : NaN;
    const hasChances = (chancesLeftRaw != null && Number.isFinite(maxChances) && maxChances > 0 && Number.isFinite(chancesLeft));
    const scoreFP = Number(gameState.scoreFP);

    // Visual chances indicator (filled/empty circles)
    const chancesVisual = (Number.isFinite(maxChances) && maxChances > 0 && Number.isFinite(chancesLeft))
      ? Array(maxChances)
        .fill(null)
        .map((_, i) => (i < chancesLeft ? "\u25C9" : "\u25CE"))
        .join("")
      : "";

    const chancesLabel = String(ui.chancesLabel || "").trim();
    const scoreLabel = String(ui.scoreLabel || "").trim();

    const fpShort = String(ui.fpShort || "").trim();
    const scoreAriaTpl = String(ui.scoreAriaTemplate || "").trim();

    // HUD policy: do NOT show FP in PLAYING (unit is explicit in END only).
    // We still replace {fpShort} in aria templates to avoid leaking "{fpShort}".
    const scoreAria = scoreAriaTpl
      ? fillTemplate(scoreAriaTpl, { scoreLabel, score: scoreFP, fpShort: "" }).replace(/\s+/g, " ").trim()
      : "";

    // Personal best (HUD anchor): show only if explicitly enabled + Premium + best exists
    const bestLabel = String(ui?.bestScoreLabel || "").trim();
    const bestAriaTpl = String(ui?.bestScoreAriaTemplate || "").trim();

    const pbCfg = (cfg?.personalBest && typeof cfg.personalBest === "object") ? cfg.personalBest : null;
    const pbEnabled = !!(pbCfg && pbCfg.enabled === true);

    let bestScoreFP = null;
    if (pbEnabled && premium && this.storage && typeof this.storage.getPersonalBest === "function") {
      try {
        const pb = this.storage.getPersonalBest() || null;
        const b = Number(pb?.bestScoreFP);
        if (Number.isFinite(b) && b > 0) bestScoreFP = Math.floor(b);
      } catch (_) { bestScoreFP = null; }
    }

    const bestAria = (bestScoreFP != null && bestAriaTpl)
      ? fillTemplate(bestAriaTpl, { best: bestScoreFP }).replace(/\s+/g, " ").trim()
      : "";

    const scoreAriaFull = [scoreAria, bestAria].filter(Boolean).join(" ").trim();

    const bestHtml = (bestScoreFP != null && bestLabel)
      ? `<span class="wt-pill__sub">${escapeHtml(bestLabel)}: ${bestScoreFP}</span>`
      : "";

    // Header (Chances left, Score right)
    const pulseAt = Number(this._runtime?.chanceLostPulseAt || 0);

    // Expected: WT_CONFIG.ui.gameplayPulseMs (number, milliseconds)
    const pulseMs = Number(cfg?.ui?.gameplayPulseMs);

    // Fail-closed: invalid/missing config => no pulse
    const pulseOn =
      (pulseAt > 0) &&
      Number.isFinite(pulseMs) &&
      (pulseMs > 0) &&
      ((Date.now() - pulseAt) <= pulseMs);

    // One-shot: "last chance" pulse (entering chancesLeft === 1)
    const lastChancePulseAt = Number(this._runtime?.lastChancePulseAt || 0);
    const lastChancePulseOn =
      (lastChancePulseAt > 0) &&
      Number.isFinite(pulseMs) &&
      (pulseMs > 0) &&
      ((Date.now() - lastChancePulseAt) <= pulseMs);

    // Score flash: mirrors danger-pulse logic (correct answer â†’ green flash)
    const scoreFlashAt = Number(this._runtime?.scoreFlashAt || 0);
    const scoreFlashMs = Number(cfg?.ui?.gameplayPulseMs);
    const scoreFlashOn =
      (scoreFlashAt > 0) &&
      Number.isFinite(scoreFlashMs) &&
      (scoreFlashMs > 0) &&
      ((Date.now() - scoreFlashAt) <= scoreFlashMs);

    // HUD deltas (arcade): +1 on score flash, +1 mistake on mistake pulse
    // Copy visible => WT_WORDING.ui (pas WT_CONFIG)
    const scoreDeltaText = String(ui?.scoreGainedDeltaText || "").trim();
    const scoreDeltaHtml = (scoreFlashOn && scoreDeltaText)
      ? `<span class="wt-pill__delta" aria-hidden="true">${escapeHtml(scoreDeltaText)}</span>`
      : "";

    const mistakeDeltaText = String(ui?.mistakeGainedDeltaText || "").trim();
    const mistakeDeltaHtml = (pulseOn && mistakeDeltaText)
      ? `<span class="wt-pill__delta wt-pill__delta--minus" aria-hidden="true">${escapeHtml(mistakeDeltaText)}</span>`
      : "";

    const modeNow = String(this._runtime?.runMode || "RUN").trim();
    const bonusBadge = String(this.wording?.secretBonus?.badge || "").trim();

    // HUD logo (fail-closed): only show if explicitly configured.
    const hudLogoUrl = String(cfg?.identity?.uiLogoUrl || "").trim();

    const seenOnlyLine = String(this.wording?.secretBonus?.seenOnlyLine || "").trim();
    const servedSoFar = Array.isArray(this._runtime?.runItemIds) ? this._runtime.runItemIds.length : 0;

    let seenProgressHtml = "";

    const qHeadingTpl = String(w.questionHeadingTemplate || "").trim();
    const qNum = (this._runtime?.feedbackPending === true) ? servedSoFar : (servedSoFar + 1);
    const headingHtml = (qHeadingTpl && Number.isFinite(qNum) && qNum > 0)
      ? `<p class="wt-muted" style="margin:0 0 4px">${escapeHtml(fillTemplate(qHeadingTpl, { n: qNum }))}</p>`
      : "";

    const showSeenOnlyRule =
      (modeNow === "BONUS") &&
      (servedSoFar === 0) &&
      (this._runtime?.feedbackPending !== true) &&
      !!seenOnlyLine;

    // --- NEW: Mistakes model ---
    const mistakesLabel = String(ui.mistakesLabel || "").trim();

    const mcInt = (Number.isFinite(maxChances) && maxChances > 0)
      ? Math.floor(maxChances)
      : 0;

    const leftInt = Number.isFinite(chancesLeft)
      ? Math.max(0, Math.floor(chancesLeft))
      : 0;

    const mistakesCount = (mcInt > 0)
      ? Math.max(0, Math.min(mcInt, mcInt - leftInt))
      : 0;

    // Filled circles = mistakes already made
    const mistakesVisual = (mcInt > 0)
      ? Array(mcInt)
        .fill(null)
        .map((_, i) => (i < mistakesCount ? "\u25C9" : "\u25CE"))
        .join("")
      : "";

    // Dynamic color tier
    let mistakeTierClass = "";
    if (mistakesCount === mcInt) {
      mistakeTierClass = " wt-pill--danger";
    } else if (mistakesCount === mcInt - 1) {
      mistakeTierClass = " wt-pill--warning";
    }

    const headerHtml = `
	    <div class="wt-row wt-row--spaced" style="margin-bottom:12px; align-items:center; flex-wrap:nowrap; gap:12px">
	      <div class="wt-row" style="gap:8px; align-items:center; flex-wrap:nowrap; min-width:0">
	        ${hasChances ? `
	          <div class="wt-pill wt-pill--chances${mistakeTierClass}${pulseOn ? " wt-pill--danger-pulse" : ""}"
	           aria-label="${escapeHtml(mistakesLabel)}: ${mistakesCount}/${mcInt}">
	            <span>${escapeHtml(mistakesLabel)}: ${mistakesCount}/${mcInt}</span>${mistakeDeltaHtml}<span style="margin-left:4px">${mistakesVisual}</span>
	          </div>
	        ` : ``}

	        ${(modeNow === "BONUS" && bonusBadge) ? `
	          <div class="wt-pill" aria-label="${escapeHtml(bonusBadge)}">
	            ${hudLogoUrl ? `<img src="${escapeHtml(hudLogoUrl)}" alt="" class="wt-pill__logo" />` : ``}
	            <span>${escapeHtml(bonusBadge)}</span>
	          </div>
	        ` : ``}
	      </div>

	       ${(modeNow !== "PRACTICE") ? `
	               <div class="wt-pill wt-pill--score${scoreFlashOn ? " wt-pill--score-flash" : ""}"
	           aria-label="${escapeHtml(scoreAriaFull)}">
	        ${escapeHtml(scoreLabel)}: ${scoreFP}${scoreDeltaHtml}${bestHtml}
	      </div>
	        ` : ``}

	    </div>

	    ${showSeenOnlyRule ? `
	      <p class="wt-muted" style="margin:-6px 0 12px; text-align:center;">
	        ${escapeHtml(seenOnlyLine)}
	      </p>
	    ` : ``}
	  `;

    // Current item (question)
    const item = this._runtime.feedbackPending
      ? this._runtime.frozenItem
      : (this.game.getCurrent ? this.game.getCurrent() : null);

    // Secret bonus fall: only if config is explicitly provided and valid.
    const sb = cfg?.secretBonus || {};
    const fall = (sb && typeof sb === "object") ? sb.fall : null;

    const fallEnabled =
      (modeNow === "BONUS") &&
      (fall && typeof fall === "object") &&
      (fall.enabled === true) &&
      Number.isFinite(Number(fall.initialSpeed)) &&
      Number(fall.initialSpeed) > 0 &&
      Number.isFinite(Number(fall.maxSpeed)) &&
      Number(fall.maxSpeed) > 0 &&
      Number.isFinite(Number(fall.speedIncrement)) &&
      Number(fall.speedIncrement) >= 0 &&
      Number.isFinite(Number(fall.dangerThreshold)) &&
      Number(fall.dangerThreshold) > 0 &&
      Number(fall.dangerThreshold) < 1;

    const bonusAttr = fallEnabled ? ` data-wt-bonus="fall"` : "";

    const logoUrl = String(cfg?.identity?.uiLogoUrl || "").trim();
    const bonusTitle = String(this.wording?.secretBonus?.title || "").trim();
    const bonusSubtitle = String(this.wording?.secretBonus?.subtitle || "").trim();

    // PLAYING: branding always visible (Option A)
    // KISS: reuse the existing go-home action so BONUS can exit the same way as other modes.
    let brandingHtml = renderBrandingRow(cfg, true, false);

    if (modeNow === "BONUS") {
      brandingHtml = `
        ${renderBrandingRow(cfg, true, false)}
        ${bonusSubtitle ? `
          <p class="wt-muted" style="margin:-10px 0 12px;">
            ${escapeHtml(bonusSubtitle)}
          </p>
        ` : ``}
      `;
    }


    function renderShell(innerHtml) {
      return `
  <div class="wt-container"${bonusAttr}>
    ${brandingHtml}
    ${headingHtml}
    ${headerHtml}
    ${innerHtml}
  </div>
`;
    }


    if (!item) {
      return renderShell(`
      <div class="wt-card">
        <p class="wt-muted">${escapeHtml(String(wAll.system?.loading || "").trim())}</p>
      </div>
    `);
    }

    const termFr = String(item.termFr || "").trim();
    const termEn = String(item.termEn || "").trim();

    const bonusPrompt = String(this.wording?.secretBonus?.questionPrompt || "").trim();

    const showMicroHowTo =
      (modeNow === "RUN");

    // microHowTo on every RUN; otherwise empty (no fallback)
    const microHowTo = showMicroHowTo ? String(w.microHowTo || "").trim() : "";

    // PRACTICE: calm progress line instead of assertion
    // RUN: assertion only when NOT showing microHowTo (to avoid double line)
    // BONUS: no assertion
    let questionPrompt = "";
    if (modeNow === "PRACTICE") {
      const deckTotal = (this.game && typeof this.game.getTotal === "function") ? this.game.getTotal() : 0;
      const progressTpl = String(wAll.practice?.playingProgressLine || "").trim();
      questionPrompt = (progressTpl && deckTotal > 0)
        ? fillTemplate(progressTpl, { current: qNum, total: deckTotal })
        : "";
    } else if (modeNow !== window.WT_ENUMS.GAME_MODES.BONUS) {
      questionPrompt = showMicroHowTo ? "" : String(w.assertion || "").trim();
    }
    const questionHtml = `
${microHowTo ? `
  <p class="wt-meta" style="margin-bottom:8px; text-align:center; font-size:var(--fs-md); font-weight:700;">
    ${escapeHtml(microHowTo)}
  </p>
` : ``}


${questionPrompt ? `
  <p class="wt-meta" style="margin-bottom:8px; text-align:center; font-size:var(--fs-md); font-weight:700;">
    ${escapeHtml(questionPrompt)}
  </p>
` : ``}
<div class="wt-terms-box">
  <div class="wt-term-row">
    <span class="wt-term-word">${escapeHtml(termFr)}</span>
    <span class="wt-term-lang">FR</span>
  </div>
  <div class="wt-term-row">
    <span class="wt-term-word">${escapeHtml(termEn)}</span>
    <span class="wt-term-lang">EN</span>
  </div>
</div>
`;


    // If feedback is pending but temporarily hidden (chance lost focus), show frozen item only (no choices).
    if (this._runtime.feedbackPending && this._runtime.feedbackReveal !== true) {
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
      const feedbackClass = isCorrect ? "wt-feedback--ok" : "wt-feedback--bad";

      const verdictText = isCorrect
        ? String(w.feedbackTitleOk || "").trim()
        : String(w.feedbackTitleBad || "").trim();

      // Show the clicked choice label before the verdict (no fallback)
      const pickedLabel = (ans.pickedAnswer === true)
        ? String(ui.trueLabel || "").trim()
        : String(ui.falseLabel || "").trim();

      const titleLead = pickedLabel ? `${pickedLabel} - ` : "";
      const titleLine = `${titleLead}${verdictText}`;

      const continueCta = String(wAll.system?.continue || "").trim();
      const tapToContinue = String(wAll.system?.tapToContinue || "").trim();

      // Stable explanation for the frozen item during feedback (KISS)
      const stableExplanation = String(ans.feedbackLine || "").trim();

      const explanationHtml = stableExplanation
        ? `<p class="wt-explanation">${(ans.correctAnswer === false)
          ? formatExplanationForDisplay(stableExplanation, cfg, termFr, termEn)
          : formatExplanationForDisplay(stableExplanation, cfg)
        }</p>`
        : "";

      return renderShell(`
  <div class="wt-card" role="status" aria-live="polite" data-action="continue" style="cursor:pointer">
    ${questionHtml}

    <div class="wt-feedback ${feedbackClass}" style="padding:10px; border-radius:var(--r-btn);">
      <strong class="wt-feedback-title">
                    ${escapeHtml(titleLine)}: ${escapeHtml(termFr)} (FR) ${ans.correctAnswer === true ? "=" : "\u2260"} ${escapeHtml(termEn)} (EN)
      </strong>
    </div>

            ${explanationHtml}


            <div class="wt-actions" style="margin-top:16px">
      <button class="wt-btn wt-btn--primary" data-action="continue">
        ${escapeHtml(continueCta)}
      </button>
    </div>


    ${shouldTapToContinue() && tapToContinue ? `
      <p class="wt-muted wt-tap-hint" style="margin-top:8px">
        ${escapeHtml(tapToContinue)}
      </p>
    ` : ``}
  </div>
`);

    }

    const trueLabel = String(ui.trueLabel || "").trim();
    const falseLabel = String(ui.falseLabel || "").trim();

    // Default: show question with True/False buttons
    // Secret bonus fall adds semantic wrappers only (CSS decides fixed/no-scroll layout).
    const danger01 = fallEnabled ? Number(fall.dangerThreshold) : 0;

    const dangerLabel = fallEnabled ? String(this.wording?.secretBonus?.dangerLineLabel || "").trim() : "";
    const dangerAria = fallEnabled ? String(this.wording?.secretBonus?.dangerLineAria || "").trim() : "";

    return renderShell(`
    <div class="wt-card">
      ${fallEnabled ? `
        <div class="wt-bonus-lane" data-wt-bonus-lane>
          <div class="wt-bonus-fail-line" data-wt-bonus-fail style="top:${Math.round(danger01 * 100)}%"></div>
          ${dangerLabel ? `
            <div class="wt-bonus-fail-label" data-wt-bonus-fail-label style="top:${Math.round(danger01 * 100)}%" aria-label="${escapeHtml(dangerAria || dangerLabel)}">
              ${escapeHtml(dangerLabel)}
            </div>
          ` : ``}
          <div class="wt-bonus-chip" data-wt-bonus-chip>
            ${questionHtml}
          </div>
        </div>
      ` : `
        ${questionHtml}
      `}

      <div class="wt-choices">
  <button class="wt-choice wt-choice--same" data-action="answer-true" aria-label="${escapeHtml([trueLabel, fillTemplate(String(w.feedbackRelationSameTemplate || "").trim(), { termFr, termEn })].filter(Boolean).join(": "))}">
    <span class="wt-choice-icon">\u2714
    </span>
    ${escapeHtml(trueLabel)}
  </button>
  <button class="wt-choice wt-choice--diff" data-action="answer-false" aria-label="${escapeHtml([falseLabel, fillTemplate(String(w.feedbackRelationDifferentTemplate || "").trim(), { termFr, termEn })].filter(Boolean).join(": "))}">
    <span class="wt-choice-icon">\u2716</span>
    ${escapeHtml(falseLabel)}
  </button>
</div>



    </div>
  `);
  };


  UI.prototype._renderPaywall = function () {
    const w = this.wording || {};
    const pay = w.paywall || {};
    const cfg = this.config || {};
    const premium = (this.storage && typeof this.storage.isPremium === "function") ? this.storage.isPremium() : false;

    if (premium) {
      const playLabel = String(w.landing?.ctaPlay || "").trim();

      return `
      ${renderBrandingRow(cfg, true)}
          <div class="wt-card wt-card--hero">
      <h1 class="wt-h1">${escapeHtml(headline)}</h1>
        <p class="wt-muted">${escapeHtml(String(w.howto?.alreadyPremium || "").trim())}</p>
        <div class="wt-actions">
          <button class="wt-btn wt-btn--primary" data-action="start-run" aria-label="${escapeHtml(playLabel)}">
            ${escapeHtml(playLabel)}
          </button>
          <button class="wt-btn wt-btn--secondary" data-action="go-home">${escapeHtml(String(w.system?.home || "").trim())}</button>
        </div>
      </div>
    `;
    }



    // Early price timer (no UI fallback: storage must provide the state)
    let ep = null;
    if (this.storage && typeof this.storage.getEarlyPriceState === "function") {
      try { ep = this.storage.getEarlyPriceState() || null; } catch (_) { ep = null; }
    }

    const currency = String(cfg.currency || "").trim();
    const early = formatCents(cfg.earlyPriceCents, currency);
    const standard = formatCents(cfg.standardPriceCents, currency);

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

    // Headline (LAST FREE RUN override)
    // Use storage-first runsBalance because PAYWALL can render before startRun assigns runType.
    let runsBalance = NaN;
    try {
      if (this.storage && typeof this.storage.getRunsBalance === "function") {
        runsBalance = Number(this.storage.getRunsBalance());
      }
    } catch (_) { runsBalance = NaN; }

    const isLastFree =
      (Number.isFinite(runsBalance) && runsBalance <= 0) ||
      (this._runtime && this._runtime.runType === "LAST_FREE");

    const headline =
      isLastFree && pay.headlineLastFree
        ? String(pay.headlineLastFree).trim()
        : String(pay.headline || "").trim();



    const valueTitle = String(pay.valueTitle || "").trim();
    const trustTitle = String(pay.trustTitle || "").trim();

    const valueBullets = Array.isArray(pay.valueBullets) ? pay.valueBullets : [];
    const trustLine = String(pay.trustLine || "").trim();
    const trustBullets = Array.isArray(pay.trustBullets) ? pay.trustBullets : [];
    const notNowLabel = String(w.system?.notNow || "").trim();

    // Progress projection (storage-first â†’ paywall)
    // Source of truth: StorageManager.getSeenItemIds() (counts unique items ever seen).
    let seen = NaN;

    try {
      if (this.storage && typeof this.storage.getSeenItemIds === "function") {
        const ids = this.storage.getSeenItemIds();
        if (Array.isArray(ids)) seen = Number(ids.length);
      }
    } catch (_) { /* ignore */ }

    if (!Number.isFinite(seen)) {
      seen = Number(this._runtime?.seenCount);
    }

    const poolSize = Number(cfg?.game?.poolSize);
    const remaining =
      (Number.isFinite(seen) && Number.isFinite(poolSize))
        ? Math.max(0, poolSize - seen)
        : NaN;

    const progressLine1Tpl = String(pay.progressLine1 || "").trim();
    const progressLine2Tpl = String(pay.progressLine2 || "").trim();

    const progressLine1 =
      (progressLine1Tpl && Number.isFinite(seen) && Number.isFinite(poolSize))
        ? fillTemplate(progressLine1Tpl, { seen, poolSize })
        : "";

    const progressLine2Raw =
      (progressLine2Tpl && Number.isFinite(remaining))
        ? fillTemplate(progressLine2Tpl, { remaining })
        : "";

    // Defensive de-duplication (handles accidental repeated sentence separated by blank lines / newlines)
    const progressLine2 = (() => {
      const t = String(progressLine2Raw || "").trim();
      if (!t) return "";
      const parts = t.split(/\n+/).map(s => s.trim()).filter(Boolean);
      if (parts.length >= 2 && parts.every(p => p === parts[0])) return parts[0];
      return t;
    })();


    const ctaEarly = String(pay.ctaEarly || "").trim();
    const ctaStandard = String(pay.ctaStandard || "").trim();
    const ctaFallback = String(pay.cta || "").trim();
    const primaryCta = isEarly ? (ctaEarly || ctaFallback) : (ctaStandard || ctaFallback);

    // EARLY savings bump (no fallback: requires template + valid cents)
    const savingsTpl = String(pay.savingsLineTemplate || "").trim();
    const earlyCents = Number(cfg.earlyPriceCents);
    const standardCents = Number(cfg.standardPriceCents);
    const saveCents =
      (Number.isFinite(earlyCents) && Number.isFinite(standardCents))
        ? Math.round(standardCents - earlyCents)
        : NaN;

    const saveAmount =
      (Number.isFinite(saveCents) && saveCents > 0)
        ? formatCents(saveCents, currency)
        : "";

    const savingsLine =
      (isEarly && savingsTpl && saveAmount)
        ? fillTemplate(savingsTpl, { saveAmount, earlyPrice: early, standardPrice: standard })
        : "";

    const checkoutNote = String(pay.checkoutNote || "").trim();
    const deviceNote = String(pay.deviceNote || "").trim();

    // Bullets: use existing .wt-list (better rhythm + less â€œpavÃ©â€)
    const renderBullets = (arr, muted) => {
      if (!arr.length) return "";
      const cls = `wt-list${muted ? " wt-muted" : ""}`;
      const items = arr
        .map(x => String(x || "").trim())
        .filter(Boolean)
        .map(x => `<li>${escapeHtml(x)}</li>`)
        .join("");
      return `<ul class="${cls}">${items}</ul>`;
    };

    // PW1: Social proof (optional - no invented claims)
    const socialProofTitle = String(pay.socialProofTitle || "").trim();
    const socialProofQuote = String(pay.socialProofQuote || "").trim();
    const socialProofAuthor = String(pay.socialProofAuthor || "").trim();

    const renderSocialProof = () => {
      if (!socialProofTitle && !socialProofQuote && !socialProofAuthor) return "";

      return `
        <div class="wt-box">
          ${socialProofTitle ? `<div class="wt-meta">${escapeHtml(socialProofTitle)}</div>` : ``}
          ${socialProofQuote ? `<div style="margin-top:6px;font-weight:500">â€œ${escapeHtml(socialProofQuote)}â€</div>` : ``}
          ${socialProofAuthor ? `<div class="wt-muted" style="margin-top:6px">${escapeHtml(socialProofAuthor)}</div>` : ``}
        </div>
      `;
    };

    const renderUrgencyBanner = () => {
      if (!isEarly) return "";
      if (!urgencyEnabled) return "";

      const label = String(pay.timerLabel || "").trim();
      if (!label) return "";

      const cls = `wt-box wt-box--tinted`;

      return `
        <div class="${cls}" role="status" aria-live="polite">
          <div class="wt-meta">${escapeHtml(label)}</div>
          <div class="wt-h2${urgencyPulse ? ' wt-pulse' : ''}" style="margin:4px 0 0;color:rgb(var(--primary-dark))">${escapeHtml(timer)}</div>
        </div>
      `;
    };

    // PW2: Make EARLY price visually stand out (wrapper + optional badge)
    const earlyBadge = String(pay.earlyBadgeLabel || "").trim();

    const renderPriceBlock = () => {
      const wrapClass = `wt-box${isEarly ? " wt-box--strike" : ""}`;

      const post1Tpl = String(pay.postEarlyLine1 || "").trim();
      const post2Tpl = String(pay.postEarlyLine2 || "").trim();

      const post1 = post1Tpl ? fillTemplate(post1Tpl, { standardPrice: standard }) : "";
      const post2 = post2Tpl ? fillTemplate(post2Tpl, { standardPrice: standard }) : "";

      if (isEarly) {
        return `
      <div class="${wrapClass}">
        ${earlyBadge ? `<div class="wt-tag">${escapeHtml(earlyBadge)}</div>` : ``}
        <div class="wt-row wt-row--spaced wt-row--top">
          <div>
            <p class="wt-meta" style="margin:0">${escapeHtml(String(pay.earlyLabel || "").trim())}</p>
          </div>
          <div style="text-align:right">
            <p class="wt-h2" style="margin:0">${escapeHtml(early)}</p>
            <p class="wt-muted" style="margin:4px 0 0">${escapeHtml(standard)}</p>
          </div>
        </div>
      </div>
    `;
      }

      return `
      <div class="${wrapClass}">
        <div class="wt-row wt-row--spaced wt-row--top">
          <div>
            <p class="wt-meta" style="margin:0">${escapeHtml(String(pay.standardLabel || "").trim())}</p>
            ${post1 ? `<p class="wt-muted" style="margin:4px 0 0">${escapeHtml(post1)}</p>` : ``}
            ${post2 ? `<p class="wt-muted" style="margin:4px 0 0">${escapeHtml(post2)}</p>` : ``}
          </div>
          <div style="text-align:right">
            <p class="wt-h2" style="margin:0">${escapeHtml(standard)}</p>
          </div>
        </div>
      </div>
    `;
    };




    const hasValueSection = (valueTitle || valueBullets.length);
    const hasTrustSection = (trustTitle || trustLine || trustBullets.length);

    return `
    ${renderBrandingRow(cfg, true)}
    <div class="wt-card wt-card--hero">
      <h1 class="wt-h1">${escapeHtml(headline)}</h1>

      ${progressLine1 ? `<p class="wt-muted" style="margin-top:6px">${escapeHtml(progressLine1)}</p>` : ``}
      ${progressLine2 ? `<p class="wt-muted" style="margin-top:2px">${escapeHtml(progressLine2)}</p>` : ``}

      ${hasValueSection ? `
        ${valueTitle ? `<div class="wt-meta" style="margin-top:var(--gap-2);font-weight:700;letter-spacing:0.2px">${escapeHtml(valueTitle)}</div>` : ``}
        ${valueBullets.length ? `<div style="margin-top:var(--gap-1)">${renderBullets(valueBullets, false)}</div>` : ``}
      ` : ``}

      ${(hasValueSection && hasTrustSection) ? `<div class="wt-divider"></div>` : ``}

      ${hasTrustSection ? `
        ${trustTitle ? `<div class="wt-meta" style="margin-top:var(--gap-2);font-weight:700;letter-spacing:0.2px">${escapeHtml(trustTitle)}</div>` : ``}
        ${trustLine ? `<p class="wt-meta" style="margin-top:6px">${escapeHtml(trustLine)}</p>` : ``}
        ${trustBullets.length ? `<div style="margin-top:var(--gap-1)">${renderBullets(trustBullets, true)}</div>` : ``}
      ` : ``}

      ${renderSocialProof()}

      <div class="wt-divider"></div>

      ${renderUrgencyBanner()}

      ${renderPriceBlock()}

      ${savingsLine ? `<p class="wt-muted" style="margin:10px 0 0">${escapeHtml(savingsLine)}</p>` : ``}

      <div class="wt-actions">
        <button
          class="wt-btn wt-btn--primary"
          data-action="${isEarly ? "checkout-early" : "checkout-standard"}"
        >${escapeHtml(primaryCta)}</button>

        <button
          class="wt-btn wt-btn--secondary"
          data-action="go-home"
        >${escapeHtml(notNowLabel)}</button>
      </div>

      ${checkoutNote ? `<p class="wt-muted" style="margin-top:8px">${escapeHtml(checkoutNote)}</p>` : ``}
      ${deviceNote ? `<p class="wt-muted" style="margin-top:4px">${escapeHtml(deviceNote)}</p>` : ``}
    </div>
    `;


  };



  // ============================================
  // Export
  // ============================================

  window.WT_UI = UI;
}();
