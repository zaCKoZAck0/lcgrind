-- Forward-fix for 20260630000000_add_user_fields: reconcile Vote and Report with schema.
-- Idempotent: prod was patched manually for Vote.updatedAt, fresh envs need it created here.

-- Vote.updatedAt is app-managed (@updatedAt). Add nullable, backfill, then enforce NOT NULL.
ALTER TABLE "Vote" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);
UPDATE "Vote" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
ALTER TABLE "Vote" ALTER COLUMN "updatedAt" SET NOT NULL;

-- Report: schema has no resolvedAt and status defaults to 'OPEN'.
ALTER TABLE "Report" DROP COLUMN IF EXISTS "resolvedAt";
ALTER TABLE "Report" ALTER COLUMN "status" SET DEFAULT 'OPEN';
