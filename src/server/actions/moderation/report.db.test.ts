import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { reportContentCore, removeContentCore } from "./core";

const db = new PrismaClient({
    datasourceUrl:
        process.env.DATABASE_URL ??
        "postgresql://myuser:mypassword@localhost:5432/mydb",
});

const RUN = Date.now().toString(36);
const AUTHOR = `vitest-report-author-${RUN}`;
const R1 = `vitest-report-r1-${RUN}`;
const R2 = `vitest-report-r2-${RUN}`;

let postId: string;
let commentId: string;

beforeAll(async () => {
    for (const id of [AUTHOR, R1, R2]) {
        await db.user.create({
            data: {
                id,
                name: "Reporter",
                email: `${id}@example.test`,
                handle: id.slice(0, 18),
            },
        });
    }
    const post = await db.post.create({
        data: {
            type: "DISCUSSION",
            authorId: AUTHOR,
            title: "Reportable post",
            slug: `reportable-${RUN}`,
            body: "Body.",
            status: "PUBLISHED",
        },
        select: { id: true },
    });
    postId = post.id;
    const comment = await db.comment.create({
        data: {
            postId,
            authorId: AUTHOR,
            body: "Reportable comment",
            status: "PUBLISHED",
        },
        select: { id: true },
    });
    commentId = comment.id;
});

afterAll(async () => {
    await db.report.deleteMany({ where: { reporterId: { in: [R1, R2] } } });
    await db.comment.deleteMany({ where: { authorId: AUTHOR } });
    await db.post.deleteMany({ where: { authorId: AUTHOR } });
    await db.user.deleteMany({ where: { id: { in: [AUTHOR, R1, R2] } } });
    await db.$disconnect();
});

describe("reportContentCore", () => {
    it("creates an OPEN Report row for a post", async () => {
        const res = await reportContentCore(db, R1, {
            targetType: "POST",
            targetId: postId,
            reason: "spam",
        });
        expect(res.ok).toBe(true);

        const row = await db.report.findFirst({
            where: { reporterId: R1, targetType: "POST", targetId: postId },
        });
        expect(row).not.toBeNull();
        expect(row!.status).toBe("OPEN");
        expect(row!.reason).toBe("spam");
    });

    it("blocks the same user reporting the same target twice", async () => {
        const res = await reportContentCore(db, R1, {
            targetType: "POST",
            targetId: postId,
            reason: "spam again",
        });
        expect(res.ok).toBe(false);

        const count = await db.report.count({
            where: { reporterId: R1, targetType: "POST", targetId: postId },
        });
        expect(count).toBe(1);
    });

    it("lets a different user report the same target", async () => {
        const res = await reportContentCore(db, R2, {
            targetType: "POST",
            targetId: postId,
            reason: "off-topic",
        });
        expect(res.ok).toBe(true);
    });
});

describe("removeContentCore", () => {
    it("soft-deletes a reported post (status REMOVED, row recoverable) and resolves its reports", async () => {
        const res = await removeContentCore(db, "POST", postId);
        expect(res.ok).toBe(true);

        const post = await db.post.findUnique({ where: { id: postId } });
        // Recoverable: the row survives, only the status flips.
        expect(post).not.toBeNull();
        expect(post!.status).toBe("REMOVED");

        const open = await db.report.count({
            where: { targetType: "POST", targetId: postId, status: "OPEN" },
        });
        expect(open).toBe(0);
    });

    it("soft-deletes a reported comment (status REMOVED) and drops it from commentCount", async () => {
        await db.post.update({
            where: { id: postId },
            data: { commentCount: 1 },
        });
        await reportContentCore(db, R1, {
            targetType: "COMMENT",
            targetId: commentId,
            reason: "abuse",
        });
        const res = await removeContentCore(db, "COMMENT", commentId);
        expect(res.ok).toBe(true);

        const comment = await db.comment.findUnique({
            where: { id: commentId },
        });
        expect(comment).not.toBeNull();
        expect(comment!.status).toBe("REMOVED");

        const post = await db.post.findUnique({ where: { id: postId } });
        expect(post!.commentCount).toBe(0);
    });

    it("does not double-decrement commentCount on repeat removal", async () => {
        const res = await removeContentCore(db, "COMMENT", commentId);
        expect(res.ok).toBe(true);

        const post = await db.post.findUnique({ where: { id: postId } });
        expect(post!.commentCount).toBe(0);
    });
});
