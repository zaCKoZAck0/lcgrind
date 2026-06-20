import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageSquare, Building2, ChevronLeft } from "lucide-react";
import { headers } from "next/headers";
import { auth, isAdminEmail } from "~/lib/auth";
import { postIdFromParam, postParam } from "~/server/actions/posts/core";
import { getPublicPost } from "~/server/actions/posts/getPost";
import { getPostComments } from "~/server/actions/comments/getComments";
import { renderMarkdown } from "~/utils/markdown";
import { formatMonth } from "~/utils/public-date";
import { CommentSection } from "~/components/discuss/comment-thread";
import { VoteControl } from "~/components/discuss/vote-control";
import { ModerationMenu } from "~/components/discuss/moderation-menu";
import { DiscussionForumPostingJsonLd } from "~/components/seo/json-ld";
import { shouldNoindexPost } from "~/utils/discuss-seo";
import { BASE_URL } from "~/config/constants";
import { FEATURE_FLAGS } from "~/config/feature-flags";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";

const monthLabel = formatMonth;

export async function generateMetadata({
    params,
}: {
    params: Promise<{ idSlug: string }>;
}): Promise<Metadata> {
    const { idSlug } = await params;
    const post = await getPublicPost(postIdFromParam(idSlug));
    if (!post) return { title: "Post not found" };
    const canonical = `${BASE_URL}/discuss/${postParam(post.id, post.title)}`;
    return {
        title: post.title,
        description: post.body.slice(0, 160),
        alternates: { canonical },
        ...(shouldNoindexPost(post)
            ? { robots: { index: false, follow: true } }
            : {}),
    };
}

export default async function DiscussPostPage({
    params,
}: {
    params: Promise<{ idSlug: string }>;
}) {
    if (!FEATURE_FLAGS.DISCUSS) notFound();
    const { idSlug } = await params;
    const session = FEATURE_FLAGS.LOGIN ? await auth.api.getSession({ headers: await headers() }) : null;
    const viewerId = session?.user.id;
    const isAdmin = isAdminEmail(session?.user.email);

    const post = await getPublicPost(postIdFromParam(idSlug), viewerId);
    if (!post) notFound();

    const comments = await getPostComments(post.id, viewerId);
    const author = post.author?.handle ? `@${post.author.handle}` : "Anonymous";
    const param = postParam(post.id, post.title);

    const emitForumJsonLd = post.type === "EXPERIENCE" || post.type === null;

    return (
        <article className="w-full max-w-[800px] py-6 px-4 mx-auto">
            {emitForumJsonLd && (
                <DiscussionForumPostingJsonLd
                    url={`${BASE_URL}/discuss/${param}`}
                    title={post.title}
                    body={post.body}
                    authorName={post.author?.handle ?? null}
                    createdMonth={post.createdMonth}
                    editedMonth={post.editedMonth}
                    score={post.score}
                    commentCount={post.commentCount}
                />
            )}
            <Link
                href="/discuss"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
                <ChevronLeft className="size-4" />
                Discuss
            </Link>

            <Card className="gap-0 py-0">
                <header className="p-4 border-b-2 border-border flex flex-col gap-3">
                    <h1 className="font-bold text-2xl leading-tight">{post.title}</h1>
                    <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
                        {post.author ? (
                            <Link
                                href={`/u/${post.author.handle}`}
                                className="font-semibold text-foreground hover:underline underline-offset-2"
                            >
                                {author}
                            </Link>
                        ) : (
                            <span className="font-semibold text-foreground">{author}</span>
                        )}
                        <span>·</span>
                        <span>{monthLabel(post.createdMonth)}</span>
                        {post.editedMonth && post.editedMonth !== post.createdMonth && (
                            <span className="italic">
                                edited {monthLabel(post.editedMonth)}
                            </span>
                        )}
                        {post.company && (
                            <Badge asChild variant="neutral">
                                <Link href={`/companies/${post.company.slug}`}>
                                    <Building2 className="size-3.5" />
                                    {post.company.name}
                                </Link>
                            </Badge>
                        )}
                    </div>
                </header>

                <div
                    className="markdown-body p-4 break-words text-[15px] leading-relaxed [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-bold [&_h3]:font-semibold [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2 [&_code]:rounded-base [&_code]:bg-secondary-background [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:border-2 [&_pre]:border-border [&_pre]:bg-secondary-background [&_pre]:p-3 [&_pre>code]:bg-transparent [&_pre>code]:p-0 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }}
                />

                <footer className="p-4 border-t-2 border-border flex items-center gap-4 text-sm text-muted-foreground">
                    <VoteControl
                        targetType="POST"
                        targetId={post.id}
                        postParam={param}
                        score={post.score}
                        myVote={post.myVote}
                    />
                    <span className="inline-flex items-center gap-1">
                        <MessageSquare className="size-4" />
                        {post.commentCount}
                    </span>
                    <div className="ml-auto">
                        <ModerationMenu
                            targetType="POST"
                            targetId={post.id}
                            postParam={param}
                            canReport={Boolean(session)}
                            isAdmin={isAdmin}
                        />
                    </div>
                </footer>
            </Card>

            <CommentSection
                postId={post.id}
                postParam={param}
                comments={comments}
                canComment={Boolean(session)}
                isAdmin={isAdmin}
            />
        </article>
    );
}
