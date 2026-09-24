// Replaces template variables in base_text with couple-specific values.
// Variables: {prenom}, {annees}, {ville}
// This is a pure substitution — no AI, no invented content.
export function personalizeText(
  text: string,
  vars: { prenom: string; annees: number | null; ville: string | null }
): string {
  return text
    .replace(/\{prenom\}/g, vars.prenom)
    .replace(/\{annees\}/g, vars.annees !== null ? String(vars.annees) : "quelques")
    .replace(/\{ville\}/g, vars.ville ?? "votre ville");
}
