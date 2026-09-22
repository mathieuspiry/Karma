import { createCheckoutSession } from "./actions";

export default function RejoindreePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <div className="w-full max-w-sm">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">
          Club privé
        </p>
        <h1 className="mb-4 font-display text-5xl uppercase tracking-wide">
          Devenir membre
        </h1>
        <p className="mb-2 text-foreground/70">
          5 €/mois, sans engagement.
        </p>
        <p className="mb-10 text-sm text-foreground/50">
          Le paiement est suivi d&apos;un questionnaire de 5 minutes sur votre couple.
          Le premier mail part sous 24 h.
        </p>

        <form action={createCheckoutSession}>
          <button
            type="submit"
            className="w-full bg-gold py-4 font-display text-sm uppercase tracking-widest text-background transition-opacity hover:opacity-80"
          >
            Commencer pour 5 €/mois
          </button>
        </form>

        <p className="mt-4 text-xs text-foreground/40">
          Paiement sécurisé par Stripe · Résiliable en un clic
        </p>
      </div>
    </main>
  );
}
