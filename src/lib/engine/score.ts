import type {
  CandidateAttention,
  CoupleProfile,
  LoveLanguage,
  SentRecord,
  UpcomingOccasion,
} from "./types";

const LOVE_LANGUAGE_CATEGORY: Partial<Record<LoveLanguage, CandidateAttention["category"]>> = {
  cadeaux: "materiel",
  temps: "moment_a_deux",
};

export function scoreAttention(
  a: CandidateAttention,
  profile: CoupleProfile,
  history: SentRecord[],
  occasions: UpcomingOccasion[],
  now: Date
): number {
  let score = 0;

  // Loves-tag bonus (+10 per matching tag)
  const lovesMatches = a.tag_slugs.filter((slug) => profile.loves_tag_slugs.includes(slug)).length;
  score += lovesMatches * 10;

  // Love-language category bonus
  if (profile.love_language) {
    const preferred = LOVE_LANGUAGE_CATEGORY[profile.love_language];
    if (preferred === a.category) score += 5;
  }

  // Recency: prefer attentions sent longer ago (or never sent)
  const pastSends = history
    .filter((r) => r.attention_id === a.id)
    .sort((x, y) => (x.sent_at < y.sent_at ? 1 : -1));

  if (pastSends.length === 0) {
    score += 20;
  } else {
    const daysSince =
      (now.getTime() - new Date(pastSends[0].sent_at).getTime()) / (1000 * 60 * 60 * 24);
    score += Math.min(20, daysSince / 18); // ~1 year to reach max 20 pts
  }

  // Occasion bonus: +30 if an occasion matching this attention falls within 14 days
  const occasionMatch = occasions.some(
    (occ) => occ.days_away >= 0 && occ.days_away <= 14 && a.occasions.includes(occ.kind)
  );
  if (occasionMatch) score += 30;

  return score;
}
