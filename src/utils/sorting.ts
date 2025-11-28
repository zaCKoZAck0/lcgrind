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
      return `AVG(s."${getOrderKey(order)}")${!isSheet ? " * COUNT(sh.id)" : ""} DESC NULLS LAST, p.id`;
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
  const trimmedSearch = search.trim();
  const trimmedSlug = slug.trim();
  if (trimmedSearch.length > 0) {
    whereQueries.push(`(p.title ILIKE '%${trimmedSearch}%' OR p.id::text ILIKE '%${trimmedSearch}%')`);
  }
  if (trimmedSlug.length > 0) {
    whereQueries.push(`sh.slug = '${trimmedSlug}'`);
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

export const getDifficultyThreshold = (difficulty: string): number => {
  switch (difficulty) {
    case 'Easy':
      return 0;
    case 'Medium':
      return 1;
    case 'Hard':
      return 2;
    default:
      return 0;
  }
};
