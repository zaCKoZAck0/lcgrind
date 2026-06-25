import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CANONICAL_URL } from "~/config/constants";
import { getQuestionsByType } from "~/server/actions/problems/getQuestionsByType";
import { TypeProblemsPage } from "~/components/problems/type-problems-page";
import { FEATURE_FLAGS } from "~/config/feature-flags";

export const revalidate = 86400;

type Params = { type: string };

const VALID_TYPES = new Set([
    ...(FEATURE_FLAGS.SYSTEM_DESIGN ? ["system-design"] : []),
    ...(FEATURE_FLAGS.LLD ? ["lld"] : []),
    ...(FEATURE_FLAGS.OTHERS ? ["others"] : []),
]);

const META: Record<
    string,
    { title: string; description: string; keywords: string[] }
> = {
    ...(FEATURE_FLAGS.SYSTEM_DESIGN ? {
        "system-design": {
            title: "System Design Interview Questions | LC Grind",
            description:
                "Browse all system design interview questions asked across top tech companies. Includes distributed systems, scalability, and architecture questions.",
            keywords: [
                "system design interview questions",
                "distributed systems interview",
                "scalability interview",
                "architecture interview questions",
                "system design practice",
                "coding interview system design",
            ],
        },
    } : {}),
    lld: {
        title: "Low Level Design (LLD) Interview Questions | LC Grind",
        description:
            "Browse all low level design and machine coding interview questions asked across top tech companies. OOP, design patterns, and more.",
        keywords: [
            "low level design interview questions",
            "machine coding interview",
            "LLD interview questions",
            "OOP design interview",
            "design patterns interview",
        ],
    },
    others: {
        title: "Behavioral & HR Interview Questions | LC Grind",
        description:
            "Browse all behavioral, HR, and other interview questions asked across top tech companies. Includes leadership principles, culture fit, and more.",
        keywords: [
            "behavioral interview questions",
            "HR interview questions",
            "leadership interview questions",
            "culture fit interview",
            "amazon leadership principles",
            "coding interview behavioral",
        ],
    },
};

export function generateStaticParams(): { type: string }[] {
    const params: { type: string }[] = [];
    if (FEATURE_FLAGS.SYSTEM_DESIGN) params.push({ type: "system-design" });
    if (FEATURE_FLAGS.LLD) params.push({ type: "lld" });
    if (FEATURE_FLAGS.OTHERS) params.push({ type: "others" });
    return params;
}

export async function generateMetadata({
    params,
}: {
    params: Promise<Params>;
}): Promise<Metadata> {
    const { type } = await params;
    const meta = META[type];
    if (!meta) return {};
    return {
        title: meta.title,
        description: meta.description,
        keywords: meta.keywords,
        alternates: {
            canonical: `${CANONICAL_URL}/problems/${type}`,
        },
        openGraph: {
            title: meta.title,
            description: meta.description,
            url: `${CANONICAL_URL}/problems/${type}`,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: meta.title,
            description: meta.description,
        },
    };
}

export default async function TypePage({
    params,
}: {
    params: Promise<Params>;
}) {
    const { type } = await params;

    if (!VALID_TYPES.has(type)) notFound();

    const initial = await getQuestionsByType(type, "", "most-asked", 1, 100);
    if (initial === null) notFound();

    return (
        <TypeProblemsPage
            slugType={type}
            initial={initial}
        />
    );
}
