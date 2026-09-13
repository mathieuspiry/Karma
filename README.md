# Karma · hellokarma.fr

Le club privé des hommes qui tiennent à elle mais ne le montrent pas assez. Chaque lundi, 3 petites attentions choisies pour son couple, 3 minutes pour la faire.

- Cadrage produit : [`docs/cadrage.md`](docs/cadrage.md)
- Contexte pour Claude Code : [`CLAUDE.md`](CLAUDE.md)
- Schéma de base : [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)

## Démarrer en local

Prérequis : Node.js 22 ou plus récent, npm.

```bash
npm install
cp .env.example .env.local   # puis remplir les clés
npm run dev                  # http://localhost:3000
```

## Comptes à créer (sprint 0)

| Service | Usage | Où trouver les clés |
|---|---|---|
| GitHub | Hébergement du code | Créer un dépôt privé `hellokarma`, pousser ce projet |
| Vercel | Hébergement du site et cron | Importer le dépôt GitHub, région `cdg1` (Paris) |
| Supabase | Base de données et auth | Nouveau projet, région Frankfurt (eu-central-1) ; Settings → API |
| Stripe | Abonnement 5 €/mois | Créer un produit « Karma » avec un prix récurrent mensuel ; Developers → API keys |
| Resend | Emails | Ajouter le domaine `hellokarma.fr`, configurer SPF, DKIM, DMARC ; API keys |
| Anthropic | Personnalisation des textes | console.anthropic.com → API keys |
| Registrar (OVH, Gandi, Infomaniak) | Domaine hellokarma.fr | À réserver en premier |

Toutes les clés vont dans `.env.local` (jamais commité) et dans les variables d'environnement Vercel.

## Appliquer le schéma Supabase

Option simple : ouvrir le SQL Editor de Supabase, coller le contenu de `supabase/migrations/0001_init.sql`, exécuter.

Option outillée (recommandée à partir du sprint 1) :

```bash
npx supabase login
npx supabase link --project-ref <ref-du-projet>
npx supabase db push
npx supabase gen types typescript --linked > src/lib/supabase/types.ts
```

## Scripts

```bash
npm run dev      # serveur de développement
npm run build    # build de production, à lancer avant tout commit
npm run lint     # eslint
```

## Structure

```
src/app/                 routes et API
src/components/          composants partagés
src/emails/              gabarits React Email
src/lib/engine/          moteur de sélection (fonctions pures)
src/lib/supabase/        clients Supabase
src/lib/stripe/          Stripe
src/lib/email/           envoi et liens signés
supabase/migrations/     schéma SQL
docs/                    cadrage et décisions
```
