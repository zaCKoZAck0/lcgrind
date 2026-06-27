"use server";

import { headers } from "next/headers";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";

// Returns the calling user's vote value (+1/-1) keyed by post id.
// Returns {} for signed-out visitors. One batched query per call — never N.
export async function getMyPostVotes(
    postIds: string[],
): Promise<Record<string, number>> {
    if (postIds.length === 0) return {};
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return {};

    const votes = await db.vote.findMany({
        where: {
            userId: session.user.id,
            targetType: "POST",
            targetId: { in: postIds },
        },
        select: { targetId: true, value: true },
    });

    return Object.fromEntries(votes.map((v) => [v.targetId, v.value]));
}
