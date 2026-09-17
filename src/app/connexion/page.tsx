"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export default function ConnexionPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError("Une erreur est survenue. Vérifie ton adresse email et réessaie.");
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
        <h1 className="font-display text-4xl uppercase tracking-wide">
          Vérifie tes mails
        </h1>
        <p className="max-w-sm text-foreground/70">
          On t&apos;a envoyé un lien de connexion à{" "}
          <strong className="text-foreground">{email}</strong>. Clique dessus
          pour accéder à ton espace.
        </p>
        <p className="text-sm text-foreground/50">
          Pas reçu ? Vérifie les spams.
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 font-display text-4xl uppercase tracking-wide">
          Connexion
        </h1>
        <p className="mb-8 text-foreground/70">
          Entre ton adresse email, on t&apos;envoie un lien. Pas de mot de passe.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            required
            placeholder="ton@email.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-none border border-foreground/30 bg-transparent px-4 py-3 text-foreground placeholder:text-foreground/40 focus:border-gold focus:outline-none"
          />
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-gold py-3 font-display text-sm uppercase tracking-widest text-background transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {loading ? "Envoi en cours..." : "Recevoir mon lien"}
          </button>
        </form>
      </div>
    </main>
  );
}
