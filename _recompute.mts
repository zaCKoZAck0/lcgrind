import { PrismaClient } from "@prisma/client";
import { recomputeCompanyTiers } from "~/server/recompute-tiers";

const db = new PrismaClient();
await recomputeCompanyTiers(db);
console.log("done");
await db.$disconnect();
