import { NextRequest, NextResponse } from "next/server";
import { createServiceClientDirect } from "@/lib/supabase/server";
import { sendReminderEmail } from "@/lib/email/send";

function localTimeParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const dayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  return {
    day: dayMap[get("weekday")] ?? -1,
    hour: parseInt(get("hour"), 10),
    minute: parseInt(get("minute"), 10),
  };
}

const REMINDER_DAY = 5; // Friday
const REMINDER_HOUR = 8;
const REMINDER_MINUTE = 45;

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const supabase = createServiceClientDirect();

  const { data: members } = await supabase
    .from("members")
    .select("id, email, first_name, timezone")
    .eq("subscription_status", "active")
    .not("onboarding_completed_at", "is", null);

  type Member = NonNullable<typeof members>[number];
  const targets = (members ?? []).filter((m: Member) => {
    try {
      const local = localTimeParts(now, m.timezone);
      return (
        local.day === REMINDER_DAY &&
        local.hour === REMINDER_HOUR &&
        local.minute >= REMINDER_MINUTE &&
        local.minute < REMINDER_MINUTE + 15
      );
    } catch {
      return false;
    }
  });

  if (targets.length === 0) return NextResponse.json({ processed: 0 });

  // Monday of this week (UTC)
  const d = new Date(now);
  const utcDay = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - (utcDay === 0 ? 6 : utcDay - 1));
  d.setUTCHours(0, 0, 0, 0);
  const weekStart = d.toISOString();

  const results = { processed: 0, skipped: 0 };

  for (const member of targets) {
    const { data: batch } = await supabase
      .from("weekly_batches")
      .select("id, reminder_sent_at")
      .eq("member_id", member.id)
      .eq("week_start", weekStart)
      .maybeSingle();

    if (!batch || batch.reminder_sent_at) {
      results.skipped++;
      continue;
    }

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
