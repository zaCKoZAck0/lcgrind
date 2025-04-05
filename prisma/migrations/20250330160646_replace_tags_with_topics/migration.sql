/*
  Warnings:

  - You are about to drop the column `tags` on the `Problem` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Problem_url_tags_idx";

-- AlterTable
ALTER TABLE "Problem" DROP COLUMN "tags",
ADD COLUMN     "topics" TEXT[];

-- CreateIndex
CREATE INDEX "Problem_url_topics_idx" ON "Problem"("url", "topics");
