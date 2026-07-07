import type { PrismaClient } from "@prisma/client";

/**
 * Delete read notifications older than 30 days.
 * Returns the count of deleted rows.
 */
export async function deleteOldReadNotifications(db: PrismaClient): Promise<number> {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 30);

    const result = await db.notification.deleteMany({
        where: { read: true, createdAt: { lt: threshold } },
    });

    return result.count;
}
