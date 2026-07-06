import type { PrismaClient } from "@prisma/client";

import { computeHotRank } from "~/server/actions/votes/core";

/**
 * Roll up all PostView rows for closed days (day < today UTC) into:
 *   - PostViewDaily aggregates per (postId, day)
 *   - Post.viewCount / Post.signedInViewCount increments
 *   - Delete the raw PostView rows that were rolled up
 *
 * Runs inside a single transaction with a Postgres advisory lock so concurrent
 * invocations serialize rather than double-count.  Returns the count of raw
 * rows consumed.
 */
export async function rollupViews(db: PrismaClient): Promise<number> {
    const todayUtc = new Date();
    todayUtc.setUTCHours(0, 0, 0, 0);

    return db.$transaction(async (tx) => {
        // Serialize concurrent rollup invocations within Postgres.
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('post_view_rollup'))`;

        // Aggregate closed-day rows by (postId, day, signedIn) — DB does the counting.
        const groups = await tx.postView.groupBy({
            by: ["postId", "day", "signedIn"],
            where: { day: { lt: todayUtc } },
            _count: { _all: true },
        });

        if (groups.length === 0) return 0;

        // Reduce to (postId, day) buckets for upsert; track total row count.
        const agg = new Map<
            string,
            { postId: string; day: Date; views: number; signedInViews: number }
        >();
        let totalRows = 0;

        for (const g of groups) {
            const key = `${g.postId}::${g.day.toISOString()}`;
            if (!agg.has(key)) {
                agg.set(key, { postId: g.postId, day: g.day, views: 0, signedInViews: 0 });
            }
            const entry = agg.get(key)!;
            entry.views += g._count._all;
            if (g.signedIn) entry.signedInViews += g._count._all;
            totalRows += g._count._all;
        }

        // Upsert PostViewDaily; accumulate per-postId totals for a single counter update.
        const postTotals = new Map<string, { views: number; signedInViews: number }>();
        for (const { postId, day, views, signedInViews } of agg.values()) {
            await tx.postViewDaily.upsert({
                where: { postId_day: { postId, day } },
                create: { postId, day, views, signedInViews },
                update: {
                    views: { increment: views },
                    signedInViews: { increment: signedInViews },
                },
            });

            const t = postTotals.get(postId) ?? { views: 0, signedInViews: 0 };
            t.views += views;
            t.signedInViews += signedInViews;
            postTotals.set(postId, t);
        }

        // One counter update per unique post (not per day bucket). Batch-fetch the
        // current counters, then recompute hotRank against the post-increment values
        // so view accumulation shifts feed ordering.
        const posts = await tx.post.findMany({
            where: { id: { in: [...postTotals.keys()] } },
            select: { id: true, score: true, createdAt: true, viewCount: true, signedInViewCount: true },
        });
        for (const post of posts) {
            const { views, signedInViews } = postTotals.get(post.id)!;
            // Concurrency note: hotRank writes here race with castVoteCore's update (no shared lock);
            // last-write-wins is acceptable because the next vote or rollup recomputes from fresh values.
            await tx.post.update({
                where: { id: post.id },
                data: {
                    viewCount: { increment: views },
                    signedInViewCount: { increment: signedInViews },
                    hotRank: computeHotRank(
                        post.score,
                        post.createdAt,
                        post.viewCount + views,
                        post.signedInViewCount + signedInViews,
                    ),
                },
            });
        }

        // Delete all closed-day raw rows (no id list needed — predicate is sufficient).
        await tx.postView.deleteMany({ where: { day: { lt: todayUtc } } });

        return totalRows;
    }, { timeout: 60_000 });
}
