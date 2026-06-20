import { Skeleton } from "~/components/ui/skeleton"

export default function CompanyPageLoading() {
    return (
        <div className="w-full max-w-[1000px] py-6">
            {/* Header card skeleton */}
            <div className="mb-12">
                <div className="p-3 border-2 border-border bg-card">
                    <Skeleton className="h-9 w-[140px]" />
                </div>
                <div className="p-6 border-2 border-t-0 border-border bg-card flex gap-6">
                    <Skeleton className="size-14 rounded-base" />
                    <div className="flex flex-col justify-between">
                        <Skeleton className="h-8 w-[200px]" />
                        <Skeleton className="h-5 w-[280px]" />
                    </div>
                </div>
            </div>

            {/* Band selector + tab bar skeleton */}
            <div className="mb-4 flex justify-end">
                <Skeleton className="h-12 w-[360px]" />
            </div>
            <Skeleton className="h-12 w-[280px] mb-4" />

            {/* Section skeletons */}
            {[...Array(2)].map((_, s) => (
                <div key={s} className="mb-8">
                    <div className="p-3 border-2 border-border bg-card">
                        <Skeleton className="h-6 w-[180px]" />
                    </div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex justify-between p-3 border-2 border-border border-t-0">
                            <Skeleton className="h-6 w-[320px]" />
                            <div className="flex gap-3">
                                <Skeleton className="h-6 w-[70px]" />
                                <Skeleton className="h-6 w-[60px]" />
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
