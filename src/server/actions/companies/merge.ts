import type { InterviewQuestion, InterviewSections } from "./getCompanyInterviews";
import type { CompRollupData } from "./getCompanyComp";
import { computeWeight, currentMonth } from "~/utils/company-metrics";
import { FEATURE_FLAGS } from "~/config/feature-flags";

const SECTION_BY_TYPE: Record<string, keyof InterviewSections> = {
    DSA: "problemSolving",
    ...(FEATURE_FLAGS.SYSTEM_DESIGN ? { "System Design": "systemDesign" } : {}),
    LLD: "lld",
};

export type CommunityAskGroup = {
    type: string;
    statement: string;
    count: number;
    problemUrl: string | null;
    difficulty: string | null;
    /** Earliest/latest approved ask, coarsened to YYYY-MM before leaving the server. */
    firstAsked: string | null;
    lastAsked: string | null;
};

export type CommunityAskRow = {
    type: string;
    statement: string;
    problemUrl: string | null;
    difficulty: string | null;
    createdAt: Date;
};

// UTC month so the coarsening is independent of server timezone; nothing
// finer than YYYY-MM may leave the server (provenance constraint).
function utcMonth(d: Date): string {
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function groupCommunityAsks(asks: CommunityAskRow[]): CommunityAskGroup[] {
    const grouped = new Map<string, CommunityAskGroup>();
    for (const a of asks) {
        const month = utcMonth(a.createdAt);
        const key = `${a.type} ${a.statement}`;
        const existing = grouped.get(key);
        if (existing) {
            existing.count += 1;
            existing.problemUrl = existing.problemUrl ?? a.problemUrl;
            existing.difficulty = existing.difficulty ?? a.difficulty;
            if (existing.firstAsked === null || month < existing.firstAsked) {
                existing.firstAsked = month;
            }
            if (existing.lastAsked === null || month > existing.lastAsked) {
                existing.lastAsked = month;
            }
        } else {
            grouped.set(key, {
                type: a.type,
                statement: a.statement,
                count: 1,
                problemUrl: a.problemUrl,
                difficulty: a.difficulty,
                firstAsked: month,
                lastAsked: month,
            });
        }
    }
    return [...grouped.values()];
}

export function mergeCommunityAsks(
    sections: InterviewSections,
    groups: CommunityAskGroup[],
    nowYyyyMm: string = currentMonth(),
): InterviewSections {
    for (const g of groups) {
        const key = SECTION_BY_TYPE[g.type] ?? "others";
        const list = sections[key];
        const existing = list.find(
            (q) => q.statement === g.statement,
        );
        if (existing) {
            existing.askCount += g.count;
            existing.problemUrl = existing.problemUrl ?? g.problemUrl;
            existing.difficulty = existing.difficulty ?? g.difficulty;
            // Seeded firstAsked wins (export-derived history predates community
            // rows); lastAsked advances to whichever month is later.
            existing.firstAsked = existing.firstAsked ?? g.firstAsked;
            if (g.lastAsked !== null && (existing.lastAsked === null || g.lastAsked > existing.lastAsked)) {
                existing.lastAsked = g.lastAsked;
            }
        } else {
            const row: InterviewQuestion = {
                statement: g.statement,
                kind: "question",
                askCount: g.count,
                lastAsked: g.lastAsked,
                firstAsked: g.firstAsked,
                problemUrl: g.problemUrl,
                difficulty: g.difficulty,
            };
            list.push(row);
        }
    }

    // Rank by the internal relevance weight after merging so community counts
    // and recency participate; the weight itself never leaves the server.
    const keysToSort = FEATURE_FLAGS.SYSTEM_DESIGN
        ? (Object.keys(sections) as (keyof InterviewSections)[])
        : (Object.keys(sections).filter((k) => k !== "systemDesign") as (keyof InterviewSections)[]);
    for (const key of keysToSort) {
        sections[key].sort(
            (a, b) =>
                computeWeight(b, nowYyyyMm) - computeWeight(a, nowYyyyMm) ||
                a.statement.localeCompare(b.statement),
        );
    }
    return sections;
}

export type CommunityCompPointLite = {
    currency: string;
    expBand: string;
    tc: number;
};

export function mergeCommunityComp(
    rollups: CompRollupData[],
    points: CommunityCompPointLite[],
): CompRollupData[] {
    // Clone so callers' seeded data is not mutated.
    const merged = rollups.map((r) => ({
        ...r,
        tcHistogram: r.tcHistogram.map((b) => ({ ...b })),
    }));

    for (const p of points) {
        const candidates = merged.filter(
            (r) => r.currency === p.currency && r.expBand === p.expBand,
        );
        if (candidates.length === 0) continue;
        // Prefer the highest-n rollup (the all-level aggregate ranks first).
        const target = candidates.reduce((a, b) => (b.n > a.n ? b : a));
        const hist = target.tcHistogram;
        if (hist.length === 0) {
            target.n += 1;
            continue;
        }
        let idx = hist.findIndex((b) => p.tc >= b.lo && p.tc < b.hi);
        if (idx === -1) {
            idx = p.tc < hist[0].lo ? 0 : hist.length - 1;
        }
        hist[idx].count += 1;
        target.n += 1;
    }
    return merged;
}
