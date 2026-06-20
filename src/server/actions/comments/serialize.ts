import { toMonth } from "~/utils/public-date";
import { renderMarkdown } from "~/utils/markdown";
import type { TreeFields } from "./tree";

// Public, client-safe comment. Carries createdAt for server-side sorting only —
// the value never reaches the browser (the thread is a server component and the
// rendered HTML shows createdMonth, never the exact date).
export type PublicComment = TreeFields & {
    bodyHtml: string;
    author: { handle: string; avatar: string | null } | null;
    createdMonth: string;
    editedMonth: string | null;
    upCount: number;
    downCount: number;
    // The viewer's own vote on this comment (+1 / -1 / 0); 0 when signed out.
    myVote: number;
};

// The raw DB row shape the serializer narrows down to a leak-safe PublicComment.
export type CommentRow = {
    id: string;
    parentId: string | null;
    depth: number;
    status: string;
    score: number;
    upCount: number;
    downCount: number;
    createdAt: Date;
    editedAt: Date | null;
    isAnonymous: boolean;
    body: string;
    author: { handle: string | null; avatar: string | null };
};

// Maps a comment row to the public shape. Tombstoned, anonymous, or
// handle-less comments are stripped of author identity; tombstoned bodies are
// withheld entirely (the UI shows a [deleted] placeholder). Exact timestamps
// never cross this boundary — only the coarsened month does.
export function serializeCommentPublic(
    row: CommentRow,
    myVote: number,
): PublicComment {
    const tombstoned = row.status === "TOMBSTONED";
    return {
        id: row.id,
        parentId: row.parentId,
        depth: row.depth,
        status: row.status,
        score: row.score,
        upCount: row.upCount,
        downCount: row.downCount,
        createdAt: row.createdAt,
        createdMonth: toMonth(row.createdAt),
        editedMonth: row.editedAt ? toMonth(row.editedAt) : null,
        bodyHtml: tombstoned ? "" : renderMarkdown(row.body),
        myVote,
        author:
            tombstoned || row.isAnonymous || row.author.handle === null
                ? null
                : { handle: row.author.handle, avatar: row.author.avatar },
    };
}
