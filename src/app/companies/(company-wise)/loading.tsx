import { Skeleton } from "~/components/ui/skeleton"

export default function CompanyPageLoading() {
    return (
        <div className="w-full py-6">
            {/* Company header skeleton */}
            <div className="flex items-center gap-3 mb-4 p-3">
                <Skeleton className="size-12 rounded-md" />
                <div>
                    <Skeleton className="h-8 w-[200px] mb-2" />
                    <Skeleton className="h-4 w-[120px]" />
                </div>
            </div>

            {/* Filter bar skeleton */}
            <div className="w-full bg-card flex flex-col md:flex-row border-2 border-border">
                <div className="flex gap-3 flex-col py-6 px-3 md:border-r-2 border-b-2 md:border-b-0 border-border">
                    <div className="flex gap-3">
                        <Skeleton className="h-10 w-[120px]" />
                        <Skeleton className="h-10 w-[120px]" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex flex-col-reverse md:flex-row py-6 px-3 flex-1 gap-3">
                    <Skeleton className="h-10 w-[150px]" />
                    <Skeleton className="h-10 w-[150px]" />
                </div>
            </div>

            {/* Progress bar skeleton */}
            <div className="border-2 border-border border-t-0 p-3">
                <Skeleton className="h-4 w-full" />
            </div>

            {/* Problem rows skeleton */}
            <div className="border-t-2 border-border">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex p-3 border-2 border-border border-t-0">
                        <div className="flex-grow">
                            <Skeleton className="h-7 w-[280px] mb-2" />
                            <div className="flex flex-wrap gap-4 mt-2">
                                <Skeleton className="h-6 w-[70px]" />
                                <Skeleton className="h-6 w-[80px]" />
                                <Skeleton className="h-6 w-[60px]" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3 ml-6">
                            <Skeleton className="h-10 w-10 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
