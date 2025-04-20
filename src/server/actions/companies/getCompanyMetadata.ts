"use server";
import { db } from "~/lib/db";

export async function getCompanyMetadata(slug: string) {

    const query2 = `
            SELECT s.name, s.slug, COUNT(sp."problemId") AS "numOfProblems"
            FROM "Sheet" s
            LEFT JOIN "SheetProblem" sp ON s.id = sp."sheetId"
            WHERE s.slug = '${slug}'
            GROUP BY s.name, s.slug
        `;

    try {
        const sheet = db.$queryRawUnsafe<Array<{ name: string, slug: string, numOfProblems: number }>>(
            query2
        )
        return sheet;
    } catch (e) {
        console.error("Error fetching company-wise data:", e);
        return null;
    }
}