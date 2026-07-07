import { timingSafeEqual } from "crypto";

import { db } from "~/lib/db";
import { deleteOldReadNotifications } from "~/server/notifications/cleanup";

export async function GET(req: Request): Promise<Response> {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
        return new Response("Forbidden", { status: 401 });
    }

    const authHeader = req.headers.get("authorization") ?? "";
    const expected = `Bearer ${cronSecret}`;

    if (authHeader.length !== expected.length) {
        return new Response("Forbidden", { status: 401 });
    }

    if (!timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))) {
        return new Response("Forbidden", { status: 401 });
    }

    const deleted = await deleteOldReadNotifications(db);
    return Response.json({ deleted });
}
