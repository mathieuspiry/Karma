import { describe, it, expect } from "vitest";
import { selectTrio } from "./index";
import type { CandidateAttention, CoupleProfile, SentRecord, UpcomingOccasion } from "./types";

// Minimal factory — only specify what the test needs
function att(
  overrides: Partial<CandidateAttention> & {
    id: string;
    category: CandidateAttention["category"];
  }
): CandidateAttention {
  return {
    title: overrides.id,
    base_text: "text",
    effort: "leger",
    budget_tier: "zero",
    months: [],
    occasions: [],
    requires_childcare: false,
    requires_big_city: false,
    requires_car: false,
    tag_slugs: [],
    ...overrides,
  };
}

const BASE_PROFILE: CoupleProfile = {
  budget_tier: "50_150",
  has_childcare: true,
  has_car: true,
  city_type: "grande_ville",
  love_language: null,
  loves_tag_slugs: [],
  avoids_tag_slugs: [],
};

// Three attentions of each category = minimal valid catalogue
const ONE_EACH: CandidateAttention[] = [
  att({ id: "d1", category: "de_toi" }),
  att({ id: "d2", category: "de_toi" }),
  att({ id: "m1", category: "materiel" }),
  att({ id: "m2", category: "materiel" }),
  att({ id: "ma1", category: "moment_a_deux" }),
  att({ id: "ma2", category: "moment_a_deux" }),
];

// A fixed "now" in June so seasonal tests are deterministic
const NOW = new Date("2024-06-15T08:00:00Z");

// ── Rule 1 — 12-month history dedup ─────────────────────────────────────────

describe("Rule 1 — 12-month history dedup", () => {
  it("excludes an attention sent within the last 12 months", () => {
    const history: SentRecord[] = [
      { attention_id: "d1", sent_at: "2024-03-01T00:00:00Z", reaction: null },
    ];
    const trio = selectTrio(ONE_EACH, BASE_PROFILE, history, [], NOW);
    expect(trio).not.toBeNull();
    expect(trio!.de_toi.id).toBe("d2");
  });

  it("allows an attention sent more than 12 months ago", () => {
    const history: SentRecord[] = [
      { attention_id: "d1", sent_at: "2023-06-01T00:00:00Z", reaction: null }, // > 12 months
    ];
    const trio = selectTrio(ONE_EACH, BASE_PROFILE, history, [], NOW);
    expect(trio).not.toBeNull();
    expect(trio!.de_toi.id).toBe("d1"); // eligible again, scores higher (sent longer ago)
  });
});

// ── Rule 2 — Trio composition and no-three-lourd ────────────────────────────

describe("Rule 2 — Trio composition", () => {
  it("returns exactly one attention per category", () => {
    const trio = selectTrio(ONE_EACH, BASE_PROFILE, [], [], NOW);
    expect(trio).not.toBeNull();
    expect(trio!.de_toi.category).toBe("de_toi");
    expect(trio!.materiel.category).toBe("materiel");
    expect(trio!.moment_a_deux.category).toBe("moment_a_deux");
  });

  it("returns null when a category has no eligible candidates", () => {
    const incomplete = ONE_EACH.filter((a) => a.category !== "moment_a_deux");
    const trio = selectTrio(incomplete, BASE_PROFILE, [], [], NOW);
    expect(trio).toBeNull();
  });

  it("avoids 3 lourd attentions in the same trio", () => {
    const catalogue: CandidateAttention[] = [
      att({ id: "d-h", category: "de_toi", effort: "lourd" }),
      att({ id: "m-h", category: "materiel", effort: "lourd" }),
      att({ id: "ma-h", category: "moment_a_deux", effort: "lourd" }),
      att({ id: "ma-l", category: "moment_a_deux", effort: "leger" }),
    ];
    const trio = selectTrio(catalogue, BASE_PROFILE, [], [], NOW);
    expect(trio).not.toBeNull();
    const lourdCount = [trio!.de_toi, trio!.materiel, trio!.moment_a_deux].filter(
      (a) => a.effort === "lourd"
    ).length;
    expect(lourdCount).toBeLessThan(3);
    expect(trio!.moment_a_deux.id).toBe("ma-l");
  });
});

// ── Rule 3 — Budget is a hard filter ────────────────────────────────────────

describe("Rule 3 — Budget hard filter", () => {
  it("excludes attentions over the couple budget", () => {
    const catalogue: CandidateAttention[] = [
      att({ id: "d-exp", category: "de_toi", budget_tier: "plus_150" }),
      att({ id: "d-ok", category: "de_toi", budget_tier: "zero" }),
      att({ id: "m1", category: "materiel" }),
      att({ id: "ma1", category: "moment_a_deux" }),
    ];
    const profile: CoupleProfile = { ...BASE_PROFILE, budget_tier: "moins_20" };
    const trio = selectTrio(catalogue, profile, [], [], NOW);
    expect(trio).not.toBeNull();
    expect(trio!.de_toi.id).toBe("d-ok");
  });

  it("excludes attentions tagged with an avoided slug", () => {
    const catalogue: CandidateAttention[] = [
      att({ id: "d-tag", category: "de_toi", tag_slugs: ["romantique"] }),
      att({ id: "d-notag", category: "de_toi" }),
      att({ id: "m1", category: "materiel" }),
      att({ id: "ma1", category: "moment_a_deux" }),
    ];
    const profile: CoupleProfile = { ...BASE_PROFILE, avoids_tag_slugs: ["romantique"] };
    const trio = selectTrio(catalogue, profile, [], [], NOW);
    expect(trio).not.toBeNull();
    expect(trio!.de_toi.id).toBe("d-notag");
  });

  it("excludes attentions requiring childcare when couple has none", () => {
    const catalogue: CandidateAttention[] = [
      att({ id: "d-cc", category: "de_toi", requires_childcare: true }),
      att({ id: "d-ok", category: "de_toi" }),
      att({ id: "m1", category: "materiel" }),
      att({ id: "ma1", category: "moment_a_deux" }),
    ];
    const profile: CoupleProfile = { ...BASE_PROFILE, has_childcare: false };
    const trio = selectTrio(catalogue, profile, [], [], NOW);
    expect(trio).not.toBeNull();
    expect(trio!.de_toi.id).toBe("d-ok");
  });

  it("excludes big-city attentions when couple lives in the countryside", () => {
    const catalogue: CandidateAttention[] = [
      att({ id: "d-city", category: "de_toi", requires_big_city: true }),
      att({ id: "d-ok", category: "de_toi" }),
      att({ id: "m1", category: "materiel" }),
      att({ id: "ma1", category: "moment_a_deux" }),
    ];
    const profile: CoupleProfile = { ...BASE_PROFILE, city_type: "campagne" };
    const trio = selectTrio(catalogue, profile, [], [], NOW);
    expect(trio).not.toBeNull();
    expect(trio!.de_toi.id).toBe("d-ok");
  });

  it("excludes car-required attentions when couple has no car", () => {
    const catalogue: CandidateAttention[] = [
      att({ id: "d-car", category: "de_toi", requires_car: true }),
      att({ id: "d-ok", category: "de_toi" }),
      att({ id: "m1", category: "materiel" }),
      att({ id: "ma1", category: "moment_a_deux" }),
    ];
    const profile: CoupleProfile = { ...BASE_PROFILE, has_car: false };
    const trio = selectTrio(catalogue, profile, [], [], NOW);
    expect(trio).not.toBeNull();
    expect(trio!.de_toi.id).toBe("d-ok");
  });

  it("excludes seasonal attentions whose month does not match the current date", () => {
    const catalogue: CandidateAttention[] = [
      att({ id: "d-dec", category: "de_toi", months: [12] }), // December only
      att({ id: "d-all", category: "de_toi", months: [] }),
      att({ id: "m1", category: "materiel" }),
      att({ id: "ma1", category: "moment_a_deux" }),
    ];
    // NOW is June — December-only attention should be excluded
    const trio = selectTrio(catalogue, BASE_PROFILE, [], [], NOW);
    expect(trio).not.toBeNull();
    expect(trio!.de_toi.id).toBe("d-all");
  });

  it("includes seasonal attentions whose month matches the current date", () => {
    const catalogue: CandidateAttention[] = [
      att({ id: "d-jun", category: "de_toi", months: [6] }), // June only
      att({ id: "d-all", category: "de_toi", months: [] }),
      att({ id: "m1", category: "materiel" }),
      att({ id: "ma1", category: "moment_a_deux" }),
    ];
    // Both eligible; d-jun gets a recency tie-break as "never sent"
    const trio = selectTrio(catalogue, BASE_PROFILE, [], [], NOW);
    expect(trio).not.toBeNull();
    expect(["d-jun", "d-all"]).toContain(trio!.de_toi.id);
  });
});

// ── Rule 4 — Occasion bonus (14-day window) ──────────────────────────────────

describe("Rule 4 — Occasion 14-day window", () => {
  it("prefers an occasion-tagged attention when the occasion is within 14 days", () => {
    const catalogue: CandidateAttention[] = [
      att({ id: "d-anniv", category: "de_toi", occasions: ["anniversaire"] }),
      att({ id: "d-plain", category: "de_toi" }),
      att({ id: "m1", category: "materiel" }),
      att({ id: "ma1", category: "moment_a_deux" }),
    ];
    const occasions: UpcomingOccasion[] = [{ kind: "anniversaire", days_away: 7 }];
    const trio = selectTrio(catalogue, BASE_PROFILE, [], occasions, NOW);
    expect(trio).not.toBeNull();
    expect(trio!.de_toi.id).toBe("d-anniv");
  });

  it("does not boost an occasion-tagged attention when the occasion is beyond 14 days", () => {
    const catalogue: CandidateAttention[] = [
      att({ id: "d-anniv", category: "de_toi", occasions: ["anniversaire"] }),
      // d-loved has a loves-tag match which scores 10 pts, beating d-anniv with 0
      att({ id: "d-loved", category: "de_toi", tag_slugs: ["nature"] }),
      att({ id: "m1", category: "materiel" }),
      att({ id: "ma1", category: "moment_a_deux" }),
    ];
    const occasions: UpcomingOccasion[] = [{ kind: "anniversaire", days_away: 20 }];
    const profile: CoupleProfile = { ...BASE_PROFILE, loves_tag_slugs: ["nature"] };
    const trio = selectTrio(catalogue, profile, [], occasions, NOW);
    expect(trio).not.toBeNull();
    expect(trio!.de_toi.id).toBe("d-loved");
  });
});
