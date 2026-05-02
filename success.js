// success.js - Pickleball success page logic
(() => {
  "use strict";

  const cfg = window.WT_CONFIG;
  if (!cfg || typeof cfg !== "object") return;

  const rawStorageKey = cfg?.storage?.vanityCodeStorageKey;
  if (typeof rawStorageKey !== "string") {
    throw new Error("success page: missing config.storage.vanityCodeStorageKey");
  }

  const STORAGE_KEY = rawStorageKey.trim();
  if (!STORAGE_KEY) {
    throw new Error("success page: empty config.storage.vanityCodeStorageKey");
  }

  function rand4() {
    return String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  }

  function generateCode() {
    const prefix = String(window.WT_CONFIG?.premiumCodePrefix || "").trim();
    if (!prefix) return "";
    return `${prefix}-${rand4()}-${rand4()}`;
  }

  function getOrCreateCode() {
    const rawRe = String(window.WT_CONFIG?.premiumCodeRegex || "").trim();
    if (!rawRe) return "";

    let re = null;
    try { re = new RegExp(rawRe); } catch (_) { re = null; }
    if (!re) return "";

    let code = "";
    try {
      code = String(window.localStorage.getItem(STORAGE_KEY) || "").trim();
    } catch (_) {
      code = "";
    }

    if (!code || !re.test(code)) {
      code = generateCode();
      if (!re.test(code)) return "";

      try {
        window.localStorage.setItem(STORAGE_KEY, code);
      } catch (_) {
        return "";
      }
    }

    return code;
  }

  function renderCode(code) {
    const codeEl = document.getElementById("code");
    if (codeEl) codeEl.textContent = code;
  }

  let statusHideTimer = 0;

  function showStatus(msg) {
    const statusEl = document.getElementById("copy-status");
    if (!statusEl) return;

    const dur = Number(window.WT_CONFIG?.ui?.toast?.default?.durationMs);
    if (!Number.isFinite(dur) || dur < 600 || dur > 4000) return;

    if (statusHideTimer) {
      window.clearTimeout(statusHideTimer);
      statusHideTimer = 0;
    }

    statusEl.textContent = msg;
    statusEl.classList.remove("wt-hidden");

    statusHideTimer = window.setTimeout(() => {
      statusEl.classList.add("wt-hidden");
      statusHideTimer = 0;
    }, Math.floor(dur));
  }

  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    document.body.appendChild(ta);
    ta.select();

    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (_) {
      ok = false;
    }

    document.body.removeChild(ta);
    return ok;
  }

  async function copyCode() {
    const codeEl = document.getElementById("code");
    const code = codeEl ? codeEl.textContent.trim() : "";
    if (!code) return;

    const copiedText = window.WT_WORDING?.system?.copied;
    const failedText = window.WT_WORDING?.system?.copyFailed;
    if (!copiedText || !failedText) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
        showStatus(copiedText);
        return;
      }
    } catch (_) {
      // Fall through to fallback
    }

    if (fallbackCopy(code)) showStatus(copiedText);
    else showStatus(failedText);
  }

  function downloadCodeTxt() {
    const codeEl = document.getElementById("code");
    const code = codeEl ? codeEl.textContent.trim() : "";
    if (!code) return;

    const downloadedText = window.WT_WORDING?.system?.downloaded;
    if (!downloadedText) return;

    const w = window.WT_WORDING?.success;
    if (!w?.txtTitle || !w?.txtSaveLine || !w?.txtNoRecoverLine) return;

    const content = [
      w.txtTitle,
      "",
      code,
      "",
      w.txtSaveLine,
      w.txtNoRecoverLine
    ].join("\n");

    try {
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });

      if (!window.URL || typeof URL.createObjectURL !== "function") {
        copyCode();
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activation-code-${code}.txt`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.setTimeout(() => {
        try { URL.revokeObjectURL(url); } catch (_) { /* ignore */ }
      }, 0);

      showStatus(downloadedText);
    } catch (_) {
      copyCode();
    }
  }

  function applyPoolSize() {
    try {
      const n = Number(window.WT_CONFIG?.game?.poolSize);
      if (!Number.isFinite(n) || n <= 0) return;

      const nodes = document.querySelectorAll("[data-wt-poolsize]");
      nodes.forEach((el) => {
        if (el) el.textContent = String(Math.floor(n));
      });
    } catch (_) { /* ignore */ }
  }

  function applySuccessBranding() {
    try {
      const logoUrl = String(window.WT_CONFIG?.identity?.uiLogoUrl || "").trim();
      const appName = String(window.WT_CONFIG?.identity?.appName || "").trim();

      const img = document.getElementById("wt-success-logo");
      const name = document.getElementById("wt-success-name");
      const link = document.getElementById("wt-success-branding");
      if (!img || !name || !link) return;

      if (!appName) {
        name.textContent = "";
        link.setAttribute("aria-label", "");
      } else {
        name.textContent = appName;
        link.setAttribute("aria-label", appName);
      }

      if (!logoUrl) {
        img.style.display = "none";
        img.removeAttribute("src");
        img.setAttribute("alt", "");
        return;
      }

      img.src = logoUrl;
      img.setAttribute("alt", appName || "");
      img.style.display = "";
    } catch (_) { /* ignore */ }
  }

  function bindSupportLink() {
    const successSupportLink = document.getElementById("wt-success-support-link");
    if (!successSupportLink) return;

    successSupportLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (window.WT_Email && typeof window.WT_Email.openSupportEmail === "function") {
        window.WT_Email.openSupportEmail();
      }
    });
  }

  function init() {
    const code = getOrCreateCode();
    if (!code) {
      const codeEl = document.getElementById("code");
      if (codeEl) codeEl.textContent = "Unable to generate code. Please reload this page.";
      return;
    }

    renderCode(code);
    applyPoolSize();
    applySuccessBranding();

    const copyBtn = document.getElementById("copy-btn");
    const copyAgain = document.getElementById("copy-again");
    const downloadBtn = document.getElementById("download-code");

    if (copyBtn) copyBtn.addEventListener("click", copyCode);
    if (copyAgain) copyAgain.addEventListener("click", copyCode);
    if (downloadBtn) downloadBtn.addEventListener("click", downloadCodeTxt);

    bindSupportLink();

    if (window.WT_Email && typeof window.WT_Email.initEmailLinks === "function") {
      window.WT_Email.initEmailLinks();
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
