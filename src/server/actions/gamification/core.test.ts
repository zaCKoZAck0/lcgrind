import { describe, expect, it } from "vitest";
import { BADGES, BADGE_BY_ID, EXP, type BadgeId } from "~/config/gamification";
import { FEATURE_FLAGS } from "~/config/feature-flags";
import {
    awardForExperience,
    evaluateBadges,
    evaluateSocialBadges,
    evaluateGrindBadges,
    evaluateLoginBadges,
    type GrindStats,
} from "./core";

describe("gamification config", () => {
    it("has at least 21 always-present badges", () => {
        expect(BADGES.length).toBeGreaterThanOrEqual(21);
    });

    it("every badge has exp > 0 and a valid group", () => {
        const validGroups = new Set(["contribution", "social", "grind", "daily"]);
        for (const b of BADGES) {
            expect(b.exp).toBeGreaterThan(0);
            expect(validGroups.has(b.group)).toBe(true);
        }
    });

    it("BADGE_BY_ID lookup works for all badges", () => {
        for (const b of BADGES) {
            expect(BADGE_BY_ID[b.id]).toStrictEqual(b);
        }
    });

    it("EXP.DAILY is 5", () => {
        expect(EXP.DAILY).toBe(5);
    });
});

describe("awardForExperience", () => {
    it("awards 50 for an interview report with rounds and questions plus the detail bonus", () => {
        const { delta } = awardForExperience({
            rounds: [
                { type: "Coding", questions: [{ text: "Two sum" }] },
            ],
        });
        expect(delta).toBe(60);
    });

    it("awards 50 with no detail bonus when rounds are present but carry no questions", () => {
        const { delta } = awardForExperience({
            rounds: [{ type: "Coding", questions: [] }],
        });
        expect(delta).toBe(50);
    });

    it("awards comp-only exp gated on the COMPENSATION flag (25 on, 0 off)", () => {
        const { delta } = awardForExperience({
            comp: { currency: "USD", tc: 200000 },
        });
        expect(delta).toBe(FEATURE_FLAGS.COMPENSATION ? 25 : 0);
    });

    it("treats a submission with rounds and comp as a report (50) plus detail bonus", () => {
        const { delta } = awardForExperience({
            rounds: [{ type: "Coding", questions: [{ text: "BFS" }] }],
            comp: { currency: "USD", tc: 200000 },
        });
        expect(delta).toBe(60);
    });

    it("awards 0 for an empty submission", () => {
        expect(awardForExperience({}).delta).toBe(0);
        expect(awardForExperience({ rounds: [], comp: undefined }).delta).toBe(0);
    });

    it("does not count comp with non-positive tc", () => {
        expect(awardForExperience({ comp: { currency: "USD", tc: 0 } }).delta).toBe(0);
    });
});

describe("evaluateBadges (contribution)", () => {
    it("awards valuable-contributor when compCount >= 1", () => {
        expect(evaluateBadges({ compCount: 1, hasStructured: false })).toContain("valuable-contributor");
    });

    it("awards well-structured when hasStructured is true", () => {
        expect(evaluateBadges({ compCount: 0, hasStructured: true })).toContain("well-structured");
    });

    it("returns empty when no criteria met", () => {
        expect(evaluateBadges({ compCount: 0, hasStructured: false })).toHaveLength(0);
    });
});

describe("evaluateSocialBadges", () => {
    it("awards first-post at postCount 1", () => {
        expect(evaluateSocialBadges({ postCount: 1, commentCount: 0, reputation: 0 })).toContain("first-post");
    });

    it("awards reputation-10, reputation-100, reputation-500 at thresholds", () => {
        expect(evaluateSocialBadges({ postCount: 0, commentCount: 0, reputation: 500 })).toContain("reputation-10");
        expect(evaluateSocialBadges({ postCount: 0, commentCount: 0, reputation: 500 })).toContain("reputation-100");
        expect(evaluateSocialBadges({ postCount: 0, commentCount: 0, reputation: 500 })).toContain("reputation-500");
    });

    it("awards prolific-commenter at 25 comments", () => {
        expect(evaluateSocialBadges({ postCount: 0, commentCount: 25, reputation: 0 })).toContain("prolific-commenter");
    });
});

describe("evaluateGrindBadges", () => {
    const base: GrindStats = { totalSolved: 0, hardSolved: 0, solvingStreak: 0, distinctDays: 0, completedSheetIds: [] };

    it("awards solver-10 at 10 solved", () => {
        expect(evaluateGrindBadges({ ...base, totalSolved: 10 })).toContain("solver-10");
    });

    it("awards solver milestones cumulatively", () => {
        const r = evaluateGrindBadges({ ...base, totalSolved: 500 });
        expect(r).toContain("solver-10");
        expect(r).toContain("solver-50");
        expect(r).toContain("solver-100");
        expect(r).toContain("solver-500");
    });

    it("awards hard-hitter-10 at 10 hard solved", () => {
        expect(evaluateGrindBadges({ ...base, hardSolved: 10 })).toContain("hard-hitter-10");
    });

    it("awards streak-7 at solvingStreak 7", () => {
        expect(evaluateGrindBadges({ ...base, solvingStreak: 7 })).toContain("streak-7");
    });

    it("awards committed at 50 distinct days", () => {
        expect(evaluateGrindBadges({ ...base, distinctDays: 50 })).toContain("committed");
    });

    it("awards interview-ready when completedSheetIds is non-empty", () => {
        expect(evaluateGrindBadges({ ...base, completedSheetIds: [1] })).toContain("interview-ready");
    });
});

describe("evaluateLoginBadges", () => {
    it("awards login-streak-7 at streak 7", () => {
        expect(evaluateLoginBadges(7)).toContain("login-streak-7");
    });

    it("awards login-streak-30 at streak 30 (also includes 7)", () => {
        const r = evaluateLoginBadges(30);
        expect(r).toContain("login-streak-7");
        expect(r).toContain("login-streak-30");
    });

    it("awards login-streak-100 at streak 100", () => {
        const r = evaluateLoginBadges(100);
        expect(r).toContain("login-streak-7");
        expect(r).toContain("login-streak-30");
        expect(r).toContain("login-streak-100");
    });

    it("returns empty below 7", () => {
        expect(evaluateLoginBadges(6)).toHaveLength(0);
    });
});
