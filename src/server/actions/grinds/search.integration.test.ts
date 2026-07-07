import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { searchPosts, findSimilarPosts } from "./search";

const db = new PrismaClient({
    datasourceUrl:
        process.env.DATABASE_URL ??
        "postgresql://myuser:mypassword@localhost:5432/mydb",
});

const RUN = Date.now().toString(36);
const U = `vitest-search-user-${RUN}`;
// A rare token only this test's posts carry, so the AND-semantics query
// (`${RARE} binary tree`) matches this test's rows and never the rows other
// parallel db tests insert. Lowercase alnum so Postgres tokenizes it as one
// lexeme.
const RARE = `srchtok${RUN}`.replace(/[^a-z0-9]/g, "");
const Q = `${RARE} binary tree`;

const ids: Record<string, string> = {};

// Equal createdAt for the relevance/score cases; a later one only for the
// recency-tiebreak case so its effect is isolated.
const tBase = new Date("2026-01-01T00:00:00Z");
const tNewer = new Date("2026-05-01T00:00:00Z");

beforeAll(async () => {
    await db.user.create({
        data: {
            id: U,
            name: "Search",
            email: `${U}@example.test`,
            handle: U.slice(0, 18),
        },
    });

    const mk = async (
        key: string,
        data: {
            title: string;
            body: string;
            score?: number;
            status?: string;
            createdAt?: Date;
        },
    ) => {
        const p = await db.post.create({
            data: {
                type: "DISCUSSION",
                authorId: U,
                title: data.title,
                slug: `search-${key}-${RUN}`,
                body: data.body,
                score: data.score ?? 0,
                status: data.status ?? "PUBLISHED",
                createdAt: data.createdAt ?? tBase,
            },
            select: { id: true },
        });
        ids[key] = p.id;
    };

    // TITLE vs BODY at equal score: title match (weight A) must outrank a
    // body-only match (weight B).
    await mk("title", { title: `${RARE} binary tree traversal`, body: "see above", score: 0 });
    await mk("body", { title: "completely unrelated heading", body: `${RARE} binary tree notes`, score: 0 });

    // Equal title text, different score: higher score blends ahead.
    await mk("hiScore", { title: `${RARE} binary tree alpha`, body: "x", score: 80 });
    await mk("loScore", { title: `${RARE} binary tree beta`, body: "x", score: 4 });

    // Equal title text + equal score, different recency: newer blends ahead.
    await mk("older", { title: `${RARE} binary tree gamma`, body: "x", score: 10, createdAt: tBase });
    await mk("newer", { title: `${RARE} binary tree delta`, body: "x", score: 10, createdAt: tNewer });

    // Non-public statuses that still match the query must never surface.
    await mk("removed", { title: `${RARE} binary tree removed`, body: "x", score: 999, status: "REMOVED" });
    await mk("tomb", { title: `${RARE} binary tree tomb`, body: "x", score: 999, status: "TOMBSTONED" });
    await mk("shadow", { title: `${RARE} binary tree shadow`, body: "x", score: 999, status: "SHADOW" });
}, 30000);

afterAll(async () => {
    await db.post.deleteMany({ where: { authorId: U } });
    await db.user.deleteMany({ where: { id: U } });
    await db.$disconnect();
});

describe("searchPosts", () => {
    it("ranks a title match above a body-only match at equal score", async () => {
        const posts = await searchPosts(db, { q: Q, limit: 50 });
        const got = posts.map((p) => p.id);
        expect(got.indexOf(ids.title)).toBeLessThan(got.indexOf(ids.body));
        expect(got.indexOf(ids.title)).toBeGreaterThanOrEqual(0);
    });

    it("blends score: higher score ranks ahead among equally relevant titles", async () => {
        const posts = await searchPosts(db, { q: Q, limit: 50 });
        const got = posts.map((p) => p.id);
        expect(got.indexOf(ids.hiScore)).toBeLessThan(got.indexOf(ids.loScore));
    });

    it("blends recency: newer ranks ahead when text and score tie", async () => {
        const posts = await searchPosts(db, { q: Q, limit: 50 });
        const got = posts.map((p) => p.id);
        expect(got.indexOf(ids.newer)).toBeLessThan(got.indexOf(ids.older));
    });

    it("excludes tombstoned/removed/shadow posts", async () => {
        const posts = await searchPosts(db, { q: Q, limit: 50 });
        const got = posts.map((p) => p.id);
        expect(got).not.toContain(ids.removed);
        expect(got).not.toContain(ids.tomb);
        expect(got).not.toContain(ids.shadow);
    });

    it("returns public-serialized posts (month dates, no exact timestamp)", async () => {
        const posts = await searchPosts(db, { q: Q, limit: 1 });
        expect(posts[0].createdMonth).toMatch(/^\d{4}-\d{2}$/);
        expect(JSON.stringify(posts[0])).not.toContain("createdAt");
    });

    it("returns nothing for an empty query", async () => {
        expect(await searchPosts(db, { q: "   ", limit: 50 })).toEqual([]);
    });
});

describe("findSimilarPosts", () => {
    it("surfaces near-duplicate titles via fuzzy trigram match", async () => {
        // Slightly misspelled / reordered against the 'title' post's wording.
        const sims = await findSimilarPosts(db, `${RARE} binary tree traversl`, 5);
        expect(sims.map((s) => s.id)).toContain(ids.title);
    });

    it("excludes non-public posts and leaks no dates", async () => {
        const sims = await findSimilarPosts(db, `${RARE} binary tree removed`, 5);
        expect(sims.map((s) => s.id)).not.toContain(ids.removed);
        expect(JSON.stringify(sims)).not.toContain("createdAt");
    });

    it("returns nothing for a blank title", async () => {
        expect(await findSimilarPosts(db, "   ", 5)).toEqual([]);
    });
});
