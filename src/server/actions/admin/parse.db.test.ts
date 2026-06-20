import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { parseSubmissionsCore } from "./parse";

const db = new PrismaClient({
    datasourceUrl:
        process.env.DATABASE_URL ??
        "postgresql://myuser:mypassword@localhost:5432/mydb",
});

const RUN = Date.now().toString(36);
const USER = `vitest-parse-user-${RUN}`;
let textId: string;
let blankId: string;

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
});

afterAll(async () => {
    await db.submission.deleteMany({ where: { userId: USER } });
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
        expect((row?.parsed as { role?: string })?.role).toBe("SWE");
    });

    it("reports a per-item failure without throwing and keeps status unchanged", async () => {
        const results = await parseSubmissionsCore(db, [textId], async () =>
            "totally not json",
        );
        expect(results[0].id).toBe(textId);
        expect(results[0].ok).toBe(false);
        expect(results[0].error).toBeTruthy();
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
