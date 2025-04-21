import { type CompanyParams } from "~/types/company";
import { CompanyPage } from "~/components/company/company-page";

export default async function CompanyWiseQuestion({
    params
}: {
    params: Promise<CompanyParams>;
}) {
    const { 'company-slug': slug } = await params;

    return <CompanyPage slug={slug} />;
}