// Materializes Company.payTier / Company.difficultyTier: gathers each
// qualifying company's metric, quintile-ranks across the whole population,
// and bulk-writes the 0-5 tiers. Called from the interview seed and whenever
// community rows change (admin approve/reject, author edit) so the markers
// always reflect the data actually on the site.

import type { PrismaClient } from "@prisma/client";
import {
    payRatiosFromRollups,
    quintileTiers,
    weightedDifficulty,
    PAY_MIN_TOTAL_SALARIES,
    type TierLevel,
} from "~/utils/company-tiers";

const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

async function difficultyMetrics(db: PrismaClient): Promise<Map<number, number>> {
    // Known-difficulty DSA asks per company: seeded aggregates carry askCount;
    // each community row is a single ask.
    const counts = new Map<number, { easy: number; medium: number; hard: number }>();
    const bump = (companyId: number, key: "easy" | "medium" | "hard", by: number) => {
        const c = counts.get(companyId) ?? { easy: 0, medium: 0, hard: 0 };
        c[key] += by;
        counts.set(companyId, c);
    };

    for (const difficulty of DIFFICULTIES) {
        const key = difficulty.toLowerCase() as "easy" | "medium" | "hard";
        const [seeded, community] = await Promise.all([
            db.companyQuestionStat.groupBy({
                by: ["companyId"],
                where: { band: "all", type: "DSA", problem: { difficulty } },
                _sum: { askCount: true },
            }),
            db.communityQuestionAsk.groupBy({
                by: ["companyId"],
                where: { type: "DSA", problem: { difficulty } },
                _count: { _all: true },
            }),
        ]);
        for (const r of seeded) bump(r.companyId, key, r._sum.askCount ?? 0);
        for (const r of community) bump(r.companyId, key, r._count._all);
    }

    const metrics = new Map<number, number>();
    for (const [companyId, asks] of counts) {
        const score = weightedDifficulty(asks);
        if (score !== null) metrics.set(companyId, score);
    }
    return metrics;
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
    column: "payTier" | "difficultyTier",
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

export async function recomputeCompanyTiers(db: PrismaClient): Promise<void> {
    const [pay, difficulty] = await Promise.all([
        payMetrics(db),
        difficultyMetrics(db),
    ]);
    await writeTiers(db, "payTier", quintileTiers(pay));
    await writeTiers(db, "difficultyTier", quintileTiers(difficulty));
}
