import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { POST_TAGS, POST_TAG_SLUGS, POST_TAG_MAX } from "~/config/discuss";
import { createPostCore } from "../posts/core";
import { getFeed } from "./feed";
import { seedPostTags, getPostTag } from "./tags";

const db = new PrismaClient({
    datasourceUrl:
        process.env.DATABASE_URL ??
        "postgresql://myuser:mypassword@localhost:5432/mydb",
});

const RUN = Date.now().toString(36);
const U = `vitest-tags-user-${RUN}`;
const HANDLE = `t${RUN}`.slice(0, 18);

// Reads the curated flair slugs attached to a post (sorted for stable asserts).
async function attachedSlugs(postId: string): Promise<string[]> {
    const post = await db.post.findUniqueOrThrow({
        where: { id: postId },
        select: { tags: { select: { tag: { select: { slug: true } } } } },
    });
    return post.tags.map((t) => t.tag.slug).sort();
}

beforeAll(async () => {
    await seedPostTags(db);
    await db.user.create({
        data: { id: U, name: "Tags", email: `${U}@example.test` },
    });
});

afterAll(async () => {
    await db.post.deleteMany({ where: { authorId: U } });
    await db.user.deleteMany({ where: { id: U } });
    await db.$disconnect();
});

describe("seedPostTags", () => {
    it("seeds the full curated set, idempotently", async () => {
        // Second run must not duplicate or error — upsert by slug.
        await seedPostTags(db);
        const rows = await db.postTag.findMany({
            where: { slug: { in: [...POST_TAG_SLUGS] } },
            select: { slug: true, name: true },
        });
        expect(rows).toHaveLength(POST_TAGS.length);
        const bySlug = Object.fromEntries(rows.map((r) => [r.slug, r.name]));
        for (const t of POST_TAGS) {
            expect(bySlug[t.slug]).toBe(t.name);
        }
    });
});

describe("createPostCore — curated flair", () => {
    it("attaches only curated slugs, deduped, ignoring unknown ones", async () => {
        const res = await createPostCore(db, U, {
            title: "Flair attach on a discussion post",
            body: "Body about system design and algorithms.",
            handle: HANDLE,
            tagSlugs: ["dsa", "system-design", "totally-not-real", "dsa"],
        });
        expect(res.ok).toBe(true);
        if (!res.ok) return;

        // Deduped, unknown slug dropped — only curated PostTags attach.
        expect(await attachedSlugs(res.id)).toEqual(["dsa", "system-design"]);

        // The bogus slug must NEVER leak into the algorithmic TopicTag taxonomy.
        const topic = await db.topicTag.findFirst({
            where: { slug: "totally-not-real" },
        });
        expect(topic).toBeNull();
    });

    it("caps the number of attached flair at POST_TAG_MAX", async () => {
        const tooMany = POST_TAG_SLUGS.slice(0, POST_TAG_MAX + 2);
        expect(tooMany.length).toBeGreaterThan(POST_TAG_MAX);
        const res = await createPostCore(db, U, {
            title: "A post that requests too much flair",
            body: "Trying to attach more flair than allowed.",
            tagSlugs: [...tooMany],
        });
        expect(res.ok).toBe(true);
        if (!res.ok) return;
        expect((await attachedSlugs(res.id)).length).toBe(POST_TAG_MAX);
    });
});

describe("getFeed — tag filter", () => {
    it("returns only posts carrying the curated tag", async () => {
        const tagged = await createPostCore(db, U, {
            title: "Negotiation tips for senior offers",
            body: "Some thoughts on negotiating a senior offer package.",
            tagSlugs: ["negotiation"],
        });
        const untagged = await createPostCore(db, U, {
            title: "Unrelated post without that flair",
            body: "This one carries no negotiation flair at all here.",
            tagSlugs: ["referral"],
        });
        expect(tagged.ok && untagged.ok).toBe(true);
        if (!tagged.ok || !untagged.ok) return;

        const { posts } = await getFeed(db, { tag: "negotiation", limit: 50 });
        const ids = posts.map((p) => p.id);
        expect(ids).toContain(tagged.id);
        expect(ids).not.toContain(untagged.id);
    });
});

describe("getPostTag", () => {
    it("resolves a curated slug to its display name", async () => {
        expect(await getPostTag(db, "system-design")).toEqual({
            slug: "system-design",
            name: "System Design",
        });
    });

    it("returns null for an unknown slug", async () => {
        expect(await getPostTag(db, "totally-not-real")).toBeNull();
    });
});
