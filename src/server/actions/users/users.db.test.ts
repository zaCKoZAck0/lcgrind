import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { searchMentionUsersCore } from "./core";

const db = new PrismaClient({
    datasourceUrl:
        process.env.DATABASE_URL ??
        "postgresql://myuser:mypassword@localhost:5432/mydb",
});

const RUN = Date.now().toString(36);
const PREFIX = `mnt${RUN}`;
const OTHER_PREFIX = `xyz${RUN}`;
const AVT_PREFIX = `avt${RUN}`;

const USER_IDS: string[] = [];

beforeAll(async () => {
    // 6 users with handles matching PREFIX (to test the cap-5 behaviour)
    const matching = Array.from({ length: 6 }, (_, i) => ({
        id: `vitest-usr-${RUN}-m${i}`,
        name: `Mention ${i}`,
        email: `mnt-${RUN}-${i}@example.test`,
        handle: `${PREFIX}${String.fromCharCode(97 + i)}`,
    }));
    // 1 user with a different prefix
    const other = {
        id: `vitest-usr-${RUN}-o`,
        name: "Other",
        email: `xyz-${RUN}@example.test`,
        handle: `${OTHER_PREFIX}z`,
    };
    // 1 user with null handle (should never appear in handle-prefix searches)
    const noHandle = {
        id: `vitest-usr-${RUN}-n`,
        name: "NoHandle",
        email: `nohandle-${RUN}@example.test`,
    };
    // users for avatarUrl precedence tests
    const withImageAndAvatar = {
        id: `vitest-usr-${RUN}-ia`,
        name: "WithImageAndAvatar",
        email: `ia-${RUN}@example.test`,
        handle: `${AVT_PREFIX}img`,
        image: "https://example.test/image.png",
        avatar: "https://example.test/avatar.png",
    };
    const withAvatarOnly = {
        id: `vitest-usr-${RUN}-ao`,
        name: "WithAvatarOnly",
        email: `ao-${RUN}@example.test`,
        handle: `${AVT_PREFIX}avt`,
        avatar: "https://example.test/only-avatar.png",
    };

    await db.user.createMany({ data: [...matching, other, noHandle, withImageAndAvatar, withAvatarOnly] });
    USER_IDS.push(
        ...matching.map((u) => u.id),
        other.id,
        noHandle.id,
        withImageAndAvatar.id,
        withAvatarOnly.id,
    );
});

afterAll(async () => {
    await db.user.deleteMany({ where: { id: { in: USER_IDS } } });
    await db.$disconnect();
});

describe("searchMentionUsersCore", () => {
    it("returns at most 5 users for a matching prefix", async () => {
        const results = await searchMentionUsersCore(db, PREFIX);
        expect(results).toHaveLength(5);
    });

    it("returns users ordered by handle ascending", async () => {
        const results = await searchMentionUsersCore(db, PREFIX);
        const handles = results.map((u) => u.handle);
        expect(handles).toEqual([...handles].sort());
    });

    it("matches a different prefix independently", async () => {
        const results = await searchMentionUsersCore(db, OTHER_PREFIX);
        expect(results).toHaveLength(1);
        expect(results[0].handle).toBe(`${OTHER_PREFIX}z`);
    });

    it("strips a leading @ before matching", async () => {
        const results = await searchMentionUsersCore(db, `@${OTHER_PREFIX}`);
        expect(results).toHaveLength(1);
        expect(results[0].handle).toBe(`${OTHER_PREFIX}z`);
    });

    it("returns only handle, name, and avatarUrl fields", async () => {
        const results = await searchMentionUsersCore(db, OTHER_PREFIX);
        expect(results.length).toBeGreaterThan(0);
        const keys = Object.keys(results[0]).sort();
        expect(keys).toEqual(["avatarUrl", "handle", "name"]);
    });

    it("maps image (preferred) to avatarUrl when both image and avatar are set", async () => {
        const results = await searchMentionUsersCore(db, `${AVT_PREFIX}img`);
        expect(results).toHaveLength(1);
        expect(results[0].avatarUrl).toBe("https://example.test/image.png");
    });

    it("maps avatar to avatarUrl when only avatar is set", async () => {
        const results = await searchMentionUsersCore(db, `${AVT_PREFIX}avt`);
        expect(results).toHaveLength(1);
        expect(results[0].avatarUrl).toBe("https://example.test/only-avatar.png");
    });

    it("excludes users with null handle", async () => {
        // null-handle users can't match a handle-prefix filter
        // Verify none of our returned results are the null-handle user
        const results = await searchMentionUsersCore(db, PREFIX);
        expect(results.every((u) => u.handle !== null)).toBe(true);
    });

    it("returns empty array for empty prefix", async () => {
        expect(await searchMentionUsersCore(db, "")).toEqual([]);
    });

    it("returns empty array for prefix starting with a digit", async () => {
        expect(await searchMentionUsersCore(db, "123abc")).toEqual([]);
    });

    it("returns empty array for a bare @ with nothing after", async () => {
        expect(await searchMentionUsersCore(db, "@")).toEqual([]);
    });

    it("returns empty array for prefix with special characters", async () => {
        expect(await searchMentionUsersCore(db, "ab!cd")).toEqual([]);
    });
});
