import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CANONICAL_URL } from "~/config/constants";
import {
  CATEGORY_CONFIG,
  CATEGORY_SLUGS,
  MIN_CATEGORY_QUESTIONS,
  type CategorySlug,
} from "~/config/categories";
import {
  getAllCompanyCategoryCounts,
  getCategoryCountsForCompany,
} from "~/server/actions/companies/getCompanyCategoryCounts";
import {
  getCompanyInterviews,
  type InterviewSections,
} from "~/server/actions/companies/getCompanyInterviews";
import { db } from "~/lib/db";
import {
  BreadcrumbJsonLd,
  ItemListJsonLd,
  FAQJsonLd,
} from "~/components/seo/json-ld";
import { CompanyHeader } from "~/components/company/company-header";
import { QuestionSections } from "~/components/company/question-sections";
import { isBand } from "~/components/company/band-selector";
import { buttonVariants } from "~/components/ui/button";
import type { TierLevel } from "~/utils/company-tiers";

export const revalidate = 86400;
export const dynamicParams = true;

type Props = {
  params: Promise<{ "company-slug": string; category: string }>;
  searchParams: Promise<{ band?: string }>;
};

export async function generateStaticParams() {
  const items = await getAllCompanyCategoryCounts();
  return items.map((item) => ({
    "company-slug": item.companySlug,
    category: item.category,
  }));
}

async function getCompanyBySlug(slug: string) {
  if (slug === "other") return null;
  return db.company.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      reportCount: true,
      lastSeen: true,
      payTier: true,
      difficultyTier: true,
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { "company-slug": companySlug, category } = await params;

  if (
    !CATEGORY_SLUGS.includes(category as CategorySlug) ||
    !CATEGORY_CONFIG[category as CategorySlug]?.flag
  ) {
    return { title: "Not Found" };
  }

  const company = await getCompanyBySlug(companySlug);
  if (!company) return { title: "Not Found" };

  const config = CATEGORY_CONFIG[category as CategorySlug];
  const counts = await getCategoryCountsForCompany(companySlug);
  const count = counts[category as CategorySlug];

  const year = new Date().getFullYear();
  const pageTitle = config.titleTemplate(company.name, year);
  const pageDescription = config.descTemplate(company.name, count ?? 0);
  const pageUrl = `${CANONICAL_URL}/companies/${companySlug}/${category}`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: config.keywords(company.name),
    alternates: { canonical: pageUrl },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: pageUrl,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
    },
    ...(count === undefined || count < MIN_CATEGORY_QUESTIONS
      ? { robots: { index: false, follow: true } }
      : {}),
  };
}

export default async function CompanyCategoryPage({
  params,
  searchParams,
}: Props) {
  const [{ "company-slug": companySlug, category }, { band: bandParam }] =
    await Promise.all([params, searchParams]);

  if (
    !CATEGORY_SLUGS.includes(category as CategorySlug) ||
    !CATEGORY_CONFIG[category as CategorySlug]?.flag
  ) {
    notFound();
  }

  const company = await getCompanyBySlug(companySlug);
  if (!company) notFound();

  const config = CATEGORY_CONFIG[category as CategorySlug];
  const band = isBand(bandParam) ? bandParam : "all";
  const sections = await getCompanyInterviews(companySlug, band);

  const filteredSections: InterviewSections = {
    problemSolving: [],
    systemDesign: [],
    lld: [],
    others: [],
  };
  filteredSections[config.sectionKey] = sections[config.sectionKey];

  const pageUrl = `${CANONICAL_URL}/companies/${companySlug}/${category}`;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: CANONICAL_URL },
          { name: "Companies", url: `${CANONICAL_URL}/companies` },
          {
            name: company.name,
            url: `${CANONICAL_URL}/companies/${companySlug}`,
          },
          { name: config.label, url: pageUrl },
        ]}
      />
      <ItemListJsonLd
        name={config.h1Template(company.name)}
        url={pageUrl}
        items={filteredSections[config.sectionKey]
          .slice(0, 20)
          .map((q) => q.statement)}
      />
      <FAQJsonLd
        items={[
          {
            question: `What ${config.label} questions does ${company.name} ask?`,
            answer: `${company.name} is known to ask ${filteredSections[config.sectionKey].length} ${config.label} interview questions based on community reports.`,
          },
          {
            question: `How hard is the ${company.name} ${config.label} interview?`,
            answer: `The ${company.name} ${config.label} interview difficulty varies. Practice the most commonly asked questions to prepare effectively.`,
          },
        ]}
      />
      <div className="w-full max-w-[1000px] py-6">
        <div className="mb-12 shadow-shadow">
          <div className="p-3 border-2 border-border bg-card flex justify-between items-center bg-main text-main-foreground">
            <Link
              className={buttonVariants({ variant: "neutral", size: "sm" })}
              href={`/companies/${companySlug}`}
            >
              <ArrowLeft />
              {company.name}
            </Link>
          </div>
          <CompanyHeader
            name={company.name}
            slug={company.slug}
            payTier={0}
            difficultyTier={company.difficultyTier as TierLevel}
            headingFull={config.h1Template(company.name)}
          />
        </div>
        <QuestionSections
          sections={filteredSections}
          companyName={company.name}
        />
      </div>
    </>
  );
}
