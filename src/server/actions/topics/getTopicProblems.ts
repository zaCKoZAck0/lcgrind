"use server";

import { db } from "~/lib/db";
import { sanitizeProblems } from "~/lib/utils";
import { ProblemWithStats } from "~/types/problem";

export async function getTopicProblems(
    topicSlug: string,
    search: string,
    sort: string,
    difficulties: string | string[] | null,
    page: number,
    perPage: number,
) {
    let difficultiesArray: string[] | null = null;
    if (difficulties != null) {
        difficultiesArray = Array.isArray(difficulties)
            ? difficulties
            : [difficulties];
    }

    const offset = (page - 1) * perPage;

    // Build WHERE conditions — filter to problems with this specific topic tag
    const whereConditions = [`t.slug = $1`];
    const trimmedSearch = search.trim();
    if (trimmedSearch.length > 0) {
        whereConditions.push(
            `(p.title ILIKE '%${trimmedSearch}%' OR p.id::text ILIKE '%${trimmedSearch}%')`,
        );
    }

    // Validate and add difficulty filter (prevent SQL injection)
    const VALID_DIFFICULTIES = ["Easy", "Medium", "Hard"];
    if (difficultiesArray && difficultiesArray.length > 0) {
        const validated = difficultiesArray.filter((d) =>
            VALID_DIFFICULTIES.includes(d),
        );
        if (validated.length > 0) {
            const escaped = validated.map((d) => `'${d}'`).join(", ");
            whereConditions.push(`p.difficulty IN (${escaped})`);
        }
    }

    const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

    // Build ORDER BY clause (no frequency for topic pages)
    let orderByClause: string;
    switch (sort) {
        case "difficulty":
            orderByClause = `p."difficultyOrder", p.id`;
            break;
        case "acceptance":
            orderByClause = `p.acceptance DESC NULLS LAST, p.id`;
            break;
        case "question-id":
        default:
            orderByClause = `p.id`;
            break;
    }

    // INNER JOIN on the target topic tag, LEFT JOIN for all tags on each problem
    const query = `
        SELECT
            p.*,
            0::numeric AS "order",
            array_agg(DISTINCT all_tags."name") AS tags
        FROM "Problem" p
        INNER JOIN "ProblemsOnTopicTags" pt ON p.id = pt."problemId"
        INNER JOIN "TopicTag" t ON pt."topicTagId" = t.id
        LEFT JOIN "ProblemsOnTopicTags" all_pt ON p.id = all_pt."problemId"
        LEFT JOIN "TopicTag" all_tags ON all_pt."topicTagId" = all_tags.id
        ${whereClause}
        GROUP BY p.id
        ORDER BY ${orderByClause}
        OFFSET ${offset} LIMIT ${perPage}
    `;

    try {
        const problems = await db.$queryRawUnsafe<ProblemWithStats[]>(
            query,
            topicSlug,
        );
        return sanitizeProblems(problems);
    } catch (e) {
        console.error("Error fetching topic problems:", e);
        return null;
    }
}
