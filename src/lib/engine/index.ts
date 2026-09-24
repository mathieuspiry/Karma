import type {
  CandidateAttention,
  CoupleProfile,
  SentRecord,
  Trio,
  UpcomingOccasion,
} from "./types";
import { filterCandidates } from "./filter";
import { composeTrio } from "./compose";

export type { CandidateAttention, CoupleProfile, SentRecord, Trio, UpcomingOccasion } from "./types";

export function selectTrio(
  attentions: CandidateAttention[],
  profile: CoupleProfile,
  history: SentRecord[],
  occasions: UpcomingOccasion[],
  now: Date = new Date()
): Trio | null {
  const candidates = filterCandidates(attentions, profile, history, now);
  return composeTrio(candidates, profile, history, occasions, now);
}
