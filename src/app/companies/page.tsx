import Link from "next/link";
import { GlobalPagination } from "~/components/global-pagination";
import { CompanySearch } from "~/components/search";
import { Star9 } from "~/components/stars/s9";
import { Button } from "~/components/ui/button";
import { COMPANIES } from "~/config/constants";
import { db } from "~/lib/db";
import { CompanyDetails, TotalCountResult } from "~/types/company";

const ITEMS_PER_PAGE = 24;

export default async function CompaniesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const awaitedParams = await searchParams;
    const currentPage = Number(awaitedParams["page"]) || 1;
    // Get and trim the search text
    const query = ((awaitedParams["search"] as string) ?? "").trim();
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    // Sanitize and prepare the search term for ILIKE
    const sanitizedQuery = query.toLowerCase();
    const likeParam = `%${sanitizedQuery}%`;

    // Execute both queries concurrently
    const [totalCountResult, companies] = await Promise.all([
        db.$queryRaw<TotalCountResult[]>`
      SELECT COUNT(*) AS count
      FROM "Sheet"
      WHERE "isCompany" = TRUE AND slug ILIKE ${likeParam};
    `,
        db.$queryRaw<CompanyDetails[]>`
      SELECT s.name, s.slug, COUNT(p."problemId") AS "numOfProblems"
      FROM "Sheet" s
      LEFT JOIN "SheetProblem" p ON s.id = p."sheetId"
      WHERE s."isCompany" = TRUE AND s.slug ILIKE ${likeParam}
      GROUP BY s.id
      ORDER BY "numOfProblems" DESC
      OFFSET ${offset} LIMIT ${ITEMS_PER_PAGE};
    `,
    ]);

    // totalCountResult should be an array with one object [{ count: ... }]
    const totalCompaniesCount = Number(totalCountResult[0].count);
    const totalPages = Math.ceil(totalCompaniesCount / ITEMS_PER_PAGE);

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
            {companies.length === 0 && (
                <div className="p-8 text-center text-muted-foreground/50">
                    No companies found{query ? ` matching "${query}"` : ""}.
                </div>
            )}
            <div
                className="max-w-[1200px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
                   md:gap-6 gap-3"
            >
                {companies.map(async (company) => {
                    return (
                        <Link
                            key={company.slug}
                            href={`/companies/${company.slug}`}
                            className="w-full md:w-fit h-fit"
                        >
                            <Button className="h-fit py-6 cursor-pointer w-full" variant="neutral">
                                <div className="flex gap-6 md:min-w-[360px] w-full h-fit text-left px-6">
                                    <img src={`https://img.logo.dev/${COMPANIES[company.name.trim()] ?? `${company.slug}.com`}?token=pk_Ovv0aVUwQNK80p_PGY_xcg`} className="size-16 rounded-md" />
                                    <div>
                                        <p className="font-semibold text-2xl">{company.name}</p>
                                        <p className="text-muted-foreground text-lg">
                                            {company.numOfProblems} Problems
                                        </p>
                                    </div>
                                </div>
                            </Button>
                        </Link>
                    );
                })}
            </div >
            <div className="pb-6 pt-12  ">
                <GlobalPagination currentPage={currentPage} totalPages={totalPages} />
            </div>
        </>
    );
}
