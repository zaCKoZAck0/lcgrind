"use client";

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Trash2,
  LockIcon,
  HashIcon,
  CheckCheckIcon,
  CircleCheck,
  Loader2Icon,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { difficultyColor } from "~/utils/sorting";
import { useAppDispatch, useAppSelector, isProblemCompleted } from "~/hooks/redux";
import { markCompleted, markIncomplete } from "~/store/completedProblemsSlice";
import { NotesViewer } from "~/components/problem-notes";
import { getLintCodeAlternative } from "~/server/actions/lintcode/getLintCodeAlternative";
import type { ListProblem } from "~/server/actions/problems/getProblemsByIds";
import { cn } from "~/lib/utils";

interface SortableProblemRowProps {
  problem: ListProblem;
  onRemove: (problemId: number) => void;
  index: number;
}

export function SortableProblemRow({ problem, onRemove }: SortableProblemRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: problem.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dispatch = useAppDispatch();
  const problemIdStr = problem.id.toString();
  const isCompleted = useAppSelector((state) => isProblemCompleted(state, problemIdStr));
  const [fetchingAlternative, setFetchingAlternative] = useState(false);

  const toggleCompletion = () => {
    if (isCompleted) {
      dispatch(markIncomplete(problemIdStr));
    } else {
      dispatch(markCompleted(problemIdStr));
    }
  };

  const onLintCodeRedirect = () => {
    setFetchingAlternative(true);
    getLintCodeAlternative(problem.title)
      .then((url) => window.open(url, "_blank", "noopener,noreferrer"))
      .catch(console.error)
      .finally(() => setFetchingAlternative(false));
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex p-3 border-2 border-border border-t-0",
        isCompleted && "bg-secondary-background",
        isDragging && "opacity-50 z-50"
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-foreground/30 hover:text-foreground/60 transition-colors focus:outline-none self-center mr-3 shrink-0"
        aria-label="Drag to reorder"
      >
        <GripVertical size={18} />
      </button>

      {/* Main content — mirrors ProblemRow's flex-grow section */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center flex-wrap gap-2">
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-blue-700 dark:text-main hover:underline underline-offset-2 text-xl md:text-2xl font-bold"
          >
            {problem.frontendQuestionId}. {problem.title}
          </a>
          {problem.isPaid && (
            <Badge
              onClick={onLintCodeRedirect}
              variant="neutral"
              className="cursor-pointer"
            >
              {fetchingAlternative ? (
                <Loader2Icon size={16} className="animate-spin mr-1" />
              ) : (
                <LockIcon size={16} className="mr-1 text-orange-700 dark:text-orange-300" />
              )}
              Solve on LintCode
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-4 mt-2 font-base">
          {problem.tags.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-default flex items-center">
                  <HashIcon size={18} />
                </span>
              </TooltipTrigger>
              <TooltipContent>{problem.tags.join(", ")}</TooltipContent>
            </Tooltip>
          )}
          <Badge className={cn(difficultyColor(problem.difficulty), "text-main-foreground")}>
            {problem.difficulty}
          </Badge>
          <span title="Acceptance" className="flex items-center gap-1">
            <CheckCheckIcon size={18} /> {problem.acceptance}%
          </span>
          <NotesViewer problemId={problemIdStr} problemTitle={problem.title} />
        </div>
      </div>

      {/* Trailing: completion toggle + remove */}
      <div className="flex items-center gap-3 mt-4 md:mt-0 md:ml-6 shrink-0">
        <button
          onClick={toggleCompletion}
          className="cursor-pointer group focus:outline-none transition-colors duration-200"
          aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
        >
          {isCompleted ? (
            <CircleCheck className="text-main group-hover:text-text-foreground h-10 w-10" />
          ) : (
            <CircleCheck className="text-text-foreground group-hover:text-main h-10 w-10" />
          )}
        </button>
        <button
          onClick={() => onRemove(problem.id)}
          className="text-foreground/30 hover:text-red-600 transition-colors focus:outline-none"
          aria-label={`Remove ${problem.title}`}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
