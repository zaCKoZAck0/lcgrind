"use client";

import { useState, useTransition } from "react";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "~/components/ui/tooltip";
import {
    setProgressSync,
    saveProgress,
} from "~/server/actions/progress/sync";

type Props = {
    initialEnabled: boolean;
};

export function ProgressSyncToggle({ initialEnabled }: Props) {
    const [enabled, setEnabled] = useState(initialEnabled);
    const [isPending, startTransition] = useTransition();

    function handleToggle(next: boolean) {
        startTransition(async () => {
            if (next) {
                const raw = localStorage.getItem("persist:leetcode-tracker");
                if (raw) {
                    const outer = JSON.parse(raw) as Record<string, string>;
                    const parsed: Record<string, unknown> = {};
                    for (const [k, v] of Object.entries(outer)) {
                        if (k === "_persist") continue;
                        try { parsed[k] = JSON.parse(v); } catch { parsed[k] = v; }
                    }
                    const saveResult = await saveProgress(parsed);
                    if (!saveResult.ok) {
                        toast.error("Failed to upload progress. Try again.");
                        return;
                    }
                }
            }

            const result = await setProgressSync(next);
            if (!result.ok) {
                toast.error("Failed to update sync setting.");
                return;
            }

            setEnabled(next);
            toast.success(next ? "Progress sync enabled." : "Progress sync disabled.");
        });
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Label htmlFor="sync-toggle" className="cursor-pointer font-medium">
                        Sync progress to server
                    </Label>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[240px]">
                            By default your progress (completed problems, notes, custom lists) is
                            stored only on this device. Enable sync to back it up to our servers
                            and restore it across devices after login.
                        </TooltipContent>
                    </Tooltip>
                </div>
                <Switch
                    id="sync-toggle"
                    checked={enabled}
                    onCheckedChange={handleToggle}
                    disabled={isPending}
                />
            </div>
            <p className="text-xs text-muted-foreground">
                {enabled
                    ? "Your progress is being saved to the server and will be restored on login."
                    : "Your progress is stored locally on this device only."}
            </p>
        </div>
    );
}
