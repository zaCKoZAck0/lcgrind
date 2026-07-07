import {
    RegExpMatcher,
    englishDataset,
    englishRecommendedTransformers,
} from "obscenity";

// ---------------------------------------------------------------------------
// Pure publish-gate helpers (no DB). The DB-aware orchestration that calls
// these (rate-limit counts, dup lookups) lives in core.ts; everything here is
// deterministic and unit-tested in isolation.
// ---------------------------------------------------------------------------

// Normalized form used for exact-duplicate detection: case-folded with runs of
// whitespace collapsed, so cosmetic reformatting can't slip the same post past
// the dup check.
export function normalizeBody(s: string): string {
    return s.toLowerCase().replace(/\s+/g, " ").trim();
}

// ---------------------------------------------------------------------------
// Rate-limit math
// ---------------------------------------------------------------------------

// How many more posts of a class the author may publish in the current window.
export function quotaRemaining(cap: number, recentCount: number): number {
    return Math.max(0, cap - recentCount);
}

// ---------------------------------------------------------------------------
// Harmful-words filter (obscenity, defeats leet/obfuscation)
// ---------------------------------------------------------------------------

// englishDataset already whitelists common false positives ("class",
// "assignment", "analysis"); the recommended transformers defeat leetspeak and
// confusable obfuscation.
const matcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers,
});

export function hasProfanity(text: string): boolean {
    return matcher.hasMatch(text);
}
