"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, Trash2, Pencil, Sparkles, Clock } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Badge } from "~/components/ui/badge";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "~/components/ui/dialog";
import {
    approveSubmissions,
    rejectSubmissions,
    deleteSubmissions,
    parseSubmissions,
} from "~/server/actions/admin/actions";
import { SubmissionDrawer } from "./submission-drawer";

export type BoardSubmission = {
    id: string;
    companyId: number | null;
    companyName: string;
    mode: string;
    rawText: string | null;
    structured: unknown;
    parsed: unknown;
    parseError: string | null;
    status: string;
    adminNote: string | null;
    createdAt: string;
    userName: string;
    userEmail: string;
};

const COLUMNS: { status: string; label: string }[] = [
    { status: "PENDING", label: "Pending" },
    { status: "PARSED", label: "Parsed" },
    { status: "APPROVED", label: "Approved" },
    { status: "REJECTED", label: "Rejected" },
];

// FORM submissions carry a structured payload and stay PENDING; TEXT
// submissions become approvable once parsed. No payload = nothing to merge.
const isApprovable = (s: BoardSubmission) =>
    (s.status === "PARSED" || s.status === "PENDING") &&
    (s.parsed ?? s.structured) != null;

function formatAge(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return `${diffMin}m`;
    const diffH = Math.floor(diffMs / 3600000);
    if (diffH < 48) return `${diffH}h`;
    return `${Math.floor(diffH / 24)}d`;
}

export function ReviewBoard({
    submissions,
    parseAvailable,
}: {
    submissions: BoardSubmission[];
    parseAvailable: boolean;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [editing, setEditing] = useState<BoardSubmission | null>(null);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectNote, setRejectNote] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [parseFilter, setParseFilter] = useState("ALL");
    const [companyFilter, setCompanyFilter] = useState("ALL");

    const companies = useMemo(() => {
        const names = [...new Set(submissions.map((s) => s.companyName))].sort();
        return names;
    }, [submissions]);

    const visible = useMemo(() => {
        return submissions.filter((s) => {
            if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
            if (parseFilter === "PARSED" && s.parsed == null) return false;
            if (
                parseFilter === "UNPARSED" &&
                (s.parsed != null || s.status === "PARSE_FAILED")
            )
                return false;
            if (parseFilter === "PARSE_FAILED" && s.status !== "PARSE_FAILED")
                return false;
            if (companyFilter !== "ALL" && s.companyName !== companyFilter)
                return false;
            return true;
        });
    }, [submissions, statusFilter, parseFilter, companyFilter]);

    const visibleIds = useMemo(() => new Set(visible.map((s) => s.id)), [visible]);

    // Filters must not leave hidden items in the batch: prune selection to
    // what the admin can currently see.
    useEffect(() => {
        setSelected((prev) => {
            const next = new Set([...prev].filter((id) => visibleIds.has(id)));
            return next.size === prev.size ? prev : next;
        });
    }, [visibleIds]);

    const byStatus = useMemo(() => {
        const map: Record<string, BoardSubmission[]> = {
            PENDING: [],
            PARSED: [],
            APPROVED: [],
            REJECTED: [],
        };
        // PARSE_FAILED (and any unknown status) files under Pending: those
        // submissions still await review and the manual Parse-with-AI fallback.
        for (const s of visible) (map[s.status] ?? map.PENDING).push(s);
        return map;
    }, [visible]);

    const oldestUnreviewed = useMemo(() => {
        const unreviewed = submissions.filter(
            (s) =>
                s.status === "PENDING" ||
                s.status === "PARSE_FAILED" ||
                s.status === "PARSED",
        );
        if (unreviewed.length === 0) return null;
        return unreviewed.reduce((oldest, s) =>
            s.createdAt < oldest.createdAt ? s : oldest,
        ).createdAt;
    }, [submissions]);

    const toggle = (id: string) =>
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) { next.delete(id); } else { next.add(id); }
            return next;
        });

    const run = (
        label: string,
        fn: () => Promise<{ ok: boolean; error?: string }>,
    ) =>
        startTransition(async () => {
            const result = await fn();
            if (result.ok) {
                toast.success(label);
                setSelected(new Set());
                router.refresh();
            } else {
                toast.error(result.error ?? "Action failed");
            }
        });

    const runApprove = () =>
        startTransition(async () => {
            const result = await approveSubmissions(ids);
            if (result.ok === false) {
                toast.error(result.error ?? "Approve failed");
                return;
            }
            const okCount = result.results.filter((r) => r.ok).length;
            const failed = result.results.filter((r) => !r.ok);
            if (okCount > 0) toast.success(`Approved ${okCount} submission(s)`);
            for (const f of failed) {
                const co =
                    submissions.find((s) => s.id === f.id)?.companyName ?? f.id;
                toast.error(`${co}: ${f.error ?? "could not approve"}`);
            }
            setSelected(new Set());
            router.refresh();
        });

    const runParse = () =>
        startTransition(async () => {
            const result = await parseSubmissions(ids);
            if (result.ok === false) {
                toast.error(result.error ?? "Parse failed");
                return;
            }
            const failed = result.results.filter((r) => r.ok === false);
            const ok = result.results.length - failed.length;
            if (ok > 0) toast.success(`Parsed ${ok} submission(s)`);
            for (const f of failed) {
                const co = submissions.find((s) => s.id === f.id)?.companyName ?? f.id;
                toast.error(`${co}: ${f.error ?? "could not parse"}`);
            }
            setSelected(new Set());
            router.refresh();
        });

    const confirmReject = () => {
        const note = rejectNote.trim() || null;
        setRejectOpen(false);
        setRejectNote("");
        run("Rejected", () => rejectSubmissions(ids, note));
    };

    const ids = [...selected];
    const hasSelection = ids.length > 0;
    const selectionGated =
        hasSelection &&
        ids.some((id) => {
            const s = submissions.find((sub) => sub.id === id);
            return !s || !isApprovable(s);
        });

    return (
        <div className="flex flex-col gap-4">
            {/* Filters bar */}
            <div className="flex flex-wrap items-center gap-2 p-3 border-2 border-border bg-card">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All statuses</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="PARSED">Parsed</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                        <SelectItem value="PARSE_FAILED">Parse failed</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={parseFilter} onValueChange={setParseFilter}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Parse state" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All parse states</SelectItem>
                        <SelectItem value="PARSED">Parsed</SelectItem>
                        <SelectItem value="UNPARSED">Unparsed</SelectItem>
                        <SelectItem value="PARSE_FAILED">Parse failed</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Company" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All companies</SelectItem>
                        {companies.map((name) => (
                            <SelectItem key={name} value={name}>
                                {name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Action bar */}
            <div className="flex flex-wrap items-center gap-2 p-3 border-2 border-border bg-card sticky top-2 z-10">
                <span className="text-sm font-semibold mr-2">
                    {ids.length} selected
                </span>
                <Button
                    size="sm"
                    variant="neutral"
                    disabled={!hasSelection || isPending || !parseAvailable}
                    title={
                        parseAvailable
                            ? "Extract structured data with AI"
                            : "AI parsing unavailable: GEMINI_API_KEY not configured"
                    }
                    onClick={runParse}
                >
                    <Sparkles className="size-4" />
                    Parse with AI
                </Button>
                <Button
                    size="sm"
                    disabled={!hasSelection || isPending || selectionGated}
                    title={
                        selectionGated
                            ? "Selection includes unparsed or parse-failed submissions"
                            : undefined
                    }
                    onClick={runApprove}
                >
                    <Check className="size-4" />
                    Approve
                </Button>
                <Button
                    size="sm"
                    variant="neutral"
                    disabled={!hasSelection || isPending}
                    onClick={() => setRejectOpen(true)}
                >
                    <X className="size-4" />
                    Reject
                </Button>
                <Button
                    size="sm"
                    variant="neutral"
                    disabled={!hasSelection || isPending}
                    onClick={() => {
                        if (confirm(`Delete ${ids.length} submission(s)? This cannot be undone.`)) {
                            run("Deleted", () => deleteSubmissions(ids));
                        }
                    }}
                >
                    <Trash2 className="size-4" />
                    Delete
                </Button>
                <div className="ml-auto flex items-center gap-3">
                    {!parseAvailable && (
                        <span className="text-xs text-muted-foreground">
                            AI parsing unavailable: set GEMINI_API_KEY to enable
                        </span>
                    )}
                    {oldestUnreviewed && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            Oldest unreviewed: {formatAge(oldestUnreviewed)}
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {COLUMNS.map((col) => (
                    <div key={col.status} className="flex flex-col gap-3">
                        <div className="p-2 border-2 border-border bg-main text-main-foreground font-semibold text-sm flex justify-between">
                            <span>{col.label}</span>
                            <span>{byStatus[col.status]?.length ?? 0}</span>
                        </div>
                        {(byStatus[col.status] ?? []).map((s) => {
                            const preview =
                                s.mode === "TEXT"
                                    ? (s.rawText ?? "").slice(0, 140)
                                    : `Structured report`;
                            return (
                                <div
                                    key={s.id}
                                    className="border-2 border-border bg-card p-3 flex flex-col gap-2 shadow-shadow"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <Checkbox
                                                checked={selected.has(s.id)}
                                                onCheckedChange={() => toggle(s.id)}
                                            />
                                            <span className="font-semibold text-sm">
                                                {s.companyName}
                                            </span>
                                        </label>
                                        <Button
                                            size="icon"
                                            variant="neutral"
                                            className="size-7"
                                            aria-label="Edit submission"
                                            onClick={() => setEditing(s)}
                                        >
                                            <Pencil className="size-3.5" />
                                        </Button>
                                    </div>
                                    {s.companyId === null && (
                                        <Badge className="bg-red-300 text-black">
                                            Unlinked company
                                        </Badge>
                                    )}
                                    {s.status === "PARSE_FAILED" && (
                                        <Badge
                                            className="bg-red-300 text-black"
                                            title={s.parseError ?? undefined}
                                        >
                                            Parse failed
                                        </Badge>
                                    )}
                                    <p className="text-xs text-muted-foreground line-clamp-3">
                                        {preview}
                                    </p>
                                    <span className="text-[10px] text-muted-foreground/70">
                                        {s.userName} · {new Date(s.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {editing && (
                <SubmissionDrawer
                    submission={editing}
                    onClose={() => setEditing(null)}
                    onSaved={() => {
                        setEditing(null);
                        router.refresh();
                    }}
                    parseAvailable={parseAvailable}
                />
            )}

            <Dialog
                open={rejectOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setRejectOpen(false);
                        setRejectNote("");
                    }
                }}
            >
                <DialogContent className="max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>Reject {ids.length} submission(s)</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="reject-note">
                            Note (optional, shared across all selected)
                        </Label>
                        <Textarea
                            id="reject-note"
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                            placeholder="Reason for rejection..."
                            rows={3}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="neutral"
                            onClick={() => {
                                setRejectOpen(false);
                                setRejectNote("");
                            }}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button onClick={confirmReject} disabled={isPending}>
                            Confirm reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
