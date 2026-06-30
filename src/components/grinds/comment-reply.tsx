"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Reply } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { addComment } from "~/server/actions/comments/addComment";

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
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
                <Reply className="size-3.5" />
                {label}
            </button>
        );
    }

    return (
        <div className="basis-full w-full mt-1 flex flex-col gap-3">
            <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                placeholder="Write a comment… Markdown supported."
                autoFocus={!autoOpen}
                className="resize-y"
            />
            <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground cursor-pointer">
                    <Checkbox
                        checked={isAnonymous}
                        onCheckedChange={(v) => setIsAnonymous(v === true)}
                    />
                    Post anonymously
                </label>
                <div className="flex gap-2">
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
                    <Button
                        size="sm"
                        onClick={submit}
                        disabled={isPending || body.trim().length === 0}
                    >
                        {isPending ? "Commenting…" : "Comment"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
