import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ count: totalMembers }, { count: activeMembers }, { count: totalAttentions }] =
    await Promise.all([
      supabase.from("members").select("*", { count: "exact", head: true }),
      supabase
        .from("members")
        .select("*", { count: "exact", head: true })
        .eq("subscription_status", "active"),
      supabase
        .from("attentions")
        .select("*", { count: "exact", head: true })
        .eq("status", "published"),
    ]);

  const stats = [
    { label: "Membres total", value: totalMembers ?? 0 },
    { label: "Abonnements actifs", value: activeMembers ?? 0 },
    { label: "Attentions publiées", value: totalAttentions ?? 0 },
    { label: "Objectif catalogue", value: "150" },
  ];

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl uppercase tracking-wide">
        Dashboard
      </h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="border border-foreground/10 p-5">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="mt-1 text-xs text-foreground/50">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
