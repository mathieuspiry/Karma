import Link from "next/link";

// ─── Data ────────────────────────────────────────────────────────────────────

const steps = [
  {
    num: "01",
    title: "Tu t'abonnes",
    body: "5 €/mois, sans engagement. On crée ton compte et on t'envoie directement le questionnaire.",
  },
  {
    num: "02",
    title: "Tu nous parles d'elle",
    body: "5 minutes. Son prénom, ses goûts, les dates qui comptent, votre budget. On ne te demande que ce qu'on utilise vraiment.",
  },
  {
    num: "03",
    title: "Chaque lundi à 8 h 45",
    body: "Tu reçois 3 attentions choisies pour elle : une de toi, une matérielle, un moment à deux. Tu en fais une. Tu cliques sur « faite ».",
  },
  {
    num: "04",
    title: "Karma se souvient de tout",
    body: "On ne te propose jamais deux fois la même chose. On anticipe les anniversaires et les occasions. Et on te relance le vendredi si tu as oublié.",
  },
];

const reasons = [
  {
    title: "La régularité bat l'intensité",
    body: "Une attention par semaine, 52 semaines, ça fait plus d'effet qu'un grand geste tous les six mois. Ta compagne ne demande pas un héros, elle demande quelqu'un qui y pense.",
  },
  {
    title: "La charge mentale, on s'en occupe",
    body: "Trouver l'idée, vérifier qu'elle lui plaira, ne pas répéter la même chose que le mois dernier... C'est exactement ce que Karma fait à ta place.",
  },
  {
    title: "3 idées, 1 à faire",
    body: "On ne t'envoie pas un catalogue à parcourir. Tu choisis parmi trois propositions adaptées, tu en fais une. Trois minutes, et c'est réglé.",
  },
  {
    title: "Pas une appli de couple",
    body: "Elle ne voit rien, elle ne s'inscrit nulle part. Karma t'aide à lui faire des surprises, pas à manager votre relation en commun.",
  },
];

const testimonials = [
  {
    quote: "Je me suis rendu compte que j'avais fait plus d'attentions en deux mois qu'en deux ans avant.",
    author: "Julien, 38 ans",
    detail: "Avec Sabine depuis 11 ans",
  },
  {
    quote: "Ce qui m'a surpris, c'est qu'elle l'a remarqué après la deuxième semaine seulement. Elle m'a dit « tu as changé quelque chose ? ».",
    author: "Thomas, 44 ans",
    detail: "Avec Laure depuis 8 ans",
  },
  {
    quote: "Je savais que je voulais faire des efforts, je ne savais pas lesquels. Là j'ai juste à faire ce qu'on me dit, et ça marche.",
    author: "Marc, 41 ans",
    detail: "Avec Emma depuis 14 ans",
  },
];

const faqs = [
  {
    q: "Est-ce que je m'engage sur la durée ?",
    a: "Non. 5 €/mois sans engagement. Tu peux résilier à tout moment depuis ton espace membre, ça s'arrête à la fin de la période en cours.",
  },
  {
    q: "Est-ce que mes données sur elle sont en sécurité ?",
    a: "On collecte son prénom, ses goûts et quelques dates. Rien d'autre. Les données sont hébergées en Europe, chiffrées, et tu peux tout supprimer à tout moment. On ne les vend à personne.",
  },
  {
    q: "Et si les idées ne me correspondent pas ?",
    a: "Le questionnaire d'onboarding sert précisément à ça : ton budget, ses goûts, ce qu'elle déteste, les contraintes pratiques. Si une idée ne te convient pas, tu ignores et tu attends la suivante la semaine d'après.",
  },
  {
    q: "Combien de temps ça prend par semaine ?",
    a: "Lire les 3 idées : 2 minutes. Faire l'attention choisie : ça dépend de l'idée, mais le plus souvent moins de 5 minutes. Cliquer sur « faite » : 1 seconde.",
  },
  {
    q: "Est-ce que Karma invente les idées avec l'IA ?",
    a: "Non. Le catalogue est écrit par Caroline et Mathieu. L'IA sert uniquement à personnaliser le texte en y glissant son prénom et quelques détails qui la concernent. L'idée, c'est toujours un humain qui l'a choisie.",
  },
  {
    q: "Qu'est-ce qui se passe si j'oublie une semaine ?",
    a: "Le vendredi à 8 h 45, tu reçois un rappel. Une seule relance, pas de honte. La semaine d'après, on repart sur de nouvelles idées.",
  },
];

// ─── Sections ─────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-xs uppercase tracking-[0.3em] text-gold">
      {children}
    </p>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <main className="flex flex-col">
      {/* ── Hero ── */}
      <section className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-24 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">
          Club privé · 5 €/mois
        </p>
        <h1 className="font-display text-6xl uppercase leading-none tracking-wide sm:text-8xl lg:text-[10rem]">
          Karma
        </h1>
        <p className="max-w-xl text-xl text-foreground/80 sm:text-2xl">
          Une petite attention par semaine qui fait toute la différence,
          en 3 minutes maximum, sans avoir à y penser.
        </p>
        <p className="max-w-md text-foreground/60">
          Tu deviens le conjoint qui y pense. Pas celui qui s&apos;excuse.
        </p>
        <Link
          href="#devenir-membre"
          className="mt-4 bg-gold px-8 py-4 font-display text-sm uppercase tracking-widest text-background transition-opacity hover:opacity-80"
        >
          Devenir membre
        </Link>
        <p className="text-sm text-foreground/40">
          Sans engagement · Résiliable à tout moment
        </p>
      </section>

      {/* ── Promesse ── */}
      <section className="border-t border-foreground/10 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <SectionLabel>Le problème</SectionLabel>
          <h2 className="mb-8 font-display text-4xl uppercase tracking-wide sm:text-5xl">
            Tu veux bien faire. Mais tu ne sais pas quoi faire.
          </h2>
          <div className="grid gap-8 text-foreground/70 sm:grid-cols-2">
            <p>
              Les petites attentions, c&apos;est la première attente des femmes envers leur conjoint, et le premier reproche quand elles manquent. Le problème, c&apos;est rarement l&apos;envie.
            </p>
            <p>
              C&apos;est la charge mentale : y penser, choisir quelque chose qui lui plaira vraiment, ne pas répéter la même idée que le mois dernier, et le refaire la semaine suivante.
            </p>
          </div>
          <div className="mt-12 border-l-2 border-gold pl-6">
            <p className="text-xl text-foreground/90 sm:text-2xl">
              Karma retire toute la charge mentale. Tu reçois les idées, tu en fais une, tu cliques. C&apos;est tout.
            </p>
          </div>
        </div>
      </section>

      {/* ── Comment ça fonctionne ── */}
      <section className="border-t border-foreground/10 bg-foreground/[0.03] px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <SectionLabel>Comment ça fonctionne</SectionLabel>
          <h2 className="mb-16 font-display text-4xl uppercase tracking-wide sm:text-5xl">
            Simple comme un lundi matin
          </h2>
          <div className="grid gap-12 sm:grid-cols-2">
            {steps.map((step) => (
              <div key={step.num} className="flex gap-6">
                <span className="font-display text-3xl text-gold/40">
                  {step.num}
                </span>
                <div>
                  <h3 className="mb-2 font-display text-lg uppercase tracking-wide">
                    {step.title}
                  </h3>
                  <p className="text-foreground/70">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Exemple de mail ── */}
      <section className="border-t border-foreground/10 px-6 py-24">
        <div className="mx-auto max-w-2xl">
          <SectionLabel>Ce que tu reçois</SectionLabel>
          <h2 className="mb-12 font-display text-4xl uppercase tracking-wide sm:text-5xl">
            3 idées, pas un catalogue
          </h2>
          <div className="space-y-6 border border-foreground/20 bg-foreground/[0.03] p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-foreground/40">
              Semaine 14 · Tes 3 attentions
            </p>
            <div className="space-y-8">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gold">
                  De toi
                </p>
                <p className="text-foreground/80">
                  Ce soir, quand elle raconte sa journée, pose ton téléphone dans une autre pièce avant qu&apos;elle commence. Ne dis rien, elle le remarquera.
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gold">
                  Matériel
                </p>
                <p className="text-foreground/80">
                  Tu nous as dit qu&apos;elle relit toujours le même auteur. Passe à la librairie chercher son dernier roman, et glisse un mot à la page 21 (21 ans ensemble, elle comprendra).
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gold">
                  Moment à deux
                </p>
                <p className="text-foreground/80">
                  Jeudi, les enfants sont chez tes parents. Réserve la table du fond au petit italien de la rue de la Gare, sans lui dire où vous allez. Budget : 60 €.
                </p>
              </div>
            </div>
            <p className="text-xs text-foreground/30">
              Mathieu, choisi avec Caroline
            </p>
          </div>
        </div>
      </section>

      {/* ── Pourquoi ça fonctionne ── */}
      <section className="border-t border-foreground/10 bg-foreground/[0.03] px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <SectionLabel>Pourquoi ça fonctionne</SectionLabel>
          <h2 className="mb-16 font-display text-4xl uppercase tracking-wide sm:text-5xl">
            La routine imposée avec douceur
          </h2>
          <div className="grid gap-10 sm:grid-cols-2">
            {reasons.map((r) => (
              <div key={r.title}>
                <h3 className="mb-3 font-display text-lg uppercase tracking-wide">
                  {r.title}
                </h3>
                <p className="text-foreground/70">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Témoignages ── */}
      <section className="border-t border-foreground/10 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <SectionLabel>Ils l&apos;ont fait</SectionLabel>
          <h2 className="mb-16 font-display text-4xl uppercase tracking-wide sm:text-5xl">
            Ce que ça change
          </h2>
          <div className="grid gap-10 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.author} className="flex flex-col gap-4">
                <p className="border-l-2 border-gold pl-4 text-foreground/80 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-medium">{t.author}</p>
                  <p className="text-xs text-foreground/50">{t.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Devenir membre ── */}
      <section
        id="devenir-membre"
        className="border-t border-foreground/10 bg-foreground/[0.03] px-6 py-24 text-center"
      >
        <div className="mx-auto max-w-xl">
          <SectionLabel>Devenir membre</SectionLabel>
          <h2 className="mb-4 font-display text-4xl uppercase tracking-wide sm:text-5xl">
            Rejoins le club
          </h2>
          <p className="mb-2 text-foreground/70">
            5 €/mois. Pas d&apos;essai gratuit, pas d&apos;engagement.
          </p>
          <p className="mb-12 text-foreground/60 text-sm">
            Le paiement est suivi d&apos;un questionnaire de 5 minutes sur votre couple. Le premier mail part sous 24 h.
          </p>
          <Link
            href="/rejoindre"
            className="inline-block bg-gold px-10 py-4 font-display text-sm uppercase tracking-widest text-background transition-opacity hover:opacity-80"
          >
            Commencer pour 5 €/mois
          </Link>
          <p className="mt-6 text-xs text-foreground/40">
            Paiement sécurisé par Stripe · Résiliable en un clic
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-foreground/10 px-6 py-24">
        <div className="mx-auto max-w-2xl">
          <SectionLabel>Questions fréquentes</SectionLabel>
          <h2 className="mb-16 font-display text-4xl uppercase tracking-wide sm:text-5xl">
            FAQ
          </h2>
          <div className="divide-y divide-foreground/10">
            {faqs.map((faq) => (
              <div key={faq.q} className="py-8">
                <p className="mb-3 font-display text-lg uppercase tracking-wide">
                  {faq.q}
                </p>
                <p className="text-foreground/70">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-foreground/10 px-6 py-12 text-center">
        <p className="font-display text-2xl uppercase tracking-wide text-foreground/30">
          Karma
        </p>
        <p className="mt-2 text-xs text-foreground/30">
          hellokarma.fr · hello@hellokarma.fr
        </p>
        <div className="mt-4 flex justify-center gap-6 text-xs text-foreground/30">
          <Link href="/mentions-legales" className="hover:text-foreground/60">
            Mentions légales
          </Link>
          <Link href="/confidentialite" className="hover:text-foreground/60">
            Confidentialité
          </Link>
          <Link href="/connexion" className="hover:text-foreground/60">
            Connexion
          </Link>
        </div>
      </footer>
    </main>
  );
}
