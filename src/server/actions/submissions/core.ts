import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import {
    WEEKLY_SUBMISSION_CAP,
    MIN_TEXT_LENGTH,
    MAX_TEXT_LENGTH,
} from "~/config/submissions";
import { FEATURE_FLAGS } from "~/config/feature-flags";
import { reverseLedger } from "../gamification/core";
import { recomputeCompanyTiers } from "~/server/recompute-tiers";

export { WEEKLY_SUBMISSION_CAP, MIN_TEXT_LENGTH, MAX_TEXT_LENGTH };

// A Prisma client OR an interactive-transaction client. createSubmissionCore
// touches only model methods (no $transaction), so it can run inside a caller's
// transaction — used by createPostCore to fork the admin copy atomically.
export type DbClient = Omit<
    PrismaClient,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

const QUOTA_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

const questionSchema = z.object({
    text: z.string().trim().min(1).max(500),
    type: z.string().trim().max(40).optional(),
    problemUrl: z.string().trim().url().max(200).optional(),
});

const roundSchema = z.object({
    type: z.string().trim().min(1).max(40),
    questions: z.array(questionSchema).max(20).default([]),
});

const compSchema = z.object({
    currency: z.string().trim().length(3),
    base: z.number().positive().optional(),
    tc: z.number().positive(),
});

const structuredSchemaBase = z
    .object({
        role: z.string().trim().min(1).max(80),
        level: z.string().trim().max(40).optional(),
        expYears: z.number().min(0).max(50).optional(),
        rounds: z.array(roundSchema).max(12).default([]),
        ...(FEATURE_FLAGS.COMPENSATION ? { comp: compSchema.optional() } : {}),
    })
    .refine((v) => v.rounds.length > 0 || (FEATURE_FLAGS.COMPENSATION && v.comp !== undefined), {
        message: "Add at least one interview round or compensation details",
    });

export const structuredSchema = structuredSchemaBase;

export type StructuredExperience = z.infer<typeof structuredSchema>;

export type CreateSubmissionInput = {
    companyName: string;
    mode: "TEXT" | "FORM";
    rawText?: string;
    structured?: unknown;
};

export type CreateSubmissionResult =
    | { ok: true; id: string; remaining: number }
    | { ok: false; error: string; remaining?: number };

export async function remainingQuota(
    db: DbClient,
    userId: string,
): Promise<number> {
    const since = new Date(Date.now() - QUOTA_WINDOW_MS);
    const recent = await db.submission.count({
        where: { userId, createdAt: { gt: since } },
    });
    return Math.max(0, WEEKLY_SUBMISSION_CAP - recent);
}

export async function createSubmissionCore(
    db: DbClient,
    userId: string,
    input: CreateSubmissionInput,
): Promise<CreateSubmissionResult> {
    const companyName = input.companyName?.trim() ?? "";
    if (companyName.length === 0 || companyName.length > 80) {
        return { ok: false, error: "Please provide a company name" };
    }

    const remaining = await remainingQuota(db, userId);
    if (remaining <= 0) {
        return {
            ok: false,
            error: `You have reached the limit of ${WEEKLY_SUBMISSION_CAP} submissions per week. Please try again later.`,
            remaining: 0,
        };
    }

    let rawText: string | null = null;
    let structured: StructuredExperience | null = null;

    if (input.mode === "TEXT") {
        rawText = input.rawText?.trim() ?? "";
        if (rawText.length < MIN_TEXT_LENGTH) {
            return {
                ok: false,
                error: `Please write at least ${MIN_TEXT_LENGTH} characters so reviewers have enough to work with`,
            };
        }
        if (rawText.length > MAX_TEXT_LENGTH) {
            return {
                ok: false,
                error: `Please keep it under ${MAX_TEXT_LENGTH} characters`,
            };
        }
        const duplicate = await db.submission.findFirst({
            where: { userId, rawText },
            select: { id: true },
        });
        if (duplicate) {
            return {
                ok: false,
                error: "You have already submitted this exact experience",
            };
        }
    } else if (input.mode === "FORM") {
        const parsed = structuredSchema.safeParse(input.structured);
        if (!parsed.success) {
            const first = parsed.error.issues[0];
            return {
                ok: false,
                error: first?.message ?? "Invalid structured experience",
            };
        }
        structured = parsed.data;
    } else {
        return { ok: false, error: "Unknown submission mode" };
    }

    const company = await db.company.findFirst({
        where: { name: { equals: companyName, mode: "insensitive" } },
        select: { id: true },
    });

    const created = await db.submission.create({
        data: {
            userId,
            companyId: company?.id ?? null,
            companyName,
            mode: input.mode,
            rawText,
            structured: structured ?? Prisma.JsonNull,
        },
        select: { id: true },
    });

    return { ok: true, id: created.id, remaining: remaining - 1 };
}

export type UpdateSubmissionResult =
    | { ok: true; id: string }
    | { ok: false; error: string };

// Author-only edit. Any edit reopens review (status -> PENDING, parsed cleared);
// if the submission was approved its live community rows are withdrawn and its
// points reversed in the same transaction, preserving the invariant that only
// approved submissions carry live data. Edits never consume the weekly quota.
export async function updateSubmissionCore(
    db: PrismaClient,
    userId: string,
    submissionId: string,
    input: CreateSubmissionInput,
): Promise<UpdateSubmissionResult> {
    const existing = await db.submission.findUnique({
        where: { id: submissionId },
        select: { id: true, userId: true },
    });
    if (!existing) return { ok: false, error: "Submission not found" };
    if (existing.userId !== userId) {
        return { ok: false, error: "You can only edit your own submissions" };
    }

    const companyName = input.companyName?.trim() ?? "";
    if (companyName.length === 0 || companyName.length > 80) {
        return { ok: false, error: "Please provide a company name" };
    }

    let rawText: string | null = null;
    let structured: StructuredExperience | null = null;

    if (input.mode === "TEXT") {
        rawText = input.rawText?.trim() ?? "";
        if (rawText.length < MIN_TEXT_LENGTH) {
            return {
                ok: false,
                error: `Please write at least ${MIN_TEXT_LENGTH} characters so reviewers have enough to work with`,
            };
        }
        if (rawText.length > MAX_TEXT_LENGTH) {
            return {
                ok: false,
                error: `Please keep it under ${MAX_TEXT_LENGTH} characters`,
            };
        }
        const duplicate = await db.submission.findFirst({
            where: { userId, rawText, id: { not: submissionId } },
            select: { id: true },
        });
        if (duplicate) {
            return {
                ok: false,
                error: "You have already submitted this exact experience",
            };
        }
    } else if (input.mode === "FORM") {
        const parsed = structuredSchema.safeParse(input.structured);
        if (!parsed.success) {
            const first = parsed.error.issues[0];
            return {
                ok: false,
                error: first?.message ?? "Invalid structured experience",
            };
        }
        structured = parsed.data;
    } else {
        return { ok: false, error: "Unknown submission mode" };
    }

    const company = await db.company.findFirst({
        where: { name: { equals: companyName, mode: "insensitive" } },
        select: { id: true },
    });

    await db.$transaction(async (tx) => {
        // Withdraw any live community rows and reverse points before reopening.
        await tx.communityQuestionAsk.deleteMany({ where: { submissionId } });
        await tx.communityCompPoint.deleteMany({ where: { submissionId } });
        await reverseLedger(tx, { userId, submissionId, reason: "edited" });
        await tx.submission.update({
            where: { id: submissionId },
            data: {
                companyId: company?.id ?? null,
                companyName,
                mode: input.mode,
                rawText,
                structured: structured ?? Prisma.JsonNull,
                parsed: Prisma.JsonNull,
                status: "PENDING",
                adminNote: null,
            },
        });
    });

    // Editing an approved submission withdraws its community asks.
    await recomputeCompanyTiers(db);

    return { ok: true, id: submissionId };
}
