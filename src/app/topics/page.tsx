import type { Metadata } from "next";
import Link from "next/link";
import { BASE_URL, ALGORITHMS, DATA_STRUCTURES } from "~/config/constants";
import { BreadcrumbJsonLd } from "~/components/seo/json-ld";
import { getAllTopics, TopicWithCount } from "~/server/actions/topics/getAllTopics";
import { Badge } from "~/components/ui/badge";

export const revalidate = 86400;

const pageTitle = "LeetCode Problems by Topic — DSA Interview Prep";
const pageDescription =
    "Browse LeetCode problems organized by data structure and algorithm topic. Practice dynamic programming, graphs, trees, and more to prepare for coding interviews.";

export const metadata: Metadata = {
    title: pageTitle,
    description: pageDescription,
    keywords: [
        "leetcode problems by topic",
        "leetcode patterns",
        "data structures and algorithms",
        "dynamic programming problems",
        "coding interview topics",
        "leetcode study plan",
        "algorithm practice",
    ],
    alternates: {
        canonical: `${BASE_URL}/topics`,
    },
    openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: `${BASE_URL}/topics`,
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: pageDescription,
    },
};

function groupTopics(topics: TopicWithCount[]) {
    const dsSet = new Set(DATA_STRUCTURES);
    const algoSet = new Set(ALGORITHMS);

    const dataStructures: TopicWithCount[] = [];
    const algorithms: TopicWithCount[] = [];
    const other: TopicWithCount[] = [];

    for (const topic of topics) {
        if (dsSet.has(topic.name)) {
            dataStructures.push(topic);
        } else if (algoSet.has(topic.name)) {
            algorithms.push(topic);
        } else {
            other.push(topic);
        }
    }

    // Sort each group by problem count (descending)
    const byCount = (a: TopicWithCount, b: TopicWithCount) =>
        b.problemCount - a.problemCount;
    dataStructures.sort(byCount);
    algorithms.sort(byCount);
    other.sort(byCount);

    return { dataStructures, algorithms, other };
}

function TopicCard({ topic }: { topic: TopicWithCount }) {
    return (
        <Link
            href={`/topics/${topic.slug}`}
            className="flex items-center justify-between p-4 border-2 border-border bg-card hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none shadow-shadow transition-all"
        >
            <span className="font-semibold text-base">{topic.name}</span>
            <Badge variant="neutral">{topic.problemCount}</Badge>
        </Link>
    );
}

function TopicSection({
    title,
    description,
    topics,
}: {
    title: string;
    description: string;
    topics: TopicWithCount[];
}) {
    if (topics.length === 0) return null;
    return (
        <section className="mb-12">
            <h2 className="text-xl font-bold mb-1">{title}</h2>
            <p className="text-muted-foreground mb-4 text-sm">{description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {topics.map((topic) => (
                    <TopicCard key={topic.slug} topic={topic} />
                ))}
            </div>
        </section>
    );
}

export default async function TopicsPage() {
    const allTopics = await getAllTopics();
    const { dataStructures, algorithms, other } = groupTopics(allTopics);
    const totalProblems = allTopics.reduce((sum, t) => sum + t.problemCount, 0);

    // Build ItemList JSON-LD for structured data
    const itemListJsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "LeetCode Problems by Topic",
        description: pageDescription,
        numberOfItems: allTopics.length,
        itemListElement: allTopics.map((topic, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: topic.name,
            url: `${BASE_URL}/topics/${topic.slug}`,
        })),
    };

    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: BASE_URL },
                    { name: "Topics", url: `${BASE_URL}/topics` },
                ]}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(itemListJsonLd),
                }}
            />

            <div className="w-full max-w-[1000px] py-6">
                <div className="mb-12 shadow-shadow">
                    <div className="p-6 border-2 border-border bg-card bg-main text-main-foreground">
                        <h1 className="text-2xl font-bold">
                            LeetCode Problems by Topic
                        </h1>
                        <p className="text-main-foreground/70 mt-1">
                            {allTopics.length} topics covering {totalProblems.toLocaleString()} problem-topic
                            mappings
                        </p>
                    </div>
                </div>

                <TopicSection
                    title="Data Structures"
                    description="Master essential data structures asked in coding interviews."
                    topics={dataStructures}
                />
                <TopicSection
                    title="Algorithms"
                    description="Practice algorithmic patterns commonly tested at top tech companies."
                    topics={algorithms}
                />
                <TopicSection
                    title="Other Topics"
                    description="Additional problem categories and specialized topics."
                    topics={other}
                />
            </div>
        </>
    );
}
