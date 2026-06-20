"use server";

import { db } from "~/lib/db";
import { getAggregatedWhereClause } from "~/utils/sorting";

// Mirrors getProblems' narrowing (CompanyQuestionStat band='all' + tags) so the
// progress tracker / pagination count matches the listed rows. No Sheet joins.
export async function getProblemIds(order: string, search: string, tags: string | string[] | null, companies: string | string[] | null, difficulties: string | string[] | null) {
    void order; // window column irrelevant to id selection; kept for signature parity
    if (!Array.isArray(companies) && companies != null) companies = [companies];
    if (!Array.isArray(tags) && tags != null) tags = [tags];
    let difficultiesArray: string[] | null = null;
    if (difficulties != null) {
        difficultiesArray = Array.isArray(difficulties) ? difficulties : [difficulties];
    }
    const whereFrag = getAggregatedWhereClause(search, difficultiesArray);

    const query = `
        WITH agg AS (
            SELECT cqs."problemId" AS pid
            FROM "CompanyQuestionStat" cqs
            JOIN "Company" co
              ON co.id = cqs."companyId"
             AND co."reportCount" > 0
             AND co.slug <> 'other'
            WHERE cqs.band = 'all' AND cqs."problemId" IS NOT NULL
              AND ($1::text[] IS NULL OR co.slug = ANY($1::text[]))
            GROUP BY cqs."problemId"
        ),
        ptags AS (
            SELECT pt."problemId" AS pid, array_agg(DISTINCT t."name") AS tags
            FROM "ProblemsOnTopicTags" pt
            JOIN "TopicTag" t ON pt."topicTagId" = t.id
            GROUP BY pt."problemId"
        )
        SELECT p.id
        FROM "Problem" p
        LEFT JOIN agg   ON agg.pid = p.id
        LEFT JOIN ptags ON ptags.pid = p.id
        WHERE ($1::text[] IS NULL OR agg.pid IS NOT NULL)
          AND ($2::text[] IS NULL OR ptags.tags && $2::text[])
          ${whereFrag ? `AND ${whereFrag}` : ''}
        ORDER BY p.id;
    `;

    try {
        const problemIds = await db.$queryRawUnsafe<Array<{ id: number }>>(
            query,
            companies,
            tags,
        );
        return problemIds.map((problem) => problem.id.toString());
    } catch (e) {
        console.error("Error fetching company-wise data:", e);
        return [];
    }
}
