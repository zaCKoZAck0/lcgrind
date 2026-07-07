export const difficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'Easy':
      return 'bg-green-300';
    case 'Medium':
      return 'bg-yellow-300';
    case 'Hard':
      return 'bg-red-300';
    default:
      return '';
  }
};

export const getOrderKey = (order: string): string => {
  switch (order) {
    case 'yearly':
      return 'yearlyOrder';
    case 'six-months':
      return 'sixMonthsOrder';
    case 'three-months':
      return 'threeMonthsOrder';
    case 'monthly':
      return 'thirtyDaysOrder';
    default:
      return 'sheetOrder';
  }
};

export const getDbOrderByClause = (order: string, sort: string, isSheet: boolean = false): string => {

  switch (sort) {
    case 'frequency':
      return `AVG(s."${getOrderKey(order)}")${!isSheet ? " * COUNT(DISTINCT sh.id)" : ""} DESC NULLS LAST, p.id`;
    case 'question-id':
      return `p.id`;
    case 'acceptance':
      return `p.acceptance DESC NULLS LAST, p.id`;
    case 'difficulty':
      return `p."difficultyOrder", p.id`;
    default:
      return `p.id`;
  }
}

// Valid difficulty values - used for validation to prevent SQL injection
const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;

export const getDbWhereClause = (order: string, search: string, slug: string, difficulties: string[] | null = null): string => {
  const whereQueries = [];
  const trimmedSearch = (search ?? '').trim();
  const trimmedSlug = (slug ?? '').trim();
  if (trimmedSearch.length > 0) {
    const safeSearch = trimmedSearch.replaceAll("'", "''");
    whereQueries.push(`(p.title ILIKE '%${safeSearch}%' OR p.id::text ILIKE '%${safeSearch}%')`);
  }
  if (trimmedSlug.length > 0) {
    const safeSlug = trimmedSlug.replaceAll("'", "''");
    whereQueries.push(`sh.slug = '${safeSlug}'`);
  }
  if (order !== 'all-problems') { 
    whereQueries.push(`s."${getOrderKey(order)}" > 0`);
  }
  if (difficulties && difficulties.length > 0) {
    // Filter to only valid difficulty values to prevent SQL injection
    const validatedDifficulties = difficulties.filter(d => 
      VALID_DIFFICULTIES.includes(d as typeof VALID_DIFFICULTIES[number])
    );
    if (validatedDifficulties.length > 0) {
      const escapedDifficulties = validatedDifficulties.map(d => `'${d}'`).join(', ');
      whereQueries.push(`p.difficulty IN (${escapedDifficulties})`);
    }
  }
  if (whereQueries.length > 0) {
    return `WHERE ${whereQueries.join(' AND ')}`;
  }
  return '';
}

// ---------------------------------------------------------------------------
// Aggregated (CompanyQuestionStat-backed) helpers for /all-problems (issue 027).
// Kept separate from the Sheet/SheetProblem helpers above so the company-wise,
// topic and random-problem pages that still query SheetProblem are untouched.
// ---------------------------------------------------------------------------

// Maps the order/window dropdown to the CompanyQuestionStat column whose SUM
// drives the frequency sort. All-time (all-problems / all) uses askCount.
export const getStatWindowColumn = (order: string): string => {
  switch (order) {
    case 'monthly':
      return 'ask30d';
    case 'three-months':
      return 'ask90d';
    case 'six-months':
      return 'ask180d';
    case 'yearly':
      return 'ask365d';
    default:
      return 'askCount';
  }
};

// ORDER BY for the aggregated query. `agg` is the per-problem rollup CTE that
// exposes "order" (window SUM) and "recency" (MAX lastAsked). Ask counts drive
// the sort only — they are never rendered as numbers.
export const getAggregatedOrderByClause = (sort: string): string => {
  switch (sort) {
    case 'frequency':
      return `agg."order" DESC NULLS LAST, p.id`;
    case 'recency':
      return `agg."recency" DESC NULLS LAST, p.id`;
    case 'acceptance':
      return `p.acceptance DESC NULLS LAST, p.id`;
    case 'difficulty':
      return `p."difficultyOrder", p.id`;
    default:
      return `p.id`;
  }
};

// Search + difficulty predicate fragment (no WHERE keyword, AND-joined). The
// company/tag narrowing predicates are appended in the query itself since they
// reference the aggregated CTEs. No Sheet/SheetProblem references.
export const getAggregatedWhereClause = (
  search: string,
  difficulties: string[] | null = null,
): string => {
  const predicates: string[] = [];
  const trimmedSearch = (search ?? '').trim();
  if (trimmedSearch.length > 0) {
    const safeSearch = trimmedSearch.replaceAll("'", "''");
    predicates.push(`(p.title ILIKE '%${safeSearch}%' OR p.id::text ILIKE '%${safeSearch}%')`);
  }
  if (difficulties && difficulties.length > 0) {
    const validatedDifficulties = difficulties.filter(d =>
      VALID_DIFFICULTIES.includes(d as typeof VALID_DIFFICULTIES[number])
    );
    if (validatedDifficulties.length > 0) {
      const escapedDifficulties = validatedDifficulties.map(d => `'${d}'`).join(', ');
      predicates.push(`p.difficulty IN (${escapedDifficulties})`);
    }
  }
  return predicates.join(' AND ');
};

const DIFFICULTY_THRESHOLD: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2 };

export const getDifficultyThreshold = (difficulty: string): number =>
  DIFFICULTY_THRESHOLD[difficulty] ?? 0;
