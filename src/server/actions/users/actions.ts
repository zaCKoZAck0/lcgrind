"use server";

import { headers } from "next/headers";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { searchMentionUsersCore } from "./core";

export async function searchMentionUsers(prefix: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return [];
    return searchMentionUsersCore(db, prefix);
}
