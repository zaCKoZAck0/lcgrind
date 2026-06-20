"use server";

import { db } from "~/lib/db";
import type { InterviewQuestion } from "~/server/actions/companies/getCompanyInterviews";
import { FEATURE_FLAGS } from "~/config/feature-flags";

// Slug → DB type(s) mapping. Only these slugs are valid; others 404.
const SLUG_TO_TYPES: Record<string, string[]> = {
    ...(FEATURE_FLAGS.SYSTEM_DESIGN ? { "system-design": ["System Design"] } : {}),
    "lld": ["LLD"],
    "others": ["Behavioral", "HR", "Other"],
};

export type TypeQuestion = Pick<
    InterviewQuestion,
    | "statement"
    | "kind"
    | "askedInCompanies"
    | "problemUrl"
    | "difficulty"
    | "problemId"
    | "askCount"
    | "lastAsked"
    | "firstAsked"
>;

export type QuestionsPage = {
    items: TypeQuestion[];
    total: number;
};

type RawRow = {
    statement: string;
    kind: string;
    companies: { slug: string; name: string }[] | null;
    total: bigint;
};

// Returns null for unknown slugs (caller should notFound()).
export async function getQuestionsByType(
    slugType: string,
    search: string,
    sort: string,
    page: number,
    perPage: number,
): Promise<QuestionsPage | null> {
    const types = SLUG_TO_TYPES[slugType];
    if (!types) return null;

    const offset = (page - 1) * perPage;
    const trimmedSearch = (search ?? "").trim();

    // Two ORDER BY branches — hardcoded, no user-input interpolation.
    const orderClause =
        sort === "az"
            ? `statement ASC`
            : `weight DESC, statement ASC`; // default: most-asked

    // Search predicate fragment (no user string interpolated into query — bound via $2).
    const searchPredicate =
        trimmedSearch.length > 0
            ? `AND statement ILIKE '%' || $2 || '%'`
            : "";

    const query = `
        WITH sc AS (
            SELECT
                cqs.statement,
                cqs.kind,
                co.slug,
                co.name,
                co."reportCount" AS report_count,
                SUM(cqs."askCount") AS ask_count
            FROM "CompanyQuestionStat" cqs
            JOIN "Company" co
              ON co.id = cqs."companyId"
             AND co."reportCount" > 0
             AND co.slug <> 'other'
            WHERE cqs.band = 'all'
              AND cqs.type = ANY($1::text[])
            GROUP BY cqs.statement, cqs.kind, co.slug, co.name, co."reportCount"

            UNION ALL

            SELECT
                cqa.statement,
                'question' AS kind,
                co.slug,
                co.name,
                co."reportCount" AS report_count,
                COUNT(*)::bigint AS ask_count
            FROM "CommunityQuestionAsk" cqa
            JOIN "Company" co
              ON co.id = cqa."companyId"
             AND co."reportCount" > 0
             AND co.slug <> 'other'
            WHERE cqa.type = ANY($1::text[])
            GROUP BY cqa.statement, co.slug, co.name, co."reportCount"
        ),
        agg AS (
            SELECT
                statement,
                MAX(kind)        AS kind,
                SUM(ask_count)   AS weight,
                json_agg(
                    json_build_object('slug', slug, 'name', name)
                    ORDER BY report_count DESC, ask_count DESC, name ASC
                ) AS companies
            FROM sc
            GROUP BY statement
        ),
        filtered AS (
            SELECT statement, kind, companies, weight
            FROM agg
            WHERE TRUE ${searchPredicate}
        )
        SELECT
            statement,
            kind,
            companies,
            COUNT(*) OVER () AS total
        FROM filtered
        ORDER BY ${orderClause}
        OFFSET ${offset} LIMIT ${perPage};
    `;

    try {
        const params: (string[] | string)[] = [types];
        if (trimmedSearch.length > 0) params.push(trimmedSearch);

        const rows = await db.$queryRawUnsafe<RawRow[]>(query, ...params);

        const total = rows.length > 0 ? Number(rows[0].total) : 0;
        const items: TypeQuestion[] = rows.map((r) => ({
            statement: r.statement,
            kind: r.kind,
            askedInCompanies: r.companies ?? [],
            problemUrl: null,
            difficulty: null,
            problemId: null,
            // Not exposed to UI; chips need the field to exist to type-check.
            askCount: 0,
            lastAsked: null,
            firstAsked: null,
        }));

        return { items, total };
    } catch (e) {
        console.error("Error fetching questions by type:", e);
        return { items: [], total: 0 };
    }
}
