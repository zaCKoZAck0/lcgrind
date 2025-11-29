"use server";

import { Decimal } from "@prisma/client/runtime/library";
import { db } from "~/lib/db";

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

export async function getSheetProblems(sheetSlug: string) {

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
        SELECT id from "Sheet" where slug = '${sheetSlug}'
    )
    ORDER BY sp."sheetOrder";
    `;

    try{
        const problems = await db.$queryRawUnsafe<RSheetProblem[]>(query);
        return sanitizeSheetProblem(problems);
    } catch (e) {
        console.error(e);
        return null;
    }
}

function sanitizeSheetProblem(problems: RSheetProblem[]) {
    return problems.map((problem) => ({
        ...problem,
        order: problem.order.toNumber(), 
    }));
}

