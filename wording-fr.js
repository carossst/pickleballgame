// wording-fr.js — French wording bank
// Loaded BEFORE i18n.js. Registers itself into window.WT_WORDING_ALL.fr.
// Translation rules (see GLOSSARY_FR.md):
//   - Vouvoiement (vous), apostrophe droite ', concision mobile-first
//   - Template variables {var} preserved
//   - Glossary terms: service / retour de service / échange / faute / balle morte /
//     zone de non-volée / simple / double / Mode Erreurs / Mode Rapide / etc.
(() => {
  'use strict';
  window.WT_WORDING_ALL = window.WT_WORDING_ALL || {};
  window.WT_WORDING_ALL.fr = {
    brand: {
      creatorLine: 'Un jeu indépendant créé par Carole',
      creatorLineHtml:
        'Un jeu indépendant créé par <a href="./press.html">Carole</a><br><a href="https://bonjourpickleball.fr/" target="_blank" rel="noopener">Bonjour Pickleball</a>'
    },

    common: {
      skipToMain: 'Aller au contenu principal',
      home: 'Accueil',
      homeAria: 'Accueil de Quiz Pickleball',
      homeHref: './fr.html',
      gameContentAria: 'Contenu du jeu Quiz Pickleball',
      contactUs: 'Nous contacter',
      copyrightLine: '© 2026 Bonjour Pickleball',
      tagLabels: {
        '2026 Changes': 'les changements de règles de 2026',
        'The Net': 'le jeu au filet',
        'Score & Readiness': 'le score et la préparation',
        'Serving Rules': 'les règles du service',
        'Line Calls': 'les annonces de ligne',
        'Faults & Dead Ball': 'les fautes et balles mortes',
        'Non-Volley Zone': 'la zone de non-volée',
        'Player Conduct & Apparel': 'la conduite des joueurs',
        'Rally Situations': "les situations d'échange",
        'Court & Equipment': "le terrain et l'équipement"
      }
    },

    meta: {
      indexTitle: 'Quiz Pickleball',
      indexDescription:
        'Vous croyez connaître le pickleball ? Prouvez-le. Un jeu rapide de vrai ou faux sur les règles : service, fautes, score, annonces de ligne, changements de règles.',
      successTitle: 'Accès complet activé - Quiz Pickleball',
      successDescription:
        'Paiement réussi. Votre code de déverrouillage Quiz Pickleball est prêt.',
      pressTitle: 'Presse - Quiz Pickleball',
      pressDescription: 'Dossier de presse de Quiz Pickleball.',
      privacyTitle: 'Politique de confidentialité - Quiz Pickleball',
      privacyDescription: 'Politique de confidentialité de Quiz Pickleball.',
      termsTitle: "Conditions d'utilisation - Quiz Pickleball",
      termsDescription: "Conditions d'utilisation de Quiz Pickleball.",
      notFoundTitle: 'Page introuvable - Quiz Pickleball',
      notFoundDescription: 'Page introuvable. Retournez à Quiz Pickleball.'
    },

    i18nToggle: {
      switchToTemplate: 'Passer en {locale}',
      selectorLabel: 'Choix de langue',
      languageNames: {
        en: 'anglais',
        fr: 'français'
      }
    },

    system: {
      close: 'Fermer',
      home: 'Accueil',
      versionPrefix: '',

      loadingTitle: 'Chargement de Quiz Pickleball...',
      loadingIcon: '',
      loadingHint: 'Préparation de votre quiz sur les règles du pickleball',
      loadingSlowHint:
        'Toujours en cours... Vérifiez votre connexion si ça dure.',
      loadingSlowHints: [
        'Vérification de la zone de non-volée...',
        "Vérification d'annonces de ligne très serrées...",
        "Préparation d'un Erne pas indispensable..."
      ],
      updateAvailable: 'Nouvelle version disponible.',
      updateNow: "Recharger l'application",

      offlinePayment: 'Le paiement nécessite une connexion Internet.',
      copied: 'Copié',
      copyFailed: 'Échec de la copie',
      downloaded: 'Téléchargé',
      more: 'Comment jouer',
      open: 'Ouvrir',
      speakQuestion: 'Lire la question',
      replayQuestion: 'Relire la question',
      stopQuestion: 'Arrêter la lecture',
      speakQuestionAria: 'Lire la question actuelle à voix haute',
      replayQuestionAria: 'Relire la question actuelle à voix haute',
      stopQuestionAria: 'Arrêter la lecture de la question actuelle',
      notNow: 'Plus tard',
      continue: 'Suivant',
      tapToContinue: '',

      youChosePrefix: 'Vous avez choisi :',

      playAria: 'Lancer une nouvelle partie',
      shareAria: 'Partager le jeu',
      resultGridAria: 'Grille de résultats',
      scoreAria: 'Score',
      endActionsAria: 'Actions de fin de partie',
      shareCardAria: 'Partager le jeu',
      premiumUnlockedToast: 'Accès complet débloqué',
      storageSaveFailedToast:
        "L'enregistrement est désactivé dans ce mode de navigation. Votre progression peut être perdue si vous actualisez la page.",
      confirmLeaveRun:
        'Quitter la partie en cours ? Votre progression sera perdue.',
      fatalReload: 'Recharger',
      fatalLoadFailed: 'Impossible de charger le jeu. Actualisez la page.',
      fatalUnexpected: 'Un problème inattendu est survenu. Actualisez la page.',
      fatalJavascriptPrefix: 'Erreur JavaScript : {message}',
      fatalPromisePrefix: 'Erreur de promesse : {message}',
      fatalConfigMissing:
        "Erreur de configuration : les paramètres de l'application n'ont pas été chargés.",
      fatalWordingMissing:
        "Erreur de configuration : les textes de l'interface n'ont pas été chargés.",
      fatalStorageUnsupported:
        'Votre navigateur ne prend pas en charge le stockage local. Utilisez un navigateur récent.',
      fatalAppContainerMissing:
        "Erreur critique : conteneur d'application introuvable.",
      fatalComponentsMissing:
        'Impossible de charger les composants du jeu : {components}. Actualisez la page.',
      fatalIconsMissing:
        'Impossible de charger les composants du jeu : WT_ICONS.renderIcon. Actualisez la page.',
      fatalContentUnavailable:
        'Contenu indisponible. Vérifiez votre connexion et rechargez la page.',
      fatalDataLoadFailed:
        'Impossible de charger les données du jeu. Vérifiez votre connexion puis actualisez la page.',
      momentumAria: 'Progression {filled}/{segments}'
    },

    footer: {
      rulebookNote: 'Règlement officiel USA Pickleball',
      contact: 'Contact',
      privacy: 'Confidentialité',
      terms: 'Conditions',
      press: 'Presse',

      links: {
        bonjourPickleball: {
          label: 'Bonjour Pickleball',
          href: 'https://bonjourpickleball.fr/'
        }
      }
    },

    success: {
      title: 'Paiement réussi',
      subtitle:
        "Votre code de déverrouillage est prêt. Utilisez-le dans le jeu pour activer l'accès complet sur cet appareil.",
      deviceBadge: 'UN APPAREIL',

      codeLabel: 'Votre code de déverrouillage',
      clearDataWarning:
        "Ce déverrouillage est enregistré sur cet appareil. Gardez le code au cas où vous effaceriez vos données ou changeriez d'appareil.",

      howToActivateTitle: 'Comment activer',
      howToActivateStep1: 'Retournez dans le jeu.',
      howToActivateStep2Prefix: 'Appuyez sur',
      howToPlayLabel: 'Comment jouer',
      activateWithCodeLabel: 'Utiliser un code de déverrouillage',
      howToActivateStep3Prefix: 'Collez votre code et appuyez sur',
      activateLabel: 'Activer',

      whatYouGetTitle: "Ce que l'accès complet inclut",
      benefitFullAccessPrefix: 'Accès complet à toutes les',
      benefitFullAccessStrongSuffix: ' questions',
      benefitFullAccessSuffix: ' de ce jeu.',
      benefitUnlimited: 'Parties illimitées sur cet appareil après activation.',

      ctaBackToGame: 'Ouvrir le jeu',
      ctaDownload: 'Télécharger le code (.txt)',
      shortcutHint:
        'Dans le jeu : Comment jouer -> Utiliser un code de déverrouillage.',

      thankYouLine: 'Merci de soutenir Quiz Pickleball. Votre code est prêt.',
      supportLabel: "Besoin d'aide ?",

      copyCta: 'Copier le code',
      copyAgainCta: 'Copier le code à nouveau',
      tipNoRecover:
        'Astuce : gardez ce code en lieu sûr comme sauvegarde de votre déverrouillage.',
      txtTitle: 'Votre code de déverrouillage Quiz Pickleball',
      txtSaveLine:
        'Astuce : gardez ce code en lieu sûr si vous voulez une sauvegarde.',
      txtNoRecoverLine:
        "Vous n'en aurez besoin à nouveau que si vous effacez vos données ou changez d'appareil.",

      cheatSheetTitle: '',
      cheatSheetBody: ''
    },

    landing: {
      title: 'Quiz Pickleball',
      tagline: '**Vous croyez connaître le pickleball ? Prouvez-le.**',
      subtitle:
        'Un jeu rapide de vrai ou faux sur les règles du pickleball.\nDes questions sur le service, les fautes, le score, les annonces de ligne et les changements de règles.',
      microFun: 'Parties courtes · Sans inscription · Essai gratuit',
      microTrust: 'Installez-la après votre première partie.',

      runsLabel: '',
      runsFreeMode: '',

      ctaPlay: 'Jouer maintenant',
      ctaPlayAfterFirstRun: 'Rejouer',
      ctaHow: 'Comment jouer',
      statsSeenLabel: 'Questions vues',

      statsSeenSummaryTemplate: 'Questions vues : {seen}',
      statsPhaseBadgeDiscovery: 'Continuez',
      statsPhaseBadgeCorrection: 'Corriger les erreurs',
      statsPhaseBadgeConsolidation: 'Test sous pression',

      statsSeenCompleteLabel: 'Progression du quiz',
      statsMistakesLabel: 'Erreurs',
      statsMistakesSummaryTemplate: '{mistakes}',
      statsMasterySummaryTemplate: 'Bonnes réponses : {mastered}',
      personalBestBadge: 'MEILLEUR SCORE',
      personalBestTitleTemplate: 'Palier actuel : {tier}',
      personalBestSubTemplate:
        'Meilleur score : {best}. Prochain palier à {nextTarget}+.',
      personalBestTopTierTemplate:
        'Meilleur score : {best}. Vous avez atteint le plus haut palier.',
      personalBestFirstTitle: 'Enregistrez votre score',
      personalBestFirstSubTemplate:
        'Marquez {nextTarget}+ pour débloquer votre premier palier.',
      personalBestLockedTitle: 'Enregistrez votre score',
      personalBestLockedSub:
        "Débloquez l'accès complet pour enregistrer votre score et faire progresser votre meilleur résultat.",
      progressSectionTitle: 'À FAIRE',
      progressSectionBody: '',
      dailyChallengeBadge: 'OBJECTIF DU JOUR',
      dailyChallengeTitleTemplate: "Atteignez {targetScore}+ aujourd'hui",
      dailyChallengeProgressTemplate:
        "Aujourd'hui : {score}/{targetScore}. Record : {best}. Nouvel objectif à {resetTime}, votre heure locale.",
      dailyChallengeResetTemplate:
        'Record : {best}. Nouvel objectif à {resetTime}, votre heure locale.',
      dailyChallengeCompletedTemplate:
        "Terminé aujourd'hui. Record : {best}. Revenez à {resetTime}, votre heure locale, pour le prochain objectif.",
      dailyChallengeRewardTemplate:
        'Récompense : 1 ticket Mode Rapide.',
      dailyChallengeRewardCappedTemplate:
        'Tickets au maximum. Dépensez-en un pour en regagner.',
      dailyChallengeRewardPendingTemplate:
        "Déjà réussi une fois. Réussissez-le à nouveau sur votre dernière run gratuite pour gagner 1 ticket Mode Rapide.",
      dailyChallengeCta: 'Commencer',

      postPaywallTitle: 'Votre aperçu gratuit est terminé.',
      postPaywallBody:
        "Débloquez des RUNs illimitées, enregistrez votre score, accédez aux 200 questions du jeu sur les règles du pickleball, aux explications après chaque réponse et au Mode Erreurs illimité.",
      practiceCtaTemplate: 'Corrigez vos {count} erreur{pluralS}',
      postPaywallCta: "Débloquer l'accès complet",

      postPaywallSbTitle: 'Le défi du jour est actif',
      postPaywallSbBody:
        "Débloquez l'accès complet pour continuer à viser le défi du jour et gagner des tickets Mode Rapide."
    },

    leaderboard: {
      cardTitle: 'CETTE SEMAINE',
      cardSubDefault:
        'Classement public des RUNs. Ajoutez votre pseudo public après votre première run terminée.',
      cardSubJoined:
        'Classement public des RUNs. Votre meilleure RUN peut apparaître ici.',
      cardCtaJoin: 'Choisir un pseudo public',
      cardCtaView: 'Voir le classement',
      statusBadge: 'MIS À JOUR',
      lastUpdatedTemplate: 'Dernière mise à jour : {time}',
      nextRefreshTemplate: 'Prochaine actualisation : {time}',
      weeklyResetLine:
        'Remise à zéro hebdomadaire : {localTime}, votre heure locale (lundi 00:00 UTC).',
      loading: 'Chargement du classement...',
      empty: 'Aucun score public pour le moment.',
      modalTitle: 'Classement',
      modalBodyDefault:
        'Choisissez un pseudo public. Votre meilleur score en RUN pourra apparaître dans le classement hebdomadaire et all-time.',
      modalBodyJoined:
        'Votre meilleur score en RUN peut apparaître dans le classement hebdomadaire et all-time.',
      rankingTab: 'Classement',
      profileTab: 'Mon pseudo',
      weeklyTitle: 'Cette semaine',
      allTitle: 'All-time',
      nicknameLabel: 'Pseudo public',
      nicknamePlaceholder: 'Choisissez un pseudo',
      joinCta: 'Rejoindre le classement',
      updateCta: 'Mettre à jour le pseudo',
      leaveCta: 'Quitter le classement',
      nicknameRequiredToast: "Ajoutez d'abord un pseudo.",
      nicknameTooShortToast: 'Le pseudo doit contenir au moins 3 caractères.',
      nicknameInvalidCharsToast:
        'Utilisez seulement des lettres, chiffres, espaces, tirets ou underscores.',
      saveOkToast: 'Pseudo de classement enregistré.',
      leftToast: 'Vous avez quitté le classement sur cet appareil.',
      remoteSaveErrorToast:
        'Pseudo enregistré sur cet appareil. La synchro distante pourra être branchée ensuite.',
      rankToastWeekly: 'Rang public cette semaine : #{rank}.',
      scoreRejectedToast:
        "Cette RUN n'a pas été ajoutée au classement public cette fois."
    },

    firstRun: {
      titleRun1: 'Comment jouer',
      titleRun2: 'Petit rappel',
      titleRun3: 'Dernier conseil avant de jouer',

      run1Lines: [
        'Vous voyez les règles du pickleball une par une.\nDécidez si chacune est vraie ou fausse.',
        'Bonne réponse : +1 point.',
        'Mauvaise réponse : +1 erreur.',
        'Après {maxChances} erreurs, la partie est terminée.',
        "L'objectif ici, c'est d'apprendre les règles une par une."
      ],

      run2Lines: [
        'Il vous reste 1 dernière run gratuite.',
        'Le défi du jour est actif sur cette run.',
        'Réussissez-le pour gagner 1 ticket Mode Rapide.',
        'Après {maxChances} erreurs, la partie est terminée.',
        'Lisez attentivement.'
      ],

      run3Lines: [
        'La partie se termine après {maxChances} erreurs.',
        'Lisez attentivement.',
        'Répondez avec ce que vous savez.',
        'Vous croyez connaître le pickleball ? Prouvez-le.'
      ],

      ctaLabel: 'Jouer'
    },

    milestones: {
      quarter: {
        title: 'Premier quart terminé.',
        bodyLines: [
          'Vous avez vu le premier quart des questions.',
          'Continuez. Vous construisez votre base de règles.',
          'Continuez. Vous construisez votre base de règles.'
        ],
        cta: 'Suivant'
      },
      halfway: {
        title: 'Moitié atteinte.',
        bodyLines: [
          'Vous avez vu la moitié des questions.',
          'Continuez. Vous construisez votre base de règles.',
          "Voyez d'abord toutes les questions. Vous corrigerez ensuite ce qui vous piège encore."
        ],
        cta: 'Suivant'
      },
      threeQuarters: {
        title: 'Trois quarts terminés.',
        bodyLines: [
          'Vous avez vu trois quarts des questions.',
          "Vous approchez du tour complet des questions.",
          'Encore un effort, puis vous saurez exactement quoi retravailler.'
        ],
        cta: 'Suivant'
      }
    },

    phaseJourney: {
      discovery: {
        badge: 'Continuez',
        landingSummaryTemplate: 'Vous avez déjà vu {seen} questions.',
        landingDetailTemplate:
          'Il reste {remaining} questions dans le tour complet.',
        endLens:
          "Continuez. L'objectif est maintenant de voir plus de questions.",
        micropics: {
          streakStart: "3 d'affilée. Bonne lecture.",
          streakBuilding: "6 d'affilée. Bonne lecture.",
          streakStrong: "10 d'affilée. Des bases plus claires.",
          streakElite: "15 d'affilée. Vous les connaissez.",
          streakLegendary: "20 d'affilée. Belle série.",
          streakAgainTemplate: '{streak} encore.',
          recovery: "Voilà, c'est ça."
        }
      },
      correction: {
        badge: 'Corriger les erreurs',
        landingSummaryTemplate: 'Erreurs restantes : {mistakes}',
        landingDetail:
          'Vous avez vu toutes les questions. Corrigez maintenant les règles qui vous piègent encore.',
        endLens:
          'Vous avez vu toutes les questions. Corrigez maintenant les règles qui vous piègent encore.',
        micropics: {
          streakStart: "3 d'affilée. C'est mieux.",
          streakBuilding: "6 d'affilée. Ça s'éclaircit.",
          streakStrong: "10 d'affilée. Mieux maintenant.",
          streakElite: "15 d'affilée. Erreurs en baisse.",
          streakLegendary: "20 d'affilée. Belle correction.",
          streakAgainTemplate: '{streak} encore.',
          recovery: 'Vous repartez.'
        }
      },
      consolidation: {
        badge: 'Test sous pression',
        landingSummaryTemplate: 'Aucune erreur active',
        landingDetail:
          'Vos erreurs sont corrigées. Testez votre score en Mode Rapide.',
        endLens:
          'Vos erreurs sont corrigées. Testez votre score en Mode Rapide.',
        micropics: {
          streakStart: "3 d'affilée. Toujours clair.",
          streakBuilding: "6 d'affilée. Toujours clair.",
          streakStrong: "10 d'affilée. Ça tient.",
          streakElite: "15 d'affilée. Très clair.",
          streakLegendary: "20 d'affilée. Des bases solides.",
          streakAgainTemplate: '{streak} encore.',
          recovery: 'Vous repartez.'
        }
      }
    },

    levels: {
      modalTitle: 'Niveaux',
      placeholder: '',
      openDetailsAria: 'Ouvrir les détails du niveau',
      unlockKicker: 'Nouveau niveau',
      reachedTemplate: 'Vous avez atteint {label}.',
      currentLabel: 'Niveau actuel',
      unlockedByLabel: 'Ce que ça veut dire',
      nextLabel: 'Niveau suivant',
      reachItLabel: 'Comment débloquer',
      progressionLabel: 'Parcours complet',
      noLevelTitle: 'Verrouillé',
      noLevelBody: 'Terminez une partie pour débloquer votre premier niveau.',
      maxLevelBody: 'Vous avez atteint le niveau le plus haut.',
      currentPill: 'Vous êtes ici',
      unlockedPill: 'Débloqué',
      lockedPill: 'Verrouillé',
      byLevel: {
        1: {
          label: 'PRÊT À JOUER',
          unlock: 'Terminez une RUN.',
          sheetBody:
            'Vous avez terminé votre première RUN. Votre progression commence vraiment.'
        },
        2: {
          label: 'NIVEAU CLUB',
          unlock: 'Voyez toutes les questions une fois et corrigez toutes les erreurs actives.',
          sheetBody:
            'Vous avez corrigé vos erreurs actives. Votre connaissance des règles devient fiable.'
        },
        3: {
          label: 'NIVEAU COMPÉTITION',
          unlock:
            'Construisez une sélection Mode Rapide de 16 questions ou plus et réussissez une partie à 70% ou plus.',
          sheetBody:
            'Vous avez prouvé votre connaissance des règles sous la pression du Mode Rapide.'
        },
        4: {
          label: 'NIVEAU PRO',
          unlock:
            'Construisez une sélection Mode Rapide de 50 questions ou plus et réussissez une partie à 85% ou plus.',
          sheetBody:
            'Vous avez atteint le niveau le plus haut. Gardez vos règles affûtées.'
        }
      }
    },

    ui: {
      chancesLabel: 'Erreurs',
      mistakesLabel: 'Erreurs',
      scoreLabel: 'Score',
      scoreAriaTemplate: 'Score : {score} {fpShort}',
      fpShort: '',
      fpLong: '',
      trueLabel: 'Vrai',
      falseLabel: 'Faux',
      gameOverTitle: 'Partie terminée',

      contentLoadingToast: 'Chargement des questions...',
      poolReshuffledToast: 'Questions mélangées à nouveau. Nouvel ordre.',
      seenProgressTemplate: 'Vous avez vu {seen}/{poolSize} questions.',

      startRunTypeFree: 'Votre première partie gratuite',
      startRunTypeLastFree: 'Dernière partie gratuite. Donnez le meilleur',
      startRunTypeUnlimited: '',
      startRunTypePractice: 'Mode Erreurs',

      startRunChancesOverlay:
        'Bonne réponse : +1 point.\nMauvaise réponse : +1 erreur.\nLa partie se termine après {maxChances} erreurs.',
      startOverlayTapAnywhere: "Appuyez n'importe où pour commencer",
      dailyChallengeStartOverlayLabel: 'Le défi du jour est actif',
      dailyChallengeStartOverlayLineTemplate:
        '{targetScore}+ au score = +1 ticket Mode Rapide',

      lastChanceOverlay: "Plus qu'une erreur autorisée.",
      gameOverOverlay: 'Partie terminée.',

      chanceLostDeltaText: '-1',
      mistakeGainedDeltaText: '+1',
      scoreGainedDeltaText: '+1',

      bestScoreLabel: 'Record',
      bestScoreAriaTemplate: 'Record : {best}'
    },

    secretBonus: {
      chestAria: 'Mode Rapide',
      ticketBadgeAriaTemplate: 'Tickets Mode Rapide : {tickets}/{cap}',
      chestHint: '',
      starterTicketToast:
        "1 ticket Mode Rapide ajouté. Vous pouvez l'utiliser maintenant.",
      noSeenWordsToast:
        "Le Mode Rapide est vide pour l'instant. Jouez quelques parties pour construire votre sélection.",
      badge: 'MODE RAPIDE',

      endTitle: '',
      scoreLine: 'Score : {score}',
      endStatsLine: 'Bonnes réponses : {cleared}/{shown}.',
      endStatsLineOne: 'Bonnes réponses : {cleared}/{shown}.',
      endDeckSizeLine: 'Sélection Mode Rapide : {count} questions.',
      endDeckSizeLineOne: 'Sélection Mode Rapide : 1 question.',
      endPoolProgressTemplate: '{cleared}/{shown} correctes sur ce tour.',
      endDeckExhaustedToast: 'Toutes les questions disponibles ont été jouées.',
      mistakesTitle: 'Questions à revoir',
      mistakesToggle: '{count} erreurs',
      mistakesNone: 'Aucune erreur.',

      newBest: 'NOUVEAU MEILLEUR SCORE.',
      celebrationPerfect: 'PARTIE PARFAITE',
      labelByTier: {
        perfect: 'RAPIDE ET PROPRE',
        high: 'MAINS RAPIDES',
        medium: 'TROUVEZ VOTRE RYTHME',
        low: 'VÉRIFIEZ VOTRE RYTHME'
      },

      endByTier: {
        perfect: [
          "Vous l'avez prouvé sous la pression.",
          'Vous avez répondu à ces questions instantanément.'
        ],
        high: [
          'Vous avez tenu sous la pression.',
          'Votre connaissance des règles a bien tenu.'
        ],
        medium: [
          'Vous avez trouvé votre rythme.',
          'Ce mode récompense un rappel solide des règles.'
        ],
        low: [
          'Le rythme vous a devancé.',
          'Ici il faut à la fois la mémoire et le contrôle.'
        ]
      },
      endLineZero: 'Le rythme vous a devancé cette fois.',

      endRecoByTier: {
        perfect_small:
          'Élargissez votre sélection pour débloquer plus de questions en Mode Rapide.',
        perfect_medium: 'Rejouez pour garder cet avantage.',
        perfect_large: 'Votre sélection Mode Rapide est solide : continuez.',
        high_small:
          'Élargissez votre sélection pour débloquer plus de questions en Mode Rapide.',
        high_medium: 'Réessayez pour ancrer celles que vous avez ratées.',
        high_large: "Restez en Mode Rapide : c'était une belle partie.",
        medium_small:
          "Élargissez d'abord votre sélection. Plus de questions vues = Mode Rapide plus solide.",
        medium_medium:
          'Refaites une partie en Mode Rapide pour renforcer votre rappel.',
        medium_large: "Continuez. La mémoire s'ancre avec la répétition.",
        low_small:
          "Élargissez d'abord votre sélection. Plus de questions vues = Mode Rapide plus solide.",
        low_medium:
          'Refaites une partie en Mode Rapide pour reprendre confiance.',
        low_large: 'Réessayez : la mémoire vient avec la pratique.'
      },

      ctaByTier: {
        perfect: 'Continuez à le prouver',
        high: 'Restez en Mode Rapide',
        medium: 'Réessayez le Mode Rapide',
        low: 'Réessayez le Mode Rapide'
      },
      ctaExpandDeck: 'Élargir la sélection',

      startOverlayLine1: 'Mode Rapide.',
      startOverlayLine2: 'Uniquement les questions déjà vues.',
      startOverlayLine3: 'Jouez plus de parties pour agrandir votre sélection.',

      startOverlayFreeRunsLimitLine:
        '{tickets} ticket{pluralS} restant{pluralS}. Coût : {cost} ticket{costPluralS}.',

      freeLimitReachedTitle: 'Aucun ticket Mode Rapide disponible.',
      freeLimitReachedBody:
        "Le Mode Rapide coûte {cost} ticket{costPluralS}.\nJouez le défi du jour pour en gagner un, ou débloquez l'accès complet pour garder votre jeu principal ouvert.",
      freeLimitReachedCta: 'Continuer à jouer',
      freeLimitReachedClose: 'Plus tard',
      startOverlayTapAnywhere: "Appuyez n'importe où pour commencer",

      title: 'Quiz Pickleball',
      subtitle: 'Mode Rapide',
      questionPrompt: 'Vrai ou faux ?',
      dangerLineLabel: 'LIGNE LIMITE',
      dangerLineAria:
        "Ligne limite. Si la carte atteint cette ligne, l'élément est perdu.",
      seenOnlyLine: '{count} questions dans votre sélection Mode Rapide.',

      modalTitle: 'Mode Rapide',
      modalBody:
        "Le Mode Rapide est plus rapide et plus exigeant.\nIl n'utilise que les questions que vous avez déjà vues.\nCoût : {cost} ticket{costPluralS}.\nDisponible maintenant : {tickets}.",
      modalCta: 'Jouer en Mode Rapide (1 ticket)',
      ticketRequiredTitle: 'Aucun ticket Mode Rapide disponible.',
      ticketRequiredBodyDaily:
        "Le Mode Rapide coûte {cost} ticket{costPluralS}.\nVous en avez {tickets} pour l'instant.\nJouez le défi du jour pour en gagner un.",
      ticketRequiredBodySpentToday:
        "Le Mode Rapide coûte {cost} ticket{costPluralS}.\nVous en avez {tickets} pour l'instant.\nLe ticket du jour a déjà été réclamé. Revenez demain pour un nouveau défi et un nouveau ticket.",
      ticketRequiredBodyPremium:
        "Le Mode Rapide coûte {cost} ticket{costPluralS}.\nVous en avez {tickets} pour l'instant.\nJouez une run et réussissez le défi du jour pour en gagner un.",
      ticketRequiredBodyLocked:
        "Le Mode Rapide coûte {cost} ticket{costPluralS}.\nVous en avez {tickets} pour l'instant.\nVos runs gratuites sont terminées. Débloquez l'accès complet pour continuer à jouer et gagner plus de tickets.",
      ticketRequiredCtaDaily: 'Jouer le défi du jour',
      ticketRequiredCtaRun: 'Jouer une run',
      ticketRequiredCtaPaywall: "Débloquer l'accès complet",
      ticketRequiredClose: 'Plus tard'
    },

    practice: {
      title: 'Mode Erreurs',
      on: 'Activé',
      off: 'Désactivé',

      premiumOnly: 'Accès complet uniquement',
      descLocked: 'Rejouez les questions à retravailler.',
      valueLine: 'Concentrez-vous sur vos questions à retravailler.',
      descUnlocked: 'Uniquement les questions ratées précédemment.',

      freeLimitReachedTitle: 'Ça progresse.',
      freeLimitReachedBody:
        "Vous avez utilisé vos {limit} parties gratuites en Mode Erreurs.\n\nL'accès complet débloque le Mode Erreurs en illimité.\nContinuez à corriger ce qui vous manque.\nSans limite.",
      freeLimitReachedCta: 'Continuer à jouer',
      freeLimitReachedClose: 'Plus tard',

      endTitle: '',
      endLine: 'Continuez.',
      allFixedLine: 'Vous avez tout bouclé.',
      celebrationAllCleared: 'BELLE FINITION',
      labelByTier: {
        last: 'LA DERNIÈRE',
        light: 'BONNE RÉCUPÉRATION',
        firm: 'ÇA REVIENT',
        direct: 'TENEZ BON'
      },
      endLineAllFixed: 'Vous avez tout bouclé.',
      endLineZero: 'Ces questions demandent un autre passage.',
      endStatsLineAllFixed: 'Vous avez corrigé {fixed}.',
      endLineByTier: {
        last: 'Belle récupération.',
        light: 'Bonne récupération.',
        firm: "C'est du progrès.",
        direct: 'Vous progressez.'
      },
      endStatsLine: 'Vous avez corrigé {fixed}. Il vous en reste {remaining}.',

      endRepeatNoteByTier: {
        last: "Plus qu'une question. Bouclez-la maintenant.",
        light: '',
        firm: 'Quelques questions demandent un autre passage.',
        direct:
          'Restez en Mode Erreurs. Ce sont les questions qui demandent du travail.'
      },

      scoreLine: 'Score : {score}',
      playingProgressLine: '{current}/{total}',

      startRunChancesOverlayPractice:
        "Uniquement vos questions ratées.\nJusqu'à 10 par partie.\nCorrigez-la et elle sort. Ratez-la et elle revient.",
      startOverlayTapAnywhere: "Appuyez n'importe où pour commencer",
      ctaPracticeAgain: 'Refaire le Mode Erreurs',

      ctaRepeatByTier: {
        last: 'Corrigez la dernière question',
        light: 'Corrigez vos erreurs encore une fois',
        firm: 'Rejouer le Mode Erreurs',
        direct: 'Restez en Mode Erreurs'
      },

      playing: {
        questionLabel: 'Question',
        assertion: 'Cette affirmation est-elle vraie ou fausse ?',
        answersAria: 'Choix de réponse',
        questionHeadingTemplate: '',
        feedbackTitleOk: '',
        feedbackTitleBad: '',
        newBestScore: 'Nouveau meilleur score.',
        feedbackRelationSameTemplate: '{question}',
        feedbackRelationDifferentTemplate: '{question}'
      }
    },

    micropics: {
      runContinues: 'Bien joué. Continuez.',
      nearMiss: 'Tout près. Celle-là vous attendait.',
      repeatMistake: 'Celle-ci vous piège encore. Ralentissez et relisez.',
      streakStart: "3 d'affilée. Bon départ.",
      streakBuilding: "6 d'affilée. Vous les connaissez.",
      streakStrong: "10 d'affilée. Vous les connaissez.",
      streakElite: "15 d'affilée. Belle série.",
      streakLegendary: "20 d'affilée. Des bases solides.",
      streakAgainTemplate: "{streak} d'affilée encore.",
      recovery: "Voilà, c'est ça.",
      runEndedAllChancesUsed: ''
    },

    end: {
      title: '',

      poolCompleteTitle: 'Toutes les questions vues.',
      poolCompleteLine1:
        'Vous avez parcouru tout le quiz. Maintenant, rejouez, corrigez les erreurs et consolidez les règles.',
      poolCompleteLine2:
        'Revenez plus tard pour voir ce qui reste vraiment acquis.',
      directToConsolidationLine:
        "Vous avez terminé tout l'ensemble sans erreur active : vous êtes prêt pour le test sous pression.",
      poolCompleteScoreLine: 'Cette partie : {score} {fpShort}',
      poolCompleteCtaPrimary: 'Rejouer dans un nouvel ordre',
      poolCompleteCtaPractice: 'Corriger vos erreurs',

      freeLimitReachedTitle: 'Belle partie.',
      freeLimitReachedBody:
        "Vous avez utilisé vos {limit} parties gratuites.\n\nL'accès complet débloque des RUNs illimitées, les 200 questions du jeu sur les règles du pickleball, les explications après chaque réponse, le Mode Erreurs illimité et la boucle Daily dans la durée.",
      freeLimitReachedCta: 'Continuer à jouer',
      freeLimitReachedClose: 'Plus tard',

      endLine: '',
      endStatsLine: 'Bonnes réponses : {score}/{total}.',

      identityByVerdict: {
        none: 'Quelques questions vous échappent encore.',
        start: 'Vous prenez vos repères.',
        building: 'Vous commencez à comprendre ces règles.',
        strong: 'Vous connaissez plus de règles maintenant.',
        elite: 'Vous connaissez bien ces règles.',
        legendary: 'Vous connaissez vraiment ces règles.'
      },
      identityZero: 'Ces règles demandent un autre passage.',

      ctaByVerdict: {
        none: 'Rejouer',
        start: 'Rejouer : visez 6+',
        building: 'Rejouer : visez 10+',
        strong: 'Rejouer : visez plus haut',
        elite: 'Rejouer : consolidez les questions restantes',
        legendary: 'Rejouer'
      },

      strongestTagLine: 'Votre meilleure catégorie : {tag}.',
      weakestTagLine: 'Catégorie à retravailler : {tag}.',

      endTagHighlights: {
        '2026 Changes':
          'Les changements de règles de 2026 ont été votre catégorie la plus difficile sur cette partie.'
      },

      scoreLine: 'Score : {score} {fpLong}',
      personalBestLine: 'Meilleur score : {best} {fpLong}',
      nearBestLine: '{delta} {fpLong} du meilleur score.',
      streakLine: '',
      scoreTierLine: 'Palier actuel : {tier}.',
      scoreTierNextLine: 'Prochain palier : {nextTier} à {nextTarget}+.',
      dailyChallengeCleared: 'Défi du jour réussi : {targetScore}+ au score.',
      dailyChallengeClearedFreeRun:
        'Défi du jour réussi. Le ticket Mode Rapide se gagne sur votre dernière run gratuite.',
      dailyChallengeTicketWon: 'Défi du jour réussi. +1 ticket Mode Rapide.',
      dailyChallengeTicketCapped:
        'Défi du jour réussi. Les tickets sont plafonnés à {cap}. Dépensez-en un pour en regagner.',
      dailyChallengeMiss: 'Le défi du jour demandait {targetScore}+ au score.',
      dailyChallengeMissLastFree:
        'Pas encore. Le défi du jour demandait {targetScore}+ au score.',
      dailyChallengeCtaRetry: 'Retenter le défi du jour',
      dailyChallengeToast: 'Défi du jour réussi. +1 ticket Mode Rapide.',
      modeMissingFallback: 'Le récapitulatif de votre partie reste disponible.',
      beatBestLine:
        'Prochain objectif : dépasser votre meilleur score avec {target}+.',
      beatBestFirstLine:
        'Prochain objectif : signer un premier meilleur score.',
      freeRunLeft:
        'Il vous reste {remaining} partie{pluralS} gratuite{pluralS}.',

      mistakesTitle: 'Questions à revoir',
      mistakesNone: 'Aucune erreur.',
      mistakesToggle: '{count} erreurs',

      newBest: 'NOUVEAU MEILLEUR SCORE',
      labelByVerdict: {
        none: 'PREMIERS ÉCHANGES',
        start: 'PREMIER PASSAGE',
        building: 'EN PROGRÈS',
        strong: 'BONNE PARTIE',
        elite: 'BASES ACQUISES',
        legendary: 'TRÈS SOLIDE'
      },
      houseAdSummaryLabel: 'Enchaînez avec une autre partie',
      playAgain: 'Rejouer',

      practiceCta: 'Corriger ce que vous avez raté',
      practiceCtaTemplate: 'Corrigez vos {count} erreur{pluralS}',

      bonusCtaPrimary: 'Jouer en Mode Rapide (1 ticket)',

      practiceCtaCountPremium: 'Corriger ce que vous avez raté',
      shareTitle: "Défier quelqu'un"
    },

    paywall: {
      headline: 'Entrez sur le terrain en sachant quoi annoncer.',
      headlineLastFree: "C'était l'aperçu gratuit. Débloquez le jeu complet.",

      progressLine1:
        'Vous avez vu {seen} questions. Il en reste {remaining} dans le quiz complet.',
      progressLine2: '',

      payOnceLine: "Payez une fois. Pas d'abonnement.",

      valueTitle: 'Ce que vous obtenez',
      trustTitle: 'Déverrouillage simple',
      compactTitle: 'Ce qui se débloque',
      compactBullets: [
        '**Les 200 questions du jeu sur les règles du pickleball**',
        '**RUNs illimitées**',
        '**Enregistrez votre score et faites progresser votre meilleur résultat**',
        '**Voyez les meilleurs scores dans le classement public**',
        '**Explications après chaque réponse**',
        '**Mode Erreurs** et jeu hors ligne'
      ],

      valueBullets: [
        '**Les 200 questions du jeu sur les règles du pickleball**',
        '**RUNs illimitées** sur tout le jeu',
        '**Enregistrez votre score et faites progresser votre meilleur résultat**',
        '**Voyez les meilleurs scores dans le classement public**',
        '**Un mélange de questions faciles, intermédiaires et difficiles**',
        '**Explications après chaque réponse**',
        '**Mode Erreurs illimité** pour corriger ce qui vous a manqué'
      ],

      bridgeTitle: 'Connaissez mieux les règles du pickleball.',
      bridgeBody:
        'Débloquez des RUNs illimitées, les 200 questions du jeu, voyez les meilleurs scores dans le classement public, utilisez le Mode Erreurs, et gardez le défi du jour vivant dans le temps.',
      bridgeBodyLastFreeMiss:
        'Vous avez vu le vrai rythme du jeu. Débloquez des RUNs illimitées, les 200 questions du jeu, voyez les meilleurs scores dans le classement public, utilisez le Mode Erreurs, et revenez sur le défi du jour quand vous voulez.',

      trustLine: '**Déverrouillage unique**',
      trustBullets: [
        "**Paiement unique**, pas d'abonnement",
        "**Pas de compte** ni d'email requis",
        "**Gardez votre code** comme sauvegarde si vous changez d'appareil ou effacez vos données",
        '**Fonctionne hors ligne** après le premier chargement',
        '**Paiement sécurisé** via Stripe'
      ],

      socialProofTitle: "Ce qu'en pensent les joueurs",
      socialProofQuotes: [
        {
          quote:
            "★★★★★\nJe pensais tout connaître. J'ai découvert trois règles que je comprenais mal au club. Les explications aident vraiment.",
          author: 'Maya, joueuse de tournoi'
        },
        {
          quote:
            "★★★★★\nEn deux parties, j'ai réalisé que je faisais des erreurs depuis des mois.",
          author: 'Jon, habitué du double'
        }
      ],

      savingsLineTemplate: 'Économisez {saveAmount} avec le prix de lancement.',
      checkoutNote:
        'Paiement traité en toute sécurité par Stripe. En général, cela prend environ 30 secondes.',
      checkoutRedirecting: 'Redirection vers le paiement sécurisé...',

      ctaEarly: "Débloquer l'accès complet pour 4,99 $",
      ctaStandard: "Débloquer l'accès complet pour 6,99 $",
      cta: "Obtenir l'accès complet",

      alreadyHaveCode:
        'Vous avez déjà un code de déverrouillage ? Utilisez-le ici.',
      deviceNote:
        'Déverrouillage instantané. Pas de compte requis. Gardez votre code comme sauvegarde.',

      earlyBadgeLabel: 'Prix de lancement',
      earlyLabel: 'Prix de lancement',
      standardLabel: 'Prix standard',
      timerLabel: 'Le prix augmente dans :',

      postEarlyLine1: 'Le prix de lancement est terminé.',
      postEarlyLine2:
        '{standardPrice}. Payez une fois. Gardez votre code comme sauvegarde.'
    },

    howto: {
      title: 'Comment jouer',
      howToPlayLine1:
        'Vous voyez une affirmation sur les règles du pickleball.',
      howToPlayLine2: 'Décidez si elle est vraie ou fausse.',
      howToPlayLine3: 'Choisissez Vrai ou Faux.',
      audioTitle: 'Audio des questions',
      autoReadLabel: 'Lire automatiquement les questions',
      autoReadHelp:
        'Lit automatiquement chaque nouvelle question à voix haute. Vous pouvez toujours la relire ou arrêter la lecture pendant la partie.',
      autoReadOn: 'Activé',
      autoReadOff: 'Désactivé',

      modesTitle: 'Modes de jeu',
      modesBullets: [
        'Partie classique : découvrez toutes les questions et apprenez les règles.',
        "Mode Rapide : plus rapide et plus exigeant. N'utilise que les questions déjà vues.",
        "Mode Erreurs : rejouez ce que vous avez raté (jusqu'à 10 questions)."
      ],

      ruleTitle: 'Règle de base',
      ruleSentence:
        'Chaque bonne réponse ajoute 1 point. Une mauvaise réponse ajoute 1 erreur. Après {maxChances} erreurs, la partie est terminée.',
      premiumTitle: 'Accès complet',
      alreadyPremium: "L'accès complet est déjà activé sur cet appareil.",
      activateTitle: 'Utiliser un code de déverrouillage',
      activateLine1:
        'Vous avez déjà un code de déverrouillage ? Utilisez-le ici.',
      activateLine2:
        'Pas besoin de compte. Gardez votre code comme sauvegarde.',
      activationCodeLabel: 'Code de déverrouillage',
      activationCodePlaceholder: 'PRQ-0000-0000',
      enterCode: 'Entrez un code.',
      codeRejected: 'Code refusé.',
      activateCta: 'Activer',
      codeInvalid: 'Format de code invalide.',
      codeUsed: 'Cet appareil a déjà utilisé un code.',
      codeOk: 'Accès complet activé sur cet appareil.',

      autoActivateTitle: 'Code de déverrouillage prêt',
      autoActivateLine1:
        'Votre code de déverrouillage est déjà enregistré ici.',
      autoActivateLine2:
        "Activer l'accès complet sur cet appareil maintenant ?",
      autoActivateCta: 'Débloquer maintenant',
      autoActivateLater: 'Plus tard'
    },

    postCompletion: {
      title: 'Vous avez tout vu.',
      body: 'Continuez à progresser. Travaillez vos erreurs, explorez le Mode Rapide ou rejouez des parties complètes.',

      masteredTitle:
        'Bravo ! Vous avez répondu correctement à toutes les questions.',
      masteredLine1:
        'Zéro erreur restante. Chaque question répondue correctement.',
      masteredLine2:
        'Maintenant, mettez votre connaissance des règles sous pression. Puis revenez dans quelques semaines voir si ça tient encore.',
      masteredCtaBonus: 'Vous tester en Mode Rapide',
      masteredCtaReplay: 'Rejouer dans un nouvel ordre',

      waitlistTitle: 'Recevoir les nouveautés',
      waitlistBody1:
        'Recevez un message quand de nouvelles questions ou fonctionnalités sont ajoutées.',
      waitlistBody2:
        'Pas de spam. Pas de compte. Désinscription à tout moment.',
      waitlistCta: 'Être prévenu',
      waitlistDisclaimer:
        'Adresse email uniquement. Désinscription à tout moment.',
      houseAdCta: 'Explorer Bonjour Pickleball'
    },

    houseAd: {
      eyebrow: 'Après {poolSize} questions',
      title: 'Vous connaissez les règles. Prochaine étape : la France.',
      bodyLine1:
        'Carole, la créatrice de Quiz Pickleball, partage son temps entre les États-Unis et la France.',
      bodyLine2:
        'Rejoignez la liste Bonjour Pickleball pour de futurs voyages, stages et expériences en petit groupe en France.',
      ctaPrimary: 'Voir les voyages en France',
      ctaRemindLater: 'Me le rappeler plus tard',

      landingTitle: 'Vous connaissez les règles. Prochaine étape : la France.',
      landingBodyLine1:
        'Carole, la créatrice de Quiz Pickleball, partage son temps entre les États-Unis et la France.',
      landingBodyLine2:
        'Rejoignez la liste Bonjour Pickleball pour de futurs voyages, stages et expériences en petit groupe en France.',
      landingCtaPrimary: 'Voir les voyages en France',
      landingCtaRemindLater: 'Me le rappeler plus tard'
    },

    waitlist: {
      ctaLabel: 'Recevoir les futurs produits ou fonctionnalités.',
      disclaimer: 'Pas de spam. Pas de compte. Désinscription à tout moment.',
      title: 'Recevoir les futurs produits ou fonctionnalités.',
      bodyLine1: 'Pas de spam. Pas de compte. Désinscription à tout moment.',
      bodyLine2: 'Facultatif : ajoutez une idée.',
      inputPlaceholder: 'Facultatif : partagez une idée.',
      cta: "Préparer l'email",

      emailSubjectSuffix: "Liste d'attente",
      emailBodyTemplate: `Bonjour !

J'aimerais rejoindre la liste d'attente de Quiz Pickleball.

Idée optionnelle :
{idea}

Merci !`
    },

    share: {
      ctaLabel: 'Copier le défi',
      emailLabel: "Préparer l'email",
      emailSubject: 'Quiz Pickleball',
      previewLabel: 'Aperçu du défi',
      toastCopied: 'Copié.',
      template: `Vous croyez connaître le pickleball ?
Essayez celle-ci :
{funFact}

{scoreChallenge}
{url}`,
      scoreChallengeWithBest: 'Mon meilleur score est {bestScore}. Et vous ?',
      scoreChallengeWithoutBest: 'Quel est votre meilleur score ?',

      teaserTrap: "Ça paraît évident... jusqu'à ce que non.",
      teaserTrue: 'Parfois la réponse évidente est la bonne.',
      funFactTemplatesTrap: [`"{question}" Vrai ou faux ? 🤔`],
      funFactTemplatesTrue: [`"{question}" Vrai ou faux ? 🤔`]
    },

    installPrompt: {
      title: 'Installer Quiz Pickleball',
      body: "Ajoutez-la à votre écran d'accueil et ouvrez-la comme une app.\nPas d'App Store. Pas de compte. Un geste pour jouer.",
      bodyIOS:
        "Sur iPhone, appuyez sur Partager, puis Ajouter à l'écran d'accueil.",
      ctaPrimary: "Installer l'app",
      ctaPrimaryIOS: 'Voir les étapes iPhone',
      ctaSecondary: 'Plus tard'
    },

    statsSharing: {
      sectionTitle: 'Retour anonyme (optionnel)',
      buttonLabel: 'Partager des stats de jeu anonymes',

      promptTitle: 'Aidez à améliorer les questions',
      promptBodyTemplate:
        "Vous avez maintenant vu {thresholdPct}% du pool de questions. Partagez des stats de jeu anonymes pour aider à améliorer la difficulté, les formulations et l'ordre des questions. Vous pouvez tout relire avant d'envoyer.",
      promptBodyLastFree:
        "C'était votre dernière partie gratuite. Partagez des stats de jeu anonymes pour aider à améliorer la difficulté, les formulations et l'ordre des questions. Vous pouvez tout relire avant d'envoyer.",
      promptBodyPowerUser:
        "Vous avez assez joué pour que vos stats soient utiles. Partagez des stats de jeu anonymes pour aider à améliorer la difficulté, les formulations et l'ordre des questions. Vous pouvez tout relire avant d'envoyer.",
      promptCtaPrimary: "Voir avant d'envoyer",
      promptCtaSecondary: 'Plus tard',

      modalTitle: 'Vérifier les stats anonymes',
      modalDescription:
        "Cet email contient votre résumé de jeu, les questions que vous ratez le plus, et des totaux d'usage anonymes.\nAucune donnée personnelle n'est incluse.\nVous pouvez vérifier exactement ce qui sera envoyé ci-dessous.",
      previewLabel: 'Ce qui sera envoyé :',
      ctaSend: "Préparer l'email",
      ctaCancel: 'Annuler',
      ctaLater: 'Plus tard',
      ctaCopy: 'Copier les stats',
      noStatsToast: 'Pas encore de stats à partager.',
      successToast:
        "Brouillon d'email ouvert. Envoyez-le si vous voulez partager vos stats.",
      copyToast: 'Stats copiées dans le presse-papier.',
      mailtoFallbackToast:
        "Stats copiées dans le presse-papier. Collez-les dans le brouillon d'email."
    },

    support: {
      label: 'Contact',
      modalTitle: 'Écrivez-nous',
      modalBodyLine1: "L'email est le moyen le plus rapide de nous joindre.",
      modalBodyLine2: "Choisissez une raison ci-dessous ou copiez l'adresse.",
      emailSubjectSuffix: 'Retour',
      ctaCopy: "Copier l'email",
      ctaOpen: "Ouvrir l'application email",
      emailUnavailableToast: "L'email n'est pas disponible pour le moment.",
      ctaBug: 'Signaler un bug',
      ctaQuestion: 'Question',
      ctaIdea: 'Idée',
      bugSubjectSuffix: 'Rapport de bug',
      questionSubjectSuffix: 'Question',
      ideaSubjectSuffix: 'Idée',

      emailBodyTemplate: `Bonjour !

Je vous écris au sujet de Quiz Pickleball.

Message :




Merci !`,
      bugBodyTemplate: `Bonjour !

Je vous écris au sujet de Quiz Pickleball.

Rapport de bug :

Ce qui s'est passé :

Ce à quoi je m'attendais :

Appareil / navigateur :


Merci !`,
      questionBodyTemplate: `Bonjour !

Je vous écris au sujet de Quiz Pickleball.

Question :



Merci !`,
      ideaBodyTemplate: `Bonjour !

Je vous écris au sujet de Quiz Pickleball.

Idée :



Merci !`
    },

    notFound: {
      title: 'Hors limites.',
      line1: 'Cette page a atterri en dehors du terrain.',
      line2: 'Bonne nouvelle : Quiz Pickleball est toujours prêt à jouer.',
      cta: 'Retour au jeu'
    }
  };
})();
