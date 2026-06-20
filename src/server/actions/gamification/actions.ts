"use server";

import { headers } from "next/headers";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";

export async function getMyPoints(): Promise<number> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return 0;
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { points: true },
    });
    return user?.points ?? 0;
}
