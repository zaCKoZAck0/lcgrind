/**
 * One-time backfill: autogenerate a unique handle for every existing user that
 * doesn't have one yet. Run manually from the project root:
 *
 *   DATABASE_URL=<prod> npx tsx prisma/scripts/backfillHandles.ts
 *
 * Leaves `onboardedAt` null so these users will see the profile-setup popup on
 * their next login and can confirm / change the auto-generated handle.
 */
import { PrismaClient } from "@prisma/client";
import { generateHandle } from "../../src/server/actions/discuss/handle";

const db = new PrismaClient();

async function main() {
    const users = await db.user.findMany({
        where: { handle: null },
        select: { id: true, name: true, email: true },
    });

    console.log(`Backfilling handles for ${users.length} user(s)…`);

    for (const user of users) {
        const seed = user.name ?? user.email;
        const handle = await generateHandle(db, seed);
        await db.user.update({
            where: { id: user.id },
            data: { handle },
        });
        console.log(`  ${user.id} → @${handle}`);
    }

    console.log("Done.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => db.$disconnect());
