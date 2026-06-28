"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { Card, CardContent } from "~/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { editPost } from "~/server/actions/posts/createPost";
import { searchCompanyNames } from "~/server/actions/submissions/createSubmission";
import { FEATURE_FLAGS } from "~/config/feature-flags";
import type { ExperienceFormEntry } from "~/server/actions/posts/getPostForEdit";

const ROUND_TYPES = [
    "Phone Screen",
    "Coding",
    "System Design",
    ...(FEATURE_FLAGS.LLD ? ["Machine Coding / LLD"] : []),
    ...(FEATURE_FLAGS.OTHERS ? ["Behavioral", "HR", "Other"] : []),
];

const COMP_SUGGESTIONS = [
    "Base Pay",
    "Stock / RSU",
    "Joining Bonus",
    "Relocation Bonus",
    "Performance Bonus",
    "Meal Allowance",
    "Internet Allowance",
];

const FLAT_BTN = "shadow-none hover:shadow-shadow hover:translate-x-0 hover:translate-y-0";
const GHOST_DELETE = "inline-flex items-center justify-center size-5 text-muted-foreground/30 hover:text-foreground transition-colors shrink-0";

type RoundDraft = { type: string; questions: string[] };
type CompComponent = { label: string; amount: string };
type ExperienceDraft = ExperienceFormEntry & {
    suggestions: string[];
    rounds: RoundDraft[];
    comp: { currency: string; components: CompComponent[] };
};

const emptyRound = (): RoundDraft => ({ type: "Coding", questions: [""] });
const emptyCompComponent = (): CompComponent => ({ label: "", amount: "" });

function toExperienceDraft(e: ExperienceFormEntry): ExperienceDraft {
    return {
        ...e,
        suggestions: [],
        rounds: e.rounds.length ? e.rounds : [emptyRound()],
        comp: {
            currency: e.comp.currency,
            components: e.comp.components.length ? e.comp.components : [emptyCompComponent()],
        },
    };
}

export function EditPostForm({
    postId,
    postParam,
    initialTitle,
    mode,
    initialExperiences,
    initialBody,
}: {
    postId: string;
    postParam: string;
    initialTitle: string;
    mode: "FORM" | "TEXT" | null;
    initialExperiences: ExperienceFormEntry[] | null;
    initialBody: string | null;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [title, setTitle] = useState(initialTitle);
    const [body, setBody] = useState(initialBody ?? "");

    const [experiences, setExperiences] = useState<ExperienceDraft[]>(
        initialExperiences?.map(toExperienceDraft) ?? [],
    );
    const [activeRoundKey, setActiveRoundKey] = useState<string | null>(null);
    const [activeCompKey, setActiveCompKey] = useState<string | null>(null);

    const suggestTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

    const isFormMode = mode === "FORM" && experiences.length > 0;

    // --- Experience helpers ---
    const updateExp = <K extends keyof ExperienceDraft>(ei: number, key: K, val: ExperienceDraft[K]) =>
        setExperiences((prev) => prev.map((e, i) => (i === ei ? { ...e, [key]: val } : e)));

    const onCompanyChange = (idx: number, name: string) => {
        setExperiences((prev) =>
            prev.map((e, i) => (i === idx ? { ...e, company: name, suggestions: [] } : e)),
        );
        const timer = suggestTimers.current.get(idx);
        if (timer) clearTimeout(timer);
        const q = name.trim();
        if (!q) return;
        suggestTimers.current.set(
            idx,
            setTimeout(() => {
                searchCompanyNames(q).then((names) =>
                    setExperiences((prev) =>
                        prev.map((e, i) =>
                            i === idx ? { ...e, suggestions: names.filter((n) => n !== e.company) } : e,
                        ),
                    ),
                );
            }, 250),
        );
    };

    const selectSuggestion = (idx: number, name: string) => {
        const timer = suggestTimers.current.get(idx);
        if (timer) clearTimeout(timer);
        setExperiences((prev) =>
            prev.map((e, i) => (i === idx ? { ...e, company: name, suggestions: [] } : e)),
        );
    };

    const removeExperience = (idx: number) =>
        setExperiences((prev) => prev.filter((_, i) => i !== idx));

    const addRound = (ei: number) =>
        setExperiences((prev) =>
            prev.map((e, i) => (i === ei ? { ...e, rounds: [...e.rounds, emptyRound()] } : e)),
        );

    const removeRound = (ei: number, ri: number) =>
        setExperiences((prev) =>
            prev.map((e, i) =>
                i === ei ? { ...e, rounds: e.rounds.filter((_, j) => j !== ri) } : e,
            ),
        );

    const updateRoundType = (ei: number, ri: number, type: string) =>
        setExperiences((prev) =>
            prev.map((e, i) =>
                i === ei
                    ? { ...e, rounds: e.rounds.map((r, j) => (j === ri ? { ...r, type } : r)) }
                    : e,
            ),
        );

    const addQuestion = (ei: number, ri: number) =>
        setExperiences((prev) =>
            prev.map((e, i) =>
                i === ei
                    ? { ...e, rounds: e.rounds.map((r, j) => (j === ri ? { ...r, questions: [...r.questions, ""] } : r)) }
                    : e,
            ),
        );

    const removeQuestion = (ei: number, ri: number, qi: number) =>
        setExperiences((prev) =>
            prev.map((e, i) =>
                i === ei
                    ? {
                          ...e,
                          rounds: e.rounds.map((r, j) =>
                              j === ri ? { ...r, questions: r.questions.filter((_, k) => k !== qi) } : r,
                          ),
                      }
                    : e,
            ),
        );

    const updateQuestion = (ei: number, ri: number, qi: number, text: string) =>
        setExperiences((prev) =>
            prev.map((e, i) =>
                i === ei
                    ? {
                          ...e,
                          rounds: e.rounds.map((r, j) =>
                              j === ri
                                  ? { ...r, questions: r.questions.map((q, k) => (k === qi ? text : q)) }
                                  : r,
                          ),
                      }
                    : e,
            ),
        );

    const addCompComponent = (ei: number) =>
        setExperiences((prev) =>
            prev.map((e, i) =>
                i === ei
                    ? { ...e, comp: { ...e.comp, components: [...e.comp.components, emptyCompComponent()] } }
                    : e,
            ),
        );

    const removeCompComponent = (ei: number, ci: number) =>
        setExperiences((prev) =>
            prev.map((e, i) =>
                i === ei
                    ? { ...e, comp: { ...e.comp, components: e.comp.components.filter((_, j) => j !== ci) } }
                    : e,
            ),
        );

    const updateCompComponent = (ei: number, ci: number, field: keyof CompComponent, value: string) =>
        setExperiences((prev) =>
            prev.map((e, i) =>
                i === ei
                    ? {
                          ...e,
                          comp: {
                              ...e.comp,
                              components: e.comp.components.map((c, j) =>
                                  j === ci ? { ...c, [field]: value } : c,
                              ),
                          },
                      }
                    : e,
            ),
        );

    const buildStructured = () => {
        const active = experiences
            .filter((e) => e.company.trim() || e.role.trim())
            .map((e) => ({
                company: e.company.trim(),
                role: e.role.trim() || undefined,
                rounds: e.rounds
                    .filter((r) => r.questions.some((q) => q.trim()))
                    .map((r) => ({
                        type: r.type,
                        questions: r.questions.filter((q) => q.trim()).map((text) => ({ text })),
                    })),
                comp: (() => {
                    if (!e.compEnabled) return undefined;
                    const filled = e.comp.components.filter((c) => c.amount.trim());
                    if (!filled.length) return undefined;
                    const tc = filled.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
                    return {
                        currency: e.comp.currency,
                        tc,
                        components: filled
                            .filter((c) => c.label.trim())
                            .map((c) => ({ label: c.label.trim(), amount: Number(c.amount) })),
                    };
                })(),
            }));
        return active.length > 0 ? { experiences: active } : undefined;
    };

    const save = () => {
        if (!title.trim()) {
            toast.error("Title is required.");
            return;
        }
        startTransition(async () => {
            const res = isFormMode
                ? await editPost(postId, { title, structured: buildStructured() })
                : await editPost(postId, { title, body });
            if (res.ok === true) {
                toast.success("Post updated.");
                router.push(`/grinds/${postParam}`);
                router.refresh();
            } else {
                toast.error(res.error);
            }
        });
    };

    return (
        <div className="flex flex-col gap-5">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                    id="edit-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isPending}
                    placeholder="Post title"
                />
            </div>

            {isFormMode ? (
                /* Experience form mode */
                <div className="rounded-base border-2 border-border overflow-hidden divide-y-2 divide-border">
                    {experiences.map((exp, ei) => (
                        <div key={ei} className="p-4 flex flex-col gap-4 bg-secondary-background/30">
                            {/* Experience header */}
                            {experiences.length > 1 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Company {ei + 1}
                                    </span>
                                    <button
                                        type="button"
                                        aria-label="Remove this company experience"
                                        onClick={() => removeExperience(ei)}
                                        className={GHOST_DELETE}
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>
                            )}

                            {/* Company */}
                            <div className="relative flex flex-col gap-1.5">
                                <Label>Company</Label>
                                <Input
                                    value={exp.company}
                                    onChange={(e) => onCompanyChange(ei, e.target.value)}
                                    placeholder="e.g. Amazon"
                                    autoComplete="off"
                                    disabled={isPending}
                                />
                                {exp.suggestions.length > 0 && (
                                    <Card className="absolute top-full z-10 mt-1 w-full py-0 gap-0">
                                        {exp.suggestions.map((name) => (
                                            <Button
                                                key={name}
                                                type="button"
                                                variant="neutral"
                                                className="w-full justify-start rounded-none border-0 border-b-2 last:border-b-0 shadow-none hover:shadow-none hover:translate-x-0 hover:translate-y-0 hover:bg-main hover:text-main-foreground"
                                                onClick={() => selectSuggestion(ei, name)}
                                            >
                                                {name}
                                            </Button>
                                        ))}
                                    </Card>
                                )}
                            </div>

                            {/* Role */}
                            <div className="flex flex-col gap-1.5">
                                <Label>Role</Label>
                                <Input
                                    value={exp.role}
                                    onChange={(e) => updateExp(ei, "role", e.target.value)}
                                    placeholder="e.g. Software Engineer"
                                    disabled={isPending}
                                />
                            </div>

                            {/* Rounds */}
                            <div className="flex flex-col gap-2">
                                <Label>Rounds</Label>
                                {exp.rounds.map((round, ri) => {
                                    const roundKey = `${ei}-${ri}`;
                                    const filtered = ROUND_TYPES.filter(
                                        (t) =>
                                            !round.type.trim() ||
                                            t.toLowerCase().includes(round.type.trim().toLowerCase()),
                                    );
                                    return (
                                        <Card key={ri} className="gap-0 py-0 shadow-none">
                                            <div className="flex items-center gap-2 p-3 border-b-2 border-border">
                                                <span className="font-semibold text-sm shrink-0 text-muted-foreground">
                                                    Round {ri + 1}
                                                </span>
                                                <div className="relative flex-1">
                                                    <Input
                                                        value={round.type}
                                                        onChange={(e) => updateRoundType(ei, ri, e.target.value)}
                                                        placeholder="Round type"
                                                        onFocus={() => setActiveRoundKey(roundKey)}
                                                        onBlur={() => setTimeout(() => setActiveRoundKey(null), 150)}
                                                        className="w-full"
                                                        disabled={isPending}
                                                    />
                                                    {activeRoundKey === roundKey && filtered.length > 0 && (
                                                        <Card className="absolute top-full left-0 z-20 mt-1 w-full py-0 gap-0 max-h-48 overflow-y-auto shadow-shadow">
                                                            {filtered.map((t) => (
                                                                <button
                                                                    key={t}
                                                                    type="button"
                                                                    onMouseDown={() => {
                                                                        updateRoundType(ei, ri, t);
                                                                        setActiveRoundKey(null);
                                                                    }}
                                                                    className="w-full text-left px-3 py-2 text-sm hover:bg-secondary-background border-b-2 border-border last:border-b-0 transition-colors"
                                                                >
                                                                    {t}
                                                                </button>
                                                            ))}
                                                        </Card>
                                                    )}
                                                </div>
                                                {exp.rounds.length > 1 && (
                                                    <button
                                                        type="button"
                                                        aria-label="Remove round"
                                                        onClick={() => removeRound(ei, ri)}
                                                        className={GHOST_DELETE}
                                                        disabled={isPending}
                                                    >
                                                        <X className="size-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <CardContent className="flex flex-col gap-2 p-3">
                                                {round.questions.map((q, qi) => (
                                                    <div key={qi} className="flex items-center gap-2">
                                                        <Input
                                                            value={q}
                                                            onChange={(e) => updateQuestion(ei, ri, qi, e.target.value)}
                                                            placeholder="Question asked"
                                                            disabled={isPending}
                                                        />
                                                        {round.questions.length > 1 && (
                                                            <button
                                                                type="button"
                                                                aria-label="Remove question"
                                                                onClick={() => removeQuestion(ei, ri, qi)}
                                                                className={GHOST_DELETE}
                                                                disabled={isPending}
                                                            >
                                                                <X className="size-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <Button
                                                    type="button"
                                                    variant="neutral"
                                                    size="sm"
                                                    className={`w-full ${FLAT_BTN}`}
                                                    onClick={() => addQuestion(ei, ri)}
                                                    disabled={isPending}
                                                >
                                                    <Plus className="size-3.5 mr-1" />
                                                    Add another question to Round {ri + 1}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                                <Button
                                    type="button"
                                    variant="neutral"
                                    size="sm"
                                    className={`w-full ${FLAT_BTN}`}
                                    onClick={() => addRound(ei)}
                                    disabled={isPending}
                                >
                                    <Plus className="size-3.5 mr-1" />
                                    Add another round
                                </Button>
                            </div>

                            {/* Compensation */}
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                                    <Checkbox
                                        checked={exp.compEnabled}
                                        onCheckedChange={(v) => updateExp(ei, "compEnabled", v === true)}
                                        disabled={isPending}
                                    />
                                    Share compensation (optional)
                                </label>
                                {exp.compEnabled && (
                                    <div className="flex flex-col gap-2 mt-1">
                                        <div className="flex flex-col gap-1.5">
                                            <Label>Currency</Label>
                                            <Select
                                                value={exp.comp.currency}
                                                onValueChange={(v) =>
                                                    updateExp(ei, "comp", { ...exp.comp, currency: v })
                                                }
                                                disabled={isPending}
                                            >
                                                <SelectTrigger className="w-32">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {["INR", "USD", "EUR", "GBP", "CAD", "SGD", "AED"].map((c) => (
                                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <Label>Components</Label>
                                            <div className="flex flex-col gap-1.5">
                                                {exp.comp.components.map((cc, ci) => {
                                                    const compKey = `${ei}-${ci}`;
                                                    const filteredComp = COMP_SUGGESTIONS.filter(
                                                        (s) =>
                                                            s.toLowerCase().includes(cc.label.toLowerCase()) &&
                                                            s !== cc.label,
                                                    );
                                                    return (
                                                        <div key={ci} className="flex items-center gap-2">
                                                            <div className="relative flex-1">
                                                                <Input
                                                                    value={cc.label}
                                                                    onChange={(e) =>
                                                                        updateCompComponent(ei, ci, "label", e.target.value)
                                                                    }
                                                                    placeholder="e.g. Base Pay"
                                                                    onFocus={() => setActiveCompKey(compKey)}
                                                                    onBlur={() => setTimeout(() => setActiveCompKey(null), 150)}
                                                                    disabled={isPending}
                                                                />
                                                                {activeCompKey === compKey && filteredComp.length > 0 && (
                                                                    <Card className="absolute top-full left-0 z-20 mt-1 w-full py-0 gap-0 max-h-48 overflow-y-auto shadow-shadow">
                                                                        {filteredComp.map((s) => (
                                                                            <button
                                                                                key={s}
                                                                                type="button"
                                                                                onMouseDown={() => {
                                                                                    updateCompComponent(ei, ci, "label", s);
                                                                                    setActiveCompKey(null);
                                                                                }}
                                                                                className="w-full text-left px-3 py-2 text-sm hover:bg-secondary-background border-b-2 border-border last:border-b-0 transition-colors"
                                                                            >
                                                                                {s}
                                                                            </button>
                                                                        ))}
                                                                    </Card>
                                                                )}
                                                            </div>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                value={cc.amount}
                                                                onChange={(e) =>
                                                                    updateCompComponent(ei, ci, "amount", e.target.value)
                                                                }
                                                                placeholder="Amount"
                                                                className="w-36"
                                                                disabled={isPending}
                                                            />
                                                            {exp.comp.components.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    aria-label="Remove component"
                                                                    onClick={() => removeCompComponent(ei, ci)}
                                                                    className={GHOST_DELETE}
                                                                    disabled={isPending}
                                                                >
                                                                    <X className="size-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => addCompComponent(ei)}
                                                disabled={isPending}
                                                className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-sm ${FLAT_BTN}`}
                                            >
                                                <Plus className="size-4" />
                                                Add another component
                                            </button>
                                        </div>
                                        {(() => {
                                            const tc = exp.comp.components.reduce(
                                                (sum, c) => sum + (Number(c.amount) || 0),
                                                0,
                                            );
                                            return tc > 0 ? (
                                                <p className="text-sm font-semibold">
                                                    Total:{" "}
                                                    <span className="text-foreground">
                                                        {exp.comp.currency} {tc.toLocaleString()}/year
                                                    </span>
                                                </p>
                                            ) : null;
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Add another company */}
                    <button
                        type="button"
                        onClick={() =>
                            setExperiences((prev) => [
                                ...prev,
                                {
                                    company: "",
                                    role: "",
                                    rounds: [emptyRound()],
                                    compEnabled: false,
                                    comp: { currency: "INR", components: [emptyCompComponent()] },
                                    suggestions: [],
                                },
                            ])
                        }
                        disabled={isPending}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold hover:bg-secondary-background hover:shadow-shadow transition-all`}
                    >
                        <Plus className="size-4" />
                        Add another company experience
                    </button>
                </div>
            ) : (
                /* Text / plain body */
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-body">Body</Label>
                    <Textarea
                        id="edit-body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={10}
                        disabled={isPending}
                        className="resize-y"
                        placeholder="Markdown supported."
                    />
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 justify-end">
                <Button
                    type="button"
                    variant="neutral"
                    onClick={() => router.push(`/grinds/${postParam}`)}
                    disabled={isPending}
                >
                    Cancel
                </Button>
                <Button
                    type="button"
                    onClick={save}
                    disabled={isPending || !title.trim()}
                >
                    Save changes
                </Button>
            </div>
        </div>
    );
}
