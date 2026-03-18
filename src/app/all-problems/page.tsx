import { ProblemsPage } from "~/components/all-problems/problems-page";
import { Metadata } from "next";
import { BASE_URL } from "~/config/constants";
import { getProblems } from "~/server/actions/problems/getProblems";
import { getProblemIds } from "~/server/actions/problems/getProblemIds";

const ITEMS_PER_PAGE = 100;

export const revalidate = 86400; // Revalidate every 24 hours

export const metadata: Metadata = {
    title: "All LeetCode Problems | Free Practice Questions",
    description:
        "Browse and practice all LeetCode problems for free. Filter by difficulty, topic, and company. Includes premium problems for coding interview prep.",
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
        card: "summary_large_image",
        title: "All LeetCode Problems | Free Practice Questions | LC Grind",
        description:
            "Browse and practice all LeetCode problems for free. Filter by difficulty, topic, and company.",
    },
};

export default async function AllProblemsPage() {
    // Server-fetch initial data for SSR (default params: all problems, sorted by question-id, page 1)
    const [initialProblems, initialProblemIds] = await Promise.all([
        getProblems("all-problems", "", "question-id", null, null, null, 1, ITEMS_PER_PAGE),
        getProblemIds("all-problems", "", null, null, null),
    ]);

    return <ProblemsPage initialProblems={initialProblems} initialProblemIds={initialProblemIds} />
}