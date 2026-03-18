import { Skeleton } from "~/components/ui/skeleton";

export function SheetCardSkeleton() {
    return (
        <div className="border-2 border-border p-4 flex items-center gap-4">
            <Skeleton className="size-12 rounded-md flex-shrink-0" />
            <div className="flex-grow">
                <Skeleton className="h-6 w-[180px] mb-2" />
                <Skeleton className="h-4 w-[100px]" />
            </div>
            <Skeleton className="h-8 w-[80px]" />
        </div>
    );
}

export function SheetListSkeleton() {
    return (
        <div className="space-y-4 p-4">
            {[...Array(6)].map((_, i) => (
                <SheetCardSkeleton key={i} />
            ))}
        </div>
    );
}
