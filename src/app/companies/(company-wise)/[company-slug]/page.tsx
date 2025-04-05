import { ArrowLeft } from "lucide-react";
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
            <div className="p-1">
                <Link
                    className={buttonVariants({ variant: 'outline', size: 'sm' })}
                    href='/companies'
                >
                    <ArrowLeft />All Companies
                </Link>
            </div>

            <div className='p-3'>
                <div className="w-fit h-fit">
                    <div className="flex gap-3 min-w-[360px]">
                        <img
                            src={logoResponse?.logo_url || '/default-company.png'}
                            alt={`${sheet.name} logo`}
                            className="size-16 rounded-md"
                        />
                        <div>
                            <h1 className="font-semibold text-2xl">{sheet.name}</h1>
                            <p className="text-muted-foreground text-lg">
                                {sheet._count.SheetProblem} Problems
                            </p>
                        </div>
                    </div>
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
