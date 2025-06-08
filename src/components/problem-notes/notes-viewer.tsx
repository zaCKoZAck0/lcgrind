"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { useAppSelector, getProblemNotes } from "~/hooks/redux";
import { StickyNote, FileText } from "lucide-react";
import { NoteCard } from "./note-card";
import { AddNoteDialog } from "./add-note-dialog";

interface NotesViewerProps {
  problemId: string;
  problemTitle: string;
}

export function NotesViewer({ problemId, problemTitle }: NotesViewerProps) {
    const notes = useAppSelector((state) => getProblemNotes(state, problemId));

    return (
        <Dialog>      <DialogTrigger asChild>
            <Button
                variant="reverse"
                size="sm"
                className="gap-2 cursor-pointer relative h-fit bg-secondary-background text-secondary border-secondary"
                title={`${notes.length} note${notes.length !== 1 ? 's' : ''}`}
            >
                <StickyNote size={16} /> Notes
                {notes.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-main text-main-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {notes.length}
                    </span>
                )}
            </Button>
        </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
                <DialogHeader className="flex flex-row items-center justify-between">
                    <DialogTitle className="flex text-foreground items-center gap-2">
                        <FileText size={20} />
                        Notes for {problemTitle}
                    </DialogTitle>
                    <AddNoteDialog problemId={problemId} problemTitle={problemTitle} />
                </DialogHeader>
        
                <div className="overflow-y-auto max-h-[60vh] space-y-4">
                    {notes.length === 0 ? (
                        <div className="text-center py-8 text-foreground">
                            <StickyNote size={48} className="mx-auto mb-4" />
                            <p className="text-lg font-medium">No notes yet</p>
                            <p className="text-sm">Click "Add Note" to create your first note for this problem.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {notes
                                .sort((a, b) => b.updatedAt - a.updatedAt) // Sort by most recently updated
                                .map((note) => (
                                    <NoteCard key={note.id} note={note} />
                                ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
