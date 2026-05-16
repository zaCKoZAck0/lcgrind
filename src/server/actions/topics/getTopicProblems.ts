"use server";

import { db } from "~/lib/db";
import { sanitizeProblems } from "~/lib/utils";
import { ProblemWithStats } from "~/types/problem";
import { getDbOrderByClause, getDbWhereClause, getOrderKey } from "~/utils/sorting";

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
    const orderKey = getOrderKey(order);
    const orderClause = getDbOrderByClause(order, sort);
    const whereClause = getDbWhereClause(order, search, '', difficultiesArray);

    const query = `
        SELECT
            p.*,
            AVG(s."${orderKey}") AS "order",
            array_agg(DISTINCT sh.name) AS "companies",
            array_agg(DISTINCT all_tags."name") AS tags
        FROM "Problem" p
        LEFT JOIN "SheetProblem" s ON p.id = s."problemId"
        LEFT JOIN "Sheet" sh ON s."sheetId" = sh.id
        INNER JOIN "ProblemsOnTopicTags" pt ON p.id = pt."problemId"
        INNER JOIN "TopicTag" t ON pt."topicTagId" = t.id AND t.slug = $3
        LEFT JOIN "ProblemsOnTopicTags" all_pt ON p.id = all_pt."problemId"
        LEFT JOIN "TopicTag" all_tags ON all_pt."topicTagId" = all_tags.id
        ${whereClause}
        GROUP BY p.id
        HAVING (
            ($1::text[] IS NULL OR COUNT(CASE WHEN sh.name = ANY($1::text[]) THEN 1 END) > 0)
            AND
            ($2::text[] IS NULL OR COUNT(CASE WHEN all_tags."name" = ANY($2::text[]) THEN 1 END) > 0)
        )
        ORDER BY ${orderClause}
        OFFSET ${offset} LIMIT ${perPage};
    `;

    try {
        const problems = await db.$queryRawUnsafe<ProblemWithStats[]>(
            query,
            companies,
            tags,
            topicSlug,
        );
        return sanitizeProblems(problems);
    } catch (e) {
        console.error("Error fetching topic problems:", e);
        return null;
    }
}
