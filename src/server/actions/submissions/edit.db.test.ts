import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { approveSubmissionCore } from "../admin/core";
import { updateSubmissionCore } from "./core";

const db = new PrismaClient({
    datasourceUrl:
        process.env.DATABASE_URL ??
        "postgresql://myuser:mypassword@localhost:5432/mydb",
});

const RUN = Date.now().toString(36);
const OWNER = `vitest-edit-owner-${RUN}`;
const OTHER = `vitest-edit-other-${RUN}`;
let companyId: number;
let companyName: string;

async function makeSubmission(status = "PENDING") {
    return db.submission.create({
        data: {
            userId: OWNER,
            companyId,
            companyName,
            mode: "FORM",
            status,
            structured: {
                role: "SWE",
                expYears: 3,
                rounds: [{ type: "Coding", questions: [{ text: "Two sum", type: "DSA" }] }],
                comp: { currency: "USD", tc: 200000 },
            },
        },
        select: { id: true },
    });
}

beforeAll(async () => {
    const company = await db.company.create({
        data: { slug: `vitest-edit-co-${RUN}`, name: `Edit Co ${RUN}`, reportCount: 1 },
    });
    companyId = company.id;
    companyName = company.name;
    await db.user.createMany({
        data: [
            { id: OWNER, name: "Owner", email: `${OWNER}@example.test` },
            { id: OTHER, name: "Other", email: `${OTHER}@example.test` },
        ],
    });
});

afterAll(async () => {
    await db.pointsLedger.deleteMany({ where: { userId: { in: [OWNER, OTHER] } } });
    await db.userBadge.deleteMany({ where: { userId: { in: [OWNER, OTHER] } } });
    await db.communityQuestionAsk.deleteMany({ where: { companyId } });
    await db.communityCompPoint.deleteMany({ where: { companyId } });
    await db.submission.deleteMany({ where: { userId: { in: [OWNER, OTHER] } } });
    await db.user.deleteMany({ where: { id: { in: [OWNER, OTHER] } } });
    await db.company.delete({ where: { id: companyId } });
    await db.$disconnect();
});

const mkEdit = (tag: string) => ({
    companyName: "Edit Co Renamed",
    mode: "TEXT" as const,
    rawText: `Edited ${tag}: a phone screen and an onsite with two coding rounds and design discussion.`,
});

describe("updateSubmissionCore", () => {
    it("rejects edits from a non-author and changes nothing", async () => {
        const sub = await makeSubmission();
        const result = await updateSubmissionCore(db, OTHER, sub.id, mkEdit("a"));
        expect(result.ok).toBe(false);
        const row = await db.submission.findUnique({ where: { id: sub.id } });
        expect(row?.status).toBe("PENDING");
        expect(row?.rawText).toBeNull();
    });

    it("resets status to PENDING and clears the parsed payload on any edit", async () => {
        const sub = await db.submission.create({
            data: {
                userId: OWNER,
                companyId,
                companyName,
                mode: "TEXT",
                status: "PARSED",
                rawText: "Original text long enough to pass the minimum length check easily.",
                parsed: { role: "SWE", rounds: [] },
            },
            select: { id: true },
        });
        const result = await updateSubmissionCore(db, OWNER, sub.id, mkEdit("b"));
        expect(result.ok).toBe(true);
        const row = await db.submission.findUnique({ where: { id: sub.id } });
        expect(row?.status).toBe("PENDING");
        expect(row?.parsed).toBeNull();
        expect(row?.rawText).toContain("Edited");
    });

    it("withdraws community rows and reverses points when editing an approved submission", async () => {
        const sub = await makeSubmission("PARSED");
        await approveSubmissionCore(db, sub.id);
        const before = await db.user.findUnique({ where: { id: OWNER } });
        expect(before?.points).toBeGreaterThan(0);

        const result = await updateSubmissionCore(db, OWNER, sub.id, mkEdit("c"));
        expect(result.ok).toBe(true);

        const asks = await db.communityQuestionAsk.findMany({ where: { submissionId: sub.id } });
        const comp = await db.communityCompPoint.findMany({ where: { submissionId: sub.id } });
        expect(asks).toHaveLength(0);
        expect(comp).toHaveLength(0);

        const after = await db.user.findUnique({ where: { id: OWNER } });
        const ledger = await db.pointsLedger.findMany({ where: { submissionId: sub.id } });
        const sum = ledger.reduce((a, e) => a + e.delta, 0);
        expect(sum).toBe(0);
        expect(after?.points).toBe((before?.points ?? 0) - 60);
        // A negative reversal entry is recorded (audit trail preserved).
        expect(ledger.some((e) => e.delta < 0)).toBe(true);
    });

    it("does not count against the weekly quota", async () => {
        // Saturate the weekly cap with throwaway submissions.
        for (let i = 0; i < 7; i++) {
            await db.submission.create({
                data: {
                    userId: OWNER,
                    companyId,
                    companyName,
                    mode: "TEXT",
                    status: "PENDING",
                    rawText: `Quota filler submission number ${i} with enough length to be valid here.`,
                },
            });
        }
        const sub = await makeSubmission();
        const result = await updateSubmissionCore(db, OWNER, sub.id, mkEdit("d"));
        expect(result.ok).toBe(true);
    });
});
