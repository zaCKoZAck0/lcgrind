import type { Prisma, PrismaClient } from "@prisma/client";

import {
    awardForExperience,
    reconcileLedger,
    syncBadges,
} from "../gamification/core";
import { recomputeCompanyTiers } from "~/server/recompute-tiers";

// Same cut points as the seeded export bands; unknown experience contributes
// only to the "all" rollup, never a specific band.
export function expBandOf(expYears: number | null | undefined): string {
    if (expYears === null || expYears === undefined || Number.isNaN(expYears)) {
        return "all";
    }
    if (expYears < 2) return "0-2";
    if (expYears < 5) return "2-5";
    if (expYears < 8) return "5-8";
    return "8+";
}

type SanitizedQuestion = {
    text?: string;
    type?: string;
    problemUrl?: string;
};

type SanitizedRound = {
    type?: string;
    questions?: SanitizedQuestion[];
};

export type SanitizedExperience = {
    role?: string;
    level?: string;
    expYears?: number | null;
    rounds?: SanitizedRound[];
    comp?: {
        currency?: string;
        base?: number | null;
        tc?: number;
    };
};

export type NormalizedAsk = {
    band: string;
    type: string;
    statement: string;
    problemUrl: string | null;
};

export type NormalizedComp = {
    roleFamily: string;
    level: string | null;
    expYears: number | null;
    expBand: string;
    currency: string;
    base: number | null;
    tc: number;
};

export function normalizeSubmission(payload: SanitizedExperience): {
    asks: NormalizedAsk[];
    comp: NormalizedComp[];
} {
    const band = expBandOf(payload.expYears ?? null);

    const asks: NormalizedAsk[] = [];
    for (const round of payload.rounds ?? []) {
        for (const q of round.questions ?? []) {
            const statement = (q.text ?? "").trim();
            if (statement.length === 0) continue;
            asks.push({
                band,
                type: (q.type ?? round.type ?? "Other").trim() || "Other",
                statement,
                problemUrl: q.problemUrl?.trim() || null,
            });
        }
    }

    const comp: NormalizedComp[] = [];
    const c = payload.comp;
    if (c && typeof c.tc === "number" && c.tc > 0 && c.currency) {
        comp.push({
            roleFamily: (payload.role ?? "Other").trim() || "Other",
            level: payload.level?.trim() || null,
            expYears: payload.expYears ?? null,
            expBand: band,
            currency: c.currency.trim().toUpperCase(),
            base: typeof c.base === "number" ? c.base : null,
            tc: c.tc,
        });
    }

    return { asks, comp };
}

function sanitizedFrom(submission: {
    parsed: Prisma.JsonValue | null;
    structured: Prisma.JsonValue | null;
}): SanitizedExperience {
    const payload = submission.parsed ?? submission.structured;
    return (payload as SanitizedExperience) ?? {};
}

export type AdminActionResult = { ok: true } | { ok: false; error: string };

export async function approveSubmissionCore(
    db: PrismaClient,
    submissionId: string,
): Promise<AdminActionResult> {
    const submission = await db.submission.findUnique({
        where: { id: submissionId },
        select: {
            id: true,
            userId: true,
            companyId: true,
            parsed: true,
            structured: true,
        },
    });
    if (!submission) return { ok: false, error: "Submission not found" };
    if (submission.companyId === null) {
        return {
            ok: false,
            error: "Link this submission to a known company before approving",
        };
    }
    const companyId = submission.companyId;
    const sanitized = sanitizedFrom(submission);
    const { asks, comp } = normalizeSubmission(sanitized);
    const award = awardForExperience(sanitized);

    const problemUrls = [
        ...new Set(asks.map((a) => a.problemUrl).filter((u): u is string => !!u)),
    ];
    const problems = problemUrls.length
        ? await db.problem.findMany({
              where: { url: { in: problemUrls } },
              select: { id: true, url: true },
          })
        : [];
    const problemIdByUrl = new Map(problems.map((p) => [p.url, p.id]));

    await db.$transaction(async (tx) => {
        await tx.communityQuestionAsk.deleteMany({ where: { submissionId } });
        await tx.communityCompPoint.deleteMany({ where: { submissionId } });
        await tx.communityQuestionAsk.createMany({
            data: asks.map((a) => ({
                companyId,
                submissionId,
                band: a.band,
                type: a.type,
                statement: a.statement,
                problemId: a.problemUrl
                    ? (problemIdByUrl.get(a.problemUrl) ?? null)
                    : null,
            })),
        });
        await tx.communityCompPoint.createMany({
            data: comp.map((c) => ({
                companyId,
                submissionId,
                roleFamily: c.roleFamily,
                level: c.level,
                expYears: c.expYears,
                expBand: c.expBand,
                currency: c.currency,
                base: c.base,
                tc: c.tc,
            })),
        });
        await tx.submission.update({
            where: { id: submissionId },
            data: { status: "APPROVED" },
        });
        await reconcileLedger(tx, {
            userId: submission.userId,
            submissionId,
            delta: award.delta,
            reason: award.reason,
        });
    });

    // Milestone badges are additive and idempotent; evaluate after the award.
    await syncBadges(db, submission.userId);
    // Community asks just changed the difficulty population.
    await recomputeCompanyTiers(db);

    return { ok: true };
}

export async function rejectSubmissionCore(
    db: PrismaClient,
    submissionId: string,
    adminNote: string | null,
): Promise<AdminActionResult> {
    const submission = await db.submission.findUnique({
        where: { id: submissionId },
        select: { id: true, userId: true },
    });
    if (!submission) return { ok: false, error: "Submission not found" };

    await db.$transaction(async (tx) => {
        await tx.communityQuestionAsk.deleteMany({ where: { submissionId } });
        await tx.communityCompPoint.deleteMany({ where: { submissionId } });
        await tx.submission.update({
            where: { id: submissionId },
            data: { status: "REJECTED", adminNote },
        });
        // Withdraw any awarded points (no live rows => no score).
        await reconcileLedger(tx, {
            userId: submission.userId,
            submissionId,
            delta: 0,
            reason: "reversed",
        });
    });

    // Rejecting an approved submission removes its community asks.
    await recomputeCompanyTiers(db);

    return { ok: true };
}

export async function deleteSubmissionCore(
    db: PrismaClient,
    submissionId: string,
): Promise<AdminActionResult> {
    // Community rows cascade on submission delete (onDelete: Cascade).
    await db.submission.delete({ where: { id: submissionId } });
    await recomputeCompanyTiers(db);
    return { ok: true };
}
