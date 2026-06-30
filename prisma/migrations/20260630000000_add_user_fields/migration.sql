-- AlterTable: migrate user columns
ALTER TABLE "user" DROP COLUMN "karma";
ALTER TABLE "user" RENAME COLUMN "points" TO "exp";
ALTER TABLE "user" ADD COLUMN "lastSeenOn" TEXT;
ALTER TABLE "user" ADD COLUMN "loginStreak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "user" ADD COLUMN "longestStreak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "user" ADD COLUMN "reputation" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "user" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'USER';
ALTER TABLE "user" ADD COLUMN "syncProgress" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user" ADD COLUMN "progressData" JSONB;
ALTER TABLE "user" ADD COLUMN "lastProgressSyncAt" TIMESTAMP(3);

-- AlterTable: PointsLedger
ALTER TABLE "PointsLedger" ALTER COLUMN "submissionId" DROP NOT NULL;

-- AlterTable: Post
ALTER TABLE "Post" ADD COLUMN "pinnedAt" TIMESTAMP(3);
CREATE INDEX "Post_status_pinnedAt_idx" ON "Post"("status", "pinnedAt");

-- CreateTable: Vote
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Vote_targetType_targetId_idx" ON "Vote"("targetType", "targetId");
CREATE UNIQUE INDEX "Vote_userId_targetType_targetId_key" ON "Vote"("userId", "targetType", "targetId");
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: Report
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Report_targetType_targetId_idx" ON "Report"("targetType", "targetId");
CREATE INDEX "Report_status_idx" ON "Report"("status");
CREATE UNIQUE INDEX "Report_reporterId_targetType_targetId_key" ON "Report"("reporterId", "targetType", "targetId");
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
