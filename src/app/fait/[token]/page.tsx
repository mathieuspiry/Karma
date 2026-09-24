import { notFound } from "next/navigation";
import { createServiceClientDirect } from "@/lib/supabase/server";
import { verifyDoneToken } from "@/lib/email/token";

export default async function FaitPage({ params }: PageProps<"/fait/[token]">) {
  const { token } = await params;

  const verified = verifyDoneToken(token);
  if (!verified) notFound();

  const supabase = createServiceClientDirect();

  const { data: item, error } = await supabase
    .from("batch_items")
    .select("id, done_at, attentions(title)")
    .eq("id", verified.batchItemId)
    .maybeSingle();

  if (error || !item) notFound();

  const alreadyDone = !!item.done_at;

  if (!alreadyDone) {
    await supabase
      .from("batch_items")
      .update({ done_at: new Date().toISOString() })
      .eq("id", item.id);
  }

  const title = (item.attentions as unknown as { title: string } | null)?.title ?? "";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <p className="mb-6 font-display text-xs uppercase tracking-widest text-gold">KARMA</p>

        {alreadyDone ? (
          <>
            <h1 className="mb-4 font-display text-3xl uppercase tracking-wide">
              Déjà comptabilisé
            </h1>
            <p className="text-foreground/60">
              Tu avais déjà validé cette idée. Elle est bien enregistrée.
            </p>
          </>
        ) : (
          <>
            <h1 className="mb-4 font-display text-3xl uppercase tracking-wide">
              Bien joué.
            </h1>
            <p className="mb-2 text-foreground/80">{title}</p>
            <p className="text-foreground/60">
              C&apos;est noté. On s&apos;en souviendra la semaine prochaine.
            </p>
          </>
        )}

        <p className="mt-12 text-xs text-foreground/30">
          Mathieu · choisi avec Caroline
        </p>
      </div>
    </main>
  );
}
