import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ProblemWithStats, AggregatedProblem, SanitizedAggregatedProblem } from "~/types/problem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

//  convert all Decimal to number
export const sanitizeProblems = (problems: ProblemWithStats[]) => {
    return problems.map(problem => ({
        ...problem,
        order: problem.order?.toNumber(),
        companies: (problem.companies ?? []).filter(Boolean),
        tags: (problem.tags ?? []).filter(Boolean),
    }));
}

export type SanitizedProblem = ReturnType<typeof sanitizeProblems>[number];

// Sanitize aggregated (CompanyQuestionStat-backed) problems — same purpose as
// sanitizeProblems but for the AggregatedProblem shape. Converts bigint order
// to number, filters nulls from companies/tags.
export function sanitizeAggregatedProblems(rows: AggregatedProblem[]): SanitizedAggregatedProblem[] {
    return rows.map((r) => ({
        ...r,
        order: r.order != null ? Number(r.order) : null,
        recency: r.recency ?? null,
        companies: (r.companies ?? []).filter(Boolean),
        tags: (r.tags ?? []).filter((t): t is string => Boolean(t)),
    }));
}
