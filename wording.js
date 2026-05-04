// wording.js - shared DOM wording hydration for static pages and partial roots
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

  function hydrate(root = document) {
    hydrateText(root);
    hydrateAria(root);
    hydrateBrand(root);
  }

  window.WT_Wording = {
    getByPath,
    hydrate,
    hydrateText,
    hydrateAria,
    hydrateBrand
  };

  function onReady() {
    hydrate(document);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})();
