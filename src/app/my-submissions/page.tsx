import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, MessageSquarePlus, Pencil, UserRound } from "lucide-react";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { buttonVariants } from "~/components/ui/button";
import { SignInCard } from "~/components/auth/sign-in-card";
import { FEATURE_FLAGS } from "~/config/feature-flags";

export const metadata: Metadata = {
    title: "My Submissions",
    description: "Your shared interview experiences and their review status.",
    robots: { index: false },
};

const STATUS_STYLES: Record<string, string> = {
    PENDING: "bg-secondary-background text-foreground",
    PARSED: "bg-main text-main-foreground",
    APPROVED: "bg-green-300 text-black",
    REJECTED: "bg-red-300 text-black",
};

const STATUS_LABELS: Record<string, string> = {
    PENDING: "Pending review",
    PARSED: "Parsed",
    APPROVED: "Approved",
    REJECTED: "Rejected",
};

export default async function MySubmissionsPage() {
    if (!FEATURE_FLAGS.DISCUSS) notFound();
    if (!FEATURE_FLAGS.LOGIN) notFound();
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
        return (
            <div className="w-full max-w-[800px] py-6 px-4 mx-auto">
                <SignInCard message="Sign in to see your submissions." />
            </div>
        );
    }

    const [submissions, profile] = await Promise.all([
        db.submission.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                companyName: true,
                mode: true,
                rawText: true,
                structured: true,
                status: true,
                adminNote: true,
                createdAt: true,
            },
        }),
        db.user.findUnique({
            where: { id: session.user.id },
            select: { handle: true },
        }),
    ]);

    const handle = profile?.handle;

    return (
        <div className="w-full max-w-[800px] py-6 px-4 mx-auto">
            <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
                <Card className="flex-row items-center p-3 gap-2 shadow-none">
                    <FileText className="size-5" />
                    <h1 className="font-bold text-xl">My submissions</h1>
                </Card>
                <div className="flex items-center gap-2 flex-wrap">
                    {FEATURE_FLAGS.DISCUSS && handle && (
                        <Link
                            href={`/u/${handle}`}
                            className={buttonVariants({ variant: "neutral" })}
                        >
                            <UserRound className="size-4" />
                            View public profile
                        </Link>
                    )}
                    {FEATURE_FLAGS.DISCUSS && (
                        <Link
                            href="/discuss/new?experience=true"
                            className={buttonVariants()}
                        >
                            <MessageSquarePlus className="size-4" />
                            Share an experience
                        </Link>
                    )}
                </div>
            </div>

            {submissions.length === 0 ? (
                <Card className="p-10 items-center gap-3 text-center">
                    <MessageSquarePlus className="size-10 text-muted-foreground/50" />
                    <h2 className="font-semibold text-xl">Nothing shared yet</h2>
                    <p className="text-muted-foreground/70 max-w-[480px]">
                        Interviewed somewhere recently? Your experience helps
                        everyone prepare better.
                    </p>
                </Card>
            ) : (
                <div className="flex flex-col">
                    {submissions.map((s) => {
                        const structured = s.structured as { role?: string } | null;
                        const preview =
                            s.mode === "TEXT"
                                ? (s.rawText ?? "").slice(0, 180)
                                : `Structured report${structured?.role ? ` — ${structured.role}` : ""}`;
                        return (
                            <div
                                key={s.id}
                                className="border-2 border-border border-b-0 last:border-b-2 bg-card p-4 flex flex-col gap-2"
                            >
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                    <span className="font-semibold">{s.companyName}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-muted-foreground">
                                            {s.createdAt.toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </span>
                                        <Badge className={STATUS_STYLES[s.status] ?? ""}>
                                            {STATUS_LABELS[s.status] ?? s.status}
                                        </Badge>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {preview}
                                </p>
                                {s.adminNote && (
                                    <p className="text-xs text-muted-foreground border-l-2 border-border pl-2">
                                        Reviewer note: {s.adminNote}
                                    </p>
                                )}
                                <Link
                                    href={`/share-experience?edit=${s.id}`}
                                    className={buttonVariants({
                                        variant: "neutral",
                                        size: "sm",
                                    }).concat(" self-start")}
                                >
                                    <Pencil className="size-3.5" />
                                    Edit
                                </Link>
                                {s.status === "APPROVED" && (
                                    <span className="text-[11px] text-muted-foreground/70">
                                        Editing reopens this for review and removes it from the
                                        company page until re-approved.
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
