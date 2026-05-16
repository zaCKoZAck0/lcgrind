"use client";

import React from "react";
import Link from "next/link";
import { useAppSelector, getAllListsOrdered } from "~/hooks/redux";
import { CreateListDialog } from "./create-list-dialog";
import { buttonVariants } from "~/components/ui/button";
import { BookMarked } from "lucide-react";
import { cn } from "~/lib/utils";

function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  const y = Math.floor(d / 365);
  return `${y}y ago`;
}

export function ListsIndexPage() {
  const lists = useAppSelector(getAllListsOrdered);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold">Solvelists</h1>
          <p className="text-foreground/60 mt-1">Custom problem lists</p>
        </div>
        <CreateListDialog />
      </div>

      {lists.length === 0 ? (
        <div className="border-2 border-border rounded-base p-12 text-center shadow-shadow">
          <BookMarked size={40} className="mx-auto mb-4 text-foreground/30" />
          <p className="text-lg font-semibold">No Solvelists yet</p>
          <p className="text-foreground/60 mt-1 mb-6">
            Create a Solvelist to organize and track problems you want to practice.
          </p>
          <CreateListDialog />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {lists.map((list) => (
            <Link
              key={list.id}
              href={`/lists/${list.id}`}
              className={cn(
                buttonVariants({ variant: "neutral" }),
                "aspect-square h-auto flex flex-col items-start justify-between p-5 cursor-pointer"
              )}
            >
              <div className="w-full min-w-0">
                <p className="font-semibold text-xl leading-tight line-clamp-2">{list.name}</p>
                {list.description && (
                  <p className="text-sm text-foreground/60 mt-1.5 line-clamp-2">{list.description}</p>
                )}
              </div>
              <p className="text-sm text-foreground/50 mt-3 shrink-0">
                {list.problemIds.length} problem{list.problemIds.length !== 1 ? "s" : ""} · {relativeTime(list.updatedAt)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
