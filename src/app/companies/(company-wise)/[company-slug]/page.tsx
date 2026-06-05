import { type CompanyParams } from "~/types/company";
import { CompanyPage } from "~/components/company/company-page";
import type { Metadata } from "next";
import { BASE_URL } from "~/config/constants";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "~/components/seo/json-ld";
import { getCompanyPageData, getCompanySlugs } from "~/lib/build-cache";

type Props = {
    params: Promise<CompanyParams>;
};

export const revalidate = 86400;
export const dynamicParams = true;

// Pre-render all company pages at build time.
// During `next build` this reads .build-cache/company-slugs.json (no DB hit).
// At runtime it falls back to a direct DB query.
export async function generateStaticParams() {
    const slugs = await getCompanySlugs();
    return slugs.map((slug) => ({ "company-slug": slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { "company-slug": companySlug } = await params;
    // getCompanyPageData is memoised with React cache() — the component below
    // reuses this result without a second DB/file-system round-trip.
    const data = await getCompanyPageData(companySlug);

    if (!data) {
        return { title: "Company Not Found" };
    }

    const companyName = data.name;
    const currentYear = new Date().getFullYear();
    const shortTitle = `${companyName} LeetCode Interview Questions [${currentYear}]`;
    const pageTitle =
        shortTitle.length > 60
            ? `${companyName} Interview Questions [${currentYear}]`
            : shortTitle;
    const pageDescription = `Practice ${companyName} LeetCode problems for free. Get the latest ${companyName} interview questions and prepare for your coding interview.`;
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
        keywords,
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
    };
}

export default async function CompanyWiseQuestion({
    params,
}: {
    params: Promise<CompanyParams>;
}) {
    const { "company-slug": slug } = await params;
    // Reuses the memoised result from generateMetadata — no extra DB/file hit.
    const data = await getCompanyPageData(slug);

    if (!data) {
        notFound();
    }

    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: BASE_URL },
                    { name: "Companies", url: `${BASE_URL}/companies` },
                    { name: data.name, url: `${BASE_URL}/companies/${slug}` },
                ]}
            />
            <CompanyPage
                slug={slug}
                initialProblems={data.initialProblems}
                initialProblemIds={data.initialProblemIds}
                initialSheet={data.initialSheet}
            />
        </>
    );
}
