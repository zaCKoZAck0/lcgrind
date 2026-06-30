import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { creditDailyLogin } from "./core";

const db = new PrismaClient({
    datasourceUrl:
        process.env.DATABASE_URL ??
        "postgresql://myuser:mypassword@localhost:5432/mydb",
});

const RUN = Date.now().toString(36);
const USER = `vitest-daily-user-${RUN}`;
const today = new Date().toISOString().slice(0, 10);
const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

beforeAll(async () => {
    // Brand-new user: lastSeenOn defaults to null. This is the bugged case.
    await db.user.create({
        data: { id: USER, name: "Daily Tester", email: `${USER}@example.test` },
    });
});

afterAll(async () => {
    await db.pointsLedger.deleteMany({ where: { userId: USER } });
    await db.userBadge.deleteMany({ where: { userId: USER } });
    await db.user.delete({ where: { id: USER } });
    await db.$disconnect();
});

describe("creditDailyLogin", () => {
    it("credits a brand-new user whose lastSeenOn is null (regression)", async () => {
        await creditDailyLogin(db, USER);

        const user = await db.user.findUnique({ where: { id: USER } });
        expect(user?.lastSeenOn).toBe(today);
        expect(user?.loginStreak).toBe(1);
        expect(user?.longestStreak).toBe(1);
        expect(user?.exp).toBe(5);

        const ledger = await db.pointsLedger.findMany({
            where: { userId: USER, reason: "daily" },
        });
        expect(ledger).toHaveLength(1);
        expect(ledger[0].delta).toBe(5);
    });

    it("is idempotent within the same day (no double credit)", async () => {
        await creditDailyLogin(db, USER);

        const user = await db.user.findUnique({ where: { id: USER } });
        expect(user?.exp).toBe(5);
        expect(user?.loginStreak).toBe(1);

        const ledger = await db.pointsLedger.findMany({
            where: { userId: USER, reason: "daily" },
        });
        expect(ledger).toHaveLength(1);
    });

    it("increments the streak when the last login was yesterday", async () => {
        await db.user.update({
            where: { id: USER },
            data: { lastSeenOn: yesterday, loginStreak: 3, longestStreak: 3 },
        });

        await creditDailyLogin(db, USER);

        const user = await db.user.findUnique({ where: { id: USER } });
        expect(user?.lastSeenOn).toBe(today);
        expect(user?.loginStreak).toBe(4);
        expect(user?.longestStreak).toBe(4);
    });

    it("resets the streak to 1 after a missed day", async () => {
        await db.user.update({
            where: { id: USER },
            data: { lastSeenOn: "2020-01-01", loginStreak: 9, longestStreak: 9 },
        });

        await creditDailyLogin(db, USER);

        const user = await db.user.findUnique({ where: { id: USER } });
        expect(user?.loginStreak).toBe(1);
        // Longest is preserved across the reset.
        expect(user?.longestStreak).toBe(9);
    });
});
