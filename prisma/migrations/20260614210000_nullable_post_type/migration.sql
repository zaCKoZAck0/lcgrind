-- Remove the DISCUSSION/QUESTION type distinction. EXPERIENCE stays as the only
-- named type; plain text posts get NULL. Existing rows updated accordingly.
ALTER TABLE "Post" ALTER COLUMN "type" DROP NOT NULL;
UPDATE "Post" SET "type" = NULL WHERE "type" IN ('DISCUSSION', 'QUESTION');
