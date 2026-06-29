"use server";

import { headers } from "next/headers";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { syncGrindBadges } from "~/server/actions/gamification/core";

export type ProgressSyncStatus = {
    enabled: boolean;
    data: unknown;
};

export type ProgressSyncResult = { ok: true } | { ok: false; error: string };

export async function getProgressSync(): Promise<ProgressSyncStatus> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { enabled: false, data: null };

    const user = await db.user.findUniqueOrThrow({
        where: { id: session.user.id },
        select: { syncProgress: true, progressData: true },
    });

    return { enabled: user.syncProgress, data: user.progressData };
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

    await db.user.update({
        where: { id: session.user.id },
        data: { progressData: data as object },
    });

    syncGrindBadges(db, session.user.id).catch(() => undefined);

    return { ok: true };
}
