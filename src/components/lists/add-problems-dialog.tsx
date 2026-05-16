"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Filters, type FilterValues } from "~/components/company/filter";
import { ProblemRow } from "~/components/company/problem-row";
import { getProblems } from "~/server/actions/problems/getProblems";
import { useAppDispatch, useAppSelector, getProblemList } from "~/hooks/redux";
import { addProblemsToList } from "~/store/problemListsSlice";
import type { SanitizedProblem } from "~/lib/utils";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 50;

const DEFAULT_FILTERS: FilterValues = {
  order: "all-problems",
  sort: "question-id",
  search: "",
  companies: [],
  tags: [],
  difficulties: [],
};

interface AddProblemsDialogProps {
  listId: string;
}

export function AddProblemsDialog({ listId }: AddProblemsDialogProps) {
  const dispatch = useAppDispatch();
  const list = useAppSelector((s) => getProblemList(s, listId));
  const existingIds = useAppSelector(
    (s) => s.problemLists.lists[listId]?.problemIds ?? []
  );
  const existingSet = useMemo(() => new Set(existingIds), [existingIds]);

  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);
  const [pages, setPages] = useState<SanitizedProblem[][]>([]);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const filterKey = [
    filters.order,
    filters.sort,
    filters.search,
    filters.companies.join(","),
    filters.tags.join(","),
    filters.difficulties.join(","),
  ].join("|");

  const { data, isFetching } = useQuery({
    queryKey: ["list-picker", filterKey, page],
    queryFn: () =>
      getProblems(
        filters.order,
        filters.search,
        filters.sort,
        filters.tags.length ? filters.tags : null,
        filters.companies.length ? filters.companies : null,
        filters.difficulties.length ? filters.difficulties : null,
        page,
        ITEMS_PER_PAGE
      ),
    enabled: open,
    staleTime: 60_000,
  });

  // Accumulate pages; reset on filter change
  const prevFilterKeyRef = useRef(filterKey);
  useEffect(() => {
    if (!data) return;
    if (filterKey !== prevFilterKeyRef.current || page === 1) {
      setPages([data]);
      prevFilterKeyRef.current = filterKey;
    } else {
      setPages((prev) => [...prev, data]);
    }
  }, [data]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    setPages([]);
  }, [filterKey]);

  // Reset dialog state when closed
  useEffect(() => {
    if (!open) {
      setFilters(DEFAULT_FILTERS);
      setPages([]);
      setPage(1);
      setSelected(new Set());
    }
  }, [open]);

  const allProblems = pages.flat();
  const lastPageSize = pages[pages.length - 1]?.length ?? 0;
  const hasMore = lastPageSize === ITEMS_PER_PAGE;

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const confirmAdd = () => {
    const ids = Array.from(selected).filter((id) => !existingSet.has(id));
    if (ids.length === 0) return;
    dispatch(addProblemsToList({ listId, problemIds: ids }));
    toast.success(`Added ${ids.length} problem${ids.length !== 1 ? "s" : ""}`);
    setSelected(new Set());
  };

  const selectedCount = selected.size;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="neutral" className="gap-2 w-full">
          <Plus size={16} />
          Add Problem
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1100px] max-h-[90vh] p-0 flex flex-col gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b-2 border-border shrink-0">
          <DialogTitle>
            Add problems to &ldquo;{list?.name ?? "list"}&rdquo;
          </DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="shrink-0">
          <Filters
            filters={{ sorting: DEFAULT_FILTERS.sort, order: DEFAULT_FILTERS.order, search: DEFAULT_FILTERS.search }}
            isProblemFilter
            controlled={{
              onChange: setFilters,
              hideRandomPicker: true,
            }}
          />
        </div>

        {/* Problem list */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isFetching && pages.length === 0 ? (
            <div className="flex items-center justify-center py-12 gap-2 text-foreground/50">
              <Loader2 size={18} className="animate-spin" />
              Loading problems…
            </div>
          ) : allProblems.length === 0 ? (
            <div className="py-12 text-center text-foreground/50 text-sm">
              No problems found. Try adjusting your filters.
            </div>
          ) : (
            <>
              {allProblems.map((problem, idx) => (
                <ProblemRow
                  key={problem.id}
                  index={idx}
                  order={filters.order}
                  problemUrl={problem.url}
                  problemTitle={problem.title}
                  problemId={problem.id.toString()}
                  difficulty={problem.difficulty}
                  acceptance={problem.acceptance}
                  isPaid={problem.isPaid}
                  tags={problem.tags}
                  pickerMode={{
                    selected: selected.has(problem.id),
                    disabled: existingSet.has(problem.id),
                    disabledLabel: "Added",
                    onToggle: () => toggleSelect(problem.id),
                  }}
                />
              ))}
              {hasMore && (
                <div className="flex justify-center py-4">
                  <Button
                    variant="neutral"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={isFetching}
                    className="gap-2"
                  >
                    {isFetching ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : null}
                    Load more
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t-2 border-border px-6 py-4 flex items-center justify-between gap-4 bg-card">
          <span className="text-sm text-foreground/60">
            {selectedCount > 0
              ? `${selectedCount} problem${selectedCount !== 1 ? "s" : ""} selected`
              : "No problems selected"}
          </span>
          <div className="flex gap-2">
            {selectedCount > 0 && (
              <Button
                variant="neutral"
                size="sm"
                onClick={() => setSelected(new Set())}
              >
                Clear
              </Button>
            )}
            <Button
              size="sm"
              onClick={confirmAdd}
              disabled={selectedCount === 0}
            >
              Add {selectedCount > 0 ? `${selectedCount} ` : ""}problem
              {selectedCount !== 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
