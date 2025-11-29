import { ProblemsPage } from "~/components/all-problems/problems-page";
import { Metadata } from "next";
import { BASE_URL } from "~/config/constants";

export const dynamic = "force-static";

export const metadata: Metadata = {
    title: "All LeetCode Problems | Free Practice Questions",
    description:
        "Browse and practice all LeetCode problems for free. Filter by difficulty, topic, and company. Includes premium problems with detailed solutions for coding interview preparation.",
    keywords: [
        "leetcode problems",
        "all leetcode questions",
        "leetcode problem list",
        "coding practice questions",
        "leetcode free problems",
        "leetcode premium free",
        "dsa problems",
        "coding interview questions",
        "algorithm problems",
        "data structure problems",
    ],
    alternates: {
        canonical: `${BASE_URL}/all-problems`,
    },
    openGraph: {
        title: "All LeetCode Problems | Free Practice Questions | LC Grind",
        description:
            "Browse and practice all LeetCode problems for free. Filter by difficulty, topic, and company.",
        url: `${BASE_URL}/all-problems`,
        type: "website",
    },
    twitter: {
        card: "summary",
        title: "All LeetCode Problems | Free Practice Questions | LC Grind",
        description:
            "Browse and practice all LeetCode problems for free. Filter by difficulty, topic, and company.",
    },
};

export default async function AllProblemsPage() {
    return <ProblemsPage />
}