"use server";

import "server-only";
import { db } from "~/lib/db";
import { FEATURE_FLAGS } from "~/config/feature-flags";

export async function searchRoles(query: string): Promise<string[]> {
    const q = query.trim();
    if (!q) return [];
    const pattern = `%${q}%`;
    try {
        const rows = await db.$queryRaw<{ role: string }[]>`
            SELECT DISTINCT exp->>'role' AS role
            FROM "Submission"
            CROSS JOIN jsonb_array_elements(structured->'experiences') AS exp
            WHERE structured IS NOT NULL
              AND structured ? 'experiences'
              AND exp->>'role' ILIKE ${pattern}
              AND exp->>'role' != ''
            ORDER BY role
            LIMIT 8
        `;
        return rows.map((r) => r.role).filter(Boolean);
    } catch {
        return [];
    }
}

export type QuestionSuggestion = { title: string; number?: string };

export async function searchQuestions(query: string): Promise<QuestionSuggestion[]> {
    const q = query.trim();
    try {
        // Query present: filter by title. Empty: top by acceptance.
        const titleFilter = q ? { title: { contains: q, mode: "insensitive" as const } } : {};
        const pattern = `%${q}%`;

        // Independent reads — run together. LeetCode problems, other platforms
        // (gated), and community questions from existing posts (only when searching).
        const [lcRows, otherRows, communityRows] = await Promise.all([
            db.problem.findMany({
                where: { platform: "LeetCode", isPaid: false, ...titleFilter },
                orderBy: { acceptance: "desc" },
                take: q ? 8 : 10,
                select: { title: true, frontendQuestionId: true },
            }),
            FEATURE_FLAGS.OTHERS
                ? db.problem.findMany({
                      where: { NOT: { platform: "LeetCode" }, ...titleFilter },
                      take: 4,
                      select: { title: true, frontendQuestionId: true },
                  })
                : Promise.resolve([]),
            q.length >= 2
                ? db.$queryRaw<{ text: string }[]>`
                    SELECT DISTINCT qs->>'text' AS text
                    FROM "Submission"
                    CROSS JOIN jsonb_array_elements(structured->'experiences') AS exp
                    CROSS JOIN jsonb_array_elements(exp->'rounds') AS rnd
                    CROSS JOIN jsonb_array_elements(rnd->'questions') AS qs
                    WHERE structured IS NOT NULL
                      AND structured ? 'experiences'
                      AND qs->>'text' ILIKE ${pattern}
                      AND qs->>'text' != ''
                    LIMIT 4
                `
                : Promise.resolve([]),
        ]);

        const results: QuestionSuggestion[] = [...lcRows, ...otherRows].map((r) => ({
            title: r.title,
            number: r.frontendQuestionId,
        }));

        if (communityRows.length > 0) {
            const community: QuestionSuggestion[] = communityRows
                .map((r) => r.text)
                .filter(Boolean)
                .map((text) => ({ title: text }));
            // Community questions first (more contextually relevant)
            return [...community, ...results].slice(0, 12);
        }

        return results;
    } catch {
        return [];
    }
}
