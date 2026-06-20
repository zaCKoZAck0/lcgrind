import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Search, ChevronLeft } from "lucide-react";

import { db } from "~/lib/db";
import { searchPosts } from "~/server/actions/discuss/search";
import { PostCard } from "~/components/discuss/post-card";
import { BASE_URL } from "~/config/constants";
import { FEATURE_FLAGS } from "~/config/feature-flags";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";

type RawParams = { q?: string };

export const metadata: Metadata = {
    title: "Search discuss",
    description: "Search interview experiences, questions, and discussion.",
    alternates: { canonical: `${BASE_URL}/discuss/search` },
    robots: { index: false, follow: true },
};

export default async function DiscussSearchPage({
    searchParams,
}: {
    searchParams: Promise<RawParams>;
}) {
    if (!FEATURE_FLAGS.DISCUSS) notFound();
    const { q } = await searchParams;
    const query = q?.trim() ?? "";
    const posts = query ? await searchPosts(db, { q: query, limit: 30 }) : [];

    return (
        <div className="w-full max-w-[800px] py-6 px-4 mx-auto">
            <Link
                href="/discuss"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
                <ChevronLeft className="size-4" />
                Discuss
            </Link>

            <form action="/discuss/search" method="get" className="mb-6">
                <Card className="flex-row items-center p-0 gap-0 py-0 overflow-hidden shadow-shadow">
                    <Search className="size-4 mx-3 text-muted-foreground shrink-0" />
                    <Input
                        name="q"
                        defaultValue={query}
                        placeholder="Search posts…"
                        autoComplete="off"
                        className="flex-1 border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent"
                    />
                    <Button
                        type="submit"
                        className="rounded-none border-0 border-l-2 border-border shadow-none hover:shadow-none hover:translate-x-0 hover:translate-y-0"
                    >
                        Search
                    </Button>
                </Card>
            </form>

            {query === "" ? (
                <p className="text-sm text-muted-foreground">
                    Type a query to search interview experiences, questions, and discussion.
                </p>
            ) : posts.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        No posts match{" "}
                        <span className="font-semibold text-foreground">{query}</span>.
                    </CardContent>
                </Card>
            ) : (
                <div className="flex flex-col gap-4">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
}
