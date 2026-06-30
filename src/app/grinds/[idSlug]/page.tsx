import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageSquare, ArrowLeft, Pin, Building2 } from "lucide-react";
import { headers } from "next/headers";
import { auth, isAdminEmail } from "~/lib/auth";
import { getUserRole, canPin } from "~/lib/rbac";
import { postIdFromParam, postParam } from "~/server/actions/posts/core";
import { getPublicPost, getPostExperienceCompanies } from "~/server/actions/posts/getPost";
import { getPostComments } from "~/server/actions/comments/getComments";
import { renderMarkdown } from "~/utils/markdown";
import { formatMonth } from "~/utils/public-date";
import { CommentSection } from "~/components/grinds/comment-thread";
import { VoteControl } from "~/components/grinds/vote-control";
import { ModerationMenu } from "~/components/grinds/moderation-menu";
import { GrindsForumPostingJsonLd } from "~/components/seo/json-ld";
import { shouldNoindexPost, stripMarkdown } from "~/utils/grinds-seo";
import { BASE_URL } from "~/config/constants";
import { FEATURE_FLAGS } from "~/config/feature-flags";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

const BODY_MD =
    "markdown-body break-words text-[15px] leading-relaxed [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-5 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-4 [&_h3]:font-semibold [&_h3]:mt-3 [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2 [&_code]:rounded-base [&_code]:bg-secondary-background [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:border-2 [&_pre]:border-border [&_pre]:bg-secondary-background [&_pre]:p-3 [&_pre>code]:bg-transparent [&_pre>code]:p-0 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground";


export async function generateMetadata({
    params,
}: {
    params: Promise<{ idSlug: string }>;
}): Promise<Metadata> {
    const { idSlug } = await params;
    const post = await getPublicPost(postIdFromParam(idSlug));
    if (!post) return { title: "Post not found", robots: { index: false } };
    const canonical = `${BASE_URL}/grinds/${postParam(post.id, post.title)}`;
    const description = stripMarkdown(post.body).slice(0, 160);
    const noindex = shouldNoindexPost(post);
    return {
        title: post.title,
        description,
        alternates: { canonical },
        ...(noindex ? { robots: { index: false, follow: true } } : {}),
        ...(!noindex
            ? {
                  openGraph: {
                      type: "article",
                      title: post.title,
                      description,
                      url: canonical,
                      siteName: "LC Grind",
                  },
                  twitter: {
                      card: "summary_large_image",
                      title: post.title,
                      description,
                  },
              }
            : {}),
    };
}

export default async function GrindsPostPage({
    params,
}: {
    params: Promise<{ idSlug: string }>;
}) {
    if (!FEATURE_FLAGS.GRINDS) notFound();
    const { idSlug } = await params;
    const session = FEATURE_FLAGS.LOGIN
        ? await auth.api.getSession({ headers: await headers() })
        : null;
    const viewerId = session?.user.id;
    const isAdmin = isAdminEmail(session?.user.email);
    const role = await getUserRole(viewerId, session?.user.email);
    const userCanPin = canPin(role);

    const post = await getPublicPost(postIdFromParam(idSlug), viewerId);
    if (!post) notFound();

    const [comments, experienceCompanies] = await Promise.all([
        getPostComments(post.id, viewerId),
        post.type === "EXPERIENCE" ? getPostExperienceCompanies(post.id) : Promise.resolve([]),
    ]);
    const author = post.author?.handle ? `@${post.author.handle}` : "Anonymous";
    const param = postParam(post.id, post.title);
    const emitForumJsonLd = post.type === "EXPERIENCE" || post.type === null;

    return (
        <div className="w-full max-w-[800px] py-6 px-4 mx-auto">
            {emitForumJsonLd && (
                <GrindsForumPostingJsonLd
                    url={`${BASE_URL}/grinds/${param}`}
                    title={post.title}
                    body={post.body}
                    authorName={post.author?.handle ?? null}
                    createdMonth={post.createdMonth}
                    editedMonth={post.editedMonth}
                    score={post.score}
                    commentCount={post.commentCount}
                />
            )}

            {/* Top nav */}
            <div className="flex items-center justify-between mb-4">
                <Link
                    href="/grinds"
                    aria-label="Back to Grinds"
                    className={cn(buttonVariants({ variant: "neutral", size: "icon" }))}
                >
                    <ArrowLeft className="size-4" />
                </Link>
                <ModerationMenu
                    targetType="POST"
                    targetId={post.id}
                    postParam={param}
                    canReport={Boolean(session) && !post.isOwner}
                    isAdmin={isAdmin}
                    isOwner={post.isOwner}
                    canPin={userCanPin}
                    isPinned={post.isPinned}
                />
            </div>

            {/* Post card */}
            <article className="rounded-base border-2 border-border bg-card shadow-shadow overflow-hidden">

                {/* Header: title + author */}
                <div className="p-5 pb-0">
                    {post.isPinned && (
                        <div className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground mb-3">
                            <Pin className="size-3" />
                            Pinned
                        </div>
                    )}
                    <h1 className="font-bold text-xl leading-snug mb-4">{post.title}</h1>
                    <div className="flex items-center gap-3">
                        <Avatar className="size-9 shrink-0 border-2 border-border">
                            <AvatarImage src={post.author?.avatar ?? undefined} alt={post.author?.handle ?? "anon"} />
                            <AvatarFallback className="text-sm font-bold">
                                {post.author?.handle?.[0]?.toUpperCase() ?? "A"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-semibold text-sm">
                                {post.author ? (
                                    <Link
                                        href={`/u/${post.author.handle}`}
                                        className="hover:underline underline-offset-2"
                                    >
                                        {author}
                                    </Link>
                                ) : (
                                    <span>{author}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                <span>{formatMonth(post.createdMonth)}</span>
                                {post.editedMonth && post.editedMonth !== post.createdMonth && (
                                    <span className="italic">· edited {formatMonth(post.editedMonth)}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Company + flair tags */}
                {(experienceCompanies.length > 0 || post.company || post.tags.length > 0) && (
                    <div className="px-5 pt-3 pb-0 flex flex-wrap gap-1.5">
                        {experienceCompanies.length > 0
                            ? experienceCompanies.map((name, i) => {
                                  const slug = post.company?.name === name ? post.company.slug : null;
                                  return slug ? (
                                      <Badge key={i} variant="neutral" className="text-xs" asChild>
                                          <Link href={`/companies/${slug}`}>
                                              <Building2 className="size-3 mr-1" />
                                              {name}
                                          </Link>
                                      </Badge>
                                  ) : (
                                      <Badge key={i} variant="neutral" className="text-xs">
                                          <Building2 className="size-3 mr-1" />
                                          {name}
                                      </Badge>
                                  );
                              })
                            : post.company && (
                                  <Badge variant="neutral" className="text-xs" asChild>
                                      <Link href={`/companies/${post.company.slug}`}>
                                          <Building2 className="size-3 mr-1" />
                                          {post.company.name}
                                      </Link>
                                  </Badge>
                              )}
                        {post.tags.map((tag) => (
                            <Badge key={tag.slug} variant="default" className="text-xs" asChild>
                                <Link href={`/grinds/tag/${tag.slug}`}>
                                    {tag.name}
                                </Link>
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Body */}
                <div
                    className={cn(BODY_MD, "p-5")}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }}
                />

                {/* Action bar */}
                <div className="px-5 py-3 border-t-2 border-border bg-secondary-background/30 flex items-center gap-3 text-sm text-muted-foreground">
                    <VoteControl
                        targetType="POST"
                        targetId={post.id}
                        postParam={param}
                        score={post.score}
                        myVote={post.myVote}
                    />
                    <span className="inline-flex items-center gap-1.5">
                        <MessageSquare className="size-4" />
                        {post.commentCount}
                    </span>
                </div>
            </article>

            {/* Comments */}
            <CommentSection
                postId={post.id}
                postParam={param}
                comments={comments}
                canComment={Boolean(session)}
                isAdmin={isAdmin}
                heading={`Comments (${post.commentCount})`}
            />
        </div>
    );
}
