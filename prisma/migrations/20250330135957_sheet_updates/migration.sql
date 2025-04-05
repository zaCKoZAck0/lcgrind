/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Sheet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Sheet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sheet" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SheetProblem" ALTER COLUMN "sheetOrder" SET DEFAULT 0.0;

-- CreateIndex
CREATE UNIQUE INDEX "Sheet_slug_key" ON "Sheet"("slug");
