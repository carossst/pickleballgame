// content-adapter.js — Locale-aware content normalization
// Bridges i18n schema (item.i18n.{locale}.{question,explanationShort}) with the
// flat schema expected by game.js/ui.js (item.question, item.explanationShort).
//
// Backward-compatible:
//   - If item has no `i18n` block → leaves it alone (legacy schema works as-is)
//   - If item has `i18n[locale]` → mutates top-level question/explanationShort
//
// Design choice: mutate in place rather than clone. Reasons:
//   - Items are stored by reference in ui._runtime.contentItems
//   - Mutating in place propagates to all downstream consumers without churn
//   - Memory-efficient (no per-locale array duplication)
//
// Usage:
//   const items = content.items;
//   WT_ContentAdapter.applyLocaleToItems(items, "fr");
//   ui.setContent(items);
//
// On locale change:
//   WT_ContentAdapter.applyLocaleToItems(rawItems, newLocale);
//   ui.render();  // ui will pick up the mutated values
//
// Important runtime note:
//   Locale switching is safe between screens, but a share/export flow that reads
//   content text after a locale toggle will use the newly mutated top-level fields.
//   This is intentional for the current product: sharing reflects the active locale,
//   not necessarily the locale used when the just-finished run started.

(() => {
  "use strict";

  function pickLocaleText(item, locale, key) {
    // Priority:
    //   1. item.i18n[locale][key]            ← preferred (post-Phase 3)
    //   2. item.i18n[defaultLocale][key]     ← fallback to default
    //   3. item.i18n.en[key]                 ← fallback to English
    //   4. item[key]                          ← legacy flat schema
    const i18n = item && item.i18n;
    if (i18n && typeof i18n === "object") {
      const localeBlock = i18n[locale];
      if (localeBlock && typeof localeBlock[key] === "string") {
        return localeBlock[key];
      }
      // Try the configured default locale
      const cfg = window.WT_CONFIG;
      const defaultLoc = cfg && cfg.i18n && cfg.i18n.defaultLocale;
      if (defaultLoc && defaultLoc !== locale) {
        const defaultBlock = i18n[defaultLoc];
        if (defaultBlock && typeof defaultBlock[key] === "string") {
          return defaultBlock[key];
        }
      }
      // Try English as ultimate fallback
      if (i18n.en && typeof i18n.en[key] === "string") {
        return i18n.en[key];
      }
    }
    // Legacy flat schema
    if (typeof item[key] === "string") return item[key];
    return "";
  }

  function applyLocaleToItem(item, locale) {
    if (!item || typeof item !== "object") return item;
    item.question = pickLocaleText(item, locale, "question");
    item.explanationShort = pickLocaleText(item, locale, "explanationShort");
    return item;
  }

  function applyLocaleToItems(items, locale) {
    if (!Array.isArray(items)) return items;
    const loc = String(locale || "en");
    for (const item of items) applyLocaleToItem(item, loc);
    return items;
  }

  function hasI18nSchema(items) {
    if (!Array.isArray(items) || !items.length) return false;
    // Sample a few items to determine schema (handles partial migrations)
    let withI18n = 0;
    const sampleSize = Math.min(10, items.length);
    for (let i = 0; i < sampleSize; i++) {
      if (items[i] && items[i].i18n && typeof items[i].i18n === "object") withI18n++;
    }
    return (withI18n * 2) >= sampleSize;
  }

  window.WT_ContentAdapter = {
    applyLocaleToItem,
    applyLocaleToItems,
    pickLocaleText,
    hasI18nSchema
  };
})();
