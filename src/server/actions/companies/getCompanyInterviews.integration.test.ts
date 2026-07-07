// DB-backed integration tests: exercise the interviews action against a real
// Postgres through Prisma. The suite seeds its own uniquely-slugged company,
// cleans up after itself, and skips entirely when DATABASE_URL is unset so the
// default `pnpm test` run stays green without a database.
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const HAS_DB = Boolean(process.env.DATABASE_URL);

function monthShift(back: number): string {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - back);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Mid-month UTC timestamp so the derived YYYY-MM is stable across timezones.
function monthShiftDate(back: number): Date {
    const d = new Date();
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - back, 15));
}

function utcMonth(d: Date): string {
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

describe.skipIf(!HAS_DB)("getCompanyInterviews (integration)", () => {
    const slug = `it-weight-ordering-${Date.now()}`;
    let db: typeof import("~/lib/db").db;
    let getCompanyInterviews: typeof import("./getCompanyInterviews").getCompanyInterviews;
    let companyId: number;
    let userId: string;
    let submissionId: string;

    beforeAll(async () => {
        ({ db } = await import("~/lib/db"));
        ({ getCompanyInterviews } = await import("./getCompanyInterviews"));
        const company = await db.company.create({
            data: { slug, name: "Integration Test Co", reportCount: 2 },
        });
        companyId = company.id;
        await db.companyQuestionStat.createMany({
            data: [
                {
                    companyId, band: "all", type: "DSA", kind: "question",
                    statement: "Stale staple", askCount: 10, lastAsked: monthShift(15),
                },
                {
                    companyId, band: "all", type: "DSA", kind: "question",
                    statement: "Fresh report", askCount: 1, lastAsked: monthShift(0),
                },
            ],
        });

        // Approved community asks: two reports for one statement, four months
        // apart, so the action derives first/last asked months at read time.
        const user = await db.user.create({
            data: {
                id: `it-user-${Date.now()}`,
                name: "Integration Test User",
                email: `it-${slug}@example.test`,
            },
        });
        userId = user.id;
        const submission = await db.submission.create({
            data: {
                userId,
                companyId,
                companyName: "Integration Test Co",
                mode: "TEXT",
                status: "APPROVED",
            },
        });
        submissionId = submission.id;
        await db.communityQuestionAsk.createMany({
            data: [
                {
                    companyId, submissionId, band: "all", type: "DSA",
                    statement: "Community classic", createdAt: monthShiftDate(4),
                },
                {
                    companyId, submissionId, band: "all", type: "DSA",
                    statement: "Community classic", createdAt: monthShiftDate(1),
                },
            ],
        });
    });

    afterAll(async () => {
        await db.communityQuestionAsk.deleteMany({ where: { companyId } });
        await db.submission.deleteMany({ where: { id: submissionId } });
        await db.user.deleteMany({ where: { id: userId } });
        await db.companyQuestionStat.deleteMany({ where: { companyId } });
        await db.company.delete({ where: { id: companyId } });
        await db.$disconnect();
    });

    it("orders a freshly reported question above a stale high-count one", async () => {
        const sections = await getCompanyInterviews(slug);
        expect(sections.problemSolving.map((q) => q.statement)).toEqual([
            "Fresh report",
            "Stale staple",
            "Community classic",
        ]);
    });

    it("derives month-truncated first/last asked for community-only questions", async () => {
        const sections = await getCompanyInterviews(slug);
        const row = sections.problemSolving.find(
            (q) => q.statement === "Community classic",
        );
        expect(row).toMatchObject({
            askCount: 2,
            firstAsked: utcMonth(monthShiftDate(4)),
            lastAsked: utcMonth(monthShiftDate(1)),
        });
    });

    it("never serializes the ranking weight to the client", async () => {
        const sections = await getCompanyInterviews(slug);
        for (const q of sections.problemSolving) {
            expect(q).not.toHaveProperty("weight");
        }
    });
});
