import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { addCommentCore } from "./core";

const db = new PrismaClient({
    datasourceUrl:
        process.env.DATABASE_URL ??
        "postgresql://myuser:mypassword@localhost:5432/mydb",
});

const RUN = Date.now().toString(36);
const U = `vitest-cmt-user-${RUN}`;
let postId: string;
let lockedPostId: string;

beforeAll(async () => {
    await db.user.create({
        data: { id: U, name: "Vitest", email: `${U}@example.test` },
    });
    const post = await db.post.create({
        data: {
            type: "DISCUSSION",
            authorId: U,
            title: "A thread to comment on",
            slug: "a-thread-to-comment-on",
            body: "Body.",
        },
        select: { id: true },
    });
    postId = post.id;
    const locked = await db.post.create({
        data: {
            type: "DISCUSSION",
            authorId: U,
            title: "A locked thread",
            slug: "a-locked-thread",
            body: "Body.",
            lockedAt: new Date(),
        },
        select: { id: true },
    });
    lockedPostId = locked.id;
});

afterAll(async () => {
    await db.comment.deleteMany({ where: { authorId: U } });
    await db.post.deleteMany({ where: { authorId: U } });
    await db.user.delete({ where: { id: U } });
    await db.$disconnect();
});

describe("addCommentCore — nesting + denormalization", () => {
    it("creates a top-level comment (depth 0, no root) and bumps commentCount", async () => {
        const before = await db.post.findUniqueOrThrow({
            where: { id: postId },
            select: { commentCount: true },
        });
        const res = await addCommentCore(db, U, {
            postId,
            body: "First, top-level take.",
        });
        expect(res.ok).toBe(true);
        if (res.ok === false) return;

        const c = await db.comment.findUniqueOrThrow({ where: { id: res.id } });
        expect(c.depth).toBe(0);
        expect(c.parentId).toBeNull();
        expect(c.rootId).toBeNull();

        const after = await db.post.findUniqueOrThrow({
            where: { id: postId },
            select: { commentCount: true },
        });
        expect(after.commentCount).toBe(before.commentCount + 1);
    });

    it("nests replies and denormalizes depth + the top-level rootId", async () => {
        const root = await addCommentCore(db, U, { postId, body: "Root comment." });
        expect(root.ok).toBe(true);
        if (root.ok === false) return;

        const child = await addCommentCore(db, U, {
            postId,
            parentId: root.id,
            body: "A reply to the root.",
        });
        expect(child.ok).toBe(true);
        if (child.ok === false) return;

        const grandchild = await addCommentCore(db, U, {
            postId,
            parentId: child.id,
            body: "A reply to the reply.",
        });
        expect(grandchild.ok).toBe(true);
        if (grandchild.ok === false) return;

        const cRow = await db.comment.findUniqueOrThrow({ where: { id: child.id } });
        const gRow = await db.comment.findUniqueOrThrow({
            where: { id: grandchild.id },
        });
        expect(cRow.depth).toBe(1);
        expect(cRow.rootId).toBe(root.id);
        // The grandchild's root stays the top-level ancestor, not its parent.
        expect(gRow.depth).toBe(2);
        expect(gRow.rootId).toBe(root.id);
    });
});

describe("addCommentCore — guards", () => {
    it("rejects an empty body", async () => {
        const res = await addCommentCore(db, U, { postId, body: "   " });
        expect(res.ok).toBe(false);
    });

    it("rejects offensive language", async () => {
        const res = await addCommentCore(db, U, {
            postId,
            body: "this is sh1t",
        });
        expect(res.ok).toBe(false);
    });

    it("rejects a reply whose parent belongs to another post", async () => {
        const root = await addCommentCore(db, U, { postId, body: "Root here." });
        expect(root.ok).toBe(true);
        if (root.ok === false) return;
        const res = await addCommentCore(db, U, {
            postId: lockedPostId,
            parentId: root.id,
            body: "Mismatched parent.",
        });
        expect(res.ok).toBe(false);
    });

    it("rejects a comment on a locked thread", async () => {
        const res = await addCommentCore(db, U, {
            postId: lockedPostId,
            body: "Trying to comment on a locked thread.",
        });
        expect(res.ok).toBe(false);
    });
});
