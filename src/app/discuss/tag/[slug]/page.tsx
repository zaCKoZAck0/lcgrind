import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Tag, ChevronLeft, ChevronRight } from "lucide-react";

import { db } from "~/lib/db";
import { getFeed } from "~/server/actions/discuss/feed";
import { getPostTag } from "~/server/actions/discuss/tags";
import { PostCard } from "~/components/discuss/post-card";
import { POST_TAGS } from "~/config/discuss";
import { BASE_URL } from "~/config/constants";
import { FEATURE_FLAGS } from "~/config/feature-flags";
import { buttonVariants } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

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
        alternates: { canonical: `${BASE_URL}/discuss/tag/${tag.slug}` },
    };
}

export default async function DiscussTagPage({
    params,
    searchParams,
}: {
    params: Promise<RawParams>;
    searchParams: Promise<RawSearch>;
}) {
    if (!FEATURE_FLAGS.DISCUSS) notFound();
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
            <Link
                href="/discuss"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
                <ChevronLeft className="size-4" />
                Discuss
            </Link>

            <div className="mb-6 flex items-center gap-2">
                <Tag className="size-5" />
                <h1 className="font-bold text-2xl">{tag.name}</h1>
            </div>

            {posts.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        No posts tagged{" "}
                        <span className="font-semibold text-foreground">{tag.name}</span>{" "}
                        yet.
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
                        href={`/discuss/tag/${tag.slug}?cursor=${nextCursor}`}
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
