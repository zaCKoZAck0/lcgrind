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


export function onClickAdUrl() {
    window.location.href = "https://www.profitableratecpm.com/h8vuuevjcp?key=d93a3c027b3327b738e09d7ddaeaa1e6";
}