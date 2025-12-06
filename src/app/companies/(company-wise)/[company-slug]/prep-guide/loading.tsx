import { Skeleton } from "~/components/ui/skeleton"

export default function SheetPageLoading() {
    return (
        <div className="w-full max-w-[1000px] py-6">
            {/* Header skeleton matching the actual page */}
            <div className="w-full bg-card flex items-center gap-2 justify-center p-3 border-2 border-border bg-card">
                <Skeleton className="size-8 rounded-md" />
                <Skeleton className="h-8 w-[300px]" />
            </div>
            
            {/* Most-Frequent Topics section skeleton */}
            <div className="p-6 border-2 border-border mb-6 bg-card flex flex-col gap-6 mt-6">
                <Skeleton className="h-7 w-[400px]" />
                <div className="flex flex-col items-center gap-4">
                    <Skeleton className="w-full h-12" />
                    <Skeleton className="aspect-square w-full max-w-[280px] sm:max-w-[300px] rounded-full" />
                </div>
            </div>
            
            {/* Go-To Interview Problems section skeleton */}
            <div className="p-6 border-2 border-border mb-6 bg-card flex flex-col gap-6 mt-6">
                <Skeleton className="h-7 w-[350px]" />
                <div className="border-t-2 border-border">
                    {[...Array(5).keys()].map((key) => (
                        <Skeleton key={key} className="h-16 w-full mb-2" />
                    ))}
                </div>
            </div>
        </div>
    );
}