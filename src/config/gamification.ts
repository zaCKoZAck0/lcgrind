// Contribution-based points. Shared between the approve transaction (server)
// and any client surface that explains scoring; keep this module free of
// server-only imports.
import { FEATURE_FLAGS } from "~/config/feature-flags";

export const POINTS = {
    // A submission that includes interview rounds.
    REPORT: 50,
    ...(FEATURE_FLAGS.COMPENSATION ? { COMP_ONLY: 25 } : {}),
    // Extra reward when a report carries actual questions, not just round names.
    DETAIL_BONUS: 10,
} as const;

export type BadgeId =
    | "first-report"
    | "five-reports"
    | "twenty-five-reports"
    | "comp-contributor"
    | "multi-company"
    | "first-post"
    | "karma-10"
    | "prolific-commenter";

export const BADGES: { id: BadgeId; label: string; description: string }[] = [
    { id: "first-report", label: "First Report", description: "Shared your first interview experience" },
    { id: "five-reports", label: "5 Reports", description: "Five approved interview reports" },
    { id: "twenty-five-reports", label: "25 Reports", description: "Twenty-five approved interview reports" },
    ...(FEATURE_FLAGS.COMPENSATION ? [{ id: "comp-contributor" as const, label: "Comp Contributor", description: "Contributed compensation data" }] : []),
    { id: "multi-company", label: "Multi-Company", description: "Reports across three or more companies" },
    { id: "first-post", label: "First Post", description: "Published your first post on Discuss" },
    { id: "karma-10", label: "Karma 10", description: "Reached 10 karma from community votes" },
    { id: "prolific-commenter", label: "Prolific Commenter", description: "Posted 25 comments" },
];

export const BADGE_BY_ID: Record<BadgeId, (typeof BADGES)[number]> = Object.fromEntries(
    BADGES.map((b) => [b.id, b]),
) as Record<BadgeId, (typeof BADGES)[number]>;
