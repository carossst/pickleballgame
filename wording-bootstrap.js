// wording-bootstrap.js — sets window.WT_WORDING (legacy alias) BEFORE i18n.js runs.
// This file MUST be loaded AFTER wording-en.js + wording-fr.js (and any other locales),
// but BEFORE i18n.js (which will overwrite WT_WORDING with the resolved active locale).
//
// Why this exists: code that runs at parse-time (e.g. ui.js line 16 sanity check) reads
// window.WT_WORDING. We need it set to *something* even before i18n.js resolves the locale.
(() => {
  "use strict";
  try {
    const cfg = window.WT_CONFIG;
    const defaultLoc = (cfg && cfg.i18n && cfg.i18n.defaultLocale) || "en";
    const all = window.WT_WORDING_ALL || {};
    const bootstrapTree = all[defaultLoc] || all.en || window.WT_WORDING || {};
    window.WT_WORDING = bootstrapTree;
  } catch (_) { /* silent */ }
})();
