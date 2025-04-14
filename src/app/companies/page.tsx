import Link from "next/link";
import { GlobalPagination } from "~/components/global-pagination";
import { CompanySearch } from "~/components/search";
import { Card } from "~/components/ui/card";
import { db } from "~/lib/db";
import { CompanyDetails, TotalCountResult } from "~/types/company";

const ITEMS_PER_PAGE = 24;

export const dynamic = "force-static";

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
            <h1 className="md:text-5xl text-3xl font-bold p-12">All Companies</h1>
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
                    // Fetch company logo from external API
                    const companiesLogos = await (
                        await fetch(
                            `https://www.logo.dev/api/search?q=${company.slug}.com&token=pk_Ovv0aVUwQNK80p_PGY_xcg`,
                            { next: { revalidate: 3600 * 24 * 5 } }
                        )
                    ).json();
                    const logo = companiesLogos[0]?.logo_url ?? null;
                    return (
                        <Link
                            key={company.slug}
                            href={`/companies/${company.slug}`}
                            className="w-fit h-fit transition-transform hover:scale-105 hover:-translate-y-1"
                        >
                            <Card>
                                <div className="flex gap-6 min-w-[360px] px-6">
                                    <img src={logo} className="size-16 rounded-md" />
                                    <div>
                                        <p className="font-semibold text-2xl">{company.name}</p>
                                        <p className="text-muted-foreground text-lg">
                                            {company.numOfProblems} Problems
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    );
                })}
            </div>
            <div className="p-6">
                <GlobalPagination currentPage={currentPage} totalPages={totalPages} />
            </div>
        </>
    );
}
