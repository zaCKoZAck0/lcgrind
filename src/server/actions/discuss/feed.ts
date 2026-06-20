import { type PrismaClient, type Prisma } from "@prisma/client";

import { serializePostPublic, type PublicPost } from "../posts/core";

export type FeedSort = "hot" | "new" | "top";

export type FeedOptions = {
    sort?: FeedSort;
    // "EXPERIENCE" to filter structured experiences; null to filter text posts;
    // undefined to show all (default).
    type?: string | null;
    companyId?: number;
    // Curated flair slug (PostTag). Filters to posts carrying that flair.
    tag?: string;
    // When set, scope the feed to one author's PUBLISHED posts.
    // Coupled invariant: anonymous posts are ALWAYS excluded when authorId is
    // set (isAnonymous: false), so listing them on /u/[handle] can never
    // re-attribute an anonymous post to its author.
    authorId?: string;
    // Opaque cursor: the id of the last post on the previous page. Only the
    // post id (already public, a cuid that routes the permalink) travels in the
    // cursor — never the exact createdAt, so pagination leaks no timestamp.
    cursor?: string;
    limit?: number;
};

export type FeedPage = {
    posts: PublicPost[];
    nextCursor: string | null;
};

const DEFAULT_LIMIT = 20;

// Public selection — the exact fields serializePostPublic reads, nothing more.
const FEED_SELECT = {
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
} satisfies Prisma.PostSelect;

// The /discuss home feed. Hot (hotRank desc) is the default; New is recency
// (createdAt desc). Only PUBLISHED posts surface — tombstoned/removed/shadow are
// excluded. Filters by type and company. Pagination is keyset on the post id:
// fetch limit+1, and if the extra row exists the page's last id is the next
// cursor (Prisma resolves the ordering boundary from that row's values, so the
// order stays stable with no offset drift).
export async function getFeed(
    db: PrismaClient,
    opts: FeedOptions = {},
): Promise<FeedPage> {
    const limit = opts.limit ?? DEFAULT_LIMIT;
    const sort = opts.sort ?? "hot";

    // id desc is the deterministic tiebreak so equal hotRank/score/createdAt
    // never reorders between pages.
    const orderBy: Prisma.PostOrderByWithRelationInput[] =
        sort === "new"
            ? [{ createdAt: "desc" }, { id: "desc" }]
            : sort === "top"
              ? [{ score: "desc" }, { id: "desc" }]
              : [{ hotRank: "desc" }, { id: "desc" }];

    const rows = await db.post.findMany({
        where: {
            status: "PUBLISHED",
            ...(opts.type !== undefined ? { type: opts.type } : {}),
            ...(opts.companyId ? { companyId: opts.companyId } : {}),
            ...(opts.tag ? { tags: { some: { tag: { slug: opts.tag } } } } : {}),
            // Author-scoped feed: always exclude anonymous posts so the post
            // cannot be re-attributed by appearing on /u/[handle].
            ...(opts.authorId
                ? { authorId: opts.authorId, isAnonymous: false }
                : {}),
        },
        orderBy,
        select: FEED_SELECT,
        take: limit + 1,
        ...(opts.cursor
            ? { cursor: { id: opts.cursor }, skip: 1 }
            : {}),
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? page[page.length - 1].id : null;

    return { posts: page.map((row) => serializePostPublic(row)), nextCursor };
}
