/*
  Warnings:

  - You are about to drop the `TopicTags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TopicTags" DROP CONSTRAINT "TopicTags_problemId_fkey";

-- DropTable
DROP TABLE "TopicTags";

-- CreateTable
CREATE TABLE "TopicTag" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TopicTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemsOnTopicTags" (
    "problemId" INTEGER NOT NULL,
    "topicTagId" INTEGER NOT NULL,

    CONSTRAINT "ProblemsOnTopicTags_pkey" PRIMARY KEY ("problemId","topicTagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "TopicTag_slug_key" ON "TopicTag"("slug");

-- AddForeignKey
ALTER TABLE "ProblemsOnTopicTags" ADD CONSTRAINT "ProblemsOnTopicTags_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemsOnTopicTags" ADD CONSTRAINT "ProblemsOnTopicTags_topicTagId_fkey" FOREIGN KEY ("topicTagId") REFERENCES "TopicTag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
