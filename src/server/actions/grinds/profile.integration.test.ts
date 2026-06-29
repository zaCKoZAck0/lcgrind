import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { seedPostTags } from "./tags";
import { getProfileByHandle } from "./profile";
import { getFeed } from "./feed";

const db = new PrismaClient({
    datasourceUrl:
        process.env.DATABASE_URL ??
        "postgresql://myuser:mypassword@localhost:5432/mydb",
});

const RUN = Date.now().toString(36);
const HANDLE = `proftest${RUN}`.slice(0, 18);
const OTHER = `profoth${RUN}`.slice(0, 18);
let userId: string;
let otherUserId: string;

beforeAll(async () => {
    await seedPostTags(db);
    const u = await db.user.create({
        data: {
            id: `vitest-prof-${RUN}`,
            name: "Prof Test",
            email: `prof-${RUN}@example.com`,
            emailVerified: false,
            handle: HANDLE,
            reputation: 42,
            exp: 100,
        },
    });
    userId = u.id;

    const o = await db.user.create({
        data: {
            id: `vitest-prof-oth-${RUN}`,
            name: "Other User",
            email: `profoth-${RUN}@example.com`,
            emailVerified: false,
            handle: OTHER,
        },
    });
    otherUserId = o.id;
});

afterAll(async () => {
    await db.post.deleteMany({ where: { authorId: { in: [userId, otherUserId] } } });
    await db.user.deleteMany({ where: { id: { in: [userId, otherUserId] } } });
    await db.$disconnect();
});

describe("getProfileByHandle", () => {
    it("resolves a handle to {handle, reputation, exp, badges}", async () => {
        const p = await getProfileByHandle(db, HANDLE);
        expect(p).not.toBeNull();
        expect(p!.handle).toBe(HANDLE);
        expect(p!.reputation).toBe(42);
        expect(p!.exp).toBe(100);
        expect(Array.isArray(p!.badges)).toBe(true);
    });

    it("returns null for an unknown handle", async () => {
        const p = await getProfileByHandle(db, `unknown-${RUN}`);
        expect(p).toBeNull();
    });

    it("returns null for a banned user", async () => {
        const bannedHandle = `banned${RUN}`.slice(0, 18);
        const b = await db.user.create({
            data: {
                id: `vitest-prof-ban-${RUN}`,
                name: "Banned",
                email: `profban-${RUN}@example.com`,
                emailVerified: false,
                handle: bannedHandle,
                bannedAt: new Date(),
            },
        });
        const p = await getProfileByHandle(db, bannedHandle);
        expect(p).toBeNull();
        await db.user.delete({ where: { id: b.id } });
    });

    it("shape carries no name or email key (provenance invariant)", async () => {
        const p = await getProfileByHandle(db, HANDLE);
        expect(p).not.toBeNull();
        expect("name" in p!).toBe(false);
        expect("email" in p!).toBe(false);
    });
});

describe("getFeed with authorId filter", () => {
    it("returns only that author's PUBLISHED posts", async () => {
        // Insert directly to skip rate-limit guards in createPostCore.
        const post = await db.post.create({
            data: {
                authorId: userId,
                type: "DISCUSSION",
                title: `Profile feed test ${RUN}`,
                slug: `profile-feed-test-${RUN}`,
                body: "body content for author-scoped feed test",
                status: "PUBLISHED",
                isAnonymous: false,
            },
        });

        const { posts } = await getFeed(db, { authorId: userId });
        expect(posts.some((p) => p.id === post.id)).toBe(true);
    });

    it("excludes posts from other authors", async () => {
        const otherPost = await db.post.create({
            data: {
                authorId: otherUserId,
                type: "DISCUSSION",
                title: `Other author post ${RUN}`,
                slug: `other-author-post-${RUN}`,
                body: "body content for other author",
                status: "PUBLISHED",
                isAnonymous: false,
            },
        });

        const { posts } = await getFeed(db, { authorId: userId });
        expect(posts.some((p) => p.id === otherPost.id)).toBe(false);
    });

    it("excludes the author's own anonymous post (AC5 — no re-attribution)", async () => {
        const anonPost = await db.post.create({
            data: {
                authorId: userId,
                type: "DISCUSSION",
                title: `Anon post ${RUN}`,
                slug: `anon-post-${RUN}`,
                body: "this was posted anonymously",
                status: "PUBLISHED",
                isAnonymous: true,
            },
        });

        const { posts } = await getFeed(db, { authorId: userId });
        expect(posts.some((p) => p.id === anonPost.id)).toBe(false);
    });
});
