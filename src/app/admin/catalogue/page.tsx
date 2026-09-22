import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteAttention, setAttentionStatus } from "./actions";

const categoryLabel: Record<string, string> = {
  de_toi: "De toi",
  materiel: "Matériel",
  moment_a_deux: "Moment à deux",
};
const statusLabel: Record<string, string> = {
  draft: "Brouillon",
  published: "Publié",
  retired: "Retiré",
};
const statusColor: Record<string, string> = {
  draft: "text-foreground/40",
  published: "text-gold",
  retired: "text-foreground/30 line-through",
};

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string }>;
}) {
  const { status, category } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("attentions")
    .select("id, title, category, effort, budget_tier, status")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status as "draft" | "published" | "retired");
  if (category) query = query.eq("category", category as "de_toi" | "materiel" | "moment_a_deux");

  const { data: attentions } = await query;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl uppercase tracking-wide">
          Catalogue
        </h1>
        <Link
          href="/admin/catalogue/nouvelle"
          className="bg-gold px-4 py-2 text-xs uppercase tracking-widest text-background hover:opacity-80"
        >
          + Nouvelle
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-3 text-xs">
        {["", "draft", "published", "retired"].map((s) => (
          <Link
            key={s}
            href={s ? `/admin/catalogue?status=${s}` : "/admin/catalogue"}
            className={`px-3 py-1 border ${status === s || (!status && !s) ? "border-gold text-gold" : "border-foreground/20 text-foreground/50 hover:border-foreground/50"}`}
          >
            {s ? statusLabel[s] : "Tous"}
          </Link>
        ))}
        <span className="mx-2 text-foreground/20">|</span>
        {["", "de_toi", "materiel", "moment_a_deux"].map((c) => (
          <Link
            key={c}
            href={c ? `/admin/catalogue?category=${c}` : "/admin/catalogue"}
            className={`px-3 py-1 border ${category === c || (!category && !c) ? "border-gold text-gold" : "border-foreground/20 text-foreground/50 hover:border-foreground/50"}`}
          >
            {c ? categoryLabel[c] : "Catégories"}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="divide-y divide-foreground/10">
        {(attentions ?? []).length === 0 && (
          <p className="py-8 text-center text-foreground/40">
            Aucune attention pour l&apos;instant.
          </p>
        )}
        {(attentions ?? []).map((a) => (
          <div key={a.id} className="flex items-center gap-4 py-3">
            <span className={`w-20 text-xs ${statusColor[a.status]}`}>
              {statusLabel[a.status]}
            </span>
            <span className="w-28 text-xs text-foreground/50">
              {categoryLabel[a.category]}
            </span>
            <span className="flex-1 text-sm">{a.title}</span>
            <div className="flex items-center gap-2">
              {a.status === "draft" && (
                <form action={setAttentionStatus}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="status" value="published" />
                  <button className="text-xs text-gold hover:underline">
                    Publier
                  </button>
                </form>
              )}
              {a.status === "published" && (
                <form action={setAttentionStatus}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="status" value="retired" />
                  <button className="text-xs text-foreground/40 hover:underline">
                    Retirer
                  </button>
                </form>
              )}
              <Link
                href={`/admin/catalogue/${a.id}`}
                className="text-xs text-foreground/50 hover:text-foreground"
              >
                Éditer
              </Link>
              <form action={deleteAttention}>
                <input type="hidden" name="id" value={a.id} />
                <button className="text-xs text-red-400/60 hover:text-red-400">
                  Suppr.
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
