import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { PenSquare } from "lucide-react";
import { auth } from "~/lib/auth";
import { ComposeForm } from "~/components/discuss/compose-form";
import { SignInCard } from "~/components/auth/sign-in-card";
import { Card } from "~/components/ui/card";
import { FEATURE_FLAGS } from "~/config/feature-flags";

export const metadata: Metadata = {
    title: "Share your interview experience",
    description:
        "Post your interview rounds, questions, and offer to help others prepare.",
    robots: { index: false },
};

export default async function DiscussNewPage({
    searchParams,
}: {
    searchParams: Promise<{ company?: string; experience?: string }>;
}) {
    if (!FEATURE_FLAGS.DISCUSS || !FEATURE_FLAGS.LOGIN) notFound();
    const { company, experience } = await searchParams;
    const session = await auth.api.getSession({ headers: await headers() });

    const initialIsExperience = experience === "true";
    const initialCompany = company?.trim() ?? "";

    return (
        <div className="w-full max-w-[800px] py-6 px-4 mx-auto">
            <Card className="mb-8 p-0 gap-0 overflow-hidden">
                <div className="p-3 border-b-2 border-border bg-card flex items-center gap-2">
                    <PenSquare className="size-5" />
                    <h1 className="font-bold text-xl">
                        {initialIsExperience
                            ? "Share your interview experience"
                            : "New post"}
                    </h1>
                </div>
                <div className="p-4 bg-card text-sm text-muted-foreground">
                    Your post goes live immediately under your handle (or
                    anonymously). Experience posts also help build the company
                    prep guides.
                </div>
            </Card>

            {session ? (
                <ComposeForm
                    initialIsExperience={initialIsExperience}
                    initialCompany={initialCompany}
                />
            ) : (
                <SignInCard message="Sign in to post." />
            )}
        </div>
    );
}
