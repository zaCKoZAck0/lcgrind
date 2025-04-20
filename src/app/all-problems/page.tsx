import { ProblemsPage } from "~/components/all-problems/problems-page";
import { SearchParams } from "~/types/problem";

const ITEMS_PER_PAGE = 100;

export default async function AllProblemsPage({
    searchParams
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    let { companies = null, tags = null } = params;
    const { sort = 'question-id', order = 'all-problems', search = '', page = 1 } = params;
    if (!Array.isArray(companies) && companies != null) companies = [companies];
    if (!Array.isArray(tags) && tags != null) tags = [tags];


    return (<ProblemsPage order={order} sort={sort} search={search} tags={tags} companies={companies} page={Number(page)} perPage={ITEMS_PER_PAGE} />)
}