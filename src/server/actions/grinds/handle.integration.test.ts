import { PrismaClient } from "@prisma/client";
import { afterAll, describe, expect, it } from "vitest";

import { generateHandle } from "./handle";

const db = new PrismaClient({
    datasourceUrl:
        process.env.DATABASE_URL ??
        "postgresql://myuser:mypassword@localhost:5432/mydb",
});

const RUN = Date.now().toString(36);
// Track cids created so afterAll can clean up without touching other users.
const createdIds: string[] = [];

async function makeUser(handle: string) {
    const u = await db.user.create({
        data: {
            id: `vitest-hdl-${RUN}-${handle}`,
            name: "Hdl Test",
            email: `hdl-${handle}-${RUN}@example.com`,
            emailVerified: false,
            handle,
        },
    });
    createdIds.push(u.id);
    return u;
}

afterAll(async () => {
    await db.user.deleteMany({ where: { id: { in: createdIds } } });
    await db.$disconnect();
});

describe("generateHandle", () => {
    it("produces a valid handle from a regular name", async () => {
        const h = await generateHandle(db, "Alice Smith");
        expect(h).toMatch(/^[a-z][a-z0-9_]{2,19}$/);
    });

    it("dedupes under collision — two users with same seed get distinct handles", async () => {
        const seed = `coltest${RUN}`.slice(0, 12);
        const h1 = await generateHandle(db, seed);
        await makeUser(h1); // claim h1 in DB
        const h2 = await generateHandle(db, seed);
        expect(h1).not.toBe(h2);
        expect(h2).toMatch(/^[a-z][a-z0-9_]{2,19}$/);
    });

    it("sanitizes a junk/numeric-only seed to a valid handle", async () => {
        // seeds that start with digits or contain only non-alpha chars must still
        // produce a HANDLE_RE-valid result (leading letter, 3-20 chars).
        const h = await generateHandle(db, "123!!!");
        expect(h).toMatch(/^[a-z][a-z0-9_]{2,19}$/);
    });

    it("sanitizes an empty seed to a valid handle", async () => {
        const h = await generateHandle(db, "");
        expect(h).toMatch(/^[a-z][a-z0-9_]{2,19}$/);
    });
});
