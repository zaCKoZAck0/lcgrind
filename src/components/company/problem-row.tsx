"use client";

import React from "react";
import { BriefcaseBusinessIcon, CircleCheck, LockIcon } from "lucide-react";
import { difficultyColor } from "~/utils/sorting";
import {
    useAppDispatch,
    useAppSelector,
    isProblemCompleted,
} from "~/hooks/redux";
import { markCompleted, markIncomplete } from "~/store/completedProblemsSlice";
import { MAANG_COMPANIES, TOP_PRODUCT_COMPANIES_INDIA, TOP_PRODUCT_MNCS } from "~/config/constants";

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
            className={`relative flex p-3 border 
      border-muted-foreground border-t-0 
      ${isCompleted ? "bg-green-50" : "bg-card"}`}
        >
            <div className="flex-grow">
                <div className="flex items-center">
                    <a
                        href={problemUrl}
                        target="_blank"
                        className="text-blue-600 hover:underline underline-offset-2 text-lg"
                    >
                        {problemId}. {problemTitle}
                    </a>
                    {isPaid && (
                        <span
                            className="ml-2 inline-flex items-center px-2 py-1 text-xs 
              font-medium bg-orange-100 text-orange-700 border border-orange-700"
                        >
                            <LockIcon size={16} className="mr-1" /> Paid
                        </span>
                    )}
                </div>
                {tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-2 text-xs">
                        {tags.map((tag, i) => (
                            <span
                                key={i}
                                className="px-2 py-1 border border-muted-foreground/50 text-xs"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
                <div className="mt-2 flex flex-wrap gap-4 text-xs">
                    <span className={`${difficultyColor(difficulty)} font-semibold`}>
                        {difficulty}
                    </span>
                    <span>
                        Frequency:{" "}
                        {frequency?.toFixed(1) ? frequency.toFixed(1) + "%" : "N/A"}
                    </span>
                    <span>Acceptance: {acceptance}%</span>
                </div>
                {companies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        <span
                            title={`Asked at ${companies.join(", ")}`}
                            className="px-2 py-1 bg-muted text-xs flex items-center gap-1 text-muted-foreground"
                        >
                            <BriefcaseBusinessIcon size={14} /> {companies.length}
                        </span>
                        {companies.map((company, i) => {
                            return ((MAANG_COMPANIES.includes(company) || TOP_PRODUCT_MNCS.includes(company) || TOP_PRODUCT_COMPANIES_INDIA.includes(company)) ? (
                                <span
                                    key={i}
                                    className="px-2 py-1 bg-muted text-xs text-muted-foreground"
                                >
                                    {company}
                                </span>
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
                        <CircleCheck className="text-green-600 h-10 w-10" />
                    ) : (
                        <CircleCheck className="text-gray-400 h-10 w-10 hover:text-gray-600" />
                    )}
                </button>
            </div>
        </div>
    );
};
