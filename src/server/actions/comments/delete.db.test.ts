import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { addCommentCore, deleteCommentCore } from "./core";
import { deletePostCore } from "../posts/core";

const db = new PrismaClient({
    datasourceUrl:
        process.env.DATABASE_URL ??
        "postgresql://myuser:mypassword@localhost:5432/mydb",
});

const RUN = Date.now().toString(36);
const U = `vitest-del-user-${RUN}`;
const OTHER = `vitest-del-other-${RUN}`;
let postId: string;

beforeAll(async () => {
    await db.user.create({
        data: { id: U, name: "Vitest", email: `${U}@example.test` },
    });
    await db.user.create({
        data: { id: OTHER, name: "Other", email: `${OTHER}@example.test` },
    });
    const post = await db.post.create({
        data: {
            type: "DISCUSSION",
            authorId: U,
            title: "A thread to delete from",
            slug: "a-thread-to-delete-from",
            body: "Body.",
        },
        select: { id: true },
    });
    postId = post.id;
});

afterAll(async () => {
    await db.comment.deleteMany({ where: { postId } });
    await db.post.deleteMany({ where: { authorId: U } });
    await db.user.deleteMany({ where: { id: { in: [U, OTHER] } } });
    await db.$disconnect();
});

describe("deleteCommentCore — tombstone vs hard delete", () => {
    it("tombstones a comment that has replies so the subtree survives", async () => {
        const root = await addCommentCore(db, U, { postId, body: "Root take." });
        if (root.ok === false) throw new Error(root.error);
        const child = await addCommentCore(db, OTHER, {
            postId,
            parentId: root.id,
            body: "A reply that must survive.",
        });
        if (child.ok === false) throw new Error(child.error);

        const res = await deleteCommentCore(db, U, root.id);
        expect(res.ok).toBe(true);

        const rootRow = await db.comment.findUnique({ where: { id: root.id } });
        expect(rootRow).not.toBeNull();
        expect(rootRow?.status).toBe("TOMBSTONED");

        const childRow = await db.comment.findUnique({ where: { id: child.id } });
        expect(childRow).not.toBeNull();
        expect(childRow?.status).toBe("PUBLISHED");
        expect(childRow?.body).toBe("A reply that must survive.");
    });

    it("hard-deletes a leaf comment (no replies)", async () => {
        const leaf = await addCommentCore(db, U, {
            postId,
            body: "A lonely leaf.",
        });
        if (leaf.ok === false) throw new Error(leaf.error);

        const res = await deleteCommentCore(db, U, leaf.id);
        expect(res.ok).toBe(true);

        const row = await db.comment.findUnique({ where: { id: leaf.id } });
        expect(row).toBeNull();
    });

    it("rejects deleting another user's comment", async () => {
        const c = await addCommentCore(db, U, { postId, body: "Mine only." });
        if (c.ok === false) throw new Error(c.error);

        const res = await deleteCommentCore(db, OTHER, c.id);
        expect(res.ok).toBe(false);

        const row = await db.comment.findUnique({ where: { id: c.id } });
        expect(row?.status).toBe("PUBLISHED");
    });
});

describe("deletePostCore — tombstone with surviving comments", () => {
    it("tombstones the post but leaves its comments readable", async () => {
        const post = await db.post.create({
            data: {
                type: "DISCUSSION",
                authorId: U,
                title: "Post that gets deleted",
                slug: "post-that-gets-deleted",
                body: "Going away.",
            },
            select: { id: true },
        });
        const c = await addCommentCore(db, OTHER, {
            postId: post.id,
            body: "Built on this thread.",
        });
        if (c.ok === false) throw new Error(c.error);

        const res = await deletePostCore(db, U, post.id);
        expect(res.ok).toBe(true);

        const postRow = await db.post.findUnique({ where: { id: post.id } });
        expect(postRow?.status).toBe("TOMBSTONED");

        const commentRow = await db.comment.findUnique({ where: { id: c.id } });
        expect(commentRow).not.toBeNull();
        expect(commentRow?.status).toBe("PUBLISHED");
        expect(commentRow?.body).toBe("Built on this thread.");
    });

    it("rejects deleting another user's post", async () => {
        const res = await deletePostCore(db, OTHER, postId);
        expect(res.ok).toBe(false);
    });
});
