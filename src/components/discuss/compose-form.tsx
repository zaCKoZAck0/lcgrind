"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send, Briefcase, Tag, Plus, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { badgeVariants } from "~/components/ui/badge";
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
import { findSimilarPostsAction } from "~/server/actions/discuss/similar";
import type { SimilarPost } from "~/server/actions/discuss/search";
import {
    POST_TITLE_MIN,
    POST_TITLE_MAX,
    POST_BODY_MAX,
    POST_TAGS,
    POST_TAG_MAX,
} from "~/config/discuss";
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
    const [isExperience, setIsExperience] = useState(initialIsExperience);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");

    const [companyName, setCompanyName] = useState(initialCompany);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const suppressSuggest = useRef(initialCompany.length > 0);

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

    // Simplified structured state: role + rounds (type + questions text only)
    const [role, setRole] = useState("");
    const [rounds, setRounds] = useState<RoundDraft[]>([emptyRound()]);
    const [compEnabled, setCompEnabled] = useState(false);
    const [comp, setComp] = useState({ currency: "INR", tc: "" });

    const handleExperienceToggle = (checked: boolean) => {
        setIsExperience(checked);
        if (!checked) {
            setCompanyName("");
            setSuggestions([]);
        }
    };

    useEffect(() => {
        if (!isExperience) return;
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
    }, [companyName, isExperience]);

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

    const submit = () => {
        const structured = isExperience ? buildStructured() : undefined;
        startTransition(async () => {
            const result = await createPost({
                isExperience,
                title,
                body: isExperience ? "" : body,
                companyName: isExperience ? companyName.trim() || undefined : undefined,
                isAnonymous,
                mode: structured ? "FORM" : "TEXT",
                structured,
                tagSlugs: isExperience ? [] : tagSlugs,
            });
            if (result.ok === true) {
                toast.success("Posted — it's live now.");
                router.push(`/discuss/${result.param}`);
                router.refresh();
            } else {
                toast.error(result.error);
            }
        });
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Anonymous toggle */}
            <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                <Checkbox
                    checked={isAnonymous}
                    onCheckedChange={(v) => setIsAnonymous(v === true)}
                />
                Post anonymously (your handle stays hidden on this post)
            </label>

            {/* Title */}
            <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                        isExperience
                            ? "e.g. Amazon SDE2 onsite — five rounds over two days"
                            : "A clear, specific title"
                    }
                    maxLength={POST_TITLE_MAX}
                />
                <span className="text-xs text-muted-foreground self-end">
                    {title.trim().length} / {POST_TITLE_MIN} characters minimum
                </span>

                {similar.length > 0 && !dismissedSimilar && (
                    <Card className="shadow-none gap-2 py-3">
                        <CardContent className="px-3 flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold">
                                    Similar posts already exist — maybe join one?
                                </span>
                                <Button
                                    type="button"
                                    variant="neutral"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => setDismissedSimilar(true)}
                                >
                                    Dismiss
                                </Button>
                            </div>
                            <ul className="flex flex-col gap-1">
                                {similar.map((s) => (
                                    <li key={s.id}>
                                        <a
                                            href={`/discuss/${s.param}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-medium underline underline-offset-2 hover:text-main"
                                        >
                                            {s.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Body — text posts only */}
            {!isExperience && (
                <div className="flex flex-col gap-2">
                    <Label htmlFor="body">Body</Label>
                    <Textarea
                        id="body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={10}
                        maxLength={POST_BODY_MAX}
                        placeholder="Share your thoughts, an observation, or something worth debating… Markdown supported."
                    />
                </div>
            )}

            {/* Experience toggle */}
            <Card className="shadow-none py-3 gap-0">
                <CardContent className="px-3">
                    <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                        <Checkbox
                            checked={isExperience}
                            onCheckedChange={(v) => handleExperienceToggle(v === true)}
                        />
                        <Briefcase className="size-4" />
                        Share an interview experience
                        <span className="text-xs font-normal text-muted-foreground ml-1">
                            (attaches to a company page + helps others prepare)
                        </span>
                    </label>
                </CardContent>
            </Card>

            {/* Experience fields */}
            {isExperience && (
                <div className="flex flex-col gap-4">
                    {/* Company */}
                    <div className="relative flex flex-col gap-2">
                        <Label htmlFor="company">Company *</Label>
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
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="role">Role *</Label>
                        <Input
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="e.g. Software Engineer"
                        />
                    </div>

                    {/* Rounds */}
                    <div className="flex flex-col gap-3">
                        {rounds.map((round, ri) => (
                            <Card key={ri} className="gap-0 py-0">
                                <CardHeader className="flex-row items-center justify-between p-3 border-b-2 border-border">
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-sm">Round {ri + 1}</span>
                                        <Select
                                            value={round.type}
                                            onValueChange={(v) => updateRoundType(ri, v)}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ROUND_TYPES.map((t) => (
                                                    <SelectItem key={t} value={t}>{t}</SelectItem>
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
                                </CardHeader>
                                <CardContent className="flex flex-col gap-2 p-3">
                                    {round.questions.map((q, qi) => (
                                        <div key={qi} className="flex items-center gap-2">
                                            <Input
                                                value={q}
                                                onChange={(e) => updateQuestion(ri, qi, e.target.value)}
                                                placeholder="Question asked"
                                            />
                                            <Button
                                                type="button"
                                                variant="neutral"
                                                size="icon"
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
                                            setRounds((rs) =>
                                                rs.map((r, idx) =>
                                                    idx === ri
                                                        ? { ...r, questions: [...r.questions, ""] }
                                                        : r,
                                                ),
                                            )
                                        }
                                    >
                                        <Plus className="size-4" />
                                        Add question
                                    </Button>
                                </CardContent>
                            </Card>
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

                    {/* Compensation */}
                    <Card className="gap-0 py-3">
                        <CardContent className="px-3 flex flex-col gap-3">
                            <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                                <Checkbox
                                    checked={compEnabled}
                                    onCheckedChange={(v) => setCompEnabled(v === true)}
                                />
                                Share compensation (optional)
                            </label>
                            {compEnabled && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-2">
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
                                    <div className="flex flex-col gap-2">
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
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Flair — text posts only (experiences get auto-computed server-side) */}
            {!isExperience && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <Tag className="size-4 text-muted-foreground" />
                        <Label>Flair (optional)</Label>
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
            )}

            <Button
                type="button"
                onClick={submit}
                disabled={isPending}
                className="self-start"
            >
                <Send className="size-4" />
                {isPending ? "Posting…" : "Post"}
            </Button>
        </div>
    );
}
