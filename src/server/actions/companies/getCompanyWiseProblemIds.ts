"use server";

import { db } from "~/lib/db";
import { getDbWhereClause } from "~/utils/sorting";

export async function getCompanyWiseProblemIds(order: string, search: string, slug: string, tags: string | string[] | null, difficulties: string | string[] | null) {
    if (!Array.isArray(tags)) tags = [tags];
    if (tags.length === 0) tags = null;
    let difficultiesArray: string[] | null = null;
    if (difficulties != null) {
        difficultiesArray = Array.isArray(difficulties) ? difficulties : [difficulties];
    }
    const whereClause = getDbWhereClause(order, search, slug, difficultiesArray);
    const query = `
            SELECT
                p.id
            FROM "Problem" p
            LEFT JOIN "SheetProblem" s ON p.id = s."problemId"
            LEFT JOIN "Sheet" sh ON s."sheetId" = sh.id
            LEFT JOIN "ProblemsOnTopicTags" pt ON p.id = pt."problemId"
            LEFT JOIN "TopicTag" t ON pt."topicTagId" = t.id
            ${whereClause}
            GROUP BY p.id
            HAVING (
        ($1::text[] IS NULL OR
          COUNT(CASE WHEN t."name" = ANY($1::text[]) THEN 1 END) > 0)
      )
    `;

    try {
        const problemIds = await db.$queryRawUnsafe<Array<{ id: number }>>(
            query,
            tags
        );
        return problemIds.map(problem => problem.id);
    } catch (e) {
        console.error("Error fetching company-wise problem IDs:", e);
        return [];
    }
}
