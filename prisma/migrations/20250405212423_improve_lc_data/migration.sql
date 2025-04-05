-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "acceptance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "difficultyOrder" INTEGER NOT NULL DEFAULT 0;
