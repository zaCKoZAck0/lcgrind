"use server";

import { db } from "~/lib/db";

export type FilterCompany = { slug: string; name: string };

// Company options for the /all-problems company filter. Same gate as the
// /companies listing: only companies that actually carry interview data
// (reportCount > 0) and never the "other" catch-all bucket. Slug is the filter
// key (URL ?companies=<slug>); name is the label.
export async function getFilterCompanies(): Promise<FilterCompany[]> {
  try {
    const companies = await db.company.findMany({
      where: { reportCount: { gt: 0 }, slug: { not: "other" } },
      orderBy: [{ reportCount: "desc" }, { name: "asc" }],
      select: { slug: true, name: true },
    });
    return companies;
  } catch (e) {
    console.error("Error fetching filter companies:", e);
    return [];
  }
}
