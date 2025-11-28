"use client";

import { useState } from "react";
import { Dice5Icon, ExternalLinkIcon, Loader2Icon, LockIcon } from "lucide-react";
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
import { useAppSelector } from "~/hooks/redux";
import { getRandomProblem } from "~/server/actions/problems/getRandomProblem";
import { difficultyColor } from "~/utils/sorting";
import { SanitizedProblem } from "~/lib/utils";

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

    const completedProblems = useAppSelector(
        (state) => state.completedProblems.problems
    );

    const completedProblemIds = Object.keys(completedProblems);

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
                        <div className="space-y-4 py-4">
                            <div className="flex items-start gap-2">
                                <a
                                    href={problem.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-700 dark:text-main hover:underline underline-offset-2 text-lg font-bold flex-1"
                                >
                                    {problem.id}. {problem.title}
                                    {problem.isPaid && (
                                        <LockIcon
                                            size={14}
                                            className="inline ml-1 text-orange-700 dark:text-orange-300"
                                        />
                                    )}
                                </a>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Badge
                                    className={`${difficultyColor(
                                        problem.difficulty
                                    )} text-main-foreground`}
                                >
                                    {problem.difficulty}
                                </Badge>
                                <Badge variant="neutral">
                                    Acceptance: {problem.acceptance}%
                                </Badge>
                            </div>
                            {problem.tags && problem.tags.length > 0 && problem.tags[0] && (
                                <div className="text-sm text-muted-foreground">
                                    <span className="font-medium">Tags:</span>{" "}
                                    {problem.tags.filter(Boolean).join(", ")}
                                </div>
                            )}
                        </div>
                    )}

                    {!isLoading && allSolved && (
                        <div className="flex items-center justify-center py-4">
                            <Button onClick={handlePickFromSolved}>
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
