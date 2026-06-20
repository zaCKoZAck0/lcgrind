"use server";

import { headers } from "next/headers";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import {
    createSubmissionCore,
    updateSubmissionCore,
    remainingQuota,
    type CreateSubmissionInput,
    type CreateSubmissionResult,
    type UpdateSubmissionResult,
} from "./core";

export async function createSubmission(
    input: CreateSubmissionInput,
): Promise<CreateSubmissionResult> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        return { ok: false, error: "Please sign in to share your experience" };
    }
    return createSubmissionCore(db, session.user.id, input);
}

export async function updateSubmission(
    submissionId: string,
    input: CreateSubmissionInput,
): Promise<UpdateSubmissionResult> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        return { ok: false, error: "Please sign in to edit your experience" };
    }
    return updateSubmissionCore(db, session.user.id, submissionId, input);
}

export async function searchCompanyNames(query: string): Promise<string[]> {
    const q = query.trim();
    if (q.length === 0) return [];
    const companies = await db.company.findMany({
        where: {
            OR: [
                { name: { contains: q, mode: "insensitive" } },
                { slug: { contains: q.toLowerCase() } },
            ],
        },
        orderBy: [{ reportCount: "desc" }, { name: "asc" }],
        take: 8,
        select: { name: true },
    });
    return companies.map((c) => c.name);
}

export { remainingQuota };
