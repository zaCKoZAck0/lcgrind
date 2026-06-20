import { describe, expect, it } from "vitest";

import {
    slugifyTitle,
    postIdFromParam,
    postParam,
    serializePostPublic,
    type PostRowForPublic,
} from "./core";
import { MONTH_RE } from "~/utils/public-date";

describe("slugifyTitle", () => {
    it("lowercases, strips punctuation, and hyphenates words", () => {
        expect(slugifyTitle("Amazon SDE2 — Onsite Loop!")).toBe(
            "amazon-sde2-onsite-loop",
        );
    });

    it("collapses runs of separators and trims edges", () => {
        expect(slugifyTitle("  How do I   negotiate?? ")).toBe(
            "how-do-i-negotiate",
        );
    });

    it("strips diacritics", () => {
        expect(slugifyTitle("Café résumé tips")).toBe("cafe-resume-tips");
    });

    it("falls back to 'post' for a title with no slug-able characters", () => {
        expect(slugifyTitle("!!! ??? ---")).toBe("post");
    });

    it("bounds length and never ends on a hyphen", () => {
        const slug = slugifyTitle("word ".repeat(60));
        expect(slug.length).toBeLessThanOrEqual(80);
        expect(slug.endsWith("-")).toBe(false);
    });
});

describe("post URL param round-trip", () => {
    it("builds [id]-[slug] and recovers the id (cuid has no hyphen)", () => {
        const id = "clw0abcd1234efgh5678ijkl";
        const param = postParam(id, "Negotiating an Amazon offer");
        expect(param).toBe(`${id}-negotiating-an-amazon-offer`);
        expect(postIdFromParam(param)).toBe(id);
    });

    it("recovers the id when no slug is present", () => {
        expect(postIdFromParam("clw0abcd1234")).toBe("clw0abcd1234");
    });
});

describe("serializePostPublic — the leak boundary", () => {
    const baseRow: PostRowForPublic = {
        id: "clw0postid",
        type: "EXPERIENCE",
        title: "My Amazon SDE2 loop",
        slug: "my-amazon-sde2-loop",
        body: "Five rounds over two days.",
        isAnonymous: false,
        score: 12,
        upCount: 14,
        downCount: 2,
        commentCount: 3,
        status: "PUBLISHED",
        createdAt: new Date("2026-03-17T08:42:11.000Z"),
        editedAt: new Date("2026-03-19T11:00:00.000Z"),
        author: { handle: "candid_dev", avatar: null },
        company: { slug: "amazon", name: "Amazon" },
    };

    it("coarsens all dates to YYYY-MM and never emits a day-level date", () => {
        const out = serializePostPublic(baseRow);
        expect(out.createdMonth).toBe("2026-03");
        expect(out.editedMonth).toBe("2026-03");
        expect(MONTH_RE.test(out.createdMonth)).toBe(true);

        const json = JSON.stringify(out);
        expect(json).not.toMatch(/\d{4}-\d{2}-\d{2}/); // no ISO day
        expect(json).not.toMatch(/T\d{2}:\d{2}/); // no timestamp
    });

    it("never serializes author identity beyond handle/avatar", () => {
        const json = JSON.stringify(serializePostPublic(baseRow));
        expect(json).not.toContain("authorId");
        expect(json).not.toContain("createdAt");
        expect(json).not.toMatch(/@/); // no email
    });

    it("hides the author entirely when the post is anonymous", () => {
        const out = serializePostPublic({ ...baseRow, isAnonymous: true });
        expect(out.author).toBeNull();
        expect(JSON.stringify(out)).not.toContain("candid_dev");
    });

    it("hides the author when no handle is set yet", () => {
        const out = serializePostPublic({
            ...baseRow,
            author: { handle: null, avatar: null },
        });
        expect(out.author).toBeNull();
    });

    it("exposes handle + avatar for a non-anonymous post", () => {
        const out = serializePostPublic(baseRow);
        expect(out.author).toEqual({ handle: "candid_dev", avatar: null });
    });
});
