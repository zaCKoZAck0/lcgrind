"use server";

import { db } from "~/lib/db";
import {
  CURATED_COMPANY_MIN_REPORTS,
  MIN_CATEGORY_QUESTIONS,
  type CategorySlug,
  getEnabledCategorySlugs,
} from "~/config/categories";

// Maps DB question type strings to category slugs
const TYPE_TO_CATEGORY_SLUG: Record<string, CategorySlug> = {
  DSA: "dsa",
  "System Design": "system-design",
  LLD: "lld",
};

export interface CompanyCategoryCount {
  companySlug: string;
  category: CategorySlug;
  count: number;
}

/**
 * Returns (companySlug, categorySlug, count) tuples for curated companies
 * that have enough questions in each enabled category.
 * Used for generateStaticParams and sitemap generation.
 * Conservative proxy: seeded questions in band="all" only.
 */
export async function getAllCompanyCategoryCounts(): Promise<CompanyCategoryCount[]> {
  const enabledSlugs = getEnabledCategorySlugs();

  const companies = await db.company.findMany({
    where: {
      reportCount: { gte: CURATED_COMPANY_MIN_REPORTS },
      slug: { not: "other" },
    },
    select: { id: true, slug: true },
  });

  if (companies.length === 0) return [];

  const companyIds = companies.map((c) => c.id);
  const slugById = new Map(companies.map((c) => [c.id, c.slug]));

  const seededGroups = await db.companyQuestionStat.groupBy({
    by: ["companyId", "type"],
    where: { companyId: { in: companyIds }, band: "all" },
    _count: { id: true },
  });

  const countMap = new Map<string, number>();

  for (const row of seededGroups) {
    const slug = slugById.get(row.companyId);
    if (!slug) continue;
    const categorySlug = TYPE_TO_CATEGORY_SLUG[row.type] as CategorySlug | undefined;
    if (!categorySlug) continue;
    const key = `${slug}::${categorySlug}`;
    countMap.set(key, (countMap.get(key) ?? 0) + row._count.id);
  }

  const results: CompanyCategoryCount[] = [];
  for (const [key, count] of countMap) {
    if (count < MIN_CATEGORY_QUESTIONS) continue;
    const separatorIdx = key.indexOf("::");
    const companySlug = key.slice(0, separatorIdx);
    const category = key.slice(separatorIdx + 2) as CategorySlug;
    if (!enabledSlugs.includes(category)) continue;
    results.push({ companySlug, category, count });
  }

  return results;
}

/**
 * Returns per-category question counts for a single company.
 * Used by the company page and category pages to check data sufficiency.
 */
export async function getCategoryCountsForCompany(
  slug: string,
): Promise<Partial<Record<CategorySlug, number>>> {
  const enabledSlugs = getEnabledCategorySlugs();

  const seededGroups = await db.companyQuestionStat.groupBy({
    by: ["type"],
    where: { company: { slug }, band: "all" },
    _count: { id: true },
  });

  const result: Partial<Record<CategorySlug, number>> = {};
  for (const row of seededGroups) {
    const categorySlug = TYPE_TO_CATEGORY_SLUG[row.type] as CategorySlug | undefined;
    if (!categorySlug || !enabledSlugs.includes(categorySlug)) continue;
    result[categorySlug] = (result[categorySlug] ?? 0) + row._count.id;
  }

  return result;
}
