import { type CompanyParams } from "~/types/company";
import { CompanyPage } from "~/components/company/company-page";
import type { Metadata } from "next";
import { BASE_URL, MAANG_COMPANIES, TOP_PRODUCT_COMPANIES_INDIA, TOP_PRODUCT_MNCS } from "~/config/constants";
import { generateSlug } from "~/utils/slug";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "~/components/seo/json-ld";
import { getCompanyWiseProblems } from "~/server/actions/companies/getCompanyWiseProblems";
import { getCompanyWiseProblemIds } from "~/server/actions/companies/getCompanyWiseProblemIds";
import { getSheetMetadata } from "~/server/actions/sheets/getSheetMetadata";
import { db } from "~/lib/db";

type Props = {
    params: Promise<CompanyParams>;
};

const ITEMS_PER_PAGE = 100;

export const revalidate = 86400;
export const dynamicParams = true;

// Pre-render top company pages at build time for faster initial loads
const TOP_COMPANIES = [...MAANG_COMPANIES, ...TOP_PRODUCT_COMPANIES_INDIA, ...TOP_PRODUCT_MNCS];

export async function generateStaticParams() {
    return TOP_COMPANIES.map((company) => ({
        'company-slug': generateSlug(company),
    }));
}

async function getCompanyBySlug(slug: string) {
    return db.sheet.findFirst({
        where: { slug, isCompany: true },
        select: { name: true },
    });
}

export async function generateMetadata(
    { params }: Props,
): Promise<Metadata> {
    const { 'company-slug': companySlug } = await params;
    const company = await getCompanyBySlug(companySlug);

    if (!company) {
        return {
            title: "Company Not Found",
        };
    }

    const companyName = company.name;
    const currentYear = new Date().getFullYear();
    const pageTitle = `${companyName} LeetCode Questions | ${companyName} Interview Questions [${currentYear}]`;
    const pageDescription = `Practice ${companyName} company-wise LeetCode problems for free. Get the latest ${companyName} interview questions, DSA sheets for free. Prepare for your ${companyName} coding interview.`;
    const pageUrl = `${BASE_URL}/companies/${companySlug}`;

    const keywords = [
        `${companyName} leetcode questions`,
        `${companyName} interview questions`,
        `${companyName} coding questions`,
        `${companyName} dsa questions`,
        `prepare for ${companyName} coding interview`,
        `top leetcode questions for ${companyName}`,
        "leetcode",
        "coding interview",
        "data structures",
        "algorithms",
        companyName,
    ];

    return {
        title: pageTitle,
        description: pageDescription,
        keywords: keywords,
        alternates: {
            canonical: pageUrl,
        },
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
    };
}

export default async function CompanyWiseQuestion({
    params
}: {
    params: Promise<CompanyParams>;
}) {
    const { 'company-slug': slug } = await params;
    const company = await getCompanyBySlug(slug);

    if (!company) {
        notFound();
    }

    const companyName = company.name;

    // Server-fetch initial data for SSR (default params: all time, no search, sorted by frequency, page 1)
    // Note: pass [] (not null) for tags — the server action converts [] → null, but null → [null] which breaks the SQL HAVING clause
    const [initialProblems, initialProblemIds, initialSheet] = await Promise.all([
        getCompanyWiseProblems("all", "", slug, "frequency", [], null, 1, ITEMS_PER_PAGE),
        getCompanyWiseProblemIds("all", "", slug, [], null),
        getSheetMetadata(slug),
    ]);

    return (
        <>
            <BreadcrumbJsonLd items={[
                { name: "Home", url: BASE_URL },
                { name: "Companies", url: `${BASE_URL}/companies` },
                { name: companyName, url: `${BASE_URL}/companies/${slug}` },
            ]} />
            <CompanyPage
                slug={slug}
                initialProblems={initialProblems}
                initialProblemIds={initialProblemIds}
                initialSheet={initialSheet}
            />
        </>
    );
}