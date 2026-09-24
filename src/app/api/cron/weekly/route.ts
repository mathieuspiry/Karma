import { NextRequest, NextResponse } from "next/server";
import { createServiceClientDirect } from "@/lib/supabase/server";
import { selectTrio } from "@/lib/engine";
import { personalizeText } from "@/lib/email/personalize";
import { createDoneToken } from "@/lib/email/token";
import { sendWeeklyEmail } from "@/lib/email/send";
import type { CandidateAttention, CoupleProfile, SentRecord, UpcomingOccasion } from "@/lib/engine";
import type { Database } from "@/lib/supabase/types";
import type { WeeklyAttention } from "@/emails/WeeklyEmail";

type BudgetTier = Database["public"]["Enums"]["budget_tier"];
type OccasionKind = Database["public"]["Enums"]["occasion_kind"];

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

function weekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - (day === 0 ? 6 : day - 1));
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

function daysUntil(mmdd: string, from: Date): number {
  const [month, day] = mmdd.split("-").map(Number);
  const next = new Date(from);
  next.setMonth(month - 1, day);
  next.setHours(0, 0, 0, 0);
  if (next < from) next.setFullYear(next.getFullYear() + 1);
  return Math.floor((next.getTime() - from.getTime()) / 86400000);
}

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const supabase = createServiceClientDirect();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const { data: members, error: membersError } = await supabase
    .from("members")
    .select("id, email, first_name, send_day, send_hour, send_minute, timezone")
    .eq("subscription_status", "active")
    .not("onboarding_completed_at", "is", null);

  if (membersError) {
    console.error("[cron/weekly] fetch members:", membersError.message);
    return NextResponse.json({ error: membersError.message }, { status: 500 });
  }

  type Member = NonNullable<typeof members>[number];
  const targets = (members ?? []).filter((m: Member) => {
    try {
      const local = localTimeParts(now, m.timezone);
      return (
        local.day === m.send_day &&
        local.hour === m.send_hour &&
        local.minute >= m.send_minute &&
        local.minute < m.send_minute + 15
      );
    } catch {
      return false;
    }
  });

  if (targets.length === 0) return NextResponse.json({ processed: 0 });

  const { data: rawAttentions } = await supabase
    .from("attentions")
    .select(
      "id, category, title, base_text, effort, budget_tier, months, occasions, requires_childcare, requires_big_city, requires_car, attention_tags(tag_id, tags(slug))"
    )
    .eq("status", "published");

  type RawAttention = NonNullable<typeof rawAttentions>[number];
  type RawAttentionTag = { tag_id: string; tags: { slug: string } | null };

  const attentions: CandidateAttention[] = (rawAttentions ?? []).map((a: RawAttention) => ({
    id: a.id,
    category: a.category,
    title: a.title,
    base_text: a.base_text,
    effort: a.effort,
    budget_tier: a.budget_tier as BudgetTier,
    months: a.months ?? [],
    occasions: (a.occasions ?? []) as OccasionKind[],
    requires_childcare: a.requires_childcare,
    requires_big_city: a.requires_big_city,
    requires_car: a.requires_car,
    tag_slugs: ((a.attention_tags ?? []) as unknown as RawAttentionTag[])
      .map((at) => at.tags?.slug ?? "")
      .filter(Boolean),
  }));

  const results = { processed: 0, skipped: 0, errors: 0 };

  for (const member of targets) {
    const ws = weekStart(now);

    const { count } = await supabase
      .from("weekly_batches")
      .select("id", { count: "exact", head: true })
      .eq("member_id", member.id)
      .eq("week_start", ws);

    if ((count ?? 0) > 0) {
      results.skipped++;
      continue;
    }

    const { data: couple } = await supabase
      .from("couples")
      .select(
        "id, partner_first_name, years_together, budget_tier, has_childcare, city_type, love_language, couple_tags(tag_id, tags(slug), kind)"
      )
      .eq("member_id", member.id)
      .maybeSingle();

    if (!couple) {
      results.skipped++;
      continue;
    }

    type RawCoupleTag = { tag_id: string; tags: { slug: string } | null; kind: "loves" | "avoids" };
    const coupleTags = (couple.couple_tags ?? []) as unknown as RawCoupleTag[];
    const loves = coupleTags.filter((t) => t.kind === "loves").map((t) => t.tags?.slug ?? "").filter(Boolean);
    const avoids = coupleTags.filter((t) => t.kind === "avoids").map((t) => t.tags?.slug ?? "").filter(Boolean);

    const profile: CoupleProfile = {
      budget_tier: couple.budget_tier as BudgetTier,
      has_childcare: couple.has_childcare,
      has_car: couple.city_type !== "grande_ville",
      city_type: couple.city_type,
      love_language: couple.love_language,
      loves_tag_slugs: loves,
      avoids_tag_slugs: avoids,
    };

    const cutoff = new Date(now.getTime() - 365 * 86400000).toISOString();
    const { data: rawHistory } = await supabase
      .from("batch_items")
      .select("attention_id, reaction, weekly_batches!inner(sent_at, member_id)")
      .eq("weekly_batches.member_id", member.id)
      .gte("weekly_batches.sent_at", cutoff);

    type RawHistoryRow = {
      attention_id: string;
      reaction: Database["public"]["Enums"]["reaction"] | null;
      weekly_batches: { sent_at: string; member_id: string } | null;
    };
    const history: SentRecord[] = ((rawHistory ?? []) as unknown as RawHistoryRow[]).map((r) => ({
      attention_id: r.attention_id,
      sent_at: r.weekly_batches?.sent_at ?? "",
      reaction: r.reaction,
    }));

    const { data: rawOccasions } = await supabase
      .from("occasions")
      .select("kind, date, recurring")
      .eq("couple_id", couple.id);

    type RawOccasion = { kind: string; date: string; recurring: boolean };
    const occasions: UpcomingOccasion[] = ((rawOccasions ?? []) as RawOccasion[])
      .map((o) => {
        const mmdd = o.date.slice(5, 10);
        const days = o.recurring
          ? daysUntil(mmdd, now)
          : Math.floor((new Date(o.date).getTime() - now.getTime()) / 86400000);
        return { kind: o.kind as OccasionKind, days_away: days };
      })
      .filter((o) => o.days_away >= 0 && o.days_away <= 30);

    const trio = selectTrio(attentions, profile, history, occasions, now);
    if (!trio) {
      console.error(`[cron/weekly] no trio for member ${member.id}`);
      results.errors++;
      continue;
    }

    const { data: batch, error: batchError } = await supabase
      .from("weekly_batches")
      .insert({ member_id: member.id, week_start: ws })
      .select("id")
      .single();

    if (batchError || !batch) {
      console.error("[cron/weekly] create batch:", batchError?.message);
      results.errors++;
      continue;
    }

    const partnerVars = {
      prenom: couple.partner_first_name,
      annees: couple.years_together,
      ville: null,
    };

    const emailAttentions: WeeklyAttention[] = [];
    let itemError = false;
    const tokenExpiry = new Date(now.getTime() + 14 * 86400000).toISOString();

    for (const attention of [trio.de_toi, trio.materiel, trio.moment_a_deux]) {
      const personalizedText = personalizeText(attention.base_text, partnerVars);

      const { data: item, error: itemErr } = await supabase
        .from("batch_items")
        .insert({
          batch_id: batch.id,
          attention_id: attention.id,
          category: attention.category,
          personalized_text: personalizedText,
          done_token: "temp",
          done_token_expires_at: tokenExpiry,
        })
        .select("id")
        .single();

      if (itemErr || !item) {
        console.error("[cron/weekly] create item:", itemErr?.message);
        itemError = true;
        break;
      }

      const realToken = createDoneToken(item.id);
      await supabase.from("batch_items").update({ done_token: realToken }).eq("id", item.id);

      emailAttentions.push({
        category: attention.category,
        title: attention.title,
        text: personalizedText,
        doneLink: `${siteUrl}/fait/${realToken}`,
      });
    }

    if (itemError) {
      results.errors++;
      continue;
    }

    try {
      await sendWeeklyEmail(member.email, {
        memberFirstName: member.first_name ?? "toi",
        partnerFirstName: couple.partner_first_name,
        attentions: emailAttentions as [WeeklyAttention, WeeklyAttention, WeeklyAttention],
      });

      await supabase
        .from("weekly_batches")
        .update({ sent_at: now.toISOString() })
        .eq("id", batch.id);

      results.processed++;
    } catch (err) {
      console.error("[cron/weekly] send email:", err);
      results.errors++;
    }
  }

  return NextResponse.json(results);
}
