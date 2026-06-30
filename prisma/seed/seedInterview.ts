// @ts-ignore
import 'dotenv/config';
import { db } from '~/lib/db';
import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';
// @ts-ignore
import { recomputeCompanyTiers } from '~/server/recompute-tiers';

// ── Local DB client ──────────────────────────────────────────────────────────
// Reads from the local development DB (Docker Postgres) which contains the
// interview-scraped production data.
const localDb = new PrismaClient({
  datasourceUrl: process.env.LOCAL_DATABASE_URL,
});

// ── Batch sizes ──────────────────────────────────────────────────────────────
const PROBLEM_BATCH = 500;
const STAT_BATCH = 1000;
const ROLLUP_BATCH = 500;
const CURVE_BATCH = 500;
const LINK_BATCH = 2000;

// ── Phase 1: Problems ────────────────────────────────────────────────────────
async function syncProblems(): Promise<Map<string, number>> {
  console.log('── Phase 1: Syncing Problems ──');
  const start = performance.now();

  const localProblems = await localDb.problem.findMany();
  console.log(`  Local problems: ${localProblems.length}`);

  for (let i = 0; i < localProblems.length; i += PROBLEM_BATCH) {
    const chunk = localProblems.slice(i, i + PROBLEM_BATCH);
    await db.$executeRaw(Prisma.sql`
      INSERT INTO "Problem" ("frontendQuestionId", "platform", "title", "url", "difficulty", "difficultyOrder", "acceptance", "isPaid")
      VALUES ${Prisma.join(
        chunk.map(
          (p) =>
            Prisma.sql`(${p.frontendQuestionId}, ${p.platform}, ${p.title}, ${p.url}, ${p.difficulty}, ${p.difficultyOrder}, ${p.acceptance}, ${p.isPaid})`,
        ),
      )}
      ON CONFLICT ("url") DO UPDATE SET
        "frontendQuestionId" = EXCLUDED."frontendQuestionId",
        "title"              = EXCLUDED."title",
        "difficulty"         = EXCLUDED."difficulty",
        "difficultyOrder"    = EXCLUDED."difficultyOrder",
        "acceptance"         = EXCLUDED."acceptance",
        "isPaid"             = EXCLUDED."isPaid"
    `);
  }

  // Build local url → local id, then prod url → prod id
  const localUrlToId = new Map(localProblems.map((p) => [p.url, p.id]));
  const prodProblems = await db.problem.findMany({ select: { id: true, url: true } });
  const problemIdMap = new Map<string, number>(); // localId → prodId
  for (const pp of prodProblems) {
    const localId = localUrlToId.get(pp.url);
    if (localId !== undefined) {
      problemIdMap.set(String(localId), pp.id);
    }
  }
  console.log(`  Problem ID map: ${problemIdMap.size} entries`);
  console.log(`  Problems synced in ${(performance.now() - start).toFixed(0)}ms`);
  return problemIdMap;
}

// ── Phase 1b: TopicTags ──────────────────────────────────────────────────────
async function syncTopicTags(): Promise<Map<string, number>> {
  console.log('── Phase 1b: Syncing TopicTags ──');
  const start = performance.now();

  const localTags = await localDb.topicTag.findMany();
  for (let i = 0; i < localTags.length; i += 500) {
    const chunk = localTags.slice(i, i + 500);
    await db.$executeRaw(Prisma.sql`
      INSERT INTO "TopicTag" ("slug", "name")
      VALUES ${Prisma.join(chunk.map((t) => Prisma.sql`(${t.slug}, ${t.name})`))}
      ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name"
    `);
  }

  const localSlugToId = new Map(localTags.map((t) => [t.slug, t.id]));
  const prodTags = await db.topicTag.findMany({ select: { id: true, slug: true } });
  const tagIdMap = new Map<string, number>(); // localId → prodId
  for (const pt of prodTags) {
    const localId = localSlugToId.get(pt.slug);
    if (localId !== undefined) {
      tagIdMap.set(String(localId), pt.id);
    }
  }

  console.log(`  TopicTags synced in ${(performance.now() - start).toFixed(0)}ms`);
  return tagIdMap;
}

// ── Phase 1c: ProblemsOnTopicTags ────────────────────────────────────────────
async function syncProblemTagLinks(
  problemIdMap: Map<string, number>,
  tagIdMap: Map<string, number>,
) {
  console.log('── Phase 1c: Syncing ProblemsOnTopicTags ──');
  const start = performance.now();

  const links = await localDb.problemsOnTopicTags.findMany();
  console.log(`  Local links: ${links.length}`);

  const mapped: { problemId: number; topicTagId: number }[] = [];
  for (const link of links) {
    const prodProblemId = problemIdMap.get(String(link.problemId));
    const prodTagId = tagIdMap.get(String(link.topicTagId));
    if (prodProblemId && prodTagId) {
      mapped.push({ problemId: prodProblemId, topicTagId: prodTagId });
    }
  }

  for (let i = 0; i < mapped.length; i += LINK_BATCH) {
    const chunk = mapped.slice(i, i + LINK_BATCH);
    await db.problemsOnTopicTags.createMany({ data: chunk, skipDuplicates: true });
  }

  console.log(`  Links synced (${mapped.length} mapped) in ${(performance.now() - start).toFixed(0)}ms`);
}

// ── Phase 2: Companies + Sheets ─────────────────────────────────────────────
async function syncCompanies(): Promise<Map<number, number>> {
  console.log('── Phase 2: Syncing Companies ──');
  const start = performance.now();

  const localCompanies = await localDb.company.findMany();
  console.log(`  Local companies: ${localCompanies.length}`);

  // Get local company sheets (by slug)
  const localSheets = await localDb.sheet.findMany({ where: { isCompany: true } });
  const localSheetBySlug = new Map<string, (typeof localSheets)[number]>();
  for (const s of localSheets) localSheetBySlug.set(s.slug, s);

  // Get existing prod company sheets by slug
  const prodSheets = await db.sheet.findMany({ where: { isCompany: true } });
  const prodSheetBySlug = new Map<string, (typeof prodSheets)[number]>();
  for (const s of prodSheets) prodSheetBySlug.set(s.slug, s);

  // Create missing company sheets in prod
  let sheetsCreated = 0;
  const localSheetEntries = Array.from(localSheetBySlug.entries());
  for (const [slug, localSheet] of localSheetEntries) {
    if (!prodSheetBySlug.has(slug)) {
      await db.sheet.create({
        data: {
          slug: localSheet.slug,
          name: localSheet.name,
          description: localSheet.description,
          ownerName: localSheet.ownerName,
          isCompany: true,
        },
      });
      sheetsCreated++;
    }
  }
  console.log(`  Created ${sheetsCreated} new company sheets`);

  // Refresh prod sheet map after creates
  const refreshedSheets = await db.sheet.findMany({
    where: { isCompany: true },
    select: { id: true, slug: true },
  });
  const prodSheetMap = new Map<string, number>();
  for (const s of refreshedSheets) prodSheetMap.set(s.slug, s.id);

  // Upsert companies
  const companyIdMap = new Map<number, number>(); // localId → prodId
  let upserted = 0;
  for (const company of localCompanies) {
    const localSheet = localSheetBySlug.get(company.slug);
    const prodSheetId = localSheet ? (prodSheetMap.get(company.slug) ?? null) : null;

    const result = await db.company.upsert({
      where: { slug: company.slug },
      update: {
        name: company.name,
        reportCount: company.reportCount,
        lastSeen: company.lastSeen,
        payTier: 0,
        easyCount: 0,
        mediumCount: 0,
        hardCount: 0,
        sheetId: prodSheetId,
      },
      create: {
        slug: company.slug,
        name: company.name,
        reportCount: company.reportCount,
        lastSeen: company.lastSeen,
        payTier: 0,
        easyCount: 0,
        mediumCount: 0,
        hardCount: 0,
        sheetId: prodSheetId,
      },
    });
    companyIdMap.set(company.id, result.id);
    upserted++;
    if (upserted % 200 === 0) console.log(`  Upserted ${upserted}/${localCompanies.length} companies`);
  }

  console.log(`  Companies synced: ${upserted} in ${(performance.now() - start).toFixed(0)}ms`);
  return companyIdMap;
}

// ── Phase 2b: SheetProblems (company sheets only) ────────────────────────────
async function syncSheetProblems(problemIdMap: Map<string, number>) {
  console.log('── Phase 2b: Syncing SheetProblems (company sheets) ──');
  const start = performance.now();

  const localSheetProblems = await localDb.sheetProblem.findMany({
    include: { sheet: { select: { slug: true, isCompany: true } } },
  });
  const companySheetProblems = localSheetProblems.filter((sp) => sp.sheet.isCompany);
  console.log(`  Local company sheet problems: ${companySheetProblems.length}`);

  const prodSheets = await db.sheet.findMany({
    where: { isCompany: true },
    select: { id: true, slug: true },
  });
  const prodSheetBySlug = new Map(prodSheets.map((s) => [s.slug, s.id]));

  const mapped: {
    problemId: number;
    sheetId: number;
    sheetOrder: number;
    thirtyDaysOrder: number;
    threeMonthsOrder: number;
    sixMonthsOrder: number;
    yearlyOrder: number;
    group: string;
  }[] = [];
  let skipped = 0;
  for (const sp of companySheetProblems) {
    const prodSheetId = prodSheetBySlug.get(sp.sheet.slug);
    const prodProblemId = problemIdMap.get(String(sp.problemId));
    if (!prodSheetId || !prodProblemId) {
      skipped++;
      continue;
    }
    mapped.push({
      problemId: prodProblemId as number,
      sheetId: prodSheetId as number,
      sheetOrder: Number(sp.sheetOrder),
      thirtyDaysOrder: Number(sp.thirtyDaysOrder),
      threeMonthsOrder: Number(sp.threeMonthsOrder),
      sixMonthsOrder: Number(sp.sixMonthsOrder),
      yearlyOrder: Number(sp.yearlyOrder),
      group: sp.group,
    });
  }

  for (let i = 0; i < mapped.length; i += LINK_BATCH) {
    const chunk = mapped.slice(i, i + LINK_BATCH);
    await db.sheetProblem.createMany({ data: chunk, skipDuplicates: true });
  }

  console.log(
    `  SheetProblems synced: ${mapped.length} mapped, ${skipped} skipped in ${(performance.now() - start).toFixed(0)}ms`,
  );
}

// ── Phase 3: CompanyQuestionStat ─────────────────────────────────────────────
async function syncQuestionStats(
  companyIdMap: Map<number, number>,
  problemIdMap: Map<string, number>,
) {
  console.log('── Phase 3: Syncing CompanyQuestionStat ──');
  const start = performance.now();

  const stats = await localDb.companyQuestionStat.findMany();
  console.log(`  Local question stats: ${stats.length}`);

  // Full replace: delete all existing, then bulk insert
  await db.$executeRawUnsafe(`TRUNCATE TABLE "CompanyQuestionStat" CASCADE`);

  const mapped: {
    companyId: number;
    band: string;
    type: string;
    kind: string;
    statement: string;
    problemId: number | null;
    askCount: number;
    ask30d: number;
    ask90d: number;
    ask180d: number;
    ask365d: number;
    lastAsked: string | null;
    firstAsked: string | null;
  }[] = [];

  for (const s of stats) {
    const prodCompanyId = companyIdMap.get(s.companyId);
    if (!prodCompanyId) continue;
    const prodProblemId = s.problemId ? (problemIdMap.get(String(s.problemId)) ?? null) : null;
    mapped.push({
      companyId: prodCompanyId,
      band: s.band,
      type: s.type,
      kind: s.kind,
      statement: s.statement,
      problemId: prodProblemId,
      askCount: s.askCount,
      ask30d: s.ask30d,
      ask90d: s.ask90d,
      ask180d: s.ask180d,
      ask365d: s.ask365d,
      lastAsked: s.lastAsked,
      firstAsked: s.firstAsked,
    });
  }

  let inserted = 0;
  for (let i = 0; i < mapped.length; i += STAT_BATCH) {
    const chunk = mapped.slice(i, i + STAT_BATCH);
    await db.companyQuestionStat.createMany({ data: chunk, skipDuplicates: true });
    inserted += chunk.length;
    console.log(`  Inserted ${inserted}/${mapped.length} question stats`);
  }

  console.log(`  Question stats synced in ${(performance.now() - start).toFixed(0)}ms`);
}

// ── Phase 4: CompRollup ──────────────────────────────────────────────────────
async function syncCompRollups(companyIdMap: Map<number, number>) {
  console.log('── Phase 4: Syncing CompRollup ──');
  const start = performance.now();

  const rollups = await localDb.compRollup.findMany();
  console.log(`  Local rollups: ${rollups.length}`);

  await db.$executeRawUnsafe(`TRUNCATE TABLE "CompRollup" CASCADE`);

  const mapped: {
    companyId: number;
    roleFamily: string;
    level: string;
    expBand: string;
    currency: string;
    n: number;
    tcP25: number;
    tcMedian: number;
    tcP75: number;
    baseMedian: number | null;
    expMedian: number | null;
    tcHistogram: object;
  }[] = [];

  for (const r of rollups) {
    const prodCompanyId = companyIdMap.get(r.companyId);
    if (!prodCompanyId) continue;
    mapped.push({
      companyId: prodCompanyId,
      roleFamily: r.roleFamily,
      level: r.level,
      expBand: r.expBand,
      currency: r.currency,
      n: r.n,
      tcP25: r.tcP25,
      tcMedian: r.tcMedian,
      tcP75: r.tcP75,
      baseMedian: r.baseMedian,
      expMedian: r.expMedian,
      tcHistogram: r.tcHistogram as object,
    });
  }

  let inserted = 0;
  for (let i = 0; i < mapped.length; i += ROLLUP_BATCH) {
    const chunk = mapped.slice(i, i + ROLLUP_BATCH);
    await db.compRollup.createMany({ data: chunk, skipDuplicates: true });
    inserted += chunk.length;
    console.log(`  Inserted ${inserted}/${mapped.length} rollups`);
  }

  console.log(`  CompRollup synced in ${(performance.now() - start).toFixed(0)}ms`);
}

// ── Phase 5: CompCurve ───────────────────────────────────────────────────────
async function syncCompCurves(companyIdMap: Map<number, number>) {
  console.log('── Phase 5: Syncing CompCurve ──');
  const start = performance.now();

  const curves = await localDb.compCurve.findMany();
  console.log(`  Local curves: ${curves.length}`);

  await db.$executeRawUnsafe(`TRUNCATE TABLE "CompCurve" CASCADE`);

  const mapped: { companyId: number; currency: string; points: object }[] = [];

  for (const c of curves) {
    const prodCompanyId = companyIdMap.get(c.companyId);
    if (!prodCompanyId) continue;
    mapped.push({
      companyId: prodCompanyId,
      currency: c.currency,
      points: c.points as object,
    });
  }

  let inserted = 0;
  for (let i = 0; i < mapped.length; i += CURVE_BATCH) {
    const chunk = mapped.slice(i, i + CURVE_BATCH);
    await db.compCurve.createMany({ data: chunk, skipDuplicates: true });
    inserted += chunk.length;
    console.log(`  Inserted ${inserted}/${mapped.length} curves`);
  }

  console.log(`  CompCurve synced in ${(performance.now() - start).toFixed(0)}ms`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const totalStart = performance.now();
  console.log('Starting interview data sync (local → prod)...');

  // Phase 1: Problems, TopicTags, ProblemTagLinks
  const problemIdMap = await syncProblems();
  const tagIdMap = await syncTopicTags();
  await syncProblemTagLinks(problemIdMap, tagIdMap);

  // Phase 2: Companies (with Sheets) + SheetProblems
  const companyIdMap = await syncCompanies();
  await syncSheetProblems(problemIdMap);

  // Phase 3: CompanyQuestionStat
  await syncQuestionStats(companyIdMap, problemIdMap);

  // Phase 4: CompRollup
  await syncCompRollups(companyIdMap);

  // Phase 5: CompCurve
  await syncCompCurves(companyIdMap);

  // Phase 6: Recompute tiers
  console.log('── Phase 6: Recomputing company tiers ──');
  await recomputeCompanyTiers(db);

  console.log(`\nAll done in ${(performance.now() - totalStart).toFixed(0)}ms`);
}

main()
  .then(async () => {
    await db.$disconnect();
    await localDb.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('Script failed:', e);
    await db.$disconnect();
    await localDb.$disconnect();
    process.exit(1);
  });