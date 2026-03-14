import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'csv-parse';
import { db } from '~/lib/db';
import { Prisma } from '@prisma/client';

type CSVProblem = {
  ID: string;
  URL: string;
  Title: string;
  Difficulty: string;
  'Acceptance %': string;
  'Frequency %': string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvNames = [
  'thirty-days.csv',
  'three-months.csv',
  'six-months.csv',
  'more-than-six-months.csv',
  'all.csv'
] as const;

// Updated mapping: removed prevOrder fields since they don't exist in our schema
const csvNameToOrderFieldMap: Record<
  (typeof csvNames)[number],
  { order: string }
> = {
  'thirty-days.csv': { order: 'thirtyDaysOrder' },
  'three-months.csv': { order: 'threeMonthsOrder' },
  'six-months.csv': { order: 'sixMonthsOrder' },
  'more-than-six-months.csv': { order: 'yearlyOrder' },
  'all.csv': { order: 'sheetOrder' }
};

const csvHeaders = [
  'ID',
  'URL',
  'Title',
  'Difficulty',
  'Acceptance %',
  'Frequency %'
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
        trim: true
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

const BATCH_SIZE = 1000;
const skipList = new Set(['.git', '.gitignore', 'README.md', 'src', 'pom.xml']);

async function init() {
  const totalStart = performance.now();
  try {
    // ── Phase 1: Preload all lookup tables into memory ──────────────────
    const preloadStart = performance.now();

    const [allProblems, allSheets] = await Promise.all([
      db.problem.findMany({ select: { id: true, url: true } }),
      db.sheet.findMany({ select: { id: true, name: true } })
    ]);

    // Build lookup maps: url -> problemId, name -> sheetId
    const problemMap = new Map<string, number>();
    for (const p of allProblems) {
      problemMap.set(p.url, p.id);
    }

    const sheetMap = new Map<string, number>();
    for (const s of allSheets) {
      sheetMap.set(s.name, s.id);
    }

    console.log(
      `Preloaded ${problemMap.size} problems and ${sheetMap.size} sheets in ${(performance.now() - preloadStart).toFixed(0)}ms`
    );

    // ── Phase 2: Parse all CSVs and merge into a single batch ───────────
    const parseStart = performance.now();

    const dir = path.join(__dirname, '../../.data');
    const companies = await fs.readdir(dir);

    // Key: "problemId:sheetId" -> merged SheetProblem create data
    const mergedRecords = new Map<
      string,
      {
        problemId: number;
        sheetId: number;
        thirtyDaysOrder: number;
        threeMonthsOrder: number;
        sixMonthsOrder: number;
        yearlyOrder: number;
        sheetOrder: number;
      }
    >();

    let skippedProblems = 0;
    let skippedSheets = 0;
    let totalCsvRows = 0;

    for (const company of companies) {
      if (skipList.has(company)) continue;

      // Capitalize the company name (folder names are lowercase-hyphenated)
      const capitalizedName = company
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      const sheetId = sheetMap.get(capitalizedName);
      if (!sheetId) {
        skippedSheets++;
        continue;
      }

      for (const csvName of csvNames) {
        const filePath = path.join(dir, company, csvName);
        let rawCsv: string;
        try {
          rawCsv = await fs.readFile(filePath, { encoding: 'utf-8' });
        } catch {
          // File doesn't exist for this company/time-window, skip silently
          continue;
        }

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

        const orderField = csvNameToOrderFieldMap[csvName].order;

        for (const csvProblem of csvProblems) {
          totalCsvRows++;

          // Normalize URL: add trailing slash if missing
          const normalizedLink = csvProblem.URL.endsWith('/')
            ? csvProblem.URL
            : `${csvProblem.URL}/`;

          const problemId = problemMap.get(normalizedLink);
          if (!problemId) {
            skippedProblems++;
            continue;
          }

          const key = `${problemId}:${sheetId}`;
          let record = mergedRecords.get(key);
          if (!record) {
            record = {
              problemId,
              sheetId,
              thirtyDaysOrder: 0,
              threeMonthsOrder: 0,
              sixMonthsOrder: 0,
              yearlyOrder: 0,
              sheetOrder: 0
            };
            mergedRecords.set(key, record);
          }

          // Merge the frequency value for this CSV's order field
          const frequency = parseFloat(csvProblem['Frequency %']);
          (record as Record<string, unknown>)[orderField] = frequency;
        }
      }
    }

    console.log(
      `Parsed ${totalCsvRows} CSV rows across ${companies.length} companies in ${(performance.now() - parseStart).toFixed(0)}ms`
    );
    console.log(
      `Merged into ${mergedRecords.size} unique SheetProblem records (skipped ${skippedProblems} unmatched problems, ${skippedSheets} unmatched sheets)`
    );

    // ── Phase 3: Delete all existing records and batch insert ───────────
    const dbStart = performance.now();

    await db.sheetProblem.deleteMany({});

    // Convert merged records to array for createMany
    const allData: Prisma.SheetProblemCreateManyInput[] = [];
    for (const record of mergedRecords.values()) {
      allData.push({
        problemId: record.problemId,
        sheetId: record.sheetId,
        thirtyDaysOrder: record.thirtyDaysOrder,
        threeMonthsOrder: record.threeMonthsOrder,
        sixMonthsOrder: record.sixMonthsOrder,
        yearlyOrder: record.yearlyOrder,
        sheetOrder: record.sheetOrder
      });
    }

    // Insert in chunks to avoid hitting query size limits
    let inserted = 0;
    for (let i = 0; i < allData.length; i += BATCH_SIZE) {
      const chunk = allData.slice(i, i + BATCH_SIZE);
      await db.sheetProblem.createMany({ data: chunk });
      inserted += chunk.length;
    }

    console.log(
      `Inserted ${inserted} SheetProblem records in ${(performance.now() - dbStart).toFixed(0)}ms`
    );
    console.log(
      `Seeding completed successfully in ${(performance.now() - totalStart).toFixed(0)}ms`
    );
  } catch (error) {
    console.error('Error during seeding:', error);
  }
}

init();
