import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
    expBandOf,
    normalizeSubmission,
    approveSubmissionCore,
    rejectSubmissionCore,
} from "./core";

const db = new PrismaClient({
    datasourceUrl:
        process.env.DATABASE_URL ??
        "postgresql://myuser:mypassword@localhost:5432/mydb",
});

const RUN = Date.now().toString(36);
const USER = `vitest-admin-user-${RUN}`;
const SLUG = `vitest-co-${RUN}`;
let companyId: number;

beforeAll(async () => {
    await db.user.create({
        data: { id: USER, name: "Admin Tester", email: `${USER}@example.test` },
    });
    const company = await db.company.create({
        data: { slug: SLUG, name: `Vitest Co ${RUN}`, reportCount: 0 },
    });
    companyId = company.id;
});

afterAll(async () => {
    await db.communityQuestionAsk.deleteMany({ where: { companyId } });
    await db.communityCompPoint.deleteMany({ where: { companyId } });
    await db.submission.deleteMany({ where: { userId: USER } });
    await db.company.delete({ where: { id: companyId } });
    await db.user.delete({ where: { id: USER } });
    await db.$disconnect();
});

beforeEach(async () => {
    await db.communityQuestionAsk.deleteMany({ where: { companyId } });
    await db.communityCompPoint.deleteMany({ where: { companyId } });
    await db.submission.deleteMany({ where: { userId: USER } });
});

const makeSubmission = (structured: unknown) =>
    db.submission.create({
        data: {
            userId: USER,
            companyId,
            companyName: `Vitest Co ${RUN}`,
            mode: "FORM",
            structured: structured as object,
            status: "PENDING",
        },
        select: { id: true },
    });

describe("expBandOf", () => {
    it("maps experience years to the seeded band cut points", () => {
        expect(expBandOf(0)).toBe("0-2");
        expect(expBandOf(1.5)).toBe("0-2");
        expect(expBandOf(2)).toBe("2-5");
        expect(expBandOf(4)).toBe("2-5");
        expect(expBandOf(5)).toBe("5-8");
        expect(expBandOf(8)).toBe("8+");
        expect(expBandOf(12)).toBe("8+");
    });
    it("returns 'all' when experience is unknown", () => {
        expect(expBandOf(null)).toBe("all");
        expect(expBandOf(undefined)).toBe("all");
    });
});

describe("normalizeSubmission", () => {
    it("flattens rounds into question asks with the derived band", () => {
        const { asks, comp } = normalizeSubmission({
            expYears: 4,
            rounds: [
                {
                    type: "Coding",
                    questions: [
                        { text: "Reverse a linked list", type: "DSA" },
                        { text: "LRU cache", type: "LLD" },
                    ],
                },
            ],
        });
        expect(asks).toHaveLength(2);
        expect(asks[0]).toMatchObject({
            band: "2-5",
            type: "DSA",
            statement: "Reverse a linked list",
        });
        expect(comp).toHaveLength(0);
    });

    it("emits a comp point when compensation is present", () => {
        const { comp } = normalizeSubmission({
            role: "Software Engineer",
            level: "SDE2",
            expYears: 6,
            comp: { currency: "USD", base: 150000, tc: 250000 },
        });
        expect(comp).toHaveLength(1);
        expect(comp[0]).toMatchObject({
            roleFamily: "Software Engineer",
            expBand: "5-8",
            currency: "USD",
            tc: 250000,
        });
    });

    it("skips questions with empty statements", () => {
        const { asks } = normalizeSubmission({
            rounds: [{ type: "Coding", questions: [{ text: "  ", type: "DSA" }] }],
        });
        expect(asks).toHaveLength(0);
    });
});

describe("approveSubmissionCore", () => {
    it("writes community rows and flips status to APPROVED in one transaction", async () => {
        const sub = await makeSubmission({
            role: "Software Engineer",
            expYears: 3,
            rounds: [
                {
                    type: "Coding",
                    questions: [{ text: "Two sum", type: "DSA" }],
                },
            ],
            comp: { currency: "USD", tc: 200000 },
        });

        const result = await approveSubmissionCore(db, sub.id);
        expect(result.ok).toBe(true);

        const refreshed = await db.submission.findUniqueOrThrow({
            where: { id: sub.id },
        });
        expect(refreshed.status).toBe("APPROVED");

        const asks = await db.communityQuestionAsk.findMany({
            where: { submissionId: sub.id },
        });
        expect(asks).toHaveLength(1);
        expect(asks[0]).toMatchObject({ band: "2-5", statement: "Two sum" });

        const comp = await db.communityCompPoint.findMany({
            where: { submissionId: sub.id },
        });
        expect(comp).toHaveLength(1);
        expect(comp[0]).toMatchObject({ currency: "USD", tc: 200000 });
    });

    it("is idempotent: re-approving replaces rows rather than duplicating", async () => {
        const sub = await makeSubmission({
            expYears: 1,
            rounds: [{ type: "Coding", questions: [{ text: "FizzBuzz", type: "DSA" }] }],
        });
        await approveSubmissionCore(db, sub.id);
        await approveSubmissionCore(db, sub.id);
        const asks = await db.communityQuestionAsk.findMany({
            where: { submissionId: sub.id },
        });
        expect(asks).toHaveLength(1);
    });

    it("resolves problemId from a practice-problem URL when one exists", async () => {
        const problem = await db.problem.findFirst({ select: { url: true, id: true } });
        if (!problem) return; // no seeded problems locally; skip
        const sub = await makeSubmission({
            expYears: 2,
            rounds: [
                {
                    type: "Coding",
                    questions: [
                        { text: "Linked problem", type: "DSA", problemUrl: problem.url },
                    ],
                },
            ],
        });
        await approveSubmissionCore(db, sub.id);
        const ask = await db.communityQuestionAsk.findFirstOrThrow({
            where: { submissionId: sub.id },
        });
        expect(ask.problemId).toBe(problem.id);
    });
});

describe("rejectSubmissionCore", () => {
    it("flips status to REJECTED and writes no community rows", async () => {
        const sub = await makeSubmission({
            rounds: [{ type: "Coding", questions: [{ text: "X", type: "DSA" }] }],
        });
        await rejectSubmissionCore(db, sub.id, "noise");
        const refreshed = await db.submission.findUniqueOrThrow({
            where: { id: sub.id },
        });
        expect(refreshed.status).toBe("REJECTED");
        expect(refreshed.adminNote).toBe("noise");
        const asks = await db.communityQuestionAsk.count({
            where: { submissionId: sub.id },
        });
        expect(asks).toBe(0);
    });

    it("removes previously-approved community rows when an approved submission is rejected", async () => {
        const sub = await makeSubmission({
            expYears: 2,
            rounds: [{ type: "Coding", questions: [{ text: "Y", type: "DSA" }] }],
        });
        await approveSubmissionCore(db, sub.id);
        expect(
            await db.communityQuestionAsk.count({ where: { submissionId: sub.id } }),
        ).toBe(1);
        await rejectSubmissionCore(db, sub.id, null);
        expect(
            await db.communityQuestionAsk.count({ where: { submissionId: sub.id } }),
        ).toBe(0);
    });
});
