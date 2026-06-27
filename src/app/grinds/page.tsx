import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
    Flame,
    Clock,
    TrendingUp,
    PenSquare,
    Search,
} from "lucide-react";

import { db } from "~/lib/db";
import { getFeed, type FeedSort } from "~/server/actions/grinds/feed";
import { getPostTag } from "~/server/actions/grinds/tags";
import { FeedStream } from "~/components/grinds/feed-stream";
import { GrindsPageHeader } from "~/components/grinds/page-header";
import { EmptyState } from "~/components/grinds/empty-state";
import { BASE_URL } from "~/config/constants";
import { FEATURE_FLAGS } from "~/config/feature-flags";
import { buttonVariants } from "~/components/ui/button";
import { Badge, badgeVariants } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
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
        title: "Grinds — interview experiences, questions, and discussion",
        description:
            "Real interview experiences, questions, and discussion from the community.",
        alternates: { canonical: `${BASE_URL}/grinds` },
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

export default async function GrindsFeedPage({
    searchParams,
}: {
    searchParams: Promise<RawParams>;
}) {
    if (!FEATURE_FLAGS.GRINDS) notFound();
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
            <GrindsPageHeader
                title={
                    <span className="flex items-center gap-2">
                        Grinds
                        <Badge variant="neutral" className="text-[10px] px-1.5 py-0 h-4 font-semibold">Beta</Badge>
                    </span>
                }
                actions={
                    <>
                        <Link
                            href="/grinds/search"
                            aria-label="Search Grinds"
                            className={buttonVariants({ variant: "neutral", size: "sm" })}
                        >
                            <Search className="size-4" />
                            <span className="hidden sm:inline">Search</span>
                        </Link>
                        {FEATURE_FLAGS.LOGIN && (
                            <Link
                                href="/grinds/new"
                                className={buttonVariants({ size: "sm" })}
                            >
                                <PenSquare className="size-4" />
                                New post
                            </Link>
                        )}
                    </>
                }
            />

            <div className="mb-4 flex flex-wrap items-center gap-3">
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
                            href={`/grinds${buildQuery({ ...keep, sort: value === "hot" ? undefined : value })}`}
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

                <div className="flex flex-wrap gap-2">
                    {TYPE_FILTERS.map((f) => {
                        const active = f.value === "ALL" ? !type : type === f.value;
                        return (
                            <Link
                                key={f.value}
                                href={`/grinds${buildQuery({
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
                        href={`/grinds${buildQuery({ ...keep, company: undefined, sort: sortParam })}`}
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
                    <Link href={`/grinds/tag/${tag.slug}`} className="underline underline-offset-2">
                        view tag page
                    </Link>
                    {" · "}
                    <Link
                        href={`/grinds${buildQuery({ ...keep, tag: undefined, sort: sortParam })}`}
                        className="underline underline-offset-2"
                    >
                        clear
                    </Link>
                </p>
            )}

            {posts.length === 0 ? (
                <EmptyState>
                    No posts yet.
                    {FEATURE_FLAGS.LOGIN && (
                        <> Be the first to{" "}
                            <Link
                                href="/grinds/new"
                                className="font-semibold text-foreground underline underline-offset-2"
                            >
                                share something
                            </Link>
                            .
                        </>
                    )}
                </EmptyState>
            ) : (
                <FeedStream
                    initialPosts={posts}
                    initialCursor={nextCursor}
                    sort={sort}
                    type={type}
                    companyId={company?.id}
                    tag={tag?.slug}
                />
            )}
        </div>
    );
}
