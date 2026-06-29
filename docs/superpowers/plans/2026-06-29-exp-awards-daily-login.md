# Exp, Awards & Daily Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing `points` system into a user-facing `exp` system, add a 22-award badge catalog with one-time exp grants, and ship a daily-login streak feature visible in the user dropdown and profile.

**Architecture:** Schema-first rename of `User.points` → `User.exp` and `PointsLedger.submissionId` → nullable, then a config expansion to 22 badges (each with `exp` + `group`), a shared `grantNewBadgesWithExp` helper that atomically writes `UserBadge` + ledger entries + `User.exp` increment, and a daily-login function that is idempotent (same-day no-op via `lastSeenOn`). All badge evaluators stay pure functions; DB sync wrappers call `grantNewBadgesWithExp`.

**Tech Stack:** Next.js 15, Prisma (PostgreSQL), BetterAuth, Lucide React, `prisma db push` for schema changes (no migration history).

---

## File Map

| File | Change |
|---|---|
| `prisma/schema.prisma` | rename `points`→`exp`, make `submissionId` nullable, add `lastSeenOn`/`loginStreak`/`longestStreak` to User |
| `src/config/gamification.ts` | rename `POINTS`→`EXP`, add `DAILY=5`, expand BadgeId to 22, add `exp`+`group` to each BADGE entry |
| `src/server/actions/gamification/core.ts` | rename `POINTS`→`EXP`, update `points`→`exp` DB writes, rewrite evaluators, add `grantNewBadgesWithExp`, `evaluateGrindBadges`, `evaluateLoginBadges`, `syncGrindBadges`, `creditDailyLogin` |
| `src/server/actions/gamification/core.test.ts` | update evaluateBadges tests, add new evaluator tests |
| `src/server/actions/gamification/actions.ts` | rename `getMyPoints`→`getMyExp`, add `getMyGameStats` (calls `creditDailyLogin` internally) |
| `src/server/actions/admin/core.ts` | no change — `reconcileLedger` (in core.ts) handles the `points`→`exp` rename |
| `src/server/actions/grinds/profile.ts` | rename `points`→`exp`, add `loginStreak`/`longestStreak` to return type + select |
| `src/server/actions/progress/sync.ts` | call `syncGrindBadges` after successful `saveProgress` |
| `src/components/auth/user-menu.tsx` | rename `points` state → `exp`, swap `getMyPoints`→`getMyGameStats`, add `loginStreak` state + flame icon in trigger |
| `src/app/u/[handle]/page.tsx` | update `profile.points`→`profile.exp`, add Daily Streak stat tile, import `Flame` |

---

## Task 1: Prisma Schema Changes

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add exp, daily-login fields; rename points; make submissionId nullable**

In `prisma/schema.prisma`, find the `User` model and replace:
```prisma
  points        Int          @default(0)
```
with:
```prisma
  exp           Int          @default(0)
  lastSeenOn    String?
  loginStreak   Int          @default(0)
  longestStreak Int          @default(0)
```

Then find `model PointsLedger` and replace:
```prisma
  submissionId String
```
with:
```prisma
  submissionId String?
```

- [ ] **Step 2: Apply schema to local DB**

```bash
npx prisma db push
```

Expected: `Your database is now in sync with your Prisma schema.`

- [ ] **Step 3: Verify Prisma client regenerated**

```bash
npx prisma generate
```

Expected: `Generated Prisma Client` (or already up to date).

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(schema): rename points→exp, nullable submissionId, daily-login fields"
```

---

## Task 2: Gamification Config Expansion

**Files:**
- Modify: `src/config/gamification.ts`

- [ ] **Step 1: Write the failing test for new config shape**

In `src/server/actions/gamification/core.test.ts`, add at the top (before existing tests):

```typescript
import { BADGES, BADGE_BY_ID, EXP, type BadgeId } from "~/config/gamification";

describe("gamification config", () => {
    it("has exactly 22 badges (21 + helpful-answer conditional)", () => {
        // helpful-answer is conditionally included; 21 are always present
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
```

- [ ] **Step 2: Run to confirm it fails**

```bash
npx vitest run src/server/actions/gamification/core.test.ts 2>&1 | tail -20
```

Expected: FAIL — `EXP` not exported from gamification config.

- [ ] **Step 3: Rewrite `src/config/gamification.ts`**

```typescript
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
    | "reputation-10"
    | "reputation-100"
    | "reputation-500"
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
    { id: "reputation-10", label: "Reputation 10", description: "Reached 10 reputation from community votes", exp: 50, group: "social" },
    { id: "reputation-100", label: "Reputation 100", description: "Reached 100 reputation from community votes", exp: 250, group: "social" },
    { id: "reputation-500", label: "Reputation 500", description: "Reached 500 reputation from community votes", exp: 1500, group: "social" },
    { id: "prolific-commenter", label: "Prolific Commenter", description: "Posted 25 comments", exp: 100, group: "social" },
    // helpful-answer: depends on accepted-answers feature. Include in catalog but evaluator never fires yet.
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
```

- [ ] **Step 4: Run config tests**

```bash
npx vitest run src/server/actions/gamification/core.test.ts --reporter=verbose 2>&1 | grep -E 'PASS|FAIL|✓|✗|gamification config'
```

Expected: gamification config tests pass.

- [ ] **Step 5: Check for TypeScript errors introduced by the config change**

```bash
npx tsc --noEmit 2>&1 | head -40
```

Expected: errors on files still importing `POINTS` or using old `BadgeId` values. Note every file with errors — they get fixed in Task 3.

- [ ] **Step 6: Commit**

```bash
git add src/config/gamification.ts src/server/actions/gamification/core.test.ts
git commit -m "feat(config): expand badge catalog to 22 awards, rename POINTS→EXP, add exp+group to badges"
```

---

## Task 3: Rename `points` → `exp` / `POINTS` → `EXP` in Data Layer

**Files:**
- Modify: `src/server/actions/gamification/core.ts`
- Modify: `src/server/actions/gamification/actions.ts`
- Modify: `src/server/actions/grinds/profile.ts`

**Context:** `core.ts` references `POINTS` from config and writes `points: { increment }` to the User model. `actions.ts` exports `getMyPoints` and selects `points`. `profile.ts` has `points` in its return type and DB select.

- [ ] **Step 1: Update `core.ts` — rename `POINTS` import and all `points` DB writes**

In `src/server/actions/gamification/core.ts`:

Change the import line from:
```typescript
import { POINTS, type BadgeId } from "~/config/gamification";
```
to:
```typescript
import { EXP, BADGE_BY_ID, type BadgeId } from "~/config/gamification";
```

In `awardForExperience`, replace all `POINTS.` with `EXP.`:
```typescript
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
```

In `reconcileLedger`, replace:
```typescript
        await tx.user.update({
            where: { id: args.userId },
            data: { points: { increment: net } },
        });
```
with:
```typescript
        await tx.user.update({
            where: { id: args.userId },
            data: { exp: { increment: net } },
        });
```

In `reverseLedger`, replace:
```typescript
    await tx.user.update({
        where: { id: args.userId },
        data: { points: { decrement: owed } },
    });
```
with:
```typescript
    await tx.user.update({
        where: { id: args.userId },
        data: { exp: { decrement: owed } },
    });
```

- [ ] **Step 2: Update `actions.ts` — rename to `getMyExp`**

Replace the entire content of `src/server/actions/gamification/actions.ts`:

```typescript
"use server";

import { headers } from "next/headers";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";

export async function getMyExp(): Promise<number> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return 0;
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { exp: true },
    });
    return user?.exp ?? 0;
}
```

> `getMyGameStats` (which wraps `creditDailyLogin`) is added in Task 7 after `creditDailyLogin` is defined in `core.ts`.

- [ ] **Step 3: Update `grinds/profile.ts` — rename `points`→`exp`, add streak fields**

In `src/server/actions/grinds/profile.ts`:

Find the return type definition (line ~17) and change:
```typescript
    points: number;
```
to:
```typescript
    exp: number;
    loginStreak: number;
    longestStreak: number;
```

Find the Prisma select (line ~36) and change:
```typescript
            points: true,
```
to:
```typescript
            exp: true,
            loginStreak: true,
            longestStreak: true,
```

Find the return mapping (line ~55) and change:
```typescript
        points: row.points,
```
to:
```typescript
        exp: row.exp,
        loginStreak: row.loginStreak,
        longestStreak: row.longestStreak,
```

- [ ] **Step 4: Patch `user-menu.tsx` import to avoid broken build**

In `src/components/auth/user-menu.tsx`, find:
```typescript
import { getMyPoints } from "~/server/actions/gamification/actions";
```
Replace with:
```typescript
import { getMyExp } from "~/server/actions/gamification/actions";
```

In the same file, find the `useEffect` call:
```typescript
            getMyPoints().then(setPoints).catch(() => setPoints(null));
```
Replace with:
```typescript
            getMyExp().then(setPoints).catch(() => setPoints(null));
```

> Task 8 will upgrade this to `getMyGameStats` and rename the state variable.

- [ ] **Step 5: TypeScript check — confirm errors are cleared**

```bash
npx tsc --noEmit 2>&1 | grep -v 'node_modules' | head -30
```

Expected: zero errors.

- [ ] **Step 6: Commit**

```bash
git add src/server/actions/gamification/core.ts src/server/actions/gamification/actions.ts src/server/actions/grinds/profile.ts src/components/auth/user-menu.tsx
git commit -m "feat(exp): rename points→exp across data layer, getMyExp, patch user-menu import"
```

---

## Task 4: Badge Evaluators + `grantNewBadgesWithExp` Helper

**Files:**
- Modify: `src/server/actions/gamification/core.ts`
- Modify: `src/server/actions/gamification/core.test.ts`

**Context:** Replace `evaluateBadges` (removed report-count logic), update `evaluateSocialBadges` (new karma tiers), add `evaluateGrindBadges`, `evaluateLoginBadges`, and a `grantNewBadgesWithExp` helper that atomically writes `UserBadge`, ledger entries, and `User.exp` increment.

- [ ] **Step 1: Write failing tests for the updated and new evaluators**

Add to `src/server/actions/gamification/core.test.ts`:

```typescript
import {
    evaluateBadges,
    evaluateSocialBadges,
    evaluateGrindBadges,
    evaluateLoginBadges,
    type GrindStats,
} from "~/server/actions/gamification/core";

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
        expect(evaluateSocialBadges({ postCount: 0, commentCount: 0, reputation: 10 })).toContain("reputation-10");
        expect(evaluateSocialBadges({ postCount: 0, commentCount: 0, reputation: 100 })).toContain("reputation-100");
        expect(evaluateSocialBadges({ postCount: 0, commentCount: 0, reputation: 500 })).toContain("reputation-500");
    });

    it("reputation-500 also earns reputation-10 and reputation-100", () => {
        const result = evaluateSocialBadges({ postCount: 0, commentCount: 0, reputation: 500 });
        expect(result).toContain("reputation-10");
        expect(result).toContain("reputation-100");
        expect(result).toContain("reputation-500");
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
});

describe("evaluateLoginBadges", () => {
    it("awards login-streak-7 at streak 7", () => {
        expect(evaluateLoginBadges(7)).toContain("login-streak-7");
    });

    it("awards login-streak-30 at streak 30", () => {
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
```

- [ ] **Step 2: Run to confirm new tests fail**

```bash
npx vitest run src/server/actions/gamification/core.test.ts 2>&1 | grep -E 'FAIL|error|not found' | head -10
```

Expected: FAIL — `evaluateGrindBadges`, `evaluateLoginBadges`, `GrindStats` not exported.

- [ ] **Step 3: Replace evaluators and add `grantNewBadgesWithExp` in `core.ts`**

Replace `ContributionStats` type and `evaluateBadges` function:

```typescript
export type ContributionStats = {
    compCount: number;
    hasStructured: boolean;
};

export function evaluateBadges(stats: ContributionStats): BadgeId[] {
    const earned: BadgeId[] = [];
    if (stats.compCount >= 1) earned.push("valuable-contributor");
    if (stats.hasStructured) earned.push("well-structured");
    return earned;
}
```

Replace `SocialStats` type and `evaluateSocialBadges` function:

```typescript
export type SocialStats = {
    postCount: number;
    commentCount: number;
    reputation: number;
};

export function evaluateSocialBadges(stats: SocialStats): BadgeId[] {
    const earned: BadgeId[] = [];
    if (stats.postCount >= 1) earned.push("first-post");
    if (stats.reputation >= 10) earned.push("reputation-10");
    if (stats.reputation >= 100) earned.push("reputation-100");
    if (stats.reputation >= 500) earned.push("reputation-500");
    if (stats.commentCount >= 25) earned.push("prolific-commenter");
    // helpful-answer: not evaluated until accepted-answers feature ships
    return earned;
}
```

Add new types and evaluators after `evaluateSocialBadges`:

```typescript
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
    // interview-ready: completedSheetIds is populated by syncGrindBadges when any sheet is 100%
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
```

Add `grantNewBadgesWithExp` helper after the evaluators and before `reconcileLedger`:

```typescript
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
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/server/actions/gamification/core.test.ts --reporter=verbose 2>&1 | tail -30
```

Expected: all evaluator tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/server/actions/gamification/core.ts src/server/actions/gamification/core.test.ts
git commit -m "feat(badges): add 22-badge evaluators and grantNewBadgesWithExp helper"
```

---

## Task 5: Update `syncBadges` and `syncSocialBadges`

**Files:**
- Modify: `src/server/actions/gamification/core.ts`

**Context:** Both functions currently do their own `createMany` + notification logic. Refactor to call `grantNewBadgesWithExp`. Also update `syncBadges` to use the new contribution stats shape (drop report count, add structured check).

- [ ] **Step 1: Rewrite `syncBadges` in `core.ts`**

Replace the entire `syncBadges` function:

```typescript
export async function syncBadges(db: PrismaClient, userId: string): Promise<void> {
    const approved = await db.submission.findMany({
        where: { userId, status: "APPROVED" },
        select: {
            structured: true,
            communityComp: { select: { id: true }, take: 1 },
        },
    });

    let compCount = 0;
    let hasStructured = false;
    for (const s of approved) {
        if (s.communityComp.length > 0) compCount += 1;
        if (s.structured !== null) hasStructured = true;
    }

    const earned = evaluateBadges({ compCount, hasStructured });
    await grantNewBadgesWithExp(db, userId, earned);
}
```

> **Note:** `Submission.structured` is a JSON column already used in raw SQL queries on this branch. If Prisma doesn't expose `structured` in the generated type, use `db.$queryRaw` or check the schema — the field may need adding to `schema.prisma` on this branch if not yet present as a named Prisma field.

- [ ] **Step 2: Rewrite `syncSocialBadges` in `core.ts`**

Replace the entire `syncSocialBadges` function:

```typescript
export async function syncSocialBadges(db: PrismaClient, userId: string): Promise<void> {
    const [postCount, commentCount, user] = await Promise.all([
        db.post.count({ where: { authorId: userId, status: "PUBLISHED", isAnonymous: false } }),
        db.comment.count({ where: { authorId: userId, isAnonymous: false } }),
        db.user.findUnique({ where: { id: userId }, select: { reputation: true } }),
    ]);
    if (!user) return;

    const earned = evaluateSocialBadges({ postCount, commentCount, reputation: user.reputation });
    await grantNewBadgesWithExp(db, userId, earned);
}
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep 'gamification/core' | head -20
```

Expected: no errors in core.ts.

- [ ] **Step 4: Run existing tests**

```bash
npx vitest run src/server/actions/gamification/ --reporter=verbose 2>&1 | tail -20
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/server/actions/gamification/core.ts
git commit -m "refactor(badges): syncBadges + syncSocialBadges use grantNewBadgesWithExp, drop report-count logic"
```

---

## Task 6: Grind Badges + Wire to `saveProgress`

**Files:**
- Modify: `src/server/actions/gamification/core.ts`
- Modify: `src/server/actions/progress/sync.ts`

**Context:** `progressData` is a JSON blob stored on `User`. The Redux shape uses `completedProblems` as a record keyed by `frontendQuestionId` (string) with `{ completedAt: string }` values. `syncGrindBadges` reads this, fetches Problem difficulties from the DB, and evaluates grind badges.

- [ ] **Step 1: Define progress data type and add `syncGrindBadges` to `core.ts`**

Add after `evaluateLoginBadges`:

```typescript
type CompletedProblemEntry = { completedAt: string };
type ProgressData = {
    completedProblems?: Record<string, CompletedProblemEntry>;
    [key: string]: unknown;
};

export async function syncGrindBadges(db: PrismaClient, userId: string): Promise<void> {
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { progressData: true, syncProgress: true },
    });
    if (!user?.syncProgress || !user.progressData) return;

    const raw = user.progressData as ProgressData;
    const completedEntries = Object.entries(raw.completedProblems ?? {});
    if (completedEntries.length === 0) return;

    const completedIds = completedEntries.map(([id]) => id);

    // Fetch difficulty for completed problems
    const problems = await db.problem.findMany({
        where: { frontendQuestionId: { in: completedIds } },
        select: { frontendQuestionId: true, difficulty: true },
    });
    const diffMap = new Map(problems.map((p) => [p.frontendQuestionId, p.difficulty]));

    const totalSolved = completedEntries.length;
    const hardSolved = completedEntries.filter(([id]) => diffMap.get(id) === "Hard").length;

    // Compute solving streak: count consecutive days ending today (UTC)
    const solvedDays = new Set(
        completedEntries.map(([, e]) => e.completedAt.slice(0, 10)),
    );
    const distinctDays = solvedDays.size;

    let solvingStreak = 0;
    const today = new Date();
    for (let i = 0; ; i++) {
        const d = new Date(today);
        d.setUTCDate(d.getUTCDate() - i);
        const dayStr = d.toISOString().slice(0, 10);
        if (!solvedDays.has(dayStr)) break;
        solvingStreak++;
    }

    // Sheet completion: check all sheets for 100% coverage against completed set
    const sheets = await db.sheet.findMany({
        select: {
            id: true,
            problems: { select: { problem: { select: { frontendQuestionId: true } } } },
        },
    });
    const completedSet = new Set(completedIds);
    const completedSheetIds = sheets
        .filter((s) => s.problems.length > 0 && s.problems.every((sp) => completedSet.has(sp.problem.frontendQuestionId)))
        .map((s) => s.id);

    const earned = evaluateGrindBadges({ totalSolved, hardSolved, solvingStreak, distinctDays, completedSheetIds });
    await grantNewBadgesWithExp(db, userId, earned);
}
```

- [ ] **Step 2: Wire `syncGrindBadges` into `saveProgress`**

In `src/server/actions/progress/sync.ts`, add import at top:

```typescript
import { syncGrindBadges } from "~/server/actions/gamification/core";
```

After the successful `db.user.update` in `saveProgress`, add:

```typescript
    await db.user.update({
        where: { id: session.user.id },
        data: { progressData: data as object },
    });

    // Evaluate grind badges in background (don't block the response)
    syncGrindBadges(db, session.user.id).catch(() => undefined);

    return { ok: true };
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep -E 'sync|grind|progress' | head -20
```

Expected: no errors in sync.ts or core.ts.

- [ ] **Step 4: Commit**

```bash
git add src/server/actions/gamification/core.ts src/server/actions/progress/sync.ts
git commit -m "feat(badges): syncGrindBadges reads progressData, fires on saveProgress"
```

---

## Task 7: Daily Login — `creditDailyLogin`

**Files:**
- Modify: `src/server/actions/gamification/core.ts`

**Context:** `creditDailyLogin` is the idempotent function called by `getMyGameStats` on every authenticated session load. It uses an atomic `updateMany` with a `NOT lastSeenOn = today` guard to prevent double-crediting under concurrent requests.

- [ ] **Step 1: Add `creditDailyLogin` to `core.ts`**

Add after `syncGrindBadges`:

```typescript
export async function creditDailyLogin(db: PrismaClient, userId: string): Promise<void> {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

    const user = await db.user.findUnique({
        where: { id: userId },
        select: { lastSeenOn: true, loginStreak: true, longestStreak: true },
    });
    if (!user || user.lastSeenOn === today) return;

    const newStreak = user.lastSeenOn === yesterday ? user.loginStreak + 1 : 1;
    const newLongest = Math.max(user.longestStreak, newStreak);

    await db.$transaction(async (tx) => {
        // Atomic guard: only writes if another concurrent request hasn't already credited today
        const updated = await tx.user.updateMany({
            where: { id: userId, NOT: { lastSeenOn: today } },
            data: {
                lastSeenOn: today,
                loginStreak: newStreak,
                longestStreak: newLongest,
                exp: { increment: EXP.DAILY },
            },
        });
        if (updated.count === 0) return;
        await tx.pointsLedger.create({
            data: { userId, submissionId: null, delta: EXP.DAILY, reason: "daily" },
        });
    });

    const loginBadges = evaluateLoginBadges(newStreak);
    await grantNewBadgesWithExp(db, userId, loginBadges);
}
```

- [ ] **Step 2: Add `getMyGameStats` to `actions.ts`**

Append to `src/server/actions/gamification/actions.ts`:

```typescript
import { creditDailyLogin } from "./core";

export type GameStats = {
    exp: number;
    loginStreak: number;
    longestStreak: number;
};

// Credits daily login (idempotent) then returns current game stats.
// Called from the user menu on every authenticated session load.
export async function getMyGameStats(): Promise<GameStats> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { exp: 0, loginStreak: 0, longestStreak: 0 };

    await creditDailyLogin(db, session.user.id);

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { exp: true, loginStreak: true, longestStreak: true },
    });
    return {
        exp: user?.exp ?? 0,
        loginStreak: user?.loginStreak ?? 0,
        longestStreak: user?.longestStreak ?? 0,
    };
}
```

> The imports for `headers`, `auth`, `db` are already at the top of the file from Step 2 of Task 3. Add `creditDailyLogin` import at the top alongside the existing imports.

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep 'gamification' | head -20
```

Expected: no errors in gamification files.

- [ ] **Step 4: Commit**

```bash
git add src/server/actions/gamification/core.ts src/server/actions/gamification/actions.ts
git commit -m "feat(daily): creditDailyLogin with atomic guard, streak tracking, login-streak badges, getMyGameStats"
```

---

## Task 8: UI — User Menu Streak + Profile Daily Streak Tile

**Files:**
- Modify: `src/components/auth/user-menu.tsx`
- Modify: `src/app/u/[handle]/page.tsx`

- [ ] **Step 1: Update `user-menu.tsx`**

Change imports — replace `getMyPoints` import with `getMyGameStats`:
```typescript
import { getMyGameStats } from "~/server/actions/gamification/actions";
```
Add `Flame` to the lucide-react import:
```typescript
import { LogOut, User, ScrollText, ShieldCheck, Zap, Flame, UserPen, Bell, LogIn } from "lucide-react";
```

Replace the `points` state with `exp` and add `loginStreak`:
```typescript
    const [exp, setExp] = useState<number | null>(null);
    const [loginStreak, setLoginStreak] = useState<number>(0);
```

In the `useEffect`, replace:
```typescript
            getMyPoints().then(setPoints).catch(() => setPoints(null));
```
with:
```typescript
            getMyGameStats()
                .then(({ exp, loginStreak }) => { setExp(exp); setLoginStreak(loginStreak); })
                .catch(() => { setExp(null); setLoginStreak(0); });
```

In the `else` branch (session cleared), replace:
```typescript
            setPoints(null);
```
with:
```typescript
            setExp(null);
            setLoginStreak(0);
```

In the trigger JSX, replace:
```tsx
                    {points !== null && (
                        <div className="flex items-center gap-1.5 font-semibold tabular-nums pl-1">
                            <Zap className="size-4" />
                            <span>{points}</span>
                        </div>
                    )}
```
with:
```tsx
                    {exp !== null && (
                        <div className="flex items-center gap-2 pl-1">
                            <div className="flex items-center gap-1.5 font-semibold tabular-nums">
                                <Zap className="size-4" />
                                <span>{exp}</span>
                            </div>
                            {loginStreak > 0 && (
                                <div className="flex items-center gap-1 font-semibold tabular-nums text-sm">
                                    <Flame className="size-3.5" />
                                    <span>{loginStreak}</span>
                                </div>
                            )}
                        </div>
                    )}
```

- [ ] **Step 2: Update `src/app/u/[handle]/page.tsx`**

Add `Flame` to the lucide-react import:
```typescript
import { ChevronRight, ThumbsUp, Zap, Award, Pencil, Flame } from "lucide-react";
```

Replace `profile.points` with `profile.exp` in the stat tile JSX:
```tsx
                            <span className="font-bold text-3xl tabular-nums leading-none">{profile.exp}</span>
```

Add a third stat tile for Daily Streak immediately after the Exp tile (inside the same flex container). Replace:
```tsx
                        <div className="flex-1 flex flex-col items-center py-4 px-4">
                            <span className="font-bold text-3xl tabular-nums leading-none">{profile.points}</span>
                            <span className="text-muted-foreground text-sm flex items-center gap-1.5 mt-2">
                                <Zap className="size-4" />
                                Exp
                            </span>
                        </div>
```
with:
```tsx
                        <div className="flex-1 flex flex-col items-center py-4 px-4 border-r-2 border-border">
                            <span className="font-bold text-3xl tabular-nums leading-none">{profile.exp}</span>
                            <span className="text-muted-foreground text-sm flex items-center gap-1.5 mt-2">
                                <Zap className="size-4" />
                                Exp
                            </span>
                        </div>
                        <div className="flex-1 flex flex-col items-center py-4 px-4">
                            <span className="font-bold text-3xl tabular-nums leading-none">{profile.loginStreak}</span>
                            <span className="text-muted-foreground text-sm flex items-center gap-1.5 mt-2">
                                <Flame className="size-4" />
                                Streak
                            </span>
                            <span className="text-xs text-muted-foreground mt-1">Best: {profile.longestStreak}</span>
                        </div>
```

- [ ] **Step 3: Full TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep -v node_modules | head -30
```

Expected: zero errors.

- [ ] **Step 4: Run all gamification tests**

```bash
npx vitest run src/server/actions/gamification/ --reporter=verbose 2>&1 | tail -20
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/auth/user-menu.tsx src/app/u/\[handle\]/page.tsx
git commit -m "feat(ui): add login streak to user menu trigger, daily streak tile on profile"
```

---

## Post-implementation Checklist

- [ ] Start dev: `npm run dev` and log in — verify exp chip and flame streak both appear in the user menu trigger.
- [ ] Visit `/u/[handle]` — confirm three stat tiles: Reputation, Exp, Streak (with "Best: N").
- [ ] Check that the existing badge grid on the profile still renders old-style badges (lookup miss on removed badge IDs returns undefined — profile page badge map should skip unknowns via `BADGE_BY_ID[b]`).
- [ ] Approve a submission in admin → verify `User.exp` increments (not `User.points`).
- [ ] Reload the app the next day (or temporarily set `lastSeenOn` to yesterday in DB) → verify `loginStreak` increments and `PointsLedger` gets a `reason: "daily"` entry.

---

## Known Gaps / Dependencies

1. **`well-structured` evaluator** — reads `Submission.structured`. Verify the Prisma schema exposes `structured` as a typed field; if it's missing, add `structured Json?` to the `Submission` model and run `prisma db push`.

2. **`helpful-answer`** — badge is in the catalog but `evaluateSocialBadges` never emits it. Add the evaluator when accepted-answers ships.

3. **Grind badge — `interview-ready`** — fires when any sheet is 100% complete. This requires the `Sheet` and `SheetProblem` models to have the sheet problems loaded (they do). If `frontendQuestionId` isn't the key in `progressData.completedProblems`, adjust the key lookup in `syncGrindBadges`.

4. **Old `UserBadge` rows for removed badge IDs** — UI skips unknown IDs automatically if the profile page maps badges through `BADGE_BY_ID`. Optionally run: `UPDATE "UserBadge" SET badge = 'valuable-contributor' WHERE badge = 'comp-contributor';`

5. **Backfill exp for existing badges** — out of scope per spec. Awards only credit on first earn going forward.
