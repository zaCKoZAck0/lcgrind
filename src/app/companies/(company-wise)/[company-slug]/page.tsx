import { ArrowLeft, ChartLineIcon } from "lucide-react";
import Link from 'next/link';
import { Filters } from "~/components/company/filter";
import { buttonVariants } from "~/components/ui/button";
import { db } from "~/lib/db";
import { COMPANY_LOGO_API, DEFAULT_REVALIDATION } from "~/config/constants";
import { type SearchParams, type CompanyParams } from "~/types/company";
import { ProblemRow } from "~/components/company/problem-row";
import { getDbOrderByClause, getDbWhereClause, getOrderKey } from "~/utils/sorting";
import { ProgressTracker } from "~/components/company/progress-tracker";
import { ProblemWithStats } from "~/types/problem";

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
    const { sort = 'frequency', order = 'all' } = p;
    if (!Array.isArray(tags) && tags != null) tags = [tags];
    const orderKey = getOrderKey(order);
    const orderClause = getDbOrderByClause(order, sort, true);
    const whereClause = getDbWhereClause(order, '', slug);

    const query2 = `
        SELECT
            name
        FROM "Sheet"
        WHERE slug = '${slug}'
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

    const [logoResponse, problems, sheet] = await Promise.all([
        fetch(`${COMPANY_LOGO_API}?q=${slug}.com`, {
            next: { revalidate: DEFAULT_REVALIDATION }
        }).then(res => res.json().then(data => data[0])),
        db.$queryRawUnsafe<ProblemWithStats[]>(
            query,
            tags
        ),
        db.$queryRawUnsafe<Array<{ name: string }>>(
            query2
        )
    ]);

    return (
        <div className="w-full max-w-[1000px] py-6">
            <div className="p-3 border border-b-0 border-muted-foreground/50 bg-card flex justify-between items-center">
                <Link
                    className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                    href='/companies'
                >
                    <ArrowLeft />All Companies
                </Link>
                <div>
                    <Link
                        href={`/companies/${slug}/prep-guide`}
                        className={buttonVariants({ variant: 'outline', size: 'sm' })}
                    >
                        <ChartLineIcon />
                        Prep Guide
                    </Link>
                </div>
            </div>

            <div className="mb-6">
                <div className='p-6 border border-muted-foreground/50 bg-card flex justify-between items-center'>
                    <div className="w-fit h-fit">
                        <div className="flex gap-6 min-w-[360px]">
                            <img
                                src={logoResponse?.logo_url || '/default-company.png'}
                                alt={`${sheet[0].name} logo`}
                                className="size-14 rounded-md"
                            />
                            <div className="flex flex-col justify-between">
                                <h1 className="font-semibold text-2xl">{sheet[0].name}</h1>
                                <p className="text-muted-foreground/50 text-lg">
                                    {problems.length} Problems
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <ProgressTracker problemIds={problems.map(problem => problem.id.toString())} />
            </div>

            <Filters filters={{ sorting: sort, order }} />

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
    );
}
