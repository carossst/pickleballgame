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
- [wording.js](./wording.js): shared wording hydrator for `data-wt-wording`, `data-wt-aria-label`, and static brand text
- [content.json](./content.json): question bank
- [ui.js](./ui.js): rendering, screen routing, CTA logic, modals
- [game.js](./game.js): game mechanics
- [storage.js](./storage.js): local storage, counters, progression, analytics payload
- [main.js](./main.js): bootstrap, content loading, service worker registration
- [style.css](./style.css): CSS entrypoint that imports the modular UI styles from [`styles/`](./styles)
- [sw.js](./sw.js): service worker
- [manifest.json](./manifest.json): PWA manifest
- [success.html](./success.html): post-checkout success / unlock page

## CSS Guardrails

These rules are now part of the working contract for Pickleball.

1. Do not introduce ad-hoc margin utilities in generated HTML.
   Use structure classes, stack variants, or component spacing instead.

2. New visual need: prefer a component or a variant first.
   Do not patch a one-off local style if the pattern already exists elsewhere.

3. Do not solve repeated UI adjustments with isolated tweaks.
   If the same pattern appears twice, consolidate it before adding more CSS.

4. Treat the paywall as a composition of shared components.
   It must not grow a separate page-specific micro-framework.

5. Prefer readable solid copy over translucent copy.
   Alpha is for decor first, not for primary or secondary reading text.

6. Avoid persistent decorative motion.
   Keep animation for feedback and state change, not for permanent attention-seeking.

7. Keep DOM wording hydration in one shared place.
   Static pages, the footer, and shell-level labels must use `wording.js` instead of inline page-specific hydrators.

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

## Pickleball-Only Rollout Notes

These UI/copy changes are live on Pickleball and should be treated as the reference set before aligning Coffee and Word Traps.

- Levels modal:
  - `Current` and `Next` can use aspirational `sheetBody` copy
  - `Path` stays factual and uses the existing `unlock` conditions
  - current Pickleball copy:
    - `COURT-READY`: `You’ve got the rules in your hands. Now make them stick.`
    - `CLUB-LEVEL`: `Clean up your mistakes and make your rule knowledge reliable.`

- Landing dashboard:
  - the KPI now shows a label above the percentage:
    - `Coverage` before the first full pass is complete
    - `Mastery` after the full set has been seen
  - the landing stats card has more left padding so the content does not crowd the accent border

- End screens:
  - stats, verdict, and note lines are aligned to the same type size on Pickleball END screens
  - `Challenge a friend` is available on all END modes, not only standard runs
  - footer branding is intentionally hidden in `PLAYING`, but more visible in END / non-playing states

- Paywall:
  - the last-free headline is visually reinforced without changing the rest of the paywall tone
  - paywall hero spacing is handled at the component level; the branding row must keep visible space above the headline
  - if the urgency/countdown row is shown, the following price block needs explicit breathing room

- Start / explanation modals:
  - the first line of the first-run framing modal is emphasized via existing typography utilities
  - no page-specific inline styling should be added for this

- Feedback / flow spacing:
  - feedback cards need real space before the `Next` / continue action row
  - this should be handled with block-to-block spacing rules, not per-screen patches

- Question sizing:
  - Pickleball statements and prompts were reduced slightly to preserve rhythm and keep answer choices higher on screen
  - keep the statement dominant, but avoid letting it push core interactions too far down on mobile
