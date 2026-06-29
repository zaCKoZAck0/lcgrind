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
    reportCount: number;
    compCount: number;
    companyCount: number;
};

// Milestone badges from contribution history. Pure; additive (earned badges
// never get revoked here — callers persist with a unique constraint).
export function evaluateBadges(stats: ContributionStats): BadgeId[] {
    const earned: BadgeId[] = [];
    // @ts-ignore — old badge IDs; remapped in Task 4
    if (stats.reportCount >= 1) earned.push("first-report");
    // @ts-ignore
    if (stats.reportCount >= 5) earned.push("five-reports");
    // @ts-ignore
    if (stats.reportCount >= 25) earned.push("twenty-five-reports");
    // @ts-ignore
    if (stats.compCount >= 1) earned.push("comp-contributor");
    // @ts-ignore
    if (stats.companyCount >= 3) earned.push("multi-company");
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
    if (stats.commentCount >= 25) earned.push("prolific-commenter");
    return earned;
}

type TxClient = Omit<
    PrismaClient,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

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

    let reportCount = 0;
    let compCount = 0;
    const companies = new Set<number>();
    for (const s of approved) {
        const hasAsks = s.communityAsks.length > 0;
        const hasComp = s.communityComp.length > 0;
        if (hasAsks) reportCount += 1;
        if (hasComp) compCount += 1;
        if ((hasAsks || hasComp) && s.companyId !== null) companies.add(s.companyId);
    }

    const earned = evaluateBadges({
        reportCount,
        compCount,
        companyCount: companies.size,
    });
    if (earned.length === 0) return;

    await db.userBadge.createMany({
        data: earned.map((badge) => ({ userId, badge })),
        skipDuplicates: true,
    });
}
