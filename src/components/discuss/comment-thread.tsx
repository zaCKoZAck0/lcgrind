import Link from "next/link";
import { MessageSquare } from "lucide-react";

import { formatMonth } from "~/utils/public-date";
import { SignInCard } from "~/components/auth/sign-in-card";
import { CommentReply } from "./comment-reply";
import { VoteControl } from "./vote-control";
import { ModerationMenu } from "./moderation-menu";
import type { PublicCommentNode } from "~/server/actions/comments/getComments";
import { FEATURE_FLAGS } from "~/config/feature-flags";

// Scoped markdown styling shared by every comment body. Mirrors the post body's
// arbitrary-variant rules but tuned tighter for the denser thread layout.
const COMMENT_MD =
    "markdown-body break-words text-sm leading-relaxed [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2 [&_code]:rounded-base [&_code]:bg-secondary-background [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:border-2 [&_pre]:border-border [&_pre]:bg-secondary-background [&_pre]:p-2 [&_pre>code]:bg-transparent [&_pre>code]:p-0 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic";

function Byline({ node }: { node: PublicCommentNode }) {
    const who = node.author?.handle ? `@${node.author.handle}` : "Anonymous";
    return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {node.author ? (
                <Link
                    href={`/u/${node.author.handle}`}
                    className="font-semibold text-foreground hover:underline underline-offset-2"
                >
                    {who}
                </Link>
            ) : (
                <span className="font-semibold text-foreground">{who}</span>
            )}
            <span>·</span>
            <span>{formatMonth(node.createdMonth)}</span>
            {node.editedMonth && node.editedMonth !== node.createdMonth && (
                <span className="italic">edited {formatMonth(node.editedMonth)}</span>
            )}
        </div>
    );
}

// One comment plus its (depth-capped) descendants. Recurses through children;
// `hasMore` nodes terminate the recursion with a "continue thread" link that
// re-roots the thread at this comment. Tombstoned comments keep their slot (so
// live replies stay threaded) but show a [deleted] placeholder.
function CommentNodeView({
    node,
    postId,
    postParam,
    canComment,
    isAdmin,
}: {
    node: PublicCommentNode;
    postId: string;
    postParam: string;
    canComment: boolean;
    isAdmin: boolean;
}) {
    const tombstoned = node.status === "TOMBSTONED";

    return (
        <div className="border-l-2 border-border pl-3">
            <Byline node={node} />

            {tombstoned ? (
                <p className="my-2 text-sm italic text-muted-foreground">
                    [deleted]
                </p>
            ) : (
                <div
                    className={`mt-1 ${COMMENT_MD}`}
                    dangerouslySetInnerHTML={{ __html: node.bodyHtml }}
                />
            )}

            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                {!tombstoned && (
                    <VoteControl
                        targetType="COMMENT"
                        targetId={node.id}
                        postParam={postParam}
                        score={node.score}
                        myVote={node.myVote}
                    />
                )}
                {canComment && !tombstoned && (
                    <CommentReply
                        postId={postId}
                        postParam={postParam}
                        parentId={node.id}
                    />
                )}
                {!tombstoned && (
                    <ModerationMenu
                        targetType="COMMENT"
                        targetId={node.id}
                        postParam={postParam}
                        canReport={canComment}
                        isAdmin={isAdmin}
                    />
                )}
            </div>

            {node.children.length > 0 && (
                <div className="mt-2 flex flex-col gap-3">
                    {node.children.map((child) => (
                        <CommentNodeView
                            key={child.id}
                            node={child}
                            postId={postId}
                            postParam={postParam}
                            canComment={canComment}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
            )}

            {node.hasMore && (
                <Link
                    href={`/discuss/${postParam}/c/${node.id}`}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-main hover:underline"
                >
                    <MessageSquare className="size-3.5" />
                    Continue thread
                </Link>
            )}
        </div>
    );
}

// Server-rendered comment thread for a post. Renders the top-level composer (or a
// sign-in nudge), then the nested tree. No client round-trip to read the thread —
// the islands are only the reply composers.
export function CommentSection({
    postId,
    postParam,
    comments,
    canComment,
    isAdmin = false,
    heading = "Comments",
}: {
    postId: string;
    postParam: string;
    comments: PublicCommentNode[];
    canComment: boolean;
    isAdmin?: boolean;
    heading?: string;
}) {
    return (
        <section className="mt-6 flex flex-col gap-4">
            <h2 className="font-bold text-lg">{heading}</h2>

            {canComment ? (
                <CommentReply
                    postId={postId}
                    postParam={postParam}
                    label="Add a comment"
                    autoOpen
                />
            ) : FEATURE_FLAGS.LOGIN ? (
                <SignInCard message="Sign in to join the discussion." />
            ) : null}

            {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    No comments yet. Be the first to reply.
                </p>
            ) : (
                <div className="flex flex-col gap-4">
                    {comments.map((node) => (
                        <CommentNodeView
                            key={node.id}
                            node={node}
                            postId={postId}
                            postParam={postParam}
                            canComment={canComment}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
