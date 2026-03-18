"use server";

import { db } from "~/lib/db";

export async function getTopicProblemIds(
    topicSlug: string,
    search: string,
    difficulties: string | string[] | null,
) {
    let difficultiesArray: string[] | null = null;
    if (difficulties != null) {
        difficultiesArray = Array.isArray(difficulties)
            ? difficulties
            : [difficulties];
    }

    // Build WHERE conditions
    const whereConditions = [`t.slug = $1`];
    const trimmedSearch = search.trim();
    if (trimmedSearch.length > 0) {
        whereConditions.push(
            `(p.title ILIKE '%${trimmedSearch}%' OR p.id::text ILIKE '%${trimmedSearch}%')`,
        );
    }

    // Validate and add difficulty filter
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

    const query = `
        SELECT p.id
        FROM "Problem" p
        INNER JOIN "ProblemsOnTopicTags" pt ON p.id = pt."problemId"
        INNER JOIN "TopicTag" t ON pt."topicTagId" = t.id
        ${whereClause}
        GROUP BY p.id
    `;

    try {
        const problemIds = await db.$queryRawUnsafe<Array<{ id: number }>>(
            query,
            topicSlug,
        );
        return problemIds.map((problem) => problem.id.toString());
    } catch (e) {
        console.error("Error fetching topic problem IDs:", e);
        return [];
    }
}
