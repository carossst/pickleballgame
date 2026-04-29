# Pickleball Rules Quiz

`Pickleball Rules Quiz` is a fast true-or-false pickleball rules game with 200 questions about serving, faults, scoring, line calls, and rule changes.

Built with plain HTML, CSS, and JavaScript, this mobile-first pickleball rules quiz works without a build step, stores progress locally, supports offline play after first load, and includes full access unlocks, `Mistakes Mode`, and `Rapid Fire Mode`.

## Product Summary

- A growing pickleball rules question set from [content.json](./content.json)
- Main game with `3` mistakes allowed
- `2` free games, then full access upsell
- `Mistakes Mode` to replay active mistakes
- `Rapid Fire Mode` for seen-question speed play
- Local-first progress and device unlock code activation
- Installable PWA with service worker caching

## Main Files

- [index.html](./index.html): main app shell
- [config.js](./config.js): single source of truth for product config, wording, routing, limits, and identity
- [content.json](./content.json): question bank
- [ui.js](./ui.js): rendering, screen routing, CTA logic, modals
- [game.js](./game.js): game mechanics
- [storage.js](./storage.js): local storage, counters, progression, analytics payload
- [main.js](./main.js): bootstrap, content loading, service worker registration
- [style.css](./style.css): full UI styling
- [sw.js](./sw.js): service worker
- [manifest.json](./manifest.json): PWA manifest
- [success.html](./success.html): post-checkout success / unlock page

## Start Locally

This project is static. No bundler or dependency install is required.

Serve the folder with any local HTTP server, for example:

```bash
cd .
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

Avoid opening `index.html` directly with `file://` if you want fetch, service worker, and PWA behavior to work normally.

## Content Editing

Questions live in [content.json](./content.json).

Each item uses this shape:

```json
{
  "id": 1,
  "question": "Question text",
  "correctAnswer": true,
  "explanationShort": "Short explanation in 3 lines max.",
  "tags": ["Category", "Easy"]
}
```

Guidelines:

- keep statements clear and answerable as true/false
- avoid time-sensitive or shop-specific facts unless clearly framed
- keep `explanationShort` short, direct, and readable on mobile
- keep tags consistent with existing categories

## Product Configuration

Most product behavior lives in [config.js](./config.js):

- app identity and URLs
- limits and monetization
- wording and UI copy
- verdict thresholds
- mode routing and CTA promotion
- paywall messaging
- PWA versioning

Important values:

- `WT_CONFIG.version`: cache/version identifier used by the service worker
- `WT_CONFIG.storageSchemaVersion`: local storage schema version
- `WT_CONFIG.limits.freeRuns`: number of free main games
- `WT_CONFIG.game.poolSize`: total question pool size

## Level System

The app includes a persistent 4-level progression system defined in [config.js](./config.js) and stored locally by [storage.js](./storage.js).

- level 1: full first pass complete
- level 2: all active mistakes cleared
- level 3: level 2 plus a Rapid Fire pool of at least `16` and a Rapid Fire run of at least `70%`
- level 4: level 3 plus a Rapid Fire pool of at least `50` and a Rapid Fire run of at least `85%`

Levels never go down once unlocked.

For UI testing only, Pickleball also supports a preview query param:

- `?levelPreview=none`
- `?levelPreview=level1`
- `?levelPreview=level2`
- `?levelPreview=level3`
- `?levelPreview=level4`
- `?levelPreview=unlock1`
- `?levelPreview=unlock2`
- `?levelPreview=unlock3`
- `?levelPreview=unlock4`

Preview is visual only. It does not write fake progression into storage.

## End Screen Notes

- The main game end screen stays intentionally compact: score, verdict, progress lens, CTA, and recap when useful
- secondary end-screen signals are intentionally limited to learning/business context such as tag insight, full access best-score context, and free games left
- `best streak` is treated as an in-game momentum signal, not a core end-screen signal
- record celebration stays attached to the main score block instead of repeating again in secondary end copy

## PWA Notes

- the app registers a service worker from [main.js](./main.js)
- static assets are versioned through `WT_CONFIG.version`
- if you want users to receive fresh cached assets, bump `WT_CONFIG.version`
- offline support is strongest for the main app shell after first load

## Payment Notes

- the early-price timer is a local UX timer tied to the first paywall view on that device
- it is not a server-verified countdown and it resets if local storage is cleared
- the Stripe Payment Links must be configured manually to redirect to your hosted `success.html`
- `successRedirectUrl` in [config.js](./config.js) is documentation/config context only; the live redirect is controlled in Stripe
- with the current static stack, `success.html` is not a payment-verification layer
- a real payment lock would require a server-verified Stripe return or a signed unlock mechanism that cannot be generated locally

## Storage And Analytics

All user progress is stored locally in the browser by [storage.js](./storage.js).

This includes:

- seen questions
- active mistakes
- game counters
- full access state and stored device unlock code
- local analytics counters
- anonymous stats payload generation

There is no required account system in the core game flow.

## Notes

- this repo has no build step
- this repo currently has no automated test suite
- syntax checks can be done with commands like:

```bash
node --check config.js
node --check ui.js
node --check storage.js
```

## UI Conventions

- `wt-btn--ghost` is reserved for secondary, non-destructive actions such as `Later` or `Not now`
- destructive or high-stakes exits should stay on `wt-btn--secondary` or stronger variants
