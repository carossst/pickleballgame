# Leaderboard Worker

Sous-dossier guide pour monter le backend du leaderboard avec:

- Cloudflare Worker
- Cloudflare D1
- 0 couplage direct avec l'app statique tant que tu n'es pas prete

Ce dossier ne deploie rien tout seul. Il te donne:

- la structure
- le schema SQL
- un stub Worker
- les commandes a lancer

## Architecture retenue

- `POST /player`
  - cree ou met a jour le pseudo et l'opt-in
- `DELETE /player`
  - retire le joueur du classement public et supprime ses scores publics
- `POST /score`
  - recoit une `RUN`
  - devra recalculer le `scoreFP` cote serveur
  - met a jour les best `weekly` et `all-time`
- `GET /leaderboard?window=weekly|all`
  - renvoie le top public
- `POST /redeem-code`
  - verifie un code admin/guest cote serveur (voir "Codes admin et invite" plus bas)
  - ne connait pas encore les vrais codes clients (Stripe) — c'est trace a part

Stockage:

- `players`
- `score_submissions`
- `leaderboard_best`
- `code_redemptions`

## Pourquoi a part

L'app actuelle reste statique.

Le backend leaderboard vit a part pour:

- ne pas casser le flow actuel
- avancer progressivement
- pouvoir deployer le Worker quand tu veux

## Etape 1 - Creer le Worker

Depuis le repo:

```bash
cd leaderboard-worker
npm create cloudflare@latest .
```

Choisis:

- Worker simple en JavaScript
- pas besoin de framework

Si le dossier n'est pas vide, cree plutot un projet Cloudflare ailleurs, puis copie dedans:

- `wrangler.jsonc.example`
- `schema.sql`
- `src/index.js`

## Etape 2 - Installer Wrangler si besoin

Si `npx wrangler` ne marche pas:

```bash
npm install
```

ou dans un projet Worker genere par Cloudflare:

```bash
npm install
```

## Etape 3 - Creer la base D1

```bash
npx wrangler d1 create prq-leaderboard
```

Cloudflare te donnera:

- `database_name`
- `database_id`
- le bloc `d1_databases` a coller dans `wrangler.jsonc`

## Etape 4 - Configurer `wrangler.jsonc`

Pars de `wrangler.jsonc.example` et remplace:

- `YOUR_DATABASE_ID`
- `YOUR_WORKER_NAME`

Le binding retenu est:

- `DB`

Donc dans le Worker, la base sera:

- `env.DB`

## Etape 5 - Appliquer le schema

En local:

```bash
npx wrangler d1 execute prq-leaderboard --local --file=./schema.sql
```

En remote:

```bash
npx wrangler d1 execute prq-leaderboard --remote --file=./schema.sql
```

## Etape 6 - Lancer en local

```bash
npx wrangler dev
```

Tu auras ensuite une URL locale pour tester:

- `GET /leaderboard?window=weekly`
- `GET /leaderboard?window=all`

## Etape 7 - Deployer

```bash
npx wrangler deploy
```

Puis note l'URL finale du Worker, par exemple:

- `https://prq-leaderboard.<subdomain>.workers.dev`

## Codes admin et invite

`POST /redeem-code` verifie deux codes speciaux cote serveur, en plus du
flow client existant (regex locale, pas encore corrige — c'est le vrai
bug de paywall, suivi a part). Ces deux codes ne sont jamais envoyes au
client: ils vivent uniquement comme secrets Cloudflare.

- `ADMIN_CODE`
  - marche sur autant d'appareils que tu veux, sans limite d'usage
  - a usage interne (tes propres tests)
- `GUEST_CODE`
  - limite a 10 redemptions au total (compteur cote serveur, table
    `code_redemptions`)
  - au-dela de 10, le Worker repond `403 GUEST_CODE_EXHAUSTED`
  - pour "changer" le code, il suffit de mettre a jour le secret: une
    nouvelle valeur repart automatiquement a 0 usage, puisque le compteur
    est indexe sur la valeur du code, pas sur un nom fixe

Pour les definir (ou les changer):

```bash
npx wrangler secret put ADMIN_CODE
npx wrangler secret put GUEST_CODE
```

Chaque commande demande la valeur en interactif et ne l'affiche jamais
dans les logs. Choisis des chaines longues et peu devinables (ce ne sont
pas des identifiants publics comme `PRQ-0000-0000`, donc pas besoin de
suivre ce format).

Cote frontend, le champ "code d'activation" du jeu (`storage.js:
tryRedeemPremiumCodeRemote`) essaie d'abord ce endpoint; si le Worker ne
reconnait pas le code (ou est injoignable), il retombe sur l'ancienne
verification locale par format — donc les vrais codes clients (format
`PRQ-XXXX-XXXX`) continuent de marcher pendant qu'on met en place la
verification Stripe reelle.

## Etat actuel du repo principal

Le frontend principal sait deja:

- lire `GET /leaderboard`
- enregistrer le pseudo via `POST /player`
- quitter le classement via `DELETE /player`
- preparer un payload complet pour `POST /score`

Mais par securite:

- `config.leaderboard.submitScores = false`

Donc:

- lecture live: oui
- creation/mise a jour pseudo: oui
- soumission des scores: backend pret, frontend encore desactive volontairement

Le Worker recalcule maintenant le score serveur pour `POST /score`.
Active `submitScores` seulement quand:

- le Worker est deploye
- `apiBaseUrl` est renseigne
- tu as verifie les soumissions/rejets/rangs sur un environnement de test

## Regle du leaderboard hebdo

Le leaderboard `weekly` utilise maintenant une vraie semaine ISO:

- debut: lundi `00:00 UTC`
- fin: juste avant le lundi suivant `00:00 UTC`

Donc tu peux l'expliquer simplement aux users comme:

- `This week`
- `Resets every Monday`

Le frontend envoie un champ dedie pour le contenu:

- `config.leaderboard.contentVersion`

Garde-le separe de la version UI si possible.

## Ce qu'il restera a faire ensuite

### 1. Brancher l'app statique

Dans l'app frontend, il faudra ajouter:

- l'URL du Worker dans `config.js`
- les appels `fetch()` depuis le module leaderboard

### 2. Activer prudemment les soumissions

Le vrai point important etait de recalculer le `scoreFP` cote serveur.
C'est maintenant fait dans le Worker:

- `run_mode === "RUN"` requis
- `content_version` doit matcher le bundle de reference
- format de `answers` valide strictement
- `scoreFP` recalcule a partir du mapping `id -> correctAnswer`
- soumissions invalides rejetees avec `409/422`

Ce qu'il reste a faire avant go-live:

- renseigner `config.leaderboard.apiBaseUrl`
- passer `config.leaderboard.submitScores` a `true`
- verifier les toasts de rang et de rejet en situation reelle

## Design minimal des payloads

### `POST /player`

```json
{
  "device_uuid": "uuid-local",
  "nickname": "CaroSmash",
  "opt_in": true
}
```

### `POST /score`

```json
{
  "device_uuid": "uuid-local",
  "run_id": "uuid-run",
  "run_number": 7,
  "content_version": "2026-05-23",
  "run_mode": "RUN",
  "duration_ms": 84231,
  "answers": [
    { "id": 22, "answer": true, "ms": 2100 },
    { "id": 29, "answer": false, "ms": 1800 }
  ]
}
```

### `GET /leaderboard?window=weekly`

Reponse attendue:

```json
{
  "ok": true,
  "window": "weekly",
  "week_key": "2026-W21",
  "top": [
    { "rank": 1, "nickname": "KitchenBoss", "score_fp": 18 },
    { "rank": 2, "nickname": "CaroSmash", "score_fp": 17 }
  ]
}
```

### `POST /redeem-code`

```json
{
  "device_uuid": "uuid-local",
  "code": "le-code-tape-par-l-utilisateur"
}
```

Reponses possibles:

```json
{ "ok": true, "tier": "admin" }
```

```json
{ "ok": true, "tier": "guest", "uses_remaining": 6 }
```

```json
{ "ok": false, "reason": "GUEST_CODE_EXHAUSTED" }
```

```json
{ "ok": false, "reason": "NOT_FOUND" }
```

`NOT_FOUND` (le code ne correspond ni a `ADMIN_CODE` ni a `GUEST_CODE`)
est le signal que le frontend utilise pour retomber sur l'ancienne
verification locale par format — donc pas une erreur en soi.

## Decision importante deja retenue

Le leaderboard public v1 utilise uniquement:

- le `scoreFP` d'une `RUN`

Donc:

- `RUN`: oui
- Daily: oui si c'est une vraie `RUN`
- Practice: non
- Rapid Fire: non

## Weekly

Le plus simple en v1:

- stocker un `week_key`
- filtrer `weekly` avec `WHERE week_key = ?`

Pas besoin d'un reset destructif pour commencer.

## Sources Cloudflare

- Workers Wrangler:
  - https://developers.cloudflare.com/workers/wrangler/
- Configuration Wrangler:
  - https://developers.cloudflare.com/workers/wrangler/configuration/
- D1 get started:
  - https://developers.cloudflare.com/d1/get-started/
- D1 Worker binding API:
  - https://developers.cloudflare.com/d1/worker-api/d1-database/
- Cron Triggers:
  - https://developers.cloudflare.com/workers/configuration/cron-triggers/
