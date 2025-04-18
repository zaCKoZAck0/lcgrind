"use client";

import React from "react";
import { BriefcaseBusinessIcon, CheckCheckIcon, CircleCheck, ClockIcon, LockIcon } from "lucide-react";
import { difficultyColor } from "~/utils/sorting";
import {
    useAppDispatch,
    useAppSelector,
    isProblemCompleted,
} from "~/hooks/redux";
import { markCompleted, markIncomplete } from "~/store/completedProblemsSlice";
import { MAANG_COMPANIES, TOP_PRODUCT_COMPANIES_INDIA, TOP_PRODUCT_MNCS } from "~/config/constants";
import { Badge } from "../ui/badge";

interface ProblemRowProps {
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
    companies?: string[];
}

export const ProblemRow = ({
    problemUrl,
    problemId,
    problemTitle,
    frequency,
    difficulty,
    acceptance,
    isPaid,
    tags,
    companies = [],
}: ProblemRowProps) => {
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
        <div
            className={`relative flex p-3 border-2 
      border-border border-t-0 
      ${isCompleted ? "bg-secondary-background" : ""}`}
        >
            <div className="flex-grow">
                <div className="flex items-center">
                    <a
                        href={problemUrl}
                        target="_blank"
                        className="dark:text-blue-300 text-blue-700 hover:underline underline-offset-2 text-xl md:text-2xl font-bold"
                    >
                        {problemId}. {problemTitle}
                    </a>
                    {isPaid && (
                        <Badge
                            className="ml-2 inline-flex items-center px-2 py-1 text-xs 
              font-medium bg-orange-100 text-orange-700 border border-orange-700"
                        >
                            <LockIcon size={16} className="mr-1" /> Paid
                        </Badge>
                    )}
                </div>
                {tags.length > 0 && (
                    <div title="Tags" className="flex flex-wrap gap-2 text-sm md:text-base font-base">
                        {tags.join(", ")}
                    </div>
                )}
                <div className="flex flex-wrap gap-4 mt-1 font-base">
                    <Badge className={`${difficultyColor(difficulty)} text-main-foreground`}>
                        {difficulty}
                    </Badge>
                    <span title="Frequency" className="flex items-center gap-1">
                        <ClockIcon size={18} /> {frequency?.toFixed(1) ? frequency.toFixed(1) + "%" : "N/A"}
                    </span>
                    <span title="Acceptance" className="flex items-center gap-1"><CheckCheckIcon size={18} /> {acceptance}%</span>
                </div>
                {companies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        <Badge
                            title={`Asked at ${companies.join(", ")}`}
                            className="px-2 py-1 bg-muted text-xs flex items-center gap-1 text-muted-foreground"
                        >
                            <BriefcaseBusinessIcon size={14} /> {companies.length}
                        </Badge>
                        {companies.map((company, i) => {
                            return ((MAANG_COMPANIES.includes(company) || TOP_PRODUCT_MNCS.includes(company) || TOP_PRODUCT_COMPANIES_INDIA.includes(company)) ? (
                                <Badge
                                    variant="neutral"
                                    key={i}
                                    className="px-2 py-1 bg-muted text-xs text-muted-foreground"
                                >
                                    {company}
                                </Badge>
                            ) : null)
                        })}
                    </div>
                )
                }
            </div>
            <div className="flex items-center mt-4 md:mt-0 md:ml-6">
                <button
                    onClick={toggleCompletion}
                    className="focus:outline-none transition-colors duration-200"
                    aria-label={
                        isCompleted ? "Mark as incomplete" : "Mark as complete"
                    }
                >
                    {isCompleted ? (
                        <CircleCheck className="text-main h-10 w-10" />
                    ) : (
                        <CircleCheck className="text-text-foreground h-10 w-10 hover:main-foreground" />
                    )}
                </button>
            </div>
        </div>
    );
};
