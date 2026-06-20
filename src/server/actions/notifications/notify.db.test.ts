import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { notify, markRead, parseMentions } from "./core";

const db = new PrismaClient({
    datasourceUrl:
        process.env.DATABASE_URL ??
        "postgresql://myuser:mypassword@localhost:5432/mydb",
});

const RUN = Date.now().toString(36);
const ACTOR = `vitest-notif-actor-${RUN}`;
const RECIP = `vitest-notif-recip-${RUN}`;
let postId: string;

beforeAll(async () => {
    await db.user.createMany({
        data: [
            { id: ACTOR, name: "Actor", email: `actor-${RUN}@example.test` },
            { id: RECIP, name: "Recip", email: `recip-${RUN}@example.test` },
        ],
    });
    const post = await db.post.create({
        data: {
            authorId: RECIP,
            title: "Notif test post",
            slug: `notif-test-post-${RUN}`,
            body: "Body.",
        },
        select: { id: true },
    });
    postId = post.id;
});

afterAll(async () => {
    await db.notification.deleteMany({ where: { userId: { in: [ACTOR, RECIP] } } });
    await db.post.deleteMany({ where: { authorId: RECIP } });
    await db.user.deleteMany({ where: { id: { in: [ACTOR, RECIP] } } });
    await db.$disconnect();
});

describe("notify", () => {
    it("creates a notification for the recipient", async () => {
        await notify(db, {
            userId: RECIP,
            type: "REPLY_POST",
            actorId: ACTOR,
            postId,
        });
        const row = await db.notification.findFirst({
            where: { userId: RECIP, type: "REPLY_POST", postId },
        });
        expect(row).not.toBeNull();
        expect(row?.read).toBe(false);
        expect(row?.actorId).toBe(ACTOR);
    });

    it("skips self-notification (actor === recipient)", async () => {
        const before = await db.notification.count({ where: { userId: RECIP } });
        await notify(db, {
            userId: RECIP,
            type: "REPLY_POST",
            actorId: RECIP,
            postId,
        });
        const after = await db.notification.count({ where: { userId: RECIP } });
        expect(after).toBe(before);
    });

    it("stores null actorId for anonymous actor", async () => {
        await notify(db, {
            userId: RECIP,
            type: "MENTION",
            actorId: null,
            postId,
        });
        const row = await db.notification.findFirst({
            where: { userId: RECIP, type: "MENTION" },
        });
        expect(row?.actorId).toBeNull();
    });
});

describe("markRead", () => {
    it("marks all unread notifications as read for a user", async () => {
        await notify(db, { userId: RECIP, type: "REPLY_COMMENT", actorId: ACTOR, postId });
        const before = await db.notification.count({ where: { userId: RECIP, read: false } });
        expect(before).toBeGreaterThan(0);

        await markRead(db, RECIP);
        const after = await db.notification.count({ where: { userId: RECIP, read: false } });
        expect(after).toBe(0);
    });
});

describe("parseMentions", () => {
    it("extracts @handles from text", () => {
        const handles = parseMentions("Thanks @alice_dev and @bob99 for the help!");
        expect(handles).toContain("alice_dev");
        expect(handles).toContain("bob99");
    });

    it("returns empty array when no mentions", () => {
        expect(parseMentions("No mentions here")).toEqual([]);
    });

    it("deduplicates repeated mentions", () => {
        const handles = parseMentions("@alice thanks @alice!");
        expect(handles).toEqual(["alice"]);
    });
});
