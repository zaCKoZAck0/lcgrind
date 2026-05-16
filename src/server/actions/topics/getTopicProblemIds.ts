"use server";

import { db } from "~/lib/db";
import { getDbWhereClause } from "~/utils/sorting";

export async function getTopicProblemIds(
    topicSlug: string,
    order: string,
    search: string,
    tags: string | string[] | null,
    companies: string | string[] | null,
    difficulties: string | string[] | null,
) {
    if (!Array.isArray(companies) && companies != null) companies = [companies];
    if (!Array.isArray(tags) && tags != null) tags = [tags];
    let difficultiesArray: string[] | null = null;
    if (difficulties != null) {
        difficultiesArray = Array.isArray(difficulties) ? difficulties : [difficulties];
    }

    const whereClause = getDbWhereClause(order, search, '', difficultiesArray);

    const query = `
        SELECT p.id
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
    `;

    try {
        const problemIds = await db.$queryRawUnsafe<Array<{ id: number }>>(
            query,
            companies,
            tags,
            topicSlug,
        );
        return problemIds.map((problem) => problem.id.toString());
    } catch (e) {
        console.error("Error fetching topic problem IDs:", e);
        return [];
    }
}
