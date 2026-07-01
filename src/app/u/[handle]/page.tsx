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
import { PostFeedList } from "~/components/grinds/post-feed-list";
import { BackLink } from "~/components/grinds/back-link";
import { ProfileBanner } from "~/components/grinds/profile-banner";
import { EmptyState } from "~/components/grinds/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { buttonVariants } from "~/components/ui/button";
import { BASE_URL } from "~/config/constants";
import { FEATURE_FLAGS } from "~/config/feature-flags";
import { StreakCalendar } from "~/components/grinds/streak-calendar";

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

                {/* Avatar + name — avatar overlaps banner */}
                <div className="px-5 pb-4 flex items-end gap-4 -mt-12">
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
                        {/* Handle + compact stats (count + icon only; label in tooltip) on one line
                            so the name column stays two lines and never overlaps the banner. */}
                        <div className="flex items-center gap-3 min-w-0">
                            <p className="text-muted-foreground text-sm font-medium truncate">@{profile.handle}</p>
                            <TooltipProvider>
                                <div className="flex items-center gap-3 shrink-0">
                                    <Tooltip>
                                        <TooltipTrigger
                                            aria-label="Reputation"
                                            className="flex items-center gap-1 text-sm font-semibold tabular-nums text-muted-foreground cursor-default"
                                        >
                                            {profile.reputation}
                                            <ThumbsUp className="size-3.5" />
                                        </TooltipTrigger>
                                        <TooltipContent>Reputation</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger
                                            aria-label="Exp"
                                            className="flex items-center gap-1 text-sm font-semibold tabular-nums text-muted-foreground cursor-default"
                                        >
                                            {profile.exp}
                                            <Zap className="size-3.5" />
                                        </TooltipTrigger>
                                        <TooltipContent>Exp</TooltipContent>
                                    </Tooltip>
                                </div>
                            </TooltipProvider>
                        </div>
                    </div>
                </div>

                {/* Streak — one compact row: Day Streak + Best on the left, the
                    Last 7 Days calendar on the right (stacks on narrow screens). */}
                <div className="border-t-2 border-border px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-x-6 gap-y-3">
                    <div className="flex items-center gap-5 shrink-0">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-10 items-center justify-center rounded-base border-2 border-orange-400 bg-orange-100 shrink-0">
                                <Flame className="size-5 text-orange-500 fill-orange-400" />
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="font-bold text-2xl tabular-nums text-orange-500">{profile.loginStreak}</span>
                                <span className="text-muted-foreground text-xs font-medium mt-1">Day Streak</span>
                            </div>
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="font-bold text-xl tabular-nums">{profile.longestStreak}</span>
                            <span className="text-muted-foreground text-xs mt-1">Best</span>
                        </div>
                    </div>
                    <div className="w-full sm:w-[280px] shrink-0">
                        <StreakCalendar loginStreak={profile.loginStreak} lastSeenOn={profile.lastSeenOn} />
                    </div>
                </div>

                {profile.badges.length > 0 && (
                    <div className="px-5 py-4 border-t-2 border-border flex flex-wrap gap-2">
                        {profile.badges.map((b) => (
                            <Badge key={b.id} variant="default" className="gap-1.5 px-2.5 py-1" title={b.description}>
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
                <PostFeedList posts={posts} />
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
