# Regression Guardrails

This file is the source of truth for UX/copy decisions that were already made in conversation and should not be silently reintroduced later.

Update it whenever a product or wording decision is locked.

Do not create a second "recent audit" document for the same purpose. Keep this file as the single anti-regression reference.

## Landing

- Do not render the old phase summary card on landing.
- Do not reintroduce:
  - `Phase 1/3`
  - `You've already seen...`
  - `You still have ... left in this first pass.`
- After the first completed run, landing should stay simple:
  - hero / primary action
  - current level
  - Daily Challenge
  - leaderboard section below
- Do not show `BEST SCORE / MEILLEUR SCORE` as a separate landing card.
- Daily owns the central “what to do now” slot on landing.
- Leaderboard stays in its own lower section, not mixed into the same dashboard card cluster.
- In landing markup, leaderboard should render outside the dashboard grid/wrapper.
- Do not show the `LIVE` badge on the landing leaderboard card.
- Do not show the `VOTRE PROGRESSION / YOUR PROGRESS` intro block above the cards.
- Do not keep dead wording keys for:
  - `LIVE`
  - `VOTRE PROGRESSION / YOUR PROGRESS`

## Daily

- Landing Daily card label only:
  - EN: `DAILY CHALLENGE`
  - FR: `DÉFI DU JOUR`
- Keep one idea per line.
- Do not show `Next challenge at ...` until the Daily is actually completed.
- When incomplete, show:
  - target
  - one short payoff line
- When completed, show:
  - completion verdict
  - next challenge time
- Do not reintroduce:
  - `Rapid Fire costs 1 ticket.`
  - long combined sentences on one line

## Levels

- Levels modal must show only the level path/list.
- Do not reintroduce the old top section:
  - `Current level`
  - `What it means`
  - `Next level`
  - `How to unlock`
- Current level should stay visually distinct in the list.
- French level 1 label:
  - `PREMIERS REPÈRES`

## Leaderboard

- Landing leaderboard card:
  - no `LIVE`
  - no “your time”
  - keep the reset line compact
- Leaderboard modal:
  - top list first
  - if local player is outside top 10 and rank is known:
    - show `...`
    - then the local row
- Keep `Edit my nickname / Modifier mon pseudo` visible from the ranking tab.
- Do not use:
  - `public nickname`
  - `pseudo public`
- Use:
  - `nickname`
  - `pseudo`

## END Screen

- Keep END compact.
- Do not reintroduce:
  - `You got X out of Y right`
  - `Bonnes réponses : X/Y`
  - `You reached {level}`
  - `Vous avez atteint {niveau}`
  - `Current score tier`
  - `Palier actuel`
  - `Today's challenge was ...`
  - `Le défi du jour demandait ...`
  - `Set your first best score next run`
- Daily on END should communicate verdict first:
  - cleared / missed

## French Tone

- FR should lean learning-first, not challenge-first.
- Keep:
  - `Mieux connaître les règles, c’est mieux jouer.`
  - `Parties courtes · Sans inscription · Progression garantie`
- Avoid reintroducing:
  - `Vous croyez connaître le pickleball ? Prouvez-le.`
  - `Défier quelqu'un`
- Share FR should stay discovery/share oriented.
- Keep FR share wording in that spirit:
  - `Partager le jeu`
  - `Copier le message`
  - `Aperçu du message`
  - `Je viens de découvrir Quiz Pickleball.`

## English Tone

- EN can stay challenge-first.
- Keep:
  - `Think You Know Pickleball? Prove It.`
- Remove temporary/testing copy like:
  - `MAINTENANCE IN PROGRESS PLEASE COME BACK LATER`
- Keep EN tighter when possible:
  - prefer `games` over `RUNs` in marketing/paywall copy
  - avoid filler like `real pace`

## Paywall

- Keep copy tight.
- Do not reintroduce inflated/product-speak lines such as:
  - `keep today's challenge alive over time`
  - `gardez le défi du jour vivant dans le temps`
  - `real pace`
  - `vrai rythme`
- Keep strong selling points explicit:
  - 200 questions
  - unlimited RUNs
  - record your score
  - see the best scores on the leaderboard
  - Mistakes Mode

## FR Testimonials

- Use:
  - `Christine, joueuse en club`
  - `Jean, retraité`
- Section title:
  - `Leurs retours après quelques parties`

## i18n Toggle

- Entry-page locale switch must navigate explicitly between:
  - `./index.html`
  - `./fr.html`
- Keep JS-managed click handling with:
  - persisted locale choice
  - `window.location.assign(...)`
- Keep entry-path detection compatible with local subfolders:
  - `/`
  - any path ending in `/`
  - any path ending in `/index.html`
  - any path ending in `/fr.html`
- Do not let the toggle mutation observer rerender in response to its own DOM mutations.

## French Audio

- If the browser does not expose a usable French speech voice, do not show FR question-audio controls.
- EN can keep showing audio controls with generic speech support.

## French Wording Hygiene

- In FR product copy, prefer:
  - `partie / parties`
  - `jeton(s) Mode Rapide`
  - `classement général`
  - `e-mail`
  - `statistiques`
  - `problème`
  - `application`
- Avoid reintroducing:
  - `RUN / RUNs`
  - `ticket(s) Mode Rapide`
  - `all-time`
  - `email`
  - `stats`
  - `bug`
  - `app`
  - `synchro distante`
  - `pool de questions`

## Service Worker

- After copy/UI changes that seem “ignored” on device/PWA, bump:
  - `WT_CONFIG.version`
- If UI does not match code, suspect stale SW cache before assuming the patch failed.
