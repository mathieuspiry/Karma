@AGENTS.md

# Karma (hellokarma.fr)

Karma est un club privé par abonnement (5 €/mois, sans engagement) pour les hommes en couple, occupés, qui aiment leur compagne mais ne le montrent pas assez. Chaque lundi à 8 h 45, le membre reçoit par email 3 petites attentions choisies pour son couple (une « de toi », une « matériel », une « moment à deux »), en fait une, et clique sur « je l'ai faite ». Karma se souvient de tout, ne répète jamais une idée, anticipe les dates clés, et relance une seule fois le vendredi.

Le cadrage complet est dans `docs/cadrage.md`. Lis-le avant toute tâche fonctionnelle. Ce fichier-ci résume ce qu'il faut savoir pour coder correctement.

## Fondateurs et voix

- Mathieu (fondateur, développeur occasionnel, a codé il y a longtemps) et Caroline (regard féminin, rédige le catalogue d'attentions).
- Voix de marque : d'homme à homme, tutoiement, complice, second degré assumé, jamais moralisateur ni mièvre. Les mails sont signés Mathieu, avec la mention « choisi avec Caroline ».
- Tout ce qui est visible par un membre est en français. Le code, les commentaires et les commits sont en anglais.
- Pas de tirets cadratins dans les textes produits ; utiliser virgules, parenthèses ou points.

## Stack

- Next.js 16 (App Router, `src/`), TypeScript strict, Tailwind CSS 4. Voir `AGENTS.md` : cette version de Next diffère de ce que tu crois connaître, lis `node_modules/next/dist/docs/` avant d'écrire du code Next.
- Supabase (PostgreSQL, auth par lien magique, Row Level Security). Schéma dans `supabase/migrations/`. Région Europe (Francfort ou Paris).
- Stripe Checkout + Customer Portal pour l'abonnement, webhooks pour synchroniser `members.subscription_status`.
- Resend + React Email pour les mails. Domaine d'envoi dédié avec SPF, DKIM, DMARC.
- API Claude (modèle Haiku) pour personnaliser le texte des attentions. Jamais pour inventer des idées.
- Vercel pour l'hébergement et les tâches planifiées (Vercel Cron).
- Hébergé sur GitHub, développé avec Claude Code.

## Arborescence cible

```
src/app/                 routes (landing, /rejoindre, /profil, /fait/[token], /admin/...)
src/app/api/             webhooks Stripe, endpoints cron, actions serveur
src/components/          composants UI partagés
src/emails/              gabarits React Email (weekly, reminder, welcome, quarterly)
src/lib/supabase/        clients Supabase (serveur, navigateur, service role)
src/lib/stripe/          client Stripe et helpers webhooks
src/lib/engine/          moteur de sélection : filtres, scoring, composition du trio, personnalisation
src/lib/email/           envoi Resend, liens signés
supabase/migrations/     schéma SQL versionné
docs/                    cadrage, décisions, notes
```

## Modèle de données (résumé)

`members` (l'homme, lié à Stripe) → `couples` (profil de la compagne et du couple) → `couple_tags`, `occasions`.
`attentions` (le catalogue, rédigé par Caroline et Mathieu) → `attention_tags`.
`weekly_batches` (un mail hebdo pour un membre) → `batch_items` (les 3 idées, avec `personalized_text`, `done_at`, `reaction`).
`tags` est le vocabulaire partagé (`interest`, `constraint`, `avoid`). `admins` liste Mathieu et Caroline.
Détail et contraintes dans `supabase/migrations/0001_init.sql`.

## Règles métier non négociables

1. Une attention déjà envoyée à un membre n'est jamais renvoyée dans les 12 mois.
2. Le mail contient exactement 3 idées, une par catégorie (`de_toi`, `materiel`, `moment_a_deux`), jamais trois idées d'effort `lourd` la même semaine.
3. Le budget du couple et les tags « éviter » sont des filtres durs, jamais des pondérations.
4. Une occasion (anniversaire, rencontre, Saint-Valentin, fête des mères) qui tombe dans les 14 jours impose une idée taguée pour cette occasion.
5. La personnalisation IA reçoit l'idée du catalogue et le profil, et ne doit rien inventer sur la compagne. Texte sous 4 lignes. Le texte généré est stocké une fois dans `batch_items.personalized_text` et jamais régénéré.
6. Le clic « je l'ai faite » se fait sans connexion, via un lien signé à usage unique, valable 14 jours.
7. Un seul rappel par semaine, le vendredi à 8 h 45, uniquement si aucune idée n'est marquée faite.
8. Données sur la compagne : prénom, dates, goûts et exclusions uniquement. Jamais de données de santé, religion, sexualité ou intimité. Suppression en cascade à la suppression du compte.
9. Pas d'essai gratuit. Le paiement précède le questionnaire. Le premier mail part sous 24 h une fois les champs essentiels remplis (prénom, dates, budget).

## Décisions prises (ne pas rouvrir sans Mathieu)

- Domaine : hellokarma.fr. Adresse d'envoi : hello@hellokarma.fr.
- Canal : email uniquement pour le MVP. Pas de WhatsApp, pas d'app mobile, pas de push.
- Les 3 idées sont visibles dans le mail (pas de « une autre »).
- Envoi le lundi 8 h 45 Europe/Paris, rappel le vendredi 8 h 45.
- Le catalogue est rédigé dans Google Sheets au départ, importé en base au sprint 3.
- Pas de liens d'affiliation dans le MVP.
- Critère de succès du MVP : 100 membres payants, plus de 50 % de validation hebdomadaire, churn mensuel sous 10 %.

## Conventions de code

- TypeScript strict, pas de `any`. Types de la base générés avec `supabase gen types` dans `src/lib/supabase/types.ts`.
- Server Components par défaut, `"use client"` uniquement quand nécessaire.
- Toute la logique métier du moteur vit dans `src/lib/engine/` en fonctions pures testables, sans accès direct à la base : on lui passe des données, il rend un trio.
- Les secrets ne sont jamais commités. Voir `.env.example`. Le client Supabase `service_role` n'est utilisé que côté serveur (cron, webhooks, admin).
- Les tâches cron sont des routes `src/app/api/cron/*` protégées par `CRON_SECRET`.
- Les webhooks Stripe vérifient la signature avant toute écriture.
- Dates et heures : stocker en UTC, afficher en `Europe/Paris`. Vercel Cron tourne en UTC et ne connaît pas l'heure d'été : planifier le cron d'envoi toutes les 15 minutes et laisser le handler sélectionner les membres dont l'heure locale (`send_day`, `send_hour`, `send_minute`, `timezone`) correspond.
- Tests : Vitest pour le moteur (`src/lib/engine/**/*.test.ts`). Chaque règle métier ci-dessus a au moins un test.
- Commits en anglais, impératif, courts. Une fonctionnalité par branche.

## Commandes

```
npm run dev          serveur local
npm run build        vérification de build (à lancer avant tout commit)
npm run lint         eslint
npx supabase db push applique les migrations (une fois le projet Supabase lié)
```

## Roadmap (voir docs/cadrage.md, section 10)

Sprint 1 socle (Supabase, auth, déploiement, landing) → Sprint 2 adhésion et onboarding → Sprint 3 catalogue et back-office → Sprint 4 moteur et mail → Sprint 5 bêta fermée → Sprint 6 ouverture.

Quand une tâche est ambiguë, propose deux options courtes à Mathieu plutôt que de choisir seul. Quand une tâche touche à une règle métier ci-dessus, cite le numéro de la règle dans ta réponse.
