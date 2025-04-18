import { ArrowLeft, ChartLineIcon } from "lucide-react";
import Link from 'next/link';
import { Filters } from "~/components/company/filter";
import { buttonVariants } from "~/components/ui/button";
import { db } from "~/lib/db";
import { COMPANIES } from "~/config/constants";
import { type SearchParams, type CompanyParams } from "~/types/company";
import { ProblemRow } from "~/components/company/problem-row";
import { getDbOrderByClause, getDbWhereClause, getOrderKey } from "~/utils/sorting";
import { ProgressTracker } from "~/components/company/progress-tracker";
import { ProblemWithStats } from "~/types/problem";
import { notFound } from "next/navigation";

export default async function CompanyWiseQuestion({
    params,
    searchParams
}: {
    params: Promise<CompanyParams>;
    searchParams: Promise<SearchParams>;
}) {
    const { 'company-slug': slug } = await params;
    const p = await searchParams;
    let { tags = null } = p;
    const { sort = 'frequency', order = 'all', search = '' } = p;
    if (!Array.isArray(tags) && tags != null) tags = [tags];
    const orderKey = getOrderKey(order);
    const orderClause = getDbOrderByClause(order, sort, true);
    const whereClause = getDbWhereClause(order, search, slug);

    const query2 = `
        SELECT s.name, s.slug, COUNT(sp."problemId") AS "numOfProblems"
        FROM "Sheet" s
        LEFT JOIN "SheetProblem" sp ON s.id = sp."sheetId"
        WHERE s.slug = '${slug}'
        GROUP BY s.name, s.slug
    `;

    const query = `
        SELECT
            p.*,
            AVG(s."${orderKey}") AS "order",
            array_agg(DISTINCT t."name") AS tags,
            MAX(sh.name) AS "company"
        FROM "Problem" p
        LEFT JOIN "SheetProblem" s ON p.id = s."problemId"
        LEFT JOIN "Sheet" sh ON s."sheetId" = sh.id
        LEFT JOIN "ProblemsOnTopicTags" pt ON p.id = pt."problemId"
        LEFT JOIN "TopicTag" t ON pt."topicTagId" = t.id
        ${whereClause}
        GROUP BY p.id
        HAVING (
    ($1::text[] IS NULL OR
      COUNT(CASE WHEN t."name" = ANY($1::text[]) THEN 1 END) > 0)
  )
        ORDER BY ${orderClause}
`;

    const [problems, sheet] = await Promise.all([
        db.$queryRawUnsafe<ProblemWithStats[]>(
            query,
            tags
        ),
        db.$queryRawUnsafe<Array<{ name: string, slug: string, numOfProblems: number }>>(
            query2
        )
    ]);

    if (!sheet || sheet.length === 0) return notFound();

    return (
        <div className="w-full max-w-[1000px] py-6">
            <div className="mb-12 shadow-shadow">
                <div className='p-3 border-2 border-border bg-card flex justify-between items-center bg-main text-main-foreground'>
                    <Link
                        className={buttonVariants({ variant: 'neutral', size: 'sm' })}
                        href='/companies'
                    >
                        <ArrowLeft />All Companies
                    </Link>
                    <div>
                        <Link
                            href={`/companies/${slug}/prep-guide`}
                            className={buttonVariants({ variant: 'neutral', size: 'sm' })}
                        >
                            <ChartLineIcon />
                            Prep Guide
                        </Link>
                    </div>
                </div>

                <div>
                    <div className='p-6 border-2 border-t-0 border-border bg-card flex justify-between items-center'>
                        <div className="w-fit h-fit">
                            <div className="flex gap-6 min-w-[360px]">
                                <img
                                    src={`https://img.logo.dev/${COMPANIES[sheet[0].name.trim()] ?? `${sheet[0].slug}.com`}?token=pk_Ovv0aVUwQNK80p_PGY_xcg`}
                                    alt={`${sheet[0].name} logo`}
                                    className="size-14 rounded-md"
                                />
                                <div className="flex flex-col justify-between">
                                    <h1 className="font-semibold text-2xl">{sheet[0].name}</h1>
                                    <p className="text-muted-foreground/50 text-lg">
                                        {sheet[0].numOfProblems} Problems
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <ProgressTracker problemIds={problems.map(problem => problem.id.toString())} />
                </div>
            </div>

            <div className='shadow-shadow'>
                <Filters filters={{ sorting: sort, order, search }} />

                {problems.map((problem, idx) => (
                    <ProblemRow
                        key={problem.id}
                        index={idx}
                        order={order}
                        problemUrl={problem.url}
                        problemTitle={problem.title}
                        problemId={problem.id.toString()}
                        frequency={problem.order?.toNumber()}
                        difficulty={problem.difficulty}
                        acceptance={problem.acceptance}
                        isPaid={problem.isPaid}
                        tags={problem.tags}
                    />
                ))}
            </div>
        </div>
    );
}
