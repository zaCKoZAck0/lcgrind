import { Skeleton } from "~/components/ui/skeleton"

export default function CompaniesPageLoading() {
    return (
        <div className="py-6">
            {/* Page header skeleton */}
            <div className="text-center mb-6">
                <Skeleton className="h-10 w-[300px] mx-auto mb-4" />
            </div>

            {/* Search bar skeleton */}
            <div className="p-6 pt-0 w-full max-w-xl flex items-center gap-2 mx-auto">
                <Skeleton className="h-12 w-full" />
            </div>

            {/* Company grid skeleton */}
            <div className="max-w-[1200px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-6 gap-3 p-4">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="border-2 border-border p-4 flex items-center gap-3">
                        <Skeleton className="size-10 rounded-md flex-shrink-0" />
                        <div className="flex-grow">
                            <Skeleton className="h-5 w-[120px] mb-2" />
                            <Skeleton className="h-4 w-[80px]" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
