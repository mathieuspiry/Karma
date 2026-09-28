import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import SignOutButton from "./SignOutButton";

const statusLabels: Record<string, string> = {
  active: "Actif",
  trialing: "Période d'essai",
  past_due: "Paiement en retard",
  canceled: "Résilié",
  incomplete: "Incomplet",
};

const budgetLabels: Record<string, string> = {
  zero: "Pas de budget",
  moins_20: "Moins de 20 €/mois",
  "20_50": "20 à 50 €/mois",
  "50_150": "50 à 150 €/mois",
  plus_150: "Plus de 150 €/mois",
};

const categoryLabel: Record<string, string> = {
  de_toi: "De toi",
  materiel: "Matériel",
  moment_a_deux: "Moment à deux",
};

const categoryOrder: Record<string, number> = {
  de_toi: 0,
  materiel: 1,
  moment_a_deux: 2,
};

const reactionLabel: Record<string, string> = {
  adore: "Adoré",
  contente: "Contente",
  neutre: "Neutre",
  rate: "Raté",
};

type HistoryItem = {
  id: string;
  category: string;
  done_at: string | null;
  reaction: string | null;
  attentions: { title: string } | null;
};

type HistoryBatch = {
  id: string;
  week_start: string;
  batch_items: HistoryItem[];
};

export default async function ProfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const [{ data: member }, { data: couple }, { data: rawBatches }] = await Promise.all([
    supabase
      .from("members")
      .select("first_name, subscription_status, stripe_customer_id, onboarding_completed_at")
      .eq("id", user.id)
      .single(),
    supabase
      .from("couples")
      .select("partner_first_name, years_together, budget_tier")
      .eq("member_id", user.id)
      .single(),
    supabase
      .from("weekly_batches")
      .select("id, week_start, batch_items(id, category, done_at, reaction, attentions(title))")
      .eq("member_id", user.id)
      .not("sent_at", "is", null)
      .order("week_start", { ascending: false })
      .limit(12),
  ]);

  const batches = rawBatches as unknown as HistoryBatch[] | null;

  // Generate Stripe Customer Portal URL if we have a customer ID
  let portalUrl: string | null = null;
  if (member?.stripe_customer_id) {
    try {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: member.stripe_customer_id,
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/profil`,
      });
      portalUrl = portalSession.url;
    } catch {
      // Portal not configured yet — ignore
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-start px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 font-display text-4xl uppercase tracking-wide">
          Mon espace
        </h1>

        {/* Compte */}
        <section className="mb-8">
          <p className="mb-1 text-xs uppercase tracking-[0.2em] text-gold">
            Compte
          </p>
          <p className="text-foreground/80">{user.email}</p>
          {member?.first_name && (
            <p className="text-foreground/60">{member.first_name}</p>
          )}
        </section>

        {/* Abonnement */}
        <section className="mb-8">
          <p className="mb-1 text-xs uppercase tracking-[0.2em] text-gold">
            Abonnement
          </p>
          <p className="mb-3 text-foreground/80">
            {member?.subscription_status
              ? statusLabels[member.subscription_status] ?? member.subscription_status
              : "Aucun abonnement actif"}
          </p>
          {portalUrl ? (
            <a
              href={portalUrl}
              className="inline-block border border-foreground/30 px-4 py-2 text-xs uppercase tracking-widest text-foreground/70 transition-colors hover:border-foreground hover:text-foreground"
            >
              Gérer mon abonnement
            </a>
          ) : (
            !member?.stripe_customer_id && (
              <Link
                href="/rejoindre"
                className="inline-block bg-gold px-4 py-2 text-xs uppercase tracking-widest text-background transition-opacity hover:opacity-80"
              >
                S&apos;abonner
              </Link>
            )
          )}
        </section>

        {/* Profil couple */}
        <section className="mb-8">
          <p className="mb-1 text-xs uppercase tracking-[0.2em] text-gold">
            Votre couple
          </p>
          {couple ? (
            <div className="mb-3 space-y-1 text-foreground/80">
              <p>Elle s&apos;appelle {couple.partner_first_name}</p>
              {couple.years_together && (
                <p>Ensemble depuis {couple.years_together} ans</p>
              )}
              {couple.budget_tier && (
                <p>{budgetLabels[couple.budget_tier]}</p>
              )}
            </div>
          ) : (
            <p className="mb-3 text-foreground/50">
              Questionnaire non complété
            </p>
          )}
          <Link
            href="/onboarding"
            className="inline-block border border-foreground/30 px-4 py-2 text-xs uppercase tracking-widest text-foreground/70 transition-colors hover:border-foreground hover:text-foreground"
          >
            {couple ? "Modifier le profil" : "Compléter le questionnaire"}
          </Link>
        </section>

        {/* Historique */}
        {(batches ?? []).length > 0 && (
          <section className="mb-8">
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-gold">
              Historique
            </p>
            <div className="flex flex-col gap-6">
              {(batches ?? []).map((batch) => {
                const items = [...(batch.batch_items ?? [])].sort(
                  (a, b) =>
                    (categoryOrder[a.category] ?? 0) -
                    (categoryOrder[b.category] ?? 0)
                );
                return (
                  <div key={batch.id}>
                    <p className="mb-2 text-xs text-foreground/40">
                      {new Date(batch.week_start).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <div className="flex flex-col gap-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-start gap-2.5">
                          <span
                            className={`mt-0.5 text-xs ${
                              item.done_at ? "text-gold" : "text-foreground/25"
                            }`}
                          >
                            {item.done_at ? "✓" : "·"}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="text-xs uppercase tracking-wider text-foreground/30">
                                {categoryLabel[item.category] ?? item.category}
                              </span>
                              {item.reaction && (
                                <span className="shrink-0 text-xs text-foreground/30">
                                  {reactionLabel[item.reaction] ?? item.reaction}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-foreground/70">
                              {item.attentions?.title ?? "—"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <SignOutButton />
      </div>
    </main>
  );
}
