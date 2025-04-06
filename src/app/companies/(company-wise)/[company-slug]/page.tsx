import { ArrowLeft, ChartLineIcon } from "lucide-react";
import Link from 'next/link';
import { Filters } from "~/components/company/filter";
import { buttonVariants } from "~/components/ui/button";
import { db } from "~/lib/db";
import { COMPANY_LOGO_API, DEFAULT_REVALIDATION } from "~/config/constants";
import { type SearchParams, type CompanyParams } from "~/types/company";
import { ProblemRow } from "~/components/company/problem-row";
import { getOrderKey } from "~/utils/sorting";

export default async function CompanyWiseQuestion({
    params,
    searchParams
}: {
    params: Promise<CompanyParams>;
    searchParams: Promise<SearchParams>;
}) {
    const { 'company-slug': slug } = await params;
    const { sort = 'frequency', order = 'all' } = await searchParams;
    const orderKey = getOrderKey(order);

    // Parallelize data fetching
    const [sheet, logoResponse] = await Promise.all([
        db.sheet.findFirstOrThrow({
            where: { slug },
            select: {
                name: true,
                slug: true,
                SheetProblem: {
                    where: {
                        [orderKey]: { not: -1 }
                    },
                    orderBy: sort === 'difficulty'
                        ? { problem: { difficultyOrder: 'asc' } } :
                        sort === 'question-id' ? { problem: { id: 'asc' } } :
                            sort === 'acceptance' ? { problem: { acceptance: 'desc' } }
                                : { [orderKey]: 'desc' },
                    include: {
                        problem: {
                            include: { topicTags: { include: { topicTag: true } } }
                        }
                    }
                },
                _count: {
                    select: { SheetProblem: true }
                }
            }
        }),
        fetch(`${COMPANY_LOGO_API}?q=${slug}.com`, {
            next: { revalidate: DEFAULT_REVALIDATION }
        }).then(res => res.json().then(data => data[0]))
    ]);

    return (
        <div className="w-full max-w-[1000px] py-6">
            <div className="p-3 border border-b-0 border-muted-foreground/50 bg-card">
                <Link
                    className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                    href='/companies'
                >
                    <ArrowLeft />All Companies
                </Link>
            </div>

            <div className='p-6 border border-muted-foreground/50 mb-6 bg-card flex justify-between items-center'>
                <div className="w-fit h-fit">
                    <div className="flex gap-6 min-w-[360px]">
                        <img
                            src={logoResponse?.logo_url || '/default-company.png'}
                            alt={`${sheet.name} logo`}
                            className="size-14 rounded-md"
                        />
                        <div className="flex flex-col justify-between">
                            <h1 className="font-semibold text-2xl">{sheet.name}</h1>
                            <p className="text-muted-foreground/50 text-lg">
                                {sheet._count.SheetProblem} Problems
                            </p>
                        </div>
                    </div>
                </div>
                <div>
                    <Link
                        href={`/companies/${slug}/prep-guide`}
                        className={buttonVariants({ variant: 'outline' })}
                    >
                        <ChartLineIcon />
                        Prep Guide
                    </Link>
                </div>
            </div>

            <Filters filters={{ sorting: sort, order }} />

            {sheet.SheetProblem.map((problem, idx) => (
                <ProblemRow
                    key={problem.problemId}
                    problem={problem}
                    index={idx}
                    order={order}
                />
            ))}
        </div>
    );
}
