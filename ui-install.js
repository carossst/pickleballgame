// ui-install.js
// Extracted from ui.js to keep install prompt flows isolated from the core UI shell.

(() => {
  "use strict";

  function openModal(ui, helpers) {
    const { escapeHtml } = helpers || {};
    if (typeof escapeHtml !== "function") {
      throw new Error("WT_UI_Install helpers missing");
    }

    const ip = ui.wording?.installPrompt || {};
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent || "");
    const title = String(ip.title || "").trim();
    const body = String((isIOS ? ip.bodyIOS : ip.body) || "").trim();
    const ctaPrimary = String((isIOS ? ip.ctaPrimaryIOS : ip.ctaPrimary) || "").trim();
    const ctaSecondary = String(ip.ctaSecondary || ui.wording?.system?.close || "").trim();
    const primaryAction = isIOS ? "dismiss-install-prompt" : "install-app-now";

    if (!title || !body || !ctaPrimary) return false;

    const html = `
      <p class="wt-text-preline">${escapeHtml(body)}</p>
      <div class="wt-actions wt-modal-actions">
        <button class="wt-btn wt-btn--primary" data-action="${primaryAction}">${escapeHtml(ctaPrimary)}</button>
        <button class="wt-btn wt-btn--ghost" data-action="close-modal">${escapeHtml(ctaSecondary)}</button>
      </div>
    `;

    ui.openModal(html, title);

    return true;
  }

  function canShow(ui) {
    const cfg = ui.config || {};
    const storage = ui.storage;
    const pwa = window.WT_PWA || null;

    if (!storage || !pwa || typeof pwa.canPrompt !== "function") return false;

    const counters = (typeof storage.getCounters === "function") ? (storage.getCounters() || {}) : {};
    const shown = Number(counters.installPromptShown || 0);
    if (Number.isFinite(shown) && shown > 0) return false;

    const modalOpen = !!(ui.modalEl && !ui.modalEl.classList.contains("wt-hidden"));
    if (modalOpen) return false;

    if (pwa.canPrompt(cfg, storage) !== true) return false;

    return true;
  }

  function prompt(ui, helpers) {
    if (!helpers || typeof helpers.escapeHtml !== "function") {
      throw new Error("WT_UI_Install helpers missing");
    }

    const pwa = window.WT_PWA || null;
    if (!pwa || typeof pwa.promptInstall !== "function") return;

    try {
      if (ui.storage && typeof ui.storage.markInstallPromptShown === "function") {
        ui.storage.markInstallPromptShown();
      }
    } catch (_) { /* silent */ }

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent || "");
    if (isIOS) {
      openModal(ui, helpers);
      return;
    }

    pwa.promptInstall(ui.storage)
      .then(() => {
        try { ui.render(); } catch (_) { /* silent */ }
      })
      .catch(() => { /* silent */ });
  }

  window.WT_UI_Install = {
    openModal,
    canShow,
    prompt
  };
})();
