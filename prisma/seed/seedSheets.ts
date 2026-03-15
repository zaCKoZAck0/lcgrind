import 'dotenv/config';
import { db } from '~/lib/db';
import { Prisma } from '@prisma/client';
import * as s from './sheets';

type Metadata = {
  slug: string;
  title: string;
  description: string;
  ownerName: string;
  website: string;
};

type Problem = {
  order: number;
  url: string;
  group: string;
  solutionVideoLink?: string;
};

type SheetDefinition = {
  METADATA: Metadata;
  PROBLEMS: Problem[];
};

const BATCH_SIZE = 1000;

const ALL_SHEETS: SheetDefinition[] = [
  s.BLIND_75,
  s.GRIND_75,
  s.LEETCODE_75,
  s.LEETCODE_150,
  s.LEETCODE_MOST_LIKED,
  s.NEETCODE_150,
  s.NEETCODE_250
];

async function init() {
  const totalStart = performance.now();
  try {
    // ── Phase 1: Preload all problems into memory ─────────────────────────
    const preloadStart = performance.now();

    const allProblems = await db.problem.findMany({
      select: { id: true, url: true }
    });

    const problemMap = new Map<string, number>();
    for (const p of allProblems) {
      problemMap.set(p.url, p.id);
    }

    console.log(
      `Preloaded ${problemMap.size} problems in ${(performance.now() - preloadStart).toFixed(0)}ms`
    );

    // ── Phase 2: Upsert sheets & build records in parallel ────────────────
    const buildStart = performance.now();

    const sheetIds: number[] = [];
    const allRecords: Prisma.SheetProblemCreateManyInput[] = [];
    let skippedProblems = 0;

    const results = await Promise.all(
      ALL_SHEETS.map(async ({ METADATA, PROBLEMS }) => {
        // Upsert the Sheet record
        const sheet = await db.sheet.upsert({
          where: { slug: METADATA.slug },
          update: {
            name: METADATA.title,
            slug: METADATA.slug,
            description: METADATA.description,
            ownerName: METADATA.ownerName,
            website: METADATA.website
          },
          create: {
            name: METADATA.title,
            slug: METADATA.slug,
            description: METADATA.description,
            ownerName: METADATA.ownerName,
            website: METADATA.website
          }
        });

        // Build SheetProblem records in memory
        const records: Prisma.SheetProblemCreateManyInput[] = [];
        let skipped = 0;

        for (const problem of PROBLEMS) {
          const normalizedLink = problem.url.endsWith('/')
            ? problem.url
            : `${problem.url}/`;

          const problemId = problemMap.get(normalizedLink);
          if (!problemId) {
            skipped++;
            continue;
          }

          records.push({
            problemId,
            sheetId: sheet.id,
            sheetOrder: problem.order,
            group: problem.group,
            solutionVideoLink: problem.solutionVideoLink ?? null
          });
        }

        return { sheetId: sheet.id, sheetName: METADATA.title, records, skipped };
      })
    );

    // Collect results from all parallel tasks
    for (const result of results) {
      sheetIds.push(result.sheetId);
      allRecords.push(...result.records);
      skippedProblems += result.skipped;
      console.log(
        `  ${result.sheetName}: ${result.records.length} problems (${result.skipped} skipped)`
      );
    }

    console.log(
      `Built ${allRecords.length} SheetProblem records across ${ALL_SHEETS.length} sheets in ${(performance.now() - buildStart).toFixed(0)}ms (${skippedProblems} skipped)`
    );

    // ── Phase 3: Scoped delete + batch insert ─────────────────────────────
    const dbStart = performance.now();

    // Only delete SheetProblem records belonging to the sheets we're seeding
    await db.sheetProblem.deleteMany({
      where: { sheetId: { in: sheetIds } }
    });

    // Insert in chunks to avoid hitting query size limits
    let inserted = 0;
    for (let i = 0; i < allRecords.length; i += BATCH_SIZE) {
      const chunk = allRecords.slice(i, i + BATCH_SIZE);
      await db.sheetProblem.createMany({ data: chunk, skipDuplicates: true });
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
