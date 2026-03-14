"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { IS_SYNCING, SYNC_STARTED_AT } from "~/config/last-updated";

function getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    if (diffSecs < 60) return rtf.format(-diffSecs, "second");
    if (diffMins < 60) return rtf.format(-diffMins, "minute");
    return rtf.format(-diffHours, "hour");
}

export function SyncToast() {
    const toastId = useRef<string | number | null>(null);

    useEffect(() => {
        if (!IS_SYNCING) return;

        const startedAt = new Date(SYNC_STARTED_AT);

        const show = () => {
            toastId.current = toast.loading("Syncing Problems...", {
                id: "sync-toast",
                description: `Started ${getRelativeTime(startedAt)}`,
                duration: Infinity,
                dismissible: false,
            });
        };

        show();

        const interval = setInterval(() => {
            toast.loading("Syncing Problems...", {
                id: "sync-toast",
                description: `Started ${getRelativeTime(startedAt)}`,
                duration: Infinity,
                dismissible: false,
            });
        }, 30_000);

        return () => {
            clearInterval(interval);
            if (toastId.current !== null) {
                toast.dismiss(toastId.current);
            }
        };
    }, []);

    return null;
}
