import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
    createSubmissionCore,
    remainingQuota,
    WEEKLY_SUBMISSION_CAP,
    MIN_TEXT_LENGTH,
} from "./core";

const db = new PrismaClient({
    datasourceUrl:
        process.env.DATABASE_URL ??
        "postgresql://myuser:mypassword@localhost:5432/mydb",
});

const RUN = Date.now().toString(36);
const USER_A = `vitest-user-a-${RUN}`;
const USER_B = `vitest-user-b-${RUN}`;

const longText = (label: string) =>
    `${label}: ` +
    "The interview started with a phone screen covering arrays and hashing, " +
    "followed by an onsite with two coding rounds, one system design round " +
    "about a URL shortener, and a final behavioral conversation with the manager.";

beforeAll(async () => {
    for (const id of [USER_A, USER_B]) {
        await db.user.create({
            data: {
                id,
                name: `Vitest ${id}`,
                email: `${id}@example.test`,
            },
        });
    }
});

afterAll(async () => {
    await db.user.deleteMany({ where: { id: { in: [USER_A, USER_B] } } });
    await db.$disconnect();
});

describe("createSubmissionCore — TEXT mode", () => {
    it("creates a PENDING submission and reports remaining quota", async () => {
        const result = await createSubmissionCore(db, USER_A, {
            companyName: "Acme Corp",
            mode: "TEXT",
            rawText: longText("create-pending"),
        });
        expect(result.ok).toBe(true);
        if (result.ok === false) return;
        expect(result.remaining).toBe(WEEKLY_SUBMISSION_CAP - 1);

        const row = await db.submission.findUniqueOrThrow({
            where: { id: result.id },
        });
        expect(row.status).toBe("PENDING");
        expect(row.mode).toBe("TEXT");
        expect(row.userId).toBe(USER_A);
        expect(row.companyName).toBe("Acme Corp");
        expect(row.parsed).toBeNull();
    });

    it("rejects raw text below the minimum length", async () => {
        const result = await createSubmissionCore(db, USER_A, {
            companyName: "Acme Corp",
            mode: "TEXT",
            rawText: "too short",
        });
        expect(result.ok).toBe(false);
        if (result.ok === true) return;
        expect(result.error).toMatch(new RegExp(`${MIN_TEXT_LENGTH}`));
    });

    it("rejects a blank company name", async () => {
        const result = await createSubmissionCore(db, USER_A, {
            companyName: "   ",
            mode: "TEXT",
            rawText: longText("blank-company"),
        });
        expect(result.ok).toBe(false);
        if (result.ok === true) return;
        expect(result.error.toLowerCase()).toContain("company");
    });

    it("rejects an exact duplicate text for the same user", async () => {
        const text = longText("duplicate-check");
        const first = await createSubmissionCore(db, USER_A, {
            companyName: "DupCo",
            mode: "TEXT",
            rawText: text,
        });
        expect(first.ok).toBe(true);

        const second = await createSubmissionCore(db, USER_A, {
            companyName: "DupCo",
            mode: "TEXT",
            rawText: text,
        });
        expect(second.ok).toBe(false);
        if (second.ok === true) return;
        expect(second.error.toLowerCase()).toContain("already");
    });

    it("allows the same text from a different user", async () => {
        const result = await createSubmissionCore(db, USER_B, {
            companyName: "DupCo",
            mode: "TEXT",
            rawText: longText("duplicate-check"),
        });
        expect(result.ok).toBe(true);
    });
});

describe("createSubmissionCore — FORM mode", () => {
    it("persists the structured payload as PENDING", async () => {
        const structured = {
            role: "Software Engineer",
            level: "SDE2",
            expYears: 4,
            rounds: [
                {
                    type: "Coding",
                    questions: [
                        {
                            text: "Two sum variant on a sorted array",
                            type: "DSA",
                            problemUrl:
                                "https://leetcode.com/problems/two-sum/",
                        },
                    ],
                },
            ],
            comp: { currency: "USD", base: 150000, tc: 210000 },
        };
        const result = await createSubmissionCore(db, USER_A, {
            companyName: "Acme Corp",
            mode: "FORM",
            structured,
        });
        expect(result.ok).toBe(true);
        if (result.ok === false) return;

        const row = await db.submission.findUniqueOrThrow({
            where: { id: result.id },
        });
        expect(row.status).toBe("PENDING");
        expect(row.mode).toBe("FORM");
        expect(row.structured).toMatchObject({ role: "Software Engineer" });
        expect(row.rawText).toBeNull();
    });

    it("rejects a structured payload with neither rounds nor compensation", async () => {
        const result = await createSubmissionCore(db, USER_A, {
            companyName: "Acme Corp",
            mode: "FORM",
            structured: { role: "Software Engineer", rounds: [] },
        });
        expect(result.ok).toBe(false);
        if (result.ok === true) return;
        expect(result.error.toLowerCase()).toMatch(/round|compensation/);
    });
});

describe("weekly quota", () => {
    it("rejects the 8th submission within a rolling week", async () => {
        const existing = await db.submission.count({
            where: { userId: USER_B },
        });
        const toSeed = WEEKLY_SUBMISSION_CAP - existing;
        await db.submission.createMany({
            data: Array.from({ length: toSeed }, (_, i) => ({
                userId: USER_B,
                companyName: `QuotaCo ${i}`,
                mode: "TEXT",
                rawText: longText(`quota-seed-${i}`),
            })),
        });

        expect(await remainingQuota(db, USER_B)).toBe(0);

        const result = await createSubmissionCore(db, USER_B, {
            companyName: "QuotaCo overflow",
            mode: "TEXT",
            rawText: longText("quota-overflow"),
        });
        expect(result.ok).toBe(false);
        if (result.ok === true) return;
        expect(result.error.toLowerCase()).toContain("week");
        expect(result.remaining).toBe(0);
    });

    it("does not count submissions older than 7 days", async () => {
        const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
        await db.submission.deleteMany({ where: { userId: USER_B } });
        await db.submission.create({
            data: {
                userId: USER_B,
                companyName: "OldCo",
                mode: "TEXT",
                rawText: longText("old-submission"),
                createdAt: eightDaysAgo,
            },
        });
        expect(await remainingQuota(db, USER_B)).toBe(WEEKLY_SUBMISSION_CAP);
    });
});
