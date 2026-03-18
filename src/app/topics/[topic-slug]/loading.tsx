import { Skeleton } from "~/components/ui/skeleton";
import { ProblemRowSkeleton } from "~/components/all-problems/problem-row-skeleton";

export default function TopicLoading() {
    return (
        <div className="w-full max-w-[1000px] py-6">
            <div className="mb-12 shadow-shadow">
                <div className="p-3 border-2 border-border bg-card flex justify-between items-center bg-main text-main-foreground">
                    <Skeleton className="h-8 w-28" />
                </div>

                <div>
                    <div className="p-6 border-2 border-t-0 border-border bg-card flex justify-between items-center">
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-7 w-48" />
                            <Skeleton className="h-5 w-28" />
                        </div>
                    </div>
                    <div className="border-2 border-border border-t-0 p-3">
                        <Skeleton className="h-6 w-full" />
                    </div>
                </div>
            </div>

            <div className="shadow-shadow">
                <div className="w-full bg-card flex flex-col md:flex-row border-2 border-border">
                    <div className="flex gap-3 flex-col py-6 px-3 md:border-r-2 border-b-2 md:border-b-0 border-border">
                        <Skeleton className="h-9 w-[120px]" />
                        <Skeleton className="h-9 w-full" />
                    </div>
                    <div className="flex py-6 px-3 flex-1 gap-3">
                        <Skeleton className="h-9 w-[140px]" />
                    </div>
                </div>

                {Array.from({ length: 10 }).map((_, i) => (
                    <ProblemRowSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
