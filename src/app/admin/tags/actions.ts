"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export async function createTag(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("tags").insert({
    slug: formData.get("slug") as string,
    label: formData.get("label") as string,
    family: formData.get("family") as Database["public"]["Enums"]["tag_family"],
  });
  revalidatePath("/admin/tags");
}

export async function deleteTag(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("tags").delete().eq("id", formData.get("id") as string);
  revalidatePath("/admin/tags");
}
