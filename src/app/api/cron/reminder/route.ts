import { NextRequest, NextResponse } from "next/server";
import { createServiceClientDirect } from "@/lib/supabase/server";
import { sendReminderEmail } from "@/lib/email/send";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const supabase = createServiceClientDirect();

  // Monday of this week (UTC)
  const d = new Date(now);
  const utcDay = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - (utcDay === 0 ? 6 : utcDay - 1));
  d.setUTCHours(0, 0, 0, 0);
  const weekStart = d.toISOString();

  const { data: members } = await supabase
    .from("members")
    .select("id, email, first_name")
    .eq("subscription_status", "active")
    .not("onboarding_completed_at", "is", null);

  const results = { processed: 0, skipped: 0 };

  for (const member of members ?? []) {
    const { data: batch } = await supabase
      .from("weekly_batches")
      .select("id, reminder_sent_at")
      .eq("member_id", member.id)
      .eq("week_start", weekStart)
      .maybeSingle();

    // No batch this week, or reminder already sent
    if (!batch || batch.reminder_sent_at) {
      results.skipped++;
      continue;
    }

    // Skip if at least one item is already done
    const { count: doneCount } = await supabase
      .from("batch_items")
      .select("id", { count: "exact", head: true })
      .eq("batch_id", batch.id)
      .not("done_at", "is", null);

    if ((doneCount ?? 0) > 0) {
      results.skipped++;
      continue;
    }

    const { data: couple } = await supabase
      .from("couples")
      .select("partner_first_name")
      .eq("member_id", member.id)
      .maybeSingle();

    if (!couple) {
      results.skipped++;
      continue;
    }

    try {
      await sendReminderEmail(
        member.email,
        member.first_name ?? "toi",
        couple.partner_first_name
      );
      await supabase
        .from("weekly_batches")
        .update({ reminder_sent_at: now.toISOString() })
        .eq("id", batch.id);
      results.processed++;
    } catch (err) {
      console.error("[cron/reminder] send:", err);
    }
  }

  return NextResponse.json(results);
}
