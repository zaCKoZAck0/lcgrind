-- Reconcile remaining `db push`-only drift so prod matches schema.prisma.
--
-- 1. Drop the legacy Company.difficultyTier ranking column. It was replaced by
--    the easyCount/mediumCount/hardCount difficulty-mix counts (3f59c7e) and has
--    no code references. IF EXISTS keeps it safe to re-run.
-- 2. Add the PointsLedger.submissionId FK that the schema declares. Verified 0
--    orphan rows before writing this, so the constraint validates cleanly.
ALTER TABLE "Company" DROP COLUMN IF EXISTS "difficultyTier";

ALTER TABLE "PointsLedger" ADD CONSTRAINT "PointsLedger_submissionId_fkey"
  FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
