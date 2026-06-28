"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    MoreHorizontal,
    Flag,
    Trash2,
    Pencil,
    Plus,
    Pin,
    PinOff,
} from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "~/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { reportContent } from "~/server/actions/moderation/report";
import { removeContent } from "~/server/actions/moderation/actions";
import { pinPost, unpinPost } from "~/server/actions/moderation/pin";
import { editPost, deletePost } from "~/server/actions/posts/createPost";
import { deleteComment } from "~/server/actions/comments/addComment";
import { getPostForEdit, type PostEditData } from "~/server/actions/posts/getPostForEdit";
import { FEATURE_FLAGS } from "~/config/feature-flags";
import type { ReportTargetType } from "~/server/actions/moderation/core";

const REASONS = ["Spam", "Harassment", "Off-topic", "Other"] as const;

const ROUND_TYPES = [
    "Phone Screen",
    "Coding",
    "System Design",
    ...(FEATURE_FLAGS.LLD ? ["Machine Coding / LLD"] : []),
    ...(FEATURE_FLAGS.OTHERS ? ["Behavioral", "HR", "Other"] : []),
];

type RoundDraft = { type: string; questions: string[] };
const emptyRound = (): RoundDraft => ({ type: "Coding", questions: [""] });

// Builds the experience body markdown from structured data — mirrors server-side
// buildExperienceBody so the client can generate the body before calling editPost.
function buildExperienceBody(
    companyName: string,
    structured: { role: string; rounds: RoundDraft[] },
): string {
    const lines: string[] = [];
    const role = structured.role.trim();
    lines.push(role ? `## ${companyName} — ${role}` : `## ${companyName}`);
    lines.push("");
    structured.rounds.forEach((r, i) => {
        lines.push(`### Round ${i + 1} — ${r.type}`);
        lines.push("");
        r.questions.filter((q) => q.trim()).forEach((q) => lines.push(`- ${q.trim()}`));
        lines.push("");
    });
    return lines.join("\n").trim();
}

// Unified content-actions menu. One "..." trigger for all viewer roles:
// - Owner:    Edit + Delete (post dialog / comment inline, soft-delete)
// - Reporter: Report with reason submenu
// - Admin:    Remove (hard admin action)
export function ModerationMenu({
    targetType,
    targetId,
    postParam,
    canReport,
    isAdmin = false,
    isOwner = false,
    canPin: canPinProp = false,
    isPinned = false,
    // Post-owner props (only relevant when targetType === "POST")
    postTitle,
    postBody,
    postType,
    // Comment-owner prop (only relevant when targetType === "COMMENT")
    onEditComment,
}: {
    targetType: ReportTargetType;
    targetId: string;
    postParam: string;
    canReport: boolean;
    isAdmin?: boolean;
    isOwner?: boolean;
    canPin?: boolean;
    isPinned?: boolean;
    postTitle?: string;
    postBody?: string;
    postType?: string | null;
    onEditComment?: () => void;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    // Post edit dialog state
    const [editOpen, setEditOpen] = useState(false);
    const [editTitle, setEditTitle] = useState(postTitle ?? "");
    const [editBody, setEditBody] = useState(postBody ?? "");
    // Structured experience state (loaded lazily when dialog opens for EXPERIENCE posts)
    const [editData, setEditData] = useState<PostEditData | null>(null);
    const [editDataLoading, setEditDataLoading] = useState(false);
    const [role, setRole] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [rounds, setRounds] = useState<RoundDraft[]>([emptyRound()]);
    const didLoadStructured = useRef(false);

    const isExperience = postType === "EXPERIENCE";

    const nothing = !canReport && !isAdmin && !isOwner && !canPinProp;
    if (nothing) return null;

    // Load structured data the first time the edit dialog is opened for an
    // EXPERIENCE post (lazy — avoids an extra server round-trip on render).
    useEffect(() => {
        if (!editOpen || !isExperience || targetType !== "POST" || didLoadStructured.current) return;
        didLoadStructured.current = true;
        setEditDataLoading(true);
        getPostForEdit(targetId).then((data) => {
            setEditData(data);
            if (data.ok && data.structured) {
                setRole(data.structured.role);
                setCompanyName(data.companyName ?? "");
                setRounds(
                    data.structured.rounds.length > 0
                        ? data.structured.rounds.map((r) => ({
                              type: r.type,
                              questions: r.questions.length > 0 ? r.questions : [""],
                          }))
                        : [emptyRound()],
                );
            }
            setEditDataLoading(false);
        });
    }, [editOpen, isExperience, targetId, targetType]);

    const isStructuredForm = isExperience && editData?.ok && editData.structured !== null;

    // --- Report ---
    const report = (reason: string) =>
        startTransition(async () => {
            const res = await reportContent({ targetType, targetId, reason });
            if (res.ok === true) toast.success("Reported. Thanks for flagging this.");
            else toast.error(res.error);
        });

    // --- Admin remove ---
    const remove = () =>
        startTransition(async () => {
            const res = await removeContent({ targetType, targetId, postParam });
            if (res.ok === true) {
                toast.success("Removed.");
                router.refresh();
            } else {
                toast.error(res.error);
            }
        });

    // --- Owner delete ---
    const handleDelete = () =>
        startTransition(async () => {
            if (targetType === "POST") {
                const res = await deletePost(targetId, postParam);
                if (res.ok === true) {
                    toast.success("Post deleted.");
                    router.push("/grinds");
                } else {
                    toast.error(res.error);
                    setIsConfirmingDelete(false);
                }
            } else {
                const res = await deleteComment(targetId, postParam);
                if (res.ok === true) {
                    toast.success("Deleted.");
                    setIsConfirmingDelete(false);
                    router.refresh();
                } else {
                    toast.error(res.error);
                    setIsConfirmingDelete(false);
                }
            }
        });

    // --- Owner save post edit ---
    const handleSaveEdit = () => {
        startTransition(async () => {
            let bodyToSave = editBody;
            if (isStructuredForm) {
                bodyToSave = buildExperienceBody(companyName, { role, rounds });
            }
            const res = await editPost(targetId, { title: editTitle, body: bodyToSave });
            if (res.ok === true) {
                toast.success("Post updated.");
                setEditOpen(false);
                router.refresh();
            } else {
                toast.error(res.error);
            }
        });
    };

    // --- Moderator pin/unpin ---
    const handlePin = () =>
        startTransition(async () => {
            const res = isPinned
                ? await unpinPost(targetId, postParam)
                : await pinPost(targetId, postParam);
            if (res.ok === true) {
                toast.success(isPinned ? "Post unpinned." : "Post pinned.");
                router.refresh();
            } else {
                toast.error(res.error);
            }
        });

    const hasOwnerSection = isOwner;
    const hasReportSection = canReport;
    const hasModSection = canPinProp && targetType === "POST";
    const hasAdminSection = isAdmin;

    return (
        <>
            <DropdownMenu
                open={dropdownOpen}
                onOpenChange={(open) => {
                    setDropdownOpen(open);
                    if (!open) setIsConfirmingDelete(false);
                }}
            >
                <DropdownMenuTrigger
                    aria-label="More actions"
                    disabled={isPending}
                    className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-50 cursor-pointer"
                >
                    <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {/* Owner actions */}
                    {hasOwnerSection && (
                        <>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onSelect={(e) => {
                                    if (targetType === "POST") {
                                        e.preventDefault();
                                        setDropdownOpen(false);
                                        setEditTitle(postTitle ?? "");
                                        setEditBody(postBody ?? "");
                                        setEditOpen(true);
                                    } else {
                                        onEditComment?.();
                                    }
                                }}
                            >
                                <Pencil className="size-3.5" />
                                Edit
                            </DropdownMenuItem>
                            {isConfirmingDelete ? (
                                <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    onClick={handleDelete}
                                    disabled={isPending}
                                    className="text-red-600 focus:text-red-600 font-semibold cursor-pointer"
                                >
                                    <Trash2 className="size-3.5" />
                                    Confirm delete?
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    onClick={() => setIsConfirmingDelete(true)}
                                    className="text-red-600 focus:text-red-600 cursor-pointer"
                                >
                                    <Trash2 className="size-3.5" />
                                    Delete
                                </DropdownMenuItem>
                            )}
                        </>
                    )}

                    {/* Report section */}
                    {hasOwnerSection && hasReportSection && <DropdownMenuSeparator />}
                    {hasReportSection && (
                        <>
                            <DropdownMenuLabel className="flex items-center gap-1.5">
                                <Flag className="size-3.5" />
                                Report
                            </DropdownMenuLabel>
                            {REASONS.map((reason) => (
                                <DropdownMenuItem
                                    key={reason}
                                    onClick={() => report(reason)}
                                    className="cursor-pointer"
                                >
                                    {reason}
                                </DropdownMenuItem>
                            ))}
                        </>
                    )}

                    {/* Moderator section */}
                    {(hasOwnerSection || hasReportSection) && hasModSection && (
                        <DropdownMenuSeparator />
                    )}
                    {hasModSection && (
                        <DropdownMenuItem
                            onClick={handlePin}
                            disabled={isPending}
                            className="cursor-pointer"
                        >
                            {isPinned ? (
                                <>
                                    <PinOff className="size-3.5" />
                                    Unpin post
                                </>
                            ) : (
                                <>
                                    <Pin className="size-3.5" />
                                    Pin post
                                </>
                            )}
                        </DropdownMenuItem>
                    )}

                    {/* Admin section */}
                    {(hasOwnerSection || hasReportSection || hasModSection) && hasAdminSection && (
                        <DropdownMenuSeparator />
                    )}
                    {hasAdminSection && (
                        <DropdownMenuItem
                            onClick={remove}
                            className="text-red-600 focus:text-red-600 cursor-pointer"
                        >
                            <Trash2 className="size-3.5" />
                            Remove (admin)
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Post edit dialog (only for POST target with owner) */}
            {targetType === "POST" && isOwner && (
                <Dialog
                    open={editOpen}
                    onOpenChange={(open) => {
                        if (!open) {
                            setEditTitle(postTitle ?? "");
                            setEditBody(postBody ?? "");
                        }
                        setEditOpen(open);
                    }}
                >
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit post</DialogTitle>
                        </DialogHeader>

                        {editDataLoading ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">
                                Loading…
                            </p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {/* Title — always shown */}
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="edit-post-title">Title</Label>
                                    <Input
                                        id="edit-post-title"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        disabled={isPending}
                                    />
                                </div>

                                {isStructuredForm ? (
                                    /* Structured experience form */
                                    <>
                                        <div className="flex flex-col gap-1.5">
                                            <Label htmlFor="edit-role">Role</Label>
                                            <Input
                                                id="edit-role"
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                                placeholder="e.g. Software Engineer"
                                                disabled={isPending}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <Label>Rounds</Label>
                                            {rounds.map((round, ri) => (
                                                <Card key={ri} className="gap-0 py-0 shadow-none">
                                                    <CardHeader className="flex-row items-center justify-between p-3 border-b-2 border-border">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-semibold text-sm">
                                                                Round {ri + 1}
                                                            </span>
                                                            <Select
                                                                value={round.type}
                                                                onValueChange={(v) =>
                                                                    setRounds((rs) =>
                                                                        rs.map((r, idx) =>
                                                                            idx === ri ? { ...r, type: v } : r,
                                                                        ),
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger className="w-[160px]">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {ROUND_TYPES.map((t) => (
                                                                        <SelectItem key={t} value={t}>
                                                                            {t}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            aria-label="Remove round"
                                                            disabled={rounds.length === 1 || isPending}
                                                            onClick={() =>
                                                                setRounds((rs) =>
                                                                    rs.filter((_, idx) => idx !== ri),
                                                                )
                                                            }
                                                            className="inline-flex items-center justify-center size-7 rounded-base border-2 border-border text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors cursor-pointer"
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </button>
                                                    </CardHeader>
                                                    <CardContent className="flex flex-col gap-2 p-3">
                                                        {round.questions.map((q, qi) => (
                                                            <div key={qi} className="flex items-center gap-2">
                                                                <Input
                                                                    value={q}
                                                                    onChange={(e) =>
                                                                        setRounds((rs) =>
                                                                            rs.map((r, idx) =>
                                                                                idx === ri
                                                                                    ? {
                                                                                          ...r,
                                                                                          questions: r.questions.map(
                                                                                              (qv, qidx) =>
                                                                                                  qidx === qi
                                                                                                      ? e.target.value
                                                                                                      : qv,
                                                                                          ),
                                                                                      }
                                                                                    : r,
                                                                            ),
                                                                        )
                                                                    }
                                                                    placeholder="Question asked"
                                                                    disabled={isPending}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    aria-label="Remove question"
                                                                    disabled={round.questions.length === 1 || isPending}
                                                                    onClick={() =>
                                                                        setRounds((rs) =>
                                                                            rs.map((r, idx) =>
                                                                                idx === ri
                                                                                    ? {
                                                                                          ...r,
                                                                                          questions: r.questions.filter(
                                                                                              (_, qidx) => qidx !== qi,
                                                                                          ),
                                                                                      }
                                                                                    : r,
                                                                            ),
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center justify-center size-7 rounded-base border-2 border-border text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors shrink-0 cursor-pointer"
                                                                >
                                                                    <Trash2 className="size-3.5" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <Button
                                                            type="button"
                                                            variant="neutral"
                                                            size="sm"
                                                            className="self-start"
                                                            disabled={isPending}
                                                            onClick={() =>
                                                                setRounds((rs) =>
                                                                    rs.map((r, idx) =>
                                                                        idx === ri
                                                                            ? { ...r, questions: [...r.questions, ""] }
                                                                            : r,
                                                                    ),
                                                                )
                                                            }
                                                        >
                                                            <Plus className="size-3.5" />
                                                            Add question
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="neutral"
                                                size="sm"
                                                className="self-start"
                                                disabled={isPending}
                                                onClick={() =>
                                                    setRounds((rs) => [...rs, emptyRound()])
                                                }
                                            >
                                                <Plus className="size-3.5" />
                                                Add round
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    /* Plain body textarea for non-EXPERIENCE or TEXT-mode EXPERIENCE */
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="edit-post-body">Body</Label>
                                        <Textarea
                                            id="edit-post-body"
                                            value={editBody}
                                            onChange={(e) => setEditBody(e.target.value)}
                                            rows={10}
                                            disabled={isPending}
                                            className="resize-y"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                variant="neutral"
                                onClick={() => setEditOpen(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveEdit}
                                disabled={
                                    isPending ||
                                    editDataLoading ||
                                    editTitle.trim() === "" ||
                                    (isStructuredForm &&
                                        rounds.every((r) =>
                                            r.questions.every((q) => q.trim() === ""),
                                        ))
                                }
                            >
                                Save changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
