import { Decimal } from "@prisma/client/runtime/library";

export type SearchParams = {
    sort?: string;
    order?: string;
    companies?: string[];
    tags?: string[];
    search?: string;
    page?: string;
};

export interface ProblemWithStats {
  id: number;
  title: string;
  url: string;
  difficulty: string;
  difficultyOrder: number;
  acceptance: number;
  isPaid: boolean;
  order: Decimal; // Average of s."thirtyDaysOrder"
  companies: string[];
  tags: string[];
};

// Per-row company chip from CompanyQuestionStat (issue 027). slug is needed for
// the chip-click filter + "other" exclusion; name is the label.
export type CompanyChip = { slug: string; name: string };

// Raw shape returned by the aggregated /all-problems query (getProblems /
// getProblemIds). `order` is a window ask-count SUM (bigint from Postgres) and
// `recency` is MAX(lastAsked) as YYYY-MM — both drive sort only, never rendered
// as numbers. Distinct from ProblemWithStats so the Sheet-backed actions stay
// untouched.
export interface AggregatedProblem {
  id: number;
  frontendQuestionId: string;
  platform: string;
  title: string;
  url: string;
  difficulty: string;
  difficultyOrder: number;
  acceptance: number;
  isPaid: boolean;
  order: bigint | number | null;
  recency: string | null;
  companies: CompanyChip[] | null;
  tags: (string | null)[] | null;
};

// Post-sanitization shape returned by getProblems / getRandomProblem /
// getTopicProblems for the CompanyQuestionStat-backed aggregated path.
// Distinct from SanitizedProblem (which carries Sheet-derived string[]
// companies).
export type SanitizedAggregatedProblem = {
  id: number;
  frontendQuestionId: string;
  platform: string;
  title: string;
  url: string;
  difficulty: string;
  difficultyOrder: number;
  acceptance: number;
  isPaid: boolean;
  order: number | null;
  recency: string | null;
  companies: CompanyChip[];
  tags: string[];
};