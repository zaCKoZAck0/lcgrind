import { CompanySearch } from "~/components/search";
import { Star9 } from "~/components/ui/stars/s9";
import { AllCompanies } from "~/components/all-companies/all-companies";
import type { Metadata } from "next";
import { BASE_URL, COMPANIES } from "~/config/constants";

export const dynamic = "force-static";

export const metadata: Metadata = {
    title: "Company Wise LeetCode Questions | Top Tech Companies | LC Grind",
    description:
        "Browse LeetCode interview questions sorted by company. Access free practice problems for Google, Meta, Amazon, Microsoft, Netflix, and other top tech firms.",
    keywords: [
        "company wise leetcode questions",
        "leetcode by company",
        ...Object.keys(COMPANIES).map((company) => `${company} leetcode questions`),
        ...Object.keys(COMPANIES).map((company) => `${company} interview questions`),
        ...Object.keys(COMPANIES).map((company) => `${company} coding interview`),
        ...Object.keys(COMPANIES).map((company) => `${company} dsa questions`),
        ...Object.keys(COMPANIES).map((company) => `${company} interview preparation`),
        "faang interview questions",
        "tech company interview prep",
        "coding interview",
        "leetcode",
        "free leetcode premium",
    ],
    alternates: {
        canonical: `${BASE_URL}/companies`,
    },
    openGraph: {
        title: "Company Wise LeetCode Questions",
        description:
            "Find LeetCode problems asked by specific companies like Google, Meta, Amazon.",
        url: `${BASE_URL}/companies`,
        type: "website",
    },
    twitter: {
        card: "summary",
        title: "Company Wise LeetCode Questions | Top Tech Companies | LC Grind",
        description:
            "Find LeetCode problems asked by specific companies like Google, Meta, Amazon.",
    },
};

export default async function CompaniesPage() {
    return (
        <>
            <div className="p-6">
                <h1 className="md:text-5xl text-3xl p-6 font-bold relative">
                    <Star9 className="absolute size-10 top-0 left-0 text-main" />
                    <span>
                        All Companies
                    </span>
                    <Star9 className="absolute size-10 bottom-0 right-0 text-main" />
                </h1>
            </div>
            <CompanySearch />
            <AllCompanies />
        </>
    );
}
