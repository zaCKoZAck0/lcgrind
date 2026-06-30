import { MessageSquare } from "lucide-react";

import { SignInCard } from "~/components/auth/sign-in-card";
import { CommentReply } from "./comment-reply";
import { CommentNodeView } from "./comment-node";
import type { PublicCommentNode } from "~/server/actions/comments/getComments";
import { FEATURE_FLAGS } from "~/config/feature-flags";

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
        <section className="mt-6 flex flex-col gap-3">
            <h2 className="font-bold text-base flex items-center gap-2">
                <MessageSquare className="size-4" />
                {heading}
            </h2>

            {canComment ? (
                <div className="rounded-base border-2 border-border bg-card p-4">
                    <CommentReply
                        postId={postId}
                        postParam={postParam}
                        label="Add a comment"
                        autoOpen
                    />
                </div>
            ) : FEATURE_FLAGS.LOGIN ? (
                <SignInCard message="Sign in to join the discussion." />
            ) : null}

            {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">No comments yet. Be the first to reply.</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {comments.map((node) => (
                        <div
                            key={node.id}
                            className="rounded-base border-2 border-border bg-card p-4"
                        >
                            <CommentNodeView
                                node={node}
                                postId={postId}
                                postParam={postParam}
                                canComment={canComment}
                                isAdmin={isAdmin}
                                depth={0}
                            />
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
