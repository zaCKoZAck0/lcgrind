import { type PrismaClient } from "@prisma/client";

export type VoteTargetType = "POST" | "COMMENT";

export type CastVoteInput = {
    targetType: VoteTargetType;
    targetId: string;
    // The direction the user clicked: +1 (up) or -1 (down). Clicking the same
    // direction again toggles the vote off.
    value: 1 | -1;
};

export type CastVoteResult =
    | { ok: true; value: number; score: number }
    | { ok: false; error: string };

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

// Denormalized count changes for a vote transition. `prev` is the voter's
// current value (0 = no vote), `next` is what the click resolves to (0 = undone).
export function voteDeltas(
    prev: number,
    next: number,
): { score: number; up: number; down: number } {
    const up = (next === 1 ? 1 : 0) - (prev === 1 ? 1 : 0);
    const down = (next === -1 ? 1 : 0) - (prev === -1 ? 1 : 0);
    return { score: next - prev, up, down };
}

// The author's karma change for a vote transition: the net swing in vote value.
// Self-votes never reach this — castVoteCore rejects them upstream.
export function karmaDelta(prev: number, next: number): number {
    return next - prev;
}

// Reddit-style hot ranking: log-scaled score plus a time term so newer items
// drift up and old ones decay. Pure over (score, createdAt) and deterministic.
const HOT_EPOCH_SECONDS = 1_700_000_000;

export function computeHotRank(score: number, createdAt: Date): number {
    const order = Math.log10(Math.max(Math.abs(score), 1));
    const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
    const seconds = createdAt.getTime() / 1000 - HOT_EPOCH_SECONDS;
    return Math.round((sign * order + seconds / 45000) * 1e7) / 1e7;
}

// Resolves the next vote value for a click given the existing vote: same
// direction toggles off, opposite flips, none sets it.
function resolveNext(prev: number, clicked: number): number {
    return prev === clicked ? 0 : clicked;
}

// ---------------------------------------------------------------------------
// Vote casting (the write path)
// ---------------------------------------------------------------------------

// Casts (or toggles/flips) a vote on a post or comment in one transaction:
// upsert/delete the Vote row, apply denormalized score/up/down deltas to the
// target, recompute hotRank for posts, and move the author's karma. Self-votes
// are rejected outright (you cannot vote on your own content).
export async function castVoteCore(
    db: PrismaClient,
    userId: string,
    input: CastVoteInput,
): Promise<CastVoteResult> {
    if (input.value !== 1 && input.value !== -1) {
        return { ok: false, error: "Invalid vote" };
    }
    const { targetType, targetId } = input;

    try {
        const result = await db.$transaction(async (tx) => {
            const target =
                targetType === "POST"
                    ? await tx.post.findUnique({
                          where: { id: targetId },
                          select: {
                              authorId: true,
                              score: true,
                              upCount: true,
                              downCount: true,
                              createdAt: true,
                              status: true,
                              isAnonymous: true,
                          },
                      })
                    : await tx.comment.findUnique({
                          where: { id: targetId },
                          select: {
                              authorId: true,
                              score: true,
                              upCount: true,
                              downCount: true,
                              createdAt: true,
                              status: true,
                              isAnonymous: true,
                          },
                      });

            if (!target) throw new Error("Not found");
            if (target.authorId === userId) {
                throw new Error("You can't vote on your own post");
            }

            const existing = await tx.vote.findUnique({
                where: {
                    userId_targetType_targetId: { userId, targetType, targetId },
                },
                select: { value: true },
            });
            const prev = existing?.value ?? 0;
            const next = resolveNext(prev, input.value);

            if (next === 0) {
                await tx.vote.delete({
                    where: {
                        userId_targetType_targetId: {
                            userId,
                            targetType,
                            targetId,
                        },
                    },
                });
            } else if (existing) {
                await tx.vote.update({
                    where: {
                        userId_targetType_targetId: {
                            userId,
                            targetType,
                            targetId,
                        },
                    },
                    data: { value: next },
                });
            } else {
                await tx.vote.create({
                    data: { userId, targetType, targetId, value: next },
                });
            }

            const d = voteDeltas(prev, next);
            const newScore = target.score + d.score;

            if (targetType === "POST") {
                await tx.post.update({
                    where: { id: targetId },
                    data: {
                        score: { increment: d.score },
                        upCount: { increment: d.up },
                        downCount: { increment: d.down },
                        hotRank: computeHotRank(newScore, target.createdAt),
                    },
                });
            } else {
                await tx.comment.update({
                    where: { id: targetId },
                    data: {
                        score: { increment: d.score },
                        upCount: { increment: d.up },
                        downCount: { increment: d.down },
                    },
                });
            }

            // Anonymous content earns its author no public karma — the vote
            // counts still denormalize onto the target, but the author stays
            // unattributed in the social graph.
            const kd = karmaDelta(prev, next);
            if (kd !== 0 && !target.isAnonymous) {
                await tx.user.update({
                    where: { id: target.authorId },
                    data: { karma: { increment: kd } },
                });
            }

            return { value: next, score: newScore };
        });

        return { ok: true, value: result.value, score: result.score };
    } catch (e) {
        return {
            ok: false,
            error: e instanceof Error ? e.message : "Could not record your vote",
        };
    }
}
