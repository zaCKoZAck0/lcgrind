"use client";

import { useState } from "react";
import { Award, Clock, Flame, Repeat2, TrendingUp } from "lucide-react";
import { badgeVariants } from "../ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../ui/tooltip";
import { cn } from "~/lib/utils";
import { questionFlairs, flairTooltip, type QuestionFlair } from "~/utils/company-metrics";
import type { InterviewQuestion } from "~/server/actions/companies/getCompanyInterviews";

const FLAIR_CONFIG: Record<
    QuestionFlair,
    { icon: React.ReactNode; label: string; color: string }
> = {
    hot:      { icon: <Flame      className="size-3" />, label: "Hot",            color: "var(--chart-3)" }, // red
    trending: { icon: <TrendingUp className="size-3" />, label: "Trending",       color: "var(--chart-1)" }, // purple-blue
    classic:  { icon: <Award      className="size-3" />, label: "Classic",        color: "var(--chart-2)" }, // yellow
    frequent: { icon: <Repeat2    className="size-3" />, label: "Frequent",       color: "var(--chart-5)" }, // blue
    recent:   { icon: <Clock      className="size-3" />, label: "Recent",         color: "var(--chart-4)" }, // green
};

function FlairChip({ flair, q, companyName }: { flair: QuestionFlair; q: InterviewQuestion; companyName?: string }) {
    const { icon, label, color } = FLAIR_CONFIG[flair];
    // Controlled so a tap toggles on touch devices, where Radix's hover/focus
    // triggers never fire. Reading the render-scope `open` (not a functional
    // update) is deliberate: Radix emits onOpenChange(false) on trigger click
    // before our handler runs, so the stale value makes both taps land right.
    const [open, setOpen] = useState(false);
    return (
        <Tooltip open={open} onOpenChange={setOpen}>
            <TooltipTrigger
                className={cn(badgeVariants({ variant: "neutral" }), "shrink-0 cursor-help")}
                style={{ backgroundColor: color }}
                onClick={() => setOpen(!open)}
            >
                {icon}
                {label}
            </TooltipTrigger>
            <TooltipContent>{flairTooltip(flair, q, companyName)}</TooltipContent>
        </Tooltip>
    );
}

export function QuestionChips({ q, companyName }: { q: InterviewQuestion; companyName?: string }) {
    const flairs = questionFlairs(q);
    if (flairs.length === 0) return null;
    return (
        <TooltipProvider delayDuration={0}>
            {flairs.map((flair) => (
                <FlairChip key={flair} flair={flair} q={q} companyName={companyName} />
            ))}
        </TooltipProvider>
    );
}
