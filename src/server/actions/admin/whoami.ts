"use server";

import { headers } from "next/headers";
import { auth, isAdminEmail } from "~/lib/auth";

export async function isCurrentUserAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await headers() });
    return isAdminEmail(session?.user.email);
}
