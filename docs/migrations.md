# Database migrations

Prod is migration-managed (`_prisma_migrations` is populated). The drift that
forced manual `ALTER TABLE` on prod came from two habits, both fixed here:

1. Schema changes were made with `prisma db push`, which never writes a
   migration file — so `migrate deploy` had nothing to carry to prod.
2. Nothing ran `migrate deploy` on deploy, so even committed migrations sat
   unapplied.

## Why not `prisma migrate dev`?

`migrate dev` replays every migration into a fresh shadow DB. This repo's early
history is **not cleanly replayable**: `20260614061748_add_comment` creates
`Comment` with an FK to `Post`, but `Post` is created in the later
`20260614100214_add_discuss_post`, so the shadow replay fails with P3006. These
are already recorded on prod with checksums, so reordering/squashing them is not
safe either. So we **do not use `migrate dev`**. `migrate deploy` (below) is
fine — it applies only *new* pending migrations against the existing DB and
never replays from scratch.

## The workflow

### Changing the schema

1. Edit `prisma/schema.prisma`.
2. Generate the delta SQL by diffing the **live DB** against the schema (no
   shadow replay involved). Point `DIRECT_URL` at the session pooler first
   (see below):

   ```bash
   npm run db:diff > /tmp/delta.sql
   ```

3. Create a migration folder and drop the SQL in:

   ```bash
   mkdir prisma/migrations/$(date +%Y%m%d%H%M%S)_short_description
   mv /tmp/delta.sql prisma/migrations/<that folder>/migration.sql
   ```

   Review it. Prefer idempotent DDL (`ADD COLUMN IF NOT EXISTS`,
   `DROP ... IF EXISTS`) so re-runs and hand-patched envs stay safe.
4. Apply it:

   ```bash
   npm run db:deploy
   ```

Commit the migration folder. **Do not use `db push` to ship schema changes** —
it mutates the DB without leaving a migration file, which is exactly the drift
that caused the manual `ALTER TABLE`s on prod. (`db push` against a scratch DB
for throwaway local experiments is fine; just never let it be the thing that
changes a shared/prod DB.)

### Shipping to prod

`build` runs `prisma migrate deploy` first, so **every Vercel deploy applies
pending migrations automatically**. Nothing else to do — merge, deploy, done.

To apply manually against any environment:

```bash
npm run db:deploy    # applies pending migrations
npm run db:status    # shows applied vs pending
```

## Connection URLs — important

Prisma migration commands **cannot run over the transaction pooler** (port
6543, `pgbouncer=true`) — they hang. They use `DIRECT_URL` from the schema's
datasource block, which must be a 5432 connection:

- `DATABASE_URL` — transaction pooler (6543), used by the app at runtime.
- `DIRECT_URL` — a 5432 connection, used by migrations. Must be set in Vercel
  for the build-time `migrate deploy`, and locally for `db:diff`/`db:deploy`.

Which 5432 host? The **direct** host `db.<ref>.supabase.co:5432` is IPv6-only
and unreachable from IPv4 networks (local machines, Vercel build) — it fails
with P1001. Use the **session pooler** instead, which is IPv4 and supports
migrations:

```
postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
```

(Same host as the runtime pooler, port **5432** not 6543, no `pgbouncer` param.)
If `DIRECT_URL` is missing, IPv6-only, or points at 6543, `migrate deploy` will
hang or fail the build.

## One-time reconciliation (already applied to prod)

These three captured all the `db push`-only drift; prod now matches
`schema.prisma` (`migrate diff` is empty):

- `20260630120000_fix_vote_report` — committed but never deployed.
- `20260701000000_add_company_difficulty_counts` — the
  `easyCount`/`mediumCount`/`hardCount` columns (`IF NOT EXISTS`; no-op on prod,
  which was hand-patched during the /companies crash fix).
- `20260701001000_reconcile_schema_drift` — drops the dead `Company.difficultyTier`
  column and adds the `PointsLedger.submissionId` FK (verified 0 orphans).

After deploy, run the difficulty backfill (`recomputeCompanyTiers`) to populate
the counts.
