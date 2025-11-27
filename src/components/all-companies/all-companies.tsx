"use client";

import Link from "next/link";
import { COMPANIES, DEFAULT_REVALIDATION } from "~/config/constants";
import { GlobalPagination } from "../global-pagination";
import { buttonVariants } from "../ui/button";
import { useQuery } from "@tanstack/react-query";
import { getCompanies } from "~/server/actions/companies/getCompanies";
import { AllCompaniesSkeleton } from "./skeleton";
import { cn } from "~/lib/utils";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

const ITEMS_PER_PAGE = 24;

export function AllCompanies() {

    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get('page')) || 1;
    const query = (searchParams.get('search') || '').trim().toLowerCase();
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    const { data, isLoading } = useQuery({
        queryKey: ["companies", query, offset],
        queryFn: () => getCompanies(query, offset, ITEMS_PER_PAGE),
        staleTime: DEFAULT_REVALIDATION,
        gcTime: DEFAULT_REVALIDATION,
    });

    if (isLoading) {
        return <AllCompaniesSkeleton />;
    }

    const totalCompaniesCount = Number(data.totalCountResult[0].count);
    const totalPages = Math.ceil(totalCompaniesCount / ITEMS_PER_PAGE);
    return <>
        {data.companies.length === 0 && (
            <div className="p-8 text-center text-muted-foreground/50">
                No companies found{query ? ` matching "${query}"` : ""}.
            </div>
        )}
        <div
            className="max-w-[1200px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-6 gap-3"
        >
            {data.companies.map((company) => {
                return (
                    <Link
                        key={company.slug}
                        href={`/companies/${company.slug}`}
                        className={cn(buttonVariants({ variant: "neutral" }), "h-fit py-6 cursor-pointer w-full")}
                    >
                        <div className="flex gap-6 min-w-[360px] w-full h-fit text-left px-6">
                            <Image src={`https://img.logo.dev/${COMPANIES[company.name.trim()] ?? `${company.slug}.com`}?token=pk_eQPbG0_jSyqQCL92PlOJHw`} width={48} height={48} className="size-16 rounded-md object-cover" alt={company.name} />
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
