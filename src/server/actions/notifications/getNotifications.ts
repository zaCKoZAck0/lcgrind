"use server";

import { headers } from "next/headers";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { markRead } from "./core";

export type NotifRow = {
    id: string;
    type: string;
    actorHandle: string | null; // null = anonymous
    postId: string | null;
    postSlug: string | null;
    commentId: string | null;
    read: boolean;
    createdAt: string; // ISO
};

// Returns the 50 most recent notifications for the current user, newest first.
export async function getNotifications(): Promise<NotifRow[]> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return [];

    const rows = await db.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
            id: true,
            type: true,
            actorId: true,
            postId: true,
            commentId: true,
            read: true,
            createdAt: true,
        },
    });

    // Resolve actor handles in bulk
    const actorIds = [...new Set(rows.map((r) => r.actorId).filter(Boolean) as string[])];
    const actorMap = new Map<string, string>();
    if (actorIds.length > 0) {
        const users = await db.user.findMany({
            where: { id: { in: actorIds } },
            select: { id: true, handle: true },
        });
        for (const u of users) {
            if (u.handle) actorMap.set(u.id, u.handle);
        }
    }

    // Resolve post slugs in bulk
    const postIds = [...new Set(rows.map((r) => r.postId).filter(Boolean) as string[])];
    const slugMap = new Map<string, string>();
    if (postIds.length > 0) {
        const posts = await db.post.findMany({
            where: { id: { in: postIds } },
            select: { id: true, slug: true },
        });
        // URL param format is "{id}-{slug}" matching postParam() in posts/core.ts
        for (const p of posts) slugMap.set(p.id, `${p.id}-${p.slug}`);
    }

    return rows.map((r) => ({
        id: r.id,
        type: r.type,
        actorHandle: r.actorId ? (actorMap.get(r.actorId) ?? null) : null,
        postId: r.postId,
        postSlug: r.postId ? (slugMap.get(r.postId) ?? null) : null,
        commentId: r.commentId,
        read: r.read,
        createdAt: r.createdAt.toISOString(),
    }));
}

// Returns unread count only (cheap: no joins). For the bell badge.
export async function getUnreadCount(): Promise<number> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return 0;
    return db.notification.count({ where: { userId: session.user.id, read: false } });
}

// Mark all notifications read for the current user.
export async function markAllRead(): Promise<void> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return;
    await markRead(db, session.user.id);
}

