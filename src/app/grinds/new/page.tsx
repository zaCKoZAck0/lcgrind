import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "~/lib/auth";
import { ComposeForm } from "~/components/grinds/compose-form";
import { SignInCard } from "~/components/auth/sign-in-card";
import { Badge } from "~/components/ui/badge";
import { GrindsPageHeader } from "~/components/grinds/page-header";
import { FEATURE_FLAGS } from "~/config/feature-flags";

export const metadata: Metadata = {
    title: "New Post — Grinds",
    description: "Share a post, question, or interview experience with the community.",
    robots: { index: false },
};

export default async function GrindsNewPage({
    searchParams,
}: {
    searchParams: Promise<{ company?: string; experience?: string }>;
}) {
    if (!FEATURE_FLAGS.GRINDS || !FEATURE_FLAGS.LOGIN) notFound();
    const { company, experience } = await searchParams;
    const session = await auth.api.getSession({ headers: await headers() });

    const initialIsExperience = experience === "true";
    const initialCompany = company?.trim() ?? "";

    return (
        <div className="w-full max-w-[800px] py-6 px-4 mx-auto">
            <GrindsPageHeader
                title={
                    <span className="flex items-center gap-2">
                        New Post
                        <Badge variant="neutral" className="text-[10px] px-1.5 py-0 h-4">Beta</Badge>
                    </span>
                }
            />

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
