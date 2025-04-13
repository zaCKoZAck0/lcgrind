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