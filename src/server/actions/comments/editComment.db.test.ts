import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { addCommentCore, editCommentCore } from "./core";

const db = new PrismaClient({
    datasourceUrl:
        process.env.DATABASE_URL ??
        "postgresql://myuser:mypassword@localhost:5432/mydb",
});

const RUN = Date.now().toString(36);
const U = `vitest-editc-user-${RUN}`;
const OTHER = `vitest-editc-other-${RUN}`;
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
            title: "A thread to edit in",
            slug: "a-thread-to-edit-in",
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

describe("editCommentCore", () => {
    it("updates the body and stamps editedAt", async () => {
        const c = await addCommentCore(db, U, { postId, body: "First draft." });
        if (c.ok === false) throw new Error(c.error);

        const before = await db.comment.findUniqueOrThrow({
            where: { id: c.id },
        });
        expect(before.editedAt).toBeNull();

        const res = await editCommentCore(db, U, c.id, {
            body: "Revised, clearer take.",
        });
        expect(res.ok).toBe(true);

        const after = await db.comment.findUniqueOrThrow({ where: { id: c.id } });
        expect(after.body).toBe("Revised, clearer take.");
        expect(after.editedAt).not.toBeNull();
    });

    it("rejects an empty body", async () => {
        const c = await addCommentCore(db, U, { postId, body: "Keep me." });
        if (c.ok === false) throw new Error(c.error);

        const res = await editCommentCore(db, U, c.id, { body: "   " });
        expect(res.ok).toBe(false);

        const row = await db.comment.findUniqueOrThrow({ where: { id: c.id } });
        expect(row.body).toBe("Keep me.");
    });

    it("rejects editing another user's comment", async () => {
        const c = await addCommentCore(db, U, { postId, body: "Not yours." });
        if (c.ok === false) throw new Error(c.error);

        const res = await editCommentCore(db, OTHER, c.id, {
            body: "Hijacked.",
        });
        expect(res.ok).toBe(false);

        const row = await db.comment.findUniqueOrThrow({ where: { id: c.id } });
        expect(row.body).toBe("Not yours.");
        expect(row.editedAt).toBeNull();
    });
});
