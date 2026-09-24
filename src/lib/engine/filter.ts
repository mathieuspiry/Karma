import { BUDGET_ORDER, type CandidateAttention, type CoupleProfile, type SentRecord } from "./types";

const TWELVE_MONTHS_MS = 365 * 24 * 60 * 60 * 1000;

function budgetOk(a: CandidateAttention, p: CoupleProfile): boolean {
  return BUDGET_ORDER.indexOf(a.budget_tier) <= BUDGET_ORDER.indexOf(p.budget_tier);
}

function avoidTagsOk(a: CandidateAttention, p: CoupleProfile): boolean {
  return !a.tag_slugs.some((slug) => p.avoids_tag_slugs.includes(slug));
}

function historyOk(a: CandidateAttention, history: SentRecord[], now: Date): boolean {
  const cutoff = new Date(now.getTime() - TWELVE_MONTHS_MS).toISOString();
  return !history.some((r) => r.attention_id === a.id && r.sent_at >= cutoff);
}

function seasonOk(a: CandidateAttention, now: Date): boolean {
  if (a.months.length === 0) return true;
  return a.months.includes(now.getMonth() + 1); // months is 1-indexed
}

function constraintsOk(a: CandidateAttention, p: CoupleProfile): boolean {
  if (a.requires_childcare && !p.has_childcare) return false;
  if (a.requires_big_city && p.city_type !== "grande_ville") return false;
  if (a.requires_car && p.has_car === false) return false;
  return true;
}

export function filterCandidates(
  attentions: CandidateAttention[],
  profile: CoupleProfile,
  history: SentRecord[],
  now: Date
): CandidateAttention[] {
  return attentions.filter(
    (a) =>
      budgetOk(a, profile) &&
      avoidTagsOk(a, profile) &&
      historyOk(a, history, now) &&
      seasonOk(a, now) &&
      constraintsOk(a, profile)
  );
}
