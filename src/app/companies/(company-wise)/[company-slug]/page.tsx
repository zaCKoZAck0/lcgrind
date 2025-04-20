import { type SearchParams, type CompanyParams } from "~/types/company";
import { CompanyPage } from "~/components/company/company-page";

export default async function CompanyWiseQuestion({
    params,
    searchParams
}: {
    params: Promise<CompanyParams>;
    searchParams: Promise<SearchParams>;
}) {
    const { 'company-slug': slug } = await params;
    const p = await searchParams;
    const { tags = [] } = p;
    const { sort = 'frequency', order = 'all', search = '' } = p;
    return (
        <CompanyPage
            sort={sort}
            order={order}
            search={search}
            slug={slug}
            tags={tags}
        />
    );
}
