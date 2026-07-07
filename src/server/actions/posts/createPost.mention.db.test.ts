import { vi } from "vitest";

vi.mock("~/config/feature-flags", () => ({
    FEATURE_FLAGS: { NOTIFICATIONS: true },
}));

import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createPostCore } from "./core";

const db = new PrismaClient({
    datasourceUrl:
        process.env.DATABASE_URL ??
        "postgresql://myuser:mypassword@localhost:5432/mydb",
});

const RUN = Date.now().toString(36);
const ACTOR_ID = `vitest-post-mention-actor-${RUN}`;
const RECIP_ID = `vitest-post-mention-recip-${RUN}`;
const ACTOR_HANDLE = `actr${RUN}`;
const RECIP_HANDLE = `recp${RUN}`;

beforeAll(async () => {
    await db.user.createMany({
        data: [
            {
                id: ACTOR_ID,
                name: "Actor",
                email: `actor-pm-${RUN}@example.test`,
                handle: ACTOR_HANDLE,
            },
            {
                id: RECIP_ID,
                name: "Recip",
                email: `recip-pm-${RUN}@example.test`,
                handle: RECIP_HANDLE,
            },
        ],
    });
});

afterAll(async () => {
    await db.notification.deleteMany({
        where: { userId: { in: [ACTOR_ID, RECIP_ID] } },
    });
    await db.post.deleteMany({ where: { authorId: { in: [ACTOR_ID, RECIP_ID] } } });
    await db.user.deleteMany({ where: { id: { in: [ACTOR_ID, RECIP_ID] } } });
    await db.$disconnect();
});

describe("createPostCore mention notifications", () => {
    it("creates a MENTION notification when body mentions another user", async () => {
        const body = `Hey @${RECIP_HANDLE} check this out!`;
        const result = await createPostCore(db, ACTOR_ID, {
            title: "Mention test post",
            body,
            isAnonymous: false,
        });
        expect(result.ok).toBe(true);
        if (!result.ok) return;

        const notif = await db.notification.findFirst({
            where: { userId: RECIP_ID, type: "MENTION", postId: result.id },
        });
        expect(notif).not.toBeNull();
        expect(notif?.actorId).toBe(ACTOR_ID);
        expect(notif?.commentId).toBeNull();
    });

    it("creates a MENTION notification with actorId null for anonymous posts", async () => {
        const body = `Anonymous shoutout to @${RECIP_HANDLE}!`;
        const result = await createPostCore(db, ACTOR_ID, {
            title: "Anonymous mention post",
            body,
            isAnonymous: true,
        });
        expect(result.ok).toBe(true);
        if (!result.ok) return;

        const notif = await db.notification.findFirst({
            where: { userId: RECIP_ID, type: "MENTION", postId: result.id },
        });
        expect(notif).not.toBeNull();
        expect(notif?.actorId).toBeNull();
        expect(notif?.commentId).toBeNull();
    });

    it("does not notify the author when they mention their own handle", async () => {
        const body = `I am @${ACTOR_HANDLE} and I mention myself.`;
        const before = await db.notification.count({ where: { userId: ACTOR_ID } });

        const result = await createPostCore(db, ACTOR_ID, {
            title: "Self-mention post",
            body,
            isAnonymous: false,
        });
        expect(result.ok).toBe(true);

        const after = await db.notification.count({ where: { userId: ACTOR_ID } });
        expect(after).toBe(before);
    });
});
