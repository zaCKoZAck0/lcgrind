"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDownIcon, RotateCcwIcon } from "lucide-react";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { GlobalPagination } from "~/components/global-pagination";
import { ProblemRowSkeleton } from "~/components/all-problems/problem-row-skeleton";
import { LightRow } from "~/components/company/question-sections";
import { TypeTabs } from "./type-tabs";
import { getQuestionsByType, type QuestionsPage } from "~/server/actions/problems/getQuestionsByType";
import { DEFAULT_REVALIDATION } from "~/config/constants";
import { FEATURE_FLAGS } from "~/config/feature-flags";

const PER_PAGE = 100;

const TYPE_TITLES: Record<string, string> = {
    ...(FEATURE_FLAGS.SYSTEM_DESIGN ? { "system-design": "SYSTEM DESIGN" } : {}),
    ...(FEATURE_FLAGS.LLD ? { lld: "LOW LEVEL DESIGN" } : {}),
    ...(FEATURE_FLAGS.OTHERS ? { others: "OTHERS" } : {}),
};

export function TypeProblemsPage({
    slugType,
    initial,
}: {
    slugType: string;
    initial: QuestionsPage;
}) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const search = searchParams.get("search") ?? "";
    const sort = searchParams.get("sort") ?? "most-asked";
    const page = Number(searchParams.get("page") ?? 1);

    // Local controlled state for the search input — debounced URL push.
    const [searchInput, setSearchInput] = useState(search);

    // Sync local input when URL changes externally (e.g. back/forward).
    useEffect(() => {
        setSearchInput(search);
    }, [search]);

    // Debounce: push search to URL 350ms after last keystroke.
    useEffect(() => {
        const id = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (searchInput.trim()) {
                params.set("search", searchInput.trim());
                params.set("page", "1");
            } else {
                params.delete("search");
            }
            router.replace(`${pathname}?${params.toString()}`);
        }, 350);
        return () => clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput]);

    function setSort(value: string) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", value);
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    }

    function handleReset() {
        setSearchInput("");
        router.push(pathname);
    }

    const isDefault = search === "" && sort === "most-asked" && page === 1;

    const { data, isLoading } = useQuery({
        queryKey: ["questions-by-type", slugType, search, sort, page],
        queryFn: () => getQuestionsByType(slugType, search, sort, page, PER_PAGE),
        staleTime: DEFAULT_REVALIDATION,
        gcTime: DEFAULT_REVALIDATION,
        initialData: isDefault ? initial : undefined,
    });

    const items = data?.items ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.ceil(total / PER_PAGE);

    return (
        <div className="w-full max-w-[1000px] py-6 mx-auto">
            {/* Header */}
            <div className="mb-8 shadow-shadow">
                <div className="p-6 border-2 border-border bg-main text-main-foreground">
                    <h1 className="text-xl font-bold">{TYPE_TITLES[slugType] ?? slugType.toUpperCase()}</h1>
                    <TypeTabs />
                </div>
            </div>

            {/* Filters */}
            <div className="shadow-shadow">
                <Card className="flex flex-col md:flex-row md:items-center p-3 mb-0 gap-3 shadow-none bg-card rounded-none border-2 border-border">
                    <Select value={sort} onValueChange={setSort}>
                        <SelectTrigger className="min-w-[150px] w-fit">
                            <ArrowUpDownIcon />
                            <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="most-asked">Most asked</SelectItem>
                            <SelectItem value="az">A–Z</SelectItem>
                        </SelectContent>
                    </Select>
                    <label htmlFor="type-question-search" className="sr-only">Search question</label>
                    <Input
                        id="type-question-search"
                        placeholder="Search question..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="md:max-w-[320px]"
                    />
                    <Button
                        className="bg-secondary-background text-secondary-foreground cursor-pointer w-fit md:ml-auto"
                        variant="noShadow"
                        size="sm"
                        onClick={handleReset}
                    >
                        <RotateCcwIcon /> Reset
                    </Button>
                </Card>

                {/* Rows */}
                <div className="min-w-full">
                    {isLoading
                        ? Array.from({ length: 10 }).map((_, i) => (
                            <ProblemRowSkeleton key={i} />
                        ))
                        : items.map((q) => (
                            <LightRow key={q.statement} q={q} />
                        ))}
                </div>
            </div>

            {/* Pagination */}
            <div className="p-6">
                <GlobalPagination currentPage={page} totalPages={totalPages} />
            </div>
        </div>
    );
}
