import "server-only";

import { db } from "~/lib/db";
import { serializePostPublic, type PublicPost } from "./core";

// Loads a single post for the public page and returns the leak-safe shape (or
// null for a missing or non-public post). Only PUBLISHED posts resolve here;
// tombstone/removed/shadow handling arrives with the moderation slices. When a
// viewer is signed in, their own vote is folded in to light up the active arrow.
export async function getPublicPost(
    id: string,
    viewerId?: string,
): Promise<PublicPost | null> {
    const row = await db.post.findUnique({
        where: { id },
        select: {
            id: true,
            type: true,
            title: true,
            slug: true,
            body: true,
            isAnonymous: true,
            score: true,
            upCount: true,
            downCount: true,
            commentCount: true,
            status: true,
            createdAt: true,
            editedAt: true,
            author: { select: { handle: true, avatar: true } },
            company: { select: { slug: true, name: true } },
            tags: { select: { tag: { select: { slug: true, name: true } } } },
        },
    });
    if (!row || row.status !== "PUBLISHED") return null;

    let myVote = 0;
    if (viewerId) {
        const vote = await db.vote.findUnique({
            where: {
                userId_targetType_targetId: {
                    userId: viewerId,
                    targetType: "POST",
                    targetId: id,
                },
            },
            select: { value: true },
        });
        myVote = vote?.value ?? 0;
    }
    return serializePostPublic(row, myVote);
}
