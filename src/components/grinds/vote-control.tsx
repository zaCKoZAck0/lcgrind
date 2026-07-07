"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ThumbsUp, ThumbsDown } from "lucide-react";

import { castVote } from "~/server/actions/votes/castVote";
import type { VoteTargetType } from "~/server/actions/votes/core";
import { cn } from "~/lib/utils";
import { formatCount } from "~/utils/format-count";
import { FEATURE_FLAGS } from "~/config/feature-flags";

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
    // Guards against syncing from props while an optimistic update is in flight.
    const localVoteActive = useRef(false);

    // Sync vote highlight when parent (FeedVotes context) provides updated value.
    // Covers the hydration race: context starts empty, fills in after async fetch.
    useEffect(() => {
        if (!localVoteActive.current) {
            setVote(initialVote);
        }
    }, [initialVote]);

    if (!FEATURE_FLAGS.LOGIN) return null;

    const click = (dir: 1 | -1) => {
        const prevVote = vote;
        const prevScore = score;
        const next = prevVote === dir ? 0 : dir;

        localVoteActive.current = true;
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
            localVoteActive.current = false;
        });
    };

    return (
        <div
            className={cn(
                "inline-flex items-center gap-1",
                orientation === "vertical" && "flex-col",
            )}
        >
            <button
                type="button"
                aria-label="Upvote"
                aria-pressed={vote === 1}
                disabled={isPending}
                onClick={() => click(1)}
                className={cn(
                    "inline-flex items-center justify-center p-1 rounded cursor-pointer transition-colors disabled:cursor-not-allowed",
                    vote === 1
                        ? "text-main"
                        : "text-muted-foreground hover:text-main",
                )}
            >
                <ThumbsUp
                    className="size-3.5"
                    fill={vote === 1 ? "currentColor" : "none"}
                />
            </button>
            <span
                className={cn(
                    "min-w-[2ch] text-center text-xs font-semibold tabular-nums",
                    vote === 1 && "text-main",
                    vote === -1 && "text-red-500",
                    vote === 0 && "text-muted-foreground",
                )}
            >
                {formatCount(score)}
            </span>
            <button
                type="button"
                aria-label="Downvote"
                aria-pressed={vote === -1}
                disabled={isPending}
                onClick={() => click(-1)}
                className={cn(
                    "inline-flex items-center justify-center p-1 rounded cursor-pointer transition-colors disabled:cursor-not-allowed",
                    vote === -1
                        ? "text-red-500"
                        : "text-muted-foreground hover:text-red-500",
                )}
            >
                <ThumbsDown
                    className="size-3.5"
                    fill={vote === -1 ? "currentColor" : "none"}
                />
            </button>
        </div>
    );
}
