#!/usr/bin/env node
/**
 * generate-sitemap.mjs
 * Generates sitemap.xml from seo-pages.json + the fixed app/static URLs.
 * One source of truth: never hand-edit sitemap.xml for SEO pages.
 *
 * Usage: node scripts/generate-sitemap.mjs
 * Reads:  ./seo-pages.json
 * Writes: ./sitemap.xml
 *
 * Only pages with status "live" are emitted. Drafts stay out of the sitemap
 * (they can still be deployed and crawled, but we don't advertise them
 * until they pass the 450-word minimum and a human review).
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const seoPath = path.join(ROOT, "seo-pages.json");
const outPath = path.join(ROOT, "sitemap.xml");

const seo = JSON.parse(fs.readFileSync(seoPath, "utf8"));
const BASE = String(seo?.defaults?.baseUrl || "https://pickleballrulesquiz.com").replace(/\/+$/, "");
const today = new Date().toISOString().slice(0, 10);

function urlEntry({ loc, lastmod, changefreq, priority, alternates }) {
  const alt = (alternates || [])
    .map(
      (a) =>
        `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}"/>`
    )
    .join("\n");
  return [
    "  <url>",
    `    <loc>${loc}</loc>`,
    `    <lastmod>${lastmod || today}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    alt,
    "  </url>"
  ]
    .filter(Boolean)
    .join("\n");
}

const entries = [];

// --- Fixed app + static pages (mirrors the existing hand-written sitemap) ---
entries.push(
  urlEntry({
    loc: `${BASE}/`,
    lastmod: "2026-05-19",
    changefreq: "weekly",
    priority: "1.0",
    alternates: [
      { hreflang: "en", href: `${BASE}/` },
      { hreflang: "fr", href: `${BASE}/fr.html` },
      { hreflang: "x-default", href: `${BASE}/` }
    ]
  })
);
entries.push(
  urlEntry({
    loc: `${BASE}/fr.html`,
    lastmod: "2026-05-21",
    changefreq: "weekly",
    priority: "0.9",
    alternates: [
      { hreflang: "en", href: `${BASE}/` },
      { hreflang: "fr", href: `${BASE}/fr.html` },
      { hreflang: "x-default", href: `${BASE}/` }
    ]
  })
);
for (const page of ["press.html", "privacy.html", "terms.html"]) {
  entries.push(
    urlEntry({
      loc: `${BASE}/${page}`,
      lastmod: "2026-05-19",
      changefreq: page === "press.html" ? "monthly" : "yearly",
      priority: page === "press.html" ? "0.6" : "0.3",
      alternates: [
        { hreflang: "en", href: `${BASE}/${page}?lang=en` },
        { hreflang: "fr", href: `${BASE}/${page}?lang=fr` },
        { hreflang: "x-default", href: `${BASE}/${page}` }
      ]
    })
  );
}

// --- SEO layer: themes (layer 2) ---
const themePattern = String(seo?.defaults?.urlPatterns?.theme || "/quiz/{slug}/");
for (const theme of seo.themes || []) {
  if (theme.status !== "live") continue;
  entries.push(
    urlEntry({
      loc: `${BASE}${themePattern.replace("{slug}", theme.slug)}`,
      lastmod: theme.lastmod,
      changefreq: "monthly",
      priority: "0.8"
    })
  );
}

// --- SEO layer: questions (layer 3) ---
const questionPattern = String(seo?.defaults?.urlPatterns?.question || "/rules/{slug}/");
for (const q of seo.questions || []) {
  if (q.status !== "live") continue;
  entries.push(
    urlEntry({
      loc: `${BASE}${questionPattern.replace("{slug}", q.slug)}`,
      lastmod: q.lastmod,
      changefreq: "yearly",
      priority: "0.6"
    })
  );
}

// --- SEO layer: LLM capture (layer 4) ---
for (const p of seo?.llmCapture?.pages || []) {
  if (p.status !== "live") continue;
  entries.push(
    urlEntry({
      loc: `${BASE}${p.path}`,
      lastmod: p.lastmod,
      changefreq: "monthly",
      priority: "0.5"
    })
  );
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
  '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  "",
  "  <!-- GENERATED FILE — do not hand-edit. Run: node scripts/generate-sitemap.mjs -->",
  "",
  entries.join("\n\n"),
  "",
  "</urlset>",
  ""
].join("\n");

fs.writeFileSync(outPath, xml, "utf8");
console.log(
  `sitemap.xml written: ${entries.length} URLs (live pages only).`
);
