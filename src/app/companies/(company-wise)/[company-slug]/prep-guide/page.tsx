import { Metadata } from "next";
import { ProblemRow } from "~/components/company/problem-row";
import { TagsPieChart } from "~/components/prep-guide/tags-pie-chart";
import { ALGORITHMS, BASE_URL, COMPANIES, DATA_STRUCTURES, DEFAULT_REVALIDATION } from "~/config/constants";
import { db } from "~/lib/db";
import { CompanyParams } from "~/types/company";
import { getCompanyNameFromSlug } from "~/utils/slug";

export const revalidate = DEFAULT_REVALIDATION;

type Props = {
    params: Promise<CompanyParams>;
};

export async function generateMetadata(
    { params }: Props,
): Promise<Metadata> {
    const { 'company-slug': companySlug } = await params;
    const companyName = getCompanyNameFromSlug(companySlug);

    if (!companyName) {
        return { title: 'Prep Guide Not Found' };
    }

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
        alternates: {
            canonical: pageUrl,
        },
        openGraph: {
            title: pageTitle,
            description: pageDescription,
            url: pageUrl,
            type: 'article', // Good type for a guide
        },
    };
}

export default async function PrepGuidePage({
    params,
}: {
    params: Promise<CompanyParams>;
}) {
    const { 'company-slug': slug } = await params;
    const [sheet, problems] = await Promise.all([
        db.sheet.findFirst({
            where: { slug }
        }),
        db.sheetProblem.findMany({
            where: { sheet: { slug } },
            include: {
                problem: {
                    include: { topicTags: { include: { topicTag: true } } }
                }
            }
        })
    ]);

    const dataStructures: Record<string, number> = {};
    const algorithms: Record<string, number> = {};

    problems.forEach(problem => {
        problem.problem.topicTags.forEach(tag => {
            const tagName = tag.topicTag.name;
            if (DATA_STRUCTURES.includes(tagName)) {
                dataStructures[tagName] = (dataStructures[tagName] || 0) + 1;
            }
            if (ALGORITHMS.includes(tagName)) {
                algorithms[tagName] = (algorithms[tagName] || 0) + 1;
            }
        });
    });

    const favoriteProblems = problems.filter(problem => (problem.sheetOrder.toNumber() > 0 && problem.sixMonthsOrder.toNumber() > 0 && problem.yearlyOrder.toNumber() > 0 && problem.threeMonthsOrder.toNumber() > 0 && problem.thirtyDaysOrder.toNumber() > 0)).sort((a, b) => b.sheetOrder.toNumber() - a.sheetOrder.toNumber());


    return (
        <div className="w-full max-w-[1000px] py-6">
            <div className="w-full flex items-center gap-2 justify-center p-3 border-2 border-border bg-card">
                <img
                    src={`https://img.logo.dev/${COMPANIES[sheet.name.trim()] ?? `${sheet.slug}.com`}?token=pk_Ovv0aVUwQNK80p_PGY_xcg`}
                    alt={`${sheet.name} logo`}
                    className="size-8 rounded-md"
                />
                <h1 className="text-2xl font-medium text-center">{sheet.name} Interview Prep Guide</h1>
            </div>
            <div className="p-6 border-2 border-border mb-6 bg-card flex flex-col gap-6 mt-6">
                <h2 className="text-xl font-medium"> Most-Frequent {sheet.name} Interview Topics</h2>
                <TagsPieChart dataStructures={dataStructures} algorithms={algorithms} totalProblemsCount={problems.length} />
            </div>
            <div className="p-6 border-2 border-border mb-6 bg-card flex flex-col gap-6 mt-6">
                <h2 className="text-xl font-medium">{sheet.name}&apos;s Go-To Interview Problems</h2>
                <div className="border-t-2 border-border shadow-shadow">
                    {favoriteProblems.map((problem, idx) => (
                        <ProblemRow
                            key={problem.problemId}
                            index={idx}
                            order={"all"}
                            problemUrl={problem.problem.url}
                            problemTitle={problem.problem.title}
                            problemId={problem.problemId.toString()}
                            frequency={problem.sheetOrder.toNumber()}
                            difficulty={problem.problem.difficulty}
                            acceptance={problem.problem.acceptance}
                            isPaid={problem.problem.isPaid}
                            tags={problem.problem.topicTags.map(tag => tag.topicTag.name)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}