import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { auth } from "~/lib/auth";
import { postIdFromParam, postParam } from "~/server/actions/posts/core";
import { getPostForEdit } from "~/server/actions/posts/getPostForEdit";
import { EditPostForm } from "~/components/grinds/edit-form";
import { GrindsPageHeader } from "~/components/grinds/page-header";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { FEATURE_FLAGS } from "~/config/feature-flags";

export const metadata: Metadata = {
    title: "Edit Post — Grinds",
    robots: { index: false },
};

export default async function EditPostPage({
    params,
}: {
    params: Promise<{ idSlug: string }>;
}) {
    if (!FEATURE_FLAGS.GRINDS || !FEATURE_FLAGS.LOGIN) notFound();

    const { idSlug } = await params;
    const postId = postIdFromParam(idSlug);

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect(`/grinds/${idSlug}`);

    const data = await getPostForEdit(postId);
    if (!data.ok) redirect(`/grinds/${idSlug}`);

    const param = postParam(postId, data.title);

    return (
        <div className="w-full max-w-[800px] py-6 px-4 mx-auto">
            <div className="flex items-center gap-3 mb-4">
                <Link
                    href={`/grinds/${param}`}
                    aria-label="Back to post"
                    className={cn(buttonVariants({ variant: "neutral", size: "icon" }))}
                >
                    <ArrowLeft className="size-4" />
                </Link>
            </div>
            <GrindsPageHeader title="Edit Post" />
            <EditPostForm
                postId={postId}
                postParam={param}
                initialTitle={data.title}
                mode={data.mode}
                initialExperiences={data.experiences}
                initialBody={data.body}
            />
        </div>
    );
}
