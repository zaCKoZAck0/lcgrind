"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "~/hooks/redux";
import { upsertSharedList } from "~/store/problemListsSlice";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ProblemRow } from "~/components/company/problem-row";
import { toast } from "sonner";
import { CheckCircle2, BookMarked, RefreshCw } from "lucide-react";
import type { SharePayload } from "~/utils/list-share";
import type { ListProblem } from "~/server/actions/problems/getProblemsByIds";

interface SharedListViewProps {
  shared: SharePayload;
  problems: ListProblem[];
}

export type DiffState =
  | { kind: "absent" }
  | { kind: "identical" }
  | { kind: "drift"; localName: string; localCount: number };

export function computeDiffState(
  shared: SharePayload,
  local: { name: string; problemIds: number[] } | undefined
): DiffState {
  if (!local) return { kind: "absent" };
  const namesMatch = local.name === shared.name;
  const idsMatch =
    local.problemIds.length === shared.problemIds.length &&
    local.problemIds.every((id, i) => id === shared.problemIds[i]);
  if (namesMatch && idsMatch) return { kind: "identical" };
  return { kind: "drift", localName: local.name, localCount: local.problemIds.length };
}

export function SharedListView({ shared, problems }: SharedListViewProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const localList = useAppSelector((s) => s.problemLists.lists[shared.id]);
  const diff = computeDiffState(shared, localList);
  const now = Date.now();

  const save = () => {
    dispatch(
      upsertSharedList({
        id: shared.id,
        name: shared.name,
        problemIds: shared.problemIds,
        createdAt: localList?.createdAt ?? now,
        updatedAt: now,
      })
    );
    toast.success(`"${shared.name}" saved to Solvelists`);
    router.push(`/lists/${shared.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-heading font-bold">{shared.name}</h1>
            <p className="text-foreground/60 mt-1">
              {shared.problemIds.length} problem{shared.problemIds.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            {diff.kind === "absent" && (
              <Button onClick={save} className="gap-2">
                <BookMarked size={16} />
                Save to Solvelists
              </Button>
            )}
            {diff.kind === "drift" && (
              <>
                <Button onClick={save} variant="neutral" className="gap-2 border-orange-500 text-orange-700 hover:bg-orange-50 dark:text-orange-300 dark:hover:bg-orange-950">
                  <RefreshCw size={16} />
                  Update local copy
                </Button>
                <p className="text-xs text-foreground/50 text-right">
                  Local: &ldquo;{diff.localName}&rdquo; · {diff.localCount} problems
                </p>
              </>
            )}
            {diff.kind === "identical" && (
              <div className="flex flex-col items-end gap-1">
                <span className="flex items-center gap-1.5 text-sm font-medium text-green-700 dark:text-green-400">
                  <CheckCircle2 size={16} />
                  Already in Solvelists
                </span>
                <Button variant="neutral" size="sm" asChild>
                  <Link href={`/lists/${shared.id}`}>Open & edit</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Problem list (read-only) */}
      <div className="border-2 border-border rounded-base overflow-hidden shadow-shadow">
        {problems.length === 0 ? (
          <div className="p-8 text-center text-foreground/50">This list has no problems.</div>
        ) : (
          problems.map((p, i) => (
            <ProblemRow
              key={p.id}
              index={i}
              order="all-problems"
              problemUrl={p.url}
              problemTitle={p.title}
              problemId={p.id.toString()}
              difficulty={p.difficulty}
              acceptance={p.acceptance}
              isPaid={p.isPaid}
              tags={p.tags}
            />
          ))
        )}
      </div>
    </div>
  );
}
