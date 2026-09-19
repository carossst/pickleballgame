#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SOURCES = [
  "config.js",
  "wording-en.js",
  "wording-fr.js",
  "wording-bootstrap.js",
  "i18n.js",
  "wording.js",
  "icons.js",
  "logic/rapidfire-logic.js",
  "logic/leaderboard-logic.js",
  "storage.js",
  "game.js",
  "ui-screen-paywall.js",
  "ui-screen-end.js",
  "ui-screen-landing.js",
  "ui-share.js",
  "ui-install.js",
  "ui-support.js",
  "ui-stats-sharing.js",
  "ui-checkout.js",
  "ui-growth.js",
  "ui-leaderboard.js",
  "ui.js",
  "pwa.js",
  "email.js",
  "footer.js",
  "i18n-toggle.js",
  "content-adapter.js",
  "main.js"
];

const parts = SOURCES.map((rel) => {
  const body = fs.readFileSync(path.join(ROOT, rel), "utf8").trim();
  return `/* ===== ${rel} ===== */\n${body}\n`;
});

const out =
  "/* GENERATED FILE — do not hand-edit.\n" +
  "   Source order is defined in scripts/generate-app-bundle.mjs. */\n\n" +
  parts.join("\n");

fs.writeFileSync(path.join(ROOT, "app.bundle.js"), out, "utf8");
console.log(`app.bundle.js written from ${SOURCES.length} source files.`);
