import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BASE_URL } from "~/config/constants";
import { BreadcrumbJsonLd } from "~/components/seo/json-ld";
import { TopicPage } from "~/components/topics/topic-page";
import { getTopicProblems } from "~/server/actions/topics/getTopicProblems";
import { getTopicProblemIds } from "~/server/actions/topics/getTopicProblemIds";
import { db } from "~/lib/db";

type Props = {
    params: Promise<{ "topic-slug": string }>;
};

const ITEMS_PER_PAGE = 100;

export const revalidate = 86400;
export const dynamicParams = true;

export async function generateStaticParams() {
    const topics = await db.topicTag.findMany({
        select: { slug: true },
    });

    return topics.map((topic) => ({
        "topic-slug": topic.slug,
    }));
}

async function getTopicBySlug(slug: string) {
    return db.topicTag.findUnique({
        where: { slug },
        select: {
            name: true,
            slug: true,
            _count: { select: { problems: true } },
        },
    });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { "topic-slug": topicSlug } = await params;
    const topic = await getTopicBySlug(topicSlug);

    if (!topic) {
        return { title: "Topic Not Found" };
    }

    const topicName = topic.name;
    const problemCount = topic._count.problems;
    const currentYear = new Date().getFullYear();

    const shortTitle = `${topicName} LeetCode Problems [${currentYear}]`;
    const pageTitle =
        shortTitle.length > 60
            ? `${topicName} Problems [${currentYear}]`
            : shortTitle;
    const pageDescription = `Practice ${problemCount} ${topicName} problems on LeetCode. Master ${topicName.toLowerCase()} patterns and ace your coding interview.`;
    const pageUrl = `${BASE_URL}/topics/${topicSlug}`;

    const keywords = [
        `${topicName.toLowerCase()} leetcode`,
        `${topicName.toLowerCase()} problems`,
        `${topicName.toLowerCase()} interview questions`,
        `${topicName.toLowerCase()} coding problems`,
        `practice ${topicName.toLowerCase()}`,
        "leetcode",
        "coding interview",
        "data structures and algorithms",
    ];

    return {
        title: pageTitle,
        description: pageDescription,
        keywords,
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

export default async function TopicProblemsPage({ params }: Props) {
    const { "topic-slug": topicSlug } = await params;
    const topic = await getTopicBySlug(topicSlug);

    if (!topic) {
        notFound();
    }

    const topicName = topic.name;
    const problemCount = topic._count.problems;

    // Server-fetch initial data (default: no search, sorted by question-id, page 1)
    const [initialProblems, initialProblemIds] = await Promise.all([
        getTopicProblems(topicSlug, "", "question-id", null, 1, ITEMS_PER_PAGE),
        getTopicProblemIds(topicSlug, "", null),
    ]);

    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: BASE_URL },
                    { name: "Topics", url: `${BASE_URL}/topics` },
                    { name: topicName, url: `${BASE_URL}/topics/${topicSlug}` },
                ]}
            />
            <TopicPage
                topicSlug={topicSlug}
                topicName={topicName}
                problemCount={problemCount}
                initialProblems={initialProblems}
                initialProblemIds={initialProblemIds}
            />
        </>
    );
}
