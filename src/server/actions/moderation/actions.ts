"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth, isAdminEmail } from "~/lib/auth";
import { db } from "~/lib/db";
import {
    removeContentCore,
    banUserCore,
    lockPostCore,
    shadowContentCore,
    type RemoveResult,
    type ReportTargetType,
    type BanResult,
    type LockResult,
    type ShadowResult,
} from "./core";

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

// Admin soft-delete. Flips the target to REMOVED (recoverable) and resolves its
// open reports. The discuss feed and any affected permalink are revalidated.
export async function removeContent(input: {
    targetType: ReportTargetType;
    targetId: string;
    postParam?: string;
}): Promise<RemoveResult> {
    const gate = await requireAdmin();
    if (gate.ok === false) return gate;

    const res = await removeContentCore(db, input.targetType, input.targetId);
    if (res.ok === true) {
        revalidatePath("/grinds");
        if (input.postParam) revalidatePath(`/grinds/${input.postParam}`);
    }
    return res;
}

export async function shadowContent(input: {
    targetType: ReportTargetType;
    targetId: string;
    postParam?: string;
}): Promise<ShadowResult> {
    const gate = await requireAdmin();
    if (gate.ok === false) return gate;
    const res = await shadowContentCore(db, input.targetType, input.targetId);
    if (res.ok === true) {
        revalidatePath("/grinds");
        if (input.postParam) revalidatePath(`/grinds/${input.postParam}`);
    }
    return res;
}

export async function banUser(userId: string): Promise<BanResult> {
    const gate = await requireAdmin();
    if (gate.ok === false) return gate;
    return banUserCore(db, userId);
}

export async function lockPost(postId: string, postParam?: string): Promise<LockResult> {
    const gate = await requireAdmin();
    if (gate.ok === false) return gate;
    const res = await lockPostCore(db, postId);
    if (res.ok === true) {
        if (postParam) revalidatePath(`/grinds/${postParam}`);
    }
    return res;
}

export type ReportQueueRow = {
    id: string;
    targetType: string;
    targetId: string;
    reason: string;
    status: string;
    reporterEmail: string;
    targetSnippet: string;
    authorId: string | null;
    createdAt: string;
};

export async function getOpenReports(): Promise<ReportQueueRow[]> {
    const gate = await requireAdmin();
    if (gate.ok === false) return [];

    const reports = await db.report.findMany({
        where: { status: "OPEN" },
        orderBy: { createdAt: "asc" },
        take: 100,
        select: {
            id: true,
            targetType: true,
            targetId: true,
            reason: true,
            status: true,
            createdAt: true,
            reporter: { select: { email: true } },
        },
    });

    // Fetch snippets for targeted content
    const postIds = reports.filter((r) => r.targetType === "POST").map((r) => r.targetId);
    const commentIds = reports.filter((r) => r.targetType === "COMMENT").map((r) => r.targetId);

    type PostRow = { id: string; title: string; authorId: string };
    type CommentRow = { id: string; body: string; authorId: string };

    const posts: PostRow[] = postIds.length > 0
        ? await db.post.findMany({ where: { id: { in: postIds } }, select: { id: true, title: true, authorId: true } })
        : [];
    const comments: CommentRow[] = commentIds.length > 0
        ? await db.comment.findMany({ where: { id: { in: commentIds } }, select: { id: true, body: true, authorId: true } })
        : [];

    const postMap = new Map<string, PostRow>(posts.map((p) => [p.id, p] as [string, PostRow]));
    const commentMap = new Map<string, CommentRow>(comments.map((c) => [c.id, c] as [string, CommentRow]));

    return reports.map((r) => {
        const isPost = r.targetType === "POST";
        const target = isPost ? postMap.get(r.targetId) : commentMap.get(r.targetId);
        const snippet = isPost
            ? (postMap.get(r.targetId)?.title ?? r.targetId)
            : (commentMap.get(r.targetId)?.body?.slice(0, 100) ?? r.targetId);
        return {
            id: r.id,
            targetType: r.targetType,
            targetId: r.targetId,
            reason: r.reason,
            status: r.status,
            reporterEmail: r.reporter.email,
            targetSnippet: snippet,
            authorId: target?.authorId ?? null,
            createdAt: r.createdAt.toISOString(),
        };
    });
}
