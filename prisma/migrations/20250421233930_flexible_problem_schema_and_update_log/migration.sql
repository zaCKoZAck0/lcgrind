/*
  Warnings:

  - Added the required column `frontendQuestionId` to the `Problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platform` to the `Problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Sheet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "frontendQuestionId" TEXT NOT NULL,
ADD COLUMN     "platform" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Sheet" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
