import { Skeleton } from "../ui/skeleton";

export const ProblemRowSkeleton = () => (
    <div className="relative flex p-3 border-2 border-border border-t-0 items-center">
        <div className="flex-grow space-y-2">
            <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-1/3 md:w-1/4" />
            </div>
            <div className="flex flex-wrap gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-12" />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-12" />
            </div>
        </div>
        <div className="ml-6">
            <Skeleton className="h-10 w-10 rounded-full" />
        </div>
    </div>
);