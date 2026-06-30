"use server";

import { headers } from "next/headers";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { syncGrindBadges } from "~/server/actions/gamification/core";

const SYNC_COOLDOWN_MS = 60_000;

export type ProgressSyncStatus = {
    enabled: boolean;
    data: unknown;
    lastSyncedAt: Date | null;
};

export type ProgressSyncResult =
    | { ok: true }
    | { ok: false; error: string; retryAfterMs?: number };

export async function getProgressSync(): Promise<ProgressSyncStatus> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { enabled: false, data: null, lastSyncedAt: null };

    const user = await db.user.findUniqueOrThrow({
        where: { id: session.user.id },
        select: { syncProgress: true, progressData: true, lastProgressSyncAt: true },
    });

    return {
        enabled: user.syncProgress,
        data: user.progressData,
        lastSyncedAt: user.lastProgressSyncAt,
    };
}

export async function setProgressSync(
    enabled: boolean,
): Promise<ProgressSyncResult> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { ok: false, error: "Not authenticated" };

    await db.user.update({
        where: { id: session.user.id },
        data: { syncProgress: enabled },
    });

    return { ok: true };
}

export async function saveProgress(
    data: unknown,
): Promise<ProgressSyncResult> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { ok: false, error: "Not authenticated" };

    if (typeof data !== "object" || data === null || Array.isArray(data)) {
        return { ok: false, error: "Invalid progress data shape" };
    }

    const user = await db.user.findUniqueOrThrow({
        where: { id: session.user.id },
        select: { lastProgressSyncAt: true },
    });

    if (user.lastProgressSyncAt) {
        const elapsed = Date.now() - user.lastProgressSyncAt.getTime();
        if (elapsed < SYNC_COOLDOWN_MS) {
            return {
                ok: false,
                error: "Sync too frequent. Please wait before syncing again.",
                retryAfterMs: SYNC_COOLDOWN_MS - elapsed,
            };
        }
    }

    await db.user.update({
        where: { id: session.user.id },
        data: { progressData: data as object, lastProgressSyncAt: new Date() },
    });

    syncGrindBadges(db, session.user.id).catch(() => undefined);

    return { ok: true };
}
