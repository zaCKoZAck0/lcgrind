-- CreateTable
CREATE TABLE "CompanyQuestionStat" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "band" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "problemId" INTEGER,
    "askCount" INTEGER NOT NULL DEFAULT 0,
    "lastAsked" TEXT,

    CONSTRAINT "CompanyQuestionStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyQuestionStat_companyId_band_idx" ON "CompanyQuestionStat"("companyId", "band");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyQuestionStat_companyId_band_type_statement_key" ON "CompanyQuestionStat"("companyId", "band", "type", "statement");

-- AddForeignKey
ALTER TABLE "CompanyQuestionStat" ADD CONSTRAINT "CompanyQuestionStat_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyQuestionStat" ADD CONSTRAINT "CompanyQuestionStat_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
