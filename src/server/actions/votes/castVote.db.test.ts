import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { castVoteCore } from "./core";

const db = new PrismaClient({
    datasourceUrl:
        process.env.DATABASE_URL ??
        "postgresql://myuser:mypassword@localhost:5432/mydb",
});

const RUN = Date.now().toString(36);
const AUTHOR = `vitest-vote-author-${RUN}`;
const VOTER = `vitest-vote-voter-${RUN}`;
let postId: string;
let commentId: string;

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
            title: "A votable post",
            slug: "a-votable-post",
            body: "Vote on me.",
        },
        select: { id: true },
    });
    postId = post.id;
    const comment = await db.comment.create({
        data: { postId, authorId: AUTHOR, body: "A votable comment." },
        select: { id: true },
    });
    commentId = comment.id;
});

afterAll(async () => {
    await db.vote.deleteMany({ where: { userId: { in: [AUTHOR, VOTER] } } });
    await db.comment.deleteMany({ where: { authorId: AUTHOR } });
    await db.post.deleteMany({ where: { authorId: AUTHOR } });
    await db.user.deleteMany({ where: { id: { in: [AUTHOR, VOTER] } } });
    await db.$disconnect();
});

describe("castVoteCore — posts", () => {
    it("upvotes a post: denormalizes counts and credits the author's reputation", async () => {
        const res = await castVoteCore(db, VOTER, {
            targetType: "POST",
            targetId: postId,
            value: 1,
        });
        expect(res.ok).toBe(true);

        const post = await db.post.findUniqueOrThrow({
            where: { id: postId },
            select: { score: true, upCount: true, downCount: true, hotRank: true },
        });
        expect(post.score).toBe(1);
        expect(post.upCount).toBe(1);
        expect(post.downCount).toBe(0);
        expect(post.hotRank).not.toBe(0);

        const author = await db.user.findUniqueOrThrow({
            where: { id: AUTHOR },
            select: { reputation: true, exp: true },
        });
        expect(author.reputation).toBe(1);
        // Reputation is independent of the contribution exp ledger.
        expect(author.exp).toBe(0);
    });

    it("re-clicking the same direction toggles the vote off", async () => {
        await castVoteCore(db, VOTER, {
            targetType: "POST",
            targetId: postId,
            value: 1,
        });
        const post = await db.post.findUniqueOrThrow({
            where: { id: postId },
            select: { score: true, upCount: true },
        });
        expect(post.score).toBe(0);
        expect(post.upCount).toBe(0);

        const votes = await db.vote.count({
            where: { userId: VOTER, targetType: "POST", targetId: postId },
        });
        expect(votes).toBe(0);

        const author = await db.user.findUniqueOrThrow({
            where: { id: AUTHOR },
            select: { reputation: true },
        });
        expect(author.reputation).toBe(0);
    });

    it("flips a downvote to an upvote, moving counts across buckets", async () => {
        await castVoteCore(db, VOTER, {
            targetType: "POST",
            targetId: postId,
            value: -1,
        });
        let post = await db.post.findUniqueOrThrow({
            where: { id: postId },
            select: { score: true, upCount: true, downCount: true },
        });
        expect(post.score).toBe(-1);
        expect(post.downCount).toBe(1);

        await castVoteCore(db, VOTER, {
            targetType: "POST",
            targetId: postId,
            value: 1,
        });
        post = await db.post.findUniqueOrThrow({
            where: { id: postId },
            select: { score: true, upCount: true, downCount: true },
        });
        expect(post.score).toBe(1);
        expect(post.upCount).toBe(1);
        expect(post.downCount).toBe(0);

        // Exactly one vote row survives (unique per user/target).
        const votes = await db.vote.count({
            where: { userId: VOTER, targetType: "POST", targetId: postId },
        });
        expect(votes).toBe(1);
    });
});

describe("castVoteCore — comments + guards", () => {
    it("upvotes a comment, denormalizing onto the comment", async () => {
        const res = await castVoteCore(db, VOTER, {
            targetType: "COMMENT",
            targetId: commentId,
            value: 1,
        });
        expect(res.ok).toBe(true);
        const comment = await db.comment.findUniqueOrThrow({
            where: { id: commentId },
            select: { score: true, upCount: true },
        });
        expect(comment.score).toBe(1);
        expect(comment.upCount).toBe(1);
    });

    it("rejects a self-vote and leaves counts untouched", async () => {
        const before = await db.post.findUniqueOrThrow({
            where: { id: postId },
            select: { score: true },
        });
        const res = await castVoteCore(db, AUTHOR, {
            targetType: "POST",
            targetId: postId,
            value: 1,
        });
        expect(res.ok).toBe(false);
        const after = await db.post.findUniqueOrThrow({
            where: { id: postId },
            select: { score: true },
        });
        expect(after.score).toBe(before.score);
    });

    it("rejects a vote on a missing target", async () => {
        const res = await castVoteCore(db, VOTER, {
            targetType: "POST",
            targetId: "does-not-exist",
            value: 1,
        });
        expect(res.ok).toBe(false);
    });
});
