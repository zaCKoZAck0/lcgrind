"use server";

import { db } from "~/lib/db";
import { sanitizeAggregatedProblems } from "~/lib/utils";
import type { AggregatedProblem } from "~/types/problem";
import { getAggregatedOrderByClause, getAggregatedWhereClause, getStatWindowColumn } from "~/utils/sorting";

export async function getTopicProblems(
    topicSlug: string,
    order: string,
    search: string,
    sort: string,
    tags: string | string[] | null,
    companies: string | string[] | null,
    difficulties: string | string[] | null,
    page: number,
    perPage: number,
) {
    if (!Array.isArray(companies) && companies != null) companies = [companies];
    if (!Array.isArray(tags) && tags != null) tags = [tags];
    let difficultiesArray: string[] | null = null;
    if (difficulties != null) {
        difficultiesArray = Array.isArray(difficulties) ? difficulties : [difficulties];
    }

    const offset = (page - 1) * perPage;
    const windowCol = getStatWindowColumn(order);
    const whereClause = getAggregatedWhereClause(search, difficultiesArray);
    const orderClause = getAggregatedOrderByClause(sort);

    const query = `
        WITH pc AS (
            SELECT cqs."problemId" AS pid, co.slug, co.name, co."reportCount",
                   SUM(cqs."${windowCol}") AS freq, SUM(cqs."askCount") AS ask_count,
                   MAX(cqs."lastAsked") AS last_asked
            FROM "CompanyQuestionStat" cqs
            JOIN "Company" co ON co.id = cqs."companyId" AND co."reportCount" > 0 AND co.slug <> 'other'
            WHERE cqs.band = 'all' AND cqs."problemId" IS NOT NULL
            GROUP BY cqs."problemId", co.slug, co.name, co."reportCount"
        ),
        agg AS (
            SELECT pid, SUM(freq) AS "order", MAX(last_asked) AS "recency",
                   json_agg(json_build_object('slug', slug, 'name', name)
                     ORDER BY report_count DESC, ask_count DESC, name ASC) AS companies
            FROM pc WHERE ($1::text[] IS NULL OR slug = ANY($1::text[]))
            GROUP BY pid
        ),
        ptags AS (
            SELECT pt."problemId" AS pid, array_agg(DISTINCT t."name") AS tags
            FROM "ProblemsOnTopicTags" pt JOIN "TopicTag" t ON pt."topicTagId" = t.id
            GROUP BY pt."problemId"
        )
        SELECT p.*, agg."order", agg."recency",
               COALESCE(agg.companies, '[]'::json) AS "companies",
               COALESCE(ptags.tags, '{}') AS tags
        FROM "Problem" p
        LEFT JOIN agg ON agg.pid = p.id
        LEFT JOIN ptags ON ptags.pid = p.id
        WHERE ($1::text[] IS NULL OR agg.pid IS NOT NULL)
          AND ($2::text[] IS NULL OR ptags.tags && $2::text[])
          AND EXISTS (SELECT 1 FROM "ProblemsOnTopicTags" pt2
                      INNER JOIN "TopicTag" t2 ON pt2."topicTagId" = t2.id
                      WHERE t2.slug = $3 AND pt2."problemId" = p.id)
        ${whereClause ? `AND ${whereClause}` : ''}
        ORDER BY ${orderClause}
        OFFSET ${offset} LIMIT ${perPage};
    `;

    try {
        const problems = await db.$queryRawUnsafe<AggregatedProblem[]>(
            query,
            companies,
            tags,
            topicSlug,
        );
        return sanitizeAggregatedProblems(problems);
    } catch (e) {
        console.error("Error fetching topic problems:", e);
        return null;
    }
}
