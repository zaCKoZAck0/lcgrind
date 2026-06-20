"use server";

import { db } from "~/lib/db";
import { CompanyDetails, TotalCountResult } from "~/types/company";
import type { TierLevel } from "~/utils/company-tiers";

export async function getCompanies(query: string, offset: number, ITEMS_PER_PAGE: number) {
    try {
        // Only surface companies that actually carry interview data. reportCount
        // === 0 coincides exactly with "no questions and no comp", so it cleanly
        // hides the legacy sheet-derived shells from the listing and search.
        // "other" is the catch-all bucket for placeholder employer names
        // ("Product based", "Service Based") — real data, but not a browsable
        // company, so keep it out of the listing/search too.
        const where = {
            reportCount: { gt: 0 },
            slug: { not: "other" },
            ...(query
                ? {
                    OR: [
                        { slug: { contains: query.toLowerCase() } },
                        { name: { contains: query, mode: "insensitive" as const } },
                    ],
                }
                : {}),
        };
        const [count, companies] = await Promise.all([
            db.company.count({ where }),
            db.company.findMany({
                where,
                orderBy: [{ reportCount: "desc" }, { name: "asc" }],
                skip: offset,
                take: ITEMS_PER_PAGE,
                select: {
                    name: true,
                    slug: true,
                    reportCount: true,
                    lastSeen: true,
                    payTier: true,
                    difficultyTier: true,
                    _count: { select: { compRollups: true } },
                },
            }),
        ]);
        const totalCountResult: TotalCountResult[] = [{ count }];
        const details: CompanyDetails[] = companies.map((c) => ({
            name: c.name,
            slug: c.slug,
            hasReports: c.reportCount > 0,
            lastSeen: c.lastSeen,
            hasComp: c._count.compRollups > 0,
            payTier: c.payTier as TierLevel,
            difficultyTier: c.difficultyTier as TierLevel,
        }));
        return {
            totalCountResult,
            companies: details,
        };
    } catch (e) {
        console.error("Error fetching companies:", e);
        return {
            totalCountResult: [],
            companies: [],
        };
    }
}
