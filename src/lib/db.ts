import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
    const url = process.env.DATABASE_URL ?? "";
    const separator = url.includes("?") ? "&" : "?";
    return new PrismaClient({
        datasourceUrl: `${url}${separator}connection_limit=3`,
    });
}

export const db = globalForPrisma.prisma || createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
