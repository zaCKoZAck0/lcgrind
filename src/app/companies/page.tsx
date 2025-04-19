import { CompanySearch } from "~/components/search";
import { Star9 } from "~/components/stars/s9";
import { getCompanies } from "~/server/actions/companies/getCompanies";
import { AllCompanies } from "~/components/all-companies/all-companies";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

const ITEMS_PER_PAGE = 24;

export default async function CompaniesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const awaitedParams = await searchParams;
    const currentPage = Number(awaitedParams["page"]) || 1;
    // Get and trim the search text
    const query = ((awaitedParams["search"] as string) ?? "").trim().toLowerCase();
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    const queryClient = new QueryClient();
    await queryClient.prefetchQuery({
        queryKey: ["companies", query, offset],
        queryFn: ({ queryKey }) => {
            const [, searchQuery, searchOffset] = queryKey;
            return getCompanies(searchQuery as string, searchOffset as number, ITEMS_PER_PAGE);
        },
    });

    return (
        <>
            <div className="p-6">
                <h1 className="md:text-5xl text-3xl p-6 font-bold relative">
                    <Star9 className="absolute size-10 top-0 left-0 text-main" />
                    <span>
                        All Companies
                    </span>
                    <Star9 className="absolute size-10 bottom-0 right-0 text-main" />
                </h1>
            </div>
            <CompanySearch query={query} />
            <HydrationBoundary state={dehydrate(queryClient)}>
                <AllCompanies query={query} currentPage={currentPage} perPage={ITEMS_PER_PAGE} offset={offset} />
            </HydrationBoundary>
        </>
    );
}
