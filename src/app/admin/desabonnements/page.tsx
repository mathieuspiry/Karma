import { createServiceClient } from "@/lib/supabase/server";

const statusLabel: Record<string, string> = {
  canceled: "Résilié",
  past_due: "Paiement en retard",
};

export default async function DesabonnementsPage() {
  const supabase = await createServiceClient();

  const { data: members } = await supabase
    .from("members")
    .select("id, email, first_name, subscription_status, updated_at, stripe_customer_id")
    .in("subscription_status", ["canceled", "past_due"])
    .order("updated_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl uppercase tracking-wide">Désabonnements</h1>
      <p className="mb-8 text-sm text-foreground/50">
        {(members ?? []).length} membre(s) résilié(s) ou en retard de paiement.
      </p>

      {(members ?? []).length === 0 ? (
        <p className="text-foreground/40">Aucun désabonnement pour l&apos;instant.</p>
      ) : (
        <div className="divide-y divide-foreground/10 border border-foreground/10">
          <div className="grid grid-cols-4 gap-4 px-4 py-2 text-xs uppercase tracking-widest text-foreground/30">
            <span>Email</span>
            <span>Prénom</span>
            <span>Statut</span>
            <span>Date</span>
          </div>
          {(members ?? []).map((m) => (
            <div key={m.id} className="grid grid-cols-4 gap-4 px-4 py-3 text-sm">
              <a
                href={`mailto:${m.email}`}
                className="text-foreground/80 hover:text-gold"
              >
                {m.email}
              </a>
              <span className="text-foreground/60">{m.first_name ?? "—"}</span>
              <span
                className={
                  m.subscription_status === "past_due"
                    ? "text-red-400"
                    : "text-foreground/40"
                }
              >
                {statusLabel[m.subscription_status] ?? m.subscription_status}
              </span>
              <span className="text-foreground/40">
                {new Date(m.updated_at).toLocaleDateString("fr-FR")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
