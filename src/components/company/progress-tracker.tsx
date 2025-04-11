"use client";
import { useAppSelector } from "~/hooks/redux";
import { Progress } from "~/components/ui/progress";


export const ProgressTracker = ({ problemIds }: { problemIds: string[] }) => {
    const completedProblems = useAppSelector(state => state.completedProblems.problems);

    const totalCount = problemIds.length;
    const completedCount = problemIds.filter(id => !!completedProblems[id]).length;
    const percentage = Math.round((completedCount / totalCount) * 100) || 0;

    return (
        <div className="mb-3 p-3 bg-card border border-t-0 border-muted-foreground/50 flex items-center gap-3">
            <div className="flex justify-between items-center flex-shrink-0">
                <span className="text-sm font-medium">
                    COMPLETED {completedCount}/{totalCount}
                </span>
            </div>
            <div className="w-full">
                <Progress className="h-3" value={percentage} />
            </div>
        </div>
    );
};
