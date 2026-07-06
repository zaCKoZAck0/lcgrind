-- Fix PostView and PostViewDaily: earlier schema had day as TEXT; correct type is DATE.
-- Drop and recreate since these tables are raw beacon buffers with no retained data.

DROP TABLE IF EXISTS "PostView" CASCADE;
DROP TABLE IF EXISTS "PostViewDaily" CASCADE;

CREATE TABLE "PostView" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "viewerKey" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "signedIn" BOOLEAN NOT NULL,

    CONSTRAINT "PostView_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PostView_postId_viewerKey_day_key" ON "PostView"("postId", "viewerKey", "day");
CREATE INDEX "PostView_day_idx" ON "PostView"("day");
ALTER TABLE "PostView" ADD CONSTRAINT "PostView_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "PostViewDaily" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "views" INTEGER NOT NULL,
    "signedInViews" INTEGER NOT NULL,

    CONSTRAINT "PostViewDaily_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PostViewDaily_postId_day_key" ON "PostViewDaily"("postId", "day");
ALTER TABLE "PostViewDaily" ADD CONSTRAINT "PostViewDaily_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
