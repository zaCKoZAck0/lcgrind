"use client";
import { ArrowLeft, ChartLineIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { COMPANIES, DEFAULT_REVALIDATION } from "~/config/constants";
import { buttonVariants } from "../ui/button";
import { Filters } from "./filter";
import { ProblemRow } from "./problem-row";
import { ProgressTracker } from "./progress-tracker";
import { useQuery } from "@tanstack/react-query";
import { getCompanyWiseProblems } from "~/server/actions/companies/getCompanyWiseProblems";
import { getCompanyWiseProblemIds } from "~/server/actions/companies/getCompanyWiseProblemIds";
import { Skeleton } from "../ui/skeleton";
import { getSheetMetadata } from "~/server/actions/sheets/getSheetMetadata";
import { ProblemRowSkeleton } from "../all-problems/problem-row-skeleton";
import { useSearchParams } from "next/navigation";
import { AdBanner } from "../ads/banner";
import { useTheme } from "~/hooks/use-theme";
import { getLogoUrl } from "~/utils/logo";
import { GlobalPagination } from "../global-pagination";

const ITEMS_PER_PAGE = 100;

interface CompanyPageProps {
    slug: string;
    initialProblems?: Awaited<ReturnType<typeof getCompanyWiseProblems>>;
    initialProblemIds?: Awaited<ReturnType<typeof getCompanyWiseProblemIds>>;
    initialSheet?: Awaited<ReturnType<typeof getSheetMetadata>>;
}

export function CompanyPage({ slug, initialProblems, initialProblemIds, initialSheet }: CompanyPageProps) {
    const searchParams = useSearchParams();
    const theme = useTheme();

    const tagsParam = searchParams.getAll('tags');
    const tags = tagsParam.length > 0 ? tagsParam : [];
    let difficulties = searchParams.getAll('difficulties');
    const sort = searchParams.get('sort') || 'frequency';
    const order = searchParams.get('order') || 'all';
    const search = searchParams.get('search') || '';
    const page = Number(searchParams.get('page') || 1);
    const tagsKey = Array.isArray(tags) ? tags.join(",") : tags;

    if (difficulties.length === 0) difficulties = null;

    // Only use initialData when params match the defaults (first page, no filters)
    const isDefaultQuery = order === 'all' && search === '' && sort === 'frequency' && tagsKey === '' && difficulties === null && page === 1;

    const { data: problems, isLoading: isProblemsLoading } = useQuery({
        queryKey: [`companies/${slug}/problems`, order, search, sort, tagsKey, difficulties, page],
        queryFn: () => getCompanyWiseProblems(order, search, slug, sort, tags, difficulties, page, ITEMS_PER_PAGE),
        staleTime: DEFAULT_REVALIDATION,
        gcTime: DEFAULT_REVALIDATION,
        initialData: isDefaultQuery ? initialProblems : undefined,
    });

    const { data: problemIds, isLoading: isIdsLoading } = useQuery({
        queryKey: [`companies/${slug}/problem-ids`, order, search, tagsKey, difficulties],
        queryFn: () => getCompanyWiseProblemIds(order, search, slug, tags, difficulties),
        staleTime: DEFAULT_REVALIDATION,
        gcTime: DEFAULT_REVALIDATION,
        initialData: isDefaultQuery ? initialProblemIds : undefined,
    });

    const { data: sheet, isLoading: isSheetLoading } = useQuery({
        queryKey: [`companies/${slug}/metadata`],
        queryFn: () => getSheetMetadata(slug),
        staleTime: DEFAULT_REVALIDATION,
        gcTime: DEFAULT_REVALIDATION,
        initialData: initialSheet,
    })

    const selectedSheet = sheet?.[0];
    const logoDomain = COMPANIES[selectedSheet?.name.trim()] ?? `${selectedSheet?.slug}.com`;
    const totalPages = Math.ceil((problemIds?.length ?? 0) / ITEMS_PER_PAGE);

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
                            <Image
                                src={getLogoUrl(logoDomain, theme)}
                                alt={`${selectedSheet?.name} logo`}
                                className="size-14 rounded-md"
                                width={56}
                                height={56}
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
                <ProgressTracker text="COMPLETED" className="border-2 border-border border-t-0 p-3" problemIds={problemIds?.map(id => id.toString()) ?? []} isLoading={isIdsLoading} />
            </div>
        </div>

        <div className='shadow-shadow'>
            <Filters filters={{ sorting: sort, order, search }} tags={tags} difficulties={difficulties} slug={slug} />

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

        <div className="p-6">
            <GlobalPagination currentPage={page} totalPages={totalPages} />
        </div>

        <AdBanner />
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