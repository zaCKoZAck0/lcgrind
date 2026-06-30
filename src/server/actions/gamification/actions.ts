"use server";

import { headers } from "next/headers";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { creditDailyLogin } from "./core";

export async function getMyExp(): Promise<number> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return 0;
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { exp: true },
    });
    return user?.exp ?? 0;
}

export type GameStats = {
    exp: number;
    loginStreak: number;
    longestStreak: number;
    lastSeenOn: string | null;
};

export async function creditMyDailyLogin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return false;
    return creditDailyLogin(db, session.user.id);
}

export async function getMyGameStats(): Promise<GameStats> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { exp: 0, loginStreak: 0, longestStreak: 0, lastSeenOn: null };

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { exp: true, loginStreak: true, longestStreak: true, lastSeenOn: true },
    });
    return {
        exp: user?.exp ?? 0,
        loginStreak: user?.loginStreak ?? 0,
        longestStreak: user?.longestStreak ?? 0,
        lastSeenOn: user?.lastSeenOn ?? null,
    };
}
