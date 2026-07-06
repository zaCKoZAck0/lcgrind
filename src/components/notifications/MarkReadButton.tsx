"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { markSingleRead } from "~/server/actions/notifications/getNotifications";

export function MarkReadButton({ id }: { id: string }) {
    const router = useRouter();

    async function handleClick(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        await markSingleRead(id);
        router.refresh();
    }

    return (
        <button
            onClick={handleClick}
            className="shrink-0 p-0.5 rounded border border-border hover:bg-secondary-background transition-colors"
            aria-label="Mark as read"
        >
            <Check className="size-3 text-muted-foreground" />
        </button>
    );
}
