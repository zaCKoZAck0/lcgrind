"use server";

import { db } from "~/lib/db";
import { groupCommunityAsks, mergeCommunityAsks } from "./merge";
import { FEATURE_FLAGS } from "~/config/feature-flags";

export type InterviewQuestion = {
    statement: string;
    kind: string;
    askCount: number;
    lastAsked: string | null;
    firstAsked: string | null;
    problemUrl: string | null;
    difficulty: string | null;
    /**
     * Problem enrichment, present only for seeded questions linked to a
     * canonical LeetCode problem. Lets the row reuse the /all-problems
     * ProblemRow (title link, acceptance, tags, notes, completion checkbox).
     * Community-only rows with no seeded match render a lighter row.
     */
    problemId?: number | null;
    problemTitle?: string | null;
    acceptance?: number | null;
    isPaid?: boolean;
    tags?: string[];
    askedInCompanies?: { slug: string; name: string }[];
};

export type InterviewSections = {
    problemSolving: InterviewQuestion[];
    systemDesign: InterviewQuestion[];
    lld: InterviewQuestion[];
    others: InterviewQuestion[];
};

const SECTION_BY_TYPE: Record<string, keyof InterviewSections> = {
    "DSA": "problemSolving",
    ...(FEATURE_FLAGS.SYSTEM_DESIGN ? { "System Design": "systemDesign" } : {}),
    "LLD": "lld",
};

export async function getAvailableBands(slug: string): Promise<string[]> {
    const [questionBands, communityBands] = await Promise.all([
        db.companyQuestionStat.findMany({
            where: { company: { slug } },
            select: { band: true },
            distinct: ["band"],
        }),
        db.communityQuestionAsk.findMany({
            where: { company: { slug } },
            select: { band: true },
            distinct: ["band"],
        }),
    ]);
    
    const bands: string[] = [
        ...new Set([...questionBands.map((b) => b.band), ...communityBands.map((b) => b.band)]),
    ];
    
    if (FEATURE_FLAGS.COMPENSATION) {
        const [compBands, communityCompBands] = await Promise.all([
            db.compRollup.findMany({
                where: { company: { slug } },
                select: { expBand: true },
                distinct: ["expBand"],
            }),
            db.communityCompPoint.findMany({
                where: { company: { slug } },
                select: { expBand: true },
                distinct: ["expBand"],
            }),
        ]);
        bands.push(
            ...new Set([
                ...compBands.map((b) => b.expBand),
                ...communityCompBands.map((b) => b.expBand),
            ])
        );
    }
    
    return bands;
}

export async function getCompanyInterviews(
    slug: string,
    band: string = "all",
): Promise<InterviewSections> {
    const stats = await db.companyQuestionStat.findMany({
        where: { company: { slug }, band },
        orderBy: [{ askCount: "desc" }, { statement: "asc" }],
        select: {
            statement: true,
            type: true,
            kind: true,
            askCount: true,
            lastAsked: true,
            firstAsked: true,
            problem: {
                select: {
                    id: true,
                    url: true,
                    title: true,
                    difficulty: true,
                    acceptance: true,
                    isPaid: true,
                    topicTags: { select: { topicTag: { select: { name: true } } } },
                },
            },
        },
    });

    const sections: InterviewSections = {
        problemSolving: [],
        systemDesign: [],
        lld: [],
        others: [],
    };
    for (const s of stats) {
        sections[SECTION_BY_TYPE[s.type] ?? "others"].push({
            statement: s.statement,
            kind: s.kind,
            askCount: s.askCount,
            lastAsked: s.lastAsked,
            firstAsked: s.firstAsked,
            problemUrl: s.problem?.url ?? null,
            difficulty: s.problem?.difficulty ?? null,
            problemId: s.problem?.id ?? null,
            problemTitle: s.problem?.title ?? null,
            acceptance: s.problem?.acceptance ?? null,
            isPaid: s.problem?.isPaid ?? false,
            tags: s.problem?.topicTags.map((t) => t.topicTag.name) ?? [],
        });
    }

    // Approved community rows live in a separate table and are never seeded;
    // merge them in at read time. "all" view folds in every band's asks.
    const communityAsks = await db.communityQuestionAsk.findMany({
        where: {
            company: { slug },
            ...(band === "all" ? {} : { band }),
        },
        select: {
            type: true,
            statement: true,
            createdAt: true,
            problem: { select: { url: true, difficulty: true } },
        },
    });

    const groups = groupCommunityAsks(
        communityAsks.map((a) => ({
            type: a.type,
            statement: a.statement,
            createdAt: a.createdAt,
            problemUrl: a.problem?.url ?? null,
            difficulty: a.problem?.difficulty ?? null,
        })),
    );

    const merged = mergeCommunityAsks(sections, groups);

    const allStatements = [...new Set([
        ...merged.problemSolving,
        ...(FEATURE_FLAGS.SYSTEM_DESIGN ? merged.systemDesign : []),
        ...merged.lld,
        ...merged.others,
    ].map((q) => q.statement))];

    if (allStatements.length === 0) return merged;

    const [statRows, commRows] = await Promise.all([
        db.companyQuestionStat.findMany({
            where: { statement: { in: allStatements } },
            select: {
                statement: true,
                askCount: true,
                company: { select: { slug: true, name: true } },
            },
        }),
        db.communityQuestionAsk.findMany({
            where: { statement: { in: allStatements } },
            select: {
                statement: true,
                company: { select: { slug: true, name: true } },
            },
        }),
    ]);

    // Fetch global company popularity
    const allCompanyReportCounts = new Map(
        (await db.company.findMany({
            select: { slug: true, reportCount: true },
        })).map((c) => [c.slug, c.reportCount]),
    );

    // Aggregate per statement: slug → { name, weight }
    const companyMap = new Map<string, Map<string, { name: string; weight: number }>>();
    for (const row of statRows) {
        if (row.company.slug === "other") continue;
        let slugMap = companyMap.get(row.statement);
        if (!slugMap) { slugMap = new Map(); companyMap.set(row.statement, slugMap); }
        const prev = slugMap.get(row.company.slug);
        slugMap.set(row.company.slug, { name: row.company.name, weight: (prev?.weight ?? 0) + row.askCount });
    }
    for (const row of commRows) {
        if (row.company.slug === "other") continue;
        let slugMap = companyMap.get(row.statement);
        if (!slugMap) { slugMap = new Map(); companyMap.set(row.statement, slugMap); }
        const prev = slugMap.get(row.company.slug);
        slugMap.set(row.company.slug, { name: row.company.name, weight: (prev?.weight ?? 0) + 1 });
    }

    const sectionsToProcess = [
        merged.problemSolving,
        ...(FEATURE_FLAGS.SYSTEM_DESIGN ? [merged.systemDesign] : []),
        merged.lld,
        merged.others,
    ];
    for (const section of sectionsToProcess) {
        for (const q of section) {
            const slugMap = companyMap.get(q.statement);
            if (slugMap) {
                q.askedInCompanies = [...slugMap.entries()]
                    .sort((a, b) => {
                        const rcA = allCompanyReportCounts.get(a[0]) ?? 0;
                        const rcB = allCompanyReportCounts.get(b[0]) ?? 0;
                        return rcB - rcA || b[1].weight - a[1].weight;
                    })
                    .map(([slug, { name }]) => ({ slug, name }));
            }
        }
    }

    return merged;
}
