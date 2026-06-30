import "server-only";

import { db } from "~/lib/db";
import { isAdminEmail } from "~/lib/auth";

export type Role = "USER" | "MODERATOR" | "ADMIN";

// Resolves the effective role for a user. Email-based ADMIN_EMAILS env var takes
// precedence over the DB field so accounts can be bootstrapped before the DB is
// seeded. Returns "USER" for unauthenticated callers (null/undefined userId).
export async function getUserRole(
    userId: string | null | undefined,
    email: string | null | undefined,
): Promise<Role> {
    if (!userId) return "USER";
    if (isAdminEmail(email)) return "ADMIN";
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { role: true },
    });
    const dbRole = user?.role ?? "USER";
    if (dbRole === "ADMIN") return "ADMIN";
    if (dbRole === "MODERATOR") return "MODERATOR";
    return "USER";
}

export function canPin(role: Role): boolean {
    return role === "MODERATOR" || role === "ADMIN";
}

export function canRemove(role: Role): boolean {
    return role === "MODERATOR" || role === "ADMIN";
}
