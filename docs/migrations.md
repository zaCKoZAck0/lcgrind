# Database migrations

Prod is migration-managed (`_prisma_migrations` is populated). The drift that
forced manual `ALTER TABLE` on prod came from two habits, both fixed here:

1. Schema changes were made with `prisma db push`, which never writes a
   migration file — so `migrate deploy` had nothing to carry to prod.
2. Nothing ran `migrate deploy` on deploy, so even committed migrations sat
   unapplied.

## The workflow

### Changing the schema (local)

Edit `prisma/schema.prisma`, then:

```bash
npm run db:migrate -- --name short_description
```

This creates `prisma/migrations/<timestamp>_short_description/` **and** applies
it to your local DB. Commit the generated folder. **Do not use `db push`** for
schema changes anymore — it reintroduces drift.

Want to eyeball the SQL before it touches your DB? Use
`npm run db:migrate:create -- --name x` (writes the file without applying),
review it, then `npm run db:deploy`.

### Shipping to prod

`build` runs `prisma migrate deploy` first, so **every Vercel deploy applies
pending migrations automatically**. Nothing else to do — merge, deploy, done.

To apply manually against any environment:

```bash
npm run db:deploy    # applies pending migrations
npm run db:status    # shows applied vs pending
```

## Connection URLs — important

Prisma migration commands **cannot run over the Supabase pooler** (port 6543,
`pgbouncer=true`) — they hang. They use `DIRECT_URL` from the schema's
datasource block, which must point at the **direct** connection (port 5432):

- `DATABASE_URL` — pooled (6543), used by the app at runtime.
- `DIRECT_URL` — direct (5432), used by migrations. Must be set in Vercel for
  the build-time `migrate deploy` to work, and locally for `db:migrate`.

If `DIRECT_URL` is missing or points at the pooler, `migrate deploy` will hang
the build.

## One-time reconciliation (state as of this change)

- `20260630120000_fix_vote_report` — committed but never deployed to prod.
- `20260701000000_add_company_difficulty_counts` — new; captures the
  `easyCount`/`mediumCount`/`hardCount` columns that were previously only
  `db push`-ed. Written with `IF NOT EXISTS` so it is a no-op on prod (already
  hand-patched) and creates the columns on fresh envs.

Both apply cleanly on the next `migrate deploy` (both idempotent). After that,
run the difficulty backfill (`recomputeCompanyTiers`) to populate the counts.
