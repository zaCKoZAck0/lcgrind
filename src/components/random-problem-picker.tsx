"use client";

import { useState } from "react";
import {
    BriefcaseBusinessIcon,
    CheckCheckIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    CircleCheck,
    Dice5Icon,
    ExternalLinkIcon,
    Loader2Icon,
    LockIcon,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { useAppDispatch, useAppSelector, isProblemCompleted } from "~/hooks/redux";
import { markCompleted, markIncomplete } from "~/store/completedProblemsSlice";
import { getRandomProblem } from "~/server/actions/problems/getRandomProblem";
import { difficultyColor } from "~/utils/sorting";
import { SanitizedProblem } from "~/lib/utils";
import { NotesViewer } from "~/components/problem-notes";
import {
    MAANG_COMPANIES,
    TOP_PRODUCT_COMPANIES_INDIA,
    TOP_PRODUCT_MNCS,
} from "~/config/constants";

interface RandomProblemPickerProps {
    order: string;
    search: string;
    tags: string[] | null;
    companies: string[] | null;
    difficulties: string[] | null;
}

export function RandomProblemPicker({
    order,
    search,
    tags,
    companies,
    difficulties,
}: RandomProblemPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [problem, setProblem] = useState<SanitizedProblem | null>(null);
    const [allSolved, setAllSolved] = useState(false);
    const [includeCompleted, setIncludeCompleted] = useState(false);
    const [showTags, setShowTags] = useState(false);
    const [showCompanies, setShowCompanies] = useState(false);

    const dispatch = useAppDispatch();
    const completedProblems = useAppSelector(
        (state) => state.completedProblems.problems
    );

    const completedProblemIds = Object.keys(completedProblems);

    // Get completion status for the current problem
    const isCompleted = useAppSelector((state) =>
        problem ? isProblemCompleted(state, problem.id.toString()) : false
    );

    const toggleCompletion = () => {
        if (!problem) return;
        const problemId = problem.id.toString();
        if (isCompleted) {
            dispatch(markIncomplete(problemId));
        } else {
            dispatch(markCompleted(problemId));
        }
    };

    const fetchRandomProblem = async (excludeCompleted: boolean = true) => {
        setIsLoading(true);
        setAllSolved(false);
        setProblem(null);

        try {
            const excludedIds = excludeCompleted ? completedProblemIds : [];
            const result = await getRandomProblem(
                order,
                search,
                tags,
                companies,
                difficulties,
                excludedIds
            );

            if (result) {
                setProblem(result);
                setIncludeCompleted(!excludeCompleted);
            } else if (excludeCompleted) {
                // No unsolved problems found, show the "all solved" message
                setAllSolved(true);
            } else {
                // No problems found at all (even with completed ones)
                setProblem(null);
            }
        } catch (error) {
            console.error("Error fetching random problem:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDialog = () => {
        setIsOpen(true);
        fetchRandomProblem(true);
    };

    const handlePickFromSolved = () => {
        fetchRandomProblem(false);
    };

    const handlePickAnother = () => {
        fetchRandomProblem(!includeCompleted);
    };

    return (
        <>
            <Button
                className="bg-secondary-background text-secondary-foreground cursor-pointer w-fit"
                variant="noShadow"
                size="sm"
                onClick={handleOpenDialog}
                disabled={isLoading}
                title="Pick Random Problem"
            >
                <Dice5Icon /> Random
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isLoading
                                ? "Finding a problem..."
                                : allSolved
                                    ? "All Problems Solved! 🎉"
                                    : problem
                                        ? "Random Problem"
                                        : "No Problems Found"}
                        </DialogTitle>
                        <DialogDescription>
                            {isLoading
                                ? "Please wait while we pick a random problem for you."
                                : allSolved
                                    ? "You've solved all the problems matching your filters. Would you like to pick from solved problems?"
                                    : problem
                                        ? includeCompleted
                                            ? "Here's a random problem from all problems (including completed)."
                                            : "Here's a random unsolved problem for you to try."
                                        : "No problems found with the current filters."}
                        </DialogDescription>
                    </DialogHeader>

                    {isLoading && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2Icon className="h-8 w-8 animate-spin" />
                        </div>
                    )}

                    {!isLoading && problem && (
                        <div className={`space-y-4 py-4 ${isCompleted ? "bg-secondary-background" : ""} -mx-6 px-6`}>
                            <div className="flex items-start justify-between gap-2">
                                <a
                                    href={problem.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-700 dark:text-main hover:underline underline-offset-2 text-xl md:text-2xl font-bold flex-1"
                                >
                                    {problem.id}. {problem.title}
                                    {problem.isPaid && (
                                        <LockIcon
                                            size={14}
                                            className="inline ml-1 text-orange-700 dark:text-orange-300"
                                        />
                                    )}
                                </a>
                                <button
                                    onClick={toggleCompletion}
                                    className="cursor-pointer group focus:outline-none transition-colors duration-200"
                                    aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                                >
                                    {isCompleted ? (
                                        <CircleCheck className="text-main group-hover:text-text-foreground h-10 w-10" />
                                    ) : (
                                        <CircleCheck className="text-text-foreground group-hover:text-main h-10 w-10 hover:main-foreground" />
                                    )}
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-4 items-center font-base">
                                <Badge
                                    className={`${difficultyColor(
                                        problem.difficulty
                                    )} text-main-foreground`}
                                >
                                    {problem.difficulty}
                                </Badge>
                                <span title="Acceptance" className="flex items-center gap-1">
                                    <CheckCheckIcon size={18} /> {problem.acceptance}%
                                </span>
                                <NotesViewer 
                                    problemId={problem.id.toString()} 
                                    problemTitle={problem.title} 
                                />
                            </div>

                            {/* Tags toggle */}
                            {problem.tags && problem.tags.filter(Boolean).length > 0 && (
                                <div>
                                    <button
                                        onClick={() => setShowTags(!showTags)}
                                        className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                                    >
                                        {showTags ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
                                        Tags ({problem.tags.filter(Boolean).length})
                                    </button>
                                    {showTags && (
                                        <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
                                            {problem.tags.filter(Boolean).join(", ")}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Companies toggle */}
                            {problem.companies && problem.companies.filter(Boolean).length > 0 && (
                                <div>
                                    <button
                                        onClick={() => setShowCompanies(!showCompanies)}
                                        className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                                    >
                                        {showCompanies ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
                                        <BriefcaseBusinessIcon size={14} /> Companies ({problem.companies.filter(Boolean).length})
                                    </button>
                                    {showCompanies && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {problem.companies.filter(Boolean).map((company) => {
                                                const isTopCompany = MAANG_COMPANIES.includes(company) ||
                                                    TOP_PRODUCT_MNCS.includes(company) ||
                                                    TOP_PRODUCT_COMPANIES_INDIA.includes(company);
                                                return (
                                                    <Badge
                                                        key={company}
                                                        variant={isTopCompany ? "neutral" : "default"}
                                                        className="px-2 py-1 bg-muted text-xs text-muted-foreground"
                                                    >
                                                        {company}
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {!isLoading && allSolved && (
                        <div className="flex items-center justify-center py-4">
                            <Button onClick={handlePickFromSolved} disabled={isLoading}>
                                Pick from Solved Problems
                            </Button>
                        </div>
                    )}

                    <DialogFooter>
                        {!isLoading && problem && (
                            <div className="flex gap-2 w-full flex-col sm:flex-row">
                                <Button
                                    variant="neutral"
                                    onClick={handlePickAnother}
                                    disabled={isLoading}
                                    className="flex-1"
                                >
                                    <Dice5Icon /> Pick Another
                                </Button>
                                <Button
                                    asChild
                                    className="flex-1"
                                >
                                    <a
                                        href={problem.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLinkIcon /> Open Problem
                                    </a>
                                </Button>
                            </div>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
