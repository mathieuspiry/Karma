import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AttentionForm from "../AttentionForm";

export default async function NouvelleAttentionPage() {
  const supabase = await createClient();
  const { data: tags } = await supabase.from("tags").select("*").order("family").order("label");

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/catalogue" className="text-xs text-foreground/40 hover:text-foreground/70">
          ← Catalogue
        </Link>
        <h1 className="font-display text-3xl uppercase tracking-wide">
          Nouvelle attention
        </h1>
      </div>
      <AttentionForm tags={tags ?? []} />
    </div>
  );
}
