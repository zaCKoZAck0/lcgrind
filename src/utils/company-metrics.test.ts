import { describe, expect, it } from "vitest";
import {
    formatRecency,
    computeWeight,
    questionFlairs,
    flairTooltip,
} from "./company-metrics";

describe("formatRecency", () => {
    // now is fixed at 2026-06 for deterministic tests
    const NOW = "2026-06";

    it("labels the current and previous month as This month / Last month", () => {
        expect(formatRecency("2026-06", NOW)).toBe("This month");
        expect(formatRecency("2026-05", NOW)).toBe("Last month");
    });

    it("labels recent months by distance", () => {
        expect(formatRecency("2026-03", NOW)).toBe("3 months ago");
        expect(formatRecency("2025-12", NOW)).toBe("6 months ago");
    });

    it("falls back to Month Year beyond a year", () => {
        expect(formatRecency("2025-01", NOW)).toBe("Jan 2025");
        expect(formatRecency("2023-11", NOW)).toBe("Nov 2023");
    });

    it("returns null for malformed input", () => {
        expect(formatRecency("garbage", NOW)).toBeNull();
        expect(formatRecency("", NOW)).toBeNull();
    });
});

describe("computeWeight", () => {
    const NOW = "2026-06";

    it("is the bare ask count when the question has no recency", () => {
        expect(computeWeight({ askCount: 5, lastAsked: null }, NOW)).toBe(5);
        expect(computeWeight({ askCount: 1, lastAsked: null }, NOW)).toBe(1);
    });

    it("adds the full recency bonus when last asked this month", () => {
        expect(computeWeight({ askCount: 5, lastAsked: "2026-06" }, NOW)).toBe(15);
        expect(computeWeight({ askCount: 1, lastAsked: "2026-06" }, NOW)).toBe(11);
    });

    it("decays the recency bonus by 15% per month", () => {
        expect(
            computeWeight({ askCount: 5, lastAsked: "2026-05" }, NOW),
        ).toBeCloseTo(13.5);
        expect(
            computeWeight({ askCount: 5, lastAsked: "2026-04" }, NOW),
        ).toBeCloseTo(12.225);
    });

    it("ranks a fresh single report above a high-count question stale past a year", () => {
        const fresh = computeWeight({ askCount: 1, lastAsked: "2026-06" }, NOW);
        const stale = computeWeight({ askCount: 10, lastAsked: "2025-03" }, NOW);
        expect(fresh).toBeGreaterThan(stale);
    });
});

describe("questionFlairs", () => {
    const NOW = "2026-06";
    const q = (askCount: number, lastAsked: string | null) => ({ askCount, lastAsked });

    it("hot alone when count < 5 (no count flair)", () => {
        expect(questionFlairs(q(2, "2026-06"), NOW)).toEqual(["hot"]);
        expect(questionFlairs(q(3, "2026-05"), NOW)).toEqual(["hot"]);
    });

    it("hot + frequent when count ≥ 5", () => {
        expect(questionFlairs(q(5, "2026-06"), NOW)).toEqual(["hot", "frequent"]);
        expect(questionFlairs(q(9, "2026-05"), NOW)).toEqual(["hot", "frequent"]);
    });

    it("hot + classic when count ≥ 10 and lastAsked = null... actually impossible (hot needs lastAsked)", () => {
        // hot requires lastAsked, classic requires lastAsked=null — mutually exclusive
        expect(questionFlairs(q(10, "2026-06"), NOW)).toEqual(["hot", "frequent"]);
    });

    it("trending alone when not hot and count < 5", () => {
        expect(questionFlairs(q(3, "2026-03"), NOW)).toEqual(["trending"]);
        expect(questionFlairs(q(3, "2025-12"), NOW)).toEqual(["trending"]);
    });

    it("trending + frequent when count ≥ 5", () => {
        expect(questionFlairs(q(5, "2026-03"), NOW)).toEqual(["trending", "frequent"]);
    });

    it("recent alone (low count, within 6mo, not hot/trending)", () => {
        expect(questionFlairs(q(1, "2026-04"), NOW)).toEqual(["recent"]);
        expect(questionFlairs(q(2, "2026-03"), NOW)).toEqual(["recent"]);
    });

    it("trending + frequent when in 6mo window with count ≥ 5", () => {
        expect(questionFlairs(q(5, "2025-12"), NOW)).toEqual(["trending", "frequent"]);
    });

    it("classic alone (seeded-only, count ≥ 10, lastAsked null)", () => {
        expect(questionFlairs(q(10, null), NOW)).toEqual(["classic"]);
    });

    it("frequent alone (count ≥ 5, no recency, not classic)", () => {
        expect(questionFlairs(q(5, null), NOW)).toEqual(["frequent"]);
        expect(questionFlairs(q(9, null), NOW)).toEqual(["frequent"]);
    });

    it("empty when no signal", () => {
        expect(questionFlairs(q(1, null), NOW)).toEqual([]);
        expect(questionFlairs(q(4, null), NOW)).toEqual([]);
        expect(questionFlairs(q(1, "2025-11"), NOW)).toEqual([]); // beyond 6mo
    });
});

describe("flairTooltip", () => {
    const NOW = "2026-06";
    const q = (lastAsked: string | null) => ({ lastAsked });

    it("describes each flair qualitatively without raw counts", () => {
        expect(flairTooltip("hot",      q("2026-06"), undefined, NOW)).toContain("hot right now");
        expect(flairTooltip("trending", q("2026-05"), undefined, NOW)).toContain("last month");
        expect(flairTooltip("frequent", q(null),      undefined, NOW)).toContain("must do");
        expect(flairTooltip("recent",   q("2026-04"), undefined, NOW)).toContain("2 months ago");
        expect(flairTooltip("classic",  q(null),      undefined, NOW)).toContain("long-standing");
    });

    it("includes company name in hot tooltip", () => {
        expect(flairTooltip("hot", q("2026-06"), "Google", NOW)).toContain("at Google");
    });

    it("includes company name in trending tooltip", () => {
        expect(flairTooltip("trending", q("2026-04"), "Google", NOW)).toContain("at Google");
    });

    it("includes company name in frequent tooltip", () => {
        expect(flairTooltip("frequent", q(null), "Google", NOW)).toContain("at Google");
    });

    it("includes company name in recent tooltip with correct article", () => {
        expect(flairTooltip("recent", q("2026-04"), "Google", NOW)).toBe("Reported in a Google interview 2 months ago.");
        expect(flairTooltip("recent", q("2026-04"), "Apple", NOW)).toBe("Reported in an Apple interview 2 months ago.");
        expect(flairTooltip("recent", q("2026-05"), "IBM", NOW)).toBe("Reported in an IBM interview last month.");
    });

    it("includes company name in classic tooltip", () => {
        expect(flairTooltip("classic", q(null), "Google", NOW)).toContain("from Google's");
    });
});
