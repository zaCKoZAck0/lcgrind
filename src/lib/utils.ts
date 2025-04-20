import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ProblemWithStats } from "~/types/problem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

//  convert all Decimal to number
export const sanitizeProblems = (problems: ProblemWithStats[]) => {
    return problems.map(problem => ({
        ...problem,
        order: problem.order?.toNumber(),
    }));
}

export type SanitizedProblem = ReturnType<typeof sanitizeProblems>[number];