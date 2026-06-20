import "server-only";

import { db } from "~/lib/db";
import type { VoteTargetType } from "./core";

// The viewer's own votes over a set of targets, as a {targetId: value} map. Used
// to light up the active arrow without leaking anyone else's votes. Returns an
// empty map for signed-out viewers or an empty id list.
export async function getViewerVoteMap(
    userId: string | undefined,
    targetType: VoteTargetType,
    targetIds: string[],
): Promise<Record<string, number>> {
    if (!userId || targetIds.length === 0) return {};
    const rows = await db.vote.findMany({
        where: { userId, targetType, targetId: { in: targetIds } },
        select: { targetId: true, value: true },
    });
    const map: Record<string, number> = {};
    for (const r of rows) map[r.targetId] = r.value;
    return map;
}
