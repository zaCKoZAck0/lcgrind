import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'csv-parse';
import { db } from '~/lib/db';
import { Prisma } from '@prisma/client';

type CSVProblem = {
  Difficulty: string;
  Title: string;
  Frequency: number;
  'Acceptance Rate': number;
  Link: string;
  Topics: string[];
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvNames = [
  '1. Thirty Days.csv',
  '2. Three Months.csv',
  '3. Six Months.csv',
  '4. More Than Six Months.csv',
  '5. All.csv'
] as const;

// Updated mapping: removed prevOrder fields since they don't exist in our schema
const csvNameToOrderFieldMap: Record<
  typeof csvNames[number],
  { order: keyof Prisma.SheetProblemUpdateInput }
> = {
  '1. Thirty Days.csv': { order: 'thirtyDaysOrder' },
  '2. Three Months.csv': { order: 'threeMonthsOrder' },
  '3. Six Months.csv': { order: 'sixMonthsOrder' },
  '4. More Than Six Months.csv': { order: 'yearlyOrder' },
  '5. All.csv': { order: 'sheetOrder' }
};

const csvHeaders = [
  'Difficulty',
  'Title',
  'Frequency',
  'Acceptance Rate',
  'Link',
  'Topics'
];

// Helper function to parse CSV content using a Promise
async function parseCsv(rawCsv: string): Promise<CSVProblem[]> {
  return new Promise((resolve, reject) => {
    parse(
      rawCsv,
      {
        delimiter: ',',
        columns: csvHeaders,
        // Skip header line
        from_line: 2,
        trim: true,
        // Automatically cast numbers (for Frequency and Acceptance Rate)
        cast: true
      },
      (error, records: CSVProblem[]) => {
        if (error) {
          reject(error);
        } else {
          resolve(records);
        }
      }
    );
  });
}

async function init() {
  try {
    // Delete all existing SheetProblem records once at the start
    await db.sheetProblem.deleteMany({});

    const dir = path.join(__dirname, '../../.data');
    const companies = await fs.readdir(dir);

    for (const company of companies) {
      // Skip non-company directories/files
      if (
        company === '.git' ||
        company === 'Readme.md' ||
        company === '.gitignore'
      ) {
        continue;
      }

      // Capitalize the company name (assumes folder name is the company name)
      const capitalizedName = company
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      for (const csvName of csvNames) {
        const filePath = path.join(dir, company, csvName);
        let rawCsv: string;
        try {
          rawCsv = await fs.readFile(filePath, { encoding: 'utf-8' });
        } catch (err) {
          console.error(`Error reading file: ${filePath}`, err);
          continue;
        }

        console.log(`Parsing ${company} - ${csvName}`);

        let csvProblems: CSVProblem[];
        try {
          csvProblems = await parseCsv(rawCsv);
        } catch (err) {
          console.error(
            `Error parsing CSV for ${company} - ${csvName}`,
            err
          );
          continue;
        }

        for (const csvProblem of csvProblems) {
          // Normalize URL: add trailing slash if missing
          const normalizedLink = csvProblem.Link.endsWith('/')
            ? csvProblem.Link
            : `${csvProblem.Link}/`;

          // Find the corresponding Problem record by URL
          const problem = await db.problem.findFirst({
            where: { url: normalizedLink }
          });

          if (!problem) {
            console.warn(
              `Problem with URL: ${normalizedLink} not found in the database. Skipping SheetProblem creation.`
            );
            continue;
          }

          // Find the corresponding Sheet (company) record by name
          const sheet = await db.sheet.findFirst({
            where: { name: capitalizedName }
          });

          if (!sheet) {
            console.error(
              `Company (Sheet) not found: ${capitalizedName}. Skipping ${company} - ${csvName}.`
            );
            continue;
          }

          const orderFields = csvNameToOrderFieldMap[csvName];
          if (!orderFields) {
            console.error(`No mapping found for CSV file: ${csvName}`);
            continue;
          }

          // Upsert the SheetProblem record with the new Frequency value
          await db.sheetProblem.upsert({
            where: {
              problemId_sheetId: {
                problemId: problem.id,
                sheetId: sheet.id
              }
            },
            create: {
              problemId: problem.id,
              sheetId: sheet.id,
              [orderFields.order]: csvProblem.Frequency
            },
            update: {
              [orderFields.order]: csvProblem.Frequency
            }
          });
        }
      }
    }

    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error during seeding:', error);
  }
}

init();
