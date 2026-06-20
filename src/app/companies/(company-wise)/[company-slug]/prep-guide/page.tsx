import { permanentRedirect } from "next/navigation";
import { CompanyParams } from "~/types/company";

// The company page is the prep guide now; preserve old URLs and their SEO.
export default async function PrepGuideRedirect({
    params,
}: {
    params: Promise<CompanyParams>;
}) {
    const { 'company-slug': slug } = await params;
    permanentRedirect(`/companies/${slug}`);
}
