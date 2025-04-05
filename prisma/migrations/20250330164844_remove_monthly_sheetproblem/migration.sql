/*
  Warnings:

  - You are about to drop the column `monthlyOrder` on the `SheetProblem` table. All the data in the column will be lost.
  - You are about to drop the column `prevMonthlyOrder` on the `SheetProblem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SheetProblem" DROP COLUMN "monthlyOrder",
DROP COLUMN "prevMonthlyOrder";
