import type { ReactNode } from "react";
import type { PublicPost } from "~/server/actions/posts/core";
import { FeedVotes } from "./feed-votes";
import { PostCard } from "./post-card";

// Static (non-paginated) feed list. Wraps cards in FeedVotes so each
// PostVoteRail can highlight the caller's vote. `footer` renders after the
// cards (e.g. a "view all" link). For the infinite-scroll feed use FeedStream.
export function PostFeedList({
    posts,
    footer,
}: {
    posts: PublicPost[];
    footer?: ReactNode;
}) {
    return (
        <FeedVotes postIds={posts.map((p) => p.id)}>
            <div className="flex flex-col gap-4">
                {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}
                {footer}
            </div>
        </FeedVotes>
    );
}
