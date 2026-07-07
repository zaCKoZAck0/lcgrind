"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getMyPostVotes } from "~/server/actions/votes/getMyPostVotes";
import { FEATURE_FLAGS } from "~/config/feature-flags";

const FeedVotesContext = createContext<Record<string, number>>({});

export function useFeedVotes() {
    return useContext(FeedVotesContext);
}

// Wraps a feed list. Fetches the caller's votes for all postIds in one request
// after mount, then exposes them via context so each PostVoteRail can highlight
// the correct state. Score renders immediately from SSR; only the highlight
// arrives post-hydration.
export function FeedVotes({
    postIds,
    children,
}: {
    postIds: string[];
    children: ReactNode;
}) {
    const [votes, setVotes] = useState<Record<string, number>>({});
    const idsKey = postIds.join(",");

    useEffect(() => {
        if (!FEATURE_FLAGS.LOGIN || !idsKey) return;
        const ids = idsKey.split(",");
        const refetch = () => getMyPostVotes(ids).then(setVotes).catch(() => {});
        refetch();
        // Re-fetch when tab becomes visible again (covers bfcache restore and
        // returning from the post detail page via browser back).
        const onVisible = () => { if (!document.hidden) refetch(); };
        document.addEventListener("visibilitychange", onVisible);
        return () => document.removeEventListener("visibilitychange", onVisible);
    }, [idsKey]);

    return (
        <FeedVotesContext.Provider value={votes}>
            {children}
        </FeedVotesContext.Provider>
    );
}
