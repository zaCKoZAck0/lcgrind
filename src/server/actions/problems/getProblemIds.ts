"use server";

import { db } from "~/lib/db";
import { getDbWhereClause } from "~/utils/sorting";

export async function getProblemIds(order: string, search: string, tags: string | string[] | null, companies: string | string[] | null, difficulties: string | string[] | null) {
        if (!Array.isArray(companies) && companies != null) companies = [companies];
        if (!Array.isArray(tags) && tags != null) tags = [tags];
        let difficultiesArray: string[] | null = null;
        if (difficulties != null) {
            difficultiesArray = Array.isArray(difficulties) ? difficulties : [difficulties];
        }
        const whereClause = getDbWhereClause(order, search, '', difficultiesArray);
    
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
          COUNT(CASE WHEN sh.name = ANY($1::text[]) THEN 1 END) > 0)
        AND
        ($2::text[] IS NULL OR
          COUNT(CASE WHEN t."name" = ANY($2::text[]) THEN 1 END) > 0)
      )
    `;
    
    try{
        const problemIds = await db.$queryRawUnsafe<Array<{ id: string }>>(
            query,
            companies,
            tags
        );
        return problemIds.map(problem => problem.id);
    } catch(e) {
        console.error("Error fetching company-wise data:", e);
        return [];
    }
}