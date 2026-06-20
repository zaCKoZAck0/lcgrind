"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
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
import { updateSubmissionFields } from "~/server/actions/admin/actions";
import { resolveCompanyByName } from "~/server/actions/admin/lookup";
import type { BoardSubmission } from "./review-board";

export function SubmissionDrawer({
    submission,
    onClose,
    onSaved,
}: {
    submission: BoardSubmission;
    onClose: () => void;
    onSaved: () => void;
}) {
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

    const isText = submission.mode === "TEXT";

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
                onSaved();
            } else {
                toast.error(result.error ?? "Save failed");
            }
        });
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[640px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Review · {submission.userName} ({submission.userEmail})
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4">
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
                                Not yet linked to a known company. Approval requires a link.
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
                            Shape: {`{ role, level, expYears, rounds: [{ type, questions: [{ text, type, problemUrl }] }], comp: { currency, base, tc } }`}
                        </span>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="note">Reviewer note (optional)</Label>
                        <Input
                            id="note"
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="neutral" onClick={onClose} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button onClick={save} disabled={isPending}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
