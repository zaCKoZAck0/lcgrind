"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreHorizontal, Flag, Trash2 } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { reportContent } from "~/server/actions/moderation/report";
import { removeContent } from "~/server/actions/moderation/actions";
import type { ReportTargetType } from "~/server/actions/moderation/core";

const REASONS = ["Spam", "Harassment", "Off-topic", "Other"] as const;

// Per-item moderation menu. Signed-in viewers get report reasons; admins also
// get a soft-delete. Both actions are server-gated — the menu just surfaces the
// calls and toasts the outcome.
export function ModerationMenu({
    targetType,
    targetId,
    postParam,
    canReport,
    isAdmin = false,
}: {
    targetType: ReportTargetType;
    targetId: string;
    postParam: string;
    canReport: boolean;
    isAdmin?: boolean;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    if (!canReport && !isAdmin) return null;

    const report = (reason: string) =>
        startTransition(async () => {
            const res = await reportContent({ targetType, targetId, reason });
            if (res.ok === true) {
                toast.success("Reported. Thanks for flagging this.");
            } else {
                toast.error(res.error);
            }
        });

    const remove = () =>
        startTransition(async () => {
            const res = await removeContent({ targetType, targetId, postParam });
            if (res.ok === true) {
                toast.success("Removed.");
                router.refresh();
            } else {
                toast.error(res.error);
            }
        });

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label="More actions"
                disabled={isPending}
                className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
                <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {canReport && (
                    <>
                        <DropdownMenuLabel className="flex items-center gap-1.5">
                            <Flag className="size-3.5" />
                            Report
                        </DropdownMenuLabel>
                        {REASONS.map((reason) => (
                            <DropdownMenuItem
                                key={reason}
                                onClick={() => report(reason)}
                            >
                                {reason}
                            </DropdownMenuItem>
                        ))}
                    </>
                )}
                {isAdmin && (
                    <>
                        {canReport && <DropdownMenuSeparator />}
                        <DropdownMenuItem
                            onClick={remove}
                            className="text-red-600 focus:text-red-600"
                        >
                            <Trash2 className="size-3.5" />
                            Remove (admin)
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
