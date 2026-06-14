# SEO Playbook — pickleballrulesquiz.com

Référence unique de la stratégie SEO. Dernière mise à jour : 2026-06-14.
À garder dans le repo ET dans la connaissance du projet Claude.

---

## 1. Périmètre et répartition des langues

- **pickleballrulesquiz.com = English only.** Tout le SEO anglais (marché US/CA).
- **bonjourpickleball.fr = tout le SEO français.** Aucune page FR sur le .com
  (cannibalisation de notre propre autorité francophone sinon).
- Hreflang : uniquement entre la racine du .com et /fr.html (déjà en place),
  et potentiellement entre les deux hubs si le .fr crée une page quiz.

## 2. Architecture en 4 couches

1. **Hub produit** = la racine du domaine (exact-match domain). Pas de page hub
   séparée. Cible : "pickleball rules quiz" — segment vérifié underserved
   (SERP occupée par fermes à quiz, flashcards scolaires, articles trivia ;
   aucun produit dédié sérieux).
2. **Pages thèmes** : `/quiz/<slug>/` — 8 thèmes mappés sur les tags de
   content.json (Serving 34 cartes, Court & Equipment 34, Scoring 31,
   Line Calls 18, Faults 18, 2026 Changes 17, Rally+Net 26, NVZ 8).
3. **Pages questions long-tail** : `/rules/<slug>/` — ~40-50 pages, une
   question = une page. C'est la couche qui sert le "query fan-out" de Google.
4. **Capture citations LLM** : llms.txt + pages comparatives. APRÈS que les
   couches 2-3 sont indexées.

On n'attaque JAMAIS les head terms ("pickleball rules") — verrouillés par
USA Pickleball, The Dink, Paddletek, Pickleheads. On prend ce qu'ils ne
défendent pas.

## 3. Outillage — source de vérité unique

- **`seo-pages.json`** (racine) = la SEULE source de vérité : thèmes,
  questions, contenu rédigé, statuts, métadonnées.
- **`scripts/generate-seo-pages.mjs`** : génère `/rules/<slug>/index.html`,
  dossiers compris. **On ne crée JAMAIS un dossier ou une page à la main.**
- **`scripts/generate-sitemap.mjs`** : génère sitemap.xml. **On n'édite
  JAMAIS sitemap.xml à la main.**
- Commandes : `npm run generate:seo-pages` puis `npm run generate:sitemap`.

### Statuts (workflow qualité)

- `draft` → en cours, pas généré (ou sans contenu).
- `ready` → page générée et déployable, MAIS hors sitemap. Phase de relecture.
- `live` → relue et approuvée par Caro → entre dans le sitemap.

### Garde-fous fail-loud (ne pas contourner)

- **450 mots visibles minimum** (defaults.minWordCount) : le générateur
  REFUSE de builder une page ready/live sous le seuil (exit code 1).
  Anti-thin-content / anti-doorway-pages.
- **Breadcrumb conditionnel** : 2 niveaux (Home → question) tant que la page
  thème n'est pas `live` ; 3 niveaux après régénération. Jamais d'URL morte
  dans les données structurées.
- **Aucun lien visible vers une page non créée** : la section "related" reste
  en commentaire HTML jusqu'à ce que les pages cibles existent.

## 4. Gabarit de page question (VALIDÉ — ne pas modifier sans accord)

Structure, dans l'ordre :
1. **Lead answer-first** : le verdict en gras dans la première phrase
   ("**Yes — at any time.**"). Réponse complète dans les ~100 premiers mots.
2. Sections H2 : "What the rule actually says" → détail des fautes/cas →
   "Why players get this wrong" (la confusion classique).
3. "Test yourself" : teaser avec 3 VRAIES questions du quiz (cartes de
   content.json, cardIds tracés dans seo-pages.json).
4. CTA `wt-btn--primary` pleine largeur vers `/`.
5. Note source en `wt-muted` : règle exacte + mention non-affiliation USAP.

Tech : design system existant (`wt-page--doc`, `wt-card`, `/style.css` en
chemin absolu), zéro JS, zéro i18n, JSON-LD FAQPage (3 Q&A autonomes : chaque
réponse complète dès la première phrase) + BreadcrumbList.

### Règles de rédaction

- **Vérifier la règle dans le rulebook 2026 AVANT d'écrire** (project
  knowledge). La numérotation a changé entre 2025 et 2026 : ex. les règles
  NVZ sont passées de la Section 9 à la règle 11.A. Toujours citer la
  numérotation 2026.
- Paraphraser le rulebook (copyright USAP), citation courte max avec
  attribution.
- Workflow : rédaction du bloc `content` dans seo-pages.json → génération →
  relecture Caro → `live` → sitemap. Jamais de batch publié sans relecture.

## 5. Alignement recherche IA (AI Overviews, AI Mode, conversationnel)

État vérifié juin 2026 — le gabarit est aligné nativement :

- **Answer-first** : répondre dès le début de la page, avant les détails
  (Google ne fixe pas de seuil officiel type "100 mots"). Notre lead + chaque
  Q&A FAQ sont construits comme des unités autonomes — format qui AIDE
  l'extraction, sans garantie de citation.
- **Query fan-out** : Google découpe la requête en sous-requêtes ; les pages
  présentes à travers les sous-requêtes sont citées. Les pages questions
  long-tail couvrent exactement ça.
- **Petit domaine viable** : la citation IA ne suit pas strictement le
  ranking classique (étude AWR 2024 : ~46% des URLs citées hors top 50 ;
  étude académique 2026 : ~30% des domaines cités absents de la page 1 —
  estimations tierces, pas des chiffres Google). Être la source la plus
  extractible et fiable sur la question précise compte plus que battre les
  gros en ranking. Notre preuve d'autorité : la référence exacte de règle
  2026, la date visible, l'absence de contenu gonflé.
- **Cluster topique** : pilier + pages de soutien interliées = facteur de
  citation. Le maillage interne s'active au fil des passages en live.
- **FAQPage : plus un levier Google depuis le 7 mai 2026.** Les FAQ rich
  results ont disparu de Google Search (rapport et Rich Results Test retirés
  en juin 2026, API en août). Le markup reste valide et inoffensif, et peut
  aider d'autres systèmes (Microsoft confirme que le schema aide Copilot).
  Conséquence gabarit : la FAQ est désormais RENDUE VISIBLE sur la page
  (section "Common questions") — c'est le texte visible qui a la valeur
  d'extraction ; le JSON-LD est conservé et correspond exactement au contenu
  visible (exigence Google). Ne jamais présenter FAQPage ou llms.txt comme
  des leviers Google majeurs.
- **llms.txt** : Google ne l'utilise PAS. Pertinent pour d'autres crawlers
  IA, coût nul. À déployer uniquement quand les pages listées existent
  (sinon on annonce des 404 aux agents). La ligne le mentionnant a été
  retirée de robots.txt en attendant.
- **robots.txt** : crawlers IA explicitement autorisés — inference/search
  (OAI-SearchBot, PerplexityBot, Claude-SearchBot…) ET training (GPTBot,
  ClaudeBot, Google-Extended, CCBot) — choix délibéré : être dans les corpus
  = devenir la réponse canonique (couche 4).

## 5bis. Recherche conversationnelle & AI Mode (post I/O 2026)

Mise à jour après Google I/O 2026 (19 mai) :

- **Fusion des surfaces** : AI Mode (1 Md utilisateurs) et AI Overviews
  (2,5 Md MAU) fusionnent en une expérience unifiée — un follow-up depuis un
  AI Overview bascule en conversation AI Mode, contexte conservé.
- **Mécanique conversationnelle** : chaque follow-up PEUT relancer une
  exploration plus fine, souvent via des mécanismes de query fan-out (Google
  dit "peut utiliser", pas "systématique"). Implication : **sélectionner les
  questions comme des ARBRES DE CONVERSATION par thème**. Chaque page est une
  **candidate propre à la citation IA** — éligible si indexée, claire, utile ;
  jamais garantie.
- **Anti-cannibalisation (règle d'élagage, à appliquer avant chaque lot)** :
  1 intention = 1 page. Les follow-ups IMMÉDIATS (même réponse de fond)
  s'intègrent DANS la page via la FAQ ; seules les questions cousines à
  réponse substantiellement différente méritent leur propre page.
  Test : *si deux questions partagent ~80% de leur réponse, elles partagent
  une page.* Ne jamais créer de pages pour des variations de formulation
  d'une même intention (mise en garde explicite de Google).
- **Économie zéro-clic** : selon les données Semrush, AI Mode génère autour
  de 92-94% de sessions sans clic externe (estimation tierce, pas un chiffre
  officiel Google). La citation/mention de marque EST l'actif ; les clics
  restants sont ultra-qualifiés → le CTA vers l'app doit convertir. Suivre
  les requêtes de marque et les referrals IA dans GoatCounter.
- **Citations ChatGPT** : Bing alimente plusieurs expériences IA dont
  ChatGPT (qui utilise aussi d'autres fournisseurs — Bing n'est pas l'unique
  porte, mais un levier à ne pas rater) → **inscrire les DEUX sites
  (pickleballrulesquiz.com ET bonjourpickleball.fr) sur Bing Webmaster
  Tools**. Envisager IndexNow.
- E-E-A-T et profondeur topique multi-intentions récompensées en AI Mode :
  le cluster complet (hub → thèmes → questions interliées) sert directement ça.

## 5ter. Workflow de publication & cadence

### Le principe : production rapide, publication cadencée

- PRODUCTION (rédaction par Claude) : peut s'enchaîner cluster après
  cluster sans attendre — mais toujours UN CLUSTER PAR PASSE, jamais tout
  d'un coup, parce que chaque cluster exige sa vérification rulebook
  (section dédiée) + croisement cartes + check teasers. La qualité de
  vérification est la contrainte, pas le SEO.
- PUBLICATION (passage en live) : par cluster complet (5-8 pages), avec
  relecture Caro entre les deux. Les statuts servent de sas.

### Cycle A — à chaque lot livré par Claude (pages en `ready`)

1. Remplacer seo-pages.json à la racine.
2. `npm run publish:seo` → pages générées AVEC noindex (car ready),
   sitemap inchangé.
3. `git add . && git commit && git push`.
4. Les pages sont EN LIGNE MAIS INVISIBLES pour Google → relecture
   possible sur les vraies URLs (mobile compris), partage pour avis.

### Cycle B — quand un cluster est validé en relecture

5. Dans seo-pages.json : `"status": "ready"` → `"status": "live"` pour
   chaque page validée.
6. `npm run publish:seo` → le noindex DISPARAÎT de ces pages ET elles
   ENTRENT au sitemap, en une commande. TOUJOURS cette commande unique :
   une page live encore noindexée ou un sitemap annonçant une page
   noindexée = incohérence.
7. Commit + push (GitHub Pages déploie).

### Une seule fois — au premier passage en live

8. Google Search Console : créer la propriété pickleballrulesquiz.com,
   soumettre https://pickleballrulesquiz.com/sitemap.xml.
9. Bing Webmaster Tools : pareil (import direct possible depuis GSC).
   Inscrire AUSSI bonjourpickleball.fr au passage.
10. Accélérateur : GSC → Inspection d'URL → "Demander l'indexation" sur
    chaque URL du premier cluster (réduit l'attente de semaines à jours).

Ensuite, chaque cluster suivant = Cycle B seulement. GSC et Bing relisent
le sitemap seuls (les lastmod signalent les nouveautés).

### Cadence de publication (jamais en vrac)

- Séquence : Kitchen (5) → signaux GSC → Serving (5) → Scoring →
  Faults/Line calls → etc.
- "Attendre les signaux" bloque la PUBLICATION, pas la PRODUCTION : on
  rédige le cluster suivant pendant l'attente.
- Le vrai risque n'est pas la vitesse de publication, c'est : publier vite
  → erreur de règle → page indexée → mauvaise réponse citée → crédibilité
  détruite. Pour un quiz de RÈGLES, la fiabilité est l'actif. Une erreur
  indexée coûte plus cher que dix pages de retard (cf. carte 160).

### Rituel qualité de chaque lot (côté Claude, avant livraison)

- Règles vérifiées dans le rulebook 2026 (numérotation 2026).
- Élagage anti-cannibalisation appliqué (1 intention = 1 page).
- Teasers = texte EXACT des cartes de content.json (vérifié par script,
  jamais paraphrasé).
- Gate 450 mots passé, JSON-LD validé, breadcrumb conforme.

### Attentes réalistes

- Trafic long-tail qualifié, pas d'explosion : objectif = requête précise →
  réponse claire → confiance → clic vers le quiz → usage app.
- 5 pages live = petit signal (impressions, quelques clics). 40-50 pages +
  thèmes + maillage + GSC/Bing = actif SEO défendable (dizaines puis
  centaines de visites qualifiées/mois, selon indexation et saison).
- Suivre dans GSC : impressions/clics PAR TYPE de question pour orienter
  les clusters suivants.

## 5ter. Déploiement progressif (stratégie de mise en live)

Deux niveaux distincts :

- **Déploiement des FICHIERS : tout d'un coup, sans risque.** Les pages
  `ready` sont en ligne mais noindex — relisibles dans leur vrai rendu,
  invisibles pour Google.
- **Passage en LIVE : par vagues de cluster.** Non pas par peur de Google
  (le risque "doorway" tient à la qualité, pas au nombre) mais pour caler
  le rythme sur la capacité de relecture et obtenir des données propres
  par vague.

Règle absolue : **un thème et ses pages questions passent live ENSEMBLE** —
sinon thème pointant vers des pages noindex, ou questions orphelines de
leur parent. Le générateur tolère les deux, mais le cluster ne rend à
plein que complet.

Vagues prévues (rythme ~1/semaine) :
1. Kitchen (thème + 5 questions) — cluster vitrine
2. Serving (thème + 5 questions)
3. Le reste : Scoring, Line calls, Faults + les thèmes sans enfants
   (2026 Changes, Court & Equipment, Rally)

Procédure par vague : statuts → "live" dans seo-pages.json →
`npm run generate:seo-pages` (noindex tombe, breadcrumbs passent à
3 niveaux) → `npm run generate:sitemap` → commit + push → demande
d'indexation de la page thème dans GSC.

## 5quater. Asie & actifs IA (décisions du 2026-06-12)

- **L'Asie est couverte par la stratégie English-only existante** : Inde,
  Singapour, Malaisie, Philippines, Hong Kong cherchent les règles en
  anglais — le cluster les sert sans travail supplémentaire. Surveiller la
  répartition géographique dans GSC après la vague 1 ; c'est elle qui
  décide de la suite.
- **Localisation japonaise : PAS maintenant.** Décision produit (200 cartes
  + UI + maintenance), à reconsidérer dans 3-6 mois sur données GSC/app par
  pays. L'architecture i18n (wording-<locale>.js + i18n.<locale> dans les
  cartes) rend l'ajout faisable le jour venu. Ne jamais promettre de
  langues sur le site.
- **Backlog SEO post-vagues** :
  1. Date de mise à jour visible sur les pages (depuis lastmod, une ligne
     dans le générateur) — signal d'autorité E-E-A-T
  2. 9e thème /quiz/tournament-rules/ depuis les 27 cartes taguées
     Tournament — intention forte du marché asiatique tiré par les tournois
     (PPA Asia, DUPR)
  3. **Données propriétaires (actif majeur, mois 2+)** : les stats de
     réponses du quiz ("X% of players get the kitchen line question
     wrong") — données que personne d'autre ne possède, hautement citables
     par IA et médias. Le worker leaderboard collecte déjà les réponses
     par carte.
- **Pas de landing marketing séparée** : la racine EST l'app, c'est la
  force du produit. Ne pas diluer.
- **Mesure étendue** : impressions GSC sans clics = signal de visibilité
  IA/zéro-clic ; suivre aussi les requêtes de marque et les referrals IA
  dans GoatCounter.

## 6. État au 2026-06-14

- Infra livrée et corrigée après audit externe (breadcrumb conditionnel,
  gate 450 mots, robots.txt nettoyé).
- Thème Kitchen complet : 5 pages + page thème, règles 11.A vérifiées,
  relecture Caro effectuée, cluster passé en `live` et republié.
- Cartes de quiz corrigées après audit de cohérence :
  - carte 160 : chaîne de contact partenaire / ZNV
  - carte 168 : exception team play sur le win-by-2
- État au 2026-06-12 : cluster complet à 29 pages (8 thèmes + 21 questions),
  toutes en `ready`, relecture de fond effectuée contre le rulebook 2026
  (1 erreur corrigée sur win-by-2 : exception team play de 15.C).
- Maillage interne actif : pages thèmes → "Go deeper" auto-généré vers leurs
  questions ; pages question → retour thème + pages sœurs du cluster.
- Bridge conversion actif :
  - CTA SEO plus tôt dans la page
  - continuité de contexte SEO vers la landing
  - waitlist visible sur paywall et sur landing après épuisement des free runs
- llms.txt : prêt côté repo ; à considérer comme bonus de diffusion, pas
  comme levier principal.
- Vague 1 publiée : `Kitchen` est désormais indexable et présent dans le
  sitemap.
- Prochain geste concret : commit + push du lot, puis soumission sitemap /
  demande d'indexation dans GSC et Bing Webmaster Tools.
