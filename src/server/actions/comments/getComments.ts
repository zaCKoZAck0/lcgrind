import { db } from "~/lib/db";
import { COMMENT_DEPTH_CAP } from "~/config/grinds";
import { getViewerVoteMap } from "../votes/getVotes";
import {
    buildCommentTree,
    buildCommentSubtree,
    type CommentNode,
} from "./tree";
import { serializeCommentPublic, type PublicComment } from "./serialize";

export type { PublicComment } from "./serialize";

export type PublicCommentNode = CommentNode<PublicComment>;

// One query per post: every live or tombstoned comment, mapped to the leak-safe
// PublicComment shape (markdown rendered server-side, dates coarsened to month).
// Tombstoned rows are kept so their live replies stay attached, but their body
// and author are withheld — the UI shows a [deleted] placeholder.
async function getPostCommentsFlat(
    postId: string,
    viewerId?: string,
): Promise<PublicComment[]> {
    const rows = await db.comment.findMany({
        where: { postId, status: { in: ["PUBLISHED", "TOMBSTONED"] } },
        select: {
            id: true,
            parentId: true,
            depth: true,
            status: true,
            score: true,
            upCount: true,
            downCount: true,
            createdAt: true,
            editedAt: true,
            isAnonymous: true,
            body: true,
            author: { select: { handle: true, avatar: true } },
        },
    });

    const myVotes = await getViewerVoteMap(
        viewerId,
        "COMMENT",
        rows.map((r) => r.id),
    );

    return rows.map((r) => serializeCommentPublic(r, myVotes[r.id] ?? 0));
}

// Fetches the whole thread for a post and assembles it into a depth-capped tree.
export async function getPostComments(
    postId: string,
    viewerId?: string,
): Promise<PublicCommentNode[]> {
    const flat = await getPostCommentsFlat(postId, viewerId);
    return buildCommentTree(flat, COMMENT_DEPTH_CAP);
}

// The "continue thread" view: the same post thread re-rooted at one comment so
// the subtree the capped main view hid renders in full.
export async function getPostCommentSubtree(
    postId: string,
    rootCommentId: string,
    viewerId?: string,
): Promise<PublicCommentNode[]> {
    const flat = await getPostCommentsFlat(postId, viewerId);
    return buildCommentSubtree(flat, rootCommentId, COMMENT_DEPTH_CAP);
}
