# Karma, cadrage produit

Version 1, 13 septembre 2026. Rédigé par Mathieu avec Claude. Décisions tranchées par Mathieu le 13 septembre 2026.

Karma est le club privé des hommes qui tiennent à elle mais ne le montrent pas assez. Chaque semaine, 3 petites attentions choisies pour son couple, 3 minutes pour la faire, et une compagne qui sent qu'elle compte.

## 01. Vision et positionnement

**Le problème.** Les petites attentions sont l'une des premières attentes des femmes envers leur conjoint, et l'un des premiers reproches quand elles manquent. Les hommes de bonne volonté ont pourtant le sentiment de faire beaucoup (travail, enfants, maison, vacances), mais rien de tout cela ne compte comme « petite attention ». Le vrai obstacle n'est pas l'envie, c'est la charge mentale : y penser, choisir, viser juste, et le refaire la semaine suivante.

**La solution.** Karma retire toute la charge mentale. Le membre reçoit chaque semaine 3 idées d'attentions adaptées à sa compagne et à son couple, en choisit une, la fait, et clique sur « faite ». Karma se souvient de tout, ne propose jamais deux fois la même chose, anticipe les dates qui comptent, et vérifie qu'il l'a bien faite.

**Cible.** Homme en couple depuis plusieurs années, 30 à 55 ans, souvent avec enfants, occupé, qui aime sa compagne et qui a déjà entendu « tu n'es pas assez attentionné ». Il ne cherche pas un coach de couple, il cherche un raccourci fiable.

**Promesse.** Une petite attention par semaine qui fait toute la différence, en 3 minutes maximum, sans avoir à y penser. Il devient le conjoint qui y pense, pas celui qui s'excuse.

**Ton de marque.** Club privé, complice, tutoiement, second degré assumé. On parle d'homme à homme, jamais moralisateur, jamais mièvre. Caroline est la caution « regard féminin » du service.

**Ce que Karma n'est pas.** Pas une appli de couple à installer à deux, pas une thérapie, pas un site de cadeaux, pas un générateur d'idées à volonté. La rareté (3 idées, 1 à faire) est une feature : on ne la gâte pas trop, on la surprend régulièrement.

**La phrase à retenir.** Karma n'est pas un catalogue d'idées, c'est une routine imposée avec douceur. La valeur est dans la régularité et la justesse, pas dans le volume.

## 02. Périmètre du MVP

**Dans le MVP**

- Landing page (reprise de la page Kit existante) avec paiement Stripe à 5 €/mois, sans engagement
- Questionnaire d'onboarding sur le couple et la compagne
- Mail hebdomadaire avec 3 attentions (de toi, matériel, moment à deux)
- Validation « je l'ai faite » en un clic depuis le mail, et rappel de fin de semaine
- Catalogue d'attentions administré par Mathieu et Caroline
- Moteur de sélection à règles, avec personnalisation du texte par IA
- Anticipation des dates clés (anniversaire, rencontre, Saint-Valentin, fête des mères)
- Espace membre minimal : profil du couple, historique, gestion de l'abonnement

**Volontairement exclu**

- WhatsApp et notifications push (canal email uniquement)
- Application mobile native
- Achat intégré des cadeaux (on donne l'idée et un lien, pas plus)
- Accès pour la compagne à la plateforme
- Génération d'idées 100 % IA sans catalogue humain
- Version pour les femmes, version couples LGBT (à étudier une fois le cœur validé)
- Parrainage, cadeaux d'abonnement, offres annuelles

**Critère de succès du MVP.** 100 membres payants, un taux de validation hebdomadaire (au moins une attention marquée « faite ») supérieur à 50 %, et un churn mensuel sous 10 %. Si ces trois chiffres tiennent sur trois mois, le modèle est validé.

## 03. Parcours membre

1. **Découverte.** Landing, témoignages, FAQ, clic sur « Devenir membre ».
2. **Adhésion.** Stripe Checkout : email, carte, 5 €/mois. Pas de mot de passe. Compte créé automatiquement au retour du paiement, connexion par lien magique.
3. **Questionnaire du couple.** Immédiatement après le paiement, 5 minutes, une question par écran. Le premier mail ne part pas tant que les champs essentiels ne sont pas remplis (prénom, dates, budget).
4. **Premier mail, sous 24 h.** Les 3 attentions de la semaine et un mot de bienvenue.
5. **Rythme hebdomadaire.** Chaque lundi à 8 h 45, le mail de la semaine. Il choisit une idée, la fait, clique sur « faite ». La page de confirmation demande en option comment elle a réagi (une émoticône) et un détail à retenir.
6. **Rappel de vendredi.** Si rien n'a été marqué « faite », un rappel court à 8 h 45. Une seule relance, jamais deux.
7. **Dates clés.** Deux semaines avant une occasion, le mail contient une attention « occasion » dédiée.
8. **Bilan trimestriel.** Tous les trois mois, récapitulatif de ce qu'il a fait et proposition de redemander sa note à sa compagne.

## 04. Questionnaire du couple

| Champ | Type | Sert à | Statut |
|---|---|---|---|
| Son prénom à elle | texte | Personnaliser chaque mail | essentiel |
| Depuis combien de temps ensemble | années | Ton des idées, anniversaires de rencontre | essentiel |
| Date d'anniversaire, date de rencontre ou de mariage | dates | Anticiper les occasions | essentiel |
| Budget mensuel confortable | 0 à 20 €, 20 à 50 €, 50 à 150 €, plus | Filtrer les idées | essentiel |
| Enfants à la maison, et âges | choix | Faisabilité des sorties | affine |
| Ce qu'elle adore (5 choix + texte libre) | tags | Pondérer les catégories | affine |
| Ce qu'elle déteste ou ne mange pas | tags + texte | Exclure des idées | affine |
| Son langage d'amour dominant | mots, temps, cadeaux, services, contact | Équilibrer les catégories | affine |
| Ville et type de lieu | grande ville, périurbain, campagne | Idées de sorties réalistes | affine |
| Ce que tu fais déjà bien et ce qu'elle te reproche | texte libre | Contexte pour l'IA | affine |
| Jour et heure de réception | choix | Planification | option |

**Principe de sobriété.** On collecte des données sur une personne qui n'est pas l'utilisateur. On reste sur des goûts et des dates, jamais sur la santé, la religion, la sexualité ou des détails intimes. Le membre peut tout modifier et tout effacer.

## 05. Le mail hebdomadaire

Trois idées, une par catégorie, chacune en trois ou quatre lignes : quoi faire, quand, pourquoi ça va lui plaire à elle. Une phrase de contexte personnalisée par l'IA, un bouton « faite » par idée, rien d'autre. Signé Mathieu, « choisi avec Caroline ».

Exemple (objet : « Semaine 14 · Tes 3 attentions pour Caroline ») :

- **De toi.** Ce soir, quand elle raconte sa journée, pose ton téléphone dans une autre pièce avant qu'elle commence. Ne dis rien, elle le remarquera.
- **Matériel.** Tu nous as dit qu'elle relit toujours le même auteur. Passe à la librairie chercher son dernier roman, et glisse un mot à la page 21 (21 ans ensemble, elle comprendra).
- **Moment à deux.** Jeudi, les enfants sont chez tes parents. Réserve la table du fond au petit italien de la rue de la Gare, sans lui dire où vous allez. Budget : 60 €.

Au clic sur « faite » : page légère de confirmation, émoticône de réaction, champ facultatif « un détail à retenir ? ».

## 06. Le moteur de sélection

Le moteur ne crée pas d'idées, il choisit dans le catalogue rédigé par Caroline et Mathieu. L'IA intervient en dernier, uniquement pour habiller le texte.

Pipeline hebdomadaire, exécuté chaque nuit de dimanche :

1. **Charger le profil** du couple, l'historique des envois et validations, le calendrier des occasions.
2. **Filtrer le catalogue** : retirer ce qui a été envoyé dans les 12 derniers mois, ce qui dépasse le budget, ce qui touche un tag « déteste », ce qui n'est pas de saison, ce qui est infaisable avec des enfants en bas âge sans garde déclarée.
3. **Scorer les candidats** : bonus tag « adore » ou langage d'amour, bonus catégorie peu proposée récemment, malus idée proche ayant reçu une réaction tiède, bonus fort si une occasion arrive dans 14 jours.
4. **Composer le trio** : meilleure « de toi », meilleure « matériel », meilleure « moment à deux », jamais trois idées lourdes la même semaine.
5. **Personnaliser le texte** avec Claude : idée brute + profil, consignes strictes (ne rien inventer sur elle, moins de 4 lignes). Stocké, jamais régénéré.
6. **Envoyer** via Resend, tracer ouvertures et clics.

Pourquoi des règles avant l'IA : elles sont lisibles, testables et corrigeables par Mathieu et Caroline via les tags. Une couche d'apprentissage ne sera envisagée qu'au-delà de 500 idées et de milliers de réactions.

## 07. Back-office

### Fiche attention

| Attribut | Valeurs |
|---|---|
| Catégorie | de toi · matériel · moment à deux |
| Texte de base | Au tutoiement, sans prénom, variables `{prenom}`, `{annees}`, `{ville}` |
| Effort | léger (moins de 5 min) · moyen (une heure, un déplacement) · lourd (organisation, réservation) |
| Budget | 0 € · moins de 20 € · 20 à 50 € · 50 à 150 € · plus |
| Saisons et mois | toute l'année, ou liste de mois |
| Occasions | aucune · anniversaire · rencontre · Saint-Valentin · fête des mères · Noël · rentrée |
| Tags « plaît si » | lecture, cuisine, nature, sport, bien-être, culture, voyage, calme, surprises, humour... |
| Tags « éviter si » | n'aime pas les fleurs, pas de sucré, pas de surprise publique, végétarienne... |
| Contraintes | garde d'enfants · grande ville · voiture |
| Lien optionnel | URL, sans affiliation au MVP |
| Statut | brouillon · publiée · retirée |

### Autres écrans

- **Membres** : liste, statut d'abonnement, profil, historique, forcer ou exclure une idée.
- **Envois** : le lot de la semaine visible dès le dimanche soir, bouton « relire avant envoi » pour les 20 premiers membres.
- **Tableau de bord** : membres actifs, ouverture, validation, répartition des catégories, top et flop, churn.
- **Import** : chargement du catalogue depuis Google Sheets.

Objectif de lancement : 150 attentions publiées (50 par catégorie).

## 08. Modèle de données

Voir `supabase/migrations/0001_init.sql` pour le schéma exécutable.

| Table | Rôle |
|---|---|
| `members` | Le membre (l'homme), lié à Stripe |
| `couples` | Le profil du couple et de la compagne |
| `couple_tags` | Goûts et exclusions du couple |
| `tags` | Vocabulaire partagé (interest · constraint · avoid) |
| `attentions` | Le catalogue |
| `attention_tags` | Tags des attentions (fits · avoid) |
| `weekly_batches` | Un mail hebdo pour un membre |
| `batch_items` | Les 3 idées d'un mail, texte personnalisé, validation, réaction |
| `occasions` | Dates récurrentes ou ponctuelles |
| `admins` | Mathieu et Caroline |

RLS : un membre ne voit que son couple et ses envois ; seuls les admins voient le catalogue et l'ensemble des membres. Suppression en cascade.

## 09. Stack et coûts

| Brique | Choix |
|---|---|
| Application web | Next.js (TypeScript), Vercel |
| Base et auth | Supabase (PostgreSQL), lien magique, RLS, région Europe |
| Paiement | Stripe Checkout et Customer Portal |
| Emails | Resend + React Email |
| Personnalisation | API Claude (Haiku) |
| Tâches planifiées | Vercel Cron |
| Code | GitHub, Claude Code, CLAUDE.md |

Coût mensuel hors Stripe : environ 2 € jusqu'à 100 membres, environ 76 € à 1 000 membres. Stripe : 1,5 % + 0,25 € par paiement. À 1 000 membres, 5 000 € de CA pour environ 400 € de coûts variables.

## 10. Roadmap

| Sprint | Contenu | Livrable |
|---|---|---|
| 0 | Cadrage, CLAUDE.md, dépôt, comptes, gabarit de catalogue | Dépôt initialisé, catalogue démarré |
| 1 | Next.js, Supabase (schéma, RLS), auth lien magique, Vercel, landing | Site en ligne, connexion fonctionnelle |
| 2 | Stripe Checkout, webhooks, questionnaire, espace membre | Paiement et profil de bout en bout |
| 3 | Admin catalogue, import Sheets, liste membres, tags | 150 attentions en base |
| 4 | Moteur, personnalisation, mail hebdo, page « faite », rappel, cron | Mathieu reçoit son mail deux semaines |
| 5 | Bêta fermée (5 couples fondateurs + 20 amis, gratuit un mois), relecture, dashboard | 25 membres actifs |
| 6 | Passage en payant, témoignages réels, bilan trimestriel, lancement | 100 membres payants |

## 11. Risques et garde-fous

- **Idées génériques.** Catalogue écrit par Caroline, 3 tags minimum par fiche, écran « relire avant envoi » tant que les réactions positives sont sous 70 %.
- **Décrochage après trois semaines.** Premier mail sous 24 h, alternance d'efforts, rappel unique, bilan trimestriel, relance personnelle de Mathieu au premier mois sans validation.
- **Données sur la compagne.** Collecte minimale, mention dans les CGU et la politique de confidentialité, hébergement en Europe, suppression complète, pas de revente. Relecture juridique avant l'ouverture publique.
- **Délivrabilité.** Domaine d'envoi dédié (SPF, DKIM, DMARC) dès le sprint 1, montée en volume progressive, désinscription visible, surveillance des rebonds.
- **Fondateur seul.** Automatiser le répétitif, back-office simple pour Caroline, tout documenter dans le dépôt.

## 12. Décisions prises

| | Décision |
|---|---|
| D1 | Domaine hellokarma.fr (libre au 13/09/2026). Second choix karma-club.fr. Marque à vérifier à l'INPI. |
| D2 | Les 3 idées sont visibles dans le mail. |
| D3 | Pas d'essai gratuit. Seule la bêta fermée est gratuite, un mois. |
| D4 | Mathieu écrit et signe, mention « choisi avec Caroline ». |
| D5 | Clic « faite » sans connexion, lien signé à usage unique, 14 jours. |
| D6 | Envoi lundi 8 h 45 Europe/Paris, rappel vendredi 8 h 45. |
| D7 | Catalogue dans Google Sheets au départ, import au sprint 3. |
