"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import {
    castVoteCore,
    type CastVoteResult,
    type VoteTargetType,
} from "./core";
import { syncSocialBadges } from "../gamification/core";

// Session-gated vote. Voting requires login; the post permalink is revalidated so
// the server-rendered score/arrow state updates without a client refetch.
export async function castVote(input: {
    targetType: VoteTargetType;
    targetId: string;
    value: 1 | -1;
    postParam: string;
}): Promise<CastVoteResult> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        return { ok: false, error: "Sign in to vote" };
    }

    const res = await castVoteCore(db, session.user.id, {
        targetType: input.targetType,
        targetId: input.targetId,
        value: input.value,
    });

    if (res.ok === true) {
        revalidatePath(`/grinds/${input.postParam}`);
        // Sync reputation-based badges for the content author (best-effort).
        const target =
            input.targetType === "POST"
                ? await db.post.findUnique({ where: { id: input.targetId }, select: { authorId: true } })
                : await db.comment.findUnique({ where: { id: input.targetId }, select: { authorId: true } });
        if (target?.authorId) {
            void syncSocialBadges(db, target.authorId);
        }
    }
    return res;
}
