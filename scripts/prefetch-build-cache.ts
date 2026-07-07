// @ts-ignore
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Build-time bulk prefetch
//
// Runs BEFORE `next build` via the "build" npm script.  Executes a handful of
// grouped SQL queries (instead of ~5 per-page queries × ~2400 companies), then
// writes partitioned JSON files to .build-cache/.  Pages read these files
// during SSG instead of hitting the database; they fall back to the DB at
// runtime (ISR / dynamicParams on-demand).
//
// Memory note: the prep-guide findMany loads all SheetProblem rows that belong
// to a company sheet.  Estimated ~360k rows × ~500 bytes ≈ 180 MB.  If this
// causes OOM on your build machine, add batch chunking over sheet-id ranges.
// ---------------------------------------------------------------------------

const connectionLimit = process.env.BUILD_DB_CONNECTION_LIMIT ?? "15";
const dbUrl = process.env.DATABASE_URL ?? "";
const dbSep = dbUrl.includes("?") ? "&" : "?";

const db = new PrismaClient({
    datasourceUrl: `${dbUrl}${dbSep}connection_limit=${connectionLimit}`,
});

const CACHE_DIR = path.join(process.cwd(), ".build-cache");
const COMPANIES_DIR = path.join(CACHE_DIR, "companies");
const PREP_GUIDES_DIR = path.join(CACHE_DIR, "prep-guides");

// ---------------------------------------------------------------------------
// Raw query row types (all Decimal columns cast to float8 in SQL)
// ---------------------------------------------------------------------------

type CompanyMetaRow = {
    id: number;
    slug: string;
    name: string;
    description: string;
    website: string;
    ownerName: string;
    createdAt: Date;
    updatedAt: Date;
    isCompany: boolean;
    numOfProblems: number;
};

type CompanyProblemRow = {
    slug: string; // company slug
    id: number;
    frontendQuestionId: string;
    platform: string;
    title: string;
    url: string;
    difficulty: string;
    difficultyOrder: number;
    acceptance: number;
    isPaid: boolean;
    // sheetOrder cast to float8 — comes back as JS number
    sheetOrder: number;
    tags: string[] | null;
};

async function main() {
    console.log("[build-cache] Starting prefetch...");
    console.log(`[build-cache] DB connection_limit=${connectionLimit}`);

    fs.mkdirSync(COMPANIES_DIR, { recursive: true });
    fs.mkdirSync(PREP_GUIDES_DIR, { recursive: true });

    // ------------------------------------------------------------------
    // 1. Company metadata (one query — replaces getSheetMetadata per page)
    // ------------------------------------------------------------------
    console.log("[build-cache] Fetching company metadata...");

    const metaRows = await db.$queryRaw<CompanyMetaRow[]>`
        SELECT
            sh.id,
            sh.slug,
            sh.name,
            sh.description,
            sh.website,
            sh."ownerName",
            sh."createdAt",
            sh."updatedAt",
            sh."isCompany",
            COUNT(sp."problemId")::int AS "numOfProblems"
        FROM "Sheet" sh
        LEFT JOIN "SheetProblem" sp ON sh.id = sp."sheetId"
        WHERE sh."isCompany" = true
        GROUP BY sh.id
    `;

    const companyMeta = new Map(metaRows.map((r) => [r.slug, r]));
    const slugs = metaRows.map((r) => r.slug);

    fs.writeFileSync(
        path.join(CACHE_DIR, "company-slugs.json"),
        JSON.stringify(slugs)
    );
    console.log(`[build-cache] ${slugs.length} company slugs written`);

    // ------------------------------------------------------------------
    // 2. Company problems (one query — replaces getCompanyWiseProblems
    //    + getCompanyWiseProblemIds per company page)
    //
    // The default build-time call is: order="all", search="", sort="frequency",
    // tags=[], difficulties=null, page=1, perPage=100.
    //
    // getDbWhereClause("all", "", slug, null)  →  WHERE sh.slug = '<slug>'
    //   AND s."sheetOrder" > 0
    //
    // getDbOrderByClause("all", "frequency", isSheet=true)
    //   →  AVG(s."sheetOrder") DESC NULLS LAST, p.id
    //
    // Because each (company, problem) pair has exactly one SheetProblem row,
    // AVG(sheetOrder) == sheetOrder.  So the bulk GROUP BY is equivalent.
    // ------------------------------------------------------------------
    console.log("[build-cache] Fetching company problems (bulk query)...");

    const problemRows = await db.$queryRaw<CompanyProblemRow[]>`
        SELECT
            sh.slug,
            p.id,
            p."frontendQuestionId",
            p.platform,
            p.title,
            p.url,
            p.difficulty,
            p."difficultyOrder",
            p.acceptance,
            p."isPaid",
            s."sheetOrder"::float8 AS "sheetOrder",
            array_agg(DISTINCT t."name") FILTER (WHERE t."name" IS NOT NULL) AS tags
        FROM "Sheet" sh
        JOIN "SheetProblem" s ON sh.id = s."sheetId"
        JOIN "Problem" p ON s."problemId" = p.id
        LEFT JOIN "ProblemsOnTopicTags" pt ON p.id = pt."problemId"
        LEFT JOIN "TopicTag" t ON pt."topicTagId" = t.id
        WHERE sh."isCompany" = true AND s."sheetOrder" > 0
        GROUP BY sh.slug, p.id, s."sheetOrder"
        ORDER BY sh.slug, s."sheetOrder" DESC, p.id
    `;

    // Partition by company slug
    const bySlug = new Map<string, CompanyProblemRow[]>();
    for (const row of problemRows) {
        let bucket = bySlug.get(row.slug);
        if (!bucket) {
            bucket = [];
            bySlug.set(row.slug, bucket);
        }
        bucket.push(row);
    }

    let companiesWritten = 0;

    // Write data files for companies that have problems with sheetOrder > 0
    for (const [slug, rows] of bySlug) {
        const meta = companyMeta.get(slug);
        if (!meta) continue;

        // Shape each row to match getCompanyWiseProblems' sanitizeProblems output
        const allProblems = rows.map(({ slug: _slug, sheetOrder, ...rest }) => ({
            ...rest,
            order: sheetOrder, // already a JS number from float8 cast
            tags: (rest.tags ?? []).filter(Boolean),
            companies: [] as string[],
        }));

        const initialProblems = allProblems.slice(0, 100);
        const initialProblemIds = allProblems.map((p) => p.id);
        // Match getSheetMetadata's return shape: [{ ...Sheet, numOfProblems }]
        const initialSheet = [
            {
                id: meta.id,
                slug: meta.slug,
                name: meta.name,
                description: meta.description,
                website: meta.website,
                ownerName: meta.ownerName,
                createdAt: meta.createdAt,
                updatedAt: meta.updatedAt,
                isCompany: meta.isCompany,
                numOfProblems: meta.numOfProblems,
            },
        ];

        fs.writeFileSync(
            path.join(COMPANIES_DIR, `${slug}.json`),
            JSON.stringify({ name: meta.name, initialProblems, initialProblemIds, initialSheet })
        );
        companiesWritten++;
    }

    // Also write stub files for companies that exist but have no problems
    // with sheetOrder > 0 (e.g. recently added companies with no data yet)
    for (const [slug, meta] of companyMeta) {
        if (bySlug.has(slug)) continue;
        const initialSheet = [
            {
                id: meta.id,
                slug: meta.slug,
                name: meta.name,
                description: meta.description,
                website: meta.website,
                ownerName: meta.ownerName,
                createdAt: meta.createdAt,
                updatedAt: meta.updatedAt,
                isCompany: meta.isCompany,
                numOfProblems: meta.numOfProblems,
            },
        ];
        fs.writeFileSync(
            path.join(COMPANIES_DIR, `${slug}.json`),
            JSON.stringify({ name: meta.name, initialProblems: [], initialProblemIds: [], initialSheet })
        );
        companiesWritten++;
    }

    console.log(`[build-cache] ${companiesWritten} company data files written`);

    // ------------------------------------------------------------------
    // 3. Prep-guide data (one Prisma findMany, partitioned by slug)
    //    Replaces db.sheet.findFirst + db.sheetProblem.findMany per page.
    //    Decimal order fields are converted to number here so pages don't
    //    need to call .toNumber() (see prep-guide/page.tsx for compat helper).
    // ------------------------------------------------------------------
    console.log("[build-cache] Fetching prep-guide data (Prisma findMany)...");

    const prepRows = await db.sheetProblem.findMany({
        where: { sheet: { isCompany: true } },
        include: {
            sheet: true,
            problem: {
                include: {
                    topicTags: {
                        include: { topicTag: true },
                    },
                },
            },
        },
    });

    const prepBySlug = new Map<string, typeof prepRows>();
    for (const row of prepRows) {
        const slug = row.sheet.slug;
        let bucket = prepBySlug.get(slug);
        if (!bucket) {
            bucket = [];
            prepBySlug.set(slug, bucket);
        }
        bucket.push(row);
    }

    let prepGuidesWritten = 0;

    for (const [slug, rows] of prepBySlug) {
        const sheet = rows[0].sheet;
        // Strip the `sheet` relation from each row and convert Decimals to numbers
        const problems = rows.map((r) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { sheet: _sheet, ...rest } = r;
            return {
                ...rest,
                sheetOrder: r.sheetOrder.toNumber(),
                thirtyDaysOrder: r.thirtyDaysOrder.toNumber(),
                threeMonthsOrder: r.threeMonthsOrder.toNumber(),
                sixMonthsOrder: r.sixMonthsOrder.toNumber(),
                yearlyOrder: r.yearlyOrder.toNumber(),
            };
        });

        fs.writeFileSync(
            path.join(PREP_GUIDES_DIR, `${slug}.json`),
            JSON.stringify({ sheet, problems })
        );
        prepGuidesWritten++;
    }

    // Write empty prep-guide files for companies with no sheet problems
    for (const [slug, meta] of companyMeta) {
        if (prepBySlug.has(slug)) continue;
        fs.writeFileSync(
            path.join(PREP_GUIDES_DIR, `${slug}.json`),
            JSON.stringify({ sheet: metaRows.find((r) => r.slug === slug), problems: [] })
        );
        prepGuidesWritten++;
    }

    console.log(`[build-cache] ${prepGuidesWritten} prep-guide data files written`);

    await db.$disconnect();
    console.log("[build-cache] Done. Cache written to .build-cache/");
}

main().catch((e) => {
    console.error("[build-cache] Fatal error:", e);
    process.exit(1);
});
