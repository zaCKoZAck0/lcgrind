"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";
import { useAppSelector, useAppDispatch, getProblemList } from "~/hooks/redux";
import {
  updateListMeta,
  deleteList,
  removeProblemFromList,
  reorderProblems,
} from "~/store/problemListsSlice";
import { getProblemsByIds, type ListProblem } from "~/server/actions/problems/getProblemsByIds";
import { encodeSharePayload } from "~/utils/list-share";
import { BASE_URL } from "~/config/constants";
import { SortableProblemRow } from "./sortable-problem-row";
import { AddProblemsDialog } from "./add-problems-dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ArrowLeft, Share2, Trash2, Pencil, Check, X, Loader2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

interface ListEditorPageProps {
  id: string;
}

export function ListEditorPage({ id }: ListEditorPageProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const list = useAppSelector((s) => getProblemList(s, id));

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [editingDesc, setEditingDesc] = useState(false);
  const [descInput, setDescInput] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLInputElement>(null);

  // Stable query key: sorted ids so reordering doesn't trigger refetch
  const sortedIds = list ? [...list.problemIds].sort((a, b) => a - b) : [];
  const { data: fetchedProblems, isLoading } = useQuery({
    queryKey: ["list-problems", sortedIds],
    queryFn: () => getProblemsByIds(sortedIds),
    enabled: !!list && list.problemIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // Preserve the user's ordering from the store
  const problemMap = new Map<number, ListProblem>(
    (fetchedProblems ?? []).map((p) => [p.id, p])
  );
  const orderedProblems: ListProblem[] = (list?.problemIds ?? [])
    .map((pid) => problemMap.get(pid))
    .filter((p): p is ListProblem => !!p);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (!list) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-lg font-semibold mb-4">List not found</p>
        <p className="text-foreground/60 mb-6">This list doesn&apos;t exist locally.</p>
        <Button asChild variant="neutral">
          <Link href="/lists">Back to Solvelists</Link>
        </Button>
      </div>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = list.problemIds.indexOf(active.id as number);
    const newIdx = list.problemIds.indexOf(over.id as number);
    if (oldIdx === -1 || newIdx === -1) return;
    dispatch(
      reorderProblems({
        listId: id,
        problemIds: arrayMove(list.problemIds, oldIdx, newIdx),
      })
    );
  };

  const startEditName = () => {
    setNameInput(list.name);
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  };

  const saveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== list.name) {
      dispatch(updateListMeta({ id, name: trimmed }));
    }
    setEditingName(false);
  };

  const startEditDesc = () => {
    setDescInput(list.description ?? "");
    setEditingDesc(true);
    setTimeout(() => descInputRef.current?.focus(), 0);
  };

  const saveDesc = () => {
    dispatch(updateListMeta({ id, description: descInput.trim() }));
    setEditingDesc(false);
  };

  const handleShare = async () => {
    const token = encodeSharePayload({
      id: list.id,
      name: list.name,
      problemIds: list.problemIds,
    });
    const url = `${BASE_URL}/lists/share/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied!", { description: url.slice(0, 60) + "…" });
    } catch {
      toast.error("Couldn't copy to clipboard", { description: "Copy the URL manually: " + url });
    }
  };

  const handleDelete = () => {
    dispatch(deleteList(id));
    toast.success(`"${list.name}" deleted`);
    router.push("/lists");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header row: back | spacer | share | ⋮ menu */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="neutral" size="sm" asChild>
          <Link href="/lists">
            <ArrowLeft size={16} />
            Solvelists
          </Link>
        </Button>
        <div className="flex-1" />
        <Button variant="neutral" size="sm" onClick={handleShare} className="gap-1.5">
          <Share2 size={14} />
          Share
        </Button>

        {/* Delete confirm dialog */}
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent className="sm:max-w-[380px]">
            <DialogHeader>
              <DialogTitle>Delete &ldquo;{list.name}&rdquo;?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-foreground/70">This action cannot be undone.</p>
            <div className="flex justify-end gap-3 mt-2">
              <Button variant="neutral" onClick={() => setDeleteOpen(false)}>Cancel</Button>
              <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white border-red-800">
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* 3-dot menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="neutral" size="sm" aria-label="More options">
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setDeleteOpen(true)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 size={14} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Name */}
      <div className="mb-2">
        {editingName ? (
          <div className="flex items-center gap-2">
            <Input
              ref={nameInputRef}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveName();
                if (e.key === "Escape") setEditingName(false);
              }}
              className="text-2xl font-heading font-bold h-auto py-1"
            />
            <Button size="sm" onClick={saveName}><Check size={14} /></Button>
            <Button size="sm" variant="neutral" onClick={() => setEditingName(false)}><X size={14} /></Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group">
            <h1 className="text-3xl font-heading font-bold">{list.name}</h1>
            <button
              onClick={startEditName}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-foreground/40 hover:text-foreground focus:opacity-100 focus:outline-none"
              aria-label="Edit list name"
            >
              <Pencil size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="mb-6">
        {editingDesc ? (
          <div className="flex items-center gap-2">
            <Input
              ref={descInputRef}
              value={descInput}
              onChange={(e) => setDescInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveDesc();
                if (e.key === "Escape") setEditingDesc(false);
              }}
              placeholder="Add a description…"
              className="text-sm"
            />
            <Button size="sm" onClick={saveDesc}><Check size={14} /></Button>
            <Button size="sm" variant="neutral" onClick={() => setEditingDesc(false)}><X size={14} /></Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group">
            <p className="text-foreground/60 text-sm cursor-text" onClick={startEditDesc}>
              {list.description || (
                <span className="italic text-foreground/40">Add a description…</span>
              )}
            </p>
            <button
              onClick={startEditDesc}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-foreground/40 hover:text-foreground focus:opacity-100 focus:outline-none"
              aria-label="Edit description"
            >
              <Pencil size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Problem count */}
      <p className="text-sm text-foreground/50 mb-4">
        {list.problemIds.length} problem{list.problemIds.length !== 1 ? "s" : ""}
      </p>

      {/* Sortable problem list */}
      <div className="border-2 border-border rounded-base overflow-hidden shadow-shadow mb-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-foreground/50">
            <Loader2 size={18} className="animate-spin" />
            Loading problems…
          </div>
        ) : list.problemIds.length === 0 ? (
          <div className="py-12 text-center text-foreground/50">
            <p>No problems yet. Add some below.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
          >
            <SortableContext
              items={list.problemIds}
              strategy={verticalListSortingStrategy}
            >
              {orderedProblems.map((problem, i) => (
                <SortableProblemRow
                  key={problem.id}
                  problem={problem}
                  index={i}
                  onRemove={(pid) =>
                    dispatch(removeProblemFromList({ listId: id, problemId: pid }))
                  }
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add problem */}
      <AddProblemsDialog listId={id} />
    </div>
  );
}
