import { type PrismaClient } from "@prisma/client";

import { COMMENT_BODY_MAX } from "~/config/grinds";
import { FEATURE_FLAGS } from "~/config/feature-flags";
import { hasProfanity } from "../posts/publish-gate";
import { notify, parseMentions } from "../notifications/core";

export type AddCommentInput = {
    postId: string;
    parentId?: string;
    body: string;
    isAnonymous?: boolean;
};

export type AddCommentResult =
    | { ok: true; id: string }
    | { ok: false; error: string };

export type EditCommentResult =
    | { ok: true; id: string }
    | { ok: false; error: string };

export type DeleteCommentResult =
    | { ok: true; tombstoned: boolean }
    | { ok: false; error: string };

// Adds a comment to a post (or as a reply to another comment). depth and rootId
// are denormalized at write time so the whole thread fetches flat and nests in
// memory (buildCommentTree). One transaction: resolve parent, create the row,
// bump the post's commentCount. A reply to a depth-0 comment roots at that
// comment; deeper replies inherit the same top-level rootId.
export async function addCommentCore(
    db: PrismaClient,
    userId: string,
    input: AddCommentInput,
): Promise<AddCommentResult> {
    const commenter = await db.user.findUnique({ where: { id: userId }, select: { bannedAt: true } });
    if (commenter?.bannedAt) return { ok: false, error: "Your account has been banned" };

    const body = input.body?.trim() ?? "";
    if (body.length === 0) {
        return { ok: false, error: "Comment can't be empty" };
    }
    if (body.length > COMMENT_BODY_MAX) {
        return {
            ok: false,
            error: `Please keep comments under ${COMMENT_BODY_MAX} characters`,
        };
    }
    if (hasProfanity(body)) {
        return {
            ok: false,
            error: "Please remove offensive language before posting",
        };
    }

    try {
        const { comment: created, postAuthorId, parentAuthorId } = await db.$transaction(async (tx) => {
            const post = await tx.post.findUnique({
                where: { id: input.postId },
                select: { id: true, status: true, lockedAt: true, authorId: true },
            });
            if (!post) throw new Error("Post not found");
            if (post.status !== "PUBLISHED") {
                throw new Error("This post is not open for comments");
            }
            if (post.lockedAt) throw new Error("This thread is locked");

            let depth = 0;
            let rootId: string | null = null;
            let parentAuthorId: string | null = null;
            if (input.parentId) {
                const parent = await tx.comment.findUnique({
                    where: { id: input.parentId },
                    select: { id: true, postId: true, depth: true, rootId: true, authorId: true, isAnonymous: true },
                });
                if (!parent || parent.postId !== input.postId) {
                    throw new Error("Parent comment not found");
                }
                depth = parent.depth + 1;
                rootId = parent.rootId ?? parent.id;
                if (!parent.isAnonymous) parentAuthorId = parent.authorId;
            }

            const comment = await tx.comment.create({
                data: {
                    postId: input.postId,
                    parentId: input.parentId ?? null,
                    rootId,
                    depth,
                    authorId: userId,
                    body,
                    isAnonymous: input.isAnonymous ?? false,
                },
                select: { id: true },
            });
            await tx.post.update({
                where: { id: input.postId },
                data: { commentCount: { increment: 1 } },
            });
            return { comment, postAuthorId: post.authorId, parentAuthorId };
        });

        // Fire notifications outside the transaction (best-effort; failures don't
        // roll back the comment). actorId is null when commenting anonymously.
        if (FEATURE_FLAGS.NOTIFICATIONS) {
            const actorId = (input.isAnonymous ?? false) ? null : userId;
            const notifBase = { actorId, postId: input.postId, commentId: created.id };

            if (input.parentId && parentAuthorId) {
                // Reply to a comment
                await notify(db, { userId: parentAuthorId, type: "REPLY_COMMENT", ...notifBase }).catch(() => undefined);
            } else {
                // Top-level reply to the post
                await notify(db, { userId: postAuthorId, type: "REPLY_POST", ...notifBase }).catch(() => undefined);
            }

            // @mention notifications
            const handles = parseMentions(body);
            if (handles.length > 0) {
                const mentioned = await db.user.findMany({
                    where: { handle: { in: handles } },
                    select: { id: true },
                });
                await Promise.all(
                    mentioned.map((u) =>
                        notify(db, { userId: u.id, type: "MENTION", ...notifBase }).catch(() => undefined),
                    ),
                );
            }
        }

        return { ok: true, id: created.id };
    } catch (e) {
        return {
            ok: false,
            error: e instanceof Error ? e.message : "Could not post your comment",
        };
    }
}

// Author edit. Updates the body and stamps editedAt (the UI shows an "edited"
// marker off that). Same content guards as creation; author-only.
export async function editCommentCore(
    db: PrismaClient,
    userId: string,
    commentId: string,
    input: { body: string },
): Promise<EditCommentResult> {
    const body = input.body?.trim() ?? "";
    if (body.length === 0) {
        return { ok: false, error: "Comment can't be empty" };
    }
    if (body.length > COMMENT_BODY_MAX) {
        return {
            ok: false,
            error: `Please keep comments under ${COMMENT_BODY_MAX} characters`,
        };
    }
    if (hasProfanity(body)) {
        return {
            ok: false,
            error: "Please remove offensive language before posting",
        };
    }

    const comment = await db.comment.findUnique({
        where: { id: commentId },
        select: { authorId: true, status: true },
    });
    if (!comment) return { ok: false, error: "Comment not found" };
    if (comment.authorId !== userId) {
        return { ok: false, error: "You can only edit your own comments" };
    }
    if (comment.status !== "PUBLISHED") {
        return { ok: false, error: "This comment can't be edited" };
    }

    await db.comment.update({
        where: { id: commentId },
        data: { body, editedAt: new Date() },
    });
    return { ok: true, id: commentId };
}

// Author delete with thread-safe semantics: a comment that still has replies
// becomes a [deleted] tombstone so the subtree others built survives; a leaf
// comment is hard-deleted (and the post's commentCount is decremented). The
// tombstone keeps its row + body server-side for admin attribution; the public
// serializer withholds both.
export async function deleteCommentCore(
    db: PrismaClient,
    userId: string,
    commentId: string,
): Promise<DeleteCommentResult> {
    try {
        return await db.$transaction(async (tx) => {
            const comment = await tx.comment.findUnique({
                where: { id: commentId },
                select: { authorId: true, postId: true, status: true },
            });
            if (!comment) throw new Error("Comment not found");
            if (comment.authorId !== userId) {
                throw new Error("You can only delete your own comments");
            }
            if (comment.status === "TOMBSTONED") {
                return { ok: true as const, tombstoned: true };
            }

            const childCount = await tx.comment.count({
                where: { parentId: commentId },
            });

            if (childCount > 0) {
                await tx.comment.update({
                    where: { id: commentId },
                    data: { status: "TOMBSTONED" },
                });
                return { ok: true as const, tombstoned: true };
            }

            await tx.comment.delete({ where: { id: commentId } });
            await tx.post.update({
                where: { id: comment.postId },
                data: { commentCount: { decrement: 1 } },
            });
            return { ok: true as const, tombstoned: false };
        });
    } catch (e) {
        return {
            ok: false,
            error:
                e instanceof Error ? e.message : "Could not delete your comment",
        };
    }
}
