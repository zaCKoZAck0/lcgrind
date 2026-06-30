// Materializes Company.payTier (quintile-ranked pay) and the per-company
// easy/medium/hard DSA problem counts that feed the difficulty-mix bar.
// Called from the interview seed and whenever community rows change (admin
// approve/reject, author edit) so both stay in sync with the data on the site.

import type { PrismaClient } from "@prisma/client";
import {
    payRatiosFromRollups,
    quintileTiers,
    PAY_MIN_TOTAL_SALARIES,
    type TierLevel,
} from "~/utils/company-tiers";

type DifficultyCounts = { easy: number; medium: number; hard: number };

const DIFFICULTY_KEY: Record<string, keyof DifficultyCounts> = {
    Easy: "easy",
    Medium: "medium",
    Hard: "hard",
};

async function difficultyCounts(
    db: PrismaClient,
): Promise<Map<number, DifficultyCounts>> {
    // DISTINCT DSA problems per company, grouped by difficulty. We count each
    // problem once per company (deduped across seeded + community sources) and
    // never the ask volume — the problem set is already public, the volume is not.
    const where = { type: "DSA", problemId: { not: null } } as const;
    const select = {
        companyId: true,
        problemId: true,
        problem: { select: { difficulty: true } },
    } as const;

    const [seeded, community] = await Promise.all([
        db.companyQuestionStat.findMany({
            where: { band: "all", ...where },
            select,
        }),
        db.communityQuestionAsk.findMany({ where, select }),
    ]);

    // Dedupe by (companyId, problemId) so a problem reported by both sources
    // counts once.
    const seen = new Set<string>();
    const counts = new Map<number, DifficultyCounts>();
    for (const row of [...seeded, ...community]) {
        if (row.problemId === null) continue;
        const key = DIFFICULTY_KEY[row.problem?.difficulty ?? ""];
        if (!key) continue;
        const dedupeKey = `${row.companyId}:${row.problemId}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);
        const c = counts.get(row.companyId) ?? { easy: 0, medium: 0, hard: 0 };
        c[key] += 1;
        counts.set(row.companyId, c);
    }
    return counts;
}

async function payMetrics(db: PrismaClient): Promise<Map<number, number>> {
    const [rollups, totals] = await Promise.all([
        // Fetch all rollups — baseline computation needs the full global picture,
        // per-rollup n filtering happens inside payRatiosFromRollups.
        db.compRollup.findMany({
            select: {
                companyId: true,
                expBand: true,
                currency: true,
                tcMedian: true,
                n: true,
            },
        }),
        // Total reported salaries per company — company-level visibility gate.
        db.compRollup.groupBy({
            by: ["companyId"],
            _sum: { n: true },
        }),
    ]);

    const totalSalaries = new Map<number, number>(
        totals.map((t) => [t.companyId, t._sum.n ?? 0]),
    );

    const ratios = payRatiosFromRollups(rollups);
    for (const companyId of [...ratios.keys()]) {
        if ((totalSalaries.get(companyId) ?? 0) < PAY_MIN_TOTAL_SALARIES) {
            ratios.delete(companyId);
        }
    }
    return ratios;
}

async function writeTiers(
    db: PrismaClient,
    column: "payTier",
    tiers: Map<number, TierLevel>,
) {
    const byTier = new Map<TierLevel, number[]>();
    for (const [companyId, tier] of tiers) {
        (byTier.get(tier) ?? byTier.set(tier, []).get(tier)!).push(companyId);
    }
    await db.$transaction([
        db.company.updateMany({
            where: { id: { notIn: [...tiers.keys()] }, [column]: { not: 0 } },
            data: { [column]: 0 },
        }),
        ...[...byTier].map(([tier, ids]) =>
            db.company.updateMany({
                where: { id: { in: ids }, [column]: { not: tier } },
                data: { [column]: tier },
            }),
        ),
    ]);
}

async function writeDifficultyCounts(
    db: PrismaClient,
    counts: Map<number, DifficultyCounts>,
) {
    await db.$transaction([
        // Reset companies that no longer have any counted DSA problems.
        db.company.updateMany({
            where: {
                id: { notIn: [...counts.keys()] },
                OR: [
                    { easyCount: { not: 0 } },
                    { mediumCount: { not: 0 } },
                    { hardCount: { not: 0 } },
                ],
            },
            data: { easyCount: 0, mediumCount: 0, hardCount: 0 },
        }),
        ...[...counts].map(([id, c]) =>
            db.company.update({
                where: { id },
                data: { easyCount: c.easy, mediumCount: c.medium, hardCount: c.hard },
            }),
        ),
    ]);
}

export async function recomputeCompanyTiers(db: PrismaClient): Promise<void> {
    const [pay, difficulty] = await Promise.all([
        payMetrics(db),
        difficultyCounts(db),
    ]);
    await writeTiers(db, "payTier", quintileTiers(pay));
    await writeDifficultyCounts(db, difficulty);
}
