"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DEFAULT_REVALIDATION } from "~/config/constants";
import { buttonVariants } from "~/components/ui/button";
import { ProblemRow } from "~/components/company/problem-row";
import { ProgressTracker } from "~/components/company/progress-tracker";
import { useQuery } from "@tanstack/react-query";
import { ProblemRowSkeleton } from "~/components/all-problems/problem-row-skeleton";
import { useSearchParams } from "next/navigation";
import { AdBanner } from "~/components/ads/banner";
import { GlobalPagination } from "~/components/global-pagination";
import { getTopicProblems } from "~/server/actions/topics/getTopicProblems";
import { getTopicProblemIds } from "~/server/actions/topics/getTopicProblemIds";
import { Filters } from "~/components/company/filter";

const ITEMS_PER_PAGE = 100;

interface TopicPageProps {
    topicSlug: string;
    topicName: string;
    problemCount: number;
    initialProblems?: Awaited<ReturnType<typeof getTopicProblems>>;
    initialProblemIds?: Awaited<ReturnType<typeof getTopicProblemIds>>;
}

export function TopicPage({
    topicSlug,
    topicName,
    problemCount,
    initialProblems,
    initialProblemIds,
}: TopicPageProps) {
    const searchParams = useSearchParams();

    let companies = searchParams.getAll("companies");
    let tags = searchParams.getAll("tags");
    let difficulties = searchParams.getAll("difficulties");
    const sort = searchParams.get("sort") || "frequency";
    const order = searchParams.get("order") || "all-problems";
    const search = searchParams.get("search") || "";
    const page = Number(searchParams.get("page") || 1);

    if (companies.length === 0) companies = null;
    if (tags.length === 0) tags = null;
    if (difficulties.length === 0) difficulties = null;

    const isDefaultQuery =
        order === "all-problems" &&
        sort === "frequency" &&
        search === "" &&
        companies === null &&
        tags === null &&
        difficulties === null &&
        page === 1;

    const { data: problems, isLoading: isProblemsLoading } = useQuery({
        queryKey: [`topics/${topicSlug}/problems`, order, search, sort, tags, companies, difficulties, page],
        queryFn: () =>
            getTopicProblems(topicSlug, order, search, sort, tags, companies, difficulties, page, ITEMS_PER_PAGE),
        staleTime: DEFAULT_REVALIDATION,
        gcTime: DEFAULT_REVALIDATION,
        initialData: isDefaultQuery ? initialProblems : undefined,
    });

    const { data: problemIds, isLoading: isIdsLoading } = useQuery({
        queryKey: [`topics/${topicSlug}/problem-ids`, order, search, tags, companies, difficulties],
        queryFn: () => getTopicProblemIds(topicSlug, order, search, tags, companies, difficulties),
        staleTime: DEFAULT_REVALIDATION,
        gcTime: DEFAULT_REVALIDATION,
        initialData: isDefaultQuery ? initialProblemIds : undefined,
    });

    const totalPages = Math.ceil((problemIds?.length ?? 0) / ITEMS_PER_PAGE);

    return (
        <div className="w-full max-w-[1000px] py-6">
            <div className="mb-12 shadow-shadow">
                <div className="p-3 border-2 border-border bg-card flex justify-between items-center bg-main text-main-foreground">
                    <Link
                        className={buttonVariants({ variant: "neutral", size: "sm" })}
                        href="/topics"
                    >
                        <ArrowLeft />
                        All Topics
                    </Link>
                </div>

                <div>
                    <div className="p-6 border-2 border-t-0 border-border bg-card flex justify-between items-center">
                        <div className="w-fit h-fit">
                            <div className="flex flex-col gap-1">
                                <h1 className="font-semibold text-2xl">
                                    {topicName}
                                </h1>
                                <p className="text-muted-foreground/50 text-lg">
                                    {problemCount} Problems
                                </p>
                            </div>
                        </div>
                    </div>
                    <ProgressTracker
                        text="COMPLETED"
                        className="border-2 border-border border-t-0 p-3"
                        problemIds={problemIds ?? []}
                        isLoading={isIdsLoading}
                    />
                </div>
            </div>

            <div className="shadow-shadow">
                <Filters
                    filters={{ sorting: sort, order, search }}
                    companies={companies}
                    tags={tags}
                    difficulties={difficulties}
                    topicSlug={topicSlug}
                    defaultSort="frequency"
                    isProblemFilter
                />

                {isProblemsLoading
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
                              companies={problem.companies}
                          />
                      ))}
            </div>

            <div className="p-6">
                <GlobalPagination currentPage={page} totalPages={totalPages} />
            </div>

            <AdBanner />
        </div>
    );
}
