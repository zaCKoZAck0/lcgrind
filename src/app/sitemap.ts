import type { MetadataRoute } from "next";
import {
  BASE_URL,
  COMPANIES,
  MAANG_COMPANIES,
  TOP_PRODUCT_COMPANIES_INDIA,
  TOP_PRODUCT_MNCS,
} from "~/config/constants";
import { db } from "~/lib/db";

import {
  generateSlug
} from "~/utils/slug";

const HIGH_PRIORITY_COMPANIES = new Set([
  ...MAANG_COMPANIES,
  ...TOP_PRODUCT_COMPANIES_INDIA,
  ...TOP_PRODUCT_MNCS,
]);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Fetch all sheets from DB with updatedAt for meaningful lastModified dates
  const sheets = await db.sheet.findMany({
    where: { isCompany: false },
    select: { slug: true, updatedAt: true },
  });

  // Fetch company updatedAt dates for meaningful lastModified
  const companySheets = await db.sheet.findMany({
    where: { isCompany: true },
    select: { slug: true, updatedAt: true },
  });
  const companyUpdatedMap = new Map(
    companySheets.map((c) => [c.slug, c.updatedAt])
  );

  // Fetch all topic tag slugs for topic pages
  const topicTags = await db.topicTag.findMany({
    select: { slug: true },
  });

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/companies`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/sheets`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/topics`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/all-problems`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Include ALL companies in sitemap, not just top 26
  const allCompanyNames = Object.keys(COMPANIES);
  const companyPages: MetadataRoute.Sitemap = allCompanyNames.map((company) => {
    const slug = generateSlug(company);
    const isHighPriority = HIGH_PRIORITY_COMPANIES.has(company);
    const updatedAt = companyUpdatedMap.get(slug);
    return {
      url: `${BASE_URL}/companies/${slug}`,
      lastModified: updatedAt ?? now,
      changeFrequency: "weekly" as const,
      priority: isHighPriority ? 0.8 : 0.6,
    };
  });

  const prepGuidePages: MetadataRoute.Sitemap = allCompanyNames.map((company) => {
    const slug = generateSlug(company);
    const isHighPriority = HIGH_PRIORITY_COMPANIES.has(company);
    const updatedAt = companyUpdatedMap.get(slug);
    return {
      url: `${BASE_URL}/companies/${slug}/prep-guide`,
      lastModified: updatedAt ?? now,
      changeFrequency: "monthly" as const,
      priority: isHighPriority ? 0.7 : 0.5,
    };
  });

  const sheetPages: MetadataRoute.Sitemap = sheets.map((sheet) => ({
    url: `${BASE_URL}/sheets/${sheet.slug}`,
    lastModified: sheet.updatedAt ?? now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const topicPages: MetadataRoute.Sitemap = topicTags.map((topic) => ({
    url: `${BASE_URL}/topics/${topic.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...companyPages,
    ...prepGuidePages,
    ...sheetPages,
    ...topicPages,
  ];
}
