import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
    approveSubmissionCore,
    approveSubmissionsCore,
} from "./core";

const db = new PrismaClient({
    datasourceUrl:
        process.env.DATABASE_URL ??
        "postgresql://myuser:mypassword@localhost:5432/mydb",
});

const RUN = `batch-${Date.now()}`;
const USER = `vitest-batch-user-${RUN}`;
const SLUG = `vitest-batch-co-${RUN}`;
let companyId: number;

const PAYLOAD = {
    role: "SWE",
    level: "L4",
    expYears: 3,
    rounds: [
        {
            type: "Coding",
            questions: [{ text: "Two sum", type: "DSA" }],
        },
    ],
    comp: { currency: "USD", base: 150000, tc: 200000 },
};

beforeAll(async () => {
    await db.user.create({
        data: { id: USER, name: "Batch Tester", email: `${USER}@example.test` },
    });
    const company = await db.company.create({
        data: { slug: SLUG, name: `Batch Co ${RUN}`, reportCount: 0 },
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
            companyName: `Batch Co ${RUN}`,
            mode: "FORM",
            structured: structured as object,
            status: "PENDING",
        },
        select: { id: true },
    });

describe("approveSubmissionsCore", () => {
    it("batch approve N submissions produces the same merged rows as N individual approvals", async () => {
        const [s1, s2, s3, s4] = await Promise.all([
            makeSubmission(PAYLOAD),
            makeSubmission(PAYLOAD),
            makeSubmission(PAYLOAD),
            makeSubmission(PAYLOAD),
        ]);

        // Approve first two individually
        await approveSubmissionCore(db, s1.id);
        await approveSubmissionCore(db, s2.id);
        // Approve last two via batch
        const batchResults = await approveSubmissionsCore(db, [s3.id, s4.id]);

        expect(batchResults.every((r) => r.ok)).toBe(true);

        // All four must be APPROVED
        const rows = await db.submission.findMany({
            where: { id: { in: [s1.id, s2.id, s3.id, s4.id] } },
            select: { id: true, status: true },
        });
        expect(rows.every((r) => r.status === "APPROVED")).toBe(true);

        // Community ask counts must match across individual and batch items
        const askCount = (id: string) =>
            db.communityQuestionAsk.count({ where: { submissionId: id } });
        const compCount = (id: string) =>
            db.communityCompPoint.count({ where: { submissionId: id } });

        const [ac1, ac2, ac3, ac4] = await Promise.all([
            askCount(s1.id),
            askCount(s2.id),
            askCount(s3.id),
            askCount(s4.id),
        ]);
        expect(ac1).toBe(1);
        expect(ac2).toBe(ac1);
        expect(ac3).toBe(ac1);
        expect(ac4).toBe(ac1);

        const [cc1, cc2, cc3, cc4] = await Promise.all([
            compCount(s1.id),
            compCount(s2.id),
            compCount(s3.id),
            compCount(s4.id),
        ]);
        expect(cc1).toBe(1);
        expect(cc2).toBe(cc1);
        expect(cc3).toBe(cc1);
        expect(cc4).toBe(cc1);

        // Statement/band fields match for asks
        const getAsk = (id: string) =>
            db.communityQuestionAsk.findFirst({
                where: { submissionId: id },
                select: { statement: true, band: true },
            });
        const [ask1, ask2, ask3, ask4] = await Promise.all([
            getAsk(s1.id),
            getAsk(s2.id),
            getAsk(s3.id),
            getAsk(s4.id),
        ]);
        expect(ask2).toEqual(ask1);
        expect(ask3).toEqual(ask1);
        expect(ask4).toEqual(ask1);

        // TC field matches for comp points
        const getComp = (id: string) =>
            db.communityCompPoint.findFirst({
                where: { submissionId: id },
                select: { tc: true },
            });
        const [comp1, comp2, comp3, comp4] = await Promise.all([
            getComp(s1.id),
            getComp(s2.id),
            getComp(s3.id),
            getComp(s4.id),
        ]);
        expect(comp2).toEqual(comp1);
        expect(comp3).toEqual(comp1);
        expect(comp4).toEqual(comp1);
    });

    it("batch approve continues past a failing item and reports per-item results", async () => {
        const ok1 = await makeSubmission({
            role: "SWE",
            rounds: [{ type: "Coding", questions: [{ text: "LRU Cache" }] }],
        });
        // Middle: no payload and no companyId — approveSubmissionCore fails
        const mid = await db.submission.create({
            data: {
                userId: USER,
                companyId: null,
                companyName: "Unlinked Co",
                mode: "FORM",
                structured: null,
                parsed: null,
                status: "PENDING",
            },
            select: { id: true },
        });
        const ok2 = await makeSubmission({
            role: "SWE",
            rounds: [{ type: "Coding", questions: [{ text: "LRU Cache" }] }],
        });

        const results = await approveSubmissionsCore(db, [ok1.id, mid.id, ok2.id]);

        expect(results).toHaveLength(3);

        const r1 = results.find((r) => r.id === ok1.id)!;
        const rm = results.find((r) => r.id === mid.id)!;
        const r2 = results.find((r) => r.id === ok2.id)!;

        expect(r1.ok).toBe(true);
        expect(rm.ok).toBe(false);
        expect(rm.error).toBeTruthy();
        expect(r2.ok).toBe(true);

        const [row1, rowM, row2] = await Promise.all([
            db.submission.findUnique({ where: { id: ok1.id }, select: { status: true } }),
            db.submission.findUnique({ where: { id: mid.id }, select: { status: true } }),
            db.submission.findUnique({ where: { id: ok2.id }, select: { status: true } }),
        ]);
        expect(row1?.status).toBe("APPROVED");
        expect(rowM?.status).toBe("PENDING"); // unchanged — batch continued past it
        expect(row2?.status).toBe("APPROVED");
    });
});
