import type { PrismaClient } from "@prisma/client";

import { EXP, BADGE_BY_ID, type BadgeId } from "~/config/gamification";
import { FEATURE_FLAGS } from "~/config/feature-flags";
import type { SanitizedExperience } from "../admin/core";

export type AwardOutcome = { delta: number; reason: string };

// Scores a submission from its sanitized experience payload (the same shape the
// approval normalizer consumes). Pure and deterministic.
export function awardForExperience(payload: SanitizedExperience): AwardOutcome {
    const rounds = payload.rounds ?? [];
    const hasRounds = rounds.length > 0;
    const hasQuestions = rounds.some((r) =>
        (r.questions ?? []).some((q) => (q.text ?? "").trim().length > 0),
    );
    const c = payload.comp;
    const hasComp = !!c && typeof c.tc === "number" && c.tc > 0;

    let delta = 0;
    const reasons: string[] = [];
    if (hasRounds) {
        delta += EXP.REPORT;
        reasons.push("report");
        if (hasQuestions) {
            delta += EXP.DETAIL_BONUS;
            reasons.push("detail");
        }
    } else if (hasComp) {
        delta += EXP.COMP_ONLY;
        reasons.push("comp_only");
    }

    return { delta, reason: reasons.join("+") || "none" };
}

export type ContributionStats = {
    compCount: number;
    hasStructured: boolean;
};

// Milestone badges from contribution history. Pure; additive (earned badges
// never get revoked here — callers persist with a unique constraint).
export function evaluateBadges(stats: ContributionStats): BadgeId[] {
    const earned: BadgeId[] = [];
    if (stats.compCount >= 1) earned.push("valuable-contributor");
    if (stats.hasStructured) earned.push("well-structured");
    return earned;
}

export type SocialStats = {
    postCount: number;
    commentCount: number;
    karma: number;
};

// Social badges earned from public posting activity (distinct from contribution
// points which gate on admin-approved submissions).
export function evaluateSocialBadges(stats: SocialStats): BadgeId[] {
    const earned: BadgeId[] = [];
    if (stats.postCount >= 1) earned.push("first-post");
    if (stats.karma >= 10) earned.push("karma-10");
    if (stats.karma >= 100) earned.push("karma-100");
    if (stats.karma >= 500) earned.push("karma-500");
    if (stats.commentCount >= 25) earned.push("prolific-commenter");
    // helpful-answer: not evaluated until accepted-answers feature ships
    return earned;
}

export type GrindStats = {
    totalSolved: number;
    hardSolved: number;
    solvingStreak: number;
    distinctDays: number;
    completedSheetIds: number[];
};

export function evaluateGrindBadges(stats: GrindStats): BadgeId[] {
    const earned: BadgeId[] = [];
    if (stats.totalSolved >= 10) earned.push("solver-10");
    if (stats.totalSolved >= 50) earned.push("solver-50");
    if (stats.totalSolved >= 100) earned.push("solver-100");
    if (stats.totalSolved >= 500) earned.push("solver-500");
    if (stats.hardSolved >= 10) earned.push("hard-hitter-10");
    if (stats.hardSolved >= 50) earned.push("hard-hitter-50");
    if (stats.solvingStreak >= 7) earned.push("streak-7");
    if (stats.solvingStreak >= 30) earned.push("streak-30");
    if (stats.solvingStreak >= 100) earned.push("streak-100");
    if (stats.distinctDays >= 50) earned.push("committed");
    if (stats.completedSheetIds.length > 0) earned.push("interview-ready");
    return earned;
}

export function evaluateLoginBadges(streak: number): BadgeId[] {
    const earned: BadgeId[] = [];
    if (streak >= 7) earned.push("login-streak-7");
    if (streak >= 30) earned.push("login-streak-30");
    if (streak >= 100) earned.push("login-streak-100");
    return earned;
}

type TxClient = Omit<
    PrismaClient,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

// Inserts newly earned badge rows, credits their one-time exp to the ledger and
// User.exp, and fires BADGE notifications. Idempotent via the unique constraint.
export async function grantNewBadgesWithExp(
    db: PrismaClient,
    userId: string,
    earnedIds: BadgeId[],
): Promise<void> {
    if (earnedIds.length === 0) return;

    const existing = await db.userBadge.findMany({
        where: { userId, badge: { in: earnedIds } },
        select: { badge: true },
    });
    const existingSet = new Set(existing.map((b) => b.badge));
    const newIds = earnedIds.filter((id) => !existingSet.has(id));
    if (newIds.length === 0) return;

    const totalExp = newIds.reduce((sum, id) => sum + BADGE_BY_ID[id].exp, 0);

    await db.$transaction(async (tx) => {
        await tx.userBadge.createMany({
            data: newIds.map((badge) => ({ userId, badge })),
            skipDuplicates: true,
        });
        await tx.pointsLedger.createMany({
            data: newIds.map((id) => ({
                userId,
                submissionId: null,
                delta: BADGE_BY_ID[id].exp,
                reason: `badge:${id}`,
            })),
        });
        await tx.user.update({
            where: { id: userId },
            data: { exp: { increment: totalExp } },
        });
    });

    if (FEATURE_FLAGS.NOTIFICATIONS) {
        const { notify } = await import("../notifications/core");
        await Promise.all(
            newIds.map(() =>
                notify(db, { userId, type: "BADGE", actorId: null }).catch(() => undefined),
            ),
        );
    }
}

// Reconciles the ledger entry for one submission inside a transaction:
// removes any prior entry for it, writes the new signed entry (when non-zero),
// and adjusts the user's running total by the net change. Idempotent — running
// approve twice leaves the same total.
export async function reconcileLedger(
    tx: TxClient,
    args: { userId: string; submissionId: string; delta: number; reason: string },
): Promise<void> {
    const existing = await tx.pointsLedger.findMany({
        where: { submissionId: args.submissionId },
        select: { delta: true },
    });
    const prior = existing.reduce((sum, e) => sum + e.delta, 0);

    await tx.pointsLedger.deleteMany({ where: { submissionId: args.submissionId } });
    if (args.delta !== 0) {
        await tx.pointsLedger.create({
            data: {
                userId: args.userId,
                submissionId: args.submissionId,
                delta: args.delta,
                reason: args.reason,
            },
        });
    }

    const net = args.delta - prior;
    if (net !== 0) {
        await tx.user.update({
            where: { id: args.userId },
            data: { exp: { increment: net } },
        });
    }
}

// Reverses a submission's currently-awarded points with an audit-preserving
// negative entry (the original entries are kept). Net ledger for the submission
// becomes zero and the user's total is decremented. No-op when nothing is owed.
export async function reverseLedger(
    tx: TxClient,
    args: { userId: string; submissionId: string; reason: string },
): Promise<void> {
    const existing = await tx.pointsLedger.findMany({
        where: { submissionId: args.submissionId },
        select: { delta: true },
    });
    const owed = existing.reduce((sum, e) => sum + e.delta, 0);
    if (owed === 0) return;

    await tx.pointsLedger.create({
        data: {
            userId: args.userId,
            submissionId: args.submissionId,
            delta: -owed,
            reason: args.reason,
        },
    });
    await tx.user.update({
        where: { id: args.userId },
        data: { exp: { decrement: owed } },
    });
}

// Checks social badge milestones for the user and awards any newly earned ones.
// Also fires a BADGE notification for each new award. Safe to call repeatedly.
export async function syncSocialBadges(db: PrismaClient, userId: string): Promise<void> {
    const [postCount, commentCount, user] = await Promise.all([
        db.post.count({ where: { authorId: userId, status: "PUBLISHED", isAnonymous: false } }),
        db.comment.count({ where: { authorId: userId, isAnonymous: false } }),
        db.user.findUnique({ where: { id: userId }, select: { karma: true } }),
    ]);
    if (!user) return;

    const earned = evaluateSocialBadges({ postCount, commentCount, karma: user.karma });
    if (earned.length === 0) return;

    const existing = await db.userBadge.findMany({
        where: { userId, badge: { in: earned } },
        select: { badge: true },
    });
    const existingSet = new Set(existing.map((b) => b.badge));
    const newBadges = earned.filter((b) => !existingSet.has(b));
    if (newBadges.length === 0) return;

    await db.userBadge.createMany({
        data: newBadges.map((badge) => ({ userId, badge })),
        skipDuplicates: true,
    });

    // Notify the user for each newly awarded badge (lazy import to avoid cycle).
    if (FEATURE_FLAGS.NOTIFICATIONS) {
        const { notify } = await import("../notifications/core");
        await Promise.all(
            newBadges.map(() =>
                notify(db, { userId, type: "BADGE", actorId: null }).catch(() => undefined),
            ),
        );
    }
}

// Recomputes contribution stats from the user's currently-live community rows
// (which only exist for APPROVED submissions) and persists any newly earned
// badges. Safe to call repeatedly.
export async function syncBadges(db: PrismaClient, userId: string): Promise<void> {
    const approved = await db.submission.findMany({
        where: { userId, status: "APPROVED" },
        select: {
            companyId: true,
            communityAsks: { select: { id: true }, take: 1 },
            communityComp: { select: { id: true }, take: 1 },
        },
    });

    let compCount = 0;
    let hasStructured = false;
    for (const s of approved) {
        const hasComp = s.communityComp.length > 0;
        const hasAsks = s.communityAsks.length > 0;
        if (hasComp) compCount += 1;
        if (hasAsks) hasStructured = true;
    }

    const earned = evaluateBadges({ compCount, hasStructured });
    if (earned.length === 0) return;

    await db.userBadge.createMany({
        data: earned.map((badge) => ({ userId, badge })),
        skipDuplicates: true,
    });
}
