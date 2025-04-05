// @ts-ignore
import { db as prisma } from '~/lib/db'

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

const queryVariables = {
    categorySlug: 'all-code-essentials', 
    skip: 0,
    limit: 3600, 
    filters: {},
};

const operationName = 'problemsetQuestionList';

// Interfaces remain the same
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

async function fetchAndStoreQuestions() {
    try {
        console.log('Fetching questions from LeetCode API...');
        const response = await fetch(LEETCODE_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: graphqlQuery,
                variables: queryVariables,
                operationName: operationName,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
            return;
        }

        const jsonResponse: QuestionListResponse = await response.json();
        if (!jsonResponse.data?.problemsetQuestionList?.questions) {
             console.error('GraphQL response structure incorrect or missing data:', JSON.stringify(jsonResponse, null, 2));
             return;
        }

        const questions = jsonResponse.data.problemsetQuestionList.questions;

        if (!questions || questions.length === 0) {
            console.log('No questions found in the response.');
            return;
        }

        console.log(`Workspaceed ${questions.length} questions. Processing...`);

        let problemsCreated = 0;
        let problemsFound = 0;
        let tagsCreated = 0;
        let tagsFound = 0;
        let linksCreated = 0;
        let linksFound = 0; // Or skipped

        for (const question of questions) {
            const { title, titleSlug, difficulty, paidOnly, topicTags, acRate } = question;
            const url = `https://leetcode.com/problems/${titleSlug}/`;

            try {
                await prisma.$transaction(async (tx) => {
                    const problem = await tx.problem.upsert({
                        where: { url: url },
                        update: {
                            title: title,
                            difficulty: difficulty,
                            difficultyOrder: difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 2 : 3,
                            acceptance: acRate,
                            isPaid: paidOnly,
                        },
                        create: {
                            title: title,
                            url: url,
                            difficulty: difficulty,
                            acceptance: acRate,
                            difficultyOrder: difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 2 : 3,
                            isPaid: paidOnly,
                        },
                    });

                    if (problem.title === title) { // Simple check if it was just created or matched exactly
                       // This check isn't perfect for detecting *creation* vs *update* in upsert
                       // console.log(`Upserted Problem: "${title}" (ID: ${problem.id})`);
                    }

                    const tagIdsToLink: number[] = [];

                    // 2. Upsert each TopicTag
                    for (const tag of topicTags) {
                        if (!tag.slug) {
                           console.warn(`Skipping tag with missing slug for problem "${title}":`, tag);
                           continue; // Skip tags without a slug
                        }
                        const topicTag = await tx.topicTag.upsert({
                            where: { slug: tag.slug },
                            update: {
                                // Update name if it changes (optional)
                                name: tag.name,
                            },
                            create: {
                                slug: tag.slug,
                                name: tag.name,
                            },
                        });
                         tagIdsToLink.push(topicTag.id);
                        // console.log(`Upserted TopicTag: "${topicTag.name}" (ID: ${topicTag.id})`);
                    }

                    // 3. Create links in the join table for all tags associated with this problem
                    for (const tagId of tagIdsToLink) {
                       // Use upsert on the join table to avoid errors if the link already exists
                       await tx.problemsOnTopicTags.upsert({
                           where: {
                               // Use the composite key identifier defined in the schema (@@id([problemId, topicTagId]))
                               problemId_topicTagId: {
                                   problemId: problem.id,
                                   topicTagId: tagId,
                               }
                           },
                           create: {
                               problemId: problem.id,
                               topicTagId: tagId,
                               // assignedAt: new Date() // Set timestamp if you have it in your schema
                           },
                           update: {} // Nothing needs to be updated if the link already exists
                       });
                        // console.log(`Upserted link between Problem ID ${problem.id} and TopicTag ID ${tagId}`);
                    }
                });
                 console.log(`Successfully processed problem: "${title}"`);

            } catch (error) {
                // Log errors specific to processing a single question
                console.error(`Error processing problem "${title}" (URL: ${url}):`, error);
                // Continue to the next question even if one fails
            }
        }

        console.log('Finished processing all fetched questions.');
        // Add summary logging if needed (problemsCreated, etc.)

    } catch (error) {
        // Log errors related to the initial fetch or overall process
        console.error('Error during fetch and store operation:', error);
    } finally {
        console.log('Disconnecting Prisma client...');
        await prisma.$disconnect();
    }
}

fetchAndStoreQuestions()
    .then(() => {
        console.log("Script finished successfully.");
    })
    .catch((e) => {
        console.error("Script failed with an error:", e);
        process.exit(1); // Exit with error code if the script fails catastrophically
    });