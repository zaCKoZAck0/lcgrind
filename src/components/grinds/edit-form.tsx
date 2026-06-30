"use client";

import { useState, useTransition } from "react";
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
import { editPost } from "~/server/actions/posts/createPost";
import type { ExperienceFormEntry } from "~/server/actions/posts/getPostForEdit";
import { emptyRound, emptyCompComponent, buildStructured } from "./experience-form.shared";
import { useExperienceForm } from "./use-experience-form";
import { ExperienceList } from "./experience-list";
import type { ExperienceDraft } from "./experience-form.shared";

function toExperienceDraft(e: ExperienceFormEntry): ExperienceDraft {
    return {
        ...e,
        suggestions: [],
        roleSuggestions: [],
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
    const [expValue, setExpValue] = useState(mode === "FORM" ? "exp" : "");
    const expOpen = expValue === "exp";

    const form = useExperienceForm(initialExperiences?.map(toExperienceDraft) ?? []);

    const hasExperienceContent = expOpen && form.experiences.some((e) => e.company.trim() || e.role.trim());

    const save = () => {
        if (!title.trim()) { toast.error("Title is required."); return; }
        startTransition(async () => {
            const structured = hasExperienceContent ? buildStructured(form.experiences) : undefined;
            const res = await editPost(postId, { title, body: body || undefined, structured });
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

            {/* Body — always visible */}
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-body">Body</Label>
                <Textarea
                    id="edit-body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={6}
                    disabled={isPending}
                    className="resize-y"
                    placeholder="Markdown supported."
                />
            </div>

            {/* Experience disclosure — optional */}
            <Accordion type="single" collapsible value={expValue} onValueChange={setExpValue}>
                <AccordionItem value="exp">
                    <AccordionTrigger disabled={isPending}>Interview experience</AccordionTrigger>
                    <AccordionContent>
                        <ExperienceList form={form} disabled={isPending} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

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
