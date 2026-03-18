import { Skeleton } from "../ui/skeleton";

export const ProblemRowSkeleton = () => (
    <div className="relative flex p-3 border-2 border-border border-t-0">
        <div className="flex-grow">
            <div className="flex items-center">
                <Skeleton className="h-7 w-48 md:w-64" />
            </div>
            <div className="flex flex-wrap gap-4 mt-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-14" />
                <Skeleton className="h-5 w-14" />
            </div>
        </div>
        <div className="flex items-center gap-3 md:ml-6">
            <Skeleton className="h-10 w-10 rounded-full" />
        </div>
    </div>
);