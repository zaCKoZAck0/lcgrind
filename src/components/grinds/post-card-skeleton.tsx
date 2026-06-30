export function PostCardSkeleton() {
    return (
        <article className="animate-pulse rounded-base border-2 border-border bg-card p-4 flex gap-3">
            {/* Avatar */}
            <div className="size-9 shrink-0 rounded-base bg-muted border-2 border-border" />
            <div className="flex-1 flex flex-col gap-2 min-w-0">
                {/* Author row */}
                <div className="flex items-center gap-1.5">
                    <div className="h-3 w-20 rounded bg-muted" />
                    <div className="h-2 w-1 rounded-full bg-muted" />
                    <div className="h-3 w-14 rounded bg-muted" />
                </div>
                {/* Title */}
                <div className="h-4 w-3/4 rounded bg-muted" />
                {/* Excerpt */}
                <div className="h-3 w-full rounded bg-muted" />
                {/* Tag chips */}
                <div className="flex gap-1 mt-1">
                    <div className="h-4 w-16 rounded-base bg-muted" />
                    <div className="h-4 w-12 rounded-base bg-muted" />
                </div>
                {/* Footer */}
                <div className="flex items-center gap-2 mt-2 pt-3 border-t border-border/30">
                    <div className="h-3 w-6 rounded bg-muted" />
                    <div className="h-3 w-3 rounded-full bg-muted" />
                    <div className="h-3 w-6 rounded bg-muted" />
                    <div className="h-3 w-4 rounded bg-muted" />
                    <div className="h-3 w-5 rounded bg-muted" />
                </div>
            </div>
        </article>
    );
}
