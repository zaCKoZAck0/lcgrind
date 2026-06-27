"use server";

import { headers } from "next/headers";
import { Prisma, type PrismaClient } from "@prisma/client";

import { HANDLE_RE } from "~/config/grinds";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProfileStatus = {
    name: string;
    email: string;
    handle: string;
    onboarded: boolean;
};

export type UpdateProfileInput = {
    name: string;
    handle: string;
};

export type UpdateProfileResult =
    | { ok: true }
    | { ok: false; error: string };

// ---------------------------------------------------------------------------
// Core (db-injectable for tests)
// ---------------------------------------------------------------------------

// Updates the user's name and handle, then marks them as onboarded.
// Returns { ok: false, error } on validation or uniqueness failure.
export async function updateProfile(
    dbClient: PrismaClient,
    userId: string,
    input: UpdateProfileInput,
): Promise<UpdateProfileResult> {
    const name = input.name.trim();
    const handle = input.handle.trim().toLowerCase();

    if (!name) {
        return { ok: false, error: "Name cannot be empty" };
    }

    if (!HANDLE_RE.test(handle)) {
        return {
            ok: false,
            error: "Handle must be 3-20 characters: lowercase letters, digits, or underscores, starting with a letter",
        };
    }

    try {
        await dbClient.user.update({
            where: { id: userId },
            data: { name, handle, onboardedAt: new Date() },
        });
        return { ok: true };
    } catch (e) {
        if (
            e instanceof Prisma.PrismaClientKnownRequestError &&
            e.code === "P2002"
        ) {
            return { ok: false, error: "That handle is already taken" };
        }
        throw e;
    }
}

// ---------------------------------------------------------------------------
// Session-gated server actions (called from client components)
// ---------------------------------------------------------------------------

// Returns the current user's profile status for the onboarding popup.
// Throws when not authenticated.
export async function getMyProfileStatus(): Promise<ProfileStatus> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Not authenticated");

    const user = await db.user.findUniqueOrThrow({
        where: { id: session.user.id },
        select: { name: true, email: true, handle: true, onboardedAt: true },
    });

    return {
        name: user.name,
        email: user.email,
        handle: user.handle ?? "",
        onboarded: user.onboardedAt !== null,
    };
}

// Session-gated wrapper around updateProfile for client component use.
export async function updateMyProfile(
    input: UpdateProfileInput,
): Promise<UpdateProfileResult> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { ok: false, error: "Not authenticated" };
    return updateProfile(db, session.user.id, input);
}
