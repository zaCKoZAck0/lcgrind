import { describe, expect, it } from "vitest";

import {
    normalizeBody,
    quotaRemaining,
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
