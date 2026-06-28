import "server-only";

import { db } from "~/lib/db";
import { serializePostPublic, type PublicPost } from "./core";

// Returns company names for all experiences in a structured EXPERIENCE post.
// Empty array for legacy text-mode posts or posts without structured data.
export async function getPostExperienceCompanies(postId: string): Promise<string[]> {
    const sub = await db.submission.findUnique({
        where: { postId },
        select: { structured: true, companyName: true },
    });
    if (!sub) return [];
    if (sub.structured) {
        const s = sub.structured as { experiences?: { company: string }[] } | null;
        if (s?.experiences?.length) {
            return s.experiences.map((e) => e.company).filter(Boolean);
        }
    }
    return sub.companyName ? [sub.companyName] : [];
}

// Loads a single post for the public page and returns the leak-safe shape (or
// null for a missing or non-public post). Only PUBLISHED posts resolve here;
// tombstone/removed/shadow handling arrives with the moderation slices. When a
// viewer is signed in, their own vote is folded in to light up the active arrow.
// isOwner is true when the viewer is the post author — used to gate edit/delete UI.
export async function getPublicPost(
    id: string,
    viewerId?: string,
): Promise<(PublicPost & { isOwner: boolean }) | null> {
    const row = await db.post.findUnique({
        where: { id },
        select: {
            id: true,
            type: true,
            title: true,
            slug: true,
            body: true,
            isAnonymous: true,
            authorId: true,
            score: true,
            upCount: true,
            downCount: true,
            commentCount: true,
            status: true,
            createdAt: true,
            editedAt: true,
            pinnedAt: true,
            author: { select: { handle: true, avatar: true, image: true } },
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
    return {
        ...serializePostPublic(row, myVote),
        isOwner: viewerId !== undefined && row.authorId === viewerId,
    };
}
