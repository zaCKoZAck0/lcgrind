import { type PrismaClient } from "@prisma/client";

import { BADGE_BY_ID, type BadgeId } from "~/config/gamification";

// ---------------------------------------------------------------------------
// Public profile shape — the only user data that may leave the server for a
// public page. name and image are intentionally public (same as GitHub/Twitter).
// email stays private. id is for server-side feed queries only (never rendered).
// ---------------------------------------------------------------------------
export type PublicProfile = {
    id: string;
    handle: string;
    name: string;
    image: string | null;
    avatar: string | null;
    reputation: number;
    exp: number;
    loginStreak: number;
    longestStreak: number;
    lastSeenOn: string | null;
    badges: { id: BadgeId; label: string; description: string }[];
};

// Resolves a handle to its public profile. Returns null when the handle is
// unknown or the account is banned (neither case should produce a 200 page).
export async function getProfileByHandle(
    db: PrismaClient,
    handle: string,
): Promise<PublicProfile | null> {
    const row = await db.user.findUnique({
        where: { handle },
        select: {
            id: true,
            handle: true,
            name: true,
            image: true,
            avatar: true,
            reputation: true,
            exp: true,
            loginStreak: true,
            longestStreak: true,
            lastSeenOn: true,
            bannedAt: true,
            badges: { select: { badge: true } },
        },
    });

    if (!row || row.bannedAt !== null) return null;

    const badges = row.badges
        .map((b) => BADGE_BY_ID[b.badge as BadgeId])
        .filter((b): b is NonNullable<typeof b> => Boolean(b));

    return {
        id: row.id,
        handle: row.handle!,
        name: row.name,
        image: row.image,
        avatar: row.avatar,
        reputation: row.reputation,
        exp: row.exp,
        loginStreak: row.loginStreak,
        longestStreak: row.longestStreak,
        lastSeenOn: row.lastSeenOn,
        badges,
    };
}
