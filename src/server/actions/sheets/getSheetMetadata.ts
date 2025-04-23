"use server";
import { Sheet } from "@prisma/client";
import { db } from "~/lib/db";

export async function getSheetMetadata(slug: string) {

    const query2 = `
            SELECT s.*, COUNT(sp."problemId") AS "numOfProblems"
            FROM "Sheet" s
            LEFT JOIN "SheetProblem" sp ON s.id = sp."sheetId"
            WHERE s.slug = '${slug}'
            GROUP BY s.id
        `;

    try {
        const sheet = db.$queryRawUnsafe<Array<{ numOfProblems: number } & Sheet>>(
            query2
        )
        return sheet;
    } catch (e) {
        console.error("Error fetching company-wise data:", e);
        return null;
    }
}