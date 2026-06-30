import { describe, expect, it } from "vitest";

import { voteDeltas, reputationDelta, computeHotRank } from "./core";

// Vote transitions: prev is the voter's current value (0 = no vote), next is what
// the click resolves to (0 = toggled off). All denorm deltas derive from this.
describe("voteDeltas — denormalized count changes", () => {
    it("a new upvote adds one to score and up", () => {
        expect(voteDeltas(0, 1)).toEqual({ score: 1, up: 1, down: 0 });
    });
    it("a new downvote subtracts from score and adds to down", () => {
        expect(voteDeltas(0, -1)).toEqual({ score: -1, up: 0, down: 1 });
    });
    it("undoing an upvote removes it", () => {
        expect(voteDeltas(1, 0)).toEqual({ score: -1, up: -1, down: 0 });
    });
    it("flipping up to down moves the count across both buckets", () => {
        expect(voteDeltas(1, -1)).toEqual({ score: -2, up: -1, down: 1 });
    });
    it("flipping down to up moves the count across both buckets", () => {
        expect(voteDeltas(-1, 1)).toEqual({ score: 2, up: 1, down: -1 });
    });
});

describe("reputationDelta — author reputation change", () => {
    it("tracks the net change in the vote value", () => {
        expect(reputationDelta(0, 1)).toBe(1);
        expect(reputationDelta(0, -1)).toBe(-1);
        expect(reputationDelta(1, 0)).toBe(-1);
        expect(reputationDelta(1, -1)).toBe(-2);
        expect(reputationDelta(-1, 1)).toBe(2);
    });
});

describe("computeHotRank — Reddit-style hotness", () => {
    it("ranks a higher score above a lower one at the same time", () => {
        const t = new Date("2026-06-01T00:00:00Z");
        expect(computeHotRank(100, t)).toBeGreaterThan(computeHotRank(1, t));
    });
    it("ranks a newer item above an older one at equal score", () => {
        const score = 5;
        const older = new Date("2026-06-01T00:00:00Z");
        const newer = new Date("2026-06-02T00:00:00Z");
        expect(computeHotRank(score, newer)).toBeGreaterThan(
            computeHotRank(score, older),
        );
    });
    it("ranks a positive score above a negative score at the same time", () => {
        const t = new Date("2026-06-01T00:00:00Z");
        expect(computeHotRank(10, t)).toBeGreaterThan(computeHotRank(-10, t));
    });
    it("is deterministic for the same inputs", () => {
        const t = new Date("2026-06-01T00:00:00Z");
        expect(computeHotRank(7, t)).toBe(computeHotRank(7, t));
    });
});
