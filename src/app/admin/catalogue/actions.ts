"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type AttentionStatus = Database["public"]["Enums"]["attention_status"];

export async function saveAttention(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const id = formData.get("id") as string | null;

  const monthsRaw = formData.getAll("months") as string[];
  const months = monthsRaw.map((m) => parseInt(m, 10)).filter(Boolean);

  const occasionsRaw = formData.getAll("occasions") as string[];

  const payload = {
    category: formData.get("category") as Database["public"]["Enums"]["attention_category"],
    title: formData.get("title") as string,
    base_text: formData.get("base_text") as string,
    effort: formData.get("effort") as Database["public"]["Enums"]["effort_level"],
    budget_tier: formData.get("budget_tier") as Database["public"]["Enums"]["budget_tier"],
    months,
    occasions: occasionsRaw as Database["public"]["Enums"]["occasion_kind"][],
    requires_childcare: formData.get("requires_childcare") === "on",
    requires_big_city: formData.get("requires_big_city") === "on",
    requires_car: formData.get("requires_car") === "on",
    url: (formData.get("url") as string) || null,
    status: (formData.get("status") as AttentionStatus) ?? "draft",
    author_id: user.id,
  };

  if (id) {
    await supabase.from("attentions").update(payload).eq("id", id);
  } else {
    await supabase.from("attentions").insert(payload);
  }

  redirect("/admin/catalogue");
}

export async function setAttentionStatus(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const status = formData.get("status") as AttentionStatus;
  await supabase.from("attentions").update({ status }).eq("id", id);
  revalidatePath("/admin/catalogue");
}

export async function deleteAttention(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  await supabase.from("attentions").delete().eq("id", id);
  revalidatePath("/admin/catalogue");
}
