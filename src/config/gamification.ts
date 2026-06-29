import { FEATURE_FLAGS } from "~/config/feature-flags";

export const EXP = {
    REPORT: 50,
    ...(FEATURE_FLAGS.COMPENSATION ? { COMP_ONLY: 25 } : {}),
    DETAIL_BONUS: 10,
    DAILY: 5,
} as const;

export type BadgeGroup = "contribution" | "social" | "grind" | "daily";

export type BadgeId =
    | "valuable-contributor"
    | "well-structured"
    | "first-post"
    | "karma-10"
    | "karma-100"
    | "karma-500"
    | "prolific-commenter"
    | "helpful-answer"
    | "solver-10"
    | "solver-50"
    | "solver-100"
    | "solver-500"
    | "hard-hitter-10"
    | "hard-hitter-50"
    | "streak-7"
    | "streak-30"
    | "streak-100"
    | "committed"
    | "interview-ready"
    | "login-streak-7"
    | "login-streak-30"
    | "login-streak-100";

export const BADGES: { id: BadgeId; label: string; description: string; exp: number; group: BadgeGroup }[] = [
    // A. Contribution
    { id: "valuable-contributor", label: "Valuable Contributor", description: "Contributed compensation data", exp: 50, group: "contribution" },
    { id: "well-structured", label: "Well Structured", description: "Shared an interview experience using the structured editor", exp: 100, group: "contribution" },
    // B. Social
    { id: "first-post", label: "First Post", description: "Published your first post on Discuss", exp: 50, group: "social" },
    { id: "karma-10", label: "Karma 10", description: "Reached 10 karma from community votes", exp: 50, group: "social" },
    { id: "karma-100", label: "Karma 100", description: "Reached 100 karma from community votes", exp: 250, group: "social" },
    { id: "karma-500", label: "Karma 500", description: "Reached 500 karma from community votes", exp: 1500, group: "social" },
    { id: "prolific-commenter", label: "Prolific Commenter", description: "Posted 25 comments", exp: 100, group: "social" },
    // helpful-answer: in catalog but evaluator never fires until accepted-answers ships
    { id: "helpful-answer", label: "Helpful Answer", description: "First accepted answer", exp: 100, group: "social" },
    // C. Grind (sync-enabled users only)
    { id: "solver-10", label: "Solver: 10", description: "Solved 10 problems", exp: 50, group: "grind" },
    { id: "solver-50", label: "Solver: 50", description: "Solved 50 problems", exp: 100, group: "grind" },
    { id: "solver-100", label: "Solver: 100", description: "Solved 100 problems", exp: 250, group: "grind" },
    { id: "solver-500", label: "Solver: 500", description: "Solved 500 problems", exp: 1500, group: "grind" },
    { id: "hard-hitter-10", label: "Hard Hitter: 10", description: "Solved 10 Hard problems", exp: 250, group: "grind" },
    { id: "hard-hitter-50", label: "Hard Hitter: 50", description: "Solved 50 Hard problems", exp: 600, group: "grind" },
    { id: "streak-7", label: "Streak: 7 Days", description: "7-day solving streak", exp: 100, group: "grind" },
    { id: "streak-30", label: "Streak: 30 Days", description: "30-day solving streak", exp: 600, group: "grind" },
    { id: "streak-100", label: "Streak: 100 Days", description: "100-day solving streak", exp: 1500, group: "grind" },
    { id: "committed", label: "Committed", description: "Solved on 50 distinct days", exp: 250, group: "grind" },
    { id: "interview-ready", label: "Interview Ready", description: "Completed a curated sheet 100%", exp: 600, group: "grind" },
    // D. Daily Login
    { id: "login-streak-7", label: "Login Streak: 7", description: "7-day login streak", exp: 100, group: "daily" },
    { id: "login-streak-30", label: "Login Streak: 30", description: "30-day login streak", exp: 600, group: "daily" },
    { id: "login-streak-100", label: "Login Streak: 100", description: "100-day login streak", exp: 1500, group: "daily" },
];

export const BADGE_BY_ID: Record<BadgeId, (typeof BADGES)[number]> = Object.fromEntries(
    BADGES.map((b) => [b.id, b]),
) as Record<BadgeId, (typeof BADGES)[number]>;
