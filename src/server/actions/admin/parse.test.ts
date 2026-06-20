import { describe, expect, it } from "vitest";
import {
    buildParsePrompt,
    coerceParsedPayload,
    parseWithGenerator,
} from "./parse";

describe("buildParsePrompt", () => {
    it("includes the company name and raw text and forbids inventing links/dates", () => {
        const prompt = buildParsePrompt("Stripe", "Phone screen then onsite...");
        expect(prompt).toContain("Stripe");
        expect(prompt).toContain("Phone screen then onsite");
        expect(prompt.toLowerCase()).toContain("do not invent");
    });
});

describe("coerceParsedPayload", () => {
    it("keeps a well-formed payload and coerces types", () => {
        const out = coerceParsedPayload({
            role: "Software Engineer",
            level: "SDE2",
            expYears: 4,
            rounds: [
                {
                    type: "Coding",
                    questions: [{ text: "Two sum", type: "DSA" }],
                },
            ],
            comp: { currency: "usd", base: 150000, tc: 250000 },
        });
        expect(out).not.toBeNull();
        expect(out?.comp?.currency).toBe("USD");
        expect(out?.rounds?.[0].questions?.[0].text).toBe("Two sum");
    });

    it("drops questions with empty text and rounds that become empty", () => {
        const out = coerceParsedPayload({
            rounds: [
                { type: "Coding", questions: [{ text: "  ", type: "DSA" }] },
                { type: "Behavioral", questions: [{ text: "Conflict story", type: "Behavioral" }] },
            ],
        });
        expect(out?.rounds).toHaveLength(1);
        expect(out?.rounds?.[0].type).toBe("Behavioral");
    });

    it("strips any problemUrl the model tried to invent", () => {
        const out = coerceParsedPayload({
            rounds: [
                {
                    type: "Coding",
                    questions: [
                        { text: "Reverse list", type: "DSA", problemUrl: "https://leetcode.com/discuss/123" },
                    ],
                },
            ],
        });
        expect(out?.rounds?.[0].questions?.[0]).not.toHaveProperty("problemUrl");
    });

    it("nulls comp when tc is missing or non-positive", () => {
        const out = coerceParsedPayload({
            comp: { currency: "USD", base: 100000 },
            rounds: [{ type: "Coding", questions: [{ text: "X", type: "DSA" }] }],
        });
        expect(out?.comp).toBeUndefined();
    });

    it("returns null for unusable input", () => {
        expect(coerceParsedPayload(null)).toBeNull();
        expect(coerceParsedPayload({ rounds: [], comp: null })).toBeNull();
        expect(coerceParsedPayload("nonsense")).toBeNull();
    });
});

describe("parseWithGenerator", () => {
    it("passes the prompt to the generator and coerces its JSON", async () => {
        let seenPrompt = "";
        const out = await parseWithGenerator(
            "Acme",
            "Two coding rounds and a system design round.",
            async (prompt) => {
                seenPrompt = prompt;
                return JSON.stringify({
                    role: "SWE",
                    rounds: [{ type: "Coding", questions: [{ text: "Merge intervals", type: "DSA" }] }],
                });
            },
        );
        expect(seenPrompt).toContain("Acme");
        expect(out?.rounds?.[0].questions?.[0].text).toBe("Merge intervals");
    });

    it("tolerates a fenced code block around the JSON", async () => {
        const out = await parseWithGenerator("Acme", "text", async () =>
            "```json\n{\"rounds\":[{\"type\":\"Coding\",\"questions\":[{\"text\":\"BFS\",\"type\":\"DSA\"}]}]}\n```",
        );
        expect(out?.rounds?.[0].questions?.[0].text).toBe("BFS");
    });

    it("returns null when the generator returns unparseable output", async () => {
        const out = await parseWithGenerator("Acme", "text", async () => "not json at all");
        expect(out).toBeNull();
    });
});
