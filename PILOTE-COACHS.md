# Pilote avec un coach

Choisir un coach et un groupe WhatsApp après une séance. Générer son lien sur https://www.pickleballrulesquiz.com/clubs/ en choisissant Coach et Français. Exemple de lien pour un seul test pilote.

https://www.pickleballrulesquiz.com/fr.html?wt-source=coach-pilote-fr

## Message à copier

Vous savez trancher cinq situations réelles de pickleball ? Essayez le défi et découvrez la règle après chaque réponse. Deux parties gratuites, sans inscription.

Ajouter le lien du coach à la fin du message.

## Bilan après sept jours

1. Dans GoatCounter, filtrer sur le segment `src-coach-…` du lien utilisé.
2. Comparer `landing-view`, `run-start` et `run-complete`. Les nouveaux segments `free-run-1` et `free-run-2` distinguent les deux parties. Pour la série standard, exclure les chemins avec `challenge-daily` ou `challenge-friend`.
3. Lire `second-run-return` comme un clic immédiat depuis le résultat. `return-after-play/day-1` et `return-after-play/day-2-plus` mesurent une visite après un jour UTC différent de la dernière partie enregistrée sur cet appareil, hors entraînement et Mode Rapide. Ce sont des comptages agrégés, pas une cohorte nominative.
4. Comparer `paywall-view` et `checkout-start` pour estimer l’intérêt. Consulter Stripe pour les achats confirmés. Les retours sans lien tagué peuvent apparaître comme trafic direct.

Le premier signal à regarder est le nombre de premières parties terminées. Puis demander au coach ce que ses joueurs ont fait après le score. Un petit volume suffit à repérer une friction pendant un essai, mais pas à conclure sur la conversion.
