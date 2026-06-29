import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ThumbsUp, Zap, Award, Pencil, Flame } from "lucide-react";
import { headers } from "next/headers";

import { db } from "~/lib/db";
import { auth } from "~/lib/auth";
import { cn } from "~/lib/utils";
import { getFeed } from "~/server/actions/grinds/feed";
import { getProfileByHandle } from "~/server/actions/grinds/profile";
import { PostCard } from "~/components/grinds/post-card";
import { BackLink } from "~/components/grinds/back-link";
import { ProfileBanner } from "~/components/grinds/profile-banner";
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

    const session = await auth.api.getSession({ headers: await headers() });
    const isOwnProfile = session?.user.id === profile.id;

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
            <Card className="mb-6 p-0 gap-0 overflow-hidden bg-secondary-background">
                {/* Banner */}
                <div className="relative">
                    <ProfileBanner />
                    {isOwnProfile && (
                        <Link
                            href="/settings/profile"
                            className={cn(
                                buttonVariants({ variant: "neutral", size: "icon" }),
                                "absolute top-2 right-2 size-8"
                            )}
                            aria-label="Edit profile"
                        >
                            <Pencil className="size-3.5" />
                        </Link>
                    )}
                </div>

                <div className="px-5 pb-5 flex flex-col gap-4">
                    {/* Avatar + name — avatar overlaps banner */}
                    <div className="flex items-end gap-4 -mt-12">
                        <div className="rounded-full border-[3px] border-secondary-background outline outline-2 outline-border shrink-0">
                            <Avatar className="size-24">
                                <AvatarImage
                                    src={(profile.image ?? profile.avatar) ?? undefined}
                                    alt={profile.name}
                                />
                                <AvatarFallback className="font-bold text-3xl bg-main text-main-foreground">
                                    {profile.name[0]?.toUpperCase() ?? "U"}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="pb-1 min-w-0">
                            <h1 className="font-bold text-2xl leading-tight truncate">{profile.name}</h1>
                            <p className="text-muted-foreground text-sm font-medium">@{profile.handle}</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex rounded-base border-2 border-border overflow-hidden">
                        <div className="flex-1 flex flex-col items-center py-4 px-4 border-r-2 border-border">
                            <span className="font-bold text-3xl tabular-nums leading-none">{profile.reputation}</span>
                            <span className="text-muted-foreground text-sm flex items-center gap-1.5 mt-2">
                                <ThumbsUp className="size-4" />
                                Reputation
                            </span>
                        </div>
                        <div className="flex-1 flex flex-col items-center py-4 px-4 border-r-2 border-border">
                            <span className="font-bold text-3xl tabular-nums leading-none">{profile.exp}</span>
                            <span className="text-muted-foreground text-sm flex items-center gap-1.5 mt-2">
                                <Zap className="size-4" />
                                Exp
                            </span>
                        </div>
                        <div className="flex-1 flex flex-col items-center py-4 px-4">
                            <span className="font-bold text-3xl tabular-nums leading-none text-orange-500">{profile.loginStreak}</span>
                            <span className="text-muted-foreground text-sm flex items-center gap-1.5 mt-2">
                                <Flame className="size-4 text-orange-500" />
                                Day Streak
                            </span>
                            <span className="text-xs text-muted-foreground mt-1">Best: <span className="font-semibold text-foreground">{profile.longestStreak}</span></span>
                        </div>
                    </div>

                    {profile.badges.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {profile.badges.map((b) => (
                                <Badge key={b.id} variant="default" className="gap-1.5 px-2.5 py-1" title={b.description}>
                                    <Award className="size-3.5" />
                                    {b.label}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
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
