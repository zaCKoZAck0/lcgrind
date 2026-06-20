// Pure comment-tree assembly. The whole thread is fetched flat (adjacency list
// with denormalized depth) and nested here in memory, then capped so deeply
// nested replies collapse behind a "continue thread" link. No DB, no I/O.

// The fields the tree needs; production rows carry more (author, body, …) which
// ride along via the generic.
export type TreeFields = {
    id: string;
    parentId: string | null;
    depth: number;
    status: string;
    score: number;
    createdAt: Date;
};

export type FlatComment = TreeFields & { body: string };

export type CommentNode<T extends TreeFields = TreeFields> = T & {
    children: CommentNode<T>[];
    // True when this node has replies hidden by the depth cap (render a
    // "continue thread" link rooted at this node's id).
    hasMore: boolean;
};

// Best-first: higher score first, ties broken oldest-first so a stable reading
// order survives equal (or zero) scores.
function bySalience<T extends TreeFields>(a: CommentNode<T>, b: CommentNode<T>) {
    if (b.score !== a.score) return b.score - a.score;
    return a.createdAt.getTime() - b.createdAt.getTime();
}

function sortDeep<T extends TreeFields>(nodes: CommentNode<T>[]) {
    nodes.sort(bySalience);
    for (const n of nodes) sortDeep(n.children);
}

// Assembles roots from a flat list. `cap` is the display depth: nodes at depth
// 0..cap-1 render inline; a child at depth >= cap is omitted and its parent
// flagged `hasMore`. Tombstoned nodes are kept (their live replies stay
// attached); callers decide how to render the placeholder body.
export function buildCommentTree<T extends TreeFields>(
    flat: T[],
    cap: number,
): CommentNode<T>[] {
    const map = new Map<string, CommentNode<T>>();
    for (const c of flat) map.set(c.id, { ...c, children: [], hasMore: false });

    const roots: CommentNode<T>[] = [];
    for (const c of flat) {
        const node = map.get(c.id)!;
        const parent = c.parentId ? map.get(c.parentId) : undefined;
        if (!parent) {
            roots.push(node);
            continue;
        }
        if (node.depth < cap) {
            parent.children.push(node);
        } else {
            // Hidden by the cap — drop it but mark the boundary parent.
            parent.hasMore = true;
        }
    }

    sortDeep(roots);
    return roots;
}

// Re-roots the thread at `rootCommentId` for the "continue thread" view: collects
// that comment and all its descendants, rebases their depth so the target reads
// as depth 0, then runs the same capped assembly. The cap therefore applies
// relative to the new root, revealing the subtree the main thread had hidden.
// Returns [] if the target isn't present.
export function buildCommentSubtree<T extends TreeFields>(
    flat: T[],
    rootCommentId: string,
    cap: number,
): CommentNode<T>[] {
    const byId = new Map<string, T>();
    for (const c of flat) byId.set(c.id, c);

    const root = byId.get(rootCommentId);
    if (!root) return [];

    // A node is in the subtree if walking parentId upward reaches the target.
    const inSubtree = (node: T): boolean => {
        let cur: T | undefined = node;
        while (cur) {
            if (cur.id === rootCommentId) return true;
            cur = cur.parentId ? byId.get(cur.parentId) : undefined;
        }
        return false;
    };

    const base = root.depth;
    const rebased: T[] = flat
        .filter(inSubtree)
        .map((node) => ({
            ...node,
            depth: node.depth - base,
            // Detach the new root so it surfaces as a top-level node.
            parentId: node.id === rootCommentId ? null : node.parentId,
        }));

    return buildCommentTree(rebased, cap);
}
