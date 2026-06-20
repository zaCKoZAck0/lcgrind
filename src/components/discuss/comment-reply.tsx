"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { addComment } from "~/server/actions/comments/addComment";

// Reply/comment composer. With no parentId and `autoOpen`, it is the top-level
// "add a comment" box; nested under a comment it is a collapsed "Reply" toggle.
export function CommentReply({
    postId,
    postParam,
    parentId,
    label = "Reply",
    autoOpen = false,
}: {
    postId: string;
    postParam: string;
    parentId?: string;
    label?: string;
    autoOpen?: boolean;
}) {
    const router = useRouter();
    const [open, setOpen] = useState(autoOpen);
    const [body, setBody] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isPending, startTransition] = useTransition();

    const submit = () => {
        startTransition(async () => {
            const res = await addComment({
                postId,
                postParam,
                parentId,
                body,
                isAnonymous,
            });
            if (res.ok === true) {
                setBody("");
                setIsAnonymous(false);
                if (!autoOpen) setOpen(false);
                toast.success("Comment posted.");
                router.refresh();
            } else {
                toast.error(res.error);
            }
        });
    };

    if (!open) {
        return (
            <Button
                type="button"
                variant="neutral"
                size="sm"
                onClick={() => setOpen(true)}
                className="h-6 px-2 text-xs"
            >
                {label}
            </Button>
        );
    }

    return (
        <div className="mt-2 flex flex-col gap-2">
            <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={parentId ? 3 : 4}
                placeholder="Add your comment. Markdown supported."
                autoFocus={!autoOpen}
            />
            <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Checkbox
                    checked={isAnonymous}
                    onCheckedChange={(v) => setIsAnonymous(v === true)}
                />
                Comment anonymously
            </label>
            <div className="flex gap-2">
                <Button
                    size="sm"
                    onClick={submit}
                    disabled={isPending || body.trim().length === 0}
                >
                    <Send className="size-4" />
                    {isPending ? "Posting…" : "Post"}
                </Button>
                {!autoOpen && (
                    <Button
                        size="sm"
                        variant="neutral"
                        onClick={() => {
                            setOpen(false);
                            setBody("");
                        }}
                    >
                        Cancel
                    </Button>
                )}
            </div>
        </div>
    );
}
