"use server";

import { db } from "~/lib/db";

export async function searchCompanyNames(query: string): Promise<string[]> {
    const q = query.trim();
    if (q.length === 0) return [];
    const companies = await db.company.findMany({
        where: {
            OR: [
                { name: { contains: q, mode: "insensitive" } },
                { slug: { contains: q.toLowerCase() } },
            ],
        },
        orderBy: [{ reportCount: "desc" }, { name: "asc" }],
        take: 8,
        select: { name: true },
    });
    return companies.map((c) => c.name);
}
