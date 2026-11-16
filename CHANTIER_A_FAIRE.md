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

### 1. Rush ×2 : décision prise, seuil gardé à 4
La propriétaire a choisi de garder 4 bonnes réponses d'affilée. **Ne pas modifier le seuil** : le Worker du classement (`leaderboard-worker/src/index.js`, fonction `computeServerScore`, et `tests/leaderboard-worker-score-utils.test.js`) recalcule les scores avec la règle « ×2 après 4 réussites d'affilée », et il est déployé à part (Cloudflare), pas par ce dépôt. Si seul le client changeait, les scores envoyés ne correspondraient plus au calcul serveur. Conséquence connue : dans une première partie de 5 questions, le ×2 ne peut tomber que sur la dernière réponse. À reconsidérer seulement si le classement prend de l'ampleur ; il faudrait alors changer ensemble `game.js` (seuil codé en dur, lignes ~596 et ~697), `config.js` (`ui.momentumMeter`), le Worker, les wordings `system.comboRule` (EN/FR), les tests, puis redéployer le Worker.

### 2. Rapid Fire (mode bonus) : fait, reste à regarder la difficulté
Fait : `secretBonus.fall.initialSpeed` passé de 10 à 15 (la première question mettait environ 8 s à atteindre la ligne), panneau d'entrée réduit à 3 lignes (plus de ligne « pool » ni « ticket left »). Reste : jouer une manche à la main et vérifier que la rampe n'est pas trop raide (`maxSpeed: 20` est atteint plus vite avec un départ à 15). Ajuster `speedIncrement` ou `maxSpeed` si besoin.
Vérifier aussi que l'habillage « terrain » ne revient pas dans ce mode (il est limité à `.wt-container[data-wt-state='playing']:not([data-wt-mode='bonus'])` dans `styles/screens.css`). Attention : un test e2e (`question statement is readable`) vérifie la couleur du texte de la question, mais seulement en mode RUN.

### 3. Largeur bureau : fait
Vérifié à 1280 px (accueil, question, feedback, fin de partie, panneau de début). Seul défaut : la rangée de liens SEO de l'accueil s'étirait sur une ligne ; elle passe maintenant à la ligne (`styles/components.css`). Paywall regardé aussi à 1280 px : propre (la rangée de liens SEO y est masquée, elle ne sert qu'à l'accueil).

### 4. Partage du score : fait
Le partage existait déjà (`ui-share.js` : partage natif, copie, e-mail, lien avec `challenge=` et référent). Deux défauts corrigés : il était masqué sur l'écran de fin le plus courant (partie gratuite perdue), et le texte ne mentionnait le score que si le meilleur score dépassait 10. Maintenant un lien « Challenge a friend » est visible sur cet écran, et le texte dit « I scored {score}. Can you beat me? ». Reste possible : un texte de partage plus accrocheur, ou une image de score.

### 5. Panneau des parties gratuites : fait
Les titres du panneau de début indiquent le nombre de questions (« Your first free game: 5 questions », « Last free game: 10 questions. Make it count », et en français). Ces nombres sont écrits dans `wording-en.js` / `wording-fr.js` et doivent rester égaux à `config.js` → `curatedFreeRuns.maxQuestionsByRun`. Un test (`tests/wording-contract.test.js`) échoue s'ils divergent.

## Clubs et coachs : fait
- `club-link.js` (partagé) fabrique les liens : étiquette `club-<nom>` ou `coach-<nom>` (accents retirés, 40 caractères max), adresses du site EN/FR, liens par thème, adresse du poster. Testé dans `tests/club-link.test.js`.
- Le poster accepte `/poster/?club=Nom` ou `?coach=Nom` : il affiche « Offert par Nom » et met l'étiquette dans le QR code (`poster.js`). Le QR est en taille automatique quand il y a une étiquette ; la version 4 fixe ne contient pas une adresse étiquetée.
- La page `/clubs/` (`clubs/index.html`, `clubs.js`, `clubs.css`) génère lien, lien du poster, message WhatsApp, QR téléchargeable et liens par thème à partir d'un nom. Rien n'est stocké ni envoyé. Page en `noindex`.
- La source est lue par `analytics.js` (`wt-source`) et apparaît dans GoatCounter sous `src-club-<nom>`. Un lien vers une page `/quiz/<thème>/` perd l'étiquette (son bouton Play met `wt-source=seo`) : utiliser les liens directs de la page `/clubs/`.
- Si un thème est ajouté dans `seo-pages.json`, l'ajouter aussi dans `THEMES` de `club-link.js` (un test compare les deux).

## Rapid Fire arcade : fait
- Look « terrain de nuit » (variables de couleur redéfinies sous `.wt-container[data-wt-mode='bonus']` dans `styles/screens.css`, section RAPID FIRE ARCADE).
- `rapidfire-fx.js` : raquette qui glisse sous la réponse choisie, bannière « VAGUE n » toutes les 5 questions, capsule bonus +1 VIE après 8 bonnes réponses d'affilée si une vie a été perdue, question « boss » en dernier (paquet de 5 minimum). Les effets sont redessinés par `sync()` après chaque rendu depuis `this._runtime.rf` : ne pas les ajouter à la main sur le DOM, ils disparaîtraient au rendu suivant.
- `game.js` : `grantChance()` rend une vie (mode Rapid Fire seulement) ; `buildSeenDeck` met en dernier une question « 2026 Changes » ou « Hard ».
- **Ne pas toucher à la vitesse de chute** (`secretBonus.fall` dans `config.js`, `initialSpeed: 10` etc.) : c'est un réglage de la propriétaire, fait avec soin. Un ralentissement bonus a été essayé puis retiré pour cette raison.
- Ces effets ne changent pas les points. Les scores du Rapid Fire ne sont pas validés par le Worker du classement, mais vérifier si ce n'est plus vrai avant d'ajouter des effets qui touchent au score.
- Pistes non faites : une vraie capsule à attraper, un boss à points doublés, un son dédié aux vagues.

## Suite de l'audit (fait)
- Première partie gratuite sans élimination : `config.js` → `curatedFreeRuns.noEliminationRuns: [1]` (le moteur, `game.js` `isNoEliminationRun`, n'applique cela que si la partie a un plafond de questions, sinon elle ne finirait jamais). Le bouton « Mistakes » du HUD est masqué dans cette partie ; le texte du panneau de début est `ui.startRunNoEliminationOverlay`.
- Le bouton de son est une note de musique (le haut-parleur de la carte question lit la question à voix haute).
- Les événements `paywall_view`, `paywall_dismiss`, `checkout_start` et `unlock_success` existent déjà (`ui.js`, `ui-checkout.js`) : les chercher dans GoatCounter.
- Test e2e du Rapid Fire (`e2e/critical-flows.pw.js`) : raquette, mauvaise réponse, capsule +1 VIE. Les tests de captures d'écran pixel par pixel n'ont pas été ajoutés (rendu différent entre ce conteneur et la CI) ; les tests vérifient plutôt couleurs et dimensions.
- **Pas fait : minification du bundle.** Elle demande d'ajouter `esbuild` en dépendance de développement (`npm install -D esbuild`, puis `scripts/generate-app-bundle.mjs` à adapter ; la CI vérifie que `app.bundle.js` est identique à la génération). À faire quand la propriétaire l'autorise.
- **Pas fait : paiement.** Le déverrouillage premium accepte un code au bon format et `success.html` en fabrique un : à reprendre avant de promouvoir le jeu (codes émis par le serveur après paiement Stripe).

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
