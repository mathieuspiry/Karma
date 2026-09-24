import type {
  CandidateAttention,
  Category,
  CoupleProfile,
  SentRecord,
  Trio,
  UpcomingOccasion,
} from "./types";
import { scoreAttention } from "./score";

function pickBest(
  pool: CandidateAttention[],
  category: Category,
  profile: CoupleProfile,
  history: SentRecord[],
  occasions: UpcomingOccasion[],
  now: Date,
  used: Set<string>
): CandidateAttention | null {
  const ranked = pool
    .filter((a) => a.category === category && !used.has(a.id))
    .map((a) => ({ a, score: scoreAttention(a, profile, history, occasions, now) }))
    .sort((x, y) => y.score - x.score);

  return ranked[0]?.a ?? null;
}

export function composeTrio(
  candidates: CandidateAttention[],
  profile: CoupleProfile,
  history: SentRecord[],
  occasions: UpcomingOccasion[],
  now: Date
): Trio | null {
  const used = new Set<string>();

  const de_toi = pickBest(candidates, "de_toi", profile, history, occasions, now, used);
  if (!de_toi) return null;
  used.add(de_toi.id);

  const materiel = pickBest(candidates, "materiel", profile, history, occasions, now, used);
  if (!materiel) return null;
  used.add(materiel.id);

  let moment_a_deux = pickBest(candidates, "moment_a_deux", profile, history, occasions, now, used);
  if (!moment_a_deux) return null;

  // Rule 2: never 3 lourd in the same week
  const lourdCount = [de_toi, materiel, moment_a_deux].filter((a) => a.effort === "lourd").length;
  if (lourdCount === 3) {
    used.add(moment_a_deux.id);
    const replacement = pickBest(
      candidates.filter((a) => a.effort !== "lourd"),
      "moment_a_deux",
      profile,
      history,
      occasions,
      now,
      used
    );
    if (replacement) moment_a_deux = replacement;
    // If no lighter replacement exists, keep the lourd (better than returning null)
  }

  return { de_toi, materiel, moment_a_deux };
}
