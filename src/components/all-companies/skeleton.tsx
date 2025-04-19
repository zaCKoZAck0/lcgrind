import { Skeleton } from "~/components/ui/skeleton";


export function AllCompaniesSkeleton() {

    return (
        <>
            <div
                className="max-w-[1200px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
                       md:gap-6 gap-3"
            >
                {[...Array(24).keys()].map((key) => {
                    return (
                        <div key={key} className="w-fit h-fit">
                            <div className="flex gap-6 min-w-[360px] px-6">
                                <Skeleton className="size-16 rounded-md" />
                                <div className="pt-1">
                                    <Skeleton className="h-6 w-[200px] mb-3" />
                                    <Skeleton className="h-5 w-[160px]" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}