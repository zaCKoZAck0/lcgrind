"use client";
import { useAppSelector } from "~/hooks/redux";
import { Progress } from "~/components/ui/progress";
import { Loader2 } from "lucide-react";


export const ProgressTracker = ({ problemIds, isLoading = false }: { problemIds: string[], isLoading?: boolean }) => {
    const completedProblems = useAppSelector(state => state.completedProblems.problems);

    const totalCount = problemIds.length;
    const completedCount = problemIds.filter(id => !!completedProblems[id]).length;
    const percentage = Math.round((completedCount / totalCount) * 100) || 0;

    return (
        <div className="mb-3 p-3 bg-card border-2 border-t-0 border-border flex items-center gap-3">
            <div className="flex justify-between items-center flex-shrink-0">
                <span className="text-sm font-medium flex items-center">
                    COMPLETED {isLoading ? <Loader2 size={16} className="ml-2 animate-spin" /> : `${completedCount}/${totalCount}`}
                </span>
            </div>
            <div className="w-full">
                <Progress className="h-3" value={percentage} />
            </div>
        </div>
    );
};
