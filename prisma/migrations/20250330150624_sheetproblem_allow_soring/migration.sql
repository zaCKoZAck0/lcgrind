/*
  Warnings:

  - Added the required column `prevMonthlyOrder` to the `SheetProblem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prevSixMonthsOrder` to the `SheetProblem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prevThirtyDaysOrder` to the `SheetProblem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prevThreeMonthsOrder` to the `SheetProblem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prevYearlyOrder` to the `SheetProblem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SheetProblem" ADD COLUMN     "monthlyOrder" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
ADD COLUMN     "prevMonthlyOrder" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "prevSixMonthsOrder" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "prevThirtyDaysOrder" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "prevThreeMonthsOrder" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "prevYearlyOrder" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "sixMonthsOrder" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
ADD COLUMN     "thirtyDaysOrder" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
ADD COLUMN     "threeMonthsOrder" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
ADD COLUMN     "yearlyOrder" DECIMAL(65,30) NOT NULL DEFAULT 0.0;
