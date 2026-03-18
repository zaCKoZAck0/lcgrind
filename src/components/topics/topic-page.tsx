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
import { TopicFilters } from "./topic-filters";

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

    let difficulties = searchParams.getAll("difficulties");
    const sort = searchParams.get("sort") || "question-id";
    const search = searchParams.get("search") || "";
    const page = Number(searchParams.get("page") || 1);

    if (difficulties.length === 0) difficulties = null;

    // Only use initialData when params match the SSR defaults
    const isDefaultQuery =
        sort === "question-id" &&
        search === "" &&
        difficulties === null &&
        page === 1;

    const { data: problems, isLoading: isProblemsLoading } = useQuery({
        queryKey: [`topics/${topicSlug}/problems`, search, sort, difficulties, page],
        queryFn: () =>
            getTopicProblems(topicSlug, search, sort, difficulties, page, ITEMS_PER_PAGE),
        staleTime: DEFAULT_REVALIDATION,
        gcTime: DEFAULT_REVALIDATION,
        initialData: isDefaultQuery ? initialProblems : undefined,
    });

    const { data: problemIds, isLoading: isIdsLoading } = useQuery({
        queryKey: [`topics/${topicSlug}/problem-ids`, search, difficulties],
        queryFn: () => getTopicProblemIds(topicSlug, search, difficulties),
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
                <TopicFilters
                    filters={{ sorting: sort, search }}
                    difficulties={difficulties}
                />

                {isProblemsLoading
                    ? Array.from({ length: 10 }).map((_, i) => (
                          <ProblemRowSkeleton key={i} />
                      ))
                    : problems?.map((problem, idx) => (
                          <ProblemRow
                              key={problem.id}
                              index={idx}
                              order="all-problems"
                              problemUrl={problem.url}
                              problemTitle={problem.title}
                              problemId={problem.id.toString()}
                              difficulty={problem.difficulty}
                              acceptance={problem.acceptance}
                              isPaid={problem.isPaid}
                              tags={problem.tags}
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
