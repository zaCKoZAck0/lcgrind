import { CompanySearch } from "~/components/search";
import { Star9 } from "~/components/ui/stars/s9";
import { AllCompanies } from "~/components/all-companies/all-companies";

export const dynamic = "force-static";

export default async function CompaniesPage() {
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
            <CompanySearch />
            <AllCompanies />
        </>
    );
}
