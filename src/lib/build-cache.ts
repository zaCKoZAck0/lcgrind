import * as fs from "fs";
import * as path from "path";
import { cache } from "react";
import { db } from "~/lib/db";
import { getCompanyWiseProblems } from "~/server/actions/companies/getCompanyWiseProblems";
import { getCompanyWiseProblemIds } from "~/server/actions/companies/getCompanyWiseProblemIds";
import { getSheetMetadata } from "~/server/actions/sheets/getSheetMetadata";

// ---------------------------------------------------------------------------
// Build-time file-cache reader
//
// During `next build`, prefetch-build-cache.ts writes partitioned JSON files
// to .build-cache/ before the Next.js build process starts.  Pages call the
// helpers below instead of hitting the database directly.
//
// At runtime (ISR revalidation, dynamicParams on-demand render) the cache
// directory does not exist, so each helper falls back to the real DB queries.
//
// All exported helpers are wrapped in React cache() so generateMetadata and
// the page component body share one resolved value per render cycle — this
// eliminates the duplicate slug lookup that currently doubles DB calls.
// ---------------------------------------------------------------------------

const CACHE_DIR = path.join(process.cwd(), ".build-cache");

function readCache<T>(filePath: string): T | null {
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
    } catch {
        return null;
    }
}

// ---------------------------------------------------------------------------
// Company slugs  (used by generateStaticParams)
// ---------------------------------------------------------------------------

export const getCompanySlugs = cache(async (): Promise<string[]> => {
    const cached = readCache<string[]>(path.join(CACHE_DIR, "company-slugs.json"));
    if (cached) return cached;
    const rows = await db.sheet.findMany({
        where: { isCompany: true },
        select: { slug: true },
    });
    return rows.map((r) => r.slug);
});

// ---------------------------------------------------------------------------
// Company page data  (used by generateMetadata + page component)
// ---------------------------------------------------------------------------

type CompanyPageData = {
    name: string;
    initialProblems: Awaited<ReturnType<typeof getCompanyWiseProblems>>;
    initialProblemIds: Awaited<ReturnType<typeof getCompanyWiseProblemIds>>;
    initialSheet: unknown; // Array<{ numOfProblems: number } & Sheet>
};

export const getCompanyPageData = cache(
    async (slug: string): Promise<CompanyPageData | null> => {
        const cached = readCache<CompanyPageData>(
            path.join(CACHE_DIR, "companies", `${slug}.json`)
        );
        if (cached) return cached;

        // Runtime fallback — mirrors the original page.tsx Promise.all
        const [name, initialProblems, initialProblemIds, initialSheet] =
            await Promise.all([
                db.sheet
                    .findFirst({ where: { slug, isCompany: true }, select: { name: true } })
                    .then((r) => r?.name ?? null),
                getCompanyWiseProblems("all", "", slug, "frequency", [], null, 1, 100),
                getCompanyWiseProblemIds("all", "", slug, [], null),
                getSheetMetadata(slug),
            ]);

        if (!name) return null;
        return { name, initialProblems, initialProblemIds, initialSheet };
    }
);

// ---------------------------------------------------------------------------
// Prep-guide page data  (used by generateMetadata + page component)
// ---------------------------------------------------------------------------

type PrepGuideData = {
    sheet: unknown; // Sheet (with dates serialised as strings from JSON)
    problems: unknown[]; // SheetProblem[] with Decimal fields converted to number
};

export const getPrepGuideData = cache(
    async (slug: string): Promise<PrepGuideData | null> => {
        const cached = readCache<PrepGuideData>(
            path.join(CACHE_DIR, "prep-guides", `${slug}.json`)
        );
        if (cached) return cached;

        // Runtime fallback — mirrors the original prep-guide/page.tsx Promise.all
        const [sheet, problems] = await Promise.all([
            db.sheet.findFirst({ where: { slug } }),
            db.sheetProblem.findMany({
                where: { sheet: { slug } },
                include: {
                    problem: {
                        include: { topicTags: { include: { topicTag: true } } },
                    },
                },
            }),
        ]);

        if (!sheet) return null;
        return { sheet, problems };
    }
);
