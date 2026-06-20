"use server";

import { headers } from "next/headers";
import { auth, isAdminEmail } from "~/lib/auth";
import { db } from "~/lib/db";

export async function resolveCompanyByName(
    name: string,
): Promise<{ id: number; name: string } | null> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !isAdminEmail(session.user.email)) return null;

    const q = name.trim();
    if (q.length === 0) return null;
    const company = await db.company.findFirst({
        where: { name: { equals: q, mode: "insensitive" } },
        select: { id: true, name: true },
    });
    return company;
}
