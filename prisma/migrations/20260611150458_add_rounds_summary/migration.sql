-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "avgRoundCount" DOUBLE PRECISION,
ADD COLUMN     "roundMix" JSONB,
ADD COLUMN     "roundsSummary" TEXT;
