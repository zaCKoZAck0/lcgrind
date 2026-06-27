"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { Badge, badgeVariants } from "~/components/ui/badge";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { createPost } from "~/server/actions/posts/createPost";
import { searchCompanyNames } from "~/server/actions/submissions/createSubmission";
import { findSimilarPostsAction } from "~/server/actions/grinds/similar";
import type { SimilarPost } from "~/server/actions/grinds/search";
import {
    POST_TITLE_MIN,
    POST_TITLE_MAX,
    POST_BODY_MAX,
    POST_TAGS,
    POST_TAG_MAX,
} from "~/config/grinds";
import { FEATURE_FLAGS } from "~/config/feature-flags";

const ROUND_TYPES = [
    "Phone Screen",
    "Coding",
    "System Design",
    ...(FEATURE_FLAGS.LLD ? ["Machine Coding / LLD"] : []),
    ...(FEATURE_FLAGS.OTHERS ? ["Behavioral", "HR", "Other"] : []),
];

type RoundDraft = { type: string; questions: string[] };
const emptyRound = (): RoundDraft => ({ type: "Coding", questions: [""] });

export function ComposeForm({
    initialIsExperience = false,
    initialCompany = "",
}: {
    initialIsExperience?: boolean;
    initialCompany?: string;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [isAnonymous, setIsAnonymous] = useState(false);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");

    const [tagSlugs, setTagSlugs] = useState<string[]>([]);
    const toggleTag = (slug: string) =>
        setTagSlugs((prev) =>
            prev.includes(slug)
                ? prev.filter((s) => s !== slug)
                : prev.length >= POST_TAG_MAX
                  ? prev
                  : [...prev, slug],
        );

    const [similar, setSimilar] = useState<SimilarPost[]>([]);
    const [dismissedSimilar, setDismissedSimilar] = useState(false);

    // Experience disclosure
    const [expOpen, setExpOpen] = useState(initialIsExperience);
    const [companyName, setCompanyName] = useState(initialCompany);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const suppressSuggest = useRef(initialCompany.length > 0);
    const [role, setRole] = useState("");
    const [rounds, setRounds] = useState<RoundDraft[]>([emptyRound()]);
    const [compEnabled, setCompEnabled] = useState(false);
    const [comp, setComp] = useState({ currency: "INR", tc: "" });

    useEffect(() => {
        if (!expOpen) return;
        if (suppressSuggest.current) {
            suppressSuggest.current = false;
            return;
        }
        const q = companyName.trim();
        if (q.length === 0) { setSuggestions([]); return; }
        const timer = setTimeout(() => {
            searchCompanyNames(q).then((names) =>
                setSuggestions(names.filter((n) => n !== companyName)),
            );
        }, 250);
        return () => clearTimeout(timer);
    }, [companyName, expOpen]);

    useEffect(() => {
        const t = title.trim();
        if (t.length < 8) { setSimilar([]); return; }
        const timer = setTimeout(() => {
            findSimilarPostsAction(t).then(setSimilar);
        }, 300);
        return () => clearTimeout(timer);
    }, [title]);

    const updateRoundType = (i: number, type: string) =>
        setRounds((rs) => rs.map((r, idx) => (idx === i ? { ...r, type } : r)));
    const updateQuestion = (ri: number, qi: number, text: string) =>
        setRounds((rs) =>
            rs.map((r, idx) =>
                idx === ri
                    ? { ...r, questions: r.questions.map((q, qidx) => (qidx === qi ? text : q)) }
                    : r,
            ),
        );

    const buildStructured = () => {
        const cleanRounds = rounds
            .filter((r) => r.questions.some((q) => q.trim()))
            .map((r) => ({
                type: r.type,
                questions: r.questions
                    .filter((q) => q.trim())
                    .map((text) => ({ text })),
            }));
        const hasComp = compEnabled && comp.tc !== "";
        if (cleanRounds.length === 0 && !hasComp) return undefined;
        return {
            role,
            rounds: cleanRounds,
            comp: hasComp
                ? { currency: comp.currency, tc: Number(comp.tc) }
                : undefined,
        };
    };

    const hasExperienceContent = expOpen && (companyName.trim().length > 0 || role.trim().length > 0);

    const submit = () => {
        const structured = hasExperienceContent ? buildStructured() : undefined;
        startTransition(async () => {
            const result = await createPost({
                isExperience: hasExperienceContent,
                title,
                body,
                companyName: hasExperienceContent ? companyName.trim() || undefined : undefined,
                isAnonymous,
                mode: structured ? "FORM" : "TEXT",
                structured,
                tagSlugs: hasExperienceContent ? [] : tagSlugs,
            });
            if (result.ok === true) {
                toast.success("Posted.");
                router.push(`/grinds/${result.param}`);
                router.refresh();
            } else {
                toast.error(result.error);
            }
        });
    };

    const nearTitleCap = title.length > POST_TITLE_MAX * 0.85;

    return (
        <div className="flex flex-col gap-5">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What's on your mind? Be specific."
                    maxLength={POST_TITLE_MAX}
                />
                {nearTitleCap && (
                    <span className="text-xs text-muted-foreground self-end">
                        {title.length} / {POST_TITLE_MAX}
                    </span>
                )}
                {similar.length > 0 && !dismissedSimilar && (
                    <div className="flex items-start justify-between gap-2 rounded-base border-2 border-border px-3 py-2 text-xs">
                        <div className="flex flex-col gap-1">
                            <span className="font-semibold">Similar posts already exist:</span>
                            <ul className="flex flex-col gap-0.5">
                                {similar.map((s) => (
                                    <li key={s.id}>
                                        <a
                                            href={`/grinds/${s.param}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium underline underline-offset-2 hover:text-main"
                                        >
                                            {s.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground shrink-0"
                            onClick={() => setDismissedSimilar(true)}
                        >
                            Dismiss
                        </button>
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="body">Body</Label>
                <Textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={8}
                    maxLength={POST_BODY_MAX}
                    placeholder="Share your thoughts… Markdown supported."
                    className="resize-y"
                />
            </div>

            {/* Flair */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <Label>Flair</Label>
                    <span className="text-xs text-muted-foreground">up to {POST_TAG_MAX}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {POST_TAGS.map((t) => {
                        const active = tagSlugs.includes(t.slug);
                        const atCap = tagSlugs.length >= POST_TAG_MAX;
                        return (
                            <button
                                key={t.slug}
                                type="button"
                                onClick={() => toggleTag(t.slug)}
                                disabled={!active && atCap}
                                className={badgeVariants({ variant: active ? "default" : "neutral" }) + ((!active && atCap) ? " opacity-40" : "")}
                            >
                                {t.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Experience disclosure */}
            <div className="rounded-base border-2 border-border overflow-hidden">
                <button
                    type="button"
                    onClick={() => setExpOpen((v) => !v)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-semibold hover:bg-secondary-background transition-colors"
                >
                    <div className="flex items-center gap-2">
                        Add interview experience
                        <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4">New</Badge>
                    </div>
                    {expOpen ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
                </button>

                {expOpen && (
                    <div className="border-t-2 border-border p-4 flex flex-col gap-4 bg-secondary-background/30">
                        {/* Company */}
                        <div className="relative flex flex-col gap-1.5">
                            <Label htmlFor="company">Company</Label>
                            <Input
                                id="company"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="e.g. Amazon"
                                autoComplete="off"
                            />
                            {suggestions.length > 0 && (
                                <Card className="absolute top-full z-10 mt-1 w-full py-0 gap-0">
                                    {suggestions.map((name) => (
                                        <Button
                                            key={name}
                                            type="button"
                                            variant="neutral"
                                            className="w-full justify-start rounded-none border-0 border-b-2 last:border-b-0 shadow-none hover:shadow-none hover:translate-x-0 hover:translate-y-0 hover:bg-main hover:text-main-foreground"
                                            onClick={() => {
                                                suppressSuggest.current = true;
                                                setCompanyName(name);
                                                setSuggestions([]);
                                            }}
                                        >
                                            {name}
                                        </Button>
                                    ))}
                                </Card>
                            )}
                        </div>

                        {/* Role */}
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="role">Role</Label>
                            <Input
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                placeholder="e.g. Software Engineer"
                            />
                        </div>

                        {/* Rounds */}
                        <div className="flex flex-col gap-3">
                            <Label>Rounds</Label>
                            {rounds.map((round, ri) => (
                                <Card key={ri} className="gap-0 py-0 shadow-none">
                                    <CardHeader className="flex-row items-center justify-between p-3 border-b-2 border-border">
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-sm">Round {ri + 1}</span>
                                            <Select
                                                value={round.type}
                                                onValueChange={(v) => updateRoundType(ri, v)}
                                            >
                                                <SelectTrigger className="w-[160px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ROUND_TYPES.map((t) => (
                                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <button
                                            type="button"
                                            aria-label="Remove round"
                                            disabled={rounds.length === 1}
                                            onClick={() =>
                                                setRounds((rs) => rs.filter((_, idx) => idx !== ri))
                                            }
                                            className="inline-flex items-center justify-center size-7 rounded-base border-2 border-border text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </button>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-2 p-3">
                                        {round.questions.map((q, qi) => (
                                            <div key={qi} className="flex items-center gap-2">
                                                <Input
                                                    value={q}
                                                    onChange={(e) => updateQuestion(ri, qi, e.target.value)}
                                                    placeholder="Question asked"
                                                />
                                                <button
                                                    type="button"
                                                    aria-label="Remove question"
                                                    disabled={round.questions.length === 1}
                                                    onClick={() =>
                                                        setRounds((rs) =>
                                                            rs.map((r, idx) =>
                                                                idx === ri
                                                                    ? { ...r, questions: r.questions.filter((_, qidx) => qidx !== qi) }
                                                                    : r,
                                                            ),
                                                        )
                                                    }
                                                    className="inline-flex items-center justify-center size-7 rounded-base border-2 border-border text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors shrink-0"
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
                                onClick={() => setRounds((rs) => [...rs, emptyRound()])}
                            >
                                Add round
                            </Button>
                        </div>

                        {/* Compensation */}
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                                <Checkbox
                                    checked={compEnabled}
                                    onCheckedChange={(v) => setCompEnabled(v === true)}
                                />
                                Share compensation (optional)
                            </label>
                            {compEnabled && (
                                <div className="grid grid-cols-2 gap-3 mt-1">
                                    <div className="flex flex-col gap-1.5">
                                        <Label>Currency</Label>
                                        <Select
                                            value={comp.currency}
                                            onValueChange={(v) => setComp((c) => ({ ...c, currency: v }))}
                                        >
                                            <SelectTrigger>
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
                                        <Label htmlFor="tc">Total comp / year</Label>
                                        <Input
                                            id="tc"
                                            type="number"
                                            min={0}
                                            value={comp.tc}
                                            onChange={(e) => setComp((c) => ({ ...c, tc: e.target.value }))}
                                            placeholder="e.g. 2000000"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Anonymous + Submit */}
            <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <Checkbox
                        checked={isAnonymous}
                        onCheckedChange={(v) => setIsAnonymous(v === true)}
                    />
                    Post anonymously
                </label>
                <Button
                    type="button"
                    onClick={submit}
                    disabled={isPending || title.trim().length < POST_TITLE_MIN}
                >
                    {isPending ? "Posting…" : "Post"}
                </Button>
            </div>
        </div>
    );
}
