import { type PrismaClient } from "@prisma/client";

export type NotifyInput = {
    userId: string;
    type: string; // REPLY_POST | REPLY_COMMENT | MENTION | BADGE
    actorId?: string | null;
    postId?: string;
    commentId?: string;
};

// Create a notification for userId. Silently skips self-notification
// (actorId === userId) so replying to your own post never notifies you.
export async function notify(db: PrismaClient, input: NotifyInput): Promise<void> {
    if (input.actorId && input.actorId === input.userId) return;
    await db.notification.create({
        data: {
            userId: input.userId,
            type: input.type,
            actorId: input.actorId ?? null,
            postId: input.postId ?? null,
            commentId: input.commentId ?? null,
        },
    });
}

// Mark notifications as read. Pass ids to mark specific ones; omit to mark all.
export async function markRead(db: PrismaClient, userId: string, ids?: string[]): Promise<void> {
    await db.notification.updateMany({
        where: {
            userId,
            read: false,
            ...(ids ? { id: { in: ids } } : {}),
        },
        data: { read: true },
    });
}

// Extract unique @handle mentions from a post/comment body.
// HANDLE_RE allows [a-z][a-z0-9_]{2,19} — match that inline.
export function parseMentions(body: string): string[] {
    const seen = new Set<string>();
    for (const m of body.matchAll(/@([a-z][a-z0-9_]{2,19})/g)) {
        seen.add(m[1]);
    }
    return [...seen];
}
