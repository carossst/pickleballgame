// ui-screen-paywall.js
// Extracted from ui.js to keep PAYWALL rendering isolated from the core UI shell.

(() => {
  "use strict";

  function renderPaywallSection(title, bodyHtml, extraClass, escapeHtml) {
    if (!title && !bodyHtml) return "";
    return `
      <section class="${String(extraClass || "").trim()}">
        ${title ? `<div class="wt-meta wt-meta--strong wt-paywall-section-title">${escapeHtml(title)}</div>` : ``}
        ${bodyHtml || ``}
      </section>
    `;
  }

  function renderPaywallQuoteCard(title, quotes, escapeHtml) {
    const safeTitle = String(title || "").trim();
    const safeQuotes = Array.isArray(quotes) ? quotes : [];
    if (!safeTitle && !safeQuotes.length) return "";

    const quotesHtml = safeQuotes
      .map((q) => {
        const qt = String(q?.quote || "").trim();
        const au = String(q?.author || "").trim();
        if (!qt) return "";
        const parts = qt.split(/\n+/).map((part) => String(part || "").trim()).filter(Boolean);
        const maybeStars = parts.length > 1 && /^[★☆\s]+$/.test(parts[0]) ? parts.shift() : "";
        const body = parts.join(" ").trim();
        if (!body && !maybeStars) return "";
        return `
          <div class="wt-quote wt-paywall-quote">
            ${maybeStars ? `<div class="wt-quote__stars wt-paywall-stars" aria-hidden="true">${escapeHtml(maybeStars)}</div>` : ``}
            ${body ? `<div class="wt-copy-quote">&ldquo;${escapeHtml(body)}&rdquo;</div>` : ``}
            ${au ? `<div class="wt-muted wt-quote__author wt-paywall-quote-author">${escapeHtml(au)}</div>` : ``}
          </div>
        `;
      })
      .filter(Boolean)
      .join("");

    return `
      <div class="wt-box">
        ${safeTitle ? `<div class="wt-meta">${escapeHtml(safeTitle)}</div>` : ``}
        ${quotesHtml}
      </div>
    `;
  }

  function render(ui, helpers) {
    const {
      escapeHtml,
      fillTemplate,
      formatCents,
      mmss,
      renderTextWithStrong,
      renderBrandingRow,
      clampInt,
      isPremiumNow
    } = helpers || {};

    if (
      typeof escapeHtml !== "function" ||
      typeof fillTemplate !== "function" ||
      typeof formatCents !== "function" ||
      typeof mmss !== "function" ||
      typeof renderTextWithStrong !== "function" ||
      typeof renderBrandingRow !== "function" ||
      typeof clampInt !== "function" ||
      typeof isPremiumNow !== "function"
    ) {
      throw new Error("WT_UI_Paywall helpers missing");
    }

    const w = ui.wording || {};
    const pay = w.paywall || {};
    const cfg = ui.config || {};
    const premium = isPremiumNow(ui.storage);

    if (premium) {
      const playLabel = String(w.landing?.ctaPlay || "").trim();
      const premiumHeadline = String(pay.headline || "").trim();

      return `
      ${renderBrandingRow(cfg, true)}
          <div class="wt-card wt-card--hero">
      <h1 class="wt-h1">${escapeHtml(premiumHeadline)}</h1>
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

    let ep = null;
    if (ui.storage && typeof ui.storage.getEarlyPriceState === "function") {
      try { ep = ui.storage.getEarlyPriceState() || null; } catch (_) { ep = null; }
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

    let runsBalance = NaN;
    try {
      if (ui.storage && typeof ui.storage.getRunsBalance === "function") {
        runsBalance = Number(ui.storage.getRunsBalance());
      }
    } catch (_) { runsBalance = NaN; }

    const isLastFree =
      (Number.isFinite(runsBalance) && runsBalance <= 0) ||
      (ui._runtime && ui._runtime.runType === "LAST_FREE");

    const headline =
      isLastFree && pay.headlineLastFree
        ? String(pay.headlineLastFree).trim()
        : String(pay.headline || "").trim();

    const valueTitle = String(pay.valueTitle || "").trim();
    const trustTitle = String(pay.trustTitle || "").trim();
    const compactTitle = String(pay.compactTitle || valueTitle || "").trim();
    const payOnceLine = String(pay.payOnceLine || "").trim();

    const valueBullets = Array.isArray(pay.valueBullets) ? pay.valueBullets : [];
    const trustLine = String(pay.trustLine || "").trim();
    const trustBullets = Array.isArray(pay.trustBullets) ? pay.trustBullets : [];
    const compactBullets = Array.isArray(pay.compactBullets) ? pay.compactBullets : [];
    const notNowLabel = String(w.system?.notNow || "").trim();
    const redeemLabel = String(pay.alreadyHaveCode || "").trim();

    let seen = NaN;
    try {
      if (ui.storage && typeof ui.storage.getSeenItemIds === "function") {
        const ids = ui.storage.getSeenItemIds();
        if (Array.isArray(ids)) seen = Number(ids.length);
      }
    } catch (_) { /* ignore */ }

    const poolSize = Number(cfg?.game?.poolSize);
    const remaining =
      (Number.isFinite(seen) && Number.isFinite(poolSize))
        ? Math.max(0, poolSize - seen)
        : NaN;

    const progressLine1Tpl = String(pay.progressLine1 || "").trim();
    const progressLine2Tpl = String(pay.progressLine2 || "").trim();
    const lastRunScore = clampInt(Number(ui._runtime?.lastRun?.scoreFP), 0, 99999);
    let payRunCount = 0;

    try {
      let starts = 0;
      let completes = 0;

      if (ui.storage && typeof ui.storage.getRunsUsed === "function") {
        starts = clampInt(Number(ui.storage.getRunsUsed()), 0, 999);
      }
      if (ui.storage && typeof ui.storage.getCounters === "function") {
        const c = ui.storage.getCounters() || {};
        completes = clampInt(Number(c.runCompletes), 0, 999);
      }

      payRunCount = Math.max(starts, completes);
    } catch (_) { payRunCount = 0; }

    const progressLine1 =
      (progressLine1Tpl && Number.isFinite(payRunCount))
        ? fillTemplate(progressLine1Tpl, { seen, poolSize, remaining, score: lastRunScore, runs: payRunCount })
        : "";

    const progressLine2Raw =
      (progressLine2Tpl && Number.isFinite(remaining))
        ? fillTemplate(progressLine2Tpl, { remaining })
        : "";

    const progressLine2 = (() => {
      const t = String(progressLine2Raw || "").trim();
      if (!t) return "";
      // Defensive de-dup:
      // some wording variants or copy assembly paths can accidentally produce the same
      // line twice separated by newlines. Collapse only the exact duplicated case here
      // instead of letting the PAYWALL hero render a visually broken repeated sentence.
      const parts = t.split(/\n+/).map((s) => s.trim()).filter(Boolean);
      if (parts.length >= 2 && parts.every((p) => p === parts[0])) return parts[0];
      return t;
    })();

    const ctaEarly = String(pay.ctaEarly || "").trim();
    const ctaStandard = String(pay.ctaStandard || "").trim();
    const primaryCta = isEarly ? ctaEarly : ctaStandard;

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

    const renderBullets = (arr, muted) => {
      if (!arr.length) return "";
      const cls = `wt-list${muted ? " wt-muted" : ""}`;
      const items = arr
        .map((x) => String(x || "").trim())
        .filter(Boolean)
        .map((x) => `<li>${renderTextWithStrong(x)}</li>`)
        .join("");
      return `<ul class="${cls}">${items}</ul>`;
    };

    const socialProofTitle = String(pay.socialProofTitle || "").trim();
    const socialProofQuotes = Array.isArray(pay.socialProofQuotes) ? pay.socialProofQuotes : [];

    const renderUrgencyBanner = () => {
      if (!isEarly || !urgencyEnabled) return "";

      const label = String(pay.timerLabel || "").trim();
      if (!label) return "";

      const cls = `wt-box wt-box--tinted wt-inline-stat`;
      return `
        <div class="${cls} wt-paywall-urgency" role="status" aria-live="polite">
          <div class="wt-paywall-urgency__label wt-inline-stat__label">${escapeHtml(label)}</div>
          <div class="wt-paywall-urgency__timer wt-inline-stat__value${urgencyPulse ? " wt-pulse" : ""}">${escapeHtml(timer)}</div>
        </div>
      `;
    };

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
        <div class="wt-row wt-row--spaced wt-row--top">
          <div>
            <p class="wt-meta wt-paywall-price-value">
              ${escapeHtml(earlyBadge || String(pay.earlyLabel || "").trim())}
            </p>
          </div>
          <div class="wt-paywall-price-side">
            <p class="wt-h2 wt-paywall-price-value">${escapeHtml(early)}</p>
            <p class="wt-muted wt-paywall-price-note">${escapeHtml(standard)}</p>
          </div>
        </div>
      </div>
    `;
      }

      return `
      <div class="${wrapClass}">
        <div class="wt-row wt-row--spaced wt-row--top">
          <div>
            <p class="wt-meta wt-paywall-price-value">${escapeHtml(String(pay.standardLabel || "").trim())}</p>
            ${post1 ? `<p class="wt-muted wt-paywall-price-note">${escapeHtml(post1)}</p>` : ``}
            ${post2 ? `<p class="wt-muted wt-paywall-price-note">${escapeHtml(post2)}</p>` : ``}
          </div>
          <div class="wt-paywall-price-side">
            <p class="wt-h2 wt-paywall-price-value">${escapeHtml(standard)}</p>
          </div>
        </div>
      </div>
    `;
    };

    const hasCompactSection = (compactTitle || compactBullets.length);
    const hasValueSection = (valueTitle || valueBullets.length);
    const hasTrustSection = (trustTitle || trustLine || trustBullets.length);
    const compactSectionHtml = hasCompactSection
      ? renderPaywallSection(
        compactTitle,
        compactBullets.length ? `<div class="wt-paywall-list-wrap wt-list-copy">${renderBullets(compactBullets, false)}</div>` : ``,
        "wt-paywall-section",
        escapeHtml
      )
      : "";
    const valueSectionHtml = (!hasCompactSection && hasValueSection)
      ? renderPaywallSection(
        valueTitle,
        valueBullets.length ? `<div class="wt-paywall-list-wrap wt-list-copy">${renderBullets(valueBullets, false)}</div>` : ``,
        "wt-paywall-section",
        escapeHtml
      )
      : "";
    const trustSectionHtml = (!hasCompactSection && hasTrustSection)
      ? renderPaywallSection(
        trustLine ? "" : trustTitle,
        `
          ${trustLine ? `<div class="wt-meta wt-meta--strong wt-paywall-trust-line wt-note">${renderTextWithStrong(trustLine)}</div>` : ``}
          ${trustBullets.length ? `<div class="wt-paywall-list-wrap wt-list-copy">${renderBullets(trustBullets, true)}</div>` : ``}
        `,
        "wt-paywall-section",
        escapeHtml
      )
      : "";
    const socialProofHtml = renderPaywallQuoteCard(socialProofTitle, socialProofQuotes, escapeHtml);

    return `
    <div class="wt-card wt-card--hero wt-card--paywall">
      <div class="wt-paywall-hero${isLastFree ? " wt-paywall-hero--lastfree" : ""}">
        ${renderBrandingRow(cfg, true)}
        <h1 class="wt-h1">${escapeHtml(headline)}</h1>
        ${progressLine1 ? `<p class="wt-muted wt-copy-lead">${escapeHtml(progressLine1)}</p>` : ``}
        ${progressLine2 ? `<p class="wt-muted wt-copy-follow">${escapeHtml(progressLine2)}</p>` : ``}
      </div>

      ${payOnceLine ? `<div class="wt-meta wt-meta--strong wt-copy-emphasis">${escapeHtml(payOnceLine)}</div>` : ``}

      ${renderUrgencyBanner()}

      ${renderPriceBlock()}

      ${savingsLine ? `<p class="wt-muted wt-paywall-savings">${escapeHtml(savingsLine)}</p>` : ``}

      <div class="wt-actions wt-actions--single">
        ${primaryCta ? `<button
          class="wt-btn wt-btn--primary"
          data-action="${isEarly ? "checkout-early" : "checkout-standard"}"
        >${escapeHtml(primaryCta)}</button>` : ``}
      </div>

      ${notNowLabel ? `<p class="wt-paywall-linkline"><button class="wt-text-action" data-action="go-home">${escapeHtml(notNowLabel)}</button></p>` : ``}

      ${redeemLabel ? `<p class="wt-muted wt-paywall-redeem"><button class="wt-btn wt-btn--ghost" data-action="redeem-code">${escapeHtml(redeemLabel)}</button></p>` : ``}

      ${checkoutNote ? `<p class="wt-muted wt-note wt-note--checkout">${escapeHtml(checkoutNote)}</p>` : ``}
      ${deviceNote ? `<p class="wt-muted wt-note wt-note--device">${escapeHtml(deviceNote)}</p>` : ``}

      ${compactSectionHtml}

      ${valueSectionHtml}

      ${(!hasCompactSection && hasValueSection && hasTrustSection) ? `<div class="wt-divider"></div>` : ``}

      ${trustSectionHtml}

      ${socialProofHtml}
    </div>
    `;
  }

  window.WT_UI_Paywall = {
    render
  };
})();
