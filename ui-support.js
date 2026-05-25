// ui-support.js
// Extracted from ui.js to keep support and waitlist flows isolated from the core UI shell.

(() => {
  "use strict";

  function openSupport(ui, helpers) {
    const { escapeHtml, toastNow } = helpers || {};
    if (typeof escapeHtml !== "function" || typeof toastNow !== "function") {
      throw new Error("WT_UI_Support helpers missing");
    }

    const w = ui.wording || {};
    const support = w.support || {};
    const email = String(window.WT_Email?.getSupportEmailDecoded?.() || "").trim();
    if (!email) {
      const msg = String(ui.wording?.system?.copyFailed || "").trim();
      if (msg) toastNow(ui.config, msg);
      return;
    }

    const html = `
    <p>${escapeHtml(String(support.modalBodyLine1 || "").trim())}</p>
    <p class="wt-muted">${escapeHtml(String(support.modalBodyLine2 || "").trim())}</p>

    <div class="wt-divider"></div>

    <div class="wt-actions wt-actions--compact">
      <button class="wt-btn wt-btn--secondary" data-action="open-support-email-bug">${escapeHtml(String(support.ctaBug || "").trim())}</button>
      <button class="wt-btn wt-btn--secondary" data-action="open-support-email-question">${escapeHtml(String(support.ctaQuestion || "").trim())}</button>
      <button class="wt-btn wt-btn--secondary" data-action="open-support-email-idea">${escapeHtml(String(support.ctaIdea || "").trim())}</button>
    </div>

    <div class="wt-divider"></div>

    <div class="wt-actions">
      <button class="wt-btn wt-btn--secondary" data-action="copy-support-email">${escapeHtml(String(support.ctaCopy || "").trim())}</button>
      <button class="wt-btn wt-btn--primary" data-action="open-support-email">${escapeHtml(String(support.ctaOpen || "").trim())}</button>
    </div>
  `;

    ui.openModal(html, String(support.modalTitle || "").trim());
  }

  async function copySupportEmail(ui, helpers) {
    const { toastNow } = helpers || {};
    if (typeof toastNow !== "function") {
      throw new Error("WT_UI_Support helpers missing");
    }

    const email = String(window.WT_Email?.getSupportEmailDecoded?.() || "").trim();
    if (!email) return;

    try {
      await navigator.clipboard.writeText(email);
      toastNow(ui.config, String(ui.wording?.system?.copied || "").trim());
    } catch (_) {
      toastNow(ui.config, String(ui.wording?.system?.copyFailed || "").trim());
    }
  }

  function openSupportEmail(ui, kind) {
    const email = String(window.WT_Email?.getSupportEmailDecoded?.() || "").trim();
    if (!email) return;

    const cfg = ui.config || {};
    const prefix = String(cfg?.support?.subjectPrefix || "").trim();

    const w = ui.wording || {};
    const support = w.support || {};
    const mode = String(kind || "").trim().toLowerCase();
    let suffix = String(support.emailSubjectSuffix || "").trim();
    let bodyTemplate = String(support.emailBodyTemplate || "").trim();

    if (mode === "bug") {
      suffix = String(support.bugSubjectSuffix || suffix).trim();
      bodyTemplate = String(support.bugBodyTemplate || bodyTemplate).trim();
    } else if (mode === "question") {
      suffix = String(support.questionSubjectSuffix || suffix).trim();
      bodyTemplate = String(support.questionBodyTemplate || bodyTemplate).trim();
    } else if (mode === "idea") {
      suffix = String(support.ideaSubjectSuffix || suffix).trim();
      bodyTemplate = String(support.ideaBodyTemplate || bodyTemplate).trim();
    }

    if (window.WT_Email && typeof window.WT_Email.openSupportEmail === "function") {
      window.WT_Email.openSupportEmail({
        subjectPrefix: prefix,
        subjectSuffix: suffix,
        bodyTemplate
      });
    }

    ui.closeModal();
  }

  function openWaitlist(ui, helpers) {
    const { escapeHtml } = helpers || {};
    if (typeof escapeHtml !== "function") {
      throw new Error("WT_UI_Support helpers missing");
    }

    const cfg = ui.config || {};
    const wlCfg = cfg.waitlist || {};
    if (wlCfg.enabled !== true) return;

    const w = ui.wording || {};
    const wl = w.waitlist || {};

    const title = String(wl.title || "").trim();
    const body1 = String(wl.bodyLine1 || "").trim();
    const body2 = String(wl.bodyLine2 || "").trim();
    const label = String(wl.inputLabel || wl.inputPlaceholder || "").trim();
    const placeholder = String(wl.inputPlaceholder || "").trim();
    const cta = String(wl.cta || "").trim();

    const toEmail = String(window.WT_Email?.getWaitlistEmailDecoded?.() || "").trim();
    if (!toEmail) return;

    try {
      if (ui.storage && typeof ui.storage.getWaitlistStatus === "function" && typeof ui.storage.setWaitlistStatus === "function") {
        const st = String(ui.storage.getWaitlistStatus() || "").trim();
        if (st === "not_seen") ui.storage.setWaitlistStatus("seen");
      }
    } catch (_) { /* silent */ }

    const phAttr = placeholder ? ` placeholder="${escapeHtml(placeholder)}"` : "";

    const html = `
      ${body1 ? `<p>${escapeHtml(body1)}</p>` : ``}
      ${body2 ? `<p class="wt-muted">${escapeHtml(body2)}</p>` : ``}

      <div class="wt-divider"></div>

      <label class="wt-label" for="wt-waitlist-idea">${escapeHtml(label)}</label>
      <textarea id="wt-waitlist-idea" class="wt-input" rows="3"${phAttr}></textarea>

      <div class="wt-actions wt-modal-actions">
        <button class="wt-btn wt-btn--primary" data-action="send-waitlist-email">${escapeHtml(cta)}</button>
        <button class="wt-btn wt-btn--ghost" data-action="close-modal">${escapeHtml(String(ui.wording?.system?.close || "").trim())}</button>
      </div>
    `;

    ui.openModal(html, title);

    try {
      const input = ui.modalContentEl ? ui.modalContentEl.querySelector("#wt-waitlist-idea") : null;

      if (input && ui.storage && typeof ui.storage.getWaitlistDraftIdea === "function") {
        const draft = String(ui.storage.getWaitlistDraftIdea() || "").trim();
        if (draft) input.value = draft;
      }

      if (input && ui.storage && typeof ui.storage.setWaitlistDraftIdea === "function") {
        input.addEventListener("input", () => {
          try { ui.storage.setWaitlistDraftIdea(String(input.value || "")); } catch (_) { /* silent */ }
        });
      }
    } catch (_) { /* silent */ }
  }

  function sendWaitlist(ui, helpers) {
    const { toastNow } = helpers || {};
    if (typeof toastNow !== "function") {
      throw new Error("WT_UI_Support helpers missing");
    }

    const cfg = ui.config || {};
    const wlCfg = cfg.waitlist || {};
    if (wlCfg.enabled !== true) return;

    const w = ui.wording || {};
    const wl = w.waitlist || {};
    const toEmail = String(window.WT_Email?.getWaitlistEmailDecoded?.() || "").trim();
    if (!toEmail) {
      const msg = String(wl.emailUnavailableToast || "").trim();
      if (msg) toastNow(ui.config, msg);
      return;
    }

    const prefix = String(wlCfg.subjectPrefix || "").trim();
    if (!prefix) return;
    const suffix = String(wl.emailSubjectSuffix || "").trim();

    const subjectText = suffix ? `${prefix} ${suffix}`.trim() : prefix;
    const subject = encodeURIComponent(subjectText);

    const input = ui.modalContentEl ? ui.modalContentEl.querySelector("#wt-waitlist-idea") : null;
    const idea = String(input && input.value ? input.value : "").trim();

    const tpl = String(wl.emailBodyTemplate || "").trim();
    const bodyText = tpl ? tpl.replaceAll("{idea}", idea) : idea;
    const body = encodeURIComponent(bodyText ? bodyText : "");

    try {
      if (ui.storage && typeof ui.storage.setWaitlistStatus === "function") {
        ui.storage.setWaitlistStatus("joined");
      }
      if (ui.storage && typeof ui.storage.setWaitlistDraftIdea === "function") {
        ui.storage.setWaitlistDraftIdea("");
      }
    } catch (_) { /* silent */ }

    window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
    ui.closeModal();
  }

  window.WT_UI_Support = {
    openSupport,
    copySupportEmail,
    openSupportEmail,
    openWaitlist,
    sendWaitlist
  };
})();
