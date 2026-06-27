import { describe, expect, it } from "vitest";

import {
    buildGrindsForumPostingJsonLd,
    shouldNoindexPost,
} from "./grinds-seo";

const base = {
    url: "https://example.com/grinds/abc123-my-post",
    title: "My interview at Acme",
    body: "I interviewed at Acme. There were three rounds, mostly DSA and one system design.",
    authorName: "alice",
    createdMonth: "2026-03",
    editedMonth: null as string | null,
    score: 12,
    commentCount: 4,
};

describe("buildGrindsForumPostingJsonLd", () => {
    it("produces a DiscussionForumPosting with month-only dates", () => {
        const ld = buildGrindsForumPostingJsonLd(base);
        expect(ld["@type"]).toBe("DiscussionForumPosting");
        expect(ld.headline).toBe("My interview at Acme");
        expect(ld.datePublished).toBe("2026-03");
        // No day-level precision anywhere in the serialized object.
        expect(JSON.stringify(ld)).not.toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it("names an anonymous author 'Anonymous' (no handle leaked)", () => {
        const ld = buildGrindsForumPostingJsonLd({
            ...base,
            authorName: null,
        });
        expect(ld.author.name).toBe("Anonymous");
    });

    it("emits dateModified only when edited in a different month", () => {
        const same = buildGrindsForumPostingJsonLd({
            ...base,
            editedMonth: "2026-03",
        });
        expect(same.dateModified).toBeUndefined();

        const edited = buildGrindsForumPostingJsonLd({
            ...base,
            editedMonth: "2026-05",
        });
        expect(edited.dateModified).toBe("2026-05");
    });

    it("carries social interaction counters", () => {
        const ld = buildGrindsForumPostingJsonLd(base);
        const json = JSON.stringify(ld);
        expect(json).toContain("LikeAction");
        expect(json).toContain("CommentAction");
    });

    it("leaks no provenance (no discuss urls, no email)", () => {
        const json = JSON.stringify(buildGrindsForumPostingJsonLd(base));
        expect(json).not.toContain("leetcode.com/discuss");
        expect(json).not.toMatch(/@[\w.-]+\.\w+/); // no email-shaped strings
    });
});

describe("shouldNoindexPost", () => {
    it("indexes a healthy published post", () => {
        expect(
            shouldNoindexPost({ status: "PUBLISHED", body: base.body, score: 12 }),
        ).toBe(false);
    });

    it("noindexes non-published (removed/tombstoned/shadow) posts", () => {
        for (const status of ["REMOVED", "TOMBSTONED", "SHADOW"]) {
            expect(
                shouldNoindexPost({ status, body: base.body, score: 12 }),
            ).toBe(true);
        }
    });

    it("noindexes thin content", () => {
        expect(
            shouldNoindexPost({ status: "PUBLISHED", body: "too short", score: 5 }),
        ).toBe(true);
    });

    it("noindexes heavily downvoted posts", () => {
        expect(
            shouldNoindexPost({ status: "PUBLISHED", body: base.body, score: -8 }),
        ).toBe(true);
    });
});
