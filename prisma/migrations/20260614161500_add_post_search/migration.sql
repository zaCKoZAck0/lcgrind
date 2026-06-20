-- Trigram fuzzy matching for the compose-time "similar posts" typeahead.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Weighted full-text vector: title (A) outranks body (B) at query time.
-- Generated/stored so it stays in sync with title/body with no app-side writes.
ALTER TABLE "Post" ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
    setweight(to_tsvector('english', coalesce("body", '')), 'B')
  ) STORED;

-- GIN over the vector for websearch_to_tsquery lookups.
CREATE INDEX "Post_searchVector_idx" ON "Post" USING GIN ("searchVector");

-- GIN trigram index over title for similarity()-based typeahead.
CREATE INDEX "Post_title_trgm_idx" ON "Post" USING GIN ("title" gin_trgm_ops);
