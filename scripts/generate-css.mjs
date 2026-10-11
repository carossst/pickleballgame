#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SOURCES = [
  "styles/tokens.css",
  "styles/base.css",
  "styles/components.css",
  "styles/i18n-toggle.css",
  "styles/screens.css"
];

const parts = SOURCES.map((rel) => {
  const body = fs.readFileSync(path.join(ROOT, rel), "utf8").trim();
  return `/* ===== ${rel} ===== */\n${body}\n`;
});

const out =
  "/* GENERATED FILE — do not hand-edit.\n" +
  "   Sources remain modular under /styles and are concatenated by scripts/generate-css.mjs.\n" +
  "   This avoids CSS @import waterfalls in production. */\n\n" +
  parts.join("\n");

fs.writeFileSync(path.join(ROOT, "style.css"), out, "utf8");
console.log(`style.css written from ${SOURCES.length} source files.`);
