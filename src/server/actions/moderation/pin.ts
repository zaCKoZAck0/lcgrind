"use server";

import "server-only";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { getUserRole, canPin } from "~/lib/rbac";

type PinResult = { ok: true } | { ok: false; error: string };

export async function pinPost(postId: string, postParam: string): Promise<PinResult> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { ok: false, error: "Sign in required" };

    const role = await getUserRole(session.user.id, session.user.email);
    if (!canPin(role)) return { ok: false, error: "Insufficient permissions" };

    const post = await db.post.findUnique({ where: { id: postId }, select: { status: true } });
    if (!post || post.status !== "PUBLISHED") return { ok: false, error: "Post not found" };

    await db.post.update({ where: { id: postId }, data: { pinnedAt: new Date() } });
    revalidatePath(`/grinds/${postParam}`);
    revalidatePath("/grinds");
    return { ok: true };
}

export async function unpinPost(postId: string, postParam: string): Promise<PinResult> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { ok: false, error: "Sign in required" };

    const role = await getUserRole(session.user.id, session.user.email);
    if (!canPin(role)) return { ok: false, error: "Insufficient permissions" };

    await db.post.update({ where: { id: postId }, data: { pinnedAt: null } });
    revalidatePath(`/grinds/${postParam}`);
    revalidatePath("/grinds");
    return { ok: true };
}
