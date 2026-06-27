import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Tag, ChevronRight } from "lucide-react";

import { db } from "~/lib/db";
import { getFeed } from "~/server/actions/grinds/feed";
import { getPostTag } from "~/server/actions/grinds/tags";
import { PostCard } from "~/components/grinds/post-card";
import { BackLink } from "~/components/grinds/back-link";
import { GrindsPageHeader } from "~/components/grinds/page-header";
import { EmptyState } from "~/components/grinds/empty-state";
import { POST_TAGS } from "~/config/grinds";
import { BASE_URL } from "~/config/constants";
import { FEATURE_FLAGS } from "~/config/feature-flags";
import { buttonVariants } from "~/components/ui/button";

type RawParams = { slug: string };
type RawSearch = { cursor?: string };

export function generateStaticParams() {
    return POST_TAGS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<RawParams>;
}): Promise<Metadata> {
    const { slug } = await params;
    const tag = await getPostTag(db, slug);
    if (!tag) return { title: "Tag not found" };
    return {
        title: `${tag.name} — interview experiences and discussion`,
        description: `Posts tagged ${tag.name}: interview experiences, questions, and discussion from the community.`,
        alternates: { canonical: `${BASE_URL}/grinds/tag/${tag.slug}` },
    };
}

export default async function GrindsTagPage({
    params,
    searchParams,
}: {
    params: Promise<RawParams>;
    searchParams: Promise<RawSearch>;
}) {
    if (!FEATURE_FLAGS.GRINDS) notFound();
    const { slug } = await params;
    const { cursor } = await searchParams;
    const tag = await getPostTag(db, slug);
    if (!tag) notFound();

    const { posts, nextCursor } = await getFeed(db, {
        sort: "new",
        tag: tag.slug,
        cursor,
    });

    return (
        <div className="w-full max-w-[800px] py-6 px-4 mx-auto">
            <BackLink href="/grinds" label="Grinds" />

            <GrindsPageHeader
                title={tag.name}
                icon={<Tag className="size-5" />}
            />

            {posts.length === 0 ? (
                <EmptyState>
                    No posts tagged{" "}
                    <span className="font-semibold text-foreground">{tag.name}</span>{" "}
                    yet.
                </EmptyState>
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
                        href={`/grinds/tag/${tag.slug}?cursor=${nextCursor}`}
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
