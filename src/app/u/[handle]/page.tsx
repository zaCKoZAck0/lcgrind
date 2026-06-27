import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ArrowBigUp, Trophy, Award } from "lucide-react";

import { db } from "~/lib/db";
import { getFeed } from "~/server/actions/grinds/feed";
import { getProfileByHandle } from "~/server/actions/grinds/profile";
import { PostCard } from "~/components/grinds/post-card";
import { BackLink } from "~/components/grinds/back-link";
import { EmptyState } from "~/components/grinds/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { buttonVariants } from "~/components/ui/button";
import { BASE_URL } from "~/config/constants";
import { FEATURE_FLAGS } from "~/config/feature-flags";

type RawParams = { handle: string };
type RawSearch = { cursor?: string };

export async function generateMetadata({
    params,
}: {
    params: Promise<RawParams>;
}): Promise<Metadata> {
    const { handle } = await params;
    const profile = await getProfileByHandle(db, handle);
    if (!profile) return { title: "Profile not found" };
    return {
        title: `@${profile.handle} — interview experiences and discussion`,
        description: `Interview experiences and community posts from @${profile.handle}.`,
        alternates: { canonical: `${BASE_URL}/u/${profile.handle}` },
    };
}

export default async function UserProfilePage({
    params,
    searchParams,
}: {
    params: Promise<RawParams>;
    searchParams: Promise<RawSearch>;
}) {
    const { handle } = await params;
    const { cursor } = await searchParams;

    const profile = await getProfileByHandle(db, handle);
    if (!profile) notFound();

    const feedPosts = FEATURE_FLAGS.GRINDS ? await getFeed(db, {
        sort: "new",
        authorId: profile.id,
        cursor,
    }) : { posts: [], nextCursor: null };
    const { posts, nextCursor } = feedPosts;

    return (
        <div className="w-full max-w-[800px] py-6 px-4 mx-auto">
            {FEATURE_FLAGS.GRINDS && (
                <BackLink href="/grinds" label="Grinds" />
            )}

            {/* Profile header */}
            <Card className="mb-6 p-4 gap-4">
                <div className="flex items-center gap-3">
                    <Avatar className="size-12">
                        <AvatarImage
                            src={profile.avatar ?? undefined}
                            alt={`@${profile.handle}`}
                        />
                        <AvatarFallback className="font-bold text-lg">
                            {profile.handle[0]?.toUpperCase() ?? "U"}
                        </AvatarFallback>
                    </Avatar>
                    <h1 className="font-bold text-xl">@{profile.handle}</h1>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Badge variant="neutral" className="gap-1.5 px-3 py-1.5 text-sm">
                        <ArrowBigUp className="size-4 text-muted-foreground" />
                        <span className="font-bold tabular-nums">{profile.karma}</span>
                        <span className="text-muted-foreground">karma</span>
                    </Badge>
                    <Badge variant="neutral" className="gap-1.5 px-3 py-1.5 text-sm">
                        <Trophy className="size-4 text-main" />
                        <span className="font-bold tabular-nums">{profile.points}</span>
                        <span className="text-muted-foreground">points</span>
                    </Badge>
                </div>

                {profile.badges.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {profile.badges.map((b) => (
                            <Badge key={b.id} variant="neutral" className="gap-1" title={b.description}>
                                <Award className="size-3.5" />
                                {b.label}
                            </Badge>
                        ))}
                    </div>
                )}
            </Card>

            {posts.length === 0 ? (
                <EmptyState>No public posts yet.</EmptyState>
            ) : (
                <div className="flex flex-col gap-4">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            )}

            {nextCursor && (
                <div className="mt-6 flex justify-center">
                    <Link
                        href={`/u/${profile.handle}?cursor=${nextCursor}`}
                        className={buttonVariants({ variant: "neutral" })}
                    >
                        Next
                        <ChevronRight className="size-4" />
                    </Link>
                </div>
            )}
        </div>
    );
}
