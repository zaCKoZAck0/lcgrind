import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { approveSubmissionCore, rejectSubmissionCore } from "../admin/core";

const db = new PrismaClient({
    datasourceUrl:
        process.env.DATABASE_URL ??
        "postgresql://myuser:mypassword@localhost:5432/mydb",
});

const RUN = Date.now().toString(36);
const USER = `vitest-gam-user-${RUN}`;
let companyId: number;
let reportId: string;

beforeAll(async () => {
    const company = await db.company.create({
        data: { slug: `vitest-gam-co-${RUN}`, name: `Gam Co ${RUN}`, reportCount: 1 },
    });
    companyId = company.id;
    await db.user.create({
        data: { id: USER, name: "Gam Tester", email: `${USER}@example.test` },
    });
    const report = await db.submission.create({
        data: {
            userId: USER,
            companyId,
            companyName: company.name,
            mode: "FORM",
            status: "PARSED",
            structured: {
                role: "SWE",
                expYears: 3,
                rounds: [
                    { type: "Coding", questions: [{ text: "Two sum", type: "DSA" }] },
                ],
                comp: { currency: "USD", tc: 200000 },
            },
        },
    });
    reportId = report.id;
});

afterAll(async () => {
    await db.pointsLedger.deleteMany({ where: { userId: USER } });
    await db.userBadge.deleteMany({ where: { userId: USER } });
    await db.communityQuestionAsk.deleteMany({ where: { companyId } });
    await db.communityCompPoint.deleteMany({ where: { companyId } });
    await db.submission.deleteMany({ where: { userId: USER } });
    await db.user.delete({ where: { id: USER } });
    await db.company.delete({ where: { id: companyId } });
    await db.$disconnect();
});

describe("approval gamification", () => {
    it("writes a ledger entry and updates the user total atomically", async () => {
        const result = await approveSubmissionCore(db, reportId);
        expect(result.ok).toBe(true);

        const ledger = await db.pointsLedger.findMany({ where: { submissionId: reportId } });
        expect(ledger).toHaveLength(1);
        // Report (50) + detail bonus (10).
        expect(ledger[0].delta).toBe(60);

        const user = await db.user.findUnique({ where: { id: USER } });
        expect(user?.points).toBe(60);
    });

    it("is idempotent: re-approving does not double-count", async () => {
        await approveSubmissionCore(db, reportId);
        const user = await db.user.findUnique({ where: { id: USER } });
        expect(user?.points).toBe(60);
        const ledger = await db.pointsLedger.findMany({ where: { submissionId: reportId } });
        expect(ledger).toHaveLength(1);
    });

    it("awards the First Report badge after approval", async () => {
        const badges = await db.userBadge.findMany({ where: { userId: USER } });
        expect(badges.map((b) => b.badge)).toContain("first-report");
    });

    it("reverses points to zero when the submission is rejected", async () => {
        const result = await rejectSubmissionCore(db, reportId, "spam");
        expect(result.ok).toBe(true);
        const user = await db.user.findUnique({ where: { id: USER } });
        expect(user?.points).toBe(0);
        const ledger = await db.pointsLedger.findMany({ where: { submissionId: reportId } });
        expect(ledger).toHaveLength(0);
    });
});
