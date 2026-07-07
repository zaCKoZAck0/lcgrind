import { FEATURE_FLAGS } from "./feature-flags";
import type { InterviewSections } from "~/server/actions/companies/getCompanyInterviews";

export const MIN_CATEGORY_QUESTIONS = 8;
export const CURATED_COMPANY_MIN_REPORTS = 5;

export type CategorySlug = "dsa" | "system-design" | "behavioral" | "lld";

export interface CategoryConfig {
  sectionKey: keyof InterviewSections;
  flag: boolean;
  label: string;
  titleTemplate: (company: string, year: number) => string;
  h1Template: (company: string) => string;
  descTemplate: (company: string, count: number) => string;
  keywords: (company: string) => string[];
}

export const CATEGORY_CONFIG: Record<CategorySlug, CategoryConfig> = {
  dsa: {
    sectionKey: "problemSolving",
    flag: true,
    label: "DSA",
    titleTemplate: (company, year) => {
      const long = `Most Asked ${company} DSA Interview Questions [${year}]`;
      const short = `${company} DSA Questions [${year}]`;
      return long.length <= 60 ? long : short;
    },
    h1Template: (company) => `Most Asked ${company} DSA Interview Questions`,
    descTemplate: (company, count) =>
      `The ${count} most asked DSA and coding interview questions at ${company}, ranked by how often candidates report them.`,
    keywords: (company) => [
      `${company} DSA questions`,
      `${company} coding interview questions`,
      `${company} LeetCode questions`,
      `${company} algorithm questions`,
      `${company} interview questions`,
    ],
  },
  "system-design": {
    sectionKey: "systemDesign",
    flag: FEATURE_FLAGS.SYSTEM_DESIGN,
    label: "System Design",
    titleTemplate: (company, year) => {
      const long = `Most Asked ${company} System Design Questions [${year}]`;
      const short = `${company} System Design [${year}]`;
      return long.length <= 60 ? long : short;
    },
    h1Template: (company) => `Most Asked ${company} System Design Questions`,
    descTemplate: (company, count) =>
      `The ${count} most asked system design interview questions at ${company}, ranked by how often candidates report them.`,
    keywords: (company) => [
      `${company} system design questions`,
      `${company} system design interview`,
      `${company} system design round`,
      `${company} architecture interview`,
      `${company} interview questions`,
    ],
  },
  behavioral: {
    sectionKey: "others",
    flag: FEATURE_FLAGS.OTHERS,
    label: "Behavioral",
    titleTemplate: (company, year) => {
      const long = `Most Asked ${company} Behavioral Questions [${year}]`;
      const short = `${company} Behavioral Questions [${year}]`;
      return long.length <= 60 ? long : short;
    },
    h1Template: (company) => `Most Asked ${company} Behavioral Questions`,
    descTemplate: (company, count) =>
      `The ${count} most asked behavioral and HR interview questions at ${company}, reported by candidates.`,
    keywords: (company) => [
      `${company} behavioral questions`,
      `${company} HR interview questions`,
      `${company} culture fit questions`,
      `${company} interview questions`,
    ],
  },
  lld: {
    sectionKey: "lld",
    flag: FEATURE_FLAGS.LLD,
    label: "Low Level Design",
    titleTemplate: (company, year) => {
      const long = `Most Asked ${company} Low Level Design Questions [${year}]`;
      const short = `${company} LLD Questions [${year}]`;
      return long.length <= 60 ? long : short;
    },
    h1Template: (company) => `Most Asked ${company} Low Level Design Questions`,
    descTemplate: (company, count) =>
      `The ${count} most asked low level design and machine coding questions at ${company}, reported by candidates.`,
    keywords: (company) => [
      `${company} low level design questions`,
      `${company} LLD interview`,
      `${company} machine coding questions`,
      `${company} interview questions`,
    ],
  },
};

export const CATEGORY_SLUGS = Object.keys(CATEGORY_CONFIG) as CategorySlug[];

export function getEnabledCategorySlugs(): CategorySlug[] {
  return CATEGORY_SLUGS.filter((slug) => CATEGORY_CONFIG[slug].flag);
}
