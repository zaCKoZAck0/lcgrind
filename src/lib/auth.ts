import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "~/lib/db";
import { generateHandle } from "~/server/actions/grinds/handle";

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: "postgresql",
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    // Autogenerate a unique handle for every new user so the profile is always
    // reachable at /u/[handle] from the moment the account is created.
    // onboardedAt stays null so the profile-setup popup auto-opens after login.
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    const handle = await generateHandle(db, user.name ?? user.email);
                    return { data: { ...user, handle } };
                },
            },
        },
    },
});

export function isAdminEmail(email: string | null | undefined): boolean {
    if (!email) return false;
    return (process.env.ADMIN_EMAILS ?? "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
        .includes(email.toLowerCase());
}
