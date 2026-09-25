import { NextRequest, NextResponse } from "next/server";
import { createServiceClientDirect } from "@/lib/supabase/server";
import { dispatchBatch } from "@/lib/email/dispatchBatch";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClientDirect();

  const { data: members, error } = await supabase
    .from("members")
    .select("id")
    .eq("subscription_status", "active")
    .not("onboarding_completed_at", "is", null);

  if (error) {
    console.error("[cron/weekly] fetch members:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = { processed: 0, skipped: 0, errors: 0 };

  for (const member of members ?? []) {
    try {
      const sent = await dispatchBatch(member.id);
      if (sent) results.processed++;
      else results.skipped++;
    } catch (err) {
      console.error(`[cron/weekly] member ${member.id}:`, err);
      results.errors++;
    }
  }

  return NextResponse.json(results);
}
