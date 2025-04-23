"use client";
import { useAppSelector } from "~/hooks/redux";
import { Progress } from "~/components/ui/progress";
import { Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";


export const ProgressTracker = ({ text, problemIds, isLoading = false, className }: { text?: string, problemIds: string[], isLoading?: boolean, className?: string }) => {
    const completedProblems = useAppSelector(state => state.completedProblems.problems);

    const totalCount = problemIds.length;
    const completedCount = problemIds.filter(id => !!completedProblems[id]).length;
    const percentage = Math.round((completedCount / totalCount) * 100) || 0;

    return (
        <div className={cn("flex items-center gap-3 w-full", className)}>
            <div className="flex justify-between items-center flex-shrink-0">
                <span className="text-sm font-medium flex items-center">
                    {text} {isLoading ? <Loader2 size={16} className="ml-2 animate-spin" /> : `${completedCount}/${totalCount}`}
                </span>
            </div>
            <div className="w-full">
                <Progress className="h-3 w-full" value={percentage} />
            </div>
        </div>
    );
};
