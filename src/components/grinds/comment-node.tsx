"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";

import { formatMonth } from "~/utils/public-date";
import { CommentReply } from "./comment-reply";
import { VoteControl } from "./vote-control";
import { ModerationMenu } from "./moderation-menu";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { editComment } from "~/server/actions/comments/addComment";
import type { PublicCommentNode } from "~/server/actions/comments/getComments";

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

export function CommentNodeView({
    node,
    postId,
    postParam,
    canComment,
    isAdmin,
    depth = 0,
}: {
    node: PublicCommentNode;
    postId: string;
    postParam: string;
    canComment: boolean;
    isAdmin: boolean;
    depth?: number;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isEditing, setIsEditing] = useState(false);
    const [editBody, setEditBody] = useState(node.body);

    const tombstoned = node.status === "TOMBSTONED";

    const handleSaveEdit = () => {
        startTransition(async () => {
            const res = await editComment(node.id, { body: editBody, postParam });
            if (res.ok === true) {
                toast.success("Comment updated.");
                setIsEditing(false);
                router.refresh();
            } else {
                toast.error(res.error);
            }
        });
    };

    const inner = (
        <>
            <Byline node={node} />

            {tombstoned ? (
                <p className="my-2 text-sm italic text-muted-foreground">[deleted]</p>
            ) : isEditing ? (
                <div className="mt-2 flex flex-col gap-2">
                    <Textarea
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        rows={4}
                        disabled={isPending}
                        className="text-sm"
                    />
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={isPending || editBody.trim() === ""}
                        >
                            Save
                        </Button>
                        <Button
                            size="sm"
                            variant="neutral"
                            onClick={() => {
                                setIsEditing(false);
                                setEditBody(node.body);
                            }}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    className={`mt-1 ${COMMENT_MD}`}
                    dangerouslySetInnerHTML={{ __html: node.bodyHtml }}
                />
            )}

            {!isEditing && (
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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
                            canReport={canComment && !node.isOwner}
                            isAdmin={isAdmin}
                            isOwner={node.isOwner}
                            onEditComment={() => {
                                setEditBody(node.body);
                                setIsEditing(true);
                            }}
                        />
                    )}
                </div>
            )}

            {node.children.length > 0 && (
                <div className="mt-3 flex flex-col gap-3">
                    {node.children.map((child) => (
                        <CommentNodeView
                            key={child.id}
                            node={child}
                            postId={postId}
                            postParam={postParam}
                            canComment={canComment}
                            isAdmin={isAdmin}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}

            {node.hasMore && (
                <Link
                    href={`/grinds/${postParam}/c/${node.id}`}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-main hover:underline"
                >
                    <MessageSquare className="size-3.5" />
                    Continue thread
                </Link>
            )}
        </>
    );

    if (depth === 0) return inner;

    return (
        <div className="border-l border-border/30 pl-3">
            {inner}
        </div>
    );
}
