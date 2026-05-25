// i18n.js - Locale management
// SINGLE SOURCE OF TRUTH for active locale. Loads BEFORE wording.js.
// Resolves active locale from:
// ?lang= URL param > page locale hint > localStorage > navigator.language > defaultLocale.
// Exposes WT_I18N global: { getLocale, setLocale, getSupportedLocales, isSupported, onChange }.
// Dispatches "wt:locale-change" CustomEvent on window when locale changes.
//
// Contract:
// - config.js MUST load before this file (provides WT_CONFIG.i18n + WT_WORDING_ALL)
// - wording.js MUST load AFTER this file (reads window.WT_WORDING which is set here)
//
// Behavior:
// - Sets window.WT_WORDING = WT_WORDING_ALL[activeLocale]
// - Sets <html lang="..."> to active locale
// - Persists chosen locale to localStorage under WT_CONFIG.i18n.localeStorageKey
// - On setLocale(): updates window.WT_WORDING, html.lang, storage, fires event

(() => {
  "use strict";

  const cfg = window.WT_CONFIG;
  const all = window.WT_WORDING_ALL;

  // Fail-closed: if i18n config or wording bank missing, fall back to legacy WT_WORDING (EN-only).
  // This keeps the app functional even if the bilingual layer is partially deployed.
  if (!cfg || !cfg.i18n || !all) {
    if (!window.WT_WORDING) {
      // Truly nothing wired: fatal.
      try { console.error("[WT_I18N] WT_CONFIG.i18n or WT_WORDING_ALL missing AND WT_WORDING absent."); } catch (_) { /* silent */ }
    }
    // Stub WT_I18N so the toggle component degrades gracefully
    window.WT_I18N = {
      getLocale: () => "en",
      setLocale: () => false,
      getSupportedLocales: () => ["en"],
      isSupported: (l) => l === "en",
      onChange: () => () => {}
    };
    return;
  }

  const i18nCfg = cfg.i18n;
  const SUPPORTED = Array.isArray(i18nCfg.supportedLocales) && i18nCfg.supportedLocales.length
    ? i18nCfg.supportedLocales.slice()
    : ["en"];
  const DEFAULT = String(i18nCfg.defaultLocale || "en").toLowerCase();
  const STORAGE_KEY = String(i18nCfg.localeStorageKey || "pickleball-rules-quiz:locale");

  function isSupported(loc) {
    return typeof loc === "string" && SUPPORTED.indexOf(loc) !== -1;
  }

  function normalize(loc) {
    if (!loc || typeof loc !== "string") return null;
    const lower = loc.trim().toLowerCase();
    // Accept "fr-FR", "fr_FR", "fr" — collapse to primary subtag.
    const primary = lower.split(/[-_]/)[0];
    return isSupported(primary) ? primary : null;
  }

  function readUrlParam() {
    try {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get("lang");
      return normalize(raw);
    } catch (_) {
      return null;
    }
  }

  function readStorage() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return normalize(raw);
    } catch (_) {
      return null;
    }
  }

  function readDocumentHint() {
    try {
      const raw = document.documentElement.getAttribute("data-wt-locale-hint");
      return normalize(raw);
    } catch (_) {
      return null;
    }
  }

  function writeStorage(loc) {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(loc));
    } catch (_) {
      // Private mode / quota exceeded — silently fail. The session-level locale remains active.
    }
  }

  function getDeviceLocaleCandidates() {
    const raw = [];
    try {
      if (Array.isArray(navigator.languages) && navigator.languages.length) {
        raw.push(...navigator.languages);
      }
      raw.push(navigator.language || "");
      raw.push(navigator.userLanguage || "");
    } catch (_) { /* silent */ }
    return raw
      .map((loc) => normalize(loc))
      .filter(Boolean)
      .filter((loc, index, arr) => arr.indexOf(loc) === index);
  }

  function readDeviceLocale() {
    const langs = getDeviceLocaleCandidates();
    return langs.length ? langs[0] : null;
  }

  function resolveInitialLocale() {
    // Priority order per PRD:
    // 1. URL ?lang= (overrides at first load — used for shared links)
    // 2. page locale hint (locale-specific static entry, e.g. fr.html)
    // 3. localStorage (persisted user choice)
    // 4. navigator.language (auto-detect at first visit)
    // 5. defaultLocale (fallback)
    return readUrlParam() || readDocumentHint() || readStorage() || readDeviceLocale() || DEFAULT;
  }

  function applyLocaleToDocument(loc) {
    try {
      document.documentElement.setAttribute("lang", String(loc));
    } catch (_) { /* silent */ }

    // Toggle locale-content sections in static pages (privacy, terms, press, etc.)
    try {
      const nodes = document.querySelectorAll("[data-wt-locale-content]");
      nodes.forEach((el) => {
        const targetLoc = String(el.getAttribute("data-wt-locale-content") || "").trim().toLowerCase();
        const shouldShow = (targetLoc === loc);
        el.classList.toggle("wt-hidden", !shouldShow);
        el.setAttribute("aria-hidden", shouldShow ? "false" : "true");
      });
    } catch (_) { /* silent */ }

    // Swap PWA manifest if a locale-specific manifest exists.
    // Convention: ./manifest.<locale>.json next to ./manifest.json
    // The default locale uses the base manifest.json with no suffix.
    try {
      const linkManifest = document.querySelector('link[rel="manifest"]');
      if (linkManifest) {
        const baseHref = linkManifest.getAttribute("data-wt-base-href")
          || linkManifest.getAttribute("href")
          || "./manifest.json";
        // Save base href once for future swaps
        if (!linkManifest.getAttribute("data-wt-base-href")) {
          linkManifest.setAttribute("data-wt-base-href", baseHref);
        }
        const targetHref = (loc === DEFAULT)
          ? baseHref
          : baseHref.replace(/manifest\.json$/i, `manifest.${loc}.json`);
        if (linkManifest.getAttribute("href") !== targetHref) {
          linkManifest.setAttribute("href", targetHref);
        }
      }
    } catch (_) { /* silent */ }
  }

  function applyLocaleToWording(loc) {
    // The whole point: WT_WORDING always points to the current locale's tree.
    // This means all existing data-wt-wording lookups and this.wording.* accesses
    // automatically resolve against the active language. No call-site changes needed.
    const tree = all[loc] || all[DEFAULT] || null;
    if (tree && typeof tree === "object") {
      window.WT_WORDING = tree;
    }
  }

  const listeners = new Set();

  function emitChange(prev, next) {
    // Internal listeners
    listeners.forEach((fn) => {
      try { fn(next, prev); } catch (_) { /* silent */ }
    });

    // Public event for any module that wants to react (ui.js re-render, etc.)
    try {
      window.dispatchEvent(new CustomEvent("wt:locale-change", {
        detail: { locale: next, previous: prev }
      }));
    } catch (_) { /* silent */ }
  }

  // --- Initial resolution ---
  let activeLocale = resolveInitialLocale();
  if (!isSupported(activeLocale)) activeLocale = DEFAULT;

  applyLocaleToWording(activeLocale);
  applyLocaleToDocument(activeLocale);
  writeStorage(activeLocale);

  // --- Public API ---
  window.WT_I18N = {
    getLocale() {
      return activeLocale;
    },

    getSupportedLocales() {
      return SUPPORTED.slice();
    },

    isSupported,

    setLocale(loc) {
      const normalized = normalize(loc);
      if (!normalized) return false;
      if (normalized === activeLocale) return true;

      const prev = activeLocale;
      activeLocale = normalized;

      writeStorage(activeLocale);
      applyLocaleToWording(activeLocale);
      applyLocaleToDocument(activeLocale);
      emitChange(prev, activeLocale);
      return true;
    },

    onChange(fn) {
      if (typeof fn !== "function") return () => {};
      listeners.add(fn);
      return () => listeners.delete(fn);
    }
  };
})();
