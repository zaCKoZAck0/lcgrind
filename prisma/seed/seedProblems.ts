import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {parse} from 'csv-parse';
import { db } from '~/lib/db';
import { Prisma } from '@prisma/client';

type CSVProblem = {
    Difficulty: string,
    Title: string,
    Frequency: number,
    'Acceptance Rate': number,
    Link: string,
    Topics: string[]

}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const csvNames = ['1. Thirty Days.csv',
'2. Three Months.csv',
'3. Six Months.csv',
'4. More Than Six Months.csv',
'5. All.csv'] as const;

const csvNameToOrderFieldMap: Record<typeof csvNames[number], { order: keyof Prisma.SheetProblemUpdateInput, prevOrder: keyof Prisma.SheetProblemUpdateInput }> = {
    '1. Thirty Days.csv': { order: 'thirtyDaysOrder', prevOrder: 'prevThirtyDaysOrder' },
    '2. Three Months.csv': { order: 'threeMonthsOrder', prevOrder: 'prevThreeMonthsOrder' },
    '3. Six Months.csv': { order: 'sixMonthsOrder', prevOrder: 'prevSixMonthsOrder' },
    '4. More Than Six Months.csv': { order: 'yearlyOrder', prevOrder: 'prevYearlyOrder' },
    '5. All.csv': { order: 'sheetOrder', prevOrder: 'prevOrder' },
};
const csvHeaders = ['Difficulty', 'Title', 'Frequency', 'Acceptance Rate', 'Link', 'Topics'];

async function init() {
    await db.sheetProblem.deleteMany();
    const dir = path.join(__dirname, '../../.data');
    const compnanies = await fs.readdir(dir);
    for (const company of compnanies) {

        // 1. Capitalize the company name
        const capitalizedName = company
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        for (const csvName of csvNames) {
            const rawCsv = await fs.readFile(path.join(__dirname, '../../.data', company, csvName), { encoding: 'utf-8' });
            parse(rawCsv, {
                delimiter: ',',
                columns: csvHeaders,
            }, async (error, csvProblems: CSVProblem[]) => {
                if (error) {
                    console.log(`Error at ${company}, filename: ${csvName}`)
                }
                else {
                    for (const csvProblem of csvProblems.slice(1)) {
                        // Add trailing slash to URL if not present
                        const normalizedLink = csvProblem.Link.endsWith('/') ? csvProblem.Link : `${csvProblem.Link}/`;
                        console.log(normalizedLink)

                        // Only find the problem, assuming it exists
                        const problem = await db.problem.findFirst({
                            where: {
                                url: normalizedLink
                            }
                        });

                        if (!problem) {
                            console.warn(`Problem with URL: ${normalizedLink} not found in the database. Skipping SheetProblem creation.`);
                            continue; // Skip to the next problem if the Problem record doesn't exist
                        }

                        const sheet = await db.sheet.findFirst({
                            where: {
                                name: capitalizedName,
                            }
                        });

                        if (!sheet) {
                            console.error(`Sheet not found for company: ${capitalizedName}. Skipping SheetProblem creation for ${normalizedLink}.`);
                            continue; // Skip to the next company or CSV
                        }

                        const existingSheetProblem = await db.sheetProblem.findFirst({
                            where: {
                                problemId: problem.id,
                                sheetId: sheet.id,
                            },
                        });

                        const orderFields = csvNameToOrderFieldMap[csvName];

                        await db.sheetProblem.upsert({
                            where: {
                                problemId_sheetId: {
                                    problemId: problem.id,
                                    sheetId: sheet.id,
                                }
                            },
                            create: {
                                problemId: problem.id,
                                sheetId: sheet.id,
                                [orderFields.order]: csvProblem.Frequency,
                                [orderFields.prevOrder]: existingSheetProblem?.[orderFields.order] ?? -1, // Set initial prevOrder to current or -1 if new
                            },
                            update: {
                                [orderFields.prevOrder]: existingSheetProblem?.[orderFields.order] ?? -1, // Store current order as previous
                                [orderFields.order]: csvProblem.Frequency,
                            }
                        });

                    }
                }


            });
        }

    }
}

init();