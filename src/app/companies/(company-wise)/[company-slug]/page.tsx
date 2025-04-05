import { ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { Filters } from "~/components/company/filter";
import { buttonVariants } from "~/components/ui/button";
import { db } from "~/lib/db";
import { COMPANY_LOGO_API, DEFAULT_REVALIDATION } from "~/config/constants";
import { type SearchParams, type CompanyParams } from "~/types/company";
import { ProblemRow } from "~/components/company/problem-row";
import { getOrderKey } from "~/utils/sorting";
import { Prisma } from "@prisma/client";

export default async function CompanyWiseQuestion({
    params,
    searchParams
}: {
    params: Promise<CompanyParams>;
    searchParams: Promise<SearchParams>;
}) {
    const { 'company-slug': slug } = await params;
    const { sort = 'frequency', order = 'sheetOrder' } = await searchParams;

    const sheet = await db.sheet.findFirstOrThrow({
        where: { slug },
        include: {
            _count: { select: { SheetProblem: true } },
            SheetProblem: {
                include: {
                    problem: {
                        include: { topicTags: { include: { topicTag: true } } }
                    }
                }
            }
        }
    });

    const [logoResponse] = await fetch(
        `${COMPANY_LOGO_API}?q=${slug}.com`,
        { next: { revalidate: DEFAULT_REVALIDATION } }
    ).then(res => res.json());

    const filteredProblems = sheet.SheetProblem
        .filter(problem => (problem[getOrderKey(order) as unknown as keyof typeof problem] as Prisma.Decimal).toNumber() !== -1)
        .sort((a, b) => {
            if (sort === 'difficulty') {
                return a.problem.difficulty.localeCompare(b.problem.difficulty);
            }
            const orderKey = getOrderKey(order) as keyof typeof b;
            return (b[orderKey] as number) - (a[orderKey] as number);
        });

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

            {filteredProblems.map((problem, idx) => (
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
