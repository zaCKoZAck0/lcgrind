"use server";

import { db } from "~/lib/db";
import { CompanyDetails, TotalCountResult } from "~/types/company";


export async function getCompanies(query: string, offset: number, ITEMS_PER_PAGE: number) {
    const likeParam = `%${query.toLowerCase()}%`;
    try {
        const [totalCountResult, companies] = await Promise.all([
            db.$queryRaw<TotalCountResult[]>`
          SELECT COUNT(*) AS count
          FROM "Sheet"
          WHERE "isCompany" = TRUE AND slug ILIKE ${likeParam};
        `,
            db.$queryRaw<CompanyDetails[]>`
          SELECT s.name, s.slug, COUNT(p."problemId") AS "numOfProblems"
          FROM "Sheet" s
          LEFT JOIN "SheetProblem" p ON s.id = p."sheetId"
          WHERE s."isCompany" = TRUE AND s.slug ILIKE ${likeParam}
          GROUP BY s.id
          ORDER BY "numOfProblems" DESC
          OFFSET ${offset} LIMIT ${ITEMS_PER_PAGE};
        `,
        ]);
        return {
            totalCountResult,
            companies,
        }
    } catch (e) {
        console.error("Error fetching companies:", e);
        return {
            totalCountResult: [],
            companies: [],
        };
    }


}