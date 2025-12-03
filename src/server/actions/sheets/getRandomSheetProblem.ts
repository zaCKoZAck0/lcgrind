"use server";

import { db } from "~/lib/db";
import { Decimal } from "@prisma/client/runtime/library";

type RSheetProblem = {
    order: Decimal;
    group: string;
    solutionVideoLink: string | null;
    id: number;
    url: string;
    difficulty: string;
    title: string;
    isPaid: boolean;
    acceptance: number;
    difficultyOrder: number;
    frontendQuestionId: string;
    platform: string;
};

type SanitizedSheetProblem = Omit<RSheetProblem, 'order'> & { order: number };

export async function getRandomSheetProblem(
    sheetSlug: string,
    selectedTopics: string[],
    selectedDifficulties: string[],
    excludedIds: string[]
): Promise<SanitizedSheetProblem | null> {
    // Build exclusion clause for completed problems
    const excludedIdsInt = excludedIds
        .map(id => parseInt(id, 10))
        .filter(id => !isNaN(id) && Number.isFinite(id) && id > 0);

    const exclusionClause = excludedIdsInt.length > 0
        ? `AND p.id != ALL($4::int[])`
        : '';

    const query = `
    SELECT 
        sp."sheetOrder" as order, 
        sp.group,
        sp."solutionVideoLink",
        p.*  
    FROM "SheetProblem" sp
        LEFT JOIN "Problem" p
        ON sp."problemId" = p.id
    WHERE sp."sheetId" = (
        SELECT id from "Sheet" where slug = $1
    )
    AND ($2::text[] IS NULL OR sp.group = ANY($2::text[]))
    AND ($3::text[] IS NULL OR p.difficulty = ANY($3::text[]))
    ${exclusionClause}
    ORDER BY RANDOM()
    LIMIT 1;
    `;

    try {
        const params: (string | string[] | number[] | null)[] = [
            sheetSlug,
            selectedTopics.length > 0 ? selectedTopics : null,
            selectedDifficulties.length > 0 ? selectedDifficulties : null,
        ];

        if (excludedIdsInt.length > 0) {
            params.push(excludedIdsInt);
        }

        const problems = await db.$queryRawUnsafe<RSheetProblem[]>(
            query,
            ...params
        );

        if (problems.length === 0) {
            return null;
        }

        return sanitizeSheetProblem(problems[0]);
    } catch (e) {
        console.error("Error fetching random sheet problem:", e);
        return null;
    }
}

function sanitizeSheetProblem(problem: RSheetProblem): SanitizedSheetProblem {
    return {
        ...problem,
        order: problem.order.toNumber(),
    };
}
