import type { PrismaClient } from "@prisma/client";
import { normalizeSubmission, type SanitizedExperience } from "./core";

export type MergePreviewQuestion = {
    statement: string;
    type?: string;
    band: string;
    problem: { id: number; title: string; url: string } | null;
};

export type MergePreview = {
    role?: string;
    level?: string;
    expYears?: number | null;
    questions: MergePreviewQuestion[];
    comp: { currency: string; base: number | null; tc: number } | null;
};

export async function buildMergePreviewCore(
    db: PrismaClient,
    submissionId: string,
): Promise<{ ok: true; preview: MergePreview } | { ok: false; error: string }> {
    const submission = await db.submission.findUnique({
        where: { id: submissionId },
        select: { parsed: true, structured: true },
    });

    if (!submission) return { ok: false, error: "Submission not found" };

    const rawPayload = submission.parsed ?? submission.structured;
    if (!rawPayload) return { ok: false, error: "No usable payload" };

    const sanitized = rawPayload as SanitizedExperience;
    const { asks, comp } = normalizeSubmission(sanitized);

    // Resolve problem URLs — same approach as approveSubmissionCore
    const problemUrls = [
        ...new Set(asks.map((a) => a.problemUrl).filter((u): u is string => !!u)),
    ];
    const problems = problemUrls.length
        ? await db.problem.findMany({
              where: { url: { in: problemUrls } },
              select: { id: true, url: true, title: true },
          })
        : [];
    const problemByUrl = new Map(problems.map((p) => [p.url, p]));

    const questions: MergePreviewQuestion[] = asks.map((a) => ({
        statement: a.statement,
        type: a.type,
        band: a.band,
        problem: a.problemUrl ? (problemByUrl.get(a.problemUrl) ?? null) : null,
    }));

    const firstComp = comp[0];

    return {
        ok: true,
        preview: {
            role: sanitized.role,
            level: sanitized.level,
            expYears: sanitized.expYears,
            questions,
            comp: firstComp
                ? { currency: firstComp.currency, base: firstComp.base, tc: firstComp.tc }
                : null,
        },
    };
}
