"use client";

import { difficultyColor } from "~/utils/sorting";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "~/components/ui/tooltip";

export interface DifficultyCounts {
    easyCount: number;
    mediumCount: number;
    hardCount: number;
}

type Segment = { label: string; count: number; color: string };

// Distinct DSA problems by difficulty. The mix is shown so users judge the
// company's difficulty themselves — no aggregate rank, no ask volume.
function segments({ easyCount, mediumCount, hardCount }: DifficultyCounts): {
    segs: Segment[];
    total: number;
} {
    const segs = [
        { label: "Easy", count: easyCount, color: difficultyColor("Easy") },
        { label: "Medium", count: mediumCount, color: difficultyColor("Medium") },
        { label: "Hard", count: hardCount, color: difficultyColor("Hard") },
    ];
    return { segs, total: easyCount + mediumCount + hardCount };
}

const pct = (count: number, total: number) => Math.round((count / total) * 100);

/** Full bar with legend — company page header. */
export function DifficultyBar(props: DifficultyCounts) {
    const { segs, total } = segments(props);
    if (total === 0) return null;

    return (
        <div className="flex flex-col gap-1.5 w-full max-w-md">
            <span className="text-xs font-medium text-foreground/60">DSA difficulty</span>
            <div className="flex h-3 w-full overflow-hidden rounded-base border-2 border-border">
                {segs.map((s) =>
                    s.count > 0 ? (
                        <div
                            key={s.label}
                            className={s.color}
                            style={{ width: `${(s.count / total) * 100}%` }}
                        />
                    ) : null,
                )}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
                {segs.map((s) => (
                    <span key={s.label} className="flex items-center gap-1.5">
                        <span className={`size-2.5 rounded-[2px] ${s.color}`} />
                        {s.label} {s.count} ({pct(s.count, total)}%)
                    </span>
                ))}
            </div>
        </div>
    );
}

/** Thin bar with hover breakdown — all-companies list rows. */
export function DifficultyBarCompact(props: DifficultyCounts) {
    const { segs, total } = segments(props);
    if (total === 0) return null;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex h-2 w-20 overflow-hidden rounded-[2px] border border-border cursor-help">
                        {segs.map((s) =>
                            s.count > 0 ? (
                                <div
                                    key={s.label}
                                    className={s.color}
                                    style={{ width: `${(s.count / total) * 100}%` }}
                                />
                            ) : null,
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    {segs.map((s) => `${s.label} ${s.count} (${pct(s.count, total)}%)`).join(" · ")}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
