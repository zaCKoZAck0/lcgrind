"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useAppDispatch } from "~/hooks/redux";
import { updateNote, deleteNote, UpdateNotePayload } from "~/store/problemNotesSlice";
import { Edit3, Trash2, Save, X, MoreVertical } from "lucide-react";
import type { ProblemNote } from "~/store/problemNotesSlice";

interface NoteCardProps {
  note: ProblemNote;
}

const NOTE_COLORS = [
  { name: "Yellow", value: "#fef3c7", bgClass: "bg-yellow-100" },
  { name: "Blue", value: "#dbeafe", bgClass: "bg-blue-100" },
  { name: "Green", value: "#d1fae5", bgClass: "bg-green-100" },
  { name: "Pink", value: "#fce7f3", bgClass: "bg-pink-100" },
  { name: "Purple", value: "#e9d5ff", bgClass: "bg-purple-100" },
  { name: "Orange", value: "#fed7aa", bgClass: "bg-orange-100" },
];

export function NoteCard({ note }: NoteCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(note.title);
    const [editContent, setEditContent] = useState(note.content);
    const [editColor, setEditColor] = useState(note.color || "#fef3c7");
    const dispatch = useAppDispatch();

    // Get background class for the note color
    const getBackgroundClass = (colorValue: string) => {
        const colorObj = NOTE_COLORS.find(c => c.value === colorValue);
        return colorObj?.bgClass || "bg-yellow-100";
    };

    const handleSave = () => {
        if (!editTitle.trim() || !editContent.trim()) return;

        const updatePayload: UpdateNotePayload = {
            noteId: note.id,
            title: editTitle.trim(),
            content: editContent.trim(),
            color: editColor,
        };

        dispatch(updateNote(updatePayload));
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditTitle(note.title);
        setEditContent(note.content);
        setEditColor(note.color || "#fef3c7");
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this note?")) {
            dispatch(deleteNote(note.id));
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Simple markdown rendering for display
    const renderMarkdown = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-gray-200 px-1 rounded">$1</code>')
            .replace(/\n/g, '<br />');
    };
    return (
        <div
            className={`p-4 rounded-base border-2 border-border shadow-sm hover:shadow-md transition-all ${getBackgroundClass(editColor || "#fef3c7")}`}
        >
            {isEditing ? (
                <div className="space-y-3">
                    <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="font-semibold"
                    />
                    <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[100px]"
                    />
                    <div className="space-y-2">
                        <Label className="text-xs">Color</Label>
                        <div className="flex gap-1">
                            {NOTE_COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setEditColor(color.value)}
                                    className={`w-6 h-6 rounded-full border-2 transition-all ${color.bgClass} ${editColor === color.value
                                            ? "border-black scale-110"
                                            : "border-gray-300 hover:scale-105"
                                        }`}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    </div>          <div className="flex justify-end gap-2">
                        <Button size="sm" variant="neutral" onClick={handleCancel}>
                            <X size={14} className="mr-1" />
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave}>
                            <Save size={14} className="mr-1" />
                            Save
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex gap-1 justify-between items-start">
                        <h3 className="font-semibold text-xl leading-tight">{note.title}</h3>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="noShadow"
                                    className="h-8 w-8 p-0 cursor-pointer"
                                >
                                    <MoreVertical size={14} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuGroup>
                                    <DropdownMenuItem
                                        onClick={() => setIsEditing(true)}
                                        className="cursor-pointer"
                                    >
                                        <Edit3 size={14} className="mr-2" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={handleDelete}
                                        className="cursor-pointer"
                                    >
                                        <Trash2 size={14} className="mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div
                        className="text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content) }}
                    />
                    <div className="text-xs opacity-60 mt-2">
                        Created: {formatDate(note.createdAt)}
                        {note.updatedAt !== note.createdAt && (
                            <span className="ml-2">• Updated: {formatDate(note.updatedAt)}</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
