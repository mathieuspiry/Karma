import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AttentionForm from "../AttentionForm";

export default async function EditAttentionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: attention }, { data: tags }] = await Promise.all([
    supabase.from("attentions").select("*").eq("id", id).single(),
    supabase.from("tags").select("*").order("family").order("label"),
  ]);

  if (!attention) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/catalogue" className="text-xs text-foreground/40 hover:text-foreground/70">
          ← Catalogue
        </Link>
        <h1 className="font-display text-3xl uppercase tracking-wide">
          {attention.title}
        </h1>
      </div>
      <AttentionForm attention={attention} tags={tags ?? []} />
    </div>
  );
}
