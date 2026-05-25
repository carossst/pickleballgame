// ui-checkout.js
// Extracted from ui.js to keep checkout and paywall timer flows isolated from the core UI shell.

(() => {
  "use strict";

  function startPaywallTicker(ui, helpers) {
    const {
      syncScopedRenderTicker,
      shouldRefreshPaywallTimer,
      isEarlyPriceWindowActive
    } = helpers || {};

    if (
      typeof syncScopedRenderTicker !== "function" ||
      typeof shouldRefreshPaywallTimer !== "function" ||
      typeof isEarlyPriceWindowActive !== "function"
    ) {
      throw new Error("WT_UI_Checkout helpers missing");
    }

    const ms = Number(ui.config?.ui?.paywallTickerMs);
    if (!Number.isFinite(ms) || ms < 200 || ms > 2000) return;

    stopPaywallTicker(ui, helpers);

    ui._paywallTickerId = syncScopedRenderTicker(ui, {
      key: "paywall.ticker",
      scope: "paywall",
      shouldRun: shouldRefreshPaywallTimer,
      shouldContinueAfterRender: (candidateUi) =>
        shouldRefreshPaywallTimer(candidateUi) && isEarlyPriceWindowActive(candidateUi.storage),
      getDelayMs: () => Math.floor(ms),
      onStop: (candidateUi) => {
        if (candidateUi) candidateUi._paywallTickerId = null;
      }
    });
  }

  function stopPaywallTicker(ui, helpers) {
    const { clearUiTimer } = helpers || {};
    if (typeof clearUiTimer !== "function") {
      throw new Error("WT_UI_Checkout helpers missing");
    }

    clearUiTimer("paywall.ticker");
    ui._paywallTickerId = null;
  }

  function checkout(ui, priceKey, event, helpers) {
    const { isOnline, toastNow } = helpers || {};
    if (typeof isOnline !== "function" || typeof toastNow !== "function") {
      throw new Error("WT_UI_Checkout helpers missing");
    }

    if (!isOnline()) {
      const msg = String(ui.wording?.system?.offlinePayment || "").trim();
      if (msg) toastNow(ui.config, msg);
      return;
    }

    if (ui.storage && typeof ui.storage.markCheckoutStarted === "function") {
      ui.storage.markCheckoutStarted(priceKey);
    }

    const cfg = ui.config || {};
    const key = String(priceKey || "").toUpperCase();
    const url = (key === "EARLY")
      ? String(cfg.stripeEarlyPaymentUrl || "").trim()
      : String(cfg.stripeStandardPaymentUrl || "").trim();

    const sourceBtn = (event && event.target && event.target.closest)
      ? event.target.closest("button[data-action], a[data-action]")
      : null;

    const redirectLabel = String(ui.wording?.paywall?.checkoutRedirecting || "").trim();
    const previousLabel = sourceBtn ? String(sourceBtn.textContent || "").trim() : "";

    const resetCheckoutButton = () => {
      if (!sourceBtn) return;
      sourceBtn.disabled = false;
      sourceBtn.removeAttribute("aria-busy");
      if (previousLabel) sourceBtn.textContent = previousLabel;
    };

    if (!url) {
      resetCheckoutButton();
      return;
    }

    try {
      const urlObj = new URL(url);
      const allowedHosts = ["buy.stripe.com", "checkout.stripe.com"];
      if (!allowedHosts.includes(urlObj.hostname)) {
        console.error("[WT Security] Invalid Stripe URL hostname:", urlObj.hostname);
        resetCheckoutButton();
        return;
      }
    } catch (_) {
      console.error("[WT Security] Invalid Stripe URL:", url);
      resetCheckoutButton();
      return;
    }

    if (sourceBtn) {
      sourceBtn.disabled = true;
      sourceBtn.setAttribute("aria-busy", "true");
      if (redirectLabel) sourceBtn.textContent = redirectLabel;
    }

    window.location.href = url;
  }

  function applyUpdateToast(ui, helpers) {
    const { el } = helpers || {};
    if (typeof el !== "function") {
      throw new Error("WT_UI_Checkout helpers missing");
    }

    const node = el("update-toast");
    try {
      if (window.Logger && typeof window.Logger.log === "function") {
        window.Logger.log("[UPDATE] applyUpdateToast", {
          hasNode: !!node,
          ready: window.__WT_SW_UPDATE_READY__ === true,
          inFlight: window.__WT_SW_UPDATE_IN_FLIGHT__ === true
        });
      }
    } catch (_) { /* silent */ }

    if (!node) return;

    if (window.__WT_SW_UPDATE_READY__ === true) {
      if (typeof window.__WT_APPLY_SW_UPDATE__ === "function") {
        window.__WT_APPLY_SW_UPDATE__();
      } else {
        location.reload();
      }
      return;
    }

    node.classList.remove("wt-toast--visible");
  }

  window.WT_UI_Checkout = {
    startPaywallTicker,
    stopPaywallTicker,
    checkout,
    applyUpdateToast
  };
})();
