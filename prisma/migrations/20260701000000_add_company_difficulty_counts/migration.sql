-- Difficulty-mix counts for the company DSA difficulty bar (Company.easyCount /
-- mediumCount / hardCount). These columns were originally added to the schema via
-- `db push`, so they never landed in a migration and never reached prod through
-- `migrate deploy`. Captured here so migrations match the schema.
--
-- IF NOT EXISTS keeps this idempotent: prod already has the columns (added by hand
-- while fixing the /companies crash), fresh envs get them created here.
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "easyCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "mediumCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "hardCount" INTEGER NOT NULL DEFAULT 0;
