import ImportForm from "./ImportForm";

export default function ImportPage() {
  return (
    <div>
      <h1 className="mb-2 font-display text-3xl uppercase tracking-wide">Import</h1>
      <p className="mb-8 text-sm text-foreground/50">
        Dans Google Sheets, sélectionne toutes les colonnes + données, copie (Cmd+C), puis colle ci-dessous.
        Colonnes attendues (ordre libre) :{" "}
        <code className="text-xs text-gold">
          category · title · base_text · effort · budget_tier · months · occasions ·
          requires_childcare · requires_big_city · requires_car · url · status
        </code>
      </p>
      <ImportForm />
    </div>
  );
}
