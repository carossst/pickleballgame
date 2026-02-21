# Word Traps — Game Design Artefact (V2 FINAL FINAL)

## Statut

**Version : V2 — FINAL FINAL (verrouillée)**\
**Décisions verrouillées : gameplay RUN, fin par chances, anti-répétition globale, monétisation par rejouabilité**

---

## 0. Accroche Home (landing page) — verrouillée

Affichée sur la page d’accueil (au-dessus du bouton principal).

```
Word Traps
Faux ami or true friend? 100 French words. 3 chances.
```

Règles :

- Cette accroche est **page d’accueil uniquement** (landing).
- Elle sert l’acquisition (SEO + compréhension immédiate).
- Elle **n’apparaît jamais in-game** (run, feedback, paywall, practice).

---

## 1. Définition du jeu

**Word Traps** est un **learning game** (format court, replayable) de jugement linguistique en **RUN continu**, fondé sur l’incertitude.

> A run is a continuous attempt that ends when you use all **3 chances**.

### Doctrine centrale V2

- Chaque mot est tiré **au hasard** dans un **pool de 100 word traps**
- Le défi repose sur la **lecture précise des mots**, pas sur la vitesse
- Le joueur ne joue contre **aucun adversaire** (ni humain, ni IA)
- Le jeu confronte uniquement le joueur à des **pièges linguistiques réels**
- Ces pièges sont connus en linguistique comme *faux amis* (concept externe), **sans jamais être nommés in‑game**

### Conséquences structurelles

- Pas de session fixe (suppression définitive du format 10 questions)
- Pas de niveaux
- Pas de progression pédagogique guidée
- Pas de mécanisme de rattrapage
- Pas de meta-progression toxique (streak, daily obligation)

---

## 2. Terminologie officielle (produit + UI)

- **Run** : tentative continue jusqu’à 3 chances consommées
- **Chance** : une “vie” consommée lorsqu’une réponse est incorrecte
- **French Points (FP)** : unité de score
  - 1 French Point = 1 word trap correctement identifié
  - Affichage standard in-run : **Score: 12 French Points**
- **Personal best** : meilleur score jamais atteint en French Points (stockage local)
- **Practice mode (Mistakes only)** : mode entraînement premium

Interdits (partout) : *session*, *round*, *level*, *assessment*, *streak*, *daily*, *rigged*, *scripted*.

---

## 3. Règle centrale de tension

- Le joueur dispose de **3 chances maximum**
- À **0 chance** → **Game over** immédiat

Cette règle est **l’unique source de tension active**.

### Hiérarchie cognitive (Option A — verrouillée)

**Principe clé :** rester concentré sur le mot courant.

- **Chances** = information primaire (dominante)
- **Score (French Points)** = information secondaire (discrète)

Objectifs :

- maintenir l’attention sur la décision en cours
- éviter toute pression de comparaison pendant le run

Justification :

- le jeu repose sur une analyse linguistique consciente
- le feedback est textuel et informatif
- un score trop saillant détournerait l’attention du mot

---

## 4. UI In-run (affichage score + chances) — verrouillé

### 4.1 Pattern global

Pattern arcade universel : **Score + Vies**, sans surcharge cognitive.

- **Score** à gauche (discret)
- **Chances** à droite (dominant)
- Choix binaire **True / False** côte à côte (taille égale)

### 4.2 Affichage “Chances” (descendant, sans “left”)

Libellé : **Chances** (uniquement). Valeurs : **3 → 2 → 1 → 0** (descendant).

Représentation recommandée (hybride, simple, arcade) :

- Texte : `Chances: 3` puis `2`, `1`, `0`
- Option visuelle (en plus du texte) : trois pastilles qui se “vident”

Exemple de mapping (● = restante, ○ = perdue) :

- Chances: 3 `●●●`
- Chances: 2 `●●○`
- Chances: 1 `●○○`
- Chances: 0 `○○○` → Game over

Règles :

- Pas de “left”
- Pas de phrase type “X chances remaining”
- Accessibilité : texte lisible + aria-label (ex. “2 chances”).

### 4.3 Affichage score (French Points)

Objectif : ancrer la marque “French Points” sans alourdir l’in-run.

- **In-run (compact)** : `Score: 12 FP`
- **Fin de run (forme longue)** : `Score: 12 French Points`

Règles :

- Le score est visible pendant le run
- Aucune animation liée au score
- Aucune comparaison au personal best pendant le run

### 4.4 Layout recommandé (référence arcade)

```
┌─────────────────────────────┐
│ Score: 12 FP      Chances: 2│
│                             │
│         "Librairie"         │
│                             │
│     [ True ]   [ False ]    │
└─────────────────────────────┘
```

Règle verrouillée :

- “Chances: X” est affiché (pas “2” seul).
- Sur mobile, l’objectif est “un regard = compréhension”.

## 5. Contenu (in‑game)

Le contenu repose sur **une seule notion in‑game** : les **word traps**.

- Le jeu **n’affiche jamais** les catégories “faux amis” / “vrais amis”
- Tous les mots sont traités de manière strictement égale
- Il n’existe aucun niveau de difficulté par mot

Progression réelle :

- variété des pièges rencontrés
- capacité du joueur à les reconnaître

---

## 6. Tirage, ratio & variance (verrouillé V2)

### 6.1 Pool de contenu

- Pool global : **100 word traps**
- Composition interne : \~60% faux amis / \~40% “pas des faux amis” (non exposé à l’UI)
- Tirage aléatoire
- Aucune alternance forcée
- Aucune différence free / premium

### 6.2 Anti‑répétition “jusqu’à épuisement” (globale, tous runs confondus)

Règle :

- Tant que le joueur n’a pas vu les 100 mots, chaque nouveau mot est tiré uniquement parmi les mots non encore vus
- Une fois les 100 mots vus au moins une fois, les runs continuent avec un tirage aléatoire dans le même pool

Conséquence assumée :

- le jeu est aléatoire, mais **jamais répétitif inutilement** avant épuisement
- après épuisement : répétitions autorisées (tirage aléatoire standard)

Décisions non négociables :

- Aucun lissage intra-run
- Aucune dérive progressive du ratio

---

## 7. Fin de run — UI & messages

### 7.1 Écran de fin (standard)

À la fin de chaque run, l’écran affiche :

- **Game over**
- **You used all 3 chances.**
- **Score: X French Points**

Définition stable :

- 1 French Point = 1 word trap correctement identifié
- Aucun bonus, aucun multiplicateur
- Le total de questions vues n’est jamais affiché

### 7.2 Personal best (célébration + premium)

Règle clé conversion :

- Si **nouveau record**, tous les joueurs (free inclus) voient :
  - **🏆 New best: X French Points!**

Premium uniquement :

- Accès à l’écran **Personal best** (historique local)

---

## 8. Free vs Premium (monétisation)

### 8.1 Free

- 2 runs gratuits
- Fin du run 1 : *1 free run left*
- Fin du run 2 : paywall
- Après run 2 : **Grace run immédiat** (one time)
- Affiché immédiatement après le run 2
- Message de cadrage : *You seem into it. Here’s one last free run.*
- Le grace run est **unique** (après usage, plus jamais de gratuit)
- Aucun retour le lendemain, aucun reset journalier

### 8.2 Premium

Le premium ne modifie **ni les règles, ni la difficulté, ni le contenu**.

Il débloque uniquement :

- **Unlimited runs**
- **Practice mode (Mistakes only)** (mode practice, sans pression)
- **Personal best tracking** (historique local)

Décisions V2 verrouillées :

- Aucun mode Easy / Hard
- Aucune règle alternative réservée au premium

---

## 9. Copy officielle V2 (in‑game + externe)

### 9.1 Règle lexicale fondamentale (tableau normatif)

| Contexte                | "Faux amis" | "Word traps" |
| ----------------------- | ----------- | ------------ |
| Nom du jeu              | ❌           | ✅            |
| Landing (accroche)      | ✅           | ✅            |
| SEO / Meta              | ✅           | ✅            |
| Store / App description | ✅           | ✅            |
| In-game (UI)            | ❌           | ✅            |
| Feedback                | ❌           | ✅            |
| Paywall                 | ❌           | ✅            |
| Practice                | ❌           | ✅            |

Règle absolue (clarification V2) :

- **"In-game" = tous les écrans après clic sur "Start a run"**.
- Cela inclut : run, feedback, Game over, paywall, practice, personal best.
- **"Faux amis" n’apparaît jamais in-game.**
- **"Faux amis" est autorisé uniquement avant le jeu** (landing, SEO, store).
- **"Word traps" est le seul vocabulaire gameplay.**

### 9.2 Cadrage (premier run — une seule fois)

Objectif : expliquer tirage + anti-répétition, sans jargon, sans négation.

> **Words are picked in a random order from 100 French word traps.**\
> **You’ll see all 100 before any repeats.**\
> **After that, runs keep drawing from the same 100.**

*(Random = fair, not rigged. No tricks.)*\*

### 9.3 Positionnement anti‑IA / anti‑manipulation (trust)

> **There’s no opponent, no AI, no tricks.**\
> **Just words — and your French.**

### 9.4 Tagline (option landing)

**Random order. Real French. Good luck.**

Règles :

- Landing uniquement (0 ou 1 occurrence)
- Pas in-run

### 9.5 Promesse d’apprentissage (bornée, honnête)

> **You get better at spotting French word traps.**

Usage : landing / about / store uniquement.\
Interdit : in-run, paywall.

---

## 10. Paywall — Version finale V2 (copy + hiérarchie visuelle)

Objectif : convertir sans manipulation.

### 10.1 Écran Paywall — structure

**Zone A — Headline (H1)**

> *Want to try another run?*

**Zone B — Value (H2 + bullets)**

- Play **unlimited runs**
- **Access Practice mode (Mistakes only)**
- See your **personal best history** (stored on this device)

**Zone C — Trust (bloc secondaire, compact)**

> **Same words. Same rules. Just more runs.**

- One-time purchase. No subscription.
- No ads. Ever.
- No signup required.
- Secure payment handled by Stripe.

**Zone D — CTA**

- CTA primaire : **Upgrade to unlimited runs**
- CTA secondaire : **Not now**

**Zone E — Alternative gratuite (si activée)**

- Si la mécanique inclut un “last free run” :
  - *Get one last free run now.* (one time)

Règles :

- Le bloc **Same words...** reste un **signal d’équité** (pas un argument de vente).
- La vente se fait via **Zone B** (valeur concrète) + **Zone D** (CTA).
- “Stripe” uniquement si c’est strictement vrai pour ce flux.

### 10.2 Notes copy (pour éviter l’effet “pas vendeur”)

- “Same words. Same rules. Just more runs.” n’est pas censé “vendre”.
- Il sert à **désamorcer** : “premium = plus facile” / “c’est truqué”.
- Si tu veux un ton plus “jeu” sans perdre l’éthique, garde cette ligne en Trust (Zone C) et renforce la Zone B, pas l’inverse.

## 11. Parcours écran par écran — hiérarchie visuelle (verrouillée)

Objectif : une hiérarchie **lisible sur mobile**, orientée action, sans surcharge.

### 11.1 Landing / Home

**Hiérarchie**

1. H1 : **Word Traps**
2. H2 (accroche) : **Faux ami or true friend? 100 French words. 3 chances.**
3. CTA primaire : **Start a run**
4. Micro-trust (option, 1 ligne max) : *No ads. No signup.*
5. Tagline (option) : *Random order. Real French. Good luck.*

**Référence** : Wordle (sobriété + 1 action).

### 11.2 In-run

**Hiérarchie**

1. Stimulus central : **le mot** (ex. “Librairie”)
2. Actions : boutons **True / False** côte à côte (taille égale)
3. Statut primaire : **Chances: X** (haut droite)
4. Statut secondaire : **Score: X FP** (haut gauche)
5. Feedback (après clic) : 1 phrase max, sous les boutons

**Référence** : arcade classique (Score + vies).

### 11.3 Feedback (après réponse)

**Hiérarchie**

1. Verdict UI (visuel léger sur les boutons, sans drama)
2. Texte feedback : **1 phrase**, identique quelle que soit la réponse
3. CTA implicite : continuer automatiquement (pas de bouton “Next” si déjà acté)

**Référence** : Duolingo (bloc distinct, neutre).

### 11.4 Fin de run (Game over)

**Hiérarchie**

1. Titre : **Game over**
2. Ligne statut : **Chances: 0** (ou “You used all 3 chances.”)
3. Score (forme longue) : **Score: X French Points**
4. Célébration (si record, free inclus) : **🏆 New best: X French Points!**
5. CTA primaire : **Start a new run**
6. CTAs premium : **Practice mode (Mistakes only)**, **Personal best**

**Référence** : Flappy Bird (clarté + redémarrage).

### 11.5 Paywall

**Hiérarchie**

1. Headline : **Want to try another run?**
2. Valeur : 3 bullets (unlimited / practice / personal best history)
3. Trust : **Same words. Same rules. Just more runs.**
4. CTA primaire : **Upgrade to unlimited runs**
5. CTA secondaire : **Not now**
6. Alternative gratuite (si activée) : *Get one last free run now. (one time)*

**Références** : Headspace (one-time) + Monument Valley (calme).

### 11.6 Practice mode (Mistakes only)

**Hiérarchie**

1. Indication mode : **Practice mode** (petit label)
2. Mot central
3. Boutons True / False
4. Chances : **désactivées** (ou affichées mais neutres, non consommées)
5. Score : optionnel (discret), sinon absent

**Référence** : Lichess (practice sans pression).

### 11.7 Personal best (premium)

**Hiérarchie**

1. Titre : **Personal best**
2. Meilleur score (forme longue) : **Best: Y French Points**
3. Historique minimal (si prévu) : liste courte, local-only
4. CTA : retour / new run

**Référence** : Temple Run / Alto’s Adventure (stats simples).

---

## 12. Inspirations UI par écran (références verrouillées)

### 12.1 Landing / Entry screen

**Référence : Wordle**

- minimalisme
- sérieux
- une action primaire (Start a run)

### 12.2 In-run (principal)

**Référence : Arcade classique (Pac-Man / Mario)**

- pattern score + vies
- 2 infos = trivial

### 12.3 Feedback après réponse

**Référence : Duolingo (version neutre)**

- bloc distinct
- 1 phrase max
- ton factuel

### 12.4 Fin de run

**Référence : Flappy Bird (Game over)**

- “Game over” + score
- célébration record

### 12.5 Paywall

**Références : Headspace (one-time) + Monument Valley**

- calme
- éthique
- alternative gratuite claire

### 12.6 Practice mode (Mistakes only)

**Référence : Lichess (practice)**

- même UI que le run
- pas de pression

### 12.7 Personal best (premium)

**Référence : Alto’s Adventure / Temple Run**

- carte simple
- historique minimal local

## 13. SEO / Meta / Store (V2)

### 13.1 Mots‑clés SEO (prioritaires)

- french false friends
- faux amis français anglais
- french words that look like english
- french vocabulary traps
- learn french false friends

Note : "word traps" n’est pas un mot‑clé SEO principal. C’est du branding.

### 13.2 Meta description (site / landing)

> **Spot French false friends and word traps in a fast, fair learning game.**\
> 100 French words. Random order. 3 chances. No ads. No account.

### 13.3 Store description (courte)

> Word Traps is a learning game about French false friends.
>
> You are shown French words that look familiar in English — some are traps, some are not.
>
> You have 3 chances. One wrong judgment at a time.
>
> No ads. No account. One-time purchase.

---

## 14. Ce qui est explicitement exclu (V2)

- Sessions fixes
- Timer
- Streaks
- Leaderboard global
- Comparaison sociale
- Difficulté cachée
- Modes Easy / Hard
- Paramètres de difficulté différenciés free / premium

---

## 15. Config-first (principe d’implémentation)

Objectif : pouvoir ajuster **copy**, **paramètres**, **mécanique** sans toucher au reste du code.

Tout ce qui suit doit être configurable :

- Nombre de chances (3)
- Libellés UI (Chances, Score, French Points)
- Copy (cadrage first run, paywall, trust block)
- Free runs (2) + grace run (1, immédiat)
- Noms des modes (Practice mode (Mistakes only))
- Tagline landing
- Textes fallback (erreurs réseau, contenu manquant)

---

## 16. Architecture de configuration (source de vérité unique)

### Décision

Le projet utilise **un seul fichier de configuration** comme source de vérité unique. Aucun éclatement en plusieurs fichiers.

Objectif :

- lisibilité produit
- contrôle UX
- modification rapide sans risque

---

### Principe fondamental

Le fichier de configuration est structuré en **sections strictes**, qui ne doivent jamais se mélanger.

- Les **règles du jeu** sont séparées du **langage utilisateur**.
- La copie n’encode jamais une règle.
- Une règle n’encode jamais de texte visible.

Ce fichier agit comme un **contrat produit lisible**, pas comme un simple objet technique.

---

### Structure normative (ordre verrouillé)

1. **GAME** — règles fondamentales (mécanique)
2. **MODES / LIMITS** — accès, gratuité, premium
3. **STORAGE** — persistance locale et états
4. **UI** — labels courts affichés à l’écran
5. **COPY** — textes longs (landing, paywall, trust)

L’ordre est intentionnel : il permet de lire le produit **du plus invariant au plus éditorial**.

---

### Exemple de structure canonique

```js
const WT_CONFIG = {

  GAME: {
    MAX_CHANCES: 3,
    POOL_SIZE: 100,
    ANTI_REPETITION: true,
    SCORE_UNIT: "FRENCH_POINTS"
  },

  MODES: {
    RUN: true,
    PRACTICE: {
      ENABLED: true,
      NAME: "Practice mode (Mistakes only)"
    }
  },

  LIMITS: {
    FREE_RUNS: 2,
    GRACE_RUN: 1
  },

  STORAGE: {
    KEY: "wordtraps_v2",
    TRACK_PERSONAL_BEST: true
  },

  UI: {
    CHANCES_LABEL: "Chances",
    SCORE_LABEL: "Score",
    SCORE_UNIT_LABEL: "French Points",
    TRUE_LABEL: "True",
    FALSE_LABEL: "False",
    GAME_OVER: "Game over"
  },

  COPY: {
    LANDING: {
      TITLE: "Word Traps",
      SUBTITLE: "Faux ami or true friend? 100 French words. 3 chances."
    },

    FIRST_RUN: {
      FRAMING: [
        "Words are picked from a pool of 100 French word traps.",
        "You’ll see them all before any repeats."
      ]
    },

    PAYWALL: {
      HEADLINE: "Want to try another run?",
      VALUE: [
        "Unlimited runs",
        "Practice mode",
        "Personal best history"
      ],
      TRUST: [
        "Same words. Same rules.",
        "No ads. No signup.",
        "One-time purchase."
      ]
    }
  }
};
```

---

### Règles de gouvernance

- Aucun texte utilisateur ne doit être hardcodé hors de `UI` ou `COPY`.
- Aucun chiffre de règle ne doit apparaître dans `COPY`.
- Toute modification de règle implique une relecture UX.
- Toute modification de copy n’impacte jamais la mécanique.

---

### Bénéfice clé

Cette architecture garantit :

- cohérence UX
- confiance produit
- itération rapide sans régression

Elle est considérée comme **verrouillée pour V2**.

## Conclusion

Le cadrage V2 est **complet, cohérent et exploitable** :

- gameplay RUN verrouillé
- tension par **3 chances** (arcade)
- score **en French Points** (identité)
- anti‑répétition globale jusqu’à épuisement
- monétisation honnête par rejouabilité
- acquisition SEO efficace sans polluer l’in‑game

👉 Document prêt pour implémentation **sans zones grises** et avec une approche **config-first**.

