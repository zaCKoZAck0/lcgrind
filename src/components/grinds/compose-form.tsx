"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "~/components/ui/accordion";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import {
    MultiSelect,
    MultiSelectTrigger,
    MultiSelectValue,
    MultiSelectContent,
    MultiSelectList,
    MultiSelectGroup,
    MultiSelectItem,
} from "~/components/ui/multi-combobox";
import { createPost } from "~/server/actions/posts/createPost";
import { findSimilarPostsAction } from "~/server/actions/grinds/similar";
import type { SimilarPost } from "~/server/actions/grinds/search";
import {
    POST_TITLE_MIN,
    POST_TITLE_MAX,
    POST_BODY_MAX,
    POST_TAGS,
    POST_TAG_MAX,
} from "~/config/grinds";
import { emptyExperience, buildStructured } from "./experience-form.shared";
import { useExperienceForm } from "./use-experience-form";
import { ExperienceList } from "./experience-list";

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
    const [similar, setSimilar] = useState<SimilarPost[]>([]);
    const [dismissedSimilar, setDismissedSimilar] = useState(false);
    const [expValue, setExpValue] = useState(initialIsExperience ? "exp" : "");
    const expOpen = expValue === "exp";

    const form = useExperienceForm([{ ...emptyExperience(), company: initialCompany }]);

    const titleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const onTitleChange = (val: string) => {
        setTitle(val);
        if (titleTimer.current) clearTimeout(titleTimer.current);
        const t = val.trim();
        if (t.length < 8) { setSimilar([]); return; }
        titleTimer.current = setTimeout(() => {
            findSimilarPostsAction(t).then(setSimilar);
        }, 300);
    };

    const hasExperienceContent =
        expOpen && form.experiences.some((e) => e.company.trim() || e.role.trim());

    const submit = () => {
        if (hasExperienceContent && !form.experiences[0].company.trim()) {
            toast.error("Enter a company name for the first experience.");
            return;
        }
        const structured = hasExperienceContent ? buildStructured(form.experiences) : undefined;
        startTransition(async () => {
            const result = await createPost({
                isExperience: hasExperienceContent,
                title,
                body,
                companyName: hasExperienceContent
                    ? form.experiences[0].company.trim() || undefined
                    : undefined,
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
                    onChange={(e) => onTitleChange(e.target.value)}
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

            {/* Flair — hidden when experience mode is active */}
            {!hasExperienceContent && (
                <div className="flex flex-col gap-1.5">
                    <Label>Flair</Label>
                    <MultiSelect
                        value={tagSlugs}
                        onValueChange={(v) => setTagSlugs(v.slice(0, POST_TAG_MAX))}
                    >
                        <MultiSelectTrigger>
                            <MultiSelectValue placeholder="Add flair…" />
                        </MultiSelectTrigger>
                        <MultiSelectContent>
                            <MultiSelectList autoHeight>
                                <MultiSelectGroup>
                                    {POST_TAGS.map((t) => (
                                        <MultiSelectItem
                                            key={t.slug}
                                            value={t.slug}
                                            disabled={!tagSlugs.includes(t.slug) && tagSlugs.length >= POST_TAG_MAX}
                                        >
                                            {t.name}
                                        </MultiSelectItem>
                                    ))}
                                </MultiSelectGroup>
                            </MultiSelectList>
                        </MultiSelectContent>
                    </MultiSelect>
                </div>
            )}

            {/* Experience disclosure */}
            <Accordion type="single" collapsible value={expValue} onValueChange={setExpValue}>
                <AccordionItem value="exp">
                    <AccordionTrigger>Add interview experience</AccordionTrigger>
                    <AccordionContent>
                        <ExperienceList form={form} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

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
