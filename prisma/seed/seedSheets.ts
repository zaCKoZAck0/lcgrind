import 'dotenv/config';
import { db } from '~/lib/db';
import * as s from './sheets';

type Metadata = {
    slug: string;
    title: string,
    description: string,
    ownerName: string,
    website: string
}

type Problem = {
    order: number;
    url: string;
    group: string;
    solutionVideoLink?: string;
}

async function seed(metadata: Metadata, problems: Problem[]) {
    try {
        const sheet = await db.sheet.upsert({
            where: {
                slug: metadata.slug,
            },
            update: {
                name: metadata.title,
                slug: metadata.slug,
                description: metadata.description,
                ownerName: metadata.ownerName,
                website: metadata.website,
            },
            create: {
                name: metadata.title,
                slug: metadata.slug,
                description: metadata.description,
                ownerName: metadata.ownerName,
                website: metadata.website,
            },
        });


        for (const problem of problems) {
        try {
                const normalizedLink = problem.url.endsWith('/')
                    ? problem.url
                    : `${problem.url}/`;

                const dbProblem = await db.problem.findFirst({
                    where: { url: normalizedLink }
                });

                if (!dbProblem) {
                    console.warn(
                        `Problem with URL: ${normalizedLink} not found in the database. Skipping SheetProblem creation.`
                    );
                    return;
                }

                await db.sheetProblem.upsert({
                    where: {
                        problemId_sheetId: {
                            problemId: dbProblem.id,
                            sheetId: sheet.id
                        }
                    },
                    update: {
                        sheetOrder: problem.order,
                        group: problem.group,
                        solutionVideoLink: problem.solutionVideoLink
                    },
                    create: {
                        problemId: dbProblem.id,
                        sheetId: sheet.id,
                        sheetOrder: problem.order,
                        group: problem.group,
                        solutionVideoLink: problem.solutionVideoLink
                    }
                });
            } catch (error) {
                console.error(`Error creating SheetProblem for URL: ${problem.url}`);
                console.error(error);
            }
        }

    } catch (error) {
        console.error(`Error creating sheet: ${metadata.title}`);
        console.error(error);
        return;
    }

    
}

async function init() {
    await seed(s.BLIND_75.METADATA, s.BLIND_75.PROBLEMS);
    await seed(s.GRIND_75.METADATA, s.GRIND_75.PROBLEMS);
    await seed(s.LEETCODE_75.METADATA, s.LEETCODE_75.PROBLEMS);
    await seed(s.LEETCODE_150.METADATA, s.LEETCODE_150.PROBLEMS);
    await seed(s.LEETCODE_MOST_LIKED.METADATA, s.LEETCODE_MOST_LIKED.PROBLEMS);
    await seed(s.NEETCODE_150.METADATA, s.NEETCODE_150.PROBLEMS);
    await seed(s.NEETCODE_250.METADATA, s.NEETCODE_250.PROBLEMS);
}

init()