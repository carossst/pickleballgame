// ui-stats-sharing.js
// Extracted from ui.js to keep stats-sharing flows isolated from the core UI shell.

(() => {
  "use strict";

  const MAILTO_BODY_LIMIT = 1800;
  const PROMPT_FLAGS = Object.freeze({
    THRESHOLD_30: 1,
    THRESHOLD_50: 2,
    LAST_FREE: 4,
    POWER_USER: 8
  });

  function getPayload(ui) {
    const storage = ui.storage;
    if (!storage || typeof storage.getAnonymousStatsPayload !== "function") return null;

    let base = null;
    try { base = storage.getAnonymousStatsPayload(); } catch (_) { base = null; }
    if (!base || typeof base !== "object") return null;

    let payload = null;
    try { payload = JSON.parse(JSON.stringify(base)); } catch (_) { payload = null; }
    if (!payload || typeof payload !== "object") return null;

    const byId = (ui._runtime && ui._runtime.contentById) ? ui._runtime.contentById : Object.create(null);

    if (Array.isArray(payload.topMistakes)) {
      payload.topMistakes = payload.topMistakes.map((m) => {
        const idNum = Number(m && m.id);
        const idKey = String(Number.isFinite(idNum) ? idNum : (m && m.id != null ? m.id : "")).trim();
        const it = idKey ? byId[idKey] : null;
        const questionText = String(it && it.question || "").trim();

        return {
          id: Number.isFinite(idNum) ? idNum : m && m.id,
          wrongCount: m && m.wrongCount,
          question: questionText
        };
      });
    }

    return payload;
  }

  function openModal(ui, helpers) {
    const { escapeHtml, toastNow } = helpers || {};
    if (typeof escapeHtml !== "function" || typeof toastNow !== "function") {
      throw new Error("WT_UI_StatsSharing helpers missing");
    }

    const w = ui.wording || {};
    const ss = w.statsSharing || {};
    const cfg = ui.config || {};

    if (!cfg.statsSharing?.enabled) return;

    const payload = getPayload(ui);
    if (!payload) {
      const msg = String(ss.noStatsToast || "").trim();
      if (msg) toastNow(ui.config, msg);
      return;
    }

    const jsonStr = JSON.stringify(payload, null, 2);
    const html = `
      <p class="wt-text-preline">${escapeHtml(String(ss.modalDescription || "").trim())}</p>

      <div class="wt-divider"></div>

      <strong class="wt-meta">${escapeHtml(String(ss.previewLabel || "").trim())}</strong>
      <pre class="wt-code wt-code--modal">${escapeHtml(jsonStr)}</pre>

      <div class="wt-actions wt-actions--feedback wt-modal-actions wt-modal-actions--lg">
        <button class="wt-btn wt-btn--primary" data-action="send-stats-email">${escapeHtml(String(ss.ctaSend || "").trim())}</button>
        <button class="wt-btn wt-btn--secondary" data-action="copy-stats">${escapeHtml(String(ss.ctaCopy || "").trim())}</button>
        <button class="wt-btn wt-btn--ghost" data-action="snooze-stats">${escapeHtml(String(ss.ctaLater || "").trim())}</button>
        <button class="wt-btn wt-btn--ghost" data-action="close-modal">${escapeHtml(String(ss.ctaCancel || "").trim())}</button>
      </div>
    `;

    ui.openModal(html, String(ss.modalTitle || "").trim());
  }

  async function sendEmail(ui, helpers) {
    const { toastNow } = helpers || {};
    if (typeof toastNow !== "function") {
      throw new Error("WT_UI_StatsSharing helpers missing");
    }

    const cfg = ui.config || {};
    const w = ui.wording || {};
    const ss = w.statsSharing || {};
    const email = String(window.WT_Email?.getSupportEmailDecoded?.() || "").trim();
    if (!email) return;

    const subject = encodeURIComponent(String(cfg?.statsSharing?.emailSubject || "").trim());
    const payload = getPayload(ui);
    if (!payload) return;

    const jsonStr = JSON.stringify(payload, null, 2);
    const body = encodeURIComponent(jsonStr);

    if (body.length > MAILTO_BODY_LIMIT) {
      try {
        await navigator.clipboard.writeText(jsonStr);
        const msg = String(ss.mailtoFallbackToast || ss.copyToast || "").trim();
        if (msg) toastNow(ui.config, msg, { variant: "info" });
      } catch (_) {
        const failMsg = String(w.system?.copyFailed || "").trim();
        if (failMsg) toastNow(ui.config, failMsg);
      }
      window.location.href = `mailto:${email}?subject=${subject}`;
      ui.closeModal();
      return;
    }

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    ui.closeModal();
  }

  async function copy(ui, helpers) {
    const { toastNow } = helpers || {};
    if (typeof toastNow !== "function") {
      throw new Error("WT_UI_StatsSharing helpers missing");
    }

    const w = ui.wording || {};
    const ss = w.statsSharing || {};
    const payload = getPayload(ui);
    if (!payload) return;

    const jsonStr = JSON.stringify(payload, null, 2);
    try {
      await navigator.clipboard.writeText(jsonStr);
      toastNow(ui.config, String(ss.copyToast || "").trim());
    } catch (_) {
      toastNow(ui.config, String(w.system?.copyFailed || "").trim());
    }
  }

  function maybePrompt(ui, helpers) {
    const {
      clampInt,
      isPremiumNow,
      getStatsSharingPromptFlags,
      getStatsSharingSnoozeUntilRunCompletes,
      markStatsSharingPromptFlag
    } = helpers || {};

    if (
      typeof clampInt !== "function" ||
      typeof isPremiumNow !== "function" ||
      typeof getStatsSharingPromptFlags !== "function" ||
      typeof getStatsSharingSnoozeUntilRunCompletes !== "function" ||
      typeof markStatsSharingPromptFlag !== "function"
    ) {
      throw new Error("WT_UI_StatsSharing helpers missing");
    }

    const cfg = ui.config || {};
    const ssCfg = cfg.statsSharing || {};
    if (ssCfg.enabled !== true) return;

    const storage = ui.storage;
    if (!storage) return;

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

    if (ssCfg.afterPoolExhaustedOnly === true) {
      if (typeof storage.hasSeenAllWordTraps !== "function" || storage.hasSeenAllWordTraps() !== true) return;
    }

    const thresholds = Array.isArray(ssCfg.promptThresholdsPct) ? ssCfg.promptThresholdsPct.slice() : [];
    const pct30 = Number(thresholds[0]);
    const pct50 = Number(thresholds[1]);

    const poolProgress = Number(stats.poolProgress);
    if (!Number.isFinite(poolProgress)) return;

    const uniquePct = Math.floor(poolProgress * 100);
    const uniqueSeen = Number(stats.uniqueSeen);
    const isPremium = isPremiumNow(storage);
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
    let chosenBit = 0;

    if (lastFreeEligible && (flags & PROMPT_FLAGS.LAST_FREE) === 0) {
      chosenBit = PROMPT_FLAGS.LAST_FREE;
    } else if (Number.isFinite(pct50) && uniquePct >= pct50 && (flags & PROMPT_FLAGS.THRESHOLD_50) === 0) {
      chosenBit = PROMPT_FLAGS.THRESHOLD_50;
    } else if (Number.isFinite(pct30) && uniquePct >= pct30 && (flags & PROMPT_FLAGS.THRESHOLD_30) === 0) {
      chosenBit = PROMPT_FLAGS.THRESHOLD_30;
    } else if (powerEligible && (flags & PROMPT_FLAGS.POWER_USER) === 0) {
      chosenBit = PROMPT_FLAGS.POWER_USER;
    }

    if (!chosenBit) return;

    markStatsSharingPromptFlag(storage, chosenBit);
    try {
      if (ui._runtime) ui._runtime._statsSharingLastPromptFlagBit = chosenBit;
    } catch (_) { /* silent */ }

    openModal(ui, { escapeHtml: helpers.escapeHtml, toastNow: helpers.toastNow });
  }

  window.WT_UI_StatsSharing = {
    PROMPT_FLAGS,
    getPayload,
    openModal,
    sendEmail,
    copy,
    maybePrompt
  };
})();
