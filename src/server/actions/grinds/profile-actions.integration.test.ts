import { PrismaClient } from "@prisma/client";
import { afterAll, describe, expect, it } from "vitest";

import { HANDLE_RE } from "~/config/grinds";
import { updateProfile } from "./profile-actions";

const db = new PrismaClient({
    datasourceUrl:
        process.env.DATABASE_URL ??
        "postgresql://myuser:mypassword@localhost:5432/mydb",
});

const RUN = Date.now().toString(36);
const createdIds: string[] = [];

async function makeUser(suffix: string, handle: string) {
    const u = await db.user.create({
        data: {
            id: `vitest-pa-${RUN}-${suffix}`,
            name: "PA Test",
            email: `pa-${suffix}-${RUN}@example.com`,
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

describe("updateProfile", () => {
    it("updates name + handle and marks onboarded", async () => {
        const u = await makeUser("a", `paa${RUN}`.slice(0, 18));

        const result = await updateProfile(db, u.id, {
            name: "Alice Updated",
            handle: `updated${RUN}`.slice(0, 18),
        });

        expect(result.ok).toBe(true);

        const fresh = await db.user.findUniqueOrThrow({
            where: { id: u.id },
            select: { name: true, handle: true, onboardedAt: true },
        });
        expect(fresh.name).toBe("Alice Updated");
        expect(fresh.handle).toMatch(HANDLE_RE);
        expect(fresh.onboardedAt).not.toBeNull();
    });

    it("rejects a malformed handle (fails HANDLE_RE)", async () => {
        const u = await makeUser("b", `pab${RUN}`.slice(0, 18));
        const result = await updateProfile(db, u.id, {
            name: "Bob",
            handle: "!!!bad",
        });
        expect(result.ok).toBe(false);
        if (result.ok === false) {
            expect(result.error).toMatch(/handle/i);
        }
    });

    it("maps a duplicate handle (P2002) to a user-facing error", async () => {
        const existingHandle = `paexist${RUN}`.slice(0, 18);
        await makeUser("c", existingHandle); // occupies the handle
        const u = await makeUser("d", `pad${RUN}`.slice(0, 18));

        const result = await updateProfile(db, u.id, {
            name: "Dave",
            handle: existingHandle, // already taken
        });
        expect(result.ok).toBe(false);
        if (result.ok === false) {
            expect(result.error).toMatch(/taken/i);
        }
    });
});
