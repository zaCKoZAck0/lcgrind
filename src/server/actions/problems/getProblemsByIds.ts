"use server";

import { db } from "~/lib/db";

export interface ListProblem {
  id: number;
  frontendQuestionId: string;
  title: string;
  url: string;
  difficulty: string;
  difficultyOrder: number;
  acceptance: number;
  isPaid: boolean;
  tags: string[];
}

export async function getProblemsByIds(ids: number[]): Promise<ListProblem[]> {
  if (ids.length === 0) return [];

  const problems = await db.problem.findMany({
    where: { id: { in: ids } },
    include: {
      topicTags: {
        include: { topicTag: true },
      },
    },
  });

  return problems.map((p) => ({
    id: p.id,
    frontendQuestionId: p.frontendQuestionId,
    title: p.title,
    url: p.url,
    difficulty: p.difficulty,
    difficultyOrder: p.difficultyOrder,
    acceptance: p.acceptance,
    isPaid: p.isPaid,
    tags: p.topicTags.map((tt) => tt.topicTag.name),
  }));
}
