-- AlterTable
ALTER TABLE "Submission" ADD COLUMN "parseError" TEXT,
ADD COLUMN "parsedAt" TIMESTAMP(3);
