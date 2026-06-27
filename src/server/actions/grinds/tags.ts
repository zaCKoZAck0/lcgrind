import { type PrismaClient } from "@prisma/client";

import { POST_TAGS, POST_TAG_SLUGS, POST_TAG_MAX } from "~/config/grinds";

// The public flair shape — slug + display name only, nothing identity-bearing.
export type PublicPostTag = { slug: string; name: string };

// Idempotently upsert the curated PostTag set from config. Safe to run on every
// deploy/seed — keyed by the stable slug, so names can be relabeled without
// orphaning posts. This is the only writer of the curated taxonomy.
export async function seedPostTags(db: PrismaClient): Promise<void> {
    for (const t of POST_TAGS) {
        await db.postTag.upsert({
            where: { slug: t.slug },
            create: { slug: t.slug, name: t.name },
            update: { name: t.name },
        });
    }
}

// Normalizes a requested flair list to the curated set: drops unknown slugs,
// dedupes, and caps at POST_TAG_MAX. The gate that keeps the algorithmic
// TopicTag taxonomy and arbitrary author input out of the curated flair.
export function normalizeTagSlugs(slugs: string[] | undefined): string[] {
    if (!slugs?.length) return [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const s of slugs) {
        if (POST_TAG_SLUGS.includes(s) && !seen.has(s)) {
            seen.add(s);
            out.push(s);
            if (out.length === POST_TAG_MAX) break;
        }
    }
    return out;
}

// Attaches curated flair to a post inside the caller's transaction. Resolves the
// normalized slugs to PostTag ids and writes the join rows; a no-op when the
// normalized list is empty. Never touches TopicTag.
export async function attachPostTags(
    tx: PrismaClient,
    postId: string,
    slugs: string[] | undefined,
): Promise<void> {
    const wanted = normalizeTagSlugs(slugs);
    if (wanted.length === 0) return;
    const tags = await tx.postTag.findMany({
        where: { slug: { in: wanted } },
        select: { id: true },
    });
    if (tags.length === 0) return;
    await tx.postTags.createMany({
        data: tags.map((t) => ({ postId, tagId: t.id })),
        skipDuplicates: true,
    });
}

// Resolves a curated flair slug to its public shape, or null if it is not a
// curated PostTag. Drives the /discuss/tag/[slug] landing page (404 on null).
export async function getPostTag(
    db: PrismaClient,
    slug: string,
): Promise<PublicPostTag | null> {
    const tag = await db.postTag.findUnique({
        where: { slug },
        select: { slug: true, name: true },
    });
    return tag;
}
