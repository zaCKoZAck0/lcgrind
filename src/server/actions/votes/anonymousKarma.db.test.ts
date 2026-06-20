import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { castVoteCore } from "./core";

const db = new PrismaClient({
    datasourceUrl:
        process.env.DATABASE_URL ??
        "postgresql://myuser:mypassword@localhost:5432/mydb",
});

const RUN = Date.now().toString(36);
const AUTHOR = `vitest-anon-author-${RUN}`;
const VOTER = `vitest-anon-voter-${RUN}`;
let anonPostId: string;
let anonCommentId: string;

beforeAll(async () => {
    await db.user.create({
        data: { id: AUTHOR, name: "Author", email: `${AUTHOR}@example.test` },
    });
    await db.user.create({
        data: { id: VOTER, name: "Voter", email: `${VOTER}@example.test` },
    });
    const post = await db.post.create({
        data: {
            type: "DISCUSSION",
            authorId: AUTHOR,
            title: "An anonymous post",
            slug: "an-anonymous-post",
            body: "Posted anonymously.",
            isAnonymous: true,
        },
        select: { id: true },
    });
    anonPostId = post.id;
    const comment = await db.comment.create({
        data: {
            postId: anonPostId,
            authorId: AUTHOR,
            body: "An anonymous comment.",
            isAnonymous: true,
        },
        select: { id: true },
    });
    anonCommentId = comment.id;
});

afterAll(async () => {
    await db.vote.deleteMany({ where: { userId: { in: [AUTHOR, VOTER] } } });
    await db.comment.deleteMany({ where: { authorId: AUTHOR } });
    await db.post.deleteMany({ where: { authorId: AUTHOR } });
    await db.user.deleteMany({ where: { id: { in: [AUTHOR, VOTER] } } });
    await db.$disconnect();
});

describe("castVoteCore — anonymous content earns no karma", () => {
    it("denormalizes the score on an anonymous post but accrues no author karma", async () => {
        const res = await castVoteCore(db, VOTER, {
            targetType: "POST",
            targetId: anonPostId,
            value: 1,
        });
        expect(res.ok).toBe(true);

        const post = await db.post.findUniqueOrThrow({
            where: { id: anonPostId },
            select: { score: true, upCount: true },
        });
        // Public vote counts still move (the post shows its score)...
        expect(post.score).toBe(1);
        expect(post.upCount).toBe(1);

        // ...but the author earns no karma for anonymous content.
        const author = await db.user.findUniqueOrThrow({
            where: { id: AUTHOR },
            select: { karma: true },
        });
        expect(author.karma).toBe(0);
    });

    it("accrues no karma for votes on an anonymous comment", async () => {
        const res = await castVoteCore(db, VOTER, {
            targetType: "COMMENT",
            targetId: anonCommentId,
            value: 1,
        });
        expect(res.ok).toBe(true);

        const comment = await db.comment.findUniqueOrThrow({
            where: { id: anonCommentId },
            select: { score: true },
        });
        expect(comment.score).toBe(1);

        const author = await db.user.findUniqueOrThrow({
            where: { id: AUTHOR },
            select: { karma: true },
        });
        expect(author.karma).toBe(0);
    });
});
