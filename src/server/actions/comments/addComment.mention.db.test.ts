import { vi } from "vitest";
vi.mock("~/config/feature-flags", () => ({ FEATURE_FLAGS: { NOTIFICATIONS: true } }));

import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { addCommentCore } from "./core";

const db = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL ?? "postgresql://myuser:mypassword@localhost:5432/mydb",
});
const RUN = Date.now().toString(36);
const ACTOR_ID = `vitest-cmt-mention-actor-${RUN}`;
const RECIP_ID = `vitest-cmt-mention-recip-${RUN}`;
const ACTOR_HANDLE = `cmtactr${RUN.slice(-6)}`;
const RECIP_HANDLE = `cmtrecp${RUN.slice(-6)}`;
let postId: string;

beforeAll(async () => {
    await db.user.createMany({
        data: [
            { id: ACTOR_ID, name: "Actor", email: `cmt-actor-${RUN}@example.test`, handle: ACTOR_HANDLE },
            { id: RECIP_ID, name: "Recip", email: `cmt-recip-${RUN}@example.test`, handle: RECIP_HANDLE },
        ],
    });
    const post = await db.post.create({
        data: { authorId: ACTOR_ID, title: "Comment mention test", slug: `cmt-mention-${RUN}`, body: "Body." },
        select: { id: true },
    });
    postId = post.id;
});

afterAll(async () => {
    await db.notification.deleteMany({ where: { userId: { in: [ACTOR_ID, RECIP_ID] } } });
    await db.comment.deleteMany({ where: { postId } });
    await db.post.deleteMany({ where: { id: postId } });
    await db.user.deleteMany({ where: { id: { in: [ACTOR_ID, RECIP_ID] } } });
    await db.$disconnect();
});

describe("addCommentCore mention notifications", () => {
    it("creates MENTION notification when comment body mentions another user", async () => {
        const res = await addCommentCore(db, ACTOR_ID, { postId, body: `Hey @${RECIP_HANDLE} check!` });
        expect(res.ok).toBe(true);
        if (!res.ok) return;
        const notif = await db.notification.findFirst({ where: { userId: RECIP_ID, type: "MENTION", commentId: res.id } });
        expect(notif).not.toBeNull();
        expect(notif?.actorId).toBe(ACTOR_ID);
    });

    it("does not self-notify when actor mentions own handle (non-anonymous)", async () => {
        const before = await db.notification.count({ where: { userId: ACTOR_ID } });
        await addCommentCore(db, ACTOR_ID, { postId, body: `I am @${ACTOR_HANDLE}` });
        const after = await db.notification.count({ where: { userId: ACTOR_ID } });
        expect(after).toBe(before);
    });

    it("does not self-notify when actor mentions own handle (anonymous)", async () => {
        const before = await db.notification.count({ where: { userId: ACTOR_ID } });
        await addCommentCore(db, ACTOR_ID, {
            postId,
            body: `Anonymous shoutout to @${ACTOR_HANDLE}`,
            isAnonymous: true,
        });
        const after = await db.notification.count({ where: { userId: ACTOR_ID } });
        expect(after).toBe(before);
    });

    it("creates MENTION with null actorId for anonymous comment mentioning another user", async () => {
        const res = await addCommentCore(db, ACTOR_ID, {
            postId, body: `@${RECIP_HANDLE} anon shout`, isAnonymous: true,
        });
        expect(res.ok).toBe(true);
        if (!res.ok) return;
        const notif = await db.notification.findFirst({ where: { userId: RECIP_ID, type: "MENTION", commentId: res.id } });
        expect(notif).not.toBeNull();
        expect(notif?.actorId).toBeNull();
    });
});
