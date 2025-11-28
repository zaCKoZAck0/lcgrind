"use server";
import { db } from "~/lib/db";
import { ProblemWithStats } from "~/types/problem";
import { getOrderKey, getDbOrderByClause, getDbWhereClause } from "~/utils/sorting";

export async function getCompanyWiseProblems(order: string, search: string, slug: string, sort: string, tags: string | string[] | null, difficulties: string | string[] | null) {
    if (!Array.isArray(tags)) tags = [tags];
    if (tags.length === 0) tags = null;
    let difficultiesArray: string[] | null = null;
    if (difficulties != null) {
        difficultiesArray = Array.isArray(difficulties) ? difficulties : [difficulties];
    }
    const orderKey = getOrderKey(order);
    const orderClause = getDbOrderByClause(order, sort, true);
    const whereClause = getDbWhereClause(order, search, slug, difficultiesArray);
    const query = `
            SELECT
                p.*,
                AVG(s."${orderKey}") AS "order",
                array_agg(DISTINCT t."name") AS tags,
                MAX(sh.name) AS "company"
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
            ORDER BY ${orderClause}
    `;

    try {
        const problems = await db.$queryRawUnsafe<ProblemWithStats[]>(
            query,
            tags
        );

        return sanitizeProblems(problems);
    } catch (e) {
        console.error("Error fetching company-wise data:", e);
        return null;
    }
}

//  convert all Decimal to number
const sanitizeProblems = (problems: ProblemWithStats[]) => {
    return problems.map(problem => ({
        ...problem,
        order: problem.order.toNumber(),
    }));
}