// ui-growth.js
// Extracted from ui.js to keep growth and secondary progression prompts isolated from the core UI shell.

(() => {
  "use strict";

  function openPoolComplete(ui, helpers) {
    const { escapeHtml, fillTemplate, clampInt } = helpers || {};
    if (
      typeof escapeHtml !== "function" ||
      typeof fillTemplate !== "function" ||
      typeof clampInt !== "function"
    ) {
      throw new Error("WT_UI_Growth helpers missing");
    }

    const w = ui.wording || {};
    const end = w.end || {};
    const sys = w.system || {};
    const lastRun = (ui._runtime && ui._runtime.lastRun) ? ui._runtime.lastRun : {};

    const title = String(end.poolCompleteTitle || "").trim();
    const line1 = String(end.poolCompleteLine1 || "").trim();
    const line2 = String(end.poolCompleteLine2 || "").trim();
    const scoreLineTpl = String(end.poolCompleteScoreLine || "").trim();
    const cta = String(sys.continue || "").trim();

    if (!title || !cta) return;

    const scoreLine = scoreLineTpl
      ? fillTemplate(scoreLineTpl, {
          score: String(clampInt(Number(lastRun.scoreFP), 0, 99999)),
          fpShort: ""
        })
      : "";

    const html = `
      ${scoreLine ? `<p class="wt-hero-kpi--modal">${escapeHtml(scoreLine)}</p>` : ``}
      ${line1 ? `<p>${escapeHtml(line1)}</p>` : ``}
      ${line2 ? `<p class="wt-muted">${escapeHtml(line2)}</p>` : ``}

      <div class="wt-divider"></div>

      <div class="wt-actions wt-modal-actions">
        <button class="wt-btn wt-btn--primary" data-action="close-modal">${escapeHtml(cta)}</button>
      </div>
    `;

    ui.openModal(html, title);
  }

  function openMilestone(ui, milestoneKey, helpers) {
    const { escapeHtml } = helpers || {};
    if (typeof escapeHtml !== "function") {
      throw new Error("WT_UI_Growth helpers missing");
    }

    const w = ui.wording || {};
    const ms = w.milestones || {};
    const block = (milestoneKey && typeof ms === "object") ? (ms[milestoneKey] || {}) : {};

    const title = String(block.title || "").trim();
    const lines = Array.isArray(block.bodyLines) ? block.bodyLines : [];
    const cta = String(block.cta || "").trim();

    if (!title || !cta) return;

    try {
      const markByKey = {
        quarter: "markQuarterMilestoneShown",
        halfway: "markHalfwayMilestoneShown",
        threeQuarters: "markThreeQuartersMilestoneShown"
      };
      const fnName = markByKey[String(milestoneKey || "").trim()] || "";
      if (fnName && ui.storage && typeof ui.storage[fnName] === "function") {
        ui.storage[fnName]();
      }
    } catch (_) { /* silent */ }

    const bodyHtml = lines
      .map((s) => String(s || "").trim())
      .filter(Boolean)
      .map((line) => `<p>${escapeHtml(line)}</p>`)
      .join("");

    const html = `
      ${bodyHtml}

      <div class="wt-divider"></div>

      <div class="wt-actions wt-modal-actions">
        <button class="wt-btn wt-btn--primary" data-action="close-modal">${escapeHtml(cta)}</button>
      </div>
    `;

    ui.openModal(html, title);
  }

  function remindHouseAdLater(ui) {
    if (!ui.storage || typeof ui.storage.hideHouseAdUsingConfig !== "function") return;

    ui.storage.hideHouseAdUsingConfig();
    ui.render();
  }

  function openHouseAd(ui) {
    const cfg = ui.config || {};
    const ha = cfg.houseAd || {};
    const url = String(ha.url || "").trim();
    if (!url) return;

    if (ui.storage && typeof ui.storage.markHouseAdClicked === "function") {
      ui.storage.markHouseAdClicked();
    }

    window.open(url, "_blank", "noopener");
  }

  window.WT_UI_Growth = {
    openPoolComplete,
    openMilestone,
    remindHouseAdLater,
    openHouseAd
  };
})();
