"use client";

import { useFeedVotes } from "./feed-votes";
import { VoteControl } from "./vote-control";

// Per-card vote rail in feed lists. Reads myVote from FeedVotesContext (populated
// by a single batched fetch after mount). Score is correct immediately from SSR;
// the vote highlight arrives after context hydration.
export function PostVoteRail({
    postId,
    postParam,
    score,
}: {
    postId: string;
    postParam: string;
    score: number;
}) {
    const votes = useFeedVotes();
    const myVote = votes[postId] ?? 0;

    return (
        <VoteControl
            targetType="POST"
            targetId={postId}
            postParam={postParam}
            score={score}
            myVote={myVote}
            orientation="horizontal"
        />
    );
}
