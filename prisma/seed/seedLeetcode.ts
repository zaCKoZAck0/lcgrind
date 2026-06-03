// @ts-ignore
import 'dotenv/config';
import { db as prisma } from '~/lib/db';
import { Prisma } from '@prisma/client';

const LEETCODE_API_ENDPOINT = 'https://leetcode.com/graphql/';

const graphqlQuery = `
  query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
    problemsetQuestionList: questionList(
      categorySlug: $categorySlug
      limit: $limit
      skip: $skip
      filters: $filters
    ) {
      total: totalNum
      questions: data {
        acRate
        difficulty
        freqBar
        frontendQuestionId: questionFrontendId
        isFavor
        paidOnly: isPaidOnly
        status
        title
        titleSlug
        topicTags {
          name
          id # Note: LeetCode API provides its own ID for tags, we mainly use slug/name
          slug
        }
        hasSolution
        hasVideoSolution
      }
    }
  }
`;

// Raw-SQL batch size: each row uses 2 params (slug, name) for tags, 8 for problems.
// Keep well under Postgres' 65535-param limit.
const TAG_BATCH_SIZE = 500;     // 500 * 2 params = 1000
const PROBLEM_BATCH_SIZE = 500; // 500 * 8 params = 4000
const LINK_BATCH_SIZE = 1000;   // createMany, no raw params
const API_BATCH_SIZE = 100;

const operationName = 'problemsetQuestionList';

interface TopicTagFromResponse {
    name: string;
    id: string;
    slug: string;
}

interface QuestionFromResponse {
    acRate: number;
    difficulty: string;
    freqBar: number;
    frontendQuestionId: string;
    isFavor: boolean;
    paidOnly: boolean;
    status: string;
    title: string;
    titleSlug: string;
    topicTags: TopicTagFromResponse[];
    hasSolution: boolean;
    hasVideoSolution: boolean;
}

interface QuestionListResponse {
    data: {
        problemsetQuestionList: {
            total: number;
            questions: QuestionFromResponse[];
        };
    };
}

async function fetchBatch(skip: number, limit: number): Promise<QuestionListResponse> {
    const response = await fetch(LEETCODE_API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: graphqlQuery,
            variables: {
                categorySlug: 'all-code-essentials',
                skip,
                limit,
                filters: {},
            },
            operationName: operationName,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
    }

    const jsonResponse: QuestionListResponse = await response.json();
    if (!jsonResponse.data?.problemsetQuestionList?.questions) {
        throw new Error('GraphQL response structure incorrect or missing data: ' + JSON.stringify(jsonResponse, null, 2));
    }

    return jsonResponse;
}

async function fetchAndStoreQuestions() {
    const totalStart = performance.now();
    try {
        // ── Phase 1: Fetch all questions into memory ──────────────────────────
        const fetchStart = performance.now();
        console.log('Fetching questions from LeetCode API...');

        const firstBatch = await fetchBatch(0, API_BATCH_SIZE);
        const total = firstBatch.data.problemsetQuestionList.total;
        const allQuestions: QuestionFromResponse[] = [...firstBatch.data.problemsetQuestionList.questions];

        console.log(`Total questions available: ${total}. Fetching in batches of ${API_BATCH_SIZE}...`);

        while (allQuestions.length < total) {
            const batch = await fetchBatch(allQuestions.length, API_BATCH_SIZE);
            const questions = batch.data.problemsetQuestionList.questions;
            if (!questions || questions.length === 0) {
                console.log('No more questions returned by the API.');
                break;
            }
            allQuestions.push(...questions);
            console.log(`Fetched ${allQuestions.length}/${total} questions...`);
        }

        console.log(`Fetched ${allQuestions.length} questions in ${(performance.now() - fetchStart).toFixed(0)}ms`);

        // ── Phase 2: Bulk-upsert TopicTags ────────────────────────────────────
        const tagsStart = performance.now();

        const uniqueTags = new Map<string, string>(); // slug -> name
        for (const q of allQuestions) {
            for (const tag of q.topicTags) {
                if (!tag.slug) {
                    console.warn(`Skipping tag with missing slug for problem "${q.title}":`, tag);
                    continue;
                }
                uniqueTags.set(tag.slug, tag.name);
            }
        }

        const tagEntries = Array.from(uniqueTags.entries()); // [slug, name][]
        let tagRowsUpserted = 0;

        for (let i = 0; i < tagEntries.length; i += TAG_BATCH_SIZE) {
            const chunk = tagEntries.slice(i, i + TAG_BATCH_SIZE);
            await prisma.$executeRaw(Prisma.sql`
                INSERT INTO "TopicTag" ("slug", "name")
                VALUES ${Prisma.join(chunk.map(([slug, name]) => Prisma.sql`(${slug}, ${name})`))}
                ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name"
            `);
            tagRowsUpserted += chunk.length;
        }

        // Reload to get IDs
        const tagIdBySlug = new Map<string, number>();
        for (const tag of await prisma.topicTag.findMany({ select: { id: true, slug: true } })) {
            tagIdBySlug.set(tag.slug, tag.id);
        }

        console.log(`Upserted ${tagRowsUpserted} TopicTags in ${(performance.now() - tagsStart).toFixed(0)}ms`);

        // ── Phase 3: Bulk-upsert Problems ─────────────────────────────────────
        const problemsStart = performance.now();

        // Dedupe by URL (titleSlug is unique, but guard anyway)
        type ProblemRow = {
            frontendQuestionId: string;
            platform: string;
            title: string;
            url: string;
            difficulty: string;
            difficultyOrder: number;
            acceptance: number;
            isPaid: boolean;
        };
        const uniqueProblems = new Map<string, ProblemRow>(); // url -> row
        for (const q of allQuestions) {
            const url = `https://leetcode.com/problems/${q.titleSlug}/`;
            uniqueProblems.set(url, {
                frontendQuestionId: q.frontendQuestionId,
                platform: 'LeetCode',
                title: q.title,
                url,
                difficulty: q.difficulty,
                difficultyOrder: q.difficulty === 'Easy' ? 1 : q.difficulty === 'Medium' ? 2 : 3,
                acceptance: Math.round(q.acRate),
                isPaid: q.paidOnly,
            });
        }

        const problemEntries = Array.from(uniqueProblems.values());
        let problemRowsUpserted = 0;

        for (let i = 0; i < problemEntries.length; i += PROBLEM_BATCH_SIZE) {
            const chunk = problemEntries.slice(i, i + PROBLEM_BATCH_SIZE);
            await prisma.$executeRaw(Prisma.sql`
                INSERT INTO "Problem"
                  ("frontendQuestionId", "platform", "title", "url", "difficulty",
                   "difficultyOrder", "acceptance", "isPaid")
                VALUES ${Prisma.join(chunk.map((p) => Prisma.sql`(
                    ${p.frontendQuestionId},
                    ${p.platform},
                    ${p.title},
                    ${p.url},
                    ${p.difficulty},
                    ${p.difficultyOrder},
                    ${p.acceptance},
                    ${p.isPaid}
                )`))}
                ON CONFLICT ("url") DO UPDATE SET
                    "frontendQuestionId" = EXCLUDED."frontendQuestionId",
                    "title"              = EXCLUDED."title",
                    "difficulty"         = EXCLUDED."difficulty",
                    "difficultyOrder"    = EXCLUDED."difficultyOrder",
                    "acceptance"         = EXCLUDED."acceptance",
                    "isPaid"             = EXCLUDED."isPaid"
            `);
            problemRowsUpserted += chunk.length;
        }

        // Reload to get IDs
        const problemIdByUrl = new Map<string, number>();
        for (const p of await prisma.problem.findMany({ select: { id: true, url: true } })) {
            problemIdByUrl.set(p.url, p.id);
        }

        console.log(`Upserted ${problemRowsUpserted} Problems in ${(performance.now() - problemsStart).toFixed(0)}ms`);

        // ── Phase 4: Bulk-insert ProblemsOnTopicTags join rows ────────────────
        const linksStart = performance.now();

        const uniqueLinks = new Map<string, { problemId: number; topicTagId: number }>();
        for (const q of allQuestions) {
            const url = `https://leetcode.com/problems/${q.titleSlug}/`;
            const problemId = problemIdByUrl.get(url);
            if (!problemId) continue;

            for (const tag of q.topicTags) {
                if (!tag.slug) continue;
                const topicTagId = tagIdBySlug.get(tag.slug);
                if (!topicTagId) continue;
                const key = `${problemId}:${topicTagId}`;
                if (!uniqueLinks.has(key)) {
                    uniqueLinks.set(key, { problemId, topicTagId });
                }
            }
        }

        const linkData = Array.from(uniqueLinks.values());
        let linksInserted = 0;

        for (let i = 0; i < linkData.length; i += LINK_BATCH_SIZE) {
            const chunk = linkData.slice(i, i + LINK_BATCH_SIZE);
            await prisma.problemsOnTopicTags.createMany({ data: chunk, skipDuplicates: true });
            linksInserted += chunk.length;
        }

        console.log(`Inserted ${linksInserted} ProblemsOnTopicTags links in ${(performance.now() - linksStart).toFixed(0)}ms`);
        console.log(`Seeding completed successfully in ${(performance.now() - totalStart).toFixed(0)}ms`);

    } catch (error) {
        console.error('Error during fetch and store operation:', error);
    } finally {
        console.log('Disconnecting Prisma client...');
        await prisma.$disconnect();
    }
}

fetchAndStoreQuestions()
    .then(() => {
        console.log('Script finished successfully.');
    })
    .catch((e) => {
        console.error('Script failed with an error:', e);
        process.exit(1);
    });
