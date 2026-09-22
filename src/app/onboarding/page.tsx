import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { saveOnboarding } from "./actions";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  // If already completed, go to profil
  const { data: member } = await supabase
    .from("members")
    .select("onboarding_completed_at")
    .eq("id", user.id)
    .single();

  if (member?.onboarding_completed_at) redirect("/profil");

  return (
    <main className="flex flex-1 flex-col items-center justify-start px-6 py-16">
      <div className="w-full max-w-lg">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">
          Questionnaire · 5 minutes
        </p>
        <h1 className="mb-2 font-display text-4xl uppercase tracking-wide">
          Parle-nous d&apos;elle
        </h1>
        <p className="mb-10 text-foreground/60">
          Ces informations nous permettent de choisir des attentions vraiment
          adaptées. Tu pourras tout modifier depuis ton profil.
        </p>

        <form action={saveOnboarding} className="flex flex-col gap-10">
          {/* Essentiels */}
          <fieldset className="flex flex-col gap-6">
            <legend className="mb-2 text-xs uppercase tracking-[0.2em] text-gold">
              Essentiel
            </legend>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-foreground/70">
                Son prénom à elle
              </label>
              <input
                name="partner_first_name"
                type="text"
                required
                placeholder="Marie"
                className="input"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-foreground/70">
                Depuis combien d&apos;années êtes-vous ensemble ?
              </label>
              <input
                name="years_together"
                type="number"
                min={0}
                max={60}
                required
                placeholder="7"
                className="input"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-foreground/70">
                  Son anniversaire
                </label>
                <input
                  name="partner_birthday"
                  type="date"
                  className="input"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-foreground/70">
                  Date de rencontre ou de mariage
                </label>
                <input
                  name="anniversary_date"
                  type="date"
                  className="input"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-foreground/70">
                Budget mensuel confortable pour les attentions
              </label>
              <select name="budget_tier" required className="input">
                <option value="">Choisir...</option>
                <option value="zero">Pas de budget (attentions gratuites)</option>
                <option value="moins_20">Moins de 20 €/mois</option>
                <option value="20_50">20 à 50 €/mois</option>
                <option value="50_150">50 à 150 €/mois</option>
                <option value="plus_150">Plus de 150 €/mois</option>
              </select>
            </div>
          </fieldset>

          {/* Affine */}
          <fieldset className="flex flex-col gap-6">
            <legend className="mb-2 text-xs uppercase tracking-[0.2em] text-gold">
              Pour affiner les idées (facultatif)
            </legend>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-foreground/70">
                Type de lieu où vous vivez
              </label>
              <select name="city_type" className="input">
                <option value="">Choisir...</option>
                <option value="grande_ville">Grande ville</option>
                <option value="periurbain">Périurbain / banlieue</option>
                <option value="campagne">Campagne</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-foreground/70">
                Son langage d&apos;amour dominant
              </label>
              <select name="love_language" className="input">
                <option value="">Je ne sais pas / les deux</option>
                <option value="mots">Mots et compliments</option>
                <option value="temps">Temps de qualité ensemble</option>
                <option value="cadeaux">Cadeaux et surprises</option>
                <option value="services">Services et coups de main</option>
                <option value="contact">Contact physique</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-foreground/70">
                Ce que tu fais déjà bien, et ce qu&apos;elle te reproche (en quelques
                mots)
              </label>
              <textarea
                name="free_context"
                rows={3}
                placeholder="Ex: Je cuisine souvent pour elle mais j'oublie les petits gestes du quotidien..."
                className="input resize-none"
              />
            </div>
          </fieldset>

          <button
            type="submit"
            className="bg-gold py-4 font-display text-sm uppercase tracking-widest text-background transition-opacity hover:opacity-80"
          >
            Valider et accéder à mon espace
          </button>
        </form>
      </div>
    </main>
  );
}
