# Implementation Memory

This file keeps the long-lived implementation memory for the project.

Use it for:
- architecture notes that are easy to forget
- runtime conventions
- state semantics
- deployment and cache rules
- SEO publishing mechanics
- cross-file contracts

Do not use it for:
- product backlog tracking
- locked UX/copy decisions already covered by `REGRESSION_GUARDRAILS.md`
- full audits
- day-by-day work logs

## Document Map

- `README.md`
  - project overview
  - main product decisions
  - local setup
  - file map
- `REGRESSION_GUARDRAILS.md`
  - locked UX/copy behavior that should not be silently reintroduced
- `SEO-PLAYBOOK.md`
  - SEO strategy
  - publication workflow
  - content/page generation rules
- `IMPLEMENTATION_MEMORY.md`
  - technical memory and non-obvious implementation contracts
- `coding/CHANTIER_A_FAIRE.md`
  - current priorities and recommended order of work

## Project Shape

- Frontend is plain HTML/CSS/JS with no build step.
- Main entrypoints:
  - `index.html`
  - `fr.html`
- App runtime is split across many browser scripts loaded in HTML order.
- The codebase still relies on global `WT_*` objects and manual script ordering.
- `ui.js` remains the main orchestration layer and is intentionally not fully refactored yet.

## Core Runtime Modules

- `config.js`
  - single runtime source of truth for product behavior
  - service worker versioning
  - locale/app URLs
  - paywall and leaderboard runtime config
- `content.json`
  - bilingual question bank
  - source of truth for quiz cards
- `storage.js`
  - local persistence
  - progression
  - free/premium gates
  - analytics payload helpers
- `game.js`
  - pure game logic
  - should stay as DOM-independent as possible
- `ui.js`
  - central action dispatch
  - modals
  - rendering and screen routing

## State And Semantics

### Premium

- Premium activation is still a sensitive area.
- Do not assume the current client-side success flow is a final secure implementation.
- Any real premium hardening must preserve:
  - unlock persistence
  - offline usability after unlock
  - compatibility with the paywall flow

### Waitlist

- Waitlist state lives in `storage.js`.
- Canonical statuses are:
  - `not_seen`
  - `seen`
  - `opted_in`
- Legacy compatibility:
  - old `joined` values must still be accepted when read
  - they are normalized to `opted_in`
- Meaning of `opted_in`:
  - the user entered the waitlist flow
  - not a cryptographically verified email delivery event
- There are now two waitlist display channels:
  - `shouldShowWaitlistNow()`
    - post-completion / landing logic
    - includes discovery threshold gating
  - `shouldShowWaitlistOnPaywall()`
    - paywall-only logic
    - intentionally does not require the seen-card threshold

### Free / Paid Economy

- `RUN` is the hero mode.
- Free users get a fixed number of lifetime free runs on-device.
- Rapid Fire uses tickets for both free and premium users.
- Share bonus, Daily rewards, and paywall messaging all depend on storage state.
- Changes to this area usually affect:
  - `config.js`
  - `storage.js`
  - one or more `ui-screen-*.js` files
  - wording banks

## Service Worker And Cache Discipline

- `WT_CONFIG.version` is part of the cache invalidation contract.
- Bump it whenever a deploy changes app shell assets that the service worker treats as critical.
- Typical examples:
  - `config.js`
  - `storage.js`
  - `ui.js`
  - `ui-screen-*.js`
  - `wording-*.js`
- Do not bump it casually for unrelated docs-only changes.

## Storage Discipline

- `storage.js` is the preferred owner for app persistence semantics.
- Avoid scattering new business-critical storage writes across random modules unless there is a strong reason.
- If a new storage status or migration is introduced:
  1. document it here
  2. keep backwards compatibility if users may already have older local data
  3. add targeted tests

## SEO Companion Layer

- English SEO lives on `pickleballrulesquiz.com`.
- French SEO lives on the separate French site, not on the `.com`.
- Static SEO pages are generated only from:
  - `seo-pages.json`
  - `scripts/generate-seo-pages.mjs`
  - `scripts/generate-sitemap.mjs`
- Never hand-create or hand-edit generated pages in:
  - `rules/`
  - `quiz/`

### SEO Status Model

- `draft`
  - incomplete or intentionally not publishable
- `ready`
  - generated and deployable
  - still `noindex,follow`
  - excluded from sitemap
- `live`
  - reviewed and approved
  - indexable
  - included in sitemap

### SEO Guardrails Already Enforced In Tooling

- minimum visible word count gate
- breadcrumb logic that avoids dead structured-data URLs
- teaser validation against exact EN card text in `content.json`
- fail-loud prevention of `live` question pages under a non-`live` parent theme

### SEO Conversion Bridge

- SEO pages are a companion layer, not the app itself.
- They should hand off into the quiz without pretending the quiz is theme-filtered unless that is truly implemented.
- Current bridge behavior:
  - SEO CTAs point to `/` with query parameters that preserve topic/entry context
  - landing detects SEO arrivals and shows a small continuity block
- If this behavior changes, keep the message honest:
  - do not imply a theme-specific quiz start unless the runtime really does that

## Leaderboard Contract

- Frontend and Worker must stay aligned on content version and answer key.
- If quiz answers change in `content.json`:
  1. regenerate the leaderboard key
  2. rerun tests
  3. keep frontend and Worker versions aligned
- Do not treat the leaderboard Worker README as self-healing documentation.
  It can drift and must be updated deliberately.

## Test Expectations

- `npm test` is the baseline regression check.
- Passing global tests is not enough for new storage semantics.
- Add targeted tests when changing:
  - storage migrations
  - waitlist state rules
  - paywall gating
  - leaderboard content/version contracts
  - wording contract behavior

## Practical Commands

```bash
npm test
npm run generate:seo-pages
npm run generate:sitemap
npm run publish:seo
npm run generate:leaderboard-key
```

## Update Rules

Update this file when one of these changes:
- a new state or migration is introduced
- a runtime contract spans multiple files
- a deploy/cache rule changes
- a generated-content workflow changes
- a temporary implementation becomes a deliberate permanent rule

Do not update it for:
- small copy changes
- routine content additions
- ephemeral debugging notes
