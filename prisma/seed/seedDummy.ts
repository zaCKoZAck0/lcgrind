import { db } from "~/lib/db";
import { faker } from "@faker-js/faker";
import { seedPostTags } from "~/server/actions/grinds/tags";

const USER_COUNT = 100;
const COMPANY_COUNT = 20;
const CURATED_SHEET_COUNT = 5;
const POST_COUNT = 80;
const COMMENT_COUNT = 150;
const VOTE_COUNT = 300;
const SUBMISSION_COUNT = 60;
const NOTIFICATION_COUNT = 100;
const BADGE_COUNT = 150;
const LEDGER_COUNT = 200;

const BANDS = ["NG", "PE", "Staff", "Principal"];
const TYPES = ["DSA", "SYSTEM_DESIGN", "BEHAVIORAL", "OOD"];
const KINDS = ["ONSITE", "PHONE", "TAKE_HOME"];
const ROLE_FAMILIES = ["SWE", "MLE", "PM", "DE", "DS"];
const LEVELS = ["L3", "L4", "L5", "L6", "E5", "E6", "ICT3", "ICT4"];
const EXP_BANDS = ["0-2", "3-5", "5-10", "10+"];
const CURRENCIES = ["USD"];
const NOTIFICATION_TYPES = ["REPLY_POST", "REPLY_COMMENT", "MENTION", "BADGE"];
const BADGE_NAMES = [
    "early-adopter",
    "top-contributor",
    "100-posts",
    "helpful",
    "verified",
    "senior-engineer",
    "bug-hunter",
    "mentor",
    "first-post",
    "popular-discussion",
    "interview-veteran",
    "community-leader",
];
const CURATED_SHEET_DEFS = [
    { slug: "blind-75", name: "Blind 75", ownerName: "Tech Interview Handbook", website: "https://techinterviewhandbook.org/" },
    { slug: "grind-75", name: "Grind 75", ownerName: "Tech Interview Handbook", website: "https://techinterviewhandbook.org/" },
    { slug: "neetcode-150", name: "NeetCode 150", ownerName: "NeetCode", website: "https://neetcode.io/" },
    { slug: "top-interview-150", name: "Top Interview 150", ownerName: "LeetCode", website: "https://leetcode.com/" },
    { slug: "top-100-liked", name: "Top 100 Liked", ownerName: "LeetCode", website: "https://leetcode.com/" },
];

function makeHandle(): string {
    let h = faker.internet.username().toLowerCase().replace(/[^a-z0-9_]/g, "_");
    h = h.replace(/^[^a-z]+/, "");
    if (h.length < 3) h = "u" + h + faker.string.alphanumeric({ length: 2 });
    return h.slice(0, 20);
}

function oneOf<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(n, shuffled.length));
}

async function truncateAll() {
    console.log("Truncating target tables...");
    await db.$executeRawUnsafe(`
        TRUNCATE TABLE
            "CommunityQuestionAsk",
            "CommunityCompPoint",
            "PointsLedger",
            "UserBadge",
            "Notification",
            "Vote",
            "Comment",
            "PostTags",
            "PostTag",
            "Post",
            "Submission",
            "CompRollup",
            "CompCurve",
            "CompanyQuestionStat",
            "SheetProblem",
            "Sheet",
            "Company",
            "User",
            "Session",
            "Account",
            "Verification"
        CASCADE
    `);
}

async function seedUsers() {
    console.log(`Seeding ${USER_COUNT} users...`);
    const users = Array.from({ length: USER_COUNT }, () => ({
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        emailVerified: faker.datatype.boolean(),
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${faker.string.alphanumeric(8)}`,
        handle: makeHandle(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${faker.string.alphanumeric(8)}`,
        points: faker.number.int({ min: 0, max: 5000 }),
        karma: faker.number.int({ min: 0, max: 1000 }),
        onboardedAt: faker.date.recent({ days: 60 }),
    }));
    await db.user.createMany({ data: users, skipDuplicates: true });
    return users;
}

async function seedCompanies() {
    console.log(`Seeding ${COMPANY_COUNT} companies...`);
    const companies = [];
    for (let i = 0; i < COMPANY_COUNT; i++) {
        const name = faker.company.name();
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + faker.string.alphanumeric(4);
        const sheet = await db.sheet.create({
            data: {
                slug: `company-${slug}`,
                name: `${name} Interview`,
                description: faker.lorem.sentence(),
                ownerName: name,
                isCompany: true,
            },
        });
        const company = await db.company.create({
            data: {
                slug,
                name,
                reportCount: faker.number.int({ min: 10, max: 500 }),
                lastSeen: faker.date.recent({ days: 365 }).toISOString().slice(0, 7),
                sheetId: sheet.id,
                payTier: faker.number.int({ min: 0, max: 5 }),
                difficultyTier: faker.number.int({ min: 0, max: 5 }),
            },
        });
        companies.push(company);
    }
    return companies;
}

async function seedCuratedSheets() {
    console.log(`Seeding ${CURATED_SHEET_COUNT} curated sheets...`);
    const problems = await db.problem.findMany({ select: { id: true } });
    if (problems.length === 0) {
        console.warn("No problems found — run seed:leetcode first. Skipping SheetProblem links.");
    }

    for (const def of CURATED_SHEET_DEFS) {
        const sheet = await db.sheet.create({
            data: {
                slug: def.slug,
                name: def.name,
                description: `The ${def.name} curated study list.`,
                ownerName: def.ownerName,
                website: def.website,
                isCompany: false,
            },
        });

        if (problems.length > 0) {
            const count = faker.number.int({ min: 50, max: Math.min(150, problems.length) });
            const picked = pickN(problems, count);
            await db.sheetProblem.createMany({
                data: picked.map((p, i) => ({
                    problemId: p.id,
                    sheetId: sheet.id,
                    sheetOrder: i + 1,
                    group: faker.helpers.arrayElement(["Array", "String", "Tree", "DP", "Graph", "Backtracking"]),
                })),
            });
        }
    }
}

async function seedCompanyStats(companies: { id: number }[]) {
    console.log("Seeding company question stats...");
    const problems = await db.problem.findMany({ select: { id: true } });

    const stats: {
        companyId: number; band: string; type: string; kind: string;
        statement: string; problemId: number | null; askCount: number;
        ask30d: number; ask90d: number; ask180d: number; ask365d: number;
    }[] = [];

    for (const c of companies) {
        const count = faker.number.int({ min: 10, max: 40 });
        for (let i = 0; i < count; i++) {
            stats.push({
                companyId: c.id,
                band: oneOf(BANDS),
                type: oneOf(TYPES),
                kind: oneOf(KINDS),
                statement: faker.lorem.sentence(),
                problemId: problems.length > 0 ? oneOf(problems).id : null,
                askCount: faker.number.int({ min: 1, max: 100 }),
                ask30d: faker.number.int({ min: 0, max: 10 }),
                ask90d: faker.number.int({ min: 0, max: 20 }),
                ask180d: faker.number.int({ min: 0, max: 30 }),
                ask365d: faker.number.int({ min: 0, max: 50 }),
            });
        }
    }
    await db.companyQuestionStat.createMany({ data: stats, skipDuplicates: true });
}

async function seedCompData(companies: { id: number }[]) {
    console.log("Seeding comp rollups and curves...");

    for (const c of companies) {
        const rollups = ROLE_FAMILIES.flatMap((rf) =>
            ["L3", "L5"].map((lvl) => ({
                companyId: c.id,
                roleFamily: rf,
                level: lvl,
                expBand: oneOf(EXP_BANDS),
                currency: "USD",
                n: faker.number.int({ min: 5, max: 200 }),
                tcP25: faker.number.int({ min: 80000, max: 120000 }),
                tcMedian: faker.number.int({ min: 120000, max: 200000 }),
                tcP75: faker.number.int({ min: 200000, max: 350000 }),
                baseMedian: faker.number.int({ min: 80000, max: 160000 }),
                expMedian: faker.number.int({ min: 0, max: 100000 }),
                tcHistogram: {},
            }))
        );
        await db.compRollup.createMany({ data: rollups, skipDuplicates: true });

        const curve = {
            companyId: c.id,
            currency: "USD",
            points: Array.from({ length: 10 }, (_, i) => ({
                x: (i + 1) * 2,
                y: faker.number.int({ min: 80000, max: 350000 }),
            })),
        };
        await db.compCurve.create({ data: curve });
    }
}

async function seedSubmissions(users: { id: string }[], companies: { id: number }[]) {
    console.log(`Seeding ${SUBMISSION_COUNT} submissions...`);
    const submissions: {
        id: string; userId: string; companyId: number | null;
        companyName: string; mode: string; rawText: string | null;
        structured: object | null; status: string;
    }[] = [];

    for (let i = 0; i < SUBMISSION_COUNT; i++) {
        const user = oneOf(users);
        const company = faker.datatype.boolean(0.7) ? oneOf(companies) : null;
        const mode = oneOf(["TEXT", "TEXT", "FORM"]);

        submissions.push({
            id: faker.string.uuid(),
            userId: user.id,
            companyId: company?.id ?? null,
            companyName: company?.id ? faker.company.name() : faker.company.name(),
            mode,
            rawText: mode === "TEXT" ? faker.lorem.paragraphs({ min: 2, max: 6 }) : null,
            structured: mode === "FORM" ? {
                role: oneOf(ROLE_FAMILIES),
                level: oneOf(LEVELS),
                questions: Array.from({ length: faker.number.int({ min: 2, max: 6 }) }, () => ({
                    type: oneOf(TYPES),
                    band: oneOf(BANDS),
                    statement: faker.lorem.sentence(),
                })),
                offer: {
                    tc: faker.number.int({ min: 100000, max: 500000 }),
                    base: faker.number.int({ min: 80000, max: 200000 }),
                },
            } : null,
            status: oneOf(["PENDING", "APPROVED", "APPROVED", "REJECTED"]),
        });
    }

    await db.submission.createMany({ data: submissions, skipDuplicates: true });
    return submissions;
}

async function seedCommunityData(
    submissions: { id: string; companyId: number | null; structured: object | null; status: string }[],
    companies: { id: number }[],
) {
    console.log("Seeding community question asks and comp points...");
    const problems = await db.problem.findMany({ select: { id: true } });
    const approved = submissions.filter((s) => s.status === "APPROVED" && s.companyId);

    for (const s of approved) {
        if (s.structured) {
            const data = s.structured as { questions?: { type: string; band: string; statement: string }[]; offer?: { tc: number; base: number } };

            if (data.questions) {
                const asks = data.questions.map((q) => ({
                    companyId: s.companyId!,
                    submissionId: s.id,
                    band: q.band,
                    type: q.type,
                    statement: q.statement,
                    problemId: problems.length > 0 && faker.datatype.boolean(0.4) ? oneOf(problems).id : null,
                }));
                await db.communityQuestionAsk.createMany({ data: asks, skipDuplicates: true });
            }

            if (data.offer) {
                await db.communityCompPoint.create({
                    data: {
                        companyId: s.companyId!,
                        submissionId: s.id,
                        roleFamily: oneOf(ROLE_FAMILIES),
                        level: oneOf(LEVELS),
                        expYears: faker.number.float({ min: 1, max: 15, fractionDigits: 1 }),
                        expBand: oneOf(EXP_BANDS),
                        currency: "USD",
                        base: data.offer.base,
                        tc: data.offer.tc,
                    },
                });
            }
        }
    }

    const textApproved = approved.filter((s) => !s.structured);
    for (const s of textApproved.slice(0, 10)) {
        await db.communityQuestionAsk.create({
            data: {
                companyId: s.companyId!,
                submissionId: s.id,
                band: oneOf(BANDS),
                type: oneOf(TYPES),
                statement: faker.lorem.sentence(),
                problemId: problems.length > 0 && faker.datatype.boolean(0.3) ? oneOf(problems).id : null,
            },
        });
    }
}

async function seedPosts(users: { id: string }[], companies: { id: number }[], submissions: { id: string; status: string }[]) {
    console.log(`Seeding ${POST_COUNT} posts...`);
    await seedPostTags(db);

    const approvedSubmissions = submissions.filter((s) => s.status === "APPROVED");

    for (let i = 0; i < POST_COUNT; i++) {
        const user = oneOf(users);
        const isExperience = i < approvedSubmissions.length && faker.datatype.boolean(0.3);
        const sub = isExperience ? approvedSubmissions[i] : null;
        const title = faker.lorem.sentence({ min: 4, max: 12 });
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) + "-" + faker.string.alphanumeric(6);
        const company = faker.datatype.boolean(0.5) ? oneOf(companies) : null;

        const post = await db.post.create({
            data: {
                type: isExperience ? "EXPERIENCE" : null,
                authorId: user.id,
                companyId: company?.id ?? null,
                title,
                slug,
                body: faker.lorem.paragraphs({ min: 2, max: 5 }),
                isAnonymous: faker.datatype.boolean(0.15),
                score: faker.number.int({ min: -5, max: 50 }),
                upCount: faker.number.int({ min: 0, max: 30 }),
                downCount: faker.number.int({ min: 0, max: 5 }),
                hotRank: faker.number.float({ min: 0, max: 100 }),
                commentCount: faker.number.int({ min: 0, max: 20 }),
                status: oneOf(["PUBLISHED", "PUBLISHED", "PUBLISHED", "TOMBSTONED"]),
                createdAt: faker.date.recent({ days: 90 }),
            },
        });

        if (sub) {
            await db.submission.update({
                where: { id: sub.id },
                data: { postId: post.id },
            });
        }

        const tagSlugs = pickN(
            ["system-design", "dsa", "behavioral", "oa", "negotiation", "offer", "referral", "resume", "general"],
            faker.number.int({ min: 1, max: 3 }),
        );
        for (const slug of tagSlugs) {
            const tag = await db.postTag.findUnique({ where: { slug } });
            if (tag) {
                await db.postTags.create({
                    data: { postId: post.id, tagId: tag.id },
                });
            }
        }
    }
}

async function seedComments(users: { id: string }[]) {
    console.log(`Seeding ${COMMENT_COUNT} comments...`);
    const posts = await db.post.findMany({ select: { id: true, authorId: true }, where: { status: "PUBLISHED" } });
    if (posts.length === 0) return;

    const comments: {
        id: string; postId: string; parentId: string | null; rootId: string | null;
        depth: number; authorId: string; body: string; isAnonymous: boolean;
        status: string; score: number; upCount: number; downCount: number;
        createdAt: Date;
    }[] = [];

    for (let i = 0; i < COMMENT_COUNT; i++) {
        const user = oneOf(users);
        const post = oneOf(posts);
        comments.push({
            id: faker.string.uuid(),
            postId: post.id,
            parentId: null,
            rootId: null,
            depth: 0,
            authorId: user.id,
            body: faker.lorem.paragraph(),
            isAnonymous: faker.datatype.boolean(0.1),
            status: oneOf(["PUBLISHED", "PUBLISHED", "PUBLISHED", "TOMBSTONED"]),
            score: faker.number.int({ min: -2, max: 20 }),
            upCount: faker.number.int({ min: 0, max: 15 }),
            downCount: faker.number.int({ min: 0, max: 3 }),
            createdAt: faker.date.recent({ days: 60 }),
        });
    }

    await db.comment.createMany({ data: comments, skipDuplicates: true });

    const created = await db.comment.findMany({ select: { id: true, postId: true }, where: { parentId: null } });
    const replies = created.slice(0, Math.floor(created.length * 0.3));
    for (const parent of replies) {
        const replyCount = faker.number.int({ min: 1, max: 3 });
        for (let j = 0; j < replyCount; j++) {
            const user = oneOf(users);
            await db.comment.create({
                data: {
                    postId: parent.postId,
                    parentId: parent.id,
                    rootId: parent.id,
                    depth: 1,
                    authorId: user.id,
                    body: faker.lorem.sentence(),
                    isAnonymous: faker.datatype.boolean(0.1),
                    status: "PUBLISHED",
                    score: faker.number.int({ min: 0, max: 10 }),
                    upCount: faker.number.int({ min: 0, max: 8 }),
                    downCount: faker.number.int({ min: 0, max: 2 }),
                    createdAt: faker.date.recent({ days: 30 }),
                },
            });
        }
    }
}

async function seedVotes(users: { id: string }[]) {
    console.log(`Seeding ${VOTE_COUNT} votes...`);
    const posts = await db.post.findMany({ select: { id: true } });
    const comments = await db.comment.findMany({ select: { id: true } });
    const targets: { type: string; id: string }[] = [
        ...posts.map((p) => ({ type: "POST" as const, id: p.id })),
        ...comments.map((c) => ({ type: "COMMENT" as const, id: c.id })),
    ];
    if (targets.length === 0) return;

    const seen = new Set<string>();
    const votes: {
        userId: string; targetType: string; targetId: string; value: number;
    }[] = [];

    for (let i = 0; i < VOTE_COUNT; i++) {
        const user = oneOf(users);
        const target = oneOf(targets);
        const key = `${user.id}:${target.type}:${target.id}`;
        if (seen.has(key)) continue;
        seen.add(key);

        votes.push({
            userId: user.id,
            targetType: target.type,
            targetId: target.id,
            value: faker.datatype.boolean(0.8) ? 1 : -1,
        });
    }

    if (votes.length > 0) {
        await db.vote.createMany({ data: votes, skipDuplicates: true });
    }
}

async function seedNotifications(users: { id: string }[]) {
    console.log(`Seeding ${NOTIFICATION_COUNT} notifications...`);
    const posts = await db.post.findMany({ select: { id: true } });
    const comments = await db.comment.findMany({ select: { id: true } });

    const notifications = Array.from({ length: NOTIFICATION_COUNT }, () => {
        const type = oneOf(NOTIFICATION_TYPES);
        const post = faker.datatype.boolean(0.7) ? oneOf(posts) : null;
        const comment = type === "REPLY_COMMENT" && comments.length > 0 ? oneOf(comments) : null;

        return {
            userId: oneOf(users).id,
            type,
            actorId: faker.datatype.boolean(0.8) ? oneOf(users).id : null,
            postId: post?.id ?? null,
            commentId: comment?.id ?? null,
            read: faker.datatype.boolean(0.6),
            createdAt: faker.date.recent({ days: 30 }),
        };
    });

    await db.notification.createMany({ data: notifications, skipDuplicates: true });
}

async function seedBadges(users: { id: string }[]) {
    console.log(`Seeding ${BADGE_COUNT} badges...`);
    const badges = Array.from({ length: BADGE_COUNT }, () => ({
        userId: oneOf(users).id,
        badge: oneOf(BADGE_NAMES),
        awardedAt: faker.date.recent({ days: 180 }),
    }));

    await db.userBadge.createMany({ data: badges, skipDuplicates: true });
}

async function seedLedger(users: { id: string }[]) {
    console.log(`Seeding ${LEDGER_COUNT} ledger entries...`);
    const submissions = await db.submission.findMany({ select: { id: true } });
    if (submissions.length === 0) return;

    const entries = Array.from({ length: LEDGER_COUNT }, () => ({
        userId: oneOf(users).id,
        submissionId: oneOf(submissions).id,
        delta: faker.helpers.arrayElement([10, 25, 50, 100, -10, -25]),
        reason: oneOf(["post_created", "comment_received_upvote", "submission_approved", "daily_bonus", "admin_adjustment"]),
        createdAt: faker.date.recent({ days: 60 }),
    }));

    await db.pointsLedger.createMany({ data: entries, skipDuplicates: true });
}

async function main() {
    const reset = process.argv.includes("--reset");
    if (reset) {
        await truncateAll();
    }
    const users = await seedUsers();
    const companies = await seedCompanies();
    await seedCuratedSheets();
    await seedCompanyStats(companies);
    await seedCompData(companies);
    const submissions = await seedSubmissions(users, companies);
    await seedCommunityData(submissions, companies);
    await seedPosts(users, companies, submissions);
    await seedComments(users);
    await seedVotes(users);
    await seedNotifications(users);
    await seedBadges(users);
    await seedLedger(users);
    console.log("Dummy data seeded successfully!");
}

main()
    .then(async () => {
        await db.$disconnect();
        process.exit(0);
    })
    .catch(async (e) => {
        console.error(e);
        await db.$disconnect();
        process.exit(1);
    });
