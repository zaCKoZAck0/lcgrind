-- AlterTable: Post — add view counters (ranking signal only, never rendered)
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "viewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "signedInViewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable: PostView — raw deduplicated beacon rows (rolled up nightly)
CREATE TABLE IF NOT EXISTS "PostView" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "viewerKey" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "signedIn" BOOLEAN NOT NULL,

    CONSTRAINT "PostView_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PostView_postId_viewerKey_day_key" ON "PostView"("postId", "viewerKey", "day");
CREATE INDEX IF NOT EXISTS "PostView_day_idx" ON "PostView"("day");
DO $$ BEGIN
    ALTER TABLE "PostView" ADD CONSTRAINT "PostView_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable: PostViewDaily — rolled-up daily aggregates per post
CREATE TABLE IF NOT EXISTS "PostViewDaily" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "views" INTEGER NOT NULL,
    "signedInViews" INTEGER NOT NULL,

    CONSTRAINT "PostViewDaily_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PostViewDaily_postId_day_key" ON "PostViewDaily"("postId", "day");
DO $$ BEGIN
    ALTER TABLE "PostViewDaily" ADD CONSTRAINT "PostViewDaily_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
