import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Search } from "lucide-react";

import { db } from "~/lib/db";
import { searchPosts } from "~/server/actions/grinds/search";
import { PostFeedList } from "~/components/grinds/post-feed-list";
import { BackLink } from "~/components/grinds/back-link";
import { EmptyState } from "~/components/grinds/empty-state";
import { BASE_URL } from "~/config/constants";
import { FEATURE_FLAGS } from "~/config/feature-flags";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card } from "~/components/ui/card";

type RawParams = { q?: string };

export const metadata: Metadata = {
    title: "Search Grinds",
    description: "Search interview experiences, questions, and discussion.",
    alternates: { canonical: `${BASE_URL}/grinds/search` },
    robots: { index: false, follow: true },
};

export default async function GrindsSearchPage({
    searchParams,
}: {
    searchParams: Promise<RawParams>;
}) {
    if (!FEATURE_FLAGS.GRINDS) notFound();
    const { q } = await searchParams;
    const query = q?.trim() ?? "";
    const posts = query ? await searchPosts(db, { q: query, limit: 30 }) : [];

    return (
        <div className="w-full max-w-[800px] py-6 px-4 mx-auto">
            <BackLink href="/grinds" label="Grinds" />

            <form action="/grinds/search" method="get" className="mb-6">
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
                <EmptyState>
                    No posts match{" "}
                    <span className="font-semibold text-foreground">{query}</span>.
                </EmptyState>
            ) : (
                <PostFeedList posts={posts} />
            )}
        </div>
    );
}
