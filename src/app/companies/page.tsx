import { CompanySearch } from "~/components/search";
import { Star9 } from "~/components/ui/stars/s9";
import { AllCompanies } from "~/components/all-companies/all-companies";
import type { Metadata } from "next";
import { BASE_URL } from "~/config/constants";
import { getCompanies } from "~/server/actions/companies/getCompanies";

const ITEMS_PER_PAGE = 24;

export const revalidate = 86400; // Revalidate every 24 hours

export const metadata: Metadata = {
    title: "Company Interview Questions & Compensation | Top Tech Companies",
    description:
        "Real interview experiences by company: rounds, coding questions, system design, and compensation insights for Google, Meta, Amazon, Microsoft, and 1000+ other tech firms.",
    keywords: [
        "company interview questions",
        "interview experience by company",
        "faang interview questions",
        "maang interview prep",
        "google interview questions",
        "meta interview questions",
        "amazon coding interview",
        "microsoft interview preparation",
        "tech company interview prep",
        "software engineer compensation",
        "coding interview questions by company",
    ],
    alternates: {
        canonical: `${BASE_URL}/companies`,
    },
    openGraph: {
        title: "Company Interview Questions & Compensation | 1000+ Companies",
        description:
            "Real interview rounds, questions, and compensation insights for 1000+ companies including Google, Meta, Amazon, and Microsoft.",
        url: `${BASE_URL}/companies`,
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Company Interview Questions & Compensation | LC Grind",
        description:
            "Real interview rounds, questions, and compensation insights for 1000+ companies including Google, Meta, Amazon, and Microsoft.",
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
                        Company Interviews and Compensation
                    </span>
                    <Star9 className="absolute size-10 bottom-0 right-0 text-main" />
                </h1>
            </div>
            <CompanySearch />
            <AllCompanies initialData={initialData} />
        </>
    );
}
