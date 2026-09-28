import { createServiceClient } from "@/lib/supabase/server";

const reactionLabel: Record<string, string> = {
  adore: "Adoré",
  contente: "Contente",
  neutre: "Neutre",
  rate: "Raté",
};

export default async function AdminDashboardPage() {
  const supabase = await createServiceClient();

  // Monday of current week (UTC)
  const now = new Date();
  const utcDay = now.getUTCDay();
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - (utcDay === 0 ? 6 : utcDay - 1));
  monday.setUTCHours(0, 0, 0, 0);
  const weekStart = monday.toISOString();

  const [
    { data: membersByStatus },
    { count: publishedAttentions },
    { data: weekItems },
    { data: allItems },
    { data: recentCancellations },
  ] = await Promise.all([
    supabase
      .from("members")
      .select("subscription_status"),
    supabase
      .from("attentions")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
    // This week's batch_items
    supabase
      .from("batch_items")
      .select("done_at, reaction, weekly_batches!inner(sent_at, week_start)")
      .gte("weekly_batches.week_start", weekStart),
    // All-time batch_items with a reaction
    supabase
      .from("batch_items")
      .select("done_at, reaction"),
    // Last 5 cancellations
    supabase
      .from("members")
      .select("email, updated_at")
      .in("subscription_status", ["canceled", "past_due"])
      .order("updated_at", { ascending: false })
      .limit(5),
  ]);

  // Members by status
  const statusCounts = (membersByStatus ?? []).reduce<Record<string, number>>(
    (acc, m) => {
      acc[m.subscription_status] = (acc[m.subscription_status] ?? 0) + 1;
      return acc;
    },
    {}
  );
  const totalMembers = (membersByStatus ?? []).length;

  // This week validation rate
  const weekTotal = (weekItems ?? []).length;
  const weekDone = (weekItems ?? []).filter((i) => i.done_at).length;
  const weekRate = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : null;

  // All-time validation rate
  const allTotal = (allItems ?? []).length;
  const allDone = (allItems ?? []).filter((i) => i.done_at).length;
  const allRate = allTotal > 0 ? Math.round((allDone / allTotal) * 100) : null;

  // Reaction breakdown (all time, only items with a reaction)
  const reactions = (allItems ?? [])
    .filter((i) => i.reaction)
    .reduce<Record<string, number>>((acc, i) => {
      acc[i.reaction!] = (acc[i.reaction!] ?? 0) + 1;
      return acc;
    }, {});
  const totalReactions = Object.values(reactions).reduce((s, n) => s + n, 0);

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl uppercase tracking-wide">Dashboard</h1>

      {/* Membres */}
      <section className="mb-10">
        <h2 className="mb-4 text-xs uppercase tracking-[0.25em] text-foreground/50">Membres</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Total" value={totalMembers} />
          <Stat label="Actifs" value={statusCounts["active"] ?? 0} accent />
          <Stat label="En retard" value={statusCounts["past_due"] ?? 0} warn={!!statusCounts["past_due"]} />
          <Stat label="Résiliés" value={statusCounts["canceled"] ?? 0} />
        </div>
      </section>

      {/* Catalogue */}
      <section className="mb-10">
        <h2 className="mb-4 text-xs uppercase tracking-[0.25em] text-foreground/50">Catalogue</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Publiées" value={publishedAttentions ?? 0} />
          <Stat label="Objectif" value="150" />
        </div>
      </section>

      {/* Validation */}
      <section className="mb-10">
        <h2 className="mb-4 text-xs uppercase tracking-[0.25em] text-foreground/50">Validation</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat
            label="Cette semaine"
            value={weekRate !== null ? `${weekRate}%` : "—"}
            sub={weekTotal > 0 ? `${weekDone}/${weekTotal} idées` : "Aucun mail envoyé"}
            accent={weekRate !== null && weekRate >= 50}
          />
          <Stat
            label="Tout temps"
            value={allRate !== null ? `${allRate}%` : "—"}
            sub={allTotal > 0 ? `${allDone}/${allTotal} idées` : undefined}
            accent={allRate !== null && allRate >= 50}
          />
        </div>
      </section>

      {/* Réactions */}
      {totalReactions > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xs uppercase tracking-[0.25em] text-foreground/50">
            Réactions ({totalReactions} total)
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["adore", "contente", "neutre", "rate"] as const).map((r) => (
              <Stat
                key={r}
                label={reactionLabel[r]}
                value={reactions[r] ?? 0}
                sub={
                  reactions[r]
                    ? `${Math.round(((reactions[r] ?? 0) / totalReactions) * 100)}%`
                    : undefined
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Désabonnements récents */}
      {(recentCancellations ?? []).length > 0 && (
        <section>
          <h2 className="mb-4 text-xs uppercase tracking-[0.25em] text-foreground/50">
            Désabonnements récents
          </h2>
          <div className="divide-y divide-foreground/10 border border-foreground/10">
            {(recentCancellations ?? []).map((m) => (
              <div key={m.email} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-foreground/80">{m.email}</span>
                <span className="text-foreground/40">
                  {new Date(m.updated_at).toLocaleDateString("fr-FR")}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent = false,
  warn = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="border border-foreground/10 p-5">
      <p className={`text-2xl font-bold ${accent ? "text-gold" : warn ? "text-red-400" : ""}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-foreground/50">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-foreground/30">{sub}</p>}
    </div>
  );
}
