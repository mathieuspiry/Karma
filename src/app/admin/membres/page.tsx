import { createClient } from "@/lib/supabase/server";

const statusLabel: Record<string, string> = {
  active: "Actif",
  trialing: "Essai",
  past_due: "Retard",
  canceled: "Résilié",
  incomplete: "Incomplet",
};
const statusColor: Record<string, string> = {
  active: "text-gold",
  trialing: "text-foreground/60",
  past_due: "text-red-400",
  canceled: "text-foreground/30",
  incomplete: "text-foreground/40",
};

export default async function MembresPage() {
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("members")
    .select("id, email, first_name, subscription_status, onboarding_completed_at, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl uppercase tracking-wide">
        Membres{" "}
        <span className="text-foreground/30">({members?.length ?? 0})</span>
      </h1>

      <div className="divide-y divide-foreground/10">
        <div className="grid grid-cols-5 gap-4 pb-2 text-xs uppercase tracking-widest text-foreground/30">
          <span className="col-span-2">Email</span>
          <span>Statut</span>
          <span>Onboarding</span>
          <span>Inscrit le</span>
        </div>
        {(members ?? []).map((m) => (
          <div key={m.id} className="grid grid-cols-5 gap-4 py-3 text-sm">
            <span className="col-span-2 truncate text-foreground/80">
              {m.first_name ? `${m.first_name} — ` : ""}{m.email}
            </span>
            <span className={statusColor[m.subscription_status]}>
              {statusLabel[m.subscription_status]}
            </span>
            <span className={m.onboarding_completed_at ? "text-gold" : "text-foreground/30"}>
              {m.onboarding_completed_at ? "Complété" : "En attente"}
            </span>
            <span className="text-foreground/40">
              {new Date(m.created_at).toLocaleDateString("fr-FR")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
