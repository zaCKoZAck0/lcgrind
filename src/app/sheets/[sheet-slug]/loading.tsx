import { Skeleton } from "~/components/ui/skeleton"

export default function SheetPageLoading() {
    return (
        <div className="w-full py-6 max-w-5xl mx-auto">
            {/* Back button + header */}
            <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-9 w-20" />
            </div>

            {/* Sheet info card skeleton */}
            <div className="p-6 border-2 border-border bg-card flex flex-col md:flex-row justify-between gap-6">
                <div className="w-fit h-fit">
                    <div className="flex gap-6 min-w-[360px]">
                        <Skeleton className="size-14 rounded-md" />
                        <div className="flex flex-col justify-between">
                            <Skeleton className="h-7 w-[200px] mb-1" />
                            <Skeleton className="h-5 w-[140px]" />
                        </div>
                    </div>
                    <Skeleton className="h-5 w-full max-w-[400px] mt-3 hidden md:block" />
                    <div className="flex flex-col md:flex-row gap-3 py-4">
                        <Skeleton className="h-10 w-[120px]" />
                        <Skeleton className="h-10 w-[120px]" />
                    </div>
                </div>
                <div className="w-full md:max-w-[320px]">
                    <Skeleton className="h-[200px] w-full" />
                </div>
            </div>

            {/* Progress tracker skeleton */}
            <div className="border-2 border-border border-t-0 p-3">
                <Skeleton className="h-4 w-full" />
            </div>

            {/* Problem groups skeleton */}
            <div className="w-full space-y-6 mt-6">
                {[1, 2, 3].map((group) => (
                    <div key={group} className="border-2 border-border">
                        <div className="flex justify-between items-center p-4">
                            <Skeleton className="h-8 w-[150px]" />
                            <Skeleton className="h-4 w-[200px] hidden md:block" />
                        </div>
                        <div className="border-t-2 border-border">
                            {[1, 2, 3, 4, 5].map((problem) => (
                                <div key={problem} className="flex p-3 border-2 border-border border-t-0">
                                    <div className="flex-grow">
                                        <Skeleton className="h-7 w-[280px] mb-2" />
                                        <div className="flex flex-wrap gap-4 mt-2">
                                            <Skeleton className="h-6 w-[70px]" />
                                            <Skeleton className="h-6 w-[60px]" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-4 md:mt-0 md:ml-6">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
