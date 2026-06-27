// Shared between the compose form (client) and the post server action; keep this
// module free of server-only imports. Length bounds for public Discuss posts.
export const POST_TITLE_MIN = 8;
export const POST_TITLE_MAX = 160;
export const POST_BODY_MAX = 20000;

// Publish-gate rate limits. EXPERIENCE forks an admin copy so it uses the
// submission cap; plain text posts (type=null) get a lighter cap.
export { WEEKLY_SUBMISSION_CAP as EXPERIENCE_WEEKLY_CAP } from "./submissions";
export const TEXT_POST_WEEKLY_CAP = 20;
export const RATE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

// EXPERIENCE posts fork a Submission whose rawText must clear the submission min.
export { MIN_TEXT_LENGTH as EXPERIENCE_BODY_MIN } from "./submissions";

// Curated flair taxonomy — author-chosen, distinct from the algorithmic
// TopicTag. Single source of truth for the seeded PostTag rows, the compose
// flair picker, and the /discuss/tag/[slug] landing pages. Slugs are stable;
// names are display labels.
import { FEATURE_FLAGS } from "~/config/feature-flags";

export const POST_TAGS = [
    ...(FEATURE_FLAGS.SYSTEM_DESIGN ? [{ slug: "system-design", name: "System Design" }] : []),
    { slug: "dsa", name: "DSA" },
    { slug: "behavioral", name: "Behavioral" },
    { slug: "oa", name: "Online Assessment" },
    { slug: "negotiation", name: "Negotiation" },
    { slug: "offer", name: "Offer" },
    { slug: "referral", name: "Referral" },
    { slug: "resume", name: "Resume" },
    { slug: "general", name: "General" },
] as const;
export const POST_TAG_SLUGS: readonly string[] = POST_TAGS.map((t) => t.slug);
// How many flair a single post may carry (keeps cards/landing pages tidy).
export const POST_TAG_MAX = 3;

// Handle: lowercase letters, digits, underscore; 3-20 chars; must start alpha.
export const HANDLE_RE = /^[a-z][a-z0-9_]{2,19}$/;

// Comment bodies are lighter than posts; keep them bounded so a thread stays
// readable and the publish gate stays cheap.
export const COMMENT_BODY_MAX = 10000;

// Reddit-style nesting cap. Comments at depth 0..(cap-1) render inline; a node
// whose children would exceed the cap collapses them behind a "continue thread"
// link so deeply nested replies don't crush mobile layout.
export const COMMENT_DEPTH_CAP = 5;
