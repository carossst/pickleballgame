// wording.js - shared DOM wording hydration for static pages and partial roots
// Locale-reactive: re-hydrates on "wt:locale-change" event.
// Loads AFTER i18n.js (which sets window.WT_WORDING to the active locale tree).
(() => {
  "use strict";

  function getByPath(root, path) {
    const key = String(path || "").trim();
    if (!key) return null;

    const parts = key.split(".");
    let cur = root;

    for (const part of parts) {
      if (!cur || typeof cur !== "object") return null;
      cur = cur[part];
    }

    return (typeof cur === "string") ? cur : null;
  }

  function hydrateText(root = document) {
    const wording = window.WT_WORDING;
    if (!root || !wording || typeof wording !== "object") return;

    try {
      const nodes = root.querySelectorAll("[data-wt-wording]");
      nodes.forEach((el) => {
        const text = getByPath(wording, el.getAttribute("data-wt-wording"));
        if (typeof text === "string") el.textContent = text;
      });
    } catch (_) { /* silent */ }
  }

  function hydrateAria(root = document) {
    const wording = window.WT_WORDING;
    if (!root || !wording || typeof wording !== "object") return;

    try {
      const nodes = root.querySelectorAll("[data-wt-aria-label]");
      nodes.forEach((el) => {
        const text = getByPath(wording, el.getAttribute("data-wt-aria-label"));
        if (typeof text === "string") el.setAttribute("aria-label", text);
      });
    } catch (_) { /* silent */ }
  }

  function hydrateBrand(root = document) {
    const wording = window.WT_WORDING;
    if (!root || !wording || typeof wording !== "object") return;

    try {
      const nodes = root.querySelectorAll('[data-wt-brand="creatorLine"]');
      if (!nodes.length) return;

      // Controlled editorial HTML only.
      // Contract: creatorLineHtml is defined in config.js, never sourced from user input.
      const html = String(wording.brand?.creatorLineHtml || "").trim();
      const text = String(wording.brand?.creatorLine || "").trim();
      nodes.forEach((el) => {
        if (html) el.innerHTML = html;
        else if (text) el.textContent = text;
      });
    } catch (_) { /* silent */ }
  }

  function hydrateHref(root = document) {
    // Locale-aware hrefs. Pattern: <a data-wt-href="footer.links.bonjourPickleball.href">
    // Companion to data-wt-wording for cases where the link destination differs by locale.
    const wording = window.WT_WORDING;
    if (!root || !wording || typeof wording !== "object") return;

    try {
      const nodes = root.querySelectorAll("[data-wt-href]");
      nodes.forEach((el) => {
        const href = getByPath(wording, el.getAttribute("data-wt-href"));
        if (typeof href === "string" && href) el.setAttribute("href", href);
      });
    } catch (_) { /* silent */ }
  }

  function hydrateMeta(root = document) {
    // Locale-aware <title> and <meta name="description">.
    // Pattern in <head>:
    //   <title data-wt-wording="meta.indexTitle">...</title>
    //   <meta name="description" data-wt-meta-description="meta.indexDescription">
    if (!root) return;
    const wording = window.WT_WORDING;
    if (!wording || typeof wording !== "object") return;

    try {
      const metas = root.querySelectorAll("meta[data-wt-meta-description]");
      metas.forEach((m) => {
        const text = getByPath(wording, m.getAttribute("data-wt-meta-description"));
        if (typeof text === "string") m.setAttribute("content", text);
      });
    } catch (_) { /* silent */ }
  }

  function hydrate(root = document) {
    hydrateText(root);
    hydrateAria(root);
    hydrateBrand(root);
    hydrateHref(root);
    hydrateMeta(root);
  }

  window.WT_Wording = {
    getByPath,
    hydrate,
    hydrateText,
    hydrateAria,
    hydrateBrand,
    hydrateHref,
    hydrateMeta
  };

  function onReady() {
    hydrate(document);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }

  // Locale reactivity: when the user changes language, re-hydrate everything.
  // For static pages (no ui.js), this is enough to fully retranslate the visible DOM.
  // For the game shell (index.html), main.js additionally triggers a UI re-render.
  try {
    window.addEventListener("wt:locale-change", () => {
      hydrate(document);
    });
  } catch (_) { /* silent */ }
})();
