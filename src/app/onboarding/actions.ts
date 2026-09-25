"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { dispatchBatch } from "@/lib/email/dispatchBatch";
import type { Database } from "@/lib/supabase/types";

type BudgetTier = Database["public"]["Enums"]["budget_tier"];
type CityType = Database["public"]["Enums"]["city_type"];
type LoveLanguage = Database["public"]["Enums"]["love_language"];

export async function saveOnboarding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const partnerFirstName = formData.get("partner_first_name") as string;
  const yearsTogether = parseInt(formData.get("years_together") as string, 10);
  const partnerBirthday = (formData.get("partner_birthday") as string) || null;
  const anniversaryDate = (formData.get("anniversary_date") as string) || null;
  const budgetTier = formData.get("budget_tier") as BudgetTier;
  const cityType = (formData.get("city_type") as CityType) || null;
  const loveLanguage = (formData.get("love_language") as LoveLanguage) || null;
  const freeContext = (formData.get("free_context") as string) || null;

  const { error } = await supabase.from("couples").upsert(
    {
      member_id: user.id,
      partner_first_name: partnerFirstName,
      years_together: isNaN(yearsTogether) ? null : yearsTogether,
      partner_birthday: partnerBirthday || null,
      anniversary_date: anniversaryDate || null,
      budget_tier: budgetTier,
      city_type: cityType,
      love_language: loveLanguage,
      free_context: freeContext,
    },
    { onConflict: "member_id" }
  );

  if (error) throw new Error(error.message);

  await supabase
    .from("members")
    .update({ onboarding_completed_at: new Date().toISOString() })
    .eq("id", user.id);

  // Rule 9: send first batch immediately after onboarding (fire and forget — don't block redirect)
  dispatchBatch(user.id).catch((err) =>
    console.error("[onboarding] dispatchBatch failed:", err)
  );

  redirect("/profil");
}
