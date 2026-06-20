"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";

import { Button } from "~/components/ui/button";
import { castVote } from "~/server/actions/votes/castVote";
import type { VoteTargetType } from "~/server/actions/votes/core";
import { cn } from "~/lib/utils";
import { FEATURE_FLAGS } from "~/config/feature-flags";

// Up/down vote control for a post or comment. Optimistically reflects the click
// (toggle/flip), then reconciles with the server and refreshes. On rejection it
// rolls back and toasts the reason (e.g. "Sign in to vote").
export function VoteControl({
    targetType,
    targetId,
    postParam,
    score: initialScore,
    myVote: initialVote,
    orientation = "horizontal",
}: {
    targetType: VoteTargetType;
    targetId: string;
    postParam: string;
    score: number;
    myVote: number;
    orientation?: "horizontal" | "vertical";
}) {
    const router = useRouter();
    const [score, setScore] = useState(initialScore);
    const [vote, setVote] = useState(initialVote);
    const [isPending, startTransition] = useTransition();

    if (!FEATURE_FLAGS.LOGIN) return null;

    const click = (dir: 1 | -1) => {
        const prevVote = vote;
        const prevScore = score;
        const next = prevVote === dir ? 0 : dir;

        // Optimistic: score moves by the swing in vote value.
        setVote(next);
        setScore(prevScore + (next - prevVote));

        startTransition(async () => {
            const res = await castVote({
                targetType,
                targetId,
                value: dir,
                postParam,
            });
            if (res.ok === true) {
                setScore(res.score);
                setVote(res.value);
                router.refresh();
            } else {
                setVote(prevVote);
                setScore(prevScore);
                toast.error(res.error);
            }
        });
    };

    return (
        <div
            className={cn(
                "inline-flex items-center gap-1",
                orientation === "vertical" && "flex-col",
            )}
        >
            <Button
                type="button"
                variant="neutral"
                size="icon"
                aria-label="Upvote"
                aria-pressed={vote === 1}
                disabled={isPending}
                onClick={() => click(1)}
                className={cn(
                    "size-7 shrink-0",
                    vote === 1 ? "text-main bg-main/10" : "text-muted-foreground",
                )}
            >
                <ArrowBigUp
                    className="size-5"
                    fill={vote === 1 ? "currentColor" : "none"}
                />
            </Button>
            <span
                className={cn(
                    "min-w-[1.5ch] text-center text-sm font-semibold tabular-nums",
                    vote === 1 && "text-main",
                    vote === -1 && "text-red-500",
                )}
            >
                {score}
            </span>
            <Button
                type="button"
                variant="neutral"
                size="icon"
                aria-label="Downvote"
                aria-pressed={vote === -1}
                disabled={isPending}
                onClick={() => click(-1)}
                className={cn(
                    "size-7 shrink-0",
                    vote === -1 ? "text-red-500 bg-red-500/10" : "text-muted-foreground",
                )}
            >
                <ArrowBigDown
                    className="size-5"
                    fill={vote === -1 ? "currentColor" : "none"}
                />
            </Button>
        </div>
    );
}
