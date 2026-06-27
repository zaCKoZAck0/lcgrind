import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { getFeed } from "./feed";

const db = new PrismaClient({
    datasourceUrl:
        process.env.DATABASE_URL ??
        "postgresql://myuser:mypassword@localhost:5432/mydb",
});

const RUN = Date.now().toString(36);
const U = `vitest-feed-user-${RUN}`;
const COMPANY = `vitest-feed-co-${RUN}`;
let companyId: number;
// Posts, keyed for readable assertions.
const ids: Record<string, string> = {};

// Distinct createdAt so "new" ordering is unambiguous.
const t0 = new Date("2026-01-01T00:00:00Z");
const t1 = new Date("2026-02-01T00:00:00Z");
const t2 = new Date("2026-03-01T00:00:00Z");
const t3 = new Date("2026-04-01T00:00:00Z");

beforeAll(async () => {
    await db.user.create({
        data: { id: U, name: "Feed", email: `${U}@example.test`, handle: U.slice(0, 18) },
    });
    const co = await db.company.create({
        data: { slug: COMPANY, name: "Feed Co" },
        select: { id: true },
    });
    companyId = co.id;

    const mk = async (
        key: string,
        data: {
            type: string;
            hotRank: number;
            createdAt: Date;
            companyId?: number;
            status?: string;
            score?: number;
        },
    ) => {
        const p = await db.post.create({
            data: {
                type: data.type,
                authorId: U,
                title: `Feed post ${key}`,
                slug: `feed-post-${key}-${RUN}`,
                body: "Body.",
                hotRank: data.hotRank,
                score: data.score ?? 0,
                createdAt: data.createdAt,
                companyId: data.companyId ?? null,
                status: data.status ?? "PUBLISHED",
            },
            select: { id: true },
        });
        ids[key] = p.id;
    };

    // A, B, C, D share this test's company so the global feed queries can be
    // isolated to them (vitest runs db test files in parallel against one DB).
    // Scores are deliberately ordered differently from hotRank/createdAt so the
    // Top sort (score desc) is distinguishable: Top = [A, C, B].
    await mk("A", { type: "EXPERIENCE", hotRank: 100, createdAt: t1, companyId, score: 50 });
    await mk("B", { type: "DISCUSSION", hotRank: 300, createdAt: t2, companyId, score: 10 });
    await mk("C", { type: "QUESTION", hotRank: 200, createdAt: t3, companyId, score: 30 });
    // High hotRank + newest but tombstoned: must never appear.
    await mk("D", {
        type: "DISCUSSION",
        hotRank: 999,
        createdAt: t0,
        companyId,
        status: "TOMBSTONED",
    });
    // A published post in NO company — proves the company filter excludes it.
    await mk("E", { type: "DISCUSSION", hotRank: 250, createdAt: t3 });
});

afterAll(async () => {
    await db.post.deleteMany({ where: { authorId: U } });
    await db.company.deleteMany({ where: { id: companyId } });
    await db.user.deleteMany({ where: { id: U } });
    await db.$disconnect();
});

describe("getFeed", () => {
    it("defaults to Hot order (by hotRank desc) and excludes non-published posts", async () => {
        const { posts } = await getFeed(db, { companyId, limit: 10 });
        const got = posts.map((p) => p.id);
        // B(300) > C(200) > A(100); D is tombstoned and absent.
        expect(got).toEqual([ids.B, ids.C, ids.A]);
        expect(got).not.toContain(ids.D);
    });

    it("New order sorts by recency (createdAt desc)", async () => {
        const { posts } = await getFeed(db, {
            sort: "new",
            companyId,
            limit: 10,
        });
        expect(posts.map((p) => p.id)).toEqual([ids.C, ids.B, ids.A]);
    });

    it("Top order sorts by score desc", async () => {
        const { posts } = await getFeed(db, {
            sort: "top",
            companyId,
            limit: 10,
        });
        // A(50) > C(30) > B(10); D tombstoned and absent.
        expect(posts.map((p) => p.id)).toEqual([ids.A, ids.C, ids.B]);
    });

    it("filters by post type", async () => {
        const { posts } = await getFeed(db, {
            type: "DISCUSSION",
            companyId,
            limit: 10,
        });
        // Only B — D is the other DISCUSSION but it's tombstoned.
        expect(posts.map((p) => p.id)).toEqual([ids.B]);
    });

    it("filters by company (excludes posts in no/other company)", async () => {
        const { posts } = await getFeed(db, { companyId, limit: 10 });
        const got = posts.map((p) => p.id);
        expect(got).toEqual([ids.B, ids.C, ids.A]);
        // E is published but carries no company → filtered out.
        expect(got).not.toContain(ids.E);
    });

    it("paginates with a stable cursor (no offset drift)", async () => {
        const page1 = await getFeed(db, { companyId, limit: 2 });
        expect(page1.posts.map((p) => p.id)).toEqual([ids.B, ids.C]);
        expect(page1.nextCursor).toBe(ids.C);

        const page2 = await getFeed(db, {
            companyId,
            limit: 2,
            cursor: page1.nextCursor!,
        });
        expect(page2.posts.map((p) => p.id)).toEqual([ids.A]);
        expect(page2.nextCursor).toBeNull();
    });

    it("serializes feed posts through the public leak boundary (month dates, no exact timestamp)", async () => {
        const { posts } = await getFeed(db, { companyId, limit: 1 });
        const json = JSON.stringify(posts[0]);
        expect(posts[0].createdMonth).toMatch(/^\d{4}-\d{2}$/);
        expect(json).not.toContain("createdAt");
    });
});
