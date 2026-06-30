import { PostCardSkeleton } from "~/components/grinds/post-card-skeleton";

export default function GrindsLoading() {
    return (
        <div className="w-full max-w-[800px] py-6 px-4 mx-auto">
            <div className="mb-6 h-8 w-32 rounded bg-muted animate-pulse" />
            <div className="flex flex-col gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <PostCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
