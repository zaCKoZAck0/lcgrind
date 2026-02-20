"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { useAppDispatch } from "~/hooks/redux";
import { addNote, CreateNotePayload } from "~/store/problemNotesSlice";
import { Plus } from "lucide-react";
import { cn } from "~/lib/utils";

interface AddNoteDialogProps {
  problemId: string;
  problemTitle: string;
}

const NOTE_COLORS = [
  { name: "Yellow", value: "#fef3c7", bgClass: "bg-yellow-100" },
  { name: "Blue", value: "#dbeafe", bgClass: "bg-blue-100" },
  { name: "Green", value: "#d1fae5", bgClass: "bg-green-100" },
  { name: "Pink", value: "#fce7f3", bgClass: "bg-pink-100" },
  { name: "Purple", value: "#e9d5ff", bgClass: "bg-purple-100" },
  { name: "Orange", value: "#fed7aa", bgClass: "bg-orange-100" },
];

export function AddNoteDialog({ problemId, problemTitle }: AddNoteDialogProps) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0].value);
    const dispatch = useAppDispatch();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    
        if (!title.trim() || !content.trim()) return;

        const notePayload: CreateNotePayload = {
            problemId,
            title: title.trim(),
            content: content.trim(),
            color: selectedColor,
        };

        dispatch(addNote(notePayload));
    
        // Reset form
        setTitle("");
        setContent("");
        setSelectedColor(NOTE_COLORS[0].value);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="neutral" size="sm" className="gap-2">
                    <Plus size={16} />
                Add Note
            </Button>
        </DialogTrigger>
            <DialogContent className={cn("sm:max-w-[500px] text-gray-900", NOTE_COLORS.find(c => c.value === selectedColor)?.bgClass || NOTE_COLORS[0].bgClass)}>
                <DialogHeader>
                    <DialogTitle className="text-gray-900">Add Note for {problemTitle}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="note-title">Title</Label>
                        <Input
                            id="note-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter note title..."
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="note-content">Content</Label>
                        <Textarea
                            id="note-content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Enter your note content (markdown supported)"
                            className="min-h-[220px]"   
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Note Color</Label>
                        <div className="flex gap-2 flex-wrap">
                            {NOTE_COLORS.map((color) => (
                                <button
                                key={color.value}
                                type="button"
                                onClick={() => setSelectedColor(color.value)}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${color.bgClass} ${selectedColor === color.value
                                        ? "border-black scale-110"
                                        : "border-gray-300 hover:scale-105"
                                    }`}
                                title={color.name}
                            />
                        ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="neutral"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">Add Note</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
