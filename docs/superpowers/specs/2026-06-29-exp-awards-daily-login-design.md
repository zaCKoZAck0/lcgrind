# Exp, Awards & Daily Login — Design

Date: 2026-06-29
Branch context: `feat/grinds-exp-form-improvements`

## Summary

Turn the existing contribution-points system into a user-facing **Exp** system, attach
Exp values to a catalog of **22 awards** (badges) spanning contribution, social, problem
grind, and daily login, and add a **daily-login streak** feature surfaced in the user
dropdown and profile. No levels, no leaderboard.

## Existing system (today)

- `User.points` (Int) — contribution currency. Accrues **only** on admin-approved
  interview submissions: report +50, comp-only +25, detail bonus +10. Auditable via
  `PointsLedger` (signed `delta` + `reason` per `submissionId`).
- `User.reputation` (Int) — social score from Discuss votes (labeled "Reputation" in UI).
- `UserBadge` (`@@unique([userId, badge])`) — 8 milestone badges; grant **no exp** today.
  Fires a `BADGE` notification on new social award.
- Problem-solving progress is client-side Redux (`completedProblems` = `{problemId,
  completedAt}`, plus notes / lists / sheet settings). Synced to `User.progressData`
  (Json) **only when** the user enables `syncProgress`.
- Profile (`/u/[handle]`) already **labels `exp` as "Exp"** (Zap icon) and `reputation` as
  "Reputation".

## Goals

1. Rename `points` → `exp` across the data/code layer (UI label already done).
2. Exp = per-submission **drip** (unchanged) **plus** one-time **award bonuses**.
3. A 22-award catalog, each award granting a one-time exp chunk on first earn.
4. A daily-login streak feature (auto-credited), visible in dropdown + profile.

## Non-goals

- No levels / ranks / tiers derived from exp (exp stays a flat number).
- No leaderboard (consistent with the original gamification decision).

## Exp model

- **Rename** `points` → `exp` everywhere in code/data:
  - `User.points` → `User.exp`
  - config `POINTS` → `EXP`, `getMyPoints()` → `getMyExp()`, variable names, etc.
  - **Decision — keep model name `PointsLedger`** (renaming it would force a `db push`
    table recreate and lose audit history). The user-facing word is "Exp"; the internal
    ledger table name is cosmetic. (Override if a clean rename is preferred and history
    loss is acceptable.)
- **Drip (unchanged, just renamed):** approved report +50, comp-only +25, detail +10.
  Written to the ledger with a `submissionId`.
- **Award bonus:** one-time per badge. When a **new** `UserBadge` row is created, write a
  ledger entry in the same transaction (`submissionId = null`, `reason = "badge:<id>"`,
  `delta = award.exp`) and increment `User.exp`. Idempotent via the unique constraint.
- **Daily login:** +5 flat, once per calendar day (`reason = "daily"`, `submissionId =
  null`).

## Schema changes (apply via `prisma db push`, then restart dev)

- `User.points` → `User.exp Int @default(0)`.
- `PointsLedger.submissionId` → **nullable** (`String?`) so award/daily entries carry no
  submission. Existing `[submissionId]` index stays.
- Daily-login fields on `User`:
  - `lastSeenOn String?` — `YYYY-MM-DD` of last credited login day (string date avoids TZ
    drift; computed in the user's effective timezone, default UTC).
  - `loginStreak Int @default(0)`
  - `longestStreak Int @default(0)`
- Config (`src/config/gamification.ts`, Prisma-free): rename `POINTS` → `EXP`, add
  `DAILY = 5`; extend each `BADGES` entry with `exp: number` and a `group`
  (`contribution | social | grind | daily`).

## Award catalog (22)

Exp scale, anchored to report=50 → frame metal in the badge art:
Bronze 50 · Steel 100 · Silver 250 · Gold 600 · Platinum 1500.

### A. Contribution
| id | rule | exp | status |
|---|---|---|---|
| `valuable-contributor` | contribute compensation data | 50 | renamed from `comp-contributor` |
| `well-structured` | share an interview experience using the structured editor | 100 | new |

### B. Social (Discuss)
| id | rule | exp | status |
|---|---|---|---|
| `first-post` | publish first post | 50 | exists |
| `reputation-10` | reach 10 reputation | 50 | exists |
| `reputation-100` | reach 100 reputation | 250 | new |
| `reputation-500` | reach 500 reputation | 1500 | new |
| `prolific-commenter` | post 25 comments | 100 | exists |
| `helpful-answer` | first accepted answer | 100 | new — **only if accepted-answers shipped** |

### C. Grind — problem solving (sync-enabled users only)
| id | rule | exp | status |
|---|---|---|---|
| `solver-10` | 10 problems solved | 50 | new |
| `solver-50` | 50 solved | 100 | new |
| `solver-100` | 100 solved | 250 | new |
| `solver-500` | 500 solved | 1500 | new |
| `hard-hitter-10` | 10 Hard solved | 250 | new |
| `hard-hitter-50` | 50 Hard solved | 600 | new |
| `streak-7` | 7-day solving streak | 100 | new |
| `streak-30` | 30-day solving streak | 600 | new |
| `streak-100` | 100-day solving streak | 1500 | new |
| `committed` | solved on 50 distinct days | 250 | new |
| `interview-ready` | 100% complete a curated sheet/list | 600 | renamed from `sheet-finisher` |

### D. Daily login (all users)
| id | rule | exp | status |
|---|---|---|---|
| `login-streak-7` | 7-day login streak | 100 | new |
| `login-streak-30` | 30-day login streak | 600 | new |
| `login-streak-100` | 100-day login streak | 1500 | new |

**Removed** (were in config): `first-report`, `five-reports`, `twenty-five-reports`,
`multi-company` — count-of-reports framing leaks internal jargon and is dropped.

## Evaluators

Each evaluator stays a pure function over stats + a thin DB sync wrapper. Every new badge
grant also writes the exp ledger entry + increments `User.exp` atomically (extend the
existing `createMany skipDuplicates` path to also emit ledger rows for the newly inserted
badges).

- `syncBadges` (contribution) — drop report-count + multi-company logic; keep
  `valuable-contributor` (comp ≥ 1); add `well-structured` (≥ 1 approved experience that
  used the structured composer — requires a marker on the submission, see Dependencies).
- `syncSocialBadges` — `first-post`, `reputation-10/100/500`, `prolific-commenter`,
  `helpful-answer`.
- `syncGrindBadges` (**new**) — reads `User.progressData` (sync-on only). Derives:
  `totalSolved`, `hardSolved` (join problem→difficulty catalog), `solvingStreak` and
  `distinctDays` (from `completedAt` timestamps), and sheet completion (compare a curated
  sheet/list's full set against completed). Awards `solver-*`, `hard-hitter-*`, `streak-*`,
  `committed`, `interview-ready`. Trigger: on the progress save/upload action.
- **Daily login** (**new**) — on first authenticated app load each day (session callback
  or a lightweight server action): compute day diff from `lastSeenOn`; if yesterday →
  `loginStreak += 1`; if same day → no-op; else hard reset to 1. Update `longestStreak`,
  credit +5 exp once, then evaluate `login-streak-7/30/100`.

## UI

- **User dropdown** (`src/components/auth/user-menu.tsx`): keep the exp chip (relabel
  to Exp). Add a login-streak counter — connected day-dot chain icon + current streak
  number; muted when today is not yet counted.
- **Profile** (`src/app/u/[handle]/page.tsx`): existing Exp + Reputation tiles; add a
  **Daily Streak** tile (current + longest). The badges grid already renders earned
  badges; new awards appear automatically.
- Badge art: neobrutalist image prompts for all 22 awards live in
  `docs/badges/badge-image-prompts.md` (one hexagonal-medal family, tier-metal frames).
  Rendering generated images in the badge grid is a follow-up; current grid uses the
  Lucide `Award` icon + label and keeps working.

## Migration concerns

- Removing `first-report`, `five-reports`, `twenty-five-reports`, `multi-company` and
  renaming `comp-contributor` orphans any already-earned `UserBadge` rows. Handle by:
  - UI: skip unknown badge ids (lookup miss in `BADGE_BY_ID` → don't render).
  - Optional data step: update `comp-contributor` rows → `valuable-contributor`.
- Backfill exp for already-earned kept badges is **out of scope** (awards only grant exp
  on first earn going forward); call out if retroactive crediting is wanted.

## Dependencies / open items

1. `well-structured` needs a persisted marker that an experience was authored via the
   structured composer (in-flight on this branch). Until then the award can't fire.
2. `helpful-answer` depends on the accepted-answer feature existing; drop if not shipped.
3. Grind awards need a server-side problem→difficulty map (build-cache) and sheet/list
   definitions to compute `hard-hitter-*` and `interview-ready`.
4. Daily-login timezone: default UTC day boundary unless a user TZ is available.
