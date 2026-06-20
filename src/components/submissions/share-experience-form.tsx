"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Send, AlignLeft, ListChecks } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import {
    createSubmission,
    updateSubmission,
    searchCompanyNames,
} from "~/server/actions/submissions/createSubmission";
import {
    MIN_TEXT_LENGTH,
    MAX_TEXT_LENGTH,
    WEEKLY_SUBMISSION_CAP,
} from "~/config/submissions";
import { FEATURE_FLAGS } from "~/config/feature-flags";

const ROUND_TYPES = [
    "Phone Screen",
    "Coding",
    "System Design",
    ...(FEATURE_FLAGS.LLD ? ["Machine Coding / LLD"] : []),
    ...(FEATURE_FLAGS.OTHERS ? ["Behavioral", "HR", "Other"] : []),
];

const QUESTION_TYPES = [
    "DSA",
    "System Design",
    ...(FEATURE_FLAGS.LLD ? ["LLD"] : []),
    ...(FEATURE_FLAGS.OTHERS ? ["Behavioral", "HR", "Other"] : []),
];

type QuestionDraft = { text: string; type: string; problemUrl: string };
type RoundDraft = { type: string; questions: QuestionDraft[] };

const emptyQuestion = (): QuestionDraft => ({ text: "", type: "DSA", problemUrl: "" });
const emptyRound = (): RoundDraft => ({ type: "Coding", questions: [emptyQuestion()] });

type StructuredInit = {
    role?: string;
    level?: string;
    expYears?: number | null;
    rounds?: { type?: string; questions?: { text?: string; type?: string; problemUrl?: string }[] }[];
    comp?: { currency?: string; base?: number | null; tc?: number };
};

export type SubmissionEdit = {
    id: string;
    mode: "TEXT" | "FORM";
    rawText?: string;
    structured?: StructuredInit | null;
};

function roundsFromInit(init: StructuredInit | null | undefined): RoundDraft[] {
    const rs = init?.rounds ?? [];
    if (rs.length === 0) return [emptyRound()];
    return rs.map((r) => ({
        type: r.type || "Coding",
        questions:
            (r.questions ?? []).length > 0
                ? (r.questions ?? []).map((q) => ({
                      text: q.text ?? "",
                      type: q.type || "DSA",
                      problemUrl: q.problemUrl ?? "",
                  }))
                : [emptyQuestion()],
    }));
}

export function ShareExperienceForm({
    initialCompany,
    remaining,
    edit,
}: {
    initialCompany: string;
    remaining: number;
    edit?: SubmissionEdit;
}) {
    const router = useRouter();
    const isEditing = edit !== undefined;
    const [isPending, startTransition] = useTransition();
    const [quota, setQuota] = useState(remaining);
    const [mode, setMode] = useState<"TEXT" | "FORM">(edit?.mode ?? "TEXT");

    const [companyName, setCompanyName] = useState(initialCompany);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const suppressSuggest = useRef(initialCompany.length > 0);

    const [rawText, setRawText] = useState(edit?.rawText ?? "");

    const [role, setRole] = useState(edit?.structured?.role ?? "");
    const [level, setLevel] = useState(edit?.structured?.level ?? "");
    const [expYears, setExpYears] = useState(
        edit?.structured?.expYears != null ? String(edit.structured.expYears) : "",
    );
    const [rounds, setRounds] = useState<RoundDraft[]>(roundsFromInit(edit?.structured));
    const [compEnabled, setCompEnabled] = useState(
        edit?.structured?.comp?.tc != null,
    );
    const [comp, setComp] = useState({
        currency: edit?.structured?.comp?.currency ?? "INR",
        base: edit?.structured?.comp?.base != null ? String(edit.structured.comp.base) : "",
        tc: edit?.structured?.comp?.tc != null ? String(edit.structured.comp.tc) : "",
    });

    useEffect(() => {
        if (suppressSuggest.current) {
            suppressSuggest.current = false;
            return;
        }
        const q = companyName.trim();
        if (q.length === 0) {
            setSuggestions([]);
            return;
        }
        const handle = setTimeout(() => {
            searchCompanyNames(q).then((names) =>
                setSuggestions(names.filter((n) => n !== companyName)),
            );
        }, 250);
        return () => clearTimeout(handle);
    }, [companyName]);

    const updateRound = (i: number, patch: Partial<RoundDraft>) =>
        setRounds((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

    const updateQuestion = (ri: number, qi: number, patch: Partial<QuestionDraft>) =>
        setRounds((rs) =>
            rs.map((r, idx) =>
                idx === ri
                    ? {
                          ...r,
                          questions: r.questions.map((q, qidx) =>
                              qidx === qi ? { ...q, ...patch } : q,
                          ),
                      }
                    : r,
            ),
        );

    const submit = () => {
        const input =
            mode === "TEXT"
                ? { companyName, mode: "TEXT" as const, rawText }
                : {
                      companyName,
                      mode: "FORM" as const,
                      structured: {
                          role,
                          level: level || undefined,
                          expYears: expYears === "" ? undefined : Number(expYears),
                          rounds: rounds
                              .filter((r) => r.questions.some((q) => q.text.trim()))
                              .map((r) => ({
                                  type: r.type,
                                  questions: r.questions
                                      .filter((q) => q.text.trim())
                                      .map((q) => ({
                                          text: q.text,
                                          type: q.type || undefined,
                                          problemUrl: q.problemUrl.trim() || undefined,
                                      })),
                              })),
                          comp: compEnabled
                              ? {
                                    currency: comp.currency,
                                    base: comp.base === "" ? undefined : Number(comp.base),
                                    tc: Number(comp.tc),
                                }
                              : undefined,
                      },
                  };

        startTransition(async () => {
            if (isEditing) {
                const result = await updateSubmission(edit.id, input);
                if (result.ok === true) {
                    toast.success("Changes saved — your submission is back in review.");
                    router.push("/my-submissions");
                    router.refresh();
                } else {
                    toast.error(result.error);
                }
                return;
            }
            const result = await createSubmission(input);
            if (result.ok === true) {
                toast.success("Experience submitted — it will appear once reviewed.");
                router.push("/my-submissions");
            } else {
                if (result.remaining !== undefined) setQuota(result.remaining);
                toast.error(result.error);
            }
        });
    };

    const quotaExhausted = !isEditing && quota <= 0;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex border-2 border-border bg-card">
                    <button
                        type="button"
                        onClick={() => setMode("TEXT")}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold ${mode === "TEXT" ? "bg-main text-main-foreground" : "text-muted-foreground"}`}
                    >
                        <AlignLeft className="size-4" />
                        Paragraph
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("FORM")}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-l-2 border-border ${mode === "FORM" ? "bg-main text-main-foreground" : "text-muted-foreground"}`}
                    >
                        <ListChecks className="size-4" />
                        Structured
                    </button>
                </div>
                <span className="text-sm text-muted-foreground">
                    {isEditing
                        ? "Editing reopens this submission for review"
                        : `${quota} of ${WEEKLY_SUBMISSION_CAP} submissions left this week`}
                </span>
            </div>

            <div className="relative flex flex-col gap-2">
                <Label htmlFor="company">Company</Label>
                <Input
                    id="company"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Amazon"
                    autoComplete="off"
                />
                {suggestions.length > 0 && (
                    <div className="absolute top-full z-10 mt-1 w-full border-2 border-border bg-card shadow-shadow">
                        {suggestions.map((name) => (
                            <button
                                key={name}
                                type="button"
                                className="block w-full px-3 py-2 text-left text-sm hover:bg-main hover:text-main-foreground"
                                onClick={() => {
                                    suppressSuggest.current = true;
                                    setCompanyName(name);
                                    setSuggestions([]);
                                }}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {mode === "TEXT" ? (
                <div className="flex flex-col gap-2">
                    <Label htmlFor="experience">Your interview experience</Label>
                    <Textarea
                        id="experience"
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        rows={12}
                        maxLength={MAX_TEXT_LENGTH}
                        placeholder="Role and experience level, how many rounds, what each round covered, questions you remember, and (optionally) the offer details…"
                    />
                    <span className="text-xs text-muted-foreground self-end">
                        {rawText.trim().length} / {MIN_TEXT_LENGTH} characters minimum
                    </span>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Input
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                placeholder="e.g. Software Engineer"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="level">Level (optional)</Label>
                            <Input
                                id="level"
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                                placeholder="e.g. SDE2, L4"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="exp">Experience (years, optional)</Label>
                            <Input
                                id="exp"
                                type="number"
                                min={0}
                                max={50}
                                value={expYears}
                                onChange={(e) => setExpYears(e.target.value)}
                                placeholder="e.g. 4"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {rounds.map((round, ri) => (
                            <div key={ri} className="border-2 border-border bg-card">
                                <div className="flex items-center justify-between gap-2 p-3 border-b-2 border-border">
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-sm">
                                            Round {ri + 1}
                                        </span>
                                        <Select
                                            value={round.type}
                                            onValueChange={(v) => updateRound(ri, { type: v })}
                                        >
                                            <SelectTrigger className="w-[200px]">
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
                                    <Button
                                        type="button"
                                        variant="neutral"
                                        size="icon"
                                        aria-label="Remove round"
                                        disabled={rounds.length === 1}
                                        onClick={() =>
                                            setRounds((rs) => rs.filter((_, idx) => idx !== ri))
                                        }
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-col gap-3 p-3">
                                    {round.questions.map((q, qi) => (
                                        <div
                                            key={qi}
                                            className="grid grid-cols-1 md:grid-cols-[1fr_150px_1fr_auto] gap-2"
                                        >
                                            <Input
                                                value={q.text}
                                                onChange={(e) =>
                                                    updateQuestion(ri, qi, { text: e.target.value })
                                                }
                                                placeholder="Question asked"
                                            />
                                            <Select
                                                value={q.type}
                                                onValueChange={(v) =>
                                                    updateQuestion(ri, qi, { type: v })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {QUESTION_TYPES.map((t) => (
                                                        <SelectItem key={t} value={t}>
                                                            {t}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                value={q.problemUrl}
                                                onChange={(e) =>
                                                    updateQuestion(ri, qi, {
                                                        problemUrl: e.target.value,
                                                    })
                                                }
                                                placeholder="Practice problem link (optional)"
                                            />
                                            <Button
                                                type="button"
                                                variant="neutral"
                                                size="icon"
                                                aria-label="Remove question"
                                                disabled={round.questions.length === 1}
                                                onClick={() =>
                                                    updateRound(ri, {
                                                        questions: round.questions.filter(
                                                            (_, idx) => idx !== qi,
                                                        ),
                                                    })
                                                }
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="neutral"
                                        size="sm"
                                        className="self-start"
                                        onClick={() =>
                                            updateRound(ri, {
                                                questions: [...round.questions, emptyQuestion()],
                                            })
                                        }
                                    >
                                        <Plus className="size-4" />
                                        Add question
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="neutral"
                            className="self-start"
                            onClick={() => setRounds((rs) => [...rs, emptyRound()])}
                        >
                            <Plus className="size-4" />
                            Add round
                        </Button>
                    </div>

                    <div className="border-2 border-border bg-card p-3 flex flex-col gap-3">
                        <label className="flex items-center gap-2 text-sm font-semibold">
                            <Checkbox
                                checked={compEnabled}
                                onCheckedChange={(v) => setCompEnabled(v === true)}
                            />
                            Share compensation (optional)
                        </label>
                        {compEnabled && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label>Currency</Label>
                                    <Select
                                        value={comp.currency}
                                        onValueChange={(v) =>
                                            setComp((c) => ({ ...c, currency: v }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["INR", "USD", "EUR", "GBP", "CAD", "SGD", "AED"].map(
                                                (c) => (
                                                    <SelectItem key={c} value={c}>
                                                        {c}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="base">Base (per year, optional)</Label>
                                    <Input
                                        id="base"
                                        type="number"
                                        min={0}
                                        value={comp.base}
                                        onChange={(e) =>
                                            setComp((c) => ({ ...c, base: e.target.value }))
                                        }
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="tc">Total compensation (per year)</Label>
                                    <Input
                                        id="tc"
                                        type="number"
                                        min={0}
                                        value={comp.tc}
                                        onChange={(e) =>
                                            setComp((c) => ({ ...c, tc: e.target.value }))
                                        }
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Button
                type="button"
                onClick={submit}
                disabled={isPending || quotaExhausted}
                className="self-start"
            >
                <Send className="size-4" />
                {isEditing
                    ? "Save changes"
                    : quotaExhausted
                      ? "Weekly limit reached"
                      : "Submit experience"}
            </Button>
        </div>
    );
}
