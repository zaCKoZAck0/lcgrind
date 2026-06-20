import { type PrismaClient } from "@prisma/client";

export type ReportTargetType = "POST" | "COMMENT";

export type ReportInput = {
    targetType: ReportTargetType;
    targetId: string;
    reason: string;
};

export type ReportResult =
    | { ok: true; id: string }
    | { ok: false; error: string };

export type RemoveResult =
    | { ok: true }
    | { ok: false; error: string };

export type BanResult = { ok: true } | { ok: false; error: string };
export type LockResult = { ok: true } | { ok: false; error: string };
export type ShadowResult = { ok: true } | { ok: false; error: string };

// Sets User.bannedAt to now. The caller is responsible for verifying admin rights.
export async function banUserCore(db: PrismaClient, userId: string): Promise<BanResult> {
    const user = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) return { ok: false, error: "User not found" };
    await db.user.update({ where: { id: userId }, data: { bannedAt: new Date() } });
    return { ok: true };
}

// Locks a post so no new comments are accepted.
export async function lockPostCore(db: PrismaClient, postId: string): Promise<LockResult> {
    const post = await db.post.findUnique({ where: { id: postId }, select: { id: true } });
    if (!post) return { ok: false, error: "Post not found" };
    await db.post.update({ where: { id: postId }, data: { lockedAt: new Date() } });
    return { ok: true };
}

// Shadow-removes content: visible to the author only, hidden from all public
// surfaces (feed/search/sitemap already filter to PUBLISHED only).
export async function shadowContentCore(
    db: PrismaClient,
    targetType: ReportTargetType,
    targetId: string,
): Promise<ShadowResult> {
    if (targetType === "POST") {
        const post = await db.post.findUnique({ where: { id: targetId }, select: { id: true } });
        if (!post) return { ok: false, error: "Post not found" };
        await db.post.update({ where: { id: targetId }, data: { status: "SHADOW" } });
    } else {
        const comment = await db.comment.findUnique({ where: { id: targetId }, select: { id: true } });
        if (!comment) return { ok: false, error: "Comment not found" };
        await db.comment.update({ where: { id: targetId }, data: { status: "SHADOW" } });
    }
    await db.report.updateMany({
        where: { targetType, targetId, status: "OPEN" },
        data: { status: "RESOLVED" },
    });
    return { ok: true };
}

// A user flags a post or comment. The unique (reporter, target) key blocks a
// double-report; we surface that as a friendly "already reported" rather than a
// raw constraint error.
export async function reportContentCore(
    db: PrismaClient,
    reporterId: string,
    input: ReportInput,
): Promise<ReportResult> {
    const reason = input.reason.trim();
    if (!reason) return { ok: false, error: "A reason is required" };

    try {
        const row = await db.report.create({
            data: {
                reporterId,
                targetType: input.targetType,
                targetId: input.targetId,
                reason,
            },
            select: { id: true },
        });
        return { ok: true, id: row.id };
    } catch {
        // Unique violation: this user already reported this target.
        return { ok: false, error: "You already reported this" };
    }
}

// Admin soft-delete: flip the target's status to REMOVED so it drops from every
// public surface (feed/page/search/sitemap already filter to PUBLISHED) while
// the row survives for recovery. Any OPEN reports on it are resolved.
export async function removeContentCore(
    db: PrismaClient,
    targetType: ReportTargetType,
    targetId: string,
): Promise<RemoveResult> {
    if (targetType === "POST") {
        const post = await db.post.findUnique({
            where: { id: targetId },
            select: { id: true },
        });
        if (!post) return { ok: false, error: "Post not found" };
        await db.post.update({
            where: { id: targetId },
            data: { status: "REMOVED" },
        });
    } else {
        const comment = await db.comment.findUnique({
            where: { id: targetId },
            select: { id: true },
        });
        if (!comment) return { ok: false, error: "Comment not found" };
        await db.comment.update({
            where: { id: targetId },
            data: { status: "REMOVED" },
        });
    }

    await db.report.updateMany({
        where: { targetType, targetId, status: "OPEN" },
        data: { status: "RESOLVED" },
    });
    return { ok: true };
}
