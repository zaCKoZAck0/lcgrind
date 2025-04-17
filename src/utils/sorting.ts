export const difficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'Easy':
      return 'text-green-600';
    case 'Medium':
      return 'text-yellow-600';
    case 'Hard':
      return 'text-red-600';
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

export const getDbOrderByClause = (order: string, sort: string): string => { 
  switch (sort) {
    case 'frequency':
      return `AVG(s."${getOrderKey(order)}") * COUNT(sh.id) DESC NULLS LAST, p.id`;
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

export const getDbWhereClause = (order: string, search: string, slug: string): string => {
  const whereQueries = [];
  if (search.trim().length > 0) {
    whereQueries.push(`p.title ILIKE '%${search.trim()}%'`);
  }
  if (slug.trim().length > 0) {
    whereQueries.push(`sh.slug = '${slug.trim()}'`);
  }
  if (order !== 'all-problems') {
    whereQueries.push(`s."${getOrderKey(order)}" > 0`);
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
