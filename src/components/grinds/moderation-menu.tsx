"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    MoreHorizontal,
    Flag,
    Trash2,
    Pencil,
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
import { reportContent } from "~/server/actions/moderation/report";
import { removeContent } from "~/server/actions/moderation/actions";
import { pinPost, unpinPost } from "~/server/actions/moderation/pin";
import { deletePost } from "~/server/actions/posts/createPost";
import { deleteComment } from "~/server/actions/comments/addComment";
import type { ReportTargetType } from "~/server/actions/moderation/core";

const REASONS = ["Spam", "Harassment", "Off-topic", "Other"] as const;

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
    onEditComment?: () => void;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    const nothing = !canReport && !isAdmin && !isOwner && !canPinProp;
    if (nothing) return null;

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
                                onSelect={() => {
                                    if (targetType === "POST") {
                                        router.push(`/grinds/${postParam}/edit`);
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
        </>
    );
}
