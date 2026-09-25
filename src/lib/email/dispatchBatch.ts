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

// Fetches the published catalogue and returns engine-ready candidates
async function loadCatalogue(): Promise<CandidateAttention[]> {
  const supabase = createServiceClientDirect();
  const { data } = await supabase
    .from("attentions")
    .select(
      "id, category, title, base_text, effort, budget_tier, months, occasions, requires_childcare, requires_big_city, requires_car, attention_tags(tag_id, tags(slug))"
    )
    .eq("status", "published");

  type RawTag = { tag_id: string; tags: { slug: string } | null };
  return (data ?? []).map((a) => ({
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
    tag_slugs: ((a.attention_tags ?? []) as unknown as RawTag[])
      .map((at) => at.tags?.slug ?? "")
      .filter(Boolean),
  }));
}

/**
 * Selects a trio for the given member and sends the weekly email.
 * Safe to call from both the onboarding Server Action and the cron route.
 * Returns false if the member's batch already exists for this week.
 */
export async function dispatchBatch(memberId: string): Promise<boolean> {
  const supabase = createServiceClientDirect();
  const now = new Date();
  const ws = weekStart(now);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  // Idempotency guard
  const { count } = await supabase
    .from("weekly_batches")
    .select("id", { count: "exact", head: true })
    .eq("member_id", memberId)
    .eq("week_start", ws);

  if ((count ?? 0) > 0) return false;

  // Member email + first name
  const { data: member } = await supabase
    .from("members")
    .select("email, first_name")
    .eq("id", memberId)
    .single();

  if (!member) return false;

  // Couple profile
  const { data: couple } = await supabase
    .from("couples")
    .select(
      "id, partner_first_name, years_together, budget_tier, has_childcare, city_type, love_language, couple_tags(tag_id, tags(slug), kind)"
    )
    .eq("member_id", memberId)
    .maybeSingle();

  if (!couple) return false;

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

  // 12-month history
  const cutoff = new Date(now.getTime() - 365 * 86400000).toISOString();
  const { data: rawHistory } = await supabase
    .from("batch_items")
    .select("attention_id, reaction, weekly_batches!inner(sent_at, member_id)")
    .eq("weekly_batches.member_id", memberId)
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

  // Upcoming occasions
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

  const attentions = await loadCatalogue();
  const trio = selectTrio(attentions, profile, history, occasions, now);
  if (!trio) {
    console.error(`[dispatchBatch] no trio for member ${memberId}`);
    return false;
  }

  // Create batch
  const { data: batch, error: batchError } = await supabase
    .from("weekly_batches")
    .insert({ member_id: memberId, week_start: ws })
    .select("id")
    .single();

  if (batchError || !batch) {
    console.error("[dispatchBatch] create batch:", batchError?.message);
    return false;
  }

  const partnerVars = { prenom: couple.partner_first_name, annees: couple.years_together, ville: null };
  const emailAttentions: WeeklyAttention[] = [];
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
      console.error("[dispatchBatch] create item:", itemErr?.message);
      return false;
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

  await sendWeeklyEmail(member.email, {
    memberFirstName: member.first_name ?? "toi",
    partnerFirstName: couple.partner_first_name,
    attentions: emailAttentions as [WeeklyAttention, WeeklyAttention, WeeklyAttention],
  });

  await supabase
    .from("weekly_batches")
    .update({ sent_at: now.toISOString() })
    .eq("id", batch.id);

  return true;
}
