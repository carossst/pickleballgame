# Reste à faire (pour un modèle léger)

Contexte : le site (`pickleballrulesquiz.com`) a environ 100 visites par mois et aucune vente. Le diagnostic est : trop peu de trafic, parties jamais terminées, écrans trop chargés. Les gros changements de parcours sont faits et fusionnés (PR 7, 8, 9). Cette liste contient ce qui reste. Chaque tâche est autonome et petite. Une tâche = une branche = une PR en brouillon, fusionnée quand la CI est verte.

## Règles du dépôt à respecter

- Pas de build : HTML/CSS/JS pur. Mais `app.bundle.js` et `style.css` sont **générés** : ne jamais les éditer à la main.
  - après un changement de JS : `npm run generate:bundle`
  - après un changement dans `styles/*.css` : `npm run generate:css`
  - après un changement de `seo-pages.json` : `npm run publish:seo`
- Si un fichier de l'app change, passer `version` dans `config.js` (ligne ~54) au numéro suivant (actuellement `4.3.27`), sinon le cache du service worker garde l'ancienne version.
- Vérifications avant de pousser : `npm test`, `npm run format:check` (Prettier ne couvre que `tests/`, `logic/` et quelques fichiers de config), puis les tests Playwright.
- Playwright : le navigateur est dans `/opt/pw-browsers/chromium`. Créer un fichier de config temporaire qui reprend `playwright.config.cjs` avec `use.launchOptions.executablePath = "/opt/pw-browsers/chromium"`, lancer `npx playwright test --config=<ce fichier> --trace off`, puis supprimer le fichier et faire `git checkout -- test-results && git clean -fdq test-results`.
- Le texte visible vient de `wording-en.js` et `wording-fr.js` (toujours modifier les deux). Ne pas écrire de texte en dur dans `ui*.js`.
- Ne jamais mettre le nom du modèle dans les commits ni les PR.

## À faire, par ordre de priorité

### 1. Seuil du rush à 3 bonnes réponses pour les parties gratuites
Le joueur doit vivre le ×2 avant le paywall. Aujourd'hui il faut 4 bonnes réponses d'affilée, et la première partie ne fait que 5 questions.
- `game.js` ligne ~596 : `Number(this.run.correctStreak || 0) >= 4` est codé en dur. Le rendre configurable (ex. `config.game.comboThreshold`, 4 par défaut) et lui donner une valeur plus basse pour les parties gratuites (`runStartNumber` 1 et 2).
- `config.js` : `ui.momentumMeter` a `segments: 4` et `thresholds s1..s4`. La barre doit avoir autant de segments que le seuil. `ui.js` utilise `momentumState.streak >= momentumState.segments` pour afficher le badge ×2.
- Textes `system.comboRule` dans les deux fichiers de wording : « 4 correct answers… » doit suivre le seuil.
- Tests à adapter : `e2e/critical-flows.pw.js` (test « four green bars… », attend 4 segments et un score de 6) et `tests/game.test.js` (premier test).
- Événement analytics `combo-unlocked` : le titre contient `threshold=4`.

### 2. Rapid Fire (mode bonus) : fait, reste à regarder la difficulté
Fait : `secretBonus.fall.initialSpeed` passé de 10 à 15 (la première question mettait environ 8 s à atteindre la ligne), panneau d'entrée réduit à 3 lignes (plus de ligne « pool » ni « ticket left »). Reste : jouer une manche à la main et vérifier que la rampe n'est pas trop raide (`maxSpeed: 20` est atteint plus vite avec un départ à 15). Ajuster `speedIncrement` ou `maxSpeed` si besoin.
Vérifier aussi que l'habillage « terrain » ne revient pas dans ce mode (il est limité à `.wt-container[data-wt-state='playing']:not([data-wt-mode='bonus'])` dans `styles/screens.css`). Attention : un test e2e (`question statement is readable`) vérifie la couleur du texte de la question, mais seulement en mode RUN.

### 3. Largeur bureau : fait
Vérifié à 1280 px (accueil, question, feedback, fin de partie, panneau de début). Seul défaut : la rangée de liens SEO de l'accueil s'étirait sur une ligne ; elle passe maintenant à la ligne (`styles/components.css`). Le paywall n'a pas été regardé à cette largeur.

### 4. Partage du score : fait
Le partage existait déjà (`ui-share.js` : partage natif, copie, e-mail, lien avec `challenge=` et référent). Deux défauts corrigés : il était masqué sur l'écran de fin le plus courant (partie gratuite perdue), et le texte ne mentionnait le score que si le meilleur score dépassait 10. Maintenant un lien « Challenge a friend » est visible sur cet écran, et le texte dit « I scored {score}. Can you beat me? ». Reste possible : un texte de partage plus accrocheur, ou une image de score.

### 5. Panneau des parties gratuites : fait
Les titres du panneau de début indiquent le nombre de questions (« Your first free game: 5 questions », « Last free game: 10 questions. Make it count », et en français). Ces nombres sont écrits dans `wording-en.js` / `wording-fr.js` et doivent rester égaux à `config.js` → `curatedFreeRuns.maxQuestionsByRun`. Un test (`tests/wording-contract.test.js`) échoue s'ils divergent.

## Hors code (à signaler à la propriétaire, ne pas faire soi-même)

- Search Console : soumettre `sitemap.xml`, regarder combien de pages `/rules/` et `/quiz/` sont indexées.
- 5 pages SEO sont en statut `ready` (donc `noindex`) dans `seo-pages.json` et attendent sa relecture. Quand elle les valide : `"status": "live"` puis `npm run publish:seo`.
- Aucune page SEO en français, volontairement, pour ne pas concurrencer bonjourpickleball.fr.
- Distribution : encart quiz dans les articles de bonjourpickleball.fr, groupes Facebook et Reddit pickleball (54 % de l'audience est américaine), poster QR.
- GoatCounter (`caroles.goatcounter.com`) : le compte n'est pas accessible depuis l'agent. Demander les lignes `paywall` et `checkout` des 30 derniers jours pour savoir où les joueurs s'arrêtent.
- Le prix passe de 4,99 $ à 6,99 $ après 15 minutes (compte à rebours affiché sur le paywall). C'est un choix de la propriétaire, ne pas le changer.

## Pièges connus

- `config.js` contient `seedScores` (faux scores du classement) uniquement sur `localhost`. En production le classement vide est masqué (`leaderboard.landingCardMinRows: 3`).
- `tests/wording-contract.test.js` vérifie des textes exacts : si un wording change, ce test peut échouer.
- La CI exécute `npm run format:check` : une ligne trop longue dans `tests/` fait échouer la CI. Lancer `npx prettier --write tests` avant de pousser.
