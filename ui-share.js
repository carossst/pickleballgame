// ui-share.js
// Extracted from ui.js to keep sharing flows isolated from the core UI shell.

(() => {
  "use strict";

  function getShareText(ui, helpers) {
    const { clampInt } = helpers || {};
    if (typeof clampInt !== "function") {
      throw new Error("WT_UI_Share helpers missing");
    }

    const cfg = ui.config || {};
    const shareCfg = cfg.share || {};
    if (!shareCfg.enabled) return "";

    const w = ui.wording || {};
    const share = w.share || {};

    function pickTemplate(templates, seed) {
      const list = Array.isArray(templates) ? templates.map((x) => String(x || "").trim()).filter(Boolean) : [];
      if (!list.length) return "";
      const safeSeed = Math.abs(Number(seed || 0));
      const idx = Number.isFinite(safeSeed) ? (safeSeed % list.length) : 0;
      return list[idx] || "";
    }

    const identity = cfg.identity || {};
    const appName = String(identity.appName || "").trim();
    let url = String(identity.appUrl || "").trim();
    try {
      const locale = window.WT_I18N && typeof window.WT_I18N.getLocale === "function"
        ? String(window.WT_I18N.getLocale() || "").trim()
        : "";
      const localizedUrls = (identity && typeof identity.appUrlsByLocale === "object")
        ? identity.appUrlsByLocale
        : null;
      const localizedUrl = localizedUrls && locale
        ? String(localizedUrls[locale] || "").trim()
        : "";
      if (localizedUrl) {
        url = localizedUrl;
      }
      if (url && locale) {
        const shareUrl = new URL(url);
        if (!localizedUrl) {
          shareUrl.searchParams.set("lang", locale);
        }
        url = shareUrl.toString();
      }
    } catch (_) { /* silent */ }

    const poolSize = clampInt(cfg?.game?.poolSize, 1, 9999);
    const maxChances = clampInt(cfg?.game?.maxChances, 1, 99);
    const lastRun = (ui._runtime && ui._runtime.lastRun) ? ui._runtime.lastRun : {};

    const scoreFP = clampInt(lastRun.scoreFP, 0, 99999);
    const bestScoreFP = clampInt(lastRun.bestScoreFP, 0, 99999);
    const scoreChallengeTpl = (bestScoreFP > 10)
      ? String(share.scoreChallengeWithBest || "").trim()
      : String(share.scoreChallengeWithoutBest || "").trim();
    const scoreChallenge = scoreChallengeTpl
      .replaceAll("{score}", String(scoreFP))
      .replaceAll("{bestScore}", String(bestScoreFP));

    let funFact = "";
    try {
      const items = Array.isArray(ui._runtime?.contentItems) ? ui._runtime.contentItems : [];
      const allIds = Array.isArray(lastRun.runItemIds) ? lastRun.runItemIds : [];

      if (items.length > 0 && allIds.length > 0) {
        const mistakeIds = Array.isArray(lastRun.mistakeIds) ? lastRun.mistakeIds : [];
        const findItem = (id) => items.find((x) => Number(x?.id) === Number(id)) || null;

        let pick = null;
        if (mistakeIds.length > 0) {
          pick = findItem(mistakeIds[mistakeIds.length - 1]);
        }

        if (!pick) {
          for (let i = allIds.length - 1; i >= 0; i--) {
            const it = findItem(allIds[i]);
            if (it && it.correctAnswer === false) { pick = it; break; }
          }
        }

        if (!pick) {
          pick = findItem(allIds[allIds.length - 1]);
        }

        if (pick) {
          const questionText = String(pick.question || "").trim();
          const isTrap = (pick.correctAnswer === false);

          if (questionText) {
            const tpls = isTrap
              ? (Array.isArray(share.funFactTemplatesTrap) ? share.funFactTemplatesTrap : [])
              : (Array.isArray(share.funFactTemplatesTrue) ? share.funFactTemplatesTrue : []);
            const tpl = pickTemplate(tpls, Number(pick?.id || 0) + scoreFP);

            if (tpl) {
              funFact = tpl.replaceAll("{question}", questionText);
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
      .replaceAll("{bestScore}", String(bestScoreFP))
      .replaceAll("{scoreChallenge}", scoreChallenge)
      .replaceAll("{funFact}", funFact);

    ui._runtime = ui._runtime || {};
    ui._runtime.lastShareText = text;

    return text;
  }

  async function copy(ui, helpers) {
    const { clampInt, toastNow } = helpers || {};
    if (typeof clampInt !== "function" || typeof toastNow !== "function") {
      throw new Error("WT_UI_Share helpers missing");
    }

    const text = String(getShareText(ui, helpers) || "").trim();
    if (!text) return;

    const w = ui.wording || {};
    const share = w.share || {};

    try {
      await navigator.clipboard.writeText(text);
      if (ui.storage && typeof ui.storage.markShareClicked === "function") {
        ui.storage.markShareClicked();
      }
      const okMsg = String(share.toastCopied || "").trim();
      if (okMsg) toastNow(ui.config, okMsg);
    } catch (_) {
      toastNow(ui.config, String(w.system?.copyFailed || "").trim());
    }
  }

  function sendEmail(ui, helpers) {
    const { clampInt } = helpers || {};
    if (typeof clampInt !== "function") {
      throw new Error("WT_UI_Share helpers missing");
    }

    const w = ui.wording || {};
    const share = w.share || {};
    const subjectRaw = String(share.emailSubject || "").trim();
    if (!subjectRaw) return;

    const text = String(getShareText(ui, helpers) || "").trim();
    if (!text) return;

    const subject = encodeURIComponent(subjectRaw);
    const body = encodeURIComponent(text);

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  window.WT_UI_Share = {
    getShareText,
    copy,
    sendEmail
  };
})();
