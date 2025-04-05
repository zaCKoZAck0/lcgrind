import { SheetProblem, type Problem } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

import { difficultyColor } from "~/utils/sorting";
import { getOrderKey } from "~/utils/sorting";

interface ProblemRowProps {
    problem: SheetProblem & { problem: Problem & { topicTags: Array<{ topicTag: { name: string } }> } };
    index: number;
    order: string;
}

export const ProblemRow = ({ problem, index, order }: ProblemRowProps) => {
    return (
        <div className="w-full bg-card flex items-center justify-between p-3 px-6 border border-t-0 border-muted-foreground/50">
            <div className="flex items-center gap-6">
                <p className="text-3xl text-foreground/75">{index + 1}</p>
                <div>
                    <a href={problem.problem.url} target="_blank" className="text-blue-600 hover:underline underline-offset-2">
                        {problem.problem.title}
                    </a>
                    <div className="text-sm flex gap-2 items-baseline">
                        <p className={difficultyColor(problem.problem.difficulty)}>{problem.problem.difficulty}</p>
                        <p className="text-xs font-medium">{(problem[getOrderKey(order) as keyof typeof problem] as Decimal).toNumber()}%</p>
                    </div>
                    <div className="flex gap-1 items-center mt-2 flex-wrap">
                        {problem.problem.topicTags.map((tag, i) => (
                            <span key={i} className="py-0.5 px-1 border bg-card rounded-md text-xs">
                                {tag.topicTag.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

