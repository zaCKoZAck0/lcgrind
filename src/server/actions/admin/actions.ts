"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth, isAdminEmail } from "~/lib/auth";
import { db } from "~/lib/db";
import {
    approveSubmissionsCore,
    rejectSubmissionCore,
    deleteSubmissionCore,
    type AdminActionResult,
    type BatchItemResult,
} from "./core";
import {
    geminiAvailable,
    geminiGenerate,
    parseSubmissionsCore,
    type ParseItemResult,
} from "./parse";
import { buildMergePreviewCore, type MergePreview } from "./preview";

async function requireAdmin(): Promise<
    { ok: true } | { ok: false; error: string }
> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { ok: false, error: "Not signed in" };
    if (!isAdminEmail(session.user.email)) {
        return { ok: false, error: "Not authorized" };
    }
    return { ok: true };
}

async function revalidateForSubmission(submissionId: string) {
    const sub = await db.submission.findUnique({
        where: { id: submissionId },
        select: { company: { select: { slug: true } } },
    });
    if (sub?.company?.slug) {
        revalidatePath(`/companies/${sub.company.slug}`);
    }
}

export type ApproveSubmissionsResult =
    | { ok: true; results: BatchItemResult[] }
    | { ok: false; error: string };

export async function approveSubmissions(
    ids: string[],
): Promise<ApproveSubmissionsResult> {
    const gate = await requireAdmin();
    if (gate.ok === false) return gate;
    const results = await approveSubmissionsCore(db, ids);
    for (const r of results) {
        if (r.ok) await revalidateForSubmission(r.id);
    }
    revalidatePath("/admin/submissions");
    return { ok: true, results };
}

export async function rejectSubmissions(
    ids: string[],
    adminNote: string | null = null,
): Promise<AdminActionResult> {
    const gate = await requireAdmin();
    if (gate.ok === false) return gate;
    for (const id of ids) {
        await revalidateForSubmission(id);
        const result = await rejectSubmissionCore(db, id, adminNote);
        if (result.ok === false) return result;
    }
    revalidatePath("/admin/submissions");
    return { ok: true };
}

export async function deleteSubmissions(
    ids: string[],
): Promise<AdminActionResult> {
    const gate = await requireAdmin();
    if (gate.ok === false) return gate;
    for (const id of ids) {
        await revalidateForSubmission(id);
        await deleteSubmissionCore(db, id);
    }
    revalidatePath("/admin/submissions");
    return { ok: true };
}

export async function isParseAvailable(): Promise<boolean> {
    const gate = await requireAdmin();
    if (gate.ok === false) return false;
    return geminiAvailable();
}

export type ParseSubmissionsResult =
    | { ok: true; results: ParseItemResult[] }
    | { ok: false; error: string };

export async function parseSubmissions(
    ids: string[],
): Promise<ParseSubmissionsResult> {
    const gate = await requireAdmin();
    if (gate.ok === false) return gate;
    if (!geminiAvailable()) {
        return {
            ok: false,
            error: "AI parsing is unavailable: GEMINI_API_KEY is not configured",
        };
    }
    const results = await parseSubmissionsCore(db, ids, geminiGenerate);
    revalidatePath("/admin/submissions");
    return { ok: true, results };
}

export async function getMergePreview(
    submissionId: string,
): Promise<{ ok: true; preview: MergePreview } | { ok: false; error: string }> {
    const gate = await requireAdmin();
    if (gate.ok === false) return gate;
    return buildMergePreviewCore(db, submissionId);
}

export async function updateSubmissionFields(
    id: string,
    data: { companyId?: number | null; parsed?: unknown; adminNote?: string | null },
): Promise<AdminActionResult> {
    const gate = await requireAdmin();
    if (gate.ok === false) return gate;
    await db.submission.update({
        where: { id },
        data: {
            companyId: data.companyId,
            parsed: data.parsed === undefined ? undefined : (data.parsed as object),
            adminNote: data.adminNote,
        },
    });
    revalidatePath("/admin/submissions");
    return { ok: true };
}
