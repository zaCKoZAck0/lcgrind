"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { Info, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { setProgressSync, saveProgress } from "~/server/actions/progress/sync";
import { LocalProgressSync } from "~/components/sync-dropdown";

const SYNC_COOLDOWN_MS = 60_000;

type Props = {
  initialEnabled: boolean;
  initialLastSyncedAt: Date | null;
};

export function ProgressSyncToggle({
  initialEnabled,
  initialLastSyncedAt,
}: Props) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isPending, startTransition] = useTransition();
  const [isSyncing, startSyncTransition] = useTransition();
  const [cooldownMs, setCooldownMs] = useState<number>(() => {
    if (!initialLastSyncedAt) return 0;
    const elapsed = Date.now() - new Date(initialLastSyncedAt).getTime();
    return Math.max(0, SYNC_COOLDOWN_MS - elapsed);
  });

  useEffect(() => {
    if (cooldownMs <= 0) return;
    const interval = setInterval(() => {
      setCooldownMs((prev) => {
        const next = prev - 1000;
        if (next <= 0) {
          clearInterval(interval);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownMs]);

  function handleToggle(next: boolean) {
    startTransition(async () => {
      if (next) {
        const raw = localStorage.getItem("persist:leetcode-tracker");
        if (raw) {
          const outer = JSON.parse(raw) as Record<string, string>;
          const parsed: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(outer)) {
            if (k === "_persist") continue;
            try {
              parsed[k] = JSON.parse(v);
            } catch {
              parsed[k] = v;
            }
          }
          const saveResult = await saveProgress(parsed);
          if (!saveResult.ok) {
            toast.error("Failed to upload progress. Try again.");
            return;
          }
          setCooldownMs(SYNC_COOLDOWN_MS);
        }
      }

      const result = await setProgressSync(next);
      if (!result.ok) {
        toast.error("Failed to update sync setting.");
        return;
      }

      setEnabled(next);
      toast.success(
        next ? "Progress sync enabled." : "Progress sync disabled.",
      );
    });
  }

  const handleSyncNow = useCallback(() => {
    startSyncTransition(async () => {
      const raw = localStorage.getItem("persist:leetcode-tracker");
      if (!raw) {
        toast.info("No local progress found to sync.");
        return;
      }

      const outer = JSON.parse(raw) as Record<string, string>;
      const parsed: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(outer)) {
        if (k === "_persist") continue;
        try {
          parsed[k] = JSON.parse(v);
        } catch {
          parsed[k] = v;
        }
      }

      const result = await saveProgress(parsed);
      if (!result.ok) {
        const err = result as {
          ok: false;
          error: string;
          retryAfterMs?: number;
        };
        if (err.retryAfterMs) {
          toast.error(
            `Please wait ${Math.ceil(err.retryAfterMs / 1000)}s before syncing again.`,
          );
          setCooldownMs(err.retryAfterMs);
        } else {
          toast.error(err.error);
        }
        return;
      }

      setCooldownMs(SYNC_COOLDOWN_MS);
      toast.success("Progress synced to server.");
    });
  }, []);

  const cooldownSecs = Math.ceil(cooldownMs / 1000);

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
              By default your progress (completed problems, notes, custom lists)
              is stored only on this device. Enable sync to back it up to our
              servers and restore it across devices after login.
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

      {enabled && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {"Your progress is being saved to the server."}
          </p>
          <Button
            size="sm"
            variant="neutral"
            onClick={handleSyncNow}
            disabled={isSyncing || cooldownMs > 0}
          >
            <RefreshCw
              className={isSyncing ? "animate-spin size-3.5" : "size-3.5"}
            />
            {isSyncing
              ? "Syncing…"
              : cooldownMs > 0
                ? `${cooldownSecs}s`
                : "Sync now"}
          </Button>
        </div>
      )}

      {!enabled && (
        <>
          <p className="text-xs text-muted-foreground">
            Your progress is stored locally on this device only.
          </p>
          <div className="border-t border-border" />
          <LocalProgressSync />
        </>
      )}
    </div>
  );
}
