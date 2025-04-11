"use client";
import { CircleCheck, LockIcon } from "lucide-react";
import { difficultyColor } from "~/utils/sorting";
import { useAppDispatch, useAppSelector, isProblemCompleted } from "~/hooks/redux";
import { markCompleted, markIncomplete } from "~/store/completedProblemsSlice";

interface ProblemRowProps {
    // problem: SheetProblem & { problem: Problem & { topicTags: Array<{ topicTag: { name: string } }> } };
    index: number;
    order: string;
    problemUrl: string;
    problemTitle: string;
    problemId: string;
    frequency: number;
    difficulty: string;
    isPaid: boolean;
    acceptance: number;
    tags: string[];
}

export const ProblemRow = ({ index, order, problemUrl, problemId, problemTitle, frequency, difficulty, acceptance, isPaid, tags }: ProblemRowProps) => {
    const dispatch = useAppDispatch();
    const isCompleted = useAppSelector((state) =>
        isProblemCompleted(state, problemId.toString())
    );

    const toggleCompletion = () => {
        if (isCompleted) {
            dispatch(markIncomplete(problemId));
        } else {
            dispatch(markCompleted(problemId));
        }
    };

    return (
        <div className={`w-full flex items-center justify-between p-3 px-6 border border-t-0 
            border-muted-foreground/50 ${isCompleted ? "bg-green-50" : "bg-card"}`}>
            <div className="flex items-center gap-6">
                <p className="md:text-3xl text-xl text-foreground/75 md:min-w-[45px] min-w-[30px] text-center">
                    {index + 1}
                </p>
                <div>
                    <div className="flex gap-2 items-center">
                        <a
                            href={problemUrl}
                            target="_blank"
                            className={`text-blue-600 md:text-xl hover:underline underline-offset-2`}
                        >
                            {problemId}. {problemTitle}
                        </a>
                        {isPaid && (
                            <span>
                                <span className="sr-only">Paid Problem</span>
                                <LockIcon size={20} className="text-orange-300" />
                            </span>
                        )}
                    </div>
                    <div className="text-sm md:text-base flex gap-2 items-baseline">
                        <p className={difficultyColor(difficulty)}>
                            {difficulty}
                        </p>
                        <p className="text-xs md:text-sm font-medium text-slate-700">
                            Frequency: {frequency}%
                        </p>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground/75">
                        Acceptance: {acceptance}%
                    </p>
                    <div className="flex gap-1 items-center mt-2 flex-wrap">
                        {tags.map((tag, i) => (
                            <span key={i} className="py-0.5 px-1 border bg-card rounded-md text-xs md:text-sm">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
            <button
                onClick={toggleCompletion}
                className="focus:outline-none cursor-pointer"
                aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
            >
                {isCompleted ? (
                    <CircleCheck className="text-green-600 h-8 w-8" />
                ) : (
                    <CircleCheck className="text-gray-400 h-8 w-8 hover:text-gray-600" />
                )}
            </button>
            {/* <Checkbox
                className="data-[state=checked]:bg- data-[state=checked]:text-success-foreground dark:data-[state=checked]:bg- data-[state=checked]:border-success rounded-full size-6"
                checked={isCompleted}
                onCheckedChange={toggleCompletion}
            /> */}
        </div>
    );
};
