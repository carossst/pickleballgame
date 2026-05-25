// i18n-toggle.js — Locale switcher, fixed top-right
//
// Behavior:
//   - The button always displays the OTHER language (not the current one).
//   - When locale = "en", button shows "FR" → click switches to French.
//   - When locale = "fr", button shows "EN" → click switches to English.
//   - On localized entry pages (`/` and `/fr.html`), switching performs a
//     real navigation to the sibling locale page for cleaner SEO/share URLs.
//   - On other static bilingual pages (ex: success/privacy/terms), switching
//     stays in-place via WT_I18N.setLocale().
//
// Placement:
//   - Fixed top-right of viewport, respects mobile safe-area.
//   - No HTML change needed (the button injects itself into <body>).
//   - Hidden during PLAYING via CSS rule on body.wt-state--playing.
//
// Contract:
//   - i18n.js MUST load before this file
//   - Safe to load on static pages (no game state)
//   - If WT_I18N missing or only 1 locale, the file is a no-op
//   - If 3+ locales supported, falls back to a select dropdown (future-proof)

(() => {
  "use strict";

  const I18N = window.WT_I18N;
  if (!I18N || typeof I18N.getLocale !== "function") return;

  const locales = I18N.getSupportedLocales();
  if (!Array.isArray(locales) || locales.length < 2) return;

  // Display labels for the locale buttons. Hardcoded because they render in their
  // own script (a French speaker sees "EN" for English) and must show BEFORE
  // wording.js fully hydrates.
  const LABELS = {
    en: "EN",
    fr: "FR",
    // Future locales: es: "ES", de: "DE", ...
  };
  let host = null;
  let observer = null;
  let observedRoot = null;
  let remountRaf = 0;
  let prefetchLink = null;

  function getGlobeIconHtml() {
    return `<span class="wt-locale-swap__icon" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="14" height="14" focusable="false" aria-hidden="true">
        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.25"/>
        <path d="M2.5 8h11" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>
        <path d="M8 2.2c1.8 1.6 2.7 3.5 2.7 5.8S9.8 12.2 8 13.8C6.2 12.2 5.3 10.3 5.3 8S6.2 3.8 8 2.2Z" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/>
      </svg>
    </span>`;
  }

  function getLocaleName(loc) {
    const wording = window.WT_WORDING;
    const name = wording && wording.i18nToggle && wording.i18nToggle.languageNames
      ? wording.i18nToggle.languageNames[loc]
      : "";
    return String(name || LABELS[loc] || loc).trim();
  }

  function getSwitchAria(loc) {
    const wording = window.WT_WORDING;
    const template = String(wording?.i18nToggle?.switchToTemplate || "").trim();
    const localeName = getLocaleName(loc);
    if (template && localeName) {
      return template.replaceAll("{locale}", localeName);
    }
    return `Switch to ${LABELS[loc] || loc}`;
  }

  function getSelectorAria() {
    const wording = window.WT_WORDING;
    const explicit = String(wording?.i18nToggle?.selectorLabel || "").trim();
    return explicit || "Language selector";
  }

  function getOtherLocale(active) {
    // Single-click swap pattern: button shows the locale OTHER than active.
    // Only applies when exactly 2 supported locales.
    return locales.find((l) => l !== active) || locales[0];
  }

  function normalizePathname(pathname) {
    const raw = String(pathname || "").trim();
    if (!raw) return "/";
    return raw.replace(/\/+/g, "/");
  }

  function isLocalizedEntryPath(pathname) {
    const path = normalizePathname(pathname);
    return path === "/" || path === "/index.html" || path === "/fr.html";
  }

  function getEntryHrefForLocale(loc) {
    const normalized = String(loc || "").trim().toLowerCase();
    if (normalized === "fr") return "./fr.html";
    return "./index.html";
  }

  function getNavigationHref(loc) {
    if (!isLocalizedEntryPath(window.location.pathname)) return "";
    return getEntryHrefForLocale(loc);
  }

  function persistLocaleChoice(loc) {
    const storageKey = String(window?.WT_CONFIG?.i18n?.localeStorageKey || "").trim();
    if (!storageKey) return;
    try {
      window.localStorage.setItem(storageKey, String(loc || "").trim().toLowerCase());
    } catch (_) { /* silent */ }
  }

  function ensureSiblingPrefetch() {
    const active = I18N.getLocale();
    const other = getOtherLocale(active);
    const href = getNavigationHref(other);
    if (!href) return;

    if (!prefetchLink) {
      prefetchLink = document.createElement("link");
      prefetchLink.setAttribute("rel", "prefetch");
      prefetchLink.setAttribute("as", "document");
      prefetchLink.setAttribute("data-wt-locale-prefetch", "1");
      document.head.appendChild(prefetchLink);
    }

    if (prefetchLink.getAttribute("href") !== href) {
      prefetchLink.setAttribute("href", href);
    }
  }

  function buildButtonHtml(active) {
    const other = getOtherLocale(active);
    const label = LABELS[other] || String(other).toUpperCase();
    const aria = getSwitchAria(other);
    const href = getNavigationHref(other);
    if (href) {
      return `<a
      class="wt-locale-swap"
      href="${href}"
      data-wt-locale-swap-to="${other}"
      aria-label="${aria}">${getGlobeIconHtml()}<span class="wt-locale-swap__label">${label}</span></a>`;
    }
    return `<button type="button"
      class="wt-locale-swap"
      data-wt-locale-swap-to="${other}"
      aria-label="${aria}">${getGlobeIconHtml()}<span class="wt-locale-swap__label">${label}</span></button>`;
  }

  function buildDropdownHtml(active) {
    // Used only if 3+ locales — single-click swap doesn't scale.
    const options = locales.map((loc) => {
      const sel = loc === active ? "selected" : "";
      const label = LABELS[loc] || String(loc).toUpperCase();
      return `<option value="${loc}" ${sel}>${label}</option>`;
    }).join("");
    return `<select class="wt-locale-dropdown" aria-label="${getSelectorAria()}"
      data-wt-locale-select>${options}</select>`;
  }

  function rerender(host) {
    if (!host) return;
    const active = I18N.getLocale();
    host.innerHTML = (locales.length === 2)
      ? buildButtonHtml(active)
      : buildDropdownHtml(active);
  }

  function ensureHost() {
    if (!host) {
      host = document.createElement("div");
      host.className = "wt-locale-toggle-host";
    }

    const slot = document.querySelector("[data-wt-locale-toggle-slot]");
    if (slot) {
      host.classList.remove("wt-locale-toggle-host--floating");
      if (host.parentNode !== slot) slot.appendChild(host);
      return host;
    }

    host.classList.add("wt-locale-toggle-host--floating");
    if (host.parentNode !== document.body) document.body.appendChild(host);
    return host;
  }

  function handleClick(e) {
    const target = e.target.closest && e.target.closest("[data-wt-locale-swap-to]");
    if (!target) return;

    const loc = target.getAttribute("data-wt-locale-swap-to");
    if (!loc) return;

    e.preventDefault();

    try {
      if (typeof e.stopPropagation === "function") e.stopPropagation();
    } catch (_) { /* silent */ }

    const href = getNavigationHref(loc);
    if (href) {
      persistLocaleChoice(loc);
      window.location.assign(href);
      return;
    }

    I18N.setLocale(loc);
  }

  function handleChange(e) {
    const target = e.target.closest && e.target.closest("[data-wt-locale-select]");
    if (!target) return;
    const loc = target.value;
    if (!loc) return;
    const href = getNavigationHref(loc);
    if (href) {
      persistLocaleChoice(loc);
      window.location.assign(href);
      return;
    }
    I18N.setLocale(loc);
  }

  function mount() {
    const mountHost = ensureHost();
    if (!mountHost) return;
    rerender(mountHost);
    ensureSiblingPrefetch();

    if (!mountHost.getAttribute("data-wt-toggle-bound")) {
      mountHost.setAttribute("data-wt-toggle-bound", "1");
      mountHost.addEventListener("click", handleClick);
      mountHost.addEventListener("change", handleChange);
      mountHost.addEventListener("pointerenter", () => ensureSiblingPrefetch(), { passive: true });
      mountHost.addEventListener("touchstart", () => ensureSiblingPrefetch(), { passive: true });
    }

    // Re-render on locale change so the label updates to the new "other" locale
    try {
      window.addEventListener("wt:locale-change", () => {
        const currentHost = ensureHost();
        rerender(currentHost);
        ensureSiblingPrefetch();
      });
    } catch (_) { /* silent */ }

    function bindObserver() {
      const root = document.getElementById("app");
      if (!("MutationObserver" in window)) return;

      if (observer && observedRoot === root) return;

      if (observer) {
        try { observer.disconnect(); } catch (_) { /* silent */ }
        observer = null;
        observedRoot = null;
      }

      if (!root) return;

      observer = new MutationObserver(() => {
        if (remountRaf) return;
        remountRaf = window.requestAnimationFrame(() => {
          remountRaf = 0;
          const currentHost = ensureHost();
          rerender(currentHost);
        });
      });
      observer.observe(root, { childList: true, subtree: true });
      observedRoot = root;
    }

    bindObserver();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
