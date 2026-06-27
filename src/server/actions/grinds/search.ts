import { type PrismaClient, Prisma } from "@prisma/client";

import {
    postParam,
    serializePostPublic,
    type PublicPost,
} from "../posts/core";

export type SearchOptions = {
    q: string;
    limit?: number;
};

export type SimilarPost = {
    id: string;
    title: string;
    param: string;
};

const DEFAULT_LIMIT = 20;
// Below this trigram similarity the titles aren't "near-duplicates" worth
// surfacing in the compose typeahead.
const SIMILAR_THRESHOLD = 0.3;

// Same public selection the feed uses — the exact fields serializePostPublic
// reads, nothing more.
const SELECT = {
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
    author: { select: { handle: true, avatar: true, image: true } },
    company: { select: { slug: true, name: true } },
    tags: { select: { tag: { select: { slug: true, name: true } } } },
} satisfies Prisma.PostSelect;

// Full-text search over published posts. Relevance = ts_rank(weighted vector,
// query) blended with a logarithmic score boost and a tiny recency term so
// that, among equally relevant matches, higher score then newer wins. Only
// PUBLISHED rows surface — tombstoned/removed/shadow are excluded. The ranking
// runs in SQL against the GIN index; we then hydrate the public shape through
// serializePostPublic so no exact timestamp/PII crosses the boundary.
export async function searchPosts(
    db: PrismaClient,
    opts: SearchOptions,
): Promise<PublicPost[]> {
    const q = opts.q.trim();
    if (!q) return [];
    const limit = opts.limit ?? DEFAULT_LIMIT;

    const ranked = await db.$queryRaw<{ id: string }[]>(Prisma.sql`
        SELECT p."id"
        FROM "Post" p
        WHERE p."status" = 'PUBLISHED'
          AND p."searchVector" @@ websearch_to_tsquery('english', ${q})
        ORDER BY (
            ts_rank(p."searchVector", websearch_to_tsquery('english', ${q}))
            + 0.05 * ln(greatest(p."score", 0) + 1)
            + extract(epoch FROM p."createdAt") / 1e13
        ) DESC, p."id" DESC
        LIMIT ${limit}
    `);

    if (ranked.length === 0) return [];

    const rows = await db.post.findMany({
        where: { id: { in: ranked.map((r) => r.id) } },
        select: SELECT,
    });
    const byId = new Map(rows.map((r) => [r.id, r]));

    // Preserve the SQL relevance order (findMany does not guarantee it).
    return ranked
        .map((r) => byId.get(r.id))
        .filter((r): r is NonNullable<typeof r> => Boolean(r))
        .map((r) => serializePostPublic(r));
}

// Compose-time "similar posts" typeahead: fuzzy trigram match on the title the
// user is drafting, to deflect duplicate questions. Returns only id + title +
// permalink param — no body, dates, or counts — so the dropdown leaks nothing.
export async function findSimilarPosts(
    db: PrismaClient,
    title: string,
    limit = 5,
): Promise<SimilarPost[]> {
    const t = title.trim();
    if (!t) return [];

    const rows = await db.$queryRaw<{ id: string; title: string }[]>(Prisma.sql`
        SELECT p."id", p."title"
        FROM "Post" p
        WHERE p."status" = 'PUBLISHED'
          AND similarity(p."title", ${t}) > ${SIMILAR_THRESHOLD}
        ORDER BY similarity(p."title", ${t}) DESC, p."id" DESC
        LIMIT ${limit}
    `);

    return rows.map((r) => ({
        id: r.id,
        title: r.title,
        param: postParam(r.id, r.title),
    }));
}
