import { describe, expect, it } from "vitest";
import {
    payRatiosFromRollups,
    quintileTiers,
    weightedDifficulty,
} from "./company-tiers";

describe("weightedDifficulty", () => {
    it("scores easy +0.5 / medium +1 / hard +3 per known ask", () => {
        // 25*0.5 + 50*1 + 25*3 = 12.5 + 50 + 75 = 137.5 over 100 asks
        expect(weightedDifficulty({ easy: 25, medium: 50, hard: 25 })).toBeCloseTo(1.375);
        expect(weightedDifficulty({ easy: 0, medium: 0, hard: 50 })).toBe(3);
        expect(weightedDifficulty({ easy: 50, medium: 0, hard: 0 })).toBe(0.5);
    });

    it("is null (hidden) below 50 difficulty-known asks", () => {
        expect(weightedDifficulty({ easy: 20, medium: 15, hard: 14 })).toBeNull(); // 49 asks
        expect(weightedDifficulty({ easy: 20, medium: 15, hard: 15 })).not.toBeNull(); // 50 asks
    });
});

describe("payRatiosFromRollups", () => {
    const rollup = (
        companyId: number,
        tcMedian: number,
        n: number,
        key: Partial<{ expBand: string; currency: string }> = {},
    ) => ({
        companyId,
        tcMedian,
        n,
        expBand: "2-5",
        currency: "USD",
        ...key,
    });

    it("rates each company against the global n-weighted baseline", () => {
        // baseline = (100*5 + 110*6 + 120*7 + 200*8) / (5+6+7+8) = 3600/26
        const base = 3600 / 26;
        const ratios = payRatiosFromRollups([
            rollup(1, 100, 5),
            rollup(2, 110, 6),
            rollup(3, 120, 7),
            rollup(4, 200, 8),
        ]);
        expect(ratios.get(4)).toBeCloseTo(200 / base);
        expect(ratios.get(1)).toBeCloseTo(100 / base);
    });

    it("n-weights contributions across multiple exp bands per company", () => {
        // company 1 has a high-paying senior rollup; company 2/3 only junior
        // baseline[2-5] = (100*5 + 100*5 + 100*5) / 15 = 100
        // baseline[5-8] = (300*10 + 100*5 + 100*5) / 20 = 200
        // company 1 score = ((100/100)*5 + (300/200)*10) / 15 = (5+15)/15 = 1.333
        // company 2 score = ((100/100)*5 + (100/200)*5) / 10 = (5+2.5)/10 = 0.75
        const ratios = payRatiosFromRollups([
            rollup(1, 100, 5),
            rollup(1, 300, 10, { expBand: "5-8" }),
            rollup(2, 100, 5),
            rollup(2, 100, 5, { expBand: "5-8" }),
            rollup(3, 100, 5),
            rollup(3, 100, 5, { expBand: "5-8" }),
        ]);
        expect(ratios.get(1)).toBeCloseTo(20 / 15);
        expect(ratios.get(2)).toBeCloseTo(7.5 / 10);
        expect((ratios.get(1) ?? 0) > (ratios.get(2) ?? 0)).toBe(true);
    });

    it("excludes Unknown expBand from both baseline and company score", () => {
        const ratios = payRatiosFromRollups([
            rollup(1, 999, 10, { expBand: "Unknown" }),
            rollup(2, 999, 10, { expBand: "Unknown" }),
            rollup(3, 999, 10, { expBand: "Unknown" }),
        ]);
        expect(ratios.size).toBe(0);
    });

    it("excludes company rollups below PAY_MIN_N but still uses them in baseline", () => {
        // company 9 has n=4 — excluded from company score, but contributes to baseline
        const ratios = payRatiosFromRollups([
            rollup(1, 100, 5),
            rollup(2, 110, 6),
            rollup(3, 120, 7),
            rollup(9, 500, 4),
        ]);
        expect(ratios.has(9)).toBe(false);
        expect(ratios.has(1)).toBe(true);
    });

    it("suppresses companies whose only buckets have too few rollups for a baseline", () => {
        // EUR bucket has only 2 rollups — below PAY_MIN_PEERS=3, no baseline forms
        const ratios = payRatiosFromRollups([
            rollup(1, 100, 5),
            rollup(2, 110, 6),
            rollup(3, 120, 7),
            rollup(20, 300, 9, { currency: "EUR" }),
            rollup(21, 400, 9, { currency: "EUR" }),
        ]);
        expect(ratios.has(20)).toBe(false);
        expect(ratios.has(21)).toBe(false);
        expect(ratios.has(1)).toBe(true);
    });
});

describe("quintileTiers", () => {
    it("splits ranked companies into 1-5 by bottom-to-top quintile", () => {
        const metrics = new Map(
            Array.from({ length: 10 }, (_, i) => [`c${i}`, i] as const),
        );
        const tiers = quintileTiers(metrics);
        expect(tiers.get("c0")).toBe(1);
        expect(tiers.get("c1")).toBe(1);
        expect(tiers.get("c2")).toBe(2);
        expect(tiers.get("c5")).toBe(3);
        expect(tiers.get("c8")).toBe(5);
        expect(tiers.get("c9")).toBe(5);
    });

    it("gives tied metrics the same tier", () => {
        const tiers = quintileTiers(
            new Map([["a", 1], ["b", 1], ["c", 1], ["d", 2], ["e", 3]]),
        );
        expect(tiers.get("a")).toBe(tiers.get("b"));
        expect(tiers.get("b")).toBe(tiers.get("c"));
        expect(tiers.get("e")).toBe(5);
    });

    it("handles tiny populations without exceeding bounds", () => {
        const tiers = quintileTiers(new Map([["solo", 42]]));
        expect(tiers.get("solo")).toBe(1);
        const two = quintileTiers(new Map([["lo", 1], ["hi", 2]]));
        expect(two.get("lo")).toBe(1);
        expect(two.get("hi")).toBe(5);
    });
});
