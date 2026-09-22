import { createClient } from "@/lib/supabase/server";
import { createTag, deleteTag } from "./actions";

const familyLabel: Record<string, string> = {
  interest: "Intérêt",
  avoid: "Éviter",
  constraint: "Contrainte",
};

export default async function TagsPage() {
  const supabase = await createClient();
  const { data: tags } = await supabase
    .from("tags")
    .select("*")
    .order("family")
    .order("label");

  const grouped = (tags ?? []).reduce<Record<string, typeof tags>>((acc, t) => {
    if (!acc[t.family]) acc[t.family] = [];
    acc[t.family]!.push(t);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl uppercase tracking-wide">Tags</h1>

      <div className="mb-10 grid gap-8 sm:grid-cols-3">
        {Object.entries(grouped).map(([family, list]) => (
          <div key={family}>
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold">
              {familyLabel[family]}
            </p>
            <div className="flex flex-col gap-1">
              {(list ?? []).map((t) => (
                <div key={t.id} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm">{t.label}</span>
                    <span className="ml-2 text-xs text-foreground/30">{t.slug}</span>
                  </div>
                  <form action={deleteTag}>
                    <input type="hidden" name="id" value={t.id} />
                    <button className="text-xs text-red-400/50 hover:text-red-400">
                      ×
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-foreground/10 pt-8">
        <h2 className="mb-4 font-display text-lg uppercase tracking-wide">
          Ajouter un tag
        </h2>
        <form action={createTag} className="flex gap-3">
          <input name="slug" required placeholder="slug_snake_case" className="input w-40" />
          <input name="label" required placeholder="Label affiché" className="input w-48" />
          <select name="family" required className="input w-36">
            <option value="interest">Intérêt</option>
            <option value="avoid">Éviter</option>
            <option value="constraint">Contrainte</option>
          </select>
          <button type="submit"
            className="bg-gold px-4 py-2 text-xs uppercase tracking-widest text-background hover:opacity-80">
            Ajouter
          </button>
        </form>
      </div>
    </div>
  );
}
