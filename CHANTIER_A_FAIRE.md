# Reprise du projet (pour une nouvelle conversation)

État au 16 novembre 2026. Ce fichier suffit pour reprendre le travail sans l'historique. Les détails techniques des modules sont dans `IMPLEMENTATION_MEMORY.md`.

## Le projet en bref

`pickleballrulesquiz.com` : un jeu web de questions vrai ou faux sur les règles du pickleball (200 questions, anglais et français), de Carole (Bonjour Pickleball). Accès libre à 2 parties, puis paiement unique (4,99 $ pendant 15 minutes, puis 6,99 $). Environ 100 visites par mois et aucune vente : le vrai blocage est le trafic, pas le jeu. Statistiques dans GoatCounter (`caroles.goatcounter.com`), que l'agent ne peut pas lire : demander à la propriétaire de coller les chiffres.

## Décisions de la propriétaire (ne pas rouvrir sans son accord)

- **Seuil du ×2 : 4 bonnes réponses d'affilée.** Le Worker du classement (`leaderboard-worker/src/index.js`, `computeServerScore`) recalcule les scores avec cette règle et est déployé à part (Cloudflare) : changer le client seul casserait la validation des scores.
- **Vitesse de chute du Rapid Fire intouchable** (`config.js` → `secretBonus.fall` : `initialSpeed: 10`, `maxSpeed: 20`, `speedIncrement: 0.4`, `dangerThreshold: 0.86`). Réglage long et soigné de la propriétaire. Une erreur passée l'avait modifié : ne jamais y retoucher, ni par un ralentissement bonus.
- **Paiement reporté.** Le code de déverrouillage est accepté s'il a le format `PRQ-xxxx-xxxx` et `success.html` en fabrique un : contournable. À corriger avant de promouvoir le jeu (codes émis par le serveur après un paiement Stripe), mais la propriétaire a dit « on verra plus tard ».
- **Prix et compte à rebours :** deux prix (4,99 puis 6,99) avec compte à rebours de 15 minutes. Gardés.
- **Témoignages du paywall :** réels (seuls les prénoms ont été changés).
- **Noms :** titre anglais « Pickleball Rules Quiz » (l'accroche est « Can you get 5 tricky pickleball calls right? ») ; nom français « Défi des règles du pickleball ».
- **Pas de pages SEO en français**, pour ne pas concurrencer bonjourpickleball.fr.
- **Les questions viennent du règlement officiel USA Pickleball 2026, jamais d'une rédaction de mémoire.** Chaque question cite la règle exacte (forme existante : « 2026 USA Pickleball Official Rulebook, Rule 11.A. »).
- **Fusions :** ne fusionner une PR que lorsque la propriétaire dit « fusionne la N » (CI verte). Réponses en français, courtes, économes en jetons ; ne jamais annoncer « fait » sans l'avoir vérifié.

## Règles de travail techniques

- Pas de build : HTML/CSS/JS pur. `app.bundle.js` et `style.css` sont **générés**, ne jamais les éditer à la main :
  - après un changement de JS (y compris l'ajout d'un fichier à `scripts/generate-app-bundle.mjs`) : `npm run generate:bundle`
  - après un changement dans `styles/*.css` : `npm run generate:css`
  - après un changement de `seo-pages.json` : `npm run publish:seo`
- Changer un fichier de l'app ou `sw.js` : passer `version` dans `config.js` au numéro suivant (voir la valeur actuelle dans `config.js`), sinon le cache du service worker garde l'ancienne version. La CI régénère le bundle et le CSS et échoue s'ils diffèrent.
- Avant de pousser : `npm test`, `npm run format:check` (Prettier ne couvre que `tests/`, `logic/` et quelques fichiers de config : `npx prettier --write tests e2e` si besoin), puis les tests Playwright.
- Playwright : navigateur dans `/opt/pw-browsers/chromium`. Créer une config temporaire qui reprend `playwright.config.cjs` avec `use.launchOptions.executablePath = "/opt/pw-browsers/chromium"`, lancer `npx playwright test --config=<ce fichier> --trace off`, supprimer le fichier, puis `git checkout -- test-results && git clean -fdq test-results`. Les tests e2e effacent le stockage à chaque chargement (`startFreshRun`) : pour tester un rechargement, effacer une seule fois par onglet.
- Le texte visible vient de `wording-en.js` et `wording-fr.js` (toujours les deux). `tests/wording-contract.test.js` vérifie des textes exacts.
- Branche de développement : `claude/conversion-game-design-qy5zx7`. Chaque PR est ouverte depuis cette branche, après avoir repris `origin/main` ; **ne jamais réinitialiser la branche (`checkout -B`) avec des commits non fusionnés** (cela a déjà fait perdre une correction).
- Fusion : l'outil demande le SHA complet de 40 caractères ; vérifier que la CI porte bien sur le dernier commit de la PR (les notifications de CI peuvent concerner un commit plus ancien).
- **Plusieurs outils travaillent sur ce dépôt** (Claude et Codex, tous deux committent au nom de la propriétaire). Avant de commencer : `git fetch` puis `git log origin/main --oneline -15` pour voir ce qui a changé, et ne jamais écraser un travail récent. Codex a notamment découpé `ui.js` et ajouté le kit de partage Instagram (voir plus bas).
- **`ui.js` est un fichier GÉNÉRÉ** à partir de `ui/01-foundation.js`, `02-lifecycle.js`, `03-gameplay.js`, `04-growth-actions.js`, `05-rendering.js` (`npm run generate:ui`, déjà inclus dans `npm run generate:bundle`). Modifier les fichiers de `ui/`, jamais `ui.js`. Le répartiteur des actions (`switch (action)`) et la liste `trackedEndActions` sont dans `ui/02-lifecycle.js`.
- Ne jamais mettre le nom du modèle dans les commits ni les PR. Les ajouts de dépendances (`npm install`) sont bloqués dans l'environnement de l'agent : à demander à la propriétaire.
- **Leçon des trois derniers défauts visuels : tout état ajouté en JS après un rendu (classe, élément) est perdu au rendu suivant.** Soit le recréer depuis l'état à chaque rendu (voir `rapidfire-fx.js` `sync()`), soit le déduire du DOM stable en CSS (`:has(.wt-feedback--ok)`). Les tests e2e vérifient couleurs et dimensions, pas les pixels.

## Ce qui existe (fait et fusionné)

Parcours : accroche et accueil « terrain », première partie de 5 questions sans élimination, deuxième de 10 (3 erreurs), paywall allégé (3 avantages, prix, compte à rebours), écran de fin allégé, lien de partage avec le score, carte de score en image, défi du jour seulement à partir de la deuxième visite, classement masqué tant qu'il a moins de 3 scores.
Jeu : habillage terrain (question bleue, Vrai vert, Faux rouge), couleur du verdict conservée pendant le feedback, schémas de terrain dans les explications (8 thèmes), son et vibration (son coupé par défaut, bouton en note de musique en haut à droite).
Rapid Fire : look « terrain de nuit », raquette, bannière de vague toutes les 5 questions, capsule +1 vie après 8 bonnes réponses d'affilée, question « boss » en dernier. Les points et la vitesse sont inchangés.
Clubs et coachs : page `/clubs/` et poster personnalisé (`/poster/?club=Nom` ou `?coach=Nom`), liens étiquetés `club-<nom>` / `coach-<nom>` qui apparaissent dans GoatCounter sous `src-club-<nom>`. Un lien vers une page `/quiz/<thème>/` perd l'étiquette (son bouton Play met `wt-source=seo`) : utiliser les liens directs de `/clubs/`. Tout thème ajouté dans `seo-pages.json` doit l'être aussi dans `THEMES` de `club-link.js` (un test compare).
SEO : l'accueil et chaque page ont des liens vers les 8 thèmes ; 5 pages restent en `noindex` (statut `ready`) en attendant la relecture de la propriétaire.
Kit de partage Instagram (Codex) : pages `share.html`, `share.js`, `share.css` et lien « Prepare an Instagram post » sur l'écran de fin. Serveur du classement : écritures rendues atomiques (Codex). Mise à jour du service worker corrigée (Codex).
Événements GoatCounter déjà envoyés : `landing_view`, `run_start`, `run_complete`, `paywall_view`, `paywall_dismiss`, `checkout_start`, `unlock_success`, `end_action_click` (dont le partage), `combo_unlocked`.

## À faire (par ordre)

1. **Nouvelles questions sur la zone de non-volée** (8 sur 200 aujourd'hui, alors que c'est la règle la plus recherchée). Il faut que la propriétaire fournisse le texte du règlement 2026 : ne rien rédiger de mémoire. Étapes : (a) extraire des énoncés vrai/faux du règlement avec leur citation exacte ; (b) les ajouter à `content.json` (ids 201 et suivants, tags `Non-Volley Zone`, difficulté, `Singles`, `Doubles`, textes EN et FR, `explanationShort` avec la citation) et mettre à jour `totalItems` et `breakdown` ; (c) augmenter `game.poolSize` dans `config.js` et tous les « 200 questions » (accueil, wording, poster, JSON-LD de `index.html`, pages SEO, `llms.txt`) ; (d) le Worker du classement valide les réponses avec sa propre copie du contenu : lancer `npm run generate:leaderboard-key` et **redéployer le Worker avant la mise en ligne**, sinon les parties contenant ces questions sont rejetées ; (e) ajouter les ids au thème dans `seo-pages.json` et lancer `npm run publish:seo` ; (f) relancer tous les tests (certains contrôlent les totaux).
2. **Poursuivre le découpage de `ui.js`.** Codex l'a déjà réparti en 5 fichiers sous `ui/` (de 1 200 à 3 000 lignes chacun). Il reste de très longues méthodes (`_bindEvents`, `answer`, `_renderPlaying`, la logique de chute du Rapid Fire `_secretBonusFall*`). Poursuivre une extraction par PR, sans changement de comportement, en gardant le modèle existant (modules `WT_*`, ordre dans `scripts/generate-app-bundle.mjs`). Filet de sécurité : tests unitaires et e2e.
3. **Inscription à la lettre d'information (Kit) : construite, désactivée.** `newsletter.js` (envoi du formulaire Kit, validation, état mémorisé), `ui-newsletter.js` (fenêtre), lien « Recevoir de nouvelles questions pièges par e-mail » sur les écrans de fin, texte de confidentialité ajouté dans `privacy.html`. **Elle ne s'active que si la propriétaire colle, dans `config.js` → `newsletter.formAction`, l'URL d'action de son formulaire Kit (une par langue)** : voir « Hors code ». Impossible à tester contre Kit depuis l'agent. Pistes : demander le prénom ailleurs (page `/clubs/`), offrir un jeton Rapid Fire en contrepartie (à décider), regrouper les 4 liens de l'écran de fin (partage, carte de score, Instagram, e-mail) en un seul « Partager ».
4. **Minification du bundle** (872 Ko, 196 Ko compressé) : demande d'ajouter `esbuild` en dépendance de développement (`npm install -D esbuild`, bloqué pour l'agent) puis d'adapter `scripts/generate-app-bundle.mjs` ; la CI vérifie que le bundle commité est identique à la génération.
5. **Paiement** (reporté, voir plus haut).
6. **Rapid Fire, pistes non faites** : une vraie capsule à attraper, un boss à points doublés (le Worker ne valide pas les scores du Rapid Fire aujourd'hui, à revérifier avant), un son pour les vagues. Ne pas toucher à la vitesse.
7. **Contenu régulier** : toutes les questions sont vues après une quinzaine de parties ; prévoir une cadence de nouveautés (par exemple 10 par mois, toujours tirées du règlement).

## Hors code (pour la propriétaire)

- Search Console : soumettre `sitemap.xml`, regarder combien de pages `/rules/` et `/quiz/` sont indexées.
- Relire les 5 pages SEO en `noindex` ; si elles conviennent : `"status": "live"` dans `seo-pages.json` puis `npm run publish:seo`.
- Distribution : encart quiz dans les articles de bonjourpickleball.fr, groupes Facebook et Reddit pickleball (54 % de l'audience est américaine), poster QR dans les clubs, liens `/clubs/` pour chaque club ou coach.
- **Page de confirmation de l'inscription :** `confirmation/index.html` (en français ; `?lang=en` pour l'anglais), page `noindex` avec un lien de jeu étiqueté `wt-source=newsletter-confirmation`. C'est l'adresse à donner à Kit comme page de confirmation : `https://www.pickleballrulesquiz.com/confirmation/` (et `?lang=en` pour la liste anglaise). Ses visites dans GoatCounter comptent les inscriptions confirmées.
- **Activer l'inscription Kit :** dans Kit, créer un formulaire (un en français, un en anglais si possible) avec double confirmation d'inscription et un e-mail de bienvenue ; dans le code HTML d'intégration du formulaire, copier l'URL du `<form action="…">` ; la coller dans `config.js` → `newsletter.formAction` (`fr` et `en`) ; si les noms des champs du code d'intégration diffèrent de `email_address` et `fields[first_name]`, les adapter dans `newsletter.fieldNames`. Tester avec sa propre adresse. S'engager sur le contenu promis dans le texte du formulaire (nouvelles questions, nouveautés) : c'est une promesse faite aux inscrits.
- Dans 7 à 10 jours, coller dans la conversation les lignes GoatCounter (`run_start`, `run_complete`, `paywall_view`, `checkout_start`, référents, `src-club-`) pour mesurer l'effet des changements.
- Jouer une manche de Rapid Fire sur téléphone et dire si l'ensemble paraît juste.

## Pièges connus

- `config.js` contient `seedScores` (faux scores du classement) uniquement sur `localhost`.
- Le fichier `IMPLEMENTATION_MEMORY.md` cite `REGRESSION_GUARDRAILS.md`, qui n'existe pas dans le dépôt.
- La CI : tests unitaires, couverture, `format:check`, bundle et CSS régénérés, pages SEO régénérées, tests Playwright (smoke, parcours critiques, accessibilité). Une ligne trop longue dans `tests/` ou `e2e/` fait échouer le formatage.
