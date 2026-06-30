import type { Metadata } from "next";
import { headers } from "next/headers";
import { permanentRedirect, notFound } from "next/navigation";
import { MessageSquarePlus } from "lucide-react";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { remainingQuota } from "~/server/actions/submissions/core";
import {
    ShareExperienceForm,
    type SubmissionEdit,
} from "~/components/submissions/share-experience-form";
import { SignInCard } from "~/components/auth/sign-in-card";
import { Card } from "~/components/ui/card";
import { FEATURE_FLAGS } from "~/config/feature-flags";

export const metadata: Metadata = {
    title: "Share Your Interview Experience",
    description:
        "Help others prepare: share your interview rounds, questions, and compensation. Reviewed before publishing.",
    robots: { index: false },
};

export default async function ShareExperiencePage({
    searchParams,
}: {
    searchParams: Promise<{ company?: string; edit?: string }>;
}) {
    if (!FEATURE_FLAGS.LOGIN) notFound();
    const { company, edit: editId } = await searchParams;

    // Compose folded into /discuss/new. Old create bookmarks (and the company
    // CTA) permanently redirect to the unified composer with Experience preset;
    // the private edit flow still lives here until the /u/[handle] manage split.
    if (!editId) {
        if (FEATURE_FLAGS.GRINDS) {
            const params = new URLSearchParams({ experience: "true" });
            if (company?.trim()) params.set("company", company.trim());
            permanentRedirect(`/grinds/new?${params.toString()}`);
        }
        // Fall through to the standalone form when discuss is off.
    }

    const session = await auth.api.getSession({ headers: await headers() });

    let edit: SubmissionEdit | undefined;
    let editCompany: string | undefined;
    if (session && editId) {
        const existing = await db.submission.findUnique({
            where: { id: editId },
            select: {
                id: true,
                userId: true,
                companyName: true,
                mode: true,
                rawText: true,
                structured: true,
            },
        });
        // Author-only: silently ignore an edit target that isn't theirs.
        if (existing && existing.userId === session.user.id) {
            edit = {
                id: existing.id,
                mode: existing.mode === "FORM" ? "FORM" : "TEXT",
                rawText: existing.rawText ?? undefined,
                structured: existing.structured as SubmissionEdit["structured"],
            };
            editCompany = existing.companyName;
        }
    }

    return (
        <div className="w-full max-w-[800px] py-6 px-4 mx-auto">
            <Card className="mb-8 p-0 gap-0 overflow-hidden">
                <div className="p-3 border-b-2 border-border bg-card flex items-center gap-2">
                    <MessageSquarePlus className="size-5" />
                    <h1 className="font-bold text-xl">Share your interview experience</h1>
                </div>
                <div className="p-4 bg-card text-sm text-muted-foreground">
                    Tell others what to expect: rounds, questions, and (optionally)
                    the offer. Submissions are reviewed before anything appears on a
                    company page.
                </div>
            </Card>

            {session ? (
                <ShareExperienceForm
                    initialCompany={editCompany ?? company?.trim() ?? ""}
                    remaining={await remainingQuota(db, session.user.id)}
                    edit={edit}
                />
            ) : (
                <SignInCard message="Sign in to share your interview experience." />
            )}
        </div>
    );
}
