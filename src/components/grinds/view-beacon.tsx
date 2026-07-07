"use client";

import { useEffect } from "react";

/**
 * Invisible component that fires a view beacon after 5 s of dwell time.
 * Bounces and prefetch renders never count (timer cleaned up on unmount).
 * Background tabs are not counted (visibility check at fire time).
 * Renders nothing.
 */
export function ViewBeacon({ postId }: { postId: string }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            if (document.visibilityState !== "visible") return;
            navigator.sendBeacon(
                "/api/grinds/views",
                new Blob([JSON.stringify({ postId })], {
                    type: "application/json",
                }),
            );
        }, 5000);

        return () => clearTimeout(timer);
    }, [postId]);

    return null;
}
