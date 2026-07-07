import { describe, expect, it } from "vitest";

import { serializeCommentPublic, type CommentRow } from "./serialize";

const baseRow: CommentRow = {
    id: "c1",
    parentId: null,
    depth: 0,
    status: "PUBLISHED",
    score: 3,
    upCount: 4,
    downCount: 1,
    createdAt: new Date("2026-03-15T10:00:00Z"),
    editedAt: null,
    isAnonymous: false,
    body: "A plain comment.",
    authorId: "user-1",
    author: { handle: "candid_dev", avatar: null },
};

describe("serializeCommentPublic", () => {
    it("coarsens the date to a YYYY-MM month label for display", () => {
        // createdAt is retained on the shape for server-side tree sorting only;
        // the thread is a server component, so it never reaches the browser. The
        // label the UI actually renders is the coarsened month.
        const out = serializeCommentPublic(baseRow, 0);
        expect(out.createdMonth).toBe("2026-03");
    });

    it("exposes handle + avatar for a non-anonymous comment", () => {
        const out = serializeCommentPublic(baseRow, 0);
        expect(out.author).toEqual({ handle: "candid_dev", avatar: null });
    });

    it("hides the author entirely when the comment is anonymous", () => {
        const out = serializeCommentPublic({ ...baseRow, isAnonymous: true }, 0);
        expect(out.author).toBeNull();
        expect(JSON.stringify(out)).not.toContain("candid_dev");
    });

    it("withholds body and author for a tombstoned comment", () => {
        const out = serializeCommentPublic(
            { ...baseRow, status: "TOMBSTONED" },
            0,
        );
        expect(out.author).toBeNull();
        expect(out.bodyHtml).toBe("");
    });

    it("carries the viewer's own vote through", () => {
        const out = serializeCommentPublic(baseRow, -1);
        expect(out.myVote).toBe(-1);
    });
});
