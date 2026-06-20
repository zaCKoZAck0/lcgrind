import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
    const url = process.env.DATABASE_URL ?? "";
    const separator = url.includes("?") ? "&" : "?";
    // During `next build` (phase-production-build) raise the pool so the
    // SSG worker-threads can pipeline queries without serialising through 3
    // connections. Keep 3 at runtime to stay within serverless slot limits.
    const isBuild = process.env.NEXT_PHASE === "phase-production-build";
    const limit = isBuild
        ? (process.env.BUILD_DB_CONNECTION_LIMIT ?? "15")
        : "3";
    return new PrismaClient({
        datasourceUrl: `${url}${separator}connection_limit=${limit}`,
    });
}

export const db = globalForPrisma.prisma || createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
