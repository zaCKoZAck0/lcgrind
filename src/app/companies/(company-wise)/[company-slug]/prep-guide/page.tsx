import { Metadata } from "next";
import { ProblemRow } from "~/components/company/problem-row";
import { CompanyLogo } from "~/components/company-logo";
import { TagsPieChart } from "~/components/prep-guide/tags-pie-chart";
import { ALGORITHMS, BASE_URL, COMPANIES, DATA_STRUCTURES } from "~/config/constants";
import { CompanyParams } from "~/types/company";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "~/components/seo/json-ld";
import { getPrepGuideData } from "~/lib/build-cache";

export const revalidate = 86400;

type Props = {
    params: Promise<CompanyParams>;
};

// Compatibility helper: Decimal fields from a live DB query have .toNumber(),
// while cached data stores them as plain JS numbers.  This handles both.
const toNum = (x: number | { toNumber(): number }): number =>
    typeof x === "number" ? x : x.toNumber();

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { "company-slug": companySlug } = await params;
    // getPrepGuideData is memoised with React cache() — the component below
    // reuses this result without a second DB/file-system round-trip.
    const data = await getPrepGuideData(companySlug);

    if (!data?.sheet) {
        return { title: "Prep Guide Not Found" };
    }

    const companyName = data.sheet.name as string;
    const pageTitle = `${companyName} Interview Prep Guide | LC Grind`;
    const pageDescription = `Comprehensive guide to prepare for ${companyName} coding interviews. Tips, resources, strategies, and key LeetCode problems.`;
    const pageUrl = `${BASE_URL}/companies/${companySlug}/prep-guide`;

    return {
        title: pageTitle,
        description: pageDescription,
        keywords: [
            `${companyName} interview preparation`,
            `${companyName} coding interview guide`,
            `how to prepare for ${companyName} interview`,
            `${companyName} interview tips`,
            `leetcode ${companyName}`,
            companyName,
        ],
        alternates: { canonical: pageUrl },
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

export default async function PrepGuidePage({
    params,
}: {
    params: Promise<CompanyParams>;
}) {
    const { "company-slug": slug } = await params;
    // Reuses the memoised result from generateMetadata — no extra DB/file hit.
    const data = await getPrepGuideData(slug);

    if (!data?.sheet) {
        notFound();
    }

    const { sheet, problems } = data;
    const companyName = sheet.name as string;

    const dataStructures: Record<string, number> = {};
    const algorithms: Record<string, number> = {};

    problems.forEach((problem: any) => {
        problem.problem.topicTags.forEach((tag: any) => {
            const tagName = tag.topicTag.name;
            if (DATA_STRUCTURES.includes(tagName)) {
                dataStructures[tagName] = (dataStructures[tagName] || 0) + 1;
            }
            if (ALGORITHMS.includes(tagName)) {
                algorithms[tagName] = (algorithms[tagName] || 0) + 1;
            }
        });
    });

    // toNum() handles both Prisma Decimal (live DB path) and plain number (cache path)
    const favoriteProblems = (problems as any[])
        .filter(
            (problem) =>
                toNum(problem.sheetOrder) > 0 &&
                toNum(problem.sixMonthsOrder) > 0 &&
                toNum(problem.yearlyOrder) > 0 &&
                toNum(problem.threeMonthsOrder) > 0 &&
                toNum(problem.thirtyDaysOrder) > 0
        )
        .sort((a, b) => toNum(b.sheetOrder) - toNum(a.sheetOrder));

    const logoDomain = COMPANIES[sheet.name.trim()] ?? `${sheet.slug}.com`;

    return (
        <div className="w-full max-w-[1000px] py-6">
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: BASE_URL },
                    { name: "Companies", url: `${BASE_URL}/companies` },
                    { name: companyName, url: `${BASE_URL}/companies/${slug}` },
                    { name: "Prep Guide", url: `${BASE_URL}/companies/${slug}/prep-guide` },
                ]}
            />
            <div className="w-full bg-card flex items-center gap-2 justify-center p-3 border-2 border-border bg-card">
                <CompanyLogo
                    domain={logoDomain}
                    alt={`${sheet.name} logo`}
                    className="size-8 rounded-md"
                    width={32}
                    height={32}
                    priority={true}
                />
                <h1 className="text-2xl font-medium text-center">
                    {sheet.name} Interview Prep Guide
                </h1>
            </div>
            <div className="p-6 border-2 border-border mb-6 bg-card flex flex-col gap-6 mt-6">
                <h2 className="text-xl font-medium">
                    Most-Frequent {sheet.name} Interview Topics
                </h2>
                <TagsPieChart
                    dataStructures={dataStructures}
                    algorithms={algorithms}
                    totalProblemsCount={problems.length}
                />
            </div>
            {favoriteProblems.length > 0 && (
                <div className="p-6 border-2 border-border mb-6 bg-card flex flex-col gap-6 mt-6">
                    <h2 className="text-xl font-medium">
                        {sheet.name}&apos;s Go-To Interview Problems
                    </h2>
                    <div className="border-t-2 border-border shadow-shadow">
                        {favoriteProblems.map((problem: any, idx: number) => (
                            <ProblemRow
                                key={problem.problemId}
                                index={idx}
                                order={"all"}
                                problemUrl={problem.problem.url}
                                problemTitle={problem.problem.title}
                                problemId={problem.problemId.toString()}
                                frequency={toNum(problem.sheetOrder)}
                                difficulty={problem.problem.difficulty}
                                acceptance={problem.problem.acceptance}
                                isPaid={problem.problem.isPaid}
                                tags={problem.problem.topicTags.map(
                                    (tag: any) => tag.topicTag.name
                                )}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
