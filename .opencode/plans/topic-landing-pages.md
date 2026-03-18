# Topic Landing Pages Implementation Plan

## Overview
Create `/topics/[topic-slug]` pages (~73 pages) and a `/topics` index page. Each page lists all LeetCode problems for a specific topic tag (e.g., dynamic-programming, binary-search) with filtering, pagination, and progress tracking.

## Files to Create (7)

### 1. `src/server/actions/topics/getTopicProblems.ts`
Server action: paginated problem list for a topic slug. Uses INNER JOIN on TopicTag by slug (not name), with search/difficulty/sort support. Returns same `ProblemWithStats` shape. No frequency/company joins (simpler than getProblems.ts). `0::numeric AS "order"` placeholder since topics don't have frequency data.

### 2. `src/server/actions/topics/getTopicProblemIds.ts`
Server action: all problem IDs for a topic slug. Same WHERE clause as getTopicProblems minus pagination. Returns `string[]` of IDs for ProgressTracker and total count.

### 3. `src/server/actions/topics/getAllTopics.ts`
Server action: all topics with problem counts. Uses Prisma `findMany` with `_count` on problems relation. Returns `{ id, slug, name, problemCount }[]`. Used by index page and `generateStaticParams`.

### 4. `src/components/topics/topic-page.tsx`
Client component adapted from CompanyPage pattern:
- Props: `topicSlug`, `topicName`, `initialProblems`, `initialProblemIds`
- useSearchParams for filter state (difficulties, sort, search, page)
- React Query with initialData hydration for SSR
- Renders: H1 with topic name, problem count, ProgressTracker, Filters (no company filter, no order/frequency), ProblemRow list, GlobalPagination, AdBanner
- Filters component reused with `isProblemFilter=false` (hides company multi-select)
- Default sort: question-id, default order: all-problems

### 5. `src/app/topics/[topic-slug]/page.tsx`
RSC with:
- `revalidate = 86400`, `dynamicParams = true`
- `generateStaticParams`: queries all TopicTag slugs from DB
- `generateMetadata`: e.g., "Dynamic Programming LeetCode Problems [2026] | LC Grind"
  - Description: "Practice X dynamic programming problems on LeetCode..."
  - Keywords: topic-specific + generic
  - Canonical URL, OG, Twitter cards
- Page component: fetches initial data server-side via Promise.all, renders BreadcrumbJsonLd + TopicPage client component
- Uses `notFound()` for invalid slugs

### 6. `src/app/topics/[topic-slug]/loading.tsx`
Skeleton loading: header skeleton + 10 ProblemRowSkeleton rows.

### 7. `src/app/topics/page.tsx`
Topics index page (RSC):
- Title: "LeetCode Problems by Topic | LC Grind"
- Description: "Browse X LeetCode problems organized by topic..."
- Fetches all topics via getAllTopics, groups into Data Structures / Algorithms / Other
- Each topic rendered as a link card: name + problem count badge
- BreadcrumbJsonLd: Home > Topics
- ItemListJsonLd listing all topics
- `revalidate = 86400`

## Files to Modify (2)

### 8. `src/app/sitemap.ts`
Add topic pages section:
- Query all TopicTag slugs
- Map to `{ url: ${BASE_URL}/topics/${slug}, priority: 0.7, changeFrequency: "weekly" }`
- Add `/topics` index page with priority 0.85

### 9. `src/components/seo/json-ld.tsx`
Add `ItemListJsonLd` component:
```tsx
interface ItemListItem { name: string; url: string; position: number; }
export function ItemListJsonLd({ items }: { items: ItemListItem[] }) { ... }
```

## Key Design Decisions
- TopicTag slugs come directly from LeetCode API (already URL-safe) — no `generateSlug()` needed
- Topic problems don't have company frequency data, so `order` column returns 0 and frequency is hidden
- Reuses existing Filters component with `isProblemFilter=false` (hides company selector)
- Sort options: question-id (default), difficulty, acceptance (no frequency)
- INNER JOIN on TopicTag (only problems with that tag), LEFT JOIN for all_tags (to populate tags array on each problem)
