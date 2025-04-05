/*
  Warnings:

  - You are about to drop the column `topics` on the `Problem` table. All the data in the column will be lost.
  - Added the required column `isPaid` to the `Problem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Problem_url_topics_idx";

-- AlterTable
ALTER TABLE "Problem" DROP COLUMN "topics",
ADD COLUMN     "isPaid" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Sheet" ADD COLUMN     "website" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "TopicTags" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "problemId" INTEGER,

    CONSTRAINT "TopicTags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TopicTags_slug_key" ON "TopicTags"("slug");

-- CreateIndex
CREATE INDEX "Problem_url_idx" ON "Problem"("url");

-- AddForeignKey
ALTER TABLE "TopicTags" ADD CONSTRAINT "TopicTags_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
