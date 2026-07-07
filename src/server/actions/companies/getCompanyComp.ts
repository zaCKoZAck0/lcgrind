"use server";

import { db } from "~/lib/db";
import { mergeCommunityComp } from "./merge";
import { FEATURE_FLAGS } from "~/config/feature-flags";

export type CompRollupData = {
    roleFamily: string;
    level: string;
    expBand: string;
    currency: string;
    n: number;
    tcP25: number;
    tcMedian: number;
    tcP75: number;
    baseMedian: number | null;
    expMedian: number | null;
    tcHistogram: { lo: number; hi: number; count: number }[];
};

export type CompCurveData = {
    currency: string;
    points: { exp: number; tc_median: number; n: number }[];
};

export type CompanyComp = {
    rollups: CompRollupData[];
    curves: CompCurveData[];
};

export async function getCompanyComp(slug: string): Promise<CompanyComp> {
    const [rollups, curves] = await Promise.all([
        db.compRollup.findMany({
            where: { company: { slug } },
            orderBy: [{ n: "desc" }],
            select: {
                roleFamily: true,
                level: true,
                expBand: true,
                currency: true,
                n: true,
                tcP25: true,
                tcMedian: true,
                tcP75: true,
                baseMedian: true,
                expMedian: true,
                tcHistogram: true,
            },
        }),
        db.compCurve.findMany({
            where: { company: { slug } },
            select: { currency: true, points: true },
        }),
    ]);

    const seededRollups: CompRollupData[] = rollups.map((r) => ({
        ...r,
        tcHistogram: r.tcHistogram as CompRollupData["tcHistogram"],
    }));

    let communityPoints: { currency: string; expBand: string; tc: number }[] = [];
    if (FEATURE_FLAGS.COMPENSATION) {
        communityPoints = await db.communityCompPoint.findMany({
            where: { company: { slug } },
            select: { currency: true, expBand: true, tc: true },
        });
    }

    // Approved community comp points are bucketed into the matching seeded
    // histogram on the fly; seeded percentiles stay as-is (community volume is
    // small and never re-baselines the curve). Never written back to the DB.
    return {
        rollups: mergeCommunityComp(seededRollups, communityPoints),
        curves: curves.map((c) => ({
            currency: c.currency,
            points: c.points as CompCurveData["points"],
        })),
    };
}
