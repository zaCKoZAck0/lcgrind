import { describe, expect, it } from "vitest";
import { BADGES, BADGE_BY_ID, EXP, type BadgeId } from "~/config/gamification";
import { awardForExperience, evaluateBadges, evaluateSocialBadges } from "./core";

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

    it("awards 25 for a comp-only submission", () => {
        const { delta } = awardForExperience({
            comp: { currency: "USD", tc: 200000 },
        });
        expect(delta).toBe(25);
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

describe("evaluateBadges", () => {
    it("grants First Report at one report", () => {
        expect(evaluateBadges({ reportCount: 1, compCount: 0, companyCount: 1 })).toContain(
            "first-report",
        );
    });

    it("grants the 5 and 25 report milestones at their thresholds", () => {
        const five = evaluateBadges({ reportCount: 5, compCount: 0, companyCount: 1 });
        expect(five).toContain("five-reports");
        expect(five).not.toContain("twenty-five-reports");
        const many = evaluateBadges({ reportCount: 25, compCount: 0, companyCount: 1 });
        expect(many).toContain("twenty-five-reports");
    });

    it("grants Comp Contributor and Multi-Company on their conditions", () => {
        expect(
            evaluateBadges({ reportCount: 0, compCount: 1, companyCount: 1 }),
        ).toContain("comp-contributor");
        expect(
            evaluateBadges({ reportCount: 3, compCount: 0, companyCount: 3 }),
        ).toContain("multi-company");
        expect(
            evaluateBadges({ reportCount: 3, compCount: 0, companyCount: 2 }),
        ).not.toContain("multi-company");
    });

    it("grants nothing for an empty history", () => {
        expect(evaluateBadges({ reportCount: 0, compCount: 0, companyCount: 0 })).toEqual([]);
    });
});

describe("evaluateSocialBadges", () => {
    it("awards first-post on first post", () => {
        expect(evaluateSocialBadges({ postCount: 1, commentCount: 0, karma: 0 })).toContain("first-post");
    });

    it("awards karma-10 when karma reaches 10", () => {
        expect(evaluateSocialBadges({ postCount: 0, commentCount: 0, karma: 10 })).toContain("karma-10");
        expect(evaluateSocialBadges({ postCount: 0, commentCount: 0, karma: 9 })).not.toContain("karma-10");
    });

    it("awards prolific-commenter at 25 comments", () => {
        expect(evaluateSocialBadges({ postCount: 0, commentCount: 25, karma: 0 })).toContain("prolific-commenter");
        expect(evaluateSocialBadges({ postCount: 0, commentCount: 24, karma: 0 })).not.toContain("prolific-commenter");
    });

    it("returns empty for a fresh user", () => {
        expect(evaluateSocialBadges({ postCount: 0, commentCount: 0, karma: 0 })).toEqual([]);
    });
});
