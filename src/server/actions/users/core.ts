import { type PrismaClient } from "@prisma/client";

const PREFIX_RE = /^[a-z][a-z0-9_]{0,19}$/i;

export type MentionUser = {
    handle: string;
    name: string;
    avatarUrl: string | null;
};

export async function searchMentionUsersCore(
    db: PrismaClient,
    prefix: string,
): Promise<MentionUser[]> {
    const trimmed = prefix.startsWith("@") ? prefix.slice(1) : prefix;
    if (!PREFIX_RE.test(trimmed)) return [];

    const users = await db.user.findMany({
        where: {
            handle: { startsWith: trimmed.toLowerCase(), mode: "insensitive" },
        },
        select: { handle: true, name: true, image: true, avatar: true },
        orderBy: { handle: "asc" },
        take: 5,
    });

    return users
        .filter((u): u is typeof u & { handle: string } => u.handle !== null)
        .map((u) => ({
            handle: u.handle,
            name: u.name,
            avatarUrl: (u.image ?? u.avatar) ?? null,
        }));
}
