import Link from "next/link";
import { MessageSquare, Pin } from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { formatMonth } from "~/utils/public-date";
import { formatCount } from "~/utils/format-count";
import { stripMarkdown } from "~/utils/grinds-seo";
import { postParam } from "~/server/actions/posts/core";
import type { PublicPost } from "~/server/actions/posts/core";
import { PostVoteRail } from "./post-vote-rail";

export function FeedPostCard({ post }: { post: PublicPost }) {
    const param = postParam(post.id, post.title);
    const excerpt = post.body ? stripMarkdown(post.body).slice(0, 120) : "";
    const who = post.author?.handle ? `@${post.author.handle}` : "Anonymous";

    return (
        <article className="relative rounded-base border-2 border-border bg-card p-4 flex gap-3 hover:bg-secondary-background/40 transition-colors">
            {post.isPinned && (
                <Pin className="absolute top-3 right-3 size-4 text-muted-foreground" aria-label="Pinned" />
            )}
            <Avatar className="size-9 shrink-0 border-2 border-border">
                <AvatarImage src={post.author?.avatar ?? undefined} alt={post.author?.handle ?? "anon"} />
                <AvatarFallback className="text-sm font-bold">
                    {post.author?.handle?.[0]?.toUpperCase() ?? "A"}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                {/* Author row */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    {post.author ? (
                        <Link
                            href={`/u/${post.author.handle}`}
                            className="relative z-10 font-semibold text-foreground hover:underline underline-offset-2"
                        >
                            {who}
                        </Link>
                    ) : (
                        <span className="font-semibold text-foreground">{who}</span>
                    )}
                    <span>·</span>
                    <span>{formatMonth(post.createdMonth)}</span>
                </div>

                {/* Title + excerpt — stretched link covers whole card */}
                <Link
                    href={`/grinds/${param}`}
                    className="after:absolute after:inset-0 after:content-['']"
                >
                    <h2 className="font-bold text-[15px] leading-snug">{post.title}</h2>
                    {excerpt && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                            {excerpt}
                        </p>
                    )}
                </Link>

                {/* Footer */}
                <div className="relative z-10 flex items-center gap-2 text-xs text-muted-foreground mt-3 pt-3 border-t border-border/30">
                    <PostVoteRail postId={post.id} postParam={param} score={post.score} />
                    <span className="text-border">·</span>
                    <span className="inline-flex items-center gap-1">
                        <MessageSquare className="size-3.5" />
                        {formatCount(post.commentCount)}
                    </span>
                </div>
            </div>
        </article>
    );
}

export function FeaturePostCard({ post }: { post: PublicPost }) {
    return <FeedPostCard post={post} />;
}

export function CompactPostCard({ post }: { post: PublicPost }) {
    return <FeedPostCard post={post} />;
}

export function PostCard({ post }: { post: PublicPost }) {
    return <FeedPostCard post={post} />;
}
