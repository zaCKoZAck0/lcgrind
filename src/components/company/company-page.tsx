"use client";
import { ArrowLeft, ChartLineIcon } from "lucide-react";
import Link from "next/link";
import { COMPANIES, DEFAULT_REVALIDATION } from "~/config/constants";
import { buttonVariants } from "../ui/button";
import { Filters } from "./filter";
import { ProblemRow } from "./problem-row";
import { ProgressTracker } from "./progress-tracker";
import { useQuery } from "@tanstack/react-query";
import { getCompanyWiseProblems } from "~/server/actions/companies/getCompanyWiseProblems";
import { Skeleton } from "../ui/skeleton";
import { getCompanyMetadata } from "~/server/actions/companies/getCompanyMetadata";
import { ProblemRowSkeleton } from "../all-problems/problem-row-skeleton";
import { useSearchParams } from "next/navigation";

export function CompanyPage({ slug }: { slug: string }) {
    const searchParams = useSearchParams();

    const tagsParam = searchParams.getAll('tags');
    const tags = tagsParam.length > 0 ? tagsParam : [];
    const sort = searchParams.get('sort') || 'frequency';
    const order = searchParams.get('order') || 'all';
    const search = searchParams.get('search') || '';
    const tagsKey = Array.isArray(tags) ? tags.join(",") : tags;

    const { data: problems, isLoading: isProblemsLoading } = useQuery({
        queryKey: [`companies/${slug}/problems`, order, search, sort, tagsKey],
        queryFn: () => getCompanyWiseProblems(order, search, slug, sort, tags),
        staleTime: DEFAULT_REVALIDATION,
        gcTime: DEFAULT_REVALIDATION,
    });

    const { data: sheet, isLoading: isSheetLoading } = useQuery({
        queryKey: [`companies/${slug}/metadata`],
        queryFn: () => getCompanyMetadata(slug),
        staleTime: DEFAULT_REVALIDATION,
        gcTime: DEFAULT_REVALIDATION,
    })

    const selectedSheet = sheet?.[0];

    return <div className="w-full max-w-[1000px] py-6">
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
                    {isSheetLoading ? <SheetSkeleton /> : (<div className="w-fit h-fit">
                        <div className="flex gap-6 min-w-[360px]">
                            <img
                                src={`https://img.logo.dev/${COMPANIES[selectedSheet?.name.trim()] ?? `${selectedSheet?.slug}.com`}?token=pk_Ovv0aVUwQNK80p_PGY_xcg`}
                                alt={`${selectedSheet?.name} logo`}
                                className="size-14 rounded-md"
                            />
                            <div className="flex flex-col justify-between">
                                <h1 className="font-semibold text-2xl">{selectedSheet?.name}</h1>
                                <p className="text-muted-foreground/50 text-lg">
                                    {selectedSheet?.numOfProblems} Problems
                                </p>
                            </div>
                        </div>
                    </div>)}
                </div>
                <ProgressTracker problemIds={problems?.map(problem => problem.id.toString()) ?? []} isLoading={isProblemsLoading} />
            </div>
        </div>

        <div className='shadow-shadow'>
            <Filters filters={{ sorting: sort, order, search }} />

            {
                isProblemsLoading
                    ? Array.from({ length: 10 }).map((_, i) => (
                        <ProblemRowSkeleton key={i} />
                    ))
                    : problems?.map((problem, idx) => (
                        <ProblemRow
                            key={problem.id}
                            index={idx}
                            order={order}
                            problemUrl={problem.url}
                            problemTitle={problem.title}
                            problemId={problem.id.toString()}
                            frequency={problem.order}
                            difficulty={problem.difficulty}
                            acceptance={problem.acceptance}
                            isPaid={problem.isPaid}
                            tags={problem.tags}
                        />
                    ))}
        </div>
    </div>
}


const SheetSkeleton = () => {
    return (<div className="w-fit h-fit">
        <div className="flex gap-6 min-w-[360px]">
            <Skeleton className="size-14 rounded-md" />
            <div className="pt-1">
                <Skeleton className="h-5 w-[120px] mb-3" />
                <Skeleton className="h-4 w-[180px]" />
            </div>
        </div>
    </div>)
}