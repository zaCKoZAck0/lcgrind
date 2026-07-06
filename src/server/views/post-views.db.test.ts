import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { rollupViews } from "./rollup";

const db = new PrismaClient({
    datasourceUrl:
        process.env.DATABASE_URL ??
        "postgresql://myuser:mypassword@localhost:5432/mydb",
});

const RUN = Date.now().toString(36);
const AUTHOR_ID = `vitest-view-author-${RUN}`;
const POST_A_SLUG = `vitest-view-post-a-${RUN}`;
const POST_B_SLUG = `vitest-view-post-b-${RUN}`;
let postAId: string;
let postBId: string;

/** UTC midnight for a given YYYY-MM-DD string */
function utcDay(iso: string): Date {
    return new Date(`${iso}T00:00:00.000Z`);
}

beforeAll(async () => {
    await db.user.create({
        data: { id: AUTHOR_ID, name: "View Tester", email: `${AUTHOR_ID}@example.test` },
    });
    const postA = await db.post.create({
        data: {
            type: "DISCUSSION",
            authorId: AUTHOR_ID,
            title: "View test post A",
            slug: POST_A_SLUG,
            body: "Post A body.",
        },
        select: { id: true },
    });
    postAId = postA.id;
    const postB = await db.post.create({
        data: {
            type: "DISCUSSION",
            authorId: AUTHOR_ID,
            title: "View test post B",
            slug: POST_B_SLUG,
            body: "Post B body.",
        },
        select: { id: true },
    });
    postBId = postB.id;
});

afterAll(async () => {
    await db.postView.deleteMany({ where: { postId: { in: [postAId, postBId] } } });
    await db.postViewDaily.deleteMany({ where: { postId: { in: [postAId, postBId] } } });
    await db.post.deleteMany({ where: { authorId: AUTHOR_ID } });
    await db.user.deleteMany({ where: { id: AUTHOR_ID } });
    await db.$disconnect();
});

describe("PostView — deduplicate", () => {
    it("inserting same (postId, viewerKey, day) twice results in one row", async () => {
        const day = utcDay("2026-01-01");
        const viewerKey = `dedup-key-${RUN}`;

        await db.postView.create({ data: { postId: postAId, viewerKey, day, signedIn: false } });
        await db.postView
            .create({ data: { postId: postAId, viewerKey, day, signedIn: false } })
            .catch((err: { code?: string }) => {
                // Expected P2002 — unique constraint
                if (err?.code !== "P2002") throw err;
            });

        const count = await db.postView.count({
            where: { postId: postAId, viewerKey, day },
        });
        expect(count).toBe(1);

        // Cleanup so rollup tests start clean.
        await db.postView.deleteMany({ where: { postId: postAId, viewerKey, day } });
    });
});

describe("rollupViews — math and retention", () => {
    it("rolls up closed-day rows, leaves today untouched, and updates Post counters", async () => {
        const day1 = utcDay("2026-01-02");
        const day2 = utcDay("2026-01-03");

        // Compute a date that is definitely "today" UTC — rollup must skip it.
        const todayUtc = new Date();
        todayUtc.setUTCHours(0, 0, 0, 0);

        // Seed: postA — 2 views day1 (1 signedIn), 1 view day2 (0 signedIn)
        //       postB — 1 signed-in view day1
        //       both posts — 1 view today (must NOT be rolled up)
        await db.postView.createMany({
            data: [
                { postId: postAId, viewerKey: `k1-${RUN}`, day: day1, signedIn: true },
                { postId: postAId, viewerKey: `k2-${RUN}`, day: day1, signedIn: false },
                { postId: postAId, viewerKey: `k3-${RUN}`, day: day2, signedIn: false },
                { postId: postBId, viewerKey: `k4-${RUN}`, day: day1, signedIn: true },
                { postId: postAId, viewerKey: `k5-${RUN}`, day: todayUtc, signedIn: true },
                { postId: postBId, viewerKey: `k6-${RUN}`, day: todayUtc, signedIn: false },
            ],
        });

        const rolledUp = await rollupViews(db);

        // 4 closed-day rows consumed (day1×3 + day2×1).
        expect(rolledUp).toBe(4);

        // PostViewDaily for postA day1: 2 views, 1 signedIn
        const adDay1 = await db.postViewDaily.findUnique({
            where: { postId_day: { postId: postAId, day: day1 } },
        });
        expect(adDay1?.views).toBe(2);
        expect(adDay1?.signedInViews).toBe(1);

        // PostViewDaily for postA day2: 1 view, 0 signedIn
        const adDay2 = await db.postViewDaily.findUnique({
            where: { postId_day: { postId: postAId, day: day2 } },
        });
        expect(adDay2?.views).toBe(1);
        expect(adDay2?.signedInViews).toBe(0);

        // PostViewDaily for postB day1: 1 view, 1 signedIn
        const bdDay1 = await db.postViewDaily.findUnique({
            where: { postId_day: { postId: postBId, day: day1 } },
        });
        expect(bdDay1?.views).toBe(1);
        expect(bdDay1?.signedInViews).toBe(1);

        // Post counters: postA total=3, signedIn=1; postB total=1, signedIn=1
        const postA = await db.post.findUniqueOrThrow({
            where: { id: postAId },
            select: { viewCount: true, signedInViewCount: true },
        });
        expect(postA.viewCount).toBe(3);
        expect(postA.signedInViewCount).toBe(1);

        const postB = await db.post.findUniqueOrThrow({
            where: { id: postBId },
            select: { viewCount: true, signedInViewCount: true },
        });
        expect(postB.viewCount).toBe(1);
        expect(postB.signedInViewCount).toBe(1);

        // Raw rows for closed days deleted.
        const remainingClosed = await db.postView.count({
            where: {
                postId: { in: [postAId, postBId] },
                day: { lt: todayUtc },
            },
        });
        expect(remainingClosed).toBe(0);

        // Today's raw rows untouched.
        const todayRows = await db.postView.count({
            where: {
                postId: { in: [postAId, postBId] },
                day: { gte: todayUtc },
            },
        });
        expect(todayRows).toBe(2);
    });
});
