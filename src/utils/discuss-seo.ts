// Pure, db-free SEO helpers for discuss post pages. Kept separate from the
// React JSON-LD components so the shape, date coarsening, and noindex rules are
// unit-testable in isolation.

export type DiscussionForumPostingInput = {
    // Canonical permalink (already public; the post id in it is our own cuid).
    url: string;
    title: string;
    body: string;
    // Public handle, or null for anonymous posts (real identity never appears).
    authorName: string | null;
    // Coarsened to YYYY-MM — provenance constraint forbids day-level dates.
    createdMonth: string;
    editedMonth?: string | null;
    score: number;
    commentCount: number;
};

export type DiscussionForumPostingJsonLd = {
    "@context": "https://schema.org";
    "@type": "DiscussionForumPosting";
    headline: string;
    text: string;
    url: string;
    mainEntityOfPage: string;
    datePublished: string;
    dateModified?: string;
    author: { "@type": "Person"; name: string };
    interactionStatistic: Array<{
        "@type": "InteractionCounter";
        interactionType: string;
        userInteractionCount: number;
    }>;
};

export function buildDiscussionForumPostingJsonLd(
    i: DiscussionForumPostingInput,
): DiscussionForumPostingJsonLd {
    const ld: DiscussionForumPostingJsonLd = {
        "@context": "https://schema.org",
        "@type": "DiscussionForumPosting",
        headline: i.title,
        text: i.body,
        url: i.url,
        mainEntityOfPage: i.url,
        datePublished: i.createdMonth,
        author: { "@type": "Person", name: i.authorName ?? "Anonymous" },
        interactionStatistic: [
            {
                "@type": "InteractionCounter",
                interactionType: "https://schema.org/LikeAction",
                // Clamp negatives — a forum like-count is never below zero.
                userInteractionCount: Math.max(i.score, 0),
            },
            {
                "@type": "InteractionCounter",
                interactionType: "https://schema.org/CommentAction",
                userInteractionCount: i.commentCount,
            },
        ],
    };
    if (i.editedMonth && i.editedMonth !== i.createdMonth) {
        ld.dateModified = i.editedMonth;
    }
    return ld;
}

// A post is too thin to index below this many (trimmed) body characters.
const THIN_BODY_CHARS = 60;
// At or below this score a post is treated as heavily downvoted.
const LOW_SCORE = -5;

// Whether a post page should carry robots noindex: non-published states, thin
// content, and heavily-downvoted posts are kept out of the index.
export function shouldNoindexPost(p: {
    status: string;
    body: string;
    score: number;
}): boolean {
    if (p.status !== "PUBLISHED") return true;
    if (p.body.trim().length < THIN_BODY_CHARS) return true;
    if (p.score <= LOW_SCORE) return true;
    return false;
}
