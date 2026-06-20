-- CreateTable
CREATE TABLE "CommunityQuestionAsk" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "submissionId" TEXT NOT NULL,
    "band" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "problemId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityQuestionAsk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityCompPoint" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "submissionId" TEXT NOT NULL,
    "roleFamily" TEXT NOT NULL,
    "level" TEXT,
    "expYears" DOUBLE PRECISION,
    "expBand" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "base" DOUBLE PRECISION,
    "tc" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityCompPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommunityQuestionAsk_companyId_band_idx" ON "CommunityQuestionAsk"("companyId", "band");

-- CreateIndex
CREATE INDEX "CommunityQuestionAsk_submissionId_idx" ON "CommunityQuestionAsk"("submissionId");

-- CreateIndex
CREATE INDEX "CommunityCompPoint_companyId_currency_idx" ON "CommunityCompPoint"("companyId", "currency");

-- CreateIndex
CREATE INDEX "CommunityCompPoint_submissionId_idx" ON "CommunityCompPoint"("submissionId");

-- AddForeignKey
ALTER TABLE "CommunityQuestionAsk" ADD CONSTRAINT "CommunityQuestionAsk_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityQuestionAsk" ADD CONSTRAINT "CommunityQuestionAsk_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityQuestionAsk" ADD CONSTRAINT "CommunityQuestionAsk_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityCompPoint" ADD CONSTRAINT "CommunityCompPoint_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityCompPoint" ADD CONSTRAINT "CommunityCompPoint_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
