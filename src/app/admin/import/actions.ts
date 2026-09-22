"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type AttentionInsert = Database["public"]["Tables"]["attentions"]["Insert"];

// Expected CSV columns (case-insensitive, trimmed):
// category | title | base_text | effort | budget_tier | months | occasions |
// requires_childcare | requires_big_city | requires_car | url | status

function parseRow(headers: string[], values: string[]): AttentionInsert | null {
  const row: Record<string, string> = {};
  headers.forEach((h, i) => {
    row[h.trim().toLowerCase()] = (values[i] ?? "").trim();
  });

  if (!row.category || !row.title || !row.base_text) return null;

  const months = row.months
    ? row.months.split(",").map((m) => parseInt(m.trim(), 10)).filter((n) => n >= 1 && n <= 12)
    : [];

  const occasions = row.occasions
    ? (row.occasions.split(",").map((o) => o.trim()).filter(Boolean) as Database["public"]["Enums"]["occasion_kind"][])
    : [];

  return {
    category: row.category as Database["public"]["Enums"]["attention_category"],
    title: row.title,
    base_text: row.base_text,
    effort: (row.effort || "leger") as Database["public"]["Enums"]["effort_level"],
    budget_tier: (row.budget_tier || "zero") as Database["public"]["Enums"]["budget_tier"],
    months,
    occasions,
    requires_childcare: row.requires_childcare === "true" || row.requires_childcare === "1",
    requires_big_city: row.requires_big_city === "true" || row.requires_big_city === "1",
    requires_car: row.requires_car === "true" || row.requires_car === "1",
    url: row.url || null,
    status: (row.status || "draft") as Database["public"]["Enums"]["attention_status"],
  };
}

export async function importCsv(formData: FormData): Promise<{ inserted: number; errors: string[] }> {
  const supabase = await createClient();
  const csv = formData.get("csv") as string;

  const lines = csv.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return { inserted: 0, errors: ["CSV vide ou sans données"] };

  const headers = lines[0].split("\t").length > 1
    ? lines[0].split("\t")
    : lines[0].split(",");

  const rows: AttentionInsert[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(headers.length > 1 && lines[0].includes("\t") ? "\t" : ",");
    const row = parseRow(headers, values);
    if (row) {
      rows.push(row);
    } else {
      errors.push(`Ligne ${i + 1} ignorée (category, title ou base_text manquant)`);
    }
  }

  if (rows.length === 0) return { inserted: 0, errors };

  const { error } = await supabase.from("attentions").insert(rows);
  if (error) errors.push(`Erreur Supabase : ${error.message}`);

  revalidatePath("/admin/catalogue");
  return { inserted: error ? 0 : rows.length, errors };
}
