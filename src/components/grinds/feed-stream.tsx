"use client";

import { useEffect, useRef, useState } from "react";
import type { PublicPost } from "~/server/actions/posts/core";
import type { FeedSort } from "~/server/actions/grinds/feed";
import { getFeedPage } from "~/server/actions/grinds/getFeedPage";
import { FeedVotes } from "./feed-votes";
import { FeedPostCard } from "./post-card";
import { Button } from "~/components/ui/button";

export function FeedStream({
    initialPosts,
    initialCursor,
    sort,
    type,
    companyId,
    tag,
}: {
    initialPosts: PublicPost[];
    initialCursor: string | null;
    sort: FeedSort;
    type?: string;
    companyId?: number;
    tag?: string;
}) {
    const [posts, setPosts] = useState(initialPosts);
    const [cursor, setCursor] = useState(initialCursor);
    const [loading, setLoading] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);

    const loadMore = async () => {
        if (!cursor || loading) return;
        setLoading(true);
        try {
            const page = await getFeedPage({ sort, type, companyId, tag, cursor });
            setPosts((prev) => [...prev, ...page.posts]);
            setCursor(page.nextCursor);
        } catch {
            // silently ignore — user can retry via button
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el || !cursor) return;
        const obs = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) loadMore();
            },
            { rootMargin: "200px" },
        );
        obs.observe(el);
        return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cursor, loading]);

    const postIds = posts.map((p) => p.id);

    return (
        <FeedVotes postIds={postIds}>
            <div className="flex flex-col gap-3">
                {posts.map((post, i) => (
                    <div key={post.id}>
                        <FeedPostCard post={post} />
                        {post.isPinned && !posts[i + 1]?.isPinned && posts[i + 1] && (
                            <div className="mt-3" />
                        )}
                    </div>
                ))}
            </div>

            {cursor && (
                <div ref={sentinelRef} className="mt-6 flex justify-center">
                    <Button
                        variant="neutral"
                        onClick={loadMore}
                        disabled={loading}
                    >
                        {loading ? "Loading…" : "Load more"}
                    </Button>
                </div>
            )}
        </FeedVotes>
    );
}
