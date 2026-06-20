import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { banUserCore, lockPostCore, shadowContentCore } from "./core";
import { addCommentCore } from "../comments/core";
import { castVoteCore } from "../votes/core";
import { createPostCore } from "../posts/core";

const db = new PrismaClient({
    datasourceUrl:
        process.env.DATABASE_URL ??
        "postgresql://myuser:mypassword@localhost:5432/mydb",
});

const RUN = Date.now().toString(36);
const ADMIN = `vitest-ban-admin-${RUN}`;
const USER = `vitest-ban-user-${RUN}`;
const OTHER = `vitest-ban-other-${RUN}`;

beforeAll(async () => {
    await db.user.createMany({
        data: [
            { id: ADMIN, name: "Admin", email: `admin-${RUN}@example.test` },
            { id: USER, name: "User", email: `user-${RUN}@example.test` },
            { id: OTHER, name: "Other", email: `other-${RUN}@example.test` },
        ],
    });
});

afterAll(async () => {
    await db.comment.deleteMany({ where: { authorId: { in: [USER, OTHER] } } });
    await db.post.deleteMany({ where: { authorId: { in: [USER, OTHER] } } });
    await db.user.deleteMany({ where: { id: { in: [ADMIN, USER, OTHER] } } });
    await db.$disconnect();
});

describe("banUserCore", () => {
    it("sets bannedAt on the user", async () => {
        const res = await banUserCore(db, USER);
        expect(res.ok).toBe(true);
        const u = await db.user.findUnique({ where: { id: USER }, select: { bannedAt: true } });
        expect(u?.bannedAt).not.toBeNull();
    });

    it("banned user cannot create a post", async () => {
        const res = await createPostCore(db, USER, {
            title: "Should fail",
            body: "Should fail",
        });
        expect(res.ok).toBe(false);
        if (res.ok === false) expect(res.error).toMatch(/banned/i);
    });

    it("banned user cannot comment", async () => {
        // Need a post to comment on (from a non-banned user)
        const post = await db.post.create({
            data: { authorId: OTHER, title: "Post for ban test", slug: `ban-post-${RUN}`, body: "Body" },
            select: { id: true },
        });
        const res = await addCommentCore(db, USER, { postId: post.id, body: "Should fail" });
        expect(res.ok).toBe(false);
        if (res.ok === false) expect(res.error).toMatch(/banned/i);
    });
});

describe("lockPostCore", () => {
    it("sets lockedAt on the post", async () => {
        const post = await db.post.create({
            data: { authorId: OTHER, title: "Lock test", slug: `lock-post-${RUN}`, body: "Body" },
            select: { id: true },
        });
        const res = await lockPostCore(db, post.id);
        expect(res.ok).toBe(true);
        const p = await db.post.findUnique({ where: { id: post.id }, select: { lockedAt: true } });
        expect(p?.lockedAt).not.toBeNull();
    });

    it("locked post rejects new comments", async () => {
        const post = await db.post.create({
            data: {
                authorId: OTHER,
                title: "Lock test 2",
                slug: `lock-post-2-${RUN}`,
                body: "Body",
                lockedAt: new Date(),
            },
            select: { id: true },
        });
        // Unban OTHER to confirm it's the lock that blocks
        await db.user.update({ where: { id: OTHER }, data: { bannedAt: null } });
        const res = await addCommentCore(db, OTHER, { postId: post.id, body: "New comment" });
        expect(res.ok).toBe(false);
        if (res.ok === false) expect(res.error).toMatch(/lock/i);
    });
});

describe("shadowContentCore", () => {
    it("sets post status to SHADOW (hidden from feed, visible to author)", async () => {
        const post = await db.post.create({
            data: { authorId: OTHER, title: "Shadow test", slug: `shadow-post-${RUN}`, body: "Body" },
            select: { id: true },
        });
        const res = await shadowContentCore(db, "POST", post.id);
        expect(res.ok).toBe(true);
        const p = await db.post.findUnique({ where: { id: post.id }, select: { status: true } });
        expect(p?.status).toBe("SHADOW");
    });
});
