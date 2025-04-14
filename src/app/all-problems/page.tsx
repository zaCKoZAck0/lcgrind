import { Filters } from "~/components/company/filter";
import { ProblemRow } from "~/components/company/problem-row";
import { ProgressTracker } from "~/components/company/progress-tracker";
import { GlobalPagination } from "~/components/global-pagination";
import { db } from "~/lib/db";
import { ProblemWithStats, SearchParams } from "~/types/problem";
import { getDbOrderByClause, getDbWhereClause, getOrderKey } from "~/utils/sorting";

const ITEMS_PER_PAGE = 100;

export default async function AllProblemsPage({
    searchParams
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    let { companies = null, tags = null } = params;
    const { sort = 'question-id', order = 'all-problems', search = '', page = 1 } = params;
    const orderKey = getOrderKey(order);
    if (!Array.isArray(companies) && companies != null) companies = [companies];
    if (!Array.isArray(tags) && tags != null) tags = [tags];
    const offset = (Number(page) - 1) * ITEMS_PER_PAGE;
    const orderClause = getDbOrderByClause(order, sort);
    const whereClause = getDbWhereClause(order, search, '');
    const query = `
        SELECT
            p.*,
            AVG(s."${orderKey}") AS "order",
            array_agg(DISTINCT sh.name) AS "companies",
            array_agg(DISTINCT t."name") AS tags
        FROM "Problem" p
        LEFT JOIN "SheetProblem" s ON p.id = s."problemId"
        LEFT JOIN "Sheet" sh ON s."sheetId" = sh.id
        LEFT JOIN "ProblemsOnTopicTags" pt ON p.id = pt."problemId"
        LEFT JOIN "TopicTag" t ON pt."topicTagId" = t.id
        ${whereClause}
        GROUP BY p.id
        HAVING (
    ($1::text[] IS NULL OR
      COUNT(CASE WHEN sh.name = ANY($1::text[]) THEN 1 END) > 0)
    AND
    ($2::text[] IS NULL OR
      COUNT(CASE WHEN t."name" = ANY($2::text[]) THEN 1 END) > 0)
  )
        ORDER BY ${orderClause}
        OFFSET ${offset} LIMIT ${ITEMS_PER_PAGE};
`;

    const query2 = `
        SELECT
            p.id
        FROM "Problem" p
        LEFT JOIN "SheetProblem" s ON p.id = s."problemId"
        LEFT JOIN "Sheet" sh ON s."sheetId" = sh.id
        LEFT JOIN "ProblemsOnTopicTags" pt ON p.id = pt."problemId"
        LEFT JOIN "TopicTag" t ON pt."topicTagId" = t.id
        ${whereClause}
        GROUP BY p.id
        HAVING (
    ($1::text[] IS NULL OR
      COUNT(CASE WHEN sh.name = ANY($1::text[]) THEN 1 END) > 0)
    AND
    ($2::text[] IS NULL OR
      COUNT(CASE WHEN t."name" = ANY($2::text[]) THEN 1 END) > 0)
  )
`;

    const [problems, allProblems] = await Promise.all([db.$queryRawUnsafe<ProblemWithStats[]>(
        query,
        companies,
        tags
    ), db.$queryRawUnsafe<Array<{ id: string }>>(
        query2,
        companies,
        tags
    )]);

    const totalPages = Math.ceil(allProblems.length / ITEMS_PER_PAGE);

    return (<div className="w-full max-w-[1000px] py-6">
        <div className="mb-6">
            <div className='p-6 border border-muted-foreground/50 bg-card flex justify-between items-center'>
                <h1 className="text-xl font-bold">ALL PROBLEMS</h1>
            </div>
            <ProgressTracker problemIds={allProblems.map(problem => problem.id.toString())} />
        </div>

        <Filters filters={{ sorting: sort, order }} companies={companies} tags={tags} isProblemFilter />

        <div className="min-w-full border-collapse">

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
                    companies={problem.companies}
                />
            ))}
        </div>
        <div className="p-6">
            <GlobalPagination currentPage={Number(page)} totalPages={totalPages} />
        </div>
    </div>)
}