import type { Database } from "@/lib/supabase/types";

export type Category = Database["public"]["Enums"]["attention_category"];
export type BudgetTier = Database["public"]["Enums"]["budget_tier"];
export type EffortLevel = Database["public"]["Enums"]["effort_level"];
export type OccasionKind = Database["public"]["Enums"]["occasion_kind"];
export type LoveLanguage = Database["public"]["Enums"]["love_language"];
export type CityType = Database["public"]["Enums"]["city_type"];

export const BUDGET_ORDER: BudgetTier[] = ["zero", "moins_20", "20_50", "50_150", "plus_150"];

export interface CandidateAttention {
  id: string;
  category: Category;
  title: string;
  base_text: string;
  effort: EffortLevel;
  budget_tier: BudgetTier;
  months: number[]; // empty = all year; 1–12
  occasions: OccasionKind[];
  requires_childcare: boolean;
  requires_big_city: boolean;
  requires_car: boolean;
  tag_slugs: string[]; // all tags attached to this attention
}

export interface CoupleProfile {
  budget_tier: BudgetTier;
  has_childcare: boolean;
  has_car: boolean | null; // null = unknown, skip constraint
  city_type: CityType | null;
  love_language: LoveLanguage | null;
  loves_tag_slugs: string[]; // couple_tags kind=loves
  avoids_tag_slugs: string[]; // couple_tags kind=avoids
}

export interface UpcomingOccasion {
  kind: OccasionKind;
  days_away: number; // positive = in the future
}

export interface SentRecord {
  attention_id: string;
  sent_at: string; // ISO date string
  reaction: Database["public"]["Enums"]["reaction"] | null;
}

export interface Trio {
  de_toi: CandidateAttention;
  materiel: CandidateAttention;
  moment_a_deux: CandidateAttention;
}
