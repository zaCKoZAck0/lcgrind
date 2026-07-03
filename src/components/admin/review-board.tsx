"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, Trash2, Pencil, Sparkles } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Badge } from "~/components/ui/badge";
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

    const byStatus = useMemo(() => {
        const map: Record<string, BoardSubmission[]> = {
            PENDING: [],
            PARSED: [],
            APPROVED: [],
            REJECTED: [],
        };
        // PARSE_FAILED (and any unknown status) files under Pending: those
        // submissions still await review and the manual Parse-with-AI fallback.
        for (const s of submissions) (map[s.status] ?? map.PENDING).push(s);
        return map;
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

    const ids = [...selected];
    const hasSelection = ids.length > 0;

    return (
        <div className="flex flex-col gap-4">
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
                    disabled={!hasSelection || isPending}
                    onClick={() =>
                        run("Approved", () => approveSubmissions(ids))
                    }
                >
                    <Check className="size-4" />
                    Approve
                </Button>
                <Button
                    size="sm"
                    variant="neutral"
                    disabled={!hasSelection || isPending}
                    onClick={() => run("Rejected", () => rejectSubmissions(ids))}
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
                {!parseAvailable && (
                    <span className="text-xs text-muted-foreground ml-auto">
                        AI parsing unavailable: set GEMINI_API_KEY to enable
                    </span>
                )}
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
        </div>
    );
}
