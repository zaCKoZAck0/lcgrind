"use server";

import { db } from "~/lib/db";
import { sanitizeProblems } from "~/lib/utils";
import { ProblemWithStats } from "~/types/problem";
import { getDbWhereClause, getOrderKey } from "~/utils/sorting";

export async function getRandomProblem(
    order: string,
    search: string,
    tags: string | string[] | null,
    companies: string | string[] | null,
    difficulties: string | string[] | null,
    excludedIds: string[]
) {
    const orderKey = getOrderKey(order);
    if (!Array.isArray(companies) && companies != null) companies = [companies];
    if (!Array.isArray(tags) && tags != null) tags = [tags];
    let difficultiesArray: string[] | null = null;
    if (difficulties != null) {
        difficultiesArray = Array.isArray(difficulties) ? difficulties : [difficulties];
    }
    const whereClause = getDbWhereClause(order, search, '', difficultiesArray);
    
    // Convert excludedIds to integers for database query and validate
    const excludedIdsInt = excludedIds
        .map(id => parseInt(id, 10))
        .filter(id => !isNaN(id) && Number.isFinite(id) && id > 0);
    
    // Build exclusion clause with parameterized array
    const exclusionClause = excludedIdsInt.length > 0 
        ? `AND p.id != ALL($3::int[])` 
        : '';
    
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
        ${exclusionClause}
        GROUP BY p.id
        HAVING (
            ($1::text[] IS NULL OR
              COUNT(CASE WHEN sh.name = ANY($1::text[]) THEN 1 END) > 0)
            AND
            ($2::text[] IS NULL OR
              COUNT(CASE WHEN t."name" = ANY($2::text[]) THEN 1 END) > 0)
        )
        ORDER BY RANDOM()
        LIMIT 1;
    `;

    try {
        const params = excludedIdsInt.length > 0
            ? [companies, tags, excludedIdsInt]
            : [companies, tags];
        
        const problems = await db.$queryRawUnsafe<ProblemWithStats[]>(
            query,
            ...params
        );
        if (problems.length === 0) {
            return null;
        }
        return sanitizeProblems(problems)[0];
    } catch (e) {
        console.error("Error fetching random problem:", e);
        return null;
    }
}
