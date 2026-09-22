"use client";

import { useState } from "react";
import { importCsv } from "./actions";

export default function ImportForm() {
  const [result, setResult] = useState<{ inserted: number; errors: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await importCsv(fd);
    setResult(res);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
      <div className="flex flex-col gap-2">
        <label className="text-sm text-foreground/70">
          Colle le contenu CSV ou TSV ici (copier-coller depuis Google Sheets)
        </label>
        <textarea
          name="csv"
          required
          rows={16}
          className="input resize-y font-mono text-xs"
          placeholder={"category\ttitle\tbase_text\teffort\tbudget_tier\nde_toi\tPoser le téléphone\tCe soir..."}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="self-start bg-gold px-6 py-3 text-xs uppercase tracking-widest text-background hover:opacity-80 disabled:opacity-50"
      >
        {loading ? "Import en cours..." : "Importer"}
      </button>

      {result && (
        <div className="border border-foreground/20 p-4">
          <p className="mb-2 text-sm font-medium text-gold">
            {result.inserted} attention(s) importée(s)
          </p>
          {result.errors.map((e, i) => (
            <p key={i} className="text-xs text-red-400">{e}</p>
          ))}
        </div>
      )}
    </form>
  );
}
