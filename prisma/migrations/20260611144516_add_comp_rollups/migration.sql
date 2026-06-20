-- CreateTable
CREATE TABLE "CompRollup" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "roleFamily" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "expBand" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "n" INTEGER NOT NULL,
    "tcP25" DOUBLE PRECISION NOT NULL,
    "tcMedian" DOUBLE PRECISION NOT NULL,
    "tcP75" DOUBLE PRECISION NOT NULL,
    "baseMedian" DOUBLE PRECISION,
    "expMedian" DOUBLE PRECISION,
    "tcHistogram" JSONB NOT NULL,

    CONSTRAINT "CompRollup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompCurve" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "points" JSONB NOT NULL,

    CONSTRAINT "CompCurve_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompRollup_companyId_idx" ON "CompRollup"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CompRollup_companyId_roleFamily_level_expBand_currency_key" ON "CompRollup"("companyId", "roleFamily", "level", "expBand", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "CompCurve_companyId_currency_key" ON "CompCurve"("companyId", "currency");

-- AddForeignKey
ALTER TABLE "CompRollup" ADD CONSTRAINT "CompRollup_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompCurve" ADD CONSTRAINT "CompCurve_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
