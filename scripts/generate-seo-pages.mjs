#!/usr/bin/env node
/**
 * generate-seo-pages.mjs
 * Generates /rules/<slug>/index.html pages from seo-pages.json.
 * Creates the folders automatically — never create them by hand.
 *
 * Usage: node scripts/generate-seo-pages.mjs
 * Reads:  ./seo-pages.json
 * Writes: ./rules/<slug>/index.html for every question with status
 *         "ready" or "live" AND a filled "content" block.
 *
 * Drafts without content are skipped (listed in the console).
 * Pairs with generate-sitemap.mjs: only "live" pages enter the sitemap.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const seo = JSON.parse(fs.readFileSync(path.join(ROOT, "seo-pages.json"), "utf8"));
const content = JSON.parse(fs.readFileSync(path.join(ROOT, "content.json"), "utf8"));
const BASE = String(seo?.defaults?.baseUrl || "https://pickleballrulesquiz.com").replace(/\/+$/, "");
const cardsById = new Map(
  (content?.items || []).map((item) => [Number(item?.id), item])
);

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Lead/paragraphs may contain intentional inline markup (<strong>, <em>).
// Escape everything else is not practical here, so content is trusted —
// it comes from seo-pages.json which we author ourselves.
const getCardQuestionEn = (cardId) => {
  const item = cardsById.get(Number(cardId));
  const text = String(item?.i18n?.en?.question || item?.question || "").trim();
  return text;
};

const buildSeoQuizHref = ({ themeSlug, themeLabel, entrySlug, entryLabel, entryType }) => {
  const params = new URLSearchParams();
  params.set("wt-source", "seo");
  if (themeSlug) params.set("wt-topic", String(themeSlug).trim());
  if (themeLabel) params.set("wt-topic-label", String(themeLabel).trim());
  if (entrySlug) params.set("wt-entry", String(entrySlug).trim());
  if (entryLabel) params.set("wt-entry-label", String(entryLabel).trim());
  if (entryType) params.set("wt-entry-type", String(entryType).trim());
  return `/?${params.toString()}`;
};

const formatVisibleDate = (isoDate) => {
  const text = String(isoDate || "").trim();
  if (!text) return "";
  const date = new Date(`${text}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return text;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  }).format(date);
};

const validateTeasers = (ownerLabel, cardIds, quizTeaser) => {
  const errors = [];
  const ids = Array.isArray(cardIds) ? cardIds : [];
  const teasers = Array.isArray(quizTeaser) ? quizTeaser : [];

  if (!ids.length) {
    errors.push(`${ownerLabel} — missing cardIds`);
    return errors;
  }

  if (!teasers.length) {
    errors.push(`${ownerLabel} — missing content.quizTeaser`);
    return errors;
  }

  if (ids.length !== teasers.length) {
    errors.push(
      `${ownerLabel} — cardIds/quizTeaser length mismatch (${ids.length} ids, ${teasers.length} teasers)`
    );
  }

  const checkCount = Math.min(ids.length, teasers.length);
  for (let index = 0; index < checkCount; index++) {
    const cardId = Number(ids[index]);
    const expected = getCardQuestionEn(cardId);
    const actual = String(teasers[index] || "").trim();

    if (!expected) {
      errors.push(`${ownerLabel} — cardId ${cardId} not found in content.json`);
      continue;
    }

    if (actual !== expected) {
      errors.push(
        `${ownerLabel} — teaser ${index + 1} must match content.json card ${cardId} exactly`
      );
    }
  }

  return errors;
};

const renderPage = (q) => {
  const url = `${BASE}/rules/${q.slug}/`;
  const parentTheme = (seo.themes || []).find((t) => t.slug === q.theme) || null;
  const faqEntities = (q.content.faq || []).map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a }
  }));
  // Breadcrumb: only reference the theme page if it is actually live.
  // Structured data URLs get crawled — never point them at pages that
  // don't exist yet. Regenerate pages after a theme goes live to upgrade
  // breadcrumbs from 2 to 3 levels.
  const themeIsLive = (seo.themes || []).some(
    (t) => t.slug === q.theme && t.status === "live"
  );
  const crumbs = [
    { "@type": "ListItem", position: 1, name: "Pickleball Rules Quiz", item: `${BASE}/` }
  ];
  if (themeIsLive) {
    crumbs.push({
      "@type": "ListItem",
      position: 2,
      name: q.breadcrumbTheme,
      item: `${BASE}/quiz/${q.theme}/`
    });
  }
  crumbs.push({
    "@type": "ListItem",
    position: crumbs.length + 1,
    name: q.question,
    item: url
  });
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "FAQPage", mainEntity: faqEntities },
      { "@type": "BreadcrumbList", itemListElement: crumbs }
    ]
  };

  const sections = (q.content.sections || [])
    .map(
      (s) =>
        `                    <h2 class="wt-h2">${esc(s.h2)}</h2>\n` +
        s.paragraphs.map((p) => `                    <p>\n                        ${p}\n                    </p>`).join("\n")
    )
    .join("\n\n");

  const teaser = (q.content.quizTeaser || []).map((t) => `"${t}"`).join(" ·\n                        ");

  // FAQ visible: same source as the FAQPage JSON-LD, so structured data
  // always matches on-page content (Google AI features guidance).
  const faqHtml = (q.content.faq || [])
    .map(
      (f) =>
        `                    <h3>${esc(f.q)}</h3>\n` +
        `                    <p>\n                        ${esc(f.a)}\n                    </p>`
    )
    .join("\n");

  const relatedQuestions = (seo.questions || []).filter(
    (candidate) =>
      candidate.slug !== q.slug &&
      candidate.theme === q.theme &&
      (candidate.status === "ready" || candidate.status === "live") &&
      candidate.content
  );
  const relatedBlock = parentTheme || relatedQuestions.length
    ? `                    <h2 class="wt-h2">More from this topic</h2>\n` +
      (parentTheme
        ? `                    <p><a href="/quiz/${parentTheme.slug}/">Back to ${esc(parentTheme.h1)}</a></p>\n`
        : "") +
      relatedQuestions
        .map(
          (candidate) =>
            `                    <p><a href="/rules/${candidate.slug}/">${esc(candidate.question)}</a></p>`
        )
        .join("\n") + (relatedQuestions.length ? "\n" : "")
    : "";
  const visibleDate = formatVisibleDate(q.lastmod);
  const updatedLine = visibleDate
    ? `                    <p class="wt-muted">Updated ${esc(visibleDate)}</p>\n\n`
    : "";
  const quizHref = buildSeoQuizHref({
    themeSlug: parentTheme?.slug || q.theme,
    themeLabel: parentTheme?.h1 || q.breadcrumbTheme || "",
    entrySlug: q.slug,
    entryLabel: q.h1 || q.question,
    entryType: "question"
  });
  const topCta =
    `                    <p>\n` +
    `                        <a href="${esc(quizHref)}" class="wt-btn wt-btn--primary wt-btn--block">Play the Full Rules Quiz — Free to Try</a>\n` +
    `                    </p>\n`;
  const topTrustLine =
    `                    <p class="wt-sub wt-muted">No signup. Pay once only if you want full access.</p>\n`;
  const bottomCta =
    `                    <p>\n` +
    `                        <a href="${esc(quizHref)}" class="wt-btn wt-btn--primary wt-btn--block">Play the 200-Question Pickleball Rules Quiz</a>\n` +
    `                    </p>`;

  return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>${esc(q.title)}</title>
    <meta name="description"
        content="${esc(q.metaDescription)}">
    <link rel="canonical" href="${url}">${
      q.status === "ready"
        ? '\n    <!-- Review phase: removed automatically when status becomes "live" -->\n    <meta name="robots" content="noindex,follow">'
        : ""
    }

    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="${esc(q.h1)}">
    <meta property="og:description"
        content="${esc(q.ogDescription || q.metaDescription)}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${BASE}/icons/og-image.png">
    <meta name="twitter:card" content="summary_large_image">

    <meta name="theme-color" content="#38bdf8" media="(prefers-color-scheme: light)">
    <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png">
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
    <link rel="stylesheet" href="/style.css">

    <!-- Privacy-friendly analytics -->
    <script data-goatcounter="https://caroles.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>

    <!-- Structured data: FAQPage + Breadcrumb -->
    <script type="application/ld+json">
    ${JSON.stringify(jsonLd, null, 2).split("\n").join("\n    ")}
    </script>
</head>

<body class="wt-page--doc">
    <a href="#main-content" class="wt-skip-link">Skip to main content</a>
    <div class="wt-app">
        <main id="main-content" class="wt-main">
            <div class="wt-container wt-container--doc">
                <div class="wt-card">
                    <nav class="wt-doc-nav">
                        <a href="/" class="wt-btn wt-btn--ghost">Home</a>
                    </nav>

                    <h1 class="wt-h1">${esc(q.h1)}</h1>

                    <p class="wt-press-lead">
                        ${q.content.lead}
                    </p>

${updatedLine}

${topCta}
${topTrustLine}

                    <div class="wt-divider"></div>

${sections}

                    <h2 class="wt-h2">Common questions</h2>
${faqHtml}

                    <h2 class="wt-h2">Test yourself</h2>
                    <p>
                        True or false — these are real questions from the quiz:
                    </p>
                    <p>
                        ${teaser}
                    </p>
                    <p>
                        Sure about all of them? The full quiz has 200 true/false questions on the official
                        2026 rules — kitchen, serving, scoring, line calls and more — each with the exact
                        rule reference in the explanation.
                    </p>

${bottomCta}

${relatedBlock}

                    <div class="wt-divider"></div>

                    <p class="wt-muted">
                        ${esc(q.content.sourceNote)}
                    </p>
                </div>
            </div>
        </main>
    </div>
</body>

</html>
`;
};


const renderThemePage = (t) => {
  const url = `${BASE}/quiz/${t.slug}/`;
  const graph = [];
  if ((t.content.faq || []).length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: t.content.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a }
      }))
    });
  }
  graph.push({
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Pickleball Rules Quiz", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: t.h1, item: url }
    ]
  });
  const jsonLd = { "@context": "https://schema.org", "@graph": graph };

  const sections = (t.content.sections || [])
    .map(
      (s) =>
        `                    <h2 class="wt-h2">${esc(s.h2)}</h2>\n` +
        s.paragraphs.map((p) => `                    <p>\n                        ${p}\n                    </p>`).join("\n")
    )
    .join("\n\n");

  const teaser = (t.content.quizTeaser || []).map((x) => `"${x}"`).join(" ·\n                        ");

  const themeFaqHtml = (t.content.faq || [])
    .map(
      (f) =>
        `                    <h3>${esc(f.q)}</h3>\n` +
        `                    <p>\n                        ${esc(f.a)}\n                    </p>`
    )
    .join("\n");
  const themeFaqBlock = themeFaqHtml
    ? `                    <h2 class="wt-h2">Common questions</h2>\n${themeFaqHtml}\n\n`
    : "";

  // Internal mesh: link to this theme's question pages (the ones that get built).
  const children = (seo.questions || []).filter(
    (q) => q.theme === t.slug && (q.status === "ready" || q.status === "live") && q.content
  );
  const goDeeper = children.length
    ? `                    <h2 class="wt-h2">Go deeper, rule by rule</h2>\n` +
      children
        .map(
          (q) =>
            `                    <p><a href="/rules/${q.slug}/">${esc(q.question)}</a></p>`
        )
        .join("\n") + "\n"
    : "";
  const visibleDate = formatVisibleDate(t.lastmod);
  const updatedLine = visibleDate
    ? `                    <p class="wt-muted">Updated ${esc(visibleDate)}</p>\n\n`
    : "";
  const quizHref = buildSeoQuizHref({
    themeSlug: t.slug,
    themeLabel: t.h1,
    entrySlug: t.slug,
    entryLabel: t.h1,
    entryType: "theme"
  });
  const topCta =
    `                    <p>\n` +
    `                        <a href="${esc(quizHref)}" class="wt-btn wt-btn--primary wt-btn--block">Play the Full Rules Quiz — Free to Try</a>\n` +
    `                    </p>\n`;
  const topTrustLine =
    `                    <p class="wt-sub wt-muted">No signup. Pay once only if you want full access.</p>\n`;
  const bottomCta =
    `                    <p>\n` +
    `                        <a href="${esc(quizHref)}" class="wt-btn wt-btn--primary wt-btn--block">Play the 200-Question Pickleball Rules Quiz</a>\n` +
    `                    </p>`;

  return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>${esc(t.title)}</title>
    <meta name="description"
        content="${esc(t.metaDescription)}">
    <link rel="canonical" href="${url}">${
      t.status === "ready"
        ? '\n    <!-- Review phase: removed automatically when status becomes "live" -->\n    <meta name="robots" content="noindex,follow">'
        : ""
    }

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${esc(t.h1)}">
    <meta property="og:description" content="${esc(t.metaDescription)}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${BASE}/icons/og-image.png">
    <meta name="twitter:card" content="summary_large_image">

    <meta name="theme-color" content="#38bdf8" media="(prefers-color-scheme: light)">
    <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png">
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
    <link rel="stylesheet" href="/style.css">

    <!-- Privacy-friendly analytics -->
    <script data-goatcounter="https://caroles.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>

    <script type="application/ld+json">
    ${JSON.stringify(jsonLd, null, 2).split("\n").join("\n    ")}
    </script>
</head>

<body class="wt-page--doc">
    <a href="#main-content" class="wt-skip-link">Skip to main content</a>
    <div class="wt-app">
        <main id="main-content" class="wt-main">
            <div class="wt-container wt-container--doc">
                <div class="wt-card">
                    <nav class="wt-doc-nav">
                        <a href="/" class="wt-btn wt-btn--ghost">Home</a>
                    </nav>

                    <h1 class="wt-h1">${esc(t.h1)}</h1>

                    <p class="wt-press-lead">
                        ${t.content.lead}
                    </p>

${updatedLine}

${topCta}
${topTrustLine}

                    <div class="wt-divider"></div>

${sections}

                    <h2 class="wt-h2">Sample questions from the quiz</h2>
                    <p>
                        True or false — straight from the deck:
                    </p>
                    <p>
                        ${teaser}
                    </p>

${themeFaqBlock}${goDeeper}
${bottomCta}

                    <div class="wt-divider"></div>

                    <p class="wt-muted">
                        ${esc(t.content.sourceNote)}
                    </p>
                </div>
            </div>
        </main>
    </div>
</body>

</html>
`;
};

// Fail-loud quality gate: count visible words in the rendered page.
const MIN_WORDS = Number(seo?.defaults?.minWordCount || 450);
const visibleWordCount = (html) => {
  let body = html.replace(/[\s\S]*?<body[^>]*>/, "").replace(/<\/body>[\s\S]*/, "");
  body = body.replace(/<script[\s\S]*?<\/script>/g, " ");
  body = body.replace(/<!--[\s\S]*?-->/g, " ");
  const text = body.replace(/<[^>]+>/g, " ");
  return (text.match(/\b\w+\b/g) || []).length;
};

// Fail-loud: duplicate slugs would silently overwrite each other's page.
const slugCounts = {};
for (const q of seo.questions || []) slugCounts["rules/" + q.slug] = (slugCounts["rules/" + q.slug] || 0) + 1;
for (const t of seo.themes || []) slugCounts["quiz/" + t.slug] = (slugCounts["quiz/" + t.slug] || 0) + 1;
const dupSlugs = Object.keys(slugCounts).filter((s) => slugCounts[s] > 1);
if (dupSlugs.length) {
  console.error(`FAILED — duplicate slugs in seo-pages.json: ${dupSlugs.join(", ")}`);
  process.exit(1);
}

const preflightErrors = [];
for (const q of seo.questions || []) {
  if (q.status !== "ready" && q.status !== "live") continue;
  if (!(q.content && q.h1 && q.title)) continue;

  preflightErrors.push(
    ...validateTeasers(`rules/${q.slug}`, q.cardIds, q.content?.quizTeaser)
  );

  const parentTheme = (seo.themes || []).find((t) => t.slug === q.theme) || null;
  if (!parentTheme) {
    preflightErrors.push(`rules/${q.slug} — missing theme "${q.theme}" in seo-pages.json`);
    continue;
  }
  if (q.status === "live" && parentTheme.status !== "live") {
    preflightErrors.push(
      `rules/${q.slug} is live but parent theme quiz/${q.theme} is ${parentTheme.status}`
    );
  }
}

for (const t of seo.themes || []) {
  if (t.status !== "ready" && t.status !== "live") continue;
  if (!(t.content && t.h1 && t.title)) continue;

  preflightErrors.push(
    ...validateTeasers(`quiz/${t.slug}`, t.cardIds, t.content?.quizTeaser)
  );
}

if (preflightErrors.length) {
  console.error("FAILED — seo-pages.json/content.json consistency errors:");
  for (const err of preflightErrors) console.error(`  - ${err}`);
  process.exit(1);
}

let built = 0;
const skipped = [];
const failures = [];

for (const q of seo.questions || []) {
  const ok = (q.status === "ready" || q.status === "live") && q.content && q.h1 && q.title;
  if (!ok) {
    skipped.push(`${q.slug} (status: ${q.status}${q.content ? "" : ", no content"})`);
    continue;
  }
  const html = renderPage(q);
  const words = visibleWordCount(html);
  if (words < MIN_WORDS) {
    failures.push(`rules/${q.slug}/ — ${words} words (minimum: ${MIN_WORDS})`);
    continue;
  }
  const dir = path.join(ROOT, "rules", q.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
  built++;
  console.log(`built: rules/${q.slug}/index.html (${words} words)`);
}

for (const t of seo.themes || []) {
  const ok = (t.status === "ready" || t.status === "live") && t.content && t.h1 && t.title;
  if (!ok) {
    skipped.push(`quiz/${t.slug} (status: ${t.status}${t.content ? "" : ", no content"})`);
    continue;
  }
  const html = renderThemePage(t);
  const words = visibleWordCount(html);
  if (words < MIN_WORDS) {
    failures.push(`quiz/${t.slug}/ — ${words} words (minimum: ${MIN_WORDS})`);
    continue;
  }
  const dir = path.join(ROOT, "quiz", t.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
  built++;
  console.log(`built: quiz/${t.slug}/index.html (${words} words)`);
}

if (failures.length) {
  console.error(`\nFAILED — pages below the ${MIN_WORDS}-word minimum were NOT built:`);
  for (const f of failures) console.error(`  - ${f}`);
  console.error("Add content or move the page back to draft.");
  process.exitCode = 1;
}

console.log(`\n${built} page(s) built.`);
if (skipped.length) console.log(`skipped (draft or missing content):\n  - ${skipped.join("\n  - ")}`);
