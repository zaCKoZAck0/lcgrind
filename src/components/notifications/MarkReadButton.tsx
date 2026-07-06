"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { markSingleRead } from "~/server/actions/notifications/getNotifications";

export function MarkReadButton({ id }: { id: string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    function handleClick(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        startTransition(async () => {
            await markSingleRead(id);
            router.refresh();
        });
    }

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            className="shrink-0 p-0.5 rounded border border-border hover:bg-secondary-background transition-colors disabled:pointer-events-none disabled:opacity-50"
            aria-label="Mark as read"
        >
            <Check className="size-3 text-muted-foreground" />
        </button>
    );
}
