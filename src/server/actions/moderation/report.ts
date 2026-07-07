"use server";

import { headers } from "next/headers";

import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import {
    reportContentCore,
    type ReportResult,
    type ReportTargetType,
} from "./core";

// Session-gated report. Writes an OPEN Report row that lands in the admin queue.
// Nothing public changes until an admin acts.
export async function reportContent(input: {
    targetType: ReportTargetType;
    targetId: string;
    reason: string;
}): Promise<ReportResult> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { ok: false, error: "Sign in to report" };

    return reportContentCore(db, session.user.id, input);
}
