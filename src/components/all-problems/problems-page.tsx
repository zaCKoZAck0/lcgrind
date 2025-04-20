"use client";
import { useQuery } from "@tanstack/react-query";
import { Filters } from "../company/filter";
import { ProblemRow } from "../company/problem-row";
import { ProgressTracker } from "../company/progress-tracker";
import { GlobalPagination } from "../global-pagination";
import { getProblems } from "~/server/actions/problems/getProblems";
import { getProblemIds } from "~/server/actions/problems/getProblemIds";
import { ProblemRowSkeleton } from "./problem-row-skeleton";

export function ProblemsPage({ order, sort, search, tags, companies, page, perPage }: {
    order: string, sort: string, search: string, tags: string[], companies: string[], page: number, perPage: number
}) {

    const { data: problems, isLoading: problemsLoading } = useQuery({
        queryKey: ['problems', order, sort, search, tags, companies, page],
        queryFn: () => getProblems(order, search, sort, tags, companies, page, perPage),
    });

    const { data: problemIds } = useQuery({
        queryKey: ['problems-ids', order, search, tags, companies],
        queryFn: () => getProblemIds(order, search, tags, companies),
    })

    const totalPages = Math.ceil(problemIds?.length / perPage);

    return (<div className="w-full max-w-[1000px] py-6">
        <div className="mb-12 shadow-shadow">
            <div className='p-6 border-2 border-border bg-card flex justify-between items-center bg-main text-main-foreground'>
                <h1 className="text-xl font-bold">ALL PROBLEMS</h1>
            </div>
            <ProgressTracker problemIds={problemIds ?? []} />
        </div>


        <div className="shadow-shadow">
            <Filters filters={{ sorting: sort, order, search }} companies={companies} tags={tags} isProblemFilter />

            <div className="min-w-full border-collapse">

                {problemsLoading ? Array.from({ length: 10 }).map((_, i) => (
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
                            companies={problem.companies}
                        />
                    ))}
            </div>
        </div>
        <div className="p-6">
            <GlobalPagination currentPage={Number(page)} totalPages={totalPages} />
        </div>
    </div>)
}