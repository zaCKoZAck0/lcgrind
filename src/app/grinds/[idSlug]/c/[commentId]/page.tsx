import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { BackLink } from "~/components/grinds/back-link";

import { auth } from "~/lib/auth";
import { postIdFromParam, postParam } from "~/server/actions/posts/core";
import { getPublicPost } from "~/server/actions/posts/getPost";
import { getPostCommentSubtree } from "~/server/actions/comments/getComments";
import { CommentSection } from "~/components/grinds/comment-thread";
import { FEATURE_FLAGS } from "~/config/feature-flags";

export const metadata: Metadata = { robots: { index: false, follow: true } };

// "Continue thread" view: the post's comment tree re-rooted at one comment so the
// deeper replies the capped main view hid render in full. noindex (the canonical
// post page already carries the thread for SEO); follow so crawlers still reach
// the comments.
export default async function ContinueThreadPage({
    params,
}: {
    params: Promise<{ idSlug: string; commentId: string }>;
}) {
    if (!FEATURE_FLAGS.GRINDS) notFound();
    const { idSlug, commentId } = await params;
    const session = FEATURE_FLAGS.LOGIN ? await auth.api.getSession({ headers: await headers() }) : null;
    const viewerId = session?.user.id;

    const post = await getPublicPost(postIdFromParam(idSlug), viewerId);
    if (!post) notFound();

    const subtree = await getPostCommentSubtree(post.id, commentId, viewerId);
    if (subtree.length === 0) notFound();

    const param = postParam(post.id, post.title);

    return (
        <article className="w-full max-w-[800px] py-6 px-4 mx-auto">
            <BackLink href={`/grinds/${param}`} label="Back to thread" />

            <h1 className="font-bold text-xl leading-tight mb-2">{post.title}</h1>

            <CommentSection
                postId={post.id}
                postParam={param}
                comments={subtree}
                canComment={Boolean(session)}
                heading="Continued thread"
            />
        </article>
    );
}
