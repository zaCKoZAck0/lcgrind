import { describe, expect, it } from "vitest";

import {
    buildCommentTree,
    buildCommentSubtree,
    type FlatComment,
} from "./tree";

// Minimal flat-comment factory; only the fields the tree cares about.
function c(
    id: string,
    parentId: string | null,
    depth: number,
    extra: Partial<FlatComment> = {},
): FlatComment {
    return {
        id,
        parentId,
        depth,
        body: id,
        status: "PUBLISHED",
        score: 0,
        createdAt: new Date(`2026-03-01T00:0${depth}:00Z`),
        ...extra,
    };
}

describe("buildCommentTree — nesting", () => {
    it("nests replies under their parent", () => {
        const flat = [c("a", null, 0), c("b", "a", 1), c("c", "b", 2)];
        const roots = buildCommentTree(flat, 5);
        expect(roots).toHaveLength(1);
        expect(roots[0].id).toBe("a");
        expect(roots[0].children[0].id).toBe("b");
        expect(roots[0].children[0].children[0].id).toBe("c");
    });

    it("keeps multiple roots and orders siblings by score then time", () => {
        const flat = [
            c("a", null, 0, { score: 1, createdAt: new Date("2026-03-01T01:00:00Z") }),
            c("b", null, 0, { score: 5, createdAt: new Date("2026-03-01T02:00:00Z") }),
            c("c", null, 0, { score: 1, createdAt: new Date("2026-03-01T00:00:00Z") }),
        ];
        const roots = buildCommentTree(flat, 5);
        // Highest score first; ties broken by oldest-first.
        expect(roots.map((r) => r.id)).toEqual(["b", "c", "a"]);
    });
});

describe("buildCommentTree — depth cap / continue-thread", () => {
    it("collapses subtrees deeper than the cap behind a continue marker", () => {
        // Chain a0 -> a1 -> ... -> a5 (depths 0..5), cap 5 renders depths 0..4.
        const flat: FlatComment[] = [];
        for (let d = 0; d <= 5; d++) {
            flat.push(c(`a${d}`, d === 0 ? null : `a${d - 1}`, d));
        }
        const roots = buildCommentTree(flat, 5);

        // Walk to the deepest visible node (depth 4).
        let node = roots[0];
        for (let d = 1; d <= 4; d++) node = node.children[0];
        expect(node.id).toBe("a4");
        // Its only child (a5, depth 5) is hidden; the node flags more below it.
        expect(node.children).toHaveLength(0);
        expect(node.hasMore).toBe(true);
        // Shallower nodes never flag more.
        expect(roots[0].hasMore).toBe(false);
    });
});

describe("buildCommentSubtree — continue-thread re-root", () => {
    it("re-roots at a deep comment and rebases depth so the cap reveals more", () => {
        // Chain a0 -> ... -> a7 (depths 0..7). The full thread caps at 5, hiding
        // a5+. The continue-thread view re-roots at a4 so a4 reads as depth 0 and
        // its descendants render again until the cap bites relative to a4.
        const flat: FlatComment[] = [];
        for (let d = 0; d <= 7; d++) {
            flat.push(c(`a${d}`, d === 0 ? null : `a${d - 1}`, d));
        }
        const roots = buildCommentSubtree(flat, "a4", 5);
        expect(roots).toHaveLength(1);
        expect(roots[0].id).toBe("a4");
        // a4 rebased to depth 0; its chain a5..a8 would be depths 1.., cap 5
        // renders rebased 0..4 (a4..a7? a4,a5,a6,a7,a8 — but only a4..a7 exist).
        let node = roots[0];
        for (let d = 5; d <= 7; d++) node = node.children[0];
        expect(node.id).toBe("a7");
    });

    it("returns empty when the root comment is missing", () => {
        const flat = [c("a", null, 0), c("b", "a", 1)];
        expect(buildCommentSubtree(flat, "nope", 5)).toEqual([]);
    });

    it("excludes nodes outside the target's subtree", () => {
        const flat = [
            c("a", null, 0),
            c("b", "a", 1),
            c("c", "a", 1),
            c("d", "b", 2),
        ];
        const roots = buildCommentSubtree(flat, "b", 5);
        expect(roots[0].id).toBe("b");
        expect(roots[0].children.map((n) => n.id)).toEqual(["d"]);
        expect(roots[0].depth).toBe(0);
        expect(roots[0].children[0].depth).toBe(1);
    });
});

describe("buildCommentTree — tombstones", () => {
    it("keeps a tombstoned parent so its live replies stay attached", () => {
        const flat = [
            c("a", null, 0, { status: "TOMBSTONED" }),
            c("b", "a", 1),
        ];
        const roots = buildCommentTree(flat, 5);
        expect(roots[0].id).toBe("a");
        expect(roots[0].status).toBe("TOMBSTONED");
        expect(roots[0].children[0].id).toBe("b");
    });
});
