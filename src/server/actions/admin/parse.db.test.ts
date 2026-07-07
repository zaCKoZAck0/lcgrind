import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { autoParseSubmissionForPost, parseSubmissionsCore } from "./parse";

const db = new PrismaClient({
    datasourceUrl:
        process.env.DATABASE_URL ??
        "postgresql://myuser:mypassword@localhost:5432/mydb",
});

const RUN = Date.now().toString(36);
const USER = `vitest-parse-user-${RUN}`;
let textId: string;
let blankId: string;
let failId: string;

// A submission forked from a post, as created by createPostCore.
async function forkedSubmission(
    tag: string,
    data: { mode: string; status?: string; rawText: string | null },
) {
    const post = await db.post.create({
        data: {
            authorId: USER,
            title: `Auto-parse fixture ${tag} ${RUN}`,
            slug: `auto-parse-${tag}-${RUN}`,
            body: "Fixture post body for the auto-parse tests.",
        },
        select: { id: true },
    });
    const submission = await db.submission.create({
        data: {
            userId: USER,
            companyName: "Acme",
            status: "PENDING",
            postId: post.id,
            ...data,
        },
        select: { id: true },
    });
    return { postId: post.id, submissionId: submission.id };
}

beforeAll(async () => {
    await db.user.create({
        data: { id: USER, name: "Parse Tester", email: `${USER}@example.test` },
    });
    const text = await db.submission.create({
        data: {
            userId: USER,
            companyName: "Acme",
            mode: "TEXT",
            status: "PENDING",
            rawText:
                "Phone screen with two coding questions, then a system design round.",
        },
    });
    textId = text.id;
    const blank = await db.submission.create({
        data: {
            userId: USER,
            companyName: "Acme",
            mode: "FORM",
            status: "PENDING",
            rawText: null,
        },
    });
    blankId = blank.id;
    const fail = await db.submission.create({
        data: {
            userId: USER,
            companyName: "Acme",
            mode: "TEXT",
            status: "PENDING",
            rawText: "Two onsite coding rounds followed by a behavioral round.",
        },
    });
    failId = fail.id;
});

afterAll(async () => {
    await db.submission.deleteMany({ where: { userId: USER } });
    await db.post.deleteMany({ where: { authorId: USER } });
    await db.user.delete({ where: { id: USER } });
    await db.$disconnect();
});

describe("parseSubmissionsCore", () => {
    it("writes parsed payload and flips status to PARSED on success", async () => {
        const results = await parseSubmissionsCore(db, [textId], async () =>
            JSON.stringify({
                role: "SWE",
                rounds: [
                    { type: "Coding", questions: [{ text: "Two sum", type: "DSA" }] },
                ],
            }),
        );
        expect(results).toEqual([{ id: textId, ok: true }]);

        const row = await db.submission.findUnique({ where: { id: textId } });
        expect(row?.status).toBe("PARSED");
        expect(row?.parsedAt).not.toBeNull();
        expect(row?.parseError).toBeNull();
        expect((row?.parsed as { role?: string })?.role).toBe("SWE");
    });

    it("keeps an already-parsed submission PARSED when a re-parse fails (stale parse retained)", async () => {
        const results = await parseSubmissionsCore(db, [textId], async () =>
            "totally not json",
        );
        expect(results[0].id).toBe(textId);
        expect(results[0].ok).toBe(false);
        expect(results[0].error).toBeTruthy();
        const row = await db.submission.findUnique({ where: { id: textId } });
        expect(row?.status).toBe("PARSED");
        expect((row?.parsed as { role?: string })?.role).toBe("SWE");
    });

    it("marks a pending submission PARSE_FAILED with the error when the generator throws", async () => {
        const results = await parseSubmissionsCore(db, [failId], async () => {
            throw new Error("Gemini is down");
        });
        expect(results).toEqual([
            { id: failId, ok: false, error: "Gemini is down" },
        ]);
        const row = await db.submission.findUnique({ where: { id: failId } });
        expect(row?.status).toBe("PARSE_FAILED");
        expect(row?.parseError).toBe("Gemini is down");
    });

    it("lets a later successful parse overwrite the failure: PARSED, error cleared", async () => {
        const results = await parseSubmissionsCore(db, [failId], async () =>
            JSON.stringify({
                rounds: [{ type: "Coding", questions: [{ text: "LRU cache" }] }],
            }),
        );
        expect(results).toEqual([{ id: failId, ok: true }]);
        const row = await db.submission.findUnique({ where: { id: failId } });
        expect(row?.status).toBe("PARSED");
        expect(row?.parseError).toBeNull();
        expect(row?.parsedAt).not.toBeNull();
    });

    it("fails a submission with no text to parse", async () => {
        const results = await parseSubmissionsCore(db, [blankId], async () => "{}");
        expect(results[0].ok).toBe(false);
        const row = await db.submission.findUnique({ where: { id: blankId } });
        expect(row?.status).toBe("PENDING");
    });

    it("continues the batch when one item fails", async () => {
        let calls = 0;
        const results = await parseSubmissionsCore(db, [blankId, textId], async () => {
            calls++;
            return JSON.stringify({
                rounds: [{ type: "Coding", questions: [{ text: "BFS", type: "DSA" }] }],
            });
        });
        expect(results).toHaveLength(2);
        expect(results.find((r) => r.id === blankId)?.ok).toBe(false);
        expect(results.find((r) => r.id === textId)?.ok).toBe(true);
        // Generator only invoked for the item that had text.
        expect(calls).toBe(1);
    });
});

describe("autoParseSubmissionForPost", () => {
    it("parses the TEXT fork of a just-published post: PENDING -> PARSED", async () => {
        const { postId, submissionId } = await forkedSubmission("text", {
            mode: "TEXT",
            rawText: "Phone screen, then two coding rounds on trees and graphs.",
        });
        await autoParseSubmissionForPost(db, postId, async () =>
            JSON.stringify({
                role: "SWE",
                rounds: [{ type: "Coding", questions: [{ text: "Invert a binary tree" }] }],
            }),
        );
        const row = await db.submission.findUnique({ where: { id: submissionId } });
        expect(row?.status).toBe("PARSED");
        expect(row?.parsedAt).not.toBeNull();
        expect((row?.parsed as { role?: string })?.role).toBe("SWE");
    });

    it("never throws when the generator throws; the fork lands on PARSE_FAILED", async () => {
        const { postId, submissionId } = await forkedSubmission("throw", {
            mode: "TEXT",
            rawText: "One coding round and a system design discussion.",
        });
        await expect(
            autoParseSubmissionForPost(db, postId, async () => {
                throw new Error("Gemini exploded");
            }),
        ).resolves.toBeUndefined();
        const row = await db.submission.findUnique({ where: { id: submissionId } });
        expect(row?.status).toBe("PARSE_FAILED");
        expect(row?.parseError).toBe("Gemini exploded");
    });

    it("skips FORM forks that carry structured data instead of text", async () => {
        const { postId, submissionId } = await forkedSubmission("form", {
            mode: "FORM",
            rawText: null,
        });
        let calls = 0;
        await autoParseSubmissionForPost(db, postId, async () => {
            calls++;
            return "{}";
        });
        expect(calls).toBe(0);
        const row = await db.submission.findUnique({ where: { id: submissionId } });
        expect(row?.status).toBe("PENDING");
    });

    it("skips forks no longer awaiting a parse", async () => {
        const { postId, submissionId } = await forkedSubmission("approved", {
            mode: "TEXT",
            status: "APPROVED",
            rawText: "Already merged; must not be touched.",
        });
        let calls = 0;
        await autoParseSubmissionForPost(db, postId, async () => {
            calls++;
            return "{}";
        });
        expect(calls).toBe(0);
        const row = await db.submission.findUnique({ where: { id: submissionId } });
        expect(row?.status).toBe("APPROVED");
    });

    it("is a no-op for a post without a fork", async () => {
        const post = await db.post.create({
            data: {
                authorId: USER,
                title: `Auto-parse no-fork ${RUN}`,
                slug: `auto-parse-no-fork-${RUN}`,
                body: "A plain social post with no submission fork.",
            },
            select: { id: true },
        });
        await expect(
            autoParseSubmissionForPost(db, post.id, async () => "{}"),
        ).resolves.toBeUndefined();
    });

    it("leaves the fork PENDING when no generator is given and no API key is set", async () => {
        const { postId, submissionId } = await forkedSubmission("nokey", {
            mode: "TEXT",
            rawText: "This one waits for the manual Parse-with-AI fallback.",
        });
        const saved = process.env.GEMINI_API_KEY;
        delete process.env.GEMINI_API_KEY;
        try {
            await autoParseSubmissionForPost(db, postId);
        } finally {
            if (saved !== undefined) process.env.GEMINI_API_KEY = saved;
        }
        const row = await db.submission.findUnique({ where: { id: submissionId } });
        expect(row?.status).toBe("PENDING");
    });
});
