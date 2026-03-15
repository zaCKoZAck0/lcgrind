import { CompanySearch } from "~/components/search";
import { Star9 } from "~/components/ui/stars/s9";
import { AllCompanies } from "~/components/all-companies/all-companies";
import type { Metadata } from "next";
import { BASE_URL } from "~/config/constants";
import { getCompanies } from "~/server/actions/companies/getCompanies";

const ITEMS_PER_PAGE = 24;

export const revalidate = 86400; // Revalidate every 24 hours

export const metadata: Metadata = {
    title: "Company Wise LeetCode Questions | Top Tech Companies",
    description:
        "Browse LeetCode interview questions sorted by company. Access free practice problems for Google, Meta, Amazon, Microsoft, Netflix, and 700+ other top tech firms.",
    keywords: [
        "company wise leetcode questions",
        "leetcode by company",
        "faang interview questions",
        "maang interview prep",
        "google leetcode questions",
        "meta interview questions",
        "amazon coding interview",
        "microsoft interview preparation",
        "tech company interview prep",
        "coding interview questions by company",
        "leetcode company problems",
        "free leetcode premium",
    ],
    alternates: {
        canonical: `${BASE_URL}/companies`,
    },
    openGraph: {
        title: "Company Wise LeetCode Questions | 700+ Companies",
        description:
            "Browse LeetCode problems asked by 700+ companies including Google, Meta, Amazon, Microsoft, and more.",
        url: `${BASE_URL}/companies`,
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Company Wise LeetCode Questions | 700+ Companies | LC Grind",
        description:
            "Browse LeetCode problems asked by 700+ companies including Google, Meta, Amazon, Microsoft, and more.",
    },
};

export default async function CompaniesPage() {
    const initialData = await getCompanies("", 0, ITEMS_PER_PAGE);

    return (
        <>
            <div className="p-6">
                <h1 className="md:text-5xl text-3xl p-6 font-bold relative">
                    <Star9 className="absolute size-10 top-0 left-0 text-main" />
                    <span>
                        Company Wise LeetCode Questions
                    </span>
                    <Star9 className="absolute size-10 bottom-0 right-0 text-main" />
                </h1>
            </div>
            <CompanySearch />
            <AllCompanies initialData={initialData} />
        </>
    );
}
