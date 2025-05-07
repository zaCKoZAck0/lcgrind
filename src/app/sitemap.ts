import type { MetadataRoute } from "next";
import {
  BASE_URL,
  MAANG_COMPANIES, 
  TOP_PRODUCT_COMPANIES_INDIA, 
  TOP_PRODUCT_MNCS
} from "~/config/constants";

import {
  generateSlug
} from "~/utils/slug";

const ALL_SHEETS: Array<{ name: string; slug: string }> = [
  { name: "Blind 75", slug: "blind-75" },
  { name: "Top 100 Liked", slug: "leetcode-top-100-liked" },
  { name: "LeetCode 75", slug: "leetcode-75" },
  { name: "Top Interview 150", slug: "leetcode-top-interview-150" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

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
      url: `${BASE_URL}/all-problems`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const companyPages: MetadataRoute.Sitemap = [...MAANG_COMPANIES, ...TOP_PRODUCT_COMPANIES_INDIA, ...TOP_PRODUCT_MNCS].map((company) => {
    const slug = generateSlug(company);
    return {
      url: `${BASE_URL}/companies/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    };
  });

  const prepGuidePages: MetadataRoute.Sitemap = [...MAANG_COMPANIES, ...TOP_PRODUCT_COMPANIES_INDIA, ...TOP_PRODUCT_MNCS].map((company) => {
    const slug = generateSlug(company);
    return {
      url: `${BASE_URL}/companies/${slug}/prep-guide`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    };
  });

  const sheetPages: MetadataRoute.Sitemap = ALL_SHEETS.map((sheet) => ({
    url: `${BASE_URL}/sheets/${sheet.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    ...staticPages,
    ...companyPages,
    ...prepGuidePages,
    ...sheetPages,
  ];
}
