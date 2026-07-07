"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, Loader2, Sparkles } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "~/components/ui/accordion";
import {
    getMergePreview,
    approveSubmissions,
    rejectSubmissions,
    parseSubmissions,
    updateSubmissionFields,
} from "~/server/actions/admin/actions";
import { resolveCompanyByName } from "~/server/actions/admin/lookup";
import type { MergePreview } from "~/server/actions/admin/preview";
import type { BoardSubmission } from "./review-board";

export function SubmissionDrawer({
    submission,
    onClose,
    onSaved,
    parseAvailable,
}: {
    submission: BoardSubmission;
    onClose: () => void;
    onSaved: () => void;
    parseAvailable: boolean;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [companyName, setCompanyName] = useState(submission.companyName);
    const [adminNote, setAdminNote] = useState(submission.adminNote ?? "");
    const [parsedText, setParsedText] = useState(
        JSON.stringify(
            submission.parsed ?? submission.structured ?? {},
            null,
            2,
        ),
    );
    const [preview, setPreview] = useState<MergePreview | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    const isText = submission.mode === "TEXT";
    const hasPayload =
        submission.parsed != null || submission.structured != null;
    const showPreview =
        hasPayload &&
        (submission.status === "PARSED" ||
            submission.status === "APPROVED" ||
            submission.status === "REJECTED");

    useEffect(() => {
        if (!showPreview) return;
        setPreviewLoading(true);
        void getMergePreview(submission.id).then((result) => {
            setPreviewLoading(false);
            if (result.ok) setPreview(result.preview);
        });
    }, [submission.id, showPreview]);

    const save = () => {
        let parsed: unknown;
        try {
            parsed = JSON.parse(parsedText);
        } catch {
            toast.error("Sanitized payload is not valid JSON");
            return;
        }
        startTransition(async () => {
            const match = await resolveCompanyByName(companyName);
            const result = await updateSubmissionFields(submission.id, {
                companyId: match?.id ?? null,
                parsed,
                adminNote: adminNote.trim() || null,
            });
            if (result.ok === true) {
                if (!match) {
                    toast.warning(
                        "Saved, but no company matched that name — approval needs a linked company.",
                    );
                } else {
                    toast.success(`Saved and linked to ${match.name}`);
                }
                // Re-fetch preview after payload change
                if (showPreview) {
                    const p = await getMergePreview(submission.id);
                    if (p.ok) setPreview(p.preview);
                }
                onSaved();
            } else {
                toast.error(result.error ?? "Save failed");
            }
        });
    };

    const approve = () => {
        startTransition(async () => {
            const result = await approveSubmissions([submission.id]);
            if (result.ok === false) {
                toast.error(result.error ?? "Approve failed");
                return;
            }
            const itemResult = result.results[0];
            if (!itemResult || itemResult.ok === false) {
                toast.error(itemResult?.error ?? "Approve failed");
                return;
            }
            toast.success("Approved");
            onClose();
            router.refresh();
        });
    };

    const reject = () => {
        startTransition(async () => {
            const result = await rejectSubmissions(
                [submission.id],
                adminNote.trim() || null,
            );
            if (result.ok) {
                toast.success("Rejected");
                onClose();
                router.refresh();
            } else {
                toast.error(
                    (result as { ok: false; error: string }).error ?? "Reject failed",
                );
            }
        });
    };

    const runParse = () => {
        startTransition(async () => {
            const result = await parseSubmissions([submission.id]);
            if (result.ok === false) {
                toast.error(result.error ?? "Parse failed");
                return;
            }
            const ok = result.results.filter((r) => r.ok).length;
            if (ok > 0) toast.success("Parsed successfully");
            for (const f of result.results.filter((r) => !r.ok)) {
                toast.error(f.error ?? "Could not parse");
            }
            onSaved();
        });
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[680px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Review · {submission.userName} ({submission.userEmail})
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    {showPreview ? (
                        <>
                            {previewLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : preview ? (
                                <MergePreviewPanel preview={preview} />
                            ) : null}

                            <Accordion type="single" collapsible>
                                <AccordionItem value="edit">
                                    <AccordionTrigger className="text-sm">
                                        Edit raw payload
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="flex flex-col gap-4">
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="link-company">
                                                    Company link
                                                </Label>
                                                <Input
                                                    id="link-company"
                                                    value={companyName}
                                                    onChange={(e) =>
                                                        setCompanyName(e.target.value)
                                                    }
                                                    placeholder="Exact company name to link"
                                                />
                                                {submission.companyId === null && (
                                                    <span className="text-xs text-red-500">
                                                        Not yet linked. Approval requires a link.
                                                    </span>
                                                )}
                                            </div>
                                            {isText && (
                                                <div className="flex flex-col gap-2">
                                                    <Label>Original paragraph</Label>
                                                    <div className="border-2 border-border bg-secondary-background p-3 text-sm whitespace-pre-wrap max-h-[180px] overflow-y-auto">
                                                        {submission.rawText}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="parsed">
                                                    Sanitized payload
                                                </Label>
                                                <Textarea
                                                    id="parsed"
                                                    value={parsedText}
                                                    onChange={(e) =>
                                                        setParsedText(e.target.value)
                                                    }
                                                    rows={12}
                                                    className="font-mono text-xs"
                                                />
                                            </div>
                                            <Button
                                                onClick={save}
                                                disabled={isPending}
                                                size="sm"
                                            >
                                                Save changes
                                            </Button>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </>
                    ) : (
                        <>
                            {submission.parseError && (
                                <div className="border-2 border-red-400 bg-red-50 p-3 text-sm text-red-700">
                                    <span className="font-semibold">Parse error: </span>
                                    {submission.parseError}
                                </div>
                            )}
                            {!submission.parseError && (
                                <p className="text-sm text-muted-foreground">
                                    This submission has not been parsed yet. Use
                                    &ldquo;Parse with AI&rdquo; to extract structured data,
                                    or edit the payload manually below.
                                </p>
                            )}
                            <Button
                                variant="neutral"
                                size="sm"
                                disabled={!parseAvailable || isPending}
                                onClick={runParse}
                                title={
                                    parseAvailable
                                        ? "Extract structured data with AI"
                                        : "AI parsing unavailable: GEMINI_API_KEY not configured"
                                }
                            >
                                <Sparkles className="size-4" />
                                Parse with AI
                            </Button>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="link-company">Company link</Label>
                                <Input
                                    id="link-company"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="Exact company name to link"
                                />
                                {submission.companyId === null && (
                                    <span className="text-xs text-red-500">
                                        Not yet linked. Approval requires a link.
                                    </span>
                                )}
                            </div>

                            {isText && (
                                <div className="flex flex-col gap-2">
                                    <Label>Original paragraph</Label>
                                    <div className="border-2 border-border bg-secondary-background p-3 text-sm whitespace-pre-wrap max-h-[180px] overflow-y-auto">
                                        {submission.rawText}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="parsed">
                                    Sanitized payload (normalized on approve)
                                </Label>
                                <Textarea
                                    id="parsed"
                                    value={parsedText}
                                    onChange={(e) => setParsedText(e.target.value)}
                                    rows={14}
                                    className="font-mono text-xs"
                                />
                                <span className="text-xs text-muted-foreground">
                                    Shape:{" "}
                                    {`{ role, level, expYears, rounds: [{ type, questions: [{ text, type, problemUrl }] }], comp: { currency, base, tc } }`}
                                </span>
                            </div>
                        </>
                    )}

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="note">Reviewer note (optional)</Label>
                        <Input
                            id="note"
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            placeholder="Shown to submitter on rejection"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="neutral"
                        onClick={onClose}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    {!showPreview && (
                        <Button onClick={save} disabled={isPending}>
                            Save
                        </Button>
                    )}
                    <Button
                        variant="neutral"
                        onClick={reject}
                        disabled={isPending}
                    >
                        <X className="size-4" />
                        Reject
                    </Button>
                    <Button onClick={approve} disabled={isPending}>
                        <Check className="size-4" />
                        Approve
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function MergePreviewPanel({ preview }: { preview: MergePreview }) {
    return (
        <div className="flex flex-col gap-3 border-2 border-border p-3 bg-secondary-background">
            <div className="flex flex-wrap items-center gap-2">
                {preview.role && (
                    <Badge variant="default">{preview.role}</Badge>
                )}
                {preview.level && (
                    <Badge variant="neutral">{preview.level}</Badge>
                )}
                {preview.expYears != null && (
                    <Badge variant="neutral">{preview.expYears}y exp</Badge>
                )}
                {!preview.role && !preview.level && preview.expYears == null && (
                    <span className="text-xs text-muted-foreground">
                        No role/level/experience data
                    </span>
                )}
            </div>

            {preview.questions.length > 0 && (
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Questions ({preview.questions.length})
                    </span>
                    {preview.questions.map((q, i) => (
                        <div
                            key={i}
                            className="border-2 border-border bg-card p-2 flex flex-col gap-1.5"
                        >
                            <div className="flex flex-wrap gap-1.5 items-center">
                                {q.problem ? (
                                    <Badge className="bg-green-200 text-green-900 border-green-400">
                                        Matched
                                    </Badge>
                                ) : (
                                    <Badge variant="neutral" className="text-muted-foreground">
                                        Unmatched
                                    </Badge>
                                )}
                                <Badge variant="neutral">{q.band}</Badge>
                                {q.type && (
                                    <Badge variant="neutral">{q.type}</Badge>
                                )}
                            </div>
                            {q.problem ? (
                                <a
                                    href={q.problem.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium underline underline-offset-2"
                                >
                                    {q.problem.title}
                                </a>
                            ) : (
                                <p className="text-sm">{q.statement}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {preview.questions.length === 0 && (
                <p className="text-xs text-muted-foreground">No questions in payload</p>
            )}

            {preview.comp && (
                <div className="flex flex-wrap items-center gap-2 border-2 border-border bg-card p-2">
                    <span className="text-xs font-semibold text-muted-foreground">
                        Comp:
                    </span>
                    <Badge variant="neutral">{preview.comp.currency}</Badge>
                    {preview.comp.base != null && (
                        <span className="text-sm">
                            Base {preview.comp.base.toLocaleString()}
                        </span>
                    )}
                    <span className="text-sm font-semibold">
                        TC {preview.comp.tc.toLocaleString()}
                    </span>
                </div>
            )}
        </div>
    );
}
