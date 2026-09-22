import type { Database } from "@/lib/supabase/types";
import { saveAttention } from "./actions";

type Attention = Database["public"]["Tables"]["attentions"]["Row"];
type Tag = Database["public"]["Tables"]["tags"]["Row"];

const MONTHS = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
  "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc",
];

const OCCASIONS = [
  { value: "anniversaire", label: "Anniversaire" },
  { value: "rencontre", label: "Date de rencontre" },
  { value: "mariage", label: "Mariage" },
  { value: "saint_valentin", label: "Saint-Valentin" },
  { value: "fete_des_meres", label: "Fête des mères" },
  { value: "noel", label: "Noël" },
  { value: "rentree", label: "Rentrée" },
  { value: "autre", label: "Autre" },
];

interface Props {
  attention?: Attention;
  tags: Tag[];
}

export default function AttentionForm({ attention, tags }: Props) {
  const fits = tags.filter((t) => t.family === "interest");
  const avoids = tags.filter((t) => t.family === "avoid");
  const constraints = tags.filter((t) => t.family === "constraint");

  return (
    <form action={saveAttention} className="flex flex-col gap-6 max-w-2xl">
      {attention && <input type="hidden" name="id" value={attention.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-foreground/50">Catégorie *</label>
          <select name="category" required className="input" defaultValue={attention?.category ?? ""}>
            <option value="">Choisir...</option>
            <option value="de_toi">De toi</option>
            <option value="materiel">Matériel</option>
            <option value="moment_a_deux">Moment à deux</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-foreground/50">Statut</label>
          <select name="status" className="input" defaultValue={attention?.status ?? "draft"}>
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
            <option value="retired">Retiré</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-foreground/50">Titre interne *</label>
        <input name="title" required className="input" defaultValue={attention?.title ?? ""} placeholder="Ex: Pose le téléphone" />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-foreground/50">
          Texte de base * (tutoiement, variables {"{prenom}"} {"{annees}"} {"{ville}"})
        </label>
        <textarea name="base_text" required rows={4} className="input resize-none"
          defaultValue={attention?.base_text ?? ""}
          placeholder="Ce soir, quand {prenom} raconte sa journée..." />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-foreground/50">Effort</label>
          <select name="effort" className="input" defaultValue={attention?.effort ?? "leger"}>
            <option value="leger">Léger (moins de 5 min)</option>
            <option value="moyen">Moyen (1h, un déplacement)</option>
            <option value="lourd">Lourd (organisation)</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-foreground/50">Budget</label>
          <select name="budget_tier" className="input" defaultValue={attention?.budget_tier ?? "zero"}>
            <option value="zero">Gratuit</option>
            <option value="moins_20">Moins de 20 €</option>
            <option value="20_50">20 à 50 €</option>
            <option value="50_150">50 à 150 €</option>
            <option value="plus_150">Plus de 150 €</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-foreground/50">Mois (vide = toute l&apos;année)</label>
        <div className="flex flex-wrap gap-2">
          {MONTHS.map((m, i) => (
            <label key={i} className="flex items-center gap-1 text-sm">
              <input type="checkbox" name="months" value={i + 1}
                defaultChecked={attention?.months?.includes(i + 1)} />
              {m}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-foreground/50">Occasions</label>
        <div className="flex flex-wrap gap-3">
          {OCCASIONS.map((o) => (
            <label key={o.value} className="flex items-center gap-1 text-sm">
              <input type="checkbox" name="occasions" value={o.value}
                defaultChecked={attention?.occasions?.includes(o.value as Database["public"]["Enums"]["occasion_kind"])} />
              {o.label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-foreground/50">Contraintes pratiques</label>
        <div className="flex gap-6">
          {[
            { name: "requires_childcare", label: "Garde d'enfants" },
            { name: "requires_big_city", label: "Grande ville" },
            { name: "requires_car", label: "Voiture" },
          ].map((c) => (
            <label key={c.name} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name={c.name}
                defaultChecked={attention?.[c.name as keyof Attention] as boolean} />
              {c.label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-foreground/50">Lien (optionnel)</label>
        <input name="url" type="url" className="input" defaultValue={attention?.url ?? ""} placeholder="https://..." />
      </div>

      <button type="submit"
        className="self-start bg-gold px-6 py-3 text-xs uppercase tracking-widest text-background hover:opacity-80">
        Enregistrer
      </button>
    </form>
  );
}
