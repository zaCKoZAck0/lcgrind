import { Star13 } from "~/components/ui/stars/s13";
import { getAllSheets } from "~/server/actions/sheets/getAllSheets";
import { BASE_URL } from "~/config/constants";
import { Metadata } from "next";
import { SheetsList } from "~/components/sheets/sheets-list";

export const dynamic = "force-static";

export const metadata: Metadata = {
    title: "Top DSA Sheets for Coding Interview Preparation",
    description:
        "Explore curated DSA sheets like Blind 75, NeetCode 150, Grind 75, and Striver SDE Sheet. Structure your LeetCode practice for FAANG coding interviews.",
    keywords: [
        "dsa sheets",
        "leetcode sheets",
        "data structures algorithms sheet",
        "interview preparation sheets",
        "coding practice sheets",
        "striver sde sheet",
        "blind 75",
        "neetcode 150",
        "leetcode problem list",
        "systematic coding practice",
        "faang preparation",
    ],
    alternates: {
        canonical: `${BASE_URL}/sheets`,
    },
    openGraph: {
        title: "Top DSA Sheets for Coding Interview Preparation | LC Grind",
        description:
            "Curated DSA sheets including Blind 75, NeetCode 150, Grind 75, and Striver SDE Sheet. Structured coding interview prep.",
        url: `${BASE_URL}/sheets`,
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Top DSA Sheets for Coding Interview Preparation | LC Grind",
        description:
            "Curated DSA sheets including Blind 75, NeetCode 150, Grind 75, and Striver SDE Sheet. Structured coding interview prep.",
    },
};

export default async function SheetsPage() {
    const sheets = await getAllSheets();
    return (
        <>
            <div className="pt-6 text-center">
                <h1 className="md:text-5xl text-3xl p-6 font-bold relative">
                    <Star13 className="absolute size-10 top-1/6 left-0 text-main" />
                    <span className="px-2">
                        Top DSA Sheets
                    </span>
                </h1>
            </div>
            <p className="text-center pb-6">Follow top structured coding paths created by experts, based on your preparation timeline or focus areas.</p>
            <SheetsList sheets={sheets} />
        </>
    );
}