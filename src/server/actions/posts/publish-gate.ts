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
// URL / provenance policy
// ---------------------------------------------------------------------------

const URL_RE = /https?:\/\/[^\s)<>\]]+/gi;

// Provenance-shaped links betray the scraped LeetCode-discuss origin and must
// never be publishable: any leetcode.com discuss path, or a topic-id query.
const PROVENANCE_RE = /leetcode\.com\/(?:[a-z-]+\/)*discuss/i;
const TOPIC_ID_RE = /[?&]topic[_-]?id=/i;

export function isProvenanceLink(url: string): boolean {
    return PROVENANCE_RE.test(url) || TOPIC_ID_RE.test(url);
}

// Splits the URLs found in a body into denied (provenance-shaped) and surviving
// external links. A post with any denied link is rejected by the gate; the
// external links are the ones the renderer later marks rel="nofollow ugc".
export function scanLinks(body: string): {
    deny: string[];
    external: string[];
} {
    const urls = body.match(URL_RE) ?? [];
    const deny: string[] = [];
    const external: string[] = [];
    for (const raw of urls) {
        // Trim trailing punctuation that commonly rides along in prose.
        const url = raw.replace(/[.,;:!?]+$/, "");
        if (isProvenanceLink(url)) deny.push(url);
        else external.push(url);
    }
    return { deny, external };
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
