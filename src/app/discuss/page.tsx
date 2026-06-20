import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
    Flame,
    Clock,
    TrendingUp,
    PenSquare,
    ChevronRight,
    Search,
} from "lucide-react";

import { db } from "~/lib/db";
import { getFeed, type FeedSort } from "~/server/actions/discuss/feed";
import { getPostTag } from "~/server/actions/discuss/tags";
import { PostCard } from "~/components/discuss/post-card";
import { BASE_URL } from "~/config/constants";
import { FEATURE_FLAGS } from "~/config/feature-flags";
import { buttonVariants } from "~/components/ui/button";
import { Badge, badgeVariants } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";

type RawParams = {
    sort?: string;
    type?: string;
    company?: string;
    tag?: string;
    cursor?: string;
};

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<RawParams>;
}): Promise<Metadata> {
    const { type, company, tag, cursor, sort } = await searchParams;
    const filtered = Boolean(
        type || company || tag || cursor || sort === "new" || sort === "top",
    );
    return {
        title: "Discuss — interview experiences, questions, and discussion",
        description:
            "Real interview experiences, questions, and discussion from the community.",
        alternates: { canonical: `${BASE_URL}/discuss` },
        ...(filtered ? { robots: { index: false, follow: true } } : {}),
    };
}

function buildQuery(params: Record<string, string | undefined>): string {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
        if (v) sp.set(k, v);
    }
    const s = sp.toString();
    return s ? `?${s}` : "";
}

const TYPE_FILTERS: { value: string; label: string }[] = [
    { value: "ALL", label: "All" },
    { value: "EXPERIENCE", label: "Experiences" },
];

export default async function DiscussFeedPage({
    searchParams,
}: {
    searchParams: Promise<RawParams>;
}) {
    if (!FEATURE_FLAGS.DISCUSS) notFound();
    const raw = await searchParams;
    const sort: FeedSort =
        raw.sort === "new" ? "new" : raw.sort === "top" ? "top" : "hot";
    const type = raw.type === "EXPERIENCE" ? "EXPERIENCE" : undefined;
    const companySlug = raw.company?.trim() || undefined;
    const tagSlug = raw.tag?.trim() || undefined;

    const company = companySlug
        ? await db.company.findUnique({
              where: { slug: companySlug },
              select: { id: true, name: true },
          })
        : null;

    const tag = tagSlug ? await getPostTag(db, tagSlug) : null;

    const { posts, nextCursor } = await getFeed(db, {
        sort,
        type,
        companyId: company?.id,
        tag: tag?.slug,
        cursor: raw.cursor,
    });

    const keep = { type: raw.type, company: companySlug, tag: tag?.slug };
    const sortParam = sort === "hot" ? undefined : sort;

    return (
        <div className="w-full max-w-[800px] py-6 px-4 mx-auto">
            <div className="mb-6 flex items-center justify-between gap-4">
                <h1 className="font-bold text-2xl">Discuss</h1>
                <div className="flex items-center gap-2">
                    <Link
                        href="/discuss/search"
                        aria-label="Search discuss"
                        className={buttonVariants({ variant: "neutral", size: "sm" })}
                    >
                        <Search className="size-4" />
                        <span className="hidden sm:inline">Search</span>
                    </Link>
                    {FEATURE_FLAGS.LOGIN && (
                        <Link
                            href="/discuss/new"
                            className={buttonVariants({ size: "sm" })}
                        >
                            <PenSquare className="size-4" />
                            New post
                        </Link>
                    )}
                </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3">
                {/* Sort segmented control */}
                <Card className="flex-row shadow-none py-0 gap-0 w-fit">
                    {(
                        [
                            { value: "hot", label: "Hot", icon: Flame },
                            { value: "new", label: "New", icon: Clock },
                            { value: "top", label: "Top", icon: TrendingUp },
                        ] as const
                    ).map(({ value, label, icon: Icon }, i) => (
                        <Link
                            key={value}
                            href={`/discuss${buildQuery({ ...keep, sort: value === "hot" ? undefined : value })}`}
                            className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold",
                                i > 0 && "border-l-2 border-border",
                                sort === value
                                    ? "bg-main text-main-foreground"
                                    : "text-muted-foreground",
                            )}
                        >
                            <Icon className="size-4" />
                            {label}
                        </Link>
                    ))}
                </Card>

                {/* Type filter chips */}
                <div className="flex flex-wrap gap-2">
                    {TYPE_FILTERS.map((f) => {
                        const active = f.value === "ALL" ? !type : type === f.value;
                        return (
                            <Link
                                key={f.value}
                                href={`/discuss${buildQuery({
                                    company: companySlug,
                                    tag: tagSlug,
                                    sort: sortParam,
                                    type: f.value === "ALL" ? undefined : f.value,
                                })}`}
                                className={badgeVariants({ variant: active ? "default" : "neutral" })}
                            >
                                {f.label}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {company && (
                <p className="mb-4 text-sm text-muted-foreground">
                    Filtered to <span className="font-semibold">{company.name}</span>
                    {" · "}
                    <Link
                        href={`/discuss${buildQuery({ ...keep, company: undefined, sort: sortParam })}`}
                        className="underline underline-offset-2"
                    >
                        clear
                    </Link>
                </p>
            )}

            {tag && (
                <p className="mb-4 text-sm text-muted-foreground">
                    Tagged <span className="font-semibold">{tag.name}</span>
                    {" · "}
                    <Link href={`/discuss/tag/${tag.slug}`} className="underline underline-offset-2">
                        view tag page
                    </Link>
                    {" · "}
                    <Link
                        href={`/discuss${buildQuery({ ...keep, tag: undefined, sort: sortParam })}`}
                        className="underline underline-offset-2"
                    >
                        clear
                    </Link>
                </p>
            )}

            {posts.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        No posts yet.
                        {FEATURE_FLAGS.LOGIN && (
                            <> Be the first to{" "}
                                <Link
                                    href="/discuss/new"
                                    className="font-semibold text-foreground underline underline-offset-2"
                                >
                                    share something
                                </Link>
                                .
                            </>
                        )}
                    </CardContent>
                </Card>
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
                        href={`/discuss${buildQuery({
                            ...keep,
                            sort: sortParam,
                            cursor: nextCursor,
                        })}`}
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
