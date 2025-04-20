"use client";

import Link from "next/link";
import { COMPANIES } from "~/config/constants";
import { GlobalPagination } from "../global-pagination";
import { buttonVariants } from "../ui/button";
import { useQuery } from "@tanstack/react-query";
import { getCompanies } from "~/server/actions/companies/getCompanies";
import { AllCompaniesSkeleton } from "./skeleton";
import { cn } from "~/lib/utils";

export function AllCompanies({ query, currentPage, perPage, offset }: { query: string, currentPage: number, perPage: number, offset: number }) {

    const { data, isLoading } = useQuery({
        queryKey: ["companies", query, offset],
        queryFn: () => getCompanies(query, offset, perPage),
    });

    if (isLoading) {
        return <AllCompaniesSkeleton />;
    }

    const totalCompaniesCount = Number(data.totalCountResult[0].count);
    const totalPages = Math.ceil(totalCompaniesCount / perPage);
    return <>
        {data.companies.length === 0 && (
            <div className="p-8 text-center text-muted-foreground/50">
                No companies found{query ? ` matching "${query}"` : ""}.
            </div>
        )}
        <div
            className="max-w-[1200px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
                       md:gap-6 gap-3"
        >
            {data.companies.map((company) => {
                return (
                    <Link
                        key={company.slug}
                        href={`/companies/${company.slug}`}
                        className={cn(buttonVariants({ variant: "neutral" }), "h-fit py-6 cursor-pointer w-full")}
                    >
                        <div className="flex gap-6 min-w-[360px] w-full h-fit text-left px-6">
                            <img src={`https://img.logo.dev/${COMPANIES[company.name.trim()] ?? `${company.slug}.com`}?token=pk_Ovv0aVUwQNK80p_PGY_xcg`} className="size-16 rounded-md" />
                            <div>
                                <p className="font-semibold text-2xl">{company.name}</p>
                                <p className="text-muted-foreground text-lg">
                                    {company.numOfProblems} Problems
                                </p>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div >
        <div className="pb-6 pt-12  ">
            <GlobalPagination currentPage={currentPage} totalPages={totalPages} />
        </div>
    </>
}