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
- **`fr.html` : jouable mais `noindex,follow`** (18 nov. 2026). Le .com est le jeu, bonjourpickleball.fr porte tout le SEO français. Pas de hreflang entre `/` et `/fr.html`, absente du sitemap, non bloquée dans robots.txt. Ne pas la réindexer sans l'accord de la propriétaire. Les liens de la version française vers bonjourpickleball.fr existent (`rules-link.js`, adresses dans `config.js` → `rulesLinks` : `/regles/` à l'écran de fin et dans le pied de page, `/regles/questions/` sous l'explication, avec `utm_source=pickleballrulesquiz`). L'agent n'a pas accès au site live : **la propriétaire doit cliquer sur les deux adresses pour confirmer qu'elles répondent**. Ne jamais ajouter d'adresse non vérifiée ; une page précise par question n'est à lier que si la correspondance est vérifiée.

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
SEO : l'accueil et chaque page ont des liens vers les 8 thèmes ; les 5 pages de réponses courtes sont publiées (statut `live`, relues contre le règlement 2026) ; il reste à resoumettre le plan du site dans Search Console.
Kit de partage Instagram (Codex) : pages `share.html`, `share.js`, `share.css` et lien « Prepare an Instagram post » sur l'écran de fin. Serveur du classement : écritures rendues atomiques (Codex). Mise à jour du service worker corrigée (Codex).
Écran de fin refait (17 nov. 2026) : titre selon le résultat (`end-fx.js`, `WT_EndFx.tier`), une pastille par réponse (`lastRun.outcomes`, non envoyé au classement), compteur de score, confettis, son de victoire (`WT_SFX.play('win')`), rangée de boutons de partage (Défier un ami, Carte de score, Instagram ; les deux derniers seulement à partir de la 2e partie ou d'un score de 3), encadré e-mail, pastille d'objectif du ticket Rapid Fire. Accueil : un simple lien e-mail à la place des textes de liste d'attente répétés, bloc « niveau » masqué quand une carte défi ou meilleur score s'affiche, bouton « Installer l'application » retiré de l'accueil (18 nov.). Newsletter : formulaires Kit français et anglais branchés.
Animations (18 nov. 2026, `play-fx.js` et styles) : +N qui s'envole, badge de série ×N à 3, 5, 8, 12 et 20 bonnes réponses, balle qui traverse la carte (ou tombe au filet), tremblement des vies, glissement de chaque nouvelle question ; sur tous les écrans de fin, les blocs montent un par un et le bouton principal brille une fois. Tout est coupé en mode « réduire les animations » et ne change ni les scores ni les délais. Pas fait : battement de tension sur la dernière question (aucun compteur de question accessible dans l'interface).
Événements GoatCounter déjà envoyés : `landing_view`, `run_start`, `run_complete`, `paywall_view`, `paywall_dismiss`, `checkout_start`, `unlock_success`, `end_action_click` (dont le partage), `combo_unlocked`.

## À faire (par ordre)

État au 17 novembre 2026 : `main` est en version 4.3.55, tout est fusionné, la CI est verte. Les deux formulaires Kit (FR et EN) sont branchés, les 5 pages de réponses SEO sont publiées, l'accueil et l'écran de fin ont été refaits (voir « Ce qui existe »).

1. **Mesurer avant de construire (dans 7 à 10 jours).** La propriétaire colle les lignes GoatCounter dans la conversation : `landing_view`, `run_start`, `run_complete`, `paywall_view`, `checkout_start`, `newsletter_submit`, et les sources `src-email-...`, `src-club-...`. Regarder : combien finissent une partie, combien s'inscrivent à l'e-mail, d'où viennent les visites. Le vrai frein est le trafic, pas le jeu.
2. **Paiement (à traiter avant ou dès les premières ventes réelles).** Le code d'accès `PRQ-xxxx-xxxx` est accepté côté navigateur et `success.html` en génère un : contournable. Reporté sur décision de la propriétaire ; passe en premier dès qu'il y a des ventes.
3. **Règlement 2027 : refonte globale des questions.** Décision de la propriétaire : ne pas ajouter de questions au jeu avant (pas de « 211 questions »). Quand le règlement 2027 sortira : revoir les 200 questions, en ajouter (kitchen en priorité, 8 sur 200 aujourd'hui), choisir un nombre rond, mettre à jour tous les « 200 questions » (accueil, wording, poster, JSON-LD de `index.html`, pages SEO, `llms.txt`), lancer `npm run generate:leaderboard-key` et **redéployer le Worker du classement avant la mise en ligne** (il valide les réponses avec sa propre copie du contenu), puis `npm run publish:seo` et tous les tests. Ne rien rédiger de mémoire : tout doit venir du règlement.
4. **Contenu de la newsletter.** `NEWSLETTER_CONTENU.md` contient 11 questions sur la zone de non-volée tirées du règlement 2026 (aussi dans `drafts/kitchen-questions-draft.json`, non lues par le jeu), le format d'e-mail et un rythme (un e-mail par semaine au maximum). Les utiliser aussi en posts.
5. **Rapid Fire, pistes non faites** : une vraie capsule à attraper, un boss à points doublés (le Worker ne valide pas les scores du Rapid Fire aujourd'hui, à revérifier avant), un son pour les vagues. Ne pas toucher à la vitesse.
6. **Écran d'accueil : encore chargé ?** Après l'allègement, voir avec les chiffres s'il faut retirer d'autres blocs (défi du jour, classement, installation).
7. **Minification du bundle** (872 Ko, 196 Ko compressé) : demande d'ajouter `esbuild` en dépendance de développement (`npm install -D esbuild`, refusé par l'agent sans autorisation) puis d'adapter `scripts/generate-app-bundle.mjs`. Non prioritaire.
8. **Poursuivre le découpage de `ui.js`** (5 fichiers sous `ui/`, de 1 200 à 3 000 lignes). Une extraction par PR, sans changement de comportement. Non prioritaire.

## Hors code (pour la propriétaire)

- **Avant chaque envoi d'e-mails :** vérifier que `https://www.pickleballrulesquiz.com/config.js` affiche la version courante (4.3.55 ou plus), puis faire une inscription de test avec sa propre adresse en navigation privée (e-mail de confirmation, page de confirmation, e-mail de bienvenue). Mettre dans chaque envoi un lien étiqueté, par exemple `https://www.pickleballrulesquiz.com/fr.html?wt-source=email-lancement` (visible dans GoatCounter en `src-email-lancement`) ; changer la fin pour chaque envoi.
- **Search Console :** resoumettre `https://www.pickleballrulesquiz.com/sitemap.xml` (34 adresses) et demander l'indexation de 2 ou 3 pages `/rules/` ; vérifier que seules les pages voulues restent `noindex` (404, `success`, `confirmation`, `clubs`) ; regarder dans 2 à 3 semaines les requêtes dans « Performances ».
- **Kit :** formulaire français `10204850` et anglais `10205105` (reCAPTCHA désactivé, double confirmation, e-mail de bienvenue en séquence). Vérifier que la séquence de bienvenue anglaise est activée. Page de confirmation : `https://www.pickleballrulesquiz.com/confirmation/` (`?lang=en` pour l'anglais) ; ses visites dans GoatCounter comptent les inscriptions confirmées. Si les noms de champs d'un futur formulaire diffèrent, les adapter dans `config.js` → `newsletter.fieldNames`. S'engager sur ce que le formulaire promet (nouvelles questions, nouveautés).
- **Distribution :** encart quiz dans les articles de bonjourpickleball.fr, groupes Facebook et Reddit pickleball (54 % de l'audience est américaine), poster QR dans les clubs, liens `/clubs/` pour chaque club ou coach.
- **Codex :** il commite aussi sur le dépôt. Avant tout travail : `git fetch` et `git log origin/main --oneline -15`. Vérifier dans GitHub qu'aucune PR de Codex n'attend.
- Jouer une manche de Rapid Fire sur téléphone et dire si l'ensemble paraît juste.

## Pièges connus

- `config.js` contient `seedScores` (faux scores du classement) uniquement sur `localhost`.
- Le fichier `IMPLEMENTATION_MEMORY.md` cite `REGRESSION_GUARDRAILS.md`, qui n'existe pas dans le dépôt.
- La CI : tests unitaires, couverture, `format:check`, bundle et CSS régénérés, pages SEO régénérées, tests Playwright (smoke, parcours critiques, accessibilité). Une ligne trop longue dans `tests/` ou `e2e/` fait échouer le formatage.
