import { Card } from "~/components/ui/card";

export function PostCardSkeleton() {
    return (
        <Card className="animate-pulse gap-0 py-0">
            <div className="flex">
                <div className="flex flex-col items-center gap-1 border-r-2 border-border px-3 py-4">
                    <div className="size-5 rounded bg-muted" />
                    <div className="h-4 w-4 rounded bg-muted" />
                    <div className="size-5 rounded bg-muted" />
                </div>
                <div className="flex-1 p-4 flex flex-col gap-3">
                    <div className="flex gap-2">
                        <div className="h-5 w-20 rounded-base bg-muted" />
                        <div className="h-5 w-16 rounded-base bg-muted" />
                    </div>
                    <div className="h-5 w-3/4 rounded bg-muted" />
                    <div className="flex gap-3">
                        <div className="h-3 w-16 rounded bg-muted" />
                        <div className="h-3 w-12 rounded bg-muted" />
                    </div>
                </div>
            </div>
        </Card>
    );
}
