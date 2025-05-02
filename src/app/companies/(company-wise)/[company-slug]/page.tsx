import { type CompanyParams } from "~/types/company";
import { CompanyPage } from "~/components/company/company-page";
import type { Metadata } from "next";
import { BASE_URL } from "~/config/constants";
import { getCompanyNameFromSlug } from "~/utils/slug";

type Props = {
    params: Promise<CompanyParams>;
};

export async function generateMetadata(
    { params }: Props,
): Promise<Metadata> {
    const { 'company-slug': companySlug } = await params;
    const companyName = getCompanyNameFromSlug(companySlug);

    if (!companyName) {
        return {
            title: "Company Not Found",
        };
    }

    const currentYear = new Date().getFullYear();
    const pageTitle = `${companyName} LeetCode Questions | ${companyName} Interview Questions & Solutions [${currentYear}]`;
    const pageDescription = `Practice ${companyName} company-wise LeetCode problems for free. Get the latest ${companyName} interview questions, DSA sheets, and premium problems without a subscription. Prepare for your ${companyName} coding interview.`;
    const pageUrl = `${BASE_URL}/companies/${companySlug}`;

    const keywords = [
        `leetcode company wise problems ${companyName}`,
        `${companyName} leetcode questions`,
        `${companyName} interview questions`,
        `${companyName} coding questions`,
        `${companyName} dsa questions`,
        `faang leetcode problems ${companyName}`,
        `maang leetcode problems ${companyName}`,
        `prepare for ${companyName} coding interview`,
        `top leetcode questions for ${companyName}`,
        `leetcode premium free ${companyName}`,
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

    return <CompanyPage slug={slug} />;
}