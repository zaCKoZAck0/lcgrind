"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldOff, Lock, EyeOff, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
    removeContent,
    shadowContent,
    banUser,
    lockPost,
    type ReportQueueRow,
} from "~/server/actions/moderation/actions";

export function ReportQueue({ reports }: { reports: ReportQueueRow[] }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const run = (label: string, fn: () => Promise<{ ok: boolean; error?: string }>) =>
        startTransition(async () => {
            const res = await fn();
            if (res.ok) {
                toast.success(label);
                router.refresh();
            } else {
                toast.error(res.error ?? "Action failed");
            }
        });

    if (reports.length === 0) {
        return (
            <div className="border-2 border-border bg-card p-10 text-center text-muted-foreground/70">
                No open reports.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {reports.map((r) => (
                <div
                    key={r.id}
                    className="border-2 border-border bg-card p-4 flex flex-col gap-3 shadow-shadow"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <Badge className="bg-secondary-background text-foreground text-xs">
                                    {r.targetType}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(r.createdAt).toLocaleDateString()} · {r.reporterEmail}
                                </span>
                            </div>
                            <p className="text-sm font-semibold truncate">{r.targetSnippet}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Reason: {r.reason}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            size="sm"
                            variant="neutral"
                            disabled={isPending}
                            onClick={() =>
                                run("Removed", () =>
                                    removeContent({
                                        targetType: r.targetType as "POST" | "COMMENT",
                                        targetId: r.targetId,
                                    }),
                                )
                            }
                        >
                            <Trash2 className="size-3.5" />
                            Remove
                        </Button>
                        <Button
                            size="sm"
                            variant="neutral"
                            disabled={isPending}
                            onClick={() =>
                                run("Shadow-removed", () =>
                                    shadowContent({
                                        targetType: r.targetType as "POST" | "COMMENT",
                                        targetId: r.targetId,
                                    }),
                                )
                            }
                        >
                            <EyeOff className="size-3.5" />
                            Shadow
                        </Button>
                        {r.targetType === "POST" && (
                            <Button
                                size="sm"
                                variant="neutral"
                                disabled={isPending}
                                onClick={() =>
                                    run("Locked", () => lockPost(r.targetId))
                                }
                            >
                                <Lock className="size-3.5" />
                                Lock
                            </Button>
                        )}
                        {r.authorId && (
                            <Button
                                size="sm"
                                variant="neutral"
                                disabled={isPending}
                                onClick={() => {
                                    if (confirm(`Ban user ${r.authorId}? This blocks all posting.`)) {
                                        run("Banned", () => banUser(r.authorId!));
                                    }
                                }}
                            >
                                <ShieldOff className="size-3.5" />
                                Ban user
                            </Button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
