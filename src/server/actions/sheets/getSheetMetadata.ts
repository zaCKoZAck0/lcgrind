"use server";
import { Sheet } from "@prisma/client";
import { db } from "~/lib/db";

export async function getSheetMetadata(slug: string) {
    try {
        const sheet = await db.$queryRaw<Array<{ numOfProblems: number } & Sheet>>`
            SELECT s.*, COUNT(sp."problemId") AS "numOfProblems"
            FROM "Sheet" s
            LEFT JOIN "SheetProblem" sp ON s.id = sp."sheetId"
            WHERE s.slug = ${slug}
            GROUP BY s.id
        `;
        return sheet;
    } catch (e) {
        console.error("Error fetching company-wise data:", e);
        return null;
    }
}
