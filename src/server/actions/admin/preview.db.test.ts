import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { buildMergePreviewCore } from "./preview";
import { normalizeSubmission, type SanitizedExperience } from "./core";

const db = new PrismaClient({
    datasourceUrl:
        process.env.DATABASE_URL ??
        "postgresql://myuser:mypassword@localhost:5432/mydb",
});

const RUN = Date.now().toString(36);
const USER = `vitest-preview-user-${RUN}`;
const SLUG = `vitest-preview-co-${RUN}`;
let companyId: number;

beforeAll(async () => {
    await db.user.create({
        data: { id: USER, name: "Preview Tester", email: `${USER}@example.test` },
    });
    const company = await db.company.create({
        data: { slug: SLUG, name: `Vitest Preview Co ${RUN}`, reportCount: 0 },
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

const makeParsedSubmission = (data: unknown) =>
    db.submission.create({
        data: {
            userId: USER,
            companyId,
            companyName: `Vitest Preview Co ${RUN}`,
            mode: "FORM",
            parsed: data as object,
            status: "PARSED",
        },
        select: { id: true },
    });

describe("buildMergePreviewCore", () => {
    it("returns { ok: false } for a missing submission", async () => {
        const result = await buildMergePreviewCore(db, "nonexistent-id-preview");
        expect(result.ok).toBe(false);
    });

    it("returns { ok: false } for a submission with no payload", async () => {
        const sub = await db.submission.create({
            data: {
                userId: USER,
                companyId,
                companyName: `Vitest Preview Co ${RUN}`,
                mode: "FORM",
                status: "PENDING",
            },
            select: { id: true },
        });
        const result = await buildMergePreviewCore(db, sub.id);
        expect(result.ok).toBe(false);
    });

    it("resolves problem match by URL and null for free-text question", async () => {
        const problem = await db.problem.findFirst({
            select: { id: true, url: true, title: true },
        });
        if (!problem) return; // no seeded problems locally; skip

        const sub = await makeParsedSubmission({
            role: "SWE",
            level: "L4",
            expYears: 3,
            rounds: [
                {
                    type: "Coding",
                    questions: [
                        {
                            text: problem.title,
                            type: "DSA",
                            problemUrl: problem.url,
                        },
                        { text: "Design a rate limiter", type: "System Design" },
                    ],
                },
            ],
            comp: { currency: "USD", base: 120000, tc: 200000 },
        });

        const result = await buildMergePreviewCore(db, sub.id);
        expect(result.ok).toBe(true);
        if (!result.ok) return;

        const { preview } = result;
        expect(preview.role).toBe("SWE");
        expect(preview.level).toBe("L4");
        expect(preview.expYears).toBe(3);
        expect(preview.questions).toHaveLength(2);

        const matched = preview.questions[0];
        expect(matched.problem).not.toBeNull();
        expect(matched.problem?.id).toBe(problem.id);
        expect(matched.problem?.title).toBe(problem.title);
        expect(matched.problem?.url).toBe(problem.url);
        expect(matched.band).toBe("2-5");
        expect(matched.type).toBe("DSA");

        const unmatched = preview.questions[1];
        expect(unmatched.problem).toBeNull();
        expect(unmatched.statement).toBe("Design a rate limiter");
        expect(unmatched.band).toBe("2-5");

        expect(preview.comp).not.toBeNull();
        expect(preview.comp?.currency).toBe("USD");
        expect(preview.comp?.base).toBe(120000);
        expect(preview.comp?.tc).toBe(200000);
    });

    it("preview questions and comp correspond 1:1 with normalizeSubmission output", async () => {
        // Verify consistency: buildMergePreviewCore and normalizeSubmission must produce
        // the same rows. This test avoids approveSubmissionCore (which calls the global
        // recomputeCompanyTiers) to prevent concurrency interference with other DB test
        // files running in parallel.
        const problem = await db.problem.findFirst({
            select: { id: true, url: true, title: true },
        });

        const payload: SanitizedExperience = {
            role: "Engineering",
            expYears: 4,
            rounds: [
                {
                    type: "Coding",
                    questions: [
                        ...(problem
                            ? [
                                  {
                                      text: problem.title,
                                      type: "DSA",
                                      problemUrl: problem.url,
                                  },
                              ]
                            : []),
                        { text: "System design question", type: "System Design" },
                    ],
                },
            ],
            comp: { currency: "USD", tc: 300000 },
        };

        const sub = await makeParsedSubmission(payload);

        const previewResult = await buildMergePreviewCore(db, sub.id);
        expect(previewResult.ok).toBe(true);
        if (!previewResult.ok) return;

        const { preview } = previewResult;
        const { asks, comp } = normalizeSubmission(payload);

        // 1:1 correspondence: preview questions match normalized asks exactly
        expect(preview.questions).toHaveLength(asks.length);
        for (let i = 0; i < asks.length; i++) {
            expect(preview.questions[i].statement).toBe(asks[i].statement);
            expect(preview.questions[i].band).toBe(asks[i].band);
            expect(preview.questions[i].type).toBe(asks[i].type);
            if (asks[i].problemUrl && problem) {
                expect(preview.questions[i].problem).not.toBeNull();
                expect(preview.questions[i].problem?.id).toBe(problem.id);
            } else {
                expect(preview.questions[i].problem).toBeNull();
            }
        }

        // comp point matches
        const firstComp = comp[0];
        if (firstComp) {
            expect(preview.comp).not.toBeNull();
            expect(preview.comp?.currency).toBe(firstComp.currency);
            expect(preview.comp?.tc).toBe(firstComp.tc);
            expect(preview.comp?.base).toBe(firstComp.base);
        } else {
            expect(preview.comp).toBeNull();
        }
    });
});
