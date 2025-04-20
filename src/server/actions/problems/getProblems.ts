"use server";

import { db } from "~/lib/db";
import { sanitizeProblems } from "~/lib/utils";
import { ProblemWithStats } from "~/types/problem";
import { getDbOrderByClause, getDbWhereClause, getOrderKey } from "~/utils/sorting";

export async function getProblems(order: string, search: string, sort: string, tags: string | string[] | null, companies: string | string[] | null, page: number, perPage: number) {
    const orderKey = getOrderKey(order);
        if (!Array.isArray(companies) && companies != null) companies = [companies];
        if (!Array.isArray(tags) && tags != null) tags = [tags];
        const offset = (page - 1) * perPage;
        const orderClause = getDbOrderByClause(order, sort);
        const whereClause = getDbWhereClause(order, search, '');
        const query = `
            SELECT
                p.*,
                AVG(s."${orderKey}") AS "order",
                array_agg(DISTINCT sh.name) AS "companies",
                array_agg(DISTINCT t."name") AS tags
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
            ORDER BY ${orderClause}
            OFFSET ${offset} LIMIT ${perPage};
    `;
    
    try{
        const problems = await db.$queryRawUnsafe<ProblemWithStats[]>(
            query,
            companies,
            tags
        );
        return sanitizeProblems(problems);
    } catch(e) {
        console.error("Error fetching company-wise data:", e);
        return null;
    }
}