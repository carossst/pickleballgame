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
const BASE = String(seo?.defaults?.baseUrl || "https://pickleballrulesquiz.com").replace(/\/+$/, "");

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Lead/paragraphs may contain intentional inline markup (<strong>, <em>).
// Escape everything else is not practical here, so content is trusted —
// it comes from seo-pages.json which we author ourselves.
const renderPage = (q) => {
  const url = `${BASE}/rules/${q.slug}/`;
  const faqEntities = (q.content.faq || []).map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a }
  }));
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "FAQPage", mainEntity: faqEntities },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Pickleball Rules Quiz", item: `${BASE}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: q.breadcrumbTheme,
            item: `${BASE}/quiz/${q.theme}/`
          },
          { "@type": "ListItem", position: 3, name: q.question, item: url }
        ]
      }
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

  return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>${esc(q.title)}</title>
    <meta name="description"
        content="${esc(q.metaDescription)}">
    <link rel="canonical" href="${url}">

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

                    <div class="wt-divider"></div>

${sections}

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

                    <p>
                        <a href="/" class="wt-btn wt-btn--primary wt-btn--block">Play the Pickleball Rules Quiz</a>
                    </p>

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

let built = 0;
const skipped = [];

for (const q of seo.questions || []) {
  const ok = (q.status === "ready" || q.status === "live") && q.content && q.h1 && q.title;
  if (!ok) {
    skipped.push(`${q.slug} (status: ${q.status}${q.content ? "" : ", no content"})`);
    continue;
  }
  const dir = path.join(ROOT, "rules", q.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), renderPage(q), "utf8");
  built++;
  console.log(`built: rules/${q.slug}/index.html`);
}

console.log(`\n${built} page(s) built.`);
if (skipped.length) console.log(`skipped (draft or missing content):\n  - ${skipped.join("\n  - ")}`);
