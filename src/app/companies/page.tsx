import Link from "next/link";
import { GlobalPagination } from "~/components/global-pagination";
import { CompanySearch } from "~/components/search";
import { Card } from "~/components/ui/card";
import { db } from "~/lib/db";

const ITEMS_PER_PAGE = 24;

export default async function CompaniesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {

    const awaitedParams = await searchParams;
    const currentPage = Number(awaitedParams["page"]) || 1;
    const query = awaitedParams["search"] as string ?? "";
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    const [totalCompaniesCount, allCompanies] = await Promise.all([
        db.sheet.count({
            where: {
                isCompany: true,
                slug: {
                    contains: query.toLowerCase()
                }
            },
        }),
        db.sheet.findMany({
            where: {
                isCompany: true,
                slug: {
                    contains: query.toLowerCase()
                }
            },
            orderBy: {
                SheetProblem: {
                    _count: "desc",
                },
            },
            skip: offset,
            take: ITEMS_PER_PAGE,
            include: {
                _count: {
                    select: {
                        SheetProblem: {},
                    },
                },
            },
        }),
    ]);


    const totalPages = Math.ceil(totalCompaniesCount / ITEMS_PER_PAGE);



    return (
        <>
            <h1 className="md:text-5xl text-3xl font-bold p-12">All Companies</h1>
            <CompanySearch query={awaitedParams["search"] as string} />
            {allCompanies.length === 0 && (
                <div className="p-8 text-center text-muted-foreground/50">
                    No companies found{query ? ` matching "${query}"` : ""}.
                </div>
            )}
            <div className="max-w-[1200px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-6 gap-3">
                {allCompanies.map(async (company) => {
                    const companiesLogos = await (
                        await fetch(
                            `https://www.logo.dev/api/search?q=${company.slug}.com&token=pk_Ovv0aVUwQNK80p_PGY_xcg`,
                            { next: { revalidate: 3600 * 24 * 5 } } // caching logos for 5 days
                        )
                    ).json();
                    const logo = companiesLogos[0]?.logo_url ?? null;
                    return (
                        <Link href={`/companies/${company.slug}`} className="w-fit h-fit transition-transform hover:scale-105 hover:-translate-y-1">
                            <Card key={company.id} >
                                <div className="flex gap-6 min-w-[360px] px-6">
                                    <img src={logo} className="size-16 rounded-md" />
                                    <div>
                                        <p className="font-semibold text-2xl">{company.name}</p>
                                        <p className="text-muted-foreground text-lg">
                                            {company._count.SheetProblem} Problems
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    );
                })}
            </div>
            <div className="p-6">
                <GlobalPagination currentPage={currentPage} totalPages={totalPages} relativeUrl={"/companies"} />
            </div>
        </>
    );
}