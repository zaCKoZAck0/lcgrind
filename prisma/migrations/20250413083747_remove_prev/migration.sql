/*
  Warnings:

  - You are about to drop the column `prevOrder` on the `SheetProblem` table. All the data in the column will be lost.
  - You are about to drop the column `prevSixMonthsOrder` on the `SheetProblem` table. All the data in the column will be lost.
  - You are about to drop the column `prevThirtyDaysOrder` on the `SheetProblem` table. All the data in the column will be lost.
  - You are about to drop the column `prevThreeMonthsOrder` on the `SheetProblem` table. All the data in the column will be lost.
  - You are about to drop the column `prevYearlyOrder` on the `SheetProblem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SheetProblem" DROP COLUMN "prevOrder",
DROP COLUMN "prevSixMonthsOrder",
DROP COLUMN "prevThirtyDaysOrder",
DROP COLUMN "prevThreeMonthsOrder",
DROP COLUMN "prevYearlyOrder";
