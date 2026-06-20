import { describe, expect, it } from "vitest";

import {
    normalizeBody,
    quotaRemaining,
    isProvenanceLink,
    scanLinks,
    hasProfanity,
} from "./publish-gate";

describe("normalizeBody", () => {
    it("case-folds and collapses whitespace so reformatting can't dodge dup", () => {
        expect(normalizeBody("  Hello   WORLD\n\ttest ")).toBe("hello world test");
    });

    it("treats reformatted copies of the same text as equal", () => {
        const a = "Five rounds.\n\nGraphs and DP.";
        const b = "five rounds. graphs and dp.";
        expect(normalizeBody(a)).toBe(normalizeBody(b));
    });
});

describe("quotaRemaining", () => {
    it("counts down to zero and never goes negative", () => {
        expect(quotaRemaining(7, 0)).toBe(7);
        expect(quotaRemaining(7, 6)).toBe(1);
        expect(quotaRemaining(7, 7)).toBe(0);
        expect(quotaRemaining(7, 9)).toBe(0);
    });
});

describe("isProvenanceLink / scanLinks", () => {
    it("flags leetcode discuss links and topic-id queries", () => {
        expect(isProvenanceLink("https://leetcode.com/discuss/interview/123")).toBe(
            true,
        );
        expect(
            isProvenanceLink("https://leetcode.com/discuss/post/456/amazon"),
        ).toBe(true);
        expect(
            isProvenanceLink("https://example.com/thread?topicId=98765"),
        ).toBe(true);
        expect(isProvenanceLink("https://leetcode.com/problems/two-sum/")).toBe(
            false,
        );
    });

    it("separates denied provenance links from surviving external links", () => {
        const body =
            "See https://leetcode.com/discuss/interview/1 and also " +
            "https://docs.google.com/spreadsheet, plus https://leetcode.com/problems/two-sum/.";
        const { deny, external } = scanLinks(body);
        expect(deny).toHaveLength(1);
        expect(deny[0]).toContain("leetcode.com/discuss");
        expect(external).toEqual([
            "https://docs.google.com/spreadsheet",
            "https://leetcode.com/problems/two-sum/",
        ]);
    });

    it("returns empty arrays for a body with no links", () => {
        expect(scanLinks("plain text, no links here")).toEqual({
            deny: [],
            external: [],
        });
    });
});

describe("hasProfanity", () => {
    it("flags plain profanity", () => {
        expect(hasProfanity("you are a fuck")).toBe(true);
    });

    it("defeats leetspeak / obfuscation", () => {
        expect(hasProfanity("this is sh1t")).toBe(true);
    });

    it("passes clean interview prose", () => {
        expect(
            hasProfanity("Five rounds covering graphs and dynamic programming"),
        ).toBe(false);
    });

    it("does not flag allowlisted false positives", () => {
        expect(hasProfanity("class assignment analysis of the constitution")).toBe(
            false,
        );
    });
});
