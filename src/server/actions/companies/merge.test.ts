import { describe, expect, it } from "vitest";
import { groupCommunityAsks, mergeCommunityAsks, mergeCommunityComp } from "./merge";
import type { InterviewSections } from "./getCompanyInterviews";
import type { CompRollupData } from "./getCompanyComp";

const emptySections = (): InterviewSections => ({
    problemSolving: [],
    systemDesign: [],
    lld: [],
    others: [],
});

describe("groupCommunityAsks", () => {
    it("groups asks by type+statement and derives month-truncated first/last asked", () => {
        const groups = groupCommunityAsks([
            {
                type: "DSA", statement: "Two sum", problemUrl: null, difficulty: null,
                createdAt: new Date("2026-05-02T08:00:00Z"),
            },
            {
                type: "DSA", statement: "Two sum", problemUrl: null, difficulty: null,
                createdAt: new Date("2026-01-15T10:00:00Z"),
            },
            {
                type: "System Design", statement: "Design a feed", problemUrl: null, difficulty: null,
                createdAt: new Date("2026-03-20T00:00:00Z"),
            },
        ]);
        expect(groups).toEqual([
            {
                type: "DSA", statement: "Two sum", count: 2, problemUrl: null,
                difficulty: null, firstAsked: "2026-01", lastAsked: "2026-05",
            },
            {
                type: "System Design", statement: "Design a feed", count: 1, problemUrl: null,
                difficulty: null, firstAsked: "2026-03", lastAsked: "2026-03",
            },
        ]);
    });
});

describe("mergeCommunityAsks", () => {
    it("adds a community ask as a new question row", () => {
        const merged = mergeCommunityAsks(emptySections(), [
            { type: "DSA", statement: "Two sum", count: 2, problemUrl: null, difficulty: null, firstAsked: null, lastAsked: null },
        ]);
        expect(merged.problemSolving).toHaveLength(1);
        expect(merged.problemSolving[0]).toMatchObject({
            statement: "Two sum",
            askCount: 2,
        });
    });

    it("carries derived first/last asked months onto a new community row", () => {
        const merged = mergeCommunityAsks(emptySections(), [
            {
                type: "DSA", statement: "Two sum", count: 2, problemUrl: null,
                difficulty: null, firstAsked: "2026-01", lastAsked: "2026-05",
            },
        ], "2026-06");
        expect(merged.problemSolving[0]).toMatchObject({
            firstAsked: "2026-01",
            lastAsked: "2026-05",
        });
    });

    it("folds a community ask into a matching seeded row by statement+type", () => {
        const sections = emptySections();
        sections.problemSolving.push({
            statement: "Two sum",
            kind: "question",
            askCount: 5,
            lastAsked: "2025-01",
            firstAsked: null,
            problemUrl: null,
            difficulty: null,
        });
        const merged = mergeCommunityAsks(sections, [
            { type: "DSA", statement: "Two sum", count: 3, problemUrl: null, difficulty: null, firstAsked: null, lastAsked: null },
        ]);
        expect(merged.problemSolving).toHaveLength(1);
        expect(merged.problemSolving[0].askCount).toBe(8);
    });

    it("folding keeps the seeded firstAsked and advances lastAsked to the later month", () => {
        const sections = emptySections();
        sections.problemSolving.push({
            statement: "Two sum",
            kind: "question",
            askCount: 5,
            lastAsked: "2025-01",
            firstAsked: "2024-06",
            problemUrl: null,
            difficulty: null,
        });
        const merged = mergeCommunityAsks(sections, [
            {
                type: "DSA", statement: "Two sum", count: 1, problemUrl: null,
                difficulty: null, firstAsked: "2026-02", lastAsked: "2026-05",
            },
        ], "2026-06");
        expect(merged.problemSolving[0]).toMatchObject({
            firstAsked: "2024-06",
            lastAsked: "2026-05",
        });
    });

    it("folding fills a null seeded firstAsked from the community group", () => {
        const sections = emptySections();
        sections.problemSolving.push({
            statement: "Two sum",
            kind: "question",
            askCount: 5,
            lastAsked: "2026-05",
            firstAsked: null,
            problemUrl: null,
            difficulty: null,
        });
        const merged = mergeCommunityAsks(sections, [
            {
                type: "DSA", statement: "Two sum", count: 1, problemUrl: null,
                difficulty: null, firstAsked: "2026-02", lastAsked: "2026-03",
            },
        ], "2026-06");
        expect(merged.problemSolving[0]).toMatchObject({
            firstAsked: "2026-02",
            lastAsked: "2026-05",
        });
    });

    it("routes non-DSA types into their sections", () => {
        const merged = mergeCommunityAsks(emptySections(), [
            { type: "System Design", statement: "Design a URL shortener", count: 1, problemUrl: null, difficulty: null, firstAsked: null, lastAsked: null },
            { type: "Behavioral", statement: "Tell me about a conflict", count: 1, problemUrl: null, difficulty: null, firstAsked: null, lastAsked: null },
        ]);
        expect(merged.systemDesign).toHaveLength(1);
        expect(merged.others).toHaveLength(1);
    });

    it("orders a recently asked low-count question above a stale high-count one", () => {
        const sections = emptySections();
        sections.problemSolving.push(
            {
                statement: "Stale staple", kind: "question", askCount: 10,
                lastAsked: "2025-03", firstAsked: null, problemUrl: null, difficulty: null,
            },
            {
                statement: "Fresh report", kind: "question", askCount: 1,
                lastAsked: "2026-06", firstAsked: null, problemUrl: null, difficulty: null,
            },
        );
        const merged = mergeCommunityAsks(sections, [], "2026-06");
        expect(merged.problemSolving.map((q) => q.statement)).toEqual([
            "Fresh report",
            "Stale staple",
        ]);
    });

    it("breaks weight ties by statement ascending", () => {
        const merged = mergeCommunityAsks(emptySections(), [
            { type: "DSA", statement: "Beta", count: 2, problemUrl: null, difficulty: null, firstAsked: null, lastAsked: null },
            { type: "DSA", statement: "Alpha", count: 2, problemUrl: null, difficulty: null, firstAsked: null, lastAsked: null },
        ], "2026-06");
        expect(merged.problemSolving.map((q) => q.statement)).toEqual([
            "Alpha",
            "Beta",
        ]);
    });

    it("re-sorts each section after merging community counts", () => {
        const sections = emptySections();
        sections.problemSolving.push({
            statement: "Low", kind: "question", askCount: 1, lastAsked: null, firstAsked: null, problemUrl: null, difficulty: null,
        });
        const merged = mergeCommunityAsks(sections, [
            { type: "DSA", statement: "High", count: 9, problemUrl: null, difficulty: null, firstAsked: null, lastAsked: null },
        ]);
        expect(merged.problemSolving.map((q) => q.statement)).toEqual(["High", "Low"]);
    });
});

describe("mergeCommunityComp", () => {
    const baseRollup = (): CompRollupData => ({
        roleFamily: "Software Engineer",
        level: "all",
        expBand: "2-5",
        currency: "USD",
        n: 4,
        tcP25: 100000,
        tcMedian: 150000,
        tcP75: 200000,
        baseMedian: 120000,
        expMedian: 3,
        tcHistogram: [
            { lo: 100000, hi: 150000, count: 2 },
            { lo: 150000, hi: 200000, count: 2 },
        ],
    });

    it("buckets a community comp point into the matching rollup histogram and bumps n", () => {
        const merged = mergeCommunityComp([baseRollup()], [
            { currency: "USD", expBand: "2-5", tc: 160000 },
        ]);
        const r = merged[0];
        expect(r.n).toBe(5);
        expect(r.tcHistogram[1].count).toBe(3);
    });

    it("buckets a point above the top bucket into the last bucket", () => {
        const merged = mergeCommunityComp([baseRollup()], [
            { currency: "USD", expBand: "2-5", tc: 999999 },
        ]);
        expect(merged[0].tcHistogram[1].count).toBe(3);
    });

    it("ignores points whose currency/band has no matching rollup", () => {
        const merged = mergeCommunityComp([baseRollup()], [
            { currency: "EUR", expBand: "2-5", tc: 160000 },
        ]);
        expect(merged[0].n).toBe(4);
    });
});
